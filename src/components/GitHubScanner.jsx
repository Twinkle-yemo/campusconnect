import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

export default function GitHubScanner({ onScore, tasks = [] }) {
  const [username, setUsername] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [recLoading, setRecLoading] = useState(false);
  const [error, setError] = useState("");

  async function getTaskRecommendations(profileData, allTasks) {
    if (!allTasks.length || !import.meta.env.VITE_GEMINI_API_KEY) return;
    setRecLoading(true);
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `You are a campus ambassador program manager. Based on this GitHub profile, recommend the most suitable tasks.

GitHub Profile:
- Username: ${profileData.username}
- Languages: ${profileData.languages.join(", ") || "None"}
- Public Repos: ${profileData.repos}
- Followers: ${profileData.followers}
- Stars: ${profileData.stars}
- GitHub Score: ${profileData.score}/100

Available Tasks:
${allTasks.map((t, i) => `${i + 1}. "${t.title}" — ${t.description || ""} (${t.points} pts)`).join("\n")}

Return ONLY a JSON array of recommended task titles (max 3), ordered by fit. Example: ["Task A", "Task B"]
No explanation, no markdown, just the JSON array.`
              }]
            }]
          })
        }
      );
      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
      const cleaned = text.replace(/```json|```/g, "").trim();
      setRecommendations(JSON.parse(cleaned));
    } catch (e) {
      console.error("Gemini rec error:", e);
    }
    setRecLoading(false);
  }

  async function scan() {
    if (!username.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    setRecommendations([]);
    try {
      const headers = import.meta.env.VITE_GITHUB_TOKEN
        ? { Authorization: `token ${import.meta.env.VITE_GITHUB_TOKEN}` }
        : {};

      const [userRes, reposRes] = await Promise.all([
        fetch(`https://api.github.com/users/${username}`, { headers }),
        fetch(`https://api.github.com/users/${username}/repos?per_page=100`, { headers }),
      ]);

      if (!userRes.ok) { setError("GitHub user not found."); setLoading(false); return; }

      const user = await userRes.json();
      const repos = await reposRes.json();

      const totalStars = Array.isArray(repos) ? repos.reduce((s, r) => s + (r.stargazers_count || 0), 0) : 0;
      const languages = Array.isArray(repos)
        ? [...new Set(repos.map((r) => r.language).filter(Boolean))]
        : [];

      const score = Math.min(100,
        Math.floor((user.followers || 0) * 0.5) +
        Math.floor((user.public_repos || 0) * 1.5) +
        Math.floor(totalStars * 2) +
        languages.length * 3
      );

      const profileData = {
        username,
        score,
        followers: user.followers || 0,
        repos: user.public_repos || 0,
        stars: totalStars,
        languages: languages.slice(0, 5),
        avatar: user.avatar_url,
        bio: user.bio,
      };

      setResult(profileData);

      await updateDoc(doc(db, "users", auth.currentUser.uid), {
        githubUsername: username,
        githubScore: score,
        points: score,
      });

      onScore && onScore(score);
      await getTaskRecommendations(profileData, tasks);
    } catch (e) {
      setError("Failed to fetch GitHub data.");
      console.error(e);
    }
    setLoading(false);
  }

  return (
    <div className="bg-[#16213e] rounded-xl p-5 border border-[#0f3460]">
      <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
        ⚡ GitHub Profile Scanner
      </h3>
      <div className="flex gap-2">
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && scan()}
          placeholder="Enter GitHub username"
          className="flex-1 bg-[#0f0f1a] border border-[#0f3460] rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 text-sm"
        />
        <button
          onClick={scan}
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 whitespace-nowrap"
        >
          {loading ? "Scanning..." : "Scan"}
        </button>
      </div>

      {error && <p className="text-red-400 text-xs mt-2">{error}</p>}

      {result && (
        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-3">
            <img src={result.avatar} alt="" className="w-12 h-12 rounded-full border-2 border-indigo-600" />
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold">@{result.username}</p>
              {result.bio && <p className="text-gray-400 text-xs truncate">{result.bio}</p>}
              <p className="text-gray-400 text-xs mt-0.5">
                {result.repos} repos · {result.followers} followers · ⭐ {result.stars}
              </p>
            </div>
            <div className="text-center flex-shrink-0">
              <p className="text-3xl font-bold text-indigo-400">{result.score}</p>
              <p className="text-xs text-gray-400">/ 100</p>
            </div>
          </div>

          {result.languages.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {result.languages.map((l) => (
                <span key={l} className="text-xs bg-indigo-900/60 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-800">
                  {l}
                </span>
              ))}
            </div>
          )}

          <div className="border-t border-[#0f3460] pt-3">
            <p className="text-xs text-gray-400 mb-2 flex items-center gap-1">
              🤖 <span>AI-Recommended Tasks for your profile</span>
            </p>
            {recLoading && (
              <p className="text-xs text-indigo-400 animate-pulse">Gemini is analyzing your profile...</p>
            )}
            {!recLoading && recommendations.length > 0 && (
              <div className="space-y-1.5">
                {recommendations.map((r, i) => (
                  <div key={i} className="flex items-center gap-2 bg-indigo-950/60 border border-indigo-900 rounded-lg px-3 py-2">
                    <span className="text-indigo-400 text-xs font-bold w-4">#{i + 1}</span>
                    <span className="text-white text-xs">{r}</span>
                  </div>
                ))}
              </div>
            )}
            {!recLoading && recommendations.length === 0 && result && (
              <p className="text-xs text-gray-500">
                {!import.meta.env.VITE_GEMINI_API_KEY
                  ? "Add VITE_GEMINI_API_KEY to .env for AI recommendations."
                  : tasks.length === 0
                  ? "No tasks available yet — admin needs to create some first."
                  : "Could not generate recommendations."}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
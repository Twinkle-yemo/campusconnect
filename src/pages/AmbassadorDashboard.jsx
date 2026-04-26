import { useEffect, useState, useCallback } from "react";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import GitHubScanner from "../components/GitHubScanner";
import Leaderboard from "../components/Leaderboard";
import TaskCard from "../components/TaskCard";
import AmbassadorCard from "../components/AmbassadorCard";

export default function AmbassadorDashboard() {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const snap = await getDoc(doc(db, "users", auth.currentUser.uid));
      if (snap.exists()) setUser(snap.data());
      const taskSnap = await getDocs(collection(db, "tasks"));
      setTasks(taskSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center">
        <p className="text-gray-400">Loading dashboard...</p>
      </div>
    );
  }

  const stats = [
    { label: "Points", value: user?.points || 0, icon: "⭐", color: "text-yellow-400" },
    { label: "Streak", value: `${user?.streak || 0}d`, icon: "🔥", color: "text-orange-400" },
    { label: "Badges", value: user?.badges?.length || 0, icon: "🏅", color: "text-purple-400" },
  ];

  return (
    <div className="min-h-screen bg-[#0f0f1a]">
      {/* Top Nav */}
      <div className="border-b border-[#16213e] px-6 py-4 flex justify-between items-center">
        <div>
          <span className="text-indigo-400 font-bold text-lg">CampusConnect</span>
          <span className="ml-2 text-xs text-gray-500 bg-[#16213e] px-2 py-0.5 rounded-full">Ambassador</span>
        </div>
        <button
          onClick={() => signOut(auth)}
          className="text-gray-400 hover:text-white text-sm border border-[#1a2a4a] hover:border-[#0f3460] px-3 py-1.5 rounded-lg transition-all"
        >
          Sign out
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Welcome */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">
            Welcome back, {user?.name || "Ambassador"} 👋
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            {user?.githubUsername
              ? `GitHub: @${user.githubUsername} · Score: ${user.githubScore || 0}/100`
              : "Scan your GitHub profile to get started"}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          {stats.map((s) => (
            <div key={s.label} className="bg-[#16213e] rounded-xl p-6 border border-[#0f3460] text-center">
              <p className="text-3xl mb-1">{s.icon}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-gray-400 text-xs mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left column */}
          <div className="space-y-5">
            <GitHubScanner onScore={load} tasks={tasks} />
            <AmbassadorCard user={user} />
          </div>

          {/* Right column */}
          <div className="space-y-5">
            {/* Tasks */}
            <div className="bg-[#16213e] rounded-xl p-5 border border-[#0f3460]">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                📋 <span>Active Tasks</span>
                <span className="ml-auto text-xs text-gray-500">{tasks.length} available</span>
              </h3>
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {tasks.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-6">
                    No tasks yet — check back soon!
                  </p>
                ) : (
                  tasks.map((t) => <TaskCard key={t.id} task={t} onComplete={load} />)
                )}
              </div>
            </div>

            <Leaderboard />
          </div>
        </div>
      </div>
    </div>
  );
}
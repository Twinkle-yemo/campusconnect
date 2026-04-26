import { useState } from "react";
import { doc, updateDoc, getDoc, arrayUnion, increment } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db, storage } from "../firebase";

async function verifyWithGemini(fileUrl, taskTitle, taskDescription) {
  if (!import.meta.env.VITE_GEMINI_API_KEY) {
    return { verified: true, reason: "Auto-approved (no Gemini key set)" };
  }
  try {
    const imgRes = await fetch(fileUrl);
    const blob = await imgRes.blob();
    const base64 = await new Promise((res) => {
      const reader = new FileReader();
      reader.onloadend = () => res(reader.result.split(",")[1]);
      reader.readAsDataURL(blob);
    });

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [
              { inline_data: { mime_type: blob.type || "image/jpeg", data: base64 } },
              {
                text: `You are verifying a campus ambassador task submission.
Task: "${taskTitle}"
Description: "${taskDescription || "Complete the task as described"}"
Does this screenshot provide reasonable evidence the ambassador completed this task?
Reply ONLY with JSON: {"verified": true, "reason": "short reason"}
No markdown, no extra text.`
              }
            ]
          }]
        })
      }
    );
    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{"verified":false,"reason":"Could not analyze"}';
    return JSON.parse(text.replace(/```json|```/g, "").trim());
  } catch (e) {
    console.error("Gemini verify error:", e);
    return { verified: true, reason: "Auto-approved (verification error)" };
  }
}

export default function TaskCard({ task, onComplete }) {
  const uid = auth.currentUser?.uid;
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState(null);
  const [done, setDone] = useState(task.completedBy?.includes(uid));
  const [earnedPts, setEarnedPts] = useState(null);

  async function submit() {
    if (!file || done) return;
    setUploading(true);
    setVerifyResult(null);
    try {
      const storageRef = ref(storage, `proofs/${uid}/${task.id}_${Date.now()}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      setUploading(false);
      setVerifying(true);
      const geminiResult = await verifyWithGemini(url, task.title, task.description || "");
      setVerifyResult(geminiResult);
      setVerifying(false);

      if (!geminiResult.verified) return;

      const userSnap = await getDoc(doc(db, "users", uid));
      const userData = userSnap.data() || {};
      const streak = userData.streak || 0;
      const lastDate = userData.lastSubmission ? new Date(userData.lastSubmission) : null;
      const now = new Date();
      const hoursSinceLast = lastDate ? (now - lastDate) / 3600000 : 999;
      const newStreak = hoursSinceLast <= 24 ? streak + 1 : 1;

      const difficulty = task.difficulty || 1;
      const basePoints = task.points || 10;
      const earned = Math.round(basePoints * difficulty * (1 + newStreak * 0.05));
      setEarnedPts(earned);

      await updateDoc(doc(db, "tasks", task.id), {
        completedBy: arrayUnion(uid),
        [`proofs.${uid}`]: url,
      });
      await updateDoc(doc(db, "users", uid), {
        points: increment(earned),
        streak: newStreak,
        lastSubmission: now.toISOString(),
      });

      setDone(true);
      onComplete && onComplete();
    } catch (e) {
      console.error(e);
      setUploading(false);
      setVerifying(false);
    }
  }

  return (
    <div className={`bg-[#0f0f1a] rounded-xl p-4 border transition-all ${done ? "border-green-700" : "border-[#1a2a4a] hover:border-[#0f3460]"}`}>
      <div className="flex justify-between items-start mb-2">
        <h4 className="text-white font-medium text-sm flex-1 pr-2">{task.title}</h4>
        <span className="text-xs bg-indigo-900/60 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-800 whitespace-nowrap">
          +{task.points || 10} pts
        </span>
      </div>
      {task.description && (
        <p className="text-gray-400 text-xs mb-3">{task.description}</p>
      )}

      {done ? (
        <div className="flex items-center gap-2">
          <span className="text-green-400 text-sm">✅ Completed</span>
          {earnedPts && <span className="text-xs text-indigo-400">+{earnedPts} pts earned</span>}
        </div>
      ) : (
        <>
          <div className="flex gap-2 items-center">
            <label className="flex-1 cursor-pointer">
              <div className={`border border-dashed rounded-lg px-3 py-2 text-xs text-center transition-colors ${file ? "border-indigo-500 text-indigo-300" : "border-[#0f3460] text-gray-500 hover:border-indigo-700"}`}>
                {file ? `📎 ${file.name}` : "Click to upload proof (screenshot)"}
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => { setFile(e.target.files[0]); setVerifyResult(null); }} />
            </label>
            <button
              onClick={submit}
              disabled={uploading || verifying || !file}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap font-medium transition-all"
            >
              {uploading ? "Uploading..." : verifying ? "Verifying..." : "Submit"}
            </button>
          </div>

          {verifying && (
            <p className="mt-2 text-xs text-indigo-400 animate-pulse">🤖 Gemini is reviewing your proof...</p>
          )}
          {verifyResult && (
            <div className={`mt-2 rounded-lg px-3 py-2 text-xs border ${verifyResult.verified ? "bg-green-900/30 border-green-800 text-green-300" : "bg-red-900/30 border-red-800 text-red-300"}`}>
              {verifyResult.verified ? "✅ Verified" : "❌ Not verified"} — {verifyResult.reason}
            </div>
          )}
        </>
      )}
    </div>
  );
}
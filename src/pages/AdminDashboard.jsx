import { useEffect, useState, useCallback } from "react";
import { collection, getDocs, addDoc, deleteDoc, doc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import Leaderboard from "../components/Leaderboard";

export default function AdminDashboard() {
  const [ambassadors, setAmbassadors] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: "", description: "", points: 10, difficulty: 1 });
  const [adding, setAdding] = useState(false);

  const load = useCallback(async () => {
    try {
      const uSnap = await getDocs(collection(db, "users"));
      const all = uSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setAmbassadors(all.filter((u) => u.role !== "admin"));

      const tSnap = await getDocs(collection(db, "tasks"));
      setTasks(tSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function addTask() {
    if (!form.title.trim()) return;
    setAdding(true);
    try {
      await addDoc(collection(db, "tasks"), {
        ...form,
        points: Number(form.points),
        difficulty: Number(form.difficulty),
        completedBy: [],
        createdAt: new Date().toISOString(),
      });
      setForm({ title: "", description: "", points: 10, difficulty: 1 });
      await load();
    } catch (e) { console.error(e); }
    setAdding(false);
  }

  async function removeTask(id) {
    await deleteDoc(doc(db, "tasks", id));
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  const totalPoints = ambassadors.reduce((s, a) => s + (a.points || 0), 0);
  const avgPoints = ambassadors.length ? Math.round(totalPoints / ambassadors.length) : 0;
  const estReferrals = Math.round(totalPoints * 0.4);
  const estValue = (estReferrals * 700).toLocaleString("en-IN");

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center">
        <p className="text-gray-400">Loading admin panel...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f1a]">
      {/* Nav */}
      <div className="border-b border-[#16213e] px-6 py-4 flex justify-between items-center">
        <div>
          <span className="text-indigo-400 font-bold text-lg">CampusConnect</span>
          <span className="ml-2 text-xs text-yellow-400 bg-yellow-900/30 px-2 py-0.5 rounded-full border border-yellow-800">Admin</span>
        </div>
        <button
          onClick={() => signOut(auth)}
          className="text-gray-400 hover:text-white text-sm border border-[#1a2a4a] hover:border-[#0f3460] px-3 py-1.5 rounded-lg transition-all"
        >
          Sign out
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Organization Dashboard 🛠</h1>
          <p className="text-gray-400 text-sm mt-1">Manage your ambassador program</p>
        </div>

        {/* ROI Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Ambassadors", value: ambassadors.length, icon: "👥", color: "text-blue-400" },
            { label: "Total Points", value: totalPoints, icon: "⭐", color: "text-yellow-400" },
            { label: "Avg Score", value: avgPoints, icon: "📊", color: "text-purple-400" },
            { label: "Est. Pipeline", value: `₹${estValue}`, icon: "💰", color: "text-green-400" },
          ].map((s) => (
            <div key={s.label} className="bg-[#16213e] rounded-xl p-4 border border-[#0f3460] text-center">
              <p className="text-2xl mb-1">{s.icon}</p>
              <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
              <p className="text-gray-400 text-xs mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Task Creator */}
          <div className="space-y-5">
            <div className="bg-[#16213e] rounded-xl p-5 border border-[#0f3460]">
              <h3 className="text-white font-semibold mb-4">➕ Create Task</h3>
              <div className="space-y-3">
                <input
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Task title (e.g. Share on LinkedIn)"
                  className="w-full bg-[#0f0f1a] border border-[#0f3460] rounded-xl px-3 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-indigo-500"
                />
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="What should they submit as proof?"
                  rows={2}
                  className="w-full bg-[#0f0f1a] border border-[#0f3460] rounded-xl px-3 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-indigo-500 resize-none"
                />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-gray-400 text-xs mb-1 block">Base Points</label>
                    <input
                      type="number"
                      min={1}
                      value={form.points}
                      onChange={(e) => setForm((f) => ({ ...f, points: e.target.value }))}
                      className="w-full bg-[#0f0f1a] border border-[#0f3460] rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs mb-1 block">Difficulty (1–3)</label>
                    <select
                      value={form.difficulty}
                      onChange={(e) => setForm((f) => ({ ...f, difficulty: e.target.value }))}
                      className="w-full bg-[#0f0f1a] border border-[#0f3460] rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
                    >
                      <option value={1}>1 — Easy</option>
                      <option value={2}>2 — Medium</option>
                      <option value={3}>3 — Hard</option>
                    </select>
                  </div>
                </div>
                <button
                  onClick={addTask}
                  disabled={adding || !form.title.trim()}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-medium transition-all"
                >
                  {adding ? "Creating..." : "Create Task"}
                </button>
              </div>
            </div>

            {/* Task List */}
            <div className="bg-[#16213e] rounded-xl p-5 border border-[#0f3460]">
              <h3 className="text-white font-semibold mb-3 flex items-center justify-between">
                <span>📋 Active Tasks</span>
                <span className="text-xs text-gray-500">{tasks.length} total</span>
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {tasks.length === 0 && <p className="text-gray-500 text-sm text-center py-4">No tasks created yet.</p>}
                {tasks.map((t) => (
                  <div key={t.id} className="flex items-center justify-between bg-[#0f0f1a] rounded-lg px-3 py-2.5 border border-[#1a2a4a]">
                    <div className="flex-1 min-w-0 pr-2">
                      <p className="text-white text-sm font-medium truncate">{t.title}</p>
                      <p className="text-gray-500 text-xs">
                        {t.completedBy?.length || 0} completed · {t.points} pts · ×{t.difficulty} diff
                      </p>
                    </div>
                    <button
                      onClick={() => removeTask(t.id)}
                      className="text-red-500 hover:text-red-400 text-xs px-2 py-1 rounded border border-red-900/50 hover:border-red-700 transition-all"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-5">
            <Leaderboard />

            {/* Ambassador List */}
            <div className="bg-[#16213e] rounded-xl p-5 border border-[#0f3460]">
              <h3 className="text-white font-semibold mb-3 flex items-center justify-between">
                <span>👥 All Ambassadors</span>
                <span className="text-xs text-gray-500">{ambassadors.length} enrolled</span>
              </h3>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {ambassadors.length === 0 && (
                  <p className="text-gray-500 text-sm text-center py-4">No ambassadors yet.</p>
                )}
                {ambassadors.map((a) => (
                  <div key={a.id} className="flex items-center justify-between bg-[#0f0f1a] rounded-lg px-3 py-2.5 border border-[#1a2a4a]">
                    <div>
                      <p className="text-white text-sm">{a.name || a.email}</p>
                      <p className="text-gray-500 text-xs">
                        🔥 {a.streak || 0} streak
                        {a.githubUsername ? ` · @${a.githubUsername}` : ""}
                      </p>
                    </div>
                    <span className="text-indigo-400 text-sm font-bold">{a.points || 0} pts</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
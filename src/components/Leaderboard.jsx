import { useEffect, useState } from "react";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "../firebase";

export default function Leaderboard() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDocs(query(collection(db, "users"), orderBy("points", "desc"), limit(10)))
      .then((snap) => {
        setLeaders(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const medals = ["🥇", "🥈", "🥉"];
  const tierColor = (i) => i === 0 ? "text-yellow-400" : i === 1 ? "text-gray-300" : i === 2 ? "text-amber-600" : "text-gray-500";

  return (
    <div className="bg-[#16213e] rounded-xl p-5 border border-[#0f3460]">
      <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
        🏆 <span>Leaderboard</span>
      </h3>
      {loading && <p className="text-gray-500 text-sm">Loading...</p>}
      <div className="space-y-2">
        {leaders.map((u, i) => (
          <div
            key={u.id}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 ${i < 3 ? "bg-indigo-950/40 border border-indigo-900/50" : "bg-[#0f0f1a]"}`}
          >
            <span className={`text-lg w-6 text-center font-bold ${tierColor(i)}`}>
              {medals[i] || i + 1}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{u.name || u.email}</p>
              <p className="text-gray-500 text-xs">
                {u.badges?.length || 0} badges · 🔥 {u.streak || 0} streak
              </p>
            </div>
            <span className={`font-bold text-sm ${i < 3 ? "text-indigo-300" : "text-gray-400"}`}>
              {u.points || 0} pts
            </span>
          </div>
        ))}
        {!loading && leaders.length === 0 && (
          <p className="text-gray-500 text-sm text-center py-4">No ambassadors yet.</p>
        )}
      </div>
    </div>
  );
}
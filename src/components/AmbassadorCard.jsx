import { useEffect, useRef } from "react";

export default function AmbassadorCard({ user }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !user) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Background
    const grad = ctx.createLinearGradient(0, 0, 400, 200);
    grad.addColorStop(0, "#1e1b4b");
    grad.addColorStop(0.5, "#312e81");
    grad.addColorStop(1, "#1e3a5f");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 400, 200);

    // Decorative circles
    ctx.beginPath();
    ctx.arc(360, 40, 60, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(99,102,241,0.15)";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(380, 160, 40, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(99,102,241,0.1)";
    ctx.fill();

    // Brand
    ctx.fillStyle = "#818cf8";
    ctx.font = "bold 13px sans-serif";
    ctx.fillText("CampusConnect", 20, 28);

    // Divider
    ctx.fillStyle = "rgba(99,102,241,0.5)";
    ctx.fillRect(20, 35, 100, 1);

    // Name
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 22px sans-serif";
    ctx.fillText(user.name || "Ambassador", 20, 72);

    // Stats
    ctx.fillStyle = "#a5b4fc";
    ctx.font = "13px sans-serif";
    ctx.fillText(`⭐ ${user.points || 0} points`, 20, 100);
    ctx.fillText(`🔥 ${user.streak || 0} day streak`, 20, 122);
    ctx.fillText(`🏅 ${user.badges?.length || 0} badges`, 20, 144);

    // GitHub score if available
    if (user.githubScore) {
      ctx.fillStyle = "#6ee7b7";
      ctx.fillText(`GitHub Score: ${user.githubScore}/100`, 20, 166);
    }

    // Progress bar
    const maxPts = 500;
    const pct = Math.min((user.points || 0) / maxPts, 1);
    ctx.fillStyle = "rgba(255,255,255,0.1)";
    ctx.beginPath();
    ctx.roundRect(20, 178, 220, 6, 3);
    ctx.fill();
    ctx.fillStyle = "#6366f1";
    ctx.beginPath();
    ctx.roundRect(20, 178, 220 * pct, 6, 3);
    ctx.fill();

    // Footer
    ctx.fillStyle = "rgba(165,180,252,0.5)";
    ctx.font = "10px sans-serif";
    ctx.fillText("campusconnect.app", 290, 190);
  }, [user]);

  function download() {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = "ambassador-card.png";
    link.href = canvasRef.current.toDataURL();
    link.click();
  }

  return (
    <div className="bg-[#16213e] rounded-xl p-5 border border-[#0f3460]">
      <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
        🎴 <span>Your Ambassador Card</span>
      </h3>
      <canvas
        ref={canvasRef}
        width={400}
        height={200}
        className="rounded-lg w-full border border-indigo-900/50"
      />
      <button
        onClick={download}
        className="mt-3 w-full border border-indigo-700 text-indigo-400 hover:bg-indigo-900/30 py-2 rounded-lg text-sm font-medium transition-all"
      >
        ⬇ Download & Share on LinkedIn
      </button>
    </div>
  );
}
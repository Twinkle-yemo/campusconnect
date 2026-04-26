import { useState } from "react";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "../firebase";

export default function Login() {
  const [isOrg, setIsOrg] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [orgCode, setOrgCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const SECRET = import.meta.env.VITE_ORG_SECRET_CODE || "CAMPUSCONNECT2025";

  async function saveUser(user, role) {
    const ref = doc(db, "users", user.uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, {
        name: user.displayName || name || user.email.split("@")[0],
        email: user.email,
        role,
        points: 0,
        streak: 0,
        badges: [],
        githubUsername: "",
        lastSubmission: null,
        createdAt: new Date().toISOString(),
      });
    }
  }

  async function handleGoogle() {
    setError("");
    if (isOrg && orgCode !== SECRET) {
      setError("Invalid organization code.");
      return;
    }
    setLoading(true);
    try {
      const role = isOrg ? "admin" : "ambassador";
      sessionStorage.setItem("intendedRole", role);
      const result = await signInWithPopup(auth, googleProvider);
      await saveUser(result.user, role);
    } catch (e) {
      sessionStorage.removeItem("intendedRole");
      setError(e.message);
    }
    setLoading(false);
  }

  async function handleEmail() {
    setError("");
    if (!email || !password) { setError("Email and password required."); return; }
    if (isOrg && orgCode !== SECRET) { setError("Invalid organization code."); return; }
    setLoading(true);
    try {
      const role = isOrg ? "admin" : "ambassador";
      sessionStorage.setItem("intendedRole", role);
      let result;
      if (isSignup) {
        result = await createUserWithEmailAndPassword(auth, email, password);
      } else {
        result = await signInWithEmailAndPassword(auth, email, password);
      }
      await saveUser(result.user, role);
    } catch (e) {
      sessionStorage.removeItem("intendedRole");
      setError(e.message);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f0f1a] to-[#1a1a2e] px-4">
      <div className="bg-[#16213e] p-8 rounded-2xl w-full max-w-md shadow-2xl border border-[#0f3460]">

        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white tracking-tight">CampusConnect</h1>
          <p className="text-gray-400 text-sm mt-1">Ambassador Growth Platform</p>
        </div>

        {/* Role Toggle */}
        <div className="flex rounded-xl overflow-hidden border border-[#0f3460] mb-6">
          {["Ambassador", "Organization"].map((r) => (
            <button
              key={r}
              onClick={() => { setIsOrg(r === "Organization"); setError(""); }}
              className={`flex-1 py-2.5 text-sm font-medium transition-all ${
                isOrg === (r === "Organization")
                  ? "bg-indigo-600 text-white"
                  : "bg-transparent text-gray-400 hover:text-white"
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Form */}
        <div className="space-y-3">
          {isSignup && (
            <input
              className="w-full bg-[#0f0f1a] border border-[#0f3460] rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 text-sm"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          )}
          <input
            className="w-full bg-[#0f0f1a] border border-[#0f3460] rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 text-sm"
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="w-full bg-[#0f0f1a] border border-[#0f3460] rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 text-sm"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {isOrg && (
            <input
              className="w-full bg-[#0f0f1a] border border-yellow-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 text-sm"
              placeholder="Organization Secret Code"
              value={orgCode}
              onChange={(e) => setOrgCode(e.target.value)}
            />
          )}
        </div>

        {error && (
          <div className="mt-3 bg-red-900/40 border border-red-700 rounded-lg px-3 py-2">
            <p className="text-red-400 text-xs">{error}</p>
          </div>
        )}

        <button
          onClick={handleEmail}
          disabled={loading}
          className="w-full mt-5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white py-2.5 rounded-xl font-medium transition-all text-sm"
        >
          {loading ? "Please wait..." : isSignup ? "Create Account" : "Sign In"}
        </button>

        <div className="flex items-center my-4">
          <div className="flex-1 h-px bg-[#0f3460]" />
          <span className="px-3 text-gray-500 text-xs">or</span>
          <div className="flex-1 h-px bg-[#0f3460]" />
        </div>

        <button
          onClick={handleGoogle}
          disabled={loading}
          className="w-full border border-[#0f3460] hover:border-indigo-500 disabled:opacity-50 text-white py-2.5 rounded-xl font-medium transition-all flex items-center justify-center gap-2 text-sm"
        >
          <svg width="16" height="16" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.7 33.1 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.7-8 19.7-20 0-1.3-.1-2.7-.1-4z"/>
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 15.1 18.9 12 24 12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
            <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5l-6.2-5.2C29.4 35.5 26.8 36 24 36c-5.2 0-9.6-2.9-11.2-7l-6.5 5C9.7 39.7 16.3 44 24 44z"/>
            <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.8 2.3-2.3 4.2-4.3 5.5l6.2 5.2C40.8 35.3 44 30.1 44 24c0-1.3-.1-2.7-.4-4z"/>
          </svg>
          Continue with Google
        </button>

        <p className="text-center text-gray-500 text-xs mt-4">
          {isSignup ? "Already have an account? " : "New here? "}
          <button
            onClick={() => { setIsSignup(!isSignup); setError(""); }}
            className="text-indigo-400 hover:underline"
          >
            {isSignup ? "Sign in" : "Sign up"}
          </button>
        </p>

        {isOrg && (
          <p className="text-center text-yellow-600 text-xs mt-3">
            Demo org code: <span className="font-mono font-bold">CAMPUSCONNECT2025</span>
          </p>
        )}
      </div>
    </div>
  );
}
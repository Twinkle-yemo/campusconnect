import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import Login from "./pages/Login";
import AmbassadorDashboard from "./pages/AmbassadorDashboard";
import AdminDashboard from "./pages/AdminDashboard";

export default function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        try {
          const snap = await getDoc(doc(db, "users", u.uid));
          setRole(snap.exists() ? snap.data().role : "ambassador");
        } catch {
          setRole("ambassador");
        }
        setUser(u);
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0f0f1a", color: "#fff" }}>
        Loading...
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
        <Route
          path="/dashboard"
          element={
            !user ? <Navigate to="/login" /> :
            role === "admin" ? <AdminDashboard /> : <AmbassadorDashboard />
          }
        />
        <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
      </Routes>
    </BrowserRouter>
  );
}
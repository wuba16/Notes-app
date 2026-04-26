// app/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { auth, provider } from "@/lib/firebase";

export default function LoginPage() {
  const router = useRouter();

  // Form state
  const [color, setColor] = useState("default");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false); // toggle login/signup
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  // ── Email login or signup ──────────────────────────────
  const handleEmailAuth = async () => {
    setError("");
    setLoading(true);
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      router.push("/dashboard");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      // Make Firebase errors readable
      if (message.includes("user-not-found"))  setError("No account with this email.");
      else if (message.includes("wrong-password")) setError("Wrong password.");
      else if (message.includes("email-already"))  setError("Email already registered. Please log in.");
      else if (message.includes("weak-password"))  setError("Password must be 6+ characters.");
      else setError("Something went wrong. Try again.");
    }
    setLoading(false);
  };

  // ── Google Sign-In ─────────────────────────────────────
  const handleGoogle = async () => {
    setError("");
    setLoading(true);
    try {
      await signInWithPopup(auth, provider);
      router.push("/dashboard");
    } catch {
      setError("Google sign-in failed. Try again.");
    }
    setLoading(false);
  };

  // ── UI ────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">📝</div>
          <h1 className="text-3xl font-bold text-white">NoteCloud</h1>
          <p className="text-gray-400 mt-2">Your notes, everywhere.</p>
        </div>

        {/* Card */}
        <div className="bg-gray-900 rounded-2xl p-8 shadow-2xl border border-gray-800">

          {/* Toggle Login / Sign Up */}
          <div className="flex bg-gray-800 rounded-xl p-1 mb-6">
            <button
              onClick={() => { setIsSignUp(false); setError(""); }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all
                ${!isSignUp
                  ? "bg-violet-600 text-white shadow"
                  : "text-gray-400 hover:text-white"}`}
            >
              Log In
            </button>
            <button
              onClick={() => { setIsSignUp(true); setError(""); }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all
                ${isSignUp
                  ? "bg-violet-600 text-white shadow"
                  : "text-gray-400 hover:text-white"}`}
            >
              Sign Up
            </button>
          </div>

          {/* Google Button */}
          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white
                       text-gray-800 font-medium py-3 rounded-xl hover:bg-gray-100
                       transition-all mb-4 disabled:opacity-50"
          >
            {/* Google SVG icon */}
            <svg className="w-5 h-5" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.14 0 5.95 1.08 8.17 2.86l6.1-6.1C34.46 3.05 29.5 1 24 1 14.82 1 7.07 6.48 3.64 14.22l7.1 5.52C12.4 13.74 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.52 24.5c0-1.64-.15-3.22-.42-4.75H24v9h12.7c-.55 2.94-2.2 5.42-4.68 7.1l7.18 5.58C43.44 37.42 46.52 31.4 46.52 24.5z"/>
              <path fill="#FBBC05" d="M10.74 28.26A14.5 14.5 0 0 1 9.5 24c0-1.48.26-2.9.72-4.26l-7.1-5.52A23.94 23.94 0 0 0 0 24c0 3.86.92 7.5 2.56 10.72l8.18-6.46z"/>
              <path fill="#34A853" d="M24 47c5.5 0 10.12-1.82 13.5-4.94l-7.18-5.58C28.6 38.1 26.42 39 24 39c-6.26 0-11.6-4.24-13.26-9.96l-8.18 6.46C6.07 43.52 14.4 47 24 47z"/>
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-gray-700"/>
            <span className="text-gray-500 text-sm">or</span>
            <div className="flex-1 h-px bg-gray-700"/>
          </div>

          {/* Email Input */}
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleEmailAuth()}
            className="w-full bg-gray-800 text-white placeholder-gray-500
                       border border-gray-700 rounded-xl px-4 py-3 mb-3
                       focus:outline-none focus:border-violet-500 transition-colors"
          />

          {/* Password Input */}
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleEmailAuth()}
            className="w-full bg-gray-800 text-white placeholder-gray-500
                       border border-gray-700 rounded-xl px-4 py-3 mb-4
                       focus:outline-none focus:border-violet-500 transition-colors"
          />

          {/* Error message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400
                            text-sm rounded-xl px-4 py-3 mb-4">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleEmailAuth}
            disabled={loading || !email || !password}
            className="w-full bg-violet-600 hover:bg-violet-500 disabled:bg-violet-800
                       disabled:opacity-50 text-white font-semibold py-3 rounded-xl
                       transition-all"
          >
            {loading ? "Please wait..." : isSignUp ? "Create Account" : "Log In"}
          </button>

        </div>

        {/* Footer */}
        <p className="text-center text-gray-600 text-sm mt-6">
          NoteCloud — Built with Next.js & Firebase
        </p>
      </div>
    </div>
  );
}
// app/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in when they visit localhost:3000
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push("/dashboard"); // logged in → go to dashboard
      } else {
        router.push("/login");     // not logged in → go to login
      }
    });

    return () => unsubscribe(); // cleanup listener on unmount
  }, [router]);

  // Show nothing while checking auth state
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-white text-lg animate-pulse">Loading...</div>
    </div>
  );
}
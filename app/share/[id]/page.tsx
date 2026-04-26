// app/share/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { ref, get } from "firebase/database";
import { db } from "@/lib/firebase";
import { Note } from "@/types/note";

export default function SharePage() {
  const params       = useParams();
  const searchParams = useSearchParams();

  const noteId = params.id as string;
  const userId = searchParams.get("uid");

  const [note, setNote]     = useState<Note | null>(null);
  const [status, setStatus] = useState<"loading" | "found" | "expired" | "notfound">("loading");

  useEffect(() => {
    if (!noteId || !userId) {
      setStatus("notfound");
      return;
    }

    const fetchNote = async () => {
      try {
        // Fetch the specific note from Firebase
        const snapshot = await get(ref(db, `notes/${userId}/${noteId}`));

        if (!snapshot.exists()) {
          setStatus("notfound");
          return;
        }

        const data = { id: noteId, ...snapshot.val() } as Note;

        // Check if sharing is enabled
        if (!data.shared) {
          setStatus("notfound");
          return;
        }

        // Check if link has expired
        if (data.expiryDate && Date.now() > data.expiryDate) {
          setStatus("expired");
          return;
        }

        setNote(data);
        setStatus("found");

      } catch {
        setStatus("notfound");
      }
    };

    fetchNote();
  }, [noteId, userId]);

  // ── Format date ───────────────────────────────────────
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-IN", {
      day: "numeric", month: "long", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    });
  };

  // ── Loading ───────────────────────────────────────────
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent
                        rounded-full animate-spin"/>
      </div>
    );
  }

  // ── Expired ───────────────────────────────────────────
  if (status === "expired") {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-6xl mb-4">⏰</div>
          <h1 className="text-2xl font-bold text-white mb-2">Link Expired</h1>
          <p className="text-gray-400">This share link is no longer valid.</p>
          <p className="text-gray-600 text-sm mt-2">
            The owner can generate a new link from their dashboard.
          </p>
        </div>
      </div>
    );
  }

  // ── Not found ─────────────────────────────────────────
  if (status === "notfound") {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold text-white mb-2">Note Not Found</h1>
          <p className="text-gray-400">This note doesn't exist or isn't shared.</p>
        </div>
      </div>
    );
  }

  // ── Found — show the note ─────────────────────────────
  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* Navbar */}
      <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4
                      flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📝</span>
          <span className="text-xl font-bold">NoteCloud</span>
        </div>
        <span className="text-xs text-gray-500 bg-gray-800 px-3 py-1 rounded-full">
          👁️ Shared View
        </span>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-12">

        {/* Expiry notice */}
        {note!.expiryDate && (
          <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400
                          text-sm rounded-xl px-4 py-3 mb-6 flex items-center gap-2">
            <span>⏳</span>
            <span>This link expires on {formatDate(note!.expiryDate)}</span>
          </div>
        )}

        {/* Note card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl">

          {/* Title */}
          <h1 className="text-3xl font-bold text-white mb-6">
            {note!.title}
          </h1>

          {/* Divider */}
          <div className="h-px bg-gray-800 mb-6"/>

          {/* Content */}
          <p className="text-gray-300 leading-relaxed whitespace-pre-wrap text-lg">
            {note!.content || "No content in this note."}
          </p>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-800 flex items-center
                          justify-between text-xs text-gray-600">
            <span>Created {formatDate(note!.createdAt)}</span>
            <span>Last updated {formatDate(note!.updatedAt)}</span>
          </div>
        </div>

        {/* Branding */}
        <p className="text-center text-gray-700 text-sm mt-8">
          Shared via <span className="text-violet-500">NoteCloud</span>
        </p>

      </div>
    </div>
  );
}
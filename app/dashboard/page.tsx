// app/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut, onAuthStateChanged, User } from "firebase/auth";
import { ref, push, onValue, remove, update } from "firebase/database";
import { auth, db } from "@/lib/firebase";
import AuthGuard from "@/app/components/AuthGuard";
import NoteCard from "@/app/components/NoteCard";
import { Note } from "@/types/note";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser]               = useState<User | null>(null);
  const [notes, setNotes]             = useState<Note[]>([]);
  const [search, setSearch]           = useState("");
  const [title, setTitle]             = useState("");
  const [content, setContent]         = useState("");
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [showForm, setShowForm]       = useState(false);
  const [loading, setLoading]         = useState(false);
  const [color, setColor]             = useState("default");
  const [tags, setTags]               = useState("");
  const [darkMode, setDarkMode]       = useState(true);

  // Get current user
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  // Fetch notes from Realtime DB
  useEffect(() => {
    if (!user) return;
    const notesRef = ref(db, `notes/${user.uid}`);
    const unsubscribe = onValue(notesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const notesArray: Note[] = Object.entries(data).map(
          ([id, value]) => ({ id, ...(value as Omit<Note, "id">) })
        );
        notesArray.sort((a, b) => b.createdAt - a.createdAt);
        setNotes(notesArray);
      } else {
        setNotes([]);
      }
    });
    return () => unsubscribe();
  }, [user]);

  // Create Note
  const handleCreateNote = async () => {
    if (!user || !title.trim()) return;
    setLoading(true);
    const newNote = {
      title:     title.trim(),
      content:   content.trim(),
      userId:    user.uid,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      shared:    false,
      expiryDate: null,
      color,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
    };
    await push(ref(db, `notes/${user.uid}`), newNote);
    setTitle("");
    setContent("");
    setColor("default");
    setTags("");
    setShowForm(false);
    setLoading(false);
  };

  // Update Note
  const handleUpdateNote = async () => {
    if (!user || !editingNote || !title.trim()) return;
    setLoading(true);
    await update(ref(db, `notes/${user.uid}/${editingNote.id}`), {
      title:     title.trim(),
      content:   content.trim(),
      updatedAt: Date.now(),
      color,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
    });
    setEditingNote(null);
    setTitle("");
    setContent("");
    setShowForm(false);
    setLoading(false);
  };

  // Delete Note
  const handleDeleteNote = async (noteId: string) => {
    if (!user) return;
    await remove(ref(db, `notes/${user.uid}/${noteId}`));
  };

  // Open Edit Form
  const openEdit = (note: Note) => {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content);
    setColor(note.color || "default");
    setTags(note.tags?.join(", ") || "");
    setShowForm(true);
  };

  // Sign Out
  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/login");
  };

  // Search filter
  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(search.toLowerCase()) ||
      note.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AuthGuard>
      <div
        className={`min-h-screen transition-colors duration-300 ${
          darkMode ? "bg-gray-950 text-white" : "bg-gray-50 text-gray-900"
        }`}
      >
        {/* Navbar */}
        <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📝</span>
            <span className="text-xl font-bold text-white">NoteCloud</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-400 text-sm hidden sm:block">
              {user?.email}
            </span>
            <button
              onClick={handleSignOut}
              className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-lg text-sm transition-all"
            >
              Sign Out
            </button>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-2 rounded-lg text-sm transition-all"
            >
              {darkMode ? "☀️" : "🌙"}
            </button>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-4 py-8">

          {/* Welcome + Add button */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">Welcome back! 👋</h2>
              <p className="text-gray-400 text-sm mt-1">
                {notes.length} note{notes.length !== 1 ? "s" : ""} saved
              </p>
            </div>
            <button
              onClick={() => {
                setEditingNote(null);
                setTitle("");
                setContent("");
                setShowForm(true);
              }}
              className="bg-violet-600 hover:bg-violet-500 text-white font-semibold px-5 py-2.5 rounded-xl transition-all flex items-center gap-2"
            >
              <span className="text-lg">+</span> New Note
            </button>
          </div>

          {/* Search bar */}
          <div className="relative mb-6">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">
              🔍
            </span>
            <input
              type="text"
              placeholder="Search notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 text-white placeholder-gray-500 rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:border-violet-500 transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {/* Create / Edit Form */}
          {showForm && (
            <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 mb-6 shadow-xl">
              <h3 className="text-lg font-semibold mb-4">
                {editingNote ? "✏️ Edit Note" : "✨ New Note"}
              </h3>

              <input
                type="text"
                placeholder="Note title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-xl px-4 py-3 mb-3 focus:outline-none focus:border-violet-500 transition-colors"
              />

              <textarea
                placeholder="Write your note here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={5}
                className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-xl px-4 py-3 mb-2 focus:outline-none focus:border-violet-500 transition-colors resize-none"
              />

              {/* Character counter */}
              <p className="text-gray-600 text-xs mb-4 text-right">
                {content.length} characters
              </p>

              {/* Tags input */}
              <input
                type="text"
                placeholder="Tags (comma separated): work, ideas, urgent"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-xl px-4 py-3 mb-3 focus:outline-none focus:border-violet-500 transition-colors"
              />

              {/* Color Picker */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-gray-400 text-sm">Color:</span>
                {[
                  { name: "default", bg: "bg-gray-700" },
                  { name: "violet",  bg: "bg-violet-600" },
                  { name: "blue",    bg: "bg-blue-600" },
                  { name: "green",   bg: "bg-green-600" },
                  { name: "amber",   bg: "bg-amber-500" },
                  { name: "red",     bg: "bg-red-600" },
                ].map((c) => (
                  <button
                    key={c.name}
                    onClick={() => setColor(c.name)}
                    className={`w-7 h-7 rounded-full ${c.bg} transition-all ${
                      color === c.name
                        ? "ring-2 ring-white ring-offset-2 ring-offset-gray-900 scale-110"
                        : "opacity-60 hover:opacity-100"
                    }`}
                  />
                ))}
              </div>

              {/* Form Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={editingNote ? handleUpdateNote : handleCreateNote}
                  disabled={loading || !title.trim()}
                  className="bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded-xl transition-all"
                >
                  {loading ? "Saving..." : editingNote ? "Update" : "Save Note"}
                </button>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingNote(null);
                    setTitle("");
                    setContent("");
                  }}
                  className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-6 py-2.5 rounded-xl transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Notes Grid */}
          {filteredNotes.length === 0 ? (
            <div className="text-center py-20 text-gray-600">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-lg">
                {search
                  ? "No notes match your search."
                  : "No notes yet. Create your first one!"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onEdit={openEdit}
                  onDelete={handleDeleteNote}
                  userId={user?.uid || ""}
                />
              ))}
            </div>
          )}

        </div>
      </div>
    </AuthGuard>
  );
}
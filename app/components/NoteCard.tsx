// app/components/NoteCard.tsx
"use client";

import { useState } from "react";
import { update, ref } from "firebase/database";
import { db } from "@/lib/firebase";
import { Note } from "@/types/note";

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  userId: string;
}

// Color map — note color → border + accent
const colorMap: Record<string, { border: string; accent: string; dot: string }> = {
  default: { border: "border-gray-800",  accent: "bg-gray-800",   dot: "bg-gray-500"   },
  violet:  { border: "border-violet-700",accent: "bg-violet-900/30", dot: "bg-violet-500" },
  blue:    { border: "border-blue-700",  accent: "bg-blue-900/30",  dot: "bg-blue-500"   },
  green:   { border: "border-green-700", accent: "bg-green-900/30", dot: "bg-green-500"  },
  amber:   { border: "border-amber-600", accent: "bg-amber-900/30", dot: "bg-amber-500"  },
  red:     { border: "border-red-700",   accent: "bg-red-900/30",   dot: "bg-red-500"    },
};

export default function NoteCard({
  note, onEdit, onDelete, userId
}: NoteCardProps) {

  const [copied, setCopied] = useState(false);
  const colors = colorMap[note.color] || colorMap.default;

  // ── Format date ───────────────────────────────────────
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric"
    });
  };

  // ── Share note ────────────────────────────────────────
  const handleShare = async () => {
    const expiryDate = Date.now() + 24 * 60 * 60 * 1000;
    await update(ref(db, `notes/${userId}/${note.id}`), {
      shared: true,
      expiryDate,
    });
    const shareUrl = `${window.location.origin}/share/${note.id}?uid=${userId}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Download as TXT ───────────────────────────────────
  const handleDownload = () => {
    const text = `${note.title}\n${"─".repeat(40)}\n\n${note.content}
\n\nCreated: ${formatDate(note.createdAt)}
Last updated: ${formatDate(note.updatedAt)}`;

    const blob = new Blob([text], { type: "text/plain" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `${note.title.replace(/\s+/g, "_")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`bg-gray-900 border ${colors.border} rounded-2xl p-5
                     hover:brightness-110 transition-all group flex flex-col`}>

      {/* Color dot + title row */}
      <div className="flex items-start gap-2 mb-2">
        <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${colors.dot}`}/>
        <h3 className="font-semibold text-white text-lg line-clamp-1 flex-1">
          {note.title}
        </h3>
      </div>

      {/* Content preview */}
      <p className="text-gray-400 text-sm flex-1 line-clamp-3 mb-3 pl-4">
        {note.content || "No content"}
      </p>

      {/* Tags */}
      {note.tags && note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3 pl-4">
          {note.tags.map((tag) => (
            <span key={tag}
              className={`text-xs px-2 py-0.5 rounded-full ${colors.accent}
                          text-gray-300 border ${colors.border}`}>
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Date + shared badge */}
      <div className="flex items-center justify-between mb-3 pl-4">
        <span className="text-gray-600 text-xs">
          Updated {formatDate(note.updatedAt)}
        </span>
        {note.shared && (
          <span className="text-xs bg-green-500/10 text-green-400
                           border border-green-500/20 px-2 py-0.5 rounded-full">
            🔗 Shared
          </span>
        )}
      </div>

      {/* Action buttons — visible on hover */}
      <div className="grid grid-cols-3 gap-1.5
                      opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => onEdit(note)}
          className="bg-gray-800 hover:bg-violet-600/20 hover:text-violet-400
                     text-gray-400 text-xs py-2 rounded-lg transition-all">
          ✏️ Edit
        </button>
        <button onClick={handleShare}
          className="bg-gray-800 hover:bg-blue-600/20 hover:text-blue-400
                     text-gray-400 text-xs py-2 rounded-lg transition-all">
          {copied ? "✅ Copied" : "🔗 Share"}
        </button>
        <button onClick={() => onDelete(note.id)}
          className="bg-gray-800 hover:bg-red-600/20 hover:text-red-400
                     text-gray-400 text-xs py-2 rounded-lg transition-all">
          🗑️ Del
        </button>
        <button onClick={handleDownload}
          className="col-span-3 bg-gray-800 hover:bg-green-600/20
                     hover:text-green-400 text-gray-400 text-xs py-2
                     rounded-lg transition-all">
          ⬇️ Download as TXT
        </button>
      </div>
    </div>
  );
}
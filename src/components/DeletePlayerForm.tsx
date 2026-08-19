"use client";

import { deletePlayer } from "@/app/admin/actions";

export default function DeletePlayerForm({
  playerId,
  playerName,
}: {
  playerId: string;
  playerName: string;
}) {
  return (
    <form
      action={deletePlayer}
      onSubmit={(e) => {
        if (!confirm(`Delete ${playerName}'s picks permanently? This can't be undone.`)) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="playerId" value={playerId} />
      <button
        type="submit"
        className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-300 hover:bg-red-500/20"
      >
        Delete
      </button>
    </form>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Make Picks" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/money", label: "Money League" },
  { href: "/picks", label: "All Picks" },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-10 border-b border-slate-800 bg-slate-950/95 backdrop-blur">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-2 px-4 py-3">
        <span className="whitespace-nowrap text-sm font-bold text-emerald-400 sm:text-base">
          🏆 Sport Sweepstake 2026/27
        </span>
        <div className="flex gap-1 text-sm">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-md px-2.5 py-1.5 font-medium transition-colors sm:px-3 ${
                  active
                    ? "bg-emerald-500/20 text-emerald-300"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [ville, setVille] = useState("");

  const isOffresPage =
    pathname.startsWith("/offres") || pathname.startsWith("/job-etudiant");

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (ville.trim()) params.set("ville", ville.trim());
    router.push(`/offres${params.toString() ? `?${params.toString()}` : ""}`);
  }

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-red-700 border-b border-red-800">
        <div className="max-w-screen-xl mx-auto px-4 md:px-6 h-20 md:h-28 flex items-center justify-between gap-3">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <Image
              src="/logo.png"
              alt="MonBaito"
              width={260}
              height={72}
              className="h-14 md:h-24 w-auto object-contain brightness-0 invert"
              priority
            />
          </Link>

          {/* Compact search (desktop, offres pages only) */}
          {isOffresPage && (
            <form
              onSubmit={handleSearchSubmit}
              className="hidden md:flex items-center bg-white/10 border border-white/30 overflow-hidden"
            >
              <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Job, secteur..."
                className="bg-transparent font-label text-xs uppercase tracking-widest text-white placeholder:text-white/60 px-3 py-2 w-36 outline-none"
              />
              <span className="w-px h-4 bg-white/30" />
              <input
                type="text"
                value={ville}
                onChange={(e) => setVille(e.target.value)}
                placeholder="Ville..."
                className="bg-transparent font-label text-xs uppercase tracking-widest text-white placeholder:text-white/60 px-3 py-2 w-28 outline-none"
              />
              <button
                type="submit"
                className="bg-white text-red-700 font-label text-[10px] font-bold tracking-widest uppercase px-3 py-2 hover:bg-red-50 transition-colors"
              >
                OK
              </button>
            </form>
          )}

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/offres"
              className="font-label text-xs tracking-widest uppercase text-white/80 hover:text-white transition-colors"
            >
              Offres
            </Link>
            <Link
              href="/auth/login"
              className="font-label text-xs tracking-widest uppercase text-white/80 hover:text-white transition-colors"
            >
              Connexion
            </Link>
            <Link
              href="/#beta"
              className="font-label text-xs font-bold tracking-widest uppercase bg-white text-red-700 px-5 py-2 hover:bg-red-50 transition-colors"
            >
              Join Beta
            </Link>
          </nav>

          {/* Mobile nav — boutons visibles directement */}
          <nav className="md:hidden flex items-center gap-2">
            <Link
              href="/offres"
              className="font-label text-[11px] font-bold tracking-widest uppercase border border-white/50 text-white px-3 py-2 hover:bg-white/10 transition-colors"
            >
              Offres
            </Link>
            <Link
              href="/auth/login"
              className="font-label text-[11px] font-bold tracking-widest uppercase border border-white text-white px-3 py-2 hover:bg-white/10 transition-colors"
            >
              Connexion
            </Link>
            <Link
              href="/#beta"
              className="font-label text-[11px] font-bold tracking-widest uppercase bg-white text-red-700 px-3 py-2 hover:bg-red-50 transition-colors"
            >
              Beta
            </Link>
          </nav>
        </div>
      </header>
    </>
  );
}

"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [q, setQ] = useState("");
  const [ville, setVille] = useState("");

  const isOffresPage =
    pathname.startsWith("/offres") || pathname.startsWith("/job-etudiant");

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (ville.trim()) params.set("ville", ville.trim());
    router.push(`/offres${params.toString() ? `?${params.toString()}` : ""}`);
  }

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-stone-50 border-b border-stone-200/60">
        <div className="max-w-screen-xl mx-auto px-6 h-28 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <Image
              src="/logo.png"
              alt="MonBaito"
              width={260}
              height={72}
              className="h-20 w-auto object-contain"
              priority
            />
          </Link>

          {/* Compact search (desktop, offres pages only) */}
          {isOffresPage && (
            <form
              onSubmit={handleSearchSubmit}
              className="hidden md:flex items-center bg-white border border-stone-200 overflow-hidden"
            >
              <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Job, secteur..."
                className="bg-transparent font-label text-xs uppercase tracking-widest text-neutral-700 placeholder:text-neutral-400 px-3 py-2 w-36 outline-none"
              />
              <span className="w-px h-4 bg-stone-200" />
              <input
                type="text"
                value={ville}
                onChange={(e) => setVille(e.target.value)}
                placeholder="Ville..."
                className="bg-transparent font-label text-xs uppercase tracking-widest text-neutral-700 placeholder:text-neutral-400 px-3 py-2 w-28 outline-none"
              />
              <button
                type="submit"
                className="bg-neutral-900 text-white font-label text-[10px] font-bold tracking-widest uppercase px-3 py-2 hover:bg-red-700 transition-colors"
              >
                OK
              </button>
            </form>
          )}

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/offres"
              className="font-label text-xs tracking-widest uppercase text-neutral-500 hover:text-neutral-900 transition-colors"
            >
              Offres
            </Link>
            <Link
              href="/auth/login"
              className="font-label text-xs tracking-widest uppercase text-neutral-500 hover:text-neutral-900 transition-colors"
            >
              Connexion
            </Link>
            <Link
              href="/#beta"
              className="font-label text-xs font-bold tracking-widest uppercase bg-red-700 text-white px-5 py-2 hover:bg-red-800 transition-colors"
            >
              Join Beta
            </Link>
          </nav>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-neutral-900 p-1"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-30 md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute top-16 left-0 right-0 bg-stone-50 border-b border-stone-200 px-6 py-6 flex flex-col gap-4">
            <Link
              href="/offres"
              className="font-label text-xs tracking-widest uppercase text-neutral-500 hover:text-neutral-900 transition-colors py-1"
              onClick={() => setMenuOpen(false)}
            >
              Offres
            </Link>
            <Link
              href="/auth/login"
              className="font-label text-xs tracking-widest uppercase text-neutral-500 hover:text-neutral-900 transition-colors py-1"
              onClick={() => setMenuOpen(false)}
            >
              Connexion
            </Link>
            <Link
              href="/#beta"
              className="font-label text-xs font-bold tracking-widest uppercase bg-red-700 text-white px-5 py-3 text-center hover:bg-red-800 transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Join Beta
            </Link>
            {isOffresPage && (
              <form onSubmit={handleSearchSubmit} className="flex flex-col gap-2 mt-2 border-t border-stone-200 pt-4">
                <input
                  type="text"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="JOB, SECTEUR..."
                  className="bg-white border border-stone-200 font-label text-xs uppercase tracking-widest text-neutral-700 placeholder:text-neutral-400 px-3 py-2 outline-none"
                />
                <input
                  type="text"
                  value={ville}
                  onChange={(e) => setVille(e.target.value)}
                  placeholder="VILLE..."
                  className="bg-white border border-stone-200 font-label text-xs uppercase tracking-widest text-neutral-700 placeholder:text-neutral-400 px-3 py-2 outline-none"
                />
                <button
                  type="submit"
                  className="bg-neutral-900 text-white font-label text-[10px] font-bold tracking-widest uppercase px-3 py-2 hover:bg-red-700 transition-colors"
                >
                  Rechercher
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}

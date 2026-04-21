"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Home, Briefcase, User, Settings, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Accueil", icon: Home },
  { href: "/candidatures", label: "Candidatures", icon: Briefcase },
  { href: "/profil", label: "Profil", icon: User },
  { href: "/settings", label: "Paramètres", icon: Settings },
];

interface SidebarProps {
  firstName?: string | null;
}

export function Sidebar({ firstName }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <aside className="hidden md:flex flex-col w-60 min-h-screen bg-white/[0.03] border-r border-white/[0.06] px-4 py-6 shrink-0">
      <Link href="/dashboard" className="flex items-center gap-2 px-2 mb-8">
        <Image
          src="/logo.png"
          alt="MonBaito"
          width={100}
          height={32}
          className="h-8 w-auto object-contain"
          priority
        />
        <span className="text-xs text-[var(--accent)] font-medium bg-[var(--accent)]/10 px-1.5 py-0.5 rounded-full">beta</span>
      </Link>

      {firstName && (
        <p className="text-sm text-[var(--muted-foreground)] px-2 mb-6">
          Bonjour, <span className="text-white font-medium">{firstName}</span>
        </p>
      )}

      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                active
                  ? "bg-[var(--accent)]/15 text-[var(--accent)]"
                  : "text-[var(--muted-foreground)] hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[var(--muted-foreground)] hover:text-white hover:bg-white/5 transition-colors mt-4"
      >
        <LogOut size={18} />
        Déconnexion
      </button>
    </aside>
  );
}

"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Home, Briefcase, User, Settings, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";

const NAV_ITEMS = [
  { href: "/dashboard",     label: "Accueil",       icon: Home },
  { href: "/candidatures",  label: "Candidatures",  icon: Briefcase },
  { href: "/profil",        label: "Profil",        icon: User },
  { href: "/settings",      label: "Paramètres",    icon: Settings },
];

interface SidebarProps {
  firstName?: string | null;
}

export function Sidebar({ firstName }: SidebarProps) {
  const pathname = usePathname();
  const router   = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <aside className="hidden md:flex flex-col w-60 min-h-screen bg-card border-r border-border px-4 py-6 shrink-0">
      <Link href="/" className="flex items-center gap-2 px-2 mb-8">
        <Image
          src="/logo.png"
          alt="MonBaito"
          width={160}
          height={44}
          className="h-11 w-auto object-contain"
          priority
        />
        <span
          className="text-[10px] text-accent font-bold bg-accent/10 px-1.5 py-0.5 uppercase tracking-widest"
          style={{ fontFamily: "var(--font-label)" }}
        >
          beta
        </span>
      </Link>

      {firstName && (
        <p
          className="text-sm text-muted-foreground px-2 mb-6"
          style={{ fontFamily: "var(--font-label)" }}
        >
          Bonjour, <span className="text-foreground font-semibold">{firstName}</span>
        </p>
      )}

      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-accent/10 text-accent"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
              style={{ fontFamily: "var(--font-label)" }}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors mt-4"
        style={{ fontFamily: "var(--font-label)" }}
      >
        <LogOut size={18} />
        Déconnexion
      </button>
    </aside>
  );
}

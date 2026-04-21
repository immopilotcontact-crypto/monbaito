import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer
      className="w-full py-10 px-6 bg-stone-100 border-t border-stone-200"
      role="contentinfo"
    >
      <div className="max-w-screen-xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        {/* Logo */}
        <Link href="/" aria-label="MonBaito — Accueil" className="flex-shrink-0">
          <Image
            src="/logo.png"
            alt="MonBaito"
            width={260}
            height={72}
            className="h-20 w-auto object-contain"
            priority
          />
        </Link>

        {/* Nav links */}
        <nav
          aria-label="Liens du footer"
          className="flex flex-wrap justify-center gap-6"
          style={{ fontFamily: "var(--font-label)" }}
        >
          {[
            { href: "/mentions-legales", label: "Mentions légales" },
            { href: "/cgu", label: "CGU" },
            { href: "/cgv", label: "CGV" },
            { href: "/confidentialite", label: "Confidentialité" },
            { href: "/cookies", label: "Cookies" },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-[10px] tracking-widest uppercase text-neutral-500 hover:text-neutral-900 hover:underline underline-offset-4 decoration-red-700 transition-all"
            >
              {label}
            </Link>
          ))}
          <a
            href="mailto:hello@monbaito.fr"
            className="text-[10px] tracking-widest uppercase text-neutral-500 hover:text-neutral-900 hover:underline underline-offset-4 decoration-red-700 transition-all"
          >
            Contact
          </a>
        </nav>

        {/* Copyright */}
        <p
          className="text-[10px] tracking-widest uppercase text-neutral-400"
          style={{ fontFamily: "var(--font-label)" }}
        >
          © 2026 MONBAITO.
        </p>
      </div>
    </footer>
  );
}

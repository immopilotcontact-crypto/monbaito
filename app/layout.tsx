import type { Metadata, Viewport } from "next";
import { Inter, Fraunces, Space_Grotesk } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { NavigationBar } from "@/components/shared/NavigationBar";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#0a0a0f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: {
    default: "MonBaito — L'IA qui trouve ton job étudiant",
    template: "%s | MonBaito",
  },
  description:
    "MonBaito est l'agent IA qui scanne les offres d'emploi étudiantes et t'aide à postuler plus vite et mieux. Rejoins la beta gratuite.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://monbaito.fr"),
  openGraph: {
    title: "MonBaito — L'IA qui trouve ton job étudiant",
    description:
      "Fini les heures perdues. MonBaito scanne les offres, vérifie les entreprises, et t'aide à postuler en un clic.",
    url: "/",
    siteName: "MonBaito",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "MonBaito — L'agent IA pour les jobs étudiants",
      },
    ],
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MonBaito — L'IA qui trouve ton job étudiant",
    description:
      "Fini les heures perdues. MonBaito scanne les offres, vérifie les entreprises, et t'aide à postuler en un clic.",
    images: ["/og-image.png"],
  },
  appleWebApp: {
    capable: true,
    title: "MonBaito",
    statusBarStyle: "black-translucent",
  },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      name: "MonBaito",
      url: "https://monbaito.fr",
      logo: "https://monbaito.fr/logo.png",
      description:
        "L'agent IA qui trouve les vraies offres d'emploi étudiantes.",
      founder: {
        "@type": "Person",
        name: "Morii",
      },
    },
    {
      "@type": "WebSite",
      name: "MonBaito",
      url: "https://monbaito.fr",
      description:
        "MonBaito est l'agent IA qui scanne les offres d'emploi étudiantes et t'aide à postuler plus vite et mieux.",
      inLanguage: "fr-FR",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${inter.variable} ${fraunces.variable} ${spaceGrotesk.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-dvh flex flex-col">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-accent focus:text-accent-foreground focus:rounded-lg"
        >
          Aller au contenu principal
        </a>
        <NavigationBar />
        {children}
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              color: "hsl(var(--foreground))",
            },
          }}
        />
      </body>
    </html>
  );
}

"use client";

import { useState } from "react";
import { Hero } from "@/components/landing/Hero";
import { LeadGen } from "@/components/landing/LeadGen";
import { Solution } from "@/components/landing/Solution";
import { Problem } from "@/components/landing/Problem";
import { Beta } from "@/components/landing/Beta";
import { FAQ } from "@/components/landing/FAQ";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  const [waitlistCount, setWaitlistCount] = useState<number | undefined>(
    undefined
  );

  return (
    <>
      <main id="main-content">
        <Hero onWaitlistSuccess={(count) => setWaitlistCount(count)} />
        <LeadGen onSuccess={(count) => setWaitlistCount(count)} />
        <Solution />
        <Problem />
        <Beta externalCount={waitlistCount} />
        <FAQ />
      </main>
      <Footer />
    </>
  );
}

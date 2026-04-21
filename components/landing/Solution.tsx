"use client";

import { useState, useEffect } from "react";
import { ArrowUpRight } from "lucide-react";

const matchCards = [
  {
    category: "HÔTELLERIE",
    number: "01",
    title: "Serveur Weekend",
    company: "— à remplir —",
    score: "98",
  },
  {
    category: "COMMERCE",
    number: "02",
    title: "Caissier Temps Partiel",
    company: "— à remplir —",
    score: "92",
  },
  {
    category: "LOGISTIQUE",
    number: "03",
    title: "Livreur Vélo",
    company: "— à remplir —",
    score: "87",
  },
];

export function Solution() {
  const [timestamp, setTimestamp] = useState("--:--:--");

  useEffect(() => {
    function tick() {
      const now = new Date();
      setTimestamp(
        `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`
      );
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="section-spacing px-5 md:px-6" aria-labelledby="matching-title">
      <div className="max-w-screen-xl mx-auto">
        {/* Section header */}
        <div className="flex justify-between items-baseline mb-8 md:mb-16 border-b border-stone-200 pb-4">
          <h2
            id="matching-title"
            className="text-xl md:text-2xl font-black uppercase tracking-tighter text-neutral-900"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            Matching in Action
          </h2>
          <span
            className="text-[10px] text-neutral-400 tracking-widest uppercase"
            style={{ fontFamily: "var(--font-label)" }}
          >
            LATEST_SYNC: {timestamp}
          </span>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {matchCards.map((card) => (
            <div
              key={card.number}
              className="bg-white p-5 md:p-8 border border-stone-200/80 hover:border-red-700 transition-all group flex flex-col justify-between min-h-[220px] md:min-h-[300px] cursor-default"
            >
              <div>
                <div className="flex justify-between items-start mb-4 md:mb-6">
                  <span
                    className="text-[10px] tracking-widest uppercase bg-stone-100 px-2 py-1 text-neutral-500"
                    style={{ fontFamily: "var(--font-label)" }}
                  >
                    {card.category} / {card.number}
                  </span>
                  <ArrowUpRight
                    className="size-4 text-neutral-400 group-hover:text-red-700 transition-colors"
                    aria-hidden="true"
                  />
                </div>
                <h3
                  className="text-xl md:text-3xl font-black uppercase tracking-tighter mb-2 text-neutral-900"
                  style={{ fontFamily: "var(--font-sans)" }}
                >
                  {card.title}
                </h3>
                <p
                  className="text-xs text-neutral-400 uppercase tracking-tight"
                  style={{ fontFamily: "var(--font-label)" }}
                >
                  {card.company}
                </p>
              </div>

              <div className="mt-6 md:mt-10 flex flex-col gap-4">
                <div className="w-full bg-stone-100 h-px" />
                <div className="flex justify-between items-end">
                  <span
                    className="text-[10px] text-neutral-400 uppercase tracking-widest"
                    style={{ fontFamily: "var(--font-label)" }}
                  >
                    Match Score
                  </span>
                  <span
                    className="text-4xl font-black text-red-700 tracking-tighter leading-none"
                    style={{ fontFamily: "var(--font-sans)" }}
                  >
                    {card.score}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

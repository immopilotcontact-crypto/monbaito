"use client";

const features = [
  { number: "01", label: "Smart Profile Match" },
  { number: "02", label: "AI-Driven Trust Check" },
  { number: "03", label: "Instant Discovery" },
];

export function Problem() {
  return (
    <section
      className="bg-stone-100 section-spacing px-6"
      aria-labelledby="manifesto-title"
    >
      <div className="max-w-screen-xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12">
        {/* Left: large heading + body */}
        <div className="md:col-span-7">
          <h2
            id="manifesto-title"
            className="text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter leading-[0.92] mb-10 text-neutral-900"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {/* Contenu à remplir */}
            Le travail n&apos;est pas ton identité.
          </h2>
          <p
            className="text-lg text-neutral-600 leading-relaxed max-w-xl"
            style={{ fontFamily: "var(--font-label)" }}
          >
            {/* Contenu à remplir */}
            Les plateformes d&apos;emploi n&apos;ont pas été pensées pour toi.
            MLM déguisés, stages illégaux, CV qui disparaissent dans le vide.
            MonBaito analyse les offres pour toi, détecte les arnaques et t&apos;aide
            à postuler plus vite et mieux.
          </p>
        </div>

        {/* Right: numbered feature list */}
        <div className="md:col-span-5 flex flex-col justify-center items-start md:items-end">
          <div
            className="space-y-6"
            style={{ fontFamily: "var(--font-label)" }}
          >
            {features.map((f) => (
              <div key={f.number} className="group cursor-default text-left md:text-right">
                <span className="text-[10px] uppercase tracking-widest text-neutral-400 block">
                  {f.number}
                </span>
                <span className="text-lg md:text-xl font-bold uppercase text-neutral-700 group-hover:text-red-700 transition-colors">
                  {f.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

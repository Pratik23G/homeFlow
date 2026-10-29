import { SectionHeading } from "../SectionHeading";

const tiles = [
  { title: "Cabinet & pantry organization", text: "Storage, containers and systems so everything has a place." },
  { title: "Fixtures & hardware", text: "Faucets, pulls, handles, lighting and other swap-outs." },
  { title: "Small repairs", text: "Hinges, drawers, loose fittings and the fix-it list that keeps growing." },
  { title: "Layout & flow fixes", text: "Rework how you move and work in the space so routines get easier." },
];

export function ServiceTiles() {
  return (
    <section id="services" className="border-y border-line bg-ink px-5 py-16">
      <div className="mx-auto max-w-6xl">
        <SectionHeading eyebrow="Kitchen services" title="What Nick can do for your kitchen" center />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {tiles.map((t, i) => (
            <div key={t.title} className="rounded-lg border border-line p-6">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full border border-gold font-serif text-lg text-gold">
                {i + 1}
              </div>
              <h3 className="font-serif text-2xl font-semibold">{t.title}</h3>
              <p className="mt-2 text-sm text-muted">{t.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

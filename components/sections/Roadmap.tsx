export function Roadmap() {
  return (
    <section className="py-24 px-6 border-t border-border/30 bg-muted/20">
      <div className="max-w-7xl mx-auto">
        <h2 className="font-display text-3xl font-bold text-foreground mb-12 uppercase text-center">Strategic Roadmap</h2>
        <div className="space-y-8 max-w-4xl mx-auto">
          {[
            { phase: "Phase I", title: "Establishment", status: "Complete" },
            { phase: "Phase II", title: "Expansion", status: "In Progress" },
            { phase: "Phase III", title: "Dominance", status: "Pending" }
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-6 p-6 border border-border bg-card clip-edges">
              <div className="font-display text-primary text-xl w-24">{item.phase}</div>
              <div className="flex-grow font-heading text-lg tracking-wider uppercase">{item.title}</div>
              <div className={`font-sans text-sm px-3 py-1 border ${item.status === 'Complete' ? 'border-primary text-primary' : 'border-muted-foreground text-muted-foreground'}`}>
                {item.status}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

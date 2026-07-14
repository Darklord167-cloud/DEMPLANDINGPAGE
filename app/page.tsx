import { Hero } from "@/components/sections/Hero";
import { StatsTicker } from "@/components/sections/StatsTicker";
import { AdminTeaser } from "@/components/sections/AdminTeaser";
import { GeckoTerminalWidget } from "@/components/GeckoTerminalWidget";

export default function Home() {
  return (
    <>
      <Hero />
      <div className="container mx-auto px-4 py-8">
        <GeckoTerminalWidget />
      </div>
      <StatsTicker />
      <AdminTeaser />
    </>
  );
}

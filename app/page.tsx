import { Hero } from "@/components/sections/Hero";
import { StatsTicker } from "@/components/sections/StatsTicker";
import { AdminTeaser } from "@/components/sections/AdminTeaser";
import { JupiterSwapWidget } from "@/components/JupiterSwapWidget";

export default function Home() {
  return (
    <>
      <Hero />
      <div className="container mx-auto px-4 py-8">
        <JupiterSwapWidget />
      </div>
      <StatsTicker />
      <AdminTeaser />
    </>
  );
}

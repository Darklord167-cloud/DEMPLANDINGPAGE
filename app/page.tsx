import { Hero } from "@/components/sections/Hero";
import { StatsTicker } from "@/components/sections/StatsTicker";
import { AboutSection } from "@/components/sections/AboutSection";
import { TokenInfo } from "@/components/sections/TokenInfo";
import { FeaturesShowcase } from "@/components/sections/FeaturesShowcase";
import { Roadmap } from "@/components/sections/Roadmap";
import { WhitepaperTeaser } from "@/components/sections/WhitepaperTeaser";
import { FAQ } from "@/components/sections/FAQ";
import { AdminTeaser } from "@/components/sections/AdminTeaser";

export default function Home() {
  return (
    <div className="flex flex-col w-full min-h-screen bg-background">
      <Hero />
      <StatsTicker />
      <AboutSection />
      <TokenInfo />
      <FeaturesShowcase />
      <Roadmap />
      <WhitepaperTeaser />
      <FAQ />
      <AdminTeaser />
    </div>
  );
}

import { Hero } from "@/components/sections/Hero";
import { StatsTicker } from "@/components/sections/StatsTicker";
import { AdminTeaser } from "@/components/sections/AdminTeaser";

export default function Home() {
  return (
    <>
      <Hero />
      <StatsTicker />
      <AdminTeaser />
    </>
  );
}

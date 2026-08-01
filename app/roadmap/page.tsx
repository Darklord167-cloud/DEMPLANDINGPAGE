"use client";

import { Roadmap } from "@/components/sections/Roadmap";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function RoadmapPage() {
  return (
    <div className="min-h-screen bg-[#06060a] pt-12 pb-24">
      <div className="container mx-auto px-6 max-w-6xl">
        <Button variant="ghost" asChild className="mb-6 hover:bg-white/5 text-zinc-400 hover:text-white font-mono text-xs">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4 text-purple-400" /> Back to Central HQ
          </Link>
        </Button>
      </div>

      <Roadmap />
    </div>
  );
}


import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background selection:bg-primary/30 selection:text-primary-foreground">
      <div className="absolute inset-0 bg-grid-pattern [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />
      
      <Card className="w-full max-w-md mx-4 bg-card border-border clip-edges relative z-10">
        <CardContent className="pt-6">
          <div className="flex items-center mb-4 gap-3">
            <div className="w-10 h-10 bg-primary/20 flex items-center justify-center border border-primary/50 clip-edges">
              <AlertCircle className="h-6 w-6 text-primary" />
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground uppercase tracking-wider text-glow">404 Sector Not Found</h1>
          </div>

          <p className="mt-4 font-sans text-sm text-muted-foreground leading-relaxed">
            Did you forget to add the page to the router? The requested coordinates do not exist within the Empire&apos;s databanks.
          </p>

          <div className="mt-8">
            <Link 
              href="/"
              className="h-12 w-full px-8 bg-primary text-primary-foreground font-heading font-bold tracking-widest uppercase hover:bg-primary/80 transition-colors flex items-center justify-center clip-edges"
            >
              Return to HQ
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

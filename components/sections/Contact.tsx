"use client";

import { motion } from "motion/react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertContactMessageSchema, type InsertContactMessage } from "@/shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Send, CheckCircle2 } from "lucide-react";

export function Contact() {
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InsertContactMessage>({
    resolver: zodResolver(insertContactMessageSchema),
  });

  const contactMutation = useMutation({
    mutationFn: async (data: InsertContactMessage) => {
      const res = await apiRequest("POST", "/api/contact", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Message Sent",
        description: "We've received your message and will respond shortly.",
      });
      reset();
    },
    onError: (error: Error) => {
      let description = "Something went wrong. Please try again.";
      try {
        const raw = error.message;
        const jsonStart = raw.indexOf("{");
        if (jsonStart !== -1) {
          const parsed = JSON.parse(raw.slice(jsonStart));
          if (parsed?.message) description = parsed.message;
        }
      } catch {
        description = error.message || description;
      }
      toast({
        title: "Failed to Send",
        description,
        variant: "destructive",
      });
    },
  });

  return (
    <section id="contact-form" className="py-24 bg-black relative border-t border-white/5">
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container px-6 relative z-10 max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-primary font-mono tracking-widest text-sm mb-4">{"///"} REACH OUT</h2>
          <h3 className="text-4xl md:text-5xl font-display font-bold text-white">
            CONTACT THE EMPIRE
          </h3>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            Partnerships, media inquiries, or general questions — send your message and the Dark Empire will respond.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="p-1 rounded-2xl bg-gradient-to-br from-primary/30 via-transparent to-primary/10"
        >
          <div className="bg-black/90 backdrop-blur-xl rounded-xl p-8 md:p-12">
            {contactMutation.isSuccess ? (
              <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
                <div className="h-16 w-16 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.3)]">
                  <CheckCircle2 className="h-8 w-8 text-primary" />
                </div>
                <h4 className="text-2xl font-display font-bold text-white">Transmission Received</h4>
                <p className="text-muted-foreground max-w-sm">Your message has been delivered to the Dark Empire. We&apos;ll be in touch.</p>
                <Button
                  variant="outline"
                  onClick={() => contactMutation.reset()}
                  className="mt-4 border-primary/50 text-primary hover:bg-primary/20"
                >
                  Send Another Message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit((data) => contactMutation.mutate(data))} className="space-y-6" suppressHydrationWarning>
                <div className="grid md:grid-cols-2 gap-6" suppressHydrationWarning>
                  <div className="space-y-2" suppressHydrationWarning>
                    <Label htmlFor="name" className="text-white/70 font-mono text-xs tracking-widest uppercase">Name</Label>
                    <Input
                      id="name"
                      placeholder="Your name"
                      {...register("name")}
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-primary/50 focus:shadow-[0_0_15px_rgba(168,85,247,0.2)] transition-all"
                      disabled={contactMutation.isPending}
                      data-testid="input-contact-name"
                      suppressHydrationWarning
                    />
                    {errors.name && (
                      <p className="text-red-400 text-xs font-mono">{errors.name.message}</p>
                    )}
                  </div>

                  <div className="space-y-2" suppressHydrationWarning>
                    <Label htmlFor="email" className="text-white/70 font-mono text-xs tracking-widest uppercase">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      {...register("email")}
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-primary/50 focus:shadow-[0_0_15px_rgba(168,85,247,0.2)] transition-all"
                      disabled={contactMutation.isPending}
                      data-testid="input-contact-email"
                      suppressHydrationWarning
                    />
                    {errors.email && (
                      <p className="text-red-400 text-xs font-mono">{errors.email.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2" suppressHydrationWarning>
                  <Label htmlFor="subject" className="text-white/70 font-mono text-xs tracking-widest uppercase">Subject</Label>
                  <Input
                    id="subject"
                    placeholder="Partnership / Media / General Inquiry"
                    {...register("subject")}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-primary/50 focus:shadow-[0_0_15px_rgba(168,85,247,0.2)] transition-all"
                    disabled={contactMutation.isPending}
                    data-testid="input-contact-subject"
                    suppressHydrationWarning
                  />
                  {errors.subject && (
                    <p className="text-red-400 text-xs font-mono">{errors.subject.message}</p>
                  )}
                </div>

                <div className="space-y-2" suppressHydrationWarning>
                  <Label htmlFor="message" className="text-white/70 font-mono text-xs tracking-widest uppercase">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Describe your inquiry..."
                    rows={6}
                    {...register("message")}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-primary/50 focus:shadow-[0_0_15px_rgba(168,85,247,0.2)] transition-all resize-none"
                    disabled={contactMutation.isPending}
                    data-testid="input-contact-message"
                    suppressHydrationWarning
                  />
                  {errors.message && (
                    <p className="text-red-400 text-xs font-mono">{errors.message.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full h-14 text-lg font-heading font-bold tracking-wider bg-primary hover:bg-primary/90 text-white shadow-[0_0_30px_-10px_var(--color-primary)] border border-primary/50"
                  disabled={contactMutation.isPending}
                  data-testid="button-contact-submit"
                >
                  {contactMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      TRANSMITTING...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-5 w-5" />
                      SEND MESSAGE
                    </>
                  )}
                </Button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

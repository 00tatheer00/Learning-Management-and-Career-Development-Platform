"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Sparkle } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { FreeCoursePromo } from "@/components/shared/free-course-promo";
import { SITE_CONFIG } from "@/lib/constants";

const codeSnippets = [
  "const future = await learn();",
  "export default App;",
  "flutter run --release",
  "model.fit(X_train, y_train)",
  "<Component />",
  "git push origin main",
];

export function HeroSection() {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ctx: ReturnType<typeof import("gsap").gsap.context> | undefined;
    import("gsap").then(({ gsap }) => {
      if (!gridRef.current) return;
      ctx = gsap.context(() => {
        gsap.to(".hero-glow", {
          scale: 1.2,
          opacity: 0.6,
          duration: 4,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      }, gridRef);
    });
    return () => ctx?.revert();
  }, []);

  return (
    <section
      ref={gridRef}
      className="relative flex flex-col justify-center min-h-screen overflow-hidden pt-24 pb-28 lg:pt-28 lg:pb-36 bg-gradient-to-b from-surface to-background"
      aria-labelledby="hero-heading"
    >
      <div className="absolute inset-0 grid-pattern" aria-hidden="true" />
      <div
        className="hero-glow absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px] opacity-60"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"
        aria-hidden="true"
      />

      {codeSnippets.map((snippet, i) => (
        <motion.div
          key={snippet}
          initial={{ opacity: 0.3, y: 0 }}
          animate={{
            opacity: [0.3, 0.6, 0.3],
            y: [0, -15, 0],
          }}
          transition={{
            duration: 4 + i * 0.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute hidden lg:block font-mono text-xs text-primary/50 bg-background/80 border border-border px-3 py-1.5 rounded-md shadow-sm"
          style={{
            top: `${15 + i * 12}%`,
            left: i % 2 === 0 ? `${5 + i * 3}%` : undefined,
            right: i % 2 !== 0 ? `${5 + i * 2}%` : undefined,
          }}
          aria-hidden="true"
        >
          {snippet}
        </motion.div>
      ))}

      <div className="container-custom relative z-10 flex flex-col items-center px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-5xl"
        >
          <div className="flex flex-col items-center gap-3 mb-8">
            <div className="inline-flex items-center gap-2 bg-background border border-border shadow-sm px-4 py-2 rounded-full">
              <Sparkle size={18} weight="duotone" className="text-primary" aria-hidden="true" />
              <span className="text-sm text-muted">
                {SITE_CONFIG.tagline} — Premium Tech Education
              </span>
            </div>
            <FreeCoursePromo variant="compact" />
          </div>

          <h1
            id="hero-heading"
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6"
          >
            Become{" "}
            <span className="gradient-text">Industry-Ready</span>
            <br />
            Through Real Projects & Live Mentorship
          </h1>

          <p className="text-lg sm:text-xl text-muted max-w-3xl mx-auto mb-10 leading-relaxed">
            Master Web Development, Flutter Development, AI, and emerging
            technologies through practical training, industry projects, and
            expert mentorship.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/register">
                Apply Now
                <ArrowRight className="w-5 h-5" aria-hidden="true" />
              </Link>
            </Button>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/programs">Explore Programs</Link>
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-16 lg:mt-20 w-full max-w-4xl grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4"
        >
          {["Web Dev", "Flutter", "AI/ML", "UI/UX"].map((tech) => (
            <div
              key={tech}
              className="bg-background/90 border border-border shadow-sm rounded-xl px-4 py-3.5 sm:py-4 text-center hover:border-primary/30 hover:shadow-md transition-all"
            >
              <span className="text-sm font-medium text-foreground">{tech}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

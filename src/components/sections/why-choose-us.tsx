"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Books,
  ChalkboardTeacher,
  RocketLaunch,
  BriefcaseMetal,
  PaintBrushBroad,
  Handshake,
  Buildings,
  MicrophoneStage,
} from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";
import { SectionHeader } from "@/components/shared/section-header";
import { PremiumIcon } from "@/components/shared/premium-icon";
import { cn } from "@/lib/utils";

const features: {
  icon: Icon;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
}[] = [
  {
    icon: Books,
    title: "Industry-Focused Curriculum",
    description:
      "Curriculum designed with input from leading tech companies, ensuring you learn skills employers actually need.",
    image:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=900&h=560&fit=crop&q=80",
    imageAlt: "Students collaborating on laptops in a modern classroom",
  },
  {
    icon: ChalkboardTeacher,
    title: "Live Mentorship",
    description:
      "Weekly live sessions with industry professionals who provide personalized guidance and code reviews.",
    image:
      "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=900&h=560&fit=crop&q=80",
    imageAlt: "Instructor mentoring students during a live session",
  },
  {
    icon: RocketLaunch,
    title: "Real Projects",
    description:
      "Build portfolio-worthy projects that solve real problems, not just tutorial exercises.",
    image:
      "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=900&h=560&fit=crop&q=80",
    imageAlt: "Developer writing code for a real-world software project",
  },
  {
    icon: BriefcaseMetal,
    title: "Career Guidance",
    description:
      "Dedicated career coaches help you navigate job searches, negotiate offers, and plan your career path.",
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=900&h=560&fit=crop&q=80",
    imageAlt: "Career coach leading a professional team meeting",
  },
  {
    icon: PaintBrushBroad,
    title: "Portfolio Development",
    description:
      "Expert feedback on your portfolio to make it stand out to recruiters and hiring managers.",
    image:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=900&h=560&fit=crop&q=80",
    imageAlt: "Designer reviewing portfolio work on a laptop",
  },
  {
    icon: Handshake,
    title: "Community Support",
    description:
      "Join a vibrant community of learners, alumni, and mentors for networking and collaboration.",
    image:
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=900&h=560&fit=crop&q=80",
    imageAlt: "Diverse group of students supporting each other",
  },
  {
    icon: Buildings,
    title: "Internship Opportunities",
    description:
      "Access to internship placements with our network of partner companies worldwide.",
    image:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=900&h=560&fit=crop&q=80",
    imageAlt: "Modern tech company office workspace",
  },
  {
    icon: MicrophoneStage,
    title: "Interview Preparation",
    description:
      "Mock interviews, technical assessments, and behavioral coaching to ace your job interviews.",
    image:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=900&h=560&fit=crop&q=80",
    imageAlt: "Professional preparing for a job interview",
  },
];

export function WhyChooseUsSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const feature = features[activeIndex];

  return (
    <section className="section-padding bg-surface/50" aria-labelledby="why-heading">
      <div className="container-custom">
        <SectionHeader
          label="Why Choose Us"
          title="The EEST Advantage"
          description="We're not just another coding bootcamp. We're a comprehensive career development platform."
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {features.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => setActiveIndex(index)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") setActiveIndex(index);
                }}
                className={cn(
                  "group text-left p-5 rounded-xl border transition-all duration-300 cursor-pointer",
                  activeIndex === index
                    ? "bg-background border-primary/40 shadow-lg shadow-primary/10 -translate-y-0.5"
                    : "border-border bg-background hover:border-primary/30 hover:shadow-md hover:-translate-y-1"
                )}
              >
                <PremiumIcon
                  icon={item.icon}
                  size="md"
                  active={activeIndex === index}
                  className="mb-4"
                />
                <h3
                  className={cn(
                    "font-semibold text-sm mb-1 transition-colors duration-300",
                    activeIndex === index
                      ? "text-primary"
                      : "text-foreground group-hover:text-primary"
                  )}
                >
                  {item.title}
                </h3>
                <p className="text-xs text-muted line-clamp-2">{item.description}</p>
              </motion.div>
            ))}
          </div>

          <div className="rounded-2xl border border-border bg-background overflow-hidden shadow-sm hover:shadow-lg hover:shadow-primary/5 transition-shadow duration-500">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35 }}
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-surface">
                  <Image
                    src={feature.image}
                    alt={feature.imageAlt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority={activeIndex === 0}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
                </div>

                <div className="p-8 lg:p-10">
                  <PremiumIcon
                    icon={feature.icon}
                    size="lg"
                    active
                    interactive={false}
                    className="mb-5"
                  />
                  <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted leading-relaxed text-lg">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

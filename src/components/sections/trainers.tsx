"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { GithubIcon, LinkedinIcon, TwitterIcon } from "@/components/shared/social-icons";
import { SectionHeader } from "@/components/shared/section-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trainers } from "@/lib/data/trainers";

export function TrainersSection() {
  return (
    <section className="section-padding section-alt" aria-labelledby="trainers-heading">
      <div className="container-custom">
        <SectionHeader
          label="Expert Mentors"
          title="Learn from Industry Leaders"
          description="Our trainers bring real-world experience from top tech companies to guide your learning journey."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trainers.map((trainer, index) => (
            <motion.div
              key={trainer.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="overflow-hidden group hover:border-primary/30 transition-all duration-300">
                <div className="relative h-56 overflow-hidden">
                  <Image
                    src={trainer.image}
                    alt={trainer.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                </div>
                <CardContent className="p-5 -mt-8 relative">
                  <h3 className="font-bold text-lg mb-0.5">{trainer.name}</h3>
                  <p className="text-sm text-primary mb-2">{trainer.designation}</p>
                  <p className="text-xs text-muted mb-3">{trainer.experience} experience</p>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {trainer.expertise.slice(0, 3).map((skill) => (
                      <span
                        key={skill}
                        className="tag"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-3">
                    {trainer.social.linkedin && (
                      <a
                        href={trainer.social.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted hover:text-primary transition-colors"
                        aria-label={`${trainer.name} on LinkedIn`}
                      >
                        <LinkedinIcon className="w-4 h-4" />
                      </a>
                    )}
                    {trainer.social.github && (
                      <a
                        href={trainer.social.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted hover:text-primary transition-colors"
                        aria-label={`${trainer.name} on GitHub`}
                      >
                        <GithubIcon className="w-4 h-4" />
                      </a>
                    )}
                    {trainer.social.twitter && (
                      <a
                        href={trainer.social.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted hover:text-primary transition-colors"
                        aria-label={`${trainer.name} on Twitter`}
                      >
                        <TwitterIcon className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Button variant="secondary" asChild>
            <Link href="/trainers">
              View All Trainers
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

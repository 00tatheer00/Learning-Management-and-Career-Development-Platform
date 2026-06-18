"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  MonitorPlay,
  CalendarDots,
  ChatsCircle,
  Certificate,
} from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";
import { PremiumIcon } from "@/components/shared/premium-icon";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const portalFeatures: { icon: Icon; title: string; description: string }[] = [
  {
    icon: MonitorPlay,
    title: "Course Dashboard",
    description: "Access your enrolled courses, video lessons, and learning materials.",
  },
  {
    icon: CalendarDots,
    title: "Live Sessions",
    description: "View upcoming mentorship sessions, workshops, and office hours.",
  },
  {
    icon: ChatsCircle,
    title: "Community",
    description: "Connect with peers, mentors, and alumni in our student community.",
  },
  {
    icon: Certificate,
    title: "Certificates",
    description: "Download your verified certificates and track your achievements.",
  },
];

export function StudentPortalFeatures() {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {portalFeatures.map((feature) => (
          <Card
            key={feature.title}
            className="group transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1"
          >
            <CardContent className="p-6">
              <PremiumIcon icon={feature.icon} size="lg" className="mb-4" />
              <h3 className="font-semibold text-lg mb-2 transition-colors duration-300 group-hover:text-primary">
                {feature.title}
              </h3>
              <p className="text-sm text-muted">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center mt-12">
        <p className="text-muted mb-4">Not enrolled yet?</p>
        <Button asChild>
          <Link href="/admissions#enroll">
            Apply Now
            <ArrowRight className="w-4 h-4" />
          </Link>
        </Button>
      </div>
    </>
  );
}

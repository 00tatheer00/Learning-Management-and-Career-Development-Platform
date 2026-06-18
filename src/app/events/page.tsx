import { Calendar, MapPin, Clock } from "lucide-react";
import { PageHero } from "@/components/shared/page-hero";
import { BreadcrumbSchema } from "@/components/seo/json-ld";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createMetadata } from "@/lib/seo/metadata";
import { SITE_CONFIG } from "@/lib/constants";

export const metadata = createMetadata({
  title: "Events",
  description:
    "Upcoming workshops, webinars, hackathons, and networking events at Emerging Edge School of Technology.",
  path: "/events",
});

const events = [
  {
    title: "Web Development Bootcamp Preview",
    date: "July 15, 2026",
    time: "2:00 PM EST",
    location: "Online — Zoom",
    type: "Webinar",
    description:
      "Free preview session covering our Web Development program curriculum, mentorship model, and career outcomes.",
  },
  {
    title: "Flutter App Building Workshop",
    date: "July 22, 2026",
    time: "10:00 AM EST",
    location: "Online — Live",
    type: "Workshop",
    description:
      "Hands-on workshop where you'll build a complete Flutter app in 3 hours with expert guidance.",
  },
  {
    title: "Tech Career Fair 2026",
    date: "August 5, 2026",
    time: "11:00 AM - 5:00 PM EST",
    location: "Hybrid — Online & NYC",
    type: "Career Fair",
    description:
      "Connect with 20+ hiring partners actively recruiting EEST graduates and current students.",
  },
  {
    title: "AI in Production Hackathon",
    date: "August 20-22, 2026",
    time: "48 Hours",
    location: "Online",
    type: "Hackathon",
    description:
      "Build AI-powered applications in teams. Prizes include scholarships and internship opportunities.",
  },
];

export default function EventsPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: SITE_CONFIG.url },
          { name: "Events", url: `${SITE_CONFIG.url}/events` },
        ]}
      />
      <PageHero
        label="Events"
        title="Workshops, Webinars & More"
        description="Join our community events to learn, network, and accelerate your tech career."
      />

      <section className="section-padding pt-0">
        <div className="container-custom max-w-4xl">
          <div className="space-y-6">
            {events.map((event) => (
              <Card key={event.title} className="hover:border-primary/30 transition-all">
                <CardContent className="p-6 lg:p-8">
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <Badge>{event.type}</Badge>
                    <span className="text-sm text-muted flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-primary" />
                      {event.date}
                    </span>
                    <span className="text-sm text-muted flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-primary" />
                      {event.time}
                    </span>
                    <span className="text-sm text-muted flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-primary" />
                      {event.location}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold mb-2">{event.title}</h2>
                  <p className="text-muted mb-4 leading-relaxed">{event.description}</p>
                  <Button variant="secondary" size="sm">
                    Register Interest
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

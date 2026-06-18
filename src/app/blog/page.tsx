import Link from "next/link";
import { ArrowRight, Calendar } from "lucide-react";
import { PageHero } from "@/components/shared/page-hero";
import { BreadcrumbSchema } from "@/components/seo/json-ld";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { createMetadata } from "@/lib/seo/metadata";
import { SITE_CONFIG } from "@/lib/constants";

export const metadata = createMetadata({
  title: "Blog",
  description:
    "Insights, tutorials, and industry news from Emerging Edge School of Technology.",
  path: "/blog",
});

const blogPosts = [
  {
    slug: "future-of-web-development-2026",
    title: "The Future of Web Development in 2026",
    excerpt:
      "Explore the technologies shaping modern web development — from server components to AI-assisted coding.",
    category: "Web Development",
    date: "June 10, 2026",
    readTime: "8 min read",
  },
  {
    slug: "flutter-vs-react-native",
    title: "Flutter vs React Native: A Comprehensive Comparison",
    excerpt:
      "An in-depth analysis of both cross-platform frameworks to help you choose the right path.",
    category: "Mobile Development",
    date: "June 5, 2026",
    readTime: "12 min read",
  },
  {
    slug: "building-portfolio-that-gets-hired",
    title: "How to Build a Portfolio That Gets You Hired",
    excerpt:
      "Expert tips on creating a developer portfolio that stands out to recruiters and hiring managers.",
    category: "Career",
    date: "May 28, 2026",
    readTime: "6 min read",
  },
  {
    slug: "ai-in-education",
    title: "How AI is Transforming Tech Education",
    excerpt:
      "Discover how artificial intelligence is personalizing learning and accelerating skill development.",
    category: "AI",
    date: "May 20, 2026",
    readTime: "10 min read",
  },
];

export default function BlogPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: SITE_CONFIG.url },
          { name: "Blog", url: `${SITE_CONFIG.url}/blog` },
        ]}
      />
      <PageHero
        label="Blog"
        title="Insights & Resources"
        description="Stay updated with the latest in technology education, career advice, and industry trends."
      />

      <section className="section-padding pt-0">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {blogPosts.map((post) => (
              <Card
                key={post.slug}
                className="group hover:border-primary/30 transition-all duration-300"
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Badge variant="secondary">{post.category}</Badge>
                    <span className="text-xs text-muted flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {post.date}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-muted text-sm mb-4 leading-relaxed">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted">{post.readTime}</span>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="text-sm text-primary flex items-center gap-1 hover:gap-2 transition-all"
                    >
                      Read More
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

import type { Testimonial } from "@/types";

export const testimonials: Testimonial[] = [
  {
    id: "1",
    name: "Jordan Mitchell",
    role: "Software Engineer at Google",
    program: "Web Development",
    content:
      "EEST transformed my career. The hands-on projects and mentorship prepared me for real-world engineering challenges. I landed my dream job within 3 months of completing the Full Stack level.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
    type: "text",
  },
  {
    id: "2",
    name: "Aisha Rahman",
    role: "Mobile Developer at Spotify",
    program: "Flutter Development",
    content:
      "The Flutter program is incredibly comprehensive. From foundations to publishing apps, every level built on the previous one. The trainers are industry experts who genuinely care about your success.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    type: "video",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  },
  {
    id: "3",
    name: "Michael Torres",
    role: "Full Stack Developer at Stripe",
    program: "Web Development",
    content:
      "What sets EEST apart is the registration-based learning model. You progress at your own pace, level by level, with continuous support. My portfolio now speaks for itself.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=face",
    type: "text",
  },
  {
    id: "4",
    name: "Sophie Laurent",
    role: "Product Designer at Figma",
    program: "Web Development",
    content:
      "Even as a designer, the technical skills I gained at EEST made me a better collaborator. The community support and career guidance were invaluable throughout my journey.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face",
    type: "text",
  },
];

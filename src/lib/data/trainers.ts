import type { Trainer } from "@/types";

export const trainers: Trainer[] = [
  {
    id: "trainer-tatheer",
    name: "S Tatheer Hussain",
    designation: "Web Development Trainer",
    expertise: ["HTML", "CSS", "JavaScript", "React", "Node.js"],
    experience: "4+ years",
    bio: "Web Development trainer at EEST. Teaches students from basics to building real websites and full-stack projects.",
    image: "/trainers/tatheer-hussain.png",
    social: {
      linkedin: "https://linkedin.com",
      github: "https://github.com",
    },
  },
  {
    id: "trainer-talha",
    name: "Talha Iqbal",
    designation: "Mobile App Development Trainer",
    expertise: ["Flutter", "Dart", "Firebase", "Mobile UI"],
    experience: "4+ years",
    bio: "Mobile app development trainer at EEST. Helps students build and publish Android & iOS apps with Flutter.",
    image: "/trainers/talha-iqbal.png",
    social: {
      linkedin: "https://linkedin.com",
      github: "https://github.com",
    },
  },
];

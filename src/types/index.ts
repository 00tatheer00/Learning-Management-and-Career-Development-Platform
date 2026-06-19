export interface ProgramLevel {
  name: string;
  duration: string;
  description: string;
}

export interface Program {
  id: string;
  slug: string;
  title: string;
  category: "active" | "future";
  description: string;
  duration: string;
  level: string;
  outcomes: string[];
  levels: ProgramLevel[];
  image?: string;
}

export interface Trainer {
  id: string;
  name: string;
  designation: string;
  expertise: string[];
  experience: string;
  bio: string;
  image: string;
  /** CSS object-position for cropping (e.g. "center 20%") */
  imagePosition?: string;
  social: {
    linkedin?: string;
    twitter?: string;
    github?: string;
  };
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  program: string;
  content: string;
  rating: number;
  image: string;
  type: "text" | "video";
  videoUrl?: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
}

export interface Stat {
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
}

export interface EnrollmentPayload {
  fullName: string;
  fatherName: string;
  institution: string;
  classSemester: string;
  cnic: string;
  email: string;
  whatsapp: string;
  fieldOfStudy: string;
  program: string;
  level: string;
  learningMode: string;
  hasLaptop: "yes" | "no";
  internetAvailable: "yes" | "no";
  confirmInfoCorrect: boolean;
  agreeToPolicies: boolean;
  paymentScreenshot?: string;
}

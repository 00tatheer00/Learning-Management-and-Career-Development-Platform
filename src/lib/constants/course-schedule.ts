export interface ProgramClassSchedule {
  programLabel: string;
  headline: string;
  subline: string;
  daysLabel: string;
  startDateLabel: string;
  isCompleted?: boolean;
  isComingSoon?: boolean;
}

export function getStudentModuleSchedule(
  programSlug?: string | null,
  userLevel?: string | null
): ProgramClassSchedule {
  const slug = (programSlug || "web-development").toLowerCase().trim();
  const lvl = (userLevel || "").toLowerCase().trim();

  // 1. WEB DEVELOPMENT
  if (slug.includes("web")) {
    // Module 1 (HTML & CSS)
    if (
      lvl.includes("html") ||
      lvl.includes("css") ||
      lvl === "1" ||
      lvl.includes("level 1") ||
      lvl.includes("module 1")
    ) {
      return {
        programLabel: "Web Development",
        headline: "Module 1 completed Alhamdulillah",
        subline:
          "Module 1 (HTML & CSS) has completed. Module 2 recordings and Module 3 live sessions are available in the portal.",
        daysLabel: "Monday · Tuesday · Wednesday",
        startDateLabel: "Completed",
        isCompleted: true,
      };
    }

    // Module 2 (JavaScript)
    if (
      lvl.includes("javascript") ||
      lvl.includes("js") ||
      lvl === "2" ||
      lvl.includes("level 2") ||
      lvl.includes("module 2")
    ) {
      return {
        programLabel: "Web Development",
        headline: "Module 2 completed Alhamdulillah",
        subline:
          "Module 2 (JavaScript) has completed. Module 3 (React) is now live! Check portal for recordings and class links.",
        daysLabel: "Monday · Tuesday · Wednesday",
        startDateLabel: "Completed",
        isCompleted: true,
      };
    }

    // Module 3 (React)
    if (
      lvl.includes("react") ||
      lvl === "3" ||
      lvl.includes("level 3") ||
      lvl.includes("module 3")
    ) {
      return {
        programLabel: "Web Development",
        headline: "Module 3 (React) is Live Now",
        subline:
          "Live classes on Mon, Tue, and Wed at 10:00 PM (PKT). Check the portal for the exact time and join link.",
        daysLabel: "Monday · Tuesday · Wednesday",
        startDateLabel: "Live Now · 10:00 PM",
      };
    }

    // Module 4 (Backend + Database)
    if (
      lvl.includes("backend") ||
      lvl.includes("database") ||
      lvl === "4" ||
      lvl.includes("level 4") ||
      lvl.includes("module 4")
    ) {
      return {
        programLabel: "Web Development",
        headline: "Coming Soon",
        subline:
          "Classes for this advanced module will be announced after Module 3. Check your portal notifications for updates.",
        daysLabel: "Schedule to be announced",
        startDateLabel: "Coming Soon",
        isComingSoon: true,
      };
    }

    // Default fallback for Web Development (React 3rd module active batch)
    return {
      programLabel: "Web Development",
      headline: "Module 3 (React) is Live Now",
      subline:
        "Live classes on Mon, Tue, and Wed at 10:00 PM (PKT). Check the portal for the exact time and join link.",
      daysLabel: "Monday · Tuesday · Wednesday",
      startDateLabel: "Live Now · 10:00 PM",
    };
  }

  // 2. APP DEVELOPMENT
  if (slug.includes("app") || slug.includes("flutter")) {
    // Module 1 (Dart & OOP)
    if (
      lvl.includes("dart") ||
      lvl.includes("oop") ||
      lvl === "1" ||
      lvl.includes("level 1") ||
      lvl.includes("module 1")
    ) {
      return {
        programLabel: "App Development",
        headline: "Module 1 completed Alhamdulillah",
        subline:
          "Module 1 (Dart & OOP) has completed. Module 2 recordings and Module 3 live sessions are available in the portal.",
        daysLabel: "Friday · Saturday · Sunday",
        startDateLabel: "Completed",
        isCompleted: true,
      };
    }

    // Module 2 (Flutter Frontend)
    if (
      lvl.includes("flutter") ||
      lvl.includes("frontend") ||
      lvl === "2" ||
      lvl.includes("level 2") ||
      lvl.includes("module 2")
    ) {
      return {
        programLabel: "App Development",
        headline: "Module 2 completed Alhamdulillah",
        subline:
          "Module 2 (Flutter Frontend) has completed. Module 3 (Firebase & APIs) is now live! Check portal for recordings and class links.",
        daysLabel: "Friday · Saturday · Sunday",
        startDateLabel: "Completed",
        isCompleted: true,
      };
    }

    // Module 3 (Firebase & APIs)
    if (
      lvl.includes("firebase") ||
      lvl.includes("api") ||
      lvl === "3" ||
      lvl.includes("level 3") ||
      lvl.includes("module 3")
    ) {
      return {
        programLabel: "App Development",
        headline: "Module 3 (Firebase & APIs) is Live Now",
        subline:
          "Live classes on Fri, Sat, and Sun at 8:00 PM (PKT). Check the portal for class timing and live session links.",
        daysLabel: "Friday · Saturday · Sunday",
        startDateLabel: "Live Now · 8:00 PM",
      };
    }

    // Default fallback for App Development
    return {
      programLabel: "App Development",
      headline: "Module 3 (Firebase & APIs) is Live Now",
      subline:
        "Live classes on Fri, Sat, and Sun at 8:00 PM (PKT). Check the portal for class timing and live session links.",
      daysLabel: "Friday · Saturday · Sunday",
      startDateLabel: "Live Now · 8:00 PM",
    };
  }

  // 3. ARTIFICIAL INTELLIGENCE
  if (slug.includes("ai") || slug.includes("artificial") || slug.includes("python")) {
    // Module 1 (AI Fundamentals / Python)
    if (
      lvl.includes("launchpad") ||
      lvl.includes("fund") ||
      lvl.includes("python") ||
      lvl === "1" ||
      lvl.includes("level 1") ||
      lvl.includes("module 1")
    ) {
      return {
        programLabel: "Artificial Intelligence",
        headline: "Module 1 completed Alhamdulillah",
        subline:
          "Module 1 (AI Launchpad) has completed. Module 2 recordings and Module 3 live sessions are available in the portal.",
        daysLabel: "Friday · Saturday · Sunday",
        startDateLabel: "Completed",
        isCompleted: true,
      };
    }

    // Module 2 (Data to ML Engineer)
    if (
      lvl.includes("data") ||
      lvl.includes("ml") ||
      lvl === "2" ||
      lvl.includes("level 2") ||
      lvl.includes("module 2")
    ) {
      return {
        programLabel: "Artificial Intelligence",
        headline: "Module 2 completed Alhamdulillah",
        subline:
          "Module 2 (Data to ML Engineer) has completed. Module 3 (Generative AI & LLM Agents) is now live! Check portal for recordings and class links.",
        daysLabel: "Friday · Saturday · Sunday",
        startDateLabel: "Completed",
        isCompleted: true,
      };
    }

    // Module 3 (Generative AI & LLM Agent Engineer)
    return {
      programLabel: "Artificial Intelligence",
      headline: "Module 3 (Generative AI & LLM Agents) is Live Now",
      subline:
        "Live classes on Fri, Sat, and Sun from 10:00 PM to 11:30 PM (PKT). Check your student portal for class timing and live session links.",
      daysLabel: "Friday · Saturday · Sunday",
      startDateLabel: "Live Now · 10:00 PM",
    };
  }

  // 4. DIGITAL MARKETING WITH AI
  if (slug.includes("marketing") || slug.includes("digital") || slug.includes("seo")) {
    // Module 1 (Digital Marketing & Social Media)
    if (
      lvl.includes("social") ||
      lvl.includes("marketing") ||
      lvl.includes("smm") ||
      lvl === "1" ||
      lvl.includes("level 1") ||
      lvl.includes("module 1")
    ) {
      return {
        programLabel: "Digital Marketing with AI",
        headline: "Module 1 completed Alhamdulillah",
        subline:
          "Module 1 (SMM & Content) has completed. Module 2 recordings and Module 3 live sessions are available in the portal.",
        daysLabel: "Monday · Tuesday · Wednesday",
        startDateLabel: "Completed",
        isCompleted: true,
      };
    }

    // Module 2 (SEO)
    if (
      lvl.includes("seo") ||
      lvl.includes("search") ||
      lvl === "2" ||
      lvl.includes("level 2") ||
      lvl.includes("module 2")
    ) {
      return {
        programLabel: "Digital Marketing with AI",
        headline: "Module 2 completed Alhamdulillah",
        subline:
          "Module 2 (SEO Audit & Optimization) has completed. Module 3 (Client Pitching & AI) is now live! Check portal for recordings and class links.",
        daysLabel: "Monday · Tuesday · Wednesday",
        startDateLabel: "Completed",
        isCompleted: true,
      };
    }

    // Module 3 (Client Pitching & AI)
    return {
      programLabel: "Digital Marketing with AI",
      headline: "Module 3 (Client Pitching & AI) is Live Now",
      subline:
        "Live classes on Mon, Tue, and Wed from 9:00 PM to 10:00 PM (PKT). Check your student portal for class timing and live session links.",
      daysLabel: "Monday · Tuesday · Wednesday",
      startDateLabel: "Live Now · 9:00 PM",
    };
  }

  // 5. ECOMMERCE
  if (slug.includes("ecommerce") || slug.includes("e-commerce") || slug.includes("store")) {
    // Module 1 (Ecommerce Fundamentals)
    if (
      lvl.includes("fundamental") ||
      lvl === "1" ||
      lvl.includes("level 1") ||
      lvl.includes("module 1")
    ) {
      return {
        programLabel: "Ecommerce",
        headline: "Module 1 (Ecommerce Fundamentals) is Live Now",
        subline:
          "Check the portal for class timing and live session links.",
        daysLabel: "Schedule in Portal",
        startDateLabel: "Live Now",
      };
    }

    // Default fallback for Ecommerce
    return {
      programLabel: "Ecommerce",
      headline: "Classes Starting Soon",
      subline:
        "Check your student portal for class schedule and live session links.",
      daysLabel: "Schedule in Portal",
      startDateLabel: "Starting Soon",
    };
  }

  // 6. GRAPHICS DESIGNING
  if (slug.includes("graphic") || slug.includes("designing")) {
    // Module 1 (Design Fundamentals & Tools)
    if (
      lvl.includes("fundamental") ||
      lvl.includes("design") ||
      lvl.includes("tool") ||
      lvl === "1" ||
      lvl.includes("level 1") ||
      lvl.includes("module 1")
    ) {
      return {
        programLabel: "Graphics Designing",
        headline: "Module 1 (Design Fundamentals & Tools) is Live Now",
        subline:
          "Check the portal for class timing and live session links.",
        daysLabel: "Schedule in Portal",
        startDateLabel: "Live Now",
      };
    }

    // Default fallback for Graphics Designing
    return {
      programLabel: "Graphics Designing",
      headline: "Classes Starting Soon",
      subline:
        "Check your student portal for class schedule and live session links.",
      daysLabel: "Schedule in Portal",
      startDateLabel: "Starting Soon",
    };
  }

  return {
    programLabel: "Emerging Edge Course",
    headline: "Classes Starting Soon",
    subline: "Check portal notifications for live session schedules.",
    daysLabel: "Weekly Live Sessions",
    startDateLabel: "Starting Soon",
  };
}

export function getProgramClassSchedule(
  programSlug?: string | null,
  userLevel?: string | null
): ProgramClassSchedule {
  return getStudentModuleSchedule(programSlug, userLevel);
}


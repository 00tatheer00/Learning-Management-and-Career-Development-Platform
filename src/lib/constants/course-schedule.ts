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
          "Module 1 (HTML & CSS) has completed. Module 2 (JavaScript) starts on 10th August at 10:00 PM.",
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
        headline: "Starting 2nd module JavaScript, 10th August, 10:00 PM",
        subline:
          "Live classes on Mon, Tue, and Wed at 10:00 PM (PKT). Check the portal for the exact time and join link.",
        daysLabel: "Monday · Tuesday · Wednesday",
        startDateLabel: "10th August, 10:00 PM",
      };
    }

    // Module 3 (React) & Module 4 (Backend + Database)
    if (
      lvl.includes("react") ||
      lvl.includes("backend") ||
      lvl.includes("database") ||
      lvl === "3" ||
      lvl === "4" ||
      lvl.includes("level 3") ||
      lvl.includes("level 4") ||
      lvl.includes("module 3") ||
      lvl.includes("module 4")
    ) {
      return {
        programLabel: "Web Development",
        headline: "Coming Soon",
        subline:
          "Classes for this advanced module will be announced soon. Check your portal notifications for updates.",
        daysLabel: "Schedule to be announced",
        startDateLabel: "Coming Soon",
        isComingSoon: true,
      };
    }

    // Default fallback for Web Development (JavaScript 2nd module active batch)
    return {
      programLabel: "Web Development",
      headline: "Starting 2nd module JavaScript, 10th August, 10:00 PM",
      subline:
        "Live classes on Mon, Tue, and Wed at 10:00 PM (PKT). Check the portal for the exact time and join link.",
      daysLabel: "Monday · Tuesday · Wednesday",
      startDateLabel: "10th August, 10:00 PM",
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
          "Module 1 (Dart & OOP) has completed. Module 2 (Flutter Frontend) starts on 7th August at 8:00 PM.",
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
        headline: "Classes start from 7th August, 8:00 PM",
        subline:
          "Live classes on Fri, Sat, and Sun at 8:00 PM (PKT). Check the portal for class timing and live session links.",
        daysLabel: "Friday · Saturday · Sunday",
        startDateLabel: "7th August, 8:00 PM",
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
        headline: "Coming Soon",
        subline:
          "Classes for Module 3 (Firebase & APIs) will start after Module 2 completion. Stay tuned!",
        daysLabel: "Schedule to be announced",
        startDateLabel: "Coming Soon",
        isComingSoon: true,
      };
    }

    // Default fallback for App Development
    return {
      programLabel: "App Development",
      headline: "Classes start from 7th August, 8:00 PM",
      subline:
        "Live classes on Fri, Sat, and Sun at 8:00 PM (PKT). Check the portal for class timing and live session links.",
      daysLabel: "Friday · Saturday · Sunday",
      startDateLabel: "7th August, 8:00 PM",
    };
  }

  // 3. ARTIFICIAL INTELLIGENCE
  if (slug.includes("ai") || slug.includes("artificial") || slug.includes("python")) {
    // Module 1 (AI Fundamentals / Python)
    if (
      lvl.includes("fund") ||
      lvl.includes("python") ||
      lvl.includes("ai") ||
      lvl === "1" ||
      lvl === "" ||
      lvl.includes("level 1") ||
      lvl.includes("module 1")
    ) {
      return {
        programLabel: "Artificial Intelligence",
        headline: "Classes start from Friday, 14th August, 10:00 PM",
        subline:
          "Live classes on Fri, Sat, and Sun from 10:00 PM to 11:30 PM (PKT). Check your student portal for class timing and live session links.",
        daysLabel: "Friday · Saturday · Sunday",
        startDateLabel: "Friday, 14th August, 10:00 PM",
      };
    }

    // Module 2 & Module 3
    return {
      programLabel: "Artificial Intelligence",
      headline: "Coming Soon",
      subline:
        "Classes for this advanced AI module will be announced soon. Check your portal notifications for updates.",
      daysLabel: "Schedule to be announced",
      startDateLabel: "Coming Soon",
      isComingSoon: true,
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


/** Student portal copy — alerts, toasts, popups & announcements */

export const STUDENT_UR = {
  celebration: {
    badge: "Enrollment Approved",
    title: (name: string) => `Congratulations, ${name}!`,
    body: (moduleName?: string, courseTitle?: string) =>
      moduleName && courseTitle
        ? `Your registration for ${moduleName} (${courseTitle}) is approved. Your student portal is ready — explore live classes, assignments, and your course roadmap.`
        : "Welcome to Emerging Edge School. Your student portal is ready — explore your course, live classes, and assignments.",
    button: "Enter Portal",
  },

  schedule: {
    web: {
      programLabel: "Web Development",
      headline: "Classes start 6 July 2026.",
      daysLabel: "Monday · Tuesday · Wednesday",
      startDateLabel: "Starting 6 July 2026",
      subline:
        "Live classes on Mon, Tue, and Wed. Check the portal for the exact time and join link.",
    },
    app: {
      programLabel: "App Development",
      headline: "Classes started 3 July 2026.",
      daysLabel: "Friday · Saturday · Sunday",
      startDateLabel: "Started 3 July 2026",
      subline:
        "Live classes on Fri, Sat, and Sun. Class timing and links are on the portal.",
    },
    marketing: {
      programLabel: "Digital Marketing with AI",
      headline: "Classes start 15 September 2026.",
      daysLabel: "Tuesday · Thursday · Saturday",
      startDateLabel: "Starting 15 September 2026",
      subline:
        "Live classes on Tue, Thu, and Sat. Check the portal for the exact time and join link.",
    },
    bannerTitle: (program: string) => `${program} — Class Schedule`,
  },

  joinClass: {
    cannotJoin: "Cannot join class",
    moduleNotStarted:
      "This live class is scheduled for another batch or module. Please check your module schedule on the portal.",
    tryAgain: "Try again or ask your trainer for the link.",
    enteringPresent: "Joining class — marked present",
    enteringLate: "Joining class — marked late",
    openingPresent: "Opening class — marked present",
    openingLate: "Opening class — marked late",
    linkNotAvailable: "Class link is not available yet",
    error: "Could not join class. Please try again.",
  },

  toasts: {
    assignmentWriteSomething: "Write something before submitting.",
    assignmentSubmitted: "Assignment submitted!",
    assignmentSubmittedDesc: "Your trainer will review it soon.",
    assignmentFailed: "Could not submit.",
    assignmentError: "Something went wrong. Please try again.",
    loginFailed: "Login failed",
    wrongCredentials: "Wrong email or password. Please try again.",
    welcomeBack: "Welcome back!",
    firstLogin: "Congratulations! Your portal is ready.",
    redirecting: "Taking you to your portal...",
    serverError: "Server error. Please try again in a moment.",
    networkError: "Something went wrong. Check your internet and try again.",
  },

  alerts: {
    sessionReplacedTitle: "Logged out on this device",
    sessionReplaced:
      "This account was opened on another phone or computer. For security, only one device can be logged in at a time. Sign in again if this is your device.",
    oneDevice:
      "Student accounts work on one device at a time. Logging in elsewhere will sign you out here.",
  },

  singleSession: {
    loggedOut: "Signed out",
    otherDevice:
      "Your account was opened on another device. Only one device can be logged in at a time.",
  },

  api: {
    unauthorized: "Unauthorized — please sign in again",
    classNotFound: "Class not found",
    linkNotAdded: "Your trainer has not added the class link yet. Check back soon.",
    assignmentMinWords: "Please write at least a few words",
    assignmentSuccess: "Submitted successfully",
  },
} as const;

export function getStudentClassSchedule(programSlug?: string | null) {
  if (programSlug === "app-development") return STUDENT_UR.schedule.app;
  if (programSlug === "digital-marketing") return STUDENT_UR.schedule.marketing;
  return STUDENT_UR.schedule.web;
}

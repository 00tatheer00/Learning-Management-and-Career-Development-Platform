/** Roman Urdu — student alerts, toasts, popups & main announcements only */

export const STUDENT_UR = {
  celebration: {
    badge: "Registration Manzoor",
    title: (name: string) => `Mubarak ho, ${name}! 🎉`,
    body: "Emerging Edge School mein khush amdeed. Aapka student portal tayyar hai — course, live classes aur assignments dekhein.",
    button: "Portal Mein Jayein",
  },

  whatsappModal: {
    title: "Class ka WhatsApp group join karein",
    body: (groupName: string) =>
      `Abhi ${groupName} join karein — live class links, recorded lectures aur assignment updates yahan milte hain.`,
    bullets: [
      "Har class se pehle live class link",
      "Recorded videos group mein share hoti hain",
      "Trainer se seedha rabta",
    ],
    joinButton: "Ab Join Karein — Group Kholein",
    later: "Baad mein",
  },

  whatsappCard: {
    joinTitle: (groupName: string) => `${groupName} Join Karein`,
    bannerDesc:
      "Aapki registration manzoor hai. Ab class WhatsApp group join karein — live links, videos aur updates ke liye.",
    pageDesc:
      "Saari class updates, live links, recorded lectures aur assignments hamare official WhatsApp group mein share hote hain.",
    joinButton: "Ab Join Karein — Group Kholein",
    bullets: [
      "Har class se pehle live class link group mein aati hai",
      "Recorded lecture videos group mein share hoti hain",
      "Trainer se seedha sawal pooch sakte hain",
      "Assignment reminders aur updates yahan milte hain",
    ],
    footer: "Upar wale button se WhatsApp khulega — group join kar lein.",
  },

  schedule: {
    web: {
      programLabel: "Web Development",
      headline: "Classes 6 July 2026 se shuru ho rahi hain, InshAllah.",
      daysLabel: "Somwar · Mangal · Budh",
      startDateLabel: "6 July 2026 se shuru",
      subline:
        "Live classes Som, Mangal aur Budh ko. Exact time jald bataya jayega — updates ke liye WhatsApp group join karein.",
    },
    app: {
      programLabel: "App Development",
      headline: "Classes 3 July 2026 se shuru ho chuki hain, Alhamdulillah.",
      daysLabel: "Jumma · Hafta · Itwaar",
      startDateLabel: "3 July 2026 se shuru",
      subline:
        "Live classes Jumma, Hafta aur Itwaar ko. Class timing aur links ke liye WhatsApp group dekhein.",
    },
    bannerTitle: (program: string) => `${program} — Class Schedule`,
  },

  joinClass: {
    cannotJoin: "Class join nahi ho sakti",
    moduleNotStarted:
      "Abhi yeh class Module 1 students ke liye hai. Aapka module agle mahine se shuru hoga — WhatsApp par update milega.",
    tryAgain: "Dubara try karein ya trainer se link check karein.",
    enteringPresent: "Class mein ja rahe hain — hazir",
    enteringLate: "Class mein ja rahe hain — late",
    openingPresent: "Class khul rahi hai — hazir",
    openingLate: "Class khul rahi hai — late",
    linkNotAvailable: "Class link abhi available nahi",
    error: "Class join nahi ho saki. Dubara try karein.",
  },

  toasts: {
    assignmentWriteSomething: "Submit karne se pehle kuch likhein.",
    assignmentSubmitted: "Assignment submit ho gaya!",
    assignmentSubmittedDesc: "Trainer jald review karega.",
    assignmentFailed: "Submit nahi ho saka.",
    assignmentError: "Error aayi. Dubara try karein.",
    loginFailed: "Login nahi hua",
    wrongCredentials: "Email ya password galat hai. Dubara try karein.",
    welcomeBack: "Khush amdeed wapas!",
    redirecting: "Portal par le ja rahe hain...",
    serverError: "Server error. Thori der baad dubara try karein.",
    networkError: "Kuch masla hua. Internet check karein aur dubara try karein.",
  },

  alerts: {
    sessionReplacedTitle: "Is device se logout ho gaye",
    sessionReplaced:
      "Ye account doosre phone ya computer par khula hai. Security ke liye ek waqt mein sirf ek device login reh sakta hai. Agar ye aapka device hai to dubara sign in karein.",
    oneDevice:
      "Student account ek waqt mein sirf ek device par chalta hai. Doosri jagah login karne se pehla device logout ho jayega.",
  },

  singleSession: {
    loggedOut: "Logout ho gaye",
    otherDevice:
      "Aapka account doosre device par khula hai. Ek waqt mein sirf ek device login reh sakta hai.",
  },

  api: {
    unauthorized: "Ijazat nahi — dubara login karein",
    classNotFound: "Class nahi mili",
    linkNotAdded: "Trainer ne abhi class link nahi lagayi. Thori der baad dekhein.",
    assignmentMinWords: "Kam az kam kuch alfaaz likhein",
    assignmentSuccess: "Submit ho gaya",
  },
} as const;

export function getStudentClassSchedule(programSlug?: string | null) {
  if (programSlug === "app-development") return STUDENT_UR.schedule.app;
  return STUDENT_UR.schedule.web;
}

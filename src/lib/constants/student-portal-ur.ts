/** Roman Urdu — student portal UI, alerts, toasts, popups */

export const STUDENT_UR = {
  portalLabel: "Student Portal",
  hello: (name: string) => `Assalam o Alaikum, ${name} 👋`,
  welcome: (name: string) => `Khush amdeed, ${name}!`,
  website: "Website",
  logout: "Logout",

  nav: {
    home: { label: "Home", description: "Aapka main page" },
    course: { label: "Mera Course", description: "Videos aur lessons" },
    classes: { label: "Live Classes", description: "Online class join karein" },
    trainer: { label: "Mera Trainer", description: "Aapke course ka trainer" },
    assignments: { label: "Assignments", description: "Homework submit karein" },
    whatsapp: { label: "WhatsApp Group", description: "Class group se baat" },
    profile: { label: "Meri Profile", description: "Aapki details" },
    mainGroup: "Asaas",
    accountGroup: "Account",
  },

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

  dashboard: {
    eyebrow: "Student Portal",
    description: (course: string) => `${course} · classes, lessons aur trainer aapke program ke liye.`,
    joinLiveClass: "Live Class Join Karein",
    noClassLink: "Jab class schedule hogi tab link yahan dikhegi:",
    liveClassesLink: "Live Classes",
    stats: {
      videoLessons: "Video Lessons",
      assignments: "Assignments",
      liveClasses: "Live Classes",
      yourModule: "Aapka Module",
    },
    quickAccess: "Jaldi Access",
    watchLessons: { title: "Lessons Dekhein", desc: "Course videos aur materials" },
    submitHomework: { title: "Homework Submit", desc: "Assignments dekhein aur submit karein" },
    myTrainer: { title: "Mera Trainer", desc: "Aapke program ka trainer" },
    whatsappGroup: { title: "WhatsApp Group", desc: "Class group join karein" },
    needHelp: { title: "Madad Chahiye?", desc: "Humain message karein" },
  },

  classes: {
    title: "Live Classes",
    description: "Join Class dabayein — seedha Google Meet khul jayegi.",
    joinHint:
      "Jab trainer link laga de, Join Class dabayein aur seedha class mein chale jayein. Apna portal login kisi ko na dein.",
    emptyTitle: "Class link jald aayegi",
    trainer: "Trainer",
    linkSoon: "Link jald aayegi",
    linkSoonHint: "Trainer class se pehle Google Meet link laga dega.",
    joinClass: "Class Join Karein",
    joining: "Join ho rahe hain...",
    allClasses: "Saari classes",
    nextClass: "Agli Live Class",
    startsIn: "Shuru hone mein",
    startingNow: "Ab shuru ho rahi hai",
    trainerLabel: (name: string) => `Trainer: ${name}`,
  },

  joinClass: {
    cannotJoin: "Class join nahi ho sakti",
    tryAgain: "Dubara try karein ya trainer se link check karein.",
    enteringPresent: "Class mein ja rahe hain — hazir",
    enteringLate: "Class mein ja rahe hain — late",
    openingPresent: "Class khul rahi hai — hazir",
    openingLate: "Class khul rahi hai — late",
    linkNotAvailable: "Class link abhi available nahi",
    error: "Class join nahi ho saki. Dubara try karein.",
  },

  course: {
    title: "Mera Course",
    description: (title: string) => `${title} — aapke modules aur lessons`,
    syllabus: "Course Syllabus",
    currentModule: (module: string) =>
      `Aap ab is module par hain: ${module} · Module par click karein aur saare topics dekhein`,
    lessons: "Lessons & Materials",
    noLessons: "Abhi koi lesson nahi",
    noLessonsDesc: "Trainer jald videos add karega. Updates ke liye WhatsApp dekhein.",
    openWhatsapp: "WhatsApp Group Kholein",
    videoLesson: "Video Lesson",
    practiceLink: "Practice Link",
    document: "Document",
    open: "Kholein →",
    yourCurrentModule: "Aapka current module",
    whatYouLearn: "Kya seekhenge",
    backToModules: "Modules par wapas",
    certificateOnComplete: "Complete karne par certificate",
  },

  assignments: {
    title: "Assignments",
    description: "Task parhein, jawab likhein aur Submit dabayein. Trainer review karega.",
    due: "Last date",
    submitted: "Submit ho gaya",
    yourSubmission: "Aapka jawab:",
    trainerFeedback: "Trainer ka feedback:",
    yourAnswer: "Aapka Jawab",
    placeholder: "Yahan apna assignment ka jawab likhein...",
    submitting: "Submit ho raha hai...",
    submit: "Assignment Submit Karein",
    cancel: "Cancel",
    start: "Assignment Shuru Karein",
    writeSomething: "Submit karne se pehle kuch likhein.",
    submittedToast: "Assignment submit ho gaya!",
    submittedDesc: "Trainer jald review karega.",
    failed: "Submit nahi ho saka.",
    error: "Error aayi. Dubara try karein.",
    apiMinWords: "Kam az kam kuch alfaaz likhein",
    apiSuccess: "Submit ho gaya",
  },

  profile: {
    title: "Meri Profile",
    description: "Aapki account details. Kuch galat ho to admin se rabta karein.",
    studentAccount: "Student Account",
    fullName: "Poora Naam",
    email: "Email",
    phone: "Phone / WhatsApp",
    program: "Program Category",
    module: "Current Module",
    trainer: "Assigned Trainer",
    empty: "—",
  },

  trainer: {
    notAssigned: "Course assign nahi hua",
    notAssignedDesc: "Aapka course category abhi set nahi. Manzoori ke baad admin se rabta karein.",
    title: "Mera Trainer",
    description: (program: string) => `${program} ke trainers. Sirf aapke program ke trainers dikhte hain.`,
    allTrainers: (program: string) => `Saare ${program} Trainers`,
    yourTrainer: (cat: string) => `Aapka ${cat} Trainer`,
    experience: (exp: string) => `${exp} experience`,
  },

  whatsappPage: {
    title: "WhatsApp Group",
    description: "Official class group join karein — live links, videos aur announcements ke liye.",
  },

  roadmap: {
    title: "Aapka Module Roadmap",
    subtitle: (program: string, count: number, module?: string) =>
      module
        ? `${program} · ${count} modules · Aap ${module} par hain`
        : `${program} · ${count} modules`,
    youAreHere: "Aap yahan hain",
    done: "Ho gaya",
    nextUp: (name: string) =>
      `Agla: ${name} — jab ye module complete ho jaye to dubara register karein aur agla PKR 1,000 fee pay karein.`,
  },

  api: {
    unauthorized: "Ijazat nahi — dubara login karein",
    classNotFound: "Class nahi mili",
    linkNotAdded: "Trainer ne abhi class link nahi lagayi. Thori der baad dekhein.",
  },

  singleSession: {
    loggedOut: "Logout ho gaye",
    otherDevice:
      "Aapka account doosre device par khula hai. Ek waqt mein sirf ek device login reh sakta hai.",
  },

  login: {
    studentRole: "Student",
    studentDesc: "Course, classes aur assignments access karein",
    oneDevice:
      "Student account ek waqt mein sirf ek device par chalta hai. Doosri jagah login karne se pehla device logout ho jayega.",
    sessionReplacedTitle: "Is device se logout ho gaye",
    sessionReplaced:
      "Ye account doosre phone ya computer par khula hai. Security ke liye ek waqt mein sirf ek device login reh sakta hai. Agar ye aapka device hai to dubara sign in karein.",
    portalLogin: "Portal Login",
    chooseRole: "Pehle batayein aap kaun hain, phir sign in karein",
    email: "Email",
    password: "Password",
    passwordPlaceholder: "Password likhein",
    forgotPassword: "Password bhool gaye?",
    signingIn: "Sign in ho rahe hain...",
    signIn: "Sign In",
    notRegistered: "Register nahi hue?",
    registerHere: "Yahan register karein",
    backToWebsite: "← Website par wapas",
    welcomeBack: "Khush amdeed wapas!",
    redirecting: "Portal par le ja rahe hain...",
    wrongCredentials: "Email ya password galat hai. Dubara try karein.",
    loginFailed: "Login nahi hua",
    serverError: "Server error. Thori der baad dubara try karein.",
    networkError: "Kuch masla hua. Internet check karein aur dubara try karein.",
  },
} as const;

export function getStudentCountdownLabel(
  days: number,
  hours: number,
  minutes: number,
  isPast: boolean
): string {
  if (isPast) return STUDENT_UR.classes.startingNow;
  if (days > 0) return `${days} din, ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes} min`;
}

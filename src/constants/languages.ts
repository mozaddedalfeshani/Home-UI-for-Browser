export type Language = "en" | "bn";

export const LANGUAGES = {
  EN: "en" as const,
  BN: "bn" as const,
} as const;

export const LANGUAGE_NAMES = {
  [LANGUAGES.EN]: "English",
  [LANGUAGES.BN]: "বাংলা",
} as const;

export const TRANSLATIONS = {
  [LANGUAGES.EN]: {
    // Settings Menu
    settings: "Settings",
    theme: "Theme",
    light: "Light",
    dark: "Dark",
    system: "System",
    language: "Language",
    english: "English",
    bangla: "বাংলা",
    autoOrderTabs: "Auto Order Tabs",
    showClock: "Show Clock",
    showRightSidebar: "Show Right Sidebar",
    resizeShortcuts: "Resize Shortcuts",
    backgroundImage: "Background Image",
    clockSetting: "Clock Setting",
    clockPosition: "Clock Position",
    
    // Clock
    clock: "Clock",
    
    // Notepad
    notepad: "Notepad",
    notes: "Notes",
    projects: "Projects",
    clear: "Clear",
    writeYourNotesHere: "Write your notes here...",
    
    // Projects
    noProjectsYet: "No projects yet",
    createFirstProject: "Create your first project to start organizing your tasks",
    addProject: "Add Project",
    createNewProject: "Create New Project",
    projectTitle: "Project Title",
    enterProjectTitle: "Enter project title...",
    description: "Description (Optional)",
    enterProjectDescription: "Enter project description...",
    createProject: "Create Project",
    cancel: "Cancel",
    editProject: "Edit Project",
    saveChanges: "Save Changes",
    deleteProject: "Delete Project",
    areYouSureDeleteProject: "Are you sure you want to delete",
    thisActionCannotBeUndone: "This action cannot be undone.",
    
    // Todos
    addNewTodo: "Add a new todo...",
    noTodosYet: "No todos yet. Add one above!",
    addTodo: "Add Todo",
    low: "Low",
    medium: "Medium",
    high: "High",
    progress: "Progress",
    completed: "completed",
    
    // Tabs
    shortcuts: "Shortcuts",
    startByAddingFirstShortcut: "Start by adding your first shortcut.",
    addShortcut: "Add Shortcut",
    shortcutOptions: "Shortcut options",
    keyboardShortcut: "Keyboard Shortcut",
    recordShortcut: "Record Shortcut",
    pressKeys: "Press any key combination...",
    shortcutInUse: "This shortcut is already in use",
    clearShortcut: "Clear Shortcut",
    openInNewWindow: "Open in new window",
    setShortcutDescription: "Set a keyboard shortcut for quick access to this tab.",
    shortcut: "Shortcut",
    
    // Common
    loading: "Loading...",
    error: "Error",
    success: "Success",
    close: "Close",
    save: "Save",
    edit: "Edit",
    add: "Add",
    remove: "Remove",
    update: "Update",
    create: "Create",
    search: "Search",
    filter: "Filter",
    sort: "Sort",
    refresh: "Refresh",
    back: "Back",
    next: "Next",
    previous: "Previous",
    finish: "Finish",
    done: "Done",
    ok: "OK",
    yes: "Yes",
    no: "No",
  },
  
  [LANGUAGES.BN]: {
    // Settings Menu
    settings: "সেটিংস",
    theme: "থিম",
    light: "আলো",
    dark: "অন্ধকার",
    system: "সিস্টেম",
    language: "ভাষা",
    english: "English",
    bangla: "বাংলা",
    autoOrderTabs: "অটো অর্ডার ট্যাব",
    showClock: "ঘড়ি দেখান",
    showRightSidebar: "ডান সাইডবার দেখান",
    resizeShortcuts: "শর্টকাট রিসাইজ",
    backgroundImage: "ব্যাকগ্রাউন্ড ইমেজ",
    clockSetting: "ঘড়ি সেটিং",
    clockPosition: "ঘড়ির অবস্থান",
    
    // Clock
    clock: "ঘড়ি",
    
    // Notepad
    notepad: "নোটপ্যাড",
    notes: "নোট",
    projects: "প্রজেক্ট",
    clear: "মুছুন",
    writeYourNotesHere: "এখানে আপনার নোট লিখুন...",
    
    // Projects
    noProjectsYet: "এখনো কোনো প্রজেক্ট নেই",
    createFirstProject: "আপনার কাজগুলো সংগঠিত করতে প্রথম প্রজেক্ট তৈরি করুন",
    addProject: "প্রজেক্ট যোগ করুন",
    createNewProject: "নতুন প্রজেক্ট তৈরি করুন",
    projectTitle: "প্রজেক্টের শিরোনাম",
    enterProjectTitle: "প্রজেক্টের শিরোনাম লিখুন...",
    description: "বিবরণ (ঐচ্ছিক)",
    enterProjectDescription: "প্রজেক্টের বিবরণ লিখুন...",
    createProject: "প্রজেক্ট তৈরি করুন",
    cancel: "বাতিল",
    editProject: "প্রজেক্ট সম্পাদনা",
    saveChanges: "পরিবর্তন সংরক্ষণ",
    deleteProject: "প্রজেক্ট মুছুন",
    areYouSureDeleteProject: "আপনি কি নিশ্চিত যে আপনি মুছতে চান",
    thisActionCannotBeUndone: "এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।",
    
    // Todos
    addNewTodo: "নতুন টুডু যোগ করুন...",
    noTodosYet: "এখনো কোনো টুডু নেই। উপরে একটি যোগ করুন!",
    addTodo: "টুডু যোগ করুন",
    low: "নিম্ন",
    medium: "মধ্যম",
    high: "উচ্চ",
    progress: "অগ্রগতি",
    completed: "সম্পন্ন",
    
    // Tabs
    shortcuts: "শর্টকাট",
    startByAddingFirstShortcut: "আপনার প্রথম শর্টকাট যোগ করে শুরু করুন।",
    addShortcut: "শর্টকাট যোগ করুন",
    shortcutOptions: "শর্টকাট অপশন",
    keyboardShortcut: "কীবোর্ড শর্টকাট",
    recordShortcut: "শর্টকাট রেকর্ড করুন",
    pressKeys: "যেকোনো কী কম্বিনেশন চাপুন...",
    shortcutInUse: "এই শর্টকাটটি ইতিমধ্যে ব্যবহৃত হচ্ছে",
    clearShortcut: "শর্টকাট মুছুন",
    openInNewWindow: "নতুন উইন্ডোতে খুলুন",
    setShortcutDescription: "এই ট্যাবে দ্রুত অ্যাক্সেসের জন্য একটি কীবোর্ড শর্টকাট সেট করুন।",
    shortcut: "শর্টকাট",
    
    // Common
    loading: "লোড হচ্ছে...",
    error: "ত্রুটি",
    success: "সফল",
    close: "বন্ধ",
    save: "সংরক্ষণ",
    edit: "সম্পাদনা",
    add: "যোগ",
    remove: "অপসারণ",
    update: "আপডেট",
    create: "তৈরি",
    search: "খুঁজুন",
    filter: "ফিল্টার",
    sort: "সাজান",
    refresh: "রিফ্রেশ",
    back: "পেছনে",
    next: "পরবর্তী",
    previous: "পূর্ববর্তী",
    finish: "শেষ",
    done: "সম্পন্ন",
    ok: "ঠিক আছে",
    yes: "হ্যাঁ",
    no: "না",
  },
} as const;

export const getTranslation = (language: Language, key: string): string => {
  return TRANSLATIONS[language][key as keyof typeof TRANSLATIONS[typeof language]] || key;
};

export const useTranslation = (language: Language) => {
  return (key: string) => getTranslation(language, key);
};

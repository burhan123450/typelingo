/**
 * Website interface text in every UI language.
 * Urdu and Arabic text should be reviewed by a native speaker.
 * Use {name} style placeholders together with the fmt() helper below.
 */
export interface UIStrings {
  tagline: string;
  navPractice: string;
  navLessons: string;
  navDashboard: string;
  uiLanguage: string;
  toggleTheme: string;
  signIn: string;
  signOut: string;
  loading: string;

  // Footer
  languageTest: string;
  about: string;
  privacy: string;
  terms: string;
  contact: string;
  rightsReserved: string;

  // Typing test
  mode30s: string;
  mode60s: string;
  mode120s: string;
  modeWeakKeys: string;
  sentences: string;
  words: string;
  keyboardToggle: string;
  restart: string;
  rtlActive: string;
  keyboardLayout: string;
  wpm: string;
  accuracy: string;
  timeRemaining: string;
  timeElapsed: string;
  consistency: string;
  startTypingPrompt: string;
  wrongKeyHint: string;
  testCompleted: string;
  tryAgain: string;
  practiceWeakKeys: string;
  rawWpm: string;
  correctChars: string;
  mistakes: string;
  mostMissed: string;
  noMistakes: string;
  speedChart: string;
  lessonPassed: string;
  lessonFailed: string;

  // Lessons
  lessonsTitle: string;
  lessonsSubtitle: string;
  lessonLabel: string;
  lessonLocked: string;
  lessonCompleted: string;
  lessonUnlockHint: string;
  readyToStart: string;
  startLesson: string;
  practiceAgain: string;
  backToLessons: string;
  needs90: string;
  best: string;
  space: string;

  // Dashboard
  dashboardTitle: string;
  dashboardSubtitle: string;
  allLanguages: string;
  dailyGoalTitle: string;
  minutes: string;
  tests: string;
  minutesPerDay: string;
  testsPerDay: string;
  saveGoal: string;
  goalDone: string;
  streakTitle: string;
  days: string;
  longestStreak: string;
  practicedToday: string;
  keepStreak: string;
  todaySummary: string;
  today: string;
  yesterday: string;
  weeklyComparison: string;
  thisWeek: string;
  lastWeek: string;
  chartWpmTitle: string;
  chartMinutesTitle: string;
  avgWpm: string;
  practiceMinutes: string;
  heatmapTitle: string;
  less: string;
  more: string;
  heatmapTooltip: string;
  perLanguageTitle: string;
  testsCompleted: string;
  avg: string;
  weakKeysTitle: string;
  noWeakKeys: string;
  misses: string;
  reset: string;
  weakKeysHint: string;
  backupTitle: string;
  backupDesc: string;
  exportData: string;
  importData: string;
  importSuccess: string;
  importError: string;
  cloudTitle: string;
  cloudSignedIn: string;
  cloudGuest: string;
  deleteCloud: string;
  deleteConfirm: string;
  deleted: string;
}

export const UI_TRANSLATIONS: Record<string, UIStrings> = {
  en: {
    tagline: "Type faster in any language",
    navPractice: "Typing Test",
    navLessons: "Lessons",
    navDashboard: "Progress",
    uiLanguage: "Website language",
    toggleTheme: "Switch dark / light mode",
    signIn: "Sign in with Google",
    signOut: "Sign out",
    loading: "Loading...",

    languageTest: "{lang} Typing Test",
    about: "About",
    privacy: "Privacy Policy",
    terms: "Terms of Use",
    contact: "Contact",
    rightsReserved: "All rights reserved.",

    mode30s: "30s",
    mode60s: "60s",
    mode120s: "2 min",
    modeWeakKeys: "Weak Keys",
    sentences: "Sentences",
    words: "Words",
    keyboardToggle: "Keyboard",
    restart: "Restart",
    rtlActive: "Right-to-left",
    keyboardLayout: "Keyboard layout",
    wpm: "WPM",
    accuracy: "Accuracy",
    timeRemaining: "Time left",
    timeElapsed: "Time",
    consistency: "Consistency",
    startTypingPrompt: "Start typing to begin. The timer starts with your first key.",
    wrongKeyHint: "Wrong key. Press the highlighted letter to continue.",
    testCompleted: "Test complete",
    tryAgain: "New test",
    practiceWeakKeys: "Practice weak keys",
    rawWpm: "Raw WPM",
    correctChars: "Correct characters",
    mistakes: "Mistakes",
    mostMissed: "Most missed keys",
    noMistakes: "No mistakes. Excellent!",
    speedChart: "Speed during the test",
    lessonPassed: "Lesson passed with 90%+ accuracy. The next lesson is unlocked!",
    lessonFailed: "You need 90% accuracy to unlock the next lesson. Try again!",

    lessonsTitle: "Touch Typing Lessons",
    lessonsSubtitle: "Finish each lesson with 90% or higher accuracy to unlock the next one.",
    lessonLabel: "Lesson",
    lessonLocked: "Locked",
    lessonCompleted: "Completed",
    lessonUnlockHint: "Finish the previous lesson with 90%+ accuracy",
    readyToStart: "Ready to start",
    startLesson: "Start lesson",
    practiceAgain: "Practice again",
    backToLessons: "All lessons",
    needs90: "90% accuracy needed to pass",
    best: "Best",
    space: "Space",

    dashboardTitle: "Your Progress",
    dashboardSubtitle: "Daily goal, streak, speed charts and weak keys for every language.",
    allLanguages: "All languages",
    dailyGoalTitle: "Daily goal",
    minutes: "Minutes",
    tests: "Tests",
    minutesPerDay: "minutes / day",
    testsPerDay: "tests / day",
    saveGoal: "Save",
    goalDone: "Goal reached today!",
    streakTitle: "Streak",
    days: "days",
    longestStreak: "Longest streak",
    practicedToday: "You practiced today",
    keepStreak: "Do one test today to keep your streak",
    todaySummary: "Today vs yesterday",
    today: "Today",
    yesterday: "Yesterday",
    weeklyComparison: "This week vs last week",
    thisWeek: "This week",
    lastWeek: "Last week",
    chartWpmTitle: "Average WPM and accuracy (last 14 days)",
    chartMinutesTitle: "Practice minutes per day (last 14 days)",
    avgWpm: "Avg WPM",
    practiceMinutes: "Minutes",
    heatmapTitle: "Practice calendar (last 6 months)",
    less: "Less",
    more: "More",
    heatmapTooltip: "{date}: {tests} tests, {minutes} min",
    perLanguageTitle: "Stats by language",
    testsCompleted: "{n} tests",
    avg: "Avg",
    weakKeysTitle: "Weak keys",
    noWeakKeys: "No weak keys yet for this language. Take a test first!",
    misses: "misses",
    reset: "Reset",
    weakKeysHint: "Practice words that contain the keys you miss most.",
    backupTitle: "Backup and restore",
    backupDesc: "Download your progress as a file, so you never lose it when you clear your browser.",
    exportData: "Download backup",
    importData: "Restore backup",
    importSuccess: "Backup restored successfully.",
    importError: "Could not restore: {error}",
    cloudTitle: "Cloud sync",
    cloudSignedIn: "Signed in as {name}. Your progress is saved to your account.",
    cloudGuest: "Sign in with Google to save your progress and use it on any device.",
    deleteCloud: "Delete my cloud data",
    deleteConfirm: "This permanently deletes your saved progress from the cloud and this browser. Continue?",
    deleted: "Your data was deleted.",
  },

  ur: {
    tagline: "کسی بھی زبان میں تیز ٹائپ کریں",
    navPractice: "ٹائپنگ ٹیسٹ",
    navLessons: "اسباق",
    navDashboard: "کارکردگی",
    uiLanguage: "ویب سائٹ کی زبان",
    toggleTheme: "ڈارک / لائٹ موڈ",
    signIn: "گوگل سے سائن اِن کریں",
    signOut: "سائن آؤٹ",
    loading: "لوڈ ہو رہا ہے...",

    languageTest: "{lang} ٹائپنگ ٹیسٹ",
    about: "ہمارے بارے میں",
    privacy: "پرائیویسی پالیسی",
    terms: "شرائطِ استعمال",
    contact: "رابطہ",
    rightsReserved: "جملہ حقوق محفوظ ہیں۔",

    mode30s: "30 سیکنڈ",
    mode60s: "60 سیکنڈ",
    mode120s: "2 منٹ",
    modeWeakKeys: "کمزور حروف",
    sentences: "جملے",
    words: "الفاظ",
    keyboardToggle: "کی بورڈ",
    restart: "دوبارہ شروع",
    rtlActive: "دائیں سے بائیں",
    keyboardLayout: "کی بورڈ لے آؤٹ",
    wpm: "الفاظ فی منٹ",
    accuracy: "درستگی",
    timeRemaining: "باقی وقت",
    timeElapsed: "وقت",
    consistency: "تسلسل",
    startTypingPrompt: "شروع کرنے کے لیے ٹائپ کریں۔ پہلا بٹن دباتے ہی ٹائمر شروع ہو جائے گا۔",
    wrongKeyHint: "غلط بٹن۔ آگے بڑھنے کے لیے نمایاں حرف دبائیں۔",
    testCompleted: "ٹیسٹ مکمل",
    tryAgain: "نیا ٹیسٹ",
    practiceWeakKeys: "کمزور حروف کی مشق",
    rawWpm: "خام رفتار",
    correctChars: "درست حروف",
    mistakes: "غلطیاں",
    mostMissed: "سب سے زیادہ غلط حروف",
    noMistakes: "کوئی غلطی نہیں۔ بہت خوب!",
    speedChart: "ٹیسٹ کے دوران رفتار",
    lessonPassed: "سبق 90 فیصد سے زیادہ درستگی کے ساتھ پاس ہو گیا۔ اگلا سبق کھل گیا!",
    lessonFailed: "اگلا سبق کھولنے کے لیے 90 فیصد درستگی ضروری ہے۔ دوبارہ کوشش کریں!",

    lessonsTitle: "ٹچ ٹائپنگ کے اسباق",
    lessonsSubtitle: "اگلا سبق کھولنے کے لیے ہر سبق 90 فیصد یا زیادہ درستگی کے ساتھ مکمل کریں۔",
    lessonLabel: "سبق",
    lessonLocked: "بند",
    lessonCompleted: "مکمل",
    lessonUnlockHint: "پچھلا سبق 90 فیصد درستگی کے ساتھ مکمل کریں",
    readyToStart: "شروع کرنے کے لیے تیار",
    startLesson: "سبق شروع کریں",
    practiceAgain: "دوبارہ مشق کریں",
    backToLessons: "تمام اسباق",
    needs90: "پاس ہونے کے لیے 90 فیصد درستگی ضروری ہے",
    best: "بہترین",
    space: "اسپیس",

    dashboardTitle: "آپ کی کارکردگی",
    dashboardSubtitle: "ہر زبان کے لیے روزانہ ہدف، مسلسل دن، رفتار کے چارٹ اور کمزور حروف۔",
    allLanguages: "تمام زبانیں",
    dailyGoalTitle: "روزانہ کا ہدف",
    minutes: "منٹ",
    tests: "ٹیسٹ",
    minutesPerDay: "منٹ روزانہ",
    testsPerDay: "ٹیسٹ روزانہ",
    saveGoal: "محفوظ کریں",
    goalDone: "آج کا ہدف پورا ہو گیا!",
    streakTitle: "مسلسل دن",
    days: "دن",
    longestStreak: "سب سے لمبا سلسلہ",
    practicedToday: "آپ نے آج مشق کر لی",
    keepStreak: "سلسلہ برقرار رکھنے کے لیے آج ایک ٹیسٹ دیں",
    todaySummary: "آج بمقابلہ کل",
    today: "آج",
    yesterday: "کل",
    weeklyComparison: "یہ ہفتہ بمقابلہ پچھلا ہفتہ",
    thisWeek: "یہ ہفتہ",
    lastWeek: "پچھلا ہفتہ",
    chartWpmTitle: "اوسط رفتار اور درستگی (پچھلے 14 دن)",
    chartMinutesTitle: "روزانہ مشق کے منٹ (پچھلے 14 دن)",
    avgWpm: "اوسط رفتار",
    practiceMinutes: "منٹ",
    heatmapTitle: "مشق کا کیلنڈر (پچھلے 6 مہینے)",
    less: "کم",
    more: "زیادہ",
    heatmapTooltip: "{date}: {tests} ٹیسٹ، {minutes} منٹ",
    perLanguageTitle: "ہر زبان کے اعداد و شمار",
    testsCompleted: "{n} ٹیسٹ",
    avg: "اوسط",
    weakKeysTitle: "کمزور حروف",
    noWeakKeys: "اس زبان میں ابھی کوئی کمزور حرف نہیں۔ پہلے ایک ٹیسٹ دیں!",
    misses: "غلطیاں",
    reset: "صاف کریں",
    weakKeysHint: "ان الفاظ کی مشق کریں جن میں آپ کے سب سے زیادہ غلط حروف ہیں۔",
    backupTitle: "بیک اپ اور بحالی",
    backupDesc: "اپنی کارکردگی فائل کی صورت میں محفوظ کریں تاکہ براؤزر صاف کرنے پر ضائع نہ ہو۔",
    exportData: "بیک اپ ڈاؤن لوڈ کریں",
    importData: "بیک اپ بحال کریں",
    importSuccess: "بیک اپ کامیابی سے بحال ہو گیا۔",
    importError: "بحال نہیں ہو سکا: {error}",
    cloudTitle: "کلاؤڈ سنک",
    cloudSignedIn: "آپ {name} کے طور پر سائن اِن ہیں۔ آپ کی کارکردگی آپ کے اکاؤنٹ میں محفوظ ہو رہی ہے۔",
    cloudGuest: "گوگل سے سائن اِن کریں تاکہ آپ کی کارکردگی ہر ڈیوائس پر محفوظ رہے۔",
    deleteCloud: "میرا کلاؤڈ ڈیٹا حذف کریں",
    deleteConfirm: "اس سے آپ کا محفوظ ڈیٹا کلاؤڈ اور اس براؤزر سے ہمیشہ کے لیے حذف ہو جائے گا۔ جاری رکھیں؟",
    deleted: "آپ کا ڈیٹا حذف کر دیا گیا۔",
  },

  ar: {
    tagline: "اكتب بسرعة أكبر بأي لغة",
    navPractice: "اختبار الكتابة",
    navLessons: "الدروس",
    navDashboard: "التقدم",
    uiLanguage: "لغة الموقع",
    toggleTheme: "الوضع الداكن / الفاتح",
    signIn: "تسجيل الدخول عبر Google",
    signOut: "تسجيل الخروج",
    loading: "جارٍ التحميل...",

    languageTest: "اختبار الكتابة {lang}",
    about: "من نحن",
    privacy: "سياسة الخصوصية",
    terms: "شروط الاستخدام",
    contact: "اتصل بنا",
    rightsReserved: "جميع الحقوق محفوظة.",

    mode30s: "30 ثانية",
    mode60s: "60 ثانية",
    mode120s: "دقيقتان",
    modeWeakKeys: "المفاتيح الضعيفة",
    sentences: "جمل",
    words: "كلمات",
    keyboardToggle: "لوحة المفاتيح",
    restart: "إعادة",
    rtlActive: "من اليمين إلى اليسار",
    keyboardLayout: "تخطيط لوحة المفاتيح",
    wpm: "كلمة/دقيقة",
    accuracy: "الدقة",
    timeRemaining: "الوقت المتبقي",
    timeElapsed: "الوقت",
    consistency: "الثبات",
    startTypingPrompt: "ابدأ الكتابة للبدء. يبدأ المؤقت مع أول ضغطة.",
    wrongKeyHint: "مفتاح خاطئ. اضغط الحرف المميز للمتابعة.",
    testCompleted: "اكتمل الاختبار",
    tryAgain: "اختبار جديد",
    practiceWeakKeys: "تدرّب على المفاتيح الضعيفة",
    rawWpm: "السرعة الخام",
    correctChars: "الأحرف الصحيحة",
    mistakes: "الأخطاء",
    mostMissed: "أكثر المفاتيح خطأً",
    noMistakes: "لا أخطاء. ممتاز!",
    speedChart: "السرعة أثناء الاختبار",
    lessonPassed: "نجحت في الدرس بدقة 90% أو أكثر. تم فتح الدرس التالي!",
    lessonFailed: "تحتاج إلى دقة 90% لفتح الدرس التالي. حاول مرة أخرى!",

    lessonsTitle: "دروس الكتابة باللمس",
    lessonsSubtitle: "أكمل كل درس بدقة 90% أو أعلى لفتح الدرس التالي.",
    lessonLabel: "الدرس",
    lessonLocked: "مغلق",
    lessonCompleted: "مكتمل",
    lessonUnlockHint: "أكمل الدرس السابق بدقة 90% على الأقل",
    readyToStart: "جاهز للبدء",
    startLesson: "ابدأ الدرس",
    practiceAgain: "تدرّب مرة أخرى",
    backToLessons: "كل الدروس",
    needs90: "يلزم 90% دقة للنجاح",
    best: "الأفضل",
    space: "مسافة",

    dashboardTitle: "تقدّمك",
    dashboardSubtitle: "الهدف اليومي، والأيام المتتالية، ومخططات السرعة، والمفاتيح الضعيفة لكل لغة.",
    allLanguages: "كل اللغات",
    dailyGoalTitle: "الهدف اليومي",
    minutes: "دقائق",
    tests: "اختبارات",
    minutesPerDay: "دقائق / يوم",
    testsPerDay: "اختبارات / يوم",
    saveGoal: "حفظ",
    goalDone: "تم تحقيق هدف اليوم!",
    streakTitle: "الأيام المتتالية",
    days: "أيام",
    longestStreak: "أطول سلسلة",
    practicedToday: "لقد تدرّبت اليوم",
    keepStreak: "أجرِ اختبارًا واحدًا اليوم للحفاظ على سلسلتك",
    todaySummary: "اليوم مقارنة بالأمس",
    today: "اليوم",
    yesterday: "أمس",
    weeklyComparison: "هذا الأسبوع مقارنة بالأسبوع الماضي",
    thisWeek: "هذا الأسبوع",
    lastWeek: "الأسبوع الماضي",
    chartWpmTitle: "متوسط السرعة والدقة (آخر 14 يومًا)",
    chartMinutesTitle: "دقائق التدريب يوميًا (آخر 14 يومًا)",
    avgWpm: "متوسط السرعة",
    practiceMinutes: "دقائق",
    heatmapTitle: "تقويم التدريب (آخر 6 أشهر)",
    less: "أقل",
    more: "أكثر",
    heatmapTooltip: "{date}: {tests} اختبارات، {minutes} دقيقة",
    perLanguageTitle: "الإحصاءات حسب اللغة",
    testsCompleted: "{n} اختبارات",
    avg: "المتوسط",
    weakKeysTitle: "المفاتيح الضعيفة",
    noWeakKeys: "لا توجد مفاتيح ضعيفة لهذه اللغة بعد. أجرِ اختبارًا أولًا!",
    misses: "أخطاء",
    reset: "مسح",
    weakKeysHint: "تدرّب على كلمات تحتوي على المفاتيح التي تخطئ فيها كثيرًا.",
    backupTitle: "النسخ الاحتياطي والاستعادة",
    backupDesc: "نزّل تقدّمك كملف حتى لا تفقده عند مسح بيانات المتصفح.",
    exportData: "تنزيل نسخة احتياطية",
    importData: "استعادة نسخة احتياطية",
    importSuccess: "تمت استعادة النسخة الاحتياطية بنجاح.",
    importError: "تعذّرت الاستعادة: {error}",
    cloudTitle: "المزامنة السحابية",
    cloudSignedIn: "أنت مسجّل الدخول باسم {name}. يتم حفظ تقدّمك في حسابك.",
    cloudGuest: "سجّل الدخول عبر Google لحفظ تقدّمك واستخدامه على أي جهاز.",
    deleteCloud: "حذف بياناتي السحابية",
    deleteConfirm: "سيؤدي هذا إلى حذف تقدّمك المحفوظ نهائيًا من السحابة ومن هذا المتصفح. هل تريد المتابعة؟",
    deleted: "تم حذف بياناتك.",
  },
};

/** Replaces {placeholders} in a translated string. */
export function fmt(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    values[key] !== undefined ? String(values[key]) : `{${key}}`
  );
}

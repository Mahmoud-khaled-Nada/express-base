const ERROR_CODES = {
  UNIQUE: "1",
  REQUIRED: "2",
  MIN: "3",
  MAX: "4",
  EMAIL_NOT_MATCHED: "5",
  URL_NOT_MATCHED: "6",
  IsNotIntPos: "7",
};
const ERROR_VALUES = [
  { ar: "خطأ غير معروف", en: "Error not known" },
  { ar: "الحقل مكرر", en: "Field is not unique" },
  { ar: "الحقل مطلوب", en: "Field is required" },
  { ar: "عدد الاحرف اقل من المتوقع", en: "Minimum size of letters is not met" },
  { ar: "عدد الاحرف اكثر من المتوقع", en: "Maximum size of letters is not met" },
  { ar: "صيغة الايميل غير صحيحة", en: "Email format is not correct" },
  { ar: "صيغة الرابط غير صحيحة", en: "Url format is not correct" },
  { ar: "يجب على العدد ان يكون موجبا ولا يحتوي على كسور", en: "Value should be positive and integer" },
];
const ROLES = {
  USER: "0",
  ADMIN: "1",
  EDITOR: "2",
  ACCOUNTANT: "3",
};

const _ROLES = [
  { code: 0, name: "الكل", name_en: "All", const: "ADMIN" },
  { code: 1, name: "إدارة الطلبات", name_en: "Manage Requests", const: "REQUESTS" },
  { code: 2, name: "الوصول للبيانات المالية", name_en: "Manage Financial", const: "FINANCIAL" },
  { code: 3, name: "إدارة المشاريع ) الحملات )", name_en: "Manage Projects (Campaigns)", const: "CAMPAIGNS" },
  { code: 4, name: "إدارة المشاريع ) الكوبونات )", name_en: "Manage Projects (Coupons)", const: "COUPONS" },
  { code: 5, name: "ادارة الجهات الاعلانية", name_en: "Manage Advertisers", const: "ADVERTISERS" },
  { code: 6, name: "ادارة المؤثرين", name_en: "Manage Influencers", const: "INFLUENCERS" },
  { code: 7, name: "ادارة الرسائل", name_en: "Manage messages", const: "CHAT" },
  { code: 8, name: "ادارة المستخدمين", name_en: "Manage users", const: "USERS" },
  { code: 9, name: "إسناد المشاريع", name_en: "Assign Projects", const: "ASSIGNPROJECTS" },
  { code: 10, name: "الموقع التعريفي", name_en: "Landing Page", const: "LANDING" },
  { code: 11, name: "الإعلانات", name_en: "Ads", const: "ADS" },
  { code: 12, name: "الإقتراحات", name_en: "Suggestions", const: "SUGGESTIONS" },
  { code: 13, name: "المجالات", name_en: "Categories", const: "CATEGORIES" },
  { code: 14, name: "الإعدادات المتقدمه", name_en: "advance Settings", const: "SETTINGS" },
  { code: 15, name: "التقارير", name_en: "Reports", const: "REPORTS" },
  { code: 16, name: "كوبونات الخصم", name_en: "Discount Coupons", const: "DCOUPONS" },
];
const TRACKS = {
  CAMPAIGN: "01-",
  COUPON: "02-",
};

export default {
  ROLES,
  ERROR_CODES,
  ERROR_VALUES,
  TRACKS,
  _ROLES,
};

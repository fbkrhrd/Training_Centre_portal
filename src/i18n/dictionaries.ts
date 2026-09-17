import type { Locale } from "./locale";

const dictionaries = {
  ko: {
    serviceName: "FBKR Learning Centre Portal",
    companyName: "FUJIFILM Business Innovation Korea",
    dashboard: "홈 대시보드",
    users: "사용자 계정",
    menu: "메뉴",
    language: "언어",
    korean: "한국어",
    english: "English",
    signOut: "로그아웃",
    welcomeTitle: "학습과 성장을 한곳에서 관리하세요",
    welcomeBody: "예정된 교육과 수료 이력을 빠르게 확인할 수 있습니다.",
    upcomingTraining: "예정된 교육",
    completedTraining: "수료 이력",
    pendingApproval: "승인 대기",
    employeeNo: "사번",
    password: "비밀번호",
    signIn: "로그인",
    signingIn: "로그인 중...",
    loginGuide: "개인 사번과 비밀번호를 입력해 주세요.",
    account: "내 계정",
    passwordSettings: "비밀번호 변경",
    newPassword: "새 비밀번호",
    passwordConfirm: "새 비밀번호 확인",
    changePassword: "비밀번호 변경",
  },
  en: {
    serviceName: "FBKR Learning Centre Portal",
    companyName: "FUJIFILM Business Innovation Korea",
    dashboard: "Dashboard",
    users: "User Accounts",
    menu: "Menu",
    language: "Language",
    korean: "한국어",
    english: "English",
    signOut: "Sign out",
    welcomeTitle: "Manage learning and growth in one place",
    welcomeBody: "Quickly review upcoming training and completion history.",
    upcomingTraining: "Upcoming training",
    completedTraining: "Completion history",
    pendingApproval: "Pending approval",
    employeeNo: "Employee number",
    password: "Password",
    signIn: "Sign in",
    signingIn: "Signing in...",
    loginGuide: "Enter your employee number and password.",
    account: "My account",
    passwordSettings: "Change password",
    newPassword: "New password",
    passwordConfirm: "Confirm new password",
    changePassword: "Change password",
  },
} as const;

export type Dictionary = {
  [Key in keyof (typeof dictionaries)["ko"]]: string;
};

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

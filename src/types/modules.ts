export type ModuleId = "language" | "squat" | "literature" | "history";

export interface ModuleConfig {
  id: ModuleId;
  title: string;
  subtitle: string;
  icon: string;
  href: string;
  bgColor: string;
}

export const MODULES: ModuleConfig[] = [
  {
    id: "language",
    title: "Language",
    subtitle: "40 words daily",
    icon: "🗣️",
    href: "/language",
    bgColor: "bg-blue-50",
  },
  {
    id: "squat",
    title: "Squat",
    subtitle: "50 reps challenge",
    icon: "🏋️",
    href: "/squat",
    bgColor: "bg-orange-50",
  },
  {
    id: "literature",
    title: "Literature",
    subtitle: "Transcribe & learn",
    icon: "📖",
    href: "/literature",
    bgColor: "bg-emerald-50",
  },
  {
    id: "history",
    title: "History",
    subtitle: "Daily insight",
    icon: "🏛️",
    href: "/history",
    bgColor: "bg-purple-50",
  },
];

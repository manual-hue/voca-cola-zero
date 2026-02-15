export type ModuleId = "language" | "squat" | "literature" | "history";

export interface ModuleConfig {
  id: ModuleId;
  title: string;
  subtitle: string;
  icon: string;
  href: string;
  color: string;
  bgColor: string;
}

export const MODULES: ModuleConfig[] = [
  {
    id: "language",
    title: "Language",
    subtitle: "40 words daily",
    icon: "🗣️",
    href: "/language",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    id: "squat",
    title: "Squat",
    subtitle: "50 reps challenge",
    icon: "🏋️",
    href: "/squat",
    color: "text-orange-600",
    bgColor: "bg-orange-50",
  },
  {
    id: "literature",
    title: "Literature",
    subtitle: "Transcribe & learn",
    icon: "📖",
    href: "/literature",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
  },
  {
    id: "history",
    title: "History",
    subtitle: "Daily insight",
    icon: "🏛️",
    href: "/history",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
];

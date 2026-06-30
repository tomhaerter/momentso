export const projectColors = [
  "red",
  "orange",
  "amber",
  "yellow",
  "lime",
  "green",
  "emerald",
  "teal",
  "cyan",
  "sky",
  "blue",
  "indigo",
  "violet",
  "purple",
  "fuchsia",
  "pink",
  "rose",
  "gray"
] as const

export type ProjectColor = (typeof projectColors)[number]

export const colorOptions = projectColors.map((value) => ({ value, display: value }))

const dotClasses: Record<ProjectColor, string> = {
  red: "bg-red-500",
  orange: "bg-orange-500",
  amber: "bg-amber-500",
  yellow: "bg-yellow-500",
  lime: "bg-lime-500",
  green: "bg-green-500",
  emerald: "bg-emerald-500",
  teal: "bg-teal-500",
  cyan: "bg-cyan-500",
  sky: "bg-sky-500",
  blue: "bg-blue-500",
  indigo: "bg-indigo-500",
  violet: "bg-violet-500",
  purple: "bg-purple-500",
  fuchsia: "bg-fuchsia-500",
  pink: "bg-pink-500",
  rose: "bg-rose-500",
  gray: "bg-gray-500"
}

const itemClasses: Record<ProjectColor, string> = {
  red: "bg-red-100 text-red-800 data-[highlighted]:bg-red-200",
  orange: "bg-orange-100 text-orange-800 data-[highlighted]:bg-orange-200",
  amber: "bg-amber-100 text-amber-800 data-[highlighted]:bg-amber-200",
  yellow: "bg-yellow-100 text-yellow-800 data-[highlighted]:bg-yellow-200",
  lime: "bg-lime-100 text-lime-800 data-[highlighted]:bg-lime-200",
  green: "bg-green-100 text-green-800 data-[highlighted]:bg-green-200",
  emerald: "bg-emerald-100 text-emerald-800 data-[highlighted]:bg-emerald-200",
  teal: "bg-teal-100 text-teal-800 data-[highlighted]:bg-teal-200",
  cyan: "bg-cyan-100 text-cyan-800 data-[highlighted]:bg-cyan-200",
  sky: "bg-sky-100 text-sky-800 data-[highlighted]:bg-sky-200",
  blue: "bg-blue-100 text-blue-800 data-[highlighted]:bg-blue-200",
  indigo: "bg-indigo-100 text-indigo-800 data-[highlighted]:bg-indigo-200",
  violet: "bg-violet-100 text-violet-800 data-[highlighted]:bg-violet-200",
  purple: "bg-purple-100 text-purple-800 data-[highlighted]:bg-purple-200",
  fuchsia: "bg-fuchsia-100 text-fuchsia-800 data-[highlighted]:bg-fuchsia-200",
  pink: "bg-pink-100 text-pink-800 data-[highlighted]:bg-pink-200",
  rose: "bg-rose-100 text-rose-800 data-[highlighted]:bg-rose-200",
  gray: "bg-gray-100 text-gray-800 data-[highlighted]:bg-gray-200"
}

export function colorDotClass(color: string): string {
  return dotClasses[color as ProjectColor] ?? dotClasses.gray
}

export function colorItemClass(color: string): string {
  return itemClasses[color as ProjectColor] ?? itemClasses.gray
}

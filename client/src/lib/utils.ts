import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getInitials(fullName: string): string {
  const names = fullName.split(' ');
  
  if (names.length === 1) return names[0].charAt(0).toUpperCase();
  
  return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
}

export function formatExperienceYears(years: number): string {
  return years === 1 ? "1 year" : `${years} years`;
}

export function formatDateTime(dateString: string | Date): string {
  const date = new Date(dateString);
  
  // Format date as MM/DD/YYYY
  const dateFormat = new Intl.DateTimeFormat('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  });
  
  // Format time as HH:MM AM/PM
  const timeFormat = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
  
  return `${dateFormat.format(date)}, ${timeFormat.format(date)}`;
}

export const availabilityOptions = [
  "Immediate",
  "1 week",
  "2 weeks",
  "3 weeks",
  "1 month",
  "2 months",
  "3+ months"
];

export const experienceOptions = [
  { label: "Entry Level (0-2 years)", value: 0 },
  { label: "Mid Level (3-5 years)", value: 3 },
  { label: "Senior Level (6-9 years)", value: 6 },
  { label: "Expert Level (10+ years)", value: 10 }
];

export const commonSkills = [
  "JavaScript",
  "TypeScript",
  "React",
  "Angular",
  "Vue.js",
  "Node.js",
  "Python",
  "Java",
  "C#",
  ".NET",
  "PHP",
  "Ruby",
  "Swift",
  "Kotlin",
  "Go",
  "Rust",
  "AWS",
  "Azure",
  "Google Cloud",
  "Docker",
  "Kubernetes",
  "GraphQL",
  "SQL",
  "NoSQL",
  "MongoDB",
  "PostgreSQL",
  "MySQL",
  "Redis",
  "UI/UX Design",
  "Figma",
  "Adobe XD",
  "DevOps",
  "CI/CD",
  "Machine Learning",
  "Data Science",
  "Blockchain",
  "AR/VR",
  "Mobile Development",
  "React Native",
  "Flutter",
  "Product Management",
  "Agile",
  "Scrum"
];

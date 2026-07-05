export type ThumbType = "store" | "whatsapp" | "food" | "ai";
export type NoteType = "event" | "build" | "demo" | "research";

export type Screenshot = {
  title: string;
  caption: string;
  imageUrl?: string;
};

export type FAQ = {
  question: string;
  answer: string;
};

export type Project = {
  id: string;
  visible?: boolean;
  title: string;
  kicker: string;
  cardSummary: string;
  outcome: string;
  role: string;
  stack: string;
  status: string;
  tags: string[];
  pills: string[];
  thumbType: ThumbType;
  thumbnailUrl?: string;
  githubUrl?: string;
  liveUrl?: string;
  youtubeUrl?: string;
  problem: string;
  solution: string;
  built: string;
  workflow: string[];
  challenges: string;
  learnings: string;
  screenshots: Screenshot[];
  faqs: FAQ[];
};

export type FieldNote = {
  id: string;
  visible?: boolean;
  label: string;
  title: string;
  caption: string;
  type: NoteType;
  imageUrl?: string;
};

export type Profile = {
  name: string;
  initials: string;
  roleLine: string;
  email: string;
  github: string;
  linkedin: string;
  youtube: string;
  heroPrefix: string;
  heroWords: string[];
  heroLead: string;
  availability: string;
};

export type ResumeInfo = {
  publicTitle: string;
  publicNote: string;
  downloadUrl: string;
  requestUrl: string;
};

export type SkillsInfo = {
  primaryTitle: string;
  primaryDescription: string;
  primaryRows: [string, string][];
  secondaryTitle: string;
  secondaryRows: [string, string][];
};

export type ExperienceItem = {
  when: string;
  title: string;
  summary: string;
};

export type SectionVisibility = {
  hero: boolean;
  proof: boolean;
  focus: boolean;
  projects: boolean;
  notes: boolean;
  skills: boolean;
  experience: boolean;
  resume: boolean;
  contact: boolean;
  footer: boolean;
  projectScreenshots: boolean;
  projectDemo: boolean;
  projectCaseStudy: boolean;
  projectWorkflow: boolean;
  projectLearning: boolean;
  projectFaq: boolean;
};

export type PortfolioData = {
  sections: SectionVisibility;
  profile: Profile;
  resume: ResumeInfo;
  projects: Project[];
  notes: FieldNote[];
  skills: SkillsInfo;
  experience: ExperienceItem[];
};

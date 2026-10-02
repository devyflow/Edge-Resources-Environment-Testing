export type ThumbType = "store" | "whatsapp" | "food" | "ai";
export type NoteType = "event" | "build" | "demo" | "research";
export type PublishStatus = "draft" | "published";
export type PostKind = "engineering" | "build-log" | "photography" | "event" | "note";

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

export type FreeTool = {
  id: string;
  visible?: boolean;
  featured?: boolean;
  status: PublishStatus;
  title: string;
  eyebrow: string;
  summary: string;
  description: string;
  category: string;
  capabilities: string[];
};

export type JournalPost = {
  id: string;
  visible?: boolean;
  featured?: boolean;
  status: PublishStatus;
  kind: PostKind;
  title: string;
  excerpt: string;
  body: string;
  date: string;
  location?: string;
  coverImage?: string;
  relatedProjectId?: string;
};

export type Profile = {
  brandName: string;
  brandLine: string;
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
  currentFocus: string;
  currentLearning: string;
  currentLocation: string;
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
  now: boolean;
  projects: boolean;
  tools: boolean;
  journal: boolean;
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
  homeExperience?: import("./home-content").HomeExperienceContent;
  photography?: import("./photography-content").PhotographyContent;
  engineerProjects?: import("./engineer-project-store").EngineerProject[];
  sections: SectionVisibility;
  profile: Profile;
  resume: ResumeInfo;
  projects: Project[];
  notes: FieldNote[];
  tools: FreeTool[];
  posts: JournalPost[];
  skills: SkillsInfo;
  experience: ExperienceItem[];
};

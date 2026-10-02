export type EntryDestination = {
  id: "engineering" | "photography";
  title: string;
  detail: string;
  caption: string;
  scene: string;
  creditLabel: string;
  creditUrl: string;
};

export type HomeExperienceContent = {
  brand: string;
  edition: string;
  readyLabel: string;
  kicker: string;
  nameLineOne: string;
  nameLineTwo: string;
  statementLineOne: string;
  statementLineTwo: string;
  coordinates: string;
  location: string;
  destinations: [EntryDestination, EntryDestination];
};

export function initialHomeExperience(): HomeExperienceContent {
  return {
    brand: "devyflow",
    edition: "A PERSONAL COLLECTION / 2026",
    readyLabel: "READY TO EXPLORE",
    kicker: "SOFTWARE ENGINEER. CURIOUS BY DEFAULT.",
    nameLineOne: "Devyanshu",
    nameLineTwo: "Agrawal",
    statementLineOne: "I build things.",
    statementLineTwo: "And notice the world around them.",
    coordinates: "25.3176 N / 82.9739 E",
    location: "VARANASI, INDIA",
    destinations: [
      {
        id: "engineering",
        title: "The Engineer",
        detail: "Software, selected projects & useful tools.",
        caption: "PROFESSIONAL PORTFOLIO",
        scene: "/camera-preview/geometry.jpg",
        creditLabel: "Osman Rana",
        creditUrl: "https://unsplash.com/photos/grayscale-photo-of-concrete-building-5LED2xbiKvk"
      },
      {
        id: "photography",
        title: "Beyond the Code",
        detail: "Photographs, field notes & a life in Varanasi.",
        caption: "PERSONAL JOURNAL",
        scene: "/camera-preview/coast.jpg",
        creditLabel: "Josh Withers",
        creditUrl: "https://unsplash.com/photos/an-aerial-view-of-the-ocean-and-mountains-Hm6fG5d0CGQ"
      }
    ]
  };
}

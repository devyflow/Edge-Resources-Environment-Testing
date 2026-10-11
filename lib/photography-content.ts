import { photoPosts } from "./photo-posts";

export type PhotoPost = {
  slug: string;
  title: string;
  caption: string;
  category: string;
  alt: string;
  image: string;
  width?: number;
  height?: number;
  visible: boolean;
  focalX?: number;
  focalY?: number;
  camera?: string;
  lens?: string;
  exposure?: string;
  showMetadata?: boolean;
  displayCode?: string;
};

export type PhotoCollection = {
  name: string;
  summary: string;
  coverSlug: string;
  visible: boolean;
};

export type PhotoFieldNote = {
  id: string;
  label: string;
  title: string;
  excerpt: string;
  body: string;
  image: string;
  photoSlugs: string[];
  status: "draft" | "published";
  date: string;
};

export type PhotoSocialPlatform = "instagram" | "youtube" | "pinterest" | "x" | "threads" | "bluesky" | "linkedin" | "behance" | "flickr" | "fivehundredpx" | "website" | "custom";
export type PhotoArchiveView = "feed" | "contact" | "frame";
export type PhotoSectionId = "photos" | "collections" | "notes" | "about";
export type PhotoTheme = "light" | "dark";

export type PhotoSection = {
  id: PhotoSectionId;
  label: string;
  visible: boolean;
};

export type PhotoLegalSettings = {
  copyrightYear: string;
  copyrightHolder: string;
  trademarkNotice: string;
  usePolicy: string;
  creditName: string;
  creditInstagram: string;
  creditWebsite: string;
  watermarkEnabled: boolean;
};

export type PhotoRequestSettings = {
  enabled: boolean;
  email: string;
  intro: string;
};

export type PhotoSocialLink = {
  id: string;
  platform: PhotoSocialPlatform;
  label: string;
  url: string;
  visible: boolean;
};

export type PhotographyContent = {
  schemaVersion: 6;
  nextFrameNumber: number;
  name: string;
  author: string;
  instagram?: string;
  defaultTheme: PhotoTheme;
  defaultSection: PhotoSectionId;
  defaultView: PhotoArchiveView;
  fitOriginals: boolean;
  quietShutter: boolean;
  about: string;
  socialLinks: PhotoSocialLink[];
  sections: PhotoSection[];
  legal: PhotoLegalSettings;
  requests: PhotoRequestSettings;
  categories: string[];
  collectionDetails: PhotoCollection[];
  fieldNotes: PhotoFieldNote[];
  posts: PhotoPost[];
};

export function initialPhotography(): PhotographyContent {
  return {
    schemaVersion: 6,
    nextFrameNumber: photoPosts.length + 1,
    name: "Beyond the Code",
    author: "Devyanshu Agrawal",
    defaultTheme: "dark",
    defaultSection: "photos",
    defaultView: "contact",
    fitOriginals: true,
    quietShutter: true,
    about: "I am from Varanasi, where river light, crowded streets, temporary festival architecture, and ordinary movement constantly change the frame. Photography is how I slow down enough to notice them, and how I carry that attention back into the systems I build.",
    socialLinks: [
      { id: "instagram", platform: "instagram", label: "Instagram", url: "https://www.instagram.com/dbeing._/", visible: true }
    ],
    sections: [
      { id: "photos", label: "All photos", visible: true },
      { id: "collections", label: "Collections", visible: true },
      { id: "notes", label: "Field notes", visible: true },
      { id: "about", label: "About", visible: true }
    ],
    legal: {
      copyrightYear: "2026",
      copyrightHolder: "Devyanshu Agrawal",
      trademarkNotice: "Made between code and camera in Varanasi.",
      usePolicy: "You may share or adapt these photographs when visible credit is given to the photographer, Instagram profile, and website. The same credit requirement applies to edited or transformed versions.",
      creditName: "Devyanshu Agrawal",
      creditInstagram: "@dbeing._",
      creditWebsite: "devyflow.in",
      watermarkEnabled: true
    },
    requests: {
      enabled: true,
      email: "i.devyanshv@gmail.com",
      intro: "Tell me briefly how you would like to use this frame. Its code and page link are included automatically."
    },
    categories: ["After dark", "Celebrations", "Details"],
    collectionDetails: [
      { name: "After dark", summary: "Warm light, temporary architecture, and streets transformed after sunset.", coverSlug: "golden-street", visible: true },
      { name: "Celebrations", summary: "Gatherings, colour, and the spaces people briefly transform.", coverSlug: "red-entrance", visible: true },
      { name: "Details", summary: "Light, texture, and small reasons to look again.", coverSlug: "blue-canopy", visible: true }
    ],
    fieldNotes: [
      { id: "festival-geometry", label: "FIELD NOTE 01", title: "Festival Geometry", excerpt: "Temporary lights turn a crowded street into a repeating study of lines, cubes, and borrowed stars.", body: "The street was still noisy and moving, but the geometry above it created a second, quieter route for the eye. I framed the lights as temporary architecture: something built for a few nights, remembered through repetition and glow.", image: "/photography/overhead-stars.jpg", photoSlugs: ["golden-street", "overhead-stars"], status: "published", date: "" },
      { id: "red-threshold", label: "FIELD NOTE 02", title: "Red Threshold", excerpt: "A festival entrance becomes a threshold between traffic, devotion, and temporary spectacle.", body: "The facade asks for a formal portrait, but the people passing below keep it grounded. Their scale, the open gates, and the warm spill of light make the frame less about decoration and more about arrival.", image: "/photography/red-entrance.jpg", photoSlugs: ["red-entrance"], status: "published", date: "" },
      { id: "blue-silence", label: "FIELD NOTE 03", title: "Blue Silence", excerpt: "Cold light changes simple decoration into atmosphere and makes a busy gathering feel briefly still.", body: "Up close, the hanging strands become texture and rhythm. Pulling back restores the people and the shared space beneath them. The two frames belong together, but each holds a different kind of quiet.", image: "/photography/blue-canopy.jpg", photoSlugs: ["blue-canopy", "under-blue"], status: "published", date: "" }
    ],
    posts: photoPosts.map((post, index) => ({
      slug: post.slug,
      title: post.title,
      caption: post.caption,
      category: post.category,
      alt: post.alt,
      image: `/photography/${post.slug}.jpg`,
      width: post.slug === "red-entrance" ? 1728 : 2592,
      height: post.slug === "red-entrance" ? 2592 : 1728,
      visible: true,
      focalX: 50,
      focalY: 50,
      showMetadata: false,
      displayCode: `DF-${String(index + 1).padStart(3, "0")}`
    }))
  };
}

export function normalizePhotography(content?: Partial<PhotographyContent>): PhotographyContent {
  const defaults = initialPhotography();
  if (!content) return defaults;
  const sourceVersion = Number(content.schemaVersion ?? 0);
  const legacyAbout = "Photography is my way of documenting streets, celebrations, experiments, and the moments around what I build.";
  const legacyTrademark = "DevyFlow™ is the portfolio identity of Devyanshu Agrawal.";
  const legacyPhotoSlug = "photo-1790991922605";
  const migratedPhotoSlug = "night-passage";
  const legacyInstagram = typeof content.instagram === "string" ? content.instagram.trim() : "";
  const socialLinks = Array.isArray(content.socialLinks)
    ? content.socialLinks.map((link) => ({ ...link }))
    : legacyInstagram
      ? [{ id: "instagram", platform: "instagram" as const, label: "Instagram", url: legacyInstagram, visible: true }]
      : defaults.socialLinks;
  const categories = Array.isArray(content.categories) ? content.categories : defaults.categories;
  const suppliedSections = Array.isArray(content.sections) ? content.sections : [];
  const sections = defaults.sections.map((section) => {
    const supplied = suppliedSections.find((item) => item.id === section.id);
    return supplied ? { ...section, ...supplied } : section;
  }).sort((a, b) => {
    const aIndex = suppliedSections.findIndex((item) => item.id === a.id);
    const bIndex = suppliedSections.findIndex((item) => item.id === b.id);
    return (aIndex < 0 ? 99 : aIndex) - (bIndex < 0 ? 99 : bIndex);
  });
  const visibleSections = sections.filter((section) => section.visible);
  const requestedDefaultSection = content.defaultSection as PhotoSectionId | undefined;
  const defaultSection = visibleSections.some((section) => section.id === requestedDefaultSection)
    ? requestedDefaultSection!
    : visibleSections[0]?.id ?? "photos";
  const suppliedCollections = Array.isArray(content.collectionDetails) ? content.collectionDetails : [];
  const collectionDetails = categories.map((name) => suppliedCollections.find((item) => item.name === name) ?? defaults.collectionDetails.find((item) => item.name === name) ?? {
    name,
    summary: "A selected sequence from the archive.",
    coverSlug: content.posts?.find((post) => post.category === name && post.image)?.slug ?? "",
    visible: true
  });
  const suppliedNotes = Array.isArray(content.fieldNotes) ? content.fieldNotes : [];
  const fieldNotes = sourceVersion < 4 && !suppliedNotes.some((note) => note.status === "published")
    ? defaults.fieldNotes
    : suppliedNotes.length > 0 ? suppliedNotes : defaults.fieldNotes;
  const posts = (Array.isArray(content.posts) ? content.posts : defaults.posts).map((post, index) => ({
    focalX: 50,
    focalY: 50,
    showMetadata: false,
    displayCode: `DF-${String(index + 1).padStart(3, "0")}`,
    ...(post.slug === "red-entrance" ? { width: 1728, height: 2592 } : {}),
    ...post,
    ...(sourceVersion < 3 && post.slug === legacyPhotoSlug ? {
      slug: migratedPhotoSlug,
      title: "Night Passage",
      caption: "Headlights cut through the festival road."
    } : {})
  }));
  const highestAssignedFrame = posts.reduce((highest, post) => {
    const match = /^DF-(\d+)$/i.exec(post.displayCode?.trim() ?? "");
    return match ? Math.max(highest, Number(match[1])) : highest;
  }, 0);
  const savedNextFrame = Number(content.nextFrameNumber);
  const nextFrameNumber = Number.isInteger(savedNextFrame) && savedNextFrame > highestAssignedFrame
    ? savedNextFrame
    : highestAssignedFrame + 1;
  return {
    ...defaults,
    ...content,
    schemaVersion: 6,
    nextFrameNumber,
    socialLinks,
    defaultTheme: content.defaultTheme === "light" ? "light" : "dark",
    defaultSection,
    defaultView: sourceVersion >= 5 && ["feed", "contact", "frame"].includes(content.defaultView ?? "") ? content.defaultView as PhotoArchiveView : defaults.defaultView,
    fitOriginals: sourceVersion >= 2 && typeof content.fitOriginals === "boolean" ? content.fitOriginals : defaults.fitOriginals,
    quietShutter: sourceVersion >= 5 && typeof content.quietShutter === "boolean" ? content.quietShutter : defaults.quietShutter,
    about: typeof content.about === "string" && !(sourceVersion < 4 && content.about === legacyAbout) ? content.about : defaults.about,
    sections,
    legal: {
      ...defaults.legal,
      ...(content.legal || {}),
      trademarkNotice: sourceVersion < 4 && content.legal?.trademarkNotice === legacyTrademark
        ? defaults.legal.trademarkNotice
        : content.legal?.trademarkNotice ?? defaults.legal.trademarkNotice
    },
    requests: { ...defaults.requests, ...(content.requests || {}) },
    categories,
    collectionDetails: collectionDetails.map((collection) => collection.coverSlug === legacyPhotoSlug ? { ...collection, coverSlug: migratedPhotoSlug } : collection),
    fieldNotes: fieldNotes.map((note) => ({ ...note, photoSlugs: note.photoSlugs.map((slug) => slug === legacyPhotoSlug ? migratedPhotoSlug : slug) })),
    posts
  };
}

export function validatePhotography(content: PhotographyContent) {
  if (!["feed", "contact", "frame"].includes(content.defaultView)) throw new Error("Choose a valid default photography view.");
  if (!content.sections.some((section) => section.visible)) throw new Error("Keep at least one photography section visible.");
  if (!content.sections.some((section) => section.id === content.defaultSection && section.visible)) throw new Error("The default photography section must be visible.");
  const categories = content.categories.map((category) => category.trim());
  if (categories.some((category) => !category || category.toLowerCase() === "all")) {
    throw new Error('Photo collections need a name, and "All" is reserved.');
  }

  const normalizedCategories = categories.map((category) => category.toLowerCase());
  if (new Set(normalizedCategories).size !== normalizedCategories.length) {
    throw new Error("Photo collection names must be unique.");
  }

  const linkIds = content.socialLinks.map((link) => link.id);
  if (new Set(linkIds).size !== linkIds.length) throw new Error("Social links must have unique IDs.");
  for (const link of content.socialLinks) {
    if (!link.label.trim()) throw new Error("Every social link needs a label.");
    if (!link.url.trim()) {
      if (link.visible) throw new Error(`Add a URL before showing ${link.label}.`);
      continue;
    }
    try {
      const url = new URL(link.url);
      if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error();
    } catch {
      throw new Error(`${link.label} must use a complete http or https URL.`);
    }
  }

  const slugs = content.posts.map((post) => post.slug.trim());
  if (slugs.some((slug) => !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))) {
    throw new Error("Every photo needs a lowercase, hyphenated URL slug.");
  }
  if (new Set(slugs).size !== slugs.length) {
    throw new Error("Photo URL slugs must be unique.");
  }
  const displayCodes = content.posts.map((post) => post.displayCode?.trim().toLowerCase() ?? "");
  if (new Set(displayCodes).size !== displayCodes.length) {
    throw new Error("Frame display codes must be unique.");
  }
  if (!Number.isInteger(content.nextFrameNumber) || content.nextFrameNumber < 1) {
    throw new Error("The next frame number is invalid.");
  }

  for (const post of content.posts) {
    if (post.category && !categories.includes(post.category.trim())) {
      throw new Error(`The collection for "${post.title || post.slug}" no longer exists.`);
    }
    if (post.visible && (!post.title.trim() || !post.alt.trim() || !post.image.trim() || !post.category.trim())) {
      throw new Error("Visible photos need a title, image, alt text, and collection.");
    }
    if (post.visible && post.title.trim().split(/\s+/).length > 2) {
      throw new Error(`Keep the public title for "${post.slug}" to two words.`);
    }
    if (post.caption.length > 160) throw new Error(`Keep the caption for "${post.title || post.slug}" under 160 characters.`);
    if ((post.focalX ?? 50) < 0 || (post.focalX ?? 50) > 100 || (post.focalY ?? 50) < 0 || (post.focalY ?? 50) > 100) {
      throw new Error(`Choose a valid crop focus for "${post.title || post.slug}".`);
    }
    if (!post.displayCode?.trim()) throw new Error(`Add a display code for "${post.title || post.slug}".`);
  }

  if (content.requests.enabled && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(content.requests.email.trim())) {
    throw new Error("Add a valid email for photography requests.");
  }

  for (const collection of content.collectionDetails) {
    if (!categories.includes(collection.name)) throw new Error(`Collection settings for "${collection.name}" do not match a collection.`);
    if (collection.coverSlug && !content.posts.some((post) => post.slug === collection.coverSlug)) throw new Error(`Choose a valid cover for "${collection.name}".`);
  }

  const noteIds = content.fieldNotes.map((note) => note.id);
  if (new Set(noteIds).size !== noteIds.length) throw new Error("Field note IDs must be unique.");
  for (const note of content.fieldNotes) {
    if (note.status === "published" && (!note.title.trim() || !note.excerpt.trim() || !note.body.trim())) throw new Error("Published field notes need a title, excerpt, and body.");
    if (note.photoSlugs.some((slug) => !content.posts.some((post) => post.slug === slug))) throw new Error(`A frame selected for "${note.title || note.id}" no longer exists.`);
  }
}

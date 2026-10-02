import { photoPosts } from "./photo-posts";

export type PhotoPost = {
  slug: string;
  title: string;
  caption: string;
  category: string;
  alt: string;
  image: string;
  visible: boolean;
};

export type PhotoSocialPlatform = "instagram" | "youtube" | "pinterest" | "x" | "website";
export type PhotoArchiveView = "feed" | "contact" | "frame";

export type PhotoSocialLink = {
  id: string;
  platform: PhotoSocialPlatform;
  label: string;
  url: string;
  visible: boolean;
};

export type PhotographyContent = {
  name: string;
  author: string;
  instagram?: string;
  defaultView: PhotoArchiveView;
  socialLinks: PhotoSocialLink[];
  categories: string[];
  posts: PhotoPost[];
};

export function initialPhotography(): PhotographyContent {
  return {
    name: "Beyond the Code",
    author: "Devyanshu Agrawal",
    defaultView: "contact",
    socialLinks: [
      { id: "instagram", platform: "instagram", label: "Instagram", url: "https://www.instagram.com/dbeing._/", visible: true }
    ],
    categories: ["After dark", "Celebrations", "Details"],
    posts: photoPosts.map((post) => ({
      slug: post.slug,
      title: post.title,
      caption: post.caption,
      category: post.category,
      alt: post.alt,
      image: `/photography/${post.slug}.jpg`,
      visible: true
    }))
  };
}

export function normalizePhotography(content?: Partial<PhotographyContent>): PhotographyContent {
  const defaults = initialPhotography();
  if (!content) return defaults;
  const legacyInstagram = typeof content.instagram === "string" ? content.instagram.trim() : "";
  const socialLinks = Array.isArray(content.socialLinks)
    ? content.socialLinks.map((link) => ({ ...link }))
    : legacyInstagram
      ? [{ id: "instagram", platform: "instagram" as const, label: "Instagram", url: legacyInstagram, visible: true }]
      : defaults.socialLinks;
  return {
    ...defaults,
    ...content,
    socialLinks,
    defaultView: ["feed", "contact", "frame"].includes(content.defaultView ?? "") ? content.defaultView as PhotoArchiveView : defaults.defaultView,
    categories: Array.isArray(content.categories) ? content.categories : defaults.categories,
    posts: Array.isArray(content.posts) ? content.posts : defaults.posts
  };
}

export function validatePhotography(content: PhotographyContent) {
  if (!["feed", "contact", "frame"].includes(content.defaultView)) throw new Error("Choose a valid default photography view.");
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

  for (const post of content.posts) {
    if (post.category && !categories.includes(post.category.trim())) {
      throw new Error(`The collection for "${post.title || post.slug}" no longer exists.`);
    }
    if (post.visible && (!post.title.trim() || !post.alt.trim() || !post.image.trim() || !post.category.trim())) {
      throw new Error("Visible photos need a title, image, alt text, and collection.");
    }
  }
}

export type StudioFrame = {
  slug: string;
  title: string;
  caption: string;
  collection: "Festival After Dark" | "Blue Studies";
  image: string;
  alt: string;
  orientation: "landscape" | "portrait";
};

export const studioFrames: StudioFrame[] = [
  { slug: "golden-street", title: "Golden Geometry", caption: "Golden cubes above a street that never stops.", collection: "Festival After Dark", image: "/photography/golden-street.jpg", alt: "Glowing cube decorations over a dark street, with a headlight below.", orientation: "landscape" },
  { slug: "red-entrance", title: "Scarlet Entrance", caption: "Red and gold, with the gates wide open.", collection: "Festival After Dark", image: "/photography/red-entrance.jpg", alt: "Red and gold decorated entrance with Jagannath imagery and people walking past.", orientation: "portrait" },
  { slug: "overhead-stars", title: "Borrowed Stars", caption: "A little sky, made of lights.", collection: "Festival After Dark", image: "/photography/overhead-stars.jpg", alt: "Strings of warm lights and star-shaped decorations across the night sky.", orientation: "landscape" },
  { slug: "blue-canopy", title: "Electric Blue", caption: "Looking up was enough.", collection: "Blue Studies", image: "/photography/blue-canopy.jpg", alt: "Hanging white decorations illuminated by cyan light strips.", orientation: "landscape" },
  { slug: "under-blue", title: "Quiet Devotion", caption: "A moment of stillness under blue light.", collection: "Blue Studies", image: "/photography/under-blue.jpg", alt: "Visitors facing a Durga display beneath a bright blue canopy.", orientation: "landscape" }
];

export const studioCollections = [
  { name: "Festival After Dark", summary: "Warm light, temporary architecture, and streets transformed after sunset.", cover: "/photography/golden-street.jpg", count: 3 },
  { name: "Blue Studies", summary: "Cool light and quiet attention beneath festival canopies.", cover: "/photography/under-blue.jpg", count: 2 }
] as const;

export const studioNotes = [
  { id: "looking-up", label: "PHOTO WALK 01", title: "Why I kept looking up", excerpt: "A short field note about repetition, temporary lights, and finding structure above a crowded street.", image: "/photography/overhead-stars.jpg", date: "Draft" },
  { id: "two-colours", label: "EDIT NOTE 02", title: "One night, two colours", excerpt: "Warm gold and electric blue became the simplest way to sequence these five frames.", image: "/photography/blue-canopy.jpg", date: "Draft" },
  { id: "between-builds", label: "FIELD NOTE 03", title: "Between builds", excerpt: "Photography as a way to slow down, notice decisions, and return to software with a clearer eye.", image: "/photography/red-entrance.jpg", date: "Draft" }
] as const;

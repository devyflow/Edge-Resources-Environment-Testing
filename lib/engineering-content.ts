export type ExperienceTheme = "light" | "dark";

export type EngineerTool = {
  id: string;
  title: string;
  summary: string;
  visible: boolean;
  featured: boolean;
  featuredLabel: string;
  image: string;
  actionLabel: string;
  url: string;
  projectSlug: string;
  kind: "link" | "json-desk";
};

export type EngineeringContent = {
  schemaVersion: 2;
  defaultTheme: ExperienceTheme;
  tools: EngineerTool[];
};

export function initialEngineeringContent(): EngineeringContent {
  return {
    schemaVersion: 2,
    defaultTheme: "light",
    tools: [
      {
        id: "piksy",
        title: "Piksy",
        summary: "Turn text into an image to share on WhatsApp or elsewhere.",
        visible: true,
        featured: true,
        featuredLabel: "Featured tool",
        image: "/tools/piksy-feature.png",
        actionLabel: "Open Piksy",
        url: "https://piksy.xyz",
        projectSlug: "piksy",
        kind: "link"
      },
      {
        id: "json-desk",
        title: "JSON Desk",
        summary: "Format, validate, and export JSON in your browser.",
        visible: true,
        featured: false,
        featuredLabel: "Featured tool",
        image: "",
        actionLabel: "Open JSON Desk",
        url: "",
        projectSlug: "",
        kind: "json-desk"
      }
    ]
  };
}

export function normalizeEngineering(content?: Partial<EngineeringContent>): EngineeringContent {
  const defaults = initialEngineeringContent();
  if (!content) return defaults;
  const sourceVersion = Number(content.schemaVersion ?? 0);
  return {
    schemaVersion: 2,
    defaultTheme: content.defaultTheme === "dark" ? "dark" : "light",
    tools: Array.isArray(content.tools)
      ? content.tools.map((tool, index) => ({
          id: tool.id || `tool-${index + 1}`,
          title: tool.title || "Untitled tool",
          summary: tool.summary || "",
          visible: tool.visible !== false,
          featured: tool.featured === true,
          featuredLabel: tool.featuredLabel || "Featured tool",
          image: sourceVersion < 2 && tool.id === "piksy" && tool.featured === true && !tool.image
            ? "/tools/piksy-feature.png"
            : tool.image || "",
          actionLabel: tool.actionLabel || `Open ${tool.title || "tool"}`,
          url: tool.url || "",
          projectSlug: tool.projectSlug || "",
          kind: tool.kind === "json-desk" ? "json-desk" : "link"
        }))
      : defaults.tools
  };
}

export function validateEngineering(content: EngineeringContent) {
  const ids = content.tools.map((tool) => tool.id.trim());
  if (ids.some((id) => !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) || new Set(ids).size !== ids.length) {
    throw new Error("Engineering tools need unique lowercase IDs with hyphens.");
  }
  for (const tool of content.tools) {
    if (!tool.title.trim()) throw new Error("Every visible engineering tool needs a title.");
    for (const value of [tool.url, tool.image]) {
      if (!value || value.startsWith("/")) continue;
      try {
        const url = new URL(value);
        if (!['http:', 'https:'].includes(url.protocol)) throw new Error();
      } catch {
        throw new Error(`Use a complete web address for ${tool.title}.`);
      }
    }
  }
}

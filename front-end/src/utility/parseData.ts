import { detectFormat } from "./detectFormat";

export const parseData = (text: string) => {
  const format = detectFormat(text);

  if (format === "json") {
    try {
      const parsed = JSON.parse(text);
      const records = Array.isArray(parsed)
        ? parsed
        : typeof parsed === "object"
        ? Object.values(parsed)
        : [];

      return { format, records };
    } catch {
      return { format: "json", records: [] };
    }
  }

  if (format === "xml") {
    try {
      const parser = new DOMParser();
      const xml = parser.parseFromString(text, "text/xml");
      const records = [];

      const root = xml.documentElement;
      for (const node of Array.from(root.children)) {
        const item: Record<string, string> = {};
        for (const child of Array.from(node.children)) {
          item[child.nodeName] = child.textContent || "";
        }
        records.push(item);
      }

      return { format, records };
    } catch {
      return { format: "xml", records: [] };
    }
  }

  return { format: "unknown", records: [] };
};

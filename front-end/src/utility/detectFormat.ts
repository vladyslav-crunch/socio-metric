export function detectFormat(text: string) {
  try {
    JSON.parse(text);
    return "json";
  } catch (e) {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(text, "text/xml");
      const hasParserError =
        xmlDoc.getElementsByTagName("parsererror").length > 0;
      return hasParserError ? "unknown" : "xml";
    } catch {
      return "unknown";
    }
  }
}

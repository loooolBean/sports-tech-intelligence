import { JSDOM } from "jsdom";
import { parse, serialize, type DefaultTreeAdapterMap } from "parse5";

// Content extraction needs text/metadata and basic visibility, not visual CSS.
// Tokenize HTML before JSDOM: inline modern calc() expressions can throw from
// JSDOM's CSS parser while it constructs the document (before Readability runs).
export function createArticleDom(html: string, url?: string) {
  const document = parse(html);
  const pending: DefaultTreeAdapterMap["node"][] = [document];
  while (pending.length) {
    const node = pending.pop()!;
    if ("attrs" in node) {
      const style = node.attrs.find(attribute => attribute.name === "style");
      if (style) {
        style.value = style.value.split(";").filter(declaration =>
          /^\s*(display|visibility)\s*:\s*(none|hidden|visible|collapse|block|inline|inline-block|contents|flex|grid)\s*(?:!important)?\s*$/i.test(declaration),
        ).join(";");
      }
    }
    if ("childNodes" in node) {
      node.childNodes = node.childNodes.filter(child => !("tagName" in child && child.tagName === "style"));
      pending.push(...node.childNodes);
    }
    if ("content" in node) pending.push(node.content);
  }
  return new JSDOM(serialize(document), url ? { url } : undefined);
}

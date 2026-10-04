/* Splits a block of text into masked words: <span class="w"><span class="wi">word</span></span>. The outer span
   clips, the inner one rises. Inline elements (an <a>, an <em>) are walked into, so their styling is kept.
   Calling it twice is safe; the second call returns the existing inner spans. */
export function splitWords(el: HTMLElement): HTMLElement[] {
  if (el.dataset.split) return Array.from(el.querySelectorAll<HTMLElement>(".wi"));
  el.dataset.split = "1";
  const walk = (node: Node) => {
    Array.from(node.childNodes).forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const frag = document.createDocumentFragment();
        (child.textContent ?? "").split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
          const outer = document.createElement("span"); outer.className = "w";
          const inner = document.createElement("span"); inner.className = "wi"; inner.textContent = part;
          outer.appendChild(inner); frag.appendChild(outer);
        });
        child.replaceWith(frag);
      } else if (child.nodeType === Node.ELEMENT_NODE && (child as Element).tagName !== "BR") walk(child);
    });
  };
  walk(el);
  return Array.from(el.querySelectorAll<HTMLElement>(".wi"));
}

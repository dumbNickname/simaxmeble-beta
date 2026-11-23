// Runs in the browser before hydration (start.clientSetup in vite.config.ts).
// Every page is its own prerendered document, so internal links do full page
// loads instead of client-side routing.

const smooth = () => (matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth") as ScrollBehavior;

document.addEventListener("click", (e) => {
  const anchor = (e.target as Element).closest?.("a");
  if (!anchor) return;
  const href = anchor.getAttribute("href");
  if (!href || anchor.hasAttribute("target")) return;
  if (href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:")) return;

  // <base href> would resolve a bare "#id" to the homepage; keep it on this page.
  const url = href.startsWith("#") ? new URL(location.pathname + location.search + href, location.href) : new URL(anchor.href);
  const samePage = url.pathname === location.pathname;

  // Same product page, other version (?wariant=ID): tick the radio instead of reloading.
  const variant = samePage && url.searchParams.get("wariant");
  const radio = variant && (document.getElementById(`v-${variant}`) as HTMLInputElement | null);
  if (radio) {
    e.preventDefault();
    radio.checked = true;
    radio.dispatchEvent(new Event("change", { bubbles: true }));
    radio.closest("fieldset")?.scrollIntoView({ behavior: smooth(), block: "center" });
    return;
  }

  // In-page anchors (written with the full path because of <base href>).
  if (samePage && url.hash && url.search === location.search) {
    const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
    if (!target) return;
    e.preventDefault();
    if (target.hasAttribute("data-slide")) {
      // Gallery thumbnail: scroll the slide strip only, not the page.
      const strip = target.parentElement!;
      strip.scrollTo({ left: target.offsetLeft - strip.offsetLeft, behavior: smooth() });
      return;
    }
    history.pushState(null, "", url.pathname + url.search + url.hash);
    target.scrollIntoView({ behavior: smooth() });
    if (!target.matches("a, button, input, select, textarea, [tabindex]")) target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
    return;
  }

  e.preventDefault();
  e.stopPropagation();
  window.location.href = anchor.href;
}, true);

// Back/forward between in-page anchors stays on the same document; only reload on real page changes.
let currentPage = location.pathname + location.search;
window.addEventListener("popstate", () => {
  const page = location.pathname + location.search;
  if (page === currentPage) return;
  currentPage = page;
  window.location.reload();
});

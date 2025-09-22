export function markActiveNav() {
  const path = location.hash || "#/";
  document.querySelectorAll("nav .nav a").forEach((a) => {
    if (a.getAttribute("href") === path) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });
}

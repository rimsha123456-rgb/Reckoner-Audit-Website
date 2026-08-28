/* ==========================================================================
   Reckoner Audit — script.js
   Loads the shared header/footer components, wires up the mobile nav
   toggle, and powers the FAQ accordion.

   NOTE: loadComponent() uses fetch(), which requires the page to be served
   over http(s) (e.g. VS Code "Live Server", `npx serve`, etc). Opening
   index.html directly via file:// will block the fetch in most browsers.
   ========================================================================== */

async function loadComponent(url, targetSelector) {
  const target = document.querySelector(targetSelector);
  if (!target) return;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to load ${url}`);
    target.innerHTML = await response.text();
  } catch (err) {
    console.error(err);
  }
}

function initNavToggle() {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".main-nav");
  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    nav.classList.toggle("open");
  });
}

function initFaqAccordion() {
  const items = document.querySelectorAll(".faq-item");

  items.forEach((item) => {
    const question = item.querySelector(".faq-question");
    const toggleIcon = item.querySelector(".faq-toggle");

    question.addEventListener("click", () => {
      const isOpen = item.classList.contains("open");

      items.forEach((other) => {
        other.classList.remove("open");
        other.querySelector(".faq-toggle").innerHTML = "&plus;";
      });

      if (!isOpen) {
        item.classList.add("open");
        toggleIcon.innerHTML = "&minus;";
      }
    });
  });
}

function setFooterYear() {
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

document.addEventListener("DOMContentLoaded", async () => {
  await Promise.all([
    loadComponent("components/header.html", "#header-placeholder"),
    loadComponent("components/footer.html", "#footer-placeholder"),
  ]);

  initNavToggle();
  initFaqAccordion();
  setFooterYear();
});

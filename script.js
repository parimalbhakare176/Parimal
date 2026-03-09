const year = document.getElementById("year");
if (year) {
  year.textContent = String(new Date().getFullYear());
}

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("show");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
}

function getArticlesFromSettings() {
  if (window.SiteSettings && typeof window.SiteSettings.loadSettings === "function") {
    return window.SiteSettings.loadSettings().articles || [];
  }

  if (Array.isArray(window.articles)) {
    return window.articles;
  }

  return [];
}

function esc(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderArticles() {
  const container = document.getElementById("articles-list");
  if (!container) {
    return;
  }

  const items = getArticlesFromSettings().slice();
  items.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

  if (!items.length) {
    container.innerHTML =
      '<article class="article-card"><p class="tag">No posts yet</p><h3>Add your first article in the visual editor</h3><p>Open editor.html and use the Articles section.</p></article>';
    return;
  }

  container.innerHTML = items
    .map((article) => {
      const link = article.url && article.url !== "#" ? article.url : null;
      const cta = link
        ? `<a class="btn btn-ghost" href="${esc(link)}" target="_blank" rel="noreferrer">Read article</a>`
        : '<span class="tag">Draft mode</span>';

      return `
        <article class="article-card">
          <div class="project-top">
            <p class="tag">${esc(article.category || "Article")}</p>
            <p class="tag">${esc(article.date || "TBD")}</p>
          </div>
          <h3>${esc(article.title || "Untitled")}</h3>
          <p>${esc(article.summary || "Add a short summary for this piece.")}</p>
          <div class="article-meta">
            <span class="pill">${esc(article.status || "Draft")}</span>
            ${cta}
          </div>
        </article>
      `;
    })
    .join("");
}

renderArticles();

window.addEventListener("message", (event) => {
  if (event.data && event.data.type === "site-settings-update") {
    renderArticles();
  }
});

window.addEventListener("storage", (event) => {
  if (window.SiteSettings && event.key === window.SiteSettings.key) {
    renderArticles();
  }
});

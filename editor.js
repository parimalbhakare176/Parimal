(function () {
  const status = document.getElementById("save-status");
  const previewFrame = document.getElementById("preview-frame");
  const articleList = document.getElementById("articles-editor-list");
  const addArticleButton = document.getElementById("add-article");

  let state = window.SiteSettings.loadSettings();

  function esc(value) {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function setDeep(path, value) {
    const keys = path.split(".");
    let ref = state;
    for (let i = 0; i < keys.length - 1; i += 1) {
      if (!ref[keys[i]] || typeof ref[keys[i]] !== "object") {
        ref[keys[i]] = {};
      }
      ref = ref[keys[i]];
    }
    ref[keys[keys.length - 1]] = value;
  }

  function getDeep(path) {
    const keys = path.split(".");
    let ref = state;
    for (let i = 0; i < keys.length; i += 1) {
      if (ref == null) {
        return "";
      }
      ref = ref[keys[i]];
    }
    return ref == null ? "" : ref;
  }

  function renderArticleEditor() {
    articleList.innerHTML = "";
    state.articles.forEach((article, index) => {
      const block = document.createElement("div");
      block.className = "article-edit-item";

      block.innerHTML = `
        <label>Title <input type="text" data-article="${index}" data-key="title" value="${esc(article.title)}" /></label>
        <label>Date <input type="date" data-article="${index}" data-key="date" value="${esc(article.date)}" /></label>
        <label>Category <input type="text" data-article="${index}" data-key="category" value="${esc(article.category)}" /></label>
        <label>Status <input type="text" data-article="${index}" data-key="status" value="${esc(article.status)}" /></label>
        <label>URL <input type="text" data-article="${index}" data-key="url" value="${esc(article.url)}" /></label>
        <label>Summary <textarea rows="3" data-article="${index}" data-key="summary">${esc(article.summary)}</textarea></label>
        <button class="btn btn-outline" type="button" data-remove="${index}">Remove</button>
      `;

      articleList.appendChild(block);
    });

    articleList.querySelectorAll("[data-article]").forEach((input) => {
      input.addEventListener("input", () => {
        const idx = Number(input.getAttribute("data-article"));
        const key = input.getAttribute("data-key");
        state.articles[idx][key] = input.value;
        persist(true);
      });
    });

    articleList.querySelectorAll("[data-remove]").forEach((button) => {
      button.addEventListener("click", () => {
        const idx = Number(button.getAttribute("data-remove"));
        state.articles.splice(idx, 1);
        renderArticleEditor();
        persist(true);
      });
    });
  }

  function syncInputsFromState() {
    document.querySelectorAll("[data-field]").forEach((input) => {
      const key = input.getAttribute("data-field");
      input.value = getDeep(key);
    });
    renderArticleEditor();
  }

  function refreshPreview() {
    if (previewFrame && previewFrame.contentWindow) {
      previewFrame.contentWindow.postMessage(
        { type: "site-settings-update", settings: state },
        "*"
      );
    }
  }

  function persist(silent) {
    window.SiteSettings.saveSettings(state);
    window.SiteSettings.notifyFrames(state);
    refreshPreview();
    window.SiteSettings.applySettingsToPage(state);

    if (!silent) {
      status.textContent = "Saved";
      setTimeout(() => {
        status.textContent = "Ready";
      }, 1000);
    }
  }

  document.querySelectorAll("[data-field]").forEach((input) => {
    input.addEventListener("input", () => {
      const key = input.getAttribute("data-field");
      setDeep(key, input.value);
      persist(true);
      status.textContent = "Editing...";
    });
  });

  addArticleButton.addEventListener("click", () => {
    state.articles.push({
      title: "New article",
      date: "",
      category: "",
      summary: "",
      url: "#",
      status: "Draft"
    });
    renderArticleEditor();
    persist(false);
  });

  document.getElementById("save-now").addEventListener("click", () => {
    persist(false);
  });

  document.getElementById("reset-all").addEventListener("click", () => {
    state = window.SiteSettings.resetSettings();
    syncInputsFromState();
    persist(false);
  });

  document.getElementById("reload-preview").addEventListener("click", () => {
    previewFrame.src = "./index.html";
  });

  syncInputsFromState();
  persist(true);
})();

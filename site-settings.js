(function () {
  const STORAGE_KEY = "parimal_portfolio_settings_v1";

  const DEFAULT_SETTINGS = {
    siteName: "Parimal Bhakare",
    siteTitleSuffix: "Policy Portfolio",
    description:
      "Portfolio website for Parimal Bhakare - Government Projects, Policy Advisory, and Stakeholder Engagement.",
    linkedinUrl: "https://www.linkedin.com/in/parimalbhakare/",
    cvUrl: "./Parimal_Bhakare_CV3.pdf",
    heroEyebrow: "Government Projects and Advisory",
    heroTitle:
      "Policy and programme professional focused on evidence-to-decision execution.",
    heroCopy:
      "I work with government stakeholders, universities, and ecosystem partners to design and implement practical reforms. My work spans policy briefs, stakeholder consultation, delivery planning, and outcomes reporting.",
    stat1Value: "3+ Years",
    stat1Label: "Policy and programme delivery",
    stat2Value: "200K+",
    stat2Label: "Digital impressions from TEDx community work",
    stat3Value: "IIT Bombay",
    stat3Label: "Master of Public Policy (2024-2026)",
    contactTitle: "Let us collaborate on policy and implementation challenges.",
    location: "Mumbai, India (Willing to relocate)",
    phone: "+91-7756899120",
    emailPrimary: "parimalbhakare176@gmail.com",
    emailSecondary: "parimalbhakare@iitb.ac.in",
    articlesTitle: "Blogs and articles on policy, governance, and implementation.",
    articlesSubtitle:
      "This page is designed for continuous updates. Add or edit entries from the visual editor.",
    theme: {
      bg: "#f7f8f2",
      text: "#1a1814",
      muted: "#64615a",
      card: "#fefefe",
      border: "#ded9cb",
      accent: "#d95a2b",
      accentSoft: "#f2cab5"
    },
    fonts: {
      body: "'Manrope', sans-serif",
      heading: "'Space Grotesk', sans-serif"
    },
    articles: [
      {
        title: "Why Evidence-to-Decision Matters in Public Policy Delivery",
        date: "2026-03-01",
        category: "Policy Design",
        summary:
          "A practical framework for converting policy intent into measurable outcomes through options appraisal, stakeholder alignment, and KPI-based monitoring.",
        url: "#",
        status: "Draft"
      },
      {
        title: "Lessons from Multi-Stakeholder Program Implementation in India",
        date: "2026-02-12",
        category: "Program Delivery",
        summary:
          "Key implementation patterns from cross-department coordination, partner management, and governance structures used in ground-level interventions.",
        url: "#",
        status: "Draft"
      },
      {
        title: "Building Community-Led Platforms: TEDx as a Civic Engagement Model",
        date: "2026-01-20",
        category: "Community",
        summary:
          "Operational and strategic takeaways from running city-level idea platforms with speakers, partners, and public audiences.",
        url: "#",
        status: "Draft"
      }
    ]
  };

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function merge(defaults, incoming) {
    const out = clone(defaults);
    if (!incoming || typeof incoming !== "object") {
      return out;
    }

    Object.keys(incoming).forEach((key) => {
      const val = incoming[key];
      if (
        val &&
        typeof val === "object" &&
        !Array.isArray(val) &&
        out[key] &&
        typeof out[key] === "object" &&
        !Array.isArray(out[key])
      ) {
        out[key] = { ...out[key], ...val };
      } else {
        out[key] = val;
      }
    });

    if (!Array.isArray(out.articles)) {
      out.articles = clone(defaults.articles);
    }

    return out;
  }

  function loadSettings() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return clone(DEFAULT_SETTINGS);
      }
      const parsed = JSON.parse(raw);
      return merge(DEFAULT_SETTINGS, parsed);
    } catch (error) {
      return clone(DEFAULT_SETTINGS);
    }
  }

  function saveSettings(settings) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }

  function resetSettings() {
    const defaults = clone(DEFAULT_SETTINGS);
    saveSettings(defaults);
    return defaults;
  }

  function applyTheme(settings) {
    const root = document.documentElement;
    if (!root) {
      return;
    }

    root.style.setProperty("--bg", settings.theme.bg || DEFAULT_SETTINGS.theme.bg);
    root.style.setProperty("--text", settings.theme.text || DEFAULT_SETTINGS.theme.text);
    root.style.setProperty("--muted", settings.theme.muted || DEFAULT_SETTINGS.theme.muted);
    root.style.setProperty("--card", settings.theme.card || DEFAULT_SETTINGS.theme.card);
    root.style.setProperty("--border", settings.theme.border || DEFAULT_SETTINGS.theme.border);
    root.style.setProperty("--accent", settings.theme.accent || DEFAULT_SETTINGS.theme.accent);
    root.style.setProperty(
      "--accent-soft",
      settings.theme.accentSoft || DEFAULT_SETTINGS.theme.accentSoft
    );

    root.style.setProperty(
      "--font-body",
      settings.fonts.body || DEFAULT_SETTINGS.fonts.body
    );
    root.style.setProperty(
      "--font-heading",
      settings.fonts.heading || DEFAULT_SETTINGS.fonts.heading
    );
  }

  function setTextByKey(settings) {
    document.querySelectorAll("[data-setting]").forEach((node) => {
      const key = node.getAttribute("data-setting");
      if (!key || !(key in settings)) {
        return;
      }
      node.textContent = settings[key];
    });
  }

  function setLinkByKey(settings) {
    document.querySelectorAll("[data-link]").forEach((node) => {
      const key = node.getAttribute("data-link");
      if (key === "linkedin") {
        node.setAttribute("href", settings.linkedinUrl);
      }
      if (key === "cv") {
        node.setAttribute("href", settings.cvUrl);
      }
      if (key === "emailPrimary") {
        node.setAttribute("href", "mailto:" + settings.emailPrimary);
      }
      if (key === "emailSecondary") {
        node.setAttribute("href", "mailto:" + settings.emailSecondary);
      }
    });
  }

  function applySettingsToPage(optionalSettings) {
    const settings = optionalSettings || loadSettings();
    applyTheme(settings);
    setTextByKey(settings);
    setLinkByKey(settings);

    const titleNode = document.querySelector("title");
    if (titleNode) {
      titleNode.textContent = settings.siteName + " | " + settings.siteTitleSuffix;
    }

    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", settings.description || DEFAULT_SETTINGS.description);
    }

    const footerName = document.querySelector("[data-footer-name]");
    if (footerName) {
      footerName.textContent = settings.siteName;
    }

    return settings;
  }

  function notifyFrames(settings) {
    const payload = { type: "site-settings-update", settings: settings };
    window.postMessage(payload, "*");
  }

  window.addEventListener("message", function (event) {
    if (!event.data || event.data.type !== "site-settings-update") {
      return;
    }
    applySettingsToPage(event.data.settings);
  });

  window.addEventListener("storage", function (event) {
    if (event.key === STORAGE_KEY) {
      applySettingsToPage(loadSettings());
    }
  });

  window.SiteSettings = {
    key: STORAGE_KEY,
    defaults: clone(DEFAULT_SETTINGS),
    loadSettings: loadSettings,
    saveSettings: saveSettings,
    resetSettings: resetSettings,
    applySettingsToPage: applySettingsToPage,
    notifyFrames: notifyFrames
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      applySettingsToPage(loadSettings());
    });
  } else {
    applySettingsToPage(loadSettings());
  }
})();

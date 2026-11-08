(function () {
  const root = document.documentElement;
  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  let reduceMotion = motionQuery.matches;

  const timezones = [
    { city: "Estepona", zone: "Europe/Madrid", code: "CET" },
    { city: "London", zone: "Europe/London", code: "GMT" },
    { city: "New York", zone: "America/New_York", code: "ET" },
    { city: "Dubai", zone: "Asia/Dubai", code: "GST" },
  ];

  function safe(label, fn) {
    try {
      fn();
    } catch (error) {
      console.error(label, error);
    }
  }

  function currentTheme() {
    return root.getAttribute("data-theme") === "dark" ? "dark" : "light";
  }

  let lockCount = 0;
  let lockedY = 0;

  function lockScroll() {
    if (lockCount === 0) {
      lockedY = window.scrollY || window.pageYOffset || 0;
      document.body.style.position = "fixed";
      document.body.style.top = "-" + lockedY + "px";
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.width = "100%";
    }
    lockCount += 1;
  }

  function unlockScroll() {
    lockCount = Math.max(0, lockCount - 1);
    if (lockCount === 0) {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";
      const previous = root.style.scrollBehavior;
      root.style.scrollBehavior = "auto";
      window.scrollTo(0, lockedY);
      root.style.scrollBehavior = previous;
    }
  }

  safe("clocks", function initClocks() {
    const marquee = document.querySelector(".animate-marquee");
    const track = marquee && marquee.querySelector("[data-marquee-track]");
    if (marquee && track && !marquee.querySelector("[data-marquee-clone]")) {
      const clone = track.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");
      clone.dataset.marqueeClone = "true";
      marquee.appendChild(clone);
    }

    const formatters = {};
    timezones.forEach(function (item) {
      formatters[item.zone] = new Intl.DateTimeFormat("en-GB", {
        timeZone: item.zone,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
    });

    function renderClocks() {
      document.querySelectorAll("[data-clock]").forEach(function (node) {
        const zone = node.getAttribute("data-clock");
        const formatter = formatters[zone];
        if (!formatter) return;
        try {
          node.textContent = formatter.format(new Date());
        } catch (error) {
          node.textContent = "--:--:--";
        }
      });
    }

    renderClocks();
    let timer = window.setInterval(renderClocks, 1000);
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        window.clearInterval(timer);
        timer = null;
      } else if (!timer) {
        renderClocks();
        timer = window.setInterval(renderClocks, 1000);
      }
    });
  });

  safe("theme", function initTheme() {
    const toggle = document.getElementById("themeToggleBtn");
    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (!toggle) return;

    function sync(theme) {
      root.setAttribute("data-theme", theme);
      if (themeColor) themeColor.setAttribute("content", theme === "dark" ? "#17484d" : "#e3fdfd");
      toggle.setAttribute("aria-label", theme === "dark" ? "Switch to light theme" : "Switch to dark theme");
      toggle.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
      document.dispatchEvent(new CustomEvent("welly-theme", { detail: theme }));
    }

    sync(currentTheme());

    toggle.addEventListener("click", function () {
      const next = currentTheme() === "dark" ? "light" : "dark";
      try {
        localStorage.setItem("welly-theme", next);
      } catch (error) {
        /* storage can be blocked; the toggle still applies for this view */
      }
      sync(next);
    });
  });

  const navMenuBtn = document.getElementById("navMenuBtn");
  const fullNavMenu = document.getElementById("fullNavMenu");
  const barTop = document.getElementById("barTop");
  const barMid = document.getElementById("barMid");
  const barBot = document.getElementById("barBot");
  const projectModal = document.getElementById("projectModal");
  let isNavOpen = false;
  let modalReturnFocus = null;

  function focusable(container) {
    return Array.from(
      container.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])')
    ).filter(function (el) {
      return !el.closest("[hidden]") && !el.hasAttribute("disabled");
    });
  }

  function applyInert() {
    const modalOpen = projectModal && !projectModal.hidden;
    const keep = new Set();
    if (modalOpen) {
      keep.add(projectModal);
    } else if (isNavOpen) {
      keep.add(fullNavMenu);
      keep.add(navMenuBtn);
    }
    Array.from(document.body.children).forEach(function (child) {
      child.inert = keep.size > 0 && !keep.has(child);
    });
    if (fullNavMenu) fullNavMenu.inert = !isNavOpen || modalOpen;
  }

  function setMenu(open, options) {
    if (!navMenuBtn || !fullNavMenu) return;
    options = options || {};
    isNavOpen = open;
    navMenuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    navMenuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    fullNavMenu.classList.toggle("translate-x-full", !open);
    fullNavMenu.classList.toggle("pointer-events-none", !open);
    fullNavMenu.setAttribute("aria-hidden", open ? "false" : "true");
    if (barTop) barTop.classList.toggle("translate-y-[7px]", open);
    if (barTop) barTop.classList.toggle("rotate-45", open);
    if (barMid) barMid.classList.toggle("opacity-0", open);
    if (barBot) barBot.classList.toggle("-translate-y-[7px]", open);
    if (barBot) barBot.classList.toggle("-rotate-45", open);
    if (open) lockScroll();
    else unlockScroll();
    applyInert();
    if (!open && options.focusTarget && typeof options.focusTarget.focus === "function") {
      options.focusTarget.focus({ preventScroll: true });
    } else if (!open && options.returnFocus !== false) {
      navMenuBtn.focus();
    }
  }

  safe("menu", function initMenu() {
    if (!navMenuBtn || !fullNavMenu) return;
    fullNavMenu.inert = true;
    navMenuBtn.addEventListener("click", function () {
      setMenu(!isNavOpen);
    });

    fullNavMenu.querySelectorAll("a[href^='#']").forEach(function (link) {
      link.addEventListener("click", function (event) {
        const id = link.getAttribute("href");
        const target = id && document.querySelector(id);
        if (!target) {
          if (isNavOpen) setMenu(false);
          return;
        }
        event.preventDefault();
        if (isNavOpen) setMenu(false, { returnFocus: false });
        window.requestAnimationFrame(function () {
          target.setAttribute("tabindex", "-1");
          target.focus({ preventScroll: true });
          target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
          if (history.pushState) history.pushState(null, "", id);
        });
      });
    });
  });

  safe("works", function initWorks() {
    const filterContainer = document.getElementById("filterTagsContainer");
    const searchInput = document.getElementById("searchInput");
    const empty = document.getElementById("worksEmpty");
    const status = document.getElementById("worksStatus");
    const cards = Array.from(document.querySelectorAll(".work-card"));
    if (!filterContainer || !cards.length) return;

    const allCategories = [
      "All",
      "Real Estate",
      "Relocation",
      "Interior Design",
      "Renovation",
      "Editorial",
      "Culture",
      "Wellness",
      "Health",
      "Coaching",
      "Costa del Sol",
    ];

    let currentFilter = "All";
    let searchQuery = "";
    let interacted = false;

    function tagsOf(card) {
      return (card.dataset.tags || "")
        .split(",")
        .map(function (tag) {
          return tag.trim();
        })
        .filter(Boolean);
    }

    function applyFilters() {
      const query = searchQuery.toLowerCase().trim();
      let shown = 0;
      cards.forEach(function (card) {
        const tags = tagsOf(card);
        const category = card.dataset.category || "";
        const title = card.dataset.title || "";
        const summary = card.dataset.summary || "";
        const matchesCategory =
          currentFilter === "All" ||
          tags.indexOf(currentFilter) !== -1 ||
          category.toLowerCase().indexOf(currentFilter.toLowerCase()) !== -1;
        const haystack = [title, summary, category].concat(tags).join(" ").toLowerCase();
        const matchesSearch = !query || haystack.indexOf(query) !== -1;
        const visible = matchesCategory && matchesSearch;
        card.classList.toggle("is-filtered-out", !visible);
        if (visible) shown += 1;
      });
      if (empty) {
        empty.classList.toggle("is-filtered-out", shown !== 0);
        if (shown === 0) {
          empty.textContent = query
            ? 'No projects found matching "' + searchQuery.trim() + '" in ' + currentFilter + "."
            : "No projects found in " + currentFilter + ".";
        }
      }
      if (status && interacted) {
        status.textContent = shown === 1 ? "Showing 1 project." : "Showing " + shown + " projects.";
      }
    }

    function renderFilterButtons() {
      filterContainer.replaceChildren();
      allCategories.forEach(function (category) {
        const button = document.createElement("button");
        const active = category === currentFilter;
        button.type = "button";
        button.className =
          "tag-filter-btn inline-flex min-h-11 items-center border border-brand-primary/50 px-3 py-1.5 text-xs uppercase tracking-[0.18em] transition-colors " +
          (active
            ? "bg-brand-primary font-bold text-brand-cream"
            : "hover:bg-brand-primary hover:text-brand-cream");
        button.setAttribute("aria-pressed", active ? "true" : "false");
        button.textContent = category;
        button.addEventListener("click", function () {
          currentFilter = category;
          interacted = true;
          renderFilterButtons();
          applyFilters();
        });
        filterContainer.appendChild(button);
      });
    }

    renderFilterButtons();
    applyFilters();

    if (searchInput) {
      searchInput.addEventListener("input", function () {
        searchQuery = searchInput.value;
        interacted = true;
        applyFilters();
      });
    }

    cards.forEach(function (card) {
      const button = card.querySelector("button");
      if (!button) return;
      button.addEventListener("click", function () {
        openModal(card, button);
      });
    });
  });

  function openModal(card, trigger) {
    if (!projectModal) return;
    const title = document.getElementById("modalTitle");
    const category = document.getElementById("modalCategory");
    const description = document.getElementById("modalDescription");
    const image = document.getElementById("modalImage");
    const tags = document.getElementById("modalTags");
    const visit = document.getElementById("modalVisitLink");
    const source = card.querySelector("img");
    if (title) title.textContent = card.dataset.title || "";
    if (category) category.textContent = card.dataset.category || "";
    if (description) description.textContent = card.dataset.summary || "";
    if (image && source) {
      image.src = source.currentSrc || source.src;
      image.alt = source.alt || card.dataset.title || "";
    }
    if (visit) {
      visit.href = card.dataset.url || "#";
    }
    if (tags) {
      tags.replaceChildren();
      (card.dataset.tags || "")
        .split(",")
        .map(function (tag) {
          return tag.trim();
        })
        .filter(Boolean)
        .forEach(function (tag) {
          const chip = document.createElement("span");
          chip.className = "border border-brand-primary/40 px-2 py-1 font-mono text-xs uppercase tracking-[0.15em]";
          chip.textContent = tag;
          tags.appendChild(chip);
        });
    }
    if (isNavOpen) setMenu(false);
    modalReturnFocus = trigger || document.activeElement;
    projectModal.hidden = false;
    projectModal.setAttribute("aria-hidden", "false");
    lockScroll();
    applyInert();
    const panel = projectModal.querySelector(".modal-panel");
    if (panel) {
      panel.tabIndex = -1;
      panel.focus();
    }
  }

  function closeModal() {
    if (!projectModal || projectModal.hidden) return;
    projectModal.hidden = true;
    projectModal.setAttribute("aria-hidden", "true");
    unlockScroll();
    applyInert();
    if (modalReturnFocus && typeof modalReturnFocus.focus === "function") modalReturnFocus.focus();
    modalReturnFocus = null;
  }

  safe("modal", function initModal() {
    if (!projectModal) return;
    const closeBtn = document.getElementById("closeModalBtn");
    const actionBtn = document.getElementById("modalActionBtn");
    if (closeBtn) closeBtn.addEventListener("click", closeModal);
    if (actionBtn) actionBtn.addEventListener("click", closeModal);
    projectModal.addEventListener("click", function (event) {
      if (event.target === projectModal) closeModal();
    });
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      if (projectModal && !projectModal.hidden) {
        event.preventDefault();
        closeModal();
        return;
      }
      if (isNavOpen) {
        event.preventDefault();
        setMenu(false);
      }
      return;
    }

    if (event.key !== "Tab") return;
    const modalOpen = projectModal && !projectModal.hidden;
    const container = modalOpen ? projectModal : isNavOpen ? fullNavMenu : null;
    if (!container) return;
    let items = focusable(container);
    if (!modalOpen && isNavOpen && navMenuBtn) items = [navMenuBtn].concat(items);
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && (document.activeElement === first || document.activeElement === container)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  motionQuery.addEventListener("change", function () {
    reduceMotion = motionQuery.matches;
    document.dispatchEvent(new CustomEvent("welly-motion", { detail: reduceMotion }));
  });

})();

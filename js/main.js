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

  function onIdle(fn) {
    const run = function () {
      fn();
    };
    const schedule = function () {
      if (window.requestIdleCallback) window.requestIdleCallback(run, { timeout: 1500 });
      else window.setTimeout(run, 600);
    };
    if (document.readyState === "complete") schedule();
    else window.addEventListener("load", schedule);
  }

  function pauseOffscreen(selector) {
    const nodes = document.querySelectorAll(selector);
    if (!nodes.length || !window.IntersectionObserver) return;
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        entry.target.classList.toggle("is-paused", !entry.isIntersecting);
      });
    });
    nodes.forEach(function (node) {
      node.classList.add("is-paused");
      observer.observe(node);
    });
  }

  pauseOffscreen(".animate-marquee, .animate-vinyl, .animate-pulse");

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

  onIdle(function () {
  safe("clocks", function initClocks() {
    if (!window.matchMedia("(min-width: 768px)").matches) return;
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
  });

  safe("theme", function initTheme() {
    const toggle = document.getElementById("themeToggleBtn");
    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (!toggle) return;

    function sync(theme) {
      root.setAttribute("data-theme", theme);
      if (themeColor) themeColor.setAttribute("content", theme === "dark" ? "#17484d" : "#e3fdfd");
      const toDark = root.dataset.themeToDark || "Switch to dark theme";
      const toLight = root.dataset.themeToLight || "Switch to light theme";
      toggle.setAttribute("aria-label", theme === "dark" ? toLight : toDark);
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
    const openLabel = navMenuBtn.dataset.labelOpen || "Open menu";
    const closeLabel = navMenuBtn.dataset.labelClose || "Close menu";
    navMenuBtn.setAttribute("aria-label", open ? closeLabel : openLabel);
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

  onIdle(function () {
  safe("works", function initWorks() {
    const filterContainer = document.getElementById("filterTagsContainer");
    const searchInput = document.getElementById("searchInput");
    const empty = document.getElementById("worksEmpty");
    const status = document.getElementById("worksStatus");
    const cards = Array.from(document.querySelectorAll(".work-card"));
    if (!filterContainer || !cards.length) return;

    const buttons = Array.from(filterContainer.querySelectorAll("[data-cat]"));
    const grid = document.getElementById("worksGrid");
    let currentFilter = "*";
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
        const tagLabels = (card.dataset.tagLabels || "")
          .split(",")
          .map(function (tag) {
            return tag.trim();
          })
          .filter(Boolean);
        const matchesCategory =
          currentFilter === "*" ||
          tags.indexOf(currentFilter) !== -1 ||
          category.toLowerCase().indexOf(currentFilter.toLowerCase()) !== -1;
        const haystack = [title, summary, category].concat(tags, tagLabels).join(" ").toLowerCase();
        const matchesSearch = !query || haystack.indexOf(query) !== -1;
        const visible = matchesCategory && matchesSearch;
        card.classList.toggle("is-filtered-out", !visible);
        if (visible) shown += 1;
      });
      if (empty) {
        empty.classList.toggle("is-filtered-out", shown !== 0);
        if (shown === 0) {
          const withQuery = (grid && grid.dataset.emptyQuery) || 'No projects found matching "{query}" in {filter}.';
          const noQuery = (grid && grid.dataset.emptyFilter) || "No projects found in {filter}.";
          const activeButton = buttons.find(function (button) {
            return button.getAttribute("data-cat") === currentFilter;
          });
          const filterLabel = activeButton ? activeButton.textContent.trim() : currentFilter;
          empty.textContent = (query ? withQuery : noQuery)
            .replace("{query}", searchQuery.trim())
            .replace("{filter}", filterLabel);
        }
      }
      if (status && interacted) {
        const one = (grid && grid.dataset.statusOne) || "Showing 1 project.";
        const many = (grid && grid.dataset.statusMany) || "Showing {count} projects.";
        status.textContent = shown === 1 ? one : many.replace("{count}", String(shown));
      }
    }

    function renderFilterButtons() {
      buttons.forEach(function (button) {
        const active = button.getAttribute("data-cat") === currentFilter;
        button.className =
          "tag-filter-btn inline-flex min-h-11 items-center border border-brand-primary/50 px-3 py-1.5 text-xs uppercase tracking-[0.18em] transition-colors " +
          (active
            ? "bg-brand-primary font-bold text-brand-cream"
            : "hover:bg-brand-primary hover:text-brand-cream");
        button.setAttribute("aria-pressed", active ? "true" : "false");
      });
    }

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        currentFilter = button.getAttribute("data-cat");
        interacted = true;
        renderFilterButtons();
        applyFilters();
      });
    });

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
      (card.dataset.tagLabels || card.dataset.tags || "")
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

  onIdle(function () {
  safe("language", function initLanguage() {
    const hintCopy = {
      en: { href: "/", text: "Continue in English", lang: "en" },
      es: { href: "/es/", text: "Continuar en español", lang: "es" },
      pt: { href: "/pt/", text: "Continuar em português", lang: "pt-BR" },
      ru: { href: "/ru/", text: "Продолжить на русском", lang: "ru" },
    };

    document.querySelectorAll("[data-lang-switcher]").forEach(function (rootEl) {
      const button = rootEl.querySelector("button");
      const menu = rootEl.querySelector("[data-lang-menu]");
      if (!button || !menu) return;
      const links = Array.from(menu.querySelectorAll("a"));

      function closeMenu() {
        menu.hidden = true;
        button.setAttribute("aria-expanded", "false");
      }

      function openMenu() {
        document.querySelectorAll("[data-lang-menu]").forEach(function (other) {
          other.hidden = true;
        });
        document.querySelectorAll("[data-lang-switcher] button").forEach(function (other) {
          other.setAttribute("aria-expanded", "false");
        });
        menu.hidden = false;
        button.setAttribute("aria-expanded", "true");
        const current = menu.querySelector('[aria-current="page"]') || links[0];
        if (current) current.focus();
      }

      button.addEventListener("click", function () {
        if (menu.hidden) openMenu();
        else closeMenu();
      });

      menu.addEventListener("keydown", function (event) {
        const index = links.indexOf(document.activeElement);
        if (event.key === "ArrowDown" || event.key === "ArrowRight") {
          event.preventDefault();
          links[(index + 1 + links.length) % links.length].focus();
        } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
          event.preventDefault();
          links[(index - 1 + links.length) % links.length].focus();
        } else if (event.key === "Home") {
          event.preventDefault();
          links[0].focus();
        } else if (event.key === "End") {
          event.preventDefault();
          links[links.length - 1].focus();
        } else if (event.key === "Escape") {
          event.preventDefault();
          event.stopPropagation();
          closeMenu();
          button.focus();
        }
      });

      document.addEventListener("click", function (event) {
        if (!rootEl.contains(event.target)) closeMenu();
      });

      document.addEventListener(
        "keydown",
        function (event) {
          if (event.key === "Escape" && !menu.hidden) {
            event.preventDefault();
            event.stopPropagation();
            closeMenu();
            button.focus();
          }
        },
        true
      );
    });

    document.querySelectorAll("a[data-set-lang]").forEach(function (link) {
      link.addEventListener("click", function () {
        const hash = window.location.hash;
        const base = link.getAttribute("href") || "/";
        if (hash && /^#[A-Za-z0-9-]+$/.test(hash)) link.href = base + hash;
        try {
          localStorage.setItem("welly-lang", link.getAttribute("data-set-lang"));
        } catch (error) {
          /* storage can be blocked */
        }
      });
    });

    const hint = document.getElementById("langHint");
    const current = root.getAttribute("data-lang");
    let saved = null;
    try {
      saved = localStorage.getItem("welly-lang");
    } catch (error) {
      saved = null;
    }
    if (hint && saved && hintCopy[saved] && saved !== current && sessionStorage.getItem("welly-lang-hint") !== "off") {
      const link = document.getElementById("langHintLink");
      const hash = window.location.hash;
      link.href = hintCopy[saved].href + (/^#[A-Za-z0-9-]+$/.test(hash) ? hash : "");
      link.textContent = hintCopy[saved].text;
      link.hreflang = hintCopy[saved].lang;
      link.addEventListener("click", function () {
        try {
          localStorage.setItem("welly-lang", saved);
        } catch (error) {
          /* ignore */
        }
      });
      hint.hidden = false;
    }
    const dismiss = document.getElementById("langHintDismiss");
    if (dismiss && hint) {
      dismiss.addEventListener("click", function () {
        hint.hidden = true;
        try {
          sessionStorage.setItem("welly-lang-hint", "off");
        } catch (error) {
          /* ignore */
        }
      });
    }
  });
  });

  safe("visual", function initFeaturedVisual() {
    const container = document.getElementById("threeContainer");
    if (!container) return;

    const state = {
      rotX: 0.4,
      rotY: 0.6,
      angle: 0,
      dragging: false,
      pointer: null,
    };
    let api = null;
    let started = false;
    let raf = 0;
    let visible = false;

    function webglAvailable() {
      try {
        const test = document.createElement("canvas");
        return !!(window.WebGLRenderingContext && (test.getContext("webgl") || test.getContext("experimental-webgl")));
      } catch (error) {
        return false;
      }
    }

    function loadThree() {
      if (window.THREE) return Promise.resolve();
      return new Promise(function (resolve, reject) {
        const script = document.createElement("script");
        script.src = "/js/vendor/three.r128.min.js";
        script.async = true;
        script.onload = function () {
          resolve();
        };
        script.onerror = function () {
          reject(new Error("Three.js failed to load"));
        };
        document.body.appendChild(script);
      });
    }

    function colors() {
      const dark = currentTheme() === "dark";
      return {
        dark: dark,
        stroke: dark ? "rgba(227, 253, 253, 0.55)" : "rgba(23, 72, 77, 0.42)",
        core: dark ? "#e3fdfd" : "#17484d",
        knot: dark ? 0xe3fdfd : 0x48614b,
      };
    }

    function mount2d(allowSpin) {
      container.replaceChildren();
      const canvas = document.createElement("canvas");
      canvas.className = "block h-full w-full";
      canvas.setAttribute("aria-hidden", "true");
      container.appendChild(canvas);
      const ctx = canvas.getContext("2d");
      let width = 0;
      let height = 0;

      function resize() {
        const rect = container.getBoundingClientRect();
        width = Math.max(1, Math.round(rect.width));
        height = Math.max(1, Math.round(rect.height));
        const ratio = Math.min(window.devicePixelRatio || 1, window.innerWidth < 768 ? 1.5 : 2);
        canvas.width = Math.round(width * ratio);
        canvas.height = Math.round(height * ratio);
        canvas.style.width = width + "px";
        canvas.style.height = height + "px";
        ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      }

      function render() {
        if (!width || !height) resize();
        const palette = colors();
        ctx.clearRect(0, 0, width, height);
        const radius = Math.min(width, height) * 0.32;
        ctx.save();
        ctx.translate(width / 2, height / 2);
        ctx.strokeStyle = palette.stroke;
        ctx.lineWidth = 1.2;
        const rings = 14;
        for (let i = 0; i < rings; i += 1) {
          const phi = (i / rings) * Math.PI;
          ctx.save();
          ctx.rotate(state.rotY + phi + state.angle * 0.3);
          ctx.scale(Math.cos(state.rotX + phi * 0.5), 1);
          ctx.beginPath();
          ctx.arc(0, 0, radius * (0.4 + 0.6 * Math.sin(phi)), 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }
        ctx.beginPath();
        ctx.arc(0, 0, 6, 0, Math.PI * 2);
        ctx.fillStyle = palette.core;
        ctx.fill();
        ctx.restore();
      }

      resize();
      render();
      api = {
        resize: function () {
          resize();
          render();
        },
        render: render,
        spin: function () {
          if (!allowSpin || reduceMotion || state.dragging) return;
          state.angle += 0.012;
          state.rotY += 0.004;
        },
        setTheme: render,
      };
      if (visible && !reduceMotion) loop();
    }

    function mountThree() {
      const THREE = window.THREE;
      const rect = container.getBoundingClientRect();
      const width = Math.max(1, rect.width);
      const height = Math.max(1, rect.height || width * 0.75);
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
      camera.position.z = 4.2;
      const smallScreen = window.innerWidth < 768;
      const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: !smallScreen,
        powerPreference: smallScreen ? "low-power" : "default",
        failIfMajorPerformanceCaveat: false,
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, smallScreen ? 1.5 : 2));
      renderer.domElement.setAttribute("aria-hidden", "true");
      container.replaceChildren(renderer.domElement);

      const geometry = new THREE.TorusKnotGeometry(1.1, 0.32, smallScreen ? 48 : 96, smallScreen ? 8 : 12, 2, 3);
      const material = new THREE.MeshStandardMaterial({
        color: colors().knot,
        wireframe: true,
        roughness: 0.3,
        metalness: 0.8,
      });
      const knot = new THREE.Mesh(geometry, material);
      knot.rotation.x = state.rotX;
      knot.rotation.y = state.rotY;
      scene.add(knot);
      scene.add(new THREE.AmbientLight(0xffffff, 0.9));
      const dir = new THREE.DirectionalLight(0xfff5e6, 1.2);
      dir.position.set(5, 5, 5);
      scene.add(dir);

      function resize() {
        const box = container.getBoundingClientRect();
        if (!box.width || !box.height) return;
        camera.aspect = box.width / box.height;
        camera.updateProjectionMatrix();
        renderer.setSize(box.width, box.height);
      }

      function render() {
        renderer.render(scene, camera);
      }

      render();
      api = {
        resize: function () {
          resize();
          render();
        },
        render: render,
        spin: function () {
          if (reduceMotion || state.dragging) return;
          knot.rotation.x += 0.003;
          knot.rotation.y += 0.005;
          state.rotX = knot.rotation.x;
          state.rotY = knot.rotation.y;
        },
        nudge: function (dx, dy) {
          knot.rotation.y += dx;
          knot.rotation.x += dy;
          state.rotX = knot.rotation.x;
          state.rotY = knot.rotation.y;
        },
        setTheme: function () {
          material.color.setHex(colors().knot);
          render();
        },
      };
      if (visible && !reduceMotion) loop();
    }

    function boot() {
      if (started) return;
      started = true;
      if (reduceMotion || !webglAvailable()) {
        mount2d(!reduceMotion);
        return;
      }
      loadThree()
        .then(function () {
          try {
            mountThree();
          } catch (error) {
            console.warn("WebGL initialization failed, using canvas.", error);
            mount2d(true);
          }
        })
        .catch(function () {
          mount2d(true);
        });
    }

    let pageIdle = false;
    let wantsThree = false;
    const frameGap = window.innerWidth < 768 ? 34 : 16;
    let lastFrame = 0;

    function loop() {
      window.cancelAnimationFrame(raf);
      const step = function (now) {
        if (!visible || document.hidden || reduceMotion) return;
        if (now - lastFrame >= frameGap && api) {
          lastFrame = now;
          api.spin();
          api.render();
        }
        raf = window.requestAnimationFrame(step);
      };
      raf = window.requestAnimationFrame(step);
    }

    function tryBoot() {
      if (!pageIdle || !wantsThree) return;
      boot();
    }

    function markIdle() {
      pageIdle = true;
      tryBoot();
    }

    function scheduleIdle() {
      if (window.requestIdleCallback) window.requestIdleCallback(markIdle, { timeout: 2500 });
      else window.setTimeout(markIdle, 1200);
    }

    if (document.readyState === "complete") scheduleIdle();
    else window.addEventListener("load", scheduleIdle);

    window.addEventListener("pointerdown", markIdle, { once: true, passive: true });

    container.addEventListener("keydown", function (event) {
      const stepSize = 0.12;
      let dx = 0;
      let dy = 0;
      if (event.key === "ArrowLeft") dx = -stepSize;
      else if (event.key === "ArrowRight") dx = stepSize;
      else if (event.key === "ArrowUp") dy = -stepSize;
      else if (event.key === "ArrowDown") dy = stepSize;
      else return;
      event.preventDefault();
      if (api && api.nudge) api.nudge(dx, dy);
      else {
        state.rotY += dx;
        state.rotX += dy;
      }
      if (api) api.render();
    });

    container.addEventListener("mousedown", function (event) {
      state.dragging = true;
      state.pointer = { x: event.clientX, y: event.clientY };
    });
    window.addEventListener("mouseup", function () {
      state.dragging = false;
      state.pointer = null;
    });
    window.addEventListener("mousemove", function (event) {
      if (!state.dragging || !state.pointer) return;
      const dx = (event.clientX - state.pointer.x) * 0.008;
      const dy = (event.clientY - state.pointer.y) * 0.008;
      state.pointer = { x: event.clientX, y: event.clientY };
      if (api && api.nudge) api.nudge(dx, dy);
      else {
        state.rotY += dx;
        state.rotX += dy;
      }
      if (api) api.render();
    });

    container.addEventListener(
      "touchstart",
      function (event) {
        if (event.touches.length !== 1) return;
        state.pointer = { x: event.touches[0].clientX, y: event.touches[0].clientY, axis: null };
      },
      { passive: true }
    );
    container.addEventListener(
      "touchmove",
      function (event) {
        if (!state.pointer || event.touches.length !== 1) return;
        const x = event.touches[0].clientX;
        const y = event.touches[0].clientY;
        const dx = x - state.pointer.x;
        const dy = y - state.pointer.y;
        if (!state.pointer.axis) {
          if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
          state.pointer.axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
        }
        if (state.pointer.axis === "y") return;
        event.preventDefault();
        state.dragging = true;
        if (api && api.nudge) api.nudge(dx * 0.008, dy * 0.008);
        else {
          state.rotY += dx * 0.008;
          state.rotX += dy * 0.008;
        }
        if (api) api.render();
        state.pointer.x = x;
        state.pointer.y = y;
      },
      { passive: false }
    );
    window.addEventListener("touchend", function () {
      state.dragging = false;
      state.pointer = null;
    });

    if (window.ResizeObserver) {
      const observer = new ResizeObserver(function () {
        if (api) api.resize();
      });
      observer.observe(container);
    } else {
      window.addEventListener("resize", function () {
        if (api) api.resize();
      });
    }

    const visibility = new IntersectionObserver(
      function (entries) {
        visible = entries.some(function (entry) {
          return entry.isIntersecting && entry.intersectionRatio >= 0.15;
        });
        wantsThree = entries.some(function (entry) {
          return entry.isIntersecting && entry.intersectionRatio >= 0.45;
        });
        if (wantsThree) tryBoot();
        if (!visible || reduceMotion) window.cancelAnimationFrame(raf);
        else if (api) loop();
      },
      { threshold: [0, 0.15, 0.45, 0.75] }
    );
    visibility.observe(container);

    document.addEventListener("welly-theme", function () {
      if (api) api.setTheme();
    });
    document.addEventListener("welly-motion", function () {
      if (reduceMotion) window.cancelAnimationFrame(raf);
      else if (visible && api) loop();
    });
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) window.cancelAnimationFrame(raf);
      else if (visible && !reduceMotion && api) loop();
    });
  });
})();

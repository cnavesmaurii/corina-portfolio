document.addEventListener("DOMContentLoaded", () => {
  /* BOOT SCREEN */
  const enterBtn = document.getElementById("enter-btn");
  const bootScreen = document.getElementById("boot-screen");
  const desktop = document.getElementById("desktop");

  if (enterBtn) {
    enterBtn.addEventListener("click", () => {
      bootScreen.classList.add("hidden");
      desktop.classList.remove("hidden");
    });
  }

  /* CLOCK */
  function updateClock() {
    const clock = document.getElementById("clock");
    if (!clock) return;

    const now = new Date();
    clock.textContent = now.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
  }

  updateClock();
  setInterval(updateClock, 1000);

  /* OPEN WINDOWS */
  const appIcons = document.querySelectorAll(".app-icon");
  const windowNames = ["projects", "studio3d", "about", "toolbox", "resume", "contact"];

  function openWindow(windowName) {
    const targetWindow = document.getElementById(`window-${windowName}`);
    if (!targetWindow) return;

    targetWindow.classList.remove("hidden");
    targetWindow.setAttribute("tabindex", "-1");
    bringToFront(targetWindow);
    targetWindow.focus({ preventScroll: true });
  }

  appIcons.forEach(icon => {
    icon.addEventListener("click", () => {
      openWindow(icon.dataset.window);
    });
  });

  /* CLOSE WINDOWS */
  const closeButtons = document.querySelectorAll(".close-btn");
  closeButtons.forEach(button => {
    button.addEventListener("click", event => {
      event.stopPropagation();
      const targetId = button.dataset.close;
      const target = document.getElementById(targetId);
      if (target) {
        target.classList.add("hidden");
      }
    });
  });

  /* PROJECT NOTES */
  document.querySelectorAll(".case-study-btn").forEach(button => {
    button.addEventListener("click", () => {
      const notes = button.closest(".project-card").querySelector(".case-study");
      const isOpen = !notes.hidden;
      notes.hidden = isOpen;
      button.setAttribute("aria-expanded", String(!isOpen));
      button.textContent = isOpen ? "VIEW NOTES +" : "HIDE NOTES −";
    });
  });

  /* 3D LAB TABS */
  const modelButtons = document.querySelectorAll(".model-btn");
  const views = {
    character: document.getElementById("view-character"),
    concept: document.getElementById("view-concept"),
    environment: document.getElementById("view-environment"),
    objects: document.getElementById("view-objects")
  };

  modelButtons.forEach(button => {
    button.addEventListener("click", () => {
      const selected = button.dataset.model;

      modelButtons.forEach(btn => btn.classList.remove("active"));
      button.classList.add("active");

      Object.values(views).forEach(view => {
        if (view) view.classList.add("hidden");
      });

      if (views[selected]) {
        views[selected].classList.remove("hidden");
      }
    });
  });

  /* 3D ASSET FILTER */
  const assetFilters = document.querySelectorAll(".asset-filter-btn");
  const assetCards = document.querySelectorAll(".object-card");
  assetFilters.forEach(button => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;
      assetFilters.forEach(filterButton => filterButton.classList.toggle("active", filterButton === button));
      assetCards.forEach(card => {
        card.classList.toggle("is-filtered-out", filter !== "all" && card.dataset.tool !== filter);
      });
    });
  });

  /* DRAGGABLE WINDOWS */
  const windows = document.querySelectorAll(".draggable");
  let highestZ = 20;

  function bringToFront(element) {
    highestZ++;
    element.style.zIndex = highestZ;
  }

  windows.forEach(windowElement => {
    const handle = windowElement.querySelector(".drag-handle");
    if (!handle) return;

    let dragging = false;
    let offsetX = 0;
    let offsetY = 0;

    handle.addEventListener("mousedown", event => {
      dragging = true;
      bringToFront(windowElement);

      const rect = windowElement.getBoundingClientRect();
      offsetX = event.clientX - rect.left;
      offsetY = event.clientY - rect.top;

      document.body.style.userSelect = "none";
    });

    document.addEventListener("mousemove", event => {
      if (!dragging) return;

      const maxX = window.innerWidth - windowElement.offsetWidth;
      const maxY = window.innerHeight - 45;

      let x = event.clientX - offsetX;
      let y = event.clientY - offsetY;

      x = Math.max(0, Math.min(x, maxX));
      y = Math.max(45, Math.min(y, maxY));

      windowElement.style.left = `${x}px`;
      windowElement.style.top = `${y}px`;
    });

    document.addEventListener("mouseup", () => {
      dragging = false;
      document.body.style.userSelect = "";
    });

    windowElement.addEventListener("mousedown", () => {
      bringToFront(windowElement);
    });
  });

  /* QUICK LAUNCH + SHORTCUTS */
  const commandDeck = document.querySelector(".command-deck");
  const commandToggle = document.getElementById("command-toggle");
  const commandClose = document.getElementById("command-close");
  const setCommandDeck = isOpen => {
    commandDeck.classList.toggle("is-open", isOpen);
    commandToggle.setAttribute("aria-expanded", String(isOpen));
    commandToggle.textContent = isOpen ? "×" : "+";
  };

  commandToggle.addEventListener("click", () => setCommandDeck(!commandDeck.classList.contains("is-open")));
  commandClose.addEventListener("click", () => setCommandDeck(false));
  document.querySelectorAll("[data-launch]").forEach(button => {
    button.addEventListener("click", () => {
      openWindow(button.dataset.launch);
      setCommandDeck(false);
    });
  });

  document.addEventListener("keydown", event => {
    if (event.key === "?" && !event.metaKey && !event.ctrlKey) {
      setCommandDeck(!commandDeck.classList.contains("is-open"));
    }
    if (event.key === "Escape") {
      const openWindows = [...windows].filter(windowElement => !windowElement.classList.contains("hidden"));
      const topWindow = openWindows.sort((a, b) => Number(b.style.zIndex || 20) - Number(a.style.zIndex || 20))[0];
      if (topWindow) topWindow.classList.add("hidden");
      else setCommandDeck(false);
    }
    if (/^[1-6]$/.test(event.key) && !event.metaKey && !event.ctrlKey && !event.altKey) {
      openWindow(windowNames[Number(event.key) - 1]);
    }
  });

  /* DISPLAY THEME */
  const themeToggle = document.getElementById("theme-toggle");
  const savedTheme = localStorage.getItem("corina-theme");
  if (savedTheme === "night") document.body.classList.add("night-mode");
  themeToggle.addEventListener("click", () => {
    const night = document.body.classList.toggle("night-mode");
    localStorage.setItem("corina-theme", night ? "night" : "day");
  });

  /* PIXEL OCEAN — a tiny hand-drawn, animated scene */
  const pixelOcean = document.getElementById("pixel-ocean");
  if (pixelOcean) {
    const context = pixelOcean.getContext("2d");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pixel = (x, y, width, height, color) => {
      context.fillStyle = color;
      context.fillRect(Math.round(x), Math.round(y), width, height);
    };

    const drawMountain = (x, base, width, height, color) => {
      for (let row = 0; row < height; row += 3) {
        const progress = row / height;
        const rowWidth = Math.max(4, width * progress);
        pixel(x + (width - rowWidth) / 2, base - height + row, rowWidth, 3, color);
      }
    };

    const drawWhale = (x, y, flap) => {
      const outline = "#08263e";
      const deep = "#0b4f73";
      const mid = "#157da0";
      const glow = "#65d5d2";
      const belly = "#f4e9be";
      const blush = "#f59ab5";
      const pearl = "#fff9df";
      // A large hand-drawn humpback sprite with a soft pastel shine.
      pixel(x + 1, y + 16 + flap, 8, 4, outline); pixel(x + 5, y + 10 + flap, 6, 14, outline);
      pixel(x + 10, y + 19, 9, 8, outline); pixel(x + 16, y + 14, 44, 22, outline);
      pixel(x + 27, y + 10, 28, 6, outline); pixel(x + 55, y + 18, 15, 15, outline); pixel(x + 68, y + 22, 7, 8, outline);
      pixel(x + 29, y + 34, 9, 12, outline); pixel(x + 44, y + 33, 7, 10, outline);
      pixel(x + 18, y + 18, 41, 15, deep); pixel(x + 28, y + 13, 26, 8, deep); pixel(x + 56, y + 21, 12, 10, deep);
      pixel(x + 21, y + 20, 32, 8, mid); pixel(x + 31, y + 16, 20, 5, mid); pixel(x + 57, y + 23, 9, 4, mid);
      pixel(x + 21, y + 29, 37, 5, belly); pixel(x + 31, y + 34, 19, 4, belly); pixel(x + 39, y + 38, 8, 2, belly);
      pixel(x + 9, y + 13 + flap, 6, 4, glow); pixel(x + 25, y + 18, 10, 3, glow); pixel(x + 37, y + 14, 9, 2, glow);
      // A tiny ribbon on the tail and a friendly eye make the whale feel less mechanical.
      pixel(x + 4, y + 9 + flap, 4, 3, blush); pixel(x + 1, y + 7 + flap, 4, 4, blush); pixel(x + 8, y + 7 + flap, 4, 4, blush); pixel(x + 5, y + 8 + flap, 3, 3, pearl);
      pixel(x + 64, y + 22, 2, 2, pearl); pixel(x + 67, y + 23, 2, 2, "#071a2b"); pixel(x + 69, y + 27, 2, 1, "#071a2b");
      pixel(x + 60, y + 29, 3, 2, blush); pixel(x + 63, y + 30, 2, 2, blush);
      [[20,22], [25,25], [30,20], [35,24], [41,21], [47,25], [52,20], [57,28], [25,31], [35,30], [45,31], [54,30]].forEach(([dx, dy]) => pixel(x + dx, y + dy, 2, 2, pearl));
      [[29,17], [34,19], [40,17], [46,20], [52,18]].forEach(([dx, dy]) => pixel(x + dx, y + dy, 2, 2, "#9beae2"));
    };

    const drawFish = (x, y, color, direction = 1) => {
      const tailX = direction === 1 ? x : x + 10;
      pixel(tailX, y + 3, 4, 3, color); pixel(tailX + (direction === 1 ? -2 : 2), y + 1, 3, 7, color);
      pixel(x + 3, y + 2, 8, 5, color); pixel(x + (direction === 1 ? 10 : 2), y + 3, 2, 2, "#172f58");
    };

    const drawJellyfish = (x, y) => {
      const pink = "#f08fb9";
      const cream = "#fff0d5";
      pixel(x + 2, y, 8, 3, pink); pixel(x, y + 3, 12, 5, pink); pixel(x + 2, y + 2, 8, 4, cream);
      pixel(x + 2, y + 8, 2, 8, pink); pixel(x + 6, y + 8, 2, 11, "#ce6ba0"); pixel(x + 10, y + 8, 2, 7, pink);
    };

    const renderOcean = time => {
      const phase = time / 1000;
      context.clearRect(0, 0, 320, 180);
      const whaleX = 183 + Math.sin(phase * .48) * 58;
      const whaleY = 58 + Math.sin(phase * 1.2) * 5;
      drawWhale(whaleX, whaleY, Math.round(Math.sin(phase * 3)) * 2);
      drawFish(62 + Math.sin(phase * .8) * 22, 42, "#ff9fc6", -1);
      drawFish(275 + Math.sin(phase * .9 + 2) * 18, 133, "#7be0dc");
      drawFish(128 + Math.sin(phase * .65 + 1) * 13, 151, "#c6a5f6", -1);
      drawJellyfish(33 + Math.sin(phase * .7) * 11, 130 + Math.sin(phase * 1.4) * 7);
      drawJellyfish(284 + Math.sin(phase * .55) * 9, 32 + Math.sin(phase * 1.1) * 6);
      [[268, 121], [274, 110], [282, 98], [290, 86], [72, 118], [77, 108], [82, 98]].forEach(([x, y], index) => pixel(x + Math.sin(phase + index) * 3, y - ((phase * 5 + index * 7) % 16), 2, 2, index % 2 ? "#fff0d5" : "#8ee5df"));
      if (!reducedMotion) window.requestAnimationFrame(renderOcean);
    };
    renderOcean(0);
  }

  /* SYSTEM STATUS */
  const status = document.getElementById("system-status");
  setTimeout(() => {
    if (status) {
      status.textContent = "WORKSPACE ACTIVE";
    }
  }, 1500);
});

(() => {
  "use strict";

  const qs = (selector, context = document) => context.querySelector(selector);
  const qsa = (selector, context = document) => [...context.querySelectorAll(selector)];

  const header = qs("[data-header]");
  const menuToggle = qs(".menu-toggle");
  const mobileMenu = qs("#mobile-menu");

  const closeMenu = () => {
    if (!menuToggle || !mobileMenu) return;
    menuToggle.setAttribute("aria-expanded", "false");
    mobileMenu.hidden = true;
    document.body.classList.remove("menu-open");
  };

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener("click", () => {
      const open = menuToggle.getAttribute("aria-expanded") === "true";
      menuToggle.setAttribute("aria-expanded", String(!open));
      mobileMenu.hidden = open;
      document.body.classList.toggle("menu-open", !open);
    });

    qsa("a", mobileMenu).forEach((link) => link.addEventListener("click", closeMenu));
    window.addEventListener("resize", () => {
      if (window.innerWidth > 900) closeMenu();
    });
  }

  const updateHeader = () => header?.classList.toggle("is-scrolled", window.scrollY > 24);
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  const revealItems = qsa(".reveal");
  if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.11, rootMargin: "0px 0px -40px" }
    );
    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  const navLinks = qsa('.desktop-nav a[href^="#"]');
  const sections = navLinks
    .map((link) => qs(link.getAttribute("href")))
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        navLinks.forEach((link) => {
          link.classList.toggle("is-current", link.getAttribute("href") === `#${visible.target.id}`);
        });
      },
      { rootMargin: "-25% 0px -60%", threshold: [0.01, 0.2, 0.5] }
    );
    sections.forEach((section) => sectionObserver.observe(section));
  }

  const clock = qs("[data-clock]");
  const renderClock = () => {
    if (!clock) return;
    clock.textContent = new Intl.DateTimeFormat("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(new Date());
  };
  renderClock();
  window.setInterval(renderClock, 1000);

  const platformContent = {
    maintenance: {
      kicker: "SAÚDE DOS ATIVOS",
      title: "Falhas aparecem primeiro nos sinais.",
      copy: "Identifique desvios de comportamento, priorize inspeções e planeje intervenções antes que uma anomalia vire parada.",
      label: "Saúde dos ativos",
      metrics: [
        ["Ativos monitorados", "184", "96% online"],
        ["Em atenção", "07", "3 alta prioridade"],
        ["Risco evitado", "R$ 286 mil", "últimos 30 dias"],
      ],
    },
    production: {
      kicker: "RITMO DE PRODUÇÃO",
      title: "A perda pequena também entra na conta.",
      copy: "Revele microparadas, variações de ciclo e gargalos por turno para atuar onde o OEE realmente escapa.",
      label: "Desempenho da linha",
      metrics: [
        ["OEE consolidado", "78,4%", "+3,2 p.p. no mês"],
        ["Microparadas", "23", "−14% na semana"],
        ["Ritmo atual", "412 p/h", "meta: 430 p/h"],
      ],
    },
    energy: {
      kicker: "ENERGIA E UTILIDADES",
      title: "Consumo só faz sentido com contexto.",
      copy: "Compare energia, vapor, ar e água por unidade produzida, receita e condição operacional.",
      label: "Eficiência energética",
      metrics: [
        ["Consumo específico", "8,7 kWh", "por unidade"],
        ["Demanda atual", "1,84 MW", "82% contratada"],
        ["Economia", "R$ 94 mil", "acumulado no mês"],
      ],
    },
  };

  const replaceText = (selector, value) => {
    const element = qs(selector);
    if (element) element.textContent = value;
  };

  qsa("[data-platform]").forEach((tab) => {
    tab.addEventListener("click", () => {
      const key = tab.dataset.platform;
      const content = platformContent[key];
      if (!content) return;

      qsa("[data-platform]").forEach((candidate) => {
        const active = candidate === tab;
        candidate.classList.toggle("is-active", active);
        candidate.setAttribute("aria-selected", String(active));
      });

      replaceText("[data-platform-kicker]", content.kicker);
      replaceText("[data-platform-title]", content.title);
      replaceText("[data-platform-copy]", content.copy);
      replaceText("[data-dashboard-label]", content.label);
      content.metrics.forEach((metric, index) => {
        const position = index + 1;
        replaceText(`[data-metric-label-${position}]`, metric[0]);
        replaceText(`[data-metric-value-${position}]`, metric[1]);
        replaceText(`[data-metric-note-${position}]`, metric[2]);
      });
    });
  });

  qsa("[data-accordion]").forEach((accordion) => {
    const triggers = qsa("button[aria-expanded]", accordion);
    triggers.forEach((trigger) => {
      trigger.addEventListener("click", () => {
        const item = trigger.closest("article");
        const panel = item?.querySelector(":scope > div:last-child");
        if (!item || !panel) return;
        const currentlyOpen = trigger.getAttribute("aria-expanded") === "true";

        triggers.forEach((otherTrigger) => {
          const otherItem = otherTrigger.closest("article");
          const otherPanel = otherItem?.querySelector(":scope > div:last-child");
          otherTrigger.setAttribute("aria-expanded", "false");
          otherItem?.classList.remove("is-open");
          if (otherPanel) otherPanel.hidden = true;
          const symbol = otherTrigger.querySelector(".solution-toggle, i");
          if (symbol) symbol.textContent = "+";
        });

        if (!currentlyOpen) {
          trigger.setAttribute("aria-expanded", "true");
          item.classList.add("is-open");
          panel.hidden = false;
          const symbol = trigger.querySelector(".solution-toggle, i");
          if (symbol) symbol.textContent = "−";
        }
      });
    });
  });

  const assets = qs("#assets");
  const downtime = qs("#downtime");
  const hourlyCost = qs("#hourly-cost");
  const reduction = qs("#reduction");
  const assetsOutput = qs("#assets-output");
  const roiValue = qs("#roi-value");
  const roiDetail = qs("#roi-detail");
  const currency = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });

  const updateRoi = () => {
    if (!assets || !downtime || !hourlyCost || !reduction || !roiValue || !roiDetail) return;
    const assetCount = Number(assets.value) || 0;
    const downtimeHours = Math.max(0, Number(downtime.value) || 0);
    const hourly = Math.max(0, Number(hourlyCost.value) || 0);
    const rate = Number(reduction.value) || 0;
    const avoidedHours = downtimeHours * rate * 12;
    const value = avoidedHours * hourly;
    const rangePosition = ((assetCount - Number(assets.min)) / (Number(assets.max) - Number(assets.min))) * 100;

    assetsOutput.textContent = String(assetCount);
    assets.style.setProperty("--range", `${rangePosition}%`);
    roiValue.textContent = currency.format(value);
    roiDetail.textContent = `${new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format(avoidedHours)} horas de parada evitadas por ano`;
  };

  [assets, downtime, hourlyCost, reduction].filter(Boolean).forEach((field) => {
    field.addEventListener("input", updateRoi);
    field.addEventListener("change", updateRoi);
  });
  updateRoi();

  const contactForm = qs("#contact-form");
  const formMessage = qs(".form-message", contactForm || document);
  const phone = qs("#phone");

  phone?.addEventListener("input", () => {
    const digits = phone.value.replace(/\D/g, "").slice(0, 11);
    let formatted = digits;
    if (digits.length > 2) formatted = `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length > 7) formatted = `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    phone.value = formatted;
  });

  if (contactForm) {
    qsa("input, select, textarea", contactForm).forEach((field) => {
      field.addEventListener("input", () => field.classList.remove("is-invalid"));
      field.addEventListener("change", () => field.classList.remove("is-invalid"));
    });

    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const invalid = qsa("[required]", contactForm).filter((field) => !field.checkValidity());

      if (invalid.length) {
        invalid.forEach((field) => field.classList.add("is-invalid"));
        invalid[0].focus();
        if (formMessage) {
          formMessage.textContent = "Revise os campos destacados para continuar.";
          formMessage.style.color = "#b9483a";
        }
        return;
      }

      const submitButton = qs('button[type="submit"]', contactForm);
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Solicitação preparada ✓";
      }
      if (formMessage) {
        formMessage.textContent = "Tudo certo. Como este é um projeto demonstrativo, nenhum dado foi transmitido.";
        formMessage.style.color = "#3d7d59";
      }
      window.setTimeout(() => {
        contactForm.reset();
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.innerHTML = "Enviar para a engenharia <span>↗</span>";
        }
      }, 5000);
    });
  }

  const caseDialog = qs("#case-dialog");
  const openCaseButton = qs("[data-open-case]");
  const closeDialog = () => {
    if (!caseDialog) return;
    caseDialog.close();
    document.body.classList.remove("dialog-open");
  };

  openCaseButton?.addEventListener("click", () => {
    if (!caseDialog) return;
    caseDialog.showModal();
    document.body.classList.add("dialog-open");
  });

  qsa("[data-close-dialog]").forEach((button) => button.addEventListener("click", closeDialog));
  caseDialog?.addEventListener("click", (event) => {
    if (event.target === caseDialog) closeDialog();
  });
  caseDialog?.addEventListener("close", () => document.body.classList.remove("dialog-open"));

  const toast = qs("[data-toast]");
  const demoAction = qs("[data-demo-action]");
  let toastTimer;
  const hideToast = () => {
    if (toast) toast.hidden = true;
    window.clearTimeout(toastTimer);
  };
  demoAction?.addEventListener("click", () => {
    if (!toast) return;
    toast.hidden = false;
    toastTimer = window.setTimeout(hideToast, 7000);
  });
  qs("button", toast || document)?.addEventListener("click", hideToast);

  const cookieBanner = qs("[data-cookie-banner]");
  const readPreference = () => {
    try {
      return window.localStorage.getItem("trama-cookie-preference");
    } catch {
      return "essential";
    }
  };
  const savePreference = (value) => {
    try {
      window.localStorage.setItem("trama-cookie-preference", value);
    } catch {
      // The site works without persistence when storage is disabled.
    }
    if (cookieBanner) cookieBanner.hidden = true;
  };

  if (cookieBanner && !readPreference()) {
    window.setTimeout(() => {
      cookieBanner.hidden = false;
    }, 1200);
  }
  qs("[data-cookie-accept]")?.addEventListener("click", () => savePreference("acknowledged"));
  qs("[data-cookie-reject]")?.addEventListener("click", () => savePreference("essential"));
  qs("[data-cookie-settings]")?.addEventListener("click", () => {
    if (cookieBanner) cookieBanner.hidden = false;
  });

  qsa("[data-year]").forEach((element) => {
    element.textContent = String(new Date().getFullYear());
  });
})();

(function (root, factory) {
  "use strict";

  const api = factory();

  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }

  if (root && root.document) {
    root.YouOweMeAnniversaryAnnouncement = api;
    api.initialize(
      root.document,
      root.Date,
      typeof root.setInterval === "function" ? root.setInterval.bind(root) : null
    );
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const ANNOUNCEMENT_SELECTOR = "[data-anniversary-announcement]";
  const REFRESH_INTERVAL_MS = 60000;
  const initializedDocuments = typeof WeakSet === "function" ? new WeakSet() : null;

  const ACTIVE_STATES = Object.freeze({
    inactive: Object.freeze({}),
    active: Object.freeze({
      standard: Object.freeze({
        eyebrow: "2016–2026",
        heading: "You Owe Me is 10.",
        body: "Explore a decade of clearer money between people. Eligible free users can also find a limited anniversary upgrade offer in the app through September 4.",
        cta: "Explore the ten-year story",
      }),
      inline: Object.freeze({
        label: "Anniversary live",
        body: "You Owe Me is 10. Eligible free users can also find the limited anniversary offer in the app through September 4.",
      }),
    }),
    final: Object.freeze({
      standard: Object.freeze({
        eyebrow: "Final days",
        heading: "The anniversary offer ends September 4.",
        body: "The ten-year story will remain. If you are an eligible free user, the limited upgrade offer is available in the app through September 4.",
        cta: "Explore the anniversary",
      }),
      inline: Object.freeze({
        label: "Final days",
        body: "The anniversary offer for eligible free users ends September 4. The ten-year story will remain.",
      }),
    }),
  });

  const SPANISH_ACTIVE_STATES = Object.freeze({
    inactive: Object.freeze({}),
    active: Object.freeze({
      standard: Object.freeze({
        eyebrow: "2016–2026",
        heading: "You Owe Me cumple 10 años.",
        body: "Descubre diez años ayudando a llevar cuentas claras entre personas. Los usuarios de la versión gratuita que cumplan los requisitos también encontrarán en la app una oferta de aniversario para pasar a la versión de pago hasta el 4 de septiembre.",
        cta: "Descubre la historia de estos diez años (en inglés)",
      }),
      inline: Object.freeze({
        label: "Celebramos el aniversario",
        body: "You Owe Me cumple 10 años. Los usuarios de la versión gratuita que cumplan los requisitos también encontrarán la oferta de aniversario en la app hasta el 4 de septiembre.",
      }),
    }),
    final: Object.freeze({
      standard: Object.freeze({
        eyebrow: "Últimos días",
        heading: "La oferta de aniversario termina el 4 de septiembre.",
        body: "La historia de estos diez años seguirá disponible. Si usas la versión gratuita y cumples los requisitos, puedes encontrar en la app la oferta para pasar a la versión de pago hasta el 4 de septiembre.",
        cta: "Descubre el aniversario (en inglés)",
      }),
      inline: Object.freeze({
        label: "Últimos días",
        body: "La oferta de aniversario para los usuarios de la versión gratuita que cumplan los requisitos termina el 4 de septiembre. La historia de estos diez años seguirá disponible.",
      }),
    }),
  });

  const GERMAN_ACTIVE_STATES = Object.freeze({
    inactive: Object.freeze({}),
    active: Object.freeze({
      standard: Object.freeze({
        eyebrow: "2016–2026", heading: "You Owe Me wird 10.",
        body: "Entdecke, wie You Owe Me seit zehn Jahren hilft, Geld zwischen Menschen übersichtlich festzuhalten. Berechtigte Nutzer der kostenlosen Version finden in der App außerdem bis zum 4. September ein zeitlich begrenztes Jubiläumsangebot für ein Upgrade.",
        cta: "Zehn Jahre You Owe Me entdecken (auf Englisch)",
      }),
      inline: Object.freeze({
        label: "Wir feiern Jubiläum",
        body: "You Owe Me wird 10. Berechtigte Nutzer der kostenlosen Version finden das zeitlich begrenzte Jubiläumsangebot in der App bis zum 4. September.",
      }),
    }),
    final: Object.freeze({
      standard: Object.freeze({
        eyebrow: "Letzte Tage", heading: "Das Jubiläumsangebot endet am 4. September.",
        body: "Die Geschichte der letzten zehn Jahre bleibt verfügbar. Als berechtigter Nutzer der kostenlosen Version findest du das zeitlich begrenzte Upgrade-Angebot bis zum 4. September in der App.",
        cta: "Das Jubiläum entdecken (auf Englisch)",
      }),
      inline: Object.freeze({
        label: "Letzte Tage",
        body: "Das Jubiläumsangebot für berechtigte Nutzer der kostenlosen Version endet am 4. September. Die Geschichte der letzten zehn Jahre bleibt verfügbar.",
      }),
    }),
  });

  const ARABIC_ACTIVE_STATES = Object.freeze({
    inactive: Object.freeze({}),
    active: Object.freeze({
      standard: Object.freeze({ eyebrow: "2016–2026", heading: "مرّت 10 سنوات على You Owe Me.",
        body: "اكتشف عشر سنوات من مساعدة الناس على توضيح حساباتهم. يمكن لمستخدمي النسخة المجانية المؤهلين أيضاً العثور على عرض ترقية لفترة محدودة بمناسبة الذكرى السنوية داخل التطبيق حتى 4 سبتمبر.",
        cta: "اكتشف قصة السنوات العشر (بالإنجليزية)" }),
      inline: Object.freeze({ label: "الذكرى السنوية", body: "مرّت 10 سنوات على You Owe Me. يتوفر عرض الذكرى السنوية داخل التطبيق لمستخدمي النسخة المجانية المؤهلين حتى 4 سبتمبر." }),
    }),
    final: Object.freeze({
      standard: Object.freeze({ eyebrow: "الأيام الأخيرة", heading: "ينتهي عرض الذكرى السنوية في 4 سبتمبر.",
        body: "ستظل قصة السنوات العشر متاحة. إذا كنت من مستخدمي النسخة المجانية المؤهلين، فستجد عرض الترقية لفترة محدودة داخل التطبيق حتى 4 سبتمبر.",
        cta: "اكتشف قصة الذكرى السنوية (بالإنجليزية)" }),
      inline: Object.freeze({ label: "الأيام الأخيرة", body: "ينتهي عرض الذكرى السنوية لمستخدمي النسخة المجانية المؤهلين في 4 سبتمبر. وستظل قصة السنوات العشر متاحة." }),
    }),
  });
  const JAPANESE_ACTIVE_STATES = Object.freeze({
  "inactive": {},
  "active": {
    "standard": {
      "eyebrow": "2016–2026",
      "heading": "You Owe Meは10周年。",
      "body": "人とのお金のやり取りをわかりやすくしてきた、10年の歩みをご覧ください。対象となる無料版の利用者は、9月4日までアプリ内で周年記念の期間限定アップグレードを利用できます。",
      "cta": "10年の歩みを見る（英語）"
    },
    "inline": {
      "label": "10周年を迎えました",
      "body": "You Owe Meは10周年。対象となる無料版の利用者は、9月4日までアプリ内の周年記念キャンペーンを利用できます。"
    }
  },
  "final": {
    "standard": {
      "eyebrow": "終了間近",
      "heading": "周年記念キャンペーンは9月4日まで。",
      "body": "10年の歩みを紹介するページは引き続きご覧いただけます。対象となる無料版の利用者は、9月4日までアプリ内の期間限定アップグレードを利用できます。",
      "cta": "周年記念ページを見る（英語）"
    },
    "inline": {
      "label": "終了間近",
      "body": "対象となる無料版の利用者向けの周年記念キャンペーンは9月4日までです。10年の歩みを紹介するページは引き続きご覧いただけます。"
    }
  }
});
  const FRENCH_ACTIVE_STATES = Object.freeze({
    inactive: Object.freeze({}),
    active: Object.freeze({
      standard: Object.freeze({ eyebrow: "2016–2026", heading: "You Owe Me fête ses 10 ans.",
        body: "Découvrez dix ans de comptes plus clairs entre personnes. Les utilisateurs de la formule gratuite qui remplissent les conditions peuvent aussi profiter d’une offre anniversaire à durée limitée pour passer à la formule payante dans l’application, jusqu’au 4 septembre.",
        cta: "Découvrez ces dix années (en anglais)" }),
      inline: Object.freeze({ label: "C’est l’anniversaire de You Owe Me", body: "You Owe Me fête ses 10 ans. Les utilisateurs de la formule gratuite qui remplissent les conditions peuvent aussi profiter de l’offre anniversaire dans l’application jusqu’au 4 septembre." }),
    }),
    final: Object.freeze({
      standard: Object.freeze({ eyebrow: "Derniers jours", heading: "L’offre anniversaire se termine le 4 septembre.",
        body: "L’histoire de ces dix années restera disponible. Si vous utilisez la formule gratuite et remplissez les conditions, l’offre à durée limitée pour passer à la formule payante vous attend dans l’application jusqu’au 4 septembre.",
        cta: "Découvrez l’anniversaire (en anglais)" }),
      inline: Object.freeze({ label: "Derniers jours", body: "L’offre anniversaire destinée aux utilisateurs de la formule gratuite qui remplissent les conditions se termine le 4 septembre. L’histoire de ces dix années restera disponible." }),
    }),
  });
  function localDateKey(date) {
    if (!date || typeof date.getFullYear !== "function" || Number.isNaN(date.getTime())) {
      return null;
    }

    return (date.getFullYear() * 10000) + ((date.getMonth() + 1) * 100) + date.getDate();
  }

  function phaseForDate(date) {
    const key = localDateKey(date);
    if (key === null || key < 20260826 || key >= 20260905) return "inactive";
    if (key < 20260902) return "active";
    return "final";
  }

  function setText(moduleElement, selector, value) {
    const node = moduleElement.querySelector(selector);
    if (node) node.textContent = value;
  }

  function applyState(moduleElement, phase, documentObject = moduleElement?.ownerDocument) {
    if (!moduleElement || typeof moduleElement.setAttribute !== "function") return false;

    const safePhase = ACTIVE_STATES[phase] ? phase : "inactive";
    moduleElement.setAttribute("data-anniversary-phase", safePhase);

    if (safePhase === "inactive") {
      moduleElement.hidden = true;
      moduleElement.setAttribute("aria-hidden", "true");
      return true;
    }

    if (typeof moduleElement.querySelector !== "function") return false;

    const variant = moduleElement.getAttribute("data-anniversary-variant");
    const states = documentObject?.documentElement?.lang === "ja" ? JAPANESE_ACTIVE_STATES : documentObject?.documentElement?.lang === "fr" ? FRENCH_ACTIVE_STATES : documentObject?.documentElement?.lang === "ar" ? ARABIC_ACTIVE_STATES : documentObject?.documentElement?.lang === "de" ? GERMAN_ACTIVE_STATES : documentObject?.documentElement?.lang === "es" ? SPANISH_ACTIVE_STATES : ACTIVE_STATES;
    const state = states[safePhase][variant];
    if (!state) {
      moduleElement.hidden = true;
      moduleElement.setAttribute("aria-hidden", "true");
      moduleElement.setAttribute("data-anniversary-phase", "inactive");
      return false;
    }

    if (variant === "standard") {
      setText(moduleElement, "[data-anniversary-eyebrow]", state.eyebrow);
      setText(moduleElement, "[data-anniversary-heading]", state.heading);
      setText(moduleElement, "[data-anniversary-body]", state.body);
      const cta = moduleElement.querySelector("[data-anniversary-cta]");
      if (cta) {
        cta.textContent = state.cta;
        cta.setAttribute("href", "/10-years/");
      }
    } else {
      setText(moduleElement, "[data-anniversary-inline-label]", state.label);
      setText(moduleElement, "[data-anniversary-inline-body]", state.body);
    }

    moduleElement.hidden = false;
    moduleElement.removeAttribute("aria-hidden");
    return true;
  }

  function render(documentObject, date) {
    if (!documentObject || typeof documentObject.querySelectorAll !== "function") return false;

    const phase = phaseForDate(date);
    const modules = documentObject.querySelectorAll(ANNOUNCEMENT_SELECTOR);
    let updated = false;

    Array.prototype.forEach.call(modules, function (moduleElement) {
      try {
        updated = applyState(moduleElement, phase, documentObject) || updated;
      } catch (error) {
        try {
          applyState(moduleElement, "inactive");
        } catch (ignoredError) {
          // A malformed module must not prevent the remaining modules from updating.
        }
      }
    });

    return updated;
  }

  function initialize(documentObject, DateConstructor, setIntervalFunction) {
    if (!documentObject || typeof DateConstructor !== "function") return false;
    if (initializedDocuments && initializedDocuments.has(documentObject)) return false;
    if (initializedDocuments) initializedDocuments.add(documentObject);

    const run = function () {
      render(documentObject, new DateConstructor());
    };

    const start = function () {
      run();
      if (typeof setIntervalFunction === "function") {
        setIntervalFunction(run, REFRESH_INTERVAL_MS);
      }
    };

    if (documentObject.readyState === "loading") {
      documentObject.addEventListener("DOMContentLoaded", start, { once: true });
    } else {
      start();
    }

    return true;
  }

  return Object.freeze({
    ACTIVE_STATES,
    ANNOUNCEMENT_SELECTOR,
    REFRESH_INTERVAL_MS,
    applyState,
    initialize,
    localDateKey,
    phaseForDate,
    render,
  });
});

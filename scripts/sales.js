(function () {
  "use strict";

  const ENABLE_DEBUG_SALE = false;
  const REFRESH_INTERVAL_MS = 60000;
  const SALE_CHANGED_EVENT = "youoweme:sale-changed";
  const SPANISH_SALE_NAMES = Object.freeze({
    Debug: "Prueba",
    "Father's Day": "Día del Padre",
    "Independence Day": "Día de la Independencia de Estados Unidos",
    "Black Friday": "Black Friday",
    "Cyber Monday": "Cyber Monday",
    Christmas: "Navidad",
    "New Year": "Año Nuevo",
    "Valentine's Day": "San Valentín",
    Easter: "Pascua",
    Halloween: "Halloween",
    "Singles' Day": "Día del Soltero",
    Thanksgiving: "Acción de Gracias",
  });
  const GERMAN_SALE_NAMES = Object.freeze({
    Debug: "Test", "Father's Day": "US-Vatertag", "Independence Day": "US-Unabhängigkeitstag",
    "Black Friday": "Black Friday", "Cyber Monday": "Cyber Monday", Christmas: "Weihnachten",
    "New Year": "Neujahr", "Valentine's Day": "Valentinstag", Easter: "Ostern",
    Halloween: "Halloween", "Singles' Day": "Singles’ Day", Thanksgiving: "Thanksgiving",
  });
  const FRENCH_SALE_NAMES = Object.freeze({
    Debug: "Test", "Father's Day": "Fête des pères aux États-Unis", "Independence Day": "Fête de l’indépendance des États-Unis",
    "Black Friday": "Black Friday", "Cyber Monday": "Cyber Monday", Christmas: "Noël",
    "New Year": "Nouvel An", "Valentine's Day": "Saint-Valentin", Easter: "Pâques",
    Halloween: "Halloween", "Singles' Day": "Journée des célibataires", Thanksgiving: "Thanksgiving aux États-Unis",
  });
  const ARABIC_SALE_NAMES = Object.freeze({
    Debug: "اختبار", "Father's Day": "عيد الأب في الولايات المتحدة", "Independence Day": "عيد الاستقلال الأمريكي",
    "Black Friday": "الجمعة السوداء", "Cyber Monday": "الاثنين الإلكتروني", Christmas: "عيد الميلاد",
    "New Year": "رأس السنة", "Valentine's Day": "عيد الحب", Easter: "عيد الفصح",
    Halloween: "هالوين", "Singles' Day": "يوم العزّاب", Thanksgiving: "عيد الشكر الأمريكي",
  });
  let currentActiveSale = null;

  /**
   * Placeholder parity hook for iOS DiscountCooldown.isActive().
   * Keep false unless/ until a matching web cooldown source is introduced.
   */
  function isDiscountCooldownActive() {
    try {
      if (
        window.DiscountCooldown &&
        typeof window.DiscountCooldown.isActive === "function"
      ) {
        return Boolean(window.DiscountCooldown.isActive());
      }
    } catch (error) {
      return false;
    }
    return false;
  }

  function startOfDay(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
  }

  function endOfDay(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 0);
  }

  function dateFromYMD(year, month, day) {
    return new Date(year, month - 1, day, 0, 0, 0, 0);
  }

  function addDays(date, days) {
    const next = new Date(date.getTime());
    next.setDate(next.getDate() + days);
    return next;
  }

  // JS weekday: Sunday = 0 ... Saturday = 6
  function fourthWeekdayOfMonth(year, month, weekday) {
    const firstOfMonth = dateFromYMD(year, month, 1);
    const offset = (weekday - firstOfMonth.getDay() + 7) % 7;
    const day = 1 + offset + 21;
    return dateFromYMD(year, month, day);
  }

  function calculateEasterSunday(year) {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31);
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    return dateFromYMD(year, month, day);
  }

  function addSale(sales, startDate, endDate, saleName, id) {
    sales.push({ startDate, endDate, saleName, id });
  }

  function isBetween(now, startDate, endDate) {
    return now >= startDate && now <= endDate;
  }

  function hoursBetween(fromDate, toDate) {
    return Math.trunc((toDate.getTime() - fromDate.getTime()) / 3600000);
  }

  function buildSales(now) {
    const sales = [];
    const currentYear = now.getFullYear();

    if (ENABLE_DEBUG_SALE) {
      addSale(
        sales,
        addDays(now, -1),
        addDays(now, 1),
        "Debug",
        "DebugTest"
      );
    }

    if (!isDiscountCooldownActive()) {
      // Father's Day (fixed app window)
      addSale(
        sales,
        dateFromYMD(currentYear, 6, 18),
        endOfDay(dateFromYMD(currentYear, 6, 20)),
        "Father's Day",
        "Father'sDay"
      );

      // Independence Day
      addSale(
        sales,
        dateFromYMD(currentYear, 7, 3),
        endOfDay(dateFromYMD(currentYear, 7, 5)),
        "Independence Day",
        "IndependenceDay"
      );

      // Black Friday + Cyber Monday (fourth Friday in November through Monday)
      const blackFriday = fourthWeekdayOfMonth(currentYear, 11, 5);
      const cyberMonday = addDays(blackFriday, 3);
      const hoursToBlackFriday = hoursBetween(now, blackFriday);
      const hoursToCyberMonday = hoursBetween(now, cyberMonday);
      const bfcmSaleName = Math.abs(hoursToBlackFriday) <= Math.abs(hoursToCyberMonday)
        ? "Black Friday"
        : "Cyber Monday";

      addSale(
        sales,
        startOfDay(blackFriday),
        endOfDay(cyberMonday),
        bfcmSaleName,
        "BFCM"
      );

      // Christmas + Boxing Day window
      addSale(
        sales,
        dateFromYMD(currentYear, 12, 20),
        endOfDay(dateFromYMD(currentYear, 12, 27)),
        "Christmas",
        "Christmas"
      );

      // New Year crossover logic (same as iOS)
      const newYearsEveYear = now.getMonth() === 0 ? currentYear - 1 : currentYear;
      const newYearsDayYear = newYearsEveYear + 1;
      addSale(
        sales,
        dateFromYMD(newYearsEveYear, 12, 31),
        endOfDay(dateFromYMD(newYearsDayYear, 1, 1)),
        "New Year",
        "NewYear"
      );

      // Valentine's Day: day before through day after
      const valentinesDay = dateFromYMD(currentYear, 2, 14);
      addSale(
        sales,
        addDays(valentinesDay, -1),
        endOfDay(addDays(valentinesDay, 1)),
        "Valentine's Day",
        "Valentine"
      );

      // Easter: day before through day after
      const easterSunday = calculateEasterSunday(currentYear);
      addSale(
        sales,
        addDays(easterSunday, -1),
        endOfDay(addDays(easterSunday, 1)),
        "Easter",
        "Easter"
      );

      // Halloween: day before through day after
      const halloween = dateFromYMD(currentYear, 10, 31);
      addSale(
        sales,
        addDays(halloween, -1),
        endOfDay(addDays(halloween, 1)),
        "Halloween",
        "Halloween"
      );

      // Singles' Day: day before through day after
      const singlesDay = dateFromYMD(currentYear, 11, 11);
      addSale(
        sales,
        addDays(singlesDay, -1),
        endOfDay(addDays(singlesDay, 1)),
        "Singles' Day",
        "SinglesDay"
      );

      // Thanksgiving: fourth Thursday of November (single day)
      const thanksgiving = fourthWeekdayOfMonth(currentYear, 11, 4);
      addSale(
        sales,
        startOfDay(thanksgiving),
        endOfDay(thanksgiving),
        "Thanksgiving",
        "Thanksgiving"
      );
    }

    return sales;
  }

  function getActiveSale(sales, now) {
    return sales.find((sale) => isBetween(now, sale.startDate, sale.endDate)) || null;
  }

  function saleBadgeLabel(sale) {
    if (document.documentElement?.lang === "fr") return sale ? FRENCH_SALE_NAMES[sale.saleName] + " • Offre à durée limitée" : "";
    if (document.documentElement?.lang === "ar") return sale ? ARABIC_SALE_NAMES[sale.saleName] + " • عرض لفترة محدودة" : "";
    if (document.documentElement?.lang === "de") {
      return sale ? GERMAN_SALE_NAMES[sale.saleName] + " • Zeitlich begrenztes Angebot" : "";
    }
    if (document.documentElement?.lang === "es") {
      return sale ? SPANISH_SALE_NAMES[sale.saleName] + " • Oferta por tiempo limitado" : "";
    }
    return sale ? sale.saleName + " • Limited-Time Event" : "";
  }

  function applySaleBadge(sale) {
    const badges = document.querySelectorAll(".lt-salePill");
    if (!badges.length) return;

    if (!sale) {
      badges.forEach((badge) => {
        badge.hidden = true;
        badge.removeAttribute("data-sale-id");
      });
      return;
    }

    const label = saleBadgeLabel(sale);

    badges.forEach((badge) => {
      badge.hidden = false;
      badge.textContent = label;
      badge.setAttribute("aria-label", document.documentElement?.lang === "fr"
        ? "Offre en cours : " + FRENCH_SALE_NAMES[sale.saleName]
        : document.documentElement?.lang === "ar"
        ? "عرض سارٍ: " + ARABIC_SALE_NAMES[sale.saleName]
        : document.documentElement?.lang === "de"
        ? "Aktives Angebot: " + GERMAN_SALE_NAMES[sale.saleName]
        : document.documentElement?.lang === "es"
        ? "Oferta activa: " + SPANISH_SALE_NAMES[sale.saleName]
        : sale.saleName + " sale is active");
      badge.dataset.saleId = sale.id;
    });
  }

  function emitSaleState(sale) {
    currentActiveSale = sale
      ? {
          startDate: new Date(sale.startDate.getTime()),
          endDate: new Date(sale.endDate.getTime()),
          saleName: sale.saleName,
          id: sale.id,
        }
      : null;

    window.YouOweMeSaleState = window.YouOweMeSaleState || {};
    window.YouOweMeSaleState.getActiveSale = function () {
      if (!currentActiveSale) return null;
      return {
        startDate: new Date(currentActiveSale.startDate.getTime()),
        endDate: new Date(currentActiveSale.endDate.getTime()),
        saleName: currentActiveSale.saleName,
        id: currentActiveSale.id,
      };
    };

    try {
      window.dispatchEvent(
        new CustomEvent(SALE_CHANGED_EVENT, {
          detail: { sale: window.YouOweMeSaleState.getActiveSale() },
        })
      );
    } catch (error) {
      // Ignore event dispatch failures in legacy browsers.
    }
  }

  function initSaleBadges() {
    const now = new Date();
    const sales = buildSales(now);
    const activeSale = getActiveSale(sales, now);
    applySaleBadge(activeSale);
    emitSaleState(activeSale);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSaleBadges);
  } else {
    initSaleBadges();
  }

  window.setInterval(initSaleBadges, REFRESH_INTERVAL_MS);
})();

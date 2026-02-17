      (function () {
        const mqDesktop = window.matchMedia("(min-width: 737px)");

        function fitReviews() {
          // only apply on desktop
          if (!mqDesktop.matches) {
            // remove inline widths so CSS (74vw) wins on mobile
            document.querySelectorAll(".lt-reviewCard").forEach(card => {
              card.style.width = "";
            });
            return;
          }

          const cards = document.querySelectorAll(".lt-reviewCard");
          if (!cards.length) return;

          const viewportMax = Math.floor(window.innerWidth * 0.9);
          const MAX_W = Math.min(920, viewportMax);
          const MIN_W = Math.min(340, MAX_W);
          const STEP = 20;

          cards.forEach(card => {
            const p = card.querySelector(".lt-reviewText");
            if (!p) return;

            let w = MIN_W;
            card.style.width = w + "px";

            while (w < MAX_W && p.scrollHeight > p.clientHeight + 1) {
              w += STEP;
              card.style.width = w + "px";
            }
          });
        }

        window.addEventListener("load", fitReviews);

        let t;
        window.addEventListener("resize", () => {
          clearTimeout(t);
          t = setTimeout(fitReviews, 150);
        });

        // handle breakpoint changes (rotation etc.)
        mqDesktop.addEventListener?.("change", fitReviews);
      })();

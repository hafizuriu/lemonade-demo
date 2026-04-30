/**
 * Slide narration: play audio via HTMLAudioElement (.wav / .mp3 / …).
 * Place files e.g. audio/slide1.wav next to the slides.
 */
(function (global) {
  "use strict";

  var current = null;

  function stopCurrent() {
    if (current) {
      current.pause();
      current = null;
    }
  }

  function removeUnlock() {
    var el = document.getElementById("narration-unlock");
    if (el) el.remove();
  }

  /** Browsers often block autoplay until the user interacts with the page. */
  function showNarrationUnlock(tryPlay) {
    if (document.getElementById("narration-unlock")) return;
    var el = document.createElement("div");
    el.id = "narration-unlock";
    el.setAttribute("role", "button");
    el.tabIndex = 0;
    el.textContent = "Tap or click here to play narration";
    el.style.cssText = [
      "position:fixed",
      "bottom:22px",
      "left:50%",
      "transform:translateX(-50%)",
      "z-index:99999",
      "padding:12px 22px",
      "border-radius:10px",
      "background:rgba(15,11,24,0.94)",
      "color:#f4f2f8",
      "font:600 14px system-ui,sans-serif",
      "cursor:pointer",
      "box-shadow:0 8px 32px rgba(0,0,0,0.4)",
      "border:1px solid rgba(167,139,250,0.45)",
      "max-width:calc(100vw - 40px)",
      "text-align:center"
    ].join(";");
    function go() {
      removeUnlock();
      tryPlay();
    }
    el.addEventListener("click", go);
    el.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        go();
      }
    });
    document.body.appendChild(el);
  }

  function showNarrationError(message) {
    var prev = document.getElementById("narration-error");
    if (prev) prev.remove();
    var el = document.createElement("div");
    el.id = "narration-error";
    el.textContent = message;
    el.style.cssText = [
      "position:fixed",
      "top:16px",
      "left:50%",
      "transform:translateX(-50%)",
      "z-index:99998",
      "padding:10px 16px",
      "border-radius:8px",
      "background:rgba(127,29,29,0.95)",
      "color:#fecaca",
      "font:13px/1.4 system-ui,sans-serif",
      "max-width:min(520px,calc(100vw - 32px))"
    ].join(";");
    document.body.appendChild(el);
  }

  /**
   * @param {string} src - URL to audio file (relative to the slide HTML)
   * @param {{
   *   startDelayMs?: number,
   *   endDelayMs?: number,
   *   nextHref?: string,
   *   volume?: number,
   *   onReady?: (audio: HTMLAudioElement) => void,
   *   onEnded?: () => void
   * }} [options]
   */
  global.playSlideNarrationAudio = function (src, options) {
    options = options || {};
    var startDelayMs = options.startDelayMs != null ? options.startDelayMs : 380;
    var endDelayMs = options.endDelayMs != null ? options.endDelayMs : 400;
    var nextHref = options.nextHref;

    function start() {
      stopCurrent();
      var audio = new Audio(src);
      current = audio;
      if (options.volume != null) audio.volume = options.volume;

      audio.addEventListener("error", function () {
        showNarrationError(
          "Could not load audio: " +
            src +
            ". Put a valid .wav or .mp3 in the audio/ folder (same folder as the slides)."
        );
      });

      audio.addEventListener("loadedmetadata", function () {
        if (typeof options.onReady === "function") {
          try {
            options.onReady(audio);
          } catch (e) {}
        }
      });

      audio.addEventListener("ended", function () {
        current = null;
        if (typeof options.onEnded === "function") {
          try {
            options.onEnded();
          } catch (e) {}
        }
        if (!nextHref) return;
        window.setTimeout(function () {
          global.location.href = nextHref;
        }, endDelayMs);
      });

      function tryPlay() {
        audio.play().then(removeUnlock).catch(function () {
          showNarrationUnlock(tryPlay);
        });
      }

      tryPlay();
    }

    window.setTimeout(start, startDelayMs);
  };

  global.stopSlideNarrationAudio = stopCurrent;

  global.addEventListener("beforeunload", stopCurrent);
})(typeof window !== "undefined" ? window : this);

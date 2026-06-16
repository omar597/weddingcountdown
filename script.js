const TARGET_LOCAL = new Date(2026, 6, 10, 20, 0, 0, 0); // Jul (0-based month), 10, 2026 20:00 local time
const BG_CACHE_KEY = "weddingcountdown-bg-url";
const DRIVE_ID = "1ItVKd1BQPP7yt22cWJJQx5TrnxOByqjj";

function pad2(n) {
  return String(n).padStart(2, "0");
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function applyBackground(src) {
  document.documentElement.style.setProperty("--bg-photo", `url("${src}")`);
  try {
    sessionStorage.setItem(BG_CACHE_KEY, src);
  } catch {
    // ignore storage errors
  }
}

function wirePageTransitions() {
  const links = document.querySelectorAll("a.envelopeLink[href]");
  for (const a of links) {
    a.addEventListener("click", (e) => {
      const href = a.getAttribute("href");
      if (!href || href.startsWith("#")) return;

      e.preventDefault();
      document.body.classList.add("is-exiting");
      window.setTimeout(() => {
        window.location.href = href;
      }, 420);
    });
  }
}

function showBgWarningIfMissing() {
  const shouldShowDebug = new URLSearchParams(location.search).get("debug") === "1";
  const warning = document.getElementById("bgWarning");
  const debug = document.getElementById("debugPath");
  if (debug) debug.hidden = !shouldShowDebug;

  try {
    const cached = sessionStorage.getItem(BG_CACHE_KEY);
    if (cached) {
      applyBackground(cached);
      if (warning) warning.hidden = true;
      return;
    }
  } catch {
    // ignore storage errors
  }

  // Local first (fast), then one optimized Drive thumbnail.
  const candidates = [
    "./assets/background.jpg",
    "./assets/background.jpeg",
    "./assets/background.png",
    "./assets/background.webp",
    `https://drive.google.com/thumbnail?id=${DRIVE_ID}&sz=w1600`,
  ];

  const tryLoad = (i) => {
    if (i >= candidates.length) {
      if (warning) warning.hidden = false;
      if (debug && shouldShowDebug) {
        debug.hidden = false;
        debug.textContent = `Loaded from: ${location.href} • Background: not found`;
      }
      return;
    }

    const src = candidates[i];
    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      applyBackground(src);
      if (warning) warning.hidden = true;
      if (debug && shouldShowDebug) {
        debug.hidden = false;
        debug.textContent = `Loaded from: ${location.href} • Background: ${src}`;
      }
    };
    img.onerror = () => tryLoad(i + 1);
    img.src = src;
  };

  tryLoad(0);
}

function updateCountdown() {
  const now = new Date();
  const diffMs = TARGET_LOCAL.getTime() - now.getTime();

  const timer = document.getElementById("timer");
  const done = document.getElementById("done");

  if (!timer && !done) return;

  if (diffMs <= 0) {
    if (timer) timer.hidden = true;
    if (done) done.hidden = false;
    return;
  }

  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / (60 * 60 * 24));
  const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60));
  const mins = Math.floor((totalSeconds % (60 * 60)) / 60);
  const secs = totalSeconds % 60;

  setText("days2", pad2(days));
  setText("hours2", pad2(hours));
  setText("mins2", pad2(mins));
  setText("secs2", pad2(secs));
}

function startCountdown() {
  if (!document.getElementById("timer")) return;
  updateCountdown();
  window.setInterval(updateCountdown, 1000);
}

showBgWarningIfMissing();
wirePageTransitions();
startCountdown();

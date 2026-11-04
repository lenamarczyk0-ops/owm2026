const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

const state = { course: "01", day: 0 };

function renderProgram() {
  const course = PROGRAM[state.course];
  const day = course.days[state.day];

  document.querySelectorAll("[data-course]").forEach((b) => {
    b.setAttribute("aria-selected", b.dataset.course === state.course);
  });
  document.getElementById("day-tabs").innerHTML = course.days
    .map((d, i) => `<button role="tab" aria-selected="${i === state.day}" data-day="${i}">
        <strong>${esc(d.label)}</strong><span>${esc(d.kind)}</span></button>`)
    .join("");

  document.getElementById("program-list").innerHTML = day.items
    .map(([time, title, who, place, type]) =>
      type === "break"
        ? `<li class="break"><time>${time}</time><span>${esc(title)}</span></li>`
        : `<li><time>${time}</time><div>
            <h4>${esc(title)}</h4>
            ${who ? `<p class="who">${esc(who)}</p>` : ""}
            <p class="where">${esc(PLACES[place] || place)}</p>
          </div></li>`)
    .join("");

  document.getElementById("program").dataset.course = state.course;
}

document.getElementById("course-tabs").addEventListener("click", (e) => {
  const b = e.target.closest("[data-course]");
  if (!b) return;
  state.course = b.dataset.course;
  state.day = 0;
  renderProgram();
});

document.getElementById("day-tabs").addEventListener("click", (e) => {
  const b = e.target.closest("[data-day]");
  if (!b) return;
  state.day = +b.dataset.day;
  renderProgram();
});

document.getElementById("people").innerHTML = PEOPLE.filter((p) => p[4]).map(([deg, name, desc, courses, img]) => `
  <article class="person">
    <div class="photo">
      <img src="img/prelegenci/${img}.jpg" alt="${esc(name)}" loading="lazy">
      <div class="chips">${[...courses].map((c) => `<span class="chip c0${c}">0${c}</span>`).join("")}</div>
    </div>
    <div class="body">
      ${deg ? `<p class="deg">${esc(deg)}</p>` : ""}
      <h3>${esc(name)}</h3>
      <p>${esc(desc)}</p>
    </div>
  </article>`).join("");

const stripPhotos = Array.from({ length: 16 }, (_, i) =>
  `<img src="img/2025/${String(i + 1).padStart(2, "0")}.jpg" alt="" loading="lazy" width="270" height="180">`).join("");
// the track holds two copies so the scroll loops without a seam
document.getElementById("strip").innerHTML = stripPhotos + stripPhotos;

const nav = document.querySelector(".nav");
document.querySelector(".menu-btn").addEventListener("click", () => nav.classList.toggle("open"));
nav.addEventListener("click", (e) => { if (e.target.tagName === "A") nav.classList.remove("open"); });

const target = new Date("2026-11-26T10:00:00+01:00");
const cd = document.getElementById("countdown");
function tick() {
  const ms = target - Date.now();
  if (ms <= 0) { cd.hidden = true; return; }
  const d = Math.floor(ms / 864e5), h = Math.floor(ms / 36e5) % 24, m = Math.floor(ms / 6e4) % 60;
  cd.innerHTML = [[d, "dni"], [h, "godz."], [m, "min"]]
    .map(([v, l]) => `<div><strong>${v}</strong><span>${l}</span></div>`).join("");
}
tick();
setInterval(tick, 30000);

function heroNetwork() {
  const canvas = document.getElementById("hero-net");
  if (!canvas || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const ctx = canvas.getContext("2d");
  const LINK = 140;
  let w, h, dots;

  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.round(Math.min(70, (w * h) / 16000));
    dots = Array.from({ length: n }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      r: 1 + Math.random() * 1.8,
    }));
  }

  let visible = true;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(canvas);

  function frame() {
    requestAnimationFrame(frame);
    if (!visible || document.hidden) return;
    ctx.clearRect(0, 0, w, h);
    for (const d of dots) {
      d.x += d.vx;
      d.y += d.vy;
      if (d.x < -20) d.x = w + 20; else if (d.x > w + 20) d.x = -20;
      if (d.y < -20) d.y = h + 20; else if (d.y > h + 20) d.y = -20;
    }
    for (let i = 0; i < dots.length; i++) {
      for (let j = i + 1; j < dots.length; j++) {
        const a = dots[i], b = dots[j];
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (dist < LINK) {
          ctx.strokeStyle = `rgba(150, 220, 255, ${0.22 * (1 - dist / LINK)})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
    ctx.fillStyle = "rgba(190, 240, 255, .7)";
    for (const d of dots) {
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  addEventListener("resize", resize);
  resize();
  frame();
}

function heroPhotos() {
  const slots = [...document.querySelectorAll(".hp")];
  if (!slots.length || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const src = (n) => `img/2025/${String(n).padStart(2, "0")}.jpg`;
  const shown = [2, 5, 12];
  const queue = Array.from({ length: 16 }, (_, i) => i + 1).filter((n) => !shown.includes(n));
  let slot = 0;

  setInterval(() => {
    if (document.hidden) return;
    const img = slots[slot];
    const next = queue.shift();
    queue.push(shown[slot]);
    shown[slot] = next;
    const pre = new Image();
    pre.src = src(next);
    pre.decode().catch(() => {}).then(() => {
      img.classList.add("out");
      setTimeout(() => { img.src = pre.src; img.classList.remove("out"); }, 800);
    });
    slot = (slot + 1) % slots.length;
  }, 3000);
}

renderProgram();
heroNetwork();
heroPhotos();

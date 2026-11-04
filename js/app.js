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

renderProgram();

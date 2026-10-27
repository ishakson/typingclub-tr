/** TypingClub TR — ana uygulama */
(function () {
  const lessons = window.TYPING_LESSONS;
  const kb = window.TurkishKeyboard;
  const P = window.Progress;
  const SFX = window.SFX;

  const $ = (id) => document.getElementById(id);
  const els = {
    home: $("view-home"),
    practice: $("view-practice"),
    path: $("lesson-path"),
    title: $("practice-title"),
    prompt: $("prompt"),
    input: $("hidden-input"),
    keyboard: $("keyboard"),
    handLeft: $("hand-left"),
    handRight: $("hand-right"),
    hands: $("hands"),
    hint: $("finger-hint"),
    fill: $("progress-fill"),
    wpm: $("live-wpm"),
    acc: $("live-acc"),
    starsLive: $("stars-live"),
    totalStars: $("total-stars"),
    totalLevel: $("total-level"),
    modalResult: $("modal-result"),
    modalBadges: $("modal-badges"),
    starsBig: $("stars-big"),
    resultHeading: $("result-heading"),
    resultStats: $("result-stats"),
    badgeGrid: $("badge-grid"),
    btnStart: $("btn-start"),
    btnExit: $("btn-exit"),
    btnRestart: $("btn-restart"),
    btnRetry: $("btn-retry"),
    btnContinue: $("btn-continue"),
    btnBadges: $("btn-badges"),
    badgesClose: $("badges-close"),
    brand: $("brand-home"),
    toggleSfx: $("toggle-sfx"),
    toggleHands: $("toggle-hands")
  };

  let state = {
    index: -1,
    target: "",
    typed: "",
    startedAt: null,
    finished: false
  };

  function escapeHtml(s) {
    return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  }

  function starsHtml(n, max) {
    max = max || 5;
    let h = "";
    for (let i = 0; i < max; i++) h += '<span class="star' + (i < n ? " on" : "") + '">★</span>';
    return h;
  }

  function refreshHeader() {
    const t = P.totalStars();
    els.totalStars.textContent = "⭐ " + t;
    els.totalLevel.textContent = "Lv " + P.levelFromStars(t);
  }

  function renderPath() {
    els.path.innerHTML = "";
    lessons.forEach((lesson, i) => {
      const prevOk = i === 0 || P.starsForLesson(lessons[i - 1].id) >= 1;
      const stars = P.starsForLesson(lesson.id);
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "lesson-node" + (stars > 0 ? " done" : "");
      btn.disabled = !prevOk;
      btn.innerHTML =
        '<div class="num">' + (i + 1) + "</div>" +
        '<div class="level-tag">' + escapeHtml(lesson.level) + "</div>" +
        '<div class="title">' + escapeHtml(lesson.title) + "</div>" +
        '<div class="stars-row">' + starsHtml(stars) + "</div>";
      btn.addEventListener("click", () => startLesson(i));
      els.path.appendChild(btn);
    });
  }

  function showHome() {
    els.practice.hidden = true;
    els.home.hidden = false;
    els.modalResult.hidden = true;
    state.index = -1;
    refreshHeader();
    renderPath();
  }

  function startLesson(i) {
    state.index = i;
    state.target = lessons[i].text;
    state.typed = "";
    state.startedAt = null;
    state.finished = false;
    els.title.textContent = lessons[i].title;
    els.home.hidden = true;
    els.practice.hidden = false;
    els.modalResult.hidden = true;
    els.fill.style.width = "0%";
    els.wpm.textContent = "0";
    els.acc.textContent = "100%";
    els.starsLive.innerHTML = starsHtml(0);
    renderPrompt();
    kb.highlightNext(els.keyboard, state.target[0], els.hint, els.hands);
    els.input.value = "";
    els.input.focus();
  }

  function renderPrompt() {
    const target = state.target;
    const typed = state.typed;
    let html = "";
    for (let i = 0; i < target.length; i++) {
      const ch = target[i];
      const shown = ch === " " ? "·" : ch;
      if (i < typed.length) {
        html += '<span class="' + (typed[i] === ch ? "done" : "wrong-mark") + '">' + escapeHtml(shown) + "</span>";
      } else if (i === typed.length) {
        html += '<span class="current">' + escapeHtml(shown) + "</span>";
      } else {
        html += '<span class="todo">' + escapeHtml(shown) + "</span>";
      }
    }
    els.prompt.innerHTML = html;
    const pct = Math.min(100, (typed.length / target.length) * 100);
    els.fill.style.width = pct + "%";
  }

  function metrics() {
    let correct = 0;
    const len = Math.min(state.typed.length, state.target.length);
    for (let i = 0; i < len; i++) if (state.typed[i] === state.target[i]) correct++;
    const errors = state.typed.length - correct + Math.max(0, state.typed.length - state.target.length);
    const elapsed = state.startedAt ? Date.now() - state.startedAt : 0;
    const wpm = elapsed < 1 ? 0 : Math.round((correct / 5) / (elapsed / 60000));
    const accuracy = state.typed.length === 0 ? 100 : Math.max(0, Math.round((correct / state.typed.length) * 100));
    return { correct, errors, wpm, accuracy };
  }

  function onKeydown(e) {
    if (els.practice.hidden || state.finished) return;
    // capture typing globally while practicing
    if (e.key === "Backspace") {
      e.preventDefault();
      state.typed = state.typed.slice(0, -1);
      renderPrompt();
      kb.highlightNext(els.keyboard, state.target[state.typed.length], els.hint, els.hands);
      return;
    }
    if (e.key.length !== 1 || e.ctrlKey || e.metaKey || e.altKey) return;
    e.preventDefault();
    if (!state.startedAt) state.startedAt = Date.now();

    const expected = state.target[state.typed.length];
    const got = e.key;
    const ok = got === expected;
    state.typed += got;
    kb.flash(els.keyboard, got, ok);
    if (ok) SFX.key(); else SFX.error();

    const m = metrics();
    els.wpm.textContent = String(m.wpm);
    els.acc.textContent = m.accuracy + "%";
    // live star estimate
    els.starsLive.innerHTML = starsHtml(P.calcStars(m.accuracy, m.wpm));

    renderPrompt();
    if (state.typed.length >= state.target.length) {
      finish(m);
    } else {
      kb.highlightNext(els.keyboard, state.target[state.typed.length], els.hint, els.hands);
    }
  }

  function finish(m) {
    if (state.finished) return;
    state.finished = true;
    kb.clear(els.keyboard);
    const stars = P.calcStars(m.accuracy, m.wpm);
    const lesson = lessons[state.index];
    P.setStars(lesson.id, stars);
    P.addTyped(state.typed.length);
    const flags = {};
    if (m.wpm >= 20) flags.speed20 = true;
    if (m.accuracy === 100) flags.perfect = true;
    P.earnBadges(flags);

    els.starsBig.innerHTML = starsHtml(stars);
    els.resultHeading.textContent =
      stars >= 5 ? "Mükemmel!" : stars >= 3 ? "Harika iş!" : stars >= 1 ? "İyi başlangıç!" : "Tekrar dene";
    els.resultStats.textContent = "WPM " + m.wpm + " · Doğruluk %" + m.accuracy + " · Hata " + m.errors + " · " + stars + "/5 yıldız";
    els.modalResult.hidden = false;
    if (stars > 0) SFX.star();
    SFX.done();
    refreshHeader();
  }

  function renderBadges() {
    els.badgeGrid.innerHTML = "";
    P.allBadges().forEach((b) => {
      const div = document.createElement("div");
      div.className = "badge" + (b.earned ? " earned" : "");
      div.innerHTML = '<div class="ico">' + b.ico + "</div><h4>" + escapeHtml(b.name) + "</h4><p>" + escapeHtml(b.desc) + "</p>";
      els.badgeGrid.appendChild(div);
    });
  }

  // init UI
  kb.build(els.keyboard);
  kb.buildHands(els.handLeft, els.handRight);
  refreshHeader();
  renderPath();

  document.addEventListener("keydown", onKeydown);
  els.practice.addEventListener("click", () => els.input.focus());

  els.btnStart && els.btnStart.addEventListener("click", () => {
    const firstLocked = lessons.findIndex((_, i) => i > 0 && P.starsForLesson(lessons[i - 1].id) < 1);
    const idx = lessons.findIndex((l) => P.starsForLesson(l.id) < 5);
    startLesson(idx >= 0 ? idx : 0);
  });
  els.btnExit.addEventListener("click", showHome);
  els.brand && els.brand.addEventListener("click", (e) => { e.preventDefault(); showHome(); });
  els.btnRestart.addEventListener("click", () => startLesson(state.index));
  els.btnRetry.addEventListener("click", () => startLesson(state.index));
  els.btnContinue.addEventListener("click", () => {
    if (state.index < lessons.length - 1) startLesson(state.index + 1);
    else showHome();
  });
  els.btnBadges.addEventListener("click", () => { renderBadges(); els.modalBadges.hidden = false; });
  els.badgesClose.addEventListener("click", () => { els.modalBadges.hidden = true; });
  els.modalBadges.addEventListener("click", (e) => { if (e.target === els.modalBadges) els.modalBadges.hidden = true; });

  els.toggleSfx.addEventListener("change", () => SFX.setEnabled(els.toggleSfx.checked));
  els.toggleHands.addEventListener("change", () => {
    els.hands.style.display = els.toggleHands.checked ? "flex" : "none";
  });
})();

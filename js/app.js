/** TypingClub TR — ana uygulama */
(function () {
  const lessons = window.TYPING_LESSONS || [];
  const kb = window.TurkishKeyboard;

  const els = {
    picker: document.getElementById("lesson-picker"),
    list: document.getElementById("lesson-list"),
    practice: document.getElementById("practice"),
    title: document.getElementById("lesson-title"),
    prompt: document.getElementById("prompt"),
    input: document.getElementById("input"),
    keyboard: document.getElementById("keyboard"),
    stats: document.getElementById("stats"),
    wpm: document.getElementById("wpm"),
    accuracy: document.getElementById("accuracy"),
    errors: document.getElementById("errors"),
    result: document.getElementById("result"),
    resultText: document.getElementById("result-text"),
    btnBack: document.getElementById("btn-back"),
    btnRestart: document.getElementById("btn-restart"),
    btnAgain: document.getElementById("btn-again"),
    btnNext: document.getElementById("btn-next")
  };

  let state = {
    lessonIndex: -1,
    target: "",
    startedAt: null,
    finished: false,
    errorCount: 0
  };

  function renderLessonList() {
    els.list.innerHTML = "";
    lessons.forEach((lesson, index) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "lesson-card";
      btn.innerHTML =
        '<span class="level">' + escapeHtml(lesson.level) + "</span>" +
        "<h3>" + escapeHtml(lesson.title) + "</h3>" +
        "<p>" + escapeHtml(lesson.description) + "</p>";
      btn.addEventListener("click", () => startLesson(index));
      els.list.appendChild(btn);
    });
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function startLesson(index) {
    state.lessonIndex = index;
    state.target = lessons[index].text;
    state.startedAt = null;
    state.finished = false;
    state.errorCount = 0;

    els.title.textContent = lessons[index].title;
    els.input.value = "";
    els.input.disabled = false;
    els.result.hidden = true;
    els.stats.hidden = false;
    els.picker.hidden = true;
    els.practice.hidden = false;

    updateStats(0, 100, 0);
    renderPrompt("");
    kb.clearHighlights(els.keyboard);
    kb.highlightNext(els.keyboard, state.target[0]);
    els.input.focus();
  }

  function showPicker() {
    els.practice.hidden = true;
    els.picker.hidden = false;
    els.stats.hidden = true;
    els.result.hidden = true;
    state.lessonIndex = -1;
  }

  function renderPrompt(typed) {
    const target = state.target;
    let html = "";
    for (let i = 0; i < target.length; i++) {
      const ch = target[i];
      const shown = ch === " " ? "·" : ch;
      if (i < typed.length) {
        const ok = typed[i] === ch;
        html += '<span class="' + (ok ? "done" : "wrong-mark") + '">' + escapeHtml(shown) + "</span>";
      } else if (i === typed.length) {
        html += '<span class="current">' + escapeHtml(shown) + "</span>";
      } else {
        html += '<span class="todo">' + escapeHtml(shown) + "</span>";
      }
    }
    els.prompt.innerHTML = html;
  }

  function calcWpm(typedLen, elapsedMs) {
    if (elapsedMs < 1) return 0;
    const minutes = elapsedMs / 60000;
    // standart: 5 karakter = 1 kelime
    return Math.round((typedLen / 5) / minutes);
  }

  function calcAccuracy(correct, totalTyped) {
    if (totalTyped === 0) return 100;
    return Math.max(0, Math.round((correct / totalTyped) * 100));
  }

  function updateStats(wpm, accuracy, errors) {
    els.wpm.textContent = String(wpm);
    els.accuracy.textContent = accuracy + "%";
    els.errors.textContent = String(errors);
  }

  function onInput() {
    if (state.finished) return;
    const typed = els.input.value;
    if (!state.startedAt && typed.length > 0) {
      state.startedAt = Date.now();
    }

    // Hata sayımı: yanlış konumdaki karakterler
    let correct = 0;
    let errors = 0;
    const len = Math.min(typed.length, state.target.length);
    for (let i = 0; i < len; i++) {
      if (typed[i] === state.target[i]) correct++;
      else errors++;
    }
    // fazla yazılanlar da hata
    if (typed.length > state.target.length) {
      errors += typed.length - state.target.length;
    }
    state.errorCount = errors;

    const elapsed = state.startedAt ? Date.now() - state.startedAt : 0;
    const wpm = calcWpm(correct, elapsed);
    const accuracy = calcAccuracy(correct, typed.length);
    updateStats(wpm, accuracy, errors);

    renderPrompt(typed);

    // son basılan tuş
    if (typed.length > 0) {
      const i = typed.length - 1;
      const expected = state.target[i];
      const got = typed[i];
      kb.flashKey(els.keyboard, got, got === expected);
    }

    if (typed.length >= state.target.length) {
      // hedefe ulaşıldı (fazla yazım varsa da bitir)
      const nextCh = null;
      kb.highlightNext(els.keyboard, nextCh);
      if (typed.length === state.target.length || typed.startsWith(state.target)) {
        finishLesson(wpm, accuracy, errors);
      } else {
        kb.highlightNext(els.keyboard, null);
      }
    } else {
      kb.highlightNext(els.keyboard, state.target[typed.length]);
    }

    // Tam eşleşme ile bitir
    if (typed === state.target) {
      finishLesson(wpm, accuracy, errors);
    }
  }

  function finishLesson(wpm, accuracy, errors) {
    if (state.finished) return;
    state.finished = true;
    els.input.disabled = true;
    kb.clearHighlights(els.keyboard);
    els.result.hidden = false;
    els.resultText.textContent =
      "Hız: " + wpm + " WPM · Doğruluk: %" + accuracy + " · Hata: " + errors;
    const hasNext = state.lessonIndex < lessons.length - 1;
    els.btnNext.hidden = !hasNext;
  }

  function restart() {
    if (state.lessonIndex < 0) return;
    startLesson(state.lessonIndex);
  }

  function nextLesson() {
    if (state.lessonIndex < lessons.length - 1) {
      startLesson(state.lessonIndex + 1);
    } else {
      showPicker();
    }
  }

  // init
  kb.build(els.keyboard);
  renderLessonList();
  els.input.addEventListener("input", onInput);
  els.btnBack.addEventListener("click", showPicker);
  els.btnRestart.addEventListener("click", restart);
  els.btnAgain.addEventListener("click", restart);
  els.btnNext.addEventListener("click", nextLesson);

  // Türkçe I/ı için fiziksel tuş görseli (opsiyonel)
  document.addEventListener("keydown", (e) => {
    if (els.practice.hidden || state.finished) return;
    if (e.key.length === 1) {
      // görsel feedback input event’te
    }
  });
})();

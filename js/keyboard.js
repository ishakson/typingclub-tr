/** Türkçe Q klavye görselleştirmesi */
(function () {
  const ROWS = [
    ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "*", "-"],
    ["q", "w", "e", "r", "t", "y", "u", "ı", "o", "p", "ğ", "ü"],
    ["a", "s", "d", "f", "g", "h", "j", "k", "l", "ş", "i", ","],
    ["z", "x", "c", "v", "b", "n", "m", "ö", "ç", ".", "/"],
    [" "]
  ];

  /** Karakter → klavye tuş etiketi */
  const CHAR_TO_KEY = {
    " ": " ",
    ",": ",",
    ".": ".",
    "/": "/",
    "*": "*",
    "-": "-"
  };

  function keyId(label) {
    return "key-" + (label === " " ? "space" : label);
  }

  function buildKeyboard(container) {
    container.innerHTML = "";
    ROWS.forEach((row, rowIndex) => {
      const rowEl = document.createElement("div");
      rowEl.className = "kb-row";
      row.forEach((label) => {
        const key = document.createElement("div");
        key.className = "key";
        if (label === " ") {
          key.classList.add("space");
          key.textContent = "boşluk";
        } else {
          key.textContent = label;
          if (rowIndex === 2 && (label === "a" || label === "ş")) key.classList.add("wide");
        }
        key.dataset.key = label;
        key.id = keyId(label);
        rowEl.appendChild(key);
      });
      container.appendChild(rowEl);
    });
  }

  function normalizeChar(ch) {
    if (!ch) return null;
    if (CHAR_TO_KEY[ch]) return CHAR_TO_KEY[ch];
    return ch.toLocaleLowerCase("tr-TR");
  }

  function clearHighlights(container) {
    container.querySelectorAll(".key.next, .key.pressed, .key.wrong-press").forEach((el) => {
      el.classList.remove("next", "pressed", "wrong-press");
    });
  }

  function highlightNext(container, ch) {
    clearHighlights(container);
    const key = normalizeChar(ch);
    if (key == null) return;
    const el = container.querySelector('[data-key="' + CSS.escape(key) + '"]');
    if (el) el.classList.add("next");
  }

  function flashKey(container, ch, ok) {
    const key = normalizeChar(ch);
    if (key == null) return;
    const el = container.querySelector('[data-key="' + CSS.escape(key) + '"]');
    if (!el) return;
    el.classList.remove("pressed", "wrong-press");
    el.classList.add(ok ? "pressed" : "wrong-press");
    window.setTimeout(() => {
      el.classList.remove("pressed", "wrong-press");
    }, 120);
  }

  window.TurkishKeyboard = {
    build: buildKeyboard,
    highlightNext,
    flashKey,
    clearHighlights,
    normalizeChar
  };
})();

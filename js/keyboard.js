/** Türkçe Q + parmak renkleri (TypingClub tarzı) */
(function () {
  const ROWS = [
    ["1","2","3","4","5","6","7","8","9","0","*","-"],
    ["q","w","e","r","t","y","u","ı","o","p","ğ","ü"],
    ["a","s","d","f","g","h","j","k","l","ş","i",","],
    ["z","x","c","v","b","n","m","ö","ç",".","/"],
    [" "]
  ];

  // finger: L/R + pinky|ring|middle|index|thumb
  const FINGER = {
    "1":"L-pinky","q":"L-pinky","a":"L-pinky","z":"L-pinky",
    "2":"L-ring","w":"L-ring","s":"L-ring","x":"L-ring",
    "3":"L-middle","e":"L-middle","d":"L-middle","c":"L-middle",
    "4":"L-index","r":"L-index","f":"L-index","v":"L-index",
    "5":"L-index","t":"L-index","g":"L-index","b":"L-index",
    "6":"R-index","y":"R-index","h":"R-index","n":"R-index",
    "7":"R-index","u":"R-index","j":"R-index","m":"R-index",
    "8":"R-middle","ı":"R-middle","k":"R-middle","ö":"R-middle",
    "9":"R-ring","o":"R-ring","l":"R-ring","ç":"R-ring",
    "0":"R-pinky","*":"R-pinky","-":"R-pinky",
    "p":"R-pinky","ş":"R-pinky","i":"R-pinky",",":"R-pinky",
    "ğ":"R-pinky","ü":"R-pinky",".":"R-pinky","/":"R-pinky",
    " ": "thumb"
  };

  const FINGER_TR = {
    "L-pinky":"Sol serçe parmak","L-ring":"Sol yüzük parmak","L-middle":"Sol orta parmak","L-index":"Sol işaret parmak",
    "R-pinky":"Sağ serçe parmak","R-ring":"Sağ yüzük parmak","R-middle":"Sağ orta parmak","R-index":"Sağ işaret parmak",
    "thumb":"Başparmak (boşluk)"
  };

  const HAND_MAP = {
    "L-pinky":["left","d1"],"L-ring":["left","d2"],"L-middle":["left","d3"],"L-index":["left","d4"],
    "thumb":["left","d5"],
    "R-index":["right","d2"],"R-middle":["right","d3"],"R-ring":["right","d4"],"R-pinky":["right","d5"]
  };

  function fingerClass(f) {
    if (!f) return "";
    if (f === "thumb") return "finger-thumb";
    const part = f.split("-")[1];
    return "finger-" + part;
  }

  function build(container) {
    container.innerHTML = "";
    ROWS.forEach((row) => {
      const rowEl = document.createElement("div");
      rowEl.className = "kb-row";
      row.forEach((label) => {
        const key = document.createElement("div");
        key.className = "key " + fingerClass(FINGER[label]);
        if (label === " ") { key.classList.add("space"); key.textContent = "boşluk"; }
        else key.textContent = label;
        key.dataset.key = label;
        rowEl.appendChild(key);
      });
      container.appendChild(rowEl);
    });
  }

  function buildHands(leftEl, rightEl) {
    leftEl.innerHTML = [1,2,3,4,5].map((n) => '<span class="digit d' + n + '"></span>').join("");
    rightEl.innerHTML = [1,2,3,4,5].map((n) => '<span class="digit d' + n + '"></span>').join("");
  }

  function norm(ch) {
    if (!ch) return null;
    if (ch === " ") return " ";
    return ch.toLocaleLowerCase("tr-TR");
  }

  function clear(container) {
    container.querySelectorAll(".key.next,.key.pressed,.key.wrong-press").forEach((el) => {
      el.classList.remove("next","pressed","wrong-press");
    });
  }

  function highlightNext(container, ch, hintEl, hands) {
    clear(container);
    if (hands) {
      hands.querySelectorAll(".digit.active").forEach((d) => d.classList.remove("active"));
    }
    const key = norm(ch);
    if (key == null) {
      if (hintEl) hintEl.textContent = "";
      return;
    }
    const el = container.querySelector('[data-key="' + CSS.escape(key) + '"]');
    if (el) el.classList.add("next");
    const f = FINGER[key];
    if (hintEl) hintEl.textContent = FINGER_TR[f] || "";
    if (hands && f) {
      const map = f === "thumb" ? ["left","d5"] : HAND_MAP[f];
      if (map) {
        const hand = hands.querySelector(".hand." + map[0] + " ." + map[1]);
        if (hand) hand.classList.add("active");
        if (f === "thumb") {
          const r = hands.querySelector(".hand.right .d1");
          if (r) r.classList.add("active");
        }
      }
    }
  }

  function flash(container, ch, ok) {
    const key = norm(ch);
    if (key == null) return;
    const el = container.querySelector('[data-key="' + CSS.escape(key) + '"]');
    if (!el) return;
    el.classList.add(ok ? "pressed" : "wrong-press");
    setTimeout(() => el.classList.remove("pressed","wrong-press"), 120);
  }

  window.TurkishKeyboard = { build, buildHands, highlightNext, flash, clear, fingerHint: FINGER_TR };
})();

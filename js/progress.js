/** localStorage ilerleme + rozetler */
window.Progress = (function () {
  const KEY = "typingclub-tr-v1";

  function load() {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || { stars: {}, badges: {}, totalTyped: 0 };
    } catch (_) {
      return { stars: {}, badges: {}, totalTyped: 0 };
    }
  }

  function save(data) {
    localStorage.setItem(KEY, JSON.stringify(data));
  }

  function starsForLesson(id) {
    return load().stars[id] || 0;
  }

  function setStars(id, n) {
    const data = load();
    data.stars[id] = Math.max(data.stars[id] || 0, n);
    save(data);
    return data.stars[id];
  }

  function totalStars() {
    const s = load().stars;
    return Object.values(s).reduce((a, b) => a + b, 0);
  }

  function levelFromStars(n) {
    return Math.max(1, Math.floor(n / 5) + 1);
  }

  function calcStars(accuracy, wpm) {
    if (accuracy < 70) return 0;
    let stars = 1;
    if (accuracy >= 80) stars = 2;
    if (accuracy >= 90) stars = 3;
    if (accuracy >= 95 && wpm >= 12) stars = 4;
    if (accuracy >= 98 && wpm >= 20) stars = 5;
    return stars;
  }

  const BADGE_DEFS = [
    { id: "first-star", name: "İlk yıldız", desc: "İlk yıldızını kazan", ico: "⭐", test: (d) => totalStars() >= 1 },
    { id: "five-stars", name: "Beş yıldız", desc: "Bir derste 5 yıldız", ico: "🌟", test: (d) => Object.values(d.stars).some((n) => n >= 5) },
    { id: "ten-total", name: "On yıldız", desc: "Toplam 10 yıldız", ico: "✨", test: () => totalStars() >= 10 },
    { id: "turkish", name: "Türkçe usta", desc: "Türkçe harf dersini bitir", ico: "🇹🇷", test: (d) => (d.stars["turkish-chars"] || 0) >= 1 },
    { id: "speed", name: "Hızlı parmak", desc: "20+ WPM ile bitir", ico: "⚡", test: (d) => !!d.flags && d.flags.speed20 },
    { id: "perfect", name: "Kusursuz", desc: "%100 doğruluk", ico: "💎", test: (d) => !!d.flags && d.flags.perfect }
  ];

  function earnBadges(extraFlags) {
    const data = load();
    data.flags = Object.assign({}, data.flags || {}, extraFlags || {});
    const newly = [];
    BADGE_DEFS.forEach((b) => {
      if (!data.badges[b.id] && b.test(data)) {
        data.badges[b.id] = Date.now();
        newly.push(b);
      }
    });
    save(data);
    return newly;
  }

  function allBadges() {
    const data = load();
    return BADGE_DEFS.map((b) => ({ ...b, earned: !!data.badges[b.id] }));
  }

  function addTyped(n) {
    const data = load();
    data.totalTyped = (data.totalTyped || 0) + n;
    save(data);
  }

  return { load, starsForLesson, setStars, totalStars, levelFromStars, calcStars, earnBadges, allBadges, addTyped, BADGE_DEFS };
})();

(() => {
  const canvas = document.getElementById("stars");
  const ctx = canvas.getContext("2d");

  let w, h, dpr;
  let stars = [];

  function resize() {
    dpr = Math.max(1, window.devicePixelRatio || 1);
    w = canvas.width = Math.floor(window.innerWidth * dpr);
    h = canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = "100%";
    canvas.style.height = "100%";

    // Rebuild stars
    const count = Math.floor((window.innerWidth * window.innerHeight) / 9000);
    stars = new Array(count).fill(0).map(() => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: (Math.random() * 1.3 + 0.2) * dpr,
      a: Math.random() * 0.6 + 0.2,
      s: (Math.random() * 0.25 + 0.05) * dpr, // speed
    }));
  }

  function tick() {
    ctx.clearRect(0, 0, w, h);

    // subtle haze
    const grd = ctx.createRadialGradient(w * 0.2, h * 0.1, 0, w * 0.2, h * 0.1, Math.max(w, h) * 0.6);
    grd.addColorStop(0, "rgba(81,42,110,0.18)");
    grd.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, w, h);

    for (const s of stars) {
      s.y += s.s;
      if (s.y > h) {
        s.y = -10;
        s.x = Math.random() * w;
      }
      ctx.beginPath();
      ctx.fillStyle = `rgba(255,255,255,${s.a})`;
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }

    requestAnimationFrame(tick);
  }

  window.addEventListener("resize", resize);
  resize();
  tick();
})();

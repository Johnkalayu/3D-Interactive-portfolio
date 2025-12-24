(function(){
  const canvas = document.getElementById("stars");
  if(!canvas) return;
  const ctx = canvas.getContext("2d");
  let w=0,h=0,stars=[];
  function resize(){
    const dpr = window.devicePixelRatio||1;
    w = canvas.width = window.innerWidth * dpr;
    h = canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
    const n = Math.floor((window.innerWidth*window.innerHeight)/12000);
    stars = Array.from({length:n}, ()=>({x:Math.random()*w,y:Math.random()*h,r:(Math.random()*1.4+0.2)*dpr,a:Math.random()*0.7+0.2,s:Math.random()*0.25+0.05}));
  }
  function tick(){
    ctx.clearRect(0,0,w,h);
    for(const st of stars){
      st.y += st.s*(window.devicePixelRatio||1);
      if(st.y>h) st.y = 0;
      ctx.globalAlpha = st.a;
      ctx.beginPath();
      ctx.arc(st.x, st.y, st.r, 0, Math.PI*2);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
    }
    requestAnimationFrame(tick);
  }
  window.addEventListener("resize", resize);
  resize(); tick();
})();
// Stars background animation
(function() {
    const canvas = document.getElementById('stars-canvas');
    const ctx = canvas.getContext('2d');
    
    let stars = [];
    const numStars = 200;
    
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        initStars();
    }
    
    function initStars() {
        stars = [];
        for (let i = 0; i < numStars; i++) {
            stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: Math.random() * 1.5,
                vx: (Math.random() - 0.5) * 0.2,
                vy: (Math.random() - 0.5) * 0.2,
                alpha: Math.random() * 0.5 + 0.3
            });
        }
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        stars.forEach(star => {
            star.x += star.vx;
            star.y += star.vy;
            
            if (star.x < 0 || star.x > canvas.width) star.vx *= -1;
            if (star.y < 0 || star.y > canvas.height) star.vy *= -1;
            
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
            ctx.fill();
        });
        
        requestAnimationFrame(animate);
    }
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    animate();
})();
/**
 * Stars Background Animation
 * Creates a starfield effect on a canvas element
 */

(function() {
    'use strict';

    const canvas = document.getElementById('stars-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationId;
    let stars = [];
    const numStars = 200;
    const speed = 0.5;

    // Star class
    class Star {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.z = Math.random() * canvas.width;
            this.size = Math.random() * 2 + 0.5;
            this.opacity = Math.random() * 0.5 + 0.3;
            this.twinkleSpeed = Math.random() * 0.02 + 0.01;
            this.twinklePhase = Math.random() * Math.PI * 2;
        }

        update() {
            // Move towards viewer
            this.z -= speed;

            // Reset if too close
            if (this.z <= 0) {
                this.reset();
                this.z = canvas.width;
            }

            // Calculate screen position
            const factor = 200 / this.z;
            this.screenX = (this.x - canvas.width / 2) * factor + canvas.width / 2;
            this.screenY = (this.y - canvas.height / 2) * factor + canvas.height / 2;
            this.screenSize = this.size * factor;

            // Twinkle effect
            this.twinklePhase += this.twinkleSpeed;
            this.currentOpacity = this.opacity * (0.7 + 0.3 * Math.sin(this.twinklePhase));
        }

        draw() {
            if (this.screenX < 0 || this.screenX > canvas.width ||
                this.screenY < 0 || this.screenY > canvas.height) {
                return;
            }

            ctx.beginPath();
            ctx.arc(this.screenX, this.screenY, Math.max(0.5, this.screenSize), 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${this.currentOpacity})`;
            ctx.fill();
        }
    }

    // Shooting star class
    class ShootingStar {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height * 0.5;
            this.length = Math.random() * 80 + 40;
            this.speed = Math.random() * 10 + 5;
            this.opacity = 0;
            this.active = false;
            this.angle = Math.PI / 4 + Math.random() * 0.2 - 0.1;
        }

        activate() {
            this.active = true;
            this.opacity = 1;
        }

        update() {
            if (!this.active) return;

            this.x += Math.cos(this.angle) * this.speed;
            this.y += Math.sin(this.angle) * this.speed;
            this.opacity -= 0.02;

            if (this.opacity <= 0 || this.x > canvas.width || this.y > canvas.height) {
                this.reset();
            }
        }

        draw() {
            if (!this.active || this.opacity <= 0) return;

            const tailX = this.x - Math.cos(this.angle) * this.length;
            const tailY = this.y - Math.sin(this.angle) * this.length;

            const gradient = ctx.createLinearGradient(tailX, tailY, this.x, this.y);
            gradient.addColorStop(0, `rgba(255, 255, 255, 0)`);
            gradient.addColorStop(1, `rgba(255, 255, 255, ${this.opacity})`);

            ctx.beginPath();
            ctx.moveTo(tailX, tailY);
            ctx.lineTo(this.x, this.y);
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    }

    // Initialize
    function init() {
        resizeCanvas();
        createStars();
        animate();

        window.addEventListener('resize', resizeCanvas);
    }

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function createStars() {
        stars = [];
        for (let i = 0; i < numStars; i++) {
            stars.push(new Star());
        }
    }

    // Shooting star management
    const shootingStar = new ShootingStar();
    let lastShootingStarTime = 0;
    const shootingStarInterval = 5000 + Math.random() * 10000;

    function animate(timestamp = 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Update and draw stars
        stars.forEach(star => {
            star.update();
            star.draw();
        });

        // Shooting star logic
        if (timestamp - lastShootingStarTime > shootingStarInterval && !shootingStar.active) {
            if (Math.random() > 0.7) {
                shootingStar.reset();
                shootingStar.activate();
                lastShootingStarTime = timestamp;
            }
        }

        shootingStar.update();
        shootingStar.draw();

        animationId = requestAnimationFrame(animate);
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
    });
})();

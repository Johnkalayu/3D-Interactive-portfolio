/**
 * Three.js 3D Scene
 * Creates an interactive 3D background with geometric shapes
 */

(function() {
    'use strict';

    // Check if Three.js is available
    if (typeof THREE === 'undefined') {
        console.warn('Three.js not loaded');
        return;
    }

    const container = document.getElementById('three-container');
    if (!container) return;

    // Scene setup
    let scene, camera, renderer;
    let geometries = [];
    let mouseX = 0, mouseY = 0;
    let windowHalfX = window.innerWidth / 2;
    let windowHalfY = window.innerHeight / 2;
    let animationId;

    // Initialize the scene
    function init() {
        // Create scene
        scene = new THREE.Scene();

        // Create camera
        camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        camera.position.z = 30;

        // Create renderer
        renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(renderer.domElement);

        // Add lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0xffffff, 1);
        pointLight.position.set(20, 20, 20);
        scene.add(pointLight);

        const pointLight2 = new THREE.PointLight(0x4a9eff, 0.5);
        pointLight2.position.set(-20, -20, 10);
        scene.add(pointLight2);

        // Create floating geometries
        createGeometries();

        // Event listeners
        document.addEventListener('mousemove', onMouseMove);
        window.addEventListener('resize', onWindowResize);

        // Start animation
        animate();
    }

    // Create various floating geometric shapes
    function createGeometries() {
        const materials = [
            new THREE.MeshPhongMaterial({
                color: 0x4a9eff,
                transparent: true,
                opacity: 0.7,
                wireframe: false
            }),
            new THREE.MeshPhongMaterial({
                color: 0xff6b4a,
                transparent: true,
                opacity: 0.6,
                wireframe: false
            }),
            new THREE.MeshPhongMaterial({
                color: 0x4aff6b,
                transparent: true,
                opacity: 0.5,
                wireframe: true
            }),
            new THREE.MeshPhongMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.3,
                wireframe: true
            })
        ];

        // Create various shapes
        const shapes = [
            new THREE.IcosahedronGeometry(2, 0),
            new THREE.OctahedronGeometry(1.5, 0),
            new THREE.TetrahedronGeometry(1.8, 0),
            new THREE.TorusGeometry(1, 0.4, 8, 16),
            new THREE.DodecahedronGeometry(1.2, 0),
            new THREE.BoxGeometry(1.5, 1.5, 1.5),
        ];

        // Create multiple instances
        for (let i = 0; i < 15; i++) {
            const geometry = shapes[Math.floor(Math.random() * shapes.length)];
            const material = materials[Math.floor(Math.random() * materials.length)].clone();

            const mesh = new THREE.Mesh(geometry, material);

            // Random position
            mesh.position.x = (Math.random() - 0.5) * 60;
            mesh.position.y = (Math.random() - 0.5) * 40;
            mesh.position.z = (Math.random() - 0.5) * 30 - 10;

            // Random rotation
            mesh.rotation.x = Math.random() * Math.PI;
            mesh.rotation.y = Math.random() * Math.PI;

            // Store animation properties
            mesh.userData = {
                rotationSpeed: {
                    x: (Math.random() - 0.5) * 0.02,
                    y: (Math.random() - 0.5) * 0.02,
                    z: (Math.random() - 0.5) * 0.01
                },
                floatSpeed: Math.random() * 0.5 + 0.5,
                floatOffset: Math.random() * Math.PI * 2,
                originalY: mesh.position.y
            };

            geometries.push(mesh);
            scene.add(mesh);
        }

        // Add some particle dust
        createParticles();
    }

    // Create particle system for dust effect
    function createParticles() {
        const particleCount = 100;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 80;
            positions[i + 1] = (Math.random() - 0.5) * 60;
            positions[i + 2] = (Math.random() - 0.5) * 40;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const material = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.1,
            transparent: true,
            opacity: 0.6
        });

        const particles = new THREE.Points(geometry, material);
        particles.userData = { isParticles: true };
        scene.add(particles);
        geometries.push(particles);
    }

    // Mouse move handler
    function onMouseMove(event) {
        mouseX = (event.clientX - windowHalfX) / windowHalfX;
        mouseY = (event.clientY - windowHalfY) / windowHalfY;
    }

    // Window resize handler
    function onWindowResize() {
        windowHalfX = window.innerWidth / 2;
        windowHalfY = window.innerHeight / 2;

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    // Animation loop
    function animate() {
        animationId = requestAnimationFrame(animate);

        const time = Date.now() * 0.001;

        // Update geometries
        geometries.forEach(mesh => {
            if (mesh.userData.isParticles) {
                // Rotate particles slowly
                mesh.rotation.y += 0.0005;
                return;
            }

            // Rotation
            if (mesh.userData.rotationSpeed) {
                mesh.rotation.x += mesh.userData.rotationSpeed.x;
                mesh.rotation.y += mesh.userData.rotationSpeed.y;
                mesh.rotation.z += mesh.userData.rotationSpeed.z;
            }

            // Floating motion
            if (mesh.userData.floatSpeed) {
                mesh.position.y = mesh.userData.originalY +
                    Math.sin(time * mesh.userData.floatSpeed + mesh.userData.floatOffset) * 2;
            }
        });

        // Camera responds to mouse
        camera.position.x += (mouseX * 5 - camera.position.x) * 0.02;
        camera.position.y += (-mouseY * 3 - camera.position.y) * 0.02;
        camera.lookAt(scene.position);

        renderer.render(scene, camera);
    }

    // Get scroll position for parallax effects
    function getScrollProgress() {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        return docHeight > 0 ? scrollTop / docHeight : 0;
    }

    // Add scroll listener for depth effect
    window.addEventListener('scroll', () => {
        const progress = getScrollProgress();

        geometries.forEach(mesh => {
            if (mesh.userData.isParticles) return;

            // Parallax depth effect
            const depthFactor = mesh.position.z + 20;
            mesh.position.z = depthFactor - progress * 10;
        });
    });

    // Initialize when DOM is ready
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
        if (renderer) {
            renderer.dispose();
        }
    });
})();

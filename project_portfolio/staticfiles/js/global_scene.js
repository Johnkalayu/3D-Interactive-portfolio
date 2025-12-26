// Global Three.js scene with orbiting tools
(function() {
    if (typeof THREE === 'undefined') {
        console.error('Three.js not loaded');
        return;
    }
    
    const container = document.getElementById('three-global');
    const tooltip = document.getElementById('tool-tooltip');
    const modal = document.getElementById('projects-modal');
    const modalClose = document.querySelector('.modal-close');
    
    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 3, 15);
    camera.lookAt(0, 0, 0);
    
    const renderer = new THREE.WebGLRenderer({ 
        alpha: true, 
        antialias: true,
        powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const pointLight1 = new THREE.PointLight(0x6366f1, 1, 100);
    pointLight1.position.set(10, 10, 10);
    scene.add(pointLight1);
    
    const pointLight2 = new THREE.PointLight(0x8b5cf6, 0.8, 100);
    pointLight2.position.set(-10, -5, -10);
    scene.add(pointLight2);
    
    // Globe with animated wireframe
    const globeGeometry = new THREE.IcosahedronGeometry(2, 1);
    const globeMaterial = new THREE.MeshBasicMaterial({
        color: 0x4f46e5,
        wireframe: true,
        transparent: true,
        opacity: 0.3
    });
    const globe = new THREE.Mesh(globeGeometry, globeMaterial);
    scene.add(globe);
    
    // Add inner glow sphere
    const glowGeometry = new THREE.SphereGeometry(1.8, 32, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0x6366f1,
        transparent: true,
        opacity: 0.1
    });
    const glowSphere = new THREE.Mesh(glowGeometry, glowMaterial);
    scene.add(glowSphere);
    
    // Infinity orbit path (∞ shape)
    const orbitRadius = 6;
    const orbitPoints = [];
    const segments = 200;
    for (let i = 0; i <= segments; i++) {
        const t = (i / segments) * Math.PI * 2;
        const scale = orbitRadius / (1 + Math.pow(Math.sin(t), 2));
        orbitPoints.push(new THREE.Vector3(
            scale * Math.cos(t),
            Math.sin(t) * Math.cos(t) * 2.5,
            scale * Math.sin(t) * Math.cos(t)
        ));
    }
    const orbitGeometry = new THREE.BufferGeometry().setFromPoints(orbitPoints);
    const orbitMaterial = new THREE.LineBasicMaterial({ 
        color: 0x8b5cf6, 
        transparent: true, 
        opacity: 0.5,
        linewidth: 2
    });
    const orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);
    scene.add(orbitLine);
    
    // Tool orbiters - 3D cubes with textures
    const orbiters = [];
    const textureLoader = new THREE.TextureLoader();
    const textureCache = {};
    
    // Function to get position on infinity curve
    function getInfinityPosition(t) {
        const scale = orbitRadius / (1 + Math.pow(Math.sin(t), 2));
        return {
            x: scale * Math.cos(t),
            y: Math.sin(t) * Math.cos(t) * 2.5,
            z: scale * Math.sin(t) * Math.cos(t)
        };
    }
    
    // Function to create 3D icon cube
    function create3DIcon(tool, idx) {
        const iconPath = `/static/image/tools/${tool.name.toLowerCase()}.png`;
        
        // Load texture
        if (!textureCache[iconPath]) {
            textureCache[iconPath] = textureLoader.load(
                iconPath,
                undefined,
                undefined,
                (err) => console.warn(`Failed to load icon: ${iconPath}`)
            );
        }
        const texture = textureCache[iconPath];
        
        // Create rotating cube with texture on all faces
        const geometry = new THREE.BoxGeometry(1.2, 1.2, 1.2);
        const materials = [
            new THREE.MeshStandardMaterial({ map: texture, transparent: true }), // Right
            new THREE.MeshStandardMaterial({ map: texture, transparent: true }), // Left
            new THREE.MeshStandardMaterial({ map: texture, transparent: true }), // Top
            new THREE.MeshStandardMaterial({ map: texture, transparent: true }), // Bottom
            new THREE.MeshStandardMaterial({ map: texture, transparent: true }), // Front
            new THREE.MeshStandardMaterial({ map: texture, transparent: true })  // Back
        ];
        
        const cube = new THREE.Mesh(geometry, materials);
        
        // Add edge glow
        const edgesGeometry = new THREE.EdgesGeometry(geometry);
        const edgesMaterial = new THREE.LineBasicMaterial({ 
            color: 0x6366f1, 
            transparent: true, 
            opacity: 0
        });
        const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
        cube.add(edges);
        
        return { cube, edges };
    }
    
    if (window.TOOLS_DATA && window.TOOLS_DATA.length > 0) {
        window.TOOLS_DATA.forEach((tool, idx) => {
            const t = (idx / window.TOOLS_DATA.length) * Math.PI * 2;
            const { cube, edges } = create3DIcon(tool, idx);
            
            orbiters.push({
                cube,
                edges,
                t,
                speed: 0.12 + Math.random() * 0.08,
                tool,
                scale: 1,
                targetScale: 1,
                rotationSpeed: {
                    x: (Math.random() - 0.5) * 0.5,
                    y: (Math.random() - 0.5) * 0.5,
                    z: (Math.random() - 0.5) * 0.5
                }
            });
            
            scene.add(cube);
        });
    }
    
    // Animation
    const clock = new THREE.Clock();
    let hoveredOrbiter = null;
    let lastClickTime = 0;
    const clickDebounce = 300;
    
    function animate() {
        requestAnimationFrame(animate);
        
        let delta = clock.getDelta();
        delta = Math.min(delta, 0.1);
        
        // Rotate globe and glow
        globe.rotation.y += delta * 0.15;
        globe.rotation.x += delta * 0.05;
        glowSphere.rotation.y -= delta * 0.1;
        
        // Pulse glow
        glowSphere.material.opacity = 0.1 + Math.sin(clock.getElapsedTime() * 0.5) * 0.05;
        
        // Update orbiters along infinity path
        orbiters.forEach(orbiter => {
            orbiter.t += delta * orbiter.speed;
            const pos = getInfinityPosition(orbiter.t);
            orbiter.cube.position.set(pos.x, pos.y, pos.z);
            
            // Smooth scale animation
            orbiter.scale += (orbiter.targetScale - orbiter.scale) * 0.1;
            orbiter.cube.scale.set(orbiter.scale, orbiter.scale, orbiter.scale);
            
            // Rotate cubes
            orbiter.cube.rotation.x += orbiter.rotationSpeed.x * delta;
            orbiter.cube.rotation.y += orbiter.rotationSpeed.y * delta;
            orbiter.cube.rotation.z += orbiter.rotationSpeed.z * delta;
            
            // Update edge glow based on hover
            if (orbiter.edges.material.opacity < 0.8 && hoveredOrbiter === orbiter) {
                orbiter.edges.material.opacity += delta * 3;
            } else if (orbiter.edges.material.opacity > 0 && hoveredOrbiter !== orbiter) {
                orbiter.edges.material.opacity -= delta * 2;
            }
        });
        
        // Animate orbit line
        orbitLine.rotation.y += delta * 0.05;
        
        renderer.render(scene, camera);
    }
    
    // Mouse interaction - works everywhere
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    
    function onMouseMove(e) {
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        
        raycaster.setFromCamera(mouse, camera);
        const cubes = orbiters.map(o => o.cube);
        const intersects = raycaster.intersectObjects(cubes);
        
        // Reset previous hover
        if (hoveredOrbiter && (intersects.length === 0 || intersects[0].object !== hoveredOrbiter.cube)) {
            hoveredOrbiter.targetScale = 1;
            hoveredOrbiter = null;
        }
        
        if (intersects.length > 0) {
            const intersected = intersects[0].object;
            const newHover = orbiters.find(o => o.cube === intersected);
            
            if (newHover && newHover !== hoveredOrbiter) {
                hoveredOrbiter = newHover;
                hoveredOrbiter.targetScale = 1.8;
            }
            
            if (hoveredOrbiter) {
                document.body.style.cursor = 'pointer';
                tooltip.classList.add('visible');
                tooltip.style.left = e.clientX + 15 + 'px';
                tooltip.style.top = e.clientY + 15 + 'px';
                
                document.getElementById('tooltip-name').textContent = hoveredOrbiter.tool.name;
                document.getElementById('tooltip-category').textContent = hoveredOrbiter.tool.category.toUpperCase();
                document.getElementById('tooltip-description').textContent = hoveredOrbiter.tool.description;
            }
        } else {
            document.body.style.cursor = 'default';
            tooltip.classList.remove('visible');
        }
    }
    
    function onClick(e) {
        const now = Date.now();
        if (now - lastClickTime < clickDebounce) return;
        lastClickTime = now;
        
        if (hoveredOrbiter) {
            showProjectsModal(hoveredOrbiter.tool.name);
        }
    }
    
    async function showProjectsModal(toolName) {
        try {
            const response = await fetch(`/api/projects/?tool=${encodeURIComponent(toolName)}`);
            const data = await response.json();
            
            document.getElementById('modal-tool-name').textContent = `Projects using ${data.tool}`;
            const projectsList = document.getElementById('modal-projects-list');
            
            if (data.projects.length === 0) {
                projectsList.innerHTML = '<p>No projects found for this tool yet.</p>';
            } else {
                projectsList.innerHTML = data.projects.map(p => `
                    <div class="modal-project">
                        <h3>${p.title}</h3>
                        <p>${p.description}</p>
                        ${p.link ? `<a href="${p.link}" target="_blank" class="project-link">View Project →</a>` : ''}
                        <div class="project-tags">
                            ${p.tools.map(t => `<span class="tag">${t}</span>`).join('')}
                        </div>
                    </div>
                `).join('');
            }
            
            modal.classList.add('active');
        } catch (err) {
            console.error('Error fetching projects:', err);
        }
    }
    
    modalClose.addEventListener('click', () => {
        modal.classList.remove('active');
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
    
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('click', onClick);
    
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
    
    animate();
})();
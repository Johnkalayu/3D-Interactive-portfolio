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
    camera.position.z = 15;
    
    const renderer = new THREE.WebGLRenderer({ 
        alpha: true, 
        antialias: true,
        powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);
    
    // Globe
    const globeGeometry = new THREE.SphereGeometry(2, 32, 32);
    const globeMaterial = new THREE.MeshBasicMaterial({
        color: 0x4f46e5,
        wireframe: true,
        transparent: true,
        opacity: 0.2
    });
    const globe = new THREE.Mesh(globeGeometry, globeMaterial);
    scene.add(globe);
    
    // Infinity orbit path (∞ shape)
    const orbitRadius = 5;
    const orbitPoints = [];
    const segments = 200;
    for (let i = 0; i <= segments; i++) {
        const t = (i / segments) * Math.PI * 2;
        // Infinity curve (lemniscate of Bernoulli)
        const scale = orbitRadius / (1 + Math.pow(Math.sin(t), 2));
        orbitPoints.push(new THREE.Vector3(
            scale * Math.cos(t),
            Math.sin(t) * Math.cos(t) * 2,
            scale * Math.sin(t) * Math.cos(t)
        ));
    }
    const orbitGeometry = new THREE.BufferGeometry().setFromPoints(orbitPoints);
    const orbitMaterial = new THREE.LineBasicMaterial({ 
        color: 0x8b5cf6, 
        transparent: true, 
        opacity: 0.4 
    });
    const orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);
    scene.add(orbitLine);
    
    // Tool orbiters
    const orbiters = [];
    const textureLoader = new THREE.TextureLoader();
    const textureCache = {};
    
    // Function to get position on infinity curve
    function getInfinityPosition(t) {
        const scale = orbitRadius / (1 + Math.pow(Math.sin(t), 2));
        return {
            x: scale * Math.cos(t),
            y: Math.sin(t) * Math.cos(t) * 2,
            z: scale * Math.sin(t) * Math.cos(t)
        };
    }
    
    if (window.TOOLS_DATA && window.TOOLS_DATA.length > 0) {
        window.TOOLS_DATA.forEach((tool, idx) => {
            const t = (idx / window.TOOLS_DATA.length) * Math.PI * 2;
            
            // Load texture with caching
            const iconPath = `/static/image/tools/${tool.name.toLowerCase()}.png`;
            if (!textureCache[iconPath]) {
                textureCache[iconPath] = textureLoader.load(
                    iconPath,
                    undefined,
                    undefined,
                    (err) => console.warn(`Failed to load icon: ${iconPath}`)
                );
            }
            const texture = textureCache[iconPath];
            
            const spriteMaterial = new THREE.SpriteMaterial({ 
                map: texture,
                transparent: true
            });
            const sprite = new THREE.Sprite(spriteMaterial);
            sprite.scale.set(1, 1, 1);
            
            orbiters.push({
                sprite,
                t,
                speed: 0.15 + Math.random() * 0.1,
                tool,
                scale: 1,
                targetScale: 1
            });
            
            scene.add(sprite);
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
        delta = Math.min(delta, 0.1); // Clamp delta
        
        // Rotate globe
        globe.rotation.y += delta * 0.1;
        globe.rotation.x += delta * 0.05;
        
        // Update orbiters along infinity path
        orbiters.forEach(orbiter => {
            orbiter.t += delta * orbiter.speed;
            const pos = getInfinityPosition(orbiter.t);
            orbiter.sprite.position.set(pos.x, pos.y, pos.z);
            
            // Smooth scale animation
            orbiter.scale += (orbiter.targetScale - orbiter.scale) * 0.1;
            orbiter.sprite.scale.set(orbiter.scale, orbiter.scale, 1);
            
            // Rotate sprites to face camera
            orbiter.sprite.material.rotation += delta * 0.5;
        });
        
        renderer.render(scene, camera);
    }
    
    // Mouse interaction - only in skills section
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    
    function isInSkillsSection(clientY) {
        const skillsSection = document.getElementById('skills');
        if (!skillsSection) return false;
        const rect = skillsSection.getBoundingClientRect();
        return clientY >= rect.top && clientY <= rect.bottom;
    }
    
    function onMouseMove(e) {
        if (!isInSkillsSection(e.clientY)) {
            tooltip.classList.remove('visible');
            if (hoveredOrbiter) {
                hoveredOrbiter.targetScale = 1;
                hoveredOrbiter = null;
            }
            return;
        }
        
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        
        raycaster.setFromCamera(mouse, camera);
        const sprites = orbiters.map(o => o.sprite);
        const intersects = raycaster.intersectObjects(sprites);
        
        // Reset previous hover
        if (hoveredOrbiter && (intersects.length === 0 || intersects[0].object !== hoveredOrbiter.sprite)) {
            hoveredOrbiter.targetScale = 1;
            hoveredOrbiter = null;
        }
        
        if (intersects.length > 0) {
            const intersected = intersects[0].object;
            const newHover = orbiters.find(o => o.sprite === intersected);
            
            if (newHover && newHover !== hoveredOrbiter) {
                hoveredOrbiter = newHover;
                hoveredOrbiter.targetScale = 1.5;
            }
            
            if (hoveredOrbiter) {
                document.body.style.cursor = 'pointer';
                tooltip.classList.add('visible');
                tooltip.style.left = e.clientX + 15 + 'px';
                tooltip.style.top = e.clientY + 15 + 'px';
                
                document.getElementById('tooltip-name').textContent = hoveredOrbiter.tool.name;
                document.getElementById('tooltip-category').textContent = hoveredOrbiter.tool.category;
                document.getElementById('tooltip-description').textContent = hoveredOrbiter.tool.description;
            }
        } else {
            document.body.style.cursor = 'default';
            tooltip.classList.remove('visible');
        }
    }
    
    function onClick(e) {
        if (!isInSkillsSection(e.clientY)) return;
        
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
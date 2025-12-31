/**
 * 3D Skills Orbit - React Atom Style Animation
 * Features:
 * - 3 elliptical orbits like React logo
 * - Tools orbit along the elliptical paths
 * - Central nucleus with glow
 * - Dynamic data from Django backend
 * - Smooth 60fps animation
 * - Hover/click interactivity
 */

(function() {
    'use strict';

    if (typeof THREE === 'undefined') {
        console.warn('Three.js not loaded');
        return;
    }

    const container = document.getElementById('devops-container');
    if (!container) return;

    // Scene variables
    let scene, camera, renderer;
    let atomGroup;
    let toolNodes = [];
    let nucleus, nucleusGlow;
    let orbitLines = [];
    let raycaster, mouse;
    let hoveredNode = null;
    let animationId;
    let isOnSkillsSection = false;
    let isTabActive = true;
    let toolsData = [];
    let textureCache = {};

    // Animation state
    let currentScale = 0.5;
    let targetScale = 0.5;
    let currentPosX = 12;
    let targetPosX = 12;
    let time = 0;

    // React atom parameters
    const ORBIT_RADIUS_X = 12;
    const ORBIT_RADIUS_Y = 5;
    const NODE_SIZE = 1.8;
    const NUCLEUS_RADIUS = 2.5;

    // 3 orbits at different rotations (like React logo)
    const ORBIT_ROTATIONS = [
        { x: 0, y: 0, z: 0 },                    // Horizontal
        { x: 0, y: 0, z: Math.PI / 3 },          // Tilted 60°
        { x: 0, y: 0, z: -Math.PI / 3 }          // Tilted -60°
    ];

    const tooltip = document.getElementById('tool-tooltip');
    const modal = document.getElementById('tool-modal');

    // Fetch tools from Django backend
    async function fetchTools() {
        try {
            const response = await fetch('/api/tools/');
            const data = await response.json();
            return data.tools || [];
        } catch (error) {
            console.warn('Failed to fetch tools from API, using fallback data');
            return getDefaultTools();
        }
    }

    function getDefaultTools() {
        return [
            { name: 'Docker', icon_url: '/static/image/tools/docker.png', description: 'Container platform for building, shipping, and running applications.', category: 'Containerization', color: '#2496ED', link: '' },
            { name: 'Kubernetes', icon_url: '/static/image/tools/kubernetes.png', description: 'Container orchestration platform.', category: 'Orchestration', color: '#326CE5', link: '' },
            { name: 'Jenkins', icon_url: '/static/image/tools/jenkins.png', description: 'CI/CD automation server.', category: 'CI/CD', color: '#D33833', link: '' },
            { name: 'Terraform', icon_url: '/static/image/tools/terraform.png', description: 'Infrastructure as Code tool.', category: 'IaC', color: '#7B42BC', link: '' },
            { name: 'AWS', icon_url: '/static/image/tools/aws.png', description: 'Amazon Web Services cloud platform.', category: 'Cloud', color: '#FF9900', link: '' },
            { name: 'Azure', icon_url: '/static/image/tools/azure.png', description: 'Microsoft Azure cloud platform.', category: 'Cloud', color: '#0078D4', link: '' },
            { name: 'Git', icon_url: '/static/image/tools/git.png', description: 'Distributed version control system.', category: 'Version Control', color: '#F05032', link: '' },
            { name: 'GitLab', icon_url: '/static/image/tools/gitlab.png', description: 'DevOps platform.', category: 'DevOps', color: '#FC6D26', link: '' },
            { name: 'Ansible', icon_url: '/static/image/tools/ansible.png', description: 'Configuration management tool.', category: 'Configuration', color: '#EE0000', link: '' },
            { name: 'Prometheus', icon_url: '/static/image/tools/prometheus.png', description: 'Monitoring and alerting toolkit.', category: 'Monitoring', color: '#E6522C', link: '' },
            { name: 'Grafana', icon_url: '/static/image/tools/grafana.png', description: 'Analytics and visualization platform.', category: 'Visualization', color: '#F46800', link: '' },
            { name: 'Linux', icon_url: '/static/image/tools/linux.png', description: 'Open-source operating system.', category: 'Operating System', color: '#FCC624', link: '' },
            { name: 'Python', icon_url: '/static/image/tools/python.png', description: 'Programming language.', category: 'Programming', color: '#3776AB', link: '' },
            { name: 'Nginx', icon_url: '/static/image/tools/nginx.png', description: 'Web server and reverse proxy.', category: 'Web Server', color: '#009639', link: '' },
            { name: 'Helm', icon_url: '/static/image/tools/helm.png', description: 'Kubernetes package manager.', category: 'Orchestration', color: '#0F1689', link: '' },
            { name: 'Bash', icon_url: '/static/image/tools/bash.png', description: 'Unix shell scripting.', category: 'Scripting', color: '#4EAA25', link: '' },
            { name: 'Datadog', icon_url: '/static/image/tools/datadog.png', description: 'Cloud monitoring platform.', category: 'Monitoring', color: '#632CA6', link: '' },
            { name: 'SonarQube', icon_url: '/static/image/tools/sonarqube.png', description: 'Code quality analysis.', category: 'Security', color: '#4E9BCD', link: '' },
            { name: 'Trivy', icon_url: '/static/image/tools/trivy.png', description: 'Container vulnerability scanner.', category: 'Security', color: '#1904DA', link: '' },
            { name: 'Maven', icon_url: '/static/image/tools/mavne.png', description: 'Build automation tool.', category: 'Build', color: '#C71A36', link: '' },
            { name: 'Snyk', icon_url: '/static/image/tools/snyk.png', description: 'Security platform.', category: 'Security', color: '#4C4A73', link: '' },
        ];
    }

    // Create rounded rectangle shape
    function createRoundedRectShape(width, height, radius) {
        const shape = new THREE.Shape();
        const x = -width / 2;
        const y = -height / 2;

        shape.moveTo(x + radius, y);
        shape.lineTo(x + width - radius, y);
        shape.quadraticCurveTo(x + width, y, x + width, y + radius);
        shape.lineTo(x + width, y + height - radius);
        shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        shape.lineTo(x + radius, y + height);
        shape.quadraticCurveTo(x, y + height, x, y + height - radius);
        shape.lineTo(x, y + radius);
        shape.quadraticCurveTo(x, y, x + radius, y);

        return shape;
    }

    async function init() {
        toolsData = await fetchTools();

        scene = new THREE.Scene();

        camera = new THREE.PerspectiveCamera(
            50,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        camera.position.set(0, 0, 35);
        camera.lookAt(0, 0, 0);

        renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true,
            powerPreference: 'high-performance'
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(renderer.domElement);

        raycaster = new THREE.Raycaster();
        mouse = new THREE.Vector2();

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
        scene.add(ambientLight);

        const pointLight1 = new THREE.PointLight(0xffffff, 0.5);
        pointLight1.position.set(15, 15, 15);
        scene.add(pointLight1);

        const pointLight2 = new THREE.PointLight(0x61dafb, 0.4);
        pointLight2.position.set(-15, -15, 10);
        scene.add(pointLight2);

        // Create atom group
        atomGroup = new THREE.Group();
        scene.add(atomGroup);

        // Create nucleus (center)
        createNucleus();

        // Create 3 elliptical orbit paths
        createOrbitPaths();

        // Distribute tools across 3 orbits
        await createToolNodes();

        // Initial position
        atomGroup.position.set(12, 0, 0);
        atomGroup.scale.setScalar(0.5);

        // Event listeners
        window.addEventListener('resize', onWindowResize);
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('click', onMouseClick);
        window.addEventListener('scroll', onScroll);

        document.addEventListener('visibilitychange', () => {
            isTabActive = !document.hidden;
        });

        onScroll();
        animate();
    }

    function createNucleus() {
        // Outer glow
        const glowGeometry = new THREE.CircleGeometry(NUCLEUS_RADIUS + 1.5, 64);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0x61dafb,
            transparent: true,
            opacity: 0.15,
            side: THREE.DoubleSide
        });
        nucleusGlow = new THREE.Mesh(glowGeometry, glowMaterial);
        nucleusGlow.position.z = -0.2;
        atomGroup.add(nucleusGlow);

        // Main nucleus
        const nucleusGeometry = new THREE.CircleGeometry(NUCLEUS_RADIUS, 64);
        const nucleusMaterial = new THREE.MeshBasicMaterial({
            color: 0x61dafb,
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide
        });
        nucleus = new THREE.Mesh(nucleusGeometry, nucleusMaterial);
        atomGroup.add(nucleus);

        // Inner ring
        const ringGeometry = new THREE.RingGeometry(NUCLEUS_RADIUS - 0.3, NUCLEUS_RADIUS, 64);
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: 0x88e4fc,
            transparent: true,
            opacity: 0.9,
            side: THREE.DoubleSide
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.position.z = 0.01;
        atomGroup.add(ring);
    }

    function createOrbitPaths() {
        ORBIT_ROTATIONS.forEach((rotation, index) => {
            const points = [];
            const segments = 128;

            for (let i = 0; i <= segments; i++) {
                const angle = (i / segments) * Math.PI * 2;
                points.push(new THREE.Vector3(
                    Math.cos(angle) * ORBIT_RADIUS_X,
                    Math.sin(angle) * ORBIT_RADIUS_Y,
                    0
                ));
            }

            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const material = new THREE.LineBasicMaterial({
                color: 0x61dafb,
                transparent: true,
                opacity: 0.3
            });
            const orbitLine = new THREE.Line(geometry, material);
            orbitLine.rotation.set(rotation.x, rotation.y, rotation.z);
            orbitLine.position.z = -0.1;
            orbitLines.push(orbitLine);
            atomGroup.add(orbitLine);
        });
    }

    async function createToolNodes() {
        const textureLoader = new THREE.TextureLoader();
        const totalTools = toolsData.length;
        const toolsPerOrbit = Math.ceil(totalTools / 3);

        const loadPromises = toolsData.map((tool, i) => {
            const orbitIndex = Math.floor(i / toolsPerOrbit) % 3;
            const positionInOrbit = i % toolsPerOrbit;
            const toolsInThisOrbit = Math.min(toolsPerOrbit, totalTools - orbitIndex * toolsPerOrbit);
            const angle = (positionInOrbit / toolsInThisOrbit) * Math.PI * 2;

            return createToolNode(tool, i, orbitIndex, angle, textureLoader);
        });

        await Promise.all(loadPromises);
    }

    function createToolNode(tool, index, orbitIndex, angle, textureLoader) {
        return new Promise((resolve) => {
            const nodeGroup = new THREE.Group();

            // Parse hex color
            const color = parseInt(tool.color.replace('#', ''), 16) || 0x61dafb;

            // Create rounded rectangle glow
            const glowShape = createRoundedRectShape(NODE_SIZE + 0.4, NODE_SIZE + 0.4, 0.3);
            const glowGeometry = new THREE.ShapeGeometry(glowShape);
            const glowMaterial = new THREE.MeshBasicMaterial({
                color: color,
                transparent: true,
                opacity: 0.3,
                side: THREE.DoubleSide
            });
            const glowRect = new THREE.Mesh(glowGeometry, glowMaterial);
            glowRect.position.z = -0.02;
            nodeGroup.add(glowRect);

            // Main rectangle background
            const rectShape = createRoundedRectShape(NODE_SIZE, NODE_SIZE, 0.25);
            const rectGeometry = new THREE.ShapeGeometry(rectShape);
            const rectMaterial = new THREE.MeshBasicMaterial({
                color: 0x0f172a,
                transparent: true,
                opacity: 0.95,
                side: THREE.DoubleSide
            });
            const rect = new THREE.Mesh(rectGeometry, rectMaterial);
            nodeGroup.add(rect);

            // Border
            const borderPoints = rectShape.getPoints(32);
            borderPoints.push(borderPoints[0]);
            const borderGeometry = new THREE.BufferGeometry().setFromPoints(
                borderPoints.map(p => new THREE.Vector3(p.x, p.y, 0.01))
            );
            const borderMaterial = new THREE.LineBasicMaterial({
                color: color,
                transparent: true,
                opacity: 0.85
            });
            const border = new THREE.Line(borderGeometry, borderMaterial);
            nodeGroup.add(border);

            // Store data
            nodeGroup.userData = {
                toolData: tool,
                index: index,
                orbitIndex: orbitIndex,
                baseAngle: angle,
                rect: rect,
                glowRect: glowRect,
                color: color
            };

            toolNodes.push(nodeGroup);
            atomGroup.add(nodeGroup);

            // Load icon
            const iconUrl = tool.icon_url;
            if (textureCache[iconUrl]) {
                addIconSprite(nodeGroup, textureCache[iconUrl]);
                resolve();
            } else {
                textureLoader.load(
                    iconUrl,
                    (texture) => {
                        textureCache[iconUrl] = texture;
                        addIconSprite(nodeGroup, texture);
                        resolve();
                    },
                    undefined,
                    () => {
                        console.warn('Failed to load icon for', tool.name);
                        resolve();
                    }
                );
            }
        });
    }

    function addIconSprite(nodeGroup, texture) {
        const spriteMaterial = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            depthTest: false,
            depthWrite: false
        });
        const sprite = new THREE.Sprite(spriteMaterial);
        const iconSize = NODE_SIZE * 0.7;
        sprite.scale.set(iconSize, iconSize, 1);
        sprite.position.set(0, 0, 0.1);
        nodeGroup.userData.sprite = sprite;
        nodeGroup.add(sprite);
    }

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function onScroll() {
        const skillsSection = document.getElementById('skills');
        if (!skillsSection) {
            setInactiveState();
            return;
        }

        const rect = skillsSection.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        if (rect.top < windowHeight * 0.7 && rect.bottom > windowHeight * 0.3) {
            if (!isOnSkillsSection) {
                isOnSkillsSection = true;
                targetScale = 1.2;
                targetPosX = 4;
                container.style.pointerEvents = 'auto';
            }
        } else {
            if (isOnSkillsSection) {
                setInactiveState();
            }
        }
    }

    function setInactiveState() {
        isOnSkillsSection = false;
        targetScale = 0.5;
        targetPosX = 12;
        container.style.pointerEvents = 'none';
        hideTooltip();
        if (hoveredNode) {
            resetNode(hoveredNode);
            hoveredNode = null;
        }
    }

    function onMouseMove(event) {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        if (!isOnSkillsSection) return;

        raycaster.setFromCamera(mouse, camera);

        const rects = toolNodes.map(n => n.userData.rect).filter(Boolean);
        const intersects = raycaster.intersectObjects(rects);

        if (intersects.length > 0) {
            const intersectedRect = intersects[0].object;
            const node = toolNodes.find(n => n.userData.rect === intersectedRect);

            if (node && hoveredNode !== node) {
                if (hoveredNode) resetNode(hoveredNode);
                hoveredNode = node;
                highlightNode(hoveredNode);
                showTooltip(hoveredNode.userData.toolData, event.clientX, event.clientY);
            } else if (node) {
                updateTooltipPosition(event.clientX, event.clientY);
            }

            document.body.style.cursor = 'pointer';
        } else {
            if (hoveredNode) {
                resetNode(hoveredNode);
                hoveredNode = null;
                hideTooltip();
            }
            document.body.style.cursor = 'default';
        }
    }

    function highlightNode(node) {
        node.scale.setScalar(1.3);
        if (node.userData.glowRect) {
            node.userData.glowRect.material.opacity = 0.6;
        }
        if (node.userData.sprite) {
            const iconSize = NODE_SIZE * 0.85;
            node.userData.sprite.scale.set(iconSize, iconSize, 1);
        }
    }

    function resetNode(node) {
        node.scale.setScalar(1);
        if (node.userData.glowRect) {
            node.userData.glowRect.material.opacity = 0.3;
        }
        if (node.userData.sprite) {
            const iconSize = NODE_SIZE * 0.7;
            node.userData.sprite.scale.set(iconSize, iconSize, 1);
        }
    }

    function onMouseClick() {
        if (!isOnSkillsSection) return;

        raycaster.setFromCamera(mouse, camera);
        const rects = toolNodes.map(n => n.userData.rect).filter(Boolean);
        const intersects = raycaster.intersectObjects(rects);

        if (intersects.length > 0) {
            const intersectedRect = intersects[0].object;
            const node = toolNodes.find(n => n.userData.rect === intersectedRect);
            if (node) {
                const tool = node.userData.toolData;
                console.log('Clicked tool:', tool.name);
                if (tool.link) {
                    window.open(tool.link, '_blank');
                } else {
                    showModal(tool);
                }
            }
        }
    }

    function showTooltip(tool, x, y) {
        if (!tooltip) return;
        tooltip.innerHTML = `
            <div class="tooltip-header">
                <span class="tooltip-name">${tool.name}</span>
                <span class="tooltip-category">${tool.category}</span>
            </div>
            <p class="tooltip-hint">Click for details</p>
        `;
        tooltip.classList.remove('hidden');
        updateTooltipPosition(x, y);
    }

    function updateTooltipPosition(x, y) {
        if (!tooltip) return;
        let posX = x + 18;
        let posY = y + 18;
        if (posX + 220 > window.innerWidth - 15) posX = x - 220 - 15;
        if (posY + 80 > window.innerHeight - 15) posY = y - 80 - 15;
        tooltip.style.left = posX + 'px';
        tooltip.style.top = posY + 'px';
    }

    function hideTooltip() {
        if (tooltip) tooltip.classList.add('hidden');
    }

    function showModal(tool) {
        if (!modal) return;
        modal.innerHTML = `
            <div class="modal-content">
                <button class="modal-close" onclick="this.parentElement.parentElement.classList.add('hidden')">&times;</button>
                <div class="modal-header">
                    <img src="${tool.icon_url}" alt="${tool.name}" class="modal-icon" onerror="this.style.display='none'">
                    <div>
                        <h2 class="modal-title">${tool.name}</h2>
                        <span class="modal-category">${tool.category}</span>
                    </div>
                </div>
                <p class="modal-description">${tool.description}</p>
            </div>
        `;
        modal.classList.remove('hidden');
        modal.onclick = (e) => {
            if (e.target === modal) modal.classList.add('hidden');
        };
    }

    function animate() {
        animationId = requestAnimationFrame(animate);

        if (!isTabActive) return;

        time += 0.016; // ~60fps
        const speed = isOnSkillsSection ? 0.4 : 0.25;

        // Smooth transitions
        currentScale += (targetScale - currentScale) * 0.04;
        currentPosX += (targetPosX - currentPosX) * 0.04;

        atomGroup.position.x = currentPosX;
        atomGroup.position.y = Math.sin(time * 0.5) * 0.3;
        atomGroup.scale.setScalar(currentScale);

        // Animate tools along their orbits
        toolNodes.forEach((node) => {
            const { orbitIndex, baseAngle } = node.userData;
            const rotation = ORBIT_ROTATIONS[orbitIndex];

            // Calculate position on ellipse
            const currentAngle = baseAngle + time * speed;
            const x = Math.cos(currentAngle) * ORBIT_RADIUS_X;
            const y = Math.sin(currentAngle) * ORBIT_RADIUS_Y;

            // Apply orbit rotation
            const cosZ = Math.cos(rotation.z);
            const sinZ = Math.sin(rotation.z);
            const rotatedX = x * cosZ - y * sinZ;
            const rotatedY = x * sinZ + y * cosZ;

            // Slight z variation for depth
            const z = Math.sin(currentAngle) * 1.5;

            node.position.set(rotatedX, rotatedY, z);
        });

        // Animate nucleus
        if (nucleus) {
            nucleus.rotation.z += 0.003;
        }
        if (nucleusGlow) {
            nucleusGlow.scale.setScalar(1 + Math.sin(time * 2) * 0.08);
        }

        // Subtle rotation of entire atom
        atomGroup.rotation.y = Math.sin(time * 0.2) * 0.1;

        renderer.render(scene, camera);
    }

    // Initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Cleanup
    window.addEventListener('beforeunload', () => {
        if (animationId) cancelAnimationFrame(animationId);
        if (renderer) {
            renderer.dispose();
            renderer.forceContextLoss();
        }
        Object.values(textureCache).forEach(texture => {
            if (texture && texture.dispose) texture.dispose();
        });
    });
})();

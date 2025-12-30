/**
 * Interactive 3D DevOps Tools - Infinity Shape
 * Matching devops.png style with all tools
 */

(function() {
    'use strict';

    if (typeof THREE === 'undefined') {
        console.warn('Three.js not loaded');
        return;
    }

    const container = document.getElementById('devops-container');
    if (!container) return;

    // All DevOps tools from static/image/tools/
    const toolsData = [
        { name: 'Docker', image: '/static/image/tools/docker.png', description: 'Container platform for building, shipping, and running applications in isolated environments.', category: 'Containerization', color: 0x2496ED },
        { name: 'Kubernetes', image: '/static/image/tools/kubernetes.png', description: 'Container orchestration platform for automating deployment, scaling, and management.', category: 'Orchestration', color: 0x326CE5 },
        { name: 'Jenkins', image: '/static/image/tools/jenkins.png', description: 'Open-source automation server for CI/CD pipelines.', category: 'CI/CD', color: 0xD33833 },
        { name: 'Terraform', image: '/static/image/tools/terraform.png', description: 'Infrastructure as Code tool for building cloud infrastructure.', category: 'IaC', color: 0x7B42BC },
        { name: 'AWS', image: '/static/image/tools/aws.png', description: 'Amazon Web Services - comprehensive cloud computing platform.', category: 'Cloud', color: 0xFF9900 },
        { name: 'Azure', image: '/static/image/tools/azure.png', description: 'Microsoft Azure cloud computing platform and services.', category: 'Cloud', color: 0x0078D4 },
        { name: 'Git', image: '/static/image/tools/git.png', description: 'Distributed version control system for source code.', category: 'Version Control', color: 0xF05032 },
        { name: 'GitLab', image: '/static/image/tools/gitlab.png', description: 'DevOps platform for the complete software development lifecycle.', category: 'DevOps', color: 0xFC6D26 },
        { name: 'Ansible', image: '/static/image/tools/ansible.png', description: 'Agentless automation tool for configuration management.', category: 'Configuration', color: 0xEE0000 },
        { name: 'Prometheus', image: '/static/image/tools/prometheus.png', description: 'Open-source monitoring and alerting toolkit.', category: 'Monitoring', color: 0xE6522C },
        { name: 'Grafana', image: '/static/image/tools/grafana.png', description: 'Analytics and interactive visualization platform.', category: 'Visualization', color: 0xF46800 },
        { name: 'Linux', image: '/static/image/tools/linux.png', description: 'Open-source OS kernel powering most servers.', category: 'Operating System', color: 0xFCC624 },
        { name: 'Python', image: '/static/image/tools/python.png', description: 'Programming language for automation and scripting.', category: 'Programming', color: 0x3776AB },
        { name: 'Nginx', image: '/static/image/tools/nginx.png', description: 'High-performance web server and reverse proxy.', category: 'Web Server', color: 0x009639 },
        { name: 'Helm', image: '/static/image/tools/helm.png', description: 'Package manager for Kubernetes applications.', category: 'Orchestration', color: 0x0F1689 },
        { name: 'Bash', image: '/static/image/tools/bash.png', description: 'Unix shell and command language for scripting.', category: 'Scripting', color: 0x4EAA25 },
        { name: 'Datadog', image: '/static/image/tools/datadog.png', description: 'Monitoring and analytics platform for cloud apps.', category: 'Monitoring', color: 0x632CA6 },
        { name: 'SonarQube', image: '/static/image/tools/sonarqube.png', description: 'Code quality and security analysis tool.', category: 'Security', color: 0x4E9BCD },
        { name: 'Trivy', image: '/static/image/tools/trivy.png', description: 'Container vulnerability scanner.', category: 'Security', color: 0x1904DA },
        { name: 'Maven', image: '/static/image/tools/mavne.png', description: 'Build automation tool for Java projects.', category: 'Build', color: 0xC71A36 },
        { name: 'Snyk', image: '/static/image/tools/snyk.png', description: 'Developer security platform for finding vulnerabilities.', category: 'Security', color: 0x4C4A73 },
        { name: 'JFrog', image: '/static/image/tools/jfrog.png', description: 'Universal artifact repository manager.', category: 'Artifacts', color: 0x40BE46 },
    ];

    // Scene variables
    let scene, camera, renderer;
    let infinityGroup;
    let toolMeshes = [];
    let centralHub, hubRing, hubGlow;
    let raycaster, mouse;
    let hoveredTool = null;
    let animationId;
    let isOnSkillsSection = false;

    // Animation targets - larger scale for sidebar visibility
    let currentScale = 0.7;
    let targetScale = 0.7;
    let currentPosX = 14;
    let targetPosX = 14;

    const tooltip = document.getElementById('tool-tooltip');
    const modal = document.getElementById('tool-modal');

    // Infinity shape parameters - much wider like devops.png
    const LOOP_RADIUS = 7;
    const CENTER_OFFSET = 12;

    function init() {
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
            antialias: true
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(renderer.domElement);

        raycaster = new THREE.Raycaster();
        mouse = new THREE.Vector2();

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        scene.add(ambientLight);

        const pointLight1 = new THREE.PointLight(0xffffff, 0.6);
        pointLight1.position.set(10, 10, 10);
        scene.add(pointLight1);

        const pointLight2 = new THREE.PointLight(0x8b5cf6, 0.4);
        pointLight2.position.set(-10, -10, 10);
        scene.add(pointLight2);

        // Create infinity group
        infinityGroup = new THREE.Group();
        scene.add(infinityGroup);

        // Create central hub (like devops.png purple circle)
        createCentralHub();

        // Create infinity path outline
        createInfinityPath();

        // Create tool spheres
        const textureLoader = new THREE.TextureLoader();
        toolsData.forEach((tool, index) => {
            createToolSphere(tool, index, textureLoader);
        });

        // Initial position - larger on sidebar
        infinityGroup.position.set(14, 0, 0);
        infinityGroup.scale.setScalar(0.7);

        // Event listeners
        window.addEventListener('resize', onWindowResize);
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('click', onMouseClick);
        window.addEventListener('scroll', onScroll);

        onScroll();
        animate();
    }

    function createCentralHub() {
        // Central purple circle - like devops.png
        const hubGeometry = new THREE.CircleGeometry(5.0, 64);
        const hubMaterial = new THREE.MeshBasicMaterial({
            color: 0x6366f1,
            transparent: true,
            opacity: 0.6,
            side: THREE.DoubleSide
        });
        centralHub = new THREE.Mesh(hubGeometry, hubMaterial);
        centralHub.position.z = -0.5;
        infinityGroup.add(centralHub);

        // White/light ring around hub
        const ringGeometry = new THREE.RingGeometry(4.8, 5.5, 64);
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: 0xc4b5fd,
            transparent: true,
            opacity: 0.7,
            side: THREE.DoubleSide
        });
        hubRing = new THREE.Mesh(ringGeometry, ringMaterial);
        hubRing.position.z = -0.4;
        infinityGroup.add(hubRing);

        // Outer glow
        const glowGeometry = new THREE.CircleGeometry(6.5, 64);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0x8b5cf6,
            transparent: true,
            opacity: 0.2,
            side: THREE.DoubleSide
        });
        hubGlow = new THREE.Mesh(glowGeometry, glowMaterial);
        hubGlow.position.z = -0.6;
        infinityGroup.add(hubGlow);
    }

    function createInfinityPath() {
        // Create the infinity path line (subtle, like devops.png)
        const points = [];
        const segments = 200;

        for (let i = 0; i <= segments; i++) {
            const t = (i / segments) * Math.PI * 2;
            const pos = getInfinityPosition(t);
            points.push(new THREE.Vector3(pos.x, pos.y, -1));
        }

        const pathGeometry = new THREE.BufferGeometry().setFromPoints(points);
        const pathMaterial = new THREE.LineBasicMaterial({
            color: 0x94a3b8,
            transparent: true,
            opacity: 0.3
        });
        const infinityLine = new THREE.Line(pathGeometry, pathMaterial);
        infinityGroup.add(infinityLine);
    }

    // Figure-8 infinity shape matching devops.png
    function getInfinityPosition(t) {
        // Two circles forming figure-8
        const x = CENTER_OFFSET * Math.sin(t);
        const y = LOOP_RADIUS * Math.sin(t) * Math.cos(t);
        // Depth variation for 3D effect
        const z = Math.sin(t * 2) * 1.5;

        return { x, y, z };
    }

    function createToolSphere(tool, index, textureLoader) {
        const totalTools = toolsData.length;
        const sphereRadius = 1.2;

        // Create a group to hold sphere and icon together
        const toolGroup = new THREE.Group();

        // Create sphere geometry (like devops.png balls)
        const geometry = new THREE.SphereGeometry(sphereRadius, 32, 32);

        // Create material with tool color
        const material = new THREE.MeshPhongMaterial({
            color: tool.color,
            shininess: 120,
            specular: 0x666666,
            transparent: true,
            opacity: 0.85
        });

        const sphere = new THREE.Mesh(geometry, material);
        toolGroup.add(sphere);

        // Position group on infinity path
        const t = (index / totalTools) * Math.PI * 2;
        const pos = getInfinityPosition(t);
        toolGroup.position.set(pos.x, pos.y, pos.z);

        toolGroup.userData = {
            toolData: tool,
            index: index,
            t: t,
            baseRadius: sphereRadius,
            sphere: sphere
        };

        toolMeshes.push(toolGroup);
        infinityGroup.add(toolGroup);

        // Load texture and apply as sprite synced with sphere center
        textureLoader.load(
            tool.image,
            (texture) => {
                // Create a sprite for the icon - synced at center of sphere
                const spriteMaterial = new THREE.SpriteMaterial({
                    map: texture,
                    transparent: true,
                    depthTest: false,
                    depthWrite: false
                });
                const sprite = new THREE.Sprite(spriteMaterial);
                sprite.scale.set(1.6, 1.6, 1);
                // Icon synced at center of sphere (not floating on top)
                sprite.position.set(0, 0, 0.1);
                toolGroup.userData.sprite = sprite;
                toolGroup.add(sprite);
            },
            undefined,
            (error) => {
                console.warn('Failed to load texture for', tool.name);
            }
        );
    }

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function onScroll() {
        const skillsSection = document.getElementById('skills');
        if (!skillsSection) {
            isOnSkillsSection = false;
            targetScale = 0.7;
            targetPosX = 14;
            container.style.pointerEvents = 'none';
            return;
        }

        const rect = skillsSection.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        if (rect.top < windowHeight * 0.7 && rect.bottom > windowHeight * 0.3) {
            if (!isOnSkillsSection) {
                isOnSkillsSection = true;
                targetScale = 1.5;
                targetPosX = 6;
                container.style.pointerEvents = 'auto';
            }
        } else {
            if (isOnSkillsSection) {
                isOnSkillsSection = false;
                targetScale = 0.7;
                targetPosX = 14;
                container.style.pointerEvents = 'none';
                hideTooltip();
                if (hoveredTool) {
                    resetTool(hoveredTool);
                    hoveredTool = null;
                }
            }
        }
    }

    function onMouseMove(event) {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        if (!isOnSkillsSection) return;

        raycaster.setFromCamera(mouse, camera);

        // Get all spheres from tool groups for intersection
        const spheres = toolMeshes.map(g => g.userData.sphere).filter(Boolean);
        const intersects = raycaster.intersectObjects(spheres);

        if (intersects.length > 0) {
            // Find the parent group of the intersected sphere
            const intersectedSphere = intersects[0].object;
            const toolGroup = toolMeshes.find(g => g.userData.sphere === intersectedSphere);

            if (toolGroup && hoveredTool !== toolGroup) {
                if (hoveredTool) resetTool(hoveredTool);

                hoveredTool = toolGroup;
                hoveredTool.scale.setScalar(1.3);
                if (hoveredTool.userData.sprite) {
                    hoveredTool.userData.sprite.scale.set(2.0, 2.0, 1);
                }

                showTooltip(hoveredTool.userData.toolData, event.clientX, event.clientY);
            } else if (toolGroup) {
                updateTooltipPosition(event.clientX, event.clientY);
            }

            document.body.style.cursor = 'pointer';
        } else {
            if (hoveredTool) {
                resetTool(hoveredTool);
                hoveredTool = null;
                hideTooltip();
            }
            document.body.style.cursor = 'default';
        }
    }

    function onMouseClick() {
        if (!isOnSkillsSection) return;

        raycaster.setFromCamera(mouse, camera);
        const spheres = toolMeshes.map(g => g.userData.sphere).filter(Boolean);
        const intersects = raycaster.intersectObjects(spheres);

        if (intersects.length > 0) {
            const intersectedSphere = intersects[0].object;
            const toolGroup = toolMeshes.find(g => g.userData.sphere === intersectedSphere);
            if (toolGroup) {
                showToolModal(toolGroup.userData.toolData);
            }
        }
    }

    function resetTool(toolGroup) {
        if (toolGroup) {
            toolGroup.scale.setScalar(1);
            if (toolGroup.userData.sprite) {
                toolGroup.userData.sprite.scale.set(1.6, 1.6, 1);
            }
        }
    }

    function showTooltip(toolData, x, y) {
        if (!tooltip) return;
        tooltip.innerHTML = `
            <div class="tooltip-header">
                <span class="tooltip-name">${toolData.name}</span>
                <span class="tooltip-category">${toolData.category}</span>
            </div>
            <p class="tooltip-hint">Click for details</p>
        `;
        tooltip.classList.remove('hidden');
        updateTooltipPosition(x, y);
    }

    function updateTooltipPosition(x, y) {
        if (!tooltip) return;
        let posX = x + 20;
        let posY = y + 20;
        if (posX + 220 > window.innerWidth) posX = x - 220;
        if (posY + 100 > window.innerHeight) posY = y - 100;
        tooltip.style.left = posX + 'px';
        tooltip.style.top = posY + 'px';
    }

    function hideTooltip() {
        if (tooltip) tooltip.classList.add('hidden');
    }

    function showToolModal(toolData) {
        if (!modal) return;
        modal.innerHTML = `
            <div class="modal-content">
                <button class="modal-close" onclick="this.parentElement.parentElement.classList.add('hidden')">&times;</button>
                <div class="modal-header">
                    <img src="${toolData.image}" alt="${toolData.name}" class="modal-icon" onerror="this.style.display='none'">
                    <div>
                        <h2 class="modal-title">${toolData.name}</h2>
                        <span class="modal-category">${toolData.category}</span>
                    </div>
                </div>
                <p class="modal-description">${toolData.description}</p>
            </div>
        `;
        modal.classList.remove('hidden');
        modal.onclick = (e) => { if (e.target === modal) modal.classList.add('hidden'); };
    }

    function animate() {
        animationId = requestAnimationFrame(animate);

        const time = Date.now() * 0.001;
        const speed = isOnSkillsSection ? 0.06 : 0.04;

        // Smooth transitions
        currentScale += (targetScale - currentScale) * 0.04;
        currentPosX += (targetPosX - currentPosX) * 0.04;

        infinityGroup.position.x = currentPosX;
        infinityGroup.position.y = Math.sin(time * 0.3) * 0.3;
        infinityGroup.scale.setScalar(currentScale);

        // Animate tools along infinity path
        toolMeshes.forEach((toolGroup) => {
            if (!toolGroup.userData) return;

            toolGroup.userData.t += speed * 0.01;
            const pos = getInfinityPosition(toolGroup.userData.t);
            toolGroup.position.x = pos.x;
            toolGroup.position.y = pos.y;
            toolGroup.position.z = pos.z;

            // Rotate the inner sphere slightly
            if (toolGroup.userData.sphere) {
                toolGroup.userData.sphere.rotation.y += 0.01;
            }
        });

        // Rotate hub elements
        if (centralHub) centralHub.rotation.z += 0.002;
        if (hubRing) hubRing.rotation.z -= 0.001;

        renderer.render(scene, camera);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.addEventListener('beforeunload', () => {
        if (animationId) cancelAnimationFrame(animationId);
        if (renderer) renderer.dispose();
    });
})();

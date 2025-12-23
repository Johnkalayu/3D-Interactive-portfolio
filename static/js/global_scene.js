class GlobalScene {
    constructor() {
        this.canvas = document.getElementById('global-canvas');
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            alpha: true,
            antialias: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 5;
        
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        
        this.toolObjects = [];
        this.hoveredTool = null;
        this.containers = [];
        
        this.setupLights();
        this.setupDevOpsCenter();
        this.loadTools();
        
        window.addEventListener('resize', () => this.onResize());
        window.addEventListener('mousemove', (e) => this.onMouseMove(e));
        window.addEventListener('click', (e) => this.onClick(e));
        
        this.animate();
    }
    
    setupLights() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);
        
        const pointLight = new THREE.PointLight(0x8b5cf6, 1, 100);
        pointLight.position.set(0, 0, 10);
        this.scene.add(pointLight);
    }
    
    setupDevOpsCenter() {
        const textureLoader = new THREE.TextureLoader();
        
        textureLoader.load('/static/img/devops/devops_infinity.png', (texture) => {
            const geometry = new THREE.PlaneGeometry(2, 2);
            const material = new THREE.MeshBasicMaterial({
                map: texture,
                transparent: true,
                opacity: 0.9
            });
            this.centerImage = new THREE.Mesh(geometry, material);
            this.scene.add(this.centerImage);
        }, undefined, () => {
            const geometry = new THREE.PlaneGeometry(2, 2);
            const material = new THREE.MeshBasicMaterial({
                color: 0x8b5cf6,
                transparent: true,
                opacity: 0.3
            });
            this.centerImage = new THREE.Mesh(geometry, material);
            this.scene.add(this.centerImage);
        });
        
        const glowGeometry = new THREE.PlaneGeometry(3, 3);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0x8b5cf6,
            transparent: true,
            opacity: 0,
            side: THREE.DoubleSide
        });
        this.glowHalo = new THREE.Mesh(glowGeometry, glowMaterial);
        this.glowHalo.position.z = -0.1;
        this.scene.add(this.glowHalo);
    }
    
    loadTools() {
        const skillsContainer = document.getElementById('skills-3d');
        if (!skillsContainer) return;
        
        const toolsData = JSON.parse(skillsContainer.dataset.tools || '[]');
        const radius = 3.5;
        const textureLoader = new THREE.TextureLoader();
        
        toolsData.forEach((tool, i) => {
            const angle = (i / toolsData.length) * Math.PI * 2;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            textureLoader.load(tool.icon, (texture) => {
                const geometry = new THREE.PlaneGeometry(0.5, 0.5);
                const material = new THREE.MeshBasicMaterial({
                    map: texture,
                    transparent: true
                });
                const mesh = new THREE.Mesh(geometry, material);
                mesh.position.set(x, y, 0);
                mesh.userData = {
                    angle: angle,
                    radius: radius,
                    baseScale: 1,
                    tool: tool
                };
                this.scene.add(mesh);
                this.toolObjects.push(mesh);
            }, undefined, () => {
                const geometry = new THREE.PlaneGeometry(0.5, 0.5);
                const material = new THREE.MeshBasicMaterial({
                    color: 0x6d28d9,
                    transparent: true,
                    opacity: 0.8
                });
                const mesh = new THREE.Mesh(geometry, material);
                mesh.position.set(x, y, 0);
                mesh.userData = {
                    angle: angle,
                    radius: radius,
                    baseScale: 1,
                    tool: tool
                };
                this.scene.add(mesh);
                this.toolObjects.push(mesh);
            });
        });
    }
    
    registerContainer(id, interactive = false, speed = 1) {
        const element = document.getElementById(id);
        if (element) {
            this.containers.push({
                element: element,
                interactive: interactive,
                speed: speed
            });
        }
    }
    
    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    getContainerCoords(container, x, y) {
        const rect = container.element.getBoundingClientRect();
        return {
            x: ((x - rect.left) / rect.width) * 2 - 1,
            y: -((y - rect.top) / rect.height) * 2 + 1
        };
    }
    
    onMouseMove(e) {
        const skillsContainer = this.containers.find(c => c.element.id === 'skills-3d');
        if (!skillsContainer) return;
        
        const rect = skillsContainer.element.getBoundingClientRect();
        if (e.clientX >= rect.left && e.clientX <= rect.right &&
            e.clientY >= rect.top && e.clientY <= rect.bottom) {
            
            const coords = this.getContainerCoords(skillsContainer, e.clientX, e.clientY);
            this.mouse.x = coords.x;
            this.mouse.y = coords.y;
            
            this.raycaster.setFromCamera(this.mouse, this.camera);
            const intersects = this.raycaster.intersectObjects(this.toolObjects);
            
            if (intersects.length > 0) {
                const tool = intersects[0].object;
                if (this.hoveredTool !== tool) {
                    if (this.hoveredTool) {
                        this.hoveredTool.scale.set(1, 1, 1);
                    }
                    this.hoveredTool = tool;
                    this.hoveredTool.scale.set(1.5, 1.5, 1);
                    
                    this.updateToolInfo(tool.userData.tool);
                    
                    this.glowHalo.position.x = tool.position.x;
                    this.glowHalo.position.y = tool.position.y;
                    this.glowHalo.material.opacity = 0.3;
                }
            } else {
                if (this.hoveredTool) {
                    this.hoveredTool.scale.set(1, 1, 1);
                    this.hoveredTool = null;
                    this.glowHalo.material.opacity = 0;
                    this.resetToolInfo();
                }
            }
        } else {
            if (this.hoveredTool) {
                this.hoveredTool.scale.set(1, 1, 1);
                this.hoveredTool = null;
                this.glowHalo.material.opacity = 0;
            }
        }
    }
    
    onClick(e) {
        if (this.hoveredTool) {
            this.showProjectModal(this.hoveredTool.userData.tool);
        }
    }
    
    updateToolInfo(tool) {
        const detailsDiv = document.getElementById('tool-details');
        if (!detailsDiv) return;
        
        const categories = {
            'Cloud': ['AWS', 'Azure', 'GCP'],
            'CI/CD': ['Jenkins', 'GitLab', 'GitHub Actions'],
            'Monitoring': ['Prometheus', 'Grafana', 'Datadog'],
            'Security': ['Snyk', 'Trivy', 'SonarQube']
        };
        
        let tags = [];
        for (const [cat, tools] of Object.entries(categories)) {
            if (tools.includes(tool.name)) {
                tags.push(cat);
            }
        }
        
        detailsDiv.innerHTML = `
            <h3>${tool.name}</h3>
            <div class="tool-category">${tool.category}</div>
            <p>${tool.description}</p>
            <div class="tool-tags">
                ${tags.map(tag => `<span class="tool-tag">${tag}</span>`).join('')}
            </div>
            <p style="margin-top: 1rem; color: #8b5cf6; font-size: 0.9rem;">Click to see related projects</p>
        `;
    }
    
    resetToolInfo() {
        const detailsDiv = document.getElementById('tool-details');
        if (!detailsDiv) return;
        
        detailsDiv.innerHTML = `
            <h3>Hover over a tool to learn more</h3>
            <p>Explore my DevOps toolkit and see how I use each technology to build robust cloud infrastructure.</p>
        `;
    }
    
    async showProjectModal(tool) {
        const modal = document.getElementById('project-modal');
        const modalName = document.getElementById('modal-tool-name');
        const modalCategory = document.getElementById('modal-tool-category');
        const modalDescription = document.getElementById('modal-tool-description');
        const modalProjects = document.getElementById('modal-projects');
        
        modalName.textContent = tool.name;
        modalCategory.textContent = tool.category;
        modalDescription.textContent = tool.description;
        modalProjects.innerHTML = '<p>Loading projects...</p>';
        
        modal.style.display = 'block';
        
        try {
            const response = await fetch(`/api/projects/?tool=${encodeURIComponent(tool.name)}`);
            const data = await response.json();
            
            if (data.projects && data.projects.length > 0) {
                modalProjects.innerHTML = data.projects.map(p => `
                    <div class="modal-project">
                        <h4>${p.title}</h4>
                        <p>${p.description}</p>
                        ${p.link ? `<a href="${p.link}" target="_blank" style="color: #8b5cf6;">View Project →</a>` : ''}
                    </div>
                `).join('');
            } else {
                modalProjects.innerHTML = '<p>No projects found for this tool yet.</p>';
            }
        } catch (err) {
            modalProjects.innerHTML = '<p>Error loading projects.</p>';
        }
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        const time = Date.now() * 0.0005;
        
        this.toolObjects.forEach((tool, i) => {
            const angle = tool.userData.angle + time * 0.3;
            tool.position.x = Math.cos(angle) * tool.userData.radius;
            tool.position.y = Math.sin(angle) * tool.userData.radius;
        });
        
        if (this.centerImage) {
            this.centerImage.rotation.z = time * 0.1;
        }
        
        this.containers.forEach(container => {
            const rect = container.element.getBoundingClientRect();
            const width = rect.width;
            const height = rect.height;
            const left = rect.left;
            const bottom = this.renderer.domElement.clientHeight - rect.bottom;
            
            this.renderer.setViewport(left, bottom, width, height);
            this.renderer.setScissor(left, bottom, width, height);
            this.renderer.setScissorTest(true);
            
            if (container.element.id === 'contact-3d') {
                this.camera.position.z = 7;
            } else {
                this.camera.position.z = 5;
            }
            
            this.renderer.render(this.scene, this.camera);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const globalScene = new GlobalScene();
    
    globalScene.registerContainer('skills-3d', true, 1);
    globalScene.registerContainer('projects-3d', false, 0.5);
    globalScene.registerContainer('contact-3d', false, 0.3);
    
    const modal = document.getElementById('project-modal');
    const closeBtn = document.querySelector('.modal-close');
    
    closeBtn.onclick = () => modal.style.display = 'none';
    window.onclick = (e) => {
        if (e.target === modal) modal.style.display = 'none';
    };
});

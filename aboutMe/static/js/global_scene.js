(function () {
  const root = document.getElementById("three-global");
  const skillsWin = document.getElementById("skills-3d");
  const projectsWin = document.getElementById("projects-3d");
  const contactWin = document.getElementById("contact-3d");

  if (!root || !window.THREE) return;

  // Sidebar DOM
  const sidebar = document.getElementById("tool-sidebar");
  const toolNameEl = document.getElementById("tool-name");
  const toolCategoryEl = document.getElementById("tool-category");
  const toolDescEl = document.getElementById("tool-desc");
  const toolTagsEl = document.getElementById("tool-tags");

  // Modal DOM
  const modal = document.getElementById("projects-modal");
  const modalTitle = document.getElementById("modal-title");
  const modalBody = document.getElementById("modal-body");
  const modalClose = document.getElementById("modal-close");

  modalClose?.addEventListener("click", () => modal.classList.add("hidden"));
  modal?.addEventListener("click", (e) => { if (e.target === modal) modal.classList.add("hidden"); });

  function openModal(title, projects) {
    modalTitle.textContent = title;
    modalBody.innerHTML = "";

    if (!projects.length) {
      modalBody.innerHTML = `<div class="pcard">No projects found for this tool yet.</div>`;
    } else {
      for (const p of projects) {
        const link = p.link
          ? `<a href="${p.link}" target="_blank" rel="noopener">${p.title}</a>`
          : `<div><b>${p.title}</b></div>`;
        const tools = (p.tools || []).map(t => t.name).join(", ");

        modalBody.insertAdjacentHTML("beforeend", `
          <div class="pcard">
            ${link}
            <div class="pmeta">${p.description || ""}</div>
            <div class="pmeta">${tools}</div>
          </div>
        `);
      }
    }
    modal.classList.remove("hidden");
  }

  // Tool info
  const TOOL_INFO = {
    ansible:    { category: "Automation", desc: "Configuration management & deployment automation.", tags: ["Playbooks", "IaC"] },
    aws:        { category: "Cloud", desc: "AWS infrastructure & services.", tags: ["EC2", "VPC", "IAM"] },
    azure:      { category: "Cloud", desc: "Azure cloud services.", tags: ["VM", "AKS"] },
    bash:       { category: "Scripting", desc: "Shell scripting for automation.", tags: ["CLI", "Linux"] },
    datadog:    { category: "Observability", desc: "Metrics, logs, traces, alerting.", tags: ["APM", "Dashboards"] },
    git:        { category: "Version Control", desc: "Source control workflows.", tags: ["Commits", "Merge"] },
    gitlab:     { category: "CI/CD", desc: "Pipelines & runners.", tags: ["CI", "Runners"] },
    grafana:    { category: "Monitoring", desc: "Dashboards and alerts.", tags: ["Panels", "Alerts"] },
    helm:       { category: "Kubernetes", desc: "Deploy apps with charts.", tags: ["Charts", "Releases"] },
    jenkins:    { category: "CI/CD", desc: "Pipeline automation.", tags: ["Pipelines", "Agents"] },
    jfrog:      { category: "Artifacts", desc: "Artifact repositories.", tags: ["Artifactory"] },
    kubernetes: { category: "Orchestration", desc: "Run containers at scale.", tags: ["Pods", "Services"] },
    linux:      { category: "OS", desc: "Ops: networking, services, permissions.", tags: ["Systemd", "Networking"] },
    maven:      { category: "Build Tool", desc: "Java build & deps.", tags: ["POM", "Build"] },
    nginx:      { category: "Web Server", desc: "Reverse proxy & TLS.", tags: ["Proxy", "TLS"] },
    prometheus: { category: "Monitoring", desc: "Metrics and alert rules.", tags: ["Scrape", "Alerts"] },
    python:     { category: "Programming", desc: "Automation scripts, APIs, Django.", tags: ["Django", "Automation"] },
    snyk:       { category: "Security", desc: "Dependency vulnerability scanning.", tags: ["SCA", "Fix PRs"] },
    sonarqube:  { category: "Code Quality", desc: "Static analysis & quality gates.", tags: ["Quality Gate"] },
    terraform:  { category: "IaC", desc: "Provision infra declaratively.", tags: ["Modules", "State"] },
    trivy:      { category: "Security", desc: "Scan images and IaC.", tags: ["Containers", "IaC"] },
  };

  function showSidebar(key) {
    const info = TOOL_INFO[key];
    if (!info || !sidebar) return;

    sidebar.classList.add("show");
    toolNameEl.textContent = key.toUpperCase();
    toolCategoryEl.textContent = info.category || "";
    toolDescEl.textContent = info.desc || "";
    toolTagsEl.innerHTML = (info.tags || []).map(t => `<span class="tool-tag">${t}</span>`).join("");
  }
  function hideSidebar() {
    sidebar?.classList.remove("show");
  }

  // THREE setup
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 200);
  camera.position.set(0, 0, 14);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.max(1, window.devicePixelRatio || 1));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setScissorTest(true);
  root.appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0xffffff, 1.0));
  const keyLight = new THREE.PointLight(0xffffff, 1.2);
  keyLight.position.set(12, 14, 12);
  scene.add(keyLight);

  const loader = new THREE.TextureLoader();

  // Center image (DevOps infinity)
  const posterTex = loader.load("/static/img/devops/devops_infinity.png");
  posterTex.colorSpace = THREE.SRGBColorSpace;

  const poster = new THREE.Mesh(
    new THREE.PlaneGeometry(12, 6.6),
    new THREE.MeshBasicMaterial({ map: posterTex, transparent: true })
  );
  poster.position.set(0, 0, -1);
  scene.add(poster);

  // Tool ring (sprites)
  const toolKeys = Object.keys(TOOL_INFO);
  const ring = new THREE.Group();
  scene.add(ring);

  const clickable = [];
  const radius = 7.0;

  toolKeys.forEach((key, i) => {
    const tex = loader.load(`/static/img/tools/${key}.png`);
    tex.colorSpace = THREE.SRGBColorSpace;

    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true }));
    const angle = (i / toolKeys.length) * Math.PI * 2;

    sprite.position.set(Math.cos(angle) * radius, Math.sin(angle) * 3.2, 0.6);
    sprite.scale.set(1.05, 1.05, 1);
    sprite.userData.toolKey = key;

    ring.add(sprite);
    clickable.push(sprite);
  });

  // Glow sprite
  const glowTex = loader.load("/static/img/devops/glow.png");
  glowTex.colorSpace = THREE.SRGBColorSpace;

  const glow = new THREE.Sprite(new THREE.SpriteMaterial({
    map: glowTex,
    transparent: true,
    opacity: 0
  }));
  glow.scale.set(1.9, 1.9, 1);
  scene.add(glow);

  // Hover / click only inside skills window
  const mouse = new THREE.Vector2(999, 999);
  const raycaster = new THREE.Raycaster();
  let hovered = null;
  let mouseInsideSkills = false;

  function isInside(el, x, y) {
    if (!el) return false;
    const r = el.getBoundingClientRect();
    return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
  }

  window.addEventListener("mousemove", (e) => {
    mouseInsideSkills = isInside(skillsWin, e.clientX, e.clientY);
    if (!mouseInsideSkills) return;

    const r = skillsWin.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    mouse.x = (x / r.width) * 2 - 1;
    mouse.y = -(y / r.height) * 2 + 1;
  });

  window.addEventListener("click", async () => {
    if (!mouseInsideSkills || !hovered) return;

    const key = hovered.userData.toolKey;
    const resp = await fetch(`/api/projects/?tool=${encodeURIComponent(key)}`);
    const data = await resp.json();
    openModal(`${key.toUpperCase()} Projects`, data.projects || []);
  });

  // Render into an element rectangle (scissor)
  function renderInto(el, mode) {
    if (!el) return;

    const rect = el.getBoundingClientRect();
    if (rect.width < 10 || rect.height < 10) return;
    if (rect.bottom < 0 || rect.top > window.innerHeight) return;

    const left = Math.floor(rect.left);
    const bottom = Math.floor(window.innerHeight - rect.bottom);
    const width = Math.floor(rect.width);
    const height = Math.floor(rect.height);

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setViewport(left, bottom, width, height);
    renderer.setScissor(left, bottom, width, height);

    // Mode tweaks
    if (mode === "skills") {
      poster.rotation.set(0, 0, 0);
      poster.position.set(0, 0, -1);
      ring.visible = true;
      ring.scale.set(1, 1, 1);
      poster.material.opacity = 1.0;
    }

    if (mode === "projects") {
      // push image back + soften
      ring.visible = true;
      ring.scale.set(0.92, 0.92, 1);
      poster.material.opacity = 0.85;
      poster.position.set(0, -0.2, -1.1);
    }

    if (mode === "contact") {
      // contact: keep it clean, slightly tilted (like reference)
      ring.visible = true;
      ring.scale.set(0.95, 0.95, 1);
      poster.material.opacity = 0.95;
      poster.rotation.set(0, 0, -0.08);
      poster.position.set(0, 0, -1);
    }

    renderer.render(scene, camera);
  }

  // Resize
  window.addEventListener("resize", () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  const clock = new THREE.Clock();

  function animate() {
    const t = clock.getElapsedTime();

    // clear whole canvas each frame (transparent)
    renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.setScissor(0, 0, window.innerWidth, window.innerHeight);
    renderer.clear(true, true, true);

    // motion like the reference
    ring.rotation.z = t * 0.12;

    // hover logic only in skills window
    if (mouseInsideSkills) {
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(clickable, true);

      if (hits.length) {
        const obj = hits[0].object;
        if (hovered && hovered !== obj) hovered.scale.set(1.05, 1.05, 1);

        hovered = obj;
        hovered.scale.set(1.22, 1.22, 1);

        const key = obj.userData.toolKey;
        showSidebar(key);

        glow.position.copy(obj.position);
        glow.position.z = obj.position.z + 0.2;
        glow.material.opacity = 0.65 + Math.sin(t * 6.0) * 0.18;

        document.body.style.cursor = "pointer";
      } else {
        if (hovered) hovered.scale.set(1.05, 1.05, 1);
        hovered = null;
        hideSidebar();
        glow.material.opacity = 0;
        document.body.style.cursor = "default";
      }
    } else {
      if (hovered) hovered.scale.set(1.05, 1.05, 1);
      hovered = null;
      hideSidebar();
      glow.material.opacity = 0;
      document.body.style.cursor = "default";
    }

    // Render into each section “window”
    renderInto(skillsWin, "skills");
    renderInto(projectsWin, "projects");
    renderInto(contactWin, "contact");

    requestAnimationFrame(animate);
  }

  animate();
})();
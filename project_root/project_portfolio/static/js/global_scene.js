(function () {
  const root = document.getElementById("three-global");
  const skillsSection = document.getElementById("skills");
  if (!root || !skillsSection || !window.THREE) return;

  const sidebar = document.getElementById("tool-sidebar");
  const toolNameEl = document.getElementById("tool-name");
  const toolCategoryEl = document.getElementById("tool-category");
  const toolDescEl = document.getElementById("tool-desc");
  const toolTagsEl = document.getElementById("tool-tags");

  function setSidebar(tool) {
    if (!sidebar) return;
    sidebar.classList.add("show");
    toolNameEl.textContent = (tool.name || "").toUpperCase();
    toolCategoryEl.textContent = tool.category || "";
    toolDescEl.textContent = tool.description || "";
    toolTagsEl.innerHTML = (tool.tags || []).map(t => `<span class="tool-tag">${t}</span>`).join("");
  }
  function clearSidebar() { sidebar?.classList.remove("show"); }

  const modal = document.getElementById("projects-modal");
  const modalTitle = document.getElementById("modal-title");
  const modalBody = document.getElementById("modal-body");
  const modalClose = document.getElementById("modal-close");
  modalClose?.addEventListener("click", () => modal.classList.add("hidden"));
  modal?.addEventListener("click", (e) => { if (e.target === modal) modal.classList.add("hidden"); });

  function openModal(title, projects) {
    if (!modal) return;
    modalTitle.textContent = title;
    modalBody.innerHTML = "";
    if (!projects?.length) {
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

  const DEVOPS_TOOLS = [
    { name: "Ansible", category: "IaC", description: "Configuration management and automation.", color: 0xEE0000, tags: ["Automation","Config"] },
    { name: "AWS", category: "Cloud", description: "Amazon Web Services cloud platform.", color: 0xFF9900, tags: ["Cloud","Platform"] },
    { name: "Azure", category: "Cloud", description: "Microsoft Azure cloud services.", color: 0x0089D6, tags: ["Cloud","Microsoft"] },
    { name: "Bash", category: "Scripting", description: "Shell scripting for automation and ops.", color: 0x4EAA25, tags: ["Scripting","Linux"] },
    { name: "Datadog", category: "Monitoring", description: "Monitoring, logs and APM.", color: 0x632CA6, tags: ["Monitoring","APM"] },
    { name: "Docker", category: "Container", description: "Container platform for packaging apps.", color: 0x2496ED, tags: ["Containers"] },
    { name: "Git", category: "CI/CD", description: "Distributed version control system.", color: 0xF05032, tags: ["VCS"] },
    { name: "GitLab", category: "CI/CD", description: "DevOps platform with CI/CD.", color: 0xFC6D26, tags: ["CI/CD"] },
    { name: "Grafana", category: "Monitoring", description: "Dashboards and visualization.", color: 0xF46800, tags: ["Dashboards"] },
    { name: "Helm", category: "Container", description: "Kubernetes package manager.", color: 0x0F1689, tags: ["K8s","Charts"] },
    { name: "Jenkins", category: "CI/CD", description: "Automation server for pipelines.", color: 0xD24939, tags: ["Pipelines"] },
    { name: "JFrog", category: "CI/CD", description: "Artifact repository and promotion.", color: 0x41BF47, tags: ["Artifacts"] },
    { name: "Kubernetes", category: "Container", description: "Container orchestration platform.", color: 0x326CE5, tags: ["K8s"] },
    { name: "Linux", category: "OS", description: "Operating system for servers.", color: 0xFCC624, tags: ["OS","Server"] },
    { name: "Maven", category: "Build", description: "Build automation and dependencies.", color: 0xC71A36, tags: ["Build","Java"] },
    { name: "Nginx", category: "Web", description: "Reverse proxy and web server.", color: 0x009639, tags: ["Proxy","TLS"] },
    { name: "Prometheus", category: "Monitoring", description: "Metrics and alerting.", color: 0xE6522C, tags: ["Alerts"] },
    { name: "Python", category: "Scripting", description: "Automation scripting and APIs.", color: 0x3776AB, tags: ["Automation"] },
    { name: "Snyk", category: "Security", description: "Vulnerability management.", color: 0x4C4A73, tags: ["SCA"] },
    { name: "SonarQube", category: "Security", description: "Code quality and security analysis.", color: 0x4E9BCD, tags: ["Quality"] },
    { name: "Terraform", category: "IaC", description: "Infrastructure as Code provisioning.", color: 0x7B42BC, tags: ["IaC"] },
    { name: "Trivy", category: "Security", description: "Container + IaC scanning.", color: 0x1904DA, tags: ["Scanning"] },
  ];

  function isInsideSkills(x, y) {
    const r = skillsSection.getBoundingClientRect();
    return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
  }

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x050508, 20, 60);

  const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 5, 18);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  root.appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0xffffff, 0.4));
  const l1 = new THREE.PointLight(0x8b5cf6, 2, 50); l1.position.set(10, 10, 10); scene.add(l1);
  const l2 = new THREE.PointLight(0x6d28d9, 2, 50); l2.position.set(-10, -10, 10); scene.add(l2);
  const l3 = new THREE.PointLight(0x4c1d95, 1.5, 50); l3.position.set(0, 0, -10); scene.add(l3);

  const globe = new THREE.Mesh(
    new THREE.SphereGeometry(2, 64, 64),
    new THREE.MeshPhongMaterial({
      color: 0x1a1a2e,
      emissive: 0x8b5cf6,
      emissiveIntensity: 0.2,
      shininess: 100,
      transparent: true,
      opacity: 0.7
    })
  );
  scene.add(globe);

  globe.add(new THREE.Mesh(
    new THREE.SphereGeometry(2.05, 32, 32),
    new THREE.MeshBasicMaterial({ color: 0x8b5cf6, wireframe: true, transparent: true, opacity: 0.2 })
  ));

  globe.add(new THREE.Mesh(
    new THREE.SphereGeometry(2.3, 32, 32),
    new THREE.MeshBasicMaterial({ color: 0x8b5cf6, transparent: true, opacity: 0.1, side: THREE.BackSide })
  ));

  const pts = [];
  const segments = 200;
  const scale = 6;

  for (let i = 0; i <= segments; i++) {
    const t = (i / segments) * Math.PI * 2;
    const denom = 1 + Math.cos(t) * Math.cos(t);
    const x = scale * Math.sin(t) / denom;
    const y = scale * Math.sin(t) * Math.cos(t) / denom;
    const z = Math.sin(t * 2) * 1;
    pts.push(new THREE.Vector3(x, y, z));
  }
  const curve = new THREE.CatmullRomCurve3(pts, true);

  scene.add(new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(curve.getPoints(500)),
    new THREE.LineBasicMaterial({ color: 0x8b5cf6, transparent: true, opacity: 0.2 })
  ));

  const orbiters = [];
  DEVOPS_TOOLS.forEach((tool, i) => {
    const tt = i / DEVOPS_TOOLS.length;
    const pos = curve.getPoint(tt);

    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.3, 32, 32),
      new THREE.MeshPhongMaterial({
        color: tool.color,
        emissive: tool.color,
        emissiveIntensity: 0.3,
        shininess: 100
      })
    );
    sphere.position.copy(pos);

    const hoverGlow = new THREE.Mesh(
      new THREE.SphereGeometry(0.4, 16, 16),
      new THREE.MeshBasicMaterial({ color: tool.color, transparent: true, opacity: 0, side: THREE.BackSide })
    );
    sphere.add(hoverGlow);

    sphere.userData = { t: tt, baseT: tt, tool, hoverGlow };
    scene.add(sphere);
    orbiters.push(sphere);
  });

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2(999, 999);
  let hovered = null;
  let dragging = false;
  let prev = { x: 0, y: 0 };
  const camRot = { x: 0, y: 0 };

  window.addEventListener("mousedown", (e) => {
    if (!isInsideSkills(e.clientX, e.clientY)) return;
    dragging = true;
    prev = { x: e.clientX, y: e.clientY };
    document.body.classList.add("dragging");
  });

  window.addEventListener("mouseup", () => {
    dragging = false;
    document.body.classList.remove("dragging");
  });

  window.addEventListener("mousemove", (e) => {
    const inside = isInsideSkills(e.clientX, e.clientY);

    if (inside) {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    } else {
      mouse.x = 999; mouse.y = 999;
    }

    if (dragging && inside) {
      const dx = e.clientX - prev.x;
      const dy = e.clientY - prev.y;
      camRot.y += dx * 0.005;
      camRot.x += dy * 0.005;
      camRot.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, camRot.x));
      prev = { x: e.clientX, y: e.clientY };
    }
  });

  window.addEventListener("wheel", (e) => {
    if (!isInsideSkills(e.clientX, e.clientY)) return;
    e.preventDefault();
    camera.position.z += e.deltaY * 0.01 * 0.5;
    camera.position.z = Math.max(10, Math.min(30, camera.position.z));
  }, { passive: false });

  window.addEventListener("click", async (e) => {
    if (!isInsideSkills(e.clientX, e.clientY) || !hovered) return;
    const toolName = hovered.userData.tool.name;
    const resp = await fetch(`/api/projects/?tool=${encodeURIComponent(toolName)}`);
    const data = await resp.json();
    openModal(`${toolName} Projects`, data.projects || []);
  });

  function updateCamera() {
    const radius = 18;
    const camX = radius * Math.sin(camRot.y) * Math.cos(camRot.x);
    const camY = 5 + radius * Math.sin(camRot.x);
    const camZ = radius * Math.cos(camRot.y) * Math.cos(camRot.x);
    camera.position.set(camX, camY, camZ);
    camera.lookAt(0, 0, 0);
  }

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  let time = 0;
  function animate() {
    time += 0.016;
    globe.rotation.y += 0.002;

    orbiters.forEach(o => {
      o.userData.t = (o.userData.baseT + time * 0.008) % 1;
      o.position.copy(curve.getPoint(o.userData.t));
      o.rotation.x += 0.01;
      o.rotation.y += 0.01;
    });

    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects(orbiters);

    if (hits.length) {
      const obj = hits[0].object;
      if (hovered && hovered !== obj) {
        hovered.userData.hoverGlow.material.opacity = 0;
        hovered.scale.set(1, 1, 1);
      }
      hovered = obj;
      hovered.userData.hoverGlow.material.opacity = 0.5;
      hovered.scale.set(1.3, 1.3, 1.3);
      setSidebar(hovered.userData.tool);
      document.body.style.cursor = "pointer";
    } else {
      if (hovered) {
        hovered.userData.hoverGlow.material.opacity = 0;
        hovered.scale.set(1, 1, 1);
      }
      hovered = null;
      clearSidebar();
      document.body.style.cursor = dragging ? "grabbing" : "default";
    }

    updateCamera();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();
})();
(function () {
  const container = document.getElementById("skills-3d");
  if (!container) return;

  const modal = document.getElementById("projects-modal");
  const modalTitle = document.getElementById("modal-title");
  const modalBody = document.getElementById("modal-body");
  const modalClose = document.getElementById("modal-close");

  function openModal(title, projects) {
    modalTitle.textContent = title;
    modalBody.innerHTML = "";

    if (!projects.length) {
      modalBody.innerHTML = `<div class="pcard">No projects found for this tool yet.</div>`;
    } else {
      for (const p of projects) {
        const link = p.link ? `<a href="${p.link}" target="_blank" rel="noopener">${p.title}</a>` : `<div><b>${p.title}</b></div>`;
        const tools = p.tools?.map(t => t.name).join(", ") || "";
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

  modalClose?.addEventListener("click", () => modal.classList.add("hidden"));
  modal?.addEventListener("click", (e) => { if (e.target === modal) modal.classList.add("hidden"); });

  // ---- THREE SETUP ----
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    50,
    container.clientWidth / container.clientHeight,
    0.1,
    200
  );
  camera.position.set(0, 0, 12);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  // Lights
  scene.add(new THREE.AmbientLight(0xffffff, 1.0));
  const key = new THREE.PointLight(0xffffff, 1.2);
  key.position.set(10, 12, 12);
  scene.add(key);

  // Background poster (your infinity image) as a plane
  const loader = new THREE.TextureLoader();

  const posterTex = loader.load(
    "/static/img/devops/devops_infinity.png",
    () => renderer.render(scene, camera)
  );

  posterTex.colorSpace = THREE.SRGBColorSpace;

  const posterGeo = new THREE.PlaneGeometry(11, 6.2);
  const posterMat = new THREE.MeshBasicMaterial({ map: posterTex });
  const poster = new THREE.Mesh(posterGeo, posterMat);
  poster.position.set(0, 0, -1);
  scene.add(poster);

  // Tools (clickable icons) - add your real png icons later
  // Put icons into: static/img/tools/<key>.png  (e.g., docker.png)
  const tools = [
    { key: "docker", name: "Docker", icon: "/static/img/tools/docker.png", x: -4.8, y: -0.8 },
    { key: "kubernetes", name: "Kubernetes", icon: "/static/img/tools/kubernetes.png", x: -5.0, y: 1.8 },
    { key: "jenkins", name: "Jenkins", icon: "/static/img/tools/jenkins.png", x: 5.2, y: 2.2 },
    { key: "terraform", name: "Terraform", icon: "/static/img/tools/terraform.png", x: 4.9, y: 0.2 },
    { key: "ansible", name: "Ansible", icon: "/static/img/tools/ansible.png", x: 4.2, y: -1.8 },
    { key: "prometheus", name: "Prometheus", icon: "/static/img/tools/prometheus.png", x: -2.6, y: 2.6 },
    { key: "grafana", name: "Grafana", icon: "/static/img/tools/grafana.png", x: 2.2, y: 2.6 },
  ];

  // If you don’t have icons yet, it still works (it’ll show colored circles)
  function makeFallbackTexture(colorHex) {
    const size = 128;
    const c = document.createElement("canvas");
    c.width = c.height = size;
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#00000000";
    ctx.fillRect(0, 0, size, size);
    ctx.beginPath();
    ctx.arc(size/2, size/2, size/2 - 6, 0, Math.PI*2);
    ctx.fillStyle = `#${colorHex.toString(16).padStart(6,"0")}`;
    ctx.fill();
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  const clickable = [];
  tools.forEach((t, i) => {
    let tex;
    try {
      tex = loader.load(t.icon);
      tex.colorSpace = THREE.SRGBColorSpace;
    } catch {
      tex = makeFallbackTexture(0x512a6e + i * 2000);
    }

    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true });
    const sprite = new THREE.Sprite(mat);
    sprite.position.set(t.x, t.y, 0.4);
    sprite.scale.set(1.0, 1.0, 1.0);

    sprite.userData = { toolKey: t.key, toolName: t.name };
    scene.add(sprite);
    clickable.push(sprite);
  });

  // Interaction (hover + click)
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  let hovered = null;

  function setMouse(e) {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  }

  renderer.domElement.addEventListener("mousemove", (e) => {
    setMouse(e);
  });

  renderer.domElement.addEventListener("click", async (e) => {
    setMouse(e);
    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects(clickable, true);
    if (!hits.length) return;

    const obj = hits[0].object;
    const toolKey = obj.userData.toolKey;
    const toolName = obj.userData.toolName;

    // Load projects from DB filtered by tool
    const resp = await fetch(`/api/projects/?tool=${encodeURIComponent(toolKey)}`);
    const data = await resp.json();
    openModal(`${toolName} Projects`, data.projects || []);
  });

  // Drag rotate like the keyboard (rotate the whole scene slightly)
  let dragging = false, lastX = 0, lastY = 0;
  let rotY = 0, rotX = 0;

  renderer.domElement.addEventListener("pointerdown", (e) => {
    dragging = true;
    lastX = e.clientX; lastY = e.clientY;
    renderer.domElement.setPointerCapture(e.pointerId);
  });
  renderer.domElement.addEventListener("pointerup", () => dragging = false);
  renderer.domElement.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const dx = (e.clientX - lastX) * 0.004;
    const dy = (e.clientY - lastY) * 0.004;
    rotY += dx;
    rotX += dy;
    lastX = e.clientX; lastY = e.clientY;
  });

  function onResize() {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  }
  window.addEventListener("resize", onResize);

  const clock = new THREE.Clock();

  function animate() {
    const t = clock.getElapsedTime();

    // Hover effect
    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects(clickable, true);
    if (hits.length) {
      const obj = hits[0].object;
      if (hovered && hovered !== obj) hovered.scale.set(1.0, 1.0, 1.0);
      hovered = obj;
      hovered.scale.set(1.18, 1.18, 1.18);
      renderer.domElement.style.cursor = "pointer";
    } else {
      if (hovered) hovered.scale.set(1.0, 1.0, 1.0);
      hovered = null;
      renderer.domElement.style.cursor = "default";
    }

    // subtle float for icons
    clickable.forEach((s, i) => {
      s.position.y += Math.sin(t * 1.2 + i) * 0.0008;
    });

    // apply drag rotation
    scene.rotation.y = rotY * 0.7;
    scene.rotation.x = rotX * 0.4;

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();
})();

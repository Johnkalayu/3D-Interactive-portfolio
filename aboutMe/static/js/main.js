function makeThreeScene(containerId, options = {}) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    55,
    container.clientWidth / container.clientHeight,
    0.1,
    100
  );
  camera.position.set(0, 2.2, 10);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  // Lights
  scene.add(new THREE.AmbientLight(0xffffff, 0.9));
  const key = new THREE.PointLight(0xffffff, 1.2);
  key.position.set(8, 10, 8);
  scene.add(key);

  // A “platform”
  const platformGeo = new THREE.BoxGeometry(10, 0.6, 6);
  const platformMat = new THREE.MeshStandardMaterial({
    color: 0x0b0d16,
    roughness: 0.4,
    metalness: 0.2
  });
  const platform = new THREE.Mesh(platformGeo, platformMat);
  platform.position.y = -2.2;
  platform.castShadow = false;
  scene.add(platform);

  // Group of tiles/shapes (skills vibe)
  const group = new THREE.Group();
  scene.add(group);

  const palette = options.palette || [
    0xff7a00, 0x2dd4ff, 0x22c55e, 0xa855f7, 0x60a5fa,
    0xf97316, 0x10b981, 0xef4444, 0xeab308, 0x38bdf8
  ];

  const geos = [
    () => new THREE.BoxGeometry(1, 1, 1),
    () => new THREE.CapsuleGeometry(0.45, 0.5, 8, 16),
    () => new THREE.TorusGeometry(0.5, 0.18, 16, 80),
    () => new THREE.IcosahedronGeometry(0.6, 0),
    () => new THREE.ConeGeometry(0.6, 1.1, 24),
    () => new THREE.CylinderGeometry(0.5, 0.5, 1.0, 20),
  ];

  const tiles = [];
  const rows = options.rows ?? 4;
  const cols = options.cols ?? 5;

  const startX = -((cols - 1) * 1.25) / 2;
  const startZ = -((rows - 1) * 1.25) / 2;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const color = palette[(r * cols + c) % palette.length];
      const mat = new THREE.MeshStandardMaterial({
        color,
        roughness: 0.35,
        metalness: 0.15
      });

      const geo = geos[(r * cols + c) % geos.length]();
      const mesh = new THREE.Mesh(geo, mat);

      mesh.position.set(startX + c * 1.25, -1.1 + Math.random() * 0.4, startZ + r * 1.25);
      mesh.rotation.set(Math.random() * 0.6, Math.random() * 0.6, 0);
      mesh.userData.baseY = mesh.position.y;

      group.add(mesh);
      tiles.push(mesh);
    }
  }

  // Tilt the group like the “keyboard” angle
  group.rotation.x = -0.55;
  group.rotation.y = 0.65;

  // Drag rotate
  let dragging = false;
  let lastX = 0, lastY = 0;
  container.addEventListener("pointerdown", (e) => {
    dragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
    container.setPointerCapture(e.pointerId);
  });
  container.addEventListener("pointerup", () => (dragging = false));
  container.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const dx = (e.clientX - lastX) * 0.006;
    const dy = (e.clientY - lastY) * 0.006;
    group.rotation.y += dx;
    group.rotation.x += dy;
    lastX = e.clientX;
    lastY = e.clientY;
  });

  // Hover highlight (raycaster)
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  let hovered = null;

  container.addEventListener("mousemove", (e) => {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
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

    // Float + rotate each tile a bit
    tiles.forEach((m, i) => {
      m.position.y = m.userData.baseY + Math.sin(t * 1.2 + i) * 0.07;
      m.rotation.y += 0.002;
    });

    // hover
    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects(tiles);

    if (hits.length) {
      const obj = hits[0].object;
      if (hovered && hovered !== obj) hovered.scale.set(1, 1, 1);
      hovered = obj;
      hovered.scale.set(1.12, 1.12, 1.12);
      container.style.cursor = "grab";
    } else {
      if (hovered) hovered.scale.set(1, 1, 1);
      hovered = null;
      container.style.cursor = "default";
    }

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();
}

// Create scenes for each section
makeThreeScene("hero-3d", { rows: 4, cols: 4 });
makeThreeScene("about-3d", { rows: 3, cols: 5, palette: [0x512a6e, 0xffffff, 0x7c3aed, 0x60a5fa, 0x22c55e] });
makeThreeScene("skills-3d", { rows: 4, cols: 5 });
makeThreeScene("contact-3d", { rows: 3, cols: 5 });

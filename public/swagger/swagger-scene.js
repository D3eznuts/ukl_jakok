(function () {
  const THREE_URL = '/vendor/three/three.module.min.js';
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function createStage() {
    const stage = document.createElement('div');
    stage.className = 'swagger-3d-stage';

    const canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');

    const fallback = document.createElement('div');
    fallback.className = 'swagger-3d-fallback';

    stage.append(canvas, fallback);
    document.body.prepend(stage);

    return { stage, canvas };
  }

  function createHero() {
    const swaggerUi = document.getElementById('swagger-ui');

    if (!swaggerUi || document.querySelector('.swagger-brand-hero')) {
      return;
    }

    const hero = document.createElement('section');
    hero.className = 'swagger-brand-hero';
    hero.innerHTML = [
      '<div class="swagger-brand-kicker">Interactive API Docs</div>',
      '<h1>ElectroTech</h1>',
      '<p>Dokumentasi API toko elektronik untuk autentikasi, katalog produk, stok, transaksi, dan pembayaran.</p>',
      '<div class="swagger-brand-badges" aria-label="Modul API">',
      '<span>Auth JWT</span>',
      '<span>Katalog Produk</span>',
      '<span>Transaksi</span>',
      '</div>',
    ].join('');

    swaggerUi.before(hero);
  }

  function createLineMaterial(THREE, color, opacity) {
    return new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity,
    });
  }

  function createBox(THREE, width, height, depth, color, x, y, z) {
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const material = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.55,
      metalness: 0.18,
      transparent: true,
      opacity: 0.9,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);

    const edgeMaterial = new THREE.LineBasicMaterial({
      color: 0x17202a,
      transparent: true,
      opacity: 0.28,
    });
    const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geometry), edgeMaterial);
    mesh.add(edges);

    return mesh;
  }

  function createGrid(THREE) {
    const points = [];
    const size = 11;
    const step = 1;

    for (let i = -size; i <= size; i += step) {
      points.push(new THREE.Vector3(-size, 0, i), new THREE.Vector3(size, 0, i));
      points.push(new THREE.Vector3(i, 0, -size), new THREE.Vector3(i, 0, size));
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const grid = new THREE.LineSegments(geometry, createLineMaterial(THREE, 0x0ea5a6, 0.2));
    grid.position.y = -2.25;
    grid.rotation.x = Math.PI * 0.02;

    return grid;
  }

  function createCircuitLines(THREE) {
    const group = new THREE.Group();
    const colors = [0x0ea5a6, 0xef6f5e, 0xc58a1e, 0x2f9b6f];

    for (let i = 0; i < 18; i += 1) {
      const length = 0.8 + (i % 4) * 0.24;
      const x = -5.4 + (i % 6) * 2.1;
      const y = -1.2 + Math.floor(i / 6) * 0.95;
      const z = -2.2 + (i % 3) * 0.72;
      const points = [
        new THREE.Vector3(x, y, z),
        new THREE.Vector3(x + length, y, z),
        new THREE.Vector3(x + length, y + 0.24, z),
      ];
      const line = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(points),
        createLineMaterial(THREE, colors[i % colors.length], 0.54),
      );
      group.add(line);
    }

    return group;
  }

  async function boot3d(canvas, stage) {
    if (prefersReducedMotion) {
      stage.classList.add('is-3d-fallback');
      return;
    }

    try {
      const THREE = await import(THREE_URL);
      const renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        preserveDrawingBuffer: true,
        powerPreference: 'high-performance',
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
      camera.position.set(0, 1.1, 9.4);

      const ambient = new THREE.AmbientLight(0xffffff, 1.45);
      const key = new THREE.DirectionalLight(0xffffff, 2.2);
      key.position.set(2.5, 4.5, 5);
      scene.add(ambient, key);

      const group = new THREE.Group();
      const grid = createGrid(THREE);
      const circuits = createCircuitLines(THREE);
      const boxes = [
        createBox(THREE, 1.35, 0.9, 0.26, 0x0ea5a6, -3.25, 0.8, -0.9),
        createBox(THREE, 0.74, 1.32, 0.24, 0xef6f5e, -1.42, 1.25, -1.25),
        createBox(THREE, 1.15, 0.7, 0.24, 0x2f9b6f, 0.36, 0.72, -0.75),
        createBox(THREE, 0.98, 0.98, 0.24, 0xc58a1e, 2.05, 1.18, -1.1),
        createBox(THREE, 1.42, 0.72, 0.24, 0x3b82f6, 3.66, 0.55, -1.34),
      ];

      boxes.forEach((box, index) => {
        box.rotation.y = -0.36 + index * 0.12;
        box.rotation.x = 0.1;
        group.add(box);
      });

      group.add(grid, circuits);
      scene.add(group);

      function resize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      }

      window.addEventListener('resize', resize, { passive: true });
      resize();

      let frame = 0;
      function animate() {
        frame += 0.01;
        group.rotation.y = Math.sin(frame * 0.55) * 0.08;
        group.rotation.x = Math.sin(frame * 0.35) * 0.025;

        boxes.forEach((box, index) => {
          box.position.y += Math.sin(frame + index) * 0.0018;
          box.rotation.y += 0.002 + index * 0.0002;
        });

        circuits.position.x = Math.sin(frame * 0.8) * 0.12;
        renderer.render(scene, camera);
        window.requestAnimationFrame(animate);
      }

      animate();
    } catch (error) {
      stage.classList.add('is-3d-fallback');
      console.warn('Swagger 3D scene failed to load:', error);
    }
  }

  function boot() {
    createHero();
    const { stage, canvas } = createStage();
    boot3d(canvas, stage);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();

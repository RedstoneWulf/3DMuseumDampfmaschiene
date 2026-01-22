// ==========================================
// objects.js - ALLE MODELLE (OPTISCH VERBESSERT)
// - bessere Materialien (Physical), Bevel/Details
// - dezente Patina/Variation in Texturen
// - hochwertigere Rahmen, Lampen, Wasser
// - weiterhin kompatibel zu deinem script.js
// ==========================================

// --------------------------------------------------
// 0) KLEINE HELFER
// --------------------------------------------------
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

function applyTextureDefaults(tex, repeatX = 1, repeatY = 1) {
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeatX, repeatY);
  tex.anisotropy = 8;
  tex.colorSpace = THREE.SRGBColorSpace || undefined; // falls neuere three.js
  tex.needsUpdate = true;
  return tex;
}

function makeCanvasTexture(drawFn, w, h) {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  const ctx = c.getContext("2d");
  drawFn(ctx, w, h);
  const t = new THREE.CanvasTexture(c);
  // In alten Three-Versionen: outputEncoding; in neueren: colorSpace
  if ("colorSpace" in t) t.colorSpace = THREE.SRGBColorSpace;
  t.needsUpdate = true;
  return t;
}

function addRivetsOnBox(mesh, w, h, d, count = 18, color = 0x777777) {
  // kleine Nieten als Deko (sehr günstig)
  const rivetGeo = new THREE.SphereGeometry(0.18, 8, 8);
  const rivetMat = new THREE.MeshStandardMaterial({ color, metalness: 0.8, roughness: 0.35 });
  const grp = new THREE.Group();

  for (let i = 0; i < count; i++) {
    const r = new THREE.Mesh(rivetGeo, rivetMat);
    const side = Math.floor(Math.random() * 4);

    // Position auf dem Rahmen
    const x = (Math.random() - 0.5) * (w * 0.9);
    const y = (Math.random() - 0.5) * (h * 0.9);

    if (side === 0) r.position.set(x, y, d / 2 + 0.6);
    if (side === 1) r.position.set(x, y, -d / 2 - 0.6);
    if (side === 2) r.position.set(w / 2 + 0.6, y, (Math.random() - 0.5) * (d * 0.9));
    if (side === 3) r.position.set(-w / 2 - 0.6, y, (Math.random() - 0.5) * (d * 0.9));

    grp.add(r);
  }
  mesh.add(grp);
  return grp;
}

// --------------------------------------------------
// 1) TEXTUREN & MATERIALIEN (BESSER)
// --------------------------------------------------

function createStationSignTexture(text) {
  return makeCanvasTexture((ctx, w, h) => {
    // Hintergrund
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, "#0b2a4a");
    grad.addColorStop(1, "#061a2e");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // leichte “Metal-Brushed” Lines
    ctx.globalAlpha = 0.15;
    ctx.fillStyle = "#ffffff";
    for (let y = 0; y < h; y += 3) ctx.fillRect(0, y, w, 1);
    ctx.globalAlpha = 1;

    // Rahmen
    ctx.strokeStyle = "rgba(255,255,255,0.85)";
    ctx.lineWidth = 10;
    ctx.strokeRect(8, 8, w - 16, h - 16);

    // Innenrahmen
    ctx.strokeStyle = "rgba(0,0,0,0.35)";
    ctx.lineWidth = 6;
    ctx.strokeRect(18, 18, w - 36, h - 36);

    // Text + leichte Schatten
    ctx.font = "900 58px Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "rgba(0,0,0,0.55)";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 3;
    ctx.fillStyle = "#f6f7fb";
    ctx.fillText(text.toUpperCase(), w / 2, h / 2);

    // Glanz
    ctx.shadowBlur = 0;
    const gloss = ctx.createLinearGradient(0, 0, w, 0);
    gloss.addColorStop(0, "rgba(255,255,255,0)");
    gloss.addColorStop(0.5, "rgba(255,255,255,0.18)");
    gloss.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = gloss;
    ctx.fillRect(0, 0, w, h);
  }, 1024, 128);
}

function createBrickTexture() {
  // höherer Kontrast, Mörtel, Noise
  const size = 2048;

  const tex = makeCanvasTexture((ctx, w, h) => {
    // mortar
    ctx.fillStyle = "#d7d0c4";
    ctx.fillRect(0, 0, w, h);

    const brickColors = ["#a65e4e", "#b86a56", "#c67963", "#8b4a3c", "#9a5647"];
    const bw = 210;
    const bh = 105;

    for (let row = 0; row < Math.floor(h / bh) + 1; row++) {
      const offset = row % 2 === 0 ? 0 : -bw / 2;

      for (let col = -1; col < Math.floor(w / bw) + 2; col++) {
        const x = col * bw + offset;
        const y = row * bh;

        const base = brickColors[(Math.random() * brickColors.length) | 0];
        ctx.fillStyle = base;
        ctx.fillRect(x + 7, y + 7, bw - 14, bh - 14);

        // Variation: dunkle Kanten
        ctx.globalAlpha = 0.18;
        ctx.fillStyle = "#000000";
        ctx.fillRect(x + 7, y + 7, bw - 14, 10);
        ctx.fillRect(x + 7, y + 7, 10, bh - 14);
        ctx.globalAlpha = 1;

        // Noise Pitting
        for (let i = 0; i < 60; i++) {
          ctx.fillStyle = `rgba(0,0,0,${0.04 + Math.random() * 0.08})`;
          ctx.fillRect(x + 10 + Math.random() * (bw - 20), y + 10 + Math.random() * (bh - 20), 2, 2);
        }
      }
    }

    // overall grime
    ctx.globalAlpha = 0.10;
    ctx.fillStyle = "#000";
    for (let i = 0; i < 2500; i++) {
      ctx.fillRect(Math.random() * w, Math.random() * h, 1, 1);
    }
    ctx.globalAlpha = 1;
  }, size, size);

  return applyTextureDefaults(tex, 8, 8);
}

function createQuartzTexture() {
  // dezente Maserung + kleine Adern
  const size = 1024;
  const tex = makeCanvasTexture((ctx, w, h) => {
    ctx.fillStyle = "#fbfaf5";
    ctx.fillRect(0, 0, w, h);

    // feines Grain
    for (let i = 0; i < 45000; i++) {
      const a = 0.03 + Math.random() * 0.07;
      ctx.fillStyle = `rgba(120,120,120,${a})`;
      ctx.fillRect(Math.random() * w, Math.random() * h, 1, 1);
    }

    // Adern
    ctx.globalAlpha = 0.25;
    ctx.strokeStyle = "#d8d3c8";
    ctx.lineWidth = 1.2;
    for (let v = 0; v < 18; v++) {
      ctx.beginPath();
      let x = Math.random() * w;
      let y = Math.random() * h;
      ctx.moveTo(x, y);
      for (let k = 0; k < 14; k++) {
        x += (Math.random() - 0.5) * 120;
        y += (Math.random() - 0.5) * 120;
        ctx.lineTo(clamp(x, 0, w), clamp(y, 0, h));
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }, size, size);

  return applyTextureDefaults(tex, 2, 4);
}

function createPaintingTexture() {
  // wirkt eher wie echte “Gemälde” statt random blobs
  const size = 512;
  const tex = makeCanvasTexture((ctx, w, h) => {
    // Leinwand
    ctx.fillStyle = "#f4eadb";
    ctx.fillRect(0, 0, w, h);

    // canvas weave
    ctx.globalAlpha = 0.12;
    ctx.fillStyle = "#000";
    for (let y = 0; y < h; y += 4) ctx.fillRect(0, y, w, 1);
    for (let x = 0; x < w; x += 4) ctx.fillRect(x, 0, 1, h);
    ctx.globalAlpha = 1;

    // “Bild”
    const hue = Math.random() * 360;
    const bg = `hsl(${hue}, 40%, 75%)`;
    ctx.fillStyle = bg;
    ctx.fillRect(30, 30, w - 60, h - 60);

    // simple Komposition: Formen + Pinselstriche
    for (let i = 0; i < 120; i++) {
      ctx.globalAlpha = 0.25 + Math.random() * 0.35;
      ctx.strokeStyle = `hsla(${hue + (Math.random() * 60 - 30)}, 55%, ${40 + Math.random() * 30}%, 1)`;
      ctx.lineWidth = 2 + Math.random() * 6;
      ctx.beginPath();
      const x1 = 40 + Math.random() * (w - 80);
      const y1 = 40 + Math.random() * (h - 80);
      const x2 = 40 + Math.random() * (w - 80);
      const y2 = 40 + Math.random() * (h - 80);
      ctx.moveTo(x1, y1);
      ctx.quadraticCurveTo((x1 + x2) / 2 + (Math.random() - 0.5) * 80, (y1 + y2) / 2 + (Math.random() - 0.5) * 80, x2, y2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }, size, size);

  return tex;
}

function createRockTexture() {
  const size = 512;
  const tex = makeCanvasTexture((ctx, w, h) => {
    ctx.fillStyle = "#243240";
    ctx.fillRect(0, 0, w, h);

    // blobs
    for (let i = 0; i < 180; i++) {
      ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.25})`;
      ctx.beginPath();
      ctx.arc(Math.random() * w, Math.random() * h, 10 + Math.random() * 60, 0, Math.PI * 2);
      ctx.fill();
    }

    // speckles
    for (let i = 0; i < 5000; i++) {
      ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.07})`;
      ctx.fillRect(Math.random() * w, Math.random() * h, 1, 1);
    }
  }, size, size);

  return applyTextureDefaults(tex, 3, 3);
}

function createBeltTexture() {
  const tex = makeCanvasTexture((ctx, w, h) => {
    ctx.fillStyle = "#3a241f";
    ctx.fillRect(0, 0, w, h);

    // stitching lines
    ctx.globalAlpha = 0.35;
    ctx.strokeStyle = "#1e1412";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(10, 0); ctx.lineTo(10, h);
    ctx.moveTo(w - 10, 0); ctx.lineTo(w - 10, h);
    ctx.stroke();

    // grooves
    ctx.globalAlpha = 0.25;
    ctx.fillStyle = "#000";
    for (let i = 0; i < 28; i++) ctx.fillRect(0, i * 18, w, 4);

    ctx.globalAlpha = 1;
  }, 128, 512);

  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1, 2);
  return tex;
}

function createWaterArc(start, end, height) {
  const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
  mid.y += height;
  const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
  return new THREE.TubeGeometry(curve, 24, 0.45, 10, false);
}

// --------------------------------------------------
// 2) STANDARD OBJEKTE (BESSER)
// --------------------------------------------------

function createMuseumPodium() {
  const group = new THREE.Group();

  const woodTex = makeCanvasTexture((ctx, w, h) => {
    ctx.fillStyle = "#5b3a2e";
    ctx.fillRect(0, 0, w, h);

    // wood grain
    ctx.globalAlpha = 0.22;
    for (let i = 0; i < 120; i++) {
      ctx.strokeStyle = `rgba(0,0,0,${0.05 + Math.random() * 0.12})`;
      ctx.lineWidth = 1 + Math.random() * 2;
      ctx.beginPath();
      const y = Math.random() * h;
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(w * 0.3, y + (Math.random() - 0.5) * 25, w * 0.7, y + (Math.random() - 0.5) * 25, w, y);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }, 512, 512);
  applyTextureDefaults(woodTex, 1, 1);

  const woodMat = new THREE.MeshStandardMaterial({
    map: woodTex,
    color: 0xffffff,
    roughness: 0.85,
    metalness: 0.05
  });

  const base = new THREE.Mesh(new THREE.CylinderGeometry(14, 16, 8, 48), woodMat);
  base.position.y = 4;
  base.castShadow = true;
  base.receiveShadow = true;
  group.add(base);

  // “Sockel” Ring
  const ringMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.4, metalness: 0.6 });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(14.8, 0.6, 12, 40), ringMat);
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.6;
  ring.castShadow = true;
  group.add(ring);

  const marbleMat = new THREE.MeshPhysicalMaterial({
    color: 0xf1f1f1,
    roughness: 0.25,
    metalness: 0.05,
    clearcoat: 0.25,
    clearcoatRoughness: 0.2
  });

  const top = new THREE.Mesh(new THREE.CylinderGeometry(15, 15, 2, 48), marbleMat);
  top.position.y = 9;
  top.castShadow = true;
  top.receiveShadow = true;
  group.add(top);

  return group;
}

function createModernPlant() {
  const grp = new THREE.Group();

  const potMat = new THREE.MeshStandardMaterial({ color: 0x263645, roughness: 0.85, metalness: 0.1 });
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(5, 4, 8, 24), potMat);
  pot.position.y = 4;
  pot.castShadow = true;
  pot.receiveShadow = true;
  grp.add(pot);

  const soilMat = new THREE.MeshStandardMaterial({ color: 0x3a241f, roughness: 1.0 });
  const soil = new THREE.Mesh(new THREE.CircleGeometry(4.5, 24), soilMat);
  soil.rotation.x = -Math.PI / 2;
  soil.position.y = 7.6;
  grp.add(soil);

  // Leaves: mehr Variation, leicht glossy
  const leafMat = new THREE.MeshPhysicalMaterial({
    color: 0x2ecc71,
    roughness: 0.45,
    metalness: 0.0,
    clearcoat: 0.25,
    clearcoatRoughness: 0.5,
    side: THREE.DoubleSide
  });

  const geo = new THREE.ConeGeometry(1, 1, 10);
  geo.translate(0, 0.5, 0);

  for (let i = 0; i < 11; i++) {
    const l = new THREE.Mesh(geo, leafMat);
    const h = 14 + Math.random() * 14;
    l.scale.set(1 + Math.random() * 0.9, h, 0.18 + Math.random() * 0.18);
    l.position.y = 7;
    const a = (i / 11) * Math.PI * 2;
    const tilt = 0.08 + Math.random() * 0.2;
    l.rotation.set(tilt * Math.cos(a), a, tilt * Math.sin(a));
    l.castShadow = true;
    grp.add(l);
  }

  return grp;
}

function createPortraitFrame(imagePath) {
  const group = new THREE.Group();

  // Holzrahmen mit etwas “Bevel”
  const frameMat = new THREE.MeshStandardMaterial({
    color: 0x6b3f2a,
    roughness: 0.65,
    metalness: 0.12
  });

  const outer = new THREE.Mesh(new THREE.BoxGeometry(14.6, 18.6, 1.2), frameMat);
  outer.castShadow = true;
  outer.receiveShadow = true;
  group.add(outer);

  const goldMat = new THREE.MeshPhysicalMaterial({
    color: 0xffd36a,
    metalness: 1.0,
    roughness: 0.22,
    clearcoat: 0.15,
    clearcoatRoughness: 0.25
  });

  const inner = new THREE.Mesh(new THREE.BoxGeometry(12.6, 16.6, 1.25), goldMat);
  group.add(inner);

  addRivetsOnBox(outer, 14.6, 18.6, 1.2, 14, 0x8d8d8d);

  const textureLoader = new THREE.TextureLoader();
  const texture = textureLoader.load(
    imagePath,
    () => {},
    undefined,
    () => console.error("Bildfehler:", imagePath)
  );

  // leichtes “Glass” davor
  const canvas = new THREE.Mesh(
    new THREE.PlaneGeometry(11.4, 15.4),
    new THREE.MeshBasicMaterial({ map: texture })
  );
  canvas.position.z = 0.72;
  group.add(canvas);

  const glass = new THREE.Mesh(
    new THREE.PlaneGeometry(11.6, 15.6),
    new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.9,
      transparent: true,
      opacity: 0.35,
      roughness: 0.08,
      metalness: 0.0,
      ior: 1.45,
      thickness: 0.4
    })
  );
  glass.position.z = 0.9;
  group.add(glass);

  // Lamp: emissive + Spot (weicher)
  const lampMat = new THREE.MeshStandardMaterial({ color: 0x8c8c8c, roughness: 0.35, metalness: 0.8, emissive: 0x111111 });
  const lamp = new THREE.Mesh(new THREE.BoxGeometry(7, 1.2, 2.6), lampMat);
  lamp.position.set(0, 10.4, 2.2);
  lamp.castShadow = true;
  group.add(lamp);

  const spot = new THREE.SpotLight(0xffcaa0, 2.2, 40, Math.PI / 4, 0.6, 1.2);
  spot.position.set(0, 10.8, 5.2);
  spot.target = canvas;
  spot.castShadow = true;
  group.add(spot);

  return group;
}

function createBlueprintFrame(imagePath) {
  const group = new THREE.Group();

  const frameMat = new THREE.MeshStandardMaterial({ color: 0x1c1c1c, roughness: 0.85, metalness: 0.15 });
  const frame = new THREE.Mesh(new THREE.BoxGeometry(48.8, 32.8, 2.2), frameMat);
  frame.castShadow = true;
  frame.receiveShadow = true;
  group.add(frame);

  addRivetsOnBox(frame, 48.8, 32.8, 2.2, 20, 0x666666);

  const textureLoader = new THREE.TextureLoader();
  const texture = textureLoader.load(imagePath);

  const canvas = new THREE.Mesh(
    new THREE.PlaneGeometry(44.2, 28.2),
    new THREE.MeshBasicMaterial({ map: texture, color: 0xffffff })
  );
  canvas.position.z = 1.2;
  group.add(canvas);

  // Glass
  const glass = new THREE.Mesh(
    new THREE.PlaneGeometry(44.4, 28.4),
    new THREE.MeshPhysicalMaterial({
      transmission: 0.9,
      transparent: true,
      opacity: 0.22,
      roughness: 0.14,
      metalness: 0,
      ior: 1.45,
      thickness: 0.35
    })
  );
  glass.position.z = 1.35;
  group.add(glass);

  // Lamp holder + Spot
  const lampHolder = new THREE.Mesh(new THREE.BoxGeometry(22, 1.2, 4.6), new THREE.MeshStandardMaterial({ color: 0x444444, roughness: 0.5, metalness: 0.7 }));
  lampHolder.position.set(0, 17.4, 3.2);
  lampHolder.castShadow = true;
  group.add(lampHolder);

  const spot = new THREE.SpotLight(0xffffff, 1.35, 70, Math.PI / 3, 0.35, 1.2);
  spot.position.set(0, 17.8, 7.0);
  spot.target = canvas;
  spot.castShadow = true;
  group.add(spot);

  return group;
}

// --------------------------------------------------
// 3) LOBBY OBJEKT (LOK-BRUNNEN) - MEHR “WOW”
// --------------------------------------------------

function createLocomotiveFountain() {
  const group = new THREE.Group();

  // Basin: metallisch, mit Kante
  const basinMat = new THREE.MeshPhysicalMaterial({
    color: 0x1a1a1a,
    roughness: 0.25,
    metalness: 0.65,
    clearcoat: 0.15,
    clearcoatRoughness: 0.35
  });

  const basin = new THREE.Mesh(new THREE.CylinderGeometry(30, 32, 5, 72), basinMat);
  basin.position.y = 2.5;
  basin.receiveShadow = true;
  basin.castShadow = true;
  group.add(basin);

  // Rim
  const rim = new THREE.Mesh(new THREE.TorusGeometry(29.8, 0.65, 14, 80), new THREE.MeshStandardMaterial({ color: 0x2b2b2b, metalness: 0.85, roughness: 0.25 }));
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 5.1;
  rim.castShadow = true;
  group.add(rim);

  // Water surface: nicer physical (Transmission)
  const water = new THREE.Mesh(
    new THREE.CircleGeometry(29, 72),
    new THREE.MeshPhysicalMaterial({
      color: 0x2aa7ff,
      transmission: 0.75,
      transparent: true,
      opacity: 0.65,
      roughness: 0.06,
      metalness: 0.0,
      ior: 1.33,
      thickness: 1.0
    })
  );
  water.rotation.x = -Math.PI / 2;
  water.position.y = 4.85;
  group.add(water);

  // Track bed: more detail
  const trackMat = new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.9, metalness: 0.05 });
  const trackBed = new THREE.Mesh(new THREE.BoxGeometry(16, 4, 60), trackMat);
  trackBed.position.y = 6;
  trackBed.receiveShadow = true;
  group.add(trackBed);

  const railMat = new THREE.MeshStandardMaterial({ color: 0xb7b7b7, metalness: 0.9, roughness: 0.35 });
  const railL = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.2, 60), railMat);
  railL.position.set(-3.5, 8.7, 0);
  group.add(railL);
  const railR = railL.clone();
  railR.position.set(3.5, 8.7, 0);
  group.add(railR);

  // sleepers + bolts
  const sleeperMat = new THREE.MeshStandardMaterial({ color: 0x3e2723, roughness: 0.95, metalness: 0.05 });
  const boltGeo = new THREE.SphereGeometry(0.15, 8, 8);
  const boltMat = new THREE.MeshStandardMaterial({ color: 0x444444, metalness: 0.85, roughness: 0.25 });

  for (let i = 0; i < 15; i++) {
    const sleeper = new THREE.Mesh(new THREE.BoxGeometry(10, 0.6, 2.2), sleeperMat);
    sleeper.position.set(0, 8.25, -25 + i * 3.5);
    sleeper.castShadow = true;
    group.add(sleeper);

    for (let b = 0; b < 4; b++) {
      const bolt = new THREE.Mesh(boltGeo, boltMat);
      const bx = b < 2 ? -3.5 : 3.5;
      const bz = (b % 2 === 0) ? -0.7 : 0.7;
      bolt.position.set(bx, 8.55, sleeper.position.z + bz);
      group.add(bolt);
    }
  }

  // Water jets: slightly thicker and brighter
  const waterMat = new THREE.MeshBasicMaterial({ color: 0xdff7ff, transparent: true, opacity: 0.65 });
  const jetsGroup = new THREE.Group();
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    const start = new THREE.Vector3(Math.cos(angle) * 25, 5, Math.sin(angle) * 25);
    const end = new THREE.Vector3(Math.cos(angle) * 10, 5, Math.sin(angle) * 10);
    const arc = new THREE.Mesh(createWaterArc(start, end, 9), waterMat);
    jetsGroup.add(arc);
  }
  group.add(jetsGroup);
  group.userData.jets = jetsGroup;

  // LOCOMOTIVE – mehr “Metall/Gold” Details
  const locoGroup = new THREE.Group();
  locoGroup.position.set(0, 9.5, -5);

  const blackM = new THREE.MeshStandardMaterial({ color: 0x121212, roughness: 0.55, metalness: 0.25 });
  const redM = new THREE.MeshStandardMaterial({ color: 0x8b1111, roughness: 0.55, metalness: 0.15 });
  const goldM = new THREE.MeshPhysicalMaterial({ color: 0xffd36a, metalness: 1.0, roughness: 0.25, clearcoat: 0.2 });

  const boiler = new THREE.Mesh(new THREE.CylinderGeometry(5.2, 5.2, 22.5, 28), blackM);
  boiler.rotation.x = Math.PI / 2;
  boiler.position.y = 7;
  locoGroup.add(boiler);

  // boiler rings
  const ringMat2 = new THREE.MeshStandardMaterial({ color: 0x2b2b2b, metalness: 0.85, roughness: 0.25 });
  for (let r = 0; r < 4; r++) {
    const rr = new THREE.Mesh(new THREE.TorusGeometry(5.25, 0.18, 10, 40), ringMat2);
    rr.rotation.y = Math.PI / 2;
    rr.position.set(0, 7, -8 + r * 5.6);
    locoGroup.add(rr);
  }

  const cab = new THREE.Mesh(new THREE.BoxGeometry(11.2, 14.2, 10.2), redM);
  cab.position.set(0, 9, 14);
  locoGroup.add(cab);

  const roof = new THREE.Mesh(new THREE.BoxGeometry(13.6, 1.1, 14.6), blackM);
  roof.position.set(0, 16, 14);
  locoGroup.add(roof);

  // windows (simple)
  const winMat = new THREE.MeshPhysicalMaterial({ transmission: 0.9, transparent: true, opacity: 0.25, roughness: 0.15, thickness: 0.3 });
  const win1 = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 3.2), winMat);
  win1.position.set(-4.2, 11, 19.2);
  locoGroup.add(win1);
  const win2 = win1.clone();
  win2.position.x = 4.2;
  locoGroup.add(win2);

  const stackBase = new THREE.Mesh(new THREE.CylinderGeometry(2.1, 2.1, 2.2, 20), blackM);
  stackBase.position.set(0, 12, -8);
  locoGroup.add(stackBase);

  const stackTop = new THREE.Mesh(new THREE.CylinderGeometry(2.7, 1.6, 5.4, 20), blackM);
  stackTop.position.set(0, 15, -8);
  locoGroup.add(stackTop);

  const cow = new THREE.Mesh(new THREE.ConeGeometry(5.2, 6.2, 10, 1, true, 0, Math.PI), blackM);
  cow.rotation.set(-Math.PI / 2, 0, Math.PI);
  cow.position.set(0, 2, -13);
  locoGroup.add(cow);

  const light = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 2.2, 18), goldM);
  light.rotation.x = Math.PI / 2;
  light.position.set(0, 12, -12);
  locoGroup.add(light);

  // headlight glow
  const glow = new THREE.PointLight(0xffddaa, 1.2, 35);
  glow.position.set(0, 12, -14.5);
  locoGroup.add(glow);

  // wheels
  const wheelGeo = new THREE.CylinderGeometry(4.1, 4.1, 1.1, 28);
  const rodMat = new THREE.MeshStandardMaterial({ color: 0xbdbdbd, metalness: 0.9, roughness: 0.25 });

  [-4, 4, 11].forEach((z) => {
    const wL = new THREE.Mesh(wheelGeo, redM);
    wL.rotation.z = Math.PI / 2;
    wL.position.set(-3.7, 4, z);
    locoGroup.add(wL);

    const wR = new THREE.Mesh(wheelGeo, redM);
    wR.rotation.z = Math.PI / 2;
    wR.position.set(3.7, 4, z);
    locoGroup.add(wR);

    const rodL = new THREE.Mesh(new THREE.BoxGeometry(0.55, 1.0, 18.2), rodMat);
    rodL.position.set(-4.1, 2, 3.5);
    locoGroup.add(rodL);

    const rodR = new THREE.Mesh(new THREE.BoxGeometry(0.55, 1.0, 18.2), rodMat);
    rodR.position.set(4.1, 2, 3.5);
    locoGroup.add(rodR);
  });

  // tender
  const tender = new THREE.Group();
  tender.position.z = 24;

  const tBody = new THREE.Mesh(new THREE.BoxGeometry(10.2, 8.2, 14.2), blackM);
  tBody.position.y = 6;
  tender.add(tBody);

  for (let i = 0; i < 18; i++) {
    const coal = new THREE.Mesh(new THREE.DodecahedronGeometry(1.55), new THREE.MeshStandardMaterial({ color: 0x070707, roughness: 1.0 }));
    coal.position.set((Math.random() - 0.5) * 8, 10, (Math.random() - 0.5) * 10);
    tender.add(coal);
  }

  const smallWheel = new THREE.CylinderGeometry(2.1, 2.1, 1.1, 20);
  [-3, 3].forEach((z) => {
    const wL = new THREE.Mesh(smallWheel, blackM);
    wL.rotation.z = Math.PI / 2;
    wL.position.set(-3.7, 2, z);
    tender.add(wL);

    const wR = new THREE.Mesh(smallWheel, blackM);
    wR.rotation.z = Math.PI / 2;
    wR.position.set(3.7, 2, z);
    tender.add(wR);
  });

  locoGroup.add(tender);

  locoGroup.traverse((o) => {
    if (o.isMesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });

  group.add(locoGroup);

  return group;
}

// --------------------------------------------------
// 4) RAUM 2 OBJEKTE (WATT & NEWCOMEN) - DETAIL
// --------------------------------------------------

function createWattTeapot() {
  const group = new THREE.Group();

  const porcelainMat = new THREE.MeshPhysicalMaterial({
    color: 0xfffbf0,
    roughness: 0.12,
    metalness: 0.0,
    clearcoat: 0.35,
    clearcoatRoughness: 0.25
  });

  const brassMat = new THREE.MeshPhysicalMaterial({
    color: 0xc7b06b,
    metalness: 1.0,
    roughness: 0.28,
    clearcoat: 0.1
  });

  // Körper (Lathe)
  const points = [];
  for (let i = 0; i < 10; i++) points.push(new THREE.Vector2(Math.sin(i * 0.2) * 4 + 1, (i - 5) * 0.8));
  const body = new THREE.Mesh(new THREE.LatheGeometry(points, 48), porcelainMat);
  body.position.y = 4;
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  const bodyCap = new THREE.Mesh(new THREE.CircleGeometry(3.4, 48), porcelainMat);
  bodyCap.rotation.x = -Math.PI / 2;
  bodyCap.position.y = 7.5;
  group.add(bodyCap);

  const baseRing = new THREE.Mesh(new THREE.TorusGeometry(4.9, 0.22, 18, 80), brassMat);
  baseRing.rotation.x = Math.PI / 2;
  baseRing.position.y = 0.5;
  group.add(baseRing);

  const neckRing = new THREE.Mesh(new THREE.TorusGeometry(3.6, 0.22, 18, 80), brassMat);
  neckRing.rotation.x = Math.PI / 2;
  neckRing.position.y = 7.5;
  group.add(neckRing);

  // Lid
  const lidGroup = new THREE.Group();
  lidGroup.position.y = 7.8;

  const lidBase = new THREE.Mesh(
    new THREE.SphereGeometry(3.55, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2.6),
    porcelainMat
  );
  lidGroup.add(lidBase);

  const lidPlug = new THREE.Mesh(new THREE.CircleGeometry(3.45, 48), porcelainMat);
  lidPlug.rotation.x = -Math.PI / 2;
  lidGroup.add(lidPlug);

  const lidKnob = new THREE.Mesh(new THREE.SphereGeometry(0.85, 18, 18), brassMat);
  lidKnob.position.y = 2.55;
  lidGroup.add(lidKnob);

  group.add(lidGroup);
  group.userData.lid = lidGroup;

  // Handle + spout
  const handleCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-2.5, 5.5, 0),
    new THREE.Vector3(-7.2, 8.2, 0),
    new THREE.Vector3(-8.3, 4.2, 0),
    new THREE.Vector3(-2.5, 1.5, 0),
  ]);
  const handle = new THREE.Mesh(new THREE.TubeGeometry(handleCurve, 48, 0.62, 10, false), porcelainMat);
  handle.castShadow = true;
  group.add(handle);

  const spoutCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(2.5, 2, 0),
    new THREE.Vector3(7.2, 5.2, 0),
    new THREE.Vector3(8.2, 9.2, 0),
  ]);
  const spout = new THREE.Mesh(new THREE.TubeGeometry(spoutCurve, 48, 0.82, 10, false), porcelainMat);
  spout.castShadow = true;
  group.add(spout);

  // Steam: softer
  const steamGroup = new THREE.Group();
  steamGroup.position.set(8, 9, 0);

  const puffMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.22 });
  for (let i = 0; i < 7; i++) {
    const puff = new THREE.Mesh(new THREE.SphereGeometry(0.65, 10, 10), puffMat);
    puff.position.y = i * 1.0;
    puff.scale.setScalar(0.45 + i * 0.42);
    steamGroup.add(puff);
  }
  group.add(steamGroup);
  group.userData.steam = steamGroup;

  return group;
}

function createNewcomenAnvil() {
  const group = new THREE.Group();

  const ironMat = new THREE.MeshStandardMaterial({ color: 0x383838, roughness: 0.75, metalness: 0.65 });
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x4a342e, roughness: 0.95, metalness: 0.05 });
  const bandMat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.9, roughness: 0.35 });

  // stump + rings
  const log = new THREE.Mesh(new THREE.CylinderGeometry(5.6, 6.8, 7.2, 18), woodMat);
  log.position.y = 3.6;
  log.castShadow = true;
  log.receiveShadow = true;
  group.add(log);

  const band1 = new THREE.Mesh(new THREE.TorusGeometry(6.2, 0.32, 10, 40), bandMat);
  band1.rotation.x = Math.PI / 2;
  band1.position.y = 1;
  group.add(band1);

  const band2 = new THREE.Mesh(new THREE.TorusGeometry(6.0, 0.32, 10, 40), bandMat);
  band2.rotation.x = Math.PI / 2;
  band2.position.y = 6.1;
  group.add(band2);

  const anvilGroup = new THREE.Group();
  anvilGroup.position.y = 7;

  const base = new THREE.Mesh(new THREE.BoxGeometry(7.2, 2.1, 6.2), ironMat);
  base.position.y = 1.05;
  anvilGroup.add(base);

  const waist = new THREE.Mesh(new THREE.BoxGeometry(5.1, 3.1, 4.1), ironMat);
  waist.position.y = 3.6;
  anvilGroup.add(waist);

  const topBlock = new THREE.Mesh(new THREE.BoxGeometry(6.2, 3.1, 8.2), ironMat);
  topBlock.position.y = 6.55;
  anvilGroup.add(topBlock);

  const horn = new THREE.Mesh(new THREE.ConeGeometry(2.05, 6.2, 36), ironMat);
  horn.rotation.x = Math.PI / 2;
  horn.position.set(0, 6.5, 7);
  anvilGroup.add(horn);

  const heel = new THREE.Mesh(new THREE.BoxGeometry(6.2, 3.1, 4.2), ironMat);
  heel.position.set(0, 6.55, -6);
  anvilGroup.add(heel);

  // Hammer: nicer wood + iron head
  const hammer = new THREE.Group();
  hammer.position.set(2.1, 8.6, 0);
  hammer.rotation.set(0, 0.55, 0.22);

  const hHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 8.2, 14), new THREE.MeshStandardMaterial({ color: 0x8d6e63, roughness: 0.9 }));
  hHandle.rotation.x = Math.PI / 2;
  hammer.add(hHandle);

  const hHead = new THREE.Mesh(new THREE.BoxGeometry(2.6, 2.05, 5.2), ironMat);
  hHead.rotation.set(0, Math.PI / 2, 0);
  hHead.position.z = 4;
  hammer.add(hHead);

  anvilGroup.add(hammer);
  group.add(anvilGroup);

  group.traverse((o) => {
        if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; }
  });

  return group;
}

// --------------------------------------------------
// 5) RAUM 3 MINIATUREN - DETAIL
// --------------------------------------------------

function createMiniMountain() {
  const group = new THREE.Group();

  const rockTex = createRockTexture();
  applyTextureDefaults(rockTex, 2, 2);

  const rockMat = new THREE.MeshStandardMaterial({
    map: rockTex,
    color: 0xffffff,
    roughness: 0.95,
    metalness: 0.05,
    flatShading: true
  });

  // Hauptkörper (etwas organischer)
  const mainPeak = new THREE.Mesh(new THREE.DodecahedronGeometry(7.4, 1), rockMat);
  mainPeak.position.y = 4;
  mainPeak.castShadow = true;
  mainPeak.receiveShadow = true;
  group.add(mainPeak);

  const sidePeak = new THREE.Mesh(new THREE.DodecahedronGeometry(5.2, 1), rockMat);
  sidePeak.position.set(-4.3, 2.2, 2.1);
  sidePeak.castShadow = true;
  sidePeak.receiveShadow = true;
  group.add(sidePeak);

  const sidePeak2 = new THREE.Mesh(new THREE.DodecahedronGeometry(4.2, 1), rockMat);
  sidePeak2.position.set(3.2, 1.2, 3.3);
  sidePeak2.castShadow = true;
  sidePeak2.receiveShadow = true;
  group.add(sidePeak2);

  // “Geröll” am Fuß
  const gravelMat = new THREE.MeshStandardMaterial({
    map: rockTex,
    color: 0xffffff,
    roughness: 1.0,
    metalness: 0.0
  });

  for (let i = 0; i < 12; i++) {
    const s = 0.35 + Math.random() * 0.55;
    const stone = new THREE.Mesh(new THREE.DodecahedronGeometry(s, 0), gravelMat);
    stone.position.set((Math.random() - 0.5) * 9, 0.6 + Math.random() * 1.3, (Math.random() - 0.5) * 9);
    stone.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    stone.castShadow = true;
    stone.receiveShadow = true;
    group.add(stone);
  }

  // Eingang
  const entrance = new THREE.Group();
  entrance.position.set(0, 2.1, 6.2);

  const woodTex = makeCanvasTexture((ctx, w, h) => {
    ctx.fillStyle = "#5b3a2e";
    ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = 0.25;
    for (let i = 0; i < 80; i++) {
      ctx.strokeStyle = `rgba(0,0,0,${0.05 + Math.random() * 0.12})`;
      ctx.lineWidth = 1 + Math.random() * 2;
      ctx.beginPath();
      const y = Math.random() * h;
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(w * 0.3, y + (Math.random() - 0.5) * 20, w * 0.7, y + (Math.random() - 0.5) * 20, w, y);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }, 256, 256);
  applyTextureDefaults(woodTex, 1, 1);

  const woodMat = new THREE.MeshStandardMaterial({ map: woodTex, color: 0xffffff, roughness: 0.9, metalness: 0.05 });
  const ironMat = new THREE.MeshStandardMaterial({ color: 0x3b3b3b, metalness: 0.85, roughness: 0.35 });

  const beam1 = new THREE.Mesh(new THREE.BoxGeometry(1.1, 6.2, 1.1), woodMat);
  beam1.position.x = -2.1;
  beam1.castShadow = true;
  entrance.add(beam1);

  const beam2 = new THREE.Mesh(new THREE.BoxGeometry(1.1, 6.2, 1.1), woodMat);
  beam2.position.x = 2.1;
  beam2.castShadow = true;
  entrance.add(beam2);

  const beam3 = new THREE.Mesh(new THREE.BoxGeometry(6.4, 1.1, 1.1), woodMat);
  beam3.position.y = 2.7;
  beam3.castShadow = true;
  entrance.add(beam3);

  // Metallplatten + Nieten
  const plate = new THREE.Mesh(new THREE.BoxGeometry(6.6, 0.25, 1.2), ironMat);
  plate.position.set(0, 3.25, 0.15);
  plate.castShadow = true;
  entrance.add(plate);

  addRivetsOnBox(plate, 6.6, 0.25, 1.2, 10, 0x777777);

  // Loch (schwarz) + leichter “Glow”
  const darkHole = new THREE.Mesh(new THREE.CircleGeometry(2.55, 20), new THREE.MeshBasicMaterial({ color: 0x000000 }));
  darkHole.position.z = 0.35;
  entrance.add(darkHole);

  const caveGlow = new THREE.PointLight(0xffaa55, 0.6, 18);
  caveGlow.position.set(0, 1.5, 1.5);
  entrance.add(caveGlow);

  group.add(entrance);

  group.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return group;
}

function createMiniFactory() {
  const group = new THREE.Group();

  // Brick texture (optional: use createBrickTexture but with smaller repeat)
  const brickTex = createBrickTexture();
  applyTextureDefaults(brickTex, 2, 2);

  const brickMat = new THREE.MeshStandardMaterial({
    map: brickTex,
    color: 0xffffff,
    roughness: 0.9,
    metalness: 0.05
  });

  const roofMat = new THREE.MeshStandardMaterial({ color: 0x2b2b2b, roughness: 0.65, metalness: 0.15 });

  // Body
  const building = new THREE.Mesh(new THREE.BoxGeometry(12.4, 8.4, 8.4), brickMat);
  building.position.y = 4.2;
  building.castShadow = true;
  building.receiveShadow = true;
  group.add(building);

  // Window insets (fake)
  const winMat = new THREE.MeshPhysicalMaterial({
    transmission: 0.9,
    transparent: true,
    opacity: 0.18,
    roughness: 0.2,
    metalness: 0,
    thickness: 0.25,
    ior: 1.45
  });

  for (let i = 0; i < 3; i++) {
    const win = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 2.2), winMat);
    win.position.set(-5.9, 4.6, -2.5 + i * 2.5);
    win.rotation.y = Math.PI / 2;
    group.add(win);
  }

  // Roof (zweiteilig)
  const roof1 = new THREE.Mesh(
    new THREE.CylinderGeometry(0, 5.2, 8.4, 4, 1, false, Math.PI / 4, Math.PI / 2),
    roofMat
  );
  roof1.rotation.z = Math.PI / 2;
  roof1.rotation.y = Math.PI / 2;
  roof1.position.set(-3.2, 8.6, 0);
  roof1.castShadow = true;
  group.add(roof1);

  const roof2 = roof1.clone();
  roof2.position.set(3.2, 8.6, 0);
  group.add(roof2);

  // Chimney
  const chimney = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.6, 12.4, 10), brickMat);
  chimney.position.set(4.2, 6.2, -3.1);
  chimney.castShadow = true;
  chimney.receiveShadow = true;
  group.add(chimney);

  // Smoke (weicher + mehr Puffs)
  const smokeGroup = new THREE.Group();
  smokeGroup.position.set(4.2, 13.0, -3.1);

  const smokeMat = new THREE.MeshBasicMaterial({ color: 0xf0f0f0, transparent: true, opacity: 0.35 });

  for (let i = 0; i < 5; i++) {
    const p = new THREE.Mesh(new THREE.SphereGeometry(0.85, 10, 10), smokeMat);
    p.position.y = i * 1.2;
    p.position.x = i * 0.35;
    p.position.z = (Math.random() - 0.5) * 0.6;
    p.scale.setScalar(1 + i * 0.35);
    smokeGroup.add(p);
  }

  group.add(smokeGroup);
  group.userData.smoke = smokeGroup;

  group.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return group;
}

// --------------------------------------------------
// 6) GROSSE SZENEN FÜR RAUM 4 & 5 - DETAIL/ATMOSPHÄRE
// --------------------------------------------------

function createMineCave() {
  const group = new THREE.Group();

  const rockTex = createRockTexture();
  applyTextureDefaults(rockTex, 2, 2);

  const caveGeo = new THREE.SphereGeometry(120, 48, 48);
  const caveMat = new THREE.MeshStandardMaterial({
    map: rockTex,
    color: 0x2b2b2b,
    side: THREE.BackSide,
    roughness: 1.0,
    metalness: 0.0
  });

  const cave = new THREE.Mesh(caveGeo, caveMat);
  cave.receiveShadow = true;
  group.add(cave);

  // “Boden” / Wasserpfütze
  const water = new THREE.Mesh(
    new THREE.CircleGeometry(110, 48),
    new THREE.MeshPhysicalMaterial({
      color: 0x002244,
      transmission: 0.55,
      transparent: true,
      opacity: 0.75,
      roughness: 0.08,
      metalness: 0.0,
      ior: 1.33,
      thickness: 0.8
    })
  );
  water.rotation.x = -Math.PI / 2;
  water.position.y = -10;
  group.add(water);

  // Holzstützen/Träger (einfach, aber wirkt sofort)
  const woodTex = makeCanvasTexture((ctx, w, h) => {
    ctx.fillStyle = "#5b3a2e";
    ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = 0.25;
    for (let i = 0; i < 90; i++) {
      ctx.strokeStyle = `rgba(0,0,0,${0.06 + Math.random() * 0.14})`;
      ctx.lineWidth = 1 + Math.random() * 2;
      ctx.beginPath();
      const y = Math.random() * h;
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(w * 0.3, y + (Math.random() - 0.5) * 18, w * 0.7, y + (Math.random() - 0.5) * 18, w, y);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }, 512, 512);
  applyTextureDefaults(woodTex, 1, 1);

  const timberMat = new THREE.MeshStandardMaterial({ map: woodTex, color: 0xffffff, roughness: 0.95, metalness: 0.05 });

  for (let i = 0; i < 10; i++) {
    const z = -70 + i * 14;
    const frame = new THREE.Group();
    frame.position.set(0, -5, z);

    const postL = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.7, 18, 10), timberMat);
    postL.position.set(-14, 2, 0);
    const postR = postL.clone();
    postR.position.x = 14;

    const beam = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.5, 32, 10), timberMat);
    beam.rotation.z = Math.PI / 2;
    beam.position.set(0, 10, 0);

    postL.castShadow = postR.castShadow = beam.castShadow = true;
    frame.add(postL, postR, beam);

    // leichte Variation
    frame.rotation.y = (Math.random() - 0.5) * 0.12;
    group.add(frame);
  }

  // warmes “Lampenlicht” in der Tiefe
  const warm = new THREE.PointLight(0xffaa55, 1.2, 220);
  warm.position.set(0, 15, -60);
  warm.castShadow = false;
  group.add(warm);

  // kaltes Fülllicht
  const cool = new THREE.PointLight(0x88aaff, 0.55, 160);
  cool.position.set(40, 10, 30);
  group.add(cool);

  return group;
}

function createDeepMineNewcomen() {
  const group = new THREE.Group();

  const woodMat = new THREE.MeshStandardMaterial({ color: 0x5b3a2e, roughness: 0.95, metalness: 0.05 });
  const ironMat = new THREE.MeshStandardMaterial({ color: 0x2f2f2f, roughness: 0.7, metalness: 0.75 });
  const copperMat = new THREE.MeshPhysicalMaterial({ color: 0xc47c3c, roughness: 0.45, metalness: 0.95, clearcoat: 0.1 });
  const rockTex = createRockTexture();
  applyTextureDefaults(rockTex, 2, 2);

  const rockMat = new THREE.MeshStandardMaterial({ map: rockTex, color: 0xffffff, roughness: 1.0, metalness: 0.0, side: THREE.BackSide });

  const waterMat = new THREE.MeshPhysicalMaterial({
    color: 0x0a5aa0,
    transmission: 0.55,
    transparent: true,
    opacity: 0.75,
    roughness: 0.08,
    metalness: 0.0,
    ior: 1.33,
    thickness: 0.8
  });

  // Schacht
  const shaftGroup = new THREE.Group();
  shaftGroup.position.y = -20;

  const shaftWalls = new THREE.Mesh(new THREE.BoxGeometry(30, 40, 30), rockMat);
  shaftGroup.add(shaftWalls);

  const waterLevel = new THREE.Mesh(new THREE.BoxGeometry(28, 15, 28), waterMat);
  waterLevel.position.y = -12;
  shaftGroup.add(waterLevel);
  group.userData.waterLevel = waterLevel;

  // Pumpenstange runter
  const deepPumpRod = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 45, 14), ironMat);
  deepPumpRod.position.set(-12, 5, 0);
  shaftGroup.add(deepPumpRod);
  group.userData.rodL = deepPumpRod;

    // --------------------------------------------------
  // NEU: Schlauch/Rohr + Wasser-Auslass (zeigt: Wasser wird gepumpt)
  // --------------------------------------------------

  // Rohr-Material (leicht metallisch)
  const pipeMat = new THREE.MeshStandardMaterial({
    color: 0x3b3b3b,
    roughness: 0.45,
    metalness: 0.85,
    side: THREE.DoubleSide
  });

  // Rohrverlauf: vom Schacht (unten links) nach außen rechts (hoch)
  const hoseCurve = new THREE.CatmullRomCurve3([
  new THREE.Vector3(-12, 6, 0),     // Start: oberhalb Wasser
  new THREE.Vector3(-18, 10, 6),
  new THREE.Vector3(-10, 14, 16),
  new THREE.Vector3(6, 15, 18),
  new THREE.Vector3(20, 14, 10)     // Auslass sichtbar vorne/rechts
]);

  const hoseGeo = new THREE.TubeGeometry(hoseCurve, 80, 0.55, 10, false);
  const hose = new THREE.Mesh(hoseGeo, pipeMat);
  hose.castShadow = true;
  hose.receiveShadow = true;

  // wichtig: hose muss an shaftGroup oder group hängen – ich hänge sie an shaftGroup,
  // damit sie "zur Schacht-Logik" gehört
  group.add(hose);

  // Auslassposition (letzter Punkt der Kurve)
  const outlet = hoseCurve.getPoint(1.0);


 // --------------------------------------------
// WATER FX: Jet + Spritzer + Pfütze
// --------------------------------------------
const waterJetMat = new THREE.MeshPhysicalMaterial({
  color: 0x2aa7ff,
  transmission: 0.55,
  transparent: true,
  opacity: 0.75,
  roughness: 0.08,
  metalness: 0.0,
  ior: 1.33,
  thickness: 0.6
});

// Jet: konisch -> wirkt wie Wasserstrahl
const waterJet = new THREE.Mesh(
  new THREE.CylinderGeometry(0.25, 0.85, 14, 18, 1, true),
  waterJetMat
);
waterJet.position.copy(outlet).add(new THREE.Vector3(0, -10, 0));
waterJet.rotation.set(0, 0, 0);
waterJet.castShadow = false;

// Startwerte
waterJet.scale.set(1, 0.15, 1);
waterJet.material.opacity = 0.15;
group.add(waterJet);

// Spritzer-Partikel (kleine Kugeln)
const sprayGroup = new THREE.Group();
sprayGroup.position.copy(outlet); // direkt am Auslass
group.add(sprayGroup);

const dropMat = new THREE.MeshBasicMaterial({
  color: 0xdff7ff,
  transparent: true,
  opacity: 0.55
});

for (let i = 0; i < 24; i++) {
  const drop = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), dropMat);
  // “inaktiv” starten
  drop.visible = false;
  drop.userData.vel = new THREE.Vector3();
  drop.userData.life = 0;
  sprayGroup.add(drop);
}

// kleine Pfütze unten (wo Wasser landet)
const puddle = new THREE.Mesh(
  new THREE.CircleGeometry(7, 28),
  new THREE.MeshPhysicalMaterial({
    color: 0x0a4f8a,
    transmission: 0.45,
    transparent: true,
    opacity: 0.55,
    roughness: 0.05,
    metalness: 0.0,
    ior: 1.33,
    thickness: 0.4
  })
);
puddle.rotation.x = -Math.PI / 2;
puddle.position.copy(outlet).add(new THREE.Vector3(0, -23, 6)); // leicht nach vorne versetzt
group.add(puddle);

// für animate()
group.userData.pumpedWater = waterJet;
group.userData.sprayGroup = sprayGroup;
group.userData.puddle = puddle;


  group.add(shaftGroup);

  // Fundament
  const machineBase = new THREE.Mesh(new THREE.BoxGeometry(32, 2.2, 32), new THREE.MeshStandardMaterial({ map: rockTex, color: 0xffffff, roughness: 1.0 }));
  machineBase.position.y = 1.1;
  machineBase.receiveShadow = true;
  group.add(machineBase);

  // Pfeiler
  const pillar = new THREE.Mesh(new THREE.BoxGeometry(6.4, 22.5, 6.4), new THREE.MeshStandardMaterial({ map: createBrickTexture(), color: 0xffffff, roughness: 0.9 }));
  pillar.position.y = 12;
  pillar.castShadow = true;
  pillar.receiveShadow = true;
  group.add(pillar);

  // Balancierbalken
  const beamGroup = new THREE.Group();
  beamGroup.position.y = 23;

  const beam = new THREE.Mesh(new THREE.BoxGeometry(28.5, 2.7, 1.7), woodMat);
  beam.castShadow = true;

  // Bögen
  const arcGeo = new THREE.CylinderGeometry(5.1, 5.1, 1.7, 18, 1, false, 0, Math.PI);
  const arcL = new THREE.Mesh(arcGeo, woodMat);
  arcL.rotation.set(Math.PI / 2, 0, Math.PI / 2);
  arcL.position.x = -14.25;
  

  const arcR = arcL.clone();
  arcR.position.x = 14.25;

  beam.add(arcL);
  beam.add(arcR);

  // kleine “Eisenbänder” am Balken (optisch)
  const strapMat = new THREE.MeshStandardMaterial({ color: 0x3c3c3c, metalness: 0.9, roughness: 0.35 });
  for (let i = 0; i < 5; i++) {
    const strap = new THREE.Mesh(new THREE.BoxGeometry(0.35, 2.85, 1.85), strapMat);
    strap.position.set(-10 + i * 5, 0, 0);
    beam.add(strap);
  }

  beamGroup.add(beam);
  group.add(beamGroup);
  group.userData.beam = beamGroup;

  // Zylinder + Boiler
  const cylinder = new THREE.Mesh(new THREE.CylinderGeometry(4.15, 4.15, 10.4, 28), ironMat);
  cylinder.position.set(14.2, 6.2, 0);
  cylinder.castShadow = true;
  group.add(cylinder);

  const boiler = new THREE.Mesh(new THREE.SphereGeometry(6.2, 36, 18, 0, Math.PI * 2, 0, Math.PI / 2), copperMat);
  boiler.position.set(14.2, 1.2, 0);
  boiler.castShadow = true;
  group.add(boiler);

  // Kolbenstange
  const cylRod = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.65, 14.4, 12), ironMat);
  cylRod.position.set(14.2, 16.2, 0);
  cylRod.castShadow = true;
  group.add(cylRod);
  group.userData.rodR = cylRod;

  // warmes Licht nahe Boiler
  const boilerGlow = new THREE.PointLight(0xffaa55, 0.9, 70);
  boilerGlow.position.set(14.2, 4, 4);
  group.add(boilerGlow);

  group.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return group;
}
 /////////////////////////////////
function createFactoryWatt() {
  const group = new THREE.Group();

  // ---------- Materialien ----------
  const ironMat = new THREE.MeshStandardMaterial({ color: 0x263645, roughness: 0.45, metalness: 0.88 });
  const ironDarkMat = new THREE.MeshStandardMaterial({ color: 0x1b2430, roughness: 0.55, metalness: 0.85 });
  const brassMat = new THREE.MeshStandardMaterial({ color: 0xbfa04a, roughness: 0.35, metalness: 0.9 });
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x5b3a2e, roughness: 0.95, metalness: 0.05 });
  const stoneMat = new THREE.MeshStandardMaterial({ color: 0x666666, roughness: 0.95, metalness: 0.02 });

  const flyWheelMat = new THREE.MeshStandardMaterial({ color: 0x141414, roughness: 0.55, metalness: 0.6 });

  const beltTex = createBeltTexture();
  beltTex.wrapS = beltTex.wrapT = THREE.RepeatWrapping;
  beltTex.repeat.set(1, 2);
  const beltMat = new THREE.MeshStandardMaterial({
    map: beltTex,
    roughness: 1.0,
    metalness: 0.05,
    side: THREE.DoubleSide
  });

  // kleine Helper
  const boltMat = new THREE.MeshStandardMaterial({ color: 0x808080, metalness: 0.9, roughness: 0.25 });
  const boltGeo = new THREE.SphereGeometry(0.22, 10, 10);

  function addBoltsOnPlate(parent, w, h, z, countX, countY) {
    for (let ix = 0; ix < countX; ix++) {
      for (let iy = 0; iy < countY; iy++) {
        const b = new THREE.Mesh(boltGeo, boltMat);
        const x = -w / 2 + (ix + 0.5) * (w / countX);
        const y = -h / 2 + (iy + 0.5) * (h / countY);
        b.position.set(x, y, z);
        parent.add(b);
      }
    }
  }

  function createFlatBeltFromCurve(curve, segments, width, mat) {
  const belt = new THREE.Group();
  const p = new THREE.Vector3();
  const t = new THREE.Vector3();
  const up = new THREE.Vector3(0, 1, 0);

  for (let i = 0; i < segments; i++) {
    const a = i / segments;
    const b = (i + 1) / segments;

    const p1 = curve.getPointAt(a);
    const p2 = curve.getPointAt(b);

    const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
    const dir = new THREE.Vector3().subVectors(p2, p1);
    const len = dir.length();
    dir.normalize();

    // Quer-Vektor, damit Band Breite bekommt
    t.copy(dir).cross(up).normalize();
    if (t.lengthSq() < 1e-6) t.set(1, 0, 0); // Fallback falls dir parallel zu up

    const geom = new THREE.PlaneGeometry(width, len);
    const seg = new THREE.Mesh(geom, mat);

    // Plane ist standardmäßig in XY, wir wollen: Breite entlang X, Länge entlang Y
    // Ausrichten: Y der Plane soll in dir zeigen
    seg.position.copy(mid);

    // LookAt richtet -Z, daher bauen wir eine Basis:
    // Wir nehmen dir als "up" der Plane (Y), t als "right" (X), normal als "forward"
    const normal = new THREE.Vector3().crossVectors(t, dir).normalize();
    const m = new THREE.Matrix4().makeBasis(t, dir, normal);
    seg.setRotationFromMatrix(m);

    belt.add(seg);
  }

  // Für Animation (texture scroll) merken:
  belt.userData.isFlatBelt = true;
  return belt;
}

  // ---------- Fundament / Base ----------
  const base = new THREE.Mesh(new THREE.BoxGeometry(42, 2.4, 22), stoneMat);
  base.position.y = 1.2;
  base.castShadow = true;
  base.receiveShadow = true;
  group.add(base);

  // Base-Rand (Kante)
  const baseLip = new THREE.Mesh(new THREE.BoxGeometry(42.6, 0.8, 22.6), ironDarkMat);
  baseLip.position.y = 2.4;
  baseLip.castShadow = true;
  baseLip.receiveShadow = true;
  group.add(baseLip);

  // Schrauben an den Ecken
  const cornerBolt = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 1.2, 12), boltMat);
  [
    [-19.5, 2.9, -9.5], [19.5, 2.9, -9.5],
    [-19.5, 2.9,  9.5], [19.5, 2.9,  9.5],
  ].forEach(p => {
    const c = cornerBolt.clone();
    c.position.set(p[0], p[1], p[2]);
    group.add(c);
  });

  // ---------- Rahmen ----------
  const frameGroup = new THREE.Group();
  group.add(frameGroup);

  const postGeo = new THREE.BoxGeometry(2.4, 22.8, 2.4);
  const f1 = new THREE.Mesh(postGeo, woodMat);
  f1.position.set(-2.6, 12.6, 0);
  f1.rotation.z = 0.10;
  frameGroup.add(f1);

  const f2 = new THREE.Mesh(postGeo, woodMat);
  f2.position.set(2.6, 12.6, 0);
  f2.rotation.z = -0.10;
  frameGroup.add(f2);

  // Querträger oben
  const cross = new THREE.Mesh(new THREE.BoxGeometry(8.6, 1.4, 2.6), woodMat);
  cross.position.set(0, 23.4, 0);
  frameGroup.add(cross);

  // Diagonalstreben (macht es sofort “realer”)
  const diagGeo = new THREE.BoxGeometry(0.9, 16, 0.9);
  const d1 = new THREE.Mesh(diagGeo, woodMat);
  d1.position.set(-1.4, 13.2, 0);
  d1.rotation.z = 0.55;
  frameGroup.add(d1);

  const d2 = new THREE.Mesh(diagGeo, woodMat);
  d2.position.set(1.4, 13.2, 0);
  d2.rotation.z = -0.55;
  frameGroup.add(d2);

  // Metallbeschläge am Rahmenfuß
  const shoeMat = ironMat;
  const shoeGeo = new THREE.BoxGeometry(3.2, 1.2, 3.2);
  const shoe1 = new THREE.Mesh(shoeGeo, shoeMat);
  shoe1.position.set(-2.6, 3.1, 0);
  frameGroup.add(shoe1);

  const shoe2 = shoe1.clone();
  shoe2.position.x = 2.6;
  frameGroup.add(shoe2);

  // ---------- Balancierbalken (animiert) ----------
  const beamGroup = new THREE.Group();
  beamGroup.position.y = 22.9;

  // Hauptbalken
  const beam = new THREE.Mesh(new THREE.BoxGeometry(26.0, 1.8, 1.4), ironMat);
  beam.castShadow = true;

  // “Kappen” an den Enden
  const capGeo = new THREE.BoxGeometry(1.2, 2.4, 2.0);
  const capL = new THREE.Mesh(capGeo, ironDarkMat);
  capL.position.set(-13.2, 0, 0);
  beam.add(capL);
  const capR = capL.clone();
  capR.position.x = 13.2;
  beam.add(capR);

  // Bolts auf Balken
  for (let i = 0; i < 9; i++) {
    const b = new THREE.Mesh(boltGeo, boltMat);
    b.position.set(-11.5 + i * 2.9, 1.0, 0.85);
    beam.add(b);
  }

  beamGroup.add(beam);
  group.add(beamGroup);
  group.userData.beam = beamGroup;

  // ---------- Zylinder + Ventilblock ----------
  const cylGroup = new THREE.Group();
  cylGroup.position.set(-12.0, 6.0, 0);
  group.add(cylGroup);

  const cylinder = new THREE.Mesh(new THREE.CylinderGeometry(3.3, 3.3, 10.2, 36), ironMat);
  cylinder.rotation.z = Math.PI / 2;
  cylinder.castShadow = true;
  cylGroup.add(cylinder);

  // Endkappen
  const endCapGeo = new THREE.CylinderGeometry(3.5, 3.5, 0.8, 28);
  const capA = new THREE.Mesh(endCapGeo, ironDarkMat);
  capA.rotation.z = Math.PI / 2;
  capA.position.x = -5.2;
  cylGroup.add(capA);

  const capB = capA.clone();
  capB.position.x = 5.2;
  cylGroup.add(capB);

  // Ventilblock oben
  const valve = new THREE.Mesh(new THREE.BoxGeometry(3.6, 2.6, 3.2), ironDarkMat);
  valve.position.set(0, 3.2, 0);
  cylGroup.add(valve);

  // kleines Messingventil
  const valveKnob = new THREE.Mesh(new THREE.SphereGeometry(0.55, 16, 16), brassMat);
  valveKnob.position.set(0, 4.5, 1.2);
  cylGroup.add(valveKnob);

  // “Rohr” zum Kondensator (sichtbarer)
const pipe = new THREE.Mesh(
  new THREE.CylinderGeometry(0.55, 0.55, 16, 16),
  ironMat
);

// weiter raus aus dem Zylinderbereich
pipe.position.set(0, 8, 0);

// Zylinder ist bei dir horizontal -> Rohr soll eher nach vorne rechts
pipe.rotation.set(Math.PI, 0, 0);

pipe.castShadow = true;
pipe.receiveShadow = true;

cylGroup.add(pipe);
group.userData.pipe = pipe;

 // “Rohr2” zum Flywheel (sichtbarer)
const flypipe = new THREE.Mesh(
  new THREE.CylinderGeometry(0.55, 0.55, 16, 16),
  ironMat
);

// weiter raus aus dem Zylinderbereich
flypipe.position.set(25, 8, 0);

// Zylinder ist bei dir horizontal -> Rohr soll eher nach vorne rechts
flypipe.rotation.set(Math.PI, 0, 0);

flypipe.castShadow = true;
flypipe.receiveShadow = true;

cylGroup.add(flypipe);
group.userData.flypipe = flypipe;

  // Kondensator
  const condenser = new THREE.Mesh(new THREE.BoxGeometry(4.6, 5.8, 4.6), ironMat);
  condenser.position.set(-6.8, -2.1, 3.5);
  condenser.castShadow = true;
  group.add(condenser);

  // Kondensator-Bolts
  addBoltsOnPlate(condenser, 4.0, 5.0, 2.4, 2, 3);

  // ---------- Flywheel + Achse + Lager ----------
  const flyWheelGroup = new THREE.Group();
  flyWheelGroup.position.set(11.6, 6.4, 0);
  group.add(flyWheelGroup);
  group.userData.flywheel = flyWheelGroup;

  // Radkranz
  const rim = new THREE.Mesh(new THREE.TorusGeometry(7.6, 0.7, 18, 48), flyWheelMat);
  flyWheelGroup.add(rim);

  // Mehr Speichen (statt nur 2)
  const spokeGeo = new THREE.BoxGeometry(14.2, 0.55, 0.55);
  for (let s = 0; s < 6; s++) {
    const sp = new THREE.Mesh(spokeGeo, flyWheelMat);
    sp.rotation.z = (s / 6) * Math.PI;
    flyWheelGroup.add(sp);
  }

  // Nabe
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.15, 1.8, 20), flyWheelMat);
  hub.rotation.x = Math.PI / 2;
  flyWheelGroup.add(hub);

  // Achse
  const axle = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 10, 16), ironMat);
  axle.rotation.z = Math.PI / 2;
  axle.position.z = -2.0;
  flyWheelGroup.add(axle);

  // Lagerböcke (unten)
  const bearingGeo = new THREE.BoxGeometry(2.6, 2.0, 2.6);
  const bearingL = new THREE.Mesh(bearingGeo, ironDarkMat);
  bearingL.position.set(-2.2, -3.6, 0);
  group.add(bearingL);
  const bearingR = bearingL.clone();
  bearingR.position.x = 2.2;
  group.add(bearingR);

 // PulleyPivot am Flywheel (separat animierbar, aber am selben Ort)
const pulleyPivot = new THREE.Group();

// Weltposition = Flywheel-Weltposition + Offset
pulleyPivot.position.set(
  flyWheelGroup.position.x,
  flyWheelGroup.position.y,
  flyWheelGroup.position.z + 3.4
);

group.add(pulleyPivot);

// Pulley Mesh
const pulley = new THREE.Mesh(
  new THREE.CylinderGeometry(2.3, 2.3, 4.4, 32),
  flyWheelMat
);

// Zylinderachse -> Z (damit rotation.z passt)
pulley.rotation.z = -Math.PI / 2;

pulleyPivot.add(pulley);

// Referenz speichern
group.userData.flyPulley = pulleyPivot;

  // ---------- Riemen ----------
  // Ein bisschen “breiter” und sauberer
  const beltPath = new THREE.CatmullRomCurve3(
    [
      new THREE.Vector3(11.6, 8.4, 3.4),
      new THREE.Vector3(11.6, 25.6, -30.8),
      new THREE.Vector3(11.6, 21.4, -30.8),
      new THREE.Vector3(11.6, 4.2, 3.4),
    ],
    true
  );

  // Belt: flaches Band statt Tube ("Wurst")
beltMat.side = THREE.DoubleSide;

const flatBelt = createFlatBeltFromCurve(beltPath, 140, 3.2, beltMat);
flatBelt.traverse(o => { if (o.isMesh) o.castShadow = true; });

group.add(flatBelt);
group.userData.belt = flatBelt; // bleibt kompatibel

  // ---------- Target Pulley Station ----------
  const shaftHanger = new THREE.Group();
  shaftHanger.position.set(11.6, 23.6, -30.8);
  group.add(shaftHanger);

  // Querträger (Deckenhalter)
  const hangerBeam = new THREE.Mesh(new THREE.BoxGeometry(10, 1.0, 2.4), ironDarkMat);
  hangerBeam.position.set(0, 6.3, 0);
  shaftHanger.add(hangerBeam);

  // Hänger
  const hanger = new THREE.Mesh(new THREE.BoxGeometry(2.4, 6.6, 2.4), ironMat);
  hanger.position.y = 3.3;
  hanger.castShadow = true;
  shaftHanger.add(hanger);

  const targetPulleyPivot = new THREE.Group();
shaftHanger.add(targetPulleyPivot);

const targetPulley = new THREE.Mesh(new THREE.CylinderGeometry(3.25, 3.25, 4.4, 32), flyWheelMat);
targetPulley.rotation.z = -Math.PI / 2; // Achse Z
targetPulley.castShadow = true;
targetPulleyPivot.add(targetPulley);

// Wichtig: script.js dreht userData.targetPulley -> wir geben ihm den Pivot!
group.userData.targetPulley = targetPulleyPivot;

  // kleines Getriebegehäuse daneben (reine Optik)
  const gearbox = new THREE.Mesh(new THREE.BoxGeometry(5.6, 3.0, 3.6), ironMat);
  gearbox.position.set(-4.8, 2.2, 0);
  shaftHanger.add(gearbox);

  // Lampe (mit Gehäuse)
  const lampHousing = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.2, 1.6, 16), ironDarkMat);
  lampHousing.position.set(4.8, 5.4, 2.0);
  lampHousing.rotation.x = Math.PI / 2;
  shaftHanger.add(lampHousing);

  const lamp = new THREE.PointLight(0xffcaa0, 0.8, 90);
  lamp.position.set(4.8, 5.4, 3.2);
  shaftHanger.add(lamp);

  // ---------- Final ----------
  group.traverse((o) => {
    if (o.isMesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });

  return group;
}

// ==========================================
// ERSATZ FÜR createSteamLocomotiveDisplay in objects.js
// ==========================================

function createSteamLocomotiveDisplay() {
  const group = new THREE.Group(); // Das ist das Hauptobjekt für script.js

  // Dieser Container hält alle Teile und wird zentriert
  const trainAssembly = new THREE.Group();
  // VERSCHIEBUNG: Schiebt den ganzen Zug nach links, damit er mittig auf dem Podest steht
  // (Vorher war 0,0,0 unter dem Kessel, jetzt ist 0,0,0 die optische Mitte)
  trainAssembly.position.x = -10; 
  group.add(trainAssembly);

  // --- MATERIALIEN ---
  const ironDark = new THREE.MeshStandardMaterial({ color: 0x151515, roughness: 0.7, metalness: 0.6 });
  const paintBody = new THREE.MeshPhysicalMaterial({ color: 0xd4a017, roughness: 0.4, metalness: 0.1, clearcoat: 0.3 }); // Ocker
  const brass     = new THREE.MeshPhysicalMaterial({ color: 0xeebb44, roughness: 0.2, metalness: 1.0 });
  const wood      = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.9 });
  const copper    = new THREE.MeshPhysicalMaterial({ color: 0xb87333, roughness: 0.5, metalness: 0.8 });
  const coalMat   = new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 1.0 });
  const steelBright = new THREE.MeshStandardMaterial({ color: 0xaaaaaa, roughness: 0.2, metalness: 0.9 });
  const whitePaint = new THREE.MeshPhysicalMaterial({ color: 0xf0f0f0, roughness: 0.4, metalness: 0.1 });

  // --- 1. HAUPTRAHMEN & KESSEL ---
  
  const frame = new THREE.Mesh(new THREE.BoxGeometry(24, 2, 8), wood);
  frame.position.set(0, 4, 0);
  trainAssembly.add(frame); // WICHTIG: Alles zu trainAssembly adden, nicht zu group

  const boilerGroup = new THREE.Group();
  boilerGroup.position.y = 8;
  trainAssembly.add(boilerGroup);

  const boilerBody = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.2, 13, 32), paintBody);
  boilerBody.rotation.z = Math.PI / 2;
  boilerGroup.add(boilerBody);

  const boilerBottom = new THREE.Mesh(new THREE.CylinderGeometry(3.25, 3.25, 12.8, 32, 1, true, 0, Math.PI), whitePaint);
  boilerBottom.rotation.z = Math.PI / 2;
  boilerBottom.rotation.y = Math.PI; 
  boilerGroup.add(boilerBottom);

  const firebox = new THREE.Mesh(new THREE.BoxGeometry(6.5, 6.5, 6), ironDark);
  firebox.position.set(7.5, 0, 0);
  boilerGroup.add(firebox);
  addRivetsOnBox(firebox, 6.5, 6.5, 6, 20, 0x000000);

  const smokebox = new THREE.Mesh(new THREE.CylinderGeometry(3.3, 3.3, 3, 32), ironDark);
  smokebox.rotation.z = Math.PI / 2;
  smokebox.position.set(-7.5, 0, 0);
  boilerGroup.add(smokebox);

  // --- 2. SCHORNSTEIN ---
  const stackGroup = new THREE.Group();
  stackGroup.position.set(-8, 10, 0);
  trainAssembly.add(stackGroup);

  const stackBase = new THREE.Mesh(new THREE.BoxGeometry(3, 3, 3), ironDark);
  stackGroup.add(stackBase);

  const stackTall = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.6, 14, 24), whitePaint);
  stackTall.position.y = 7;
  stackGroup.add(stackTall);

  const stackCrown = new THREE.Mesh(new THREE.CylinderGeometry(2, 1.2, 2, 24), brass); 
  stackCrown.position.y = 14;
  stackGroup.add(stackCrown);

  // --- 3. ZYLINDER & KOLBEN ---
  const pistonGroup = new THREE.Group();
  trainAssembly.add(pistonGroup);
  
  const cylGeo = new THREE.CylinderGeometry(1, 1, 8, 16);
  const pistonGeo = new THREE.CylinderGeometry(0.4, 0.4, 10, 8); 

  const cylL = new THREE.Mesh(cylGeo, ironDark);
  cylL.position.set(6, 9, 4.2); 
  cylL.rotation.z = -Math.PI / 5; 
  pistonGroup.add(cylL);

  const rodL = new THREE.Mesh(pistonGeo, steelBright);
  rodL.rotation.z = -Math.PI / 5;
  rodL.position.set(6, 9, 4.2); 
  pistonGroup.add(rodL);

  const cylR = new THREE.Mesh(cylGeo, ironDark);
  cylR.position.set(6, 9, -4.2);
  cylR.rotation.z = -Math.PI / 5;
  pistonGroup.add(cylR);

  const rodR = new THREE.Mesh(pistonGeo, steelBright);
  rodR.rotation.z = -Math.PI / 5;
  rodR.position.set(6, 9, -4.2);
  pistonGroup.add(rodR);

  // Animation Data (Muss an 'group' hängen, damit script.js es findet)
  group.userData.pistons = {
    left: rodL,
    right: rodR,
    originR: new THREE.Vector3(6, 9, 4),
    originL: new THREE.Vector3(6, 9, -4),
    direction: new THREE.Vector3(-Math.sin(Math.PI/5), -Math.cos(Math.PI/5), 0)
  };

  // --- 4. RÄDER ---
  const spokeMat = paintBody; 
  const tireMat = ironDark;

  function createSpokedWheel(radius, spokes) {
    const w = new THREE.Group();
    const tire = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.3, 12, 48), tireMat);
    tire.rotation.y = Math.PI;
    w.add(tire);
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 1.5, 16), tireMat);
    hub.rotation.x = Math.PI/2;
    w.add(hub);
    const spGeo = new THREE.BoxGeometry(0.2, radius*1.8, 0.2);
    for(let i=0; i<spokes; i++){
        const s = new THREE.Mesh(spGeo, spokeMat);
        s.rotation.z = (i/spokes)*Math.PI*2;
        w.add(s);
    }
    return w;
  }

  const driveWheelRad = 4.8;
  const wheelFL = createSpokedWheel(driveWheelRad, 14);
  wheelFL.position.set(-4, driveWheelRad+0.1, 4.0);
  trainAssembly.add(wheelFL);
  
  const wheelFR = createSpokedWheel(driveWheelRad, 14);
  wheelFR.position.set(-4, driveWheelRad+0.1, -4.0);
  trainAssembly.add(wheelFR);

  const smallWheelRad = 2.2;
  const wheelBL = createSpokedWheel(smallWheelRad, 8);
  wheelBL.position.set(9, smallWheelRad+0.1, 4.0);
  trainAssembly.add(wheelBL);

  const wheelBR = createSpokedWheel(smallWheelRad, 8);
  wheelBR.position.set(9, smallWheelRad+0.1, -4.0);
  trainAssembly.add(wheelBR);

  group.userData.trainWheels = [wheelFL, wheelFR, wheelBL, wheelBR];

  // --- 5. TENDER ---
  const tender = new THREE.Group();
  tender.position.set(20, 0, 0); // Position relativ zur Lok
  
  const tFrame = new THREE.Mesh(new THREE.BoxGeometry(10, 1.5, 7.5), wood);
  tFrame.position.y = 4;
  tender.add(tFrame);
  
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.2, 8, 24), wood);
  barrel.rotation.z = Math.PI/2;
  barrel.position.set(-1, 8, 0);
  addRivetsOnBox(barrel, 7, 6, 6, 12, 0x333);
  tender.add(barrel);

  const tW1 = createSpokedWheel(2.2, 8); tW1.position.set(-2.5, 2.3, 3.5); tender.add(tW1);
  const tW2 = createSpokedWheel(2.2, 8); tW2.position.set(2.5, 2.3, 3.5); tender.add(tW2);
  const tW3 = createSpokedWheel(2.2, 8); tW3.position.set(-2.5, 2.3, -3.5); tender.add(tW3);
  const tW4 = createSpokedWheel(2.2, 8); tW4.position.set(2.5, 2.3, -3.5); tender.add(tW4);
  
  group.userData.tenderWheels = [tW1, tW2, tW3, tW4];
  trainAssembly.add(tender);

  // --- 6. RAUCH ---
  const smoke = new THREE.Group();
  smoke.position.set(-8, 24, 0);
  const smokeMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.2 });
  for(let i=0; i<12; i++){
      const p = new THREE.Mesh(new THREE.SphereGeometry(1, 8, 8), smokeMat);
      p.position.set((Math.random()-.5), i*1.2, (Math.random()-.5));
      p.scale.setScalar(1 + i*0.3);
      smoke.add(p);
  }
  trainAssembly.add(smoke);
  group.userData.smoke = smoke;

  // Schatten
  group.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  
  return group;
}

function createSteamship() {
  const group = new THREE.Group();

  // --- MATERIALIEN ---
  const hullBlack = new THREE.MeshStandardMaterial({ color: 0x181818, roughness: 0.6 });
  const hullRed   = new THREE.MeshStandardMaterial({ color: 0x6e1818, roughness: 0.7 });
  const deckWood  = new THREE.MeshStandardMaterial({ color: 0x8a6642, roughness: 0.9, metalness: 0.1 });
  const cabinWhite= new THREE.MeshStandardMaterial({ color: 0xf0f0f0, roughness: 0.5 });
  const iron      = new THREE.MeshStandardMaterial({ color: 0x2b3642, roughness: 0.5, metalness: 0.6 });
  const gold      = new THREE.MeshPhysicalMaterial({ color: 0xffcc00, metalness: 0.8, roughness: 0.3 });
  
  // --- 1. RUMPF (Zweifarbig & Geformt) ---
  const hullGroup = new THREE.Group();
  hullGroup.position.y = 2.5; // Wasserlinie
  group.add(hullGroup);

  // Unterwasserschiff (Rot)
  const lowerHull = new THREE.Mesh(new THREE.BoxGeometry(22, 2.5, 5.5), hullRed);
  lowerHull.position.y = -1.25;
  hullGroup.add(lowerHull);
  
  // Bug unten (Spitz zulaufend)
  const bowLow = new THREE.Mesh(new THREE.ConeGeometry(3.5, 6, 4), hullRed);
  bowLow.rotation.z = Math.PI/2; 
  bowLow.rotation.x = Math.PI; // Kante nach vorne für Schärfe
  bowLow.scale.set(1, 1, 0.7);
  bowLow.position.set(-14, -1.25, 0);
  hullGroup.add(bowLow);
  
  // Heck unten (Abgerundet)
  const sternLow = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 1.5, 3, 8), hullRed);
  sternLow.rotation.z = Math.PI/2;
  sternLow.rotation.x = Math.PI/2;
  sternLow.position.set(12.5, -1.25, 0);
  hullGroup.add(sternLow);

  // Überwasserschiff (Schwarz)
  const upperHull = new THREE.Mesh(new THREE.BoxGeometry(24, 3, 6.2), hullBlack);
  upperHull.position.y = 1.5;
  hullGroup.add(upperHull);
  
  // Bug oben
  const bowHigh = new THREE.Mesh(new THREE.ConeGeometry(3.5, 8, 4), hullBlack);
  bowHigh.rotation.z = Math.PI/2; 
  bowHigh.rotation.x = Math.PI;
  bowHigh.scale.set(1, 1, 0.6);
  bowHigh.position.set(-15, 1.5, 0);
  hullGroup.add(bowHigh);
  
  // Heck oben
  const sternHigh = new THREE.Mesh(new THREE.CylinderGeometry(3.1, 3.1, 4, 16, 1, false, 0, Math.PI), hullBlack);
  sternHigh.rotation.z = Math.PI/2;
  sternHigh.rotation.y = Math.PI/2;
  sternHigh.position.set(12, 1.5, 0);
  hullGroup.add(sternHigh);

  // Deck (Holzplanken)
  const deck = new THREE.Mesh(new THREE.BoxGeometry(32, 0.2, 5.8), deckWood);
  deck.position.y = 3.1;
  hullGroup.add(deck);

  // --- 2. RADKÄSTEN (Sponsons) & SCHAUFELRÄDER ---
  
  // Die typischen halbrunden Abdeckungen an der Seite
  const boxGeo = new THREE.CylinderGeometry(3.5, 3.5, 2, 32, 1, false, 0, Math.PI);
  
  // Radkasten Links
  const boxL = new THREE.Mesh(boxGeo, hullBlack);
  boxL.side = THREE.DoubleSide;
  boxL.rotation.x = Math.PI/2; // Bogen nach oben
  boxL.position.set(0, 1, 4);
  hullGroup.add(boxL);
  
  // Namensschild (Gold)
  const nameL = new THREE.Mesh(new THREE.BoxGeometry(4, 0.5, 0.1), gold);
  nameL.position.set(0, 4, 5.15);
  hullGroup.add(nameL);

  // Radkasten Rechts (Klonen)
  const boxR = boxL.clone();
  boxR.side = THREE.DoubleSide;
  boxR.position.set(0, 1, -4);
  hullGroup.add(boxR);
  const nameR = nameL.clone();
  nameR.position.set(0, 4, -5.15);
  hullGroup.add(nameR);

  // Schaufelrad (Das Innere, das sich dreht)
  const paddleWheel = new THREE.Group();
  paddleWheel.position.set(0, 1, 0); // Zentrum der Räder
  
  // Achse/Nabe
  const wheelHub = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 9, 16), iron);
  wheelHub.rotation.x = Math.PI/2;
  paddleWheel.add(wheelHub);
  
  // Speichen & Schaufeln
  const spokeCount = 10;
  for(let i=0; i<spokeCount; i++){
      const ang = (i/spokeCount) * Math.PI*2;
      
      // Holz-Schaufel Links
      const paddleL = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.1, 2.0), deckWood);
      paddleL.position.set(2.8 * Math.cos(ang), 2.8 * Math.sin(ang), 3.5);
      paddleL.rotation.z = ang;
      paddleWheel.add(paddleL);

      // Holz-Schaufel Rechts
      const paddleR = paddleL.clone();
      paddleR.position.z = -3.5;
      paddleWheel.add(paddleR);
      
      // Metallspeiche (Verbindung)
      const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.1, 5.6, 0.1), iron);
      spoke.position.set(0,0,3.5);
      spoke.rotation.z = ang;
      paddleWheel.add(spoke);
      
      const spoke2 = spoke.clone();
      spoke2.position.z = -3.5;
      paddleWheel.add(spoke2);
  }
  hullGroup.add(paddleWheel);
  
  // --- 3. AUFBAUTEN ---

  // Deckshaus (Kabine)
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(8, 2.5, 4), cabinWhite);
  cabin.position.set(-2, 4.25, 0);
  hullGroup.add(cabin);
  
  // Kommandobrücke (Laufsteg zwischen den Radkästen)
  const bridge = new THREE.Mesh(new THREE.BoxGeometry(4, 0.2, 10), deckWood);
  bridge.position.set(0, 5.6, 0);
  hullGroup.add(bridge);
  
  // Schornstein (Lang & Dünn, typisch 19. Jh.)
  const funnel = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 8, 24), hullBlack);
  funnel.position.set(3, 8, 0);
  hullGroup.add(funnel);
  
  // Schornstein-Krone
  const funnelRim = new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.1, 8, 24), hullBlack);
  funnelRim.rotation.x = Math.PI/2;
  funnelRim.position.set(3, 12, 0);
  hullGroup.add(funnelRim);

  // --- 4. MASTEN & SEGEL (Hilfsbesegelung) ---
  const mastGeo = new THREE.CylinderGeometry(0.15, 0.4, 18, 8);
  const yardGeo = new THREE.CylinderGeometry(0.1, 0.15, 8, 8);
  
  // Vordermast
  const mast1 = new THREE.Mesh(mastGeo, deckWood);
  mast1.position.set(-10, 10, 0);
  hullGroup.add(mast1);
  const yard1 = new THREE.Mesh(yardGeo, deckWood);
  yard1.rotation.z = Math.PI/2;
  yard1.position.set(-10, 12, 0);
  hullGroup.add(yard1);

  // Hintermast
  const mast2 = new THREE.Mesh(mastGeo, deckWood);
  mast2.position.set(10, 10, 0);
  hullGroup.add(mast2);
  const yard2 = yard1.clone();
  yard2.position.set(10, 12, 0);
  hullGroup.add(yard2);

  // Bugspriet (Vorne raus)
  const bowsprit = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.2, 8, 8), deckWood);
  bowsprit.rotation.z = Math.PI/2.2;
  bowsprit.position.set(-18, 4, 0);
  hullGroup.add(bowsprit);

  // --- 5. DETAILS ---
  // Rettungsboote an der Seite
  const boatGeo = new THREE.BoxGeometry(3, 0.8, 1.2);
  const boat1 = new THREE.Mesh(boatGeo, cabinWhite);
  boat1.position.set(-5, 5, 2.5);
  hullGroup.add(boat1);
  const boat2 = boat1.clone();
  boat2.position.z = -2.5;
  hullGroup.add(boat2);

  // Rauchwolke
  const smoke = new THREE.Group();
  smoke.position.set(3, 12.5, 0);
  const smokeMat = new THREE.MeshBasicMaterial({ color: 0xdddddd, transparent: true, opacity: 0.3 });
  for(let i=0; i<8; i++){
      const p = new THREE.Mesh(new THREE.SphereGeometry(0.7, 8, 8), smokeMat);
      p.position.y = i * 1.5;
      p.scale.setScalar(1 + i*0.4);
      smoke.add(p);
  }
  hullGroup.add(smoke);

  // UserData für Animation (in script.js)
  // paddleWheel referenziert nur die drehende Gruppe in der Mitte
  group.userData.paddleWheel = paddleWheel; 
  group.userData.steam = smoke;

  // Schattenwurf aktivieren
  group.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  
  return group;
}

function createPowerLoom() {
  const group = new THREE.Group();

  // --- MATERIALIEN ---
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.8, metalness: 0.1 });
  const ironMat = new THREE.MeshStandardMaterial({ color: 0x2b2b2b, roughness: 0.6, metalness: 0.7 });
  const steelMat = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.3, metalness: 0.8 });
  
  // Garn-Textur (Streifen für Kettfäden)
  const yarnTex = makeCanvasTexture((ctx, w, h) => {
      ctx.fillStyle = "#d3c3b4"; ctx.fillRect(0,0,w,h);
      ctx.fillStyle = "#eaddcf"; 
      for(let i=0; i<w; i+=4) ctx.fillRect(i,0,1,h); 
  }, 512, 512);
  const yarnMat = new THREE.MeshStandardMaterial({ map: yarnTex, side: THREE.DoubleSide, roughness: 1.0 });

  // Stoff-Textur (Gittermuster)
  const clothTex = makeCanvasTexture((ctx, w, h) => {
      ctx.fillStyle = "#eaddcf"; ctx.fillRect(0,0,w,h);
      ctx.fillStyle = "#d3c3b4"; 
      for(let i=0; i<w; i+=4) ctx.fillRect(i,0,1,h);
      for(let j=0; j<h; j+=4) ctx.fillRect(0,j,w,1);
  }, 512, 512);
  const clothMat = new THREE.MeshStandardMaterial({ map: clothTex, side: THREE.DoubleSide, roughness: 0.9 });

  // --- 1. RAHMEN (Massiv & Verstärkt) ---
  const frameGroup = new THREE.Group();
  group.add(frameGroup);

  // Hauptpfosten
  const postGeo = new THREE.BoxGeometry(1.5, 14, 1.5);
  const p1 = new THREE.Mesh(postGeo, woodMat); p1.position.set(-8, 7, -5); frameGroup.add(p1);
  const p2 = new THREE.Mesh(postGeo, woodMat); p2.position.set( 8, 7, -5); frameGroup.add(p2);
  const p3 = new THREE.Mesh(postGeo, woodMat); p3.position.set(-8, 7,  5); frameGroup.add(p3);
  const p4 = new THREE.Mesh(postGeo, woodMat); p4.position.set( 8, 7,  5); frameGroup.add(p4);

  // Verbindungsbalken
  const sideBeamGeo = new THREE.BoxGeometry(1.2, 1.5, 11);
  const sb1 = new THREE.Mesh(sideBeamGeo, woodMat); sb1.position.set(-8, 2, 0); frameGroup.add(sb1);
  const sb2 = new THREE.Mesh(sideBeamGeo, woodMat); sb2.position.set( 8, 2, 0); frameGroup.add(sb2);
  
  // Oberer Querbalken (der "Himmel" des Webstuhls)
  const topArch = new THREE.Mesh(new THREE.BoxGeometry(17, 1.5, 1.5), woodMat);
  topArch.position.set(0, 13.5, 0);
  frameGroup.add(topArch);

  // Details: Nietenplatten an den Verbindungen
  addRivetsOnBox(sb1, 1.2, 1.5, 11, 6, 0x111111);
  addRivetsOnBox(sb2, 1.2, 1.5, 11, 6, 0x111111);

  // --- 2. WALZEN (Beams) ---
  
  // Kettbaum (Hinten) - Hier ist das rohe Garn aufgewickelt
  const warpBeam = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, 15, 32), woodMat);
  warpBeam.rotation.z = Math.PI / 2;
  warpBeam.position.set(0, 5, -5.5);
  const rawYarn = new THREE.Mesh(new THREE.CylinderGeometry(2.3, 2.3, 14, 32), yarnMat);
  rawYarn.rotation.y = Math.PI / 2;
  warpBeam.add(rawYarn);
  group.add(warpBeam);

  // Warenbaum (Vorne) - Hier wird der fertige Stoff aufgewickelt
  const clothBeam = new THREE.Mesh(new THREE.CylinderGeometry(2.0, 2.0, 15, 32), woodMat);
  clothBeam.rotation.z = Math.PI / 2;
  clothBeam.position.set(0, 4, 5.5);
  const finishedCloth = new THREE.Mesh(new THREE.CylinderGeometry(2.1, 2.1, 14, 32), clothMat);
  finishedCloth.rotation.y = Math.PI / 2;
  clothBeam.add(finishedCloth);
  group.add(clothBeam);

  // Umlenkrollen (Streichbaum/Brustbaum)
  const whipRoll = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 16), ironMat);
  whipRoll.rotation.z = Math.PI/2; whipRoll.position.set(0, 8, -5); group.add(whipRoll);
  
  const breastBeam = new THREE.Mesh(new THREE.BoxGeometry(16, 1, 1.5), woodMat);
  breastBeam.position.set(0, 7, 5); group.add(breastBeam);

  // --- 3. FÄDEN & STOFF ---
  
  // Kettfäden (laufen von hinten durch die Maschine)
  const threads = new THREE.Mesh(new THREE.PlaneGeometry(13, 7), yarnMat);
  threads.rotation.x = -Math.PI / 2;
  threads.position.set(0, 8, -1.5); 
  group.add(threads);

  // Fertiger Stoff (vorne)
  const fabric = new THREE.Mesh(new THREE.PlaneGeometry(13, 4), clothMat);
  fabric.rotation.x = -Math.PI / 2;
  fabric.position.set(0, 7.5, 3);
  group.add(fabric);

  // --- 4. LITZENRAHMEN (Schäfte) ---
  // Die Rahmen, die auf und ab gehen
  const healdFrame = new THREE.Group();
  healdFrame.position.set(0, 9, -1);
  group.add(healdFrame);
  
  const frameTop = new THREE.Mesh(new THREE.BoxGeometry(14, 0.4, 0.2), woodMat);
  const frameBot = new THREE.Mesh(new THREE.BoxGeometry(14, 0.4, 0.2), woodMat);
  frameBot.position.y = -4;
  healdFrame.add(frameTop, frameBot);
  
  // Dünne Drähte (Litzen)
  for(let i=0; i<30; i++){
      const wire = new THREE.Mesh(new THREE.BoxGeometry(0.02, 4, 0.02), steelMat);
      wire.position.set(-6 + i*0.41, -2, 0);
      healdFrame.add(wire);
  }

  // --- 5. BEATER (Die Lade) & SCHIFFCHEN ---
  // Das Teil, das vor und zurück schwingt
  const beaterGroup = new THREE.Group();
  // Startposition so wählen, dass die Animation im Script (-1.6 bis -0.4) gut aussieht
  beaterGroup.position.set(0, 1, 0); 
  group.add(beaterGroup);

  // Seitenarme
  const beaterLegL = new THREE.Mesh(new THREE.BoxGeometry(1, 9, 1), woodMat);
  beaterLegL.position.set(-7, 4.5, 0);
  beaterGroup.add(beaterLegL);
  const beaterLegR = beaterLegL.clone();
  beaterLegR.position.set(7, 4.5, 0);
  beaterGroup.add(beaterLegR);

  // Das Blatt (Reed) - der Kamm
  const reedFrame = new THREE.Mesh(new THREE.BoxGeometry(16, 3.5, 1), woodMat);
  reedFrame.position.set(0, 7.5, 0);
  beaterGroup.add(reedFrame);
  
  const reedGrid = new THREE.Mesh(new THREE.PlaneGeometry(14, 2.5), new THREE.MeshStandardMaterial({color: 0xcccccc, side: THREE.DoubleSide}));
  reedGrid.position.set(0, 7.5, 0.51);
  beaterGroup.add(reedGrid);

  // Laufbahn für das Schiffchen
  const raceBoard = new THREE.Mesh(new THREE.BoxGeometry(16, 0.5, 1.5), woodMat);
  raceBoard.position.set(0, 5.8, 0.5);
  beaterGroup.add(raceBoard);

  // Das Schiffchen (Shuttle)
  // WICHTIG: Als Kind der beaterGroup, damit es mit vor/zurück schwingt
  const shuttle = new THREE.Mesh(new THREE.BoxGeometry(3, 0.5, 0.8), new THREE.MeshStandardMaterial({color: 0x8b4513}));
  // Spitzen
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.8, 8), steelMat);
  tip.rotation.z = Math.PI/2; tip.position.x = -1.5; shuttle.add(tip);
  const tip2 = tip.clone();
  tip2.rotation.z = -Math.PI/2; tip2.position.x = 1.5; shuttle.add(tip2);
  
  shuttle.position.set(0, 6.3, 0.5);
  beaterGroup.add(shuttle);

  // --- 6. ANTRIEB ---
  const driveGroup = new THREE.Group();
  driveGroup.position.set(9, 3, 0);
  group.add(driveGroup);

  // Antriebswelle
  const driveShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 3, 16), ironMat);
  driveShaft.rotation.z = Math.PI/2;
  driveGroup.add(driveShaft);

  // Schwungrad
  const flywheel = new THREE.Mesh(new THREE.TorusGeometry(2.5, 0.2, 12, 32), ironMat);
  flywheel.rotation.y = Math.PI/2;
  flywheel.position.x = 1.5;
  driveGroup.add(flywheel);

  // --- USER DATA (Verknüpfung zur Animation) ---
  group.userData.loom = {
    shuttle: shuttle, // Wird auf X bewegt
    beater: beaterGroup, // Wird auf Z bewegt (Schlagen)
    warpBar: warpBeam,   // Rotiert langsam
    drive: driveGroup    // Rotiert (optional)
  };

  group.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return group;
}




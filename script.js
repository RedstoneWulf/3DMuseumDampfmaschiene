/* =========================================
   SCRIPT.JS - Verbesserte Hauptlogik
   - Dialog schließt korrekt
   - allowRotation wird wirklich respektiert
   - Back-Button ist robust
   - Rotation-Controls UI konsistent
   ========================================= */

// --- KONFIGURATION ---
const config = {
  roomSize: 160,
  roomDistance: 320,
  orbitRadius: 70.0,
  baseHeight: 15,
};

// --- GLOBALE VARIABLEN ---
let currentRoomIndex = 0;
let isZoomed = false;
let currentRoomAngle = 0;
let rotationLocked = false;

// Dialog System
let currentDialogData = [];
let currentDialogStep = 0;

// Three.js Variablen
let scene, camera, renderer, clock;
let activeObjects = [];
let currentCameraTarget = new THREE.Vector3();
let currentLookAtTarget = new THREE.Vector3();
let actualLookAt = new THREE.Vector3();
let fountainRef = null;

// DOM Elemente
const ui = {
  startScreen: document.getElementById("start-screen"),
  gameMenu: document.getElementById("game-menu"),
  labelsContainer: document.getElementById("labels-container"),
  navArrows: document.querySelectorAll(".nav-arrow"),
  roomInfo: document.getElementById("room-info"),
  quickTravelContainer: document.getElementById("quick-travel-container"),
  btnResetView: document.getElementById("btn-reset-view"),
  btnMenuToggle: document.getElementById("menu-toggle-btn"),
  dialogBox: document.getElementById("dialog-box"),
  dialogTitle: document.getElementById("dialog-title"),
  dialogText: document.getElementById("dialog-text"),
  dialogBtn: document.getElementById("dialog-next-btn"),
};

const rotationControlsEl = document.getElementById("rotation-controls");

// --- DATEN DER RÄUME (KORRIGIERT) ---
const roomsData = [
  {
    // RAUM 0: LOBBY
    name: "Lobby & Empfang",
    color: 0xffffff,
    thumbnail: null,
    objects: [
      {
        type: "locomotive_fountain",
        z: 0,
        label: "Dampflok 'Express 180'",
        zoomOffset: { x: 35, y: 20, z: 35 },
        allowRotation: true,
        dialog: [ { title: "Willkommen im Zeitalter des Dampfes", text: "Vor Ihnen steht ein Nachbau der legendären 'Rocket' von 1829. Sie gilt als die Mutter aller modernen Dampflokomotiven." }, { title: "Das Rennen von Rainhill", text: "Robert Stephenson gewann mit diesem Design das berühmte Rennen von Rainhill. Die innovative Technik mit den vielen Heizrohren im Kessel machte sie schneller und effizienter als alle Konkurrenten." }, { title: "Ein goldenes Zeitalter", text: "Achten Sie auf die ockergelbe Farbe. Damals war dies eine ultramoderne Hightech-Maschine, die die Welt für immer veränderte und Distanzen schrumpfen ließ." } ],
      },
    ],
  },
  {
    // RAUM 1: PIONIERE
    name: "Halle der Pioniere",
    color: 0x2980b9,
    thumbnail: null,
    objects: [
      {
        type: "portrait",
        image: "assets/watt.jpg",
        z: -78,
        xOffset: -20,
        label: "James Watt",
        zoomOffset: { x: 0, y: -8, z: 25 },
        allowRotation: false,
        dialog: [ { title: "Der Feinmechaniker", text: "Geboren 1736 im schottischen Greenock, begann Watt seine Karriere nicht als Ingenieur, sondern als Instrumentenmacher an der Universität Glasgow. Dort wartete er astronomische Geräte." }, {title: "Genie und Zweifel", text: "Watt war ein brillanter Tüftler, litt aber oft unter Selbstzweifeln und finanziellen Sorgen. Er war ein Perfektionist, der sich oft in Details verlor und Angst vor dem geschäftlichen Risiko hatte." }, { title: "Die rettende Partnerschaft", text: "Sein Erfolg kam erst durch Matthew Boulton. Der Industrielle brachte das Kapital und den geschäftlichen Mut mit. Gemeinsam gründeten sie 'Boulton & Watt' in Birmingham – das erste High-Tech-Unternehmen der Welt." }, { title: "Ein bleibendes Erbe", text: "Um seine Maschinen zu verkaufen, erfand Watt die Maßeinheit 'Pferdestärke' (PS). Heute ehrt ihn die Physik weltweit mit der Einheit für Leistung: dem Watt." } ],
      },
      {
        type: "portrait",
        image: "assets/newcomen.jpg",
        z: -78,
        xOffset: 20,
        label: "Thomas Newcomen",
        zoomOffset: { x: 0, y: -8, z: 25 },
        allowRotation: false,
        dialog: [ { title: "Das Gesichtlose Genie", text: "Sie werden bemerken, dass wir nicht genau wissen, wie dieser Mann aussah. Es gibt kein einziges zeitgenössisches Portrait von Thomas Newcomen. Er ist das Phantom der Industriegeschichte." }, { title: "Der praktische Eisenhändler", text: "Im Gegensatz zum Gelehrten Watt war Newcomen ein einfacher Eisenwarenhändler und Baptist aus Dartmouth. Er hatte keine wissenschaftliche Bildung, aber er kannte die Probleme der Bergleute aus erster Hand." }, { title: "Der wahre Pionier", text: "Trotz seiner Anonymität gelang ihm das Unmögliche: 1712 installierte er die erste funktionierende Dampfmaschine der Welt. Sie war laut, hungrig und ineffizient – aber sie funktionierte und rettete den englischen Bergbau vor dem Ertrinken." } ],
      },
      {
        type: "teapot",
        z: 0,
        xOffset: -30,
        label: "Watts Teekessel",
        zoomOffset: { x: 20, y: 15, z: 20 },
        dialog: [ { title: "Die berühmte Legende", text: "Jedes Schulkind kennt die Geschichte: Der kleine James saß in der Küche seiner Tante und beobachtete fasziniert, wie der Dampf den Deckel des Teekessels anhob. Angeblich die Geburtsstunde der Dampfmaschine." }, { title: "Dichtung und Wahrheit", text: "Doch das ist nur die halbe Wahrheit. James Watt hat die Dampfmaschine nicht erfunden! Als er den Kessel beobachtete, arbeiteten Newcomen-Maschinen (siehe Amboss gegenüber) schon seit 50 Jahren in englischen Bergwerken." }, { title: "Die wahre Leistung", text: "Watts Genie bestand nicht in der Entdeckung der Dampfkraft, sondern in ihrer Effizienz. Er erkannte physikalisch, warum die alten Maschinen so viel Kohle verschlangen, und fand die Lösung im separaten Kondensator." } ],
      },
      {
        type: "anvil",
        z: 0,
        xOffset: 30,
        label: "Der Amboss",
        zoomOffset: { x: -20, y: 15, z: 20 },
        dialog: [ { title: "Handwerk statt Wissenschaft", text: "Dieser Amboss steht für Thomas Newcomens Herkunft. Er war kein studierter Physiker, sondern Eisenwarenhändler und Schmied aus Devon. Er näherte sich dem Problem praktisch, nicht theoretisch." }, { title: "Die Atmosphäre als Hammer", text: "Seine Maschine nutzte rohe Gewalt: Der natürliche Luftdruck drückte den Kolben mit gewaltiger Kraft nach unten, sobald der Dampf im Zylinder kondensierte – wie ein unsichtbarer, schwerer Hammer." }, { title: "10 Jahre Tüfteln", text: "Ohne Formeln, nur mit Versuch und Irrtum, brauchte er über ein Jahrzehnt, um die erste 'atmosphärische Maschine' zum Laufen zu bringen. Es war eine Meisterleistung der frühen Ingenieurskunst." } ],
      },
    ],
  },
  {
    // RAUM 2: MASCHINENSAAL
    name: "Maschinensaal",
    color: 0xe67e22,
    thumbnail: null,
    objects: [
      {
        type: "blueprint",
        image: "assets/dampfnewcomen.jpg",
        z: 0,
        xOffset: -78,
        label: "Bauplan: Newcomen",
        rotationY: Math.PI / 2,
        zoomOffset: { x: 40, y: 0, z: 0 },
        allowRotation: false,
        dialog: [
          {
            title: "Ein Blick ins Innere",
            text: "Dieser Plan von 1712 zeigt das Herz der Maschine: Den großen Zylinder direkt unter dem Balken. Anders als heute nutzte diese Maschine keinen hohen Dampfdruck."
          },
          {
            title: "Die Kraft des Vakuums",
            text: "Der Trick war das 'Nichts': Dampf füllte den Zylinder und wurde dann durch kaltes Wasser schlagartig abgekühlt. Der Dampf schrumpfte zu Wasser zusammen und hinterließ ein Vakuum."
          },
          {
            title: "Gedrückt, nicht gezogen",
            text: "Es war nicht der Dampf, der den Kolben bewegte, sondern die Atmosphäre! Der normale Luftdruck lastete auf dem Kolben und drückte ihn mit gewaltiger Kraft in das Vakuum nach unten."
          }
        ],
      },
      {
        type: "blueprint",
        image: "assets/dampfwatt.jpg",
        z: 0,
        xOffset: 78,
        label: "Bauplan: Watt",
        rotationY: -Math.PI / 2,
        zoomOffset: { x: -40, y: 0, z: 0 },
        allowRotation: false,
        dialog: [
          {
            title: "Der Geniestreich",
            text: "Vergleichen Sie diesen Plan mit dem gegenüberliegenden. Der entscheidende Unterschied ist unsichtbar, aber revolutionär: Der separate Kondensator."
          },
          {
            title: "Heiß bleiben",
            text: "Watt erkannte das Problem: Newcomens Zylinder musste bei jedem Takt abkühlen. Watt leitete den Dampf stattdessen in eine separate, dauernd gekühlte Kammer ab."
          },
          {
            title: "Effizienz gewinnt",
            text: "Dadurch blieb der Arbeitszylinder immer heiß. Das Ergebnis: Die Maschine verbrauchte 75% weniger Kohle bei gleicher Leistung. Das machte Dampfkraft plötzlich überall wirtschaftlich."
          }
        ],
      },
      {
        type: "mini_mountain",
        z: 0,
        xOffset: -30,
        label: "Zum Bergwerk (Klicken!)",
        targetRoomIndex: 4, // Springt zu Index 4
        zoomOffset: { x: 0, y: 0, z: 0 },
      },
      {
        type: "mini_factory",
        z: 0,
        xOffset: 30,
        label: "Zur Fabrik (Klicken!)",
        targetRoomIndex: 5, // Springt zu Index 5
        zoomOffset: { x: 0, y: 0, z: 0 },
      },
    ],
  },
  {
    // RAUM 3: FOLGEN DER DAMPFMASCHINE
    name: "Folgen der Dampfmaschine",
    color: 0xdcdcdc,
    thumbnail: null,
    objects: [
      {
        type: 'steam_locomotive_display',
        z: 0, xOffset: 0,
        label: "Eisenbahn (Dampflokomotive)",
        zoomOffset: {x: 30, y: 18, z: 45},
        allowRotation: true,
        dialog: [
          {
            title: "Die Vernetzung der Welt",
            text: "Mit der Dampflokomotive schrumpfte die Welt. Reisen, die mit der Kutsche Tage dauerten, waren plötzlich in Stunden möglich. Menschen und Nachrichten bewegten sich schneller als je zuvor."
          },
          {
            title: "Adern der Industrie",
            text: "Eisenbahnen wurden zum Blutkreislauf der Industrialisierung. Sie transportierten Tonnen von Kohle und Eisen billig in die Fabriken und brachten die Massenwaren in die wachsenden Städte."
          },
          {
            title: "Der Takt der Zeit",
            text: "Die Bahn veränderte sogar unsere Zeit: Da Fahrpläne präzise sein mussten, wurde die 'Eisenbahnzeit' eingeführt. Zum ersten Mal in der Geschichte tickten die Uhren im ganzen Land gleich."
          }
        ],
      },
      {
        type: 'steamship',
        z: -25, xOffset: 55,
        label: "Dampfschiff (Schaufelrad)",
        zoomOffset: {x: -20, y: 18, z: 45},
        allowRotation: true,
        dialog: [
          {
            title: "Der Sieg über den Wind",
            text: "Jahrtausendelang waren Seeleute Sklaven des Windes. Schiffe lagen oft wochenlang in Flaute fest. Das Dampfschiff änderte alles: Es fuhr, wann der Kapitän es wollte, nicht wann das Wetter es erlaubte."
          },
          {
            title: "Die Brücke über den Ozean",
            text: "Mit Schiffen wie der 'Great Western' (1838) wurde der Atlantik zur berechenbaren Route. Fahrpläne ersetzten das Warten. Die Welt rückte zusammen, Nachrichten und Waren überquerten die Meere in Rekordzeit."
          },
          {
            title: "Technik im Übergang",
            text: "Sehen Sie die Masten? Frühe Dampfer trauten der neuen Technik noch nicht ganz und hatten Segel als 'Notfall-Antrieb' dabei. Die seitlichen Schaufelräder waren typisch für die Anfangszeit, bevor die Schiffsschraube sie ablöste."
          }
        ],
      },
      {
        type: 'power_loom',
        z: -25, 
        xOffset: -55,
        label: "Mechanischer Webstuhl",
        zoomOffset: {x: 45, y: 16, z: 40},
        allowRotation: true,
        // HIER DER NEUE DIALOG:
        dialog: [
          {
            title: "Stoff für die Massen",
            text: "Dieser mechanische Webstuhl, angetrieben von einer Dampfmaschine, veränderte die Kleidung der Welt. Plötzlich konnte Stoff in riesigen Mengen und extrem billig produziert werden. Mode war kein Luxus mehr."
          },
          {
            title: "Der Preis des Fortschritts",
            text: "Für die traditionellen Handweber war diese Maschine der Untergang. Sie konnten mit dem Tempo und den Preisen der Fabriken nicht mithalten. Viele verarmten, und es kam zu verzweifelten Aufständen gegen die Maschinen."
          },
          {
            title: "Leben im Takt der Maschine",
            text: "Die Dampfmaschine diktierte nun den Arbeitsrhythmus. Männer, Frauen und oft auch Kinder arbeiteten bis zu 14 Stunden täglich im ohrenbetäubenden Lärm und Staub der Fabrikhallen. Die moderne Arbeiterklasse entstand."
          }
        ],
      }
    ]
  },
  {
    // RAUM 4: DAS BERGWERK (Spezial)
    name: "Das Bergwerk (1712)",
    color: 0x111111,
    thumbnail: null,
    isSpecial: true,
    objects: [
      { type: "mine_environment", z: 0, label: "", zoomOffset: { x: 0, y: 0, z: 0 } },
      {
        type: "deep_newcomen",
        z: 0,
        label: "Newcomen Pumpe",
        zoomOffset: { x: 30, y: 10, z: 30 },
        dialog: [
          {
            title: "Gefangen in der Tiefe",
            text: "Willkommen unter Tage. Das größte Problem der Bergleute im 18. Jahrhundert war nicht die Dunkelheit, sondern das Grundwasser. Sobald man tief grub, liefen die Stollen voll."
          },
          {
            title: "Der eiserne Retter",
            text: "Diese gigantische Newcomen-Maschine war die Lösung. Sie arbeitete Tag und Nacht. Das monotone Ächzen des Holzbalkens war für die Kumpel der Klang der Sicherheit – wenn er stoppte, stieg das Wasser."
          },
          {
            title: "Ein hungriges Monster",
            text: "Sie war extrem ineffizient und verschlang Unmengen an Kohle. Aber hier, direkt an der Quelle, spielte das keine Rolle. Hauptsache, die Pumpe lief und hielt den Schacht trocken."
          }
        ],
      },
    ]
  },
  {
    // RAUM 5: TEXTILFABRIK (Spezial)
    name: "Textilfabrik (1790)",
    color: 0x552222,
    thumbnail: null,
    isSpecial: true,
    objects: [
      {
        type: "factory_watt",
        z: 0,
        label: "Watt Rotationsmaschine",
        zoomOffset: { x: -30, y: 20, z: 40 },
        dialog: [
          {
            title: "Der Motor der Welt",
            text: "Das hier ist der 'heilige Gral' der Dampftechnik: Die Rotationsmaschine (ca. 1788). Watts frühere Maschinen konnten nur pumpen (auf und ab). Diese hier erzeugt eine Drehbewegung."
          },
          {
            title: "Planet und Sonne",
            text: "Achten Sie auf das Zahnradgetriebe in der Mitte (Sonne-und-Planeten-Getriebe). Damit umging Watt ein Patent der Konkurrenz für die Kurbelwelle. Es wandelt den Hub des Kolbens in eine saubere Rotation um."
          },
          {
            title: "Alles ändert sich",
            text: "Diese Drehung war der Schlüssel. Plötzlich konnten Dampfmaschinen nicht nur Wasser pumpen, sondern Webstühle, Mühlen und Fabriken antreiben. Das Handwerk starb, die Industrie war geboren."
          }
        ],
      },
    ],
  }
];

function init() {
  initUI();
  init3D();
  animate();
}

/* ---------------------------
   UI & NAVIGATION
--------------------------- */

function initUI() {
  document.getElementById("btn-start").addEventListener("click", startGame);

  // Back / Reset
  ui.btnResetView.addEventListener("click", handleBackButton);

  ui.btnMenuToggle.addEventListener("click", toggleGameMenu);
  document.getElementById("btn-resume").addEventListener("click", toggleGameMenu);

  document.getElementById("next-btn").addEventListener("click", () => navigate(1));
  document.getElementById("prev-btn").addEventListener("click", () => navigate(-1));

  document.getElementById("btn-rot-left").addEventListener("click", () => rotateCamera(Math.PI / 4));
  document.getElementById("btn-rot-right").addEventListener("click", () => rotateCamera(-Math.PI / 4));

  ui.dialogBtn.addEventListener("click", onDialogButton);

  updateNavButtons();
  syncRotationControls();
}

function startGame() {
  ui.startScreen.classList.add("hidden");
  ui.navArrows.forEach((el) => (el.style.display = "flex"));
  ui.btnMenuToggle.style.display = "block";
  ui.roomInfo.style.display = "block";
  rotationControlsEl.style.display = "flex";
  updateInfoText();
  updateNavButtons();
  syncRotationControls();
}

function toggleGameMenu() {
  ui.gameMenu.classList.toggle("hidden");
}

// Entscheidet, was der Zurück-Button macht
function handleBackButton() {
  if (isZoomed) {
    // Zoom schließen
    resetViewToRoom();
    return;
  }

  // Wenn man im Bergwerk (4) oder Fabrik (5) ist -> Zurück zum Maschinensaal (2)
  if (currentRoomIndex > 3) {
    currentRoomIndex = 2; // Index 2 = Maschinensaal
    currentRoomAngle = 0;
    resetViewToRoom();
    return;
  }

  // In normaler Raumansicht: Kamera resetten
  resetViewToRoom();
}

function navigate(dir) { 
  const maxMainIndex = 3; // <--- ACHTUNG: Falls Folgen Raum 6 ist -> 6 eintragen!

  // Spezialräume blockieren Navigation
  if (currentRoomIndex > maxMainIndex) return;

  currentRoomIndex = (currentRoomIndex + dir + (maxMainIndex + 1)) % (maxMainIndex + 1);
  currentRoomAngle = 0;
  resetViewToRoom();
}

function updateNavButtons() {
  const maxMainIndex = 3; // <--- ggf. 6

  // Spezialräume: Pfeile aus
  if (currentRoomIndex > maxMainIndex) {
    ui.navArrows.forEach(el => el.style.display = 'none');
    return;
  }

  // Pfeile an
  ui.navArrows.forEach(el => el.style.display = 'flex');

  const next = (currentRoomIndex + 1) % (maxMainIndex + 1);
  const prev = (currentRoomIndex - 1 + (maxMainIndex + 1)) % (maxMainIndex + 1);

  const nextName = roomsData[next]?.name ?? `Raum ${next}`;
  const prevName = roomsData[prev]?.name ?? `Raum ${prev}`;

  const nextText = document.querySelector('#next-btn .nav-text');
  const prevText = document.querySelector('#prev-btn .nav-text');

  if (nextText) nextText.innerText = nextName;
  if (prevText) prevText.innerText = prevName;
}

function rotateCamera(angle) {
  if (isZoomed && rotationLocked) return;

  if (isZoomed) {
    const pivot = new THREE.Vector3().copy(currentLookAtTarget);
    const offset = new THREE.Vector3().subVectors(currentCameraTarget, pivot);
    offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), angle);
    currentCameraTarget.copy(pivot).add(offset);
  } else {
    currentRoomAngle += angle;
    calculateRoomView();
  }
}

function calculateRoomView() {
  const centerX = currentRoomIndex * config.roomDistance;
  const dist = currentRoomIndex > 3 ? 50 : config.orbitRadius;

  currentCameraTarget.set(
    centerX + Math.sin(currentRoomAngle) * dist,
    config.baseHeight,
    Math.cos(currentRoomAngle) * dist
  );

  // Spezialräume: etwas mehr "rein" schauen
  const lookY = currentRoomIndex > 3 ? 12 : 15;
  currentLookAtTarget.set(centerX, lookY, 0);

  if (!actualLookAt.lengthSq()) actualLookAt.copy(currentLookAtTarget);
}

function focusOnObject(obj3D, offset, allowRot, dialogData, targetRoomIndex) {
  // TELEPORT
  if (targetRoomIndex !== undefined) {
    currentRoomIndex = targetRoomIndex;
    currentRoomAngle = 0;
    resetViewToRoom();

    ui.btnResetView.classList.remove("hidden");
    ui.btnResetView.innerText = "Zurück zum Museum";
    return;
  }

  // ZOOM
  isZoomed = true;
  rotationLocked = !allowRot;

  const targetPos = new THREE.Vector3().copy(obj3D.position).add(offset);
  currentCameraTarget.copy(targetPos);
  currentLookAtTarget.copy(obj3D.position);

  ui.navArrows.forEach((el) => (el.style.display = "none"));
  ui.btnResetView.classList.remove("hidden");
  ui.btnResetView.innerText = "Ansicht schließen";

  syncRotationControls();

  if (dialogData) startDialog(dialogData);
}

function resetViewToRoom() {
  isZoomed = false;
  rotationLocked = false;
  hideDialog();

  calculateRoomView();

  updateInfoText();
  updateNavButtons();

  // Reset-Button
  if (currentRoomIndex <= 3) {
    ui.btnResetView.classList.add("hidden");
  } else {
    ui.btnResetView.classList.remove("hidden");
    ui.btnResetView.innerText = "Zurück zum Museum";
  }

  syncRotationControls();
}

function syncRotationControls() {
  // Rotation Controls in Zoom nur zeigen, wenn Rotation nicht gesperrt ist
  if (isZoomed && rotationLocked) {
    rotationControlsEl.style.display = "none";
    return;
  }
  rotationControlsEl.style.display = "flex";
}

function updateInfoText() {
  ui.roomInfo.textContent = roomsData[currentRoomIndex].name;
}

/* ---------------------------
   DIALOG
--------------------------- */

function startDialog(dialogData) {
  if (!dialogData || dialogData.length === 0) return;
  currentDialogData = dialogData;
  currentDialogStep = 0;
  ui.dialogBox.style.display = "block";
  updateDialogContent();
}

function onDialogButton() {
  // Wenn wir beim letzten Eintrag sind -> schließen
  if (currentDialogStep >= currentDialogData.length - 1) {
    hideDialog();
    return;
  }
  currentDialogStep++;
  updateDialogContent();
}

function updateDialogContent() {
  const entry = currentDialogData[currentDialogStep];
  ui.dialogTitle.innerText = entry.title;
  ui.dialogText.innerText = entry.text;

  const isLast = currentDialogStep === currentDialogData.length - 1;
  ui.dialogBtn.innerText = isLast ? "Schließen" : "Weiter";
}

function hideDialog() {
  ui.dialogBox.style.display = "none";
  currentDialogData = [];
  currentDialogStep = 0;
}

/* ---------------------------
   QUICK TRAVEL
--------------------------- */

function buildQuickTravelMenu() {
  ui.quickTravelContainer.innerHTML = "";

  roomsData.forEach((room, index) => {
    if(index === 4 || index === 5) return; // Mine/Fabrik ausblenden

    const card = document.createElement("div");
    card.className = "room-card";

    const preview = document.createElement("div");
    preview.className = "room-preview";

    if (room.thumbnail) {
      const img = document.createElement("img");
      img.src = room.thumbnail;
      img.style.cssText = "width:100%;height:100%;object-fit:cover;";
      preview.appendChild(img);
    } else {
      preview.style.background = "#" + room.color.toString(16).padStart(6, "0");
    }

    const label = document.createElement("div");
    label.className = "room-label";
    label.innerText = room.name;

    card.appendChild(preview);
    card.appendChild(label);

    card.addEventListener("click", () => {
      currentRoomIndex = index;
      currentRoomAngle = 0;
      resetViewToRoom();
      toggleGameMenu();
    });

    ui.quickTravelContainer.appendChild(card);
  });
}

/* ---------------------------
   3D ENGINE
--------------------------- */

function init3D() {
  clock = new THREE.Clock();
  const container = document.getElementById("canvas-container");

  scene = new THREE.Scene();
  const skyColor = 0xf5efe8;
  scene.background = new THREE.Color(skyColor);
  scene.fog = new THREE.Fog(skyColor, config.roomDistance - 50, config.roomDistance + 250);

  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1500);

  renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // Hinweis: outputEncoding ist in neueren Three-Versionen deprecated.
  // Wenn deine Version noch sRGBEncoding nutzt, passt das.
  if ("outputEncoding" in renderer) renderer.outputEncoding = THREE.sRGBEncoding;

  container.appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0xffffff, 0.7));

  const dirLight = new THREE.DirectionalLight(0xfff0dd, 0.8);
  dirLight.position.set(150, 300, 150);
  dirLight.castShadow = true;
  dirLight.shadow.camera.top = 300;
  dirLight.shadow.camera.bottom = -300;
  dirLight.shadow.camera.left = -300;
  dirLight.shadow.camera.right = 300;
  dirLight.shadow.mapSize.set(2048, 2048);
  scene.add(dirLight);

  createWorld();
  setTimeout(generateThumbnails, 500);

  window.addEventListener(
    "resize",
    () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    },
    false
  );
}

function generateThumbnails() {
  roomsData.forEach((room, i) => {
    if (i > 3) return;
    const xPos = i * config.roomDistance;

    camera.position.set(xPos, 40, 90);
    camera.lookAt(xPos, 10, 0);
    renderer.render(scene, camera);

    room.thumbnail = renderer.domElement.toDataURL("image/jpeg", 0.5);
  });

  buildQuickTravelMenu();
  calculateRoomView();
  renderer.render(scene, camera);
}

function createWorld() {
  const brickTex = createBrickTexture();
  const roomGeo = new THREE.BoxGeometry(config.roomSize, config.roomSize, config.roomSize);

  const quartzTex = createQuartzTexture();
  const colMat = new THREE.MeshStandardMaterial({
    map: quartzTex,
    color: 0xffffff,
    roughness: 0.3,
  });
  const colGeo = new THREE.CylinderGeometry(8, 8, config.roomSize, 64);

  const carpetMat = new THREE.MeshStandardMaterial({ color: 0x990000, roughness: 0.9 });
  const paintingGeo = new THREE.BoxGeometry(16, 24, 1);

  roomsData.forEach((data, roomIdx) => {
    const xPos = roomIdx * config.roomDistance;

    // --------------------------------------------------
// Trennwand zwischen Spezialräumen (Raum 4 & 5)
// --------------------------------------------------
{
  const wallX = (4.5) * config.roomDistance; // Mitte zwischen Raum 4 und 5

  const wallMat = new THREE.MeshStandardMaterial({
    color: 0xf5efe8,
    roughness: 0.9,
    metalness: 0.0,
    side: THREE.DoubleSide
  });

  // Dicke Wand (Box statt Plane, damit sie "echt" wirkt)
  const wall = new THREE.Mesh(
    new THREE.BoxGeometry(8, 220, 260), // dicke, höhe, breite
    wallMat
  );

  wall.position.set(wallX, 0, 0); // y = Hälfte der Höhe
  wall.castShadow = true;
  wall.receiveShadow = true;

  scene.add(wall);
}

    // ROOM SHELL / LIGHTING
    if (!data.isSpecial) {
      const roomMat = new THREE.MeshStandardMaterial({
        map: brickTex,
        color: 0xffffff,
        side: THREE.BackSide,
        roughness: 0.95,
      });
      const room = new THREE.Mesh(roomGeo, roomMat);
      room.position.set(xPos, config.roomSize / 2, 0);
      room.receiveShadow = true;
      scene.add(room);

      const pLight = new THREE.PointLight(0xffeebb, 1.0, 250);
      pLight.position.set(xPos, config.roomSize - 20, 0);
      pLight.castShadow = true;
      scene.add(pLight);

      // Säulen
      const cOff = config.roomSize / 2 - 15;
      [{ x: cOff, z: cOff }, { x: -cOff, z: cOff }, { x: cOff, z: -cOff }, { x: -cOff, z: -cOff }].forEach(
        (pos) => {
          const col = new THREE.Mesh(colGeo, colMat);
          col.position.set(pos.x + xPos, config.roomSize / 2, pos.z);
          col.castShadow = true;
          col.receiveShadow = true;
          scene.add(col);

          const pCount = roomIdx === 0 ? 2 : 1;
          for (let p = 0; p < pCount; p++) {
            const plant = createModernPlant();
            const offX = pos.x > xPos ? -12 - p * 6 : 12 + p * 6;
            const offZ = pos.z > 0 ? -12 : 12;
            plant.position.set(pos.x + xPos + offX, 0, pos.z + offZ);
            scene.add(plant);
          }
        }
      );
    } else {
      const pLight = new THREE.PointLight(0xffaa55, 1.5, 200);
      pLight.position.set(xPos, 30, 0);
      scene.add(pLight);
    }

    // Lobby Deko
    if (roomIdx === 0) {
      const carpet = new THREE.Mesh(new THREE.PlaneGeometry(20, config.roomSize - 10), carpetMat);
      carpet.rotation.x = -Math.PI / 2;
      carpet.position.set(xPos, 0.2, 0);
      carpet.receiveShadow = true;
      scene.add(carpet);

      const desk = new THREE.Mesh(
        new THREE.BoxGeometry(30, 12, 10),
        new THREE.MeshStandardMaterial({ color: 0x333333 })
      );
      desk.position.set(xPos, 6, 60);
      desk.castShadow = true;
      scene.add(desk);

      const sign = new THREE.Mesh(
        new THREE.BoxGeometry(40, 10, 2),
        new THREE.MeshStandardMaterial({ map: createStationSignTexture("MUSEUM - DAMPFMASCHINE") })
      );
      sign.position.set(xPos, 25, 78);
      sign.rotation.y = Math.PI;
      scene.add(sign);

      const bL = new THREE.Mesh(new THREE.BoxGeometry(10, 6, 30), new THREE.MeshStandardMaterial({ color: 0x5d4037 }));
      bL.position.set(xPos - 50, 3, 0);
      bL.castShadow = true;
      scene.add(bL);

      const bR = bL.clone();
      bR.position.set(xPos + 50, 3, 0);
      scene.add(bR);

      for (let w = 0; w < 4; w++) {
        const paint = new THREE.Mesh(paintingGeo, new THREE.MeshStandardMaterial({ map: createPaintingTexture() }));
        if (w < 2) {
          paint.position.set(xPos - 78, 25, -20 + w * 40);
          paint.rotation.y = Math.PI / 2;
        } else {
          paint.position.set(xPos + 78, 25, -20 + (w - 2) * 40);
          paint.rotation.y = -Math.PI / 2;
        }
        scene.add(paint);
      }
    }

    if (roomIdx === 1) {
      const mainCarpet = new THREE.Mesh(new THREE.PlaneGeometry(20, config.roomSize - 30), carpetMat);
      mainCarpet.rotation.x = -Math.PI / 2;
      mainCarpet.position.set(xPos, 0.2, 0);
      mainCarpet.receiveShadow = true;
      scene.add(mainCarpet);

      const crossCarpet = new THREE.Mesh(new THREE.PlaneGeometry(80, 20), carpetMat);
      crossCarpet.rotation.x = -Math.PI / 2;
      crossCarpet.position.set(xPos, 0.21, 0);
      crossCarpet.receiveShadow = true;
      scene.add(crossCarpet);
    }

    // OBJEKTE
    data.objects.forEach((objData) => {
      let mesh;
      const objX = xPos + (objData.xOffset || 0);

      if (objData.type === "locomotive_fountain") {
        mesh = createLocomotiveFountain();
        mesh.position.set(objX, 0, objData.z);
        if (roomIdx === 0) fountainRef = mesh;
      } else if (objData.type === "portrait") {
        mesh = createPortraitFrame(objData.image);
        mesh.position.set(objX, 25, objData.z);
        mesh.rotation.set(0, 0, 0);
      } else if (objData.type === "teapot") {
        const pod = createMuseumPodium();
        pod.position.set(objX, 0, objData.z);
        scene.add(pod);
        mesh = createWattTeapot();
        mesh.position.set(objX, 10, objData.z);
      } else if (objData.type === "anvil") {
        const pod = createMuseumPodium();
        pod.position.set(objX, 0, objData.z);
        scene.add(pod);
        mesh = createNewcomenAnvil();
        mesh.position.set(objX, 10, objData.z);
      } else if (objData.type === "mini_mountain") {
        const pod = createMuseumPodium();
        pod.position.set(objX, 0, objData.z);
        scene.add(pod);
        mesh = createMiniMountain();
        mesh.position.set(objX, 10, objData.z);
      } else if (objData.type === "mini_factory") {
        const pod = createMuseumPodium();
        pod.position.set(objX, 0, objData.z);
        scene.add(pod);
        mesh = createMiniFactory();
        mesh.position.set(objX, 10, objData.z);
      } else if (objData.type === "mine_environment") {
        mesh = createMineCave();
        mesh.position.set(objX, 0, objData.z);
      } else if (objData.type === "deep_newcomen") {
        mesh = createDeepMineNewcomen();
        mesh.position.set(objX, 0.1, objData.z);
      } else if (objData.type === "factory_watt") {
        mesh = createFactoryWatt();
        mesh.position.set(objX, 0.1, objData.z);
      } else if (objData.type === "blueprint") {
        mesh = createBlueprintFrame(objData.image);
        mesh.position.set(objX, 30, objData.z);
        if (objData.rotationY) mesh.rotation.y = objData.rotationY;
      } else if (objData.type === 'steam_locomotive_display') {
    const pod = createMuseumPodium(); pod.position.set(objX, 0, objData.z); scene.add(pod);
    mesh = createSteamLocomotiveDisplay(); 
    mesh.position.set(objX, 10, objData.z);
}
else if (objData.type === 'steamship') {
    const pod = createMuseumPodium(); pod.position.set(objX, 0, objData.z); scene.add(pod);
    mesh = createSteamship();
    mesh.position.set(objX, 10, objData.z);
}
else if (objData.type === 'power_loom') {
    const pod = createMuseumPodium(); pod.position.set(objX, 0, objData.z); scene.add(pod);
    mesh = createPowerLoom();
    mesh.position.set(objX, 10, objData.z);
} else {
        const pod = createMuseumPodium();
        pod.position.set(objX, 0, objData.z);
        scene.add(pod);

        const mat = new THREE.MeshStandardMaterial({ color: objData.color });
        mesh =
          objData.type === "cube"
            ? new THREE.Mesh(new THREE.BoxGeometry(20, 20, 20), mat)
            : new THREE.Mesh(new THREE.SphereGeometry(14), mat);

        mesh.position.set(objX, 25, objData.z);
      }

      if (!mesh) return;

      mesh.castShadow = true;
      scene.add(mesh);

      if (!objData.label) return;

      const labelDiv = document.createElement("div");
      labelDiv.className = "object-label";
      labelDiv.innerText = objData.label;

      const offsetVec = new THREE.Vector3(objData.zoomOffset.x, objData.zoomOffset.y, objData.zoomOffset.z);
      const tRoom = objData.targetRoomIndex;
      const dData = objData.dialog;

      // ✅ FIX: allowRotation wird jetzt wirklich respektiert
      const allowRot = objData.allowRotation !== false;

      labelDiv.addEventListener("click", (e) => {
        e.stopPropagation();
        if (currentRoomIndex !== roomIdx) return;
        focusOnObject(mesh, offsetVec, allowRot, dData, tRoom);
      });

      ui.labelsContainer.appendChild(labelDiv);

      activeObjects.push({
        mesh,
        label: labelDiv,
        roomIndex: roomIdx,
        rotate: allowRot,
        labelYOffset: objData.labelYOffset ?? null,
      });
    });
  });
}

function animate() {
  requestAnimationFrame(animate);
  const time = clock.getElapsedTime();

  if (fountainRef && fountainRef.userData.jets) {
    fountainRef.userData.jets.children.forEach((jet, i) => {
      jet.material.opacity = 0.5 + Math.sin(time * 5 + i) * 0.2;
    });
  }

  activeObjects.forEach((item) => {
    // Dampf
    if (item.mesh.userData.steam) {
      item.mesh.userData.steam.children.forEach((p) => {
        p.position.y += 0.05;
        p.scale.setScalar(1 + p.position.y / 5);
        if (p.position.y > 5) {
          p.position.y = 0;
          p.scale.setScalar(1);
        }
      });
    }

    // Rauch
    if (item.mesh.userData.smoke) {
      item.mesh.userData.smoke.children.forEach((p) => {
        p.position.y += 0.05;
        p.scale.setScalar(1 + p.position.y / 5);
        if (p.position.y > 5) {
          p.position.y = 0;
          p.scale.setScalar(1);
        }
      });
    }

    // Deckel
    if (item.mesh.userData.lid) {
      const jump = Math.abs(Math.sin(time * 10)) * 0.8;
      item.mesh.userData.lid.position.y = 7.8 + jump;
      item.mesh.userData.lid.rotation.z = (Math.random() - 0.5) * 0.1 * jump;
    }

    // Newcomen Animation
    if (item.mesh.userData.beam && item.mesh.userData.rodL) {
      const angle = Math.sin(time) * 0.2;
      item.mesh.userData.beam.rotation.z = angle;
      item.mesh.userData.rodL.position.y = 20 + angle * -15;
      if (item.mesh.userData.rodR) item.mesh.userData.rodR.position.y = 14 + angle * 20;
    }

     // NEU: Wasser FX (stoßweise + Spritzer)
if (item.mesh.userData.pumpedWater && item.mesh.userData.beam) {
  const jet = item.mesh.userData.pumpedWater;
  const spray = item.mesh.userData.sprayGroup;
  const puddle = item.mesh.userData.puddle;

  // Pump-Phase: Newcomen wirkt stoßweise -> wir machen harte Peaks
  let s = (Math.sin(time * 1) * 0.5 + 0.5);  // 0..1
  // "stoß" verstärken (macht kurze Druckspitzen)
  const burst = Math.pow(s, 6);               // 0..1, sehr kurze Peaks

  // Jet pulst: länger + etwas dicker bei Burst
  jet.scale.y = 0.10 + burst * 1.35;
  jet.scale.x = 0.85 + burst * 0.25;
  jet.scale.z = 0.85 + burst * 0.25;

  jet.material.opacity = 0.12 + burst * 0.75;

  // leichtes “Wackeln” (macht es lebendiger)
  jet.rotation.z = Math.sin(time * 7.0) * 0.03 * burst;
  jet.rotation.x = Math.sin(time * 6.0) * 0.02 * burst;

  // Spritzer spawnen NUR bei Burst
  if (spray && burst > 0.65) {
    // pro Peak ein paar Drops aktivieren
    for (let n = 0; n < 3; n++) {
      // suche einen inaktiven Tropfen
      for (let i = 0; i < spray.children.length; i++) {
        const d = spray.children[i];
        if (!d.visible) {
          d.visible = true;
          d.position.set(0, 0, 0);

          // Geschwindigkeit: nach vorne + oben, mit Streuung
          d.userData.vel.set(
            (Math.random() - 0.5) * 0.6,
            0.9 + Math.random() * 0.9,
            1.1 + Math.random() * 1.2
          );

          d.userData.life = 0.6 + Math.random() * 0.4; // Sekunden-ish
          break;
        }
      }
    }
  }

  // Drops bewegen + fallen lassen
  if (spray) {
    const gravity = 2.6; // mehr = schnelleres Fallen
    for (let i = 0; i < spray.children.length; i++) {
      const d = spray.children[i];
      if (!d.visible) continue;

      // Bewegung
      d.position.x += d.userData.vel.x * 0.18;
      d.position.y += d.userData.vel.y * 0.18;
      d.position.z += d.userData.vel.z * 0.18;

      // gravity
      d.userData.vel.y -= gravity * 0.02;

      // life runter
      d.userData.life -= 0.02;

      // ausblenden gegen Ende
      d.material.opacity = Math.max(0, d.userData.life);

      // wenn “tot” oder zu tief -> deaktivieren
      if (d.userData.life <= 0 || d.position.y < -14) {
        d.visible = false;
        d.material.opacity = 0.55;
      }
    }
  }

  // Pfütze pulst ganz leicht mit (optional, wirkt wie “mehr Wasser”)
  if (puddle) {
    puddle.scale.setScalar(1.0 + burst * 0.05);
    puddle.material.opacity = 0.45 + burst * 0.10;
  }
}

// ---- Lokomotive Animation (Räder + Kolben + Rauch)
    if (item.mesh.userData.trainWheels) {
        const speed = 4.0; // Geschwindigkeit
        const wheelAngle = time * speed;

        // 1. Alle Räder drehen
        item.mesh.userData.trainWheels.forEach(w => w.rotation.z = wheelAngle);
        if (item.mesh.userData.tenderWheels) {
            item.mesh.userData.tenderWheels.forEach(w => w.rotation.z = wheelAngle);
        }

        // 2. Kolben bewegen (Pistons)
        // Die Kolben müssen rein und raus fahren basierend auf der Raddrehung
        if (item.mesh.userData.pistons) {
            const p = item.mesh.userData.pistons;
            // Wir nutzen Sinus für die Bewegung
            // Da die Zylinder schräg sind, schieben wir entlang des Richtungsvektors
            // Der Hub (Stroke) ist ca 2.5 Einheiten
            const stroke = Math.sin(wheelAngle) * 2.5; 
            
            // Linker Kolben
            // Origin ist die Startposition im Zylinder
            if (p.originL) {
                p.left.position.copy(p.originL).addScaledVector(p.direction, stroke);
            }
            
            // Rechter Kolben (um 90 grad / PI/2 versetzt für gleichmäßigen Lauf, oder 180 für Gegentakt)
            // Bei Loks oft 90 Grad Versatz, hier machen wir 180 (Gegentakt) für visuelle Klarheit
            const strokeR = Math.sin(wheelAngle + Math.PI) * 2.5;
            if (p.originR) {
                p.right.position.copy(p.originR).addScaledVector(p.direction, strokeR);
            }
        }

        // 3. Rauch
        if (item.mesh.userData.smoke) {
            item.mesh.userData.smoke.children.forEach((p, i) => {
                p.position.y += 0.04;
                p.position.x += 0.015 * Math.sin(time * 2 + i); // Leichter Wind nach hinten
                p.material.opacity = 0.25 - (p.position.y / 20); // Ausblenden
                p.scale.setScalar(1.0 + p.position.y * 0.15);
                
                // Reset wenn zu hoch
                if (p.position.y > 15) { 
                    p.position.set((Math.random()-.5), 0, (Math.random()-.5)); 
                    p.scale.setScalar(1.0);
                }
            });
        }
    }

// ---- Dampfschiff Animation (Schaufelrad + Dampf)
if (item.mesh.userData.paddleWheel) {
  item.mesh.userData.paddleWheel.rotation.z += 0.08;
}

if (item.mesh.userData.steam) {
  const steam = item.mesh.userData.steam;

  // Einmalig: Startwerte merken (damit nichts wegdriftet)
  if (!steam.userData._init) {
    steam.userData._init = true;

    steam.children.forEach((p, i) => {
      p.userData.baseX = p.position.x;
      p.userData.baseZ = p.position.z;
      p.userData.baseY = p.position.y;
      p.userData.seed  = Math.random() * 1000;
    });
  }

  steam.children.forEach((p, i) => {
    // nur nach oben
    p.position.y += 0.03;

    // kleine Wobble um die Basis (KEIN dauerhaftes Wegdriften)
    const s = p.userData.seed;
    p.position.x = p.userData.baseX + Math.sin(time * 1.8 + s + i) * 0.08;
    p.position.z = p.userData.baseZ + Math.cos(time * 1.6 + s + i) * 0.08;

    // optisch: langsam größer, leicht pulsierende Opacity
    p.scale.setScalar(0.8 + p.position.y * 0.18);
    p.material.opacity = 0.18 + 0.08 * Math.sin(time * 2.2 + i + s);

    // Reset wenn zu hoch
    if (p.position.y > p.userData.baseY + 10) {
      p.position.y = p.userData.baseY;
      // optional: seed neu, damit es natürlicher wirkt
      p.userData.seed = Math.random() * 1000;
    }
  });
}

// ---- Webstuhl Animation (Antrieb, Schiffchen, Lade)
if (item.mesh.userData.loom) {
    const loom = item.mesh.userData.loom;
    const speed = 4.0; // Arbeitsgeschwindigkeit

    // 1. Antriebswelle & Schwungrad drehen sich
    if (loom.drive) loom.drive.rotation.x -= 0.1;

    // 2. Die Lade (Beater) schwingt
    // Nutzung von rotation.x (statt position.z) für natürliche Pendelbewegung um den Fußpunkt
    if (loom.beater) {
        // Schwingt zwischen "offen" (hinten) und "Anschlag" (vorne)
        // Math.sin sorgt für den Rhythmus
        loom.beater.rotation.x = Math.sin(time * speed) * 0.15 + 0.05;
    }

    // 3. Schiffchen (Shuttle) flitzt hin und her
    if (loom.shuttle) {
        // Nutzung von Cosinus, damit die Bewegung phasenversetzt zum Schlagen ist
        // (Das Schiffchen fliegt, wenn die Lade hinten ist)
        loom.shuttle.position.x = Math.cos(time * speed) * 6.0;
    }

    // 4. Kettbaum wickelt langsam Garn ab
    if (loom.warpBar) loom.warpBar.rotation.x += 0.005;
}


    // Watt Animation
    if (item.mesh.userData.flywheel) {
      item.mesh.userData.flywheel.rotation.z -= 0.05;
      if (item.mesh.userData.flyPulley) {
  item.mesh.userData.flyPulley.rotation.x -= 0.12; // z.B. schneller als Flywheel
}
      if (item.mesh.userData.targetPulley) item.mesh.userData.targetPulley.rotation.x -= 0.05;
      if (item.mesh.userData.pipe) item.mesh.userData.pipe.position.y = -Math.sin(time * 3) * 3 + 9;
      if (item.mesh.userData.flypipe) item.mesh.userData.flypipe.position.y = Math.sin(time * 3) * 3 + 9;
      if (item.mesh.userData.belt) {
  const b = item.mesh.userData.belt;
  // FlatBelt: mehrere Meshes
  if (b.isGroup && b.children.length && b.children[0].material && b.children[0].material.map) {
    b.children[0].material.map.offset.y -= 0.02; // y wirkt besser bei Band-Segmenten
  }
  // alter Fall: einzelnes Mesh
  else if (b.material && b.material.map) {
    b.material.map.offset.x -= 0.02;
  }
}
      if (item.mesh.userData.beam) item.mesh.userData.beam.rotation.z = Math.sin(time * 3) * 0.2;
    }

    // Allgemeine Rotation
    if (
      item.roomIndex === currentRoomIndex &&
      item.rotate &&
      !item.mesh.userData.beam &&
      !item.mesh.userData.smoke &&
      !isZoomed // optional: während Zoom nicht auto-rotieren
    ) {
      item.mesh.rotation.y += 0.005;
    }
  });

  camera.position.lerp(currentCameraTarget, 0.05);
  actualLookAt.lerp(currentLookAtTarget, 0.05);
  camera.lookAt(actualLookAt);

  updateLabels();
  renderer.render(scene, camera);
}

function updateLabels() {
  const tempV = new THREE.Vector3();

  activeObjects.forEach((item) => {
    if (item.roomIndex !== currentRoomIndex) {
      item.label.style.display = "none";
      return;
    }

    item.mesh.updateWorldMatrix(true, false);
    item.mesh.getWorldPosition(tempV);

    // Label Höhe: entweder custom oder default
    const yOff = item.labelYOffset != null ? item.labelYOffset : 35.0;
    tempV.y += yOff;

    tempV.project(camera);

    // NDC z muss in [-1, 1] liegen, sonst ist es hinter/außer Sicht
    if (Math.abs(tempV.z) > 1) {
      item.label.style.display = "none";
      return;
    }

    const x = (tempV.x * 0.5 + 0.5) * window.innerWidth;
    const y = (tempV.y * -0.5 + 0.5) * window.innerHeight;

    item.label.style.left = `${x}px`;
    item.label.style.top = `${y}px`;
    item.label.style.display = "flex";
  });
}

init();

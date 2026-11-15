import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { createGeometry } from "./utils/mesh";

// ==============================
// SCALE
// ==============================

const SUN_SCALE = 2.5;
const PLANET_SCALE = 0.1;
const ORBIT_SCALE = 9;

const ROTATION_SPEED = 0.2;
const REVOLUTION_SPEED = 20;

// ==============================
// PLANET DATA
// ==============================

const planets = {
  sun: 696350,
  mercury: 2439.5,
  venus: 6052,
  earth: 6371,
  moon: 1737.4,
  mars: 3390,
  jupiter: 69910,
  saturn: 58230,
  uranus: 25362,
  neptune: 24622,
};

export const planetRotation = {
  mercury: { rotation: 58.6, revolution: 88, direction: 1 },
  venus: { rotation: 243, revolution: 224.7, direction: -1 },
  earth: { rotation: 1, revolution: 365.25, direction: 1 },
  moon: { rotation: 27.3, revolution: 27.3, direction: 1 },
  mars: { rotation: 1.03, revolution: 687, direction: 1 },
  jupiter: { rotation: 0.41, revolution: 4333, direction: 1 },
  saturn: { rotation: 0.44, revolution: 10759, direction: 1 },
  uranus: { rotation: 0.72, revolution: 30687, direction: -1 },
  neptune: { rotation: 0.67, revolution: 60190, direction: 1 },
};

export const planetOrbit = {
  mercury: 0.387,
  venus: 0.723,
  earth: 1,
  mars: 1.524,
  jupiter: 5.203,
  saturn: 9.537,
  uranus: 19.19,
  neptune: 30.07,
};

// ==============================
// HELPER FUNCTIONS
// ==============================

const getSunRadius = (radius) => (radius / planets.sun) * SUN_SCALE;

const getPlanetRadius = (radius) => (radius / planets.sun) * SUN_SCALE;

const getOrbitDistance = (distance) => distance * ORBIT_SCALE;

// ==============================
// SCENE
// ==============================

const renderer = new THREE.WebGLRenderer({
  antialias: true,
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

document.body.style.margin = "0";
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);

camera.position.set(0, 0, 200);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// ==============================
// LIGHT
// ==============================

const ambientLight = new THREE.AmbientLight(0x333333);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 1000, 50500);
scene.add(pointLight);

// ==============================
// TEXTURES
// ==============================

const textureLoader = new THREE.TextureLoader();

const skyTexture = await textureLoader.loadAsync("/sky.jpg");

skyTexture.mapping = THREE.EquirectangularReflectionMapping;
skyTexture.colorSpace = THREE.SRGBColorSpace;

scene.background = skyTexture;

// ==============================
// SUN
// ==============================

const sunGeo = new THREE.SphereGeometry(getSunRadius(planets.sun), 64, 64);

const sunMat = new THREE.MeshBasicMaterial({
  map: textureLoader.load("/sun.jpg"),
});

const sunMesh = new THREE.Mesh(sunGeo, sunMat);
scene.add(sunMesh);

// ==============================
// PLANET MESHES
// ==============================

const mercuryMesh = createGeometry(
  getPlanetRadius(planets.mercury),
  "/mercury.jpg",
);

const venusMesh = createGeometry(getPlanetRadius(planets.venus), "/venus.jpg");

const earthMesh = createGeometry(getPlanetRadius(planets.earth), "/earth.jpg");

const marsMesh = createGeometry(getPlanetRadius(planets.mars), "/mars.jpg");

const jupiterMesh = createGeometry(
  getPlanetRadius(planets.jupiter),
  "/jupiter.jpg",
);

const saturnMesh = createGeometry(
  getPlanetRadius(planets.saturn),
  "/saturn.jpg",
);

const uranusMesh = createGeometry(
  getPlanetRadius(planets.uranus),
  "/uranus.jpg",
);

const neptuneMesh = createGeometry(
  getPlanetRadius(planets.neptune),
  "/neptune.jpg",
);

// ==============================
// SATURN RING
// ==============================

const ringTexture = textureLoader.load("/saturn_ring.png");

ringTexture.colorSpace = THREE.SRGBColorSpace;

const saturnRadius = getPlanetRadius(planets.saturn);

const ringGeo = new THREE.RingGeometry(
  saturnRadius * 1.2,
  saturnRadius * 2.3,
  128,
);

const ringMat = new THREE.MeshBasicMaterial({
  map: ringTexture,
  side: THREE.DoubleSide,
  transparent: true,
  alphaTest: 0.05,
  depthWrite: false,
});

const ringMesh = new THREE.Mesh(ringGeo, ringMat);

ringMesh.rotation.x = -Math.PI / 2;
ringMesh.rotation.z = THREE.MathUtils.degToRad(15);

saturnMesh.add(ringMesh);

// ==============================
// PLANET PIVOTS
// ==============================

const planetMeshes = {
  mercury: mercuryMesh,
  venus: venusMesh,
  earth: earthMesh,
  mars: marsMesh,
  jupiter: jupiterMesh,
  saturn: saturnMesh,
  uranus: uranusMesh,
  neptune: neptuneMesh,
};

const planetPivots = {};

Object.entries(planetMeshes).forEach(([name, mesh]) => {
  const pivot = new THREE.Group();

  scene.add(pivot);
  pivot.add(mesh);

  mesh.position.set(getOrbitDistance(planetOrbit[name]), 0, 0);

  planetPivots[name] = pivot;
});

// ==============================
// MOON
// ==============================

const moonMesh = createGeometry(getPlanetRadius(planets.moon), "/moon.jpg");

const moonPivot = new THREE.Group();

earthMesh.add(moonPivot);

const moonDistance = 1;

moonMesh.position.x = moonDistance;

moonPivot.add(moonMesh);

// ==============================
// ORBIT RINGS
// ==============================

function createOrbit(radius) {
  const geometry = new THREE.RingGeometry(radius - 0.015, radius + 0.015, 256);

  const material = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.25,
    depthWrite: false,
  });

  const orbit = new THREE.Mesh(geometry, material);

  orbit.rotation.x = -Math.PI / 2;

  return orbit;
}

Object.values(planetOrbit).forEach((distance) => {
  const orbit = createOrbit(getOrbitDistance(distance));

  scene.add(orbit);
});

// ==============================
// ANIMATION
// ==============================

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();

  // Sun rotation
  sunMesh.rotation.y += delta * 0.1;

  // Planet rotation and revolution
  Object.entries(planetMeshes).forEach(([name, mesh]) => {
    const data = planetRotation[name];

    // Rotation around own axis
    const rotationAngle =
      (delta * ROTATION_SPEED * Math.PI * 2) / data.rotation;

    mesh.rotation.y += rotationAngle * data.direction;

    // Revolution around Sun
    const revolutionAngle =
      (delta * REVOLUTION_SPEED * Math.PI * 2) / data.revolution;

    planetPivots[name].rotation.y += revolutionAngle;
  });

  // Moon revolution around Earth
  const moonAngle =
    (delta * REVOLUTION_SPEED * Math.PI * 2) / planetRotation.moon.revolution;

  moonPivot.rotation.y += moonAngle;

  // Moon rotation around own axis
  const moonRotation =
    (delta * ROTATION_SPEED * Math.PI * 2) / planetRotation.moon.rotation;

  moonMesh.rotation.y += moonRotation;

  controls.update();

  renderer.render(scene, camera);
}

animate();

// ==============================
// RESIZE
// ==============================

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;

  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
});

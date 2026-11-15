# Three.js Solar System

A simplified interactive 3D model of the Solar System built with
Three.js.

## Features

-   Textured Sun with lighting
-   Textures for all eight planets
-   Circular orbital paths centered on the Sun
-   Planetary rotation around each planet's own axis
-   Planetary revolution around the Sun
-   Moon orbiting the Earth
-   Saturn's textured alpha-transparent ring
-   Camera controls with `OrbitControls`
-   Responsive rendering when the browser window is resized

## Project assets

Place the following image files in the Vite project's `public`
directory:

``` text
public/
├── sky.jpg
├── sun.jpg
├── mercury.jpg
├── venus.jpg
├── earth.jpg
├── moon.jpg
├── mars.jpg
├── jupiter.jpg
├── saturn.jpg
├── saturn_ring.png
├── uranus.jpg
└── neptune.jpg
```

The project imports a `createGeometry` helper from `./utils/mesh`. It
should return a Three.js mesh for a textured sphere.

Example implementation:

``` js
import * as THREE from "three";

export function createGeometry(radius, texturePath) {
  const geometry = new THREE.SphereGeometry(radius, 64, 64);
  const texture = new THREE.TextureLoader().load(texturePath);

  texture.colorSpace = THREE.SRGBColorSpace;

  const material = new THREE.MeshStandardMaterial({
    map: texture,
  });

  return new THREE.Mesh(geometry, material);
}
```

## Complete implementation

Place the following code in your main JavaScript module:

``` js
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { createGeometry } from "./utils/mesh";

// ==============================
// SCALE
// ==============================

const SUN_SCALE = 2.5;
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

const planetRotation = {
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

const planetOrbit = {
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

// Planet radii are scaled relative to the Sun.
const getSunRadius = (radius) =>
  (radius / planets.sun) * SUN_SCALE;

const getPlanetRadius = (radius) =>
  (radius / planets.sun) * SUN_SCALE;

// Orbital distances are based on astronomical units (AU).
const getOrbitDistance = (distance) =>
  distance * ORBIT_SCALE;

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
  1000
);

camera.position.set(0, 0, 200);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// ==============================
// LIGHTING
// ==============================

const ambientLight = new THREE.AmbientLight(0x333333);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 1000, 50500);
scene.add(pointLight);

// ==============================
// TEXTURES AND BACKGROUND
// ==============================

const textureLoader = new THREE.TextureLoader();

const skyTexture = await textureLoader.loadAsync("/sky.jpg");

skyTexture.mapping = THREE.EquirectangularReflectionMapping;
skyTexture.colorSpace = THREE.SRGBColorSpace;

scene.background = skyTexture;

// ==============================
// SUN
// ==============================

const sunGeo = new THREE.SphereGeometry(
  getSunRadius(planets.sun),
  64,
  64
);

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
  "/mercury.jpg"
);

const venusMesh = createGeometry(
  getPlanetRadius(planets.venus),
  "/venus.jpg"
);

const earthMesh = createGeometry(
  getPlanetRadius(planets.earth),
  "/earth.jpg"
);

const marsMesh = createGeometry(
  getPlanetRadius(planets.mars),
  "/mars.jpg"
);

const jupiterMesh = createGeometry(
  getPlanetRadius(planets.jupiter),
  "/jupiter.jpg"
);

const saturnMesh = createGeometry(
  getPlanetRadius(planets.saturn),
  "/saturn.jpg"
);

const uranusMesh = createGeometry(
  getPlanetRadius(planets.uranus),
  "/uranus.jpg"
);

const neptuneMesh = createGeometry(
  getPlanetRadius(planets.neptune),
  "/neptune.jpg"
);

// ==============================
// SATURN'S RING
// ==============================

const ringTexture = textureLoader.load("/saturn_ring.png");

ringTexture.colorSpace = THREE.SRGBColorSpace;

const saturnRadius = getPlanetRadius(planets.saturn);

const ringGeo = new THREE.RingGeometry(
  saturnRadius * 1.2,
  saturnRadius * 2.3,
  128
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

  // Keep the planet at a fixed distance from its pivot.
  mesh.position.set(getOrbitDistance(planetOrbit[name]), 0, 0);

  planetPivots[name] = pivot;
});

// ==============================
// MOON
// ==============================

const moonMesh = createGeometry(
  getPlanetRadius(planets.moon),
  "/moon.jpg"
);

const moonPivot = new THREE.Group();
earthMesh.add(moonPivot);

const moonDistance = 1;
moonMesh.position.x = moonDistance;

moonPivot.add(moonMesh);

// ==============================
// ORBIT PATHS
// ==============================

function createOrbit(radius) {
  const geometry = new THREE.RingGeometry(
    radius - 0.015,
    radius + 0.015,
    256
  );

  const material = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.25,
    depthWrite: false,
  });

  const orbit = new THREE.Mesh(geometry, material);

  // RingGeometry is created in the XY plane.
  // Rotate it onto the XZ plane.
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

  // Rotate the Sun around its own axis.
  sunMesh.rotation.y += delta * 0.1;

  // Planet axial rotation and revolution around the Sun.
  Object.entries(planetMeshes).forEach(([name, mesh]) => {
    const data = planetRotation[name];

    const rotationAngle =
      (delta * ROTATION_SPEED * Math.PI * 2) / data.rotation;

    mesh.rotation.y += rotationAngle * data.direction;

    const revolutionAngle =
      (delta * REVOLUTION_SPEED * Math.PI * 2) / data.revolution;

    planetPivots[name].rotation.y += revolutionAngle;
  });

  // Moon revolution around Earth.
  const moonAngle =
    (delta * REVOLUTION_SPEED * Math.PI * 2) /
    planetRotation.moon.revolution;

  moonPivot.rotation.y += moonAngle;

  // Moon axial rotation.
  const moonRotation =
    (delta * ROTATION_SPEED * Math.PI * 2) /
    planetRotation.moon.rotation;

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
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});
```

## How the animation works

### 1. Axial rotation

``` js
mesh.rotation.y += rotationAngle * data.direction;
```

This rotates a planet around its own axis.

### 2. Revolution around the Sun

``` js
planetPivots[name].rotation.y += revolutionAngle;
```

Each planet is placed inside its own `THREE.Group()`. Rotating that
group moves the planet around the Sun while keeping its orbital distance
constant.

### 3. Drawing orbital paths

``` js
const orbit = createOrbit(getOrbitDistance(distance));
scene.add(orbit);
```

The orbital paths are added directly to the scene and centered on the
origin, where the Sun is located. They are not children of the planet
pivot groups because the paths should remain stationary.

## Configuration

  Parameter            Purpose
  -------------------- ------------------------------------------------
  `SUN_SCALE`          Visual scale of the Sun's radius
  `ORBIT_SCALE`        Visual scale of planetary orbital distances
  `ROTATION_SPEED`     Speed multiplier for axial rotation
  `REVOLUTION_SPEED`   Speed multiplier for revolution around the Sun
  `moonDistance`       Visual distance between Earth and the Moon

## Notes and limitations

-   Planet radii are scaled relative to the Sun.
-   Orbital distances are based on astronomical units (AU), then scaled
    for visualization.
-   `ROTATION_SPEED` and `REVOLUTION_SPEED` are visual speed
    multipliers; this is not a real-time 1:1 simulation.
-   The orbital paths are circular. Real planetary orbits are
    elliptical.
-   The Moon's distance is intentionally exaggerated with
    `moonDistance = 1` so it is easier to see.
-   Axial tilts and orbital inclinations are simplified.

## Run the project

For a Vite project, install dependencies and start the development
server:

``` bash
npm install
npm run dev
```

Open the local URL printed by Vite in your browser.

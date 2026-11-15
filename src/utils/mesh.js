import * as THREE from "three";

const textureLoader = new THREE.TextureLoader();

const DAYS_PER_SECOND = 10;

export const createGeometry = (radius, map) => {
  const geometry = new THREE.SphereGeometry(radius, 64, 64);

  const texture = textureLoader.load(map);
  texture.colorSpace = THREE.SRGBColorSpace;

  const material = new THREE.MeshStandardMaterial({
    map: texture,
  });

  const sphere = new THREE.Mesh(geometry, material);

  return sphere;
};

// AgriTwin — Dynamic 3D Digital Twin Component
// Automatically adapts to the user's selected field & crop with 4 zones,
// procedural vegetation, sensor markers, and animated sprinkler mist.

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { useFields } from '../../context/FieldsContext';
import { useTelemetry } from '../../context/TelemetryContext';
import { RotateCcw, Droplets, Eye } from 'lucide-react';

export default function DynamicDigitalTwin({ height = 540 }) {
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const zonePlanesRef = useRef({});
  const sprinklerMistRef = useRef(null);
  const animFrameId = useRef(null);

  const { activeField } = useFields();
  const { zones, isIrrigatingZone2, waterZone2 } = useTelemetry();
  const [hoveredZone, setHoveredZone] = useState(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x0a1c15);
    scene.fog = new THREE.FogExp2(0x0a1c15, 0.02);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.5, 100);
    camera.position.set(0, 13, 16);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    rendererRef.current = renderer;
    container.replaceChildren(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2.15;
    controls.minDistance = 6;
    controls.maxDistance = 32;
    controls.target.set(0, 0, 0);
    controlsRef.current = controls;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xe2fbe8, 0.9);
    scene.add(ambientLight);

    const sun = new THREE.DirectionalLight(0xfffbeb, 1.4);
    sun.position.set(10, 18, 8);
    sun.castShadow = true;
    scene.add(sun);

    // Ground Base
    const baseGeo = new THREE.BoxGeometry(16.5, 0.4, 16.5);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x162c22, roughness: 0.9 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = -0.22;
    scene.add(base);

    // 4 Zones Positions
    // Zone 1: NW (-3.8, -3.8), Zone 2: NE (3.8, -3.8)
    // Zone 3: SW (-3.8, 3.8), Zone 4: SE (3.8, 3.8)
    const zoneLayout = {
      zone1: { x: -3.8, z: -3.8, name: 'Zone 1' },
      zone2: { x: 3.8, z: -3.8, name: 'Zone 2' },
      zone3: { x: -3.8, z: 3.8, name: 'Zone 3' },
      zone4: { x: 3.8, z: 3.8, name: 'Zone 4' }
    };

    const zoneSize = 7.2;
    const planeGeo = new THREE.PlaneGeometry(zoneSize, zoneSize);
    planeGeo.rotateX(-Math.PI / 2);

    const meshes = {};
    Object.entries(zoneLayout).forEach(([zId, pos]) => {
      const mat = new THREE.MeshStandardMaterial({
        color: 0x10b981,
        roughness: 0.65,
        side: THREE.DoubleSide
      });
      const mesh = new THREE.Mesh(planeGeo.clone(), mat);
      mesh.position.set(pos.x, 0.02, pos.z);
      mesh.userData = { zoneId: zId, name: pos.name };
      scene.add(mesh);
      meshes[zId] = mesh;

      // Crop Vegetation Rows tailored to active crop
      const isTomato = (activeField?.crop || '').toLowerCase().includes('tomato');
      const isRice = (activeField?.crop || '').toLowerCase().includes('rice');

      for (let r = -2.6; r <= 2.6; r += 1.3) {
        for (let c = -2.8; c <= 2.8; c += 0.8) {
          const plant = new THREE.Group();

          // Stem
          const stemGeo = new THREE.CylinderGeometry(0.04, 0.07, isTomato ? 0.6 : 0.8, 5);
          const stemMat = new THREE.MeshStandardMaterial({ color: 0x15803d });
          const stem = new THREE.Mesh(stemGeo, stemMat);
          stem.position.y = 0.35;
          plant.add(stem);

          // Foliage
          const leafGeo = new THREE.ConeGeometry(0.24, 0.45, 4);
          const leafMat = new THREE.MeshStandardMaterial({ color: 0x22c55e });
          const leaf = new THREE.Mesh(leafGeo, leafMat);
          leaf.position.y = 0.55;
          plant.add(leaf);

          // Red Tomato Fruit if Tomato crop
          if (isTomato) {
            const fruitGeo = new THREE.SphereGeometry(0.08, 6, 6);
            const fruitMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3 });
            const fruit = new THREE.Mesh(fruitGeo, fruitMat);
            fruit.position.set(0.12, 0.35, 0.08);
            plant.add(fruit);
          }

          plant.position.set(pos.x + c, 0.02, pos.z + r);
          scene.add(plant);
        }
      }

      // Sensor Pin Beacon
      const pin = new THREE.Group();
      pin.position.set(pos.x + 1.8, 0.02, pos.z + 1.8);
      const poleGeo = new THREE.CylinderGeometry(0.05, 0.05, 1.2, 6);
      const poleMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0 });
      const pole = new THREE.Mesh(poleGeo, poleMat);
      pole.position.y = 0.6;
      pin.add(pole);

      const beaconHead = new THREE.Mesh(
        new THREE.SphereGeometry(0.14, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
      );
      beaconHead.position.y = 1.3;
      pin.add(beaconHead);

      scene.add(pin);
    });
    zonePlanesRef.current = meshes;

    // Sprinkler Water Mist Particles (Zone 2)
    const particleCount = 200;
    const pGeo = new THREE.BufferGeometry();
    const pPositions = new Float32Array(particleCount * 3);
    const pVels = [];

    for (let i = 0; i < particleCount; i++) {
      pPositions[i * 3] = 3.8 + (Math.random() - 0.5) * 4.8;
      pPositions[i * 3 + 1] = 0.4 + Math.random() * 2.2;
      pPositions[i * 3 + 2] = -3.8 + (Math.random() - 0.5) * 4.8;
      pVels.push({ y: -(0.04 + Math.random() * 0.05), x: (Math.random() - 0.5) * 0.02 });
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.12,
      transparent: true,
      opacity: 0.0
    });
    const sprinklerMist = new THREE.Points(pGeo, pMat);
    sprinklerMist.userData = { vels: pVels };
    scene.add(sprinklerMist);
    sprinklerMistRef.current = sprinklerMist;

    // Raycaster for Hover & Click
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onPointerMove = (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(Object.values(zonePlanesRef.current));
      if (hits.length > 0) {
        setHoveredZone(hits[0].object.userData.name);
      } else {
        setHoveredZone(null);
      }
    };
    renderer.domElement.addEventListener('pointermove', onPointerMove);

    // Animation Loop
    let clock = new THREE.Clock();
    const animate = () => {
      animFrameId.current = requestAnimationFrame(animate);
      controls.update();

      // Animate Sprinkler Mist
      if (sprinklerMistRef.current) {
        const mist = sprinklerMistRef.current;
        const posAttr = mist.geometry.attributes.position;
        const vels = mist.userData.vels;
        const active = mist.userData.active;
        mist.material.opacity = active ? 0.85 : 0.0;

        if (active) {
          for (let i = 0; i < particleCount; i++) {
            posAttr.array[i * 3 + 1] += vels[i].y;
            if (posAttr.array[i * 3 + 1] <= 0.1) {
              posAttr.array[i * 3 + 1] = 2.4;
            }
          }
          posAttr.needsUpdate = true;
        }
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animFrameId.current);
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      controls.dispose();
      renderer.dispose();
    };
  }, [height, activeField?.crop]);

  // Sync Zone Colors with Telemetry (Green = Good, Amber = Watch, Red = Needs Water)
  useEffect(() => {
    if (!zonePlanesRef.current) return;
    zones.forEach(z => {
      const mesh = zonePlanesRef.current[z.id];
      if (mesh) {
        let color = new THREE.Color(0x10b981); // Good
        if (z.soilWater < 25.0 || z.status === 'Needs Water') {
          color = new THREE.Color(0xef4444); // Needs Water
        } else if (z.soilWater < 40.0 || z.status === 'Watch') {
          color = new THREE.Color(0xf59e0b); // Watch
        }
        mesh.material.color.lerp(color, 0.4);
      }
    });

    if (sprinklerMistRef.current) {
      sprinklerMistRef.current.userData.active = isIrrigatingZone2;
    }
  }, [zones, isIrrigatingZone2]);

  const resetCamera = () => {
    if (controlsRef.current && cameraRef.current) {
      cameraRef.current.position.set(0, 13, 16);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  };

  return (
    <div className="twin-3d-wrapper" style={{ height: `${height}px`, position: 'relative' }}>
      <div ref={containerRef} className="twin-3d-canvas" />

      {/* Top Overlay Badge */}
      <div className="twin-overlay-controls">
        <div className="twin-overlay-badge">
          <span className="pulse-dot" style={{ background: '#10b981' }} />
          <span>3D Field Twin: <strong>{activeField?.name} ({activeField?.crop})</strong></span>
        </div>
        {hoveredZone && (
          <div className="twin-overlay-badge" style={{ borderColor: 'var(--emerald-400)' }}>
            <Eye size={14} color="var(--emerald-400)" />
            <span>Hovering: {hoveredZone}</span>
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="twin-overlay-actions">
        <button onClick={resetCamera} className="btn btn-secondary btn-sm">
          <RotateCcw size={14} /> Reset View
        </button>
        <button onClick={waterZone2} className="btn btn-water btn-sm">
          <Droplets size={14} /> {isIrrigatingZone2 ? 'Watering Active (Mist Spraying)...' : 'Water Zone 2'}
        </button>
      </div>
    </div>
  );
}

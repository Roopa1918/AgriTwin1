// AgriTwin — 3D Interactive Digital Twin Centerpiece
// Implemented with Three.js: 4 agricultural zones, crop rows, sensor beacons,
// dynamic moisture color-coding, animated irrigation sprinkler mist, raycasting & OrbitControls.

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { useTelemetry } from '../../context/TelemetryContext';
import { Maximize2, RotateCcw, Droplets, Eye, Info } from 'lucide-react';

export default function DigitalTwin3D({ onSelectZone, className = '', height = 580 }) {
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const zonesMeshesRef = useRef({});
  const cropInstancesRef = useRef({});
  const sprinklerParticlesRef = useRef(null);
  const animationFrameId = useRef(null);

  const { zones, selectedZoneId, setSelectedZoneId, triggerIrrigation } = useTelemetry();
  const [hoveredZone, setHoveredZone] = useState(null);
  const [showSensors, setShowSensors] = useState(true);
  const [showCrops, setShowCrops] = useState(true);

  // Colors
  const COLOR_HEALTHY = new THREE.Color(0x10b981);
  const COLOR_MODERATE = new THREE.Color(0xf59e0b);
  const COLOR_CRITICAL = new THREE.Color(0xef4444);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene & Camera Setup
    const width = container.clientWidth || 800;
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x07120e);
    scene.fog = new THREE.FogExp2(0x07120e, 0.025);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.5, 100);
    camera.position.set(0, 14, 17);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
    container.replaceChildren(renderer.domElement);

    // 2. Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2.1;
    controls.minDistance = 6;
    controls.maxDistance = 35;
    controls.target.set(0, 0, 0);
    controlsRef.current = controls;

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0xdcfce7, 0.8);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfffbeb, 1.6);
    sunLight.position.set(12, 20, 10);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 1;
    sunLight.shadow.camera.far = 40;
    sunLight.shadow.camera.left = -12;
    sunLight.shadow.camera.right = 12;
    sunLight.shadow.camera.top = 12;
    sunLight.shadow.camera.bottom = -12;
    scene.add(sunLight);

    const fillLight = new THREE.PointLight(0x34d399, 0.6, 25);
    fillLight.position.set(-8, 5, -8);
    scene.add(fillLight);

    // 4. Ground Foundation & Agricultural Border
    const borderGeo = new THREE.BoxGeometry(17, 0.4, 17);
    const borderMat = new THREE.MeshStandardMaterial({ color: 0x142820, roughness: 0.85, metalness: 0.1 });
    const borderMesh = new THREE.Mesh(borderGeo, borderMat);
    borderMesh.position.y = -0.22;
    borderMesh.receiveShadow = true;
    scene.add(borderMesh);

    // Subtle Ground Grid
    const gridHelper = new THREE.GridHelper(16, 16, 0x10b981, 0x064e3b);
    gridHelper.position.y = 0.01;
    scene.add(gridHelper);

    // 5. Four Agricultural Plot Zones
    // Zone 1: NW (-3.8, -3.8)
    // Zone 2: NE (3.8, -3.8)
    // Zone 3: SW (-3.8, 3.8)
    // Zone 4: SE (3.8, 3.8)
    const zonePositions = {
      zone1: { x: -3.8, z: -3.8, name: 'Zone 1' },
      zone2: { x: 3.8, z: -3.8, name: 'Zone 2' },
      zone3: { x: -3.8, z: 3.8, name: 'Zone 3' },
      zone4: { x: 3.8, z: 3.8, name: 'Zone 4' }
    };

    const zoneSize = 7.2;
    const zoneGeo = new THREE.PlaneGeometry(zoneSize, zoneSize, 8, 8);
    zoneGeo.rotateX(-Math.PI / 2);

    const zoneMeshes = {};
    Object.entries(zonePositions).forEach(([zId, pos]) => {
      const mat = new THREE.MeshStandardMaterial({
        color: 0x10b981,
        roughness: 0.7,
        metalness: 0.1,
        wireframe: false,
        side: THREE.DoubleSide
      });
      const mesh = new THREE.Mesh(zoneGeo.clone(), mat);
      mesh.position.set(pos.x, 0.04, pos.z);
      mesh.receiveShadow = true;
      mesh.userData = { zoneId: zId, name: pos.name };
      scene.add(mesh);
      zoneMeshes[zId] = mesh;

      // Soil Furrow lines across each zone
      for (let f = -zoneSize / 2 + 0.8; f <= zoneSize / 2 - 0.8; f += 1.2) {
        const furrowGeo = new THREE.BoxGeometry(zoneSize - 0.4, 0.05, 0.15);
        const furrowMat = new THREE.MeshStandardMaterial({ color: 0x0e2017, roughness: 0.9 });
        const furrow = new THREE.Mesh(furrowGeo, furrowMat);
        furrow.position.set(pos.x, 0.06, pos.z + f);
        scene.add(furrow);
      }
    });
    zonesMeshesRef.current = zoneMeshes;

    // 6. Crop Rows (Instanced Maize plants)
    const cropMeshes = {};
    const plantGeo = new THREE.CylinderGeometry(0.04, 0.08, 0.75, 5);
    const leafGeo = new THREE.ConeGeometry(0.22, 0.5, 4);
    leafGeo.rotateZ(Math.PI / 6);

    Object.entries(zonePositions).forEach(([zId, pos]) => {
      const plantGroup = new THREE.Group();
      for (let r = -2.5; r <= 2.5; r += 1.2) {
        for (let c = -2.8; c <= 2.8; c += 0.75) {
          const plant = new THREE.Group();
          const stemMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.5 });
          const stem = new THREE.Mesh(plantGeo, stemMat);
          stem.position.y = 0.38;
          stem.castShadow = true;
          plant.add(stem);

          const leafMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.4 });
          const leaf1 = new THREE.Mesh(leafGeo, leafMat);
          leaf1.position.set(0.08, 0.5, 0);
          leaf1.rotation.y = Math.random() * Math.PI;
          plant.add(leaf1);

          const leaf2 = new THREE.Mesh(leafGeo, leafMat);
          leaf2.position.set(-0.08, 0.4, 0);
          leaf2.rotation.y = -Math.PI / 3;
          plant.add(leaf2);

          plant.position.set(pos.x + c, 0.04, pos.z + r);
          plantGroup.add(plant);
        }
      }
      scene.add(plantGroup);
      cropMeshes[zId] = plantGroup;
    });
    cropInstancesRef.current = cropMeshes;

    // 7. Sensor Beacon Markers with Status Rings
    const sensorGroup = new THREE.Group();
    sensorGroup.name = 'sensorGroup';
    Object.entries(zonePositions).forEach(([zId, pos]) => {
      const beacon = new THREE.Group();
      beacon.position.set(pos.x + 1.6, 0.04, pos.z + 1.6);

      // Mast
      const mastGeo = new THREE.CylinderGeometry(0.06, 0.08, 1.4, 8);
      const mastMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.8, roughness: 0.2 });
      const mast = new THREE.Mesh(mastGeo, mastMat);
      mast.position.y = 0.7;
      beacon.add(mast);

      // Sensor Head Box
      const headGeo = new THREE.BoxGeometry(0.3, 0.25, 0.3);
      const headMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3 });
      const head = new THREE.Mesh(headGeo, headMat);
      head.position.y = 1.4;
      beacon.add(head);

      // Glowing LED Antenna
      const ledGeo = new THREE.SphereGeometry(0.09, 12, 12);
      const ledMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
      const led = new THREE.Mesh(ledGeo, ledMat);
      led.position.y = 1.6;
      beacon.add(led);

      // Pulsing Base Ground Ring
      const ringGeo = new THREE.RingGeometry(0.3, 0.45, 24);
      ringGeo.rotateX(-Math.PI / 2);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide, transparent: true, opacity: 0.6 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.y = 0.05;
      ring.name = `ring_${zId}`;
      beacon.add(ring);

      beacon.userData = { sensorZone: zId, type: 'sensor' };
      sensorGroup.add(beacon);
    });

    // Central Weather Mast
    const weatherMast = new THREE.Group();
    weatherMast.position.set(0, 0.04, 0);
    const wTowerGeo = new THREE.CylinderGeometry(0.12, 0.18, 3.2, 8);
    const wTowerMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.2 });
    const wTower = new THREE.Mesh(wTowerGeo, wTowerMat);
    wTower.position.y = 1.6;
    weatherMast.add(wTower);

    const anemometerGeo = new THREE.SphereGeometry(0.2, 8, 8);
    const anemometerMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    const anemometer = new THREE.Mesh(anemometerGeo, anemometerMat);
    anemometer.position.y = 3.3;
    weatherMast.add(anemometer);
    sensorGroup.add(weatherMast);
    scene.add(sensorGroup);

    // 8. Virtual Irrigation Sprinkler Mist Particle System (Zone 2)
    const particleCount = 280;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = [];

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = 3.8 + (Math.random() - 0.5) * 5.0; // around Zone 2
      positions[i * 3 + 1] = 0.5 + Math.random() * 2.5;
      positions[i * 3 + 2] = -3.8 + (Math.random() - 0.5) * 5.0;
      velocities.push({
        y: -(0.04 + Math.random() * 0.06),
        x: (Math.random() - 0.5) * 0.03,
        z: (Math.random() - 0.5) * 0.03
      });
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.12,
      transparent: true,
      opacity: 0.0, // hidden until active
      blending: THREE.AdditiveBlending
    });
    const sprinklerParticles = new THREE.Points(particleGeo, particleMat);
    sprinklerParticles.userData = { velocities };
    scene.add(sprinklerParticles);
    sprinklerParticlesRef.current = sprinklerParticles;

    // 9. Raycasting for Click & Hover Interactivity
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerMove = (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(Object.values(zonesMeshesRef.current));
      if (intersects.length > 0) {
        const hit = intersects[0].object.userData.zoneId;
        setHoveredZone(hit);
        container.style.cursor = 'pointer';
      } else {
        setHoveredZone(null);
        container.style.cursor = 'default';
      }
    };

    const handleClick = (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(Object.values(zonesMeshesRef.current));
      if (intersects.length > 0) {
        const hitZoneId = intersects[0].object.userData.zoneId;
        setSelectedZoneId(hitZoneId);
        if (onSelectZone) onSelectZone(hitZoneId);
      }
    };

    renderer.domElement.addEventListener('pointermove', handlePointerMove);
    renderer.domElement.addEventListener('click', handleClick);

    // 10. Animation Loop
    let clock = new THREE.Clock();
    const animate = () => {
      animationFrameId.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      controls.update();

      // Animate Anemometer spinning
      anemometer.rotation.y += 0.06;

      // Animate Beacon pulse rings
      Object.keys(zonePositions).forEach((zId) => {
        const ring = scene.getObjectByName(`ring_${zId}`);
        if (ring) {
          const s = 1 + Math.sin(time * 3 + (zId === 'zone2' ? 1 : 0)) * 0.25;
          ring.scale.set(s, s, s);
        }
      });

      // Animate Virtual Irrigation Sprinkler Mist
      if (sprinklerParticlesRef.current) {
        const pts = sprinklerParticlesRef.current;
        const posAttr = pts.geometry.attributes.position;
        const vels = pts.userData.velocities;

        // Check if Zone 2 is irrigating
        const isIrrigating = pts.userData.isActive;
        pts.material.opacity = isIrrigating ? 0.8 : 0.0;

        if (isIrrigating) {
          for (let i = 0; i < particleCount; i++) {
            posAttr.array[i * 3 + 1] += vels[i].y;
            posAttr.array[i * 3] += vels[i].x;
            posAttr.array[i * 3 + 2] += vels[i].z;

            // Reset when hitting ground
            if (posAttr.array[i * 3 + 1] <= 0.1) {
              posAttr.array[i * 3 + 1] = 2.4 + Math.random() * 0.5;
              posAttr.array[i * 3] = 3.8 + (Math.random() - 0.5) * 4.5;
              posAttr.array[i * 3 + 2] = -3.8 + (Math.random() - 0.5) * 4.5;
            }
          }
          posAttr.needsUpdate = true;
        }
      }

      renderer.render(scene, camera);
    };
    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      camera.aspect = w / height;
      camera.updateProjectionMatrix();
      renderer.setSize(w, height);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId.current);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('pointermove', handlePointerMove);
      renderer.domElement.removeEventListener('click', handleClick);
      controls.dispose();
      renderer.dispose();
    };
  }, [height]);

  // Sync 3D Colors & Status when zones telemetry changes
  useEffect(() => {
    if (!zonesMeshesRef.current) return;

    zones.forEach(zone => {
      const mesh = zonesMeshesRef.current[zone.id];
      const crops = cropInstancesRef.current[zone.id];
      if (!mesh) return;

      let targetColor = COLOR_HEALTHY;
      if (zone.status === 'LOW' || zone.moisture < 25.0) {
        targetColor = COLOR_CRITICAL;
      } else if (zone.status === 'MODERATE' || zone.moisture < 40.0) {
        targetColor = COLOR_MODERATE;
      }

      // Smooth color transition
      mesh.material.color.lerp(targetColor, 0.4);

      // Crop foliage color modulation
      if (crops) {
        crops.traverse(child => {
          if (child.isMesh && child.material) {
            if (zone.status === 'LOW') {
              child.material.color.lerp(new THREE.Color(0xb45309), 0.3); // wilting yellowish-brown
            } else {
              child.material.color.lerp(new THREE.Color(0x22c55e), 0.3); // lush green
            }
          }
        });
      }
    });

    // Update Virtual Irrigation Mist flag for Zone 2
    const z2 = zones.find(z => z.id === 'zone2');
    if (sprinklerParticlesRef.current) {
      sprinklerParticlesRef.current.userData.isActive = !!z2?.irrigationActive;
    }
  }, [zones]);

  // Camera Reset
  const resetCamera = () => {
    if (controlsRef.current && cameraRef.current) {
      cameraRef.current.position.set(0, 14, 17);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  };

  return (
    <div className={`twin-3d-wrapper ${className}`} style={{ height: `${height}px` }}>
      <div ref={containerRef} className="twin-3d-canvas" />

      {/* Top Overlays: Status Badge & Zone Quick Info */}
      <div className="twin-overlay-controls">
        <div className="twin-overlay-badge">
          <span className="pulse-dot" style={{ background: '#10b981' }} />
          <span>Three.js 3D Digital Twin — Real-Time Synced</span>
        </div>
        {hoveredZone && (
          <div className="twin-overlay-badge" style={{ borderColor: 'var(--emerald-400)' }}>
            <Eye size={14} color="var(--emerald-400)" />
            <span>Hovering: {hoveredZone.toUpperCase()} — Click to Inspect</span>
          </div>
        )}
      </div>

      {/* Bottom Action Overlays */}
      <div className="twin-overlay-actions">
        <button onClick={resetCamera} className="btn btn-secondary btn-sm" title="Reset 3D Camera">
          <RotateCcw size={14} /> Reset View
        </button>
        <button 
          onClick={() => triggerIrrigation('zone2')} 
          className="btn btn-water btn-sm"
          title="Trigger Virtual Irrigation over Zone 2"
        >
          <Droplets size={14} /> Simulate Virtual Irrigation
        </button>
      </div>
    </div>
  );
}

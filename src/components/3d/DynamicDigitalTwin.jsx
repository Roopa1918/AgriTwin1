// AgriTwin — Dynamic 3D Digital Twin Component
// Automatically adapts to the user's selected field & crop with 4 zones,
// procedural vegetation, sensor markers, and animated sprinkler mist.

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { useFields } from '../../context/FieldsContext';
import { useTelemetry } from '../../context/TelemetryContext';
import { RotateCcw, Droplets, Eye, Layers, ShieldAlert, Flame, Check } from 'lucide-react';

export default function DynamicDigitalTwin({ height = 540 }) {
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const zonePlanesRef = useRef({});
  const sprinklerMistRef = useRef(null);
  const animFrameId = useRef(null);
  const animalGroupRef = useRef(null);
  const pestGroupRef = useRef(null);
  const plantsGroupRef = useRef(null);

  const { activeField } = useFields();
  const { zones, isIrrigatingZone2, waterZone2 } = useTelemetry();
  const [hoveredZone, setHoveredZone] = useState(null);

  // 3D Layer Toggles
  const [layers, setLayers] = useState({
    zones: true,
    plants: true,
    soilSensors: true,
    pestHotspots: true,
    animalIntrusion: true
  });
  const [showLayerMenu, setShowLayerMenu] = useState(false);
  const [animalAlertActive, setAnimalAlertActive] = useState(true);
  const [webglError, setWebglError] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x0a1c15);
    scene.fog = new THREE.FogExp2(0x0a1c15, 0.02);

    const camera = new THREE.PerspectiveCamera(45, width / (height || 540), 0.5, 100);
    camera.position.set(0, 13, 16);
    cameraRef.current = camera;

    let renderer = null;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
      renderer.setSize(width, height || 540);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.shadowMap.enabled = true;
      rendererRef.current = renderer;
      container.innerHTML = '';
      container.appendChild(renderer.domElement);
    } catch (err) {
      console.warn('[AgriTwin 3D] WebGL unsupported or context initialization failed:', err);
      setWebglError(true);
      return;
    }

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2.15;
    controls.minDistance = 6;
    controls.maxDistance = 32;
    controls.target.set(0, 0, 0);
    controls.enablePan = true;
    controls.touches = {
      ONE: THREE.TOUCH.ROTATE,
      TWO: THREE.TOUCH.DOLLY_PAN
    };
    controlsRef.current = controls;

    // Automatic responsive resize handler (PRD Section 9)
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const newWidth = container.clientWidth || width;
      const newHeight = container.clientHeight || height;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(container);

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
    const plantsGroup = new THREE.Group();
    scene.add(plantsGroup);
    plantsGroupRef.current = plantsGroup;

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
          plantsGroup.add(plant);
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

    // --- ANIMAL INTRUSION 3D MARKER (Zone 3) ---
    const animalGroup = new THREE.Group();
    scene.add(animalGroup);
    animalGroupRef.current = animalGroup;

    // Pulsing Hazard Ground Ring
    const hazardRingGeo = new THREE.RingGeometry(1.4, 1.7, 32);
    hazardRingGeo.rotateX(-Math.PI / 2);
    const hazardRingMat = new THREE.MeshBasicMaterial({
      color: 0xef4444,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85
    });
    const hazardRing = new THREE.Mesh(hazardRingGeo, hazardRingMat);
    hazardRing.position.set(-3.8, 0.06, 3.8);
    animalGroup.add(hazardRing);
    animalGroup.userData.ring = hazardRing;

    // 3D Billboard Canvas Sprite for Animal Alert
    const animalCanvas = document.createElement('canvas');
    animalCanvas.width = 300;
    animalCanvas.height = 130;
    const aCtx = animalCanvas.getContext('2d');
    aCtx.fillStyle = 'rgba(239, 68, 68, 0.9)';
    aCtx.roundRect ? aCtx.roundRect(0, 0, 300, 130, 16) : aCtx.fillRect(0, 0, 300, 130);
    aCtx.fill();
    aCtx.strokeStyle = '#ffffff';
    aCtx.lineWidth = 4;
    aCtx.stroke();
    aCtx.fillStyle = '#ffffff';
    aCtx.font = 'bold 32px sans-serif';
    aCtx.textAlign = 'center';
    aCtx.fillText('🚨 COW INTRUSION', 150, 52);
    aCtx.font = 'bold 22px sans-serif';
    aCtx.fillText('Zone 3 • 94% Confidence', 150, 92);

    const animalTexture = new THREE.CanvasTexture(animalCanvas);
    const animalSpriteMat = new THREE.SpriteMaterial({ map: animalTexture });
    const animalSprite = new THREE.Sprite(animalSpriteMat);
    animalSprite.scale.set(3.2, 1.4, 1);
    animalSprite.position.set(-3.8, 2.4, 3.8);
    animalGroup.add(animalSprite);

    // Glowing Red Marker Pole
    const animalPole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 1.8, 8),
      new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xef4444, emissiveIntensity: 0.6 })
    );
    animalPole.position.set(-3.8, 0.9, 3.8);
    animalGroup.add(animalPole);

    // --- PEST HOTSPOT 3D MARKER (Zone 1 / Row 2) ---
    const pestGroup = new THREE.Group();
    scene.add(pestGroup);
    pestGroupRef.current = pestGroup;

    const pestRingGeo = new THREE.RingGeometry(1.2, 1.45, 24);
    pestRingGeo.rotateX(-Math.PI / 2);
    const pestRingMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8
    });
    const pestRing = new THREE.Mesh(pestRingGeo, pestRingMat);
    pestRing.position.set(-3.8, 0.05, -3.8);
    pestGroup.add(pestRing);
    pestGroup.userData.ring = pestRing;

    // Billboard Canvas Sprite for Pest Hotspot
    const pestCanvas = document.createElement('canvas');
    pestCanvas.width = 280;
    pestCanvas.height = 110;
    const pCtx = pestCanvas.getContext('2d');
    pCtx.fillStyle = 'rgba(245, 158, 11, 0.9)';
    pCtx.roundRect ? pCtx.roundRect(0, 0, 280, 110, 14) : pCtx.fillRect(0, 0, 280, 110);
    pCtx.fill();
    pCtx.fillStyle = '#000000';
    pCtx.font = 'bold 28px sans-serif';
    pCtx.textAlign = 'center';
    pCtx.fillText('🔥 PEST HOTSPOT', 140, 48);
    pCtx.font = 'bold 20px sans-serif';
    pCtx.fillText('Chewing Damage: 3 Plants', 140, 84);

    const pestTexture = new THREE.CanvasTexture(pestCanvas);
    const pestSpriteMat = new THREE.SpriteMaterial({ map: pestTexture });
    const pestSprite = new THREE.Sprite(pestSpriteMat);
    pestSprite.scale.set(2.8, 1.1, 1);
    pestSprite.position.set(-3.8, 2.0, -3.8);
    pestGroup.add(pestSprite);

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

      const elapsed = clock.getElapsedTime();

      // Pulsing Animal Intrusion Hazard Ring
      if (animalGroupRef.current && animalGroupRef.current.userData.ring) {
        const pulse = 1 + 0.12 * Math.sin(elapsed * 4.5);
        animalGroupRef.current.userData.ring.scale.set(pulse, pulse, 1);
      }

      // Pulsing Pest Hotspot Ring
      if (pestGroupRef.current && pestGroupRef.current.userData.ring) {
        const pulse = 1 + 0.08 * Math.sin(elapsed * 3);
        pestGroupRef.current.userData.ring.scale.set(pulse, pulse, 1);
      }

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
      resizeObserver.disconnect();
      controls.dispose();
      renderer.dispose();
    };
  }, [height, activeField?.crop]);

  // Sync Layers Visibility
  useEffect(() => {
    if (plantsGroupRef.current) {
      plantsGroupRef.current.visible = layers.plants;
    }
    if (animalGroupRef.current) {
      animalGroupRef.current.visible = layers.animalIntrusion && animalAlertActive;
    }
    if (pestGroupRef.current) {
      pestGroupRef.current.visible = layers.pestHotspots;
    }
  }, [layers, animalAlertActive]);

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

  if (webglError) {
    return (
      <div className="twin-3d-wrapper" style={{ minHeight: '340px', padding: '20px', background: '#091c14', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid var(--border-medium)' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
            <div className="twin-overlay-badge">
              <span className="pulse-dot" style={{ background: '#10b981' }} />
              <span>Digital Twin: <strong>{activeField?.name} ({activeField?.crop})</strong> (2D Canopy Mode)</span>
            </div>
            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>4 Precision Zones Active</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '12px', margin: '14px 0' }}>
            {zones.map((z, idx) => (
              <div key={z.id} style={{
                background: z.soilWater < 25 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.1)',
                border: `1px solid ${z.soilWater < 25 ? 'rgba(239, 68, 68, 0.4)' : 'rgba(16, 185, 129, 0.3)'}`,
                borderRadius: 'var(--radius-md)',
                padding: '12px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700, color: '#fff' }}>
                  <span>{z.name}</span>
                  <span style={{ color: z.soilWater < 25 ? '#f87171' : 'var(--emerald-400)' }}>{z.soilWater?.toFixed(1)}%</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', marginTop: '8px', overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(100, (z.soilWater / 50) * 100)}%`, height: '100%', background: z.soilWater < 25 ? '#ef4444' : '#10b981', borderRadius: '3px' }} />
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '6px' }}>
                  Sensor: {z.sensorId || `SM-Z0${idx + 1}`} &bull; Status: {z.status}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
          <button onClick={waterZone2} className="btn btn-water btn-sm">
            <Droplets size={14} /> {isIrrigatingZone2 ? 'Watering Active...' : 'Water Zone 2'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="twin-3d-wrapper" style={{ height: `${height}px`, position: 'relative' }}>
      <div ref={containerRef} className="twin-3d-canvas" />

      {/* Top Overlay Badge & 3D Layer Switcher */}
      <div className="twin-overlay-controls" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
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

        {/* 3D Layers Toggle Button */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowLayerMenu(!showLayerMenu)}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(9, 24, 17, 0.9)' }}
          >
            <Layers size={14} color="var(--emerald-400)" />
            <span>3D Layers</span>
          </button>

          {showLayerMenu && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              marginTop: '6px',
              background: 'rgba(7, 20, 14, 0.98)',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-md)',
              padding: '10px 12px',
              minWidth: '190px',
              zIndex: 100,
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              boxShadow: '0 12px 30px rgba(0,0,0,0.8)'
            }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--emerald-400)', textTransform: 'uppercase' }}>
                Toggle 3D Visual Layers
              </span>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: '#fff', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={layers.plants}
                  onChange={e => setLayers({ ...layers, plants: e.target.checked })}
                />
                <span>🌿 Crop Plants</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: '#fff', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={layers.pestHotspots}
                  onChange={e => setLayers({ ...layers, pestHotspots: e.target.checked })}
                />
                <span>🔥 Pest Hotspots</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: '#fff', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={layers.animalIntrusion}
                  onChange={e => setLayers({ ...layers, animalIntrusion: e.target.checked })}
                />
                <span>🚨 Animal Intrusion</span>
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="twin-overlay-actions" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button onClick={resetCamera} className="btn btn-secondary btn-sm">
          <RotateCcw size={14} /> Reset View
        </button>

        <button
          onClick={() => setAnimalAlertActive(!animalAlertActive)}
          className="btn btn-secondary btn-sm"
          style={{
            borderColor: animalAlertActive ? 'rgba(239, 68, 68, 0.6)' : 'var(--border-subtle)',
            color: animalAlertActive ? '#f87171' : 'var(--text-dim)'
          }}
          title="Toggle 3D Animal Marker simulation"
        >
          <ShieldAlert size={14} color={animalAlertActive ? '#ef4444' : 'var(--text-dim)'} />
          <span>{animalAlertActive ? 'Animal Marker: Active' : 'Animal Marker: Hidden'}</span>
        </button>

        <button onClick={waterZone2} className="btn btn-water btn-sm">
          <Droplets size={14} /> {isIrrigatingZone2 ? 'Watering Active (Mist Spraying)...' : 'Water Zone 2'}
        </button>
      </div>
    </div>
  );
}

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface CyberArenaCanvas3DProps {
  interactive?: boolean;
  intensity?: number;
  showFloatingObjects?: boolean;
}

export const CyberArenaCanvas3D: React.FC<CyberArenaCanvas3DProps> = ({
  interactive = true,
  intensity = 1.0,
  showFloatingObjects = true,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x090a14, 0.025);

    const camera = new THREE.PerspectiveCamera(
      55,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 5, 20);
    camera.lookAt(0, 2, 0);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    container.appendChild(renderer.domElement);

    // 2. Cyber Grid Ground with Glowing Grid Lines
    const gridHelper = new THREE.GridHelper(80, 80, 0xff6b35, 0x1e1e38);
    gridHelper.position.y = -3;
    scene.add(gridHelper);

    // 3. Multi-Tiered Holographic Arena Rings
    const ringGroup = new THREE.Group();
    scene.add(ringGroup);

    const createRing = (radius: number, tube: number, colorHex: number, tiltX: number, tiltY: number) => {
      const geo = new THREE.TorusGeometry(radius, tube, 16, 120);
      const mat = new THREE.MeshBasicMaterial({
        color: colorHex,
        transparent: true,
        opacity: 0.55 * intensity,
        wireframe: true,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.rotation.x = tiltX;
      mesh.rotation.y = tiltY;
      ringGroup.add(mesh);
      return mesh;
    };

    const ring1 = createRing(9, 0.08, 0xff6b35, Math.PI / 2.3, 0);
    const ring2 = createRing(13, 0.06, 0x5352ed, Math.PI / 1.9, Math.PI / 5);
    const ring3 = createRing(17, 0.05, 0x00e5ff, Math.PI / 2.1, -Math.PI / 4);

    // 4. Center 3D Floating Cyber Gem
    const gemGeo = new THREE.OctahedronGeometry(2.5, 0);
    const gemMat = new THREE.MeshStandardMaterial({
      color: 0xff4757,
      emissive: 0xff6b35,
      emissiveIntensity: 0.9,
      metalness: 0.85,
      roughness: 0.15,
      wireframe: true,
    });
    const gem = new THREE.Mesh(gemGeo, gemMat);
    gem.position.set(0, 3.5, 0);
    scene.add(gem);

    // 5. Floating 3D Fitness Artifacts (Dumbbell & Shield)
    const floatingObjects: THREE.Group[] = [];

    if (showFloatingObjects) {
      // Create 3D Holographic Dumbbell
      const createDumbbell = (x: number, y: number, z: number, colorHex: number) => {
        const dumbbell = new THREE.Group();
        const barGeo = new THREE.CylinderGeometry(0.1, 0.1, 2.2, 12);
        const weightGeo = new THREE.CylinderGeometry(0.6, 0.6, 0.35, 16);
        const mat = new THREE.MeshStandardMaterial({
          color: colorHex,
          emissive: colorHex,
          emissiveIntensity: 0.5,
          wireframe: true,
        });

        const bar = new THREE.Mesh(barGeo, mat);
        bar.rotation.z = Math.PI / 2;
        dumbbell.add(bar);

        const weight1 = new THREE.Mesh(weightGeo, mat);
        weight1.rotation.z = Math.PI / 2;
        weight1.position.x = -1;
        dumbbell.add(weight1);

        const weight2 = new THREE.Mesh(weightGeo, mat);
        weight2.rotation.z = Math.PI / 2;
        weight2.position.x = 1;
        dumbbell.add(weight2);

        dumbbell.position.set(x, y, z);
        scene.add(dumbbell);
        floatingObjects.push(dumbbell);
        return dumbbell;
      };

      createDumbbell(-8, 5, -4, 0xff6b35);
      createDumbbell(8, 4, -2, 0x00e5ff);

      // Create 3D Holographic Shield
      const shieldGeo = new THREE.ConeGeometry(1.4, 2, 4);
      const shieldMat = new THREE.MeshStandardMaterial({
        color: 0x5352ed,
        emissive: 0x5352ed,
        emissiveIntensity: 0.6,
        wireframe: true,
      });
      const shield = new THREE.Mesh(shieldGeo, shieldMat);
      shield.rotation.x = Math.PI;
      const shieldGroup = new THREE.Group();
      shieldGroup.add(shield);
      shieldGroup.position.set(-6, 2, 4);
      scene.add(shieldGroup);
      floatingObjects.push(shieldGroup);
    }

    // 6. Upward Flowing 3D Particle Energy Vortex
    const particleCount = 600;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const speeds = new Float32Array(particleCount);
    const colors = new Float32Array(particleCount * 3);

    const cOrange = new THREE.Color(0xff6b35);
    const cPurple = new THREE.Color(0x5352ed);
    const cCyan = new THREE.Color(0x00e5ff);
    const cGold = new THREE.Color(0xffa502);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 55;
      positions[i3 + 1] = Math.random() * 30 - 2;
      positions[i3 + 2] = (Math.random() - 0.5) * 55;
      speeds[i] = Math.random() * 0.04 + 0.015;

      const pick = Math.random();
      const col = pick > 0.65 ? cOrange : pick > 0.4 ? cPurple : pick > 0.2 ? cCyan : cGold;
      colors[i3] = col.r;
      colors[i3 + 1] = col.g;
      colors[i3 + 2] = col.b;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.3,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 7. Volumetric Cyber Lights
    const ambientLight = new THREE.AmbientLight(0x14142b, 2.0);
    scene.add(ambientLight);

    const orangeLight = new THREE.PointLight(0xff6b35, 5, 40);
    orangeLight.position.set(-8, 10, 8);
    scene.add(orangeLight);

    const purpleLight = new THREE.PointLight(0x5352ed, 5, 40);
    purpleLight.position.set(8, 10, 8);
    scene.add(purpleLight);

    const cyanLight = new THREE.PointLight(0x00e5ff, 4, 30);
    cyanLight.position.set(0, -1, 6);
    scene.add(cyanLight);

    // Mouse Interaction
    let targetMouseX = 0;
    let targetMouseY = 0;
    let currentMouseX = 0;
    let currentMouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive) return;
      targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    window.addEventListener('mousemove', handleMouseMove);

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    // 8. Main Render Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Smooth camera mouse parallax
      currentMouseX += (targetMouseX - currentMouseX) * 0.04;
      currentMouseY += (targetMouseY - currentMouseY) * 0.04;

      camera.position.x = currentMouseX * 4;
      camera.position.y = 5 - currentMouseY * 2.5;
      camera.lookAt(0, 2, 0);

      // Rotate Center Gem
      gem.rotation.x = elapsed * 0.5;
      gem.rotation.y = elapsed * 0.7;
      gem.position.y = 3.5 + Math.sin(elapsed * 1.8) * 0.45;

      // Rotate Holographic Rings
      ring1.rotation.z = elapsed * 0.25;
      ring2.rotation.z = -elapsed * 0.2;
      ring3.rotation.z = elapsed * 0.15;

      // Float other 3D artifacts
      floatingObjects.forEach((obj, idx) => {
        obj.rotation.x = elapsed * (0.3 + idx * 0.1);
        obj.rotation.y = elapsed * (0.4 + idx * 0.1);
        obj.position.y += Math.sin(elapsed * 2 + idx) * 0.008;
      });

      // Upward particle flow
      const posAttr = particleGeo.attributes.position as THREE.BufferAttribute;
      const arr = posAttr.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3 + 1;
        arr[i3] += speeds[i];
        if (arr[i3] > 28) {
          arr[i3] = -2;
        }
      }
      posAttr.needsUpdate = true;
      particles.rotation.y = elapsed * 0.03;

      // Grid wave
      gridHelper.position.z = (elapsed * 2.5) % 2.5;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [interactive, intensity, showFloatingObjects]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
};

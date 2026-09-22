import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface CyberArenaCanvas3DProps {
  interactive?: boolean;
  intensity?: number;
}

export const CyberArenaCanvas3D: React.FC<CyberArenaCanvas3DProps> = ({
  interactive = true,
  intensity = 1.0,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x090a14, 0.035);

    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 4, 18);
    camera.lookAt(0, 1, 0);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // 2. Cyber Grid Ground
    const gridHelper = new THREE.GridHelper(60, 60, 0xff6b35, 0x25253d);
    gridHelper.position.y = -2;
    scene.add(gridHelper);

    // 3. Floating 3D Glowing Arena Rings (Torus)
    const ringGeo = new THREE.TorusGeometry(8, 0.08, 16, 100);
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: 0xff6b35,
      transparent: true,
      opacity: 0.6 * intensity,
      wireframe: true,
    });
    const ring1 = new THREE.Mesh(ringGeo, ringMat1);
    ring1.rotation.x = Math.PI / 2.2;
    scene.add(ring1);

    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0x5352ed,
      transparent: true,
      opacity: 0.5 * intensity,
      wireframe: true,
    });
    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(12, 0.06, 16, 100), ringMat2);
    ring2.rotation.x = Math.PI / 1.9;
    ring2.rotation.y = Math.PI / 6;
    scene.add(ring2);

    // 4. Center 3D Floating Ruby Crystal (Icosahedron)
    const crystalGeo = new THREE.IcosahedronGeometry(2, 0);
    const crystalMat = new THREE.MeshStandardMaterial({
      color: 0xff4757,
      emissive: 0xff6b35,
      emissiveIntensity: 0.8,
      metalness: 0.9,
      roughness: 0.1,
      wireframe: true,
    });
    const crystal = new THREE.Mesh(crystalGeo, crystalMat);
    crystal.position.set(0, 3, 0);
    scene.add(crystal);

    // Inner glowing sphere
    const innerGeo = new THREE.SphereGeometry(1.2, 16, 16);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0xff6b35,
      wireframe: true,
      transparent: true,
      opacity: 0.4,
    });
    const innerSphere = new THREE.Mesh(innerGeo, innerMat);
    crystal.add(innerSphere);

    // 5. 3D Floating Particle Field
    const particleCount = 450;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const color1 = new THREE.Color(0xff6b35); // Orange
    const color2 = new THREE.Color(0x5352ed); // Purple
    const color3 = new THREE.Color(0x00e5ff); // Cyan

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 50;
      positions[i3 + 1] = (Math.random() - 0.5) * 30 + 5;
      positions[i3 + 2] = (Math.random() - 0.5) * 50;

      const mixedColor = Math.random() > 0.6 ? color1 : Math.random() > 0.3 ? color2 : color3;
      colors[i3] = mixedColor.r;
      colors[i3 + 1] = mixedColor.g;
      colors[i3 + 2] = mixedColor.b;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.25,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
    });

    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // 6. Volumetric Lighting
    const ambientLight = new THREE.AmbientLight(0x25253d, 1.5);
    scene.add(ambientLight);

    const orangeLight = new THREE.PointLight(0xff6b35, 4, 30);
    orangeLight.position.set(-6, 8, 5);
    scene.add(orangeLight);

    const purpleLight = new THREE.PointLight(0x5352ed, 4, 30);
    purpleLight.position.set(6, 8, 5);
    scene.add(purpleLight);

    const cyanLight = new THREE.PointLight(0x00e5ff, 3, 25);
    cyanLight.position.set(0, -1, 4);
    scene.add(cyanLight);

    // Mouse Parallax
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

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    // 7. Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse follow
      currentMouseX += (targetMouseX - currentMouseX) * 0.05;
      currentMouseY += (targetMouseY - currentMouseY) * 0.05;

      camera.position.x = currentMouseX * 3;
      camera.position.y = 4 - currentMouseY * 2;
      camera.lookAt(0, 1, 0);

      // Rotate Crystal
      crystal.rotation.x = elapsedTime * 0.4;
      crystal.rotation.y = elapsedTime * 0.6;
      crystal.position.y = 3 + Math.sin(elapsedTime * 1.5) * 0.4;

      // Rotate Rings
      ring1.rotation.z = elapsedTime * 0.2;
      ring2.rotation.z = -elapsedTime * 0.15;

      // Grid wave animation
      gridHelper.position.z = (elapsedTime * 2) % 2;

      // Particles float
      particleSystem.rotation.y = elapsedTime * 0.04;

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
  }, [interactive, intensity]);

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

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface PoseSkeletonCanvas3DProps {
  interactive?: boolean;
}

export const PoseSkeletonCanvas3D: React.FC<PoseSkeletonCanvas3DProps> = ({
  interactive = true,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [currentAngle, setCurrentAngle] = useState(90);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      50,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 7.5);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 3D Skeleton Joint definitions (Simplified Biomechanical 3D Model)
    const jointSpheres: THREE.Mesh[] = [];
    const boneCylinders: THREE.Mesh[] = [];

    const jointMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff });
    const headMat = new THREE.MeshBasicMaterial({ color: 0xff6b35 });
    const boneMat = new THREE.MeshBasicMaterial({ color: 0x2ed573, transparent: true, opacity: 0.85 });

    // Create 15 key 3D joints
    const jointPositions = [
      new THREE.Vector3(0, 1.8, 0),    // 0: Head
      new THREE.Vector3(0, 1.3, 0),    // 1: Neck/Chest
      new THREE.Vector3(-0.9, 1.2, 0), // 2: L Shoulder
      new THREE.Vector3(0.9, 1.2, 0),  // 3: R Shoulder
      new THREE.Vector3(-1.4, 0.4, 0), // 4: L Elbow
      new THREE.Vector3(1.4, 0.4, 0),  // 5: R Elbow
      new THREE.Vector3(-1.5, -0.4, 0),// 6: L Wrist
      new THREE.Vector3(1.5, -0.4, 0), // 7: R Wrist
      new THREE.Vector3(0, 0.2, 0),    // 8: Pelvis
      new THREE.Vector3(-0.6, 0.1, 0), // 9: L Hip
      new THREE.Vector3(0.6, 0.1, 0),  // 10: R Hip
      new THREE.Vector3(-0.7, -1.0, 0),// 11: L Knee
      new THREE.Vector3(0.7, -1.0, 0), // 12: R Knee
      new THREE.Vector3(-0.8, -2.1, 0),// 13: L Ankle
      new THREE.Vector3(0.8, -2.1, 0), // 14: R Ankle
    ];

    const boneConnections = [
      [0, 1],
      [1, 2], [1, 3],
      [2, 4], [4, 6],
      [3, 5], [5, 7],
      [1, 8],
      [8, 9], [8, 10],
      [9, 11], [11, 13],
      [10, 12], [12, 14],
    ];

    const skeletonGroup = new THREE.Group();
    scene.add(skeletonGroup);

    jointPositions.forEach((pos, idx) => {
      const radius = idx === 0 ? 0.25 : 0.12;
      const sphere = new THREE.Mesh(new THREE.SphereGeometry(radius, 16, 16), idx === 0 ? headMat : jointMat);
      sphere.position.copy(pos);
      skeletonGroup.add(sphere);
      jointSpheres.push(sphere);
    });

    // Create bones connecting joints
    boneConnections.forEach(() => {
      const cylinder = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1, 8), boneMat);
      skeletonGroup.add(cylinder);
      boneCylinders.push(cylinder);
    });

    const updateBones = () => {
      boneConnections.forEach(([startIdx, endIdx], i) => {
        const start = jointSpheres[startIdx].position;
        const end = jointSpheres[endIdx].position;
        const cylinder = boneCylinders[i];

        const distance = start.distanceTo(end);
        cylinder.scale.set(1, distance, 1);

        const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
        cylinder.position.copy(mid);

        const orientation = new THREE.Matrix4();
        orientation.lookAt(start, end, new THREE.Vector3(0, 1, 0));
        cylinder.quaternion.setFromRotationMatrix(orientation);
        cylinder.rotateX(Math.PI / 2);
      });
    };

    updateBones();

    // 3D Holographic grid ring under skeleton
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(1.8, 2.2, 32),
      new THREE.MeshBasicMaterial({ color: 0x5352ed, side: THREE.DoubleSide, transparent: true, opacity: 0.4 })
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = -2.3;
    skeletonGroup.add(ring);

    // Mouse rotation
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const onMouseDown = (e: MouseEvent) => {
      if (!interactive) return;
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      skeletonGroup.rotation.y += deltaX * 0.01;
      skeletonGroup.rotation.x += deltaY * 0.01;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseUp = () => { isDragging = false; };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      if (!isDragging) {
        skeletonGroup.rotation.y = Math.sin(time * 0.5) * 0.4;
      }

      // Biomechanical Rep Animation
      const repPhase = (Math.sin(time * 2.2) + 1) / 2; // 0 to 1
      const angle = 65 + repPhase * 95; // 65 deg to 160 deg
      setCurrentAngle(Math.round(angle));

      // Pushup arm flexion
      const elbowDrop = repPhase * 0.5;
      jointSpheres[4].position.y = 0.4 - elbowDrop;
      jointSpheres[5].position.y = 0.4 - elbowDrop;
      jointSpheres[4].position.x = -1.4 - elbowDrop * 0.3;
      jointSpheres[5].position.x = 1.4 + elbowDrop * 0.3;

      // Torso depth
      jointSpheres[0].position.z = Math.sin(time * 2.2) * 0.3;
      jointSpheres[1].position.z = Math.sin(time * 2.2) * 0.3;

      updateBones();
      ring.rotation.z = time * 0.5;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('resize', handleResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [interactive]);

  return (
    <div style={{ position: 'relative', width: '100%', height: 380 }}>
      <div ref={mountRef} style={{ width: '100%', height: '100%', cursor: 'grab' }} />
      
      {/* 3D Hologram Overlay HUD */}
      <div style={{
        position: 'absolute',
        bottom: 12,
        left: 12,
        right: 12,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(15, 15, 35, 0.85)',
        backdropFilter: 'blur(10px)',
        padding: '8px 14px',
        borderRadius: 12,
        border: '1px solid rgba(0, 229, 255, 0.3)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#2ED573', boxShadow: '0 0 8px #2ED573' }} />
          <span style={{ fontSize: 11, fontWeight: 800, color: '#00E5FF' }}>3D AI JOINT ANGLE</span>
        </div>
        <div style={{ fontSize: 16, fontWeight: 900, color: currentAngle <= 90 ? '#2ED573' : '#FF8E53' }}>
          {currentAngle}° {currentAngle <= 90 ? '✓ ĐẠT CHUẨN' : '→ CẦN ≤ 90°'}
        </div>
      </div>
    </div>
  );
};

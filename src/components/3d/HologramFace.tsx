'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

function ParticleHeadMesh() {
  const pointsRef = useRef<THREE.Points>(null!);
  const ringRef = useRef<THREE.Mesh>(null!);
  const laserRef = useRef<THREE.Mesh>(null!);

  // Generate 3D facial/head topology geometry points
  const { positions, colors } = useMemo(() => {
    const numPoints = 1200;
    const pos = new Float32Array(numPoints * 3);
    const cols = new Float32Array(numPoints * 3);

    const cyan = new THREE.Color('#00f2fe');
    const purple = new THREE.Color('#7000ff');
    const magenta = new THREE.Color('#f355da');

    for (let i = 0; i < numPoints; i++) {
      let x, y, z;
      const u = Math.random();
      const v = Math.random();

      // Shape parametric sphere with head proportions (tapered bottom for jaw line, defined cheeks)
      const theta = u * Math.PI * 2;
      const phi = Math.acos(2 * v - 1);

      let radius = 1.6;
      // Head shape adjustments
      x = radius * Math.sin(phi) * Math.cos(theta) * 0.75;
      y = radius * Math.cos(phi) * 1.05;
      z = radius * Math.sin(phi) * Math.sin(theta) * 0.85;

      // Flatten back of head slightly, shape nose and chin in front (z > 0)
      if (z > 0) {
        // Nose bridge protrusion
        if (Math.abs(x) < 0.3 && y > -0.2 && y < 0.4) {
          z += 0.35 - Math.abs(x) * 0.5;
        }
        // Cheekbones
        if (Math.abs(x) > 0.4 && Math.abs(x) < 0.9 && y > -0.3 && y < 0.2) {
          z += 0.2;
        }
        // Chin
        if (Math.abs(x) < 0.4 && y < -0.8 && y > -1.4) {
          z += 0.25;
        }
      }

      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;

      // Color gradient depending on height
      const lerpColor = y > 0 ? cyan.clone().lerp(purple, Math.abs(y) / 1.5) : purple.clone().lerp(magenta, Math.abs(y) / 1.5);
      cols[i * 3] = lerpColor.r;
      cols[i * 3 + 1] = lerpColor.g;
      cols[i * 3 + 2] = lerpColor.b;
    }

    return { positions: pos, colors: cols };
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    if (pointsRef.current) {
      pointsRef.current.rotation.y = time * 0.25;
      pointsRef.current.rotation.x = Math.sin(time * 0.5) * 0.08;
    }

    if (ringRef.current) {
      ringRef.current.rotation.z = -time * 0.4;
      ringRef.current.rotation.x = Math.PI / 2 + Math.sin(time * 0.5) * 0.2;
    }

    if (laserRef.current) {
      // Y oscillation between -1.8 and 1.8
      laserRef.current.position.y = Math.sin(time * 1.5) * 1.6;
    }
  });

  return (
    <group scale={1.2}>
      {/* 3D Holographic Point Mesh */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[colors, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.055}
          vertexColors
          transparent
          opacity={0.85}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Orbiting Futuristic Tech Ring */}
      <mesh ref={ringRef} position={[0, 0, 0]}>
        <ringGeometry args={[2.0, 2.05, 64]} />
        <meshBasicMaterial color="#00f2fe" wireframe transparent opacity={0.4} side={THREE.DoubleSide} />
      </mesh>

      {/* Animated Horizontal Laser Scan Beam */}
      <mesh ref={laserRef} position={[0, 0, 0]}>
        <cylinderGeometry args={[2.2, 2.2, 0.02, 32]} />
        <meshBasicMaterial
          color="#f355da"
          transparent
          opacity={0.6}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

export default function HologramFace() {
  return (
    <div className="w-full h-full min-h-[320px] relative rounded-3xl overflow-hidden cursor-grab active:cursor-grabbing">
      <Canvas
        camera={{ position: [0, 0, 5.5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#00f2fe" />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#f355da" />

        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.8}>
          <ParticleHeadMesh />
        </Float>

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate={false}
          maxPolarAngle={Math.PI / 1.5}
          minPolarAngle={Math.PI / 3}
        />
      </Canvas>
      
      {/* Decorative Cyber Grid Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(7,9,14,0.8)_100%)]" />
    </div>
  );
}

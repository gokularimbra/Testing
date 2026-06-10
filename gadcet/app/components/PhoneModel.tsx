"use client";

import { useRef, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { RoundedBox, Environment, Float, MeshTransmissionMaterial } from "@react-three/drei";
import * as THREE from "three";

function Phone({ scrollY }: { scrollY: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const screenRef = useRef<THREE.Mesh>(null);
  const time = useRef(0);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    time.current += delta;

    // Scroll-driven rotation
    const targetRotY = scrollY * 0.003;
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      targetRotY + Math.sin(time.current * 0.4) * 0.15,
      0.05
    );
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      Math.sin(time.current * 0.3) * 0.08,
      0.05
    );
  });

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
      <group ref={groupRef} rotation={[0.1, -0.3, 0]}>
        {/* Phone body */}
        <RoundedBox args={[1.4, 2.9, 0.14]} radius={0.12} smoothness={8}>
          <meshStandardMaterial
            color="#1a1a2e"
            metalness={0.9}
            roughness={0.1}
            envMapIntensity={1.5}
          />
        </RoundedBox>

        {/* Screen */}
        <mesh ref={screenRef} position={[0, 0, 0.075]}>
          <planeGeometry args={[1.2, 2.5]} />
          <meshStandardMaterial
            color="#020817"
            emissive="#1e40af"
            emissiveIntensity={0.3}
            metalness={0.1}
            roughness={0.0}
          />
        </mesh>

        {/* Screen content lines */}
        {[0.7, 0.35, 0, -0.35, -0.7].map((y, i) => (
          <mesh key={i} position={[0, y, 0.08]}>
            <planeGeometry args={[0.8 - i * 0.05, 0.04]} />
            <meshStandardMaterial
              color="#60a5fa"
              emissive="#3b82f6"
              emissiveIntensity={0.8}
              transparent
              opacity={0.7 - i * 0.1}
            />
          </mesh>
        ))}

        {/* App icons grid */}
        {[-0.35, 0, 0.35].map((x) =>
          [-0.15, -0.5, -0.85].map((y) => (
            <mesh key={`${x}-${y}`} position={[x, y, 0.08]}>
              <planeGeometry args={[0.18, 0.18]} />
              <meshStandardMaterial
                color={x === -0.35 ? "#2563eb" : x === 0 ? "#7c3aed" : "#0891b2"}
                emissive={x === -0.35 ? "#1d4ed8" : x === 0 ? "#6d28d9" : "#0e7490"}
                emissiveIntensity={0.5}
              />
            </mesh>
          ))
        )}

        {/* Camera module */}
        <group position={[-0.3, 1.15, 0.08]}>
          <mesh>
            <cylinderGeometry args={[0.12, 0.12, 0.02, 32]} />
            <meshStandardMaterial color="#111" metalness={1} roughness={0.1} />
          </mesh>
          <mesh position={[0, 0, 0.015]}>
            <cylinderGeometry args={[0.07, 0.07, 0.01, 32]} />
            <meshStandardMaterial color="#0a0a1a" metalness={0.5} roughness={0} />
          </mesh>
          <mesh position={[0.22, 0, 0]}>
            <cylinderGeometry args={[0.09, 0.09, 0.02, 32]} />
            <meshStandardMaterial color="#111" metalness={1} roughness={0.1} />
          </mesh>
        </group>

        {/* Side buttons */}
        <mesh position={[0.72, 0.3, 0]}>
          <boxGeometry args={[0.04, 0.3, 0.08]} />
          <meshStandardMaterial color="#222" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[-0.72, 0.1, 0]}>
          <boxGeometry args={[0.04, 0.2, 0.08]} />
          <meshStandardMaterial color="#222" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Notch */}
        <mesh position={[0, 1.28, 0.076]} rotation={[0, 0, Math.PI / 2]}>
          <capsuleGeometry args={[0.04, 0.3, 4, 16]} />
          <meshStandardMaterial color="#0a0a1a" />
        </mesh>

        {/* Charging port */}
        <mesh position={[0, -1.47, 0]}>
          <boxGeometry args={[0.28, 0.04, 0.06]} />
          <meshStandardMaterial color="#111" metalness={0.8} roughness={0.3} />
        </mesh>

        {/* Edge glow */}
        <RoundedBox args={[1.42, 2.92, 0.16]} radius={0.12} smoothness={8}>
          <meshStandardMaterial
            color="#3b82f6"
            emissive="#1d4ed8"
            emissiveIntensity={0.15}
            transparent
            opacity={0.08}
            side={THREE.BackSide}
          />
        </RoundedBox>
      </group>
    </Float>
  );
}

function Particles() {
  const count = 80;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 12;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 12;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 8;
  }

  const pointsRef = useRef<THREE.Points>(null);
  useFrame((_, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.03;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.04} color="#60a5fa" transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}

export default function PhoneModel({ scrollY }: { scrollY: number }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 45 }}
      style={{ background: "transparent" }}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 5, 5]} intensity={1.5} color="#60a5fa" />
      <directionalLight position={[-5, -2, -2]} intensity={0.5} color="#a78bfa" />
      <pointLight position={[0, 0, 3]} intensity={1} color="#06b6d4" />
      <Environment preset="city" />
      <Phone scrollY={scrollY} />
      <Particles />
    </Canvas>
  );
}

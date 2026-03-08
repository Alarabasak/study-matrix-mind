import React, { Suspense, useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, Environment } from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';

// ─── Mouse-driven camera parallax ───
const CameraRig: React.FC = () => {
  const { camera } = useThree();
  const mouse = useRef({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, []);

  useFrame(() => {
    target.current.x += (mouse.current.x * 0.8 - target.current.x) * 0.04;
    target.current.y += (mouse.current.y * 0.5 - target.current.y) * 0.04;
    camera.position.x = target.current.x;
    camera.position.y = 3.5 + target.current.y * 0.3;
    camera.lookAt(0, 0.5, 0);
  });

  return null;
};

// ─── Desk surface ───
const Desk: React.FC = () => {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[12, 8]} />
      <meshStandardMaterial color="#8B7355" roughness={0.8} metalness={0.05} />
    </mesh>
  );
};

// ─── Notebook / Defter ───
const Notebook: React.FC<{ position: [number, number, number]; rotation?: [number, number, number]; color?: string }> = ({
  position, rotation = [0, 0, 0], color = '#f5a0b0'
}) => {
  return (
    <group position={position} rotation={rotation}>
      {/* Cover */}
      <mesh position={[0, 0.05, 0]} castShadow>
        <boxGeometry args={[1.2, 0.08, 1.6]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {/* Pages */}
      <mesh position={[0, 0.02, 0]}>
        <boxGeometry args={[1.1, 0.04, 1.5]} />
        <meshStandardMaterial color="#faf5e8" roughness={0.9} />
      </mesh>
      {/* Spiral rings */}
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh key={i} position={[-0.65, 0.08, -0.6 + i * 0.24]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.06, 0.012, 8, 16, Math.PI]} />
          <meshStandardMaterial color="#c0c0c0" metalness={0.8} roughness={0.2} />
        </mesh>
      ))}
    </group>
  );
};

// ─── Pencil / Kalem ───
const Pencil: React.FC<{ position: [number, number, number]; rotation?: [number, number, number]; color?: string }> = ({
  position, rotation = [0, 0, 0], color = '#f7c948'
}) => {
  return (
    <group position={position} rotation={rotation}>
      {/* Body */}
      <mesh position={[0, 0.06, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.04, 0.04, 1.8, 6]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      {/* Tip */}
      <mesh position={[0.95, 0.06, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.04, 0.15, 6]} />
        <meshStandardMaterial color="#d4a574" roughness={0.7} />
      </mesh>
      {/* Graphite */}
      <mesh position={[1.02, 0.06, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.015, 0.04, 6]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      {/* Eraser */}
      <mesh position={[-0.95, 0.06, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.045, 0.045, 0.12, 8]} />
        <meshStandardMaterial color="#e8a0b0" roughness={0.8} />
      </mesh>
    </group>
  );
};

// ─── Eraser / Silgi ───
const Eraser: React.FC<{ position: [number, number, number]; rotation?: [number, number, number] }> = ({
  position, rotation = [0, 0, 0]
}) => {
  return (
    <mesh position={position} rotation={rotation} castShadow>
      <boxGeometry args={[0.6, 0.18, 0.35]} />
      <meshStandardMaterial color="#ffa0c0" roughness={0.7} />
    </mesh>
  );
};

// ─── Coffee Cup / Kahve Bardağı ───
const CoffeeCup: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  return (
    <group position={position}>
      {/* Cup body */}
      <mesh position={[0, 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.18, 0.55, 16]} />
        <meshStandardMaterial color="#f0e6d3" roughness={0.6} />
      </mesh>
      {/* Handle */}
      <mesh position={[0.28, 0.3, 0]} rotation={[0, 0, 0]}>
        <torusGeometry args={[0.1, 0.025, 8, 16, Math.PI]} />
        <meshStandardMaterial color="#f0e6d3" roughness={0.6} />
      </mesh>
      {/* Coffee surface */}
      <mesh position={[0, 0.54, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.2, 16]} />
        <meshStandardMaterial color="#3e2723" roughness={0.3} />
      </mesh>
    </group>
  );
};

// ─── Sticky Note 3D ───
const StickyNote3D: React.FC<{ position: [number, number, number]; rotation?: [number, number, number]; color?: string }> = ({
  position, rotation = [0, 0, 0], color = '#fff59d'
}) => {
  return (
    <Float speed={1.5} rotationIntensity={0.08} floatIntensity={0.15}>
      <mesh position={position} rotation={rotation} castShadow>
        <boxGeometry args={[0.7, 0.015, 0.7]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
    </Float>
  );
};

// ─── Sticker ───
const Sticker: React.FC<{ position: [number, number, number]; color?: string }> = ({
  position, color = '#ff69b4'
}) => {
  return (
    <Float speed={2} rotationIntensity={0.15} floatIntensity={0.2}>
      <mesh position={position} castShadow>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.3}
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>
    </Float>
  );
};

// ─── Floating sparkle particles ───
const Sparkles: React.FC = () => {
  const count = 60;
  const mesh = useRef<THREE.InstancedMesh>(null);
  
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      temp.push({
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 10,
          Math.random() * 4 + 0.5,
          (Math.random() - 0.5) * 6
        ),
        speed: Math.random() * 0.5 + 0.3,
        offset: Math.random() * Math.PI * 2,
        scale: Math.random() * 0.03 + 0.01,
      });
    }
    return temp;
  }, []);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(({ clock }) => {
    if (!mesh.current) return;
    const t = clock.getElapsedTime();
    particles.forEach((p, i) => {
      dummy.position.set(
        p.position.x + Math.sin(t * p.speed + p.offset) * 0.3,
        p.position.y + Math.sin(t * p.speed * 0.7 + p.offset) * 0.5,
        p.position.z + Math.cos(t * p.speed + p.offset) * 0.2
      );
      const s = p.scale * (1 + Math.sin(t * 2 + p.offset) * 0.5);
      dummy.scale.setScalar(s);
      dummy.updateMatrix();
      mesh.current!.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshStandardMaterial
        color="#ffe0f0"
        emissive="#ff9ed8"
        emissiveIntensity={2}
        toneMapped={false}
      />
    </instancedMesh>
  );
};

// ─── Main Scene ───
const SceneContent: React.FC = () => {
  return (
    <>
      <CameraRig />
      
      {/* Lighting */}
      <ambientLight intensity={0.4} color="#ffe8d6" />
      <directionalLight
        position={[5, 8, 3]}
        intensity={0.8}
        color="#fff5e6"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <pointLight position={[-3, 3, -2]} intensity={0.4} color="#ffa0c0" />
      <pointLight position={[3, 2, 2]} intensity={0.3} color="#a0d0ff" />
      
      {/* Environment */}
      <Environment preset="apartment" />
      <fog attach="fog" args={['#1a1520', 8, 18]} />

      {/* Desk */}
      <Desk />

      {/* Notebooks */}
      <Notebook position={[-1.5, 0, -0.3]} rotation={[0, 0.15, 0]} color="#f5a0b0" />
      <Notebook position={[1.2, 0, 0.5]} rotation={[0, -0.3, 0]} color="#a0c8f0" />
      <Notebook position={[0, 0, -1.5]} rotation={[0, 0.05, 0]} color="#b8e6c8" />

      {/* Pencils */}
      <Pencil position={[2.5, 0, -0.8]} rotation={[0, 0.6, 0]} color="#f7c948" />
      <Pencil position={[-0.5, 0, 1.2]} rotation={[0, -0.2, 0]} color="#ff8a80" />

      {/* Eraser */}
      <Eraser position={[0.8, 0, -0.5]} rotation={[0, 0.4, 0]} />

      {/* Coffee */}
      <CoffeeCup position={[3, 0, 1]} />

      {/* Sticky Notes */}
      <StickyNote3D position={[-2.5, 0.1, 1]} rotation={[0, 0.2, 0]} color="#fff59d" />
      <StickyNote3D position={[1.8, 0.1, -1.5]} rotation={[0, -0.15, 0]} color="#ffab91" />
      <StickyNote3D position={[-0.8, 0.1, -2]} rotation={[0, 0.35, 0]} color="#ce93d8" />

      {/* Decorative Stickers */}
      <Sticker position={[-2, 0.3, -1.5]} color="#ff69b4" />
      <Sticker position={[2.5, 0.25, -0.2]} color="#64b5f6" />
      <Sticker position={[0, 0.35, 1.5]} color="#81c784" />
      <Sticker position={[-1, 0.4, 0.8]} color="#ffb74d" />
      <Sticker position={[1.5, 0.5, 1.8]} color="#ba68c8" />

      {/* Sparkle particles */}
      <Sparkles />

      {/* Post-processing */}
      <EffectComposer>
        <Bloom
          luminanceThreshold={0.6}
          luminanceSmoothing={0.9}
          intensity={0.8}
          mipmapBlur
        />
        <ChromaticAberration
          offset={new THREE.Vector2(0.0008, 0.0008)}
          radialModulation={false}
          modulationOffset={0}
        />
        <Vignette eskil={false} offset={0.15} darkness={0.6} />
      </EffectComposer>
    </>
  );
};

const Scene3DBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-10" style={{ pointerEvents: 'none' }}>
      <Canvas
        shadows
        camera={{ position: [0, 3.5, 6], fov: 50 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        dpr={[1, 1.5]}
        style={{ pointerEvents: 'auto' }}
      >
        <Suspense fallback={null}>
          <SceneContent />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Scene3DBackground;

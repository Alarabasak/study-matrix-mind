import React, { Suspense, useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber';
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

// ─── Desk surface with crumpled grid paper texture ───
const Desk: React.FC = () => {
  const texture = useLoader(THREE.TextureLoader, '/images/crumpled-grid-paper.jpg');
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 2);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[14, 10]} />
      <meshStandardMaterial
        map={texture}
        roughness={0.85}
        metalness={0.02}
        color="#f0ebe0"
      />
    </mesh>
  );
};

// ─── Notebook with grid paper texture ───
const Notebook: React.FC<{
  position: [number, number, number];
  rotation?: [number, number, number];
  color?: string;
}> = ({ position, rotation = [0, 0, 0], color = '#f5a0b0' }) => {
  const pageTexture = useLoader(THREE.TextureLoader, '/images/crumpled-grid-paper.jpg');

  return (
    <group position={position} rotation={rotation}>
      {/* Cover */}
      <mesh position={[0, 0.06, 0]} castShadow>
        <boxGeometry args={[1.2, 0.08, 1.6]} />
        <meshStandardMaterial color={color} roughness={0.55} metalness={0.05} />
      </mesh>
      {/* Pages with grid texture */}
      <mesh position={[0, 0.02, 0]}>
        <boxGeometry args={[1.1, 0.04, 1.5]} />
        <meshStandardMaterial map={pageTexture} color="#faf5e8" roughness={0.9} />
      </mesh>
      {/* Spiral rings */}
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh key={i} position={[-0.65, 0.09, -0.6 + i * 0.24]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.06, 0.012, 8, 16, Math.PI]} />
          <meshStandardMaterial color="#c0c0c0" metalness={0.8} roughness={0.2} />
        </mesh>
      ))}
    </group>
  );
};

// ─── Poster / Photo pinned on desk (study-girl reference) ───
const PinnedPhoto: React.FC<{
  position: [number, number, number];
  rotation?: [number, number, number];
}> = ({ position, rotation = [0, 0, 0] }) => {
  const photoTexture = useLoader(THREE.TextureLoader, '/images/study-girl.jpg');

  return (
    <group position={position} rotation={rotation}>
      {/* Photo */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
        <planeGeometry args={[0.9, 1.2]} />
        <meshStandardMaterial map={photoTexture} roughness={0.7} />
      </mesh>
      {/* White border */}
      <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.0, 1.3]} />
        <meshStandardMaterial color="#ffffff" roughness={0.9} />
      </mesh>
      {/* Pin */}
      <mesh position={[0, 0.06, -0.55]}>
        <sphereGeometry args={[0.04, 12, 12]} />
        <meshStandardMaterial color="#ff4081" metalness={0.3} roughness={0.4} />
      </mesh>
      {/* Pin needle */}
      <mesh position={[0, 0.03, -0.55]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.008, 0.008, 0.06, 6]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.9} />
      </mesh>
    </group>
  );
};

// ─── Pencil ───
const Pencil: React.FC<{
  position: [number, number, number];
  rotation?: [number, number, number];
  color?: string;
}> = ({ position, rotation = [0, 0, 0], color = '#f7c948' }) => {
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0.06, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.04, 0.04, 1.8, 6]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      <mesh position={[0.95, 0.06, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.04, 0.15, 6]} />
        <meshStandardMaterial color="#d4a574" roughness={0.7} />
      </mesh>
      <mesh position={[1.02, 0.06, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.015, 0.04, 6]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[-0.95, 0.06, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.045, 0.045, 0.12, 8]} />
        <meshStandardMaterial color="#e8a0b0" roughness={0.8} />
      </mesh>
    </group>
  );
};

// ─── Eraser ───
const Eraser: React.FC<{
  position: [number, number, number];
  rotation?: [number, number, number];
}> = ({ position, rotation = [0, 0, 0] }) => (
  <mesh position={position} rotation={rotation} castShadow>
    <boxGeometry args={[0.6, 0.18, 0.35]} />
    <meshStandardMaterial color="#ffa0c0" roughness={0.7} />
  </mesh>
);

// ─── Coffee Cup ───
const CoffeeCup: React.FC<{ position: [number, number, number] }> = ({ position }) => (
  <group position={position}>
    <mesh position={[0, 0.3, 0]} castShadow>
      <cylinderGeometry args={[0.22, 0.18, 0.55, 16]} />
      <meshStandardMaterial color="#f0e6d3" roughness={0.6} />
    </mesh>
    <mesh position={[0.28, 0.3, 0]}>
      <torusGeometry args={[0.1, 0.025, 8, 16, Math.PI]} />
      <meshStandardMaterial color="#f0e6d3" roughness={0.6} />
    </mesh>
    <mesh position={[0, 0.54, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[0.2, 16]} />
      <meshStandardMaterial color="#3e2723" roughness={0.3} />
    </mesh>
  </group>
);

// ─── Iced Coffee (from reference photo) ───
const IcedCoffee: React.FC<{ position: [number, number, number] }> = ({ position }) => (
  <group position={position}>
    {/* Transparent cup */}
    <mesh position={[0, 0.35, 0]} castShadow>
      <cylinderGeometry args={[0.18, 0.14, 0.65, 16, 1, true]} />
      <meshStandardMaterial color="#ffffff" transparent opacity={0.25} roughness={0.1} metalness={0.1} side={THREE.DoubleSide} />
    </mesh>
    {/* Iced coffee liquid */}
    <mesh position={[0, 0.25, 0]}>
      <cylinderGeometry args={[0.16, 0.12, 0.4, 16]} />
      <meshStandardMaterial color="#5d3a1a" transparent opacity={0.7} roughness={0.2} />
    </mesh>
    {/* Ice cubes */}
    {[[-0.04, 0.38, 0.04], [0.05, 0.42, -0.03], [-0.02, 0.45, -0.05]].map((pos, i) => (
      <mesh key={i} position={pos as [number, number, number]}>
        <boxGeometry args={[0.06, 0.06, 0.06]} />
        <meshStandardMaterial color="#e8f4f8" transparent opacity={0.5} roughness={0.1} />
      </mesh>
    ))}
    {/* Straw */}
    <mesh position={[0.05, 0.55, 0]} rotation={[0.1, 0, 0.05]}>
      <cylinderGeometry args={[0.015, 0.015, 0.5, 8]} />
      <meshStandardMaterial color="#ff69b4" roughness={0.4} />
    </mesh>
    {/* Dome lid */}
    <mesh position={[0, 0.67, 0]}>
      <sphereGeometry args={[0.18, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <meshStandardMaterial color="#ffffff" transparent opacity={0.2} roughness={0.05} side={THREE.DoubleSide} />
    </mesh>
  </group>
);

// ─── Binder Clip (from reference photo) ───
const BinderClip: React.FC<{
  position: [number, number, number];
  rotation?: [number, number, number];
}> = ({ position, rotation = [0, 0, 0] }) => (
  <group position={position} rotation={rotation}>
    {/* Body */}
    <mesh position={[0, 0.08, 0]} castShadow>
      <boxGeometry args={[0.15, 0.12, 0.04]} />
      <meshStandardMaterial color="#1a1a1a" metalness={0.6} roughness={0.3} />
    </mesh>
    {/* Handles */}
    <mesh position={[0, 0.15, 0.02]} rotation={[0.3, 0, 0]}>
      <torusGeometry args={[0.05, 0.008, 6, 12, Math.PI]} />
      <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.1} />
    </mesh>
    <mesh position={[0, 0.15, -0.02]} rotation={[-0.3, 0, 0]}>
      <torusGeometry args={[0.05, 0.008, 6, 12, Math.PI]} />
      <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.1} />
    </mesh>
  </group>
);

// ─── Rolled Paper / Poster (from reference) ───
const RolledPaper: React.FC<{
  position: [number, number, number];
  rotation?: [number, number, number];
  color?: string;
}> = ({ position, rotation = [0, 0, 0], color = '#8b4513' }) => (
  <group position={position} rotation={rotation}>
    <mesh castShadow rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.08, 0.08, 1.2, 16]} />
      <meshStandardMaterial color={color} roughness={0.7} />
    </mesh>
    {/* Inner lighter color */}
    <mesh rotation={[0, 0, Math.PI / 2]} position={[0.6, 0, 0]}>
      <circleGeometry args={[0.07, 16]} />
      <meshStandardMaterial color="#f5e6d3" roughness={0.9} />
    </mesh>
  </group>
);

// ─── Sunglasses (Y2K accessory from reference) ───
const Sunglasses: React.FC<{
  position: [number, number, number];
  rotation?: [number, number, number];
}> = ({ position, rotation = [0, 0, 0] }) => (
  <group position={position} rotation={rotation}>
    {/* Left lens */}
    <mesh position={[-0.15, 0, 0]}>
      <sphereGeometry args={[0.12, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <meshStandardMaterial color="#1a1a2e" metalness={0.2} roughness={0.1} transparent opacity={0.7} />
    </mesh>
    {/* Right lens */}
    <mesh position={[0.15, 0, 0]}>
      <sphereGeometry args={[0.12, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <meshStandardMaterial color="#1a1a2e" metalness={0.2} roughness={0.1} transparent opacity={0.7} />
    </mesh>
    {/* Bridge */}
    <mesh position={[0, 0.02, 0.1]}>
      <boxGeometry args={[0.08, 0.02, 0.03]} />
      <meshStandardMaterial color="#1a1a1a" metalness={0.4} roughness={0.3} />
    </mesh>
    {/* Frame */}
    <mesh position={[-0.15, 0.02, 0.1]}>
      <torusGeometry args={[0.12, 0.015, 8, 24]} />
      <meshStandardMaterial color="#1a1a1a" metalness={0.4} roughness={0.3} />
    </mesh>
    <mesh position={[0.15, 0.02, 0.1]}>
      <torusGeometry args={[0.12, 0.015, 8, 24]} />
      <meshStandardMaterial color="#1a1a1a" metalness={0.4} roughness={0.3} />
    </mesh>
    {/* Arms */}
    <mesh position={[-0.28, 0.02, -0.08]} rotation={[0, 0.3, 0]}>
      <boxGeometry args={[0.02, 0.015, 0.35]} />
      <meshStandardMaterial color="#1a1a1a" metalness={0.4} roughness={0.3} />
    </mesh>
    <mesh position={[0.28, 0.02, -0.08]} rotation={[0, -0.3, 0]}>
      <boxGeometry args={[0.02, 0.015, 0.35]} />
      <meshStandardMaterial color="#1a1a1a" metalness={0.4} roughness={0.3} />
    </mesh>
  </group>
);

// ─── Sticky Note 3D ───
const StickyNote3D: React.FC<{
  position: [number, number, number];
  rotation?: [number, number, number];
  color?: string;
}> = ({ position, rotation = [0, 0, 0], color = '#fff59d' }) => (
  <Float speed={1.5} rotationIntensity={0.08} floatIntensity={0.15}>
    <mesh position={position} rotation={rotation} castShadow>
      <boxGeometry args={[0.7, 0.015, 0.7]} />
      <meshStandardMaterial color={color} roughness={0.9} />
    </mesh>
  </Float>
);

// ─── Sticker (glowing orb) ───
const Sticker: React.FC<{ position: [number, number, number]; color?: string }> = ({
  position, color = '#ff69b4'
}) => (
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

// ─── Y2K Star Charm ───
const StarCharm: React.FC<{
  position: [number, number, number];
  color?: string;
}> = ({ position, color = '#ffd700' }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.5;
    }
  });

  const starShape = useMemo(() => {
    const shape = new THREE.Shape();
    const outerRadius = 0.12;
    const innerRadius = 0.05;
    for (let i = 0; i < 5; i++) {
      const outerAngle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
      const innerAngle = ((i + 0.5) * 2 * Math.PI) / 5 - Math.PI / 2;
      if (i === 0) {
        shape.moveTo(Math.cos(outerAngle) * outerRadius, Math.sin(outerAngle) * outerRadius);
      } else {
        shape.lineTo(Math.cos(outerAngle) * outerRadius, Math.sin(outerAngle) * outerRadius);
      }
      shape.lineTo(Math.cos(innerAngle) * innerRadius, Math.sin(innerAngle) * innerRadius);
    }
    shape.closePath();
    return shape;
  }, []);

  return (
    <Float speed={3} rotationIntensity={0.3} floatIntensity={0.3}>
      <mesh ref={meshRef} position={position} castShadow>
        <extrudeGeometry args={[starShape, { depth: 0.03, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.01 }]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          metalness={0.6}
          roughness={0.2}
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

      <Environment preset="apartment" />
      <fog attach="fog" args={['#1a1520', 8, 18]} />

      {/* Desk with crumpled grid paper texture */}
      <Desk />

      {/* Notebooks */}
      <Notebook position={[-1.5, 0, -0.3]} rotation={[0, 0.15, 0]} color="#f5a0b0" />
      <Notebook position={[1.2, 0, 0.5]} rotation={[0, -0.3, 0]} color="#a0c8f0" />
      <Notebook position={[0, 0, -1.5]} rotation={[0, 0.05, 0]} color="#b8e6c8" />

      {/* Pinned study photo (reference image) */}
      <PinnedPhoto position={[-2.8, 0, -1.8]} rotation={[0, 0.25, 0]} />

      {/* Pencils */}
      <Pencil position={[2.5, 0, -0.8]} rotation={[0, 0.6, 0]} color="#f7c948" />
      <Pencil position={[-0.5, 0, 1.2]} rotation={[0, -0.2, 0]} color="#ff8a80" />

      {/* Eraser */}
      <Eraser position={[0.8, 0, -0.5]} rotation={[0, 0.4, 0]} />

      {/* Drinks — hot & iced coffee */}
      <CoffeeCup position={[3.2, 0, 1]} />
      <IcedCoffee position={[-3, 0, 0.8]} />

      {/* Binder Clips */}
      <BinderClip position={[-1.8, 0, 1.5]} rotation={[0, 0.5, 0]} />
      <BinderClip position={[2.2, 0, -1.8]} rotation={[0, -0.3, 0]} />

      {/* Rolled papers / posters */}
      <RolledPaper position={[3.5, 0.08, -1.5]} rotation={[0, 0.8, 0]} color="#8b4513" />
      <RolledPaper position={[3.2, 0.18, -1.3]} rotation={[0, 0.6, 0]} color="#4a0e3e" />

      {/* Y2K Sunglasses */}
      <Sunglasses position={[1.8, 0.1, 1.2]} rotation={[-Math.PI / 2 + 0.1, 0, 0.2]} />

      {/* Sticky Notes */}
      <StickyNote3D position={[-2.5, 0.1, 1.8]} rotation={[0, 0.2, 0]} color="#fff59d" />
      <StickyNote3D position={[0.5, 0.1, -2]} rotation={[0, -0.15, 0]} color="#ffab91" />
      <StickyNote3D position={[-0.8, 0.1, -2.5]} rotation={[0, 0.35, 0]} color="#ce93d8" />

      {/* Sticker orbs */}
      <Sticker position={[-2, 0.3, -1.2]} color="#ff69b4" />
      <Sticker position={[2.5, 0.25, 0.3]} color="#64b5f6" />
      <Sticker position={[0, 0.35, 1.5]} color="#81c784" />
      <Sticker position={[-1, 0.4, 0.8]} color="#ffb74d" />

      {/* Y2K Star Charms */}
      <StarCharm position={[1.5, 0.6, 1.8]} color="#ffd700" />
      <StarCharm position={[-1.8, 0.5, -0.5]} color="#ff69b4" />
      <StarCharm position={[0.3, 0.7, -1]} color="#64ffda" />

      {/* Sparkle particles */}
      <Sparkles />

      {/* Post-processing */}
      <EffectComposer>
        <Bloom luminanceThreshold={0.6} luminanceSmoothing={0.9} intensity={0.8} mipmapBlur />
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

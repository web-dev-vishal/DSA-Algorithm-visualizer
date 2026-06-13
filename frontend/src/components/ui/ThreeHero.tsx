import { useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

interface NodeItem {
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  targetPos: THREE.Vector3;
}

function GraphConstellation() {
  const { pointer } = useThree();
  const spheresRef = useRef<THREE.Group>(null);
  const linesGeomRef = useRef<THREE.BufferGeometry>(null);

  // Initialize nodes
  const nodeCount = 35;
  const [nodes, setNodes] = useState<NodeItem[]>([]);

  useEffect(() => {
    const arr: NodeItem[] = [];
    for (let i = 0; i < nodeCount; i++) {
      const pos = new THREE.Vector3(
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 4
      );
      arr.push({
        pos,
        vel: new THREE.Vector3(
          (Math.random() - 0.5) * 0.015,
          (Math.random() - 0.5) * 0.015,
          (Math.random() - 0.5) * 0.01
        ),
        targetPos: pos.clone(),
      });
    }
    setNodes(arr);
  }, []);

  useFrame(() => {
    if (!spheresRef.current || nodes.length === 0) return;

    // Convert mouse normalized coords [-1, 1] to approximate 3D world space
    const mouseX = pointer.x * 6;
    const mouseY = pointer.y * 4;
    const mouseVec = new THREE.Vector3(mouseX, mouseY, 0);

    // Update node positions
    nodes.forEach((node) => {
      // Base movement
      node.pos.add(node.vel);

      // Repel from mouse if close
      const distToMouse = node.pos.distanceTo(mouseVec);
      if (distToMouse < 2.5) {
        const dir = new THREE.Vector3().subVectors(node.pos, mouseVec).normalize();
        const force = (2.5 - distToMouse) * 0.05;
        node.pos.addScaledVector(dir, force);
      }

      // Boundary collision check
      if (Math.abs(node.pos.x) > 8) node.vel.x *= -1;
      if (Math.abs(node.pos.y) > 5) node.vel.y *= -1;
      if (Math.abs(node.pos.z) > 4) node.vel.z *= -1;
    });

    // Update sphere mesh positions in the scene graph
    const children = spheresRef.current.children;
    for (let i = 0; i < nodeCount; i++) {
      const child = children[i];
      if (child) {
        child.position.copy(nodes[i]!.pos);
      }
    }

    // Generate dynamic connections (lines) between close nodes
    const linePairs: number[] = [];
    for (let i = 0; i < nodeCount; i++) {
      for (let j = i + 1; j < nodeCount; j++) {
        const p1 = nodes[i]!.pos;
        const p2 = nodes[j]!.pos;
        const dist = p1.distanceTo(p2);
        if (dist < 2.8) {
          linePairs.push(p1.x, p1.y, p1.z, p2.x, p2.y, p2.z);
        }
      }
    }

    // Update buffer geometry lines
    if (linesGeomRef.current) {
      const positions = new Float32Array(linePairs);
      linesGeomRef.current.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      linesGeomRef.current.computeBoundingSphere();
    }
  });

  return (
    <group>
      {/* Draw Nodes */}
      <group ref={spheresRef}>
        {nodes.map((node, idx) => (
          <mesh key={idx} position={node.pos.toArray() as [number, number, number]}>
            <sphereGeometry args={[idx % 3 === 0 ? 0.12 : 0.08, 16, 16]} />
            <meshBasicMaterial color={idx % 3 === 0 ? "#8b5cf6" : "#6366f1"} transparent opacity={0.8} />
          </mesh>
        ))}
      </group>

      {/* Draw Edges */}
      <lineSegments>
        <bufferGeometry ref={linesGeomRef} />
        <lineBasicMaterial color="#6366f1" transparent opacity={0.2} linewidth={1} />
      </lineSegments>
    </group>
  );
}

export function ThreeHero() {
  const [webGlSupported, setWebGlSupported] = useState(true);

  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const support = !!(window.WebGLRenderingContext && (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")));
      setWebGlSupported(support);
    } catch {
      setWebGlSupported(false);
    }
  }, []);

  if (!webGlSupported) {
    // Elegant mesh background fallback
    return (
      <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-indigo-500/5 via-violet-500/5 to-purple-500/5 animate-pulse" />
    );
  }

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-auto opacity-70 dark:opacity-50">
      <Canvas
        camera={{ position: [0, 0, 7], fov: 60 }}
        style={{ background: "transparent" }}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={0.5} />
        <GraphConstellation />
      </Canvas>
    </div>
  );
}

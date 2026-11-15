import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { Suspense, useRef } from "react";
import type { Mesh } from "three";
import image from "@/assets/mark-editorial.jpg";
function EditorialPlane() {
  const { viewport } = useThree();
  const height = Math.max(viewport.height, viewport.width / 1.875) * 1.02;
  const texture = useTexture(image);
  const mesh = useRef<Mesh>(null);
  useFrame(({ pointer, camera, gl }, delta) => {
    if (!mesh.current) return;
    mesh.current.rotation.y +=
      (pointer.x * 0.025 - mesh.current.rotation.y) * Math.min(delta * 3, 1);
    camera.position.x += (pointer.x * 0.08 - camera.position.x) * Math.min(delta * 2, 1);
    gl.domElement.parentElement?.setAttribute("data-scene-ready", "true");
  });
  return (
    <mesh ref={mesh}>
      <planeGeometry args={[height * 1.875, height]} />
      <meshBasicMaterial map={texture} />
    </mesh>
  );
}
export default function EditorialScene() {
  return (
    <div className="hero-canvas">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 70 }}
        dpr={[1, 1.25]}
        gl={{ alpha: true, antialias: false }}
      >
        <Suspense fallback={null}>
          <EditorialPlane />
        </Suspense>
      </Canvas>
    </div>
  );
}

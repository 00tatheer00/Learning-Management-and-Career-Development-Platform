"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export function Hero3DCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // --- Scene, Camera, Renderer Setup ---
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 15);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });

    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));

    const canvas = renderer.domElement;
    canvas.style.position = "absolute";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.pointerEvents = "none";
    container.appendChild(canvas);

    // --- Ambient & Point Lighting ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const primaryLight = new THREE.PointLight(0xf97316, 6, 30);
    primaryLight.position.set(5, 5, 8);
    scene.add(primaryLight);

    const secondaryLight = new THREE.PointLight(0x06b6d4, 4, 30);
    secondaryLight.position.set(-5, -5, 8);
    scene.add(secondaryLight);

    // --- Elegant 3D Topographic Mesh Plane ---
    const meshWidth = 40;
    const meshHeight = 25;
    const widthSegs = 45;
    const heightSegs = 30;

    const geometry = new THREE.PlaneGeometry(meshWidth, meshHeight, widthSegs, heightSegs);

    // Store original position coordinates for liquid wave calculation
    const posAttr = geometry.attributes.position;
    const count = posAttr.count;
    const initialZ = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      initialZ[i] = posAttr.getZ(i);
    }

    // Modern glowing wireframe mesh material
    const material = new THREE.MeshStandardMaterial({
      color: 0xf97316,
      wireframe: true,
      transparent: true,
      opacity: 0.28,
      roughness: 0.3,
      metalness: 0.8,
      emissive: 0xea580c,
      emissiveIntensity: 0.15,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = -Math.PI * 0.22; // Gentle tilt angle
    mesh.position.set(0, -1.5, -2);
    scene.add(mesh);

    // --- Subtle Mouse Parallax ---
    const mouse = {
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0,
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      mouse.targetX = (x / container.clientWidth) * 2 - 1;
      mouse.targetY = -(y / container.clientHeight) * 2 + 1;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    // --- Render Loop with Intersection Observer Pause ---
    let animationFrameId: number;
    const clock = new THREE.Clock();
    let isInView = true;

    const observer = new IntersectionObserver(
      ([entry]) => {
        isInView = entry.isIntersecting;
        if (isInView && !animationFrameId) {
          clock.start();
          render();
        }
      },
      { threshold: 0.05 }
    );
    observer.observe(container);

    const render = () => {
      if (!isInView) return;

      animationFrameId = requestAnimationFrame(render);
      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse lerp
      mouse.x += (mouse.targetX - mouse.x) * 0.04;
      mouse.y += (mouse.targetY - mouse.y) * 0.04;

      // Dynamic light tracking with mouse
      primaryLight.position.x = mouse.x * 8 + 4;
      primaryLight.position.y = mouse.y * 5 + 3;

      secondaryLight.position.x = -mouse.x * 8 - 4;
      secondaryLight.position.y = -mouse.y * 5 - 3;

      // Subtle mesh rotation response to cursor
      mesh.rotation.y = mouse.x * 0.08;
      mesh.rotation.z = mouse.y * 0.04;

      // Smooth organic wave displacement
      const pos = geometry.attributes.position;
      for (let i = 0; i < count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);

        const wave1 = Math.sin(x * 0.35 + elapsedTime * 1.2);
        const wave2 = Math.cos(y * 0.4 + elapsedTime * 0.9);
        const centerRipple = Math.sin(Math.sqrt(x * x + y * y) * 0.3 - elapsedTime * 1.5);

        const z = initialZ[i] + (wave1 + wave2 + centerRipple * 0.4) * 0.35;
        pos.setZ(i, z);
      }
      pos.needsUpdate = true;

      renderer.render(scene, camera);
    };

    render();

    // --- Resize Listener ---
    const handleResize = () => {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    };

    window.addEventListener("resize", handleResize, { passive: true });

    // --- Cleanup ---
    return () => {
      observer.disconnect();
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);

      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }

      geometry.dispose();
      material.dispose();
      renderer.dispose();

      if (canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none opacity-80"
      aria-hidden="true"
    />
  );
}

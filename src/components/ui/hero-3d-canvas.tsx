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
    camera.position.set(0, 0, 16);

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

    // --- Pure White Lighting ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const primaryWhiteLight = new THREE.PointLight(0xffffff, 5, 35);
    primaryWhiteLight.position.set(4, 4, 10);
    scene.add(primaryWhiteLight);

    const secondaryWhiteLight = new THREE.PointLight(0xf8fafc, 3, 30);
    secondaryWhiteLight.position.set(-4, -4, 8);
    scene.add(secondaryWhiteLight);

    // --- Minimal & Simple 3D Mesh Plane (Pure White Lines) ---
    const meshWidth = 38;
    const meshHeight = 22;
    const widthSegs = 36;
    const heightSegs = 22;

    const geometry = new THREE.PlaneGeometry(meshWidth, meshHeight, widthSegs, heightSegs);

    const posAttr = geometry.attributes.position;
    const count = posAttr.count;
    const initialZ = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      initialZ[i] = posAttr.getZ(i);
    }

    // Clean, crisp, white wireframe material
    const material = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      wireframe: true,
      transparent: true,
      opacity: 0.2, // Ultra subtle pure white glow
      roughness: 0.2,
      metalness: 0.9,
      emissive: 0xffffff,
      emissiveIntensity: 0.12,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = -Math.PI * 0.24; // Gentle slope
    mesh.position.set(0, -1.8, -2);
    scene.add(mesh);

    // --- Mouse Parallax ---
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

    // --- Gentle & Slow Wave Render Loop ---
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
      mouse.x += (mouse.targetX - mouse.x) * 0.03;
      mouse.y += (mouse.targetY - mouse.y) * 0.03;

      // Soft light tracking
      primaryWhiteLight.position.x = mouse.x * 6 + 3;
      primaryWhiteLight.position.y = mouse.y * 4 + 3;

      mesh.rotation.y = mouse.x * 0.05;
      mesh.rotation.z = mouse.y * 0.02;

      // Very subtle, calm wave motion
      const pos = geometry.attributes.position;
      for (let i = 0; i < count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);

        const wave1 = Math.sin(x * 0.28 + elapsedTime * 0.8);
        const wave2 = Math.cos(y * 0.32 + elapsedTime * 0.6);

        const z = initialZ[i] + (wave1 + wave2) * 0.25;
        pos.setZ(i, z);
      }
      pos.needsUpdate = true;

      renderer.render(scene, camera);
    };

    render();

    // --- Resize Handler ---
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
      className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none opacity-85"
      aria-hidden="true"
    />
  );
}

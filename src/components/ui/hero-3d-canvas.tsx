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
    
    // Smooth white horizon fog so orange grid fades elegantly into clean white background
    scene.fog = new THREE.FogExp2(0xffffff, 0.028);

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

    // --- Bright Light Lighting ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const orangeSpotLight = new THREE.PointLight(0xf97316, 6, 35);
    orangeSpotLight.position.set(4, 5, 8);
    scene.add(orangeSpotLight);

    const fillWhiteLight = new THREE.DirectionalLight(0xffffff, 1.0);
    fillWhiteLight.position.set(-5, 10, 10);
    scene.add(fillWhiteLight);

    // --- Clean 3D Mesh Plane (Vibrant Orange Grid) ---
    const meshWidth = 38;
    const meshHeight = 24;
    const widthSegs = 38;
    const heightSegs = 24;

    const geometry = new THREE.PlaneGeometry(meshWidth, meshHeight, widthSegs, heightSegs);

    const posAttr = geometry.attributes.position;
    const count = posAttr.count;
    const initialZ = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      initialZ[i] = posAttr.getZ(i);
    }

    // Vibrant Orange Wireframe Material over Light White Background
    const material = new THREE.MeshStandardMaterial({
      color: 0xf97316, // Vibrant Orange
      wireframe: true,
      transparent: true,
      opacity: 0.38, // Crisp, highly visible orange grid lines
      roughness: 0.2,
      metalness: 0.8,
      emissive: 0xea580c,
      emissiveIntensity: 0.2,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = -Math.PI * 0.23; // Elegant perspective slope
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

      // Orange spotlight tracking
      orangeSpotLight.position.x = mouse.x * 7 + 3;
      orangeSpotLight.position.y = mouse.y * 4 + 3;

      mesh.rotation.y = mouse.x * 0.06;
      mesh.rotation.z = mouse.y * 0.03;

      // Smooth wave motion
      const pos = geometry.attributes.position;
      for (let i = 0; i < count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);

        const wave1 = Math.sin(x * 0.3 + elapsedTime * 1.0);
        const wave2 = Math.cos(y * 0.35 + elapsedTime * 0.8);

        const z = initialZ[i] + (wave1 + wave2) * 0.3;
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
      className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none opacity-90"
      aria-hidden="true"
    />
  );
}

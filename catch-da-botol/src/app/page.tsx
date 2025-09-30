"use client";
import { useEffect, useRef } from 'react';
import Head from 'next/head';
import Image from 'next/image';

const Home = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scoreRef = useRef(0);
  const gameOverRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Canvas settings
    canvas.width = 800;
    canvas.height = 600;

    // Game objects
    const basket = {
      x: canvas.width / 2 - 50,
      y: canvas.height - 50,
      width: 100,
      height: 50,
      speed: 10,
    };

    const bottles: { x: number; y: number; width: number; height: number; speed: number }[] = [];
    const bottleSpawnRate = 1000; // Spawn every 1 second
    let lastSpawn = 0;

    // Basket image
    const basketImg = new window.Image();
    basketImg.src = '/basket.png';

    // Bottle image
    const bottleImg = new window.Image();
    bottleImg.src = '/bottle.png';

    // Mouse movement
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      basket.x = e.clientX - rect.left - basket.width / 2;
      if (basket.x < 0) basket.x = 0;
      if (basket.x > canvas.width - basket.width) basket.x = canvas.width - basket.width;
    };

    canvas.addEventListener('mousemove', handleMouseMove);

    // Spawn bottles
    const spawnBottle = () => {
      bottles.push({
        x: Math.random() * (canvas.width - 30),
        y: -30,
        width: 30,
        height: 50,
        speed: 2 + Math.random() * 3,
      });
    };

    // Game loop
    const gameLoop = (timestamp: number) => {
      if (gameOverRef.current) return;

      // Spawn bottles
      if (timestamp - lastSpawn > bottleSpawnRate) {
        spawnBottle();
        lastSpawn = timestamp;
      }

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw basket
      ctx.drawImage(basketImg, basket.x, basket.y, basket.width, basket.height);

      // Update and draw bottles
      bottles.forEach((bottle, index) => {
        bottle.y += bottle.speed;

        // Check collision
        if (
          bottle.y + bottle.height > basket.y &&
          bottle.x + bottle.width > basket.x &&
          bottle.x < basket.x + basket.width
        ) {
          scoreRef.current += 10;
          bottles.splice(index, 1);
        }

        // Game over condition
        if (bottle.y > canvas.height) {
          gameOverRef.current = true;
          alert(`Game Over! Score: ${scoreRef.current}`);
        }

        // Draw bottle
        ctx.drawImage(bottleImg, bottle.x, bottle.y, bottle.width, bottle.height);
      });

      // Draw score
      ctx.fillStyle = 'black';
      ctx.font = '20px Arial';
      ctx.fillText(`Score: ${scoreRef.current}`, 10, 30);

      requestAnimationFrame(gameLoop);
    };

    // Start game
    requestAnimationFrame(gameLoop);

    // Cleanup
    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <Head>
        <title>Catch Bottles</title>
      </Head>
      <h1 className="text-4xl font-bold mb-4 text-blue-500">Catch Bottles</h1>
      <canvas
        ref={canvasRef}
        className="border-2 border-black"
      />
      <p className="mt-4 text-lg text-gray-800">Move your mouse to catch the falling bottles!</p>
    </div>
  );
};

export default Home;
"use client";
import { useEffect, useRef } from 'react';
import Head from 'next/head';

const Home = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scoreRef = useRef(0);
  const gameOverRef = useRef(false);
  const basketRef = useRef({
    x: 0,
    y: 0,
    width: 100,
    height: 50,
    speed: 10,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Responsive canvas size
    const updateCanvasSize = () => {
      const maxWidth = window.innerWidth > 800 ? 800 : window.innerWidth - 20;
      canvas.width = maxWidth;
      canvas.height = maxWidth * 0.75; // Maintain aspect ratio (800x600)
      basketRef.current.y = canvas.height - 50;
      basketRef.current.x = canvas.width / 2 - basketRef.current.width / 2;
    };
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    const bottles: { x: number; y: number; width: number; height: number; speed: number }[] = [];
    const bottleSpawnRate = 1000;
    let lastSpawn = 0;

    // Load images
    const basketImg = new window.Image();
    basketImg.src = 'basket.png';
    const bottleImg = new window.Image();
    bottleImg.src = 'bottle.png';

    // Define allowed key codes
    type KeyCode = 'ArrowLeft' | 'ArrowRight' | 'KeyA' | 'KeyD';
    const keys: Record<KeyCode, boolean> = {
      ArrowLeft: false,
      ArrowRight: false,
      KeyA: false,
      KeyD: false,
    };

    // Keyboard controls
    const handleKeyDown = (e: KeyboardEvent) => {
      const code = e.code as KeyCode;
      if (code in keys) {
        keys[code] = true;
        e.preventDefault();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      const code = e.code as KeyCode;
      if (code in keys) {
        keys[code] = false;
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Mouse controls
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      basketRef.current.x = e.clientX - rect.left - basketRef.current.width / 2;
      if (basketRef.current.x < 0) basketRef.current.x = 0;
      if (basketRef.current.x > canvas.width - basketRef.current.width) {
        basketRef.current.x = canvas.width - basketRef.current.width;
      }
    };
    canvas.addEventListener('mousemove', handleMouseMove);

    // Touch controls
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      basketRef.current.x = touch.clientX - rect.left - basketRef.current.width / 2;
      if (basketRef.current.x < 0) basketRef.current.x = 0;
      if (basketRef.current.x > canvas.width - basketRef.current.width) {
        basketRef.current.x = canvas.width - basketRef.current.width;
      }
    };
    canvas.addEventListener('touchstart', handleTouchMove);
    canvas.addEventListener('touchmove', handleTouchMove);

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

      // Keyboard movement
      if (keys.ArrowLeft || keys.KeyA) {
        basketRef.current.x -= basketRef.current.speed;
        if (basketRef.current.x < 0) basketRef.current.x = 0;
      }
      if (keys.ArrowRight || keys.KeyD) {
        basketRef.current.x += basketRef.current.speed;
        if (basketRef.current.x > canvas.width - basketRef.current.width) {
          basketRef.current.x = canvas.width - basketRef.current.width;
        }
      }

      // Spawn bottles
      if (timestamp - lastSpawn > bottleSpawnRate) {
        spawnBottle();
        lastSpawn = timestamp;
      }

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw basket
      ctx.drawImage(basketImg, basketRef.current.x, basketRef.current.y, basketRef.current.width, basketRef.current.height);

      // Update and draw bottles
      bottles.forEach((bottle, index) => {
        bottle.y += bottle.speed;

        // Check collision
        if (
          bottle.y + bottle.height > basketRef.current.y &&
          bottle.x + bottle.width > basketRef.current.x &&
          bottle.x < basketRef.current.x + basketRef.current.width
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
      ctx.fillStyle = 'red';
      ctx.font = '20px Arial';
      ctx.fillText(`Score: ${scoreRef.current}`, 10, 30);

      requestAnimationFrame(gameLoop);
    };

    // Start game after images load
    Promise.all([
      new Promise((resolve) => { basketImg.onload = resolve; }),
      new Promise((resolve) => { bottleImg.onload = resolve; }),
    ]).then(() => requestAnimationFrame(gameLoop));

    // Cleanup
    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('touchstart', handleTouchMove);
      canvas.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-2">
      <Head>
        <title>Catch Bottles</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <h1 className="text-4xl font-bold mb-4 text-purple-900">Catch Bottles</h1>
      <canvas
        ref={canvasRef}
        className="border-2 border-purple-900 rounded-lg max-w-full"
        style={{ touchAction: 'none' }}
      />
      <p className="mt-4 text-lg text-center text-purple-600">
        Desktop: Use mouse or arrow keys (A/D). Mobile: Swipe to move the basket.
      </p>
    </div>
  );
};

export default Home;
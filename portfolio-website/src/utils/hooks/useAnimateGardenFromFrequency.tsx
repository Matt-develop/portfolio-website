import React, { useEffect, useState } from "react";
import type { Plant } from "../../components/VoiceGarden/VoiceGarden";
import { drawPlant } from "../drawPlant";

export const useAnimateGardenFromFrequency = (
  plants,
  setPlants,
  canvasRef,
  freqRef
) => {
  //const [x, setX] = useState(0);

  const BASS_THRESHOLD = -45;
  const TREBLE_THRESHOLD = -60;
  const QUIET_THRESHOLD = -90;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !freqRef.current) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const draw = () => {
      const freq = freqRef.current;
      if (!freq) return;

      const avg = (arr: Float32Array) =>
        arr.reduce((sum, v) => sum + v, 0) / arr.length;

      const bass = freq.slice(0, 10);
      const treble = freq.slice(40);
      const avgBass = avg(bass);
      const avgTreble = avg(treble);
      const totalEnergy = avg(freq);

      setPlants((prev) => {
        let next = [...prev];

        // 🌱 Add plant on bass
        if (avgBass > BASS_THRESHOLD) {
          const plantTypes: Plant["type"][] = ["leaf", "bush", "flower"];
          const newPlant: Plant = {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 10 + 15,
            type: plantTypes[Math.floor(Math.random() * plantTypes.length)],
            color: `hsl(${Math.random() * 360}, 70%, 60%)`,
            growth: 0,
          };
          next = [...next.slice(-100), newPlant];
        }

        // 🎈 Animate growth and float
        next = next.map((p) => ({
          ...p,
          growth: Math.min(1, p.growth + 0.02),
          y: p.y + Math.sin(Date.now() / 500 + p.x) * 0.3,
        }));

        // 🪻 Treble = vertical clustering
        if (avgTreble > TREBLE_THRESHOLD) {
          next = next.map((p) =>
            Math.random() < 0.3 ? { ...p, y: p.y - 2 } : p
          );
        }

        // 🧘 Silence = shrink/fade
        if (totalEnergy < QUIET_THRESHOLD) {
          next = next
            .map((p) => ({ ...p, size: Math.max(0, p.size - 0.1) }))
            .filter((p) => p.size > 0.5);
        }

        return next;
      });

      // 🌿 Clear + draw plants
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#111827";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      plants.forEach((p) => drawPlant(ctx, p));

      requestAnimationFrame(draw);
    };

    draw();
  }, [freqRef, plants]);

  //return scroll;
};

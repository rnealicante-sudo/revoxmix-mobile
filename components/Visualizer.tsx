
import React, { useEffect, useRef } from 'react';
import { StereoAnalysers } from '../types';

interface VisualizerProps {
  analysers: StereoAnalysers | null;
  isPaused: boolean;
}

const Visualizer: React.FC<VisualizerProps> = ({ analysers, isPaused }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const peaksRef = useRef<number[]>([]);

  useEffect(() => {
    if (!canvasRef.current || !analysers) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    const resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(canvas.parentElement!);
    resizeCanvas();

    // Reducimos el número de bandas para una estética más retro/limpia
    const numBars = 32;
    const dataL = new Uint8Array(analysers.left.frequencyBinCount);
    const dataR = new Uint8Array(analysers.right.frequencyBinCount);
    
    // Inicializar picos si no existen o cambió el número de barras
    if (peaksRef.current.length !== numBars) {
      peaksRef.current = new Array(numBars).fill(0);
    }

    let animationId: number;

    const draw = () => {
      animationId = requestAnimationFrame(draw);
      
      analysers.left.getByteFrequencyData(dataL);
      analysers.right.getByteFrequencyData(dataR);

      const width = canvas.width / dpr;
      const height = canvas.height / dpr;

      // Fondo LCD profundo
      ctx.fillStyle = '#050a05'; 
      ctx.fillRect(0, 0, width, height);

      const barWidth = (width / numBars);
      const gap = 1.5;

      for (let i = 0; i < numBars; i++) {
        // Promediamos L y R, y aplicamos una curva para que los medios/altos sean más visibles
        // Usamos solo los primeros bins que contienen la mayor parte de la energía musical
        const binIdx = Math.floor(i * (dataL.length * 0.4) / numBars);
        let val = isPaused ? 0 : (dataL[binIdx] + dataR[binIdx]) / 2;
        
        // Sensibilidad ajustada: multiplicamos por un factor que aumenta con la frecuencia
        const boost = 1 + (i / numBars) * 1.5;
        const h = (val / 255) * height * boost;
        const finalH = Math.min(height - 4, h);

        // Gestión de picos (caída lenta)
        if (finalH > peaksRef.current[i]) {
          peaksRef.current[i] = finalH;
        } else {
          peaksRef.current[i] *= 0.96;
        }

        const x = i * barWidth;
        
        // Dibujar barra de espectro segmentada
        const numSegments = 16;
        const segmentHeight = (height - 4) / numSegments;
        const activeSegments = Math.ceil(finalH / segmentHeight);

        for (let s = 0; s < numSegments; s++) {
          const sy = height - (s + 1) * segmentHeight;
          
          if (s < activeSegments) {
            // Color según altura (Verde -> Amarillo -> Rojo)
            if (s > numSegments * 0.85) ctx.fillStyle = '#ff3333';
            else if (s > numSegments * 0.65) ctx.fillStyle = '#ffff00';
            else ctx.fillStyle = '#00ff66';
          } else {
            ctx.fillStyle = '#101a10'; // Segmento apagado
          }
          
          ctx.fillRect(x + gap, sy, barWidth - gap * 2, segmentHeight - 1);
        }

        // Dibujar puntito de pico
        const peakY = height - peaksRef.current[i] - 2;
        if (peaksRef.current[i] > 2) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(x + gap, peakY, barWidth - gap * 2, 1.5);
        }
      }

      // Rejilla de fondo tenue
      ctx.strokeStyle = 'rgba(0, 255, 0, 0.05)';
      ctx.lineWidth = 0.5;
      for(let x = 0; x < width; x += barWidth) {
          ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
      }

      // Efecto Scanline CRT
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      for (let i = 0; i < height; i += 3) ctx.fillRect(0, i, width, 1);
    };

    draw();
    return () => {
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
    };
  }, [analysers, isPaused]);

  return (
    <div className="w-full h-full bg-[#030803] rounded-sm overflow-hidden relative shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
};

export default Visualizer;

"use client";
import { useState, useEffect, useCallback } from 'react';

export default function Equalizer({ className }: { className?: string }) {
  const [bars, setBars] = useState<number[]>(() => 
    Array.from({length: 16}, () => Math.random() * 15 + 15) // Valores iniciais entre 15% e 30%
  );
  const [isAnimating, setIsAnimating] = useState(true);

  const animateBars = useCallback(() => {
    setBars(prev => prev.map(() => 
      Math.abs(Math.sin(Date.now() / 150 + Math.random() * 8)) * 40 + 10 // Reduzido o multiplicador para barras menos alongadas
    ));
  }, []);

  useEffect(() => {
    if (!isAnimating) return;
    
    const interval = setInterval(animateBars, 120); // Ajustado para animação mais fluida
    return () => clearInterval(interval);
  }, [isAnimating, animateBars]);

  return (
    <div 
      className={`flex items-end justify-center h-full gap-1 ${className}`}
    >
      {bars.map((height, index) => (
        <div
          key={index}
          className="w-4 bg-gradient-to-t from-orange-500 to-green-500 transition-all duration-500 ease-out" // Aumentado de 300 para 500
          style={{ height: `${height}%` }}
        />
      ))}
    </div>
  );
}
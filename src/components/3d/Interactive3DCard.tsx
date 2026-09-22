import React, { useRef, useState } from 'react';

interface Interactive3DCardProps {
  children: React.ReactNode;
  glowColor?: string;
  depth?: number;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export const Interactive3DCard: React.FC<Interactive3DCardProps> = ({
  children,
  glowColor = '#FF6B35',
  depth = 25,
  style = {},
  onClick,
}) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [transform, setTransform] = useState<string>('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
  const [glare, setGlare] = useState<{ x: number; y: number; opacity: number }>({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = -((y - centerY) / centerY) * (depth * 0.4);
    const rotateY = ((x - centerX) / centerX) * (depth * 0.45);

    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;

    setTransform(
      `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(12px) scale3d(1.025, 1.025, 1.025)`
    );
    setGlare({ x: glareX, y: glareY, opacity: 0.18 });
  };

  const handleMouseLeave = () => {
    setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px) scale3d(1, 1, 1)');
    setGlare({ x: 50, y: 50, opacity: 0 });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        position: 'relative',
        transformStyle: 'preserve-3d',
        transform,
        transition: 'transform 0.12s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.2s ease',
        cursor: onClick ? 'pointer' : 'default',
        boxShadow: `0 15px 35px rgba(0, 0, 0, 0.6), 0 0 25px ${glowColor}18`,
        ...style,
      }}
    >
      {/* Dynamic 3D Glare Specular Highlight */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 'inherit',
          background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255, 255, 255, ${glare.opacity}), transparent 65%)`,
          pointerEvents: 'none',
          zIndex: 20,
          transition: 'opacity 0.2s ease',
        }}
      />
      {children}
    </div>
  );
};

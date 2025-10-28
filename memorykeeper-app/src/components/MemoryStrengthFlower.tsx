
import { type FC } from 'react';

interface MemoryStrengthFlowerProps {
  strength: number;
  size?: number;
}

const MemoryStrengthFlower: FC<MemoryStrengthFlowerProps> = ({ 
  strength, 
  size = 200 
}) => {
  // Calculate petal properties based on strength
  const petalCount = Math.max(5, Math.floor(strength / 10));
  const petalSize = Math.max(20, strength / 2);
  const bloomIntensity = strength / 100;
  
  // Colors based on strength
  const petalColor = strength > 80 
    ? '#f59e0b' // amber for high strength
    : strength > 60 
    ? '#10b981' // green for medium strength
    : strength > 40 
    ? '#3b82f6' // blue for moderate strength
    : '#8b5cf6'; // purple for lower strength
  
  const centerColor = strength > 80 
    ? '#fbbf24' // yellow center for high strength
    : strength > 60 
    ? '#34d399' // teal center for medium strength
    : strength > 40 
    ? '#60a5fa' // light blue center for moderate strength
    : '#a78bfa'; // light purple center for lower strength

  return (
    <div 
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
      aria-label={`Memory strength visualization: ${strength}%`}
    >
      {/* Flower center */}
      <div 
        className="absolute rounded-full z-10 shadow-lg"
        style={{
          width: size * 0.3,
          height: size * 0.3,
          backgroundColor: centerColor,
          boxShadow: `0 0 ${size * 0.1}px ${centerColor}80`
        }}
      />
      
      {/* Petals */}
      {Array.from({ length: petalCount }).map((_, index) => {
        const angle = (index * 360) / petalCount;
        const rotation = angle + 90;
        
        return (
          <div
            key={index}
            className="absolute rounded-full origin-bottom transition-all duration-500 ease-out"
            style={{
              width: petalSize * (0.8 + bloomIntensity * 0.4),
              height: size * 0.4 * (0.8 + bloomIntensity * 0.4),
              backgroundColor: `${petalColor}${Math.floor(80 + bloomIntensity * 20).toString(16)}`,
              transform: `
                rotate(${rotation}deg) 
                translate(0, ${-size * 0.2}px)
              `,
              bottom: '50%',
              left: '50%',
              transformOrigin: '50% 100%',
              opacity: 0.9,
              filter: `blur(${1 - bloomIntensity}px)`,
              boxShadow: `0 0 ${size * 0.05}px ${petalColor}80`
            }}
          />
        );
      })}
      
      {/* Subtle glow effect for high strength */}
      {strength > 70 && (
        <div 
          className="absolute rounded-full animate-pulse"
          style={{
            width: size * 1.2,
            height: size * 1.2,
            backgroundColor: `${petalColor}20`,
            zIndex: -1
          }}
        />
      )}
    </div>
  );
};

export default MemoryStrengthFlower;

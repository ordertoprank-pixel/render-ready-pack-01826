import { useState, useRef, useEffect } from "react";

interface CardFrameProps {
  designImage: string | null;
  className?: string;
  initialX?: number;
  initialY?: number;
  rotation?: number;
}

export const CardFrame = ({ 
  designImage, 
  className = "", 
  initialX = 0, 
  initialY = 0, 
  rotation = 0 
}: CardFrameProps) => {
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      
      setPosition(prev => ({
        x: prev.x + dx,
        y: prev.y + dy
      }));
      
      dragStart.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    e.preventDefault();
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY * -0.001;
    setScale(prev => Math.max(0.5, Math.min(3, prev + delta)));
  };

  return (
    <div 
      ref={cardRef}
      className={`absolute ${className} cursor-move`}
      style={{
        transform: `translate(${position.x}px, ${position.y}px) rotate(${rotation}deg)`,
      }}
      onMouseDown={handleMouseDown}
      onWheel={handleWheel}
    >
      {/* White border frame with enhanced shadow */}
      <div 
        className="absolute inset-0 bg-white rounded-[2rem]" 
        style={{ 
          boxShadow: '0 30px 80px -20px rgba(0, 0, 0, 0.4), 0 15px 40px -15px rgba(0, 0, 0, 0.3), 0 5px 15px -5px rgba(0, 0, 0, 0.2)' 
        }} 
      />
      
      {/* Inner content area - black background for uploaded image */}
      <div className="relative mx-[0.875rem] mt-[1.25rem] mb-[0.5rem] h-[calc(100%-1.75rem)] rounded-[1.5rem] overflow-hidden bg-black pointer-events-none">
        {designImage ? (
          <img 
            src={designImage} 
            alt="Uploaded design" 
            className="w-full h-full object-contain transition-transform"
            style={{
              transform: `scale(${scale})`,
            }}
          />
        ) : null}
      </div>
    </div>
  );
};

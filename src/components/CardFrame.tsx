import { useState, useRef, useEffect } from "react";

interface CardFrameProps {
  designImage: string | null;
  className?: string;
  initialX?: number;
  initialY?: number;
  rotation?: number;
  pouchColor?: string;
}

type ResizeHandle = 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'e' | 'w' | null;

export const CardFrame = ({ 
  designImage, 
  className = "", 
  initialX = 0, 
  initialY = 0, 
  rotation: initialRotation = 0,
  pouchColor = "#ffffff"
}: CardFrameProps) => {
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [rotation, setRotation] = useState(initialRotation);
  const [scale, setScale] = useState({ x: 1, y: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [resizingHandle, setResizingHandle] = useState<ResizeHandle>(null);
  const [showHandles, setShowHandles] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const rotationStart = useRef({ rotation: 0, angle: 0 });
  const resizeStart = useRef({ scale: { x: 1, y: 1 }, mouse: { x: 0, y: 0 } });
  const cardRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const dx = e.clientX - dragStart.current.x;
        const dy = e.clientY - dragStart.current.y;
        
        setPosition(prev => ({
          x: prev.x + dx,
          y: prev.y + dy
        }));
        
        dragStart.current = { x: e.clientX, y: e.clientY };
      } else if (isRotating && cardRef.current) {
        const rect = cardRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
        const deltaAngle = angle - rotationStart.current.angle;
        
        setRotation(rotationStart.current.rotation + deltaAngle);
      } else if (resizingHandle) {
        const dx = e.clientX - resizeStart.current.mouse.x;
        const dy = e.clientY - resizeStart.current.mouse.y;
        const sensitivity = 0.003;
        
        setScale(prev => {
          let newScaleX = prev.x;
          let newScaleY = prev.y;
          
          switch (resizingHandle) {
            case 'se':
            case 'e':
              newScaleX = Math.max(0.3, Math.min(3, resizeStart.current.scale.x + dx * sensitivity));
              if (resizingHandle === 'se') {
                newScaleY = Math.max(0.3, Math.min(3, resizeStart.current.scale.y + dy * sensitivity));
              }
              break;
            case 'sw':
            case 'w':
              newScaleX = Math.max(0.3, Math.min(3, resizeStart.current.scale.x - dx * sensitivity));
              if (resizingHandle === 'sw') {
                newScaleY = Math.max(0.3, Math.min(3, resizeStart.current.scale.y + dy * sensitivity));
              }
              break;
            case 'ne':
              newScaleX = Math.max(0.3, Math.min(3, resizeStart.current.scale.x + dx * sensitivity));
              newScaleY = Math.max(0.3, Math.min(3, resizeStart.current.scale.y - dy * sensitivity));
              break;
            case 'nw':
              newScaleX = Math.max(0.3, Math.min(3, resizeStart.current.scale.x - dx * sensitivity));
              newScaleY = Math.max(0.3, Math.min(3, resizeStart.current.scale.y - dy * sensitivity));
              break;
            case 's':
              newScaleY = Math.max(0.3, Math.min(3, resizeStart.current.scale.y + dy * sensitivity));
              break;
            case 'n':
              newScaleY = Math.max(0.3, Math.min(3, resizeStart.current.scale.y - dy * sensitivity));
              break;
          }
          
          return { x: newScaleX, y: newScaleY };
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsRotating(false);
      setResizingHandle(null);
    };

    if (isDragging || isRotating || resizingHandle) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isRotating, resizingHandle]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    e.preventDefault();
  };

  const handleRotateStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRotating(true);
    
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
      
      rotationStart.current = {
        rotation: rotation,
        angle: angle
      };
    }
  };

  const handleResizeStart = (e: React.MouseEvent, handle: ResizeHandle) => {
    e.stopPropagation();
    setResizingHandle(handle);
    resizeStart.current = {
      scale: { ...scale },
      mouse: { x: e.clientX, y: e.clientY }
    };
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY * -0.001;
    setScale(prev => ({
      x: Math.max(0.5, Math.min(3, prev.x + delta)),
      y: Math.max(0.5, Math.min(3, prev.y + delta))
    }));
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
      onMouseEnter={() => setShowHandles(true)}
      onMouseLeave={() => !resizingHandle && !isRotating && setShowHandles(false)}
    >
      {/* Card frame with enhanced shadow */}
      <div 
        className="absolute inset-0 rounded-[2rem]" 
        style={{ 
          backgroundColor: pouchColor,
          boxShadow: '0 30px 80px -20px rgba(0, 0, 0, 0.4), 0 15px 40px -15px rgba(0, 0, 0, 0.3), 0 5px 15px -5px rgba(0, 0, 0, 0.2)' 
        }} 
      />
      
      {/* Inner content area - black background for uploaded image */}
      <div 
        ref={imageRef}
        className="relative mx-[0.875rem] my-[0.875rem] h-[calc(100%-1.75rem)] rounded-[1.5rem] overflow-hidden bg-black"
      >
        {designImage ? (
          <>
            <img 
              src={designImage} 
              alt="Uploaded design" 
              className="w-full h-full object-contain transition-transform pointer-events-none"
              style={{
                transform: `scaleX(${scale.x}) scaleY(${scale.y})`,
              }}
            />
            
            {/* Resize Handles */}
            {showHandles && (
              <>
                <div className="absolute inset-0 pointer-events-none">
                  {/* Corner Handles */}
                  <div 
                    className="absolute -top-1 -left-1 w-3 h-3 bg-primary border-2 border-white rounded-full cursor-nw-resize pointer-events-auto z-10"
                    onMouseDown={(e) => handleResizeStart(e, 'nw')}
                  />
                  <div 
                    className="absolute -top-1 -right-1 w-3 h-3 bg-primary border-2 border-white rounded-full cursor-ne-resize pointer-events-auto z-10"
                    onMouseDown={(e) => handleResizeStart(e, 'ne')}
                  />
                  <div 
                    className="absolute -bottom-1 -left-1 w-3 h-3 bg-primary border-2 border-white rounded-full cursor-sw-resize pointer-events-auto z-10"
                    onMouseDown={(e) => handleResizeStart(e, 'sw')}
                  />
                  <div 
                    className="absolute -bottom-1 -right-1 w-3 h-3 bg-primary border-2 border-white rounded-full cursor-se-resize pointer-events-auto z-10"
                    onMouseDown={(e) => handleResizeStart(e, 'se')}
                  />
                  
                  {/* Edge Handles */}
                  <div 
                    className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-primary border-2 border-white rounded-full cursor-n-resize pointer-events-auto z-10"
                    onMouseDown={(e) => handleResizeStart(e, 'n')}
                  />
                  <div 
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-primary border-2 border-white rounded-full cursor-s-resize pointer-events-auto z-10"
                    onMouseDown={(e) => handleResizeStart(e, 's')}
                  />
                  <div 
                    className="absolute top-1/2 -translate-y-1/2 -left-1 w-3 h-3 bg-primary border-2 border-white rounded-full cursor-w-resize pointer-events-auto z-10"
                    onMouseDown={(e) => handleResizeStart(e, 'w')}
                  />
                  <div 
                    className="absolute top-1/2 -translate-y-1/2 -right-1 w-3 h-3 bg-primary border-2 border-white rounded-full cursor-e-resize pointer-events-auto z-10"
                    onMouseDown={(e) => handleResizeStart(e, 'e')}
                  />
                </div>
                
                {/* Rotation Handle */}
                <div 
                  className="absolute -top-12 left-1/2 -translate-x-1/2 pointer-events-auto z-10"
                  onMouseEnter={() => setShowHandles(true)}
                >
                  <div className="relative">
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0.5 h-8 bg-accent" />
                    <div 
                      className="relative w-5 h-5 bg-accent border-2 border-white rounded-full cursor-grab shadow-lg"
                      onMouseDown={handleRotateStart}
                      title="Drag to rotate"
                    />
                  </div>
                </div>
              </>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
};

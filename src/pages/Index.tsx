import { useState, useRef } from "react";
import { MockupViewer } from "@/components/MockupViewer";
import { ControlPanel } from "@/components/ControlPanel";
import { Package } from "lucide-react";
import { toast } from "sonner";
import html2canvas from "html2canvas";

const Index = () => {
  const [designImage, setDesignImage] = useState<string | null>(null);
  const [backDesignImage, setBackDesignImage] = useState<string | null>(null);
  const [backgroundColor, setBackgroundColor] = useState("#f8fafc");
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [backgroundBlur, setBackgroundBlur] = useState(0);
  const [backgroundFit, setBackgroundFit] = useState<"cover" | "contain" | "fill">("cover");
  const [pouchColor, setPouchColor] = useState("#e2e8f0");
  const [showFrontCard, setShowFrontCard] = useState(true);
  const [showBackCard, setShowBackCard] = useState(true);
  const mockupRef = useRef<HTMLDivElement>(null);

  const handleExport = async () => {
    if (!mockupRef.current) {
      toast.error("Unable to export mockup");
      return;
    }

    try {
      toast.loading("Exporting mockup...");
      
      // Store original styles to restore later
      const originalClasses = mockupRef.current.className;
      const originalStyle = mockupRef.current.style.cssText;
      
      // Temporarily remove border, shadow, and rounded corners for clean export
      mockupRef.current.className = mockupRef.current.className
        .replace(/rounded-\w+/g, '')
        .replace(/border\S*/g, '')
        .replace(/shadow-\w+/g, '');
      
      // If there's a background image with blur, we need to handle it specially
      // because html2canvas doesn't support CSS filter: blur()
      let originalFilter = '';
      
      if (backgroundImage && backgroundBlur > 0) {
        // Find the background element
        const bgElement = mockupRef.current.querySelector('[style*="blur"]') as HTMLDivElement;
        if (bgElement) {
          // Store original filter
          originalFilter = bgElement.style.filter;
          
          // Create a canvas to manually blur the image
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.src = backgroundImage;
          
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
          });
          
          const tempCanvas = document.createElement('canvas');
          const ctx = tempCanvas.getContext('2d')!;
          tempCanvas.width = img.width;
          tempCanvas.height = img.height;
          
          // Apply blur using canvas filter
          ctx.filter = `blur(${backgroundBlur}px)`;
          ctx.drawImage(img, 0, 0);
          
          // Replace the background image with the blurred canvas version
          const blurredDataUrl = tempCanvas.toDataURL();
          bgElement.style.backgroundImage = `url(${blurredDataUrl})`;
          bgElement.style.filter = 'none';
        }
      }
      
      const canvas = await html2canvas(mockupRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: backgroundImage ? null : backgroundColor,
        allowTaint: true,
        logging: false,
        foreignObjectRendering: true,
        width: mockupRef.current.offsetWidth,
        height: mockupRef.current.offsetHeight,
        windowWidth: mockupRef.current.offsetWidth,
        windowHeight: mockupRef.current.offsetHeight,
      });

      // Restore original styles
      mockupRef.current.className = originalClasses;
      mockupRef.current.style.cssText = originalStyle;
      
      // Restore original filter if we modified it
      if (originalFilter) {
        const bgElement = mockupRef.current.querySelector('[style*="background-image"]') as HTMLDivElement;
        if (bgElement) {
          bgElement.style.backgroundImage = `url(${backgroundImage})`;
          bgElement.style.filter = originalFilter;
        }
      }

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.download = `mockup-${Date.now()}.png`;
          link.href = url;
          link.click();
          URL.revokeObjectURL(url);
          toast.success("Mockup exported successfully!");
        }
      }, 'image/png', 1.0);
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export mockup");
    }
  };

  const handleClearAll = () => {
    setDesignImage(null);
    setBackDesignImage(null);
    setBackgroundColor("#f8fafc");
    setBackgroundImage(null);
    setBackgroundBlur(0);
    setBackgroundFit("cover");
    setPouchColor("#e2e8f0");
    setShowFrontCard(true);
    setShowBackCard(true);
    toast.success("All cleared!");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mesh Gradient Background */}
      <div 
        className="fixed inset-0 opacity-30 pointer-events-none"
        style={{ background: "var(--gradient-mesh)" }}
      />

      {/* Header */}
      <header className="relative border-b border-border backdrop-blur-sm bg-background/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-xl font-bold">Mockup Creator</h1>
              <p className="text-xs text-muted-foreground">Professional Product Mockups</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Viewer */}
          <div className="flex-1 w-full">
            <div ref={mockupRef} className="aspect-[4/3] lg:aspect-auto lg:h-[calc(100vh-12rem)] rounded-xl overflow-hidden border border-border shadow-2xl">
              <MockupViewer
                designImage={designImage}
                backDesignImage={backDesignImage}
                backgroundColor={backgroundColor}
                backgroundImage={backgroundImage}
                backgroundBlur={backgroundBlur}
                backgroundFit={backgroundFit}
                pouchColor={pouchColor}
                showFrontCard={showFrontCard}
                showBackCard={showBackCard}
              />
            </div>
          </div>

          {/* Controls */}
          <ControlPanel
            onImageUpload={setDesignImage}
            onBackImageUpload={setBackDesignImage}
            backgroundColor={backgroundColor}
            onBackgroundColorChange={setBackgroundColor}
            backgroundImage={backgroundImage}
            onBackgroundImageUpload={setBackgroundImage}
            backgroundBlur={backgroundBlur}
            onBackgroundBlurChange={setBackgroundBlur}
            backgroundFit={backgroundFit}
            onBackgroundFitChange={setBackgroundFit}
            pouchColor={pouchColor}
            onPouchColorChange={setPouchColor}
            onExport={handleExport}
            onClearAll={handleClearAll}
            showFrontCard={showFrontCard}
            showBackCard={showBackCard}
            onShowFrontCardChange={setShowFrontCard}
            onShowBackCardChange={setShowBackCard}
          />
        </div>
      </main>
    </div>
  );
};

export default Index;

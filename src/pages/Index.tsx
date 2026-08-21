import { useState, useRef } from "react";
import { MockupViewer } from "@/components/MockupViewer";
import { ControlPanel } from "@/components/ControlPanel";
import { Package } from "lucide-react";
import { toast } from "sonner";
import { toBlob } from "html-to-image";

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
    const node = mockupRef.current;
    if (!node) {
      toast.error("Unable to export mockup");
      return;
    }

    const loadingId = toast.loading("Exporting mockup...");

    try {
      // Hide interactive handles so they never appear in the export
      node.classList.add("is-exporting");

      const width = node.offsetWidth;
      const height = node.offsetHeight;

      // Keep the total pixel count sane so the blob never blows up in-browser
      const pixelRatio = width * height > 1_200_000 ? 2 : 3;

      const blob = await toBlob(node, {
        pixelRatio,
        width,
        height,
        cacheBust: true,
        backgroundColor: backgroundImage ? undefined : backgroundColor,
        style: {
          borderRadius: "0",
          border: "none",
          boxShadow: "none",
          width: `${width}px`,
          height: `${height}px`,
        },
      });

      node.classList.remove("is-exporting");

      if (!blob) throw new Error("Renderer returned no image data");

      const url = URL.createObjectURL(blob);
      const filename = `mockup-${Date.now()}.png`;

      // Anchor download (works in top-level windows)
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.rel = "noopener";
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Fallback for sandboxed preview iframes where downloads are blocked:
      // open the image in a new tab so it can be saved manually.
      try {
        if (window.top !== window.self) {
          window.open(url, "_blank", "noopener");
        }
      } catch {
        window.open(url, "_blank", "noopener");
      }

      setTimeout(() => URL.revokeObjectURL(url), 60_000);

      toast.dismiss(loadingId);
      toast.success("Mockup exported successfully!");
    } catch (error) {
      node.classList.remove("is-exporting");
      console.error("Export error:", error);
      toast.dismiss(loadingId);
      toast.error(
        `Failed to export mockup: ${error instanceof Error ? error.message : "unknown error"}`
      );
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

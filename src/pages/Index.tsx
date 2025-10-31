import { useState } from "react";
import { MockupViewer } from "@/components/MockupViewer";
import { ControlPanel } from "@/components/ControlPanel";
import { Package } from "lucide-react";
import { toast } from "sonner";

const Index = () => {
  const [designImage, setDesignImage] = useState<string | null>(null);
  const [backDesignImage, setBackDesignImage] = useState<string | null>(null);
  const [backgroundColor, setBackgroundColor] = useState("#f8fafc");
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [backgroundBlur, setBackgroundBlur] = useState(0);
  const [backgroundFit, setBackgroundFit] = useState<"cover" | "contain" | "fill">("cover");
  const [pouchColor, setPouchColor] = useState("#e2e8f0");

  const handleExport = () => {
    toast.success("Mockup exported! (Feature coming soon)");
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
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Package className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold">MockupPro</h1>
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
            <div className="aspect-[4/3] lg:aspect-auto lg:h-[calc(100vh-12rem)] rounded-xl overflow-hidden border border-border shadow-2xl">
              <MockupViewer
                designImage={designImage}
                backDesignImage={backDesignImage}
                backgroundColor={backgroundColor}
                backgroundImage={backgroundImage}
                backgroundBlur={backgroundBlur}
                backgroundFit={backgroundFit}
                pouchColor={pouchColor}
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
          />
        </div>
      </main>
    </div>
  );
};

export default Index;

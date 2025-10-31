import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Wand2, Sparkles, Eraser, Download } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const AIGenerator = () => {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [removalPrompt, setRemovalPrompt] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRemovalDialog, setShowRemovalDialog] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-image", {
        body: { prompt },
      });

      if (error) throw error;

      if (data?.image) {
        setGeneratedImages((prev) => [data.image, ...prev]);
        toast.success("Image generated successfully!");
      }
    } catch (error) {
      console.error("Error generating image:", error);
      toast.error("Failed to generate image. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpscale = async (imageUrl: string) => {
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke("edit-image", {
        body: { 
          imageUrl, 
          prompt: "Upscale this image to ultra high quality, enhance details, improve sharpness and clarity"
        },
      });

      if (error) throw error;

      if (data?.image) {
        setGeneratedImages((prev) => [data.image, ...prev]);
        toast.success("Image upscaled successfully!");
      }
    } catch (error) {
      console.error("Error upscaling image:", error);
      toast.error("Failed to upscale image. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSmartRemove = async () => {
    if (!selectedImage || !removalPrompt.trim()) {
      toast.error("Please enter what you want to remove");
      return;
    }

    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke("edit-image", {
        body: { 
          imageUrl: selectedImage, 
          prompt: `Remove ${removalPrompt} from this image, fill in the background naturally and seamlessly`
        },
      });

      if (error) throw error;

      if (data?.image) {
        setGeneratedImages((prev) => [data.image, ...prev]);
        toast.success("Image edited successfully!");
        setShowRemovalDialog(false);
        setRemovalPrompt("");
        setSelectedImage(null);
      }
    } catch (error) {
      console.error("Error editing image:", error);
      toast.error("Failed to edit image. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = async (imageUrl: string, index: number) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `generated-image-${index + 1}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Image downloaded!");
    } catch (error) {
      console.error("Error downloading image:", error);
      toast.error("Failed to download image");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mesh Gradient Background */}
      <div 
        className="fixed inset-0 opacity-30 pointer-events-none"
        style={{ background: "var(--gradient-mesh)" }}
      />

      {/* Main Content */}
      <main className="relative container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">AI Image Generator</h1>
            <p className="text-muted-foreground">
              Create stunning images with AI - powered by Lovable AI
            </p>
          </div>

          {/* Generator Form */}
          <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="prompt">Describe your image</Label>
              <Input
                id="prompt"
                placeholder="A futuristic city at sunset with flying cars..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !isGenerating && handleGenerate()}
                className="h-12"
              />
            </div>
            <Button 
              onClick={handleGenerate} 
              disabled={isGenerating}
              className="w-full h-12"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-5 w-5" />
                  Generate Image
                </>
              )}
            </Button>
          </div>

          {/* Generated Images Grid */}
          {generatedImages.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Generated Images</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {generatedImages.map((image, index) => (
                  <div
                    key={index}
                    className="relative group rounded-xl overflow-hidden border border-border bg-card/30 backdrop-blur-sm"
                  >
                    <img
                      src={image}
                      alt={`Generated ${index + 1}`}
                      className="w-full h-auto"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleUpscale(image)}
                          disabled={isProcessing}
                          size="sm"
                          variant="secondary"
                          className="gap-2"
                        >
                          {isProcessing ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Sparkles className="h-4 w-4" />
                          )}
                          Upscale
                        </Button>
                        <Button
                          onClick={() => {
                            setSelectedImage(image);
                            setShowRemovalDialog(true);
                          }}
                          disabled={isProcessing}
                          size="sm"
                          variant="secondary"
                          className="gap-2"
                        >
                          <Eraser className="h-4 w-4" />
                          Remove
                        </Button>
                        <Button
                          onClick={() => handleDownload(image, index)}
                          size="sm"
                          variant="secondary"
                          className="gap-2"
                        >
                          <Download className="h-4 w-4" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Smart Removal Dialog */}
      <Dialog open={showRemovalDialog} onOpenChange={setShowRemovalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Smart Remove</DialogTitle>
            <DialogDescription>
              Describe what you want to remove from the image
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="removal">What to remove</Label>
              <Input
                id="removal"
                placeholder="e.g., the person, the watermark, the background object..."
                value={removalPrompt}
                onChange={(e) => setRemovalPrompt(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !isProcessing && handleSmartRemove()}
              />
            </div>
            <Button 
              onClick={handleSmartRemove} 
              disabled={isProcessing || !removalPrompt.trim()}
              className="w-full"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Eraser className="mr-2 h-4 w-4" />
                  Remove
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AIGenerator;

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Wand2, Sparkles, Eraser, Download, Type, Upload } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

const AIGenerator = () => {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRemovalMode, setIsRemovalMode] = useState(false);
  const [isTextMode, setIsTextMode] = useState(false);
  const [textToAdd, setTextToAdd] = useState("");
  const [canvasRef, setCanvasRef] = useState<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [circledArea, setCircledArea] = useState<{x: number, y: number}[]>([]);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isRedesigning, setIsRedesigning] = useState(false);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    setIsGenerating(true);
    try {
      // If there's a reference image, use edit-image, otherwise use generate-image
      if (referenceImage) {
        const promises = Array.from({ length: 4 }, () =>
          supabase.functions.invoke("edit-image", {
            body: { 
              imageUrl: referenceImage, 
              prompt: `Based on this reference image: ${prompt}`
            },
          })
        );

        const results = await Promise.all(promises);
        
        const newImages: string[] = [];
        results.forEach(({ data, error }) => {
          if (error) {
            console.error("Error generating image:", error);
          } else if (data?.image) {
            newImages.push(data.image);
          }
        });

        if (newImages.length > 0) {
          setGeneratedImages((prev) => [...newImages, ...prev]);
          toast.success(`${newImages.length} variations generated successfully!`);
        } else {
          throw new Error("No images were generated");
        }
      } else {
        // Generate 4 variations in parallel
        const promises = Array.from({ length: 4 }, () =>
          supabase.functions.invoke("generate-image", {
            body: { prompt },
          })
        );

        const results = await Promise.all(promises);
        
        const newImages: string[] = [];
        results.forEach(({ data, error }) => {
          if (error) {
            console.error("Error generating image:", error);
          } else if (data?.image) {
            newImages.push(data.image);
          }
        });

        if (newImages.length > 0) {
          setGeneratedImages((prev) => [...newImages, ...prev]);
          toast.success(`${newImages.length} image variations generated successfully!`);
        } else {
          throw new Error("No images were generated");
        }
      }
    } catch (error) {
      console.error("Error generating images:", error);
      toast.error("Failed to generate images. Please try again.");
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
        setSelectedImageIndex(null);
      }
    } catch (error) {
      console.error("Error upscaling image:", error);
      toast.error("Failed to upscale image. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSmartRemoveClick = () => {
    setIsRemovalMode(true);
  };

  const handleAddTextClick = () => {
    setIsTextMode(true);
  };

  const handleAddText = async () => {
    if (selectedImageIndex === null || !textToAdd.trim()) {
      toast.error("Please enter text to add");
      return;
    }

    setIsProcessing(true);
    try {
      const selectedImage = generatedImages[selectedImageIndex];

      const { data, error } = await supabase.functions.invoke("edit-image", {
        body: { 
          imageUrl: selectedImage, 
          prompt: `Add the text "${textToAdd}" to this image with a beautiful typography style that perfectly matches the image aesthetic, color scheme, and mood. Make the text prominent, readable, and professionally designed.`
        },
      });

      if (error) throw error;

      if (data?.image) {
        setGeneratedImages((prev) => [data.image, ...prev]);
        toast.success("Text added successfully!");
        setIsTextMode(false);
        setTextToAdd("");
        setSelectedImageIndex(null);
      }
    } catch (error) {
      console.error("Error adding text:", error);
      toast.error("Failed to add text. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSmartRemove = async () => {
    if (selectedImageIndex === null || circledArea.length === 0) {
      toast.error("Please circle the area you want to remove");
      return;
    }

    setIsProcessing(true);
    try {
      const selectedImage = generatedImages[selectedImageIndex];
      
      // Create a description of the circled area based on its position
      const canvasWidth = canvasRef?.width || 1024;
      const canvasHeight = canvasRef?.height || 1024;
      const avgX = circledArea.reduce((sum, p) => sum + p.x, 0) / circledArea.length;
      const avgY = circledArea.reduce((sum, p) => sum + p.y, 0) / circledArea.length;
      
      let position = "";
      if (avgY < canvasHeight / 3) position += "top ";
      else if (avgY > (2 * canvasHeight) / 3) position += "bottom ";
      else position += "middle ";
      
      if (avgX < canvasWidth / 3) position += "left";
      else if (avgX > (2 * canvasWidth) / 3) position += "right";
      else position += "center";

      const { data, error } = await supabase.functions.invoke("edit-image", {
        body: { 
          imageUrl: selectedImage, 
          prompt: `Remove the object in the ${position} area of this image, fill in the background naturally and seamlessly`
        },
      });

      if (error) throw error;

      if (data?.image) {
        setGeneratedImages((prev) => [data.image, ...prev]);
        toast.success("Image edited successfully!");
        setIsRemovalMode(false);
        setCircledArea([]);
        setSelectedImageIndex(null);
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
      setSelectedImageIndex(null);
    } catch (error) {
      console.error("Error downloading image:", error);
      toast.error("Failed to download image");
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef) return;
    setIsDrawing(true);
    const rect = canvasRef.getBoundingClientRect();
    const scaleX = canvasRef.width / rect.width;
    const scaleY = canvasRef.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    setCircledArea([{x, y}]);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef) return;
    const rect = canvasRef.getBoundingClientRect();
    const scaleX = canvasRef.width / rect.width;
    const scaleY = canvasRef.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    const ctx = canvasRef.getContext('2d');
    if (ctx && circledArea.length > 0) {
      const lastPoint = circledArea[circledArea.length - 1];
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(lastPoint.x, lastPoint.y);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
    
    setCircledArea(prev => [...prev, {x, y}]);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    if (!canvasRef) return;
    const ctx = canvasRef.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvasRef.width, canvasRef.height);
    }
    setCircledArea([]);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleReferenceImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const imageData = reader.result as string;
      setReferenceImage(imageData);
      
      // Automatically analyze the image and fill the prompt
      try {
        toast.info("Analyzing image...");
        const { data, error } = await supabase.functions.invoke("analyze-image", {
          body: { imageUrl: imageData },
        });

        if (error) throw error;

        if (data?.description) {
          setPrompt(data.description);
          toast.success("Image analyzed! Prompt generated.");
        }
      } catch (error) {
        console.error("Error analyzing image:", error);
        toast.error("Failed to analyze image. You can still enter a prompt manually.");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRedesign = async () => {
    if (!uploadedImage) {
      toast.error("Please upload an image first");
      return;
    }

    setIsRedesigning(true);
    try {
      // Generate 4 redesign variations in parallel
      const promises = Array.from({ length: 4 }, () =>
        supabase.functions.invoke("edit-image", {
          body: { 
            imageUrl: uploadedImage, 
            prompt: "Completely redesign and reimagine this image with a creative, artistic interpretation. Transform it into a stunning piece of art with enhanced colors, composition, and style while maintaining the core subject matter."
          },
        })
      );

      const results = await Promise.all(promises);
      
      const newImages: string[] = [];
      results.forEach(({ data, error }) => {
        if (error) {
          console.error("Error redesigning image:", error);
        } else if (data?.image) {
          newImages.push(data.image);
        }
      });

      if (newImages.length > 0) {
        setGeneratedImages((prev) => [...newImages, ...prev]);
        toast.success(`${newImages.length} redesigned variations created successfully!`);
        setUploadedImage(null);
      } else {
        throw new Error("No images were generated");
      }
    } catch (error) {
      console.error("Error redesigning image:", error);
      toast.error("Failed to redesign image. Please try again.");
    } finally {
      setIsRedesigning(false);
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

          {/* Tabbed Interface */}
          <Tabs defaultValue="generate" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="generate" className="gap-2">
                <Wand2 className="h-4 w-4" />
                Generate
              </TabsTrigger>
              <TabsTrigger value="redesign" className="gap-2">
                <Upload className="h-4 w-4" />
                Redesign
              </TabsTrigger>
            </TabsList>

            <TabsContent value="generate">
              <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reference-upload">Upload reference image (optional)</Label>
                  <Input
                    id="reference-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleReferenceImageUpload}
                    className="h-12"
                  />
                </div>
                {referenceImage && (
                  <div className="relative">
                    <img
                      src={referenceImage}
                      alt="Reference preview"
                      className="w-full h-48 object-cover rounded-lg border border-border"
                    />
                    <Button
                      size="sm"
                      variant="destructive"
                      className="absolute top-2 right-2"
                      onClick={() => setReferenceImage(null)}
                    >
                      Remove
                    </Button>
                  </div>
                )}
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
                      Generate Images
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="redesign">
              <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="image-upload">Upload image to redesign</Label>
                  <Input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="h-12"
                  />
                </div>
                {uploadedImage && (
                  <div className="space-y-4">
                    <img
                      src={uploadedImage}
                      alt="Uploaded preview"
                      className="w-full h-auto rounded-lg border border-border"
                    />
                    <Button 
                      onClick={handleRedesign} 
                      disabled={isRedesigning}
                      className="w-full h-12"
                      size="lg"
                    >
                      {isRedesigning ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Redesigning...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-5 w-5" />
                          Redesign with AI
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {/* Generated Images Grid */}
          {generatedImages.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Generated Images</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {generatedImages.map((image, index) => (
                  <div
                    key={index}
                    className="relative rounded-xl overflow-hidden border border-border bg-card/30 backdrop-blur-sm cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <img
                      src={image}
                      alt={`Generated ${index + 1}`}
                      className="w-full h-auto"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Image Preview Dialog */}
      <Dialog open={selectedImageIndex !== null} onOpenChange={() => {
        setSelectedImageIndex(null);
        setIsRemovalMode(false);
        setIsTextMode(false);
        setTextToAdd("");
        setCircledArea([]);
      }}>
        <DialogContent className="max-w-7xl max-h-[95vh] p-0 overflow-hidden">
          <VisuallyHidden>
            <DialogTitle>Image Preview</DialogTitle>
            <DialogDescription>View and edit your generated image</DialogDescription>
          </VisuallyHidden>
          {selectedImageIndex !== null && (
            <div className="relative">
              {isRemovalMode ? (
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Circle the area to remove</h3>
                    <p className="text-sm text-muted-foreground">Draw a circle around the object you want to remove</p>
                  </div>
                  <canvas
                    ref={setCanvasRef}
                    width={1024}
                    height={1024}
                    className="w-full border border-border rounded-lg cursor-crosshair"
                    style={{
                      backgroundImage: `url(${generatedImages[selectedImageIndex]})`,
                      backgroundSize: 'contain',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat'
                    }}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                  />
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => {
                        setIsRemovalMode(false);
                        setCircledArea([]);
                      }}
                      variant="outline"
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={clearCanvas}
                      variant="outline"
                      className="flex-1"
                    >
                      Clear
                    </Button>
                    <Button 
                      onClick={handleSmartRemove} 
                      disabled={isProcessing || circledArea.length === 0}
                      className="flex-1"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Eraser className="mr-2 h-4 w-4" />
                          Remove Circled Area
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ) : isTextMode ? (
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Add text to image</h3>
                    <p className="text-sm text-muted-foreground">Enter the text you want to add - AI will style it perfectly for your image</p>
                  </div>
                  <img
                    src={generatedImages[selectedImageIndex]}
                    alt={`Preview ${selectedImageIndex + 1}`}
                    className="w-full h-auto rounded-lg border border-border"
                  />
                  <div className="space-y-2">
                    <Label htmlFor="text-input">Text to add</Label>
                    <Input
                      id="text-input"
                      placeholder="Enter your text..."
                      value={textToAdd}
                      onChange={(e) => setTextToAdd(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !isProcessing && handleAddText()}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => {
                        setIsTextMode(false);
                        setTextToAdd("");
                      }}
                      variant="outline"
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleAddText} 
                      disabled={isProcessing || !textToAdd.trim()}
                      className="flex-1"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Adding Text...
                        </>
                      ) : (
                        <>
                          <Type className="mr-2 h-4 w-4" />
                          Add Text
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="relative flex flex-col h-full">
                  <div className="flex-1 flex items-center justify-center p-4 bg-black/80">
                    <img
                      src={generatedImages[selectedImageIndex]}
                      alt={`Generated ${selectedImageIndex + 1}`}
                      className="max-w-full max-h-[80vh] w-auto h-auto object-contain rounded-lg"
                    />
                  </div>
                  <div className="flex gap-2 p-4 bg-black/90 border-t border-border justify-center flex-wrap">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpscale(generatedImages[selectedImageIndex]);
                      }}
                      disabled={isProcessing}
                      size="lg"
                      className="gap-2"
                    >
                      {isProcessing ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Sparkles className="h-5 w-5" />
                      )}
                      Upscale
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSmartRemoveClick();
                      }}
                      disabled={isProcessing}
                      size="lg"
                      className="gap-2"
                    >
                      <Eraser className="h-5 w-5" />
                      Smart Remove
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddTextClick();
                      }}
                      disabled={isProcessing}
                      size="lg"
                      className="gap-2"
                    >
                      <Type className="h-5 w-5" />
                      Add Text
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(generatedImages[selectedImageIndex], selectedImageIndex);
                      }}
                      size="lg"
                      className="gap-2"
                    >
                      <Download className="h-5 w-5" />
                      Download
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AIGenerator;

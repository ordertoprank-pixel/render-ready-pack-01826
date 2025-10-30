import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, Download, Palette } from "lucide-react";
import { useRef } from "react";
import { toast } from "sonner";

interface ControlPanelProps {
  onImageUpload: (imageUrl: string) => void;
  backgroundColor: string;
  onBackgroundColorChange: (color: string) => void;
  pouchColor: string;
  onPouchColorChange: (color: string) => void;
  onExport: () => void;
}

export const ControlPanel = ({
  onImageUpload,
  backgroundColor,
  onBackgroundColorChange,
  pouchColor,
  onPouchColorChange,
  onExport,
}: ControlPanelProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        onImageUpload(result);
        toast.success("Design uploaded successfully!");
      };
      reader.readAsDataURL(file);
    }
  };

  const backgroundColors = [
    { name: "Light", value: "#f8fafc" },
    { name: "Dark", value: "#1e293b" },
    { name: "Blue", value: "#dbeafe" },
    { name: "Green", value: "#dcfce7" },
    { name: "Purple", value: "#f3e8ff" },
  ];

  const pouchColors = [
    { name: "Silver", value: "#e2e8f0" },
    { name: "White", value: "#ffffff" },
    { name: "Black", value: "#1e293b" },
    { name: "Red", value: "#ef4444" },
    { name: "Blue", value: "#3b82f6" },
    { name: "Gold", value: "#fbbf24" },
  ];

  return (
    <div className="w-full lg:w-80 bg-card border border-border rounded-xl p-6 space-y-6 backdrop-blur-sm">
      <div>
        <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Mockup Controls
        </h2>
        <p className="text-sm text-muted-foreground">
          Customize your product mockup
        </p>
      </div>

      {/* Upload Design */}
      <div className="space-y-3">
        <Label className="text-base font-semibold flex items-center gap-2">
          <Upload className="w-4 h-4" />
          Upload Design
        </Label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <Button
          onClick={() => fileInputRef.current?.click()}
          variant="outline"
          className="w-full"
        >
          Choose Image
        </Button>
        <p className="text-xs text-muted-foreground">
          PNG, JPG up to 5MB
        </p>
      </div>

      {/* Background Color */}
      <div className="space-y-3">
        <Label className="text-base font-semibold flex items-center gap-2">
          <Palette className="w-4 h-4" />
          Background
        </Label>
        <div className="grid grid-cols-5 gap-2">
          {backgroundColors.map((color) => (
            <button
              key={color.name}
              onClick={() => onBackgroundColorChange(color.value)}
              className="aspect-square rounded-lg border-2 transition-all hover:scale-110"
              style={{
                backgroundColor: color.value,
                borderColor: backgroundColor === color.value ? "hsl(var(--primary))" : "transparent",
              }}
              title={color.name}
            />
          ))}
        </div>
      </div>

      {/* Pouch Color */}
      <div className="space-y-3">
        <Label className="text-base font-semibold flex items-center gap-2">
          <Palette className="w-4 h-4" />
          Pouch Material
        </Label>
        <div className="grid grid-cols-3 gap-2">
          {pouchColors.map((color) => (
            <button
              key={color.name}
              onClick={() => onPouchColorChange(color.value)}
              className="aspect-square rounded-lg border-2 transition-all hover:scale-110 flex items-center justify-center text-xs font-medium"
              style={{
                backgroundColor: color.value,
                borderColor: pouchColor === color.value ? "hsl(var(--primary))" : "hsl(var(--border))",
                color: color.value === "#ffffff" || color.value === "#e2e8f0" ? "#1e293b" : "#ffffff",
              }}
            >
              {color.name}
            </button>
          ))}
        </div>
      </div>

      {/* Export */}
      <Button
        onClick={onExport}
        className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
      >
        <Download className="w-4 h-4 mr-2" />
        Export Mockup
      </Button>
    </div>
  );
};

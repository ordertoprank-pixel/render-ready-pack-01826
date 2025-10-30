import { CardFrame } from "./CardFrame";

interface MockupViewerProps {
  designImage: string | null;
  backgroundColor: string;
  pouchColor: string;
}

export const MockupViewer = ({ designImage, backgroundColor, pouchColor }: MockupViewerProps) => {
  return (
    <div 
      className="w-full h-full rounded-xl overflow-hidden flex items-center justify-center relative" 
      style={{ background: backgroundColor }}
    >
      {/* Container for the two overlapping cards */}
      <div className="relative w-full max-w-3xl aspect-square px-12 py-8">
        {/* Back card - positioned bottom right, slightly rotated */}
        <CardFrame 
          designImage={designImage}
          className="w-[52%] aspect-[3/4] bottom-[15%] right-[8%]"
          rotation={12}
        />
        
        {/* Front card - positioned top left, slightly rotated opposite */}
        <CardFrame 
          designImage={designImage}
          className="w-[52%] aspect-[3/4] top-[2%] left-[22%]"
          rotation={-6}
        />
      </div>
    </div>
  );
};

import { SketchyCard } from "@/components/ui/sketchy-card";
import { HandGraduationCap } from "@/components/icons/hand-drawn";

export default function AdminPlaceholderPage({ params }: { params: { slug: string[] } }) {
  const pageName = params.slug.join("/").replace(/-/g, " ");

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh]">
      <SketchyCard stroke="#9B6BC6" fill="transparent" className="p-12 max-w-lg w-full text-center flex flex-col items-center">
        <HandGraduationCap className="w-20 h-20 text-secondary mb-6 organic-tilt-2 opacity-50" />
        <h2 className="font-display font-black text-4xl uppercase mb-4 organic-tilt-1">
          {pageName}
        </h2>
        <p className="font-hand text-xl text-foreground/60 organic-tilt-4">
          This module is currently under construction. Check back soon.
        </p>
      </SketchyCard>
    </div>
  );
}

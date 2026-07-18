import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function NutritionCarousel({ items }: { items: any[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!items || items.length === 0) return null;

  const currentItem = items[currentIndex];

  const next = () => setCurrentIndex((prev) => (prev + 1) % items.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [items.length]);


  return (
    <div className="relative w-full h-[95vh] min-h-[700px] bg-[#FAFAF7] overflow-hidden flex items-center justify-center font-display">
      {/* Controls */}
      <button onClick={prev} className="absolute left-2 sm:left-10 z-30 p-2 sm:p-3 rounded-full bg-white text-[#0A472E] shadow-md hover:scale-105 transition-transform border border-[#d0ddd4]">
        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>
      
      <button onClick={next} className="absolute right-2 sm:right-10 z-30 p-2 sm:p-3 rounded-full bg-white text-[#0A472E] shadow-md hover:scale-105 transition-transform border border-[#d0ddd4]">
        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      {/* Main Display */}
      <div className="relative w-full max-w-[1200px] h-full flex items-center justify-center">
        
        {/* Title positioned at Top Center */}
        <div className="absolute top-[4%] sm:top-[8%] left-1/2 -translate-x-1/2 text-center z-20 w-full px-4">
            <h2 className="text-2xl sm:text-5xl text-[#0A472E]">{currentItem.name}</h2>
            <p className="text-[#5a7060] mt-1 sm:mt-3 font-light tracking-wide text-[10px] sm:text-base uppercase">{currentItem.dressing && `Dressing: ${currentItem.dressing}`}</p>
        </div>

        {/* Center Image */}
        <div className="absolute top-[48%] sm:top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-[200px] h-[200px] sm:w-[400px] sm:h-[400px] rounded-full flex items-center justify-center">
           <img 
              key={currentItem.id}
              src={currentItem.imageUrl} 
              alt={currentItem.name}
              className="w-full h-full object-cover rounded-full drop-shadow-2xl hover:scale-105 transition-transform duration-700"
           />
        </div>

        {/* Pointers mapping using SVGs */}
        {/* We use an absolute SVG canvas covering the entire container */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 block">
            {/* Top Left Line to center */}
            <line x1="20%" y1="35%" x2="42%" y2="42%" stroke="#0A472E" strokeWidth="2" strokeDasharray="6 6" />
            {/* Top Right Line to center */}
            <line x1="80%" y1="35%" x2="58%" y2="42%" stroke="#0A472E" strokeWidth="2" strokeDasharray="6 6" />
            {/* Bottom Left Line to center */}
            <line x1="20%" y1="65%" x2="42%" y2="58%" stroke="#0A472E" strokeWidth="2" strokeDasharray="6 6" />
            {/* Bottom Right Line to center */}
            <line x1="80%" y1="65%" x2="58%" y2="58%" stroke="#0A472E" strokeWidth="2" strokeDasharray="6 6" />
        </svg>

        {/* Stats text cards */}
        {/* Top Left: Protein */}
        <div className="absolute top-[20%] sm:top-[30%] left-[4%] sm:left-[8%] text-left sm:text-right bg-white p-3 sm:p-5 rounded-2xl shadow-lg border-2 border-[#C9D909] z-20 animate-in fade-in zoom-in duration-500 min-w-[120px] sm:min-w-[180px]">
           <p className="text-[9px] sm:text-xs uppercase tracking-widest text-[#5a7060] mb-1">Protein</p>
           <p className="text-xl sm:text-4xl text-[#0A472E]">{currentItem.protein || '--'}</p>
        </div>
        
        {/* Top Right: Calories */}
        <div className="absolute top-[20%] sm:top-[30%] right-[4%] sm:right-[8%] text-right sm:text-left bg-white p-3 sm:p-5 rounded-2xl shadow-lg border-2 border-[#C9D909] z-20 animate-in fade-in zoom-in duration-500 min-w-[120px] sm:min-w-[180px]">
           <p className="text-[9px] sm:text-xs uppercase tracking-widest text-[#5a7060] mb-1">Calories</p>
           <p className="text-xl sm:text-4xl text-[#0A472E]">{currentItem.calories || '--'}</p>
        </div>
        
        {/* Bottom Left: Carbs / Fat */}
        <div className="absolute bottom-[10%] sm:bottom-[25%] left-[4%] sm:left-[8%] text-left sm:text-right bg-white p-3 sm:p-5 rounded-2xl shadow-lg border-2 border-[#C9D909] z-20 animate-in fade-in zoom-in duration-500 min-w-[120px] sm:min-w-[180px]">
           <p className="text-[9px] sm:text-xs uppercase tracking-widest text-[#5a7060] mb-1">Carbs <span className="text-[#C9D909] font-bold">/</span> Fat</p>
           <p className="text-lg sm:text-3xl text-[#0A472E]">{currentItem.carbs || '--'} <span className="text-[#C9D909] text-base sm:text-xl">/</span> {currentItem.fat || '--'}</p>
        </div>

        {/* Bottom Right: Fiber & Ingredients */}
        <div className="absolute bottom-[10%] sm:bottom-[25%] right-[4%] sm:right-[8%] text-right sm:text-left bg-white p-3 sm:p-5 rounded-2xl shadow-lg border-2 border-[#C9D909] z-20 animate-in fade-in zoom-in duration-500 w-[140px] sm:w-[240px]">
           <p className="text-[9px] sm:text-xs uppercase tracking-widest text-[#5a7060] mb-1">Fiber & Elements</p>
           <p className="text-base sm:text-2xl text-[#0A472E] mb-1 sm:mb-2">{currentItem.fiber || '--'}</p>
           <p className="text-[9px] sm:text-xs text-[#5a7060] leading-snug capitalize line-clamp-2 sm:line-clamp-3">
               {currentItem.ingredients?.join(", ") || '--'}
           </p>
        </div>

      </div>
    </div>
  );
}

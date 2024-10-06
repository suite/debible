import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import React from 'react';

interface LoreItem {
  "ID [ignore]": string;
  "Text (main text for page)": string;
  "Content link (standardized)": string;
  "Original post (link)": string;
  Date: string;
}

function App() {
  const [loreItems, setLoreItems] = useState<LoreItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Papa.parse('/bookofdegod.csv', {
      download: true,
      header: true,
      complete: (results) => {
        const items = results.data as LoreItem[];
        setLoreItems(items);
        preloadImages(items);
        setIsLoading(false);
      },
    });
  }, []);

  const preloadImages = (items: LoreItem[]) => {
    items.forEach((item) => {
      const img = new Image();
      img.src = item["Content link (standardized)"];
      img.onload = () => {
        setLoadedImages((prev) => new Set(prev).add(item["ID [ignore]"]));
      };
    });
  };

  const formatText = (text: string) => {
    return text.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index < text.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  const currentItem = loreItems[currentIndex];

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : loreItems.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex < loreItems.length - 1 ? prevIndex + 1 : 0));
  };

  const handleRandom = () => {
    const randomIndex = Math.floor(Math.random() * loreItems.length);
    setCurrentIndex(randomIndex);
  };

  return (
    <div className="min-h-screen bg-white text-black flex flex-col">
      {!isLoading && loreItems.length > 0 && (
        <>
          <div className="flex-grow max-w-4xl mx-auto w-full px-4">
            {/* Navigation */}
            <nav className="flex justify-center items-center p-4">
              <button onClick={handlePrev} className="text-[#2600FF] border border-[#2600FF] px-4 py-2 h-10">Prev</button>
              <button onClick={handleRandom} className="bg-[#2600FF] text-white px-4 py-2 mx-2 h-10">click or pasta dies</button>
              <button onClick={handleNext} className="text-[#2600FF] border border-[#2600FF] px-4 py-2 h-10">Next</button>
            </nav>

            {/* Horizontal line */}
            <hr className="border-t border-[#E4E4E4]" />
    
            {/* Date info */}
            <div className="text-[#A8A8A8] text-sm py-4 flex justify-between items-center">
              <span>{currentIndex + 1} of {loreItems.length}</span>
              <span>{currentItem.Date}</span>
            </div>

            {/* Image */}
            <div className="mb-4 flex justify-center">
              {loadedImages.has(currentItem["ID [ignore]"]) && (
                <img 
                  src={currentItem["Content link (standardized)"]} 
                  alt={currentItem["ID [ignore]"]} 
                  className="max-w-full max-h-[70vh] object-contain"
                />
              )}
            </div>

            {/* Caption */}
            <p className="font-['EB_Garamond'] font-semibold text-[30px] leading-[36px] tracking-[-0.05em] mb-4">
              {formatText(currentItem["Text (main text for page)"])}
            </p>

            {/* View on X button */}
            <div className="mb-8">
              <a href={currentItem["Original post (link)"]} target="_blank" rel="noopener noreferrer" className="bg-white text-[#2600FF] border border-[#2600FF] rounded-full px-4 py-1 text-sm inline-block">
                View on X
              </a>
            </div>
          </div>

          {/* Footer section */}
          <div className="mt-auto pb-4">
            {/* Created by */}
            <footer className="text-[#A8A8A8] text-sm text-center p-2">
              Created by <u><a href="https://twitter.com/capsjpeg" target="_blank" rel="noopener noreferrer">Caps</a></u>, <u><a href="https://twitter.com/misterholana" target="_blank" rel="noopener noreferrer">h_</a></u>, and <u><a href="https://twitter.com/0x_saddy" target="_blank" rel="noopener noreferrer">Saddy</a></u>.
            </footer>
          </div>
        </>
      )}
    </div>
  );
}

export default App;

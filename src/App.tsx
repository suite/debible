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
  const [isLoading, setIsLoading] = useState(true);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [showLoader, setShowLoader] = useState(false);
  const [imageAspectRatio, setImageAspectRatio] = useState(16 / 9); // Default aspect ratio

  useEffect(() => {
    Papa.parse('/bookofdegod.csv', {
      download: true,
      header: true,
      complete: (results) => {
        const items = results.data as LoreItem[];
        setLoreItems(items);
        setIsLoading(false);
      },
    });
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isImageLoading) {
      timer = setTimeout(() => {
        setShowLoader(true);
      }, 100);
    } else {
      setShowLoader(false);
    }
    return () => clearTimeout(timer);
  }, [isImageLoading]);

  const formatText = (text: string) => {
    const linkRegex = /\[([^\]]+)\]\s+\((https?:\/\/[^\s\)]+)\)/g;
    
    return text.split('\n').map((line, lineIndex) => {
      const parts = [];
      let lastIndex = 0;
      let match;

      while ((match = linkRegex.exec(line)) !== null) {
        if (lastIndex < match.index) {
          parts.push(line.slice(lastIndex, match.index));
        }
        const linkText = match[1].startsWith('@') ? match[1] : match[2];
        parts.push(
          <a
            key={match.index}
            href={match[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#1E30D8]"
          >
            {linkText}
          </a>
        );
        lastIndex = match.index + match[0].length;
      }

      if (lastIndex < line.length) {
        parts.push(line.slice(lastIndex));
      }

      return (
        <React.Fragment key={lineIndex}>
          {parts}
          {lineIndex < text.split('\n').length - 1 && <br />}
        </React.Fragment>
      );
    });
  };

  const handleImageLoad = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const img = event.currentTarget;
    setImageAspectRatio(img.naturalWidth / img.naturalHeight);
    setIsImageLoading(false);
  };

  const changeItem = (newIndex: number) => {
    setIsImageLoading(true);
    setCurrentIndex(newIndex);
  };

  const handlePrev = () => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : loreItems.length - 1;
    changeItem(newIndex);
  };

  const handleNext = () => {
    const newIndex = currentIndex < loreItems.length - 1 ? currentIndex + 1 : 0;
    changeItem(newIndex);
  };

  const handleRandom = () => {
    const randomIndex = Math.floor(Math.random() * loreItems.length);
    changeItem(randomIndex);
  };

  const currentItem = loreItems[currentIndex];

  return (
    <div className="min-h-screen bg-white text-black flex flex-col">
      {!isLoading && loreItems.length > 0 && (
        <>
          <div className="flex-grow max-w-4xl mx-auto w-full px-4">
            {/* Navigation */}
            <nav className="flex justify-center items-center p-4">  
              <button onClick={handlePrev} className="text-[#2600FF] border border-[#2600FF] px-4 py-2 h-10">Prev</button>
              <button onClick={handleRandom} className="bg-[#2600FF] text-white px-4 py-2 mx-2 h-10">random</button>
              <button onClick={handleNext} className="text-[#2600FF] border border-[#2600FF] px-4 py-2 h-10">Next</button>
            </nav>

            {/* Horizontal line */}
            <hr className="border-t border-[#E4E4E4]" />
    
            {/* Date info */}
            <div className="text-[#A8A8A8] text-sm py-4 flex justify-between items-center">
              <span>{currentIndex + 1} of {loreItems.length}</span>
              <span>{currentItem.Date}</span>
            </div>

            {/* Image container with placeholder */}
            <div className="mb-4 flex justify-center">
              <div 
                style={{ paddingBottom: `${(1 / imageAspectRatio) * 100}%` }}
                className="w-full relative"
              >
                {showLoader && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#2600FF]"></div>
                  </div>
                )}
                <img 
                  src={currentItem["Content link (standardized)"]} 
                  alt={currentItem["ID [ignore]"]} 
                  className={`absolute inset-0 w-full h-full object-contain ${isImageLoading ? 'opacity-50' : 'opacity-100'}`}
                  onLoad={handleImageLoad}
                />
              </div>
            </div>

            {/* Caption */}
            <p className="font-['EB_Garamond'] font-semibold text-[30px] leading-[36px] tracking-[-0.05em] mb-4">
              {formatText(currentItem["Text (main text for page)"])}
            </p>

            {/* View on X button */}
            <div className="mb-8">
              <a href={currentItem["Original post (link)"]} target="_blank" rel="noopener noreferrer" className="bg-white text-[#2600FF] border border-[#2600FF] rounded-full px-4 py-2 text-sm inline-flex items-center">
                View on <svg width="16" height="16" viewBox="0 0 300 300.251" version="1.1" xmlns="http://www.w3.org/2000/svg" className="ml-2">
                  <path fill="#2600FF" d="M178.57 127.15 290.27 0h-26.46l-97.03 110.38L89.34 0H0l117.13 166.93L0 300.25h26.46l102.4-116.59 81.8 116.59h89.34M36.01 19.54H76.66l187.13 262.13h-40.66"/>
                </svg>
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

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
  const [hitCount, setHitCount] = useState<number>(0);

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

    // Fetch hit count
    fetch('/hit_counter.php')
      .then(response => response.json())
      .then(data => setHitCount(data.hits))
      .catch(error => console.error('Error fetching hit count:', error));
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
    const strikethroughWords = ['Nippies', 'Duppies'];
    
    return text.split('\n').map((line, lineIndex) => {
      const parts = [];
      let lastIndex = 0;
      let match;

      while ((match = linkRegex.exec(line)) !== null) {
        if (lastIndex < match.index) {
          parts.push(applyStrikethrough(line.slice(lastIndex, match.index)));
        }
        const linkText = match[1].startsWith('@') ? match[1] : match[2];
        parts.push(
          <a
            key={match.index}
            href={match[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-black underline hover:text-[#2600FF] transition-colors duration-200"
          >
            {applyStrikethrough(linkText)}
          </a>
        );
        lastIndex = match.index + match[0].length;
      }

      if (lastIndex < line.length) {
        parts.push(applyStrikethrough(line.slice(lastIndex)));
      }

      return (
        <React.Fragment key={lineIndex}>
          {parts}
          {lineIndex < text.split('\n').length - 1 && <br />}
        </React.Fragment>
      );
    });
  };

  const applyStrikethrough = (text: string) => {
    const strikethroughWords = ['Nippies', 'Duppies'];
    return text.split(' ').map((word, index) => {
      if (strikethroughWords.includes(word)) {
        return <del key={index}>{word}</del>;
      }
      return word + ' ';
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
          <div className="flex-grow max-w-[400px] mx-auto w-full px-4">
            {/* Navigation */}
            <nav className="flex justify-center items-center p-4">  
              <button onClick={handlePrev} className="text-[#2600FF] border border-[#2600FF] px-4 py-2 h-10 hover:text-[#170099] hover:border-[#170099] transition-colors duration-200">Prev</button>
              <button onClick={handleRandom} className="bg-[#2600FF] text-white px-4 py-2 mx-2 h-10 hover:bg-[#170099] transition-colors duration-200">random</button>
              <button onClick={handleNext} className="text-[#2600FF] border border-[#2600FF] px-4 py-2 h-10 hover:text-[#170099] hover:border-[#170099] transition-colors duration-200">Next</button>
            </nav>

            {/* Horizontal line container */}
            <div className="w-full">
              <hr className="border-t border-[#E4E4E4]" />
            </div>
    
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
                    <img src="/loading.gif" alt="Loading" className="w-16 h-16" />
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
            <div className="mb-6">
              <a href={currentItem["Original post (link)"]} target="_blank" rel="noopener noreferrer" className="bg-white text-[#2600FF] border border-[#2600FF] hover:text-[#170099] hover:border-[#170099] rounded-full px-4 py-1 text-base inline-flex items-center transition-colors duration-200">
                View on <svg width="16" height="16" viewBox="0 0 300 300.251" version="1.1" xmlns="http://www.w3.org/2000/svg" className="ml-2 transition-colors duration-200">
                  <path fill="currentColor" d="M178.57 127.15 290.27 0h-26.46l-97.03 110.38L89.34 0H0l117.13 166.93L0 300.25h26.46l102.4-116.59 81.8 116.59h89.34M36.01 19.54H76.66l187.13 262.13h-40.66"/>
                </svg>
              </a>
            </div>
          </div>

          <div className="mt-auto md:mt-8 pb-4 md:pb-0">
            {/* Site hits */}
            <div className="flex justify-center mb-2 max-w-[400px] mx-auto w-full px-4">
              <div className="text-[#A8A8A8] text-[14px] text-center">
                Site smashed <span className="font-bold">{hitCount.toLocaleString()}</span> times.
              </div>
            </div>
            {/* Created by */}
            <footer className="text-[#A8A8A8] text-[14px] text-center p-2 md:py-3 md:bg-[#F5F5F5] md:w-full mt-2 md:mt-0">
              <div className="max-w-[400px] mx-auto w-full px-4">
                Created by <u><a href="https://twitter.com/capsjpeg" target="_blank" rel="noopener noreferrer" className="hover:text-black">Caps</a></u>, <u><a href="https://twitter.com/misterholana" target="_blank" rel="noopener noreferrer" className="hover:text-black">h_</a></u>, and <u><a href="https://twitter.com/0x_saddy" target="_blank" rel="noopener noreferrer" className="hover:text-black">Saddy</a></u>.
              </div>
            </footer>
          </div>
        </>
      )}
    </div>
  );
}

export default App;

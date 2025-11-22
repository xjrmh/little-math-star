import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '../components/Button';
import { generateMathStory } from '../services/gemini';

interface StoryModeProps {
  onBack: () => void;
  speak: (text: string) => void;
}

export const StoryMode: React.FC<StoryModeProps> = ({ onBack, speak }) => {
  const [selectedNum, setSelectedNum] = useState<number | null>(null);
  const [story, setStory] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleNumberSelect = useCallback(async (num: number) => {
    setSelectedNum(num);
    setLoading(true);
    setStory("");
    
    speak(num.toString());
    
    setTimeout(() => speak(`Let's hear a story about the number ${num}`), 1000);
    
    try {
      const generatedStory = await generateMathStory(num);
      setStory(generatedStory);
      setLoading(false);
      speak(generatedStory);
    } catch (e) {
      setStory("Oops, the story book is closed right now. Try again!");
      setLoading(false);
    }
  }, [speak]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (loading) return;
      
      const key = e.key;
      let num = parseInt(key);
      if (key === '0') num = 10;

      if (!isNaN(num) && num >= 1 && num <= 10) {
        handleNumberSelect(num);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [loading, handleNumberSelect]);


  return (
    <div className="flex flex-col items-center h-full p-6 overflow-y-auto">
      <div className="w-full flex justify-between items-center mb-6">
        <Button variant="secondary" onClick={onBack} className="px-4 py-2 text-xl">🏠</Button>
        <h2 className="text-3xl font-bold text-purple-600">Magic Story</h2>
        <div className="w-12"></div>
      </div>

      {!selectedNum || (selectedNum && !story && !loading) ? (
        <>
            <p className="text-xl text-center text-gray-600 mb-6 font-medium">Pick a number to hear a magical story!</p>
            <div className="grid grid-cols-3 gap-4 w-full max-w-sm">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <Button
                key={num}
                onClick={() => handleNumberSelect(num)}
                variant="warning"
                className="text-3xl py-4 rounded-2xl"
                >
                {num}
                </Button>
            ))}
            </div>
        </>
      ) : (
        <div className="w-full max-w-md flex flex-col items-center">
             <div className="text-8xl font-black text-yellow-400 mb-6 drop-shadow-md">
                {selectedNum}
             </div>
             
             <div className="bg-white p-8 rounded-3xl shadow-xl border-4 border-purple-100 min-h-[200px] flex items-center justify-center">
                 {loading ? (
                     <div className="flex flex-col items-center">
                         <div className="text-4xl animate-bounce mb-2">🤔</div>
                         <p className="text-gray-400">Thinking of a story...</p>
                     </div>
                 ) : (
                     <p className="text-2xl text-center font-medium leading-relaxed text-gray-700">
                         {story}
                     </p>
                 )}
             </div>

             {!loading && (
                 <div className="mt-8 flex gap-4">
                      <Button onClick={() => speak(story)} variant="secondary" className="px-8 py-3 text-xl">
                        🔊 Read Again
                      </Button>
                      <Button onClick={() => setSelectedNum(null)} variant="primary" className="px-8 py-3 text-xl">
                        ✨ New Number
                      </Button>
                 </div>
             )}
        </div>
      )}
    </div>
  );
};

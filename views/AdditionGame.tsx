
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '../components/Button';
import { Question, Difficulty } from '../types';
import { playSound } from '../services/sound';

interface AdditionGameProps {
  onBack: () => void;
  onCorrect: () => void;
  speak: (text: string) => void;
  difficulty: Difficulty;
}

const EMOJIS = ['🍎', '🍪', '🎈', '🦆', '🐱', '⭐'];

export const AdditionGame: React.FC<AdditionGameProps> = ({ onBack, onCorrect, speak, difficulty }) => {
  const [question, setQuestion] = useState<Question | null>(null);
  const [isWrong, setIsWrong] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showVisuals, setShowVisuals] = useState(true);

  const generateQuestion = useCallback(() => {
    const emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
    
    let minSum = 2;
    let maxSum = 5;

    // Distinct ranges for difficulty
    if (difficulty === 'easy') {
         minSum = 2;
         maxSum = 5;
    } else if (difficulty === 'medium') {
         minSum = 6;
         maxSum = 10;
    } else if (difficulty === 'hard') {
         minSum = 11;
         maxSum = 20;
    }

    // Generate a target sum strictly within the difficulty range
    const targetSum = Math.floor(Math.random() * (maxSum - minSum + 1)) + minSum;
    
    // Generate components that sum to targetSum
    // Ensure num1 is at least 1 and leaves at least 1 for num2
    const num1 = Math.floor(Math.random() * (targetSum - 1)) + 1;
    const num2 = targetSum - num1;

    const options = new Set<number>();
    options.add(targetSum);
    
    // Generate distractors
    while (options.size < 3) {
      // Create distractors close to answer (-2 to +2)
      const offset = Math.floor(Math.random() * 5) - 2; 
      const r = targetSum + offset;
      
      // Ensure positive, not equal to answer
      if (r !== targetSum && r > 0) {
          options.add(r);
      }
      
      // Fallback to ensure loop finishes if neighbors are exhausted/invalid
      if (options.size < 3) {
         const fallback = Math.floor(Math.random() * (maxSum + 2)) + 1;
         if (fallback !== targetSum) options.add(fallback);
      }
    }

    const q = {
      id: Date.now().toString(),
      questionText: `${num1} plus ${num2} equals?`,
      visualItems: Array(num1).fill(emoji),
      visualItemsSecond: Array(num2).fill(emoji),
      correctAnswer: targetSum,
      options: Array.from(options).sort(() => Math.random() - 0.5),
    };
    
    setQuestion(q);
    setIsWrong(null);
    setIsProcessing(false);
    setShowHint(false);
  }, [difficulty]);

  useEffect(() => {
    generateQuestion();
  }, [generateQuestion]);

  useEffect(() => {
    if (question) {
        setTimeout(() => speak(`${question.visualItems.length} plus ${question.visualItemsSecond?.length}`), 500);
    }
  }, [question, speak]);

  const handleAnswer = useCallback((answer: number) => {
    if (!question || isProcessing) return;
    
    speak(answer.toString());

    if (answer === question.correctAnswer) {
      setIsProcessing(true);
      setTimeout(() => {
        speak("You did it!");
        onCorrect();
        setTimeout(generateQuestion, 1000);
      }, 1000);
    } else {
      setIsWrong(answer);
      playSound('wrong');
      setShowHint(true); // Show hint on wrong answer
      setTimeout(() => {
        speak("Oops, try again.");
      }, 1000);
    }
  }, [question, isProcessing, speak, onCorrect, generateQuestion]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!question || isProcessing) return;

      const num = parseInt(e.key);
      if (e.key === '0' && question.options.includes(10)) {
        handleAnswer(10);
        return;
      }

      if (!isNaN(num) && question.options.includes(num)) {
        handleAnswer(num);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [question, isProcessing, handleAnswer]);

  if (!question) return <div>Loading...</div>;

  const isHard = difficulty === 'hard';
  const containerWidth = isHard ? 'max-w-[140px]' : 'max-w-[120px]';
  const emojiSize = isHard ? 'text-2xl sm:text-3xl' : 'text-3xl sm:text-4xl';
  const numberSize = showVisuals ? 'text-lg' : 'text-6xl sm:text-7xl';

  return (
    <div className="flex flex-col items-center h-full p-4 sm:p-6">
      <div className="w-full flex justify-between items-center mb-4">
        <Button variant="secondary" onClick={onBack} className="px-3 py-2 text-lg">🏠</Button>
        <h2 className="text-2xl sm:text-3xl font-bold text-green-600">Adding</h2>
        <Button 
            variant="secondary" 
            onClick={() => setShowVisuals(prev => !prev)} 
            className="px-3 py-2 text-lg"
        >
            {showVisuals ? '🙈' : '👀'}
        </Button>
      </div>

      <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-xl w-full max-w-sm mb-6 flex flex-col items-center border-b-8 border-gray-100">
        {/* Responsive layout: flex-col on mobile (stacked), flex-row on desktop (side-by-side) */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-4 mb-6 w-full">
            
            <div className="flex flex-col items-center">
                {showVisuals && (
                    <div className={`flex flex-wrap justify-center gap-1 bg-blue-50 p-2 rounded-2xl border-2 border-blue-100 min-w-[70px] ${containerWidth}`}>
                        {question.visualItems.map((item, i) => (
                            <span key={`1-${i}`} className={`${emojiSize} animate-pop`} style={{ animationDelay: `${i * 0.05}s` }}>{item}</span>
                        ))}
                    </div>
                )}
                <span className={`text-blue-400 font-bold mt-1 transition-all duration-300 ${numberSize}`}>
                    {question.visualItems.length}
                </span>
            </div>
            
            <span className="text-3xl sm:text-4xl font-black text-gray-300 py-2 sm:py-0">+</span>

            <div className="flex flex-col items-center">
                {showVisuals && (
                    <div className={`flex flex-wrap justify-center gap-1 bg-green-50 p-2 rounded-2xl border-2 border-green-100 min-w-[70px] ${containerWidth}`}>
                        {question.visualItemsSecond?.map((item, i) => (
                            <span key={`2-${i}`} className={`${emojiSize} animate-pop`} style={{ animationDelay: `${(question.visualItems.length + i) * 0.05}s` }}>{item}</span>
                        ))}
                    </div>
                )}
                <span className={`text-green-400 font-bold mt-1 transition-all duration-300 ${numberSize}`}>
                    {question.visualItemsSecond?.length}
                </span>
            </div>
        </div>
        
        <div className="flex items-center gap-3 w-full justify-center border-t-2 border-gray-100 pt-4">
             <span className="text-3xl sm:text-4xl font-black text-gray-300">=</span>
             <div className="w-16 h-16 rounded-2xl border-4 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 text-3xl font-bold text-gray-400 animate-pulse">
                 ?
             </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 w-full max-w-sm">
        {question.options.map((opt) => (
          <Button
            key={opt}
            onClick={() => handleAnswer(opt)}
            variant={
                isWrong === opt 
                ? 'danger' 
                : (isProcessing && opt === question.correctAnswer ? 'success' : 'primary')
            }
            className={`py-4 sm:py-5 rounded-3xl shadow-[0_4px_0_0_rgba(0,0,0,0.1)] ${opt > 99 ? 'text-2xl' : 'text-3xl sm:text-4xl'} ${
                showHint && opt === question.correctAnswer 
                ? 'animate-gentle-pulse ring-4 ring-yellow-300 ring-opacity-50 z-10' 
                : ''
            }`}
          >
            {opt}
          </Button>
        ))}
      </div>
    </div>
  );
};

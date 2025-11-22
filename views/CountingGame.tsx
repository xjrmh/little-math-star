
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '../components/Button';
import { Question, Difficulty } from '../types';
import { playSound } from '../services/sound';

interface CountingGameProps {
  onBack: () => void;
  onCorrect: () => void;
  speak: (text: string) => void;
  difficulty: Difficulty;
}

const EMOJIS = ['🍎', '🍌', '🐶', '🐱', '🐸', '🦆', '🎈', '⭐', '🍪', '🚗'];

export const CountingGame: React.FC<CountingGameProps> = ({ onBack, onCorrect, speak, difficulty }) => {
  const [question, setQuestion] = useState<Question | null>(null);
  const [isWrong, setIsWrong] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const generateQuestion = useCallback(() => {
    let min = 1;
    let max = 5;

    // Strict ranges for distinct difficulty
    if (difficulty === 'easy') {
        min = 1;
        max = 5;
    } else if (difficulty === 'medium') {
        min = 6;
        max = 10;
    } else if (difficulty === 'hard') {
        min = 11;
        max = 20;
    }

    const number = Math.floor(Math.random() * (max - min + 1)) + min;
    const emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
    
    const options = new Set<number>();
    options.add(number);
    
    // Generate distractors close to the answer but within reasonable bounds
    while (options.size < 3) {
      // Try to find a number within +/- 3 of the answer first
      let r = number + (Math.floor(Math.random() * 7) - 3);
      
      // If that produces invalid or duplicate, pick random from difficulty range
      if (r < 1 || r === number || options.has(r)) {
          r = Math.floor(Math.random() * (max - min + 1)) + min;
      }
      
      // Fallback for edge cases (like if min=1, max=2) to ensure we get 3 options
      if (r === number || options.has(r)) {
         r = Math.floor(Math.random() * 20) + 1;
      }

      if (r > 0 && r !== number) options.add(r);
    }
    
    const q = {
      id: Date.now().toString(),
      questionText: `Can you count the ${emoji}s?`,
      visualItems: Array(number).fill(emoji),
      correctAnswer: number,
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
      speak("How many?");
    }
  }, [question, speak]);

  const handleAnswer = useCallback((answer: number) => {
    if (!question || isProcessing) return;

    speak(answer.toString());

    if (answer === question.correctAnswer) {
      setIsProcessing(true);
      setTimeout(() => {
        speak("Great job!");
        onCorrect();
        setTimeout(generateQuestion, 1000);
      }, 1000);
    } else {
      setIsWrong(answer);
      playSound('wrong');
      // Only show hint after a wrong attempt
      setShowHint(true); 
      setTimeout(() => {
        speak("Try again!");
      }, 1000);
    }
  }, [question, isProcessing, speak, onCorrect, generateQuestion]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!question || isProcessing) return;
      
      const num = parseInt(e.key);
      if (!isNaN(num) && question.options.includes(num)) {
        handleAnswer(num);
      }
      if (e.key === '0' && question.options.includes(10)) {
          handleAnswer(10);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [question, isProcessing, handleAnswer]);

  if (!question) return <div>Loading...</div>;

  const isLargeCount = question.visualItems.length > 12;
  const isMediumCount = question.visualItems.length > 6;
  const emojiSize = isLargeCount ? 'text-4xl' : isMediumCount ? 'text-5xl' : 'text-6xl';

  return (
    <div className="flex flex-col items-center h-full p-6">
      <div className="w-full flex justify-between items-center mb-8">
        <Button variant="secondary" onClick={onBack} className="px-4 py-2 text-xl">
          🏠
        </Button>
        <h2 className="text-3xl font-bold text-blue-600">Counting</h2>
        <div className="w-12"></div>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-xl w-full max-w-sm mb-8 min-h-[200px] flex items-center justify-center">
        <div className="flex flex-wrap justify-center gap-2">
          {question.visualItems.map((item, index) => (
            <span key={index} className={`${emojiSize} animate-pop`} style={{ animationDelay: `${index * 0.05}s` }}>
              {item}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 w-full max-w-sm">
        {question.options.map((opt) => (
          <Button
            key={opt}
            onClick={() => handleAnswer(opt)}
            variant={
                isWrong === opt 
                ? 'danger' 
                : (isProcessing && opt === question.correctAnswer ? 'success' : 'primary')
            }
            className={`text-3xl py-6 rounded-3xl ${
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

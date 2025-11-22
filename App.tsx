
import React, { useState, useEffect, useCallback } from 'react';
import { Confetti } from './components/Confetti';
import { Button } from './components/Button';
import { CountingGame } from './views/CountingGame';
import { AdditionGame } from './views/AdditionGame';
import { StoryMode } from './views/StoryMode';
import { GameMode, Difficulty } from './types';
import { playSound } from './services/sound';

function App() {
  const [mode, setMode] = useState<GameMode>('home');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [showConfetti, setShowConfetti] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [score, setScore] = useState(0);

  const speak = useCallback((text: string) => {
    // Cancel any existing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Attempt to select a pleasant English voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => 
      v.name.includes('Google US English') || 
      v.name.includes('Samantha') || 
      (v.lang.startsWith('en') && !v.name.includes('Microsoft'))
    );
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.rate = 0.9; 
    utterance.pitch = 1.1;
    
    window.speechSynthesis.speak(utterance);
  }, []);

  useEffect(() => {
    const hasGreeted = sessionStorage.getItem('greeted');
    if (!hasGreeted) {
        sessionStorage.setItem('greeted', 'true');
    }
    // Ensure voices are loaded
    window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
    };
  }, []);

  const triggerConfetti = () => {
    setShowConfetti(true);
    setScore(s => s + 1);
    playSound('correct');
    setTimeout(() => setShowConfetti(false), 2500);
  };

  const handleModeSelect = (newMode: GameMode) => {
    setMode(newMode);
    
    let label = "";
    if (newMode === 'counting') label = "Let's Count!";
    if (newMode === 'addition') label = "Let's Add!";
    if (newMode === 'story') label = "Story Time!";
    
    speak(label);
  };

  const renderHome = () => (
    <div className="flex flex-col items-center justify-center h-full p-6 max-w-md mx-auto">
      <div className="text-center mb-6">
        <h1 className="text-6xl font-black text-blue-500 mb-2 tracking-tight drop-shadow-sm">Little<br/><span className="text-yellow-400 text-5xl">Math Star</span></h1>
        <p className="text-gray-400 text-lg font-medium mt-2">Let's play and learn!</p>
      </div>

      <div className="w-full max-w-xs mb-8">
        <p className="text-center text-gray-400 text-xs font-bold uppercase tracking-widest mb-3">Select Difficulty</p>
        <div className="flex gap-2 bg-white p-2 rounded-3xl shadow-sm border-2 border-gray-100">
          {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => {
              const isActive = difficulty === d;
              let colorClass = "";
              let emoji = "";
              
              switch(d) {
                  case 'easy': 
                    colorClass = isActive ? "bg-green-400 text-white shadow-md scale-105" : "text-gray-400 hover:text-green-400 hover:bg-green-50";
                    emoji = "🌱";
                    break;
                  case 'medium':
                    colorClass = isActive ? "bg-yellow-400 text-white shadow-md scale-105" : "text-gray-400 hover:text-yellow-400 hover:bg-yellow-50";
                    emoji = "⭐";
                    break;
                  case 'hard':
                    colorClass = isActive ? "bg-red-400 text-white shadow-md scale-105" : "text-gray-400 hover:text-red-400 hover:bg-red-50";
                    emoji = "🔥";
                    break;
              }

              return (
                <button
                    key={d}
                    onClick={() => { 
                      setDifficulty(d); 
                      speak(d); 
                      playSound('click');
                    }}
                    className={`flex-1 py-3 rounded-2xl font-bold text-sm transition-all duration-200 flex flex-col items-center justify-center gap-1 ${colorClass}`}
                >
                    <span className="text-lg">{emoji}</span>
                    <span className="capitalize">{d}</span>
                </button>
              );
          })}
        </div>
      </div>

      <div className="w-full space-y-4">
        <Button 
            onClick={() => handleModeSelect('counting')} 
            variant="primary" 
            className="w-full py-5 text-2xl flex items-center justify-center gap-4 rounded-3xl"
        >
            <span>🍎</span> Counting
        </Button>
        
        <Button 
            onClick={() => handleModeSelect('addition')} 
            variant="success" 
            className="w-full py-5 text-2xl flex items-center justify-center gap-4 rounded-3xl"
        >
            <span>➕</span> Adding
        </Button>

        <Button 
            onClick={() => handleModeSelect('story')} 
            variant="warning" 
            className="w-full py-5 text-2xl flex items-center justify-center gap-4 rounded-3xl"
        >
            <span>📖</span> Magic Story
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-gray-800">
      {showConfetti && <Confetti />}
      
      <main className="max-w-md mx-auto h-[100dvh] bg-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 via-pink-400 to-yellow-400"></div>

        {mode === 'home' && renderHome()}
        
        {mode === 'counting' && (
          <CountingGame 
            onBack={() => setMode('home')} 
            onCorrect={triggerConfetti}
            speak={speak}
            difficulty={difficulty}
          />
        )}
        
        {mode === 'addition' && (
          <AdditionGame 
            onBack={() => setMode('home')} 
            onCorrect={triggerConfetti}
            speak={speak}
            difficulty={difficulty}
          />
        )}

        {mode === 'story' && (
          <StoryMode 
            onBack={() => setMode('home')} 
            speak={speak}
          />
        )}
      </main>
    </div>
  );
}

export default App;

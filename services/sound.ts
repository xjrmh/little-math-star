
const SOUNDS = {
  click: 'https://assets.mixkit.co/sfx/preview/mixkit-modern-technology-select-3124.mp3',
  correct: 'https://assets.mixkit.co/sfx/preview/mixkit-arcade-game-jump-coin-216.mp3',
  wrong: 'https://assets.mixkit.co/sfx/preview/mixkit-click-error-1110.mp3',
};

export type SoundType = keyof typeof SOUNDS;

export const playSound = (type: SoundType) => {
  try {
    const audio = new Audio(SOUNDS[type]);
    audio.volume = type === 'click' ? 0.2 : 0.4; 
    audio.play().catch(() => {
        // Ignore autoplay errors or network errors
    }); 
  } catch (e) {
    // Audio not supported
  }
};

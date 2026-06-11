import takeCardUrl from './assets/sounds/take_card.mp3';
import overUrl from './assets/sounds/over.mp3';

const audioCtx = {
  takeCard: new Audio(takeCardUrl),
  over: new Audio(overUrl),
};

// 预加载，避免第一次播放延迟
Object.values(audioCtx).forEach(a => {
  a.preload = 'auto';
  a.load();
});

export function playTakeCard() {
  const a = audioCtx.takeCard.cloneNode();
  a.volume = 0.7;
  a.play().catch(() => {});
}

export function playOver() {
  const a = audioCtx.over.cloneNode();
  a.volume = 0.8;
  a.play().catch(() => {});
}

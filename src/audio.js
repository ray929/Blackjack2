import takeCardUrl from './assets/sounds/take_card.mp3';
import overUrl from './assets/sounds/over.mp3';
import hitUrl from './assets/sounds/hit.ogg';
import standUrl from './assets/sounds/stand.ogg';
import bustUrl from './assets/sounds/bust.ogg';
import playerJoinUrl from './assets/sounds/player_join.ogg';
import playerLeaveUrl from './assets/sounds/player_leave.ogg';
import dealerStandUrl from './assets/sounds/dealer_stand.ogg';

const audioCtx = {
  takeCard: new Audio(takeCardUrl),
  over: new Audio(overUrl),
  hit: new Audio(hitUrl),
  stand: new Audio(standUrl),
  bust: new Audio(bustUrl),
  playerJoin: new Audio(playerJoinUrl),
  playerLeave: new Audio(playerLeaveUrl),
  dealerStand: new Audio(dealerStandUrl),
};

// 预加载，避免第一次播放延迟
Object.values(audioCtx).forEach(a => {
  a.preload = 'auto';
  a.load();
});

function play(name, volume = 0.8) {
  const a = audioCtx[name].cloneNode();
  a.volume = volume;
  a.play().catch(() => {});
}

export function playTakeCard() {
  play('takeCard', 0.7);
}

export function playOver() {
  play('over', 0.8);
}

export function playHit() {
  play('hit', 0.8);
}

export function playStand() {
  play('stand', 0.8);
}

export function playBust() {
  play('bust', 0.9);
}

export function playPlayerJoin() {
  play('playerJoin', 0.8);
}

export function playPlayerLeave() {
  play('playerLeave', 0.8);
}

export function playDealerStand() {
  play('dealerStand', 0.8);
}

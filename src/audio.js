import takeCardUrl from './assets/sounds/take_card.mp3';
import overUrl from './assets/sounds/over.mp3';
import playerHitUrl from './assets/sounds/player_hit.ogg';
import playerStandUrl from './assets/sounds/player_stand.ogg';
import playerBustUrl from './assets/sounds/player_bust.ogg';
import playerJoinUrl from './assets/sounds/player_join.ogg';
import playerLeaveUrl from './assets/sounds/player_leave.ogg';
import dealerHitUrl from './assets/sounds/dealer_hit.ogg';
import dealerStandUrl from './assets/sounds/dealer_stand.ogg';
import dealerBustUrl from './assets/sounds/dealer_bust.ogg';

const audioCtx = {
  takeCard: new Audio(takeCardUrl),
  over: new Audio(overUrl),
  playerHit: new Audio(playerHitUrl),
  playerStand: new Audio(playerStandUrl),
  playerBust: new Audio(playerBustUrl),
  playerJoin: new Audio(playerJoinUrl),
  playerLeave: new Audio(playerLeaveUrl),
  dealerHit: new Audio(dealerHitUrl),
  dealerStand: new Audio(dealerStandUrl),
  dealerBust: new Audio(dealerBustUrl),
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

export function playPlayerHit() {
  play('playerHit', 0.8);
}

export function playPlayerStand() {
  play('playerStand', 0.8);
}

export function playPlayerBust() {
  play('playerBust', 0.9);
}

export function playPlayerJoin() {
  play('playerJoin', 0.8);
}

export function playPlayerLeave() {
  play('playerLeave', 0.8);
}

export function playDealerHit() {
  play('dealerHit', 0.8);
}

export function playDealerStand() {
  play('dealerStand', 0.8);
}

export function playDealerBust() {
  play('dealerBust', 0.9);
}

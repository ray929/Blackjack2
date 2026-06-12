export function preloadAssets() {
  const suits = ['spade', 'heart', 'diamond', 'club'];
  const ranks = ['a', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'j', 'q', 'k'];
  const urls = [];

  suits.forEach(suit => {
    ranks.forEach(rank => {
      urls.push(`cards/${suit}_${rank}.webp`);
    });
  });
  urls.push('cards/joker_red.webp', 'cards/joker_black.webp');

  urls.forEach(src => {
    const img = new Image();
    img.src = src;
  });

  const bg = new Image();
  bg.src = './assets/felt_bg.png';
}

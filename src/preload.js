export function preloadAssets(onProgress) {
  const suits = ['spade', 'heart', 'diamond', 'club'];
  const ranks = ['a', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'j', 'q', 'k'];
  const urls = [];

  urls.push('./assets/felt_bg.png');
  suits.forEach(suit => {
    ranks.forEach(rank => {
      urls.push(`cards/${suit}_${rank}.webp`);
    });
  });
  urls.unshift('cards/card_back.webp');
  urls.push('cards/joker_red.webp', 'cards/joker_black.webp');

  let loaded = 0;
  const total = urls.length;

  function updateProgress() {
    loaded++;
    if (onProgress) onProgress(loaded, total);
  }

  const promises = urls.map(src => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        updateProgress();
        resolve();
      };
      img.onerror = () => {
        updateProgress();
        resolve();
      };
      img.src = src;
    });
  });

  return Promise.all(promises);
}

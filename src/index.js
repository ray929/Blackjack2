import './style.css';
import './game.js';
import { preloadAssets } from './preload.js';

const loadingScreen = document.getElementById('loading-screen');
const progressBar = document.getElementById('loading-bar');
const progressText = document.getElementById('loading-text');
const gameRoot = document.getElementById('game-root');

preloadAssets((loaded, total) => {
  const pct = Math.round((loaded / total) * 100);
  if (progressBar) progressBar.style.width = pct + '%';
  if (progressText) progressText.textContent = `正在加载资源... ${pct}%`;
}).then(() => {
  if (loadingScreen) loadingScreen.style.display = 'none';
  if (gameRoot) gameRoot.style.display = 'block';
});

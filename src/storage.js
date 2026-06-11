const STORAGE_KEY = 'blackjack_scores_v1';

export function loadScores() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Failed to load scores from localStorage', e);
  }
  return { jia: 0, yi: 0, bing: 0, ding: 0 };
}

export function saveScores(scores) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
  } catch (e) {
    console.warn('Failed to save scores to localStorage', e);
  }
}

export function clearScores() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Failed to clear scores from localStorage', e);
  }
}

import { loadScores, saveScores, clearScores } from './storage.js';
import { playTakeCard, playOver, playBang } from './audio.js';

const SUITS = ['spade', 'heart', 'diamond', 'club'];
const RANKS = ['a','2','3','4','5','6','7','8','9','10','j','q','k'];

const saved = loadScores();
const players = {
  jia: { name: '甲', seated: true, score: saved.jia || 0, cards: [], isDealer: true, busted: false, stood: false, blackjack: false, fiveCardWin: false },
  yi:  { name: '乙', seated: false, score: saved.yi || 0, cards: [], isDealer: false, busted: false, stood: false, blackjack: false, fiveCardWin: false },
  bing:{ name: '丙', seated: false, score: saved.bing || 0, cards: [], isDealer: false, busted: false, stood: false, blackjack: false, fiveCardWin: false },
  ding:{ name: '丁', seated: false, score: saved.ding || 0, cards: [], isDealer: false, busted: false, stood: false, blackjack: false, fiveCardWin: false }
};

let deck = [];
let gameState = 'idle';
let currentPlayerIndex = 0;
let playerOrder = [];

function persistScores() {
  saveScores({
    jia: players.jia.score,
    yi: players.yi.score,
    bing: players.bing.score,
    ding: players.ding.score,
  });
}

function initDeck() {
  deck = [];
  for (let d = 0; d < 4; d++) {
    for (const s of SUITS) {
      for (const r of RANKS) {
        deck.push({ suit: s, rank: r });
      }
    }
    deck.push({ suit: 'joker', rank: 'red' });
    deck.push({ suit: 'joker', rank: 'black' });
  }
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  updateDeckCount();
}

function updateDeckCount() {
  document.getElementById('deck-count').textContent = deck.length;
}

function cardValue(rank) {
  if (rank === 'a') return 11;
  if (['j','q','k','red','black'].includes(rank)) return 10;
  return parseInt(rank);
}

function handValue(cards) {
  let total = 0;
  let aces = 0;
  for (const c of cards) {
    const v = cardValue(c.rank);
    total += v;
    if (c.rank === 'a') aces++;
  }
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }
  return total;
}

function isBlackjack(cards) {
  return cards.length === 2 && handValue(cards) === 21;
}

function setHint(pid, text, type) {
  const el = document.getElementById('hint-' + pid);
  el.textContent = text;
  el.className = 'hint show' + (type ? ' ' + type : '');
}

function clearHints() {
  for (const pid in players) {
    const el = document.getElementById('hint-' + pid);
    el.textContent = '';
    el.className = 'hint';
  }
}

export function seat(pid) {
  if (gameState !== 'idle') return;
  players[pid].seated = true;
  renderPlayer(pid);
  checkDealButton();
}

export function leave(pid) {
  if (gameState !== 'idle') return;
  players[pid].seated = false;
  players[pid].cards = [];
  renderPlayer(pid);
  checkDealButton();
}

function checkDealButton() {
  const hasSeated = players.yi.seated || players.bing.seated || players.ding.seated;
  const ops = document.getElementById('ops-jia');
  if (gameState !== 'idle') {
    ops.innerHTML = '';
    return;
  }
  if (hasSeated) {
    ops.innerHTML = `<button class="btn primary" data-action="deal">发牌</button><button class="btn danger" data-action="show-confirm">重置</button>`;
  } else {
    ops.innerHTML = `<button class="btn danger" data-action="show-confirm">重置</button>`;
  }
}

function getCardBgUrl(suit, rank) {
  return `cards/${suit}_${rank}.webp`;
}

export function renderPlayer(pid) {
  const p = players[pid];
  const ops = document.getElementById('ops-' + pid);
  const cardsArea = document.getElementById('cards-' + pid);
  const scoreEl = document.getElementById('score-' + pid);
  const handValueEl = document.getElementById('hand-value-' + pid);

  scoreEl.textContent = p.score;

  if (!p.seated) {
    if (gameState === 'idle') {
      cardsArea.innerHTML = '';
      if (handValueEl) handValueEl.classList.remove('show');
      ops.innerHTML = `<button class="btn primary" data-action="seat" data-pid="${pid}">落座</button>`;
    } else {
      cardsArea.innerHTML = '<div class="waiting-text">请稍候</div>';
      if (handValueEl) handValueEl.classList.remove('show');
      ops.innerHTML = `<button class="btn primary" disabled data-action="seat" data-pid="${pid}">落座</button>`;
    }
    return;
  }

  if (p.cards.length === 0) {
    cardsArea.innerHTML = '';
    if (handValueEl) handValueEl.classList.remove('show');
  } else {
    cardsArea.innerHTML = p.cards.map((c, i) => {
      if (c.faceDown) {
        return `<div class="card face-down" id="card-${pid}-${i}"></div>`;
      }
      const bgUrl = getCardBgUrl(c.suit, c.rank);
      return `<div class="card" id="card-${pid}-${i}" style="background-image:url('${bgUrl}')"></div>`;
    }).join('');
    if (handValueEl) {
      const showValue = (gameState === 'playerTurn' && !p.isDealer) ||
                        gameState === 'dealerTurn' ||
                        gameState === 'settling' ||
                        (gameState === 'idle' && p.cards.length > 0);
      if (showValue) {
        handValueEl.textContent = handValue(p.cards);
        handValueEl.classList.add('show');
      } else {
        handValueEl.classList.remove('show');
      }
      cardsArea.appendChild(handValueEl);
    }
  }

  if (gameState === 'idle') {
    if (p.isDealer) {
      checkDealButton();
    } else {
      ops.innerHTML = `<button class="btn secondary" data-action="leave" data-pid="${pid}">离座</button>`;
    }
  }
}

function renderAll() {
  for (const pid in players) renderPlayer(pid);
}

function getDeckCenter() {
  const deckArea = document.getElementById('deck-area');
  const rect = deckArea.getBoundingClientRect();
  return { x: rect.left + rect.width/2 - 28, y: rect.top + rect.height/2 - 42 };
}

function getCardTarget(pid) {
  const cardsArea = document.getElementById('cards-' + pid);
  const rect = cardsArea.getBoundingClientRect();
  const count = players[pid].cards.length;
  const offsetX = (count - 1) * 30;
  return { x: rect.left + rect.width/2 - 28 + offsetX - (count-1)*15, y: rect.top + rect.height/2 - 42 };
}

function flyCard(from, to, onDone) {
  const card = document.createElement('div');
  card.className = 'flying-card back';
  card.style.left = from.x + 'px';
  card.style.top = from.y + 'px';
  document.body.appendChild(card);

  requestAnimationFrame(() => {
    card.style.left = to.x + 'px';
    card.style.top = to.y + 'px';
  });

  setTimeout(() => {
    if (onDone) onDone();
    card.remove();
  }, 550);
}

export function deal() {
  if (gameState !== 'idle') return;
  gameState = 'dealing';
  checkDealButton();
  if (deck.length < 25) initDeck();
  clearHints();

  for (const pid in players) {
    players[pid].cards = [];
    players[pid].busted = false;
    players[pid].stood = false;
    players[pid].blackjack = false;
    players[pid].fiveCardWin = false;
  }

  renderAll();

  playerOrder = ['jia', 'yi', 'bing', 'ding'].filter(id => players[id].seated);
  let dealQueue = [];
  playerOrder.forEach(pid => dealQueue.push({ pid, faceDown: false }));
  playerOrder.forEach(pid => dealQueue.push({ pid, faceDown: pid === 'jia' }));

  let idx = 0;
  function next() {
    if (idx >= dealQueue.length) {
      setTimeout(() => startPlayerTurn(), 600);
      return;
    }
    const d = dealQueue[idx++];
    const card = deck.pop();
    card.faceDown = d.faceDown;
    players[d.pid].cards.push(card);
    updateDeckCount();

    const from = getDeckCenter();
    const to = getCardTarget(d.pid);
    playTakeCard();
    flyCard(from, to, () => {
      renderPlayer(d.pid);
      setTimeout(next, 200);
    });
  }
  next();
}

function startPlayerTurn() {
  gameState = 'playerTurn';
  renderAll();
  currentPlayerIndex = 1; // 从乙开始，庄家最后
  for (const pid of playerOrder) {
    if (isBlackjack(players[pid].cards)) {
      players[pid].blackjack = true;
      if (!players[pid].isDealer) {
        setHint(pid, 'Blackjack!', 'blackjack');
      }
    }
  }
  advancePlayerTurn();
}

function allPlayersBusted() {
  return playerOrder.every(pid => pid === 'jia' || !players[pid].seated || players[pid].busted);
}

function advancePlayerTurn() {
  while (currentPlayerIndex < playerOrder.length) {
    const pid = playerOrder[currentPlayerIndex];
    const p = players[pid];
    if (p.busted || p.stood || p.blackjack || p.fiveCardWin) { currentPlayerIndex++; continue; }
    const ops = document.getElementById('ops-' + pid);
    ops.innerHTML = `<button class="btn primary" data-action="hit" data-pid="${pid}">要牌</button><button class="btn secondary" data-action="stand" data-pid="${pid}">停牌</button>`;
    return;
  }
  if (allPlayersBusted()) {
    setHint('jia', '庄家胜利!', 'win');
    const dealer = players.jia;
    if (dealer.cards.length >= 2 && dealer.cards[1].faceDown) {
      dealer.cards[1].faceDown = false;
      renderPlayer('jia');
    }
    setTimeout(() => settle(), 500);
    return;
  }
  setTimeout(() => startDealerTurn(), 500);
}

export function hit(pid) {
  if (gameState !== 'playerTurn' && gameState !== 'dealerTurn') return;
  if (deck.length === 0) return;
  const card = deck.pop();
  card.faceDown = false;
  players[pid].cards.push(card);
  updateDeckCount();

  const from = getDeckCenter();
  const to = getCardTarget(pid);
  playTakeCard();
  flyCard(from, to, () => {
    renderPlayer(pid);
    const p = players[pid];
    const val = handValue(p.cards);
    if (val > 21) {
      p.busted = true;
      setHint(pid, '爆牌!', 'bust');
      playBang();
      document.getElementById('ops-' + pid).innerHTML = '';
      if (gameState === 'playerTurn') {
        currentPlayerIndex++;
        setTimeout(() => advancePlayerTurn(), 400);
      } else if (gameState === 'dealerTurn') {
        setTimeout(() => settle(), 400);
      }
      return;
    }

    // 五子不犯廿 / 强制停牌（仅闲家）
    if (!p.isDealer && p.cards.length === 5) {
      document.getElementById('ops-' + pid).innerHTML = '';
      if (val <= 19) {
        p.fiveCardWin = true;
        setHint(pid, '五子不犯廿! +50', 'win');
      } else {
        p.stood = true; // 20或21强制停牌
      }
      if (gameState === 'playerTurn') {
        currentPlayerIndex++;
        setTimeout(() => advancePlayerTurn(), 400);
      }
      return;
    }
  });
}

export function stand(pid) {
  if (gameState !== 'playerTurn' && gameState !== 'dealerTurn') return;
  players[pid].stood = true;
  document.getElementById('ops-' + pid).innerHTML = '';
  if (gameState === 'playerTurn') {
    currentPlayerIndex++;
    setTimeout(() => advancePlayerTurn(), 300);
  } else if (gameState === 'dealerTurn') {
    setTimeout(() => settle(), 300);
  }
}

function dealerWinsAll() {
  const dealer = players.jia;
  const dealerVal = handValue(dealer.cards);
  if (dealerVal > 21) return false;
  for (const pid of playerOrder) {
    if (pid === 'jia') continue;
    const p = players[pid];
    if (!p.seated || p.busted || p.fiveCardWin) continue;
    const val = handValue(p.cards);
    if (p.blackjack && !dealer.blackjack) return false;
    if (dealer.blackjack && !p.blackjack) continue;
    if (val >= dealerVal) return false;
  }
  return true;
}

function startDealerTurn() {
  gameState = 'dealerTurn';
  const dealer = players.jia;
  if (dealer.cards.length >= 2 && dealer.cards[1].faceDown) {
    dealer.cards[1].faceDown = false;
  }
  renderAll();
  if (dealer.blackjack) {
    setHint('jia', 'Blackjack!', 'blackjack');
  }
  if (dealerWinsAll()) {
    setHint('jia', '庄家胜利!', 'win');
    setTimeout(() => settle(), 500);
    return;
  }
  const ops = document.getElementById('ops-jia');
  ops.innerHTML = `<button class="btn primary" data-action="hit" data-pid="jia">要牌</button><button class="btn secondary" data-action="stand" data-pid="jia">停牌</button>`;
}

function settle() {
  gameState = 'settling';
  const dealer = players.jia;
  const dealerVal = handValue(dealer.cards);
  const dealerBust = dealerVal > 21;
  const dealerBJ = dealer.blackjack;

  if (dealerBust) {
    setHint('jia', '庄家爆牌!', 'bust');
  }

  for (const pid of playerOrder) {
    if (pid === 'jia') continue;
    const p = players[pid];
    if (!p.seated) continue;
    const val = handValue(p.cards);
    const bust = p.busted;
    const bj = p.blackjack;

    if (bust) {
      setHint(pid, '输 -10', 'lose');
      p.score -= 10;
      players.jia.score += 10;
    } else if (p.fiveCardWin) {
      setHint(pid, '五子不犯廿! +50', 'win');
      p.score += 50;
      players.jia.score -= 50;
    } else if (dealerBust) {
      if (bj) {
        setHint(pid, 'Blackjack! +20', 'blackjack');
        p.score += 20;
        players.jia.score -= 20;
      } else {
        setHint(pid, '赢 +10', 'win');
        p.score += 10;
        players.jia.score -= 10;
      }
    } else if (bj && !dealerBJ) {
      setHint(pid, 'Blackjack! +20', 'blackjack');
      p.score += 20;
      players.jia.score -= 20;
    } else if (!bj && dealerBJ) {
      setHint(pid, '输 -10', 'lose');
      p.score -= 10;
      players.jia.score += 10;
    } else if (bj && dealerBJ) {
      setHint(pid, '平局', '');
    } else if (val > dealerVal) {
      setHint(pid, '赢 +10', 'win');
      p.score += 10;
      players.jia.score -= 10;
    } else if (val < dealerVal) {
      setHint(pid, '输 -10', 'lose');
      p.score -= 10;
      players.jia.score += 10;
    } else {
      setHint(pid, '平局', '');
    }
  }

  persistScores();
  gameState = 'idle';
  renderAll();
  playOver();
  checkDealButton();
}

export function resetGame() {
  if (gameState !== 'idle') return;
  gameState = 'idle';
  currentPlayerIndex = 0;
  playerOrder = [];
  for (const pid in players) {
    players[pid].cards = [];
    players[pid].busted = false;
    players[pid].stood = false;
    players[pid].blackjack = false;
    players[pid].fiveCardWin = false;
    players[pid].score = 0;
  }
  clearScores();
  clearHints();
  initDeck();
  renderAll();
}

// 事件委托绑定
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.btn');
  if (!btn) return;
  const action = btn.dataset.action;
  const pid = btn.dataset.pid;
  if (action === 'seat' && pid) seat(pid);
  if (action === 'leave' && pid) leave(pid);
  if (action === 'deal') deal();
  if (action === 'show-confirm') showConfirmDialog();
  if (action === 'confirm-reset') { hideConfirmDialog(); resetGame(); }
  if (action === 'cancel-reset') hideConfirmDialog();
  if (action === 'hit' && pid) hit(pid);
  if (action === 'stand' && pid) stand(pid);
});

function showConfirmDialog() {
  document.getElementById('confirm-overlay').classList.remove('hidden');
}
function hideConfirmDialog() {
  document.getElementById('confirm-overlay').classList.add('hidden');
}

// 初始化
initDeck();
renderAll();

const cells = document.querySelectorAll('.cell');
const status = document.getElementById('status');
const resetBtn = document.getElementById('reset');
const modeScreen = document.getElementById('mode-screen');
const gameScreen = document.getElementById('game-screen');
const pvpBtn = document.getElementById('pvp-btn');
const pvcBtn = document.getElementById('pvc-btn');
const backBtn = document.getElementById('back-btn');

let currentPlayer = 'X';
let board = Array(9).fill(null);
let gameOver = false;
let gameMode = null; // 'pvp' or 'pvc'
let playerTurnDisplay = status.querySelector('.player-turn');

const winningCombos = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
];

// Event Listeners
cells.forEach(cell => {
  cell.addEventListener('click', handleClick);
});

resetBtn.addEventListener('click', resetGame);
pvpBtn.addEventListener('click', () => startGame('pvp'));
pvcBtn.addEventListener('click', () => startGame('pvc'));
backBtn.addEventListener('click', returnToModeSelection);

function startGame(mode) {
  gameMode = mode;
  modeScreen.classList.add('hidden');
  gameScreen.classList.remove('hidden');
  resetGame();
}

function returnToModeSelection() {
  gameScreen.classList.add('hidden');
  modeScreen.classList.remove('hidden');
  gameMode = null;
}

function handleClick(e) {
  if (gameOver) return;
  
  const index = e.target.dataset.index;

  if (board[index]) return;

  makeMove(index, currentPlayer);
  
  // If in PVC mode and it's computer's turn after player's move
  if (gameMode === 'pvc' && currentPlayer === 'O' && !gameOver) {
    setTimeout(computerMove, 500);
  }
}

function makeMove(index, player) {
  board[index] = player;
  const cell = document.querySelector(`[data-index="${index}"]`);
  cell.textContent = player;
  cell.classList.add(player.toLowerCase());
  
  if (checkWin()) {
    const winner = currentPlayer;
    highlightWinningCells();
    gameOver = true;
    
    if (winner === 'X') {
      celebrateWin('Player X Wins! 🎉', 'var(--primary)');
    } else {
      celebrateWin(gameMode === 'pvp' ? 'Player O Wins! 🎮' : 'Computer Wins! 💻', 'var(--secondary)');
    }
    return;
  }

  if (board.every(cell => cell)) {
    status.innerHTML = "It's a Draw! <span class='emoji'>🤝</span>";
    gameOver = true;
    celebrateWin("It's a Draw! 🤝", 'var(--dark)');
    return;
  }

  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  updateStatus();
}

function computerMove() {
  if (gameOver) return;
  
  // Simple AI: first try to win, then block, then take center, then random
  let move;
  
  // Try to win
  move = findWinningMove('O');
  if (move === null) {
    // Block player from winning
    move = findWinningMove('X');
  }
  if (move === null) {
    // Take center if available
    if (!board[4]) move = 4;
  }
  if (move === null) {
    // Take a random available spot
    const availableSpots = board.map((val, idx) => val === null ? idx : null).filter(val => val !== null);
    move = availableSpots[Math.floor(Math.random() * availableSpots.length)];
  }
  
  makeMove(move, 'O');
}

function findWinningMove(player) {
  for (let combo of winningCombos) {
    const [a, b, c] = combo;
    if (board[a] === player && board[b] === player && board[c] === null) return c;
    if (board[a] === player && board[c] === player && board[b] === null) return b;
    if (board[b] === player && board[c] === player && board[a] === null) return a;
  }
  return null;
}

function checkWin() {
  return winningCombos.some(combo => {
    const [a, b, c] = combo;
    return board[a] && board[a] === board[b] && board[a] === board[c];
  });
}

function highlightWinningCells() {
  const winningCombo = winningCombos.find(combo => {
    const [a, b, c] = combo;
    return board[a] && board[a] === board[b] && board[a] === board[c];
  });
  
  if (winningCombo) {
    winningCombo.forEach(index => {
      document.querySelector(`[data-index="${index}"]`).classList.add('winning-cell');
    });
  }
}

function updateStatus() {
  playerTurnDisplay.textContent = currentPlayer;
  playerTurnDisplay.className = `player-turn ${currentPlayer.toLowerCase()}-turn`;
  
  if (gameMode === 'pvc' && currentPlayer === 'O') {
    status.innerHTML = `Computer's turn <span class="player-turn o-turn">O</span>`;
  } else {
    status.innerHTML = `Player <span class="player-turn ${currentPlayer.toLowerCase()}-turn">${currentPlayer}</span>'s turn`;
  }
}

function celebrateWin(message, color) {
  // Create celebration message
  const celebration = document.createElement('div');
  celebration.className = 'celebration-message';
  celebration.style.color = color;
  celebration.innerHTML = `${message}<span class="emoji">${message.split(' ').pop()}</span>`;
  document.body.appendChild(celebration);
  
  // Create lots of confetti (400 pieces)
  createConfetti(color);
  
  // Remove celebration message after 3 seconds
  setTimeout(() => {
    celebration.remove();
  }, 3000);
}

function createConfetti(baseColor) {
  const colors = [
    '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', // bright colors
    '#ff9999', '#99ff99', '#9999ff', '#ffff99', '#ff99ff', '#99ffff', // pastel colors
    baseColor // winner's color
  ];
  
  const shapes = ['square', 'circle', 'triangle'];
  
  for (let i = 0; i < 400; i++) {
    const confetti = document.createElement('div');
    const shape = shapes[Math.floor(Math.random() * shapes.length)];
    confetti.className = `confetti ${shape}`;
    confetti.style.left = `${Math.random() * 100}vw`;
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.animationDuration = `${Math.random() * 3 + 2}s`;
    confetti.style.setProperty('--sway', Math.random() > 0.5 ? Math.random() : -Math.random());
    document.body.appendChild(confetti);
    
    // Remove confetti after animation
    setTimeout(() => {
      confetti.remove();
    }, 5000);
  }
}

function resetGame() {
  board.fill(null);
  cells.forEach(cell => {
    cell.textContent = '';
    cell.className = 'cell';
  });
  currentPlayer = 'X';
  gameOver = false;
  updateStatus();
}

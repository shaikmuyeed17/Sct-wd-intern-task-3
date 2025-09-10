let board = Array(9).fill(null);
let currentPlayer = 'X';
let gameMode = ''; // 'pvp' or 'pvc'
let difficulty = ''; // 'easy' or 'hard'
let playerSymbol = 'X';
let aiSymbol = 'O';
let timerInterval;
let timeLeft = 10;
let gameActive = true;

const winningConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6] // diagonals
];

function startGame(mode, diff = '') {
    gameMode = mode;
    difficulty = diff;
    if (mode === 'pvp') {
        document.getElementById('symbol-selection').classList.add('hidden');
        initGame();
    } else {
        document.getElementById('mode-selection').classList.add('hidden');
        document.getElementById('difficulty-selection').classList.add('hidden');
        document.getElementById('symbol-selection').classList.remove('hidden');
    }
}

function selectDifficulty() {
    document.getElementById('mode-selection').classList.add('hidden');
    document.getElementById('difficulty-selection').classList.remove('hidden');
}

function setPlayerSymbol(symbol) {
    playerSymbol = symbol;
    aiSymbol = symbol === 'X' ? 'O' : 'X';
    currentPlayer = 'X'; // X always starts
    initGame();
    if (currentPlayer !== playerSymbol) {
        aiMove();
    }
}

function initGame() {
    document.getElementById('mode-selection').classList.add('hidden');
    document.getElementById('difficulty-selection').classList.add('hidden');
    document.getElementById('symbol-selection').classList.add('hidden');
    document.getElementById('game').classList.remove('hidden');
    createBoard();
    updateStatus();
    startTimer();
}

function createBoard() {
    const boardEl = document.getElementById('board');
    boardEl.innerHTML = '';
    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.dataset.index = i;
        cell.addEventListener('click', handleClick);
        boardEl.appendChild(cell);
    }
}

function handleClick(e) {
    const index = e.target.dataset.index;
    if (board[index] || !gameActive || (gameMode === 'pvc' && currentPlayer !== playerSymbol)) return;
    makeMove(index, currentPlayer);
    if (checkWin(currentPlayer)) {
        endGame(`${currentPlayer} wins!`);
        highlightWin();
    } else if (checkDraw()) {
        endGame("It's a draw!");
    } else {
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        updateStatus();
        resetTimer();
        if (gameMode === 'pvc' && currentPlayer === aiSymbol) {
            aiMove();
        }
    }
}

function makeMove(index, player) {
    board[index] = player;
    const cell = document.querySelector(`.cell[data-index="${index}"]`);
    cell.textContent = player;
    cell.classList.add(player.toLowerCase());
}

function aiMove() {
    let move;
    if (difficulty === 'easy') {
        move = randomMove();
    } else {
        move = minimax(board, aiSymbol).index;
    }
    makeMove(move, aiSymbol);
    if (checkWin(aiSymbol)) {
        endGame(`${aiSymbol} wins!`);
        highlightWin();
    } else if (checkDraw()) {
        endGame("It's a draw!");
    } else {
        currentPlayer = playerSymbol;
        updateStatus();
        resetTimer();
    }
}

function randomMove() {
    const available = board.map((v, i) => v ? null : i).filter(v => v !== null);
    return available[Math.floor(Math.random() * available.length)];
}

function minimax(newBoard, player) {
    const availSpots = newBoard.reduce((acc, val, idx) => val === null ? acc.concat(idx) : acc, []);

    if (checkWinForMinimax(newBoard, playerSymbol)) {
        return { score: -10 };
    } else if (checkWinForMinimax(newBoard, aiSymbol)) {
        return { score: 10 };
    } else if (availSpots.length === 0) {
        return { score: 0 };
    }

    const moves = [];
    for (let i = 0; i < availSpots.length; i++) {
        const move = {};
        move.index = availSpots[i];
        newBoard[availSpots[i]] = player;

        if (player === aiSymbol) {
            move.score = minimax(newBoard, playerSymbol).score;
        } else {
            move.score = minimax(newBoard, aiSymbol).score;
        }

        newBoard[availSpots[i]] = null;
        moves.push(move);
    }

    let bestMove;
    if (player === aiSymbol) {
        let bestScore = -Infinity;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score > bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score < bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    }

    return moves[bestMove];
}

function checkWin(player) {
    return winningConditions.some(condition => 
        condition.every(index => board[index] === player)
    );
}

function checkWinForMinimax(newBoard, player) {
    return winningConditions.some(condition => 
        condition.every(index => newBoard[index] === player)
    );
}

function checkDraw() {
    return board.every(cell => cell !== null);
}

function highlightWin() {
    const winCondition = winningConditions.find(condition => 
        condition.every(index => board[index] === currentPlayer)
    );
    if (winCondition) {
        winCondition.forEach(index => {
            const cell = document.querySelector(`.cell[data-index="${index}"]`);
            cell.style.animation = 'winAnim 1s ease-in-out infinite alternate';
        });
    }
}

function endGame(message) {
    gameActive = false;
    updateStatus(message);
    clearInterval(timerInterval);
}

function updateStatus(message = `Current turn: ${currentPlayer}`) {
    document.getElementById('status').textContent = message;
}

function startTimer() {
    timeLeft = 10;
    document.getElementById('timer').textContent = `Time left: ${timeLeft}s`;
    timerInterval = setInterval(() => {
        timeLeft--;
        document.getElementById('timer').textContent = `Time left: ${timeLeft}s`;
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            if (gameMode === 'pvc' && currentPlayer === playerSymbol) {
                endGame(`${aiSymbol} wins! (Time out)`);
            } else if (gameMode === 'pvp') {
                currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
                updateStatus();
                resetTimer();
            }
        }
    }, 1000);
}

function resetTimer() {
    clearInterval(timerInterval);
    startTimer();
}

function restartGame() {
    board = Array(9).fill(null);
    currentPlayer = 'X';
    gameActive = true;
    document.getElementById('game').classList.add('hidden');
    document.getElementById('mode-selection').classList.remove('hidden');
    clearInterval(timerInterval);
    document.querySelectorAll('.cell').forEach(cell => {
        cell.style.animation = '';
    });
          }

// Game specific DOM Elements
let cells;
let statusMessage;
let restartButton;
let gameBoard;

// Game State
let boardState = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X'; // Human player
const aiPlayer = 'O';
const humanPlayer = 'X';
let gameActive = true;
let aiMode = 'random'; // Default AI mode: 'random', 'win' (minimax), 'lose'

const winningConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]             // Diagonals
];

// --- AI Mode Setup ---
function getAiModeFromURL() {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode');
    if (mode === 'win' || mode === 'lose' || mode === 'random') {
        return mode;
    }
    return 'random'; // Default if no valid mode is found
}

// --- Core Game Logic ---
function handleCellClick(event) {
    const clickedCell = event.target.closest('.cell');
    if (!clickedCell) return;

    const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));

    if (boardState[clickedCellIndex] !== '' || !gameActive || currentPlayer === aiPlayer) {
        return;
    }

    updateCellUI(clickedCell, clickedCellIndex, humanPlayer);
    boardState[clickedCellIndex] = humanPlayer;

    if (checkGameEnd(humanPlayer)) return;

    changePlayer(); // Switch to AI's turn

    // AI's turn
    if (gameActive && currentPlayer === aiPlayer) {
        if (gameBoard) gameBoard.style.pointerEvents = 'none'; // Disable board during AI's turn
        setTimeout(aiMove, 600); // AI "thinks" for a bit
    }
}

function updateCellUI(cellElement, index, player) {
    cellElement.textContent = player;
    cellElement.classList.remove('x', 'o', 'winning'); // Clear previous classes
    cellElement.classList.add(player.toLowerCase());
}

function changePlayer() {
    currentPlayer = currentPlayer === humanPlayer ? aiPlayer : humanPlayer;
    updateStatusMessage();
}

function updateStatusMessage() {
    if (!statusMessage) return;
    if (!gameActive) return; // Status message will be handled by win/draw condition

    // let modeText = "";
    // if (aiMode === 'win') modeText = " (AI: Hard)";
    // else if (aiMode === 'lose') modeText = " (AI: Easy - Helping You)";
    // else modeText = " (AI: Random)";
    
    modeText = " Thinking...";
    statusMessage.textContent = `Player ${currentPlayer}'s turn${currentPlayer === aiPlayer ? modeText : ''}`;
}


function checkGameEnd(player) {
    // This function checks for win/draw and updates UI and game state accordingly.
    // It's called after a player makes a move.
    const winnerInfo = evaluateBoard(boardState);

    if (winnerInfo.winner) {
        if (statusMessage) statusMessage.textContent = `Player ${winnerInfo.winner} has won!`;
        gameActive = false;
        if (winnerInfo.line) {
            winnerInfo.line.forEach(index => cells[index].classList.add('winning'));
        }
        if (gameBoard) gameBoard.style.pointerEvents = 'auto';
        return true;
    }

    if (winnerInfo.isDraw) {
        if (statusMessage) statusMessage.textContent = 'Game ended in a draw!';
        gameActive = false;
        if (gameBoard) gameBoard.style.pointerEvents = 'auto';
        return true;
    }
    return false; // Game not ended
}


function restartGame() {
    boardState = ['', '', '', '', '', '', '', '', ''];
    gameActive = true;
    currentPlayer = humanPlayer; // Human always starts
    updateStatusMessage();

    if (cells) {
        cells.forEach(cell => {
            cell.textContent = '';
            cell.classList.remove('x', 'o', 'winning');
        });
    }
    if (gameBoard) gameBoard.style.pointerEvents = 'auto';
}

// --- AI Move Logic ---
function aiMove() {
    if (!gameActive || currentPlayer !== aiPlayer) return;

    let moveIndex = -1;

    if (aiMode === 'win') {
        moveIndex = findBestMove(boardState);
    } else if (aiMode === 'lose') {
        moveIndex = findWorstMove(boardState);
    } else { // 'random' or default
        const availableCellsIndexes = boardState.map((cell, index) => cell === '' ? index : null).filter(index => index !== null);
        if (availableCellsIndexes.length > 0) {
            moveIndex = availableCellsIndexes[Math.floor(Math.random() * availableCellsIndexes.length)];
        }
    }

    if (moveIndex !== -1) {
        const aiCellElement = cells[moveIndex];
        updateCellUI(aiCellElement, moveIndex, aiPlayer);
        boardState[moveIndex] = aiPlayer;

        if (checkGameEnd(aiPlayer)) return;
        changePlayer(); // Switch to Human's turn
    }

    if (gameBoard) gameBoard.style.pointerEvents = 'auto'; // Re-enable board
}


// --- Minimax AI Functions ---

// Evaluates the board from AI's perspective ('O')
// Returns: { winner: 'X'/'O', line: winningLine (array) } or { isDraw: true } or {}
function evaluateBoard(currentBoard) {
    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        if (currentBoard[a] && currentBoard[a] === currentBoard[b] && currentBoard[a] === currentBoard[c]) {
            return { winner: currentBoard[a], line: winningConditions[i] };
        }
    }
    if (!currentBoard.includes('')) {
        return { isDraw: true };
    }
    return {}; // Game not over
}

function minimax(currentBoard, depth, isMaximizingPlayer) {
    const score = evaluateBoard(currentBoard);

    if (score.winner === aiPlayer) return 10 - depth; // AI wins
    if (score.winner === humanPlayer) return -10 + depth; // Human wins
    if (score.isDraw) return 0; // Draw

    const availableMoves = currentBoard.map((cell, index) => cell === '' ? index : null).filter(index => index !== null);

    if (isMaximizingPlayer) { // AI's turn (O) - wants to maximize score
        let bestScore = -Infinity;
        for (const move of availableMoves) {
            currentBoard[move] = aiPlayer;
            bestScore = Math.max(bestScore, minimax(currentBoard, depth + 1, false));
            currentBoard[move] = ''; // Backtrack
        }
        return bestScore;
    } else { // Human's turn (X) - wants to minimize AI's score
        let bestScore = Infinity;
        for (const move of availableMoves) {
            currentBoard[move] = humanPlayer;
            bestScore = Math.min(bestScore, minimax(currentBoard, depth + 1, true));
            currentBoard[move] = ''; // Backtrack
        }
        return bestScore;
    }
}

function findBestMove(currentBoard) {
    let bestScore = -Infinity;
    let move = -1;
    const availableMoves = currentBoard.map((cell, index) => cell === '' ? index : null).filter(index => index !== null);

    if (availableMoves.length === 9) { // If board is empty, pick center or corner for speed
      const strategicMoves = [4, 0, 2, 6, 8];
      return strategicMoves[Math.floor(Math.random() * strategicMoves.length)];
    }


    for (const currentMove of availableMoves) {
        currentBoard[currentMove] = aiPlayer;
        const score = minimax(currentBoard, 0, false); // Depth 0, next is human's turn (minimizing)
        currentBoard[currentMove] = ''; // Backtrack
        if (score > bestScore) {
            bestScore = score;
            move = currentMove;
        }
    }
    return move !== -1 ? move : availableMoves[0]; // Fallback if no move found (should not happen)
}

function findWorstMove(currentBoard) {
    let worstScoreForAI = Infinity; // AI wants to find a move that leads to the lowest score for itself
    let move = -1;
    const availableMoves = currentBoard.map((cell, index) => cell === '' ? index : null).filter(index => index !== null);

    if (availableMoves.length === 0) return -1; // Should not happen if game is active

    for (const currentMove of availableMoves) {
        currentBoard[currentMove] = aiPlayer; // AI makes a hypothetical move
        // Evaluate this move from AI's perspective (isMaximizingPlayer = false, because next turn is player's)
        const score = minimax(currentBoard, 0, false);
        currentBoard[currentMove] = ''; // Backtrack

        if (score < worstScoreForAI) {
            worstScoreForAI = score;
            move = currentMove;
        }
    }
     // If all moves lead to an immediate AI win (score 10), pick one that doesn't, if possible.
    // This simple heuristic makes "play to lose" more obvious.
    // A more sophisticated "play to lose" would ensure the player has a clear winning path.
    if (worstScoreForAI === 10 && availableMoves.length > 1) {
        // Try to find a move that is not an immediate win for AI
        for (const currentMove of availableMoves) {
            currentBoard[currentMove] = aiPlayer;
            const immediateEval = evaluateBoard(currentBoard);
            currentBoard[currentMove] = ''; // Backtrack
            if (immediateEval.winner !== aiPlayer) {
                return currentMove; // Found a non-winning move
            }
        }
    }


    return move !== -1 ? move : availableMoves[Math.floor(Math.random() * availableMoves.length)]; // Fallback to random if all moves are equally "bad" or only one move left
}


// --- Event Listeners and Initializations ---
document.addEventListener('DOMContentLoaded', function() {
    // Initialize DOM elements from js.js if they are used by game.js for theme/footer
    // This assumes js.js has already initialized `body`, `themeToggleButton`, `currentYearSpan`
    // If not, they should be initialized here as well for game.html context.
    // However, `js.js` is loaded and `defer` means it runs after HTML parsing.

    // Initialize game specific DOM Elements
    cells = document.querySelectorAll('.cell');
    statusMessage = document.getElementById('statusMessage');
    restartButton = document.getElementById('restartButton');
    gameBoard = document.getElementById('game-board');

    aiMode = getAiModeFromURL(); // Set AI mode based on URL

    // Add game event listeners
    if (cells) {
        cells.forEach(cell => {
            cell.addEventListener('click', handleCellClick);
        });
    }

    if (restartButton) {
        restartButton.addEventListener('click', restartGame);
    }

    // Initialize game status message
    restartGame(); // Call restart to set initial player and message correctly with AI mode
});

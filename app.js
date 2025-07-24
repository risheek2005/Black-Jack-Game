// Game state
let gameState = {
    userCards: [],
    computerCards: [],
    isGameOver: false,
    gamePhase: 'waiting', // 'waiting', 'dealing', 'playerTurn', 'dealerTurn', 'gameOver'
    dealerHidden: true
};

// Card deck values (same as Python)
const cardValues = [11, 2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 10, 10];

// Card suits and display mapping
const cardDisplay = {
    11: { value: 'A', suits: ['♠', '♥', '♦', '♣'] },
    2: { value: '2', suits: ['♠', '♥', '♦', '♣'] },
    3: { value: '3', suits: ['♠', '♥', '♦', '♣'] },
    4: { value: '4', suits: ['♠', '♥', '♦', '♣'] },
    5: { value: '5', suits: ['♠', '♥', '♦', '♣'] },
    6: { value: '6', suits: ['♠', '♥', '♦', '♣'] },
    7: { value: '7', suits: ['♠', '♥', '♦', '♣'] },
    8: { value: '8', suits: ['♠', '♥', '♦', '♣'] },
    9: { value: '9', suits: ['♠', '♥', '♦', '♣'] },
    10: { value: ['10', 'J', 'Q', 'K'], suits: ['♠', '♥', '♦', '♣'] }
};

// DOM elements
const elements = {
    gameStatus: document.getElementById('gameStatus'),
    dealerScore: document.getElementById('dealerScore'),
    playerScore: document.getElementById('playerScore'),
    dealerCards: document.getElementById('dealerCards'),
    playerCards: document.getElementById('playerCards'),
    newGameBtn: document.getElementById('newGameBtn'),
    hitBtn: document.getElementById('hitBtn'),
    standBtn: document.getElementById('standBtn'),
    resultModal: document.getElementById('resultModal'),
    resultTitle: document.getElementById('resultTitle'),
    resultMessage: document.getElementById('resultMessage'),
    playAgainBtn: document.getElementById('playAgainBtn')
};

// Convert Python deal_card function
function dealCard() {
    const card = cardValues[Math.floor(Math.random() * cardValues.length)];
    return card;
}

// Convert Python calculate_score function
function calculateScore(cards) {
    // Create a copy to avoid modifying original array
    let cardsCopy = [...cards];
    
    // Check for blackjack (21 with 2 cards)
    if (cardsCopy.reduce((sum, card) => sum + card, 0) === 21 && cardsCopy.length === 2) {
        return 0; // Blackjack
    }
    
    // Handle Ace conversion (11 to 1 when score > 21)
    while (cardsCopy.includes(11) && cardsCopy.reduce((sum, card) => sum + card, 0) > 21) {
        const aceIndex = cardsCopy.indexOf(11);
        cardsCopy[aceIndex] = 1;
    }
    
    return cardsCopy.reduce((sum, card) => sum + card, 0);
}

// Convert Python compare function
function compare(userScore, computerScore) {
    if (userScore === computerScore) {
        return "Draw 🙃";
    } else if (computerScore === 0) {
        return "Lose, opponent has Blackjack 😱";
    } else if (userScore === 0) {
        return "Win with a Blackjack 😎";
    } else if (userScore > 21) {
        return "You went over. You lose 😭";
    } else if (computerScore > 21) {
        return "Opponent went over. You win 😁";
    } else if (userScore > computerScore) {
        return "You win 😃";
    } else {
        return "You lose 😤";
    }
}

// Create visual card element
function createCardElement(cardValue, isHidden = false) {
    if (isHidden) {
        const cardBack = document.createElement('div');
        cardBack.className = 'card-back';
        return cardBack;
    }
    
    const card = document.createElement('div');
    card.className = 'card dealing';
    
    // Determine display value and suit
    let displayValue, suit, isRed = false;
    
    if (cardValue === 11) {
        displayValue = 'A';
        suit = cardDisplay[11].suits[Math.floor(Math.random() * 4)];
    } else if (cardValue === 10) {
        const faceCards = ['10', 'J', 'Q', 'K'];
        displayValue = faceCards[Math.floor(Math.random() * 4)];
        suit = cardDisplay[10].suits[Math.floor(Math.random() * 4)];
    } else {
        displayValue = cardValue.toString();
        suit = cardDisplay[cardValue].suits[Math.floor(Math.random() * 4)];
    }
    
    // Determine if card is red
    isRed = suit === '♥' || suit === '♦';
    
    if (isRed) {
        card.classList.add('red');
    }
    
    card.innerHTML = `
        <div class="card-value">${displayValue}</div>
        <div class="card-suit">${suit}</div>
        <div class="card-value" style="transform: rotate(180deg);">${displayValue}</div>
    `;
    
    return card;
}

// Update score displays
function updateScores() {
    const playerScoreValue = calculateScore(gameState.userCards);
    const dealerScoreValue = calculateScore(gameState.computerCards);
    
    // Display scores (show actual value instead of 0 for blackjack in UI)
    elements.playerScore.textContent = playerScoreValue === 0 ? '21' : playerScoreValue;
    
    if (gameState.dealerHidden && gameState.computerCards.length > 0) {
        // Only show score of visible dealer cards
        const visibleCards = gameState.computerCards.slice(0, 1);
        const visibleScore = calculateScore(visibleCards);
        elements.dealerScore.textContent = visibleScore === 0 ? '21' : visibleScore;
    } else {
        elements.dealerScore.textContent = dealerScoreValue === 0 ? '21' : dealerScoreValue;
    }
}

// Update game status message
function updateGameStatus(message) {
    elements.gameStatus.textContent = message;
}

// Show/hide buttons based on game phase
function updateButtons() {
    if (gameState.gamePhase === 'waiting') {
        elements.newGameBtn.classList.remove('hidden');
        elements.hitBtn.classList.add('hidden');
        elements.standBtn.classList.add('hidden');
    } else if (gameState.gamePhase === 'playerTurn') {
        elements.newGameBtn.classList.add('hidden');
        elements.hitBtn.classList.remove('hidden');
        elements.standBtn.classList.remove('hidden');
    } else {
        elements.newGameBtn.classList.add('hidden');
        elements.hitBtn.classList.add('hidden');
        elements.standBtn.classList.add('hidden');
    }
}

// Deal initial cards
function dealInitialCards() {
    gameState.gamePhase = 'dealing';
    updateGameStatus('Dealing cards...');
    updateButtons();
    
    // Clear previous cards
    elements.playerCards.innerHTML = '';
    elements.dealerCards.innerHTML = '';
    
    // Deal 2 cards to each player
    setTimeout(() => {
        // Player first card
        const playerCard1 = dealCard();
        gameState.userCards.push(playerCard1);
        elements.playerCards.appendChild(createCardElement(playerCard1));
        updateScores();
    }, 300);
    
    setTimeout(() => {
        // Dealer first card (visible)
        const dealerCard1 = dealCard();
        gameState.computerCards.push(dealerCard1);
        elements.dealerCards.appendChild(createCardElement(dealerCard1));
        updateScores();
    }, 600);
    
    setTimeout(() => {
        // Player second card
        const playerCard2 = dealCard();
        gameState.userCards.push(playerCard2);
        elements.playerCards.appendChild(createCardElement(playerCard2));
        updateScores();
    }, 900);
    
    setTimeout(() => {
        // Dealer second card (hidden)
        const dealerCard2 = dealCard();
        gameState.computerCards.push(dealerCard2);
        elements.dealerCards.appendChild(createCardElement(dealerCard2, true));
        
        // Check for immediate game end conditions
        const playerScore = calculateScore(gameState.userCards);
        const dealerScore = calculateScore(gameState.computerCards);
        
        if (playerScore === 0 || dealerScore === 0 || playerScore > 21) {
            gameState.isGameOver = true;
            revealDealerCard();
            endGame();
        } else {
            gameState.gamePhase = 'playerTurn';
            updateGameStatus('Your turn! Hit or Stand?');
            updateButtons();
        }
    }, 1200);
}

// Player hits (takes another card)
function playerHit() {
    const newCard = dealCard();
    gameState.userCards.push(newCard);
    elements.playerCards.appendChild(createCardElement(newCard));
    updateScores();
    
    const playerScore = calculateScore(gameState.userCards);
    if (playerScore > 21) {
        updateGameStatus('Busted! You went over 21');
        gameState.isGameOver = true;
        revealDealerCard();
        setTimeout(endGame, 1000);
    } else if (playerScore === 0) {
        updateGameStatus('Blackjack!');
        gameState.isGameOver = true;
        revealDealerCard();
        setTimeout(endGame, 1000);
    }
}

// Player stands
function playerStand() {
    gameState.gamePhase = 'dealerTurn';
    updateGameStatus('Dealer\'s turn...');
    updateButtons();
    
    revealDealerCard();
    setTimeout(dealerTurn, 1000);
}

// Reveal dealer's hidden card
function revealDealerCard() {
    gameState.dealerHidden = false;
    const hiddenCard = elements.dealerCards.querySelector('.card-back');
    if (hiddenCard) {
        hiddenCard.classList.add('flip');
        setTimeout(() => {
            const dealerCard = createCardElement(gameState.computerCards[1]);
            elements.dealerCards.replaceChild(dealerCard, hiddenCard);
            updateScores();
        }, 300);
    }
}

// Dealer's turn
function dealerTurn() {
    const dealerScore = calculateScore(gameState.computerCards);
    
    if (dealerScore !== 0 && dealerScore < 17) {
        updateGameStatus('Dealer hits...');
        setTimeout(() => {
            const newCard = dealCard();
            gameState.computerCards.push(newCard);
            elements.dealerCards.appendChild(createCardElement(newCard));
            updateScores();
            
            setTimeout(dealerTurn, 1000);
        }, 1000);
    } else {
        updateGameStatus('Dealer stands');
        setTimeout(endGame, 1000);
    }
}

// End game and show results
function endGame() {
    gameState.gamePhase = 'gameOver';
    gameState.isGameOver = true;
    
    const playerScore = calculateScore(gameState.userCards);
    const dealerScore = calculateScore(gameState.computerCards);
    
    const result = compare(playerScore, dealerScore);
    
    // Show result modal
    elements.resultTitle.textContent = 'Game Over';
    elements.resultMessage.textContent = result;
    elements.resultModal.classList.remove('hidden');
    
    updateGameStatus(result);
    updateButtons();
}

// Start new game
function startNewGame() {
    // Reset game state
    gameState = {
        userCards: [],
        computerCards: [],
        isGameOver: false,
        gamePhase: 'waiting',
        dealerHidden: true
    };
    
    // Reset displays
    elements.playerScore.textContent = '-';
    elements.dealerScore.textContent = '-';
    elements.playerCards.innerHTML = '';
    elements.dealerCards.innerHTML = '';
    elements.resultModal.classList.add('hidden');
    
    // Start dealing
    dealInitialCards();
}

// Event listeners
elements.newGameBtn.addEventListener('click', startNewGame);
elements.hitBtn.addEventListener('click', playerHit);
elements.standBtn.addEventListener('click', playerStand);
elements.playAgainBtn.addEventListener('click', startNewGame);

// Close modal when clicking outside
elements.resultModal.addEventListener('click', (e) => {
    if (e.target === elements.resultModal) {
        elements.resultModal.classList.add('hidden');
    }
});

// Initialize the game
updateButtons();
updateGameStatus('Welcome! Click "New Game" to start playing');
"use strict";

console.log("My first project");

// DOM Elements
const btnInit = document.querySelector(".btn-init");
const btnPlayers = document.querySelector(".btn-players");
const btnDeal = document.querySelector(".btn-deal");
const btnFlop = document.querySelector(".btn-flop");
const btnTurn = document.querySelector(".btn-turn");
const btnRiver = document.querySelector(".btn-river");
const btnEval = document.querySelector(".btn-eval");
const btnReset = document.querySelector(".btn-reset");
let textbox = document.querySelector(".textarea");

// Design a game of poker
// Implement logic of shuffling, distributing cards to 4 players plus house
// Implement logic of who wins
// Implement raise/calls, player rotation

// let deck = [{ suit: "Diamonds", rank: "Ace" }];

// Global variable/state
let deck = [];
let players = [];
let dealer;
let activePlayers;
let evalPlayer = [];
let gameState;

const gameStateArr = [
  "reset",
  "initGame",
  "setPlayers",
  "r1Deal",
  "bet1",
  "flop",
  "r2Deal",
  "turn",
  "bet2",
  "river",
  "bet3",
  "winner",
];

gameState = gameStateArr[0];

const handRanking = [
  "Royal flush",
  "Straight flush",
  "Four of a kind",
  "Full house",
  "Flush",
  "Straight",
  "Three of a kind",
  "Two pair",
  "Pair",
  "High Card",
];

// Diamonds, Spade, Hearts, Clubs
// Ace, 1-to-10, J, Q, K

// Hard code or generate cards? 52 cards
// For of loop

/*
// pseudocode for game state (can be an array), when game progresses gameState i++
// gameState = 'initGame'
// gameState = 'setPlayers'
// gameState = 'r1Deal'
// gameState = 'bet1'
// gameState = 'flop'
// gameState = 'r2Deal'
// gameState = 'turn'
// gameState = 'bet2'
// gameState = 'river'
// gameState = 'bet3'
// gameState = 'winner'
*/

console.log(gameStateArr);

function addTextBox(text) {
  textbox.value += text;
}

addTextBox("welcome!");

const resetGame = function () {
  gameState = gameStateArr[0];
  deck = [];
  players = [];
  activePlayers;
  dealer;
};

const suit = ["Clubs", "Diamonds", "Hearts", "Spades"];
const rank = [2, 3, 4, 5, 6, 7, 8, 9, 10, "Jack", "Queen", "King", "Ace"];

// Refactor for entire deck
const generateDeck = function (suit, rank) {
  for (let n = 0; n < suit.length; n++) {
    for (let i = 0; i < rank.length; i++) {
      deck.push({
        suit: suit[n],
        rank: rank[i],
        indexOfRank: rank.indexOf(rank[i]),
      });
    }
  }
};

// Fisher Yates Shuffle
// * source https://medium.com/swlh/the-javascript-shuffle-62660df19a5d

const fisYatesShuff = function () {
  let randomCard;
  let tempX;

  const shuffle = function () {
    for (let i = deck.length - 1; i > -1; i -= 1) {
      randomCard = Math.floor(Math.random() * i); // Generate random no using index
      tempX = deck[i]; // tempX is the last card, held temporarily
      deck[i] = deck[randomCard]; // changing position, random card is placed at the end of deck
      deck[randomCard] = tempX; // swap previous last card with random card, iterate through deck.length
    }
    return deck;
  };

  // double shuffle
  shuffle();
  shuffle();
  return deck;
};

// Player Class prototype
const PlayerCl = class {
  constructor(playerNo, hand) {
    this.playerNo = playerNo;
    this.hand = [];
  }

  showHand() {
    let playerHandArr = [];

    for (let i = 0; i < this.hand.length; i++) {
      let { rank: playerRank, suit: playerSuit } = this.hand[i];
      playerHandArr.push(` ${playerRank} of ${playerSuit}`);
    }

    console.log(`${this.playerNo} has ${playerHandArr}`);
    addTextBox(`\n${this.playerNo} has${playerHandArr}`);
    return playerHandArr;
  }
};

// Evaluate Class prototype
const Evaluate = class {
  constructor(player, cards, arrIndexOfRank, arrSuit, arrRank, result) {
    (this.player = player),
      (this.cards = []),
      (this.arrIndexOfRank = []),
      (this.arrSuit = []),
      (this.arrRank = []),
      (this.result = { bestHand: "start", resultRank: [], resultSuit: [] });
  }

  // METHODS
  findOutcomes() {
    this.findAll();
  }

  findAll() {
    let _player = this.player;
    let _arrRank = this.arrRank;
    let _arrSuit = this.arrSuit;
    let { resultRank, resultSuit } = this.result;
    let str = [];
    let ranking;

    let fourOfAKind = false;
    let threeOfAKind = false;
    let straight = 0;
    let count = 0;
    let flush = false;
    let fullHouse = false;
    let pairType = 0;

    const resetAll = function () {
      resultRank = [];
      resultSuit = [];
      str = [];
    };

    // findFourOfAKind
    this.arrRank.forEach((val, i, arr) => {
      if (val === arr[i + 1] && val === arr[i + 2] && val === arr[i + 3]) {
        fourOfAKind = true;
        for (let n = i; n < i + 4; n++) {
          // Place in string array
          str.push(`${_arrRank[n]} of ${_arrSuit[n]}`);

          // Push
          resultRank.push(`${_arrRank[n]}`);
          resultSuit.push(`${_arrSuit[n]}`);
        }
      } else {
        return;
      }
    });

    if (str.length === 4) {
      this.result.bestHand = handRanking[2];
      ranking = 3;
      return ranking;
    } else {
      resetAll();
    }

    // find full house
    for (let i = 0; i < this.arrRank.length; i++) {
      this.arrRank.forEach((val, i, arr) => {
        // find three similar cards
        if (val === arr[i + 1] && val === arr[i + 2]) {
          for (let n = i; n < i + 3; n++) {
            str.push(`${_arrRank[n]} of ${_arrSuit[n]}`);

            // Push
            resultRank.push(`${_arrRank[n]}`);
            resultSuit.push(`${_arrSuit[n]}`);
          }
        }

        // find pair
        if (val === arr[i + 1] && val !== arr[i + 2]) {
          for (let n = i; n < i + 2; n++) {
            str.push(`${_arrRank[n]} of ${_arrSuit[n]}`);

            // Push
            resultRank.push(`${_arrRank[n]}`);
            resultSuit.push(`${_arrSuit[n]}`);
          }
        }
      });
    }

    if (str.length === 5) {
      this.result.bestHand = handRanking[3];
      console.log(`${this.player} has FULL HOUSE ${[...str]}!`);
      fullHouse = true;
      ranking = 4;
      return ranking;
    } else {
      resetAll();
    }

    // find flush
    const arrSuitSorted = this.arrSuit.slice().sort();
    arrSuitSorted.forEach((val, i, arr) => {
      if (
        val === val[i + 1] &&
        val === val[i + 2] &&
        val === val[i + 3] &&
        val === val[i + 4]
      ) {
        flush = true;
      }

      if (flush === true) str.push(`${val}`);
    });
    if (flush === true) {
      this.result.bestHand = handRanking[4];
      console.log(`${this.player} has A ${[str]} FLUSH !`);
      ranking = 5;
      return ranking;
    } else {
      resetAll();
    }

    // findStraight
    this.arrRank.forEach((val, i, arr) => {
      let plus;

      for (let n = 1; n < 5; n++) {
        plus = arr[i + n] - n;

        if (val === plus) {
          count += 1;
          // straight = 1;
        } else {
          return;
        }
      }

      if (count == 4) straight = 1;

      if (val === 8 && count === 4) {
        straight = 2;
      }

      if (straight !== 0) {
        for (let y = i; y < i + 5; y++) {
          str.push(` ${_arrRank[y]} of ${_arrSuit[y]}`);

          // Push
          resultRank.push(`${_arrRank[y]}`);
          resultSuit.push(`${_arrSuit[y]}`);
        }
      }
    });
    if (straight === 1) {
      this.result.bestHand = handRanking[5];
      console.log(`${this.player} has STRAIGHTS${[...str]}`);
      ranking = 6;
      return ranking;
    } else {
      resetAll();
    }

    // findThreeofAKind
    for (let i = 0; i < 5; i++) {
      this.arrRank.forEach((val, i, arr) => {
        if (val === arr[i + 1] && val === arr[i + 2]) {
          threeOfAKind = true;

          for (let n = i; n < i + 3; n++) {
            str.push(`${_arrRank[n]} of ${_arrSuit[n]}`);

            // Push
            resultRank.push(`${_arrRank[n]}`);
            resultSuit.push(`${_arrSuit[n]}`);
          }
        } else {
          return;
        }
      });
    }
    if (str.length === 3) {
      this.result.bestHand = handRanking[6];
      console.log(`${this.player} has THREE OF A KIND ${[...str]}!`);
      ranking = 7;
      return ranking;
    } else {
      resetAll();
    }

    // findPairs
    this.arrRank.forEach(function (val, i, arr) {
      if (val === arr[i + 1] && val !== arr[i + 2]) {
        for (let n = i; n < i + 2; n++) {
          str.push(`${_arrRank[n]} of ${_arrSuit[n]}`);

          // Push
          resultRank.push(`${_arrRank[n]}`);
          resultSuit.push(`${_arrSuit[n]}`);
        }
      } else {
        return;
      }
    });

    if (str.length === 4) {
      this.result.bestHand = handRanking[7];
      console.log(`${_player} has TWO PAIRS ${[...str]}!`);
      pairType = 2;
      ranking = 8;
      return ranking;
    }
    if (str.length === 6) {
      str.splice(0, 2);

      this.result.bestHand = handRanking[7];
      console.log(
        `${_player} has THREE PAIRS the highest TWO PAIRS are ${[...str]}!`
      );
      pairType = 2;
      ranking = 8;
      return ranking;
    }
    if (str.length === 2) {
      this.result.bestHand = handRanking[8];
      console.log(`${_player} has PAIRS ${[...str]}!`);
      pairType = 1;
      ranking = 9;
      return ranking;
    }
    if (str.length === 0) {
      this.result.bestHand = handRanking[9];
      console.log(`${_player} has NO PAIRS, find highest card`);
      this.findHighest();
      ranking = 10;
      return ranking;
    }

    // return ranking;
  }

  findHighest() {
    const highestCard = `${this.arrRank[6]} of ${this.arrSuit[6]}`;
    console.log(`${this.player}'s highest card is ${highestCard}`);
  }
};

// Initialize dealer class
const initDealer = function () {
  dealer = new (class {
    constructor(hand) {
      this.hand = [];
    }
    // Method
    showHand() {
      // Empty array to store string results of dealer's hand
      let dealerHandStrArr = [];

      for (let i = 0; i < dealer.hand.length; i++) {
        // Deconstruct hand
        let { rank: dealerRank, suit: dealerSuit } = dealer.hand[i];

        // Push results to array
        dealerHandStrArr.push(` ${dealerRank} of ${dealerSuit}`);
      }
      console.log(`Dealer has${dealerHandStrArr}`);
      addTextBox(`\nDealer has${dealerHandStrArr}`);
    }
  })();
};

// Initialize number of players
const initPlayers = function (nPlayers) {
  // Initialize n number of players
  for (let i = 0; i < nPlayers; i++) {
    players[i] = new PlayerCl(`Player ${i + 1}`);
  }

  addTextBox(`\n${nPlayers} players initialized`);
};

// Deal cards to players
const dealCard = function (activePlayers) {
  // put card into player and delete card

  for (let i = 0; i < activePlayers; i++) {
    let player = players[i];
    player.hand.push(deck[0]);
    deck.splice(0, 1);
  }
};

// Dealer flop
const dealerFlop = function () {
  // take 3 cards from deck and put in dealers hand

  dealer.hand.push(deck[0], deck[1], deck[2]);
  deck.splice(0, 3);
};

// Dealer Turn
const dealerTurn = function () {
  // take 3 cards from deck and put in dealers hand

  dealer.hand.push(deck[0]);
  deck.splice(0, 1);
};

// Dearler River
const dealerRiver = function () {
  dealerTurn();
};

// To initialize game, generate deck and shuffle
const initGame = function () {
  if (gameState === gameStateArr[0]) {
    addTextBox("\nInitializing game");
    generateDeck(suit, rank);

    fisYatesShuff();
    console.log("Shuffling deck...");

    let counter = 3;

    const countdown = setInterval(function () {
      console.log(counter);
      counter--;
      addTextBox(".");

      if (counter < 1) {
        addTextBox("\nDone, lets play!\nSelect number of players");
        clearInterval(countdown);
      }
    }, 1000);

    console.log(deck);

    // Change game state after initialization
    gameState = gameStateArr[1];
  } else {
    console.error(`Can't initialize game! Please reset!`);
  }
};

const evaluateCards = function () {
  // Implement as object instead

  // create new object and concat with dealer's hand
  for (let i = 0; i < players.length; i++) {
    evalPlayer[i] = new Evaluate(players[i].playerNo, [], [], {});
  }

  // push hands into evalPlayer.cards
  for (let i = 0; i < players.length; i++) {
    for (let n = 0; n < players[i].hand.length; n++) {
      evalPlayer[i].cards.push(players[i].hand[n]);
    }
    evalPlayer[i].cards.push(...dealer.hand);
  }

  // sort ascending to indexOfRank
  for (let i = 0; i < players.length; i++) {
    evalPlayer[i].cards.sort(function (a, b) {
      return a.indexOfRank - b.indexOfRank;
    });
  }

  // make new array just for index
  for (let i = 0; i < players.length; i++) {
    for (let n = 0; n < evalPlayer[i].cards.length; n++) {
      const { suit, rank, indexOfRank } = evalPlayer[i].cards[n];
      evalPlayer[i].arrIndexOfRank.push(indexOfRank);
      evalPlayer[i].arrSuit.push(suit);
      evalPlayer[i].arrRank.push(rank);
    }
  }

  console.log(evalPlayer[0], evalPlayer[1], evalPlayer[2], evalPlayer[3]);
};

// DOM
btnInit.addEventListener("click", initGame);

btnPlayers.addEventListener("click", function () {
  if (gameState === gameStateArr[1]) {
    // Initialize dealer
    initDealer();

    // Select number of players
    let numPlayers;

    // Function to check validitity of returned value for number of players
    function checkValue() {
      numPlayers = Number(prompt("How many players? (1 - 4)", "4"));

      // check if value in prompt is valid/true
      if (Number.isInteger(numPlayers) && numPlayers >= 1 && numPlayers <= 4) {
        // Initilize number of players
        initPlayers(numPlayers);

        // Set activePlayers global state
        activePlayers = numPlayers;
      } else {
        checkValue();
      }
    }

    // Call function
    checkValue();

    // Change game state to setPlayers
    gameState = gameStateArr[2];
  } else {
    console.error(`There is an existing game in progress! Please reset!`);
  }
});

btnDeal.addEventListener("click", function () {
  if (gameState === gameStateArr[2]) {
    // Needs gameState

    // Check which stage of the game is at
    // First deal, initial number of players get dealt two cards
    dealCard(activePlayers);
    dealCard(activePlayers);

    for (let i = 0; i < players.length; i++) {
      players[i].showHand();
    }
    gameState = gameStateArr[3];
  } else {
    console.error(`There is an existing game in progress! Please reset!`);
  }
});

btnFlop.addEventListener("click", function () {
  if (gameState === gameStateArr[3]) {
    dealerFlop();
    console.log(dealer.hand);
    dealer.showHand();

    // Skip from 3 to 5, no bets
    gameState = gameStateArr[5];
  } else {
    console.error(`There is an existing game in progress! Please reset!`);
  }
});

btnTurn.addEventListener("click", function () {
  if (gameState === gameStateArr[5]) {
    dealerTurn();
    console.log(dealer.hand);
    dealer.showHand();

    // Skip from 5 to 7, no bets

    gameState = gameStateArr[7];
  } else {
    console.error(`There is an existing game in progress! Please reset!`);
  }
});

btnRiver.addEventListener("click", function () {
  if (gameState === gameStateArr[7]) {
    dealerRiver();
    console.log(dealer.hand);
    dealer.showHand();

    // Skip from 7 to 9, no bets

    gameState = gameStateArr[9];
  } else {
    console.error(`There is an existing game in progress! Please reset!`);
  }
});

btnEval.addEventListener("click", function () {
  if (gameState === gameStateArr[9]) {
    evaluateCards();

    const playerArr = [];
    for (let i = 0; i < evalPlayer.length; i++) {
      playerArr.push(evalPlayer[i]);
      const score = evalPlayer[i].findAll();
      console.log(`${evalPlayer[i].player} has a ranking of ${score}`);
      addTextBox(
        `\n${evalPlayer[i].player} has a ranking of ${score} ${evalPlayer[i].result.bestHand}`
      );
    }

    console.log(playerArr);
    addTextBox("\nLowest rank number wins");
    // Skip from 9 to 11, no bets
    gameState = gameStateArr[11];
  } else {
    console.error(`There is an existing game in progress! Please reset!`);
  }
});

btnReset.addEventListener("click", function () {
  resetGame();
  console.log("Game reset, please initialize game to play!");
});

console.log(handRanking);

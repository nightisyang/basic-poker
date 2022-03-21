"use strict";

console.log("My first project");

// DOM Elements
const btnInit = document.querySelector(".btn-init");
const btnPlayers = document.querySelector(".btn-players");
const btnDeal = document.querySelector(".btn-deal");
const btnFlop = document.querySelector(".btn-flop");
const btnTurn = document.querySelector(".btn-turn");
const btnRiver = document.querySelector(".btn-river");
const btnReset = document.querySelector(".btn-reset");

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

let gameState = gameStateArr[0];

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

const resetGame = function () {
  gameState = gameStateArr[0];
  deck = [];
  players = [];
  activePlayers;
  dealer;
};

const suit = ["Diamonds", "Spade", "Hearts", "Clubs"];
const rank = ["Ace", 2, 3, 4, 5, 6, 7, 8, 9, 10, "Jack", "Queen", "King"];

// const generateCards = function (suit, rank) {
//   for (let i = 0; i < suit.length; ++i) {
//     deck.push({ suit: suit[i] });
//   }
// };

// generateCards(suit, rank);
// console.log(deck);

// Generate a full suit A-K for each suit
// Write code to loop over 1 suit (Diamonds), then refactor

// const generateFullSuit = function (rank) {
//   for (let i = 0; i < rank.length; i++) {
//     deck.push({ suit: "Diamonds", rank: rank[i] });
//   }
// };

// generateFullSuit(rank);
// console.log(deck);

// Refactor for entire deck
const generateDeck = function (suit, rank) {
  for (let n = 0; n < suit.length; n++) {
    for (let i = 0; i < rank.length; i++) {
      deck.push({ suit: suit[n], rank: rank[i] });
    }
  }
};

/*
//Shuffle, take in deck array, generate random number, destructure deck[random] and place into shuffledDeck
// const shuffle = function (deck) {
// // Generate 52 random numbers

// let randArr = [];

// for (let i = 0; i < 51; i++ ){
//   randArr.push(Math.random)
// }

// };

/*
let randArr = [];

const fillArr = function () {
  // if array is filled, then return
  if (randArr.length === 52) {
    return;
  }

  // function to generate random integer generator between 0 - 51
  const randomIntGen = function () {
    return (Math.random() * 51).toFixed();
  };

  // call function and assign value to random
  let random = Number(randomIntGen());

  // If value is not in array, then push to value array
  if (!randArr.includes(random)) {
    randArr.push(random);
  }

  // while array isn't filled, re-run function
  // recursive loop until condition is satisfied
  while (randArr.length < 52) {
    fillArr();
  }
};

fillArr();
console.log(randArr);

const playDeck = function () {
  // Create empty array with empty values
  const emptyArr = Array(52).fill(undefined);

  // goes through each element in randArr, takes that value and uses that as the new index no for deck and added into emptyArr
  randArr.forEach(function (element, index) {
    emptyArr[element] = deck[index];
  });

  // Place deck using randArr index into emptyArr
  // for (let i = 52; i >= 0; --i) {
  //   emptyArr.splice(randArr[i], 1, deck[i]);
  // }

  return emptyArr;
};

console.log(playDeck());
// The previous logic is based on my experience to randomize sequence of numbers from excel
// Generate rand() column, sort big to small
// Computationally expensive as the probability to generate unique numbers will be harder over time
*/

// Fisher Yates Shuffle
// * source https://medium.com/swlh/the-javascript-shuffle-62660df19a5d

const fisYatesShuff = function () {
  let randomCard;
  let tempX;
  for (let i = deck.length - 1; i > -1; i -= 1) {
    randomCard = Math.floor(Math.random() * i); // Generate random no using index
    tempX = deck[i]; // tempX is the last card, held temporarily
    deck[i] = deck[randomCard]; // changing position, random card is placed at the end of deck
    deck[randomCard] = tempX; // swap previous last card with random card, iterate through deck.length
  }
  return deck;
};

// Player Class prototype
const PlayerCl = class {
  constructor(playerNo, hand) {
    this.playerNo = playerNo;
    this.hand = [];
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
        dealerHandStrArr.push(`${dealerRank} of ${dealerSuit}`);
      }
      console.log(`Dealer has ${dealerHandStrArr}`);
    }
  })();
};

// Initialize number of players
const initPlayers = function (nPlayers) {
  // Initialize n number of players
  for (let i = 0; i < nPlayers; i++) {
    players[i] = new PlayerCl(`player ${i + 1}`);
  }

  console.log(`${nPlayers} players initialized`);
};

// Show dealers hand

/*
// Distribute cards to players plus house
// Player class, cards in hand
// Remove top card playDeck[0], burn
// deal take cards and add to players
// remove, add to player 1
// remove, add to player 2
// remove, add to player 3
// remove, add to player 4
// repeat deal
// bet, implement later
// flop
// turn
// river

// Deal, take deck[0], add to player1.hand.push, delete from deck[0].remove - rotate

// Object destructuring
*/

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
    generateDeck(suit, rank);

    fisYatesShuff();
    console.log("Shuffling deck...");

    let counter = 3;

    const countdown = setInterval(function () {
      console.log(counter);
      counter--;

      if (counter < 0) {
        console.log("Done, lets play!");
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
      numPlayers = Number(prompt("How many players? (1 - 4)"));

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
    console.log(...players);
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

btnReset.addEventListener("click", function () {
  resetGame();
  console.log("Game reset, please initialize game to play!");
});

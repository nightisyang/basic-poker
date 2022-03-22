"use strict";

console.log("My first project");

// DOM Elements
const btnInit = document.querySelector(".btn-init");
const btnPlayers = document.querySelector(".btn-players");
const btnDeal = document.querySelector(".btn-deal");
const btnFlop = document.querySelector(".btn-flop");
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
      deck.push({
        suit: suit[n],
        rank: rank[i],
        indexOfRank: rank.indexOf(rank[i]),
      });
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
  constructor(player, cards, arrIndexOfRank, arrSuit, arrRank) {
    (this.player = player),
      (this.cards = []),
      (this.arrIndexOfRank = []),
      (this.arrSuit = []),
      (this.arrRank = []);
  }

  // METHODS
  findOutcomes() {
    // let indexArr = [];
    // let emptyArr = [];
    // let decon = this.cards[0]; // <----- because of how the array was constructed
    // for (let i = 0; i < decon.length; i++) {
    //   const { suit, rank, indexOfRank } = decon[i];
    //   this.arrindexOfRank.push(indexOfRank);
    // }

    this.findStraight();
    this.findFlush();
    this.findRankDuplicates();
    this.findFourOfAKind();
    this.findThreeOfAKind();
  }

  findFourOfAKind() {
    let cardCompare = [[], [], [], []];
    let fourOfAKind;

    // Four frames cards [0 to 3], [1 to 4], [2 to 5], [3 to 6]. Frame [4 to 7] only has 3 cards
    for (let i = 0; i < 4; i++) {
      // compare initial card to other card, return value to card1to2 etc
      for (let n = i + 1; n < i + 4; n++)
        if (this.arrRank[i] !== this.arrRank[n]) {
          cardCompare[i].push(false);
        } else if (this.arrRank[i] === this.arrRank[n]) {
          cardCompare[i].push(true);
        }
      // && this.arrRank[i] === this.arrRank[i + 2] &&  this.arrRank[i] === this.arrRank[i + 3])
    }
    // console.error("Four of a kind");
    // console.log(cardCompare);

    for (let i = 0; i < cardCompare.length; i++) {
      let frame = cardCompare[i];
      if (frame.includes(false) === false) {
        console.log(
          `${this.player} has four of a kind in ${this.arrRank[i]} of ${
            this.arrSuit[i]
          }, ${this.arrRank[i + 1]} of ${this.arrSuit[i + 1]}, ${
            this.arrRank[i + 2]
          } of ${this.arrSuit[i + 2]} and ${this.arrRank[i + 4]} of ${
            this.arrSuit[i + 4]
          }`
        );
      }
    }

    // console.log(cardCompare);
    // console.log(fourOfAKind);
  }

  findThreeOfAKind() {
    let cardCompare = [[], [], [], [], []];
    let threeOfAKind;

    // Five frames cards [0 to 2], [1 to 3], [2 to 4], [3 to 5] [4 to 7]
    for (let i = 0; i < 5; i++) {
      // compare initial card to other card, return value to card1to2 etc
      for (let n = i + 1; n < i + 3; n++)
        if (this.arrRank[i] !== this.arrRank[n]) {
          cardCompare[i].push(false);
        } else if (this.arrRank[i] === this.arrRank[n]) {
          cardCompare[i].push(true);
        }
      // && this.arrRank[i] === this.arrRank[i + 2] &&  this.arrRank[i] === this.arrRank[i + 3])
    }
    // console.error("Three of a kind");
    // console.log(cardCompare);

    for (let i = 0; i < cardCompare.length; i++) {
      let frame = cardCompare[i];
      if ((frame[0] && frame[1]) === true) {
        console.log(
          `${this.player} has three of a kind in ${this.arrRank[i]} of ${
            this.arrSuit[i]
          }, ${this.arrRank[i + 1]} of ${this.suit[i + 1]}, ${
            this.arrRank[i + 2]
          } of ${this.arrSuit[i + 2]}`
        );
      }
    }
  }

  findStraight() {
    // Search through array if all 5 numbers are continuous

    let straight;

    for (let i = 0; i < this.arrIndexOfRank.length - 1; i++) {
      if (this.arrIndexOfRank[i] + 1 !== this.arrIndexOfRank[i + 1]) {
        straight = false;
        return;
        // return console.log(
        //   `${this.player} doesn't have a straight! ${[...this.arrRank]}`
        // );
      } else if (this.arrIndexOfRank[i] + 1 === this.arrIndexOfRank[i + 1]) {
        straight = true;
      }
    }

    if ((straight = true)) {
      console.log(`${this.player} has a straight! ${[...this.arrRank]}`);
    }
  }

  findFlush() {
    let flush;

    for (let i = 0; i < this.arrSuit.length; i++) {
      if (this.arrSuit[0] !== this.arrSuit[i]) {
        flush = false;
        // console.log(`${this.player} doesn't have a flush ${[...this.arrSuit]}`);
        return;
      } else if (this.arrSuit[0] === this.arrSuit[i]) {
        flush = true;
      }
    }

    if ((flush = true)) {
      console.log(`${this.player} has a flush ${[...this.arrSuit]}`);
    }
  }

  findRankDuplicates() {
    const makeSet = new Set(this.arrRank);
    // console.log(...makeSet);

    const cardDiff = this.arrSuit.length - makeSet.size;

    if (cardDiff === 0) {
      console.log(`${this.player} doesn't have any rank pair`);
    } else if (cardDiff === 1) {
      console.log(`${this.player} has ${cardDiff} rank pair`);
    } else if (cardDiff === 2) {
      console.log(`${this.player} has ${cardDiff} rank pair`);
    } else if (cardDiff === 3) {
      console.log(`${this.player} has ${cardDiff} rank pair`);
    }

    let cardCompare = [[], [], [], [], [], []];
    let twoOfAKind;

    // Six frames cards [0 to 1], [1 to 2], [2 to 3], [3 to 4], [4 to 5], [5 to 6]
    for (let i = 0; i < 6; i++) {
      // compare initial card to other card, return value to card1to2 etc
      for (let n = i + 1; n < i + 2; n++)
        if (this.arrRank[i] !== this.arrRank[n]) {
          cardCompare[i].push(false);
        } else if (this.arrRank[i] === this.arrRank[n]) {
          cardCompare[i].push(true);
        }
    }
    // console.error("Two of a kind");
    // console.log(cardCompare);

    for (let i = 0; i < cardCompare.length; i++) {
      let frame = cardCompare[i];
      if (frame[0] === true) {
        console.log(
          `${this.player} has two of a kind in ${this.arrRank[i]} of ${
            this.arrSuit[i]
          } ${this.arrRank[i + 1]} of ${this.arrSuit[i + 1]}`
        );
      }
    }

    // for (let i = 0; i < cardCompare.length; i++) {
    //   if (cardCompare[i].includes(true) === true) {
    //     console.error(
    //       `${this.player} has ${this.arrRank[i]} of ${this.arrSuit[i]} pair`
    //     );
    //     //   return;
    //     // } else console.error(`${this.player} HAS TWOOOOO OF A KIND!`);
    //   }
    // }
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

  console.log(`${nPlayers} players initialized`);
};

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

const dealCard = function (activePlayers) {
  // put card into player and delete card

  for (let i = 0; i < activePlayers; i++) {
    let player = players[i];
    player.hand.push(deck[0]);
    deck.splice(0, 1);
  }
};

const dealerFlop = function () {
  // take 3 cards from deck and put in dealers hand

  dealer.hand.push(deck[0], deck[1], deck[2]);
  deck.splice(0, 3);
};

const dealerTurn = function () {
  // take 3 cards from deck and put in dealers hand

  dealer.hand.push(deck[0]);
  deck.splice(0, 1);
};

const dealerRiver = dealerTurn;

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

//                $$\                 $$\                     $$\
//                \__|                $$ |                    \__|
//  $$\  $$\  $$\ $$\ $$$$$$$\        $$ | $$$$$$\   $$$$$$\  $$\  $$$$$$$\
//  $$ | $$ | $$ |$$ |$$  __$$\       $$ |$$  __$$\ $$  __$$\ $$ |$$  _____|
//  $$ | $$ | $$ |$$ |$$ |  $$ |      $$ |$$ /  $$ |$$ /  $$ |$$ |$$ /
//  $$ | $$ | $$ |$$ |$$ |  $$ |      $$ |$$ |  $$ |$$ |  $$ |$$ |$$ |
//  \$$$$$\$$$$  |$$ |$$ |  $$ |      $$ |\$$$$$$  |\$$$$$$$ |$$ |\$$$$$$$\
//   \_____\____/ \__|\__|  \__|      \__| \______/  \____$$ |\__| \_______|
//                                                  $$\   $$ |
//                                                  \$$$$$$  |
//                                                   \______/

// Compare players hand in combination with dealer's hand
// Make new array combining player and dealer's cards
// Make some scores, highest points win

// ** Source: https://www.cardplayer.com/rules-of-poker/hand-rankings ** //
// Royal flush A, K, Q, J, 10, all the same suit.
// Straight flush Five cards in a sequence, all in the same suit.
// Four of a kind All four cards of the same rank.
// Full house Three of a kind with a pair.
// Flush Any five cards of the same suit, but not in a sequence.
// Straight Five cards in a sequence, but not of the same suit.
// Three of a kind Three cards of the same rank.
// Two pair Two different pairs.
// Pair Two cards of the same rank.
// High Card When you haven't made any of the hands above, the highest card plays. In the example below, the jack plays as the highest card.

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

// Sequence and pairs lastly, highest card
// For each player, what is the best combo - then compare that combo with other players
// Are there any seqence? How many card are in sequence?  Are the cards all in the same suit? Are there any pairs?
// Rearrange players hand in an array of [rank] and [suit] instead of [card]
// Then sort cards, check if there are any sequential ranks, check if there are pairs/duplicates

const evaluateCards = function () {
  // Implement as object instead

  // create new object and concat with dealer's hand
  for (let i = 0; i < players.length; i++) {
    evalPlayer[i] = new Evaluate(players[i].playerNo, [], []);
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
// sort cards, remmeber to have [suit] sorted accordingly
//check if cards are in sequence or any pairs  are present
// return player score according to handRanking

//************************************************//
//************************************************//
//************************************************//

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

btnEval.addEventListener("click", function () {
  if (gameState === gameStateArr[9]) {
    evaluateCards();

    for (let i = 0; i < evalPlayer.length; i++) {
      evalPlayer[i].findOutcomes();
    }
    addTextBox("\nCard evaluation logic still under construction");
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

const arrflushTest = ["Clubs", "Clubs", "Clubs", "Clubs", "Clubs"];

const findFlush = function () {
  let flush;

  for (let i = 0; i < arrflushTest.length; i++) {
    if (arrflushTest[0] !== arrflushTest[i]) {
      flush = false;
      console.log(`Test array doesn't have a flush ${[...arrflushTest]}`);
      return;
    } else if (arrflushTest[0] === arrflushTest[i]) {
      flush = true;
    }
  }

  if ((flush = true)) {
    console.log(`Test array has a flush ${[...arrflushTest]}`);
  }
};

findFlush();

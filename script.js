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
const btnTurbo = document.querySelector(".btn-turbo");

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
let stalePlayer = [];

// for testing purposes
// let globalStalemate = false;
// let globalRoyalFlush = false;
let globalFourOfAKind = false;
// let globalStraightFlush = false;
// let globalFlush = false;
// let globalFullHouse = false;
// let globalStraight = false;

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
  evalPlayer = [];
  stalePlayer = [];
  globalFourOfAKind = false;
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
  constructor(
    player,
    playerInitIndex,
    cards,
    arrIndexOfRank,
    arrSuit,
    arrRank,
    result
  ) {
    this.player = player;
    this.playerInitIndex = playerInitIndex;
    this.cards = [];
    this.arrIndexOfRank = [];
    this.arrSuit = [];
    this.arrRank = [];
    this.result = {
      bestHand: 11,
      resultIndexRank: [],
      resultRank: [],
      resultSuit: [],
      ogIndex: [],
      finalFive: { finalRank: [], finalSuit: [], finalRankIdx: [] },
    };
  }

  // METHODS
  findOutcomes() {
    this.findAll();
    this.finalFive();
  }

  findAll() {
    // Layout of function is
    // Find this pattern/arrangement of cards, and log into a str
    // If length of string is equals to number of expected cards, log and return results
    let _player = this.player;
    let _arrRank = this.arrRank;
    let _arrSuit = this.arrSuit;
    let _arrIndexOfRank = this.arrIndexOfRank;
    let { bestHand, resultIndexRank, resultRank, resultSuit, ogIndex } =
      this.result;
    let str = [];
    let ranking;

    let fourOfAKind = false;
    let threeOfAKind = false;
    let straight = 0;
    let count = 0;
    let flush = false;
    let royalFlush = false;
    let straightFlush = false;
    let fullHouse = false;
    let pair = false;
    let pairType = 0;

    const pushStrNArr = function (n) {
      // Place in string array
      str.push(`${_arrRank[n]} of ${_arrSuit[n]}`);

      // Push
      resultIndexRank.push(_arrIndexOfRank[n]);
      resultRank.push(_arrRank[n]);
      resultSuit.push(_arrSuit[n]);
      ogIndex.push(n);
    };

    const spliceErrors = function (startNo, noOfCards) {
      str.splice(startNo, noOfCards);
      resultIndexRank.splice(startNo, noOfCards);
      resultRank.splice(startNo, noOfCards);
      resultSuit.splice(startNo, noOfCards);
      ogIndex.splice(startNo, noOfCards);
    };

    // findFourOfAKind
    this.arrRank.forEach((val, i, arr) => {
      if (val === arr[i + 1] && val === arr[i + 2] && val === arr[i + 3]) {
        fourOfAKind = true;
        globalFourOfAKind = true;

        for (let n = i; n < i + 4; n++) {
          pushStrNArr(n);
        }
      }
    });

    // log if conidtions for four of a kind is found
    if (fourOfAKind === true) {
      this.result.bestHand = 2;
      console.log(`${this.player} has FOUR OF A KIND ${[...str]}!`);
      return;
    }

    // find full house

    if (fourOfAKind !== true) {
      let startIndex3Kind;

      this.arrRank.forEach((val, i, arr) => {
        // two parts first find 3 of a kind, second part find pair

        // first part - find three similar cards
        if (val === arr[i + 1] && val === arr[i + 2]) {
          startIndex3Kind = i;
          threeOfAKind = true;
          for (let n = i; n < i + 3; n++) {
            pushStrNArr(n);
          }
        } else {
          return;
        }
      });

      // second part - find pair, ignore if start index is the same as 3 of a kind, will lead to duplicate
      this.arrRank.forEach((val, i, arr) => {
        if (
          threeOfAKind === true &&
          val === arr[i + 1] &&
          val !== arr[i + 2] &&
          i !== startIndex3Kind + 1
        ) {
          for (let n = i; n < i + 2; n++) {
            pushStrNArr(n);
          }
          fullHouse = true;
        }
      });
    }

    // log if conidtions for straight is found - logic for 3 of a kind overlaps, if str.length = 3
    if (threeOfAKind === true && str.length === 3) {
      this.result.bestHand = 6;
      console.log(`${this.player} has THREE OF A KIND ${[...str]}!`);
      return;
    }

    // log if conidtions for full house is found
    if (fullHouse === true && str.length === 5) {
      // globalFullHouse = true;
      this.result.bestHand = 3;
      console.log(`${this.player} has FULL HOUSE ${[...str]}!`);
      fullHouse = true;
      return;
    }

    // find flush

    // for (let i = 0; i < players.length; i++) {
    //   evalPlayer[i].cards.sort(function (a, b) {
    //     return a.this.arrSuit - b.indexOfRank;
    //   });
    // }
    // clearPushStrNArr();

    let flushIdx = [];
    str = [];

    for (let i = 0; i < suit.length; i++) {
      // clearPushStrNArr();
      // flushIdx = [];

      // for (let n = 0; n < this.arrSuit.length; n++)
      this.arrSuit.forEach(function (val, n) {
        if (val === suit[i]) flushIdx.push(n);
      });

      if (flushIdx < 5) flushIdx = [];

      if (flushIdx.length < 5) {
        flushIdx = [];
      }

      if (flushIdx.length === 5) {
        flush = true;
        // globalFlush = true;

        this.result.bestHand = 4;

        flushIdx.forEach((val) => {
          pushStrNArr(val);
        });

        break;
      }

      if (flushIdx.length === 6) {
        flush = true;
        // globalFlush = true;

        this.result.bestHand = 4;

        flushIdx.splice(0, 1);
        flushIdx.forEach((val) => {
          pushStrNArr(val);
        });

        break;
      }

      if (flushIdx.length === 7) {
        flush = true;
        // globalFlush = true;

        this.result.bestHand = 4;

        flushIdx.splice(0, 2);
        flushIdx.forEach((val) => {
          pushStrNArr(val);
        });

        break;
      }
    }
    // log if conidtions for flush is found
    if (flush === true) {
      let flushCount = 0;

      let flushIsStraight;
      for (let n = 1; n < 5; n++) {
        flushIsStraight = resultIndexRank[n] - n;

        if (resultIndexRank[0] === flushIsStraight) {
          flushCount += 1;
        }
      }

      if (flushCount === 4 && resultIndexRank[0] === 8) {
        royalFlush = true;
        // globalRoyalFlush = true;
        this.result.bestHand = 0;
        console.log(`${this.player} has ROYAALLLL FLUSHHHHH${[...str]}`);
        return;
      }

      if (flushCount === 4) {
        straightFlush = true;
        // globalStraightFlush = true;
        this.result.bestHand = 1;
        console.log(`${this.player} has STRAIGHT FLUSHHHHHHH${[...str]}`);
        return;
      }

      if (flushCount !== 4) {
        this.result.bestHand = 4;
        console.log(`${_player} has A ${resultSuit[0]} FLUSH ${[str]}!`);
        return;
      }
    }

    // findStraight
    this.arrIndexOfRank.forEach((val, i, arr) => {
      let isStraight;

      // find sequence of number that is equal to firstNo (val) for straight
      for (let n = 1; n < 5; n++) {
        isStraight = arr[i + n] - n;

        if (val === isStraight) {
          count += 1;
        } else {
          return;
        }
      }

      if (count == 4) straight = 1;

      if (val === 8 && count === 4) {
        straight = 2;
      }

      if (straight !== 0) {
        str = [];
        for (let y = i; y < i + 5; y++) {
          pushStrNArr(y);
        }
      }
    });

    // log if conidtions for straight is found
    // condition for straight
    if (straight === 1) {
      // globalStraight = true;
      this.result.bestHand = 5;
      if (str.length === 10) {
        spliceErrors(0, 5);
      }
      if (str.length === 15) {
        spliceErrors(0, 10);
      }
      if (str.length !== 5) {
        console.error("Look into straights, more than 5 cards");
      }
      console.log(`${this.player} has STRAIGHTS${[...str]}`);
      return;
    }

    // findPairs
    if (this.result.bestHand === 11) {
      this.arrRank.forEach(function (val, i, arr) {
        if (val === arr[i + 1] && val !== arr[i + 2]) {
          pair = true;
          for (let n = i; n < i + 2; n++) {
            pushStrNArr(n);
          }
        } else {
          return;
        }
      });
    }

    // log if conidtions for different types of pairs are found
    if (pair === true && str.length === 4) {
      this.result.bestHand = 7;
      console.log(`${_player} has TWO PAIRS ${[...str]}!`);
      pairType = 2;
      return;
    }
    if (pair === true && str.length === 6) {
      // remove lowest two pairs
      spliceErrors(0, 2);

      this.result.bestHand = 7;
      console.log(
        `${_player} has THREE PAIRS the highest TWO PAIRS are ${[...str]}!`
      );
      pairType = 2;
      return;
    }
    if (pair === true && str.length === 2) {
      this.result.bestHand = 8;
      console.log(`${_player} has PAIR ${[...str]}!`);
      pairType = 1;
      return;
    }

    if (str.length === 0) {
      this.result.bestHand = 9;
      const highestCard = `${this.arrRank[6]} of ${this.arrSuit[6]}`;
      console.log(`${_player} highest card is ${highestCard}`);
      resultIndexRank.push(_arrIndexOfRank[6]);
      resultRank.push(_arrRank[6]);
      resultSuit.push(_arrSuit[6]);
      ogIndex.push(6);
      return;
    }

    // return ranking;
  }

  finalFive() {
    const cardDiff = 5 - this.result.resultRank.length;
    // console.log(
    //   `There's ${cardDiff} more cards required to make up the final 5 for ${this.player}`
    // );

    // What needs to be done
    // Get index of best cards from original sorted hand in players.hand
    // Delete those cards in players.hand and place in new array of evalPlayer
    // Number of cards to be placed is cardDiff and should be taken from the end of array (highest rank cards)
    // Don't mutate original evalPlayer.arr

    if (cardDiff > 0) {
      // make shallow copy
      const _arrRank = this.arrRank.slice();
      const _arrSuit = this.arrSuit.slice();
      const _arrIndexOfRank = this.arrIndexOfRank.slice();

      // splice out best hand cards from set of 7 cards player + dealer
      for (let i = this.result.ogIndex.length - 1; i > -1; i--) {
        let cutThisIndex = this.result.ogIndex[i];
        const spliceArr = function (n) {
          _arrRank.splice(n, 1);
          _arrSuit.splice(n, 1);
          _arrIndexOfRank.splice(n, 1);
        };

        spliceArr(cutThisIndex);
      }

      // get the highest ranking cards to make up the final five, push to finalFive object

      const { finalRank, finalSuit, finalRankIdx } = this.result.finalFive;
      for (let i = _arrRank.length - 1; i > 1; i--) {
        finalRank.push(_arrRank[i]);
        finalSuit.push(_arrSuit[i]);
        finalRankIdx.push(_arrIndexOfRank[i]);
      }
    }

    // console.log(this.result.finalFive);
  }
};

const StalePlayers = class {
  constructor(player, playerInitIndex, stalemateArr, finalFive) {
    this.player = player;
    this.playerInitIndex = playerInitIndex;
    this.stalemateArr = {
      staleRank: [],
      staleSuit: [],
      staleRankIdx: [],
    };
    this.finalFive = {};
  }
};

const endGame = function () {
  const playerScore = [];
  let playerIndexWithDupe = [];
  let str = [];
  let duplicates = false;
  let stalemate = false;
  let typeOfDupe;
  let sumCardsArr = [];
  let winner;
  let winnerCards = [];
  let maxValue;
  let maxValueIndex;
  let playerIdxStaleArr = [];

  // place player's best hand into playerScore arr
  for (let i = 0; i < evalPlayer.length; i++) {
    // evalPlayer[i].findAll();
    const score = evalPlayer[i].result.bestHand;
    playerScore.push(score);

    console.log(
      `${evalPlayer[i].player} has ${handRanking[score]} and ranking of ${score}`
    );
    addTextBox(
      `\n${evalPlayer[i].player} has ${handRanking[score]} and ranking of ${score}`
    );
  }

  // print playerScore arr
  console.log(playerScore);

  const toFindDuplicates = (function () {
    // find lowest score
    const lowestPlayerScore = Math.min(...playerScore);
    console.log(`${lowestPlayerScore} is the lowest rank`);

    // index of lowest score
    playerIndexWithDupe.push(playerScore.indexOf(lowestPlayerScore));
    console.log(
      `The lowest rank is at index ${playerIndexWithDupe[0]} of playerScore arr`
    );

    // determine if there are any duplicates
    playerScore.filter(function (val, i, arr) {
      // find values that are similar to the lowest score
      if (val === lowestPlayerScore && i !== playerIndexWithDupe[0]) {
        // if a duplicate is found that is not in the same initial index found include it in array
        playerIndexWithDupe.push(i);
        duplicates = true;
      }
    });

    const getCards = function (playerIndex, arrPushed) {
      for (
        let i = 0;
        i < evalPlayer[playerIndex].result.resultRank.length;
        i++
      ) {
        arrPushed.push(
          `${evalPlayer[playerIndex].result.resultRank[i]} of ${evalPlayer[playerIndex].result.resultSuit[i]}`
        );
      }
    };

    // If there isn't any duplicate
    if (duplicates === false) {
      winner = playerIndexWithDupe[0];

      getCards(winner, winnerCards);

      str.push(
        `${evalPlayer[winner].player} wins! ${
          handRanking[evalPlayer[winner].result.bestHand]
        } with ${[...winnerCards]}`
      );
      console.log(...str);
      addTextBox(`\n\n${[...str]}`);
    }

    // what hands are duplicates, new variable to improve readability
    typeOfDupe = handRanking[lowestPlayerScore];

    // if duplicates are found, what are the best hands for players with duplicates?
    if (duplicates === true) {
      // log players hand with duplicate hand ranks
      playerIndexWithDupe.forEach(function (val, i) {
        str.push(`${evalPlayer[val].player}`);
      });
      console.log(`${[...str]} have are tied with ${typeOfDupe}`);
      addTextBox(`\n\n${[...str]} are tied with ${typeOfDupe}`);

      // add up players cards and push to an array
      const sumCards = (function () {
        playerIndexWithDupe.forEach(function (val, i) {
          // clear str
          str = [];

          // shorten variable to improve readability
          let playerRanks = evalPlayer[val].result.resultIndexRank;
          // get cards for each player to print to console
          getCards(val, str);

          // print to console
          console.log(`${evalPlayer[val].player} with ${[...str]}`);
          addTextBox(`\n${evalPlayer[val].player} with ${[...str]}`);

          // add up all the cards for each player and push results to array to analyze further
          sumCardsArr.push(
            playerRanks.reduce(function (acc, val) {
              return (acc += val);
            })
          );
        });
      })();

      // find the maximum value of added cards for each player, identify the index no which also corresponds to player index to find winner
      console.log(sumCardsArr);

      // what is the largest value in the array
      maxValue = Math.max(...sumCardsArr);

      // what is the index No of the largest value in that array
      maxValueIndex = sumCardsArr.indexOf(maxValue);

      playerIdxStaleArr = [playerIndexWithDupe[maxValueIndex]];

      // find stalemate players
      sumCardsArr.filter(function (val, i) {
        // find values that are similar to the lowest score
        if (val === maxValue && i !== maxValueIndex) {
          // if a duplicate is found that is not in the same initial index found include it in array

          stalemate = true;
          // globalStalemate = true;

          playerIdxStaleArr.push(playerIndexWithDupe[i]);
        }
      });

      if (stalemate === false) {
        // which has the largest value, is also the winner
        winner = playerIndexWithDupe[maxValueIndex];

        // get the winner's cards
        getCards(winner, winnerCards);
        str = [];

        // push winner to console
        str.push(
          `${evalPlayer[winner].player} wins! ${
            handRanking[evalPlayer[winner].result.bestHand]
          } with ${[...winnerCards]}`
        );
        console.log(...str);
        addTextBox(`\n\n${[...str]}`);
      }
    }
  })();

  const dealingStalemate = function () {
    ///////////////////////////////////////////////////////////
    // WHAT IF PLAYERS HAVE THE SAME CARDS E.G SAME HIGH CARD//
    ///////////////////////////////////////////////////////////

    // find all players that are stalemate
    const getPlayer = function (arr) {
      str = [];
      for (let i = 0; i < arr.length; i++) {
        const playerIndex = arr[i];
        str.push(`${evalPlayer[playerIndex].player}`);
      }
    };
    getPlayer(playerIdxStaleArr);
    console.log(`There's a stalemate between ${[...str]}`);
    addTextBox(`\n\nThere's a stalemate between ${[...str]}`);

    // initialize stalePlayers and port over all relevant data
    for (let i = 0; i < playerIdxStaleArr.length; i++) {
      stalePlayer[i] = new StalePlayers(
        evalPlayer[playerIdxStaleArr[i]].player,
        evalPlayer[i].playerInitIndex,
        {},
        {}
      );

      console.log(stalePlayer[i]);
    }

    // port over data
    playerIdxStaleArr.forEach(function (val, i, arr) {
      // deconstruct array from evalPlayer
      const { resultRank, resultSuit, resultIndexRank, finalFive } =
        evalPlayer[val].result;

      console.log(finalFive);
      // deconstruct properties in stalePlayer object
      const { staleRank, staleSuit, staleRankIdx } =
        stalePlayer[i].stalemateArr;

      // assign
      Object.assign(stalePlayer[i].finalFive, finalFive);

      // loop over each element in evalPlayer and push into stalePlayer
      resultRank.forEach(function (val, x) {
        staleRank.push(resultRank[x]);
        staleSuit.push(resultSuit[x]);
        staleRankIdx.push(resultIndexRank[x]);
      });
      console.log(stalePlayer[i]);
    });

    for (let i = 0; i < stalePlayer.length; i++) {
      str = [];
      const { finalRank, finalSuit, finalRankIdx } = stalePlayer[i].finalFive;

      for (let n = 0; n < finalRank.length; n++) {
        str.push(`${finalRank[n]} of ${finalSuit[n]}`);
      }
      console.log(
        `${stalePlayer[i].player} has ${finalRank.length} kickers ${[...str]}`
      );
      addTextBox(
        `\n${stalePlayer[i].player} has ${finalRank.length} kickers ${[...str]}`
      );
    }
    // redundant code UNFORTUNATELY YOU SPEND 2 DAYS ON THIS //
    /* 
    let compare = { cardRank: [], cardSuit: [], cardRankInx: [] };

    // get their hands and compare if they are identical,
    const cardDisputeLength = stalePlayer[0].stalemateArr.staleRank.length;

    // loop through each card

    for (let i = 0; i < cardDisputeLength; i++) {
      let _tempRank = [];
      let _tempSuit = [];
      let _tempRankIdx = [];

      // package it in temp array, then push to compare

      const packIntoArr = function (data, temp) {
        // pack in temp
        temp.push(data[i]);
      };

      const pushIntoArr = function (destinationArr, temp) {
        // push to destination
        destinationArr.push(temp);

        temp = [];
      };

      // for each player, staleRank
      for (let n = 0; n < stalePlayer.length; n++) {
        const { staleRank } = stalePlayer[n].stalemateArr;

        packIntoArr(staleRank, _tempRank);
      }
      pushIntoArr(compare.cardRank, _tempRank);

      // for each player, staleSuit
      for (let n = 0; n < stalePlayer.length; n++) {
        const { staleSuit } = stalePlayer[n].stalemateArr;

        packIntoArr(staleSuit, _tempSuit);
      }
      pushIntoArr(compare.cardSuit, _tempSuit);

      // for each player, staleRankIdx
      for (let n = 0; n < stalePlayer.length; n++) {
        const { staleRankIdx } = stalePlayer[n].stalemateArr;

        packIntoArr(staleRankIdx, _tempRankIdx);
      }
      pushIntoArr(compare.cardRankInx, _tempRankIdx);
    }

    console.log(compare);
    */
  };

  const breakStalemate = function () {
    let compareRankIdx = [];

    //   let compare = { cardRank: [], cardSuit: [], cardRankInx: [] };

    //   // get their hands and compare if they are identical,
    //   const cardDisputeLength = stalePlayer[0].finalFive.finalRank.length;

    //   // loop through each card
    //   for (let i = 0; i < cardDisputeLength; i++) {
    //     let _tempRank = [];
    //     let _tempSuit = [];
    //     let _tempRankIdx = [];

    //     // two part function package it in temp array in loop, then push to compare after loop
    //     const packIntoArr = function (data, temp) {
    //       // pack in temp
    //       temp.push(data[i]);
    //     };

    //     const pushIntoArr = function (destinationArr, temp) {
    //       // push to destination
    //       destinationArr.push(temp);

    //       temp = [];
    //     };

    //     // for each player, staleRank
    //     for (let n = 0; n < stalePlayer.length; n++) {
    //       const { finalRank } = stalePlayer[n].finalFive;

    //       packIntoArr(finalRank, _tempRank);
    //     }
    //     pushIntoArr(compare.cardRank, _tempRank);

    //     // for each player, staleSuit
    //     for (let n = 0; n < stalePlayer.length; n++) {
    //       const { finalSuit } = stalePlayer[n].finalFive;

    //       packIntoArr(finalSuit, _tempSuit);
    //     }
    //     pushIntoArr(compare.cardSuit, _tempSuit);

    //     // for each player, staleRankIdx
    //     for (let n = 0; n < stalePlayer.length; n++) {
    //       const { finalRankIdx } = stalePlayer[n].finalFive;

    //       packIntoArr(finalRankIdx, _tempRankIdx);
    //     }
    //     pushIntoArr(compare.cardRankInx, _tempRankIdx);
    //   }

    //   console.log(compare);

    //   const cardsInComparison = compare.cardRankInx[0].length;
    //   // const compareSet = Set(compare.cardRankInx).length;

    //   console.log(compare.cardRankInx);
    //   console.log(cardsInComparison);

    // console.log(cardsInComparison - compareSet);

    // use the first player as template
    const { finalRank, finalSuit, finalRankIdx } = stalePlayer[0].finalFive;
    let kickerTie;

    for (let i = 0; i < finalRankIdx.length; i++) {
      kickerTie = false;
      compareRankIdx = [];
      console.log(`Kicker ${i + 1}`);

      compareRankIdx.push(finalRankIdx[i]);

      // place kicker of other players (other than player 1) in array
      for (let n = 1; n < stalePlayer.length; n++) {
        let {
          finalRank: compareFinalRank,
          finalSuit: compareFinalSuit,
          finalRankIdx: comparefinalRankIdx,
        } = stalePlayer[n].finalFive;

        compareRankIdx.push(comparefinalRankIdx[i]);

        /*
        // let tempWinner = 0;

        // if (val > comparefinalRankIdx[i]) {
        //   console.log(
        //     `${stalePlayer[tempWinner].player} wins with kicker number ${
        //       i + 1
        //     } and has the higher card ${val} ${finalRank[i]} of ${finalSuit[i]}`
        //   );
        //   return;
        // } else if (val < comparefinalRankIdx[i]) {
        //   tempWinner = n;
        //   console.log(
        //     `${stalePlayer[tempWinner].player} wins with kicker number ${
        //       i + 1
        //     } and has the higher card ${comparefinalRankIdx[i]} ${
        //       compareFinalRank[i]
        //     } of ${compareFinalSuit[i]}`
        //   );
        //   return;
        // }*/
      }

      console.log(compareRankIdx);
      const maxValKicker = Math.max(...compareRankIdx);
      const idxMaxValKicker = compareRankIdx.indexOf(maxValKicker);
      console.log(`The maximum value in kicker ${i + 1} is ${maxValKicker}`);

      for (let x = 0; x < compareRankIdx.length; x++) {
        // find if there are other values equal to max value in array that is not the same index no as max value
        if (compareRankIdx[x] === maxValKicker && x !== idxMaxValKicker) {
          kickerTie = true;
          console.log(
            "There is a duplicate, please look into the next set of kicker to break the tie"
          );
        }
      }
      if (kickerTie === true) {
        console.log(
          "Finding other players that have lower rank kicker than max "
        );

        for (let y = compareRankIdx.length; y > -1; y--) {
          if (compareRankIdx[y] < maxValKicker) {
            console.log(
              `${stalePlayer[y].player} has low kicker, delete player from StalePlayer`
            );
            stalePlayer.splice(y, 1);
            console.log(stalePlayer);
          }
        }
      }
      if (kickerTie === false) {
        console.log(`${stalePlayer[idxMaxValKicker].player} wins! `);
        addTextBox(
          `\n\n${
            stalePlayer[idxMaxValKicker].player
          } has the highest in Kicker No.${i + 1}! ${
            stalePlayer[idxMaxValKicker].player
          } wins!`
        );
        break;
      }
    }

    if (
      (stalePlayer.length > 1 && kickerTie === true) ||
      finalRankIdx.length === 0
    ) {
      str = [];
      for (let i = 0; i < stalePlayer.length; i++) {
        str.push(`${stalePlayer[i].player}`);
      }
      console.log(`${[...str]} split the pot!`);
      addTextBox(`\n\n${[...str]} split the pot!`);
    }

    // let playTheBoard = false;
    // console.log(playTheBoard);

    // stalePlayer.forEach(function (val, i, arr) {
    //   let { staleSuit } = arr[i].stalemateArr;
    //   console.log(staleSuit);
    //   staleSuit.forEach(function (suit, n) {
    //     if (suit === staleSuit[n + 1]) {
    //       console.log(suit);
    //       console.log(staleSuit[n + 1]);
    //       playTheBoard = true;
    //     }
    //     if (suit !== staleSuit[n + 1]) {
    //       playTheBoard = false;
    //       return;
    //     }
    //   });
    // });

    // if (playTheBoard === false) {
    //   console.log("find the other high cards");
    // } else if (playTheBoard === true) {
    //   console.log("split the pot");
    // }
  };

  if (stalemate === true) {
    dealingStalemate();
    breakStalemate();
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
    evalPlayer[i] = new Evaluate(players[i].playerNo, i, [], [], [], {});
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

    evalPlayer.forEach((val, i) => evalPlayer[i].findAll());

    evalPlayer.forEach((val, i) => evalPlayer[i].finalFive());

    endGame();

    // Skip from 9 to 11, no bets
    gameState = gameStateArr[11];
  } else {
    console.error(`There is an existing game in progress! Please reset!`);
  }
});

btnReset.addEventListener("click", function () {
  resetGame();

  console.log("Game reset, please initialize game to play!");
  textbox.value = "Reset! Press Initialize game to start!";
});

btnTurbo.addEventListener("click", function () {
  const turboGame = function () {
    activePlayers = 4;

    addTextBox("\nInitializing game");
    generateDeck(suit, rank);

    fisYatesShuff();
    console.log("Shuffling deck...");

    addTextBox("\nDone, lets play!\nSelect number of players");

    console.log(deck);

    // Change game state after initialization

    // Initialize dealer
    initDealer();

    initPlayers(activePlayers);

    // Check which stage of the game is at
    // First deal, initial number of players get dealt two cards
    dealCard(activePlayers);
    dealCard(activePlayers);

    for (let i = 0; i < players.length; i++) {
      players[i].showHand();
    }

    dealerFlop();
    console.log(dealer.hand);
    dealer.showHand();

    dealerTurn();
    console.log(dealer.hand);
    dealer.showHand();

    dealerRiver();
    console.log(dealer.hand);
    dealer.showHand();

    evaluateCards();

    evalPlayer.forEach((val, i) => evalPlayer[i].findAll());

    evalPlayer.forEach((val, i) => evalPlayer[i].finalFive());

    endGame();
  };
  let gameCounter = 0;

  while (globalFourOfAKind === false) {
    resetGame();
    gameCounter++;
    console.log(`Game No.${gameCounter}`);
    addTextBox(`\n\nGame No.${gameCounter}`);
    turboGame();
  }
});

console.log(handRanking);

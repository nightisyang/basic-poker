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
const btnReset = document.querySelectorAll(".btn-reset");
const btnTurbo = document.querySelector(".btn-turbo");
let btnPlyr;
// const btnPlyr2 = document.querySelector(".btn-plyr2");
// const btnPlyr3 = document.querySelector(".btn-plyr3");
// const btnPlyr4 = document.querySelector(".btn-plyr4");

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
let game;
let stalePlayer = [];
let muckPlayer = [];
let muckCards = [];

// for testing purposes
// let globalStalemate = false;
// let globalRoyalFlush = false;
// let globalFourOfAKind = false;
// let globalStraightFlush = false;
// let globalFlush = false;
// let globalFullHouse = false;
// let globalStraight = false;
// let globalTwoOfAKind = false;
let globalHighPairSame = false;

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

console.log(gameStateArr);

function addTextBox(text, numLine) {
  let newLineArr = [];
  let newLineStr = "";
  for (let i = 0; i < numLine; i++) {
    newLineArr.push("\n");
  }

  newLineArr.forEach((val) => (newLineStr += val));

  textbox.value += newLineStr + text;

  const textboxHeight = textbox.scrollHeight;
  textbox.scrollTop = textbox.scrollHeight;
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
  game;
  globalHighPairSame = false;

  console.log("Game reset, please initialize game to play!");
  textbox.value = "Reset! Press Initialize game to start!";
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
  constructor(playerNo, hand, chips, currBet, active) {
    this.playerNo = playerNo;
    this.hand = [];
    this.chips = { startBal: 1000, currBal: 1000, movement: [], movType: [] };
    this.currBet = 0;
    this.active = true;
  }

  // ********* METHODS **********
  showHand() {
    let playerHandArr = [];

    for (let i = 0; i < this.hand.length; i++) {
      let { rank: playerRank, suit: playerSuit } = this.hand[i];
      playerHandArr.push(` ${playerRank} of ${playerSuit}`);
    }

    console.log(`${this.playerNo} has ${playerHandArr}`);
    addTextBox(`${this.playerNo} has${playerHandArr}`, 1);
    return playerHandArr;
  }

  smallBlind() {
    let smallBlindAmount = prompt(`${this.playerNo} place small blind!`);

    // change type to number
    smallBlindAmount = Number(smallBlindAmount);
    // value must be integer and more than 0
    if (
      Number.isInteger(smallBlindAmount) &&
      smallBlindAmount > 0
      // smallBlindAmount < this.chips.currBal
    ) {
      // print to console amount bet
      console.log(
        `${this.playerNo} has placed small blind $${smallBlindAmount}`
      );
      addTextBox(
        `${this.playerNo} has placed small blind $${smallBlindAmount}`,
        1
      );
      // store current smallBlindAmount
      // this.currBet = smallBlindAmount;
      dealer.smallBlind = smallBlindAmount;
      dealer.pot += smallBlindAmount;

      // only approve if bet amount is less than current balance
      // if conditions are true, then push bet to movement array
      this.chips.movement.push(smallBlindAmount);

      // deduct current balance
      this.chips.currBal -= smallBlindAmount;

      // print to console current balance
      console.log(`${this.playerNo} currently has ${this.chips.currBal}`);
      addTextBox(`${this.playerNo} currently has ${this.chips.currBal}`, 1);
    }
  }

  bigBlind() {
    let bigBlindAmount = prompt(`${this.playerNo} place big blind!`);

    // change type to number
    bigBlindAmount = Number(bigBlindAmount);
    // value must be integer and more than 0
    if (
      Number.isInteger(bigBlindAmount) &&
      bigBlindAmount >= dealer.smallBlind * 2
      // bigBlindAmount < this.chips.currBal
    ) {
      // print to console amount bet
      console.log(`${this.playerNo} has placed big blind $${bigBlindAmount}`);
      addTextBox(`${this.playerNo} has placed big blind $${bigBlindAmount}`, 1);
      // store current bigBlindAmount
      // this.currBet = bigBlindAmount;
      dealer.smallBlind = bigBlindAmount;
      dealer.pot += bigBlindAmount;

      // only approve if bet amount is less than current balance
      // if conditions are true, then push bet to movement array
      this.chips.movement.push(bigBlindAmount);

      // deduct current balance
      this.chips.currBal -= bigBlindAmount;

      // print to console current balance
      console.log(`${this.playerNo} currently has ${this.chips.currBal}`);
      addTextBox(`${this.playerNo} currently has ${this.chips.currBal}`, 1);
    } else if (bigBlindAmount < dealer.smallBlind * 2) {
      // alert
      alert(
        `Bet amount too low, big blind has to be twice the amount of small blind ${dealer.smallBlind}`
      );

      // and rerun function
      this.bigBlind();
    }
  }

  bets() {
    if (this.active === true && activePlayers === 1) {
      console.log(`${this.playerNo} wins!`);
      addTextBox(`${this.playerNo} wins!`, 1);
      gameState = gameStateArr[11];
      return;
    }

    if (this.active === true) {
      // check if value in prompt is valid/true
      // prompt to take in a value
      let betAmount = prompt(
        `${this.playerNo} place your bets! To fold, type "fold" (without quotes)!`
      );

      if (betAmount === "fold") {
        this.fold();
        return;
      }

      // change type to number
      betAmount = Number(betAmount);

      if (dealer.minCall === 0 && betAmount === 0) {
        console.log(`${this.playerNo} has called`);
        addTextBox(`${this.playerNo} has called`);
        const { amount, player } = dealer.potMov;
        // dealer.pot += betAmount;
        dealer.potMov.amount.push(betAmount);
        dealer.potMov.player.push(this.playerNo);
        this.chips.movement.push(0);
        this.chips.movType.push("Check");
      }

      // value must be integer and more than 0
      if (
        Number.isInteger(betAmount) &&
        betAmount > 0 &&
        betAmount < this.chips.currBal &&
        betAmount >= dealer.minCall
      ) {
        // store current betAmount
        this.currBet = betAmount;
        dealer.pot += betAmount;

        // print to console amount bet
        console.log(`${this.playerNo} has placed ${this.currBet}`);
        addTextBox(`${this.playerNo} has placed ${this.currBet}`, 1);

        // only approve if bet amount is less than current balance
        // if conditions are true, then push bet to movement array
        this.chips.movement.push(betAmount);

        if (this.currBet === dealer.minCall) {
          this.chips.movType.push("Call");
        }

        // deduct current balance
        this.chips.currBal -= betAmount;

        // print to console current balance
        console.log(`${this.playerNo} currently has ${this.chips.currBal}`);
        addTextBox(`${this.playerNo} currently has ${this.chips.currBal}`, 1);

        if (betAmount > dealer.minCall && dealer.minCall !== 0) {
          dealer.minCall = betAmount;
          console.log(
            `${this.playerNo} has raise call to $${deal.minCall}, dealer to check bets!`
          );
          this.chips.movType.push("Raise");

          alert(
            `${this.playerNo} has raise! Raise to meet call ${dealer.minCall}!`
          );
        } else if (dealer.minCall === 0) {
          dealer.minCall = betAmount;
          this.chips.movType.push("Bet");
        }

        const { amount, player } = dealer.potMov;
        dealer.pot += betAmount;
        dealer.potMov.amount.push(betAmount);
        dealer.potMov.player.push(this.playerNo);
        // console.log(amount);
        // console.log(player);
        // console.log(dealer);

        // if player bets more than balance
      } else if (betAmount > this.chips.currBal) {
        // alert
        alert("Insufficient balance!");

        // and rerun function
        this.bets();
      } else if (betAmount < dealer.minCall) {
        // alert
        alert(
          `Bet amount too low, call ${dealer.minCall} or raise! Your current bet is ${this.currBet}`
        );

        // and rerun function
        this.bets();
      } else if (betAmount < dealer.minCall && betAmount < this.chips.currBal) {
        // alert
        alert(`Bet amount too low, call ${dealer.minCall} or raise!`);

        // and rerun function
        this.bets();
      } else {
        // if player include value that is not integer or negative value
        alert("Please enter whole values more than zero!");

        // rerun function
        this.bets();
      }
    }
  }

  raise() {
    if (this.active === true) {
      // check if value in prompt is valid/true
      // prompt to take in a value
      let raiseAmount = prompt(
        `${this.playerNo} needs to raise! Your current bet is ${this.currBet}. To fold, type "fold" (without quotes!)`
      );

      if (raiseAmount === "fold") {
        this.fold();
        return;
      }

      // change type to number
      raiseAmount = Number(raiseAmount);
      // value must be integer and more than 0

      const currAddRaise = this.currBet + raiseAmount;

      if (
        Number.isInteger(raiseAmount) &&
        raiseAmount > 0 &&
        raiseAmount < this.chips.currBal &&
        currAddRaise >= dealer.minCall
      ) {
        // store current raiseAmount
        this.currBet = currAddRaise;
        dealer.pot += raiseAmount;

        // print to console amount bet
        console.log(`${this.playerNo} has met the raised ${this.currBet}`);
        addTextBox(`${this.playerNo} has met the raised ${this.currBet}`, 1);

        // only approve if bet amount is less than current balance
        // if conditions are true, then push bet to movement array
        this.chips.movement.push(raiseAmount);

        if (this.currBet === dealer.minCall) {
          this.chips.movType.push("Call");
        }

        // deduct current balance
        this.chips.currBal -= raiseAmount;

        // print to console current balance
        console.log(`${this.playerNo} currently has ${this.chips.currBal}`);
        addTextBox(`${this.playerNo} currently has ${this.chips.currBal}`, 1);

        if (currAddRaise > dealer.minCall && dealer.minCall !== 0) {
          dealer.minCall = currAddRaise;
          console.log(
            `Minimum call is ${dealer.minCall}, dealer to check bets`
          );

          this.chips.movType.push("Raise");

          alert(
            `${this.playerNo} has raise! Raise to meet call ${dealer.minCall}!`
          );
        }

        const { amount, player } = dealer.potMov;
        dealer.pot += raiseAmount;
        dealer.potMov.amount.push(raiseAmount);
        dealer.potMov.player.push(this.playerNo);
        // console.log(amount);
        // console.log(player);
        // console.log(dealer);

        // if player bets more than balance
      } else if (raiseAmount > this.chips.currBal) {
        // alert
        alert("Insufficient balance!");

        // and rerun function
        this.raise();
      } else if (currAddRaise < dealer.minCall) {
        // alert
        alert(
          `Raise amount too low! Your current bet is ${
            this.currBet
          }, raise bet by ${dealer.minCall - this.currBet} to stay in the game!`
        );

        // and rerun function
        this.raise();
      } else if (
        currAddRaise < dealer.minCall &&
        raiseAmount < this.chips.currBal
      ) {
        // alert
        alert(
          `You don't have enough chips to meet the raise ${dealer.minCall}. Type "fold" to forfeit!`
        );

        // and rerun function
        this.raise();
      } else {
        // if player include value that is not integer or negative value
        alert("Please enter whole values more than zero!");

        // rerun function
        this.raise();
      }
    }
  }

  fold() {
    activePlayers -= 1;
    // find this player's index in players array
    // const i = players.indexOf(this);

    //put into muck pile for record purposes
    muckCards.push(...this.hand);

    //remove hand
    this.hand = [];
    this.currBet = 0;
    this.chips.movement.push(0);
    this.chips.movType.push("Fold");
    this.active = false;

    console.log(`${this.playerNo} has folded!`);
    addTextBox(`${this.playerNo} has folded!`, 1);

    // remove all data from evaluation
    // evalPlayer[i].resetFold();
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

  // resetFold() {
  //   // push cards and all other data into muck
  //   const newMuck = new Muck(
  //     this.player,
  //     this.playerInitIndex,
  //     this.cards,
  //     this.arrIndexOfRank,
  //     this.arrSuit,
  //     this.arrRank,
  //     this.result
  //   );

  //   muckPlayer.push(newMuck);

  //   //reset everything else
  //   this.player = player;
  //   this.playerInitIndex = playerInitIndex;
  //   this.cards = [];
  //   this.arrIndexOfRank = [];
  //   this.arrSuit = [];
  //   this.arrRank = [];
  //   this.result = {};
  // }

  clearPushStrNArr() {
    this.result.resultIndexRank = [];
    this.result.resultRank = [];
    this.result.resultSuit = [];
    this.result.ogIndex = [];
  }

  spliceErrors(startNo, noOfCards) {
    this.result.resultIndexRank.splice(startNo, noOfCards);
    this.result.resultRank.splice(startNo, noOfCards);
    this.result.resultSuit.splice(startNo, noOfCards);
    this.result.ogIndex.splice(startNo, noOfCards);
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
    let straight = false;
    let count = 0;
    let flush = false;
    let royalFlush = false;
    let straightFlush = false;
    let fullHouse = false;
    let pair = false;

    const pushStrNArr = function (n) {
      // Place in string array
      str.push(`${_arrRank[n]} of ${_arrSuit[n]}`);

      // Push
      resultIndexRank.push(_arrIndexOfRank[n]);
      resultRank.push(_arrRank[n]);
      resultSuit.push(_arrSuit[n]);
      ogIndex.push(n);
    };

    const clearStr = function () {
      str = [];
    };

    const spliceErrorsStr = function (startNo, noOfCards) {
      str.splice(startNo, noOfCards);
    };

    // findFourOfAKind
    this.arrRank.forEach((val, i, arr) => {
      if (val === arr[i + 1] && val === arr[i + 2] && val === arr[i + 3]) {
        fourOfAKind = true;
        // globalFourOfAKind = true;

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

      function findThreeOfAKind() {
        _arrRank.forEach((val, i, arr) => {
          // two parts first find 3 of a kind, second part find pair

          // first part - find three similar cards

          if (val === arr[i + 1] && val === arr[i + 2]) {
            startIndex3Kind = i;
            threeOfAKind = true;
            for (let n = i; n < i + 3; n++) {
              pushStrNArr(n);
            }
          }
        });
      }

      findThreeOfAKind();

      if (str.length === 6) {
        this.spliceErrors(0, 3);
        spliceErrorsStr(0, 3);
      }
      // second part - find pair, ignore if start index is the same as 3 of a kind, will lead to duplicate

      function findPair() {
        _arrRank.forEach(function (val, i, arr) {
          if (
            val === arr[i + 1] &&
            val !== arr[i + 2] &&
            i !== startIndex3Kind &&
            i !== startIndex3Kind + 1
          ) {
            pair = true;
            for (let n = i; n < i + 2; n++) {
              pushStrNArr(n);
            }
          }
        });
      }

      findPair();

      if (str.length === 7) {
        this.spliceErrors(0, 2);
        spliceErrorsStr(0, 2);
      }

      // findThreeOfAKind();
      // if (threeOfAKind === true) {
      //   findPair();
      // }

      // if (threeOfAKind === false) {
      //   findPair();
      //   findThreeOfAKind();
      // }

      if (pair === true && threeOfAKind === false) {
        pair = false;
        this.spliceErrors(0, str.length);
        clearStr();
      }

      // this.arrRank.forEach((val, i, arr) => {
      //   if (
      //     threeOfAKind === true &&
      //     val === arr[i + 1] &&
      //     i !== startIndex3Kind &&
      //     i !== startIndex3Kind + 1
      //   ) {
      //     fullHouse = true;
      //     for (let n = i; n < i + 2; n++) {
      //       pushStrNArr(n);
      //     }
      //   }
      // });
    }

    // log if conidtions for straight is found - logic for 3 of a kind overlaps, if str.length = 3
    if (threeOfAKind === true && pair === false) {
      this.result.bestHand = 6;

      if (str.length === 6) {
        this.spliceErrors(0, 3);
        spliceErrorsStr(0, 3);
      }

      console.log(`${this.player} has THREE OF A KIND ${[...str]}!`);
      return;
    }

    // log if conidtions for full house is found
    if (threeOfAKind === true && pair === true) {
      fullHouse = true;
      // globalFullHouse = true;
      this.result.bestHand = 3;
      console.log(`${this.player} has FULL HOUSE ${[...str]}!`);
      return;
    }

    // find flush

    let flushIdx = [];
    str = [];

    for (let i = 0; i < suit.length; i++) {
      // clearPushStrNArr();
      flushIdx = [];

      // for (let n = 0; n < this.arrSuit.length; n++)
      this.arrSuit.forEach(function (val, n) {
        if (val === suit[i]) flushIdx.push(n);
      });

      if (flushIdx.length < 5) {
        flushIdx = [];
      }

      if (
        flushIdx.length === 5 ||
        flushIdx.length === 6 ||
        flushIdx.length === 7
      ) {
        flush = true;
        // globalFlush = true;

        // this.result.bestHand = 4;
        flushIdx.forEach((val) => {
          pushStrNArr(val);
        });
      }
    }
    // log if conidtions for flush is found
    if (flush === true) {
      let flushCount = 0;

      let flushIsStraight;
      for (let n = 1; n < resultIndexRank.length; n++) {
        flushIsStraight = resultIndexRank[n] - n;

        if (resultIndexRank[0] === flushIsStraight) {
          flushCount += 1;
        }
      }

      if (flushCount === 5) {
        this.spliceErrors(0, 1);
        spliceErrorsStr(0, 1);
      }
      if (flushCount === 6) {
        this.spliceErrors(0, 2);
        spliceErrorsStr(0, 1);
      }

      if (resultIndexRank[0] === 8) {
        royalFlush = true;
        // globalRoyalFlush = true;
        this.result.bestHand = 0;
        console.log(`${this.player} has ROYAALLLL FLUSHHHHH${[...str]}`);
        return;
      }

      if (flushCount === 4 || flushCount === 5 || flushCount === 6) {
        straightFlush = true;
        // globalStraightFlush = true;
        this.result.bestHand = 1;
        console.log(`${this.player} has STRAIGHT FLUSHHHHHHH${[...str]}`);
        return;
      }

      if (flushCount < 4) {
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

      if (count === 4) {
        straight = true;
        str = [];
        for (let y = i; y < i + 5; y++) {
          pushStrNArr(y);
        }
      }
    });

    // log if conidtions for straight is found
    // condition for straight
    if (straight === true) {
      // globalStraight = true;

      this.result.bestHand = 5;

      if (resultIndexRank.length === 10) {
        this.spliceErrors(0, 5);
        spliceErrorsStr(0, 5);
      }

      if (resultIndexRank.length === 15) {
        this.spliceErrors(0, 10);
        spliceErrorsStr(0, 10);
      }

      if (resultIndexRank.length !== 5) {
        console.error("Look into straights, more than 5 cards");
      }

      console.log(`${this.player} has STRAIGHTS ${[...str]}`);
      return;
    }

    // findPairs
    if (this.result.bestHand === 11) {
      // console.error("***** CLEAR LINE CARRIED OUT *****");
      // console.error(str);
      // console.error(this.result);
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
      // globalTwoOfAKind = true;
      return;
    }
    if (pair === true && str.length === 6) {
      // remove lowest two pairs
      this.spliceErrors(0, 2);
      spliceErrorsStr(0, 2);

      this.result.bestHand = 7;
      console.log(
        `${_player} has THREE PAIRS the highest TWO PAIRS are ${[...str]}!`
      );
      // globalTwoOfAKind = true;
      return;
    }
    if (pair === true && str.length === 2) {
      this.result.bestHand = 8;
      console.log(`${_player} has PAIR ${[...str]}!`);
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
  }

  finalFive() {
    const cardDiff = 5 - this.result.resultRank.length;

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

class Muck extends Evaluate {
  constructor(
    player,
    playerInitIndex,
    cards,
    arrIndexOfRank,
    arrSuit,
    arrRank,
    result
  ) {
    super(
      player,
      playerInitIndex,
      cards,
      arrIndexOfRank,
      arrSuit,
      arrRank,
      result
    );
  }
}

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
  let firstRun = false;
  let secondRun = false;

  // place player's best hand into playerScore arr
  for (let i = 0; i < evalPlayer.length; i++) {
    // evalPlayer[i].findAll();
    const score = evalPlayer[i].result.bestHand;
    playerScore.push(score);

    // console.log(
    //   `${evalPlayer[i].player} has ${handRanking[score]} and ranking of ${score}`
    // );
    addTextBox(`${evalPlayer[i].player} has ${handRanking[score]}`, 1);
  }

  // print playerScore arr
  console.log(playerScore);

  const toFindDuplicates = (function () {
    // find lowest score
    const lowestPlayerScore = Math.min(...playerScore);
    // console.log(`${lowestPlayerScore} is the lowest rank`);

    // index of lowest score
    playerIndexWithDupe.push(playerScore.indexOf(lowestPlayerScore));
    // console.log(`The lowest rank is at index ${playerIndexWithDupe[0]}`);

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
      // arrPushed = [];

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
      str = [];
      winner = playerIndexWithDupe[0];

      getCards(winner, winnerCards);

      str.push(
        `${evalPlayer[winner].player} wins! ${
          handRanking[evalPlayer[winner].result.bestHand]
        } with ${[...winnerCards]}`
      );
      console.log(...str);
      addTextBox(`${[...str]}`, 2);
    }

    // what hands are duplicates, new variable to improve readability
    typeOfDupe = handRanking[lowestPlayerScore];

    // if duplicates are found, what are the best hands for players with duplicates?
    if (duplicates === true) {
      if (typeOfDupe === "Two pair") {
        console.error("********* TWO PAIR DUPLICATE *********");
        firstRun = true;
      }

      console.error(` First run is ${firstRun}`);

      // log players hand with duplicate hand ranks
      playerIndexWithDupe.forEach(function (val, i) {
        str.push(`${evalPlayer[val].player}`);
      });
      console.log(`${[...str]} have are tied with ${typeOfDupe}`);
      addTextBox(`${[...str]} are tied with ${typeOfDupe}`, 2);

      // print cards only once
      let printed = false;

      // add up players cards and push to an array
      function sumCards() {
        sumCardsArr = [];
        let playerRanks = [];
        playerIndexWithDupe.forEach(function (playerIdx, i) {
          // clear str
          str = [];
          // playerRanks = evalPlayer[playerIdx].result.resultIndexRank;

          const sumCardsArrFunc = function (arr) {
            sumCardsArr.push(
              arr.reduce(function (acc, val) {
                return acc + val;
              }, 0)
            );
          };

          const printDuplicates = function () {
            // clear str
            str = [];

            // get cards for each player to print to console
            getCards(playerIdx, str);

            // print to console
            console.log(`${evalPlayer[playerIdx].player} with ${[...str]}`);
            addTextBox(`${evalPlayer[playerIdx].player} with ${[...str]}`, 1);
          };

          if (firstRun === true) {
            console.error("*******FIRST RUN********");

            playerRanks = evalPlayer[playerIdx].result.resultIndexRank
              .slice()
              .splice(2, 4);
            console.log(playerRanks);
            sumCardsArrFunc(playerRanks);
            // return;

            printDuplicates();
            printed = true;
          }

          if (firstRun !== true || secondRun === true) {
            console.error("*******SECOND RUN********");

            playerRanks = evalPlayer[playerIdx].result.resultIndexRank;
            console.log(playerRanks);
            sumCardsArrFunc(playerRanks);

            // // get cards for each player to print to console
            // getCards(playerIdx, str);

            // // print to console
            // console.log(`${evalPlayer[playerIdx].player} with ${[...str]}`);
            // addTextBox(`\n${evalPlayer[playerIdx].player} with ${[...str]}`);
            // return;

            if (printed === false) printDuplicates();
          }
        });
      }

      sumCards();

      // find stalemate players
      console.log(sumCardsArr);

      function analyzeSumCardArr() {
        const getMaxCardDetails = function () {
          // find the maximum value of added cards for each player, identify the index no which also corresponds to player index to find winner
          console.error(sumCardsArr);

          // what is the largest value in the array
          maxValue = Math.max(...sumCardsArr);

          // what is the index No of the largest value in that array
          maxValueIndex = sumCardsArr.indexOf(maxValue);

          // place player index into an array, if there are other players with the same hand/value, include it here and initialize Stalemate player class in the following function dealingStalemate()
          playerIdxStaleArr = [playerIndexWithDupe[maxValueIndex]];
        };

        if (firstRun === true) {
          // are the highest pairs the same?
          let highPairSame = false;

          getMaxCardDetails();
          sumCardsArr.filter(function (val, i) {
            // find values that are similar to the lowest score
            if (val === maxValue && i !== maxValueIndex) {
              // if a duplicate is found that is not in the same initial index found include it in array

              console.error("*************** SWITCHING ***************");
              firstRun = false;
              secondRun = true;
              highPairSame = true;
            }
          });

          if (highPairSame === true) {
            playerIdxStaleArr = [];
            maxValue;
            maxValueIndex;

            sumCards();
          }

          if (highPairSame === false) {
            globalHighPairSame = true;
            stalemateFalse();
          }
          // return;
        }

        if (firstRun !== true || secondRun === true) {
          getMaxCardDetails();

          sumCardsArr.filter(function (val, i) {
            // find values that are similar to the lowest score
            if (val === maxValue && i !== maxValueIndex) {
              // if a duplicate is found that is not in the same initial index found include it in array
              // globalStalemate = true;
              stalemate = true;
              playerIdxStaleArr.push(playerIndexWithDupe[i]);
              console.error(i);
              console.error(playerIndexWithDupe[i]);
              console.error(playerIdxStaleArr);
              return;
            }
          });
          stalemateFalse();
        }
      }

      analyzeSumCardArr();

      function stalemateFalse() {
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
          addTextBox(`${[...str]}`, 2);
        }
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
    console.error(playerIdxStaleArr);
    getPlayer(playerIdxStaleArr);
    console.log(`There's a stalemate between ${[...str]}`);
    addTextBox(`There's a stalemate between ${[...str]}`, 2);

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
        `${stalePlayer[i].player} has ${finalRank.length} kickers ${[...str]}`,
        1
      );
    }
  };

  const breakStalemate = function () {
    let compareRankIdx = [];

    // use the first player as template
    const { finalRank, finalSuit, finalRankIdx } = stalePlayer[0].finalFive;
    let kickerTie;

    // compiles kicker cards of players in stalemate into an array compareRankIdx
    // finds max, the index of max and determines if there are other kickers of the same rank
    // if there is, delete/splice all players with kicker lower than max and go through the next kicker
    // if there is no other equally high rank kicker, player wins
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
          `${
            stalePlayer[idxMaxValKicker].player
          } has the highest in Kicker No.${i + 1}! ${
            stalePlayer[idxMaxValKicker].player
          } wins!`,
          2
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
      addTextBox(`${[...str]} split the pot!`, 2);
    }
  };

  if (stalemate === true) {
    dealingStalemate();
    breakStalemate();
  }
};

// Initialize dealer class
const initDealer = function () {
  dealer = new (class {
    constructor(
      hand,
      dealerButton,
      pot,
      potMov,
      smallBlind,
      bigBlind,
      minCall
    ) {
      this.hand = [];
      this.dealerButton = dealerButton;
      this.pot = 0;
      this.potMov = { amount: [], player: [] };
      this.smallBlind = 0;
      this.bigBlind = 0;
      this.minCall = 0;
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
      addTextBox(`Dealer has${dealerHandStrArr}`, 1);
    }

    initButton() {
      if ((this.dealerButton = undefined)) {
        this.dealerButton = players.length;
      }
    }

    moveButton() {
      const currBtnPosition = this.dealerButton;
      const nextBtnPosition = currBtnPosition--;

      if (nextBtnPosition < 0) {
        this.dealerButton = players.length;
      }

      if (players[nextBtnPosition].active === false) {
        this.moveButton();
      }

      console.log(`Button is with ${players[nextBtnPosition]}`);
    }

    checkBets() {
      // let plyrBetLowerThanMinCall = false;

      players.forEach(function (val, i) {
        console.log("Looping through players to check bets");

        // only for players that are still in the game
        if (players[i].active === true) {
          console.log("Getting active players");

          // find all other players that do not meet call
          if (players[i].currBet < dealer.minCall) {
            // plyrBetLowerThanMinCall = true;

            alert(
              `${players[i].playerNo}, meet raised amount or fold! Add ${
                dealer.minCall - players[i].currBet
              } to stay in the game!`
            );
            players[i].raise();
            console.log("Dealer resolved bets");
          }
        }
      });

      if (activePlayers > 1) {
        let checkCounter = 0;

        players.forEach(function (val, i) {
          if (players[i].active === true) {
            if (players[i].currBet === dealer.minCall) {
              console.log(
                `${players[i].playerNo} meets call bet ${players[i].currBet}`
              );
              checkCounter++;
            }
          }
        });

        if (checkCounter !== activePlayers) {
          console.log(
            `Some players do not meet minimum call amount, dealer checking...`
          );
          this.checkBets();
        }

        if (checkCounter === activePlayers) {
          //advance game state
          gameState = gameStateArr[gameState + 1];

          // reset values for new betting round
          this.minCall = 0;

          for (let i = 0; i < players.length; i++) {
            players[i].currBet = 0;
          }
        }
      } else if (activePlayers === 1) {
        players.forEach(function (val, i) {
          if (players[i].active === true) {
            console.log(`${players[i].playerNo} wins!`);
          }
        });
      }

      // return plyrBetLowerThanMinCall;
    }

    breakBetloop() {
      let comparePlyrBets = false;
      players.forEach(function (val, i) {
        // only for players that are still in the game
        if (players[i].active === true) {
          // find all other players that do not meet call
          if (players[i].currBet < dealer.minCall) {
            comparePlyrBets = true;
          }
        }
      });
      return comparePlyrBets;
    }

    // newBetRound() {
    //   // clear call after each betting round
    //   this.minCall = 0;

    //   for (let i = 0; i < players.length; i++) {
    //     players[i].currBet = 0;
    //   }
    // }
  })();
};

// const initBetCycle = function () {
//   game = new (class {
//     constructor(cycle, betCycle) {
//       this.cycle = cycle;
//       this.betCycle = ["small blind", "big blind", "bet"];
//     }
//   })();
// };

// initBetCycle();

// Initialize number of players
const initPlayers = function (nPlayers) {
  // Initialize n number of players
  for (let i = 0; i < nPlayers; i++) {
    players[i] = new PlayerCl(`Player ${i + 1}`);
  }

  addTextBox(`${nPlayers} players initialized`, 1);

  for (let i = 0; i < nPlayers; i++) {
    const newBtn = document.createElement("button");
    newBtn.innerHTML = `Player ${i + 1}`;
    newBtn.className = "btn-plyr";
    document.body.appendChild(newBtn);

    // add the newly created element and its content into the DOM
    const currentDiv = document.getElementById("placeholder");
    // document.body.insertBefore(newBtn, currentDiv);

    currentDiv.append(newBtn);
    btnPlyr = document.querySelectorAll(".btn-plyr");
  }

  btnPlyr.forEach((ele, i) =>
    ele.addEventListener("click", function () {
      console.log(i);
      players[i].bets();
    })
  );

  // function addElement() {
  // create a new div element
  // const newBtn = document.createElement("button");
  // newBtn.innerHTML = "Player Placeholder";
  // newBtn.className = "btn-plyr";
  // document.body.appendChild(newBtn);

  // // add the newly created element and its content into the DOM
  // const currentDiv = document.getElementById("placeholder");
  // // document.body.insertBefore(newBtn, currentDiv);

  // currentDiv.append(newBtn);
  // btnPlyr = document.querySelectorAll(".btn-plyr");

  // btnPlyr.forEach((ele, i) =>
  //   ele.addEventListener("click", function () {
  //     console.log(i);
  //     players[i].bets();
  //   })
  // );
  // }
};

// Deal cards to players
const dealCard = function (activePlayers) {
  // put card into player and delete card

  for (let i = 0; i < activePlayers; i++) {
    if (players[i].active === true) {
      let player = players[i];
      player.hand.push(deck[0]);
      deck.splice(0, 1);
    }
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
    addTextBox("Initializing game", 1);
    generateDeck(suit, rank);

    fisYatesShuff();
    console.log("Shuffling deck...");

    // Initialize dealer
    initDealer();

    // let counter = 3;

    // const countdown = setInterval(function () {
    //   console.log(counter);
    //   counter--;
    //   addTextBox(".");

    //   if (counter < 1) {
    //     addTextBox("Done, lets play!", 1);
    //     addTextBox("Select number of players", 1);

    //     clearInterval(countdown);
    //   }
    // }, 1000);
    addTextBox("Done, lets play!", 1);
    addTextBox("Select number of players", 1);

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
    if (players[i].active === true) {
      evalPlayer[i] = new Evaluate(players[i].playerNo, i, [], [], [], {});
    }
  }

  // push hands into evalPlayer.cards
  for (let i = 0; i < players.length; i++) {
    if (players[i].active === true) {
      for (let n = 0; n < players[i].hand.length; n++) {
        evalPlayer[i].cards.push(players[i].hand[n]);
      }
      evalPlayer[i].cards.push(...dealer.hand);
    }
  }

  // sort ascending to indexOfRank
  for (let i = 0; i < players.length; i++) {
    if (players[i].active === true) {
      evalPlayer[i].cards.sort(function (a, b) {
        return a.indexOfRank - b.indexOfRank;
      });
    }
  }

  // make new array just for index
  for (let i = 0; i < players.length; i++) {
    if (players[i].active === true) {
      for (let n = 0; n < evalPlayer[i].cards.length; n++) {
        const { suit, rank, indexOfRank } = evalPlayer[i].cards[n];
        evalPlayer[i].arrIndexOfRank.push(indexOfRank);
        evalPlayer[i].arrSuit.push(suit);
        evalPlayer[i].arrRank.push(rank);
      }
    }
  }

  evalPlayer.forEach((val, i) => console.log(evalPlayer[i]));
};

// DOM
btnInit.addEventListener("click", initGame);

btnPlayers.addEventListener("click", function () {
  if (gameState === gameStateArr[1]) {
    // Select number of players
    let numPlayers;

    // Function to check validitity of returned value for number of players
    function checkValue() {
      numPlayers = Number(prompt("How many players? (1 - 4)", "4"));

      // check if value in prompt is valid/true
      if (Number.isInteger(numPlayers) && numPlayers >= 2 && numPlayers <= 10) {
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

btnReset.forEach((ele) => ele.addEventListener("click", resetGame));

btnTurbo.addEventListener("click", function () {
  const turboGame = function () {
    addTextBox("Initializing game", 1);
    generateDeck(suit, rank);

    fisYatesShuff();
    console.log("Shuffling deck...");

    addTextBox("Done, lets play!", 1);
    addTextBox("Select number of players", 1);

    console.log(deck);

    // Change game state after initialization

    // Initialize dealer
    initDealer();

    // Function to check validitity of returned value for number of players
    function checkValue() {
      activePlayers = Number(prompt("How many players? (1 - 4)", "4"));

      // check if value in prompt is valid/true
      if (
        Number.isInteger(activePlayers) &&
        activePlayers >= 2 &&
        activePlayers <= 10
      ) {
        // Initilize number of players
        initPlayers(activePlayers);

        // Set activePlayers global state
      } else {
        checkValue();
      }
    }

    // Call function
    checkValue();

    players[0].smallBlind();
    players[0].bigBlind();

    function betNCheck() {
      for (let i = 0; i < players.length; i++) {
        players[i].bets();
      }
      dealer.checkBets();
    }
    betNCheck();

    // Check which stage of the game is at
    // First deal, initial number of players get dealt two cards
    dealCard(activePlayers);
    dealCard(activePlayers);

    for (let i = 0; i < players.length; i++) {
      players[i].showHand();
    }

    betNCheck();

    dealerFlop();
    console.log(dealer.hand);
    dealer.showHand();

    betNCheck();

    dealerTurn();
    console.log(dealer.hand);
    dealer.showHand();

    betNCheck();

    dealerRiver();
    console.log(dealer.hand);
    dealer.showHand();

    betNCheck();

    evaluateCards();

    evalPlayer.forEach((val, i) => evalPlayer[i].findAll());

    evalPlayer.forEach((val, i) => evalPlayer[i].finalFive());

    endGame();
  };
  let gameCounter = 0;

  gameCounter++;
  console.log(`Game No.${gameCounter}`);
  addTextBox(`Game No.${gameCounter}`, 2);
  turboGame();
  // resetGame();
});

import Noob from "./players/noob.js";

class GameManager {
  constructor() {
    
    this.player1 = new PlayerManager();
    this.player2 = new PlayerManager(new Noob());
    this.startingPlayer = Math.ceil(Math.random()*2);

    this.boardElement = document.getElementById('board');
    this.lastPlayElement = document.getElementById('lastPlay');

    this.playButton = document.createElement('button');
    this.playButton.innerHTML = 'Jugar';
    this.playButton.onclick = function() {game.makePlay()};
    this.playButton.disabled = true;
    
  }
  
  startGame() {
    const suits = ['oro', 'basto', 'copa', 'espada'];
    const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    this.deck = [];
    values.forEach( value => {
      suits.forEach( suit => {
        this.deck.push(Card(value, suit));
      })
    });

    this.board = [];
    for (let i = 0; i < 4; i++) {
      const card = this.drawCard();
      this.board.push(card);
      this.boardElement.append(card);
    }
    
    this.player1.hand = [];
    for (let i = 0; i < 3; i++) {
      this.player1.deal(this.drawCard());
    }
    this.player1.handHTML();

    this.player2.hand = [];
    for (let i = 0; i < 3; i++) {
      this.player2.deal(this.drawCard());
    }

    document.getElementById('playButton').append(this.playButton);

    document.getElementById("startButton").remove();
  }

  drawCard() {
    const randomIndex = Math.floor(Math.random()*this.deck.length);
    const randomCard = this.deck.splice(randomIndex, 1);
    return randomCard[0];
  }

  cardPressed(card) {
    const {zone} = card;
    if (zone == 'hand') {
      const currentCard = this.player1.selectedCard;
      if (currentCard != null) {
        currentCard.className = currentCard.className.replace(' selected', '');
      }
      this.player1.selectedCard = card;
      card.className += ' selected';
    } else if (card.className.includes('selected')) {
      card.className = card.className.replace(' selected', '');
    } else {
      card.className += ' selected';
    }

    let sum = 0;
    this.board.forEach( card => {
      if (card.className.includes('selected')) sum += parseInt(card.value);
    });
    if (sum == 0 && this.player1.selectedCard != null) {
      this.playButton.disabled = false;
    } else if (this.player1.selectedCard != null) {
      sum += parseInt(this.player1.selectedCard.value);
      if (sum == 15) {
        this.playButton.disabled = false;
      } else {
        this.playButton.disabled = true;
      }
    } else {
      this.playButton.disabled = true;
    }
  }

  makePlay() {
    // Player play
    console.log('making play');
    const currentCard = this.player1.selectedCard;
    currentCard.className = currentCard.className.replace(' selected', ' ');
    this.playButton.disabled = true;
    const lastPlay = [{suit: currentCard.suit, value: currentCard.value}];

    if (this.board.reduce( (acc, card) => acc || card.className.includes('selected'), false)) {
      //console.log('recogiendo')
      currentCard.remove();
      this.player1.pool.push(currentCard);

      const newBoard = [];
      this.board.forEach( card => {
        if (card.className.includes('selected')) {
          this.player1.pool.push(card);
          lastPlay.push({suit: card.suit, value: card.value});
          card.remove();
        } else {
          newBoard.push(card);
        }
      });
      this.board = newBoard;

      if (this.board.length == 0) this.player1.escoboas += 1;

    } else {
      //console.log('botando')
      this.board.push(currentCard);
      currentCard.zone = 'board';
      this.boardElement.append(currentCard);
    }

    const cardHandIndex = this.player1.hand.findIndex( card => card == currentCard);
    this.player1.hand.splice(cardHandIndex, 1);
    this.player1.selectedCard = null;

    // AI play
    this.aiPlay(lastPlay);
    
    if (this.player1.hand.length == 0) {
      console.log('repartir de nuevo')
    }
  }

  aiPlay(lastPlay) {
    const aiPlay = this.player2.ai.makePlay({
      board: this.board.map( card => ({suit: card.suit, value: card.value})),
      hand: this.player2.hand.map( card => ({suit: card.suit, value: card.value})),
      lastPlay
    });
    //console.log(`ai jugo ${aiPlay}`);

    const currentCard = this.player2.hand[aiPlay[0]];
    
    if (aiPlay.length > 1) {
      console.log('ai recogiendo');
      this.player2.pool.push(currentCard);

      const newBoard = [];
      const recogidas = [];
      this.board.forEach( (card, index) => {
        if (aiPlay.slice(1).includes(index)) {
          this.player2.pool.push(card);
          recogidas.push(card);
          card.remove();
        } else {
          newBoard.push(card);
        }
      })
      this.board = newBoard;
      this.lastPlayElement.innerHTML = `Oponente recogió ${recogidas.map(card => card.name)} con ${currentCard.name}`;

      if (this.board.length == 0) this.player2.escoboas += 1;

    } else {
      console.log('ai botando');
      this.board.push(currentCard);
      currentCard.zone = 'board';
      this.boardElement.append(currentCard);
      this.lastPlayElement.innerHTML = `Oponente botó ${currentCard.name}`
    }

    this.player2.hand.splice(aiPlay[0], 1);
  }
}

function Card(value, suit) {
  const element = document.createElement('button')
  element.name = `${value<8?value:value+2} de ${suit}`;
  element.innerHTML = element.name;
  element.value = value;
  element.suit = suit;
  element.zone = 'board';
  element.className = `card ${suit}`;
  element.onclick = function() {game.cardPressed(this)};
  return element;
}

class PlayerManager {
  constructor(ai = null) {
    this.hand = [];
    this.handElement = document.getElementById('hand');
    this.points = 0;
    this.selectedCard = null;
    this.pool = [];
    this.escoboas = 0;
    this.ai = ai;
  }
  
  deal(card) {
    card.zone = 'hand'
    this.hand.push(card);
  }
  
  handHTML(playable) {
    this.hand.forEach( card => this.handElement.append(card))
  }
}

const game = new GameManager();
game.startGame();
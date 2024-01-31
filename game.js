class GameManager {
  constructor() {
    
    this.player1 = new PlayerManager();
    this.player2 = new PlayerManager();
    const startingPlayer = Math.ceil(Math.random()*2);
    
  }
  
  startGame() {
    const suits = ['oro', 'basto', 'copa', 'espada'];
    const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    this.deck = [];
    values.forEach( value => {
      suits.forEach( suit => {
        this.deck.push(new Card(value, suit));
      })
    });

    this.board = [];
    for (let i = 0; i < 4; i++) {
      this.board.push(this.drawCard());
    }
    document.getElementById('board').innerHTML = this.boardHTML();
    
    this.player1.hand = [];
    for (let i = 0; i < 3; i++) {
      this.player1.deal(this.drawCard());
    }
    document.getElementById("hand").innerHTML = this.player1.handHTML();

    this.player2.hand = [];
    for (let i = 0; i < 3; i++) {
      this.player2.deal(this.drawCard());
    }

    document.getElementById("startButton").style = "display: none"
  }

  drawCard() {
    console.log(this.deck.length)
    const randomIndex = Math.floor(Math.random()*this.deck.length);
    const randomCard = this.deck.splice(randomIndex, 1);
    console.log(randomCard);
    return randomCard[0];
  }

  boardHTML() {
    return this.board.map( card => card.cardHTML());
  }
}

class Card {
  constructor(value, suit) {
    this.value = value;
    this.suit = suit;
    this.name = `${value<8?value:value+2} de ${suit}`;
  }
  
  cardHTML() {
    return `
      <button>${this.name}</button>
    `
  }
}

class PlayerManager {
  constructor() {
    this.hand = [];
    this.points = 0;
  }
  
  deal(card) {
    this.hand.push(card);
  }
  
  handHTML() {
    return `
      <div>
        ${this.hand.map( card => card.cardHTML())}
      </div>
      <button>Jugar</button>
    `;
  }
}

const game = new GameManager();
//game.startGame();
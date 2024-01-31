class GameManager {
  constructor() {
    const suits = ['oro', 'basto', 'copa', 'espada'];
    const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    this.deck = [];
    values.forEach( value => {
      suits.forEach( suit => {
        this.deck.push(new Card(value, suit));
      })
    });
    
    this.player1 = new PlayerManager();
    this.player2 = new PlayerManager();
  }
  
  startGame() {
    const startingPlayer = Math.ceil(Math.random()*2);
    this.player1.deal(this.deck[1]);
    document.getElementById("hand").innerHTML = this.player1.handHTML();
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
    return this.hand.map( card => card.cardHTML());
  }
}

const game = new GameManager();
game.startGame();
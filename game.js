class GameManager {
  constructor() {
    
    this.player1 = new PlayerManager();
    this.player2 = new PlayerManager();
    this.startingPlayer = Math.ceil(Math.random()*2);

    this.playButton = document.createElement('button');
    this.playButton.innerHTML = 'Jugar';
    this.playButton.disabled = true;
    
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
    this.boardHTML();
    
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

    document.getElementById("startButton").style = "display: none"
  }

  drawCard() {
    //console.log(this.deck.length)
    const randomIndex = Math.floor(Math.random()*this.deck.length);
    const randomCard = this.deck.splice(randomIndex, 1);
    //console.log(randomCard);
    return randomCard[0];
  }

  boardHTML() {
    document.getElementById('board').innerHTML = this.board.map( card => card.cardHTML());
  }

  cardPressed(zone, name) {
    if (zone == 'hand') {
      this.player1.selectedCard = this.player1.hand.findIndex( card => card.name == name);
      this.player1.handHTML();
    } else {
      const selectedCard = this.board[this.board.findIndex( card => card.name == name)];
      selectedCard.selected = !selectedCard.selected;
      this.boardHTML();
    }
  }
}

class Card {
  constructor(value, suit) {
    this.value = value;
    this.suit = suit;
    this.name = `${value<8?value:value+2} de ${suit}`;
    this.zone = 'board';
    this.selected = false;
  }
  
  cardHTML(selected = this.selected) {
    return `
      <button onclick="game.cardPressed('${this.zone}', '${this.name}')" class="card ${this.suit} ${selected&&'selected'}">
        ${this.name}
      </button>
    `
  }
}

class PlayerManager {
  constructor() {
    this.hand = [];
    this.points = 0;
    this.selectedCard = -1;
  }
  
  deal(card) {
    card.zone = 'hand'
    this.hand.push(card);
  }
  
  handHTML(playable) {
    document.getElementById("hand").innerHTML = `
      ${this.hand.map( (card, i) => card.cardHTML(i==this.selectedCard))}
    `;
  }
}

const game = new GameManager();
game.startGame();
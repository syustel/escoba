class GameManager {
  constructor() {
    
    this.player1 = new PlayerManager();
    this.player2 = new PlayerManager();
    this.startingPlayer = Math.ceil(Math.random()*2);

    this.boardElement = document.getElementById('board');

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
  constructor() {
    this.hand = [];
    this.handElement = document.getElementById('hand');
    this.points = 0;
    this.selectedCard = null;
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
import Noob from "./players/noob.js";
import GreedyTaker from './players/greedyTaker.js';
import GreedyTakerCautiousDiscard from './players/greedyTakerCautiousDiscard.js';

console.log('a')
const choosedOpponent = new URLSearchParams(document.location.search).get('opponent');

class GameManager {
  constructor(opponent) {
    
    this.player1 = new PlayerManager();
    this.player2 = new PlayerManager(opponent);
    this.startingPlayer = Math.ceil(Math.random()*2);
    this.lastTook = null;

    this.boardElement = document.getElementById('board');
    this.lastPlayElement = document.getElementById('lastPlay');
    this.opponentElement = document.getElementById('opponentHand');
    this.deckElement = document.getElementById('deck');
    this.playButton = document.getElementById('playButton');
    this.playButton.onclick = function() {game.startGame()};
    
  }
  
  startGame() {
    // Resetear juego
    this.player1.reset();
    this.player2.reset();
    this.boardElement.innerHTML = '';
    this.lastPlayElement.innerHTML = '';
    this.startingPlayer = this.startingPlayer == 1 ? 2 : 1;
    
    // Hacer baraja
    const suits = ['oro', 'basto', 'copa', 'espada'];
    const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    this.deck = [];
    values.forEach( value => {
      suits.forEach( suit => {
        this.deck.push(Card(value, suit));
      })
    });
    
    // Repartir cartas
    this.board = [];
    for (let i = 0; i < 4; i++) {
      const card = this.drawCard();
      this.board.push(card);
      this.boardElement.append(card);
    }
    
    this.dealHands();
    
    //document.getElementById('playButton').append(this.playButton);
    this.playButton.onclick = function() {game.makePlay()};
    this.playButton.disabled = true;
    
    //document.getElementById("startButton").remove();
    
    if (this.startingPlayer == 2) {
      this.aiPlay([]);
    }
  }
  
  drawCard() {
    const randomIndex = Math.floor(Math.random()*this.deck.length);
    const randomCard = this.deck.splice(randomIndex, 1);
    return randomCard[0];
  }
  
  dealHands() {
    if (this.player1.hand.length != 0 || this.player2.hand.length != 0) return;
    
    if (this.deck.length == 0) {
      this.endRound();
      return;
    }

    for (let i = 0; i < 3; i++) {
      this.player1.deal(this.drawCard());
    }
    this.player1.handHTML();
  
    for (let i = 0; i < 3; i++) {
      this.player2.deal(this.drawCard());
    }

    this.deckElement.innerHTML = `Baraja: ${this.deck.length}`;
    this.opponentElement.innerHTML = `Mano oponente: ${this.player2.hand.length}`;
  }

  endRound() {
    if (this.lastTook == this.player1) {
      this.lastPlayElement.innerHTML += `Te llevas ${this.board.map( card => card.name)}.`;
    } else {
      this.lastPlayElement.innerHTML += `Oponente se lleva ${this.board.map( card => card.name)}.`;
    }
    this.board.forEach( card => this.lastTook.pool.push(card));
    this.score();
    this.playButton.onclick = function() {game.startGame()};
    this.playButton.disabled = false;
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
    const currentCard = this.player1.selectedCard;
    currentCard.className = currentCard.className.replace(' selected', ' ');
    this.playButton.disabled = true;
    const lastPlay = [{suit: currentCard.suit, value: currentCard.value}];
    
    if (this.board.reduce( (acc, card) => acc || card.className.includes('selected'), false)) {
      // Recogiendo
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

      this.lastTook = this.player1;
      if (this.board.length == 0) this.player1.escobas += 1;
      
    } else {
      // Botando
      this.board.push(currentCard);
      currentCard.zone = 'board';
      this.boardElement.append(currentCard);
    }
    
    const cardHandIndex = this.player1.hand.findIndex( card => card == currentCard);
    this.player1.hand.splice(cardHandIndex, 1);
    this.player1.selectedCard = null;
    this.lastPlayElement.innerHTML = '';
    
    this.dealHands();
    
    // AI play
    if (this.player2.hand.length > 0) {
      this.aiPlay(lastPlay);
  
      this.dealHands();
    }
    
  }

  aiPlay(lastPlay) {
    const aiPlay = this.player2.ai.makePlay({
      board: this.board.map( card => ({suit: card.suit, value: card.value})),
      hand: this.player2.hand.map( card => ({suit: card.suit, value: card.value})),
      lastPlay
    });

    const currentCard = this.player2.hand[aiPlay[0]];
    
    if (aiPlay.length > 1) {
      // Recogiendo
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
      this.lastPlayElement.innerHTML = `Oponente recogió ${recogidas.map(card => card.name)} con ${currentCard.name}.<br>`;

      this.lastTook = this.player2;
      if (this.board.length == 0) this.player2.escobas += 1;
      
    } else {
      // Botando
      this.board.push(currentCard);
      currentCard.zone = 'board';
      this.boardElement.append(currentCard);
      this.lastPlayElement.innerHTML = `Oponente botó ${currentCard.name}. <br>`
    }
    
    this.player2.hand.splice(aiPlay[0], 1);
    this.opponentElement.innerHTML = `Mano oponente: ${this.player2.hand.length}`;
  }
  
  score() {
    let player1Score = {
      points: 0,
      cartasGain: 0,
      orosGain: 0,
      primeraGain: 0,
      sieteVeloGain: 0,
      prevPoints: this.player1.points
    };
    let player2Score = {
      points: 0,
      cartasGain: 0,
      orosGain: 0,
      primeraGain: 0,
      sieteVeloGain: 0,
      prevPoints: this.player2.points
    };

    // Cartas
    player1Score.cartas = this.player1.pool.length;
    player2Score.cartas = this.player2.pool.length;
    if (player1Score.cartas > 20) {
      player1Score.points++;
      player1Score.cartasGain = 1;
    }
    else if (player2Score.cartas > 20) {
      player2Score.points++;
      player2Score.cartasGain = 1
    }
    //console.log(player1Score, player2Score);

    // Oros
    player1Score.oros = this.player1.pool.filter( card => card.suit == 'oro').length;
    player2Score.oros = this.player2.pool.filter( card => card.suit == 'oro').length;
    if (player1Score.oros == 10) player1Score.orosGain = 2;
    else if (player1Score.oros > 5) player1Score.orosGain = 1;
    else if (player2Score.oros == 10) player2Score.orosGain = 2;
    else if (player2Score.oros > 5) player2Score.orosGain = 1;
    player1Score.points += player1Score.orosGain;
    player2Score.points += player2Score.orosGain;
    //console.log(player1Score, player2Score);

    // Primera
    player1Score = {...player1Score, ...this.primera(this.player1.pool)};
    player2Score = {...player2Score, ...this.primera(this.player2.pool)};
    if (player1Score.primeraSum == 28) player1Score.primeraGain = 2;
    else if (player1Score.primeraSum > player2Score.primeraSum) player1Score.primeraGain = 1;
    else if (player2Score.primeraSum == 28) player2Score.primeraGain = 2;
    else if (player1Score.primeraSum < player2Score.primeraSum) player2Score.primeraGain = 1;
    player1Score.points += player1Score.primeraGain;
    player2Score.points += player2Score.primeraGain;
    //console.log(player1Score, player2Score);

    // 7 velo
    player1Score.sieteVelo = this.player1.pool.some( card => card.name == '7 de oro');
    player2Score.sieteVelo = this.player2.pool.some( card => card.name == '7 de oro');
    if (player1Score.sieteVelo) player1Score.points++;
    else player2Score.points++;
    //console.log(player1Score, player2Score);

    // Escobas
    player1Score.escobas = this.player1.escobas;
    player2Score.escobas = this.player2.escobas;
    player1Score.points += player1Score.escobas;
    player2Score.points += player2Score.escobas;
    //console.log(player1Score, player2Score);
    
    this.player1.points += player1Score.points;
    player1Score.newPoints = this.player1.points;
    this.player1.updatePoints();
    this.player2.points += player2Score.points;
    player2Score.newPoints = this.player2.points;
    this.player2.updatePoints();

    // Display results
    this.boardElement.innerHTML = this.scoreTableHTML(player1Score, player2Score);
    if (this.player1.points >= 21) {
      this.boardElement.innerHTML = `Has ganado ${this.player1.points} a ${this.player2.points} :D`;
    } else if (this.player2.points >= 21) {
      this.boardElement.innerHTML = `Has perdido ${this.player1.points} a ${this.player2.points} :(`;
    }
  }
  
  primera(pool) {
    const highs = {
      oro: 0,
      basto: 0,
      copa: 0,
      espada: 0
    };

    pool.forEach( card => {
      if (parseInt(card.value) > highs[card.suit] && parseInt(card.value) < 8) {
        highs[card.suit] = parseInt(card.value);
      }
    });
    
    const primera = highs.oro.toString() + highs.basto.toString() + highs.copa.toString() + highs.espada.toString();
    const primeraSum = highs.oro + highs.basto + highs.copa + highs.espada;

    if (
      highs.oro == 0 ||
      highs.basto == 0 ||
      highs.copa == 0 ||
      highs.espada == 0
    ) return {primera, primeraSum: 0};
    
    return {primera, primeraSum};
  }
  
  scoreTableHTML(player1, player2) {
    return `
      <table>
        <tr>
          <th></th>
          <th>Cartas</th>
          <th>Oros</th>
          <th>Primera</th>
          <th>7 velo</th>
          <th>Escobas</th>
          <th>Total</th>
        </tr>
        <tr>
          <td>Tu</td>
          <td>+${player1.cartasGain} (${player1.cartas})</td>
          <td>+${player1.orosGain} (${player1.oros})</td>
          <td>+${player1.primeraGain} (${player1.primera})</td>
          <td>+${player1.sieteVelo ? 1 : 0}</td>
          <td>+${player1.escobas}</td>
          <td>${player1.prevPoints}+${player1.points}=${player1.newPoints}</td>
        </tr>
        <tr>
          <td>Oponente</td>
          <td>+${player2.cartasGain} (${player2.cartas})</td>
          <td>+${player2.orosGain} (${player2.oros})</td>
          <td>+${player2.primeraGain} (${player2.primera})</td>
          <td>+${player2.sieteVelo ? 1 : 0}</td>
          <td>+${player2.escobas}</td>
          <td>${player2.prevPoints}+${player2.points}=${player2.newPoints}</td>
        </tr>
      </table>
    `;
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
    this.pointsElement = document.getElementById(ai ? 'opponentPoints' : 'playerPoints');
    this.selectedCard = null;
    this.pool = [];
    this.escobas = 0;
    this.ai = ai;
  }
  
  deal(card) {
    card.zone = 'hand'
    this.hand.push(card);
  }
  
  handHTML() {
    this.hand.forEach( card => this.handElement.append(card))
  }

  updatePoints() {
    this.pointsElement.innerHTML = `Puntos: ${this.points}`;
  }

  reset() {
    this.hand = [];
    this.selectedCard = null;
    this.pool = [];
    this.escobas = 0;
  }
}

let game;
console.log(choosedOpponent)
if (choosedOpponent == 'noob') {
  game = new GameManager(new Noob());
  game.startGame();
} else if (choosedOpponent == 'greedy') {
  game = new GameManager(new GreedyTaker());
  game.startGame();
} else if (choosedOpponent == 'cautious') {
  game = new GameManager(new GreedyTakerCautiousDiscard());
  game.startGame();
} else {
  console.log('opponent not found')
}

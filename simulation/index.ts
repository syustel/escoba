import Noob from "./players/noob";
import { Card, Player, Suit } from "./players/player-interface";
import GreedyTaker from "./players/greedyTaker";
import GreedyTakerCautiousDiscard from "./players/greedyTakerCautiousDiscard";

interface PlayerManager {
    ai: Player,
    hand: Card[],
    points: number,
    pool: Card[]
}

function playGame(player1ai: Player, player2ai: Player, verbosity: boolean = false): [number, number] {
    // Init
    const player1: PlayerManager = {
        ai: player1ai,
        hand: [],
        points: 0,
        pool: []
    };
    const player2: PlayerManager = {
        ai: player2ai,
        hand: [],
        points: 0,
        pool: []
    };
    const playerOrder = [player1, player2];

    while ( (player1.points < 21 && player2.points < 21) || player1.points == player2.points) {
        // Round
        //player1ai.newRound()
        //player2ai.newRound()
    
        // Deck
        const suits: Suit[] = ['oro', 'basto', 'copa', 'espada'];
        const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        const deck: Card[] = [];
        values.forEach( value => {
            suits.forEach( suit => {
                deck.push({value, suit})
            })
        })
    
        // Deal cards
        let board: Card[] = [];
        for (let i = 0; i < 4; i++) {
            board.push(drawCard(deck));
        }
        verbosity && console.log({board})
        playerOrder.forEach( player => player.pool = []);
        let lastTook = 0;
        
        // Round start
        while (deck.length + player1.hand.length + player2.hand.length > 0) {
            verbosity && console.log('dealing hands')
            for (let i = 0; i < 3; i++) {
                player1.hand.push(drawCard(deck));
                player2.hand.push(drawCard(deck));
            }
            verbosity && console.log('player1 hand', player1.hand);
            verbosity && console.log('player2 hand', player2.hand);
    
    
            for (let i = 0; i < 3; i++) {
                // Hand start
                verbosity && console.log('Hand start')
                playerOrder.forEach( (player, index) => {
                    const play = player.ai.makePlay({
                        board: board.map( card => ({value: card.value, suit: card.suit})),
                        hand: player.hand.map( card => ({value: card.value, suit: card.suit})),
                        lastPlay: []
                    })
                    verbosity && console.log(play);
                    if (play.length == 1) {
                        // Discard
                        board.push(player.hand[play[0]]);
                    } else {
                        // Pick
                        let sum = player.hand[play[0]].value;
                        player.pool.push(player.hand[play[0]]);
                        const newBoard: Card[] = []
                        board.forEach( (card, index) => {
                            if (play.slice(1).includes(index)) {
                                player.pool.push(card);
                                sum += card.value;
                            } else {
                                newBoard.push(card);
                            }
                        });
                        if (sum != 15) throw new Error('Jugada no suma 15')
                        board = newBoard;
                        if (board.length == 0) player.points++;
                        lastTook = index;
                    }
                    player.hand.splice(play[0], 1);
    
                    verbosity && console.log({board})
                    verbosity && console.log('player hand', player.hand);
                });
            }
        }
        playerOrder[lastTook].pool.push(...board);
    
        verbosity && console.log('player1 pool', player1.pool);
        verbosity && console.log('player2 pool', player2.pool);
    
        // Score calculation
    
        // Cards
        if (player1.pool.length == 40) player1.points += 21;
        else if (player1.pool.length > 20) player1.points++;
        else if (player2.pool.length == 40) player2.points += 21;
        else if (player2.pool.length > 20) player2.points++;
    
        // Oros
        const player1Oros = player1.pool.filter( card => card.suit == 'oro').length;
        const player2Oros = player2.pool.filter( card => card.suit == 'oro').length;
        if (player1Oros == 10) player1.points += 2;
        else if (player1Oros > 5) player1.points++;
        else if (player2Oros == 10) player2.points += 2;
        else if (player2Oros > 5) player2.points++;
    
        // Primera
        const player1Primera = primera(player1.pool);
        const player2Primera = primera(player2.pool);
        if (player1Primera == 28) player1.points += 2;
        else if (player1Primera > player2Primera) player1.points++;
        else if (player2Primera == 28) player2.points += 2;
        else if (player2Primera > player1Primera) player2.points++;
    
        // 7 velo
        if (player1.pool.some( ({value, suit}) => value == 7 && suit == 'oro')) {
            player1.points++
        } else player2.points++;

        playerOrder.push(playerOrder.splice(0, 1)[0]);
    }



    return [player1.points, player2.points];
}

function drawCard(deck: Card[]): Card {
    const randomIndex = Math.floor(Math.random() * deck.length);
    const randomCard = deck.splice(randomIndex, 1);
    return randomCard[0]
}

function primera(pool: Card[]): number {
    const highs = {
        oro: 0,
        basto: 0,
        copa: 0,
        espada: 0
    };

    pool.forEach( ({value, suit}) => {
        if (value > highs[suit] && value < 8) highs[suit] = value;
    });

    if (
      highs.oro == 0 ||
      highs.basto == 0 ||
      highs.copa == 0 ||
      highs.espada == 0
    ) return 0;

    return highs.oro + highs.basto + highs.copa + highs.espada;
}

const p1 = new Noob();
const g1 = new GreedyTaker();
const gtcd = new GreedyTakerCautiousDiscard();
const g2 = new GreedyTaker(['7velo', 'cartas', 'oros'])
const wins = [0, 0];
const reps = 10000;
console.log('starting simulation');
for (let i = 0; i < reps; i ++) {
    const result = playGame(gtcd, g1);
    if (result[0] > result[1]) {
        wins[0]++;
    } else {
        wins[1]++;
    }
}
console.log(wins.map( win => win*100/reps));
//*/

/*console.log('simulation');
//const gt = new GreedyTaker();
const gtcd = new GreedyTakerCautiousDiscard();
const play = gtcd.makePlay({
    board: [
        {
            value: 10,
            suit: 'basto'
        },
        {
            value: 7,
            suit: 'basto'
        }
    ],
    hand: [
        {
            value: 4,
            suit: 'espada'
        },
        {
            value: 7,
            suit: 'oro'
        },
        {
            value: 9,
            suit: 'espada'
        }
    ],
    lastPlay: []
})
console.log(play)
//*/
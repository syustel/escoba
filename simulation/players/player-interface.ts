export interface Card {
    value: number,
    suit: Suit,
    index?: number
}

export type Suit = 'oro'|'basto'|'copa'|'espada';

export interface Player {
    makePlay: (gameState: {
        board: Card[],
        hand: Card[],
        lastPlay: Card[]
    }) => number[]
}
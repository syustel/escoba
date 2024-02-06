export interface card {
    value: number,
    suit: 'oro'|'basto'|'copa'|'espada',
    index?: number
}

export interface player {
    makePlay: (gameState: {
        board: card[],
        hand: card[],
        lastPlay: card[]
    }) => number[]
}
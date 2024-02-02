export default class Noob {
    constructor () {}

    makePlay(gameState) {
        
        const { board, hand } = gameState;
        board.forEach( (card, index) => card.index = index);
        board.sort( (card1, card2) => card1.value - card2.value);

        for ( let handIndex = 0; handIndex < hand.length; handIndex++) {
            const card = hand[handIndex];
            const sum = this.sumTo(15 - card.value, board);
            if (sum.length > 1) {
                return [handIndex, ...sum.map( card => card.index)];
            }
        }

        return [0];
    }

    sumTo(target, board) {
        if (board.length == 0) return [];

        for (let i = 0; i < board.length; i++) {
            if (board[i].value == target) return [board[i]];
            if (board[i].value < target) {
                const sum = this.sumTo(target-board[i].value, board.slice(i+1));
                if (sum.length > 0) {
                    return [board[i], ...sum];
                }
            } else if (board[i].value > target) return [];
        }
        return [];
    }
}
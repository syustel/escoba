import sumTo from "./sumTo";
export default class GreedyTakerCautiousDiscard {
    constructor(priorities = ['7velo', 'escoba', 'cartas', 'oros']) {
        this.priorities = priorities;
    }
    makePlay(gameState) {
        const { board, hand } = gameState;
        board.forEach((card, index) => card.index = index);
        board.sort((card1, card2) => card1.value - card2.value);
        hand.forEach((card, index) => card.index = index);
        let combinations = [];
        for (let handIndex = 0; handIndex < hand.length; handIndex++) {
            const card = hand[handIndex];
            combinations.push(...sumTo(15 - card.value, board).map(comb => [card, ...comb]));
        }
        if (combinations.length > 0) {
            // Taking
            this.priorities.forEach(priority => {
                if (combinations.length == 1)
                    return combinations[0].map(card => card.index);
                combinations = this.aplyPriority(priority, combinations, board.length);
            });
            return combinations[0].map(card => card.index);
        }
        else {
            // Discarding
            const not7Velo = hand.filter(card => !(card.value == 7 && card.suit == 'oro'));
            if (not7Velo.length == 0)
                return [0]; // discard 7 velo
            const lowSum = not7Velo.filter(card => card.value + board.reduce((prev, curr) => prev + curr.value, 0) < 5);
            if (lowSum.length > 0)
                return [hand[0].index]; // discard any low number
            const highSum = not7Velo.filter(card => card.value + board.reduce((prev, curr) => prev + curr.value, 0) > 15);
            if (highSum.length > 0) {
                const lessPosibilities = this.lessPossible15s(highSum, board);
                return [lessPosibilities]; // discard any of the less usefull
            }
            const lessPosibilities = this.lessPossible15s(not7Velo, board);
            return [lessPosibilities]; // discard any of the less usefull
        }
    }
    aplyPriority(priority, combinations, boardLength) {
        if (priority == 'cartas') {
            const max = Math.max(...combinations.map(comb => comb.length));
            return combinations.filter(comb => comb.length == max);
        }
        else if (priority == '7velo') {
            const comb7Velo = combinations.filter(comb => comb.some(card => card.value == 7 && card.suit == 'oro'));
            if (comb7Velo.length != 0)
                return comb7Velo;
            else
                return combinations;
        }
        else if (priority == 'oros') {
            const max = Math.max(...combinations.map(comb => comb.reduce((acc, curr) => {
                if (curr.suit == 'oro')
                    return acc + 1;
                else
                    return acc;
            }, 0)));
            return combinations.filter(comb => {
                const oros = comb.reduce((acc, curr) => {
                    if (curr.suit == 'oro')
                        return acc + 1;
                    else
                        return acc;
                }, 0);
                return oros == max;
            });
        }
        else if (priority == 'escoba') {
            const escoba = combinations.filter(comb => comb.length == boardLength + 1);
            if (escoba.length != 0)
                return escoba;
            else
                return combinations;
        }
    }
    // Returns de index of the card with the less amount of combinations for the opponent to sum 15
    lessPossible15s(hand, board) {
        const possible15s = hand.map(card => {
            let combinations = 0;
            for (let i = 0; i <= 10; i++) {
                if (sumTo(15 - i, [card, ...board]).length > 0)
                    combinations++;
            }
            return combinations;
        });
        const lessPosibilities = possible15s.reduce((prev, curr, index, array) => {
            if (curr < array[prev])
                return index;
            else
                return prev;
        }, 0);
        return hand[lessPosibilities].index;
    }
}

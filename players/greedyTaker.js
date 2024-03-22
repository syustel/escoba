import sumTo from "./sumTo";
export default class GreedyTaker {
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
            if (not7Velo.length != 0)
                return [not7Velo[0].index];
            else
                return [hand[0].index];
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
}

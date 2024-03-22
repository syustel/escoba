export default function sumTo(target, board) {
    if (board.length == 0)
        return [];
    const combinations = [];
    for (let i = 0; i < board.length; i++) {
        if (board[i].value > target)
            return combinations;
        else if (board[i].value == target) {
            combinations.push([board[i]]);
        }
        else if (board[i].value < target) {
            const subCombs = sumTo(target - board[i].value, board.slice(i + 1));
            combinations.push(...subCombs.map(comb => [board[i], ...comb]));
        }
    }
    return combinations;
}

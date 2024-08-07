type Costs = { [player: string]: number };
type PlayerKeys = keyof typeof costs;

function getShapleyValues(
    costs: Costs,
    costFunction: (coalition: PlayerKeys[], costs: Costs) => number
): { [player in PlayerKeys]: number } {
    const players = Object.keys(costs) as PlayerKeys[];
    const n = players.length;
    const shapleyValues: { [player in PlayerKeys]: number } = {} as { [player in PlayerKeys]: number };

    for (const player of players) {
        shapleyValues[player] = 0;
    }

    for (let coalition = 0; coalition < (1 << n); coalition++) {
        const coalitionPlayers: PlayerKeys[] = [];
        for (let i = 0; i < n; i++) {
            if (coalition & (1 << i)) {
                coalitionPlayers.push(players[i]);
            }
        }

        for (const player of coalitionPlayers) {
            const withoutPlayer = coalitionPlayers.filter(p => p !== player);
            const withPlayerValue = costFunction(coalitionPlayers, costs);
            const withoutPlayerValue = costFunction(withoutPlayer, costs);
            const marginalContribution = withPlayerValue - withoutPlayerValue;

            const coalitionSize = coalitionPlayers.length;
            const withoutPlayerSize = withoutPlayer.length;
            const weight = factorial(withoutPlayerSize) * factorial(n - coalitionSize) / factorial(n);

            shapleyValues[player] += marginalContribution * weight;
        }
    }

    return shapleyValues;
}

function factorial(n: number): number {
    return n <= 1 ? 1 : n * factorial(n - 1);
}

//

const costs: Costs = {
    P1: 1000,
    P2: 7000,
    P3: 7000,
    P4: 7000,
    P5: 7000,
    P6: 7000,
    P7: 7000,
    P8: 7000,
    P9: 7000,
    P10: 7000,
    P11: 10000,
};

function costFunction(coalition: PlayerKeys[], costs: Costs): number {
    const coalitionCosts = coalition.map(player => costs[player]).sort((a, b) => a - b);
    const totalCost = coalitionCosts.slice(-4).reduce((sum, cost) => sum + cost / 2, 0);
    const remainingSum = coalitionCosts.slice(0, -4).reduce((sum, cost) => sum + cost, 0);
    return totalCost + remainingSum;
}

const shapleyValues = getShapleyValues(costs, costFunction);
const valueDifferences: { [player in PlayerKeys]: number } = Object.fromEntries(
    Object.entries(shapleyValues).map(([player, value]) => [player, value - costs[player]])
);
console.log(shapleyValues);
console.log(valueDifferences);
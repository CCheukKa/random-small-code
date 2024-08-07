import shapley, { CostFunction, PlayerValue } from "./Shapely";

const costFunction: CostFunction = (coalition: string[], costs: PlayerValue): number => {
    const coalitionCosts = coalition.map(player => costs[player]).sort((a, b) => a - b);
    const totalCost = coalitionCosts.slice(-4).reduce((sum, cost) => sum + cost / 2, 0);
    const remainingSum = coalitionCosts.slice(0, -4).reduce((sum, cost) => sum + cost, 0);
    return totalCost + remainingSum;
}

const costs: PlayerValue = {
    Ka: 1035 + 1226,
    Martin: 5400,
    Fiona: 5400,
    Tommy: 5400,
    Ricky: 5400,
    Michelle: 5400,
};

calculateShapely(costs);
function calculateShapely(costs: PlayerValue) {
    const shapleyValues: PlayerValue = shapley(costs, costFunction);
    const valueDifferences: PlayerValue = Object.fromEntries(
        Object.entries(shapleyValues).map(([player, value]) => [player, value - costs[player]])
    );
    const valuePercents: PlayerValue = Object.fromEntries(
        Object.entries(shapleyValues).map(([player, value]) => [player, value / costs[player] * 100])
    );

    console.log(shapleyValues);
    console.log(valueDifferences);
    console.log(valuePercents);
}
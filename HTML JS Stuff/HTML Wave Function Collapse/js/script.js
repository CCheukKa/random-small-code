//#region //! setup
const weightClamp = 100; //* should encourage diversity
const seedCount = 1; //* should encourage diversity
const useSeedTypeOverride = true;
const seedTypeOverride = 'water'; //* water tends to give more interesting generation
const entropyRank = [];
var generatedTileCount = 0;
const generateInterval = () => setInterval(generateTile, 0);
// document.getElementById('generate-tile-button').addEventListener('click', generateTile);
document.getElementById('quick-generate-button').addEventListener('click', () => {
    while (generatedTileCount < Math.pow(boardLength, 2)) { generateTile(); }
    for (const button of document.getElementsByClassName('button')) { button.disabled = true; }
});
document.getElementById('generate-tile-button').addEventListener('click', () => {
    generateInterval();
    for (const button of document.getElementsByClassName('button')) { button.disabled = true; }
});
//#endregion

//#region //! html board setup
const boardElement = document.getElementById('board');
const boardLength = 64;
const board = [];
for (let y = 0; y < boardLength; y++) {
    board[y] = [];
    for (let x = 0; x < boardLength; x++) {
        const tileElement = document.createElement('div');
        tileElement.className = 'tile';
        tileElement.id = `tile-${x}:${y}`;
        tileElement.dataset.type = undefined;
        boardElement.appendChild(tileElement);
        board[y][x] = { x, y, tileElement: tileElement, type: undefined, entropy: Infinity };
        entropyRank.push(board[y][x]);
    }
}
//#endregion

//#region //! get config file
var config = {};
{ //? limit scope of fetchConfig
    // check cookie
    if (document.cookie.includes('config')) {
        console.log('cookie found')
        config = JSON.parse(document.cookie.split('; ').find(row => row.startsWith('config')).split('=')[1]);
        enableGenerateButtons();
    } else {
        console.log('cookie not found')
        fetchConfig(enableGenerateButtons);
    }
    // async function fetchConfig() {
    //     const configFetch = await (await fetch('./config/config.json')).json();
    //     console.log(configFetch);
    //     config = configFetch;
    // }
    async function fetchConfig(callback) { //? fetch md instead
        let mdContent = await (await fetch('./config/config.md')).text();
        // console.log(mdContent);
        let previous;
        do {
            previous = mdContent;
            mdContent = mdContent.replace(/<!--[\s\S]*?-->/g, ''); // remove comments
        } while (mdContent !== previous);
        let lines = mdContent.split('\r\n'); // split into lines
        lines = lines.filter(line => line.trim() !== ''); // remove empty lines
        lines = lines.map(line => line.replace(/\s/g, '')); // remove space characters

        config.types = lines.splice(0, 1)[0].split('|').filter(line => line.trim() !== ''); // push types into config object
        lines.splice(0, 1);

        lines = lines.map(line => line.replace(/^\|.*?\|/, '')); // remove first column
        lines = lines.map(line => line.replace(/\|$/, '')); // remove last column
        lines = lines.map(line => line.split('|')); // split into array
        lines = lines.map(line => line.map(weight => weight === 'null' ? null : weight)); // convert "null" to null
        lines = lines.map(line => line.map(weight => weight === '' ? undefined : weight)); // convert "" to undefined
        // console.log(JSON.parse(JSON.stringify(lines)));
        lines = lines.map(line => line.map(weight => (weight !== null && weight !== undefined) ? Number(weight) : weight)); // convert string to number
        // console.log(JSON.parse(JSON.stringify(lines)));
        // console.log(lines);

        config.weights = [];
        lines.forEach(weightRow => {
            config.weights.push(weightRow);
        });
        // console.log(config);


        // console.log(JSON.parse(JSON.stringify(config.weights)));
        // reflect config.weights diagonally
        if (config.weights.length !== config.types.length) throw new Error('config.weights.length !== config.types.length');
        for (let y = 0; y < config.weights.length; y++) {
            for (let x = 0; x < config.types.length; x++) {
                // console.log(config.weights[x][y], config.weights[y][x], !(config.weights[y][x] || config.weights[y][x] == 0));
                if (x > y && config.weights[y][x] === undefined) {
                    config.weights[y][x] = config.weights[x][y];
                }
                // console.log(config.weights[x][y], config.weights[y][x], !(config.weights[y][x] || config.weights[y][x] == 0));
            }
        }
        // console.log(config.weights);

        // console.log(config);

        // document.cookie = `config=${JSON.stringify(config)}; expires=${new Date(Date.now() + 60000).toUTCString()}`;
        document.cookie = `config=${JSON.stringify(config)}; expires=${new Date(Date.now() + 1000).toUTCString()}`;

        callback();
    }
}
//#endregion

function enableGenerateButtons() {
    for (const button of document.getElementsByClassName('button')) { button.disabled = false; }
}

function generateTile() {
    if (++generatedTileCount > Math.pow(boardLength, 2)) {
        clearInterval(generateInterval);
        return;
    }

    // *
    const tile = randomChooseLowestEntropy();
    let neighbours = enumerateNeighbours(tile);
    const typeWeights = calcTypeWeights(neighbours);
    const typeIndex = randomChooseIndex(typeWeights);

    tile.type = config.types[typeIndex];
    if (useSeedTypeOverride && generatedTileCount <= seedCount) { tile.type = seedTypeOverride; } //*
    tile.tileElement.dataset.type = tile.type;
    entropyRank.splice(entropyRank.indexOf(tile), 1);

    neighbours = neighbours.filter(tile => tile.type === undefined);
    neighbours.forEach(neighbour => {
        neighbour.entropy = calcEntropy(calcTypeWeights(enumerateNeighbours(neighbour)));
    });

    if (generatedTileCount < seedCount) { return; }
    entropyRank.sort((a, b) => a.entropy - b.entropy);
    // console.log(entropyRank);
    // console.log(tile);
    // console.log('end cycle');
}

function randomChooseLowestEntropy() {
    const minEntropy = entropyRank[0].entropy;
    const minEntropyRank = entropyRank.filter(tile => tile.entropy === minEntropy);
    const randomIndex = Math.floor(Math.random() * minEntropyRank.length);
    const randomTile = minEntropyRank[randomIndex];
    // console.log({ minEntropy, minEntropyRank, randomIndex, randomTile });
    return randomTile;
}

function enumerateNeighbours(tile) {
    // console.log(tile);
    const neighbours = [];
    if (tile.x > 0) { neighbours.push(board[tile.y][tile.x - 1]) };
    if (tile.y > 0) { neighbours.push(board[tile.y - 1][tile.x]) };
    if (tile.x < boardLength - 1) { neighbours.push(board[tile.y][tile.x + 1]) };
    if (tile.y < boardLength - 1) { neighbours.push(board[tile.y + 1][tile.x]) };
    return neighbours;
}

function calcTypeWeights(neighbours) {
    let neighbourTypes = [];
    neighbours.forEach(neighbour => {
        neighbourTypes.push(neighbour.type);
    });
    neighbourTypes = neighbourTypes.filter(type => type !== undefined); // remove undefined


    const typeWeights = [];
    if (neighbourTypes.length === 0) { //? all undefined
        for (let i = 0; i < config.types.length; i++) { typeWeights[i] = 1; }
        return typeWeights;
    }

    for (let i = 0; i < config.types.length; i++) { typeWeights[i] = 0; }
    neighbourTypes.forEach(type => {
        const typeWeight = config.weights[config.types.indexOf(type)];

        for (let i = 0; i < typeWeights.length; i++) {
            // ! null/NaN = ban
            //* intentionally break the value to act as ban
            typeWeights[i] += (typeWeight[i] === null ? NaN : typeWeight[i]);
        }
    });
    //! replace NaN with 0
    typeWeights.forEach((weight, index) => {
        if (isNaN(weight)) { typeWeights[index] = 0; }
        weight = Math.min(weight, weightClamp);
    });

    return typeWeights;
}

function randomChooseIndex(weights) {
    // console.log(weights);

    const totalWeight = weights.reduce((a, b) => a + b);
    const random = Math.random() * totalWeight;
    let sum = 0;
    for (let i = 0; i < weights.length; i++) {
        sum += weights[i];
        if (random < sum) { return i; }
    }
}

function calcEntropy(weights) {
    const weightSum = weights.reduce((a, b) => a + b, 0);
    //! log(0) will break shit!
    const weightLogWeightSum = weights.reduce((a, b) => a + (b === 0 ? 0 : b * Math.log2(b)), 0);
    const entropy = Math.log2(weightSum) - weightLogWeightSum / weightSum;
    // console.log({ weights, weightSum, weightLogWeightSum, entropy });
    return entropy;
}


function makeKMerAdjacencyTable(k: number, reads: string[]) {
    const kMerPairs = new Map<string, number>();
    for (const read of reads) {
        for (let i = 0; i <= read.length - k - 1; i++) {
            const kMerPair = read.slice(i, i + k + 1);
            kMerPairs.set(kMerPair, (kMerPairs.get(kMerPair) || 0) + 1);
        }
    }

    const kMerAdjacencyTable = Array.from(kMerPairs)
        .map(([kMerPair, count]) => {
            return {
                'First k-mer': kMerPair.slice(0, k),
                'Second k-mer': kMerPair.slice(1, k + 1),
                Count: count,
            };
        });
    console.table(kMerAdjacencyTable);
}

makeKMerAdjacencyTable(
    3,
    [
        'GTGTG',
        'GTGAC',
        'GAAGT',
        'AGTGT',
        'AAGTG',
        'CTGTA',
        'CTGAA',
        'CTGAC',
        'CCTGA',
    ]
);
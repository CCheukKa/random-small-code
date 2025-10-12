// @ts-ignore
const MiniZincRuntime = await import('https://cdn.jsdelivr.net/npm/minizinc/dist/minizinc.mjs');
const ModelCtor = MiniZincRuntime.Model;
await MiniZincRuntime.init().then(() => console.log('MiniZinc initialized'));
await MiniZincRuntime.version().then(version => console.log(version));
await MiniZincRuntime.solvers().then(solvers => console.log({ solvers }));
const model = new ModelCtor();
const mzn = await fetch('src/problem.mzn').then(res => res.text());
model.addString(mzn);
performance.mark('solve-start');
const solve = model.solve({
    options: {
        solver: 'chuffed',
        'time-limit': 10000,
        statistics: true,
        "output-objective": true,
        "intermediate-solutions": true,
        "all-solutions": true,
    }
});
solve.on('solution', solution => {
    console.log("Solution:");
    console.log(solution.output?.json);
});
solve.then(result => {
    console.log("Result:");
    console.log(result.statistics);
    console.log(result.solution?.output.json);
    console.log(`Status: ${result.status}`);
    performance.mark('solve-end');
    performance.measure('solve', 'solve-start', 'solve-end');
    const measure = performance.getEntriesByName('solve')[0];
    console.log(measure);
});
export {};
//# sourceMappingURL=zinc.js.map
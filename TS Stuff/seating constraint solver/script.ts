import type { Model as MiniZincModelType } from "minizinc";

// @ts-ignore
const MiniZincRuntime = await import('https://cdn.jsdelivr.net/npm/minizinc/dist/minizinc.mjs');
const ModelCtor = MiniZincRuntime.Model;

const model = new ModelCtor() as MiniZincModelType;

const mzn = await fetch('problem.mzn').then(res => res.text());
model.addString(mzn);

const solve = model.solve({
    options: {
        solver: 'gecode',
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
});
// import type { Model as MiniZincModelType } from "minizinc";

// runtime imports chosen dynamically so code runs both in Node and in browser
let MiniZincRuntime = undefined;
let ModelCtor = undefined;

let mzn = '';
if (typeof window !== 'undefined') {
    console.log("Running in browser");
    // browser: load the CDN runtime module
    // @ts-ignore
    const mod = await import('https://cdn.jsdelivr.net/npm/minizinc/dist/minizinc.mjs');
    MiniZincRuntime = mod;
    ModelCtor = mod.Model;
    mzn = await fetch('problem.mzn').then(res => res.text());
} else {
    console.log("Running in Node");
    // Node: load npm package and init native minizinc binary
    MiniZincRuntime = await import('minizinc');
    await MiniZincRuntime.init({
        minizinc: "C:/Users/ccheu/AppData/Local/Programs/MiniZinc/minizinc.exe"
    });
    ModelCtor = MiniZincRuntime.Model;
}

const model = new ModelCtor();

if (typeof window !== 'undefined') {
    // browser Model expects addString / addFile-with-content
    model.addString(mzn);
} else {
    // node runtime: addFile will read from filesystem
    model.addFile('problem.mzn');
}

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
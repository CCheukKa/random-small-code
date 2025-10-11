import * as MiniZinc from "minizinc";

MiniZinc.init({
    minizinc: "C:/Users/ccheu/AppData/Local/Programs/MiniZinc/minizinc.exe"
});

const model = new MiniZinc.Model();
// model.addFile('src/problem.mzn', 'var 1..3: x; int: y;');
model.addFile('src/problem.mzn');
// model.addJson({})
// model.addString('int: z;');
// model.addDznString('y = 1;');
// model.addJson({ z: 2 });

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
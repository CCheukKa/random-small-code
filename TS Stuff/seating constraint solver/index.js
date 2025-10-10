"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var MiniZinc = require("minizinc");
MiniZinc.init({
    minizinc: "C:/Users/ccheu/AppData/Local/Programs/MiniZinc/minizinc.exe"
});
var model = new MiniZinc.Model();
// model.addFile('problem.mzn', 'var 1..3: x; int: y;');
model.addFile('problem.mzn');
// model.addJson({})
// model.addString('int: z;');
// model.addDznString('y = 1;');
// model.addJson({ z: 2 });
var solve = model.solve({
    options: {
        solver: 'gecode',
        'time-limit': 10000,
        statistics: true,
        "output-objective": true,
        "intermediate-solutions": true,
        "all-solutions": true,
    }
});
solve.on('solution', function (solution) {
    var _a;
    console.log("Solution:");
    console.log((_a = solution.output) === null || _a === void 0 ? void 0 : _a.json);
});
solve.then(function (result) {
    var _a;
    console.log("Result:");
    console.log(result.statistics);
    console.log((_a = result.solution) === null || _a === void 0 ? void 0 : _a.output.json);
    console.log("Status: ".concat(result.status));
});

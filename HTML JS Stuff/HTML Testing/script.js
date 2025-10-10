// --- DOM Setup ---
function ensureButton(id, text) {
    let btn = document.getElementById(id);
    if (!btn) {
        btn = document.createElement('button');
        btn.id = id;
        btn.textContent = text;
        document.body.appendChild(btn);
    }
    return btn;
}

function ensureStatus(id) {
    let el = document.getElementById(id);
    if (!el) {
        el = document.createElement('div');
        el.id = id;
        document.body.appendChild(el);
    }
    return el;
}

const pauseSubBtn = ensureButton('pauseSubBtn', 'Pause Sub Loop');
const stopMainBtn = ensureButton('stopMainBtn', 'Stop Main Loop');
const statusDiv = ensureStatus('statusDiv');

// --- State ---
// let tickLoopPaused = false;
// let generationLoopStopped = false;
// let generationLoopPaused = false;
// let generationLoopGen = null;

function updateStatus(msg) {
    statusDiv.textContent = msg;
}

// --- Sub Loop Generator ---
// function* tickLoop() {
//     for (let i = 0; i < 1000; i++) {
//         //! Do sub loop work here (simulate with a counter)
//         updateStatus(`Sub loop: ${i + 1}/1000`);
//         yield;
//     }
// }

// --- Main Loop Generator ---
// function* generationLoop() {
//     let generation = 1;
//     while (true) {
//         updateStatus(`Main loop round ${generation}`);
//         let tickGen = tickLoop();
//         let tickResult = tickGen.next();
//         while (!tickResult.done) {
//             // Pause sub loop if requested
//             if (tickLoopPaused) {
//                 updateStatus(`Sub loop paused at ${generation}`);
//                 while (tickLoopPaused) {
//                     yield;
//                 }
//             }
//             tickResult = tickGen.next();
//             yield;
//         }
//         if (generationLoopStopped) {
//             updateStatus(`Main loop stopped after round ${generation}`);
//             generationLoopPaused = true;
//             // Wait until resumed
//             while (generationLoopPaused) {
//                 yield;
//             }
//         }

//         //!
//         generation++;
//     }
// }

// --- Loop Runner ---
// function runLoop(gen) {
//     function step() {
//         const res = gen.next();
//         if (!res.done) {
//             requestAnimationFrame(step); // Non-blocking
//         }
//     }
//     step();
// }

// --- Button Handlers ---
pauseSubBtn.addEventListener('click', () => {
    tickLoopPaused = !tickLoopPaused;
    pauseSubBtn.textContent = tickLoopPaused ? 'Resume Sub Loop' : 'Pause Sub Loop';
});

stopMainBtn.addEventListener('click', () => {
    if (!generationLoopStopped && !generationLoopPaused) {
        generationLoopStopped = true;
        stopMainBtn.textContent = 'Resume Main Loop';
    } else if (generationLoopPaused) {
        generationLoopStopped = false;
        generationLoopPaused = false;
        stopMainBtn.textContent = 'Stop Main Loop';
    }
});

// --- Start the main loop ---
window.addEventListener('DOMContentLoaded', () => {
    generationLoopGen = generationLoop();
    runLoop(generationLoopGen);
});

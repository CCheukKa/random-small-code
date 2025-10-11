int: PERCENTAGE_RESOLUTION = 100;

int: X_COUNT = 5;
int: Y_COUNT = 3;

int: X_PENALTY = 1;
int: Y_PENALTY = 2;
int: GAP_PENALTY = 4;

type Gap = record(1..X_COUNT: x, 1..Y_COUNT: y);
type Seat = record(var 1..X_COUNT: x, var 1..Y_COUNT: y);
type Group = array[int] of var Seat;

% Inject here
% Gap: gap<n> = (x: <x>, y: <y>);
% array[int] of Gap: GAPS = [gap<n>, ...];
Gap: gap1 = (x: 2, y: 1);
Gap: gap2 = (x: 2, y: 2);
array[int] of Gap: GAPS = [gap1, gap2];

% Inject here
% array[1..<n>] of var Seat: group<n>;
% array[int] of Group: groups = [group<n>, ...];
% constraint group<n>[<i>].x = <x>;
% constraint group<n>[<i>].y = <y>;
array[1..1] of var Seat: group0;
array[1..2] of var Seat: group1;
array[1..2] of var Seat: group2;
array[1..5] of var Seat: group3;
array[int] of Group: groups = [group0, group1, group2, group3];
constraint group0[1].x = 3;
constraint group0[1].y = 1;

int: groupCount = length(groups);
int: totalCount = sum([length(groups[i]) | i in 1..groupCount]);
array[1..totalCount] of var Seat: concatGroup = array1d(
    1..totalCount,
    [ groups[a][i] | a in 1..groupCount, i in index_set(groups[a]) ]
);

constraint assert(X_COUNT * Y_COUNT - length(GAPS) >= totalCount,
    "Not enough seats in total! (Have: "
    ++ show(X_COUNT * Y_COUNT - length(GAPS))
    ++ ", Need: "
    ++ show(totalCount)
    ++ ")"
);

constraint unique(concatGroup);
constraint noGap(concatGroup);

var int: distance = sum([
    intragroupDistance(g)
    + frontDistance(g)
    + gapPercentage(g) * GAP_PENALTY
    | g in groups
]);
solve minimize distance;

% -------------------------------------------------------------------------------------------

function var int: intragroupDistance(Group: g) = (
    sum([
        abs(g[i].x - g[j].x) * X_PENALTY
        + abs(g[i].y - g[j].y) * Y_PENALTY
        | i in 1..length(g)-1, j in i+1..length(g)
    ])
);

function var int: frontDistance(Group: g) = (
    sum([
        g[i].y - 1
        | i in index_set(g)
    ])
);

function var bool: unique(Group: g) = (
    forall(i in 1..length(g)-1) (
        forall(j in i+1..length(g)) (
            g[i] != g[j]
        )
    )
);

function var bool: noGap(Group: g) = (
    forall(i in index_set(g)) (
        forall(j in index_set(GAPS)) (
            g[i] != GAPS[j]
        )
    )
);

function var int: gapPercentage(Group: g) = (
    let {
        Seat: minSeat = (x: min([g[i].x | i in index_set(g)]), y: min([g[i].y | i in index_set(g)]));
        Seat: maxSeat = (x: max([g[i].x | i in index_set(g)]), y: max([g[i].y | i in index_set(g)]));
        var 1..X_COUNT*Y_COUNT: boxSize = (maxSeat.x - minSeat.x + 1) * (maxSeat.y - minSeat.y + 1);
        var int: gapCount = sum([isWithinBox(GAPS[i], minSeat, maxSeat) | i in index_set(GAPS)])
    } in (
        if length(g) <= 1 \/ boxSize <= 0
            then 0
            else PERCENTAGE_RESOLUTION - (PERCENTAGE_RESOLUTION * gapCount) div boxSize
        endif
    )
);

function var bool: isWithinBox(Seat: testSeat, Seat: minSeat, Seat: maxSeat) = (
    minSeat.x <= testSeat.x /\ testSeat.x <= maxSeat.x
    /\
    minSeat.y <= testSeat.y /\ testSeat.y <= maxSeat.y
);
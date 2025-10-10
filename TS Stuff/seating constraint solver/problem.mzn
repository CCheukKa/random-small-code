int: X_COUNT = 5;
int: Y_COUNT = 3;
array[int] of float: X_GAPS = [];
array[int] of float: Y_GAPS = [];

int: X_PENALTY = 1;
int: Y_PENALTY = 2;
int: X_GAP_PENALTY = 4;
int: Y_GAP_PENALTY = 8;

type Seat = record(var 1..X_COUNT: x, var 1..Y_COUNT: y);
type Group = array[int] of var Seat;

array[1..1] of var Seat: g0;
array[1..2] of var Seat: g1;
array[1..2] of var Seat: g2;
array[1..5] of var Seat: g3;
array[int] of Group: groups = [g0, g1, g2, g3];
constraint g0[1].x = 3;
constraint g0[1].y = 1;

int: groupCount = length(groups);
int: totalCount = sum([length(groups[i]) | i in 1..groupCount]);
array[1..totalCount] of var Seat: concatGroup = array1d(
    1..totalCount,
    [ groups[a][i] | a in 1..groupCount, i in index_set(groups[a]) ]
);

constraint assert(X_COUNT * Y_COUNT >= totalCount,
    "Not enough seats in total! (Have: "
    ++ show(X_COUNT * Y_COUNT)
    ++ ", Need: "
    ++ show(totalCount)
    ++ ")"
);

constraint unique(concatGroup);

var int: distance = sum([intragroupDistance(g) + frontDistance(g) | g in groups]);
solve minimize distance;

% -------------------------------------------------------------------------------------------

function var int: intragroupDistance(Group: g) = (
    sum([
        abs(g[i].x - g[j].x) * X_PENALTY
        + abs(g[i].y - g[j].y) * Y_PENALTY
        + sum([
                isGapped(xGap, g[i].x, g[j].x) * X_GAP_PENALTY
                | xGap in X_GAPS
            ])
        + sum([
                isGapped(yGap, g[i].y, g[j].y) * Y_GAP_PENALTY
                | yGap in Y_GAPS
            ])
        | i in 1..length(g)-1, j in i+1..length(g)
    ])
);

function var int: frontDistance(Group: g) = (
    sum([
        g[i].y - 1
        | i in 1..length(g)
    ])
);

function var bool: unique(Group: g) = (
    forall(i in 1..length(g)-1) (
        forall(j in i+1..length(g)) (
            g[i] != g[j]
        )
    )
);

function var bool: isGapped(float: gap, var int: a, var int: b) = (
    if a < b then
        gap > a /\ gap < b
    else
        gap > b /\ gap < a
    endif
);
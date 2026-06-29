const MAX_RANK_ID = 25;
const MIN_RANK_ID = 1;

function applyRR(currentRank, currentRR, diffRR) {
    let rank = Number(currentRank);
    let rr = Number(currentRR) + Number(diffRR);

    while (rr >= 100 && rank < MAX_RANK_ID) {
        rr -= 100;
        rank += 1;
    }

    while (rr < 0 && rank > MIN_RANK_ID) {
        rr += 100;
        rank -= 1;
    }

    if (rank >= MAX_RANK_ID && rr >= 100) {
        rank = MAX_RANK_ID;
        rr = 99;
    }

    if (rank <= MIN_RANK_ID && rr < 0) {
        rank = MIN_RANK_ID;
        rr = 0;
    }

    return {
        rank,
        rr
    };
}

function getTotalRR(rank, rr) {
    return ((Number(rank) - 1) * 100) + Number(rr);
}

module.exports = {
    applyRR,
    getTotalRR
};
function makeBar(percent) {
    const total = 10;
    const filled = Math.max(0, Math.min(total, Math.round((percent / 100) * total)));
    return "█".repeat(filled) + "░".repeat(total - filled);
}

function calculateProgress(currentRank, rr, targetRank) {
    let remainingRR = 0;

    if (currentRank >= targetRank) {
        remainingRR = 0;
    } else {
        remainingRR = ((targetRank - currentRank) * 100) - rr;
        if (remainingRR < 0) remainingRR = 0;
    }

    const totalNeeded = Math.max(1, (targetRank - 1) * 100);
    const currentPoint = ((currentRank - 1) * 100) + rr;
    const percent = remainingRR === 0 ? 100 : Math.min(100, (currentPoint / totalNeeded) * 100);

    return {
        percent: Number(percent.toFixed(1)),
        remainingRR,
        bar: makeBar(percent)
    };
}

function calculateDiffText(lastDiffRR) {
    if (lastDiffRR > 0) return `🟢 前回更新から +${lastDiffRR}RR`;
    if (lastDiffRR < 0) return `🔴 前回更新から ${lastDiffRR}RR`;
    return `⚪ 前回更新から ±0RR`;
}

module.exports = {
    makeBar,
    calculateProgress,
    calculateDiffText
};
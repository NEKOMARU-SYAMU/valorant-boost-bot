const db = require("./connection");

function addRRHistory(data) {
    db.prepare(`
        INSERT INTO rrHistory (
            userId,
            oldRank,
            oldRR,
            newRank,
            newRR,
            diffRR,
            createdAt,
            createdAtMs
        )
        VALUES (
            @userId,
            @oldRank,
            @oldRR,
            @newRank,
            @newRR,
            @diffRR,
            @createdAt,
            @createdAtMs
        )
    `).run(data);
}

function getRRHistory(userId, limit = 20) {
    return db.prepare(`
        SELECT *
        FROM rrHistory
        WHERE userId = ?
        ORDER BY createdAtMs DESC
        LIMIT ?
    `).all(userId, limit);
}

function getWeeklyRRRanking(sinceMs) {
    return db.prepare(`
        SELECT
            userId,
            SUM(diffRR) AS totalDiff
        FROM rrHistory
        WHERE createdAtMs >= ?
        GROUP BY userId
        ORDER BY totalDiff DESC
        LIMIT 20
    `).all(sinceMs);
}

module.exports = {
    addRRHistory,
    getRRHistory,
    getWeeklyRRRanking
};
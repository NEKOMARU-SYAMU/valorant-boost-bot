const db = require("./connection");
const { clearSubs } = require("./subs");

function saveUser(user) {
    db.prepare(`
        INSERT OR REPLACE INTO users (
            userId, username, targetRank, currentRank, rr,
            previousRank, previousRR, lastDiffRR,
            progress, comment, messageId, updatedAt,
            riotName, riotTag, region, lastMatchId,
            lastMatchResult, lastMatchMap, lastMatchScore,
            lastMatchRR, lastApiUpdate, apiError
        )
        VALUES (
            @userId, @username, @targetRank, @currentRank, @rr,
            @previousRank, @previousRR, @lastDiffRR,
            @progress, @comment, @messageId, @updatedAt,
            @riotName, @riotTag, @region, @lastMatchId,
            @lastMatchResult, @lastMatchMap, @lastMatchScore,
            @lastMatchRR, @lastApiUpdate, @apiError
        )
    `).run({
        ...user,
        previousRank: user.previousRank ?? null,
        previousRR: user.previousRR ?? null,
        lastDiffRR: user.lastDiffRR ?? 0,
        progress: user.progress ?? 0,
        comment: user.comment ?? "",
        messageId: user.messageId ?? null,
        updatedAt: user.updatedAt ?? null,

        riotName: user.riotName ?? null,
        riotTag: user.riotTag ?? null,
        region: user.region ?? "ap",
        lastMatchId: user.lastMatchId ?? null,
        lastMatchResult: user.lastMatchResult ?? null,
        lastMatchMap: user.lastMatchMap ?? null,
        lastMatchScore: user.lastMatchScore ?? null,
        lastMatchRR: user.lastMatchRR ?? 0,
        lastApiUpdate: user.lastApiUpdate ?? null,
        apiError: user.apiError ?? null
    });
}

function getUser(userId) {
    return db.prepare(`SELECT * FROM users WHERE userId = ?`).get(userId);
}

function getAllUsers() {
    return db.prepare(`
        SELECT *
        FROM users
        ORDER BY currentRank DESC, rr DESC
    `).all();
}

function deleteUser(userId) {
    db.prepare(`DELETE FROM users WHERE userId = ?`).run(userId);
    clearSubs(userId);
    db.prepare(`DELETE FROM undoHistory WHERE userId = ?`).run(userId);
    db.prepare(`DELETE FROM rrHistory WHERE userId = ?`).run(userId);
}

module.exports = {
    saveUser,
    getUser,
    getAllUsers,
    deleteUser
};
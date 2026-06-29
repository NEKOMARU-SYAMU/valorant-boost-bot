const db = require("./connection");
const { clearSubs } = require("./subs");

function saveUser(user) {
    db.prepare(`
        INSERT OR REPLACE INTO users (
            userId, username, targetRank, currentRank, rr,
            previousRank, previousRR, lastDiffRR,
            progress, comment, messageId, updatedAt
        )
        VALUES (
            @userId, @username, @targetRank, @currentRank, @rr,
            @previousRank, @previousRR, @lastDiffRR,
            @progress, @comment, @messageId, @updatedAt
        )
    `).run(user);
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
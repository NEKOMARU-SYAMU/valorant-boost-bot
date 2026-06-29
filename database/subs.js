const db = require("./connection");

function getSubs(userId) {
    return db.prepare(`
        SELECT *
        FROM subAccounts
        WHERE userId = ?
        ORDER BY rankId DESC
    `).all(userId);
}

function addSub(userId, rankId, amount) {
    db.prepare(`
        INSERT INTO subAccounts (
            userId,
            rankId,
            amount
        )
        VALUES (?, ?, ?)
    `).run(userId, rankId, amount);
}

function removeSub(id) {
    db.prepare(`DELETE FROM subAccounts WHERE id = ?`).run(id);
}

function clearSubs(userId) {
    db.prepare(`DELETE FROM subAccounts WHERE userId = ?`).run(userId);
}

module.exports = {
    getSubs,
    addSub,
    removeSub,
    clearSubs
};
const db = require("./connection");

function saveUndo(userId, data) {
    db.prepare(`
        INSERT OR REPLACE INTO undoHistory (
            userId,
            data
        )
        VALUES (?, ?)
    `).run(userId, JSON.stringify(data));
}

function getUndo(userId) {
    const row = db.prepare(`
        SELECT data
        FROM undoHistory
        WHERE userId = ?
    `).get(userId);

    if (!row) return null;

    return JSON.parse(row.data);
}

function clearUndo(userId) {
    db.prepare(`DELETE FROM undoHistory WHERE userId = ?`).run(userId);
}

module.exports = {
    saveUndo,
    getUndo,
    clearUndo
};
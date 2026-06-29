const db = require("./connection");

require("./schema");

module.exports = {
    db,

    ...require("./users"),
    ...require("./subs"),
    ...require("./undo"),
    ...require("./settings"),
    ...require("./history")
};
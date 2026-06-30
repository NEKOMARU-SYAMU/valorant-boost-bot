const axios = require("axios");
const config = require("../config.json");

const API_BASE = "https://api.henrikdev.xyz/valorant";

function getHeaders() {
    return config.henrikApiKey
        ? { Authorization: config.henrikApiKey }
        : {};
}

function normalizeRankName(name) {
    if (!name) return null;

    return name
        .replace("Iron", "アイアン")
        .replace("Bronze", "ブロンズ")
        .replace("Silver", "シルバー")
        .replace("Gold", "ゴールド")
        .replace("Platinum", "プラチナ")
        .replace("Diamond", "ダイヤモンド")
        .replace("Ascendant", "アセンダント")
        .replace("Immortal", "イモータル")
        .replace("Radiant", "レディアント");
}

async function getCurrentMMR(region, name, tag) {
    const url = `${API_BASE}/v3/mmr/${region}/pc/${encodeURIComponent(name)}/${encodeURIComponent(tag)}`;

    const res = await axios.get(url, {
        headers: getHeaders(),
        timeout: 15000
    });

    const current = res.data?.data?.current;

    if (!current) {
        throw new Error("MMRデータを取得できませんでした。");
    }

    return {
        rankName: normalizeRankName(current.tier?.name),
        rr: Number(current.rr ?? 0)
    };
}

async function getLatestMatch(region, name, tag) {
    const url = `${API_BASE}/v3/matches/${region}/${encodeURIComponent(name)}/${encodeURIComponent(tag)}`;

    const res = await axios.get(url, {
        headers: getHeaders(),
        timeout: 15000
    });

    const matches = res.data?.data;

    if (!Array.isArray(matches) || matches.length === 0) {
        return null;
    }

    const match = matches[0];

    return {
        matchId: match.metadata?.matchid || match.metadata?.match_id || null,
        map: match.metadata?.map || "不明",
        score: match.teams
            ? `${match.teams.red?.rounds_won ?? "?"}-${match.teams.blue?.rounds_won ?? "?"}`
            : "不明"
    };
}

module.exports = {
    getCurrentMMR,
    getLatestMatch
};
const RANKS = [
  { id: 1, name: "アイアン1", emoji: "⚫", color: 0x2f3136 },
  { id: 2, name: "アイアン2", emoji: "⚫", color: 0x2f3136 },
  { id: 3, name: "アイアン3", emoji: "⚫", color: 0x2f3136 },

  { id: 4, name: "ブロンズ1", emoji: "🟤", color: 0x8b4513 },
  { id: 5, name: "ブロンズ2", emoji: "🟤", color: 0x8b4513 },
  { id: 6, name: "ブロンズ3", emoji: "🟤", color: 0x8b4513 },

  { id: 7, name: "シルバー1", emoji: "⚪", color: 0xc0c0c0 },
  { id: 8, name: "シルバー2", emoji: "⚪", color: 0xc0c0c0 },
  { id: 9, name: "シルバー3", emoji: "⚪", color: 0xc0c0c0 },

  { id: 10, name: "ゴールド1", emoji: "🟡", color: 0xffd700 },
  { id: 11, name: "ゴールド2", emoji: "🟡", color: 0xffd700 },
  { id: 12, name: "ゴールド3", emoji: "🟡", color: 0xffd700 },

  { id: 13, name: "プラチナ1", emoji: "🔵", color: 0x3498db },
  { id: 14, name: "プラチナ2", emoji: "🔵", color: 0x3498db },
  { id: 15, name: "プラチナ3", emoji: "🔵", color: 0x3498db },

  { id: 16, name: "ダイヤモンド1", emoji: "🟣", color: 0x9b59b6 },
  { id: 17, name: "ダイヤモンド2", emoji: "🟣", color: 0x9b59b6 },
  { id: 18, name: "ダイヤモンド3", emoji: "🟣", color: 0x9b59b6 },

  { id: 19, name: "アセンダント1", emoji: "🟢", color: 0x2ecc71 },
  { id: 20, name: "アセンダント2", emoji: "🟢", color: 0x2ecc71 },
  { id: 21, name: "アセンダント3", emoji: "🟢", color: 0x2ecc71 },

  { id: 22, name: "イモータル1", emoji: "🔴", color: 0xe74c3c },
  { id: 23, name: "イモータル2", emoji: "🔴", color: 0xe74c3c },
  { id: 24, name: "イモータル3", emoji: "🔴", color: 0xe74c3c },

  { id: 25, name: "レディアント", emoji: "🟨", color: 0xf5deb3 }
];

function getRankInfo(id) {
  return RANKS.find(rank => rank.id === Number(id));
}

function getRankText(id) {
  const rank = getRankInfo(id);
  return rank ? `${rank.emoji} ${rank.name}` : "不明";
}

module.exports = {
  RANKS,
  getRankInfo,
  getRankText
};
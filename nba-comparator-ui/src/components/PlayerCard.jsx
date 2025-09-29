import React from "react";

const PlayerCard = ({
  player,
  comparison,
  season,
  isPlayoff,
  isWinner = false,
}) => {
  // Define the stats we want to display
  const stats = [
    { key: "ppg", label: "PPG", value: player.ppg },
    { key: "apg", label: "APG", value: player.raw?.ast || 0 },
    { key: "rpg", label: "RPG", value: player.raw?.reb || 0 },
    { key: "spg", label: "SPG", value: player.raw?.stl || 0 },
    { key: "bpg", label: "BPG", value: player.raw?.blk || 0 },
    { key: "fg_percent", label: "FG%", value: player.raw?.fg_pct || 0 },
    { key: "three_percent", label: "3PT%", value: player.raw?.fg3_pct || 0 },
  ];

  // Function to get stat color based on comparison
  const getStatColor = (statKey) => {
    if (!comparison || !comparison[statKey]) return "text-gray-700";

    switch (comparison[statKey]) {
      case "higher":
        return "text-green-600 font-bold";
      case "lower":
        return "text-red-600 font-bold";
      default:
        return "text-gray-700";
    }
  };

  // Function to format stat values
  const formatStatValue = (value, key) => {
    if (value === null || value === undefined) return "N/A";

    // Format percentages
    if (key.includes("percent") || key.includes("pct")) {
      return `${(value * 100).toFixed(1)}%`;
    }

    // Format other stats to 1 decimal place
    return parseFloat(value).toFixed(1);
  };

  return (
    <div
      className={`bg-white shadow-xl rounded-xl p-6 w-full border-2 transition-all duration-300 ${
        isWinner
          ? "border-yellow-400 shadow-yellow-200 shadow-2xl"
          : "border-gray-200"
      }`}
    >
      {/* Player Header */}
      <div className="flex items-center space-x-4 mb-6">
        {player.headshotUrl ? (
          <img
            src={player.headshotUrl}
            alt={player.name || "Player"}
            className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center border-2 border-gray-200">
            <span className="text-gray-600 text-2xl font-bold">
              {(player.name || "P")[0].toUpperCase()}
            </span>
          </div>
        )}
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-800 mb-1">
            {player.name || "Unknown Player"}
          </h2>
          <p className="text-gray-500 text-sm">
            {player.team || "Team Unknown"}
          </p>
          {season && (
            <p className="text-gray-400 text-xs">
              {season} {isPlayoff ? "(Playoffs)" : "(Regular Season)"}
            </p>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="space-y-3">
        {stats.map((stat) => (
          <div
            key={stat.key}
            className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0"
          >
            <span className="text-sm font-medium text-gray-600 capitalize">
              {stat.label}
            </span>
            <span className={`text-lg font-semibold ${getStatColor(stat.key)}`}>
              {formatStatValue(stat.value, stat.key)}
            </span>
          </div>
        ))}
      </div>

      {/* Additional Info */}
      {player.raw && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Games Played: {player.raw.g || "N/A"}
          </p>
        </div>
      )}
    </div>
  );
};

export default PlayerCard;

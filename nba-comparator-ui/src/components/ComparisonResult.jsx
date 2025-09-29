import React from "react";
import PlayerCard from "./PlayerCard";

const ComparisonResult = ({ result }) => {
  if (!result) return null;

  const { player1, player2, season, is_playoff } = result;

  // Create comparison object for highlighting stats
  const createComparison = (p1, p2) => {
    const comparison = {};

    // Define the stats we want to compare
    const statsToCompare = [
      "ppg",
      "apg",
      "rpg",
      "spg",
      "bpg",
      "fg_percent",
      "three_percent",
    ];

    statsToCompare.forEach((stat) => {
      let p1Value, p2Value;

      // Get values based on stat type
      switch (stat) {
        case "ppg":
          p1Value = p1.ppg;
          p2Value = p2.ppg;
          break;
        case "apg":
          p1Value = p1.raw?.ast || 0;
          p2Value = p2.raw?.ast || 0;
          break;
        case "rpg":
          p1Value = p1.raw?.reb || 0;
          p2Value = p2.raw?.reb || 0;
          break;
        case "spg":
          p1Value = p1.raw?.stl || 0;
          p2Value = p2.raw?.stl || 0;
          break;
        case "bpg":
          p1Value = p1.raw?.blk || 0;
          p2Value = p2.raw?.blk || 0;
          break;
        case "fg_percent":
          p1Value = p1.raw?.fg_pct || 0;
          p2Value = p2.raw?.fg_pct || 0;
          break;
        case "three_percent":
          p1Value = p1.raw?.fg3_pct || 0;
          p2Value = p2.raw?.fg3_pct || 0;
          break;
        default:
          p1Value = 0;
          p2Value = 0;
      }

      // Determine comparison result
      if (p1Value > p2Value) {
        comparison[stat] = "higher";
      } else if (p1Value < p2Value) {
        comparison[stat] = "lower";
      } else {
        comparison[stat] = "equal";
      }
    });

    return comparison;
  };

  // Create comparison objects for both players
  const player1Comparison = createComparison(player1, player2);
  const player2Comparison = createComparison(player2, player1);

  // Calculate overall winner based on green stats count
  const getWinner = () => {
    const player1GreenCount = Object.values(player1Comparison).filter(
      (val) => val === "higher"
    ).length;
    const player2GreenCount = Object.values(player2Comparison).filter(
      (val) => val === "higher"
    ).length;

    if (player1GreenCount > player2GreenCount) return "player1";
    if (player2GreenCount > player1GreenCount) return "player2";
    return "tie";
  };

  const winner = getWinner();

  return (
    <div className="w-full max-w-5xl mx-auto px-4">
      {/* NBA-Style Header */}
      <div className="bg-gradient-to-r from-red-600 via-red-500 to-blue-600 rounded-t-xl p-8 mb-8 shadow-lg">
        <div className="text-center text-white">
          <h2 className="text-4xl font-bold mb-2 drop-shadow-lg">
            🏀 Player Comparison
          </h2>
          {season && (
            <p className="text-xl opacity-90">
              {season} {is_playoff ? "Playoffs" : "Regular Season"}
            </p>
          )}
        </div>
      </div>

      {/* Player Cards - Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Player 1 Card */}
        <div className="relative">
          {winner === "player1" && (
            <div className="absolute -top-4 -right-4 z-10">
              <div className="bg-yellow-400 text-yellow-900 rounded-full w-12 h-12 flex items-center justify-center shadow-lg">
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
            </div>
          )}
          <PlayerCard
            player={player1}
            comparison={player1Comparison}
            season={season}
            isPlayoff={is_playoff}
            isWinner={winner === "player1"}
          />
        </div>

        {/* VS Divider - Mobile */}
        <div className="lg:hidden flex items-center justify-center my-4">
          <div className="bg-gradient-to-r from-red-500 to-blue-500 text-white rounded-full w-16 h-16 flex items-center justify-center font-bold text-xl shadow-lg">
            VS
          </div>
        </div>

        {/* Player 2 Card */}
        <div className="relative">
          {winner === "player2" && (
            <div className="absolute -top-4 -right-4 z-10">
              <div className="bg-yellow-400 text-yellow-900 rounded-full w-12 h-12 flex items-center justify-center shadow-lg">
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
            </div>
          )}
          <PlayerCard
            player={player2}
            comparison={player2Comparison}
            season={season}
            isPlayoff={is_playoff}
            isWinner={winner === "player2"}
          />
        </div>
      </div>

      {/* Stats Summary */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
          Quick Stats Summary
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="font-semibold text-gray-700">Points</div>
            <div className="text-lg">
              <span
                className={
                  player1Comparison.ppg === "higher"
                    ? "text-green-600 font-bold"
                    : "text-gray-600"
                }
              >
                {player1.ppg || "N/A"}
              </span>
              <span className="text-gray-400 mx-2">vs</span>
              <span
                className={
                  player2Comparison.ppg === "higher"
                    ? "text-green-600 font-bold"
                    : "text-gray-600"
                }
              >
                {player2.ppg || "N/A"}
              </span>
            </div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-gray-700">Assists</div>
            <div className="text-lg">
              <span
                className={
                  player1Comparison.apg === "higher"
                    ? "text-green-600 font-bold"
                    : "text-gray-600"
                }
              >
                {player1.raw?.ast
                  ? parseFloat(player1.raw.ast).toFixed(1)
                  : "N/A"}
              </span>
              <span className="text-gray-400 mx-2">vs</span>
              <span
                className={
                  player2Comparison.apg === "higher"
                    ? "text-green-600 font-bold"
                    : "text-gray-600"
                }
              >
                {player2.raw?.ast
                  ? parseFloat(player2.raw.ast).toFixed(1)
                  : "N/A"}
              </span>
            </div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-gray-700">Rebounds</div>
            <div className="text-lg">
              <span
                className={
                  player1Comparison.rpg === "higher"
                    ? "text-green-600 font-bold"
                    : "text-gray-600"
                }
              >
                {player1.raw?.reb
                  ? parseFloat(player1.raw.reb).toFixed(1)
                  : "N/A"}
              </span>
              <span className="text-gray-400 mx-2">vs</span>
              <span
                className={
                  player2Comparison.rpg === "higher"
                    ? "text-green-600 font-bold"
                    : "text-gray-600"
                }
              >
                {player2.raw?.reb
                  ? parseFloat(player2.raw.reb).toFixed(1)
                  : "N/A"}
              </span>
            </div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-gray-700">FG%</div>
            <div className="text-lg">
              <span
                className={
                  player1Comparison.fg_percent === "higher"
                    ? "text-green-600 font-bold"
                    : "text-gray-600"
                }
              >
                {player1.raw?.fg_pct
                  ? `${(player1.raw.fg_pct * 100).toFixed(1)}%`
                  : "N/A"}
              </span>
              <span className="text-gray-400 mx-2">vs</span>
              <span
                className={
                  player2Comparison.fg_percent === "higher"
                    ? "text-green-600 font-bold"
                    : "text-gray-600"
                }
              >
                {player2.raw?.fg_pct
                  ? `${(player2.raw.fg_pct * 100).toFixed(1)}%`
                  : "N/A"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparisonResult;

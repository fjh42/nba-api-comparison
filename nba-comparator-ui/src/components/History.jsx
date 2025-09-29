import React, { useState, useEffect } from "react";

const History = ({ onReplayComparison }) => {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch history from backend
  const fetchHistory = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/history?limit=10");

      if (!response.ok) {
        throw new Error("Failed to fetch comparison history");
      }

      const data = await response.json();
      setHistory(data.results || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Load history on component mount
  useEffect(() => {
    fetchHistory();
  }, []);

  // Handle clicking on a history item
  const handleHistoryClick = async (historyItem) => {
    try {
      // Re-run the comparison with the same parameters
      const response = await fetch("/compare", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          player1: historyItem.player1,
          player2: historyItem.player2,
          season: historyItem.season1 || historyItem.season2,
          is_playoff: historyItem.is_playoff,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to replay comparison");
      }

      const comparisonData = await response.json();
      onReplayComparison(comparisonData);
    } catch (err) {
      setError(err.message);
    }
  };

  // Format season display
  const formatSeason = (season) => {
    if (!season) return "";
    return `(${season})`;
  };

  // Format playoff indicator
  const formatPlayoff = (isPlayoff) => {
    return isPlayoff ? " Playoffs" : "";
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Recent Comparisons
        </h3>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading history...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Recent Comparisons
        </h3>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
        <button
          onClick={fetchHistory}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Recent Comparisons
        </h3>
        <div className="text-center py-8 text-gray-500">
          <p>No comparison history found.</p>
          <p className="text-sm mt-2">
            Start comparing players to see history here!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-blue-600 bg-clip-text text-transparent">
          📊 Recent Comparisons
        </h3>
        <button
          onClick={fetchHistory}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
        >
          Refresh
        </button>
      </div>

      <div className="space-y-2">
        {history.map((item, index) => (
          <div
            key={item.id || index}
            onClick={() => handleHistoryClick(item)}
            className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-blue-50 hover:to-blue-100 rounded-xl cursor-pointer transition-all duration-200 border border-transparent hover:border-blue-200 hover:shadow-md"
          >
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-800">
                  {item.player1}
                </span>
                <span className="text-gray-400">vs</span>
                <span className="font-medium text-gray-800">
                  {item.player2}
                </span>
              </div>
              <div className="text-sm text-gray-500 mt-1">
                {item.season1 && formatSeason(item.season1)}
                {formatPlayoff(item.is_playoff)}
                {item.timestamp && (
                  <span className="ml-2">
                    • {new Date(item.timestamp).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-blue-600 text-sm font-medium">Replay</span>
              <svg
                className="w-4 h-4 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </div>
        ))}
      </div>

      {history.length >= 10 && (
        <div className="mt-4 text-center">
          <button
            onClick={fetchHistory}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
};

export default History;

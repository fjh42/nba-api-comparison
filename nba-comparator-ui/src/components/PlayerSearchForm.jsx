import React, { useState } from "react";

const PlayerSearchForm = ({ onResults }) => {
  const [formData, setFormData] = useState({
    player1: "",
    player2: "",
    season: "",
    isPlayoff: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/compare", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          player1: formData.player1,
          player2: formData.player2,
          season: formData.season || null,
          is_playoff: formData.isPlayoff,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to fetch comparison data");
      }

      const data = await response.json();
      onResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 max-w-lg mx-auto border border-gray-100">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-blue-600 bg-clip-text text-transparent mb-2">
          🏀 Compare NBA Players
        </h2>
        <p className="text-gray-600">
          Enter two players to see their stats comparison
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Player 1 Input */}
        <div>
          <label
            htmlFor="player1"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Player 1
          </label>
          <input
            type="text"
            id="player1"
            name="player1"
            value={formData.player1}
            onChange={handleInputChange}
            placeholder="Enter player name (e.g., LeBron James)"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            required
          />
        </div>

        {/* Player 2 Input */}
        <div>
          <label
            htmlFor="player2"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Player 2
          </label>
          <input
            type="text"
            id="player2"
            name="player2"
            value={formData.player2}
            onChange={handleInputChange}
            placeholder="Enter player name (e.g., Stephen Curry)"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            required
          />
        </div>

        {/* Season Input */}
        <div>
          <label
            htmlFor="season"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Season (Optional)
          </label>
          <input
            type="text"
            id="season"
            name="season"
            value={formData.season}
            onChange={handleInputChange}
            placeholder="e.g., 2024-25 or 2025"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Playoff Toggle */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isPlayoff"
            name="isPlayoff"
            checked={formData.isPlayoff}
            onChange={handleInputChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label
            htmlFor="isPlayoff"
            className="text-sm font-medium text-gray-700"
          >
            Playoff Stats
          </label>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
            isLoading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-red-600 to-blue-600 hover:from-red-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-lg hover:shadow-xl"
          } text-white`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Comparing...
            </div>
          ) : (
            "Compare Players"
          )}
        </button>
      </form>
    </div>
  );
};

export default PlayerSearchForm;

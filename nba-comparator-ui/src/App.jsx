import { useState } from "react";
import PlayerSearchForm from "./components/PlayerSearchForm";
import ComparisonResult from "./components/ComparisonResult";
import History from "./components/History";

function App() {
  const [comparisonResult, setComparisonResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleComparisonResult = (result) => {
    setComparisonResult(result);
  };

  const handleReplayComparison = (result) => {
    setComparisonResult(result);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 via-red-500 to-blue-600 shadow-lg">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-white text-center drop-shadow-lg">
            🏀 NBA Player Comparator
          </h1>
          <p className="text-xl text-white text-center mt-2 opacity-90">
            Compare NBA players and their statistics
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Search Form */}
          <div className="lg:col-span-1">
            <PlayerSearchForm onResults={handleComparisonResult} />
          </div>

          {/* History */}
          <div className="lg:col-span-1">
            <History onReplayComparison={handleReplayComparison} />
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {comparisonResult && <ComparisonResult result={comparisonResult} />}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

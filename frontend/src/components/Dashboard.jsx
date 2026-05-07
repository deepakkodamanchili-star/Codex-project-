import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UploadZone from './UploadZone';
import ConfirmationForm from './ConfirmationForm';
import BudgetInsights from './BudgetInsights';

function Dashboard() {
  const navigate = useNavigate();
  const [extractedData, setExtractedData] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleExtractionComplete = (data) => {
    setExtractedData(data);
  };

  const handleConfirm = () => {
    setExtractedData(null);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleCancel = () => {
    setExtractedData(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-blue-600 p-4 text-white flex justify-between items-center shadow-md">
        <h1 className="text-2xl font-bold">Financial Tracker</h1>
        <button onClick={handleLogout} className="bg-red-500 px-4 py-2 rounded hover:bg-red-600 transition">Logout</button>
      </nav>

      <main className="max-w-6xl mx-auto p-8">
        <h2 className="text-3xl font-bold mb-8 text-gray-800">Your Dashboard</h2>

        {extractedData ? (
          <ConfirmationForm
            extractedData={extractedData}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
          />
        ) : (
          <UploadZone onExtractionComplete={handleExtractionComplete} />
        )}

        <div className="mt-12 border-t pt-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Budget Insights</h2>
          <BudgetInsights refreshTrigger={refreshTrigger} />
        </div>
      </main>
    </div>
  );
}

export default Dashboard;

import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

function BudgetInsights({ refreshTrigger }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/transactions', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setTransactions(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [refreshTrigger]);

  if (loading) return <p>Loading insights...</p>;
  if (transactions.length === 0) return <p className="text-gray-500">No data available. Please upload a document to get started.</p>;

  // Aggregate data
  const aggregated = {
    income: 0,
    expenditure: 0,
    investment: 0,
    emergency_funds: 0,
    loans: 0,
    insurance: 0,
  };

  transactions.forEach(tx => {
    if (aggregated[tx.type] !== undefined) {
      aggregated[tx.type] += parseFloat(tx.amount);
    }
  });

  const pieData = {
    labels: ['Expenditure', 'Investment', 'Emergency Funds', 'Loans', 'Insurance'],
    datasets: [
      {
        label: 'Spending Distribution ($)',
        data: [
          aggregated.expenditure,
          aggregated.investment,
          aggregated.emergency_funds,
          aggregated.loans,
          aggregated.insurance,
        ],
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const barData = {
    labels: ['Income vs Expenses'],
    datasets: [
      {
        label: 'Income',
        data: [aggregated.income],
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
      {
        label: 'Total Expenses (Outflow)',
        data: [
          aggregated.expenditure + aggregated.investment + aggregated.emergency_funds + aggregated.loans + aggregated.insurance
        ],
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
      }
    ],
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
      <div className="bg-white p-6 rounded shadow-md">
        <h3 className="text-xl font-semibold mb-4 text-center text-gray-700">Income vs Total Outflow</h3>
        <Bar data={barData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
      </div>
      <div className="bg-white p-6 rounded shadow-md flex flex-col items-center">
        <h3 className="text-xl font-semibold mb-4 text-center text-gray-700">Outflow Distribution</h3>
        <div className="w-64 h-64">
          <Pie data={pieData} options={{ responsive: true, maintainAspectRatio: false }} />
        </div>
      </div>
    </div>
  );
}

export default BudgetInsights;

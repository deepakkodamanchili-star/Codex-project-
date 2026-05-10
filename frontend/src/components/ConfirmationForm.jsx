import { useState } from 'react';
import axios from 'axios';

function ConfirmationForm({ extractedData, onConfirm, onCancel }) {
  const [transactions, setTransactions] = useState(extractedData.data);
  const [loading, setLoading] = useState(false);

  const handleAmountChange = (index, value) => {
    const newTx = [...transactions];
    newTx[index].amount = parseFloat(value) || 0;
    setTransactions(newTx);
  };

  const handleTypeChange = (index, value) => {
    const newTx = [...transactions];
    newTx[index].type = value;
    setTransactions(newTx);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/transactions', {
        fileId: extractedData.fileId,
        transactions: transactions
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      onConfirm();
    } catch (err) {
      console.error(err);
      alert('Error saving transactions');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow-md mb-8">
      <h3 className="text-xl font-bold mb-4 text-gray-800">Review Extracted Data</h3>
      <p className="text-gray-600 mb-6">{extractedData.message}</p>

      <form onSubmit={handleSubmit}>
        {transactions.map((tx, index) => (
          <div key={index} className="flex flex-col md:flex-row md:items-center gap-4 mb-4 p-4 border rounded bg-gray-50">
            <div className="flex-1">
              <label className="block text-sm text-gray-600">Description</label>
              <input type="text" value={tx.description} readOnly className="w-full bg-gray-200 p-2 rounded" />
            </div>
            <div className="w-48">
              <label className="block text-sm text-gray-600">Category</label>
              <select
                value={tx.type}
                onChange={(e) => handleTypeChange(index, e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="income">Income</option>
                <option value="expenditure">Expenditure</option>
                <option value="investment">Investment</option>
                <option value="emergency_funds">Emergency Funds</option>
                <option value="loans">Loans</option>
                <option value="insurance">Insurance</option>
              </select>
            </div>
            <div className="w-32">
              <label className="block text-sm text-gray-600">Amount ($)</label>
              <input
                type="number"
                value={tx.amount}
                onChange={(e) => handleAmountChange(index, e.target.value)}
                className="w-full p-2 border rounded"
                step="0.01"
              />
            </div>
          </div>
        ))}
        <div className="flex justify-end gap-4 mt-6">
          <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Cancel</button>
          <button type="submit" disabled={loading} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
            {loading ? 'Saving...' : 'Confirm & Save'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ConfirmationForm;

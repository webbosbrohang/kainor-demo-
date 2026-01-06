import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { OrderHistoryItem } from '../types';

interface HistoryChartProps {
  orders: OrderHistoryItem[];
}

const HistoryChart: React.FC<HistoryChartProps> = ({ orders }) => {
  // Process data for the chart: Group by date or just show recent orders
  // For simplicity, we'll take the last 7 unique dates or just recent orders
  // Since orders are usually fetched descending (newest first), we reverse for the chart (oldest left)
  
  const data = orders
    .slice(0, 20) // Limit to last 20 orders to keep chart readable
    .map(item => ({
      date: new Date(item.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
      amount: item.total
    }))
    .reverse();

  if (orders.length === 0) {
      return (
          <div className="w-full h-64 bg-white p-4 rounded-xl shadow-sm border border-gray-100 mt-4 flex items-center justify-center text-gray-400 text-sm">
              No order history data available.
          </div>
      )
  }

  return (
    <div className="w-full h-64 bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col">
      <h3 className="text-lg font-bold text-gray-800 mb-4 shrink-0">Recent Sales</h3>
      <div className="flex-1 min-h-0 min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 20, left: -20, bottom: 0 }}>
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 10, fill: '#6B7280' }} 
              axisLine={false}
              tickLine={false}
              interval={0} 
            />
            <YAxis 
              tick={{ fontSize: 10, fill: '#6B7280' }} 
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip 
              cursor={{ fill: '#F3F4F6' }}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
            />
            <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill="#FCD34D" />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default HistoryChart;
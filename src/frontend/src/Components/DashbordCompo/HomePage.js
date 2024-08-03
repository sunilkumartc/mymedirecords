import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const data = [
  { name: 'Jan', uploads: 20, solutions: 15, opinions: 5, clearances: 10 },
  { name: 'Feb', uploads: 25, solutions: 18, opinions: 7, clearances: 12 },
  { name: 'Mar', uploads: 30, solutions: 20, opinions: 8, clearances: 14 },
  { name: 'Apr', uploads: 28, solutions: 22, opinions: 9, clearances: 13 },
  { name: 'May', uploads: 32, solutions: 24, opinions: 10, clearances: 15 },
  { name: 'Jun', uploads: 35, solutions: 26, opinions: 12, clearances: 17 },
];

const pieData = [
  { name: 'Uploads', value: 150 },
  { name: 'Solutions', value: 105 },
  { name: 'Second Opinions', value: 45 },
  { name: 'Clearances', value: 55 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const HomePage = () => {
  return (
    <div style={{ padding: '20px' }}>
      {/* <h1 style={{ textAlign: 'center', marginBottom: '40px' }}>Welcome to MyMediRecords</h1> */}
      
      <div style={{ marginBottom: '40px', border: '1px solid #ccc', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
        <h2 style={{ marginBottom: '20px' }}>Medical Report Statistics</h2>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: '100%', maxWidth: '1000px', marginBottom: '20px' }}>
            <h3 style={{ textAlign: 'center' }}>Monthly Activity</h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="uploads" stroke="#8884d8" name="Uploads" />
                <Line type="monotone" dataKey="solutions" stroke="#82ca9d" name="Solutions" />
                <Line type="monotone" dataKey="opinions" stroke="#ffc658" name="Second Opinions" />
                <Line type="monotone" dataKey="clearances" stroke="#ff6f69" name="Clearances" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div style={{ width: '100%', maxWidth: '1000px' }}>
            <h3 style={{ textAlign: 'center' }}>Activities Overview</h3>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={150}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;

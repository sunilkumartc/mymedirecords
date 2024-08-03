import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaCalendarAlt, FaChartLine, FaFilter, FaFileMedicalAlt } from 'react-icons/fa';
import styles from './DetailedReport.module.css'; // Import CSS Module

const DetailedReport = ({ user_id }) => {
  const [categories, setCategories] = useState([]);
  const [tests, setTests] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTest, setSelectedTest] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [testResults, setTestResults] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`http://192.168.29.25:8000/app3/categories/${user_id}`);
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, [user_id]);

  useEffect(() => {
    if (selectedCategory) {
      const fetchTests = async () => {
        try {
          const response = await axios.get(`http://192.168.29.25:8000/app3/tests/${user_id}/${selectedCategory}`);
          setTests(response.data);
        } catch (error) {
          console.error('Error fetching tests:', error);
        }
      };
  
      fetchTests();
    }
  }, [selectedCategory, user_id]);
  

  useEffect(() => {
    if (selectedTest) {
      const fetchTestResults = async () => {
        try {
          const response = await axios.get(`http://192.168.29.25:8000/app3/test_results/${user_id}/${selectedCategory}/${selectedTest}`, {
            params: {
              startDate: startDate.toISOString(),
              endDate: endDate.toISOString(),
            },
          });
          setTestResults(response.data);
        } catch (error) {
          console.error('Error fetching test results:', error);
        }
      };

      fetchTestResults();
    }
  }, [selectedTest, selectedCategory, startDate, endDate, user_id]);

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setSelectedTest('');
  };

  const handleTestChange = (e) => {
    setSelectedTest(e.target.value);
  };

  return (
    <div className={styles.detailedReportWrapper}>
      <div className={styles.primaryCard}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}><FaFileMedicalAlt /> Know Your Reports</h3>
        </div>
        <div className={styles.cardBody}>
          <form className={styles.filterForm}>
            <div className={styles.formGroup}>
              <label htmlFor="category"><FaFilter /> Select Category</label>
              <select id="category" className={styles.formControl} value={selectedCategory} onChange={handleCategoryChange}>
                <option value="">Select Category</option>
                {categories.map((category, index) => (
                  <option key={index} value={category.category}>{category.category}</option>
                ))}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="test"><FaFilter /> Select Test</label>
              <select id="test" className={styles.formControl} value={selectedTest} onChange={handleTestChange}>
                <option value="">Select Test</option>
                {tests.map((test, index) => (
                  <option key={index} value={test.testname}>{test.testname}</option>
                ))}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="startDate"><FaCalendarAlt /> From</label>
              <DatePicker
                id="startDate"
                className={styles.formControl}
                selected={startDate}
                onChange={date => setStartDate(date)}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="endDate"><FaCalendarAlt /> To</label>
              <DatePicker
                id="endDate"
                className={styles.formControl}
                selected={endDate}
                onChange={date => setEndDate(date)}
              />
            </div>
          </form>
          <div className={styles.analysisSection}>
            <h4 className={styles.analysisHeading}><FaChartLine /> Analysis</h4>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart
                data={testResults}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="uploadeddatetime" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="testvalue" stroke="#8884d8" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailedReport;

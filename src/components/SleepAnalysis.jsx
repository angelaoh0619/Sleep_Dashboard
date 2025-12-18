import React, { useEffect, useState } from 'react';
import { translations } from '../translations';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ComposedChart, PieChart, Pie, Cell } from 'recharts';
import './SleepAnalysis.css';
import sleepDataCSV from '../data/sleepData.csv?raw';

const SleepAnalysis = ({ language }) => {
  const t = translations[language].analysis;

  // Helper function to translate feature names
  const translateFeatureName = (name) => {
    const featureMap = {
      'Duration': t.features.duration,
      'Deep Sleep': t.features.deepSleep,
      'Light Sleep': t.features.lightSleep,
      'Latency': t.features.latency,
      'Score': t.features.score,
      'Physical Recovery': t.features.physicalRecovery,
      'Awakening': t.features.awakening,
      'Efficiency': t.features.efficiency,
      'Mental Recovery': t.features.mentalRecovery
    };
    return featureMap[name] || name;
  };

  // Month color mapping
  const [sleepData, setSleepData] = useState([]);
  const [stats, setStats] = useState({
    bedHourAngle: 0,
    bedMinuteAngle: 0,
    wakeHourAngle: 0,
    wakeMinuteAngle: 0,
    avgBedTime: '--:--',
    avgWakeTime: '--:--',
  });
  const [activeTab, setActiveTab] = useState('overall');
  const [showScore, setShowScore] = useState(true);
  const [showDuration, setShowDuration] = useState(true);
  const [showScoreChart2, setShowScoreChart2] = useState(true);
  const [showRecoveryChart2, setShowRecoveryChart2] = useState(true);
  const [showEfficiencyChart3, setShowEfficiencyChart3] = useState(true);
  const [showAwakeningChart3, setShowAwakeningChart3] = useState(true);
  const [selectedYear, setSelectedYear] = useState(2025);
  const [selectedMonth, setSelectedMonth] = useState(5); // Default: March
  const [timelineView, setTimelineView] = useState('weekday'); // 'weekday', 'weekend'

  // Month color mapping
  const getMonthColor = (month) => {
    const colors = {
      3: 'rgba(255, 182, 193, 0.7)',  // March - Light Pink
      4: 'rgba(255, 165, 0, 0.7)',    // April - Orange
      5: 'rgba(135, 206, 250, 0.7)',  // May - Sky Blue
      6: 'rgba(144, 238, 144, 0.7)',  // June - Light Green
      7: 'rgba(221, 160, 221, 0.7)',  // July - Plum
    };
    return colors[month] || 'rgba(200, 200, 200, 0.7)';
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      const lines = sleepDataCSV.split('\n');
      const rows = lines.slice(1).filter(row => row.trim());

      const parsed = rows.map((row) => {
        const cols = row.split(',');

        // Parse original_bed_time: "2025.3.12 22:17"
        const bedTimeStr = cols[0]; // e.g., "2025.3.12 22:17"
        const [bedDate, bedTime] = bedTimeStr.split(' ');

        // Parse original_wake_up_time: "2025.3.13 6:20"
        const wakeTimeStr = cols[1]; // e.g., "2025.3.13 6:20"
        const [wakeDate, wakeTime] = wakeTimeStr.split(' ');

        // Use bed date as the main date for this row
        const fullDate = bedDate;
        const dateWithoutYear = fullDate.split('.').slice(1).join('.');
        const month = parseInt(fullDate.split('.')[1]);

        // Calculate day of week (0 = Sunday, 6 = Saturday)
        const [year, monthNum, day] = fullDate.split('.').map(Number);
        const dateObj = new Date(year, monthNum - 1, day);
        const dayOfWeek = dateObj.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday

        return {
          date: dateWithoutYear,
          fullDate: fullDate, // Full date for reference
          month: month,
          dayOfWeek: dayOfWeek,
          isWeekend: isWeekend,
          bedTime: bedTime, // e.g., "22:17"
          wakeTime: wakeTime, // e.g., "6:20"
          duration: parseInt(cols[2]) || 0,
          durationHours: Math.round((parseInt(cols[2]) || 0) / 60 * 10) / 10,
          remDuration: parseInt(cols[3]) || 0,
          lightDuration: parseInt(cols[4]) || 0,
          sleepLatency: parseInt(cols[5]) || 0,
          sleepScore: parseInt(cols[6]) || 0,
          physicalRecovery: parseInt(cols[7]) || 0,
          awakening: parseInt(cols[8]) || 0,
          efficiency: parseFloat(cols[9]) || 0,
          mentalRecovery: parseInt(cols[10]) || 0,
        };
      });

      console.log('Sample parsed data:', parsed[0]);
      setSleepData(parsed);
      calculateStats(parsed);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const calculateStats = (data) => {
    // Separate weekday and weekend data
    const weekdayData = data.filter(d => !d.isWeekend);
    const weekendData = data.filter(d => d.isWeekend);

    // Calculate stats for all data
    const allStats = calculateStatsForDataset(data, 'All');

    // Calculate stats for weekdays
    const weekdayStats = weekdayData.length > 0 ? calculateStatsForDataset(weekdayData, 'Weekday') : null;

    // Calculate stats for weekends
    const weekendStats = weekendData.length > 0 ? calculateStatsForDataset(weekendData, 'Weekend') : null;

    setStats({
      ...allStats,
      weekdayStats,
      weekendStats,
    });
  };

  const calculateStatsForDataset = (data, label) => {
    const avgScore = Math.round(data.reduce((sum, d) => sum + d.sleepScore, 0) / data.length);
    const avgDuration = Math.round(data.reduce((sum, d) => sum + d.duration, 0) / data.length);
    const hours = Math.floor(avgDuration / 60);
    const mins = avgDuration % 60;

    // Calculate average sleep latency: milliseconds to minutes
    const validLatencyData = data.filter(d => d.sleepLatency > 0);
    const avgLatencyMs = validLatencyData.length > 0
      ? validLatencyData.reduce((sum, d) => sum + d.sleepLatency, 0) / validLatencyData.length
      : 0;
    const avgLatency = Math.round(avgLatencyMs / 60000); // ms to minutes

    // Calculate average sleep efficiency
    const validEfficiencyData = data.filter(d => d.efficiency > 0);
    const avgEfficiency = validEfficiencyData.length > 0
      ? Math.round(validEfficiencyData.reduce((sum, d) => sum + d.efficiency, 0) / validEfficiencyData.length)
      : 0;

    // Calculate average Deep Sleep (REM) and Light Sleep duration
    const avgDeepSleep = Math.round(data.reduce((sum, d) => sum + d.remDuration, 0) / data.length);
    const avgLightSleep = Math.round(data.reduce((sum, d) => sum + d.lightDuration, 0) / data.length);

    // Convert to hours with 1 decimal
    const avgDeepSleepHours = Math.round((avgDeepSleep / 60) * 10) / 10;
    const avgLightSleepHours = Math.round((avgLightSleep / 60) * 10) / 10;

    console.log('Average Deep Sleep (total_rem_duration):', avgDeepSleepHours, 'hours');
    console.log('Average Light Sleep (total_light_duration):', avgLightSleepHours, 'hours');

    // Calculate average bed time using circular mean (for handling midnight crossover)
    const bedTimes = data.filter(d => d.bedTime).map(d => d.bedTime);
    let sinSum = 0;
    let cosSum = 0;

    bedTimes.forEach(time => {
      const [h, m] = time.split(':').map(Number);
      const totalMinutes = h * 60 + m;
      // Convert to angle (0-1440 minutes = 0-360 degrees)
      const angleInRadians = (totalMinutes / 1440) * 2 * Math.PI;
      sinSum += Math.sin(angleInRadians);
      cosSum += Math.cos(angleInRadians);
    });

    const avgAngle = Math.atan2(sinSum / bedTimes.length, cosSum / bedTimes.length);
    let avgBedMinutes = ((avgAngle / (2 * Math.PI)) * 1440 + 1440) % 1440;
    const bedHrs = Math.floor(avgBedMinutes / 60);
    const bedMins = Math.round(avgBedMinutes % 60);
    const avgBedTime = `${bedHrs}:${bedMins.toString().padStart(2, '0')}`;

    // Calculate average wake time using circular mean
    const wakeTimes = data.filter(d => d.wakeTime).map(d => d.wakeTime);
    sinSum = 0;
    cosSum = 0;

    wakeTimes.forEach(time => {
      const [h, m] = time.split(':').map(Number);
      const totalMinutes = h * 60 + m;
      const angleInRadians = (totalMinutes / 1440) * 2 * Math.PI;
      sinSum += Math.sin(angleInRadians);
      cosSum += Math.cos(angleInRadians);
    });

    const avgWakeAngle = Math.atan2(sinSum / wakeTimes.length, cosSum / wakeTimes.length);
    let avgWakeMinutes = ((avgWakeAngle / (2 * Math.PI)) * 1440 + 1440) % 1440;
    const wakeHrs = Math.floor(avgWakeMinutes / 60);
    const wakeMins = Math.round(avgWakeMinutes % 60);
    const avgWakeTime = `${wakeHrs}:${wakeMins.toString().padStart(2, '0')}`;

    // Calculate difference from target times
    const targetBedTime = 23 * 60; // 11:00 PM = 23:00
    const targetWakeTime = 6 * 60 + 20; // 6:20 AM

    // Calculate bed time difference (in minutes)
    const bedTimeDiff = avgBedMinutes - targetBedTime;
    const bedTimeDiffHrs = Math.floor(Math.abs(bedTimeDiff) / 60);
    const bedTimeDiffMins = Math.round(Math.abs(bedTimeDiff) % 60);
    const bedTimeDiffText = bedTimeDiff > 0
      ? (bedTimeDiffHrs > 0 ? `+${bedTimeDiffHrs}h ${bedTimeDiffMins}min later` : `+${bedTimeDiffMins}min later`)
      : (bedTimeDiffHrs > 0 ? `-${bedTimeDiffHrs}h ${bedTimeDiffMins}min earlier` : `-${bedTimeDiffMins}min earlier`);

    // Calculate wake time difference (in minutes)
    const wakeTimeDiff = avgWakeMinutes - targetWakeTime;
    const wakeTimeDiffHrs = Math.floor(Math.abs(wakeTimeDiff) / 60);
    const wakeTimeDiffMins = Math.round(Math.abs(wakeTimeDiff) % 60);
    const wakeTimeDiffText = wakeTimeDiff > 0
      ? (wakeTimeDiffHrs > 0 ? `+${wakeTimeDiffHrs}h ${wakeTimeDiffMins}min later` : `+${wakeTimeDiffMins}min later`)
      : (wakeTimeDiffHrs > 0 ? `-${wakeTimeDiffHrs}h ${wakeTimeDiffMins}min earlier` : `-${wakeTimeDiffMins}min earlier`);

    // Calculate clock angles (12 o'clock = 0 degrees, clockwise)
    const bedHourAngle = ((bedHrs % 12) * 30 + bedMins * 0.5) - 90; // -90 to start from top
    const bedMinuteAngle = (bedMins * 6) - 90;
    const wakeHourAngle = ((wakeHrs % 12) * 30 + wakeMins * 0.5) - 90;
    const wakeMinuteAngle = (wakeMins * 6) - 90;

    console.log('Average Bed Time:', avgBedTime, 'Angles:', bedHourAngle, bedMinuteAngle);
    console.log('Average Wake Time:', avgWakeTime, 'Angles:', wakeHourAngle, wakeMinuteAngle);
    console.log(`[${label}] Setting stats with clock angles...`);

    // Calculate sleep score distribution
    const scoreDistribution = [
      { name: 'Poor (0-25)', value: data.filter(d => d.sleepScore >= 0 && d.sleepScore <= 25).length, color: '#ff6b6b' },
      { name: 'Fair (26-50)', value: data.filter(d => d.sleepScore >= 26 && d.sleepScore <= 50).length, color: '#ffa500' },
      { name: 'Good (51-75)', value: data.filter(d => d.sleepScore >= 51 && d.sleepScore <= 75).length, color: '#ffd93d' },
      { name: 'Excellent (76-100)', value: data.filter(d => d.sleepScore >= 76 && d.sleepScore <= 100).length, color: '#51cf66' },
    ];

    // Calculate correlation with sleep score and efficiency
    const correlations = calculateCorrelations(data);

    return {
      avgScore,
      avgDuration: `${hours}h ${mins}min`,
      avgDurationMinutes: avgDuration,
      totalDays: data.length,
      bestScore: Math.max(...data.map(d => d.sleepScore)),
      avgBedTime: avgBedTime,
      avgWakeTime: avgWakeTime,
      bedTimeDiff: bedTimeDiff,
      wakeTimeDiff: wakeTimeDiff,
      bedTimeDiffText: bedTimeDiffText,
      wakeTimeDiffText: wakeTimeDiffText,
      bedHourAngle: bedHourAngle,
      bedMinuteAngle: bedMinuteAngle,
      wakeHourAngle: wakeHourAngle,
      wakeMinuteAngle: wakeMinuteAngle,
      avgLatency,
      avgEfficiency,
      avgDeepSleep,
      avgLightSleep,
      avgDeepSleepHours,
      avgLightSleepHours,
      scoreDistribution,
      correlations,
    };
  };

  // Calculate Pearson correlation coefficient
  const calculateCorrelation = (x, y) => {
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    return denominator === 0 ? 0 : numerator / denominator;
  };

  const calculateCorrelations = (data) => {
    const features = {
      'Duration': data.map(d => d.duration),
      'Deep Sleep': data.map(d => d.remDuration),
      'Light Sleep': data.map(d => d.lightDuration),
      'Latency': data.map(d => d.sleepLatency / 60000), // Convert to minutes
      'Score': data.map(d => d.sleepScore),
      'Physical Recovery': data.map(d => d.physicalRecovery),
      'Awakening': data.map(d => d.awakening),
      'Efficiency': data.map(d => d.efficiency),
      'Mental Recovery': data.map(d => d.mentalRecovery),
    };

    const sleepScore = data.map(d => d.sleepScore);
    const efficiency = data.map(d => d.efficiency);

    // Calculate correlations with sleep score
    const scoreCorrelations = Object.entries(features)
      .filter(([name]) => name !== 'Score')
      .map(([name, values]) => ({
        name,
        correlation: calculateCorrelation(values, sleepScore),
      }))
      .sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation))
      .slice(0, 5);

    // Calculate correlations with efficiency
    const efficiencyCorrelations = Object.entries(features)
      .filter(([name]) => name !== 'Efficiency')
      .map(([name, values]) => ({
        name,
        correlation: calculateCorrelation(values, efficiency),
      }))
      .sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation))
      .slice(0, 5);

    // Create correlation matrix data
    const matrixData = [];
    const featureNames = Object.keys(features);
    featureNames.forEach((feature1, i) => {
      featureNames.forEach((feature2, j) => {
        const corr = calculateCorrelation(features[feature1], features[feature2]);
        matrixData.push({
          x: feature1,
          y: feature2,
          value: corr,
        });
      });
    });

    return {
      scoreCorrelations,
      efficiencyCorrelations,
      matrixData,
      featureNames,
    };
  };

  // Get filtered data by month
  const getMonthlyData = (year, month) => {
    return sleepData.filter(d => {
      const [y, m] = d.fullDate.split('.').map(Number);
      return y === year && m === month;
    });
  };

  // Get available years and months
  const availableYears = [...new Set(sleepData.map(d => parseInt(d.fullDate.split('.')[0])))].sort((a, b) => a - b);
  const availableMonths = [...new Set(
    sleepData
      .filter(d => parseInt(d.fullDate.split('.')[0]) === selectedYear)
      .map(d => d.month)
  )].sort((a, b) => a - b);

  const monthNames = {
    1: 'January',
    2: 'February',
    3: 'March',
    4: 'April',
    5: 'May',
    6: 'June',
    7: 'July',
    8: 'August',
    9: 'September',
    10: 'October',
    11: 'November',
    12: 'December',
  };

  return (
    <section id="analysis" className="section analysis-section">
      <div className="section-content">
        <h2 className="section-title">{t.title}</h2>
        <p className="section-description">
          {t.description}
        </p>

        <div className="tab-container">
          <div className="tabs">
            <button
              className={`tab ${activeTab === 'overall' ? 'active' : ''}`}
              onClick={() => setActiveTab('overall')}
            >
              {t.overall}
            </button>
            <button
              className={`tab ${activeTab === 'monthly' ? 'active' : ''}`}
              onClick={() => setActiveTab('monthly')}
            >
              {t.monthly}
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'overall' && (
              <div className="tab-panel">
                {/* Section 1: Sleep Overview */}
                <div className="section-1">
                  <h3 className="section-subtitle">Sleep Overview</h3>

                  <div className="overview-grid">
                    {/* Bed Time & Wake Time Timeline */}
                    <div className="stat-box timeline-box">
                      <div className="stat-label">Average Sleep Timeline</div>

                      {/* Toggle buttons for Weekday/Weekend */}
                      <div className="timeline-toggle">
                        <button
                          className={`timeline-toggle-btn ${timelineView === 'weekday' ? 'active' : ''}`}
                          onClick={() => setTimelineView('weekday')}
                        >
                          {t.weekday}
                        </button>
                        <button
                          className={`timeline-toggle-btn ${timelineView === 'weekend' ? 'active' : ''}`}
                          onClick={() => setTimelineView('weekend')}
                        >
                          {t.weekend}
                        </button>
                      </div>

                      {/* Display current view data */}
                      {(() => {
                        const currentStats = timelineView === 'weekday' ? stats.weekdayStats
                          : stats.weekendStats;

                        if (!currentStats) return <div>No data available</div>;

                        const isWeekend = timelineView === 'weekend';

                        return (
                          <div className="timeline-container">
                            <div className="timeline-section">
                              <div className="timeline-icon">🌙</div>
                              <div className="timeline-label">Bed Time</div>
                              <div className="timeline-value">{currentStats.avgBedTime}</div>
                              {!isWeekend && (
                                <>
                                  <div className="timeline-target">Target: 23:00</div>
                                  <div className={`timeline-diff ${currentStats.bedTimeDiff > 0 ? 'late' : 'early'}`}>
                                    {currentStats.bedTimeDiffText}
                                  </div>
                                </>
                              )}
                            </div>

                            <div className="timeline-bar">
                              <div className="timeline-line"></div>
                              <div className="timeline-arrow">→</div>
                            </div>

                            <div className="timeline-section">
                              <div className="timeline-icon">☀️</div>
                              <div className="timeline-label">Wake Time</div>
                              <div className="timeline-value">{currentStats.avgWakeTime}</div>
                              {!isWeekend && (
                                <>
                                  <div className="timeline-target">Target: 6:20</div>
                                  <div className={`timeline-diff ${currentStats.wakeTimeDiff > 0 ? 'late' : 'early'}`}>
                                    {currentStats.wakeTimeDiffText}
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Sleep Duration Bar */}
                    <div className="stat-box">
                      <div className="stat-label">Average Sleep Duration</div>
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: `${(stats.avgDurationMinutes / 600) * 100}%` }}
                        ></div>
                      </div>
                      <div className="progress-labels">
                        <span>0h</span>
                        <span>5h</span>
                        <span>10h</span>
                      </div>
                      <div className="stat-value-large">{stats.avgDuration}</div>

                      {/* Weekday vs Weekend Duration Comparison */}
                      {stats.weekdayStats && stats.weekendStats && (
                        <div className="duration-comparison">
                          <ResponsiveContainer width="100%" height={200}>
                            <BarChart
                              data={[
                                {
                                  name: 'Weekday',
                                  duration: stats.weekdayStats.avgDurationMinutes / 60,
                                },
                                {
                                  name: 'Weekend',
                                  duration: stats.weekendStats.avgDurationMinutes / 60,
                                },
                              ]}
                              margin={{ top: 5, right: 20, left: -20, bottom: 5 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                              <XAxis
                                dataKey="name"
                                stroke="#c4b5fd"
                                tick={{ fontSize: 12, fill: '#ffffff' }}
                                dy={10}
                              />
                              <YAxis
                                stroke="#c4b5fd"
                                tick={{ fontSize: 11, fill: '#ffffff' }}
                                label={{ value: 'Hours', angle: -90, position: 'insideLeft', fill: '#ffffff', fontSize: 11, offset: 5 }}
                                domain={[0, 10]}
                              />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: 'rgba(30, 20, 50, 0.95)',
                                  border: '1px solid rgba(255,255,255,0.2)',
                                  borderRadius: '12px',
                                  padding: '10px',
                                  fontSize: '0.85rem',
                                }}
                                labelStyle={{ color: '#ffffff', fontWeight: 'bold', fontSize: '0.9rem' }}
                                itemStyle={{ color: '#ffffff' }}
                                formatter={(value) => {
                                  const hours = Math.floor(value);
                                  const minutes = Math.round((value - hours) * 60);
                                  return [`${hours}h ${minutes}min`, 'Duration'];
                                }}
                              />
                              <Bar dataKey="duration" radius={[8, 8, 0, 0]}>
                                <Cell fill="#a78bfa" />
                                <Cell fill="#ffa500" />
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </div>

                    {/* Sleep Score Circle */}
                    <div className="stat-box score-box">
                      <div className="stat-label">Average Sleep Score</div>
                      <div className="score-circle-container">
                        <svg width="160" height="160" className="score-circle">
                          <defs>
                            <linearGradient id="score-gradient-very-low" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#ff6b6b" />
                              <stop offset="100%" stopColor="#ee5a6f" />
                            </linearGradient>
                            <linearGradient id="score-gradient-low" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#ffa500" />
                              <stop offset="100%" stopColor="#ff8c42" />
                            </linearGradient>
                            <linearGradient id="score-gradient-medium" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#ffd93d" />
                              <stop offset="100%" stopColor="#f9ca24" />
                            </linearGradient>
                            <linearGradient id="score-gradient-high" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#6bcf7f" />
                              <stop offset="100%" stopColor="#51cf66" />
                            </linearGradient>
                          </defs>
                          <circle
                            cx="80"
                            cy="80"
                            r="68"
                            fill="none"
                            stroke="rgba(255,255,255,0.1)"
                            strokeWidth="12"
                          />
                          <circle
                            cx="80"
                            cy="80"
                            r="68"
                            fill="none"
                            stroke={
                              stats.avgScore <= 25 ? 'url(#score-gradient-very-low)' :
                                stats.avgScore <= 50 ? 'url(#score-gradient-low)' :
                                  stats.avgScore <= 75 ? 'url(#score-gradient-medium)' :
                                    'url(#score-gradient-high)'
                            }
                            strokeWidth="12"
                            strokeDasharray={`${(stats.avgScore / 100) * 427.3} 427.3`}
                            strokeLinecap="round"
                            transform="rotate(-90 80 80)"
                          />
                          <text
                            x="80"
                            y="92"
                            textAnchor="middle"
                            fontSize="48"
                            fontWeight="bold"
                            fill="#ffffff"
                          >
                            {stats.avgScore}
                          </text>
                        </svg>
                      </div>
                    </div>

                    {/* Sleep Latency */}
                    <div className="stat-box simple-stat">
                      <div className="stat-label">Average Sleep Latency</div>
                      <div className="stat-number">{stats.avgLatency}</div>
                      <div className="stat-unit">minutes</div>
                      <div className="stat-desc">Time to fall asleep</div>
                    </div>

                    {/* Sleep Efficiency */}
                    <div className="stat-box simple-stat">
                      <div className="stat-label">Average Sleep Efficiency</div>
                      <div className="stat-number">{stats.avgEfficiency}</div>
                      <div className="stat-unit">%</div>
                      <div className="stat-desc">Quality of sleep</div>
                    </div>
                  </div>
                </div>

                {/* Section 2: Sleep Stage & Score Distribution */}
                <div className="section-2">
                  <h3 className="section-subtitle">Sleep Stage & Score Distribution</h3>

                  <div className="section2-grid">
                    {/* REM vs Light Duration Bar Chart */}
                    <div className="chart-box">
                      <h4 className="chart-subtitle">Average Sleep Stages</h4>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                          data={[
                            { name: 'Deep Sleep', duration: stats.avgDeepSleepHours },
                            { name: 'Light Sleep', duration: stats.avgLightSleepHours },
                          ]}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                          <XAxis
                            dataKey="name"
                            stroke="#c4b5fd"
                            tick={{ fontSize: 14, fill: '#ffffff' }}
                            dy={10}
                          />
                          <YAxis
                            stroke="#c4b5fd"
                            tick={{ fontSize: 11, fill: '#ffffff' }}
                            label={{ value: 'Duration (hours)', angle: -90, position: 'insideLeft', fill: '#ffffff' }}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'rgba(30, 20, 50, 0.95)',
                              border: '1px solid rgba(255,255,255,0.2)',
                              borderRadius: '12px',
                              padding: '12px',
                              fontSize: '0.85rem',
                            }}
                            labelStyle={{ color: '#ffffff', fontWeight: 'bold', fontSize: '0.9rem' }}
                            itemStyle={{ color: '#ffffff' }}
                            formatter={(value) => {
                              const hours = Math.floor(value);
                              const minutes = Math.round((value - hours) * 60);
                              return [`${hours}h ${minutes}min`, 'Duration'];
                            }}
                          />
                          <Bar dataKey="duration" radius={[8, 8, 0, 0]}>
                            <Cell fill="#8b5cf6" />
                            <Cell fill="#64b5f6" />
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Sleep Score Distribution Pie Chart */}
                    <div className="chart-box">
                      <h4 className="chart-subtitle">Sleep Score Distribution</h4>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={stats.scoreDistribution || []}
                            cx="50%"
                            cy="45%"
                            outerRadius={90}
                            innerRadius={0}
                            paddingAngle={0}
                            dataKey="value"
                            label={({ name, percent, cx, cy, midAngle, outerRadius }) => {
                              if (percent === 0) return null;
                              const RADIAN = Math.PI / 180;
                              const radius = outerRadius + 25;
                              const x = cx + radius * Math.cos(-midAngle * RADIAN);
                              const y = cy + radius * Math.sin(-midAngle * RADIAN);
                              const label = name.split(' ')[0];
                              return (
                                <text
                                  x={x}
                                  y={y}
                                  fill="#ffffff"
                                  textAnchor={x > cx ? 'start' : 'end'}
                                  dominantBaseline="central"
                                  fontSize="13"
                                  fontWeight="600"
                                >
                                  {`${label} ${(percent * 100).toFixed(0)}%`}
                                </text>
                              );
                            }}
                            labelLine={{
                              stroke: '#c4b5fd',
                              strokeWidth: 1,
                            }}
                          >
                            {(stats.scoreDistribution || []).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                            ))}
                          </Pie>
                          <Legend
                            layout="horizontal"
                            align="center"
                            verticalAlign="bottom"
                            iconType="circle"
                            iconSize={8}
                            wrapperStyle={{ fontSize: '0.75rem', paddingTop: '10px' }}
                            formatter={(value) => (
                              <span style={{ color: '#ffffff', fontSize: '0.75rem', marginLeft: '4px' }}>{value}</span>
                            )}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'rgba(30, 20, 50, 0.95)',
                              border: '1px solid rgba(255,255,255,0.2)',
                              borderRadius: '12px',
                              padding: '10px',
                              fontSize: '0.85rem',
                            }}
                            labelStyle={{ color: '#ffffff', fontWeight: 'bold', fontSize: '0.9rem' }}
                            itemStyle={{ color: '#ffffff' }}
                            formatter={(value) => [`${value} days`, 'Count']}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Section 3: Correlation Analysis */}
                <div className="section-3">
                  <h3 className="section-subtitle">{t.correlationTitle}</h3>
                  <p className="section-description-small">
                    {t.correlationDesc}
                  </p>

                  <div className="correlation-container">
                    {/* Correlation Matrix */}
                    <div className="correlation-matrix-box">
                      <h4 className="chart-subtitle">{t.correlationMatrix}</h4>
                      <div className="matrix-container">
                        {/* Y-axis labels */}
                        <div className="matrix-y-labels">
                          {stats.correlations?.featureNames.map((name, i) => (
                            <div key={i} className="matrix-y-label">{translateFeatureName(name)}</div>
                          ))}
                        </div>

                        {/* Matrix grid and X-axis labels wrapper */}
                        <div className="matrix-main">
                          {/* Matrix grid */}
                          <div className="matrix-grid-container">
                            {stats.correlations?.featureNames.map((yFeature, i) => (
                              <div key={i} className="matrix-row">
                                {stats.correlations?.featureNames.map((xFeature, j) => {
                                  const cell = stats.correlations.matrixData.find(
                                    d => d.x === xFeature && d.y === yFeature
                                  );
                                  const value = cell?.value || 0;
                                  const intensity = Math.abs(value);
                                  const color = value >= 0
                                    ? `rgba(167, 139, 250, ${intensity * 0.8})`
                                    : `rgba(139, 92, 246, ${intensity * 0.5})`;

                                  return (
                                    <div
                                      key={j}
                                      className="matrix-cell"
                                      style={{ backgroundColor: color }}
                                      data-tooltip={`${yFeature} vs ${xFeature}: ${value.toFixed(3)}`}
                                    >
                                      <span className="matrix-value">{value.toFixed(2)}</span>
                                      <div className="matrix-tooltip">
                                        <div>{yFeature} vs {xFeature}</div>
                                        <div>Correlation: {value.toFixed(3)}</div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            ))}
                          </div>

                          {/* X-axis labels */}
                          <div className="matrix-x-labels">
                            {stats.correlations?.featureNames.map((name, i) => (
                              <div key={i} className="matrix-x-label">{translateFeatureName(name)}</div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Feature Descriptions */}
                      <div className="matrix-descriptions">
                        <div className="matrix-desc-item">
                          <span className="matrix-desc-label">{t.features.latency}:</span> {t.featureDescriptions.latency.split(': ')[1]}
                        </div>
                        <div className="matrix-desc-item">
                          <span className="matrix-desc-label">{t.features.physicalRecovery}:</span> {t.featureDescriptions.physicalRecovery.split(': ')[1]}
                        </div>
                        <div className="matrix-desc-item">
                          <span className="matrix-desc-label">{t.features.awakening}:</span> {t.featureDescriptions.awakening.split(': ')[1]}
                        </div>
                        <div className="matrix-desc-item">
                          <span className="matrix-desc-label">{t.features.mentalRecovery}:</span> {t.featureDescriptions.mentalRecovery.split(': ')[1]}
                        </div>
                      </div>
                    </div>

                    {/* Top Correlations */}
                    <div className="top-correlations">
                      {/* Sleep Score Correlations */}
                      <div className="chart-box">
                        <h4 className="chart-subtitle">{t.topCorrelatedSleepScore}</h4>
                        <ResponsiveContainer width="100%" height={250}>
                          <BarChart
                            data={stats.correlations?.scoreCorrelations || []}
                            layout="vertical"
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            barSize={20}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis type="number" domain={[-1, 1]} stroke="#999" tick={{ fill: '#ccc', fontSize: 12 }} />
                            <YAxis
                              dataKey="name"
                              type="category"
                              stroke="#999"
                              tick={{ fill: '#ccc', fontSize: 12 }}
                              tickFormatter={translateFeatureName}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: 'rgba(30, 30, 50, 0.95)',
                                border: '1px solid rgba(167, 139, 250, 0.3)',
                                borderRadius: '8px',
                                color: '#fff'
                              }}
                              formatter={(value) => value.toFixed(2)}
                              labelFormatter={translateFeatureName}
                            />
                            <Bar dataKey="correlation" radius={[0, 8, 8, 0]}>
                              {(stats.correlations?.scoreCorrelations || []).map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.correlation >= 0 ? '#a78bfa' : '#8b5cf6'} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Efficiency Correlations */}
                      <div className="chart-box">
                        <h4 className="chart-subtitle">{t.topCorrelatedEfficiency}</h4>
                        <ResponsiveContainer width="100%" height={250}>
                          <BarChart
                            data={stats.correlations?.efficiencyCorrelations || []}
                            layout="vertical"
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            barSize={20}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis type="number" domain={[-1, 1]} stroke="#999" tick={{ fill: '#ccc', fontSize: 12 }} />
                            <YAxis
                              dataKey="name"
                              type="category"
                              stroke="#999"
                              tick={{ fill: '#ccc', fontSize: 12 }}
                              tickFormatter={translateFeatureName}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: 'rgba(30, 30, 50, 0.95)',
                                border: '1px solid rgba(167, 139, 250, 0.3)',
                                borderRadius: '8px',
                                color: '#fff'
                              }}
                              formatter={(value) => value.toFixed(2)}
                              labelFormatter={translateFeatureName}
                            />
                            <Bar dataKey="correlation" radius={[0, 8, 8, 0]}>
                              {(stats.correlations?.efficiencyCorrelations || []).map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.correlation >= 0 ? '#a78bfa' : '#8b5cf6'} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}
            {activeTab === 'monthly' && (
              <div className="tab-panel">
                {/* Year and Month Selector with Dropdowns */}
                <div className="year-month-selector">
                  <div className="selector-group">
                    <label className="selector-label">Year:</label>
                    <select
                      className="year-dropdown"
                      value={selectedYear}
                      onChange={(e) => {
                        const year = parseInt(e.target.value);
                        setSelectedYear(year);
                        // Reset month to first available month of selected year
                        const monthsInYear = [...new Set(
                          sleepData
                            .filter(d => parseInt(d.fullDate.split('.')[0]) === year)
                            .map(d => d.month)
                        )].sort((a, b) => a - b);
                        if (monthsInYear.length > 0) {
                          setSelectedMonth(monthsInYear[0]);
                        }
                      }}
                    >
                      {availableYears.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>

                  <div className="selector-group">
                    <label className="selector-label">Month:</label>
                    <select
                      className="month-dropdown"
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                    >
                      {availableMonths.map(month => (
                        <option key={month} value={month}>{monthNames[month]}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Monthly Stats Summary */}
                {(() => {
                  const monthData = getMonthlyData(selectedYear, selectedMonth);
                  if (monthData.length === 0) {
                    return <div className="no-data">No data available for this period</div>;
                  }

                  const monthStats = calculateStatsForDataset(monthData, `${selectedYear}-${selectedMonth}`);

                  return (
                    <>
                      {/* Monthly Section 1: Detailed Stats */}
                      <div className="monthly-section-1">
                        <h3 className="section-subtitle">Monthly Sleep Details</h3>

                        <div className="monthly-stats-grid">
                          {/* Sleep Score Circle */}
                          <div className="stat-box score-box">
                            <div className="stat-label">Average Sleep Score</div>
                            <div className="score-circle-container">
                              <svg width="120" height="120" className="score-circle">
                                <defs>
                                  <linearGradient id="monthly-score-gradient-very-low" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#ff6b6b" />
                                    <stop offset="100%" stopColor="#ee5a6f" />
                                  </linearGradient>
                                  <linearGradient id="monthly-score-gradient-low" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#ffa500" />
                                    <stop offset="100%" stopColor="#ff8c42" />
                                  </linearGradient>
                                  <linearGradient id="monthly-score-gradient-medium" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#ffd93d" />
                                    <stop offset="100%" stopColor="#f9ca24" />
                                  </linearGradient>
                                  <linearGradient id="monthly-score-gradient-high" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#6bcf7f" />
                                    <stop offset="100%" stopColor="#51cf66" />
                                  </linearGradient>
                                </defs>
                                <circle
                                  cx="60"
                                  cy="60"
                                  r="50"
                                  fill="none"
                                  stroke="rgba(255,255,255,0.1)"
                                  strokeWidth="10"
                                />
                                <circle
                                  cx="60"
                                  cy="60"
                                  r="50"
                                  fill="none"
                                  stroke={
                                    monthStats.avgScore <= 25 ? 'url(#monthly-score-gradient-very-low)' :
                                      monthStats.avgScore <= 50 ? 'url(#monthly-score-gradient-low)' :
                                        monthStats.avgScore <= 75 ? 'url(#monthly-score-gradient-medium)' :
                                          'url(#monthly-score-gradient-high)'
                                  }
                                  strokeWidth="10"
                                  strokeDasharray={`${(monthStats.avgScore / 100) * 314} 314`}
                                  strokeLinecap="round"
                                  transform="rotate(-90 60 60)"
                                  style={{
                                    transition: 'stroke-dasharray 1s ease-out',
                                    animation: 'drawCircle 1.5s ease-out forwards'
                                  }}
                                />
                                <text
                                  x="60"
                                  y="70"
                                  textAnchor="middle"
                                  fontSize="36"
                                  fontWeight="bold"
                                  fill="#ffffff"
                                >
                                  {monthStats.avgScore}
                                </text>
                              </svg>
                            </div>
                          </div>

                          {/* Sleep Duration Bar */}
                          <div className="stat-box">
                            <div className="stat-label">Average Sleep Duration</div>
                            <div className="progress-bar">
                              <div
                                className="progress-fill"
                                style={{ width: `${(monthStats.avgDurationMinutes / 600) * 100}%` }}
                              ></div>
                            </div>
                            <div className="progress-labels">
                              <span>0h</span>
                              <span>5h</span>
                              <span>10h</span>
                            </div>
                            <div className="stat-value-medium" style={{ color: '#ffffff' }}>{monthStats.avgDuration}</div>
                          </div>

                          {/* Sleep Latency */}
                          <div className="stat-box simple-stat">
                            <div className="stat-label">Average Sleep Latency</div>
                            <div className="stat-number-small">{monthStats.avgLatency}</div>
                            <div className="stat-unit">minutes</div>
                            <div className="stat-desc">Time to fall asleep</div>
                          </div>

                          {/* Sleep Efficiency */}
                          <div className="stat-box simple-stat">
                            <div className="stat-label">Average Sleep Efficiency</div>
                            <div className="stat-number-small">{monthStats.avgEfficiency}</div>
                            <div className="stat-unit">%</div>
                            <div className="stat-desc">Quality of sleep</div>
                          </div>
                        </div>
                      </div>

                      {/* Section 2 & 3: Charts Grid */}
                      <div className="monthly-charts-grid">
                        {/* Sleep Quality & Physical Recovery Trend */}
                        <div className="chart-box">
                          <h4 className="chart-subtitle">Sleep Score & Physical Recovery</h4>

                          {/* Toggle buttons */}
                          <div className="chart-toggles">
                            <button
                              className={`toggle-btn ${showScoreChart2 ? 'active' : ''}`}
                              onClick={() => setShowScoreChart2(!showScoreChart2)}
                            >
                              <span className="toggle-icon" style={{ background: '#a78bfa' }}></span>
                              Sleep Score
                            </button>
                            <button
                              className={`toggle-btn ${showRecoveryChart2 ? 'active' : ''}`}
                              onClick={() => setShowRecoveryChart2(!showRecoveryChart2)}
                            >
                              <span className="toggle-icon" style={{ background: '#51cf66' }}></span>
                              Physical Recovery
                            </button>
                          </div>

                          <ResponsiveContainer width="100%" height={300}>
                            <ComposedChart data={monthData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                              <XAxis
                                dataKey="date"
                                stroke="#c4b5fd"
                                tick={{ fontSize: 10, fill: '#ffffff' }}
                              />
                              <YAxis
                                yAxisId="left"
                                stroke="#a78bfa"
                                tick={{ fontSize: 11 }}
                                label={{ value: 'Sleep Score', angle: -90, position: 'insideLeft', fill: '#a78bfa', fontSize: 10 }}
                              />
                              <YAxis
                                yAxisId="right"
                                orientation="right"
                                stroke="#66bb6a"
                                tick={{ fontSize: 11 }}
                                label={{ value: 'Physical Recovery', angle: 90, position: 'insideRight', fill: '#66bb6a', fontSize: 10 }}
                              />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: 'rgba(30, 20, 50, 0.95)',
                                  border: '1px solid rgba(255,255,255,0.2)',
                                  borderRadius: '12px',
                                  padding: '8px',
                                }}
                                labelStyle={{ color: '#c4b5fd', fontWeight: 'bold', fontSize: '0.85rem' }}
                              />
                              <Legend
                                wrapperStyle={{ paddingTop: '10px' }}
                                iconType="line"
                              />
                              {showScoreChart2 && (
                                <Line
                                  yAxisId="left"
                                  type="monotone"
                                  dataKey="sleepScore"
                                  stroke="#a78bfa"
                                  strokeWidth={2}
                                  dot={{ fill: '#8b5cf6', r: 3 }}
                                  name="Sleep Score"
                                  activeDot={{ r: 5 }}
                                />
                              )}
                              {showRecoveryChart2 && (
                                <Line
                                  yAxisId="right"
                                  type="monotone"
                                  dataKey="physicalRecovery"
                                  stroke="#51cf66"
                                  strokeWidth={2}
                                  dot={{ fill: '#3aa856', r: 3 }}
                                  name="Physical Recovery"
                                  activeDot={{ r: 5 }}
                                />
                              )}
                            </ComposedChart>
                          </ResponsiveContainer>
                        </div>

                        {/* Efficiency & Awakening */}
                        <div className="chart-box">
                          <h4 className="chart-subtitle">Sleep Efficiency & Awakening</h4>

                          {/* Toggle buttons */}
                          <div className="chart-toggles">
                            <button
                              className={`toggle-btn ${showEfficiencyChart3 ? 'active' : ''}`}
                              onClick={() => setShowEfficiencyChart3(!showEfficiencyChart3)}
                            >
                              <span className="toggle-icon" style={{ background: '#64b5f6' }}></span>
                              Efficiency
                            </button>
                            <button
                              className={`toggle-btn ${showAwakeningChart3 ? 'active' : ''}`}
                              onClick={() => setShowAwakeningChart3(!showAwakeningChart3)}
                            >
                              <span className="toggle-icon" style={{ background: '#ff6b6b' }}></span>
                              Awakening
                            </button>
                          </div>

                          <ResponsiveContainer width="100%" height={300}>
                            <ComposedChart data={monthData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                              <XAxis
                                dataKey="date"
                                stroke="#c4b5fd"
                                tick={{ fontSize: 10, fill: '#ffffff' }}
                              />
                              <YAxis
                                yAxisId="left"
                                stroke="#64b5f6"
                                tick={{ fontSize: 11 }}
                                label={{ value: 'Efficiency (%)', angle: -90, position: 'insideLeft', fill: '#64b5f6', fontSize: 10 }}
                              />
                              <YAxis
                                yAxisId="right"
                                orientation="right"
                                stroke="#ef5350"
                                tick={{ fontSize: 11 }}
                                label={{ value: 'Awakening (%)', angle: 90, position: 'insideRight', fill: '#ef5350', fontSize: 10 }}
                              />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: 'rgba(30, 20, 50, 0.95)',
                                  border: '1px solid rgba(255,255,255,0.2)',
                                  borderRadius: '12px',
                                  padding: '8px',
                                }}
                                labelStyle={{ color: '#c4b5fd', fontWeight: 'bold', fontSize: '0.85rem' }}
                              />
                              <Legend
                                wrapperStyle={{ paddingTop: '10px' }}
                                iconType="line"
                              />
                              {showEfficiencyChart3 && (
                                <Line
                                  yAxisId="left"
                                  type="monotone"
                                  dataKey="efficiency"
                                  stroke="#64b5f6"
                                  strokeWidth={2}
                                  dot={{ fill: '#42a5f5', r: 3 }}
                                  name="Efficiency (%)"
                                  activeDot={{ r: 5 }}
                                />
                              )}
                              {showAwakeningChart3 && (
                                <Line
                                  yAxisId="right"
                                  type="monotone"
                                  dataKey="awakening"
                                  stroke="#ff6b6b"
                                  strokeWidth={2}
                                  dot={{ fill: '#e53935', r: 3 }}
                                  name="Awakening (%)"
                                  activeDot={{ r: 5 }}
                                />
                              )}
                            </ComposedChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Section 4: Sleep Score Distribution */}
                      <div className="monthly-section-4">
                        <h3 className="section-subtitle">Sleep Score Distribution</h3>

                        <div className="chart-box">
                          <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                              <Pie
                                data={monthStats.scoreDistribution || []}
                                cx="50%"
                                cy="45%"
                                outerRadius={90}
                                innerRadius={0}
                                paddingAngle={0}
                                dataKey="value"
                                label={({ name, percent, cx, cy, midAngle, outerRadius }) => {
                                  if (percent === 0) return null;
                                  const RADIAN = Math.PI / 180;
                                  const radius = outerRadius + 25;
                                  const x = cx + radius * Math.cos(-midAngle * RADIAN);
                                  const y = cy + radius * Math.sin(-midAngle * RADIAN);
                                  const label = name.split(' ')[0];
                                  return (
                                    <text
                                      x={x}
                                      y={y}
                                      fill="#ffffff"
                                      textAnchor={x > cx ? 'start' : 'end'}
                                      dominantBaseline="central"
                                      fontSize="13"
                                      fontWeight="600"
                                    >
                                      {`${label} ${(percent * 100).toFixed(0)}%`}
                                    </text>
                                  );
                                }}
                                labelLine={{
                                  stroke: '#c4b5fd',
                                  strokeWidth: 1,
                                }}
                              >
                                {(monthStats.scoreDistribution || []).map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                ))}
                              </Pie>
                              <Legend
                                layout="horizontal"
                                align="center"
                                verticalAlign="bottom"
                                iconType="circle"
                                iconSize={8}
                                wrapperStyle={{ fontSize: '0.75rem', paddingTop: '10px' }}
                                formatter={(value) => (
                                  <span style={{ color: '#ffffff', fontSize: '0.75rem', marginLeft: '4px' }}>{value}</span>
                                )}
                              />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: 'rgba(30, 20, 50, 0.95)',
                                  border: '1px solid rgba(255,255,255,0.2)',
                                  borderRadius: '12px',
                                  padding: '10px',
                                  fontSize: '0.85rem',
                                }}
                                labelStyle={{ color: '#ffffff', fontWeight: 'bold', fontSize: '0.9rem' }}
                                itemStyle={{ color: '#ffffff' }}
                                formatter={(value) => [`${value} days`, 'Count']}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Section 5: Sleep Stage Composition */}
                      <div className="monthly-section-5">
                        <h3 className="section-subtitle">Daily Sleep Stage Composition (REM / Light / Middle)</h3>

                        <div className="chart-box">
                          <ResponsiveContainer width="100%" height={400}>
                            <BarChart data={monthData.map(d => {
                              const totalDuration = d.duration || 0; // 총 수면 시간 (분)
                              const remDuration = d.remDuration || 0; // REM 수면 (분)
                              const lightDuration = d.lightDuration || 0; // Light 수면 (분)
                              const middleDuration = Math.max(0, totalDuration - remDuration - lightDuration); // Middle 수면 (분)

                              return {
                                date: d.date,
                                rem: remDuration / 60, // 시간 단위로 변환
                                light: lightDuration / 60,
                                middle: middleDuration / 60,
                              };
                            })}>
                              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                              <XAxis
                                dataKey="date"
                                stroke="#c4b5fd"
                                tick={{ fontSize: 10, fill: '#ffffff' }}
                                dy={5}
                              />
                              <YAxis
                                stroke="#c4b5fd"
                                label={{ value: 'Hours', angle: -90, position: 'insideLeft', fill: '#c4b5fd' }}
                              />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: 'rgba(30, 20, 50, 0.95)',
                                  border: '1px solid rgba(255,255,255,0.2)',
                                  borderRadius: '12px',
                                  padding: '12px',
                                }}
                                labelStyle={{ color: '#c4b5fd', fontWeight: 'bold' }}
                                formatter={(value, name) => {
                                  const stageName = name === 'rem' ? 'REM (Deep Sleep)' :
                                    name === 'light' ? 'Light Sleep' :
                                      name === 'middle' ? 'Middle Sleep' : name;
                                  const hours = Math.floor(value);
                                  const minutes = Math.round((value - hours) * 60);
                                  return [`${hours}h ${minutes}min`, stageName];
                                }}
                              />
                              <Legend />
                              <Bar dataKey="rem" stackId="a" fill="#a78bfa" name="REM (Deep Sleep)" />
                              <Bar dataKey="light" stackId="a" fill="#c4b5fd" name="Light Sleep" />
                              <Bar dataKey="middle" stackId="a" fill="#7c6b9e" name="Middle Sleep" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Section 6: Sleep Timing Regularity */}
                      <div className="monthly-section-6">
                        <h3 className="section-subtitle">{t.sleepTimingTitle}</h3>
                        <p className="section-description-small">
                          {t.sleepTimingDesc}
                        </p>

                        <div className="monthly-charts-grid">
                          {/* Bed Time Regularity */}
                          <div className="chart-box">
                            <h4 className="chart-subtitle">Bed Time Consistency</h4>
                            <ResponsiveContainer width="100%" height={300}>
                              <ComposedChart
                                data={(() => {
                                  // Convert bed time to minutes from midnight for plotting
                                  const dataPoints = monthData.map(d => {
                                    const [h, m] = d.bedTime.split(':').map(Number);
                                    // Handle times after midnight (20:00-23:59 as 20-24 hours, 00:00-06:00 as 24-30)
                                    const timeInHours = h >= 20 ? h + (m / 60) : (24 + h + (m / 60));
                                    return {
                                      date: d.date,
                                      bedTime: timeInHours,
                                      bedTimeLabel: d.bedTime,
                                    };
                                  });

                                  const times = dataPoints.map(d => d.bedTime);
                                  const avgTime = times.reduce((sum, t) => sum + t, 0) / times.length;
                                  const minTime = Math.min(...times);
                                  const maxTime = Math.max(...times);

                                  return dataPoints.map(d => ({
                                    ...d,
                                    average: avgTime,
                                    rangeMin: minTime,
                                    rangeMax: maxTime,
                                  }));
                                })()}
                              >
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis
                                  dataKey="date"
                                  stroke="#c4b5fd"
                                  tick={{ fontSize: 9, fill: '#ffffff' }}
                                  dy={8}
                                />
                                <YAxis
                                  stroke="#c4b5fd"
                                  domain={[20, 28]}
                                  ticks={[20, 21, 22, 23, 24, 25, 26, 27, 28]}
                                  tick={{ fontSize: 10, fill: '#ffffff' }}
                                  tickFormatter={(value) => {
                                    const hour = value >= 24 ? value - 24 : value;
                                    return `${Math.floor(hour)}:00`;
                                  }}
                                  label={{ value: 'Time', angle: -90, position: 'insideLeft', fill: '#ffffff', fontSize: 11 }}
                                />
                                <Tooltip
                                  contentStyle={{
                                    backgroundColor: 'rgba(30, 20, 50, 0.95)',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    borderRadius: '12px',
                                    padding: '12px',
                                  }}
                                  labelStyle={{ color: '#c4b5fd', fontWeight: 'bold' }}
                                  content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                      const data = payload[0].payload;
                                      return (
                                        <div style={{
                                          backgroundColor: 'rgba(30, 20, 50, 0.95)',
                                          border: '1px solid rgba(255,255,255,0.2)',
                                          borderRadius: '12px',
                                          padding: '10px',
                                        }}>
                                          <p style={{ color: '#c4b5fd', fontWeight: 'bold', margin: '0 0 6px 0', fontSize: '1rem' }}>
                                            {data.date}
                                          </p>
                                          <p style={{ color: '#ffffff', margin: '3px 0', fontSize: '0.84rem' }}>
                                            Bed Time: {data.bedTimeLabel}
                                          </p>
                                          <p style={{ color: '#ffffff', margin: '3px 0', fontSize: '0.84rem' }}>
                                            Average: {(() => {
                                              const avgHour = Math.floor(data.average);
                                              const avgMin = Math.round((data.average - avgHour) * 60);
                                              const displayHour = avgHour >= 24 ? avgHour - 24 : avgHour;
                                              return `${displayHour}:${avgMin.toString().padStart(2, '0')}`;
                                            })()}
                                          </p>
                                        </div>
                                      );
                                    }
                                    return null;
                                  }}
                                />
                                <Legend
                                  verticalAlign="bottom"
                                  height={45}
                                  wrapperStyle={{ marginTop: 8 }}
                                  formatter={(value, entry) => (
                                    <span style={{ color: entry && entry.color ? entry.color : '#fff', fontSize: '0.9rem', marginLeft: '5px' }}>{value}</span>
                                  )}
                                />
                                {/* Range Area */}
                                <Line
                                  type="monotone"
                                  dataKey="rangeMax"
                                  stroke="transparent"
                                  strokeWidth={0}
                                  dot={false}
                                  activeDot={false}
                                />
                                <Line
                                  type="monotone"
                                  dataKey="rangeMin"
                                  stroke="transparent"
                                  strokeWidth={0}
                                  dot={false}
                                  activeDot={false}
                                  fill="rgba(167, 139, 250, 0.1)"
                                />
                                {/* Average Line */}
                                <Line
                                  type="monotone"
                                  dataKey="average"
                                  stroke="#4ade80"
                                  strokeWidth={2}
                                  strokeDasharray="5 5"
                                  dot={false}
                                  name="Average"
                                />
                                {/* Actual Bed Times */}
                                <Line
                                  type="monotone"
                                  dataKey="bedTime"
                                  stroke="#8b5cf6"
                                  strokeWidth={0}
                                  dot={{ fill: '#8b5cf6', r: 3.8, strokeWidth: 1.6, stroke: '#8b5cf6' }}
                                  name="Bed Time"
                                  activeDot={{ r: 5.4 }}
                                />
                              </ComposedChart>
                            </ResponsiveContainer>
                          </div>

                          {/* Wake Time Regularity */}
                          <div className="chart-box">
                            <h4 className="chart-subtitle">Wake Time Consistency</h4>
                            <ResponsiveContainer width="100%" height={300}>
                              <ComposedChart
                                data={(() => {
                                  // Convert wake time to hours
                                  const dataPoints = monthData.map(d => {
                                    const [h, m] = d.wakeTime.split(':').map(Number);
                                    const timeInHours = h + (m / 60);
                                    return {
                                      date: d.date,
                                      wakeTime: timeInHours,
                                      wakeTimeLabel: d.wakeTime,
                                    };
                                  });

                                  const times = dataPoints.map(d => d.wakeTime);
                                  const avgTime = times.reduce((sum, t) => sum + t, 0) / times.length;
                                  const minTime = Math.min(...times);
                                  const maxTime = Math.max(...times);

                                  return dataPoints.map(d => ({
                                    ...d,
                                    average: avgTime,
                                    rangeMin: minTime,
                                    rangeMax: maxTime,
                                  }));
                                })()}
                              >
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis
                                  dataKey="date"
                                  stroke="#c4b5fd"
                                  tick={{ fontSize: 9, fill: '#ffffff' }}
                                  dy={8}
                                />
                                <YAxis
                                  stroke="#c4b5fd"
                                  domain={[4, 10]}
                                  ticks={[4, 5, 6, 7, 8, 9, 10]}
                                  tick={{ fontSize: 10, fill: '#ffffff' }}
                                  tickFormatter={(value) => `${Math.floor(value)}:00`}
                                  label={{ value: 'Time', angle: -90, position: 'insideLeft', fill: '#ffffff', fontSize: 11 }}
                                />
                                <Tooltip
                                  contentStyle={{
                                    backgroundColor: 'rgba(30, 20, 50, 0.95)',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    borderRadius: '12px',
                                    padding: '12px',
                                  }}
                                  labelStyle={{ color: '#c4b5fd', fontWeight: 'bold' }}
                                  content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                      const data = payload[0].payload;
                                      return (
                                        <div style={{
                                          backgroundColor: 'rgba(30, 20, 50, 0.95)',
                                          border: '1px solid rgba(255,255,255,0.2)',
                                          borderRadius: '12px',
                                          padding: '10px',
                                        }}>
                                          <p style={{ color: '#c4b5fd', fontWeight: 'bold', margin: '0 0 6px 0', fontSize: '1rem' }}>
                                            {data.date}
                                          </p>
                                          <p style={{ color: '#ffffff', margin: '3px 0', fontSize: '0.84rem' }}>
                                            Wake Time: {data.wakeTimeLabel}
                                          </p>
                                          <p style={{ color: '#ffffff', margin: '3px 0', fontSize: '0.84rem' }}>
                                            Average: {(() => {
                                              const avgHour = Math.floor(data.average);
                                              const avgMin = Math.round((data.average - avgHour) * 60);
                                              return `${avgHour}:${avgMin.toString().padStart(2, '0')}`;
                                            })()}
                                          </p>
                                        </div>
                                      );
                                    }
                                    return null;
                                  }}
                                />
                                <Legend
                                  verticalAlign="bottom"
                                  height={45}
                                  wrapperStyle={{ marginTop: 8 }}
                                  formatter={(value, entry) => (
                                    <span style={{ color: entry && entry.color ? entry.color : '#fff', fontSize: '0.9rem', marginLeft: '5px' }}>{value}</span>
                                  )}
                                />
                                {/* Range Area */}
                                <Line
                                  type="monotone"
                                  dataKey="rangeMax"
                                  stroke="transparent"
                                  strokeWidth={0}
                                  dot={false}
                                  activeDot={false}
                                />
                                <Line
                                  type="monotone"
                                  dataKey="rangeMin"
                                  stroke="transparent"
                                  strokeWidth={0}
                                  dot={false}
                                  activeDot={false}
                                  fill="rgba(255, 165, 0, 0.1)"
                                />
                                {/* Average Line */}
                                <Line
                                  type="monotone"
                                  dataKey="average"
                                  stroke="#4ade80"
                                  strokeWidth={2}
                                  strokeDasharray="5 5"
                                  dot={false}
                                  name="Average"
                                />
                                {/* Actual Wake Times */}
                                <Line
                                  type="monotone"
                                  dataKey="wakeTime"
                                  stroke="#ff8c00"
                                  strokeWidth={0}
                                  dot={{ fill: '#ff8c00', r: 3.8, strokeWidth: 1.6, stroke: '#ff8c00' }}
                                  name="Wake Time"
                                  activeDot={{ r: 5.4 }}
                                />
                              </ComposedChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      </div>
    </section >
  );
};

export default SleepAnalysis;

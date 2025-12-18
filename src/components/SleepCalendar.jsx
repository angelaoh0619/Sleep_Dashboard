import React, { useEffect, useState } from 'react';
import { translations } from '../translations';
import './SleepCalendar.css';
import sleepDataCSV from '../data/sleepData.csv?raw';

const SleepCalendar = ({ language }) => {
  const t = translations[language].calendar;
  const [sleepData, setSleepData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedData, setSelectedData] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 2, 1));
  const [currentYear, setCurrentYear] = useState(2025);
  const [viewMode, setViewMode] = useState('month');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      const rows = sleepDataCSV.split('\n').slice(1).filter(row => row.trim());

      const parsed = rows.map((row) => {
        const cols = row.split(',');
        const bedTime = cols[0];
        const wakeTime = cols[1];

        return {
          date: bedTime.split(' ')[0],
          bedTime: bedTime.split(' ')[1],
          wakeTime: wakeTime.split(' ')[1],
          duration: parseInt(cols[2]),
          remDuration: parseInt(cols[3]),
          lightDuration: parseInt(cols[4]),
          sleepLatency: parseInt(cols[5]),
          sleepScore: parseInt(cols[6]),
          physicalRecovery: parseInt(cols[7]),
          movementAwakening: parseInt(cols[8]),
          efficiency: parseInt(cols[9]),
          mentalRecovery: parseInt(cols[10]),
        };
      });

      setSleepData(parsed);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const getColorByScore = (score) => {
    if (score >= 0 && score <= 25) return 'score-very-low';
    if (score >= 26 && score <= 50) return 'score-low';
    if (score >= 51 && score <= 75) return 'score-medium';
    if (score >= 76 && score <= 100) return 'score-high';
    return 'score-none';
  };

  const getCommentByScore = (score) => {
    if (score >= 0 && score <= 25) return t.comments.veryLow;
    if (score >= 26 && score <= 50) return t.comments.low;
    if (score >= 51 && score <= 75) return t.comments.medium;
    if (score >= 76 && score <= 100) return t.comments.high;
    return 'Check your sleep data.';
  };

  const getTooltipText = (dateStr, data) => {
    if (!data) return null;

    const date = new Date(dateStr.replace(/\./g, '-'));
    const dayOfWeek = date.getDay(); // 0(일) ~ 6(토)
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    if (isWeekend) {
      return { isWeekend: true };
    }

    // 목표 시간 (평일)
    const goalBedHour = 23; // 11 PM
    const goalBedMin = 0;
    const goalWakeHour = 6; // 6 AM
    const goalWakeMin = 20;

    // 실제 시간 파싱
    const [bedHour, bedMin] = data.bedTime.split(':').map(Number);
    const [wakeHour, wakeMin] = data.wakeTime.split(':').map(Number);

    // 취침 시간 비교 (분 단위로 변환)
    const actualBedMinutes = bedHour * 60 + bedMin;
    const goalBedMinutes = goalBedHour * 60 + goalBedMin;
    let bedDiff = actualBedMinutes - goalBedMinutes;

    // 자정 넘어간 경우 처리 (예: 1시에 잠 = 다음날 새벽)
    if (bedHour < 12) bedDiff = (bedHour + 24) * 60 + bedMin - goalBedMinutes;

    // 기상 시간 비교
    const actualWakeMinutes = wakeHour * 60 + wakeMin;
    const goalWakeMinutes = goalWakeHour * 60 + goalWakeMin;
    const wakeDiff = actualWakeMinutes - goalWakeMinutes;

    return {
      isWeekend: false,
      bedDiff,
      wakeDiff
    };
  };

  const handleDateClick = (data) => {
    setSelectedDate(data.date);
    setSelectedData(data);
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) {
      return `${mins}min`;
    }
    return `${hours}h ${mins}min`;
  };

  const formatTime = (timeStr) => {
    const [hours, mins] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${mins} ${ampm}`;
  };

  // 날짜별로 그룹화
  const dataByDate = {};
  sleepData.forEach(data => {
    dataByDate[data.date] = data;
  });

  // 달력 생성 로직
  const generateCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDayOfWeek = firstDay.getDay(); // 0(일) ~ 6(토)
    const daysInMonth = lastDay.getDate();

    const calendar = [];
    let day = 1;

    // 첫 주 - 이전 달 빈칸 채우기
    for (let i = 0; i < startingDayOfWeek; i++) {
      calendar.push(null);
    }

    // 이번 달 날짜 채우기
    for (let i = day; i <= daysInMonth; i++) {
      const dateStr = `${year}.${(month + 1)}.${i}`;
      calendar.push({
        day: i,
        dateStr: dateStr,
        data: dataByDate[dateStr]
      });
    }

    return calendar;
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  // 년별 달력 생성 (12개월)
  const generateYearCalendar = () => {
    const months = [];
    for (let month = 0; month < 12; month++) {
      const firstDay = new Date(currentYear, month, 1);
      const lastDay = new Date(currentYear, month + 1, 0);
      const startingDayOfWeek = firstDay.getDay();
      const daysInMonth = lastDay.getDate();

      const monthData = [];

      // 빈칸 채우기
      for (let i = 0; i < startingDayOfWeek; i++) {
        monthData.push(null);
      }

      // 날짜 채우기
      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${currentYear}.${month + 1}.${day}`;
        monthData.push({
          day: day,
          dateStr: dateStr,
          data: dataByDate[dateStr]
        });
      }

      months.push({
        monthIndex: month,
        monthName: new Date(currentYear, month, 1).toLocaleDateString('en-US', { month: 'short' }),
        days: monthData
      });
    }

    return months;
  };

  const prevYear = () => {
    setCurrentYear(currentYear - 1);
  };

  const nextYear = () => {
    setCurrentYear(currentYear + 1);
  };

  const calendarDays = generateCalendar();
  const yearMonths = generateYearCalendar();
  const monthName = currentMonth.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });

  return (
    <section id="calendar" className="section calendar-section">
      <div className="section-content">
        <h2 className="section-title">{t.title}</h2>
        <p className="section-description">
          {t.description}
        </p>

        <div className="calendar-top-bar">
          <div className="view-mode-tabs">
            <button
              className={`view-tab ${viewMode === 'month' ? 'active' : ''}`}
              onClick={() => setViewMode('month')}
            >
              {t.month}
            </button>
            <button
              className={`view-tab ${viewMode === 'year' ? 'active' : ''}`}
              onClick={() => setViewMode('year')}
            >
              {t.year}
            </button>
          </div>
          <div className="goal-info-inline">
            <span className="goal-label-inline">{t.goalSleepTime}</span>
            <span className="goal-item-inline">{t.weekdays} : 11PM - 6:20AM</span>
            <span className="goal-divider-inline">•</span>
            <span className="goal-item-inline">{t.weekend} : {t.free}</span>
          </div>
        </div>

        <div className="calendar-container">
          <div className={`emoji-calendar ${viewMode === 'year' ? 'year-mode' : ''}`}>
            <div className="calendar-header">
              <button className="month-nav-btn" onClick={viewMode === 'month' ? prevMonth : prevYear}>←</button>
              <h3 className="calendar-subtitle">
                {viewMode === 'month' ? monthName : currentYear}
              </h3>
              <button className="month-nav-btn" onClick={viewMode === 'month' ? nextMonth : nextYear}>→</button>
            </div>

            {viewMode === 'month' && (
              <>
                <div className="weekday-labels">
                  <div>Sun</div>
                  <div>Mon</div>
                  <div>Tue</div>
                  <div>Wed</div>
                  <div>Thu</div>
                  <div>Fri</div>
                  <div>Sat</div>
                </div>
                <div className="calendar-grid">
                  {calendarDays.map((dayData, index) => (
                    <div
                      key={index}
                      className={`calendar-cell ${!dayData ? 'empty' : ''} ${selectedDate === dayData?.dateStr ? 'selected' : ''} ${dayData?.data ? `has-data ${getColorByScore(dayData.data.sleepScore)}` : ''}`}
                      onClick={() => dayData?.data && handleDateClick(dayData.data)}
                    >
                      {dayData && (
                        <>
                          <div className="day-number">{dayData.day}</div>
                          {dayData.data && (
                            <div className="tooltip-popup">
                              <div className="tooltip-score">Score: {dayData.data.sleepScore}</div>
                              <div className="tooltip-content">
                                {(() => {
                                  const tooltipData = getTooltipText(dayData.dateStr, dayData.data);
                                  if (tooltipData.isWeekend) {
                                    return <div className="tooltip-line">{t.weekendFree}</div>;
                                  }

                                  const bedDiffHours = Math.floor(Math.abs(tooltipData.bedDiff) / 60);
                                  const bedDiffMins = Math.abs(tooltipData.bedDiff) % 60;
                                  const wakeDiffHours = Math.floor(Math.abs(tooltipData.wakeDiff) / 60);
                                  const wakeDiffMins = Math.abs(tooltipData.wakeDiff) % 60;

                                  const formatTimeDiff = (hours, mins) => {
                                    if (hours === 0) return `${mins}min`;
                                    return `${hours}h ${mins}min`;
                                  };

                                  return (
                                    <>
                                      <div className="tooltip-line">
                                        {tooltipData.bedDiff > 0
                                          ? <>Slept <span className="later">{formatTimeDiff(bedDiffHours, bedDiffMins)}</span> later</>
                                          : <>Slept <span className="earlier">{formatTimeDiff(bedDiffHours, bedDiffMins)}</span> earlier!</>}
                                      </div>
                                      <div className="tooltip-line">
                                        {tooltipData.wakeDiff > 0
                                          ? <>Woke <span className="later">{formatTimeDiff(wakeDiffHours, wakeDiffMins)}</span> later</>
                                          : <>Woke <span className="earlier">{formatTimeDiff(wakeDiffHours, wakeDiffMins)}</span> earlier!</>}
                                      </div>
                                    </>
                                  );
                                })()}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}

            {viewMode === 'year' && (
              <div className="year-view">
                {yearMonths.map((monthData, monthIndex) => (
                  <div key={monthIndex} className="year-month-block">
                    <div className="year-month-name">{monthData.monthName}</div>
                    <div className="year-month-grid">
                      {monthData.days.map((dayData, dayIndex) => (
                        <div
                          key={dayIndex}
                          className={`year-cell ${!dayData ? 'empty' : ''} ${selectedDate === dayData?.dateStr ? 'selected' : ''} ${dayData?.data ? `has-data ${getColorByScore(dayData.data.sleepScore)}` : ''}`}
                          onClick={() => dayData?.data && handleDateClick(dayData.data)}
                        >
                          {dayData && dayData.data && <div className="year-day-dot"></div>}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="detail-panel">
            {selectedData ? (
              <>
                <svg width="0" height="0">
                  <defs>
                    <linearGradient id="gradient-very-low" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ff6b6b" />
                      <stop offset="100%" stopColor="#ee5a6f" />
                    </linearGradient>
                    <linearGradient id="gradient-low" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ffa500" />
                      <stop offset="100%" stopColor="#ff8c42" />
                    </linearGradient>
                    <linearGradient id="gradient-medium" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ffd93d" />
                      <stop offset="100%" stopColor="#f9ca24" />
                    </linearGradient>
                    <linearGradient id="gradient-high" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#6bcf7f" />
                      <stop offset="100%" stopColor="#51cf66" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="detail-date">{selectedDate}</div>
                <div className={`detail-score-circle ${getColorByScore(selectedData.sleepScore)}`}>
                  <svg className="score-ring" width="160" height="160">
                    <circle
                      className="score-ring-bg"
                      cx="80"
                      cy="80"
                      r="70"
                      fill="none"
                      stroke="rgba(255, 255, 255, 0.1)"
                      strokeWidth="12"
                    />
                    <circle
                      className="score-ring-progress"
                      cx="80"
                      cy="80"
                      r="70"
                      fill="none"
                      strokeWidth="12"
                      strokeDasharray={`${2 * Math.PI * 70}`}
                      strokeDashoffset={`${2 * Math.PI * 70 * (1 - selectedData.sleepScore / 100)}`}
                      transform="rotate(-90 80 80)"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="score-number">{selectedData.sleepScore}</div>
                </div>
                <div className="detail-comment">
                  {getCommentByScore(selectedData.sleepScore)}
                </div>
                <div className="detail-info">
                  <h4>{t.sleepDetails}</h4>
                  <div className="sleep-time-visual">
                    <div className="time-section">
                      <div className="time-icon">🌙</div>
                      <div className="time-label">{t.bedTime}</div>
                      <div className="time-display">{formatTime(selectedData.bedTime)}</div>
                    </div>
                    <div className="time-slider">
                      <div className="slider-line"></div>
                      <div className="slider-arrow">→</div>
                    </div>
                    <div className="time-section">
                      <div className="time-icon">☀️</div>
                      <div className="time-label">{t.wakeTime}</div>
                      <div className="time-display">{formatTime(selectedData.wakeTime)}</div>
                    </div>
                  </div>
                  <div className="sleep-stages-chart">
                    <div className="chart-bars">
                      <div className="bar-item">
                        <div className="bar-wrapper">
                          <div
                            className="bar-fill rem-bar"
                            style={{ height: `${(selectedData.remDuration / 480) * 100}%` }}
                          >
                            <span className="bar-value">{formatDuration(selectedData.remDuration)}</span>
                          </div>
                        </div>
                        <div className="bar-label">{t.remSleep}</div>
                      </div>
                      <div className="bar-item">
                        <div className="bar-wrapper">
                          <div
                            className="bar-fill light-bar"
                            style={{ height: `${(selectedData.lightDuration / 480) * 100}%` }}
                          >
                            <span className="bar-value">{formatDuration(selectedData.lightDuration)}</span>
                          </div>
                        </div>
                        <div className="bar-label">{t.lightSleep}</div>
                      </div>
                    </div>
                  </div>
                  <div className="sleep-latency-box">
                    <div className="latency-label">{t.timeToFallAsleep}</div>
                    <div className="latency-value">{Math.round(selectedData.sleepLatency / 60000)} min</div>
                  </div>
                </div>
              </>
            ) : (
              <div className="detail-placeholder">
                <div className="placeholder-icon"></div>
                <p className="placeholder-title">{t.selectDate}</p>
                <div className="color-guide">
                  <p className="guide-title">{t.colorGuide}</p>
                  <div className="color-range">
                    <div className="color-item">
                      <span className="color-box score-very-low"></span>
                      <span className="color-text">{t.scoreRanges.veryLow}</span>
                    </div>
                    <div className="color-item">
                      <span className="color-box score-low"></span>
                      <span className="color-text">{t.scoreRanges.low}</span>
                    </div>
                    <div className="color-item">
                      <span className="color-box score-medium"></span>
                      <span className="color-text">{t.scoreRanges.medium}</span>
                    </div>
                    <div className="color-item">
                      <span className="color-box score-high"></span>
                      <span className="color-text">{t.scoreRanges.high}</span>
                    </div>
                  </div>
                  <p className="guide-note">{t.guideNote}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SleepCalendar;

import React, { useState } from 'react';
import { translations } from '../translations';
import './AIInsights.css';

const AIInsights = ({ language }) => {
  const [expandedBoxes, setExpandedBoxes] = useState({});

  const toggleBox = (boxNumber) => {
    setExpandedBoxes(prev => ({
      ...prev,
      [boxNumber]: !prev[boxNumber]
    }));
  };

  const t = translations[language].insights;

  return (
    <section id="ai-insights" className="section ai-section">
      <div className="section-content">
        <h2 className="section-title">{t.title}</h2>
        <p className="section-description">
          {t.description}
        </p>

        <div className="insights-container">
          {/* Key Insights - Bold Card Design */}
          <div className="insights-wrapper">
            <h3 className="insights-main-title">{t.keyInsightsTitle}</h3>

            <div className="insights-boxes">
              {/* Insight 1 */}
              <div className="insight-box">
                <div className="insight-box-header" onClick={() => toggleBox(1)}>
                  <h4 className="insight-box-title">
                    {t.insight1.title}<span className="highlight-orange">{t.insight1.deepSleepRate}</span> & <span className="highlight-cyan">{t.insight1.remConsistency}</span>
                  </h4>
                  <span className={`accordion-icon ${expandedBoxes[1] ? 'expanded' : ''}`}>▼</span>
                </div>
                {expandedBoxes[1] && (
                  <ul className="insight-list">
                    <li>
                      <span className="highlight-orange">{t.insight1.point1.part1}</span>{t.insight1.point1.part2} <span className="highlight-orange">{t.insight1.point1.part3}</span> {t.insight1.point1.part4}
                    </li>
                    <li>
                      <span className="highlight-cyan">{t.insight1.point2.part1}</span>{t.insight1.point2.part2} <span className="highlight-cyan">{t.insight1.point2.part3}</span> {t.insight1.point2.part4}
                    </li>
                    <li>
                      {t.insight1.point3}
                    </li>
                  </ul>
                )}
              </div>

              {/* Insight 2 */}
              <div className="insight-box">
                <div className="insight-box-header" onClick={() => toggleBox(2)}>
                  <h4 className="insight-box-title">
                    {t.insight2.title}<span className="highlight-green">{t.insight2.awakeRate}</span>
                  </h4>
                  <span className={`accordion-icon ${expandedBoxes[2] ? 'expanded' : ''}`}>▼</span>
                </div>
                {expandedBoxes[2] && (
                  <ul className="insight-list">
                    <li>
                      <span className="highlight-green">{t.insight2.point1.part1}</span>{t.insight2.point1.part2} <span className="highlight-green">{t.insight2.point1.part3}</span> {t.insight2.point1.part4}
                    </li>
                    <li>
                      {t.insight2.point2}
                    </li>
                  </ul>
                )}
              </div>

              {/* Insight 3 */}
              <div className="insight-box">
                <div className="insight-box-header" onClick={() => toggleBox(3)}>
                  <h4 className="insight-box-title">
                    <span className="highlight-pink">{t.insight3.titlePart1}</span> {t.insight3.titlePart2} <span className="highlight-cyan">{t.insight3.titlePart3}</span>
                  </h4>
                  <span className={`accordion-icon ${expandedBoxes[3] ? 'expanded' : ''}`}>▼</span>
                </div>
                {expandedBoxes[3] && (
                  <ul className="insight-list">
                    <li>
                      {t.insight3.point1.part1} <span className="highlight-pink">{t.insight3.point1.part2} </span>{t.insight3.point1.part3} <span className="highlight-cyan">{t.insight3.point1.part4}</span>{t.insight3.point1.part5}
                    </li>
                    <li>
                      {t.insight3.point2}
                    </li>
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="recommendations-wrapper">
          <h3 className="recommendations-main-title">{t.recommendationsTitle}</h3>

          <div className="recommendations-grid">
            {/* Recommendation 1 */}
            <div className="rec-card" data-tilt>
              <div className="rec-card-icon">⏰</div>
              <div className="rec-card-glow"></div>
              <h4 className="rec-card-title">{t.rec1.title}</h4>
              <ul className="rec-card-list">
                <li>{t.rec1.point1}</li>
                <li>{t.rec1.point2}</li>
                <li>{t.rec1.point3}</li>
              </ul>
            </div>

            {/* Recommendation 2 */}
            <div className="rec-card" data-tilt>
              <div className="rec-card-icon">🚫</div>
              <div className="rec-card-glow"></div>
              <h4 className="rec-card-title">{t.rec2.title}</h4>
              <ul className="rec-card-list">
                <li>
                  {t.rec2.point1.part1} <span className="highlight-green">{t.rec2.point1.part2}</span> {t.rec2.point1.part3}
                </li>
                <li>
                  {t.rec2.point2}
                </li>
                <li>
                  {t.rec2.point3}
                </li>
              </ul>
            </div>

            {/* Recommendation 3 */}
            <div className="rec-card" data-tilt>
              <div className="rec-card-icon">✨</div>
              <div className="rec-card-glow"></div>
              <h4 className="rec-card-title">{t.rec3.title}</h4>
              <ul className="rec-card-list">
                <li>
                  <span className="highlight-orange">{t.rec3.deepSleepLabel}</span> {t.rec3.point1}
                </li>
                <li>
                  <span className="highlight-cyan">{t.rec3.remLabel}</span> {t.rec3.point2}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AIInsights;

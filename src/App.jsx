import React, { useState } from 'react';
import Header from './components/Header';
import SleepCalendar from './components/SleepCalendar';
import SleepAnalysis from './components/SleepAnalysis';
import AIInsights from './components/AIInsights';
import Footer from './components/Footer';
import './App.css';

function App() {
  const [language, setLanguage] = useState('en');

  return (
    <div className="App">
      <Header language={language} setLanguage={setLanguage} />
      <SleepCalendar language={language} />
      <SleepAnalysis language={language} />
      <AIInsights language={language} />
      <Footer language={language} />
    </div>
  );
}

export default App;

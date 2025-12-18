# 🌙 Galaxy Watch Sleep Dashboard

> A beautiful, interactive web dashboard for analyzing and visualizing sleep data from Galaxy Watch

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://sleep-project.vercel.app)
[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev/)

## 🎬 Live Demo

**🌐 [View Live Dashboard](https://sleep-project.vercel.app)**

## ✨ Features

### 📊 Comprehensive Sleep Analytics
- **Smart Sleep Calendar**: Interactive monthly calendar with color-coded sleep quality indicators
- **Detailed Sleep Analysis**: Deep dive into sleep patterns with correlation charts and insights
- **AI-Powered Insights**: Intelligent recommendations based on your sleep data
- **Multi-language Support**: Toggle between English and Korean (한국어)

### 🎨 Modern UI/UX
- Responsive design that works on all devices
- Smooth animations and transitions with GSAP
- Interactive charts powered by Recharts
- Clean, professional interface

### 📈 Data Visualization
- Sleep quality trends over time
- Correlation analysis between different sleep metrics
- Physical recovery tracking
- Sleep stage breakdowns

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/angelaoh0619/Sleep_Dashboard.git
cd Sleep_Dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and visit `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## 🛠️ Tech Stack

- **Frontend Framework**: [React](https://reactjs.org/) 18.2.0
- **Build Tool**: [Vite](https://vitejs.dev/) 5.0
- **Data Visualization**: [Recharts](https://recharts.org/) 2.15.4
- **Animations**: [GSAP](https://greensock.com/gsap/) 3.13.0
- **Styling**: CSS3 with custom variables
- **Deployment**: [Vercel](https://vercel.com)

## 📁 Project Structure

```
sleep-project/
├── public/              # Static assets
├── src/
│   ├── components/      # React components
│   │   ├── Header.jsx
│   │   ├── SleepCalendar.jsx
│   │   ├── SleepAnalysis.jsx
│   │   ├── AIInsights.jsx
│   │   └── Footer.jsx
│   ├── data/           # Sleep data
│   ├── translations.js # i18n translations
│   ├── App.jsx         # Main app component
│   ├── App.css         # App styles
│   ├── index.css       # Global styles
│   └── main.jsx        # Entry point
├── index.html
├── package.json
└── vite.config.js
```

## 🌐 Deployment

This project is automatically deployed to Vercel. Any push to the main branch will trigger a new deployment.

### Deploy Your Own

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/angelaoh0619/Sleep_Dashboard)

## 🎯 Features in Detail

### Sleep Calendar
- Monthly view of sleep data
- Color-coded quality indicators (Excellent, Good, Fair, Poor)
- Interactive date selection
- Navigation between months

### Sleep Analysis
- Overall and monthly views
- Correlation charts showing relationships between:
  - Sleep duration and quality
  - Physical recovery metrics
  - Sleep stage distributions
- Statistical insights and trends

### AI Insights
- Personalized sleep recommendations
- Pattern recognition and analysis
- Actionable tips for better sleep
- Data-driven health suggestions

## 🔧 Configuration

### Custom Base Path

If deploying to a subdirectory, update `vite.config.js`:

```javascript
export default defineConfig({
  base: '/your-subdirectory/',
  plugins: [react()],
})
```

### Language Settings

Default language can be changed in `App.jsx`:

```javascript
const [language, setLanguage] = useState('en'); // or 'ko' for Korean
```

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/angelaoh0619/Sleep_Dashboard/issues).

## 👥 Author

**Angela**

- GitHub: [@angelaoh0619](https://github.com/angelaoh0619)

## 🙏 Acknowledgments

- Sleep data sourced from Galaxy Watch
- Icons and design inspiration from modern web applications
- Built with modern web technologies and best practices

---

<p align="center">Made with ❤️ for better sleep tracking</p>

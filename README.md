# Smart Finance Assistant

A comprehensive AI-powered personal finance management application built with vanilla JavaScript and modern web technologies.

## Features

- 📊 **Transaction Tracking**: Add and categorize income and expenses
- 🤖 **AI Analysis**: Get personalized financial insights powered by AI
- 📈 **Analytics Dashboard**: Visualize spending patterns and trends
- 🎯 **Goal Setting**: Set and track financial goals
- 💡 **Smart Recommendations**: AI-powered saving tips and budget suggestions
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile
- 🔒 **Privacy First**: All data stored locally in your browser

## Built With

- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **Styling**: Tailwind CSS for modern, responsive design
- **Build Tool**: Vite for fast development and optimized builds
- **AI Integration**: Multiple AI providers (Groq, OpenAI, Hugging Face)
- **Storage**: Local Storage for client-side data persistence
- **Deployment**: Netlify for fast, reliable hosting

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd smart-finance-assistant
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your API keys (optional - the app works with fallback analysis):
   ```env
   VITE_GROQ_API_KEY=your_groq_api_key_here
   VITE_OPENAI_API_KEY=your_openai_api_key_here
   VITE_HUGGINGFACE_API_KEY=your_huggingface_api_key_here
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## API Configuration

### Getting API Keys

1. **Groq (Recommended - Free)**
   - Visit: https://console.groq.com/keys
   - Sign up and get your free API key
   - Fast inference with Llama models

2. **OpenAI (Optional)**
   - Visit: https://platform.openai.com/api-keys
   - $5 free credit for new users
   - Access to GPT models

3. **Hugging Face (Optional)**
   - Visit: https://huggingface.co/settings/tokens
   - Free tier with rate limits
   - Access to open-source models

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_GROQ_API_KEY` | Groq API key for AI analysis | Optional |
| `VITE_OPENAI_API_KEY` | OpenAI API key | Optional |
| `VITE_HUGGINGFACE_API_KEY` | Hugging Face API key | Optional |
| `VITE_DEFAULT_AI_PROVIDER` | Default AI provider (groq/openai/huggingface) | No |

## Architecture

### Project Structure
```
├── assistant/           # Core application modules
│   ├── index.js        # Main application controller
│   ├── ui.js           # UI components and DOM manipulation
│   ├── storage.js      # Local storage management
│   ├── analyzer.js     # Financial analysis logic
│   ├── categories.js   # Transaction categories
│   └── aiPrompt.js     # AI prompt generation
├── ai-service.js       # AI service integration
├── style.css          # Tailwind CSS styles
├── main.js            # Application entry point
└── index.html         # Main HTML template
```

### Key Components

1. **FinanceAssistant**: Main application controller
2. **AIService**: Handles AI provider integration and analysis
3. **Storage**: Manages local data persistence
4. **Analyzer**: Performs financial calculations and insights
5. **UI**: Handles DOM manipulation and user interface

## Features in Detail

### Transaction Management
- Add income and expense transactions
- Categorize transactions (Food, Transport, Shopping, etc.)
- Edit and delete transactions
- Import/export transaction data

### AI-Powered Analysis
- Personalized financial insights
- Spending pattern analysis
- Money-saving recommendations
- Budget suggestions
- Investment advice

### Analytics & Reporting
- Monthly spending trends
- Category-wise breakdown
- Financial health score
- Spending patterns analysis

### Goal Tracking
- Set financial goals (savings, investments, purchases)
- Track progress towards goals
- Visual progress indicators
- Goal achievement notifications

## Deployment

The application is deployed on Netlify with automatic builds from the main branch.

**Live Demo**: [Your deployed URL]

### Deploy Your Own

1. Fork this repository
2. Connect to Netlify
3. Set environment variables in Netlify dashboard
4. Deploy automatically on push

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Privacy & Security

- All financial data is stored locally in your browser
- API keys are stored securely in environment variables
- No personal data is sent to external servers except for AI analysis
- AI analysis uses anonymized transaction patterns only

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
1. Check the documentation
2. Search existing issues
3. Create a new issue with detailed information

---

**Note**: This application is for educational and personal use. Always consult with qualified financial advisors for important financial decisions.
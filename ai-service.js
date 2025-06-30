class AIService {
  constructor() {
    this.providers = {
      groq: {
        name: 'Groq (Free for All Users)',
        apiUrl: 'https://api.groq.com/openai/v1/chat/completions',
        model: 'llama3-8b-8192',
        keyPrefix: 'gsk_',
        signupUrl: 'https://console.groq.com/keys',
        description: 'Free AI analysis powered by Groq'
      },
      openai: {
        name: 'OpenAI (Bring Your Own Key)',
        apiUrl: 'https://api.openai.com/v1/chat/completions',
        model: 'gpt-3.5-turbo',
        keyPrefix: 'sk-',
        signupUrl: 'https://platform.openai.com/api-keys',
        description: '$5 free credit for new users'
      },
      huggingface: {
        name: 'Hugging Face (Bring Your Own Key)',
        apiUrl: 'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium',
        model: 'microsoft/DialoGPT-medium',
        keyPrefix: 'hf_',
        signupUrl: 'https://huggingface.co/settings/tokens',
        description: 'Free tier with rate limits'
      }
    }
    
    // Load API keys from environment variables
    this.envKeys = {
      groq: import.meta.env.VITE_GROQ_API_KEY,
      openai: import.meta.env.VITE_OPENAI_API_KEY,
      huggingface: import.meta.env.VITE_HUGGINGFACE_API_KEY
    }
    
    // Default to using environment variable or fallback
    this.currentProvider = import.meta.env.VITE_DEFAULT_AI_PROVIDER || 'groq'
    this.useSharedAPI = true
    
    // Fallback shared key (you should replace this with your actual key)
    this.sharedGroqKey = import.meta.env.VITE_GROQ_API_KEY || '';
    
    // User's custom API settings (optional)
    this.userApiKey = localStorage.getItem('ai_api_key') || ''
    this.providerType = localStorage.getItem('ai_provider') || this.currentProvider
  }

  setProvider(providerType, apiKey) {
    this.currentProvider = providerType
    this.userApiKey = apiKey
    this.useSharedAPI = false // Switch to user's own API when they provide one
    localStorage.setItem('ai_provider', providerType)
    localStorage.setItem('ai_api_key', apiKey)
  }

  // Enable shared API mode (environment or fallback key)
  enableSharedAPI() {
    this.useSharedAPI = true
    this.currentProvider = 'groq'
  }

  // Get the API key to use
  getActiveApiKey() {
    if (this.useSharedAPI && this.currentProvider === 'groq') {
      return this.sharedGroqKey
    }
    
    // Try environment variable first, then user's stored key
    const envKey = this.envKeys[this.currentProvider]
    if (envKey && !envKey.includes('your_') && !envKey.includes('_here')) {
      return envKey
    }
    
    return this.userApiKey
  }

  async analyzeFinances(transactions) {
    // Always try environment/shared API first if available
    const activeKey = this.getActiveApiKey()
    if (activeKey && !activeKey.includes('your_') && !activeKey.includes('_here')) {
      try {
        this.enableSharedAPI()
        const prompt = this.createFinancialPrompt(transactions)
        const response = await this.callOpenAICompatible(this.providers.groq, prompt)
        return this.parseAIResponse(response)
      } catch (error) {
        console.warn('Primary API failed, trying fallback:', error)
      }
    }

    // Fallback to user's API if primary fails
    if (this.userApiKey && !this.userApiKey.includes('your_api_key_here')) {
      try {
        this.useSharedAPI = false
        const prompt = this.createFinancialPrompt(transactions)
        const provider = this.providers[this.currentProvider]
        
        let response
        if (this.currentProvider === 'huggingface') {
          response = await this.callHuggingFace(prompt)
        } else {
          response = await this.callOpenAICompatible(provider, prompt)
        }

        return this.parseAIResponse(response)
      } catch (error) {
        console.warn('User API failed, using fallback:', error)
      }
    }

    // Final fallback to local analysis
    return this.getFallbackAnalysis(transactions)
  }

  async callOpenAICompatible(provider, prompt) {
    const apiKey = this.getActiveApiKey()
    
    if (!apiKey || apiKey.includes('your_') || apiKey.includes('_here')) {
      throw new Error('No valid API key available')
    }
    
    const response = await fetch(provider.apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: provider.model,
        messages: [
          {
            role: 'system',
            content: 'You are a professional financial advisor. Provide practical, actionable advice in a friendly tone. Always use Indian Rupees (₹) for currency. Respond in JSON format only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 600,
        temperature: 0.7
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`API Error: ${response.status} - ${response.statusText}. ${errorText}`)
    }

    const data = await response.json()
    return data.choices[0].message.content
  }

  async callHuggingFace(prompt) {
    const apiKey = this.getActiveApiKey()
    
    if (!apiKey || apiKey.includes('your_') || apiKey.includes('_here')) {
      throw new Error('No valid API key available')
    }

    const response = await fetch(this.providers.huggingface.apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_length: 600,
          temperature: 0.7
        }
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Hugging Face API Error: ${response.status}. ${errorText}`)
    }

    const data = await response.json()
    return data[0]?.generated_text || data.generated_text || ''
  }

  createFinancialPrompt(transactions) {
    const expenses = transactions.filter(t => t.type === 'expense')
    const income = transactions.filter(t => t.type === 'income')
    
    const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0)
    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0)
    
    const expensesByCategory = {}
    expenses.forEach(t => {
      expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount
    })

    return `
Analyze these financial transactions and provide comprehensive insights:

FINANCIAL OVERVIEW:
- Income: ₹${totalIncome}
- Total Expenses: ₹${totalExpenses}
- Net Balance: ₹${totalIncome - totalExpenses}
- Savings Rate: ${totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome * 100).toFixed(1) : 0}%

EXPENSES BY CATEGORY:
${Object.entries(expensesByCategory)
  .map(([cat, amount]) => `${cat}: ₹${amount} (${totalExpenses > 0 ? ((amount/totalExpenses)*100).toFixed(1) : 0}%)`)
  .join('\n')}

RECENT TRANSACTIONS:
${transactions.slice(0, 10).map(t => 
  `${t.type}: ₹${t.amount} - ${t.category} (${t.description})`
).join('\n')}

Please provide a comprehensive financial analysis with:
1. A compelling 2-3 sentence financial story/summary
2. Top 3 personalized money-saving tips based on spending patterns
3. One key insight about spending behavior and patterns
4. A motivational message to encourage better financial habits

Format your response as JSON:
{
  "story": "Your engaging financial story here...",
  "tips": ["Specific tip 1", "Specific tip 2", "Specific tip 3"],
  "insight": "Key insight about spending patterns...",
  "motivation": "Motivational message..."
}
`
  }

  // Enhanced AI methods for different types of analysis
  async generateSavingTips(transactions) {
    const prompt = this.createSavingTipsPrompt(transactions)
    
    try {
      const activeKey = this.getActiveApiKey()
      if (activeKey && !activeKey.includes('your_') && !activeKey.includes('_here')) {
        this.enableSharedAPI()
        const response = await this.callOpenAICompatible(this.providers.groq, prompt)
        const parsed = this.parseAIResponse(response)
        return parsed.tips || this.getFallbackSavingTips(transactions)
      }
    } catch (error) {
      console.warn('AI saving tips failed, using fallback:', error)
    }
    
    return this.getFallbackSavingTips(transactions)
  }

  async generateInvestmentAdvice(totals) {
    const prompt = this.createInvestmentPrompt(totals)
    
    try {
      const activeKey = this.getActiveApiKey()
      if (activeKey && !activeKey.includes('your_') && !activeKey.includes('_here')) {
        this.enableSharedAPI()
        const response = await this.callOpenAICompatible(this.providers.groq, prompt)
        const parsed = this.parseAIResponse(response)
        return parsed.recommendations || this.getFallbackInvestmentAdvice(totals)
      }
    } catch (error) {
      console.warn('AI investment advice failed, using fallback:', error)
    }
    
    return this.getFallbackInvestmentAdvice(totals)
  }

  createSavingTipsPrompt(transactions) {
    const expenses = transactions.filter(t => t.type === 'expense')
    const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0)
    
    const expensesByCategory = {}
    expenses.forEach(t => {
      expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount
    })

    return `
Based on these spending patterns, provide 5 specific, actionable money-saving tips:

EXPENSES BY CATEGORY:
${Object.entries(expensesByCategory)
  .map(([cat, amount]) => `${cat}: ₹${amount}`)
  .join('\n')}

TOTAL MONTHLY EXPENSES: ₹${totalExpenses}

Provide practical, specific tips that this person can implement immediately.

Format as JSON:
{
  "tips": ["Specific actionable tip 1", "Specific actionable tip 2", "Specific actionable tip 3", "Specific actionable tip 4", "Specific actionable tip 5"]
}
`
  }

  createInvestmentPrompt(totals) {
    const savingsAmount = totals.balance > 0 ? totals.balance : 0
    const monthlyIncome = totals.income

    return `
Provide investment recommendations for someone with:
- Monthly Income: ₹${monthlyIncome}
- Available Savings: ₹${savingsAmount}
- Savings Rate: ${monthlyIncome > 0 ? ((savingsAmount / monthlyIncome) * 100).toFixed(1) : 0}%

Focus on Indian investment options suitable for beginners.

Format as JSON:
{
  "recommendations": [
    {
      "title": "Investment Option 1",
      "description": "Detailed explanation and why it's suitable"
    },
    {
      "title": "Investment Option 2", 
      "description": "Detailed explanation and why it's suitable"
    },
    {
      "title": "Investment Option 3",
      "description": "Detailed explanation and why it's suitable"
    }
  ]
}
`
  }

  getFallbackSavingTips(transactions) {
    const expenses = transactions.filter(t => t.type === 'expense')
    const expensesByCategory = {}
    expenses.forEach(t => {
      expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount
    })

    const topCategory = Object.entries(expensesByCategory)
      .sort(([,a], [,b]) => b - a)[0]

    const tips = [
      'Track every expense for a week to identify spending patterns',
      'Use the 24-hour rule before making non-essential purchases',
      'Set up automatic transfers to savings account',
      'Review and cancel unused subscriptions monthly',
      'Cook at home more often to reduce food expenses'
    ]

    if (topCategory) {
      tips[0] = `Focus on reducing ${topCategory[0]} expenses by 15% to save ₹${(topCategory[1] * 0.15).toFixed(0)} monthly`
    }

    return tips
  }

  getFallbackInvestmentAdvice(totals) {
    return {
      recommendations: [
        {
          title: 'Emergency Fund',
          description: 'Build an emergency fund covering 6 months of expenses before investing. Keep it in a high-yield savings account or liquid funds.'
        },
        {
          title: 'SIP in Mutual Funds',
          description: 'Start a Systematic Investment Plan (SIP) in diversified equity mutual funds. Begin with ₹1000-2000 monthly for long-term wealth creation.'
        },
        {
          title: 'PPF (Public Provident Fund)',
          description: 'Invest up to ₹1.5 lakh annually in PPF for tax benefits and guaranteed returns. 15-year lock-in period makes it ideal for retirement planning.'
        }
      ]
    }
  }

  parseAIResponse(content) {
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
    } catch (error) {
      console.warn('Failed to parse AI JSON response:', error)
    }

    // Fallback parsing for non-JSON responses
    return {
      story: this.extractSection(content, 'story') || 'Your financial journey is unique and every step counts!',
      tips: this.extractTips(content),
      insight: this.extractSection(content, 'insight') || 'Track your expenses regularly to build better money habits.',
      motivation: this.extractSection(content, 'motivation') || 'You\'re taking control of your finances - keep it up!'
    }
  }

  extractSection(content, section) {
    const patterns = {
      story: /(?:story|summary)[:\s]*(.*?)(?:\n|$)/i,
      insight: /(?:insight|pattern)[:\s]*(.*?)(?:\n|$)/i,
      motivation: /(?:motivation|message)[:\s]*(.*?)(?:\n|$)/i
    }
    
    const match = content.match(patterns[section])
    return match ? match[1].trim() : null
  }

  extractTips(content) {
    const tipPatterns = [
      /(?:tip\s*\d+|•|\d+\.)\s*(.*?)(?:\n|$)/gi,
      /(?:suggestion|recommend)[:\s]*(.*?)(?:\n|$)/gi
    ]
    
    const tips = []
    for (const pattern of tipPatterns) {
      const matches = [...content.matchAll(pattern)]
      matches.forEach(match => {
        if (match[1] && match[1].trim().length > 10) {
          tips.push(match[1].trim())
        }
      })
      if (tips.length >= 3) break
    }
    
    return tips.slice(0, 3)
  }

  getFallbackAnalysis(transactions) {
    const expenses = transactions.filter(t => t.type === 'expense')
    const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0)
    
    if (expenses.length === 0) {
      return {
        story: 'Start tracking your expenses to get personalized AI insights about your spending habits!',
        tips: [
          'Set up a monthly budget to track your income and expenses',
          'Use the 50/30/20 rule: 50% needs, 30% wants, 20% savings',
          'Review your spending weekly to stay on track'
        ],
        insight: 'Regular expense tracking is the foundation of good financial health.',
        motivation: 'Every financial expert started with their first tracked expense. You\'re on the right path!'
      }
    }

    const expensesByCategory = {}
    expenses.forEach(t => {
      expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount
    })

    const topCategory = Object.entries(expensesByCategory)
      .sort(([,a], [,b]) => b - a)[0]

    return {
      story: `You've spent ₹${totalExpenses.toFixed(0)} this period, with ${topCategory[0]} being your largest expense at ₹${topCategory[1].toFixed(0)}. Your spending patterns show you're actively managing your finances!`,
      tips: [
        `Consider reducing ${topCategory[0]} expenses by 15% to save ₹${(topCategory[1] * 0.15).toFixed(0)} monthly`,
        'Set up automatic savings transfers to build your emergency fund',
        'Review and cancel unused subscriptions to free up extra money'
      ],
      insight: `Your top spending category (${topCategory[0]}) represents ${((topCategory[1]/totalExpenses)*100).toFixed(1)}% of your total expenses.`,
      motivation: 'You\'re building great financial awareness by tracking your expenses. Keep it up!'
    }
  }

  async generateBudgetSuggestion(income, expenses) {
    const prompt = `
Based on monthly income of ₹${income} and expenses of ₹${expenses}, suggest an optimal budget allocation.

Consider:
- Current spending patterns
- Indian financial planning best practices
- Emergency fund requirements
- Investment opportunities

Provide specific amounts for needs, wants, and savings with detailed explanation.

Format as JSON:
{
  "needs": amount_for_needs,
  "wants": amount_for_wants, 
  "savings": amount_for_savings,
  "explanation": "Detailed explanation of the allocation strategy and reasoning"
}
`

    try {
      // Try environment/shared API first
      const activeKey = this.getActiveApiKey()
      if (activeKey && !activeKey.includes('your_') && !activeKey.includes('_here')) {
        this.enableSharedAPI()
        const response = await this.callOpenAICompatible(this.providers.groq, prompt)
        const jsonMatch = response.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0])
        }
      }

      // Try user API if shared fails
      if (this.userApiKey && !this.userApiKey.includes('your_api_key_here')) {
        this.useSharedAPI = false
        const provider = this.providers[this.currentProvider]
        let response

        if (this.currentProvider === 'huggingface') {
          response = await this.callHuggingFace(prompt)
        } else {
          response = await this.callOpenAICompatible(provider, prompt)
        }

        const jsonMatch = response.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0])
        }
      }
    } catch (error) {
      console.warn('Budget suggestion failed, using fallback:', error)
    }

    // Enhanced fallback budget suggestion
    const needs = Math.round(income * 0.5)
    const wants = Math.round(income * 0.3)
    const savings = Math.round(income * 0.2)

    return {
      needs,
      wants,
      savings,
      explanation: `Based on the 50/30/20 rule adapted for Indian financial planning: 50% for needs (₹${needs}) including rent, utilities, and groceries; 30% for wants (₹${wants}) like entertainment and dining out; and 20% for savings (₹${savings}) including emergency fund and investments. Consider increasing savings rate if possible for better financial security.`
    }
  }

  // Test API connection
  async testConnection() {
    try {
      const testPrompt = "Respond with just: 'Connection successful!'"
      
      // Test environment/shared API first
      const activeKey = this.getActiveApiKey()
      if (activeKey && !activeKey.includes('your_') && !activeKey.includes('_here')) {
        this.enableSharedAPI()
        await this.callOpenAICompatible(this.providers.groq, testPrompt)
        return { success: true, message: 'API connection successful!' }
      }

      // Test user API
      if (this.userApiKey && !this.userApiKey.includes('your_api_key_here')) {
        this.useSharedAPI = false
        const provider = this.providers[this.currentProvider]
        
        if (this.currentProvider === 'huggingface') {
          await this.callHuggingFace(testPrompt)
        } else {
          await this.callOpenAICompatible(provider, testPrompt)
        }
        
        return { success: true, message: 'Your API connection successful!' }
      }

      return { success: false, message: 'No valid API key configured' }
    } catch (error) {
      return { success: false, message: `Connection failed: ${error.message}` }
    }
  }

  // Get current API status
  getAPIStatus() {
    const activeKey = this.getActiveApiKey()
    
    if (activeKey && !activeKey.includes('your_') && !activeKey.includes('_here')) {
      const isEnvKey = this.envKeys[this.currentProvider] === activeKey
      return {
        type: isEnvKey ? 'environment' : 'shared',
        provider: this.providers[this.currentProvider].name,
        status: isEnvKey ? 'Environment API Active' : 'Shared API Active',
        message: isEnvKey ? 
          `Using your ${this.providers[this.currentProvider].name} API from environment` :
          'Using shared API - completely free for all users!'
      }
    } else if (this.userApiKey && !this.userApiKey.includes('your_api_key_here')) {
      return {
        type: 'user',
        provider: this.providers[this.currentProvider].name,
        status: 'Your API Connected',
        message: `Using your ${this.providers[this.currentProvider].name} API`
      }
    } else {
      return {
        type: 'fallback',
        provider: 'Local Analysis',
        status: 'Basic Analysis Only',
        message: 'Add your API key to .env file or settings for AI insights'
      }
    }
  }
}

export { AIService }
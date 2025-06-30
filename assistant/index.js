// Main Assistant class that orchestrates all components
import { Storage } from './storage.js'
import { Analyzer } from './analyzer.js'
import { UI } from './ui.js'
import { AIService } from '../ai-service.js'
import { generateFinancialPrompt } from './aiPrompt.js'
import { getCategoryInfo } from './categories.js'

export class FinanceAssistant {
  constructor(container) {
    this.container = container
    this.storage = new Storage()
    this.ui = new UI(container)
    this.aiService = new AIService()
    
    // Load data
    this.transactions = this.storage.getTransactions()
    this.aiSettings = this.storage.getAISettings()
    
    // State
    this.isAnalyzing = false
    this.aiAnalysis = null
    this.currentView = 'dashboard' // dashboard, analytics, goals
    this.goals = this.storage.getGoals() || []
    
    // Make instance globally available for event handlers
    window.financeAssistant = this
  }

  // Initialize the application
  init() {
    this.render()
    this.attachEventListeners()
    this.loadAISettings()
    this.updateAIStatusDisplay()
    this.startPeriodicAnalysis()
    
    // Auto-analyze if we have data (free AI is always available)
    if (this.transactions.length >= 3) {
      setTimeout(() => this.performAIAnalysis(), 1000)
    }

    // Show welcome message for new users
    if (this.transactions.length === 0) {
      this.showWelcomeMessage()
    }
  }

  // Main render method
  render() {
    const analyzer = new Analyzer(this.transactions)
    const totals = analyzer.getTotals()
    const insights = analyzer.getSpendingInsights()
    const categoryBreakdown = analyzer.getExpensesByCategory()

    this.container.innerHTML = `
      <div class="container mx-auto max-w-7xl p-4">
        <!-- Header -->
        <header class="text-center mb-8">
          <h1 class="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            🤖 AI Finance Assistant
          </h1>
          <p class="text-gray-600 text-lg">Smart financial insights powered by AI - completely free!</p>
          
          <!-- Quick Stats Bar -->
          <div class="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg">
              <div class="text-2xl font-bold">₹${totals.income.toFixed(0)}</div>
              <div class="text-sm opacity-90">Total Income</div>
            </div>
            <div class="bg-gradient-to-r from-red-500 to-red-600 text-white p-4 rounded-lg">
              <div class="text-2xl font-bold">₹${totals.expenses.toFixed(0)}</div>
              <div class="text-sm opacity-90">Total Expenses</div>
            </div>
            <div class="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg">
              <div class="text-2xl font-bold ${totals.isPositive ? 'text-white' : 'text-red-200'}">
                ₹${totals.balance.toFixed(0)}
              </div>
              <div class="text-sm opacity-90">Net Balance</div>
            </div>
            <div class="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-lg">
              <div class="text-2xl font-bold">${this.transactions.length}</div>
              <div class="text-sm opacity-90">Transactions</div>
            </div>
          </div>
        </header>

        <!-- Navigation Tabs -->
        <div class="mb-6">
          <div class="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <button id="tab-dashboard" class="tab-button ${this.currentView === 'dashboard' ? 'active' : ''}" data-view="dashboard">
              📊 Dashboard
            </button>
            <button id="tab-analytics" class="tab-button ${this.currentView === 'analytics' ? 'active' : ''}" data-view="analytics">
              📈 Analytics
            </button>
            <button id="tab-goals" class="tab-button ${this.currentView === 'goals' ? 'active' : ''}" data-view="goals">
              🎯 Goals
            </button>
            <button id="tab-ai" class="tab-button ${this.currentView === 'ai' ? 'active' : ''}" data-view="ai">
              🤖 AI Insights
            </button>
          </div>
        </div>

        <!-- AI Status Banner -->
        <div class="mb-6">
          ${this.ui.createAIStatusBanner()}
        </div>

        <!-- Content Views -->
        <div id="view-content">
          ${this.renderCurrentView(analyzer, totals, insights, categoryBreakdown)}
        </div>

        <!-- Floating Action Button -->
        <button id="fab-add-transaction" class="fixed bottom-6 right-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-40">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
        </button>

        <!-- Quick Add Modal -->
        <div id="quick-add-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 class="text-xl font-bold text-gray-900 mb-4">Quick Add Transaction</h3>
            ${this.ui.createQuickTransactionForm()}
          </div>
        </div>
      </div>
    `
  }

  renderCurrentView(analyzer, totals, insights, categoryBreakdown) {
    switch (this.currentView) {
      case 'dashboard':
        return this.renderDashboardView(analyzer, totals, insights, categoryBreakdown)
      case 'analytics':
        return this.renderAnalyticsView(analyzer, categoryBreakdown)
      case 'goals':
        return this.renderGoalsView(totals)
      case 'ai':
        return this.renderAIView()
      default:
        return this.renderDashboardView(analyzer, totals, insights, categoryBreakdown)
    }
  }

  renderDashboardView(analyzer, totals, insights, categoryBreakdown) {
    return `
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left Column: Quick Actions -->
        <div class="lg:col-span-1 space-y-6">
          <!-- Quick Add Form -->
          <div class="card">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">💰 Quick Add</h3>
            ${this.ui.createTransactionForm()}
          </div>
          
          <!-- AI Quick Actions -->
          <div class="card">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">🤖 AI Actions</h3>
            <div class="space-y-3">
              <button id="ai-analyze" class="btn-primary w-full">
                🔍 Get AI Analysis
              </button>
              <button id="ai-budget" class="btn-secondary w-full">
                💡 Budget Suggestion
              </button>
              <button id="ai-tips" class="btn-secondary w-full">
                💰 Saving Tips
              </button>
            </div>
          </div>

          <!-- Quick Stats -->
          <div class="card">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">📊 This Month</h3>
            ${this.ui.createMonthlyStats(this.transactions)}
          </div>
        </div>

        <!-- Right Column: Main Content -->
        <div class="lg:col-span-2 space-y-6">
          <!-- AI Insights -->
          <div class="card">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-gray-900">🤖 AI Insights</h3>
              <span class="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">FREE</span>
            </div>
            <div id="ai-insights">
              ${this.aiAnalysis ? this.renderAIInsights() : this.renderDefaultAIMessage()}
            </div>
          </div>

          <!-- Category Breakdown -->
          <div class="card">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">📈 Spending Breakdown</h3>
            <div id="category-breakdown" class="space-y-3">
              ${this.ui.createCategoryBreakdown(categoryBreakdown)}
            </div>
          </div>

          <!-- Recent Transactions -->
          <div class="card">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-semibold text-gray-900">📝 Recent Transactions</h3>
              <div class="flex space-x-2">
                <button id="import-data" class="btn-secondary text-sm">📥 Import</button>
                <button id="export-data" class="btn-secondary text-sm">📤 Export</button>
              </div>
            </div>
            <div id="transactions-list" class="space-y-2 max-h-80 overflow-y-auto">
              ${this.ui.createTransactionsList(this.transactions)}
            </div>
          </div>
        </div>
      </div>
    `
  }

  renderAnalyticsView(analyzer, categoryBreakdown) {
    const monthlyTrends = analyzer.getMonthlyTrends()
    return `
      <div class="space-y-6">
        <!-- Analytics Header -->
        <div class="text-center">
          <h2 class="text-2xl font-bold text-gray-900 mb-2">📈 Financial Analytics</h2>
          <p class="text-gray-600">Deep dive into your spending patterns and trends</p>
        </div>

        <!-- Charts and Analytics -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Spending Trends -->
          <div class="card">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">📊 Monthly Trends</h3>
            ${this.ui.createTrendsChart(monthlyTrends)}
          </div>

          <!-- Category Analysis -->
          <div class="card">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">🎯 Category Analysis</h3>
            ${this.ui.createCategoryChart(categoryBreakdown)}
          </div>

          <!-- Spending Patterns -->
          <div class="card">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">🔍 Spending Patterns</h3>
            ${this.ui.createSpendingPatterns(this.transactions)}
          </div>

          <!-- Financial Health Score -->
          <div class="card">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">💪 Financial Health</h3>
            ${this.ui.createHealthScore(analyzer)}
          </div>
        </div>
      </div>
    `
  }

  renderGoalsView(totals) {
    return `
      <div class="space-y-6">
        <!-- Goals Header -->
        <div class="text-center">
          <h2 class="text-2xl font-bold text-gray-900 mb-2">🎯 Financial Goals</h2>
          <p class="text-gray-600">Set and track your financial objectives</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Add Goal Form -->
          <div class="card">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">➕ Add New Goal</h3>
            ${this.ui.createGoalForm()}
          </div>

          <!-- Goals List -->
          <div class="lg:col-span-2">
            <div class="space-y-4">
              ${this.goals.length > 0 ? this.ui.createGoalsList(this.goals, totals) : this.ui.createEmptyGoalsMessage()}
            </div>
          </div>
        </div>
      </div>
    `
  }

  renderAIView() {
    return `
      <div class="space-y-6">
        <!-- AI Header -->
        <div class="text-center">
          <h2 class="text-2xl font-bold text-gray-900 mb-2">🤖 AI Financial Assistant</h2>
          <p class="text-gray-600">Advanced AI-powered financial insights and recommendations</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- AI Controls -->
          <div class="space-y-6">
            <!-- AI Settings -->
            <div class="card">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">⚙️ AI Settings</h3>
              ${this.ui.createAISettingsPanel()}
            </div>

            <!-- AI Actions -->
            <div class="card">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">🚀 AI Actions</h3>
              <div class="space-y-3">
                <button id="ai-full-analysis" class="btn-primary w-full">🔍 Full Analysis</button>
                <button id="ai-budget-plan" class="btn-secondary w-full">📋 Budget Plan</button>
                <button id="ai-saving-strategy" class="btn-secondary w-full">💰 Saving Strategy</button>
                <button id="ai-investment-advice" class="btn-secondary w-full">📈 Investment Tips</button>
              </div>
            </div>
          </div>

          <!-- AI Insights -->
          <div class="lg:col-span-2">
            <div class="card">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">🧠 AI Insights</h3>
              <div id="ai-detailed-insights">
                ${this.aiAnalysis ? this.renderDetailedAIInsights() : this.renderDefaultAIMessage()}
              </div>
            </div>
          </div>
        </div>
      </div>
    `
  }

  // Event listeners
  attachEventListeners() {
    // Tab navigation
    document.querySelectorAll('.tab-button').forEach(button => {
      button.addEventListener('click', (e) => {
        this.switchView(e.target.dataset.view)
      })
    })

    // Floating Action Button
    document.getElementById('fab-add-transaction').addEventListener('click', () => {
      this.showQuickAddModal()
    })

    // Transaction form
    const form = document.getElementById('transaction-form')
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault()
        this.addTransaction()
      })
    }

    // Transaction type change
    const typeSelect = document.getElementById('transaction-type')
    if (typeSelect) {
      typeSelect.addEventListener('change', (e) => {
        this.ui.updateCategoryOptions(e.target.value)
      })
    }

    // AI Actions
    this.attachAIEventListeners()

    // Data management
    this.attachDataEventListeners()

    // Goals management
    this.attachGoalsEventListeners()

    // Import functionality
    const importBtn = document.getElementById('import-data')
    if (importBtn) {
      importBtn.addEventListener('click', () => this.showImportModal())
    }
  }

  attachAIEventListeners() {
    const aiButtons = [
      'ai-analyze', 'ai-budget', 'ai-tips', 'ai-full-analysis', 
      'ai-budget-plan', 'ai-saving-strategy', 'ai-investment-advice'
    ]

    aiButtons.forEach(buttonId => {
      const button = document.getElementById(buttonId)
      if (button) {
        button.addEventListener('click', () => {
          this.handleAIAction(buttonId)
        })
      }
    })
  }

  attachDataEventListeners() {
    const exportBtn = document.getElementById('export-data')
    if (exportBtn) {
      exportBtn.addEventListener('click', () => this.exportData())
    }

    // Clear data with confirmation
    const clearBtn = document.getElementById('clear-data')
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (confirm('⚠️ This will delete ALL your data permanently. Are you sure?')) {
          this.clearAllData()
        }
      })
    }
  }

  attachGoalsEventListeners() {
    const goalForm = document.getElementById('goal-form')
    if (goalForm) {
      goalForm.addEventListener('submit', (e) => {
        e.preventDefault()
        this.addGoal()
      })
    }
  }

  // View switching
  switchView(view) {
    this.currentView = view
    
    // Update tab buttons
    document.querySelectorAll('.tab-button').forEach(btn => {
      btn.classList.remove('active')
    })
    document.getElementById(`tab-${view}`).classList.add('active')
    
    // Re-render content
    const analyzer = new Analyzer(this.transactions)
    const totals = analyzer.getTotals()
    const insights = analyzer.getSpendingInsights()
    const categoryBreakdown = analyzer.getExpensesByCategory()
    
    document.getElementById('view-content').innerHTML = 
      this.renderCurrentView(analyzer, totals, insights, categoryBreakdown)
    
    // Re-attach event listeners for the new view
    this.attachEventListeners()
  }

  // Enhanced AI functionality
  async handleAIAction(actionId) {
    if (this.transactions.length < 2) {
      this.ui.showNotification('Add at least 2 transactions for AI analysis', 'error')
      return
    }

    const button = document.getElementById(actionId)
    this.ui.showLoading(actionId, true)

    try {
      switch (actionId) {
        case 'ai-analyze':
        case 'ai-full-analysis':
          await this.performAIAnalysis()
          break
        case 'ai-budget':
        case 'ai-budget-plan':
          await this.generateBudgetSuggestion()
          break
        case 'ai-tips':
        case 'ai-saving-strategy':
          await this.generateSavingTips()
          break
        case 'ai-investment-advice':
          await this.generateInvestmentAdvice()
          break
      }
    } catch (error) {
      console.error('AI action failed:', error)
      this.ui.showNotification('AI action failed, please try again', 'error')
    } finally {
      this.ui.showLoading(actionId, false)
    }
  }

  async generateSavingTips() {
    const tips = await this.aiService.generateSavingTips(this.transactions)
    this.showModal('💰 Personalized Saving Tips', this.ui.createSavingTipsDisplay(tips))
  }

  async generateInvestmentAdvice() {
    const analyzer = new Analyzer(this.transactions)
    const totals = analyzer.getTotals()
    const advice = await this.aiService.generateInvestmentAdvice(totals)
    this.showModal('📈 Investment Recommendations', this.ui.createInvestmentAdviceDisplay(advice))
  }

  // Goals functionality
  addGoal() {
    const name = document.getElementById('goal-name').value
    const amount = parseFloat(document.getElementById('goal-amount').value)
    const deadline = document.getElementById('goal-deadline').value
    const category = document.getElementById('goal-category').value

    if (!name || !amount || amount <= 0) {
      this.ui.showNotification('Please fill in all goal details', 'error')
      return
    }

    const goal = {
      id: Date.now(),
      name,
      amount,
      deadline,
      category,
      currentAmount: 0,
      createdAt: new Date().toISOString()
    }

    this.goals.push(goal)
    this.storage.saveGoals(this.goals)
    this.ui.showNotification('Goal added successfully!')
    
    // Refresh goals view
    if (this.currentView === 'goals') {
      this.switchView('goals')
    }
  }

  updateGoalProgress(goalId, amount) {
    const goal = this.goals.find(g => g.id === goalId)
    if (goal) {
      goal.currentAmount = Math.min(goal.currentAmount + amount, goal.amount)
      this.storage.saveGoals(this.goals)
      this.ui.showNotification('Goal progress updated!')
    }
  }

  // Enhanced transaction management
  addTransaction() {
    const type = document.getElementById('transaction-type').value
    const amount = parseFloat(document.getElementById('transaction-amount').value)
    const category = document.getElementById('transaction-category').value
    const description = document.getElementById('transaction-description').value

    if (!amount || amount <= 0) {
      this.ui.showNotification('Please enter a valid amount', 'error')
      return
    }

    const categoryInfo = getCategoryInfo(category)
    const transaction = {
      type,
      amount,
      category,
      description: description || categoryInfo.name
    }

    const newTransaction = this.storage.addTransaction(transaction)
    if (newTransaction) {
      this.transactions.unshift(newTransaction)
      this.updateDashboard()
      this.resetForm()
      this.ui.showNotification('Transaction added successfully!')
      
      // Check if this helps achieve any goals
      this.checkGoalProgress(newTransaction)
      
      // Auto-analyze if we have enough transactions
      if (this.transactions.length >= 3 && !this.isAnalyzing) {
        setTimeout(() => this.performAIAnalysis(), 1000)
      }
    } else {
      this.ui.showNotification('Failed to save transaction', 'error')
    }
  }

  checkGoalProgress(transaction) {
    if (transaction.type === 'income') {
      // Check if this income helps with any savings goals
      const savingsGoals = this.goals.filter(g => g.category === 'savings')
      savingsGoals.forEach(goal => {
        if (goal.currentAmount < goal.amount) {
          const contribution = Math.min(transaction.amount * 0.1, goal.amount - goal.currentAmount)
          this.updateGoalProgress(goal.id, contribution)
        }
      })
    }
  }

  // Utility methods
  showQuickAddModal() {
    document.getElementById('quick-add-modal').classList.remove('hidden')
  }

  hideQuickAddModal() {
    document.getElementById('quick-add-modal').classList.add('hidden')
  }

  showModal(title, content) {
    const modal = document.createElement('div')
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'
    modal.innerHTML = `
      <div class="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-bold text-gray-900">${title}</h3>
          <button class="text-gray-500 hover:text-gray-700" onclick="this.closest('.fixed').remove()">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <div>${content}</div>
      </div>
    `
    document.body.appendChild(modal)
  }

  showWelcomeMessage() {
    setTimeout(() => {
      this.showModal('👋 Welcome to AI Finance Assistant!', `
        <div class="space-y-4">
          <p class="text-gray-600">Get started with these simple steps:</p>
          <div class="space-y-3">
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">1</div>
              <span>Add your first transaction using the form or the + button</span>
            </div>
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">2</div>
              <span>Get instant AI analysis of your spending patterns</span>
            </div>
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">3</div>
              <span>Set financial goals and track your progress</span>
            </div>
          </div>
          <div class="bg-green-50 p-4 rounded-lg border border-green-200">
            <p class="text-green-800 font-medium">🎉 All AI features are completely free!</p>
            <p class="text-green-700 text-sm">No API keys required - start analyzing immediately</p>
          </div>
        </div>
      `)
    }, 1000)
  }

  startPeriodicAnalysis() {
    // Run AI analysis every 5 minutes if user is active
    setInterval(() => {
      if (this.transactions.length >= 3 && !this.isAnalyzing && document.visibilityState === 'visible') {
        this.performAIAnalysis()
      }
    }, 300000) // 5 minutes
  }

  // Enhanced AI analysis
  async performAIAnalysis() {
    if (this.isAnalyzing) return
    
    if (this.transactions.length < 2) {
      this.ui.showNotification('Add at least 2 transactions to get AI analysis', 'error')
      return
    }
    
    this.isAnalyzing = true
    const analyzeBtn = document.getElementById('ai-analyze') || document.getElementById('ai-full-analysis')
    if (analyzeBtn) this.ui.showLoading(analyzeBtn.id, true)

    try {
      this.aiAnalysis = await this.aiService.analyzeFinances(this.transactions)
      this.updateAIInsights()
      this.ui.showNotification('🤖 AI analysis complete!')
    } catch (error) {
      console.error('AI analysis failed:', error)
      this.ui.showNotification('AI analysis failed, using fallback insights', 'error')
    } finally {
      this.isAnalyzing = false
      if (analyzeBtn) this.ui.showLoading(analyzeBtn.id, false)
    }
  }

  updateAIInsights() {
    const insightsContainer = document.getElementById('ai-insights')
    const detailedContainer = document.getElementById('ai-detailed-insights')
    
    if (insightsContainer) {
      insightsContainer.innerHTML = this.renderAIInsights()
    }
    if (detailedContainer) {
      detailedContainer.innerHTML = this.renderDetailedAIInsights()
    }
  }

  renderAIInsights() {
    if (!this.aiAnalysis) return this.renderDefaultAIMessage()

    return `
      <div class="space-y-4">
        <div class="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border-l-4 border-purple-500">
          <h4 class="font-semibold text-purple-900 mb-2">📖 Your Financial Story</h4>
          <p class="text-purple-800 italic">${this.aiAnalysis.story}</p>
        </div>
        
        <div class="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border-l-4 border-blue-500">
          <h4 class="font-semibold text-blue-900 mb-2">🧠 Key Insight</h4>
          <p class="text-blue-800">${this.aiAnalysis.insight}</p>
        </div>
        
        <div class="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border-l-4 border-green-500">
          <h4 class="font-semibold text-green-900 mb-2">💡 Smart Tips</h4>
          <ul class="text-green-800 space-y-1">
            ${this.aiAnalysis.tips.map(tip => `<li class="flex items-start space-x-2"><span>•</span><span>${tip}</span></li>`).join('')}
          </ul>
        </div>
        
        <div class="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg border-l-4 border-yellow-500">
          <h4 class="font-semibold text-yellow-900 mb-2">💪 Motivation</h4>
          <p class="text-yellow-800">${this.aiAnalysis.motivation}</p>
        </div>
      </div>
    `
  }

  renderDetailedAIInsights() {
    if (!this.aiAnalysis) return this.renderDefaultAIMessage()

    return `
      <div class="space-y-6">
        ${this.renderAIInsights()}
        
        <div class="border-t pt-6">
          <h4 class="font-semibold text-gray-900 mb-4">🔍 Detailed Analysis</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="bg-gray-50 p-4 rounded-lg">
              <h5 class="font-medium text-gray-800 mb-2">Spending Velocity</h5>
              <p class="text-sm text-gray-600">Analysis of your spending frequency and patterns</p>
            </div>
            <div class="bg-gray-50 p-4 rounded-lg">
              <h5 class="font-medium text-gray-800 mb-2">Financial Health Score</h5>
              <p class="text-sm text-gray-600">Overall assessment of your financial habits</p>
            </div>
          </div>
        </div>
      </div>
    `
  }

  renderDefaultAIMessage() {
    return `
      <div class="text-center py-8">
        <div class="text-4xl mb-4">🤖</div>
        <h4 class="text-lg font-semibold text-gray-900 mb-2">AI Analysis Ready!</h4>
        <p class="text-gray-600 mb-4">Add transactions and get personalized insights powered by AI</p>
        <div class="bg-green-50 p-4 rounded-lg border border-green-200 mb-4">
          <p class="text-sm text-green-700">
            ✅ Free AI analysis - no setup required!
          </p>
        </div>
        <button class="btn-primary" onclick="window.financeAssistant.performAIAnalysis()">
          🔍 Get AI Analysis
        </button>
      </div>
    `
  }

  // Data management
  updateDashboard() {
    if (this.currentView === 'dashboard') {
      this.switchView('dashboard')
    }
  }

  loadAISettings() {
    const settings = this.storage.getAISettings()
    const providerSelect = document.getElementById('ai-provider')
    const apiKeyInput = document.getElementById('ai-api-key')
    
    if (providerSelect) providerSelect.value = settings.provider
    if (apiKeyInput) apiKeyInput.value = settings.apiKey
    
    if (settings.apiKey) {
      this.aiService.setProvider(settings.provider, settings.apiKey)
    }
  }

  updateAIStatusDisplay() {
    const status = this.aiService.getAPIStatus()
    this.ui.updateAIStatus(status)
  }

  resetForm() {
    const form = document.getElementById('transaction-form')
    if (form) {
      form.reset()
      this.ui.updateCategoryOptions('expense')
    }
  }

  deleteTransaction(id) {
    if (this.storage.deleteTransaction(id)) {
      this.transactions = this.storage.getTransactions()
      this.updateDashboard()
      this.ui.showNotification('Transaction deleted')
    }
  }

  clearAllData() {
    this.storage.clearAllTransactions()
    this.transactions = []
    this.aiAnalysis = null
    this.goals = []
    this.storage.saveGoals([])
    this.updateDashboard()
    this.ui.showNotification('All data cleared successfully!')
  }

  exportData() {
    const data = {
      ...this.storage.exportData(),
      goals: this.goals,
      aiAnalysis: this.aiAnalysis
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `finance-data-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    this.ui.showNotification('Data exported successfully!')
  }

  async generateBudgetSuggestion() {
    const analyzer = new Analyzer(this.transactions)
    const totals = analyzer.getTotals()
    
    if (totals.income === 0) {
      this.ui.showNotification('Add some income transactions first!', 'error')
      return
    }

    try {
      const budgetSuggestion = await this.aiService.generateBudgetSuggestion(totals.income, totals.expenses)
      this.showModal('💡 AI Budget Suggestion', this.ui.createBudgetDisplay(budgetSuggestion))
      this.ui.showNotification('AI budget suggestion generated!')
    } catch (error) {
      const fallbackBudget = analyzer.generateBudgetSuggestion()
      this.showModal('💡 Budget Suggestion', this.ui.createBudgetDisplay(fallbackBudget))
      this.ui.showNotification('Budget suggestion generated')
    }
  }
}
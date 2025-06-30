// DOM manipulation and UI components
import { categories, getCategoryOptions } from './categories.js'

export class UI {
  constructor(container) {
    this.container = container
  }

  // Create AI status banner
  createAIStatusBanner() {
    return `
      <div class="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border border-green-200">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="text-2xl">🤖</div>
            <div>
              <h4 class="font-semibold text-green-800">Free AI Analysis Active</h4>
              <p class="text-sm text-green-700">Powered by Groq - completely free for all users!</p>
            </div>
          </div>
          <div class="flex items-center space-x-2">
            <span class="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">FREE</span>
            <span class="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">NO LIMITS</span>
          </div>
        </div>
      </div>
    `
  }

  // Create summary cards
  createSummaryCards(totals) {
    return `
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="card text-center bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div class="text-3xl font-bold text-green-600">₹${totals.income.toFixed(0)}</div>
          <div class="text-sm text-green-700 font-medium">Total Income</div>
          <div class="text-xs text-green-600 mt-1">💰 Money In</div>
        </div>
        <div class="card text-center bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <div class="text-3xl font-bold text-red-600">₹${totals.expenses.toFixed(0)}</div>
          <div class="text-sm text-red-700 font-medium">Total Expenses</div>
          <div class="text-xs text-red-600 mt-1">💸 Money Out</div>
        </div>
        <div class="card text-center bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div class="text-3xl font-bold ${totals.isPositive ? 'text-blue-600' : 'text-red-600'}">
            ₹${totals.balance.toFixed(0)}
          </div>
          <div class="text-sm text-blue-700 font-medium">Net Balance</div>
          <div class="text-xs text-blue-600 mt-1">${totals.isPositive ? '📈 Surplus' : '📉 Deficit'}</div>
        </div>
      </div>
    `
  }

  // Create enhanced transaction form
  createTransactionForm() {
    const expenseOptions = getCategoryOptions('expense')
    
    return `
      <form id="transaction-form" class="space-y-4">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select id="transaction-type" class="input-field">
              <option value="expense">💸 Expense</option>
              <option value="income">💰 Income</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
            <input type="number" id="transaction-amount" class="input-field" placeholder="0.00" step="0.01" required>
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select id="transaction-category" class="input-field">
            ${expenseOptions.map(option => 
              `<option value="${option.value}">${option.label}</option>`
            ).join('')}
          </select>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <input type="text" id="transaction-description" class="input-field" placeholder="Enter description (optional)">
        </div>
        
        <button type="submit" class="btn-primary w-full">
          <span class="flex items-center justify-center space-x-2">
            <span>➕</span>
            <span>Add Transaction</span>
          </span>
        </button>
      </form>
    `
  }

  // Create quick transaction form for modal
  createQuickTransactionForm() {
    return `
      <form id="quick-transaction-form" class="space-y-4">
        <div class="flex space-x-3">
          <button type="button" class="quick-type-btn active" data-type="expense">
            💸 Expense
          </button>
          <button type="button" class="quick-type-btn" data-type="income">
            💰 Income
          </button>
        </div>
        
        <div>
          <input type="number" id="quick-amount" class="input-field text-lg" placeholder="Amount (₹)" step="0.01" required>
        </div>
        
        <div class="grid grid-cols-2 gap-3">
          <select id="quick-category" class="input-field">
            ${getCategoryOptions('expense').map(option => 
              `<option value="${option.value}">${option.label}</option>`
            ).join('')}
          </select>
          <input type="text" id="quick-description" class="input-field" placeholder="Description">
        </div>
        
        <div class="flex space-x-3">
          <button type="button" class="btn-secondary flex-1" onclick="window.financeAssistant.hideQuickAddModal()">
            Cancel
          </button>
          <button type="submit" class="btn-primary flex-1">
            Add Transaction
          </button>
        </div>
      </form>
    `
  }

  // Create monthly stats
  createMonthlyStats(transactions) {
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    
    const monthlyTransactions = transactions.filter(t => {
      const date = new Date(t.date)
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear
    })

    const monthlyIncome = monthlyTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
    
    const monthlyExpenses = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)

    return `
      <div class="space-y-3">
        <div class="flex justify-between items-center">
          <span class="text-sm text-gray-600">Income</span>
          <span class="font-semibold text-green-600">₹${monthlyIncome.toFixed(0)}</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-sm text-gray-600">Expenses</span>
          <span class="font-semibold text-red-600">₹${monthlyExpenses.toFixed(0)}</span>
        </div>
        <div class="flex justify-between items-center pt-2 border-t">
          <span class="text-sm font-medium text-gray-700">Net</span>
          <span class="font-bold ${monthlyIncome - monthlyExpenses >= 0 ? 'text-green-600' : 'text-red-600'}">
            ₹${(monthlyIncome - monthlyExpenses).toFixed(0)}
          </span>
        </div>
        <div class="text-xs text-gray-500 text-center">
          ${monthlyTransactions.length} transactions this month
        </div>
      </div>
    `
  }

  // Create category breakdown with enhanced visuals
  createCategoryBreakdown(categoryData) {
    if (categoryData.length === 0) {
      return `
        <div class="text-center py-8">
          <div class="text-4xl mb-2">📊</div>
          <p class="text-gray-500">No expenses recorded yet</p>
          <p class="text-sm text-gray-400">Add some transactions to see your spending breakdown</p>
        </div>
      `
    }

    return categoryData.map(category => {
      const progressWidth = Math.min(category.percentage, 100)
      return `
        <div class="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center space-x-3">
              <span class="text-xl">${category.info.icon}</span>
              <div>
                <span class="font-medium text-gray-900">${category.info.name}</span>
                <div class="text-xs text-gray-500">${category.percentage.toFixed(1)}% of total</div>
              </div>
            </div>
            <span class="font-semibold text-gray-900">₹${category.amount.toFixed(0)}</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div class="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500" 
                 style="width: ${progressWidth}%"></div>
          </div>
        </div>
      `
    }).join('')
  }

  // Create enhanced transactions list
  createTransactionsList(transactions) {
    if (transactions.length === 0) {
      return `
        <div class="text-center py-8">
          <div class="text-4xl mb-2">📝</div>
          <p class="text-gray-500">No transactions yet</p>
          <p class="text-sm text-gray-400">Start by adding your first transaction</p>
        </div>
      `
    }

    return transactions.slice(0, 10).map(transaction => {
      const categoryInfo = categories[transaction.category] || categories.other
      const date = new Date(transaction.date).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      })
      
      return `
        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-full ${categoryInfo.color} flex items-center justify-center">
              <span class="text-lg">${categoryInfo.icon}</span>
            </div>
            <div>
              <div class="font-medium text-gray-900">${transaction.description}</div>
              <div class="text-sm text-gray-500">${date} • ${categoryInfo.name}</div>
            </div>
          </div>
          <div class="flex items-center space-x-3">
            <span class="font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}">
              ${transaction.type === 'income' ? '+' : '-'}₹${transaction.amount.toFixed(0)}
            </span>
            <button class="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-all" 
                    onclick="window.financeAssistant.deleteTransaction(${transaction.id})"
                    title="Delete transaction">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
            </button>
          </div>
        </div>
      `
    }).join('')
  }

  // Create insights display
  createInsightsDisplay(insights) {
    return `
      <div class="space-y-4">
        <div class="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
          <h4 class="font-semibold text-blue-900 mb-2">📊 Summary</h4>
          <p class="text-blue-800">${insights.summary}</p>
        </div>
        
        ${insights.alerts.map(alert => `
          <div class="bg-${alert.type === 'danger' ? 'red' : alert.type === 'warning' ? 'yellow' : 'blue'}-50 p-4 rounded-lg border-l-4 border-${alert.type === 'danger' ? 'red' : alert.type === 'warning' ? 'yellow' : 'blue'}-500">
            <div class="flex items-start space-x-2">
              <span class="text-lg">${alert.type === 'danger' ? '⚠️' : alert.type === 'warning' ? '⚡' : 'ℹ️'}</span>
              <p class="text-${alert.type === 'danger' ? 'red' : alert.type === 'warning' ? 'yellow' : 'blue'}-800">${alert.message}</p>
            </div>
          </div>
        `).join('')}
        
        <div class="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
          <h4 class="font-semibold text-green-900 mb-2">💡 Recommendations</h4>
          <ul class="text-green-800 space-y-2">
            ${insights.recommendations.map(rec => `
              <li class="flex items-start space-x-2">
                <span class="text-green-600 mt-1">•</span>
                <span>${rec}</span>
              </li>
            `).join('')}
          </ul>
        </div>
      </div>
    `
  }

  // Create AI settings panel
  createAISettingsPanel() {
    return `
      <div class="space-y-4">
        <div class="bg-green-50 p-4 rounded-lg border border-green-200">
          <div class="flex items-center space-x-3">
            <div class="text-2xl">✅</div>
            <div>
              <h4 class="font-semibold text-green-800">Free AI Active</h4>
              <p class="text-sm text-green-700">No configuration needed - AI analysis is ready!</p>
            </div>
          </div>
        </div>
        
        <div class="border-t pt-4">
          <button id="toggle-advanced-ai" class="text-sm text-blue-600 hover:text-blue-800">
            ⚙️ Advanced AI Settings (Optional)
          </button>
        </div>
        
        <div id="advanced-ai-settings" class="hidden space-y-4">
          <div class="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 class="font-medium text-blue-800 mb-2">Want to use your own AI provider?</h4>
            <p class="text-sm text-blue-700">
              The app works great with free AI, but you can connect your own API for additional features.
            </p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">AI Provider</label>
            <select id="ai-provider" class="input-field">
              <option value="groq">🚀 Groq</option>
              <option value="openai">🧠 OpenAI</option>
              <option value="huggingface">🤗 Hugging Face</option>
            </select>
          </div>
          
          <div id="provider-info" class="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div class="text-sm text-blue-800">
              <strong>Groq:</strong> Fast and reliable AI
              <br><a href="https://console.groq.com/keys" target="_blank" class="text-blue-600 hover:underline">→ Get API Key</a>
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Your API Key (Optional)</label>
            <input type="password" id="ai-api-key" class="input-field" placeholder="Enter your API key...">
            <p class="text-xs text-gray-500 mt-1">Stored locally and never shared</p>
          </div>
          
          <div class="flex space-x-3">
            <button id="test-ai-connection" class="btn-secondary flex-1">🔍 Test</button>
            <button id="save-ai-settings" class="btn-primary flex-1">💾 Save</button>
          </div>
          
          <div id="connection-status" class="hidden p-3 rounded-lg"></div>
        </div>
      </div>
    `
  }

  // Create trends chart (simplified text-based)
  createTrendsChart(monthlyTrends) {
    if (monthlyTrends.length === 0) {
      return '<p class="text-gray-500 text-center py-4">No trend data available yet</p>'
    }

    return `
      <div class="space-y-3">
        ${monthlyTrends.slice(-6).map(trend => `
          <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span class="font-medium text-gray-700">${trend.month}</span>
            <div class="flex items-center space-x-4">
              <span class="text-sm text-green-600">+₹${trend.income.toFixed(0)}</span>
              <span class="text-sm text-red-600">-₹${trend.expenses.toFixed(0)}</span>
              <span class="font-semibold ${trend.balance >= 0 ? 'text-green-600' : 'text-red-600'}">
                ₹${trend.balance.toFixed(0)}
              </span>
            </div>
          </div>
        `).join('')}
      </div>
    `
  }

  // Create category chart
  createCategoryChart(categoryBreakdown) {
    if (categoryBreakdown.length === 0) {
      return '<p class="text-gray-500 text-center py-4">No category data available</p>'
    }

    const total = categoryBreakdown.reduce((sum, cat) => sum + cat.amount, 0)
    
    return `
      <div class="space-y-3">
        ${categoryBreakdown.slice(0, 5).map(category => `
          <div class="flex items-center space-x-3">
            <span class="text-lg">${category.info.icon}</span>
            <div class="flex-1">
              <div class="flex justify-between items-center mb-1">
                <span class="text-sm font-medium text-gray-700">${category.info.name}</span>
                <span class="text-sm text-gray-600">₹${category.amount.toFixed(0)}</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div class="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full" 
                     style="width: ${(category.amount / total * 100)}%"></div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `
  }

  // Create spending patterns
  createSpendingPatterns(transactions) {
    const patterns = this.analyzeSpendingPatterns(transactions)
    
    return `
      <div class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div class="text-center">
            <div class="text-2xl font-bold text-blue-600">${patterns.avgDaily}</div>
            <div class="text-sm text-gray-600">Avg Daily Spend</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-purple-600">${patterns.mostActiveDay}</div>
            <div class="text-sm text-gray-600">Most Active Day</div>
          </div>
        </div>
        <div class="bg-gray-50 p-3 rounded-lg">
          <p class="text-sm text-gray-700">${patterns.insight}</p>
        </div>
      </div>
    `
  }

  analyzeSpendingPatterns(transactions) {
    const expenses = transactions.filter(t => t.type === 'expense')
    const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0)
    const avgDaily = expenses.length > 0 ? (totalExpenses / Math.max(expenses.length, 1)).toFixed(0) : 0
    
    const dayCount = {}
    expenses.forEach(t => {
      const day = new Date(t.date).toLocaleDateString('en-US', { weekday: 'long' })
      dayCount[day] = (dayCount[day] || 0) + 1
    })
    
    const mostActiveDay = Object.keys(dayCount).length > 0 
      ? Object.entries(dayCount).sort(([,a], [,b]) => b - a)[0][0]
      : 'N/A'
    
    return {
      avgDaily: `₹${avgDaily}`,
      mostActiveDay,
      insight: expenses.length > 0 
        ? `You spend most frequently on ${mostActiveDay}s with an average of ₹${avgDaily} per transaction.`
        : 'Add more transactions to see spending patterns.'
    }
  }

  // Create health score
  createHealthScore(analyzer) {
    const totals = analyzer.getTotals()
    const score = this.calculateHealthScore(totals)
    
    return `
      <div class="text-center">
        <div class="relative w-24 h-24 mx-auto mb-4">
          <svg class="w-24 h-24 transform -rotate-90">
            <circle cx="48" cy="48" r="40" stroke="#e5e7eb" stroke-width="8" fill="none"/>
            <circle cx="48" cy="48" r="40" stroke="${score.color}" stroke-width="8" fill="none"
                    stroke-dasharray="251.2" stroke-dashoffset="${251.2 - (score.value / 100) * 251.2}"
                    class="transition-all duration-1000"/>
          </svg>
          <div class="absolute inset-0 flex items-center justify-center">
            <span class="text-xl font-bold" style="color: ${score.color}">${score.value}</span>
          </div>
        </div>
        <h4 class="font-semibold text-gray-900 mb-2">${score.label}</h4>
        <p class="text-sm text-gray-600">${score.description}</p>
      </div>
    `
  }

  calculateHealthScore(totals) {
    if (totals.income === 0) {
      return {
        value: 0,
        label: 'No Data',
        description: 'Add income transactions to calculate your financial health score',
        color: '#6b7280'
      }
    }

    const savingsRate = ((totals.income - totals.expenses) / totals.income) * 100
    let score, label, description, color

    if (savingsRate >= 20) {
      score = Math.min(100, 80 + savingsRate - 20)
      label = 'Excellent'
      description = 'Great job! You\'re saving well and building wealth.'
      color = '#10b981'
    } else if (savingsRate >= 10) {
      score = 60 + (savingsRate - 10)
      label = 'Good'
      description = 'You\'re on the right track. Try to increase your savings rate.'
      color = '#3b82f6'
    } else if (savingsRate >= 0) {
      score = 40 + savingsRate
      label = 'Fair'
      description = 'You\'re breaking even. Focus on reducing expenses.'
      color = '#f59e0b'
    } else {
      score = Math.max(0, 40 + savingsRate)
      label = 'Needs Improvement'
      description = 'You\'re spending more than you earn. Review your budget immediately.'
      color = '#ef4444'
    }

    return {
      value: Math.round(score),
      label,
      description,
      color
    }
  }

  // Create goals form
  createGoalForm() {
    return `
      <form id="goal-form" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Goal Name</label>
          <input type="text" id="goal-name" class="input-field" placeholder="e.g., Emergency Fund" required>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Target Amount (₹)</label>
          <input type="number" id="goal-amount" class="input-field" placeholder="50000" step="100" required>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Target Date</label>
          <input type="date" id="goal-deadline" class="input-field" required>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select id="goal-category" class="input-field">
            <option value="savings">💰 Savings</option>
            <option value="investment">📈 Investment</option>
            <option value="purchase">🛍️ Purchase</option>
            <option value="debt">💳 Debt Payoff</option>
            <option value="other">📦 Other</option>
          </select>
        </div>
        
        <button type="submit" class="btn-primary w-full">
          🎯 Add Goal
        </button>
      </form>
    `
  }

  // Create goals list
  createGoalsList(goals, totals) {
    return goals.map(goal => {
      const progress = (goal.currentAmount / goal.amount) * 100
      const daysLeft = Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24))
      
      return `
        <div class="card">
          <div class="flex justify-between items-start mb-3">
            <div>
              <h4 class="font-semibold text-gray-900">${goal.name}</h4>
              <p class="text-sm text-gray-600">${this.getCategoryIcon(goal.category)} ${goal.category}</p>
            </div>
            <span class="text-sm ${daysLeft > 0 ? 'text-green-600' : 'text-red-600'}">
              ${daysLeft > 0 ? `${daysLeft} days left` : 'Overdue'}
            </span>
          </div>
          
          <div class="mb-3">
            <div class="flex justify-between text-sm mb-1">
              <span>₹${goal.currentAmount.toFixed(0)} / ₹${goal.amount.toFixed(0)}</span>
              <span>${progress.toFixed(1)}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-3">
              <div class="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-500" 
                   style="width: ${Math.min(progress, 100)}%"></div>
            </div>
          </div>
          
          <div class="flex space-x-2">
            <button class="btn-secondary text-sm flex-1" onclick="window.financeAssistant.updateGoalProgress(${goal.id}, 1000)">
              +₹1000
            </button>
            <button class="btn-secondary text-sm flex-1" onclick="window.financeAssistant.updateGoalProgress(${goal.id}, 5000)">
              +₹5000
            </button>
          </div>
        </div>
      `
    }).join('')
  }

  createEmptyGoalsMessage() {
    return `
      <div class="card text-center py-8">
        <div class="text-4xl mb-4">🎯</div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">No Goals Set Yet</h3>
        <p class="text-gray-600 mb-4">Set financial goals to track your progress and stay motivated!</p>
        <div class="bg-blue-50 p-4 rounded-lg">
          <p class="text-sm text-blue-700">
            💡 Tip: Start with an emergency fund goal of 3-6 months of expenses
          </p>
        </div>
      </div>
    `
  }

  getCategoryIcon(category) {
    const icons = {
      savings: '💰',
      investment: '📈',
      purchase: '🛍️',
      debt: '💳',
      other: '📦'
    }
    return icons[category] || '📦'
  }

  // Create budget display
  createBudgetDisplay(budget) {
    return `
      <div class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-blue-50 p-4 rounded-lg border border-blue-200 text-center">
            <div class="text-sm text-blue-600 font-medium">Needs (50%)</div>
            <div class="text-2xl font-bold text-blue-800">₹${budget.needs}</div>
            <div class="text-xs text-blue-600">Rent, utilities, groceries</div>
          </div>
          <div class="bg-green-50 p-4 rounded-lg border border-green-200 text-center">
            <div class="text-sm text-green-600 font-medium">Wants (30%)</div>
            <div class="text-2xl font-bold text-green-800">₹${budget.wants}</div>
            <div class="text-xs text-green-600">Entertainment, dining out</div>
          </div>
          <div class="bg-purple-50 p-4 rounded-lg border border-purple-200 text-center">
            <div class="text-sm text-purple-600 font-medium">Savings (20%)</div>
            <div class="text-2xl font-bold text-purple-800">₹${budget.savings}</div>
            <div class="text-xs text-purple-600">Emergency fund, investments</div>
          </div>
        </div>
        
        <div class="bg-gray-50 p-4 rounded-lg">
          <h4 class="font-medium text-gray-800 mb-2">💡 AI Recommendation</h4>
          <p class="text-gray-700">${budget.explanation}</p>
        </div>
        
        <div class="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 class="font-medium text-blue-800 mb-2">📋 Action Steps</h4>
          <ul class="text-sm text-blue-700 space-y-1">
            <li>• Track your expenses in each category</li>
            <li>• Set up automatic savings transfers</li>
            <li>• Review and adjust monthly</li>
            <li>• Use the 24-hour rule for wants purchases</li>
          </ul>
        </div>
      </div>
    `
  }

  // Create saving tips display
  createSavingTipsDisplay(tips) {
    return `
      <div class="space-y-4">
        ${tips.map((tip, index) => `
          <div class="flex items-start space-x-3 p-4 bg-green-50 rounded-lg border border-green-200">
            <div class="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold text-sm">
              ${index + 1}
            </div>
            <div>
              <p class="text-green-800">${tip}</p>
            </div>
          </div>
        `).join('')}
        
        <div class="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p class="text-sm text-blue-700">
            💡 Implement one tip at a time for better success rate!
          </p>
        </div>
      </div>
    `
  }

  // Create investment advice display
  createInvestmentAdviceDisplay(advice) {
    return `
      <div class="space-y-4">
        <div class="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <h4 class="font-medium text-yellow-800 mb-2">⚠️ Important Disclaimer</h4>
          <p class="text-sm text-yellow-700">
            This is AI-generated advice for educational purposes only. Always consult with a qualified financial advisor before making investment decisions.
          </p>
        </div>
        
        <div class="space-y-3">
          ${advice.recommendations.map(rec => `
            <div class="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h5 class="font-medium text-blue-800 mb-2">${rec.title}</h5>
              <p class="text-blue-700">${rec.description}</p>
            </div>
          `).join('')}
        </div>
        
        <div class="bg-green-50 p-4 rounded-lg border border-green-200">
          <h4 class="font-medium text-green-800 mb-2">🎯 Next Steps</h4>
          <ul class="text-sm text-green-700 space-y-1">
            <li>• Research each investment option thoroughly</li>
            <li>• Start with small amounts to learn</li>
            <li>• Diversify your investments</li>
            <li>• Review and rebalance regularly</li>
          </ul>
        </div>
      </div>
    `
  }

  // Update category options based on transaction type
  updateCategoryOptions(type) {
    const categorySelect = document.getElementById('transaction-category')
    const quickCategorySelect = document.getElementById('quick-category')
    const options = getCategoryOptions(type)
    
    const optionsHtml = options.map(option => 
      `<option value="${option.value}">${option.label}</option>`
    ).join('')
    
    if (categorySelect) categorySelect.innerHTML = optionsHtml
    if (quickCategorySelect) quickCategorySelect.innerHTML = optionsHtml
  }

  // Show notification with enhanced styling
  showNotification(message, type = 'success') {
    const notification = document.createElement('div')
    const bgColor = type === 'error' ? 'bg-red-500' : 'bg-green-500'
    const icon = type === 'error' ? '❌' : '✅'
    
    notification.className = `notification ${type === 'error' ? 'notification-error' : 'notification-success'}`
    notification.innerHTML = `
      <div class="flex items-center space-x-2">
        <span>${icon}</span>
        <span>${message}</span>
      </div>
    `
    
    document.body.appendChild(notification)
    
    setTimeout(() => {
      notification.style.opacity = '0'
      setTimeout(() => notification.remove(), 300)
    }, 3000)
  }

  // Show loading state with spinner
  showLoading(elementId, isLoading) {
    const element = document.getElementById(elementId)
    if (!element) return

    if (isLoading) {
      element.disabled = true
      const originalText = element.textContent
      element.setAttribute('data-original-text', originalText)
      element.innerHTML = '<span class="spinner mr-2"></span>Loading...'
    } else {
      element.disabled = false
      const originalText = element.getAttribute('data-original-text')
      if (originalText) {
        element.textContent = originalText
      }
    }
  }

  // Update AI status indicator
  updateAIStatus(status) {
    // This method can be enhanced based on specific UI needs
    console.log('AI Status:', status)
  }
}
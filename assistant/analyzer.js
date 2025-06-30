// Financial analysis and calculations
import { categories } from './categories.js'

export class Analyzer {
  constructor(transactions) {
    this.transactions = transactions
    this.expenses = transactions.filter(t => t.type === 'expense')
    this.income = transactions.filter(t => t.type === 'income')
  }

  // Basic totals
  getTotals() {
    const totalIncome = this.income.reduce((sum, t) => sum + t.amount, 0)
    const totalExpenses = this.expenses.reduce((sum, t) => sum + t.amount, 0)
    const netBalance = totalIncome - totalExpenses

    return {
      income: totalIncome,
      expenses: totalExpenses,
      balance: netBalance,
      isPositive: netBalance >= 0
    }
  }

  // Expenses by category
  getExpensesByCategory() {
    const expensesByCategory = {}
    
    this.expenses.forEach(transaction => {
      const category = transaction.category
      expensesByCategory[category] = (expensesByCategory[category] || 0) + transaction.amount
    })

    return Object.entries(expensesByCategory)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: this.expenses.length > 0 ? (amount / this.getTotals().expenses * 100) : 0,
        info: categories[category] || categories.other
      }))
      .sort((a, b) => b.amount - a.amount)
  }

  // Top spending category
  getTopSpendingCategory() {
    const categoryBreakdown = this.getExpensesByCategory()
    return categoryBreakdown.length > 0 ? categoryBreakdown[0] : null
  }

  // Spending insights
  getSpendingInsights() {
    const totals = this.getTotals()
    const topCategory = this.getTopSpendingCategory()
    const categoryBreakdown = this.getExpensesByCategory()

    if (this.expenses.length === 0) {
      return {
        summary: 'No expenses recorded yet. Start tracking to get insights!',
        recommendations: [
          'Begin by adding your daily expenses',
          'Set up a monthly budget',
          'Track both income and expenses'
        ],
        alerts: []
      }
    }

    const insights = {
      summary: this.generateSummary(totals, topCategory),
      recommendations: this.generateRecommendations(categoryBreakdown, totals),
      alerts: this.generateAlerts(categoryBreakdown, totals)
    }

    return insights
  }

  generateSummary(totals, topCategory) {
    if (!topCategory) return 'Start adding expenses to see your spending summary.'

    const balanceStatus = totals.isPositive ? 'positive' : 'negative'
    const balanceText = totals.isPositive ? 'surplus' : 'deficit'
    
    return `You've spent ₹${totals.expenses.toFixed(0)} this period, with ${topCategory.info.name} being your largest expense (₹${topCategory.amount.toFixed(0)}). Your current balance shows a ${balanceText} of ₹${Math.abs(totals.balance).toFixed(0)}.`
  }

  generateRecommendations(categoryBreakdown, totals) {
    const recommendations = []

    // High spending category recommendations
    const topCategories = categoryBreakdown.slice(0, 2)
    topCategories.forEach(category => {
      if (category.percentage > 30) {
        const savingTips = category.info.savingTips || ['Review and optimize this category']
        recommendations.push(`${category.info.name} takes up ${category.percentage.toFixed(1)}% of your budget. Try: ${savingTips[0]}`)
      }
    })

    // General recommendations based on balance
    if (totals.balance < 0) {
      recommendations.push('Your expenses exceed income. Focus on reducing the top 2 spending categories.')
    } else if (totals.balance < totals.income * 0.1) {
      recommendations.push('Your savings rate is low. Aim to save at least 10-20% of your income.')
    }

    // Default recommendations if none generated
    if (recommendations.length === 0) {
      recommendations.push('Great job tracking your expenses! Consider setting up automatic savings.')
      recommendations.push('Review your spending weekly to stay on track with your goals.')
    }

    return recommendations.slice(0, 3)
  }

  generateAlerts(categoryBreakdown, totals) {
    const alerts = []

    // High percentage alerts
    categoryBreakdown.forEach(category => {
      if (category.percentage > 40) {
        alerts.push({
          type: 'warning',
          message: `${category.info.name} represents ${category.percentage.toFixed(1)}% of your spending - consider reducing this category.`
        })
      }
    })

    // Negative balance alert
    if (totals.balance < 0) {
      alerts.push({
        type: 'danger',
        message: `You're spending ₹${Math.abs(totals.balance).toFixed(0)} more than you earn. Review your budget immediately.`
      })
    }

    // Low savings alert
    if (totals.balance > 0 && totals.balance < totals.income * 0.05) {
      alerts.push({
        type: 'info',
        message: 'Your savings rate is below 5%. Consider increasing it to build financial security.'
      })
    }

    return alerts
  }

  // Monthly trends (if we have date data)
  getMonthlyTrends() {
    const monthlyData = {}
    
    this.transactions.forEach(transaction => {
      const date = new Date(transaction.date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { income: 0, expenses: 0, transactions: 0 }
      }
      
      if (transaction.type === 'income') {
        monthlyData[monthKey].income += transaction.amount
      } else {
        monthlyData[monthKey].expenses += transaction.amount
      }
      monthlyData[monthKey].transactions++
    })

    return Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        ...data,
        balance: data.income - data.expenses
      }))
      .sort((a, b) => a.month.localeCompare(b.month))
  }

  // Budget suggestions
  generateBudgetSuggestion() {
    const totals = this.getTotals()
    
    if (totals.income === 0) {
      return {
        needs: 0,
        wants: 0,
        savings: 0,
        explanation: 'Add income transactions to get budget suggestions.'
      }
    }

    // 50/30/20 rule as base
    const needs = Math.round(totals.income * 0.5)
    const wants = Math.round(totals.income * 0.3)
    const savings = Math.round(totals.income * 0.2)

    // Adjust based on current spending
    const currentExpenses = totals.expenses
    let explanation = `Based on the 50/30/20 rule for your income of ₹${totals.income.toFixed(0)}.`

    if (currentExpenses > totals.income) {
      explanation = `Your current expenses (₹${currentExpenses.toFixed(0)}) exceed income. Focus on reducing expenses first.`
    } else if (currentExpenses > needs + wants) {
      explanation = `You're overspending on wants. Try to limit total expenses to ₹${(needs + wants).toFixed(0)}.`
    }

    return { needs, wants, savings, explanation }
  }
}
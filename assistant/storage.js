// Enhanced local storage management for transactions, settings, and goals
export class Storage {
  constructor() {
    this.TRANSACTIONS_KEY = 'finance_transactions'
    this.AI_SETTINGS_KEY = 'ai_settings'
    this.GOALS_KEY = 'finance_goals'
    this.USER_PREFERENCES_KEY = 'user_preferences'
  }

  // Transaction management
  getTransactions() {
    try {
      const data = localStorage.getItem(this.TRANSACTIONS_KEY)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.warn('Failed to load transactions:', error)
      return []
    }
  }

  saveTransactions(transactions) {
    try {
      localStorage.setItem(this.TRANSACTIONS_KEY, JSON.stringify(transactions))
      return true
    } catch (error) {
      console.error('Failed to save transactions:', error)
      return false
    }
  }

  addTransaction(transaction) {
    const transactions = this.getTransactions()
    const newTransaction = {
      id: Date.now(),
      date: new Date().toISOString(),
      ...transaction
    }
    transactions.unshift(newTransaction)
    return this.saveTransactions(transactions) ? newTransaction : null
  }

  deleteTransaction(id) {
    const transactions = this.getTransactions()
    const filtered = transactions.filter(t => t.id !== id)
    return this.saveTransactions(filtered)
  }

  clearAllTransactions() {
    localStorage.removeItem(this.TRANSACTIONS_KEY)
    return true
  }

  // AI Settings management
  getAISettings() {
    try {
      const data = localStorage.getItem(this.AI_SETTINGS_KEY)
      return data ? JSON.parse(data) : {
        provider: 'groq',
        apiKey: '',
        enabled: true, // Free AI is always enabled
        autoAnalysis: true
      }
    } catch (error) {
      console.warn('Failed to load AI settings:', error)
      return { provider: 'groq', apiKey: '', enabled: true, autoAnalysis: true }
    }
  }

  saveAISettings(settings) {
    try {
      const currentSettings = this.getAISettings()
      const newSettings = { ...currentSettings, ...settings }
      localStorage.setItem(this.AI_SETTINGS_KEY, JSON.stringify(newSettings))
      return true
    } catch (error) {
      console.error('Failed to save AI settings:', error)
      return false
    }
  }

  // Goals management
  getGoals() {
    try {
      const data = localStorage.getItem(this.GOALS_KEY)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.warn('Failed to load goals:', error)
      return []
    }
  }

  saveGoals(goals) {
    try {
      localStorage.setItem(this.GOALS_KEY, JSON.stringify(goals))
      return true
    } catch (error) {
      console.error('Failed to save goals:', error)
      return false
    }
  }

  addGoal(goal) {
    const goals = this.getGoals()
    const newGoal = {
      id: Date.now(),
      createdAt: new Date().toISOString(),
      currentAmount: 0,
      ...goal
    }
    goals.push(newGoal)
    return this.saveGoals(goals) ? newGoal : null
  }

  updateGoal(id, updates) {
    const goals = this.getGoals()
    const goalIndex = goals.findIndex(g => g.id === id)
    if (goalIndex !== -1) {
      goals[goalIndex] = { ...goals[goalIndex], ...updates }
      return this.saveGoals(goals)
    }
    return false
  }

  deleteGoal(id) {
    const goals = this.getGoals()
    const filtered = goals.filter(g => g.id !== id)
    return this.saveGoals(filtered)
  }

  // User preferences
  getUserPreferences() {
    try {
      const data = localStorage.getItem(this.USER_PREFERENCES_KEY)
      return data ? JSON.parse(data) : {
        currency: 'INR',
        dateFormat: 'DD/MM/YYYY',
        theme: 'light',
        notifications: true,
        autoBackup: false
      }
    } catch (error) {
      console.warn('Failed to load user preferences:', error)
      return {
        currency: 'INR',
        dateFormat: 'DD/MM/YYYY',
        theme: 'light',
        notifications: true,
        autoBackup: false
      }
    }
  }

  saveUserPreferences(preferences) {
    try {
      const currentPrefs = this.getUserPreferences()
      const newPrefs = { ...currentPrefs, ...preferences }
      localStorage.setItem(this.USER_PREFERENCES_KEY, JSON.stringify(newPrefs))
      return true
    } catch (error) {
      console.error('Failed to save user preferences:', error)
      return false
    }
  }

  // Data export/import with enhanced features
  exportData() {
    return {
      transactions: this.getTransactions(),
      aiSettings: this.getAISettings(),
      goals: this.getGoals(),
      userPreferences: this.getUserPreferences(),
      exportDate: new Date().toISOString(),
      version: '2.0'
    }
  }

  importData(data) {
    try {
      if (data.transactions) {
        this.saveTransactions(data.transactions)
      }
      if (data.aiSettings) {
        this.saveAISettings(data.aiSettings)
      }
      if (data.goals) {
        this.saveGoals(data.goals)
      }
      if (data.userPreferences) {
        this.saveUserPreferences(data.userPreferences)
      }
      return true
    } catch (error) {
      console.error('Failed to import data:', error)
      return false
    }
  }

  // Backup and restore
  createBackup() {
    const backup = {
      ...this.exportData(),
      backupDate: new Date().toISOString()
    }
    
    try {
      const backups = JSON.parse(localStorage.getItem('finance_backups') || '[]')
      backups.unshift(backup)
      // Keep only last 5 backups
      const limitedBackups = backups.slice(0, 5)
      localStorage.setItem('finance_backups', JSON.stringify(limitedBackups))
      return true
    } catch (error) {
      console.error('Failed to create backup:', error)
      return false
    }
  }

  getBackups() {
    try {
      return JSON.parse(localStorage.getItem('finance_backups') || '[]')
    } catch (error) {
      console.warn('Failed to load backups:', error)
      return []
    }
  }

  restoreFromBackup(backupIndex) {
    try {
      const backups = this.getBackups()
      if (backups[backupIndex]) {
        return this.importData(backups[backupIndex])
      }
      return false
    } catch (error) {
      console.error('Failed to restore from backup:', error)
      return false
    }
  }

  // Storage usage statistics
  getStorageStats() {
    const stats = {
      transactions: this.getTransactions().length,
      goals: this.getGoals().length,
      backups: this.getBackups().length,
      totalSize: 0
    }

    // Calculate approximate storage size
    try {
      const allData = JSON.stringify(this.exportData())
      stats.totalSize = new Blob([allData]).size
    } catch (error) {
      stats.totalSize = 0
    }

    return stats
  }

  // Clear all data
  clearAllData() {
    localStorage.removeItem(this.TRANSACTIONS_KEY)
    localStorage.removeItem(this.GOALS_KEY)
    localStorage.removeItem('finance_backups')
    // Keep AI settings and user preferences
    return true
  }
}
// Category definitions with colors, icons, and metadata
export const categories = {
  food: { 
    name: 'Food & Dining', 
    color: 'bg-orange-100 text-orange-800', 
    icon: '🍽️',
    savingTips: ['Cook at home more often', 'Plan meals weekly', 'Use grocery lists']
  },
  transport: { 
    name: 'Transportation', 
    color: 'bg-blue-100 text-blue-800', 
    icon: '🚗',
    savingTips: ['Use public transport', 'Carpool when possible', 'Walk or bike for short distances']
  },
  shopping: { 
    name: 'Shopping', 
    color: 'bg-purple-100 text-purple-800', 
    icon: '🛍️',
    savingTips: ['Wait 24 hours before buying', 'Compare prices online', 'Use shopping lists']
  },
  entertainment: { 
    name: 'Entertainment', 
    color: 'bg-pink-100 text-pink-800', 
    icon: '🎬',
    savingTips: ['Look for free events', 'Use streaming instead of cinema', 'Take advantage of happy hours']
  },
  utilities: { 
    name: 'Utilities', 
    color: 'bg-yellow-100 text-yellow-800', 
    icon: '💡',
    savingTips: ['Switch to LED bulbs', 'Unplug devices when not in use', 'Use energy-efficient appliances']
  },
  healthcare: { 
    name: 'Healthcare', 
    color: 'bg-green-100 text-green-800', 
    icon: '🏥',
    savingTips: ['Use generic medicines', 'Regular health checkups', 'Compare healthcare providers']
  },
  education: { 
    name: 'Education', 
    color: 'bg-indigo-100 text-indigo-800', 
    icon: '📚',
    savingTips: ['Use free online courses', 'Buy used textbooks', 'Apply for scholarships']
  },
  other: { 
    name: 'Other', 
    color: 'bg-gray-100 text-gray-800', 
    icon: '📦',
    savingTips: ['Track miscellaneous expenses', 'Set spending limits', 'Review monthly']
  },
  income: { 
    name: 'Income', 
    color: 'bg-emerald-100 text-emerald-800', 
    icon: '💰',
    savingTips: ['Diversify income sources', 'Negotiate salary increases', 'Consider side hustles']
  }
}

// Get category options for different transaction types
export function getCategoryOptions(type) {
  if (type === 'income') {
    return [{ value: 'income', label: '💰 Income' }]
  }
  
  return Object.entries(categories)
    .filter(([key]) => key !== 'income')
    .map(([key, category]) => ({
      value: key,
      label: `${category.icon} ${category.name}`
    }))
}

// Get category info by key
export function getCategoryInfo(categoryKey) {
  return categories[categoryKey] || categories.other
}
// AI prompt generation for financial analysis
export function generateFinancialPrompt(transactions, analysisType = 'full') {
  const expenses = transactions.filter(t => t.type === 'expense')
  const income = transactions.filter(t => t.type === 'income')
  
  const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0)
  const totalIncome = income.reduce((sum, t) => sum + t.amount, 0)
  
  const expensesByCategory = {}
  expenses.forEach(t => {
    expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount
  })

  const baseData = `
FINANCIAL OVERVIEW:
- Income: ₹${totalIncome}
- Total Expenses: ₹${totalExpenses}
- Net Balance: ₹${totalIncome - totalExpenses}
- Number of Transactions: ${transactions.length}

EXPENSES BY CATEGORY:
${Object.entries(expensesByCategory)
  .map(([cat, amount]) => `- ${cat}: ₹${amount} (${((amount/totalExpenses)*100).toFixed(1)}%)`)
  .join('\n')}

RECENT TRANSACTIONS:
${transactions.slice(0, 8).map(t => 
  `- ${t.type}: ₹${t.amount} - ${t.category} (${t.description})`
).join('\n')}
`

  switch (analysisType) {
    case 'full':
      return `${baseData}

Please analyze this financial data and provide:
1. A 2-3 sentence engaging financial story/summary
2. Top 3 personalized money-saving tips based on spending patterns
3. One key insight about spending behavior
4. A motivational message to encourage better financial habits

Format as JSON:
{
  "story": "Your financial story...",
  "tips": ["Tip 1", "Tip 2", "Tip 3"],
  "insight": "Key spending insight...",
  "motivation": "Motivational message..."
}`

    case 'budget':
      return `${baseData}

Based on this financial data, suggest an optimal budget allocation. Consider:
- Current spending patterns
- Income level
- Potential areas for optimization

Provide specific amounts for needs, wants, and savings with explanation.

Format as JSON:
{
  "needs": amount_for_needs,
  "wants": amount_for_wants,
  "savings": amount_for_savings,
  "explanation": "Brief explanation of the allocation strategy"
}`

    case 'tips':
      return `${baseData}

Focus on the spending patterns and provide 5 specific, actionable money-saving tips tailored to this person's expenses. Be practical and specific.

Format as JSON:
{
  "tips": ["Specific tip 1", "Specific tip 2", "Specific tip 3", "Specific tip 4", "Specific tip 5"],
  "focus_area": "Main category to focus on for savings"
}`

    case 'insights':
      return `${baseData}

Analyze the spending patterns and provide:
1. Key behavioral insights
2. Spending trends
3. Areas of concern
4. Positive financial habits observed

Format as JSON:
{
  "behavioral_insights": ["Insight 1", "Insight 2"],
  "trends": "Observed spending trends",
  "concerns": ["Concern 1", "Concern 2"],
  "positive_habits": ["Good habit 1", "Good habit 2"]
}`

    default:
      return baseData
  }
}

// Generate prompts for specific scenarios
export function generateScenarioPrompt(scenario, data) {
  switch (scenario) {
    case 'overspending':
      return `The user is spending ₹${data.expenses} against an income of ₹${data.income}. 
      They're overspending by ₹${data.expenses - data.income}. 
      Provide urgent, actionable advice to get back on track.`

    case 'first_time':
      return `This is a new user with their first few transactions. 
      Provide encouraging, educational content about expense tracking and budgeting basics.`

    case 'good_saver':
      return `The user has a healthy savings rate of ${data.savingsRate}%. 
      Provide advanced tips for investment and wealth building.`

    case 'category_heavy':
      return `The user spends ${data.percentage}% of their budget on ${data.category}. 
      Provide specific tips for optimizing this category.`

    default:
      return generateFinancialPrompt(data.transactions)
  }
}
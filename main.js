import './style.css'
import { FinanceAssistant } from './assistant/index.js'

// Initialize the Finance Assistant
const app = document.querySelector('#app')
const financeAssistant = new FinanceAssistant(app)
financeAssistant.init()
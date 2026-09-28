import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import '@fortawesome/fontawesome-free/css/all.min.css'
import './assets/css/variables.css'
import './assets/css/navbar.css'
import './assets/css/sidebar.css'
import './assets/css/layout.css'
import './assets/css/sales-reports.css'
import './assets/css/pickup.css'
import './assets/css/modal.css'
import './assets/css/login.css'
import './assets/css/notifications.css'
import './assets/css/analytics.css'
import './assets/css/loading-system.css'
import './index.css'
import App from './App.jsx'

// Global event listener to prevent emoji input in all input and textarea fields
document.addEventListener('input', (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
    // Regex to detect emojis
    const emojiRegex = /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu;
    
    if (emojiRegex.test(e.target.value)) {
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const oldLength = e.target.value.length;
      
      // Strip emojis
      const newValue = e.target.value.replace(emojiRegex, '');
      
      // Bypass React's input value setter tracking to trigger onChange
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
      const nativeTextAreaValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value").set;
      
      if (e.target.tagName === 'INPUT') {
        nativeInputValueSetter.call(e.target, newValue);
      } else {
        nativeTextAreaValueSetter.call(e.target, newValue);
      }
      
      // Dispatch event to notify React
      e.target.dispatchEvent(new Event('input', { bubbles: true }));
      
      // Restore cursor position
      try {
        const diff = oldLength - newValue.length;
        e.target.setSelectionRange(Math.max(0, start - diff), Math.max(0, end - diff));
      } catch (err) {}
    }
  }
}, { capture: true });

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

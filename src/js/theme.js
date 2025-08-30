// Theme Management System
class ThemeManager {
  constructor() {
    this.currentTheme = localStorage.getItem('ticketdesk-theme') || 'default'
    this.themeToggle = document.querySelector('.theme-toggle')
    this.themeOptions = document.querySelector('.theme-options')
    this.colorOptions = document.querySelectorAll('.theme-option')
    this.themeSelector = document.querySelector('.theme-selector')

    this.init()
  }

  init() {
    // Apply saved theme
    this.applyTheme(this.currentTheme)

    // Set up event listeners
    this.themeToggle.addEventListener('click', (e) => {
      e.stopPropagation()
      this.togglePalette()
    })

    // Set up color option listeners
    this.colorOptions.forEach((option) => {
      option.addEventListener('click', () => {
        const theme = option.dataset.theme
        if (!theme) return
        this.changeTheme(theme)
      })
    })

    // Close palette when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.theme-selector')) {
        this.closePalette()
      }
    })

    // Close with Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closePalette()
    })

    // Update active color indicator
    this.updateActiveColor()
  }

  togglePalette() {
    this.themeSelector.classList.toggle('active')
  }

  closePalette() {
    this.themeSelector.classList.remove('active')
  }

  changeTheme(theme) {
    this.currentTheme = theme
    this.applyTheme(theme)
    this.saveTheme(theme)
    this.updateActiveColor()
    this.closePalette()

    // Add a subtle animation effect
    document.body.style.transform = 'scale(0.98)'
    setTimeout(() => {
      document.body.style.transform = 'scale(1)'
    }, 150)
  }

  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme)
  }

  saveTheme(theme) {
    localStorage.setItem('ticketdesk-theme', theme)
  }

  updateActiveColor() {
    this.colorOptions.forEach((option) => {
      option.classList.remove('active')
      if (option.dataset.theme === this.currentTheme) {
        option.classList.add('active')
      }
    })
  }
}

export function toggleThemeSelector() {
  const themeSelector = document.querySelector('.theme-selector')
  if (!themeSelector) return
  themeSelector.classList.toggle('active')
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new ThemeManager()

  document.body.style.opacity = '0'
  setTimeout(() => {
    document.body.style.transition = 'opacity 0.5s ease'
    document.body.style.opacity = '1'
  }, 100)
})

const additionalStyles = `
    .theme-option.active {
        border-color: var(--accent-color) !important;
        box-shadow: 0 0 15px var(--accent-color);
        transform: scale(1.2);
    }
    
    .cta-button:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }
`

const styleSheet = document.createElement('style')
styleSheet.textContent = additionalStyles
document.head.appendChild(styleSheet)

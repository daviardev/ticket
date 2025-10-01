/**
 * ==================================================
 * SISTEMA DE GESTIÓN DE TEMAS
 * ==================================================
 * Este archivo maneja el cambio de temas/colores
 * de la aplicación y guarda la preferencia del usuario
 * ==================================================
 */

class ThemeManager {
  constructor() {
    // Obtener tema guardado o usar 'default' por defecto
    this.currentTheme = localStorage.getItem('ticketdesk-theme') || 'default'
    
    // Obtener elementos del DOM relacionados con temas
    this.themeToggle = document.querySelector('.theme-toggle')      // Botón para abrir selector
    this.themeOptions = document.querySelector('.theme-options')    // Contenedor de opciones
    this.colorOptions = document.querySelectorAll('.theme-option')  // Botones de colores
    this.themeSelector = document.querySelector('.theme-selector')  // Selector completo

    this.init()  // Inicializar todo
  }

  /**
   * Inicializa el sistema de temas
   */
  init() {
    // Aplicar el tema guardado
    this.applyTheme(this.currentTheme)

    // Configurar evento para abrir/cerrar selector de temas
    this.themeToggle.addEventListener('click', (e) => {
      e.stopPropagation()
      this.togglePalette()  // Mostrar/ocultar opciones de tema
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

// Forwarder: make secondary buttons reuse the primary toggle logic
export function forwardThemeToggle() {
  const primary = document.querySelector('.theme-toggle')
  if (primary) {
    // trigger the same click handler the primary toggle uses
    primary.click()
    return true
  }
  // fallback: toggle directly
  toggleThemeSelector()
  return false
}

if (typeof window !== 'undefined')
  window.forwardThemeToggle = forwardThemeToggle

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

// Mobile palette behavior: toggle the .mobile-theme-palette from the bottom-nav
document.addEventListener('DOMContentLoaded', () => {
  const mobileToggle = document.querySelector('[data-mobile-toggle]')
  const mobilePalette = document.querySelector('.mobile-theme-palette')

  if (!mobileToggle || !mobilePalette) return

  function openMobilePalette() {
    mobilePalette.classList.add('open')
    // mark bottom-nav as open for CSS hooks
    const bottom = mobileToggle.closest('.bottom-nav')
    if (bottom) bottom.classList.add('open')
  }

  function closeMobilePalette() {
    mobilePalette.classList.remove('open')
    const bottom = mobileToggle.closest('.bottom-nav')
    if (bottom) bottom.classList.remove('open')
  }

  mobileToggle.addEventListener('click', (e) => {
    e.stopPropagation()
    if (mobilePalette.classList.contains('open')) closeMobilePalette()
    else openMobilePalette()
  })

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (
      !e.target.closest('.mobile-theme-palette') &&
      !e.target.closest('[data-mobile-toggle]')
    ) {
      closeMobilePalette()
    }
  })

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMobilePalette()
  })

  // Apply theme when an option inside mobile palette is clicked
  mobilePalette.addEventListener('click', (e) => {
    const btn = e.target.closest('.theme-option')
    if (!btn) return
    const theme = btn.dataset.theme
    if (!theme) return
    // apply theme using existing exported function if available, else do minimal
    try {
      // call the class-based ThemeManager via a global forwarder if present
      const primary = document.querySelector('.theme-toggle')
      if (primary) primary.click()
    } catch {
      document.documentElement.setAttribute('data-theme', theme)
      localStorage.setItem('ticketdesk-theme', theme)
    }
    closeMobilePalette()
  })
})

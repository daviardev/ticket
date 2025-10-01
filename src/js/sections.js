/**
 * ==================================================
 * NAVEGACIÓN ENTRE SECCIONES
 * ==================================================
 * Este archivo controla el cambio entre las diferentes
 * secciones de la aplicación (Dashboard, Tickets, etc.)
 * ==================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  // Obtener elementos del DOM
  const aside = document.querySelector('.container-glpi-window aside')  // Menú lateral
  const sections = document.querySelectorAll('article section')          // Todas las secciones

  /**
   * Cambia entre secciones de la aplicación
   * @param {string} targetSectionId - ID de la sección a mostrar
   */
  function switchSection(targetSectionId) {
    // Actualizar botones del menú - marcar el activo
    aside.querySelectorAll('button').forEach(btn => {
      if (btn.getAttribute('data-section') === targetSectionId) {
        btn.classList.add('active')      // Marcar botón como activo
      } else {
        btn.classList.remove('active')   // Quitar activo de otros botones
      }
    })

    // Actualizar secciones - mostrar/ocultar el contenido
    sections.forEach(section => {
      if (section.id === targetSectionId) {
        section.classList.add('active')      // Mostrar sección seleccionada
      } else {
        section.classList.remove('active')   // Ocultar otras secciones
      }
    })
  }

  /**
   * Detectar clicks en los botones del menú lateral
   */
  aside.addEventListener('click', (e) => {
    const button = e.target.closest('button[data-section]')
    if (button) {
      const sectionId = button.getAttribute('data-section')
      switchSection(sectionId)  // Cambiar a la sección clickeada
    }
  })

  // Mostrar dashboard por defecto al cargar la página
  const defaultSection = 'dashboard'
  switchSection(defaultSection)
})
document.addEventListener('DOMContentLoaded', () => {
  // Obtener elementos
  const aside = document.querySelector('.container-glpi-window aside')
  const sections = document.querySelectorAll('article section')

  // Función para cambiar secciones
  function switchSection(targetSectionId) {
    // Actualizar botones
    aside.querySelectorAll('button').forEach(btn => {
      if (btn.getAttribute('data-section') === targetSectionId) {
        btn.classList.add('active')
      } else {
        btn.classList.remove('active')
      }
    })

    // Actualizar secciones
    sections.forEach(section => {
      if (section.id === targetSectionId) {
        section.classList.add('active')
      } else {
        section.classList.remove('active')
      }
    })
  }

  // Event listener para los clicks en botones
  aside.addEventListener('click', (e) => {
    const button = e.target.closest('button[data-section]')
    if (button) {
      const sectionId = button.getAttribute('data-section')
      switchSection(sectionId)
    }
  })

  // Mostrar dashboard por defecto
  const defaultSection = 'dashboard'
  switchSection(defaultSection)
})
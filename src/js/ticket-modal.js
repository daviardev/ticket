document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('ticket-modal')
  const modalClose = modal.querySelector('.ticket-modal-close')
  const modalTitle = modal.querySelector('.ticket-modal-title')
  const modalBody = modal.querySelector('.ticket-modal-body')
  const modalDate = modal.querySelector('.ticket-date')
  const modalPriority = modal.querySelector('.ticket-priority')
  const modalStatus = modal.querySelector('.ticket-status')
  const ticketList = document.querySelector('.ticket-list')

  // Función para mostrar la modal con los datos del ticket
  function showTicketModal(ticket) {
    modalTitle.textContent = ticket.querySelector('.ticket-title').textContent
    modalBody.textContent = ticket.querySelector('.ticket-description').textContent
    modalDate.textContent = ticket.querySelector('.ticket-date').textContent
    modalPriority.textContent = ticket.querySelector('.ticket-priority').textContent
    modalStatus.textContent = ticket.querySelector('.ticket-status').textContent
    modal.showModal()
  }

  // Agregar click handler a los tickets
  if (ticketList) {
    ticketList.addEventListener('click', (e) => {
      const ticket = e.target.closest('.ticket-item')
      if (ticket && window.innerWidth < 768) {
        showTicketModal(ticket)
      }
    })
  }

  // Cerrar modal
  modalClose.addEventListener('click', () => {
    modal.close()
  })

  // Cerrar modal con Escape
  modal.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      modal.close()
    }
  })

  // Cerrar modal al hacer clic en el backdrop
  modal.addEventListener('click', (e) => {
    const modalContent = modal.querySelector('.ticket-modal-content')
    if (e.target === modal && !modalContent.contains(e.target)) {
      modal.close()
    }
  })
})
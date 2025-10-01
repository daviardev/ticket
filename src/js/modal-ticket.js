function openTicketModal(ticketIndex) {
  const tickets = JSON.parse(localStorage.getItem('tickets')) || [];
  const ticket = tickets[ticketIndex];

  const modal = document.getElementById('ticket-detail-modal');
  const modalTicketId = document.getElementById('modal-ticket-id');
  const modalTicketSubject = document.getElementById('modal-ticket-subject');
  const modalTicketBody = document.getElementById('modal-ticket-body');
  const modalPriority = document.getElementById('modal-priority');
  const modalStatus = document.getElementById('modal-status');
  const modalUser = document.getElementById('modal-user');
  const modalCreationDate = document.getElementById('modal-creation-date');
  const modalStatusSelect = document.getElementById('ticket-status-modal');
  const modalResponseText = document.getElementById('response-text-modal');
  const modalSendBtn = document.getElementById('send-btn-modal');
  
  if (modalTicketId) modalTicketId.textContent = `#${ticket.token.toUpperCase()}`;
  if (modalTicketSubject) modalTicketSubject.textContent = ticket.subject;
  if (modalTicketBody) modalTicketBody.textContent = ticket.message;
  if (modalUser) modalUser.textContent = ticket.user || getRandomUser();

  // Update priority badge
  if (modalPriority) {
    modalPriority.textContent = ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1);
    modalPriority.className = `priority-badge ${getPriorityClass(ticket.priority)}`;
  }

  // Update status badge
  if (modalStatus) {
    modalStatus.textContent = ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1);
    modalStatus.className = `status-badge ${getStatusClass(ticket.status)}`;
  }

  // Update status select
  if (modalStatusSelect) {
    modalStatusSelect.value = ticket.status.toLowerCase();
  }

  // Format and update creation date
  if (modalCreationDate) {
    const date = new Date(ticket.createdAt);
    const formattedDate = date.toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).toUpperCase() + ' - ' + date.toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit'
    });
    modalCreationDate.textContent = formattedDate;
  }

  // Load conversation in modal
  loadModalConversationHistory(ticket.token);

  // Store current ticket for responses
  window.currentModalTicketIndex = ticketIndex;
  window.currentModalTicketToken = ticket.token;

  // Show modal
  modal.classList.add('active');
  
  // Add event listener for send button if not already added
  if (modalSendBtn && !modalSendBtn.hasAttribute('data-listener-added')) {
    modalSendBtn.addEventListener('click', handleModalResponse);
    modalSendBtn.setAttribute('data-listener-added', 'true');
  }

  // Handle Enter key in modal textarea
  if (modalResponseText && !modalResponseText.hasAttribute('data-listener-added')) {
    modalResponseText.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleModalResponse();
      }
    });
    modalResponseText.setAttribute('data-listener-added', 'true');
  }

  // Prevent body scroll when modal is open
  document.body.style.overflow = 'hidden';
}

/**
 * Closes the ticket detail modal
 */
function closeTicketModal() {
  const modal = document.getElementById('ticket-detail-modal');
  
  if (modal) {
    modal.classList.remove('active');
    
    // Clear modal response text
    const modalResponseText = document.getElementById('response-text-modal');
    if (modalResponseText) {
      modalResponseText.value = '';
    }
    
    // Clear current ticket references
    window.currentModalTicketIndex = undefined;
    window.currentModalTicketToken = undefined;
    
    // Restore body scroll
    document.body.style.overflow = '';
  }
}

/**
 * Loads conversation history in the modal
 * @param {string} ticketToken - Token of the ticket
 */
function loadModalConversationHistory(ticketToken) {
  const responses = JSON.parse(localStorage.getItem('ticketResponses')) || [];
  const ticketResponses = responses.filter(response => response.ticketToken === ticketToken);
  const responsesContainer = document.getElementById('responses-container-modal');
  
  if (!responsesContainer) return;
  
  // Get current ticket for initial message
  const tickets = JSON.parse(localStorage.getItem('tickets')) || [];
  const currentTicket = tickets.find(ticket => ticket.token === ticketToken);
  
  let conversationHTML = '';
  
  // Add initial user message
  if (currentTicket) {
    const userInitials = getUserInitials(currentTicket.user || getRandomUser());
    const creationDate = new Date(currentTicket.createdAt);
    const formattedTime = creationDate.toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'short'
    }).toUpperCase() + ' ' + creationDate.toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit'
    });
    
    conversationHTML += `
      <div class="response-item user">
        <div class="response-avatar user-avatar">${userInitials}</div>
        <div class="response-content">
          <div class="response-header">
            <span class="response-author">${(currentTicket.user || 'Usuario').toUpperCase()}</span>
            <span class="response-role">USER</span>
            <span class="response-time">${formattedTime}</span>
          </div>
          <div class="response-text">
            Ticket creado - ${currentTicket.subject}
          </div>
        </div>
      </div>
    `;
  }
  
  // Add support responses
  ticketResponses.forEach(response => {
    const responseDate = new Date(response.createdAt);
    const formattedTime = responseDate.toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'short'
    }).toUpperCase() + ' ' + responseDate.toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit'
    });
    
    conversationHTML += `
      <div class="response-item support">
        <div class="response-avatar support-avatar">${response.agent.initials}</div>
        <div class="response-content">
          <div class="response-header">
            <span class="response-author">${response.agent.name.toUpperCase()}</span>
            <span class="response-role support-role">SUPPORT</span>
            <span class="response-time">${formattedTime}</span>
          </div>
          <div class="response-text">
            ${response.message}
          </div>
        </div>
      </div>
    `;
  });
  
  responsesContainer.innerHTML = conversationHTML;
  
  // Scroll to bottom
  responsesContainer.scrollTop = responsesContainer.scrollHeight;
}

/**
 * Handles response submission from modal
 */
function handleModalResponse() {
  const modalResponseText = document.getElementById('response-text-modal');
  const modalStatusSelect = document.getElementById('ticket-status-modal');
  
  if (!modalResponseText || !modalStatusSelect) return;
  
  const message = modalResponseText.value.trim();
  const newStatus = modalStatusSelect.value;
  
  if (!message) {
    if (window.ToastManager) {
      window.ToastManager.validationError('Mensaje de respuesta');
    } else {
      alert('Por favor, escribe un mensaje antes de enviar.');
    }
    return;
  }
  
  if (window.currentModalTicketIndex === undefined || !window.currentModalTicketToken) {
    if (window.ToastManager) {
      window.ToastManager.error('No hay un ticket seleccionado');
    } else {
      alert('No hay un ticket seleccionado.');
    }
    return;
  }
  
  // Use the existing saveResponse function from dialog-ticket.js
  if (typeof window.ticketRenderer?.saveResponse === 'function') {
    window.ticketRenderer.saveResponse(window.currentModalTicketToken, message, newStatus);
  } else {
    // Fallback: manual save
    saveModalResponse(window.currentModalTicketToken, message, newStatus);
  }
  
  // Clear textarea
  modalResponseText.value = '';
  
  // Reload conversation in modal
  loadModalConversationHistory(window.currentModalTicketToken);
  
  // Update the main ticket list if visible
  if (window.ticketRenderer && typeof window.ticketRenderer.renderAllTickets === 'function') {
    window.ticketRenderer.renderAllTickets();
  }
  
  // Trigger dashboard refresh if available
  if (window.dashboardManager && typeof window.dashboardManager.refresh === 'function') {
    setTimeout(() => {
      window.dashboardManager.refresh();
    }, 100);
  }
  
  // Show success toast
  if (window.ToastManager) {
    window.ToastManager.success('Respuesta enviada con éxito', {
      description: `Respuesta agregada al ticket ${window.currentModalTicketToken.toUpperCase()}`
    });
  }
}

/**
 * Fallback function to save response if main saveResponse is not available
 */
function saveModalResponse(ticketToken, message, newStatus = null) {
  const responses = JSON.parse(localStorage.getItem('ticketResponses')) || [];
  
  // Get a random agent (using the same logic as in dialog-ticket.js)
  const supportAgents = [
    { name: 'Ana García', initials: 'AG', department: 'Soporte Técnico' },
    { name: 'Carlos Rodríguez', initials: 'CR', department: 'Soporte General' },
    { name: 'María López', initials: 'ML', department: 'Facturación' },
    { name: 'Juan Pérez', initials: 'JP', department: 'Soporte Técnico' },
    { name: 'Luis Martínez', initials: 'LM', department: 'Ventas' },
    { name: 'Sofia Hernández', initials: 'SH', department: 'Soporte General' }
  ];
  
  const agent = supportAgents[Math.floor(Math.random() * supportAgents.length)];
  
  const response = {
    id: Date.now(),
    ticketToken,
    message,
    agent,
    createdAt: new Date().toISOString()
  };
  
  responses.push(response);
  localStorage.setItem('ticketResponses', JSON.stringify(responses));
  
  // Update ticket status if provided
  if (newStatus) {
    updateModalTicketStatus(ticketToken, newStatus);
  }
}

/**
 * Updates ticket status from modal
 */
function updateModalTicketStatus(ticketToken, newStatus) {
  const tickets = JSON.parse(localStorage.getItem('tickets')) || [];
  const ticketIndex = tickets.findIndex(ticket => ticket.token === ticketToken);
  
  if (ticketIndex !== -1) {
    tickets[ticketIndex].status = newStatus;
    tickets[ticketIndex].updatedAt = new Date().toISOString();
    localStorage.setItem('tickets', JSON.stringify(tickets));
    
    // Update status badge in modal
    const modalStatus = document.getElementById('modal-status');
    if (modalStatus) {
      modalStatus.textContent = newStatus.charAt(0).toUpperCase() + newStatus.slice(1);
      modalStatus.className = `status-badge ${getStatusClass(newStatus)}`;
    }
    
    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('ticketUpdated', { 
      detail: { token: ticketToken, status: newStatus } 
    }));
  }
}

/**
 * Utility functions (duplicated from dialog-ticket.js to ensure independence)
 */
function getRandomUser() {
  const users = [
    'M.Garcia', 'J.Rodriguez', 'A.Martinez', 'C.Lopez', 'L.Hernandez',
    'D.Gonzalez', 'S.Perez', 'R.Sanchez', 'N.Ramirez', 'F.Torres'
  ];
  return users[Math.floor(Math.random() * users.length)];
}

function getUserInitials(userName) {
  return userName.split('.').map(name => name.charAt(0)).join('').toUpperCase();
}

function getPriorityClass(priority) {
  const priorityMap = {
    'alta': 'priority-high',
    'media': 'priority-medium', 
    'baja': 'priority-low'
  };
  return priorityMap[priority.toLowerCase()] || 'priority-medium';
}

function getStatusClass(status) {
  const statusMap = {
    'nuevo': 'status-new',
    'abierto': 'status-open',
    'pendiente': 'status-pending',
    'resuelto': 'status-resolved'
  };
  return statusMap[status.toLowerCase()] || 'status-new';
}

/**
 * Initialize modal functionality
 */
function initializeTicketModal() {
  // Add close modal event listeners
  const closeButtons = document.querySelectorAll('[onclick="closeTicketModal()"]');
  closeButtons.forEach(button => {
    button.addEventListener('click', closeTicketModal);
  });

  // Close modal when clicking outside
  const modal = document.getElementById('ticket-detail-modal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeTicketModal();
      }
    });
  }

  // Close modal with Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const modal = document.getElementById('ticket-detail-modal');
      if (modal && modal.classList.contains('active')) {
        closeTicketModal();
      }
    }
  });

  // Handle window resize - close modal if switched to desktop
  window.addEventListener('resize', () => {
    const modal = document.getElementById('ticket-detail-modal');
    if (modal && modal.classList.contains('active') && window.innerWidth > 768) {
      closeTicketModal();
      // Re-trigger desktop panel if a ticket was selected
      if (window.currentModalTicketIndex !== undefined) {
        if (window.ticketRenderer && typeof window.ticketRenderer.loadTicketDetails === 'function') {
          window.ticketRenderer.loadTicketDetails(window.currentModalTicketIndex);
        }
      }
    }
  });
}

// Make functions globally available
window.openTicketModal = openTicketModal;
window.closeTicketModal = closeTicketModal;
window.loadModalConversationHistory = loadModalConversationHistory;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeTicketModal);

// Export for module use
export { 
  openTicketModal, 
  closeTicketModal, 
  loadModalConversationHistory,
  initializeTicketModal 
};
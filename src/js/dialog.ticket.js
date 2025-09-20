// Utility functions for ticket rendering
const users = [
  'M.Garcia', 'J.Rodriguez', 'A.Martinez', 'C.Lopez', 'L.Hernandez',
  'D.Gonzalez', 'S.Perez', 'R.Sanchez', 'N.Ramirez', 'F.Torres'
];

function getRandomUser() {
  return users[Math.floor(Math.random() * users.length)];
}

function truncateText(text, maxLength = 80) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now - date) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Ahora';
  if (diffInMinutes < 60) return `${diffInMinutes} min`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} h`;
  return `${Math.floor(diffInMinutes / 1440)} días`;
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

function createTicketCard(ticket) {
  // Generate random user if not exists
  const user = ticket.user || getRandomUser();
  const timeAgo = formatDate(ticket.updatedAt || ticket.createdAt);
  const truncatedMessage = truncateText(ticket.message);
  
  return `
    <div class="ticket-item" data-ticket="${ticket.token}">
      <div class="ticket-header">
        <span class="ticket-id">#${ticket.token.toUpperCase()}</span>
        <div style="display: flex; gap: 4px">
          <span class="priority-badge ${getPriorityClass(ticket.priority)}">
            ${ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
          </span>
          <span class="status-badge ${getStatusClass(ticket.status)}">
            ${ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
          </span>
        </div>
      </div>
      <div class="ticket-title">
        ${ticket.subject}
      </div>
      <div class="ticket-description">
        ${truncatedMessage}
      </div>
      <div class="ticket-meta">
        <span>Usuario - ${user}</span>
        <span>${timeAgo}</span>
      </div>
    </div>
  `;
}

function getTicketsByStatus(tickets, status) {
  return tickets.filter(ticket => ticket.status.toLowerCase() === status.toLowerCase());
}

function renderTicketSection(tickets, sectionTitle, status) {
  const filteredTickets = getTicketsByStatus(tickets, status);
  
  if (filteredTickets.length === 0) return '';
  
  return `
    <div class="ticket-section">
      <div class="section-header">
        <span>${sectionTitle}</span>
        <span class="section-count">${filteredTickets.length}</span>
      </div>
      ${filteredTickets.map(ticket => createTicketCard(ticket)).join('')}
    </div>
  `;
}

function renderAllTickets() {
  const tickets = JSON.parse(localStorage.getItem('tickets')) || [];
  const ticketListContainer = document.querySelector('.ticket-list');
  
  if (!ticketListContainer) return;
  
  if (tickets.length === 0) {
    ticketListContainer.innerHTML = `
      <div class="no-tickets">
        <p>No hay tickets disponibles</p>
        <small>Crea tu primer ticket usando el botón "Abre tu Ticket"</small>
      </div>
    `;
    // Show no ticket selected state in right panel
    showNoTicketSelected();
    return;
  }
  
  // Render sections by status
  let sectionsHTML = '';
  
  sectionsHTML += renderTicketSection(tickets, 'Nuevo', 'nuevo');
  sectionsHTML += renderTicketSection(tickets, 'Abierto', 'abierto'); 
  sectionsHTML += renderTicketSection(tickets, 'En progreso', 'pendiente');
  sectionsHTML += renderTicketSection(tickets, 'Resuelto', 'resuelto');
  
  ticketListContainer.innerHTML = sectionsHTML;
  
  // Add click listeners to ticket items
  addTicketClickListeners();
  
  // Show no ticket selected state in right panel by default
  showNoTicketSelected();
}

function addTicketClickListeners() {
  const ticketItems = document.querySelectorAll('.ticket-item');
  
  ticketItems.forEach((item) => {
    item.addEventListener('click', () => {
      // Remove active class from all items
      ticketItems.forEach(ti => ti.classList.remove('active'));
      // Add active class to clicked item
      item.classList.add('active');
      
      // Find the actual ticket index in localStorage
      const tickets = JSON.parse(localStorage.getItem('tickets')) || [];
      const ticketToken = item.querySelector('.ticket-id').textContent.replace('#', '').toLowerCase();
      const actualIndex = tickets.findIndex(ticket => ticket.token === ticketToken);
      
      if (actualIndex !== -1) {
        loadTicketDetails(actualIndex);
      }
    });
  });
}

function showNoTicketSelected() {
  const noTicketPanel = document.querySelector('.no-ticket-selected');
  const ticketDetailPanel = document.querySelector('.ticket-detail-panel');
  
  if (noTicketPanel) noTicketPanel.style.display = 'flex';
  if (ticketDetailPanel) ticketDetailPanel.style.display = 'none';
  
  // Clear current ticket index
  window.currentTicketIndex = undefined;
}

function loadTicketDetails(ticketIndex) {
  const tickets = JSON.parse(localStorage.getItem('tickets')) || [];
  const ticket = tickets[ticketIndex];
  
  if (!ticket) return;
  
  // Show ticket detail panel and hide no-ticket-selected state
  const noTicketPanel = document.querySelector('.no-ticket-selected');
  const ticketDetailPanel = document.querySelector('.ticket-detail-panel');
  
  if (noTicketPanel) noTicketPanel.style.display = 'none';
  if (ticketDetailPanel) ticketDetailPanel.style.display = 'block';
  
  // Update ticket detail panel
  const ticketIdElement = document.getElementById('current-ticket-id');
  const titleElement = document.getElementById('current-ticket-title');
  const bodyElement = document.getElementById('ticket-body');
  const priorityElement = document.getElementById('current-priority');
  const statusElement = document.getElementById('current-status');
  const userElement = document.getElementById('current-user');
  const creationDateElement = document.getElementById('creation-date');
  const statusSelect = document.getElementById('ticket-status');
  
  if (ticketIdElement) ticketIdElement.textContent = `#${ticket.token.toUpperCase()}`;
  if (titleElement) titleElement.textContent = ticket.subject;
  if (bodyElement) bodyElement.textContent = ticket.message;
  if (userElement) userElement.textContent = ticket.user;
  
  // Update priority badge
  if (priorityElement) {
    priorityElement.textContent = ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1);
    priorityElement.className = `priority-badge ${getPriorityClass(ticket.priority)}`;
  }
  
  // Update status badge
  if (statusElement) {
    statusElement.textContent = ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1);
    statusElement.className = `status-badge ${getStatusClass(ticket.status)}`;
  }
  
  // Update status select
  if (statusSelect) {
    statusSelect.value = ticket.status.toLowerCase();
  }
  
  // Format and update creation date
  if (creationDateElement) {
    const date = new Date(ticket.createdAt);
    const formattedDate = date.toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).toUpperCase() + ' - ' + date.toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit'
    });
    creationDateElement.textContent = formattedDate;
  }
  
  // Load conversation history
  loadConversationHistory(ticket.token);
  
  // Store current ticket index for responses
  window.currentTicketIndex = ticketIndex;
}

// Support agents names
const supportAgents = [
  { name: 'Ana García', initials: 'AG', department: 'Soporte Técnico' },
  { name: 'Carlos Rodríguez', initials: 'CR', department: 'Soporte General' },
  { name: 'María López', initials: 'ML', department: 'Facturación' },
  { name: 'Juan Pérez', initials: 'JP', department: 'Soporte Técnico' },
  { name: 'Luis Martínez', initials: 'LM', department: 'Ventas' },
  { name: 'Sofia Hernández', initials: 'SH', department: 'Soporte General' }
];

function getRandomAgent() {
  return supportAgents[Math.floor(Math.random() * supportAgents.length)];
}

function getUserInitials(userName) {
  return userName.split('.').map(name => name.charAt(0)).join('').toUpperCase();
}

function loadConversationHistory(ticketToken) {
  const responses = JSON.parse(localStorage.getItem('ticketResponses')) || [];
  const ticketResponses = responses.filter(response => response.ticketToken === ticketToken);
  const responsesContainer = document.getElementById('responses-container');
  
  if (!responsesContainer) return;
  
  // Get current ticket for initial message
  const tickets = JSON.parse(localStorage.getItem('tickets')) || [];
  const currentTicket = tickets.find(ticket => ticket.token === ticketToken);
  
  let conversationHTML = '';
  
  // Add initial user message
  if (currentTicket) {
    const userInitials = getUserInitials(currentTicket.user);
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
            <span class="response-author">${currentTicket.user.toUpperCase()}</span>
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

function saveResponse(ticketToken, message, newStatus = null) {
  const responses = JSON.parse(localStorage.getItem('ticketResponses')) || [];
  const agent = getRandomAgent();
  
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
    updateTicketStatus(ticketToken, newStatus);
  }
  
  // Reload conversation
  loadConversationHistory(ticketToken);
  
  // Update ticket list to reflect status change
  if (window.ticketRenderer && typeof window.ticketRenderer.renderAllTickets === 'function') {
    window.ticketRenderer.renderAllTickets();
  }
  
  // Trigger dashboard refresh if available
  if (window.dashboardManager && typeof window.dashboardManager.refresh === 'function') {
    setTimeout(() => {
      window.dashboardManager.refresh();
    }, 100);
  }
}

function updateTicketStatus(ticketToken, newStatus) {
  const tickets = JSON.parse(localStorage.getItem('tickets')) || [];
  const ticketIndex = tickets.findIndex(ticket => ticket.token === ticketToken);
  
  if (ticketIndex !== -1) {
    tickets[ticketIndex].status = newStatus;
    tickets[ticketIndex].updatedAt = new Date().toISOString();
    localStorage.setItem('tickets', JSON.stringify(tickets));
    
    // Update status badge in detail panel
    const statusElement = document.getElementById('current-status');
    if (statusElement) {
      statusElement.textContent = newStatus.charAt(0).toUpperCase() + newStatus.slice(1);
      statusElement.className = `status-badge ${getStatusClass(newStatus)}`;
    }
    
    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('ticketUpdated', { 
      detail: { token: ticketToken, status: newStatus } 
    }));
  }
}

// Initialize response form functionality
function initializeResponseForm() {
  const sendButton = document.querySelector('.send-btn');
  const responseTextarea = document.getElementById('response-text');
  const statusSelect = document.getElementById('ticket-status');
  
  if (sendButton) {
    sendButton.addEventListener('click', () => {
      const message = responseTextarea.value.trim();
      const newStatus = statusSelect.value;
      
      if (!message) {
        alert('Por favor, escribe un mensaje antes de enviar.');
        return;
      }
      
      if (window.currentTicketIndex === undefined) {
        alert('No hay un ticket seleccionado.');
        return;
      }
      
      const tickets = JSON.parse(localStorage.getItem('tickets')) || [];
      const currentTicket = tickets[window.currentTicketIndex];
      
      if (!currentTicket) {
        alert('Error: No se pudo encontrar el ticket.');
        return;
      }
      
      // Save response
      saveResponse(currentTicket.token, message, newStatus);
      
      // Clear textarea
      responseTextarea.value = '';
      
    });
  }
  
  // Handle Enter key in textarea (Shift+Enter for new line, Enter to send)
  if (responseTextarea) {
    responseTextarea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendButton.click();
      }
    });
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  renderAllTickets();
  initializeResponseForm();
});

// Listen for storage changes to re-render when new tickets are added
window.addEventListener('storage', (e) => {
  if (e.key === 'tickets') {
    renderAllTickets();
  }
});

// Export functions for use in other modules
window.ticketRenderer = {
  renderAllTickets,
  createTicketCard,
  getRandomUser,
  formatDate,
  loadTicketDetails,
  loadConversationHistory,
  saveResponse,
  updateTicketStatus,
  showNoTicketSelected
};
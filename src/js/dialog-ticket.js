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
    showNoTicketSelected();
    return;
  }
  
  let sectionsHTML = '';
  
  sectionsHTML += renderTicketSection(tickets, 'Nuevo', 'nuevo');
  sectionsHTML += renderTicketSection(tickets, 'Abierto', 'abierto'); 
  sectionsHTML += renderTicketSection(tickets, 'En progreso', 'pendiente');
  sectionsHTML += renderTicketSection(tickets, 'Resuelto', 'resuelto');
  
  ticketListContainer.innerHTML = sectionsHTML;
  
  addTicketClickListeners();
  showNoTicketSelected();
}

function addTicketClickListeners() {
  const ticketItems = document.querySelectorAll('.ticket-item');
  
  ticketItems.forEach((item) => {
    item.addEventListener('click', () => {
      ticketItems.forEach(ti => ti.classList.remove('active'));
      item.classList.add('active');
      
      const tickets = JSON.parse(localStorage.getItem('tickets')) || [];
      const ticketToken = item.querySelector('.ticket-id').textContent.replace('#', '').toLowerCase();
      const actualIndex = tickets.findIndex(ticket => ticket.token === ticketToken);
      
      if (actualIndex !== -1) {
        const isMobile = window.innerWidth <= 768;
        
        if (isMobile && typeof window.openTicketModal === 'function') {
          window.openTicketModal(actualIndex);
        } else {
          loadTicketDetails(actualIndex);
        }
      }
    });
  });
}

function showNoTicketSelected() {
  const noTicketPanel = document.querySelector('.no-ticket-selected');
  const ticketDetailPanel = document.querySelector('.ticket-detail-panel');
  
  if (noTicketPanel) noTicketPanel.style.display = 'flex';
  if (ticketDetailPanel) ticketDetailPanel.style.display = 'none';
  
  window.currentTicketIndex = undefined;
}

function loadTicketDetails(ticketIndex) {
  const tickets = JSON.parse(localStorage.getItem('tickets')) || [];
  const ticket = tickets[ticketIndex];
  
  if (!ticket) return;
  
  const noTicketPanel = document.querySelector('.no-ticket-selected');
  const ticketDetailPanel = document.querySelector('.ticket-detail-panel');
  
  if (noTicketPanel) noTicketPanel.style.display = 'none';
  if (ticketDetailPanel) ticketDetailPanel.style.display = 'block';
  
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
  
  if (priorityElement) {
    priorityElement.textContent = ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1);
    priorityElement.className = `priority-badge ${getPriorityClass(ticket.priority)}`;
  }
  
  if (statusElement) {
    statusElement.textContent = ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1);
    statusElement.className = `status-badge ${getStatusClass(ticket.status)}`;
  }
  
  if (statusSelect) {
    statusSelect.value = ticket.status.toLowerCase();
  }
  
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
  
  loadConversationHistory(ticket.token);
  
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
  
  const tickets = JSON.parse(localStorage.getItem('tickets')) || [];
  const currentTicket = tickets.find(ticket => ticket.token === ticketToken);
  
  let conversationHTML = '';
  
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
  
  if (newStatus) {
    updateTicketStatus(ticketToken, newStatus);
  }
  
  loadConversationHistory(ticketToken);
  
  if (window.ticketRenderer && typeof window.ticketRenderer.renderAllTickets === 'function') {
    window.ticketRenderer.renderAllTickets();
  }
  
  if (window.dashboardManager && typeof window.dashboardManager.refresh === 'function') {
    setTimeout(() => {
      window.dashboardManager.refresh();
    }, 100);
  }
  
  // Show success toast
  if (window.ToastManager) {
    window.ToastManager.success('Respuesta enviada con éxito', {
      description: `Respuesta agregada al ticket ${ticketToken.toUpperCase()}`
    });
  }
}

function updateTicketStatus(ticketToken, newStatus) {
  const tickets = JSON.parse(localStorage.getItem('tickets')) || [];
  const ticketIndex = tickets.findIndex(ticket => ticket.token === ticketToken);
  
  if (ticketIndex !== -1) {
    tickets[ticketIndex].status = newStatus;
    tickets[ticketIndex].updatedAt = new Date().toISOString();
    localStorage.setItem('tickets', JSON.stringify(tickets));
    
    const statusElement = document.getElementById('current-status');
    if (statusElement) {
      statusElement.textContent = newStatus.charAt(0).toUpperCase() + newStatus.slice(1);
      statusElement.className = `status-badge ${getStatusClass(newStatus)}`;
    }
    
    window.dispatchEvent(new CustomEvent('ticketUpdated', { 
      detail: { token: ticketToken, status: newStatus } 
    }));
  }
}

function initializeResponseForm() {
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('send-btn') && 
        e.target.closest('.ticket-detail-panel')) {
      
      handleDesktopResponse();
    }
  });
  
  document.addEventListener('keydown', (e) => {
    if (e.target.id === 'response-text' && 
        e.key === 'Enter' && 
        !e.shiftKey) {
      
      e.preventDefault();
      handleDesktopResponse();
    }
  });
}

function handleDesktopResponse() {
  const responseTextarea = document.getElementById('response-text');
  const statusSelect = document.getElementById('ticket-status');
  
  const message = responseTextarea.value.trim();
  const newStatus = statusSelect.value;
  
  if (!message) {
    if (window.ToastManager) {
      window.ToastManager.validationError('Mensaje de respuesta');
    } else {
      alert('Por favor, escribe un mensaje antes de enviar.');
    }
    return;
  }
  
  if (window.currentTicketIndex === undefined) {
    if (window.ToastManager) {
      window.ToastManager.error('No hay un ticket seleccionado');
    } else {
      alert('No hay un ticket seleccionado.');
    }
    return;
  }
  
  const tickets = JSON.parse(localStorage.getItem('tickets')) || [];
  const currentTicket = tickets[window.currentTicketIndex];
  
  if (!currentTicket) {
    if (window.ToastManager) {
      window.ToastManager.error('Error al encontrar el ticket', {
        description: 'El ticket no existe o ha sido eliminado'
      });
    } else {
      alert('Error: No se pudo encontrar el ticket.');
    }
    return;
  }
  saveResponse(currentTicket.token, message, newStatus);
  
  responseTextarea.value = '';
}

document.addEventListener('DOMContentLoaded', () => {
  renderAllTickets();
  initializeResponseForm();
});

window.addEventListener('storage', (e) => {
  if (e.key === 'tickets') {
    renderAllTickets();
  }
});

window.ticketRenderer = {
  renderAllTickets,
  createTicketCard,
  getRandomUser,
  formatDate,
  loadTicketDetails,
  loadConversationHistory,
  saveResponse,
  updateTicketStatus,
  showNoTicketSelected,
};
const form = document.getElementById('fallback-form');

const subjectInput = form.querySelector('#fallback-subject');
const messageTextarea = form.querySelector('#fallback-message');
const departamentSelect = form.querySelector('#fallback-department');
const agentSelect = form.querySelector('#fallback-agent');
const prioritySelect = form.querySelector('#fallback-priority');

function getNextTicketNumber() {
  const tickets = JSON.parse(localStorage.getItem('tickets')) || [];
  if (tickets.length === 0) return 1;
  
  const lastTicket = tickets[tickets.length - 1];
  const lastNumber = parseInt(lastTicket.token.split('-')[1]);
  return lastNumber + 1;
}

function generateTicketToken() {
  const nextNumber = getNextTicketNumber();
  return `tk-${nextNumber.toString().padStart(4, '0')}`;
}

function saveTicket(ticketData) {
  const tickets = JSON.parse(localStorage.getItem('tickets')) || [];
  tickets.push(ticketData);
  localStorage.setItem('tickets', JSON.stringify(tickets));
  
  // Trigger re-render if the renderer is available
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

form.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const subject = subjectInput.value.trim();
  const message = messageTextarea.value.trim();
  const department = departamentSelect.value;
  const agent = agentSelect.value;
  const priority = prioritySelect.value;

  if (!subject || !message || !priority) {
    alert('Por favor, complete todos los campos obligatorios.');
    return;
  }

  const token = generateTicketToken();
  const date = new Date().toISOString();

  // Generate random user
  const users = [
    'M.Garcia', 'J.Rodriguez', 'A.Martinez', 'C.Lopez', 'L.Hernandez',
    'D.Gonzalez', 'S.Perez', 'R.Sanchez', 'N.Ramirez', 'F.Torres'
  ];
  const randomUser = users[Math.floor(Math.random() * users.length)];

  const ticketData = {
    token,
    subject,
    message,
    department: department || 'Sin asignar',
    agent: agent || 'Sin asignar',
    priority,
    status: 'nuevo',
    user: randomUser,
    createdAt: date,
    updatedAt: date
  };

  saveTicket(ticketData);
  
  alert(`Ticket creado con éxito. Número de ticket: ${token.toUpperCase()}`);
  form.reset();
  
  // Close dialog
  const ticketDialog = document.getElementById('send-ticket-modal');
  if (ticketDialog) {
    ticketDialog.close();
  }
});
/**
 * ==================================================
 * FORMULARIO DE CREACIÓN DE TICKETS
 * ==================================================
 * Este archivo maneja el formulario para crear
 * nuevos tickets de soporte técnico
 * ==================================================
 */

// Obtener el formulario y todos sus campos
const form = document.getElementById('fallback-form');

const subjectInput = form.querySelector('#fallback-subject');        // Campo: Asunto
const messageTextarea = form.querySelector('#fallback-message');     // Campo: Mensaje
const departamentSelect = form.querySelector('#fallback-department'); // Campo: Departamento
const agentSelect = form.querySelector('#fallback-agent');           // Campo: Agente
const prioritySelect = form.querySelector('#fallback-priority');     // Campo: Prioridad

/**
 * Obtiene el siguiente número de ticket disponible
 * @returns {number} - Próximo número de ticket
 */
function getNextTicketNumber() {
  const tickets = JSON.parse(localStorage.getItem('tickets')) || [];
  if (tickets.length === 0) return 1;
  
  const lastTicket = tickets[tickets.length - 1];
  const lastNumber = parseInt(lastTicket.token.split('-')[1]);
  return lastNumber + 1;
}

/**
 * Genera un token único para el ticket (ej: tk-0001)
 * @returns {string} - Token del ticket
 */
function generateTicketToken() {
  const nextNumber = getNextTicketNumber();
  return `tk-${nextNumber.toString().padStart(4, '0')}`;
}

/**
 * Guarda el ticket en localStorage y actualiza la interfaz
 * @param {object} ticketData - Datos del ticket a guardar
 */
function saveTicket(ticketData) {
  // Obtener tickets existentes y agregar el nuevo
  const tickets = JSON.parse(localStorage.getItem('tickets')) || [];
  tickets.push(ticketData);
  localStorage.setItem('tickets', JSON.stringify(tickets));
  
  // Actualizar la lista de tickets si está disponible
  if (window.ticketRenderer && typeof window.ticketRenderer.renderAllTickets === 'function') {
    window.ticketRenderer.renderAllTickets();
  }
  
  // Actualizar el dashboard si está disponible
  if (window.dashboardManager && typeof window.dashboardManager.refresh === 'function') {
    setTimeout(() => {
      window.dashboardManager.refresh();
    }, 100);
  }
}

/**
 * Evento que se ejecuta cuando se envía el formulario
 */

form.addEventListener('submit', (e) => {
  e.preventDefault();  // Evitar que se recargue la página
  
  // Obtener valores de todos los campos del formulario
  const subject = subjectInput.value.trim();       // Asunto del ticket
  const message = messageTextarea.value.trim();    // Mensaje/descripción
  const department = departamentSelect.value;      // Departamento seleccionado
  const agent = agentSelect.value;                 // Agente asignado
  const priority = prioritySelect.value;           // Prioridad del ticket

  // Validar que los campos obligatorios estén llenos
  if (!subject || !message || !priority) {
    // Mostrar error específico según el campo faltante
    if (window.mostrarErrorValidacion) {
      if (!subject) {
        window.mostrarErrorValidacion('Asunto');
      } else if (!message) {
        window.mostrarErrorValidacion('Mensaje');
      } else if (!priority) {
        window.mostrarErrorValidacion('Prioridad');
      }
    } else {
      alert('Por favor, complete todos los campos obligatorios.');
    }
    return;  // Salir sin crear el ticket
  }

  // Generar datos para el nuevo ticket
  const token = generateTicketToken();          // Generar ID único
  const date = new Date().toISOString();       // Fecha actual

  // Lista de usuarios aleatorios para asignar al ticket
  const users = [
    'M.Garcia', 'J.Rodriguez', 'A.Martinez', 'C.Lopez', 'L.Hernandez',
    'D.Gonzalez', 'S.Perez', 'R.Sanchez', 'N.Ramirez', 'F.Torres'
  ];
  const randomUser = users[Math.floor(Math.random() * users.length)];

  // Crear objeto con todos los datos del ticket
  const ticketData = {
    token,                                      // ID único del ticket
    subject,                                    // Asunto
    message,                                    // Descripción del problema
    department: department || 'Sin asignar',   // Departamento (o sin asignar)
    agent: agent || 'Sin asignar',             // Agente (o sin asignar)
    priority,                                   // Prioridad seleccionada
    status: 'nuevo',                           // Estado inicial: nuevo
    user: randomUser,                          // Usuario asignado aleatoriamente
    createdAt: date,                           // Fecha de creación
    updatedAt: date                            // Fecha de última actualización
  };

  // Guardar el ticket
  saveTicket(ticketData);
  
  // Mostrar mensaje de éxito
  if (window.mostrarTicketCreado) {
    window.mostrarTicketCreado(token);
  } else {
    alert(`Ticket creado con éxito. Número de ticket: ${token.toUpperCase()}`);
  }
  
  // Limpiar el formulario para el próximo ticket
  form.reset();
  
  // Cerrar el modal/diálogo si está abierto
  const ticketDialog = document.getElementById('send-ticket-modal');
  if (ticketDialog) {
    ticketDialog.close();
  }
});
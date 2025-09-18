const form = document.getElementById('ticket-form')
const fallbackForm = document.getElementById('fallback-form')

const messageInput = document.getElementById('message')
const submitButton = document.getElementById('btn-send')

// Fallback form elements
const fallbackSubject = document.getElementById('fallback-subject')
const fallbackMessage = document.getElementById('fallback-message')
const fallbackDepartment = document.getElementById('fallback-department')
const fallbackAgent = document.getElementById('fallback-agent')
const fallbackPriority = document.getElementById('fallback-priority')
const fallbackSubmitButton = document.getElementById('fallback-btn-send')
const fallbackClearButton = document.getElementById('fallback-btn-clear')

// create loader element once and reuse (uses user's animation SVG)
const loaderEl = document.createElement('div')
loaderEl.className = 'loader'
loaderEl.innerHTML = `
  <svg viewBox="0 0 80 80">
    <circle r="32" cy="40" cx="40" id="test"></circle>
  </svg>
`

function showLoader() {
  if (!submitButton) return
  submitButton.setAttribute('aria-busy', 'true')
  submitButton.disabled = true
  // hide original text but keep for accessibility
  submitButton.dataset.origText = submitButton.innerHTML
  submitButton.innerHTML = ''
  // append a clone so the original element can be reused later
  submitButton.appendChild(loaderEl.cloneNode(true))
}

function hideLoader() {
  if (!submitButton) return
  submitButton.removeAttribute('aria-busy')
  submitButton.disabled = false
  // restore original content
  if (submitButton.dataset.origText) {
    submitButton.innerHTML = submitButton.dataset.origText
    delete submitButton.dataset.origText
  }
}

form.addEventListener('submit', async (e) => {
  e.preventDefault()

  const message = messageInput.value

  showLoader()

  try {
    const res = await fetch('http://localhost:3000/post', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    })

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`)
    }

    const data = await res.json()

    // Check if AI response is available and valid
    if (!data || !data.success) {
      throw new Error('AI not available or invalid response')
    }

    // also log the result in console as the user requested
    console.log('Send result:', data)
    
    // Clear form and close dialog on success
    messageInput.value = ''
    const mainDialog = document.getElementById('send-ticket-modal')
    if (mainDialog) {
      mainDialog.close()
    }
    
  } catch (err) {
    console.error('Send error:', err)
    // Show fallback dialog when AI fails
    showFallbackDialog(message)
  } finally {
    hideLoader()
  }
})

// Function to show fallback dialog
function showFallbackDialog(originalMessage) {
  // Close the main dialog
  const mainDialog = document.getElementById('send-ticket-modal')
  if (mainDialog) {
    mainDialog.close()
  }
  
  // Pre-fill the message in fallback form
  fallbackMessage.value = originalMessage
  
  // Open fallback dialog
  const fallbackDialog = document.getElementById('fallback-ticket-modal')
  if (fallbackDialog) {
    fallbackDialog.showModal()
  }
}

// Function to create ticket data object
function createTicketData() {
  const now = new Date()
  return {
    asunto: fallbackSubject.value,
    mensaje: fallbackMessage.value,
    prioridad: fallbackPriority.value,
    departamento: fallbackDepartment.value || 'No especificado',
    agente: fallbackAgent.value || 'Asignación automática',
    fechaCreacion: now.toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }
}

// Fallback form event listener
fallbackForm.addEventListener('submit', async (e) => {
  e.preventDefault()

  // Validate required fields
  if (!fallbackSubject.value.trim() || !fallbackMessage.value.trim() || !fallbackPriority.value) {
    alert('Por favor, completa todos los campos obligatorios (Asunto, Mensaje y Prioridad)')
    return
  }

  const ticketData = createTicketData()

  // Log both forms data to console as requested
  console.log('=== INFORMACIÓN DEL TICKET ===')
  console.log('Asunto:', ticketData.asunto)
  console.log('Mensaje:', ticketData.mensaje)
  console.log('Prioridad:', ticketData.prioridad)
  console.log('Departamento:', ticketData.departamento)
  console.log('Agente:', ticketData.agente)
  console.log('Fecha de creación:', ticketData.fechaCreacion)
  console.log('================================')

  // Here you would normally send the data to your backend
  // For now, we'll just show success message
  alert('Ticket creado exitosamente. Revisa la consola para ver los detalles.')

  // Clear form and close dialog
  fallbackForm.reset()
  const fallbackDialog = document.getElementById('fallback-ticket-modal')
  if (fallbackDialog) {
    fallbackDialog.close()
  }
})

// Clear button for fallback form
fallbackClearButton.addEventListener('click', () => {
  fallbackForm.reset()
})

// Clear button for main form
const clearButton = document.getElementById('btn-clear')
if (clearButton) {
  clearButton.addEventListener('click', () => {
    messageInput.value = ''
    const attachInput = document.getElementById('attach-input')
    if (attachInput) {
      attachInput.value = ''
    }
  })
}

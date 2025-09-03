const form = document.getElementById('ticket-form')

const messageInput = document.getElementById('message')
const submitButton = document.getElementById('btn-send')

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

    const data = await res.json()

    // also log the result in console as the user requested
    console.log('Send result:', data)
  } catch (err) {
    console.error('Send error:', err)
  } finally {
    hideLoader()
  }
})

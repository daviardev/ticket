const MAX_IMAGE_KB = 500

function $(sel, ctx = document) {
  return ctx.querySelector(sel)
}

function bytesToKB(bytes) {
  return bytes / 1024
}

function showError(el, msg) {
  el.setAttribute('aria-invalid', 'true')
  el.classList.add('invalid')
  const hint = el.parentElement.querySelector('.hint')
  if (hint) hint.textContent = msg
}

function clearError(el) {
  el.removeAttribute('aria-invalid')
  el.classList.remove('invalid')
  const hint = el.parentElement.querySelector('.hint')
  if (hint) hint.textContent = ''
}

function initForm() {
  const form = $('#ticket-form')
  if (!form) return

  const subject = $('#subject', form)
  const message = $('#message', form)
  const attach = $('#attach-input', form)
  const btnClear = $('#btn-clear', form)

  attach.addEventListener('change', () => {
    const file = attach.files && attach.files[0]
    if (!file) return
    const sizeKB = bytesToKB(file.size)
    if (sizeKB > MAX_IMAGE_KB) {
      showError(
        attach,
        `La imagen pesa ${Math.round(sizeKB)} KB, debe ser menor a ${MAX_IMAGE_KB} KB`
      )
      attach.value = ''
      return
    }
    clearError(attach)
    // show preview filename + thumbnail
    const field = attach.parentElement.parentElement
    const hint = field.querySelector('.hint')
    if (hint)
      hint.textContent = `Archivo listo: ${file.name} (${Math.round(sizeKB)} KB)`
    // create small preview
    let preview = field.querySelector('.img-preview')
    if (!preview) {
      preview = document.createElement('img')
      preview.className = 'img-preview'
      preview.alt = 'preview'
      preview.style.maxWidth = '64px'
      preview.style.maxHeight = '64px'
      preview.style.borderRadius = '6px'
      preview.style.marginLeft = '0.6rem'
      hint.parentElement.appendChild(preview)
    }
    const reader = new FileReader()
    reader.onload = (ev) => {
      preview.src = ev.target.result
    }
    reader.readAsDataURL(file)
  })

  btnClear.addEventListener('click', () => {
    subject.value = ''
    message.value = ''
    attach.value = ''
    const hints = form.querySelectorAll('.hint')
    hints.forEach((h) => (h.textContent = ''))
    ;[subject, message, attach].forEach(clearError)
    const prev = form.querySelectorAll('.img-preview')
    prev.forEach((p) => p.remove())
  })

  form.addEventListener('submit', (e) => {
    e.preventDefault()
    // simple validation
    let ok = true
    ;[subject, message].forEach((el) => {
      if (!el.value.trim()) {
        showError(el, 'Campo requerido')
        ok = false
      } else {
        clearError(el)
      }
    })

    const file = attach.files && attach.files[0]
    if (file) {
      const sizeKB = bytesToKB(file.size)
      if (sizeKB > MAX_IMAGE_KB) {
        showError(
          attach,
          `La imagen pesa ${Math.round(sizeKB)} KB, debe ser menor a ${MAX_IMAGE_KB} KB`
        )
        ok = false
      }
    }

    if (!ok) return

    // Simulate send
    const payload = new FormData()
    payload.append('subject', subject.value.trim())
    payload.append('message', message.value.trim())
    if (file) payload.append('attachment', file)

    // Minimal UI feedback
    const btnSend = $('#btn-send', form)
    btnSend.disabled = true
    btnSend.textContent = 'Enviando...'

    setTimeout(() => {
      console.log('Enviado', {
        subject: subject.value,
        message: message.value,
        file,
      })
      btnSend.disabled = false
      btnSend.textContent = 'Enviar'
      // close dialog if available
      const dlg = document.getElementById('send-ticket-modal')
      if (dlg && typeof dlg.close === 'function') dlg.close()
      // reset form
      btnClear.click()
      // tiny success hint inline
      const feedback = form.querySelector('.form-feedback')
      if (feedback) {
        feedback.textContent =
          'Ticket enviado. Nos pondremos en contacto en menos de 24 horas.'
        feedback.classList.add('success')
        setTimeout(() => {
          feedback.textContent = ''
          feedback.classList.remove('success')
        }, 3500)
      }
    }, 900)
  })
}

if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', initForm)
}

export default initForm

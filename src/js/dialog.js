export async function toggleDialog(id) {
  const viewTransitionClass = 'vt-element-animation'
  const viewTransitionClassClosing = 'vt-element-animation-closing'
  // Helper: check if view transitions are supported
  const supportsVT = typeof document.startViewTransition === 'function'

  // Helper to safely get the currently open dialog or element
  function getOpenDialog() {
    // Some browsers set the dialog `open` property but not the attribute; prefer property check
    const byAttr = document.querySelector('dialog[open]')
    if (byAttr) return byAttr
    const dialogs = Array.from(document.querySelectorAll('dialog'))
    return dialogs.find((d) => d.open) || null
  }

  // If no id -> close any open dialog
  if (!id) {
    const openDialogs = getOpenDialog()
    const originE = document.querySelector('[origin-element]')
    if (!openDialogs) return

    // If view transitions supported, use them, else fallback to CSS animation + close
    if (supportsVT) {
      openDialogs.style.viewTransitionName = 'vt-shared'
      openDialogs.style.viewTransitionClass = viewTransitionClassClosing

      const vt = document.startViewTransition(() => {
        if (originE) {
          originE.style.viewTransitionName = 'vt-shared'
          originE.style.viewTransitionClass = viewTransitionClassClosing
        }
        openDialogs.style.viewTransitionName = ''
        openDialogs.style.viewTransitionClass = ''
        openDialogs.close()
      })

      try {
        await vt.finished
      } catch {
        // ignore
      }

      if (originE) {
        originE.style.viewTransitionName = ''
        originE.style.viewTransitionClass = ''
      }

      return
    }

    // Fallback for browsers without view-transitions (eg. Firefox)
    openDialogs.classList.add('vt-fallback-out')
    // when animation ends, close and cleanup
    let closed = false
    const onEnd = () => {
      if (closed) return
      closed = true
      openDialogs.close()
      openDialogs.classList.remove('vt-fallback-out')
    }
    openDialogs.addEventListener('animationend', onEnd, { once: true })
    // Timeout fallback in case animationend is not fired
    // small buffer above the CSS animation (160ms) so it feels snappy
    setTimeout(() => {
      if (closed) return
      try {
        openDialogs.close()
      } catch {
        openDialogs.removeAttribute('open')
      }
      openDialogs.classList.remove('vt-fallback-out')
    }, 180)

    return
  }

  const dialog = document.getElementById(id)
  if (!dialog) {
    console.warn(`toggledialog: no se encontró dialog con id="${id}"`)
    return
  }

  // Determine origin element more safely: try event.currentTarget, fallback to a data attribute or first .btn
  let originE
  try {
    originE =
      (typeof event !== 'undefined' && event.currentTarget) ||
      document.querySelector('[origin-element]') ||
      document.querySelector('.btn')
  } catch {
    originE = document.querySelector('.btn')
  }

  if (supportsVT) {
    dialog.style.viewTransitionName = 'vt-shared'
    dialog.style.viewTransitionClass = viewTransitionClass

    if (originE) {
      originE.style.viewTransitionName = 'vt-shared'
      originE.style.viewTransitionClass = viewTransitionClass
      originE.setAttribute('origin-element', '')
    }

    const vt = document.startViewTransition(() => {
      if (originE) {
        originE.style.viewTransitionName = ''
        originE.style.viewTransitionClass = ''
      }
      try {
        dialog.showModal()
      } catch {
        // ignore here; below we handle fallback
      }
    })

    try {
      await vt.finished
    } catch {
      // ignore
    }

    dialog.style.viewTransitionClass = ''
    dialog.style.viewTransitionName = ''
  } else {
    // Fallback: ensure dialog is visible before adding animation class to avoid layout jump
    try {
      if (typeof dialog.showModal === 'function') dialog.showModal()
      else dialog.setAttribute('open', '')
    } catch {
      // If showModal throws, fallback to open attribute
      dialog.setAttribute('open', '')
    }

    // Force reflow so the browser registers the dialog's centered layout before animating
    // (prevents "jump" from corner -> center)
    void dialog.offsetHeight

    // Now add the animation class
    dialog.classList.add('vt-fallback-in')

    // remove class after animation completes
    let opened = false
    const onEndOpen = () => {
      if (opened) return
      opened = true
      dialog.classList.remove('vt-fallback-in')
    }
    dialog.addEventListener('animationend', onEndOpen, { once: true })
    setTimeout(() => {
      if (!opened) dialog.classList.remove('vt-fallback-in')
    }, 300)
  }
}

// Hacer accesible a inline onclick (porque tu HTML usa onclick="toggleDialog(...)")
if (typeof window !== 'undefined') {
  window.toggleDialog = toggleDialog
}

export async function toggleDialog(id) {
  const viewTransitionClass = 'vt-element-animation'
  const viewTransitionClassClosing = 'vt-element-animation-closing'

  if (!id) {
    const openDialogs = document.querySelector('dialog[open]')
    const originE = document.querySelector('[origin-element]')

    openDialogs.style.viewTransitionName = 'vt-shared'
    openDialogs.style.viewTransitionClass = viewTransitionClassClosing

    const vt = document.startViewTransition(() => {
      originE.style.viewTransitionName = 'vt-shared'
      originE.style.viewTransitionClass = viewTransitionClassClosing

      openDialogs.style.viewTransitionName = ''
      openDialogs.style.viewTransitionClass = ''

      openDialogs.close()
    })

    await vt.finished

    originE.style.viewTransitionName = ''
    originE.style.viewTransitionClass = ''

    return // Cierra cualquier diálogo abierto si no se pasa id
  }

  const dialog = document.getElementById(id)

  const originE = event.currentTarget

  dialog.style.viewTransitionName = 'vt-shared'
  dialog.style.viewTransitionClass = viewTransitionClass

  originE.style.viewTransitionName = 'vt-shared'
  originE.style.viewTransitionClass = viewTransitionClass
  originE.setAttribute('origin-element', '')

  const vt = document.startViewTransition(() => {
    originE.style.viewTransitionName = ''
    originE.style.viewTransitionClass = ''
    dialog.showModal()
  })

  await vt.finished

  dialog.style.viewTransitionClass = ''
  dialog.style.viewTransitionName = ''

  if (!dialog) {
    console.warn(`toggledialog: no se encontró dialog con id="${id}"`)
    return
  }

  if (typeof dialog.showModal === 'function') {
    try {
      dialog.showModal()
    } catch (err) {
      // En algunos navegadores o estados puede lanzar; fallback seguro:
      console.warn(
        'toggleDialog: showModal falló, usando atributo open como fallback',
        err
      )
      dialog.setAttribute('open', '')
    }
  } else {
    // Fallback si no existe showModal (viejos navegadores)
    dialog.setAttribute('open', '')
  }
}

// Hacer accesible a inline onclick (porque tu HTML usa onclick="toggleDialog(...)")
if (typeof window !== 'undefined') {
  window.toggleDialog = toggleDialog
}

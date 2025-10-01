/**
 * ==================================================
 * SISTEMA DE NOTIFICACIONES (TOASTS) PERSONALIZADO
 * ==================================================
 * Este archivo maneja las notificaciones tipo toast
 * que reemplazan los alerts tradicionales
 * Sistema completamente personalizado en JavaScript puro
 * ==================================================
 */

import '../css/toast.css';

// Variable para controlar si ya se inicializó
let toastInitialized = false;
let toastContainer = null;
let toastCounter = 0;

/**
 * Inicializa el sistema de toasts
 * Crea el contenedor donde aparecerán las notificaciones
 */
function initializeToasts() {
  if (toastInitialized) return;

  // Crear contenedor principal para los toasts
  toastContainer = document.createElement('div');
  toastContainer.id = 'toast-container';
  toastContainer.className = 'toast-container';
  document.body.appendChild(toastContainer);

  toastInitialized = true;
  console.log('🍞 Sistema de toasts personalizado inicializado');
}

/**
 * Crea y muestra un toast en pantalla
 * @param {string} mensaje - Texto a mostrar
 * @param {string} tipo - Tipo de toast (success, error, warning, info)
 * @param {object} opciones - Configuraciones adicionales
 */
function crearToast(mensaje, tipo = 'info', opciones = {}) {
  initializeToasts();

  // Configuración por defecto
  const config = {
    duracion: 4000,
    descripcion: '',
    botonCerrar: true,
    ...opciones
  };

  // Crear elemento del toast
  const toast = document.createElement('div');
  toast.className = `toast toast-${tipo}`;
  toast.id = `toast-${++toastCounter}`;

  // Icono según el tipo
  const iconos = {
    success: '✅',
    error: '❌', 
    warning: '⚠️',
    info: 'ℹ️',
    loading: '⏳'
  };

  // Estructura HTML del toast
  toast.innerHTML = `
    <div class="toast-content">
      <div class="toast-icon">${iconos[tipo] || iconos.info}</div>
      <div class="toast-body">
        <div class="toast-title">${mensaje}</div>
        ${config.descripcion ? `<div class="toast-description">${config.descripcion}</div>` : ''}
      </div>
      ${config.botonCerrar ? '<button class="toast-close" aria-label="Cerrar">×</button>' : ''}
    </div>
  `;

  // Agregar al contenedor
  toastContainer.appendChild(toast);

  // Animar entrada
  setTimeout(() => {
    toast.classList.add('toast-show');
  }, 10);

  // Configurar cierre automático
  if (config.duracion > 0) {
    setTimeout(() => {
      cerrarToast(toast);
    }, config.duracion);
  }

  // Evento para cerrar manualmente
  const botonCerrar = toast.querySelector('.toast-close');
  if (botonCerrar) {
    botonCerrar.addEventListener('click', () => {
      cerrarToast(toast);
    });
  }

  // Cerrar con click en el toast (opcional)
  toast.addEventListener('click', () => {
    cerrarToast(toast);
  });

  return toast;
}

/**
 * Cierra y elimina un toast
 * @param {HTMLElement} toast - Elemento del toast a cerrar
 */
function cerrarToast(toast) {
  if (!toast || !toast.parentNode) return;

  // Animar salida
  toast.classList.add('toast-hide');
  
  // Eliminar después de la animación
  setTimeout(() => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast);
    }
  }, 300);
}

/**
 * Muestra un toast de éxito (verde)
 * @param {string} mensaje - Texto a mostrar
 * @param {object} opciones - Configuraciones adicionales
 */
function mostrarExito(mensaje, opciones = {}) {
  return crearToast(mensaje, 'success', {
    duracion: 3000,
    ...opciones
  });
}

/**
 * Muestra un toast de error (rojo)
 * @param {string} mensaje - Texto a mostrar
 * @param {object} opciones - Configuraciones adicionales
 */
function mostrarError(mensaje, opciones = {}) {
  return crearToast(mensaje, 'error', {
    duracion: 5000,
    ...opciones
  });
}

/**
 * Muestra un toast de advertencia (amarillo)
 * @param {string} mensaje - Texto a mostrar
 * @param {object} opciones - Configuraciones adicionales
 */
function mostrarAdvertencia(mensaje, opciones = {}) {
  return crearToast(mensaje, 'warning', {
    duracion: 4000,
    ...opciones
  });
}

/**
 * Muestra un toast de información (azul)
 * @param {string} mensaje - Texto a mostrar
 * @param {object} opciones - Configuraciones adicionales
 */
function mostrarInfo(mensaje, opciones = {}) {
  return crearToast(mensaje, 'info', {
    duracion: 3000,
    ...opciones
  });
}

/**
 * Muestra un toast de carga (para procesos)
 * @param {string} mensaje - Texto a mostrar
 * @param {object} opciones - Configuraciones adicionales
 */
function mostrarCargando(mensaje, opciones = {}) {
  return crearToast(mensaje, 'loading', {
    duracion: 0, // No se cierra automáticamente
    botonCerrar: false,
    ...opciones
  });
}

/**
 * Muestra un toast específico para cuando se crea un ticket
 * @param {string} numeroTicket - Número del ticket creado
 */
function mostrarTicketCreado(numeroTicket) {
  return mostrarExito(`Ticket ${numeroTicket.toUpperCase()} creado con éxito`, {
    descripcion: 'El ticket ha sido guardado correctamente'
  });
}

/**
 * Muestra un toast específico para errores de validación
 * @param {string} campo - Campo que tiene el error
 */
function mostrarErrorValidacion(campo) {
  return mostrarAdvertencia(`Campo requerido: ${campo}`, {
    descripcion: 'Por favor, complete todos los campos obligatorios'
  });
}

/**
 * Muestra un toast cuando se envía una respuesta
 * @param {string} numeroTicket - Número del ticket
 */
function mostrarRespuestaEnviada(numeroTicket) {
  return mostrarExito('Respuesta enviada con éxito', {
    descripcion: `Respuesta agregada al ticket ${numeroTicket.toUpperCase()}`
  });
}

/**
 * Cierra todos los toasts visibles
 */
function cerrarTodosLosToasts() {
  if (!toastContainer) return;
  
  const toasts = toastContainer.querySelectorAll('.toast');
  toasts.forEach(toast => {
    cerrarToast(toast);
  });
}

// Reemplazar el alert tradicional con toasts inteligentes
const alertOriginal = window.alert;

/**
 * Función que reemplaza el alert() tradicional
 * Detecta automáticamente el tipo de mensaje y muestra el toast apropiado
 * @param {string} mensaje - Mensaje a mostrar
 */
window.alert = function(mensaje) {
  // Si menciona éxito o creación
  if (mensaje.toLowerCase().includes('éxito') || mensaje.toLowerCase().includes('creado')) {
    mostrarExito(mensaje);
  }
  // Si menciona error o problema
  else if (mensaje.toLowerCase().includes('error') || mensaje.toLowerCase().includes('problema')) {
    mostrarError(mensaje);
  }
  // Si menciona validación o campos requeridos
  else if (mensaje.toLowerCase().includes('complete') || mensaje.toLowerCase().includes('obligatorio')) {
    mostrarAdvertencia(mensaje);
  }
  // Por defecto, mostrar como información
  else {
    mostrarInfo(mensaje);
  }
};

// Mantener el alert original disponible por si se necesita
window.alertOriginal = alertOriginal;

// Hacer las funciones disponibles globalmente para otros archivos
window.mostrarExito = mostrarExito;
window.mostrarError = mostrarError;
window.mostrarAdvertencia = mostrarAdvertencia;
window.mostrarInfo = mostrarInfo;
window.mostrarCargando = mostrarCargando;
window.mostrarTicketCreado = mostrarTicketCreado;
window.mostrarErrorValidacion = mostrarErrorValidacion;
window.mostrarRespuestaEnviada = mostrarRespuestaEnviada;
window.cerrarTodosLosToasts = cerrarTodosLosToasts;

// Inicializar automáticamente
initializeToasts();
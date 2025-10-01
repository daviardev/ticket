# 📁 Estructura del Código JavaScript

## 🎯 **Objetivo**
Este documento explica cómo está organizado el código JavaScript para que sea fácil de entender y mantener.

## 📂 **Archivos y sus Funciones**

### **Archivo Principal**
- **`main.js`** - Punto de entrada que importa todos los módulos

### **Módulos de Funcionalidad**

#### **🧭 `sections.js` - Navegación entre Secciones**
- **Qué hace:** Controla el cambio entre Dashboard, Tickets, etc.
- **Funciones principales:**
  - `switchSection()` - Cambia entre secciones
  - Detecta clicks en botones del menú
  - Muestra/oculta contenido según la sección

#### **🎨 `theme.js` - Sistema de Temas**
- **Qué hace:** Maneja el cambio de colores/temas de la aplicación
- **Funciones principales:**
  - Guardar tema seleccionado
  - Aplicar tema al cargar
  - Mostrar/ocultar selector de colores

#### **🪟 `dialog.js` - Sistema de Diálogos**
- **Qué hace:** Controla la apertura/cierre de ventanas modales
- **Funciones principales:**
  - `toggleDialog()` - Abrir/cerrar diálogos
  - Animaciones de transición
  - Cerrar con Escape o click fuera

#### **🎫 `dialog-ticket.js` - Lista de Tickets**
- **Qué hace:** Muestra la lista de todos los tickets
- **Funciones principales:**
  - Renderizar tickets por estado (Nuevo, Abierto, etc.)
  - Manejar clicks en tickets
  - Enviar respuestas a tickets

#### **🔍 `modal-ticket.js` - Detalles de Ticket**
- **Qué hace:** Muestra ventana con detalles completos de un ticket
- **Funciones principales:**
  - Mostrar información del ticket
  - Historial de conversación
  - Cambiar estado del ticket

#### **📊 `dashboard.js` - Panel de Estadísticas**
- **Qué hace:** Muestra gráficos y estadísticas de los tickets
- **Funciones principales:**
  - Gráfico circular de estados
  - Gráfico de tendencias
  - Contadores y porcentajes

#### **📝 `ticket-form.js` - Formulario de Creación**
- **Qué hace:** Maneja el formulario para crear nuevos tickets
- **Funciones principales:**
  - `generateTicketToken()` - Genera ID único
  - `saveTicket()` - Guarda ticket en localStorage
  - Validación de campos obligatorios

#### **🍞 `toasts.js` - Sistema de Notificaciones**
- **Qué hace:** Reemplaza los alerts con notificaciones elegantes
- **Funciones principales:**
  - `mostrarExito()` - Notificación verde
  - `mostrarError()` - Notificación roja
  - `mostrarAdvertencia()` - Notificación amarilla
  - `mostrarInfo()` - Notificación azul

## 🔗 **Cómo se Conectan**

```
main.js
├── sections.js      → Navegación entre páginas
├── theme.js         → Cambio de colores
├── dialog.js        → Ventanas modales
├── dashboard.js     → Gráficos y estadísticas
├── dialog-ticket.js → Lista de tickets
├── modal-ticket.js  → Detalles de tickets
├── ticket-form.js   → Crear nuevos tickets
└── toasts.js        → Notificaciones
```

## 💾 **Almacenamiento de Datos**

### **localStorage**
- **`tickets`** - Array con todos los tickets
- **`ticketResponses`** - Array con respuestas a tickets
- **`ticketdesk-theme`** - Tema seleccionado por el usuario

### **Estructura de un Ticket**
```javascript
{
  token: "tk-0001",           // ID único
  subject: "Problema WiFi",   // Asunto
  message: "No hay conexión", // Descripción
  priority: "alta",           // Prioridad
  status: "nuevo",            // Estado
  user: "M.Garcia",           // Usuario
  createdAt: "2025-09-30",    // Fecha creación
  updatedAt: "2025-09-30"     // Fecha actualización
}
```

## 🎯 **Flujo de Trabajo**

### **Crear un Ticket:**
1. Usuario llena formulario (`ticket-form.js`)
2. Se validan los campos
3. Se genera ID único
4. Se guarda en localStorage
5. Se muestra notificación (`toasts.js`)
6. Se actualiza dashboard (`dashboard.js`)

### **Ver Tickets:**
1. Usuario hace click en "Tickets" (`sections.js`)
2. Se cargan tickets desde localStorage (`dialog-ticket.js`)
3. Se organizan por estado
4. Se muestran en la lista

### **Responder a Ticket:**
1. Usuario hace click en un ticket (`dialog-ticket.js` o `modal-ticket.js`)
2. Se muestra formulario de respuesta
3. Se guarda respuesta en localStorage
4. Se actualiza historial
5. Se muestra notificación de éxito

## 🔧 **Variables Globales Importantes**

- **`window.currentTicketIndex`** - Índice del ticket actual seleccionado
- **`window.dashboardManager`** - Referencia al gestor del dashboard
- **`window.mostrarExito()`** - Función para mostrar notificaciones de éxito

## 📱 **Consideraciones Especiales**

- **Responsive:** Los modales se comportan diferente en móvil vs desktop
- **Temas:** Los colores se adaptan automáticamente al tema seleccionado
- **Persistencia:** Todos los datos se guardan en el navegador
- **Tiempo real:** Las estadísticas se actualizan automáticamente

## 🚀 **Para Agregar Nueva Funcionalidad**

1. **Crear nuevo archivo .js** con comentarios explicativos
2. **Importarlo en `main.js`**
3. **Documentar su función** en este README
4. **Usar las funciones de toasts** para notificaciones
5. **Mantener consistencia** con la estructura existente
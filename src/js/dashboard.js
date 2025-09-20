import * as d3 from 'd3';

// Dashboard data management
class DashboardManager {
  constructor() {
    this.tickets = [];
    this.responses = [];
    this.isInitialized = false;
    this.init();
  }

  init() {
    this.loadData();
    this.renderAllDashboardElements();
    this.setupEventListeners();
    this.isInitialized = true;
  }

  loadData() {
    this.tickets = JSON.parse(localStorage.getItem('tickets')) || [];
    this.responses = JSON.parse(localStorage.getItem('ticketResponses')) || [];
  }

  // Tickets Overview - Donut Chart
  renderTicketsOverview() {
    const container = document.querySelector('.tickets-overview .donut-chart');
    if (!container) return;

    // Clear previous chart
    d3.select(container).select('svg').remove();

    const statusCounts = this.getStatusCounts();
    const total = this.tickets.length;

    // Update total in center
    const centerElement = container.querySelector('.chart-center h2');
    if (centerElement) centerElement.textContent = total.toLocaleString();

    if (total === 0) {
      this.renderEmptyDonutChart(container);
      this.updateLegend(statusCounts);
      return;
    }

    // Chart dimensions
    const width = 200;
    const height = 200;
    const radius = Math.min(width, height) / 2 - 20;
    const innerRadius = radius * 0.6;

    // Color scale
    const colorScale = d3.scaleOrdinal()
      .domain(['nuevo', 'abierto', 'pendiente', 'resuelto'])
      .range(['#ff8800', '#ff4444', '#aa00ff', '#00ff00']);

    // Create SVG
    const svg = d3.select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .style('position', 'absolute')
      .style('top', '0')
      .style('left', '0');

    const g = svg.append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);

    // Prepare data for pie chart
    const pieData = Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
      percentage: (count / total) * 100
    }));

    const pie = d3.pie()
      .value(d => d.count)
      .sort(null);

    const arc = d3.arc()
      .innerRadius(innerRadius)
      .outerRadius(radius);

    // Create arcs
    const arcs = g.selectAll('.arc')
      .data(pie(pieData))
      .enter().append('g')
      .attr('class', 'arc');

    arcs.append('path')
      .attr('d', arc)
      .attr('fill', d => colorScale(d.data.status))
      .attr('stroke', 'var(--grid-color)')
      .attr('stroke-width', 2);

    // Update legend
    this.updateLegend(statusCounts);
  }

  renderEmptyDonutChart(container) {
    const width = 200;
    const height = 200;
    const radius = Math.min(width, height) / 2 - 20;

    const svg = d3.select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .style('position', 'absolute')
      .style('top', '0')
      .style('left', '0');

    const g = svg.append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);

    // Empty circle
    g.append('circle')
      .attr('r', radius)
      .attr('fill', 'none')
      .attr('stroke', 'var(--grid-color)')
      .attr('stroke-width', 20);
  }

  getStatusCounts() {
    return {
      nuevo: this.tickets.filter(t => t.status === 'nuevo').length,
      abierto: this.tickets.filter(t => t.status === 'abierto').length,
      pendiente: this.tickets.filter(t => t.status === 'pendiente').length,
      resuelto: this.tickets.filter(t => t.status === 'resuelto').length
    };
  }

  updateLegend(statusCounts) {
    const legendItems = [
      { status: 'abierto', label: 'Abierto', color: '#ff8800' },
      { status: 'resuelto', label: 'Resuelto', color: 'var(--button-secondary)' },
      { status: 'pendiente', label: 'Pendiente', color: '#ffcc00' },
      { status: 'nuevo', label: 'Nuevo', color: '#999999' }
    ];

    legendItems.forEach(item => {
      const legendElement = document.querySelector(`.chart-legend .legend-item:nth-child(${legendItems.indexOf(item) + 1}) span`);
      if (legendElement) {
        legendElement.textContent = `${item.label} (${statusCounts[item.status] || 0})`;
      }
    });
  }

  // Performance Card - Resolution Percentage
  renderPerformanceCard() {
    const performanceElement = document.querySelector('.performance-card .performance-value');
    if (!performanceElement) return;

    const totalTickets = this.tickets.length;
    const resolvedTickets = this.tickets.filter(t => t.status === 'resuelto').length;
    const percentage = totalTickets > 0 ? Math.round((resolvedTickets / totalTickets) * 100) : 0;

    performanceElement.textContent = `${percentage}%`;
  }

  // New Tickets Count
  renderNewTicketsCount() {
    const newTicketsElement = document.querySelector('.value-change .change-value');
    if (!newTicketsElement) return;

    const openTickets = this.tickets.filter(t => t.status === 'abierto').length;
    newTicketsElement.textContent = `+${openTickets}`;
  }

  // Progress Bars
  renderProgressBars() {
    this.renderResponseTimeProgress();
    this.renderResolutionTimeProgress();
  }

  renderResponseTimeProgress() {
    const progressFill = document.querySelector('.progress-card .progress-item:first-child .progress-fill');
    const progressLabel = document.querySelector('.progress-card .progress-item:first-child .progress-label span:last-child');
    
    if (!progressFill || !progressLabel) return;

    // Calculate response time percentage (tickets with responses)
    const ticketsWithResponses = this.tickets.filter(ticket => 
      this.responses.some(response => response.ticketToken === ticket.token)
    ).length;
    
    const responsePercentage = this.tickets.length > 0 ? 
      Math.round((ticketsWithResponses / this.tickets.length) * 100) : 0;

    progressFill.style.width = `${responsePercentage}%`;
    progressLabel.textContent = `${responsePercentage}%`;
  }

  renderResolutionTimeProgress() {
    const progressFill = document.querySelector('.progress-card .progress-item:last-child .progress-fill');
    const progressLabel = document.querySelector('.progress-card .progress-item:last-child .progress-label span:last-child');
    
    if (!progressFill || !progressLabel) return;

    const resolvedTickets = this.tickets.filter(t => t.status === 'resuelto').length;
    const resolutionPercentage = this.tickets.length > 0 ? 
      Math.round((resolvedTickets / this.tickets.length) * 100) : 0;

    progressFill.style.width = `${resolutionPercentage}%`;
    progressLabel.textContent = `${resolutionPercentage}%`;
  }

  // Trend Chart
  renderTrendChart() {
    const container = document.querySelector('.tickets-development .chart-container');
    if (!container) return;

    // Clear previous chart
    d3.select(container).select('svg').selectAll('*').remove();

    if (this.tickets.length === 0) {
      this.renderEmptyTrendChart(container);
      return;
    }

    // Get tickets data by day for the last 7 days
    const chartData = this.getTrendData();
    
    // Update trend percentage
    this.updateTrendPercentage(chartData);

    const svg = d3.select(container).select('svg');
    const width = container.offsetWidth;
    const height = 80;

    svg.attr('width', width).attr('height', height);

    // Scales
    const xScale = d3.scaleLinear()
      .domain([0, chartData.length - 1])
      .range([20, width - 20]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(chartData, d => d.count) || 1])
      .range([height - 10, 10]);

    // Line generator
    const line = d3.line()
      .x((d, i) => xScale(i))
      .y(d => yScale(d.count))
      .curve(d3.curveMonotoneX);

    // Area generator for gradient
    const area = d3.area()
      .x((d, i) => xScale(i))
      .y0(height - 10)
      .y1(d => yScale(d.count))
      .curve(d3.curveMonotoneX);

    // Add gradient area
    svg.append('path')
      .datum(chartData)
      .attr('fill', 'url(#ticketGradient)')
      .attr('d', area);

    // Add line
    svg.append('path')
      .datum(chartData)
      .attr('fill', 'none')
      .attr('stroke', 'var(--button-secondary)')
      .attr('stroke-width', 2)
      .attr('d', line);

    // Add data points
    svg.selectAll('.data-point')
      .data(chartData)
      .enter().append('circle')
      .attr('class', 'data-point')
      .attr('cx', (d, i) => xScale(i))
      .attr('cy', d => yScale(d.count))
      .attr('r', 3)
      .attr('fill', 'var(--button-secondary)');
  }

  getTrendData() {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const today = new Date();
    const chartData = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      
      const dayTickets = this.tickets.filter(ticket => {
        const ticketDate = new Date(ticket.createdAt);
        return ticketDate.toDateString() === date.toDateString();
      });

      chartData.push({
        day: days[date.getDay()],
        count: dayTickets.length,
        date: date
      });
    }

    return chartData;
  }

  updateTrendPercentage(chartData) {
    const trendElement = document.querySelector('.tickets-development .development-value');
    if (!trendElement || chartData.length < 2) return;

    const currentCount = chartData[chartData.length - 1].count;
    const previousCount = chartData[chartData.length - 2].count;
    
    if (previousCount === 0) {
      trendElement.textContent = currentCount > 0 ? '↑ 100%' : '→ 0%';
      return;
    }

    const percentage = Math.round(((currentCount - previousCount) / previousCount) * 100);
    const arrow = percentage > 0 ? '↑' : percentage < 0 ? '↓' : '→';
    
    trendElement.textContent = `${arrow} ${Math.abs(percentage)}%`;
  }

  renderEmptyTrendChart(container) {
    const svg = d3.select(container).select('svg');
    const width = container.offsetWidth;
    const height = 80;

    svg.selectAll('*').remove();
    
    // Empty state line
    svg.append('line')
      .attr('x1', 20)
      .attr('y1', height / 2)
      .attr('x2', width - 20)
      .attr('y2', height / 2)
      .attr('stroke', 'var(--grid-color)')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '5,5');

    // Update trend to 0%
    const trendElement = document.querySelector('.tickets-development .development-value');
    if (trendElement) trendElement.textContent = '→ 0%';
  }

  // Priority Issues
  renderPriorityIssues() {
    const priorityCounts = this.getPriorityCounts();
    
    // Update critical (alta priority tickets)
    const criticalElement = document.querySelector('.priority-issues .priority-item:nth-child(1) .priority-count');
    if (criticalElement) {
      criticalElement.textContent = priorityCounts.alta || 0;
      criticalElement.style.color = '#ff4444'; // Critical red
    }

    // Update high (media priority tickets) 
    const highElement = document.querySelector('.priority-issues .priority-item:nth-child(2) .priority-count');
    if (highElement) {
      highElement.textContent = priorityCounts.media || 0;
      highElement.style.color = '#ff8800'; // High orange
    }

    // Update medium (baja priority tickets)
    const mediumElement = document.querySelector('.priority-issues .priority-item:nth-child(3) .priority-count');
    if (mediumElement) {
      mediumElement.textContent = priorityCounts.baja || 0;
      mediumElement.style.color = '#ffcc00'; // Medium yellow
    }
  }

  getPriorityCounts() {
    return {
      alta: this.tickets.filter(t => t.priority === 'alta').length,
      media: this.tickets.filter(t => t.priority === 'media').length,
      baja: this.tickets.filter(t => t.priority === 'baja').length
    };
  }

  // Recent Tickets
  renderRecentTickets() {
    const container = document.querySelector('.ticket-cases-container');
    if (!container) return;

    // Clear previous content
    container.innerHTML = '';

    if (this.tickets.length === 0) {
      container.innerHTML = `
        <div class="no-recent-tickets">
          <p>No hay incidencias recientes</p>
          <small>Los tickets aparecerán aquí cuando se creen</small>
        </div>
      `;
      return;
    }

    // Get last 5 tickets (increased from 3 for better demo)
    const recentTickets = this.tickets
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    recentTickets.forEach(ticket => {
      const ticketElement = this.createRecentTicketElement(ticket);
      container.appendChild(ticketElement);
    });
  }

  createRecentTicketElement(ticket) {
    const element = document.createElement('div');
    element.className = 'ticket-cases';
    
    const timeAgo = this.getTimeAgo(ticket.createdAt);
    const priorityColor = this.getPriorityColor(ticket.priority);
    const statusClass = this.getStatusClass(ticket.status);

    element.innerHTML = `
      <div class="ticket-id">#${ticket.token.toUpperCase()}</div>
      <div class="ticket-info">
        <h4>${ticket.subject}</h4>
        <p>${ticket.department || 'General'} • ${ticket.user}</p>
      </div>
      <div class="ticket-status ${statusClass}">${ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}</div>
      <div class="ticket-priority" style="color: ${priorityColor}">
        ${ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
      </div>
      <div class="ticket-date">${timeAgo}</div>
    `;

    return element;
  }

  getTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Ahora';
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} h ago`;
    return `${Math.floor(diffInMinutes / 1440)} días ago`;
  }

  getPriorityColor(priority) {
    const colors = {
      'alta': '#ff4444',
      'media': '#ffcc00',
      'baja': '#00ff00'
    };
    return colors[priority] || '#999999';
  }

  getStatusClass(status) {
    const classes = {
      'nuevo': 'status-new',
      'abierto': 'status-open',
      'pendiente': 'status-pending',
      'resuelto': 'status-resolved'
    };
    return classes[status] || 'status-new';
  }

  // Main render function
  renderAllDashboardElements() {
    this.renderTicketsOverview();
    this.renderPerformanceCard();
    this.renderNewTicketsCount();
    this.renderProgressBars();
    this.renderTrendChart();
    this.renderPriorityIssues();
    this.renderRecentTickets();
  }

  // Event listeners
  setupEventListeners() {
    // Listen for localStorage changes
    window.addEventListener('storage', (e) => {
      if (e.key === 'tickets' || e.key === 'ticketResponses') {
        this.refresh();
      }
    });

    // Listen for custom events
    window.addEventListener('ticketUpdated', () => {
      this.refresh();
    });

    // View all tickets button
    const viewAllButton = document.querySelector('.recent-tickets .view-all');
    if (viewAllButton) {
      viewAllButton.addEventListener('click', () => {
        // Switch to tickets section
        const ticketsButton = document.querySelector('[data-section="tickets"]');
        if (ticketsButton) {
          ticketsButton.click();
        }
      });
    }

    // Force refresh every 30 seconds to catch any missed updates
    setInterval(() => {
      if (this.isInitialized) {
        this.refresh();
      }
    }, 30000);
  }

  // Public method to refresh dashboard
  refresh() {
    this.loadData();
    this.renderAllDashboardElements();
  }
}

// Initialize dashboard when DOM is loaded
let dashboardManager;

document.addEventListener('DOMContentLoaded', () => {
  // Small delay to ensure all elements are rendered
  setTimeout(() => {
    dashboardManager = new DashboardManager();
    window.dashboardManager = dashboardManager;
  }, 100);
});

export default DashboardManager;
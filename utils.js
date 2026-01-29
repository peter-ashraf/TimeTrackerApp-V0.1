// Utility Functions for TimeTracker

/**
 * Show alert notification
 */
function showAlert(message, type = 'success') {
  const alert = document.createElement('div');
  alert.className = `alert alert-${type}`;
  alert.textContent = message;
  alert.setAttribute('role', 'alert');
  alert.setAttribute('aria-live', 'polite');
  
  document.body.appendChild(alert);
  
  setTimeout(() => {
    alert.style.animation = 'slideOutDown 0.3s ease-in-out forwards';
    setTimeout(() => alert.remove(), 300);
  }, 3000);
}

/**
 * Format time from 24h to 12h format
 */
function formatTime12h(time) {
  if (!time) return '—';
  const [h, m] = time.split(':');
  const hour = parseInt(h);
  const period = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour % 12 || 12;
  return `${String(h12).padStart(2, '0')}:${m} ${period}`;
}

/**
 * Calculate hours between two times
 */
function calculateHours(startTime, endTime) {
  if (!startTime || !endTime) return 0;
  
  const [ih, im] = startTime.split(':').map(Number);
  const [oh, om] = endTime.split(':').map(Number);
  let hours = (oh * 60 + om - ih * 60 - im) / 60;
  
  if (hours < 0) hours += 24; // Handle overnight shifts
  return hours;
}

/**
 * Debounce function for performance
 */
function debounce(func, delay) {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

/**
 * Format currency
 */
function formatCurrency(value) {
  return `L.E. ${value.toLocaleString('en-EG', { 
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

/**
 * Parse CSV data
 */
function parseCSV(csv) {
  const lines = csv.split('\n');
  const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
  const data = [];
  
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim() || lines[i].includes('TOTAL')) continue;
    
    const cells = lines[i].split(',').map(c => c.replace(/"/g, '').trim());
    const obj = {};
    
    headers.forEach((header, index) => {
      obj[header] = cells[index];
    });
    
    data.push(obj);
  }
  
  return data;
}
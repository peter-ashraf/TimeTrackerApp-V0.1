// TimeTracker v2.1 - Split & Cleaned (vanilla JS)
// NOTE: Styling and functionality preserved; only code organization + duplicate removal.

// Methods: initializePeriods, getPayPeriods, savePayPeriods, getCurrentPeriodId, setCurrentPeriodId, getCurrentPeriod, setCurrentPeriod, confirmDeletePeriod, openAddPeriodModal, openEditPeriodModal, addPayPeriod, editPayPeriod, deletePayPeriod, assignEntriesToPeriods

TimeTrackerApp.prototype.initializePeriods = function() {
  const periods = localStorage.getItem('payPeriods');
  if (!periods) {
    // Initialize with empty array
    localStorage.setItem('payPeriods', JSON.stringify([]));
    localStorage.setItem('currentPeriodId', '');
  }
}

TimeTrackerApp.prototype.getPayPeriods = function() {
  return JSON.parse(localStorage.getItem('payPeriods') || '[]');
}

TimeTrackerApp.prototype.savePayPeriods = function(periods) {
  localStorage.setItem('payPeriods', JSON.stringify(periods));
}

TimeTrackerApp.prototype.getCurrentPeriodId = function() {
  return localStorage.getItem('currentPeriodId') || '';
}

TimeTrackerApp.prototype.setCurrentPeriodId = function(periodId) {
  localStorage.setItem('currentPeriodId', periodId);
}

TimeTrackerApp.prototype.getCurrentPeriod = function() {
  const periodId = this.getCurrentPeriodId();
  const periods = this.getPayPeriods();
  
  // If no period selected, find period containing today
  if (!periodId) {
    const today = this.formatDate(new Date());
    const foundPeriod = periods.find(p => p.start <= today && p.end >= today);
    if (foundPeriod) {
      this.setCurrentPeriodId(foundPeriod.id);
      return foundPeriod;
    }
    // Return first period if available
    if (periods.length > 0) {
      this.setCurrentPeriodId(periods[0].id);
      return periods[0];
    }
    return null;
  }
  
  return periods.find(p => p.id === periodId) || null;
}

TimeTrackerApp.prototype.setCurrentPeriod = function(periodId) {
  this.setCurrentPeriodId(periodId);
  showAlert('✅ Current period updated');
  this.renderSettings();
  this.renderDashboard();
  this.renderTimesheet();
}

TimeTrackerApp.prototype.confirmDeletePeriod = function(periodId) {
  if (confirm('Are you sure you want to delete this pay period? This action cannot be undone.')) {
    this.deletePayPeriod(periodId);
    showAlert('✅ Period deleted');
    this.renderSettings();
    this.renderDashboard();
    this.renderTimesheet();
  }
}

TimeTrackerApp.prototype.openAddPeriodModal = function() {
  const existing = document.getElementById('periodOverlay');
  if (existing) return;
  
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'periodOverlay';
  
  const content = document.createElement('div');
  content.className = 'modal-content';
  content.innerHTML = `
    <h2>Add Pay Period</h2>
    <div class="modal-body">
      <div class="form-group">
        <label for="periodStart" class="form-label">Start Date</label>
        <input type="date" id="periodStart" class="form-control">
      </div>
      
      <div class="form-group">
        <label for="periodEnd" class="form-label">End Date</label>
        <input type="date" id="periodEnd" class="form-control">
      </div>
      
      <div class="form-note">
        <strong>Note:</strong> Periods must be continuous (no gaps) and cannot overlap with existing periods.
      </div>
    </div>
    
    <div class="modal-actions">
      <button class="btn btn-secondary" id="cancelPeriodBtn">Cancel</button>
      <button class="btn btn-primary" id="savePeriodBtn">Add Period</button>
    </div>
  `;
  
  overlay.appendChild(content);
  document.body.appendChild(overlay);
  
  document.getElementById('cancelPeriodBtn').addEventListener('click', () => {
    overlay.remove();
  });
  
  document.getElementById('savePeriodBtn').addEventListener('click', () => {
    const start = document.getElementById('periodStart').value;
    const end = document.getElementById('periodEnd').value;
    
    if (!start || !end) {
      showAlert('Please select both start and end dates');
      return;
    }
    
    if (this.addPayPeriod(start, end)) {
      overlay.remove();
      showAlert('✅ Pay period added');
      this.renderSettings();
      this.renderDashboard();
      this.renderTimesheet();
    }
  });
}

TimeTrackerApp.prototype.openEditPeriodModal = function(periodId) {
  const period = this.getPayPeriods().find(p => p.id === periodId);
  if (!period) return;
  
  const existing = document.getElementById('periodOverlay');
  if (existing) return;
  
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'periodOverlay';
  
  const content = document.createElement('div');
  content.className = 'modal-content';
  content.innerHTML = `
    <h2>Edit Pay Period</h2>
    <div class="modal-body">
      <div class="form-group">
        <label for="periodStart" class="form-label">Start Date</label>
        <input type="date" id="periodStart" class="form-control" value="${period.start}">
      </div>
      
      <div class="form-group">
        <label for="periodEnd" class="form-label">End Date</label>
        <input type="date" id="periodEnd" class="form-control" value="${period.end}">
      </div>
      
      <div class="form-note">
        <strong>Note:</strong> Periods must be continuous (no gaps) and cannot overlap with existing periods.
      </div>
    </div>
    
    <div class="modal-actions">
      <button class="btn btn-secondary" id="cancelPeriodBtn">Cancel</button>
      <button class="btn btn-primary" id="savePeriodBtn">Save Changes</button>
    </div>
  `;
  
  overlay.appendChild(content);
  document.body.appendChild(overlay);
  
  document.getElementById('cancelPeriodBtn').addEventListener('click', () => {
    overlay.remove();
  });
  
  document.getElementById('savePeriodBtn').addEventListener('click', () => {
    const start = document.getElementById('periodStart').value;
    const end = document.getElementById('periodEnd').value;
    
    if (!start || !end) {
      showAlert('Please select both start and end dates');
      return;
    }
    
    if (this.editPayPeriod(periodId, start, end)) {
      overlay.remove();
      showAlert('✅ Pay period updated');
      this.renderSettings();
      this.renderDashboard();
      this.renderTimesheet();
    }
  });
}

TimeTrackerApp.prototype.addPayPeriod = function(start, end) {
  const validation = this.validatePeriod(start, end);
  if (!validation.valid) {
    showAlert(`❌ ${validation.message}`);
    return false;
  }
  
  const periods = this.getPayPeriods();
  const newPeriod = {
    id: `period_${Date.now()}`,
    start: start,
    end: end,
    label: this.generatePeriodLabel(start, end)
  };
  
  periods.push(newPeriod);
  
  // Sort periods by start date
  periods.sort((a, b) => new Date(a.start) - new Date(b.start));
  
  this.savePayPeriods(periods);
  
  // If this is the first period, set as current
  if (periods.length === 1) {
    this.setCurrentPeriodId(newPeriod.id);
  }
  
  return true;
}

TimeTrackerApp.prototype.editPayPeriod = function(periodId, start, end) {
  const validation = this.validatePeriod(start, end, periodId);
  if (!validation.valid) {
    showAlert(`❌ ${validation.message}`);
    return false;
  }
  
  const periods = this.getPayPeriods();
  const period = periods.find(p => p.id === periodId);
  
  if (!period) {
    showAlert('❌ Period not found');
    return false;
  }
  
  period.start = start;
  period.end = end;
  period.label = this.generatePeriodLabel(start, end);
  
  // Sort periods by start date
  periods.sort((a, b) => new Date(a.start) - new Date(b.start));
  
  this.savePayPeriods(periods);
  return true;
}

TimeTrackerApp.prototype.deletePayPeriod = function(periodId) {
  let periods = this.getPayPeriods();
  periods = periods.filter(p => p.id !== periodId);
  this.savePayPeriods(periods);
  
  // If deleted period was current, set first period as current
  if (this.getCurrentPeriodId() === periodId) {
    if (periods.length > 0) {
      this.setCurrentPeriodId(periods[0].id);
    } else {
      this.setCurrentPeriodId('');
    }
  }
}

TimeTrackerApp.prototype.assignEntriesToPeriods = function() {
  const entries = JSON.parse(localStorage.getItem('timeEntries') || '[]');
  const periods = this.getPayPeriods();
  
  if (periods.length === 0) {
    showAlert('⚠️ No periods defined. Please add periods first.');
    return;
  }
  
  let assigned = 0;
  let unassigned = 0;
  
  entries.forEach(entry => {
    const period = this.getPeriodForDate(entry.date);
    if (period) {
      entry.periodId = period.id;
      assigned++;
    } else {
      entry.periodId = null;
      unassigned++;
    }
  });
  
  localStorage.setItem('timeEntries', JSON.stringify(entries));
  
  showAlert(`✅ Assigned ${assigned} entries to periods. ${unassigned} entries outside defined periods.`);
}

// Get detailed view state


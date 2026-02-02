// TimeTracker v2.1 - Split & Cleaned (vanilla JS)
// NOTE: Styling and functionality preserved; only code organization + duplicate removal.

// Methods: getCurrentAndNextMonth, renderDashboard, openManualTimeModal, renderTimesheet, setManualTime, renderSettings, clearCurrentDay, clearCurrentMonth, clearAllData, checkIn, checkOut, openAddDayModal, openAddBreakModal, populateTimesheetTable, updateTimeEntry, deleteDayEntry, editDayEntry, togglePeriodSection, generateMonthOptions, renderDaysDetailsContent, setupDaysDetailsListeners, updateBreakLabels

TimeTrackerApp.prototype.getCurrentAndNextMonth = function() {
  const period = this.getCurrentPeriod();
  if (!period) {
    // Fallback to old behavior if no periods defined
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const today = new Date();
    const currentMonthIndex = today.getMonth();
    const nextMonthIndex = (currentMonthIndex + 1) % 12;
    const currentMonth = months[currentMonthIndex];
    const nextMonth = months[nextMonthIndex];
    return `${currentMonth}-${nextMonth}`;
  }
  
  return period.label;
}

TimeTrackerApp.prototype.renderDashboard = function() {
  const dashboard = document.getElementById('dashboardScreen');
  const employee = this.getEmployeeData();
  const vacation = this.getVacationData();
  const sickTotal = parseFloat(localStorage.getItem('sickDays') || '7');
  const currentMonth = this.getCurrentAndNextMonth();
  const salaryDivided = employee.salary / 3;
  const salaryTwoThird = salaryDivided * 2;
  const salaryOneThird = salaryDivided * 1;
  
  // Get overtime total using helper (doesn't touch DOM)
  const totalExtraHoursWithFactor = this.getTimesheetTotals();
  const employeeHourCost = salaryTwoThird / 187.5;
  const overtimeIntoMoney = totalExtraHoursWithFactor * employeeHourCost;
  const totalSalary = Number(employee.salary + overtimeIntoMoney);
  let html = `
    <h1>Dashboard</h1>
    
    <div class="employee-card">
        <div class="employee-name-container">
            <div class="hide-salary-section">
                <button class="btn-icon" id="toggleSalaryBtn" title="Toggle salary visibility"><i class="fa-solid fa-eye-slash"></i></button>
                <h2>${employee.name}</h2>
            </div>
        </div>
      
      <p>Month: <span class="current-next-month"><strong>${currentMonth}</strong></span></p>
      <div class="overtime-section">
        <p>Overtime: <span class="overtime-hours-amount"
        style="color: ${totalExtraHoursWithFactor > 0 ? '#80FF00' : '#FF9696'}"><strong>${totalExtraHoursWithFactor ? totalExtraHoursWithFactor.toFixed(2) : "0.00"}h</strong></span></p>
        <p>Overtime into Money: <span class="overtime-money-amount" style="color: ${overtimeIntoMoney > 0 ? '#80FF00' : '#FF9696'}"><strong>${this.hideSalary ? '••••••' : overtimeIntoMoney ? `${overtimeIntoMoney.toLocaleString()} L.E.` : "0.00"}</strong></span></p>
      </div>
      <div class="salary-section">
        <p>Base Salary: <span class="salary-amount">${this.hideSalary ? '••••••' : employee.salary.toLocaleString()} L.E.</span></p>
        <p>Total Salary: <span class="salary-amount">${this.hideSalary ? '••••••' : totalSalary ? totalSalary.toLocaleString() : employee.salary.toLocaleString()} L.E.</span></p>
      </div>

      
    </div>

    <div class="manual-time-actions">
      <button class="btn btn-secondary manual-check-in-btn">✍️ Manual In</button>
      <button class="btn btn-secondary manual-check-out-btn">✍️ Manual Out</button>
      <button type="button" class="btn btn-secondary add-break-btn">+ Add Break</button>
    </div>

    <div class="quick-actions">
      <button class="btn btn-primary" id="checkInBtn">📍 Check In</button>
      <button class="btn btn-primary" id="checkOutBtn">📤 Check Out</button>
      <button class="btn btn-secondary" id="addSpecialDayBtn">📅 Add Day</button>
      <button class="btn btn-outline" id="viewTimesheetBtn">📊 View Hours</button>
    </div>

    <div class="vacation-cards">
      <div class="vacation-card-redesigned">
        <div class="vacation-top-section">
          <div class="vacation-stat">
            <span class="stat-label">Official Balance</span>
            <span class="stat-value">${vacation.officialBalance}</span>
          </div>
          <div class="vacation-stat">
            <span class="stat-label">Taken Days</span>
            <span class="stat-value">${vacation.takenDays}</span>
          </div>
          <div class="vacation-stat">
            <span class="stat-label">To Be Added</span>
            <span class="stat-value">${vacation.toBeAdded}</span>
          </div>
        </div>
        <div class="vacation-bottom-section">
          <span class="balance-label">Current Available Balance</span>
          <span class="balance-value">${vacation.currentBalance}</span>
        </div>
      </div>

      <div class="vacation-card-redesigned">
        <div class="vacation-top-section double-stat">
          <div class="vacation-stat">
            <span class="stat-label">Sick Days Balance</span>
            <span class="stat-value">${sickTotal}</span>
          </div>
          <div class="vacation-stat">
            <span class="stat-label">Days Used</span>
            <span class="stat-value">${vacation.daysUsed}</span>
          </div>
        </div>
        <div class="vacation-bottom-section">
          <span class="balance-label">Current Available Balance</span>
          <span class="balance-value">${sickTotal - vacation.daysUsed}</span>
        </div>
      </div>
    </div>

    
  `;

  dashboard.innerHTML = html;

  const salaryBtnIcon = document.querySelector('#toggleSalaryBtn i');
  // Event listener - Toggle Salary Visibility
  document.getElementById('toggleSalaryBtn').addEventListener('click', () => {
    console.log(salaryBtnIcon);
    this.hideSalary = !this.hideSalary;
    localStorage.setItem('hideSalary', this.hideSalary);
    document.body.classList.toggle('salary-blur', this.hideSalary);
    
    this.renderDashboard();
  });

  // Check In / Check Out
  document.getElementById('checkInBtn').addEventListener('click', () => this.checkIn());
  document.getElementById('checkOutBtn').addEventListener('click', () => this.checkOut());
  
  // Add Special Day
  document.getElementById('addSpecialDayBtn').addEventListener('click', () => this.openAddDayModal());
  
  // View Timesheet Tab
  document.getElementById('viewTimesheetBtn').addEventListener('click', () => this.showScreen('timesheet'));
  
  // Manual time buttons
  document.querySelectorAll('.manual-check-in-btn').forEach(btn => {
    btn.addEventListener('click', () => this.openManualTimeModal('checkIn'));
  });

  document.querySelectorAll('.manual-check-out-btn').forEach(btn => {
    btn.addEventListener('click', () => this.openManualTimeModal('checkOut'));
  });

  document.querySelectorAll('.add-break-btn').forEach(btn => {
    btn.addEventListener('click', () => this.openAddBreakModal());
  });

  const vacationStats = document.querySelectorAll('.vacation-card-redesigned .vacation-stat');
  
  // First card (Vacation) - 3 stats
  if (vacationStats[0]) {
    // Official Balance - not clickable (just displays total)
    vacationStats[0].style.cursor = 'default';
  }
  
  if (vacationStats[1]) {
    // Taken Days - clickable
    vacationStats[1].style.cursor = 'pointer';
    vacationStats[1].classList.add('clickable-stat');
    vacationStats[1].addEventListener('click', () => {
      this.openDaysDetailsModal('vacation');
    });
  }
  
  if (vacationStats[2]) {
    // To Be Added - clickable
    vacationStats[2].style.cursor = 'pointer';
    vacationStats[2].classList.add('clickable-stat');
    vacationStats[2].addEventListener('click', () => {
      this.openDaysDetailsModal('toBeAdded');
    });
  }
  
  // Second card (Sick Days) - 2 stats
  if (vacationStats[3]) {
    // Sick Days Balance - not clickable (just displays total)
    vacationStats[3].style.cursor = 'default';
  }
  
  if (vacationStats[4]) {
    // Days Used - clickable
    vacationStats[4].style.cursor = 'pointer';
    vacationStats[4].classList.add('clickable-stat');
    vacationStats[4].addEventListener('click', () => {
      this.openDaysDetailsModal('sick');
    });
  }

  // Apply salary blur if hidden
  if (this.hideSalary) {
    document.body.classList.add('salary-blur');
    salaryBtnIcon.classList.replace('fa-eye-slash', 'fa-eye');
  }
}

TimeTrackerApp.prototype.openManualTimeModal = function(mode) {
    const existing = document.getElementById('manualTimeOverlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'manualTimeOverlay';

    const title = mode === 'checkIn' ? 'Manual Check In' : 'Manual Check Out';
    const today = this.formatDate(new Date());

    overlay.innerHTML = `
    <div class="modal-content">
      <h2>${title}</h2>
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">Apply for</label>
          <select id="manualMode" class="form-control">
            <option value="today">Today (${today})</option>
            <option value="date">Specific date</option>
          </select>
        </div>

        <div class="form-group" id="manualDateGroup" style="display:none;">
          <label class="form-label">Select date</label>
          <input type="date" id="manualDate" class="form-control" value="${today}">
        </div>

        <div class="form-group">
          <label class="form-label">Time</label>
          <input type="time" id="manualTime" class="form-control" value="${this.formatTime(new Date())}">
        </div>
      </div>

      <div class="modal-actions">
        <button class="btn btn-secondary" id="manualCancelBtn">Cancel</button>
        <button class="btn btn-primary" id="manualSaveBtn">Save</button>
      </div>
    </div>
  `;

    document.body.appendChild(overlay);

    const modeSelect = document.getElementById('manualMode');
    const dateGroup = document.getElementById('manualDateGroup');

    modeSelect.addEventListener('change', () => {
      dateGroup.style.display = modeSelect.value === 'date' ? 'block' : 'none';
    });

    document.getElementById('manualCancelBtn').addEventListener('click', () => overlay.remove());

    document.getElementById('manualSaveBtn').addEventListener('click', () => {
  const applyMode = modeSelect.value;
  const selectedDate = (applyMode === 'date')
    ? document.getElementById('manualDate').value
    : today;

  const timeValue = document.getElementById('manualTime').value;

  if (!selectedDate) {
    showAlert('Please select a date');
    return;
  }
  if (!timeValue) {
    showAlert('Please enter a time');
    return;
  }

  // ✅ NEW: Check if date is in current period
  const currentPeriod = this.getCurrentPeriod();
  if (currentPeriod && (selectedDate < currentPeriod.start || selectedDate > currentPeriod.end)) {
    const proceed = confirm(`⚠️ Warning: ${selectedDate} is outside the current period (${currentPeriod.label}).\n\nDo you want to continue?`);
    if (!proceed) {
      return;
    }
  }

  this.setManualTime(mode, selectedDate, timeValue);
  overlay.remove();
  
  this.populateTimesheetTable();
  
  if (document.getElementById('dashboardScreen').style.display !== 'none') {
    this.renderDashboard();
  }
});
  }

TimeTrackerApp.prototype.renderTimesheet = function() {
  // ✅ EMERGENCY FIX: Initialize and validate currentMonth
  if (!this.currentMonth) {
    this.currentMonth = new Date();
  } else if (typeof this.currentMonth === 'string') {
    // Convert string to Date
    this.currentMonth = new Date(this.currentMonth + '-01');
  } else if (!(this.currentMonth instanceof Date)) {
    this.currentMonth = new Date();
  }
  
  // Validate it's a real date
  if (isNaN(this.currentMonth.getTime())) {
    console.error('Invalid currentMonth detected, resetting to current date');
    this.currentMonth = new Date();
  }
  
  // ... REST OF YOUR EXISTING renderTimesheet CODE BELOW ...
  const timesheet = document.getElementById('timesheetScreen');
  const data = this.getTimesheetData();
  const use12Hour = localStorage.getItem('use12HourFormat') === 'true';
  const detailedView = this.getDetailedViewState();

  let html = `
    <h1>Timesheet</h1>
    
    <div class="timesheet-controls">
      <div class="month-selector">
        <label>Select Period:</label>
        <select id="monthSelect">
          ${this.generateMonthOptions()}
        </select>
      </div>

      <div class="toggle-group">
        <!-- Detailed View Toggle -->
        <div class="time-format-toggle">
          <label class="toggle-switch">
            <input type="checkbox" id="detailedViewToggle" ${detailedView ? 'checked' : ''}>
            <span class="toggle-slider"></span>
            <span class="toggle-label">${detailedView ? 'Detailed' : 'Simple'}</span>
          </label>
        </div>

        <!-- Time Format Toggle -->
        <div class="time-format-toggle">
          <label class="toggle-switch">
            <input type="checkbox" id="timeFormatToggle" ${use12Hour ? 'checked' : ''}>
            <span class="toggle-slider"></span>
            <span class="toggle-label">${use12Hour ? '12h' : '24h'}</span>
          </label>
        </div>
      </div>
    </div>

    <div class="manual-time-actions">
      <button class="btn btn-secondary manual-check-in-btn">✍️ Manual In</button>
      <button class="btn btn-secondary manual-check-out-btn">✍️ Manual Out</button>
      <button type="button" class="btn btn-secondary add-break-btn">+ Add Break</button>
    </div>

    <div id="tableContainer">
      <table class="data-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Check In</th>
            <th>Check Out</th>
            <th>Hours Spent</th>
            <th class="hide-mobile">Extra Hours</th>
            <th class="hide-mobile">Extra Hours <br><span style="font-size: 8px;">(xFactor)</span></th>
            <th class="hide-mobile">Type</th>
            <th class="hide-mobile">Check Out <br><span style="font-size: 8px;">(Within Day)</span></th>
            <th class="hide-mobile">Check In <br><span style="font-size: 8px;">(Within Day)</span></th>
            <th class="hide-mobile">Hours Spent Outside</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="timesheetTable">
        </tbody>
      </table>
    </div>
  `;

  timesheet.innerHTML = html;
  this.populateTimesheetTable();

  // Apply initial detailed view state
  this.updateTableColumns(detailedView);

  // Period selector change listener
  document.getElementById('monthSelect').addEventListener('change', (e) => {
    const periods = this.getPayPeriods();
    
    if (periods.length === 0) {
      this.currentMonth = new Date(e.target.value + '-01'); // ✅ FIX: Convert string to Date
    } else {
      this.selectedPeriodId = e.target.value;
    }
    
    this.renderTimesheet();
    this.renderDashboard();
  });

  // Time format toggle
  document.getElementById('timeFormatToggle').addEventListener('change', (e) => {
    const use12Hour = e.target.checked;
    localStorage.setItem('use12HourFormat', use12Hour);
    
    e.target.parentElement.querySelector('.toggle-label').textContent = use12Hour ? '12h' : '24h';
    
    this.populateTimesheetTable();
  });

  // Detailed view toggle
  document.getElementById('detailedViewToggle').addEventListener('change', (e) => {
    const showDetailed = e.target.checked;
    localStorage.setItem('detailedView', showDetailed);
    
    e.target.parentElement.querySelector('.toggle-label').textContent = showDetailed ? 'Detailed' : 'Simple';
    
    this.updateTableColumns(showDetailed);
  });

  // Manual time buttons
  document.querySelectorAll('.manual-check-in-btn').forEach(btn => {
    btn.addEventListener('click', () => this.openManualTimeModal('checkIn'));
  });

  document.querySelectorAll('.manual-check-out-btn').forEach(btn => {
    btn.addEventListener('click', () => this.openManualTimeModal('checkOut'));
  });
  
  document.querySelectorAll('.add-break-btn').forEach(btn => {
    btn.addEventListener('click', () => this.openAddBreakModal());
  });
}


TimeTrackerApp.prototype.setManualTime = function(mode, dateStr, timeStr) {
  const entries = JSON.parse(localStorage.getItem('timeEntries') || '[]');

  let entry = entries.find(e => e.date === dateStr);

  if (!entry) {
    entry = {
      date: dateStr,
      type: 'Regular',
      intervals: []
    };
    entries.push(entry);
  }

  if (!entry.intervals) entry.intervals = [];

  const lastInterval = entry.intervals[entry.intervals.length - 1];

  if (mode === 'checkIn') {
    if (lastInterval && !lastInterval.out) {
      showAlert('⚠️ Already checked in');
      return;
    }
    entry.intervals.push({ in: timeStr, out: null });
  }

  if (mode === 'checkOut') {
    if (!lastInterval || lastInterval.out) {
      showAlert('⚠️ No active check-in');
      return;
    }
    lastInterval.out = timeStr;
  }

  localStorage.setItem('timeEntries', JSON.stringify(entries));
  this.renderDashboard();
}

TimeTrackerApp.prototype.renderSettings = function() {
    const settings = document.getElementById('settingsScreen');
    const savedSalary = localStorage.getItem('salary') || '';
    const salaryDisplay = this.hideSalary ? '' : savedSalary;
    
    // Get periods data
    const periods = this.getPayPeriods();
    const currentPeriodId = this.getCurrentPeriodId();
    const today = this.formatDate(new Date());
    
    // Categorize periods
    const currentPeriod = periods.find(p => p.start <= today && p.end >= today);
    const pastPeriods = periods.filter(p => p.end < today).sort((a, b) => new Date(b.start) - new Date(a.start));
    const upcomingPeriods = periods.filter(p => p.start > today).sort((a, b) => new Date(a.start) - new Date(b.start));
    
    // Get collapse states from localStorage (default: collapsed)
    const pastCollapsed = localStorage.getItem('pastPeriodsCollapsed') !== 'false';
    const upcomingCollapsed = localStorage.getItem('upcomingPeriodsCollapsed') !== 'false';
    
    // Build periods HTML
    let periodsHtml = '';
    
    if (periods.length === 0) {
      periodsHtml = '<p style="text-align: center; padding: 20px; color: var(--color-text-secondary);">No pay periods defined. Add your first period below.</p>';
    } else {
      // Helper function to render a period item
      const renderPeriodItem = (period) => {
        const isCurrent = period.id === currentPeriodId;
        return `
          <div class="period-item ${isCurrent ? 'period-current' : ''}">
            <div class="period-info">
              <span class="period-label">${period.label}</span>
              ${isCurrent ? '<span class="period-badge">Current ✓</span>' : ''}
            </div>
            <div class="period-actions">
              ${!isCurrent ? `<button class="btn btn-sm btn-outline" onclick="app.setCurrentPeriod('${period.id}')">Set Current</button>` : ''}
              <button class="btn btn-sm btn-outline" onclick="app.openEditPeriodModal('${period.id}')">✏️ Edit</button>
              <button class="btn btn-sm btn-danger" onclick="app.confirmDeletePeriod('${period.id}')">🗑️ Delete</button>
            </div>
          </div>
        `;
      };
      
      // Current Period Section (always visible)
      if (currentPeriod) {
        periodsHtml += `
          <div class="period-section">
            <h4 class="period-section-header current-period-header">
              📅 CURRENT PERIOD
            </h4>
            <div class="period-section-content">
              ${renderPeriodItem(currentPeriod)}
            </div>
          </div>
        `;
      }
      
      // Past Periods Section (collapsible)
      if (pastPeriods.length > 0) {
        periodsHtml += `
          <div class="period-section">
            <h4 class="period-section-header collapsible ${pastCollapsed ? 'collapsed' : ''}" onclick="app.togglePeriodSection('past')">
              <span class="collapse-arrow">${pastCollapsed ? '▶' : '▼'}</span>
              PAST PERIODS (${pastPeriods.length})
            </h4>
            <div class="period-section-content ${pastCollapsed ? 'collapsed' : ''}">
              ${pastPeriods.map(p => renderPeriodItem(p)).join('')}
            </div>
          </div>
        `;
      }
      
      // Upcoming Periods Section (collapsible)
      if (upcomingPeriods.length > 0) {
        periodsHtml += `
          <div class="period-section">
            <h4 class="period-section-header collapsible ${upcomingCollapsed ? 'collapsed' : ''}" onclick="app.togglePeriodSection('upcoming')">
              <span class="collapse-arrow">${upcomingCollapsed ? '▶' : '▼'}</span>
              UPCOMING PERIODS (${upcomingPeriods.length})
            </h4>
            <div class="period-section-content ${upcomingCollapsed ? 'collapsed' : ''}">
              ${upcomingPeriods.map(p => renderPeriodItem(p)).join('')}
            </div>
          </div>
        `;
      }
    }

    let html = `
      <h1>Settings</h1>
      
      <div class="card settings-card">
        <h3>Pay Period Management</h3>
        <p class="settings-description">Define custom pay periods for your timesheet. Periods must be continuous with no gaps or overlaps.</p>
        
        <div class="periods-list">
          ${periodsHtml}
        </div>
        
        <div class="period-actions-bar">
          <button class="btn btn-primary" id="addPeriodBtn">+ Add Pay Period</button>
          ${periods.length > 0 ? '<button class="btn btn-secondary" id="assignEntriesBtn">🔄 Assign Entries to Periods</button>' : ''}
        </div>
      </div>

      <div class="card settings-card">
        <h3>Employee Information</h3>
        <form id="employeeForm">
          <div class="form-group">
            <label>Full Name</label>
            <input type="text" id="fullName" value="${localStorage.getItem('fullName') || ''}" placeholder="Enter full name" required>
          </div>
          <div class="form-group">
            <label>Salary (L.E.)</label>
            <input type="number" id="salary" value="${salaryDisplay}" placeholder="${this.hideSalary ? '••••••' : 'Enter monthly salary'}" ${this.hideSalary ? 'readonly' : ''} required>
          </div>
          <button type="submit" class="btn btn-primary">💾 Save Changes</button>
        </form>
      </div>

      <div class="card settings-card">
        <h3>Leave Settings</h3>
        <form id="leaveForm">
          <div class="form-group">
            <label>Annual Vacation Days</label>
            <input type="number" id="annualVacation" value="${localStorage.getItem('annualVacation') || '10'}" placeholder="Annual vacation days">
          </div>
          <div class="form-group">
            <label>Sick Leave Days</label>
            <input type="number" id="sickDays" value="${localStorage.getItem('sickDays') || '7'}" placeholder="Sick leave days">
          </div>
          <button type="submit" class="btn btn-primary">💾 Save Changes</button>
        </form>
      </div>

      <div class="card settings-card">
        <h3>Danger Zone</h3>
        <p>Be careful with these actions - they cannot be undone!</p>
        
        <div class="clear-actions">
          <button class="btn btn-danger" id="clearDayBtn">🗑️ Clear Current Day</button>
          <button class="btn btn-danger" id="clearMonthBtn">🗑️ Clear Current Month</button>
          <button class="btn btn-danger" id="clearAllDataBtn">⚠️ Clear All Data</button>
        </div>

        <div class="quick-actions">
          <button class="btn btn-secondary" id="exportCsvBtn">📥 Export CSV</button>
          <button class="btn btn-outline" id="importCsvBtn">📤 Import CSV</button>
        </div>
      </div>
    `;

    settings.innerHTML = html;
    
    // Period management event listeners
    document.getElementById('addPeriodBtn').addEventListener('click', () => {
      this.openAddPeriodModal();
    });
    
    if (periods.length > 0) {
      document.getElementById('assignEntriesBtn').addEventListener('click', () => {
        this.assignEntriesToPeriods();
        this.renderSettings();
      });
    }

    // Employee form
    document.getElementById('employeeForm').addEventListener('submit', (e) => {
      e.preventDefault();
      localStorage.setItem('fullName', document.getElementById('fullName').value);
      localStorage.setItem('salary', document.getElementById('salary').value);
      showAlert('Employee information saved successfully!');
      this.renderDashboard();
    });

    // Leave form
    document.getElementById('leaveForm').addEventListener('submit', (e) => {
      e.preventDefault();
      localStorage.setItem('annualVacation', document.getElementById('annualVacation').value);
      localStorage.setItem('sickDays', document.getElementById('sickDays').value);
      showAlert('Leave settings saved successfully!');
      this.renderDashboard();
    });

    // Clear buttons
    document.getElementById('clearDayBtn').addEventListener('click', () => this.clearCurrentDay());
    document.getElementById('clearMonthBtn').addEventListener('click', () => this.clearCurrentMonth());
    document.getElementById('clearAllDataBtn').addEventListener('click', () => this.clearAllData());
    document.getElementById('exportCsvBtn').addEventListener('click', () => this.exportCSV());
    document.getElementById('importCsvBtn').addEventListener('click', () => this.triggerFileInput());
  }

TimeTrackerApp.prototype.clearCurrentDay = function() {
    if (confirm('Are you sure you want to clear data for today? This cannot be undone!')) {
      const today = this.formatDate(new Date());
      const entries = JSON.parse(localStorage.getItem('timeEntries') || '[]');
      const filtered = entries.filter(e => e.date !== today);
      localStorage.setItem('timeEntries', JSON.stringify(filtered));
      showAlert('Today\'s data cleared!');
      this.renderTimesheet();
      this.renderDashboard();
    }
  }

TimeTrackerApp.prototype.clearCurrentMonth = function() {
    const monthKey = this.currentMonth.toISOString().substring(0, 7);
    if (confirm(`Are you sure you want to clear all data for ${this.formatMonthYear(this.currentMonth)}? This cannot be undone!`)) {
      const entries = JSON.parse(localStorage.getItem('timeEntries') || '[]');
      const filtered = entries.filter(e => !e.date.startsWith(monthKey));
      localStorage.setItem('timeEntries', JSON.stringify(filtered));
      showAlert(`Data for ${this.formatMonthYear(this.currentMonth)} cleared!`);
      this.renderTimesheet();
      this.renderDashboard();
    }
  }

TimeTrackerApp.prototype.clearAllData = function() {
    if (confirm('⚠️ WARNING: This will delete ALL data (timesheet, settings, everything)! This cannot be undone. Type "DELETE ALL" to confirm.')) {
      const confirmation = prompt('Type "DELETE ALL" to confirm:');
      if (confirmation === 'DELETE ALL') {
        localStorage.clear();
        showAlert('All data has been cleared!');
        this.renderSettings();
        this.renderDashboard();
      } else {
        showAlert('Deletion cancelled');
      }
    }
  }

TimeTrackerApp.prototype.checkIn = function() {
    const today = this.formatDate(new Date());
    const time = this.formatTime(new Date());
    const entries = JSON.parse(localStorage.getItem('timeEntries') || '[]');

    let entry = entries.find(e => e.date === today);

    if (!entry) {
      entry = {
        date: today,
        type: 'Regular',
        intervals: []
      };
      entries.push(entry);
    }

    // Prevent double check-in
    const lastInterval = entry.intervals[entry.intervals.length - 1];
    if (lastInterval && !lastInterval.out) {
      showAlert('⚠️ You are already checked in');
      return;
    }

    // Start new interval
    entry.intervals.push({ in: time, out: null });

    localStorage.setItem('timeEntries', JSON.stringify(entries));
    showAlert(`✅ Checked in at ${time}`);
    this.renderDashboard();
}

TimeTrackerApp.prototype.checkOut = function() {
    const today = this.formatDate(new Date());
    const time = this.formatTime(new Date());
    const entries = JSON.parse(localStorage.getItem('timeEntries') || '[]');

    const entry = entries.find(e => e.date === today);

    if (!entry || !entry.intervals || entry.intervals.length === 0) {
        showAlert('⚠️ No active check-in found');
        return;
    }

    const lastInterval = entry.intervals[entry.intervals.length - 1];

    if (lastInterval.out) {
        showAlert('⚠️ You are already checked out');
        return;
    }

    lastInterval.out = time;

    localStorage.setItem('timeEntries', JSON.stringify(entries));
    showAlert(`✅ Checked out at ${time}`);
    this.renderDashboard();
    }

TimeTrackerApp.prototype.openAddDayModal = function() {
    // Prevent opening multiple overlays
    const existing = document.getElementById('addDayOverlay');
    if (existing) return;

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'addDayOverlay';

    const today = this.formatDate(new Date());

    const content = document.createElement('div');
    content.className = 'modal-content';
    content.innerHTML = `
        <h2>Add Special Day</h2>
        <div class="modal-body">
        <div class="form-group">
            <label for="dayType" class="form-label">Day Type</label>
            <select id="dayType" class="form-control">
            <option value="Vacation (Full Day)">Vacation (Full Day)</option>
            <option value="Vacation (Half Day)">Vacation (Half Day)</option>
            <option value="Sick Leave (Full Day)">Sick Leave (Full Day)</option>
            <option value="Sick Leave (Half Day)">Sick Leave (Half Day)</option>
            <option value="Holiday (Full Day)">Holiday (Full Day)</option>
            <option value="Leave (Full Day)">Leave (Full Day)</option>
            <option value="To Be Added (Full Day)">To Be Added (Full Day)</option>
            <option value="To Be Added (Half Day)">To Be Added (Half Day)</option>
            </select>
        </div>
        
        <div class="form-group">
            <label for="dayDate" class="form-label">Date</label>
            <input type="date" id="dayDate" class="form-control" value="${today}">
        </div>
        
        <div class="form-group">
            <label for="dayNotes" class="form-label">Notes (optional)</label>
            <textarea id="dayNotes" class="form-control" placeholder="Add notes (optional)" rows="3"></textarea>
        </div>
        </div>
        
        <div class="modal-actions">
        <button class="btn btn-secondary" id="cancelAddDayBtn">Cancel</button>
        <button class="btn btn-primary" id="confirmAddDayBtn">Add Day</button>
        </div>
    `;

    overlay.appendChild(content);
    document.body.appendChild(overlay);

    // Cancel button
    document.getElementById('cancelAddDayBtn').addEventListener('click', () => {
      overlay.remove();
    });

    // Handle Add Day button
    document.getElementById('confirmAddDayBtn').addEventListener('click', () => {
      const dayTypeLabel = document.getElementById('dayType').value;
      const selectedDate = document.getElementById('dayDate').value;
      const dayNotes = document.getElementById('dayNotes').value?.trim() || '';

      if (!dayTypeLabel) {
        showAlert('Please select a day type');
        return;
      }

      if (!selectedDate) {
        showAlert('Please select a date');
        return;
      }

      // Convert label -> canonical type + duration
      const { type, duration } = this.parseSpecialDayLabel(dayTypeLabel);

      const entries = JSON.parse(localStorage.getItem('timeEntries') || '[]');

      // Prevent duplicates for the same day + same type
      const exists = entries.some(e => e.date === selectedDate && e.type === type && (e.duration || 1) === duration);
      if (exists) {
        showAlert('⚠️ This day type already exists for the selected date');
        return;
      }

      entries.push({
        date: selectedDate,
        checkIn: null,
        checkOut: null,
        hours: null,
        type,          // e.g. "Vacation", "Sick Leave", "To Be Added"
        duration,      // 1 or 0.5
        notes: dayNotes
      });

      localStorage.setItem('timeEntries', JSON.stringify(entries));

      overlay.remove();
      showAlert(`✅ ${dayTypeLabel} added for ${selectedDate}`);
      this.renderDashboard();
      this.renderTimesheet();
    });
  }

TimeTrackerApp.prototype.openAddBreakModal = function() {
    // Prevent opening multiple overlays
    const existing = document.getElementById('addBreakOverlay');
    if (existing) return;

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'addBreakOverlay';

    const today = this.formatDate(new Date());

    const content = document.createElement('div');
    content.className = 'modal-content';
    content.innerHTML = `
        <h2>Add Break</h2>
        <div class="modal-body">
        <div class="form-group">
            <label for="breakDate" class="form-label">Date</label>
            <input type="date" id="breakDate" class="form-control" value="${today}">
        </div>
        
        <div class="form-group interval-group">
            <label>Break Times</label>
            <div class="interval-inputs">
                <input type="time" id="breakStart" class="form-control" placeholder="Break Start">
                <input type="time" id="breakEnd" class="form-control" placeholder="Break End">
            </div>
        </div>
        
        <div class="form-group">
            <label for="breakNotes" class="form-label">Notes (optional)</label>
            <textarea id="breakNotes" class="form-control" placeholder="Add notes about this break (optional)" rows="3"></textarea>
        </div>
        </div>
        
        <div class="modal-actions">
        <button class="btn btn-secondary" id="cancelAddBreakBtn">Cancel</button>
        <button class="btn btn-primary" id="confirmAddBreakBtn">Add Break</button>
        </div>
    `;

    overlay.appendChild(content);
    document.body.appendChild(overlay);

    // Cancel button
    document.getElementById('cancelAddBreakBtn').addEventListener('click', () => {
      overlay.remove();
    });

    // Handle Add Break button
    document.getElementById('confirmAddBreakBtn').addEventListener('click', () => {
      const selectedDate = document.getElementById('breakDate').value;
      const breakStart = document.getElementById('breakStart').value;
      const breakEnd = document.getElementById('breakEnd').value;
      const breakNotes = document.getElementById('breakNotes').value?.trim() || '';

      if (!selectedDate) {
        showAlert('Please select a date');
        return;
      }

      if (!breakStart || !breakEnd) {
        showAlert('Please enter both break start and end times');
        return;
      }

      // Validate break end is after break start
      if (breakStart >= breakEnd) {
        showAlert('Break end time must be after start time');
        return;
      }

      const entries = JSON.parse(localStorage.getItem('timeEntries') || '[]');

      // Find entry for this date
      let entry = entries.find(e => e.date === selectedDate);

      if (!entry) {
        // No entry exists for this day - create one with just the break
        showAlert('⚠️ No check-in/out found for this date. Please add working hours first.');
        return;
      }

      // Check if entry has intervals
      if (!entry.intervals || entry.intervals.length === 0) {
        showAlert('⚠️ No working hours found for this date. Please add check-in/out times first.');
        return;
      }

      // Add break as a new interval
      entry.intervals.push({ in: breakStart, out: breakEnd });

      // Update notes if provided
      if (breakNotes) {
        entry.notes = entry.notes ? `${entry.notes}; Break: ${breakNotes}` : `Break: ${breakNotes}`;
      }

      localStorage.setItem('timeEntries', JSON.stringify(entries));

      overlay.remove();
      showAlert(`✅ Break added for ${selectedDate}`);
      this.renderDashboard();
      this.renderTimesheet();
    });
  }

TimeTrackerApp.prototype.populateTimesheetTable = function() {
  const data = this.getTimesheetData();
  const tbody = document.getElementById('timesheetTable');
  tbody.innerHTML = '';

  const sortedEntries = data.entries.sort((a, b) => {
    return new Date(a.date) - new Date(b.date);
  });

  // Totals
  let totalHoursSpent = 0;
  let totalExtraHours = 0;
  let totalExtraHoursWithFactor = 0;

  sortedEntries.forEach(entry => {
    const row = document.createElement('tr');

    let hoursSpent = 0;
    let extraHoursDisplay = 0;
    let extraHoursWithFactorDisplay = 0;
    let checkInTime = '';
    let checkOutTime = '';
    let checkInWithinDay = '';
    let checkOutWithinDay = '';
    let timeOutsideWithinDay = '-';

    // Check if day is weekend/holiday/vacation
    const dayOfWeek = new Date(entry.date).getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday
    const isSpecialDay = entry.type === 'Holiday' || entry.type === 'Vacation';
    
    // "To Be Added" uses 1.5x factor, not 2x
    const useDoubleFactor = isWeekend || isSpecialDay;

    // ✅ NEW: Check if it's a half day vacation/sick/to-be-added
    const isHalfDaySpecial = (entry.duration === 0.5) && 
                             (entry.type === 'Vacation' || entry.type === 'Sick Leave' || entry.type === 'To Be Added');
    
    // ✅ NEW: Check if it's a full day vacation/sick/to-be-added
    const isFullDaySpecial = (entry.duration === 1) && 
                             (entry.type === 'Vacation' || entry.type === 'Sick Leave' || entry.type === 'To Be Added');

    // Process intervals for ALL types if they exist
    if (entry.intervals && entry.intervals.length > 0) {
      const mainInterval = entry.intervals[0];
      checkInTime = mainInterval.in || '';
      checkOutTime = mainInterval.out || '';

      const mainIntervalComplete = mainInterval.in && mainInterval.out;

      if (mainIntervalComplete) {
        // Process breaks (if any)
        if (entry.intervals.length > 1) {
          const firstBreak = entry.intervals[1];
          if (firstBreak && firstBreak.in && firstBreak.out) {
            checkOutWithinDay = firstBreak.in;
            checkInWithinDay = firstBreak.out;

            if (checkOutWithinDay && checkInWithinDay) {
              const toMinutes = t => {
                const [h, m] = t.split(':').map(Number);
                return h * 60 + m;
              };
              const breakStart = toMinutes(checkOutWithinDay);
              const breakEnd = toMinutes(checkInWithinDay);

              const gapMinutes = Math.abs(breakEnd - breakStart);
              const gapHours = Math.floor(gapMinutes / 60);
              const gapMins = gapMinutes % 60;
              timeOutsideWithinDay = `${gapHours}:${gapMins.toString().padStart(2, '0')}`;
            }
          }
        }

        // Pass date to calculateWorkTime
        const workTime = this.calculateWorkTime(entry.intervals, entry.date);
        hoursSpent = workTime.decimal;
        const extraMinutes = workTime.extraMinutes;

        // ✅ NEW: Full Day Special (Vacation/Sick/To Be Added) - Show hours but no extra
        if (isFullDaySpecial) {
          // Show actual hours worked (neutral)
          extraHoursDisplay = 0;
          extraHoursWithFactorDisplay = 0;
        }
        // ✅ NEW: Half Day Special (Vacation/Sick/To Be Added) - 4.5h baseline
        else if (isHalfDaySpecial) {
          const halfDayBaseline = 4.5; // hours
          const actualHours = workTime.minutes / 60;
          
          if (actualHours > halfDayBaseline) {
            // Overtime beyond 4.5h with 1.5x factor
            const overtimeHours = actualHours - halfDayBaseline;
            extraHoursDisplay = +(overtimeHours.toFixed(2));
            extraHoursWithFactorDisplay = +(overtimeHours * 1.5).toFixed(2);
          } else if (actualHours < halfDayBaseline) {
            // Deficit (negative hours, no factor)
            const deficitHours = actualHours - halfDayBaseline;
            extraHoursDisplay = +(deficitHours.toFixed(2));
            extraHoursWithFactorDisplay = +(deficitHours.toFixed(2)); // No factor on deficit
          } else {
            // Exactly 4.5h
            extraHoursDisplay = 0;
            extraHoursWithFactorDisplay = 0;
          }
        }
        // Check if "Double Hours" flag is set
        else if (entry.doubleHours) {
          // Double hours mode: net hours × 2
          const netHours = workTime.minutes / 60;
          extraHoursDisplay = +(netHours.toFixed(2));
          extraHoursWithFactorDisplay = +(netHours * 2).toFixed(2);
        } else if (useDoubleFactor && entry.type !== 'Regular') {
          // On vacation/holiday worked, all worked hours are extra with 2x factor
          const allMinutes = workTime.minutes;
          const allHours = allMinutes / 60;
          
          extraHoursDisplay = +(allHours.toFixed(2));
          extraHoursWithFactorDisplay = +(allHours * 2).toFixed(2);
        } else {
          // Regular, weekend, or "To Be Added" calculation (1.5x factor)
          if (extraMinutes !== 0) {
            const extraHoursValue = extraMinutes / 60;
            extraHoursDisplay = +(extraHoursValue.toFixed(2));

            // Determine factor (1.5x for normal days, 2x for weekends)
            const factor = isWeekend ? 2 : 1.5;

            let extraHoursWithFactorValue = extraHoursValue;
            if (extraMinutes > 0) {
              extraHoursWithFactorValue = extraHoursValue * factor;
            }

            extraHoursWithFactorDisplay = +(extraHoursWithFactorValue.toFixed(2));
          }
        }

        // Totals
        totalHoursSpent += hoursSpent;
        totalExtraHours += extraHoursDisplay;
        totalExtraHoursWithFactor += extraHoursWithFactorDisplay;
      } else {
        // Incomplete intervals
        hoursSpent = '-';
        extraHoursDisplay = '-';
        extraHoursWithFactorDisplay = '-';
      }
    } else if (entry.type !== 'Regular') {
      // Non-regular days without intervals (old vacation days)
      hoursSpent = entry.hours || '-';
      if (hoursSpent !== '-') {
        totalHoursSpent += parseFloat(hoursSpent);
      }
    }

    // Display type logic
    let displayType = isWeekend ? 'Weekend' : entry.type;
    
    // Special display for "To Be Added"
    if (entry.type === 'To Be Added') {
        displayType = 'Official Holiday - To Be Added';
    }
    
    if (entry.duration === 0.5) {
      displayType += ' (Half Day)';
    }
    
    // Add visual indicator for doubled hours
    if (entry.doubleHours) {
      displayType += ' ⏱️×2';
    }

    // Format times with 12/24 hour support
    const formattedCheckIn = this.formatTimeDisplay(checkInTime);
    const formattedCheckOut = this.formatTimeDisplay(checkOutTime);
    const formattedCheckOutWithin = this.formatTimeDisplay(checkOutWithinDay);
    const formattedCheckInWithin = this.formatTimeDisplay(checkInWithinDay);

    row.innerHTML = `
      <td>${entry.date}</td>
      <td>${formattedCheckIn || '-'}</td>
      <td>${formattedCheckOut || '-'}</td>
      <td>${hoursSpent === '-' ? '-' : hoursSpent.toFixed(2) + 'h'}</td>
      <td class="hide-mobile">${extraHoursDisplay === '-' ? '-' : (extraHoursDisplay === 0 ? '-' : Number(extraHoursDisplay.toFixed(2)) + 'h')}</td>
      <td class="hide-mobile">${extraHoursWithFactorDisplay === '-' ? '-' : (extraHoursWithFactorDisplay === 0 ? '-' : Number(extraHoursWithFactorDisplay.toFixed(2)) + 'h')}</td>
      <td class="hide-mobile">${displayType}</td>
      <td class="hide-mobile">${formattedCheckOutWithin || '-'}</td>
      <td class="hide-mobile">${formattedCheckInWithin || '-'}</td>
      <td class="hide-mobile">${timeOutsideWithinDay}</td>
      <td class="actions-cell">
        <button class="btn btn-sm btn-outline action-btn"
                onclick="app.editDayEntry('${entry.date}')" title="Edit">
          ✏️ <span class="btn-text">Edit</span>
        </button>
        <button class="btn btn-sm btn-danger action-btn"
                onclick="app.deleteDayEntry('${entry.date}')" title="Delete">
          🗑️ <span class="btn-text">Delete</span>
        </button>
      </td>
    `;

    tbody.appendChild(row);
  });

  // ✅ FIXED: Totals row - Always show all columns, hide with CSS
  const totalsRow = document.createElement('tr');
  totalsRow.className = 'totals-row';
  totalsRow.innerHTML = `
    <td><strong>Total</strong></td>
    <td colspan="2"></td>
    <td><strong>${totalHoursSpent.toFixed(2)}h</strong></td>
    <td class="hide-mobile"><strong>${totalExtraHours.toFixed(2)}h</strong></td>
    <td class="hide-mobile"><strong>${totalExtraHoursWithFactor.toFixed(2)}h</strong></td>
    <td class="hide-mobile" colspan="4"></td>
    <td></td>
  `;
  tbody.appendChild(totalsRow);

  // ✅ CRITICAL FIX: Reapply detailed view state after repopulating table
  const detailedView = this.getDetailedViewState();
  this.updateTableColumns(detailedView);

  return totalExtraHoursWithFactor;
}

TimeTrackerApp.prototype.updateTimeEntry = function(date, field, value) {
  const entries = JSON.parse(localStorage.getItem('timeEntries') || '[]');
  const entry = entries.find(e => e.date === date && e.type === 'Regular');

  if (!entry || !entry.intervals || entry.intervals.length === 0) {
    return;
  }

  if (field === 'checkIn') {
    entry.intervals[0].in = value;
  } else if (field === 'checkOut') {
    entry.intervals[entry.intervals.length - 1].out = value;
  } else if (field === 'checkOutWithin') {
    if (entry.intervals.length > 0) {
      entry.intervals[0].out = value;
    }
  } else if (field === 'checkInWithin') {
    if (entry.intervals.length > 1) {
      entry.intervals[1].in = value;
    }
  }

  localStorage.setItem('timeEntries', JSON.stringify(entries));
  this.renderTimesheet();
  this.renderDashboard();
}

TimeTrackerApp.prototype.deleteDayEntry = function(date) {
  if (confirm(`Are you sure you want to delete the entry for ${date}?`)) {
    const entries = JSON.parse(localStorage.getItem('timeEntries') || '[]');
    const filtered = entries.filter(e => e.date !== date);
    localStorage.setItem('timeEntries', JSON.stringify(filtered));
    showAlert('Entry deleted!');
    this.renderTimesheet();
    this.renderDashboard();
  }
}

TimeTrackerApp.prototype.editDayEntry = function(date) {
  const entries = JSON.parse(localStorage.getItem('timeEntries') || '[]');
  const entry = entries.find(e => e.date === date);

  if (!entry) return;

  // Create modal for editing
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'editDayOverlay';

  // Separate main interval from breaks
  let mainInterval = { in: '', out: '' };
  let breaks = [];

  if (entry.intervals && entry.intervals.length > 0) {
    // First interval is the main working hours
    mainInterval = entry.intervals[0];
    // Rest are breaks
    breaks = entry.intervals.slice(1);
  }

  // Build breaks HTML
  let breaksHtml = '';
  breaks.forEach((breakTime, idx) => {
    breaksHtml += `
      <div class="form-group interval-group break-group" data-break-idx="${idx}">
        <label>Break ${idx + 1}</label>
        <div class="interval-inputs">
          <input type="time" value="${breakTime.in}" id="breakStart_${idx}" placeholder="Break Start">
          <input type="time" value="${breakTime.out}" id="breakEnd_${idx}" placeholder="Break End">
          <button type="button" class="btn btn-sm btn-danger remove-break-btn">Remove</button>
        </div>
      </div>
    `;
  });

  const content = document.createElement('div');
  content.className = 'modal-content';
  content.innerHTML = `
    <h2>Edit Day Entry - ${date}</h2>
    <div class="modal-body">
      <div class="form-group">
        <label>Type</label>
        <select id="editDayType" class="form-control">
          <option value="Regular" ${entry.type === 'Regular' ? 'selected' : ''}>Regular</option>
          <option value="Vacation" ${entry.type === 'Vacation' ? 'selected' : ''}>Vacation</option>
          <option value="Sick Leave" ${entry.type === 'Sick Leave' ? 'selected' : ''}>Sick Leave</option>
          <option value="Holiday" ${entry.type === 'Holiday' ? 'selected' : ''}>Holiday</option>
          <option value="Leave" ${entry.type === 'Leave' ? 'selected' : ''}>Leave</option>
          <option value="To Be Added" ${entry.type === 'To Be Added' ? 'selected' : ''}>To Be Added</option>
        </select>
      </div>

      <div id="mainIntervalContainer">
        <div class="form-group interval-group">
          <label>Working Hours</label>
          <div class="interval-inputs">
            <input type="time" value="${mainInterval.in}" id="mainCheckIn" placeholder="First Check-In">
            <input type="time" value="${mainInterval.out}" id="mainCheckOut" placeholder="Last Check-Out">
          </div>
        </div>
      </div>

      <div id="breaksContainer">
        ${breaksHtml}
      </div>

      <button type="button" class="btn btn-secondary" id="addBreakBtn">+ Add Break</button>

      <div class="form-group">
        <label>Notes</label>
        <textarea id="editDayNotes" class="form-control" rows="3">${entry.notes || ''}</textarea>
      </div>
      
      <div class="form-group">
        <label class="toggle-switch">
          <input type="checkbox" id="doubleHoursToggle" ${entry.doubleHours ? 'checked' : ''}>
          <span class="toggle-slider"></span>
          <span class="toggle-label">⏱️ Double Hours (Net hours × 2)</span>
        </label>
        <small style="display: block; margin-top: 4px; color: var(--color-text-secondary);">
          When enabled, all worked hours for this day will be doubled in "Extra Hours (Factor)" calculation
        </small>
      </div>
    </div>

    <div class="modal-actions">
      <button class="btn btn-secondary" id="cancelEditBtn">Cancel</button>
      <button class="btn btn-primary" id="saveEditDayBtn">Save Changes</button>
    </div>
  `;

  overlay.appendChild(content);
  document.body.appendChild(overlay);

  // Add break button
  document.getElementById('addBreakBtn').addEventListener('click', () => {
    const container = document.getElementById('breaksContainer');
    const breakCount = container.querySelectorAll('.break-group').length;
    const newBreak = document.createElement('div');
    newBreak.className = 'form-group interval-group break-group';
    newBreak.setAttribute('data-break-idx', breakCount);
    newBreak.innerHTML = `
      <label>Break ${breakCount + 1}</label>
      <div class="interval-inputs">
        <input type="time" id="breakStart_${breakCount}" placeholder="Break Start">
        <input type="time" id="breakEnd_${breakCount}" placeholder="Break End">
        <button type="button" class="btn btn-sm btn-danger remove-break-btn">Remove</button>
      </div>
    `;
    container.appendChild(newBreak);

    // Attach remove listener
    newBreak.querySelector('.remove-break-btn').addEventListener('click', () => {
      newBreak.remove();
      this.updateBreakLabels();
    });
  });

  // Remove break buttons (for existing breaks)
  document.querySelectorAll('.remove-break-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.target.closest('.break-group').remove();
      this.updateBreakLabels();
    });
  });

  // Cancel button
  document.getElementById('cancelEditBtn').addEventListener('click', () => {
    overlay.remove();
  });

  // Save edited entry
  document.getElementById('saveEditDayBtn').addEventListener('click', () => {
    const updatedType = document.getElementById('editDayType').value;
    const updatedNotes = document.getElementById('editDayNotes').value;
    const doubleHours = document.getElementById('doubleHoursToggle').checked;

    // Get main interval
    const mainIn = document.getElementById('mainCheckIn').value;
    const mainOut = document.getElementById('mainCheckOut').value;

    // ✅ REMOVED: No longer require times only for Regular type
    // Data is preserved for all types

    // Build intervals array: [main interval, ...breaks]
    const intervals = [];
    
    // ✅ CHANGED: Save intervals for ALL types if times exist
    if (mainIn && mainOut) {
      intervals.push({ in: mainIn, out: mainOut });

      // Add breaks
      document.querySelectorAll('.break-group').forEach((group) => {
        const idx = group.getAttribute('data-break-idx');
        const breakStart = document.getElementById(`breakStart_${idx}`).value;
        const breakEnd = document.getElementById(`breakEnd_${idx}`).value;
        if (breakStart && breakEnd) {
          intervals.push({ in: breakStart, out: breakEnd });
        }
      });
    }

    const entryIdx = entries.findIndex(e => e.date === date);
    entries[entryIdx] = {
      date,
      type: updatedType,
      intervals: intervals,
      notes: updatedNotes,
      hours: updatedType === 'Regular' ? null : entry.hours,
      duration: entry.duration || 1,
      doubleHours: doubleHours  // ✅ NEW: Save double hours flag
    };

    localStorage.setItem('timeEntries', JSON.stringify(entries));
    overlay.remove();
    showAlert('Entry updated!');
    this.renderTimesheet();
    this.renderDashboard();
  });
}

TimeTrackerApp.prototype.togglePeriodSection = function(section) {
  const key = section === 'past' ? 'pastPeriodsCollapsed' : 'upcomingPeriodsCollapsed';
  const currentState = localStorage.getItem(key) !== 'false';
  const newState = !currentState;
  
  localStorage.setItem(key, newState);
  this.renderSettings();
}

TimeTrackerApp.prototype.generateMonthOptions = function() {
  const periods = this.getPayPeriods();
  
  if (periods.length === 0) {
    const entries = JSON.parse(localStorage.getItem('timeEntries') || '[]');
    const uniqueMonths = new Set();
    
    entries.forEach(entry => {
      if (entry.date && entry.date.length >= 7) {
        const monthKey = entry.date.substring(0, 7);
        uniqueMonths.add(monthKey);
      }
    });
    
    const currentMonthKey = new Date().toISOString().substring(0, 7);
    uniqueMonths.add(currentMonthKey);
    
    const months = Array.from(uniqueMonths).sort().reverse();
    
    let currentMonthStr = currentMonthKey;
    if (this.currentMonth) {
      if (typeof this.currentMonth === 'string') {
        currentMonthStr = this.currentMonth.substring(0, 7);
      } else if (this.currentMonth instanceof Date && !isNaN(this.currentMonth.getTime())) {
        currentMonthStr = this.currentMonth.toISOString().substring(0, 7);
      }
    }
    
    let html = '';
    months.forEach(monthKey => {
      const parts = monthKey.split('-');
      if (parts.length !== 2) return;
      
      const year = parts[0];
      const month = parts[1];
      const date = new Date(year, parseInt(month) - 1);
      
      if (isNaN(date.getTime())) {
        return;
      }
      
      const label = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      const selected = monthKey === currentMonthStr ? 'selected' : '';
      html += '<option value="' + monthKey + '" ' + selected + '>' + label + '</option>';
    });
    
    return html;
  }
  
  const currentPeriodId = this.getCurrentPeriodId();
  let html = '';
  
  const reversedPeriods = periods.slice().reverse();
  reversedPeriods.forEach(period => {
    const selected = period.id === currentPeriodId ? 'selected' : '';
    html += '<option value="' + period.id + '" ' + selected + '>' + period.label + '</option>';
  });
  
  return html;
};

TimeTrackerApp.prototype.renderDaysDetailsContent = function(type, titleBase, emoji, selectedYear) {
    const data = this.getDaysDetailsByType(type, selectedYear);
    const availableYears = this.getAvailableYears();
    
    // Build year options
    let yearOptionsHtml = '';
    availableYears.forEach(year => {
        yearOptionsHtml += `<option value="${year}" ${year === selectedYear ? 'selected' : ''}>${year}</option>`;
    });

    // Build month sections HTML
    let monthsHtml = '';
    
    if (Object.keys(data.groupedByMonth).length === 0) {
        monthsHtml = `<p style="text-align: center; padding: 20px; color: var(--color-text-secondary);">No days recorded for this category in ${selectedYear}</p>`;
    } else {
        Object.keys(data.groupedByMonth).sort().forEach(monthKey => {
            const monthEntries = data.groupedByMonth[monthKey];
            const monthDate = new Date(monthKey + '-01');
            const monthName = monthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
            
            monthsHtml += `
                <div class="days-month-group">
                    <h3 class="days-month-header">📅 ${monthName}</h3>
                    <div class="days-list">
            `;
            
            monthEntries.forEach(entry => {
                const date = new Date(entry.date);
                const dateFormatted = date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
                const duration = entry.duration === 0.5 ? 'Half Day' : 'Full Day';
                
                // Get times if intervals exist
                let timesDisplay = '-';
                if (entry.intervals && entry.intervals.length > 0) {
                    const mainInterval = entry.intervals[0];
                    if (mainInterval.in && mainInterval.out) {
                        timesDisplay = `${this.formatTimeDisplay(mainInterval.in)} - ${this.formatTimeDisplay(mainInterval.out)}`;
                    }
                }
                
                // Display type with duration
                const typeDisplay = `${entry.type} (${duration})`;
                
                monthsHtml += `
                    <div class="day-entry">
                        <div class="day-entry-row">
                            <span class="day-date">${dateFormatted}</span>
                            <span class="day-type">${typeDisplay}</span>
                            <span class="day-times">${timesDisplay}</span>
                        </div>
                        ${entry.notes ? `<div class="day-notes">📝 ${entry.notes}</div>` : ''}
                    </div>
                `;
            });
            
            monthsHtml += `
                    </div>
                </div>
            `;
        });
    }

    return `
        <div class="modal-header">
            <h2>${emoji} ${titleBase} - ${selectedYear}</h2>
            <button class="btn-close" id="closeDaysDetailsBtn">×</button>
        </div>
        <div class="modal-body">
            <div class="days-year-selector">
                <label for="yearSelect">Year:</label>
                <select id="yearSelect" class="form-control">
                    ${yearOptionsHtml}
                </select>
            </div>
            
            <div class="days-total">
                <span class="total-label">Total:</span>
                <span class="total-value">${data.totalDays} ${data.totalDays === 1 ? 'day' : 'days'}</span>
            </div>
            
            <div class="days-details-container">
                ${monthsHtml}
            </div>
        </div>
        
        <div class="modal-actions">
            <button class="btn btn-secondary" id="closeDaysDetailsBtn2">Close</button>
        </div>
    `;
}

TimeTrackerApp.prototype.setupDaysDetailsListeners = function(overlay, type, titleBase, emoji) {
    // Close button listeners
    const closeBtn1 = document.getElementById('closeDaysDetailsBtn');
    const closeBtn2 = document.getElementById('closeDaysDetailsBtn2');
    
    if (closeBtn1) {
        closeBtn1.addEventListener('click', () => overlay.remove());
    }
    
    if (closeBtn2) {
        closeBtn2.addEventListener('click', () => overlay.remove());
    }
    
    // Close on overlay click
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.remove();
        }
    });
    
    // ✅ NEW: Year selector change listener
    const yearSelect = document.getElementById('yearSelect');
    if (yearSelect) {
        yearSelect.addEventListener('change', (e) => {
            const selectedYear = parseInt(e.target.value);
            const content = overlay.querySelector('.modal-content');
            content.innerHTML = this.renderDaysDetailsContent(type, titleBase, emoji, selectedYear);
            // Re-attach listeners after re-render
            this.setupDaysDetailsListeners(overlay, type, titleBase, emoji);
        });
    }
}

// ============================================
// PERIOD MANAGEMENT SYSTEM
// ============================================

TimeTrackerApp.prototype.updateBreakLabels = function() {
  const breakGroups = document.querySelectorAll('.break-group');
  breakGroups.forEach((group, idx) => {
    group.setAttribute('data-break-idx', idx);
    group.querySelector('label').textContent = `Break ${idx + 1}`;
    const inputs = group.querySelectorAll('input[type="time"]');
    inputs[0].id = `breakStart_${idx}`;
    inputs[1].id = `breakEnd_${idx}`;
  });
}


// TimeTracker v2.1 - Complete App Logic with Clear Data & Theme Switch

class TimeTrackerApp {
  constructor() {
    this.currentScreen = 'dashboard';
    this.currentMonth = new Date();
    this.hideSalary = localStorage.getItem('hideSalary') === 'true';
    this.theme = localStorage.getItem('theme') || 'light';
    this.initializePeriods();
    this.init();
  }

  init() {
    this.applyTheme();
    this.setupEventListeners();
    this.renderDashboard();
    this.showScreen('dashboard');
    this.hideLoadingScreen();
  }

  applyTheme() {
    if (this.theme === 'dark') {
      document.documentElement.setAttribute('data-color-scheme', 'dark');
      document.querySelector('.theme-icon').textContent = '☀️';
    } else {
      document.documentElement.setAttribute('data-color-scheme', 'light');
      document.querySelector('.theme-icon').textContent = '🌙';
    }
    localStorage.setItem('theme', this.theme);
  }

  toggleTheme() {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
    this.applyTheme();
  }

  setupEventListeners() {
    // Tab navigation
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tab = e.currentTarget.dataset.tab;
        this.showScreen(tab);
      });
    });

    // Theme toggle
    document.getElementById('themeToggle').addEventListener('click', () => {
      this.toggleTheme();
    });
  }

  showScreen(screenName) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));

    // Show selected screen
    this.currentScreen = screenName;
    const screenEl = document.getElementById(screenName + 'Screen');
    if (screenEl) {
      screenEl.classList.add('active');
    }

    // Update active tab
    const activeBtn = document.querySelector(`[data-tab="${screenName}"]`);
    if (activeBtn) {
      activeBtn.classList.add('active');
    }

    // Render content
    if (screenName === 'dashboard') {
      this.renderDashboard();
    } else if (screenName === 'timesheet') {
      this.renderTimesheet();
    } else if (screenName === 'settings') {
      this.renderSettings();
    }
  }

  getCurrentAndNextMonth() {
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

  renderDashboard() {
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

    <div class="quick-actions">
      <button class="btn btn-primary" id="checkInBtn">📍 Check In</button>
      <button class="btn btn-primary" id="checkOutBtn">📤 Check Out</button>
      <button class="btn btn-secondary" id="addSpecialDayBtn">📅 Add Day</button>
      <button class="btn btn-outline" id="viewTimesheetBtn">📊 View Hours</button>
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

  openManualTimeModal(mode) {
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
    this.showAlert('Please select a date');
    return;
  }
  if (!timeValue) {
    this.showAlert('Please enter a time');
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


  setManualTime(mode, dateStr, timeStr) {
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
      this.showAlert('⚠️ Already checked in');
      return;
    }
    entry.intervals.push({ in: timeStr, out: null });
  }

  if (mode === 'checkOut') {
    if (!lastInterval || lastInterval.out) {
      this.showAlert('⚠️ No active check-in');
      return;
    }
    lastInterval.out = timeStr;
  }

  localStorage.setItem('timeEntries', JSON.stringify(entries));
  this.renderDashboard();
}

renderTimesheet() {
  const timesheet = document.getElementById('timesheetScreen');
  const data = this.getTimesheetData();
  const use12Hour = localStorage.getItem('use12HourFormat') === 'true';

  let html = `
    <h1>Timesheet</h1>
    
    <div class="timesheet-controls">
      <div class="month-selector">
        <label>Select Period:</label>
        <select id="monthSelect">
          ${this.generateMonthOptions()}
        </select>
      </div>

      <div class="time-format-toggle">
        <label class="toggle-switch">
          <input type="checkbox" id="timeFormatToggle" ${use12Hour ? 'checked' : ''}>
          <span class="toggle-slider"></span>
          <span class="toggle-label">${use12Hour ? '12h' : '24h'}</span>
        </label>
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
            <th>Extra Hours</th>
            <th>Extra Hours <br><span style="font-size: 8px;">(xFactor)</span></th>
            <th>Type</th>
            <th>Check Out <br><span style="font-size: 8px;">(Within Day)</span></th>
            <th>Check In <br><span style="font-size: 8px;">(Within Day)</span></th>
            <th>Hours Spent Outside</th>
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

  // ✅ UPDATED: Period selector change listener
  document.getElementById('monthSelect').addEventListener('change', (e) => {
    const periods = this.getPayPeriods();
    
    if (periods.length === 0) {
      // Old month-based system
      this.currentMonth = new Date(e.target.value);
    } else {
      // New period system
      this.setCurrentPeriodId(e.target.value);
    }
    
    this.renderTimesheet();
    this.renderDashboard(); // ✅ Update dashboard when period changes
  });

  // Time format toggle
  document.getElementById('timeFormatToggle').addEventListener('change', (e) => {
    const use12Hour = e.target.checked;
    localStorage.setItem('use12HourFormat', use12Hour);
    document.querySelector('.toggle-label').textContent = use12Hour ? '12h' : '24h';
    this.populateTimesheetTable();
  });

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

attachStaticListeners() {
  // Time format toggle logic
  const toggle = document.getElementById('timeFormatToggle');
  const label = document.querySelector('.toggle-label');

  toggle.addEventListener('change', (e) => {
    const isChecked = e.target.checked;
    localStorage.setItem('use12HourFormat', isChecked);
    
    // UPDATE UI MANUALLY: This is the secret for animations!
    label.textContent = isChecked ? '12h' : '24h';
    
    // Only refresh the table, don't re-render the whole screen
    this.populateTimesheetTable(); 
  });

  // Month selector
  document.getElementById('monthSelect').addEventListener('change', (e) => {
    this.currentMonth = new Date(e.target.value);
    // Since month change might require a full refresh, we can clear and re-render
    document.getElementById('timesheetScreen').innerHTML = ""; 
    this.renderTimesheet();
  });

  document.getElementById('exportCsvBtn').addEventListener('click', () => this.exportCSV());
  document.getElementById('importCsvBtn').addEventListener('click', () => this.triggerFileInput());
}

getTimesheetTotals() {
  const data = this.getTimesheetData();
  let totalExtraHoursWithFactor = 0;

  data.entries.forEach(entry => {
    if (entry.intervals && entry.intervals.length > 0) {
      const allIntervalsComplete = entry.intervals.every(interval => interval.in && interval.out);
      
      if (!allIntervalsComplete) {
        return;
      }

      // Check if day is weekend/holiday/vacation
      const dayOfWeek = new Date(entry.date).getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const isSpecialDay = entry.type === 'Holiday' || entry.type === 'Vacation';
      const useDoubleFactor = isWeekend || isSpecialDay;

      // ✅ NEW: Check if it's a half day vacation/sick/to-be-added
      const isHalfDaySpecial = (entry.duration === 0.5) && 
                               (entry.type === 'Vacation' || entry.type === 'Sick Leave' || entry.type === 'To Be Added');
      
      // ✅ NEW: Check if it's a full day vacation/sick/to-be-added
      const isFullDaySpecial = (entry.duration === 1) && 
                               (entry.type === 'Vacation' || entry.type === 'Sick Leave' || entry.type === 'To Be Added');

      // Pass date to calculateWorkTime
      const workTime = this.calculateWorkTime(entry.intervals, entry.date);
      const extraMinutes = workTime.extraMinutes;

      // ✅ NEW: Full Day Special - No extra hours
      if (isFullDaySpecial) {
        // Do nothing, no extra hours for full day vacation/sick
      }
      // ✅ NEW: Half Day Special - 4.5h baseline
      else if (isHalfDaySpecial) {
        const halfDayBaseline = 4.5; // hours
        const actualHours = workTime.minutes / 60;
        
        if (actualHours > halfDayBaseline) {
          // Overtime beyond 4.5h with 1.5x factor
          const overtimeHours = actualHours - halfDayBaseline;
          totalExtraHoursWithFactor += +(overtimeHours * 1.5).toFixed(2);
        } else if (actualHours < halfDayBaseline) {
          // Deficit (negative hours, no factor)
          const deficitHours = actualHours - halfDayBaseline;
          totalExtraHoursWithFactor += +(deficitHours.toFixed(2));
        }
        // else exactly 4.5h, add nothing
      }
      // Check if "Double Hours" flag is set
      else if (entry.doubleHours) {
        // Double hours mode: net hours × 2
        const netHours = workTime.minutes / 60;
        totalExtraHoursWithFactor += +(netHours * 2).toFixed(2);
      } else if (useDoubleFactor && entry.type !== 'Regular') {
        // For vacation/holiday worked, ALL hours are extra
        const allHours = workTime.minutes / 60;
        totalExtraHoursWithFactor += +(allHours * 2).toFixed(2);
      } else {
        // Regular or weekend
        if (extraMinutes !== 0) {
          const extraHoursValue = extraMinutes / 60;
          
          const factor = useDoubleFactor ? 2 : 1.5;

          let extraHoursWithFactorValue = extraHoursValue;
          if (extraMinutes > 0) {
            extraHoursWithFactorValue = extraHoursValue * factor;
          }

          totalExtraHoursWithFactor += +(extraHoursWithFactorValue.toFixed(2));
        }
      }
    }
  });

  return totalExtraHoursWithFactor;
}

  renderSettings() {
    const settings = document.getElementById('settingsScreen');
    const savedSalary = localStorage.getItem('salary') || '';
    const salaryDisplay = this.hideSalary ? '' : savedSalary;
    
    // ✅ NEW: Get periods data
    const periods = this.getPayPeriods();
    const currentPeriodId = this.getCurrentPeriodId();
    
    // ✅ NEW: Build periods list HTML
    let periodsHtml = '';
    
    if (periods.length === 0) {
      periodsHtml = '<p style="text-align: center; padding: 20px; color: var(--color-text-secondary);">No pay periods defined. Add your first period below.</p>';
    } else {
      periods.forEach(period => {
        const isCurrent = period.id === currentPeriodId;
        periodsHtml += `
          <div class="period-item ${isCurrent ? 'period-current' : ''}">
            <div class="period-info">
              <span class="period-label">${period.label}</span>
              ${isCurrent ? '<span class="period-badge">Current</span>' : ''}
            </div>
            <div class="period-actions">
              ${!isCurrent ? `<button class="btn btn-sm btn-outline" onclick="app.setCurrentPeriod('${period.id}')">Set Current</button>` : ''}
              <button class="btn btn-sm btn-outline" onclick="app.openEditPeriodModal('${period.id}')">✏️ Edit</button>
              <button class="btn btn-sm btn-danger" onclick="app.confirmDeletePeriod('${period.id}')">🗑️ Delete</button>
            </div>
          </div>
        `;
      });
    }

    let html = `
      <h1>Settings</h1>
      
      <!-- ✅ NEW: Pay Period Management Section -->
      <div class="card settings-card">
        <h3>Pay Period Management</h3>
        <p class="settings-description">Define custom pay periods for your timesheet. Periods must be continuous with no gaps or overlaps.</p>
        
        <div class="periods-list">
          ${periodsHtml}
        </div>
        
        <button class="btn btn-primary" id="addPeriodBtn">+ Add Pay Period</button>
        
        ${periods.length > 0 ? '<button class="btn btn-secondary" id="assignEntriesBtn" style="margin-left: 10px;">🔄 Assign Entries to Periods</button>' : ''}
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
    
    // ✅ NEW: Period management event listeners
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
      this.showAlert('Employee information saved successfully!');
      this.renderDashboard();
    });

    // Leave form
    document.getElementById('leaveForm').addEventListener('submit', (e) => {
      e.preventDefault();
      localStorage.setItem('annualVacation', document.getElementById('annualVacation').value);
      localStorage.setItem('sickDays', document.getElementById('sickDays').value);
      this.showAlert('Leave settings saved successfully!');
      this.renderDashboard();
    });

    // Clear buttons
    document.getElementById('clearDayBtn').addEventListener('click', () => this.clearCurrentDay());
    document.getElementById('clearMonthBtn').addEventListener('click', () => this.clearCurrentMonth());
    document.getElementById('clearAllDataBtn').addEventListener('click', () => this.clearAllData());
    document.getElementById('exportCsvBtn').addEventListener('click', () => this.exportCSV());
    document.getElementById('importCsvBtn').addEventListener('click', () => this.triggerFileInput());
  }


  clearCurrentDay() {
    if (confirm('Are you sure you want to clear data for today? This cannot be undone!')) {
      const today = this.formatDate(new Date());
      const entries = JSON.parse(localStorage.getItem('timeEntries') || '[]');
      const filtered = entries.filter(e => e.date !== today);
      localStorage.setItem('timeEntries', JSON.stringify(filtered));
      this.showAlert('Today\'s data cleared!');
      this.renderTimesheet();
      this.renderDashboard();
    }
  }

  clearCurrentMonth() {
    const monthKey = this.currentMonth.toISOString().substring(0, 7);
    if (confirm(`Are you sure you want to clear all data for ${this.formatMonthYear(this.currentMonth)}? This cannot be undone!`)) {
      const entries = JSON.parse(localStorage.getItem('timeEntries') || '[]');
      const filtered = entries.filter(e => !e.date.startsWith(monthKey));
      localStorage.setItem('timeEntries', JSON.stringify(filtered));
      this.showAlert(`Data for ${this.formatMonthYear(this.currentMonth)} cleared!`);
      this.renderTimesheet();
      this.renderDashboard();
    }
  }

  clearAllData() {
    if (confirm('⚠️ WARNING: This will delete ALL data (timesheet, settings, everything)! This cannot be undone. Type "DELETE ALL" to confirm.')) {
      const confirmation = prompt('Type "DELETE ALL" to confirm:');
      if (confirmation === 'DELETE ALL') {
        localStorage.clear();
        this.showAlert('All data has been cleared!');
        this.renderSettings();
        this.renderDashboard();
      } else {
        this.showAlert('Deletion cancelled');
      }
    }
  }

  checkIn() {
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
      this.showAlert('⚠️ You are already checked in');
      return;
    }

    // Start new interval
    entry.intervals.push({ in: time, out: null });

    localStorage.setItem('timeEntries', JSON.stringify(entries));
    this.showAlert(`✅ Checked in at ${time}`);
    this.renderDashboard();
}

  checkOut() {
    const today = this.formatDate(new Date());
    const time = this.formatTime(new Date());
    const entries = JSON.parse(localStorage.getItem('timeEntries') || '[]');

    const entry = entries.find(e => e.date === today);

    if (!entry || !entry.intervals || entry.intervals.length === 0) {
        this.showAlert('⚠️ No active check-in found');
        return;
    }

    const lastInterval = entry.intervals[entry.intervals.length - 1];

    if (lastInterval.out) {
        this.showAlert('⚠️ You are already checked out');
        return;
    }

    lastInterval.out = time;

    localStorage.setItem('timeEntries', JSON.stringify(entries));
    this.showAlert(`✅ Checked out at ${time}`);
    this.renderDashboard();
    }

  openAddDayModal() {
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
        this.showAlert('Please select a day type');
        return;
      }

      if (!selectedDate) {
        this.showAlert('Please select a date');
        return;
      }

      // Convert label -> canonical type + duration
      const { type, duration } = this.parseSpecialDayLabel(dayTypeLabel);

      const entries = JSON.parse(localStorage.getItem('timeEntries') || '[]');

      // Prevent duplicates for the same day + same type
      const exists = entries.some(e => e.date === selectedDate && e.type === type && (e.duration || 1) === duration);
      if (exists) {
        this.showAlert('⚠️ This day type already exists for the selected date');
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
      this.showAlert(`✅ ${dayTypeLabel} added for ${selectedDate}`);
      this.renderDashboard();
      this.renderTimesheet();
    });
  }

  openAddBreakModal() {
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
        this.showAlert('Please select a date');
        return;
      }

      if (!breakStart || !breakEnd) {
        this.showAlert('Please enter both break start and end times');
        return;
      }

      // Validate break end is after break start
      if (breakStart >= breakEnd) {
        this.showAlert('Break end time must be after start time');
        return;
      }

      const entries = JSON.parse(localStorage.getItem('timeEntries') || '[]');

      // Find entry for this date
      let entry = entries.find(e => e.date === selectedDate);

      if (!entry) {
        // No entry exists for this day - create one with just the break
        this.showAlert('⚠️ No check-in/out found for this date. Please add working hours first.');
        return;
      }

      // Check if entry has intervals
      if (!entry.intervals || entry.intervals.length === 0) {
        this.showAlert('⚠️ No working hours found for this date. Please add check-in/out times first.');
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
      this.showAlert(`✅ Break added for ${selectedDate}`);
      this.renderDashboard();
      this.renderTimesheet();
    });
  }


populateTimesheetTable() {
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
      <td>${extraHoursDisplay === '-' ? '-' : (extraHoursDisplay === 0 ? '-' : Number(extraHoursDisplay.toFixed(2)) + 'h')}</td>
      <td>${extraHoursWithFactorDisplay === '-' ? '-' : (extraHoursWithFactorDisplay === 0 ? '-' : Number(extraHoursWithFactorDisplay.toFixed(2)) + 'h')}</td>
      <td>${displayType}</td>
      <td>${formattedCheckOutWithin || '-'}</td>
      <td>${formattedCheckInWithin || '-'}</td>
      <td>${timeOutsideWithinDay}</td>
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

  // Totals row
  const totalsRow = document.createElement('tr');
  totalsRow.className = 'totals-row';
  totalsRow.innerHTML = `
    <td><strong>Total</strong></td>
    <td colspan="2"></td>
    <td><strong>${totalHoursSpent.toFixed(2)}h</strong></td>
    <td><strong>${totalExtraHours.toFixed(2)}h</strong></td>
    <td><strong>${totalExtraHoursWithFactor.toFixed(2)}h</strong></td>
    <td colspan="4"></td>
    <td></td>
  `;
  tbody.appendChild(totalsRow);

  return totalExtraHoursWithFactor;
}


formatTimeFromDate(date) {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

formatTimeDisplay(time24) {
  if (!time24 || time24 === '-') return '-';
  
  const use12Hour = localStorage.getItem('use12HourFormat') === 'true';
  
  if (!use12Hour) {
    // 24-hour format (no change)
    return time24;
  }

  // Convert to 12-hour format
  const [hours, minutes] = time24.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12; // Convert 0 to 12, 13 to 1, etc.
  
  return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
}

updateTimeEntry(date, field, value) {
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


deleteDayEntry(date) {
  if (confirm(`Are you sure you want to delete the entry for ${date}?`)) {
    const entries = JSON.parse(localStorage.getItem('timeEntries') || '[]');
    const filtered = entries.filter(e => e.date !== date);
    localStorage.setItem('timeEntries', JSON.stringify(filtered));
    this.showAlert('Entry deleted!');
    this.renderTimesheet();
    this.renderDashboard();
  }
}

editDayEntry(date) {
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
    this.showAlert('Entry updated!');
    this.renderTimesheet();
    this.renderDashboard();
  });
}

openAddDayModal() {
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
            <option value="Vacation (Half Day - AM)">Vacation (Half Day - AM)</option>
            <option value="Vacation (Half Day - PM)">Vacation (Half Day - PM)</option>
            <option value="Sick Leave (Full Day)">Sick Leave (Full Day)</option>
            <option value="Sick Leave (Half Day - AM)">Sick Leave (Half Day - AM)</option>
            <option value="Sick Leave (Half Day - PM)">Sick Leave (Half Day - PM)</option>
            <option value="Holiday (Full Day)">Holiday (Full Day)</option>
            <option value="Leave (Full Day)">Leave (Full Day)</option>
            <option value="To Be Added (Full Day)">To Be Added (Full Day)</option>
            </select>
        </div>
        
        <div class="form-group">
            <label for="dayDate" class="form-label">Date</label>
            <input type="date" id="dayDate" class="form-control" value="${today}">
        </div>
        
        <!-- ✅ NEW: Time entry section for "To Be Added" -->
        <div id="timeEntrySection" style="display: none;">
            <div class="form-group interval-group">
                <label>Working Hours</label>
                <div class="interval-inputs">
                    <input type="time" id="toBeAddedCheckIn" placeholder="Check In">
                    <input type="time" id="toBeAddedCheckOut" placeholder="Check Out">
                </div>
            </div>
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

    // ✅ NEW: Show/hide time entry based on selection
    const dayTypeSelect = document.getElementById('dayType');
    const timeEntrySection = document.getElementById('timeEntrySection');
    
    dayTypeSelect.addEventListener('change', (e) => {
        const isToBeAdded = e.target.value.includes('To Be Added');
        timeEntrySection.style.display = isToBeAdded ? 'block' : 'none';
    });

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
        this.showAlert('Please select a day type');
        return;
      }

      if (!selectedDate) {
        this.showAlert('Please select a date');
        return;
      }

      // Convert label -> canonical type + duration
      const { type, duration } = this.parseSpecialDayLabel(dayTypeLabel);

      const entries = JSON.parse(localStorage.getItem('timeEntries') || '[]');

      // Prevent duplicates for the same day + same type
      const exists = entries.some(e => e.date === selectedDate && e.type === type && (e.duration || 1) === duration);
      if (exists) {
        this.showAlert('⚠️ This day type already exists for the selected date');
        return;
      }

      // ✅ NEW: For "To Be Added", include time intervals
      let intervals = [];
      if (type === 'To Be Added') {
          const checkIn = document.getElementById('toBeAddedCheckIn').value;
          const checkOut = document.getElementById('toBeAddedCheckOut').value;
          
          if (!checkIn || !checkOut) {
              this.showAlert('Please enter both check-in and check-out times for "To Be Added" days');
              return;
          }
          
          intervals.push({ in: checkIn, out: checkOut });
      }

      entries.push({
        date: selectedDate,
        checkIn: null,
        checkOut: null,
        hours: null,
        type,          // e.g. "Vacation", "Sick Leave", "To Be Added"
        duration,      // 1 or 0.5
        intervals: intervals.length > 0 ? intervals : undefined,  // ✅ NEW: Add intervals
        notes: dayNotes
      });

      localStorage.setItem('timeEntries', JSON.stringify(entries));

      overlay.remove();
      this.showAlert(`✅ ${dayTypeLabel} added for ${selectedDate}`);
      this.renderDashboard();
      this.renderTimesheet();
    });
  }

// Helper function to update break labels after removal
updateBreakLabels() {
  const breakGroups = document.querySelectorAll('.break-group');
  breakGroups.forEach((group, idx) => {
    group.setAttribute('data-break-idx', idx);
    group.querySelector('label').textContent = `Break ${idx + 1}`;
    const inputs = group.querySelectorAll('input[type="time"]');
    inputs[0].id = `breakStart_${idx}`;
    inputs[1].id = `breakEnd_${idx}`;
  });
}

calculateWorkTime(intervals, date) {
    if (!intervals || intervals.length === 0) {
        return { minutes: 0, decimal: 0, display: "0:00", extraMinutes: 0 };
    }

    const toMinutes = t => {
        if (!t || t.trim() === '') {
            return 0;
        }
        const [h, m] = t.split(':').map(Number);
        return h * 60 + m;
    };

    // Filter out intervals with missing check-in or check-out times
    intervals = intervals.filter(interval => interval.in && interval.out);
    
    if (intervals.length === 0) {
        return { minutes: 0, decimal: 0, display: "0:00", extraMinutes: 0 };
    }

    // NEW LOGIC: First interval is main working hours, rest are breaks
    const mainInterval = intervals[0];
    const firstIn = toMinutes(mainInterval.in);
    const lastOut = toMinutes(mainInterval.out);

    // Calculate gross hours (main interval span)
    const grossMinutes = lastOut - firstIn;

    // Permitted break window
    const ALLOWED_START = 13 * 60;     // 13:00
    const ALLOWED_END = 13 * 60 + 30;  // 13:30

    let deductedBreakMinutes = 0;

    // Process breaks (intervals 1+)
    for (let i = 1; i < intervals.length; i++) {
        const breakInterval = intervals[i];
        const breakStart = toMinutes(breakInterval.in);
        const breakEnd = toMinutes(breakInterval.out);
        
        const breakDuration = breakEnd - breakStart;

        // Check if break falls within allowed window
        const isAllowedBreak =
            breakStart >= ALLOWED_START &&
            breakStart <= ALLOWED_END &&
            breakEnd >= ALLOWED_START &&
            breakEnd <= ALLOWED_END;

        // Only deduct breaks outside the allowed window
        if (!isAllowedBreak) {
            deductedBreakMinutes += breakDuration;
        }
    }

    // Net working minutes
    const netMinutes = Math.max(0, grossMinutes - deductedBreakMinutes);

    const hours = Math.floor(netMinutes / 60);
    const minutes = netMinutes % 60;
    
    // ✅ NEW: Check if weekend/holiday/vacation - standard hours = 0 for these days
    let standardMinutes = 540; // Default 9 hours
    
    if (date) {
        const dayOfWeek = new Date(date).getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday
        
        if (isWeekend) {
            standardMinutes = 0; // ALL hours on weekend are extra
        }
    }
    
    const extraMinutes = netMinutes - standardMinutes;

    return {
        minutes: netMinutes,
        decimal: +(netMinutes / 60).toFixed(2),
        display: `${hours}:${minutes.toString().padStart(2, '0')}`,
        extraMinutes
    };
}


  getTimesheetData() {
  const entries = JSON.parse(localStorage.getItem('timeEntries') || '[]');
  const period = this.getCurrentPeriod();
  
  if (!period) {
    // Fallback to old month-based filtering
    const monthKey = this.currentMonth.toISOString().substring(0, 7);
    const monthEntries = entries.filter(e => e.date && e.date.startsWith(monthKey));
    
    let totalHours = 0;
    monthEntries.forEach(e => {
      if (e.checkIn && e.checkOut && e.type === 'Regular') {
        const [hI, mI] = e.checkIn.split(':');
        const [hO, mO] = e.checkOut.split(':');
        const inMinutes = parseInt(hI) * 60 + parseInt(mI);
        const outMinutes = parseInt(hO) * 60 + parseInt(mO);
        const diffMinutes = Math.max(0, outMinutes - inMinutes);
        e.hours = (diffMinutes / 60).toFixed(2);
        totalHours += parseFloat(e.hours);
      }
    });
    
    return {
      entries: monthEntries,
      totalHours: totalHours.toFixed(2)
    };
  }
  
  // Filter by period date range
  const periodEntries = entries.filter(e => 
    e.date && e.date >= period.start && e.date <= period.end
  );
  
  let totalHours = 0;
  periodEntries.forEach(e => {
    if (e.checkIn && e.checkOut && e.type === 'Regular') {
      const [hI, mI] = e.checkIn.split(':');
      const [hO, mO] = e.checkOut.split(':');
      const inMinutes = parseInt(hI) * 60 + parseInt(mI);
      const outMinutes = parseInt(hO) * 60 + parseInt(mO);
      const diffMinutes = Math.max(0, outMinutes - inMinutes);
      e.hours = (diffMinutes / 60).toFixed(2);
      totalHours += parseFloat(e.hours);
    }
  });
  
  return {
    entries: periodEntries,
    totalHours: totalHours.toFixed(2)
  };
}

  getEmployeeData() {
    return {
      name: localStorage.getItem('fullName') || 'Enter Employee Name in Settings Tab...',
      salary: parseInt(localStorage.getItem('salary') || '0')
    };
  }

  getVacationData() {
    const annual = parseFloat(localStorage.getItem('annualVacation') || '10');
    const sickTotal = parseFloat(localStorage.getItem('sickDays') || '7');
    const entries = JSON.parse(localStorage.getItem('timeEntries') || '[]');
    
    // ✅ NEW: Get current year
    const currentYear = new Date().getFullYear().toString();

    // ✅ CHANGED: Filter by current year only
    const vacationUsed = entries
      .filter(e => e.type === 'Vacation' && e.date.startsWith(currentYear))
      .reduce((sum, e) => sum + (parseFloat(e.duration) || 1), 0);

    const sickUsed = entries
      .filter(e => e.type === 'Sick Leave' && e.date.startsWith(currentYear))
      .reduce((sum, e) => sum + (parseFloat(e.duration) || 1), 0);

    // ✅ NEW: Count "To Be Added" for current year
    const toBeAddedCount = entries
      .filter(e => e.type === 'To Be Added' && e.date.startsWith(currentYear))
      .reduce((sum, e) => sum + (parseFloat(e.duration) || 1), 0);

    const currentBalance = Math.max(0, annual - vacationUsed + toBeAddedCount);
    const sickRemaining = Math.max(0, sickTotal - sickUsed);

    return {
      officialBalance: annual,
      takenDays: vacationUsed,
      toBeAdded: toBeAddedCount,
      currentBalance: currentBalance,
      sickDaysBalance: sickRemaining,
      daysUsed: sickUsed
    };
  }



  exportCSV() {
    const data = this.getTimesheetData();
    let csv = 'Date,Check In,Check Out,Hours,Type\n';

    data.entries.forEach(e => {
      csv += `${e.date},${e.checkIn || '-'},${e.checkOut || '-'},${e.hours || '0'},${e.type}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `timesheet-${this.currentMonth.toISOString().substring(0, 7)}.csv`;
    a.click();
    this.showAlert('✅ CSV exported successfully');
  }

  triggerFileInput() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = (e) => this.importCSV(e.target.files[0]);
    input.click();
  }

  importCSV(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const csv = e.target.result;
      const lines = csv.split('\n').filter(l => l.trim());
      const entries = JSON.parse(localStorage.getItem('timeEntries') || '[]');

      for (let i = 1; i < lines.length; i++) {
        const [date, checkIn, checkOut, hours, type] = lines[i].split(',');
        if (date && date.trim()) {
          entries.push({
            date: date.trim(),
            checkIn: checkIn?.trim() || null,
            checkOut: checkOut?.trim() || null,
            type: type?.trim() || 'Regular'
          });
        }
      }

      localStorage.setItem('timeEntries', JSON.stringify(entries));
      this.showAlert('✅ CSV imported successfully');
      this.renderTimesheet();
      this.renderDashboard();
    };
    reader.readAsText(file);
  }

  generateMonthOptions() {
  const periods = this.getPayPeriods();
  
  if (periods.length === 0) {
    // Fallback to old month-based system
    const entries = JSON.parse(localStorage.getItem('timeEntries') || '[]');
    const uniqueMonths = new Set();
    entries.forEach(entry => {
      const monthKey = entry.date.substring(0, 7);
      uniqueMonths.add(monthKey);
    });
    
    const currentMonthKey = new Date().toISOString().substring(0, 7);
    uniqueMonths.add(currentMonthKey);
    
    const months = Array.from(uniqueMonths).sort().reverse();
    
    let html = '';
    months.forEach(monthKey => {
      const [year, month] = monthKey.split('-');
      const date = new Date(year, parseInt(month) - 1);
      const label = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      const selected = monthKey === this.currentMonth.toISOString().substring(0, 7) ? 'selected' : '';
      html += `<option value="${monthKey}" ${selected}>${label}</option>`;
    });
    
    return html;
  }
  
  // Generate period options (newest first)
  const currentPeriodId = this.getCurrentPeriodId();
  let html = '';
  
  [...periods].reverse().forEach(period => {
    const selected = period.id === currentPeriodId ? 'selected' : '';
    html += `<option value="${period.id}" ${selected}>${period.label}</option>`;
  });
  
  return html;
}

  parseSpecialDayLabel(label) {
    // Duration
    const duration = label.includes('Half Day') ? 0.5 : 1;

    // Canonical type mapping
    if (label.includes('Vacation')) return { type: 'Vacation', duration };
    if (label.includes('Sick Leave')) return { type: 'Sick Leave', duration };
    if (label.includes('Holiday')) return { type: 'Holiday', duration };
    if (label.includes('Leave')) return { type: 'Leave', duration };
    if (label.includes('To Be Added')) return { type: 'To Be Added', duration };

    // Fallback
    return { type: 'Leave', duration };
  }

  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  formatTime(date) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  formatMonthYear(date) {
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  }

  showAlert(message) {
    const alert = document.createElement('div');
    alert.className = 'alert';
    alert.textContent = message;
    document.body.appendChild(alert);
    setTimeout(() => alert.remove(), 3000);
  }

  hideLoadingScreen() {
    const loading = document.getElementById('loadingScreen');
    const container = document.getElementById('appContainer');
    if (loading) loading.remove();
    if (container) container.style.display = 'block';
  }

  getDaysDetailsByType(type, year = new Date().getFullYear()) {
    const entries = JSON.parse(localStorage.getItem('timeEntries') || '[]');
    
    // Filter entries by type and year
    let filteredEntries = [];
    
    if (type === 'vacation') {
        filteredEntries = entries.filter(e => 
            e.type === 'Vacation' && 
            e.date.startsWith(year.toString())
        );
    } else if (type === 'toBeAdded') {
        filteredEntries = entries.filter(e => 
            e.type === 'To Be Added' && 
            e.date.startsWith(year.toString())
        );
    } else if (type === 'sick') {
        filteredEntries = entries.filter(e => 
            e.type === 'Sick Leave' && 
            e.date.startsWith(year.toString())
        );
    }
    
    // Sort by date (oldest first)
    filteredEntries.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Calculate total days
    const totalDays = filteredEntries.reduce((sum, e) => sum + (parseFloat(e.duration) || 1), 0);
    
    // Group by month
    const groupedByMonth = {};
    filteredEntries.forEach(entry => {
        const monthKey = entry.date.substring(0, 7); // YYYY-MM
        if (!groupedByMonth[monthKey]) {
            groupedByMonth[monthKey] = [];
        }
        groupedByMonth[monthKey].push(entry);
    });
    
    return {
        entries: filteredEntries,
        totalDays,
        groupedByMonth
    };
}

getAvailableYears() {
    const entries = JSON.parse(localStorage.getItem('timeEntries') || '[]');
    const years = new Set();
    
    // Extract years from all entries
    entries.forEach(entry => {
        if (entry.date) {
            const year = parseInt(entry.date.substring(0, 4));
            years.add(year);
        }
    });
    
    // Always include current year even if no data
    const currentYear = new Date().getFullYear();
    years.add(currentYear);
    
    // Convert to sorted array (newest first)
    return Array.from(years).sort((a, b) => b - a);
}


openDaysDetailsModal(type, initialYear = new Date().getFullYear()) {
    // Prevent opening multiple overlays
    const existing = document.getElementById('daysDetailsOverlay');
    if (existing) return;

    // Determine title and emoji based on type
    let titleBase = '';
    let emoji = '';
    
    if (type === 'vacation') {
        titleBase = 'Vacation Days Taken';
        emoji = '🏖️';
    } else if (type === 'toBeAdded') {
        titleBase = 'Days To Be Added';
        emoji = '➕';
    } else if (type === 'sick') {
        titleBase = 'Sick Days Used';
        emoji = '🏥';
    }

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'daysDetailsOverlay';

    const content = document.createElement('div');
    content.className = 'modal-content modal-days-details';
    
    // Initial render
    content.innerHTML = this.renderDaysDetailsContent(type, titleBase, emoji, initialYear);

    overlay.appendChild(content);
    document.body.appendChild(overlay);

    // Setup event listeners
    this.setupDaysDetailsListeners(overlay, type, titleBase, emoji);
}

renderDaysDetailsContent(type, titleBase, emoji, selectedYear) {
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

setupDaysDetailsListeners(overlay, type, titleBase, emoji) {
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

initializePeriods() {
  const periods = localStorage.getItem('payPeriods');
  if (!periods) {
    // Initialize with empty array
    localStorage.setItem('payPeriods', JSON.stringify([]));
    localStorage.setItem('currentPeriodId', '');
  }
}

getPayPeriods() {
  return JSON.parse(localStorage.getItem('payPeriods') || '[]');
}

savePayPeriods(periods) {
  localStorage.setItem('payPeriods', JSON.stringify(periods));
}

getCurrentPeriodId() {
  return localStorage.getItem('currentPeriodId') || '';
}

setCurrentPeriodId(periodId) {
  localStorage.setItem('currentPeriodId', periodId);
}

getCurrentPeriod() {
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

setCurrentPeriod(periodId) {
  this.setCurrentPeriodId(periodId);
  this.showAlert('✅ Current period updated');
  this.renderSettings();
  this.renderDashboard();
  this.renderTimesheet();
}

confirmDeletePeriod(periodId) {
  if (confirm('Are you sure you want to delete this pay period? This action cannot be undone.')) {
    this.deletePayPeriod(periodId);
    this.showAlert('✅ Period deleted');
    this.renderSettings();
    this.renderDashboard();
    this.renderTimesheet();
  }
}

openAddPeriodModal() {
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
      this.showAlert('Please select both start and end dates');
      return;
    }
    
    if (this.addPayPeriod(start, end)) {
      overlay.remove();
      this.showAlert('✅ Pay period added');
      this.renderSettings();
      this.renderDashboard();
      this.renderTimesheet();
    }
  });
}

openEditPeriodModal(periodId) {
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
      this.showAlert('Please select both start and end dates');
      return;
    }
    
    if (this.editPayPeriod(periodId, start, end)) {
      overlay.remove();
      this.showAlert('✅ Pay period updated');
      this.renderSettings();
      this.renderDashboard();
      this.renderTimesheet();
    }
  });
}


getPeriodForDate(date) {
  const periods = this.getPayPeriods();
  return periods.find(p => p.start <= date && p.end >= date) || null;
}

generatePeriodLabel(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const startDay = start.getDate();
  const startMonth = start.toLocaleDateString('en-US', { month: 'short' });
  const startYear = start.getFullYear();
  
  const endDay = end.getDate();
  const endMonth = end.toLocaleDateString('en-US', { month: 'short' });
  const endYear = end.getFullYear();
  
  if (startYear === endYear) {
    return `${startDay} ${startMonth} - ${endDay} ${endMonth} ${startYear}`;
  } else {
    return `${startDay} ${startMonth} ${startYear} - ${endDay} ${endMonth} ${endYear}`;
  }
}

validatePeriod(start, end, excludeId = null) {
  const periods = this.getPayPeriods().filter(p => p.id !== excludeId);
  
  // Check if start is before end
  if (start >= end) {
    return { valid: false, message: 'End date must be after start date' };
  }
  
  // Check for overlaps or gaps
  for (const period of periods) {
    // Check overlap
    if ((start >= period.start && start <= period.end) ||
        (end >= period.start && end <= period.end) ||
        (start <= period.start && end >= period.end)) {
      return { valid: false, message: `Period overlaps with existing period: ${period.label}` };
    }
    
    // Check for gaps (periods should be continuous)
    const nextDay = (date) => {
      const d = new Date(date);
      d.setDate(d.getDate() + 1);
      return this.formatDate(d);
    };
    
    const prevDay = (date) => {
      const d = new Date(date);
      d.setDate(d.getDate() - 1);
      return this.formatDate(d);
    };
    
    // If new period ends day before existing starts, or starts day after existing ends, it's valid
    if (nextDay(end) === period.start || prevDay(start) === period.end) {
      continue; // Adjacent periods are OK
    }
    
    // Check if there's a gap
    if (end < period.start) {
      const dayAfterEnd = nextDay(end);
      if (dayAfterEnd < period.start) {
        return { valid: false, message: `Gap detected between ${end} and ${period.start}` };
      }
    }
    
    if (start > period.end) {
      const dayBeforeStart = prevDay(start);
      if (dayBeforeStart > period.end) {
        return { valid: false, message: `Gap detected between ${period.end} and ${start}` };
      }
    }
  }
  
  return { valid: true };
}

addPayPeriod(start, end) {
  const validation = this.validatePeriod(start, end);
  if (!validation.valid) {
    this.showAlert(`❌ ${validation.message}`);
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

editPayPeriod(periodId, start, end) {
  const validation = this.validatePeriod(start, end, periodId);
  if (!validation.valid) {
    this.showAlert(`❌ ${validation.message}`);
    return false;
  }
  
  const periods = this.getPayPeriods();
  const period = periods.find(p => p.id === periodId);
  
  if (!period) {
    this.showAlert('❌ Period not found');
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

deletePayPeriod(periodId) {
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

assignEntriesToPeriods() {
  const entries = JSON.parse(localStorage.getItem('timeEntries') || '[]');
  const periods = this.getPayPeriods();
  
  if (periods.length === 0) {
    this.showAlert('⚠️ No periods defined. Please add periods first.');
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
  
  this.showAlert(`✅ Assigned ${assigned} entries to periods. ${unassigned} entries outside defined periods.`);
}


}

// Initialize app
let app;
document.addEventListener('DOMContentLoaded', () => {
  app = new TimeTrackerApp();
});




// function __test_calculateWorkTime(intervals) {
//     if (!intervals || intervals.length === 0) {
//         return { minutes: 0, decimal: 0, display: "0:00" };
//     }

//     const toMinutes = t => {
//         const [h, m] = t.split(':').map(Number);
//         return h * 60 + m;
//     };

//     // Sort intervals just in case
//     intervals = intervals.slice().sort((a, b) => a.in.localeCompare(b.in));

//     const firstIn = toMinutes(intervals[0].in);
//     const lastOut = toMinutes(intervals[intervals.length - 1].out);

//     // Permitted break window
    
//     const ALLOWED_START = 13 * 60;     // 13:00
//     const ALLOWED_END = 13 * 60 + 30;  // 13:30

//     let deductedBreakMinutes = 0;

//     for (let i = 0; i < intervals.length - 1; i++) {
//         const out = toMinutes(intervals[i].out);
//         const nextIn = toMinutes(intervals[i + 1].in);

//         if (nextIn <= out) continue; // no gap

//         const gapDuration = nextIn - out;

//         let gapStart = out;
//         let gapEnd = nextIn;

//         const isAllowedGap =
//             out >= ALLOWED_START &&
//             out <= ALLOWED_END &&
//             nextIn >= ALLOWED_START &&
//             nextIn <= ALLOWED_END;

//         if (!isAllowedGap) {
//             deductedBreakMinutes += gapDuration;
//         }

//         // Overlap with allowed window
//         let allowedOverlap = 0;
//         allowedOverlap = Math.max(0, Math.min(gapEnd, ALLOWED_END) - Math.max(gapStart, ALLOWED_START));        
//     }
    

//     const totalSpan = lastOut - firstIn;
//     const netMinutes = Math.max(0, totalSpan - deductedBreakMinutes);

//     const hours = Math.floor(netMinutes / 60);
//     const minutes = netMinutes % 60;  

//     let extraMinutes = 0;

//     if(netMinutes > 540) {
//         extraMinutes = netMinutes - 540;
//     } else if (netMinutes < 540) {
//         extraMinutes = 540 - netMinutes;
//     }
//     console.log(extraMinutes);
//     return {
//         minutes: netMinutes,
//         decimal: +(netMinutes / 60).toFixed(2),
//         display: `${hours}:${minutes.toString().padStart(2, '0')}`,
//         extraMinutes: netMinutes > 540 ? `${extraMinutes}` : netMinutes < 540 ? `-${extraMinutes}` : "0"
//     };
// }
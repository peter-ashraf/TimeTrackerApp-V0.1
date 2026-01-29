// TimeTracker v2.1 - Complete App Logic with Clear Data & Theme Switch

class TimeTrackerApp {
  constructor() {
    this.currentScreen = 'dashboard';
    this.currentMonth = new Date();
    this.hideSalary = localStorage.getItem('hideSalary') === 'true';
    this.theme = localStorage.getItem('theme') || 'light';
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
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]; 
    const today = new Date(); 
    const currentMonthIndex = today.getMonth(); 
    const nextMonthIndex = (currentMonthIndex + 1) % 12; 
    const currentMonth = months[currentMonthIndex]; const nextMonth = months[nextMonthIndex]; 
    return `${currentMonth}-${nextMonth}`
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
    const totalSalary = employee.salary + overtimeIntoMoney;
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
        <p>Total Salary: <span class="salary-amount">${this.hideSalary ? '••••••' : totalSalary.toLocaleString()} L.E.</span></p>
      </div>

      
    </div>

    <div class="manual-time-actions">
      <button class="btn btn-secondary" id="manualCheckInBtn">✍️ Manual In</button>
      <button class="btn btn-secondary" id="manualCheckOutBtn">✍️ Manual Out</button>
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
  document.getElementById('manualCheckInBtn').addEventListener('click', () => this.openManualTimeModal('checkIn'));
  document.getElementById('manualCheckOutBtn').addEventListener('click', () => this.openManualTimeModal('checkOut'));

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

    // close on overlay click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.remove();
    });

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

      this.setManualTime(mode, selectedDate, timeValue);
      overlay.remove();
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

  let html = `
    <h1>Timesheet</h1>
    
    <div class="month-selector">
      <label>Select Month:</label>
      <select id="monthSelect">
        ${this.generateMonthOptions()}
      </select>
    </div>

    <div class="quick-actions">
      <button class="btn btn-secondary" id="exportCsvBtn">📥 Export CSV</button>
      <button class="btn btn-outline" id="importCsvBtn">📤 Import CSV</button>
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

  document.getElementById('monthSelect').addEventListener('change', (e) => {
    this.currentMonth = new Date(e.target.value);
    this.renderTimesheet();
  });

  document.getElementById('exportCsvBtn').addEventListener('click', () => this.exportCSV());
  document.getElementById('importCsvBtn').addEventListener('click', () => this.triggerFileInput());
}

getTimesheetTotals() {
  const data = this.getTimesheetData();
  let totalExtraHoursWithFactor = 0;

  data.entries.forEach(entry => {
    if (entry.type === 'Regular' && entry.intervals && entry.intervals.length > 0) {
      const workTime = this.calculateWorkTime(entry.intervals);
      const extraMinutes = workTime.extraMinutes;

      if (extraMinutes !== 0) {
        const extraHoursValue = extraMinutes / 60;
        
        const dayOfWeek = new Date(entry.date).getDay();
        const isSaturday = dayOfWeek === 6;
        const isSunday = dayOfWeek === 0;
        const factor = (isSaturday || isSunday) ? 2 : 1.5;

        let extraHoursWithFactorValue = extraHoursValue;
        if (extraMinutes > 0) {
          extraHoursWithFactorValue = extraHoursValue * factor;
        }

        totalExtraHoursWithFactor += +(extraHoursWithFactorValue.toFixed(2));
      }
    }
  });

  return totalExtraHoursWithFactor;
}

  renderSettings() {
    const settings = document.getElementById('settingsScreen');
    const savedSalary = localStorage.getItem('salary') || '';
    const salaryDisplay = this.hideSalary ? '' : savedSalary;

    let html = `
      <h1>Settings</h1>

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
            <input type="number" id="annualVacation" value="${localStorage.getItem('annualVacation') || '21'}" placeholder="Annual vacation days">
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
      </div>
    `;

    settings.innerHTML = html;

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
            </select>
        </div>
        
        <div class="form-group">
            <label for="dayNotes" class="form-label">Notes (optional)</label>
            <textarea id="dayNotes" class="form-control" placeholder="Add notes (optional)" rows="3"></textarea>
        </div>
        </div>
        
        <div class="modal-actions">
        <button class="btn btn-secondary" onclick="document.getElementById('addDayOverlay').remove()">Cancel</button>
        <button class="btn btn-primary" id="confirmAddDayBtn">Add Day</button>
        </div>
    `;

    overlay.appendChild(content);
    document.body.appendChild(overlay);

    // Handle Add Day button
    document.getElementById('confirmAddDayBtn').addEventListener('click', () => {
      const dayTypeLabel = document.getElementById('dayType').value;
      const dayNotes = document.getElementById('dayNotes').value?.trim() || '';

      if (!dayTypeLabel) {
        this.showAlert('Please select a day type');
        return;
      }

      // Convert label -> canonical type + duration
      const { type, duration } = this.parseSpecialDayLabel(dayTypeLabel);

      const entries = JSON.parse(localStorage.getItem('timeEntries') || '[]');
      const today = this.formatDate(new Date());

      // Prevent duplicates for the same day + same type
      const exists = entries.some(e => e.date === today && e.type === type && (e.duration || 1) === duration);
      if (exists) {
        this.showAlert('⚠️ This day type already exists for today');
        return;
      }

      entries.push({
        date: today,
        checkIn: null,
        checkOut: null,
        hours: null,
        type,          // e.g. "Vacation", "Sick Leave"
        duration,      // 1 or 0.5
        notes: dayNotes
      });

      localStorage.setItem('timeEntries', JSON.stringify(entries));

      document.getElementById('addDayOverlay').remove();
      this.showAlert(`✅ ${dayTypeLabel} added`);
      this.renderDashboard();
      // Optional: refresh timesheet if user is there later
    });

    // Close on overlay click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.remove();
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
    let extraHoursDisplay = 0;            // can be negative
    let extraHoursWithFactorDisplay = 0;  // can be negative
    let checkInTime = '';
    let checkOutTime = '';
    let checkInWithinDay = '';
    let checkOutWithinDay = '';
    let timeOutsideWithinDay = '-';

    if (entry.type === 'Regular' && entry.intervals && entry.intervals.length > 0) {
      // First check‑in and last check‑out
      checkInTime = entry.intervals[0].in || '';
      checkOutTime = entry.intervals[entry.intervals.length - 1].out || '';

      // Break / within-day info
      if (entry.intervals.length > 1) {
        checkOutWithinDay = entry.intervals[0].out || '';
        checkInWithinDay = entry.intervals[1].in || '';

        if (checkOutWithinDay && checkInWithinDay) {
          const toMinutes = t => {
            const [h, m] = t.split(':').map(Number);
            return h * 60 + m;
          };
          const checkOutMin = toMinutes(checkOutWithinDay);
          const checkInMin = toMinutes(checkInWithinDay);

          const gapMinutes = Math.abs(checkInMin - checkOutMin);
          const gapHours = Math.floor(gapMinutes / 60);
          const gapMins = gapMinutes % 60;
          timeOutsideWithinDay = `${gapHours}:${gapMins.toString().padStart(2, '0')}`;
        }
      }

      // Main work time calculation
      const workTime = this.calculateWorkTime(entry.intervals);
      hoursSpent = workTime.decimal;           // total hours (e.g. 8.75)
      const extraMinutes = workTime.extraMinutes; // number, +ve overtime, -ve shortage

      // Convert extra minutes to hours, including negative
      if (extraMinutes !== 0) {
        const extraHoursValue = extraMinutes / 60; // e.g. 0.83 or -0.75
        extraHoursDisplay = +(extraHoursValue.toFixed(2));

        // Factor: only for positive overtime
        const dayOfWeek = new Date(entry.date).getDay(); // 0=Sun,6=Sat
        const isSaturday = dayOfWeek === 6;
        const isSunday = dayOfWeek === 0;
        const factor = (isSaturday || isSunday) ? 2 : 1.5;

        let extraHoursWithFactorValue = extraHoursValue;
        if (extraMinutes > 0) {
          extraHoursWithFactorValue = extraHoursValue * factor;
        }

        extraHoursWithFactorDisplay = +(extraHoursWithFactorValue.toFixed(2));
      }

      // Totals (can be negative)
      totalHoursSpent += hoursSpent;
      totalExtraHours += extraHoursDisplay;
      totalExtraHoursWithFactor += extraHoursWithFactorDisplay;
    } else {
      // Non-regular days: keep existing behaviour
      hoursSpent = entry.hours || '-';
      if (hoursSpent !== '-') {
        totalHoursSpent += parseFloat(hoursSpent);
      }
    }

    // Display type
    let displayType = entry.type;
    if (entry.duration === 0.5) {
      displayType += ' (Half Day)';
    }

    row.innerHTML = `
      <td>${entry.date}</td>
      <td>${checkInTime || '-'}</td>
      <td>${checkOutTime || '-'}</td>
      <td>${hoursSpent === '-' ? '-' : hoursSpent.toFixed(2) + 'h'}</td>
      <td>${extraHoursDisplay === 0 ? '-' : extraHoursDisplay.toFixed(2) + 'h'}</td>
      <td>${extraHoursWithFactorDisplay === 0 ? '-' : extraHoursWithFactorDisplay.toFixed(2) + 'h'}</td>
      <td>${displayType}</td>
      <td>${checkOutWithinDay || '-'}</td>
      <td>${checkInWithinDay || '-'}</td>
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
  `;
  tbody.appendChild(totalsRow);

  return totalExtraHoursWithFactor;
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

  let intervalsHtml = '';
  if (entry.intervals && entry.intervals.length > 0) {
    entry.intervals.forEach((interval, idx) => {
      intervalsHtml += `
        <div class="form-group interval-group">
          <label>Interval ${idx + 1}</label>
          <div class="interval-inputs">
            <input type="time" value="${interval.in}" id="checkIn_${idx}" placeholder="Check In">
            <input type="time" value="${interval.out}" id="checkOut_${idx}" placeholder="Check Out">
            <button type="button" class="btn btn-sm btn-danger" onclick="this.parentElement.parentElement.remove()">Remove</button>
          </div>
        </div>
      `;
    });
  }

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

      <div id="intervalsContainer">
        ${intervalsHtml}
      </div>

      <button type="button" class="btn btn-secondary" id="addIntervalBtn">+ Add Interval</button>

      <div class="form-group">
        <label>Notes</label>
        <textarea id="editDayNotes" class="form-control" rows="3">${entry.notes || ''}</textarea>
      </div>
    </div>

    <div class="modal-actions">
      <button class="btn btn-secondary" onclick="document.getElementById('editDayOverlay').remove()">Cancel</button>
      <button class="btn btn-primary" id="saveEditDayBtn">Save Changes</button>
    </div>
  `;

  overlay.appendChild(content);
  document.body.appendChild(overlay);

  // Add new interval
  document.getElementById('addIntervalBtn').addEventListener('click', () => {
    const container = document.getElementById('intervalsContainer');
    const newIdx = container.querySelectorAll('.interval-group').length;
    const newInterval = document.createElement('div');
    newInterval.className = 'form-group interval-group';
    newInterval.innerHTML = `
      <label>Interval ${newIdx + 1}</label>
      <div class="interval-inputs">
        <input type="time" id="checkIn_${newIdx}" placeholder="Check In">
        <input type="time" id="checkOut_${newIdx}" placeholder="Check Out">
        <button type="button" class="btn btn-sm btn-danger" onclick="this.parentElement.parentElement.remove()">Remove</button>
      </div>
    `;
    container.appendChild(newInterval);
  });

  // Save edited entry
  document.getElementById('saveEditDayBtn').addEventListener('click', () => {
    const updatedType = document.getElementById('editDayType').value;
    const updatedNotes = document.getElementById('editDayNotes').value;

    const intervals = [];
    document.querySelectorAll('.interval-group').forEach((group, idx) => {
      const checkIn = document.getElementById(`checkIn_${idx}`).value;
      const checkOut = document.getElementById(`checkOut_${idx}`).value;
      if (checkIn && checkOut) {
        intervals.push({ in: checkIn, out: checkOut });
      }
    });

    const entryIdx = entries.findIndex(e => e.date === date);
    entries[entryIdx] = {
      date,
      type: updatedType,
      intervals: updatedType === 'Regular' ? intervals : [],
      notes: updatedNotes,
      hours: updatedType === 'Regular' ? null : entry.hours,
      duration: entry.duration || 1
    };

    localStorage.setItem('timeEntries', JSON.stringify(entries));
    document.getElementById('editDayOverlay').remove();
    this.showAlert('Entry updated!');
    this.renderTimesheet();
    this.renderDashboard();
  });

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove();
  });
}

calculateWorkTime(intervals) {
    if (!intervals || intervals.length === 0) {
        return { minutes: 0, decimal: 0, display: "0:00" };
    }

    const toMinutes = t => {
        // Handle null, undefined, or empty string
        if (!t || t.trim() === '') {
            return 0;
        }
        const [h, m] = t.split(':').map(Number);
        return h * 60 + m;
    };

    // Sort intervals just in case
    intervals = intervals.slice().sort((a, b) => a.in.localeCompare(b.in));

    // Filter out intervals with missing check-in or check-out times
    intervals = intervals.filter(interval => interval.in && interval.out);
    
    if (intervals.length === 0) {
        return { minutes: 0, decimal: 0, display: "0:00" };
    }

    const firstIn = toMinutes(intervals[0].in);
    const lastOut = toMinutes(intervals[intervals.length - 1].out);

    // Permitted break window
    const ALLOWED_START = 13 * 60;     // 13:00
    const ALLOWED_END = 13 * 60 + 30;  // 13:30

    let deductedBreakMinutes = 0;

    for (let i = 0; i < intervals.length - 1; i++) {
        const out = toMinutes(intervals[i].out);
        const nextIn = toMinutes(intervals[i + 1].in);

        if (nextIn <= out) continue; // no gap

        const gapDuration = nextIn - out;
        let gapStart = out;
        let gapEnd = nextIn;

        const isAllowedGap =
            out >= ALLOWED_START &&
            out <= ALLOWED_END &&
            nextIn >= ALLOWED_START &&
            nextIn <= ALLOWED_END;

        if (!isAllowedGap) {
            deductedBreakMinutes += gapDuration;
        }

        // Overlap with allowed window
        let allowedOverlap = 0;
        allowedOverlap =
            Math.max(0,
                Math.min(gapEnd, ALLOWED_END) -
                Math.max(gapStart, ALLOWED_START)
            );
    }

    const totalSpan = lastOut - firstIn;
    const netMinutes = Math.max(0, totalSpan - deductedBreakMinutes);

    const hours = Math.floor(netMinutes / 60);
    const minutes = netMinutes % 60;
    const extraMinutes = netMinutes - 540;

    return {
        minutes: netMinutes,
        decimal: +(netMinutes / 60).toFixed(2),
        display: `${hours}:${minutes.toString().padStart(2, '0')}`,
        extraMinutes
    };
}


  getTimesheetData() {
    const entries = JSON.parse(localStorage.getItem('timeEntries') || '[]');
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

    // Sum durations (default 1 if missing)
    const vacationUsed = entries
      .filter(e => e.type === 'Vacation')
      .reduce((sum, e) => sum + (parseFloat(e.duration) || 1), 0);

    const sickUsed = entries
      .filter(e => e.type === 'Sick Leave')
      .reduce((sum, e) => sum + (parseFloat(e.duration) || 1), 0);

    const currentBalance = Math.max(0, annual - vacationUsed);
    const sickRemaining = Math.max(0, sickTotal - sickUsed);

    return {
      officialBalance: annual,          // total annual allowance
      takenDays: vacationUsed,          // used vacation days (supports 0.5)
      toBeAdded: 0,
      currentBalance: currentBalance,   // remaining vacation
      sickDaysBalance: sickRemaining,   // remaining sick
      daysUsed: sickUsed                // used sick
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

  editEntry(date) {
    const entries = JSON.parse(localStorage.getItem('timeEntries') || '[]');
    const entry = entries.find(e => e.date === date);

    if (!entry) return;

    const html = `
      <div class="modal-overlay">
        <div class="modal-content">
          <h2>Edit Entry - ${date}</h2>
          <div class="modal-body">
            <div class="form-group">
              <label>Check In</label>
              <input type="time" id="editCheckIn" value="${entry.checkIn || '00:00'}">
            </div>
            <div class="form-group">
              <label>Check Out</label>
              <input type="time" id="editCheckOut" value="${entry.checkOut || '00:00'}">
            </div>
            <div class="form-group">
              <label>Type</label>
              <select id="editType">
                <option value="Regular" ${entry.type === 'Regular' ? 'selected' : ''}>Regular</option>
                <option value="Vacation" ${entry.type === 'Vacation' ? 'selected' : ''}>Vacation</option>
                <option value="Sick Leave" ${entry.type === 'Sick Leave' ? 'selected' : ''}>Sick Leave</option>
              </select>
            </div>
          </div>
          <div class="modal-actions">
            <button class="btn btn-danger" id="deleteEntryBtn">Delete</button>
            <button class="btn btn-secondary" onclick="document.querySelector('.modal-overlay').remove()">Cancel</button>
            <button class="btn btn-primary" id="saveEntryBtn">Save</button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', html);

    document.getElementById('saveEntryBtn').addEventListener('click', () => {
      entry.checkIn = document.getElementById('editCheckIn').value;
      entry.checkOut = document.getElementById('editCheckOut').value;
      entry.type = document.getElementById('editType').value;

      localStorage.setItem('timeEntries', JSON.stringify(entries));
      document.querySelector('.modal-overlay').remove();
      this.showAlert('✅ Entry updated');
      this.renderTimesheet();
      this.renderDashboard();
    });

    document.getElementById('deleteEntryBtn').addEventListener('click', () => {
      if (confirm('Delete this entry?')) {
        const idx = entries.indexOf(entry);
        entries.splice(idx, 1);
        localStorage.setItem('timeEntries', JSON.stringify(entries));
        document.querySelector('.modal-overlay').remove();
        this.showAlert('✅ Entry deleted');
        this.renderTimesheet();
        this.renderDashboard();
      }
    });
  }

  generateMonthOptions() {
    const entries = JSON.parse(localStorage.getItem('timeEntries') || '[]');
    
    // Get all unique months from entries
    const uniqueMonths = new Set();
    entries.forEach(entry => {
        const monthKey = entry.date.substring(0, 7); // Format: YYYY-MM
        uniqueMonths.add(monthKey);
    });
    
    // Always add current month
    const currentMonthKey = new Date().toISOString().substring(0, 7);
    uniqueMonths.add(currentMonthKey);
    
    // Convert to array and sort in descending order (newest first)
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

  parseSpecialDayLabel(label) {
    // Duration
    const duration = label.includes('Half Day') ? 0.5 : 1;

    // Canonical type mapping
    if (label.includes('Vacation')) return { type: 'Vacation', duration };
    if (label.includes('Sick Leave')) return { type: 'Sick Leave', duration };
    if (label.includes('Holiday')) return { type: 'Holiday', duration };
    if (label.includes('Leave')) return { type: 'Leave', duration };

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
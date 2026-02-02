// TimeTracker v2.1 - Split & Cleaned (vanilla JS)
// NOTE: Styling and functionality preserved; only code organization + duplicate removal.

// Methods: init, applyTheme, toggleTheme, setupEventListeners, attachStaticListeners, showScreen, hideLoadingScreen, getDetailedViewState, toggleDetailedView, updateTableColumns, updateDetailedViewToggle

TimeTrackerApp.prototype.init = function() {
    this.applyTheme();
    this.setupEventListeners();
    this.renderDashboard();
    this.showScreen('dashboard');
    this.hideLoadingScreen();
  }

TimeTrackerApp.prototype.applyTheme = function() {
    if (this.theme === 'dark') {
      document.documentElement.setAttribute('data-color-scheme', 'dark');
      document.querySelector('.theme-icon').textContent = '☀️';
    } else {
      document.documentElement.setAttribute('data-color-scheme', 'light');
      document.querySelector('.theme-icon').textContent = '🌙';
    }
    localStorage.setItem('theme', this.theme);
  }

TimeTrackerApp.prototype.toggleTheme = function() {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
    this.applyTheme();
  }

TimeTrackerApp.prototype.setupEventListeners = function() {
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

TimeTrackerApp.prototype.attachStaticListeners = function() {
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

TimeTrackerApp.prototype.showScreen = function(screenName) {
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

TimeTrackerApp.prototype.hideLoadingScreen = function() {
    const loading = document.getElementById('loadingScreen');
    const container = document.getElementById('appContainer');
    if (loading) loading.remove();
    if (container) container.style.display = 'block';
  }

TimeTrackerApp.prototype.getDaysDetailsByType = function(type, year = new Date().getFullYear()) {
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

TimeTrackerApp.prototype.getDetailedViewState = function() {
  return localStorage.getItem('detailedView') === 'true';
}

// Toggle detailed view

TimeTrackerApp.prototype.toggleDetailedView = function() {
  const currentState = this.getDetailedViewState();
  const newState = !currentState;
  localStorage.setItem('detailedView', newState);
  
  // Update the table display immediately
  this.updateTableColumns(newState);
  
  // Update toggle UI
  this.updateDetailedViewToggle(newState);
}

// Update table columns visibility

TimeTrackerApp.prototype.updateTableColumns = function(showDetailed) {
  const isMobile = window.innerWidth <= 768;
  
  // Select BOTH header cells and data cells
  const hiddenHeaders = document.querySelectorAll('th.hide-mobile');
  const hiddenCells = document.querySelectorAll('td.hide-mobile');
  
  if (isMobile) {
    // On mobile: respect the toggle
    if (showDetailed) {
      // Show all columns
      hiddenHeaders.forEach(th => {
        th.style.display = 'table-cell';
      });
      hiddenCells.forEach(td => {
        td.style.display = 'table-cell';
      });
    } else {
      // Hide columns (simplified view)
      hiddenHeaders.forEach(th => {
        th.style.display = 'none';
      });
      hiddenCells.forEach(td => {
        td.style.display = 'none';
      });
    }
  } else {
    // On desktop: always show all columns
    hiddenHeaders.forEach(th => {
      th.style.display = 'table-cell';
    });
    hiddenCells.forEach(td => {
      td.style.display = 'table-cell';
    });
  }
}
// Update toggle switch UI

TimeTrackerApp.prototype.updateDetailedViewToggle = function(isDetailed) {
  const checkbox = document.getElementById('detailedViewToggle');
  const label = checkbox?.parentElement.querySelector('.toggle-label');
  
  if (checkbox) {
    checkbox.checked = isDetailed;
  }
  
  if (label) {
    label.textContent = isDetailed ? 'Detailed' : 'Simple';
  }
}


// TimeTracker v2.1 - Split & Cleaned (vanilla JS)
// NOTE: Styling and functionality preserved; only code organization + duplicate removal.

class TimeTrackerApp {
  constructor() {
    this.currentScreen = 'dashboard';
    this.currentMonth = new Date();
    this.hideSalary = localStorage.getItem('hideSalary') === 'true';
    this.theme = localStorage.getItem('theme') || 'light';
    this.initializePeriods();
    this.selectedPeriodId = null;
    this.init();
  }
}


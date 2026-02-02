// TimeTracker v2.1 - Split & Cleaned (vanilla JS)
// NOTE: Styling and functionality preserved; only code organization + duplicate removal.

// Methods: exportCSV, triggerFileInput, importCSV

TimeTrackerApp.prototype.exportCSV = function() {
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
    showAlert('✅ CSV exported successfully');
  }

TimeTrackerApp.prototype.triggerFileInput = function() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = (e) => this.importCSV(e.target.files[0]);
    input.click();
  }

TimeTrackerApp.prototype.importCSV = function(file) {
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
      showAlert('✅ CSV imported successfully');
      this.renderTimesheet();
      this.renderDashboard();
    };
    reader.readAsText(file);
  }


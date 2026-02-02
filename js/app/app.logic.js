// TimeTracker v2.1 - Split & Cleaned (vanilla JS)
// NOTE: Styling and functionality preserved; only code organization + duplicate removal.

// Methods: getTimesheetTotals, calculateWorkTime, getTimesheetData, getEmployeeData, getVacationData, formatTimeFromDate, formatTimeDisplay, parseSpecialDayLabel, formatDate, formatTime, formatMonthYear, getAvailableYears, getPeriodForDate, generatePeriodLabel, validatePeriod

TimeTrackerApp.prototype.getTimesheetTotals = function() {
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

TimeTrackerApp.prototype.calculateWorkTime = function(intervals, date) {
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

TimeTrackerApp.prototype.getTimesheetData = function() {
  const entries = JSON.parse(localStorage.getItem('timeEntries') || '[]');
  
  // ✅ UPDATED: Check for temporary selection first, then fall back to current period
  const selectedPeriodId = this.selectedPeriodId || this.getCurrentPeriodId();
  const periods = this.getPayPeriods();
  const period = periods.find(p => p.id === selectedPeriodId);
  
  if (!period) {
    // Fallback to old month-based filtering
    
    // ✅ FIX: Safely handle currentMonth
    let monthKey;
    if (!this.currentMonth) {
      this.currentMonth = new Date();
      monthKey = this.currentMonth.toISOString().substring(0, 7);
    } else if (typeof this.currentMonth === 'string') {
      monthKey = this.currentMonth.substring(0, 7);
    } else if (this.currentMonth instanceof Date) {
      if (isNaN(this.currentMonth.getTime())) {
        console.error('Invalid currentMonth, resetting to current date');
        this.currentMonth = new Date();
      }
      monthKey = this.currentMonth.toISOString().substring(0, 7);
    } else {
      console.error('currentMonth is invalid type:', typeof this.currentMonth);
      this.currentMonth = new Date();
      monthKey = this.currentMonth.toISOString().substring(0, 7);
    }
    
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


TimeTrackerApp.prototype.getEmployeeData = function() {
    return {
      name: localStorage.getItem('fullName') || 'Enter Employee Name in Settings Tab...',
      salary: parseInt(localStorage.getItem('salary') || '0')
    };
  }

TimeTrackerApp.prototype.getVacationData = function() {
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

TimeTrackerApp.prototype.formatTimeFromDate = function(date) {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

TimeTrackerApp.prototype.formatTimeDisplay = function(time24) {
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

TimeTrackerApp.prototype.parseSpecialDayLabel = function(label) {
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

TimeTrackerApp.prototype.formatDate = function(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

TimeTrackerApp.prototype.formatTime = function(date) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

TimeTrackerApp.prototype.formatMonthYear = function(date) {
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  }

TimeTrackerApp.prototype.getAvailableYears = function() {
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


TimeTrackerApp.prototype.openDaysDetailsModal = function(type, initialYear = new Date().getFullYear()) {
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

TimeTrackerApp.prototype.getPeriodForDate = function(date) {
  const periods = this.getPayPeriods();
  return periods.find(p => p.start <= date && p.end >= date) || null;
}

TimeTrackerApp.prototype.generatePeriodLabel = function(startDate, endDate) {
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

TimeTrackerApp.prototype.validatePeriod = function(start, end, excludeId = null) {
  let periods = this.getPayPeriods().filter(p => p.id !== excludeId);
  
  // Check if start is before end
  if (start >= end) {
    return { valid: false, message: 'End date must be after start date' };
  }
  
  // If no existing periods, it's valid
  if (periods.length === 0) {
    return { valid: true };
  }
  
  // Sort periods by start date
  periods.sort((a, b) => new Date(a.start) - new Date(b.start));
  
  // Helper functions
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
  
  // Check for overlaps with any existing period
  for (const period of periods) {
    if ((start >= period.start && start <= period.end) ||
        (end >= period.start && end <= period.end) ||
        (start <= period.start && end >= period.end)) {
      return { valid: false, message: `Period overlaps with existing period: ${period.label}` };
    }
  }
  
  // ✅ FIXED: Check if new period fits into the overall timeline
  const firstPeriod = periods[0];
  const lastPeriod = periods[periods.length - 1];
  
  // Case 1: New period comes before all existing periods
  if (end < firstPeriod.start) {
    if (nextDay(end) !== firstPeriod.start) {
      return { valid: false, message: `Gap detected between ${end} and ${firstPeriod.start}` };
    }
    return { valid: true };
  }
  
  // Case 2: New period comes after all existing periods
  if (start > lastPeriod.end) {
    if (prevDay(start) !== lastPeriod.end) {
      return { valid: false, message: `Gap detected between ${lastPeriod.end} and ${start}` };
    }
    return { valid: true };
  }
  
  // Case 3: New period fits between two existing periods
  for (let i = 0; i < periods.length - 1; i++) {
    const currentPeriod = periods[i];
    const nextPeriod = periods[i + 1];
    
    // Check if new period fits in the gap between currentPeriod and nextPeriod
    if (start > currentPeriod.end && end < nextPeriod.start) {
      // Verify it fills the gap exactly
      if (prevDay(start) !== currentPeriod.end) {
        return { valid: false, message: `Gap detected between ${currentPeriod.end} and ${start}` };
      }
      if (nextDay(end) !== nextPeriod.start) {
        return { valid: false, message: `Gap detected between ${end} and ${nextPeriod.start}` };
      }
      return { valid: true };
    }
  }
  
  // If we reach here, the period doesn't fit anywhere
  return { valid: false, message: 'Period does not fit into the existing timeline' };
}


// TimeTracker Configuration
const CONFIG = {
  APP_NAME: 'TimeTracker',
  APP_VERSION: '2.1',
  DEFAULT_WORKING_HOURS: 9,
  DEFAULT_MONTHLY_HOURS: 187,
  STORAGE_KEYS: {
    USER_DATA: 'timetracker_user',
    CHECKINS: 'timetracker_checkins',
    SALARY_BLUR: 'salary_blur_state'
  },
  DAY_TYPES: {
    OFFICIAL: 'official',
    EMERGENCY: 'emergency',
    PERSONAL: 'personal',
    SICK: 'sick',
    HALF_EMERGENCY: 'half-emergency',
    HALF_PERSONAL: 'half-personal',
    HALF_SICK: 'half-sick'
  },
  SALARY_FORMULA: 2 / 3 // 2/3 of salary for calculation
};
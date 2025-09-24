const SCRIPT_URL = 'YOUR_DEPLOYED_WEB_APP_URL';

function doGet() {
  const template = HtmlService.createTemplateFromFile('Index');
  return template.evaluate()
    .setTitle('نظام إدارة الطابور المدرسي');
}

function getTeachers() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Teachers');
  const data = sheet.getDataRange().getValues();
  const headers = data.shift();
  const teachers = data.map(row => {
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index];
    });
    return obj;
  });
  return teachers;
}

function getClasses() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Classes');
  const data = sheet.getDataRange().getValues();
  const headers = data.shift();
  const classes = data.map(row => {
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index];
    });
    return obj;
  });
  return classes;
}

function updateTeacherStatusInSheet(teacherId, status) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Teachers');
  const data = sheet.getDataRange().getValues();
  const headers = data.shift();
  const idIndex = headers.indexOf('id');
  const statusIndex = headers.indexOf('status');
  const timestampIndex = headers.indexOf('timestamp');

  for (let i = 0; i < data.length; i++) {
    if (data[i][idIndex] == teacherId) {
      sheet.getRange(i + 2, statusIndex + 1).setValue(status);
      sheet.getRange(i + 2, timestampIndex + 1).setValue(new Date().toLocaleString('ar-SA'));
      return true;
    }
  }
  return false;
}

function updateClassPointsInSheet(className, criteria, value) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Classes');
  const data = sheet.getDataRange().getValues();
  const headers = data.shift();
  const nameIndex = headers.indexOf('name');
  const criteriaIndex = headers.indexOf(criteria);
  const totalPointsIndex = headers.indexOf('totalPoints');
  const dailyPointsIndex = headers.indexOf('dailyPoints');

  for (let i = 0; i < data.length; i++) {
    if (data[i][nameIndex] === className) {
      const row = i + 2;
      const currentTotalPoints = sheet.getRange(row, totalPointsIndex + 1).getValue();
      const currentDailyPoints = sheet.getRange(row, dailyPointsIndex + 1).getValue();
      const oldValue = sheet.getRange(row, criteriaIndex + 1).getValue();
      const newTotalPoints = currentTotalPoints - oldValue + value;
      const newDailyPoints = currentDailyPoints - oldValue + value;

      sheet.getRange(row, criteriaIndex + 1).setValue(value);
      sheet.getRange(row, totalPointsIndex + 1).setValue(newTotalPoints);
      sheet.getRange(row, dailyPointsIndex + 1).setValue(newDailyPoints);
      return true;
    }
  }
  return false;
}

function updateClassNotesInSheet(className, notes) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Classes');
  const data = sheet.getDataRange().getValues();
  const headers = data.shift();
  const nameIndex = headers.indexOf('name');
  const notesIndex = headers.indexOf('notes');

  for (let i = 0; i < data.length; i++) {
    if (data[i][nameIndex] === className) {
      sheet.getRange(i + 2, notesIndex + 1).setValue(notes);
      return true;
    }
  }
  return false;
}

function addTeacherToSheet(name, className) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Teachers');
  const lastRow = sheet.getLastRow();
  const nextId = lastRow; // Assumes lastRow corresponds to the next ID
  sheet.appendRow([nextId, name, className, 'not-recorded', '', '']);
  return true;
}

function deleteTeacherFromSheet(teacherId) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Teachers');
  const data = sheet.getDataRange().getValues();
  const headers = data.shift();
  const idIndex = headers.indexOf('id');

  for (let i = 0; i < data.length; i++) {
    if (data[i][idIndex] == teacherId) {
      sheet.deleteRow(i + 2); // Rows are 1-indexed
      return true;
    }
  }
  return false;
}

function updateSystemConfig(key, value) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetName = 'Config';
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(['key', 'value']);
  }
  const data = sheet.getDataRange().getValues();
  const headers = data.shift();
  const keyIndex = headers.indexOf('key');
  const valueIndex = headers.indexOf('value');

  for (let i = 0; i < data.length; i++) {
    if (data[i][keyIndex] === key) {
      sheet.getRange(i + 2, valueIndex + 1).setValue(value);
      return;
    }
  }
  sheet.appendRow([key, value]);
}

function getSystemConfig() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetName = 'Config';
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    return {};
  }
  const data = sheet.getDataRange().getValues();
  const headers = data.shift();
  const config = {};
  data.forEach(row => {
    config[row[0]] = row[1];
  });
  return config;
}

function resetAllAttendanceInSheet() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Teachers');
  const dataRange = sheet.getRange(2, 4, sheet.getLastRow() - 1, 2); // Columns for status and timestamp
  dataRange.clearContent();
}

function resetAllDailyPointsInSheet() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Classes');
  const dataRange = sheet.getRange(2, 2, sheet.getLastRow() - 1, 5); // Columns for totalPoints, dailyPoints, quiet, speed, volume, cleanliness
  const values = dataRange.getValues().map(row => row.map(() => 0));
  dataRange.setValues(values);
}

function addAllDailyToMonthlyInSheet() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Classes');
  const data = sheet.getDataRange().getValues();
  const headers = data.shift();
  const dailyPointsIndex = headers.indexOf('dailyPoints');
  const monthlyPointsIndex = headers.indexOf('monthlyPoints');
  
  for (let i = 0; i < data.length; i++) {
    const dailyPoints = data[i][dailyPointsIndex] || 0;
    const monthlyPoints = data[i][monthlyPointsIndex] || 0;
    sheet.getRange(i + 2, monthlyPointsIndex + 1).setValue(monthlyPoints + dailyPoints);
  }
}

function resetAllMonthlyPointsInSheet() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Classes');
  const dataRange = sheet.getRange(2, 4, sheet.getLastRow() - 1, 1);
  const values = dataRange.getValues().map(row => row.map(() => 0));
  dataRange.setValues(values);
}

function resetAllPointsInSheet() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Classes');
  const dataRange = sheet.getRange(2, 2, sheet.getLastRow() - 1, 6);
  const values = dataRange.getValues().map(row => row.map(() => 0));
  dataRange.setValues(values);
}

// Function to update star of the day/month
function setStarInSheet(starType, className) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetName = 'Stars';
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(['Star Type', 'Class Name', 'Date']);
  }
  const date = new Date().toLocaleDateString('ar-SA');
  sheet.appendRow([starType, className, date]);
}

function getStars() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetName = 'Stars';
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet || sheet.getLastRow() < 2) {
    return { starOfDay: '', queueStar: '', starOfMonth: '', queueStarMonth: '' };
  }
  const data = sheet.getDataRange().getValues();
  const headers = data.shift();
  const starOfDay = data.find(row => row[0] === 'نجمة اليوم');
  const queueStar = data.find(row => row[0] === 'نجم الطابور');
  const starOfMonth = data.find(row => row[0] === 'نجمة الشهر');
  const queueStarMonth = data.find(row => row[0] === 'نجم الطابور للشهر');

  return {
    starOfDay: starOfDay ? starOfDay[1] : '',
    queueStar: queueStar ? queueStar[1] : '',
    starOfMonth: starOfMonth ? starOfMonth[1] : '',
    queueStarMonth: queueStarMonth ? queueStarMonth[1] : ''
  };
}

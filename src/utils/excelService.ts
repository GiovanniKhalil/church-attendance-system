/**
 * Excel (.xlsx) Import and Export Services powered by SheetJS (xlsx)
 */
import * as XLSX from 'xlsx';
import { Child, Stage, AttendanceRecord, EventType } from '../types';
import { calculateAge } from './dateUtils';
import { EVENT_LABELS, MONTHS } from '../data/mockData';

export interface ParsedChildExcelRow {
  name: string;
  gender: 'boy' | 'girl';
  stage: Stage;
  age: number;
  birthDate: string;
  birthMonth: number;
  area: string;
  phone: string;
  parentName: string;
  parentRelation: string;
  parentPhone: string;
  parentJob: string;
  parent2Name?: string;
  parent2Relation?: string;
  parent2Phone?: string;
  parent2Job?: string;
  notes?: string;
}

/**
 * Exports children records to an authentic .xlsx spreadsheet
 */
export function exportChildrenToXLSX(children: Child[], stageName = 'عام'): void {
  const dataRows = children.map((c, index) => {
    const calculatedAge = calculateAge(c.birthDate, c.age);
    return {
      'م': index + 1,
      'الاسم الكامل للمخدوم': c.name,
      'النوع': c.gender === 'boy' ? 'ولد' : 'بنت',
      'المرحلة الدراسية': c.stage,
      'السن': calculatedAge,
      'تاريخ الميلاد': c.birthDate || '',
      'شهر الميلاد': c.birthMonth || '',
      'المنطقة / السكن': c.area || '',
      'تليفون المخدوم': c.phone || '',
      'اسم ولي الأمر (1)': c.parentName || '',
      'صلة القرابة (1)': c.parentRelation || 'الأب',
      'تليفون ولي الأمر (1)': c.parentPhone || '',
      'مهنة ولي الأمر (1)': c.parentJob || '',
      'اسم ولي الأمر (2)': c.parent2Name || '',
      'صلة القرابة (2)': c.parent2Relation || (c.parent2Name ? 'الأم' : ''),
      'تليفون ولي الأمر (2)': c.parent2Phone || '',
      'مهنة ولي الأمر (2)': c.parent2Job || '',
      'ملاحظات الخدمة والافتقاد': c.notes || ''
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(dataRows);
  
  // RTL direction for worksheet
  worksheet['!dir'] = 'rtl';
  
  // Auto-fit column widths
  const colWidths = [
    { wch: 5 },  // م
    { wch: 25 }, // الاسم
    { wch: 8 },  // النوع
    { wch: 22 }, // المرحلة
    { wch: 8 },  // السن
    { wch: 14 }, // تاريخ الميلاد
    { wch: 10 }, // شهر الميلاد
    { wch: 18 }, // المنطقة
    { wch: 14 }, // تليفون المخدوم
    { wch: 22 }, // ولي الأمر 1
    { wch: 12 }, // صلة القرابة
    { wch: 15 }, // تليفون 1
    { wch: 18 }, // وظيفة 1
    { wch: 22 }, // ولي الأمر 2
    { wch: 12 }, // صلة القرابة 2
    { wch: 15 }, // تليفون 2
    { wch: 18 }, // وظيفة 2
    { wch: 30 }, // ملاحظات
  ];
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'كشف الأولاد');

  const todayStr = new Date().toISOString().split('T')[0];
  const safeStage = stageName.replace(/[\/\\?%*:|"<>]/g, '_');
  XLSX.writeFile(workbook, `كشف_الأولاد_${safeStage}_${todayStr}.xlsx`);
}

/**
 * Exports Attendance Records filtered by Month to .xlsx
 */
export function exportAttendanceMonthToXLSX(
  attendanceRecords: AttendanceRecord[],
  childrenList: Child[],
  selectedMonth: number,
  eventType: EventType,
  stageFilter: string
): void {
  const monthName = MONTHS.find(m => m.value === selectedMonth)?.label || `شهر ${selectedMonth}`;
  const eventLabel = EVENT_LABELS[eventType] || eventType;

  // Filter attendance records by month and event
  const monthRecords = attendanceRecords.filter(a => {
    if (a.targetType !== 'child') return false;
    if (a.eventType !== eventType) return false;
    const parts = a.date.split('-');
    const recordMonth = parseInt(parts[1], 10);
    return recordMonth === selectedMonth;
  });

  // Extract unique sorted dates for this month
  const dates = Array.from(new Set(monthRecords.map(r => r.date))).sort();

  // Filter children
  const scopedChildren = stageFilter === 'all' 
    ? childrenList 
    : childrenList.filter(c => c.stage === stageFilter);

  // Build matrix data
  const rows = scopedChildren.map((kid, idx) => {
    const rowObj: Record<string, any> = {
      'م': idx + 1,
      'اسم المخدوم': kid.name,
      'المرحلة': kid.stage,
      'السن': calculateAge(kid.birthDate, kid.age),
      'تليفون ولي الأمر': kid.parentPhone
    };

    let presentDays = 0;
    let recordedDays = 0;

    dates.forEach(d => {
      const dayRecord = monthRecords.find(r => r.date === d);
      const kidStatus = dayRecord?.records[kid.id]?.status;
      
      let mark = '—';
      if (kidStatus === 'present') {
        mark = 'حاضر ✓';
        presentDays++;
        recordedDays++;
      } else if (kidStatus === 'absent') {
        mark = 'غائب ✗';
        recordedDays++;
      } else if (kidStatus === 'excused') {
        mark = 'معتذر 💬';
        recordedDays++;
      }
      
      // Label formatted date column e.g. "2026-09-06"
      rowObj[d] = mark;
    });

    const percent = recordedDays > 0 ? `${Math.round((presentDays / recordedDays) * 100)}%` : '—';
    rowObj['إجمالي الحضور'] = `${presentDays} من ${recordedDays}`;
    rowObj['نسبة الحضور'] = percent;

    return rowObj;
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  worksheet['!dir'] = 'rtl';

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, `حضور ${monthName}`);

  const safeStage = stageFilter.replace(/[\/\\?%*:|"<>]/g, '_');
  XLSX.writeFile(workbook, `تقرير_حضور_${eventLabel}_${monthName}_${safeStage}.xlsx`);
}

/**
 * Parses an Excel (.xlsx / .xls) or CSV file into ParsedChildExcelRow array
 */
export async function parseExcelOrCsvFile(file: File): Promise<ParsedChildExcelRow[]> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });

  // Read first worksheet
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];

  // Convert to 2D array of rows
  const rawData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  if (rawData.length < 2) {
    throw new Error('الملف فارغ أو لا يحتوي على بيانات كافية');
  }

  // Find header row and identify column indices
  let headerIndex = 0;
  for (let i = 0; i < Math.min(5, rawData.length); i++) {
    const row = rawData[i];
    if (row && row.some((cell: any) => typeof cell === 'string' && (cell.includes('اسم') || cell.includes('مخدوم') || cell.includes('name')))) {
      headerIndex = i;
      break;
    }
  }

  const headerRow = rawData[headerIndex].map((c: any) => String(c || '').trim().toLowerCase());

  // Helper to find column index matching variants
  const getCol = (...aliases: string[]): number => {
    return headerRow.findIndex(h => aliases.some(alias => h.includes(alias.toLowerCase())));
  };

  const nameCol = getCol('الاسم', 'اسم المخدوم', 'اسم الطالب', 'name', 'المخدوم');
  const genderCol = getCol('النوع', 'الجنس', 'gender');
  const stageCol = getCol('المرحلة', 'الفصل', 'stage', 'الصف');
  const ageCol = getCol('السن', 'العمر', 'age');
  const birthDateCol = getCol('تاريخ الميلاد', 'الميلاد', 'birthdate', 'dob');
  const areaCol = getCol('المنطقة', 'السكن', 'العنوان', 'area', 'address');
  const phoneCol = getCol('تليفون الولد', 'رقم الولد', 'موبايل الولد', 'phone');
  const parentNameCol = getCol('اسم ولي الأمر', 'ولي الأمر', 'الوالد', 'الأب', 'parent');
  const parentRelationCol = getCol('صلة القرابة', 'صلة', 'relation');
  const parentPhoneCol = getCol('تليفون ولي الأمر', 'موبايل ولي الأمر', 'رقم ولي الأمر', 'parent phone', 'هاتف ولي الأمر');
  const parentJobCol = getCol('وظيفة', 'المهنة', 'مهنة ولي الأمر', 'job');
  const notesCol = getCol('ملاحظات', 'افتفاد', 'notes');

  if (nameCol === -1) {
    throw new Error('لم يتم التعرف على عمود "اسم المخدوم" في ملف الإكسيل. يرجى التأكد من ترويسة الأعمدة.');
  }

  const parsedList: ParsedChildExcelRow[] = [];

  for (let r = headerIndex + 1; r < rawData.length; r++) {
    const row = rawData[r];
    if (!row || row.length === 0) continue;

    const name = String(row[nameCol] || '').trim();
    if (!name || name.length < 2) continue;

    // Detect gender
    const rawGender = genderCol !== -1 ? String(row[genderCol] || '').trim() : '';
    const gender: 'boy' | 'girl' = rawGender.includes('بنت') || rawGender.toLowerCase().includes('girl') || rawGender.toLowerCase().includes('f') 
      ? 'girl' 
      : 'boy';

    // Stage
    const rawStage = stageCol !== -1 ? String(row[stageCol] || '').trim() : '';
    let stage: Stage = 'ابتدائي (ثالثة ورابعة)';
    if (rawStage.includes('حضانة')) stage = 'حضانة';
    else if (rawStage.includes('أولى') || rawStage.includes('ثانية') || rawStage.includes('تانية') || rawStage.includes('1') || rawStage.includes('2')) stage = 'ابتدائي (أولى وتانية)';
    else if (rawStage.includes('خامسة') || rawStage.includes('سادسة') || rawStage.includes('5') || rawStage.includes('6')) stage = 'ابتدائي (خامسة وسادسة)';
    else if (rawStage.includes('إعدادي') || rawStage.includes('اعدادي')) stage = 'إعدادي';
    else if (rawStage.includes('ثانوي')) stage = 'ثانوي';
    else if (rawStage.includes('جامعي') || rawStage.includes('خريج')) stage = 'خريجون وشباب جامعي';

    // BirthDate
    let birthDate = birthDateCol !== -1 ? String(row[birthDateCol] || '').trim() : '';
    // Format excel serial date if detected
    if (/^\d{5}$/.test(birthDate)) {
      try {
        const serial = parseInt(birthDate, 10);
        const jsDate = new Date(Math.round((serial - 25569) * 86400 * 1000));
        birthDate = jsDate.toISOString().split('T')[0];
      } catch (e) {
        // ignore
      }
    }

    let birthMonth = 1;
    if (birthDate) {
      const parts = birthDate.split(/[-/]/);
      if (parts.length === 3) {
        birthMonth = parseInt(parts[0].length === 4 ? parts[1] : parts[0], 10) || 1;
      }
    }

    // Age
    const rawAge = ageCol !== -1 ? parseInt(String(row[ageCol] || ''), 10) : undefined;
    const age = calculateAge(birthDate, rawAge || 9);

    const area = areaCol !== -1 ? String(row[areaCol] || '').trim() : 'المعراج';
    const phone = phoneCol !== -1 ? String(row[phoneCol] || '').trim() : '';
    const parentName = parentNameCol !== -1 ? String(row[parentNameCol] || '').trim() : `والد ${name.split(' ')[0]}`;
    const parentRelation = parentRelationCol !== -1 ? String(row[parentRelationCol] || '').trim() : 'الأب';
    const parentPhone = parentPhoneCol !== -1 ? String(row[parentPhoneCol] || '').trim() : '';
    const parentJob = parentJobCol !== -1 ? String(row[parentJobCol] || '').trim() : '';
    const notes = notesCol !== -1 ? String(row[notesCol] || '').trim() : '';

    parsedList.push({
      name,
      gender,
      stage,
      age,
      birthDate,
      birthMonth,
      area,
      phone,
      parentName,
      parentRelation: parentRelation || 'الأب',
      parentPhone: parentPhone || '01000000000',
      parentJob,
      notes
    });
  }

  return parsedList;
}

/**
 * Downloads a pre-formatted Excel template for importing children
 */
export function downloadExcelTemplate(): void {
  const sampleData = [
    {
      'الاسم الكامل للمخدوم': 'مينا كيرلس شفيق',
      'النوع': 'ولد',
      'المرحلة الدراسية': 'ابتدائي (ثالثة ورابعة)',
      'السن': 9,
      'تاريخ الميلاد': '2017-05-14',
      'المنطقة / السكن': 'المعراج العلوي',
      'تليفون المخدوم': '01223456789',
      'اسم ولي الأمر (1)': 'كيرلس شفيق',
      'صلة القرابة (1)': 'الأب',
      'تليفون ولي الأمر (1)': '01221112222',
      'مهنة ولي الأمر (1)': 'مهندس مدني',
      'ملاحظات الخدمة والافتقاد': 'شاطر ومواظب على مدارس الأحد'
    },
    {
      'الاسم الكامل للمخدوم': 'مريم بيشوي سامي',
      'النوع': 'بنت',
      'المرحلة الدراسية': 'ابتدائي (أولى وتانية)',
      'السن': 7,
      'تاريخ الميلاد': '2019-11-20',
      'المنطقة / السكن': 'المعراج السفلي',
      'تليفون المخدوم': '',
      'اسم ولي الأمر (1)': 'بيشوي سامي',
      'صلة القرابة (1)': 'الأب',
      'تليفون ولي الأمر (1)': '01003334444',
      'مهنة ولي الأمر (1)': 'محاسب',
      'ملاحظات الخدمة والافتقاد': 'تحب التلوين وألحان الكنيسة'
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  worksheet['!dir'] = 'rtl';
  worksheet['!cols'] = [
    { wch: 25 }, { wch: 8 }, { wch: 22 }, { wch: 8 },
    { wch: 14 }, { wch: 18 }, { wch: 14 }, { wch: 22 },
    { wch: 12 }, { wch: 15 }, { wch: 18 }, { wch: 30 }
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'نموذج كشف الأولاد');
  XLSX.writeFile(workbook, 'نموذج_إضافة_مخدومين_جدد.xlsx');
}

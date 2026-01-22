import { Component, signal, computed, effect, inject, ElementRef, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, LayoutDashboard, Users, Wallet, FileText, Settings, Menu, X, Plus, Search, ArrowUpRight, ArrowDownRight, School, LogOut, Download, Upload, Trash2, Pencil, UserPlus, PieChart, Calendar, Moon, Sun, Monitor, Lock, Globe, User, Save, CheckCircle, Eye, EyeOff, LogIn, Sparkles, MessageCircle, Bot, Copy, Loader, HardDrive, TrendingUp, TrendingDown, CreditCard, Filter } from 'lucide-angular';
import { GoogleGenAI } from "@google/genai";

declare var process: any;

// --- Types & Interfaces ---

interface Student {
  id: number;
  nis: string;
  name: string;
  class: string;
  status: string;
}

interface Transaction {
  id: number;
  category: 'income' | 'expense';
  studentId: number | null;
  type: string;
  paymentMethod: string;
  month: string;
  year: string;
  amount: number;
  date: string;
  status: string;
}

interface AppSettings {
  darkMode: boolean;
  textSize: 'small' | 'normal' | 'large';
  language: 'id' | 'en';
}

interface SecurityConfig {
  username: string;
  password: string;
}

interface Profile {
  name: string;
  role: string;
  avatarInitials: string;
}

interface Translations {
  [key: string]: { [key: string]: string };
}

// --- Constants ---

const INITIAL_STUDENTS: Student[] = [
  { id: 1, nis: '2024001', name: 'Ahmad Muzaki', class: '9A', status: 'Aktif' },
  { id: 2, nis: '2024002', name: 'Siti Aminah', class: '9A', status: 'Aktif' },
  { id: 3, nis: '2024003', name: 'Budi Santoso', class: '9A', status: 'Aktif' },
  { id: 4, nis: '2024004', name: 'Dewi Sartika', class: '9A', status: 'Aktif' },
  { id: 5, nis: '2024005', name: 'Eko Prasetyo', class: '9A', status: 'Aktif' },
];

const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: 101, category: 'income', studentId: 1, type: 'SPP', paymentMethod: 'Tunai', month: 'Januari', year: '2024', amount: 150000, date: '2024-01-10', status: 'Lunas' },
  { id: 102, category: 'income', studentId: 2, type: 'SPP', paymentMethod: 'Tunai', month: 'Januari', year: '2024', amount: 150000, date: '2024-01-11', status: 'Lunas' },
  { id: 103, category: 'income', studentId: 1, type: 'LKS', paymentMethod: 'Tunai', month: '-', year: '-', amount: 200000, date: '2024-01-12', status: 'Lunas' },
  { id: 104, category: 'expense', studentId: null, type: 'Beli Spidol & Penghapus', paymentMethod: 'Tunai', month: '-', year: '-', amount: 45000, date: '2024-01-14', status: 'Lunas' },
  { id: 105, category: 'income', studentId: 3, type: 'SPP', paymentMethod: 'Tunai', month: 'Januari', year: '2024', amount: 150000, date: '2024-01-15', status: 'Lunas' },
];

const TRANSLATIONS: Translations = {
  id: {
    menu_dashboard: 'Dashboard',
    menu_students: 'Data Siswa',
    menu_transactions: 'Keuangan',
    menu_reports: 'Laporan',
    menu_ai: 'Asisten AI',
    menu_settings: 'Pengaturan',
    menu_logout: 'Keluar',
    header_dashboard: 'Overview Kelas 9A',
    header_students: 'Manajemen Siswa',
    header_transactions: 'Transaksi Keuangan',
    header_reports: 'Laporan Keuangan',
    header_ai: 'Asisten Cerdas (AI)',
    header_settings: 'Pengaturan Aplikasi',
    card_income: 'Pemasukan',
    card_expense: 'Pengeluaran',
    card_balance: 'Sisa Saldo',
    card_paid: 'Siswa Lunas',
    trend_month: 'bulan ini',
    trend_collected: 'Terkumpul',
    recent_title: 'Riwayat Terakhir',
    btn_view_all: 'Lihat Semua',
    th_student: 'Siswa / Keterangan',
    th_cat: 'Kategori',
    th_type: 'Jenis/Item',
    th_date: 'Tanggal',
    th_amount: 'Nominal',
    th_status: 'Status',
    th_method: 'Metode',
    th_nis: 'NIS',
    th_name: 'Nama Lengkap',
    th_class: 'Kelas',
    th_action: 'Aksi',
    th_id: 'ID',
    btn_add_student: 'Siswa Baru',
    btn_import: 'Import / Restore',
    search_placeholder: 'Cari siswa...',
    btn_input: 'Input Transaksi',
    filter_all: 'Semua',
    filter_income: 'Pemasukan',
    filter_expense: 'Pengeluaran',
    btn_export: 'Backup Database (.JSON)',
    summary_title: 'Ringkasan',
    summary_spp: 'Total SPP',
    summary_building: 'Total Uang Gedung',
    summary_total: 'Total Keseluruhan',
    breakdown_title: 'Analisis Rinci per Item',
    breakdown_income: 'Rincian Pemasukan',
    breakdown_expense: 'Rincian Pengeluaran',
    dist_title: 'Analisis Arus Kas',
    chart_total: 'Total',
    ai_tab_analysis: 'Analisis Keuangan',
    ai_tab_message: 'Generator Pesan WA',
    btn_analyze: '✨ Analisa Data Keuangan',
    ai_analyzing: 'Sedang menganalisis data...',
    ai_result_title: 'Hasil Analisis & Saran AI',
    ai_msg_student_label: 'Pilih Siswa',
    ai_msg_type_label: 'Jenis Tunggakan',
    ai_msg_amount_label: 'Jumlah Tunggakan',
    btn_generate_msg: '✨ Buat Draft Pesan',
    ai_generating: 'Sedang menulis...',
    ai_msg_result: 'Draft Pesan WhatsApp',
    btn_copy: 'Salin Teks',
    btn_send_wa: 'Kirim via WhatsApp',
    alert_copied: 'Teks berhasil disalin!',
    sect_profile: 'Profil Walikelas',
    sect_display: 'Tampilan & Sistem',
    sect_security: 'Keamanan Akun',
    label_name: 'Nama Lengkap',
    label_role: 'Jabatan / Kelas',
    btn_save_profile: 'Simpan Profil',
    label_theme: 'Tema Aplikasi',
    theme_light: 'Terang',
    theme_dark: 'Gelap',
    label_lang: 'Bahasa Aplikasi',
    label_text_size: 'Ukuran Teks',
    label_username: 'Username',
    label_old_pass: 'Password Lama',
    label_new_pass: 'Password Baru',
    label_confirm_pass: 'Konfirmasi Password',
    btn_update_pass: 'Update Akun',
    modal_add_payment: 'Input Transaksi Baru',
    modal_add_student: 'Tambah Siswa Baru',
    modal_edit_student: 'Edit Data Siswa',
    btn_save_payment: 'Simpan Transaksi',
    btn_save_changes: 'Simpan Perubahan',
    btn_add_student_submit: 'Tambah Siswa',
    label_month_bill: 'Bulan Tagihan',
    label_year_bill: 'Tahun Tagihan',
    label_select_student: 'Pilih Siswa',
    label_expense_desc: 'Keterangan Pengeluaran',
    label_payment_method: 'Metode Pembayaran',
    cat_income: 'Pemasukan',
    cat_expense: 'Pengeluaran',
    alert_profile_saved: 'Profil berhasil diperbarui!',
    alert_pass_mismatch: 'New password and confirmation do not match!',
    alert_pass_saved: 'Akun & Password berhasil diperbarui!',
    alert_old_pass_wrong: 'Old password incorrect!',
    alert_delete_confirm: 'Hapus data siswa?',
    alert_import_success: 'Database berhasil dipulihkan!',
    alert_login_failed: 'Incorrect Username or Password!',
    db_backup_info: 'Unduh file database untuk disimpan di Google Drive atau Local Storage Anda.',
    db_restore_info: 'Pilih file .json database Anda untuk memulihkan data.',
    err_required: 'Wajib diisi',
    err_amount_positive: 'Nominal harus > 0',
    err_nis_unique: 'NIS sudah terdaftar',
    err_name_length: 'Nama minimal 3 karakter',
    btn_edit: 'Edit',
    btn_delete: 'Hapus'
  },
  en: {
    menu_dashboard: 'Dashboard',
    menu_students: 'Students',
    menu_transactions: 'Finance',
    menu_reports: 'Reports',
    menu_ai: 'AI Assistant',
    menu_settings: 'Settings',
    menu_logout: 'Logout',
    header_dashboard: 'Class 9A Overview',
    header_students: 'Student Management',
    header_transactions: 'Financial Transactions',
    header_reports: 'Financial Reports',
    header_ai: 'Smart Assistant (AI)',
    header_settings: 'App Settings',
    card_income: 'Total Income',
    card_expense: 'Total Expenses',
    card_balance: 'Balance',
    card_paid: 'Tuition Paid',
    trend_month: 'this month',
    trend_collected: 'Collected',
    recent_title: 'Recent History',
    btn_view_all: 'View All',
    th_student: 'Student / Description',
    th_cat: 'Category',
    th_type: 'Type/Item',
    th_date: 'Date',
    th_amount: 'Amount',
    th_status: 'Status',
    th_method: 'Method',
    th_nis: 'ID Number',
    th_name: 'Full Name',
    th_class: 'Class',
    th_action: 'Action',
    th_id: 'ID',
    btn_add_student: 'New Student',
    btn_import: 'Import / Restore',
    search_placeholder: 'Search student...',
    btn_input: 'Input Transaction',
    filter_all: 'All',
    filter_income: 'Income',
    filter_expense: 'Expenses',
    btn_export: 'Backup Database (.JSON)',
    summary_title: 'Summary',
    summary_spp: 'Total Tuition',
    summary_building: 'Total Building Fund',
    summary_total: 'Grand Total',
    breakdown_title: 'Detailed Breakdown',
    breakdown_income: 'Income Breakdown',
    breakdown_expense: 'Expense Breakdown',
    dist_title: 'Cash Flow Analysis',
    chart_total: 'Total',
    ai_tab_analysis: 'Financial Analysis',
    ai_tab_message: 'Message Generator',
    btn_analyze: '✨ Analyze Financial Data',
    ai_analyzing: 'Analyzing data...',
    ai_result_title: 'AI Analysis & Insights',
    ai_msg_student_label: 'Select Student',
    ai_msg_type_label: 'Payment Type',
    ai_msg_amount_label: 'Amount Due',
    btn_generate_msg: '✨ Draft Message',
    ai_generating: 'Writing...',
    ai_msg_result: 'WhatsApp Message Draft',
    btn_copy: 'Copy Text',
    btn_send_wa: 'Send via WhatsApp',
    alert_copied: 'Text copied successfully!',
    sect_profile: 'Homeroom Teacher Profile',
    sect_display: 'Display & System',
    sect_security: 'Account Security',
    label_name: 'Full Name',
    label_role: 'Role / Class',
    btn_save_profile: 'Save Profile',
    label_theme: 'App Theme',
    theme_light: 'Light',
    theme_dark: 'Dark',
    label_lang: 'App Language',
    label_text_size: 'Text Size',
    label_username: 'Username',
    label_old_pass: 'Old Password',
    label_new_pass: 'New Password',
    label_confirm_pass: 'Confirm Password',
    btn_update_pass: 'Update Account',
    modal_add_payment: 'New Transaction',
    modal_add_student: 'Add New Student',
    modal_edit_student: 'Edit Student Data',
    btn_save_payment: 'Save Transaction',
    btn_save_changes: 'Save Changes',
    btn_add_student_submit: 'Add Student',
    label_month_bill: 'Billing Month',
    label_year_bill: 'Billing Year',
    label_select_student: 'Select Student',
    label_expense_desc: 'Expense Description',
    label_payment_method: 'Payment Method',
    cat_income: 'Income',
    cat_expense: 'Expense',
    alert_profile_saved: 'Profile successfully updated!',
    alert_pass_mismatch: 'New password and confirmation do not match!',
    alert_pass_saved: 'Account & Password updated successfully!',
    alert_old_pass_wrong: 'Old password incorrect!',
    alert_delete_confirm: 'Delete student data?',
    alert_import_success: 'Database restored successfully!',
    alert_login_failed: 'Incorrect Username or Password!',
    db_backup_info: 'Download database file to save in your Google Drive or Local Storage.',
    db_restore_info: 'Select your .json database file to restore data.',
    err_required: 'Required',
    err_amount_positive: 'Amount must be > 0',
    err_nis_unique: 'ID Number already registered',
    err_name_length: 'Name min 3 chars',
    btn_edit: 'Edit',
    btn_delete: 'Delete'
  }
};

const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.component.html'
})
export class AppComponent {
  // --- Icons ---
  readonly icons = {
    LayoutDashboard, Users, Wallet, FileText, Settings, Menu, X, Plus, Search, 
    ArrowUpRight, ArrowDownRight, School, LogOut, Download, Upload, Trash2, 
    Pencil, UserPlus, PieChart, Calendar, Moon, Sun, Monitor, Lock, Globe, 
    User, Save, CheckCircle, Eye, EyeOff, LogIn, Sparkles, MessageCircle, 
    Bot, Copy, Loader, HardDrive, TrendingUp, TrendingDown, CreditCard, Filter
  };

  // --- State Signals ---
  isLoggedIn = signal<boolean>(false);
  activeTab = signal<string>('dashboard');
  isMobileMenuOpen = signal<boolean>(false);
  
  // Data Signals
  students = signal<Student[]>(INITIAL_STUDENTS);
  transactions = signal<Transaction[]>(INITIAL_TRANSACTIONS);
  
  // UI State Signals
  transactionFilter = signal<'all' | 'income' | 'expense'>('all');

  // Settings Signals
  profile = signal<Profile>({
    name: 'Bpk. Ahmad Fauzi',
    role: 'Walikelas 9A',
    avatarInitials: 'AF'
  });
  
  appSettings = signal<AppSettings>({
    darkMode: false,
    textSize: 'normal',
    language: 'id',
  });

  securitySettings = signal<SecurityConfig>({
    username: 'admin',
    password: '123'
  });

  // UI State Signals
  showPaymentModal = signal<boolean>(false);
  showStudentModal = signal<boolean>(false);
  isEditingStudent = signal<boolean>(false);
  searchQuery = signal<string>('');
  
  // Validation State
  validationErrors = signal<Record<string, string>>({});

  // Forms
  loginForm = { username: '', password: '' };
  
  transactionFormState = {
    category: 'income' as 'income' | 'expense',
    studentId: '',
    type: 'SPP',
    paymentMethod: 'Tunai',
    expenseDescription: '',
    month: MONTHS[new Date().getMonth()],
    year: new Date().getFullYear().toString(),
    date: new Date().toISOString().split('T')[0],
    amount: null as number | null,
    status: 'Lunas'
  };

  studentFormState: Student = {
    id: 0,
    nis: '',
    name: '',
    class: '9A',
    status: 'Aktif'
  };

  profileFormState: Profile = {
    name: '',
    role: '',
    avatarInitials: ''
  };

  securityFormState = {
    username: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  // AI State
  analysisResult = signal<string>('');
  isAnalyzing = signal<boolean>(false);
  
  msgConfigState = {
    studentId: '',
    type: 'Tunggakan SPP',
    amount: '150000'
  };
  generatedMessage = signal<string>('');
  isGeneratingMsg = signal<boolean>(false);

  // --- Computed Values ---

  t = computed(() => {
    const lang = this.appSettings().language;
    return (key: string) => TRANSLATIONS[lang][key] || key;
  });

  filteredStudents = computed(() => {
    const query = this.searchQuery().toLowerCase();
    return this.students().filter(s => 
      s.name.toLowerCase().includes(query) || 
      s.nis.includes(query)
    );
  });

  // Financial Computeds
  visibleTransactions = computed(() => {
    const filter = this.transactionFilter();
    const list = this.transactions();
    if (filter === 'all') return list;
    return list.filter(t => t.category === filter);
  });

  totalIncome = computed(() => this.transactions()
    .filter(t => t.category === 'income')
    .reduce((acc, curr) => acc + curr.amount, 0));

  totalExpenses = computed(() => this.transactions()
    .filter(t => t.category === 'expense')
    .reduce((acc, curr) => acc + curr.amount, 0));
  
  currentBalance = computed(() => this.totalIncome() - this.totalExpenses());

  // Detailed Report Breakdown
  detailedReport = computed(() => {
    const txs = this.transactions();
    const incomeGroup: Record<string, number> = {};
    const expenseGroup: Record<string, number> = {};

    txs.forEach(t => {
      if (t.category === 'income') {
        incomeGroup[t.type] = (incomeGroup[t.type] || 0) + t.amount;
      } else {
        expenseGroup[t.type] = (expenseGroup[t.type] || 0) + t.amount;
      }
    });

    return {
       income: Object.entries(incomeGroup).map(([name, total]) => ({ name, total })),
       expense: Object.entries(expenseGroup).map(([name, total]) => ({ name, total }))
    };
  });

  monthlyTarget = computed(() => this.students().length * 150000);
  
  currentMonthSPP = computed(() => this.transactions()
    .filter(t => t.category === 'income' && t.type === 'SPP' && t.month === 'Januari')
    .reduce((acc, curr) => acc + curr.amount, 0));
  
  percentageCollected = computed(() => {
    const target = this.monthlyTarget();
    return target > 0 ? Math.round((this.currentMonthSPP() / target) * 100) : 0;
  });

  paidStudentsCount = computed(() => {
    const paid = Math.round((this.currentMonthSPP() / this.monthlyTarget()) * this.students().length);
    return isNaN(paid) ? 0 : paid;
  });

  recentTransactions = computed(() => 
    [...this.transactions()].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5)
  );

  chartData = computed(() => {
    const income = this.totalIncome();
    const expense = this.totalExpenses();
    const totalFlow = income + expense;

    const data = [
      { label: this.t()('cat_income'), value: income, color: '#10b981', percentage: totalFlow ? (income/totalFlow)*100 : 0 },
      { label: this.t()('cat_expense'), value: expense, color: '#ef4444', percentage: totalFlow ? (expense/totalFlow)*100 : 0 }
    ];

    let currentDeg = 0;
    const segments = data.map(d => {
      const deg = totalFlow > 0 ? (d.value / totalFlow) * 360 : 0;
      const segment = `${d.color} ${currentDeg}deg ${currentDeg + deg}deg`;
      currentDeg += deg;
      return segment;
    });

    const isDark = this.appSettings().darkMode;
    const gradient = data.length > 0 && totalFlow > 0
      ? `conic-gradient(${segments.join(', ')})`
      : `conic-gradient(${isDark ? '#334155' : '#f1f5f9'} 0deg 360deg)`;
      
    return { data, gradient, total: this.currentBalance() };
  });

  getTextSizeClass = computed(() => {
    switch(this.appSettings().textSize) {
      case 'small': return 'text-sm';
      case 'large': return 'text-lg';
      default: return 'text-base';
    }
  });

  // --- Effects ---

  constructor() {
    effect(() => {
       const savedData = localStorage.getItem('school_finance_db');
       if (savedData) {
         try {
           const db = JSON.parse(savedData);
           this.students.set(db.students || INITIAL_STUDENTS);
           if (db.transactions) {
             // Migrate old transactions if needed
             const txs = db.transactions.map((t: any) => ({
                 ...t,
                 category: t.category || 'income',
                 studentId: t.studentId ?? null,
                 paymentMethod: t.paymentMethod || 'Tunai'
             }));
             this.transactions.set(txs);
           } else {
             this.transactions.set(INITIAL_TRANSACTIONS);
           }
           if (db.profile) this.profile.set(db.profile);
           if (db.settings) this.appSettings.set(db.settings);
           if (db.security) this.securitySettings.set(db.security);
         } catch (e) {
           console.error("Failed to load local database", e);
         }
       }
    });

    effect(() => {
      const db = {
        students: this.students(),
        transactions: this.transactions(),
        profile: this.profile(),
        settings: this.appSettings(),
        security: this.securitySettings()
      };
      localStorage.setItem('school_finance_db', JSON.stringify(db));
      if (this.appSettings().darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    });

    effect(() => {
        this.profileFormState = { ...this.profile() };
    });

    effect(() => {
        this.securityFormState.username = this.securitySettings().username;
    });
  }

  // --- Actions ---

  handleLogin(e: Event) {
    e.preventDefault();
    const { username, password } = this.loginForm;
    const config = this.securitySettings();

    if (username === config.username && password === config.password) {
        this.isLoggedIn.set(true);
        this.loginForm = { username: '', password: '' };
    } else {
        alert(this.t()('alert_login_failed'));
    }
  }

  handleLogout() {
    this.isLoggedIn.set(false);
    this.activeTab.set('dashboard');
  }

  // Transaction Actions
  openAddPayment() {
    this.validationErrors.set({});
    this.transactionFormState = {
      category: 'income',
      studentId: '',
      type: 'SPP',
      paymentMethod: 'Tunai',
      expenseDescription: '',
      month: MONTHS[new Date().getMonth()],
      year: new Date().getFullYear().toString(),
      date: new Date().toISOString().split('T')[0],
      amount: null,
      status: 'Lunas'
    };
    this.showPaymentModal.set(true);
  }

  saveTransaction() {
    this.validationErrors.set({});
    const form = this.transactionFormState;
    const errors: Record<string, string> = {};

    if (!form.date) errors['date'] = this.t()('err_required');
    if (!form.amount || form.amount <= 0) errors['amount'] = this.t()('err_amount_positive');

    if (form.category === 'income') {
        if (!form.studentId) errors['studentId'] = this.t()('err_required');
    } else {
        if (!form.expenseDescription) errors['expenseDescription'] = this.t()('err_required');
    }

    if (Object.keys(errors).length > 0) {
      this.validationErrors.set(errors);
      return;
    }

    const newTx: Transaction = {
      id: Date.now(),
      category: form.category,
      studentId: form.category === 'income' ? parseInt(form.studentId) : null,
      type: form.category === 'income' ? form.type : form.expenseDescription,
      paymentMethod: form.paymentMethod,
      month: form.category === 'income' && form.type === 'SPP' ? form.month : '-',
      year: form.category === 'income' && form.type === 'SPP' ? form.year : '-',
      amount: Number(form.amount),
      date: form.date,
      status: 'Lunas'
    };

    this.transactions.update(prev => [newTx, ...prev]);
    this.showPaymentModal.set(false);
  }

  deleteTransaction(event: Event, id: number) {
    event.stopPropagation();
    if (confirm('Apakah Anda yakin ingin menghapus data transaksi ini? Data yang dihapus tidak dapat dikembalikan.')) {
      this.transactions.update(prev => prev.filter(t => t.id !== id));
    }
  }

  // Student Actions
  openAddStudent() {
    this.validationErrors.set({});
    this.isEditingStudent.set(false);
    this.studentFormState = { id: 0, nis: '', name: '', class: '9A', status: 'Aktif' };
    this.showStudentModal.set(true);
  }

  openEditStudent(student: Student) {
    this.validationErrors.set({});
    this.isEditingStudent.set(true);
    this.studentFormState = { ...student };
    this.showStudentModal.set(true);
  }

  deleteStudent(event: Event, id: number) {
    event.stopPropagation();
    const studentId = Number(id);
    const student = this.students().find(s => s.id === studentId);
    if (!student) return;

    const relatedTransactions = this.transactions().filter(t => t.studentId === studentId);
    const txCount = relatedTransactions.length;
    
    let confirmMessage = `Apakah Anda yakin ingin menghapus data siswa: ${student.name}?`;
    
    if (txCount > 0) {
      confirmMessage += `\n\nPERINGATAN: Terdapat ${txCount} data pembayaran/transaksi yang terhubung dengan siswa ini.`;
      confirmMessage += `\nJika Anda menghapus siswa ini, SEMUA data transaksi tersebut juga akan TERHAPUS secara permanen.`;
      confirmMessage += `\n\nLanjutkan menghapus?`;
    } else {
      confirmMessage += `\n(Data yang dihapus tidak dapat dikembalikan)`;
    }

    if (confirm(confirmMessage)) {
      if (txCount > 0) {
        // Hapus transaksi terkait terlebih dahulu (Cascade Delete)
        this.transactions.update(prev => prev.filter(t => t.studentId !== studentId));
      }
      // Hapus data siswa
      this.students.update(prev => prev.filter(s => s.id !== studentId));
      
      // Jika siswa yang dihapus sedang dipilih di form (edge case), reset form
      if (this.studentFormState.id === studentId) {
         this.showStudentModal.set(false);
      }
    }
  }

  saveStudent() {
    this.validationErrors.set({});
    const form = this.studentFormState;
    const errors: Record<string, string> = {};

    if (!form.nis) {
      errors['nis'] = this.t()('err_required');
    } else if (!this.isEditingStudent()) {
       const isDuplicate = this.students().some(s => s.nis === form.nis);
       if (isDuplicate) errors['nis'] = this.t()('err_nis_unique');
    }

    if (!form.name) errors['name'] = this.t()('err_required');
    else if (form.name.length < 3) errors['name'] = this.t()('err_name_length');

    if (!form.class) errors['class'] = this.t()('err_required');

    if (Object.keys(errors).length > 0) {
      this.validationErrors.set(errors);
      return;
    }

    if (this.isEditingStudent()) {
      this.students.update(prev => prev.map(s => s.id === form.id ? form : s));
    } else {
      this.students.update(prev => [...prev, { ...form, id: Date.now() }]);
    }
    this.showStudentModal.set(false);
  }

  // --- Settings Actions ---
  
  setTheme(isDark: boolean) {
    this.appSettings.update(s => ({ ...s, darkMode: isDark }));
  }

  setLanguage(language: 'id' | 'en') {
    this.appSettings.update(s => ({ ...s, language }));
  }

  saveProfile() {
    this.profile.set({ ...this.profileFormState });
    alert(this.t()('alert_profile_saved'));
  }

  saveSecurityCredentials() {
    const form = this.securityFormState;
    const currentConfig = this.securitySettings();

    if (form.currentPassword !== currentConfig.password) {
        alert(this.t()('alert_old_pass_wrong'));
        return;
    }

    const isChangingPass = form.newPassword.trim().length > 0;
    
    if (isChangingPass) {
        if (form.newPassword !== form.confirmPassword) {
            alert(this.t()('alert_pass_mismatch'));
            return;
        }
    }

    this.securitySettings.update(prev => ({
        username: form.username,
        password: isChangingPass ? form.newPassword : prev.password
    }));

    this.securityFormState.currentPassword = '';
    this.securityFormState.newPassword = '';
    this.securityFormState.confirmPassword = '';

    alert(this.t()('alert_pass_saved'));
  }

  backupDatabase() {
    const db = {
      students: this.students(),
      transactions: this.transactions(),
      profile: this.profile(),
      settings: this.appSettings(),
      security: this.securitySettings(),
      backupDate: new Date().toISOString()
    };
    
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(db));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "finance_backup_" + new Date().toISOString().split('T')[0] + ".json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  
  triggerRestore() {
    this.fileInput.nativeElement.click();
  }

  restoreDatabase(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    
    const file = input.files[0];
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const db = JSON.parse(text);
        
        if (db.students) this.students.set(db.students);
        if (db.transactions) {
           const txs = db.transactions.map((t: any) => ({
             ...t, 
             category: t.category || 'income',
             studentId: t.studentId ?? null,
             paymentMethod: t.paymentMethod || 'Tunai'
           }));
           this.transactions.set(txs);
        }
        if (db.profile) this.profile.set(db.profile);
        if (db.settings) this.appSettings.set(db.settings);
        if (db.security) this.securitySettings.set(db.security);
        
        alert(this.t()('alert_import_success'));
      } catch (err) {
        alert('File rusak atau format salah.');
        console.error(err);
      }
    };
    reader.readAsText(file);
    input.value = '';
  }

  getStudentName(id: number | null): string {
    if (id === null) return '-';
    return this.students().find(s => s.id === id)?.name || 'Unknown';
  }

  getStatusColor(status: string): string {
    switch(status) {
      case 'Lunas': return 'bg-emerald-100 text-emerald-700';
      case 'Aktif': return 'bg-blue-100 text-blue-700';
      case 'Non-Aktif': return 'bg-slate-100 text-slate-500';
      default: return 'bg-slate-100 text-slate-600';
    }
  }

  // --- AI Logic ---
  async generateAIAnalysis() {
    this.isAnalyzing.set(true);
    this.analysisResult.set('');
    
    try {
      const dataSummary = {
        totalIncome: this.totalIncome(),
        totalExpenses: this.totalExpenses(),
        balance: this.currentBalance(),
        studentCount: this.students().length,
        sppCollected: this.transactions().filter(t => t.type === 'SPP').reduce((acc, c) => acc + c.amount, 0),
      };

      const prompt = `
        Context: You are a helpful financial assistant for a homeroom teacher in Indonesia.
        Data: ${JSON.stringify(dataSummary)}
        Task: Analyze the financial data summary above.
        Provide:
        1. A brief summary of the financial health.
        2. Recommendations for managing the class cash flow.
        Language: Indonesian (Formal but friendly).
      `;

      const apiKey = (typeof process !== 'undefined' && process.env) ? process.env['API_KEY'] : ''; 
      
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });
      
      this.analysisResult.set(response.text || 'Gagal menganalisis.');

    } catch (error) {
      console.error("AI Error:", error);
      this.analysisResult.set('Terjadi kesalahan koneksi AI. Pastikan API Key valid.');
    } finally {
      this.isAnalyzing.set(false);
    }
  }

  async generateWAMessage() {
    const config = this.msgConfigState;
    const student = this.students().find(s => s.id === parseInt(config.studentId));
    if (!student) return;

    this.isGeneratingMsg.set(true);
    this.generatedMessage.set('');

    try {
      const prompt = `
        Context: Create a polite WhatsApp message draft for a homeroom teacher to send to a student's parent.
        Student Name: ${student.name}
        Payment Issue: ${config.type}
        Amount Due: Rp ${config.amount}
        Tone: Professional, polite, respectful, yet clear about the obligation.
        Language: Indonesian.
        Output: Only the message body text.
      `;

      const apiKey = (typeof process !== 'undefined' && process.env) ? process.env['API_KEY'] : ''; 
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      this.generatedMessage.set(response.text || 'Gagal membuat pesan.');
    } catch (error) {
       this.generatedMessage.set('Terjadi kesalahan koneksi AI.');
    } finally {
      this.isGeneratingMsg.set(false);
    }
  }

  copyToClipboard() {
    navigator.clipboard.writeText(this.generatedMessage());
    alert(this.t()('alert_copied'));
  }

  sendToWhatsApp() {
    const text = this.generatedMessage();
    if (!text) return;
    const url = `https://web.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  }
}
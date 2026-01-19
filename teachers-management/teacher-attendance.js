// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    checkSession();
    setupEventListeners();
    setupResponsiveSidebar();
    loadTeachersData(); // Load teachers data first
    loadAttendanceData();
});

// Global variables
let sidebarCollapsed = false;
let isMobile = window.innerWidth < 1024;
let currentTeacherForAttendance = null;
let attendanceSheetData = [];

// ============================================================
// NEW: ATTENDANCE DETAILS AND SALARY SLIP GLOBAL VARIABLES
// ============================================================
let currentViewingTeacherId = null;
let currentCalendarMonth = null;
let currentCalendarYear = null;
let salarySlipData = null;

// Session Management
const USER_SESSION_KEY = 'school_portal_session';
const ATTENDANCE_DATA_KEY = 'school_portal_attendance_data';
const TEACHERS_DATA_KEY = 'school_portal_data_teachers';

function checkSession() {
    const session = localStorage.getItem(USER_SESSION_KEY);
    if (!session) {
        console.log("Session check bypassed for testing");
    }
}

function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem(USER_SESSION_KEY);
        window.location.href = '../login.html';
    }
}

// Application State
let appState = {
    attendance: [],
    teachers: [],
    currentDate: new Date().toISOString().split('T')[0],
    filteredAttendance: []
};

// Load teachers data
function loadTeachersData() {
    const savedTeachers = localStorage.getItem(TEACHERS_DATA_KEY);
    
    if (savedTeachers) {
        try {
            const parsedData = JSON.parse(savedTeachers);
            appState.teachers = parsedData.teachers || [];
        } catch (error) {
            console.error("Error parsing teachers data:", error);
            appState.teachers = generateSampleTeachersData();
        }
    } else {
        appState.teachers = generateSampleTeachersData();
        saveTeachersData();
    }
    
    if (appState.teachers.length === 0) {
        appState.teachers = generateSampleTeachersData();
        saveTeachersData();
    }
}

function generateSampleTeachersData() {
    return [
        { 
            id: 1, 
            name: 'Mr. Rajesh Sharma', 
            department: 'Mathematics', 
            designation: 'Senior Teacher', 
            teacherId: 'TCH1001',
            email: 'rajesh.sharma@school.edu',
            phone: '9876543210',
            joiningDate: '2020-06-15',
            subjects: ['Mathematics', 'Advanced Maths']
        },
        { 
            id: 2, 
            name: 'Ms. Priya Patel', 
            department: 'English', 
            designation: 'Teacher', 
            teacherId: 'TCH1002',
            email: 'priya.patel@school.edu',
            phone: '9876543211',
            joiningDate: '2021-03-10',
            subjects: ['English Literature', 'Grammar']
        },
        { 
            id: 3, 
            name: 'Mr. Amit Kumar', 
            department: 'Science', 
            designation: 'HOD - Science', 
            teacherId: 'TCH1003',
            email: 'amit.kumar@school.edu',
            phone: '9876543212',
            joiningDate: '2019-08-22',
            subjects: ['Physics', 'Chemistry']
        },
        { 
            id: 4, 
            name: 'Mrs. Sunita Verma', 
            department: 'Social Science', 
            designation: 'Teacher', 
            teacherId: 'TCH1004',
            email: 'sunita.verma@school.edu',
            phone: '9876543213',
            joiningDate: '2022-01-05',
            subjects: ['History', 'Geography']
        },
        { 
            id: 5, 
            name: 'Mr. Ravi Singh', 
            department: 'Physical Education', 
            designation: 'Sports Coach', 
            teacherId: 'TCH1005',
            email: 'ravi.singh@school.edu',
            phone: '9876543214',
            joiningDate: '2020-11-30',
            subjects: ['Physical Education', 'Sports']
        }
    ];
}

function saveTeachersData() {
    localStorage.setItem(TEACHERS_DATA_KEY, JSON.stringify({
        teachers: appState.teachers,
        lastUpdated: new Date().toISOString()
    }));
}

// Toast Notification System
class Toast {
    static show(message, type = 'success', duration = 3000) {
        const toast = document.createElement('div');
        const bgColor = {
            success: 'bg-green-500',
            error: 'bg-red-500',
            warning: 'bg-yellow-500',
            info: 'bg-blue-500'
        }[type];
        
        const icon = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        }[type];
        
        toast.className = `toast ${bgColor} text-white flex items-center space-x-3`;
        toast.innerHTML = `<i class="fas ${icon} text-xl"></i><span>${message}</span>`;
        
        document.getElementById('toastContainer').appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 10);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }
}

// Setup Event Listeners
function setupEventListeners() {
    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Sidebar Toggle
    const sidebarToggle = document.getElementById('sidebarToggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', toggleSidebar);
    }
    
    // Notifications Dropdown
    const notificationsBtn = document.getElementById('notificationsBtn');
    if (notificationsBtn) {
        notificationsBtn.addEventListener('click', toggleNotifications);
    }
    
    // User Menu Dropdown
    const userMenuBtn = document.getElementById('userMenuBtn');
    if (userMenuBtn) {
        userMenuBtn.addEventListener('click', toggleUserMenu);
    }
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', function(event) {
        if (!event.target.closest('#notificationsBtn')) {
            const notificationsDropdown = document.getElementById('notificationsDropdown');
            if (notificationsDropdown) {
                notificationsDropdown.classList.add('hidden');
            }
        }
        if (!event.target.closest('#userMenuBtn')) {
            const userMenuDropdown = document.getElementById('userMenuDropdown');
            if (userMenuDropdown) {
                userMenuDropdown.classList.add('hidden');
            }
        }
    });
    
    // Close sidebar when clicking on overlay
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', closeMobileSidebar);
    }
    
    // Date change
    const attendanceDate = document.getElementById('attendanceDate');
    if (attendanceDate) {
        attendanceDate.value = appState.currentDate;
        attendanceDate.addEventListener('change', function() {
            appState.currentDate = this.value;
            loadAttendanceData();
        });
    }
    
    // Filter changes
    const filters = ['filterDepartment', 'filterAttendanceStatus'];
    filters.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('change', loadAttendanceData);
        }
    });
    
    // Select all checkbox
    const selectAll = document.getElementById('selectAllAttendance');
    if (selectAll) {
        selectAll.addEventListener('change', function() {
            const checkboxes = document.querySelectorAll('.attendance-checkbox');
            checkboxes.forEach(cb => cb.checked = this.checked);
        });
    }
    
    // NEW: Add event listener for basic salary field to calculate daily rate
    document.addEventListener('change', function(e) {
        if (e.target && e.target.id === 'basicSalary') {
            const basicSalary = parseFloat(e.target.value) || 0;
            const dailyRateField = document.getElementById('dailyRate');
            if (dailyRateField) {
                // Calculate daily rate based on 26 working days
                dailyRateField.value = Math.round(basicSalary / 26);
            }
        }
        
        if (e.target && e.target.id === 'salarySlipMonth') {
            const teacherSelect = document.getElementById('salarySlipTeacherId');
            if (teacherSelect && teacherSelect.value) {
                calculateAttendanceSummaryForSalary(parseInt(teacherSelect.value));
            }
        }
    });
}

// Responsive Sidebar Functions
function setupResponsiveSidebar() {
    isMobile = window.innerWidth < 1024;
    
    if (isMobile) {
        closeMobileSidebar();
    } else {
        const sidebar = document.getElementById('sidebar');
        const mainContent = document.getElementById('mainContent');
        
        if (sidebarCollapsed) {
            if (sidebar) sidebar.classList.add('collapsed');
            if (mainContent) mainContent.classList.add('sidebar-collapsed');
        } else {
            if (sidebar) sidebar.classList.remove('collapsed');
            if (mainContent) mainContent.classList.remove('sidebar-collapsed');
        }
    }
    
    window.addEventListener('resize', handleResize);
}

function handleResize() {
    const wasMobile = isMobile;
    isMobile = window.innerWidth < 1024;
    
    if (wasMobile !== isMobile) {
        if (isMobile) {
            closeMobileSidebar();
        } else {
            const sidebar = document.getElementById('sidebar');
            const mainContent = document.getElementById('mainContent');
            const overlay = document.getElementById('sidebarOverlay');
            
            if (sidebar) sidebar.classList.remove('mobile-open');
            if (overlay) overlay.classList.remove('active');
            document.body.classList.remove('sidebar-open');
            
            if (sidebarCollapsed) {
                if (sidebar) sidebar.classList.add('collapsed');
                if (mainContent) mainContent.classList.add('sidebar-collapsed');
            } else {
                if (sidebar) sidebar.classList.remove('collapsed');
                if (mainContent) mainContent.classList.remove('sidebar-collapsed');
            }
        }
    }
}

function toggleSidebar() {
    if (isMobile) {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        
        if (sidebar.classList.contains('mobile-open')) {
            closeMobileSidebar();
        } else {
            openMobileSidebar();
        }
    } else {
        const sidebar = document.getElementById('sidebar');
        const mainContent = document.getElementById('mainContent');
        
        sidebarCollapsed = !sidebarCollapsed;
        
        if (sidebarCollapsed) {
            sidebar.classList.add('collapsed');
            mainContent.classList.add('sidebar-collapsed');
            document.getElementById('sidebarToggleIcon').className = 'fas fa-bars text-xl';
        } else {
            sidebar.classList.remove('collapsed');
            mainContent.classList.remove('sidebar-collapsed');
            document.getElementById('sidebarToggleIcon').className = 'fas fa-times text-xl';
        }
    }
}

function openMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    
    if (sidebar) sidebar.classList.add('mobile-open');
    if (overlay) overlay.classList.add('active');
    document.body.classList.add('sidebar-open');
}

function closeMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    
    if (sidebar) sidebar.classList.remove('mobile-open');
    if (overlay) overlay.classList.remove('active');
    document.body.classList.remove('sidebar-open');
}

// Dropdown Toggles
function toggleNotifications() {
    const dropdown = document.getElementById('notificationsDropdown');
    if (dropdown) {
        dropdown.classList.toggle('hidden');
    }
}

function toggleUserMenu() {
    const dropdown = document.getElementById('userMenuDropdown');
    if (dropdown) {
        dropdown.classList.toggle('hidden');
    }
}

// Data Management
function loadAttendanceData() {
    showLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
        // Ensure teachers are loaded
        if (appState.teachers.length === 0) {
            loadTeachersData();
        }
        
        // Load attendance data
        const savedAttendance = localStorage.getItem(ATTENDANCE_DATA_KEY);
        if (savedAttendance) {
            try {
                const parsedData = JSON.parse(savedAttendance);
                appState.attendance = parsedData.attendance || [];
            } catch (error) {
                console.error("Error parsing attendance data:", error);
                appState.attendance = generateSampleAttendanceData();
            }
        } else {
            appState.attendance = generateSampleAttendanceData();
            saveAttendanceData();
        }
        
        renderAttendanceTable();
        renderAttendanceStats();
        renderDepartmentWiseAttendance();
        renderMonthlyTrend();
        renderLeaveRequests();
        showLoading(false);
    }, 500);
}

function saveAttendanceData() {
    localStorage.setItem(ATTENDANCE_DATA_KEY, JSON.stringify({
        attendance: appState.attendance,
        lastUpdated: new Date().toISOString()
    }));
}

function generateSampleAttendanceData() {
    const today = new Date().toISOString().split('T')[0];
    const attendance = [];
    
    appState.teachers.forEach(teacher => {
        const statuses = ['Present', 'Present', 'Present', 'Late', 'Half Day', 'On Leave'];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        let timeIn = '', timeOut = '', lateBy = '', note = '';
        
        if (status === 'Present') {
            timeIn = '08:0' + Math.floor(Math.random() * 5) + ' AM';
            timeOut = '03:3' + Math.floor(Math.random() * 5) + ' PM';
            note = '';
        } else if (status === 'Late') {
            timeIn = '08:4' + Math.floor(Math.random() * 5) + ' AM';
            timeOut = '03:3' + Math.floor(Math.random() * 5) + ' PM';
            lateBy = (15 + Math.floor(Math.random() * 30)) + ' mins';
            note = 'Traffic delay';
        } else if (status === 'Half Day') {
            timeIn = '08:00 AM';
            timeOut = '12:3' + Math.floor(Math.random() * 5) + ' PM';
            note = 'Medical appointment';
        } else if (status === 'On Leave') {
            note = ['Casual leave', 'Sick leave', 'Personal work'][Math.floor(Math.random() * 3)];
        }
        
        attendance.push({
            id: Date.now() + teacher.id,
            teacherId: teacher.id,
            date: today,
            status: status,
            timeIn: timeIn,
            timeOut: timeOut,
            lateBy: lateBy,
            note: note,
            lastUpdated: new Date().toISOString(),
            markedBy: 'admin'
        });
    });
    
    return attendance;
}

// Render Functions
function renderAttendanceTable() {
    const tbody = document.getElementById('attendanceTableBody');
    const tableTitle = document.getElementById('attendanceTableTitle');
    
    if (!tbody || !tableTitle) return;
    
    tbody.innerHTML = '';
    
    const selectedDate = document.getElementById('attendanceDate').value;
    const departmentFilter = document.getElementById('filterDepartment').value;
    const statusFilter = document.getElementById('filterAttendanceStatus').value;
    
    // Filter attendance for selected date
    let filteredAttendance = appState.attendance.filter(record => 
        record.date === selectedDate
    );
    
    // Get teacher details for each attendance record
    filteredAttendance = filteredAttendance.map(record => {
        const teacher = appState.teachers.find(t => t.id === record.teacherId);
        return {
            ...record,
            teacherDetails: teacher || { name: 'Unknown Teacher', department: 'Unknown', designation: 'Unknown', teacherId: 'Unknown' }
        };
    });
    
    // Apply additional filters
    if (departmentFilter) {
        filteredAttendance = filteredAttendance.filter(record => 
            record.teacherDetails.department === departmentFilter
        );
    }
    
    if (statusFilter) {
        filteredAttendance = filteredAttendance.filter(record => 
            record.status === statusFilter
        );
    }
    
    appState.filteredAttendance = filteredAttendance;
    
    // Update table title
    const dateObj = new Date(selectedDate);
    const formattedDate = dateObj.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    tableTitle.textContent = `Attendance for ${formattedDate}`;
    
    // Update counts
    const startCount = document.getElementById('attendanceStartCount');
    const totalCount = document.getElementById('attendanceTotalCount');
    
    if (startCount) startCount.textContent = filteredAttendance.length;
    if (totalCount) totalCount.textContent = appState.teachers.length;
    
    if (filteredAttendance.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="6" class="px-6 py-12 text-center"><i class="fas fa-clipboard-check text-4xl text-gray-300 mb-3"></i><p class="text-lg text-gray-600">No attendance records found</p><p class="text-sm text-gray-500 mt-2">Try selecting a different date or adjusting your filters</p></td>';
        tbody.appendChild(row);
    } else {
        filteredAttendance.forEach(record => {
            const teacher = record.teacherDetails;
            const statusBadge = getAttendanceStatusBadge(record.status);
            let timeDisplay = '';
            let actionButtons = '';
            
            if (record.status === 'Present' || record.status === 'Late' || record.status === 'Half Day') {
                timeDisplay = `${record.timeIn || 'N/A'} - ${record.timeOut || 'N/A'}`;
            } else {
                timeDisplay = 'Not marked';
            }
            
            // UPDATED: Added "Details" button
            actionButtons = `
                <button onclick="openMarkAttendanceModal(${record.teacherId})" class="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs">
                    <i class="fas fa-edit mr-1"></i>Edit
                </button>
                <button onclick="openAttendanceDetails(${record.teacherId})" class="px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-xs">
                    <i class="fas fa-calendar-alt mr-1"></i>Details
                </button>
            `;
            
            const row = document.createElement('tr');
            row.className = 'hover:bg-gray-50 transition-colors duration-150';
            row.innerHTML = `
                <td class="px-6 py-4">
                    <input type="checkbox" class="attendance-checkbox rounded border-gray-300" data-id="${record.id}">
                </td>
                <td class="px-6 py-4">
                    <div class="flex items-center">
                        <div class="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <i class="fas fa-user-tie text-blue-600"></i>
                        </div>
                        <div>
                            <div class="font-medium text-gray-900">${teacher.name}</div>
                            <div class="text-sm text-gray-500">${teacher.teacherId}</div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4">
                    <div class="font-medium text-gray-900">${teacher.department}</div>
                    <div class="text-sm text-gray-500">${teacher.designation}</div>
                </td>
                <td class="px-6 py-4">
                    <div class="font-medium">${timeDisplay}</div>
                    ${record.note ? `<div class="text-xs text-gray-500 mt-1"><i class="fas fa-sticky-note mr-1"></i>${record.note}</div>` : ''}
                    ${record.lateBy ? `<div class="text-xs text-red-500 mt-1">Late by: ${record.lateBy}</div>` : ''}
                </td>
                <td class="px-6 py-4">${statusBadge}</td>
                <td class="px-6 py-4"><div class="flex space-x-2">${actionButtons}</div></td>
            `;
            tbody.appendChild(row);
        });
    }
}

function getAttendanceStatusBadge(status) {
    switch(status) {
        case 'Present':
            return '<span class="status-badge status-present">Present</span>';
        case 'Absent':
            return '<span class="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">Absent</span>';
        case 'Late':
            return '<span class="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">Late</span>';
        case 'Half Day':
            return '<span class="status-badge status-halfday">Half Day</span>';
        case 'On Leave':
            return '<span class="status-badge status-leave">On Leave</span>';
        default:
            return '<span class="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">Unknown</span>';
    }
}

function renderAttendanceStats() {
    const container = document.getElementById('attendanceStats');
    if (!container) return;
    
    const selectedDate = document.getElementById('attendanceDate').value;
    const todayAttendance = appState.attendance.filter(record => record.date === selectedDate);
    
    const totalTeachers = appState.teachers.length;
    const presentCount = todayAttendance.filter(r => r.status === 'Present').length;
    const absentCount = todayAttendance.filter(r => r.status === 'Absent').length;
    const lateCount = todayAttendance.filter(r => r.status === 'Late').length;
    const leaveCount = todayAttendance.filter(r => r.status === 'On Leave').length;
    const halfDayCount = todayAttendance.filter(r => r.status === 'Half Day').length;
    
    const attendancePercentage = totalTeachers > 0 ? 
        Math.round((presentCount / totalTeachers) * 100) : 0;
    
    container.innerHTML = `
        <div class="bg-white p-6 rounded-xl shadow border border-gray-200">
            <div class="flex items-center">
                <div class="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                    <i class="fas fa-users text-blue-600 text-xl"></i>
                </div>
                <div>
                    <p class="text-sm text-gray-600">Total Teachers</p>
                    <p class="text-2xl font-bold text-gray-800">${totalTeachers}</p>
                </div>
            </div>
        </div>
        
        <div class="bg-white p-6 rounded-xl shadow border border-gray-200">
            <div class="flex items-center">
                <div class="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                    <i class="fas fa-check-circle text-green-600 text-xl"></i>
                </div>
                <div>
                    <p class="text-sm text-gray-600">Present Today</p>
                    <p class="text-2xl font-bold text-gray-800">${presentCount}</p>
                    <p class="text-xs text-green-600 mt-1">${totalTeachers > 0 ? Math.round((presentCount / totalTeachers) * 100) : 0}% of total</p>
                </div>
            </div>
        </div>
        
        <div class="bg-white p-6 rounded-xl shadow border border-gray-200">
            <div class="flex items-center">
                <div class="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
                    <i class="fas fa-times-circle text-red-600 text-xl"></i>
                </div>
                <div>
                    <p class="text-sm text-gray-600">Absent Today</p>
                    <p class="text-2xl font-bold text-gray-800">${absentCount}</p>
                    <p class="text-xs text-red-600 mt-1">${totalTeachers > 0 ? Math.round((absentCount / totalTeachers) * 100) : 0}% of total</p>
                </div>
            </div>
        </div>
        
        <div class="bg-white p-6 rounded-xl shadow border border-gray-200">
            <div class="flex items-center">
                <div class="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
                    <i class="fas fa-percentage text-yellow-600 text-xl"></i>
                </div>
                <div>
                    <p class="text-sm text-gray-600">Attendance %</p>
                    <p class="text-2xl font-bold text-gray-800">${attendancePercentage}%</p>
                    <p class="text-xs ${attendancePercentage >= 90 ? 'text-green-600' : attendancePercentage >= 80 ? 'text-yellow-600' : 'text-red-600'} mt-1">
                        ${attendancePercentage >= 90 ? 'Excellent' : attendancePercentage >= 80 ? 'Good' : 'Needs Improvement'}
                    </p>
                </div>
            </div>
        </div>
    `;
}

function renderDepartmentWiseAttendance() {
    const container = document.getElementById('departmentWiseAttendance');
    if (!container) return;
    
    const selectedDate = document.getElementById('attendanceDate').value;
    const todayAttendance = appState.attendance.filter(record => record.date === selectedDate);
    
    // Group by department
    const departmentStats = {};
    
    appState.teachers.forEach(teacher => {
        if (!departmentStats[teacher.department]) {
            departmentStats[teacher.department] = {
                total: 0,
                present: 0
            };
        }
        departmentStats[teacher.department].total++;
        
        const attendanceRecord = todayAttendance.find(r => r.teacherId === teacher.id);
        if (attendanceRecord && attendanceRecord.status === 'Present') {
            departmentStats[teacher.department].present++;
        }
    });
    
    let html = '';
    for (const [department, stats] of Object.entries(departmentStats)) {
        const percentage = stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0;
        
        html += `
            <div>
                <div class="flex justify-between items-center mb-1">
                    <span class="font-medium">${department}</span>
                    <span class="font-bold ${percentage >= 90 ? 'text-green-600' : percentage >= 80 ? 'text-yellow-600' : 'text-red-600'}">${percentage}%</span>
                </div>
                <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div class="h-full ${percentage >= 90 ? 'bg-green-500' : percentage >= 80 ? 'bg-yellow-500' : 'bg-red-500'} rounded-full" style="width: ${percentage}%"></div>
                </div>
                <div class="text-sm text-gray-500 mt-1">${stats.present}/${stats.total} teachers</div>
            </div>
        `;
    }
    
    container.innerHTML = html;
}

function renderMonthlyTrend() {
    const container = document.getElementById('monthlyAttendanceTrend');
    if (!container) return;
    
    // Generate sample monthly data
    const monthlyData = [
        { month: 'Jan', present: 22, absent: 2, leave: 1, percentage: 88 },
        { month: 'Feb', present: 20, absent: 0, leave: 0, percentage: 100 },
        { month: 'Mar', present: 23, absent: 1, leave: 1, percentage: 92 },
        { month: 'Apr', present: 21, absent: 3, leave: 1, percentage: 84 },
        { month: 'May', present: 19, absent: 1, leave: 0, percentage: 95 },
        { month: 'Jun', present: 22, absent: 0, leave: 0, percentage: 100 }
    ];
    
    let html = '';
    monthlyData.forEach(month => {
        html += `
            <div>
                <div class="flex justify-between items-center mb-1">
                    <span class="font-medium">${month.month}</span>
                    <span class="font-bold ${month.percentage >= 90 ? 'text-green-600' : month.percentage >= 80 ? 'text-yellow-600' : 'text-red-600'}">${month.percentage}%</span>
                </div>
                <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div class="h-full ${month.percentage >= 90 ? 'bg-green-500' : month.percentage >= 80 ? 'bg-yellow-500' : 'bg-red-500'} rounded-full" style="width: ${month.percentage}%"></div>
                </div>
                <div class="text-sm text-gray-500 mt-1">Present: ${month.present} | Absent: ${month.absent} | Leave: ${month.leave}</div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function renderLeaveRequests() {
    const container = document.getElementById('leaveRequestsTableBody');
    if (!container) return;
    
    // Sample leave requests data
    const leaveRequests = [
        { 
            id: 1, 
            teacherId: 5,
            teacherName: 'Mr. Ravi Singh', 
            department: 'Physical Education', 
            teacherCode: 'TCH1005',
            leaveType: 'Sick Leave', 
            fromDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], 
            toDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0], 
            days: 2, 
            status: 'Pending', 
            reason: 'Fever and cold',
            appliedOn: new Date().toISOString().split('T')[0]
        },
        { 
            id: 2, 
            teacherId: 4,
            teacherName: 'Mrs. Sunita Verma', 
            department: 'Social Science', 
            teacherCode: 'TCH1004',
            leaveType: 'Personal Leave', 
            fromDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0], 
            toDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0], 
            days: 1, 
            status: 'Pending', 
            reason: 'Family function',
            appliedOn: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0]
        }
    ];
    
    const pendingRequests = leaveRequests.filter(request => request.status === 'Pending');
    
    if (pendingRequests.length === 0) {
        container.innerHTML = '<tr><td colspan="7" class="px-4 py-8 text-center text-gray-500"><i class="fas fa-check-circle text-3xl text-green-400 mb-2"></i><p>No pending leave requests</p></td></tr>';
    } else {
        let html = '';
        pendingRequests.forEach(request => {
            html += `
                <tr class="hover:bg-gray-50">
                    <td class="px-4 py-3">
                        <div class="font-medium">${request.teacherName}</div>
                        <div class="text-sm text-gray-500">${request.department} • ${request.teacherCode}</div>
                    </td>
                    <td class="px-4 py-3">
                        <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">${request.leaveType}</span>
                    </td>
                    <td class="px-4 py-3">
                        ${new Date(request.fromDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(request.toDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </td>
                    <td class="px-4 py-3 font-medium">${request.days}</td>
                    <td class="px-4 py-3">
                        <div class="text-sm text-gray-600 truncate max-w-xs">${request.reason}</div>
                    </td>
                    <td class="px-4 py-3">
                        ${new Date(request.appliedOn).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </td>
                    <td class="px-4 py-3">
                        <div class="flex space-x-2">
                            <button onclick="approveLeave(${request.id})" class="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-xs">Approve</button>
                            <button onclick="rejectLeave(${request.id})" class="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 text-xs">Reject</button>
                            <button onclick="contactTeacher(${request.teacherId})" class="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs"><i class="fas fa-phone"></i></button>
                        </div>
                    </td>
                </tr>
            `;
        });
        container.innerHTML = html;
    }
}

// ============================================================
// ATTENDANCE SHEET FUNCTIONS (EXISTING)
// ============================================================

function openAttendanceSheet() {
    const modal = document.getElementById('attendanceSheetModal');
    const dateInput = document.getElementById('attendanceSheetDate');
    const dateText = document.getElementById('attendanceSheetDateText');
    
    if (dateInput) {
        dateInput.value = appState.currentDate;
        const formattedDate = new Date(appState.currentDate).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        if (dateText) {
            dateText.textContent = `Attendance for ${formattedDate}`;
        }
    }
    
    loadAttendanceSheetData();
    if (modal) {
        modal.classList.add('show');
    }
}

function closeAttendanceSheet() {
    const modal = document.getElementById('attendanceSheetModal');
    if (modal) {
        modal.classList.remove('show');
    }
}

function loadAttendanceSheetData() {
    const dateInput = document.getElementById('attendanceSheetDate');
    const departmentSelect = document.getElementById('attendanceSheetFilterDepartment');
    
    if (!dateInput || !departmentSelect) return;
    
    const date = dateInput.value;
    const department = departmentSelect.value;
    
    // Filter teachers
    let filteredTeachers = [...appState.teachers];
    
    if (department) {
        filteredTeachers = filteredTeachers.filter(teacher => teacher.department === department);
    }
    
    // Initialize attendance sheet data
    attendanceSheetData = filteredTeachers.map(teacher => {
        // Check if attendance already exists for this date
        const existingAttendance = appState.attendance.find(record => 
            record.teacherId === teacher.id && record.date === date
        );
        
        return {
            teacherId: teacher.id,
            teacherCode: teacher.teacherId || `TCH${teacher.id.toString().padStart(4, '0')}`,
            name: teacher.name,
            department: teacher.department,
            designation: teacher.designation,
            status: existingAttendance?.status || 'Present',
            timeIn: existingAttendance?.timeIn || '08:00 AM',
            timeOut: existingAttendance?.timeOut || '03:30 PM',
            remarks: existingAttendance?.note || '',
            isEdited: false
        };
    });
    
    renderAttendanceSheetTable();
    updateAttendanceSummary();
}

function renderAttendanceSheetTable() {
    const tbody = document.getElementById('attendanceSheetTableBody');
    
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (attendanceSheetData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="10" class="px-4 py-8 text-center text-gray-500"><i class="fas fa-user-slash text-3xl text-gray-300 mb-2"></i><p>No teachers found</p><p class="text-sm mt-1">Try adjusting your filters</p></td></tr>';
        return;
    }
    
    attendanceSheetData.forEach((teacher, index) => {
        const row = document.createElement('tr');
        row.className = `hover:bg-gray-50 transition-colors duration-150 ${teacher.isEdited ? 'highlight-edited' : ''}`;
        
        // Generate status options HTML
        const statusOptions = ['Present', 'Absent', 'Late', 'Half Day', 'On Leave']
            .map(status => `<option value="${status}" ${teacher.status === status ? 'selected' : ''}>${status}</option>`)
            .join('');
        
        row.innerHTML = `
            <td class="px-4 py-3 font-medium">${index + 1}</td>
            <td class="px-4 py-3 font-medium">${teacher.teacherCode}</td>
            <td class="px-4 py-3">
                <div class="font-medium">${teacher.name}</div>
                <div class="text-xs text-gray-500">ID: ${teacher.teacherId || teacher.teacherCode}</div>
            </td>
            <td class="px-4 py-3">${teacher.department}</td>
            <td class="px-4 py-3">${teacher.designation}</td>
            <td class="px-4 py-3">
                <select class="attendance-status-select w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" data-teacher-code="${teacher.teacherCode}" onchange="updateAttendanceStatus(this)">
                    ${statusOptions}
                </select>
            </td>
            <td class="px-4 py-3">
                <input type="time" value="${teacher.timeIn.replace(' AM', '').replace(' PM', '')}" class="attendance-time-in w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" data-teacher-code="${teacher.teacherCode}" onchange="markAsEdited('${teacher.teacherCode}')">
            </td>
            <td class="px-4 py-3">
                <input type="time" value="${teacher.timeOut.replace(' AM', '').replace(' PM', '')}" class="attendance-time-out w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" data-teacher-code="${teacher.teacherCode}" onchange="markAsEdited('${teacher.teacherCode}')">
            </td>
            <td class="px-4 py-3">
                <input type="text" value="${teacher.remarks}" placeholder="Add remarks..." class="attendance-remarks w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" data-teacher-code="${teacher.teacherCode}" onchange="markAsEdited('${teacher.teacherCode}')">
            </td>
            <td class="px-4 py-3">
                <div class="flex space-x-1">
                    <button onclick="markTeacherPresent('${teacher.teacherCode}')" class="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs" title="Mark Present"><i class="fas fa-check"></i></button>
                    <button onclick="markTeacherAbsent('${teacher.teacherCode}')" class="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs" title="Mark Absent"><i class="fas fa-times"></i></button>
                    <button onclick="resetTeacherAttendance('${teacher.teacherCode}')" class="px-2 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 text-xs" title="Reset"><i class="fas fa-undo"></i></button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function updateAttendanceStatus(selectElement) {
    const teacherCode = selectElement.getAttribute('data-teacher-code');
    const newStatus = selectElement.value;
    
    // Find teacher in attendance sheet data
    const teacherIndex = attendanceSheetData.findIndex(t => t.teacherCode === teacherCode);
    if (teacherIndex !== -1) {
        attendanceSheetData[teacherIndex].status = newStatus;
        attendanceSheetData[teacherIndex].isEdited = true;
        
        // Auto-set time values based on status
        if (newStatus === 'Present' || newStatus === 'Late') {
            attendanceSheetData[teacherIndex].timeIn = '08:00 AM';
            attendanceSheetData[teacherIndex].timeOut = '03:30 PM';
        } else if (newStatus === 'Half Day') {
            attendanceSheetData[teacherIndex].timeIn = '08:00 AM';
            attendanceSheetData[teacherIndex].timeOut = '12:30 PM';
        } else if (newStatus === 'Absent' || newStatus === 'On Leave') {
            attendanceSheetData[teacherIndex].timeIn = '';
            attendanceSheetData[teacherIndex].timeOut = '';
        }
        
        // Re-render the row to update time inputs
        renderAttendanceSheetTable();
        updateAttendanceSummary();
    }
}

function markAsEdited(teacherCode) {
    const teacherIndex = attendanceSheetData.findIndex(t => t.teacherCode === teacherCode);
    if (teacherIndex !== -1) {
        attendanceSheetData[teacherIndex].isEdited = true;
        // Update the row style
        const rows = document.querySelectorAll('#attendanceSheetTableBody tr');
        if (rows[teacherIndex]) {
            rows[teacherIndex].classList.add('highlight-edited');
        }
    }
}

function applyAttendanceSheetFilters() {
    loadAttendanceSheetData();
}

function applyDefaultStatusToAll() {
    const defaultStatusSelect = document.getElementById('attendanceSheetDefaultStatus');
    if (!defaultStatusSelect) return;
    
    const defaultStatus = defaultStatusSelect.value;
    
    attendanceSheetData.forEach(teacher => {
        teacher.status = defaultStatus;
        teacher.isEdited = true;
        
        // Auto-set time values based on status
        if (defaultStatus === 'Present' || defaultStatus === 'Late') {
            teacher.timeIn = '08:00 AM';
            teacher.timeOut = '03:30 PM';
        } else if (defaultStatus === 'Half Day') {
            teacher.timeIn = '08:00 AM';
            teacher.timeOut = '12:30 PM';
        } else if (defaultStatus === 'Absent' || defaultStatus === 'On Leave') {
            teacher.timeIn = '';
            teacher.timeOut = '';
        }
    });
    
    renderAttendanceSheetTable();
    updateAttendanceSummary();
    Toast.show(`Applied default status (${defaultStatus}) to all teachers`, 'success');
}

function markTeacherPresent(teacherCode) {
    const teacherIndex = attendanceSheetData.findIndex(t => t.teacherCode === teacherCode);
    if (teacherIndex !== -1) {
        attendanceSheetData[teacherIndex].status = 'Present';
        attendanceSheetData[teacherIndex].timeIn = '08:00 AM';
        attendanceSheetData[teacherIndex].timeOut = '03:30 PM';
        attendanceSheetData[teacherIndex].isEdited = true;
        
        renderAttendanceSheetTable();
        updateAttendanceSummary();
        Toast.show('Marked as Present', 'success');
    }
}

function markTeacherAbsent(teacherCode) {
    const teacherIndex = attendanceSheetData.findIndex(t => t.teacherCode === teacherCode);
    if (teacherIndex !== -1) {
        attendanceSheetData[teacherIndex].status = 'Absent';
        attendanceSheetData[teacherIndex].timeIn = '';
        attendanceSheetData[teacherIndex].timeOut = '';
        attendanceSheetData[teacherIndex].isEdited = true;
        
        renderAttendanceSheetTable();
        updateAttendanceSummary();
        Toast.show('Marked as Absent', 'warning');
    }
}

function resetTeacherAttendance(teacherCode) {
    const teacherIndex = attendanceSheetData.findIndex(t => t.teacherCode === teacherCode);
    if (teacherIndex !== -1) {
        const teacher = appState.teachers.find(t => 
            t.teacherId === teacherCode || 
            `TCH${t.id.toString().padStart(4, '0')}` === teacherCode
        );
        const dateInput = document.getElementById('attendanceSheetDate');
        const date = dateInput ? dateInput.value : appState.currentDate;
        
        // Check if attendance already exists for this date
        const existingAttendance = appState.attendance.find(record => 
            record.teacherId === teacher?.id && record.date === date
        );
        
        attendanceSheetData[teacherIndex] = {
            ...attendanceSheetData[teacherIndex],
            status: existingAttendance?.status || 'Present',
            timeIn: existingAttendance?.timeIn || '08:00 AM',
            timeOut: existingAttendance?.timeOut || '03:30 PM',
            remarks: existingAttendance?.note || '',
            isEdited: false
        };
        
        renderAttendanceSheetTable();
        updateAttendanceSummary();
        Toast.show('Attendance reset to original', 'info');
    }
}

function updateAttendanceSummary() {
    const total = attendanceSheetData.length;
    const present = attendanceSheetData.filter(t => t.status === 'Present').length;
    const absent = attendanceSheetData.filter(t => t.status === 'Absent').length;
    const late = attendanceSheetData.filter(t => t.status === 'Late').length;
    
    const summaryTotal = document.getElementById('summaryTotal');
    const summaryPresent = document.getElementById('summaryPresent');
    const summaryAbsent = document.getElementById('summaryAbsent');
    const summaryLate = document.getElementById('summaryLate');
    
    if (summaryTotal) summaryTotal.textContent = total;
    if (summaryPresent) summaryPresent.textContent = present;
    if (summaryAbsent) summaryAbsent.textContent = absent;
    if (summaryLate) summaryLate.textContent = late;
}

function saveAttendanceSheet() {
    const dateInput = document.getElementById('attendanceSheetDate');
    if (!dateInput) return;
    
    const date = dateInput.value;
    const editedTeachers = attendanceSheetData.filter(t => t.isEdited);
    
    if (editedTeachers.length === 0) {
        Toast.show('No changes to save', 'info');
        return;
    }
    
    if (confirm(`Save attendance for ${editedTeachers.length} teachers on ${date}?`)) {
        editedTeachers.forEach(teacherData => {
            // Find the actual teacher object to get the ID
            const teacher = appState.teachers.find(t => 
                t.teacherId === teacherData.teacherCode || 
                `TCH${t.id.toString().padStart(4, '0')}` === teacherData.teacherCode
            );
            
            if (!teacher) return;
            
            const existingIndex = appState.attendance.findIndex(record => 
                record.teacherId === teacher.id && record.date === date
            );
            
            const attendanceRecord = {
                id: existingIndex >= 0 ? appState.attendance[existingIndex].id : Date.now(),
                teacherId: teacher.id,
                date: date,
                status: teacherData.status,
                timeIn: teacherData.timeIn,
                timeOut: teacherData.timeOut,
                note: teacherData.remarks,
                lastUpdated: new Date().toISOString(),
                markedBy: 'admin'
            };
            
            if (existingIndex >= 0) {
                appState.attendance[existingIndex] = attendanceRecord;
            } else {
                appState.attendance.push(attendanceRecord);
            }
        });
        
        saveAttendanceData();
        closeAttendanceSheet();
        loadAttendanceData(); // Refresh the main table
        
        Toast.show(`Attendance saved for ${editedTeachers.length} teachers`, 'success');
    }
}

// Existing Individual Attendance Modal Functions
function openMarkAttendanceModal(teacherId) {
    currentTeacherForAttendance = teacherId;
    const teacher = appState.teachers.find(t => t.id === teacherId);
    const modal = document.getElementById('editAttendanceModal');
    const formContainer = document.getElementById('editAttendanceForm');
    const title = document.getElementById('editAttendanceTitle');
    
    if (!teacher || !formContainer || !title) return;
    
    title.textContent = `Edit Attendance - ${teacher.name}`;
    
    // Check existing attendance for today
    const attendanceDate = document.getElementById('attendanceDate');
    const selectedDate = attendanceDate ? attendanceDate.value : appState.currentDate;
    const existingAttendance = appState.attendance.find(record => 
        record.teacherId === teacherId && record.date === selectedDate
    );
    
    formContainer.innerHTML = `
        <div class="space-y-4">
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input type="date" id="markAttendanceDate" value="${selectedDate}" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            </div>
            
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select id="markAttendanceStatus" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="Present" ${existingAttendance?.status === 'Present' ? 'selected' : ''}>Present</option>
                    <option value="Absent" ${existingAttendance?.status === 'Absent' ? 'selected' : ''}>Absent</option>
                    <option value="Late" ${existingAttendance?.status === 'Late' ? 'selected' : ''}>Late</option>
                    <option value="Half Day" ${existingAttendance?.status === 'Half Day' ? 'selected' : ''}>Half Day</option>
                    <option value="On Leave" ${existingAttendance?.status === 'On Leave' ? 'selected' : ''}>On Leave</option>
                </select>
            </div>
            
            <div id="timeFields" class="space-y-3">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Time In</label>
                    <input type="time" id="markTimeIn" value="${existingAttendance?.timeIn?.replace(' AM', '').replace(' PM', '') || '08:00'}" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Time Out</label>
                    <input type="time" id="markTimeOut" value="${existingAttendance?.timeOut?.replace(' AM', '').replace(' PM', '') || '15:30'}" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                </div>
                
                <div id="lateField" class="hidden">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Late By (minutes)</label>
                    <input type="number" id="markLateBy" value="${existingAttendance?.lateBy?.replace(' mins', '') || '15'}" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" min="1" max="240">
                </div>
            </div>
            
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Note (Optional)</label>
                <textarea id="markAttendanceNote" rows="3" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Add a note...">${existingAttendance?.note || ''}</textarea>
            </div>
            
            <div class="flex justify-end space-x-3 pt-4">
                <button onclick="closeModal('editAttendanceModal')" class="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium">Cancel</button>
                <button onclick="saveIndividualAttendance()" class="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium">Save Attendance</button>
            </div>
        </div>
    `;
    
    // Show/hide time fields based on status
    const statusSelect = document.getElementById('markAttendanceStatus');
    const timeFields = document.getElementById('timeFields');
    const lateField = document.getElementById('lateField');
    
    function updateTimeFields() {
        const status = statusSelect.value;
        if (status === 'Present' || status === 'Late' || status === 'Half Day') {
            timeFields.style.display = 'block';
            if (status === 'Late') {
                if (lateField) lateField.classList.remove('hidden');
            } else {
                if (lateField) lateField.classList.add('hidden');
            }
        } else {
            timeFields.style.display = 'none';
        }
    }
    
    if (statusSelect) {
        statusSelect.addEventListener('change', updateTimeFields);
        updateTimeFields();
    }
    
    if (modal) {
        modal.classList.add('show');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
    }
}

function saveIndividualAttendance() {
    const teacherId = currentTeacherForAttendance;
    const dateInput = document.getElementById('markAttendanceDate');
    const statusSelect = document.getElementById('markAttendanceStatus');
    const timeInInput = document.getElementById('markTimeIn');
    const timeOutInput = document.getElementById('markTimeOut');
    const lateByInput = document.getElementById('markLateBy');
    const noteInput = document.getElementById('markAttendanceNote');
    
    if (!teacherId || !dateInput || !statusSelect) {
        Toast.show('Please fill in all required fields', 'error');
        return;
    }
    
    const date = dateInput.value;
    const status = statusSelect.value;
    const timeIn = timeInInput ? timeInInput.value : '';
    const timeOut = timeOutInput ? timeOutInput.value : '';
    const lateBy = lateByInput ? lateByInput.value : '';
    const note = noteInput ? noteInput.value : '';
    
    // Format time
    const formatTime = (time) => {
        if (!time) return '';
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const formattedHour = hour % 12 || 12;
        return `${formattedHour}:${minutes} ${ampm}`;
    };
    
    // Find existing record
    const existingIndex = appState.attendance.findIndex(record => 
        record.teacherId === teacherId && record.date === date
    );
    
    const attendanceRecord = {
        id: existingIndex >= 0 ? appState.attendance[existingIndex].id : Date.now(),
        teacherId: teacherId,
        date: date,
        status: status,
        timeIn: status === 'Present' || status === 'Late' || status === 'Half Day' ? formatTime(timeIn) : '',
        timeOut: status === 'Present' || status === 'Late' || status === 'Half Day' ? formatTime(timeOut) : '',
        lateBy: status === 'Late' ? `${lateBy} mins` : '',
        note: note,
        lastUpdated: new Date().toISOString(),
        markedBy: 'admin'
    };
    
    if (existingIndex >= 0) {
        appState.attendance[existingIndex] = attendanceRecord;
    } else {
        appState.attendance.push(attendanceRecord);
    }
    
    saveAttendanceData();
    closeModal('editAttendanceModal');
    loadAttendanceData();
    
    Toast.show('Attendance saved successfully', 'success');
}

// ============================================================
// NEW: ATTENDANCE DETAILS FUNCTIONS
// ============================================================

// Function to open attendance details for a specific teacher
function openAttendanceDetails(teacherId) {
    currentViewingTeacherId = teacherId;
    const teacher = appState.teachers.find(t => t.id === teacherId);
    const modal = document.getElementById('attendanceDetailsModal');
    const title = document.getElementById('attendanceDetailsTitle');
    const subtitle = document.getElementById('attendanceDetailsSubtitle');
    
    if (!teacher || !modal || !title) return;
    
    title.textContent = `Attendance Details - ${teacher.name}`;
    if (subtitle) {
        subtitle.textContent = `Viewing attendance records for ${teacher.name}`;
    }
    
    // Update teacher info card
    updateTeacherAttendanceInfoCard(teacher);
    
    // Initialize month and year selectors
    initializeCalendarSelectors();
    
    // Load attendance calendar and history
    loadAttendanceCalendar();
    loadAttendanceHistory(teacherId);
    
    // Open modal
    modal.classList.add('show');
}

// Update teacher info card in attendance details modal
function updateTeacherAttendanceInfoCard(teacher) {
    const card = document.getElementById('teacherAttendanceInfo');
    if (!card) return;
    
    // Calculate attendance stats
    const currentMonth = new Date().toISOString().substring(0, 7);
    const monthAttendance = appState.attendance.filter(record => 
        record.teacherId === teacher.id && 
        record.date.startsWith(currentMonth)
    );
    
    const presentDays = monthAttendance.filter(r => r.status === 'Present').length;
    const absentDays = monthAttendance.filter(r => r.status === 'Absent').length;
    const lateDays = monthAttendance.filter(r => r.status === 'Late').length;
    const leaveDays = monthAttendance.filter(r => r.status === 'On Leave').length;
    
    card.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
                <div class="flex items-center">
                    <div class="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                        <i class="fas fa-chalkboard-teacher text-blue-600 text-2xl"></i>
                    </div>
                    <div>
                        <h4 class="text-xl font-bold text-gray-800">${teacher.name}</h4>
                        <p class="text-gray-600">${teacher.designation}</p>
                    </div>
                </div>
            </div>
            <div>
                <p class="text-sm text-gray-600">Department & Contact</p>
                <p class="font-semibold text-gray-800">${teacher.department}</p>
                <p class="text-sm text-gray-600 mt-1">${teacher.email}</p>
                <p class="text-sm text-gray-600">${teacher.phone || 'Not provided'}</p>
            </div>
            <div>
                <p class="text-sm text-gray-600">This Month's Attendance</p>
                <div class="flex items-center space-x-4 mt-2">
                    <div class="text-center">
                        <p class="text-2xl font-bold text-green-600">${presentDays}</p>
                        <p class="text-xs text-gray-600">Present</p>
                    </div>
                    <div class="text-center">
                        <p class="text-2xl font-bold text-red-600">${absentDays}</p>
                        <p class="text-xs text-gray-600">Absent</p>
                    </div>
                    <div class="text-center">
                        <p class="text-2xl font-bold text-yellow-600">${lateDays}</p>
                        <p class="text-xs text-gray-600">Late</p>
                    </div>
                    <div class="text-center">
                        <p class="text-2xl font-bold text-blue-600">${leaveDays}</p>
                        <p class="text-xs text-gray-600">Leave</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Initialize calendar month and year selectors
function initializeCalendarSelectors() {
    const monthSelect = document.getElementById('attendanceCalendarMonth');
    const yearSelect = document.getElementById('attendanceCalendarYear');
    
    if (!monthSelect || !yearSelect) return;
    
    // Clear existing options
    monthSelect.innerHTML = '';
    yearSelect.innerHTML = '';
    
    // Add month options
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    months.forEach((month, index) => {
        const option = document.createElement('option');
        option.value = index + 1;
        option.textContent = month;
        if (index === new Date().getMonth()) {
            option.selected = true;
        }
        monthSelect.appendChild(option);
    });
    
    // Add year options (current year and previous 2 years)
    const currentYear = new Date().getFullYear();
    for (let year = currentYear - 2; year <= currentYear; year++) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        if (year === currentYear) {
            option.selected = true;
        }
        yearSelect.appendChild(option);
    }
    
    // Set current month and year
    currentCalendarMonth = new Date().getMonth() + 1;
    currentCalendarYear = currentYear;
}

// Load attendance calendar for selected month/year
function loadAttendanceCalendar() {
    const monthSelect = document.getElementById('attendanceCalendarMonth');
    const yearSelect = document.getElementById('attendanceCalendarYear');
    const calendarBody = document.getElementById('attendanceCalendarBody');
    
    if (!monthSelect || !yearSelect || !calendarBody || !currentViewingTeacherId) return;
    
    const month = parseInt(monthSelect.value);
    const year = parseInt(yearSelect.value);
    currentCalendarMonth = month;
    currentCalendarYear = year;
    
    // Clear calendar
    calendarBody.innerHTML = '';
    
    // Get first day of month and total days
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const totalDays = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    // Add empty cells for days before the first day of month
    for (let i = 0; i < startingDay; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'h-20 border border-gray-200 rounded p-1 bg-gray-50';
        calendarBody.appendChild(emptyCell);
    }
    
    // Add cells for each day of the month
    for (let day = 1; day <= totalDays; day++) {
        const dateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        
        // Get attendance for this date
        const attendanceRecord = appState.attendance.find(record => 
            record.teacherId === currentViewingTeacherId && 
            record.date === dateStr
        );
        
        const dayCell = document.createElement('div');
        dayCell.className = 'h-20 border border-gray-200 rounded p-1 hover:bg-gray-50 transition-colors duration-150';
        
        // Get status and apply appropriate color
        let statusClass = 'bg-gray-100 text-gray-700';
        let statusText = 'Not Marked';
        
        if (attendanceRecord) {
            switch(attendanceRecord.status) {
                case 'Present':
                    statusClass = 'bg-green-100 text-green-800 border-green-300';
                    statusText = 'Present';
                    break;
                case 'Absent':
                    statusClass = 'bg-red-100 text-red-800 border-red-300';
                    statusText = 'Absent';
                    break;
                case 'Late':
                    statusClass = 'bg-yellow-100 text-yellow-800 border-yellow-300';
                    statusText = 'Late';
                    break;
                case 'Half Day':
                    statusClass = 'bg-blue-100 text-blue-800 border-blue-300';
                    statusText = 'Half Day';
                    break;
                case 'On Leave':
                    statusClass = 'bg-purple-100 text-purple-800 border-purple-300';
                    statusText = 'On Leave';
                    break;
            }
        }
        
        // Check if today
        const today = new Date();
        const isToday = today.getDate() === day && 
                       today.getMonth() + 1 === month && 
                       today.getFullYear() === year;
        
        dayCell.innerHTML = `
            <div class="flex justify-between items-start">
                <span class="text-sm font-medium ${isToday ? 'text-blue-600' : 'text-gray-700'}">${day}</span>
                ${isToday ? '<span class="text-xs bg-blue-100 text-blue-800 px-1 rounded">Today</span>' : ''}
            </div>
            <div class="mt-1">
                <div class="text-xs ${statusClass} px-1 py-0.5 rounded border text-center truncate">
                    ${statusText}
                </div>
            </div>
            ${attendanceRecord?.timeIn ? `
                <div class="text-xs text-gray-600 mt-1 truncate" title="${attendanceRecord.timeIn} - ${attendanceRecord.timeOut}">
                    <i class="fas fa-clock mr-1"></i>${attendanceRecord.timeIn}
                </div>
            ` : ''}
            ${attendanceRecord?.note ? `
                <div class="text-xs text-gray-600 mt-1 truncate" title="${attendanceRecord.note}">
                    <i class="fas fa-sticky-note mr-1"></i>${attendanceRecord.note.substring(0, 15)}...
                </div>
            ` : ''}
        `;
        
        // Add click event to edit attendance
        dayCell.style.cursor = 'pointer';
        dayCell.addEventListener('click', function() {
            openMarkAttendanceModalForDate(currentViewingTeacherId, dateStr);
        });
        
        calendarBody.appendChild(dayCell);
    }
    
    // Update attendance summary for the month
    updateAttendanceSummaryCards(year, month);
}

// Update attendance summary cards
function updateAttendanceSummaryCards(year, month) {
    const summaryContainer = document.getElementById('attendanceSummaryCards');
    if (!summaryContainer || !currentViewingTeacherId) return;
    
    const monthStr = `${year}-${month.toString().padStart(2, '0')}`;
    const monthAttendance = appState.attendance.filter(record => 
        record.teacherId === currentViewingTeacherId && 
        record.date.startsWith(monthStr)
    );
    
    const presentDays = monthAttendance.filter(r => r.status === 'Present').length;
    const absentDays = monthAttendance.filter(r => r.status === 'Absent').length;
    const lateDays = monthAttendance.filter(r => r.status === 'Late').length;
    const halfDays = monthAttendance.filter(r => r.status === 'Half Day').length;
    const leaveDays = monthAttendance.filter(r => r.status === 'On Leave').length;
    const totalDays = new Date(year, month, 0).getDate();
    const markedDays = monthAttendance.length;
    
    const attendancePercentage = totalDays > 0 ? 
        Math.round((presentDays / totalDays) * 100) : 0;
    
    summaryContainer.innerHTML = `
        <div class="text-center p-3 bg-white rounded-lg border border-gray-200">
            <div class="text-2xl font-bold text-blue-600">${markedDays}</div>
            <div class="text-sm text-gray-800">Days Marked</div>
            <div class="text-xs text-gray-500">Out of ${totalDays} days</div>
        </div>
        <div class="text-center p-3 bg-white rounded-lg border border-gray-200">
            <div class="text-2xl font-bold text-green-600">${presentDays}</div>
            <div class="text-sm text-gray-800">Present Days</div>
            <div class="text-xs text-gray-500">Full attendance</div>
        </div>
        <div class="text-center p-3 bg-white rounded-lg border border-gray-200">
            <div class="text-2xl font-bold text-red-600">${absentDays}</div>
            <div class="text-sm text-gray-800">Absent Days</div>
            <div class="text-xs text-gray-500">Unpaid leave</div>
        </div>
        <div class="text-center p-3 bg-white rounded-lg border border-gray-200">
            <div class="text-2xl font-bold text-purple-600">${attendancePercentage}%</div>
            <div class="text-sm text-gray-800">Attendance %</div>
            <div class="text-xs ${attendancePercentage >= 90 ? 'text-green-600' : attendancePercentage >= 80 ? 'text-yellow-600' : 'text-red-600'}">
                ${attendancePercentage >= 90 ? 'Excellent' : attendancePercentage >= 80 ? 'Good' : 'Needs Improvement'}
            </div>
        </div>
    `;
}

// Load attendance history for a teacher
function loadAttendanceHistory(teacherId) {
    const tableBody = document.getElementById('attendanceHistoryTableBody');
    if (!tableBody) return;
    
    // Get all attendance records for this teacher, sorted by date (newest first)
    const teacherAttendance = appState.attendance
        .filter(record => record.teacherId === teacherId)
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 30); // Show last 30 records
    
    if (teacherAttendance.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="px-4 py-8 text-center text-gray-500">
                    <i class="fas fa-clipboard-list text-3xl text-gray-300 mb-2"></i>
                    <p>No attendance records found</p>
                    <p class="text-sm mt-1">Attendance hasn't been marked yet</p>
                </td>
            </tr>
        `;
        return;
    }
    
    let html = '';
    teacherAttendance.forEach(record => {
        const dateObj = new Date(record.date);
        const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
        const formattedDate = dateObj.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        html += `
            <tr class="hover:bg-gray-50">
                <td class="px-4 py-3 font-medium">${formattedDate}</td>
                <td class="px-4 py-3 text-gray-600">${dayName}</td>
                <td class="px-4 py-3">${getAttendanceStatusBadge(record.status)}</td>
                <td class="px-4 py-3">${record.timeIn || '-'}</td>
                <td class="px-4 py-3">${record.timeOut || '-'}</td>
                <td class="px-4 py-3">
                    <div class="text-sm text-gray-600 max-w-xs truncate" title="${record.note || 'No remarks'}">
                        ${record.note || '-'}
                    </div>
                </td>
                <td class="px-4 py-3">
                    <button onclick="openMarkAttendanceModalForDate(${teacherId}, '${record.date}')" class="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs">
                        <i class="fas fa-edit mr-1"></i>Edit
                    </button>
                </td>
            </tr>
        `;
    });
    
    tableBody.innerHTML = html;
}

// Open mark attendance modal for a specific date
function openMarkAttendanceModalForDate(teacherId, date) {
    currentTeacherForAttendance = teacherId;
    const teacher = appState.teachers.find(t => t.id === teacherId);
    const modal = document.getElementById('editAttendanceModal');
    const formContainer = document.getElementById('editAttendanceForm');
    const title = document.getElementById('editAttendanceTitle');
    
    if (!teacher || !formContainer || !title) return;
    
    title.textContent = `Edit Attendance - ${teacher.name}`;
    
    // Check existing attendance for the date
    const existingAttendance = appState.attendance.find(record => 
        record.teacherId === teacherId && record.date === date
    );
    
    formContainer.innerHTML = `
        <div class="space-y-4">
            <div class="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p class="font-semibold text-blue-800">Editing attendance for:</p>
                <p class="text-gray-800">${teacher.name}</p>
                <p class="text-sm text-gray-600">${new Date(date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                })}</p>
            </div>
            
            <input type="hidden" id="markAttendanceDate" value="${date}">
            
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select id="markAttendanceStatus" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="Present" ${existingAttendance?.status === 'Present' ? 'selected' : ''}>Present</option>
                    <option value="Absent" ${existingAttendance?.status === 'Absent' ? 'selected' : ''}>Absent</option>
                    <option value="Late" ${existingAttendance?.status === 'Late' ? 'selected' : ''}>Late</option>
                    <option value="Half Day" ${existingAttendance?.status === 'Half Day' ? 'selected' : ''}>Half Day</option>
                    <option value="On Leave" ${existingAttendance?.status === 'On Leave' ? 'selected' : ''}>On Leave</option>
                </select>
            </div>
            
            <div id="timeFields" class="space-y-3">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Time In</label>
                    <input type="time" id="markTimeIn" value="${existingAttendance?.timeIn?.replace(' AM', '').replace(' PM', '') || '08:00'}" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Time Out</label>
                    <input type="time" id="markTimeOut" value="${existingAttendance?.timeOut?.replace(' AM', '').replace(' PM', '') || '15:30'}" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                </div>
                
                <div id="lateField" class="hidden">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Late By (minutes)</label>
                    <input type="number" id="markLateBy" value="${existingAttendance?.lateBy?.replace(' mins', '') || '15'}" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" min="1" max="240">
                </div>
            </div>
            
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Note (Optional)</label>
                <textarea id="markAttendanceNote" rows="3" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Add a note...">${existingAttendance?.note || ''}</textarea>
            </div>
            
            <div class="flex justify-end space-x-3 pt-4">
                <button onclick="closeModal('editAttendanceModal')" class="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium">Cancel</button>
                <button onclick="saveIndividualAttendanceAndRefresh()" class="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium">Save Attendance</button>
            </div>
        </div>
    `;
    
    // Show/hide time fields based on status
    const statusSelect = document.getElementById('markAttendanceStatus');
    const timeFields = document.getElementById('timeFields');
    const lateField = document.getElementById('lateField');
    
    function updateTimeFields() {
        const status = statusSelect.value;
        if (status === 'Present' || status === 'Late' || status === 'Half Day') {
            timeFields.style.display = 'block';
            if (status === 'Late') {
                if (lateField) lateField.classList.remove('hidden');
            } else {
                if (lateField) lateField.classList.add('hidden');
            }
        } else {
            timeFields.style.display = 'none';
        }
    }
    
    if (statusSelect) {
        statusSelect.addEventListener('change', updateTimeFields);
        updateTimeFields();
    }
    
    if (modal) {
        modal.classList.add('show');
    }
}

// Save individual attendance and refresh attendance details
function saveIndividualAttendanceAndRefresh() {
    saveIndividualAttendance();
    
    // Refresh attendance details if modal is open
    if (currentViewingTeacherId) {
        loadAttendanceCalendar();
        loadAttendanceHistory(currentViewingTeacherId);
        updateTeacherAttendanceInfoCard(appState.teachers.find(t => t.id === currentViewingTeacherId));
    }
}

// Generate attendance report
function generateAttendanceReport() {
    if (!currentViewingTeacherId) {
        Toast.show('Please select a teacher first', 'error');
        return;
    }
    
    const teacher = appState.teachers.find(t => t.id === currentViewingTeacherId);
    if (!teacher) return;
    
    Toast.show(`Generating attendance report for ${teacher.name}...`, 'info');
    // In a real app, this would generate and download a PDF report
}

// ============================================================
// NEW: SALARY SLIP FUNCTIONS
// ============================================================

// Open salary slip modal
function openSalarySlipModal() {
    const modal = document.getElementById('salarySlipModal');
    if (!modal) return;
    
    // Populate teacher dropdown
    const teacherSelect = document.getElementById('salarySlipTeacherId');
    if (teacherSelect) {
        teacherSelect.innerHTML = '<option value="">Select a teacher</option>';
        appState.teachers.forEach(teacher => {
            const option = document.createElement('option');
            option.value = teacher.id;
            option.textContent = `${teacher.name} (${teacher.department})`;
            teacherSelect.appendChild(option);
        });
    }
    
    // Set default month to current month
    const monthInput = document.getElementById('salarySlipMonth');
    if (monthInput) {
        const now = new Date();
        monthInput.value = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
    }
    
    // Clear previous data
    document.getElementById('salarySlipTeacherInfoCard').classList.add('hidden');
    document.getElementById('attendanceSummaryCard').classList.add('hidden');
    
    // Reset form fields
    ['basicSalary', 'hraAmount', 'otherAllowances', 'advanceDeduction', 'otherDeductions'].forEach(id => {
        const field = document.getElementById(id);
        if (field) field.value = '';
    });
    
    modal.classList.add('show');
}

// Update teacher info when teacher is selected
function updateSalarySlipTeacherInfo() {
    const teacherSelect = document.getElementById('salarySlipTeacherId');
    const teacherInfoCard = document.getElementById('salarySlipTeacherInfoCard');
    const teacherNameElement = document.getElementById('salarySlipTeacherName');
    const slipTeacherName = document.getElementById('slipTeacherName');
    const slipDepartment = document.getElementById('slipDepartment');
    const slipDesignation = document.getElementById('slipDesignation');
    const slipEmployeeId = document.getElementById('slipEmployeeId');
    
    if (!teacherSelect || !teacherInfoCard || !slipTeacherName) return;
    
    const teacherId = parseInt(teacherSelect.value);
    if (!teacherId) {
        teacherInfoCard.classList.add('hidden');
        if (teacherNameElement) {
            teacherNameElement.textContent = 'Select teacher and month';
        }
        return;
    }
    
    const teacher = appState.teachers.find(t => t.id === teacherId);
    if (!teacher) return;
    
    // Update teacher info
    slipTeacherName.textContent = teacher.name;
    slipDepartment.textContent = teacher.department;
    slipDesignation.textContent = teacher.designation;
    slipEmployeeId.textContent = teacher.teacherId || `TCH${teacher.id.toString().padStart(4, '0')}`;
    
    // Set default basic salary (in a real app, this would come from database)
    const basicSalaryField = document.getElementById('basicSalary');
    if (basicSalaryField) {
        // Set default salary based on designation
        let defaultSalary = 30000; // Default
        if (teacher.designation.includes('Senior') || teacher.designation.includes('HOD')) {
            defaultSalary = 50000;
        } else if (teacher.designation.includes('Coordinator')) {
            defaultSalary = 40000;
        }
        basicSalaryField.value = defaultSalary;
        
        // Calculate and set daily rate (based on 26 working days)
        const dailyRateField = document.getElementById('dailyRate');
        if (dailyRateField) {
            dailyRateField.value = Math.round(defaultSalary / 26);
        }
    }
    
    // Calculate and show attendance summary
    calculateAttendanceSummaryForSalary(teacherId);
    
    // Show teacher info card
    teacherInfoCard.classList.remove('hidden');
    
    // Update modal subtitle
    if (teacherNameElement) {
        teacherNameElement.textContent = `Generating salary slip for ${teacher.name}`;
    }
}

// Calculate attendance summary for salary slip
function calculateAttendanceSummaryForSalary(teacherId) {
    const monthInput = document.getElementById('salarySlipMonth');
    if (!monthInput || !monthInput.value) return;
    
    const monthStr = monthInput.value; // Format: YYYY-MM
    const attendanceSummaryCard = document.getElementById('attendanceSummaryCard');
    
    // Get attendance for the selected month
    const monthAttendance = appState.attendance.filter(record => 
        record.teacherId === teacherId && 
        record.date.startsWith(monthStr)
    );
    
    // Count days
    const presentDays = monthAttendance.filter(r => r.status === 'Present').length;
    const absentDays = monthAttendance.filter(r => r.status === 'Absent').length;
    const lateDays = monthAttendance.filter(r => r.status === 'Late').length;
    const halfDays = monthAttendance.filter(r => r.status === 'Half Day').length;
    const leaveDays = monthAttendance.filter(r => r.status === 'On Leave').length;
    
    // Calculate payable days (Present + Half Day + On Leave)
    const payableDays = presentDays + Math.floor(halfDays / 2) + leaveDays;
    
    // Update UI
    document.getElementById('workingDaysCount').textContent = '26'; // Standard working days
    document.getElementById('presentDaysCount').textContent = presentDays;
    document.getElementById('absentDaysCount').textContent = absentDays;
    document.getElementById('leaveDaysCount').textContent = leaveDays;
    document.getElementById('payableDaysCount').textContent = payableDays;
    
    // Show attendance summary card
    attendanceSummaryCard.classList.remove('hidden');
}

// Preview salary slip
function previewSalarySlip() {
    const teacherId = parseInt(document.getElementById('salarySlipTeacherId').value);
    const monthInput = document.getElementById('salarySlipMonth').value;
    
    if (!teacherId || !monthInput) {
        Toast.show('Please select teacher and month', 'error');
        return;
    }
    
    const teacher = appState.teachers.find(t => t.id === teacherId);
    if (!teacher) return;
    
    // Collect salary data
    const basicSalary = parseFloat(document.getElementById('basicSalary').value) || 0;
    const hraAmount = parseFloat(document.getElementById('hraAmount').value) || 0;
    const otherAllowances = parseFloat(document.getElementById('otherAllowances').value) || 0;
    const advanceDeduction = parseFloat(document.getElementById('advanceDeduction').value) || 0;
    const otherDeductions = parseFloat(document.getElementById('otherDeductions').value) || 0;
    const dailyRate = parseFloat(document.getElementById('dailyRate').value) || 0;
    
    // Calculate attendance-based salary
    const payableDays = parseInt(document.getElementById('payableDaysCount').textContent) || 0;
    const attendanceBasedSalary = Math.round(dailyRate * payableDays);
    
    // Calculate totals
    const grossSalary = basicSalary + hraAmount + otherAllowances;
    const totalDeductions = advanceDeduction + otherDeductions;
    const netSalary = grossSalary - totalDeductions;
    
    // Prepare salary slip data
    salarySlipData = {
        teacher: {
            name: teacher.name,
            department: teacher.department,
            designation: teacher.designation,
            employeeId: teacher.teacherId || `TCH${teacher.id.toString().padStart(4, '0')}`,
            bankAccount: 'XXXXXXXX1234', // In real app, this would come from database
            panNumber: 'ABCDE1234F', // In real app, this would come from database
            joiningDate: teacher.joiningDate || '2020-01-01'
        },
        salaryMonth: monthInput,
        earnings: {
            basicSalary: basicSalary,
            hra: hraAmount,
            otherAllowances: otherAllowances,
            attendanceBonus: attendanceBasedSalary > basicSalary ? attendanceBasedSalary - basicSalary : 0
        },
        deductions: {
            advance: advanceDeduction,
            otherDeductions: otherDeductions,
            professionalTax: 200, // Fixed amount
            tds: Math.round(netSalary * 0.1) // 10% TDS
        },
        attendance: {
            workingDays: 26,
            presentDays: parseInt(document.getElementById('presentDaysCount').textContent) || 0,
            absentDays: parseInt(document.getElementById('absentDaysCount').textContent) || 0,
            leaveDays: parseInt(document.getElementById('leaveDaysCount').textContent) || 0,
            payableDays: payableDays,
            dailyRate: dailyRate
        },
        totals: {
            grossSalary: grossSalary,
            totalDeductions: totalDeductions + Math.round(netSalary * 0.1) + 200, // Include tax
            netSalary: netSalary - Math.round(netSalary * 0.1) - 200
        },
        generatedOn: new Date().toISOString().split('T')[0],
        generatedBy: 'School Admin'
    };
    
    // Generate preview HTML
    const previewContent = document.getElementById('salarySlipPreviewContent');
    if (previewContent) {
        previewContent.innerHTML = generateSalarySlipHTML(salarySlipData);
    }
    
    // Show preview modal
    const previewModal = document.getElementById('salarySlipPreviewModal');
    if (previewModal) {
        previewModal.classList.add('show');
    }
    
    // Close salary slip modal
    closeModal('salarySlipModal');
}

// Generate salary slip HTML
function generateSalarySlipHTML(data) {
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const [year, month] = data.salaryMonth.split('-');
    const monthName = monthNames[parseInt(month) - 1];
    
    return `
        <div class="salary-slip">
            <!-- Header -->
            <div class="text-center border-b-2 border-gray-800 pb-4 mb-6">
                <h1 class="text-3xl font-bold text-gray-800">KUNASH SCHOOL</h1>
                <p class="text-gray-600 mt-1">Official Salary Slip</p>
                <p class="text-sm text-gray-500 mt-2">${monthName} ${year}</p>
            </div>
            
            <!-- Employee Info -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                    <h3 class="text-lg font-semibold text-gray-800 mb-3">Employee Information</h3>
                    <table class="w-full">
                        <tr>
                            <td class="py-2 text-gray-600">Name:</td>
                            <td class="py-2 font-semibold">${data.teacher.name}</td>
                        </tr>
                        <tr>
                            <td class="py-2 text-gray-600">Employee ID:</td>
                            <td class="py-2 font-semibold">${data.teacher.employeeId}</td>
                        </tr>
                        <tr>
                            <td class="py-2 text-gray-600">Department:</td>
                            <td class="py-2 font-semibold">${data.teacher.department}</td>
                        </tr>
                        <tr>
                            <td class="py-2 text-gray-600">Designation:</td>
                            <td class="py-2 font-semibold">${data.teacher.designation}</td>
                        </tr>
                    </table>
                </div>
                <div>
                    <h3 class="text-lg font-semibold text-gray-800 mb-3">Payment Information</h3>
                    <table class="w-full">
                        <tr>
                            <td class="py-2 text-gray-600">Bank Account:</td>
                            <td class="py-2 font-semibold">${data.teacher.bankAccount}</td>
                        </tr>
                        <tr>
                            <td class="py-2 text-gray-600">PAN Number:</td>
                            <td class="py-2 font-semibold">${data.teacher.panNumber}</td>
                        </tr>
                        <tr>
                            <td class="py-2 text-gray-600">Pay Period:</td>
                            <td class="py-2 font-semibold">${monthName} 1 - ${monthName} ${data.attendance.workingDays}, ${year}</td>
                        </tr>
                        <tr>
                            <td class="py-2 text-gray-600">Payment Date:</td>
                            <td class="py-2 font-semibold">${data.generatedOn}</td>
                        </tr>
                    </table>
                </div>
            </div>
            
            <!-- Attendance Summary -->
            <div class="bg-blue-50 p-4 rounded-lg mb-6">
                <h3 class="text-lg font-semibold text-gray-800 mb-3">Attendance Summary</h3>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div class="text-center">
                        <p class="text-sm text-gray-600">Working Days</p>
                        <p class="text-2xl font-bold">${data.attendance.workingDays}</p>
                    </div>
                    <div class="text-center">
                        <p class="text-sm text-gray-600">Present Days</p>
                        <p class="text-2xl font-bold text-green-600">${data.attendance.presentDays}</p>
                    </div>
                    <div class="text-center">
                        <p class="text-sm text-gray-600">Absent Days</p>
                        <p class="text-2xl font-bold text-red-600">${data.attendance.absentDays}</p>
                    </div>
                    <div class="text-center">
                        <p class="text-sm text-gray-600">Payable Days</p>
                        <p class="text-2xl font-bold text-blue-600">${data.attendance.payableDays}</p>
                    </div>
                </div>
            </div>
            
            <!-- Salary Breakdown -->
            <div class="mb-6">
                <h3 class="text-lg font-semibold text-gray-800 mb-3">Salary Breakdown</h3>
                <div class="overflow-x-auto">
                    <table class="w-full border border-gray-300">
                        <thead class="bg-gray-100">
                            <tr>
                                <th class="px-4 py-3 text-left font-semibold">Earnings</th>
                                <th class="px-4 py-3 text-right font-semibold">Amount (₹)</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr class="border-b border-gray-200">
                                <td class="px-4 py-3">Basic Salary</td>
                                <td class="px-4 py-3 text-right">${data.earnings.basicSalary.toLocaleString()}</td>
                            </tr>
                            <tr class="border-b border-gray-200">
                                <td class="px-4 py-3">House Rent Allowance (HRA)</td>
                                <td class="px-4 py-3 text-right">${data.earnings.hra.toLocaleString()}</td>
                            </tr>
                            <tr class="border-b border-gray-200">
                                <td class="px-4 py-3">Other Allowances</td>
                                <td class="px-4 py-3 text-right">${data.earnings.otherAllowances.toLocaleString()}</td>
                            </tr>
                            <tr class="border-b border-gray-200 bg-gray-50">
                                <td class="px-4 py-3 font-semibold">Gross Earnings</td>
                                <td class="px-4 py-3 text-right font-semibold">${data.totals.grossSalary.toLocaleString()}</td>
                            </tr>
                        </tbody>
                    </table>
                    
                    <table class="w-full border border-gray-300 mt-4">
                        <thead class="bg-gray-100">
                            <tr>
                                <th class="px-4 py-3 text-left font-semibold">Deductions</th>
                                <th class="px-4 py-3 text-right font-semibold">Amount (₹)</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr class="border-b border-gray-200">
                                <td class="px-4 py-3">Advance Deduction</td>
                                <td class="px-4 py-3 text-right">${data.deductions.advance.toLocaleString()}</td>
                            </tr>
                            <tr class="border-b border-gray-200">
                                <td class="px-4 py-3">Other Deductions</td>
                                <td class="px-4 py-3 text-right">${data.deductions.otherDeductions.toLocaleString()}</td>
                            </tr>
                            <tr class="border-b border-gray-200">
                                <td class="px-4 py-3">Professional Tax</td>
                                <td class="px-4 py-3 text-right">${data.deductions.professionalTax.toLocaleString()}</td>
                            </tr>
                            <tr class="border-b border-gray-200">
                                <td class="px-4 py-3">Tax Deducted at Source (TDS)</td>
                                <td class="px-4 py-3 text-right">${data.deductions.tds.toLocaleString()}</td>
                            </tr>
                            <tr class="bg-gray-50">
                                <td class="px-4 py-3 font-semibold">Total Deductions</td>
                                <td class="px-4 py-3 text-right font-semibold">${(data.deductions.advance + data.deductions.otherDeductions + data.deductions.professionalTax + data.deductions.tds).toLocaleString()}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            
            <!-- Net Salary -->
            <div class="bg-green-50 border-2 border-green-500 p-6 rounded-lg text-center mb-6">
                <p class="text-sm text-gray-600">Net Salary Payable</p>
                <p class="text-4xl font-bold text-green-700 mt-2">₹ ${data.totals.netSalary.toLocaleString()}</p>
                <p class="text-sm text-gray-600 mt-2">(In words: ${numberToWords(data.totals.netSalary)} only)</p>
            </div>
            
            <!-- Footer -->
            <div class="border-t border-gray-300 pt-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <p class="text-sm text-gray-600">Generated By:</p>
                        <p class="font-semibold">${data.generatedBy}</p>
                        <p class="text-sm text-gray-600 mt-2">Date: ${data.generatedOn}</p>
                    </div>
                    <div class="text-right">
                        <p class="text-sm text-gray-600">For KUNASH SCHOOL</p>
                        <div class="mt-8">
                            <p class="border-t border-gray-400 pt-4 inline-block">Authorized Signature</p>
                        </div>
                    </div>
                </div>
                <div class="mt-6 text-center text-xs text-gray-500">
                    <p>This is a computer-generated document and does not require a physical signature.</p>
                    <p class="mt-1">For any queries, contact accounts@kunashschool.edu</p>
                </div>
            </div>
        </div>
    `;
}

// Helper function to convert number to words
function numberToWords(num) {
    // Simplified number to words function
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    
    if (num === 0) return 'Zero';
    
    let words = '';
    
    // Handle thousands
    if (num >= 1000) {
        words += ones[Math.floor(num / 1000)] + ' Thousand ';
        num %= 1000;
    }
    
    // Handle hundreds
    if (num >= 100) {
        words += ones[Math.floor(num / 100)] + ' Hundred ';
        num %= 100;
    }
    
    // Handle tens and ones
    if (num >= 20) {
        words += tens[Math.floor(num / 10)] + ' ';
        num %= 10;
    } else if (num >= 10) {
        words += teens[num - 10] + ' ';
        num = 0;
    }
    
    // Handle ones
    if (num > 0) {
        words += ones[num] + ' ';
    }
    
    return words.trim() + ' Rupees';
}

// Print salary slip
function printSalarySlip() {
    const printContent = document.getElementById('salarySlipPreviewContent').innerHTML;
    const originalContent = document.body.innerHTML;
    
    document.body.innerHTML = printContent;
    window.print();
    document.body.innerHTML = originalContent;
    
    // Reinitialize event listeners
    setupEventListeners();
}

// Download salary slip as PDF
function downloadSalarySlipPDF() {
    Toast.show('PDF download functionality would be implemented here', 'info');
    // In a real app, this would use a library like jsPDF or html2pdf
}

// Generate and download salary slip
function generateAndDownloadSalarySlip() {
    if (!salarySlipData) {
        Toast.show('Please preview the salary slip first', 'error');
        return;
    }
    
    // Generate HTML content
    const htmlContent = generateSalarySlipHTML(salarySlipData);
    
    // Create a blob and download
    const blob = new Blob([`<!DOCTYPE html><html><head><title>Salary Slip - ${salarySlipData.teacher.name}</title><style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .salary-slip { max-width: 800px; margin: 0 auto; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 8px 12px; border: 1px solid #ddd; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .bg-blue-50 { background-color: #eff6ff; }
        .bg-green-50 { background-color: #f0fdf4; }
        .bg-gray-50 { background-color: #f9fafb; }
    </style></head><body>${htmlContent}</body></html>`], {
        type: 'text/html'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Salary_Slip_${salarySlipData.teacher.name}_${salarySlipData.salaryMonth}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    Toast.show('Salary slip downloaded successfully', 'success');
}

// Generate salary slip for current viewing teacher
function generateSalarySlipForTeacher() {
    if (!currentViewingTeacherId) {
        Toast.show('No teacher selected', 'error');
        return;
    }
    
    // Open salary slip modal
    openSalarySlipModal();
    
    // Set the current teacher in the dropdown
    const teacherSelect = document.getElementById('salarySlipTeacherId');
    if (teacherSelect) {
        teacherSelect.value = currentViewingTeacherId;
        updateSalarySlipTeacherInfo();
    }
}

// Utility Functions
function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.classList.toggle('hidden', !show);
    }
}

function exportAttendanceReport() {
    Toast.show('Export functionality will be implemented here', 'info');
}

function sendAttendanceReminders() {
    // Get teachers who haven't marked attendance for today
    const attendanceDate = document.getElementById('attendanceDate');
    const selectedDate = attendanceDate ? attendanceDate.value : appState.currentDate;
    const teachersWithoutAttendance = appState.teachers.filter(teacher => {
        return !appState.attendance.some(record => 
            record.teacherId === teacher.id && record.date === selectedDate
        );
    });
    
    if (teachersWithoutAttendance.length === 0) {
        Toast.show('All teachers have marked attendance for today', 'info');
        return;
    }
    
    // In a real app, this would send emails/SMS
    Toast.show(`Reminders sent to ${teachersWithoutAttendance.length} teachers`, 'success');
}

function generateDailyReport() {
    Toast.show('Daily report generation will be implemented here', 'info');
}

function printAttendanceSheet() {
    Toast.show('Print functionality will be implemented here', 'info');
}

function viewAllLeaveRequests() {
    Toast.show('View all leave requests will be implemented here', 'info');
}

function approveLeave(leaveId) {
    if (confirm('Approve this leave request?')) {
        // In a real app, update leave status in database
        Toast.show('Leave request approved successfully', 'success');
        renderLeaveRequests();
    }
}

function rejectLeave(leaveId) {
    if (confirm('Reject this leave request?')) {
        // In a real app, update leave status in database
        Toast.show('Leave request rejected', 'info');
        renderLeaveRequests();
    }
}

function contactTeacher(teacherId) {
    const teacher = appState.teachers.find(t => t.id === teacherId);
    if (teacher) {
        Toast.show(`Calling ${teacher.name}...`, 'info');
        // In a real app, this would initiate a call
    }
}

function markAllPresent() {
    const attendanceDate = document.getElementById('attendanceDate');
    const selectedDate = attendanceDate ? attendanceDate.value : appState.currentDate;
    
    if (confirm(`Mark all teachers as present for ${selectedDate}?`)) {
        appState.teachers.forEach(teacher => {
            const existingIndex = appState.attendance.findIndex(record => 
                record.teacherId === teacher.id && record.date === selectedDate
            );
            
            const attendanceRecord = {
                id: existingIndex >= 0 ? appState.attendance[existingIndex].id : Date.now(),
                teacherId: teacher.id,
                date: selectedDate,
                status: 'Present',
                timeIn: '08:00 AM',
                timeOut: '03:30 PM',
                lateBy: '',
                note: 'Marked as present',
                lastUpdated: new Date().toISOString(),
                markedBy: 'admin'
            };
            
            if (existingIndex >= 0) {
                appState.attendance[existingIndex] = attendanceRecord;
            } else {
                appState.attendance.push(attendanceRecord);
            }
        });
        
        saveAttendanceData();
        loadAttendanceData();
        
        Toast.show('All teachers marked as present', 'success');
    }
}


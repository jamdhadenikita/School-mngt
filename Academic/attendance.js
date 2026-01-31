// Attendance Management System

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    checkSession();
    setupEventListeners();
    setupResponsiveSidebar();
    initializeAttendanceModule();
});

// Global variables
let sidebarCollapsed = false;
let isMobile = window.innerWidth < 1024;
let attendanceData = [];
let filteredData = [];
let currentPage = 1;
const itemsPerPage = 10;
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let selectedDate = new Date().toISOString().split('T')[0];
let selectedClass = 'all';
let selectedStatus = 'all';
let summaryData = [];
let summaryMonth = new Date().getMonth();
let summaryYear = new Date().getFullYear();
let summaryClass = 'all';

// Bulk update variables
let bulkSelectedStudents = new Set(); // Set of student IDs
let bulkStatus = 'present';
let bulkStudentListData = []; // Store the filtered student list for bulk update

// Define holidays (example dates)
const holidays = [
    '2024-01-01', // New Year's Day
    '2024-01-26', // Republic Day
    '2024-03-25', // Holi
    '2024-08-15', // Independence Day
    '2024-10-02', // Gandhi Jayanti
    '2024-12-25', // Christmas
];

// Mock data for attendance (In production, this would come from an API)
const mockStudents = [
    { id: 1, name: 'Aarav Sharma', class: '10A', rollNo: 1, attendance: [] },
    { id: 2, name: 'Vivaan Patel', class: '10A', rollNo: 2, attendance: [] },
    { id: 3, name: 'Aditya Singh', class: '10A', rollNo: 3, attendance: [] },
    { id: 4, name: 'Vihaan Kumar', class: '10A', rollNo: 4, attendance: [] },
    { id: 5, name: 'Arjun Gupta', class: '10A', rollNo: 5, attendance: [] },
    { id: 6, name: 'Sai Reddy', class: '9B', rollNo: 1, attendance: [] },
    { id: 7, name: 'Reyansh Verma', class: '9B', rollNo: 2, attendance: [] },
    { id: 8, name: 'Mohammed Ali', class: '9B', rollNo: 3, attendance: [] },
    { id: 9, name: 'Ananya Desai', class: '9B', rollNo: 4, attendance: [] },
    { id: 10, name: 'Diya Joshi', class: '9B', rollNo: 5, attendance: [] },
    { id: 11, name: 'Aaradhya Singh', class: '11A', rollNo: 1, attendance: [] },
    { id: 12, name: 'Ishaan Patel', class: '11A', rollNo: 2, attendance: [] },
    { id: 13, name: 'Kabir Sharma', class: '11A', rollNo: 3, attendance: [] },
    { id: 14, name: 'Rohan Kumar', class: '11A', rollNo: 4, attendance: [] },
    { id: 15, name: 'Aryan Gupta', class: '12B', rollNo: 1, attendance: [] },
];

// Session Management
const USER_SESSION_KEY = 'school_portal_session';

function checkSession() {
    const session = localStorage.getItem(USER_SESSION_KEY);
    if (!session) {
        window.location.href = 'login.html';
        return;
    }
    
    const { username, expires } = JSON.parse(session);
    if (new Date(expires) < new Date()) {
        localStorage.removeItem(USER_SESSION_KEY);
        window.location.href = 'login.html';
    }
}

function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem(USER_SESSION_KEY);
        window.location.href = 'login.html';
    }
}

// Setup Event Listeners
function setupEventListeners() {
    // Logout
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    
    // Sidebar Toggle
    document.getElementById('sidebarToggle').addEventListener('click', toggleSidebar);
    
    // Notifications Dropdown
    document.getElementById('notificationsBtn').addEventListener('click', toggleNotifications);
    
    // User Menu Dropdown
    document.getElementById('userMenuBtn').addEventListener('click', toggleUserMenu);
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', function(event) {
        if (!event.target.closest('#notificationsBtn')) {
            document.getElementById('notificationsDropdown').classList.add('hidden');
        }
        if (!event.target.closest('#userMenuBtn')) {
            document.getElementById('userMenuDropdown').classList.add('hidden');
        }
    });
    
    // Close sidebar when clicking on overlay
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', closeMobileSidebar);
    }
    
    // Attendance date change
    document.getElementById('attendanceDate').addEventListener('change', function(e) {
        selectedDate = e.target.value;
        loadAttendanceData();
    });
    
    // Class filter change
    document.getElementById('classFilter').addEventListener('change', function(e) {
        selectedClass = e.target.value;
    });
    
    // Status filter change
    document.getElementById('statusFilter').addEventListener('change', function(e) {
        selectedStatus = e.target.value;
    });
    
    // Summary modal filters
    document.getElementById('summaryMonth').addEventListener('change', function(e) {
        summaryMonth = parseInt(e.target.value);
    });
    
    document.getElementById('summaryYear').addEventListener('change', function(e) {
        summaryYear = parseInt(e.target.value);
    });
    
    document.getElementById('summaryClass').addEventListener('change', function(e) {
        summaryClass = e.target.value;
    });
}

// Responsive Sidebar Setup
function setupResponsiveSidebar() {
    isMobile = window.innerWidth < 1024;
    
    if (isMobile) {
        closeMobileSidebar();
    } else {
        const sidebar = document.getElementById('sidebar');
        const mainContent = document.getElementById('mainContent');
        
        if (sidebarCollapsed) {
            sidebar.classList.add('collapsed');
            mainContent.classList.add('sidebar-collapsed');
        } else {
            sidebar.classList.remove('collapsed');
            mainContent.classList.remove('sidebar-collapsed');
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
            
            sidebar.classList.remove('mobile-open');
            overlay.classList.remove('active');
            document.body.classList.remove('sidebar-open');
            
            if (sidebarCollapsed) {
                sidebar.classList.add('collapsed');
                mainContent.classList.add('sidebar-collapsed');
            } else {
                sidebar.classList.remove('collapsed');
                mainContent.classList.remove('sidebar-collapsed');
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
    
    sidebar.classList.add('mobile-open');
    overlay.classList.add('active');
    document.body.classList.add('sidebar-open');
}

function closeMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    
    sidebar.classList.remove('mobile-open');
    overlay.classList.remove('active');
    document.body.classList.remove('sidebar-open');
}

// Dropdown Toggles
function toggleNotifications() {
    const dropdown = document.getElementById('notificationsDropdown');
    dropdown.classList.toggle('hidden');
}

function toggleUserMenu() {
    const dropdown = document.getElementById('userMenuDropdown');
    dropdown.classList.toggle('hidden');
}

// Initialize Attendance Module
function initializeAttendanceModule() {
    // Set current date
    const today = new Date();
    document.getElementById('currentDate').textContent = today.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    // Set default date
    document.getElementById('attendanceDate').value = selectedDate;
    
    // Generate mock attendance data
    generateMockAttendanceData();
    
    // Load initial data
    loadAttendanceData();
    
    // Generate calendar
    generateCalendar();
    
    // Set summary modal defaults
    document.getElementById('summaryMonth').value = summaryMonth;
    document.getElementById('summaryYear').value = summaryYear;
}

function generateMockAttendanceData() {
    // Generate attendance for last 30 days
    const today = new Date();
    const statuses = ['present', 'absent', 'late', 'halfday'];
    
    mockStudents.forEach(student => {
        student.attendance = [];
        
        for (let i = 0; i < 30; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            
            // Random status with 70% chance of present
            let status;
            const random = Math.random();
            if (random < 0.7) {
                status = 'present';
            } else if (random < 0.85) {
                status = 'absent';
            } else if (random < 0.95) {
                status = 'late';
            } else {
                status = 'halfday';
            }
            
            student.attendance.push({
                date: dateStr,
                status: status,
                time: status === 'present' || status === 'late' ? 
                      `08:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}` : null,
                notes: status === 'absent' ? 'Sick leave' : 
                       status === 'late' ? 'Traffic delay' : 
                       status === 'halfday' ? 'Medical appointment' : null
            });
        }
    });
}

function loadAttendanceData() {
    showLoading();
    
    // Filter data based on selected filters
    filteredData = mockStudents.map(student => {
        // Find today's attendance
        const todayAttendance = student.attendance.find(a => a.date === selectedDate);
        
        return {
            ...student,
            todayStatus: todayAttendance ? todayAttendance.status : null,
            todayTime: todayAttendance ? todayAttendance.time : null,
            todayNotes: todayAttendance ? todayAttendance.notes : null
        };
    });
    
    // Apply class filter
    if (selectedClass !== 'all') {
        filteredData = filteredData.filter(student => student.class === selectedClass);
    }
    
    // Apply status filter
    if (selectedStatus !== 'all') {
        filteredData = filteredData.filter(student => student.todayStatus === selectedStatus);
    }
    
    // Update statistics
    updateStatistics();
    
    // Render table
    renderAttendanceTable();
    
    // Update calendar
    generateCalendar();
    
    hideLoading();
}

function updateStatistics() {
    const totalStudents = filteredData.length;
    const presentCount = filteredData.filter(s => s.todayStatus === 'present').length;
    const absentCount = filteredData.filter(s => s.todayStatus === 'absent').length;
    const lateCount = filteredData.filter(s => s.todayStatus === 'late').length;
    const halfdayCount = filteredData.filter(s => s.todayStatus === 'halfday').length;
    
    // Update counts
    document.getElementById('presentCount').textContent = presentCount;
    document.getElementById('absentCount').textContent = absentCount;
    document.getElementById('lateCount').textContent = lateCount;
    document.getElementById('halfdayCount').textContent = halfdayCount;
    
    // Update percentages
    document.getElementById('presentPercentage').textContent = totalStudents > 0 ? 
        `${Math.round((presentCount / totalStudents) * 100)}%` : '0%';
    document.getElementById('absentPercentage').textContent = totalStudents > 0 ? 
        `${Math.round((absentCount / totalStudents) * 100)}%` : '0%';
    document.getElementById('latePercentage').textContent = totalStudents > 0 ? 
        `${Math.round((lateCount / totalStudents) * 100)}%` : '0%';
    document.getElementById('halfdayPercentage').textContent = totalStudents > 0 ? 
        `${Math.round((halfdayCount / totalStudents) * 100)}%` : '0%';
}

function renderAttendanceTable() {
    const tableBody = document.getElementById('attendanceTableBody');
    const tableInfo = document.getElementById('tableInfo');
    
    if (filteredData.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="px-6 py-12 text-center text-gray-500">
                    <i class="fas fa-user-slash text-4xl mb-4"></i>
                    <p class="text-lg font-medium">No students found</p>
                    <p class="text-sm mt-2">Try adjusting your filters</p>
                </td>
            </tr>
        `;
        tableInfo.textContent = `Showing 0 students`;
        return;
    }
    
    // Calculate pagination
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, filteredData.length);
    const pageData = filteredData.slice(startIndex, endIndex);
    
    // Clear table
    tableBody.innerHTML = '';
    
    // Add rows
    pageData.forEach(student => {
        const row = document.createElement('tr');
        const status = student.todayStatus || 'pending';
        
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <div class="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <i class="fas fa-user text-blue-600"></i>
                    </div>
                    <div>
                        <div class="font-medium text-gray-900">${student.name}</div>
                        <div class="text-sm text-gray-500">${student.class}</div>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
                    ${student.class}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ${student.rollNo}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex space-x-2">
                    <button onclick="updateAttendance(${student.id}, 'present')" 
                            class="px-4 py-2 rounded-lg ${status === 'present' ? 'bg-green-100 text-green-700 border-2 border-green-300' : 'bg-gray-100 text-gray-700 hover:bg-green-50'} transition-all attendance-status">
                        <i class="fas fa-check-circle mr-1"></i> Present
                    </button>
                    <button onclick="updateAttendance(${student.id}, 'absent')" 
                            class="px-4 py-2 rounded-lg ${status === 'absent' ? 'bg-red-100 text-red-700 border-2 border-red-300' : 'bg-gray-100 text-gray-700 hover:bg-red-50'} transition-all attendance-status">
                        <i class="fas fa-times-circle mr-1"></i> Absent
                    </button>
                    <button onclick="updateAttendance(${student.id}, 'late')" 
                            class="px-4 py-2 rounded-lg ${status === 'late' ? 'bg-yellow-100 text-yellow-700 border-2 border-yellow-300' : 'bg-gray-100 text-gray-700 hover:bg-yellow-50'} transition-all attendance-status">
                        <i class="fas fa-clock mr-1"></i> Late
                    </button>
                    <button onclick="updateAttendance(${student.id}, 'halfday')" 
                            class="px-4 py-2 rounded-lg ${status === 'halfday' ? 'bg-blue-100 text-blue-700 border-2 border-blue-300' : 'bg-gray-100 text-gray-700 hover:bg-blue-50'} transition-all attendance-status">
                        <i class="fas fa-business-time mr-1"></i> Half Day
                    </button>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm ${status === 'present' || status === 'late' ? 'text-gray-900' : 'text-gray-400'}">
                    ${student.todayTime || '--:--'}
                </span>
            </td>
            <td class="px-6 py-4">
                <div class="text-sm text-gray-900 max-w-xs truncate">
                    ${student.todayNotes || 'No notes'}
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button onclick="viewStudentDetails(${student.id})" class="text-blue-600 hover:text-blue-900 mr-3">
                    <i class="fas fa-eye"></i>
                </button>
                <button onclick="addAttendanceNote(${student.id})" class="text-gray-600 hover:text-gray-900">
                    <i class="fas fa-edit"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
    
    // Update pagination controls
    document.getElementById('prevBtn').disabled = currentPage === 1;
    document.getElementById('nextBtn').disabled = currentPage === totalPages;
    
    // Update table info
    tableInfo.textContent = `Showing ${startIndex + 1}-${endIndex} of ${filteredData.length} students`;
}

function updateAttendance(studentId, status) {
    showLoading();
    
    // Find student
    const student = mockStudents.find(s => s.id === studentId);
    if (!student) {
        showToast('Student not found', 'error');
        hideLoading();
        return;
    }
    
    // Update attendance
    const existingAttendance = student.attendance.find(a => a.date === selectedDate);
    const time = status === 'present' || status === 'late' ? 
        new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }) : null;
    
    if (existingAttendance) {
        existingAttendance.status = status;
        existingAttendance.time = time;
        existingAttendance.notes = existingAttendance.notes || getDefaultNote(status);
    } else {
        student.attendance.push({
            date: selectedDate,
            status: status,
            time: time,
            notes: getDefaultNote(status)
        });
    }
    
    // Show success message
    const studentName = student.name.split(' ')[0];
    showToast(`${studentName}'s attendance marked as ${status}`, 'success');
    
    // Reload data
    loadAttendanceData();
}

function getDefaultNote(status) {
    switch(status) {
        case 'present': return 'Present in class';
        case 'absent': return 'Absent from school';
        case 'late': return 'Arrived late';
        case 'halfday': return 'Left early';
        default: return '';
    }
}

function viewStudentDetails(studentId) {
    const student = mockStudents.find(s => s.id === studentId);
    if (!student) return;
    
    // Calculate attendance stats
    const totalDays = student.attendance.length;
    const presentDays = student.attendance.filter(a => a.status === 'present').length;
    const absentDays = student.attendance.filter(a => a.status === 'absent').length;
    const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;
    
    // Get recent attendance
    const recentAttendance = [...student.attendance]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);
    
    const modalContent = document.getElementById('studentDetailsContent');
    modalContent.innerHTML = `
        <div class="mb-6">
            <div class="flex items-center space-x-4 mb-4">
                <div class="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <i class="fas fa-user-graduate text-blue-600 text-2xl"></i>
                </div>
                <div>
                    <h4 class="text-xl font-bold text-gray-800">${student.name}</h4>
                    <p class="text-gray-600">${student.class} | Roll No: ${student.rollNo}</p>
                </div>
            </div>
            
            <div class="grid grid-cols-2 gap-4 mb-6">
                <div class="bg-gray-50 p-4 rounded-lg">
                    <p class="text-sm text-gray-600">Total Attendance Days</p>
                    <p class="text-2xl font-bold text-gray-800">${totalDays}</p>
                </div>
                <div class="bg-gray-50 p-4 rounded-lg">
                    <p class="text-sm text-gray-600">Attendance Percentage</p>
                    <p class="text-2xl font-bold ${attendancePercentage >= 75 ? 'text-green-600' : 'text-red-600'}">
                        ${attendancePercentage}%
                    </p>
                </div>
            </div>
        </div>
        
        <div>
            <h5 class="font-semibold text-gray-700 mb-3">Recent Attendance History</h5>
            <div class="space-y-3">
                ${recentAttendance.map(att => `
                    <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                            <p class="font-medium text-gray-800">${formatDate(att.date)}</p>
                            <p class="text-sm text-gray-600">${att.time || '--:--'}</p>
                        </div>
                        <span class="${getStatusClass(att.status)} attendance-badge">
                            ${getStatusIcon(att.status)} ${att.status.charAt(0).toUpperCase() + att.status.slice(1)}
                        </span>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div class="mt-6 pt-6 border-t border-gray-200">
            <button onclick="exportStudentReport(${student.id})" class="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium">
                <i class="fas fa-file-pdf mr-2"></i> Export Attendance Report
            </button>
        </div>
    `;
    
    // Show modal
    document.getElementById('studentDetailsModal').classList.add('active');
}

function addAttendanceNote(studentId) {
    const note = prompt('Add a note for this attendance entry:');
    if (note === null) return;
    
    const student = mockStudents.find(s => s.id === studentId);
    if (!student) return;
    
    const attendance = student.attendance.find(a => a.date === selectedDate);
    if (attendance) {
        attendance.notes = note;
        showToast('Note added successfully', 'success');
        loadAttendanceData();
    } else {
        showToast('Please mark attendance first', 'error');
    }
}

function generateCalendar() {
    const calendarElement = document.getElementById('attendanceCalendar');
    const monthYearElement = document.getElementById('currentMonth');
    
    // Update month display
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];
    monthYearElement.textContent = `${monthNames[currentMonth]} ${currentYear}`;
    
    // Get first day of month
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Create calendar header
    let calendarHTML = `
        <div class="grid grid-cols-7 gap-2 mb-4">
            <div class="text-center font-medium text-gray-500 p-2">Sun</div>
            <div class="text-center font-medium text-gray-500 p-2">Mon</div>
            <div class="text-center font-medium text-gray-500 p-2">Tue</div>
            <div class="text-center font-medium text-gray-500 p-2">Wed</div>
            <div class="text-center font-medium text-gray-500 p-2">Thu</div>
            <div class="text-center font-medium text-gray-500 p-2">Fri</div>
            <div class="text-center font-medium text-gray-500 p-2">Sat</div>
        </div>
        <div class="grid grid-cols-7 gap-2">
    `;
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDay; i++) {
        calendarHTML += `<div class="h-10"></div>`;
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        const isSelected = dateStr === selectedDate;
        const isToday = dateStr === new Date().toISOString().split('T')[0];
        
        // Check if there's attendance data for this day
        let hasAttendance = false;
        for (const student of mockStudents) {
            if (student.attendance.some(a => a.date === dateStr)) {
                hasAttendance = true;
                break;
            }
        }
        
        calendarHTML += `
            <div onclick="selectCalendarDate('${dateStr}')" 
                 class="h-10 flex items-center justify-center rounded-lg calendar-day 
                        ${isSelected ? 'selected' : ''} 
                        ${isToday ? 'border-2 border-blue-500' : ''}
                        ${hasAttendance ? 'has-attendance' : ''}">
                ${day}
            </div>
        `;
    }
    
    calendarHTML += '</div>';
    calendarElement.innerHTML = calendarHTML;
}

function selectCalendarDate(dateStr) {
    selectedDate = dateStr;
    document.getElementById('attendanceDate').value = dateStr;
    loadAttendanceData();
}

function previousMonth() {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    generateCalendar();
}

function nextMonth() {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    generateCalendar();
}

function applyFilters() {
    currentPage = 1;
    loadAttendanceData();
}

function previousPage() {
    if (currentPage > 1) {
        currentPage--;
        renderAttendanceTable();
    }
}

function nextPage() {
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        renderAttendanceTable();
    }
}

// Bulk Update Modal Functions
function openBulkUpdateModal() {
    // Reset bulk selection
    bulkSelectedStudents.clear();
    bulkStatus = 'present';
    
    // Load students for bulk update (use filteredData or all students based on filters)
    bulkStudentListData = [...filteredData];
    
    // Update UI
    updateBulkModalUI();
    
    // Show modal
    document.getElementById('bulkUpdateModal').classList.add('active');
}

function closeBulkUpdateModal() {
    document.getElementById('bulkUpdateModal').classList.remove('active');
}

function updateBulkModalUI() {
    // Update student count
    const totalStudents = bulkStudentListData.length;
    document.getElementById('bulkStudentCount').textContent = `${totalStudents} students`;
    
    // Update status display
    document.getElementById('bulkStatusDisplay').textContent = bulkStatus.charAt(0).toUpperCase() + bulkStatus.slice(1);
    
    // Update selected count
    updateSelectedCount();
    
    // Highlight selected status button
    document.querySelectorAll('.bulk-status-btn').forEach(btn => {
        btn.classList.remove('ring-2', 'ring-blue-500', 'ring-offset-2');
    });
    
    const selectedBtn = document.getElementById(`bulkBtn${bulkStatus.charAt(0).toUpperCase() + bulkStatus.slice(1)}`);
    if (selectedBtn) {
        selectedBtn.classList.add('ring-2', 'ring-blue-500', 'ring-offset-2');
    }
    
    // Render student list
    renderBulkStudentList();
}

function renderBulkStudentList() {
    const studentListContainer = document.getElementById('bulkStudentList');
    
    if (bulkStudentListData.length === 0) {
        studentListContainer.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <i class="fas fa-user-slash text-3xl mb-3"></i>
                <p>No students found</p>
                <p class="text-sm mt-1">Apply different filters to see students</p>
            </div>
        `;
        return;
    }
    
    let studentListHTML = '';
    
    bulkStudentListData.forEach(student => {
        const isSelected = bulkSelectedStudents.has(student.id);
        const currentStatus = student.todayStatus || 'none';
        const statusClass = getStatusIndicatorClass(currentStatus);
        const statusText = currentStatus === 'none' ? 'Not marked' : currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1);
        
        studentListHTML += `
            <div class="student-list-item ${isSelected ? 'selected' : ''}" onclick="toggleStudentSelection(${student.id}, event)">
                <div class="flex items-center">
                    <input type="checkbox" 
                           class="student-checkbox h-4 w-4 mr-3" 
                           ${isSelected ? 'checked' : ''}
                           onclick="event.stopPropagation(); toggleStudentSelection(${student.id})">
                    <div class="flex-1">
                        <div class="font-medium text-gray-800">${student.name}</div>
                        <div class="text-sm text-gray-600 flex items-center mt-1">
                            <span class="px-2 py-0.5 bg-gray-100 rounded text-xs mr-3">${student.class}</span>
                            <span class="mr-3">Roll No: ${student.rollNo}</span>
                            <span class="flex items-center">
                                <span class="status-indicator ${statusClass}"></span>
                                <span>${statusText}</span>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    studentListContainer.innerHTML = studentListHTML;
}

function getStatusIndicatorClass(status) {
    switch(status) {
        case 'present': return 'present';
        case 'absent': return 'absent';
        case 'late': return 'late';
        case 'halfday': return 'halfday';
        default: return 'none';
    }
}

function selectBulkStatus(status) {
    bulkStatus = status;
    updateBulkModalUI();
}

function toggleStudentSelection(studentId, event = null) {
    if (event) {
        event.stopPropagation();
    }
    
    if (bulkSelectedStudents.has(studentId)) {
        bulkSelectedStudents.delete(studentId);
    } else {
        bulkSelectedStudents.add(studentId);
    }
    
    updateSelectedCount();
    
    // Update the checkbox in the list
    const checkbox = document.querySelector(`.student-list-item input[onclick*="${studentId}"]`);
    if (checkbox) {
        checkbox.checked = bulkSelectedStudents.has(studentId);
        const listItem = checkbox.closest('.student-list-item');
        if (listItem) {
            if (bulkSelectedStudents.has(studentId)) {
                listItem.classList.add('selected');
            } else {
                listItem.classList.remove('selected');
            }
        }
    }
    
    // Update "Select All" checkbox
    updateSelectAllCheckbox();
}

function updateSelectedCount() {
    const selectedCount = bulkSelectedStudents.size;
    const totalStudents = bulkStudentListData.length;
    
    document.getElementById('bulkSelectedCount').textContent = `${selectedCount} of ${totalStudents} students selected`;
    document.getElementById('bulkUpdateCount').textContent = selectedCount;
    document.getElementById('applyCountBadge').textContent = selectedCount;
    
    // Update apply button state
    const applyBtn = document.getElementById('applyBulkBtn');
    if (selectedCount === 0) {
        applyBtn.disabled = true;
        applyBtn.classList.add('opacity-50', 'cursor-not-allowed');
    } else {
        applyBtn.disabled = false;
        applyBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    }
}

function selectAllStudents() {
    bulkStudentListData.forEach(student => {
        bulkSelectedStudents.add(student.id);
    });
    updateSelectedCount();
    renderBulkStudentList();
}

function deselectAllStudents() {
    bulkSelectedStudents.clear();
    updateSelectedCount();
    renderBulkStudentList();
}

function toggleSelectAll(checked) {
    if (checked) {
        selectAllStudents();
    } else {
        deselectAllStudents();
    }
}

function updateSelectAllCheckbox() {
    const selectAllCheckbox = document.getElementById('selectAllCheckbox');
    const totalStudents = bulkStudentListData.length;
    
    if (bulkSelectedStudents.size === 0) {
        selectAllCheckbox.checked = false;
        selectAllCheckbox.indeterminate = false;
    } else if (bulkSelectedStudents.size === totalStudents) {
        selectAllCheckbox.checked = true;
        selectAllCheckbox.indeterminate = false;
    } else {
        selectAllCheckbox.checked = false;
        selectAllCheckbox.indeterminate = true;
    }
}

function applyBulkUpdate() {
    const selectedCount = bulkSelectedStudents.size;
    if (selectedCount === 0) {
        showToast('Please select at least one student', 'error');
        return;
    }
    
    const notes = document.getElementById('bulkNotes').value;
    const confirmMessage = `Are you sure you want to update attendance for ${selectedCount} student(s) to ${bulkStatus}?`;
    
    if (!confirm(confirmMessage)) {
        return;
    }
    
    showLoading();
    
    // Update attendance for selected students
    let updatedCount = 0;
    bulkSelectedStudents.forEach(studentId => {
        const student = mockStudents.find(s => s.id === studentId);
        if (student) {
            // Update attendance
            const existingAttendance = student.attendance.find(a => a.date === selectedDate);
            const time = bulkStatus === 'present' || bulkStatus === 'late' ? 
                new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }) : null;
            
            if (existingAttendance) {
                existingAttendance.status = bulkStatus;
                existingAttendance.time = time;
                if (notes) {
                    existingAttendance.notes = notes;
                } else if (!existingAttendance.notes) {
                    existingAttendance.notes = getDefaultNote(bulkStatus);
                }
            } else {
                student.attendance.push({
                    date: selectedDate,
                    status: bulkStatus,
                    time: time,
                    notes: notes || getDefaultNote(bulkStatus)
                });
            }
            updatedCount++;
        }
    });
    
    // Close modal
    closeBulkUpdateModal();
    
    // Show success message
    showToast(`Attendance updated to ${bulkStatus} for ${updatedCount} student(s)`, 'success');
    
    // Reload data
    loadAttendanceData();
    
    // Clear selection
    bulkSelectedStudents.clear();
    
    hideLoading();
}

function closeStudentDetailsModal() {
    document.getElementById('studentDetailsModal').classList.remove('active');
}

// Summary Modal Functions
function openSummaryModal() {
    // Set current month and year
    const currentDate = new Date();
    summaryMonth = currentDate.getMonth();
    summaryYear = currentDate.getFullYear();
    
    document.getElementById('summaryMonth').value = summaryMonth;
    document.getElementById('summaryYear').value = summaryYear;
    
    // Generate initial summary
    generateSummary();
    
    // Show modal
    document.getElementById('summaryModal').classList.add('active');
}

function closeSummaryModal() {
    document.getElementById('summaryModal').classList.remove('active');
}

function generateSummary() {
    showLoading();
    
    // Update summary period display
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];
    document.getElementById('summaryPeriod').textContent = `${monthNames[summaryMonth]} ${summaryYear}`;
    
    // Filter students based on class
    let studentsToInclude = mockStudents;
    if (summaryClass !== 'all') {
        studentsToInclude = mockStudents.filter(student => student.class === summaryClass);
    }
    
    // Get days in the selected month
    const daysInMonth = new Date(summaryYear, summaryMonth + 1, 0).getDate();
    
    // Prepare summary data
    summaryData = studentsToInclude.map(student => {
        const studentSummary = {
            id: student.id,
            name: student.name,
            class: student.class,
            rollNo: student.rollNo,
            days: [],
            totals: {
                present: 0,
                absent: 0,
                late: 0,
                halfday: 0,
                holiday: 0,
                weekend: 0
            },
            percentage: 0
        };
        
        // Process each day of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${summaryYear}-${(summaryMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
            const date = new Date(summaryYear, summaryMonth, day);
            const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
            
            // Check if it's a weekend
            if (dayOfWeek === 0 || dayOfWeek === 6) {
                studentSummary.days.push({
                    date: dateStr,
                    status: 'weekend',
                    code: 'WE'
                });
                studentSummary.totals.weekend++;
                continue;
            }
            
            // Check if it's a holiday
            if (holidays.includes(dateStr)) {
                studentSummary.days.push({
                    date: dateStr,
                    status: 'holiday',
                    code: 'HD'
                });
                studentSummary.totals.holiday++;
                continue;
            }
            
            // Check attendance for this day
            const attendance = student.attendance.find(a => a.date === dateStr);
            if (attendance) {
                studentSummary.days.push({
                    date: dateStr,
                    status: attendance.status,
                    code: getStatusCode(attendance.status),
                    time: attendance.time,
                    notes: attendance.notes
                });
                studentSummary.totals[attendance.status]++;
            } else {
                studentSummary.days.push({
                    date: dateStr,
                    status: 'absent',
                    code: 'A'
                });
                studentSummary.totals.absent++;
            }
        }
        
        // Calculate attendance percentage (excluding holidays and weekends)
        const totalWorkingDays = daysInMonth - studentSummary.totals.holiday - studentSummary.totals.weekend;
        if (totalWorkingDays > 0) {
            studentSummary.percentage = Math.round((studentSummary.totals.present / totalWorkingDays) * 100);
        }
        
        return studentSummary;
    });
    
    // Update summary stats
    updateSummaryStats();
    
    // Render summary table
    renderSummaryTable();
    
    hideLoading();
}

function getStatusCode(status) {
    switch(status) {
        case 'present': return 'P';
        case 'absent': return 'A';
        case 'late': return 'L';
        case 'halfday': return 'H';
        default: return '';
    }
}

function updateSummaryStats() {
    const statsContainer = document.getElementById('summaryStats');
    
    // Calculate overall statistics
    const totalStudents = summaryData.length;
    const totalWorkingDays = summaryData.length > 0 ? summaryData[0].days.length : 0;
    
    const overallPresent = summaryData.reduce((sum, student) => sum + student.totals.present, 0);
    const overallAbsent = summaryData.reduce((sum, student) => sum + student.totals.absent, 0);
    const overallLate = summaryData.reduce((sum, student) => sum + student.totals.late, 0);
    const overallHalfday = summaryData.reduce((sum, student) => sum + student.totals.halfday, 0);
    
    const avgAttendance = totalStudents > 0 ? Math.round(summaryData.reduce((sum, student) => sum + student.percentage, 0) / totalStudents) : 0;
    
    statsContainer.innerHTML = `
        <div class="summary-stats-card">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm font-medium text-gray-600">Total Students</p>
                    <p class="text-3xl font-bold text-gray-800 mt-2">${totalStudents}</p>
                </div>
                <div class="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <i class="fas fa-users text-blue-600 text-xl"></i>
                </div>
            </div>
        </div>
        
        <div class="summary-stats-card">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm font-medium text-gray-600">Average Attendance</p>
                    <p class="text-3xl font-bold ${avgAttendance >= 75 ? 'text-green-600' : 'text-red-600'} mt-2">${avgAttendance}%</p>
                </div>
                <div class="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                    <i class="fas fa-chart-line text-green-600 text-xl"></i>
                </div>
            </div>
        </div>
        
        <div class="summary-stats-card">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm font-medium text-gray-600">Total Present Days</p>
                    <p class="text-3xl font-bold text-gray-800 mt-2">${overallPresent}</p>
                </div>
                <div class="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                    <i class="fas fa-check-circle text-green-600 text-xl"></i>
                </div>
            </div>
        </div>
        
        <div class="summary-stats-card">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm font-medium text-gray-600">Total Absent Days</p>
                    <p class="text-3xl font-bold text-gray-800 mt-2">${overallAbsent}</p>
                </div>
                <div class="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                    <i class="fas fa-times-circle text-red-600 text-xl"></i>
                </div>
            </div>
        </div>
    `;
}

function renderSummaryTable() {
    const tableBody = document.getElementById('summaryTableBody');
    const summaryInfo = document.getElementById('summaryInfo');
    
    if (summaryData.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="32" class="px-6 py-12 text-center text-gray-500">
                    <i class="fas fa-user-slash text-4xl mb-4"></i>
                    <p class="text-lg font-medium">No students found</p>
                    <p class="text-sm mt-2">Try adjusting your filters</p>
                </td>
            </tr>
        `;
        summaryInfo.textContent = `Showing 0 students`;
        return;
    }
    
    // Clear table
    tableBody.innerHTML = '';
    
    // Add rows for each student
    summaryData.forEach((student, index) => {
        const row = document.createElement('tr');
        
        // Create student info cell
        let rowHTML = `
            <td class="py-4 px-4 border-r border-gray-200 sticky left-0 bg-white z-10 min-w-[200px]">
                <div class="flex items-center">
                    <div class="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <i class="fas fa-user text-blue-600"></i>
                    </div>
                    <div>
                        <div class="font-medium text-gray-900">${student.name}</div>
                        <div class="text-sm text-gray-600">${student.class} | Roll No: ${student.rollNo}</div>
                        <div class="text-xs mt-1 ${student.percentage >= 75 ? 'text-green-600' : 'text-red-600'}">
                            <i class="fas fa-chart-line mr-1"></i> ${student.percentage}% Attendance
                        </div>
                    </div>
                </div>
            </td>
        `;
        
        // Add attendance cells for each day
        student.days.forEach((day, dayIndex) => {
            let cellClass = 'attendance-cell';
            let cellTitle = `${formatDate(day.date)}`;
            
            switch(day.status) {
                case 'present':
                    cellClass += ' cell-present';
                    cellTitle += '\nPresent';
                    break;
                case 'absent':
                    cellClass += ' cell-absent';
                    cellTitle += '\nAbsent';
                    break;
                case 'late':
                    cellClass += ' cell-late';
                    cellTitle += '\nLate';
                    break;
                case 'halfday':
                    cellClass += ' cell-halfday';
                    cellTitle += '\nHalf Day';
                    break;
                case 'holiday':
                    cellClass += ' cell-holiday';
                    cellTitle += '\nHoliday';
                    break;
                case 'weekend':
                    cellClass += ' cell-weekend';
                    cellTitle += '\nWeekend';
                    break;
            }
            
            if (day.time) {
                cellTitle += `\nTime: ${day.time}`;
            }
            if (day.notes) {
                cellTitle += `\nNotes: ${day.notes}`;
            }
            
            rowHTML += `
                <td class="py-2 px-1 border-r border-gray-100">
                    <div class="${cellClass}" title="${cellTitle}" onclick="showDayDetails(${student.id}, '${day.date}')">
                        ${day.code || ''}
                    </div>
                </td>
            `;
        });
        
        // Add totals column
        rowHTML += `
            <td class="py-2 px-3 border-l border-gray-200 bg-gray-50 font-medium">
                <div class="text-center">
                    <div class="text-sm text-gray-600">Total</div>
                    <div class="text-lg ${student.percentage >= 75 ? 'text-green-600' : 'text-red-600'}">
                        ${student.percentage}%
                    </div>
                    <div class="text-xs text-gray-500">
                        P:${student.totals.present} A:${student.totals.absent}
                    </div>
                </div>
            </td>
        `;
        
        row.innerHTML = rowHTML;
        tableBody.appendChild(row);
    });
    
    // Update info
    summaryInfo.textContent = `Showing ${summaryData.length} students`;
}

function showDayDetails(studentId, date) {
    const student = mockStudents.find(s => s.id === studentId);
    if (!student) return;
    
    const attendance = student.attendance.find(a => a.date === date);
    
    let message = `Date: ${formatDate(date)}\n`;
    message += `Student: ${student.name}\n`;
    message += `Class: ${student.class}\n`;
    message += `Roll No: ${student.rollNo}\n\n`;
    
    if (attendance) {
        message += `Status: ${attendance.status.toUpperCase()}\n`;
        message += `Time: ${attendance.time || '--:--'}\n`;
        message += `Notes: ${attendance.notes || 'No notes'}`;
    } else {
        // Check if it's a holiday or weekend
        const dateObj = new Date(date);
        const dayOfWeek = dateObj.getDay();
        
        if (holidays.includes(date)) {
            message += 'Status: HOLIDAY\n';
            message += 'Reason: Public Holiday';
        } else if (dayOfWeek === 0 || dayOfWeek === 6) {
            message += 'Status: WEEKEND\n';
            message += 'No classes scheduled';
        } else {
            message += 'Status: ABSENT\n';
            message += 'No attendance recorded';
        }
    }
    
    alert(message);
}

// Excel Export Function
function downloadSummaryExcel() {
    showLoading();
    
    try {
        // Create workbook
        const wb = XLSX.utils.book_new();
        
        // Create attendance sheet data
        const wsData = [];
        
        // Add headers
        const headers = ['Student ID', 'Student Name', 'Class', 'Roll No'];
        
        // Add day headers
        const daysInMonth = new Date(summaryYear, summaryMonth + 1, 0).getDate();
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(summaryYear, summaryMonth, day);
            const dayOfWeek = date.getDay();
            const dateStr = `${day} ${date.toLocaleDateString('en-US', { weekday: 'short' })}`;
            headers.push(dateStr);
        }
        
        // Add totals headers
        headers.push('Total Present', 'Total Absent', 'Total Late', 'Total Half Day', 'Attendance %', 'Remarks');
        
        wsData.push(headers);
        
        // Add student data
        summaryData.forEach(student => {
            const row = [
                student.id,
                student.name,
                student.class,
                student.rollNo
            ];
            
            // Add attendance for each day
            student.days.forEach(day => {
                row.push(day.code || '');
            });
            
            // Add totals
            row.push(
                student.totals.present,
                student.totals.absent,
                student.totals.late,
                student.totals.halfday,
                `${student.percentage}%`,
                student.percentage >= 75 ? 'Good' : 
                student.percentage >= 60 ? 'Average' : 'Poor'
            );
            
            wsData.push(row);
        });
        
        // Create worksheet
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        
        // Set column widths
        const colWidths = [
            { wch: 10 }, // Student ID
            { wch: 25 }, // Student Name
            { wch: 10 }, // Class
            { wch: 10 }  // Roll No
        ];
        
        // Day columns
        for (let i = 0; i < daysInMonth; i++) {
            colWidths.push({ wch: 8 });
        }
        
        // Totals columns
        colWidths.push({ wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 20 });
        
        ws['!cols'] = colWidths;
        
        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(wb, ws, 'Attendance Summary');
        
        // Create summary statistics sheet
        const summaryStats = [
            ['Monthly Attendance Summary Report'],
            [''],
            ['Month:', monthNames[summaryMonth]],
            ['Year:', summaryYear],
            ['Class:', summaryClass === 'all' ? 'All Classes' : summaryClass],
            ['Total Students:', summaryData.length],
            [''],
            ['Overall Statistics'],
            ['Total Present Days:', summaryData.reduce((sum, student) => sum + student.totals.present, 0)],
            ['Total Absent Days:', summaryData.reduce((sum, student) => sum + student.totals.absent, 0)],
            ['Total Late Arrivals:', summaryData.reduce((sum, student) => sum + student.totals.late, 0)],
            ['Total Half Days:', summaryData.reduce((sum, student) => sum + student.totals.halfday, 0)],
            ['Average Attendance %:', Math.round(summaryData.reduce((sum, student) => sum + student.percentage, 0) / summaryData.length)],
            [''],
            ['Generated on:', new Date().toLocaleString()]
        ];
        
        const ws2 = XLSX.utils.aoa_to_sheet(summaryStats);
        XLSX.utils.book_append_sheet(wb, ws2, 'Summary Statistics');
        
        // Generate filename
        const filename = `attendance_summary_${monthNames[summaryMonth]}_${summaryYear}_${summaryClass === 'all' ? 'all_classes' : summaryClass}.xlsx`;
        
        // Save the workbook
        XLSX.writeFile(wb, filename);
        
        showToast('Excel report downloaded successfully', 'success');
    } catch (error) {
        console.error('Error generating Excel:', error);
        showToast('Error generating Excel report', 'error');
    }
    
    hideLoading();
}

// Utility Functions
function showLoading() {
    document.getElementById('loadingOverlay').classList.remove('hidden');
}

function hideLoading() {
    document.getElementById('loadingOverlay').classList.add('hidden');
}

function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toastContainer');
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = 'fa-info-circle';
    if (type === 'success') icon = 'fa-check-circle';
    if (type === 'error') icon = 'fa-exclamation-circle';
    
    toast.innerHTML = `
        <i class="fas ${icon} text-xl"></i>
        <div>
            <p class="font-medium">${message}</p>
        </div>
        <button onclick="this.parentElement.remove()" class="ml-auto text-gray-400 hover:text-gray-600">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    toastContainer.appendChild(toast);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (toast.parentNode) {
            toast.remove();
        }
    }, 5000);
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
    });
}

function getStatusClass(status) {
    switch(status) {
        case 'present': return 'badge-present';
        case 'absent': return 'badge-absent';
        case 'late': return 'badge-late';
        case 'halfday': return 'badge-halfday';
        default: return 'badge-present';
    }
}

function getStatusIcon(status) {
    switch(status) {
        case 'present': return '<i class="fas fa-check-circle mr-1"></i>';
        case 'absent': return '<i class="fas fa-times-circle mr-1"></i>';
        case 'late': return '<i class="fas fa-clock mr-1"></i>';
        case 'halfday': return '<i class="fas fa-business-time mr-1"></i>';
        default: return '<i class="fas fa-question-circle mr-1"></i>';
    }
}

function generateAttendanceReport() {
    showLoading();
    
    // Simulate report generation
    setTimeout(() => {
        hideLoading();
        
        // Create a blob with report data
        const reportData = {
            date: selectedDate,
            class: selectedClass === 'all' ? 'All Classes' : selectedClass,
            totalStudents: filteredData.length,
            presentCount: filteredData.filter(s => s.todayStatus === 'present').length,
            absentCount: filteredData.filter(s => s.todayStatus === 'absent').length,
            lateCount: filteredData.filter(s => s.todayStatus === 'late').length,
            halfdayCount: filteredData.filter(s => s.todayStatus === 'halfday').length,
            students: filteredData.map(student => ({
                name: student.name,
                class: student.class,
                rollNo: student.rollNo,
                status: student.todayStatus || 'Not marked',
                time: student.todayTime || '--:--'
            }))
        };
        
        // Convert to JSON
        const jsonData = JSON.stringify(reportData, null, 2);
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        // Create download link
        const a = document.createElement('a');
        a.href = url;
        a.download = `attendance-report-${selectedDate}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showToast('Report downloaded successfully', 'success');
    }, 1500);
}

function exportStudentReport(studentId) {
    const student = mockStudents.find(s => s.id === studentId);
    if (!student) return;
    
    // Create report data
    const reportData = {
        student: {
            name: student.name,
            class: student.class,
            rollNo: student.rollNo
        },
        attendanceSummary: {
            totalDays: student.attendance.length,
            presentDays: student.attendance.filter(a => a.status === 'present').length,
            absentDays: student.attendance.filter(a => a.status === 'absent').length,
            attendancePercentage: Math.round((student.attendance.filter(a => a.status === 'present').length / 
                                            student.attendance.length) * 100) || 0
        },
        attendanceRecords: student.attendance
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 30)
    };
    
    // Convert to JSON and download
    const jsonData = JSON.stringify(reportData, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-report-${student.name.replace(/\s+/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('Student report downloaded', 'success');
}
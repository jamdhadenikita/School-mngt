
// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    checkSession();
    setupEventListeners();
    setupResponsiveSidebar();
    loadInitialData();
    calculateTotalSalary();
    
    // Check URL parameters to show appropriate section
    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get('action');
    
    if (action === 'add') {
        showAddTeacherSection();
    } 
    // ⭐⭐⭐ ADD THIS NEW CONDITION ⭐⭐⭐
    else if (action === 'attendance') {
        showAttendanceManagementSection();
    } 
    else {
        showAllTeachersSection();
    }
    
    // Handle browser back/forward buttons
    window.addEventListener('popstate', function() {
        const urlParams = new URLSearchParams(window.location.search);
        const action = urlParams.get('action');
        
        if (action === 'add') {
            showAddTeacherSection();
        } 
        // ⭐⭐⭐ ADD THIS NEW CONDITION ⭐⭐⭐
        else if (action === 'attendance') {
            showAttendanceManagementSection();
        } 
        else {
            showAllTeachersSection();
        }
    });
});

// Global variables
let sidebarCollapsed = false;
let isMobile = window.innerWidth < 1024;
let additionalAllowances = [];

// Session Management
const USER_SESSION_KEY = 'school_portal_session';
const SCHOOL_DATA_KEY = 'school_portal_data_teachers';
const ITEMS_PER_PAGE = 10;

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

// Application State
let appState = {
    teachers: [],
    currentPage: 1,
    filteredTeachers: [],
    teacherIdCounter: 1001
};

// Data Management
function loadInitialData() {
    const savedData = localStorage.getItem(SCHOOL_DATA_KEY);
    if (savedData) {
        const parsedData = JSON.parse(savedData);
        appState.teachers = parsedData.teachers || [];
        appState.teacherIdCounter = parsedData.teacherIdCounter || 1001;
    } else {
        appState.teachers = generateSampleTeachers();
        saveData();
    }
    renderTeachersTable();
    updateTeacherStats();
}

function saveData() {
    localStorage.setItem(SCHOOL_DATA_KEY, JSON.stringify({
        teachers: appState.teachers,
        teacherIdCounter: appState.teacherIdCounter
    }));
}

function generateSampleTeachers() {
    return [
        {
            id: 1,
            teacherId: 'TCH1001',
            name: 'Mr. Rajesh Sharma',
            dob: '1985-05-15',
            gender: 'Male',
            bloodGroup: 'A+',
            address: '123 Main Street, Pimpri, Pune - 411017',
            photo: null,
            contactNumber: '9876543210',
            email: 'rajesh.sharma@school.com',
            emergencyContactName: 'Mrs. Sharma',
            emergencyContactNumber: '9876543211',
            aadharNumber: '123456789012',
            panNumber: 'ABCDE1234F',
            medicalInfo: 'No known allergies',
            joiningDate: '2020-06-01',
            designation: 'Senior Teacher',
            totalExperience: 15,
            department: 'Mathematics',
            employmentType: 'Full Time',
            employeeId: 'EMP001',
            previousExperience: [
                { school: 'ABC School', position: 'Teacher', duration: 5 },
                { school: 'XYZ School', position: 'Senior Teacher', duration: 8 }
            ],
            qualifications: [
                { degree: 'Master', specialization: 'Mathematics', university: 'University of Pune', completionYear: 2010 },
                { degree: 'B.Ed.', specialization: 'Education', university: 'University of Mumbai', completionYear: 2012 }
            ],
            primarySubject: 'Mathematics',
            additionalSubjects: ['Mathematics', 'Physics'],
            classes: ['9', '10'],
            salary: {
                basic: 35000,
                hra: 7000,
                da: 5000,
                ta: 3000,
                additional: 2000,
                total: 52000
            },
            bankDetails: {
                bankName: 'State Bank of India',
                accountNumber: '12345678901234',
                ifscCode: 'SBIN0001234',
                branchName: 'Pimpri Branch'
            },
            status: 'Active',
            createdAt: '2020-06-01T10:30:00Z'
        },
        {
            id: 2,
            teacherId: 'TCH1002',
            name: 'Ms. Priya Patel',
            dob: '1990-08-22',
            gender: 'Female',
            bloodGroup: 'B+',
            address: '456 Park Avenue, Chinchwad, Pune - 411033',
            photo: null,
            contactNumber: '9876543212',
            email: 'priya.patel@school.com',
            emergencyContactName: 'Mr. Patel',
            emergencyContactNumber: '9876543213',
            aadharNumber: '234567890123',
            panNumber: 'BCDEF2345G',
            medicalInfo: 'Asthma (controlled)',
            joiningDate: '2021-06-10',
            designation: 'Teacher',
            totalExperience: 8,
            department: 'English',
            employmentType: 'Full Time',
            employeeId: 'EMP002',
            previousExperience: [
                { school: 'PQR School', position: 'Teacher', duration: 6 }
            ],
            qualifications: [
                { degree: 'Master', specialization: 'English Literature', university: 'University of Delhi', completionYear: 2015 },
                { degree: 'M.Ed.', specialization: 'Education', university: 'University of Pune', completionYear: 2016 }
            ],
            primarySubject: 'English',
            additionalSubjects: ['English', 'Hindi'],
            classes: ['6', '7', '8'],
            salary: {
                basic: 30000,
                hra: 6000,
                da: 4000,
                ta: 2000,
                additional: 1000,
                total: 43000
            },
            bankDetails: {
                bankName: 'HDFC Bank',
                accountNumber: '23456789012345',
                ifscCode: 'HDFC0001234',
                branchName: 'Chinchwad Branch'
            },
            status: 'Active',
            createdAt: '2021-06-10T14:20:00Z'
        }
    ];
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
        toast.innerHTML = `
            <i class="fas ${icon} text-xl"></i>
            <span>${message}</span>
        `;
        
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
    
    // Salary calculation inputs
    const salaryInputs = ['basicSalary', 'hra', 'da', 'ta'];
    salaryInputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('input', calculateTotalSalary);
        }
    });
    
    // Teacher search and filters
    const searchInput = document.getElementById('searchTeacher');
    if (searchInput) {
        searchInput.addEventListener('input', filterTeachers);
    }
    
    const filters = ['filterSubject', 'filterQualification', 'filterStatus'];
    filters.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('change', filterTeachers);
        }
    });
    
    // Select all checkbox
    const selectAll = document.getElementById('selectAll');
    if (selectAll) {
        selectAll.addEventListener('change', function() {
            const checkboxes = document.querySelectorAll('.teacher-checkbox');
            checkboxes.forEach(cb => cb.checked = this.checked);
        });
    }
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

function showAllTeachersSection() {
    document.getElementById('allTeachersSection').classList.remove('hidden');
    document.getElementById('addTeacherSection').classList.add('hidden');
    appState.currentPage = 1;
    renderTeachersTable();
    updateTeacherStats();
    
    // Update URL without reloading
    history.pushState({}, '', '../teachers-management/teachers-management.html');
    
    // Update sidebar active state
    updateSidebarActiveState('all');
    
    // Close mobile sidebar if open
    if (isMobile) {
        closeMobileSidebar();
    }
}

function showAddTeacherSection() {
    document.getElementById('allTeachersSection').classList.add('hidden');
    document.getElementById('addTeacherSection').classList.remove('hidden');
    document.getElementById('attendanceManagementSection').classList.add('hidden'); // ⭐ ADD THIS LINE
    resetForm();
    switchTab('personal');
    
    // Update URL without reloading
    history.pushState({}, '', '../teachers-management/teachers-management.html?action=add');
    
    // Update sidebar active state
    updateSidebarActiveState('add');
    
    // Close mobile sidebar if open
    if (isMobile) {
        closeMobileSidebar();
    }
}

// ⭐⭐⭐ ADD THE NEW FUNCTION RIGHT HERE ⭐⭐⭐
function showAttendanceManagementSection() {
    document.getElementById('allTeachersSection').classList.add('hidden');
    document.getElementById('addTeacherSection').classList.add('hidden');
    document.getElementById('attendanceManagementSection').classList.remove('hidden');
    
    // Load attendance management content
    loadAttendanceManagementContent();
    
    // Update URL without reloading
    history.pushState({}, '', '../teachers-management/teachers-management.html?action=attendance');
    
    // Update sidebar active state
    updateSidebarActiveState('attendance');
    
    // Close mobile sidebar if open
    if (isMobile) {
        closeMobileSidebar();
    }
}

function updateSidebarActiveState(activeSection) {
    // Remove active classes from all teacher management links
    const teacherLinks = document.querySelectorAll('#sidebar a');
    teacherLinks.forEach(link => {
        link.classList.remove('bg-blue-700', 'text-white');
        link.classList.add('hover:bg-gray-100', 'text-black');
        
        // Reset icons to black
        const icon = link.querySelector('.nav-icon');
        if (icon) {
            icon.classList.remove('text-white');
            icon.classList.add('text-black');
        }
        
        // Reset text to black
        const text = link.querySelector('.nav-text');
        if (text) {
            text.classList.remove('text-white');
            text.classList.add('text-black');
        }
    });
    
    // Add active class to the correct link
    if (activeSection === 'all') {
        const allTeachersLink = document.querySelector('#sidebar a[onclick="showAllTeachersSection()"]');
        if (allTeachersLink) {
            // ... existing code ...
        }
    } else if (activeSection === 'add') {
        const addTeacherLink = document.querySelector('#sidebar a[onclick="showAddTeacherSection()"]');
        if (addTeacherLink) {
            // ... existing code ...
        }
    } 
    // ⭐⭐⭐ ADD THIS NEW CASE ⭐⭐⭐
    else if (activeSection === 'attendance') {
        const attendanceLink = document.querySelector('#sidebar a[onclick="showAttendanceManagementSection()"]');
        if (attendanceLink) {
            attendanceLink.classList.add('bg-blue-700', 'text-white');
            attendanceLink.classList.remove('hover:bg-gray-100', 'text-black');
            
            const icon = attendanceLink.querySelector('.nav-icon');
            if (icon) {
                icon.classList.add('text-white');
                icon.classList.remove('text-black');
            }
            
            const text = attendanceLink.querySelector('.nav-text');
            if (text) {
                text.classList.add('text-white');
                text.classList.remove('text-black');
            }
        }
    }
}

// Tab Switching
function switchTab(tabName) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => content.classList.remove('active'));
    
    // Remove active class from all tab buttons
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => button.classList.remove('active'));
    
    // Show selected tab content
    const targetContent = document.getElementById(tabName + 'TabContent');
    if (targetContent) {
        targetContent.classList.add('active');
    }
    
    // Activate selected tab button
    const targetButton = document.getElementById(tabName + 'Tab');
    if (targetButton) {
        targetButton.classList.add('active');
    }
    
    // Update salary calculations when switching to salary tab
    if (tabName === 'salary') {
        calculateTotalSalary();
    }
}

// Salary Calculations
function calculateTotalSalary() {
    const basic = parseFloat(document.getElementById('basicSalary')?.value || 0);
    const hra = parseFloat(document.getElementById('hra')?.value || 0);
    const da = parseFloat(document.getElementById('da')?.value || 0);
    const ta = parseFloat(document.getElementById('ta')?.value || 0);
    
    const baseTotal = basic + hra + da + ta;
    const additionalTotal = calculateAdditionalAllowancesTotal();
    const grandTotal = baseTotal + additionalTotal;
    
    // Update displays
    const totalSalaryDisplay = document.getElementById('totalSalaryDisplay');
    if (totalSalaryDisplay) totalSalaryDisplay.textContent = `₹${grandTotal.toLocaleString()}`;
    
    // Update summary
    const summaryBasic = document.getElementById('summaryBasic');
    if (summaryBasic) summaryBasic.textContent = `₹${basic.toLocaleString()}`;
    
    const summaryHRA = document.getElementById('summaryHRA');
    if (summaryHRA) summaryHRA.textContent = `₹${hra.toLocaleString()}`;
    
    const summaryDA = document.getElementById('summaryDA');
    if (summaryDA) summaryDA.textContent = `₹${da.toLocaleString()}`;
    
    const summaryTA = document.getElementById('summaryTA');
    if (summaryTA) summaryTA.textContent = `₹${ta.toLocaleString()}`;
    
    const summaryAdditional = document.getElementById('summaryAdditional');
    if (summaryAdditional) summaryAdditional.textContent = `₹${additionalTotal.toLocaleString()}`;
    
    const summaryGross = document.getElementById('summaryGross');
    if (summaryGross) summaryGross.textContent = `₹${grandTotal.toLocaleString()}`;
    
    return grandTotal;
}

function calculateAdditionalAllowancesTotal() {
    return additionalAllowances.reduce((total, allowance) => total + allowance.amount, 0);
}

function addAdditionalAllowance() {
    const nameInput = document.getElementById('additionalAllowanceName');
    const amountInput = document.getElementById('additionalAllowanceAmount');
    const name = nameInput.value.trim();
    const amount = parseFloat(amountInput.value);
    
    if (!name || isNaN(amount) || amount <= 0) {
        Toast.show('Please enter valid allowance name and amount', 'error');
        return;
    }
    
    const allowance = {
        id: Date.now(),
        name: name,
        amount: amount
    };
    
    additionalAllowances.push(allowance);
    renderAdditionalAllowancesList();
    calculateTotalSalary();
    
    // Clear inputs
    nameInput.value = '';
    amountInput.value = '';
    nameInput.focus();
}

function removeAdditionalAllowance(id) {
    additionalAllowances = additionalAllowances.filter(allowance => allowance.id !== id);
    renderAdditionalAllowancesList();
    calculateTotalSalary();
}

function renderAdditionalAllowancesList() {
    const container = document.getElementById('additionalAllowancesList');
    if (!container) return;
    
    if (additionalAllowances.length === 0) {
        container.innerHTML = '<p class="text-sm text-gray-500">No additional allowances added</p>';
        return;
    }
    
    let html = '';
    additionalAllowances.forEach(allowance => {
        html += `
            <div class="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                <div>
                    <span class="font-medium text-sm">${allowance.name}</span>
                    <span class="text-sm text-gray-600 ml-2">₹${allowance.amount.toLocaleString()}</span>
                </div>
                <button onclick="removeAdditionalAllowance(${allowance.id})" class="text-red-500 hover:text-red-700">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    });
    
    container.innerHTML = html;
    
    // Update additional allowances summary
    const additionalTotal = calculateAdditionalAllowancesTotal();
    const summaryContainer = document.getElementById('additionalAllowancesSummary');
    if (summaryContainer) {
        summaryContainer.textContent = `Includes additional allowances: ₹${additionalTotal.toLocaleString()}`;
    }
}

// Experience and Qualification Entries
function addExperienceEntry() {
    const container = document.getElementById('experienceEntries');
    const entry = document.createElement('div');
    entry.className = 'grid grid-cols-1 md:grid-cols-3 gap-4 mb-4';
    entry.innerHTML = `
        <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">School/Organization</label>
            <input type="text" name="prevSchool[]" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" placeholder="Previous school name">
        </div>
        
        <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Position</label>
            <input type="text" name="prevPosition[]" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" placeholder="Position held">
        </div>
        
        <div class="flex items-end space-x-2">
            <div class="flex-1">
                <label class="block text-sm font-medium text-gray-700 mb-2">Duration (Years)</label>
                <input type="number" name="prevDuration[]" min="0" max="50" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" placeholder="Years">
            </div>
            <button type="button" onclick="removeExperienceEntry(this)" class="px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors duration-200">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    container.appendChild(entry);
}

function removeExperienceEntry(button) {
    button.closest('.grid').remove();
}

function addQualificationEntry() {
    const container = document.getElementById('qualificationEntries');
    const entry = document.createElement('div');
    entry.className = 'grid grid-cols-1 md:grid-cols-4 gap-4 mb-4';
    entry.innerHTML = `
        <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Degree</label>
            <select name="degree[]" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200">
                <option value="">Select Degree</option>
                <option value="Bachelor">Bachelor's Degree</option>
                <option value="Master">Master's Degree</option>
                <option value="PhD">Ph.D.</option>
                <option value="B.Ed.">B.Ed.</option>
                <option value="M.Ed.">M.Ed.</option>
                <option value="Diploma">Diploma</option>
            </select>
        </div>
        
        <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Specialization</label>
            <input type="text" name="specialization[]" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" placeholder="e.g., Mathematics, Physics">
        </div>
        
        <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">University/College</label>
            <input type="text" name="university[]" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" placeholder="University name">
        </div>
        
        <div class="flex items-end space-x-2">
            <div class="flex-1">
                <label class="block text-sm font-medium text-gray-700 mb-2">Year of Completion</label>
                <input type="number" name="completionYear[]" min="1950" max="2030" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" placeholder="YYYY">
            </div>
            <button type="button" onclick="removeQualificationEntry(this)" class="px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors duration-200">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    container.appendChild(entry);
}

function removeQualificationEntry(button) {
    button.closest('.grid').remove();
}

// Teacher Management
function renderTeachersTable() {
    const tbody = document.getElementById('teacherTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    const filtered = getFilteredTeachers();
    const startIndex = (appState.currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const pageTeachers = filtered.slice(startIndex, endIndex);
    
    if (pageTeachers.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="6" class="px-6 py-12 text-center">
                <i class="fas fa-chalkboard-teacher text-4xl text-gray-300 mb-3"></i>
                <p class="text-lg text-gray-600">No teachers found</p>
                <p class="text-sm text-gray-500 mt-2">Try adjusting your search criteria</p>
            </td>
        `;
        tbody.appendChild(row);
    } else {
        pageTeachers.forEach(teacher => {
            const statusBadge = getStatusBadge(teacher.status);
            
            const row = document.createElement('tr');
            row.className = 'hover:bg-gray-50 transition-colors duration-150';
            row.innerHTML = `
                <td class="px-4 lg:px-6 py-4">
                    <input type="checkbox" class="teacher-checkbox rounded border-gray-300" data-id="${teacher.id}">
                </td>
                <td class="px-4 lg:px-6 py-4">
                    <div class="flex items-center space-x-3">
                        <div class="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                            ${teacher.photo ? 
                                `<img src="${teacher.photo}" class="h-full w-full rounded-full object-cover" alt="${teacher.name}">` :
                                `<i class="fas fa-user-tie text-blue-600"></i>`
                            }
                        </div>
                        <div>
                            <div class="font-medium text-gray-900">${teacher.name}</div>
                            <div class="text-sm text-gray-500">${teacher.teacherId} • ${teacher.designation}</div>
                            <div class="text-xs text-gray-500">${teacher.department} Department</div>
                        </div>
                    </div>
                </td>
                <td class="px-4 lg:px-6 py-4">
                    <div class="font-medium text-gray-900">${teacher.primarySubject}</div>
                    <div class="text-sm text-gray-500">Classes: ${Array.isArray(teacher.classes) ? teacher.classes.map(c => `Class ${c}`).join(', ') : ''}</div>
                </td>
                <td class="px-4 lg:px-6 py-4">
                    <div class="text-sm text-gray-900">${teacher.contactNumber}</div>
                    <div class="text-sm text-gray-500">${teacher.email}</div>
                </td>
                <td class="px-4 lg:px-6 py-4">
                    ${statusBadge}
                    <div class="text-xs text-gray-500 mt-1">
                        Experience: ${teacher.totalExperience} years
                    </div>
                </td>
                <td class="px-4 lg:px-6 py-4">
                    <div class="flex items-center space-x-2">
                        <button onclick="viewTeacher(${teacher.id})" class="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors duration-200" title="View">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button onclick="editTeacher(${teacher.id})" class="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors duration-200" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="deleteTeacher(${teacher.id})" class="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors duration-200" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    }
    
    updatePagination(filtered.length);
}




function getStatusBadge(status) {
    if (status === 'Active') {
        return '<span class="status-badge status-active">Active</span>';
    } else if (status === 'Inactive') {
        return '<span class="status-badge status-inactive">Inactive</span>';
    } else if (status === 'On Leave') {
        return '<span class="status-badge status-onleave">On Leave</span>';
    } else {
        return '<span class="status-badge status-inactive">Unknown</span>';
    }
}

function getFilteredTeachers() {
    const searchTerm = document.getElementById('searchTeacher')?.value.toLowerCase() || '';
    const filterSubject = document.getElementById('filterSubject')?.value || '';
    const filterQualification = document.getElementById('filterQualification')?.value || '';
    const filterStatus = document.getElementById('filterStatus')?.value || '';
    
    return appState.teachers.filter(teacher => {
        // Search filter
        const matchesSearch = !searchTerm || 
            teacher.name.toLowerCase().includes(searchTerm) ||
            teacher.teacherId.toLowerCase().includes(searchTerm) ||
            teacher.primarySubject.toLowerCase().includes(searchTerm) ||
            (Array.isArray(teacher.additionalSubjects) && teacher.additionalSubjects.some(sub => sub.toLowerCase().includes(searchTerm)));
        
        // Subject filter
        const matchesSubject = !filterSubject || 
            teacher.primarySubject === filterSubject ||
            (Array.isArray(teacher.additionalSubjects) && teacher.additionalSubjects.includes(filterSubject));
        
        // Qualification filter
        const matchesQualification = !filterQualification || 
            (Array.isArray(teacher.qualifications) && teacher.qualifications.some(q => q.degree === filterQualification));
        
        // Status filter
        const matchesStatus = !filterStatus || teacher.status === filterStatus;
        
        return matchesSearch && matchesSubject && matchesQualification && matchesStatus;
    });
}

function filterTeachers() {
    appState.currentPage = 1;
    renderTeachersTable();
    updateTeacherStats();
}

function updateTeacherStats() {
    const filtered = getFilteredTeachers();
    
    const totalCount = document.getElementById('totalTeachersCount');
    if (totalCount) totalCount.textContent = filtered.length;
    
    const activeTeachers = filtered.filter(t => t.status === 'Active').length;
    const activeCount = document.getElementById('activeTeachersCount');
    if (activeCount) activeCount.textContent = activeTeachers;
    
    const avgExperience = filtered.length > 0 ? 
        Math.round(filtered.reduce((sum, teacher) => sum + (teacher.totalExperience || 0), 0) / filtered.length) : 0;
    const avgExpElement = document.getElementById('avgExperience');
    if (avgExpElement) avgExpElement.textContent = `${avgExperience} years`;
    
    const uniqueSubjects = new Set();
    filtered.forEach(teacher => {
        if (teacher.primarySubject) uniqueSubjects.add(teacher.primarySubject);
        if (Array.isArray(teacher.additionalSubjects)) {
            teacher.additionalSubjects.forEach(sub => uniqueSubjects.add(sub));
        }
    });
    const subjectsCount = document.getElementById('subjectsCount');
    if (subjectsCount) subjectsCount.textContent = uniqueSubjects.size;
}

function updatePagination(totalItems) {
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    const startItem = totalItems > 0 ? (appState.currentPage - 1) * ITEMS_PER_PAGE + 1 : 0;
    const endItem = Math.min(appState.currentPage * ITEMS_PER_PAGE, totalItems);
    
    document.getElementById('startCount').textContent = startItem;
    document.getElementById('endCount').textContent = endItem;
    document.getElementById('totalCount').textContent = totalItems;
    
    document.getElementById('prevBtn').disabled = appState.currentPage === 1;
    document.getElementById('nextBtn').disabled = appState.currentPage === totalPages;
    
    // Update page numbers
    const pageNumbers = document.getElementById('pageNumbers');
    pageNumbers.innerHTML = '';
    
    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.className = `px-3 py-1 border rounded-lg transition-all duration-200 ${i === appState.currentPage ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 hover:bg-gray-100'}`;
        button.textContent = i;
        button.onclick = () => goToPage(i);
        pageNumbers.appendChild(button);
    }
}

function goToPage(page) {
    appState.currentPage = page;
    renderTeachersTable();
}

function previousPage() {
    if (appState.currentPage > 1) {
        appState.currentPage--;
        renderTeachersTable();
    }
}

function nextPage() {
    const totalPages = Math.ceil(getFilteredTeachers().length / ITEMS_PER_PAGE);
    if (appState.currentPage < totalPages) {
        appState.currentPage++;
        renderTeachersTable();
    }
}

// Teacher CRUD Operations
function viewTeacher(id) {
    const teacher = appState.teachers.find(t => t.id === id);
    if (!teacher) return;
    
    const modal = document.getElementById('viewModalOverlay');
    modal.classList.add('show');
    
    modal.querySelector('.modal-content').innerHTML = `
        <div class="p-6 lg:p-8">
            <div class="flex justify-between items-center mb-6">
                <h3 class="text-xl lg:text-2xl font-bold text-gray-800">Teacher Details - ${teacher.name}</h3>
                <button onclick="closeModal('viewModalOverlay')" class="text-gray-500 hover:text-gray-700">
                    <i class="fas fa-times text-2xl"></i>
                </button>
            </div>
            
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <!-- Teacher Profile -->
                <div class="lg:col-span-1">
                    <div class="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 text-center">
                        <div class="h-32 w-32 bg-white rounded-full mx-auto mb-4 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                            ${teacher.photo ? 
                                `<img src="${teacher.photo}" class="h-full w-full object-cover" alt="${teacher.name}">` :
                                `<i class="fas fa-user-tie text-6xl text-blue-600"></i>`
                            }
                        </div>
                        <h4 class="text-xl font-bold text-gray-800">${teacher.name}</h4>
                        <p class="text-gray-600">${teacher.teacherId}</p>
                        <div class="mt-4 space-y-2">
                            <div class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                <i class="fas fa-user-tie mr-1"></i>
                                ${teacher.designation}
                            </div>
                            <div class="text-sm text-gray-500">${teacher.department} Department</div>
                        </div>
                    </div>
                    
                    <!-- Salary Information -->
                    <div class="mt-6 bg-white rounded-xl border border-gray-200 p-4">
                        <h5 class="font-semibold text-gray-700 mb-3">Salary Information</h5>
                        <div class="space-y-2">
                            <div class="flex justify-between">
                                <span class="text-gray-600">Basic Salary:</span>
                                <span class="font-medium">₹${teacher.salary.basic.toLocaleString()}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">HRA:</span>
                                <span class="font-medium">₹${teacher.salary.hra.toLocaleString()}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">DA:</span>
                                <span class="font-medium">₹${teacher.salary.da.toLocaleString()}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">TA:</span>
                                <span class="font-medium">₹${teacher.salary.ta.toLocaleString()}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">Additional:</span>
                                <span class="font-medium">₹${teacher.salary.additional.toLocaleString()}</span>
                            </div>
                            <div class="pt-2 border-t">
                                <div class="flex justify-between font-bold">
                                    <span>Gross Salary:</span>
                                    <span class="text-green-600">₹${teacher.salary.total.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Teacher Information -->
                <div class="lg:col-span-2">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <!-- Personal Details -->
                        <div class="bg-white rounded-xl border border-gray-200 p-4">
                            <h5 class="font-semibold text-gray-700 mb-3">Personal Details</h5>
                            <div class="space-y-2 text-sm">
                                <div class="flex">
                                    <span class="w-32 text-gray-600">Date of Birth:</span>
                                    <span>${formatDate(teacher.dob)} (${calculateAge(teacher.dob)} years)</span>
                                </div>
                                <div class="flex">
                                    <span class="w-32 text-gray-600">Gender:</span>
                                    <span>${teacher.gender}</span>
                                </div>
                                <div class="flex">
                                    <span class="w-32 text-gray-600">Blood Group:</span>
                                    <span>${teacher.bloodGroup || 'N/A'}</span>
                                </div>
                                <div class="flex">
                                    <span class="w-32 text-gray-600">Contact:</span>
                                    <span>${teacher.contactNumber}</span>
                                </div>
                                <div class="flex">
                                    <span class="w-32 text-gray-600">Email:</span>
                                    <span>${teacher.email}</span>
                                </div>
                                <div class="flex">
                                    <span class="w-32 text-gray-600">Aadhar:</span>
                                    <span>${teacher.aadharNumber || 'N/A'}</span>
                                </div>
                                <div class="flex">
                                    <span class="w-32 text-gray-600">PAN:</span>
                                    <span>${teacher.panNumber || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Professional Details -->
                        <div class="bg-white rounded-xl border border-gray-200 p-4">
                            <h5 class="font-semibold text-gray-700 mb-3">Professional Details</h5>
                            <div class="space-y-2 text-sm">
                                <div class="flex">
                                    <span class="w-32 text-gray-600">Joining Date:</span>
                                    <span>${formatDate(teacher.joiningDate)}</span>
                                </div>
                                <div class="flex">
                                    <span class="w-32 text-gray-600">Experience:</span>
                                    <span>${teacher.totalExperience} years</span>
                                </div>
                                <div class="flex">
                                    <span class="w-32 text-gray-600">Employee ID:</span>
                                    <span>${teacher.employeeId}</span>
                                </div>
                                <div class="flex">
                                    <span class="w-32 text-gray-600">Employment Type:</span>
                                    <span>${teacher.employmentType}</span>
                                </div>
                                <div class="flex">
                                    <span class="w-32 text-gray-600">Status:</span>
                                    <span>${teacher.status}</span>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Subject & Class Details -->
                        <div class="md:col-span-2 bg-white rounded-xl border border-gray-200 p-4">
                            <h5 class="font-semibold text-gray-700 mb-3">Subject & Class Assignments</h5>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div class="space-y-2 text-sm">
                                    <h6 class="font-medium text-blue-600">Subjects</h6>
                                    <div class="flex">
                                        <span class="w-32 text-gray-600">Primary:</span>
                                        <span>${teacher.primarySubject}</span>
                                    </div>
                                    <div class="flex">
                                        <span class="w-32 text-gray-600">Additional:</span>
                                        <span>${Array.isArray(teacher.additionalSubjects) ? teacher.additionalSubjects.join(', ') : 'N/A'}</span>
                                    </div>
                                </div>
                                <div class="space-y-2 text-sm">
                                    <h6 class="font-medium text-pink-600">Classes Assigned</h6>
                                    <div>
                                        <span>${Array.isArray(teacher.classes) ? teacher.classes.map(c => `Class ${c}`).join(', ') : 'N/A'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Educational Qualifications -->
                        <div class="md:col-span-2 bg-white rounded-xl border border-gray-200 p-4">
                            <h5 class="font-semibold text-gray-700 mb-3">Educational Qualifications</h5>
                            <div class="space-y-3">
                                ${Array.isArray(teacher.qualifications) && teacher.qualifications.length > 0 ? 
                                    teacher.qualifications.map(q => `
                                        <div class="flex items-center space-x-3 p-2 border border-gray-100 rounded">
                                            <i class="fas fa-graduation-cap text-blue-500"></i>
                                            <div class="flex-1">
                                                <div class="font-medium">${q.degree} - ${q.specialization}</div>
                                                <div class="text-sm text-gray-600">${q.university} (${q.completionYear})</div>
                                            </div>
                                        </div>
                                    `).join('') :
                                    '<p class="text-sm text-gray-500">No qualifications added</p>'
                                }
                            </div>
                        </div>
                        
                        <!-- Previous Experience -->
                        <div class="md:col-span-2 bg-white rounded-xl border border-gray-200 p-4">
                            <h5 class="font-semibold text-gray-700 mb-3">Previous Experience</h5>
                            <div class="space-y-2">
                                ${Array.isArray(teacher.previousExperience) && teacher.previousExperience.length > 0 ? 
                                    teacher.previousExperience.map(exp => `
                                        <div class="flex justify-between items-center p-2 border border-gray-100 rounded">
                                            <div>
                                                <div class="font-medium">${exp.school}</div>
                                                <div class="text-sm text-gray-600">${exp.position}</div>
                                            </div>
                                            <div class="text-sm font-semibold text-blue-600">${exp.duration} years</div>
                                        </div>
                                    `).join('') :
                                    '<p class="text-sm text-gray-500">No previous experience added</p>'
                                }
                            </div>
                        </div>
                        
                        <!-- Address -->
                        <div class="md:col-span-2 bg-white rounded-xl border border-gray-200 p-4">
                            <h5 class="font-semibold text-gray-700 mb-3">Address</h5>
                            <p class="text-sm">${teacher.address}</p>
                        </div>
                        
                        <!-- Emergency Contact -->
                        <div class="md:col-span-2 bg-white rounded-xl border border-gray-200 p-4">
                            <h5 class="font-semibold text-gray-700 mb-3">Emergency Contact</h5>
                            <div class="text-sm">
                                <div class="flex">
                                    <span class="w-32 text-gray-600">Name:</span>
                                    <span>${teacher.emergencyContactName}</span>
                                </div>
                                <div class="flex">
                                    <span class="w-32 text-gray-600">Contact:</span>
                                    <span>${teacher.emergencyContactNumber}</span>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Bank Details -->
                        <div class="md:col-span-2 bg-white rounded-xl border border-gray-200 p-4">
                            <h5 class="font-semibold text-gray-700 mb-3">Bank Account Details</h5>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <div class="flex">
                                        <span class="w-32 text-gray-600">Bank Name:</span>
                                        <span>${teacher.bankDetails.bankName}</span>
                                    </div>
                                    <div class="flex">
                                        <span class="w-32 text-gray-600">Account No:</span>
                                        <span>${teacher.bankDetails.accountNumber}</span>
                                    </div>
                                </div>
                                <div>
                                    <div class="flex">
                                        <span class="w-32 text-gray-600">IFSC Code:</span>
                                        <span>${teacher.bankDetails.ifscCode}</span>
                                    </div>
                                    <div class="flex">
                                        <span class="w-32 text-gray-600">Branch:</span>
                                        <span>${teacher.bankDetails.branchName}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="flex flex-col lg:flex-row justify-end space-y-4 lg:space-y-0 lg:space-x-4 mt-8 pt-6 border-t border-gray-200">
                <button onclick="editTeacher(${teacher.id})" class="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium">
                    <i class="fas fa-edit mr-2"></i>Edit Teacher
                </button>
                <button onclick="printTeacherDetails(${teacher.id})" class="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium">
                    <i class="fas fa-print mr-2"></i>Print Details
                </button>
            </div>
        </div>
    `;
}

function editTeacher(id) {
    const teacher = appState.teachers.find(t => t.id === id);
    if (!teacher) return;
    
    const modal = document.getElementById('editModalOverlay');
    modal.classList.add('show');
    
    modal.querySelector('.modal-content').innerHTML = `
        <div class="p-6 lg:p-8">
            <div class="flex justify-between items-center mb-6">
                <h3 class="text-xl lg:text-2xl font-bold text-gray-800">Edit Teacher - ${teacher.name}</h3>
                <button onclick="closeModal('editModalOverlay')" class="text-gray-500 hover:text-gray-700">
                    <i class="fas fa-times text-2xl"></i>
                </button>
            </div>
            
            <!-- Edit form will be loaded here -->
            <div class="text-center py-12">
                <i class="fas fa-user-edit text-4xl text-blue-600 mb-4"></i>
                <p class="text-lg text-gray-600">Edit functionality will be implemented here</p>
                <p class="text-sm text-gray-500 mt-2">This modal will contain a full edit form similar to the add teacher form</p>
            </div>
        </div>
    `;
}

function deleteTeacher(id) {
    if (confirm('Are you sure you want to delete this teacher? This action cannot be undone.')) {
        const teacher = appState.teachers.find(t => t.id === id);
        if (teacher) {
            appState.teachers = appState.teachers.filter(t => t.id !== id);
            saveData();
            renderTeachersTable();
            updateTeacherStats();
            Toast.show(`Teacher ${teacher.name} deleted successfully`, 'success');
        }
    }
}

// Add Teacher Handler
function handleAddTeacher() {
    const form = document.getElementById('addTeacherForm');
    if (!form) return;
    
    const formData = new FormData(form);
    const teacherData = {};
    
    for (let [key, value] of formData.entries()) {
        if (key === 'additionalSubjects[]' || key === 'classes[]' || 
            key === 'prevSchool[]' || key === 'prevPosition[]' || key === 'prevDuration[]' ||
            key === 'degree[]' || key === 'specialization[]' || key === 'university[]' || key === 'completionYear[]') {
            if (!teacherData[key.replace('[]', '')]) {
                teacherData[key.replace('[]', '')] = [];
            }
            teacherData[key.replace('[]', '')].push(value);
        } else {
            teacherData[key] = value;
        }
    }
    
    // Validate required fields
    const required = ['teacherName', 'dob', 'gender', 'addressLine1', 'city', 'state', 'pincode', 'contactNumber', 'email', 'emergencyContactName', 'emergencyContactNumber', 'aadharNumber', 'panNumber', 'joiningDate', 'designation', 'totalExperience', 'department', 'employmentType', 'employeeId', 'primarySubject', 'basicSalary', 'bankName', 'accountNumber', 'ifscCode'];
    for (const field of required) {
        if (!teacherData[field]) {
            Toast.show(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`, 'error');
            return;
        }
    }
    
    // Build address
    const address = `${teacherData.addressLine1}${teacherData.addressLine2 ? ', ' + teacherData.addressLine2 : ''}, ${teacherData.city}, ${teacherData.state} - ${teacherData.pincode}`;
    
    // Calculate salary
    const basic = parseFloat(document.getElementById('basicSalary').value || 0);
    const hra = parseFloat(document.getElementById('hra').value || 0);
    const da = parseFloat(document.getElementById('da').value || 0);
    const ta = parseFloat(document.getElementById('ta').value || 0);
    const additionalTotal = calculateAdditionalAllowancesTotal();
    
    const totalSalary = basic + hra + da + ta + additionalTotal;
    
    // Process qualifications
    const qualifications = [];
    if (teacherData.degree && teacherData.degree.length > 0) {
        for (let i = 0; i < teacherData.degree.length; i++) {
            if (teacherData.degree[i] && teacherData.specialization[i] && teacherData.university[i] && teacherData.completionYear[i]) {
                qualifications.push({
                    degree: teacherData.degree[i],
                    specialization: teacherData.specialization[i],
                    university: teacherData.university[i],
                    completionYear: teacherData.completionYear[i]
                });
            }
        }
    }
    
    // Process previous experience
    const previousExperience = [];
    if (teacherData.prevSchool && teacherData.prevSchool.length > 0) {
        for (let i = 0; i < teacherData.prevSchool.length; i++) {
            if (teacherData.prevSchool[i] && teacherData.prevPosition[i] && teacherData.prevDuration[i]) {
                previousExperience.push({
                    school: teacherData.prevSchool[i],
                    position: teacherData.prevPosition[i],
                    duration: parseInt(teacherData.prevDuration[i]) || 0
                });
            }
        }
    }
    
    // Create teacher object
    const newTeacher = {
        id: Date.now(),
        teacherId: `TCH${appState.teacherIdCounter++}`,
        name: teacherData.teacherName,
        dob: teacherData.dob,
        gender: teacherData.gender,
        bloodGroup: teacherData.bloodGroup || '',
        address: address,
        contactNumber: teacherData.contactNumber,
        email: teacherData.email,
        emergencyContactName: teacherData.emergencyContactName,
        emergencyContactNumber: teacherData.emergencyContactNumber,
        aadharNumber: teacherData.aadharNumber,
        panNumber: teacherData.panNumber,
        medicalInfo: teacherData.medicalInfo || '',
        joiningDate: teacherData.joiningDate,
        designation: teacherData.designation,
        totalExperience: parseInt(teacherData.totalExperience) || 0,
        department: teacherData.department,
        employmentType: teacherData.employmentType,
        employeeId: teacherData.employeeId,
        previousExperience: previousExperience,
        qualifications: qualifications,
        primarySubject: teacherData.primarySubject,
        additionalSubjects: teacherData.additionalSubjects || [],
        classes: teacherData.classes || [],
        salary: {
            basic: basic,
            hra: hra,
            da: da,
            ta: ta,
            additional: additionalTotal,
            total: totalSalary
        },
        bankDetails: {
            bankName: teacherData.bankName,
            accountNumber: teacherData.accountNumber,
            ifscCode: teacherData.ifscCode,
            branchName: teacherData.branchName || ''
        },
        status: 'Active',
        createdAt: new Date().toISOString(),
        photo: null
    };
    
    // Add to database
    appState.teachers.push(newTeacher);
    saveData();
    
    // Reset and show success
    resetForm();
    Toast.show(`Teacher ${newTeacher.name} registered successfully! Teacher ID: ${newTeacher.teacherId}`, 'success');
    
    // Redirect after delay
    setTimeout(() => {
        window.location.href = '../teachers-management/teachers-management.html';
    }, 1500);
}

function resetForm() {
    const form = document.getElementById('addTeacherForm');
    if (form) form.reset();
    
    // Reset salary inputs to defaults
    document.getElementById('basicSalary').value = '25000';
    document.getElementById('hra').value = '5000';
    document.getElementById('da').value = '3000';
    document.getElementById('ta').value = '2000';
    
    // Clear additional allowances
    additionalAllowances = [];
    renderAdditionalAllowancesList();
    
    // Clear dynamic entries
    const experienceEntries = document.getElementById('experienceEntries');
    if (experienceEntries) {
        experienceEntries.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">School/Organization</label>
                    <input type="text" name="prevSchool[]" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" placeholder="Previous school name">
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Position</label>
                    <input type="text" name="prevPosition[]" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" placeholder="Position held">
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Duration (Years)</label>
                    <input type="number" name="prevDuration[]" min="0" max="50" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" placeholder="Years">
                </div>
            </div>
        `;
    }
    
    const qualificationEntries = document.getElementById('qualificationEntries');
    if (qualificationEntries) {
        qualificationEntries.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Degree</label>
                    <select name="degree[]" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200">
                        <option value="">Select Degree</option>
                        <option value="Bachelor">Bachelor's Degree</option>
                        <option value="Master">Master's Degree</option>
                        <option value="PhD">Ph.D.</option>
                        <option value="B.Ed.">B.Ed.</option>
                        <option value="M.Ed.">M.Ed.</option>
                        <option value="Diploma">Diploma</option>
                    </select>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Specialization</label>
                    <input type="text" name="specialization[]" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" placeholder="e.g., Mathematics, Physics">
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">University/College</label>
                    <input type="text" name="university[]" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" placeholder="University name">
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Year of Completion</label>
                    <input type="number" name="completionYear[]" min="1950" max="2030" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" placeholder="YYYY">
                </div>
            </div>
        `;
    }
    
    calculateTotalSalary();
    switchTab('personal');
}

// Utility Functions
function calculateAge(dob) {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
}

function exportTeachers() {
    Toast.show('Export functionality will be implemented here', 'info');
}

function printTeacherDetails(id) {
    Toast.show('Print functionality will be implemented here', 'info');
}
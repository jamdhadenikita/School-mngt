// Application State
const APP_STATE = {
    currentTab: 'overview',
    teacherData: null,
    notifications: [],
    unreadNotifications: 3,
    isLoading: false,
    currentMonth: new Date(),
    performanceChart: null,
    attendanceChart: null,
    marksChart: null
};

// Dummy Data for Teachers
const DUMMY_DATA = {
    teacher: {
        id: 1,
        teacherId: 'TCH2024001',
        name: 'Mr. Rajesh Sharma',
        email: 'rajesh.sharma@school.edu',
        phone: '+91 98765 43210',
        dob: '1985-06-15',
        age: 38,
        gender: 'Male',
        bloodGroup: 'A+',
        address: '123, Park Street, Mumbai - 400001',
        emergencyContact: '+91 98765 43211',
        aadharNumber: '123456789012',
        panNumber: 'ABCDE1234F',
        qualification: 'M.Sc. Mathematics, B.Ed., Ph.D.',
        experience: 15,
        department: 'Mathematics',
        designation: 'Senior Teacher',
        employmentType: 'Full Time',
        employeeId: 'EMP001',
        joiningDate: '2015-06-01',
        subjects: ['Mathematics', 'Physics'],
        classesAssigned: ['9A', '10A', '10B', '11A', '12A'],
        classTeacherOf: '10A',
        totalStudents: 180,
        salary: {
            basic: 45000,
            hra: 9000,
            da: 5000,
            ta: 3000,
            total: 62000
        },
        bankDetails: {
            bankName: 'State Bank of India',
            accountNumber: '12345678901234',
            ifscCode: 'SBIN0001234',
            branchName: 'Pimpri Branch'
        },
        status: 'Active',
        lastUpdated: new Date().toISOString()
    },
    
    classes: {
        total: 5,
        list: [
            {
                id: 1,
                className: '10A',
                subject: 'Mathematics',
                totalStudents: 40,
                averageScore: 82,
                classTeacher: true,
                schedule: 'Mon, Wed, Fri (10:00-11:00)',
                room: 'Room 101'
            },
            {
                id: 2,
                className: '9A',
                subject: 'Mathematics',
                totalStudents: 38,
                averageScore: 78,
                classTeacher: false,
                schedule: 'Tue, Thu (11:00-12:00)',
                room: 'Room 102'
            },
            {
                id: 3,
                className: '10B',
                subject: 'Mathematics',
                totalStudents: 42,
                averageScore: 75,
                classTeacher: false,
                schedule: 'Mon, Wed (2:00-3:00)',
                room: 'Room 103'
            },
            {
                id: 4,
                className: '11A',
                subject: 'Physics',
                totalStudents: 35,
                averageScore: 80,
                classTeacher: false,
                schedule: 'Tue, Thu, Fri (9:00-10:00)',
                room: 'Lab 1'
            },
            {
                id: 5,
                className: '12A',
                subject: 'Physics',
                totalStudents: 25,
                averageScore: 85,
                classTeacher: false,
                schedule: 'Mon, Wed (3:00-4:00)',
                room: 'Lab 2'
            }
        ],
        upcomingTests: [
            { class: '10A', subject: 'Mathematics', date: '2024-02-20', topic: 'Trigonometry', maxMarks: 25 },
            { class: '9A', subject: 'Mathematics', date: '2024-02-22', topic: 'Algebra', maxMarks: 20 },
            { class: '11A', subject: 'Physics', date: '2024-02-25', topic: 'Optics', maxMarks: 30 }
        ]
    },
    
    attendance: {
        totalClasses: 180,
        conducted: 170,
        cancelled: 10,
        percentage: 94.44,
        monthlyData: [
            { month: 'Jan', conducted: 22, cancelled: 0 },
            { month: 'Feb', conducted: 20, cancelled: 1 },
            { month: 'Mar', conducted: 23, cancelled: 0 },
            { month: 'Apr', conducted: 21, cancelled: 2 },
            { month: 'May', conducted: 19, cancelled: 1 },
            { month: 'Jun', conducted: 22, cancelled: 0 },
            { month: 'Jul', conducted: 20, cancelled: 3 },
            { month: 'Aug', conducted: 23, cancelled: 1 }
        ],
        classWiseAttendance: [
            { className: '10A', total: 40, present: 38, percentage: 95 },
            { className: '9A', total: 38, present: 35, percentage: 92.1 },
            { className: '10B', total: 42, present: 39, percentage: 92.9 },
            { className: '11A', total: 35, present: 33, percentage: 94.3 },
            { className: '12A', total: 25, present: 24, percentage: 96 }
        ]
    },
    
    marks: {
        totalTests: 15,
        averageClassScore: 78.5,
        topPerformer: { name: 'Aarav Sharma', class: '10A', score: 98 },
        weakestArea: 'Trigonometry',
        recentEvaluations: [
            {
                test: 'Unit Test 2',
                class: '10A',
                subject: 'Mathematics',
                date: '2024-01-15',
                averageScore: 82,
                highestScore: 98,
                lowestScore: 65,
                totalStudents: 40,
                graded: 40
            },
            {
                test: 'Weekly Quiz',
                class: '9A',
                subject: 'Mathematics',
                date: '2024-01-10',
                averageScore: 75,
                highestScore: 95,
                lowestScore: 60,
                totalStudents: 38,
                graded: 38
            },
            {
                test: 'Term Exam',
                class: '11A',
                subject: 'Physics',
                date: '2023-12-20',
                averageScore: 80,
                highestScore: 96,
                lowestScore: 68,
                totalStudents: 35,
                graded: 35
            }
        ],
        pendingEvaluations: [
            { class: '10B', subject: 'Mathematics', test: 'Assignment 3', dueDate: '2024-02-18', submissions: 40 },
            { class: '12A', subject: 'Physics', test: 'Lab Report', dueDate: '2024-02-19', submissions: 24 }
        ]
    },
    
    timetable: {
        Monday: [
            { time: '8:00-9:00', class: '11A', subject: 'Physics', room: 'Lab 1' },
            { time: '9:00-10:00', class: '12A', subject: 'Physics', room: 'Lab 2' },
            { time: '10:15-11:15', class: '10A', subject: 'Mathematics', room: 'Room 101' },
            { time: '11:15-12:15', class: '10B', subject: 'Mathematics', room: 'Room 103' },
            { time: '2:00-3:00', class: '10B', subject: 'Mathematics', room: 'Room 103' },
            { time: '3:00-4:00', class: '12A', subject: 'Physics', room: 'Lab 2' }
        ],
        Tuesday: [
            { time: '9:00-10:00', class: '11A', subject: 'Physics', room: 'Lab 1' },
            { time: '10:15-11:15', class: '9A', subject: 'Mathematics', room: 'Room 102' },
            { time: '11:15-12:15', class: '10A', subject: 'Mathematics', room: 'Room 101' },
            { time: '2:00-3:00', free: true, activity: 'Staff Meeting' }
        ],
        Wednesday: [
            { time: '8:00-9:00', class: '11A', subject: 'Physics', room: 'Lab 1' },
            { time: '10:15-11:15', class: '10A', subject: 'Mathematics', room: 'Room 101' },
            { time: '11:15-12:15', class: '10B', subject: 'Mathematics', room: 'Room 103' },
            { time: '2:00-3:00', class: '10B', subject: 'Mathematics', room: 'Room 103' },
            { time: '3:00-4:00', class: '12A', subject: 'Physics', room: 'Lab 2' }
        ],
        Thursday: [
            { time: '9:00-10:00', class: '11A', subject: 'Physics', room: 'Lab 1' },
            { time: '10:15-11:15', class: '9A', subject: 'Mathematics', room: 'Room 102' },
            { time: '11:15-12:15', class: '10A', subject: 'Mathematics', room: 'Room 101' },
            { time: '2:00-4:00', free: true, activity: 'Paper Setting' }
        ],
        Friday: [
            { time: '8:00-9:00', class: '11A', subject: 'Physics', room: 'Lab 1' },
            { time: '9:00-10:00', class: '12A', subject: 'Physics', room: 'Lab 2' },
            { time: '10:15-11:15', class: '10A', subject: 'Mathematics', room: 'Room 101' },
            { time: '11:15-12:15', class: '10B', subject: 'Mathematics', room: 'Room 103' },
            { time: '2:00-3:00', free: true, activity: 'Student Counseling' }
        ],
        Saturday: [
            { time: '8:00-10:00', free: true, activity: 'Remedial Classes' },
            { time: '10:15-12:15', free: true, activity: 'Parent-Teacher Meeting' }
        ]
    },
    
    students: {
        total: 180,
        classWise: [
            { className: '10A', total: 40, boys: 22, girls: 18 },
            { className: '9A', total: 38, boys: 20, girls: 18 },
            { className: '10B', total: 42, boys: 24, girls: 18 },
            { className: '11A', total: 35, boys: 19, girls: 16 },
            { className: '12A', total: 25, boys: 15, girls: 10 }
        ],
        topStudents: [
            { name: 'Aarav Sharma', class: '10A', score: 98, attendance: 96 },
            { name: 'Priya Patel', class: '10A', score: 96, attendance: 98 },
            { name: 'Rohan Kumar', class: '11A', score: 96, attendance: 92 },
            { name: 'Sneha Singh', class: '12A', score: 95, attendance: 100 },
            { name: 'Vikram Mehta', class: '9A', score: 95, attendance: 94 }
        ],
        needAttention: [
            { name: 'Rahul Verma', class: '10B', score: 58, attendance: 82, reason: 'Low scores in Algebra' },
            { name: 'Neha Gupta', class: '9A', score: 60, attendance: 88, reason: 'Frequent absenteeism' },
            { name: 'Amit Joshi', class: '11A', score: 62, attendance: 90, reason: 'Needs physics concepts help' }
        ]
    },
    
    notifications: [
        {
            id: 1,
            title: 'Staff Meeting',
            message: 'Staff meeting scheduled today at 2:00 PM in Conference Room',
            type: 'meeting',
            icon: 'fa-users',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            read: false,
            priority: 'high'
        },
        {
            id: 2,
            title: 'Test Paper Submission',
            message: 'Submit Unit Test 3 question papers by 20th Feb',
            type: 'exam',
            icon: 'fa-clipboard-list',
            timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
            read: false,
            priority: 'high'
        },
        {
            id: 3,
            title: 'Parent-Teacher Meeting',
            message: 'PTM for Class 10A on 25th Feb at 3:00 PM',
            type: 'meeting',
            icon: 'fa-handshake',
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            read: true,
            priority: 'medium'
        },
        {
            id: 4,
            title: 'Salary Credited',
            message: 'February salary has been credited to your account',
            type: 'salary',
            icon: 'fa-money-bill-wave',
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            read: true,
            priority: 'low'
        },
        {
            id: 5,
            title: 'Workshop Reminder',
            message: 'Teaching Methodology workshop on 28th Feb',
            type: 'workshop',
            icon: 'fa-chalkboard-teacher',
            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            read: true,
            priority: 'medium'
        }
    ]
};

// Toast System
class Toast {
    static show(message, type = 'success', duration = 3000) {
        const toast = document.createElement('div');
        const id = 'toast-' + Date.now();
        
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        
        const colors = {
            success: 'bg-green-500',
            error: 'bg-red-500',
            warning: 'bg-yellow-500',
            info: 'bg-blue-500'
        };
        
        toast.id = id;
        toast.className = `toast ${colors[type]} text-white rounded-lg shadow-lg p-4 transform transition-all duration-300 translate-x-full`;
        toast.innerHTML = `
            <div class="flex items-center space-x-3">
                <i class="fas ${icons[type]} text-xl"></i>
                <div class="flex-1">
                    <p class="font-medium">${message}</p>
                </div>
                <button onclick="document.getElementById('${id}').remove()" class="text-white/80 hover:text-white">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        const container = document.getElementById('toastContainer');
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.remove('translate-x-full');
        }, 10);
        
        setTimeout(() => {
            toast.classList.add('translate-x-full');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }
}

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    initApp();
});

// Initialize App
async function initApp() {
    // Simulate loading
    await simulateLoading();
    
    // Load data
    APP_STATE.teacherData = DUMMY_DATA;
    APP_STATE.notifications = DUMMY_DATA.notifications;
    
    // Initialize UI
    initUI();
    setupEventListeners();
    loadCurrentTab();
    
    // Start auto-refresh
    startAutoRefresh();
}

// Simulate Loading
async function simulateLoading() {
    const progressBar = document.getElementById('loadingProgress');
    const steps = [20, 40, 60, 80, 100];
    
    for (let i = 0; i < steps.length; i++) {
        progressBar.style.width = `${steps[i]}%`;
        await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    document.getElementById('loadingScreen').style.opacity = '0';
    setTimeout(() => {
        document.getElementById('loadingScreen').style.display = 'none';
        document.getElementById('mainContent').classList.remove('hidden');
    }, 500);
}

// Initialize UI
function initUI() {
    updateTeacherInfo();
    setupNavigation();
    updateNotifications();
    updateGreeting();
    updateDateTime();
}

// Update Teacher Info
function updateTeacherInfo() {
    const teacher = APP_STATE.teacherData.teacher;
    
    // Update all teacher name elements
    document.querySelectorAll('#teacherName, #userName, #mobileTeacherName').forEach(el => {
        el.textContent = teacher.name;
    });
    
    // Update teacher ID elements
    document.querySelectorAll('#teacherId, #mobileTeacherId').forEach(el => {
        el.textContent = teacher.teacherId;
    });
    
    // Update quick stats
    document.getElementById('quickClasses').textContent = teacher.classesAssigned.length;
    document.getElementById('quickStudents').textContent = teacher.totalStudents;
    document.getElementById('quickExperience').textContent = `${teacher.experience} years`;
    
    // Update welcome message
    updateGreeting();
}

// Setup Navigation
function setupNavigation() {
    const navItems = [
        { id: 'overview', icon: 'fa-home', label: 'Overview', description: 'Dashboard summary' },
        { id: 'classes', icon: 'fa-users', label: 'My Classes', description: 'Class assignments' },
        { id: 'attendance', icon: 'fa-calendar-check', label: 'Attendance', description: 'Class attendance' },
        { id: 'marks', icon: 'fa-chart-line', label: 'Marks', description: 'Evaluations & grading' },
        { id: 'timetable', icon: 'fa-clock', label: 'Timetable', description: 'Teaching schedule' },
        { id: 'students', icon: 'fa-user-graduate', label: 'Students', description: 'Student information' },
        { id: 'profile', icon: 'fa-user-circle', label: 'Profile', description: 'Complete details' },
        { id: 'analytics', icon: 'fa-chart-bar', label: 'Analytics', description: 'Performance insights' }
    ];
    
    // Desktop Navigation
    const desktopNav = document.getElementById('desktopNav');
    desktopNav.innerHTML = navItems.map(item => `
        <button onclick="switchTab('${item.id}')" 
                class="w-full text-left px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-600 transition-all duration-300 flex items-center space-x-3 group ${APP_STATE.currentTab === item.id ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600' : ''}"
                data-tab="${item.id}">
            <div class="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center group-hover:from-blue-200 group-hover:to-purple-200">
                <i class="fas ${item.icon} text-blue-600"></i>
            </div>
            <div class="flex-1">
                <span class="font-medium">${item.label}</span>
                <p class="text-xs text-gray-500">${item.description}</p>
            </div>
            <i class="fas fa-chevron-right text-gray-400 group-hover:text-blue-600"></i>
        </button>
    `).join('');
    
    // Mobile Navigation
    const mobileNav = document.getElementById('mobileNavItems');
    mobileNav.innerHTML = navItems.map(item => `
        <button onclick="switchTab('${item.id}'); closeMobileMenu();" 
                class="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100 flex items-center space-x-3 ${APP_STATE.currentTab === item.id ? 'bg-blue-50 text-blue-600' : ''}">
            <div class="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                <i class="fas ${item.icon} ${APP_STATE.currentTab === item.id ? 'text-blue-600' : 'text-gray-500'}"></i>
            </div>
            <div class="flex-1">
                <span class="font-medium">${item.label}</span>
                <p class="text-xs text-gray-500">${item.description}</p>
            </div>
        </button>
    `).join('');
    
    // Bottom Navigation (Mobile - limited to 4 items)
    const bottomNav = document.getElementById('bottomNav');
    const bottomNavItems = [
        { id: 'overview', icon: 'fa-home', label: 'Home' },
        { id: 'classes', icon: 'fa-users', label: 'Classes' },
        { id: 'marks', icon: 'fa-chart-line', label: 'Marks' },
        { id: 'profile', icon: 'fa-user', label: 'Profile' }
    ];
    
    bottomNav.innerHTML = bottomNavItems.map(item => `
        <button onclick="switchTab('${item.id}')" 
                class="flex flex-col items-center space-y-1 p-2 rounded-lg ${APP_STATE.currentTab === item.id ? 'text-blue-600' : 'text-gray-500'}">
            <i class="fas ${item.icon} text-xl"></i>
            <span class="text-xs">${item.label}</span>
        </button>
    `).join('');
}    
    // Bottom Navigation (Mobile - limited to 4 items)
    const bottomNav = document.getElementById('bottomNav');
    const bottomNavItems = [
        { id: 'overview', icon: 'fa-home', label: 'Home' },
        { id: 'classes', icon: 'fa-users', label: 'Classes' },
        { id: 'marks', icon: 'fa-chart-line', label: 'Marks' },
        { id: 'profile', icon: 'fa-user', label: 'Profile' }
    ];
    
    bottomNav.innerHTML = bottomNavItems.map(item => `
        <button onclick="switchTab('${item.id}')" 
                class="flex flex-col items-center space-y-1 p-2 rounded-lg ${APP_STATE.currentTab === item.id ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}">
            <i class="fas ${item.icon} text-xl"></i>
            <span class="text-xs">${item.label}</span>
        </button>
    `).join('');


// Switch Tab
function switchTab(tabId) {
    if (APP_STATE.currentTab === tabId) return;
    
    APP_STATE.currentTab = tabId;
    
    // Update active tab UI
    document.querySelectorAll('[data-tab]').forEach(btn => {
        btn.classList.remove('bg-gradient-to-r', 'from-blue-50', 'to-purple-50', 'dark:from-blue-900/20', 'dark:to-purple-900/20', 'text-blue-600', 'dark:text-blue-400');
    });
    
    const activeBtn = document.querySelector(`[data-tab="${tabId}"]`);
    if (activeBtn) {
        activeBtn.classList.add('bg-gradient-to-r', 'from-blue-50', 'to-purple-50', 'dark:from-blue-900/20', 'dark:to-purple-900/20', 'text-blue-600', 'dark:text-blue-400');
    }
    
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected tab
    const selectedTab = document.getElementById(`${tabId}Tab`);
    if (selectedTab) {
        selectedTab.classList.add('active');
        loadTabContent(tabId);
    }
    
    // Update current tab title
    const tabTitles = {
        overview: 'Dashboard',
        classes: 'My Classes',
        attendance: 'Attendance',
        marks: 'Marks & Evaluations',
        timetable: 'Teaching Timetable',
        students: 'Students',
        profile: 'My Profile',
        analytics: 'Analytics'
    };
    
    document.getElementById('currentTabTitle').textContent = tabTitles[tabId] || 'Dashboard';
    
    // Close mobile menu if open
    closeMobileMenu();
}

// Load Tab Content
function loadTabContent(tabId) {
    switch(tabId) {
        case 'overview':
            loadOverviewTab();
            break;
        case 'classes':
            loadClassesTab();
            break;
        case 'attendance':
            loadAttendanceTab();
            break;
        case 'marks':
            loadMarksTab();
            break;
        case 'timetable':
            loadTimetableTab();
            break;
        case 'students':
            loadStudentsTab();
            break;
        case 'profile':
            loadProfileTab();
            break;
        case 'analytics':
            loadAnalyticsTab();
            break;
    }
}

// Load Current Tab
function loadCurrentTab() {
    loadTabContent(APP_STATE.currentTab);
}

// Load Overview Tab
function loadOverviewTab() {
    const tabContent = document.getElementById('overviewTab');
    const data = APP_STATE.teacherData;
    
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const todaySchedule = data.timetable[today] || [];
    
    tabContent.innerHTML = `
        <!-- Welcome Banner -->
        <div class="teacher-gradient rounded-2xl shadow-lg p-6 mb-6 text-white">
            <div class="flex flex-col md:flex-row items-center justify-between">
                <div>
                    <h1 class="text-2xl font-bold mb-2" id="welcomeMessage">Welcome, ${data.teacher.name.split(' ')[0]}!</h1>
                    <p class="opacity-90">Here's your teaching summary for today</p>
                    <div class="flex flex-wrap gap-4 mt-4">
                        <div class="flex items-center space-x-2">
                            <i class="fas fa-calendar"></i>
                            <span id="currentDate">${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </div>
                        <div class="flex items-center space-x-2">
                            <i class="fas fa-clock"></i>
                            <span id="currentTime">${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                    </div>
                </div>
                <div class="mt-4 md:mt-0">
                    <div class="h-20 w-20 rounded-full bg-white/10 flex items-center justify-center">
                        <i class="fas fa-award text-3xl"></i>
                    </div>
                </div>
            </div>
        </div>

        <!-- Quick Stats -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <!-- Classes Card -->
            <div class="bg-white rounded-xl shadow p-6 card-hover">
                <div class="flex items-center justify-between mb-4">
                    <div>
                        <p class="text-sm text-gray-600">Classes Assigned</p>
                        <p class="text-3xl font-bold text-blue-600">${data.classes.total}</p>
                    </div>
                    <div class="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <i class="fas fa-users text-blue-600 text-xl"></i>
                    </div>
                </div>
                <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div class="h-full bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full" style="width: ${(data.classes.total / 8) * 100}%"></div>
                </div>
            </div>

            <!-- Students Card -->
            <div class="bg-white rounded-xl shadow p-6 card-hover">
                <div class="flex items-center justify-between mb-4">
                    <div>
                        <p class="text-sm text-gray-600">Total Students</p>
                        <p class="text-3xl font-bold text-purple-600">${data.teacher.totalStudents}</p>
                    </div>
                    <div class="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                        <i class="fas fa-user-graduate text-purple-600 text-xl"></i>
                    </div>
                </div>
                <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div class="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full" style="width: ${Math.min((data.teacher.totalStudents / 250) * 100, 100)}%"></div>
                </div>
            </div>

            <!-- Attendance Card -->
            <div class="bg-white rounded-xl shadow p-6 card-hover">
                <div class="flex items-center justify-between mb-4">
                    <div>
                        <p class="text-sm text-gray-600">Attendance %</p>
                        <p class="text-3xl font-bold text-green-600">${data.attendance.percentage}%</p>
                    </div>
                    <div class="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                        <i class="fas fa-calendar-check text-green-600 text-xl"></i>
                    </div>
                </div>
                <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div class="h-full bg-gradient-to-r from-green-400 to-emerald-400 rounded-full" style="width: ${data.attendance.percentage}%"></div>
                </div>
            </div>

            <!-- Pending Evaluations -->
            <div class="bg-white rounded-xl shadow p-6 card-hover">
                <div class="flex items-center justify-between mb-4">
                    <div>
                        <p class="text-sm text-gray-600">Pending Evaluations</p>
                        <p class="text-3xl font-bold text-red-600">${data.marks.pendingEvaluations.length}</p>
                    </div>
                    <div class="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                        <i class="fas fa-clipboard-check text-red-600 text-xl"></i>
                    </div>
                </div>
                <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div class="h-full bg-gradient-to-r from-red-400 to-rose-400 rounded-full" style="width: ${Math.min((data.marks.pendingEvaluations.length / 5) * 100, 100)}%"></div>
                </div>
            </div>
        </div>

        <!-- Today's Schedule & Upcoming Tests -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <!-- Today's Schedule -->
            <div class="bg-white rounded-xl shadow p-6">
                <h3 class="text-lg font-bold mb-4 flex items-center">
                    <i class="fas fa-calendar-day text-blue-600 mr-2"></i>
                    Today's Schedule (${today})
                </h3>
                <div class="space-y-3">
                    ${todaySchedule.length > 0 ? todaySchedule.map(item => `
                        <div class="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
                            <div class="flex items-center space-x-3">
                                <div class="h-10 w-10 bg-blue-200 rounded-lg flex items-center justify-center">
                                    <i class="fas ${item.free ? 'fa-coffee' : 'fa-chalkboard-teacher'} text-blue-600"></i>
                                </div>
                                <div>
                                    <h4 class="font-medium">${item.free ? item.activity : `${item.class} - ${item.subject}`}</h4>
                                    <p class="text-sm text-gray-600">${item.free ? 'Free Period' : `${item.room} • ${item.time}`}</p>
                                </div>
                            </div>
                            <span class="font-medium">${item.time}</span>
                        </div>
                    `).join('') : '<p class="text-center text-gray-500 py-4">No classes scheduled for today</p>'}
                </div>
            </div>

            <!-- Upcoming Tests -->
            <div class="bg-white rounded-xl shadow p-6">
                <h3 class="text-lg font-bold mb-4 flex items-center">
                    <i class="fas fa-clipboard-list text-purple-600 mr-2"></i>
                    Upcoming Tests
                </h3>
                <div class="space-y-3">
                    ${data.classes.upcomingTests.slice(0, 3).map(test => {
                        const daysLeft = Math.ceil((new Date(test.date) - new Date()) / (1000 * 60 * 60 * 24));
                        return `
                            <div class="flex items-center justify-between p-3 border rounded-xl">
                                <div>
                                    <h4 class="font-medium">${test.class} - ${test.subject}</h4>
                                    <p class="text-sm text-gray-600">${test.topic}</p>
                                    <p class="text-xs text-gray-500">${new Date(test.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                                </div>
                                <div class="text-right">
                                    <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${daysLeft <= 3 ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}">
                                        ${daysLeft === 0 ? 'Today' : daysLeft === 1 ? 'Tomorrow' : `${daysLeft} days`}
                                    </span>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        </div>

        <!-- Class Performance & Quick Actions -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Class Performance -->
            <div class="bg-white rounded-xl shadow p-6">
                <h3 class="text-lg font-bold mb-4 flex items-center">
                    <i class="fas fa-chart-line text-green-600 mr-2"></i>
                    Class Performance
                </h3>
                <div class="space-y-3">
                    ${data.classes.list.slice(0, 4).map(cls => `
                        <div class="flex items-center justify-between p-3 border rounded-xl">
                            <div class="flex items-center space-x-3">
                                <div class="h-10 w-10 ${cls.classTeacher ? 'bg-blue-100' : 'bg-gray-100'} rounded-lg flex items-center justify-center">
                                    <i class="fas ${cls.classTeacher ? 'fa-user-tie text-blue-600' : 'fa-chalkboard-teacher text-gray-600'}"></i>
                                </div>
                                <div>
                                    <h4 class="font-medium">${cls.className}</h4>
                                    <p class="text-sm text-gray-600">${cls.subject} • ${cls.totalStudents} students</p>
                                </div>
                            </div>
                            <div class="text-right">
                                <span class="font-bold text-lg">${cls.averageScore}%</span>
                                <p class="text-sm text-gray-500">Average</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Quick Actions -->
            <div class="bg-white rounded-xl shadow p-6">
                <h3 class="text-lg font-bold mb-4 flex items-center">
                    <i class="fas fa-bolt text-orange-600 mr-2"></i>
                    Quick Actions
                </h3>
                <div class="grid grid-cols-2 gap-3">
                    <button onclick="switchTab('attendance')" class="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl text-center hover:shadow-md transition-shadow">
                        <i class="fas fa-calendar-check text-green-600 text-2xl mb-2"></i>
                        <p class="font-medium">Mark Attendance</p>
                    </button>
                    <button onclick="switchTab('marks')" class="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl text-center hover:shadow-md transition-shadow">
                        <i class="fas fa-edit text-blue-600 text-2xl mb-2"></i>
                        <p class="font-medium">Enter Marks</p>
                    </button>
                    <button onclick="switchTab('timetable')" class="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl text-center hover:shadow-md transition-shadow">
                        <i class="fas fa-clock text-purple-600 text-2xl mb-2"></i>
                        <p class="font-medium">View Timetable</p>
                    </button>
                    <button onclick="window.location.href='../teachers-management/teachers-management.html'" class="p-4 bg-gradient-to-br from-red-50 to-rose-50 rounded-xl text-center hover:shadow-md transition-shadow">
                        <i class="fas fa-users-cog text-red-600 text-2xl mb-2"></i>
                        <p class="font-medium">Manage Teachers</p>
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Load Classes Tab
function loadClassesTab() {
    const tabContent = document.getElementById('classesTab');
    const data = APP_STATE.teacherData.classes;
    
    tabContent.innerHTML = `
        <div class="animate-fade-in">
            <!-- Header -->
            <div class="mb-6">
                <h2 class="text-2xl font-bold text-gray-800 mb-2">My Classes</h2>
                <p class="text-gray-600">Manage your class assignments and student information</p>
            </div>

            <!-- Class Stats -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div class="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow-lg p-6">
                    <p class="text-sm opacity-90">Total Classes</p>
                    <p class="text-3xl font-bold mt-2">${data.total}</p>
                </div>
                <div class="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl shadow-lg p-6">
                    <p class="text-sm opacity-90">Total Students</p>
                    <p class="text-3xl font-bold mt-2">${APP_STATE.teacherData.teacher.totalStudents}</p>
                </div>
                <div class="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl shadow-lg p-6">
                    <p class="text-sm opacity-90">Class Teacher Of</p>
                    <p class="text-3xl font-bold mt-2">${APP_STATE.teacherData.teacher.classTeacherOf}</p>
                </div>
                <div class="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white rounded-xl shadow-lg p-6">
                    <p class="text-sm opacity-90">Average Score</p>
                    <p class="text-3xl font-bold mt-2">${data.list.reduce((sum, cls) => sum + cls.averageScore, 0) / data.list.length}%</p>
                </div>
            </div>

            <!-- Class List -->
            <div class="bg-white rounded-xl shadow p-6 mb-6">
                <h3 class="text-lg font-bold mb-4">Class Assignments</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    ${data.list.map(cls => `
                        <div class="border rounded-xl p-4 hover:shadow-md transition-shadow ${cls.classTeacher ? 'border-l-4 border-l-blue-500' : ''}">
                            <div class="flex justify-between items-start mb-3">
                                <div>
                                    <h4 class="font-bold text-lg">${cls.className}</h4>
                                    <p class="text-sm text-gray-600">${cls.subject}</p>
                                    ${cls.classTeacher ? '<span class="inline-flex items-center px-2 py-1 mt-1 rounded text-xs font-medium bg-blue-100 text-blue-800">Class Teacher</span>' : ''}
                                </div>
                                <div class="text-right">
                                    <div class="text-2xl font-bold text-green-600">${cls.averageScore}%</div>
                                    <div class="text-sm text-gray-500">Average</div>
                                </div>
                            </div>
                            
                            <div class="space-y-2 text-sm">
                                <div class="flex justify-between">
                                    <span class="text-gray-600">Students:</span>
                                    <span class="font-medium">${cls.totalStudents}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-600">Schedule:</span>
                                    <span class="font-medium">${cls.schedule}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-600">Room:</span>
                                    <span class="font-medium">${cls.room}</span>
                                </div>
                            </div>
                            
                            <div class="flex space-x-2 mt-4">
                                <button onclick="viewClassDetails(${cls.id})" class="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                                    <i class="fas fa-eye mr-1"></i> View
                                </button>
                                <button onclick="markAttendance('${cls.className}')" class="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
                                    <i class="fas fa-check-circle mr-1"></i> Attendance
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Upcoming Tests -->
            <div class="bg-white rounded-xl shadow p-6">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-bold">Upcoming Tests & Assignments</h3>
                    <button onclick="addNewTest()" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                        <i class="fas fa-plus mr-1"></i> Schedule Test
                    </button>
                </div>
                
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead>
                            <tr class="bg-gray-50">
                                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-600">Date</th>
                                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-600">Class</th>
                                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-600">Subject</th>
                                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-600">Topic</th>
                                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-600">Max Marks</th>
                                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-600">Status</th>
                                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-600">Action</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200">
                            ${data.upcomingTests.map(test => {
                                const daysLeft = Math.ceil((new Date(test.date) - new Date()) / (1000 * 60 * 60 * 24));
                                return `
                                    <tr class="hover:bg-gray-50">
                                        <td class="px-4 py-3">${new Date(test.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                                        <td class="px-4 py-3 font-medium">${test.class}</td>
                                        <td class="px-4 py-3">${test.subject}</td>
                                        <td class="px-4 py-3">${test.topic}</td>
                                        <td class="px-4 py-3">${test.maxMarks}</td>
                                        <td class="px-4 py-3">
                                            <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${daysLeft <= 3 ? 'bg-red-100 text-red-800' : daysLeft <= 7 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}">
                                                ${daysLeft === 0 ? 'Today' : daysLeft === 1 ? 'Tomorrow' : `${daysLeft} days`}
                                            </span>
                                        </td>
                                        <td class="px-4 py-3">
                                            <button onclick="prepareQuestionPaper('${test.class}', '${test.subject}', '${test.topic}')" class="text-blue-600 hover:text-blue-800">
                                                <i class="fas fa-edit"></i> Prepare
                                            </button>
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

// Load Attendance Tab
function loadAttendanceTab() {
    const tabContent = document.getElementById('attendanceTab');
    const data = APP_STATE.teacherData.attendance;
    
    tabContent.innerHTML = `
        <div class="animate-fade-in">
            <!-- Header -->
            <div class="mb-6">
                <h2 class="text-2xl font-bold text-gray-800 mb-2">Attendance Management</h2>
                <p class="text-gray-600">Track and manage class attendance</p>
            </div>

            <!-- Overall Stats -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div class="bg-white rounded-xl shadow p-6">
                    <div class="text-center">
                        <div class="relative inline-flex items-center justify-center mb-4">
                            <svg class="progress-ring" width="120" height="120">
                                <circle cx="60" cy="60" r="54" stroke="#e5e7eb" stroke-width="8" fill="none"></circle>
                                <circle id="attendanceCircle" cx="60" cy="60" r="54" stroke="#10b981" stroke-width="8" fill="none" stroke-dasharray="339.292" stroke-dashoffset="${339.292 * (1 - data.percentage / 100)}" stroke-linecap="round"></circle>
                            </svg>
                            <div class="absolute">
                                <p class="text-3xl font-bold text-gray-800">${data.percentage}%</p>
                            </div>
                        </div>
                        <p class="text-sm text-gray-600">Overall Attendance</p>
                    </div>
                </div>

                <div class="bg-white rounded-xl shadow p-6">
                    <div class="flex items-center justify-between mb-2">
                        <span class="text-gray-600">Total Classes</span>
                        <i class="fas fa-calendar text-gray-400"></i>
                    </div>
                    <p class="text-2xl font-bold text-gray-800">${data.totalClasses}</p>
                </div>

                <div class="bg-white rounded-xl shadow p-6">
                    <div class="flex items-center justify-between mb-2">
                        <span class="text-gray-600">Conducted</span>
                        <i class="fas fa-check-circle text-green-500"></i>
                    </div>
                    <p class="text-2xl font-bold text-green-600">${data.conducted}</p>
                </div>

                <div class="bg-white rounded-xl shadow p-6">
                    <div class="flex items center justify-between mb-2">
                        <span class="text-gray-600">Cancelled</span>
                        <i class="fas fa-times-circle text-red-500"></i>
                    </div>
                    <p class="text-2xl font-bold text-red-600">${data.cancelled}</p>
                </div>
            </div>

            <!-- Class-wise Attendance -->
            <div class="bg-white rounded-xl shadow p-6 mb-6">
                <h3 class="text-lg font-bold mb-4">Class-wise Attendance</h3>
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead>
                            <tr class="bg-gray-50">
                                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-600">Class</th>
                                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-600">Total Students</th>
                                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-600">Present</th>
                                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-600">Attendance %</th>
                                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-600">Action</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200">
                            ${data.classWiseAttendance.map(cls => `
                                <tr class="hover:bg-gray-50">
                                    <td class="px-4 py-3 font-medium">${cls.className}</td>
                                    <td class="px-4 py-3">${cls.total}</td>
                                    <td class="px-4 py-3">${cls.present}</td>
                                    <td class="px-4 py-3">
                                        <div class="flex items-center">
                                            <span class="mr-2">${cls.percentage}%</span>
                                            <div class="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div class="h-full ${cls.percentage >= 90 ? 'bg-green-500' : cls.percentage >= 75 ? 'bg-yellow-500' : 'bg-red-500'} rounded-full" style="width: ${cls.percentage}%"></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td class="px-4 py-3">
                                        <button onclick="markAttendance('${cls.className}')" class="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                                            <i class="fas fa-edit mr-1"></i> Mark
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Monthly Attendance Chart -->
            <div class="bg-white rounded-xl shadow p-6">
                <h3 class="text-lg font-bold mb-4">Monthly Attendance Trend</h3>
                <div class="h-64">
                    <canvas id="attendanceChart"></canvas>
                </div>
            </div>

            <!-- Quick Mark Attendance -->
            <div class="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl shadow p-6">
                <h3 class="text-lg font-bold mb-4">Quick Mark Attendance</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Select Class</label>
                        <select id="attendanceClass" class="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white">
                            <option value="">Choose a class</option>
                            ${APP_STATE.teacherData.classes.list.map(cls => `
                                <option value="${cls.className}">${cls.className} - ${cls.subject}</option>
                            `).join('')}
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Date</label>
                        <input type="date" id="attendanceDate" class="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white" value="${new Date().toISOString().split('T')[0]}">
                    </div>
                    <div class="md:col-span-2">
                        <button onclick="quickMarkAttendance()" class="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium">
                            <i class="fas fa-check-circle mr-2"></i> Mark Today's Attendance
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Initialize attendance chart
    initAttendanceChart();
}

// Load Marks Tab
function loadMarksTab() {
    const tabContent = document.getElementById('marksTab');
    const data = APP_STATE.teacherData.marks;
    
    tabContent.innerHTML = `
        <div class="animate-fade-in">
            <!-- Header -->
            <div class="mb-6">
                <h2 class="text-2xl font-bold text-gray-800 mb-2">Marks & Evaluations</h2>
                <p class="text-gray-600">Manage student evaluations and grading</p>
            </div>

            <!-- Marks Summary -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div class="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow-lg p-6">
                    <p class="text-sm opacity-90">Total Tests</p>
                    <p class="text-3xl font-bold mt-2">${data.totalTests}</p>
                </div>
                <div class="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl shadow-lg p-6">
                    <p class="text-sm opacity-90">Average Score</p>
                    <p class="text-3xl font-bold mt-2">${data.averageClassScore}%</p>
                </div>
                <div class="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl shadow-lg p-6">
                    <p class="text-sm opacity-90">Top Performer</p>
                    <p class="text-2xl font-bold mt-2">${data.topPerformer.score}%</p>
                    <p class="text-sm opacity-90">${data.topPerformer.name}</p>
                </div>
                <div class="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white rounded-xl shadow-lg p-6">
                    <p class="text-sm opacity-90">Weakest Area</p>
                    <p class="text-2xl font-bold mt-2">${data.weakestArea}</p>
                </div>
            </div>

            <!-- Recent Evaluations -->
            <div class="bg-white rounded-xl shadow p-6 mb-6">
                <h3 class="text-lg font-bold mb-4">Recent Evaluations</h3>
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead>
                            <tr class="bg-gray-50">
                                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-600">Test</th>
                                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-600">Class</th>
                                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-600">Date</th>
                                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-600">Average</th>
                                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-600">Highest</th>
                                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-600">Lowest</th>
                                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-600">Action</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200">
                            ${data.recentEvaluations.map(evalItem => `
                                <tr class="hover:bg-gray-50">
                                    <td class="px-4 py-3 font-medium">${evalItem.test}</td>
                                    <td class="px-4 py-3">${evalItem.class}</td>
                                    <td class="px-4 py-3">${new Date(evalItem.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                                    <td class="px-4 py-3">
                                        <div class="flex items-center">
                                            <span class="mr-2 font-bold">${evalItem.averageScore}</span>
                                            <div class="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div class="h-full ${evalItem.averageScore >= 80 ? 'bg-green-500' : evalItem.averageScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'} rounded-full" style="width: ${evalItem.averageScore}%"></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td class="px-4 py-3 font-bold text-green-600">${evalItem.highestScore}</td>
                                    <td class="px-4 py-3 font-bold text-red-600">${evalItem.lowestScore}</td>
                                    <td class="px-4 py-3">
                                        <div class="flex space-x-2">
                                            <button onclick="viewEvaluation(${evalItem.class}, '${evalItem.test}')" class="text-blue-600 hover:text-blue-800">
                                                <i class="fas fa-eye"></i>
                                            </button>
                                            <button onclick="editEvaluation(${evalItem.class}, '${evalItem.test}')" class="text-green-600 hover:text-green-800">
                                                <i class="fas fa-edit"></i>
                                            </button>
                                            <button onclick="downloadReport(${evalItem.class}, '${evalItem.test}')" class="text-purple-600 hover:text-purple-800">
                                                <i class="fas fa-download"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Pending Evaluations -->
            <div class="bg-white rounded-xl shadow p-6 mb-6">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-bold">Pending Evaluations</h3>
                    <button onclick="addNewEvaluation()" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                        <i class="fas fa-plus mr-1"></i> New Evaluation
                    </button>
                </div>
                
                <div class="space-y-4">
                    ${data.pendingEvaluations.map(pending => {
                        const daysLeft = Math.ceil((new Date(pending.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
                        return `
                            <div class="flex items-center justify-between p-4 border rounded-xl ${daysLeft <= 2 ? 'bg-red-50' : 'bg-yellow-50'}">
                                <div class="flex items-center space-x-3">
                                    <div class="h-10 w-10 rounded-full ${daysLeft <= 2 ? 'bg-red-100' : 'bg-yellow-100'} flex items-center justify-center">
                                        <i class="fas ${daysLeft <= 2 ? 'fa-exclamation-triangle text-red-600' : 'fa-clock text-yellow-600'}"></i>
                                    </div>
                                    <div>
                                        <h4 class="font-medium">${pending.class} - ${pending.test}</h4>
                                        <p class="text-sm text-gray-600">${pending.subject} • Submissions: ${pending.submissions}</p>
                                        <p class="text-xs text-gray-500">Due: ${new Date(pending.dueDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                                    </div>
                                </div>
                                <div class="flex items-center space-x-2">
                                    <button onclick="gradeEvaluation('${pending.class}', '${pending.test}')" class="px-4 py-2 ${daysLeft <= 2 ? 'bg-red-600 hover:bg-red-700' : 'bg-yellow-600 hover:bg-yellow-700'} text-white rounded-lg text-sm">
                                        <i class="fas fa-check-circle mr-1"></i> Grade Now
                                    </button>
                                    <button onclick="extendDeadline('${pending.class}', '${pending.test}')" class="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 text-sm">
                                        Extend
                                    </button>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>

            <!-- Performance Chart -->
            <div class="bg-white rounded-xl shadow p-6">
                <h3 class="text-lg font-bold mb-4">Class Performance Trend</h3>
                <div class="h-64">
                    <canvas id="marksChart"></canvas>
                </div>
            </div>
        </div>
    `;
    
    // Initialize marks chart
    initMarksChart();
}

// Load Timetable Tab
function loadTimetableTab() {
    const tabContent = document.getElementById('timetableTab');
    const timetable = APP_STATE.teacherData.timetable;
    
    tabContent.innerHTML = `
        <div class="animate-fade-in">
            <!-- Header -->
            <div class="mb-6">
                <h2 class="text-2xl font-bold text-gray-800 mb-2">Teaching Timetable</h2>
                <p class="text-gray-600">Weekly teaching schedule for ${APP_STATE.teacherData.teacher.name}</p>
            </div>

            <!-- Today's Highlight -->
            <div class="teacher-gradient rounded-xl shadow-lg p-6 text-white mb-6">
                <div class="flex flex-col md:flex-row items-center justify-between">
                    <div>
                        <h3 class="text-xl font-bold mb-2">Today's Schedule</h3>
                        <p class="opacity-90" id="todayDate">${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                    <div class="mt-4 md:mt-0">
                        <span class="text-3xl font-bold" id="todayClassCount">0</span>
                        <p class="text-sm opacity-90">Classes Today</p>
                    </div>
                </div>
            </div>

            <!-- Timetable -->
            <div class="bg-white rounded-xl shadow-lg overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead class="bg-gradient-to-r from-blue-50 to-purple-50">
                            <tr>
                                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Time</th>
                                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Monday</th>
                                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Tuesday</th>
                                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Wednesday</th>
                                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Thursday</th>
                                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Friday</th>
                                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Saturday</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200" id="timetableBody">
                            <!-- Timetable will be generated dynamically -->
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Legend -->
            <div class="mt-6 bg-white rounded-xl shadow p-6">
                <h3 class="text-lg font-bold mb-4">Schedule Legend</h3>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div class="flex items-center space-x-2">
                        <div class="h-4 w-4 rounded bg-blue-500"></div>
                        <span class="text-sm">Teaching Class</span>
                    </div>
                    <div class="flex items-center space-x-2">
                        <div class="h-4 w-4 rounded bg-green-500"></div>
                        <span class="text-sm">Free Period</span>
                    </div>
                    <div class="flex items-center space-x-2">
                        <div class="h-4 w-4 rounded bg-yellow-500"></div>
                        <span class="text-sm">Meetings/Activities</span>
                    </div>
                </div>
            </div>

            <!-- Download Timetable -->
            <div class="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl shadow p-6">
                <div class="flex flex-col md:flex-row items-center justify-between">
                    <div>
                        <h3 class="font-bold mb-2">Download Timetable</h3>
                        <p class="text-sm text-gray-600">Export your timetable in various formats</p>
                    </div>
                    <div class="flex space-x-3 mt-4 md:mt-0">
                        <button onclick="downloadTimetable('pdf')" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm">
                            <i class="fas fa-file-pdf mr-1"></i> PDF
                        </button>
                        <button onclick="downloadTimetable('excel')" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
                            <i class="fas fa-file-excel mr-1"></i> Excel
                        </button>
                        <button onclick="printTimetable()" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                            <i class="fas fa-print mr-1"></i> Print
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Generate timetable
    generateTimetable();
}

// Load Students Tab
function loadStudentsTab() {
    const tabContent = document.getElementById('studentsTab');
    const data = APP_STATE.teacherData.students;
    
    tabContent.innerHTML = `
        <div class="animate-fade-in">
            <!-- Header -->
            <div class="mb-6">
                <h2 class="text-2xl font-bold text-gray-800 mb-2">Student Information</h2>
                <p class="text-gray-600">Manage student details and track performance</p>
            </div>

            <!-- Student Statistics -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div class="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow-lg p-6">
                    <p class="text-sm opacity-90">Total Students</p>
                    <p class="text-3xl font-bold mt-2">${data.total}</p>
                </div>
                <div class="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl shadow-lg p-6">
                    <p class="text-sm opacity-90">Boys</p>
                    <p class="text-3xl font-bold mt-2">${data.classWise.reduce((sum, cls) => sum + cls.boys, 0)}</p>
                </div>
                <div class="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl shadow-lg p-6">
                    <p class="text-sm opacity-90">Girls</p>
                    <p class="text-3xl font-bold mt-2">${data.classWise.reduce((sum, cls) => sum + cls.girls, 0)}</p>
                </div>
                <div class="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white rounded-xl shadow-lg p-6">
                    <p class="text-sm opacity-90">Class Teacher Of</p>
                    <p class="text-3xl font-bold mt-2">${APP_STATE.teacherData.teacher.classTeacherOf}</p>
                </div>
            </div>

            <!-- Class-wise Distribution -->
            <div class="bg-white rounded-xl shadow p-6 mb-6">
                <h3 class="text-lg font-bold mb-4">Class-wise Student Distribution</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    ${data.classWise.map(cls => `
                        <div class="border rounded-xl p-4 text-center ${cls.className === APP_STATE.teacherData.teacher.classTeacherOf ? 'border-l-4 border-l-blue-500' : ''}">
                            <h4 class="font-bold text-lg mb-2">${cls.className}</h4>
                            <p class="text-3xl font-bold text-blue-600 mb-2">${cls.total}</p>
                            <div class="space-y-1 text-sm">
                                <div class="flex justify-between">
                                    <span class="text-gray-600">Boys:</span>
                                    <span class="font-medium">${cls.boys}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-600">Girls:</span>
                                    <span class="font-medium">${cls.girls}</span>
                                </div>
                            </div>
                            <button onclick="viewClassStudents('${cls.className}')" class="w-full mt-3 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                                <i class="fas fa-users mr-1"></i> View Students
                            </button>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Top Students -->
            <div class="bg-white rounded-xl shadow p-6 mb-6">
                <h3 class="text-lg font-bold mb-4">Top Performing Students</h3>
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead>
                            <tr class="bg-gray-50">
                                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-600">Rank</th>
                                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-600">Student Name</th>
                                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-600">Class</th>
                                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-600">Score</th>
                                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-600">Attendance</th>
                                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-600">Action</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200">
                            ${data.topStudents.map((student, index) => `
                                <tr class="hover:bg-gray-50">
                                    <td class="px-4 py-3">
                                        <div class="flex items-center justify-center h-8 w-8 rounded-full ${index === 0 ? 'bg-yellow-100 text-yellow-800' : index === 1 ? 'bg-gray-100 text-gray-800' : index === 2 ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'} font-bold">
                                            ${index + 1}
                                        </div>
                                    </td>
                                    <td class="px-4 py-3 font-medium">${student.name}</td>
                                    <td class="px-4 py-3">${student.class}</td>
                                    <td class="px-4 py-3">
                                        <div class="flex items-center">
                                            <span class="font-bold mr-2">${student.score}%</span>
                                            <div class="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div class="h-full ${student.score >= 90 ? 'bg-green-500' : student.score >= 80 ? 'bg-blue-500' : 'bg-yellow-500'} rounded-full" style="width: ${student.score}%"></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td class="px-4 py-3">
                                        <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${student.attendance >= 90 ? 'bg-green-100 text-green-800' : student.attendance >= 75 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}">
                                            ${student.attendance}%
                                        </span>
                                    </td>
                                    <td class="px-4 py-3">
                                        <button onclick="viewStudentDetails('${student.name}')" class="text-blue-600 hover:text-blue-800">
                                            <i class="fas fa-eye"></i> View
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Students Needing Attention -->
            <div class="bg-white rounded-xl shadow p-6">
                <h3 class="text-lg font-bold mb-4">Students Needing Attention</h3>
                <div class="space-y-4">
                    ${data.needAttention.map(student => `
                        <div class="flex items-center justify-between p-4 border rounded-xl bg-red-50">
                            <div class="flex items-center space-x-3">
                                <div class="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                                    <i class="fas fa-exclamation-triangle text-red-600"></i>
                                </div>
                                <div>
                                    <h4 class="font-medium">${student.name}</h4>
                                    <p class="text-sm text-gray-600">${student.class} • Score: ${student.score}% • Attendance: ${student.attendance}%</p>
                                    <p class="text-xs text-red-600 mt-1">
                                        <i class="fas fa-info-circle mr-1"></i> ${student.reason}
                                    </p>
                                </div>
                            </div>
                            <div class="flex space-x-2">
                                <button onclick="scheduleRemedial('${student.name}')" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                                    <i class="fas fa-calendar-plus mr-1"></i> Remedial
                                </button>
                                <button onclick="contactParent('${student.name}')" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
                                    <i class="fas fa-phone mr-1"></i> Contact Parent
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

// Load Profile Tab
function loadProfileTab() {
    const tabContent = document.getElementById('profileTab');
    const teacher = APP_STATE.teacherData.teacher;
    
    tabContent.innerHTML = `
        <div class="animate-fade-in">
            <!-- Header -->
            <div class="mb-6">
                <h2 class="text-2xl font-bold text-gray-800 mb-2">My Profile</h2>
                <p class="text-gray-600">Complete teacher information and details</p>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- Profile Card -->
                <div class="lg:col-span-1">
                    <div class="bg-white rounded-xl shadow p-6 text-center">
                        <div class="h-32 w-32 rounded-full teacher-gradient p-1 mx-auto mb-4">
                            <div class="h-full w-full bg-white rounded-full flex items-center justify-center">
                                <i class="fas fa-user-tie text-5xl gradient-text"></i>
                            </div>
                        </div>
                        <h3 class="text-xl font-bold mb-1">${teacher.name}</h3>
                        <p class="text-gray-600 mb-2">${teacher.teacherId}</p>
                        <div class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 mb-4">
                            <i class="fas fa-check-circle mr-1"></i>
                            Active Teacher
                        </div>
                        
                        <div class="space-y-3 text-sm text-left">
                            <div class="flex justify-between">
                                <span class="text-gray-600">Employee ID:</span>
                                <span class="font-medium">${teacher.employeeId}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">Designation:</span>
                                <span class="font-medium">${teacher.designation}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">Department:</span>
                                <span class="font-medium">${teacher.department}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">Class Teacher:</span>
                                <span class="font-medium">${teacher.classTeacherOf}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Contact Information -->
                    <div class="bg-white rounded-xl shadow p-6 mt-6">
                        <h4 class="font-bold mb-3">Contact Information</h4>
                        <div class="space-y-3">
                            <div class="flex items-center space-x-3">
                                <div class="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                    <i class="fas fa-phone text-blue-600"></i>
                                </div>
                                <div>
                                    <p class="font-medium">Contact Number</p>
                                    <p class="text-sm text-gray-600">${teacher.phone}</p>
                                </div>
                            </div>
                            <div class="flex items-center space-x-3">
                                <div class="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                                    <i class="fas fa-envelope text-green-600"></i>
                                </div>
                                <div>
                                    <p class="font-medium">Email Address</p>
                                    <p class="text-sm text-gray-600">${teacher.email}</p>
                                </div>
                            </div>
                            <div class="flex items-center space-x-3">
                                <div class="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                                    <i class="fas fa-ambulance text-red-600"></i>
                                </div>
                                <div>
                                    <p class="font-medium">Emergency Contact</p>
                                    <p class="text-sm text-gray-600">${teacher.emergencyContact}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Detailed Information -->
                <div class="lg:col-span-2">
                    <div class="space-y-6">
                        <!-- Personal Information -->
                        <div class="bg-white rounded-xl shadow p-6">
                            <h4 class="text-lg font-bold mb-4">Personal Information</h4>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm text-gray-600 mb-1">Date of Birth</label>
                                    <p class="font-medium">${new Date(teacher.dob).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                                </div>
                                <div>
                                    <label class="block text-sm text-gray-600 mb-1">Age</label>
                                    <p class="font-medium">${teacher.age} years</p>
                                </div>
                                <div>
                                    <label class="block text-sm text-gray-600 mb-1">Gender</label>
                                    <p class="font-medium">${teacher.gender}</p>
                                </div>
                                <div>
                                    <label class="block text-sm text-gray-600 mb-1">Blood Group</label>
                                    <p class="font-medium">${teacher.bloodGroup}</p>
                                </div>
                                <div>
                                    <label class="block text-sm text-gray-600 mb-1">Aadhar Number</label>
                                    <p class="font-medium">${teacher.aadharNumber}</p>
                                </div>
                                <div>
                                    <label class="block text-sm text-gray-600 mb-1">PAN Number</label>
                                    <p class="font-medium">${teacher.panNumber}</p>
                                </div>
                                <div class="md:col-span-2">
                                    <label class="block text-sm text-gray-600 mb-1">Address</label>
                                    <p class="font-medium">${teacher.address}</p>
                                </div>
                            </div>
                        </div>

                        <!-- Professional Information -->
                        <div class="bg-white rounded-xl shadow p-6">
                            <h4 class="text-lg font-bold mb-4">Professional Information</h4>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm text-gray-600 mb-1">Qualification</label>
                                    <p class="font-medium">${teacher.qualification}</p>
                                </div>
                                <div>
                                    <label class="block text-sm text-gray-600 mb-1">Experience</label>
                                    <p class="font-medium">${teacher.experience} years</p>
                                </div>
                                <div>
                                    <label class="block text-sm text-gray-600 mb-1">Joining Date</label>
                                    <p class="font-medium">${new Date(teacher.joiningDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                                </div>
                                <div>
                                    <label class="block text-sm text-gray-600 mb-1">Employment Type</label>
                                    <p class="font-medium">${teacher.employmentType}</p>
                                </div>
                                <div class="md:col-span-2">
                                    <label class="block text-sm text-gray-600 mb-1">Subjects</label>
                                    <p class="font-medium">${teacher.subjects.join(', ')}</p>
                                </div>
                                <div class="md:col-span-2">
                                    <label class="block text-sm text-gray-600 mb-1">Classes Assigned</label>
                                    <p class="font-medium">${teacher.classesAssigned.join(', ')}</p>
                                </div>
                            </div>
                        </div>

                        <!-- Salary Information -->
                        <div class="bg-white rounded-xl shadow p-6">
                            <h4 class="text-lg font-bold mb-4">Salary Information</h4>
                            <div class="space-y-3">
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
                                <div class="pt-2 border-t">
                                    <div class="flex justify-between font-bold">
                                        <span>Gross Salary:</span>
                                        <span class="text-green-600">₹${teacher.salary.total.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Bank Details -->
                        <div class="bg-white rounded-xl shadow p-6">
                            <h4 class="text-lg font-bold mb-4">Bank Account Details</h4>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </div>
    `;
}

// Load Analytics Tab
function loadAnalyticsTab() {
    const tabContent = document.getElementById('analyticsTab');
    const teacher = APP_STATE.teacherData.teacher;
    
    tabContent.innerHTML = `
        <div class="animate-fade-in">
            <!-- Header -->
            <div class="mb-6">
                <h2 class="text-2xl font-bold text-gray-800 mb-2">Teacher Analytics</h2>
                <p class="text-gray-600">Performance insights and teaching analytics</p>
            </div>

            <!-- Teaching Statistics -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div class="bg-white rounded-xl shadow p-6">
                    <div class="text-center">
                        <p class="text-sm text-gray-600 mb-1">Total Experience</p>
                        <p class="text-3xl font-bold text-blue-600">${teacher.experience} years</p>
                    </div>
                </div>
                <div class="bg-white rounded-xl shadow p-6">
                    <div class="text-center">
                        <p class="text-sm text-gray-600 mb-1">Classes Assigned</p>
                        <p class="text-3xl font-bold text-green-600">${teacher.classesAssigned.length}</p>
                    </div>
                </div>
                <div class="bg-white rounded-xl shadow p-6">
                    <div class="text-center">
                        <p class="text-sm text-gray-600 mb-1">Students Taught</p>
                        <p class="text-3xl font-bold text-purple-600">${teacher.totalStudents}</p>
                    </div>
                </div>
                <div class="bg-white rounded-xl shadow p-6">
                    <div class="text-center">
                        <p class="text-sm text-gray-600 mb-1">Attendance %</p>
                        <p class="text-3xl font-bold ${APP_STATE.teacherData.attendance.percentage >= 90 ? 'text-green-600' : 'text-yellow-600'}">${APP_STATE.teacherData.attendance.percentage}%</p>
                    </div>
                </div>
            </div>

            <!-- Performance Analytics -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <!-- Class Performance -->
                <div class="bg-white rounded-xl shadow p-6">
                    <h3 class="text-lg font-bold mb-4">Class Performance Distribution</h3>
                    <div class="h-64">
                        <canvas id="classPerformanceChart"></canvas>
                    </div>
                </div>

                <!-- Attendance Trend -->
                <div class="bg-white rounded-xl shadow p-6">
                    <h3 class="text-lg font-bold mb-4">Monthly Attendance Trend</h3>
                    <div class="h-64">
                        <canvas id="monthlyAttendanceChart"></canvas>
                    </div>
                </div>
            </div>

            <!-- Student Performance -->
            <div class="bg-white rounded-xl shadow p-6 mb-6">
                <h3 class="text-lg font-bold mb-4">Student Performance Overview</h3>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div class="text-center p-4 border rounded-xl">
                        <p class="text-sm text-gray-600 mb-1">Top Performers (A+)</p>
                        <p class="text-2xl font-bold text-green-600">24</p>
                        <p class="text-xs text-gray-500">13.3% of total</p>
                    </div>
                    <div class="text-center p-4 border rounded-xl">
                        <p class="text-sm text-gray-600 mb-1">Average Performers (B+)</p>
                        <p class="text-2xl font-bold text-blue-600">98</p>
                        <p class="text-xs text-gray-500">54.4% of total</p>
                    </div>
                    <div class="text-center p-4 border rounded-xl">
                        <p class="text-sm text-gray-600 mb-1">Need Improvement (< 60%)</p>
                        <p class="text-2xl font-bold text-red-600">12</p>
                        <p class="text-xs text-gray-500">6.7% of total</p>
                    </div>
                </div>
            </div>

            <!-- Teaching Insights -->
            <div class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl shadow p-6">
                <h3 class="text-lg font-bold mb-4">Teaching Insights & Recommendations</h3>
                <div class="space-y-3">
                    <div class="flex items-start space-x-3">
                        <i class="fas fa-lightbulb text-yellow-500 text-xl mt-1"></i>
                        <div>
                            <p class="font-medium">Strongest Subject: Mathematics</p>
                            <p class="text-sm text-gray-600">Your Mathematics classes have an average score of 82%</p>
                        </div>
                    </div>
                    <div class="flex items-start space-x-3">
                        <i class="fas fa-calendar-check text-green-500 text-xl mt-1"></i>
                        <div>
                            <p class="font-medium">Excellent Attendance Record</p>
                            <p class="text-sm text-gray-600">94.4% attendance rate, well above school average</p>
                        </div>
                    </div>
                    <div class="flex items-start space-x-3">
                        <i class="fas fa-users text-blue-500 text-xl mt-1"></i>
                        <div>
                            <p class="font-medium">Class 10A Needs Attention</p>
                            <p class="text-sm text-gray-600">Consider additional focus on Algebra concepts</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Initialize analytics charts
    initAnalyticsCharts();
}

// Initialize Charts
function initAttendanceChart() {
    const ctx = document.getElementById('attendanceChart');
    if (!ctx) return;
    
    const data = APP_STATE.teacherData.attendance.monthlyData;
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(d => d.month),
            datasets: [
                {
                    label: 'Classes Conducted',
                    data: data.map(d => d.conducted),
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    fill: true,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                }
            }
        }
    });
}

function initMarksChart() {
    const ctx = document.getElementById('marksChart');
    if (!ctx) return;
    
    const evaluations = APP_STATE.teacherData.marks.recentEvaluations;
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: evaluations.map(e => `${e.class} - ${e.test}`),
            datasets: [
                {
                    label: 'Average Score',
                    data: evaluations.map(e => e.averageScore),
                    backgroundColor: '#10b981'
                },
                {
                    label: 'Highest Score',
                    data: evaluations.map(e => e.highestScore),
                    backgroundColor: '#3b82f6'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });
}

function initAnalyticsCharts() {
    // Class Performance Chart
    const classCtx = document.getElementById('classPerformanceChart');
    if (classCtx) {
        const classes = APP_STATE.teacherData.classes.list;
        
        new Chart(classCtx, {
            type: 'doughnut',
            data: {
                labels: classes.map(c => c.className),
                datasets: [{
                    data: classes.map(c => c.averageScore),
                    backgroundColor: [
                        '#3b82f6',
                        '#10b981',
                        '#8b5cf6',
                        '#f59e0b',
                        '#ef4444'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right'
                    }
                }
            }
        });
    }
    
    // Monthly Attendance Chart
    const monthlyCtx = document.getElementById('monthlyAttendanceChart');
    if (monthlyCtx) {
        const data = APP_STATE.teacherData.attendance.monthlyData;
        
        new Chart(monthlyCtx, {
            type: 'bar',
            data: {
                labels: data.map(d => d.month),
                datasets: [
                    {
                        label: 'Conducted',
                        data: data.map(d => d.conducted),
                        backgroundColor: '#10b981'
                    },
                    {
                        label: 'Cancelled',
                        data: data.map(d => d.cancelled),
                        backgroundColor: '#ef4444'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                }
            }
        });
    }
}

// Generate Timetable
function generateTimetable() {
    const tbody = document.getElementById('timetableBody');
    if (!tbody) return;
    
    const timetable = APP_STATE.teacherData.timetable;
    
    // Get all unique time slots
    const allTimeSlots = new Set();
    Object.values(timetable).forEach(daySchedule => {
        daySchedule.forEach(item => {
            if (item.time) allTimeSlots.add(item.time);
        });
    });
    
    const timeSlots = Array.from(allTimeSlots).sort((a, b) => {
        const timeA = parseInt(a.split(':')[0]);
        const timeB = parseInt(b.split(':')[0]);
        return timeA - timeB;
    });
    
    tbody.innerHTML = timeSlots.map(timeSlot => `
        <tr class="hover:bg-gray-50 dark:hover:bg-gray-700">
            <td class="px-4 py-3 font-medium border-r dark:border-gray-700">${timeSlot}</td>
            ${['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => {
                const scheduleItem = timetable[day]?.find(item => item.time === timeSlot);
                if (!scheduleItem) return '<td class="px-4 py-3 text-center text-gray-400">-</td>';
                
                if (scheduleItem.free) {
                    return `
                        <td class="px-4 py-3">
                            <div class="font-medium text-green-600">${scheduleItem.activity}</div>
                            <div class="text-sm text-gray-600 dark:text-gray-400">Free Period</div>
                        </td>
                    `;
                }
                
                return `
                    <td class="px-4 py-3">
                        <div class="font-medium">${scheduleItem.class} - ${scheduleItem.subject}</div>
                        <div class="text-sm text-gray-600 dark:text-gray-400">${scheduleItem.room}</div>
                    </td>
                `;
            }).join('')}
        </tr>
    `).join('');
    
    // Update today's class count
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const todayClasses = timetable[today]?.filter(item => !item.free) || [];
    const todayClassCount = document.getElementById('todayClassCount');
    if (todayClassCount) todayClassCount.textContent = todayClasses.length;
}

// Setup Event Listeners
function setupEventListeners() {
    // Mobile menu
    const mobileMenuButton = document.getElementById('mobileMenuButton');
    if (mobileMenuButton) mobileMenuButton.addEventListener('click', openMobileMenu);
    
    const mobileOverlay = document.getElementById('mobileOverlay');
    if (mobileOverlay) mobileOverlay.addEventListener('click', closeMobileMenu);
    

    
    // User menu
    document.addEventListener('click', (e) => {
        if (!e.target.closest('#userMenu') && !e.target.closest('.relative > button')) {
            const userMenu = document.getElementById('userMenu');
            if (userMenu) userMenu.classList.add('hidden');
        }
    });
    
    // Close notification panel when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('#notificationPanel') && !e.target.closest('.relative > button')) {
            const notificationPanel = document.getElementById('notificationPanel');
            if (notificationPanel) notificationPanel.classList.add('hidden');
        }
    });
    
    // Update time every minute
    setInterval(updateDateTime, 60000);
}

// UpdateDateTime
function updateDateTime() {
    const now = new Date();
    const dateElements = document.querySelectorAll('#currentDate');
    const timeElements = document.querySelectorAll('#currentTime');
    
    dateElements.forEach(el => {
        if (el) el.textContent = now.toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric', 
            year: 'numeric' 
        });
    });
    
    timeElements.forEach(el => {
        if (el) el.textContent = now.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
        });
    });
}

// Update Greeting
function updateGreeting() {
    const hour = new Date().getHours();
    let greeting = '';
    
    if (hour < 12) greeting = 'Good Morning';
    else if (hour < 17) greeting = 'Good Afternoon';
    else greeting = 'Good Evening';
    
    const welcomeMessage = document.getElementById('welcomeMessage');
    if (welcomeMessage) {
        const firstName = APP_STATE.teacherData.teacher.name.split(' ')[0];
        welcomeMessage.textContent = `${greeting}, ${firstName}!`;
    }
}

// Open Mobile Menu
function openMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    const overlay = document.getElementById('mobileOverlay');
    
    if (mobileMenu) mobileMenu.classList.add('active');
    if (overlay) overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close Mobile Menu
function closeMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    const overlay = document.getElementById('mobileOverlay');
    
    if (mobileMenu) mobileMenu.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';
}




// Toggle User Menu
function toggleUserMenu() {
    const menu = document.getElementById('userMenu');
    if (menu) menu.classList.toggle('hidden');
}

// Toggle Notifications
function toggleNotifications() {
    const panel = document.getElementById('notificationPanel');
    if (panel) {
        panel.classList.toggle('hidden');
        updateNotifications();
    }
}

// Update Notifications
function updateNotifications() {
    const list = document.getElementById('notificationsList');
    if (!list) return;
    
    const notifications = APP_STATE.notifications;
    const unreadCount = notifications.filter(n => !n.read).length;
    
    // Update badge
    const badge = document.getElementById('notificationBadge');
    if (badge) {
        badge.textContent = unreadCount;
        badge.classList.toggle('hidden', unreadCount === 0);
    }
    
    // Update list
    list.innerHTML = notifications.map(notif => `
        <div class="p-3 border-b ${notif.read ? '' : 'bg-blue-50'} hover:bg-gray-50 cursor-pointer" onclick="viewNotification(${notif.id})">
            <div class="flex items-start space-x-3">
                <div class="h-10 w-10 rounded-full ${notif.type === 'exam' ? 'bg-purple-100' : notif.type === 'meeting' ? 'bg-red-100' : 'bg-blue-100'} flex items-center justify-center">
                    <i class="fas ${notif.icon} ${notif.type === 'exam' ? 'text-purple-600' : notif.type === 'meeting' ? 'text-red-600' : 'text-blue-600'}"></i>
                </div>
                <div class="flex-1">
                    <div class="flex justify-between">
                        <h4 class="font-medium ${notif.read ? 'text-gray-700' : 'text-gray-900'}">${notif.title}</h4>
                        ${!notif.read ? '<span class="h-2 w-2 bg-red-500 rounded-full"></span>' : ''}
                    </div>
                    <p class="text-sm text-gray-600">${notif.message}</p>
                    <p class="text-xs text-gray-500 mt-1">${formatTimeAgo(new Date(notif.timestamp))}</p>
                </div>
            </div>
        </div>
    `).join('');
}

// View Notification
function viewNotification(id) {
    const notification = APP_STATE.notifications.find(n => n.id === id);
    if (notification && !notification.read) {
        notification.read = true;
        updateNotifications();
        Toast.show(`Notification marked as read: ${notification.title}`, 'success');
    }
}

// Mark All as Read
function markAllAsRead() {
    APP_STATE.notifications.forEach(n => n.read = true);
    updateNotifications();
    Toast.show('All notifications marked as read', 'success');
}

// Format Time Ago
function formatTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + ' years ago';
    
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + ' months ago';
    
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + ' days ago';
    
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + ' hours ago';
    
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + ' minutes ago';
    
    return Math.floor(seconds) + ' seconds ago';
}

// Action Functions
function viewClassDetails(classId) {
    Toast.show(`Viewing details for class ${classId}`, 'info');
}

function markAttendance(className) {
    Toast.show(`Marking attendance for ${className}`, 'info');
}

function quickMarkAttendance() {
    const selectedClass = document.getElementById('attendanceClass')?.value;
    const date = document.getElementById('attendanceDate')?.value;
    
    if (!selectedClass) {
        Toast.show('Please select a class', 'error');
        return;
    }
    
    Toast.show(`Attendance marked for ${selectedClass} on ${date}`, 'success');
}

function viewEvaluation(className, test) {
    Toast.show(`Viewing evaluation: ${test} for ${className}`, 'info');
}

function editEvaluation(className, test) {
    Toast.show(`Editing evaluation: ${test} for ${className}`, 'info');
}

function downloadReport(className, test) {
    Toast.show(`Downloading report: ${test} for ${className}`, 'info');
}

function addNewTest() {
    Toast.show('Adding new test schedule', 'info');
}

function prepareQuestionPaper(className, subject, topic) {
    Toast.show(`Preparing question paper for ${className} - ${subject}: ${topic}`, 'info');
}

function addNewEvaluation() {
    Toast.show('Adding new evaluation', 'info');
}

function gradeEvaluation(className, test) {
    Toast.show(`Grading evaluation: ${test} for ${className}`, 'info');
}

function extendDeadline(className, test) {
    Toast.show(`Extending deadline for ${test} in ${className}`, 'info');
}

function viewClassStudents(className) {
    Toast.show(`Viewing students of ${className}`, 'info');
}

function viewStudentDetails(studentName) {
    Toast.show(`Viewing details for ${studentName}`, 'info');
}

function scheduleRemedial(studentName) {
    Toast.show(`Scheduling remedial for ${studentName}`, 'info');
}

function contactParent(studentName) {
    Toast.show(`Contacting parent of ${studentName}`, 'info');
}

function downloadTimetable(format) {
    Toast.show(`Downloading timetable in ${format.toUpperCase()} format`, 'info');
}

function printTimetable() {
    Toast.show('Printing timetable', 'info');
    window.print();
}

function printReport() {
    Toast.show('Printing report', 'info');
    window.print();
}

function downloadData() {
    const data = JSON.stringify(APP_STATE.teacherData, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `teacher-data-${APP_STATE.teacherData.teacher.teacherId}.json`;
    a.click();
    Toast.show('Data exported successfully', 'success');
}

// Logout
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        Toast.show('Logging out...', 'info');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1000);
    }
}

// Start Auto Refresh
function startAutoRefresh() {
    // Refresh data every 5 minutes
    setInterval(() => {
        if (document.visibilityState === 'visible') {
            Toast.show('Data refreshed', 'success');
        }
    }, 300000);
}



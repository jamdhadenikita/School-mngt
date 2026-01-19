// Class Management System

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    checkSession();
    setupEventListeners();
    setupResponsiveSidebar();
    initializeClassModule();
});

// Global variables
let sidebarCollapsed = false;
let isMobile = window.innerWidth < 1024;
let classesData = [];
let filteredClasses = [];
let currentPage = 1;
const itemsPerPage = 8;
let currentWeek = 1;
let currentWeekDate = new Date();
let editingClassId = null;

// Mock data for classes
const mockClasses = [
    {
        id: 1,
        className: "PG",
        classCode: "PG-2024-A",
        academicYear: "2024-2025",
        section: "A",
        maxStudents: 25,
        currentStudents: 18,
        roomNumber: "Room 101",
        classTeacher: { id: 1, name: "Ms. Priya Sharma" },
        assistantTeacher: { id: 6, name: "Ms. Sangeeta Roy" },
        startTime: "08:30",
        endTime: "12:30",
        workingDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
        description: "Pre-Kindergarten class for young learners",
        status: "active",
        createdAt: "2024-01-15"
    },
    {
        id: 2,
        className: "LKG",
        classCode: "LKG-2024-A",
        academicYear: "2024-2025",
        section: "A",
        maxStudents: 30,
        currentStudents: 28,
        roomNumber: "Room 102",
        classTeacher: { id: 2, name: "Mr. Rajesh Kumar" },
        assistantTeacher: null,
        startTime: "08:30",
        endTime: "13:00",
        workingDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
        description: "Lower Kindergarten class",
        status: "active",
        createdAt: "2024-01-10"
    },
    {
        id: 3,
        className: "UKG",
        classCode: "UKG-2024-A",
        academicYear: "2024-2025",
        section: "A",
        maxStudents: 30,
        currentStudents: 25,
        roomNumber: "Room 103",
        classTeacher: { id: 3, name: "Ms. Anjali Singh" },
        assistantTeacher: { id: 7, name: "Mr. Amit Verma" },
        startTime: "08:30",
        endTime: "13:30",
        workingDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
        description: "Upper Kindergarten class",
        status: "active",
        createdAt: "2024-01-05"
    },
    {
        id: 4,
        className: "1st",
        classCode: "1ST-2024-A",
        academicYear: "2024-2025",
        section: "A",
        maxStudents: 35,
        currentStudents: 32,
        roomNumber: "Room 201",
        classTeacher: { id: 4, name: "Mr. Vikram Patel" },
        assistantTeacher: null,
        startTime: "09:00",
        endTime: "14:00",
        workingDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
        description: "First Standard class",
        status: "active",
        createdAt: "2024-01-20"
    },
    {
        id: 5,
        className: "2nd",
        classCode: "2ND-2024-A",
        academicYear: "2024-2025",
        section: "A",
        maxStudents: 35,
        currentStudents: 30,
        roomNumber: "Room 202",
        classTeacher: { id: 5, name: "Ms. Neha Gupta" },
        assistantTeacher: { id: 8, name: "Ms. Deepika Nair" },
        startTime: "09:00",
        endTime: "14:00",
        workingDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
        description: "Second Standard class",
        status: "active",
        createdAt: "2024-01-18"
    }
];

// Mock teachers data
const mockTeachers = [
    { id: 1, name: "Ms. Priya Sharma", subject: "Primary Education", grade: "PG/LKG" },
    { id: 2, name: "Mr. Rajesh Kumar", subject: "Primary Education", grade: "LKG/UKG" },
    { id: 3, name: "Ms. Anjali Singh", subject: "Primary Education", grade: "UKG/1st" },
    { id: 4, name: "Mr. Vikram Patel", subject: "Mathematics", grade: "1st/2nd" },
    { id: 5, name: "Ms. Neha Gupta", subject: "English", grade: "1st/2nd" },
    { id: 6, name: "Ms. Sangeeta Roy", subject: "Assistant Teacher", grade: "PG/LKG" },
    { id: 7, name: "Mr. Amit Verma", subject: "Assistant Teacher", grade: "UKG/1st" },
    { id: 8, name: "Ms. Deepika Nair", subject: "Assistant Teacher", grade: "1st/2nd" }
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
    
    // Search input
    document.getElementById('searchInput').addEventListener('input', function(e) {
        setTimeout(() => {
            applyFilters();
        }, 300);
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

// Initialize Class Module
function initializeClassModule() {
    // Set current date
    const today = new Date();
    document.getElementById('currentDate').textContent = today.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    // Initialize data
    classesData = [...mockClasses];
    filteredClasses = [...classesData];
    
    // Load initial data
    loadClassData();
    
    // Generate schedule
    generateSchedule();
}

function loadClassData() {
    showLoading();
    
    // Update class statistics
    updateClassStatistics();
    
    // Apply filters
    applyFilters();
    
    hideLoading();
}

function updateClassStatistics() {
    // Calculate statistics for each class type
    const pgClasses = classesData.filter(c => c.className === "PG");
    const lkgClasses = classesData.filter(c => c.className === "LKG");
    const ukgClasses = classesData.filter(c => c.className === "UKG");
    const firstClasses = classesData.filter(c => c.className === "1st");
    const secondClasses = classesData.filter(c => c.className === "2nd");
    
    // Update PG stats
    document.getElementById('pgClasses').textContent = pgClasses.length;
    document.getElementById('pgStudents').textContent = pgClasses.reduce((sum, c) => sum + c.currentStudents, 0);
    
    // Update LKG stats
    document.getElementById('lkgClasses').textContent = lkgClasses.length;
    document.getElementById('lkgStudents').textContent = lkgClasses.reduce((sum, c) => sum + c.currentStudents, 0);
    
    // Update UKG stats
    document.getElementById('ukgClasses').textContent = ukgClasses.length;
    document.getElementById('ukgStudents').textContent = ukgClasses.reduce((sum, c) => sum + c.currentStudents, 0);
    
    // Update 1st stats
    document.getElementById('firstClasses').textContent = firstClasses.length;
    document.getElementById('firstStudents').textContent = firstClasses.reduce((sum, c) => sum + c.currentStudents, 0);
    
    // Update 2nd stats
    document.getElementById('secondClasses').textContent = secondClasses.length;
    document.getElementById('secondStudents').textContent = secondClasses.reduce((sum, c) => sum + c.currentStudents, 0);
}

function applyFilters() {
    currentPage = 1;
    
    // Get filter values
    const classFilter = document.getElementById('classFilter').value;
    const sectionFilter = document.getElementById('sectionFilter').value;
    const yearFilter = document.getElementById('yearFilter').value;
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    // Apply filters
    filteredClasses = classesData.filter(classItem => {
        // Class filter
        if (classFilter !== 'all' && classItem.className !== classFilter) {
            return false;
        }
        
        // Section filter
        if (sectionFilter !== 'all' && classItem.section !== sectionFilter) {
            return false;
        }
        
        // Year filter
        if (yearFilter !== 'all' && classItem.academicYear !== yearFilter) {
            return false;
        }
        
        // Search filter
        if (searchTerm) {
            const searchFields = [
                classItem.className,
                classItem.classCode,
                classItem.roomNumber,
                classItem.classTeacher?.name,
                classItem.assistantTeacher?.name,
                classItem.description
            ].filter(field => field).map(field => field.toLowerCase());
            
            if (!searchFields.some(field => field.includes(searchTerm))) {
                return false;
            }
        }
        
        return true;
    });
    
    // Update total classes count
    document.getElementById('totalClasses').textContent = filteredClasses.length;
    
    // Render table
    renderClassesTable();
    
    // Update schedule
    generateSchedule();
}

function renderClassesTable() {
    const tableBody = document.getElementById('classesTableBody');
    const tableInfo = document.getElementById('tableInfo');
    
    if (filteredClasses.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="px-6 py-12 text-center text-gray-500">
                    <i class="fas fa-chalkboard-teacher text-4xl mb-4"></i>
                    <p class="text-lg font-medium">No classes found</p>
                    <p class="text-sm mt-2">Try adjusting your filters or create a new class</p>
                </td>
            </tr>
        `;
        tableInfo.textContent = `Showing 0 classes`;
        return;
    }
    
    // Calculate pagination
    const totalPages = Math.ceil(filteredClasses.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, filteredClasses.length);
    const pageData = filteredClasses.slice(startIndex, endIndex);
    
    // Clear table
    tableBody.innerHTML = '';
    
    // Add rows
    pageData.forEach(classItem => {
        const row = document.createElement('tr');
        
        // Calculate capacity percentage
        const capacityPercentage = Math.round((classItem.currentStudents / classItem.maxStudents) * 100);
        
        // Determine capacity color
        let capacityColor = 'text-green-600';
        let capacityBg = 'bg-green-100';
        if (capacityPercentage >= 90) {
            capacityColor = 'text-red-600';
            capacityBg = 'bg-red-100';
        } else if (capacityPercentage >= 75) {
            capacityColor = 'text-yellow-600';
            capacityBg = 'bg-yellow-100';
        }
        
        row.innerHTML = `
            <td class="px-6 py-4">
                <div class="flex items-center">
                    <div class="h-12 w-12 ${getClassColor(classItem.className)} rounded-lg flex items-center justify-center mr-4">
                        <i class="${getClassIcon(classItem.className)} text-white text-lg"></i>
                    </div>
                    <div>
                        <div class="font-medium text-gray-900">${classItem.className} - Section ${classItem.section}</div>
                        <div class="text-sm text-gray-500">${classItem.classCode}</div>
                        <div class="text-xs text-gray-400 mt-1">${classItem.academicYear} • ${classItem.roomNumber || 'No room assigned'}</div>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4">
                <div>
                    <div class="flex justify-between items-center mb-1">
                        <span class="text-sm font-medium text-gray-700">Capacity</span>
                        <span class="text-sm font-bold ${capacityColor}">${capacityPercentage}%</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2">
                        <div class="${capacityBg} h-2 rounded-full" style="width: ${capacityPercentage}%"></div>
                    </div>
                    <div class="text-xs text-gray-500 mt-1">
                        ${classItem.currentStudents} / ${classItem.maxStudents} students
                    </div>
                </div>
            </td>
            <td class="px-6 py-4">
                <div class="space-y-2">
                    <div class="flex items-center">
                        <div class="teacher-avatar mr-2">
                            ${getTeacherInitials(classItem.classTeacher?.name)}
                        </div>
                        <div>
                            <div class="text-sm font-medium text-gray-900">${classItem.classTeacher?.name || 'Not assigned'}</div>
                            <div class="text-xs text-gray-500">Class Teacher</div>
                        </div>
                    </div>
                    ${classItem.assistantTeacher ? `
                        <div class="flex items-center">
                            <div class="teacher-avatar mr-2">
                                ${getTeacherInitials(classItem.assistantTeacher.name)}
                            </div>
                            <div>
                                <div class="text-sm font-medium text-gray-900">${classItem.assistantTeacher.name}</div>
                                <div class="text-xs text-gray-500">Assistant Teacher</div>
                            </div>
                        </div>
                    ` : ''}
                </div>
            </td>
            <td class="px-6 py-4">
                <div class="text-sm text-gray-900">
                    <div class="font-medium">${formatTime(classItem.startTime)} - ${formatTime(classItem.endTime)}</div>
                    <div class="text-xs text-gray-500 mt-1">
                        ${classItem.workingDays.length} days/week
                    </div>
                </div>
            </td>
            <td class="px-6 py-4">
                <span class="${getStatusClass(classItem.status)} status-badge">
                    <i class="fas ${getStatusIcon(classItem.status)} mr-1"></i>
                    ${classItem.status.charAt(0).toUpperCase() + classItem.status.slice(1)}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button onclick="viewClassDetails(${classItem.id})" class="text-blue-600 hover:text-blue-900 mr-3">
                    <i class="fas fa-eye"></i>
                </button>
                <button onclick="editClass(${classItem.id})" class="text-green-600 hover:text-green-900 mr-3">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteClass(${classItem.id})" class="text-red-600 hover:text-red-900">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
    
    // Update pagination controls
    document.getElementById('prevBtn').disabled = currentPage === 1;
    document.getElementById('nextBtn').disabled = currentPage === totalPages;
    
    // Update table info
    tableInfo.textContent = `Showing ${startIndex + 1}-${endIndex} of ${filteredClasses.length} classes`;
}

function getClassColor(className) {
    switch(className) {
        case 'PG': return 'bg-purple-600';
        case 'LKG': return 'bg-green-600';
        case 'UKG': return 'bg-blue-600';
        case '1st': return 'bg-yellow-600';
        case '2nd': return 'bg-red-600';
        default: return 'bg-gray-600';
    }
}

function getClassIcon(className) {
    switch(className) {
        case 'PG': return 'fas fa-baby';
        case 'LKG': return 'fas fa-child';
        case 'UKG': return 'fas fa-graduation-cap';
        case '1st': return 'fas fa-book-open';
        case '2nd': return 'fas fa-book';
        default: return 'fas fa-chalkboard';
    }
}

function getTeacherInitials(name) {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
}

function getStatusClass(status) {
    switch(status) {
        case 'active': return 'status-active';
        case 'inactive': return 'status-inactive';
        case 'pending': return 'status-pending';
        default: return 'status-active';
    }
}

function getStatusIcon(status) {
    switch(status) {
        case 'active': return 'fa-check-circle';
        case 'inactive': return 'fa-times-circle';
        case 'pending': return 'fa-clock';
        default: return 'fa-question-circle';
    }
}

function formatTime(time) {
    if (!time) return '--:--';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
}

function previousPage() {
    if (currentPage > 1) {
        currentPage--;
        renderClassesTable();
    }
}

function nextPage() {
    const totalPages = Math.ceil(filteredClasses.length / itemsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        renderClassesTable();
    }
}

// Modal Functions
function openCreateClassModal() {
    editingClassId = null;
    document.getElementById('modalTitle').textContent = 'Create New Class';
    document.getElementById('submitButtonText').textContent = 'Create Class';
    
    // Reset form
    const form = document.getElementById('classForm');
    form.reset();
    
    // Set default values
    document.getElementById('academicYear').value = '2024-2025';
    document.getElementById('maxStudents').value = '30';
    document.getElementById('currentStudents').value = '0';
    document.getElementById('startTime').value = '08:30';
    document.getElementById('endTime').value = '13:30';
    
    // Show modal
    document.getElementById('createClassModal').classList.add('active');
}

function closeCreateClassModal() {
    document.getElementById('createClassModal').classList.remove('active');
    editingClassId = null;
}

function openEditClassModal(classId) {
    editingClassId = classId;
    document.getElementById('modalTitle').textContent = 'Edit Class';
    document.getElementById('submitButtonText').textContent = 'Update Class';
    
    // Find class
    const classItem = classesData.find(c => c.id === classId);
    if (!classItem) {
        showToast('Class not found', 'error');
        return;
    }
    
    // Populate form
    document.getElementById('className').value = classItem.className;
    document.getElementById('classCode').value = classItem.classCode;
    document.getElementById('academicYear').value = classItem.academicYear;
    document.getElementById('section').value = classItem.section;
    document.getElementById('maxStudents').value = classItem.maxStudents;
    document.getElementById('currentStudents').value = classItem.currentStudents;
    document.getElementById('roomNumber').value = classItem.roomNumber || '';
    document.getElementById('classTeacher').value = classItem.classTeacher?.id || '';
    document.getElementById('assistantTeacher').value = classItem.assistantTeacher?.id || '';
    document.getElementById('startTime').value = classItem.startTime;
    document.getElementById('endTime').value = classItem.endTime;
    document.getElementById('description').value = classItem.description || '';
    
    // Set working days checkboxes
    const checkboxes = document.querySelectorAll('input[name="workingDays"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = classItem.workingDays.includes(checkbox.value);
    });
    
    // Show modal
    document.getElementById('createClassModal').classList.add('active');
}

function handleClassFormSubmit(event) {
    event.preventDefault();
    
    showLoading();
    
    // Get form data
    const formData = {
        className: document.getElementById('className').value.trim(),
        classCode: document.getElementById('classCode').value.trim(),
        academicYear: document.getElementById('academicYear').value,
        section: document.getElementById('section').value,
        maxStudents: parseInt(document.getElementById('maxStudents').value),
        currentStudents: parseInt(document.getElementById('currentStudents').value),
        roomNumber: document.getElementById('roomNumber').value.trim(),
        classTeacherId: document.getElementById('classTeacher').value,
        assistantTeacherId: document.getElementById('assistantTeacher').value,
        startTime: document.getElementById('startTime').value,
        endTime: document.getElementById('endTime').value,
        description: document.getElementById('description').value.trim(),
        workingDays: Array.from(document.querySelectorAll('input[name="workingDays"]:checked'))
                         .map(cb => cb.value)
    };
    
    // Validation
    if (formData.currentStudents > formData.maxStudents) {
        showToast('Current students cannot exceed maximum capacity', 'error');
        hideLoading();
        return;
    }
    
    if (formData.workingDays.length === 0) {
        showToast('Please select at least one working day', 'error');
        hideLoading();
        return;
    }
    
    // Get teacher details
    const classTeacher = mockTeachers.find(t => t.id === parseInt(formData.classTeacherId));
    const assistantTeacher = formData.assistantTeacherId ? 
        mockTeachers.find(t => t.id === parseInt(formData.assistantTeacherId)) : null;
    
    // Create or update class
    if (editingClassId) {
        // Update existing class
        const index = classesData.findIndex(c => c.id === editingClassId);
        if (index !== -1) {
            classesData[index] = {
                ...classesData[index],
                ...formData,
                classTeacher: classTeacher ? { id: classTeacher.id, name: classTeacher.name } : null,
                assistantTeacher: assistantTeacher ? { id: assistantTeacher.id, name: assistantTeacher.name } : null,
                status: 'active'
            };
            
            showToast('Class updated successfully', 'success');
        }
    } else {
        // Create new class
        const newClass = {
            id: classesData.length > 0 ? Math.max(...classesData.map(c => c.id)) + 1 : 1,
            ...formData,
            classTeacher: classTeacher ? { id: classTeacher.id, name: classTeacher.name } : null,
            assistantTeacher: assistantTeacher ? { id: assistantTeacher.id, name: assistantTeacher.name } : null,
            status: 'active',
            createdAt: new Date().toISOString().split('T')[0]
        };
        
        classesData.push(newClass);
        showToast('Class created successfully', 'success');
    }
    
    // Close modal
    closeCreateClassModal();
    
    // Reload data
    setTimeout(() => {
        loadClassData();
    }, 500);
}

function viewClassDetails(classId) {
    const classItem = classesData.find(c => c.id === classId);
    if (!classItem) return;
    
    // Update modal title
    document.getElementById('viewClassTitle').textContent = `${classItem.className} - Section ${classItem.section}`;
    document.getElementById('viewClassCode').textContent = classItem.classCode;
    
    // Calculate capacity
    const capacityPercentage = Math.round((classItem.currentStudents / classItem.maxStudents) * 100);
    
    // Create content
    const content = document.getElementById('classDetailsContent');
    content.innerHTML = `
        <div class="space-y-6">
            <!-- Class Overview -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="bg-gray-50 p-6 rounded-lg">
                    <h4 class="font-semibold text-gray-800 mb-4">Class Information</h4>
                    <div class="space-y-3">
                        <div class="flex justify-between">
                            <span class="text-gray-600">Academic Year:</span>
                            <span class="font-medium">${classItem.academicYear}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">Room Number:</span>
                            <span class="font-medium">${classItem.roomNumber || 'Not assigned'}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">Class Code:</span>
                            <span class="font-medium">${classItem.classCode}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">Created On:</span>
                            <span class="font-medium">${formatDate(classItem.createdAt)}</span>
                        </div>
                    </div>
                </div>
                
                <div class="bg-gray-50 p-6 rounded-lg">
                    <h4 class="font-semibold text-gray-800 mb-4">Class Capacity</h4>
                    <div class="space-y-3">
                        <div class="flex justify-between">
                            <span class="text-gray-600">Maximum Students:</span>
                            <span class="font-medium">${classItem.maxStudents}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">Current Students:</span>
                            <span class="font-medium">${classItem.currentStudents}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">Available Seats:</span>
                            <span class="font-medium ${classItem.maxStudents - classItem.currentStudents === 0 ? 'text-red-600' : 'text-green-600'}">
                                ${classItem.maxStudents - classItem.currentStudents}
                            </span>
                        </div>
                        <div class="pt-2">
                            <div class="w-full bg-gray-200 rounded-full h-2">
                                <div class="bg-blue-600 h-2 rounded-full" style="width: ${capacityPercentage}%"></div>
                            </div>
                            <div class="text-xs text-gray-500 mt-1 text-center">
                                ${capacityPercentage}% filled
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Teaching Staff -->
            <div>
                <h4 class="font-semibold text-gray-800 mb-4">Teaching Staff</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="bg-white border border-gray-200 rounded-lg p-4">
                        <div class="flex items-center mb-3">
                            <div class="teacher-avatar mr-3">
                                ${getTeacherInitials(classItem.classTeacher?.name)}
                            </div>
                            <div>
                                <div class="font-medium text-gray-900">${classItem.classTeacher?.name || 'Not assigned'}</div>
                                <div class="text-sm text-gray-500">Class Teacher</div>
                            </div>
                        </div>
                        <div class="text-sm text-gray-600">
                            <i class="fas fa-envelope mr-2"></i> teacher@school.com
                        </div>
                        <div class="text-sm text-gray-600 mt-1">
                            <i class="fas fa-phone mr-2"></i> +91 9876543210
                        </div>
                    </div>
                    
                    ${classItem.assistantTeacher ? `
                        <div class="bg-white border border-gray-200 rounded-lg p-4">
                            <div class="flex items-center mb-3">
                                <div class="teacher-avatar mr-3">
                                    ${getTeacherInitials(classItem.assistantTeacher.name)}
                                </div>
                                <div>
                                    <div class="font-medium text-gray-900">${classItem.assistantTeacher.name}</div>
                                    <div class="text-sm text-gray-500">Assistant Teacher</div>
                                </div>
                            </div>
                            <div class="text-sm text-gray-600">
                                <i class="fas fa-envelope mr-2"></i> assistant@school.com
                            </div>
                            <div class="text-sm text-gray-600 mt-1">
                                <i class="fas fa-phone mr-2"></i> +91 9876543211
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
            
            <!-- Class Schedule -->
            <div>
                <h4 class="font-semibold text-gray-800 mb-4">Class Schedule</h4>
                <div class="bg-gray-50 p-6 rounded-lg">
                    <div class="flex items-center justify-between mb-4">
                        <div>
                            <div class="font-medium text-gray-900">${formatTime(classItem.startTime)} - ${formatTime(classItem.endTime)}</div>
                            <div class="text-sm text-gray-600">Daily Schedule</div>
                        </div>
                        <span class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                            ${classItem.workingDays.length} days/week
                        </span>
                    </div>
                    
                    <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        ${['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].map(day => `
                            <div class="schedule-day p-3 text-center ${classItem.workingDays.includes(day) ? 'border-2 border-blue-500' : 'opacity-50'}">
                                <div class="font-medium text-gray-900">${day.charAt(0).toUpperCase() + day.slice(1).substring(0, 3)}</div>
                                <div class="text-xs ${classItem.workingDays.includes(day) ? 'text-green-600' : 'text-gray-400'} mt-1">
                                    ${classItem.workingDays.includes(day) ? 'Class Day' : 'No Class'}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
            
            <!-- Description -->
            ${classItem.description ? `
                <div>
                    <h4 class="font-semibold text-gray-800 mb-4">Description</h4>
                    <div class="bg-gray-50 p-6 rounded-lg">
                        <p class="text-gray-700">${classItem.description}</p>
                    </div>
                </div>
            ` : ''}
        </div>
        
        <!-- Actions -->
        <div class="pt-6 border-t border-gray-200 flex justify-end space-x-4">
            <button onclick="editClass(${classItem.id})" 
                    class="px-5 py-2.5 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-all font-medium">
                <i class="fas fa-edit mr-2"></i> Edit Class
            </button>
            <button onclick="closeViewClassModal()" 
                    class="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium">
                Close
            </button>
        </div>
    `;
    
    // Show modal
    document.getElementById('viewClassModal').classList.add('active');
}

function closeViewClassModal() {
    document.getElementById('viewClassModal').classList.remove('active');
}

function editClass(classId) {
    closeViewClassModal();
    setTimeout(() => {
        openEditClassModal(classId);
    }, 300);
}

function deleteClass(classId) {
    if (!confirm('Are you sure you want to delete this class? This action cannot be undone.')) {
        return;
    }
    
    showLoading();
    
    // Find class
    const classItem = classesData.find(c => c.id === classId);
    if (!classItem) {
        showToast('Class not found', 'error');
        hideLoading();
        return;
    }
    
    // Check if class has students
    if (classItem.currentStudents > 0) {
        showToast('Cannot delete class with enrolled students', 'error');
        hideLoading();
        return;
    }
    
    // Remove class
    classesData = classesData.filter(c => c.id !== classId);
    
    showToast('Class deleted successfully', 'success');
    
    // Reload data
    setTimeout(() => {
        loadClassData();
    }, 500);
}

// Schedule Functions
function generateSchedule() {
    const scheduleGrid = document.getElementById('scheduleGrid');
    const weekDisplay = document.getElementById('currentWeek');
    
    // Update week display
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const weekStart = new Date(currentWeekDate);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    weekDisplay.textContent = `Week ${currentWeek}, ${monthNames[weekStart.getMonth()]} ${weekStart.getDate()} - ${monthNames[weekEnd.getMonth()]} ${weekEnd.getDate()}`;
    
    // Create schedule grid
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    
    let scheduleHTML = `
        <div class="grid grid-cols-1 md:grid-cols-5 gap-4 schedule-grid">
    `;
    
    days.forEach(day => {
        const dayClasses = filteredClasses.filter(classItem => 
            classItem.workingDays.map(d => d.toLowerCase()).includes(day.toLowerCase())
        );
        
        scheduleHTML += `
            <div class="schedule-day p-4">
                <div class="font-semibold text-gray-800 mb-3">${day}</div>
                <div class="space-y-3">
                    ${dayClasses.length > 0 ? dayClasses.map(classItem => `
                        <div class="time-slot p-3 rounded-lg">
                            <div class="flex justify-between items-start mb-2">
                                <div>
                                    <div class="font-medium">${classItem.className} - Sec ${classItem.section}</div>
                                    <div class="text-sm opacity-90">${formatTime(classItem.startTime)} - ${formatTime(classItem.endTime)}</div>
                                </div>
                                <div class="h-8 w-8 ${getClassColor(classItem.className)} rounded-full flex items-center justify-center">
                                    <i class="${getClassIcon(classItem.className)} text-white text-sm"></i>
                                </div>
                            </div>
                            <div class="text-sm">
                                <i class="fas fa-chalkboard-teacher mr-1"></i> ${classItem.classTeacher?.name || 'No teacher'}
                            </div>
                            <div class="text-xs mt-1">${classItem.roomNumber || 'No room'}</div>
                        </div>
                    `).join('') : `
                        <div class="text-center py-8 text-gray-400">
                            <i class="fas fa-calendar-times text-2xl mb-2"></i>
                            <p>No classes scheduled</p>
                        </div>
                    `}
                </div>
            </div>
        `;
    });
    
    scheduleHTML += '</div>';
    scheduleGrid.innerHTML = scheduleHTML;
}

function previousWeek() {
    currentWeek--;
    if (currentWeek < 1) currentWeek = 52;
    currentWeekDate.setDate(currentWeekDate.getDate() - 7);
    generateSchedule();
}

function nextWeek() {
    currentWeek++;
    if (currentWeek > 52) currentWeek = 1;
    currentWeekDate.setDate(currentWeekDate.getDate() + 7);
    generateSchedule();
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
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}
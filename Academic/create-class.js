
// Class Management System

// Initialize application
document.addEventListener('DOMContentLoaded', function () {
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
let selectedSubjects = [];
let teachersData = []; // Will store teachers fetched from API
let bulkAssignData = {
    teachers: [], // Array of teacher IDs
    teacherAssignments: {} // { teacherId: { subjects: [], otherSubjects: [] } }
};

// Track selected teachers and their assigned subjects
let selectedClassTeacher = null;
let selectedAssistantTeacher = null;
let assignedSubjects = []; // Track which subjects are already assigned to teachers

// Track all subjects assigned to any teacher (for filtering in Others modal)
let allAssignedSubjects = new Set();

// Mock data for subjects (temporary until API integration)
const mockSubjects = [
    { id: 1, name: "English", color: "#3B82F6", grade: "PG-2nd" },
    { id: 2, name: "Mathematics", color: "#EF4444", grade: "PG-2nd" },
    { id: 3, name: "Hindi", color: "#10B981", grade: "PG-2nd" },
    { id: 4, name: "EVS (Environmental Science)", color: "#F59E0B", grade: "LKG-2nd" },
    { id: 5, name: "General Knowledge", color: "#8B5CF6", grade: "PG-2nd" },
    { id: 6, name: "Art & Craft", color: "#EC4899", grade: "PG-2nd" },
    { id: 7, name: "Rhymes & Music", color: "#06B6D4", grade: "PG-UKG" },
    { id: 8, name: "Physical Education", color: "#84CC16", grade: "PG-2nd" },
    { id: 9, name: "Computer Basics", color: "#6366F1", grade: "1st-2nd" },
    { id: 10, name: "Moral Science", color: "#F97316", grade: "PG-2nd" }
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
    document.addEventListener('click', function (event) {
        const notificationsDropdown = document.getElementById('notificationsDropdown');
        const userMenuDropdown = document.getElementById('userMenuDropdown');

        if (notificationsBtn && !event.target.closest('#notificationsBtn') && notificationsDropdown) {
            notificationsDropdown.classList.add('hidden');
        }
        if (userMenuBtn && !event.target.closest('#userMenuBtn') && userMenuDropdown) {
            userMenuDropdown.classList.add('hidden');
        }

        // Close bulk assign dropdowns when clicking outside
        if (!event.target.closest('.bulk-assign-dropdown')) {
            closeAllBulkAssignDropdowns();
        }
    });

    // Search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function (e) {
            setTimeout(() => {
                applyFilters();
            }, 300);
        });
    }

    // Teacher selection event listeners for subject field
    const classTeacherSelect = document.getElementById('classTeacher');
    const assistantTeacherSelect = document.getElementById('assistantTeacher');
    const classTeacherSubjectSelect = document.getElementById('classTeacherSubject');
    const assistantTeacherSubjectSelect = document.getElementById('assistantTeacherSubject');

    if (classTeacherSelect) {
        classTeacherSelect.addEventListener('change', handleClassTeacherChange);
    }
    if (assistantTeacherSelect) {
        assistantTeacherSelect.addEventListener('change', handleAssistantTeacherChange);
    }
    if (classTeacherSubjectSelect) {
        classTeacherSubjectSelect.addEventListener('change', handleClassTeacherSubjectChange);
    }
    if (assistantTeacherSubjectSelect) {
        assistantTeacherSubjectSelect.addEventListener('change', handleAssistantTeacherSubjectChange);
    }
}

// API Functions - FIXED: Removed fetch calls that were causing errors
async function fetchTeachers() {
    try {
        showLoading();

        // Use mock data directly (no API call)
        console.log('Loading teachers from mock data');
        teachersData = generateMockTeachers();
        
        // Update teacher dropdowns in modal
        populateTeacherDropdowns();

        // Initialize teachers dropdown for bulk assign
        initializeTeachersDropdown();

        showToast('Teachers loaded successfully', 'success');
    } catch (error) {
        console.error('Error loading teachers:', error);
        // Use mock data as fallback
        teachersData = generateMockTeachers();
        populateTeacherDropdowns();
        initializeTeachersDropdown();
        showToast('Using offline data', 'info');
    } finally {
        hideLoading();
    }
}

function populateTeacherDropdowns() {
    const classTeacherSelect = document.getElementById('classTeacher');
    const assistantTeacherSelect = document.getElementById('assistantTeacher');
    const subjectTeacherSelect = document.getElementById('subjectTeacher');

    if (!classTeacherSelect || !assistantTeacherSelect) return;

    // Clear existing options except first one
    classTeacherSelect.innerHTML = '<option value="">Select Teacher</option>';
    assistantTeacherSelect.innerHTML = '<option value="">Select Assistant Teacher</option>';
    
    if (subjectTeacherSelect) {
        subjectTeacherSelect.innerHTML = '<option value="">Select Teacher (Optional)</option>';
    }

    // Add teachers to dropdowns
    teachersData.forEach(teacher => {
        const option1 = document.createElement('option');
        option1.value = teacher.id;
        option1.textContent = teacher.name;
        classTeacherSelect.appendChild(option1);

        const option2 = document.createElement('option');
        option2.value = teacher.id;
        option2.textContent = teacher.name;
        assistantTeacherSelect.appendChild(option2);
        
        if (subjectTeacherSelect) {
            const option3 = document.createElement('option');
            option3.value = teacher.id;
            option3.textContent = teacher.name;
            subjectTeacherSelect.appendChild(option3);
        }
    });
}

function generateMockTeachers() {
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
            additionalSubjects: ['Physics', 'Computer Basics'],
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
            additionalSubjects: ['Hindi', 'Moral Science'],
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
        },
        {
            id: 3,
            teacherId: 'TCH1003',
            name: 'Mr. Amit Kumar',
            dob: '1988-03-10',
            gender: 'Male',
            bloodGroup: 'O+',
            address: '789 MG Road, Pune - 411001',
            photo: null,
            contactNumber: '9876543214',
            email: 'amit.kumar@school.com',
            emergencyContactName: 'Mrs. Kumar',
            emergencyContactNumber: '9876543215',
            aadharNumber: '345678901234',
            panNumber: 'CDEFG3456H',
            medicalInfo: 'None',
            joiningDate: '2019-04-15',
            designation: 'Science Teacher',
            totalExperience: 12,
            department: 'Science',
            employmentType: 'Full Time',
            employeeId: 'EMP003',
            previousExperience: [
                { school: 'LMN School', position: 'Science Teacher', duration: 8 }
            ],
            qualifications: [
                { degree: 'Master', specialization: 'Physics', university: 'University of Pune', completionYear: 2012 },
                { degree: 'B.Ed.', specialization: 'Science Education', university: 'University of Mumbai', completionYear: 2013 }
            ],
            primarySubject: 'Physics',
            additionalSubjects: ['Chemistry', 'Mathematics'],
            classes: ['9', '10', '11'],
            salary: {
                basic: 38000,
                hra: 7600,
                da: 5500,
                ta: 3500,
                additional: 2500,
                total: 57100
            },
            bankDetails: {
                bankName: 'ICICI Bank',
                accountNumber: '34567890123456',
                ifscCode: 'ICIC0001234',
                branchName: 'Pune Branch'
            },
            status: 'Active',
            createdAt: '2019-04-15T09:15:00Z'
        },
        {
            id: 4,
            teacherId: 'TCH1004',
            name: 'Ms. Anjali Singh',
            dob: '1992-11-25',
            gender: 'Female',
            bloodGroup: 'AB+',
            address: '101 Shivaji Nagar, Pune - 411005',
            photo: null,
            contactNumber: '9876543216',
            email: 'anjali.singh@school.com',
            emergencyContactName: 'Mr. Singh',
            emergencyContactNumber: '9876543217',
            aadharNumber: '456789012345',
            panNumber: 'DEFGH4567I',
            medicalInfo: 'Vegetarian',
            joiningDate: '2022-01-10',
            designation: 'Hindi Teacher',
            totalExperience: 6,
            department: 'Languages',
            employmentType: 'Full Time',
            employeeId: 'EMP004',
            previousExperience: [
                { school: 'STU School', position: 'Hindi Teacher', duration: 4 }
            ],
            qualifications: [
                { degree: 'Master', specialization: 'Hindi', university: 'University of Pune', completionYear: 2018 },
                { degree: 'B.Ed.', specialization: 'Language Education', university: 'University of Mumbai', completionYear: 2019 }
            ],
            primarySubject: 'Hindi',
            additionalSubjects: ['Sanskrit', 'English'],
            classes: ['6', '7', '8', '9'],
            salary: {
                basic: 28000,
                hra: 5600,
                da: 3500,
                ta: 2000,
                additional: 1500,
                total: 40600
            },
            bankDetails: {
                bankName: 'Axis Bank',
                accountNumber: '45678901234567',
                ifscCode: 'UTIB0001234',
                branchName: 'Shivaji Nagar Branch'
            },
            status: 'Active',
            createdAt: '2022-01-10T11:45:00Z'
        },
        {
            id: 5,
            teacherId: 'TCH1005',
            name: 'Mr. Vikram Patel',
            dob: '1983-07-18',
            gender: 'Male',
            bloodGroup: 'B-',
            address: '202 Wakad, Pune - 411057',
            photo: null,
            contactNumber: '9876543218',
            email: 'vikram.patel@school.com',
            emergencyContactName: 'Mrs. Patel',
            emergencyContactNumber: '9876543219',
            aadharNumber: '567890123456',
            panNumber: 'EFGHI5678J',
            medicalInfo: 'Hypertension (controlled)',
            joiningDate: '2018-08-20',
            designation: 'Social Studies Teacher',
            totalExperience: 18,
            department: 'Social Studies',
            employmentType: 'Full Time',
            employeeId: 'EMP005',
            previousExperience: [
                { school: 'VWX School', position: 'History Teacher', duration: 12 },
                { school: 'YZA School', position: 'Social Studies Head', duration: 4 }
            ],
            qualifications: [
                { degree: 'Master', specialization: 'History', university: 'University of Pune', completionYear: 2008 },
                { degree: 'M.Ed.', specialization: 'Social Studies Education', university: 'University of Mumbai', completionYear: 2010 }
            ],
            primarySubject: 'History',
            additionalSubjects: ['Geography', 'Civics', 'General Knowledge'],
            classes: ['8', '9', '10'],
            salary: {
                basic: 42000,
                hra: 8400,
                da: 6000,
                ta: 4000,
                additional: 3000,
                total: 63400
            },
            bankDetails: {
                bankName: 'Bank of Baroda',
                accountNumber: '56789012345678',
                ifscCode: 'BARB0WAKADX',
                branchName: 'Wakad Branch'
            },
            status: 'Active',
            createdAt: '2018-08-20T13:30:00Z'
        }
    ];
}

// Save class function - FIXED: No API call, only localStorage
function saveClass(classData) {
    try {
        // Save to localStorage only
        return saveClassToLocalStorage(classData);
    } catch (error) {
        console.error('Error saving class:', error);
        throw error;
    }
}

function saveClassToLocalStorage(classData) {
    try {
        const classes = JSON.parse(localStorage.getItem('classes') || '[]');
        
        // Generate unique ID
        classData.id = classes.length > 0 ? Math.max(...classes.map(c => c.id)) + 1 : 1;
        
        // Add timestamp
        classData.createdAt = new Date().toISOString();
        classData.updatedAt = new Date().toISOString();
        
        // Add status if not present
        if (!classData.status) {
            classData.status = 'active';
        }
        
        // Add to array
        classes.push(classData);
        
        // Save to localStorage
        localStorage.setItem('classes', JSON.stringify(classes));
        
        showToast('Class saved successfully', 'success');
        return classData;
    } catch (error) {
        console.error('Error saving to localStorage:', error);
        throw error;
    }
}

// Teacher Change Handlers
function handleClassTeacherChange() {
    const teacherId = document.getElementById('classTeacher')?.value;
    const classTeacherSubjectSelect = document.getElementById('classTeacherSubject');
    
    if (!teacherId || !classTeacherSubjectSelect) return;
    
    // Update global selected teacher
    selectedClassTeacher = teacherId ? teachersData.find(t => t.id === parseInt(teacherId)) : null;
    
    // Show teacher subject assignments section
    const teacherSubjectAssignments = document.getElementById('teacherSubjectAssignments');
    if (teacherSubjectAssignments) {
        teacherSubjectAssignments.classList.remove('hidden');
    }
    
    // Show class teacher subject item
    const classTeacherSubjectItem = document.getElementById('classTeacherSubjectItem');
    if (classTeacherSubjectItem) {
        classTeacherSubjectItem.classList.remove('hidden');
    }
    
    // Hide "no teachers" message
    const noTeachersMessage = document.getElementById('noTeachersMessage');
    if (noTeachersMessage) {
        noTeachersMessage.classList.add('hidden');
    }
    
    if (teacherId && selectedClassTeacher) {
        // Update teacher name label
        const classTeacherNameLabel = document.getElementById('classTeacherNameLabel');
        if (classTeacherNameLabel) {
            classTeacherNameLabel.textContent = `Class Teacher: ${selectedClassTeacher.name}`;
        }
        
        // Update teacher info
        const classTeacherInfo = document.getElementById('classTeacherInfo');
        if (classTeacherInfo) {
            classTeacherInfo.textContent = `(${selectedClassTeacher.teacherId} - ${selectedClassTeacher.primarySubject})`;
        }
        
        // Enable dropdown
        classTeacherSubjectSelect.disabled = false;
        
        // Populate subjects for this teacher
        updateSubjectDropdowns();
        
        // Update assistant teacher dropdown to exclude this teacher
        updateAssistantTeacherDropdown();
        
        // Update bulk assign teachers dropdown
        updateBulkAssignTeachersDropdown();
        
        // Update all assigned subjects
        updateAllAssignedSubjects();
    } else {
        // Hide class teacher section if no teacher selected
        if (classTeacherSubjectItem) {
            classTeacherSubjectItem.classList.add('hidden');
        }
        
        // Disable dropdown
        classTeacherSubjectSelect.disabled = true;
        classTeacherSubjectSelect.innerHTML = '<option value="">Select Subject</option>';
        
        // Clear selection
        classTeacherSubjectSelect.value = '';
        
        // Update assistant teacher dropdown
        updateAssistantTeacherDropdown();
        
        // Update bulk assign teachers dropdown
        updateBulkAssignTeachersDropdown();
        
        // Update all assigned subjects
        updateAllAssignedSubjects();
    }
    
    // Check if we should hide the whole section
    checkTeacherSubjectAssignmentsVisibility();
}

function handleAssistantTeacherChange() {
    const teacherId = document.getElementById('assistantTeacher')?.value;
    const assistantTeacherSubjectSelect = document.getElementById('assistantTeacherSubject');
    
    if (!teacherId || !assistantTeacherSubjectSelect) return;
    
    // Update global selected teacher
    selectedAssistantTeacher = teacherId ? teachersData.find(t => t.id === parseInt(teacherId)) : null;
    
    // Show teacher subject assignments section
    const teacherSubjectAssignments = document.getElementById('teacherSubjectAssignments');
    if (teacherSubjectAssignments) {
        teacherSubjectAssignments.classList.remove('hidden');
    }
    
    // Show assistant teacher subject item
    const assistantTeacherSubjectItem = document.getElementById('assistantTeacherSubjectItem');
    if (assistantTeacherSubjectItem) {
        assistantTeacherSubjectItem.classList.remove('hidden');
    }
    
    // Hide "no teachers" message
    const noTeachersMessage = document.getElementById('noTeachersMessage');
    if (noTeachersMessage) {
        noTeachersMessage.classList.add('hidden');
    }
    
    if (teacherId && selectedAssistantTeacher) {
        // Update teacher name label
        const assistantTeacherNameLabel = document.getElementById('assistantTeacherNameLabel');
        if (assistantTeacherNameLabel) {
            assistantTeacherNameLabel.textContent = `Assistant Teacher: ${selectedAssistantTeacher.name}`;
        }
        
        // Update teacher info
        const assistantTeacherInfo = document.getElementById('assistantTeacherInfo');
        if (assistantTeacherInfo) {
            assistantTeacherInfo.textContent = `(${selectedAssistantTeacher.teacherId} - ${selectedAssistantTeacher.primarySubject})`;
        }
        
        // Enable dropdown
        assistantTeacherSubjectSelect.disabled = false;
        
        // Populate subjects for this teacher
        updateSubjectDropdowns();
        
        // Update bulk assign teachers dropdown
        updateBulkAssignTeachersDropdown();
        
        // Update all assigned subjects
        updateAllAssignedSubjects();
    } else {
        // Hide assistant teacher section if no teacher selected
        if (assistantTeacherSubjectItem) {
            assistantTeacherSubjectItem.classList.add('hidden');
        }
        
        // Disable dropdown
        assistantTeacherSubjectSelect.disabled = true;
        assistantTeacherSubjectSelect.innerHTML = '<option value="">Select Subject</option>';
        
        // Clear selection
        assistantTeacherSubjectSelect.value = '';
        
        // Update bulk assign teachers dropdown
        updateBulkAssignTeachersDropdown();
        
        // Update all assigned subjects
        updateAllAssignedSubjects();
    }
    
    // Check if we should hide the whole section
    checkTeacherSubjectAssignmentsVisibility();
}

function checkTeacherSubjectAssignmentsVisibility() {
    const classTeacherId = document.getElementById('classTeacher')?.value;
    const assistantTeacherId = document.getElementById('assistantTeacher')?.value;
    const teacherSubjectAssignments = document.getElementById('teacherSubjectAssignments');
    const noTeachersMessage = document.getElementById('noTeachersMessage');
    
    if (!classTeacherId && !assistantTeacherId) {
        // No teachers selected, hide the whole section
        if (teacherSubjectAssignments) {
            teacherSubjectAssignments.classList.add('hidden');
        }
        if (noTeachersMessage) {
            noTeachersMessage.classList.remove('hidden');
        }
    }
}

function updateAssistantTeacherDropdown() {
    const classTeacherId = document.getElementById('classTeacher')?.value;
    const assistantTeacherSelect = document.getElementById('assistantTeacher');
    
    if (!assistantTeacherSelect) return;
    
    // Get current assistant teacher value
    const currentAssistantTeacherId = assistantTeacherSelect.value;
    
    // Clear and rebuild options
    assistantTeacherSelect.innerHTML = '<option value="">Select Assistant Teacher</option>';
    
    teachersData.forEach(teacher => {
        // Skip if this teacher is selected as class teacher
        if (classTeacherId && teacher.id.toString() === classTeacherId) {
            return;
        }
        
        const option = document.createElement('option');
        option.value = teacher.id;
        option.textContent = teacher.name;
        
        // Keep current selection if it's still valid
        if (currentAssistantTeacherId && teacher.id.toString() === currentAssistantTeacherId) {
            option.selected = true;
        }
        
        assistantTeacherSelect.appendChild(option);
    });
    
    // If current selection is no longer valid (teacher was removed), clear it
    if (currentAssistantTeacherId && !assistantTeacherSelect.querySelector(`option[value="${currentAssistantTeacherId}"]`)) {
        assistantTeacherSelect.value = '';
        // Trigger change event to update subject dropdown
        assistantTeacherSelect.dispatchEvent(new Event('change'));
    }
}

function updateBulkAssignTeachersDropdown() {
    // This function will be called to refresh the bulk assign teachers list
    // when class teacher or assistant teacher changes
    initializeTeachersDropdown();
}

function updateAllAssignedSubjects() {
    // Clear the set
    allAssignedSubjects.clear();
    
    // Add subjects from class teacher
    const classTeacherSubject = document.getElementById('classTeacherSubject')?.value;
    if (classTeacherSubject) {
        allAssignedSubjects.add(classTeacherSubject);
    }
    
    // Add subjects from assistant teacher
    const assistantTeacherSubject = document.getElementById('assistantTeacherSubject')?.value;
    if (assistantTeacherSubject) {
        allAssignedSubjects.add(assistantTeacherSubject);
    }
    
    // Add subjects from bulk assign teachers
    Object.values(bulkAssignData.teacherAssignments).forEach(assignment => {
        if (assignment.subjects) {
            assignment.subjects.forEach(subject => {
                allAssignedSubjects.add(subject);
            });
        }
        if (assignment.otherSubjects) {
            assignment.otherSubjects.forEach(subject => {
                allAssignedSubjects.add(subject);
            });
        }
    });
}

function updateSubjectDropdowns() {
    // Get currently assigned subjects
    const classTeacherSubject = document.getElementById('classTeacherSubject')?.value;
    const assistantTeacherSubject = document.getElementById('assistantTeacherSubject')?.value;
    
    // Update assigned subjects array
    assignedSubjects = [];
    if (classTeacherSubject) assignedSubjects.push(classTeacherSubject);
    if (assistantTeacherSubject) assignedSubjects.push(assistantTeacherSubject);
    
    // Get selected class to filter subjects by grade
    const selectedClass = document.getElementById('className')?.value || '';
    
    // Update class teacher subject dropdown
    if (selectedClassTeacher) {
        updateTeacherSubjectDropdown('classTeacherSubject', selectedClassTeacher, assignedSubjects, selectedClass, classTeacherSubject);
    }
    
    // Update assistant teacher subject dropdown
    if (selectedAssistantTeacher) {
        updateTeacherSubjectDropdown('assistantTeacherSubject', selectedAssistantTeacher, assignedSubjects, selectedClass, assistantTeacherSubject);
    }
    
    // Update all assigned subjects
    updateAllAssignedSubjects();
}

// Also update the updateTeacherSubjectDropdown function to ensure it uses all subjects:
function updateTeacherSubjectDropdown(dropdownId, teacher, assignedSubjects, selectedClass, currentValue) {
    const dropdown = document.getElementById(dropdownId);
    if (!dropdown) return;
    
    // Clear dropdown
    dropdown.innerHTML = '<option value="">Select Subject</option>';
    
    // Get all subjects (both mock and custom)
    const allAvailableSubjects = mockSubjects.filter(subject => {
        // Check if subject is suitable for the selected class
        const gradeRange = subject.grade.split('-');
        const startGrade = gradeRange[0];
        const endGrade = gradeRange[1];
        
        // Map class names to grade levels for comparison
        const gradeLevels = {
            'PG': 0, 'LKG': 1, 'UKG': 2, '1st': 3, '2nd': 4
        };
        
        const classLevel = gradeLevels[selectedClass] || 0;
        const startLevel = gradeLevels[startGrade] || 0;
        const endLevel = gradeLevels[endGrade] || 4;
        
        return classLevel >= startLevel && classLevel <= endLevel;
    });
    
    // Filter out subjects already assigned to other teachers
    const filteredSubjects = allAvailableSubjects.filter(subject => {
        // If this subject is the current value for this teacher, keep it
        if (subject.name === currentValue) return true;
        
        // Otherwise, exclude if it's already assigned to another teacher
        return !assignedSubjects.includes(subject.name) || subject.name === currentValue;
    });
    
    // Sort subjects: original mock subjects first, then custom subjects
    filteredSubjects.sort((a, b) => {
        const aIsCustom = a.isCustom || false;
        const bIsCustom = b.isCustom || false;
        if (aIsCustom && !bIsCustom) return 1;
        if (!aIsCustom && bIsCustom) return -1;
        return a.name.localeCompare(b.name);
    });
    
    // Add options
    filteredSubjects.forEach(subject => {
        const option = document.createElement('option');
        option.value = subject.name;
        
        // Create display with color and custom indicator
        const color = subject.color || '#3B82F6';
        const isCustom = subject.isCustom || false;
        
        option.innerHTML = `
            <span class="subject-color-indicator" style="background-color: ${color}; width: 12px; height: 12px; display: inline-block; border-radius: 50%; margin-right: 8px;"></span>
            ${subject.name} ${isCustom ? '<span class="text-xs text-gray-500 ml-1">(Custom)</span>' : ''}
        `;
        
        // Set as selected if it's the current value
        if (subject.name === currentValue) {
            option.selected = true;
        }
        
        dropdown.appendChild(option);
    });
    
    // If no subjects available, show message
    if (filteredSubjects.length === 0) {
        const option = document.createElement('option');
        option.value = '';
        option.textContent = 'No subjects available (all assigned)';
        option.disabled = true;
        dropdown.appendChild(option);
    }
}

function debugSubjectDropdown() {
    console.log('=== SUBJECT DROPDOWN DEBUG ===');
    
    const classTeacherSubject = document.getElementById('classTeacherSubject');
    const className = document.getElementById('className')?.value || '';
    console.log('Selected Class:', className);
    console.log('Class Teacher Subject Element:', classTeacherSubject);
    
    // Get all subjects
    console.log('All available subjects:');
    mockSubjects.forEach((subject, index) => {
        console.log(`${index + 1}. ${subject.name} (Grade: ${subject.grade}, Custom: ${subject.isCustom || false})`);
    });
    
    // Get teacher's assigned subjects
    console.log('Assigned Subjects:', assignedSubjects);
    console.log('All Assigned Subjects:', Array.from(allAssignedSubjects));
}

// Add to saveSubject function after showing toast
setTimeout(() => {
    debugSubjectDropdown();
}, 1000);

function handleClassTeacherSubjectChange() {
    // Update assigned subjects and refresh dropdowns
    updateSubjectDropdowns();
    
    // Show success message
    const value = document.getElementById('classTeacherSubject')?.value;
    if (value) {
        showToast(`Assigned ${value} to class teacher`, 'success');
    }
}

function handleAssistantTeacherSubjectChange() {
    // Update assigned subjects and refresh dropdowns
    updateSubjectDropdowns();
    
    // Show success message
    const value = document.getElementById('assistantTeacherSubject')?.value;
    if (value) {
        showToast(`Assigned ${value} to assistant teacher`, 'success');
    }
}

function clearClassTeacherSubject() {
    const classTeacherSubjectSelect = document.getElementById('classTeacherSubject');
    if (classTeacherSubjectSelect) {
        classTeacherSubjectSelect.value = '';
        updateSubjectDropdowns();
        showToast('Class teacher subject cleared', 'info');
    }
}

function clearAssistantTeacherSubject() {
    const assistantTeacherSubjectSelect = document.getElementById('assistantTeacherSubject');
    if (assistantTeacherSubjectSelect) {
        assistantTeacherSubjectSelect.value = '';
        updateSubjectDropdowns();
        showToast('Assistant teacher subject cleared', 'info');
    }
}

// Bulk Assign Functions
function toggleBulkAssignDropdown(type) {
    closeAllBulkAssignDropdowns();

    const dropdown = document.getElementById(`${type}Dropdown`);
    const button = document.querySelector(`button[onclick="toggleBulkAssignDropdown('${type}')"]`);

    if (!dropdown || !button) return;

    dropdown.classList.add('show');
    button.classList.add('active');

    // Initialize dropdown content if not already done
    if (type === 'teachers' && document.getElementById('teachersList').children.length === 0) {
        initializeTeachersDropdown();
    }

    updateSelectedCount(type);

    // Focus on search input when opening teachers dropdown
    if (type === 'teachers') {
        setTimeout(() => {
            const searchInput = document.getElementById('teachersSearch');
            if (searchInput) searchInput.focus();
        }, 100);
    }
}

function closeBulkAssignDropdown(type) {
    const dropdown = document.getElementById(`${type}Dropdown`);
    const button = document.querySelector(`button[onclick="toggleBulkAssignDropdown('${type}')"]`);

    if (!dropdown || !button) return;

    dropdown.classList.remove('show');
    button.classList.remove('active');

    // Clear search input when closing
    if (type === 'teachers') {
        const searchInput = document.getElementById('teachersSearch');
        if (searchInput) {
            searchInput.value = '';
            filterTeachers('');
        }
    }
}

function closeAllBulkAssignDropdowns() {
    const dropdown = document.getElementById('teachersDropdown');
    const button = document.querySelector(`button[onclick="toggleBulkAssignDropdown('teachers')"]`);

    if (dropdown) dropdown.classList.remove('show');
    if (button) button.classList.remove('active');

    // Clear search input
    const searchInput = document.getElementById('teachersSearch');
    if (searchInput) {
        searchInput.value = '';
        filterTeachers('');
    }
}

function filterTeachers(searchTerm) {
    const teachersList = document.getElementById('teachersList');
    if (!teachersList) return;

    const items = teachersList.querySelectorAll('.bulk-assign-item');

    searchTerm = searchTerm.toLowerCase().trim();

    items.forEach(item => {
        const teacherNameElement = item.querySelector('.font-medium');
        const teacherIdElement = item.querySelector('.text-xs.text-gray-500');
        
        if (!teacherNameElement || !teacherIdElement) return;
        
        const teacherName = teacherNameElement.textContent.toLowerCase();
        const teacherId = teacherIdElement.textContent.toLowerCase();
        const shouldShow = !searchTerm ||
            teacherName.includes(searchTerm) ||
            teacherId.includes(searchTerm);

        item.style.display = shouldShow ? 'flex' : 'none';
    });
}

function initializeTeachersDropdown() {
    const teachersList = document.getElementById('teachersList');
    if (!teachersList) return;

    teachersList.innerHTML = '';

    // Get selected class and assistant teachers
    const classTeacherId = document.getElementById('classTeacher')?.value;
    const assistantTeacherId = document.getElementById('assistantTeacher')?.value;

    teachersData.forEach(teacher => {
        // Skip if this teacher is already selected as class teacher or assistant teacher
        if ((classTeacherId && teacher.id.toString() === classTeacherId) ||
            (assistantTeacherId && teacher.id.toString() === assistantTeacherId)) {
            return;
        }

        const isSelected = bulkAssignData.teachers.includes(teacher.id);

        // Get teacher's subjects for display
        const teacherSubjects = [
            teacher.primarySubject,
            ...(teacher.additionalSubjects || [])
        ].filter(subject => subject && subject.trim() !== '');

        const item = document.createElement('div');
        item.className = 'bulk-assign-item';
        item.innerHTML = `
            <input type="checkbox" id="teacher-${teacher.id}" 
                   ${isSelected ? 'checked' : ''}
                   onchange="updateBulkAssignSelection('teachers', ${teacher.id})"
                   class="bulk-assign-checkbox h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded">
            <label for="teacher-${teacher.id}" class="flex-1 cursor-pointer">
                <div class="font-medium text-gray-900">${teacher.name}</div>
                <div class="text-xs text-gray-500">
                    <span class="text-blue-600 font-medium">Subjects:</span> 
                    <span class="text-green-600">${teacher.primarySubject}</span>
                    ${teacher.additionalSubjects?.length > 0 ?
                `, <span class="text-purple-600">${teacher.additionalSubjects.join(', ')}</span>` :
                ''}
                    • ${teacher.teacherId}
                </div>
            </label>
        `;
        teachersList.appendChild(item);
    });
}

function updateBulkAssignSelection(type, id) {
    const index = bulkAssignData[type].indexOf(id);
    if (index === -1) {
        bulkAssignData[type].push(id);
    } else {
        bulkAssignData[type].splice(index, 1);
    }

    updateSelectedCount(type);

    // If teachers were updated, refresh the teachers table
    if (type === 'teachers') {
        updateTeachersTable();
    }
}

function updateSelectedCount(type) {
    const count = bulkAssignData[type].length;
    const countElement = document.getElementById(`${type}SelectedCount`);
    if (countElement) {
        countElement.textContent = count;
    }

    // Update button text
    const buttonText = document.getElementById(`${type}DropdownText`);
    if (buttonText) {
        if (count === 0) {
            buttonText.textContent = type === 'teachers' ? 'Select teachers...' : 'Select subjects...';
        } else {
            buttonText.textContent = `${count} ${type} selected`;
        }
    }
}

function clearSelection(type) {
    bulkAssignData[type] = [];

    // Uncheck all checkboxes
    const checkboxes = document.querySelectorAll(`#${type}List input[type="checkbox"]`);
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });

    updateSelectedCount(type);

    // If teachers were cleared, hide the table
    if (type === 'teachers') {
        bulkAssignData.teacherAssignments = {};
        const tableContainer = document.getElementById('teachersTableContainer');
        if (tableContainer) {
            tableContainer.classList.add('hidden');
        }
    }
}

function saveBulkAssignSelection(type) {
    closeBulkAssignDropdown(type);

    // If teachers were saved, show the table
    if (type === 'teachers') {
        updateTeachersTable();
    }

    showToast('Teacher selection saved', 'success');
}

function updateTeachersTable() {
    const container = document.getElementById('teachersTableContainer');
    const tableBody = document.getElementById('teachersTableBody');
    const countElement = document.getElementById('selectedTeachersCount');

    if (!container || !tableBody || !countElement) return;

    if (bulkAssignData.teachers.length === 0) {
        container.classList.add('hidden');
        return;
    }

    // Show container
    container.classList.remove('hidden');

    // Update count
    countElement.textContent = bulkAssignData.teachers.length;

    // Clear table
    tableBody.innerHTML = '';

    // Add rows for each teacher
    bulkAssignData.teachers.forEach((teacherId, index) => {
        const teacher = teachersData.find(t => t.id === teacherId);
        if (!teacher) return;

        // Get teacher's assignment data or initialize
        if (!bulkAssignData.teacherAssignments[teacherId]) {
            bulkAssignData.teacherAssignments[teacherId] = {
                subjects: [teacher.primarySubject], // Start with primary subject
                otherSubjects: []
            };
        }
        const assignment = bulkAssignData.teacherAssignments[teacherId];

        // Get teacher's actual subjects (primary + additional)
        const teacherSubjects = [
            teacher.primarySubject,
            ...(teacher.additionalSubjects || [])
        ].filter(subject => subject && subject.trim() !== '');

        // Create unique list of subjects
        const uniqueSubjects = [...new Set(teacherSubjects)];

        // Create combined subjects options
        const subjectsOptions = uniqueSubjects
            .map(subject => {
                const isSelected = assignment.subjects.includes(subject);
                return `<option value="${subject}" ${isSelected ? 'selected' : ''}>${subject}</option>`;
            }).join('');

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>
                <div class="font-medium text-gray-900">${teacher.name}</div>
                <div class="text-xs text-gray-500">${teacher.teacherId}</div>
                <div class="text-xs text-gray-500">${teacher.department}</div>
            </td>
            <td>
                <select class="subject-dropdown" multiple onchange="updateTeacherSubjects(${teacherId}, this)" 
                        style="height: 80px;" title="Hold Ctrl to select multiple subjects">
                    ${subjectsOptions}
                </select>
                <div class="text-xs text-gray-500 mt-1">
                    <span class="font-medium">Selected:</span> 
                    <span id="selectedSubjectsDisplay-${teacherId}">
                        ${assignment.subjects.join(', ') || 'No subjects selected'}
                    </span>
                    ${assignment.otherSubjects.length > 0 ? `
                        <div class="mt-1">
                            <span class="font-medium text-purple-600">Others:</span> 
                            <span id="otherSubjectsDisplay-${teacherId}" class="text-purple-600">
                                ${assignment.otherSubjects.join(', ')}
                            </span>
                        </div>
                    ` : ''}
                </div>
            </td>
            <td>
                <div class="flex space-x-2">
                    <button type="button" onclick="openOthersModal(${teacherId})" class="others-btn">
                        <i class="fas fa-ellipsis-h mr-1"></i> Others
                    </button>
                    <button type="button" onclick="removeTeacher(${teacherId})" class="others-btn text-red-600 hover:text-red-800">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);

        // Initialize the multi-select with current selections
        const selectElement = row.querySelector('select');
        if (selectElement) {
            assignment.subjects.forEach(subject => {
                const option = selectElement.querySelector(`option[value="${subject}"]`);
                if (option) {
                    option.selected = true;
                }
            });
        }
    });
}

function updateTeacherSubjects(teacherId, selectElement) {
    if (!bulkAssignData.teacherAssignments[teacherId]) {
        bulkAssignData.teacherAssignments[teacherId] = {
            subjects: [],
            otherSubjects: []
        };
    }

    const teacher = teachersData.find(t => t.id === teacherId);
    if (!teacher) return;

    // Get selected subjects
    const selectedOptions = Array.from(selectElement.selectedOptions);
    const selectedSubjects = selectedOptions.map(option => option.value);

    // Validate selected subjects - must be from teacher's available subjects
    const teacherSubjects = [
        teacher.primarySubject,
        ...(teacher.additionalSubjects || [])
    ].filter(subject => subject && subject.trim() !== '');

    const invalidSubjects = selectedSubjects.filter(subject => 
        !teacherSubjects.includes(subject) && 
        !bulkAssignData.teacherAssignments[teacherId].otherSubjects.includes(subject)
    );

    if (invalidSubjects.length > 0) {
        showToast(`Invalid subjects selected: ${invalidSubjects.join(', ')}`, 'error');
        
        // Reset to previous selection
        setTimeout(() => {
            const select = document.querySelector(`select[onchange="updateTeacherSubjects(${teacherId}, this)"]`);
            if (select) {
                bulkAssignData.teacherAssignments[teacherId].subjects.forEach(subject => {
                    const option = select.querySelector(`option[value="${subject}"]`);
                    if (option) {
                        option.selected = true;
                    }
                });
            }
        }, 100);
        return;
    }

    // Update subjects
    bulkAssignData.teacherAssignments[teacherId].subjects = selectedSubjects;

    // Update display
    const displayElement = document.getElementById(`selectedSubjectsDisplay-${teacherId}`);
    if (displayElement) {
        displayElement.textContent = selectedSubjects.join(', ') || 'No subjects selected';
    }

    // Update all assigned subjects
    updateAllAssignedSubjects();

    showToast(`Updated subjects for ${teacher.name}`, 'success');
}

function openOthersModal(teacherId) {
    // First close any existing modals
    closeOthersModal();

    const teacher = teachersData.find(t => t.id === teacherId);
    if (!teacher) return;

    const assignment = bulkAssignData.teacherAssignments[teacherId] || {
        subjects: [],
        otherSubjects: []
    };

    // Get teacher's actual subjects
    const teacherSubjects = [
        teacher.primarySubject,
        ...(teacher.additionalSubjects || [])
    ].filter(subject => subject && subject.trim() !== '');

    // Get all subjects that are NOT already assigned to ANY teacher
    const allSubjects = mockSubjects;
    
    // Filter out subjects that are already assigned to ANY teacher (including this one's regular subjects)
    const availableSubjects = allSubjects.filter(subject => {
        // Don't show subjects that are already in this teacher's regular subjects
        if (assignment.subjects.includes(subject.name)) {
            return false;
        }
        
        // Don't show subjects that are already in this teacher's other subjects
        if (assignment.otherSubjects.includes(subject.name)) {
            return false;
        }
        
        // Don't show subjects that are already assigned to ANY teacher (class teacher, assistant teacher, or other bulk teachers)
        if (allAssignedSubjects.has(subject.name)) {
            return false;
        }
        
        return true;
    });

    // Create modal for other subjects with higher z-index
    const modalContent = `
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-[200]">
            <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-semibold text-gray-800">Additional Subjects for ${teacher.name}</h3>
                    <button onclick="closeOthersModal()" class="text-gray-500 hover:text-gray-700">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="mb-4">
                    <div class="text-sm text-gray-600 mb-2">Teacher's Current Subjects:</div>
                    <div class="flex flex-wrap gap-2 mb-3">
                        <span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">Primary: ${teacher.primarySubject}</span>
                        ${teacher.additionalSubjects?.map(subject =>
        `<span class="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">${subject}</span>`
    ).join('') || ''}
                    </div>
                    <div class="text-sm text-gray-600 mb-2 mt-3">Assigned Subjects:</div>
                    <div class="flex flex-wrap gap-2 mb-3">
                        ${assignment.subjects.map(subject => {
        const isPrimary = subject === teacher.primarySubject;
        const isAdditional = teacher.additionalSubjects?.includes(subject);
        return `<span class="px-2 py-1 ${isPrimary ? 'bg-blue-100 text-blue-800' : isAdditional ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'} text-xs rounded">${subject}</span>`;
    }).join('')}
                    </div>
                    ${assignment.otherSubjects.length > 0 ? `
                        <div class="text-sm text-gray-600 mb-2 mt-3">Current Other Subjects:</div>
                        <div class="flex flex-wrap gap-2 mb-3">
                            ${assignment.otherSubjects.map(subject => {
        return `<span class="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">${subject}</span>`;
    }).join('')}
                        </div>
                    ` : ''}
                </div>
                
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Add Other Subjects</label>
                    <div class="flex space-x-2">
                        <select id="otherSubjectSelect" class="flex-1 subject-dropdown">
                            <option value="">Select Subject</option>
                            ${availableSubjects.map(subject => `
                                <option value="${subject.id}">${subject.name}</option>
                            `).join('')}
                        </select>
                        <button type="button" onclick="addOtherSubject(${teacherId})" class="add-subject-btn">
                            <i class="fas fa-plus"></i> Add
                        </button>
                    </div>
                    <p class="text-xs text-gray-500 mt-1">
                        Available subjects that are not already assigned to any teacher
                    </p>
                    ${availableSubjects.length === 0 ? `
                        <div class="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                            <p class="text-xs text-yellow-700">No subjects available. All subjects are already assigned to teachers.</p>
                        </div>
                    ` : ''}
                </div>
                
                <div class="mb-4">
                    <h4 class="text-sm font-medium text-gray-700 mb-2">Current Other Subjects</h4>
                    <div id="otherSubjectsList" class="space-y-2">
                        ${assignment.otherSubjects.map((subject, index) => {
        const subjectData = mockSubjects.find(s => s.name === subject);
        return `
                                <div class="flex items-center justify-between bg-gray-50 p-2 rounded">
                                    <div class="flex items-center">
                                        <span class="subject-color-small mr-2" style="background-color: ${subjectData?.color || '#6b7280'}; width: 12px; height: 12px; border-radius: 50%; display: inline-block;"></span>
                                        <span>${subject}</span>
                                    </div>
                                    <button type="button" onclick="removeOtherSubject(${teacherId}, ${index})" class="text-red-500 hover:text-red-700">
                                        <i class="fas fa-times"></i>
                                    </button>
                                </div>
                            `;
    }).join('')}
                        ${assignment.otherSubjects.length === 0 ? `
                            <div class="text-center text-gray-500 py-4">
                                <i class="fas fa-book-open text-2xl mb-2"></i>
                                <p>No other subjects added</p>
                            </div>
                        ` : ''}
                    </div>
                </div>
                
                <div class="flex justify-end space-x-2">
                    <button type="button" onclick="closeOthersModal()" class="px-4 py-2 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50">
                        Close
                    </button>
                </div>
            </div>
        </div>
    `;

    // Create and show modal
    const modal = document.createElement('div');
    modal.id = 'othersModal';
    modal.innerHTML = modalContent;
    document.body.appendChild(modal);
}

function closeOthersModal() {
    const modal = document.getElementById('othersModal');
    if (modal) {
        modal.remove();
    }
}

function addOtherSubject(teacherId) {
    const select = document.getElementById('otherSubjectSelect');
    const subjectId = select?.value;

    if (!subjectId) {
        showToast('Please select a subject first', 'error');
        return;
    }

    const subject = mockSubjects.find(s => s.id === parseInt(subjectId));
    if (!subject) return;

    if (!bulkAssignData.teacherAssignments[teacherId]) {
        bulkAssignData.teacherAssignments[teacherId] = {
            subjects: [],
            otherSubjects: []
        };
    }

    // Check if subject already exists in other subjects
    if (bulkAssignData.teacherAssignments[teacherId].otherSubjects.includes(subject.name)) {
        showToast('Subject already added to other subjects', 'info');
        return;
    }

    // Check if subject already exists in regular subjects
    if (bulkAssignData.teacherAssignments[teacherId].subjects.includes(subject.name)) {
        showToast('Subject already assigned to teacher', 'info');
        return;
    }

    // Check if subject is already assigned to any teacher
    if (allAssignedSubjects.has(subject.name)) {
        showToast('This subject is already assigned to another teacher', 'error');
        return;
    }

    // Add to other subjects
    bulkAssignData.teacherAssignments[teacherId].otherSubjects.push(subject.name);
    
    // Add to all assigned subjects
    allAssignedSubjects.add(subject.name);

    // Update the display
    updateOthersList(teacherId);

    // Update the display in the table
    updateOtherSubjectsDisplay(teacherId);

    // Reset select
    if (select) select.value = '';

    showToast(`Added ${subject.name} to other subjects`, 'success');
}

function updateOtherSubjectsDisplay(teacherId) {
    const assignment = bulkAssignData.teacherAssignments[teacherId] || { otherSubjects: [] };
    const displayElement = document.getElementById(`otherSubjectsDisplay-${teacherId}`);
    
    if (displayElement) {
        if (assignment.otherSubjects.length > 0) {
            displayElement.innerHTML = assignment.otherSubjects.join(', ');
            displayElement.parentElement.classList.remove('hidden');
        } else {
            displayElement.parentElement.classList.add('hidden');
        }
    }
}

function removeOtherSubject(teacherId, index) {
    if (bulkAssignData.teacherAssignments[teacherId]) {
        const removed = bulkAssignData.teacherAssignments[teacherId].otherSubjects.splice(index, 1);
        
        // Remove from all assigned subjects
        allAssignedSubjects.delete(removed[0]);
        
        updateOthersList(teacherId);
        updateOtherSubjectsDisplay(teacherId);
        showToast(`Removed ${removed[0]} from other subjects`, 'info');
    }
}

function updateOthersList(teacherId) {
    const assignment = bulkAssignData.teacherAssignments[teacherId] || { otherSubjects: [] };
    const listElement = document.getElementById('otherSubjectsList');

    if (!listElement) return;

    listElement.innerHTML = assignment.otherSubjects.map((subject, index) => {
        const subjectData = mockSubjects.find(s => s.name === subject);
        return `
                <div class="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <div class="flex items-center">
                        <span class="subject-color-small mr-2" style="background-color: ${subjectData?.color || '#6b7280'}; width: 12px; height: 12px; border-radius: 50%; display: inline-block;"></span>
                        <span>${subject}</span>
                    </div>
                    <button type="button" onclick="removeOtherSubject(${teacherId}, ${index})" class="text-red-500 hover:text-red-700">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
    }).join('') || `
                <div class="text-center text-gray-500 py-4">
                    <i class="fas fa-book-open text-2xl mb-2"></i>
                    <p>No other subjects added</p>
                </div>
            `;
}

function removeTeacher(teacherId) {
    // Get teacher's assignments before removing
    const assignment = bulkAssignData.teacherAssignments[teacherId];
    
    // Remove from selected teachers
    const index = bulkAssignData.teachers.indexOf(teacherId);
    if (index !== -1) {
        bulkAssignData.teachers.splice(index, 1);
    }

    // Remove assignments
    delete bulkAssignData.teacherAssignments[teacherId];
    
    // Remove teacher's subjects from all assigned subjects
    if (assignment) {
        if (assignment.subjects) {
            assignment.subjects.forEach(subject => {
                allAssignedSubjects.delete(subject);
            });
        }
        if (assignment.otherSubjects) {
            assignment.otherSubjects.forEach(subject => {
                allAssignedSubjects.delete(subject);
            });
        }
    }

    // Uncheck in dropdown
    const checkbox = document.getElementById(`teacher-${teacherId}`);
    if (checkbox) {
        checkbox.checked = false;
    }

    // Update UI
    updateSelectedCount('teachers');
    updateTeachersTable();

    showToast('Teacher removed from selection', 'info');
}

// Subject Creation Functions
function toggleCreateSubjectSection() {
    const section = document.getElementById('createSubjectSection');
    const toggleBtn = document.getElementById('toggleSubjectSectionBtn');
    
    if (section.classList.contains('hidden')) {
        section.classList.remove('hidden');
        toggleBtn.innerHTML = '<i class="fas fa-minus mr-2"></i> Hide Subject Creation';
        toggleBtn.classList.remove('bg-blue-600');
        toggleBtn.classList.add('bg-gray-600');
    } else {
        section.classList.add('hidden');
        toggleBtn.innerHTML = '<i class="fas fa-plus mr-2"></i> Create New Subject';
        toggleBtn.classList.remove('bg-gray-600');
        toggleBtn.classList.add('bg-blue-600');
    }
}

function resetSubjectForm() {
    const form = document.getElementById('createSubjectForm');
    if (form) {
        form.reset();
    }
}

function saveSubject(event) {
    event.preventDefault();
    
    showLoading();
    
    try {
        // Collect only the essential data
        const subjectCode = document.getElementById('subjectCode')?.value.trim();
        const subjectName = document.getElementById('subjectName')?.value.trim();
        const description = document.getElementById('subjectDescription')?.value.trim() || '';
        
        // Validation
        if (!subjectCode || !subjectName) {
            showToast('Subject Code and Subject Name are required', 'error');
            hideLoading();
            return;
        }
        
        // Check if subject name already exists
        const existingSubject = mockSubjects.find(subject => 
            subject.name.toLowerCase() === subjectName.toLowerCase()
        );
        
        if (existingSubject) {
            showToast('Subject with this name already exists', 'error');
            hideLoading();
            return;
        }
        
        // Generate ID for new subject
        const newId = mockSubjects.length > 0 ? Math.max(...mockSubjects.map(s => s.id)) + 1 : 1;
        
        // Create subject object in the SIMPLIFIED format
        const newSubject = {
            id: newId,
            name: subjectName,  // This is the key field used in dropdowns
            color: '#3B82F6',  // Default blue color
            grade: 'PG-2nd',   // Default grade range for all classes
            subjectCode: subjectCode,
            description: description,
            isCustom: true,
            createdAt: new Date().toISOString()
        };
        
        console.log('Creating new subject:', newSubject);
        
        // Add to mockSubjects array
        mockSubjects.push(newSubject);
        
        // Save to localStorage
        localStorage.setItem('subjects', JSON.stringify(mockSubjects));
        
        showToast(`Subject "${subjectName}" created successfully`, 'success');
        
        // Force update of subject dropdowns
        updateSubjectDropdowns();
        
        // Show debug info
        console.log('All subjects after creation:', mockSubjects);
        
        // Reset form and hide section
        resetSubjectForm();
        toggleCreateSubjectSection();
        
    } catch (error) {
        console.error('Error saving subject:', error);
        showToast('Error saving subject', 'error');
    } finally {
        hideLoading();
    }
}


// Add a function to load subjects from localStorage
function loadSubjectsFromLocalStorage() {
    try {
        const storedSubjects = localStorage.getItem('subjects');
        if (storedSubjects) {
            const loadedSubjects = JSON.parse(storedSubjects);
            
            // Merge with mockSubjects, avoiding duplicates
            loadedSubjects.forEach(subject => {
                if (!mockSubjects.find(s => s.id === subject.id || s.name === subject.name)) {
                    mockSubjects.push(subject);
                }
            });
            
            console.log('Subjects loaded from localStorage:', mockSubjects);
        }
    } catch (error) {
        console.error('Error loading subjects from localStorage:', error);
    }
}


function generateSubjectCode() {
    const subjectName = document.getElementById('subjectName')?.value.trim();
    if (!subjectName) return;
    
    // Create a simple code from subject name
    const code = subjectName
        .toUpperCase()
        .replace(/[^A-Z]/g, '')
        .substring(0, 4) + 
        Math.floor(1000 + Math.random() * 9000);
    
    const subjectCodeInput = document.getElementById('subjectCode');
    if (subjectCodeInput) {
        subjectCodeInput.value = code;
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
            sidebar?.classList.add('collapsed');
            mainContent?.classList.add('sidebar-collapsed');
        } else {
            sidebar?.classList.remove('collapsed');
            mainContent?.classList.remove('sidebar-collapsed');
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

            sidebar?.classList.remove('mobile-open');
            overlay?.classList.remove('active');
            document.body.classList.remove('sidebar-open');

            if (sidebarCollapsed) {
                sidebar?.classList.add('collapsed');
                mainContent?.classList.add('sidebar-collapsed');
            } else {
                sidebar?.classList.remove('collapsed');
                mainContent?.classList.remove('sidebar-collapsed');
            }
        }
    }
}

function toggleSidebar() {
    if (isMobile) {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebarOverlay');

        if (sidebar?.classList.contains('mobile-open')) {
            closeMobileSidebar();
        } else {
            openMobileSidebar();
        }
    } else {
        const sidebar = document.getElementById('sidebar');
        const mainContent = document.getElementById('mainContent');

        sidebarCollapsed = !sidebarCollapsed;

        if (sidebarCollapsed) {
            sidebar?.classList.add('collapsed');
            mainContent?.classList.add('sidebar-collapsed');
            const sidebarToggleIcon = document.getElementById('sidebarToggleIcon');
            if (sidebarToggleIcon) {
                sidebarToggleIcon.className = 'fas fa-bars text-xl';
            }
        } else {
            sidebar?.classList.remove('collapsed');
            mainContent?.classList.remove('sidebar-collapsed');
            const sidebarToggleIcon = document.getElementById('sidebarToggleIcon');
            if (sidebarToggleIcon) {
                sidebarToggleIcon.className = 'fas fa-times text-xl';
            }
        }
    }
}

function openMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');

    sidebar?.classList.add('mobile-open');
    overlay?.classList.add('active');
    document.body.classList.add('sidebar-open');
}

function closeMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');

    sidebar?.classList.remove('mobile-open');
    overlay?.classList.remove('active');
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

// Call this function during initialization
function initializeClassModule() {
    // Set current date
    const today = new Date();
    const currentDateElement = document.getElementById('currentDate');
    if (currentDateElement) {
        currentDateElement.textContent = today.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    // Fetch teachers data
    fetchTeachers();

    // Load classes from localStorage
    loadClassesFromLocalStorage();

    // Load subjects from localStorage (ADD THIS LINE)
    loadSubjectsFromLocalStorage();

    // Load initial data
    loadClassData();

    // Generate schedule
    generateSchedule();
}

function loadClassesFromLocalStorage() {
    try {
        const storedClasses = localStorage.getItem('classes');
        if (storedClasses) {
            classesData = JSON.parse(storedClasses);
        } else {
            // Use mock data if no localStorage data
            classesData = [...mockClasses];
            localStorage.setItem('classes', JSON.stringify(classesData));
        }
        filteredClasses = [...classesData];
    } catch (error) {
        console.error('Error loading classes from localStorage:', error);
        classesData = [...mockClasses];
        filteredClasses = [...classesData];
    }
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

    // Update student counts only
    const pgStudentsElement = document.getElementById('pgStudents');
    const lkgStudentsElement = document.getElementById('lkgStudents');
    const ukgStudentsElement = document.getElementById('ukgStudents');
    const firstStudentsElement = document.getElementById('firstStudents');
    const secondStudentsElement = document.getElementById('secondStudents');

    if (pgStudentsElement) pgStudentsElement.textContent = pgClasses.reduce((sum, c) => sum + c.currentStudents, 0);
    if (lkgStudentsElement) lkgStudentsElement.textContent = lkgClasses.reduce((sum, c) => sum + c.currentStudents, 0);
    if (ukgStudentsElement) ukgStudentsElement.textContent = ukgClasses.reduce((sum, c) => sum + c.currentStudents, 0);
    if (firstStudentsElement) firstStudentsElement.textContent = firstClasses.reduce((sum, c) => sum + c.currentStudents, 0);
    if (secondStudentsElement) secondStudentsElement.textContent = secondClasses.reduce((sum, c) => sum + c.currentStudents, 0);
}

function applyFilters() {
    currentPage = 1;

    // Get filter values
    const classFilter = document.getElementById('classFilter')?.value || 'all';
    const sectionFilter = document.getElementById('sectionFilter')?.value || 'all';
    const yearFilter = document.getElementById('yearFilter')?.value || 'all';
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';

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
    const totalClassesElement = document.getElementById('totalClasses');
    if (totalClassesElement) {
        totalClassesElement.textContent = filteredClasses.length;
    }

    // Render table
    renderClassesTable();

    // Update schedule
    generateSchedule();
}

function renderClassesTable() {
    const tableBody = document.getElementById('classesTableBody');
    const tableInfo = document.getElementById('tableInfo');

    if (!tableBody || !tableInfo) return;

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

        // Get subject count
        const subjectCount = classItem.subjects ? classItem.subjects.length : 0;

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
                                <div class="text-xs text-gray-500 mt-1">
                                    <i class="fas fa-book mr-1"></i> ${subjectCount} subjects
                                </div>
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
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    if (prevBtn) prevBtn.disabled = currentPage === 1;
    if (nextBtn) nextBtn.disabled = currentPage === totalPages;

    // Update table info
    tableInfo.textContent = `Showing ${startIndex + 1}-${endIndex} of ${filteredClasses.length} classes`;
}

function getClassColor(className) {
    switch (className) {
        case 'PG': return 'bg-purple-600';
        case 'LKG': return 'bg-green-600';
        case 'UKG': return 'bg-blue-600';
        case '1st': return 'bg-yellow-600';
        case '2nd': return 'bg-red-600';
        default: return 'bg-gray-600';
    }
}

function getClassIcon(className) {
    switch (className) {
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
    switch (status) {
        case 'active': return 'status-active';
        case 'inactive': return 'status-inactive';
        case 'pending': return 'status-pending';
        default: return 'status-active';
    }
}

function getStatusIcon(status) {
    switch (status) {
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
    const modal = document.getElementById('createClassModal');
    if (!modal) {
        console.error('Create class modal not found');
        return;
    }

    editingClassId = null;
    const modalTitle = document.getElementById('modalTitle');
    const submitButtonText = document.getElementById('submitButtonText');
    
    if (modalTitle) modalTitle.textContent = 'Create New Class';
    if (submitButtonText) submitButtonText.textContent = 'Create Class';

    // Reset form
    const form = document.getElementById('classForm');
    if (form) form.reset();

    // Reset teacher subject assignments section
    const teacherSubjectAssignments = document.getElementById('teacherSubjectAssignments');
    const classTeacherSubjectItem = document.getElementById('classTeacherSubjectItem');
    const assistantTeacherSubjectItem = document.getElementById('assistantTeacherSubjectItem');
    const noTeachersMessage = document.getElementById('noTeachersMessage');
    
    if (teacherSubjectAssignments) teacherSubjectAssignments.classList.add('hidden');
    if (classTeacherSubjectItem) classTeacherSubjectItem.classList.add('hidden');
    if (assistantTeacherSubjectItem) assistantTeacherSubjectItem.classList.add('hidden');
    if (noTeachersMessage) noTeachersMessage.classList.remove('hidden');

    // Reset subject dropdowns
    const classTeacherSubject = document.getElementById('classTeacherSubject');
    const assistantTeacherSubject = document.getElementById('assistantTeacherSubject');
    
    if (classTeacherSubject) {
        classTeacherSubject.disabled = true;
        classTeacherSubject.innerHTML = '<option value="">Select Subject</option>';
    }

    if (assistantTeacherSubject) {
        assistantTeacherSubject.disabled = true;
        assistantTeacherSubject.innerHTML = '<option value="">Select Subject</option>';
    }

    // Reset global variables
    selectedClassTeacher = null;
    selectedAssistantTeacher = null;
    assignedSubjects = [];

    // Reset bulk assign
    clearBulkAssign();

    // Set default values
    const academicYear = document.getElementById('academicYear');
    const maxStudents = document.getElementById('maxStudents');
    const currentStudents = document.getElementById('currentStudents');
    const startTime = document.getElementById('startTime');
    const endTime = document.getElementById('endTime');
    
    if (academicYear) academicYear.value = '2024-2025';
    if (maxStudents) maxStudents.value = '30';
    if (currentStudents) currentStudents.value = '0';
    if (startTime) startTime.value = '08:30';
    if (endTime) endTime.value = '13:30';

    // Reset subject creation section
    const createSubjectSection = document.getElementById('createSubjectSection');
    const toggleSubjectBtn = document.getElementById('toggleSubjectSectionBtn');
    if (createSubjectSection) {
        createSubjectSection.classList.add('hidden');
    }
    if (toggleSubjectBtn) {
        toggleSubjectBtn.innerHTML = '<i class="fas fa-plus mr-2"></i> Create New Subject';
        toggleSubjectBtn.classList.remove('bg-gray-600');
        toggleSubjectBtn.classList.add('bg-blue-600');
    }
    
    // Reset subject form
    resetSubjectForm();

    // Ensure teachers are loaded
    if (teachersData.length === 0) {
        fetchTeachers();
    }

    // Show modal with higher z-index than other modals
    modal.style.zIndex = '100';
    modal.classList.add('active');
}

function closeCreateClassModal() {
    const modal = document.getElementById('createClassModal');
    if (modal) {
        modal.classList.remove('active');
        modal.style.zIndex = '';
    }
    editingClassId = null;
}

function openEditClassModal(classId) {
    editingClassId = classId;
    const modalTitle = document.getElementById('modalTitle');
    const submitButtonText = document.getElementById('submitButtonText');
    
    if (modalTitle) modalTitle.textContent = 'Edit Class';
    if (submitButtonText) submitButtonText.textContent = 'Update Class';

    // Find class
    const classItem = classesData.find(c => c.id === classId);
    if (!classItem) {
        showToast('Class not found', 'error');
        return;
    }

    // Populate form
    const classNameInput = document.getElementById('className');
    const classCodeInput = document.getElementById('classCode');
    const academicYearInput = document.getElementById('academicYear');
    const sectionInput = document.getElementById('section');
    const maxStudentsInput = document.getElementById('maxStudents');
    const currentStudentsInput = document.getElementById('currentStudents');
    const roomNumberInput = document.getElementById('roomNumber');
    const classTeacherSelect = document.getElementById('classTeacher');
    const assistantTeacherSelect = document.getElementById('assistantTeacher');
    const startTimeInput = document.getElementById('startTime');
    const endTimeInput = document.getElementById('endTime');
    const descriptionInput = document.getElementById('description');
    
    if (classNameInput) classNameInput.value = classItem.className;
    if (classCodeInput) classCodeInput.value = classItem.classCode;
    if (academicYearInput) academicYearInput.value = classItem.academicYear;
    if (sectionInput) sectionInput.value = classItem.section;
    if (maxStudentsInput) maxStudentsInput.value = classItem.maxStudents;
    if (currentStudentsInput) currentStudentsInput.value = classItem.currentStudents;
    if (roomNumberInput) roomNumberInput.value = classItem.roomNumber || '';
    if (classTeacherSelect) classTeacherSelect.value = classItem.classTeacher?.id || '';
    if (assistantTeacherSelect) assistantTeacherSelect.value = classItem.assistantTeacher?.id || '';
    if (startTimeInput) startTimeInput.value = classItem.startTime;
    if (endTimeInput) endTimeInput.value = classItem.endTime;
    if (descriptionInput) descriptionInput.value = classItem.description || '';

    // Set working days checkboxes
    const checkboxes = document.querySelectorAll('input[name="workingDays"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = classItem.workingDays.includes(checkbox.value);
    });

    // Trigger teacher change events to populate subject dropdowns
    if (classItem.classTeacher?.id) {
        setTimeout(() => {
            if (classTeacherSelect) {
                classTeacherSelect.dispatchEvent(new Event('change'));
                
                // Set class teacher subject if available
                if (classItem.classTeacher.subject) {
                    setTimeout(() => {
                        const classTeacherSubject = document.getElementById('classTeacherSubject');
                        if (classTeacherSubject) {
                            classTeacherSubject.value = classItem.classTeacher.subject;
                            classTeacherSubject.dispatchEvent(new Event('change'));
                        }
                    }, 100);
                }
            }
        }, 100);
    }
    
    if (classItem.assistantTeacher?.id) {
        setTimeout(() => {
            if (assistantTeacherSelect) {
                assistantTeacherSelect.dispatchEvent(new Event('change'));
                
                // Set assistant teacher subject if available
                if (classItem.assistantTeacher.subject) {
                    setTimeout(() => {
                        const assistantTeacherSubject = document.getElementById('assistantTeacherSubject');
                        if (assistantTeacherSubject) {
                            assistantTeacherSubject.value = classItem.assistantTeacher.subject;
                            assistantTeacherSubject.dispatchEvent(new Event('change'));
                        }
                    }, 100);
                }
            }
        }, 200);
    }

    // Load bulk assign data if exists
    if (classItem.bulkAssignData) {
        bulkAssignData = { ...classItem.bulkAssignData };
        updateTeachersTable();
    }

    // Show modal
    const modal = document.getElementById('createClassModal');
    if (modal) {
        modal.style.zIndex = '100';
        modal.classList.add('active');
    }
}

async function handleClassFormSubmit(event) {
    event.preventDefault();

    showLoading();

    try {
        // Get form data
        const formData = {
            className: document.getElementById('className')?.value.trim() || '',
            classCode: document.getElementById('classCode')?.value.trim() || '',
            academicYear: document.getElementById('academicYear')?.value || '',
            section: document.getElementById('section')?.value || '',
            maxStudents: parseInt(document.getElementById('maxStudents')?.value || '0'),
            currentStudents: parseInt(document.getElementById('currentStudents')?.value || '0'),
            roomNumber: document.getElementById('roomNumber')?.value.trim() || '',
            classTeacherId: document.getElementById('classTeacher')?.value || '',
            assistantTeacherId: document.getElementById('assistantTeacher')?.value || '',
            classTeacherSubject: document.getElementById('classTeacherSubject')?.value || '',
            assistantTeacherSubject: document.getElementById('assistantTeacherSubject')?.value || '',
            startTime: document.getElementById('startTime')?.value || '',
            endTime: document.getElementById('endTime')?.value || '',
            description: document.getElementById('description')?.value.trim() || '',
            workingDays: Array.from(document.querySelectorAll('input[name="workingDays"]:checked'))
                .map(cb => cb.value),
            subjects: [], // This will be populated from bulk assignments
            bulkAssignData: { ...bulkAssignData }
        };

        // Validation
        if (!formData.className || !formData.classCode || !formData.academicYear || !formData.section) {
            showToast('Please fill all required fields', 'error');
            hideLoading();
            return;
        }

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

        // Check if class teacher subject is selected when class teacher is selected
        if (formData.classTeacherId && !formData.classTeacherSubject) {
            showToast('Please select a subject for the class teacher', 'error');
            hideLoading();
            return;
        }

        // Get teacher details
        const classTeacher = formData.classTeacherId ?
            teachersData.find(t => t.id === parseInt(formData.classTeacherId)) : null;
        const assistantTeacher = formData.assistantTeacherId ?
            teachersData.find(t => t.id === parseInt(formData.assistantTeacherId)) : null;

        // Create class object
        const newClass = {
            ...formData,
            classTeacher: classTeacher ? { 
                id: classTeacher.id, 
                name: classTeacher.name,
                subject: formData.classTeacherSubject
            } : null,
            assistantTeacher: assistantTeacher ? { 
                id: assistantTeacher.id, 
                name: assistantTeacher.name,
                subject: formData.assistantTeacherSubject
            } : null,
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        // Save class (localStorage only)
        const savedClass = saveClass(newClass);

        if (editingClassId) {
            // Update existing class in local data
            const index = classesData.findIndex(c => c.id === editingClassId);
            if (index !== -1) {
                classesData[index] = { ...savedClass, id: editingClassId };
                showToast('Class updated successfully', 'success');
            }
        } else {
            // Add new class to local data
            classesData.push(savedClass);
            showToast('Class created successfully', 'success');

            // Show bulk assignment summary
            if (bulkAssignData.teachers.length > 0) {
                setTimeout(() => {
                    showToast('Bulk teacher assignments saved successfully', 'info');
                }, 1000);
            }
        }

        // Save to localStorage
        localStorage.setItem('classes', JSON.stringify(classesData));

        // Close modal
        closeCreateClassModal();

        // Reload data
        setTimeout(() => {
            loadClassData();
        }, 500);

    } catch (error) {
        console.error('Error in form submission:', error);
        showToast('Error saving class. Please try again.', 'error');
    } finally {
        hideLoading();
    }
}

function viewClassDetails(classId) {
    const classItem = classesData.find(c => c.id === classId);
    if (!classItem) return;

    // Update modal title
    const viewClassTitle = document.getElementById('viewClassTitle');
    const viewClassCode = document.getElementById('viewClassCode');
    
    if (viewClassTitle) viewClassTitle.textContent = `${classItem.className} - Section ${classItem.section}`;
    if (viewClassCode) viewClassCode.textContent = classItem.classCode;

    // Calculate capacity
    const capacityPercentage = Math.round((classItem.currentStudents / classItem.maxStudents) * 100);

    // Get subject names
    const subjectNames = classItem.subjects ?
        classItem.subjects.map(subId => {
            const subject = mockSubjects.find(s => s.id === subId);
            return subject ? subject.name : '';
        }).filter(name => name) : [];

    // Check for bulk assignments
    const hasBulkAssignments = classItem.bulkAssignData &&
        (classItem.bulkAssignData.teachers.length > 0 ||
            Object.keys(classItem.bulkAssignData.teacherAssignments || {}).length > 0);

    // Create content
    const content = document.getElementById('classDetailsContent');
    if (!content) return;

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
                            ${classItem.classTeacher ? `
                                <div class="bg-white border border-gray-200 rounded-lg p-4">
                                    <div class="flex items-center mb-3">
                                        <div class="teacher-avatar mr-3">
                                            ${getTeacherInitials(classItem.classTeacher.name)}
                                        </div>
                                        <div>
                                            <div class="font-medium text-gray-900">${classItem.classTeacher.name}</div>
                                            <div class="text-sm text-gray-500">Class Teacher</div>
                                            ${classItem.classTeacher.subject ? `
                                                <div class="text-xs text-blue-600 mt-1">
                                                    <i class="fas fa-book mr-1"></i> ${classItem.classTeacher.subject}
                                                </div>
                                            ` : ''}
                                        </div>
                                    </div>
                                    <div class="text-sm text-gray-600">
                                        <i class="fas fa-envelope mr-2"></i> teacher@school.com
                                    </div>
                                    <div class="text-sm text-gray-600 mt-1">
                                        <i class="fas fa-phone mr-2"></i> +91 9876543210
                                    </div>
                                </div>
                            ` : ''}
                            
                            ${classItem.assistantTeacher ? `
                                <div class="bg-white border border-gray-200 rounded-lg p-4">
                                    <div class="flex items-center mb-3">
                                        <div class="teacher-avatar mr-3">
                                            ${getTeacherInitials(classItem.assistantTeacher.name)}
                                        </div>
                                        <div>
                                            <div class="font-medium text-gray-900">${classItem.assistantTeacher.name}</div>
                                            <div class="text-sm text-gray-500">Assistant Teacher</div>
                                            ${classItem.assistantTeacher.subject ? `
                                                <div class="text-xs text-blue-600 mt-1">
                                                    <i class="fas fa-book mr-1"></i> ${classItem.assistantTeacher.subject}
                                                </div>
                                            ` : ''}
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
                    
                    <!-- Bulk Assignments -->
                    ${hasBulkAssignments ? `
                        <div>
                            <h4 class="font-semibold text-gray-800 mb-4">Bulk Assignments</h4>
                            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div class="overflow-x-auto">
                                    <table class="min-w-full divide-y divide-gray-200">
                                        <thead>
                                            <tr>
                                                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                                                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Teacher</th>
                                                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Assigned Subjects</th>
                                                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Other Subjects</th>
                                            </tr>
                                        </thead>
                                        <tbody class="divide-y divide-gray-200">
                                            ${classItem.bulkAssignData.teachers.map((teacherId, index) => {
            const teacher = teachersData.find(t => t.id === teacherId);
            const assignment = classItem.bulkAssignData.teacherAssignments[teacherId];
            if (!teacher || !assignment) return '';

            return `
                                                    <tr>
                                                        <td class="px-4 py-2">${index + 1}</td>
                                                        <td class="px-4 py-2">
                                                            <div class="font-medium text-gray-900">${teacher.name}</div>
                                                            <div class="text-xs text-gray-500">${teacher.teacherId}</div>
                                                        </td>
                                                        <td class="px-4 py-2">
                                                            <div class="flex flex-wrap gap-1">
                                                                ${assignment.subjects?.map(subject => `
                                                                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                                        ${subject}
                                                                    </span>
                                                                `).join('') || '<span class="text-gray-500 text-sm">None</span>'}
                                                            </div>
                                                        </td>
                                                        <td class="px-4 py-2">
                                                            <div class="flex flex-wrap gap-1">
                                                                ${assignment.otherSubjects?.map(subject => `
                                                                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                                        ${subject}
                                                                    </span>
                                                                `).join('') || '<span class="text-gray-500 text-sm">None</span>'}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                `;
        }).join('')}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    ` : ''}
                    
                    <!-- Subjects -->
                    ${subjectNames.length > 0 ? `
                        <div>
                            <h4 class="font-semibold text-gray-800 mb-4">Subjects (${subjectNames.length})</h4>
                            <div class="bg-gray-50 p-4 rounded-lg">
                                <div class="flex flex-wrap gap-2">
                                    ${subjectNames.map(subjectName => `
                                        <span class="px-3 py-1 bg-white border border-gray-200 rounded-full text-sm text-gray-700">
                                            <i class="fas fa-book mr-1 text-blue-500"></i> ${subjectName}
                                        </span>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                    ` : ''}
                    
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
    const modal = document.getElementById('viewClassModal');
    if (modal) {
        modal.classList.add('active');
    }
}

function closeViewClassModal() {
    const modal = document.getElementById('viewClassModal');
    if (modal) {
        modal.classList.remove('active');
    }
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

    try {
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

        // Update localStorage
        localStorage.setItem('classes', JSON.stringify(classesData));

        showToast('Class deleted successfully', 'success');

        // Reload data
        setTimeout(() => {
            loadClassData();
        }, 500);
    } catch (error) {
        console.error('Error deleting class:', error);
        showToast('Error deleting class', 'error');
    } finally {
        hideLoading();
    }
}

// Schedule Functions
function generateSchedule() {
    const scheduleGrid = document.getElementById('scheduleGrid');
    const weekDisplay = document.getElementById('currentWeek');

    if (!scheduleGrid || !weekDisplay) return;

    // Update week display
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const weekStart = new Date(currentWeekDate);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Start from Monday

    const dateOptions = { weekday: 'short', day: 'numeric' };
    const monday = new Date(weekStart);
    const friday = new Date(weekStart);
    friday.setDate(friday.getDate() + 4);

    weekDisplay.textContent = `${monday.toLocaleDateString('en-US', dateOptions)} - ${friday.toLocaleDateString('en-US', dateOptions)}`;

    // Create schedule grid - FIXED VERSION
    let scheduleHTML = `
                <div class="grid grid-cols-5 gap-2">
                    <div class="text-xs text-gray-500 font-medium py-2 text-center">MON</div>
                    <div class="text-xs text-gray-500 font-medium py-2 text-center">TUE</div>
                    <div class="text-xs text-gray-500 font-medium py-2 text-center">WED</div>
                    <div class="text-xs text-gray-500 font-medium py-2 text-center">THU</div>
                    <div class="text-xs text-gray-500 font-medium py-2 text-center">FRI</div>
            `;

    // Map of short day names to full day names used in the data
    const dayMap = {
        'MON': 'monday',
        'TUE': 'tuesday',
        'WED': 'wednesday',
        'THU': 'thursday',
        'FRI': 'friday'
    };

    const days = ['MON', 'TUE', 'WED', 'THU', 'FRI'];

    days.forEach((dayShort, index) => {
        const fullDayName = dayMap[dayShort];
        const currentDate = new Date(weekStart);
        currentDate.setDate(currentDate.getDate() + index);
        const dateStr = currentDate.getDate();

        // FIXED: Use lowercase comparison
        const dayClasses = filteredClasses.filter(classItem =>
            classItem.workingDays &&
            classItem.workingDays.map(d => d.toLowerCase()).includes(fullDayName)
        );

        scheduleHTML += `
                    <div class="border border-gray-100 rounded-lg p-3 min-h-[180px]">
                        <div class="flex items-center justify-between mb-2">
                            <span class="text-xs font-medium text-gray-500">${dateStr}</span>
                            ${dayClasses.length > 0 ? `
                                <span class="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
                                    ${dayClasses.length}
                                </span>
                            ` : ''}
                        </div>
                        
                        <div class="space-y-2">
                            ${dayClasses.length > 0 ? dayClasses.map(classItem => `
                                <div class="text-xs p-2 border border-gray-100 rounded hover:border-gray-200 transition-colors">
                                    <div class="flex items-start justify-between">
                                        <div class="flex items-center">
                                            <div class="h-5 w-5 ${getClassColor(classItem.className)} rounded flex items-center justify-center mr-2">
                                                <i class="${getClassIcon(classItem.className)} text-white text-xs"></i>
                                            </div>
                                            <div>
                                                <div class="font-medium text-gray-800">${classItem.className}-${classItem.section}</div>
                                                <div class="text-gray-500 mt-0.5">${formatTimeShort(classItem.startTime)}-${formatTimeShort(classItem.endTime)}</div>
                                            </div>
                                        </div>
                                        <div class="text-gray-400 text-xs">
                                            ${classItem.roomNumber?.replace('Room ', 'R') || '-'}
                                        </div>
                                    </div>
                                    <div class="text-gray-500 text-xs mt-1 truncate">
                                        ${classItem.classTeacher?.name?.split(' ')[0] || classItem.assistantTeacher?.name?.split(' ')[0] || 'Staff'}
                                    </div>
                                </div>
                            `).join('') : `
                                <div class="text-center pt-8">
                                    <i class="fas fa-calendar text-gray-300 text-lg mb-2"></i>
                                    <p class="text-xs text-gray-400">No classes</p>
                                </div>
                            `}
                        </div>
                    </div>
                `;
    });

    scheduleHTML += '</div>';
    scheduleGrid.innerHTML = scheduleHTML;
}

// Helper function for short time format
function formatTimeShort(time) {
    if (!time) return '--:--';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'pm' : 'am';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes}${ampm}`;
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
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.classList.remove('hidden');
    }
}

function hideLoading() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.classList.add('hidden');
    }
}

function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) return;

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

function clearBulkAssign() {
    bulkAssignData = {
        teachers: [],
        teacherAssignments: {}
    };

    // Clear all checkboxes
    clearSelection('teachers');
    const buttonText = document.getElementById('teachersDropdownText');
    if (buttonText) {
        buttonText.textContent = 'Select teachers...';
    }

    // Hide table
    const tableContainer = document.getElementById('teachersTableContainer');
    if (tableContainer) {
        tableContainer.classList.add('hidden');
    }

    showToast('All assignments cleared', 'info');
}

// Mock classes data (for demonstration)
const mockClasses = [
    {
        id: 1,
        className: "PG",
        classCode: "PG-2024-A",
        academicYear: "2024-2025",
        section: "A",
        maxStudents: 25,
        currentStudents: 20,
        roomNumber: "Room 101",
        classTeacher: { id: 1, name: "Ms. Priya Patel" },
        assistantTeacher: null,
        startTime: "08:30",
        endTime: "12:30",
        workingDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
        status: "active",
        description: "Play Group Class",
        subjects: [1, 2, 3],
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
        classTeacher: { id: 2, name: "Mr. Rajesh Sharma" },
        assistantTeacher: null,
        startTime: "08:30",
        endTime: "13:00",
        workingDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
        status: "active",
        description: "Lower Kindergarten Class",
        subjects: [1, 2, 3, 4, 5],
        createdAt: "2024-01-15"
    }
];
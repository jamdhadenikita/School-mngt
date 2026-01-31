// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    checkSession();
    setupEventListeners();
    setupResponsiveSidebar();
    loadInitialData();
    updateFeeCalculations();
    
    // Check URL parameters to show appropriate section
    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get('action');
    
    if (action === 'add') {
        showAddStudentSection();
    } else {
        showAllStudentsSection();
    }
    
    // Initialize document upload status
    updateDocumentStatus();
    
    // Initialize sports and subjects
    updateOtherSportsDisplay();
    updateOtherSubjectsDisplay();
});

// Global variables
let sidebarCollapsed = false;
let isMobile = window.innerWidth < 1024;
let additionalFees = [];
let editingStudentId = null;
let originalAdditionalFees = [];
let uploadedDocuments = {};
let otherSports = [];
let otherSubjects = [];
let transactionVerified = false;

// Session Management
const USER_SESSION_KEY = 'school_portal_session';
const SCHOOL_DATA_KEY = 'school_portal_data';
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
    students: [],
    currentPage: 1,
    filteredStudents: [],
    studentIdCounter: 1001
};

// Data Management
function loadInitialData() {
    const savedData = localStorage.getItem(SCHOOL_DATA_KEY);
    if (savedData) {
        try {
            const parsedData = JSON.parse(savedData);
            appState.students = parsedData.students || [];
            appState.studentIdCounter = parsedData.studentIdCounter || 1001;
        } catch (e) {
            console.error('Error loading saved data:', e);
            appState.students = generateSampleStudents();
            appState.studentIdCounter = 1001 + appState.students.length;
        }
    } else {
        appState.students = generateSampleStudents();
        appState.studentIdCounter = 1001 + appState.students.length;
    }
    renderStudentsTable();
    updateStudentStats();
}

function saveData() {
    try {
        localStorage.setItem(SCHOOL_DATA_KEY, JSON.stringify({
            students: appState.students,
            studentIdCounter: appState.studentIdCounter
        }));
        console.log('Data saved successfully:', appState.students.length, 'students');
        return true;
    } catch (e) {
        console.error('Error saving data:', e);
        Toast.show('Error saving data to local storage', 'error');
        return false;
    }
}

function generateSampleStudents() {
    return [
        {
            id: 1,
            studentId: 'STU1001',
            firstName: 'Rahul',
            middleName: '',
            lastName: 'Sharma',
            fullName: 'Rahul Sharma',
            dob: '2010-05-15',
            gender: 'Male',
            bloodGroup: 'A+',
            casteCategory: 'General',
            localAddress: '123 Main Street, Pimpri, Pune - 411017',
            permanentAddress: '456 Family Home, Mumbai - 400001',
            photo: null,
            class: '5',
            section: 'A',
            rollNumber: '101',
            admissionDate: '2023-06-01',
            academicYear: '2023-2024',
            classTeacher: 'Mr. Sharma',
            subjects: ['English', 'Hindi', 'Mathematics', 'Science'],
            fatherName: 'Mr. Vijay Sharma',
            fatherContact: '9876543210',
            fatherAadhar: '123456789012',
            fatherOccupation: 'Engineer',
            motherName: 'Mrs. Sunita Sharma',
            motherContact: '9876543211',
            motherAadhar: '234567890123',
            motherOccupation: 'Teacher',
            parentEmail: 'vijay.sharma@example.com',
            relationship: 'Father',
            emergencyContactName: 'Mrs. Sharma',
            emergencyContactNumber: '9876543211',
            medicalInfo: 'No known allergies',
            sports: ['Cricket', 'Chess'],
            fees: {
                total: 50000,
                admission: 5000,
                uniform: 2000,
                books: 3000,
                tuition: 40000,
                additional: 0,
                paid: 30000,
                pending: 20000,
                paymentMode: 'installment',
                paymentMethod: 'cash',
                transactionId: '',
                installments: [
                    { installmentNumber: 1, amount: 10000, dueDate: '2023-07-01', status: 'paid', paidAmount: 10000, paymentDate: '2023-07-01' },
                    { installmentNumber: 2, amount: 10000, dueDate: '2023-08-01', status: 'pending', paidAmount: 0, paymentDate: null }
                ],
                receiptNumber: 'REC00123456',
                initialPaymentDate: '2023-06-01'
            },
            status: 'Active',
            createdAt: '2023-06-01T10:30:00Z'
        },
        {
            id: 2,
            studentId: 'STU1002',
            firstName: 'Priya',
            middleName: '',
            lastName: 'Patel',
            fullName: 'Priya Patel',
            dob: '2011-08-22',
            gender: 'Female',
            bloodGroup: 'B+',
            casteCategory: 'OBC',
            localAddress: '456 Park Avenue, Chinchwad, Pune - 411033',
            permanentAddress: '456 Park Avenue, Chinchwad, Pune - 411033',
            photo: null,
            class: '4',
            section: 'B',
            rollNumber: '205',
            admissionDate: '2023-06-10',
            academicYear: '2023-2024',
            classTeacher: 'Ms. Patel',
            subjects: ['English', 'Hindi', 'Mathematics', 'Science'],
            fatherName: 'Mr. Raj Patel',
            fatherContact: '9876543212',
            fatherAadhar: '345678901234',
            fatherOccupation: 'Business',
            motherName: 'Mrs. Anita Patel',
            motherContact: '9876543211',
            motherAadhar: '456789012345',
            motherOccupation: 'Teacher',
            parentEmail: 'anita.patel@example.com',
            relationship: 'Mother',
            emergencyContactName: 'Mr. Patel',
            emergencyContactNumber: '9876543212',
            medicalInfo: 'Asthma (controlled)',
            sports: ['Dance', 'Swimming'],
            fees: {
                total: 45000,
                admission: 5000,
                uniform: 2000,
                books: 2500,
                tuition: 35500,
                additional: 0,
                paid: 45000,
                pending: 0,
                paymentMode: 'one-time',
                paymentMethod: 'online',
                transactionId: 'TXN123456789',
                installments: [],
                receiptNumber: 'REC00123457',
                initialPaymentDate: '2023-06-10'
            },
            status: 'Active',
            createdAt: '2023-06-10T14:20:00Z'
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
    
    // Fee calculation inputs
    const feeInputs = ['admissionFees', 'uniformFees', 'bookFees', 'tuitionFees'];
    feeInputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('input', updateFeeCalculations);
        }
    });
    
    // Initial payment input
    const initialPayment = document.getElementById('initialPayment');
    if (initialPayment) {
        initialPayment.addEventListener('input', updatePaymentDetails);
    }
    
    // Student search and filters
    const searchInput = document.getElementById('searchStudent');
    if (searchInput) {
        searchInput.addEventListener('input', filterStudents);
    }
    
    const filters = ['filterClass', 'filterFeeStatus', 'filterStudentStatus'];
    filters.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('change', filterStudents);
        }
    });
    
    // Select all checkbox
    const selectAll = document.getElementById('selectAll');
    if (selectAll) {
        selectAll.addEventListener('change', function() {
            const checkboxes = document.querySelectorAll('.student-checkbox');
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

// Show/Hide Sections
function showAllStudentsSection() {
    document.getElementById('allStudentsSection').classList.remove('hidden');
    document.getElementById('addStudentSection').classList.add('hidden');
    appState.currentPage = 1;
    renderStudentsTable();
    updateStudentStats();
}

function showAddStudentSection() {
    document.getElementById('allStudentsSection').classList.add('hidden');
    document.getElementById('addStudentSection').classList.remove('hidden');
    resetForm();
    switchTab('personal');
    document.getElementById('formTitle').textContent = 'Add New Student';
    document.getElementById('submitButton').innerHTML = '<i class="fas fa-check-circle mr-2"></i>Register Student';
    document.getElementById('submitButton').onclick = handleAddStudent;
    editingStudentId = null;
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
    
    // Update fee calculations when switching to fees tab
    if (tabName === 'fees') {
        updateFeeCalculations();
    }
}

// Address Toggle Function
function togglePermanentAddress() {
    const sameAsLocal = document.getElementById('sameAsLocal').checked;
    const permanentAddressSection = document.getElementById('permanentAddressSection');
    const inputs = permanentAddressSection.querySelectorAll('input');
    
    if (sameAsLocal) {
        permanentAddressSection.classList.add('opacity-50');
        inputs.forEach(input => {
            input.disabled = true;
            // Don't clear values when in edit mode
            if (!editingStudentId) {
                input.value = '';
            }
        });
    } else {
        permanentAddressSection.classList.remove('opacity-50');
        inputs.forEach(input => {
            input.disabled = false;
        });
    }
}

// Document Upload Functions
function previewDocument(input, previewId) {
    const file = input.files[0];
    if (!file) return;
    
    // Validate file size (2MB limit)
    if (file.size > 2 * 1024 * 1024) {
        Toast.show('File size exceeds 2MB limit', 'error');
        input.value = '';
        return;
    }
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
        Toast.show('Please upload JPG, PNG, or PDF files only', 'error');
        input.value = '';
        return;
    }
    
    const previewElement = document.getElementById(previewId);
    const fileName = file.name;
    
    // Store file data
    uploadedDocuments[input.id] = {
        file: file,
        fileName: fileName,
        fileType: file.type
    };
    
    // Update preview
    if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function(e) {
            previewElement.innerHTML = `
                <div class="h-full w-full relative">
                    <img src="${e.target.result}" class="h-full w-full object-cover rounded-lg" alt="${fileName}">
                    <div class="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 text-xs truncate">
                        ${fileName}
                    </div>
                </div>
            `;
        };
        reader.readAsDataURL(file);
    } else if (file.type === 'application/pdf') {
        previewElement.innerHTML = `
            <div class="h-full w-full flex flex-col items-center justify-center">
                <i class="fas fa-file-pdf text-4xl text-red-500 mb-2"></i>
                <p class="text-sm text-gray-700 text-center truncate max-w-full">${fileName}</p>
                <p class="text-xs text-gray-500">PDF Document</p>
            </div>
        `;
    }
    
    updateDocumentStatus();
    Toast.show(`${fileName} uploaded successfully`, 'success');
}

function removeDocument(inputId, previewId) {
    const input = document.getElementById(inputId);
    const previewElement = document.getElementById(previewId);
    
    // Reset input
    input.value = '';
    
    // Remove from stored documents
    delete uploadedDocuments[inputId];
    
    // Reset preview
    previewElement.innerHTML = `
        <i class="fas fa-cloud-upload-alt text-3xl text-gray-400 mb-2"></i>
        <p class="text-sm text-gray-500 text-center">${getUploadTextForDocument(inputId)}</p>
        <p class="text-xs text-gray-400">${getDocumentDescription(inputId)}</p>
    `;
    
    updateDocumentStatus();
}

function getUploadTextForDocument(inputId) {
    const texts = {
        'studentAadharImage': 'Upload student\'s Aadhar card image',
        'fatherAadharImage': 'Upload father\'s Aadhar card',
        'motherAadharImage': 'Upload mother\'s Aadhar card',
        'birthCertificateImage': 'Upload birth certificate',
        'transferCertificateImage': 'Upload transfer certificate',
        'fatherIncomeCertificateImage': 'Upload father\'s income certificate',
        'castCertificateImage': 'Upload caste certificate'
    };
    return texts[inputId] || 'Upload document';
}

function getDocumentDescription(inputId) {
    const descriptions = {
        'studentAadharImage': 'Front side',
        'fatherAadharImage': 'Front side',
        'motherAadharImage': 'Front side',
        'birthCertificateImage': 'PDF or Image',
        'transferCertificateImage': 'From previous school',
        'fatherIncomeCertificateImage': 'For scholarship/fee concession',
        'castCertificateImage': 'For reservation benefits'
    };
    return descriptions[inputId] || '';
}

function updateDocumentStatus() {
    const statusElement = document.getElementById('documentStatus');
    const uploadedCount = Object.keys(uploadedDocuments).length;
    
    if (uploadedCount === 0) {
        statusElement.innerHTML = 'No documents uploaded yet';
        return;
    }
    
    let html = `<div class="space-y-2">`;
    html += `<div class="text-green-600"><i class="fas fa-check-circle mr-2"></i>${uploadedCount} document(s) uploaded:</div>`;
    html += `<ul class="list-disc list-inside pl-4 text-sm">`;
    
    Object.entries(uploadedDocuments).forEach(([docId, doc]) => {
        const docName = docId.replace('Image', '').replace(/([A-Z])/g, ' $1').trim();
        html += `<li class="truncate">${docName}: ${doc.fileName}</li>`;
    });
    
    html += `</ul></div>`;
    statusElement.innerHTML = html;
}

// Sports "Other" functionality
function toggleOtherSports() {
    const checkbox = document.getElementById('otherSportsCheckbox');
    const container = document.getElementById('otherSportsContainer');
    const display = document.getElementById('otherSportsDisplay');
    
    if (checkbox.checked) {
        container.classList.remove('hidden');
        if (otherSports.length > 0) {
            display.classList.remove('hidden');
        }
    } else {
        container.classList.add('hidden');
        display.classList.add('hidden');
    }
}

function addOtherSports() {
    const input = document.getElementById('otherSportsInput');
    const value = input.value.trim();
    
    if (!value) {
        Toast.show('Please enter sports names', 'error');
        return;
    }
    
    // Split by comma and trim each sport
    const newSports = value.split(',').map(sport => sport.trim()).filter(sport => sport);
    
    // Add unique sports
    newSports.forEach(sport => {
        if (!otherSports.includes(sport.toLowerCase()) && sport) {
            otherSports.push(sport.toLowerCase());
        }
    });
    
    // Update display
    updateOtherSportsDisplay();
    
    // Clear input
    input.value = '';
    Toast.show(`${newSports.length} sport(s) added`, 'success');
}

function updateOtherSportsDisplay() {
    const display = document.getElementById('otherSportsDisplay');
    
    if (otherSports.length === 0) {
        display.classList.add('hidden');
        return;
    }
    
    display.classList.remove('hidden');
    let html = '<div class="flex flex-wrap gap-2 mt-2">';
    
    otherSports.forEach((sport, index) => {
        html += `
            <div class="inline-flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                <span>${sport}</span>
                <button type="button" onclick="removeOtherSport(${index})" class="ml-2 text-red-500 hover:text-red-700">
                    <i class="fas fa-times text-xs"></i>
                </button>
            </div>
        `;
    });
    
    html += '</div>';
    display.innerHTML = html;
}

function removeOtherSport(index) {
    otherSports.splice(index, 1);
    updateOtherSportsDisplay();
}

// Subjects "Other" functionality
function toggleOtherSubjects() {
    const checkbox = document.getElementById('otherSubjectsCheckbox');
    const container = document.getElementById('otherSubjectsContainer');
    const display = document.getElementById('otherSubjectsDisplay');
    
    if (checkbox.checked) {
        container.classList.remove('hidden');
        if (otherSubjects.length > 0) {
            display.classList.remove('hidden');
        }
    } else {
        container.classList.add('hidden');
        display.classList.add('hidden');
    }
}

function addOtherSubjects() {
    const input = document.getElementById('otherSubjectsInput');
    const value = input.value.trim();
    
    if (!value) {
        Toast.show('Please enter subject names', 'error');
        return;
    }
    
    // Split by comma and trim each subject
    const newSubjects = value.split(',').map(subject => subject.trim()).filter(subject => subject);
    
    // Add unique subjects
    newSubjects.forEach(subject => {
        if (!otherSubjects.includes(subject.toLowerCase()) && subject) {
            otherSubjects.push(subject.toLowerCase());
        }
    });
    
    // Update display
    updateOtherSubjectsDisplay();
    
    // Clear input
    input.value = '';
    Toast.show(`${newSubjects.length} subject(s) added`, 'success');
}

function updateOtherSubjectsDisplay() {
    const display = document.getElementById('otherSubjectsDisplay');
    
    if (otherSubjects.length === 0) {
        display.classList.add('hidden');
        return;
    }
    
    display.classList.remove('hidden');
    let html = '<div class="flex flex-wrap gap-2 mt-2">';
    
    otherSubjects.forEach((subject, index) => {
        html += `
            <div class="inline-flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                <span>${subject}</span>
                <button type="button" onclick="removeOtherSubject(${index})" class="ml-2 text-red-500 hover:text-red-700">
                    <i class="fas fa-times text-xs"></i>
                </button>
            </div>
        `;
    });
    
    html += '</div>';
    display.innerHTML = html;
}

function removeOtherSubject(index) {
    otherSubjects.splice(index, 1);
    updateOtherSubjectsDisplay();
}

// Fee Calculations
function updateFeeCalculations() {
    const admission = parseFloat(document.getElementById('admissionFees')?.value || 0);
    const uniform = parseFloat(document.getElementById('uniformFees')?.value || 0);
    const books = parseFloat(document.getElementById('bookFees')?.value || 0);
    const tuition = parseFloat(document.getElementById('tuitionFees')?.value || 0);
    const initialPayment = parseFloat(document.getElementById('initialPayment')?.value || 0);
    
    const baseTotal = admission + uniform + books + tuition;
    const additionalTotal = calculateAdditionalFeesTotal();
    const grandTotal = baseTotal + additionalTotal;
    const balance = grandTotal - initialPayment;
    
    // Update displays
    const totalFeesDisplay = document.getElementById('totalFeesDisplay');
    if (totalFeesDisplay) totalFeesDisplay.textContent = `₹${grandTotal.toLocaleString()}`;
    
    const balanceAmount = document.getElementById('balanceAmount');
    if (balanceAmount) balanceAmount.textContent = `₹${balance.toLocaleString()}`;
    
    // Update summary
    const summaryTotal = document.getElementById('summaryTotal');
    if (summaryTotal) summaryTotal.textContent = `₹${baseTotal.toLocaleString()}`;
    
    const summaryAdditional = document.getElementById('summaryAdditional');
    if (summaryAdditional) summaryAdditional.textContent = `₹${additionalTotal.toLocaleString()}`;
    
    const summaryGrandTotal = document.getElementById('summaryGrandTotal');
    if (summaryGrandTotal) summaryGrandTotal.textContent = `₹${grandTotal.toLocaleString()}`;
    
    const summaryPaid = document.getElementById('summaryPaid');
    if (summaryPaid) summaryPaid.textContent = `₹${initialPayment.toLocaleString()}`;
    
    const summaryPending = document.getElementById('summaryPending');
    if (summaryPending) summaryPending.textContent = `₹${balance.toLocaleString()}`;
    
    const summaryBalance = document.getElementById('summaryBalance');
    if (summaryBalance) summaryBalance.textContent = `₹${balance.toLocaleString()}`;
    
    // Update installment calculation if needed
    if (document.querySelector('input[name="paymentMode"]:checked').value === 'installment') {
        calculateInstallments();
    }
}

function calculateAdditionalFeesTotal() {
    return additionalFees.reduce((total, fee) => total + fee.amount, 0);
}

function addAdditionalFee() {
    const nameInput = document.getElementById('additionalFeeName');
    const amountInput = document.getElementById('additionalFeeAmount');
    const name = nameInput.value.trim();
    const amount = parseFloat(amountInput.value);
    
    if (!name || isNaN(amount) || amount <= 0) {
        Toast.show('Please enter valid fee name and amount', 'error');
        return;
    }
    
    const fee = {
        id: Date.now(),
        name: name,
        amount: amount
    };
    
    additionalFees.push(fee);
    renderAdditionalFeesList();
    updateFeeCalculations();
    
    // Clear inputs
    nameInput.value = '';
    amountInput.value = '';
    nameInput.focus();
}

function removeAdditionalFee(id) {
    additionalFees = additionalFees.filter(fee => fee.id !== id);
    renderAdditionalFeesList();
    updateFeeCalculations();
}

function renderAdditionalFeesList() {
    const container = document.getElementById('additionalFeesList');
    if (!container) return;
    
    if (additionalFees.length === 0) {
        container.innerHTML = '<p class="text-sm text-gray-500">No additional fees added</p>';
        return;
    }
    
    let html = '';
    additionalFees.forEach(fee => {
        html += `
            <div class="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                <div>
                    <span class="font-medium text-sm">${fee.name}</span>
                    <span class="text-sm text-gray-600 ml-2">₹${fee.amount.toLocaleString()}</span>
                </div>
                <button onclick="removeAdditionalFee(${fee.id})" class="text-red-500 hover:text-red-700">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    });
    
    container.innerHTML = html;
    
    // Update additional fees summary
    const additionalTotal = calculateAdditionalFeesTotal();
    const summaryContainer = document.getElementById('additionalFeesSummary');
    if (summaryContainer) {
        if (additionalTotal > 0) {
            summaryContainer.textContent = `Includes additional fees: ₹${additionalTotal.toLocaleString()}`;
        } else {
            summaryContainer.textContent = '';
        }
    }
}

// Installment Calculation
function calculateInstallments() {
    const admission = parseFloat(document.getElementById('admissionFees')?.value || 0);
    const uniform = parseFloat(document.getElementById('uniformFees')?.value || 0);
    const books = parseFloat(document.getElementById('bookFees')?.value || 0);
    const tuition = parseFloat(document.getElementById('tuitionFees')?.value || 0);
    const additionalTotal = calculateAdditionalFeesTotal();
    const totalFees = admission + uniform + books + tuition + additionalTotal;
    const initialPayment = parseFloat(document.getElementById('initialPayment')?.value || 0);
    const balanceAmount = totalFees - initialPayment;
    
    const installmentCount = parseInt(document.getElementById('installmentCount').value);
    const firstInstallmentDate = document.getElementById('firstInstallmentDate').value;
    
    if (!firstInstallmentDate || balanceAmount <= 0) {
        document.getElementById('installmentBreakdown').innerHTML = '<p class="text-sm text-gray-500">No installments needed (fully paid)</p>';
        return;
    }
    
    // Calculate installment amounts
    let installments = [];
    const baseInstallmentAmount = Math.floor(balanceAmount / installmentCount);
    const remainder = balanceAmount % installmentCount;
    
    const startDate = new Date(firstInstallmentDate);
    
    for (let i = 1; i <= installmentCount; i++) {
        const dueDate = new Date(startDate);
        dueDate.setMonth(startDate.getMonth() + (i - 1));
        
        // Last installment gets the remainder
        const amount = (i === installmentCount) ? 
            baseInstallmentAmount + remainder : 
            baseInstallmentAmount;
        
        installments.push({
            installmentNumber: i,
            dueDate: dueDate.toISOString().split('T')[0],
            amount: amount,
            status: 'pending'
        });
    }
    
    // Display installment breakdown
    const breakdownContainer = document.getElementById('installmentBreakdown');
    let html = '';
    
    installments.forEach(installment => {
        const formattedDate = new Date(installment.dueDate).toLocaleDateString('en-IN');
        html += `
            <div class="flex justify-between items-center p-2 border border-gray-200 rounded hover:bg-gray-50">
                <div>
                    <span class="font-medium">Installment ${installment.installmentNumber}</span>
                    <span class="text-sm text-gray-500 ml-2">Due: ${formattedDate}</span>
                </div>
                <span class="font-semibold">₹${installment.amount.toLocaleString()}</span>
            </div>
        `;
    });
    
    breakdownContainer.innerHTML = html;
}

// Installment Handling
function toggleInstallmentOptions() {
    const installmentOptions = document.getElementById('installmentOptions');
    const paymentMode = document.querySelector('input[name="paymentMode"]:checked').value;
    
    if (paymentMode === 'installment') {
        installmentOptions.classList.remove('hidden');
        calculateInstallments();
    } else {
        installmentOptions.classList.add('hidden');
    }
}

// Helper function to calculate due dates
function calculateDueDate(installmentNumber) {
    const firstInstallmentDate = document.getElementById('firstInstallmentDate').value;
    if (!firstInstallmentDate) return null;
    
    const date = new Date(firstInstallmentDate);
    date.setMonth(date.getMonth() + (installmentNumber - 1));
    return date.toISOString().split('T')[0];
}

// Payment Method Change Handler
function handlePaymentMethodChange() {
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
    const qrCodeSection = document.getElementById('qrCodeSection');
    
    if (paymentMethod === 'online') {
        // Show QR code section
        qrCodeSection.classList.remove('hidden');
        
        // Generate QR code based on initial payment amount
        generateQRCode();
    } else {
        // Hide both sections for cash payment
        qrCodeSection.classList.add('hidden');
        transactionVerified = false;
    }
    
    // Reset transaction verification status
    document.getElementById('transactionStatus').innerHTML = '';
    document.getElementById('transactionId').value = '';
}

// Generate QR Code
function generateQRCode() {
    const qrCodeCanvas = document.getElementById('qrCodeCanvas');
    const initialPayment = document.getElementById('initialPayment').value;
    
    // Clear previous QR code
    qrCodeCanvas.innerHTML = '';
    
    // Update QR code amount display
    document.getElementById('qrAmount').textContent = `₹${parseInt(initialPayment).toLocaleString()}`;
    
    // Generate payment details for QR code
    const paymentData = {
        account: '123456789012',
        ifsc: 'KUNS0001234',
        amount: initialPayment,
        name: 'Kunash School',
        note: 'Student Fees Payment'
    };
    
    // Create QR code using the qrcode library
    const qr = new QRCode(qrCodeCanvas, {
        text: JSON.stringify(paymentData),
        width: 200,
        height: 200,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });
    
    Toast.show('QR code generated successfully', 'success');
}

// Update payment details
function updatePaymentDetails() {
    // Update QR code if online payment is selected
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked');
    if (paymentMethod && paymentMethod.value === 'online') {
        generateQRCode();
    }
    
    // Update fee calculations
    updateFeeCalculations();
}

// Close QR Code
function closeQRCode() {
    document.getElementById('qrCodeSection').classList.add('hidden');
}

// Mark payment as complete
function markPaymentAsComplete() {
    const transactionIdInput = document.getElementById('transactionId');
    const transactionId = transactionIdInput.value.trim();
    
    if (!transactionId) {
        Toast.show('Please enter transaction ID before marking payment as complete', 'error');
        transactionIdInput.focus();
        return;
    }
    
    // Show verification in progress
    const statusElement = document.getElementById('transactionStatus');
    statusElement.innerHTML = '<div class="flex items-center text-yellow-600"><i class="fas fa-spinner fa-spin mr-2"></i> Verifying transaction...</div>';
    
    // Simulate verification process
    setTimeout(() => {
        if (transactionId.length >= 8) {
            statusElement.innerHTML = '<div class="flex items-center text-green-600"><i class="fas fa-check-circle mr-2"></i> Transaction verified successfully!</div>';
            transactionVerified = true;
            Toast.show('Transaction verified successfully!', 'success');
        } else {
            statusElement.innerHTML = '<div class="flex items-center text-red-600"><i class="fas fa-times-circle mr-2"></i> Invalid transaction ID. Please check and try again.</div>';
            transactionVerified = false;
            Toast.show('Invalid transaction ID', 'error');
        }
    }, 1500);
}

// Verify Transaction ID
function verifyTransactionId() {
    markPaymentAsComplete();
}

// Student Management
function renderStudentsTable() {
    const tbody = document.getElementById('studentTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    const filtered = getFilteredStudents();
    const startIndex = (appState.currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const pageStudents = filtered.slice(startIndex, endIndex);
    
    if (pageStudents.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="6" class="px-6 py-12 text-center">
                <i class="fas fa-user-graduate text-4xl text-gray-300 mb-3"></i>
                <p class="text-lg text-gray-600">No students found</p>
                <p class="text-sm text-gray-500 mt-2">Try adjusting your search criteria</p>
            </td>
        `;
        tbody.appendChild(row);
    } else {
        pageStudents.forEach(student => {
            const feeStatus = getFeeStatusBadge(student.fees);
            
            const row = document.createElement('tr');
            row.className = 'hover:bg-gray-50 transition-colors duration-150';
            row.innerHTML = `
                <td class="px-4 lg:px-6 py-4">
                    <input type="checkbox" class="student-checkbox rounded border-gray-300" data-id="${student.id}">
                </td>
                <td class="px-4 lg:px-6 py-4">
                    <div class="flex items-center space-x-3">
                        <div class="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                            ${student.photo ? 
                                `<img src="${student.photo}" class="h-full w-full rounded-full object-cover" alt="${student.fullName}">` :
                                `<i class="fas fa-user-graduate text-blue-600"></i>`
                            }
                        </div>
                        <div>
                            <div class="font-medium text-gray-900">${student.fullName}</div>
                            <div class="text-sm text-gray-500">${student.studentId} • ${student.gender}, ${calculateAge(student.dob)} years</div>
                        </div>
                    </div>
                </td>
                <td class="px-4 lg:px-6 py-4">
                    <div class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        <i class="fas fa-graduation-cap mr-1"></i>
                        Class ${student.class} - ${student.section}
                    </div>
                    <div class="text-xs text-gray-500 mt-1">Roll No: ${student.rollNumber}</div>
                </td>
                <td class="px-4 lg:px-6 py-4">
                    <div class="text-sm text-gray-900">${student.fatherName}</div>
                    <div class="text-sm text-gray-500">${student.fatherContact}</div>
                </td>
                <td class="px-4 lg:px-6 py-4">
                    ${feeStatus}
                    <div class="text-xs text-gray-500 mt-1">
                        Paid: ₹${student.fees.paid.toLocaleString()} / Total: ₹${student.fees.total.toLocaleString()}
                    </div>
                    ${student.fees.paymentMode === 'installment' && student.fees.installments?.length > 0 ? 
                        `<div class="text-xs text-gray-500">${student.fees.installments.length} installments</div>` : ''}
                </td>
                <td class="px-4 lg:px-6 py-4">
                    <div class="flex items-center space-x-2">
                        <button onclick="viewStudent(${student.id})" class="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors duration-200" title="View">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button onclick="editStudent(${student.id})" class="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors duration-200" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="deleteStudent(${student.id})" class="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors duration-200" title="Delete">
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

function getFeeStatusBadge(fees) {
    if (fees.pending === 0) {
        return '<span class="status-badge status-paid">Paid</span>';
    } else if (fees.paid === 0) {
        return '<span class="status-badge status-pending">Pending</span>';
    } else {
        return '<span class="status-badge status-partial">Partial</span>';
    }
}

function getFilteredStudents() {
    const searchTerm = document.getElementById('searchStudent')?.value.toLowerCase() || '';
    const filterClass = document.getElementById('filterClass')?.value || '';
    const filterFeeStatus = document.getElementById('filterFeeStatus')?.value || '';
    const filterStudentStatus = document.getElementById('filterStudentStatus')?.value || '';
    
    return appState.students.filter(student => {
        // Search filter
        const matchesSearch = !searchTerm || 
            student.fullName.toLowerCase().includes(searchTerm) ||
            student.studentId.toLowerCase().includes(searchTerm) ||
            student.fatherName.toLowerCase().includes(searchTerm) ||
            (student.motherName && student.motherName.toLowerCase().includes(searchTerm));
        
        // Class filter
        const matchesClass = !filterClass || student.class === filterClass;
        
        // Fee status filter
        let matchesFeeStatus = true;
        if (filterFeeStatus === 'paid') {
            matchesFeeStatus = student.fees.pending === 0;
        } else if (filterFeeStatus === 'pending') {
            matchesFeeStatus = student.fees.pending > 0 && student.fees.paid === 0;
        } else if (filterFeeStatus === 'partial') {
            matchesFeeStatus = student.fees.pending > 0 && student.fees.paid > 0;
        }
        
        // Student status filter
        const matchesStudentStatus = !filterStudentStatus || student.status === filterStudentStatus;
        
        return matchesSearch && matchesClass && matchesFeeStatus && matchesStudentStatus;
    });
}

function filterStudents() {
    appState.currentPage = 1;
    renderStudentsTable();
    updateStudentStats();
}

function updateStudentStats() {
    const filtered = getFilteredStudents();
    
    const totalCount = document.getElementById('totalStudentsCount');
    if (totalCount) totalCount.textContent = filtered.length;
    
    const activeStudents = filtered.filter(s => s.status === 'Active').length;
    const activeCount = document.getElementById('activeStudentsCount');
    if (activeCount) activeCount.textContent = activeStudents;
    
    const totalPending = filtered.reduce((sum, student) => sum + (student.fees?.pending || 0), 0);
    const pendingCount = document.getElementById('pendingFeesCount');
    if (pendingCount) pendingCount.textContent = `₹${totalPending.toLocaleString()}`;
    
    const avgAttendance = document.getElementById('avgAttendance');
    if (avgAttendance) avgAttendance.textContent = '92%';
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
    renderStudentsTable();
}

function previousPage() {
    if (appState.currentPage > 1) {
        appState.currentPage--;
        renderStudentsTable();
    }
}

function nextPage() {
    const totalPages = Math.ceil(getFilteredStudents().length / ITEMS_PER_PAGE);
    if (appState.currentPage < totalPages) {
        appState.currentPage++;
        renderStudentsTable();
    }
}

// Collect Form Data - UPDATED FOR FIRST/MIDDLE/LAST NAME
function collectFormData() {
    const firstName = document.querySelector('input[name="firstName"]')?.value || '';
    const middleName = document.querySelector('input[name="middleName"]')?.value || '';
    const lastName = document.querySelector('input[name="lastName"]')?.value || '';
    
    // Build full name
    let fullName = firstName;
    if (middleName) fullName += ` ${middleName}`;
    fullName += ` ${lastName}`;
    
    return {
        // Personal Details
        firstName: firstName,
        middleName: middleName,
        lastName: lastName,
        fullName: fullName,
        dob: document.querySelector('input[name="dob"]')?.value || '',
        gender: document.querySelector('select[name="gender"]')?.value || '',
        bloodGroup: document.querySelector('select[name="bloodGroup"]')?.value || '',
        casteCategory: document.querySelector('select[name="casteCategory"]')?.value || '',
        aadharNumber: document.querySelector('input[name="aadharNumber"]')?.value || '',
        previousSchool: document.querySelector('input[name="previousSchool"]')?.value || '',
        medicalInfo: document.querySelector('textarea[name="medicalInfo"]')?.value || '',
        
        // Address Details
        localAddressLine1: document.querySelector('input[name="localAddressLine1"]')?.value || '',
        localAddressLine2: document.querySelector('input[name="localAddressLine2"]')?.value || '',
        localCity: document.querySelector('input[name="localCity"]')?.value || '',
        localState: document.querySelector('input[name="localState"]')?.value || '',
        localPincode: document.querySelector('input[name="localPincode"]')?.value || '',
        
        // Permanent Address
        sameAsLocal: document.getElementById('sameAsLocal')?.checked || false,
        permanentAddressLine1: document.querySelector('input[name="permanentAddressLine1"]')?.value || '',
        permanentAddressLine2: document.querySelector('input[name="permanentAddressLine2"]')?.value || '',
        permanentCity: document.querySelector('input[name="permanentCity"]')?.value || '',
        permanentState: document.querySelector('input[name="permanentState"]')?.value || '',
        permanentPincode: document.querySelector('input[name="permanentPincode"]')?.value || '',
        
        // Academic Details
        class: document.querySelector('select[name="class"]')?.value || '',
        section: document.querySelector('select[name="section"]')?.value || '',
        rollNumber: document.querySelector('input[name="rollNumber"]')?.value || '',
        admissionDate: document.querySelector('input[name="admissionDate"]')?.value || '',
        academicYear: document.querySelector('select[name="academicYear"]')?.value || '',
        classTeacher: document.querySelector('select[name="classTeacher"]')?.value || '',
        
        // Subjects (checkboxes)
        subjects: Array.from(document.querySelectorAll('input[name="subjects[]"]:checked')).map(cb => cb.value),
        
        // Sports (checkboxes)
        sports: Array.from(document.querySelectorAll('input[name="sports[]"]:checked')).map(cb => cb.value),
        
        // Parent Details
        fatherName: document.querySelector('input[name="fatherName"]')?.value || '',
        fatherAadhar: document.querySelector('input[name="fatherAadhar"]')?.value || '',
        fatherContact: document.querySelector('input[name="fatherContact"]')?.value || '',
        fatherOccupation: document.querySelector('input[name="fatherOccupation"]')?.value || '',
        
        motherName: document.querySelector('input[name="motherName"]')?.value || '',
        motherAadhar: document.querySelector('input[name="motherAadhar"]')?.value || '',
        motherContact: document.querySelector('input[name="motherContact"]')?.value || '',
        motherOccupation: document.querySelector('input[name="motherOccupation"]')?.value || '',
        
        parentEmail: document.querySelector('input[name="parentEmail"]')?.value || '',
        relationship: document.querySelector('select[name="relationship"]')?.value || '',
        
        emergencyContactName: document.querySelector('input[name="emergencyContactName"]')?.value || '',
        emergencyContactNumber: document.querySelector('input[name="emergencyContactNumber"]')?.value || '',
        
        // Fees
        admissionFees: parseFloat(document.getElementById('admissionFees')?.value || 0),
        uniformFees: parseFloat(document.getElementById('uniformFees')?.value || 0),
        bookFees: parseFloat(document.getElementById('bookFees')?.value || 0),
        tuitionFees: parseFloat(document.getElementById('tuitionFees')?.value || 0),
        initialPayment: parseFloat(document.getElementById('initialPayment')?.value || 0),
        paymentMode: document.querySelector('input[name="paymentMode"]:checked')?.value || 'one-time',
        paymentMethod: document.querySelector('input[name="paymentMethod"]:checked')?.value || 'cash',
        installmentCount: parseInt(document.getElementById('installmentCount')?.value || 0),
        firstInstallmentDate: document.getElementById('firstInstallmentDate')?.value || '',
        transactionId: document.getElementById('transactionId')?.value || '',
        
        // Documents
        documents: uploadedDocuments,
        
        // Other sports
        otherSports: [...otherSports],
        
        // Other subjects
        otherSubjects: [...otherSubjects]
    };
}

// Validate Form Data - UPDATED FOR NAME VALIDATION
function validateFormData(studentData) {
    const requiredFields = [
        { field: 'firstName', name: 'First Name' },
        { field: 'lastName', name: 'Last Name' },
        { field: 'dob', name: 'Date of Birth' },
        { field: 'gender', name: 'Gender' },
        { field: 'casteCategory', name: 'Caste Category' },
        { field: 'localAddressLine1', name: 'Local Address Line 1' },
        { field: 'localCity', name: 'Local City' },
        { field: 'localState', name: 'Local State' },
        { field: 'localPincode', name: 'Local Pincode' },
        { field: 'class', name: 'Class' },
        { field: 'section', name: 'Section' },
        { field: 'rollNumber', name: 'Roll Number' },
        { field: 'admissionDate', name: 'Admission Date' },
        { field: 'academicYear', name: 'Academic Year' },
        { field: 'fatherName', name: "Father's Name" },
        { field: 'fatherContact', name: "Father's Contact" },
        { field: 'motherName', name: "Mother's Name" },
        { field: 'parentEmail', name: 'Parent Email' },
        { field: 'relationship', name: 'Relationship' },
        { field: 'emergencyContactName', name: 'Emergency Contact Name' },
        { field: 'emergencyContactNumber', name: 'Emergency Contact Number' }
    ];
    
    for (const { field, name } of requiredFields) {
        if (!studentData[field] || studentData[field].toString().trim() === '') {
            Toast.show(`${name} is required`, 'error');
            return false;
        }
    }
    
    // Validate transaction ID for online payments
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
    if (paymentMethod === 'online') {
        const transactionId = document.getElementById('transactionId').value.trim();
        if (!transactionId || transactionId.length < 8) {
            Toast.show('Please enter a valid transaction ID (minimum 8 characters) for online payment', 'error');
            return false;
        }
        
        if (!transactionVerified) {
            Toast.show('Please verify the transaction ID before proceeding', 'error');
            return false;
        }
    }
    
    // Validate phone numbers
    const phoneFields = [
        { field: 'fatherContact', name: "Father's Contact" },
        { field: 'emergencyContactNumber', name: 'Emergency Contact Number' }
    ];
    
    for (const { field, name } of phoneFields) {
        if (studentData[field] && !/^\d{10}$/.test(studentData[field])) {
            Toast.show(`${name} must be 10 digits`, 'error');
            return false;
        }
    }
    
    // Validate email
    if (studentData.parentEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(studentData.parentEmail)) {
        Toast.show('Please enter a valid email address', 'error');
        return false;
    }
    
    // Validate admission date is not in the future
    const admissionDate = new Date(studentData.admissionDate);
    const today = new Date();
    if (admissionDate > today) {
        Toast.show('Admission date cannot be in the future', 'error');
        return false;
    }
    
    // Validate date of birth makes sense (not in future and reasonable age)
    const dob = new Date(studentData.dob);
    if (dob > today) {
        Toast.show('Date of birth cannot be in the future', 'error');
        return false;
    }
    
    const age = today.getFullYear() - dob.getFullYear();
    if (age < 3 || age > 25) {
        Toast.show('Student age should be between 3 and 25 years', 'error');
        return false;
    }
    
    return true;
}

// Add Student Handler - UPDATED FOR NEW FIELDS
function handleAddStudent() {
    console.log('handleAddStudent called');
    
    // Validate online payment transaction
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
    if (paymentMethod === 'online' && !transactionVerified) {
        Toast.show('Please verify the transaction ID before proceeding', 'error');
        return;
    }
    
    // Collect form data
    const studentData = collectFormData();
    if (!studentData) return;
    
    // Validate required fields
    if (!validateFormData(studentData)) return;
    
    // Build addresses
    const localAddress = `${studentData.localAddressLine1}${studentData.localAddressLine2 ? ', ' + studentData.localAddressLine2 : ''}, ${studentData.localCity}, ${studentData.localState} - ${studentData.localPincode}`;
    
    let permanentAddress = localAddress;
    if (!studentData.sameAsLocal && 
        studentData.permanentAddressLine1 && 
        studentData.permanentCity && 
        studentData.permanentState && 
        studentData.permanentPincode) {
        permanentAddress = `${studentData.permanentAddressLine1}${studentData.permanentAddressLine2 ? ', ' + studentData.permanentAddressLine2 : ''}, ${studentData.permanentCity}, ${studentData.permanentState} - ${studentData.permanentPincode}`;
    }
    
    // Calculate fees
    const baseTotal = studentData.admissionFees + studentData.uniformFees + studentData.bookFees + studentData.tuitionFees;
    const additionalTotal = calculateAdditionalFeesTotal();
    const totalFees = baseTotal + additionalTotal;
    
    if (studentData.initialPayment > totalFees) {
        Toast.show('Initial payment cannot exceed total fees', 'error');
        return;
    }
    
    if (studentData.initialPayment < 0) {
        Toast.show('Initial payment cannot be negative', 'error');
        return;
    }
    
    // Calculate installments if payment mode is installment
    let installments = [];
    if (studentData.paymentMode === 'installment' && studentData.initialPayment < totalFees) {
        const balanceAmount = totalFees - studentData.initialPayment;
        const installmentCount = studentData.installmentCount;
        
        if (installmentCount > 0 && studentData.firstInstallmentDate) {
            const baseInstallmentAmount = Math.floor(balanceAmount / installmentCount);
            const remainder = balanceAmount % installmentCount;
            
            for (let i = 1; i <= installmentCount; i++) {
                const dueDate = calculateDueDate(i);
                const amount = (i === installmentCount) ? 
                    baseInstallmentAmount + remainder : 
                    baseInstallmentAmount;
                
                installments.push({
                    installmentNumber: i,
                    amount: amount,
                    dueDate: dueDate,
                    status: 'pending',
                    paidAmount: 0,
                    paymentDate: null
                });
            }
        }
    }
    
    // Combine sports from checkboxes and other sports
    const sportsFromCheckboxes = studentData.sports;
    const allSports = [...sportsFromCheckboxes, ...otherSports];
    
    // Combine subjects from checkboxes and other subjects
    const subjectsFromCheckboxes = studentData.subjects;
    const allSubjects = [...subjectsFromCheckboxes, ...otherSubjects];
    
    // Generate unique student ID
    const studentId = document.getElementById('studentId').value || `STU${appState.studentIdCounter++}`;
    
    // Generate receipt number
    const receiptNumber = `REC${Date.now().toString().slice(-8)}`;
    
    // Create student object
    const newStudent = {
        id: Date.now(),
        studentId: studentId,
        firstName: studentData.firstName,
        middleName: studentData.middleName,
        lastName: studentData.lastName,
        fullName: studentData.fullName,
        dob: studentData.dob,
        gender: studentData.gender,
        bloodGroup: studentData.bloodGroup || '',
        casteCategory: studentData.casteCategory,
        localAddress: localAddress,
        permanentAddress: permanentAddress,
        aadharNumber: studentData.aadharNumber || '',
        previousSchool: studentData.previousSchool || '',
        medicalInfo: studentData.medicalInfo || '',
        sports: allSports,
        otherSports: otherSports,
        class: studentData.class,
        section: studentData.section,
        rollNumber: studentData.rollNumber,
        admissionDate: studentData.admissionDate,
        academicYear: studentData.academicYear,
        classTeacher: studentData.classTeacher || '',
        subjects: allSubjects,
        otherSubjects: otherSubjects,
        fatherName: studentData.fatherName,
        fatherContact: studentData.fatherContact,
        fatherAadhar: studentData.fatherAadhar || '',
        fatherOccupation: studentData.fatherOccupation || '',
        motherName: studentData.motherName,
        motherContact: studentData.motherContact || '',
        motherAadhar: studentData.motherAadhar || '',
        motherOccupation: studentData.motherOccupation || '',
        parentEmail: studentData.parentEmail,
        relationship: studentData.relationship,
        emergencyContactName: studentData.emergencyContactName,
        emergencyContactNumber: studentData.emergencyContactNumber,
        fees: {
            total: totalFees,
            admission: studentData.admissionFees,
            uniform: studentData.uniformFees,
            books: studentData.bookFees,
            tuition: studentData.tuitionFees,
            additional: additionalTotal,
            paid: studentData.initialPayment,
            pending: totalFees - studentData.initialPayment,
            paymentMode: studentData.paymentMode,
            paymentMethod: studentData.paymentMethod,
            transactionId: studentData.transactionId || '',
            installments: installments,
            receiptNumber: receiptNumber,
            initialPaymentDate: new Date().toISOString().split('T')[0]
        },
        status: 'Active',
        createdAt: new Date().toISOString(),
        photo: null,
        documents: uploadedDocuments
    };
    
    console.log('New student object created:', newStudent);
    
    // Add to database
    appState.students.push(newStudent);
    
    // Save data to localStorage
    const saved = saveData();
    
    if (saved) {
        // Generate receipt
        generateReceipt(newStudent, studentData.initialPayment);
        
        // Reset and show success
        resetForm();
        Toast.show(`Student ${newStudent.fullName} registered successfully! Student ID: ${newStudent.studentId}`, 'success');
        
        // Redirect after delay
        setTimeout(() => {
            window.location.href = 'student-management.html';
        }, 2000);
    } else {
        Toast.show('Failed to save student data. Please try again.', 'error');
    }
}

// EDIT STUDENT FUNCTIONALITY - UPDATED FOR FIRST/MIDDLE/LAST NAME
function editStudent(id) {
    editingStudentId = id;
    const student = appState.students.find(s => s.id === id);
    
    if (!student) {
        Toast.show('Student not found', 'error');
        return;
    }
    
    // Show the add student section but in edit mode
    showAddStudentSection();
    
    // Change the form title and button
    document.getElementById('formTitle').textContent = 'Edit Student';
    
    const submitButton = document.getElementById('submitButton');
    if (submitButton) {
        submitButton.innerHTML = '<i class="fas fa-save mr-2"></i>Update Student';
        submitButton.onclick = handleUpdateStudent;
    }
    
    // Split full name into first, middle, last
    const nameParts = student.fullName.split(' ');
    let firstName = '', middleName = '', lastName = '';
    
    if (nameParts.length === 1) {
        firstName = nameParts[0];
    } else if (nameParts.length === 2) {
        firstName = nameParts[0];
        lastName = nameParts[1];
    } else if (nameParts.length >= 3) {
        firstName = nameParts[0];
        lastName = nameParts[nameParts.length - 1];
        middleName = nameParts.slice(1, nameParts.length - 1).join(' ');
    }
    
    // Parse addresses
    const localAddressParts = parseAddress(student.localAddress);
    const permanentAddressParts = parseAddress(student.permanentAddress || student.localAddress);
    
    // Fill Personal Details Tab
    document.querySelector('input[name="firstName"]').value = firstName;
    document.querySelector('input[name="middleName"]').value = middleName;
    document.querySelector('input[name="lastName"]').value = lastName;
    document.querySelector('input[name="dob"]').value = student.dob;
    document.querySelector('select[name="gender"]').value = student.gender;
    document.querySelector('select[name="bloodGroup"]').value = student.bloodGroup || '';
    document.querySelector('select[name="casteCategory"]').value = student.casteCategory;
    document.querySelector('input[name="aadharNumber"]').value = student.aadharNumber || '';
    document.querySelector('input[name="previousSchool"]').value = student.previousSchool || '';
    document.querySelector('textarea[name="medicalInfo"]').value = student.medicalInfo || '';
    
    // Fill Local Address
    document.querySelector('input[name="localAddressLine1"]').value = localAddressParts.line1;
    document.querySelector('input[name="localAddressLine2"]').value = localAddressParts.line2 || '';
    document.querySelector('input[name="localCity"]').value = localAddressParts.city;
    document.querySelector('input[name="localState"]').value = localAddressParts.state;
    document.querySelector('input[name="localPincode"]').value = localAddressParts.pincode;
    
    // Fill Permanent Address
    const sameAsLocal = student.permanentAddress === student.localAddress || !student.permanentAddress;
    document.getElementById('sameAsLocal').checked = sameAsLocal;
    
    if (!sameAsLocal && student.permanentAddress) {
        document.querySelector('input[name="permanentAddressLine1"]').value = permanentAddressParts.line1;
        document.querySelector('input[name="permanentAddressLine2"]').value = permanentAddressParts.line2 || '';
        document.querySelector('input[name="permanentCity"]').value = permanentAddressParts.city;
        document.querySelector('input[name="permanentState"]').value = permanentAddressParts.state;
        document.querySelector('input[name="permanentPincode"]').value = permanentAddressParts.pincode;
    }
    
    togglePermanentAddress();
    
    // Fill Sports checkboxes
    if (Array.isArray(student.sports)) {
        student.sports.forEach(sport => {
            const checkbox = document.querySelector(`input[name="sports[]"][value="${sport.toLowerCase()}"]`);
            if (checkbox) checkbox.checked = true;
        });
    }
    
    // Fill other sports if any
    otherSports = student.otherSports || [];
    updateOtherSportsDisplay();
    
    // Fill Academic Details Tab
    document.querySelector('select[name="class"]').value = student.class;
    document.querySelector('select[name="section"]').value = student.section;
    document.querySelector('input[name="rollNumber"]').value = student.rollNumber;
    document.querySelector('input[name="admissionDate"]').value = student.admissionDate;
    document.querySelector('select[name="academicYear"]').value = student.academicYear;
    document.querySelector('select[name="classTeacher"]').value = student.classTeacher || '';
    
    // Fill Subjects checkboxes
    if (Array.isArray(student.subjects)) {
        student.subjects.forEach(subject => {
            const checkbox = document.querySelector(`input[name="subjects[]"][value="${subject.toLowerCase()}"]`);
            if (checkbox) checkbox.checked = true;
        });
    }
    
    // Fill other subjects if any
    otherSubjects = student.otherSubjects || [];
    updateOtherSubjectsDisplay();
    
    // Fill Parent Details Tab
    document.querySelector('input[name="fatherName"]').value = student.fatherName;
    document.querySelector('input[name="fatherAadhar"]').value = student.fatherAadhar || '';
    document.querySelector('input[name="fatherContact"]').value = student.fatherContact;
    document.querySelector('input[name="fatherOccupation"]').value = student.fatherOccupation || '';
    
    document.querySelector('input[name="motherName"]').value = student.motherName;
    document.querySelector('input[name="motherAadhar"]').value = student.motherAadhar || '';
    document.querySelector('input[name="motherContact"]').value = student.motherContact || '';
    document.querySelector('input[name="motherOccupation"]').value = student.motherOccupation || '';
    
    document.querySelector('input[name="parentEmail"]').value = student.parentEmail;
    document.querySelector('select[name="relationship"]').value = student.relationship;
    
    document.querySelector('input[name="emergencyContactName"]').value = student.emergencyContactName;
    document.querySelector('input[name="emergencyContactNumber"]').value = student.emergencyContactNumber;
    
    // Fill Fees Details Tab
    document.getElementById('admissionFees').value = student.fees.admission;
    document.getElementById('uniformFees').value = student.fees.uniform;
    document.getElementById('bookFees').value = student.fees.books;
    document.getElementById('tuitionFees').value = student.fees.tuition;
    document.getElementById('initialPayment').value = student.fees.paid;
    
    // Set payment mode
    const paymentMode = student.fees.paymentMode || 'one-time';
    document.querySelector(`input[name="paymentMode"][value="${paymentMode}"]`).checked = true;
    toggleInstallmentOptions();
    
    // Set payment method
    const paymentMethod = student.fees.paymentMethod || 'cash';
    document.querySelector(`input[name="paymentMethod"][value="${paymentMethod}"]`).checked = true;
    
    // Set transaction ID if exists
    if (student.fees.transactionId) {
        document.getElementById('transactionId').value = student.fees.transactionId;
        transactionVerified = true;
    }
    
    // Set installment count if applicable
    if (student.fees.paymentMode === 'installment' && student.fees.installments?.length > 0) {
        document.getElementById('installmentCount').value = student.fees.installments.length;
        if (student.fees.installments[0]?.dueDate) {
            document.getElementById('firstInstallmentDate').value = student.fees.installments[0].dueDate;
        }
    }
    
    // Handle additional fees
    additionalFees = [];
    if (student.fees.additional > 0) {
        additionalFees.push({
            id: Date.now(),
            name: 'Additional Fees',
            amount: student.fees.additional
        });
    }
    originalAdditionalFees = [...additionalFees];
    renderAdditionalFeesList();
    
    updateFeeCalculations();
    
    Toast.show('Student data loaded for editing', 'info');
}

// Handle Update Student - UPDATED FOR NEW FIELDS
function handleUpdateStudent() {
    if (!editingStudentId) {
        Toast.show('No student selected for editing', 'error');
        return;
    }
    
    const studentIndex = appState.students.findIndex(s => s.id === editingStudentId);
    if (studentIndex === -1) {
        Toast.show('Student not found', 'error');
        return;
    }
    
    // Validate online payment transaction
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
    if (paymentMethod === 'online' && !transactionVerified) {
        Toast.show('Please verify the transaction ID before proceeding', 'error');
        return;
    }
    
    // Collect form data
    const studentData = collectFormData();
    if (!studentData) return;
    
    // Validate required fields
    if (!validateFormData(studentData)) return;
    
    // Build addresses
    const localAddress = `${studentData.localAddressLine1}${studentData.localAddressLine2 ? ', ' + studentData.localAddressLine2 : ''}, ${studentData.localCity}, ${studentData.localState} - ${studentData.localPincode}`;
    
    let permanentAddress = localAddress;
    if (!studentData.sameAsLocal && 
        studentData.permanentAddressLine1 && 
        studentData.permanentCity && 
        studentData.permanentState && 
        studentData.permanentPincode) {
        permanentAddress = `${studentData.permanentAddressLine1}${studentData.permanentAddressLine2 ? ', ' + studentData.permanentAddressLine2 : ''}, ${studentData.permanentCity}, ${studentData.permanentState} - ${studentData.permanentPincode}`;
    }
    
    // Calculate fees
    const baseTotal = studentData.admissionFees + studentData.uniformFees + studentData.bookFees + studentData.tuitionFees;
    const additionalTotal = calculateAdditionalFeesTotal();
    const totalFees = baseTotal + additionalTotal;
    
    if (studentData.initialPayment > totalFees) {
        Toast.show('Initial payment cannot exceed total fees', 'error');
        return;
    }
    
    if (studentData.initialPayment < 0) {
        Toast.show('Initial payment cannot be negative', 'error');
        return;
    }
    
    // Calculate installments if payment mode is installment
    let installments = [];
    if (studentData.paymentMode === 'installment' && studentData.initialPayment < totalFees) {
        const balanceAmount = totalFees - studentData.initialPayment;
        const installmentCount = studentData.installmentCount;
        
        if (installmentCount > 0 && studentData.firstInstallmentDate) {
            const baseInstallmentAmount = Math.floor(balanceAmount / installmentCount);
            const remainder = balanceAmount % installmentCount;
            
            for (let i = 1; i <= installmentCount; i++) {
                const dueDate = calculateDueDateForEdit(i, studentData.firstInstallmentDate);
                const amount = (i === installmentCount) ? 
                    baseInstallmentAmount + remainder : 
                    baseInstallmentAmount;
                
                installments.push({
                    installmentNumber: i,
                    amount: amount,
                    dueDate: dueDate,
                    status: 'pending',
                    paidAmount: 0,
                    paymentDate: null
                });
            }
        }
    }
    
    // Combine sports from checkboxes and other sports
    const sportsFromCheckboxes = studentData.sports;
    const allSports = [...sportsFromCheckboxes, ...otherSports];
    
    // Combine subjects from checkboxes and other subjects
    const subjectsFromCheckboxes = studentData.subjects;
    const allSubjects = [...subjectsFromCheckboxes, ...otherSubjects];
    
    // Update student object
    const updatedStudent = {
        ...appState.students[studentIndex],
        firstName: studentData.firstName,
        middleName: studentData.middleName,
        lastName: studentData.lastName,
        fullName: studentData.fullName,
        dob: studentData.dob,
        gender: studentData.gender,
        bloodGroup: studentData.bloodGroup || '',
        casteCategory: studentData.casteCategory,
        localAddress: localAddress,
        permanentAddress: permanentAddress,
        aadharNumber: studentData.aadharNumber || '',
        previousSchool: studentData.previousSchool || '',
        medicalInfo: studentData.medicalInfo || '',
        sports: allSports,
        otherSports: otherSports,
        class: studentData.class,
        section: studentData.section,
        rollNumber: studentData.rollNumber,
        admissionDate: studentData.admissionDate,
        academicYear: studentData.academicYear,
        classTeacher: studentData.classTeacher || '',
        subjects: allSubjects,
        otherSubjects: otherSubjects,
        fatherName: studentData.fatherName,
        fatherContact: studentData.fatherContact,
        fatherAadhar: studentData.fatherAadhar || '',
        fatherOccupation: studentData.fatherOccupation || '',
        motherName: studentData.motherName,
        motherContact: studentData.motherContact || '',
        motherAadhar: studentData.motherAadhar || '',
        motherOccupation: studentData.motherOccupation || '',
        parentEmail: studentData.parentEmail,
        relationship: studentData.relationship,
        emergencyContactName: studentData.emergencyContactName,
        emergencyContactNumber: studentData.emergencyContactNumber,
        fees: {
            ...appState.students[studentIndex].fees,
            total: totalFees,
            admission: studentData.admissionFees,
            uniform: studentData.uniformFees,
            books: studentData.bookFees,
            tuition: studentData.tuitionFees,
            additional: additionalTotal,
            paid: studentData.initialPayment,
            pending: totalFees - studentData.initialPayment,
            paymentMode: studentData.paymentMode,
            paymentMethod: studentData.paymentMethod,
            transactionId: studentData.transactionId || '',
            installments: installments
        },
        updatedAt: new Date().toISOString(),
        documents: uploadedDocuments
    };
    
    // Update in array
    appState.students[studentIndex] = updatedStudent;
    
    // Save data
    const saved = saveData();
    
    if (saved) {
        Toast.show(`Student ${updatedStudent.fullName} updated successfully!`, 'success');
        
        // Redirect after delay
        setTimeout(() => {
            window.location.href = 'student-management.html';
        }, 1500);
    } else {
        Toast.show('Failed to update student data. Please try again.', 'error');
    }
}

// Reset Form - UPDATED FOR NEW FIELDS
function resetForm() {
    const form = document.getElementById('addStudentForm');
    if (form) form.reset();
    
    // Reset address checkbox
    document.getElementById('sameAsLocal').checked = false;
    togglePermanentAddress();
    
    // Reset fee inputs to defaults
    document.getElementById('admissionFees').value = '5000';
    document.getElementById('uniformFees').value = '2000';
    document.getElementById('bookFees').value = '3000';
    document.getElementById('tuitionFees').value = '40000';
    document.getElementById('initialPayment').value = '10000';
    
    // Clear additional fees
    additionalFees = [];
    renderAdditionalFeesList();
    
    // Reset payment mode
    document.querySelector('input[name="paymentMode"][value="one-time"]').checked = true;
    toggleInstallmentOptions();
    
    // Reset payment method
    document.querySelector('input[name="paymentMethod"][value="cash"]').checked = true;
    
    // Clear uploaded documents
    uploadedDocuments = {};
    updateDocumentStatus();
    
    // Clear other sports and subjects
    otherSports = [];
    otherSubjects = [];
    updateOtherSportsDisplay();
    updateOtherSubjectsDisplay();
    
    // Reset other checkboxes
    document.getElementById('otherSportsCheckbox').checked = false;
    document.getElementById('otherSubjectsCheckbox').checked = false;
    toggleOtherSports();
    toggleOtherSubjects();
    
    // Reset transaction verification
    transactionVerified = false;
    document.getElementById('transactionStatus').innerHTML = '';
    document.getElementById('transactionId').value = '';
    document.getElementById('qrCodeSection').classList.add('hidden');
    
    // Set default date for first installment
    const today = new Date();
    const firstInstallmentDate = document.getElementById('firstInstallmentDate');
    if (firstInstallmentDate) {
        today.setMonth(today.getMonth() + 1);
        const nextMonth = today.toISOString().split('T')[0];
        firstInstallmentDate.value = nextMonth;
    }
    
    updateFeeCalculations();
    switchTab('personal');
    
    // Reset form title and button if in edit mode
    if (editingStudentId) {
        document.getElementById('formTitle').textContent = 'Add New Student';
        editingStudentId = null;
    }
}

// Utility Functions
function parseAddress(address) {
    if (!address) return { line1: '', line2: '', city: '', state: '', pincode: '' };
    
    // Try to parse the address format: "line1, line2, city, state - pincode"
    const parts = address.split(', ');
    let line1 = parts[0] || '';
    let line2 = '';
    let city = '';
    let state = '';
    let pincode = '';
    
    if (parts.length > 1) {
        // Check if last part has " - " for state-pincode
        const lastPart = parts[parts.length - 1];
        const statePincodeMatch = lastPart.match(/(.+)\s+-\s+(\d+)/);
        
        if (statePincodeMatch) {
            state = statePincodeMatch[1];
            pincode = statePincodeMatch[2];
            // City is the part before state
            if (parts.length > 2) {
                city = parts[parts.length - 2];
                // Line2 is everything between line1 and city
                if (parts.length > 3) {
                    line2 = parts.slice(1, parts.length - 2).join(', ');
                }
            }
        } else {
            // Simple format
            if (parts.length === 2) {
                city = parts[1];
            } else if (parts.length === 3) {
                line2 = parts[1];
                city = parts[2];
            }
        }
    }
    
    return { line1, line2, city, state, pincode };
}

function calculateDueDateForEdit(installmentNumber, firstInstallmentDate) {
    const date = new Date(firstInstallmentDate);
    date.setMonth(date.getMonth() + (installmentNumber - 1));
    return date.toISOString().split('T')[0];
}

// The rest of the functions (deleteStudent, viewStudent, generateReceipt, etc.) remain the same
// but need to be updated to use student.fullName instead of student.name

// Update viewStudent function to show first/middle/last name
function viewStudent(id) {
    const student = appState.students.find(s => s.id === id);
    if (!student) return;
    
    const modal = document.getElementById('viewModalOverlay');
    modal.classList.add('show');
    
    // Build name display
    let nameDisplay = student.firstName;
    if (student.middleName) nameDisplay += ` ${student.middleName}`;
    nameDisplay += ` ${student.lastName}`;
    
    modal.querySelector('.modal-content').innerHTML = `
        <div class="p-6 lg:p-8">
            <div class="flex justify-between items-center mb-6">
                <h3 class="text-xl lg:text-2xl font-bold text-gray-800">Student Details - ${nameDisplay}</h3>
                <button onclick="closeModal('viewModalOverlay')" class="text-gray-500 hover:text-gray-700">
                    <i class="fas fa-times text-2xl"></i>
                </button>
            </div>
            
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <!-- Student Profile -->
                <div class="lg:col-span-1">
                    <div class="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 text-center">
                        <div class="h-32 w-32 bg-white rounded-full mx-auto mb-4 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                            ${student.photo ? 
                                `<img src="${student.photo}" class="h-full w-full object-cover" alt="${student.fullName}">` :
                                `<i class="fas fa-user-graduate text-6xl text-blue-600"></i>`
                            }
                        </div>
                        <h4 class="text-xl font-bold text-gray-800">${nameDisplay}</h4>
                        <p class="text-gray-600">${student.studentId}</p>
                        <div class="mt-4 space-y-2">
                            <div class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                <i class="fas fa-graduation-cap mr-1"></i>
                                Class ${student.class} - ${student.section}
                            </div>
                            <div class="text-sm text-gray-500">Roll No: ${student.rollNumber}</div>
                        </div>
                    </div>
                    
                    <!-- Fee Status -->
                    <div class="mt-6 bg-white rounded-xl border border-gray-200 p-4">
                        <h5 class="font-semibold text-gray-700 mb-3">Fee Status</h5>
                        <div class="space-y-2">
                            <div class="flex justify-between">
                                <span class="text-gray-600">Total Fees:</span>
                                <span class="font-medium">₹${student.fees.total.toLocaleString()}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">Paid Amount:</span>
                                <span class="font-medium text-green-600">₹${student.fees.paid.toLocaleString()}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">Pending Amount:</span>
                                <span class="font-medium text-red-600">₹${student.fees.pending.toLocaleString()}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">Payment Method:</span>
                                <span class="font-medium capitalize">${student.fees.paymentMethod}</span>
                            </div>
                            ${student.fees.transactionId ? `
                            <div class="flex justify-between">
                                <span class="text-gray-600">Transaction ID:</span>
                                <span class="font-medium">${student.fees.transactionId}</span>
                            </div>
                            ` : ''}
                            <div class="pt-2 border-t">
                                <div class="flex justify-between font-bold">
                                    <span>Balance:</span>
                                    <span>₹${student.fees.pending.toLocaleString()}</span>
                                </div>
                            </div>
                            ${student.fees.receiptNumber ? `
                            <div class="pt-2 border-t">
                                <div class="flex justify-between text-sm">
                                    <span class="text-gray-600">Receipt No:</span>
                                    <span class="font-medium">${student.fees.receiptNumber}</span>
                                </div>
                            </div>
                            ` : ''}
                        </div>
                    </div>
                    
                    ${student.fees.installments && student.fees.installments.length > 0 ? `
                    <!-- Installment Details -->
                    <div class="mt-6 bg-white rounded-xl border border-gray-200 p-4">
                        <h5 class="font-semibold text-gray-700 mb-3">Installment Schedule</h5>
                        <div class="space-y-2">
                            ${student.fees.installments.map(installment => {
                                const statusClass = installment.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
                                const paidText = installment.paidAmount > 0 ? ` (Paid: ₹${installment.paidAmount.toLocaleString()})` : '';
                                return `
                                    <div class="flex justify-between items-center p-2 border border-gray-200 rounded">
                                        <div class="flex items-center">
                                            <span class="font-medium mr-3">Installment ${installment.installmentNumber}</span>
                                            <span class="text-xs ${statusClass} px-2 py-1 rounded-full">${installment.status}</span>
                                        </div>
                                        <div class="text-right">
                                            <div class="font-semibold">₹${installment.amount.toLocaleString()}${paidText}</div>
                                            <div class="text-xs text-gray-500">Due: ${new Date(installment.dueDate).toLocaleDateString('en-IN')}</div>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                    ` : ''}
                </div>
                
                <!-- Student Information -->
                <div class="lg:col-span-2">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <!-- Personal Details -->
                        <div class="bg-white rounded-xl border border-gray-200 p-4">
                            <h5 class="font-semibold text-gray-700 mb-3">Personal Details</h5>
                            <div class="space-y-2 text-sm">
                                <div class="flex">
                                    <span class="w-32 text-gray-600">First Name:</span>
                                    <span>${student.firstName}</span>
                                </div>
                                ${student.middleName ? `
                                <div class="flex">
                                    <span class="w-32 text-gray-600">Middle Name:</span>
                                    <span>${student.middleName}</span>
                                </div>
                                ` : ''}
                                <div class="flex">
                                    <span class="w-32 text-gray-600">Last Name:</span>
                                    <span>${student.lastName}</span>
                                </div>
                                <div class="flex">
                                    <span class="w-32 text-gray-600">Date of Birth:</span>
                                    <span>${formatDate(student.dob)} (${calculateAge(student.dob)} years)</span>
                                </div>
                                <div class="flex">
                                    <span class="w-32 text-gray-600">Gender:</span>
                                    <span>${student.gender}</span>
                                </div>
                                <div class="flex">
                                    <span class="w-32 text-gray-600">Blood Group:</span>
                                    <span>${student.bloodGroup || 'N/A'}</span>
                                </div>
                                <div class="flex">
                                    <span class="w-32 text-gray-600">Caste Category:</span>
                                    <span>${student.casteCategory || 'N/A'}</span>
                                </div>
                                <div class="flex">
                                    <span class="w-32 text-gray-600">Aadhar Number:</span>
                                    <span>${student.aadharNumber || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Academic Details -->
                        <div class="bg-white rounded-xl border border-gray-200 p-4">
                            <h5 class="font-semibold text-gray-700 mb-3">Academic Details</h5>
                            <div class="space-y-2 text-sm">
                                <div class="flex">
                                    <span class="w-32 text-gray-600">Admission Date:</span>
                                    <span>${formatDate(student.admissionDate)}</span>
                                </div>
                                <div class="flex">
                                    <span class="w-32 text-gray-600">Academic Year:</span>
                                    <span>${student.academicYear}</span>
                                </div>
                                <div class="flex">
                                    <span class="w-32 text-gray-600">Class Teacher:</span>
                                    <span>${student.classTeacher || 'N/A'}</span>
                                </div>
                                <div class="flex">
                                    <span class="w-32 text-gray-600">Subjects:</span>
                                    <span>${Array.isArray(student.subjects) ? student.subjects.join(', ') : student.subjects || 'N/A'}</span>
                                </div>
                                <div class="flex">
                                    <span class="w-32 text-gray-600">Sports:</span>
                                    <span>${Array.isArray(student.sports) ? student.sports.join(', ') : student.sports || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Parent Details -->
                        <div class="md:col-span-2 bg-white rounded-xl border border-gray-200 p-4">
                            <h5 class="font-semibold text-gray-700 mb-3">Parent/Guardian Details</h5>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div class="space-y-2 text-sm">
                                    <h6 class="font-medium text-blue-600">Father's Details</h6>
                                    <div class="flex">
                                        <span class="w-32 text-gray-600">Name:</span>
                                        <span>${student.fatherName}</span>
                                    </div>
                                    <div class="flex">
                                        <span class="w-32 text-gray-600">Contact:</span>
                                        <span>${student.fatherContact}</span>
                                    </div>
                                    <div class="flex">
                                        <span class="w-32 text-gray-600">Aadhar:</span>
                                        <span>${student.fatherAadhar || 'N/A'}</span>
                                    </div>
                                    <div class="flex">
                                        <span class="w-32 text-gray-600">Occupation:</span>
                                        <span>${student.fatherOccupation || 'N/A'}</span>
                                    </div>
                                </div>
                                <div class="space-y-2 text-sm">
                                    <h6 class="font-medium text-pink-600">Mother's Details</h6>
                                    <div class="flex">
                                        <span class="w-32 text-gray-600">Name:</span>
                                        <span>${student.motherName}</span>
                                    </div>
                                    <div class="flex">
                                        <span class="w-32 text-gray-600">Contact:</span>
                                        <span>${student.motherContact || 'N/A'}</span>
                                    </div>
                                    <div class="flex">
                                        <span class="w-32 text-gray-600">Aadhar:</span>
                                        <span>${student.motherAadhar || 'N/A'}</span>
                                    </div>
                                    <div class="flex">
                                        <span class="w-32 text-gray-600">Occupation:</span>
                                        <span>${student.motherOccupation || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>
                            <div class="mt-4 pt-4 border-t">
                                <div class="space-y-2 text-sm">
                                    <div class="flex">
                                        <span class="w-32 text-gray-600">Primary Email:</span>
                                        <span>${student.parentEmail}</span>
                                    </div>
                                    <div class="flex">
                                        <span class="w-32 text-gray-600">Relationship:</span>
                                        <span>${student.relationship}</span>
                                    </div>
                                    <div class="flex">
                                        <span class="w-32 text-gray-600">Emergency Contact:</span>
                                        <span>${student.emergencyContactName} - ${student.emergencyContactNumber}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Addresses -->
                        <div class="md:col-span-2 bg-white rounded-xl border border-gray-200 p-4">
                            <h5 class="font-semibold text-gray-700 mb-3">Addresses</h5>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <h6 class="font-medium text-blue-600 mb-2">Local Address</h6>
                                    <p class="text-sm">${student.localAddress || 'N/A'}</p>
                                </div>
                                <div>
                                    <h6 class="font-medium text-green-600 mb-2">Permanent Address</h6>
                                    <p class="text-sm">${student.permanentAddress || student.localAddress || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Medical Information -->
                        <div class="md:col-span-2 bg-white rounded-xl border border-gray-200 p-4">
                            <h5 class="font-semibold text-gray-700 mb-3">Medical Information</h5>
                            <p class="text-sm">${student.medicalInfo || 'No medical conditions reported'}</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="flex flex-col lg:flex-row justify-end space-y-4 lg:space-y-0 lg:space-x-4 mt-8 pt-6 border-t border-gray-200">
                <button onclick="editStudent(${student.id})" class="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium">
                    <i class="fas fa-edit mr-2"></i>Edit Student
                </button>
                <button onclick="printStudentDetails(${student.id})" class="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium">
                    <i class="fas fa-print mr-2"></i>Print Details
                </button>
                <button onclick="viewReceipt(${student.id})" class="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-medium">
                    <i class="fas fa-receipt mr-2"></i>View Receipt
                </button>
            </div>
        </div>
    `;
}

// Delete Student function (unchanged except using fullName)
function deleteStudent(id) {
    const student = appState.students.find(s => s.id === id);
    if (!student) {
        Toast.show('Student not found', 'error');
        return;
    }
    
    const confirmationHtml = `
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white rounded-xl p-6 max-w-md w-full mx-4">
                <div class="flex items-center mb-4">
                    <div class="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                        <i class="fas fa-exclamation-triangle text-red-600 text-xl"></i>
                    </div>
                    <div>
                        <h3 class="text-lg font-bold text-gray-800">Confirm Deletion</h3>
                        <p class="text-sm text-gray-600">Are you sure you want to delete this student?</p>
                    </div>
                </div>
                
                <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <div class="flex items-center">
                        <div class="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                            <i class="fas fa-user-graduate text-red-600"></i>
                        </div>
                        <div>
                            <p class="font-medium text-gray-800">${student.fullName}</p>
                            <p class="text-sm text-gray-600">${student.studentId} • Class ${student.class}${student.section}</p>
                        </div>
                    </div>
                </div>
                
                <p class="text-sm text-gray-600 mb-6">This action cannot be undone. All student data including fees and academic records will be permanently deleted.</p>
                
                <div class="flex justify-end space-x-3">
                    <button onclick="closeDeleteConfirmation()" class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium">
                        Cancel
                    </button>
                    <button onclick="confirmDelete(${id})" class="px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg hover:from-red-700 hover:to-pink-700 transition-all duration-200 font-medium">
                        <i class="fas fa-trash mr-2"></i>Delete Student
                    </button>
                </div>
            </div>
        </div>
    `;
    
    const modal = document.createElement('div');
    modal.innerHTML = confirmationHtml;
    modal.id = 'deleteConfirmationModal';
    document.body.appendChild(modal);
}

function closeDeleteConfirmation() {
    const modal = document.getElementById('deleteConfirmationModal');
    if (modal) {
        modal.remove();
    }
}

function confirmDelete(id) {
    const student = appState.students.find(s => s.id === id);
    if (student) {
        appState.students = appState.students.filter(s => s.id !== id);
        const saved = saveData();
        if (saved) {
            renderStudentsTable();
            updateStudentStats();
            closeDeleteConfirmation();
            Toast.show(`Student ${student.fullName} deleted successfully`, 'success');
        }
    }
}

// Receipt Generation (updated for new fields)
function generateReceipt(student, amountPaid) {
    // Create receipt HTML
    const receiptHTML = `
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div class="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div class="p-6 lg:p-8">
                    <div class="flex justify-between items-center mb-6 border-b pb-4">
                        <div>
                            <h3 class="text-xl lg:text-2xl font-bold text-gray-800">Payment Receipt</h3>
                            <p class="text-sm text-gray-600">Receipt No: ${student.fees.receiptNumber}</p>
                        </div>
                        <button onclick="closeReceipt()" class="text-gray-500 hover:text-gray-700">
                            <i class="fas fa-times text-2xl"></i>
                        </button>
                    </div>
                    
                    <!-- School Header -->
                    <div class="text-center mb-6">
                        <h2 class="text-2xl font-bold text-blue-800">Kunash School</h2>
                        <p class="text-gray-600">123 School Street, Pune, Maharashtra - 411001</p>
                        <p class="text-gray-600">Phone: 020-12345678 | Email: info@kunashschool.edu</p>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <!-- Student Details -->
                        <div class="bg-gray-50 rounded-lg p-4">
                            <h4 class="font-semibold text-gray-700 mb-3 border-b pb-2">Student Details</h4>
                            <div class="space-y-2 text-sm">
                                <div class="flex">
                                    <span class="w-32 text-gray-600">Name:</span>
                                    <span class="font-medium">${student.fullName}</span>
                                </div>
                                <div class="flex">
                                    <span class="w-32 text-gray-600">Student ID:</span>
                                    <span>${student.studentId}</span>
                                </div>
                                <div class="flex">
                                    <span class="w-32 text-gray-600">Class:</span>
                                    <span>${student.class} - ${student.section}</span>
                                </div>
                                <div class="flex">
                                    <span class="w-32 text-gray-600">Roll No:</span>
                                    <span>${student.rollNumber}</span>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Payment Details -->
                        <div class="bg-gray-50 rounded-lg p-4">
                            <h4 class="font-semibold text-gray-700 mb-3 border-b pb-2">Payment Details</h4>
                            <div class="space-y-2 text-sm">
                                <div class="flex">
                                    <span class="w-32 text-gray-600">Receipt No:</span>
                                    <span class="font-medium">${student.fees.receiptNumber}</span>
                                </div>
                                <div class="flex">
                                    <span class="w-32 text-gray-600">Date:</span>
                                    <span>${new Date().toLocaleDateString('en-IN')}</span>
                                </div>
                                <div class="flex">
                                    <span class="w-32 text-gray-600">Payment Mode:</span>
                                    <span class="capitalize">${student.fees.paymentMode}</span>
                                </div>
                                <div class="flex">
                                    <span class="w-32 text-gray-600">Method:</span>
                                    <span class="capitalize">${student.fees.paymentMethod}</span>
                                </div>
                                ${student.fees.transactionId ? `
                                <div class="flex">
                                    <span class="w-32 text-gray-600">Transaction ID:</span>
                                    <span class="font-medium">${student.fees.transactionId}</span>
                                </div>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                    
                    <!-- Fee Breakdown -->
                    <div class="bg-white border border-gray-200 rounded-lg p-4 mb-6">
                        <h4 class="font-semibold text-gray-700 mb-3">Fee Breakdown</h4>
                        <div class="space-y-2">
                            <div class="flex justify-between">
                                <span class="text-gray-600">Admission Fees:</span>
                                <span>₹${student.fees.admission.toLocaleString()}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">Uniform Fees:</span>
                                <span>₹${student.fees.uniform.toLocaleString()}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">Book & Stationery:</span>
                                <span>₹${student.fees.books.toLocaleString()}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">Tuition Fees:</span>
                                <span>₹${student.fees.tuition.toLocaleString()}</span>
                            </div>
                            ${student.fees.additional > 0 ? `
                            <div class="flex justify-between">
                                <span class="text-gray-600">Additional Fees:</span>
                                <span>₹${student.fees.additional.toLocaleString()}</span>
                            </div>
                            ` : ''}
                            <div class="flex justify-between pt-2 border-t border-gray-200 font-bold">
                                <span>Total Annual Fees:</span>
                                <span>₹${student.fees.total.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Payment Summary -->
                    <div class="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6 mb-6">
                        <h4 class="font-semibold text-blue-800 mb-4">Payment Summary</h4>
                        <div class="space-y-3">
                            <div class="flex justify-between">
                                <span class="text-gray-700">Total Fees:</span>
                                <span class="font-medium">₹${student.fees.total.toLocaleString()}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-700">Amount Paid:</span>
                                <span class="font-medium text-green-600">₹${amountPaid.toLocaleString()}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-700">Balance Amount:</span>
                                <span class="font-medium text-red-600">₹${student.fees.pending.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                    
                    ${student.fees.paymentMode === 'installment' && student.fees.installments.length > 0 ? `
                    <!-- Installment Schedule -->
                    <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
                        <h4 class="font-semibold text-yellow-800 mb-4">Installment Schedule</h4>
                        <div class="space-y-2">
                            ${student.fees.installments.map(installment => `
                                <div class="flex justify-between items-center p-2 bg-white rounded border border-yellow-100">
                                    <div>
                                        <span class="font-medium">Installment ${installment.installmentNumber}</span>
                                        <span class="text-sm text-gray-500 ml-2">Due: ${new Date(installment.dueDate).toLocaleDateString('en-IN')}</span>
                                    </div>
                                    <span class="font-semibold">₹${installment.amount.toLocaleString()}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    ` : ''}
                    
                    <!-- Authorization -->
                    <div class="text-center mt-8 pt-6 border-t border-gray-200">
                        <div class="mb-4">
                            <p class="text-sm text-gray-600">Authorized Signature</p>
                        </div>
                        <div class="flex justify-between items-center">
                            <div class="text-left">
                                <p class="text-sm font-medium text-gray-700">School Stamp</p>
                            </div>
                            <div class="text-right">
                                <p class="text-sm font-medium text-gray-700">Accounts Department</p>
                                <p class="text-xs text-gray-500">Kunash School</p>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Action Buttons -->
                    <div class="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4 mt-8 pt-6 border-t border-gray-200">
                        <button onclick="printReceipt()" class="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium">
                            <i class="fas fa-print mr-2"></i>Print Receipt
                        </button>
                        <button onclick="closeReceipt()" class="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium">
                            <i class="fas fa-check mr-2"></i>Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add receipt to DOM
    const receiptDiv = document.createElement('div');
    receiptDiv.id = 'paymentReceipt';
    receiptDiv.innerHTML = receiptHTML;
    document.body.appendChild(receiptDiv);
}

function closeReceipt() {
    const receipt = document.getElementById('paymentReceipt');
    if (receipt) {
        receipt.remove();
    }
}

function printReceipt() {
    const receipt = document.getElementById('paymentReceipt');
    if (receipt) {
        const printContent = receipt.querySelector('div.bg-white').outerHTML;
        const originalContent = document.body.innerHTML;
        
        document.body.innerHTML = printContent;
        window.print();
        document.body.innerHTML = originalContent;
        
        // Re-add the receipt to DOM
        const receiptDiv = document.createElement('div');
        receiptDiv.id = 'paymentReceipt';
        receiptDiv.innerHTML = receipt;
        document.body.appendChild(receiptDiv);
    }
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

function exportStudents() {
    Toast.show('Export functionality will be implemented here', 'info');
}

function printStudentDetails(id) {
    Toast.show('Print functionality will be implemented here', 'info');
}

function viewReceipt(id) {
    const student = appState.students.find(s => s.id === id);
    if (!student) return;
    
    generateReceipt(student, student.fees.paid);
}
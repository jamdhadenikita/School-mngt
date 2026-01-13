 
        // Initialize application
        document.addEventListener('DOMContentLoaded', function() {
            checkSession();
            setupEventListeners();
            setupResponsiveSidebar();
            loadInitialData();
            calculateTotalFees();
            
            // Check URL parameters to show appropriate section
            const urlParams = new URLSearchParams(window.location.search);
            const action = urlParams.get('action');
            
            if (action === 'add') {
                showAddStudentSection();
            } else {
                showAllStudentsSection();
            }
            
            // Set default date for first installment
            const today = new Date();
            const firstInstallmentDate = document.getElementById('firstInstallmentDate');
            if (firstInstallmentDate) {
                today.setMonth(today.getMonth() + 1);
                firstInstallmentDate.valueAsDate = today;
            }
        });
        
        // Global variables
        let sidebarCollapsed = false;
        let isMobile = window.innerWidth < 1024;
        let additionalFees = [];
        
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
                const parsedData = JSON.parse(savedData);
                appState.students = parsedData.students || [];
                appState.studentIdCounter = parsedData.studentIdCounter || 1001;
            } else {
                appState.students = generateSampleStudents();
                saveData();
            }
            renderStudentsTable();
            updateStudentStats();
        }
        
        function saveData() {
            localStorage.setItem(SCHOOL_DATA_KEY, JSON.stringify({
                students: appState.students,
                studentIdCounter: appState.studentIdCounter
            }));
        }
        
        function generateSampleStudents() {
            return [
                {
                    id: 1,
                    studentId: 'STU1001',
                    name: 'Rahul Sharma',
                    dob: '2010-05-15',
                    gender: 'Male',
                    bloodGroup: 'A+',
                    casteCategory: 'General',
                    address: '123 Main Street, Pimpri, Pune - 411017',
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
                        paymentMode: 'installment'
                    },
                    status: 'Active',
                    createdAt: '2023-06-01T10:30:00Z'
                },
                {
                    id: 2,
                    studentId: 'STU1002',
                    name: 'Priya Patel',
                    dob: '2011-08-22',
                    gender: 'Female',
                    bloodGroup: 'B+',
                    casteCategory: 'OBC',
                    address: '456 Park Avenue, Chinchwad, Pune - 411033',
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
                        paymentMode: 'one-time'
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
            const feeInputs = ['admissionFees', 'uniformFees', 'bookFees', 'tuitionFees', 'initialPayment'];
            feeInputs.forEach(id => {
                const element = document.getElementById(id);
                if (element) {
                    element.addEventListener('input', calculateTotalFees);
                }
            });
            
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
                calculateTotalFees();
            }
        }
        
        // Fee Calculations
        function calculateTotalFees() {
            const admission = parseFloat(document.getElementById('admissionFees')?.value || 0);
            const uniform = parseFloat(document.getElementById('uniformFees')?.value || 0);
            const books = parseFloat(document.getElementById('bookFees')?.value || 0);
            const tuition = parseFloat(document.getElementById('tuitionFees')?.value || 0);
            
            const baseTotal = admission + uniform + books + tuition;
            const additionalTotal = calculateAdditionalFeesTotal();
            const grandTotal = baseTotal + additionalTotal;
            
            // Update displays
            const totalFeesDisplay = document.getElementById('totalFeesDisplay');
            if (totalFeesDisplay) totalFeesDisplay.textContent = `₹${grandTotal.toLocaleString()}`;
            
            updatePaymentSummary();
            
            // Update summary
            const summaryTotal = document.getElementById('summaryTotal');
            if (summaryTotal) summaryTotal.textContent = `₹${baseTotal.toLocaleString()}`;
            
            const summaryAdditional = document.getElementById('summaryAdditional');
            if (summaryAdditional) summaryAdditional.textContent = `₹${additionalTotal.toLocaleString()}`;
            
            const summaryGrandTotal = document.getElementById('summaryGrandTotal');
            if (summaryGrandTotal) summaryGrandTotal.textContent = `₹${grandTotal.toLocaleString()}`;
            
            return grandTotal;
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
            calculateTotalFees();
            
            // Clear inputs
            nameInput.value = '';
            amountInput.value = '';
            nameInput.focus();
        }
        
        function removeAdditionalFee(id) {
            additionalFees = additionalFees.filter(fee => fee.id !== id);
            renderAdditionalFeesList();
            calculateTotalFees();
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
                summaryContainer.textContent = `Includes additional fees: ₹${additionalTotal.toLocaleString()}`;
            }
        }
        
        function updatePaymentSummary() {
            const initialPayment = parseFloat(document.getElementById('initialPayment')?.value || 0);
            const totalFees = calculateTotalFees();
            const balance = totalFees - initialPayment;
            
            // Update balance amount
            const balanceAmount = document.getElementById('balanceAmount');
            if (balanceAmount) balanceAmount.textContent = `₹${balance.toLocaleString()}`;
            
            // Update summary
            const summaryPaid = document.getElementById('summaryPaid');
            if (summaryPaid) summaryPaid.textContent = `₹${initialPayment.toLocaleString()}`;
            
            const summaryPending = document.getElementById('summaryPending');
            if (summaryPending) summaryPending.textContent = `₹${balance.toLocaleString()}`;
            
            const summaryBalance = document.getElementById('summaryBalance');
            if (summaryBalance) summaryBalance.textContent = `₹${balance.toLocaleString()}`;
            
            return { totalFees, initialPayment, balance };
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
        
        function calculateInstallments() {
            const totalFees = calculateTotalFees();
            const installmentCount = parseInt(document.getElementById('installmentCount').value);
            const firstInstallmentDate = document.getElementById('firstInstallmentDate').value;
            
            if (!firstInstallmentDate) {
                Toast.show('Please select first installment date', 'error');
                return;
            }
            
            const installmentAmount = Math.ceil(totalFees / installmentCount);
            const lastInstallmentAmount = totalFees - (installmentAmount * (installmentCount - 1));
            
            const breakdownContainer = document.getElementById('installmentBreakdown');
            let html = '';
            
            const startDate = new Date(firstInstallmentDate);
            
            for (let i = 1; i <= installmentCount; i++) {
                const dueDate = new Date(startDate);
                dueDate.setMonth(startDate.getMonth() + (i - 1));
                
                const amount = i === installmentCount ? lastInstallmentAmount : installmentAmount;
                
                html += `
                    <div class="flex justify-between items-center p-2 border border-gray-200 rounded hover:bg-gray-50">
                        <div>
                            <span class="font-medium">Installment ${i}</span>
                            <span class="text-sm text-gray-500 ml-2">Due: ${dueDate.toLocaleDateString('en-IN')}</span>
                        </div>
                        <span class="font-semibold">₹${amount.toLocaleString()}</span>
                    </div>
                `;
            }
            
            breakdownContainer.innerHTML = html;
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
                                        `<img src="${student.photo}" class="h-full w-full rounded-full object-cover" alt="${student.name}">` :
                                        `<i class="fas fa-user-graduate text-blue-600"></i>`
                                    }
                                </div>
                                <div>
                                    <div class="font-medium text-gray-900">${student.name}</div>
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
                    student.name.toLowerCase().includes(searchTerm) ||
                    student.studentId.toLowerCase().includes(searchTerm) ||
                    student.fatherName.toLowerCase().includes(searchTerm) ||
                    student.motherName.toLowerCase().includes(searchTerm);
                
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
        
        // Student CRUD Operations
        function viewStudent(id) {
            const student = appState.students.find(s => s.id === id);
            if (!student) return;
            
            const modal = document.getElementById('viewModalOverlay');
            modal.classList.add('show');
            
            modal.querySelector('.modal-content').innerHTML = `
                <div class="p-6 lg:p-8">
                    <div class="flex justify-between items-center mb-6">
                        <h3 class="text-xl lg:text-2xl font-bold text-gray-800">Student Details - ${student.name}</h3>
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
                                        `<img src="${student.photo}" class="h-full w-full object-cover" alt="${student.name}">` :
                                        `<i class="fas fa-user-graduate text-6xl text-blue-600"></i>`
                                    }
                                </div>
                                <h4 class="text-xl font-bold text-gray-800">${student.name}</h4>
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
                                    <div class="pt-2 border-t">
                                        <div class="flex justify-between font-bold">
                                            <span>Balance:</span>
                                            <span>₹${student.fees.pending.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Student Information -->
                        <div class="lg:col-span-2">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <!-- Personal Details -->
                                <div class="bg-white rounded-xl border border-gray-200 p-4">
                                    <h5 class="font-semibold text-gray-700 mb-3">Personal Details</h5>
                                    <div class="space-y-2 text-sm">
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
                                
                                <!-- Address -->
                                <div class="md:col-span-2 bg-white rounded-xl border border-gray-200 p-4">
                                    <h5 class="font-semibold text-gray-700 mb-3">Address</h5>
                                    <p class="text-sm">${student.address}</p>
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
                    </div>
                </div>
            `;
        }
        
        function editStudent(id) {
            const student = appState.students.find(s => s.id === id);
            if (!student) return;
            
            const modal = document.getElementById('editModalOverlay');
            modal.classList.add('show');
            
            modal.querySelector('.modal-content').innerHTML = `
                <div class="p-6 lg:p-8">
                    <div class="flex justify-between items-center mb-6">
                        <h3 class="text-xl lg:text-2xl font-bold text-gray-800">Edit Student - ${student.name}</h3>
                        <button onclick="closeModal('editModalOverlay')" class="text-gray-500 hover:text-gray-700">
                            <i class="fas fa-times text-2xl"></i>
                        </button>
                    </div>
                    
                    <!-- Edit form will be loaded here -->
                    <div class="text-center py-12">
                        <i class="fas fa-user-edit text-4xl text-blue-600 mb-4"></i>
                        <p class="text-lg text-gray-600">Edit functionality will be implemented here</p>
                        <p class="text-sm text-gray-500 mt-2">This modal will contain a full edit form similar to the add student form</p>
                    </div>
                </div>
            `;
        }
        
        function deleteStudent(id) {
            if (confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
                const student = appState.students.find(s => s.id === id);
                if (student) {
                    appState.students = appState.students.filter(s => s.id !== id);
                    saveData();
                    renderStudentsTable();
                    updateStudentStats();
                    Toast.show(`Student ${student.name} deleted successfully`, 'success');
                }
            }
        }
        
        // Add Student Handler
        function handleAddStudent() {
            const form = document.getElementById('addStudentForm');
            if (!form) return;
            
            const formData = new FormData(form);
            const studentData = {};
            
            for (let [key, value] of formData.entries()) {
                if (key === 'sports[]' || key === 'subjects[]') {
                    if (!studentData[key.replace('[]', '')]) {
                        studentData[key.replace('[]', '')] = [];
                    }
                    studentData[key.replace('[]', '')].push(value);
                } else {
                    studentData[key] = value;
                }
            }
            
            // Validate required fields
            const required = ['studentName', 'dob', 'gender', 'casteCategory', 'addressLine1', 'city', 'state', 'pincode', 'class', 'section', 'rollNumber', 'admissionDate', 'academicYear', 'fatherName', 'fatherContact', 'motherName', 'parentEmail', 'relationship', 'emergencyContactName', 'emergencyContactNumber'];
            for (const field of required) {
                if (!studentData[field]) {
                    Toast.show(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`, 'error');
                    return;
                }
            }
            
            // Build address
            const address = `${studentData.addressLine1}${studentData.addressLine2 ? ', ' + studentData.addressLine2 : ''}, ${studentData.city}, ${studentData.state} - ${studentData.pincode}`;
            
            // Calculate fees
            const admission = parseFloat(document.getElementById('admissionFees').value || 0);
            const uniform = parseFloat(document.getElementById('uniformFees').value || 0);
            const books = parseFloat(document.getElementById('bookFees').value || 0);
            const tuition = parseFloat(document.getElementById('tuitionFees').value || 0);
            const initialPayment = parseFloat(document.getElementById('initialPayment').value || 0);
            const additionalTotal = calculateAdditionalFeesTotal();
            
            const baseTotal = admission + uniform + books + tuition;
            const totalFees = baseTotal + additionalTotal;
            
            if (initialPayment > totalFees) {
                Toast.show('Initial payment cannot exceed total fees', 'error');
                return;
            }
            
            // Create student object
            const newStudent = {
                id: Date.now(),
                studentId: `STU${appState.studentIdCounter++}`,
                name: studentData.studentName,
                dob: studentData.dob,
                gender: studentData.gender,
                bloodGroup: studentData.bloodGroup || '',
                casteCategory: studentData.casteCategory,
                address: address,
                aadharNumber: studentData.aadharNumber || '',
                previousSchool: studentData.previousSchool || '',
                medicalInfo: studentData.medicalInfo || '',
                sports: studentData.sports || [],
                class: studentData.class,
                section: studentData.section,
                rollNumber: studentData.rollNumber,
                admissionDate: studentData.admissionDate,
                academicYear: studentData.academicYear,
                classTeacher: studentData.classTeacher || '',
                subjects: studentData.subjects || [],
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
                    admission,
                    uniform,
                    books,
                    tuition,
                    additional: additionalTotal,
                    paid: initialPayment,
                    pending: totalFees - initialPayment,
                    paymentMode: document.querySelector('input[name="paymentMode"]:checked').value,
                    paymentMethod: document.querySelector('input[name="paymentMethod"]:checked').value
                },
                status: 'Active',
                createdAt: new Date().toISOString(),
                photo: null
            };
            
            // Add to database
            appState.students.push(newStudent);
            saveData();
            
            // Reset and show success
            resetForm();
            Toast.show(`Student ${newStudent.name} registered successfully! Student ID: ${newStudent.studentId}`, 'success');
            
            // Redirect after delay
            setTimeout(() => {
                window.location.href = 'student-management.html';
            }, 1500);
        }
        
        function resetForm() {
            const form = document.getElementById('addStudentForm');
            if (form) form.reset();
            
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
            
            // Set default date for first installment
            const today = new Date();
            const firstInstallmentDate = document.getElementById('firstInstallmentDate');
            if (firstInstallmentDate) {
                today.setMonth(today.getMonth() + 1);
                firstInstallmentDate.valueAsDate = today;
            }
            
            calculateTotalFees();
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
        
        function exportStudents() {
            Toast.show('Export functionality will be implemented here', 'info');
        }
        
        function printStudentDetails(id) {
            Toast.show('Print functionality will be implemented here', 'info');
        }
    
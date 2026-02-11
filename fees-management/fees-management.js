

// ============================================================================
// FEES MANAGEMENT MODULE - MAIN JAVASCRIPT
// ============================================================================

// Global variables
let currentFeesTab = 'students';
let monthlyCollectionChart = null;
let feeStatusChart = null;
let selectedStudentForPayment = null;
let receiptsData = [];
let studentsFeesData = [];
let selectedInstallmentForPayment = null;
let currentSelectedInstallmentIndex = -1;
let customAmountInstallment = null;
let qrCodeInstance = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function () {
    initializeSidebar();
    initializeDatePickers();
    loadFeesData();
    setupEventListeners();

    // Check URL parameters for specific views
    const urlParams = new URLSearchParams(window.location.search);
    const view = urlParams.get('view');
    if (view) {
        switch (view) {
            case 'structure':
                switchFeesTab('students');
                break;
            case 'history':
                switchFeesTab('receipts');
                break;
            case 'reports':
                switchFeesTab('reports');
                break;
        }
    }
});

// Initialize sidebar functionality
function initializeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebarToggleIcon = document.getElementById('sidebarToggleIcon');
    const mainContent = document.getElementById('mainContent');
    const sidebarOverlay = document.getElementById('sidebarOverlay');

    sidebarToggle.addEventListener('click', function () {
        if (window.innerWidth < 1024) {
            // Mobile toggle
            sidebar.classList.toggle('mobile-open');
            sidebarOverlay.classList.toggle('active');
        } else {
            // Desktop toggle
            sidebar.classList.toggle('collapsed');
            mainContent.classList.toggle('sidebar-collapsed');
            sidebarToggleIcon.classList.toggle('fa-bars');
            sidebarToggleIcon.classList.toggle('fa-times');
        }
    });

    // Close sidebar on overlay click (mobile)
    sidebarOverlay.addEventListener('click', function () {
        sidebar.classList.remove('mobile-open');
        sidebarOverlay.classList.remove('active');
    });

    // Initialize dropdowns
    initializeDropdowns();
}

// Initialize dropdown menus
function initializeDropdowns() {
    const notificationsBtn = document.getElementById('notificationsBtn');
    const notificationsDropdown = document.getElementById('notificationsDropdown');
    const userMenuBtn = document.getElementById('userMenuBtn');
    const userMenuDropdown = document.getElementById('userMenuDropdown');

    notificationsBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        notificationsDropdown.classList.toggle('hidden');
        userMenuDropdown.classList.add('hidden');
    });

    userMenuBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        userMenuDropdown.classList.toggle('hidden');
        notificationsDropdown.classList.add('hidden');
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', function () {
        notificationsDropdown.classList.add('hidden');
        userMenuDropdown.classList.add('hidden');
    });
}

// Initialize date pickers
function initializeDatePickers() {
    // Date range pickers
    flatpickr("#receiptDateRange", {
        mode: "range",
        dateFormat: "Y-m-d",
        defaultDate: ["2024-01-01", "2024-12-31"]
    });

    flatpickr("#reportDateRange", {
        mode: "range",
        dateFormat: "Y-m-d",
        defaultDate: ["2024-04-01", "2024-09-30"]
    });

    // Set today's date for payment date
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('paymentDate').value = today;
}

// Load initial fees data
function loadFeesData() {
    // Simulate API call delay
    setTimeout(() => {
        // Load students fees data with installment structures
        studentsFeesData = getSampleStudentsFeesData();
        
        // Calculate student status based on installments
        studentsFeesData.forEach(student => {
            updateStudentStatusFromInstallments(student);
        });
        
        populateFeesTable(studentsFeesData);

        // Load receipts data
        receiptsData = getSampleReceiptsData();
        populateReceiptsGrid(receiptsData);

        // Update stats
        updateFeesStats();
    }, 500);
}

// Setup event listeners
function setupEventListeners() {
    // Payment method change listener
    const paymentMethodRadios = document.querySelectorAll('input[name="paymentMethodModal"]');
    paymentMethodRadios.forEach(radio => {
        radio.addEventListener('change', function () {
            togglePaymentMethodDetails(this.value);
        });
    });

    // Student search input
    const studentSearchInput = document.getElementById('studentSearchInput');
    studentSearchInput.addEventListener('input', function () {
        searchStudents(this.value);
    });

    // Custom amount input
    const customAmountInput = document.getElementById('customPaymentAmount');
    customAmountInput.addEventListener('input', function() {
        const maxAmount = customAmountInstallment ? customAmountInstallment.amount - (customAmountInstallment.paid || 0) : 0;
        if (parseInt(this.value) > maxAmount) {
            this.value = maxAmount;
        }
        updateRemainingAmountDisplay();
    });

    // Payment amount input change
    document.getElementById('paymentAmount').addEventListener('input', function() {
        updatePaymentSummary();
        const paymentMethod = document.querySelector('input[name="paymentMethodModal"]:checked').value;
        if (paymentMethod === 'online' && this.value) {
            generateQRCodeForPayment();
        }
    });

    // Payment method change
    document.querySelectorAll('input[name="paymentMethodModal"]').forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'online' && document.getElementById('paymentAmount').value) {
                generateQRCodeForPayment();
            }
        });
    });

    // Filters
    document.getElementById('searchStudentFees').addEventListener('input', filterFeesTable);
    document.getElementById('filterClassFees').addEventListener('change', filterFeesTable);
    document.getElementById('filterFeeStatusFees').addEventListener('change', filterFeesTable);

    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', function (e) {
        e.preventDefault();
        showToast('Logged out successfully', 'success');
        // In a real app, you would redirect to login page
        setTimeout(() => {
            window.location.href = '../login.html';
        }, 1500);
    });
}

// Switch between fees tabs
function switchFeesTab(tabName) {
    // Update active tab button
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById(`${tabName}Tab`).classList.add('active');

    // Show active tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tabName}TabContent`).classList.add('active');

    currentFeesTab = tabName;
}

// Populate fees table with data
function populateFeesTable(students) {
    const tableBody = document.getElementById('feesTableBody');
    tableBody.innerHTML = '';

    students.forEach(student => {
        const statusClass = getStatusClass(student.status);
        const progressPercent = (student.paid / student.total) * 100;

        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50 transition-all duration-200';
        row.innerHTML = `
            <td class="px-4 lg:px-6 py-4">
                <div class="flex items-center">
                    <div class="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <i class="fas fa-user-graduate text-blue-600"></i>
                    </div>
                    <div>
                        <p class="font-medium text-gray-800">${student.name}</p>
                        <p class="text-sm text-gray-600">ID: ${student.id}</p>
                    </div>
                </div>
            </td>
            <td class="px-4 lg:px-6 py-4">
                <span class="font-medium text-gray-800">${student.class}</span>
                <p class="text-sm text-gray-600">Section ${student.section}</p>
            </td>
            <td class="px-4 lg:px-6 py-4">
                <p class="font-semibold text-gray-800">₹${student.total.toLocaleString()}</p>
            </td>
            <td class="px-4 lg:px-6 py-4">
                <p class="font-medium text-green-600">₹${student.paid.toLocaleString()}</p>
                <div class="progress-bar w-24 mt-1">
                    <div class="progress-fill ${progressPercent >= 100 ? 'bg-green-500' : progressPercent >= 50 ? 'bg-yellow-500' : 'bg-red-500'}" 
                         style="width: ${Math.min(progressPercent, 100)}%"></div>
                </div>
            </td>
            <td class="px-4 lg:px-6 py-4">
                <p class="font-medium ${student.balance > 0 ? 'text-red-600' : 'text-green-600'}">
                    ₹${student.balance.toLocaleString()}
                </p>
            </td>
            <td class="px-4 lg:px-6 py-4">
                <span class="status-badge ${statusClass}">${student.status}</span>
            </td>
            <td class="px-4 lg:px-6 py-4">
                <div class="flex space-x-2">
                    <button onclick="viewStudentFees('${student.id}')" class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button onclick="collectPaymentForStudent('${student.id}')" class="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200" title="Collect Payment">
                        <i class="fas fa-money-bill-wave"></i>
                    </button>
                    <button onclick="sendReminder('${student.id}')" class="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-all duration-200" title="Send Reminder">
                        <i class="fas fa-bell"></i>
                    </button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Filter fees table
function filterFeesTable() {
    const searchTerm = document.getElementById('searchStudentFees').value.toLowerCase();
    const classFilter = document.getElementById('filterClassFees').value;
    const statusFilter = document.getElementById('filterFeeStatusFees').value;

    const filteredStudents = studentsFeesData.filter(student => {
        const matchesSearch = searchTerm === '' ||
            student.name.toLowerCase().includes(searchTerm) ||
            student.id.toLowerCase().includes(searchTerm) ||
            student.parent.toLowerCase().includes(searchTerm);

        const matchesClass = classFilter === '' || student.class === classFilter;

        const matchesStatus = statusFilter === '' ||
            (statusFilter === 'paid' && student.status === 'Paid') ||
            (statusFilter === 'partial' && student.status === 'Partial Paid') ||
            (statusFilter === 'unpaid' && student.status === 'Unpaid');

        return matchesSearch && matchesClass && matchesStatus;
    });

    populateFeesTable(filteredStudents);
}

// Populate receipts grid
function populateReceiptsGrid(receipts) {
    const receiptsGrid = document.getElementById('receiptsGrid');
    const noReceiptsMessage = document.getElementById('noReceiptsMessage');

    if (receipts.length === 0) {
        receiptsGrid.classList.add('hidden');
        noReceiptsMessage.classList.remove('hidden');
        return;
    }

    receiptsGrid.classList.remove('hidden');
    noReceiptsMessage.classList.add('hidden');
    receiptsGrid.innerHTML = '';

    receipts.forEach(receipt => {
        const methodIcon = getPaymentMethodIcon(receipt.method);
        const methodColor = getPaymentMethodColor(receipt.method);
        
        const receiptCard = document.createElement('div');
        receiptCard.className = 'bg-white border border-gray-200 rounded-xl p-5 receipt-item';
        receiptCard.innerHTML = `
            <div class="flex justify-between items-start mb-4">
                <div>
                    <p class="text-sm font-semibold text-gray-600">${receipt.receiptNo}</p>
                    <p class="text-lg font-bold text-gray-800">${receipt.studentName}</p>
                    <p class="text-sm text-gray-600">${receipt.class} | ${receipt.date}</p>
                </div>
                <div class="text-right">
                    <p class="text-xl font-bold text-green-600">₹${receipt.amount.toLocaleString()}</p>
                    <span class="inline-block px-3 py-1 text-xs font-medium rounded-full ${methodColor.bg} ${methodColor.text}">
                        <i class="fas fa-${methodIcon} mr-1"></i>${receipt.method}
                    </span>
                </div>
            </div>
            <div class="border-t border-gray-100 pt-4">
                <button onclick="viewReceipt('${receipt.receiptNo}')" 
                        class="w-full px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all duration-200 text-sm font-medium">
                    <i class="fas fa-eye mr-2"></i>View Receipt
                </button>
            </div>
        `;
        receiptsGrid.appendChild(receiptCard);
    });
}

// Filter receipts
function filterReceipts() {
    // In a real app, this would filter receipts based on selected criteria
    showToast('Filtering receipts...', 'info');
    // For demo, just show all receipts
    populateReceiptsGrid(receiptsData);
}

// Open collect payment modal
function openCollectPaymentModal(studentId = null) {
    const modal = document.getElementById('collectPaymentModalOverlay');
    modal.classList.add('show');

    // Reset all sections
    document.getElementById('installmentSelectionSection').classList.add('hidden');
    document.getElementById('selectedInstallmentDetails').classList.add('hidden');
    document.getElementById('paymentAmount').value = '';
    document.getElementById('paymentNotes').value = '';
    document.getElementById('transactionId').value = '';
    document.getElementById('bankName').value = '';
    document.getElementById('qrCodeSection').classList.add('hidden');
    document.getElementById('qrCodeContainer').innerHTML = '';

    // Reset payment method to cash
    document.querySelector('input[name="paymentMethodModal"][value="cash"]').checked = true;
    togglePaymentMethodDetails('cash');

    // Clear previous selections
    selectedStudentForPayment = null;
    selectedInstallmentForPayment = null;
    currentSelectedInstallmentIndex = -1;
    qrCodeInstance = null;

    // If studentId is provided, pre-select that student
    if (studentId) {
        const student = studentsFeesData.find(s => s.id === studentId);
        if (student) {
            selectStudentForPayment(student);
        }
    }

    updatePaymentSummary();
}

// Close collect payment modal
function closeCollectPaymentModal() {
    const modal = document.getElementById('collectPaymentModalOverlay');
    modal.classList.remove('show');
    selectedStudentForPayment = null;
    selectedInstallmentForPayment = null;
    currentSelectedInstallmentIndex = -1;
    qrCodeInstance = null;

    // Clear search results
    document.getElementById('studentSearchResults').classList.add('hidden');
    document.getElementById('selectedStudentInfo').classList.add('hidden');
    document.getElementById('studentSearchInput').value = '';
    document.getElementById('installmentOptionsContainer').innerHTML = '';
    document.getElementById('installmentSelectionSection').classList.add('hidden');
    document.getElementById('selectedInstallmentDetails').classList.add('hidden');
    document.getElementById('qrCodeSection').classList.add('hidden');
    document.getElementById('qrCodeContainer').innerHTML = '';
}

// Search students for payment
function searchStudents(query) {
    const resultsContainer = document.getElementById('studentSearchResults');

    if (query.length < 2) {
        resultsContainer.classList.add('hidden');
        return;
    }

    // Filter students based on query
    const filteredStudents = studentsFeesData.filter(student =>
        student.name.toLowerCase().includes(query.toLowerCase()) ||
        student.id.toLowerCase().includes(query.toLowerCase()) ||
        student.parent.toLowerCase().includes(query.toLowerCase())
    );

    if (filteredStudents.length === 0) {
        resultsContainer.innerHTML = '<div class="p-3 text-center text-gray-500">No students found</div>';
        resultsContainer.classList.remove('hidden');
        return;
    }

    // Build results HTML
    let resultsHTML = '';
    filteredStudents.forEach(student => {
        resultsHTML += `
            <div class="p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer" 
                 onclick="selectStudentForPayment(${JSON.stringify(student).replace(/"/g, '&quot;')})">
                <div class="flex justify-between items-center">
                    <div>
                        <p class="font-medium text-gray-800">${student.name}</p>
                        <p class="text-sm text-gray-600">${student.class}-${student.section} | ID: ${student.id}</p>
                    </div>
                    <div class="text-right">
                        <p class="text-sm font-medium ${student.balance > 0 ? 'text-red-600' : 'text-green-600'}">
                            Balance: ₹${student.balance.toLocaleString()}
                        </p>
                    </div>
                </div>
            </div>
        `;
    });

    resultsContainer.innerHTML = resultsHTML;
    resultsContainer.classList.remove('hidden');
}

// Select student for payment
function selectStudentForPayment(student) {
    selectedStudentForPayment = student;
    selectedInstallmentForPayment = null;
    currentSelectedInstallmentIndex = -1;

    // Update UI
    document.getElementById('studentSearchInput').value = student.name;
    document.getElementById('studentSearchResults').classList.add('hidden');

    const selectedStudentInfo = document.getElementById('selectedStudentInfo');
    selectedStudentInfo.classList.remove('hidden');
    selectedStudentInfo.innerHTML = `
        <div class="flex justify-between items-center">
            <div>
                <p class="font-medium text-gray-800">${student.name}</p>
                <p class="text-sm text-gray-600">${student.class}-${student.section} | Parent: ${student.parent}</p>
            </div>
            <div class="text-right">
                <p class="text-sm">Total Fees: <span class="font-medium">₹${student.total.toLocaleString()}</span></p>
                <p class="text-sm">Paid: <span class="font-medium text-green-600">₹${student.paid.toLocaleString()}</span></p>
                <p class="text-sm">Balance: <span class="font-medium text-red-600">₹${student.balance.toLocaleString()}</span></p>
            </div>
        </div>
    `;

    // Show installment selection section
    showInstallmentOptions(student);
}

// Show installment options for selected student
function showInstallmentOptions(student) {
    const installmentSection = document.getElementById('installmentSelectionSection');
    const optionsContainer = document.getElementById('installmentOptionsContainer');
    
    installmentSection.classList.remove('hidden');
    optionsContainer.innerHTML = '';
    
    if (!student.installments || student.installments.length === 0) {
        optionsContainer.innerHTML = `
            <div class="text-center py-4 text-gray-500">
                <i class="fas fa-calendar-times text-2xl mb-2"></i>
                <p>No installments created for this student</p>
            </div>
        `;
        return;
    }
    
    // Get current date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    student.installments.forEach((installment, index) => {
        const dueDate = new Date(installment.dueDate);
        const isOverdue = dueDate < today;
        const remainingAmount = installment.amount - (installment.paid || 0);
        
        // Determine if this installment is payable
        let isPayable = false;
        if (remainingAmount > 0 && installment.status !== 'paid') {
            // Check if this is the first unpaid/partial installment
            const payableIndex = findFirstPayableInstallmentIndex(student.installments);
            isPayable = (index === payableIndex);
        }
        
        const optionDiv = document.createElement('div');
        optionDiv.className = `installment-option ${isPayable ? '' : 'disabled'}`;
        if (index === currentSelectedInstallmentIndex) {
            optionDiv.classList.add('selected');
        }
        
        optionDiv.innerHTML = `
            <div class="flex justify-between items-center">
                <div>
                    <p class="font-medium text-gray-800">Installment ${index + 1}</p>
                    <div class="flex items-center space-x-2 mt-1">
                        <span class="text-sm ${getInstallmentStatusColor(installment.status)}">
                            ${installment.status.toUpperCase()}
                        </span>
                        <span class="text-xs text-gray-500">•</span>
                        <span class="text-sm text-gray-600">Due: ${formatDate(installment.dueDate)}</span>
                    </div>
                </div>
                <div class="text-right">
                    <p class="font-bold text-gray-800">₹${installment.amount.toLocaleString()}</p>
                    ${remainingAmount > 0 ? `<p class="text-sm text-red-600">Remaining: ₹${remainingAmount.toLocaleString()}</p>` : ''}
                </div>
            </div>
        `;
        
        if (isPayable) {
            optionDiv.onclick = () => selectInstallmentForPayment(index);
        }
        
        optionsContainer.appendChild(optionDiv);
    });
}

// New helper function
function findFirstPayableInstallmentIndex(installments) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < installments.length; i++) {
        const installment = installments[i];
        const dueDate = new Date(installment.dueDate);
        const remainingAmount = installment.amount - (installment.paid || 0);
        
        if (remainingAmount > 0 && installment.status !== 'paid') {
            // If this installment is overdue, it's payable
            if (dueDate < today) {
                return i;
            }
            
            // Check previous installments
            let allPreviousPaid = true;
            for (let j = 0; j < i; j++) {
                const prevInstallment = installments[j];
                const prevRemaining = prevInstallment.amount - (prevInstallment.paid || 0);
                const prevDueDate = new Date(prevInstallment.dueDate);
                
                if (prevRemaining > 0 && prevDueDate < today) {
                    allPreviousPaid = false;
                    break;
                }
            }
            
            if (allPreviousPaid) {
                return i;
            }
        }
    }
    
    return -1; // No payable installment found
}

// Select installment for payment
function selectInstallmentForPayment(index) {
    if (!selectedStudentForPayment || !selectedStudentForPayment.installments) return;
    
    currentSelectedInstallmentIndex = index;
    selectedInstallmentForPayment = selectedStudentForPayment.installments[index];
    
    // Update UI to show selected installment
    document.querySelectorAll('.installment-option').forEach((option, i) => {
        option.classList.remove('selected');
        if (i === index) {
            option.classList.add('selected');
        }
    });
    
    // Show installment details
    showInstallmentDetails(selectedInstallmentForPayment, index);
}

// Show installment details
function showInstallmentDetails(installment, index) {
    const detailsSection = document.getElementById('selectedInstallmentDetails');
    const paymentSection = document.getElementById('installmentPaymentSection');
    
    // Update display
    document.getElementById('installmentNumberDisplay').textContent = `Installment ${index + 1}`;
    document.getElementById('installmentDueDateDisplay').textContent = formatDate(installment.dueDate);
    document.getElementById('installmentAmountDisplay').textContent = `₹${installment.amount.toLocaleString()}`;
    
    // Calculate remaining amount
    const remainingAmount = installment.amount - (installment.paid || 0);
    
    // Get current date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(installment.dueDate);
    
    // Determine installment status
    let paymentHTML = '';
    
    if (installment.status === 'paid') {
        paymentHTML = `
            <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                <div class="flex items-center">
                    <i class="fas fa-check-circle text-green-500 text-xl mr-3"></i>
                    <div>
                        <p class="font-medium text-green-800">This installment is fully paid</p>
                        <p class="text-sm text-green-600">Paid: ₹${installment.paid.toLocaleString()}</p>
                    </div>
                </div>
            </div>
        `;
        document.getElementById('paymentAmount').value = '';
    } else if (installment.status === 'partial') {
        paymentHTML = `
            <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div class="flex justify-between items-center">
                    <div>
                        <p class="font-medium text-yellow-800">Partially Paid</p>
                        <p class="text-sm text-yellow-600">Paid: ₹${installment.paid.toLocaleString()} | Remaining: ₹${remainingAmount.toLocaleString()}</p>
                    </div>
                    <button onclick="openCustomAmountOverlay(${index})" 
                            class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200">
                        Pay Now
                    </button>
                </div>
            </div>
        `;
        document.getElementById('paymentAmount').value = remainingAmount;
    } else if (remainingAmount > 0) {
        // Check if this is the payable installment
        const isPayable = checkIfInstallmentIsPayable(index);
        
        if (isPayable) {
            paymentHTML = `
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div class="flex justify-between items-center">
                        <div>
                            <p class="font-medium text-blue-800">${dueDate < today ? 'Overdue' : 'Due'}</p>
                            <p class="text-sm text-blue-600">Amount Due: ₹${remainingAmount.toLocaleString()}</p>
                        </div>
                        <button onclick="openCustomAmountOverlay(${index})" 
                                class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200">
                            Pay Now
                        </button>
                    </div>
                </div>
            `;
            document.getElementById('paymentAmount').value = remainingAmount;
        } else {
            paymentHTML = `
                <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div class="flex justify-between items-center">
                        <div>
                            <p class="font-medium text-gray-800">Not Payable Yet</p>
                            <p class="text-sm text-gray-600">Complete previous installments first</p>
                        </div>
                        <button class="px-4 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed" disabled>
                            Pay Now
                        </button>
                    </div>
                </div>
            `;
            document.getElementById('paymentAmount').value = '';
        }
    }
    
    paymentSection.innerHTML = paymentHTML;
    detailsSection.classList.remove('hidden');
    
    // Update payment summary
    updatePaymentSummary();
    
    // Update QR code if online payment is selected
    const paymentMethod = document.querySelector('input[name="paymentMethodModal"]:checked').value;
    if (paymentMethod === 'online' && document.getElementById('paymentAmount').value) {
        generateQRCodeForPayment();
    }
}

// FIXED VERSION:
function checkIfInstallmentIsPayable(index) {
    if (!selectedStudentForPayment || !selectedStudentForPayment.installments) return false;
    
    const installment = selectedStudentForPayment.installments[index];
    const remainingAmount = installment.amount - (installment.paid || 0);
    
    // If already paid or no remaining amount, not payable
    if (installment.status === 'paid' || remainingAmount <= 0) {
        return false;
    }
    
    // Get current date for overdue check
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(installment.dueDate);
    
    // Check all previous installments
    for (let i = 0; i < index; i++) {
        const prevInstallment = selectedStudentForPayment.installments[i];
        const prevRemaining = prevInstallment.amount - (prevInstallment.paid || 0);
        
        // If previous installment is overdue and has remaining amount
        const prevDueDate = new Date(prevInstallment.dueDate);
        if (prevRemaining > 0 && prevDueDate < today) {
            // Previous overdue installment exists
            return false;
        }
        
        // If previous installment is not paid/partial and due date has passed
        if (prevRemaining > 0 && prevDueDate < today && prevInstallment.status !== 'paid') {
            return false;
        }
    }
    
    // This installment is payable if:
    // 1. It has remaining amount
    // 2. Either it's due date has passed OR no overdue previous installments
    return true;
}

// Update remaining amount display
function updateRemainingAmountDisplay() {
    if (!customAmountInstallment) return;
    
    const customAmount = parseInt(document.getElementById('customPaymentAmount').value) || 0;
    const remainingAmount = customAmountInstallment.amount - (customAmountInstallment.paid || 0);
    const newRemaining = remainingAmount - customAmount;
    
    document.getElementById('remainingAmountDisplay').textContent = newRemaining.toLocaleString();
}

// Open custom amount overlay
function openCustomAmountOverlay(index) {
    if (!selectedStudentForPayment || !selectedStudentForPayment.installments) return;
    
    const installment = selectedStudentForPayment.installments[index];
    const remainingAmount = installment.amount - (installment.paid || 0);
    
    customAmountInstallment = installment;
    
    // Update display
    document.getElementById('installmentFullAmount').textContent = remainingAmount.toLocaleString();
    document.getElementById('customPaymentAmount').value = remainingAmount;
    document.getElementById('customPaymentAmount').max = remainingAmount;
    document.getElementById('customPaymentAmount').min = 1;
    
    // Update remaining amount display
    updateRemainingAmountDisplay();
    
    // Show overlay
    document.getElementById('customAmountOverlay').classList.add('show');
    
    // Focus on input
    setTimeout(() => {
        document.getElementById('customPaymentAmount').focus();
    }, 100);
}

// Close custom amount overlay
function closeCustomAmountOverlay() {
    document.getElementById('customAmountOverlay').classList.remove('show');
    customAmountInstallment = null;
}

// Submit custom amount
function submitCustomAmount() {
    const customAmount = parseInt(document.getElementById('customPaymentAmount').value);
    
    if (!customAmount || customAmount <= 0) {
        showToast('Please enter a valid amount', 'error');
        return;
    }
    
    const remainingAmount = customAmountInstallment.amount - (customAmountInstallment.paid || 0);
    
    if (customAmount > remainingAmount) {
        showToast(`Amount cannot exceed remaining balance of ₹${remainingAmount.toLocaleString()}`, 'error');
        return;
    }
    
    // Update payment amount in main modal
    document.getElementById('paymentAmount').value = customAmount;
    
    // Close overlay
    closeCustomAmountOverlay();
    
    // Update summary and QR code
    updatePaymentSummary();
    
    const paymentMethod = document.querySelector('input[name="paymentMethodModal"]:checked').value;
    if (paymentMethod === 'online') {
        generateQRCodeForPayment();
    }
    
    showToast(`Payment amount set to ₹${customAmount.toLocaleString()}`, 'success');
}

// Toggle payment method details
function togglePaymentMethodDetails(method) {
    const qrCodeSection = document.getElementById('qrCodeSection');
    const transactionDetails = document.getElementById('transactionDetails');
    const bankDetails = document.getElementById('bankDetails');
    
    // Hide all detail sections first
    transactionDetails.classList.add('hidden');
    qrCodeSection.classList.add('hidden');
    bankDetails.classList.add('hidden');
    
    // Show relevant sections based on method
    if (method === 'online') {
        transactionDetails.classList.remove('hidden');
        qrCodeSection.classList.remove('hidden');
        bankDetails.classList.remove('hidden');
        
        // Generate QR code with current amount
        const paymentAmount = document.getElementById('paymentAmount').value;
        if (paymentAmount) {
            generateQRCodeForPayment();
        }
    }
    
    updatePaymentSummary();
}

// Generate QR code for online payment - USING QRCode.js
function generateQRCodeForPayment() {
    const paymentAmount = document.getElementById('paymentAmount').value || 0;
    const studentName = selectedStudentForPayment ? selectedStudentForPayment.name : 'School Fees';
    const studentId = selectedStudentForPayment ? selectedStudentForPayment.id : '';
    
    // Update QR amount display
    document.getElementById('qrAmountDisplay').textContent = parseInt(paymentAmount).toLocaleString();
    
    // Create UPI payment string
    const upiId = 'school.fees@upi';
    const paymentNote = `Fees for ${studentName} (${studentId})`;
    
    // Format UPI payment URL (correct format)
    const upiUrl = `upi://pay?pa=${upiId}&pn=Kunash%20School&am=${paymentAmount}&tn=${encodeURIComponent(paymentNote)}&cu=INR`;
    
    // Generate QR code
    const qrCodeContainer = document.getElementById('qrCodeContainer');
    qrCodeContainer.innerHTML = '';
    
    try {
        // Check if QRCode library is available
        if (typeof QRCode !== 'undefined') {
            // Clear previous QR code
            qrCodeContainer.innerHTML = '';
            
            // Create new QR code
            qrCodeInstance = new QRCode(qrCodeContainer, {
                text: upiUrl,
                width: 200,
                height: 200,
                colorDark: "#000000",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.L
            });
            
            // Add some styling
            const qrImage = qrCodeContainer.querySelector('img');
            if (qrImage) {
                qrImage.classList.add('mx-auto', 'block');
            }
            
            // Add canvas styling if using canvas
            const qrCanvas = qrCodeContainer.querySelector('canvas');
            if (qrCanvas) {
                qrCanvas.classList.add('mx-auto', 'block');
            }
        } else {
            console.error('QRCode library not loaded');
            generateSimpleQRCode();
        }
    } catch (error) {
        console.error('QR Code generation error:', error);
        generateSimpleQRCode();
    }
}

// Alternative simpler QR code generation (Fallback)
function generateSimpleQRCode() {
    const paymentAmount = document.getElementById('paymentAmount').value || 0;
    const qrCodeContainer = document.getElementById('qrCodeContainer');
    
    qrCodeContainer.innerHTML = '';
    
    // Create a simple QR code representation
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 200, 200);
    
    // Draw QR code pattern (simple squares)
    ctx.fillStyle = '#000000';
    
    // Draw position markers (three squares in corners)
    // Top-left
    ctx.fillRect(20, 20, 40, 40);
    ctx.fillRect(20, 20, 40, 8);
    ctx.fillRect(20, 20, 8, 40);
    ctx.fillRect(52, 20, 8, 40);
    ctx.fillRect(20, 52, 40, 8);
    
    // Top-right
    ctx.fillRect(140, 20, 40, 40);
    ctx.fillRect(140, 20, 40, 8);
    ctx.fillRect(140, 20, 8, 40);
    ctx.fillRect(172, 20, 8, 40);
    ctx.fillRect(140, 52, 40, 8);
    
    // Bottom-left
    ctx.fillRect(20, 140, 40, 40);
    ctx.fillRect(20, 140, 40, 8);
    ctx.fillRect(20, 140, 8, 40);
    ctx.fillRect(52, 140, 8, 40);
    ctx.fillRect(20, 172, 40, 8);
    
    // Draw some data squares
    const squares = [
        [70, 30], [90, 30], [110, 30],
        [70, 50], [110, 50],
        [70, 70], [90, 70], [110, 70],
        [30, 90], [50, 90], [70, 90],
        [110, 90], [130, 90],
        [50, 110], [70, 110],
        [110, 110], [130, 110],
        [30, 130], [50, 130], [70, 130],
        [90, 90], [90, 110],
        [130, 130], [150, 130],
        [150, 150], [170, 150]
    ];
    
    squares.forEach(([x, y]) => {
        ctx.fillRect(x, y, 10, 10);
    });
    
    // Add amount text
    ctx.fillStyle = '#000000';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`₹${paymentAmount}`, 100, 190);
    
    qrCodeContainer.appendChild(canvas);
    
    // Add note
    const note = document.createElement('p');
    note.className = 'text-xs text-gray-600 mt-2 text-center';
    note.textContent = 'Scan with any UPI app';
    qrCodeContainer.appendChild(note);
}

// Update payment summary
function updatePaymentSummary() {
    const studentName = selectedStudentForPayment ? selectedStudentForPayment.name : 'Not selected';
    const paymentAmount = document.getElementById('paymentAmount').value || 0;
    const paymentMethod = document.querySelector('input[name="paymentMethodModal"]:checked').value;
    
    // Format payment method for display
    let methodDisplay = 'Cash';
    if (paymentMethod === 'online') methodDisplay = 'Online Transfer';
    
    // Format installment info
    let installmentDisplay = 'Not selected';
    if (selectedInstallmentForPayment && currentSelectedInstallmentIndex >= 0) {
        installmentDisplay = `Installment ${currentSelectedInstallmentIndex + 1}`;
    }
    
    // Update summary
    document.getElementById('summaryStudentName').textContent = studentName;
    document.getElementById('summaryInstallment').textContent = installmentDisplay;
    document.getElementById('summaryPaymentAmount').textContent = '₹' + parseInt(paymentAmount).toLocaleString();
    document.getElementById('summaryPaymentMethod').textContent = methodDisplay;
    document.getElementById('summaryTotalAmount').textContent = '₹' + parseInt(paymentAmount).toLocaleString();
}

// Process payment
function processPayment() {
    // Validate form
    if (!selectedStudentForPayment) {
        showToast('Please select a student', 'error');
        return;
    }

    if (!selectedInstallmentForPayment || currentSelectedInstallmentIndex < 0) {
        showToast('Please select an installment', 'error');
        return;
    }

    const paymentAmount = parseFloat(document.getElementById('paymentAmount').value);
    if (!paymentAmount || paymentAmount <= 0) {
        showToast('Please enter a valid payment amount', 'error');
        return;
    }

    const remainingAmount = selectedInstallmentForPayment.amount - (selectedInstallmentForPayment.paid || 0);
    if (paymentAmount > remainingAmount) {
        showToast('Payment amount cannot exceed installment remaining amount', 'error');
        return;
    }

    const paymentMethod = document.querySelector('input[name="paymentMethodModal"]:checked').value;
    const paymentDate = document.getElementById('paymentDate').value;
    const notes = document.getElementById('paymentNotes').value;

    // Get additional details based on payment method
    let transactionId = '', bankName = '';

    if (paymentMethod === 'online') {
        transactionId = document.getElementById('transactionId').value;
        bankName = document.getElementById('bankName').value;
        if (!transactionId) {
            showToast('Please enter transaction ID for online payment', 'error');
            return;
        }
    } else {
        bankName = document.getElementById('bankName').value || 'Not specified';
    }

    // Generate receipt number
    const receiptNo = 'F' + new Date().getFullYear() + '000' + (receiptsData.length + 1);

    // Create receipt object
    const receipt = {
        receiptNo: receiptNo,
        studentName: selectedStudentForPayment.name,
        studentId: selectedStudentForPayment.id,
        class: selectedStudentForPayment.class + '-' + selectedStudentForPayment.section,
        amount: paymentAmount,
        date: new Date(paymentDate).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        }),
        method: paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1),
        chequeNo: '',
        bankName: bankName,
        transactionId: transactionId,
        notes: notes,
        installmentNumber: currentSelectedInstallmentIndex + 1
    };

    // In a real app, you would send this to the server
    console.log('Processing payment:', receipt);

    // Simulate API call
    showLoading(true);

    setTimeout(() => {
    // Update installment payment
    const studentIndex = studentsFeesData.findIndex(s => s.id === selectedStudentForPayment.id);
    if (studentIndex !== -1) {
        const student = studentsFeesData[studentIndex];
        const installment = student.installments[currentSelectedInstallmentIndex];
        
        // Update installment paid amount
        installment.paid = (installment.paid || 0) + paymentAmount;
        
        // Update installment status
        if (installment.paid >= installment.amount) {
            installment.status = 'paid';
        } else if (installment.paid > 0) {
            installment.status = 'partial';
        }
        
        // Update student totals correctly
        student.paid = student.installments.reduce((sum, inst) => sum + (inst.paid || 0), 0);
        student.total = student.installments.reduce((sum, inst) => sum + inst.amount, 0);
        student.balance = Math.max(0, student.total - student.paid);
        
        // Update student status
        updateStudentStatusFromInstallments(student);
    }

        // Add to receipts data
        receiptsData.unshift(receipt);

        // Update UI
        populateFeesTable(studentsFeesData);
        populateReceiptsGrid(receiptsData);
        updateFeesStats();

        // Show success message
        showToast(`Payment of ₹${paymentAmount.toLocaleString()} collected successfully! Receipt: ${receiptNo}`, 'success');

        // Close modal
        closeCollectPaymentModal();
        showLoading(false);

        // Show receipt
        viewReceipt(receiptNo);

    }, 1500);
}

// FIXED VERSION:
function updateStudentStatusFromInstallments(student) {
    if (!student.installments || student.installments.length === 0) {
        student.status = 'Unpaid';
        student.total = 0;
        student.paid = 0;
        student.balance = 0;
        return;
    }
    
    let totalPaid = 0;
    let totalAmount = 0;
    let allPaid = true;
    let anyPartial = false;
    let anyOverdue = false;
    
    // Get current date for overdue check
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    student.installments.forEach(installment => {
        totalAmount += installment.amount;
        const paidAmount = installment.paid || 0;
        totalPaid += paidAmount;
        
        const dueDate = new Date(installment.dueDate);
        const remainingAmount = installment.amount - paidAmount;
        
        // Update installment status based on payment and due date
        if (paidAmount >= installment.amount) {
            installment.status = 'paid';
        } else if (paidAmount > 0) {
            installment.status = 'partial';
            anyPartial = true;
        } else {
            installment.status = 'unpaid';
        }
        
        // Check if overdue
        if (remainingAmount > 0 && dueDate < today) {
            anyOverdue = true;
        }
        
        // Check if all installments are paid
        if (paidAmount < installment.amount) {
            allPaid = false;
        }
    });
    
    // Update student totals
    student.total = totalAmount;
    student.paid = totalPaid;
    student.balance = Math.max(0, totalAmount - totalPaid); // Ensure non-negative balance
    
    // Determine overall student status
    if (allPaid) {
        student.status = 'Paid';
    } else if (student.balance > 0 && anyOverdue) {
        student.status = 'Overdue';
    } else if (anyPartial || totalPaid > 0) {
        student.status = 'Partial Paid';
    } else {
        student.status = 'Unpaid';
    }
}

// View receipt
function viewReceipt(receiptNo) {
    const receipt = receiptsData.find(r => r.receiptNo === receiptNo);
    if (!receipt) {
        showToast('Receipt not found', 'error');
        return;
    }

    const modal = document.getElementById('viewReceiptModalOverlay');
    const modalContent = modal.querySelector('.modal-content');

    modalContent.innerHTML = `
        <div class="p-8">
            <div class="text-center mb-8">
                <h2 class="text-2xl font-bold text-gray-800 mb-2">Fee Payment Receipt</h2>
                <p class="text-gray-600">Official Receipt</p>
            </div>
            
            <div class="border-2 border-gray-300 rounded-xl p-8 mb-6">
                <div class="flex justify-between items-start mb-8">
                    <div>
                        <h3 class="text-xl font-bold text-gray-800">Kunash International School</h3>
                        <p class="text-gray-600">123 Education Street, City, State 123456</p>
                        <p class="text-gray-600">Phone: (123) 456-7890 | Email: info@kunashschool.edu</p>
                    </div>
                    <div class="text-right">
                        <p class="text-lg font-bold text-blue-600">RECEIPT</p>
                        <p class="text-gray-800 font-medium">${receipt.receiptNo}</p>
                        <p class="text-gray-600">Date: ${receipt.date}</p>
                        ${receipt.installmentNumber ? `<p class="text-gray-600">Installment: ${receipt.installmentNumber}</p>` : ''}
                    </div>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div>
                        <h4 class="font-semibold text-gray-700 mb-2">Student Details</h4>
                        <p class="text-gray-800"><strong>Name:</strong> ${receipt.studentName}</p>
                        <p class="text-gray-800"><strong>Student ID:</strong> ${receipt.studentId}</p>
                        <p class="text-gray-800"><strong>Class:</strong> ${receipt.class}</p>
                    </div>
                    <div>
                        <h4 class="font-semibold text-gray-700 mb-2">Payment Details</h4>
                        <p class="text-gray-800"><strong>Payment Method:</strong> ${receipt.method}</p>
                        ${receipt.chequeNo ? `<p class="text-gray-800"><strong>Cheque No:</strong> ${receipt.chequeNo}</p>` : ''}
                        ${receipt.bankName ? `<p class="text-gray-800"><strong>Bank:</strong> ${receipt.bankName}</p>` : ''}
                        ${receipt.transactionId ? `<p class="text-gray-800"><strong>Transaction ID:</strong> ${receipt.transactionId}</p>` : ''}
                    </div>
                </div>
                
                <div class="border-t border-b border-gray-300 py-4 mb-6">
                    <div class="flex justify-between items-center">
                        <div>
                            <p class="text-gray-700">Amount Received</p>
                        </div>
                        <div>
                            <p class="text-3xl font-bold text-green-600">₹${receipt.amount.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
                
                <div class="mb-8">
                    <h4 class="font-semibold text-gray-700 mb-2">Payment Description</h4>
                    <p class="text-gray-800">Tuition fee payment for the academic year 2024-2025</p>
                    ${receipt.installmentNumber ? `<p class="text-gray-800"><strong>Installment:</strong> ${receipt.installmentNumber}</p>` : ''}
                    ${receipt.notes ? `<p class="text-gray-800 mt-2"><strong>Notes:</strong> ${receipt.notes}</p>` : ''}
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10 pt-8 border-t border-gray-300">
                    <div>
                        <p class="text-gray-700 mb-1">Authorized Signature</p>
                        <div class="h-16 border-t border-gray-400"></div>
                        <p class="text-gray-600 text-sm mt-2">School Administrator</p>
                    </div>
                    <div>
                        <p class="text-gray-700 mb-1">Parent/Guardian Signature</p>
                        <div class="h-16 border-t border-gray-400"></div>
                        <p class="text-gray-600 text-sm mt-2">Received by</p>
                    </div>
                </div>
            </div>
            
            <div class="flex justify-between">
                <button onclick="closeViewReceiptModal()" class="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium">
                    Close
                </button>
                <div class="space-x-3">
                    <button onclick="downloadReceipt('${receipt.receiptNo}')" class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium">
                        <i class="fas fa-download mr-2"></i>Download PDF
                    </button>
                    <button onclick="printReceipt('${receipt.receiptNo}')" class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 font-medium">
                        <i class="fas fa-print mr-2"></i>Print Receipt
                    </button>
                </div>
            </div>
        </div>
    `;

    modal.classList.add('show');
}

// Close view receipt modal
function closeViewReceiptModal() {
    const modal = document.getElementById('viewReceiptModalOverlay');
    modal.classList.remove('show');
}

// Download receipt
function downloadReceipt(receiptNo) {
    showToast(`Downloading receipt ${receiptNo}...`, 'info');
    // In a real app, this would generate and download a PDF
}

// Print receipt
function printReceipt(receiptNo) {
    showToast(`Printing receipt ${receiptNo}...`, 'info');
    // In a real app, this would open print dialog
}

// Collect payment for specific student
function collectPaymentForStudent(studentId) {
    openCollectPaymentModal(studentId);
}

// View student fees details
function viewStudentFees(studentId) {
    const student = studentsFeesData.find(s => s.id === studentId);
    if (!student) {
        showToast('Student not found!', 'error');
        return;
    }

    // Create and show a detailed view modal
    showStudentFeesDetailsModal(student);
}

// Show student fees details modal
function showStudentFeesDetailsModal(student) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay show';
    modal.innerHTML = `
        <div class="bg-white rounded-xl shadow-2xl modal-content w-full max-w-4xl">
            <div class="p-6">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-xl font-bold text-gray-800">Fees Details - ${student.name}</h3>
                    <button onclick="closeModal(this)" class="text-gray-500 hover:text-gray-700">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 class="font-semibold text-gray-800 mb-3">Student Information</h4>
                        <div class="space-y-2">
                            <p><span class="font-medium text-gray-700">Name:</span> ${student.name}</p>
                            <p><span class="font-medium text-gray-700">Student ID:</span> ${student.id}</p>
                            <p><span class="font-medium text-gray-700">Class:</span> ${student.class} - Section ${student.section}</p>
                            <p><span class="font-medium text-gray-700">Parent:</span> ${student.parent}</p>
                        </div>
                    </div>
                    
                    <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h4 class="font-semibold text-gray-800 mb-3">Fees Summary</h4>
                        <div class="space-y-2">
                            <p><span class="font-medium text-gray-700">Total Fees:</span> ₹${student.total.toLocaleString()}</p>
                            <p><span class="font-medium text-green-600">Paid Amount:</span> ₹${student.paid.toLocaleString()}</p>
                            <p><span class="font-medium ${student.balance > 0 ? 'text-red-600' : 'text-green-600'}">Balance:</span> ₹${student.balance.toLocaleString()}</p>
                            <p><span class="font-medium text-gray-700">Status:</span> <span class="status-badge ${getStatusClass(student.status)}">${student.status}</span></p>
                        </div>
                    </div>
                </div>
                
                <!-- Installment Details -->
                <div class="mb-8">
                    <h4 class="font-semibold text-gray-800 mb-4">Installment Details</h4>
                    ${student.installments && student.installments.length > 0 ? 
                        student.installments.map((installment, index) => `
                            <div class="installment-card ${getInstallmentCardClass(installment.status)} mb-3">
                                <div class="flex justify-between items-center">
                                    <div>
                                        <p class="font-medium text-gray-800">Installment ${index + 1}</p>
                                        <div class="flex items-center space-x-3 mt-1">
                                            <span class="text-sm ${getInstallmentStatusColor(installment.status)}">
                                                ${installment.status.toUpperCase()}
                                            </span>
                                            <span class="text-xs text-gray-500">•</span>
                                            <span class="text-sm text-gray-600">Due: ${formatDate(installment.dueDate)}</span>
                                            <span class="text-xs text-gray-500">•</span>
                                            <span class="text-sm font-medium">Amount: ₹${installment.amount.toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <div class="text-right">
                                        ${installment.paid ? `<p class="text-sm text-green-600">Paid: ₹${installment.paid.toLocaleString()}</p>` : ''}
                                        ${(installment.amount - (installment.paid || 0)) > 0 ? 
                                            `<p class="text-sm text-red-600">Remaining: ₹${(installment.amount - (installment.paid || 0)).toLocaleString()}</p>` : 
                                            ''}
                                    </div>
                                </div>
                            </div>
                        `).join('') :
                        '<p class="text-gray-500 text-center py-4">No installments created</p>'
                    }
                </div>
                
                <!-- Payment Progress -->
                <div class="mb-8">
                    <h4 class="font-semibold text-gray-800 mb-3">Payment Progress</h4>
                    <div class="bg-gray-100 rounded-lg p-4">
                        <div class="flex justify-between mb-2">
                            <span class="text-sm font-medium text-gray-700">Payment Completion</span>
                            <span class="text-sm font-medium text-gray-700">${Math.round((student.paid / student.total) * 100)}%</span>
                        </div>
                        <div class="progress-bar w-full h-4">
                            <div class="progress-fill ${student.balance <= 0 ? 'bg-green-500' : 'bg-yellow-500'}" 
                                 style="width: ${Math.min((student.paid / student.total) * 100, 100)}%"></div>
                        </div>
                        <div class="flex justify-between mt-2 text-sm text-gray-600">
                            <span>₹0</span>
                            <span>₹${student.total.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
                
                <!-- Payment History -->
                <div class="mb-8">
                    <div class="flex justify-between items-center mb-4">
                        <h4 class="font-semibold text-gray-800">Payment History</h4>
                        <button onclick="closeDetailsAndOpenCollectPayment('${student.id}')" class="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 text-sm font-medium">
                            <i class="fas fa-money-bill-wave mr-2"></i>Collect Payment
                        </button>
                    </div>
                    
                    <div class="overflow-x-auto rounded-lg border border-gray-200">
                        <table class="w-full">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Receipt No</th>
                                    <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                                    <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                                    <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Method</th>
                                    <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-200">
                                ${generatePaymentHistory(student.id)}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <!-- Actions -->
                <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                    <button onclick="closeModal(this)" class="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium">
                        Close
                    </button>
                    <button onclick="printStudentFeesReport('${student.id}')" class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium">
                        <i class="fas fa-print mr-2"></i>Print Report
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

// Add this function to close details modal and open collect payment
function closeDetailsAndOpenCollectPayment(studentId) {
    // Find and close the current details modal
    const detailsModal = document.querySelector('.modal-overlay.show');
    if (detailsModal) {
        detailsModal.classList.remove('show');
        setTimeout(() => {
            detailsModal.remove();
        }, 300);
    }
    
    // Open collect payment modal
    setTimeout(() => {
        openCollectPaymentModal(studentId);
    }, 350);
}

// Helper function to generate payment history HTML
function generatePaymentHistory(studentId) {
    // Filter receipts for this student
    const studentReceipts = receiptsData.filter(r => r.studentId === studentId);

    if (studentReceipts.length === 0) {
        return `
            <tr>
                <td colspan="5" class="px-4 py-6 text-center text-gray-500">
                    <i class="fas fa-receipt text-3xl mb-3"></i>
                    <p>No payment history found</p>
                </td>
            </tr>
        `;
    }

    // Return only the last 5 receipts for the modal
    const recentReceipts = studentReceipts.slice(0, 5);

    return recentReceipts.map(receipt => `
        <tr class="hover:bg-gray-50">
            <td class="px-4 py-3 text-sm font-medium text-blue-600">${receipt.receiptNo}</td>
            <td class="px-4 py-3 text-sm text-gray-700">${receipt.date}</td>
            <td class="px-4 py-3 text-sm font-medium text-green-600">₹${receipt.amount.toLocaleString()}</td>
            <td class="px-4 py-3 text-sm text-gray-700">
                <span class="inline-flex items-center">
                    <i class="fas fa-${getPaymentMethodIcon(receipt.method)} mr-2"></i>
                    ${receipt.method}
                </span>
            </td>
            <td class="px-4 py-3">
                <span class="status-badge status-paid">Paid</span>
            </td>
        </tr>
    `).join('');
}

// Close modal function
function closeModal(button) {
    const modal = button.closest('.modal-overlay');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
}

// Print student fees report
function printStudentFeesReport(studentId) {
    const student = studentsFeesData.find(s => s.id === studentId);
    if (!student) return;

    showToast(`Printing fees report for ${student.name}`, 'info');
    // In a real app, this would open a print dialog with the student's fees report
}

// Send reminder
function sendReminder(studentId) {
    const student = studentsFeesData.find(s => s.id === studentId);
    if (!student) return;

    showToast(`Reminder sent to ${student.parent} for ${student.name}'s fees`, 'success');
}

// Generate report
function generateReport() {
    const reportType = document.getElementById('reportType').value;
    showToast(`Generating ${reportType} report...`, 'info');

    // In a real app, this would generate and display the report
    document.getElementById('reportResults').classList.remove('hidden');
}

// Reset report filters
function resetReportFilters() {
    // Reset report type to default
    document.getElementById('reportType').value = 'collection';

    // Reset academic year to default
    document.getElementById('reportAcademicYear').value = '2024-2025';

    // Reset date range to default (April 1, 2024 to September 30, 2024)
    const dateRangeInput = document.getElementById('reportDateRange');

    // If using flatpickr, we need to access the flatpickr instance
    const fp = dateRangeInput._flatpickr;
    if (fp) {
        fp.clear();
        fp.setDate(["2024-04-01", "2024-09-30"], true);
    } else {
        // Fallback if flatpickr is not initialized
        dateRangeInput.value = "2024-04-01 to 2024-09-30";
    }

    // Hide any existing report results
    document.getElementById('reportResults').classList.add('hidden');

    // Show toast notification
    showToast('Report filters have been reset to default values', 'success');
}

// Export report
function exportReport() {
    showToast('Exporting report data...', 'info');
}

// Export fees data
function exportFeesData() {
    showToast('Exporting fees data to Excel...', 'info');
}

// Update fees stats
function updateFeesStats() {
    // Calculate totals
    let totalCollected = 0;
    let totalPending = 0;

    studentsFeesData.forEach(student => {
        totalCollected += student.paid;
        if (student.balance > 0) {
            totalPending += student.balance;
        }
    });

    // Update UI
    document.getElementById('totalFeesCollected').textContent = '₹' + totalCollected.toLocaleString();
    document.getElementById('pendingPayments').textContent = '₹' + totalPending.toLocaleString();
}

// Show toast notification
function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toastContainer');

    const toast = document.createElement('div');
    toast.className = `toast ${type === 'success' ? 'bg-green-100 border border-green-200 text-green-800' :
        type === 'error' ? 'bg-red-100 border border-red-200 text-red-800' :
            'bg-blue-100 border border-blue-200 text-blue-800'}`;

    toast.innerHTML = `
        <div class="flex items-center">
            <i class="fas ${type === 'success' ? 'fa-check-circle' :
        type === 'error' ? 'fa-exclamation-circle' :
            'fa-info-circle'} mr-3"></i>
            <div>${message}</div>
        </div>
    `;

    toastContainer.appendChild(toast);

    // Show toast
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);

    // Remove toast after 5 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 5000);
}

// Show/hide loading overlay
function showLoading(show) {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (show) {
        loadingOverlay.classList.remove('hidden');
    } else {
        loadingOverlay.classList.add('hidden');
    }
}

// Get status class for badges
function getStatusClass(status) {
    switch (status) {
        case 'Paid': return 'status-paid';
        case 'Partial Paid': return 'status-partial';
        case 'Unpaid': return 'status-unpaid';
        default: return 'status-pending';
    }
}

// Get payment method icon
function getPaymentMethodIcon(method) {
    switch (method.toLowerCase()) {
        case 'cash': return 'money-bill-wave';
        case 'online': return 'university';
        default: return 'money-bill-wave';
    }
}

// Get payment method color
function getPaymentMethodColor(method) {
    switch (method.toLowerCase()) {
        case 'cash': return { bg: 'bg-green-100', text: 'text-green-600' };
        case 'online': return { bg: 'bg-purple-100', text: 'text-purple-600' };
        default: return { bg: 'bg-green-100', text: 'text-green-600' };
    }
}

// Get installment status color
function getInstallmentStatusColor(status) {
    switch (status) {
        case 'paid': return 'text-green-600';
        case 'partial': return 'text-yellow-600';
        case 'unpaid': return 'text-red-600';
        default: return 'text-gray-600';
    }
}

// Get installment card class
function getInstallmentCardClass(status) {
    switch (status) {
        case 'paid': return 'paid';
        case 'partial': return 'partial';
        case 'unpaid': return 'unpaid';
        default: return '';
    }
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
}

// Sample data for demonstration with installments
function getSampleStudentsFeesData() {
    return [
        {
            id: 'STU2024001', 
            name: 'Rohan Sharma', 
            parent: 'Mr. Sharma', 
            class: '10', 
            section: 'A', 
            total: 50000, 
            paid: 50000, 
            balance: 0, 
            status: 'Paid',
            installments: [
                { amount: 20000, dueDate: '2024-04-15', status: 'paid', paid: 20000 },
                { amount: 15000, dueDate: '2024-06-15', status: 'paid', paid: 15000 },
                { amount: 15000, dueDate: '2024-08-15', status: 'paid', paid: 15000 }
            ]
        },
        {
            id: 'STU2024002', 
            name: 'Priya Patel', 
            parent: 'Mrs. Patel', 
            class: '8', 
            section: 'B', 
            total: 45000, 
            paid: 25000, 
            balance: 20000, 
            status: 'Partial Paid',
            installments: [
                { amount: 15000, dueDate: '2024-04-15', status: 'paid', paid: 15000 },
                { amount: 15000, dueDate: '2024-06-15', status: 'partial', paid: 10000 },
                { amount: 15000, dueDate: '2024-08-15', status: 'unpaid', paid: 0 }
            ]
        },
        {
            id: 'STU2024003', 
            name: 'Aarav Singh', 
            parent: 'Mr. Singh', 
            class: '6', 
            section: 'C', 
            total: 40000, 
            paid: 0, 
            balance: 40000, 
            status: 'Unpaid',
            installments: [
                { amount: 15000, dueDate: '2024-04-15', status: 'unpaid', paid: 0 },
                { amount: 15000, dueDate: '2024-06-15', status: 'unpaid', paid: 0 },
                { amount: 10000, dueDate: '2024-08-15', status: 'unpaid', paid: 0 }
            ]
        },
        {
            id: 'STU2024004', 
            name: 'Neha Gupta', 
            parent: 'Mr. Gupta', 
            class: '9', 
            section: 'A', 
            total: 48000, 
            paid: 24000, 
            balance: 24000, 
            status: 'Partial Paid',
            installments: [
                { amount: 16000, dueDate: '2024-04-15', status: 'paid', paid: 16000 },
                { amount: 16000, dueDate: '2024-06-15', status: 'partial', paid: 8000 },
                { amount: 16000, dueDate: '2024-08-15', status: 'unpaid', paid: 0 }
            ]
        },
        {
            id: 'STU2024005', 
            name: 'Aditya Verma', 
            parent: 'Mrs. Verma', 
            class: '7', 
            section: 'B', 
            total: 42000, 
            paid: 21000, 
            balance: 21000, 
            status: 'Partial Paid',
            installments: [
                { amount: 14000, dueDate: '2024-04-15', status: 'paid', paid: 14000 },
                { amount: 14000, dueDate: '2024-06-15', status: 'partial', paid: 7000 },
                { amount: 14000, dueDate: '2024-08-15', status: 'unpaid', paid: 0 }
            ]
        }
    ];
}

function getSampleReceiptsData() {
    return [
        { receiptNo: 'F20240018', studentName: 'Rohan Sharma', studentId: 'STU2024001', class: '10-A', amount: 12500, date: '15 Apr 2024', method: 'Cash', chequeNo: '', bankName: '', transactionId: '', installmentNumber: 1 },
        { receiptNo: 'F20240017', studentName: 'Priya Patel', studentId: 'STU2024002', class: '8-B', amount: 8000, date: '14 Apr 2024', method: 'Online', chequeNo: '', bankName: 'State Bank', transactionId: 'TXN78901234', installmentNumber: 2 },
        { receiptNo: 'F20240016', studentName: 'Aarav Singh', studentId: 'STU2024003', class: '6-C', amount: 15000, date: '13 Apr 2024', method: 'Online', chequeNo: '', bankName: 'HDFC Bank', transactionId: 'TXN78901235', installmentNumber: 1 },
        { receiptNo: 'F20240015', studentName: 'Neha Gupta', studentId: 'STU2024004', class: '9-A', amount: 10500, date: '12 Apr 2024', method: 'Cash', chequeNo: '', bankName: '', transactionId: '', installmentNumber: 1 },
        { receiptNo: 'F20240014', studentName: 'Aditya Verma', studentId: 'STU2024005', class: '7-B', amount: 8500, date: '10 Apr 2024', method: 'Cash', chequeNo: '', bankName: '', transactionId: '', installmentNumber: 2 },
        { receiptNo: 'F20240013', studentName: 'Sanya Reddy', studentId: 'STU2024006', class: '5-A', amount: 6200, date: '8 Apr 2024', method: 'Online', chequeNo: '', bankName: 'ICICI Bank', transactionId: 'TXN78901236', installmentNumber: 1 }
    ];
}
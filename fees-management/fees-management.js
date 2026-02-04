

// ============================================================================
// FEES MANAGEMENT MODULE - MAIN JAVASCRIPT
// ============================================================================

// Global variables
let currentFeesTab = 'students'; // Changed from 'overview' to 'students'
let monthlyCollectionChart = null;
let feeStatusChart = null;
let selectedStudentForPayment = null;
let receiptsData = [];
let studentsFeesData = [];

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
                // In a real app, you would show fee structure modal
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
        // Load students fees data
        studentsFeesData = getSampleStudentsFeesData();
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

    // Payment amount input
    const paymentAmountInput = document.getElementById('paymentAmount');
paymentAmountInput.addEventListener('input', function() {
    updatePaymentSummary();

    // Also update QR code if online payment is selected
    const paymentMethod = document.querySelector('input[name="paymentMethodModal"]:checked').value;
    if (paymentMethod === 'online') {
        generateQRCodeForPayment();
    }
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
            (statusFilter === 'pending' && student.status === 'Unpaid');


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

    // If studentId is provided, pre-select that student
    if (studentId) {
        const student = studentsFeesData.find(s => s.id === studentId);
        if (student) {
            selectStudentForPayment(student);
        }
    }

    // Reset form
    document.getElementById('paymentAmount').value = '';
    document.getElementById('paymentNotes').value = '';
    document.getElementById('chequeNumber').value = '';
    document.getElementById('bankName').value = '';
    document.getElementById('transactionId').value = '';

    // Reset payment method to cash
    document.querySelector('input[name="paymentMethodModal"][value="cash"]').checked = true;
    togglePaymentMethodDetails('cash');

    updatePaymentSummary();
}

// Close collect payment modal
function closeCollectPaymentModal() {
    const modal = document.getElementById('collectPaymentModalOverlay');
    modal.classList.remove('show');
    selectedStudentForPayment = null;

    // Clear search results
    document.getElementById('studentSearchResults').classList.add('hidden');
    document.getElementById('selectedStudentInfo').classList.add('hidden');
    document.getElementById('studentSearchInput').value = '';
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

    // Set suggested payment amount (balance)
    document.getElementById('paymentAmount').value = student.balance;

    updatePaymentSummary();
}

// Toggle payment method details
function togglePaymentMethodDetails(method) {
    const qrCodeSection = document.getElementById('qrCodeSection');
    const transactionDetails = document.getElementById('transactionDetails');
    const bankDetails = document.getElementById('bankDetails');
    
    // Hide all detail sections first
    transactionDetails.classList.add('hidden');
    bankDetails.classList.add('hidden');
    qrCodeSection.classList.add('hidden');
    
    // Show relevant sections based on method
    if (method === 'online') {
        transactionDetails.classList.remove('hidden');
        bankDetails.classList.remove('hidden');
        qrCodeSection.classList.remove('hidden');
        
        // Generate QR code with current amount
        generateQRCodeForPayment();
    }
    
    updatePaymentSummary();
}

// Generate QR code for online payment
function generateQRCodeForPayment() {
    const paymentAmount = document.getElementById('paymentAmount').value || 0;
    const studentName = selectedStudentForPayment ? selectedStudentForPayment.name : 'School Fees';
    const studentId = selectedStudentForPayment ? selectedStudentForPayment.id : '';
    
    // Update QR amount display
    document.getElementById('qrAmountDisplay').textContent = parseInt(paymentAmount).toLocaleString();
    
    // Create UPI payment string
    const upiId = 'school.fees@upi';
    const paymentNote = `Fees for ${studentName} (${studentId})`;
    
    // Format UPI payment URL
    const upiUrl = `upi://pay?pa=${upiId}&pn=Kunash%20International%20School&am=${paymentAmount}&tn=${encodeURIComponent(paymentNote)}&cu=INR`;
    
    // Generate QR code
    const qrCodeContainer = document.getElementById('qrCodeContainer');
    qrCodeContainer.innerHTML = '';
    
    // Using qrcode-generator library
    const typeNumber = 0; // Auto type
    const errorCorrectionLevel = 'L'; // Low error correction
    const qr = qrcode(typeNumber, errorCorrectionLevel);
    qr.addData(upiUrl);
    qr.make();
    
    // Create QR code as SVG
    const svgString = qr.createSvgTag({
        cellSize: 8,
        margin: 4,
        scalable: true
    });
    
    qrCodeContainer.innerHTML = svgString;
    
    // Alternative: If using qrcode.js library
    /*
    QRCode.toCanvas(document.createElement('canvas'), upiUrl, {
        width: 200,
        margin: 2,
        color: {
            dark: '#000000',
            light: '#FFFFFF'
        }
    }, function(error, canvas) {
        if (error) {
            console.error('QR Code generation error:', error);
            // Show fallback text
            qrCodeContainer.innerHTML = `
                <div class="text-center p-4">
                    <i class="fas fa-qrcode text-4xl text-gray-400 mb-2"></i>
                    <p class="text-sm text-gray-600">QR Code would appear here</p>
                    <p class="text-xs text-gray-500 mt-2">UPI: ${upiId}</p>
                    <p class="text-xs text-gray-500">Amount: ₹${paymentAmount}</p>
                </div>
            `;
        } else {
            qrCodeContainer.innerHTML = '';
            qrCodeContainer.appendChild(canvas);
        }
    });
    */
}

// Alternative simpler QR code generation (if library doesn't work)
function generateSimpleQRCode() {
    const paymentAmount = document.getElementById('paymentAmount').value || 0;
    const qrCodeContainer = document.getElementById('qrCodeContainer');
    
    // Create a simple visual QR code representation
    qrCodeContainer.innerHTML = `
        <div class="text-center">
            <div class="inline-block bg-white p-2 border-2 border-black mb-2">
                <div class="grid grid-cols-5 gap-1">
                    <!-- Top left square -->
                    <div class="col-span-3 row-span-3 bg-black"></div>
                    <div class="bg-white"></div>
                    <div class="bg-white"></div>
                    <div class="bg-white"></div>
                    <div class="bg-black"></div>
                    <div class="bg-white"></div>
                    <!-- QR pattern representation -->
                    ${Array(25).fill(0).map((_, i) => 
                        `<div class="w-4 h-4 ${Math.random() > 0.5 ? 'bg-black' : 'bg-white'}"></div>`
                    ).join('')}
                </div>
            </div>
            <p class="text-sm font-medium text-gray-800">QR Code for ₹${parseInt(paymentAmount).toLocaleString()}</p>
            <p class="text-xs text-gray-600">Scan with any UPI app</p>
        </div>
    `;
}

// Update payment summary
function updatePaymentSummary() {
    const studentName = selectedStudentForPayment ? selectedStudentForPayment.name : 'Not selected';
    const paymentAmount = document.getElementById('paymentAmount').value || 0;
    const paymentMethod = document.querySelector('input[name="paymentMethodModal"]:checked').value;
    
    // Format payment method for display
    let methodDisplay = 'Cash';
    if (paymentMethod === 'online') methodDisplay = 'Online Transfer';
    
    // Update summary
    document.getElementById('summaryStudentName').textContent = studentName;
    document.getElementById('summaryPaymentAmount').textContent = '₹' + parseInt(paymentAmount).toLocaleString();
    document.getElementById('summaryPaymentMethod').textContent = methodDisplay;
    document.getElementById('summaryTotalAmount').textContent = '₹' + parseInt(paymentAmount).toLocaleString();
    
    // Update QR code if online payment is selected
    if (paymentMethod === 'online') {
        generateQRCodeForPayment();
    }
}

// Process payment
function processPayment() {
    // Validate form
    if (!selectedStudentForPayment) {
        showToast('Please select a student', 'error');
        return;
    }

    const paymentAmount = parseFloat(document.getElementById('paymentAmount').value);
    if (!paymentAmount || paymentAmount <= 0) {
        showToast('Please enter a valid payment amount', 'error');
        return;
    }

    if (paymentAmount > selectedStudentForPayment.balance) {
        showToast('Payment amount cannot exceed balance', 'error');
        return;
    }

    const paymentMethod = document.querySelector('input[name="paymentMethodModal"]:checked').value;
    const paymentDate = document.getElementById('paymentDate').value;
    const notes = document.getElementById('paymentNotes').value;

    // Get additional details based on payment method
    let chequeNo = '', bankName = '', transactionId = '';


    if (paymentMethod === 'online') {
        transactionId = document.getElementById('transactionId').value;
        bankName = document.getElementById('bankName').value;
        if (!transactionId || !bankName) {
            showToast('Please enter transaction ID and bank name for online payment', 'error');
            return;
        }
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
        chequeNo: chequeNo,
        bankName: bankName,
        transactionId: transactionId,
        notes: notes
    };

    // In a real app, you would send this to the server
    console.log('Processing payment:', receipt);

    // Simulate API call
    showLoading(true);

    setTimeout(() => {
        // Add to receipts data
        receiptsData.unshift(receipt);

        // Update student balance
        const studentIndex = studentsFeesData.findIndex(s => s.id === selectedStudentForPayment.id);
        if (studentIndex !== -1) {
            studentsFeesData[studentIndex].paid += paymentAmount;
            studentsFeesData[studentIndex].balance -= paymentAmount;

            // Update status
            if (studentsFeesData[studentIndex].balance <= 0) {
                studentsFeesData[studentIndex].status = 'Paid';
            } else {
                studentsFeesData[studentIndex].status = 'Unpaid';
            }
        }

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
                
                <!-- Payment History (Mock Data) -->
                <div class="mb-8">
                    <div class="flex justify-between items-center mb-4">
                        <h4 class="font-semibold text-gray-800">Payment History</h4>
                        <button onclick="collectPaymentForStudent('${student.id}')" class="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 text-sm font-medium">
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
    // First, we need to clear the existing date range
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

// Update fees stats - Removed collection rate and overdue calculations
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
        case 'Unpaid': return 'status-pending';
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


// Sample data for demonstration
function getSampleStudentsFeesData() {
    return [
        { id: 'STU2024001', name: 'Rohan Sharma', parent: 'Mr. Sharma', class: '10', section: 'A', total: 50000, paid: 50000, balance: 0, status: 'Paid' },
        { id: 'STU2024002', name: 'Priya Patel', parent: 'Mrs. Patel', class: '8', section: 'B', total: 45000, paid: 37000, balance: 8000, status: 'Unpaid' },
        { id: 'STU2024003', name: 'Aarav Singh', parent: 'Mr. Singh', class: '6', section: 'C', total: 40000, paid: 25000, balance: 15000, status: 'Unpaid' },
        { id: 'STU2024004', name: 'Neha Gupta', parent: 'Mr. Gupta', class: '9', section: 'A', total: 48000, paid: 37500, balance: 10500, status: 'Unpaid' },
        { id: 'STU2024005', name: 'Aditya Verma', parent: 'Mrs. Verma', class: '7', section: 'B', total: 42000, paid: 33500, balance: 8500, status: 'Unpaid' },
        { id: 'STU2024006', name: 'Sanya Reddy', parent: 'Mr. Reddy', class: '5', section: 'A', total: 35000, paid: 28800, balance: 6200, status: 'Unpaid' },
        { id: 'STU2024007', name: 'Karan Malhotra', parent: 'Mrs. Malhotra', class: '10', section: 'C', total: 50000, paid: 38000, balance: 12000, status: 'Unpaid' },
        { id: 'STU2024008', name: 'Meera Joshi', parent: 'Mr. Joshi', class: '8', section: 'A', total: 45000, paid: 35200, balance: 9800, status: 'Unpaid' },
        { id: 'STU2024009', name: 'Vikram Das', parent: 'Mrs. Das', class: '4', section: 'B', total: 32000, paid: 32000, balance: 0, status: 'Paid' },
        { id: 'STU2024010', name: 'Ananya Roy', parent: 'Mr. Roy', class: '3', section: 'A', total: 30000, paid: 24000, balance: 6000, status: 'Unpaid' }
    ];
}

function getSampleReceiptsData() {
    return [
        { receiptNo: 'F20240018', studentName: 'Rohan Sharma', studentId: 'STU2024001', class: '10-A', amount: 12500, date: '15 Apr 2024', method: 'Cash', chequeNo: '', bankName: '', transactionId: '' },
        { receiptNo: 'F20240017', studentName: 'Priya Patel', studentId: 'STU2024002', class: '8-B', amount: 8000, date: '14 Apr 2024', method: 'Online', chequeNo: '', bankName: 'State Bank', transactionId: 'TXN78901234' },
        { receiptNo: 'F20240016', studentName: 'Aarav Singh', studentId: 'STU2024003', class: '6-C', amount: 15000, date: '13 Apr 2024', method: 'Online', chequeNo: '', bankName: 'HDFC Bank', transactionId: 'TXN78901235' },
        { receiptNo: 'F20240015', studentName: 'Neha Gupta', studentId: 'STU2024004', class: '9-A', amount: 10500, date: '12 Apr 2024', method: 'Cash', chequeNo: '', bankName: '', transactionId: '' },
        { receiptNo: 'F20240014', studentName: 'Aditya Verma', studentId: 'STU2024005', class: '7-B', amount: 8500, date: '10 Apr 2024', method: 'Cash', chequeNo: '', bankName: '', transactionId: '' },
        { receiptNo: 'F20240013', studentName: 'Sanya Reddy', studentId: 'STU2024006', class: '5-A', amount: 6200, date: '8 Apr 2024', method: 'Online', chequeNo: '', bankName: 'ICICI Bank', transactionId: 'TXN78901236' }
    ];
}
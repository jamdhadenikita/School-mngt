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
let qrCodeGenerated = false;

// Dummy Students Data with comprehensive details
let dummyStudents = [
    {
        id: "STU25001",
        firstName: "Rohan",
        middleName: "Kumar",
        lastName: "Sharma",
        fullName: "Rohan Kumar Sharma",
        studentId: "STU25001",
        class: "10",
        section: "A",
        rollNumber: "25",
        fatherName: "Mr. Rajesh Sharma",
        motherName: "Mrs. Priya Sharma",
        fatherContact: "9876543210",
        motherContact: "9876500000",
        parentEmail: "sharma.family@example.com",
        contact: "9876543210",
        email: "rohan.s@example.com",
        feesStatus: "paid",
        studentStatus: "active",
        admissionDate: "2023-04-01",
        attendance: "96%",
        totalFees: 50000,
        paidFees: 50000,
        pendingFees: 0,
        dob: "2008-05-15",
        gender: "Male",
        bloodGroup: "O+",
        casteCategory: "General",
        aadharNumber: "123456789012",
        fatherAadhar: "234567890123",
        motherAadhar: "345678901234",
        localAddressLine1: "123 MG Road",
        localAddressLine2: "Near City Center",
        localCity: "Bangalore",
        localState: "Karnataka",
        localPincode: "560001",
        localAddress: "123 MG Road, Bangalore, Karnataka - 560001",
        permanentAddressLine1: "123 MG Road",
        permanentAddressLine2: "Near City Center",
        permanentCity: "Bangalore",
        permanentState: "Karnataka",
        permanentPincode: "560001",
        permanentAddress: "123 MG Road, Bangalore, Karnataka - 560001",
        fatherOccupation: "Engineer",
        motherOccupation: "Teacher",
        academicYear: "2024-2025",
        classTeacher: "Mr. Sharma",
        subjects: ["english", "mathematics", "science", "social"],
        sports: ["cricket", "chess"],
        otherSports: [],
        otherSubjects: [],
        medicalInfo: "No known allergies",
        previousSchool: "St. Mary's Convent",
        emergencyContactName: "Mr. Ramesh Sharma",
        emergencyContactNumber: "9876512345",
        relationship: "Father",
        paymentMethod: "online",
        paymentMode: "one-time",
        transactionId: "TXN123456789",
        admissionFees: 5000,
        uniformFees: 2000,
        bookFees: 3000,
        tuitionFees: 40000,
        initialPayment: 50000,
        receiptNumber: "REC202425001",
        sameAsLocal: true,
        createdAt: "2023-04-01",
        updatedAt: "2024-01-15"
    },
    {
        id: "STU25002",
        firstName: "Priya",
        lastName: "Patel",
        fullName: "Priya Patel",
        studentId: "STU25002",
        class: "9",
        section: "B",
        rollNumber: "12",
        fatherName: "Mr. Amit Patel",
        motherName: "Mrs. Neha Patel",
        fatherContact: "9876543211",
        motherContact: "9876500001",
        parentEmail: "patel.family@example.com",
        contact: "9876543211",
        email: "priya.p@example.com",
        feesStatus: "partial",
        studentStatus: "active",
        admissionDate: "2023-04-01",
        attendance: "92%",
        totalFees: 48000,
        paidFees: 30000,
        pendingFees: 18000,
        dob: "2009-07-22",
        gender: "Female",
        bloodGroup: "B+",
        casteCategory: "OBC",
        aadharNumber: "456789012345",
        fatherAadhar: "567890123456",
        motherAadhar: "678901234567",
        localAddressLine1: "456 Park Street",
        localAddressLine2: "Opposite Central Park",
        localCity: "Mumbai",
        localState: "Maharashtra",
        localPincode: "400001",
        localAddress: "456 Park Street, Mumbai, Maharashtra - 400001",
        permanentAddressLine1: "789 Village Road",
        permanentAddressLine2: "",
        permanentCity: "Ahmedabad",
        permanentState: "Gujarat",
        permanentPincode: "380001",
        permanentAddress: "789 Village Road, Ahmedabad, Gujarat - 380001",
        fatherOccupation: "Businessman",
        motherOccupation: "Homemaker",
        academicYear: "2024-2025",
        classTeacher: "Ms. Patel",
        subjects: ["english", "hindi", "mathematics", "science"],
        sports: ["dancing", "music"],
        otherSports: ["classical dance"],
        otherSubjects: ["computer science"],
        medicalInfo: "Mild asthma",
        previousSchool: "Little Angels School",
        emergencyContactName: "Mr. Sunil Patel",
        emergencyContactNumber: "9876512346",
        relationship: "Father",
        paymentMethod: "cash",
        paymentMode: "installment",
        transactionId: "",
        admissionFees: 5000,
        uniformFees: 2000,
        bookFees: 3000,
        tuitionFees: 40000,
        initialPayment: 30000,
        receiptNumber: "REC202425002",
        sameAsLocal: false,
        installments: [
            {
                installmentNumber: 1,
                amount: 10000,
                paidAmount: 10000,
                dueDate: "2024-04-01",
                status: "paid"
            },
            {
                installmentNumber: 2,
                amount: 9000,
                paidAmount: 0,
                dueDate: "2024-07-01",
                status: "pending"
            }
        ],
        createdAt: "2023-04-01",
        updatedAt: "2024-01-15"
    },
    // Add these 4 dummy student records to your existing dummyStudents array:

{
    id: "STU25004",
    firstName: "Aryan",
    middleName: "Kumar",
    lastName: "Gupta",
    fullName: "Aryan Kumar Gupta",
    studentId: "STU25004",
    class: "7",
    section: "C",
    rollNumber: "18",
    fatherName: "Mr. Sanjay Gupta",
    motherName: "Mrs. Meera Gupta",
    fatherContact: "9876543213",
    motherContact: "9876500003",
    parentEmail: "gupta.family@example.com",
    contact: "9876543213",
    email: "aryan.g@example.com",
    feesStatus: "paid",
    studentStatus: "active",
    admissionDate: "2023-04-01",
    attendance: "94%",
    totalFees: 42000,
    paidFees: 42000,
    pendingFees: 0,
    dob: "2011-08-10",
    gender: "Male",
    bloodGroup: "A-",
    casteCategory: "General",
    aadharNumber: "987654321012",
    fatherAadhar: "876543210987",
    motherAadhar: "765432109876",
    localAddressLine1: "101 Tech Park Road",
    localAddressLine2: "Silicon Valley",
    localCity: "Hyderabad",
    localState: "Telangana",
    localPincode: "500081",
    localAddress: "101 Tech Park Road, Hyderabad, Telangana - 500081",
    permanentAddressLine1: "201 Heritage Street",
    permanentAddressLine2: "Old City",
    permanentCity: "Varanasi",
    permanentState: "Uttar Pradesh",
    permanentPincode: "221001",
    permanentAddress: "201 Heritage Street, Varanasi, Uttar Pradesh - 221001",
    fatherOccupation: "Software Engineer",
    motherOccupation: "Architect",
    academicYear: "2024-2025",
    classTeacher: "Mr. Reddy",
    subjects: ["english", "mathematics", "science", "computer"],
    sports: ["badminton", "table tennis"],
    otherSports: ["Robotics"],
    otherSubjects: ["Artificial Intelligence"],
    medicalInfo: "Wears glasses, No other issues",
    previousSchool: "Delhi International School",
    emergencyContactName: "Mr. Sanjay Gupta",
    emergencyContactNumber: "9876512348",
    relationship: "Father",
    paymentMethod: "online",
    paymentMode: "one-time",
    transactionId: "TXN987654321",
    admissionFees: 5000,
    uniformFees: 2000,
    bookFees: 3000,
    tuitionFees: 32000,
    initialPayment: 42000,
    receiptNumber: "REC202425004",
    sameAsLocal: false,
    createdAt: "2023-04-01",
    updatedAt: "2024-01-15"
},
{
    id: "STU25005",
    firstName: "Sakshi",
    middleName: "",
    lastName: "Joshi",
    fullName: "Sakshi Joshi",
    studentId: "STU25005",
    class: "6",
    section: "A",
    rollNumber: "7",
    fatherName: "Mr. Ashok Joshi",
    motherName: "Mrs. Radha Joshi",
    fatherContact: "9876543214",
    motherContact: "9876500004",
    parentEmail: "joshi.family@example.com",
    contact: "9876543214",
    email: "sakshi.j@example.com",
    feesStatus: "partial",
    studentStatus: "active",
    admissionDate: "2023-04-01",
    attendance: "91%",
    totalFees: 38000,
    paidFees: 25000,
    pendingFees: 13000,
    dob: "2012-11-25",
    gender: "Female",
    bloodGroup: "B-",
    casteCategory: "OBC",
    aadharNumber: "876543210123",
    fatherAadhar: "765432109876",
    motherAadhar: "654321098765",
    localAddressLine1: "45 Rose Garden",
    localAddressLine2: "Civil Lines",
    localCity: "Lucknow",
    localState: "Uttar Pradesh",
    localPincode: "226001",
    localAddress: "45 Rose Garden, Lucknow, Uttar Pradesh - 226001",
    permanentAddressLine1: "45 Rose Garden",
    permanentAddressLine2: "Civil Lines",
    permanentCity: "Lucknow",
    permanentState: "Uttar Pradesh",
    permanentPincode: "226001",
    permanentAddress: "45 Rose Garden, Lucknow, Uttar Pradesh - 226001",
    fatherOccupation: "Government Officer",
    motherOccupation: "Bank Manager",
    academicYear: "2024-2025",
    classTeacher: "Ms. Verma",
    subjects: ["english", "hindi", "mathematics", "science", "social"],
    sports: ["skating", "yoga"],
    otherSports: [],
    otherSubjects: ["Music"],
    medicalInfo: "Vegetarian, Lactose intolerant",
    previousSchool: "Lucknow Public School",
    emergencyContactName: "Mrs. Radha Joshi",
    emergencyContactNumber: "9876512349",
    relationship: "Mother",
    paymentMethod: "cash",
    paymentMode: "installment",
    transactionId: "",
    admissionFees: 5000,
    uniformFees: 2000,
    bookFees: 3000,
    tuitionFees: 28000,
    initialPayment: 15000,
    receiptNumber: "REC202425005",
    sameAsLocal: true,
    installments: [
        {
            installmentNumber: 1,
            amount: 8000,
            paidAmount: 8000,
            dueDate: "2024-03-01",
            status: "paid"
        },
        {
            installmentNumber: 2,
            amount: 7500,
            paidAmount: 2000,
            dueDate: "2024-06-01",
            status: "partial"
        },
        {
            installmentNumber: 3,
            amount: 7500,
            paidAmount: 0,
            dueDate: "2024-09-01",
            status: "pending"
        }
    ],
    createdAt: "2023-04-01",
    updatedAt: "2024-01-15"
},
{
    id: "STU25006",
    firstName: "Vikram",
    middleName: "Singh",
    lastName: "Rathore",
    fullName: "Vikram Singh Rathore",
    studentId: "STU25006",
    class: "5",
    section: "B",
    rollNumber: "22",
    fatherName: "Mr. Rajendra Rathore",
    motherName: "Mrs. Sunita Rathore",
    fatherContact: "9876543215",
    motherContact: "9876500005",
    parentEmail: "rathore.family@example.com",
    contact: "9876543215",
    email: "vikram.r@example.com",
    feesStatus: "pending",
    studentStatus: "active",
    admissionDate: "2023-04-01",
    attendance: "89%",
    totalFees: 35000,
    paidFees: 0,
    pendingFees: 35000,
    dob: "2013-02-14",
    gender: "Male",
    bloodGroup: "O-",
    casteCategory: "SC",
    aadharNumber: "765432109876",
    fatherAadhar: "654321098765",
    motherAadhar: "543210987654",
    localAddressLine1: "78 Rajput Nagar",
    localAddressLine2: "",
    localCity: "Jaipur",
    localState: "Rajasthan",
    localPincode: "302001",
    localAddress: "78 Rajput Nagar, Jaipur, Rajasthan - 302001",
    permanentAddressLine1: "Village: Rathore Ki Dhani",
    permanentAddressLine2: "Tehsil: Phalodi",
    permanentCity: "Jodhpur",
    permanentState: "Rajasthan",
    permanentPincode: "342001",
    permanentAddress: "Village: Rathore Ki Dhani, Jodhpur, Rajasthan - 342001",
    fatherOccupation: "Farmer",
    motherOccupation: "Homemaker",
    academicYear: "2024-2025",
    classTeacher: "Mr. Mehta",
    subjects: ["english", "hindi", "mathematics", "evs"],
    sports: ["kabaddi", "volleyball"],
    otherSports: ["Marbles"],
    otherSubjects: ["Rajasthani Culture"],
    medicalInfo: "Underweight, needs nutritional supplements",
    previousSchool: "Zila Parishad School",
    emergencyContactName: "Mr. Rajendra Rathore",
    emergencyContactNumber: "9876512350",
    relationship: "Father",
    paymentMethod: "cash",
    paymentMode: "one-time",
    transactionId: "",
    admissionFees: 5000,
    uniformFees: 2000,
    bookFees: 3000,
    tuitionFees: 25000,
    initialPayment: 0,
    receiptNumber: "REC202425006",
    sameAsLocal: false,
    scholarshipApplied: true,
    scholarshipAmount: 10000,
    createdAt: "2023-04-01",
    updatedAt: "2024-01-15"
},
{
    id: "STU25007",
    firstName: "Ishita",
    middleName: "",
    lastName: "Desai",
    fullName: "Ishita Desai",
    studentId: "STU25007",
    class: "4",
    section: "C",
    rollNumber: "15",
    fatherName: "Mr. Jayesh Desai",
    motherName: "Mrs. Pooja Desai",
    fatherContact: "9876543216",
    motherContact: "9876500006",
    parentEmail: "desai.family@example.com",
    contact: "9876543216",
    email: "ishita.d@example.com",
    feesStatus: "paid",
    studentStatus: "inactive",
    admissionDate: "2022-04-01",
    attendance: "87%",
    totalFees: 32000,
    paidFees: 32000,
    pendingFees: 0,
    dob: "2014-09-30",
    gender: "Female",
    bloodGroup: "AB+",
    casteCategory: "ST",
    aadharNumber: "654321098765",
    fatherAadhar: "543210987654",
    motherAadhar: "432109876543",
    localAddressLine1: "12 Marine Drive Apartment",
    localAddressLine2: "5th Floor, Flat 501",
    localCity: "Mumbai",
    localState: "Maharashtra",
    localPincode: "400002",
    localAddress: "12 Marine Drive Apartment, Mumbai, Maharashtra - 400002",
    permanentAddressLine1: "12 Marine Drive Apartment",
    permanentAddressLine2: "5th Floor, Flat 501",
    permanentCity: "Mumbai",
    permanentState: "Maharashtra",
    permanentPincode: "400002",
    permanentAddress: "12 Marine Drive Apartment, Mumbai, Maharashtra - 400002",
    fatherOccupation: "Marine Engineer",
    motherOccupation: "Fashion Designer",
    academicYear: "2024-2025",
    classTeacher: "Ms. Kapoor",
    subjects: ["english", "hindi", "mathematics", "evs", "art"],
    sports: ["swimming", "painting"],
    otherSports: ["Pottery"],
    otherSubjects: ["French"],
    medicalInfo: "Allergic to dust, uses inhaler occasionally",
    previousSchool: "Mumbai International School",
    emergencyContactName: "Mr. Jayesh Desai",
    emergencyContactNumber: "9876512351",
    relationship: "Father",
    paymentMethod: "online",
    paymentMode: "one-time",
    transactionId: "TXN456789123",
    admissionFees: 5000,
    uniformFees: 2000,
    bookFees: 3000,
    tuitionFees: 22000,
    initialPayment: 32000,
    receiptNumber: "REC202425007",
    sameAsLocal: true,
    studentStatus: "inactive",
    leavingDate: "2024-12-15",
    leavingReason: "Family relocation to another city",
    createdAt: "2022-04-01",
    updatedAt: "2024-12-15"
},
{
    id: "STU25008",
    firstName: "Aditya",
    middleName: "Prakash",
    lastName: "Choudhary",
    fullName: "Aditya Prakash Choudhary",
    studentId: "STU25008",
    class: "3",
    section: "A",
    rollNumber: "3",
    fatherName: "Mr. Pradeep Choudhary",
    motherName: "Mrs. Anita Choudhary",
    fatherContact: "9876543217",
    motherContact: "9876500007",
    parentEmail: "choudhary.family@example.com",
    contact: "9876543217",
    email: "aditya.c@example.com",
    feesStatus: "partial",
    studentStatus: "active",
    admissionDate: "2023-04-01",
    attendance: "96%",
    totalFees: 30000,
    paidFees: 20000,
    pendingFees: 10000,
    dob: "2015-12-05",
    gender: "Male",
    bloodGroup: "A+",
    casteCategory: "General",
    aadharNumber: "543210987654",
    fatherAadhar: "432109876543",
    motherAadhar: "321098765432",
    localAddressLine1: "34 Green Valley",
    localAddressLine2: "Sector 15",
    localCity: "Chandigarh",
    localState: "Punjab",
    localPincode: "160015",
    localAddress: "34 Green Valley, Chandigarh, Punjab - 160015",
    permanentAddressLine1: "56 Farm House",
    permanentAddressLine2: "Model Town",
    permanentCity: "Ludhiana",
    permanentState: "Punjab",
    permanentPincode: "141001",
    permanentAddress: "56 Farm House, Ludhiana, Punjab - 141001",
    fatherOccupation: "Business Owner",
    motherOccupation: "Dentist",
    academicYear: "2024-2025",
    classTeacher: "Mr. Singh",
    subjects: ["english", "hindi", "mathematics", "evs"],
    sports: ["cricket", "skating"],
    otherSports: [],
    otherSubjects: ["Punjabi"],
    medicalInfo: "None",
    previousSchool: "Chandigarh Montessori",
    emergencyContactName: "Mrs. Anita Choudhary",
    emergencyContactNumber: "9876512352",
    relationship: "Mother",
    paymentMethod: "online",
    paymentMode: "installment",
    transactionId: "TXN789123456",
    admissionFees: 5000,
    uniformFees: 2000,
    bookFees: 3000,
    tuitionFees: 20000,
    initialPayment: 10000,
    receiptNumber: "REC202425008",
    sameAsLocal: false,
    installments: [
        {
            installmentNumber: 1,
            amount: 5000,
            paidAmount: 5000,
            dueDate: "2024-02-01",
            status: "paid"
        },
        {
            installmentNumber: 2,
            amount: 5000,
            paidAmount: 5000,
            dueDate: "2024-05-01",
            status: "paid"
        },
        {
            installmentNumber: 3,
            amount: 5000,
            paidAmount: 0,
            dueDate: "2024-08-01",
            status: "pending"
        }
    ],
    createdAt: "2023-04-01",
    updatedAt: "2024-01-15"
}
];

// Toast system
const Toast = {
    show: function(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        
        const colors = {
            success: 'bg-green-100 border-green-400 text-green-800',
            error: 'bg-red-100 border-red-400 text-red-800',
            warning: 'bg-yellow-100 border-yellow-400 text-yellow-800',
            info: 'bg-blue-100 border-blue-400 text-blue-800'
        };
        
        toast.className = `toast ${colors[type] || colors.info} border`;
        toast.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'} mr-2"></i>
                <span>${message}</span>
            </div>
        `;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode === container) {
                    container.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }
};

// Function to show Add Student section
function showAddStudentSection() {
    document.getElementById('allStudentsSection').classList.add('hidden');
    document.getElementById('addStudentSection').classList.remove('hidden');
    
    // Reset form title
    document.getElementById('formTitle').textContent = 'Add New Student';
    
    // Reset form
    resetForm();
    
    // Auto-generate student ID
    const autoGeneratedId = generateStudentId();
    document.getElementById('autoGeneratedId').textContent = autoGeneratedId;
    document.getElementById('studentId').value = autoGeneratedId;
    
    // Reset form to first tab
    switchTab('personal');
    
    // Scroll to top
    window.scrollTo(0, 0);
    
    Toast.show('Add New Student form opened', 'info');
}

// Function to show All Students section
function showAllStudentsSection() {
    document.getElementById('addStudentSection').classList.add('hidden');
    document.getElementById('allStudentsSection').classList.remove('hidden');
    
    // Reload student table
    loadStudentTable();
    
    // Scroll to top
    window.scrollTo(0, 0);
    
    Toast.show('Back to student list', 'info');
}

// 1. Fix image upload
function previewStudentPhoto(input) {
    const file = input.files[0];
    if (!file) return;
    
    // Validate file size (2MB limit)
    if (file.size > 2 * 1024 * 1024) {
        Toast.show('File size exceeds 2MB limit', 'error');
        input.value = '';
        return;
    }
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
        Toast.show('Please upload JPG or PNG files only', 'error');
        input.value = '';
        return;
    }
    
    const previewElement = document.getElementById('studentPhotoPreview');
    const reader = new FileReader();
    
    reader.onload = function(e) {
        previewElement.innerHTML = `
            <img src="${e.target.result}" class="h-full w-full object-cover rounded-full" alt="Student Photo">
        `;
    };
    
    reader.readAsDataURL(file);
    Toast.show('Photo uploaded successfully', 'success');
}

// 2. Handle Student ID and Password
function generateStudentId() {
    const year = new Date().getFullYear().toString().slice(-2);
    const random = Math.floor(1000 + Math.random() * 9000);
    return `STU${year}${random}`;
}

// 3. Enhanced manual add options for sports and subjects
function toggleOtherSports() {
    const checkbox = document.getElementById('otherSportsCheckbox');
    const container = document.getElementById('otherSportsContainer');
    
    if (checkbox.checked) {
        container.classList.remove('hidden');
    } else {
        container.classList.add('hidden');
    }
}

function addOtherSports() {
    const input = document.getElementById('otherSportsInput');
    const value = input.value.trim();
    
    if (!value) {
        Toast.show('Please enter sports names', 'error');
        return;
    }
    
    const sports = value.split(',').map(sport => sport.trim()).filter(sport => sport);
    const display = document.getElementById('otherSportsDisplay');
    
    if (sports.length > 0) {
        display.classList.remove('hidden');
        sports.forEach(sport => {
            if (!otherSports.includes(sport.toLowerCase())) {
                otherSports.push(sport.toLowerCase());
            }
        });
        updateOtherSportsDisplay();
        input.value = '';
        Toast.show(`${sports.length} sport(s) added`, 'success');
    }
}

function toggleOtherSubjects() {
    const checkbox = document.getElementById('otherSubjectsCheckbox');
    const container = document.getElementById('otherSubjectsContainer');
    
    if (checkbox.checked) {
        container.classList.remove('hidden');
    } else {
        container.classList.add('hidden');
    }
}

function addOtherSubjects() {
    const input = document.getElementById('otherSubjectsInput');
    const value = input.value.trim();
    
    if (!value) {
        Toast.show('Please enter subject names', 'error');
        return;
    }
    
    const subjects = value.split(',').map(subject => subject.trim()).filter(subject => subject);
    const display = document.getElementById('otherSubjectsDisplay');
    
    if (subjects.length > 0) {
        display.classList.remove('hidden');
        subjects.forEach(subject => {
            if (!otherSubjects.includes(subject.toLowerCase())) {
                otherSubjects.push(subject.toLowerCase());
            }
        });
        updateOtherSubjectsDisplay();
        input.value = '';
        Toast.show(`${subjects.length} subject(s) added`, 'success');
    }
}

// 4. QR CODE GENERATION SYSTEM
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
    
    // Generate unique payment reference
    const paymentRef = `PAY${Date.now()}${Math.floor(Math.random() * 1000)}`;
    
    // Generate payment details for QR code - Using UPI format for better compatibility
    const paymentData = `upi://pay?pa=kunashschool@icici&pn=Kunash%20School&am=${initialPayment}&tn=Student%20Fees%20Payment&tr=${paymentRef}`;
    
    // Create QR code using the qrcode library
    try {
        // Check if QRCode library is available
        if (typeof QRCode === 'undefined') {
            Toast.show('QR Code library not loaded. Please refresh the page.', 'error');
            return;
        }
        
        // Generate QR code with better options
        new QRCode(qrCodeCanvas, {
            text: paymentData,
            width: 200,
            height: 200,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
        
        qrCodeGenerated = true;
        Toast.show('QR code generated successfully. Amount: ₹' + parseInt(initialPayment).toLocaleString(), 'success');
        
    } catch (error) {
        console.error('Error generating QR code:', error);
        Toast.show('Error generating QR code. Please try again.', 'error');
        
        // Fallback: Show error message in QR code container
        qrCodeCanvas.innerHTML = `
            <div class="text-center p-4">
                <i class="fas fa-exclamation-triangle text-4xl text-red-500 mb-2"></i>
                <p class="text-sm text-gray-700">QR Code Generation Failed</p>
                <p class="text-xs text-gray-500">Please refresh and try again</p>
            </div>
        `;
    }
}

// Refresh QR Code
function refreshQRCode() {
    if (typeof QRCode === 'undefined') {
        Toast.show('QR Code library not available', 'error');
        return;
    }
    
    generateQRCode();
    Toast.show('QR code refreshed successfully', 'success');
}

// Close QR Code
function closeQRCode() {
    document.getElementById('qrCodeSection').classList.add('hidden');
    qrCodeGenerated = false;
}

// Verify Transaction ID
function verifyTransactionId() {
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
    
    // Simulate verification process with realistic delay
    setTimeout(() => {
        if (transactionId.length >= 8 && /^[A-Z0-9]+$/.test(transactionId)) {
            statusElement.innerHTML = '<div class="flex items-center text-green-600"><i class="fas fa-check-circle mr-2"></i> Transaction verified successfully!</div>';
            transactionVerified = true;
            Toast.show('Transaction verified successfully! Payment confirmed.', 'success');
        } else {
            statusElement.innerHTML = '<div class="flex items-center text-red-600"><i class="fas fa-times-circle mr-2"></i> Invalid transaction ID. Please check and try again.</div>';
            transactionVerified = false;
            Toast.show('Invalid transaction ID. Must be at least 8 alphanumeric characters.', 'error');
        }
    }, 2000);
}

// Update other sports display
function updateOtherSportsDisplay() {
    const display = document.getElementById('otherSportsDisplay');
    if (otherSports.length === 0) {
        display.classList.add('hidden');
        return;
    }
    
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

// Update other subjects display
function updateOtherSubjectsDisplay() {
    const display = document.getElementById('otherSubjectsDisplay');
    if (otherSubjects.length === 0) {
        display.classList.add('hidden');
        return;
    }
    
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

function removeOtherSport(index) {
    otherSports.splice(index, 1);
    updateOtherSportsDisplay();
}

function removeOtherSubject(index) {
    otherSubjects.splice(index, 1);
    updateOtherSubjectsDisplay();
}

// Fee calculation functions
function updateFeeCalculations() {
    const admissionFees = parseInt(document.getElementById('admissionFees').value) || 0;
    const uniformFees = parseInt(document.getElementById('uniformFees').value) || 0;
    const bookFees = parseInt(document.getElementById('bookFees').value) || 0;
    const tuitionFees = parseInt(document.getElementById('tuitionFees').value) || 0;
    const initialPayment = parseInt(document.getElementById('initialPayment').value) || 0;
    
    // Calculate total
    const totalFees = admissionFees + uniformFees + bookFees + tuitionFees;
    const balance = totalFees - initialPayment;
    
    // Update displays
    document.getElementById('totalFeesDisplay').textContent = `₹${totalFees.toLocaleString()}`;
    document.getElementById('balanceAmount').textContent = `₹${balance.toLocaleString()}`;
    document.getElementById('summaryTotal').textContent = `₹${totalFees.toLocaleString()}`;
    document.getElementById('summaryGrandTotal').textContent = `₹${totalFees.toLocaleString()}`;
    document.getElementById('summaryPaid').textContent = `₹${initialPayment.toLocaleString()}`;
    document.getElementById('summaryPending').textContent = `₹${balance.toLocaleString()}`;
    document.getElementById('summaryBalance').textContent = `₹${balance.toLocaleString()}`;
    
    // Update QR amount if QR code is visible and generated
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked');
    if (paymentMethod && paymentMethod.value === 'online' && qrCodeGenerated) {
        document.getElementById('qrAmount').textContent = `₹${initialPayment.toLocaleString()}`;
        // Regenerate QR code with new amount
        generateQRCode();
    }
    
    // Update installment calculation if installment mode is selected
    const paymentMode = document.querySelector('input[name="paymentMode"]:checked');
    if (paymentMode && paymentMode.value === 'installment') {
        calculateInstallments();
    }
}

// FIXED: Calculate installments correctly with initial payment deduction
function calculateInstallments() {
    const admissionFees = parseInt(document.getElementById('admissionFees').value) || 0;
    const uniformFees = parseInt(document.getElementById('uniformFees').value) || 0;
    const bookFees = parseInt(document.getElementById('bookFees').value) || 0;
    const tuitionFees = parseInt(document.getElementById('tuitionFees').value) || 0;
    const initialPayment = parseInt(document.getElementById('initialPayment').value) || 0;
    const installmentCount = parseInt(document.getElementById('installmentCount').value) || 2;
    const firstInstallmentDate = document.getElementById('firstInstallmentDate').value;
    
    if (!firstInstallmentDate) return;
    
    // Calculate total fees
    const totalFees = admissionFees + uniformFees + bookFees + tuitionFees;
    
    // Calculate balance after initial payment
    const balanceAfterInitialPayment = totalFees - initialPayment;
    
    // Calculate installment amount (balance divided equally among installments)
    const installmentAmount = Math.round(balanceAfterInitialPayment / installmentCount);
    
    let html = '';
    
    // Show initial payment if it exists
    if (initialPayment > 0) {
        html += `
            <div class="flex justify-between items-center border-b pb-2">
                <div>
                    <span class="font-medium text-green-600">Initial Payment</span>
                    <p class="text-xs text-gray-500">Paid at registration</p>
                </div>
                <span class="font-semibold text-green-600">₹${initialPayment.toLocaleString()}</span>
            </div>
        `;
    }
    
    // Generate installment details
    for (let i = 0; i < installmentCount; i++) {
        const date = new Date(firstInstallmentDate);
        date.setMonth(date.getMonth() + i);
        const dueDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        
        html += `
            <div class="flex justify-between items-center border-b pb-2">
                <div>
                    <span class="font-medium">Installment ${i + 1}</span>
                    <p class="text-xs text-gray-500">Due: ${dueDate}</p>
                </div>
                <span class="font-semibold text-blue-600">₹${installmentAmount.toLocaleString()}</span>
            </div>
        `;
    }
    
    // Show total summary
    html += `
        <div class="flex justify-between items-center pt-2 mt-2 border-t">
            <div>
                <span class="font-bold">Total Balance</span>
                <p class="text-xs text-gray-500">After initial payment</p>
            </div>
            <span class="font-bold text-lg">₹${balanceAfterInitialPayment.toLocaleString()}</span>
        </div>
    `;
    
    document.getElementById('installmentBreakdown').innerHTML = html;
}

// Toggle installment options
function toggleInstallmentOptions() {
    const paymentMode = document.querySelector('input[name="paymentMode"]:checked').value;
    const installmentOptions = document.getElementById('installmentOptions');
    
    if (paymentMode === 'installment') {
        installmentOptions.classList.remove('hidden');
        calculateInstallments();
    } else {
        installmentOptions.classList.add('hidden');
    }
}

// Add additional fee
function addAdditionalFee() {
    const nameInput = document.getElementById('additionalFeeName');
    const amountInput = document.getElementById('additionalFeeAmount');
    const name = nameInput.value.trim();
    const amount = parseFloat(amountInput.value);
    
    if (!name || isNaN(amount) || amount <= 0) {
        Toast.show('Please enter valid fee name and amount', 'error');
        return;
    }
    
    const list = document.getElementById('additionalFeesList');
    const id = Date.now();
    
    list.innerHTML += `
        <div id="fee-${id}" class="flex justify-between items-center bg-gray-50 p-2 rounded">
            <span>${name}</span>
            <div class="flex items-center">
                <span class="mr-3 font-semibold">₹${amount.toLocaleString()}</span>
                    <button onclick="removeAdditionalFee(${id})" class="text-red-500 hover:text-red-700">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>
    `;
    
    // Clear inputs
    nameInput.value = '';
    amountInput.value = '';
    
    // Update summary
    updateFeeCalculations();
    Toast.show('Additional fee added', 'success');
}

function removeAdditionalFee(id) {
    const element = document.getElementById(`fee-${id}`);
    if (element) {
        element.remove();
        updateFeeCalculations();
        Toast.show('Additional fee removed', 'info');
    }
}

// Toggle permanent address
function togglePermanentAddress() {
    const checkbox = document.getElementById('sameAsLocal');
    const permanentAddressSection = document.getElementById('permanentAddressSection');
    
    if (checkbox.checked) {
        permanentAddressSection.classList.add('hidden');
    } else {
        permanentAddressSection.classList.remove('hidden');
    }
}

// Switch between tabs
function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all tab buttons
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(`${tabName}TabContent`).classList.add('active');
    document.getElementById(`${tabName}Tab`).classList.add('active');
}

// Preview document upload
function previewDocument(input, previewId) {
    const file = input.files[0];
    if (!file) return;
    
    const previewElement = document.getElementById(previewId);
    const reader = new FileReader();
    
    reader.onload = function(e) {
        if (file.type.includes('image')) {
            previewElement.innerHTML = `
                <img src="${e.target.result}" class="h-full w-full object-cover rounded-lg" alt="${file.name}">
            `;
        } else {
            previewElement.innerHTML = `
                <div class="text-center">
                    <i class="fas fa-file-pdf text-4xl text-red-500 mb-2"></i>
                    <p class="text-sm font-medium">${file.name}</p>
                    <p class="text-xs text-gray-500">PDF Document</p>
                </div>
            `;
        }
    };
    
    reader.readAsDataURL(file);
    Toast.show('Document uploaded successfully', 'success');
}

function removeDocument(inputId, previewId) {
    document.getElementById(inputId).value = '';
    const previewElement = document.getElementById(previewId);
    previewElement.innerHTML = `
        <i class="fas fa-cloud-upload-alt text-3xl text-gray-400 mb-2"></i>
        <p class="text-sm text-gray-500 text-center">Upload document</p>
        <p class="text-xs text-gray-400">PDF or Image</p>
    `;
    Toast.show('Document removed', 'info');
}

// Update payment details
function updatePaymentDetails() {
    // Update fee calculations
    updateFeeCalculations();
    
    // Update QR code if online payment is selected
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked');
    if (paymentMethod && paymentMethod.value === 'online' && qrCodeGenerated) {
        generateQRCode();
    }
}

// Reset form
function resetForm() {
    if (!editingStudentId) {
        // Only ask for confirmation if not in edit mode
        if (confirm('Are you sure you want to reset the form? All entered data will be lost.')) {
            document.getElementById('addStudentForm').reset();
            otherSports = [];
            otherSubjects = [];
            document.getElementById('otherSportsDisplay').innerHTML = '';
            document.getElementById('otherSportsDisplay').classList.add('hidden');
            document.getElementById('otherSubjectsDisplay').innerHTML = '';
            document.getElementById('otherSubjectsDisplay').classList.add('hidden');
            document.getElementById('otherSportsContainer').classList.add('hidden');
            document.getElementById('otherSubjectsContainer').classList.add('hidden');
            document.getElementById('otherSportsCheckbox').checked = false;
            document.getElementById('otherSubjectsCheckbox').checked = false;
            document.getElementById('studentPhotoPreview').innerHTML = '<i class="fas fa-user text-4xl lg:text-6xl text-gray-400"></i>';
            document.getElementById('passwordMismatch').classList.add('hidden');
            
            // Reset address checkbox
            document.getElementById('sameAsLocal').checked = false;
            togglePermanentAddress();
            
            // Reset payment mode
            document.querySelector('input[name="paymentMode"][value="one-time"]').checked = true;
            toggleInstallmentOptions();
            
            updateFeeCalculations();
            Toast.show('Form has been reset', 'info');
            
            // Reset QR code section
            closeQRCode();
            document.getElementById('transactionStatus').innerHTML = '';
            document.getElementById('transactionId').value = '';
            transactionVerified = false;
            qrCodeGenerated = false;
            
            // Reset edit mode
            editingStudentId = null;
        }
    } else {
        // In edit mode, just clear without confirmation
        Toast.show('Form reset for new entry', 'info');
        editingStudentId = null;
        showAddStudentSection();
    }
}

// Handle add student
function handleAddStudent() {
    // Validate form
    const password = document.getElementById('studentPassword').value;
    const confirmPassword = document.getElementById('confirmStudentPassword').value;
    
    if (!editingStudentId && password !== confirmPassword) {
        Toast.show('Passwords do not match', 'error');
        document.getElementById('passwordMismatch').classList.remove('hidden');
        return;
    }
    
    // Validate payment if online method selected
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
    if (paymentMethod === 'online' && !transactionVerified) {
        Toast.show('Please verify the transaction ID before proceeding', 'error');
        return;
    }
    
    // Validate QR code was generated for online payments
    if (paymentMethod === 'online' && !qrCodeGenerated && !editingStudentId) {
        Toast.show('Please generate QR code for online payment', 'error');
        return;
    }
    
    // Gather form data
    const formData = gatherFormData();
    
    if (editingStudentId) {
        // Update existing student
        updateStudent(editingStudentId, formData);
        Toast.show('Student updated successfully!', 'success');
    } else {
        // Add new student
        addNewStudent(formData);
        Toast.show('Student registration successful!', 'success');
    }
    
    // Redirect back to student list
    setTimeout(() => {
        showAllStudentsSection();
    }, 2000);
}

// Gather form data
function gatherFormData() {
    const form = document.getElementById('addStudentForm');
    const formData = {};
    
    // Collect all form fields
    const formElements = form.elements;
    for (let element of formElements) {
        if (element.name) {
            if (element.type === 'checkbox') {
                if (element.name.includes('[]')) {
                    if (!formData[element.name.replace('[]', '')]) {
                        formData[element.name.replace('[]', '')] = [];
                    }
                    if (element.checked) {
                        formData[element.name.replace('[]', '')].push(element.value);
                    }
                } else {
                    formData[element.name] = element.checked;
                }
            } else if (element.type === 'radio') {
                if (element.checked) {
                    formData[element.name] = element.value;
                }
            } else {
                formData[element.name] = element.value;
            }
        }
    }
    
    // Add additional sports and subjects
    if (otherSports.length > 0) {
        if (!formData.sports) formData.sports = [];
        formData.sports = formData.sports.concat(otherSports);
    }
    
    if (otherSubjects.length > 0) {
        if (!formData.subjects) formData.subjects = [];
        formData.subjects = formData.subjects.concat(otherSubjects);
    }
    
    // Calculate fees
    formData.admissionFees = parseInt(document.getElementById('admissionFees').value) || 0;
    formData.uniformFees = parseInt(document.getElementById('uniformFees').value) || 0;
    formData.bookFees = parseInt(document.getElementById('bookFees').value) || 0;
    formData.tuitionFees = parseInt(document.getElementById('tuitionFees').value) || 0;
    formData.initialPayment = parseInt(document.getElementById('initialPayment').value) || 0;
    formData.totalFees = formData.admissionFees + formData.uniformFees + formData.bookFees + formData.tuitionFees;
    formData.pendingFees = formData.totalFees - formData.initialPayment;
    formData.paidFees = formData.initialPayment;
    formData.feesStatus = formData.pendingFees === 0 ? 'paid' : (formData.initialPayment > 0 ? 'partial' : 'pending');
    
    // Add other fields
    formData.studentStatus = 'active';
    formData.attendance = '95%';
    formData.academicYear = formData.academicYear || '2024-2025';
    formData.receiptNumber = `REC${new Date().getFullYear()}${Math.floor(1000 + Math.random() * 9000)}`;
    formData.transactionId = document.getElementById('transactionId').value || '';
    formData.paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
    formData.paymentMode = document.querySelector('input[name="paymentMode"]:checked').value;
    formData.sameAsLocal = document.getElementById('sameAsLocal').checked;
    
    return formData;
}

// Add new student
function addNewStudent(formData) {
    const newId = `STU${new Date().getFullYear().toString().slice(-2)}${Math.floor(1000 + Math.random() * 9000)}`;
    
    const newStudent = {
        id: newId,
        ...formData,
        fullName: `${formData.firstName} ${formData.middleName ? formData.middleName + ' ' : ''}${formData.lastName}`,
        contact: formData.fatherContact,
        email: `${formData.firstName.toLowerCase()}.${formData.lastName.toLowerCase().charAt(0)}@example.com`,
        localAddress: `${formData.localAddressLine1}, ${formData.localAddressLine2 ? formData.localAddressLine2 + ', ' : ''}${formData.localCity}, ${formData.localState} - ${formData.localPincode}`,
        permanentAddress: formData.sameAsLocal ? 
            `${formData.localAddressLine1}, ${formData.localAddressLine2 ? formData.localAddressLine2 + ', ' : ''}${formData.localCity}, ${formData.localState} - ${formData.localPincode}` :
            `${formData.permanentAddressLine1}, ${formData.permanentAddressLine2 ? formData.permanentAddressLine2 + ', ' : ''}${formData.permanentCity}, ${formData.permanentState} - ${formData.permanentPincode}`,
        studentId: formData.studentId || newId,
        otherSports: otherSports,
        otherSubjects: otherSubjects,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
    };
    
    dummyStudents.push(newStudent);
    
    // Reset form for next entry
    resetForm();
}

// Update existing student
function updateStudent(studentId, formData) {
    const index = dummyStudents.findIndex(s => s.id === studentId);
    
    if (index !== -1) {
        dummyStudents[index] = {
            ...dummyStudents[index],
            ...formData,
            fullName: `${formData.firstName} ${formData.middleName ? formData.middleName + ' ' : ''}${formData.lastName}`,
            contact: formData.fatherContact,
            localAddress: `${formData.localAddressLine1}, ${formData.localAddressLine2 ? formData.localAddressLine2 + ', ' : ''}${formData.localCity}, ${formData.localState} - ${formData.localPincode}`,
            permanentAddress: formData.sameAsLocal ? 
                `${formData.localAddressLine1}, ${formData.localAddressLine2 ? formData.localAddressLine2 + ', ' : ''}${formData.localCity}, ${formData.localState} - ${formData.localPincode}` :
                `${formData.permanentAddressLine1}, ${formData.permanentAddressLine2 ? formData.permanentAddressLine2 + ', ' : ''}${formData.permanentCity}, ${formData.permanentState} - ${formData.permanentPincode}`,
            otherSports: otherSports,
            otherSubjects: otherSubjects,
            updatedAt: new Date().toISOString().split('T')[0]
        };
    }
    
    // Reset edit mode
    editingStudentId = null;
}

// Load and display dummy students data
function loadStudentTable() {
    const tbody = document.getElementById('studentTableBody');
    tbody.innerHTML = '';
    
    dummyStudents.forEach(student => {
        const row = document.createElement('tr');
        
        // Determine fee status badge
        let feeBadge = '';
        if (student.feesStatus === 'paid') {
            feeBadge = '<span class="status-badge status-paid">Fully Paid</span>';
        } else if (student.feesStatus === 'partial') {
            feeBadge = `<span class="status-badge status-partial">Partially Paid (₹${student.paidFees.toLocaleString()}/₹${student.totalFees.toLocaleString()})</span>`;
        } else {
            feeBadge = `<span class="status-badge status-pending">Pending (₹${student.pendingFees.toLocaleString()})</span>`;
        }
        
        // Determine student status
        const statusIcon = student.studentStatus === 'active' ? 
            '<i class="fas fa-circle text-green-500 mr-1"></i>' : 
            '<i class="fas fa-circle text-red-500 mr-1"></i>';
        
        row.innerHTML = `
            <td class="px-4 lg:px-6 py-4">
                <input type="checkbox" class="student-checkbox rounded border-gray-300">
            </td>
            <td class="px-4 lg:px-6 py-4">
                <div class="flex items-center">
                    <div class="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <i class="fas fa-user-graduate text-blue-600"></i>
                    </div>
                    <div>
                        <p class="font-semibold text-gray-800">${student.firstName} ${student.lastName}</p>
                        <p class="text-sm text-gray-600">ID: ${student.studentId}</p>
                        <div class="flex items-center mt-1">
                            ${statusIcon}
                            <span class="text-xs ${student.studentStatus === 'active' ? 'text-green-600' : 'text-red-600'}">
                                ${student.studentStatus === 'active' ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                    </div>
                </div>
            </td>
            <td class="px-4 lg:px-6 py-4">
                <p class="font-medium text-gray-800">Class ${student.class} ${student.section}</p>
                <p class="text-sm text-gray-600">Roll No: ${student.rollNumber}</p>
            </td>
            <td class="px-4 lg:px-6 py-4">
                <p class="text-sm text-gray-800">${student.fatherName}</p>
                <p class="text-sm text-gray-600">${student.contact}</p>
                <p class="text-sm text-gray-600">${student.email}</p>
            </td>
            <td class="px-4 lg:px-6 py-4">
                ${feeBadge}
                <p class="text-xs text-gray-500 mt-1">Attendance: ${student.attendance}</p>
            </td>
            <td class="px-4 lg:px-6 py-4">
                <div class="flex space-x-2">
                    <button onclick="viewStudent('${student.id}')" class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200" title="View">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button onclick="editStudent('${student.id}')" class="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteStudent('${student.id}')" class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        
        tbody.appendChild(row);
    });
    
    // Update stats
    updateStats();
}

// Update stats
function updateStats() {
    const totalStudents = dummyStudents.length;
    const activeStudents = dummyStudents.filter(s => s.studentStatus === 'active').length;
    const pendingFeesCount = dummyStudents.filter(s => s.feesStatus === 'pending' || s.feesStatus === 'partial').length;
    
    document.getElementById('totalStudentsCount').textContent = totalStudents;
    document.getElementById('activeStudentsCount').textContent = activeStudents;
    document.getElementById('pendingFeesCount').textContent = pendingFeesCount;
}

// Helper function to format date
function formatDate(dateString) {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
}

// Helper function to calculate age
function calculateAge(dateString) {
    if (!dateString) return 0;
    const birthDate = new Date(dateString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    
    return age;
}

// COMPREHENSIVE Student Details Modal
function viewStudent(studentId) {
    const student = dummyStudents.find(s => s.id === studentId);
    if (!student) {
        Toast.show('Student not found', 'error');
        return;
    }
    
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
                            <i class="fas fa-user-graduate text-6xl text-blue-600"></i>
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
                        <div class="mt-4 pt-4 border-t border-blue-200">
                            <div class="flex justify-center space-x-2">
                                <span class="px-3 py-1 rounded-full text-xs font-medium ${student.studentStatus === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                                    ${student.studentStatus === 'active' ? 'Active' : 'Inactive'}
                                </span>
                                <span class="px-3 py-1 rounded-full text-xs font-medium ${student.feesStatus === 'paid' ? 'bg-green-100 text-green-800' : student.feesStatus === 'partial' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}">
                                    ${student.feesStatus === 'paid' ? 'Fees Paid' : student.feesStatus === 'partial' ? 'Partial Payment' : 'Fees Pending'}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Fee Status -->
                    <div class="mt-6 bg-white rounded-xl border border-gray-200 p-4">
                        <h5 class="font-semibold text-gray-700 mb-3">Fee Status</h5>
                        <div class="space-y-2">
                            <div class="flex justify-between">
                                <span class="text-gray-600">Total Fees:</span>
                                <span class="font-medium">₹${student.totalFees.toLocaleString()}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">Admission Fees:</span>
                                <span class="font-medium">₹${student.admissionFees.toLocaleString()}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">Uniform Fees:</span>
                                <span class="font-medium">₹${student.uniformFees.toLocaleString()}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">Book & Stationery:</span>
                                <span class="font-medium">₹${student.bookFees.toLocaleString()}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">Tuition Fees:</span>
                                <span class="font-medium">₹${student.tuitionFees.toLocaleString()}</span>
                            </div>
                            <div class="pt-2 border-t">
                                <div class="flex justify-between font-semibold">
                                    <span>Paid Amount:</span>
                                    <span class="text-green-600">₹${student.paidFees.toLocaleString()}</span>
                                </div>
                                <div class="flex justify-between font-semibold">
                                    <span>Pending Amount:</span>
                                    <span class="text-red-600">₹${student.pendingFees.toLocaleString()}</span>
                                </div>
                            </div>
                            <div class="pt-2 border-t">
                                <div class="flex justify-between font-bold">
                                    <span>Balance:</span>
                                    <span class="text-lg">₹${student.pendingFees.toLocaleString()}</span>
                                </div>
                            </div>
                            <div class="pt-2 border-t">
                                <div class="flex justify-between text-sm">
                                    <span class="text-gray-600">Payment Method:</span>
                                    <span class="font-medium capitalize">${student.paymentMethod}</span>
                                </div>
                                <div class="flex justify-between text-sm">
                                    <span class="text-gray-600">Payment Mode:</span>
                                    <span class="font-medium">${student.paymentMode === 'one-time' ? 'One-Time' : 'Installment'}</span>
                                </div>
                                ${student.transactionId ? `
                                <div class="flex justify-between text-sm">
                                    <span class="text-gray-600">Transaction ID:</span>
                                    <span class="font-medium">${student.transactionId}</span>
                                </div>
                                ` : ''}
                                ${student.receiptNumber ? `
                                <div class="flex justify-between text-sm">
                                    <span class="text-gray-600">Receipt No:</span>
                                    <span class="font-medium">${student.receiptNumber}</span>
                                </div>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                    
                    ${student.installments && student.installments.length > 0 ? `
                    <!-- Installment Details -->
                    <div class="mt-6 bg-white rounded-xl border border-gray-200 p-4">
                        <h5 class="font-semibold text-gray-700 mb-3">Installment Schedule</h5>
                        <div class="space-y-2">
                            ${student.installments.map(installment => {
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
                                            <div class="text-xs text-gray-500">Due: ${formatDate(installment.dueDate)}</div>
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
                                    <span class="w-40 text-gray-600">First Name:</span>
                                    <span class="font-medium">${student.firstName}</span>
                                </div>
                                ${student.middleName ? `
                                <div class="flex">
                                    <span class="w-40 text-gray-600">Middle Name:</span>
                                    <span class="font-medium">${student.middleName}</span>
                                </div>
                                ` : ''}
                                <div class="flex">
                                    <span class="w-40 text-gray-600">Last Name:</span>
                                    <span class="font-medium">${student.lastName}</span>
                                </div>
                                <div class="flex">
                                    <span class="w-40 text-gray-600">Date of Birth:</span>
                                    <span class="font-medium">${formatDate(student.dob)} (${calculateAge(student.dob)} years)</span>
                                </div>
                                <div class="flex">
                                    <span class="w-40 text-gray-600">Gender:</span>
                                    <span class="font-medium">${student.gender}</span>
                                </div>
                                <div class="flex">
                                    <span class="w-40 text-gray-600">Blood Group:</span>
                                    <span class="font-medium">${student.bloodGroup || 'Not specified'}</span>
                                </div>
                                <div class="flex">
                                    <span class="w-40 text-gray-600">Caste Category:</span>
                                    <span class="font-medium">${student.casteCategory || 'Not specified'}</span>
                                </div>
                                <div class="flex">
                                    <span class="w-40 text-gray-600">Aadhar Number:</span>
                                    <span class="font-medium">${student.aadharNumber || 'Not available'}</span>
                                </div>
                                <div class="flex">
                                    <span class="w-40 text-gray-600">Medical Information:</span>
                                    <span class="font-medium">${student.medicalInfo || 'No medical conditions'}</span>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Academic Details -->
                        <div class="bg-white rounded-xl border border-gray-200 p-4">
                            <h5 class="font-semibold text-gray-700 mb-3">Academic Details</h5>
                            <div class="space-y-2 text-sm">
                                <div class="flex">
                                    <span class="w-40 text-gray-600">Admission Date:</span>
                                    <span class="font-medium">${formatDate(student.admissionDate)}</span>
                                </div>
                                <div class="flex">
                                    <span class="w-40 text-gray-600">Academic Year:</span>
                                    <span class="font-medium">${student.academicYear}</span>
                                </div>
                                <div class="flex">
                                    <span class="w-40 text-gray-600">Class Teacher:</span>
                                    <span class="font-medium">${student.classTeacher || 'Not assigned'}</span>
                                </div>
                                <div class="flex">
                                    <span class="w-40 text-gray-600">Previous School:</span>
                                    <span class="font-medium">${student.previousSchool || 'Not applicable'}</span>
                                </div>
                                <div class="flex">
                                    <span class="w-40 text-gray-600">Attendance:</span>
                                    <span class="font-medium">${student.attendance}</span>
                                </div>
                                <div class="flex items-start">
                                    <span class="w-40 text-gray-600 mt-1">Subjects:</span>
                                    <div class="flex-1">
                                        <div class="flex flex-wrap gap-1">
                                            ${Array.isArray(student.subjects) ? student.subjects.map(subject => `
                                                <span class="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">${subject}</span>
                                            `).join('') : student.subjects || 'Not specified'}
                                        </div>
                                        ${student.otherSubjects && student.otherSubjects.length > 0 ? `
                                        <div class="mt-2">
                                            <span class="text-xs text-gray-500 block mb-1">Additional Subjects:</span>
                                            <div class="flex flex-wrap gap-1">
                                                ${student.otherSubjects.map(subject => `
                                                    <span class="px-2 py-1 bg-green-50 text-green-700 rounded text-xs">${subject}</span>
                                                `).join('')}
                                            </div>
                                        </div>
                                        ` : ''}
                                    </div>
                                </div>
                                <div class="flex items-start">
                                    <span class="w-40 text-gray-600 mt-1">Sports:</span>
                                    <div class="flex-1">
                                        <div class="flex flex-wrap gap-1">
                                            ${Array.isArray(student.sports) ? student.sports.map(sport => `
                                                <span class="px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs">${sport}</span>
                                            `).join('') : student.sports || 'Not specified'}
                                        </div>
                                        ${student.otherSports && student.otherSports.length > 0 ? `
                                        <div class="mt-2">
                                            <span class="text-xs text-gray-500 block mb-1">Additional Sports:</span>
                                            <div class="flex flex-wrap gap-1">
                                                ${student.otherSports.map(sport => `
                                                    <span class="px-2 py-1 bg-yellow-50 text-yellow-700 rounded text-xs">${sport}</span>
                                                `).join('')}
                                            </div>
                                        </div>
                                        ` : ''}
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Parent Details -->
                        <div class="md:col-span-2 bg-white rounded-xl border border-gray-200 p-4">
                            <h5 class="font-semibold text-gray-700 mb-3">Parent/Guardian Details</h5>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div class="space-y-2 text-sm">
                                    <h6 class="font-medium text-blue-600 mb-2">Father's Details</h6>
                                    <div class="flex">
                                        <span class="w-40 text-gray-600">Name:</span>
                                        <span class="font-medium">${student.fatherName}</span>
                                    </div>
                                    <div class="flex">
                                        <span class="w-40 text-gray-600">Contact:</span>
                                        <span class="font-medium">${student.fatherContact}</span>
                                    </div>
                                    <div class="flex">
                                        <span class="w-40 text-gray-600">Aadhar:</span>
                                        <span class="font-medium">${student.fatherAadhar || 'Not available'}</span>
                                    </div>
                                    <div class="flex">
                                        <span class="w-40 text-gray-600">Occupation:</span>
                                        <span class="font-medium">${student.fatherOccupation || 'Not specified'}</span>
                                    </div>
                                </div>
                                <div class="space-y-2 text-sm">
                                    <h6 class="font-medium text-pink-600 mb-2">Mother's Details</h6>
                                    <div class="flex">
                                        <span class="w-40 text-gray-600">Name:</span>
                                        <span class="font-medium">${student.motherName}</span>
                                    </div>
                                    <div class="flex">
                                        <span class="w-40 text-gray-600">Contact:</span>
                                        <span class="font-medium">${student.motherContact || 'Not available'}</span>
                                    </div>
                                    <div class="flex">
                                        <span class="w-40 text-gray-600">Aadhar:</span>
                                        <span class="font-medium">${student.motherAadhar || 'Not available'}</span>
                                    </div>
                                    <div class="flex">
                                        <span class="w-40 text-gray-600">Occupation:</span>
                                        <span class="font-medium">${student.motherOccupation || 'Not specified'}</span>
                                    </div>
                                </div>
                            </div>
                            <div class="mt-4 pt-4 border-t">
                                <div class="space-y-2 text-sm">
                                    <div class="flex">
                                        <span class="w-40 text-gray-600">Primary Email:</span>
                                        <span class="font-medium">${student.parentEmail}</span>
                                    </div>
                                    <div class="flex">
                                        <span class="w-40 text-gray-600">Relationship:</span>
                                        <span class="font-medium">${student.relationship}</span>
                                    </div>
                                    <div class="flex">
                                        <span class="w-40 text-gray-600">Emergency Contact:</span>
                                        <div>
                                            <div class="font-medium">${student.emergencyContactName}</div>
                                            <div class="text-gray-600">${student.emergencyContactNumber}</div>
                                        </div>
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
                                    <p class="text-sm font-medium">${student.localAddress || 'Not specified'}</p>
                                </div>
                                <div>
                                    <h6 class="font-medium text-green-600 mb-2">Permanent Address</h6>
                                    <p class="text-sm font-medium">${student.permanentAddress || student.localAddress || 'Not specified'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Student Login Details -->
                    <div class="mt-6 bg-white rounded-xl border border-gray-200 p-4">
                        <h5 class="font-semibold text-gray-700 mb-3">Student Login Portal</h5>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="space-y-2 text-sm">
                                <div class="flex">
                                    <span class="w-40 text-gray-600">Student ID:</span>
                                    <span class="font-medium">${student.studentId}</span>
                                </div>
                                <div class="flex">
                                    <span class="w-40 text-gray-600">Email:</span>
                                    <span class="font-medium">${student.email}</span>
                                </div>
                            </div>
                            <div class="space-y-2 text-sm">
                                <div class="flex">
                                    <span class="w-40 text-gray-600">Student Password:</span>
                                    <span class="font-medium">●●●●●●●●</span>
                                </div>
                                <div class="text-xs text-gray-500">
                                    Password is encrypted for security
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="flex flex-col lg:flex-row justify-end space-y-4 lg:space-y-0 lg:space-x-4 mt-8 pt-6 border-t border-gray-200">
                
                <button onclick="closeModal('viewModalOverlay')" class="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 font-medium">
                    <i class="fas fa-times mr-2"></i>Close
                </button>
            </div>
        </div>
    `;
}

// EDIT STUDENT FUNCTIONALITY
function editStudent(studentId) {
    const student = dummyStudents.find(s => s.id === studentId);
    if (!student) {
        Toast.show('Student not found', 'error');
        return;
    }
    
    editingStudentId = studentId;
    
    // Show edit form
    document.getElementById('allStudentsSection').classList.add('hidden');
    document.getElementById('addStudentSection').classList.remove('hidden');
    
    // Update form title
    document.getElementById('formTitle').textContent = `Edit Student - ${student.firstName} ${student.lastName}`;
    
    // Switch to first tab
    switchTab('personal');
    
    // Scroll to top
    window.scrollTo(0, 0);
    
    // Populate form with student data
    populateEditForm(student);
    
    Toast.show('Editing student: ' + student.firstName + ' ' + student.lastName, 'info');
}

// Populate form with student data for editing
function populateEditForm(student) {
    // Reset form first
    document.getElementById('addStudentForm').reset();
    
    // Personal Details
    document.querySelector('input[name="firstName"]').value = student.firstName || '';
    document.querySelector('input[name="middleName"]').value = student.middleName || '';
    document.querySelector('input[name="lastName"]').value = student.lastName || '';
    document.querySelector('input[name="dob"]').value = student.dob || '';
    document.querySelector('select[name="gender"]').value = student.gender || '';
    document.querySelector('select[name="bloodGroup"]').value = student.bloodGroup || '';
    document.querySelector('select[name="casteCategory"]').value = student.casteCategory || '';
    document.querySelector('input[name="previousSchool"]').value = student.previousSchool || '';
    document.querySelector('input[name="aadharNumber"]').value = student.aadharNumber || '';
    document.querySelector('textarea[name="medicalInfo"]').value = student.medicalInfo || '';
    
    // Student ID and Password (disabled for editing)
    document.getElementById('studentId').value = student.studentId || '';
    document.getElementById('studentId').readOnly = true;
    document.getElementById('studentPassword').value = '********';
    document.getElementById('studentPassword').readOnly = true;
    document.getElementById('confirmStudentPassword').value = '********';
    document.getElementById('confirmStudentPassword').readOnly = true;
    document.getElementById('autoGeneratedId').textContent = student.studentId || '';
    
    // Address
    document.querySelector('input[name="localAddressLine1"]').value = student.localAddressLine1 || '';
    document.querySelector('input[name="localAddressLine2"]').value = student.localAddressLine2 || '';
    document.querySelector('input[name="localCity"]').value = student.localCity || '';
    document.querySelector('input[name="localState"]').value = student.localState || '';
    document.querySelector('input[name="localPincode"]').value = student.localPincode || '';
    
    document.getElementById('sameAsLocal').checked = student.sameAsLocal || false;
    togglePermanentAddress();
    
    if (!student.sameAsLocal) {
        document.querySelector('input[name="permanentAddressLine1"]').value = student.permanentAddressLine1 || '';
        document.querySelector('input[name="permanentAddressLine2"]').value = student.permanentAddressLine2 || '';
        document.querySelector('input[name="permanentCity"]').value = student.permanentCity || '';
        document.querySelector('input[name="permanentState"]').value = student.permanentState || '';
        document.querySelector('input[name="permanentPincode"]').value = student.permanentPincode || '';
    }
    
    // Sports
    otherSports = student.otherSports || [];
    updateOtherSportsDisplay();
    
    // Check sports checkboxes
    if (student.sports && Array.isArray(student.sports)) {
        student.sports.forEach(sport => {
            const checkbox = document.querySelector(`input[name="sports[]"][value="${sport}"]`);
            if (checkbox) checkbox.checked = true;
        });
    }
    
    // Academic Details
    document.querySelector('select[name="class"]').value = student.class || '';
    document.querySelector('select[name="section"]').value = student.section || '';
    document.querySelector('input[name="rollNumber"]').value = student.rollNumber || '';
    document.querySelector('input[name="admissionDate"]').value = student.admissionDate || '';
    document.querySelector('select[name="academicYear"]').value = student.academicYear || '';
    document.querySelector('select[name="classTeacher"]').value = student.classTeacher || '';
    
    // Subjects
    otherSubjects = student.otherSubjects || [];
    updateOtherSubjectsDisplay();
    
    // Check subjects checkboxes
    if (student.subjects && Array.isArray(student.subjects)) {
        student.subjects.forEach(subject => {
            const checkbox = document.querySelector(`input[name="subjects[]"][value="${subject}"]`);
            if (checkbox) checkbox.checked = true;
        });
    }
    
    // Parent Details
    document.querySelector('input[name="fatherName"]').value = student.fatherName || '';
    document.querySelector('input[name="fatherAadhar"]').value = student.fatherAadhar || '';
    document.querySelector('input[name="fatherContact"]').value = student.fatherContact || '';
    document.querySelector('input[name="fatherOccupation"]').value = student.fatherOccupation || '';
    
    document.querySelector('input[name="motherName"]').value = student.motherName || '';
    document.querySelector('input[name="motherAadhar"]').value = student.motherAadhar || '';
    document.querySelector('input[name="motherContact"]').value = student.motherContact || '';
    document.querySelector('input[name="motherOccupation"]').value = student.motherOccupation || '';
    
    document.querySelector('input[name="parentEmail"]').value = student.parentEmail || '';
    document.querySelector('select[name="relationship"]').value = student.relationship || '';
    
    document.querySelector('input[name="emergencyContactName"]').value = student.emergencyContactName || '';
    document.querySelector('input[name="emergencyContactNumber"]').value = student.emergencyContactNumber || '';
    
    // Fees Details
    document.getElementById('admissionFees').value = student.admissionFees || 0;
    document.getElementById('uniformFees').value = student.uniformFees || 0;
    document.getElementById('bookFees').value = student.bookFees || 0;
    document.getElementById('tuitionFees').value = student.tuitionFees || 0;
    document.getElementById('initialPayment').value = student.initialPayment || 0;
    
    // Payment Mode
    const paymentModeRadio = document.querySelector(`input[name="paymentMode"][value="${student.paymentMode || 'one-time'}"]`);
    if (paymentModeRadio) {
        paymentModeRadio.checked = true;
        toggleInstallmentOptions();
    }
    
    // Payment Method
    const paymentMethodRadio = document.querySelector(`input[name="paymentMethod"][value="${student.paymentMethod || 'cash'}"]`);
    if (paymentMethodRadio) {
        paymentMethodRadio.checked = true;
        handlePaymentMethodChange();
    }
    
    // Transaction ID
    document.getElementById('transactionId').value = student.transactionId || '';
    
    // Update fee calculations
    updateFeeCalculations();
    
    // Update submit button text
    document.getElementById('submitButton').innerHTML = '<i class="fas fa-save mr-2"></i>Update Student';
}

// Delete student
function deleteStudent(studentId) {
    if (confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
        const index = dummyStudents.findIndex(s => s.id === studentId);
        if (index !== -1) {
            const studentName = dummyStudents[index].firstName + ' ' + dummyStudents[index].lastName;
            dummyStudents.splice(index, 1);
            loadStudentTable();
            Toast.show(`Student "${studentName}" deleted successfully`, 'success');
        }
    }
}

// Close modal
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
}

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    // Load student table
    loadStudentTable();
    
    // Auto-generate student ID when page loads
    const autoGeneratedId = generateStudentId();
    document.getElementById('autoGeneratedId').textContent = autoGeneratedId;
    document.getElementById('studentId').value = autoGeneratedId;
    
    // Validate password match
    const password = document.getElementById('studentPassword');
    const confirmPassword = document.getElementById('confirmStudentPassword');
    const mismatchMessage = document.getElementById('passwordMismatch');
    
    function checkPasswordMatch() {
        if (!editingStudentId && password.value && confirmPassword.value && password.value !== confirmPassword.value) {
            mismatchMessage.classList.remove('hidden');
        } else {
            mismatchMessage.classList.add('hidden');
        }
    }
    
    password.addEventListener('input', checkPasswordMatch);
    confirmPassword.addEventListener('input', checkPasswordMatch);

    // Set default date for first installment
    const today = new Date();
    const firstInstallmentDate = document.getElementById('firstInstallmentDate');
    if (firstInstallmentDate) {
        today.setMonth(today.getMonth() + 1);
        const nextMonth = today.toISOString().split('T')[0];
        firstInstallmentDate.value = nextMonth;
    }

    // Initialize fee calculations
    updateFeeCalculations();
    
    // Add event listeners to fee inputs
    const feeInputs = ['admissionFees', 'uniformFees', 'bookFees', 'tuitionFees', 'initialPayment'];
    feeInputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('input', updateFeeCalculations);
        }
    });
    
    // Add event listener to installment count
    const installmentCount = document.getElementById('installmentCount');
    if (installmentCount) {
        installmentCount.addEventListener('change', calculateInstallments);
    }
    
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
    
    // Initialize sidebar toggle
    document.getElementById('sidebarToggle').addEventListener('click', function() {
        const sidebar = document.getElementById('sidebar');
        const mainContent = document.getElementById('mainContent');
        const icon = document.getElementById('sidebarToggleIcon');
        
        if (window.innerWidth < 1024) {
            sidebar.classList.toggle('mobile-open');
            document.getElementById('sidebarOverlay').classList.toggle('active');
        } else {
            sidebar.classList.toggle('collapsed');
            mainContent.classList.toggle('sidebar-collapsed');
            icon.classList.toggle('fa-bars');
            icon.classList.toggle('fa-times');
        }
    });
    
    // Close sidebar on mobile when clicking overlay
    document.getElementById('sidebarOverlay').addEventListener('click', function() {
        document.getElementById('sidebar').classList.remove('mobile-open');
        this.classList.remove('active');
    });
    
    // Initialize notifications dropdown
    document.getElementById('notificationsBtn').addEventListener('click', function(e) {
        e.stopPropagation();
        document.getElementById('notificationsDropdown').classList.toggle('hidden');
    });
    
    // Initialize user menu dropdown
    document.getElementById('userMenuBtn').addEventListener('click', function(e) {
        e.stopPropagation();
        document.getElementById('userMenuDropdown').classList.toggle('hidden');
    });
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', function() {
        document.getElementById('notificationsDropdown').classList.add('hidden');
        document.getElementById('userMenuDropdown').classList.add('hidden');
    });
    
    // Prevent dropdowns from closing when clicking inside them
    document.querySelectorAll('#notificationsDropdown, #userMenuDropdown').forEach(dropdown => {
        dropdown.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    });
    
    Toast.show('Student management system loaded successfully', 'success');
});

// Helper function for document status
function updateDocumentStatus() {
    const statusElement = document.getElementById('documentStatus');
    const fileInputs = [
        'studentAadharImage',
        'birthCertificateImage',
        'fatherAadharImage',
        'motherAadharImage',
        'transferCertificateImage',
        'fatherIncomeCertificateImage',
        'castCertificateImage'
    ];
    
    let uploadedCount = 0;
    fileInputs.forEach(id => {
        if (document.getElementById(id)?.files?.length > 0) {
            uploadedCount++;
        }
    });
    
    if (uploadedCount === 0) {
        statusElement.innerHTML = 'No documents uploaded yet';
    } else {
        statusElement.innerHTML = `<span class="text-green-600"><i class="fas fa-check-circle mr-2"></i>${uploadedCount} document(s) uploaded</span>`;
    }
}

// Export students function
function exportStudents() {
    Toast.show('Export functionality will be implemented here', 'info');
}

// Page navigation functions
function previousPage() {
    Toast.show('Previous page functionality will be implemented here', 'info');
}

function nextPage() {
    Toast.show('Next page functionality will be implemented here', 'info');
}
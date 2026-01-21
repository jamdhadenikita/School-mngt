
// Marks and Reports Management Module
document.addEventListener('DOMContentLoaded', function() {
    initializeMarksModule();
});

// Initialize the marks module
function initializeMarksModule() {
    setupTabNavigation();
    setupFormHandlers();
    setupMarksTable();
    setupReportHandlers();
    setupGradeBook();
    setupModals();
    loadSampleData();
    
    // Initialize performance buttons
    document.querySelectorAll('.performance-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const subject = this.dataset.subject;
            const performance = this.dataset.performance;
            setPerformanceForSubject(subject, performance);
        });
    });
    
    // Setup real-time grade calculation
    document.querySelectorAll('.marks-input').forEach(input => {
        input.addEventListener('input', function() {
            const subject = this.dataset.subject;
            const marks = parseInt(this.value) || 0;
            updateGradeDisplay(subject, marks);
        });
    });
}

// Tab Navigation
function setupTabNavigation() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.id.replace('Tab', 'Content');
            
            // Update active tab button
            tabButtons.forEach(btn => {
                btn.classList.remove('active');
                btn.classList.add('text-gray-500');
                btn.classList.remove('text-gray-700', 'border-blue-500');
            });
            
            this.classList.add('active');
            this.classList.remove('text-gray-500');
            this.classList.add('text-gray-700', 'border-blue-500');
            
            // Show active tab content
            tabContents.forEach(content => {
                content.classList.remove('active');
                content.classList.add('hidden');
            });
            
            document.getElementById(tabId).classList.add('active');
            document.getElementById(tabId).classList.remove('hidden');
        });
    });
}

// Form Handlers
function setupFormHandlers() {
    const assignMarksForm = document.getElementById('assignMarksForm');
    
    if (assignMarksForm) {
        assignMarksForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveStudentMarks();
        });
    }
    
    // Setup form reset
    document.querySelector('button[type="reset"]')?.addEventListener('click', function() {
        resetMarksForm();
    });
}

// Save student marks
function saveStudentMarks() {
    const studentSelect = document.getElementById('studentSelect');
    const termSelect = document.getElementById('termSelect');
    const teacherComments = document.getElementById('teacherComments');
    const assessmentDate = document.getElementById('assessmentDate');
    
    // Validate required fields
    if (!studentSelect.value || !termSelect.value || !assessmentDate.value) {
        showToast('Please fill all required fields', 'error');
        return;
    }
    
    // Collect marks data
    const marksData = {
        studentId: studentSelect.value,
        studentName: studentSelect.options[studentSelect.selectedIndex].text,
        term: termSelect.value,
        assessmentDate: assessmentDate.value,
        teacherComments: teacherComments.value,
        subjects: {},
        overall: {
            totalMarks: 0,
            percentage: 0,
            grade: ''
        }
    };
    
    // Collect subject marks
    let totalMarks = 0;
    let subjectCount = 0;
    const subjects = ['Mathematics', 'Science', 'English', 'Social Studies'];
    
    subjects.forEach(subject => {
        const marksInput = document.querySelector(`.marks-input[data-subject="${subject}"]`);
        const remarksInput = document.querySelector(`input[data-remarks="${subject}"]`);
        const gradeDisplay = document.querySelector(`[data-grade-display="${subject}"]`);
        
        const marks = parseInt(marksInput.value) || 0;
        const grade = gradeDisplay.textContent.replace('Grade: ', '');
        
        marksData.subjects[subject] = {
            marks: marks,
            grade: grade,
            remarks: remarksInput.value,
            performance: getPerformanceForSubject(subject)
        };
        
        if (marks > 0) {
            totalMarks += marks;
            subjectCount++;
        }
    });
    
    // Calculate overall
    if (subjectCount > 0) {
        const percentage = Math.round((totalMarks / (subjectCount * 100)) * 100);
        marksData.overall.totalMarks = totalMarks;
        marksData.overall.percentage = percentage;
        marksData.overall.grade = calculateGrade(percentage);
    }
    
    // Save to localStorage
    saveMarksToStorage(marksData);
    
    // Show success message
    showToast(`Marks saved successfully for ${marksData.studentName}`, 'success');
    
    // Reset form
    resetMarksForm();
    
    // Refresh marks table if on view tab
    if (document.getElementById('viewMarksTab').classList.contains('active')) {
        loadMarksTable();
    }
}

// Save marks to localStorage
function saveMarksToStorage(marksData) {
    let allMarks = JSON.parse(localStorage.getItem('studentMarks')) || [];
    
    // Check if marks already exist for this student and term
    const existingIndex = allMarks.findIndex(m => 
        m.studentId === marksData.studentId && m.term === marksData.term
    );
    
    if (existingIndex !== -1) {
        // Update existing record
        allMarks[existingIndex] = marksData;
    } else {
        // Add new record
        marksData.id = Date.now(); // Unique ID
        allMarks.push(marksData);
    }
    
    localStorage.setItem('studentMarks', JSON.stringify(allMarks));
}

// Reset marks form
function resetMarksForm() {
    document.getElementById('assignMarksForm').reset();
    document.querySelectorAll('.marks-input').forEach(input => {
        input.value = '';
    });
    
    document.querySelectorAll('[data-grade-display]').forEach(display => {
        display.textContent = 'Grade: -';
    });
    
    document.querySelectorAll('.performance-btn').forEach(btn => {
        btn.classList.remove('active');
        btn.classList.remove('bg-blue-600', 'text-white');
        btn.classList.add('border-gray-300', 'text-gray-700');
    });
    
    // Set default date to today
    document.getElementById('assessmentDate').valueAsDate = new Date();
}

// Set performance for a subject
function setPerformanceForSubject(subject, performance) {
    // Remove active class from all buttons for this subject
    document.querySelectorAll(`.performance-btn[data-subject="${subject}"]`).forEach(btn => {
        btn.classList.remove('active');
        btn.classList.remove('bg-blue-600', 'text-white');
        btn.classList.add('border-gray-300', 'text-gray-700');
    });
    
    // Add active class to clicked button
    const activeBtn = document.querySelector(`.performance-btn[data-subject="${subject}"][data-performance="${performance}"]`);
    activeBtn.classList.add('active');
    activeBtn.classList.add('bg-blue-600', 'text-white');
    activeBtn.classList.remove('border-gray-300', 'text-gray-700');
}

// Get performance for a subject
function getPerformanceForSubject(subject) {
    const activeBtn = document.querySelector(`.performance-btn[data-subject="${subject}"].active`);
    return activeBtn ? activeBtn.dataset.performance : '';
}

// Update grade display based on marks
function updateGradeDisplay(subject, marks) {
    const gradeDisplay = document.querySelector(`[data-grade-display="${subject}"]`);
    const grade = calculateGrade(marks);
    gradeDisplay.textContent = `Grade: ${grade} (${marks}%)`;
    
    // Add color based on grade
    gradeDisplay.className = 'mt-1 text-sm';
    if (grade === 'A') gradeDisplay.classList.add('text-green-600');
    else if (grade === 'B') gradeDisplay.classList.add('text-blue-600');
    else if (grade === 'C') gradeDisplay.classList.add('text-yellow-600');
    else if (grade === 'D') gradeDisplay.classList.add('text-orange-600');
    else if (grade === 'F') gradeDisplay.classList.add('text-red-600');
    else gradeDisplay.classList.add('text-gray-500');
}

// Calculate grade based on percentage
function calculateGrade(percentage) {
    if (percentage >= 90) return 'A';
    if (percentage >= 75) return 'B';
    if (percentage >= 60) return 'C';
    if (percentage >= 40) return 'D';
    return 'F';
}

// Setup marks table
function setupMarksTable() {
    // Setup search and filter
    document.getElementById('searchStudent')?.addEventListener('input', loadMarksTable);
    document.getElementById('classFilter')?.addEventListener('change', loadMarksTable);
    document.getElementById('termFilter')?.addEventListener('change', loadMarksTable);
    
    // Initial load
    loadMarksTable();
}

// Load marks table with data
function loadMarksTable() {
    const searchTerm = document.getElementById('searchStudent')?.value.toLowerCase() || '';
    const classFilter = document.getElementById('classFilter')?.value || '';
    const termFilter = document.getElementById('termFilter')?.value || '';
    
    const allMarks = JSON.parse(localStorage.getItem('studentMarks')) || [];
    const tableBody = document.getElementById('marksTableBody');
    const noMarksMessage = document.getElementById('noMarksMessage');
    
    if (!tableBody) return;
    
    // Clear table
    tableBody.innerHTML = '';
    
    // Filter marks
    const filteredMarks = allMarks.filter(marks => {
        // Search filter
        if (searchTerm && !marks.studentName.toLowerCase().includes(searchTerm)) {
            return false;
        }
        
        // Class filter (simplified - in real app, would check student class)
        if (classFilter) {
            const studentClass = getClassFromStudentName(marks.studentName);
            if (!studentClass.includes(classFilter)) {
                return false;
            }
        }
        
        // Term filter
        if (termFilter && marks.term !== termFilter) {
            return false;
        }
        
        return true;
    });
    
    // Check if we have any marks
    if (filteredMarks.length === 0) {
        tableBody.innerHTML = '';
        if (noMarksMessage) noMarksMessage.classList.remove('hidden');
        return;
    }
    
    if (noMarksMessage) noMarksMessage.classList.add('hidden');
    
    // Populate table
    filteredMarks.forEach(marks => {
        const row = document.createElement('tr');
        row.className = 'table-row-hover';
        
        // Get subject list
        const subjects = Object.keys(marks.subjects).map(subject => {
            return `${subject}: ${marks.subjects[subject].marks}%`;
        }).join(', ');
        
        // Get grade color class
        const gradeClass = `grade-${marks.overall.grade.toLowerCase()}`;
        
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <div class="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <i class="fas fa-user-graduate text-blue-600"></i>
                    </div>
                    <div>
                        <div class="text-sm font-medium text-gray-900">${marks.studentName.split(' (')[0]}</div>
                        <div class="text-sm text-gray-500">ID: ${marks.studentId}</div>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                ${getClassFromStudentName(marks.studentName)}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                ${formatTerm(marks.term)}
            </td>
            <td class="px-6 py-4 text-sm text-gray-700 max-w-xs truncate" title="${subjects}">
                ${subjects}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                ${marks.overall.totalMarks}/400
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium ${gradeClass}">
                ${marks.overall.percentage}%
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium ${gradeClass}">
                ${marks.overall.grade}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex space-x-2">
                    <button class="edit-marks-btn text-blue-600 hover:text-blue-900" data-id="${marks.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="delete-marks-btn text-red-600 hover:text-red-900" data-id="${marks.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                    <button class="view-report-btn text-green-600 hover:text-green-900" data-id="${marks.id}">
                        <i class="fas fa-file-alt"></i>
                    </button>
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Add event listeners to action buttons
    document.querySelectorAll('.edit-marks-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const marksId = this.dataset.id;
            openEditMarksModal(marksId);
        });
    });
    
    document.querySelectorAll('.delete-marks-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const marksId = this.dataset.id;
            deleteMarks(marksId);
        });
    });
    
    document.querySelectorAll('.view-report-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const marksId = this.dataset.id;
            viewReport(marksId);
        });
    });
}

// Get class from student name (helper function)
function getClassFromStudentName(studentName) {
    // Extract class from the student name format: "Name (Class X, Roll No: Y)"
    const match = studentName.match(/Class (\w+)/);
    return match ? match[1] : 'Unknown';
}

// Format term for display
function formatTerm(term) {
    const termMap = {
        'term1': 'Term 1',
        'term2': 'Term 2',
        'term3': 'Term 3',
        'term4': 'Term 4',
        'midterm': 'Mid-Term',
        'final': 'Final'
    };
    
    return termMap[term] || term;
}

// Open edit marks modal
function openEditMarksModal(marksId) {
    const allMarks = JSON.parse(localStorage.getItem('studentMarks')) || [];
    const marksData = allMarks.find(m => m.id == marksId);
    
    if (!marksData) {
        showToast('Marks record not found', 'error');
        return;
    }
    
    // Populate modal form
    const formContainer = document.getElementById('editMarksFormContainer');
    formContainer.innerHTML = generateEditMarksForm(marksData);
    
    // Show modal
    document.getElementById('editMarksModal').classList.remove('hidden');
    
    // Setup form submission
    document.getElementById('updateMarksForm')?.addEventListener('submit', function(e) {
        e.preventDefault();
        updateMarks(marksId);
    });
    
    // Setup performance buttons in modal
    document.querySelectorAll('.edit-performance-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const subject = this.dataset.subject;
            const performance = this.dataset.performance;
            setEditPerformanceForSubject(subject, performance);
        });
    });
    
    // Setup real-time grade calculation in modal
    document.querySelectorAll('.edit-marks-input').forEach(input => {
        input.addEventListener('input', function() {
            const subject = this.dataset.subject;
            const marks = parseInt(this.value) || 0;
            updateEditGradeDisplay(subject, marks);
        });
    });
}

// Generate edit marks form HTML
function generateEditMarksForm(marksData) {
    let formHTML = `
        <form id="updateMarksForm" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Student</label>
                    <p class="text-lg font-medium text-gray-800">${marksData.studentName}</p>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Term</label>
                    <p class="text-lg font-medium text-gray-800">${formatTerm(marksData.term)}</p>
                </div>
            </div>
            
            <div class="border border-gray-200 rounded-lg p-6">
                <h4 class="text-lg font-semibold text-gray-800 mb-4">Edit Subject Marks</h4>
    `;
    
    // Add subject fields
    Object.keys(marksData.subjects).forEach(subject => {
        const subjectData = marksData.subjects[subject];
        formHTML += `
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">${subject}</label>
                    <div class="flex items-center">
                        <input type="number" min="0" max="100" 
                               class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 edit-marks-input"
                               value="${subjectData.marks}" data-subject="${subject}">
                        <span class="ml-2 text-sm text-gray-500">/100</span>
                    </div>
                    <p class="mt-1 text-sm" data-edit-grade-display="${subject}">
                        Grade: ${subjectData.grade} (${subjectData.marks}%)
                    </p>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                    <input type="text" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 edit-remarks-input"
                           value="${subjectData.remarks}" data-edit-remarks="${subject}">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Performance</label>
                    <div class="flex items-center space-x-2">
                        <button type="button" class="edit-performance-btn px-3 py-1 text-sm rounded-full border ${subjectData.performance === 'excellent' ? 'bg-blue-600 text-white' : 'border-gray-300 text-gray-700'}" 
                                data-subject="${subject}" data-performance="excellent">Excellent</button>
                        <button type="button" class="edit-performance-btn px-3 py-1 text-sm rounded-full border ${subjectData.performance === 'good' ? 'bg-blue-600 text-white' : 'border-gray-300 text-gray-700'}" 
                                data-subject="${subject}" data-performance="good">Good</button>
                        <button type="button" class="edit-performance-btn px-3 py-1 text-sm rounded-full border ${subjectData.performance === 'average' ? 'bg-blue-600 text-white' : 'border-gray-300 text-gray-700'}" 
                                data-subject="${subject}" data-performance="average">Average</button>
                    </div>
                </div>
            </div>
        `;
    });
    
    formHTML += `
            </div>
            
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Teacher's Overall Comments</label>
                <textarea id="editTeacherComments" rows="3" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">${marksData.teacherComments || ''}</textarea>
            </div>
            
            <div class="flex justify-end space-x-4 pt-4">
                <button type="button" id="cancelEdit" class="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50">Cancel</button>
                <button type="submit" class="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700">Update Marks</button>
            </div>
        </form>
    `;
    
    return formHTML;
}

// Set performance for subject in edit modal
function setEditPerformanceForSubject(subject, performance) {
    // Remove active class from all buttons for this subject
    document.querySelectorAll(`.edit-performance-btn[data-subject="${subject}"]`).forEach(btn => {
        btn.classList.remove('bg-blue-600', 'text-white');
        btn.classList.add('border-gray-300', 'text-gray-700');
    });
    
    // Add active class to clicked button
    const activeBtn = document.querySelector(`.edit-performance-btn[data-subject="${subject}"][data-performance="${performance}"]`);
    activeBtn.classList.add('bg-blue-600', 'text-white');
    activeBtn.classList.remove('border-gray-300', 'text-gray-700');
}

// Update grade display in edit modal
function updateEditGradeDisplay(subject, marks) {
    const gradeDisplay = document.querySelector(`[data-edit-grade-display="${subject}"]`);
    const grade = calculateGrade(marks);
    gradeDisplay.textContent = `Grade: ${grade} (${marks}%)`;
    
    // Add color based on grade
    gradeDisplay.className = 'mt-1 text-sm';
    if (grade === 'A') gradeDisplay.classList.add('text-green-600');
    else if (grade === 'B') gradeDisplay.classList.add('text-blue-600');
    else if (grade === 'C') gradeDisplay.classList.add('text-yellow-600');
    else if (grade === 'D') gradeDisplay.classList.add('text-orange-600');
    else if (grade === 'F') gradeDisplay.classList.add('text-red-600');
    else gradeDisplay.classList.add('text-gray-500');
}

// Update marks
function updateMarks(marksId) {
    const allMarks = JSON.parse(localStorage.getItem('studentMarks')) || [];
    const marksIndex = allMarks.findIndex(m => m.id == marksId);
    
    if (marksIndex === -1) {
        showToast('Marks record not found', 'error');
        return;
    }
    
    // Get updated data from form
    const updatedMarks = { ...allMarks[marksIndex] };
    
    // Update subject marks
    Object.keys(updatedMarks.subjects).forEach(subject => {
        const marksInput = document.querySelector(`.edit-marks-input[data-subject="${subject}"]`);
        const remarksInput = document.querySelector(`.edit-remarks-input[data-edit-remarks="${subject}"]`);
        const gradeDisplay = document.querySelector(`[data-edit-grade-display="${subject}"]`);
        
        const marks = parseInt(marksInput.value) || 0;
        const grade = gradeDisplay.textContent.match(/Grade: (\w+)/)[1];
        
        updatedMarks.subjects[subject] = {
            marks: marks,
            grade: grade,
            remarks: remarksInput.value,
            performance: getEditPerformanceForSubject(subject)
        };
    });
    
    // Recalculate overall
    let totalMarks = 0;
    let subjectCount = 0;
    
    Object.values(updatedMarks.subjects).forEach(subjectData => {
        if (subjectData.marks > 0) {
            totalMarks += subjectData.marks;
            subjectCount++;
        }
    });
    
    if (subjectCount > 0) {
        const percentage = Math.round((totalMarks / (subjectCount * 100)) * 100);
        updatedMarks.overall.totalMarks = totalMarks;
        updatedMarks.overall.percentage = percentage;
        updatedMarks.overall.grade = calculateGrade(percentage);
    }
    
    // Update teacher comments
    updatedMarks.teacherComments = document.getElementById('editTeacherComments').value;
    
    // Save updated marks
    allMarks[marksIndex] = updatedMarks;
    localStorage.setItem('studentMarks', JSON.stringify(allMarks));
    
    // Close modal
    document.getElementById('editMarksModal').classList.add('hidden');
    
    // Show success message
    showToast('Marks updated successfully', 'success');
    
    // Refresh table
    loadMarksTable();
}

// Get performance for subject in edit modal
function getEditPerformanceForSubject(subject) {
    const activeBtn = document.querySelector(`.edit-performance-btn[data-subject="${subject}"].bg-blue-600`);
    return activeBtn ? activeBtn.dataset.performance : '';
}

// Delete marks
function deleteMarks(marksId) {
    if (!confirm('Are you sure you want to delete these marks? This action cannot be undone.')) {
        return;
    }
    
    let allMarks = JSON.parse(localStorage.getItem('studentMarks')) || [];
    const initialLength = allMarks.length;
    
    allMarks = allMarks.filter(m => m.id != marksId);
    
    if (allMarks.length < initialLength) {
        localStorage.setItem('studentMarks', JSON.stringify(allMarks));
        showToast('Marks deleted successfully', 'success');
        loadMarksTable();
    } else {
        showToast('Marks record not found', 'error');
    }
}

// View report
function viewReport(marksId) {
    const allMarks = JSON.parse(localStorage.getItem('studentMarks')) || [];
    const marksData = allMarks.find(m => m.id == marksId);
    
    if (!marksData) {
        showToast('Marks record not found', 'error');
        return;
    }
    
    // Generate report preview
    const reportContent = document.getElementById('reportPreviewContent');
    reportContent.innerHTML = generateReportPreview(marksData);
    
    // Show report modal
    document.getElementById('reportPreviewModal').classList.remove('hidden');
}

// Setup report handlers
function setupReportHandlers() {
    // Report type selection
    document.querySelectorAll('.report-type-card').forEach(card => {
        card.addEventListener('click', function() {
            document.querySelectorAll('.report-type-card').forEach(c => {
                c.classList.remove('active');
            });
            this.classList.add('active');
            
            const reportType = this.dataset.type;
            if (reportType === 'individual') {
                document.getElementById('individualReportOptions').classList.remove('hidden');
                document.getElementById('classReportOptions').classList.add('hidden');
            } else {
                document.getElementById('individualReportOptions').classList.add('hidden');
                document.getElementById('classReportOptions').classList.remove('hidden');
            }
        });
    });
    
    // Generate report button
    document.getElementById('generateReportBtn')?.addEventListener('click', generateReport);
    
    // Preview report button
    document.getElementById('previewReportBtn')?.addEventListener('click', previewReport);
}

// Generate report
function generateReport() {
    const reportType = document.querySelector('.report-type-card.active').dataset.type;
    
    if (reportType === 'individual') {
        const studentId = document.getElementById('reportStudentSelect').value;
        if (!studentId) {
            showToast('Please select a student', 'error');
            return;
        }
        
        // Get student marks
        const allMarks = JSON.parse(localStorage.getItem('studentMarks')) || [];
        const studentMarks = allMarks.filter(m => m.studentId === studentId);
        
        if (studentMarks.length === 0) {
            showToast('No marks found for selected student', 'warning');
            return;
        }
        
        // Generate individual report
        showToast('Individual report generated successfully', 'success');
        
    } else {
        const classValue = document.getElementById('reportClassSelect').value;
        if (!classValue) {
            showToast('Please select a class', 'error');
            return;
        }
        
        // Generate class report
        showToast('Class report generated successfully', 'success');
    }
}

// Preview report
function previewReport() {
    // For demo purposes, show a sample report
    const reportContent = document.getElementById('reportPreviewContent');
    reportContent.innerHTML = generateSampleReport();
    
    // Show report modal
    document.getElementById('reportPreviewModal').classList.remove('hidden');
}

// Generate sample report HTML
function generateSampleReport() {
    return `
        <div class="bg-white p-8 rounded-lg shadow-sm">
            <div class="text-center mb-8">
                <h2 class="text-2xl font-bold text-gray-800">Academic Performance Report</h2>
                <p class="text-gray-600">St. Mary's High School</p>
                <p class="text-gray-600">Academic Year 2024-2025</p>
            </div>
            
            <div class="mb-8">
                <h3 class="text-xl font-semibold text-gray-800 mb-4">Student Information</h3>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <p class="text-sm text-gray-600">Student Name</p>
                        <p class="font-medium">Rohan Sharma</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-600">Class & Section</p>
                        <p class="font-medium">10A</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-600">Roll Number</p>
                        <p class="font-medium">101</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-600">Academic Year</p>
                        <p class="font-medium">2024-2025</p>
                    </div>
                </div>
            </div>
            
            <div class="mb-8">
                <h3 class="text-xl font-semibold text-gray-800 mb-4">Term 1 Performance</h3>
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Marks</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Remarks</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200">
                            <tr>
                                <td class="px-4 py-3 text-sm">Mathematics</td>
                                <td class="px-4 py-3 text-sm font-medium">95/100</td>
                                <td class="px-4 py-3 text-sm font-medium text-green-600">A</td>
                                <td class="px-4 py-3 text-sm">Excellent performance</td>
                            </tr>
                            <tr>
                                <td class="px-4 py-3 text-sm">Science</td>
                                <td class="px-4 py-3 text-sm font-medium">92/100</td>
                                <td class="px-4 py-3 text-sm font-medium text-green-600">A</td>
                                <td class="px-4 py-3 text-sm">Very good understanding</td>
                            </tr>
                            <tr>
                                <td class="px-4 py-3 text-sm">English</td>
                                <td class="px-4 py-3 text-sm font-medium">85/100</td>
                                <td class="px-4 py-3 text-sm font-medium text-blue-600">B</td>
                                <td class="px-4 py-3 text-sm">Good, can improve writing</td>
                            </tr>
                            <tr>
                                <td class="px-4 py-3 text-sm">Social Studies</td>
                                <td class="px-4 py-3 text-sm font-medium">91/100</td>
                                <td class="px-4 py-3 text-sm font-medium text-green-600">A</td>
                                <td class="px-4 py-3 text-sm">Excellent knowledge</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div class="bg-gray-50 p-6 rounded-lg mb-8">
                <h3 class="text-lg font-semibold text-gray-800 mb-3">Overall Summary</h3>
                <div class="grid grid-cols-3 gap-4">
                    <div class="text-center">
                        <p class="text-sm text-gray-600">Total Marks</p>
                        <p class="text-2xl font-bold text-gray-800">363/400</p>
                    </div>
                    <div class="text-center">
                        <p class="text-sm text-gray-600">Percentage</p>
                        <p class="text-2xl font-bold text-blue-600">90.8%</p>
                    </div>
                    <div class="text-center">
                        <p class="text-sm text-gray-600">Overall Grade</p>
                        <p class="text-2xl font-bold text-green-600">A</p>
                    </div>
                </div>
            </div>
            
            <div class="mb-8">
                <h3 class="text-lg font-semibold text-gray-800 mb-3">Teacher's Comments</h3>
                <div class="bg-yellow-50 border-l-4 border-yellow-500 p-4">
                    <p class="text-gray-700">Rohan has shown exceptional performance in Term 1. He consistently participates in class and demonstrates strong analytical skills. His mathematics and science scores are particularly impressive. With continued effort, he can maintain this excellent performance throughout the year.</p>
                    <p class="text-gray-600 text-sm mt-2">- Class Teacher</p>
                </div>
            </div>
            
            <div class="border-t border-gray-200 pt-6 text-center text-sm text-gray-500">
                <p>Report generated on ${new Date().toLocaleDateString()} | School Management System v2.0</p>
            </div>
        </div>
    `;
}

// Setup grade book
function setupGradeBook() {
    document.getElementById('loadGradeBookBtn')?.addEventListener('click', function() {
        const selectedClass = document.getElementById('gradeClassSelect').value;
        const selectedTerm = document.getElementById('gradeTermSelect').value;
        
        // In a real application, this would load data based on selected class and term
        showToast(`Grade book loaded for ${selectedClass} - ${formatTerm(selectedTerm)}`, 'success');
    });
}

// Setup modals
function setupModals() {
    // Close edit modal
    document.getElementById('closeEditModal')?.addEventListener('click', function() {
        document.getElementById('editMarksModal').classList.add('hidden');
    });
    
    // Cancel edit button
    document.addEventListener('click', function(e) {
        if (e.target.id === 'cancelEdit') {
            document.getElementById('editMarksModal').classList.add('hidden');
        }
    });
    
    // Close report modal
    document.getElementById('closeReportModal')?.addEventListener('click', function() {
        document.getElementById('reportPreviewModal').classList.add('hidden');
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', function(e) {
        const editModal = document.getElementById('editMarksModal');
        const reportModal = document.getElementById('reportPreviewModal');
        
        if (e.target === editModal) {
            editModal.classList.add('hidden');
        }
        
        if (e.target === reportModal) {
            reportModal.classList.add('hidden');
        }
    });
}

// Load sample data for demonstration
function loadSampleData() {
    // Check if sample data already exists
    if (localStorage.getItem('studentMarks')) {
        return;
    }
    
    const sampleMarks = [
        {
            id: 1,
            studentId: '101',
            studentName: 'Rohan Sharma (Class 10A, Roll No: 101)',
            term: 'term1',
            assessmentDate: '2024-06-15',
            teacherComments: 'Excellent performance in mathematics and science. Shows great analytical skills.',
            subjects: {
                'Mathematics': { marks: 95, grade: 'A', remarks: 'Exceptional problem-solving skills', performance: 'excellent' },
                'Science': { marks: 92, grade: 'A', remarks: 'Very good understanding of concepts', performance: 'excellent' },
                'English': { marks: 85, grade: 'B', remarks: 'Good writing skills, can improve vocabulary', performance: 'good' },
                'Social Studies': { marks: 91, grade: 'A', remarks: 'Excellent knowledge of historical events', performance: 'excellent' }
            },
            overall: { totalMarks: 363, percentage: 91, grade: 'A' }
        },
        {
            id: 2,
            studentId: '102',
            studentName: 'Priya Patel (Class 10A, Roll No: 102)',
            term: 'term1',
            assessmentDate: '2024-06-15',
            teacherComments: 'Consistent performer with good understanding of all subjects.',
            subjects: {
                'Mathematics': { marks: 82, grade: 'B', remarks: 'Good, needs practice in geometry', performance: 'good' },
                'Science': { marks: 90, grade: 'A', remarks: 'Excellent in practical experiments', performance: 'excellent' },
                'English': { marks: 93, grade: 'A', remarks: 'Excellent communication skills', performance: 'excellent' },
                'Social Studies': { marks: 80, grade: 'B', remarks: 'Good, can improve in geography', performance: 'good' }
            },
            overall: { totalMarks: 345, percentage: 86, grade: 'B' }
        }
    ];
    
    localStorage.setItem('studentMarks', JSON.stringify(sampleMarks));
}

// Show toast notification
function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toastContainer');
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    toast.innerHTML = `
        <div class="flex items-center">
            <i class="fas ${getToastIcon(type)} mr-3"></i>
            <span>${message}</span>
        </div>
        <button class="toast-close ml-4">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    toastContainer.appendChild(toast);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        toast.remove();
    }, 5000);
    
    // Close button
    toast.querySelector('.toast-close').addEventListener('click', function() {
        toast.remove();
    });
    
    return toast;
}

// Get icon for toast type
function getToastIcon(type) {
    switch(type) {
        case 'success': return 'fa-check-circle';
        case 'error': return 'fa-exclamation-circle';
        case 'warning': return 'fa-exclamation-triangle';
        default: return 'fa-info-circle';
    }
}
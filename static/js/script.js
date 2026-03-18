// Main JavaScript for Laptop Price Predictor

document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const predictionForm = document.getElementById('prediction-form');
    const batchForm = document.getElementById('batch-form');
    const resultContainer = document.getElementById('result-container');
    const errorContainer = document.getElementById('error-container');
    const loadingOverlay = document.getElementById('loading-overlay');
    const batchStatus = document.getElementById('batch-status');
    const fileInput = document.getElementById('csv-file');
    const fileLabel = document.querySelector('.file-label span');
    
    // Navigation
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            const target = this.getAttribute('href');
            document.querySelector(target).scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        });
    });

    // File input change handler
    if (fileInput) {
        fileInput.addEventListener('change', function() {
            if (this.files.length > 0) {
                fileLabel.textContent = this.files[0].name;
            } else {
                fileLabel.textContent = 'Choose CSV file or drag here';
            }
        });
    }

    // Single Prediction Form Submit
    if (predictionForm) {
        predictionForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Validate form
            if (!validateForm()) {
                return;
            }
            
            // Hide previous results/errors
            hideResults();
            
            // Show loading
            showLoading();
            
            try {
                // Collect form data
                const formData = new FormData(predictionForm);
                
                // Make prediction request
                const response = await fetch('/predict', {
                    method: 'POST',
                    body: formData
                });
                
                const data = await response.json();
                
                hideLoading();
                
                if (data.success) {
                    displayResult(data.prediction, data.input_data);
                } else {
                    displayError(data.error || 'Prediction failed. Please try again.');
                }
            } catch (error) {
                hideLoading();
                displayError('Network error. Please check your connection and try again.');
                console.error('Error:', error);
            }
        });
    }

    // Batch Prediction Form Submit
    if (batchForm) {
        batchForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const file = fileInput.files[0];
            if (!file) {
                displayError('Please select a CSV file');
                return;
            }
            
            // Validate file type
            if (!file.name.endsWith('.csv')) {
                displayError('Please upload a valid CSV file');
                return;
            }
            
            // Hide previous errors
            hideResults();
            
            // Show batch status
            batchStatus.classList.remove('hidden');
            
            try {
                const formData = new FormData();
                formData.append('file', file);
                
                const response = await fetch('/batch_predict', {
                    method: 'POST',
                    body: formData
                });
                
                if (response.ok) {
                    // Download the file
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'predictions.csv';
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                    
                    batchStatus.classList.add('hidden');
                    
                    // Show success message
                    showSuccess('Batch prediction completed! File downloaded successfully.');
                } else {
                    const data = await response.json();
                    batchStatus.classList.add('hidden');
                    displayError(data.error || 'Batch prediction failed');
                }
            } catch (error) {
                batchStatus.classList.add('hidden');
                displayError('Network error during batch prediction');
                console.error('Error:', error);
            }
        });
    }

    // Form validation
    function validateForm() {
        const selects = predictionForm.querySelectorAll('select');
        let isValid = true;
        let missingFields = [];
        
        selects.forEach(select => {
            if (!select.value || select.value === '') {
                isValid = false;
                missingFields.push(select.name);
                select.style.borderColor = 'var(--error-color)';
            } else {
                select.style.borderColor = 'var(--border-color)';
            }
        });
        
        if (!isValid) {
            displayError(`Please select values for: ${missingFields.join(', ')}`);
        }
        
        return isValid;
    }

    // Display prediction result
    function displayResult(prediction, inputData) {
        const predictedPriceElement = document.getElementById('predicted-price');
        const inputSummaryElement = document.getElementById('input-summary');
        
        // Format price with commas
        const formattedPrice = formatPrice(prediction);
        
        // Animate price counter
        animateValue(predictedPriceElement, 0, prediction, 1000);
        
        // Create input summary
        let summaryHTML = '<h5>Input Specifications:</h5><div class="summary-grid">';
        
        for (const [key, value] of Object.entries(inputData)) {
            summaryHTML += `
                <div class="summary-item">
                    <strong>${key}:</strong>
                    <span>${value}</span>
                </div>
            `;
        }
        
        summaryHTML += '</div>';
        inputSummaryElement.innerHTML = summaryHTML;
        
        // Show result container
        resultContainer.classList.remove('hidden');
        
        // Scroll to result
        resultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // Display error message
    function displayError(message) {
        const errorMessage = document.getElementById('error-message');
        errorMessage.textContent = message;
        errorContainer.classList.remove('hidden');
        
        // Auto hide after 5 seconds
        setTimeout(() => {
            errorContainer.classList.add('hidden');
        }, 5000);
    }

    // Show success message
    function showSuccess(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'alert alert-success';
        successDiv.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        `;
        
        const batchSection = document.getElementById('batch-predict');
        batchSection.insertBefore(successDiv, batchStatus);
        
        setTimeout(() => {
            successDiv.remove();
        }, 5000);
    }

    // Hide results and errors
    function hideResults() {
        resultContainer.classList.add('hidden');
        errorContainer.classList.add('hidden');
    }

    // Show loading overlay
    function showLoading() {
        loadingOverlay.classList.remove('hidden');
    }

    // Hide loading overlay
    function hideLoading() {
        loadingOverlay.classList.add('hidden');
    }

    // Format price with Indian numbering system
    function formatPrice(price) {
        return new Intl.NumberFormat('en-IN', {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2
        }).format(price);
    }

    // Animate number counting
    function animateValue(element, start, end, duration) {
        const range = end - start;
        const increment = range / (duration / 16); // 60fps
        let current = start;
        
        const timer = setInterval(() => {
            current += increment;
            if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
                current = end;
                clearInterval(timer);
            }
            element.textContent = formatPrice(current);
        }, 16);
    }

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add hover effect to form inputs
    const inputs = document.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.style.transform = 'translateY(-2px)';
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.style.transform = 'translateY(0)';
        });
    });

    // File drag and drop
    const fileUploadArea = document.querySelector('.file-label');
    if (fileUploadArea) {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            fileUploadArea.addEventListener(eventName, preventDefaults, false);
        });

        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        ['dragenter', 'dragover'].forEach(eventName => {
            fileUploadArea.addEventListener(eventName, highlight, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            fileUploadArea.addEventListener(eventName, unhighlight, false);
        });

        function highlight(e) {
            fileUploadArea.style.borderColor = 'var(--primary-color)';
            fileUploadArea.style.background = 'rgba(79, 70, 229, 0.1)';
        }

        function unhighlight(e) {
            fileUploadArea.style.borderColor = 'var(--border-color)';
            fileUploadArea.style.background = 'var(--bg-light)';
        }

        fileUploadArea.addEventListener('drop', handleDrop, false);

        function handleDrop(e) {
            const dt = e.dataTransfer;
            const files = dt.files;
            fileInput.files = files;
            
            if (files.length > 0) {
                fileLabel.textContent = files[0].name;
            }
        }
    }

    console.log('Laptop Price Predictor initialized successfully!');
});
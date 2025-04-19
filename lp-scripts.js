// back to top
let backToTopBtn = document.querySelector('.back-to-top');

window.onscroll = () => {
    if (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) {
        backToTopBtn.style.display = 'flex';
    } else {
        backToTopBtn.style.display = 'none';
    }
};

// top nav menu
let menuItems = document.getElementsByClassName('menu-item');

Array.from(menuItems).forEach((item) => {
    item.onclick = (e) => {
        let currMenu = document.querySelector('.menu-item.active');
        currMenu.classList.remove('active');
        item.classList.add('active');
    };
});

// on scroll animation
let scroll = window.requestAnimationFrame || function(callback) { window.setTimeout(callback, 1000/60); };

let elToShow = document.querySelectorAll('.play-on-scroll');

isElInViewPort = (el) => {
    let rect = el.getBoundingClientRect();
    return (
        (rect.top <= 0 && rect.bottom >= 0) ||
        (rect.bottom >= (window.innerHeight || document.documentElement.clientHeight) && 
        rect.top <= (window.innerHeight || document.documentElement.clientHeight)) ||
        (rect.top >= 0 && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight))
    );
};

loop = () => {
    elToShow.forEach((item) => {
        if (isElInViewPort(item)) {
            item.classList.add('start');
        } else {
            item.classList.remove('start');
        }
    });
    scroll(loop);
};

loop();

// mobile nav
let bottomNavItems = document.querySelectorAll('.mb-nav-item');
let bottomMove = document.querySelector('.mb-move-item');

bottomNavItems.forEach((item, index) => {
    item.onclick = (e) => {
        let crrItem = document.querySelector('.mb-nav-item.active');
        crrItem.classList.remove('active');
        item.classList.add('active');
        bottomMove.style.left = index * 25 + '%';
    };
});

// User data handling functions
function getUsers() {
    try {
        const users = localStorage.getItem('users');
        return users ? JSON.parse(users) : [];
    } catch (error) {
        console.error('Error reading from local storage:', error);
        return [];
    }
}

function saveUser(user) {
    try {
        const users = getUsers();
        // Check if user already exists
        if (users.some(u => u.email === user.email)) {
            return { success: false, message: 'Email already exists' };
        }
        
        users.push(user);
        localStorage.setItem('users', JSON.stringify(users));
        return { success: true };
    } catch (error) {
        console.error('Error saving to local storage:', error);
        return { success: false, message: 'Error saving user data' };
    }
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
}

function validatePassword(password) {
    return password.length >= 6;
}

function showError(elementId, message, isSuccess = false) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.style.color = isSuccess ? 'green' : 'red';
        element.style.display = message ? 'block' : 'none';
    }
}

// Modal logic
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('authModal');
    const closeBtns = document.querySelectorAll('.close-btn');
    const getStartedBtn = document.getElementById('getStartedBtn');
    const authContainer = document.getElementById('authContainer');
    const overlayBtn = document.getElementById('overlayBtn');
    
    // Open modal on 'Get Started' button click
    if (getStartedBtn) {
        getStartedBtn.addEventListener('click', function(e) {
            e.preventDefault();
            modal.classList.add('active');
            // Reset to sign-in form when opening
            authContainer.classList.remove('right-panel-active');
            // Clear any errors
            showError('loginError', '');
            showError('signupError', '');
        });
    }

    // Close modal
    closeBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            modal.classList.remove('active');
        });
    });

    // Close when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.classList.remove('active');
        }
    });

    // Form switching logic
    if (overlayBtn) {
        overlayBtn.addEventListener('click', function(e) {
            e.preventDefault();
            authContainer.classList.toggle('right-panel-active');
            // Clear errors when switching forms
            showError('loginError', '');
            showError('signupError', '');
        });
    }

    // Make overlay panel buttons work
    document.querySelectorAll('.overlay-panel button').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            authContainer.classList.toggle('right-panel-active');
            // Clear errors when switching forms
            showError('loginError', '');
            showError('signupError', '');
        });
    });
});

function loginUser() {
    try {
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value.trim();
        
        if (!email || !password) {
            showError('loginError', 'Please fill in all fields.');
            return false;
        }
        
        const users = getUsers();
        const user = users.find(u => u.email === email && u.password === password);
        
        if (!user) {
            showError('loginError', 'Invalid email or password.');
            return false;
        }
        
        // Save current user session
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        // Redirect to dashboard
        window.location.href = 'index.html';
        return false;
    } catch (error) {
        console.error('Login error:', error);
        showError('loginError', 'An error occurred during login.');
        return false;
    }
}

function signupUser() {
    try {
        const name = document.getElementById('signupName').value.trim();
        const email = document.getElementById('signupEmail').value.trim();
        const password = document.getElementById('signupPassword').value.trim();
        
        // Clear previous errors
        showError('signupError', '');
        
        if (!name || !email || !password) {
            showError('signupError', 'Please fill in all fields.');
            return false;
        }
        
        if (!validateEmail(email)) {
            showError('signupError', 'Please enter a valid email address.');
            return false;
        }
        
        if (!validatePassword(password)) {
            showError('signupError', 'Password must be at least 6 characters.');
            return false;
        }
        
        const result = saveUser({ name, email, password });
        
        if (!result.success) {
            showError('signupError', result.message || 'Error creating account.');
            return false;
        }
        
        // Switch to sign-in form after successful signup
        document.getElementById('authContainer').classList.remove('right-panel-active');
        showError('loginError', 'Account created successfully! Please sign in.', true);
        
        // Clear the signup form
        document.getElementById('signupName').value = '';
        document.getElementById('signupEmail').value = '';
        document.getElementById('signupPassword').value = '';
        
        return false;
    } catch (error) {
        console.error('Signup error:', error);
        showError('signupError', 'An error occurred during signup.');
        return false;
    }
}

// Modified checkLoggedIn function
function checkLoggedIn() {
    try {
        // Skip redirect if we're on main.html
        if (window.location.pathname.endsWith('main.html')) {
            return;
        }
        
        const user = localStorage.getItem('currentUser');
        if (user) {
            window.location.href = 'index.html';
        }
    } catch (error) {
        console.error('Error checking login status:', error);
    }
}

// Simplified goToMainPage function
function goToMainPage() {
    // Simply navigate to main.html without logging out
    window.location.href = 'main.html';
    return false; // Prevent default anchor behavior
}

// Call this when the page loads
checkLoggedIn();

// Forgot Password Functions
function showForgotPassword() {
    // Close the auth modal first
    document.getElementById('authModal').classList.remove('active');
    // Then show the forgot password modal
    document.getElementById('forgotPasswordModal').classList.add('active');
    return false;
}

function closeForgotPassword() {
    document.getElementById('forgotPasswordModal').classList.remove('active');
    return false;
}

function showLoginInstead() {
    closeForgotPassword();
    // Show the auth modal with login form
    document.getElementById('authContainer').classList.remove('right-panel-active');
    document.getElementById('authModal').classList.add('active');
    return false;
}

function resetPassword() {
    try {
        const email = document.getElementById('resetEmail').value.trim();
        const oldPassword = document.getElementById('oldPassword').value.trim();
        const newPassword = document.getElementById('newPassword').value.trim();
        const users = getUsers();
        
        // Clear previous errors
        showError('forgotPasswordError', '');
        
        // Validate inputs
        if (!email || !oldPassword || !newPassword) {
            showError('forgotPasswordError', 'Please fill in all fields');
            return false;
        }
        
        if (!validateEmail(email)) {
            showError('forgotPasswordError', 'Please enter a valid email');
            return false;
        }
        
        if (!validatePassword(newPassword)) {
            showError('forgotPasswordError', 'New password must be at least 6 characters');
            return false;
        }
        
        // Find user
        const userIndex = users.findIndex(u => u.email === email);
        if (userIndex === -1) {
            showError('forgotPasswordError', 'No account found with this email');
            return false;
        }
        
        // Verify old password
        if (users[userIndex].password !== oldPassword) {
            showError('forgotPasswordError', 'Old password is incorrect');
            return false;
        }
        
        // Update password
        users[userIndex].password = newPassword;
        localStorage.setItem('users', JSON.stringify(users));
        
        // Show success message
        showError('forgotPasswordError', 'Password updated successfully!', true);
        
        // Clear fields
        document.getElementById('resetEmail').value = '';
        document.getElementById('oldPassword').value = '';
        document.getElementById('newPassword').value = '';
        
        // Close modal after 2 seconds and show login
        setTimeout(() => {
            closeForgotPassword();
            showLoginInstead();
        }, 2000);
        
        return false;
    } catch (error) {
        console.error('Password reset error:', error);
        showError('forgotPasswordError', 'An error occurred. Please try again.');
        return false;
    }
}

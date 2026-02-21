// ============================================
// 🔐 RENVOX AUTH — Google Login + Excel Export
// ============================================

// ⚠️ APNA GOOGLE CLIENT ID YAHAN DALO
const GOOGLE_CLIENT_ID = "282865211924-l0854hkesp8saqdku5l3o2uv67ufa3mb.apps.googleusercontent.com";

// ----- Google Sign-In Callback -----
function handleGoogleLogin(response) {
    const token = response.credential;
    const payload = parseJwt(token);

    const user = {
        name: payload.name,
        email: payload.email,
        photo: payload.picture,
        time: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
    };

    // Save to localStorage
    saveUser(user);

    // Update navbar
    updateNavbar(user);

    // Close login modal
    closeLoginModal();
}

// ----- Decode JWT Token -----
function parseJwt(token) {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(decodeURIComponent(atob(base64).split('').map(c =>
        '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    ).join('')));
}

// ----- Save User to LocalStorage -----
function saveUser(user) {
    let users = JSON.parse(localStorage.getItem("renvox_users") || "[]");
    // Avoid duplicate entries (same email)
    const exists = users.find(u => u.email === user.email);
    if (!exists) {
        users.push(user);
        localStorage.setItem("renvox_users", JSON.stringify(users));
    }
    localStorage.setItem("renvox_current_user", JSON.stringify(user));
}

// ----- Update Navbar with User Info -----
function updateNavbar(user) {
    const navRight = document.querySelector(".nav-right");
    navRight.innerHTML = `
        <div class="user-info">
            <img src="${user.photo}" class="user-avatar" onerror="this.src='brand.png'">
            <span class="user-name">${user.name.split(' ')[0]}</span>
        </div>
        <a href="#" class="btn-download" onclick="showDownloadPopup(event)">⬇ Download App</a>
    `;
}

// ----- Logout -----
function logout() {
    localStorage.removeItem("renvox_current_user");
    location.reload();
}

// ----- Open/Close Login Modal -----
function openLoginModal() {
    document.getElementById("loginModal").style.display = "flex";
}

function closeLoginModal() {
    document.getElementById("loginModal").style.display = "none";
}

// ----- Show Download Popup -----
function showDownloadPopup(e) {
    if (e) e.preventDefault();
    document.getElementById("downloadPopup").style.display = "flex";
}

function closeDownloadPopup() {
    document.getElementById("downloadPopup").style.display = "none";
}

// ----- Export Users to Excel (SheetJS) -----
function exportToExcel() {
    const users = JSON.parse(localStorage.getItem("renvox_users") || "[]");
    if (users.length === 0) {
        alert("Abhi koi user data nahi hai!");
        return;
    }

    const wsData = [
        ["Name", "Email", "Login Time"],
        ...users.map(u => [u.name, u.email, u.time])
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Column widths
    ws['!cols'] = [{ wch: 25 }, { wch: 35 }, { wch: 25 }];

    XLSX.utils.book_append_sheet(wb, ws, "Renvox Users");
    XLSX.writeFile(wb, "Renvox_Users.xlsx");
}

// ----- On Page Load: Restore Session -----
window.addEventListener("DOMContentLoaded", () => {
    // Restore logged-in user
    const currentUser = JSON.parse(localStorage.getItem("renvox_current_user") || "null");
    if (currentUser) {
        updateNavbar(currentUser);
    } else {
        // Attach login button click
        const loginBtn = document.querySelector(".btn-login");
        if (loginBtn) loginBtn.addEventListener("click", (e) => {
            e.preventDefault();
            openLoginModal();
        });
    }

    // Init Google GIS
    if (typeof google !== "undefined") {
        google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleLogin,
            auto_select: false
        });
    }
});

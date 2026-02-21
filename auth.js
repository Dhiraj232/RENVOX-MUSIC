// ============================================
// 🔐 RENVOX AUTH — Google Login + Excel Export
// ============================================

const GOOGLE_CLIENT_ID = "282865211924-l0854hkesp8saqdku5l3o2uv67ufa3mb.apps.googleusercontent.com";

// ---- Google Sign-In Callback ----
function handleGoogleLogin(response) {
    const payload = parseJwt(response.credential);
    const user = {
        name: payload.name,
        email: payload.email,
        photo: payload.picture,
        time: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
    };
    saveUser(user);
    updateNavbar(user);
    closeLoginModal();
}

// ---- JWT Decoder ----
function parseJwt(token) {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(decodeURIComponent(
        atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
    ));
}

// ---- Save to localStorage ----
function saveUser(user) {
    let users = JSON.parse(localStorage.getItem("renvox_users") || "[]");
    if (!users.find(u => u.email === user.email)) users.push(user);
    localStorage.setItem("renvox_users", JSON.stringify(users));
    localStorage.setItem("renvox_current_user", JSON.stringify(user));
}

// ---- Update Navbar after login ----
function updateNavbar(user) {
    const navRight = document.querySelector(".nav-right");
    if (!navRight) return;
    navRight.innerHTML = `
        <div class="user-profile-wrap" onclick="toggleProfileMenu(event)" style="position:relative;cursor:pointer;">
            <div class="user-info">
                <img src="${user.photo}" class="user-avatar" onerror="this.src='brand.png'">
                <span class="user-name">${user.name.split(' ')[0]}</span>
                <i class="fa-solid fa-chevron-down" style="font-size:11px;color:#aaa;"></i>
            </div>
            <div id="profileMenu" style="
                display:none; position:absolute; top:52px; right:0;
                background:#1e1e1e; border:1px solid #333; border-radius:14px;
                padding:8px; min-width:200px; box-shadow:0 10px 40px rgba(0,0,0,0.7);
                z-index:99999;">
                <div style="padding:10px 14px; border-bottom:1px solid #2a2a2a; margin-bottom:6px;">
                    <div style="font-size:13px;font-weight:700;color:#fff;">${user.name}</div>
                    <div style="font-size:11px;color:#777;margin-top:3px;">${user.email}</div>
                </div>
                <div onclick="exportToExcel()" class="profile-menu-item" style="color:#ccc;">
                    📊 Export Users to Excel
                </div>
                <div onclick="logout()" class="profile-menu-item" style="color:#ff6b6b;">
                    <i class="fa-solid fa-right-from-bracket"></i> Logout
                </div>
            </div>
        </div>
        <a href="#" class="btn-download" onclick="showDownloadPopup(event)">⬇ Download App</a>
    `;
}

function toggleProfileMenu(e) {
    e.stopPropagation();
    const menu = document.getElementById("profileMenu");
    if (!menu) return;
    menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
}

// Close dropdown on outside click
document.addEventListener('click', () => {
    const menu = document.getElementById("profileMenu");
    if (menu) menu.style.display = 'none';
});

// ---- Logout ----
function logout() {
    localStorage.removeItem("renvox_current_user");
    location.reload();
}

// ---- Login Modal ----
function openLoginModal() {
    const modal = document.getElementById("loginModal");
    if (modal) modal.style.display = "flex";
}

function closeLoginModal() {
    const modal = document.getElementById("loginModal");
    if (modal) modal.style.display = "none";
}

// ---- Download Popup ----
function showDownloadPopup(e) {
    if (e) e.preventDefault();
    const popup = document.getElementById("downloadPopup");
    if (popup) popup.style.display = "flex";
}

function closeDownloadPopup() {
    const popup = document.getElementById("downloadPopup");
    if (popup) popup.style.display = "none";
}

// ---- Export Excel ----
function exportToExcel() {
    const users = JSON.parse(localStorage.getItem("renvox_users") || "[]");
    if (!users.length) { alert("Koi user data nahi hai abhi!"); return; }
    const wsData = [["Name", "Email", "Login Time"], ...users.map(u => [u.name, u.email, u.time])];
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    ws['!cols'] = [{ wch: 25 }, { wch: 35 }, { wch: 25 }];
    XLSX.utils.book_append_sheet(wb, ws, "Renvox Users");
    XLSX.writeFile(wb, "Renvox_Users.xlsx");
}

// ---- Init on page load ----
window.addEventListener("load", () => {
    // Restore session
    const saved = localStorage.getItem("renvox_current_user");
    if (saved) {
        try { updateNavbar(JSON.parse(saved)); } catch (e) { }
    }

    // Init Google GIS (ONE place only)
    const initGoogleGIS = () => {
        if (typeof google !== "undefined" && google.accounts) {
            google.accounts.id.initialize({
                client_id: GOOGLE_CLIENT_ID,
                callback: handleGoogleLogin,
                auto_select: false,
                cancel_on_tap_outside: true
            });
            const btnDiv = document.getElementById("googleSignInDiv");
            if (btnDiv) {
                google.accounts.id.renderButton(btnDiv, {
                    theme: "outline",
                    size: "large",
                    shape: "pill",
                    width: 260,
                    text: "signin_with"
                });
            }
        }
    };

    // Try immediately, then retry after 1.5s if GIS not loaded yet
    initGoogleGIS();
    setTimeout(initGoogleGIS, 1500);
});

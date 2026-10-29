/**
 * PawHaven — Authentication & Session Controller
 * Handles Demonstration Login, Session Checking, Remember Me,
 * and the complete Logout Workflow.
 */

const DEMO_CREDENTIALS = {
    email: "admin@pawhaven.demo",
    password: "PawHaven123!",
    userName: "Shelter Coordinator",
    role: "Lead Foster Manager"
};

const AuthSystem = {
    init() {
        this.bindEvents();
        this.checkAuthenticationState();
    },

    bindEvents() {
        // Form submission
        document.getElementById("loginForm")?.addEventListener("submit", (e) => this.handleLogin(e));

        // Toggle password view
        document.getElementById("togglePasswordBtn")?.addEventListener("click", () => this.togglePasswordVisibility());

        // Auto-fill demo creds
        document.getElementById("quickFillDemoCreds")?.addEventListener("click", () => {
            document.getElementById("loginEmail").value = DEMO_CREDENTIALS.email;
            document.getElementById("loginPassword").value = DEMO_CREDENTIALS.password;
        });

        // BIND BOTH LOGOUT BUTTONS (Sidebar & Topbar)
        document.getElementById("logoutBtn")?.addEventListener("click", () => this.handleLogout());
        document.getElementById("topbarLogoutBtn")?.addEventListener("click", () => this.handleLogout());
    },

    checkAuthenticationState() {
        const session = this.getActiveSession();
        const loginScreen = document.getElementById("loginScreen");
        const dashboardApp = document.getElementById("dashboardApp");

        if (session && session.isAuthenticated) {
            // User is logged in -> Show Dashboard
            loginScreen.classList.add("hidden");
            dashboardApp.classList.remove("hidden");
            document.getElementById("displayUserName").textContent = session.userName || DEMO_CREDENTIALS.userName;

            if (window.PawHavenApp && typeof window.PawHavenApp.initDashboard === "function") {
                window.PawHavenApp.initDashboard();
            }
        } else {
            // User is logged out -> Show Login Screen
            loginScreen.classList.remove("hidden");
            dashboardApp.classList.add("hidden");
        }
    },

    getActiveSession() {
        const s = sessionStorage.getItem(STORAGE_KEYS.AUTH_SESSION);
        if (s) { try { return JSON.parse(s); } catch (e) { } }
        const r = localStorage.getItem(STORAGE_KEYS.REMEMBERED_USER);
        if (r) { try { return JSON.parse(r); } catch (e) { } }
        return null;
    },

    handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById("loginEmail").value.trim().toLowerCase();
        const password = document.getElementById("loginPassword").value;
        const rememberMe = document.getElementById("rememberMeCheckbox").checked;
        const errorBanner = document.getElementById("loginErrorMessage");
        const submitBtn = document.getElementById("submitLoginBtn");
        const spinner = document.getElementById("loginSpinner");

        errorBanner.classList.add("hidden");
        errorBanner.style.display = "none";
        submitBtn.disabled = true;
        spinner.classList.remove("hidden");

        setTimeout(() => {
            submitBtn.disabled = false;
            spinner.classList.add("hidden");

            if (email === DEMO_CREDENTIALS.email.toLowerCase() && password === DEMO_CREDENTIALS.password) {
                const payload = {
                    isAuthenticated: true,
                    email: DEMO_CREDENTIALS.email,
                    userName: DEMO_CREDENTIALS.userName,
                    role: DEMO_CREDENTIALS.role,
                    loginTime: new Date().toISOString()
                };

                if (rememberMe) {
                    localStorage.setItem(STORAGE_KEYS.REMEMBERED_USER, JSON.stringify(payload));
                } else {
                    sessionStorage.setItem(STORAGE_KEYS.AUTH_SESSION, JSON.stringify(payload));
                }

                this.checkAuthenticationState();
            } else {
                errorBanner.classList.remove("hidden");
                errorBanner.style.display = "flex";
                document.getElementById("loginErrorText").textContent = "Incorrect credentials. Use admin@pawhaven.demo / PawHaven123!";
            }
        }, 400);
    },

    togglePasswordVisibility() {
        const input = document.getElementById("loginPassword");
        input.type = input.type === "password" ? "text" : "password";
    },

    /**
     * Complete Logout Workflow
     * 1. Clears demonstration authentication session.
     * 2. Clears "Remember Me" storage.
     * 3. Clears password input.
     * 4. Preserves all application records (animals, fosters, placements).
     * 5. Returns view to the Login Screen.
     */
    handleLogout() {
        sessionStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
        localStorage.removeItem(STORAGE_KEYS.REMEMBERED_USER);

        const passInput = document.getElementById("loginPassword");
        if (passInput) passInput.value = "";

        const errorBanner = document.getElementById("loginErrorMessage");
        if (errorBanner) {
            errorBanner.classList.add("hidden");
            errorBanner.style.display = "none";
        }

        this.checkAuthenticationState();
    }
};

document.addEventListener("DOMContentLoaded", () => AuthSystem.init());
/**
 * PawHaven — Main Application Logic & Feature Controller
 * Implements:
 * 1. Animal Profile Management
 * 2. Foster Profile Management
 * 3. Care Requirements Mapping
 * 4. Placement Requests & Approval
 * 5. Rule-Based 100-Point Matching Algorithm
 * 6. Placement Duration & Capacity Tracking
 * 7. Follow-up Timeline & Overdue Alerts
 */

window.PawHavenApp = {
    data: null,
    activeSection: "overview",
    selectedAnimalForMatch: null,

    initDashboard() {
        this.data = getApplicationData();
        this.bindNavigation();
        this.bindGlobalActions();
        this.bindModals();
        this.bindFilters();
        this.refreshAllViews();
    },

    bindNavigation() {
        document.querySelectorAll(".nav-item").forEach(btn => {
            btn.addEventListener("click", () => {
                const target = btn.getAttribute("data-section");
                this.navigateToSection(target);
                document.getElementById("sidebar").classList.remove("mobile-open");
            });
        });

        document.getElementById("sidebarCollapseBtn")?.addEventListener("click", () => {
            document.getElementById("sidebar").classList.toggle("collapsed");
        });

        document.getElementById("mobileMenuBtn")?.addEventListener("click", () => {
            document.getElementById("sidebar").classList.toggle("mobile-open");
        });

        document.querySelectorAll("[data-goto]").forEach(el => {
            el.addEventListener("click", () => {
                const dest = el.getAttribute("data-goto");
                this.navigateToSection(dest);
                if (el.getAttribute("data-filter") === "urgent") {
                    const uFilter = document.getElementById("animalUrgencyFilter");
                    if (uFilter) {
                        uFilter.value = "Urgent";
                        this.renderAnimals();
                    }
                }
            });
        });
    },

    navigateToSection(sectionId) {
        this.activeSection = sectionId;
        document.querySelectorAll(".nav-item").forEach(btn => {
            btn.classList.toggle("active", btn.getAttribute("data-section") === sectionId);
        });
        document.querySelectorAll(".view-panel").forEach(panel => {
            panel.classList.toggle("active", panel.id === `section-${sectionId}`);
        });

        const titles = {
            overview: "Dashboard Overview",
            animals: "Animal Profiles & Shelter Roster",
            fosters: "Foster Families & Capacity Directory",
            careRequirements: "Animal Care Requirements",
            requests: "Placement Requests",
            matching: "Foster Matching Algorithm",
            placements: "Placement Status Management",
            followups: "Follow-up Records & Check-ins"
        };

        document.getElementById("currentSectionTitle").textContent = titles[sectionId] || "PawHaven Management";
        if (sectionId === "matching") {
            this.populateMatchingDropdown();
        }
    },

    bindGlobalActions() {
        document.getElementById("resetDataBtn")?.addEventListener("click", () => {
            this.openConfirmModal("Reset Demo Data?", "This will restore the original demonstration records.", () => {
                this.data = resetApplicationData();
                this.refreshAllViews();
                this.showNotification("Demonstration records restored.");
            });
        });

        document.getElementById("btnQuickAddAnimal")?.addEventListener("click", () => this.openAnimalModal());
        document.getElementById("btnQuickAddFoster")?.addEventListener("click", () => this.openFosterModal());
        document.getElementById("btnQuickCreateRequest")?.addEventListener("click", () => this.openRequestModal());
        document.getElementById("btnQuickFindMatch")?.addEventListener("click", () => this.navigateToSection("matching"));
        document.getElementById("btnQuickRecordFollowup")?.addEventListener("click", () => this.openFollowupModal());

        document.getElementById("openAddAnimalModalBtn")?.addEventListener("click", () => this.openAnimalModal());
        document.getElementById("openAddFosterModalBtn")?.addEventListener("click", () => this.openFosterModal());
        document.getElementById("openCreateRequestModalBtn")?.addEventListener("click", () => this.openRequestModal());
        document.getElementById("openAddFollowupModalBtn")?.addEventListener("click", () => this.openFollowupModal());
    },

    bindFilters() {
        ["animalSearchInput", "animalSpeciesFilter", "animalUrgencyFilter", "animalStatusFilter"].forEach(id => {
            document.getElementById(id)?.addEventListener("input", () => this.renderAnimals());
        });
        ["fosterSearchInput", "fosterSpeciesFilter", "fosterAvailabilityFilter"].forEach(id => {
            document.getElementById(id)?.addEventListener("input", () => this.renderFosters());
        });
        document.getElementById("placementStatusFilter")?.addEventListener("change", () => this.renderPlacements());
        document.getElementById("requestStatusFilter")?.addEventListener("change", () => this.renderRequests());
        document.getElementById("followupStatusFilter")?.addEventListener("change", () => this.renderFollowups());

        document.getElementById("runMatchCalculationBtn")?.addEventListener("click", () => {
            const animalId = document.getElementById("matchAnimalSelect").value;
            if (animalId) this.runMatchingAlgorithm(animalId);
        });
    },

    refreshAllViews() {
        this.calculateDerivedData();
        this.renderOverviewStats();
        this.renderOverviewWidgets();
        this.renderAnimals();
        this.renderFosters();
        this.renderCareRequirements();
        this.renderRequests();
        this.renderPlacements();
        this.renderFollowups();
        this.populateMatchingDropdown();
    },

    showNotification(message, type = "success") {
        const container = document.getElementById("globalNotificationArea");
        const banner = document.createElement("div");
        banner.className = `alert-banner alert-${type}`;
        banner.innerHTML = `<span>${message}</span>`;
        container.appendChild(banner);
        setTimeout(() => banner.remove(), 4000);
    },

    calculateDerivedData() {
        const activePlacements = this.data.placements.filter(p => p.status === "Active" || p.status === "Ending Soon");

        // Calculate occupied capacity
        this.data.fosters.forEach(f => {
            const occupied = activePlacements.filter(p => p.fosterId === f.id).length;
            f.currentOccupied = occupied;
            f.remainingCapacity = Math.max(0, f.maxCapacity - occupied);

            if (f.availability !== "Temporarily Unavailable") {
                f.availabilityStatus = f.remainingCapacity === 0 ? "Full" : (f.remainingCapacity < f.maxCapacity ? "Limited Capacity" : "Available");
            } else {
                f.availabilityStatus = "Temporarily Unavailable";
            }
        });

        // Synchronize animal placement status
        this.data.animals.forEach(a => {
            const activePlacement = activePlacements.find(p => p.animalId === a.id);
            const pendingReq = this.data.placementRequests.find(r => r.animalId === a.id && r.status === "Pending");
            if (activePlacement) a.placementStatus = "In Foster Care";
            else if (pendingReq) a.placementStatus = "Placement Pending";
            else if (a.placementStatus === "In Foster Care") a.placementStatus = "Needs Foster";
        });

        // Placement remaining days calculation
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        this.data.placements.forEach(p => {
            if (p.status !== "Completed" && p.status !== "Cancelled") {
                const endDate = new Date(p.expectedEndDate);
                endDate.setHours(0, 0, 0, 0);
                const diffDays = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
                p.remainingDays = diffDays;
                if (diffDays <= 7 && diffDays >= 0) p.status = "Ending Soon";
                else if (diffDays > 7 && p.status === "Ending Soon") p.status = "Active";
            } else {
                p.remainingDays = 0;
            }
        });

        saveApplicationData(this.data);
    },

    renderOverviewStats() {
        const totalAnimals = this.data.animals.length;
        const totalFosterCap = this.data.fosters.reduce((s, f) => s + f.maxCapacity, 0);
        const occupiedCap = this.data.fosters.reduce((s, f) => s + (f.currentOccupied || 0), 0);
        const remainingCap = Math.max(0, totalFosterCap - occupiedCap);
        const activePlacements = this.data.placements.filter(p => p.status === "Active" || p.status === "Ending Soon").length;
        const pendingRequests = this.data.placementRequests.filter(r => r.status === "Pending").length;
        const urgentAnimals = this.data.animals.filter(a => a.urgency === "Urgent" && a.placementStatus === "Needs Foster").length;

        document.getElementById("statTotalAnimals").textContent = totalAnimals;
        document.getElementById("statAvailableCapacity").textContent = remainingCap;
        document.getElementById("statCapacitySub").textContent = `${remainingCap} of ${totalFosterCap} spaces free`;
        document.getElementById("statActivePlacements").textContent = activePlacements;
        document.getElementById("statPendingRequests").textContent = pendingRequests;
        document.getElementById("statUrgentCases").textContent = urgentAnimals;

        document.getElementById("navAnimalCount").textContent = totalAnimals;
        document.getElementById("navFosterCount").textContent = this.data.fosters.length;
        document.getElementById("navPendingReqCount").textContent = pendingRequests;
        document.getElementById("navActivePlacementCount").textContent = activePlacements;

        const today = new Date().toISOString().split("T")[0];
        const overdueCount = this.data.placements.filter(p => p.nextFollowupDate && p.nextFollowupDate < today && p.status !== "Completed").length;
        document.getElementById("navOverdueBadge")?.classList.toggle("hidden", overdueCount === 0);

        const utilPct = totalFosterCap > 0 ? Math.round((occupiedCap / totalFosterCap) * 100) : 0;
        document.getElementById("capacityUtilizationBadge").textContent = `${utilPct}% Utilized`;
        document.getElementById("capacityBarFill").style.width = `${utilPct}%`;
        document.getElementById("capTotalSpaces").textContent = `${totalFosterCap} Spaces`;
        document.getElementById("capOccupiedSpaces").textContent = `${occupiedCap} Occupied`;
        document.getElementById("capRemainingSpaces").textContent = `${remainingCap} Free`;
        document.getElementById("capActiveFamilies").textContent = `${this.data.fosters.filter(f => (f.currentOccupied || 0) > 0).length} Homes`;
    },

    renderOverviewWidgets() {
        const pending = this.data.placementRequests.filter(r => r.status === "Pending").slice(0, 4);
        document.getElementById("overviewRecentRequestsList").innerHTML = pending.length === 0 ? `<div class="empty-state py-4"><p>No pending requests.</p></div>` : pending.map(r => {
            const a = this.data.animals.find(an => an.id === r.animalId) || { name: "Unknown" };
            const f = this.data.fosters.find(fo => fo.id === r.fosterId) || { name: "Unknown" };
            return `<div class="compact-list-item"><div><strong>${a.name} &rarr; ${f.name}</strong><div class="compact-item-desc">${r.startDate} to ${r.endDate} • ${r.priority}</div></div><button class="btn btn-outline btn-sm" onclick="PawHavenApp.navigateToSection('requests')">Review</button></div>`;
        }).join("");

        const urgent = this.data.animals.filter(a => a.urgency === "Urgent" && a.placementStatus === "Needs Foster").slice(0, 4);
        document.getElementById("overviewUrgentAnimalsList").innerHTML = urgent.length === 0 ? `<div class="empty-state py-4"><p>No urgent cases.</p></div>` : urgent.map(a => `
      <div class="compact-list-item">
        <div class="compact-item-left"><img src="${a.photo}" class="compact-avatar" alt="${a.name}"><div><strong>${a.name} (${a.species})</strong><div class="compact-item-desc">${a.healthCondition}</div></div></div>
        <button class="btn btn-primary btn-sm" onclick="PawHavenApp.initiateMatchingFor('${a.id}')">Match</button>
      </div>
    `).join("");

        const endingSoon = this.data.placements.filter(p => p.status === "Ending Soon" || (p.remainingDays <= 7 && p.status === "Active"));
        document.getElementById("overviewEndingPlacementsList").innerHTML = endingSoon.length === 0 ? `<div class="empty-state py-4"><p>No placements ending in 7 days.</p></div>` : endingSoon.map(p => {
            const a = this.data.animals.find(an => an.id === p.animalId) || { name: "Unknown" };
            return `<div class="compact-list-item"><div><strong>${a.name}</strong><div class="compact-item-desc text-terracotta">${p.remainingDays} days remaining</div></div><button class="btn btn-outline btn-sm" onclick="PawHavenApp.openPlacementActionModal('${p.id}')">Extend</button></div>`;
        }).join("");

        const today = new Date().toISOString().split("T")[0];
        const followups = this.data.placements.filter(p => p.nextFollowupDate && p.status !== "Completed").slice(0, 4);
        document.getElementById("overviewFollowupRemindersList").innerHTML = followups.length === 0 ? `<div class="empty-state py-4"><p>No scheduled follow-ups.</p></div>` : followups.map(p => {
            const a = this.data.animals.find(an => an.id === p.animalId) || { name: "Unknown" };
            const isOverdue = p.nextFollowupDate < today;
            return `<div class="compact-list-item"><div><strong>${a.name}</strong><div class="compact-item-desc ${isOverdue ? "text-terracotta" : ""}">${isOverdue ? "⚠️ Overdue: " : "Scheduled: "}${p.nextFollowupDate}</div></div><button class="btn btn-outline btn-sm" onclick="PawHavenApp.openFollowupModal('${p.id}')">Check-in</button></div>`;
        }).join("");
    },

    renderAnimals() {
        const grid = document.getElementById("animalCardsGrid");
        const query = document.getElementById("animalSearchInput").value.toLowerCase();
        const species = document.getElementById("animalSpeciesFilter").value;
        const urgency = document.getElementById("animalUrgencyFilter").value;
        const status = document.getElementById("animalStatusFilter").value;

        const filtered = this.data.animals.filter(a => {
            const matchQ = a.name.toLowerCase().includes(query) || a.breed.toLowerCase().includes(query);
            const matchS = species === "all" || a.species === species;
            const matchU = urgency === "all" || a.urgency === urgency;
            const matchSt = status === "all" || a.placementStatus === status;
            return matchQ && matchS && matchU && matchSt;
        });

        grid.innerHTML = filtered.length === 0 ? `<div class="empty-state" style="grid-column: 1 / -1;"><h3>No Animals Found</h3></div>` : filtered.map(a => `
      <div class="profile-card">
        <div class="card-image-wrap">
          <img src="${a.photo}" alt="${a.name}">
          <div class="card-badge-top-left"><span class="pill-badge ${a.urgency === "Urgent" ? "pill-urgent" : "pill-standard"}">${a.urgency}</span></div>
          <div class="card-badge-top-right"><span class="pill-badge" style="background:rgba(0,0,0,0.6); color:#fff;">${a.placementStatus}</span></div>
        </div>
        <div class="card-content">
          <div class="card-header-row"><h3 class="card-title">${a.name}</h3><span class="tag-chip">${a.id}</span></div>
          <div class="card-meta-line">${a.breed} • ${a.age} • ${a.gender}</div>
          <div class="tag-list"><span class="tag-chip">${a.species}</span><span class="tag-chip">${a.vaccinationStatus}</span></div>
          <div class="card-detail-box"><div><strong>Health:</strong> ${a.healthCondition}</div><div><strong>Care:</strong> ${a.specialCareReq}</div></div>
          <div class="card-footer-actions">
            <button class="btn btn-outline btn-sm" onclick="PawHavenApp.openAnimalModal('${a.id}')">Edit</button>
            ${a.placementStatus === "Needs Foster" ? `<button class="btn btn-primary btn-sm" style="margin-left:auto;" onclick="PawHavenApp.initiateMatchingFor('${a.id}')">Match</button>` : ""}
          </div>
        </div>
      </div>
    `).join("");
    },

    openAnimalModal(editId = null) {
        const modal = document.getElementById("animalModal");
        const form = document.getElementById("animalForm");
        form.reset();
        if (editId) {
            const a = this.data.animals.find(an => an.id === editId);
            if (!a) return;
            document.getElementById("animalModalTitle").textContent = `Edit Profile: ${a.name}`;
            document.getElementById("formAnimalId").value = a.id;
            document.getElementById("formAnimalName").value = a.name;
            document.getElementById("formAnimalSpecies").value = a.species;
            document.getElementById("formAnimalBreed").value = a.breed;
            document.getElementById("formAnimalAge").value = a.age;
            document.getElementById("formAnimalGender").value = a.gender;
            document.getElementById("formAnimalUrgency").value = a.urgency;
            document.getElementById("formAnimalVaccination").value = a.vaccinationStatus;
            document.getElementById("formAnimalDuration").value = a.requiredDuration;
            document.getElementById("formAnimalHealth").value = a.healthCondition;
            document.getElementById("formAnimalTemperament").value = a.temperament;
            document.getElementById("formAnimalCareReq").value = a.specialCareReq;
            document.getElementById("formAnimalPhoto").value = a.photo;
        } else {
            document.getElementById("animalModalTitle").textContent = "Add Animal Profile";
            document.getElementById("formAnimalId").value = "";
        }
        modal.classList.remove("hidden");
    },

    handleSaveAnimal(e) {
        e.preventDefault();
        const id = document.getElementById("formAnimalId").value;
        const name = document.getElementById("formAnimalName").value.trim();
        const species = document.getElementById("formAnimalSpecies").value;
        const breed = document.getElementById("formAnimalBreed").value.trim() || "Mixed Breed";
        const age = document.getElementById("formAnimalAge").value.trim() || "Young";
        const gender = document.getElementById("formAnimalGender").value;
        const urgency = document.getElementById("formAnimalUrgency").value;
        const vaccination = document.getElementById("formAnimalVaccination").value;
        const duration = document.getElementById("formAnimalDuration").value;
        const health = document.getElementById("formAnimalHealth").value.trim() || "Healthy";
        const temperament = document.getElementById("formAnimalTemperament").value.trim() || "Friendly";
        const careReq = document.getElementById("formAnimalCareReq").value.trim() || "Standard daily care.";
        let photo = document.getElementById("formAnimalPhoto").value.trim() || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80";

        if (id) {
            const existing = this.data.animals.find(a => a.id === id);
            if (existing) Object.assign(existing, { name, species, breed, age, gender, urgency, vaccinationStatus: vaccination, requiredDuration: duration, healthCondition: health, temperament, specialCareReq: careReq, photo });
        } else {
            const newId = `A-${100 + this.data.animals.length + 1}`;
            this.data.animals.push({ id: newId, name, species, breed, age, gender, urgency, placementStatus: "Needs Foster", vaccinationStatus: vaccination, requiredDuration: duration, healthCondition: health, temperament, specialCareReq: careReq, photo });
        }
        this.closeModal("animalModal");
        this.refreshAllViews();
        this.showNotification(`Animal profile saved.`);
    },

    renderFosters() {
        const grid = document.getElementById("fosterCardsGrid");
        const query = document.getElementById("fosterSearchInput").value.toLowerCase();
        const species = document.getElementById("fosterSpeciesFilter").value;
        const avail = document.getElementById("fosterAvailabilityFilter").value;

        const filtered = this.data.fosters.filter(f => {
            const matchQ = f.name.toLowerCase().includes(query) || f.contact.toLowerCase().includes(query);
            const matchS = species === "all" || f.preferredSpecies === species;
            const matchA = avail === "all" || f.availabilityStatus === avail;
            return matchQ && matchS && matchA;
        });

        grid.innerHTML = filtered.length === 0 ? `<div class="empty-state" style="grid-column: 1 / -1;"><h3>No Foster Families</h3></div>` : filtered.map(f => `
      <div class="profile-card">
        <div class="card-content">
          <div class="card-header-row"><h3 class="card-title">${f.name}</h3><span class="pill-badge pill-${f.availabilityStatus === 'Full' ? 'full' : 'available'}">${f.availabilityStatus}</span></div>
          <div class="card-meta-line">${f.contact}</div>
          <div class="capacity-bar-container" style="height:8px; margin:0.5rem 0;"><div class="capacity-bar-fill" style="width: ${(f.currentOccupied / f.maxCapacity) * 100}%;"></div></div>
          <div style="display:flex; justify-content:space-between; font-size:0.75rem; margin-bottom:0.75rem;"><span><strong>${f.currentOccupied} of ${f.maxCapacity}</strong> occupied</span><span class="text-forest"><strong>${f.remainingCapacity}</strong> free</span></div>
          <div class="tag-list"><span class="tag-chip">Prefers: ${f.preferredSpecies}</span><span class="tag-chip">${f.homeEnvironment}</span></div>
          <div class="card-detail-box"><div><strong>Special Care:</strong> ${f.specialCareCapable ? "✅ Equipped" : "❌ Standard Only"}</div></div>
          <div class="card-footer-actions">
            <button class="btn btn-outline btn-sm" onclick="PawHavenApp.openFosterModal('${f.id}')">Edit</button>
            <button class="btn btn-primary btn-sm" style="margin-left:auto;" onclick="PawHavenApp.openRequestModal(null, '${f.id}')" ${f.remainingCapacity === 0 ? "disabled" : ""}>Place Animal</button>
          </div>
        </div>
      </div>
    `).join("");
    },

    openFosterModal(editId = null) {
        const modal = document.getElementById("fosterModal");
        document.getElementById("fosterForm").reset();
        if (editId) {
            const f = this.data.fosters.find(fo => fo.id === editId);
            if (!f) return;
            document.getElementById("fosterModalTitle").textContent = `Edit Foster: ${f.name}`;
            document.getElementById("formFosterId").value = f.id;
            document.getElementById("formFosterName").value = f.name;
            document.getElementById("formFosterContact").value = f.contact;
            document.getElementById("formFosterSpecies").value = f.preferredSpecies;
            document.getElementById("formFosterCapacity").value = f.maxCapacity;
            document.getElementById("formFosterHome").value = f.homeEnvironment;
            document.getElementById("formFosterExperience").value = f.experience;
            document.getElementById("formFosterAvailability").value = f.availability;
            document.getElementById("formFosterDuration").value = f.preferredDuration;
            document.getElementById("formFosterSpecialCare").checked = f.specialCareCapable;
        } else {
            document.getElementById("fosterModalTitle").textContent = "Add Foster Family";
            document.getElementById("formFosterId").value = "";
        }
        modal.classList.remove("hidden");
    },

    handleSaveFoster(e) {
        e.preventDefault();
        const id = document.getElementById("formFosterId").value;
        const name = document.getElementById("formFosterName").value.trim();
        const contact = document.getElementById("formFosterContact").value.trim();
        const preferredSpecies = document.getElementById("formFosterSpecies").value;
        const maxCapacity = parseInt(document.getElementById("formFosterCapacity").value, 10) || 1;
        const homeEnvironment = document.getElementById("formFosterHome").value;
        const experience = document.getElementById("formFosterExperience").value;
        const availability = document.getElementById("formFosterAvailability").value;
        const preferredDuration = document.getElementById("formFosterDuration").value;
        const specialCareCapable = document.getElementById("formFosterSpecialCare").checked;

        if (id) {
            const existing = this.data.fosters.find(f => f.id === id);
            if (existing) Object.assign(existing, { name, contact, preferredSpecies, maxCapacity, homeEnvironment, experience, availability, preferredDuration, specialCareCapable });
        } else {
            const newId = `F-${200 + this.data.fosters.length + 1}`;
            this.data.fosters.push({ id: newId, name, contact, preferredSpecies, maxCapacity, homeEnvironment, experience, availability, preferredDuration, specialCareCapable });
        }
        this.closeModal("fosterModal");
        this.refreshAllViews();
        this.showNotification("Foster profile saved.");
    },

    renderCareRequirements() {
        document.getElementById("careRequirementsGrid").innerHTML = this.data.animals.map(a => `
      <div class="panel-card">
        <div class="panel-header mb-2"><div><h3 class="panel-title">${a.name} (${a.species})</h3><span class="text-muted" style="font-size:0.75rem;">ID: ${a.id} • ${a.breed}</span></div><span class="pill-badge pill-standard">${a.urgency}</span></div>
        <div class="card-detail-box mb-2"><div><strong>🩺 Care Protocol:</strong></div><p class="text-muted">${a.specialCareReq}</p></div>
        <div style="font-size:0.8rem; line-height:1.6; margin-bottom:1rem;"><div><strong>Vaccination:</strong> ${a.vaccinationStatus}</div><div><strong>Duration:</strong> ${a.requiredDuration}</div></div>
        <button class="btn btn-outline btn-sm btn-block" onclick="PawHavenApp.openAnimalModal('${a.id}')">Edit Care Protocol</button>
      </div>
    `).join("");
    },

    renderRequests() {
        const tbody = document.getElementById("placementRequestsTableBody");
        const filter = document.getElementById("requestStatusFilter").value;
        const filtered = this.data.placementRequests.filter(r => filter === "all" || r.status === filter);

        tbody.innerHTML = filtered.length === 0 ? `<tr><td colspan="8" class="text-center">No requests found.</td></tr>` : filtered.map(r => {
            const a = this.data.animals.find(an => an.id === r.animalId) || { name: "Unknown" };
            const f = this.data.fosters.find(fo => fo.id === r.fosterId) || { name: "Unknown" };
            return `
        <tr>
          <td><strong>${r.id}</strong></td><td>${a.name}</td><td>${f.name}</td><td>${r.startDate} &rarr; ${r.endDate}</td>
          <td><span class="tag-chip">${r.priority}</span></td><td>${r.careRequirements || "Standard"}</td>
          <td><span class="nav-badge ${r.status === 'Approved' ? 'badge-success' : 'badge-warning'}">${r.status}</span></td>
          <td class="text-right">
            ${r.status === "Pending" ? `
              <button class="btn btn-primary btn-sm" onclick="PawHavenApp.approvePlacementRequest('${r.id}')">Approve</button>
              <button class="btn btn-outline btn-sm" onclick="PawHavenApp.rejectPlacementRequest('${r.id}')">Reject</button>
            ` : `<span class="text-muted" style="font-size:0.75rem;">Processed</span>`}
          </td>
        </tr>
      `;
        }).join("");
    },

    openRequestModal(prefillAnimalId = null, prefillFosterId = null) {
        const modal = document.getElementById("requestModal");
        const aSelect = document.getElementById("formRequestAnimal");
        const fSelect = document.getElementById("formRequestFoster");

        aSelect.innerHTML = this.data.animals.map(a => `<option value="${a.id}" ${a.id === prefillAnimalId ? "selected" : ""}>${a.name} (${a.species} - ${a.placementStatus})</option>`).join("");
        fSelect.innerHTML = this.data.fosters.map(f => `<option value="${f.id}" ${f.id === prefillFosterId ? "selected" : ""} ${f.remainingCapacity === 0 ? "disabled" : ""}>${f.name} (${f.remainingCapacity} spaces free)</option>`).join("");

        const today = new Date().toISOString().split("T")[0];
        const end = new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
        document.getElementById("formRequestStart").value = today;
        document.getElementById("formRequestEnd").value = end;
        modal.classList.remove("hidden");
    },

    handleCreatePlacementRequest(e) {
        e.preventDefault();
        const animalId = document.getElementById("formRequestAnimal").value;
        const fosterId = document.getElementById("formRequestFoster").value;
        const startDate = document.getElementById("formRequestStart").value;
        const endDate = document.getElementById("formRequestEnd").value;
        const priority = document.getElementById("formRequestPriority").value;
        const notes = document.getElementById("formRequestNotes").value.trim();

        if (new Date(endDate) <= new Date(startDate)) { alert("End date must be after start date."); return; }
        const foster = this.data.fosters.find(f => f.id === fosterId);
        if (!foster || foster.remainingCapacity <= 0) { alert("Selected foster family has no free spaces."); return; }

        const newId = `REQ-${300 + this.data.placementRequests.length + 1}`;
        this.data.placementRequests.unshift({ id: newId, animalId, fosterId, startDate, endDate, careRequirements: notes || "Standard care", creationDate: new Date().toISOString().split("T")[0], priority, status: "Pending" });
        this.closeModal("requestModal");
        this.refreshAllViews();
        this.showNotification(`Request ${newId} created.`);
    },

    approvePlacementRequest(reqId) {
        const req = this.data.placementRequests.find(r => r.id === reqId);
        if (!req) return;
        const animal = this.data.animals.find(a => a.id === req.animalId);
        const foster = this.data.fosters.find(f => f.id === req.fosterId);

        if (foster.remainingCapacity <= 0) { alert("Cannot approve: foster family at full capacity."); return; }

        this.openConfirmModal("Approve Placement", `Place ${animal.name} with ${foster.name}?`, () => {
            req.status = "Approved";
            const newPlacementId = `PLC-${400 + this.data.placements.length + 1}`;
            this.data.placements.unshift({ id: newPlacementId, requestId: req.id, animalId: req.animalId, fosterId: req.fosterId, startDate: req.startDate, expectedEndDate: req.endDate, actualEndDate: null, status: "Active", nextFollowupDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0] });
            this.refreshAllViews();
            this.showNotification(`Placement approved! ${animal.name} placed.`);
        });
    },

    rejectPlacementRequest(reqId) {
        const req = this.data.placementRequests.find(r => r.id === reqId);
        if (!req) return;
        this.openConfirmModal("Reject Request", `Reject request ${req.id}?`, () => {
            req.status = "Rejected";
            this.refreshAllViews();
            this.showNotification(`Request rejected.`, "danger");
        });
    },

    populateMatchingDropdown() {
        const select = document.getElementById("matchAnimalSelect");
        if (!select) return;
        select.innerHTML = this.data.animals.map(a => `<option value="${a.id}">${a.name} — ${a.species} (${a.placementStatus})</option>`).join("");
        if (this.selectedAnimalForMatch) {
            select.value = this.selectedAnimalForMatch;
            this.runMatchingAlgorithm(this.selectedAnimalForMatch);
            this.selectedAnimalForMatch = null;
        }
    },

    initiateMatchingFor(animalId) {
        this.selectedAnimalForMatch = animalId;
        this.navigateToSection("matching");
    },

    runMatchingAlgorithm(animalId) {
        const animal = this.data.animals.find(a => a.id === animalId);
        const container = document.getElementById("matchingResultsContainer");
        const subjectCard = document.getElementById("matchingSubjectCard");
        if (!animal) return;

        subjectCard.classList.remove("hidden");
        subjectCard.innerHTML = `<div class="panel-card" style="border-left:4px solid var(--color-primary);"><div style="display:flex; justify-content:space-between;"><div><h3>Evaluating Matches for: ${animal.name}</h3><p class="text-muted">${animal.species} • ${animal.breed} • Age: ${animal.age}</p><p style="font-size:0.85rem; margin-top:0.4rem;"><strong>Special Care:</strong> ${animal.specialCareReq}</p></div><span class="pill-badge pill-urgent">${animal.placementStatus}</span></div></div>`;

        const evaluated = this.data.fosters.map(f => {
            let score = 0; const strengths = []; const warnings = []; let isEligible = true;
            if (f.remainingCapacity > 0) { score += 30; strengths.push(`Capacity: ${f.remainingCapacity} spaces free`); }
            else { isEligible = false; warnings.push("Capacity: 0 spaces free (Home Full)"); }

            if (f.preferredSpecies === "Both" || f.preferredSpecies === animal.species) { score += 25; strengths.push(`Species Match: Welcomes ${animal.species}`); }
            else { isEligible = false; warnings.push(`Species Incompatible: Only fosters ${f.preferredSpecies}`); }

            const specialCareNeeded = animal.specialCareReq.toLowerCase().includes("daily") || animal.healthCondition.toLowerCase().includes("recovery");
            if (specialCareNeeded) {
                if (f.specialCareCapable) { score += 20; strengths.push("Special Care Certified"); }
                else { isEligible = false; warnings.push("Medical Care Mismatch: Not certified for recovery care"); }
            } else { score += 20; strengths.push("Standard Care Match"); }

            if (f.experience.includes("Advanced")) score += 15; else if (f.experience.includes("Intermediate")) score += 10; else score += 5;
            if (f.preferredDuration === "Any Duration" || f.preferredDuration === animal.requiredDuration) score += 10; else score += 4;
            if (f.availability === "Temporarily Unavailable") { isEligible = false; warnings.push("Foster Temporarily Unavailable"); }

            return { foster: f, score, isEligible, strengths, warnings };
        });

        evaluated.sort((a, b) => (b.isEligible - a.isEligible) || (b.score - a.score));

        container.innerHTML = evaluated.map(m => `
      <div class="match-card ${m.isEligible ? (m.score >= 80 ? 'highly-suitable' : '') : 'ineligible'}">
        <div class="match-score-badge"><span class="match-score-number">${m.score}</span><span class="match-score-label">Points</span></div>
        <div class="match-info-col">
          <div style="display:flex; justify-content:space-between; align-items:center;"><h3>${m.foster.name}</h3><span class="pill-badge ${m.isEligible ? 'pill-available' : 'pill-full'}">${m.isEligible ? 'Eligible Match' : 'Ineligible'}</span></div>
          <p class="text-muted" style="font-size:0.8rem; margin:0.3rem 0;">${m.foster.homeEnvironment} • Free: ${m.foster.remainingCapacity} of ${m.foster.maxCapacity}</p>
          <div style="font-size:0.78rem;"><strong style="color:var(--color-primary)">Strengths:</strong> ${m.strengths.join(" • ")}</div>
          ${m.warnings.length > 0 ? `<div style="font-size:0.78rem; color:var(--color-danger)"><strong>Warnings:</strong> ${m.warnings.join(" • ")}</div>` : ""}
        </div>
        <div><button class="btn btn-primary btn-sm" onclick="PawHavenApp.openRequestModal('${animal.id}', '${m.foster.id}')" ${!m.isEligible ? "disabled" : ""}>Create Request</button></div>
      </div>
    `).join("");
    },

    renderPlacements() {
        const tbody = document.getElementById("placementsTableBody");
        const filter = document.getElementById("placementStatusFilter").value;
        const filtered = this.data.placements.filter(p => filter === "all" || (filter === "Ending Soon" ? p.remainingDays <= 7 : p.status === filter));

        tbody.innerHTML = filtered.length === 0 ? `<tr><td colspan="8" class="text-center">No placements found.</td></tr>` : filtered.map(p => {
            const a = this.data.animals.find(an => an.id === p.animalId) || { name: "Unknown" };
            const f = this.data.fosters.find(fo => fo.id === p.fosterId) || { name: "Unknown" };
            return `
        <tr>
          <td><strong>${p.id}</strong></td><td>${a.name}</td><td>${f.name}</td><td>${p.startDate} &rarr; ${p.expectedEndDate}</td>
          <td>${p.status === 'Completed' ? 'Finished' : `<span class="${p.remainingDays <= 7 ? 'text-terracotta' : ''}"><strong>${p.remainingDays}</strong> days</span>`}</td>
          <td><span class="nav-badge ${p.status === 'Active' ? 'badge-success' : 'badge-warning'}">${p.status}</span></td>
          <td>${p.nextFollowupDate || "—"}</td>
          <td class="text-right">
            ${p.status !== "Completed" ? `
              <button class="btn btn-outline btn-sm" onclick="PawHavenApp.openPlacementActionModal('${p.id}')">Extend</button>
              <button class="btn btn-outline btn-sm" onclick="PawHavenApp.completePlacement('${p.id}')">Complete</button>
            ` : `<span class="text-muted" style="font-size:0.75rem;">Archived</span>`}
          </td>
        </tr>
      `;
        }).join("");
    },

    openPlacementActionModal(placementId) {
        const p = this.data.placements.find(item => item.id === placementId);
        if (!p) return;
        const newEnd = prompt(`Extend End Date for ${p.id} (Current: ${p.expectedEndDate}):`, p.expectedEndDate);
        if (newEnd && newEnd !== p.expectedEndDate) {
            p.expectedEndDate = newEnd;
            p.status = "Extended";
            this.refreshAllViews();
            this.showNotification(`Placement extended to ${newEnd}.`);
        }
    },

    completePlacement(placementId) {
        const p = this.data.placements.find(item => item.id === placementId);
        if (!p) return;
        this.openConfirmModal("Complete Placement", `Mark placement ${p.id} as finished? This releases 1 foster space.`, () => {
            p.status = "Completed";
            p.actualEndDate = new Date().toISOString().split("T")[0];
            const a = this.data.animals.find(an => an.id === p.animalId);
            if (a) a.placementStatus = "Placement Completed";
            this.refreshAllViews();
            this.showNotification(`Placement completed and capacity released.`);
        });
    },

    renderFollowups() {
        const container = document.getElementById("followupsTimeline");
        const filter = document.getElementById("followupStatusFilter").value;
        const today = new Date().toISOString().split("T")[0];

        const filtered = this.data.followups.filter(f => {
            if (filter === "Completed") return f.followupDate <= today;
            if (filter === "Upcoming") return f.nextScheduledDate >= today;
            if (filter === "Overdue") return f.nextScheduledDate && f.nextScheduledDate < today;
            return true;
        });

        container.innerHTML = filtered.length === 0 ? `<div class="empty-state"><p>No follow-ups.</p></div>` : filtered.map(f => {
            const p = this.data.placements.find(pl => pl.id === f.placementId);
            const a = p ? this.data.animals.find(an => an.id === p.animalId) : { name: "Animal" };
            return `
        <div class="timeline-card">
          <div class="timeline-header"><div><span class="viva-badge">${f.id}</span><strong>${a.name}</strong> • ${f.method}</div><span class="timeline-date-badge">${f.followupDate}</span></div>
          <div class="card-detail-box mb-2"><div><strong>Health:</strong> ${f.healthObservations}</div><div><strong>Behavior:</strong> ${f.behaviorObservations}</div></div>
          <div style="display:flex; justify-content:space-between; font-size:0.8rem;"><span><strong>Steps:</strong> ${f.nextSteps || "None"}</span><span class="text-forest"><strong>Next Scheduled:</strong> ${f.nextScheduledDate || "None"}</span></div>
        </div>
      `;
        }).join("");
    },

    openFollowupModal(prefillPlacementId = null) {
        const modal = document.getElementById("followupModal");
        const select = document.getElementById("formFollowupPlacement");
        const active = this.data.placements.filter(p => p.status !== "Completed" && p.status !== "Cancelled");
        select.innerHTML = active.map(p => {
            const a = this.data.animals.find(an => an.id === p.animalId) || { name: "Animal" };
            return `<option value="${p.id}" ${p.id === prefillPlacementId ? "selected" : ""}>${p.id} — ${a.name}</option>`;
        }).join("");
        document.getElementById("formFollowupDate").value = new Date().toISOString().split("T")[0];
        document.getElementById("formFollowupNextDate").value = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
        modal.classList.remove("hidden");
    },

    handleSaveFollowup(e) {
        e.preventDefault();
        const placementId = document.getElementById("formFollowupPlacement").value;
        const date = document.getElementById("formFollowupDate").value;
        const method = document.getElementById("formFollowupMethod").value;
        const health = document.getElementById("formFollowupHealth").value.trim();
        const behavior = document.getElementById("formFollowupBehavior").value.trim();
        const feedback = document.getElementById("formFollowupFeedback").value.trim();
        const nextDate = document.getElementById("formFollowupNextDate").value;
        const steps = document.getElementById("formFollowupSteps").value.trim();

        const newId = `FLW-${500 + this.data.followups.length + 1}`;
        this.data.followups.unshift({ id: newId, placementId, followupDate: date, method, healthObservations: health, behaviorObservations: behavior, caregiverFeedback: feedback, nextSteps: steps, nextScheduledDate: nextDate || null });
        const p = this.data.placements.find(pl => pl.id === placementId);
        if (p && nextDate) p.nextFollowupDate = nextDate;
        this.closeModal("followupModal");
        this.refreshAllViews();
        this.showNotification(`Follow-up ${newId} logged.`);
    },

    bindModals() {
        document.querySelectorAll("[data-close-modal]").forEach(btn => btn.addEventListener("click", () => this.closeModal(btn.getAttribute("data-close-modal"))));
        document.getElementById("animalForm")?.addEventListener("submit", (e) => this.handleSaveAnimal(e));
        document.getElementById("fosterForm")?.addEventListener("submit", (e) => this.handleSaveFoster(e));
        document.getElementById("requestForm")?.addEventListener("submit", (e) => this.handleCreatePlacementRequest(e));
        document.getElementById("followupForm")?.addEventListener("submit", (e) => this.handleSaveFollowup(e));
    },

    closeModal(id) { document.getElementById(id)?.classList.add("hidden"); },

    openConfirmModal(title, msg, onConfirm) {
        const modal = document.getElementById("confirmModal");
        document.getElementById("confirmModalTitle").textContent = title;
        document.getElementById("confirmModalMessage").textContent = msg;
        const btn = document.getElementById("confirmModalActionBtn");
        const handler = () => {
            btn.removeEventListener("click", handler);
            modal.classList.add("hidden");
            if (onConfirm) onConfirm();
        };
        btn.addEventListener("click", handler);
        modal.classList.remove("hidden");
    }
};
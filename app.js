/**
 * PawHaven — Initial Demonstration Sample Dataset
 * First-Year Capstone Project
 * 
 * Provides 8+ animals, 6+ foster families, 5+ placement requests,
 * 4+ placements, and 5+ follow-up records.
 */

const DEFAULT_SAMPLE_DATA = {
    animals: [
        { id: "A-101", name: "Barnaby", species: "Dog", breed: "Golden Retriever Mix", age: "2 years", gender: "Male", urgency: "Urgent", placementStatus: "Needs Foster", healthCondition: "Post-surgery recovery (front leg fracture)", vaccinationStatus: "Up-to-Date", temperament: "Gentle, calm, quiet", specialCareReq: "Quiet home with minimal stairs; twice-daily medications.", requiredDuration: "Medium-term (3-6 weeks)", photo: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=600&q=80" },
        { id: "A-102", name: "Luna & Milo", species: "Cat", breed: "Domestic Shorthair Pair", age: "4 months", gender: "Female & Male", urgency: "Moderate", placementStatus: "In Foster Care", healthCondition: "Healthy kittens completing boosters", vaccinationStatus: "Pending Booster", temperament: "Playful, energetic, bonded", specialCareReq: "Must stay together; regular feeding schedule.", requiredDuration: "Short-term (1-2 weeks)", photo: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80" },
        { id: "A-103", name: "Roscoe", species: "Dog", breed: "German Shepherd Mix", age: "4 years", gender: "Male", urgency: "Urgent", placementStatus: "Needs Foster", healthCondition: "Managed skin allergies", vaccinationStatus: "Up-to-Date", temperament: "Intelligent, high energy", specialCareReq: "Experienced handler; no cats; fenced yard required.", requiredDuration: "Long-term (2+ months)", photo: "https://images.unsplash.com/photo-1589941013453-ec89f33b5455?auto=format&fit=crop&w=600&q=80" },
        { id: "A-104", name: "Cleo", species: "Cat", breed: "Calico", age: "7 years", gender: "Female", urgency: "Standard", placementStatus: "In Foster Care", healthCondition: "Mild senior arthritis", vaccinationStatus: "Up-to-Date", temperament: "Independent lap cat", specialCareReq: "Single-pet low-stress environment.", requiredDuration: "Medium-term (3-6 weeks)", photo: "https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=600&q=80" },
        { id: "A-105", name: "Daisy", species: "Dog", breed: "Beagle", age: "1 year", gender: "Female", urgency: "Moderate", placementStatus: "Placement Pending", healthCondition: "Spayed, full health clearance", vaccinationStatus: "Up-to-Date", temperament: "Curious, great with children", specialCareReq: "Daily exercise, leash containment outdoors.", requiredDuration: "Medium-term (3-6 weeks)", photo: "https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&w=600&q=80" },
        { id: "A-106", name: "Jasper", species: "Cat", breed: "Russian Blue Mix", age: "3 years", gender: "Male", urgency: "Standard", placementStatus: "Placement Completed", healthCondition: "Fully recovered", vaccinationStatus: "Up-to-Date", temperament: "Quiet and loyal", specialCareReq: "Quiet room for initial 3 days.", requiredDuration: "Short-term (1-2 weeks)", photo: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=600&q=80" },
        { id: "A-107", name: "Zeus", species: "Dog", breed: "Pit Bull Terrier Mix", age: "5 years", gender: "Male", urgency: "Urgent", placementStatus: "Needs Foster", healthCondition: "Weekly medicated bath for dermatitis", vaccinationStatus: "Up-to-Date", temperament: "Extremely affectionate gentle giant", specialCareReq: "Weekly medicated bath; sensitive skin diet.", requiredDuration: "Long-term (2+ months)", photo: "https://images.unsplash.com/photo-1561037404-61cd46aa615b?auto=format&fit=crop&w=600&q=80" },
        { id: "A-108", name: "Pippin", species: "Rabbit", breed: "Holland Lop", age: "1.5 years", gender: "Male", urgency: "Standard", placementStatus: "Needs Foster", healthCondition: "Neutered, healthy", vaccinationStatus: "Up-to-Date", temperament: "Curious, litterbox trained", specialCareReq: "Indoor pen, bunny-proof wires, daily timothy hay.", requiredDuration: "Short-term (1-2 weeks)", photo: "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&w=600&q=80" }
    ],
    fosters: [
        { id: "F-201", name: "Elena & Marcus Vance", contact: "555-0142 | vance@example.com", preferredSpecies: "Both", maxCapacity: 3, homeEnvironment: "House with Fenced Yard", experience: "Advanced / Medical Care", availability: "Available", preferredDuration: "Medium-term (3-6 weeks)", specialCareCapable: true },
        { id: "F-202", name: "Clara Thornton", contact: "555-0189 | clara.t@example.com", preferredSpecies: "Cat", maxCapacity: 2, homeEnvironment: "Apartment (Pet-Friendly)", experience: "Intermediate / Multi-Pet", availability: "Available", preferredDuration: "Short-term (1-2 weeks)", specialCareCapable: false },
        { id: "F-203", name: "David & Priya Patel", contact: "555-0123 | patel.foster@example.com", preferredSpecies: "Dog", maxCapacity: 2, homeEnvironment: "Suburban Home with Garden", experience: "Advanced / Medical Care", availability: "Limited Capacity", preferredDuration: "Long-term (2+ months)", specialCareCapable: true },
        { id: "F-204", name: "Sophia Martinez", contact: "555-0167 | smartinez@example.com", preferredSpecies: "Cat", maxCapacity: 2, homeEnvironment: "Apartment (Pet-Friendly)", experience: "Beginner / Gentle Companions", availability: "Full", preferredDuration: "Medium-term (3-6 weeks)", specialCareCapable: false },
        { id: "F-205", name: "Robert & Linda Sterling", contact: "555-0118 | sterling@example.com", preferredSpecies: "Dog", maxCapacity: 2, homeEnvironment: "Rural Acreage", experience: "Advanced / Medical Care", availability: "Available", preferredDuration: "Any Duration", specialCareCapable: true },
        { id: "F-206", name: "Hannah Lee", contact: "555-0199 | hannah.lee@example.com", preferredSpecies: "Both", maxCapacity: 1, homeEnvironment: "Apartment (Pet-Friendly)", experience: "Beginner / Gentle Companions", availability: "Temporarily Unavailable", preferredDuration: "Short-term (1-2 weeks)", specialCareCapable: false }
    ],
    placementRequests: [
        { id: "REQ-301", animalId: "A-105", fosterId: "F-201", startDate: "2026-11-01", endDate: "2026-11-25", careRequirements: "Routine beagle containment check", creationDate: "2026-10-25", priority: "Moderate", status: "Pending" },
        { id: "REQ-302", animalId: "A-101", fosterId: "F-205", startDate: "2026-11-02", endDate: "2026-12-05", careRequirements: "Quiet ground floor room for leg recovery", creationDate: "2026-10-26", priority: "Urgent", status: "Pending" },
        { id: "REQ-303", animalId: "A-102", fosterId: "F-202", startDate: "2026-10-15", endDate: "2026-11-02", careRequirements: "Kitten duo socialization", creationDate: "2026-10-12", priority: "Standard", status: "Approved" },
        { id: "REQ-304", animalId: "A-104", fosterId: "F-204", startDate: "2026-10-10", endDate: "2026-10-31", careRequirements: "Low-stress senior cat environment", creationDate: "2026-10-08", priority: "Standard", status: "Approved" },
        { id: "REQ-305", animalId: "A-103", fosterId: "F-202", startDate: "2026-10-18", endDate: "2026-11-30", careRequirements: "Handler experience required", creationDate: "2026-10-16", priority: "Urgent", status: "Rejected" }
    ],
    placements: [
        { id: "PLC-401", requestId: "REQ-303", animalId: "A-102", fosterId: "F-202", startDate: "2026-10-15", expectedEndDate: "2026-11-02", actualEndDate: null, status: "Active", nextFollowupDate: "2026-10-29" },
        { id: "PLC-402", requestId: "REQ-304", animalId: "A-104", fosterId: "F-204", startDate: "2026-10-10", expectedEndDate: "2026-10-31", actualEndDate: null, status: "Ending Soon", nextFollowupDate: "2026-10-26" },
        { id: "PLC-403", requestId: null, animalId: "A-106", fosterId: "F-201", startDate: "2026-09-10", expectedEndDate: "2026-10-05", actualEndDate: "2026-10-04", status: "Completed", nextFollowupDate: null },
        { id: "PLC-404", requestId: null, animalId: "A-107", fosterId: "F-203", startDate: "2026-10-01", expectedEndDate: "2026-12-15", actualEndDate: null, status: "Active", nextFollowupDate: "2026-11-05" }
    ],
    followups: [
        { id: "FLW-501", placementId: "PLC-401", followupDate: "2026-10-22", method: "Home Visit", healthObservations: "Kittens gaining weight normally (+120g)", behaviorObservations: "Confident and playful", caregiverFeedback: "Eating well, using scratching posts", nextSteps: "Booster vaccination due Nov 1", nextScheduledDate: "2026-10-29" },
        { id: "FLW-502", placementId: "PLC-402", followupDate: "2026-10-17", method: "Phone Call", healthObservations: "Taking joint chew without fuss", behaviorObservations: "Calm, sleeping near window", caregiverFeedback: "Foster inquired about adoption paperwork", nextSteps: "Send adoption-from-foster form", nextScheduledDate: "2026-10-26" },
        { id: "FLW-503", placementId: "PLC-404", followupDate: "2026-10-14", method: "Shelter Clinic Visit", healthObservations: "Medicated baths improving Zeus skin condition", behaviorObservations: "Friendly with veterinary staff", caregiverFeedback: "Loves car rides, calm around dogs", nextSteps: "Ear drops for 7 days", nextScheduledDate: "2026-11-05" },
        { id: "FLW-504", placementId: "PLC-403", followupDate: "2026-09-25", method: "Home Visit", healthObservations: "Jasper fully cleared", behaviorObservations: "Integrated into home", caregiverFeedback: "Adopting permanently", nextSteps: "Finalize adoption", nextScheduledDate: null },
        { id: "FLW-505", placementId: "PLC-401", followupDate: "2026-10-16", method: "Video Call", healthObservations: "Initial 24-hour check", behaviorObservations: "Settling well", caregiverFeedback: "All supplies received", nextSteps: "In-person visit next week", nextScheduledDate: "2026-10-22" }
    ]
};

const STORAGE_KEYS = {
    APP_DATA: "pawhaven_data_records_v1",
    AUTH_SESSION: "pawhaven_demo_session",
    REMEMBERED_USER: "pawhaven_remembered_user"
};

function getApplicationData() {
    const stored = localStorage.getItem(STORAGE_KEYS.APP_DATA);
    if (!stored) {
        saveApplicationData(DEFAULT_SAMPLE_DATA);
        return JSON.parse(JSON.stringify(DEFAULT_SAMPLE_DATA));
    }
    try {
        return JSON.parse(stored);
    } catch (e) {
        saveApplicationData(DEFAULT_SAMPLE_DATA);
        return JSON.parse(JSON.stringify(DEFAULT_SAMPLE_DATA));
    }
}

function saveApplicationData(data) {
    localStorage.setItem(STORAGE_KEYS.APP_DATA, JSON.stringify(data));
}

function resetApplicationData() {
    localStorage.setItem(STORAGE_KEYS.APP_DATA, JSON.stringify(DEFAULT_SAMPLE_DATA));
    return JSON.parse(JSON.stringify(DEFAULT_SAMPLE_DATA));
}
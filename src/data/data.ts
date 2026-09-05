export interface Stat {
    label: string;
    value: string;
}

export interface Feature {
    id: string;
    title: string;
    description: string;
}

export interface Project {
    status: string;
    title: string;
    description: string;
    imageUrl: string;
    href: string;
}

export interface TeamMember {
    name: string;
    role: string;
    imageUrl: string;
}

export interface TeamCategory {
    id: string;
    categoryCode: string;
    title: string;
    members: TeamMember[];
}

export type InventoryStatus = "IN_STOCK" | "DEPLOYED" | "MAINTENANCE" | "LOW_STOCK" | "DEPLETED";

export interface InventoryItem {
    id: string;
    sku: string;
    name: string;
    category: string;
    quantity: number;
    minThreshold: number;
    status: InventoryStatus;
    location: string;
    assignedProject?: string | null;
    notes?: string | null;
    updatedAt: string;
}

export interface AdminTab {
    id: "updates" | "inventory";
    label: string;
    code: string;
    description: string;
}

export const siteData = {
    header: {
        title: "PEGASUS UAV Club · IIST",
        logoUrl: "/pegasus-logo.png",
        navLinks: ["About", "Projects", "Team", "Mentors", "Updates", "Request Inventory", "Join Us"],
    },
    hero: {
        eyebrow: "Indian Institute of Space Science and Technology",
        headline: "Autonomy at Altitude",
        description: "Pegasus builds unmanned aerial systems that navigate, decide, and land safely — without GPS, without a pilot, without compromise.",
        primaryCta: { label: "Explore Projects", href: "#projects" },
        secondaryCta: { label: "Join the Club", href: "#join" },
        videoUrl: "https://boqqnkwveliwzpxqzaha.supabase.co/storage/v1/object/public/media/hero/98082368-b44a-496a-9b86-0947871c0cb6-14623-685293399.mp4",
        stats: [
            { label: "Founded", value: "2026" },
            { label: "Active builds", value: "2" },
            { label: "Base", value: "IIST, Trivandrum" },
        ] as Stat[],
    },
    mission: {
        sectionNumber: "01 -- Mission",
        headline: "Innovate. Build. Fly.",
        subtitle: "Department of Space · Govt. of India",
        institutionTag: "Asia's First Space University · Thiruvananthapuram",
        divisionCode: "IIST // AERO_RESEARCH_DIV",
        visionTitle: "Vision",
        visionText: "To revolutionize the application of autonomous aerial systems across research, governance, and space technology, establishing IIST as a global leader in multidisciplinary UAV development.",
        aboutTitle: "About IIST",
        aboutText: "The Indian Institute of Space Science and Technology (IIST), located in Thiruvananthapuram, is Asia’s first space university. Functioning directly under the Department of Space, Government of India, IIST was established to serve as a specialized incubator for the nation's space program. By maintaining deep, integrated ties with the Indian Space Research Organisation (ISRO), the institute fosters an unparalleled ecosystem where rigorous academic theory meets the high-stakes, applied engineering demands of advanced aerospace, avionics, and deep-tech innovation.",
        campusImageUrl: "/iist-campus.jpg",
        campusTag: "IIST VALIAMALA CAMPUS // 8.6277°N, 77.0379°E",
        campusCaption: "Aerial Perspective · Indian Institute of Space Science and Technology",
        features: [
            { id: "NAV", title: "GPS-Denied Navigation", description: "Visual-inertial odometry and SLAM pipelines that keep a drone oriented when satellite signal drops out entirely." },
            { id: "SAFE", title: "Failsafe Systems", description: "Emergency landing logic that reads terrain in real time and chooses a safe touchdown zone autonomously." },
            { id: "PERC", title: "Onboard Perception", description: "Edge inference on Jetson hardware for object detection, tracking, and marker-based localization." },
            { id: "NET", title: "Alumni & Industry Network", description: "Direct lines into India's space and defense sector through IIST's own graduating cohorts." },
        ] as Feature[],
    },
    projects: {
        sectionNumber: "02 -- Research",
        headline: "Active Projects",
        description: "Click into a project for full documentation, the build team, mentors, and collaborators.",
        subheadline: "Click into a project for full documentation, the build team, mentors, and collaborators.",
        list: [
            {
                status: "active",
                title: "Flying Wings: National Defence Hackathon",
                description: "Engineering a GPS-denied quadcopter capable of autonomous waypoint navigation for national defence applications.",
                imageUrl: "https://boqqnkwveliwzpxqzaha.supabase.co/storage/v1/object/public/media/projects/c8656d5f-3683-4582-b989-b9d5cfecbdaa-c.jpeg",
                href: "/projects/flying-wings",
            },
            {
                status: "active",
                title: "Agricultural Drone Collaboration (Georgia University)",
                description: "Developing an autonomous heavy-lift UAV platform engineered for precision rod insertion in soft paddy fields.",
                imageUrl: "https://boqqnkwveliwzpxqzaha.supabase.co/storage/v1/object/public/media/projects/a7c187f3-2386-4472-9d01-d7133d5711b0-Gemini_Generated_Image_qxm18tqxm18tqxm1.png",
                href: "/projects/agricultural-drone",
            },
        ] as Project[],
    },
    team: {
        sectionNumber: "04 — Roster",
        headline: "The Team",
        subheadline: "Engineering & Leadership Cadre",
        categories: [] as TeamCategory[],
    },
    mentors: {
        sectionNumber: "05 — Council",
        headline: "Distinguished Mentors",
        subheadline: "Academic & Aerospace Advisory",
        description: "Honouring the eminent scientists, professors, and researchers whose pioneering leadership propels Pegasus UAV forward.",
    },
    updates: {
        sectionNumber: "06 — Transmissions",
        headline: "Mission Dispatches",
        subheadline: "Club Bulletins & Operational Logs",
        description: "Real-time updates, semester blueprints, and technical milestone logs from the Pegasus UAV development cadence.",
    },
    flightDivider: {
        flightCorridor: "CORRIDOR 02 // PAYLOAD TRANSIT",
        status: "AUTONOMOUS TRANSIT ACTIVE",
        origin: "IIST BASE",
        destination: "FIELD ZONE B",
    },
    inventoryRequest: {
        sectionNumber: "07 — Requisition",
        headline: "Request Hardware",
        subheadline: "Club Inventory & Avionics Checkout",
        description: "Official equipment checkout portal for IIST students, researchers, and project builders. Requisition avionics, sensors, flight controllers, and propulsion hardware managed by Pegasus UAV Club.",
        protocols: [
            "Hardware checkouts authorized for academic builds, competitions, and research.",
            "Standard loan cycle: 14 academic days with renewal option on review.",
            "Items must be inspected and returned in nominal working condition.",
            "Valid IIST student roll code required for equipment collection at Avionics Bay.",
        ],
        labLocation: "Avionics & Autonomous Systems Lab, Dept. of Aerospace Engineering, IIST Valiamala",
        contactEmail: "pegasusuavclubiist@gmail.com",
    },
    recruitment: {
        sectionNumber: "08 — Recruitment",
        headline: "Join Pegasus",
        subheadline: "Autonomy & Aerospace Cadre",
        description: "We're recruiting across every subsystem — flight controls, perception, structures, and outreach.",
        contactEmail: "pegasusuavclubiist@gmail.com",
        location: "Indian Institute of Space Science and Technology, Thiruvananthapuram",
        subsystems: [
            "Flight Controls & Autonomy",
            "Computer Vision & Perception",
            "Structures, Aerodynamics & Airframe",
            "Avionics & Embedded Systems",
            "Ground Control Station & Telemetry",
            "Media, Sponsorship & Outreach",
        ],
    },
    admin: {
        code: "APEX // CONTROL-01",
        title: "Flight Operations & Lab Control",
        subtitle: "Authorized Administration Matrix",
        callsign: "PEGASUS-HQ",
        auth: {
            title: "Security Clearance Required",
            subtitle: "Enter Cadre Flight Director Credentials to access terminal",
            emailPlaceholder: "pegasusuavclubiist@gmail.com",
            passwordPlaceholder: "••••••••",
            authorizedEmail: "pegasusuavclubiist@gmail.com",
            submitLabel: "AUTHENTICATE CONSOLE",
            securityNotice: "RESTRICTED ACCESS // IIST UAV LAB CADRE ONLY",
        },
        tabs: [
            {
                id: "updates" as const,
                label: "Mission Updates",
                code: "01",
                description: "Publish dispatches, operational bulletins, and technical logs to public feed",
            },
            {
                id: "inventory" as const,
                label: "Club Inventory",
                code: "02",
                description: "Track, audit, and dispatch avionics, sensors, propulsion & battery stocks",
            },
        ] as AdminTab[],
        categories: [
            "Flight Controllers",
            "Sensors & Perception",
            "Propulsion & ESCs",
            "Avionics & Telemetry",
            "Power Systems & LiPo",
            "Airframes & Payloads",
            "Lab Tools & GCS",
        ],
        statuses: [
            { id: "IN_STOCK" as InventoryStatus, label: "In Stock", color: "emerald" },
            { id: "DEPLOYED" as InventoryStatus, label: "Deployed in Build", color: "sky" },
            { id: "LOW_STOCK" as InventoryStatus, label: "Low Stock Alert", color: "amber" },
            { id: "MAINTENANCE" as InventoryStatus, label: "Maintenance / Bench", color: "purple" },
            { id: "DEPLETED" as InventoryStatus, label: "Depleted / Zero", color: "red" },
        ],
        seedInventory: [
            {
                id: "inv-001",
                sku: "PEG-FC-001",
                name: "Holybro Pixhawk 6C Autopilot + M9N GPS",
                category: "Flight Controllers",
                quantity: 3,
                minThreshold: 2,
                status: "IN_STOCK" as InventoryStatus,
                location: "Avionics Rack A1",
                assignedProject: "Flying Wings",
                notes: "Pre-flashed ArduPilot 4.5.1 with EKF3 enabled",
                updatedAt: "2026-08-20T10:00:00Z",
            },
            {
                id: "inv-002",
                sku: "PEG-CMP-002",
                name: "NVIDIA Jetson Orin Nano Developer Kit (8GB)",
                category: "Sensors & Perception",
                quantity: 2,
                minThreshold: 1,
                status: "DEPLOYED" as InventoryStatus,
                location: "Perception Lab Bay 4",
                assignedProject: "Agricultural Drone",
                notes: "JetPack 6.0 with TensorRT pipeline configured for visual odometry",
                updatedAt: "2026-08-24T12:30:00Z",
            },
            {
                id: "inv-003",
                sku: "PEG-MOT-003",
                name: "T-Motor F40 PRO IV 1950KV Brushless Motors",
                category: "Propulsion & ESCs",
                quantity: 16,
                minThreshold: 8,
                status: "IN_STOCK" as InventoryStatus,
                location: "Propulsion Bin 03",
                assignedProject: null,
                notes: "Brand new spares for test quadcopters",
                updatedAt: "2026-08-15T09:15:00Z",
            },
            {
                id: "inv-004",
                sku: "PEG-CAM-004",
                name: "Intel RealSense D435i Depth Camera",
                category: "Sensors & Perception",
                quantity: 1,
                minThreshold: 2,
                status: "LOW_STOCK" as InventoryStatus,
                location: "Optical Rig B",
                assignedProject: "Flying Wings",
                notes: "Mounted with vibration dampener on defense drone prototype",
                updatedAt: "2026-08-28T14:45:00Z",
            },
            {
                id: "inv-005",
                sku: "PEG-BAT-005",
                name: "Tattu R-Line 4S 1550mAh 120C LiPo Pack",
                category: "Power Systems & LiPo",
                quantity: 8,
                minThreshold: 4,
                status: "IN_STOCK" as InventoryStatus,
                location: "Battery Bunker Alpha",
                assignedProject: null,
                notes: "Storage charge maintained at 3.85V per cell",
                updatedAt: "2026-09-01T16:00:00Z",
            },
            {
                id: "inv-006",
                sku: "PEG-RAD-006",
                name: "RadioMaster TX16S MKII ELRS 2.4GHz Transmitter",
                category: "Avionics & Telemetry",
                quantity: 2,
                minThreshold: 1,
                status: "IN_STOCK" as InventoryStatus,
                location: "Ground Station Box 1",
                assignedProject: null,
                notes: "EdgeTX 2.9, telemetry scripts loaded",
                updatedAt: "2026-08-10T11:20:00Z",
            },
            {
                id: "inv-007",
                sku: "PEG-GPS-007",
                name: "Holybro H-RTK F9P High Precision GNSS Rover",
                category: "Avionics & Telemetry",
                quantity: 2,
                minThreshold: 1,
                status: "IN_STOCK" as InventoryStatus,
                location: "RTK Mast Rig",
                assignedProject: "Agricultural Drone",
                notes: "Centimeter accuracy base-rover link tested",
                updatedAt: "2026-08-22T15:10:00Z",
            },
            {
                id: "inv-008",
                sku: "PEG-ESC-008",
                name: "Holybro Tekko32 F4 4-in-1 50A ESC",
                category: "Propulsion & ESCs",
                quantity: 4,
                minThreshold: 2,
                status: "IN_STOCK" as InventoryStatus,
                location: "Propulsion Bin 01",
                assignedProject: null,
                notes: "DShot600 telemetry enabled",
                updatedAt: "2026-08-18T13:40:00Z",
            },
            {
                id: "inv-009",
                sku: "PEG-LDR-009",
                name: "Benewake TFmini Plus LiDAR Rangefinder (12m)",
                category: "Sensors & Perception",
                quantity: 3,
                minThreshold: 2,
                status: "IN_STOCK" as InventoryStatus,
                location: "Optical Rig A",
                assignedProject: "Flying Wings",
                notes: "Downward-facing altitude hold sensor",
                updatedAt: "2026-08-26T17:00:00Z",
            },
            {
                id: "inv-010",
                sku: "PEG-FRM-010",
                name: "Tarot 650 Iron Man Quadcopter Carbon Frame",
                category: "Airframes & Payloads",
                quantity: 1,
                minThreshold: 1,
                status: "DEPLOYED" as InventoryStatus,
                location: "Assembly Rig 01",
                assignedProject: "Agricultural Drone",
                notes: "Custom CNC payload bay mounted for rod insertion",
                updatedAt: "2026-08-30T18:30:00Z",
            },
        ] as InventoryItem[],
    },
};
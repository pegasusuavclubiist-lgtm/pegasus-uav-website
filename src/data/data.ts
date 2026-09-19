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
    summary?: string;
    stack?: string[];
}

export interface ProjectTelemetryStat {
    label: string;
    value: string;
    unit?: string;
    detail?: string;
}

export interface ProjectAvionicsSpec {
    subsystem: string;
    component: string;
    model: string;
    notes: string;
}

export interface ProjectObjective {
    id: string;
    title: string;
    description: string;
    division: string;
}

export interface ProjectFlightLog {
    phase: string;
    date: string;
    status: string;
    outcome: string;
}

export interface ProjectGalleryItem {
    url: string;
    caption: string;
    tag: string;
}

export interface ProjectDetail {
    slug: string;
    code: string;
    title: string;
    subtitle: string;
    status: string;
    trlLevel: string;
    category: string;
    partner: string;
    leadDivision: string;
    summary: string;
    overview: string[];
    coverImageUrl: string;
    gallery?: ProjectGalleryItem[];
    telemetryStats: ProjectTelemetryStat[];
    avionicsArchitecture: ProjectAvionicsSpec[];
    missionObjectives: ProjectObjective[];
    flightLogs: ProjectFlightLog[];
    stack: string[];
}

export interface ProjectPageUi {
    backToHangar: string;
    allProjectsLabel: string;
    telemetryHeaderTitle: string;
    coordinates: string;
    trlTagPrefix: string;
    statusTagPrefix: string;
    specsSectionNumber: string;
    specsHeadline: string;
    specsDescription: string;
    avionicsSectionNumber: string;
    avionicsHeadline: string;
    avionicsDescription: string;
    missionSectionNumber: string;
    missionHeadline: string;
    missionDescription: string;
    logsSectionNumber: string;
    logsHeadline: string;
    logsDescription: string;
    nextProjectBadge: string;
    exploreNextProject: string;
    requestHardwareCta: string;
    inquireProjectCta: string;
    notFoundTitle: string;
    notFoundMessage: string;
    returnHomeButton: string;
}

export interface TeamMember {
    name: string;
    role: string;
    imageUrl: string;
    subsystem?: string | null;
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
    id: "updates" | "inventory" | "members" | "projects";
    label: string;
    code: string;
    description: string;
}

export interface ConstitutionDefinition {
    term: string;
    definition: string;
}

export interface ConstitutionArticleSection {
    number?: string;
    title: string;
    content: string;
}

export interface ConstitutionArticle {
    id: string;
    articleNumber: string;
    romanNumeral: string;
    title: string;
    summary: string;
    sections: ConstitutionArticleSection[];
}

export interface ConstitutionLeadershipRole {
    title: string;
    category: "Executive" | "Management" | "Technical";
    mandates: { title: string; desc: string }[];
}

export interface FoundingMember {
    name: string;
    col: number;
}

export interface ConstitutionData {
    title: string;
    acronym: string;
    fullName: string;
    subtitle: string;
    institution: string;
    campus: string;
    edition: string;
    pageCount: number;
    fileSize: string;
    pdfUrl: string;
    downloadFileName: string;
    motto: string;
    slogan: string;
    preamble: string[];
    definitions: ConstitutionDefinition[];
    articles: ConstitutionArticle[];
    leadershipRoles: ConstitutionLeadershipRole[];
    foundingMembers: FoundingMember[];
    foundingFaculty: { name: string; title: string; department: string };
}

export const siteData = {
    header: {
        title: "PEGASUS UAV Club · IIST",
        logoUrl: "/pegasus-logo.png",
        navLinks: ["About", "Projects", "Team", "Mentors", "Request Inventory", "Join Us"],
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
    projectPageUi: {
        backToHangar: "RETURN TO HANGAR",
        allProjectsLabel: "ALL ACTIVE BUILDS",
        telemetryHeaderTitle: "PEGASUS AEROSPACE RESEARCH // FLIGHT LOGS",
        coordinates: "IIST VALIAMALA // 8.6277°N, 77.0379°E",
        trlTagPrefix: "READINESS LEVEL",
        statusTagPrefix: "CADRE STATUS",
        specsSectionNumber: "01 -- Telemetry",
        specsHeadline: "Performance Metrics",
        specsDescription: "Bench-validated telemetry benchmarks, endurance parameters, and operational bounds.",
        avionicsSectionNumber: "02 -- Architecture",
        avionicsHeadline: "Avionics & Hardware Matrix",
        avionicsDescription: "Subsystem flight controllers, edge companion compute, perception sensors, and telemetry infrastructure.",
        missionSectionNumber: "03 -- Mission",
        missionHeadline: "Operational Blueprint",
        missionDescription: "Primary mission objectives, operational challenges, and algorithmic strategies.",
        logsSectionNumber: "04 -- Cadence",
        logsHeadline: "Flight Logs & Trials",
        logsDescription: "Chronological deployment cadence, laboratory test phases, and verified field outcomes.",
        nextProjectBadge: "NEXT RESEARCH BUILD",
        exploreNextProject: "EXPLORE NEXT SPECS",
        requestHardwareCta: "REQUISITION HARDWARE",
        inquireProjectCta: "CONTACT CADRE LEAD",
        notFoundTitle: "PROJECT TELEMETRY NOT FOUND",
        notFoundMessage: "The requested project identifier is not active in the Pegasus research hangar or database.",
        returnHomeButton: "RETURN TO FLIGHT OPS",
    } as ProjectPageUi,
    projectDetails: {
        "flying-wings": {
            slug: "flying-wings",
            code: "PRJ-01 // DEF-OPS",
            title: "Flying Wings: National Defence Hackathon",
            subtitle: "Autonomous Tactical Quadcopter for GPS-Denied Subterranean & Recon Operations",
            status: "ACTIVE FLIGHT DEPLOYMENT",
            trlLevel: "TRL-6 // PROTOTYPE DEMO",
            category: "Tactical Reconnaissance & GPS-Denied Autonomy",
            partner: "National Defence Hackathon // Department of Space",
            leadDivision: "Autonomous Flight & Visual-Inertial Navigation",
            summary: "Engineering a GPS-denied quadcopter capable of autonomous waypoint navigation, real-time target identification, and fail-safe return-to-base in contested electronic warfare environments.",
            overview: [
                "Developed as a high-stakes entry for the National Defence Hackathon, the Flying Wings platform is engineered specifically to operate in electronic warfare environments where satellite signals (GPS, GLONASS, NavIC) are jammed, spoofed, or physically degraded.",
                "The airframe is built around a rigid carbon-fiber monocoque chassis integrating high-efficiency brushless propulsion, an edge AI perception payload driven by NVIDIA Jetson, and an onboard stereo-vision VIO (Visual-Inertial Odometry) pipeline that tracks millimeter-scale drift without external telemetry.",
                "Real-time object detection models running on TensorRT identify tactical markers, structural breach points, and personnel zones, executing search-and-survey patterns autonomously while preserving complete radio silence."
            ],
            coverImageUrl: "https://boqqnkwveliwzpxqzaha.supabase.co/storage/v1/object/public/media/projects/c8656d5f-3683-4582-b989-b9d5cfecbdaa-c.jpeg",
            telemetryStats: [
                { label: "Max Velocity", value: "18.5", unit: "m/s", detail: "Ground speed in autonomous cruise mode" },
                { label: "Endurance", value: "28", unit: "min", detail: "Continuous flight under full sensor load" },
                { label: "Operational Radius", value: "4.2", unit: "km", detail: "Line-of-sight telemetry & autonomous patrol range" },
                { label: "All-Up Weight", value: "1,850", unit: "g", detail: "Including battery, avionics & perception payload" },
                { label: "Autonomy Level", value: "Tier 4", unit: "Full Auto", detail: "Autonomous navigation, obstacle avoidance & safe touchdown" },
                { label: "Odometry Drift", value: "< 1.2", unit: "% / 100m", detail: "GPS-denied visual-inertial odometry cumulative drift" },
            ],
            avionicsArchitecture: [
                { subsystem: "Autopilot Flight Controller", component: "Holybro Pixhawk 6C Autopilot", model: "STM32H743 + Dual ICM-42688-P IMUs", notes: "Flashing ArduPilot 4.5.1 with customized EKF3 fusion for optical flow and visual odometry." },
                { subsystem: "AI Companion Computer", component: "NVIDIA Jetson Orin Nano (8GB)", model: "6-core ARM Cortex + Ampere GPU (40 TOPS)", notes: "Runs ROS2 Humble, JetPack 6.0, TensorRT inference pipeline, and RealSense VIO SLAM." },
                { subsystem: "Optical & Depth Perception", component: "Intel RealSense D435i Stereo Camera", model: "Global shutter IR depth + built-in BMI055 IMU", notes: "Mounted with silicone vibration isolation; provides 848x480 depth stream at 30 FPS." },
                { subsystem: "Altitude & Proximity Ranging", component: "Benewake TFmini Plus LiDAR", model: "ToF Single-point LiDAR (12m range, 100Hz)", notes: "Downward facing for high-speed altitude hold over non-reflective and dusty terrain." },
                { subsystem: "Propulsion & ESC", component: "T-Motor F40 PRO IV + Tekko32 50A 4-in-1", model: "1950KV Brushless + BLHeli_32 DShot600", notes: "Provides 4:1 thrust-to-weight ratio for sharp evasive maneuvers and stable hover." },
                { subsystem: "Telemetry & C2 Link", component: "RadioMaster ELRS 2.4GHz + RFD900x", model: "Dual Diversity ExpressLRS + 915MHz Telemetry", notes: "Frequency-hopping telemetry link with fail-safe automatic RTL on packet loss." },
            ],
            missionObjectives: [
                { id: "OBJ-01", title: "Zero-GPS Odometry Fusion", description: "Maintain positional hold and waypoint navigation using fused visual-inertial odometry and downward optical flow inside enclosed mock defense structures.", division: "Flight Controls & Autonomy" },
                { id: "OBJ-02", title: "Target Recognition & Threat Tagging", description: "Deploy deep neural networks on the Jetson Orin Nano to identify human subjects, hazards, and mission targets with sub-second inference latency.", division: "Computer Vision & Perception" },
                { id: "OBJ-03", title: "Emergency Autonomous Touchdown", description: "In the event of motor failure or payload disruption, compute optimal safe landing coordinates using real-time depth topology maps.", division: "Avionics & Embedded Systems" },
                { id: "OBJ-04", title: "Low-Observability Radio Protocol", description: "Execute tactical search sweeps while suppressing active telemetry broadcasts to evade electronic detection.", division: "Ground Control & Telemetry" },
            ],
            flightLogs: [
                { phase: "Bench & Propulsion Calibration", date: "August 2026", status: "NOMINAL", outcome: "Vibration dampening optimized; motor thrust variance verified within 1.8%." },
                { phase: "GPS-Denied Optical Lock Trial", date: "August 2026", status: "VALIDATED", outcome: "Achieved continuous 15-minute stable hover inside IIST Avionics Hangar with < 5cm drift." },
                { phase: "Autonomous Waypoint Mission", date: "September 2026", status: "SUCCESS", outcome: "Navigated 8 indoor checkpoints autonomously with obstacle avoidance in under 3 minutes." },
                { phase: "Field Demonstration Simulation", date: "Upcoming", status: "SCHEDULED", outcome: "Full-scale tactical deployment evaluation at defense test grounds." },
            ],
            stack: ["Pixhawk 6C", "Jetson Orin Nano", "ArduPilot EKF3", "ROS2 Humble", "Intel RealSense D435i", "TensorRT", "LiDAR"],
        },
        "agricultural-drone": {
            slug: "agricultural-drone",
            code: "PRJ-02 // AGRI-SYS",
            title: "Agricultural Drone Collaboration (Georgia University)",
            subtitle: "Autonomous Heavy-Lift UAV with Precision Soil Probe Insertion System",
            status: "FIELD TRIALS ACTIVE",
            trlLevel: "TRL-6 // RELEVANT ENVIRONMENT",
            category: "Precision Agriculture & Heavy-Lift Autonomous Robotics",
            partner: "Georgia University Agricultural Robotics Lab // Dept. of Space",
            leadDivision: "Payload Mechanics & Precision Geolocation",
            summary: "Developing an autonomous heavy-lift UAV platform engineered for precision rod insertion and sensor probe deployment in soft paddy fields and waterlogged crop terrain.",
            overview: [
                "In direct technical collaboration with agricultural robotics researchers from Georgia University, Pegasus UAV Club is engineering an aerial robotic platform capable of autonomously surveying paddy fields and mechanically inserting sensor probes directly into waterlogged soil.",
                "Traditional wheeled and tracked agricultural rovers frequently sink or cause irreversible crop damage in soft paddy soil. This heavy-lift UAV bridges the gap by flying directly over the canopy, hovering with centimeter precision via RTK-GNSS, and driving a vertical insertion rod down to monitor soil moisture, salinity, and nitrogen levels.",
                "The platform integrates a custom CNC-machined carbon payload bay with a high-torque linear actuator, real-time load cell telemetry to detect ground contact resistance, and a multi-spectral camera for simultaneous vegetative index (NDVI) mapping."
            ],
            coverImageUrl: "https://boqqnkwveliwzpxqzaha.supabase.co/storage/v1/object/public/media/projects/a7c187f3-2386-4472-9d01-d7133d5711b0-Gemini_Generated_Image_qxm18tqxm18tqxm1.png",
            telemetryStats: [
                { label: "Payload Capacity", value: "5.5", unit: "kg", detail: "Heavy-duty CNC linear actuator & sensor probe bay" },
                { label: "Positioning Accuracy", value: "± 1.5", unit: "cm", detail: "Dual RTK-GNSS rover-base station precision link" },
                { label: "Flight Time", value: "22", unit: "min", detail: "With full 5kg insertion payload and dual LiPo packs" },
                { label: "Insertion Force", value: "180", unit: "N", detail: "High-torque stepper drive with active ground resistance sensor" },
                { label: "Canopy Cruise Speed", value: "8.0", unit: "m/s", detail: "Optimized for high-resolution photogrammetry mapping" },
                { label: "Survey Coverage", value: "12", unit: "acres/hr", detail: "Autonomous grid path generation with auto soil sampling" },
            ],
            avionicsArchitecture: [
                { subsystem: "Autopilot Flight Controller", component: "Cube Orange+ Autopilot", model: "Triple redundant IMU + isolated damping", notes: "Configured with PX4 Autopilot for precision altitude hold and payload decoupling." },
                { subsystem: "Centimeter Geolocation", component: "Holybro H-RTK F9P Helical GNSS", model: "u-blox ZED-F9P Multi-band RTK Rover", notes: "Provides RTK Fixed solution with sub-2cm positioning accuracy over agricultural plots." },
                { subsystem: "Payload Deployment Actuator", component: "Custom CNC Linear Drive + Load Cell", model: "NEMA 23 High-Torque Stepper + HX711 Sensor", notes: "Monitors penetration force into mud; halts and retracts automatically if obstruction detected." },
                { subsystem: "Heavy-Lift Airframe", component: "Tarot 650 Iron Man Carbon Hexacopter", model: "Toray 3K Matte Carbon Weave (650mm wheelbase)", notes: "Reinforced folding arm mounts engineered for heavy downward reaction forces." },
                { subsystem: "Power Delivery System", component: "Dual 6S 16000mAh Semi-Solid LiPo", model: "High Energy Density 22.2V Architecture", notes: "Quick-release battery tray with independent avionics BEC isolation." },
                { subsystem: "Multispectral Sensor", component: "MAPIR Survey3W Multispectral NIR", model: "12MP RedEdge + NIR Filter", notes: "Geotags crop health imagery directly with RTK coordinate metadata." },
            ],
            missionObjectives: [
                { id: "OBJ-01", title: "Centimeter RTK Soil Probe Spotting", description: "Fly to pre-computed GIS survey coordinates and hover within ±2cm to align the mechanical insertion guide directly over probe locations.", division: "Payload Mechanics & Precision Geolocation" },
                { id: "OBJ-02", title: "Ground Reaction Force Balancing", description: "Active thrust compensation during rod insertion: counter-act the 180N upward ground reaction force to maintain rock-solid hover stability.", division: "Flight Controls & Autonomy" },
                { id: "OBJ-03", title: "Multi-Spectral Vegetation Analytics", description: "Generate orthomosaic NDVI maps during transit to correlate soil sensor readings with crop canopy stress indices.", division: "Computer Vision & Perception" },
                { id: "OBJ-04", title: "Automated Mission Planning & GCS", description: "Develop custom QGroundControl plugins allowing farmers and agronomists to tap field plots on a tablet for full autonomous sampling.", division: "Ground Control & Telemetry" },
            ],
            flightLogs: [
                { phase: "Heavy-Lift Thrust & Payload Balancing", date: "July 2026", status: "PASSED", outcome: "Demonstrated 24-minute hover with 5.5kg dummy payload at IIST Propulsion Lab." },
                { phase: "RTK-GNSS Accuracy Validation", date: "August 2026", status: "VALIDATED", outcome: "Stationary hover deviation recorded at 1.4cm radial variance under 12-knot crosswinds." },
                { phase: "Actuator Soil Insertion Trials", date: "August 2026", status: "SUCCESS", outcome: "Successfully performed 12 automated rod insertions into simulated waterlogged paddy soil." },
                { phase: "Paddy Field Environmental Deployment", date: "Upcoming", status: "ACTIVE", outcome: "Deploying prototype for live field data collection across partner research plots." },
            ],
            stack: ["Cube Orange+", "Holybro H-RTK F9P", "PX4 Autopilot", "Tarot 650 Carbon", "QGroundControl", "Linear Actuator", "Multispectral NIR"],
        },
    } as Record<string, ProjectDetail>,
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
        sectionNumber: "06 — Requisition",
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
        sectionNumber: "07 — Recruitment",
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
                description: "Publish and coordinate cadre operational bulletins, technical briefings, and internal dispatches",
            },
            {
                id: "inventory" as const,
                label: "Club Inventory",
                code: "02",
                description: "Track, audit, and dispatch avionics, sensors, propulsion & battery stocks",
            },
            {
                id: "members" as const,
                label: "Core Members",
                code: "03",
                description: "Enlist, organize, and expunge core members, designations, bios, and flight roster",
            },
            {
                id: "projects" as const,
                label: "Projects",
                code: "04",
                description: "Coordinate ongoing builds, flight research initiatives, specifications and platforms",
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
    constitution: {
        title: "Constitution of P.E.G.A.S.U.S.",
        acronym: "P.E.G.A.S.U.S.",
        fullName: "Prototyping and Engineering for Geoinformatics, Aerial Systems, and Unified Solutions",
        subtitle: "Autonomous Systems Club of IIST · Governing Document and Operational Guidelines",
        institution: "Indian Institute of Space Science and Technology",
        campus: "Thiruvananthapuram, Kerala",
        edition: "Official Version 3.0 // Ratified",
        pageCount: 33,
        fileSize: "222 KB",
        pdfUrl: "/constitution.pdf",
        downloadFileName: "PEGASUS_UAV_Club_Constitution_V3.pdf",
        motto: "Autonomy in Altitude",
        slogan: "Innovating the Skies, Empowering the Future",
        preamble: [
            "We, the members of P.E.G.A.S.U.S. (Prototyping and Engineering for Geoinformatics, Aerial Systems, and Unified Solutions), in order to form a collaborative, interdisciplinary, and innovative Autonomous Systems Club at the Indian Institute of Space Science and Technology (IIST), do hereby establish this Constitution.",
            "Recognizing the transformative potential of unmanned aerial vehicles, robotics, and smart systems in shaping the future of technology and society, we are dedicated to exploring the limitless applications of autonomous systems. We seek to advance drone technology, foster continuous research, and cultivate a culture of technical excellence within our student community.",
            "Through our collective endeavors, we commit to bridging the gap between theoretical knowledge and practical engineering. We strive to provide a robust platform for hands-on prototyping, where members can hone their analytical skills, ignite their creativity, and push the boundaries of modern geoinformatics and aerial solutions. Furthermore, we are devoted to nurturing the next generation of engineers by emphasizing leadership, encouraging seamless teamwork, and promoting a strong sense of social responsibility and ethical engineering practices.",
            "Firmly bound by the academic integrity, core values, and visionary ethos of IIST, we solemnly pledge unwavering adherence to the institute's rules and regulations. In pursuit of these high ideals, we lay down this document as our guiding foundation and the enduring framework for our organization."
        ],
        definitions: [
            { term: "P.E.G.A.S.U.S.", definition: "The official registered acronym for Prototyping and Engineering for Geoinformatics, Aerial Systems, and Unified Solutions, operating as the premier Autonomous Systems Club of IIST." },
            { term: "IIST", definition: "The Indian Institute of Space Science and Technology, the parent academic institution under whose overarching jurisdiction, ethical guidelines, and administrative regulations the organization legally operates." },
            { term: "Patron", definition: "The designated faculty in charge, officially nominated by the Director of IIST, who holds the highest position of honor, academic oversight, and strategic guidance, possessing ultimate veto power and disciplinary authority." },
            { term: "General Body", definition: "The complete assembly comprising all officially registered and active members of the club adhering to attendance and technical contribution thresholds." },
            { term: "Active Member", definition: "An individual maintaining at least 50% attendance record at official meetings, actively participating in at least one major club event per semester, and making tangible technical or logistical contributions." },
            { term: "Executive Committee (EC)", definition: "The primary governing and administrative body acting under the chairmanship of the President, responsible for day-to-day operations, financial allocations, and strategic functions." },
            { term: "Club Chair", definition: "An independent, impartial advisory entity consisting of three foundational core members who do not hold active operational office within the EC, ensuring continuity of club values." },
            { term: "Annual General Body Meeting (AGM)", definition: "The supreme deliberative assembly convened strictly once per academic year to reflect on progress, ratify roadmaps, approve audited financials, and debate constitutional amendments." },
            { term: "Club Activity Meets", definition: "The mandatory biweekly operational assembly restricted to Executive Committee members for strategic deliberation, collaborative decision-making, and project coordination." },
            { term: "Selection Committee", definition: "A dedicated, strictly impartial body appointed under the direct supervision of the Patron, solely responsible for evaluating applications, conducting interviews, and appointing leadership." },
            { term: "Quorum", definition: "The minimum mandatory attendance required to conduct club business: strictly defined as at least 50% of the total appointed committee members being actively present." },
            { term: "Internal Auditor", definition: "A designated individual responsible for rigorously verifying the monthly financial statements compiled by the Treasurer to ensure pristine financial transparency." }
        ],
        articles: [
            {
                id: "art-1",
                articleNumber: "01",
                romanNumeral: "Article I",
                title: "Name of the Club",
                summary: "Official title, foundational acronym blueprint, and mythological symbolism.",
                sections: [
                    { title: "Official Acronym", content: "P.E.G.A.S.U.S. stands for Prototyping and Engineering for Geoinformatics, Aerial Systems, and Unified Solutions." },
                    { title: "Prototyping and Engineering", content: "Underscores our fundamental commitment to hands-on development, ensuring members move beyond theoretical concepts to build, test, and refine tangible, working models." },
                    { title: "Geoinformatics and Aerial Systems", content: "Highlights our core domains of expertise: merging spatial data analysis and Earth observation with cutting-edge mechanics of unmanned aerial vehicles (UAVs)." },
                    { title: "Unified Solutions", content: "Reflects our ultimate objective: to seamlessly integrate hardware, software, and data into holistic systems capable of addressing complex, real-world challenges." },
                    { title: "Symbolism", content: "Draws profound inspiration from the mythical winged horse Pegasus, a timeless symbol of flight, swiftness, and unbounded imagination, pushing the boundaries of robotics and aviation." }
                ]
            },
            {
                id: "art-2",
                articleNumber: "02",
                romanNumeral: "Article II",
                title: "Objectives and Purpose",
                summary: "Six core directives driving technical innovation, student leadership, and aerospace excellence.",
                sections: [
                    { title: "Fostering Technical Excellence", content: "Comprehensively develop members' skills, theoretical knowledge, and technical creativity in design, fabrication, programming, and operation of drones and autonomous systems." },
                    { title: "Bridging Theory and Practice", content: "Provide a hands-on environment where students translate classroom academics into real-world engineering solutions through rigorous prototyping, testing, and system integration." },
                    { title: "Promoting Competitive Spirit", content: "Facilitate opportunities for members to represent IIST in national and international hackathons, design challenges, and autonomous systems competitions." },
                    { title: "Advancing Interdisciplinary Innovation", content: "Encourage research and development at the intersection of aerial platforms, artificial intelligence, and geoinformatics." },
                    { title: "Cultivating Leadership and Collaboration", content: "Build an inclusive culture of teamwork, peer-to-peer mentorship, and open knowledge sharing." },
                    { title: "Empowering Career Readiness", content: "Prepare members for impactful careers in aerospace, robotics, and geoinformatics industries with exposure to modern engineering tools and industry trends." }
                ]
            },
            {
                id: "art-3",
                articleNumber: "03",
                romanNumeral: "Article III",
                title: "Fundamental Rights",
                summary: "Foundational rights guaranteed to every registered member to ensure fairness, safety, and meritocracy.",
                sections: [
                    { number: "Section 1", title: "Equal Opportunity and Fair Access", content: "Equitable access to participate in club activities, utilize club resources, and seek leadership roles without discrimination." },
                    { number: "Section 2", title: "Freedom of Expression and Constructive Discourse", content: "Right to freely express technical ideas, project proposals, and organizational opinions in a respectful, professional manner." },
                    { number: "Section 3", title: "Right to Education, Skill Development, and Safety", content: "Access to technical training, workshops, and project mentorship in a strictly enforced safe operating environment." },
                    { number: "Section 4", title: "Intellectual Property and Fair Attribution", content: "Rigorous respect and formal credit for individual and collaborative contributions to club projects, papers, and competition entries." },
                    { number: "Section 5", title: "Privacy, Data Protection, and Confidentiality", content: "Guaranteed personal privacy alongside mutual confidentiality for proprietary club projects and strategic competition data." }
                ]
            },
            {
                id: "art-4",
                articleNumber: "04",
                romanNumeral: "Article IV",
                title: "Emblem, Slogan and Motto",
                summary: "Official heraldry, authorized usage parameters, slogan, and guiding motto.",
                sections: [
                    { number: "Section 1", title: "Official Emblem", content: "Standardized circular heraldry featuring the club name, autonomous systems and geoinformatics iconography, and affiliation with IIST." },
                    { number: "Section 2", title: "Authorized Use", content: "Exclusive property of the club; unauthorized commercial use, reproduction, or modification is strictly prohibited without written EC approval." },
                    { number: "Section 3", title: "Official Slogan", content: "”Innovating the Skies, Empowering the Future” — encapsulated across promotional campaigns, outreach, and public media." },
                    { number: "Section 4", title: "Official Motto", content: "”Autonomy in Altitude” — representing our core philosophical, academic, and engineering driving force." }
                ]
            },
            {
                id: "art-5",
                articleNumber: "05",
                romanNumeral: "Article V",
                title: "Annual General Body Meeting",
                summary: "Supreme deliberative assembly protocols, notice periods, reporting, and democratic decision-making.",
                sections: [
                    { number: "Section 1", title: "Purpose & Supremacy", content: "Supreme deliberative assembly for reflecting upon progress, ratifying roadmaps, and ensuring leadership accountability." },
                    { number: "Section 2", title: "Timing and Frequency", content: "Convened strictly once every academic year with formal notice issued at least fourteen days in advance." },
                    { number: "Section 3", title: "Agenda & Scope", content: "Comprehensive review of annual activities, audited financial statements, executive leadership transitions, and strategic blueprints." },
                    { number: "Section 4", title: "Chairmanship", content: "Officially chaired by the Patron (Designated Faculty in Charge nominated by Director, IIST) who enforces parliamentary order." },
                    { number: "Section 5", title: "Reporting & Audits", content: "Outgoing and active Executive Committee members present detailed reports, project milestones, and audited statements." },
                    { number: "Section 6-8", title: "Decision Making, Minutes & Adjournment", content: "Formal votes require consensus or democratic majority; official minutes recorded by Secretary General and archived." }
                ]
            },
            {
                id: "art-6",
                articleNumber: "06",
                romanNumeral: "Article VI",
                title: "Executive Committee & Activity Meets",
                summary: "EC governance structure, branch representation, advisory chair, and biweekly meeting protocols.",
                sections: [
                    { number: "Section 1", title: "Structure & Governance", content: "Composed of President, Vice President, Secretary General, Joint Secretary, Treasurer, and Corporate & Alumni Lead, plus academic branch representatives." },
                    { number: "Section 1(a)", title: "The Club Chair", content: "Three foundational core members serving in an impartial advisory capacity to ensure continuity of club traditions and long-term vision." },
                    { number: "Section 1(b)", title: "Removal of Executive Members", content: "Due process via General Body review followed by final binding decision by the Patron for extenuating reasons or severe misconduct." },
                    { number: "Section 2", title: "Biweekly Club Activity Meets", content: "Primary operational forum for strategic deliberation, decision-making, and project synchronization." },
                    { number: "Section 3-5", title: "Quorum (50%), Agendas & Minutes", content: "Requires at least 50% quorum for binding decisions; agenda circulated 2 days in advance; minutes documented and archived." }
                ]
            },
            {
                id: "art-7",
                articleNumber: "07",
                romanNumeral: "Article VII",
                title: "Amendment Rules",
                summary: "Procedures for proposing, debating, ratifying, and institutionalizing constitutional amendments.",
                sections: [
                    { number: "Section 1", title: "Proposal of Amendments", content: "Any registered member may propose amendments in writing with explicit rationale submitted to the Secretary General in advance of GBM." },
                    { number: "Section 2", title: "Voting Protocol", content: "Must be debated and ratified by at least a fifty percent democratic majority of present registered members during an official GBM." },
                    { number: "Section 3", title: "Patron Approval", content: "General Body passage acts as formal recommendation; final binding enactment requires explicit formal approval of the Patron." },
                    { number: "Section 4", title: "Enactment & Documentation", content: "Immediately takes effect upon Patron approval; integrated into master copy by Secretary General and circulated." }
                ]
            },
            {
                id: "art-8",
                articleNumber: "08",
                romanNumeral: "Article VIII",
                title: "Selection Rules and Procedures",
                summary: "Tenure limits, selection committee oversight, candidate eligibility, and merit-based appointment.",
                sections: [
                    { number: "Section 1", title: "Term of Office", content: "Official term continuously spans two academic semesters (one full academic year) before mandatory leadership transitions." },
                    { number: "Section 2", title: "Selection Committee", content: "Impartial body appointed under Patron supervision and supported by outgoing non-applying executives to conduct fair evaluations." },
                    { number: "Section 3", title: "Eligibility Criteria", content: "Enrolled 2nd year B.Tech. or higher, M.Tech., and Ph.D. students with consistent academic standing and proven club contribution." },
                    { number: "Section 4", title: "Evaluation Process", content: "Comprehensive multi-stage review of written applications, past technical contributions, and structured panel interviews." },
                    { number: "Section 5", title: "Conflict Resolution", content: "Irregularities or compromised integrity result in immediate nullification and renewed evaluations directed by Patron." }
                ]
            },
            {
                id: "art-9",
                articleNumber: "09",
                romanNumeral: "Article IX",
                title: "Finance Rules",
                summary: "Strict financial integrity, dual-signatory approvals, emergency liquidity limits, and monthly audits.",
                sections: [
                    { number: "Section 1", title: "Utilization of Funds", content: "Strictly and exclusively for established technical and academic objectives; zero diversion for personal use or private benefit." },
                    { number: "Section 1.2", title: "Dual Approval Mandate", content: "Expenditures mandate prior written approval of both the Treasurer and President, ratified during club meets." },
                    { number: "Section 2", title: "Financial Oversight", content: "President empowered to conduct unscheduled reviews; Patron retains unconditional inspection rights over ledgers and inventories." },
                    { number: "Section 3", title: "Emergency Contingencies (INR 5000)", content: "Secretary General authorized to approve emergency liquidity up to exactly INR 5000 for critical unforeseen field failures, subject to post-audit." },
                    { number: "Section 4", title: "Monthly Audits & Signatures", content: "Mandatory monthly internal audits signed by Treasurer, Secretary General, and Internal Auditor before Presidential sign-off." }
                ]
            },
            {
                id: "art-10",
                articleNumber: "10",
                romanNumeral: "Article X",
                title: "General Rules & Accountability",
                summary: "Mandatory 50% attendance, late inventory penalties, drone safety standards, and 20% prize pool remittance.",
                sections: [
                    { number: "Section 1", title: "Membership Criteria & Nullification", content: "Open to all interested students without membership fees; mandates 50% meeting attendance and 1 major event per semester." },
                    { number: "Section 2", title: "Inventory Access & Late Penalty (INR 50/day)", content: "Hardware borrowing requires Joint Secretary permission; late penalty fee of INR 50/item/day; full liability for damage or loss." },
                    { number: "Section 3", title: "Personal Project Liability", content: "Unauthorized use for personal non-club projects incurring damage demands 100% component cost reimbursement." },
                    { number: "Section 4", title: "Drone Integrity & Dismantling", content: "Disassembly or cannibalization of completed drones strictly requires written permission from Secretary General and original build team." },
                    { number: "Section 5", title: "Facility Security", content: "Lab keys restricted exclusively to formally elected Executive Committee members from campus security." },
                    { number: "Section 6", title: "Active Status & Stagnation Dissolution", content: "One calendar month of zero activity or unorganized progress triggers immediate suspension and potential team dissolution by Patron." },
                    { number: "Section 7", title: "Social Media & Public Relations", content: "Official digital handles confined strictly to professional outreach; administered exclusively by PR Head and President." },
                    { number: "Section 8", title: "Competition Asset & Prize Remittance (20%)", content: "Teams representing the club remit 20% of prize winnings to central treasury; competition hardware becomes permanent club property." },
                    { number: "Section 9-10", title: "Institutional Compliance", content: "Master constitution perpetually accessible; full compliance with IIST, DOS, Student Activities Dean, and Avionics Department." }
                ]
            },
            {
                id: "art-11",
                articleNumber: "11",
                romanNumeral: "Article XI",
                title: "Roles of Executive, Technical & Managerial Posts",
                summary: "Granular constitutional responsibilities across Executive, Management, and Technical leads.",
                sections: [
                    { title: "Executive Tier", content: "President (Supreme Authority & Strategy), Vice President (Operations & Deputy Command), Secretary General (Chief Administrator & Roster), Treasurer (Budget & Fiscal Oversight), Director of Corporate & Alumni Relations (Industry & Alumni), Joint Secretary (Logistics & Inventory)." },
                    { title: "Management Tier", content: "Project Manager (Technical Lifecycle & Milestones), Public Relations & Media Head (Digital Footprint & Branding), Logistics Head (Physical Hardware & Venue Clearences), Events Head & Co-Head (Symposiums, Workshops & Hackathons), Junior Treasurer (Ledgers & Cost Estimation)." },
                    { title: "Technical Tier (Postgraduate Only)", content: "Aerodynamics and Airframes Lead (CAD, FEA, CFD & Composites), Avionics and Embedded Systems Lead (Wiring, RTK, RF Links, Power Systems & Safety), Software and Autonomy Lead (ROS, VIO, Object Detection, SITL/HITL & Autopilot)." }
                ]
            }
        ],
        leadershipRoles: [
            {
                category: "Executive",
                title: "President",
                mandates: [
                    { title: "Supreme Executive Authority", desc: "Highest ranking student official exercising overarching executive control over all operations, technical projects, and administrative decisions." },
                    { title: "Strategic Command", desc: "Single-handedly provides the defining vision, long-term roadmap, and ensures complete synergy with IIST and ISRO values." },
                    { title: "Financial Authority & Veto", desc: "Unilaterally dictates budget priorities with the Treasurer and reserves exclusive executive veto power over lower committee decisions." },
                    { title: "Conflict Arbitration", desc: "Supreme arbitrator for internal disputes and constitutional ambiguity; all members unconditionally abide by final decisions." }
                ]
            },
            {
                category: "Executive",
                title: "Vice President",
                mandates: [
                    { title: "Second in Command", desc: "Immediate subordinate and strategic advisor to the President, wielding executive authority over internal management." },
                    { title: "Presidential Succession", desc: "Unconditionally assumes presidential powers and duties in the event of absence or temporary incapacitation." },
                    { title: "Operational Oversight", desc: "Monitors performance of technical and managerial leads, holding authority to initiate internal reviews for underperforming sectors." }
                ]
            },
            {
                category: "Executive",
                title: "Secretary General",
                mandates: [
                    { title: "Chief Administrative Officer", desc: "Supreme administrative authority holding exclusive control over all internal communications, records, and archives." },
                    { title: "Logistical Command & Rosters", desc: "Dictates project schedules, enforces operational deadlines, and maintains centralized registries and attendance thresholds." },
                    { title: "Meeting Convener", desc: "Constructs binding agendas and issues mandatory prior notifications for General Body and Executive Committee meets." }
                ]
            },
            {
                category: "Executive",
                title: "Treasurer",
                mandates: [
                    { title: "Budgeting & Financial Tracking", desc: "Develops, manages, and oversees the comprehensive annual operating budget and capital investments across all technical builds." },
                    { title: "Fundraising & Grants", desc: "Spearheads external sponsorship acquisition, financial grants, and fiscal allocation for flagship competitions." },
                    { title: "Ledger Auditing", desc: "Maintains transparent financial ledgers, vendor payments, and monthly audits co-signed by Internal Auditor." }
                ]
            },
            {
                category: "Management",
                title: "Project Manager",
                mandates: [
                    { title: "Technical Lifecycle Planning", desc: "Spearheads comprehensive planning, structural milestones, and lifecycle execution for all research initiatives." },
                    { title: "Team Delegation & Mentorship", desc: "Constructs specialized project teams, mitigates bottlenecks, and enforces interdisciplinary collaboration." },
                    { title: "Documentation & Archiving", desc: "Mandates and preserves comprehensive technical CAD files, codebases, flight logs, and debriefing sessions." }
                ]
            },
            {
                category: "Management",
                title: "Public Relations & Media Head",
                mandates: [
                    { title: "Digital Brand Strategy", desc: "Architects the public media presence across Instagram, GitHub, YouTube, and LinkedIn in strict alignment with IIST guidelines." },
                    { title: "Outreach & Event Promotion", desc: "Spearheads digital campaigns for workshops, hackathons, and recruitment drives to maximize national reach." }
                ]
            },
            {
                category: "Technical",
                title: "Aerodynamics & Airframes Lead (PG)",
                mandates: [
                    { title: "Structural Integrity & CAD/CFD", desc: "Supreme technical authority on airframe CAD, FEA stress modeling, CFD drag mitigation, and carbon fiber composite layup." },
                    { title: "Quality Assurance & Flight Inspections", desc: "Validates all physical builds against aviation safety standards prior to field flight authorization." }
                ]
            },
            {
                category: "Technical",
                title: "Avionics & Embedded Systems Lead (PG)",
                mandates: [
                    { title: "Electronics Architecture & Wiring", desc: "Oversees flight controllers, companion computers, secure RF telemetry links, and multi-sensor RTK/LiDAR fusion." },
                    { title: "Power Distribution & Safety", desc: "Architects fail-safe battery management, redundant BEC isolation, and ground debugging protocols." }
                ]
            },
            {
                category: "Technical",
                title: "Software & Autonomy Lead (PG)",
                mandates: [
                    { title: "Software Stack & Autopilot", desc: "Directs onboard autonomy, flight control loops, and mission planner integration." },
                    { title: "ROS, VIO & Computer Vision", desc: "Deploys real-time Visual-Inertial Odometry, object detection, and path planning in GPS-denied environments." }
                ]
            }
        ],
        foundingMembers: [
            { name: "Ishaan Gupta", col: 1 },
            { name: "Tushita Aggarwal", col: 2 },
            { name: "T. Nishkalan", col: 1 },
            { name: "Naman Gandhi", col: 2 },
            { name: "Aditya N. Mohanty", col: 1 },
            { name: "Pranjal Pise", col: 2 },
            { name: "Ashmit Show", col: 1 },
            { name: "Pranav D.", col: 2 },
            { name: "Adithyan T.", col: 1 },
            { name: "B.L. Vedanaathan", col: 2 },
            { name: "Ishaan Shankar", col: 1 },
            { name: "Niyati Kaushal", col: 2 },
            { name: "Parth Ray", col: 1 },
            { name: "Anand Nair", col: 2 }
        ],
        foundingFaculty: {
            name: "Dr. Rajesh Joseph Abraham",
            title: "Founding Faculty in Charge",
            department: "Department of Avionics · IIST"
        }
    } as ConstitutionData,
};
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { listProfessionals, DEFAULT_PAGE_SIZE } from "@/lib/data/professionals";
import { listLocations, DEFAULT_LOCATIONS } from "@/lib/data/locations";
import {
  listMyBookings,
  createBooking as createBookingRow,
  cancelBooking as cancelBookingRow,
  updateBookingStatus as updateBookingStatusRow,
} from "@/lib/data/bookings";
import {
  requestPayout as requestPayoutRow,
  releasePayment,
  refundPayment,
} from "@/lib/data/payments";
import { submitReview as submitReviewRow } from "@/lib/data/reviews";
import { formatMoney } from "@/lib/money";

// ponytail: in-memory booking used by legacy sync callers (/book/[id]) and as the supabase-down fallback.
function buildMockBooking(bookingData, customerProfile) {
  return {
    id: `BMP-${Math.floor(10000 + Math.random() * 90000)}`,
    proId: bookingData.pro.id,
    proName: bookingData.pro.name,
    proRole: bookingData.pro.role,
    proAvatar: bookingData.pro.image,
    serviceTitle: bookingData.service.title,
    servicePrice: bookingData.service.price,
    platformFee: 3.5,
    totalPaid: bookingData.service.price,
    date: bookingData.date,
    timeSlot: bookingData.timeSlot,
    address: bookingData.address,
    customerNotes: bookingData.notes || "None provided",
    customerName: bookingData.customerName || customerProfile.name,
    customerEmail: bookingData.customerEmail || customerProfile.email,
    customerPhone: bookingData.customerPhone || customerProfile.phone,
    status: "upcoming",
    paymentStatus: "paid",
    paymentMethod: bookingData.paymentMethod || "Visa ending in •••• 4242",
    createdAt: new Date().toISOString(),
    hasReview: false,
  };
}

const MarketplaceContext = createContext(null);

// Initial Verified Professionals Dataset with comprehensive services, schedules, credentials, and reviews
export const INITIAL_PROFESSIONALS = [
  {
    id: "pro-1",
    name: "Dr. Ayesha Khan",
    role: "General Physician & Consultant",
    category: "Doctors",
    specialty: "Internal Medicine & Family Health",
    rating: 4.9,
    reviewCount: 128,
    location: "Mumbai, India",
    experienceYears: 12,
    verified: true,
    hourlyRate: 50,
    price: 50,
    originalPrice: 65,
    unit: "session",
    responseTime: "< 30 mins",
    image: "/images/pro_doctor.jpg",
    bio: "Board-certified physician with 12+ years of clinical experience in India and the UK. Specializes in preventive healthcare, chronic illness management, general consultations, and wellness planning.",
    about:
      "Dr. Ayesha Khan graduated with honors from All India Institute of Medical Sciences (AIIMS), Mumbai and completed advanced residency in Internal Medicine. She provides compassionate, thorough telehealth and in-person medical consultations for patients of all ages.",
    credentials: [
      { title: "Medical License (Approbation)", issuer: "Maharashtra Medical Council", year: "2012" },
      { title: "Doctor of Medicine (M.D.)", issuer: "AIIMS Mumbai", year: "2011" },
      { title: "Certified Telehealth Practitioner", issuer: "Indian Medical Association", year: "2019" },
    ],
    services: [
      {
        id: "srv-101",
        title: "Standard Health Consultation",
        description: "Comprehensive 30-minute health evaluation, symptom review, and medical advice.",
        price: 50,
        duration: "30 mins",
      },
      {
        id: "srv-102",
        title: "Extended Diagnostic & Prescription Review",
        description: "In-depth 60-minute review of lab results, ongoing treatments, and chronic illness plan.",
        price: 85,
        duration: "60 mins",
      },
      {
        id: "srv-103",
        title: "Preventive Wellness & Diet Consultation",
        description: "Personalized lifestyle, dietary assessment, and preventive healthcare strategy.",
        price: 65,
        duration: "45 mins",
      },
    ],
    availability: {
      days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      hours: "09:00 - 18:00",
      slots: ["09:00 AM", "10:30 AM", "11:30 AM", "02:00 PM", "03:30 PM", "05:00 PM"],
    },
    reviews: [
      {
        id: "rev-1",
        userName: "Ananya Iyer",
        userAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80",
        rating: 5,
        date: "2 days ago",
        comment:
          "Dr. Khan is incredibly attentive and patient. She explained my diagnosis clearly and prescribed an effective treatment plan. Highly recommend!",
        verifiedBooking: true,
      },
      {
        id: "rev-2",
        userName: "Rahul Verma",
        userAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80",
        rating: 5,
        date: "1 week ago",
        comment:
          "Super fast scheduling and very professional. The appointment started right on time and all my medical questions were answered.",
        verifiedBooking: true,
      },
    ],
  },
  {
    id: "pro-2",
    name: "Rohit Sharma",
    role: "Senior Mathematics & Physics Tutor",
    category: "Tutors",
    specialty: "High School, SAT/AP & University Calculus",
    rating: 4.8,
    reviewCount: 98,
    location: "Mumbai, India",
    experienceYears: 8,
    verified: true,
    hourlyRate: 30,
    price: 30,
    originalPrice: 40,
    unit: "hour",
    responseTime: "< 15 mins",
    image: "/images/pro_tutor.jpg",
    bio: "Passionate STEM educator with a Master's in Applied Mathematics. Specializing in making complex calculus, algebra, and physics concepts simple, engaging, and exam-ready.",
    about:
      "With over 8 years of tutoring experience across international curricula, Rohit has helped hundreds of students achieve top scores in Abitur, SAT, AP Calculus, and university exams with customized lesson plans.",
    credentials: [
      { title: "M.Sc. in Applied Mathematics", issuer: "Indian Institute of Technology (IIT), Delhi", year: "2016" },
      { title: "Certified Advanced STEM Educator", issuer: "Indian Tutoring Council", year: "2018" },
    ],
    services: [
      {
        id: "srv-201",
        title: "1-on-1 High School Mathematics",
        description: "Targeted problem solving, exam prep, and concept clarity for Algebra/Geometry/Calculus.",
        price: 30,
        duration: "60 mins",
      },
      {
        id: "srv-202",
        title: "Intensive Exam & Test Preparation (SAT / AP)",
        description: "Focused strategy sessions, past paper walkthroughs, and time management techniques.",
        price: 45,
        duration: "90 mins",
      },
      {
        id: "srv-203",
        title: "University Level Calculus & Linear Algebra",
        description: "Advanced tutoring for engineering and science undergraduates.",
        price: 50,
        duration: "60 mins",
      },
    ],
    availability: {
      days: ["Monday", "Wednesday", "Friday", "Saturday", "Sunday"],
      hours: "10:00 - 20:00",
      slots: ["10:00 AM", "11:30 AM", "01:30 PM", "03:00 PM", "05:00 PM", "06:30 PM"],
    },
    reviews: [
      {
        id: "rev-3",
        userName: "Priya Sharma",
        userAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80",
        rating: 5,
        date: "3 days ago",
        comment:
          "Rohit helped my daughter move from a C to an A in Calculus within 6 weeks. His explanations and visual tricks are phenomenal.",
        verifiedBooking: true,
      },
    ],
  },
  {
    id: "pro-3",
    name: "Ahmed Ali",
    role: "Master Electrician & Smart Home Specialist",
    category: "Electricians",
    specialty: "Wiring, Fuse Box, Solar & EV Charger Installs",
    rating: 4.7,
    reviewCount: 86,
    location: "Mumbai, India",
    experienceYears: 10,
    verified: true,
    hourlyRate: 40,
    price: 40,
    originalPrice: 60,
    unit: "hour",
    responseTime: "< 45 mins",
    image: "/images/pro_electrician.jpg",
    bio: "Certified master electrician with a decade of expertise in residential electrical repairs, complete rewiring, emergency fault detection, and modern smart home automation.",
    about:
      "Fully certified under Indian IS standards with complete liability insurance. Ahmed handles everything from quick socket fixes to full residential electrical overhauls safely and punctually.",
    credentials: [
      { title: "Master Electrician Certification", issuer: "Maharashtra Electrical Licensing Board", year: "2014" },
      { title: "Certified Smart Home Installer", issuer: "KNX Association", year: "2020" },
    ],
    services: [
      {
        id: "srv-301",
        title: "Electrical Inspection & Fault Diagnosis",
        description: "Emergency circuit check, tripping fuse troubleshooting, and safety certification.",
        price: 40,
        duration: "60 mins",
      },
      {
        id: "srv-302",
        title: "Light Fixture & Appliance Installation",
        description: "Installation of ceiling fans, pendant lights, oven/cooktop connections, and smart switches.",
        price: 60,
        duration: "90 mins",
      },
      {
        id: "srv-303",
        title: "Full Fuse Box Upgrade & Surge Protection",
        description: "Modern breaker board replacement with RCBO safety switches.",
        price: 150,
        duration: "180 mins",
      },
    ],
    availability: {
      days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      hours: "08:00 - 19:00",
      slots: ["08:30 AM", "10:00 AM", "12:00 PM", "02:30 PM", "04:30 PM", "06:00 PM"],
    },
    reviews: [
      {
        id: "rev-4",
        userName: "Karan Malhotra",
        userAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80",
        rating: 5,
        date: "5 days ago",
        comment:
          "Ahmed arrived equipped with all necessary tools, identified a hidden short circuit within 20 minutes, and resolved it cleanly.",
        verifiedBooking: true,
      },
    ],
  },
  {
    id: "pro-4",
    name: "Sara Khan",
    role: "Certified Beautician & Skin Specialist",
    category: "Beauticians",
    specialty: "Bridal Makeup, Facials & Hair Styling",
    rating: 4.9,
    reviewCount: 112,
    location: "Mumbai, India",
    experienceYears: 7,
    verified: true,
    hourlyRate: 35,
    price: 35,
    originalPrice: 50,
    unit: "session",
    responseTime: "< 20 mins",
    image: "/images/pro_beautician.jpg",
    bio: "International certified makeup artist and aesthetician providing luxury at-home salon treatments, organic facials, skin rejuvenation, and event makeup.",
    about:
      "Trained at the London Academy of Beauty & Aesthetics. Sara utilizes top-tier hypoallergenic, cruelty-free cosmetic brands tailored specifically to your skin type.",
    credentials: [
      { title: "Diploma in Professional Aesthetics & Makeup", issuer: "CIDESCO India", year: "2017" },
      { title: "Organic Skincare Specialist Certification", issuer: "Indian Beauty & Aesthetics Guild", year: "2019" },
    ],
    services: [
      {
        id: "srv-401",
        title: "Hydrating Facial & Skin Rejuvenation",
        description: "Deep pore cleansing, exfoliation, herbal steam, and collagen mask.",
        price: 35,
        duration: "45 mins",
      },
      {
        id: "srv-402",
        title: "Glam Party & Event Makeup",
        description: "Full face HD makeup including false lash application and contouring.",
        price: 65,
        duration: "60 mins",
      },
      {
        id: "srv-403",
        title: "Complete Bridal / Special Occasion Package",
        description: "Hair styling, HD bridal makeup, pre-treatment skin prep and setting.",
        price: 120,
        duration: "120 mins",
      },
    ],
    availability: {
      days: ["Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      hours: "09:00 - 19:00",
      slots: ["09:30 AM", "11:00 AM", "01:00 PM", "03:00 PM", "05:00 PM", "06:30 PM"],
    },
    reviews: [
      {
        id: "rev-5",
        userName: "Sneha Kulkarni",
        userAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
        rating: 5,
        date: "4 days ago",
        comment:
          "Sara is a true artist! My skin was glowing and the party makeup lasted through the entire night without a touch up.",
        verifiedBooking: true,
      },
    ],
  },
  {
    id: "pro-5",
    name: "Ramesh Kumar",
    role: "Master Plumber & Heating Engineer",
    category: "Plumbers",
    specialty: "Leak Repairs, Pipe Fitting & Boiler Maintenance",
    rating: 4.8,
    reviewCount: 74,
    location: "Mumbai, India",
    experienceYears: 14,
    verified: true,
    hourlyRate: 45,
    price: 45,
    originalPrice: 65,
    unit: "hour",
    responseTime: "< 25 mins",
    image: "/images/pro_plumber.jpg",
    bio: "Licensed master plumber with 14+ years servicing residential and commercial plumbing systems, bathroom renovations, drainage clearance, and boiler servicing.",
    about:
      "Equipped with the latest thermal imaging leak detection and high-pressure pipe cleaning tools. Available for scheduled repairs and rapid emergency fixes.",
    credentials: [
      { title: "Master Plumber Certification", issuer: "Maharashtra Electrical Licensing Board", year: "2010" },
      { title: "Certified Gas & Water Safety Inspector", issuer: "Indian Plumbing Association", year: "2015" },
    ],
    services: [
      {
        id: "srv-501",
        title: "Emergency Pipe Leak Repair & Tap Fixing",
        description: "Rapid leak detection, pipe sealing, tap washer/cartridge replacement.",
        price: 45,
        duration: "60 mins",
      },
      {
        id: "srv-502",
        title: "Clogged Drain & Sewer Line Jetting",
        description: "High-pressure clearing of blocked kitchen/bathroom drains and waste pipes.",
        price: 75,
        duration: "75 mins",
      },
      {
        id: "srv-503",
        title: "Water Heater & Boiler Health Inspection",
        description: "Complete pressure testing, valve check, and heating efficiency tuning.",
        price: 95,
        duration: "90 mins",
      },
    ],
    availability: {
      days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      hours: "08:00 - 18:00",
      slots: ["08:00 AM", "10:00 AM", "12:00 PM", "02:00 PM", "04:00 PM"],
    },
    reviews: [
      {
        id: "rev-6",
        userName: "Aisha Sheikh",
        userAvatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80",
        rating: 5,
        date: "1 week ago",
        comment:
          "Daniel fixed our leaking pipe under the kitchen sink very quickly. Neat, polite, and very reasonable pricing.",
        verifiedBooking: true,
      },
    ],
  },
  {
    id: "pro-6",
    name: "Arjun Mehta",
    role: "Senior IT Support & Cybersecurity Specialist",
    category: "IT Professionals",
    specialty: "Network Setup, Data Recovery & Hardware Fixes",
    rating: 4.9,
    reviewCount: 65,
    location: "Delhi, India",
    experienceYears: 9,
    verified: true,
    hourlyRate: 55,
    price: 55,
    originalPrice: 75,
    unit: "hour",
    responseTime: "< 20 mins",
    image: "/images/cat_it_pro.jpg",
    bio: "Senior systems engineer providing on-demand IT troubleshooting, Wi-Fi mesh setup, cybersecurity audits, backup configuration, and Mac/PC repairs.",
    about:
      "CompTIA Security+ and Cisco CCNA certified. Johannes provides remote and on-site support for home offices and small business infrastructure.",
    credentials: [
      { title: "B.Sc. in Computer Science", issuer: "IIT Delhi", year: "2015" },
      { title: "Cisco Certified Network Associate (CCNA)", issuer: "Cisco Systems", year: "2018" },
      { title: "CompTIA Security+ Certified", issuer: "CompTIA", year: "2021" },
    ],
    services: [
      {
        id: "srv-601",
        title: "PC/Mac Diagnostic & Virus Removal",
        description: "Full system optimization, malware scan, OS repair, and hardware test.",
        price: 55,
        duration: "60 mins",
      },
      {
        id: "srv-602",
        title: "Home Office Wi-Fi Mesh & Network Setup",
        description: "Coverage mapping, router security hardening, and high-speed network setup.",
        price: 80,
        duration: "90 mins",
      },
      {
        id: "srv-603",
        title: "Data Recovery & Automated Cloud Backup",
        description: "Encrypted backup solution and corrupted drive recovery.",
        price: 110,
        duration: "120 mins",
      },
    ],
    availability: {
      days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      hours: "09:00 - 18:00",
      slots: ["09:00 AM", "11:00 AM", "01:30 PM", "03:30 PM", "05:00 PM"],
    },
    reviews: [
      {
        id: "rev-7",
        userName: "Rohan Mehta",
        userAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80",
        rating: 5,
        date: "2 weeks ago",
        comment:
          "Johannes revived my bricked MacBook and salvaged all my work files. Absolute lifesaver!",
        verifiedBooking: true,
      },
    ],
  },
  {
    id: "pro-7",
    name: "Priya Nair",
    role: "Professional Home & Deep Cleaning Specialist",
    category: "Cleaners",
    specialty: "Eco-friendly Deep Clean, Move-in/out & Sanitize",
    rating: 4.8,
    reviewCount: 92,
    location: "Bangalore, India",
    experienceYears: 6,
    verified: true,
    hourlyRate: 28,
    price: 28,
    originalPrice: 38,
    unit: "hour",
    responseTime: "< 30 mins",
    image: "/images/cat_cleaner.jpg",
    bio: "Meticulous professional cleaner using non-toxic, eco-certified cleaning agents. Specializing in residential deep cleaning, Airbnb turnovers, and post-tenancy handovers.",
    about:
      "Fully vetted with liability insurance and background verification. Brings all high-end HEPA vacuum equipment, microfibers, and eco-friendly products.",
    credentials: [
      { title: "Certified Professional Housekeeper", issuer: "Indian Housekeeping Institute", year: "2018" },
      { title: "Hygiene & Sanitization Compliance Certificate", issuer: "Health & Safety India", year: "2021" },
    ],
    services: [
      {
        id: "srv-701",
        title: "Standard Residential Maintenance Clean",
        description: "Dusting, vacuuming, mopping, bathroom disinfection, and kitchen wipe-down.",
        price: 28,
        duration: "60 mins",
      },
      {
        id: "srv-702",
        title: "Comprehensive Move-in / Move-out Deep Clean",
        description: "Inside oven/fridge, baseboards, window sills, and deep lime descaling.",
        price: 84,
        duration: "180 mins",
      },
    ],
    availability: {
      days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      hours: "08:30 - 17:30",
      slots: ["08:30 AM", "11:00 AM", "01:30 PM", "04:00 PM"],
    },
    reviews: [
      {
        id: "rev-8",
        userName: "Anita Sharma",
        userAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80",
        rating: 5,
        date: "6 days ago",
        comment: "My apartment has never looked this spotless! Clara is super thorough and very friendly.",
        verifiedBooking: true,
      },
    ],
  },
  {
    id: "pro-8",
    name: "Vikram Desai",
    role: "Certified Business & Tax Consultant",
    category: "Consultants",
    specialty: "Freelancer Taxes, Business Plans & Legal Setup",
    rating: 4.9,
    reviewCount: 53,
    location: "Hyderabad, India",
    experienceYears: 15,
    verified: true,
    hourlyRate: 70,
    price: 70,
    originalPrice: 95,
    unit: "session",
    responseTime: "< 40 mins",
    image: "/images/cat_consultant.jpg",
    bio: "Senior financial consultant and certified business advisor helping startups, freelancers, and small enterprises streamline accounting, optimize tax deductions, and scale safely.",
    about:
      "Over 15 years advising in Mumbai financial district. Fluent in Hindi and English, offering actionable, step-by-step guidance tailored to Indian tax regulations.",
    credentials: [
      { title: "Master of Finance & Accounting", issuer: "Indian Institute of Banking & Finance", year: "2009" },
      { title: "Certified Tax Advisory Professional", issuer: "Institute of Chartered Accountants of India (ICAI)", year: "2012" },
    ],
    services: [
      {
        id: "srv-801",
        title: "Freelancer Tax & Registration Strategy",
        description: "Finanzamt setup, Kleinunternehmerregelung analysis, and deductible expenses.",
        price: 70,
        duration: "45 mins",
      },
      {
        id: "srv-802",
        title: "Full Business Model & Financial Plan Audit",
        description: "Cash flow modeling, investor pitch review, and growth structure analysis.",
        price: 130,
        duration: "90 mins",
      },
    ],
    availability: {
      days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      hours: "09:00 - 17:00",
      slots: ["09:00 AM", "11:00 AM", "02:00 PM", "04:00 PM"],
    },
    reviews: [
      {
        id: "rev-9",
        userName: "Tarun Bhatia",
        userAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80",
        rating: 5,
        date: "3 weeks ago",
        comment: "Marc saved my startup thousands in tax structuring. Worth every single cent!",
        verifiedBooking: true,
      },
    ],
  },
];

// Initial demo bookings
export const INITIAL_BOOKINGS = [
  {
    id: "BMP-84920",
    proId: "pro-1",
    proName: "Dr. Ayesha Khan",
    proRole: "General Physician & Consultant",
    proAvatar: "/images/pro_doctor.jpg",
    serviceTitle: "Standard Health Consultation",
    servicePrice: 50,
    platformFee: 3.5,
    totalPaid: 50,
    date: "2026-09-22",
    timeSlot: "10:30 AM",
    address: "Bandra Kurla Complex, Mumbai 400051",
    customerNotes: "Annual general checkup & routine blood test review.",
    customerName: "Alex Morgan",
    customerEmail: "alex.morgan@example.com",
    customerPhone: "+91 98200 98765",
    status: "upcoming", // "upcoming" | "in_progress" | "completed" | "cancelled"
    paymentStatus: "paid",
    paymentMethod: "Visa ending in •••• 4242",
    createdAt: "2026-09-15T14:30:00Z",
    hasReview: false,
  },
  {
    id: "BMP-73911",
    proId: "pro-3",
    proName: "Ahmed Ali",
    proRole: "Master Electrician",
    proAvatar: "/images/pro_electrician.jpg",
    serviceTitle: "Electrical Inspection & Fault Diagnosis",
    servicePrice: 40,
    platformFee: 3.5,
    totalPaid: 40,
    date: "2026-09-10",
    timeSlot: "02:30 PM",
    address: "Linking Road, Bandra West, Mumbai 400050",
    customerNotes: "Tripping breaker in the living room socket.",
    customerName: "Alex Morgan",
    customerEmail: "alex.morgan@example.com",
    customerPhone: "+91 98200 98765",
    status: "completed",
    paymentStatus: "paid",
    paymentMethod: "PayPal (alex@example.com)",
    createdAt: "2026-09-08T09:15:00Z",
    hasReview: true,
    reviewRating: 5,
    reviewText: "Quick diagnostic and repaired right away.",
  },
];

export function MarketplaceProvider({ children }) {
  const { user, showToast } = useAuth();

  // Master State
  const [professionals, setProfessionals] = useState(INITIAL_PROFESSIONALS);
  // Server-filtered, paginated page of the directory. Detail/booking pages keep using the full `professionals` list.
  const [filteredProfessionals, setFilteredProfessionals] = useState(INITIAL_PROFESSIONALS);
  const [locations, setLocations] = useState(DEFAULT_LOCATIONS);
  const [isLoadingProfessionals, setIsLoadingProfessionals] = useState(true);
  const [bookings, setBookings] = useState(INITIAL_BOOKINGS);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(INITIAL_PROFESSIONALS.length);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Directory Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [minRating, setMinRating] = useState(0);
  const [minExperience, setMinExperience] = useState(0);
  const [priceRange, setPriceRange] = useState("all"); // "all" | "under-40" | "40-70" | "above-70"
  const [availabilityDay, setAvailabilityDay] = useState("all"); // "all" | weekday name
  const [availabilitySlot, setAvailabilitySlot] = useState("all"); // "all" | slot label
  const [sortBy, setSortBy] = useState("featured"); // "featured" | "rating" | "price-asc" | "price-desc" | "reviews"

  // Active Modals & Flow States
  const [selectedPro, setSelectedPro] = useState(null); // Pro profile modal
  const [bookingPro, setBookingPro] = useState(null); // Booking wizard modal
  const [bookingPreselectedService, setBookingPreselectedService] = useState(null);
  const [reviewBooking, setReviewBooking] = useState(null); // Review write modal
  const [isCustomerDashboardOpen, setIsCustomerDashboardOpen] = useState(false);
  const [isProDashboardOpen, setIsProDashboardOpen] = useState(false);

  // Customer Profile State
  const [customerProfile, setCustomerProfile] = useState({
    name: "Alex Morgan",
    email: "alex.morgan@example.com",
    phone: "+91 98200 98765",
    address: "Bandra Kurla Complex",
    city: "Mumbai",
    postalCode: "10117",
  });

  // Professional Vendor State (Simulated for active pro user)
  const [proVendorState, setProVendorState] = useState({
    id: "pro-1",
    name: "Dr. Ayesha Khan",
    verificationStatus: "verified", // "verified" | "pending_verification"
    totalGrossEarnings: 1850,
    commissionRate: 0.1, // 10%
    paidOutAmount: 1000,
    availablePayout: 665,
    payoutHistory: [
      { id: "PAY-101", date: "01 Sep 2026", amount: 600, status: "Completed", method: "SEPA Bank (DE89...4401)" },
      { id: "PAY-102", date: "15 Aug 2026", amount: 400, status: "Completed", method: "SEPA Bank (DE89...4401)" },
    ],
    uploadedDocuments: [
      { name: "Government_ID_Passport.pdf", type: "ID Proof", date: "10 Jan 2024", verified: true },
      { name: "Medical_Board_License_2024.pdf", type: "Professional License", date: "12 Jan 2024", verified: true },
    ],
  });

  // Sync logged in user info with customer profile if available
  useEffect(() => {
    if (user) {
      setCustomerProfile((prev) => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
      }));
    }
  }, [user]);

  // Load the full catalog once for the detail/booking pages and the slot picker.
  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const locs = await listLocations();
        if (!active) return;
        setLocations(locs);
        // ponytail: 500-row cap keeps /professionals/[id] + /book/[id] working off the context list.
        // Move those to a by-id fetch if the catalog can exceed it.
        const { rows } = await listProfessionals({
          page: 1,
          pageSize: 500,
          locations: locs,
          seed: INITIAL_PROFESSIONALS,
        });
        if (active && rows.length > 0) setProfessionals(rows);
      } finally {
        if (active) setIsLoadingProfessionals(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  // Debounce the search box before it hits the server.
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Server-side filtered + paginated directory rows (falls back to the seed inside listProfessionals).
  useEffect(() => {
    let active = true;

    (async () => {
      setIsLoadingProfessionals(true);
      const { rows, total: count } = await listProfessionals({
        search: debouncedSearch,
        category: selectedCategory,
        location: selectedLocation,
        minRating,
        minExperience,
        priceRange,
        sortBy,
        availabilityDay,
        availabilitySlot,
        page,
        pageSize: DEFAULT_PAGE_SIZE,
        seed: professionals,
        locations,
      });
      if (!active) return;
      setFilteredProfessionals(rows);
      setTotal(count);
      setIsLoadingProfessionals(false);
    })();

    return () => {
      active = false;
    };
  }, [
    debouncedSearch,
    selectedCategory,
    selectedLocation,
    minRating,
    minExperience,
    priceRange,
    sortBy,
    availabilityDay,
    availabilitySlot,
    page,
    professionals,
    locations,
  ]);

  // Any filter change returns to page 1.
  const setSearch = (value) => {
    setSearchQuery(value);
    setPage(1);
  };
  const setCategory = (value) => {
    setSelectedCategory(value);
    setPage(1);
  };
  const setLocation = (value) => {
    setSelectedLocation(value);
    setPage(1);
  };
  const setRating = (value) => {
    setMinRating(value);
    setPage(1);
  };
  const setExperience = (value) => {
    setMinExperience(value);
    setPage(1);
  };
  const setPrice = (value) => {
    setPriceRange(value);
    setPage(1);
  };
  const setDay = (value) => {
    setAvailabilityDay(value);
    setPage(1);
  };
  const setSlot = (value) => {
    setAvailabilitySlot(value);
    setPage(1);
  };
  const setSort = (value) => {
    setSortBy(value);
    setPage(1);
  };

  // Load real bookings for the signed-in user; keep the demo seed when there is no session / supabase is down.
  useEffect(() => {
    let active = true;

    (async () => {
      const rows = await listMyBookings();
      if (active && rows) setBookings(rows);
    })();

    return () => {
      active = false;
    };
  }, [user?.id]);

  // Actions
  const openProDetail = (pro) => {
    setSelectedPro(pro);
  };

  const closeProDetail = () => {
    setSelectedPro(null);
  };

  const startBooking = (pro, preselectedService = null) => {
    setBookingPro(pro);
    setBookingPreselectedService(preselectedService || (pro.services && pro.services[0]) || null);
    if (selectedPro) setSelectedPro(null);
  };

  const closeBooking = () => {
    setBookingPro(null);
    setBookingPreselectedService(null);
  };

  const addBooking = (booking) => {
    if (!booking) return;
    setBookings((prev) => [booking, ...prev.filter((b) => b.id !== booking.id)]);
  };

  const bumpVendorEarnings = (gross) => {
    setProVendorState((prev) => {
      const commission = gross * prev.commissionRate;
      return {
        ...prev,
        totalGrossEarnings: prev.totalGrossEarnings + gross,
        availablePayout: prev.availablePayout + (gross - commission),
      };
    });
  };

  // Create new booking (sync optimistic for legacy callers). Persists to supabase in the background
  // and reconciles; BookingModal uses the data layer directly so it can surface slot conflicts.
  const createBooking = (bookingData) => {
    const newBooking = buildMockBooking(bookingData, customerProfile);
    addBooking(newBooking);
    bumpVendorEarnings(bookingData.service?.price || 0);
    showToast(`Booking ${newBooking.id} confirmed! Check 'My Bookings' for details.`, "success");

    createBookingRow(bookingData)
      .then((real) => setBookings((prev) => prev.map((b) => (b.id === newBooking.id ? real : b))))
      .catch(() => {
        // ponytail: keep the optimistic booking while schema/session is unavailable
        fetch("/api/bookings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newBooking),
        }).catch(console.error);
      });

    return newBooking;
  };

  // Cancel Booking. Policy/validation errors (e.g. cancellation window) are rethrown for the caller to show.
  const cancelBooking = async (bookingId) => {
    try {
      await cancelBookingRow(bookingId);
      await refundPayment(bookingId);
    } catch (err) {
      if (err?.isUserFacing) throw err;
      // ponytail: mock fallback while schema/session is unavailable — still reflect the cancel locally.
    }
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: "cancelled", paymentStatus: "refunded" } : b))
    );
    showToast(`Booking ${bookingId} has been cancelled and refunded to your original payment method.`, "info");
  };

  // Pro marks status (e.g. In-progress or Completed). Invalid-transition errors are rethrown for the caller.
  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      await updateBookingStatusRow(bookingId, newStatus);
      if (newStatus === "completed") {
        try {
          await releasePayment(bookingId);
        } catch {
          // ponytail: escrow release is best-effort; reconcile when the payments table exists.
        }
      }
    } catch (err) {
      if (err?.isUserFacing) throw err;
      // ponytail: mock fallback while schema/session is unavailable — still reflect the status locally.
    }
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b))
    );
    showToast(`Booking status updated to ${newStatus.replace("_", " ")}.`, "success");
  };

  // Submit Rating & Review — persists a pending review via the data layer, falling back
  // to the in-memory mock when supabase/schema is unavailable. Callers close the modal.
  const submitReview = async (bookingId, proId, rating, comment, breakdown = {}) => {
    let persisted = false;
    try {
      await submitReviewRow({ bookingId, professionalId: proId, rating, comment, breakdown });
      persisted = true;
    } catch (err) {
      // Surface validation errors (own/completed booking, duplicate review) to the caller.
      if (err?.isUserFacing) throw err;
      // ponytail: mock fallback while schema/session is unavailable — remove once reviews are live.
    }

    // 1. Mark booking as reviewed
    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              hasReview: true,
              reviewRating: rating,
              reviewText: comment,
            }
          : b
      )
    );

    // 2. Reflect on the profile locally only when the review was NOT persisted (demo mode).
    //    A persisted review is "pending" and must wait for admin approval, so don't bypass moderation.
    if (!persisted) {
      const newRev = {
        id: `rev-${Date.now()}`,
        userName: customerProfile.name,
        userAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80",
        rating,
        date: "Just now",
        comment,
        breakdown,
        verifiedBooking: true,
      };

      setProfessionals((prev) =>
        prev.map((p) => {
          if (p.id === proId) {
            const newReviews = [newRev, ...p.reviews];
            const avg = (
              newReviews.reduce((sum, r) => sum + r.rating, 0) / newReviews.length
            ).toFixed(1);
            return {
              ...p,
              rating: parseFloat(avg),
              reviewCount: newReviews.length,
              reviews: newReviews,
            };
          }
          return p;
        })
      );
    }

    showToast(
      persisted
        ? "Review submitted — it will appear once approved by an admin."
        : "Thank you! Your review has been published.",
      "success"
    );
  };

  // Request Payout
  const requestPayout = async (amount) => {
    const amt = parseFloat(amount);

    if (user?.id) {
      try {
        await requestPayoutRow(user.id, amt, "SEPA Bank (DE89...4401)");
        showToast(`Payout request of ${formatMoney(amt)} submitted successfully!`, "success");
        return true;
      } catch {
        // ponytail: fall through to the mock payout while schema/session is unavailable.
      }
    }

    if (amt > proVendorState.availablePayout) {
      showToast("Requested amount exceeds available balance.", "error");
      return false;
    }
    const newPayout = {
      id: `PAY-${Math.floor(100 + Math.random() * 900)}`,
      date: "Just now",
      amount: amt,
      status: "Processing (1-2 business days)",
      method: "SEPA Bank (DE89...4401)",
    };

    setProVendorState((prev) => ({
      ...prev,
      paidOutAmount: prev.paidOutAmount + amt,
      availablePayout: prev.availablePayout - amt,
      payoutHistory: [newPayout, ...prev.payoutHistory],
    }));
    
    // Persist to the local json fallback
    fetch("/api/payouts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: newPayout.id,
        professional_id: user?.id || "pro-1",
        professional: { full_name: proVendorState.name || "Vendor" },
        amount: newPayout.amount,
        status: "requested",
        method: newPayout.method,
        requested_at: new Date().toISOString()
      }),
    }).catch(console.error);

    showToast(`Payout request of ${formatMoney(amount)} submitted successfully!`, "success");
    return true;
  };

  // Upload verification document
  const uploadDocument = (docType, fileName) => {
    const newDoc = {
      name: fileName || "Document_Upload.pdf",
      type: docType,
      date: "Just now",
      verified: true, // auto mock verify
    };
    setProVendorState((prev) => ({
      ...prev,
      uploadedDocuments: [...prev.uploadedDocuments, newDoc],
      verificationStatus: "verified",
    }));
    showToast(`${docType} uploaded and verified successfully!`, "success");
  };

  return (
    <MarketplaceContext.Provider
      value={{
        // Data
        professionals,
        filteredProfessionals,
        locations,
        isLoadingProfessionals,
        bookings,
        customerProfile,
        proVendorState,
        // Directory Filters (setters reset to page 1)
        searchQuery,
        setSearchQuery: setSearch,
        selectedCategory,
        setSelectedCategory: setCategory,
        selectedLocation,
        setSelectedLocation: setLocation,
        minRating,
        setMinRating: setRating,
        minExperience,
        setMinExperience: setExperience,
        priceRange,
        setPriceRange: setPrice,
        availabilityDay,
        setAvailabilityDay: setDay,
        availabilitySlot,
        setAvailabilitySlot: setSlot,
        sortBy,
        setSortBy: setSort,
        // Pagination
        page,
        pageSize: DEFAULT_PAGE_SIZE,
        total,
        setPage,
        // Modal Controls
        selectedPro,
        openProDetail,
        closeProDetail,
        bookingPro,
        bookingPreselectedService,
        startBooking,
        closeBooking,
        reviewBooking,
        setReviewBooking,
        isCustomerDashboardOpen,
        setIsCustomerDashboardOpen,
        isProDashboardOpen,
        setIsProDashboardOpen,
        // Actions
        createBooking,
        addBooking,
        cancelBooking,
        updateBookingStatus,
        submitReview,
        setCustomerProfile,
        requestPayout,
        uploadDocument,
      }}
    >
      {children}
    </MarketplaceContext.Provider>
  );
}

export function useMarketplace() {
  const context = useContext(MarketplaceContext);
  if (!context) {
    throw new Error("useMarketplace must be used within a MarketplaceProvider");
  }
  return context;
}

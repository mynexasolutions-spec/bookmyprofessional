"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

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
    location: "Berlin, Germany",
    experienceYears: 12,
    verified: true,
    hourlyRate: 50,
    price: 50,
    originalPrice: 65,
    unit: "session",
    responseTime: "< 30 mins",
    image: "/images/pro_doctor.jpg",
    bio: "Board-certified physician with 12+ years of clinical experience in Germany and the UK. Specializes in preventive healthcare, chronic illness management, general consultations, and wellness planning.",
    about:
      "Dr. Ayesha Khan graduated with honors from Charité – Universitätsmedizin Berlin and completed advanced residency in Internal Medicine. She provides compassionate, thorough telehealth and in-person medical consultations for patients of all ages.",
    credentials: [
      { title: "Medical License (Approbation)", issuer: "Landesamt für Gesundheit Berlin", year: "2012" },
      { title: "Doctor of Medicine (M.D.)", issuer: "Charité Berlin", year: "2011" },
      { title: "Certified Telehealth Practitioner", issuer: "European Health Board", year: "2019" },
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
        userName: "Elena Rossi",
        userAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80",
        rating: 5,
        date: "2 days ago",
        comment:
          "Dr. Khan is incredibly attentive and patient. She explained my diagnosis clearly and prescribed an effective treatment plan. Highly recommend!",
        verifiedBooking: true,
      },
      {
        id: "rev-2",
        userName: "Markus Becker",
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
    location: "Berlin, Germany",
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
      { title: "M.Sc. in Applied Mathematics", issuer: "Technical University of Munich", year: "2016" },
      { title: "Certified Advanced STEM Educator", issuer: "German Tutoring Guild", year: "2018" },
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
    location: "Berlin, Germany",
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
      "Fully certified under German DIN VDE standards with complete liability insurance. Ahmed handles everything from quick socket fixes to full residential electrical overhauls safely and punctually.",
    credentials: [
      { title: "Elektrotechnik Meisterbrief (Master Electrician)", issuer: "Handwerkskammer Berlin", year: "2014" },
      { title: "KNX Certified Smart Home Installer", issuer: "KNX Association", year: "2020" },
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
        userName: "Mark Thompson",
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
    location: "Berlin, Germany",
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
      { title: "Diploma in Professional Aesthetics & Makeup", issuer: "CIDESCO International", year: "2017" },
      { title: "Organic Skincare Specialist Certification", issuer: "Berlin Beauty Guild", year: "2019" },
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
        userName: "Sophia Müller",
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
    name: "Daniel Weber",
    role: "Master Plumber & Heating Engineer",
    category: "Plumbers",
    specialty: "Leak Repairs, Pipe Fitting & Boiler Maintenance",
    rating: 4.8,
    reviewCount: 74,
    location: "Berlin, Germany",
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
      { title: "Installateur- und Heizungsbauermeister", issuer: "Handwerkskammer Berlin", year: "2010" },
      { title: "Certified Gas & Water Safety Inspector", issuer: "DVGW Germany", year: "2015" },
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
        userName: "Fatima Al-Sayed",
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
    name: "Johannes Schmidt",
    role: "Senior IT Support & Cybersecurity Specialist",
    category: "IT Professionals",
    specialty: "Network Setup, Data Recovery & Hardware Fixes",
    rating: 4.9,
    reviewCount: 65,
    location: "Munich, Germany",
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
      { title: "B.Sc. in Computer Science", issuer: "TU Munich", year: "2015" },
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
        userName: "Lucas Meyer",
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
    name: "Clara Wagner",
    role: "Professional Home & Deep Cleaning Specialist",
    category: "Cleaners",
    specialty: "Eco-friendly Deep Clean, Move-in/out & Sanitize",
    rating: 4.8,
    reviewCount: 92,
    location: "Hamburg, Germany",
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
      { title: "Certified Professional Housekeeper", issuer: "German Cleaning Institute", year: "2018" },
      { title: "Hygiene & Sanitization Compliance Certificate", issuer: "Health Safety DE", year: "2021" },
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
        userName: "Anna Fischer",
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
    name: "Marc Richter",
    role: "Certified Business & Tax Consultant",
    category: "Consultants",
    specialty: "Freelancer Taxes, Business Plans & Legal Setup",
    rating: 4.9,
    reviewCount: 53,
    location: "Frankfurt, Germany",
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
      "Over 15 years advising in Frankfurt financial district. Fluent in German and English, offering actionable, step-by-step guidance tailored to German tax regulations.",
    credentials: [
      { title: "Master of Finance & Accounting", issuer: "Frankfurt School of Finance", year: "2009" },
      { title: "Certified Tax Advisory Professional", issuer: "Steuerberaterkammer Hessen", year: "2012" },
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
        userName: "Tobias Lang",
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
    address: "Friedrichstraße 45, 10117 Berlin",
    customerNotes: "Annual general checkup & routine blood test review.",
    customerName: "Alex Morgan",
    customerEmail: "alex.morgan@example.com",
    customerPhone: "+49 152 9876543",
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
    address: "Kastanienallee 12, 10435 Berlin",
    customerNotes: "Tripping breaker in the living room socket.",
    customerName: "Alex Morgan",
    customerEmail: "alex.morgan@example.com",
    customerPhone: "+49 152 9876543",
    status: "completed",
    paymentStatus: "paid",
    paymentMethod: "PayPal (alex@example.com)",
    createdAt: "2026-09-08T09:15:00Z",
    hasReview: true,
    reviewRating: 5,
    reviewText: "Quick diagnostic and repaired right away.",
  },
  {
    id: "BMP-91823",
    proId: "pro-2",
    proName: "Rohit Sharma",
    proRole: "Senior Mathematics & Physics Tutor",
    proAvatar: "/images/pro_tutor.jpg",
    serviceTitle: "1-on-1 High School Mathematics",
    servicePrice: 30,
    platformFee: 3.0,
    totalPaid: 30,
    date: "2026-09-24",
    timeSlot: "04:00 PM",
    address: "Schönhauser Allee 88, 10439 Berlin",
    customerNotes: "Preparing for upcoming physics midterm test.",
    customerName: "Elena Rossi",
    customerEmail: "elena.rossi@example.com",
    customerPhone: "+49 176 8812345",
    status: "upcoming",
    paymentStatus: "paid",
    paymentMethod: "Apple Pay",
    createdAt: "2026-09-17T11:20:00Z",
    hasReview: false,
  },
  {
    id: "BMP-60412",
    proId: "pro-4",
    proName: "Sara Khan",
    proRole: "Professional Salon & Aesthetician",
    proAvatar: "/images/pro_beautician.jpg",
    serviceTitle: "Bridal & Event Hair Styling",
    servicePrice: 65,
    platformFee: 4.5,
    totalPaid: 65,
    date: "2026-09-12",
    timeSlot: "11:00 AM",
    address: "Kurfürstendamm 182, 10707 Berlin",
    customerNotes: "Event hair styling for wedding evening.",
    customerName: "Tobias Lang",
    customerEmail: "tobias.lang@example.com",
    customerPhone: "+49 160 5543210",
    status: "completed",
    paymentStatus: "paid",
    paymentMethod: "Visa ending in •••• 8821",
    createdAt: "2026-09-09T16:00:00Z",
    hasReview: true,
    reviewRating: 5,
    reviewText: "Stunning look, lasted all evening! Highly recommended.",
  },
];

// Initial Customers Dataset
export const INITIAL_CUSTOMERS = [
  {
    id: "cust-1",
    name: "Alex Morgan",
    email: "alex.morgan@example.com",
    phone: "+49 152 9876543",
    city: "Berlin",
    joinedDate: "12 Jan 2024",
    totalBookings: 6,
    totalSpent: 320,
    status: "active",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
  },
  {
    id: "cust-2",
    name: "Elena Rossi",
    email: "elena.rossi@example.com",
    phone: "+49 176 8812345",
    city: "Munich",
    joinedDate: "05 Mar 2024",
    totalBookings: 4,
    totalSpent: 210,
    status: "active",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80",
  },
  {
    id: "cust-3",
    name: "Tobias Lang",
    email: "tobias.lang@example.com",
    phone: "+49 160 5543210",
    city: "Frankfurt",
    joinedDate: "18 Feb 2024",
    totalBookings: 9,
    totalSpent: 680,
    status: "active",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80",
  },
  {
    id: "cust-4",
    name: "Sophie Weber",
    email: "sophie.w@example.com",
    phone: "+49 151 2233445",
    city: "Hamburg",
    joinedDate: "22 Apr 2024",
    totalBookings: 2,
    totalSpent: 95,
    status: "suspended",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80",
  },
];

// Initial Categories & Catalog Dataset
export const INITIAL_CATEGORIES_DATA = [
  {
    id: "cat-1",
    name: "Doctors",
    title: "Doctors & Healthcare",
    icon: "Stethoscope",
    description: "Certified medical practitioners, teleconsultants, and wellness advisors.",
    proCount: 18,
    activeServices: 42,
    baseCommission: 10,
    status: "active",
  },
  {
    id: "cat-2",
    name: "Tutors",
    title: "Tutors & Academics",
    icon: "GraduationCap",
    description: "STEM instructors, language coaches, test preparation, and music teachers.",
    proCount: 32,
    activeServices: 65,
    baseCommission: 8,
    status: "active",
  },
  {
    id: "cat-3",
    name: "Electricians",
    title: "Certified Electricians",
    icon: "Zap",
    description: "Licensed master electricians, rewiring, breaker repair, and EV chargers.",
    proCount: 24,
    activeServices: 38,
    baseCommission: 12,
    status: "active",
  },
  {
    id: "cat-4",
    name: "Plumbers",
    title: "Expert Plumbers",
    icon: "Wrench",
    description: "Emergency pipe fixes, bathroom installation, heating systems, and drains.",
    proCount: 20,
    activeServices: 34,
    baseCommission: 12,
    status: "active",
  },
  {
    id: "cat-5",
    name: "Beauticians",
    title: "Beauticians & Salon",
    icon: "Sparkles",
    description: "Hair styling, makeup artists, skincare therapists, and bridal beauty.",
    proCount: 28,
    activeServices: 52,
    baseCommission: 10,
    status: "active",
  },
  {
    id: "cat-6",
    name: "Cleaners",
    title: "Cleaners & Maid Services",
    icon: "Home",
    description: "Deep home cleaning, office sanitization, move-in/out, and window care.",
    proCount: 35,
    activeServices: 40,
    baseCommission: 10,
    status: "active",
  },
  {
    id: "cat-7",
    name: "IT Professionals",
    title: "IT & Tech Support",
    icon: "Laptop",
    description: "Hardware diagnostics, WiFi networking, software setup, and data recovery.",
    proCount: 22,
    activeServices: 45,
    baseCommission: 12,
    status: "active",
  },
  {
    id: "cat-8",
    name: "Consultants",
    title: "Consultants & Tax",
    icon: "Briefcase",
    description: "Financial advisors, freelancer tax setup, legal consultation, and business plans.",
    proCount: 16,
    activeServices: 28,
    baseCommission: 15,
    status: "active",
  },
];

// Initial Pending Document Verifications Queue
export const INITIAL_PENDING_VERIFICATIONS = [
  {
    id: "verif-101",
    proId: "pro-5",
    proName: "Daniel Weber",
    proRole: "Certified Master Plumber",
    category: "Plumbers",
    docName: "German_Master_Plumber_Handwerkskarte_2024.pdf",
    docType: "Trade Master License (Handwerkskammer)",
    submittedDate: "Today, 09:40 AM",
    status: "pending",
    certificateNumber: "HWK-BLN-998241",
    issuer: "Handwerkskammer Berlin",
    previewUrl: "/images/cat_plumber.jpg",
  },
  {
    id: "verif-102",
    proId: "pro-6",
    proName: "Lukas Richter",
    proRole: "Senior IT Systems & Network Engineer",
    category: "IT Professionals",
    docName: "Cisco_CCNA_Enterprise_Network_Certificate.pdf",
    docType: "Technical Certification",
    submittedDate: "Yesterday, 03:15 PM",
    status: "pending",
    certificateNumber: "CSCO-1488921",
    issuer: "Cisco Systems Germany",
    previewUrl: "/images/cat_it_pro.jpg",
  },
  {
    id: "verif-103",
    proId: "pro-7",
    proName: "Clara Schumann",
    proRole: "Professional Housekeeper & Deep Cleaning Lead",
    category: "Cleaners",
    docName: "Police_Clearance_Fuehrungszeugnis_2024.pdf",
    docType: "Criminal Background Clearance",
    submittedDate: "2 days ago",
    status: "pending",
    certificateNumber: "BJR-FZ-2024-819",
    issuer: "Bundesamt für Justiz",
    previewUrl: "/images/cat_cleaner.jpg",
  },
];

// Initial Payout Requests Queue
export const INITIAL_PAYOUT_REQUESTS = [
  {
    id: "payout-req-1",
    proId: "pro-1",
    proName: "Dr. Ayesha Khan",
    category: "Doctors",
    amount: 665,
    method: "SEPA Bank Transfer (DE89 1005 0000 0123 4401 00)",
    bankName: "Berliner Sparkasse",
    requestedDate: "Today, 11:20 AM",
    status: "pending_approval",
  },
  {
    id: "payout-req-2",
    proId: "pro-3",
    proName: "Ahmed Ali",
    category: "Electricians",
    amount: 360,
    method: "SEPA Bank Transfer (DE44 2004 0000 0987 9921 00)",
    bankName: "Commerzbank AG",
    requestedDate: "Yesterday, 04:45 PM",
    status: "pending_approval",
  },
];

// Initial Platform Settings
export const INITIAL_PLATFORM_SETTINGS = {
  globalCommission: 10, // 10%
  escrowHoldHours: 24,
  minPayoutAmount: 50,
  autoVerification: false,
  supportHotline: "+49 (0) 30 8920 4400",
  payoutProcessingDays: "1-2 Business Days",
  categoryCommissions: {
    Doctors: 10,
    Tutors: 8,
    Electricians: 12,
    Plumbers: 12,
    Beauticians: 10,
    Cleaners: 10,
    "IT Professionals": 12,
    Consultants: 15,
  },
};

export function MarketplaceProvider({ children }) {
  const { user, showToast } = useAuth();

  // Master State
  const [professionals, setProfessionals] = useState(INITIAL_PROFESSIONALS);
  const [bookings, setBookings] = useState(INITIAL_BOOKINGS);

  // Directory Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [minRating, setMinRating] = useState(0);
  const [priceRange, setPriceRange] = useState("all"); // "all" | "under-40" | "40-70" | "above-70"
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
    phone: "+49 152 9876543",
    address: "Friedrichstraße 45",
    city: "Berlin",
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

  // Admin States
  const [customers, setCustomers] = useState(INITIAL_CUSTOMERS);
  const [categoriesList, setCategoriesList] = useState(INITIAL_CATEGORIES_DATA);
  const [pendingVerifications, setPendingVerifications] = useState(INITIAL_PENDING_VERIFICATIONS);
  const [payoutRequests, setPayoutRequests] = useState(INITIAL_PAYOUT_REQUESTS);
  const [platformSettings, setPlatformSettings] = useState(INITIAL_PLATFORM_SETTINGS);

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

  // Create new booking after payment
  const createBooking = (bookingData) => {
    const bookingId = `BMP-${Math.floor(10000 + Math.random() * 90000)}`;
    const newBooking = {
      id: bookingId,
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

    setBookings((prev) => [newBooking, ...prev]);

    // Update Pro Earnings
    setProVendorState((prev) => {
      const addedGross = bookingData.service.price;
      const commission = addedGross * (platformSettings.globalCommission / 100);
      const net = addedGross - commission;
      return {
        ...prev,
        totalGrossEarnings: prev.totalGrossEarnings + addedGross,
        availablePayout: prev.availablePayout + net,
      };
    });

    showToast(`Booking ${bookingId} confirmed! Check 'My Bookings' for details.`, "success");
    return newBooking;
  };

  // Cancel Booking
  const cancelBooking = (bookingId) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: "cancelled", paymentStatus: "refunded" } : b))
    );
    showToast(`Booking ${bookingId} has been cancelled and refunded to your original payment method.`, "info");
  };

  // Pro marks status (e.g. In-progress or Completed)
  const updateBookingStatus = (bookingId, newStatus) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b))
    );
    showToast(`Booking status updated to ${newStatus.replace("_", " ")}.`, "success");
  };

  // Submit Rating & Review
  const submitReview = (bookingId, proId, rating, comment, breakdown = {}) => {
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

    // 2. Append review to professional
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

    setReviewBooking(null);
    showToast("Thank you! Your verified review has been published.", "success");
  };

  // Request Payout
  const requestPayout = (amount) => {
    if (amount > proVendorState.availablePayout) {
      showToast("Requested amount exceeds available balance.", "error");
      return false;
    }
    const newPayout = {
      id: `PAY-${Math.floor(100 + Math.random() * 900)}`,
      date: "Just now",
      amount: parseFloat(amount),
      status: "Processing (1-2 business days)",
      method: "SEPA Bank (DE89...4401)",
    };

    setProVendorState((prev) => ({
      ...prev,
      paidOutAmount: prev.paidOutAmount + parseFloat(amount),
      availablePayout: prev.availablePayout - parseFloat(amount),
      payoutHistory: [newPayout, ...prev.payoutHistory],
    }));

    showToast(`Payout request of €${amount} submitted successfully!`, "success");
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

  // ================= ADMIN FUNCTIONS =================

  // 1. Customer Management
  const updateCustomerStatus = (customerId, newStatus) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === customerId ? { ...c, status: newStatus } : c))
    );
    showToast(`Customer account status changed to ${newStatus.toUpperCase()}.`, "success");
  };

  // 2. Professional / Vendor Management
  const updateProStatus = (proId, verifiedStatus, activeStatus = "active") => {
    setProfessionals((prev) =>
      prev.map((p) => (p.id === proId ? { ...p, verified: verifiedStatus, status: activeStatus } : p))
    );
    showToast(`Professional status updated successfully.`, "success");
  };

  // 3. Document Verification Approval
  const approveDocumentVerification = (docId, proId) => {
    setPendingVerifications((prev) => prev.filter((v) => v.id !== docId));
    setProfessionals((prev) =>
      prev.map((p) => (p.id === proId ? { ...p, verified: true } : p))
    );
    showToast(`Document approved! Verified badge granted to professional.`, "success");
  };

  // 4. Document Verification Rejection
  const rejectDocumentVerification = (docId, proId, reason = "Unclear document scan") => {
    setPendingVerifications((prev) => prev.filter((v) => v.id !== docId));
    showToast(`Document rejected. Feedback sent to vendor: "${reason}"`, "info");
  };

  // 5. Category Management
  const addCategory = (categoryData) => {
    const newCat = {
      id: `cat-${Date.now()}`,
      name: categoryData.name,
      title: categoryData.title || categoryData.name,
      icon: categoryData.icon || "Sparkles",
      description: categoryData.description || "Certified service category.",
      proCount: 0,
      activeServices: 0,
      baseCommission: categoryData.baseCommission || platformSettings.globalCommission,
      status: "active",
    };
    setCategoriesList((prev) => [...prev, newCat]);
    showToast(`Category "${newCat.title}" created successfully!`, "success");
  };

  const updateCategory = (catId, updatedData) => {
    setCategoriesList((prev) =>
      prev.map((c) => (c.id === catId ? { ...c, ...updatedData } : c))
    );
    showToast(`Category updated successfully.`, "success");
  };

  const deleteCategory = (catId) => {
    setCategoriesList((prev) => prev.filter((c) => c.id !== catId));
    showToast(`Category removed from catalog.`, "info");
  };

  // 6. Booking Management Override
  const adminOverrideBooking = (bookingId, newStatus, shouldRefund = false) => {
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === bookingId) {
          return {
            ...b,
            status: newStatus,
            paymentStatus: shouldRefund ? "refunded" : b.paymentStatus,
          };
        }
        return b;
      })
    );
    showToast(
      `Booking ${bookingId} overridden to ${newStatus.toUpperCase()}${shouldRefund ? " and Escrow Refunded" : ""}.`,
      "success"
    );
  };

  // 7. Commission Settings
  const updatePlatformCommission = (globalRate, categoryOverrides = {}) => {
    setPlatformSettings((prev) => ({
      ...prev,
      globalCommission: parseFloat(globalRate),
      categoryCommissions: {
        ...prev.categoryCommissions,
        ...categoryOverrides,
      },
    }));
    showToast(`Platform commission updated to ${globalRate}%.`, "success");
  };

  // 8. Review Moderation
  const moderateReview = (proId, reviewId, action, adminReply = "") => {
    setProfessionals((prev) =>
      prev.map((p) => {
        if (p.id === proId) {
          let updatedReviews = [...p.reviews];
          if (action === "delete") {
            updatedReviews = updatedReviews.filter((r) => r.id !== reviewId);
          } else if (action === "flag") {
            updatedReviews = updatedReviews.map((r) =>
              r.id === reviewId ? { ...r, flagged: true } : r
            );
          } else if (action === "approve") {
            updatedReviews = updatedReviews.map((r) =>
              r.id === reviewId ? { ...r, flagged: false, approved: true } : r
            );
          } else if (action === "reply") {
            updatedReviews = updatedReviews.map((r) =>
              r.id === reviewId ? { ...r, adminReply } : r
            );
          }
          const avg =
            updatedReviews.length > 0
              ? (updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length).toFixed(1)
              : 5.0;

          return {
            ...p,
            rating: parseFloat(avg),
            reviewCount: updatedReviews.length,
            reviews: updatedReviews,
          };
        }
        return p;
      })
    );
    showToast(`Review action "${action}" completed.`, "success");
  };

  // 9. Vendor Payout Authorization
  const approveVendorPayout = (payoutId) => {
    setPayoutRequests((prev) => prev.filter((p) => p.id !== payoutId));
    showToast(`SEPA Payout ${payoutId} approved and transferred successfully.`, "success");
  };

  // 10. Reports Exporter
  const exportReport = (reportType) => {
    showToast(`Exporting ${reportType.replace("_", " ").toUpperCase()} report... Download ready!`, "success");
  };

  // Filtered Professionals Computation
  const filteredProfessionals = professionals
    .filter((pro) => {
      // Search text matches name, role, category, specialty, bio
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = pro.name.toLowerCase().includes(q);
        const matchesRole = pro.role.toLowerCase().includes(q);
        const matchesCategory = pro.category.toLowerCase().includes(q);
        const matchesSpecialty = pro.specialty?.toLowerCase().includes(q);
        const matchesLocation = pro.location.toLowerCase().includes(q);
        if (!matchesName && !matchesRole && !matchesCategory && !matchesSpecialty && !matchesLocation) {
          return false;
        }
      }

      // Category filter
      if (selectedCategory !== "all") {
        if (pro.category.toLowerCase() !== selectedCategory.toLowerCase()) {
          return false;
        }
      }

      // Location filter
      if (selectedLocation !== "all") {
        if (!pro.location.toLowerCase().includes(selectedLocation.toLowerCase())) {
          return false;
        }
      }

      // Min Rating
      if (minRating > 0 && pro.rating < minRating) {
        return false;
      }

      // Price Range
      if (priceRange === "under-40" && pro.price >= 40) return false;
      if (priceRange === "40-70" && (pro.price < 40 || pro.price > 70)) return false;
      if (priceRange === "above-70" && pro.price <= 70) return false;

      return true;
    })
    .sort((a, b) => {
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      if (sortBy === "reviews") return b.reviewCount - a.reviewCount;
      return 0; // featured default
    });

  return (
    <MarketplaceContext.Provider
      value={{
        // Data
        professionals,
        filteredProfessionals,
        bookings,
        customerProfile,
        proVendorState,
        // Admin Datasets
        customers,
        categoriesList,
        pendingVerifications,
        payoutRequests,
        platformSettings,
        // Directory Filters
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        selectedLocation,
        setSelectedLocation,
        minRating,
        setMinRating,
        priceRange,
        setPriceRange,
        sortBy,
        setSortBy,
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
        // Customer & Pro Actions
        createBooking,
        cancelBooking,
        updateBookingStatus,
        submitReview,
        setCustomerProfile,
        requestPayout,
        uploadDocument,
        // Admin Actions
        updateCustomerStatus,
        updateProStatus,
        approveDocumentVerification,
        rejectDocumentVerification,
        addCategory,
        updateCategory,
        deleteCategory,
        adminOverrideBooking,
        updatePlatformCommission,
        moderateReview,
        approveVendorPayout,
        exportReport,
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

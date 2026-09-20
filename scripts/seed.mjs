import { createClient } from "@supabase/supabase-js";
import { randomBytes } from "node:crypto";

const DEMO_DOMAIN = "bmp-demo.com";

const PROS = [
  {
    name: "Dr. Ayesha Khan",
    role: "General Physician & Consultant",
    category: "Doctors",
    specialty: "Internal Medicine & Family Health",
    rating: 4.9,
    reviewCount: 128,
    location: "Mumbai, India",
    experienceYears: 12,
    hourlyRate: 50,
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
        title: "Standard Health Consultation",
        description: "Comprehensive 30-minute health evaluation, symptom review, and medical advice.",
        price: 50,
        duration: "30 mins",
      },
      {
        title: "Extended Diagnostic & Prescription Review",
        description: "In-depth 60-minute review of lab results, ongoing treatments, and chronic illness plan.",
        price: 85,
        duration: "60 mins",
      },
      {
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
  },
  {
    name: "Rohit Sharma",
    role: "Senior Mathematics & Physics Tutor",
    category: "Tutors",
    specialty: "High School, SAT/AP & University Calculus",
    rating: 4.8,
    reviewCount: 98,
    location: "Mumbai, India",
    experienceYears: 8,
    hourlyRate: 30,
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
        title: "1-on-1 High School Mathematics",
        description: "Targeted problem solving, exam prep, and concept clarity for Algebra/Geometry/Calculus.",
        price: 30,
        duration: "60 mins",
      },
      {
        title: "Intensive Exam & Test Preparation (SAT / AP)",
        description: "Focused strategy sessions, past paper walkthroughs, and time management techniques.",
        price: 45,
        duration: "90 mins",
      },
      {
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
  },
  {
    name: "Ahmed Ali",
    role: "Master Electrician & Smart Home Specialist",
    category: "Electricians",
    specialty: "Wiring, Fuse Box, Solar & EV Charger Installs",
    rating: 4.7,
    reviewCount: 86,
    location: "Mumbai, India",
    experienceYears: 10,
    hourlyRate: 40,
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
        title: "Electrical Inspection & Fault Diagnosis",
        description: "Emergency circuit check, tripping fuse troubleshooting, and safety certification.",
        price: 40,
        duration: "60 mins",
      },
      {
        title: "Light Fixture & Appliance Installation",
        description: "Installation of ceiling fans, pendant lights, oven/cooktop connections, and smart switches.",
        price: 60,
        duration: "90 mins",
      },
      {
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
  },
  {
    name: "Sara Khan",
    role: "Certified Beautician & Skin Specialist",
    category: "Beauticians",
    specialty: "Bridal Makeup, Facials & Hair Styling",
    rating: 4.9,
    reviewCount: 112,
    location: "Mumbai, India",
    experienceYears: 7,
    hourlyRate: 35,
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
        title: "Hydrating Facial & Skin Rejuvenation",
        description: "Deep pore cleansing, exfoliation, herbal steam, and collagen mask.",
        price: 35,
        duration: "45 mins",
      },
      {
        title: "Glam Party & Event Makeup",
        description: "Full face HD makeup including false lash application and contouring.",
        price: 65,
        duration: "60 mins",
      },
      {
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
  },
  {
    name: "Ramesh Kumar",
    role: "Master Plumber & Heating Engineer",
    category: "Plumbers",
    specialty: "Leak Repairs, Pipe Fitting & Boiler Maintenance",
    rating: 4.8,
    reviewCount: 74,
    location: "Mumbai, India",
    experienceYears: 14,
    hourlyRate: 45,
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
        title: "Emergency Pipe Leak Repair & Tap Fixing",
        description: "Rapid leak detection, pipe sealing, tap washer/cartridge replacement.",
        price: 45,
        duration: "60 mins",
      },
      {
        title: "Clogged Drain & Sewer Line Jetting",
        description: "High-pressure clearing of blocked kitchen/bathroom drains and waste pipes.",
        price: 75,
        duration: "75 mins",
      },
      {
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
  },
  {
    name: "Arjun Mehta",
    role: "Senior IT Support & Cybersecurity Specialist",
    category: "IT Professionals",
    specialty: "Network Setup, Data Recovery & Hardware Fixes",
    rating: 4.9,
    reviewCount: 65,
    location: "Delhi, India",
    experienceYears: 9,
    hourlyRate: 55,
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
        title: "PC/Mac Diagnostic & Virus Removal",
        description: "Full system optimization, malware scan, OS repair, and hardware test.",
        price: 55,
        duration: "60 mins",
      },
      {
        title: "Home Office Wi-Fi Mesh & Network Setup",
        description: "Coverage mapping, router security hardening, and high-speed network setup.",
        price: 80,
        duration: "90 mins",
      },
      {
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
  },
  {
    name: "Priya Nair",
    role: "Professional Home & Deep Cleaning Specialist",
    category: "Cleaners",
    specialty: "Eco-friendly Deep Clean, Move-in/out & Sanitize",
    rating: 4.8,
    reviewCount: 92,
    location: "Bangalore, India",
    experienceYears: 6,
    hourlyRate: 28,
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
        title: "Standard Residential Maintenance Clean",
        description: "Dusting, vacuuming, mopping, bathroom disinfection, and kitchen wipe-down.",
        price: 28,
        duration: "60 mins",
      },
      {
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
  },
  {
    name: "Vikram Desai",
    role: "Certified Business & Tax Consultant",
    category: "Consultants",
    specialty: "Freelancer Taxes, Business Plans & Legal Setup",
    rating: 4.9,
    reviewCount: 53,
    location: "Hyderabad, India",
    experienceYears: 15,
    hourlyRate: 70,
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
        title: "Freelancer Tax & Registration Strategy",
        description: "Finanzamt setup, Kleinunternehmerregelung analysis, and deductible expenses.",
        price: 70,
        duration: "45 mins",
      },
      {
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
  },
];

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });
const RESET = process.argv.includes("--reset");

function emailFor(name) {
  return `${name
    .replace(/^Dr\.\s+/i, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ".")}@${DEMO_DOMAIN}`;
}

function cityOf(location) {
  return String(location || "").replace(/,\s*India\s*$/i, "").trim();
}

// ponytail: one page of 1000 covers a demo seed; paginate if the auth user count grows past it.
async function listAllUsers() {
  const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error) throw error;
  return data?.users || [];
}

async function resetDemo() {
  const demo = (await listAllUsers()).filter((u) =>
    u.email?.toLowerCase().endsWith(`@${DEMO_DOMAIN}`)
  );
  for (const u of demo) {
    const { error } = await supabase.auth.admin.deleteUser(u.id);
    if (error) throw error;
  }
  return demo.length;
}

async function ensureUser(pro, password) {
  const email = emailFor(pro.name);
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: pro.name, role: "professional" },
  });
  if (!error) return { id: data.user.id, created: true, email };

  const existing = (await listAllUsers()).find(
    (u) => u.email?.toLowerCase() === email.toLowerCase()
  );
  if (!existing) throw error;
  return { id: existing.id, created: false, email };
}

async function seedPro(pro, index, locMap, password) {
  const { id, created, email } = await ensureUser(pro, password);
  const city = cityOf(pro.location);
  const loc = locMap[city.toLowerCase()] || {};
  const phone = `+91 98200 0${String(index + 1).padStart(4, "0")}`;

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ full_name: pro.name, phone, city, role: "professional" })
    .eq("id", id);
  if (profileError) throw profileError;

  const { error: proError } = await supabase.from("professionals").upsert(
    {
      id,
      name: pro.name,
      role_title: pro.role,
      category: pro.category,
      specialty: pro.specialty,
      bio: pro.bio,
      about: pro.about,
      city,
      latitude: loc.latitude ?? null,
      longitude: loc.longitude ?? null,
      experience_years: pro.experienceYears,
      hourly_rate: pro.hourlyRate,
      unit: pro.unit,
      response_time: pro.responseTime,
      image_url: pro.image,
      verified: true,
      verification_status: "approved",
      // Rating/review_count are intentionally NOT seeded — they are derived from real review rows
      // (DB trigger refresh_pro_rating). Seeding them fabricated a count that never matched the
      // reviews list. The `rating`/`reviewCount` fields above are now descriptive only.
      availability: pro.availability,
      is_active: true,
    },
    { onConflict: "id" }
  );
  if (proError) throw proError;

  const { error: delSvcError } = await supabase
    .from("services")
    .delete()
    .eq("professional_id", id);
  if (delSvcError) throw delSvcError;
  const { error: insSvcError } = await supabase.from("services").insert(
    pro.services.map((s, i) => ({
      professional_id: id,
      title: s.title,
      description: s.description,
      price: s.price,
      duration: s.duration,
      sort: i,
    }))
  );
  if (insSvcError) throw insSvcError;

  const { error: delCredError } = await supabase
    .from("credentials")
    .delete()
    .eq("professional_id", id);
  if (delCredError) throw delCredError;
  const { error: insCredError } = await supabase.from("credentials").insert(
    pro.credentials.map((c) => ({
      professional_id: id,
      title: c.title,
      issuer: c.issuer,
      year: c.year,
    }))
  );
  if (insCredError) throw insCredError;

  return {
    id,
    email,
    created,
    services: pro.services.length,
    credentials: pro.credentials.length,
  };
}

async function main() {
  if (RESET) {
    const removed = await resetDemo();
    console.log(`--reset: removed ${removed} demo auth user(s) and their cascaded rows`);
  }

  const { data: locations, error: locError } = await supabase
    .from("locations")
    .select("city, latitude, longitude");
  if (locError) throw locError;
  const locMap = {};
  (locations || []).forEach((l) => {
    locMap[String(l.city).toLowerCase()] = l;
  });

  const password = `Bmp-${randomBytes(12).toString("base64url")}`;
  const emails = [];
  let createdCount = 0;

  for (let i = 0; i < PROS.length; i++) {
    const res = await seedPro(PROS[i], i, locMap, password);
    if (res.created) createdCount++;
    emails.push(res.email);
    console.log(
      `✓ ${res.email} [${res.created ? "created" : "reused"}] pro=${res.id.slice(0, 8)} ` +
        `services=${res.services} credentials=${res.credentials}`
    );
  }

  console.log(
    `\nSeeded ${PROS.length} professionals (${createdCount} new auth user${createdCount === 1 ? "" : "s"}).`
  );
  console.log(`Demo password: ${password}`);
  console.log(`Emails: ${emails.join(", ")}`);
}

main().catch((err) => {
  console.error("Seed failed:", err?.message || err);
  process.exit(1);
});

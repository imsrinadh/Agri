import React, { useState, useMemo } from 'react';
import {
  ShieldCheck, AlertCircle, FileText, CheckSquare, Clock,
  ExternalLink, PhoneCall, ChevronRight, Landmark, AlertTriangle,
  BookOpen, Search, CheckCircle2, ArrowUpRight, HelpCircle,
  Sprout, Droplets, Wrench, IndianRupee, Eye, RefreshCw, Check
} from 'lucide-react';

const SCHEMES = [
  {
    id: 'pmfby',
    name: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
    shortName: 'PMFBY Crop Insurance',
    ministry: 'Ministry of Agriculture & Farmers Welfare, Govt. of India',
    tagline: 'Comprehensive yield loss and localized calamity crop insurance coverage',
    category: 'Crop Loss & Insurance',
    categoryKey: 'insurance',
    badge: 'Flagship Crop Safety',
    premiumRates: 'Kharif: 2.0% | Rabi: 1.5% | Commercial / Horticulture: 5.0% (Balance subsidized by Govt)',
    coverage: [
      'Prevented Sowing / Planting Risk due to deficit rainfall or adverse seasonal conditions',
      'Standing Crop Loss (Yield deficit compared against historical threshold yield at Panchayat level)',
      'Localized Calamities (Hailstorm, Landslide, Inundation, Cloud burst, Natural fire)',
      'Post-Harvest Losses (Up to 14 days for crops dried in cut/spread condition against unseasonal rain)'
    ],
    eligibility: [
      'All farmers growing notified crops in notified areas (both loanee and non-loanee cultivators)',
      'Sharecroppers, oral lessees, and tenant farmers with self-declaration / sowing certificate',
      'Active bank account seeded with Aadhaar for Direct Benefit Transfer (DBT) is mandatory'
    ],
    onlineSteps: [
      'Step 1: Open official portal at pmfby.gov.in and click "Farmer Corner" -> "Apply for Crop Insurance by Yourself".',
      'Step 2: Enter your Mobile Number, verify with OTP, and enter your Aadhaar details.',
      'Step 3: Enter Bank Account Details (IFSC Code, Account Number) linked with your Aadhaar.',
      'Step 4: Select State, District, Sub-District, Village, Crop Name, Sowing Date, and Survey / Khasra number.',
      'Step 5: Upload clean scans of Land Record (RoR / 7-12 / Khasra-Khatauni) and Sowing Certificate from Patwari.',
      'Step 6: Pay the subsidized farmer premium (1.5% - 2%) via UPI, NetBanking, or Debit Card.',
      'Step 7: Download and save the official 14-digit Application / Policy Number for tracking.'
    ],
    offlineSteps: [
      'Step 1: Visit your nearest Common Service Centre (CSC) or commercial/rural bank branch.',
      'Step 2: Carry physical copies of Aadhaar, Bank Passbook, Land RoR, and Sowing Declaration.',
      'Step 3: The CSC Village Level Entrepreneur (VLE) or Bank Officer will submit your form on the National Crop Insurance Portal (NCIP).',
      'Step 4: Collect the printed official stamped acknowledgement slip with Policy Number.'
    ],
    trackingGuide: {
      steps: [
        'Visit the official tracking page at pmfby.gov.in',
        'Click on the "Application Status" button on the homepage',
        'Enter your 14-digit Receipt / Policy Number and the Captcha code',
        'Click "Check Status" to see if your policy is Approved, Under Verification, or Claim Settled'
      ],
      trackingUrl: 'https://pmfby.gov.in/',
      buttonLabel: 'Track PMFBY Policy Status'
    },
    documents: [
      'Aadhaar Card (Identity & e-KYC proof)',
      'Bank Account Passbook (Showing IFSC, Account Number, and active NPCI mapping)',
      'Land Records (Record of Rights / RoR / Khasra-Khatauni / 7-12 / Patta)',
      'Sowing Certificate / Crop Sowing Self-Declaration (issued by Patwari / Village Agriculture Assistant)',
      'Tenancy Agreement / Self-Declaration (Mandatory only for tenant/sharecropper farmers)'
    ],
    deadlines: 'Kharif Cutoff: 31st July | Rabi Cutoff: 31st December (or state-notified date)',
    claimProcess: 'For localized damage (hailstorm, flood, inundation), report within 72 hours via Crop Insurance Mobile App or Toll-Free 14447.',
    officialUrl: 'https://pmfby.gov.in/',
    directApplyUrl: 'https://pmfby.gov.in/farmerRegistrationForm',
    helpline: '14447',
    helplineText: '14447 (National Farmer Toll-Free Helpline)'
  },
  {
    id: 'pmkisan',
    name: 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)',
    shortName: 'PM-KISAN Income Support',
    ministry: 'Ministry of Agriculture & Farmers Welfare, Govt. of India',
    tagline: 'Guaranteed direct income support of ₹6,000 per year directly to bank accounts',
    category: 'Direct Income Support',
    categoryKey: 'income',
    badge: '100% Central Funded',
    premiumRates: 'Zero Cost / 100% Free Financial Grant by Central Government',
    coverage: [
      'Direct financial support of ₹6,000 annually payable in three equal installments of ₹2,000 each 4 months',
      'Direct Benefit Transfer (DBT) directly into farmer bank account via PFMS/NPCI pipeline'
    ],
    eligibility: [
      'All landholding farmer families with cultivable landholding in their names',
      'Exclusions: Institutional landholders, serving/retired government officers, income tax payees, and professionals'
    ],
    onlineSteps: [
      'Step 1: Open official portal at pmkisan.gov.in and click "New Farmer Registration".',
      'Step 2: Select "Rural Farmer" or "Urban Farmer", enter your Aadhaar Number and Mobile Number.',
      'Step 3: Select State, enter Captcha, and click "Send OTP". Verify with OTP received on phone.',
      'Step 4: Fill State, District, Sub-District, Block, and Village name.',
      'Step 5: Fill Land Details: Land Registration ID, Survey/Khata Number, Khasra Number, and Area in Hectares.',
      'Step 6: Upload PDF copy of updated Land Mutation / RoR document and click "Save".',
      'Step 7: Complete mandatory e-KYC using OTP or biometric at CSC to activate installment transfers.'
    ],
    offlineSteps: [
      'Step 1: Visit your local Panchayat Office, Patwari, or Common Service Centre (CSC).',
      'Step 2: Submit filled PM-KISAN application along with copy of Aadhaar, Bank Passbook, and Land Mutation.',
      'Step 3: The State Nodal Agriculture Officer verifies land eligibility on the revenue portal and approves name.'
    ],
    trackingGuide: {
      steps: [
        'Visit the official status portal at pmkisan.gov.in',
        'Click on "Know Your Status" under Farmers Corner',
        'Enter your PM-KISAN Registration Number (or search by Mobile/Aadhaar number)',
        'Enter Captcha and click "Get Data" to view installment dates, FTO generated status, and payment bank'
      ],
      trackingUrl: 'https://pmkisan.gov.in/BeneficiaryStatus_New.aspx',
      buttonLabel: 'Track PM-KISAN Installment Status'
    },
    documents: [
      'Aadhaar Card (Must have active mobile linking for OTP e-KYC)',
      'Bank Account Passbook (Must be seeded with Aadhaar on NPCI mapping)',
      'Updated Land Ownership Records / Mutation Certificate (in applicant name)'
    ],
    deadlines: 'Continuous rolling enrollment throughout the entire year',
    claimProcess: 'Direct DBT credit every 4 months upon state revenue verification and active e-KYC.',
    officialUrl: 'https://pmkisan.gov.in/',
    directApplyUrl: 'https://pmkisan.gov.in/RegistrationFormNew.aspx',
    helpline: '155261',
    helplineText: '155261 / 1800-115-526 (Toll Free PM-KISAN Helpdesk)'
  },
  {
    id: 'kcc',
    name: 'Kisan Credit Card (KCC) & Interest Subvention Scheme (ISS)',
    shortName: 'KCC Agricultural Credit',
    ministry: 'Ministry of Finance & RBI / NABARD',
    tagline: 'Affordable, timely institutional credit for crop cultivation and farm inputs at 4% interest',
    category: 'Credit & Loans',
    categoryKey: 'credit',
    badge: 'Low 4% Interest',
    premiumRates: 'Effective 4.0% p.a. (7% base rate minus 3% Prompt Repayment Incentive by Govt)',
    coverage: [
      'Short-term crop production credit for seeds, fertilizers, pesticides, diesel, and labor',
      'Post-harvest expenses, family consumption requirements, and maintenance of farm equipment',
      'Working capital credit for animal husbandry, dairy, poultry, and fisheries'
    ],
    eligibility: [
      'All individual farmers, joint borrowers, and owner cultivators',
      'Tenant farmers, oral lessees, sharecroppers, and Self Help Groups (SHGs) / Joint Liability Groups (JLGs)'
    ],
    onlineSteps: [
      'Step 1: Open the official National Credit Portal at jansamarth.in/kisan-credit-card-scheme.',
      'Step 2: Click "Check Eligibility" and answer basic details about your land acreage and cultivated crops.',
      'Step 3: Select your preferred commercial bank, Regional Rural Bank (RRB), or Cooperative bank.',
      'Step 4: Complete Digital Identity verification using Aadhaar and mobile OTP.',
      'Step 5: Upload your land record (RoR / Khatauni) and declare current cropping pattern.',
      'Step 6: Receive In-Principle Approval letter with assigned credit limit within 3-5 working days.',
      'Step 7: Visit the branch with original land documents to collect your RuPay Kisan Credit Card.'
    ],
    offlineSteps: [
      'Step 1: Download one-page KCC form from agricoop.nic.in or collect from any commercial bank branch.',
      'Step 2: Fill in personal details, land survey numbers, and crop sown.',
      'Step 3: Submit with copy of Aadhaar, voter ID, and certified land records.',
      'Step 4: Bank issues card within 14 days as mandated under RBI guidelines.'
    ],
    trackingGuide: {
      steps: [
        'Visit jansamarth.in and log in with your registered mobile number',
        'Go to "My Applications" to track bank sanction status',
        'Contact your local branch with your application reference ID for card dispatch status'
      ],
      trackingUrl: 'https://www.jansamarth.in/track-application',
      buttonLabel: 'Track KCC Application Status'
    },
    documents: [
      'Duly completed KCC Application Form',
      'Identity & Address Proof (Aadhaar Card / Voter ID / Driving License)',
      'Land Revenue Document (Certified copy of RoR / Khatauni / Patta)',
      'Cropping Pattern Declaration certified by local revenue/agriculture officer'
    ],
    deadlines: 'Available year-round across all banking institutions',
    claimProcess: 'Revolving credit facility valid for 5 years with annual renewal based on timely repayment.',
    officialUrl: 'https://www.jansamarth.in/kisan-credit-card-scheme',
    directApplyUrl: 'https://www.jansamarth.in/apply/kcc',
    helpline: '1800112211',
    helplineText: '1800-11-22-11 (KCC National Banking Helpline)'
  },
  {
    id: 'pmksy',
    name: 'Pradhan Mantri Krishi Sinchayee Yojana (PMKSY) - Per Drop More Crop',
    shortName: 'PMKSY Micro-Irrigation',
    ministry: 'Ministry of Agriculture & Farmers Welfare, Govt. of India',
    tagline: '55% Government subsidy for installing precision Drip and Sprinkler irrigation systems',
    category: 'Irrigation & Machinery',
    categoryKey: 'irrigation',
    badge: 'Up to 55% Subsidy',
    premiumRates: '55% Subsidy for Small & Marginal Farmers | 45% Subsidy for other farmers',
    coverage: [
      'Financial subsidy on purchase and installation of Drip Irrigation and Micro-Sprinkler units',
      'Water conservation infrastructure, farm ponds, and secondary storage structures',
      'Energy-efficient solar and electric pump irrigation connectivity'
    ],
    eligibility: [
      'All farmers having assured water source (borewell, open well, canal, or farm pond)',
      'Must own or lease cultivable land suitable for micro-irrigation layout'
    ],
    onlineSteps: [
      'Step 1: Open the national portal at pmksy.gov.in or your State Micro-Irrigation Portal (e.g. MahaDBT, APMIP, TSMIP, Upagriculture).',
      'Step 2: Register as a Farmer using Aadhaar and mobile number.',
      'Step 3: Select your land survey number and choose irrigation type (Drip or Sprinkler) and manufacturer.',
      'Step 4: Upload Land Records (7-12 / RoR), Water Source Proof, and Bank Passbook.',
      'Step 5: District Horticulture / Agriculture Officer conducts pre-sanction field survey to estimate pipeline layout.',
      'Step 6: Administrative approval issued; farmer pays only beneficiary share (45–55% covered by Govt subsidy).',
      'Step 7: System installed; GPS-tagged post-inspection completed; subsidy released directly to firm/farmer.'
    ],
    offlineSteps: [
      'Step 1: Visit your District Horticulture Officer (DHO) or Block Assistant Director of Horticulture.',
      'Step 2: Submit physical application with land patta and water source declaration.',
      'Step 3: Department registers your application on the state MIS pipeline.'
    ],
    trackingGuide: {
      steps: [
        'Visit your state micro-irrigation portal or pmksy.gov.in/mis',
        'Enter your Farmer Registration ID or Aadhaar Number',
        'View inspection status, administrative sanction, and subsidy release voucher'
      ],
      trackingUrl: 'https://pmksy.gov.in/mis/',
      buttonLabel: 'Track PMKSY Subsidy Status'
    },
    documents: [
      'Aadhaar Card and Passport Photo',
      'Land Record (RoR / 7-12 / Khasra showing land ownership)',
      'Water Source Proof (Electricity bill of pump set / certificate from village officer)',
      'Soil & Water Test Report (Optional, available via Soil Health Card)'
    ],
    deadlines: 'Seasonal application windows as notified by State Horticulture Departments',
    claimProcess: 'Direct subsidy settlement to authorized equipment vendor following geo-tagged field verification.',
    officialUrl: 'https://pmksy.gov.in/',
    directApplyUrl: 'https://pmksy.gov.in/mis/',
    helpline: '18001801551',
    helplineText: '1800-180-1551 (Kisan Call Centre)'
  },
  {
    id: 'soilhealth',
    name: 'Soil Health Card (SHC) Scheme',
    shortName: 'Soil Health Card',
    ministry: 'Department of Agriculture & Cooperation, Govt. of India',
    tagline: 'Free testing of 12 soil parameters with customized chemical and organic fertilizer recommendations',
    category: 'Soil & Organic',
    categoryKey: 'soil',
    badge: '100% Free Testing',
    premiumRates: '100% Free / Funded by Central Government every 2 years for all farm plots',
    coverage: [
      'Scientific analysis of 12 chemical parameters: N, P, K, S, Zn, Fe, Cu, Mn, Bo, pH, EC, and Organic Carbon',
      'Customized dosage advisory for major crops to reduce excess fertilizer expenditure by up to 25%'
    ],
    eligibility: [
      'All landholding farmers across every agricultural block in India'
    ],
    onlineSteps: [
      'Step 1: Open the official Soil Health portal at soilhealth.dac.gov.in.',
      'Step 2: Check schedule of soil sample collection for your village grid.',
      'Step 3: Village Agriculture Assistant collects composite soil sample at 15-20 cm depth across 5 spots in field.',
      'Step 4: Sample is barcoded and dispatched to the district Soil Testing Laboratory (STL).',
      'Step 5: Testing completed within 21 days; printed Soil Health Card issued to farmer.',
      'Step 6: You can download and print your Soil Health Card online anytime by searching your name.'
    ],
    offlineSteps: [
      'Step 1: Collect composite soil sample (500g) using V-shaped cut technique from your field.',
      'Step 2: Take sample to nearest Krishi Vigyan Kendra (KVK) or District Soil Testing Lab.',
      'Step 3: Collect printed card with fertilizer dosage recommendations.'
    ],
    trackingGuide: {
      steps: [
        'Visit soilhealth.dac.gov.in/soil-health-card/',
        'Select your State, District, Sub-District (Tehsil), and Village',
        'Enter Farmer Name or Grid Sample Code and click "Search"',
        'Click "View Card" to download your complete 12-parameter soil advisory PDF'
      ],
      trackingUrl: 'https://soilhealth.dac.gov.in/soil-health-card/',
      buttonLabel: 'Print / Track Your Soil Health Card'
    },
    documents: [
      'Farmer Name and Aadhaar Number',
      'Land Survey / Khata number and village coordinates'
    ],
    deadlines: 'Conducted biennially (every 2 years) on a continuous village cycle',
    claimProcess: 'Card delivered directly through village agriculture assistant or downloaded online.',
    officialUrl: 'https://soilhealth.dac.gov.in/',
    directApplyUrl: 'https://soilhealth.dac.gov.in/soil-health-card/',
    helpline: '18001801551',
    helplineText: '1800-180-1551 (Kisan Call Centre)'
  },
  {
    id: 'enam',
    name: 'e-NAM (National Agriculture Market)',
    shortName: 'e-NAM Mandi Trading',
    ministry: 'Small Farmers Agribusiness Consortium (SFAC), Govt. of India',
    tagline: 'Pan-India electronic trading portal connecting farmers to 1,361+ mandis for best wholesale prices',
    category: 'Mandi & Price Protection',
    categoryKey: 'mandi',
    badge: 'Direct Best Price',
    premiumRates: 'Free Farmer Registration / Zero commission deductions for online payments',
    coverage: [
      'Transparent price discovery through competitive online bidding by traders across India',
      'Scientific quality assaying of produce at mandi lab to fetch premium prices for grade-A crops',
      'Direct online settlement into farmer bank account within 24 hours of trade acceptance'
    ],
    eligibility: [
      'All farmers producing agricultural, horticultural, or commercial produce'
    ],
    onlineSteps: [
      'Step 1: Open the official e-NAM portal at enam.gov.in.',
      'Step 2: Click "Registration" and select "Farmer" as User Type.',
      'Step 3: Enter your State, APMC Mandi, Name, Date of Birth, and Aadhaar-linked Mobile Number.',
      'Step 4: Upload copy of Bank Passbook (for payment credits) and Identity Proof.',
      'Step 5: Submit form to receive your permanent e-NAM Farmer ID.',
      'Step 6: Bring produce to your registered e-NAM APMC mandi gate; generate electronic lot entry.',
      'Step 7: Quality assaying completed; traders bid online; you view and accept the highest bid on your phone!'
    ],
    offlineSteps: [
      'Step 1: Visit the e-NAM helpdesk at your local APMC Mandi yard with your produce.',
      'Step 2: Present Aadhaar and Bank Passbook to get instant on-the-spot lot entry.',
      'Step 3: Mandi official assays your sample and uploads lot for online national bidding.'
    ],
    trackingGuide: {
      steps: [
        'Visit enam.gov.in/web/dashboard/trade-data',
        'Select Mandi, Commodity, and Lot ID',
        'Track live bidding prices and verify electronic payment transfer into your bank account'
      ],
      trackingUrl: 'https://enam.gov.in/web/dashboard/trade-data',
      buttonLabel: 'Track Live Mandi Prices & Bids'
    },
    documents: [
      'Aadhaar Card / Voter ID',
      'Bank Account Passbook (showing Account Number and IFSC)',
      'Mobile phone for receiving SMS trade confirmations and OTP'
    ],
    deadlines: 'Operational during all regular APMC Mandi trading days year-round',
    claimProcess: 'Instant online bank transfer directly to farmer upon bid acceptance.',
    officialUrl: 'https://enam.gov.in/',
    directApplyUrl: 'https://enam.gov.in/web/stakeholders-registration/farmer',
    helpline: '18002700224',
    helplineText: '1800-270-0224 (Toll-Free e-NAM Helpdesk)'
  },
  {
    id: 'smam',
    name: 'SMAM (Sub-Mission on Agricultural Mechanization)',
    shortName: 'Farm Machinery Subsidy',
    ministry: 'Ministry of Agriculture & Farmers Welfare, Govt. of India',
    tagline: '40% to 50% Government financial subsidy on tractors, rotavators, power tillers, and drones',
    category: 'Irrigation & Machinery',
    categoryKey: 'irrigation',
    badge: '40–50% Machinery Grant',
    premiumRates: '40% - 50% subsidy for individual farmers; up to 80% for Custom Hiring Centres (CHCs)',
    coverage: [
      'Subsidized procurement of Tractors, Power Tillers, Seed Drills, Laser Land Levelers, and Harvesters',
      'Financial grants for Agriculture Drones for precision spray application',
      'Grants to establish village-level Custom Hiring Centres (CHC) by rural youth and FPOs'
    ],
    eligibility: [
      'All farmers owning agricultural land (special priority and 50% rate for SC, ST, Small, Marginal, and Women farmers)'
    ],
    onlineSteps: [
      'Step 1: Open the national mechanization portal at agrimachinery.nic.in.',
      'Step 2: Click "Farmer Registration" and choose your state and farmer category.',
      'Step 3: Enter your Aadhaar number, Mobile number, and Bank Account details.',
      'Step 4: Select the machine you need (e.g. Rotavator, Tractor, Harvester) and empaneled brand manufacturer.',
      'Step 5: Upload your Land Document (RoR / 7-12) and Caste / Category Certificate if applicable.',
      'Step 6: Submit application; district committee reviews through lottery/merit allocation.',
      'Step 7: On receiving sanction letter, purchase machine from dealer; inspection officer verifies chassis serial number.',
      'Step 8: Subsidy amount credited directly to your bank account via DBT.'
    ],
    offlineSteps: [
      'Step 1: Visit District Agriculture Engineer or Assistant Director of Agriculture.',
      'Step 2: Submit physical application with land patta and quotation from authorized dealer.'
    ],
    trackingGuide: {
      steps: [
        'Visit agrimachinery.nic.in',
        'Click on "Track Application" under Farmer Services',
        'Enter your Application Reference Number or Aadhaar Number to view approval status'
      ],
      trackingUrl: 'https://agrimachinery.nic.in/',
      buttonLabel: 'Track Machinery Subsidy Application'
    },
    documents: [
      'Aadhaar Card',
      'Bank Passbook Copy (showing IFSC)',
      'Land Record Document (7-12 / RoR / Khasra)',
      'Category Certificate (SC/ST/Woman Farmer for 50% rate)'
    ],
    deadlines: 'Announced annually at start of financial year (April - June)',
    claimProcess: 'Direct DBT subsidy credit after physical GPS inspection of serial number on machine.',
    officialUrl: 'https://agrimachinery.nic.in/',
    directApplyUrl: 'https://agrimachinery.nic.in/Farmer/Management/Index',
    helpline: '01123387864',
    helplineText: '011-23387864 (Mechanization Division, Krishi Bhawan)'
  },
  {
    id: 'pkvy',
    name: 'Paramparagat Krishi Vikas Yojana (PKVY) - Organic Farming',
    shortName: 'PKVY Organic Support',
    ministry: 'Ministry of Agriculture & Farmers Welfare, Govt. of India',
    tagline: '₹50,000 per hectare assistance for organic conversion, bio-inputs, and certified market access',
    category: 'Soil & Organic',
    categoryKey: 'soil',
    badge: '₹50,000 / ha Grant',
    premiumRates: '100% Free / Government provides ₹50,000 per hectare grant over 3 years',
    coverage: [
      '₹31,000/ha direct financial assistance for organic inputs (vermicompost, bio-fertilizers, neem cake)',
      'Free Participatory Guarantee System (PGS-India) organic quality certification',
      'Direct onboarding on jaivikkheti.in national organic market for high-value sales'
    ],
    eligibility: [
      'Farmers forming organic clusters of 20 or more farmers covering 50 acres (20 hectares) in a contiguous area'
    ],
    onlineSteps: [
      'Step 1: Form or join an existing Organic Farmers Group (cluster) of 20+ farmers in your village.',
      'Step 2: Visit the PGS-India organic portal at pgsindia-ncof.gov.in or jaivikkheti.in.',
      'Step 3: Register your group with the designated Regional Council or District Organic Nodal Officer.',
      'Step 4: Receive initial input funding for vermicompost beds, neem formulations, and bio-fertilizers.',
      'Step 5: Conduct peer inspection and maintain organic field diary across the 3-year conversion phase.',
      'Step 6: Receive official PGS-India Green (Year 1-2) and PGS-India Organic (Year 3) certificates.',
      'Step 7: Sell certified organic crops at 20–40% price premium on jaivikkheti.in!'
    ],
    offlineSteps: [
      'Step 1: Contact your Block Agriculture Officer or Krishi Vigyan Kendra (KVK) scientist.',
      'Step 2: Submit farmer group resolution to join local PKVY organic cluster.'
    ],
    trackingGuide: {
      steps: [
        'Visit pgsindia-ncof.gov.in',
        'Enter Farmer Cluster ID or Farmer Name',
        'View PGS-India certification stage and input subsidy disbursement status'
      ],
      trackingUrl: 'https://pgsindia-ncof.gov.in/',
      buttonLabel: 'Track Organic Certification & Cluster Status'
    },
    documents: [
      'Aadhaar Card and Mobile Number',
      'Land Record (RoR / Khatauni showing plot survey numbers)',
      'Bank Account Passbook (Aadhaar-seeded for input grant credits)',
      'Cluster Group Membership Agreement'
    ],
    deadlines: 'Continuous cluster onboarding by State Agriculture Departments',
    claimProcess: 'Direct DBT transfer into farmer group and individual accounts in seasonal tranches.',
    officialUrl: 'https://pgsindia-ncof.gov.in/',
    directApplyUrl: 'https://jaivikkheti.in/',
    helpline: '18001801551',
    helplineText: '1800-180-1551 (National Organic Farming Centre)'
  }
];

const CATEGORIES = [
  { id: 'all', label: 'All Schemes (8)', icon: Landmark },
  { id: 'insurance', label: 'Crop Insurance', icon: ShieldCheck },
  { id: 'income', label: 'Direct Income', icon: IndianRupee },
  { id: 'credit', label: 'Credit & Loans', icon: BookOpen },
  { id: 'irrigation', label: 'Irrigation & Machinery', icon: Wrench },
  { id: 'soil', label: 'Soil & Organic', icon: Sprout },
];

export default function FarmerProtection() {
  const [selectedSchemeId, setSelectedSchemeId] = useState('pmfby');
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDetailTab, setActiveDetailTab] = useState('apply'); // apply | track | eligibility | documents | conditions
  const [checkedDocs, setCheckedDocs] = useState({});

  // Filter schemes
  const filteredSchemes = useMemo(() => {
    return SCHEMES.filter(s => {
      const matchesCat = activeCategory === 'all' || s.categoryKey === activeCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        s.name.toLowerCase().includes(q) ||
        s.shortName.toLowerCase().includes(q) ||
        s.tagline.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const currentScheme = SCHEMES.find(s => s.id === selectedSchemeId) || filteredSchemes[0] || SCHEMES[0];

  const toggleDocCheck = (docIdx) => {
    setCheckedDocs(prev => ({ ...prev, [docIdx]: !prev[docIdx] }));
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F7F5F0', paddingBottom: 60 }}>
      {/* Top Hero Banner */}
      <div style={{
        background: '#FFFFFF',
        borderBottom: '1px solid var(--beige)',
        padding: '24px 20px',
      }}>
        <div style={{ maxWidth: 1380, margin: '0 auto' }}>
          {/* Annadata Respect Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: '#DCFCE7',
            border: '1px solid #86EFAC',
            padding: '5px 14px',
            borderRadius: 99,
            marginBottom: 12,
          }}>
            <span style={{ fontSize: '1rem' }}>🌾</span>
            <span style={{ fontSize: '0.74rem', color: '#15803D', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              HONORING THE BACKBONE OF OUR NATION (ANNADATA) • OFFICIAL SAFETY NET
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h1 style={{
                fontFamily: 'Manrope, sans-serif',
                fontSize: 'clamp(1.6rem, 2.5vw, 2.2rem)',
                color: 'var(--forest-green)',
                fontWeight: 800,
                margin: 0,
                lineHeight: 1.25,
              }}>
                Government Agricultural Protection & Safety Schemes
              </h1>
              <p style={{ color: 'var(--text-medium)', marginTop: 6, marginBottom: 0, maxWidth: 840, lineHeight: 1.55, fontSize: '0.90rem' }}>
                Authentic, direct access to verified Central & State agricultural welfare programs. We provide step-by-step application procedures, direct official government portal links, and status-tracking instructions to keep you protected.
              </p>
            </div>

            {/* Farmer-First Platform Guarantee Notice */}
            <div style={{
              background: '#FAF7F2',
              border: '1.5px solid var(--beige)',
              borderRadius: 14,
              padding: '14px 16px',
              maxWidth: 360,
              fontSize: '0.74rem',
              color: 'var(--text-dark)',
              lineHeight: 1.45,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 800, color: 'var(--forest-green)', marginBottom: 4 }}>
                <ShieldCheck size={16} color="var(--forest-green)" />
                <span>Our Transparent Farmer Guarantee:</span>
              </div>
              <span>
                AgriRisk is an independent decision-support platform. <strong>We do NOT collect documents, charge fees, or submit applications on your behalf.</strong> You apply directly on official Govt portals (.gov.in) and retain 100% control.
              </span>
            </div>
          </div>

          {/* Search & Category Filter Bar */}
          <div style={{
            marginTop: 20,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
            borderTop: '1px solid var(--beige)',
            paddingTop: 16,
          }}>
            {/* Search Input */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: '#FAF7F2',
              border: '1px solid var(--beige)',
              borderRadius: 10,
              padding: '7px 14px',
              minWidth: 260,
              flex: '1 1 260px',
              maxWidth: 380,
            }}>
              <Search size={15} color="var(--text-medium)" />
              <input
                type="text"
                placeholder="Search scheme (e.g. PM-KISAN, tractor, insurance)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  fontSize: '0.80rem',
                  color: 'var(--text-dark)',
                  width: '100%',
                }}
              />
            </div>

            {/* Category Selector Pills */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {CATEGORIES.map((cat) => {
                const isActive = activeCategory === cat.id;
                const IconComponent = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                      padding: '6px 12px',
                      borderRadius: 99,
                      fontSize: '0.74rem',
                      fontWeight: isActive ? 800 : 600,
                      cursor: 'pointer',
                      border: isActive ? '1.5px solid var(--forest-green)' : '1px solid var(--beige)',
                      background: isActive ? 'var(--forest-green)' : '#FFFFFF',
                      color: isActive ? '#FFFFFF' : 'var(--text-dark)',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <IconComponent size={12} />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Dual Grid Layout */}
      <div style={{ maxWidth: 1380, margin: '24px auto 0 auto', padding: '0 20px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 360px) minmax(0, 1fr)',
          gap: 24,
          alignItems: 'start',
        }} className="farmer-protection-grid">

          {/* Left Column: List of Schemes */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{
              background: '#FFFFFF',
              borderRadius: 16,
              border: '1.5px solid var(--beige)',
              boxShadow: 'var(--shadow-sm)',
              overflow: 'hidden',
            }}>
              <div style={{
                padding: '12px 18px',
                borderBottom: '1px solid var(--beige)',
                background: '#FAF7F2',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 800, fontSize: '0.80rem', color: 'var(--forest-green)' }}>
                  <Landmark size={14} color="var(--forest-green)" />
                  <span>Available Schemes ({filteredSchemes.length})</span>
                </div>
                <span style={{ fontSize: '0.70rem', color: 'var(--text-medium)', fontWeight: 600 }}>
                  Click to inspect steps
                </span>
              </div>

              <div style={{ maxHeight: 680, overflowY: 'auto' }}>
                {filteredSchemes.length === 0 ? (
                  <div style={{ padding: '30px 20px', textAlign: 'center', color: 'var(--text-light)', fontSize: '0.82rem' }}>
                    No government schemes match your search criteria.
                  </div>
                ) : (
                  filteredSchemes.map((s) => {
                    const isSelected = currentScheme.id === s.id;
                    return (
                      <button
                        key={s.id}
                        onClick={() => setSelectedSchemeId(s.id)}
                        style={{
                          width: '100%',
                          padding: '14px 18px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 5,
                          background: isSelected ? 'var(--pale-green)' : 'transparent',
                          border: 'none',
                          borderBottom: '1px solid var(--beige)',
                          textAlign: 'left',
                          cursor: 'pointer',
                          transition: 'background 0.15s ease',
                        }}
                        onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = '#FAF7F2'; }}
                        onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                          <span style={{
                            fontSize: '0.66rem',
                            fontWeight: 800,
                            padding: '2px 7px',
                            borderRadius: 99,
                            background: isSelected ? 'var(--forest-green)' : '#FAF7F2',
                            color: isSelected ? '#FFFFFF' : 'var(--forest-green)',
                            border: '1px solid var(--beige)',
                            textTransform: 'uppercase',
                          }}>
                            {s.category}
                          </span>
                          <span style={{
                            fontSize: '0.66rem',
                            fontWeight: 800,
                            color: '#15803D',
                            background: '#DCFCE7',
                            padding: '1px 6px',
                            borderRadius: 6,
                          }}>
                            {s.badge}
                          </span>
                        </div>

                        <div style={{ fontSize: '0.86rem', fontWeight: isSelected ? 800 : 700, color: '#1F2937', marginTop: 2 }}>
                          {s.name}
                        </div>

                        <div style={{ fontSize: '0.73rem', color: 'var(--text-medium)', lineHeight: 1.35 }}>
                          {s.tagline}
                        </div>

                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginTop: 4,
                          paddingTop: 4,
                          borderTop: '1px dashed rgba(0,0,0,0.06)',
                          fontSize: '0.70rem',
                          color: isSelected ? 'var(--forest-green)' : 'var(--text-medium)',
                          fontWeight: 700,
                        }}>
                          <span>Helpline: {s.helpline}</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            Details <ChevronRight size={12} />
                          </span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Comprehensive Scheme Deep-Dive */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Header Action Card for Selected Scheme */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: 16,
              border: '1.5px solid var(--beige)',
              padding: '24px 26px',
              boxShadow: 'var(--shadow-sm)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#EBF4E5', padding: '3px 10px', borderRadius: 99, marginBottom: 6 }}>
                    <Landmark size={12} color="var(--forest-green)" />
                    <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--forest-green)', textTransform: 'uppercase' }}>
                      {currentScheme.ministry}
                    </span>
                  </div>
                  <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#1F2937', margin: '0 0 4px 0' }}>
                    {currentScheme.name}
                  </h2>
                  <p style={{ fontSize: '0.84rem', color: 'var(--text-medium)', margin: 0, lineHeight: 1.45 }}>
                    {currentScheme.tagline}
                  </p>
                </div>

                <div style={{
                  background: '#F0FDF4',
                  border: '1px solid #BBF7D0',
                  borderRadius: 10,
                  padding: '8px 14px',
                  textAlign: 'right',
                }}>
                  <div style={{ fontSize: '0.66rem', color: '#166534', fontWeight: 700, textTransform: 'uppercase' }}>Financial Rate / Cost</div>
                  <div style={{ fontSize: '0.84rem', color: '#166534', fontWeight: 800, marginTop: 2 }}>{currentScheme.badge}</div>
                </div>
              </div>

              {/* 4 Official Direct Action Buttons */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: 10,
                marginTop: 18,
                paddingTop: 18,
                borderTop: '1px solid var(--beige)',
              }}>
                {/* 1. Official Portal */}
                <a
                  href={currentScheme.officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    background: '#FAF7F2',
                    border: '1px solid var(--beige)',
                    color: 'var(--text-dark)',
                    padding: '9px 14px',
                    borderRadius: 10,
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#EFE9DF'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#FAF7F2'}
                >
                  <ExternalLink size={13} color="var(--forest-green)" />
                  <span>Official Portal</span>
                </a>

                {/* 2. Direct Apply Form */}
                <a
                  href={currentScheme.directApplyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    background: 'var(--forest-green)',
                    color: '#FFFFFF',
                    padding: '9px 14px',
                    borderRadius: 10,
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    textDecoration: 'none',
                    boxShadow: '0 2px 5px rgba(45,80,22,0.25)',
                    transition: 'opacity 0.15s ease',
                  }}
                >
                  <ArrowUpRight size={14} />
                  <span>Apply Online Direct</span>
                </a>

                {/* 3. Track Status Portal */}
                <a
                  href={currentScheme.trackingGuide.trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    background: '#0284C7',
                    color: '#FFFFFF',
                    padding: '9px 14px',
                    borderRadius: 10,
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    textDecoration: 'none',
                    boxShadow: '0 2px 5px rgba(2,132,199,0.25)',
                    transition: 'opacity 0.15s ease',
                  }}
                >
                  <Eye size={13} />
                  <span>Track Status</span>
                </a>

                {/* 4. Direct Call Helpline */}
                <a
                  href={`tel:${currentScheme.helpline}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    background: '#F0FDF4',
                    border: '1px solid #86EFAC',
                    color: '#15803D',
                    padding: '9px 14px',
                    borderRadius: 10,
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    textDecoration: 'none',
                  }}
                >
                  <PhoneCall size={13} />
                  <span>Helpline: {currentScheme.helpline}</span>
                </a>
              </div>
            </div>

            {/* Sub-Navigation Tabs within Selected Scheme */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: 14,
              border: '1.5px solid var(--beige)',
              padding: 4,
              display: 'flex',
              gap: 4,
              flexWrap: 'wrap',
            }}>
              {[
                { id: 'apply', label: '📝 How to Apply (Clear Steps)', icon: FileText },
                { id: 'track', label: '🔍 How to Track Status', icon: Eye },
                { id: 'eligibility', label: '✓ Eligibility & What It Covers', icon: CheckSquare },
                { id: 'documents', label: '📄 Documents Checklist', icon: BookOpen },
                { id: 'conditions', label: '⚠️ Deadlines & Key Conditions', icon: Clock },
              ].map((tab) => {
                const isActive = activeDetailTab === tab.id;
                const TabIcon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveDetailTab(tab.id)}
                    style={{
                      flex: '1 1 auto',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      padding: '8px 14px',
                      borderRadius: 10,
                      border: 'none',
                      fontSize: '0.75rem',
                      fontWeight: isActive ? 800 : 600,
                      cursor: 'pointer',
                      background: isActive ? 'var(--forest-green)' : 'transparent',
                      color: isActive ? '#FFFFFF' : 'var(--text-dark)',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <TabIcon size={13} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* TAB CONTENT 1: STEP-BY-STEP APPLICATION PROCEDURE */}
            {activeDetailTab === 'apply' && (
              <div style={{
                background: '#FFFFFF',
                borderRadius: 16,
                border: '1.5px solid var(--beige)',
                padding: '24px 26px',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                gap: 20,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--forest-green)', margin: '0 0 2px 0' }}>
                      Official Application Procedures for {currentScheme.shortName}
                    </h3>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-medium)' }}>
                      Follow these step-by-step instructions to register on official government portals.
                    </span>
                  </div>
                  <a
                    href={currentScheme.directApplyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      background: '#DCFCE7',
                      color: '#15803D',
                      border: '1px solid #86EFAC',
                      padding: '5px 12px',
                      borderRadius: 8,
                      fontSize: '0.74rem',
                      fontWeight: 800,
                      textDecoration: 'none',
                    }}
                  >
                    Launch Registration Form <ArrowUpRight size={12} />
                  </a>
                </div>

                {/* Mode A: Online Self-Registration Timeline */}
                <div>
                  <div style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--forest-green)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--forest-green)' }} />
                    METHOD A: ONLINE SELF-REGISTRATION VIA COMPUTER OR MOBILE PHONE
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {currentScheme.onlineSteps.map((stepText, idx) => (
                      <div key={idx} style={{
                        display: 'flex',
                        gap: 12,
                        alignItems: 'flex-start',
                        background: '#FAF7F2',
                        padding: '11px 14px',
                        borderRadius: 10,
                        border: '1px solid var(--beige)',
                      }}>
                        <div style={{
                          width: 22,
                          height: 22,
                          borderRadius: 6,
                          background: 'var(--forest-green)',
                          color: '#FFFFFF',
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          marginTop: 1,
                        }}>
                          {idx + 1}
                        </div>
                        <span style={{ fontSize: '0.80rem', color: '#1F2937', lineHeight: 1.45, fontWeight: 500 }}>
                          {stepText}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mode B: Offline Registration via CSC or Bank */}
                <div style={{ borderTop: '1px solid var(--beige)', paddingTop: 16 }}>
                  <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#6B7280' }} />
                    METHOD B: OFFLINE REGISTRATION (COMMON SERVICE CENTRE / BANK BRANCH)
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {currentScheme.offlineSteps.map((stepText, idx) => (
                      <div key={idx} style={{
                        display: 'flex',
                        gap: 10,
                        alignItems: 'flex-start',
                        background: '#F9FAFB',
                        padding: '9px 12px',
                        borderRadius: 8,
                        border: '1px solid #E5E7EB',
                        fontSize: '0.78rem',
                        color: '#374151',
                      }}>
                        <span style={{ fontWeight: 800, color: 'var(--forest-green)', flexShrink: 0 }}>•</span>
                        <span>{stepText}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT 2: HOW TO TRACK APPLICATION STATUS */}
            {activeDetailTab === 'track' && (
              <div style={{
                background: '#FFFFFF',
                borderRadius: 16,
                border: '1.5px solid var(--beige)',
                padding: '24px 26px',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                gap: 18,
              }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0284C7', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Eye size={18} color="#0284C7" />
                    How to Track Your {currentScheme.shortName} Application Status
                  </h3>
                  <p style={{ fontSize: '0.80rem', color: 'var(--text-medium)', margin: 0 }}>
                    You can track your application, policy number, and direct bank transfer (DBT) credit directly on the official portal.
                  </p>
                </div>

                <div style={{
                  background: '#F0F9FF',
                  border: '1.5px solid #BAE6FD',
                  borderRadius: 12,
                  padding: '16px 18px',
                }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0369A1', marginBottom: 10, textTransform: 'uppercase' }}>
                    Step-by-Step Tracking Instructions:
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {currentScheme.trackingGuide.steps.map((step, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: '0.80rem', color: '#0C4A6E' }}>
                        <div style={{
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          background: '#0284C7',
                          color: '#FFFFFF',
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          marginTop: 1,
                        }}>
                          {idx + 1}
                        </div>
                        <span style={{ lineHeight: 1.45 }}>{step}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px dashed #BAE6FD', display: 'flex', justifyContent: 'flex-start' }}>
                    <a
                      href={currentScheme.trackingGuide.trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        background: '#0284C7',
                        color: '#FFFFFF',
                        padding: '9px 18px',
                        borderRadius: 8,
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        textDecoration: 'none',
                        boxShadow: '0 2px 6px rgba(2,132,199,0.3)',
                      }}
                    >
                      <ExternalLink size={13} />
                      <span>{currentScheme.trackingGuide.buttonLabel} →</span>
                    </a>
                  </div>
                </div>

                <div style={{
                  background: '#FAF7F2',
                  border: '1px solid var(--beige)',
                  borderRadius: 10,
                  padding: '12px 16px',
                  fontSize: '0.74rem',
                  color: 'var(--text-dark)',
                  lineHeight: 1.45,
                }}>
                  <strong>Facing issues with your status?</strong> If your status shows "e-KYC Pending", "Land Record Mismatch", or "FTO Rejected", visit your local Village Secretary or call the scheme toll-free helpline at <strong>{currentScheme.helpline}</strong> for immediate resolution.
                </div>
              </div>
            )}

            {/* TAB CONTENT 3: ELIGIBILITY & COVERAGE */}
            {activeDetailTab === 'eligibility' && (
              <div style={{
                background: '#FFFFFF',
                borderRadius: 16,
                border: '1.5px solid var(--beige)',
                padding: '24px 26px',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                gap: 20,
              }}>
                {/* Eligibility */}
                <div>
                  <div style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--forest-green)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CheckSquare size={14} color="var(--forest-green)" />
                    WHO IS ELIGIBLE TO APPLY?
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {currentScheme.eligibility.map((item, idx) => (
                      <div key={idx} style={{
                        display: 'flex',
                        gap: 10,
                        alignItems: 'flex-start',
                        background: '#F0FDF4',
                        border: '1px solid #BBF7D0',
                        borderRadius: 10,
                        padding: '10px 14px',
                        fontSize: '0.80rem',
                        color: '#166534',
                      }}>
                        <CheckCircle2 size={15} color="#16A34A" style={{ marginTop: 2, flexShrink: 0 }} />
                        <span style={{ lineHeight: 1.45, fontWeight: 500 }}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Coverage & Benefits */}
                <div style={{ borderTop: '1px solid var(--beige)', paddingTop: 18 }}>
                  <div style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--forest-green)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <ShieldCheck size={14} color="var(--forest-green)" />
                    WHAT IS COVERED / BENEFITS PROVIDED
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {currentScheme.coverage.map((cov, idx) => (
                      <div key={idx} style={{
                        display: 'flex',
                        gap: 10,
                        alignItems: 'flex-start',
                        background: '#FAF7F2',
                        border: '1px solid var(--beige)',
                        borderRadius: 10,
                        padding: '10px 14px',
                        fontSize: '0.80rem',
                        color: '#1F2937',
                      }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--forest-green)', marginTop: 6, flexShrink: 0 }} />
                        <span style={{ lineHeight: 1.45 }}>{cov}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT 4: DOCUMENTS CHECKLIST */}
            {activeDetailTab === 'documents' && (
              <div style={{
                background: '#FFFFFF',
                borderRadius: 16,
                border: '1.5px solid var(--beige)',
                padding: '24px 26px',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                gap: 18,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--forest-green)', margin: '0 0 3px 0' }}>
                      Mandatory Document Checklist for {currentScheme.shortName}
                    </h3>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-medium)', margin: 0 }}>
                      Check off each document as you gather it. Keep clear digital scans and physical copies ready.
                    </p>
                  </div>
                  <span style={{
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    color: '#7C5310',
                    background: '#FEF9EE',
                    padding: '3px 10px',
                    borderRadius: 99,
                    border: '1px solid #F5D89A',
                  }}>
                    NO UPLOAD REQUIRED ON AGRIRISK
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {currentScheme.documents.map((doc, idx) => {
                    const isChecked = !!checkedDocs[idx];
                    return (
                      <div
                        key={idx}
                        onClick={() => toggleDocCheck(idx)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          background: isChecked ? '#F0FDF4' : '#FAF7F2',
                          border: isChecked ? '1.5px solid #86EFAC' : '1px solid var(--beige)',
                          borderRadius: 12,
                          padding: '12px 16px',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div style={{
                          width: 22,
                          height: 22,
                          borderRadius: 6,
                          border: isChecked ? 'none' : '2px solid #94A3B8',
                          background: isChecked ? '#16A34A' : '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#FFFFFF',
                          flexShrink: 0,
                        }}>
                          {isChecked && <Check size={14} />}
                        </div>
                        <div style={{ flex: 1 }}>
                          <span style={{
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            color: isChecked ? '#166534' : '#1F2937',
                            textDecoration: isChecked ? 'line-through' : 'none',
                          }}>
                            {doc}
                          </span>
                        </div>
                        <span style={{ fontSize: '0.68rem', color: isChecked ? '#15803D' : '#64748B', fontWeight: 600 }}>
                          {isChecked ? 'Ready ✓' : 'Click when ready'}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div style={{
                  background: '#F0FDF4',
                  border: '1px solid #BBF7D0',
                  borderRadius: 10,
                  padding: '12px 14px',
                  fontSize: '0.74rem',
                  color: '#166534',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}>
                  <ShieldCheck size={16} color="#16A34A" />
                  <span>
                    <strong>Privacy Guarantee:</strong> AgriRisk never asks for your land papers or bank documents. You only submit them directly on official government servers.
                  </span>
                </div>
              </div>
            )}

            {/* TAB CONTENT 5: DEADLINES & CONDITIONS */}
            {activeDetailTab === 'conditions' && (
              <div style={{
                background: '#FFFFFF',
                borderRadius: 16,
                border: '1.5px solid var(--beige)',
                padding: '24px 26px',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                gap: 18,
              }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--forest-green)', margin: 0 }}>
                  Seasonal Deadlines & Mandatory Verification Conditions
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
                  <div style={{ background: '#FAF7F2', border: '1px solid var(--beige)', borderRadius: 12, padding: '14px 16px' }}>
                    <div style={{ fontSize: '0.68rem', color: '#6B7280', fontWeight: 800, textTransform: 'uppercase' }}>Enrollment Cutoff</div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#1F2937', marginTop: 4 }}>{currentScheme.deadlines}</div>
                    <div style={{ fontSize: '0.70rem', color: 'var(--text-medium)', marginTop: 4 }}>Enrollment strictly closes on notified state date</div>
                  </div>

                  <div style={{ background: '#FAF7F2', border: '1px solid var(--beige)', borderRadius: 12, padding: '14px 16px' }}>
                    <div style={{ fontSize: '0.68rem', color: '#6B7280', fontWeight: 800, textTransform: 'uppercase' }}>Loss Assessment Survey</div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#1F2937', marginTop: 4 }}>Field Joint Inspection</div>
                    <div style={{ fontSize: '0.70rem', color: 'var(--text-medium)', marginTop: 4 }}>Conducted by District Agriculture Officer & Insurance Assessor</div>
                  </div>

                  <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 12, padding: '14px 16px' }}>
                    <div style={{ fontSize: '0.68rem', color: '#166534', fontWeight: 800, textTransform: 'uppercase' }}>Bank Account NPCI Seeding</div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#15803D', marginTop: 4 }}>Aadhaar-Linked DBT</div>
                    <div style={{ fontSize: '0.70rem', color: '#166534', marginTop: 4 }}>Bank account must have active NPCI mapping for DBT transfers</div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--beige)', paddingTop: 14, fontSize: '0.78rem', color: 'var(--text-dark)', lineHeight: 1.5 }}>
                  <strong>Claim Resolution Process:</strong> {currentScheme.claimProcess}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .farmer-protection-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

// Dummy data for Warehouse Dashboard

export const dummyComplaints = [
  {
    id: '1',
    complaintId: 'CMP-2024-001',
    itemName: 'Paracetamol 500mg Tablets',
    facility: 'City Hospital - Main Branch',
    batchNo: 'BTH2024001',
    damagedQty: 50,
    totalQty: 1000,
    raisedDate: '2024-01-10',
    status: 'pending',
    timeline: '7 days left',
    category: 'physical-damage',
    description: 'Damaged packaging due to improper handling during transportation. Several boxes were crushed and the tablets inside are exposed to moisture.'
  },
  {
    id: '2',
    complaintId: 'CMP-2024-002',
    itemName: 'Amoxicillin 250mg Capsules',
    facility: 'Central Medical Store',
    batchNo: 'BTH2024002',
    damagedQty: 120,
    totalQty: 500,
    raisedDate: '2024-01-12',
    status: 'in-progress',
    timeline: '5 days left',
    category: 'adr-reaction',
    description: 'Multiple reports of adverse reactions including skin rashes and allergic responses. Quality testing is underway to identify contamination.'
  },
  {
    id: '3',
    complaintId: 'CMP-2024-003',
    itemName: 'Insulin Injection 100IU/ml',
    facility: 'District Hospital - North Wing',
    batchNo: 'BTH2024003',
    damagedQty: 30,
    totalQty: 200,
    raisedDate: '2024-01-08',
    status: 'resolved',
    timeline: 'Completed',
    category: 'physical-damage',
    description: 'Refrigeration failure during storage led to temperature excursion. Batch has been recalled and replaced with fresh stock.'
  },
  {
    id: '4',
    complaintId: 'CMP-2024-004',
    itemName: 'Aspirin 75mg Tablets',
    facility: 'Regional Pharmacy Hub',
    batchNo: 'BTH2024004',
    damagedQty: 200,
    totalQty: 2000,
    raisedDate: '2024-01-14',
    status: 'pending',
    timeline: '9 days left',
    category: 'quality-issue',
    description: 'Tablets are discolored and have an unusual odor. Suspected manufacturing defect or contamination during production process.'
  },
  {
    id: '5',
    complaintId: 'CMP-2024-005',
    itemName: 'Ciprofloxacin 500mg Tablets',
    facility: 'City Hospital - Emergency Ward',
    batchNo: 'BTH2024005',
    damagedQty: 75,
    totalQty: 600,
    raisedDate: '2024-01-11',
    status: 'in-progress',
    timeline: '6 days left',
    category: 'quality-issue',
    description: 'Packaging seals are compromised, allowing moisture ingress. Tablets are showing signs of degradation and breaking apart easily.'
  },
  {
    id: '6',
    complaintId: 'CMP-2024-006',
    itemName: 'Metformin 850mg Tablets',
    facility: 'Community Health Center',
    batchNo: 'BTH2024006',
    damagedQty: 40,
    totalQty: 800,
    raisedDate: '2024-01-09',
    status: 'resolved',
    timeline: 'Completed',
    category: 'physical-damage',
    description: 'Water damage from roof leak in storage area. Immediate action taken to move stock and repair facility. Damaged batch destroyed as per protocol.'
  },
  {
    id: '7',
    complaintId: 'CMP-2024-007',
    itemName: 'Omeprazole 20mg Capsules',
    facility: 'Private Medical Store - Downtown',
    batchNo: 'BTH2024007',
    damagedQty: 90,
    totalQty: 1500,
    raisedDate: '2024-01-15',
    status: 'pending',
    timeline: '10 days left',
    category: 'adr-reaction',
    description: 'Patients reporting severe gastric irritation and nausea after consumption. Lab analysis requested to check formulation accuracy.'
  },
  {
    id: '8',
    complaintId: 'CMP-2024-008',
    itemName: 'Atorvastatin 10mg Tablets',
    facility: 'Central Hospital - Cardiology Dept',
    batchNo: 'BTH2024008',
    damagedQty: 25,
    totalQty: 400,
    raisedDate: '2024-01-13',
    status: 'in-progress',
    timeline: '4 days left',
    category: 'quality-issue',
    description: 'Incorrect labeling detected - batch number mismatch between primary and secondary packaging. Investigation ongoing with manufacturer.'
  },
  {
    id: '9',
    complaintId: 'CMP-2024-009',
    itemName: 'Salbutamol Inhaler 100mcg',
    facility: 'District Hospital - Pulmonology',
    batchNo: 'BTH2024009',
    damagedQty: 15,
    totalQty: 100,
    raisedDate: '2024-01-07',
    status: 'resolved',
    timeline: 'Completed',
    category: 'physical-damage',
    description: 'Mechanical damage to inhaler actuators during shipping. Supplier has been notified and replacement stock delivered.'
  },
  {
    id: '10',
    complaintId: 'CMP-2024-010',
    itemName: 'Ibuprofen 400mg Tablets',
    facility: 'Medical College Hospital',
    batchNo: 'BTH2024010',
    damagedQty: 180,
    totalQty: 3000,
    raisedDate: '2024-01-14',
    status: 'pending',
    timeline: '8 days left',
    category: 'quality-issue',
    description: 'Tablets are chipping and crumbling excessively. Hardness test failed during routine quality checks. Entire batch quarantined.'
  },
  {
    id: '11',
    complaintId: 'CMP-2024-011',
    itemName: 'Dexamethasone 4mg Injection',
    facility: 'City Hospital - ICU',
    batchNo: 'BTH2024011',
    damagedQty: 20,
    totalQty: 150,
    raisedDate: '2024-01-12',
    status: 'in-progress',
    timeline: '5 days left',
    category: 'physical-damage',
    description: 'Glass vials found cracked in several boxes. Suspected rough handling during distribution. Quality control team inspecting remaining stock.'
  },
  {
    id: '12',
    complaintId: 'CMP-2024-012',
    itemName: 'Levothyroxine 50mcg Tablets',
    facility: 'Regional Endocrinology Center',
    batchNo: 'BTH2024012',
    damagedQty: 60,
    totalQty: 1000,
    raisedDate: '2024-01-06',
    status: 'resolved',
    timeline: 'Completed',
    category: 'adr-reaction',
    description: 'Reports of thyroid function abnormalities in patients. Independent lab testing confirmed subpotent formulation. Manufacturer issued recall.'
  },
  {
    id: '13',
    complaintId: 'CMP-2024-013',
    itemName: 'Ceftriaxone 1g Injection',
    facility: 'Emergency Medical Services',
    batchNo: 'BTH2024013',
    damagedQty: 45,
    totalQty: 300,
    raisedDate: '2024-01-15',
    status: 'pending',
    timeline: '11 days left',
    category: 'quality-issue',
    description: 'Precipitate formation observed in reconstituted solution. pH testing shows deviation from acceptable range. Microbiology testing in progress.'
  },
  {
    id: '14',
    complaintId: 'CMP-2024-014',
    itemName: 'Diclofenac 50mg Tablets',
    facility: 'Orthopedic Clinic - West Branch',
    batchNo: 'BTH2024014',
    damagedQty: 100,
    totalQty: 1200,
    raisedDate: '2024-01-13',
    status: 'in-progress',
    timeline: '3 days left',
    category: 'physical-damage',
    description: 'Blister packs are deformed and some tablets have fallen out of their cavities. Storage temperature logs being reviewed for compliance.'
  },
  {
    id: '15',
    complaintId: 'CMP-2024-015',
    itemName: 'Furosemide 40mg Tablets',
    facility: 'Nephrology Department',
    batchNo: 'BTH2024015',
    damagedQty: 35,
    totalQty: 500,
    raisedDate: '2024-01-05',
    status: 'resolved',
    timeline: 'Completed',
    category: 'quality-issue',
    description: 'Dissolution test failure during stability studies. Batch recalled and destroyed. Root cause analysis completed and corrective actions implemented.'
  }
];

export const dummyStats = {
  totalComplaints: 15,
  pendingCount: 5,
  inProgressCount: 5,
  resolvedCount: 5
};

// Helper function to filter complaints by status
export const getComplaintsByStatus = (status) => {
  return dummyComplaints.filter(complaint => complaint.status === status);
};

// Helper function to filter complaints by category
export const getComplaintsByCategory = (category) => {
  return dummyComplaints.filter(complaint => complaint.category === category);
};

// Helper function to get complaint by ID
export const getComplaintById = (complaintId) => {
  return dummyComplaints.find(complaint => complaint.complaintId === complaintId);
};

// Helper function to filter complaints by date range
export const getComplaintsByDateRange = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return dummyComplaints.filter(complaint => {
    const complaintDate = new Date(complaint.raisedDate);
    return complaintDate >= start && complaintDate <= end;
  });
};

export default {
  dummyComplaints,
  dummyStats,
  getComplaintsByStatus,
  getComplaintsByCategory,
  getComplaintById,
  getComplaintsByDateRange
};

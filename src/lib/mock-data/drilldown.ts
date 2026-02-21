export type DrilldownLevel = 'team' | 'manager' | 'tl' | 'employee' | 'project';

export interface TeamData {
    id: string;
    name: string;
    totalProjects: number;
    activeProjects: number;
    delayedProjects: number;
    completedProjects: number;
    color: string;
}

export interface ManagerData {
    id: string;
    name: string;
    teamId: string;
    avatar: string;
    totalProjects: number;
    activeProjects: number;
    delayedProjects: number;
    completedProjects: number;
    teamSize: number;
}

export interface TLData {
    id: string;
    name: string;
    managerId: string;
    avatar: string;
    teamSize: number;
    assignedProjects: number;
    activeProjects: number;
    completedProjects: number;
    performance: number;
}

export interface EmployeeData {
    id: string;
    name: string;
    tlId: string;
    avatar: string;
    role: string;
    tasksAssigned: number;
    tasksCompleted: number;
    tasksPending: number;
    progressPercent: number;
    hoursLogged: number;
}

export interface ProjectData {
    id: string;
    name: string;
    client: string;
    startDate: string;
    endDate: string;
    status: 'active' | 'completed' | 'delayed' | 'on-hold';
    progressPercent: number;
    teamId: string;
    managerId: string;
    tlId: string;
    assignedEmployees: string[];
}

// ========== MOCK TEAMS ==========
export const mockTeams: TeamData[] = [
    { id: 'banking', name: 'Banking', totalProjects: 18, activeProjects: 12, delayedProjects: 3, completedProjects: 3, color: '#8B5CF6' },
    { id: 'healthcare', name: 'Healthcare', totalProjects: 14, activeProjects: 9, delayedProjects: 2, completedProjects: 3, color: '#3B82F6' },
    { id: 'ecommerce', name: 'E-Commerce', totalProjects: 22, activeProjects: 15, delayedProjects: 4, completedProjects: 3, color: '#06B6D4' },
    { id: 'fintech', name: 'Fintech', totalProjects: 16, activeProjects: 10, delayedProjects: 2, completedProjects: 4, color: '#10B981' },
    { id: 'logistics', name: 'Logistics', totalProjects: 10, activeProjects: 6, delayedProjects: 1, completedProjects: 3, color: '#F59E0B' },
];

// ========== MOCK MANAGERS ==========
export const mockManagers: ManagerData[] = [
    // Banking theme
    { id: 'mgr-ravi', name: 'Ravi Kumar', teamId: 'banking', avatar: 'RK', totalProjects: 9, activeProjects: 6, delayedProjects: 2, completedProjects: 1, teamSize: 24 },
    { id: 'mgr-priya', name: 'Priya Sharma', teamId: 'banking', avatar: 'PS', totalProjects: 9, activeProjects: 6, delayedProjects: 1, completedProjects: 2, teamSize: 18 },
    // Healthcare theme
    { id: 'mgr-ankit', name: 'Ankit Patel', teamId: 'healthcare', avatar: 'AP', totalProjects: 7, activeProjects: 5, delayedProjects: 1, completedProjects: 1, teamSize: 20 },
    { id: 'mgr-sneha', name: 'Sneha Reddy', teamId: 'healthcare', avatar: 'SR', totalProjects: 7, activeProjects: 4, delayedProjects: 1, completedProjects: 2, teamSize: 15 },
    // E-Commerce theme
    { id: 'mgr-vikram', name: 'Vikram Singh', teamId: 'ecommerce', avatar: 'VS', totalProjects: 11, activeProjects: 8, delayedProjects: 2, completedProjects: 1, teamSize: 30 },
    { id: 'mgr-meera', name: 'Meera Joshi', teamId: 'ecommerce', avatar: 'MJ', totalProjects: 11, activeProjects: 7, delayedProjects: 2, completedProjects: 2, teamSize: 22 },
    // Fintech theme
    { id: 'mgr-arjun', name: 'Arjun Nair', teamId: 'fintech', avatar: 'AN', totalProjects: 8, activeProjects: 5, delayedProjects: 1, completedProjects: 2, teamSize: 16 },
    { id: 'mgr-divya', name: 'Divya Iyer', teamId: 'fintech', avatar: 'DI', totalProjects: 8, activeProjects: 5, delayedProjects: 1, completedProjects: 2, teamSize: 14 },
    // Logistics theme
    { id: 'mgr-karthik', name: 'Karthik Rao', teamId: 'logistics', avatar: 'KR', totalProjects: 5, activeProjects: 3, delayedProjects: 1, completedProjects: 1, teamSize: 12 },
    { id: 'mgr-lakshmi', name: 'Lakshmi Menon', teamId: 'logistics', avatar: 'LM', totalProjects: 5, activeProjects: 3, delayedProjects: 0, completedProjects: 2, teamSize: 10 },
];

// ========== MOCK TLs ==========
export const mockTLs: TLData[] = [
    // Under Ravi Kumar (Banking)
    { id: 'tl-suresh', name: 'Suresh Babu', managerId: 'mgr-ravi', avatar: 'SB', teamSize: 8, assignedProjects: 3, activeProjects: 2, completedProjects: 1, performance: 88 },
    { id: 'tl-nithya', name: 'Nithya Devi', managerId: 'mgr-ravi', avatar: 'ND', teamSize: 8, assignedProjects: 3, activeProjects: 2, completedProjects: 0, performance: 82 },
    { id: 'tl-mohan', name: 'Mohan Raj', managerId: 'mgr-ravi', avatar: 'MR', teamSize: 8, assignedProjects: 3, activeProjects: 2, completedProjects: 0, performance: 91 },
    // Under Priya Sharma (Banking)
    { id: 'tl-kavitha', name: 'Kavitha Subramanian', managerId: 'mgr-priya', avatar: 'KS', teamSize: 9, assignedProjects: 5, activeProjects: 3, completedProjects: 1, performance: 85 },
    { id: 'tl-ramesh', name: 'Ramesh Gupta', managerId: 'mgr-priya', avatar: 'RG', teamSize: 9, assignedProjects: 4, activeProjects: 3, completedProjects: 1, performance: 79 },
    // Under Ankit Patel (Healthcare)
    { id: 'tl-deepak', name: 'Deepak Verma', managerId: 'mgr-ankit', avatar: 'DV', teamSize: 10, assignedProjects: 4, activeProjects: 3, completedProjects: 1, performance: 90 },
    { id: 'tl-pooja', name: 'Pooja Mehta', managerId: 'mgr-ankit', avatar: 'PM', teamSize: 10, assignedProjects: 3, activeProjects: 2, completedProjects: 0, performance: 86 },
    // Under Vikram Singh (E-Commerce)
    { id: 'tl-rajesh', name: 'Rajesh Khanna', managerId: 'mgr-vikram', avatar: 'RK', teamSize: 10, assignedProjects: 4, activeProjects: 3, completedProjects: 0, performance: 87 },
    { id: 'tl-aisha', name: 'Aisha Begum', managerId: 'mgr-vikram', avatar: 'AB', teamSize: 10, assignedProjects: 4, activeProjects: 3, completedProjects: 1, performance: 92 },
    { id: 'tl-harsh', name: 'Harsh Vardhan', managerId: 'mgr-vikram', avatar: 'HV', teamSize: 10, assignedProjects: 3, activeProjects: 2, completedProjects: 0, performance: 78 },
];

// ========== MOCK EMPLOYEES ==========
export const mockEmployees: EmployeeData[] = [
    // Under Suresh Babu (TL, Banking)
    { id: 'emp-1', name: 'vijay', tlId: 'tl-suresh', avatar: 'vj', role: 'Senior Developer', tasksAssigned: 18, tasksCompleted: 14, tasksPending: 4, progressPercent: 78, hoursLogged: 165 },
    { id: 'emp-2', name: 'Bhavya Reddy', tlId: 'tl-suresh', avatar: 'BR', role: 'Frontend Developer', tasksAssigned: 15, tasksCompleted: 12, tasksPending: 3, progressPercent: 80, hoursLogged: 152 },
    { id: 'emp-3', name: 'Chandra Sekhar', tlId: 'tl-suresh', avatar: 'CS', role: 'Backend Developer', tasksAssigned: 20, tasksCompleted: 18, tasksPending: 2, progressPercent: 90, hoursLogged: 170 },
    { id: 'emp-4', name: 'Dharani Priya', tlId: 'tl-suresh', avatar: 'DP', role: 'QA Engineer', tasksAssigned: 22, tasksCompleted: 20, tasksPending: 2, progressPercent: 91, hoursLogged: 160 },
    // Under Nithya Devi (TL, Banking)
    { id: 'emp-5', name: 'Eswari Krishnan', tlId: 'tl-nithya', avatar: 'EK', role: 'Full Stack Developer', tasksAssigned: 16, tasksCompleted: 10, tasksPending: 6, progressPercent: 63, hoursLogged: 140 },
    { id: 'emp-6', name: 'Farhan Ali', tlId: 'tl-nithya', avatar: 'FA', role: 'DevOps Engineer', tasksAssigned: 12, tasksCompleted: 9, tasksPending: 3, progressPercent: 75, hoursLogged: 145 },
    { id: 'emp-7', name: 'Gayathri Nair', tlId: 'tl-nithya', avatar: 'GN', role: 'UI/UX Designer', tasksAssigned: 14, tasksCompleted: 11, tasksPending: 3, progressPercent: 79, hoursLogged: 138 },
    // Under Kavitha (TL, Banking)
    { id: 'emp-8', name: 'Hari Shankar', tlId: 'tl-kavitha', avatar: 'HS', role: 'Senior Developer', tasksAssigned: 19, tasksCompleted: 16, tasksPending: 3, progressPercent: 84, hoursLogged: 168 },
    { id: 'emp-9', name: 'Indira Bose', tlId: 'tl-kavitha', avatar: 'IB', role: 'Data Analyst', tasksAssigned: 10, tasksCompleted: 8, tasksPending: 2, progressPercent: 80, hoursLogged: 130 },
    // Under Deepak Verma (TL, Healthcare)
    { id: 'emp-10', name: 'Jayesh Patil', tlId: 'tl-deepak', avatar: 'JP', role: 'Backend Developer', tasksAssigned: 17, tasksCompleted: 15, tasksPending: 2, progressPercent: 88, hoursLogged: 162 },
    { id: 'emp-11', name: 'Keerthana Rajan', tlId: 'tl-deepak', avatar: 'KR', role: 'Frontend Developer', tasksAssigned: 14, tasksCompleted: 11, tasksPending: 3, progressPercent: 79, hoursLogged: 150 },
    { id: 'emp-12', name: 'Lokesh Mishra', tlId: 'tl-deepak', avatar: 'LM', role: 'QA Lead', tasksAssigned: 25, tasksCompleted: 23, tasksPending: 2, progressPercent: 92, hoursLogged: 175 },
    // Under Rajesh Khanna (TL, E-Commerce)
    { id: 'emp-13', name: 'Manoj Kumar', tlId: 'tl-rajesh', avatar: 'MK', role: 'Senior Developer', tasksAssigned: 20, tasksCompleted: 17, tasksPending: 3, progressPercent: 85, hoursLogged: 166 },
    { id: 'emp-14', name: 'Neelima Das', tlId: 'tl-rajesh', avatar: 'ND', role: 'Mobile Developer', tasksAssigned: 13, tasksCompleted: 10, tasksPending: 3, progressPercent: 77, hoursLogged: 142 },
    // Under Aisha Begum (TL, E-Commerce)
    { id: 'emp-15', name: 'Om Prakash', tlId: 'tl-aisha', avatar: 'OP', role: 'Full Stack Developer', tasksAssigned: 16, tasksCompleted: 14, tasksPending: 2, progressPercent: 88, hoursLogged: 156 },
    { id: 'emp-16', name: 'Pallavi Shetty', tlId: 'tl-aisha', avatar: 'PS', role: 'DevOps Engineer', tasksAssigned: 11, tasksCompleted: 10, tasksPending: 1, progressPercent: 91, hoursLogged: 148 },
];

// ========== MOCK PROJECTS ==========
export const mockProjects: ProjectData[] = [
    // Banking projects
    { id: 'prj-1', name: 'Core Banking Platform', client: 'HDFC Bank', startDate: '2025-06-15', endDate: '2026-06-15', status: 'active', progressPercent: 65, teamId: 'banking', managerId: 'mgr-ravi', tlId: 'tl-suresh', assignedEmployees: ['emp-1', 'emp-2', 'emp-3'] },
    { id: 'prj-2', name: 'Mobile Banking App', client: 'ICICI Bank', startDate: '2025-08-01', endDate: '2026-04-30', status: 'active', progressPercent: 72, teamId: 'banking', managerId: 'mgr-ravi', tlId: 'tl-nithya', assignedEmployees: ['emp-5', 'emp-6'] },
    { id: 'prj-3', name: 'Payment Gateway v2', client: 'Axis Bank', startDate: '2025-03-01', endDate: '2025-12-31', status: 'delayed', progressPercent: 45, teamId: 'banking', managerId: 'mgr-ravi', tlId: 'tl-mohan', assignedEmployees: ['emp-7'] },
    { id: 'prj-4', name: 'Fraud Detection System', client: 'SBI', startDate: '2025-09-15', endDate: '2026-09-15', status: 'active', progressPercent: 38, teamId: 'banking', managerId: 'mgr-priya', tlId: 'tl-kavitha', assignedEmployees: ['emp-8', 'emp-9'] },
    { id: 'prj-5', name: 'KYC Automation', client: 'Yes Bank', startDate: '2025-04-01', endDate: '2026-01-31', status: 'completed', progressPercent: 100, teamId: 'banking', managerId: 'mgr-priya', tlId: 'tl-ramesh', assignedEmployees: [] },
    // Healthcare projects
    { id: 'prj-6', name: 'Patient Management System', client: 'Apollo Hospitals', startDate: '2025-07-01', endDate: '2026-07-01', status: 'active', progressPercent: 55, teamId: 'healthcare', managerId: 'mgr-ankit', tlId: 'tl-deepak', assignedEmployees: ['emp-10', 'emp-11', 'emp-12'] },
    { id: 'prj-7', name: 'Telemedicine Platform', client: 'Max Healthcare', startDate: '2025-10-01', endDate: '2026-08-31', status: 'active', progressPercent: 30, teamId: 'healthcare', managerId: 'mgr-ankit', tlId: 'tl-pooja', assignedEmployees: [] },
    { id: 'prj-8', name: 'Lab Report Digitization', client: 'Fortis', startDate: '2025-02-01', endDate: '2025-11-30', status: 'delayed', progressPercent: 60, teamId: 'healthcare', managerId: 'mgr-sneha', tlId: 'tl-deepak', assignedEmployees: ['emp-10'] },
    // E-Commerce projects
    { id: 'prj-9', name: 'Marketplace Platform', client: 'ShopEase', startDate: '2025-05-01', endDate: '2026-05-01', status: 'active', progressPercent: 68, teamId: 'ecommerce', managerId: 'mgr-vikram', tlId: 'tl-rajesh', assignedEmployees: ['emp-13', 'emp-14'] },
    { id: 'prj-10', name: 'Inventory Management', client: 'RetailMax', startDate: '2025-08-15', endDate: '2026-02-28', status: 'active', progressPercent: 82, teamId: 'ecommerce', managerId: 'mgr-vikram', tlId: 'tl-aisha', assignedEmployees: ['emp-15', 'emp-16'] },
    { id: 'prj-11', name: 'Customer Analytics', client: 'BuyNow', startDate: '2025-01-15', endDate: '2025-10-31', status: 'delayed', progressPercent: 40, teamId: 'ecommerce', managerId: 'mgr-meera', tlId: 'tl-harsh', assignedEmployees: [] },
    // Fintech projects
    { id: 'prj-12', name: 'UPI Integration Suite', client: 'PayFast', startDate: '2025-06-01', endDate: '2026-06-01', status: 'active', progressPercent: 58, teamId: 'fintech', managerId: 'mgr-arjun', tlId: 'tl-suresh', assignedEmployees: ['emp-1', 'emp-3'] },
    { id: 'prj-13', name: 'Lending Platform', client: 'QuickLoan', startDate: '2025-09-01', endDate: '2026-09-01', status: 'active', progressPercent: 25, teamId: 'fintech', managerId: 'mgr-divya', tlId: 'tl-kavitha', assignedEmployees: ['emp-8'] },
    // Logistics projects
    { id: 'prj-14', name: 'Fleet Tracking System', client: 'TransCo', startDate: '2025-04-15', endDate: '2026-04-15', status: 'active', progressPercent: 70, teamId: 'logistics', managerId: 'mgr-karthik', tlId: 'tl-nithya', assignedEmployees: ['emp-5', 'emp-6'] },
    { id: 'prj-15', name: 'Warehouse Management', client: 'StorageHub', startDate: '2025-11-01', endDate: '2026-11-01', status: 'active', progressPercent: 15, teamId: 'logistics', managerId: 'mgr-lakshmi', tlId: 'tl-mohan', assignedEmployees: ['emp-7'] },
];

// ========== HELPER FUNCTIONS ==========
export function getManagersByTeam(teamId: string): ManagerData[] {
    return mockManagers.filter(m => m.teamId === teamId);
}

export function getTLsByManager(managerId: string): TLData[] {
    return mockTLs.filter(tl => tl.managerId === managerId);
}

export function getEmployeesByTL(tlId: string): EmployeeData[] {
    return mockEmployees.filter(e => e.tlId === tlId);
}

export function getProjectsByFilters(filters: {
    teamId?: string;
    managerId?: string;
    tlId?: string;
    employeeId?: string;
}): ProjectData[] {
    let projects = mockProjects;
    if (filters.teamId) projects = projects.filter(p => p.teamId === filters.teamId);
    if (filters.managerId) projects = projects.filter(p => p.managerId === filters.managerId);
    if (filters.tlId) projects = projects.filter(p => p.tlId === filters.tlId);
    if (filters.employeeId) projects = projects.filter(p => p.assignedEmployees.includes(filters.employeeId!));
    return projects;
}

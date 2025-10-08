// API configuration and endpoints
const API_BASE_URL = 'http://localhost:3001/api';

// Generic fetch wrapper with error handling
async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}

// Patient API
export const patientAPI = {
  getAll: () => fetchAPI<Patient[]>('/patients'),
  getById: (id: number) => fetchAPI<Patient>(`/patients/${id}`),
  create: (patient: Omit<Patient, 'patientid'>) => 
    fetchAPI<Patient>('/patients', {
      method: 'POST',
      body: JSON.stringify(patient),
    }),
  update: (id: number, patient: Partial<Patient>) =>
    fetchAPI<Patient>(`/patients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(patient),
    }),
  delete: (id: number) =>
    fetchAPI<void>(`/patients/${id}`, { method: 'DELETE' }),
};

// Doctor API
export const doctorAPI = {
  getAll: () => fetchAPI<Doctor[]>('/doctors'),
  getById: (id: number) => fetchAPI<Doctor>(`/doctors/${id}`),
  create: (doctor: Omit<Doctor, 'doctorID'>) =>
    fetchAPI<Doctor>('/doctors', {
      method: 'POST',
      body: JSON.stringify(doctor),
    }),
  update: (id: number, doctor: Partial<Doctor>) =>
    fetchAPI<Doctor>(`/doctors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(doctor),
    }),
  delete: (id: number) =>
    fetchAPI<void>(`/doctors/${id}`, { method: 'DELETE' }),
};

// Visit API
export const visitAPI = {
  getAll: () => fetchAPI<Visit[]>('/visits'),
  getById: (id: number) => fetchAPI<Visit>(`/visits/${id}`),
  create: (visit: Omit<Visit, 'visitID'>) =>
    fetchAPI<Visit>('/visits', {
      method: 'POST',
      body: JSON.stringify(visit),
    }),
  update: (id: number, visit: Partial<Visit>) =>
    fetchAPI<Visit>(`/visits/${id}`, {
      method: 'PUT',
      body: JSON.stringify(visit),
    }),
  delete: (id: number) =>
    fetchAPI<void>(`/visits/${id}`, { method: 'DELETE' }),
};

// Location API
export const locationAPI = {
  getAll: () => fetchAPI<ClinicLocation[]>('/locations'),
  getById: (id: number) => fetchAPI<ClinicLocation>(`/locations/${id}`),
};

// Visit Type API
export const visitTypeAPI = {
  getAll: () => fetchAPI<VisitType[]>('/visittypes'),
};

// Dashboard stats API
export const dashboardAPI = {
  getStats: () => fetchAPI<DashboardStats>('/dashboard/stats'),
  getRecentActivity: () => fetchAPI<RecentActivity[]>('/dashboard/activity'),
};

// Type definitions matching MySQL schema
export interface Patient {
  patientid: number;
  Name: string;
  DOB: string;
  Phone: string;
  Height: number;
  Weight: number;
  Remarks: string;
  Address: string;
  lastModified: string;
}

export interface Doctor {
  doctorID: number;
  Name: string;
  Speciality: string;
  Phone: string;
  lastModified: string;
}

export interface Visit {
  visitID: number;
  patientID: number;
  prescriptionImage1?: string;
  prescriptionImage2?: string;
  DoctorNotes: string;
  Followup: string;
  Fee: number;
  doctorID: number;
  visitTypeID: number;
  clinicLocationID: number;
  isCompleted: boolean;
  // Joined data
  patientName?: string;
  doctorName?: string;
  locationName?: string;
  visitTypeName?: string;
}

export interface VisitType {
  visitTypeID: number;
  visitTypeName: string;
  lastModified: string;
}

export interface ClinicLocation {
  LocationID: number;
  LocationName: string;
  Address: string;
  phone: string;
  email: string;
  lastModified: string;
}

export interface DashboardStats {
  totalPatients: number;
  activeDoctors: number;
  todayVisits: number;
  totalLocations: number;
  patientTrend: string;
  visitTrend: string;
}

export interface RecentActivity {
  id: number;
  patientName: string;
  action: string;
  time: string;
  doctorName: string;
}

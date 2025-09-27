import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface User {
  id: string;
  name: string;
  email: string;
  totalAppointments?: number;
  totalPrescriptions?: number;
  nextAppointment?: Appointment;
  appointments?: Appointment[];
  prescriptions?: Prescription[];
}

export interface Appointment {
  id: string;
  provider: string;
  datetime: string;
  repeat: 'weekly' | 'monthly' | 'none';
  isActive: boolean;
}

export interface Prescription {
  id: string;
  medication: string;
  dosage: string;
  quantity: number;
  refill_on: string;
  refill_schedule: 'weekly' | 'monthly';
}

export interface PatientDashboard {
  patient: User;
  upcomingAppointments: Appointment[];
  upcomingRefills: Prescription[];
}

export interface LoginResponse {
  token: string;
  user: User;
}

// Auth API
export const authAPI = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await api.post('/login', { email, password });
    return response.data;
  },
};

// Patient API
export const patientAPI = {
  getAllPatients: async (): Promise<User[]> => {
    const response = await api.get('/admin/patients');
    return response.data;
  },

  getPatientDetails: async (userId: string): Promise<User> => {
    const response = await api.get(`/admin/patients/${userId}`);
    return response.data;
  },

  createPatient: async (patientData: { name: string; email: string; password: string }): Promise<User> => {
    const response = await api.post('/admin/patients', patientData);
    return response.data;
  },

  updatePatient: async (userId: string, patientData: { name: string; email: string }): Promise<User> => {
    const response = await api.put(`/admin/patients/${userId}`, patientData);
    return response.data;
  },

  deletePatient: async (userId: string): Promise<void> => {
    await api.delete(`/admin/patients/${userId}`);
  },

  getPatientDashboard: async (userId: string): Promise<PatientDashboard> => {
    const response = await api.get(`/patient/${userId}/dashboard`);
    return response.data;
  },
};

// Appointment API
export const appointmentAPI = {
  createAppointment: async (userId: string, appointmentData: {
    provider: string;
    datetime: string;
    repeat: 'weekly' | 'monthly' | 'none';
  }): Promise<Appointment> => {
    const response = await api.post(`/admin/patients/${userId}/appointments`, appointmentData);
    return response.data;
  },

  updateAppointment: async (userId: string, appointmentId: string, appointmentData: {
    provider?: string;
    datetime?: string;
    repeat?: 'weekly' | 'monthly' | 'none';
    isActive?: boolean;
  }): Promise<Appointment> => {
    const response = await api.put(`/admin/patients/${userId}/appointments/${appointmentId}`, appointmentData);
    return response.data;
  },

  deleteAppointment: async (userId: string, appointmentId: string): Promise<void> => {
    await api.delete(`/admin/patients/${userId}/appointments/${appointmentId}`);
  },

  getPatientAppointments: async (userId: string): Promise<Appointment[]> => {
    const response = await api.get(`/patient/${userId}/appointments`);
    return response.data;
  },

  // New appointment booking functions
  bookAppointment: async (userId: string, appointmentData: {
    provider: string;
    datetime: string;
    repeat?: 'weekly' | 'monthly' | 'none';
  }): Promise<{ message: string; appointment: Appointment }> => {
    const response = await api.post('/appointments/book', {
      userId,
      ...appointmentData
    });
    return response.data;
  },

  getProviderAvailability: async (provider: string, date: string): Promise<{
    provider: string;
    date: string;
    availableSlots: string[];
  }> => {
    const response = await api.get(`/appointments/availability/${provider}?date=${date}`);
    return response.data;
  },
};

// Prescription API
export const prescriptionAPI = {
  createPrescription: async (userId: string, prescriptionData: {
    medication: string;
    dosage: string;
    quantity: number;
    refill_on: string;
    refill_schedule: 'weekly' | 'monthly';
  }): Promise<Prescription> => {
    const response = await api.post(`/admin/patients/${userId}/prescriptions`, prescriptionData);
    return response.data;
  },

  updatePrescription: async (userId: string, prescriptionId: string, prescriptionData: {
    medication?: string;
    dosage?: string;
    quantity?: number;
    refill_on?: string;
    refill_schedule?: 'weekly' | 'monthly';
  }): Promise<Prescription> => {
    const response = await api.put(`/admin/patients/${userId}/prescriptions/${prescriptionId}`, prescriptionData);
    return response.data;
  },

  deletePrescription: async (userId: string, prescriptionId: string): Promise<void> => {
    await api.delete(`/admin/patients/${userId}/prescriptions/${prescriptionId}`);
  },

  getPatientPrescriptions: async (userId: string): Promise<Prescription[]> => {
    const response = await api.get(`/patient/${userId}/prescriptions`);
    return response.data;
  },
};

export default api;

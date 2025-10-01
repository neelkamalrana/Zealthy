import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

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
    const response = await api.post('/auth/login', { email, password });
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
    // Since the user data is already available from login, we'll return a mock dashboard
    // In a real app, this would call a dedicated dashboard endpoint
    const userData = localStorage.getItem('user');
    if (!userData) throw new Error('User not found');
    
    const user = JSON.parse(userData);
    
    // Create dashboard data from user's appointments and prescriptions
    const upcomingAppointments = user.appointments?.filter((apt: any) => {
      const aptDate = new Date(apt.datetime);
      const now = new Date();
      return aptDate >= now && apt.isActive;
    }) || [];
    
    const upcomingRefills = user.prescriptions?.filter((pres: any) => {
      return pres.isActive;
    }) || [];
    
    return {
      patient: user,
      upcomingAppointments,
      upcomingRefills
    };
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
    // Get appointments from user data in localStorage
    const userData = localStorage.getItem('user');
    if (!userData) throw new Error('User not found');
    
    const user = JSON.parse(userData);
    return user.appointments || [];
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
    const encodedProvider = encodeURIComponent(provider);
    const response = await api.get(`/appointments/availability/${encodedProvider}?date=${date}`);
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
    // Get prescriptions from user data in localStorage
    const userData = localStorage.getItem('user');
    if (!userData) throw new Error('User not found');
    
    const user = JSON.parse(userData);
    return user.prescriptions || [];
  },
};

export default api;

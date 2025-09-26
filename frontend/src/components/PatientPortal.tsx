import React, { useState, useEffect } from 'react';
import { authAPI, patientAPI, appointmentAPI, prescriptionAPI, User, PatientDashboard, Appointment, Prescription } from '../services/api';

const PatientPortal: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [dashboard, setDashboard] = useState<PatientDashboard | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [currentView, setCurrentView] = useState<'dashboard' | 'appointments' | 'prescriptions'>('dashboard');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setIsLoggedIn(true);
      loadDashboard(parsedUser.id);
    }
  }, []);

  const loadDashboard = async (userId: string) => {
    try {
      const dashboardData = await patientAPI.getPatientDashboard(userId);
      setDashboard(dashboardData);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    }
  };

  const loadAppointments = async (userId: string) => {
    try {
      const appointmentsData = await appointmentAPI.getPatientAppointments(userId);
      setAppointments(appointmentsData);
    } catch (error) {
      console.error('Error loading appointments:', error);
    }
  };

  const loadPrescriptions = async (userId: string) => {
    try {
      const prescriptionsData = await prescriptionAPI.getPatientPrescriptions(userId);
      setPrescriptions(prescriptionsData);
    } catch (error) {
      console.error('Error loading prescriptions:', error);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await authAPI.login(loginForm.email, loginForm.password);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      setUser(response.user);
      setIsLoggedIn(true);
      loadDashboard(response.user.id);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Login failed');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsLoggedIn(false);
    setDashboard(null);
    setAppointments([]);
    setPrescriptions([]);
    setCurrentView('dashboard');
  };

  const handleViewChange = (view: 'dashboard' | 'appointments' | 'prescriptions') => {
    setCurrentView(view);
    if (user) {
      if (view === 'appointments') {
        loadAppointments(user.id);
      } else if (view === 'prescriptions') {
        loadPrescriptions(user.id);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isLoggedIn) {
    return (
      <div className="container">
        <div className="login-form">
          <h2>Patient Portal Login</h2>
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                id="email"
                value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password:</label>
              <input
                type="password"
                id="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                required
              />
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <button type="submit" className="btn">Login</button>
          </form>
          <p style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
            Demo credentials:<br />
            Email: mark@some-email-provider.net<br />
            Password: Password123!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="nav">
        <h1>Zealthy Patient Portal</h1>
        <div>
          <button 
            className={`btn ${currentView === 'dashboard' ? 'active' : 'btn-secondary'}`}
            onClick={() => handleViewChange('dashboard')}
          >
            Dashboard
          </button>
          <button 
            className={`btn ${currentView === 'appointments' ? 'active' : 'btn-secondary'}`}
            onClick={() => handleViewChange('appointments')}
          >
            Appointments
          </button>
          <button 
            className={`btn ${currentView === 'prescriptions' ? 'active' : 'btn-secondary'}`}
            onClick={() => handleViewChange('prescriptions')}
          >
            Prescriptions
          </button>
          <button className="btn btn-secondary" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {currentView === 'dashboard' && dashboard && (
        <div>
          <h2>Welcome, {dashboard.patient.name}!</h2>
          
          <div className="dashboard-grid">
            <div className="dashboard-card">
              <h3>Patient Information</h3>
              <p><strong>Name:</strong> {dashboard.patient.name}</p>
              <p><strong>Email:</strong> {dashboard.patient.email}</p>
            </div>

            <div className="dashboard-card">
              <h3>Upcoming Appointments (Next 7 Days)</h3>
              {dashboard.upcomingAppointments.length > 0 ? (
                <ul>
                  {dashboard.upcomingAppointments.map((apt) => (
                    <li key={apt.id}>
                      <strong>{apt.provider}</strong><br />
                      {formatDate(apt.datetime)}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No upcoming appointments in the next 7 days.</p>
              )}
            </div>

            <div className="dashboard-card">
              <h3>Upcoming Refills (Next 7 Days)</h3>
              {dashboard.upcomingRefills.length > 0 ? (
                <ul>
                  {dashboard.upcomingRefills.map((pres) => (
                    <li key={pres.id}>
                      <strong>{pres.medication}</strong> {pres.dosage}<br />
                      Refill due: {formatDate(pres.refill_on)}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No upcoming refills in the next 7 days.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {currentView === 'appointments' && (
        <div>
          <h2>Appointment Schedule (Next 3 Months)</h2>
          {appointments.length > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Provider</th>
                  <th>Date & Time</th>
                  <th>Repeat Schedule</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((apt) => (
                  <tr key={apt.id}>
                    <td>{apt.provider}</td>
                    <td>{formatDate(apt.datetime)}</td>
                    <td>{apt.repeat}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No upcoming appointments scheduled.</p>
          )}
        </div>
      )}

      {currentView === 'prescriptions' && (
        <div>
          <h2>Current Prescriptions</h2>
          {prescriptions.length > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Medication</th>
                  <th>Dosage</th>
                  <th>Quantity</th>
                  <th>Next Refill</th>
                  <th>Refill Schedule</th>
                </tr>
              </thead>
              <tbody>
                {prescriptions.map((pres) => (
                  <tr key={pres.id}>
                    <td>{pres.medication}</td>
                    <td>{pres.dosage}</td>
                    <td>{pres.quantity}</td>
                    <td>{formatDate(pres.refill_on)}</td>
                    <td>{pres.refill_schedule}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No current prescriptions.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default PatientPortal;

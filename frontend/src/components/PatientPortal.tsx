import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI, patientAPI, appointmentAPI, prescriptionAPI, User, PatientDashboard, Appointment, Prescription } from '../services/api';

const PatientPortal: React.FC = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [dashboard, setDashboard] = useState<PatientDashboard | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [currentView, setCurrentView] = useState<'dashboard' | 'appointments' | 'prescriptions' | 'book-appointment'>('dashboard');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  
  // Appointment booking state
  const [bookingForm, setBookingForm] = useState({
    provider: '',
    date: '',
    time: '',
    repeat: 'none' as 'weekly' | 'monthly' | 'none'
  });
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [providers] = useState(['Dr Kim West', 'Dr Lin James', 'Dr Sally Field']);
  const [showBookingModal, setShowBookingModal] = useState(false);

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

  const handleViewChange = (view: 'dashboard' | 'appointments' | 'prescriptions' | 'book-appointment') => {
    setCurrentView(view);
    if (user) {
      if (view === 'appointments') {
        loadAppointments(user.id);
      } else if (view === 'prescriptions') {
        loadPrescriptions(user.id);
      }
    }
  };

  // Appointment booking functions
  const loadAvailableSlots = async (provider: string, date: string) => {
    try {
      console.log(`Loading availability for ${provider} on ${date}`);
      const availability = await appointmentAPI.getProviderAvailability(provider, date);
      console.log('Availability response:', availability);
      console.log('Available slots count:', availability.availableSlots?.length || 0);
      setAvailableSlots(availability.availableSlots || []);
    } catch (error) {
      console.error('Error loading availability:', error);
      console.error('Error details:', error);
      setAvailableSlots([]);
    }
  };

  const handleBookingFormChange = async (field: string, value: string) => {
    const updatedForm = { ...bookingForm, [field]: value };
    setBookingForm(updatedForm);
    
    // Load available slots when provider or date changes
    if (field === 'provider' && value && updatedForm.date) {
      await loadAvailableSlots(value, updatedForm.date);
    } else if (field === 'date' && value && updatedForm.provider) {
      await loadAvailableSlots(updatedForm.provider, value);
    }
  };

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const datetime = `${bookingForm.date}T${bookingForm.time}`;
      const response = await appointmentAPI.bookAppointment(user.id, {
        provider: bookingForm.provider,
        datetime,
        repeat: bookingForm.repeat
      });

      // Update the user data in localStorage with the new appointment
      const updatedUser = { ...user };
      if (!updatedUser.appointments) {
        updatedUser.appointments = [];
      }
      updatedUser.appointments.push(response.appointment);
      
      // Update localStorage with the new user data
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Update the state
      setUser(updatedUser);

      setError('');
      setShowBookingModal(false);
      setBookingForm({ provider: '', date: '', time: '', repeat: 'none' });
      setAvailableSlots([]);
      
      // Reload dashboard and appointments with updated data
      await loadDashboard(user.id);
      await loadAppointments(user.id);
      
      alert('Appointment booked successfully!');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to book appointment');
    }
  };

  const formatTimeSlot = (slot: string) => {
    const date = new Date(slot);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
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
      <div>
        {/* Section ONE - Marketing Banner */}
        <div className="marketing-banner">
          <a href="/black-friday" style={{ color: 'inherit', textDecoration: 'inherit' }}>
            Limited Time: $96 off Zealthy Weight Loss Program
          </a>
        </div>
        
        {/* Section TWO - Fixed Navigation */}
        <div className="fixed-nav">
          <div className="zealthy-logo">
            <div className="zealthy-logo-text">ZEALTHY</div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div>
              <a href="#services">Services</a>
              <a href="#weight-loss">Weight Loss Program</a>
              <a href="#about">About</a>
              <a href="#careers">Careers</a>
              <a href="#login">Log In</a>
            </div>
            <button className="btn btn-success">Sign Up</button>
          </div>
        </div>

        {/* Section THREE - Scrollable Content */}
        <div className="scrollable-content">
          <div className="container">
            <h1>Patient Portal</h1>
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
        </div>
      </div>
    );
  }

    return (
      <div>
        {/* Section ONE - Marketing Banner */}
        <div className="marketing-banner">
          <a href="/black-friday" style={{ color: 'inherit', textDecoration: 'inherit' }}>
            Limited Time: $96 off Zealthy Weight Loss Program
          </a>
        </div>
        
        {/* Section TWO - Fixed Navigation */}
        <div className="fixed-nav">
          <div className="zealthy-logo">
            <div className="zealthy-logo-text">ZEALTHY</div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <h1>Patient Portal</h1>
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
          <button 
            className="btn btn-book-appointment"
            onClick={() => setShowBookingModal(true)}
          >
            Book Appointment
          </button>
          <button className="btn btn-secondary" onClick={handleLogout}>
            Logout
          </button>
            </div>
          </div>
        </div>

        {/* Section THREE - Scrollable Content */}
        <div className="scrollable-content">
          <div className="container">

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

      {/* Appointment Booking Modal */}
      {showBookingModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Book New Appointment</h2>
              <button className="close-btn" onClick={() => setShowBookingModal(false)}>
                ×
              </button>
            </div>
            
            <form onSubmit={handleBookAppointment}>
              <div className="form-group">
                <label>Provider:</label>
                <select
                  value={bookingForm.provider}
                  onChange={(e) => handleBookingFormChange('provider', e.target.value)}
                  required
                >
                  <option value="">Select a provider</option>
                  {providers.map(provider => (
                    <option key={provider} value={provider}>{provider}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Date:</label>
                <input
                  type="date"
                  value={bookingForm.date}
                  onChange={(e) => handleBookingFormChange('date', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              {bookingForm.provider && bookingForm.date && (
                <div className="form-group">
                  <label>Available Time Slots:</label>
                  {availableSlots.length > 0 ? (
                    <select
                      value={bookingForm.time}
                      onChange={(e) => setBookingForm(prev => ({ ...prev, time: e.target.value }))}
                      required
                    >
                      <option value="">Select a time slot</option>
                      {availableSlots.map(slot => (
                        <option key={slot} value={new Date(slot).toTimeString().slice(0, 5)}>
                          {formatTimeSlot(slot)}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="alert alert-error">
                      No available slots for {bookingForm.provider} on {new Date(bookingForm.date).toLocaleDateString()}.
                    </div>
                  )}
                </div>
              )}

              <div className="form-group">
                <label>Repeat:</label>
                <select
                  value={bookingForm.repeat}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, repeat: e.target.value as 'weekly' | 'monthly' | 'none' }))}
                >
                  <option value="none">No repeat</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              {error && <div className="alert alert-error">{error}</div>}

              <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn btn-success" disabled={!bookingForm.provider || !bookingForm.date || !bookingForm.time}>
                  Book Appointment
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowBookingModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
          </div>
        </div>
      </div>
    );
  };

export default PatientPortal;

import React, { useState, useEffect } from 'react';
import { patientAPI, appointmentAPI, prescriptionAPI, User, Appointment, Prescription } from '../services/api';

const AdminEMR: React.FC = () => {
  const [patients, setPatients] = useState<User[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<'patients' | 'patient-details'>('patients');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'patient' | 'appointment' | 'prescription' | 'provider'>('patient');
  const [editingItem, setEditingItem] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [patientForm, setPatientForm] = useState({ name: '', email: '', password: '' });
  const [appointmentForm, setAppointmentForm] = useState({ provider: '', datetime: '', repeat: 'none' as 'weekly' | 'monthly' | 'none' });
  const [prescriptionForm, setPrescriptionForm] = useState({ 
    medication: '', 
    dosage: '', 
    quantity: 1, 
    refill_on: '', 
    refill_schedule: 'monthly' as 'weekly' | 'monthly' 
  });
  const [providerForm, setProviderForm] = useState({ name: '', specialty: '' });

  const medications = ['Diovan', 'Lexapro', 'Metformin', 'Ozempic', 'Prozac', 'Seroquel', 'Tegretol'];
  const dosages = ['1mg', '2mg', '3mg', '5mg', '10mg', '25mg', '50mg', '100mg', '250mg', '500mg', '1000mg'];
  const specialties = [
    'Cardiology',
    'Dermatology', 
    'Endocrinology',
    'Gastroenterology',
    'General Practice',
    'Neurology',
    'Oncology',
    'Orthopedics',
    'Pediatrics',
    'Psychiatry'
  ];
  const [providers, setProviders] = useState(['Dr Kim West', 'Dr Lin James', 'Dr Sally Field']);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const patientsData = await patientAPI.getAllPatients();
      setPatients(patientsData);
    } catch (error) {
      setError('Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  const loadPatientDetails = async (patientId: string) => {
    try {
      const patientData = await patientAPI.getPatientDetails(patientId);
      setSelectedPatient(patientData);
      setCurrentView('patient-details');
    } catch (error) {
      setError('Failed to load patient details');
    }
  };

  const handleCreatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await patientAPI.createPatient(patientForm);
      setShowModal(false);
      setPatientForm({ name: '', email: '', password: '' });
      loadPatients();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to create patient');
    }
  };

  const handleUpdatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;
    
    try {
      await patientAPI.updatePatient(selectedPatient.id, patientForm);
      setShowModal(false);
      setPatientForm({ name: '', email: '', password: '' });
      loadPatientDetails(selectedPatient.id);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to update patient');
    }
  };

  const handleDeletePatient = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this patient? This action cannot be undone.')) {
      try {
        await patientAPI.deletePatient(userId);
        setCurrentView('patients');
        setSelectedPatient(null);
        loadPatients();
      } catch (error: any) {
        setError(error.response?.data?.message || 'Failed to delete patient');
      }
    }
  };

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;
    
    try {
      await appointmentAPI.createAppointment(selectedPatient.id, appointmentForm);
      setShowModal(false);
      setAppointmentForm({ provider: '', datetime: '', repeat: 'none' });
      loadPatientDetails(selectedPatient.id);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to create appointment');
    }
  };

  const handleUpdateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient || !editingItem) return;
    
    try {
      await appointmentAPI.updateAppointment(selectedPatient.id, editingItem.id, appointmentForm);
      setShowModal(false);
      setAppointmentForm({ provider: '', datetime: '', repeat: 'none' });
      setEditingItem(null);
      loadPatientDetails(selectedPatient.id);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to update appointment');
    }
  };

  const handleDeleteAppointment = async (appointmentId: string) => {
    if (!selectedPatient) return;
    
    if (window.confirm('Are you sure you want to deactivate this appointment?')) {
      try {
        await appointmentAPI.deleteAppointment(selectedPatient.id, appointmentId);
        loadPatientDetails(selectedPatient.id);
      } catch (error) {
        setError('Failed to delete appointment');
      }
    }
  };

  const handleCreatePrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;
    
    try {
      await prescriptionAPI.createPrescription(selectedPatient.id, prescriptionForm);
      setShowModal(false);
      setPrescriptionForm({ medication: '', dosage: '', quantity: 1, refill_on: '', refill_schedule: 'monthly' });
      loadPatientDetails(selectedPatient.id);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to create prescription');
    }
  };

  const handleUpdatePrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient || !editingItem) return;
    
    try {
      await prescriptionAPI.updatePrescription(selectedPatient.id, editingItem.id, prescriptionForm);
      setShowModal(false);
      setPrescriptionForm({ medication: '', dosage: '', quantity: 1, refill_on: '', refill_schedule: 'monthly' });
      setEditingItem(null);
      loadPatientDetails(selectedPatient.id);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to update prescription');
    }
  };

  const handleDeletePrescription = async (prescriptionId: string) => {
    if (!selectedPatient) return;
    
    if (window.confirm('Are you sure you want to delete this prescription?')) {
      try {
        await prescriptionAPI.deletePrescription(selectedPatient.id, prescriptionId);
        loadPatientDetails(selectedPatient.id);
      } catch (error) {
        setError('Failed to delete prescription');
      }
    }
  };

  const handleCreateProvider = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newProvider = `Dr ${providerForm.name}`;
      setProviders([...providers, newProvider]);
      setShowModal(false);
      setProviderForm({ name: '', specialty: '' });
    } catch (error: any) {
      setError('Failed to create provider');
    }
  };

  const openModal = (type: 'patient' | 'appointment' | 'prescription' | 'provider', item?: any) => {
    setModalType(type);
    setEditingItem(item);
    setShowModal(true);
    setError('');

    if (type === 'patient') {
      if (item) {
        setPatientForm({ name: item.name, email: item.email, password: '' });
      } else {
        setPatientForm({ name: '', email: '', password: '' });
      }
    } else if (type === 'appointment') {
      if (item) {
        setAppointmentForm({
          provider: item.provider,
          datetime: new Date(item.datetime).toISOString().slice(0, 16),
          repeat: item.repeat
        });
      } else {
        setAppointmentForm({ provider: '', datetime: '', repeat: 'none' });
      }
    } else if (type === 'prescription') {
      if (item) {
        setPrescriptionForm({
          medication: item.medication,
          dosage: item.dosage,
          quantity: item.quantity,
          refill_on: new Date(item.refill_on).toISOString().slice(0, 10),
          refill_schedule: item.refill_schedule
        });
      } else {
        setPrescriptionForm({ medication: '', dosage: '', quantity: 1, refill_on: '', refill_schedule: 'monthly' });
      }
    } else if (type === 'provider') {
      setProviderForm({ name: '', specialty: '' });
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

  const renderModal = () => {
    if (!showModal) return null;

    return (
      <div className="modal">
        <div className="modal-content">
          <div className="modal-header">
            <h2>
              {editingItem ? 'Edit' : 'Add'} {modalType === 'patient' ? 'Patient' : modalType === 'appointment' ? 'Appointment' : modalType === 'prescription' ? 'Prescription' : 'Provider'}
            </h2>
            <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={
            modalType === 'patient' 
              ? (editingItem ? handleUpdatePatient : handleCreatePatient)
              : modalType === 'appointment'
              ? (editingItem ? handleUpdateAppointment : handleCreateAppointment)
              : modalType === 'prescription'
              ? (editingItem ? handleUpdatePrescription : handleCreatePrescription)
              : handleCreateProvider
          }>
            {modalType === 'patient' && (
              <>
                <div className="form-group">
                  <label>Name:</label>
                  <input
                    type="text"
                    value={patientForm.name}
                    onChange={(e) => setPatientForm({ ...patientForm, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email:</label>
                  <input
                    type="email"
                    value={patientForm.email}
                    onChange={(e) => setPatientForm({ ...patientForm, email: e.target.value })}
                    required
                  />
                </div>
                {!editingItem && (
                  <div className="form-group">
                    <label>Password:</label>
                    <input
                      type="password"
                      value={patientForm.password}
                      onChange={(e) => setPatientForm({ ...patientForm, password: e.target.value })}
                      required
                    />
                  </div>
                )}
              </>
            )}

            {modalType === 'appointment' && (
              <>
                <div className="form-group">
                  <label>Provider:</label>
                  <select
                    value={appointmentForm.provider}
                    onChange={(e) => setAppointmentForm({ ...appointmentForm, provider: e.target.value })}
                    required
                  >
                    <option value="">Select provider</option>
                    {providers.map(provider => (
                      <option key={provider} value={provider}>{provider}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Date & Time:</label>
                  <input
                    type="datetime-local"
                    value={appointmentForm.datetime}
                    onChange={(e) => setAppointmentForm({ ...appointmentForm, datetime: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Repeat Schedule:</label>
                  <select
                    value={appointmentForm.repeat}
                    onChange={(e) => setAppointmentForm({ ...appointmentForm, repeat: e.target.value as 'weekly' | 'monthly' | 'none' })}
                  >
                    <option value="none">None</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </>
            )}

            {modalType === 'prescription' && (
              <>
                <div className="form-group">
                  <label>Medication:</label>
                  <select
                    value={prescriptionForm.medication}
                    onChange={(e) => setPrescriptionForm({ ...prescriptionForm, medication: e.target.value })}
                    required
                  >
                    <option value="">Select medication</option>
                    {medications.map(med => (
                      <option key={med} value={med}>{med}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Dosage:</label>
                  <select
                    value={prescriptionForm.dosage}
                    onChange={(e) => setPrescriptionForm({ ...prescriptionForm, dosage: e.target.value })}
                    required
                  >
                    <option value="">Select dosage</option>
                    {dosages.map(dosage => (
                      <option key={dosage} value={dosage}>{dosage}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Quantity:</label>
                  <input
                    type="number"
                    min="1"
                    value={prescriptionForm.quantity}
                    onChange={(e) => setPrescriptionForm({ ...prescriptionForm, quantity: parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Refill Date:</label>
                  <input
                    type="date"
                    value={prescriptionForm.refill_on}
                    onChange={(e) => setPrescriptionForm({ ...prescriptionForm, refill_on: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Refill Schedule:</label>
                  <select
                    value={prescriptionForm.refill_schedule}
                    onChange={(e) => setPrescriptionForm({ ...prescriptionForm, refill_schedule: e.target.value as 'weekly' | 'monthly' })}
                  >
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </>
            )}

            {modalType === 'provider' && (
              <>
                <div className="form-group">
                  <label>Provider Name:</label>
                  <input
                    type="text"
                    value={providerForm.name}
                    onChange={(e) => setProviderForm({ ...providerForm, name: e.target.value })}
                    placeholder="e.g., John Smith"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Specialty:</label>
                  <select
                    value={providerForm.specialty}
                    onChange={(e) => setProviderForm({ ...providerForm, specialty: e.target.value })}
                    required
                  >
                    <option value="">Select specialty</option>
                    {specialties.map(specialty => (
                      <option key={specialty} value={specialty}>{specialty}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            <div style={{ marginTop: '20px' }}>
              <button type="submit" className="btn btn-success">
                {editingItem ? 'Update' : 'Create'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  if (currentView === 'patients') {
    return (
      <div>
        {/* Section ONE - Marketing Banner */}
        <div className="marketing-banner">
          Limited Time: $96 off <a href="#">Zealthy Weight Loss Program</a>
        </div>
        
        {/* Section TWO - Fixed Navigation */}
        <div className="fixed-nav">
          <div className="zealthy-logo">
            <div className="zealthy-logo-text">ZEALTHY</div>
          </div>
          <div className="admin-nav-right">
            <h1>Mini EMR</h1>
            <div>
            <button className="btn btn-danger" onClick={() => openModal('patient')} style={{ marginRight: '10px' }}>
              Add New Patient
            </button>
            <button className="btn btn-danger" onClick={() => openModal('provider')}>
              Add New Provider
            </button>
            </div>
          </div>
        </div>

        {/* Section THREE - Scrollable Content */}
        <div className="scrollable-content">
          <div className="container">

        {error && <div className="alert alert-error">{error}</div>}

        <div className="card">
          <h2>Patient List</h2>
          {loading ? (
            <p>Loading patients...</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Total Appointments</th>
                  <th>Total Prescriptions</th>
                  <th>Next Appointment</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((patient) => (
                  <tr key={patient.id}>
                    <td>{patient.name}</td>
                    <td>{patient.email}</td>
                    <td>{patient.totalAppointments || 0}</td>
                    <td>{patient.totalPrescriptions || 0}</td>
                    <td>
                      {patient.nextAppointment 
                        ? formatDate(patient.nextAppointment.datetime)
                        : 'None scheduled'
                      }
                    </td>
                    <td>
                      <button 
                        className="btn btn-secondary" 
                        onClick={() => loadPatientDetails(patient.id)}
                      >
                        View Details
                      </button>
                      <button 
                        className="btn btn-danger" 
                        onClick={() => handleDeletePatient(patient.id)}
                        style={{ marginLeft: '5px' }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {renderModal()}
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'patient-details' && selectedPatient) {
    return (
      <div>
        {/* Section ONE - Marketing Banner */}
        <div className="marketing-banner">
          Limited Time: $96 off <a href="#">Zealthy Weight Loss Program</a>
        </div>
        
        {/* Section TWO - Fixed Navigation */}
        <div className="fixed-nav">
          <div className="zealthy-logo">
            <div className="zealthy-logo-text">ZEALTHY</div>
          </div>
          <div className="admin-nav-right">
            <h1>Mini EMR - Patient Details - {selectedPatient.name}</h1>
            <div>
            <button className="btn btn-secondary" onClick={() => setCurrentView('patients')}>
              Back to Patients
            </button>
            </div>
          </div>
        </div>

        {/* Section THREE - Scrollable Content */}
        <div className="scrollable-content">
          <div className="container">

        {error && <div className="alert alert-error">{error}</div>}

        <div className="card">
          <h2>Patient Information</h2>
          <p><strong>Name:</strong> {selectedPatient.name}</p>
          <p><strong>Email:</strong> {selectedPatient.email}</p>
          <button className="btn" onClick={() => openModal('patient', selectedPatient)}>
            Edit Patient
          </button>
        </div>

        <div className="card">
          <h2>Appointments</h2>
          <button className="btn" onClick={() => openModal('appointment')}>
            Add Appointment
          </button>
          <table className="table">
            <thead>
              <tr>
                <th>Provider</th>
                <th>Date & Time</th>
                <th>Repeat</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {selectedPatient.appointments?.map((appointment) => (
                <tr key={appointment.id}>
                  <td>{appointment.provider}</td>
                  <td>{formatDate(appointment.datetime)}</td>
                  <td>{appointment.repeat}</td>
                  <td>{appointment.isActive ? 'Active' : 'Inactive'}</td>
                  <td>
                    <button 
                      className="btn btn-secondary" 
                      onClick={() => openModal('appointment', appointment)}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn btn-danger" 
                      onClick={() => handleDeleteAppointment(appointment.id)}
                    >
                      Deactivate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <h2>Prescriptions</h2>
          <button className="btn" onClick={() => openModal('prescription')}>
            Add Prescription
          </button>
          <table className="table">
            <thead>
              <tr>
                <th>Medication</th>
                <th>Dosage</th>
                <th>Quantity</th>
                <th>Next Refill</th>
                <th>Schedule</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {selectedPatient.prescriptions?.map((prescription) => (
                <tr key={prescription.id}>
                  <td>{prescription.medication}</td>
                  <td>{prescription.dosage}</td>
                  <td>{prescription.quantity}</td>
                  <td>{formatDate(prescription.refill_on)}</td>
                  <td>{prescription.refill_schedule}</td>
                  <td>
                    <button 
                      className="btn btn-secondary" 
                      onClick={() => openModal('prescription', prescription)}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn btn-danger" 
                      onClick={() => handleDeletePrescription(prescription.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {renderModal()}
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default AdminEMR;

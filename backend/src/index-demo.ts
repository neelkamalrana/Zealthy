import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Demo data
const demoUsers = [
  {
    id: '1',
    name: 'Mark Johnson',
    email: 'mark@some-email-provider.net',
    password: 'Password123!',
    appointments: [
      {
        id: '1',
        provider: 'Dr Kim West',
        datetime: '2025-09-16T16:30:00.000-07:00',
        repeat: 'weekly',
        isActive: true
      },
      {
        id: '2',
        provider: 'Dr Lin James',
        datetime: '2025-09-19T18:30:00.000-07:00',
        repeat: 'monthly',
        isActive: true
      }
    ],
    prescriptions: [
      {
        id: '1',
        medication: 'Lexapro',
        dosage: '5mg',
        quantity: 2,
        refill_on: '2025-10-05',
        refill_schedule: 'monthly'
      },
      {
        id: '2',
        medication: 'Ozempic',
        dosage: '1mg',
        quantity: 1,
        refill_on: '2025-10-10',
        refill_schedule: 'monthly'
      }
    ]
  },
  {
    id: '2',
    name: 'Lisa Smith',
    email: 'lisa@some-email-provider.net',
    password: 'Password123!',
    appointments: [
      {
        id: '3',
        provider: 'Dr Sally Field',
        datetime: '2025-09-22T18:15:00.000-07:00',
        repeat: 'monthly',
        isActive: true
      },
      {
        id: '4',
        provider: 'Dr Lin James',
        datetime: '2025-09-25T20:00:00.000-07:00',
        repeat: 'weekly',
        isActive: true
      }
    ],
    prescriptions: [
      {
        id: '3',
        medication: 'Metformin',
        dosage: '500mg',
        quantity: 2,
        refill_on: '2025-10-15',
        refill_schedule: 'monthly'
      },
      {
        id: '4',
        medication: 'Diovan',
        dosage: '100mg',
        quantity: 1,
        refill_on: '2025-10-25',
        refill_schedule: 'monthly'
      }
    ]
  }
];

// Demo login endpoint
app.post('/api/login', (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = demoUsers.find(u => u.email === email && u.password === password);
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Simple token (in real app, use JWT)
    const token = `demo-token-${user.id}`;

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Demo patient dashboard
app.get('/api/patient/:userId/dashboard', (req, res) => {
  try {
    const userId = req.params.userId;
    const user = demoUsers.find(u => u.id === userId);
    
    if (!user) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Get appointments within next 7 days
    const upcomingAppointments = user.appointments.filter(appointment => 
      appointment.isActive && 
      new Date(appointment.datetime) >= now && 
      new Date(appointment.datetime) <= nextWeek
    );

    // Get prescriptions with refills in next 7 days
    const upcomingRefills = user.prescriptions.filter(prescription => 
      new Date(prescription.refill_on) >= now && 
      new Date(prescription.refill_on) <= nextWeek
    );

    res.json({
      patient: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      upcomingAppointments,
      upcomingRefills
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Demo get all patients (for admin)
app.get('/api/admin/patients', (req, res) => {
  try {
    const patientsWithSummary = demoUsers.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      totalAppointments: user.appointments.filter(apt => apt.isActive).length,
      totalPrescriptions: user.prescriptions.length,
      nextAppointment: user.appointments
        .filter(apt => apt.isActive && new Date(apt.datetime) >= new Date())
        .sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime())[0]
    }));

    res.json(patientsWithSummary);
  } catch (error) {
    console.error('Get all patients error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Demo get patient details (for admin)
app.get('/api/admin/patients/:userId', (req, res) => {
  try {
    const userId = req.params.userId;
    const user = demoUsers.find(u => u.id === userId);

    if (!user) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      appointments: user.appointments.filter(apt => apt.isActive),
      prescriptions: user.prescriptions
    });
  } catch (error) {
    console.error('Get patient details error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Demo create patient (for admin)
app.post('/api/admin/patients', (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = demoUsers.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ message: 'Patient with this email already exists' });
    }

    // Create new user
    const newUser = {
      id: (demoUsers.length + 1).toString(),
      name,
      email,
      password,
      appointments: [],
      prescriptions: []
    };

    demoUsers.push(newUser);

    res.status(201).json({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email
    });
  } catch (error) {
    console.error('Create patient error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Demo update patient (for admin)
app.put('/api/admin/patients/:userId', (req, res) => {
  try {
    const userId = req.params.userId;
    const { name, email } = req.body;

    const userIndex = demoUsers.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    if (name) demoUsers[userIndex].name = name;
    if (email) demoUsers[userIndex].email = email;

    res.json({
      id: demoUsers[userIndex].id,
      name: demoUsers[userIndex].name,
      email: demoUsers[userIndex].email
    });
  } catch (error) {
    console.error('Update patient error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Demo delete patient (for admin)
app.delete('/api/admin/patients/:userId', (req, res) => {
  try {
    const userId = req.params.userId;

    const userIndex = demoUsers.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Remove patient from array
    demoUsers.splice(userIndex, 1);

    res.json({ message: 'Patient deleted successfully' });
  } catch (error) {
    console.error('Delete patient error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Demo create appointment (for admin)
app.post('/api/admin/patients/:userId/appointments', (req, res) => {
  try {
    const userId = req.params.userId;
    const { provider, datetime, repeat } = req.body;

    const user = demoUsers.find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const newAppointment = {
      id: (user.appointments.length + 1).toString(),
      provider,
      datetime: new Date(datetime).toISOString(),
      repeat: repeat || 'none',
      isActive: true
    };

    user.appointments.push(newAppointment);

    res.status(201).json(newAppointment);
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Demo update appointment (for admin)
app.put('/api/admin/patients/:userId/appointments/:appointmentId', (req, res) => {
  try {
    const userId = req.params.userId;
    const appointmentId = req.params.appointmentId;
    const { provider, datetime, repeat, isActive } = req.body;

    const user = demoUsers.find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const appointment = user.appointments.find(a => a.id === appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (provider !== undefined) appointment.provider = provider;
    if (datetime !== undefined) appointment.datetime = new Date(datetime).toISOString();
    if (repeat !== undefined) appointment.repeat = repeat;
    if (isActive !== undefined) appointment.isActive = isActive;

    res.json(appointment);
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Demo delete appointment (for admin)
app.delete('/api/admin/patients/:userId/appointments/:appointmentId', (req, res) => {
  try {
    const userId = req.params.userId;
    const appointmentId = req.params.appointmentId;

    const user = demoUsers.find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const appointment = user.appointments.find(a => a.id === appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    appointment.isActive = false;

    res.json({ message: 'Appointment deactivated successfully' });
  } catch (error) {
    console.error('Delete appointment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Demo create prescription (for admin)
app.post('/api/admin/patients/:userId/prescriptions', (req, res) => {
  try {
    const userId = req.params.userId;
    const { medication, dosage, quantity, refill_on, refill_schedule } = req.body;

    const user = demoUsers.find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const newPrescription = {
      id: (user.prescriptions.length + 1).toString(),
      medication,
      dosage,
      quantity,
      refill_on: new Date(refill_on).toISOString(),
      refill_schedule
    };

    user.prescriptions.push(newPrescription);

    res.status(201).json(newPrescription);
  } catch (error) {
    console.error('Create prescription error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Demo update prescription (for admin)
app.put('/api/admin/patients/:userId/prescriptions/:prescriptionId', (req, res) => {
  try {
    const userId = req.params.userId;
    const prescriptionId = req.params.prescriptionId;
    const { medication, dosage, quantity, refill_on, refill_schedule } = req.body;

    const user = demoUsers.find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const prescription = user.prescriptions.find(p => p.id === prescriptionId);
    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    if (medication !== undefined) prescription.medication = medication;
    if (dosage !== undefined) prescription.dosage = dosage;
    if (quantity !== undefined) prescription.quantity = quantity;
    if (refill_on !== undefined) prescription.refill_on = new Date(refill_on).toISOString();
    if (refill_schedule !== undefined) prescription.refill_schedule = refill_schedule;

    res.json(prescription);
  } catch (error) {
    console.error('Update prescription error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Demo delete prescription (for admin)
app.delete('/api/admin/patients/:userId/prescriptions/:prescriptionId', (req, res) => {
  try {
    const userId = req.params.userId;
    const prescriptionId = req.params.prescriptionId;

    const user = demoUsers.find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const prescriptionIndex = user.prescriptions.findIndex(p => p.id === prescriptionId);
    if (prescriptionIndex === -1) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    user.prescriptions.splice(prescriptionIndex, 1);

    res.json({ message: 'Prescription deleted successfully' });
  } catch (error) {
    console.error('Delete prescription error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Demo get patient appointments
app.get('/api/patient/:userId/appointments', (req, res) => {
  try {
    const userId = req.params.userId;
    const user = demoUsers.find(u => u.id === userId);

    if (!user) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const now = new Date();
    const threeMonthsFromNow = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

    const upcomingAppointments = user.appointments.filter(appointment => 
      appointment.isActive && 
      new Date(appointment.datetime) >= now && 
      new Date(appointment.datetime) <= threeMonthsFromNow
    );

    res.json(upcomingAppointments);
  } catch (error) {
    console.error('Get patient appointments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Demo get patient prescriptions
app.get('/api/patient/:userId/prescriptions', (req, res) => {
  try {
    const userId = req.params.userId;
    const user = demoUsers.find(u => u.id === userId);

    if (!user) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    res.json(user.prescriptions);
  } catch (error) {
    console.error('Get patient prescriptions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Book appointment endpoint
app.post('/api/appointments/book', (req, res) => {
  try {
    const { userId, provider, datetime, repeat = 'none' } = req.body;

    // Validate required fields
    if (!userId || !provider || !datetime) {
      return res.status(400).json({ 
        message: 'Missing required fields: userId, provider, datetime' 
      });
    }

    // Find the user
    const user = demoUsers.find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Parse the appointment datetime
    const appointmentDate = new Date(datetime);
    const appointmentEndDate = new Date(appointmentDate.getTime() + 30 * 60000); // 30 minutes duration

    // Check for conflicts with existing appointments
    const hasConflict = demoUsers.some(u => {
      return u.appointments?.some(apt => {
        const existingStart = new Date(apt.datetime);
        const existingEnd = new Date(existingStart.getTime() + 30 * 60000); // 30 minutes duration
        
        // Check if appointments overlap
        return (appointmentDate < existingEnd && appointmentEndDate > existingStart);
      });
    });

    if (hasConflict) {
      return res.status(409).json({ 
        message: 'Appointment time conflicts with an existing appointment. Please choose a different time.' 
      });
    }

    // Check if the appointment is in the past
    if (appointmentDate < new Date()) {
      return res.status(400).json({ 
        message: 'Cannot book appointments in the past' 
      });
    }

    // Create new appointment
    const newAppointment = {
      id: Date.now().toString(),
      provider,
      datetime,
      repeat,
      isActive: true
    };

    // Add appointment to user
    if (!user.appointments) {
      user.appointments = [];
    }
    user.appointments.push(newAppointment);

    res.status(201).json({
      message: 'Appointment booked successfully',
      appointment: newAppointment
    });

  } catch (error) {
    console.error('Book appointment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get available appointment slots for a provider
app.get('/api/appointments/availability/:provider', (req, res) => {
  try {
    const { provider } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: 'Date parameter is required' });
    }

    // Parse the date properly to avoid timezone issues
    const requestedDate = new Date(date as string + 'T00:00:00');
    const startOfDay = new Date(requestedDate);
    startOfDay.setHours(9, 0, 0, 0); // 9 AM
    const endOfDay = new Date(requestedDate);
    endOfDay.setHours(17, 0, 0, 0); // 5 PM

    console.log(`Checking availability for ${provider} on ${requestedDate.toDateString()}`);

    // Get all existing appointments for the date
    const existingAppointments: Date[] = [];
    demoUsers.forEach(user => {
      user.appointments?.forEach(apt => {
        if (apt.provider === provider) {
          const aptDate = new Date(apt.datetime);
          // Compare dates by date string to avoid timezone issues
          if (aptDate.toDateString() === requestedDate.toDateString()) {
            existingAppointments.push(aptDate);
            console.log(`Found existing appointment: ${aptDate.toISOString()}`);
          }
        }
      });
    });

    console.log(`Found ${existingAppointments.length} existing appointments for ${provider} on ${requestedDate.toDateString()}`);

    // Generate available slots (every 30 minutes from 9 AM to 5 PM)
    const availableSlots = [];
    const current = new Date(startOfDay);
    
    while (current < endOfDay) {
      const slotTime = new Date(current);
      const isAvailable = !existingAppointments.some(apt => {
        const aptTime = new Date(apt);
        // Check if the slot overlaps with existing appointment (30-minute duration)
        const slotStart = slotTime.getTime();
        const slotEnd = slotTime.getTime() + 30 * 60000;
        const aptStart = aptTime.getTime();
        const aptEnd = aptTime.getTime() + 30 * 60000;
        
        return (slotStart < aptEnd && slotEnd > aptStart);
      });
      
      if (isAvailable) {
        availableSlots.push(slotTime.toISOString());
      }
      
      current.setMinutes(current.getMinutes() + 30);
    }

    console.log(`Generated ${availableSlots.length} available slots`);

    res.json({
      provider,
      date: requestedDate.toISOString(),
      availableSlots
    });

  } catch (error) {
    console.error('Get availability error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ message: 'Zealthy EMR API is running' });
});

// Demo endpoint
app.get('/api/demo', (req, res) => {
  res.json({
    message: 'Demo mode - Using in-memory data',
    users: demoUsers.map(u => ({ id: u.id, name: u.name, email: u.email }))
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
  console.log(`🌐 API available at: http://localhost:${PORT}/api`);
  console.log(`❤️  Health check: http://localhost:${PORT}/api/health`);
  console.log(`🎭 Demo data: http://localhost:${PORT}/api/demo`);
  console.log('');
  console.log('🎉 Demo mode with sample data - Login should work now!');
  console.log('   Email: mark@some-email-provider.net');
  console.log('   Password: Password123!');
});
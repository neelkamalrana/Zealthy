import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { createTables } from './utils/createTables';
import { UserService, ProviderService, MedicationService, User, Appointment, Prescription, Provider, Medication } from './models/DynamoDB';
import { bookingLock } from './services/bookingLock';
import redis from './config/redis';

// Load environment variables
dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

app.use(cors({
  origin: ['https://zealthy-psi-seven.vercel.app', 'http://54.236.217.39', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// Initialize DynamoDB tables
async function initializeDatabase() {
  try {
    console.log('🔧 Initializing DynamoDB tables...');
    await createTables();
    console.log('✅ Database initialization completed!');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
  }
}

// Auth middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Health check
app.get('/api/health', async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      api: 'running',
      redis: 'unknown',
      database: 'unknown'
    }
  };

  // Check Redis connection
  try {
    await redis.ping();
    health.services.redis = 'connected';
    console.log('✅ Redis health check passed');
  } catch (error) {
    console.error('❌ Redis health check failed:', error);
    health.services.redis = 'disconnected';
    health.status = 'degraded';
  }

  // Check DynamoDB connection (already exists from before)
  try {
    // Simple check - try to list tables
    await UserService.getAll();
    health.services.database = 'connected';
  } catch (error) {
    console.error('Database health check failed:', error);
    health.services.database = 'disconnected';
    health.status = 'degraded';
  }

  const statusCode = health.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(health);
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    const user = await UserService.getByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Login successful',
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get patient dashboard
app.get('/api/patient/dashboard', authenticateToken, async (req: any, res) => {
  try {
    const user = await UserService.getById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const upcomingAppointments = user.appointments?.filter(apt => 
      new Date(apt.datetime) > new Date() && apt.isActive
    ).slice(0, 3) || [];

    const upcomingRefills = user.prescriptions?.filter(pres => 
      pres.isActive && new Date(pres.endDate) > new Date()
    ).slice(0, 3) || [];

    const dashboard = {
      patient: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      upcomingAppointments,
      upcomingRefills
    };

    res.json(dashboard);
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all patients (admin)
app.get('/api/admin/patients', async (req, res) => {
  try {
    const patients = await UserService.getAll();
    const patientsWithSummary = patients.map(({ password, ...patient }) => {
      const activeAppointments = patient.appointments?.filter(apt => apt.isActive) || [];
      const nextAppointment = activeAppointments
        .filter(apt => new Date(apt.datetime) >= new Date())
        .sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime())[0];

      return {
        ...patient,
        totalAppointments: activeAppointments.length,
        totalPrescriptions: patient.prescriptions?.filter(pres => pres.isActive).length || 0,
        nextAppointment: nextAppointment || null
      };
    });
    res.json(patientsWithSummary);
  } catch (error) {
    console.error('Get patients error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get patient by ID (admin)
app.get('/api/admin/patients/:id', async (req, res) => {
  try {
    const patient = await UserService.getById(req.params.id);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    const { password, ...patientWithoutPassword } = patient;
    res.json(patientWithoutPassword);
  } catch (error) {
    console.error('Get patient error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create patient (admin)
app.post('/api/admin/patients', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    // Check if user already exists
    const existingUser = await UserService.getByEmail(email);
    if (existingUser) {
      return res.status(409).json({ message: 'User with this email already exists' });
    }

    const newUser: User = {
      id: uuidv4(),
      name,
      email,
      password, // Pass plain password - UserService.create will hash it
      appointments: [],
      prescriptions: []
    };

    const createdUser = await UserService.create(newUser);
    const { password: _, ...userWithoutPassword } = createdUser;

    res.status(201).json({
      message: 'Patient created successfully',
      patient: userWithoutPassword
    });
  } catch (error) {
    console.error('Create patient error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update patient (admin)
app.put('/api/admin/patients/:id', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const updates: Partial<User> = {};
    if (name) updates.name = name;
    if (email) updates.email = email;
    if (password) updates.password = await bcrypt.hash(password, 10);

    const updatedUser = await UserService.update(req.params.id, updates);
    const { password: _, ...userWithoutPassword } = updatedUser;

    res.json({
      message: 'Patient updated successfully',
      patient: userWithoutPassword
    });
  } catch (error) {
    console.error('Update patient error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete patient (admin)
app.delete('/api/admin/patients/:id', async (req, res) => {
  try {
    await UserService.delete(req.params.id);
    res.json({ message: 'Patient deleted successfully' });
  } catch (error) {
    console.error('Delete patient error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create appointment (admin)
app.post('/api/admin/patients/:id/appointments', async (req, res) => {
  try {
    const { provider, datetime, repeat } = req.body;

    const user = await UserService.getById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const newAppointment: Appointment = {
      id: uuidv4(),
      provider,
      datetime,
      repeat: repeat || 'none',
      isActive: true
    };

    if (!user.appointments) {
      user.appointments = [];
    }
    user.appointments.push(newAppointment);

    await UserService.update(req.params.id, { appointments: user.appointments });

    res.status(201).json({
      message: 'Appointment created successfully',
      appointment: newAppointment
    });
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create prescription (admin)
app.post('/api/admin/patients/:id/prescriptions', async (req, res) => {
  try {
    const { medication, dosage, instructions, startDate, endDate, refill_schedule } = req.body;

    const user = await UserService.getById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const newPrescription: Prescription = {
      id: uuidv4(),
      medication,
      dosage,
      instructions,
      startDate,
      endDate,
      refill_schedule,
      isActive: true
    };

    if (!user.prescriptions) {
      user.prescriptions = [];
    }
    user.prescriptions.push(newPrescription);

    await UserService.update(req.params.id, { prescriptions: user.prescriptions });

    res.status(201).json({
      message: 'Prescription created successfully',
      prescription: newPrescription
    });
  } catch (error) {
    console.error('Create prescription error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get providers
app.get('/api/providers', async (req, res) => {
  try {
    const providers = await ProviderService.getAll();
    res.json(providers);
  } catch (error) {
    console.error('Get providers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create provider (admin)
app.post('/api/admin/providers', async (req, res) => {
  try {
    const { name, specialty } = req.body;

    const newProvider: Provider = {
      id: uuidv4(),
      name,
      specialty,
      isActive: true
    };

    const createdProvider = await ProviderService.create(newProvider);

    res.status(201).json({
      message: 'Provider created successfully',
      provider: createdProvider
    });
  } catch (error) {
    console.error('Create provider error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all medications (admin)
app.get('/api/admin/medications', async (req, res) => {
  try {
    const medications = await MedicationService.getAll();
    res.json(medications);
  } catch (error) {
    console.error('Get medications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new medication (admin)
app.post('/api/admin/medications', async (req, res) => {
  try {
    const { name, dosages } = req.body;

    if (!name || !dosages || !Array.isArray(dosages)) {
      return res.status(400).json({ 
        message: 'Name and dosages array are required' 
      });
    }

    const newMedication: Medication = {
      id: uuidv4(),
      name,
      dosages,
      isActive: true
    };

    const createdMedication = await MedicationService.create(newMedication);

    res.status(201).json({
      message: 'Medication created successfully',
      medication: createdMedication
    });
  } catch (error) {
    console.error('Create medication error:', error);
    res.status(500).json({ message: 'Failed to create medication' });
  }
});

// Book appointment (patient) - with Redis locking to prevent double bookings
app.post('/api/appointments/book', async (req, res) => {
  let lockAcquired = false;
  
  try {
    const { userId, provider, datetime, repeat = 'none' } = req.body;

    if (!userId || !provider || !datetime) {
      return res.status(400).json({ 
        message: 'Missing required fields: userId, provider, datetime' 
      });
    }

    // 1. Try to acquire Redis lock for this time slot
    lockAcquired = await bookingLock.acquireLock(provider, datetime, userId);
    
    if (!lockAcquired) {
      console.log(`🔒 Lock not acquired for ${provider} at ${datetime}`);
      return res.status(409).json({ 
        message: 'This time slot is currently being booked by another patient. Please wait a moment and try again.',
        code: 'SLOT_LOCKED'
      });
    }

    console.log(`🔓 Lock acquired for ${provider} at ${datetime} by user ${userId}`);

    const user = await UserService.getById(userId);
    if (!user) {
      await bookingLock.releaseLock(provider, datetime);
      return res.status(404).json({ message: 'Patient not found' });
    }

    const appointmentDate = new Date(datetime);
    const appointmentEndDate = new Date(appointmentDate.getTime() + 30 * 60000); // 30 minutes duration

    // Check for conflicts within the same user
    const hasUserConflict = user.appointments?.some(apt => {
      const existingStart = new Date(apt.datetime);
      const existingEnd = new Date(existingStart.getTime() + 30 * 60000);
      
      return (appointmentDate < existingEnd && appointmentEndDate > existingStart);
    });

    if (hasUserConflict) {
      await bookingLock.releaseLock(provider, datetime);
      return res.status(409).json({ 
        message: 'Appointment time conflicts with your existing appointment. Please choose a different time.',
        code: 'USER_CONFLICT'
      });
    }

    // Check for provider conflicts across all users
    const allUsers = await UserService.getAll();
    const hasProviderConflict = allUsers.some(u => {
      return u.appointments?.some(apt => {
        // Only check appointments with the same provider
        if (apt.provider !== provider || !apt.isActive) {
          return false;
        }
        
        const existingStart = new Date(apt.datetime);
        const existingEnd = new Date(existingStart.getTime() + 30 * 60000);
        
        return (appointmentDate < existingEnd && appointmentEndDate > existingStart);
      });
    });

    if (hasProviderConflict) {
      await bookingLock.releaseLock(provider, datetime);
      return res.status(409).json({ 
        message: `Appointment time conflicts with ${provider}'s existing appointment. Please choose a different time.`,
        code: 'PROVIDER_CONFLICT'
      });
    }

    if (appointmentDate < new Date()) {
      await bookingLock.releaseLock(provider, datetime);
      return res.status(400).json({ 
        message: 'Cannot book appointments in the past' 
      });
    }

    const newAppointment: Appointment = {
      id: uuidv4(),
      provider,
      datetime,
      repeat,
      isActive: true
    };

    if (!user.appointments) {
      user.appointments = [];
    }
    user.appointments.push(newAppointment);

    await UserService.update(userId, { appointments: user.appointments });

    // Release lock after successful booking
    await bookingLock.releaseLock(provider, datetime);
    console.log(`✅ Lock released for ${provider} at ${datetime}`);

    res.status(201).json({
      message: 'Appointment booked successfully',
      appointment: newAppointment
    });

  } catch (error) {
    // Always release lock on error
    if (lockAcquired) {
      await bookingLock.releaseLock(req.body.provider, req.body.datetime);
    }
    console.error('Book appointment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get provider availability
app.get('/api/appointments/availability/:provider', async (req, res) => {
  try {
    const { provider } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: 'Date parameter is required' });
    }

    const requestedDate = new Date(date as string + 'T00:00:00');
    const startOfDay = new Date(requestedDate);
    startOfDay.setHours(9, 0, 0, 0); // 9 AM
    const endOfDay = new Date(requestedDate);
    endOfDay.setHours(21, 0, 0, 0); // 9 PM

    // Get all users to check for existing appointments
    const allUsers = await UserService.getAll();
    const existingAppointments: Date[] = [];
    
    allUsers.forEach(user => {
      user.appointments?.forEach(apt => {
        if (apt.provider === provider) {
          const aptDate = new Date(apt.datetime);
          if (aptDate.toDateString() === requestedDate.toDateString()) {
            existingAppointments.push(aptDate);
          }
        }
      });
    });

    const availableSlots = [];
    const current = new Date(startOfDay);
    
    while (current < endOfDay) {
      const slotTime = new Date(current);
      const isAvailable = !existingAppointments.some(apt => {
        const aptTime = new Date(apt);
        const slotStart = slotTime.getTime();
        const slotEnd = slotTime.getTime() + 30 * 60000;
        const aptStart = aptTime.getTime();
        const aptEnd = aptTime.getTime() + 30 * 60000;
        
        return (slotStart < aptEnd && slotEnd > aptStart);
      });
      
      if (isAvailable) {
        // Format as YYYY-MM-DDTHH:MM for local time
        const year = slotTime.getFullYear();
        const month = String(slotTime.getMonth() + 1).padStart(2, '0');
        const day = String(slotTime.getDate()).padStart(2, '0');
        const hours = String(slotTime.getHours()).padStart(2, '0');
        const minutes = String(slotTime.getMinutes()).padStart(2, '0');
        availableSlots.push(`${year}-${month}-${day}T${hours}:${minutes}`);
      }
      
      current.setMinutes(current.getMinutes() + 30);
    }

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

// Initialize database and start server
async function startServer() {
  try {
    await initializeDatabase();
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Server is running on port ${PORT}`);
      console.log(`🌐 API available at: http://localhost:${PORT}/api`);
      console.log(`❤️  Health check: http://localhost:${PORT}/api/health`);
      console.log(`🎉 DynamoDB mode - Data will persist between server restarts!`);
      console.log(`   Email: mark@some-email-provider.net`);
      console.log(`   Password: Password123!`);
    });
  } catch (error) {
    console.error('❌ Server startup failed:', error);
    process.exit(1);
  }
}

startServer().catch(console.error);

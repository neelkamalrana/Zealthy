# 🏥 Zealthy EMR API Commands

```bash
# Set your API base URL
export API_BASE="https://zealthy-production.up.railway.app/api"

# Set your authentication token (for patient commands)
export TOKEN="your_jwt_token_here"
```

## 📋 How to Find Patient ID

### Step 1: Get All Patients
```bash
# Get list of all patients to find their IDs
curl -X GET "https://zealthy-production.up.railway.app/api/admin/patients"
```

### Step 2: Look for the ID Field
The response will show each patient with their unique ID:
```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "John Doe",
    "email": "john@example.com",
    "totalAppointments": 2,
    "totalPrescriptions": 1
  },
  {
    "id": "987fcdeb-51a2-43d7-8f9e-123456789abc",
    "name": "Jane Smith", 
    "email": "jane@example.com",
    "totalAppointments": 0,
    "totalPrescriptions": 0
  }
]
```

### Step 3: Copy the ID
Copy the `id` value (the long string) and use it in other commands by replacing `PATIENT_ID` with the actual ID.

### Example:
```bash
# Instead of: /api/admin/patients/PATIENT_ID
# Use: /api/admin/patients/123e4567-e89b-12d3-a456-426614174000
```

## 🔧 Admin Commands (No Authentication Required)

### Patient Management
```bash
# Get all patients
curl -X GET "https://zealthy-production.up.railway.app/api/admin/patients"

# Get specific patient (replace PATIENT_ID with actual ID)
curl -X GET "https://zealthy-production.up.railway.app/api/admin/patients/PATIENT_ID"

# Create new patient
curl -X POST "https://zealthy-production.up.railway.app/api/admin/patients" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john.doe@example.com",
    "password": "SecurePass123!"
  }'

# Update patient (replace PATIENT_ID with actual ID)
curl -X PUT "https://zealthy-production.up.railway.app/api/admin/patients/PATIENT_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Smith",
    "email": "john.smith@example.com"
  }'

# Delete patient (replace PATIENT_ID with actual ID)
curl -X DELETE "https://zealthy-production.up.railway.app/api/admin/patients/PATIENT_ID"
```

### Provider Management
```bash
# Get all providers
curl -X GET "https://zealthy-production.up.railway.app/api/providers"

# Create new provider
curl -X POST "https://zealthy-production.up.railway.app/api/admin/providers" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dr. Sarah Johnson",
    "specialty": "Cardiology"
  }'
```

### Appointment Management
```bash
# Create appointment for patient (replace PATIENT_ID with actual ID)
curl -X POST "https://zealthy-production.up.railway.app/api/admin/patients/PATIENT_ID/appointments" \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "Dr Kim West",
    "datetime": "2024-01-15T14:00:00",
    "repeat": "none"
  }'
```

### Prescription Management
```bash
# Create prescription for patient (replace PATIENT_ID with actual ID)
curl -X POST "https://zealthy-production.up.railway.app/api/admin/patients/PATIENT_ID/prescriptions" \
  -H "Content-Type: application/json" \
  -d '{
    "medication": "Metformin",
    "dosage": "500mg",
    "quantity": 1,
    "refill_on": "2024-06-01",
    "refill_schedule": "monthly"
  }'
```

### Medication Management
```bash
# Get all medications
curl -X GET "https://zealthy-production.up.railway.app/api/admin/medications"

# Create new medication
curl -X POST "https://zealthy-production.up.railway.app/api/admin/medications" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Aspirin",
    "dosages": ["81mg", "325mg", "500mg"]
  }'
```

### System Health
```bash
# Health check
curl -X GET "https://zealthy-production.up.railway.app/api/health"

# Debug info
curl -X GET "https://zealthy-production.up.railway.app/api/debug"
```

## 👤 Patient Commands (Authentication Required)

### Authentication
```bash
# Login
curl -X POST "https://zealthy-production.up.railway.app/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "mark@some-email-provider.net",
    "password": "Password123!"
  }'
```

### Patient Portal
```bash
# Get patient dashboard (replace TOKEN with actual JWT token)
curl -X GET "https://zealthy-production.up.railway.app/api/patient/dashboard" \
  -H "Authorization: Bearer TOKEN"
```

### Appointment Booking
```bash
# Check provider availability
curl -X GET "https://zealthy-production.up.railway.app/api/appointments/availability/Dr%20Kim%20West?date=2024-01-15"

# Book appointment (replace PATIENT_ID with actual ID)
curl -X POST "https://zealthy-production.up.railway.app/api/appointments/book" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "PATIENT_ID",
    "provider": "Dr Kim West",
    "datetime": "2024-01-15T14:00:00",
    "repeat": "none"
  }'
```

## 📝 Demo Credentials

```
Patient 1:
Email: mark@some-email-provider.net
Password: Password123!

Patient 2:
Email: john@some-email-provider.net
Password: Password123!

Patient 3:
Email: lisa@some-email-provider.net
Password: Password123!
```

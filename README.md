# 🏥 Zealthy Mini EMR

A modern, cloud-based Electronic Medical Records (EMR) system designed for healthcare providers and patients. Zealthy Mini EMR provides a comprehensive solution for managing patient records, appointments, prescriptions, and provider information.

## 🌐 Live Application

- **Patient Portal**: [https://zealthy-psi-seven.vercel.app/](https://zealthy-psi-seven.vercel.app/)
- **Admin Portal**: [https://zealthy-psi-seven.vercel.app/admin](https://zealthy-psi-seven.vercel.app/admin)

## ✨ Features

### 👥 Patient Portal
- **🔐 Secure Authentication**: JWT-based login system
- **📊 Dashboard**: Overview of upcoming appointments and prescription refills
- **📅 Appointment Management**: View and book appointments with healthcare providers
- **💊 Prescription Tracking**: Monitor current medications and refill schedules
- **🔍 Provider Availability**: Real-time availability checking for appointment booking

### 🏥 Admin Portal
- **👨‍⚕️ Patient Management**: Create, view, edit, and delete patient records
- **👩‍⚕️ Provider Management**: Add and manage healthcare providers
- **📋 Appointment Scheduling**: Schedule and manage patient appointments
- **💉 Prescription Management**: Create and track patient prescriptions
- **🔍 Search Functionality**: Quick patient search by name or email
- **📈 Patient Analytics**: View appointment and prescription statistics

### 🔧 Core Functionality
- **☁️ Cloud-Based**: Fully hosted on modern cloud platforms
- **🔄 Real-Time Updates**: Live data synchronization across all components
- **📱 Responsive Design**: Optimized for desktop and mobile devices
- **🔒 Data Security**: Secure data storage with AWS DynamoDB
- **⚡ High Performance**: Fast loading times and smooth user experience

## 🛠️ Tech Stack

### Frontend
- **⚛️ React 18** - Modern UI library with hooks and functional components
- **📘 TypeScript** - Type-safe JavaScript for better development experience
- **🎨 CSS3** - Custom styling with gradients, animations, and responsive design
- **🌐 Axios** - HTTP client for API communication
- **🔄 React Router** - Client-side routing for navigation

### Backend
- **🟢 Node.js** - JavaScript runtime for server-side development
- **🚀 Express.js** - Fast, unopinionated web framework
- **📘 TypeScript** - Type-safe server-side development
- **🔐 JWT** - JSON Web Tokens for secure authentication
- **📦 UUID** - Unique identifier generation for records

### Database & Cloud
- **🗄️ AWS DynamoDB** - NoSQL database for scalable data storage
- **☁️ AWS SDK** - Official AWS SDK for Node.js
- **🔧 AWS IAM** - Identity and Access Management for secure credentials

### Deployment & Hosting
- **🚀 Vercel** - Frontend hosting with automatic deployments
- **🚂 Railway** - Backend hosting with seamless scaling
- **📦 npm** - Package management and dependency handling
- **🔄 GitHub** - Version control and continuous integration

### Development Tools
- **🔧 nodemon** - Development server with auto-restart
- **📝 ts-node** - TypeScript execution for Node.js
- **🎯 ESLint** - Code linting and quality assurance
- **📋 dotenv** - Environment variable management

## 🚀 Scope for Improvement

### 🔮 Future Features
- **📱 Mobile App**: Native iOS and Android applications
- **📧 Email Notifications**: Automated appointment and prescription reminders
- **📊 Advanced Analytics**: Comprehensive reporting and data visualization
- **🔔 Real-Time Notifications**: WebSocket-based live updates
- **📄 Document Management**: File upload and storage for medical documents
- **🏥 Multi-Clinic Support**: Support for multiple healthcare facilities
- **👥 Role-Based Access**: Different permission levels for staff members
- **🔍 Advanced Search**: Full-text search across all patient records
- **📈 Health Metrics**: Integration with wearable devices and health trackers
- **🌍 Multi-Language Support**: Internationalization for global use

### 🛡️ Security Enhancements
- **🔐 Two-Factor Authentication**: Additional security layer for user accounts
- **🛡️ Data Encryption**: End-to-end encryption for sensitive medical data
- **📋 Audit Logging**: Comprehensive activity tracking and compliance
- **🔒 HIPAA Compliance**: Full compliance with healthcare data regulations
- **🛡️ Rate Limiting**: API protection against abuse and attacks

### 🎨 UI/UX Improvements
- **🌙 Dark Mode**: Theme switching for better user experience
- **♿ Accessibility**: WCAG compliance for inclusive design
- **📱 Progressive Web App**: Offline functionality and app-like experience
- **🎨 Custom Themes**: Branded interfaces for different healthcare providers
- **📊 Data Visualization**: Interactive charts and graphs for better insights

### 🔧 Technical Improvements
- **⚡ Performance Optimization**: Code splitting and lazy loading
- **🧪 Testing Suite**: Comprehensive unit and integration tests
- **📊 Monitoring**: Application performance monitoring and error tracking
- **🔄 CI/CD Pipeline**: Automated testing and deployment workflows
- **📚 API Documentation**: Comprehensive API documentation with Swagger
- **🐳 Containerization**: Docker containers for consistent deployments
- **☁️ Microservices**: Scalable microservices architecture
- **📊 Caching**: Redis-based caching for improved performance

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │    Database     │
│   (Vercel)      │◄──►│   (Railway)     │◄──►│   (DynamoDB)    │
│                 │    │                 │    │                 │
│ • React 18      │    │ • Node.js       │    │ • NoSQL         │
│ • TypeScript    │    │ • Express.js    │    │ • Scalable      │
│ • Responsive    │    │ • JWT Auth      │    │ • Secure        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📊 Project Structure

```
zealthy-emr/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── services/        # API services
│   │   └── hooks/          # Custom React hooks
│   └── public/             # Static assets
├── backend/                 # Node.js backend application
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── models/         # Data models
│   │   └── utils/          # Utility functions
│   └── dist/               # Compiled TypeScript
└── README.md               # Project documentation
```

## 🔌 API Endpoints

### 🔐 Authentication
- **POST** `/api/auth/login` - User login with email and password
- **POST** `/api/auth/register` - User registration (admin only)

### 👥 Patient Management
- **GET** `/api/admin/patients` - Get all patients (admin only)
- **POST** `/api/admin/patients` - Create new patient (admin only)
- **GET** `/api/admin/patients/:id` - Get patient details (admin only)
- **PUT** `/api/admin/patients/:id` - Update patient information (admin only)
- **DELETE** `/api/admin/patients/:id` - Delete patient (admin only)
- **GET** `/api/patients/:id/dashboard` - Get patient dashboard data

### 👩‍⚕️ Provider Management
- **GET** `/api/admin/providers` - Get all providers (admin only)
- **POST** `/api/admin/providers` - Create new provider (admin only)
- **GET** `/api/admin/providers/:id` - Get provider details (admin only)
- **PUT** `/api/admin/providers/:id` - Update provider information (admin only)
- **DELETE** `/api/admin/providers/:id` - Delete provider (admin only)

### 📅 Appointment Management
- **GET** `/api/patients/:id/appointments` - Get patient appointments
- **POST** `/api/patients/:id/appointments` - Create new appointment
- **PUT** `/api/patients/:id/appointments/:appointmentId` - Update appointment
- **DELETE** `/api/patients/:id/appointments/:appointmentId` - Delete appointment
- **GET** `/api/providers/:provider/availability/:date` - Get provider availability
- **POST** `/api/appointments/book` - Book appointment (patient portal)

### 💊 Prescription Management
- **GET** `/api/patients/:id/prescriptions` - Get patient prescriptions
- **POST** `/api/patients/:id/prescriptions` - Create new prescription
- **PUT** `/api/patients/:id/prescriptions/:prescriptionId` - Update prescription
- **DELETE** `/api/patients/:id/prescriptions/:prescriptionId` - Delete prescription

### 💉 Medication Management
- **GET** `/api/admin/medications` - Get all medications (admin only)
- **POST** `/api/admin/medications` - Create new medication (admin only)
- **GET** `/api/admin/medications/:id` - Get medication details (admin only)
- **PUT** `/api/admin/medications/:id` - Update medication information (admin only)
- **DELETE** `/api/admin/medications/:id` - Delete medication (admin only)

### 🏥 System Health
- **GET** `/api/health` - Health check endpoint
- **GET** `/api/status` - System status information

### 📊 Data Models

#### User/Patient
```typescript
{
  id: string;
  name: string;
  email: string;
  password?: string;
  appointments?: Appointment[];
  prescriptions?: Prescription[];
  totalAppointments?: number;
  totalPrescriptions?: number;
  nextAppointment?: Appointment;
}
```

#### Provider
```typescript
{
  id: string;
  name: string;
  specialty: string;
  availability?: Availability[];
}
```

#### Appointment
```typescript
{
  id: string;
  provider: string;
  datetime: string;
  repeat: 'weekly' | 'monthly' | 'none';
  isActive: boolean;
}
```

#### Prescription
```typescript
{
  id: string;
  medication: string;
  dosage: string;
  quantity: number;
  refill_on: string;
  refill_schedule: 'weekly' | 'monthly';
}
```

#### Medication
```typescript
{
  id: string;
  name: string;
  dosage: string;
  description?: string;
}
```

## 🤝 Contributing

We welcome contributions to improve Zealthy Mini EMR! Please feel free to:

- 🐛 Report bugs and issues
- 💡 Suggest new features
- 🔧 Submit pull requests
- 📚 Improve documentation
- 🧪 Add tests and improve code quality

---

<div align="center">



[![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18-green?logo=node.js)](https://nodejs.org/)
[![AWS](https://img.shields.io/badge/AWS-DynamoDB-orange?logo=amazon-aws)](https://aws.amazon.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-black?logo=vercel)](https://vercel.com/)
[![Railway](https://img.shields.io/badge/Railway-Backend-blue?logo=railway)](https://railway.app/)

</div>
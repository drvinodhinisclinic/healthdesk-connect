# Backend API Setup Guide

This frontend application is configured to connect to a REST API running on `http://localhost:3001/api`.

## Required Backend Endpoints

You need to create a Node.js/Express backend with the following endpoints:

### Dashboard Endpoints
- `GET /api/dashboard/stats` - Returns dashboard statistics
- `GET /api/dashboard/activity` - Returns recent activities

### Patient Endpoints
- `GET /api/patients` - Get all patients
- `GET /api/patients/:id` - Get patient by ID
- `POST /api/patients` - Create new patient
- `PUT /api/patients/:id` - Update patient
- `DELETE /api/patients/:id` - Delete patient

### Doctor Endpoints
- `GET /api/doctors` - Get all doctors
- `GET /api/doctors/:id` - Get doctor by ID
- `POST /api/doctors` - Create new doctor
- `PUT /api/doctors/:id` - Update doctor
- `DELETE /api/doctors/:id` - Delete doctor

### Visit Endpoints
- `GET /api/visits` - Get all visits (with JOIN to get patient, doctor, location names)
- `GET /api/visits/:id` - Get visit by ID
- `POST /api/visits` - Create new visit (DoctorNotes and Fee are optional, isCompleted defaults to 0)
- `PUT /api/visits/:id` - Update visit (Use this to complete a visit by setting isCompleted=1 with required DoctorNotes and Fee)
- `DELETE /api/visits/:id` - Delete visit

### Location Endpoints
- `GET /api/locations` - Get all clinic locations
- `GET /api/locations/:id` - Get location by ID

### Visit Type Endpoints
- `GET /api/visittypes` - Get all visit types

## Sample Express Backend Setup

### 1. Install Dependencies

\`\`\`bash
mkdir clinic-backend
cd clinic-backend
npm init -y
npm install express mysql2 cors dotenv
\`\`\`

### 2. Create server.js

**IMPORTANT:** Copy only the JavaScript code below (WITHOUT the \`\`\`javascript line and closing \`\`\`). The backticks are just markdown formatting.

\`\`\`javascript
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// MySQL Connection
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '', // your MySQL password
  database: 'clinicdb',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test connection
db.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database');
  connection.release();
});

// ===== DASHBOARD ENDPOINTS =====
app.get('/api/dashboard/stats', (req, res) => {
  const queries = {
    patients: 'SELECT COUNT(*) as count FROM tblpatient',
    doctors: 'SELECT COUNT(*) as count FROM tbldoctors',
    todayVisits: 'SELECT COUNT(*) as count FROM tblvisits WHERE DATE(Followup) = CURDATE()',
    locations: 'SELECT COUNT(*) as count FROM tblcliniclocation'
  };

  Promise.all([
    db.promise().query(queries.patients),
    db.promise().query(queries.doctors),
    db.promise().query(queries.todayVisits),
    db.promise().query(queries.locations)
  ])
  .then(([patients, doctors, visits, locations]) => {
    res.json({
      totalPatients: patients[0][0].count,
      activeDoctors: doctors[0][0].count,
      todayVisits: visits[0][0].count,
      totalLocations: locations[0][0].count,
      patientTrend: '+12% from last month',
      visitTrend: '15 completed'
    });
  })
  .catch(err => res.status(500).json({ error: err.message }));
});

app.get('/api/dashboard/activity', (req, res) => {
  const query = \`
    SELECT 
      v.visitID as id,
      p.Name as patientName,
      d.Name as doctorName,
      'Visit recorded' as action,
      v.lastModified as time
    FROM tblvisits v
    LEFT JOIN tblpatient p ON v.patientID = p.patientid
    LEFT JOIN tbldoctors d ON v.doctorID = d.doctorID
    ORDER BY v.lastModified DESC
    LIMIT 10
  \`;
  
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// ===== PATIENT ENDPOINTS =====
app.get('/api/patients', (req, res) => {
  db.query('SELECT * FROM tblpatient ORDER BY lastModified DESC', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.get('/api/patients/:id', (req, res) => {
  db.query('SELECT * FROM tblpatient WHERE patientid = ?', [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results[0]);
  });
});

app.post('/api/patients', (req, res) => {
  const { Name, DOB, Phone, Height, Weight, Remarks, Address } = req.body;
  db.query(
    'INSERT INTO tblpatient (Name, DOB, Phone, Height, Weight, Remarks, Address) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [Name, DOB, Phone, Height, Weight, Remarks, Address],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ patientid: result.insertId, ...req.body });
    }
  );
});

// ===== DOCTOR ENDPOINTS =====
app.get('/api/doctors', (req, res) => {
  db.query('SELECT * FROM tbldoctors ORDER BY lastModified DESC', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.get('/api/doctors/:id', (req, res) => {
  db.query('SELECT * FROM tbldoctors WHERE doctorID = ?', [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results[0]);
  });
});

// ===== VISIT ENDPOINTS =====
app.get('/api/visits', (req, res) => {
  const query = \`
    SELECT 
      v.*,
      p.Name as patientName,
      d.Name as doctorName,
      l.LocationName as locationName,
      vt.Description as visitTypeName
    FROM tblvisits v
    LEFT JOIN tblpatient p ON v.patientID = p.patientid
    LEFT JOIN tbldoctors d ON v.doctorID = d.doctorID
    LEFT JOIN tblcliniclocation l ON v.clinicLocationID = l.LocationID
    LEFT JOIN tblvisittype vt ON v.visitTypeID = vt.visitTypeID
    ORDER BY v.Followup DESC
  \`;
  
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post('/api/visits', (req, res) => {
  const { patientID, doctorID, clinicLocationID, visitTypeID, DoctorNotes, Followup, Fee, prescriptionImage1, prescriptionImage2 } = req.body;
  db.query(
    'INSERT INTO tblvisits (patientID, doctorID, clinicLocationID, visitTypeID, DoctorNotes, Followup, Fee, prescriptionImage1, prescriptionImage2, isCompleted) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)',
    [patientID, doctorID, clinicLocationID, visitTypeID, DoctorNotes || null, Followup || null, Fee || null, prescriptionImage1 || null, prescriptionImage2 || null],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ visitID: result.insertId, ...req.body });
    }
  );
});

app.put('/api/visits/:id', (req, res) => {
  const { DoctorNotes, Fee, isCompleted, prescriptionImage1, prescriptionImage2 } = req.body;
  const updates = [];
  const values = [];
  
  if (DoctorNotes !== undefined) {
    updates.push('DoctorNotes = ?');
    values.push(DoctorNotes);
  }
  if (Fee !== undefined) {
    updates.push('Fee = ?');
    values.push(Fee);
  }
  if (isCompleted !== undefined) {
    updates.push('isCompleted = ?');
    values.push(isCompleted);
  }
  if (prescriptionImage1 !== undefined) {
    updates.push('prescriptionImage1 = ?');
    values.push(prescriptionImage1);
  }
  if (prescriptionImage2 !== undefined) {
    updates.push('prescriptionImage2 = ?');
    values.push(prescriptionImage2);
  }
  
  values.push(req.params.id);
  
  db.query(
    \`UPDATE tblvisits SET \${updates.join(', ')} WHERE visitID = ?\`,
    values,
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Visit updated successfully' });
    }
  );
});

// ===== LOCATION ENDPOINTS =====
app.get('/api/locations', (req, res) => {
  db.query('SELECT * FROM tblcliniclocation', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// ===== VISIT TYPE ENDPOINTS =====
app.get('/api/visittypes', (req, res) => {
  db.query('SELECT * FROM tblvisittype ORDER BY visitTypeID', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Start server
app.listen(PORT, () => {
  console.log(\`Server running on http://localhost:\${PORT}\`);
});
\`\`\`

### 3. Create .env file

\`\`\`
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=clinicdb
\`\`\`

### 4. Run the Backend

\`\`\`bash
node server.js
\`\`\`

## Testing the Connection

1. Start your MySQL server
2. Make sure your `clinicdb` database is created and has the tables
3. Start the Express backend: `node server.js`
4. Start the React frontend: `npm run dev`
5. The frontend will automatically connect to the backend API

## CORS Configuration

The backend includes CORS middleware to allow requests from your frontend (http://localhost:8080).

## Notes

- The frontend expects the API to run on `http://localhost:3001`
- You can change this URL in `src/lib/api.ts` if needed
- Make sure to handle errors appropriately in production
- Add authentication/authorization as needed for production use
- Consider using environment variables for sensitive data

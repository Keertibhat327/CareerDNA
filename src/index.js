import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import scoreRoutes from './routes/scoreRoutes.js';
import atsRoutes from './routes/atsRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable Cross-Origin Resource Sharing (CORS)
app.use(cors());

// Parse incoming JSON requests
app.use(express.json());

// Basic welcome route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to CareerDNA AI — Smart Job Portal Backend API',
    version: '1.0.0',
    status: 'Running'
  });
});

// Route registration
app.use('/auth', authRoutes);
app.use('/', jobRoutes);   // Mounts /jobs and /apply
app.use('/', scoreRoutes); // Mounts /career-score
app.use('/', atsRoutes);   // Mounts /ats-score

// 404 handler for unmatched routes
app.use((req, res, next) => {
  res.status(404).json({ error: 'Endpoint not found. Please verify the URL and method.' });
});

// Global error handler middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  
  // Handle Express body-parser JSON parsing errors
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Malformed JSON payload.' });
  }

  res.status(500).json({
    error: 'An internal server error occurred. Please try again later.'
  });
});

// Start listening for traffic
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`  CareerDNA AI Backend running on port ${PORT}`);
  console.log(`  Local URL: http://localhost:${PORT}`);
  console.log(`====================================================`);
});

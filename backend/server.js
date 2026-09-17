require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ Port ${PORT} is already in use by another running server process.`);
      console.error(`👉 Please stop the old server with Ctrl+C in that terminal before running node server.js again.`);
    } else {
      console.error('Server error:', err);
    }
  });
}).catch((err) => {
  console.error('Database connection failure:', err.message);
});

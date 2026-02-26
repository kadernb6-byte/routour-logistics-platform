// Vercel Serverless Function Entry Point
// This wraps the Express app for Vercel's serverless environment
const app = require('../backend/src/index.js');

module.exports = app;

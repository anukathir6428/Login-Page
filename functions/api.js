const serverless = require('serverless-http');
const app = require('../server');

// Wrap Express app as serverless handler for Netlify
module.exports.handler = serverless(app);

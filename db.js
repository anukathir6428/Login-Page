const fs = require('fs');
const path = require('path');

// Local JSON File Database Path (Ensures zero native build issues across Windows & Serverless)
const dataDir = path.join(__dirname, 'data');
const dbFilePath = path.join(dataDir, 'users.json');

// Ensure data directory and users.json exist
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

if (!fs.existsSync(dbFilePath)) {
  fs.writeFileSync(dbFilePath, JSON.stringify([], null, 2), 'utf-8');
}

// Helper to read users array
function readUsers() {
  try {
    const data = fs.readFileSync(dbFilePath, 'utf-8');
    return JSON.parse(data || '[]');
  } catch (err) {
    console.error('Error reading database file:', err);
    return [];
  }
}

// Helper to write users array
function writeUsers(users) {
  try {
    fs.writeFileSync(dbFilePath, JSON.stringify(users, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing database file:', err);
    return false;
  }
}

// Database API Methods
const db = {
  // Find user by email
  async findByEmail(email) {
    const users = readUsers();
    return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  },

  // Find user by username
  async findByUsername(username) {
    const users = readUsers();
    return users.find(u => u.username.toLowerCase() === username.toLowerCase()) || null;
  },

  // Find user by ID
  async findById(id) {
    const users = readUsers();
    return users.find(u => u.id === id) || null;
  },

  // Create new user record
  async createUser({ name, username, email, passwordHash }) {
    const users = readUsers();
    const newUser = {
      id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      name,
      username,
      email,
      passwordHash,
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    writeUsers(users);
    return newUser;
  },

  // Get total user count
  async getUserCount() {
    const users = readUsers();
    return users.length;
  }
};

module.exports = db;

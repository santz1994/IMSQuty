require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.MOCK_BACKEND_PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Mock users database
const mockUsers = {
  'admin@example.com': {
    id: 1,
    email: 'admin@example.com',
    password: 'password',
    first_name: 'Admin',
    last_name: 'User',
    role: 'admin'
  },
  'user@example.com': {
    id: 2,
    email: 'user@example.com',
    password: 'password',
    first_name: 'John',
    last_name: 'Doe',
    role: 'user'
  }
};

// Auth endpoint
app.post('/api/v1/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }

  const user = mockUsers[email];

  if (!user || user.password !== password) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }

  // Generate JWT token
  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  return res.status(200).json({
    success: true,
    data: {
      token,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role
      }
    }
  });
});

// Mock Assets endpoint
app.get('/api/v1/assets', (req, res) => {
  const page = parseInt(req.query.page || 1);
  const perPage = parseInt(req.query.per_page || 10);

  const mockAssets = [
    { id: 1, name: 'Laptop Dell XPS 13', category: 'IT Equipment', status: 'Active', location: 'Office A' },
    { id: 2, name: 'Printer HP LaserJet', category: 'Office Equipment', status: 'Active', location: 'Office B' },
    { id: 3, name: 'Monitor LG 27"', category: 'IT Equipment', status: 'Active', location: 'Office A' },
    { id: 4, name: 'Desk Conference Table', category: 'Furniture', status: 'Active', location: 'Conference Room' },
    { id: 5, name: 'Camera DSLR Canon', category: 'Photography', status: 'Maintenance', location: 'Storage' },
    { id: 6, name: 'Projector Epson', category: 'AV Equipment', status: 'Active', location: 'Auditorium' },
    { id: 7, name: 'Server Dell PowerEdge', category: 'IT Infrastructure', status: 'Active', location: 'Server Room' },
    { id: 8, name: 'UPS Backup Power', category: 'IT Infrastructure', status: 'Active', location: 'Server Room' },
    { id: 9, name: 'Office Chair Ergonomic', category: 'Furniture', status: 'Active', location: 'Office A' },
    { id: 10, name: 'Network Switch Cisco', category: 'IT Equipment', status: 'Active', location: 'Server Room' }
  ];

  const start = (page - 1) * perPage;
  const end = start + perPage;
  const paginatedAssets = mockAssets.slice(start, end);

  res.json({
    success: true,
    data: {
      items: paginatedAssets,
      pagination: {
        page,
        per_page: perPage,
        total: mockAssets.length,
        total_pages: Math.ceil(mockAssets.length / perPage)
      }
    }
  });
});

// Mock Tickets endpoint
app.get('/api/v1/tickets', (req, res) => {
  const page = parseInt(req.query.page || 1);
  const perPage = parseInt(req.query.per_page || 10);

  const mockTickets = [
    { id: 1, title: 'Network Issue', description: 'Internet down in Office A', status: 'Open', priority: 'High', created_at: '2025-12-28' },
    { id: 2, title: 'Printer Jam', description: 'HP LaserJet printer jamming', status: 'In Progress', priority: 'Medium', created_at: '2025-12-29' },
    { id: 3, title: 'Password Reset', description: 'User forgot password', status: 'Resolved', priority: 'Low', created_at: '2025-12-27' },
    { id: 4, title: 'Monitor Flickering', description: 'Dell monitor flickering on startup', status: 'Open', priority: 'Medium', created_at: '2025-12-30' },
    { id: 5, title: 'Software License', description: 'Request for new software license', status: 'Pending', priority: 'Medium', created_at: '2025-12-29' },
    { id: 6, title: 'Email Configuration', description: 'Email not syncing on mobile', status: 'In Progress', priority: 'High', created_at: '2025-12-28' },
    { id: 7, title: 'VPN Access', description: 'VPN connection issues', status: 'Open', priority: 'High', created_at: '2025-12-30' },
    { id: 8, title: 'Backup Verification', description: 'Daily backup verification check', status: 'Resolved', priority: 'Low', created_at: '2025-12-26' },
    { id: 9, title: 'Security Update', description: 'Install monthly security patches', status: 'In Progress', priority: 'High', created_at: '2025-12-25' },
    { id: 10, title: 'Inventory Check', description: 'Quarterly IT asset inventory check', status: 'Pending', priority: 'Medium', created_at: '2025-12-24' }
  ];

  const start = (page - 1) * perPage;
  const end = start + perPage;
  const paginatedTickets = mockTickets.slice(start, end);

  res.json({
    success: true,
    data: {
      items: paginatedTickets,
      pagination: {
        page,
        per_page: perPage,
        total: mockTickets.length,
        total_pages: Math.ceil(mockTickets.length / perPage)
      }
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    message: 'Mock backend is running'
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Mock backend running on port ${PORT}`);
  console.log(`Try logging in with:`);
  console.log(`  Email: admin@example.com`);
  console.log(`  Password: password`);
});

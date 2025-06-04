# VegPro - Vegetable Procurement Management System

A full-stack web application for hotel chain vegetable procurement management, built with React, FastAPI, and MongoDB.

## 🏗️ Architecture

- **Frontend**: React 18 with Tailwind CSS
- **Backend**: FastAPI with Python
- **Database**: MongoDB (local)
- **Deployment**: Single VM with Nginx reverse proxy

## 🚀 Features

### Admin Dashboard
- Overview of all hotels, sellers, and vegetables
- Orders matrix view with delivery tracking
- Mark hotels as delivered with one click
- Real-time statistics

### Hotel Manager Interface
- Select your hotel
- Manage daily vegetable requirements
- Save bulk requirements
- Date-based ordering

## 🛠️ Tech Stack

- **Frontend**: React, Tailwind CSS, Axios
- **Backend**: FastAPI, PyMongo, Pydantic
- **Database**: MongoDB
- **Server**: Nginx, Systemd services
- **Infrastructure**: Google Cloud Platform (e2-micro VM)

## 📁 Project Structure

```
/app/
├── backend/
│   ├── server.py              # FastAPI application
│   └── requirements.txt       # Python dependencies
├── frontend/
│   ├── package.json          # Node.js dependencies
│   ├── .env                  # Environment variables
│   ├── tailwind.config.js    # Tailwind configuration
│   ├── postcss.config.js     # PostCSS configuration
│   ├── public/
│   │   └── index.html        # HTML template
│   └── src/
│       ├── index.js          # React entry point
│       ├── index.css         # Global styles
│       └── App.js            # Main React component
├── deploy.sh                 # Deployment script
└── quick-update.sh          # Quick update script
```

## 🚀 Deployment

### Prerequisites
- Google Cloud SDK
- VM with Ubuntu 20.04
- Node.js 18, Python 3, MongoDB 6.0

### Initial Setup
```bash
# Clone repository
git clone https://github.com/SushilChaurasia93/vegpro-procurement-system.git
cd vegpro-procurement-system

# Run deployment script
sudo ./deploy.sh
```

### Updates
```bash
# Full deployment (pulls changes, updates dependencies, restarts services)
sudo ./deploy.sh

# Quick update (pulls changes, restarts services only)
sudo ./quick-update.sh
```

## 🔧 Development

### Backend API Endpoints
- `GET /api/hotels` - List all hotels
- `POST /api/hotels` - Create new hotel
- `GET /api/sellers` - List all sellers
- `GET /api/vegetables` - List all vegetables
- `GET /api/requirements` - Get requirements
- `POST /api/requirements/bulk` - Create bulk requirements
- `GET /api/dashboard/admin` - Admin dashboard data
- `GET /api/dashboard/admin/matrix` - Orders matrix data

### Environment Variables
- `REACT_APP_BACKEND_URL` - Backend API URL
- `MONGO_URL` - MongoDB connection string
- `PORT` - Service port (backend: 8001, frontend: 3000)

## 🏃 Running Services

```bash
# Check service status
sudo systemctl status vegpro-backend vegpro-frontend nginx

# Restart services
sudo systemctl restart vegpro-backend vegpro-frontend

# View logs
sudo journalctl -u vegpro-backend -f
sudo journalctl -u vegpro-frontend -f
```

## 💰 Cost Optimization

This application runs on Google Cloud Platform's Always Free Tier:
- **VM**: e2-micro instance (free)
- **Storage**: 30GB disk (free)
- **Traffic**: 1GB outbound/month (free)
- **Total Cost**: $0/month

## 🔗 Live Application

- **Frontend**: http://YOUR-VM-IP
- **Backend API**: http://YOUR-VM-IP:8001
- **API Documentation**: http://YOUR-VM-IP:8001/docs

## 👥 User Roles

1. **Admin**: Manage orders, view matrix, mark deliveries
2. **Hotel Manager**: Select hotel, manage daily requirements

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes
4. Test locally
5. Submit a pull request

## 📄 License

MIT License - feel free to use this project for your own purposes.

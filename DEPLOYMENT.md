# Deployment Guide

## Quick Start

### 1. Backend Deployment

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Set root directory to backend folder
   - Add environment variables:
     - `MONGODB_URI`: Your MongoDB Atlas connection string
     - `JWT_SECRET`: A secure random string
     - `NODE_ENV`: `production`

3. **Initialize Database**:
   ```bash
   # Set your production MongoDB URI
   MONGODB_URI=your-atlas-connection-string npm run init-data
   ```

### 2. Frontend Deployment

1. **Create New Vercel Project**:
   - Import the same repository
   - Set root directory to `frontend` folder
   - Add environment variable:
     - `API_URL`: Your backend Vercel URL

2. **Update Backend CORS**:
   - Update `FRONTEND_URL` in backend environment variables to your frontend URL

### 3. MongoDB Atlas Setup

1. **Create Cluster**:
   - Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Create a new cluster
   - Get your connection string

2. **Database Access**:
   - Create a database user
   - Whitelist your IP addresses (or use 0.0.0.0/0 for Vercel)

## Testing the Application

### 1. Health Check
```bash
curl https://your-backend.vercel.app/health
```

### 2. Login Test
```bash
curl -X POST https://your-backend.vercel.app/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@acme.test","password":"password"}'
```

### 3. Create Note Test
```bash
# First get token from login response, then:
curl -X POST https://your-backend.vercel.app/notes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"title":"Test Note","content":"This is a test note"}'
```

## Environment Variables Reference

### Backend (.env)
```
MONGODB_URI=mongodb://localhost:27017/saas-notes
JWT_SECRET=your-super-secret-jwt-key
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:3001
```

### Frontend (.env.local)
```
API_URL=http://localhost:3000
```

## Troubleshooting

### Common Issues

1. **CORS Errors**:
   - Ensure `FRONTEND_URL` is set correctly in backend
   - Check that frontend `API_URL` points to correct backend

2. **Database Connection**:
   - Verify MongoDB Atlas connection string
   - Check IP whitelist settings
   - Ensure database user has proper permissions

3. **Authentication Issues**:
   - Verify JWT_SECRET is set
   - Check token expiration (24 hours default)
   - Ensure proper Authorization header format

4. **Note Limit Issues**:
   - Check tenant subscription status
   - Verify note count calculation
   - Test upgrade functionality

### Testing Checklist

- [ ] Health endpoint responds
- [ ] All test accounts can login
- [ ] Notes CRUD operations work
- [ ] Tenant isolation is enforced
- [ ] Role-based access works
- [ ] Note limits are enforced
- [ ] Upgrade functionality works
- [ ] Frontend loads and functions
- [ ] CORS is properly configured

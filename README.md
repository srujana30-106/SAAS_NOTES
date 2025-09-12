# Multi-Tenant SaaS Notes Application

A full-stack multi-tenant SaaS Notes Application built with Node.js, Express, MongoDB, and Next.js, designed to be deployed on Vercel.

## Features

- **Multi-Tenancy**: Support for multiple tenants (Acme and Globex) with strict data isolation
- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **Subscription Management**: Free plan (3 notes limit) and Pro plan (unlimited notes)
- **Notes CRUD**: Full create, read, update, delete functionality for notes
- **Modern UI**: Responsive frontend built with Next.js and Tailwind CSS
- **Vercel Ready**: Optimized for deployment on Vercel platform

## Multi-Tenancy Approach

This application uses a **shared schema with tenant ID columns** approach:

- All data models include a `tenantId` field that references the tenant
- Database queries are filtered by `tenantId` to ensure strict data isolation
- Users can only access data belonging to their tenant
- This approach provides good performance while maintaining data isolation

### Data Models

- **Tenant**: Stores tenant information and subscription details
- **User**: User accounts linked to specific tenants
- **Note**: Notes with tenant isolation and user ownership

## Test Accounts

The following test accounts are pre-configured (all with password: `password`):

| Email | Role | Tenant | Description |
|-------|------|--------|-------------|
| admin@acme.test | Admin | Acme | Can invite users and upgrade subscriptions |
| user@acme.test | Member | Acme | Can only manage notes |
| admin@globex.test | Admin | Globex | Can invite users and upgrade subscriptions |
| user@globex.test | Member | Globex | Can only manage notes |

## API Endpoints

### Authentication
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user info
- `POST /auth/logout` - User logout

### Notes
- `POST /notes` - Create a new note
- `GET /notes` - List all notes for current tenant
- `GET /notes/:id` - Get specific note
- `PUT /notes/:id` - Update a note
- `DELETE /notes/:id` - Delete a note
- `PATCH /notes/:id/archive` - Archive/unarchive a note

### Tenants
- `GET /tenants/info` - Get tenant information
- `GET /tenants/stats` - Get tenant statistics (Admin only)
- `POST /tenants/:slug/upgrade` - Upgrade tenant to Pro plan (Admin only)

### Health
- `GET /health` - Health check endpoint

## Subscription Plans

### Free Plan
- Maximum 3 notes per tenant
- Basic note management features
- Upgrade prompt when limit is reached

### Pro Plan
- Unlimited notes
- All features of Free plan
- Immediate upgrade via admin interface

## Installation & Setup

### Backend Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Environment Configuration**:
   ```bash
   cp env.example .env
   ```
   
   Update the `.env` file with your MongoDB connection string and JWT secret.

3. **Initialize Database**:
   ```bash
   npm run init-data
   ```
   This creates the test tenants, users, and sample data.

4. **Start Development Server**:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```

## Deployment on Vercel

### Backend Deployment

1. **Connect to Vercel**:
   - Import your GitHub repository to Vercel
   - Set the root directory to the backend folder

2. **Environment Variables**:
   Set the following environment variables in Vercel:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: A secure JWT secret key
   - `NODE_ENV`: `production`

3. **Deploy**:
   Vercel will automatically deploy your backend API.

### Frontend Deployment

1. **Create separate Vercel project**:
   - Import the same repository
   - Set the root directory to the `frontend` folder

2. **Environment Variables**:
   - `API_URL`: Your backend Vercel URL (e.g., `https://your-backend.vercel.app`)

3. **Deploy**:
   Vercel will build and deploy your frontend.

### Database Setup

1. **MongoDB Atlas**:
   - Create a MongoDB Atlas cluster
   - Get your connection string
   - Add it to your Vercel environment variables

2. **Initialize Production Data**:
   After deployment, run the initialization script to create test data:
   ```bash
   # Set your production MongoDB URI
   MONGODB_URI=your-atlas-connection-string npm run init-data
   ```

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access Control**: Admin and Member roles with different permissions
- **Tenant Isolation**: Strict data separation between tenants
- **Rate Limiting**: API rate limiting to prevent abuse
- **CORS Configuration**: Proper CORS setup for cross-origin requests
- **Input Validation**: Server-side validation for all inputs
- **Password Hashing**: Bcrypt for secure password storage

## Technology Stack

### Backend
- **Node.js**: Runtime environment
- **Express.js**: Web framework
- **MongoDB**: Database with Mongoose ODM
- **JWT**: Authentication tokens
- **bcryptjs**: Password hashing
- **CORS**: Cross-origin resource sharing
- **Helmet**: Security headers

### Frontend
- **Next.js**: React framework
- **React**: UI library
- **Tailwind CSS**: Styling framework
- **Axios**: HTTP client
- **js-cookie**: Cookie management

## Development

### Running Tests
```bash
# Backend tests (when implemented)
npm test

# Frontend tests (when implemented)
cd frontend && npm test
```

### Code Structure

```
saas-notes-backend/
├── models/           # Database models
├── routes/           # API routes
├── middleware/       # Authentication middleware
├── scripts/          # Database initialization
├── server.js         # Main server file
└── package.json

frontend/
├── components/       # React components
├── contexts/         # React contexts
├── services/         # API services
├── styles/           # CSS styles
├── pages/            # Next.js pages
└── package.json
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For support or questions, please open an issue in the GitHub repository.

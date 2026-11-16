# API Sentinel Enterprise

**An Enterprise API Security and Monitoring Platform**

API Sentinel Enterprise is a full-stack API security platform designed to protect REST APIs through JWT authentication, role-based access control, request rate limiting, and real-time request monitoring.

The platform provides separate dashboards for administrators and regular users, allowing API activity and security controls to be monitored through a web interface.

## Features

### Authentication and Authorization
- User registration and login.
- JWT-based authentication.
- BCrypt password hashing.
- Role-based access control (USER and ADMIN).
- Protected API endpoints.

### Rate Limiting
- Role-based API request limits.
- USER: 10 requests per minute.
- ADMIN: 20 requests per minute.
- HTTP 429 response when the request limit is exceeded.
- Rate-limit status monitoring.

### API Monitoring
- Automatic API request logging.
- Tracks endpoint, HTTP method, response status, response time, timestamp, and username.
- Admin-only request log access.
- Request count and user-specific monitoring.

### Frontend Dashboard
- React-based user interface.
- Separate Admin and User dashboards.
- API traffic visualization.
- Request logs and user monitoring.
- Rate-limit status display.

## Technology Stack

| Component | Technologies |
|---|---|
| Backend | Java, Spring Boot |
| Security | Spring Security, JWT, BCrypt |
| Database | MySQL |
| ORM | Spring Data JPA, Hibernate |
| Frontend | React, Vite |
| Styling | CSS, Tailwind CSS |
| HTTP Client | Axios |
| Charts | Recharts |
| API Testing | Insomnia |
| Version Control | Git, GitHub |

## Project Structure

```text
API-Sentinel-Enterprise/
│
├── API-Security-Platform/
│   └── API-Security-Platform/
│       ├── src/
│       │   ├── main/
│       │   │   ├── java/
│       │   │   └── resources/
│       │   └── test/
│       ├── pom.xml
│       └── mvnw
│
├── api-sentinel-frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── .env.example
│
└── README.md
```

## Getting Started

### Prerequisites

Install the following:

- Java JDK 17 or compatible version specified by the backend project.
- MySQL.
- Node.js and npm.
- Git.

### 1. Clone the Repository

```bash
git clone https://github.com/Lokeshwaran032-commits/API-Sentinel-Enterprise.git
```

### 2. Backend Setup

Navigate to the backend project:

```bash
cd API-Sentinel-Enterprise/API-Security-Platform/API-Security-Platform
```

Create a MySQL database:

```sql
CREATE DATABASE api_security_platform;
```

Configure these environment variables before starting the application:

```text
DB_USERNAME=your_mysql_username
DB_PASSWORD=your_mysql_password
JWT_SECRET=your_base64_encoded_secret
```

The JWT secret must be a valid Base64-encoded signing key of sufficient length.

Run the backend:

**Windows:**

```powershell
.\mvnw.cmd spring-boot:run
```

The backend runs at:

`http://localhost:8080`

### 3. Frontend Setup

Open another terminal:

```bash
cd API-Sentinel-Enterprise/api-sentinel-frontend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file using `.env.example` as a reference:

```env
VITE_API_BASE_URL=http://localhost:8080
```

Start the frontend:

```bash
npm run dev
```

Open the local URL printed by Vite in your terminal.

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Authenticate and receive JWT |
| GET | `/api/user/profile` | Access user profile |
| GET | `/api/admin/dashboard` | Admin-only dashboard access |
| GET | `/api/monitoring/logs` | Retrieve API request logs |
| GET | `/api/monitoring/logs/count` | Retrieve request count |
| GET | `/api/monitoring/logs/user/{username}` | Retrieve user-specific logs |
| GET | `/api/rate-limit/status` | Check current rate-limit status |

Protected endpoints require a valid JWT. Monitoring endpoints require ADMIN authorization.

## Security Notes

- Passwords are stored using BCrypt hashing.
- JWT is used for stateless authentication.
- Sensitive configuration values are supplied through environment variables.
- Public registration assigns the USER role.
- Rate limiting currently uses in-memory storage and resets when the backend restarts. It is intended for this project's current single-instance implementation.

## Future Improvements

- Distributed rate limiting.
- Advanced threat detection.
- API analytics and reporting.
- Cloud deployment.
- Automated testing and CI/CD integration.

## Author

**Lokeshwaran P**

Computer Science and Engineering

GitHub: [Lokeshwaran032-commits](https://github.com/Lokeshwaran032-commits)

---

*Built as a final-year engineering project to explore backend development, API security, authentication, and monitoring.*
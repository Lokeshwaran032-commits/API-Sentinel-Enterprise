# API Sentinel Enterprise

API Sentinel Enterprise is a project I built to practise securing and monitoring REST APIs. It has a Spring Boot backend and a React frontend.

Users can register and log in, while administrators can view API activity and request logs. The backend uses JWT for authentication and applies different rate limits to USER and ADMIN accounts.

## Live application

- **Frontend (login page):** [Open API Sentinel](https://api-sentinel-enterprise.vercel.app/login)
- **Backend API:** [Open backend URL](https://api-sentinel-enterprise.onrender.com)
- **Database:** TiDB Cloud

## What it does

- Register and log in with email and password.
- Authenticate requests using JWT.
- Give accounts USER or ADMIN roles.
- Limit USER requests to 10 per minute and ADMIN requests to 20 per minute.
- Return HTTP 429 when a rate limit is exceeded.
- Record request details such as endpoint, method, status code, response time, timestamp and username.
- Let administrators view request logs and monitoring information through the dashboard.

Public registration creates a USER account. Administrator access is assigned separately.

## Built with

| Part | Technology |
|---|---|
| Frontend | React, Vite, Axios |
| Backend | Java 25, Spring Boot, Maven |
| Security | Spring Security, JWT, BCrypt |
| Database | TiDB Cloud (MySQL-compatible) |
| Data access | Spring Data JPA, Hibernate |
| Charts | Recharts |
| Testing | Insomnia |
| Deployment | Vercel, Render, Docker |

## Repository layout

```text
API-Sentinel-Enterprise/
├── API-Security-Platform/
│   └── API-Security-Platform/   # Spring Boot application
├── api-sentinel-frontend/       # React application
└── README.md
```

## Run it locally

### Requirements

- Java 25
- Node.js and npm
- MySQL, or another compatible TiDB database
- Git

### 1. Clone the repository

```bash
git clone https://github.com/Lokeshwaran032-commits/API-Sentinel-Enterprise.git
cd API-Sentinel-Enterprise
```

### 2. Start the backend

Create a database named `api_security_platform` and configure your local database connection in the Spring Boot application properties. Set your database username, password and JWT signing secret locally. Do not commit real credentials.

From the backend directory:

```bash
cd API-Security-Platform/API-Security-Platform
```

On Windows:

```powershell
.\mvnw.cmd spring-boot:run
```

The backend starts on `http://localhost:8080`.

### 3. Start the frontend

Open a second terminal:

```bash
cd api-sentinel-frontend
npm install
```

Create a `.env.development` file in the frontend directory:

```env
VITE_API_BASE_URL=http://localhost:8080
```

Then run:

```bash
npm run dev
```

Vite prints the local frontend URL in the terminal.

## Main API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Register a user |
| POST | `/api/auth/login` | Log in and receive a JWT |
| GET | `/api/user/profile` | View the authenticated user's profile |
| GET | `/api/admin/dashboard` | Admin-only dashboard endpoint |
| GET | `/api/monitoring/logs` | View request logs (ADMIN) |
| GET | `/api/monitoring/logs/count` | Get the request count (ADMIN) |
| GET | `/api/monitoring/logs/user/{username}` | View a user's request logs (ADMIN) |

Protected endpoints require a Bearer token. Monitoring endpoints are restricted to ADMIN accounts.

## Notes

- Passwords are hashed with BCrypt.
- The JWT secret and database credentials should be supplied through configuration or environment variables, not stored in the repository.
- Rate limiting currently uses in-memory storage. Its counters are local to the running backend instance and reset when the application restarts; this is not a distributed rate limiter.
- The deployed backend uses the cloud profile and connects to TiDB Cloud.

## Author

**Lokeshwaran P**  
B.E. Computer Science and Engineering

[GitHub profile](https://github.com/Lokeshwaran032-commits)

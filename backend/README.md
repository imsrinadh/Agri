# AgriRisk Backend API

Agricultural Risk Intelligence Platform API built with **FastAPI**, **Pydantic v2**, and **JWT Authentication**.

---

## 🛠️ Technology Stack

- **Python**: 3.11+ (Tested on Python 3.14)
- **Framework**: FastAPI
- **ASGI Server**: Uvicorn
- **Data Validation & Settings**: Pydantic v2 & Pydantic-Settings
- **Security & Authentication**: PyJWT (HS256) & bcrypt password hashing
- **File & Media Handling**: Python Multipart & safe magic-byte validation
- **Environment Management**: python-dotenv

---

## 📁 Directory Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                  # FastAPI application entry point, CORS, and router mounting
│   │
│   ├── api/
│   │   ├── __init__.py
│   │   ├── health.py            # GET /api/health
│   │   ├── auth.py              # Auth endpoints (register, login, me, logout)
│   │   ├── users.py             # User & profile endpoints (GET/PUT /api/users/me, /profile)
│   │   ├── risk.py              # Risk analysis endpoints (POST /predict, GET /history, /history/{id})
│   │   ├── disease.py           # Crop disease image endpoints (POST /predict, GET /history, /history/{id})
│   │   ├── regions.py           # Regional risk endpoints (GET /regions, /risk/summary, /{id}, /{id}/risk)
│   │   ├── dashboard.py         # Consolidated dashboard endpoint (GET /dashboard)
│   │   └── insights.py          # Analytics & trend endpoints (GET /insights)
│   │
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── auth.py              # Auth schemas
│   │   ├── user.py              # User & profile schemas
│   │   ├── risk.py              # Risk analysis schemas
│   │   ├── disease.py           # Crop disease response & history schemas
│   │   ├── region.py            # Regional risk & summary schemas
│   │   ├── dashboard.py         # Consolidated dashboard schemas
│   │   └── insights.py          # Trends, comparisons & market analytics schemas
│   │
│   ├── services/
│   │   ├── __init__.py
│   │   ├── auth_service.py      # User authentication business logic
│   │   ├── user_service.py      # User profile management logic
│   │   ├── risk_service.py      # Risk simulation & recommendation engine
│   │   ├── disease_service.py   # Image validation & mock disease diagnosis engine
│   │   ├── region_service.py    # Regional data & geographical risk service
│   │   ├── dashboard_service.py # Workspace dashboard aggregator
│   │   └── insights_service.py  # Historical & comparative insights analytics
│   │
│   ├── data/                    # Structured mock/demo datasets
│   │   ├── __init__.py
│   │   ├── regions.py           # Geographical data for 18+ Indian agricultural regions
│   │   ├── dashboard.py         # Default dashboard overview & trend metrics
│   │   └── insights.py          # Multi-window historical, market & crop trends
│   │
│   ├── models/                  # (Reserved for future PostgreSQL / SQLAlchemy models)
│   │   └── __init__.py
│   │
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py            # Pydantic Settings & environment config
│   │   └── security.py          # Password hashing, JWT & get_current_user
│   │
│   ├── database/                # (Reserved for future DB session management)
│   │   └── __init__.py
│   │
│   └── ml/                      # (Reserved for future ML vision / classification models)
│       └── __init__.py
│
├── uploads/                     # Secure image upload directory (e.g. /uploads/disease/)
├── tests/                       # Automated pytest test suites
│   ├── test_auth_and_health.py
│   ├── test_full_suite.py
│   └── test_regions_dashboard_insights.py
├── .env                         # Local environment variables
├── .env.example                 # Environment variables template
├── .gitignore                   # Git ignore rules
├── requirements.txt             # Python dependencies
└── README.md                    # Documentation
```

---

## 🚀 Getting Started

### 1. Prerequisites
Ensure Python 3.11 or higher is installed:
```bash
python --version
```

### 2. Create and Activate Virtual Environment

**Windows (PowerShell):**
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
```

**Linux / macOS:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

---

## 🏃 Running the Server

Start the FastAPI development server with live reload:
```bash
uvicorn app.main:app --reload --port 8000
```

The server will be available at **`http://localhost:8000`**.

---

## 📖 Interactive API Documentation

- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc UI**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## 📡 Complete API Endpoints

### 1. General & Health
- **`GET /`** — Root welcome & status
- **`GET /api/health`** — Service health verification

### 2. Authentication (`/api/auth`)
- **`POST /api/auth/register`** — Register a new user account
- **`POST /api/auth/login`** — Authenticate credentials and receive signed JWT
- **`GET /api/auth/me`** — Retrieve authenticated user profile (Bearer token)
- **`POST /api/auth/logout`** — Stateless logout endpoint

### 3. User & Agricultural Profile (`/api/users`)
- **`GET /api/users/me`** — Get current user identity & profile
- **`PUT /api/users/me`** — Update user identity (name, unique email)
- **`GET /api/users/me/profile`** — Get user agricultural profile (region, crop, season, phone)
- **`PUT /api/users/me/profile`** — Update user agricultural profile

### 4. Agricultural Risk Analysis (`/api/risk`)
- **`POST /api/risk/predict`** — Perform multi-factor risk assessment (validates 14 agronomic metrics)
- **`GET /api/risk/history`** — Retrieve user's risk prediction history
- **`GET /api/risk/history/{prediction_id}`** — Retrieve detailed risk assessment by ID (isolated per user)

### 5. Crop Disease Image Detection (`/api/disease`)
- **`POST /api/disease/predict`** — Upload leaf photo (`multipart/form-data`, JPEG/PNG, max 10MB) for foliar disease diagnosis
- **`GET /api/disease/history`** — Retrieve user's crop disease analysis history
- **`GET /api/disease/history/{prediction_id}`** — Retrieve detailed disease analysis by ID (isolated per user)

### 6. Regional Risk (`/api/regions`)
- **`GET /api/regions`** — List all agricultural regions with risk indices (supports `?state=`, `?crop=`, `?risk_level=`)
- **`GET /api/regions/risk/summary`** — Platform-wide regional risk distribution metrics
- **`GET /api/regions/{region_id}`** — Region details by ID
- **`GET /api/regions/{region_id}/risk`** — Detailed multi-factor risk breakdown & regional recommendations

### 7. Consolidated Dashboard (`/api/dashboard`)
- **`GET /api/dashboard`** — Unified payload for workspace overview, 6 risk categories, trajectory trends, regional breakdown, user recent runs, and recommendations

### 8. Macro Trends & Insights (`/api/insights`)
- **`GET /api/insights`** — Multi-dimensional analytics supporting `?time_period=7d|30d|90d|1y`, `?region=`, `?crop=`, `?season=`

---

## 🧪 Example API Requests

### 1. Regional Risk List & Filtering
```bash
curl -X GET "http://localhost:8000/api/regions?state=Andhra%20Pradesh&crop=Rice" \
  -H "Authorization: Bearer <TOKEN>"
```

### 2. Regional Risk Summary
```bash
curl -X GET "http://localhost:8000/api/regions/risk/summary" \
  -H "Authorization: Bearer <TOKEN>"
```
**Response (200 OK):**
```json
{
  "total_regions": 18,
  "low_risk": 2,
  "moderate_risk": 5,
  "high_risk": 10,
  "critical_risk": 1,
  "highest_risk_region": "Jodhpur",
  "lowest_risk_region": "Gangtok",
  "average_risk_score": 56.4
}
```

### 3. Consolidated Dashboard
```bash
curl -X GET "http://localhost:8000/api/dashboard" \
  -H "Authorization: Bearer <TOKEN>"
```
**Response (200 OK):**
```json
{
  "user": {
    "name": "Farmer Demo",
    "region": "Nellore",
    "preferred_crop": "Rice"
  },
  "risk_overview": {
    "overall_score": 65,
    "overall_level": "HIGH",
    "weather": 72,
    "soil": 45,
    "pest": 58,
    "disease": 64,
    "market": 61,
    "production": 50
  },
  "risk_trend": [
    { "date": "2026-06-01", "score": 55, "month": "Jun" },
    { "date": "2026-08-25", "score": 65, "month": "Aug" }
  ],
  "regional_summary": {
    "low": 2,
    "moderate": 5,
    "high": 10,
    "critical": 1
  },
  "recent_risk_predictions": [],
  "recent_disease_analyses": [],
  "recommendations": [
    {
      "title": "Monitor Pest Activity in Paddy/Cotton",
      "reason": "Elevated pest risk score of 58 detected in regional agro-climatic quadrant.",
      "priority": "HIGH",
      "category": "Pest Management"
    }
  ]
}
```

### 4. Macro Trends & Insights
```bash
curl -X GET "http://localhost:8000/api/insights?crop=Rice&time_period=30d" \
  -H "Authorization: Bearer <TOKEN>"
```

---

## 🔒 Standardized Risk Classification
All endpoints consistently follow the AgriRisk scale:
- `0–24`: **LOW**
- `25–49`: **MODERATE**
- `50–74`: **HIGH**
- `75–100`: **CRITICAL**

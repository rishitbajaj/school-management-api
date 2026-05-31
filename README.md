<div align="center">

```
███████╗ ██████╗██╗  ██╗ ██████╗  ██████╗ ██╗         █████╗ ██████╗ ██╗
██╔════╝██╔════╝██║  ██║██╔═══██╗██╔═══██╗██║        ██╔══██╗██╔══██╗██║
███████╗██║     ███████║██║   ██║██║   ██║██║        ███████║██████╔╝██║
╚════██║██║     ██╔══██║██║   ██║██║   ██║██║        ██╔══██║██╔═══╝ ██║
███████║╚██████╗██║  ██║╚██████╔╝╚██████╔╝███████╗   ██║  ██║██║     ██║
╚══════╝ ╚═════╝╚═╝  ╚═╝ ╚═════╝  ╚═════╝ ╚══════╝   ╚═╝  ╚═╝╚═╝     ╚═╝
```

### `school_onboarding_engine` — Geospatial Proximity REST API

<br/>

[![Node.js](https://img.shields.io/badge/Node.js-0a0d14?style=for-the-badge&logo=nodedotjs&logoColor=5fa04e)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-0a0d14?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com)
[![MySQL](https://img.shields.io/badge/MySQL_Aiven-0a0d14?style=for-the-badge&logo=mysql&logoColor=4479a1)](https://aiven.io)
[![Render](https://img.shields.io/badge/Render-0a0d14?style=for-the-badge&logo=render&logoColor=46e3b7)](https://render.com)

<br/>

![live](https://img.shields.io/badge/status-live-00e5ff?style=flat-square&labelColor=0a0d14)
![type](https://img.shields.io/badge/type-backend_API-00e5ff?style=flat-square&labelColor=0a0d14)
![formula](https://img.shields.io/badge/distance-Haversine_formula-00e5ff?style=flat-square&labelColor=0a0d14)
![db](https://img.shields.io/badge/db-Aiven_MySQL-00e5ff?style=flat-square&labelColor=0a0d14)

<br/>

> **A live REST API for school data management with geographic proximity sorting.** Uses the Haversine formula to compute great-circle distances between coordinates, accounting for the Earth's curvature. Deployed on Render, backed by Aiven cloud MySQL.

<br/>

**Live API Base URL:**
```
https://school-management-api-if0g.onrender.com
```

---

</div>

## `01` &nbsp; What Is This

The School Management API is a **cloud-deployed REST backend** that lets you add schools with coordinate data and retrieve them sorted by proximity to any given location.

The core engineering challenge: computing accurate geographic distances between coordinate pairs at scale. The solution is the **Haversine formula** — a spherical trigonometry calculation that accounts for the curvature of the Earth, producing great-circle distances accurate to within meters.

<br/>

## `02` &nbsp; Architecture

```
school-management-api/
│
├── src/
│   ├── controllers/
│   │   └── school.controller.js       # addSchool + listSchools logic
│   ├── middleware/
│   │   └── validate.js                # Input validation for coordinates
│   ├── utils/
│   │   └── haversine.js               # Haversine distance formula
│   └── db/
│       └── connection.js              # Aiven MySQL pool setup
│
├── routes/
│   └── school.routes.js               # /addSchool, /listSchools
│
├── server.js                          # Express entry point
├── .env.example                       # Required env vars template
└── package.json
```

<br/>

## `03` &nbsp; Tech Stack

| Layer | Technology | Role |
|---|---|---|
| **Runtime** | Node.js | Server environment |
| **Framework** | Express.js | REST API routing + middleware |
| **Database** | MySQL (Aiven) | Cloud-hosted relational store |
| **ORM** | mysql2 | MySQL connection pool |
| **Config** | dotenv | Secure environment management |
| **Deployment** | Render | Cloud hosting + auto-deploy |
| **Testing** | Postman | API documentation + testing |

<br/>

## `04` &nbsp; The Haversine Formula

Standard Euclidean distance breaks down on a sphere — two points at the same lat/lng offset near the poles are much closer than the same offset at the equator. The Haversine formula solves this:

```
a = sin²(Δφ/2) + cos(φ₁) · cos(φ₂) · sin²(Δλ/2)
c = 2 · atan2(√a, √(1−a))
d = R · c

Where:
  φ  = latitude in radians
  λ  = longitude in radians
  R  = Earth's radius (6371 km)
  d  = great-circle distance in km
```

**Implementation:**

```js
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
    Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // distance in km
}
```

The `/listSchools` endpoint computes this for every school in the database against the user's coordinates, then sorts ascending — nearest first.

<br/>

## `05` &nbsp; API Reference

### `POST /addSchool`

Add a new school with geographic coordinates.

```
POST https://school-management-api-if0g.onrender.com/addSchool
Content-Type: application/json
```

```json
{
  "name": "Greenwood High",
  "address": "123 Education Lane, Delhi",
  "latitude": 28.6139,
  "longitude": 77.2090
}
```

**Response:**
```json
{
  "success": true,
  "message": "School added successfully",
  "id": 42
}
```

---

### `GET /listSchools`

Returns all schools sorted by proximity to the provided coordinates.

```
GET https://school-management-api-if0g.onrender.com/listSchools?latitude=28.6139&longitude=77.2090
```

**Response:**
```json
[
  {
    "id": 42,
    "name": "Greenwood High",
    "address": "123 Education Lane, Delhi",
    "latitude": 28.6139,
    "longitude": 77.2090,
    "distance_km": 0.00
  },
  {
    "id": 7,
    "name": "St. Mary's School",
    "address": "456 Park Street, Delhi",
    "latitude": 28.6200,
    "longitude": 77.2150,
    "distance_km": 0.84
  }
]
```

<br/>

## `06` &nbsp; Getting Started

**Prerequisites:** Node.js 18+ · MySQL (or Aiven account)

```bash
# Clone
git clone https://github.com/rishitbajaj/school-management-api.git
cd school-management-api

# Install
npm install

# Configure environment
cp .env.example .env
```

```bash
# .env
DB_HOST=your-aiven-mysql-host
DB_PORT=3306
DB_USER=your_user
DB_PASS=your_password
DB_NAME=school_db
PORT=3000
```

```bash
# Run database migration
npm run migrate

# Start server
npm start
# → http://localhost:3000

# Or with nodemon
npm run dev
```

<br/>

## `07` &nbsp; Live API — Try It Now

```bash
# List schools near India Gate, New Delhi
curl "https://school-management-api-if0g.onrender.com/listSchools?latitude=28.6139&longitude=77.2090"

# Add a school
curl -X POST "https://school-management-api-if0g.onrender.com/addSchool" \
  -H "Content-Type: application/json" \
  -d '{"name":"Demo School","address":"Delhi","latitude":28.7041,"longitude":77.1025}'
```

<br/>

---

<div align="center">

```
RISHIT BAJAJ  ·  IIIT RANCHI  ·  github.com/rishitbajaj
```

[![Email](https://img.shields.io/badge/bajrishit@gmail.com-0a0d14?style=for-the-badge&logo=gmail&logoColor=00e5ff)](mailto:bajrishit@gmail.com)
&nbsp;
[![GitHub](https://img.shields.io/badge/GitHub-0a0d14?style=for-the-badge&logo=github&logoColor=00e5ff)](https://github.com/rishitbajaj)
&nbsp;
[![Live API](https://img.shields.io/badge/Live_API-0a0d14?style=for-the-badge&logo=render&logoColor=00e5ff)](https://school-management-api-if0g.onrender.com/listSchools?latitude=28.6139&longitude=77.2090)

*The Earth is not flat. The distance formula accounts for it.*

</div>
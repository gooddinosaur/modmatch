# ModMatch

## Project Description

ModMatch is an online marketplace tailored for automotive enthusiasts, connecting buyers and sellers of vehicle modifications and parts. It features a specialized **Fitment Engine** to guarantee that buyers can easily and accurately find parts that fit their specific vehicles, improving user confidence and reducing return rates.

## System Architecture Overview

- **Frontend:** Developed using Next.js (React) to provide a fast, SEO-friendly, and responsive user interface.
- **Backend:** A robust RESTful API built with Python (FastAPI), adhering to a layered architecture (API handlers -> Services -> Repositories -> Domain/DB).
- **Database:** Relational database integration managed via ORM (SQLAlchemy model mappings) to store users, listings, fitment data, and transactions.
- **Containerization:** The entire application is orchestrated using Docker and Docker Compose for easy deployment and scaling.

## User Roles & Permissions

- **Admin**
  - View platform statistics
  - Approve, reject pending part listings
  - Delete active part listings
  - View activity logs for status changes
  - Review and resolve reported or disputed orders

- **Seller**
  - View statistics (Listings, Revenue)
  - Create part listings (requires admin approval) and upload images
  - View status of listings
  - View incoming orders and it's status
  - Update seller profile

- **Buyer**
  - Search for parts
  - View part listings and seller profiles
  - Manage saved vehicles
  - Manage shipping addresses
  - Place orders and view purchase history
  - Confirm order or report issues with an order
  - Write reviews and rate purchased parts

## Technology Stack

- **Frontend:** Next.js, React, TypeScript, Tailwind CSS
- **Backend:** Python, FastAPI, SQLAlchemy, Uvicorn
- **Infrastructure:** Docker, Docker Compose
- **Database:** Relational DB (PostgreSQL / SQLite via SQLAlchemy `session.py`)

## Installation & Setup Instructions

### Prerequisites

- Node.js (v18+)
- Python (v3.10+)
- Docker & Docker Compose (Required for Database and Infrastructure)

### 1. Database Setup

Before running the backend, start the database service using Docker:

```bash
docker-compose up -d
```

### 2. Backend Setup

```bash
cd backend
python -m venv .venv

# Activate virtual environment
# On Windows:
.venv\Scripts\activate
# On Mac/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Reset Database (Ensure Docker DB is running first)
python reset_db.py
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

## How to Run the System

### Option A: Using Docker Compose (Recommended)

You can build and spin up the entire stack seamlessly:

```bash
docker-compose up --build
```

- Frontend will be accessible at `http://localhost:3000`
- Backend API will be available at `http://localhost:8000`

### Option B: Running Locally (Development Mode)

Run these commands in two separate terminal windows.

**Terminal 1 (Backend):**

```bash
cd backend
.venv\Scripts\activate
# Start the API server
uvicorn app.main:app --reload
```

**Terminal 2 (Frontend):**

```bash
cd frontend
npm run dev
```

## Screenshots of the System

### 1. Landing Page / Search

![Landing Page](./public/screenshots/home-placeholder.png)
_Browse parts and use the Fitment Engine to filter by vehicle._

### 2. Seller Dashboard

![Seller Dashboard](./public/screenshots/seller-placeholder.png)
_Sellers can easily manage inventory and track their part listings._

### 3. Admin Panel

![Admin Panel](./public/screenshots/admin-placeholder.png)
_Moderation and overview of platform activity._

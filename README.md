# ModMatch

## Project Description

ModMatch is an online marketplace tailored for automotive enthusiasts, connecting buyers and sellers of vehicle modifications and parts. It features a specialized **Fitment Engine** to guarantee that buyers can easily and accurately find parts that fit their specific vehicles, improving user confidence and reducing return rates.

## System Architecture Overview
<img width="1204" height="852" alt="Screenshot 2026-04-15 140146" src="https://github.com/user-attachments/assets/b13cf36a-0ce6-463b-95c1-ec53fc1988b6" />

- **Client/Browser:** The entry point where users interact with the application’s interface.
- **Frontend:** Handles the UI logic and communicates with the backend via REST API calls.
- **Backend:** The core engine that processes business logic, security, and data orchestration.
- **PostgreSQL:** The relational database used for persistent storage of users, car parts, and order data.
- **Static Files:** A dedicated storage area for media assets, such as images of automotive parts.

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
docker-compose up -d db
```

### 2. Backend Setup

#### 2.1 Create a virtual environment

**On Windows:**

```bash
cd backend
python -m venv .venv
```

**On Mac/Linux:**

```bash
cd backend
python3 -m venv .venv
```

#### 2.2 Activate the virtual environment

**On Windows:**

```bash
.venv\Scripts\activate
```

**On Mac/Linux:**

```bash
source .venv/bin/activate
```

#### 2.3 Install the required Python dependencies

**On Windows:**

```bash
pip install -r requirements.txt
```

**On Mac/Linux:**

```bash
pip3 install -r requirements.txt
```

#### 2.4 Reset the database

_(Ensure the Docker database service is running)_

**On Windows:**

```bash
python reset_db.py
```

**On Mac/Linux:**

```bash
python3 reset_db.py
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

## How to Run the System

### Option A: Using Docker Compose

You can build and spin up the entire stack seamlessly:

```bash
docker-compose up --build
```

- Frontend will be accessible at `http://localhost:3000`
- Backend API will be available at `http://localhost:8000`

### Option B: Running Locally

Run these commands in two separate terminal windows.

**Terminal 1 (Backend):**

Navigate to the backend directory and activate the virtual environment.

**On Windows:**

```bash
cd backend
.venv\Scripts\activate
```

**On Mac/Linux:**

```bash
cd backend
source .venv/bin/activate
```

Start the API server:

```bash
uvicorn app.main:app --reload
```

**Terminal 2 (Frontend):**

Navigate to the frontend directory and start the development server:

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

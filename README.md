# SENG384-project
Seng 384 Project - HealthTech Co-Creation &amp; Innovation Platform

## Project Purpose
Multidisciplinary health-tech innovation requires rapid and structured access to complementary expertise. Engineers developing healthcare technologies require clinical domain knowledge, workflow understanding, validation processes, and ethical approval pathways. Conversely, healthcare professionals often generate strong innovation ideas but lack engineering competence to implement them. Currently, such partnerships depend largely on personal networks or coincidence.  

The HEALTH AI co-creation platform eliminates randomness in interdisciplinary collaboration by providing: 

- Structured announcement-based partner discovery 
- Secure first-contact initiation 
- Controlled disclosure of ideas 
- Transparent meeting workflow 
- Clear closure of partner requests 

The objective is to develop a secure, GDPR-compliant web platform that enables structured partner discovery between healthcare professionals and engineers, with usability as the highest priority requirement. 

## How to Run

### 0. Environment Setup
Before starting the project, you must configure your environment variables. 
Copy the `.env.example` file and create a new file named `.env`:
```bash
cp .env.example .env
```
Open the `.env` file and make sure to update the credentials before running the application.

### 1. UI Development (Frontend Only)
To test and develop the user interface quickly without the database:
```bash
cd frontend
npm install
npm run dev
```
Open your browser at: **http://localhost:5173**

### 2. Full-Stack (Backend + Database + Frontend) - Docker Compose
With Docker Desktop running, use the following commands in the project root directory:

**To start the system:**
```bash
docker-compose up -d --build
```
- **Frontend UI:** `http://localhost:5173`
- **Backend API:** `http://localhost:5000`
- **Database:** `localhost:5432`

> **Note on Email Verification:** When registering a new account, the backend uses *Ethereal Mail* to simulate sending confirmation links. To successfully activate a new account, you must check the backend console to click the verification link:
> ```bash
> docker-compose logs backend -f
> ```

**To stop the system:**
```bash
docker-compose down
```

**To view logs/errors:**
```bash
docker-compose logs -f
```

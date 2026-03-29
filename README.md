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

**To stop the system:**
```bash
docker-compose down
```

**To view logs/errors:**
```bash
docker-compose logs -f
```

### Screenshots of Project V1 (Not Completed Yet)
Main Screen and Login/Register
<img width="1415" height="922" alt="3" src="https://github.com/user-attachments/assets/35085d50-5aa2-4699-892f-2a2e57543b53" />
<img width="1277" height="924" alt="4" src="https://github.com/user-attachments/assets/ee4cce3e-d315-492a-81bf-28cf9117df2e" />

Innovation Board
<img width="1311" height="954" alt="5" src="https://github.com/user-attachments/assets/a36a8126-255e-4ec8-9f5b-e197eae4c711" />

Post Detail and Send Meeting
<img width="1250" height="891" alt="6" src="https://github.com/user-attachments/assets/06e57f4c-f807-456e-9e4e-719173071f09" />
 
Create Announcement
<img width="1249" height="956" alt="7" src="https://github.com/user-attachments/assets/8df6b0ff-71c9-4d4e-92c0-3cf774d1a402" />

Admin Screens
<img width="1405" height="798" alt="1" src="https://github.com/user-attachments/assets/72fd6480-a97c-4e9f-af79-0baab974db10" />




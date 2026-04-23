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

### Screenshots of Project V1 (Not Completed Yet)
Register Page
<img width="1225" height="866" alt="register" src="https://github.com/user-attachments/assets/92abef13-c256-4510-84c9-64f40663d9be" />

Login Page
<img width="1200" height="861" alt="login" src="https://github.com/user-attachments/assets/4e44e583-8888-4534-85e1-8d78d112a1fb" />

Dashboard Page
<img width="1209" height="914" alt="innovationboard" src="https://github.com/user-attachments/assets/a48dd8e6-be45-4a81-adc4-76459c8069c9" />

Dashboard Page - My Posts
<img width="1122" height="848" alt="myposts" src="https://github.com/user-attachments/assets/7e6c33b4-b330-44a4-8590-190e8006acdf" />

Express Interest Page
<img width="1192" height="697" alt="expressinteres" src="https://github.com/user-attachments/assets/1d0661bc-16d5-40dc-8956-18b519baccc6" />

Send Message
<img width="1192" height="697" alt="expressinteres" src="https://github.com/user-attachments/assets/8c1411df-0ff6-4992-9f98-112b3e600b0c" />

Message Sent Popup Message
<img width="1170" height="537" alt="messagesent" src="https://github.com/user-attachments/assets/3d83bac3-7961-4deb-8d50-9167326ae226" />

Create Announcement Page
<img width="770" height="846" alt="createannouncement" src="https://github.com/user-attachments/assets/35476252-a8ac-4ca4-9ab3-9dcc7287f4be" />

Profile Setting Page
<img width="489" height="690" alt="profile" src="https://github.com/user-attachments/assets/a6b0064e-cb28-4ba1-a133-cf2ee865e4d0" />

Requests Page
<img width="489" height="690" alt="profile" src="https://github.com/user-attachments/assets/5bd325e1-5cf6-423d-9db3-7e0dca0fb889" />

Requests Page (Different Situations)
<img width="489" height="690" alt="profile" src="https://github.com/user-attachments/assets/dd9c4173-8815-4d3c-a38d-9422d7244fd9" />

Admin Page - Manage Posts
<img width="1145" height="849" alt="adminmanageposts" src="https://github.com/user-attachments/assets/89dbe9c2-adb3-4a92-81fc-ba3fec2f075c" />

Admin Page - Manage Users
<img width="1138" height="879" alt="adminmanageusers" src="https://github.com/user-attachments/assets/b7132fbe-2c29-43c3-9026-ca90826a334d" />

Admin Page - Statistics and Logs
<img width="1124" height="862" alt="adminstatistics" src="https://github.com/user-attachments/assets/2b4b0c80-e401-4467-9a3f-5d2557939ef9" />






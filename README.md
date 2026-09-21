#  HackColab

> **A cloud-based collaboration platform for hackathon teams to manage tasks, deadlines, team members, GitHub activity, project files, and submission requirements in one centralized workspace.**

🌐 **Live Website:** http://44.201.16.165

---

##  Overview

HackColab brings hackathon project management into a single workspace instead of requiring teams to use separate tools for tasks, GitHub, file sharing, deadlines, and submission tracking.

### Core Features

-  User signup, login and JWT authentication
-  Hackathon and team creation
-  Team member management
-  Kanban task management
-  Deadline tracking
-  GitHub repository integration
-  Branch, commit and pull-request activity
-  Potential file-overlap/conflict detection
-  Project file upload and management
-  Amazon S3 file storage
-  Submission checklist
-  Centralized team dashboard

---

#  System Architecture

```text
                         ┌─────────────────────┐
                         │       USERS         │
                         │     Web Browser     │
                         └──────────┬──────────┘
                                    │ HTTP
                                    ▼
                    ┌────────────────────────────┐
                    │          AWS VPC           │
                    │        10.0.0.0/16         │
                    │                            │
                    │   ┌────────────────────┐   │
                    │   │    PUBLIC SUBNET   │   │
                    │   │     10.0.1.0/24    │   │
                    │   │                    │   │
                    │   │   ┌────────────┐   │   │
                    │   │   │    EC2     │   │   │
                    │   │   │ HackColab  │   │   │
                    │   │   │   Server   │   │   │
                    │   │   └─────┬──────┘   │   │
                    │   └─────────┼──────────┘   │
                    │             │              │
                    │             │ TCP 5432     │
                    │             ▼              │
                    │   ┌────────────────────┐   │
                    │   │   PRIVATE SUBNETS  │   │
                    │   │                    │   │
                    │   │   ┌────────────┐   │   │
                    │   │   │ RDS        │   │   │
                    │   │   │ PostgreSQL │   │   │
                    │   │   └────────────┘   │   │
                    │   └────────────────────┘   │
                    └────────────┬───────────────┘
                                 │ IAM Role
                                 ▼
                       ┌─────────────────────┐
                       │     Amazon S3       │
                       │    Project Files    │
                       └─────────────────────┘
```

---

#  AWS Architecture

HackColab uses the following AWS services:

| AWS Service | Purpose |
|---|---|
| **Amazon VPC** | Isolated networking environment |
| **Amazon EC2** | Hosts the frontend and backend |
| **Amazon RDS PostgreSQL** | Managed relational database |
| **Amazon S3** | Stores project files |
| **AWS IAM** | Provides EC2 permission to access S3 |
| **Internet Gateway** | Internet connectivity for the public subnet |
| **Security Groups** | Controls network access |
| **Route Tables** | Controls subnet traffic routing |

## AWS Network Layout

```text
                         INTERNET
                             │
                             ▼
                    ┌─────────────────┐
                    │ Internet Gateway│
                    │  HackColab-IGW  │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ Public Route    │
                    │ Table           │
                    │ HackColab-Public│
                    │ -RT             │
                    └────────┬────────┘
                             │
                             ▼
             ┌──────────────────────────────┐
             │        PUBLIC SUBNET         │
             │         10.0.1.0/24          │
             │                              │
             │        ┌───────────┐         │
             │        │    EC2    │         │
             │        │ HackColab │         │
             │        └─────┬─────┘         │
             └──────────────┼───────────────┘
                            │ TCP 5432
                            ▼
             ┌──────────────────────────────┐
             │       PRIVATE SUBNETS       │
             │                              │
             │   ┌────────────────────────┐ │
             │   │ RDS PostgreSQL         │ │
             │   │ Public Access: No      │ │
             │   └────────────────────────┘ │
             │                              │
             │ 10.0.2.0/24   10.0.3.0/24   │
             └──────────────────────────────┘

                       EC2 IAM Role
                            │
                            ▼
                    ┌───────────────┐
                    │      S3       │
                    │ Project Files │
                    └───────────────┘
```

## AWS Infrastructure

| Resource | Configuration |
|---|---|
| VPC | `HackColab-VPC` |
| VPC CIDR | `10.0.0.0/16` |
| Public Subnet | `HackColab-Public-Subnet` / `10.0.1.0/24` |
| Private Subnet 1 | `HackColab-Private-Subnet` / `10.0.2.0/24` |
| Private Subnet 2 | `HackColab-Private-Subnet-2` / `10.0.3.0/24` |
| Internet Gateway | `HackColab-IGW` |
| EC2 | `HackColab-Server` |
| RDS | `hackcolab-db` |
| S3 | `hackcolab-project-files-vaishnavi` |
| IAM Role | `HackColab-EC2-S3-Role` |
| Region | `us-east-1` |

---

#  ER Diagram

```text
┌──────────────────┐
│       USER       │
├──────────────────┤
│ id (PK)          │
│ name             │
│ email            │
│ password         │
└────────┬─────────┘
         │
         │ creates
         ▼
┌──────────────────┐
│    HACKATHON     │
├──────────────────┤
│ id (PK)          │
│ name             │
│ description      │
│ startDate        │
│ endDate          │
└────────┬─────────┘
         │
         │ contains
         ▼
┌──────────────────┐
│       TEAM       │
├──────────────────┤
│ id (PK)          │
│ name             │
│ hackathonId (FK) │
└────────┬─────────┘
         │
         ├───────────────────┐
         │                   │
         ▼                   ▼
┌──────────────────┐  ┌──────────────────┐
│   TEAM MEMBER    │  │       TASK       │
├──────────────────┤  ├──────────────────┤
│ id (PK)          │  │ id (PK)          │
│ teamId (FK)      │  │ teamId (FK)      │
│ userId (FK)      │  │ title            │
│ role             │  │ description      │
└──────────────────┘  │ status           │
                      │ assigneeId       │
                      └──────────────────┘

         TEAM
           │
           ├───────────────────┐
           ▼                   ▼
┌──────────────────┐  ┌──────────────────┐
│     DEADLINE     │  │      UPLOAD      │
├──────────────────┤  ├──────────────────┤
│ id (PK)          │  │ id (PK)          │
│ hackathonId (FK) │  │ teamId (FK)      │
│ title            │  │ fileName         │
│ dueDate          │  │ s3Key            │
└──────────────────┘  │ fileUrl          │
                      └──────────────────┘

         TEAM
           │
           ├───────────────────┐
           ▼                   ▼
┌──────────────────┐  ┌──────────────────┐
│   SUBMISSION     │  │   GITHUB REPO    │
├──────────────────┤  ├──────────────────┤
│ id (PK)          │  │ id (PK)          │
│ teamId (FK)      │  │ teamId (FK)      │
│ title            │  │ repoUrl          │
│ completed        │  │ owner            │
└──────────────────┘  │ repository       │
                      └──────────────────┘
```

### Additional Application Entities

The backend also contains models for:

- Categories
- Claims
- Conversations
- Messages
- NGO profiles
- NGO needs
- Impact records
- Notifications
- Team invitations

---

#  Application Workflow

```text
                         USER
                           │
                           ▼
                  ┌────────────────┐
                  │ React Frontend │
                  └───────┬────────┘
                          │ REST API
                          ▼
                  ┌────────────────┐
                  │ Express Backend│
                  └───────┬────────┘
                          │
             ┌────────────┼─────────────┐
             │            │             │
             ▼            ▼             ▼
          Prisma       GitHub API     AWS S3
             │
             ▼
       PostgreSQL RDS
```

## Task Creation Flow

```text
User
 ↓
React Frontend
 ↓
POST /api/teams/:teamId/tasks
 ↓
Express API
 ↓
JWT Authentication
 ↓
Prisma ORM
 ↓
PostgreSQL RDS
 ↓
Task Created
```

## File Upload Flow

```text
User selects file
        ↓
React Frontend
        ↓
Express Backend
        ↓
AWS SDK
        ↓
Amazon S3
        ↓
File stored
        ↓
Metadata stored in PostgreSQL
```

## GitHub Synchronization Flow

```text
HackColab
    │
    ▼
GitHub REST API
    │
    ├── Repository
    ├── Branches
    ├── Commits
    └── Pull Requests
             │
             ▼
      HackColab Database
             │
             ▼
       Team Dashboard
```

---

# 🔐 Security

## JWT Authentication

```text
Login
  ↓
JWT Generated
  ↓
Client
  ↓
Authenticated API Request
  ↓
JWT Verification
  ↓
Protected Resource
```

## AWS Security Groups

### EC2 Security Group

`HackColab-EC2-SG`

- TCP 22 — SSH / EC2 Instance Connect
- TCP 80 — HTTP
- TCP 443 — HTTPS

### RDS Security Group

`HackColab-RDS-SG`

- TCP 5432 — PostgreSQL
- Source: EC2 security group

This allows the database to accept connections from the application server while keeping RDS inaccessible through public internet access.

## IAM

The EC2 instance uses:

`HackColab-EC2-S3-Role`

This gives the application permission to access S3 without storing static AWS credentials on the EC2 server.

---

# 🖥️ EC2 Deployment

The EC2 server hosts the production application.

### Installed

- Node.js
- npm
- Git
- Nginx
- PM2
- PostgreSQL client

### Nginx

Nginx serves the React production build and acts as a reverse proxy:

```text
Browser
   │
   ▼
Nginx :80
   │
   ├── /       → React frontend
   │
   └── /api/   → Express backend :5000
```

### PM2

PM2 keeps the Node.js/Express backend process running on EC2.

---

#  Technology Stack

### Frontend

- React
- Vite
- JavaScript
- Axios
- HTML5
- CSS

### Backend

- Node.js
- Express.js
- JavaScript
- JWT
- Axios
- AWS SDK

### Database

- PostgreSQL
- Prisma ORM

### Cloud

- Amazon EC2
- Amazon RDS
- Amazon S3
- Amazon VPC
- AWS IAM
- Internet Gateway
- Security Groups
- Route Tables

### Deployment

- Ubuntu
- Nginx
- PM2
- Git
- npm

---

#  API Overview

## Authentication

```text
POST   /api/auth/signup
POST   /api/auth/login
GET    /api/auth/me
POST   /api/auth/logout
```

## Hackathons & Teams

```text
POST   /api/hackathons
GET    /api/hackathons
GET    /api/hackathons/:id

POST   /api/hackathons/:hackathonId/teams
GET    /api/teams/:teamId
POST   /api/teams/:teamId/members
GET    /api/teams/:teamId/members
```

## Tasks

```text
POST   /api/teams/:teamId/tasks
GET    /api/teams/:teamId/tasks
GET    /api/tasks/:taskId
PATCH  /api/tasks/:taskId
DELETE /api/tasks/:taskId
```

## Deadlines

```text
POST   /api/hackathons/:hackathonId/deadlines
GET    /api/hackathons/:hackathonId/deadlines
GET    /api/deadlines/:deadlineId
PATCH  /api/deadlines/:deadlineId
DELETE /api/deadlines/:deadlineId
```

## Files

```text
POST   /api/teams/:teamId/uploads
GET    /api/teams/:teamId/uploads
DELETE /api/uploads/:uploadId
```

## Submissions

```text
POST   /api/teams/:teamId/submissions
GET    /api/teams/:teamId/submissions
PATCH  /api/submissions/:itemId
DELETE /api/submissions/:itemId
```

## Dashboard

```text
GET    /api/teams/:teamId/dashboard
```

---

#  Project Structure

```text
HackColab/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   └── server.js
│   │
│   ├── prisma/
│   │   └── migrations/
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── ...
│   ├── package.json
│   └── .env
│
└── README.md
```

---

#  Running Locally

## Backend

```bash
cd backend
npm install
```

Create `.env`:

```env
PORT=5000
DATABASE_URL="your-postgresql-connection-string"
JWT_SECRET="your-secret"
AWS_REGION="your-region"
AWS_S3_BUCKET="your-bucket"
```

Then:

```bash
npx prisma generate
npx prisma migrate deploy
npm run dev
```

## Frontend

```bash
cd frontend
npm install
npm run dev
```

---

#  Problem Statement

Hackathon teams commonly use multiple disconnected tools for:

- Communication
- Task management
- GitHub development
- File sharing
- Deadline tracking
- Submission management

This makes it difficult to maintain a clear overview of project progress.

### Solution

HackColab provides a centralized workspace for managing the hackathon development lifecycle.

```text
             ┌─────────────────┐
             │    HACKCOLAB    │
             └────────┬────────┘
                      │
       ┌──────────────┼──────────────┐
       ▼              ▼              ▼
     Tasks        Deadlines       GitHub
       │              │              │
       ├──────────────┼──────────────┤
       ▼              ▼              ▼
    Members          Files       Submission
```

---

#  AWS Concepts Used

## Networking

- VPC
- CIDR blocks
- Public subnets
- Private subnets
- Internet Gateway
- Route tables
- Network isolation

## Compute

- EC2
- Ubuntu server
- Nginx
- PM2

## Database

- Amazon RDS
- PostgreSQL
- Private database deployment
- Database security groups

## Storage

- Amazon S3
- Object storage
- S3 integration using AWS SDK

## Security

- IAM roles
- Security groups
- JWT authentication
- Restricted database access

## Deployment

- React production build
- Express API deployment
- Nginx reverse proxy
- PM2 process management

---

#  Key Learning Outcomes

This project demonstrates practical experience with:

- Full-stack web development
- REST API design
- JWT authentication
- Relational database design
- Prisma ORM
- PostgreSQL
- GitHub REST API integration
- Cloud storage
- AWS EC2 deployment
- AWS RDS
- AWS S3
- AWS IAM
- VPC networking
- Public/private subnets
- Route tables
- Internet Gateway
- Security groups
- Nginx reverse proxy
- PM2 process management
- Cloud-based application architecture

---

#  Future Enhancements

- GitHub OAuth integration
- GitLab integration
- Real-time team chat
- Push notifications
- Automatic Git conflict resolution
- Organizer/admin dashboard
- Hackathon matchmaking
- AI-powered task recommendations
- Advanced project analytics
- Real-time collaborative editing

---

# 🌐 Live Application

## 👉 [Open HackColab](http://44.201.16.165)

**Hosting:** Amazon EC2  
**Database:** Amazon RDS PostgreSQL  
**File Storage:** Amazon S3  
**Region:** `us-east-1`

---

#  Authors

**Vaishnavi J**  
B.Tech Artificial Intelligence & Data Science  
Shiv Nadar University, Chennai

**Vishvapriya M**  
B.Tech Artificial Intelligence & Data Science  
Shiv Nadar University, Chennai

---

##  HackColab

> **One workspace. One team. One hackathon.**

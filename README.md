# Task Management System

A full-stack, enterprise-grade Task Management System built with **.NET 8** and **Angular**. The system is fully containerized using **Docker** and orchestrated with **Docker Compose**, featuring a modern UI, robust authentication, and seamless database integration.

## 🚀 Features

- **User Authentication:** Secure JWT-based login and registration.
- **Task Management:** Create, read, update, and delete tasks.
- **Categories:** Organize tasks into customizable categories with color coding.
- **Collaboration:** Add comments and file attachments to tasks.
- **Modern UI:** Responsive design with Dark/Light theme toggle.
- **Multi-Database Support:** Out-of-the-box support for PostgreSQL (default) and Oracle databases.

## 🛠 Technologies

### Backend

- **Framework:** .NET 8 (ASP.NET Core Web API)
- **ORM:** Entity Framework Core
- **Database:** PostgreSQL (with Oracle support via `DatabaseProvider` flag)
- **Security:** JWT Authentication, BCrypt Password Hashing

### Frontend

- **Framework:** Angular (v18+)
- **Styling:** Custom CSS/SCSS, Responsive Layouts
- **Server:** Nginx (used as a lightweight web server and reverse proxy in production)

### DevOps

- **Containerization:** Docker & Docker Compose
- **Reverse Proxy:** Nginx proxying API requests to the .NET backend to avoid CORS issues in production.

## 📦 Prerequisites

To run this project locally using containers, you only need:

- [Docker Desktop](https://www.docker.com/products/docker-desktop) installed and running.
- Git

## ⚙️ Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/furylmz/task-management-system
cd task-management-system
```

### 2. Configure Environment Variables

Copy the example environment file and update it's necessary parts:

```bash
cp .env.example .env
```

### 3. Run with Docker Compose

Start the entire stack (Database, Backend API, and Frontend) in detached mode:

```bash
docker compose up -d --build
```

> **Note:** The backend is configured to automatically apply Entity Framework migrations on startup and seed a `demo` user for testing.

### 4. Access the Application

Once the containers are up and running, you can access the services at the following local URLs:

- **Frontend (Web App):** [http://localhost:4200](http://localhost:4200)
- **Backend (API):** [http://localhost:5217/api](http://localhost:5217/api) (Proxied through Nginx for seamless integration)
- **Database (PostgreSQL):** Accessible on `localhost:5432` using your preferred DB client (e.g., DBeaver, pgAdmin).

## 🔑 Demo Account

If you want to test the application quickly, you can use the pre-seeded demo account:

- **Username:** `demo`
- **Password:** `Demo123!`

## 🛑 Stopping the Application

To safely stop the containers without losing your database data:

```bash
docker compose down
```

## 🏗 Directory Structure

```text
📦 task-management-system
├── 📂 Backend                 # Backend Application (.NET 8 Web API)
│   └── 📂 TaskManagement.API
│       └── 🐳 Dockerfile      # Backend Container Configuration
│
├── 📂 Frontend                # Frontend Application (Angular 18+ UI)
│   └── 📂 TaskManagement.Web
│       ├── ⚙️ nginx.conf      # Nginx Reverse Proxy Configuration
│       └── 🐳 Dockerfile      # Frontend Container Configuration
│
├── 🐳 docker-compose.yml      # Docker Orchestration Configuration
├── 🔐 .env.example            # Environment Variables Template
└── 📄 README.md               # Project Documentation
```

## 📄 License

This project is licensed under the MIT License.

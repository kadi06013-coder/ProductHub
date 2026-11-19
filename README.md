# Product & Category Management System

A full-stack web application developed using Angular 22 and Node.js/Express, providing product and category management through CRUD operations and RESTful API integration.

## Project Overview

This project demonstrates the development of a modern web application with a standalone Angular frontend and an Express.js backend connected to a MySQL database.

The application allows users to manage products and categories through an intuitive interface with a modern glassmorphism design.

## Technologies Used

| Layer | Technologies |
|---|---|
| Frontend | Angular 22, TypeScript, HTML, CSS |
| Backend | Node.js, Express.js |
| Database | MySQL |
| Validation | Joi |
| API Testing | Postman |
| Architecture | RESTful API, Standalone Components |

## Key Features

- Product CRUD operations (Create, Read, Update, Delete).
- Category CRUD operations.
- Product and category association.
- Form validation and error handling.
- RESTful API integration.
- MySQL database management.
- Responsive user interface.
- Modern glassmorphism design.

## Project Structure

```text
angular-atelier4/
├── front/                  # Angular frontend
│   └── src/
│       └── app/
│           ├── core/
│           └── features/
│               ├── products/
│               └── categories/
│
├── mon-api/                # Express backend
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middlewares/
│       ├── models/
│       └── routes/
│
└── README.md
```

## Prerequisites

- Node.js (v18 or later)
- MySQL Server
- Angular CLI (if required by the project setup)

## Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/kadi06013-coder/angular-atelier4.git
cd angular-atelier4
```

### 2. Database Configuration

Create the MySQL database and configure your database connection using the environment variables required by the backend.

### 3. Backend Setup

```bash
cd mon-api
npm install
```

Configure your `.env` file using the provided `.env.example`, then start the backend:

```bash
npm run dev
```

### 4. Frontend Setup

Open another terminal:

```bash
cd front
npm install
npm start
```

The frontend and backend can now run locally.

## Learning Objectives

- Building standalone Angular applications.
- Developing RESTful APIs with Express.js.
- Integrating Angular with a backend API.
- Managing relational data with MySQL.
- Organizing frontend and backend project architecture.
- Implementing CRUD operations and form validation.

## Author

**Rim Kadi**

Information Systems Development Student


IMSQuty Technical Architecture & System Overview

Project Name: IMSQuty (Integrated Management System for Quty)
Domain: Enterprise Asset & Ticket Management
Architecture: Microservices-based (Hybrid Polyglot)
Status: Production-ready (98% Complete)

1. Executive Summary

IMSQuty is a comprehensive enterprise resource planning (ERP) solution designed for asset tracking, ticket management, and organizational operations. Unlike the previously misidentified "inequality solver," IMSQuty employs a distributed microservices architecture comprising 10 distinct services, a unified API Gateway, and multi-platform frontends (Web, Mobile).

The system is built to handle high-volume enterprise data with strict separation of concerns, utilizing PHP/Laravel for core business logic, Node.js for high-throughput routing, and React/Flutter for user interfaces.

2. High-Level Architecture

The system follows a modern layered architecture:

graph TD
    User[User Clients]
    
    subgraph Frontend
        Web[React Web App]
        Mobile[Flutter Mobile App]
        Admin[React Admin Panel]
    end
    
    subgraph Ingress
        Gateway[Node.js API Gateway (Port 8000)]
    end
    
    subgraph Microservices_Layer_PHP_Laravel
        Asset[Asset Service]
        Ticket[Ticket Service]
        Auth[Auth Service]
        UserSvc[User Service]
        Finance[Financial Service]
        Inv[Inventory Service]
        Meet[Meeting Room Service]
        Notif[Notification Service]
        Report[Reporting Service]
        Master[Master Data Service]
    end
    
    subgraph Data_Layer
        DB[(MySQL 8.0 Cluster)]
        Cache[(Redis 7)]
        Queue[(RabbitMQ)]
    end

    User --> Web
    User --> Mobile
    Web --> Gateway
    Mobile --> Gateway
    Gateway --> Auth
    Gateway --> Asset
    Gateway --> Ticket
    Gateway --> UserSvc
    
    Asset --> DB
    Ticket --> DB
    
    Asset -.-> Queue
    Queue -.-> Notif


2.1 Communication Patterns

External Traffic: RESTful HTTP/JSON via API Gateway.

Internal Traffic: HTTP (Service-to-Service) and Async Messaging (RabbitMQ).

Authentication: Centralized JWT (JSON Web Token) issued by the Auth Service, validated by the Gateway.

3. Component Breakdown

3.1 Frontend Layer

The user interface is decoupled from the backend, providing native experiences for different user personas.

Application

Tech Stack

Key Libraries

Features

Web App

React 18, TypeScript

Redux Toolkit, Material-UI v5, Recharts, Axios

Dashboard, Asset Management, Ticket Submission.

Mobile App

Flutter 3.16, Dart

Riverpod, Dio, Go_Router, Hive

QR Scanning, Field Operations, Push Notifications.

Admin Panel

React 18, TypeScript

React-Hook-Form, DataGrid

RBAC Configuration, Audit Logs, System Settings.

3.2 API Gateway (Node.js)

Serves as the single entry point for all client requests.

Framework: Express.js

Responsibilities:

Routing: Proxies requests to appropriate microservices (e.g., /api/v1/assets $\rightarrow$ Asset Service).

Security: Rate limiting (express-rate-limit), Helmet headers, CORS policies.

Auth Middleware: Validates JWTs before passing requests downstream.

Dependencies: http-proxy-middleware, jsonwebtoken, winston, redis.

3.3 Microservices Layer (PHP/Laravel 10)

Ten isolated services handle specific business domains. Each service maintains its own database schema.

Service Name

Responsibility

Key Features

Asset Service

Asset Lifecycle

Procurement, assignment, depreciation, QR tagging.

Ticket Service

Issue Tracking

Helpdesk ticketing, SLA tracking, resolution workflows.

Auth Service

Identity

Login, Registration, Token Refresh, Permission Seeding.

Inventory Service

Stock Control

Consumables tracking, low-stock alerts, procurement.

User Service

HR Data

Employee profiles, department hierarchy, roles.

Financial Service

Accounting

Expense tracking, budget allocation, asset valuation.

Meeting Room

Facilities

Room booking, conflict resolution, resource scheduling.

Notification

Alerts

Email/Push dispatch via RabbitMQ consumers.

Reporting

Analytics

Aggregated data generation, PDF/Excel exports.

Master Data

Reference

Dropdown values, categories, global settings.

3.4 Data & Infrastructure

Database: MySQL 8.0 (52+ tables across service schemas).

Caching: Redis 7 (Session storage, API response caching).

Messaging: RabbitMQ (Asynchronous events for notifications and audit logging).

Containerization: Docker & Docker Compose ready.

4. Codebase Structure

The project utilizes a monorepo-like structure for organization, though services are deployable independently.

/
├── api-gateway/                # Node.js Entry Point
│   ├── src/routes/             # Route definitions
│   └── package.json
├── services/                   # Backend Microservices
│   ├── asset-service/          # Laravel App
│   ├── auth-service/           # Laravel App
│   ├── ticket-service/         # Laravel App
│   └── ... (7 others)
├── frontend/                   # User Interfaces
│   ├── web-app/                # React Project
│   │   └── src/components/
│   ├── mobile-app/             # Flutter Project
│   │   └── lib/screens/
│   └── admin-panel/            # React Project
└── docker-compose.yml          # Orchestration


5. Security Posture

Authentication: JWT-based stateless authentication. Tokens are signed by the Auth Service and verified by the Gateway.

Authorization: Role-Based Access Control (RBAC) enforced at the middleware level.

Data Protection:

No "pollution" dependencies (Clean package.json/composer.json).

Soft deletes implemented for data compliance.

Audit logging for critical write operations.

API Security: Rate limiting enabled on the Gateway to prevent DDoS; Helmet used for HTTP header hardening.

6. Correction Note

Replaces: gemini review.md (Archived/Deleted)

Correction: The previous report incorrectly identified this project as a Python/Java mathematical solver. This document rectifies that error based on verified project artifacts.

Documentation generated January 5, 2026
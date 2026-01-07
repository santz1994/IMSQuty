# Ticket Service API Endpoints - Advanced Features

## SLA Management Endpoints

### 1. Get SLA Status for Ticket
**Endpoint:** `GET /api/v1/sla/tickets/{ticketId}/status`

**Description:** Get detailed SLA status for a specific ticket including response time and resolution time metrics.

**Response:**
```json
{
  "success": true,
  "ticket_id": 123,
  "sla_policy": {
    "id": 1,
    "name": "High Priority SLA",
    "response_time_hours": 4,
    "resolution_time_hours": 24
  },
  "response": {
    "status": "Met",
    "deadline": "2026-01-07T14:00:00Z",
    "elapsed_minutes": 120,
    "remaining_minutes": 120,
    "is_breached": false
  },
  "resolution": {
    "status": "On Track",
    "deadline": "2026-01-08T10:00:00Z",
    "elapsed_minutes": 120,
    "remaining_minutes": 1320,
    "is_breached": false
  },
  "overall_status": "Met",
  "ticket_status": "In Progress",
  "created_at": "2026-01-07T10:00:00Z"
}
```

### 2. Get Overdue Tickets
**Endpoint:** `GET /api/v1/sla/overdue`

**Description:** Get all tickets where SLA has been breached.

### 3. Get At-Risk Tickets
**Endpoint:** `GET /api/v1/sla/at-risk`

**Description:** Get all tickets that are at risk of SLA breach (within 20% of deadline).

### 4. Get SLA Statistics
**Endpoint:** `GET /api/v1/sla/statistics`

**Description:** Get overall SLA compliance statistics.

**Response:**
```json
{
  "success": true,
  "statistics": {
    "total_active_tickets": 150,
    "sla_met": 120,
    "sla_at_risk": 20,
    "sla_breached": 10,
    "compliance_rate": 80.00
  }
}
```

### 5. Check if Ticket Should be Escalated
**Endpoint:** `GET /api/v1/sla/tickets/{ticketId}/check-escalation`

**Description:** Check if a ticket should be escalated based on SLA status.

---

## Assignment Management Endpoints

### 1. Auto-Assign Ticket
**Endpoint:** `POST /api/v1/assignments/tickets/{ticketId}/auto-assign`

**Description:** Automatically assign ticket to the most available technician using workload balancing.

**Response:**
```json
{
  "success": true,
  "message": "Ticket auto-assigned successfully",
  "ticket": { ... },
  "assigned_to": {
    "id": 45,
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### 2. Manual Assign Ticket
**Endpoint:** `POST /api/v1/assignments/tickets/{ticketId}/assign`

**Request Body:**
```json
{
  "technician_id": 45
}
```

**Description:** Manually assign ticket to a specific technician.

### 3. Reassign Ticket
**Endpoint:** `POST /api/v1/assignments/tickets/{ticketId}/reassign`

**Request Body:**
```json
{
  "new_technician_id": 47,
  "reason": "Original technician unavailable"
}
```

**Description:** Reassign ticket to another technician.

### 4. Unassign Ticket
**Endpoint:** `POST /api/v1/assignments/tickets/{ticketId}/unassign`

**Request Body:**
```json
{
  "reason": "Technician requested unassignment"
}
```

**Description:** Remove assignment from ticket.

### 5. Get Tickets by Technician
**Endpoint:** `GET /api/v1/assignments/technicians/{technicianId}/tickets`

**Description:** Get all tickets assigned to a specific technician with statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "technician_id": 45,
    "tickets": [...],
    "statistics": {
      "total": 25,
      "open": 15,
      "high_priority": 5
    }
  }
}
```

### 6. Get Assignment Statistics
**Endpoint:** `GET /api/v1/assignments/statistics`

**Description:** Get overall assignment statistics including technician workload distribution.

**Response:**
```json
{
  "success": true,
  "statistics": {
    "total_tickets": 500,
    "assigned_tickets": 450,
    "unassigned_tickets": 50,
    "assignment_rate": 90.00,
    "technician_workload": [
      {
        "technician_id": 45,
        "name": "John Doe",
        "active_tickets": 15
      },
      ...
    ]
  }
}
```

---

## Escalation Management Endpoints

### 1. Escalate Ticket
**Endpoint:** `POST /api/v1/escalations/tickets/{ticketId}/escalate`

**Request Body:**
```json
{
  "reason": "SLA breach imminent - customer is VIP"
}
```

**Description:** Escalate ticket to higher priority level and reassign to manager/supervisor.

**Response:**
```json
{
  "success": true,
  "message": "Ticket escalated successfully",
  "ticket": { ... },
  "escalated_to": {
    "id": 10,
    "name": "Manager Name",
    "role": "manager"
  },
  "reason": "SLA breach imminent - customer is VIP"
}
```

### 2. Auto-Escalate Breached Tickets
**Endpoint:** `POST /api/v1/escalations/auto-escalate-breached`

**Description:** Automatically escalate all tickets with SLA breaches (batch operation).

**Response:**
```json
{
  "success": true,
  "total_checked": 50,
  "escalated_count": 10,
  "failed_count": 0,
  "escalated_tickets": [123, 124, 125, ...],
  "failed_tickets": []
}
```

### 3. De-Escalate Ticket
**Endpoint:** `POST /api/v1/escalations/tickets/{ticketId}/de-escalate`

**Request Body:**
```json
{
  "reason": "Issue resolved faster than expected"
}
```

**Description:** Reduce ticket priority level (reverse escalation).

### 4. Get Escalation Candidates
**Endpoint:** `GET /api/v1/escalations/candidates`

**Description:** Get all tickets that are candidates for escalation (at risk or breached).

**Response:**
```json
{
  "success": true,
  "data": {
    "total_candidates": 30,
    "candidates": [
      {
        "ticket": { ... },
        "reason": "SLA at risk",
        "urgency": "medium"
      },
      {
        "ticket": { ... },
        "reason": "SLA breached",
        "urgency": "high"
      }
    ]
  }
}
```

### 5. Get Escalation Statistics
**Endpoint:** `GET /api/v1/escalations/statistics`

**Description:** Get escalation statistics and trends.

**Response:**
```json
{
  "success": true,
  "statistics": {
    "total_escalated": 45,
    "auto_escalated": 30,
    "manual_escalated": 15,
    "by_priority": {
      "Urgent": 15,
      "High": 20,
      "Normal": 10
    }
  }
}
```

---

## Summary

**Total New Endpoints:** 16

- **SLA Management:** 5 endpoints
- **Assignment Management:** 6 endpoints
- **Escalation Management:** 5 endpoints

All endpoints require authentication via `auth:sanctum` middleware.

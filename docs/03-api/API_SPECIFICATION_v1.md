# 📖 API SPECIFICATION & CONTRACT
## IMSQuty Microservices API v1.0

**Version**: 1.0.0  
**Status**: Ready for Implementation  
**Last Updated**: January 7, 2026

---

## 🎯 API OVERVIEW

### Base URL
```
Development: http://localhost:3000/api
Staging:     https://staging-api.imsquty.com/api
Production:  https://api.imsquty.com/api
```

### API Version
```
Current: /v1
Pattern: /api/v1/resource-name
```

### Authentication
```
Type: Bearer Token (JWT)
Header: Authorization: Bearer {token}
Expires: 24 hours
Refresh: POST /auth/refresh-token
```

### Response Format
```json
{
  "success": true|false,
  "message": "Human-readable message",
  "data": {},
  "errors": {},
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "last_page": 5
  }
}
```

### Error Codes
```
200: OK
201: Created
204: No Content
400: Bad Request
401: Unauthorized
403: Forbidden
404: Not Found
422: Validation Error
429: Too Many Requests
500: Internal Server Error
503: Service Unavailable
```

---

## 🔧 TICKET/DAMAGE SERVICE API

### 1. List Tickets
```
Endpoint: GET /api/v1/tickets
Method: GET
Auth: Required (Bearer token)
Rate: 60 req/min

Query Parameters:
├── page (int, default: 1)
├── limit (int, default: 20, max: 100)
├── status (string, enum: open|assigned|in_progress|resolved|closed)
├── priority (string, enum: low|medium|high|critical)
├── assigned_to (int, user ID)
├── reported_by (int, user ID)
├── asset_id (int, asset ID)
├── search (string, searches title & description)
├── sort_by (string, default: created_at, options: created_at|priority|updated_at)
├── order (string, default: desc, options: asc|desc)
└── date_from, date_to (ISO 8601, YYYY-MM-DD)

Response 200:
{
  "success": true,
  "message": "Tickets retrieved successfully",
  "data": [
    {
      "id": 1,
      "uuid": "550e8400-e29b-41d4-a716-446655440001",
      "ticket_code": "TKT-20260107-001",
      "title": "Printer jam in floor 2",
      "description": "Printer stuck with paper jam",
      "status": "open",
      "priority": 3,
      "severity_level": "high",
      "asset_id": 5,
      "asset_name": "HP Printer M305",
      "location": "Floor 2, Room 201",
      "reported_by_user_id": 2,
      "reported_by_name": "John Doe",
      "assigned_to_user_id": 3,
      "assigned_to_name": "Mike Technician",
      "assigned_at": "2026-01-07T10:30:00Z",
      "resolution_notes": null,
      "estimated_cost": null,
      "actual_cost": null,
      "sla_status": "met",
      "created_at": "2026-01-07T10:00:00Z",
      "updated_at": "2026-01-07T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "last_page": 3
  }
}

Response 401:
{
  "success": false,
  "message": "Unauthorized - Invalid or missing token"
}

Response 422:
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "priority": ["Priority must be one of: low, medium, high, critical"],
    "page": ["The page field must be an integer"]
  }
}
```

### 2. Create Ticket
```
Endpoint: POST /api/v1/tickets
Method: POST
Auth: Required
Content-Type: application/json

Request Body:
{
  "title": "System crashes on startup",
  "description": "Computer crashes immediately after Windows loads",
  "type": "incident",
  "priority": "high",
  "severity_level": "critical",
  "asset_id": 1,
  "location": "Floor 3, Room 301",
  "notes": "Critical workstation"
}

Validation Rules:
├── title: required, string, max:255
├── description: required, string, min:10, max:5000
├── type: required, enum: incident|problem|loan
├── priority: required, enum: low|medium|high|critical
├── severity_level: required, enum: critical|high|medium|low
├── asset_id: required, integer, exists:assets,id
├── location: required, string, max:255
└── notes: optional, string, max:2000

Response 201 Created:
{
  "success": true,
  "message": "Ticket created successfully",
  "data": {
    "id": 20,
    "uuid": "550e8400-e29b-41d4-a716-446655440020",
    "ticket_code": "TKT-20260107-020",
    "title": "System crashes on startup",
    "description": "Computer crashes immediately after Windows loads",
    "status": "open",
    "priority": 3,
    "severity_level": "critical",
    "asset_id": 1,
    "asset_name": "Dell Desktop PC",
    "reported_by_user_id": 5,
    "reported_by_name": "Jane Smith",
    "sla_status": null,
    "created_at": "2026-01-07T14:30:00Z",
    "updated_at": "2026-01-07T14:30:00Z"
  }
}

Response 422 Validation Error:
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "title": ["The title field is required"],
    "asset_id": ["The asset_id must exist"],
    "priority": ["Priority must be one of: low, medium, high"]
  }
}
```

### 3. Get Ticket Detail
```
Endpoint: GET /api/v1/tickets/{id}
Method: GET
Auth: Required
Params: id (integer, required)

Response 200:
{
  "success": true,
  "message": "Ticket retrieved successfully",
  "data": {
    "id": 1,
    "uuid": "550e8400-e29b-41d4-a716-446655440001",
    "ticket_code": "TKT-20260107-001",
    "title": "Printer jam",
    "description": "Paper jam in printer",
    "status": "resolved",
    "priority": 3,
    "severity_level": "high",
    "asset": {
      "id": 5,
      "uuid": "650e8400-e29b-41d4-a716-446655440005",
      "asset_tag": "QC.13.08.222.01",
      "name": "HP Printer M305",
      "serial_number": "ABC123456"
    },
    "reported_by": {
      "id": 2,
      "name": "John Doe",
      "email": "john@company.com",
      "phone": "+1234567890"
    },
    "assigned_to": {
      "id": 3,
      "name": "Mike Technician",
      "email": "mike@company.com"
    },
    "resolution_user": {
      "id": 4,
      "name": "Admin User",
      "email": "admin@company.com"
    },
    "resolution_notes": "Cleared paper jam, tested printing",
    "estimated_cost": 0,
    "actual_cost": 0,
    "sla_status": "met",
    "attachments": [
      {
        "id": 1,
        "uuid": "750e8400-e29b-41d4-a716-446655440750",
        "file_name": "printer_jam.jpg",
        "file_type": "photo",
        "file_size": 512000,
        "file_path": "https://minio.company.com/tickets/printer_jam.jpg",
        "uploaded_by_name": "John Doe",
        "uploaded_at": "2026-01-07T10:05:00Z"
      }
    ],
    "comments": [
      {
        "id": 1,
        "uuid": "850e8400-e29b-41d4-a716-446655440850",
        "comment_text": "Checking printer status",
        "is_internal": false,
        "user_id": 3,
        "user_name": "Mike Technician",
        "created_at": "2026-01-07T10:10:00Z"
      },
      {
        "id": 2,
        "uuid": "850e8400-e29b-41d4-a716-446655440851",
        "comment_text": "Paper jam confirmed, removing paper",
        "is_internal": true,
        "user_id": 3,
        "user_name": "Mike Technician",
        "created_at": "2026-01-07T10:15:00Z"
      }
    ],
    "history": [
      {
        "id": 1,
        "old_status": null,
        "new_status": "open",
        "changed_by_name": "John Doe",
        "change_reason": "Initial report",
        "changed_at": "2026-01-07T10:00:00Z"
      },
      {
        "id": 2,
        "old_status": "open",
        "new_status": "assigned",
        "changed_by_name": "System",
        "change_reason": "Auto-assigned to technician",
        "changed_at": "2026-01-07T10:01:00Z"
      },
      {
        "id": 3,
        "old_status": "assigned",
        "new_status": "resolved",
        "changed_by_name": "Mike Technician",
        "change_reason": "Issue resolved",
        "changed_at": "2026-01-07T10:20:00Z"
      }
    ],
    "created_at": "2026-01-07T10:00:00Z",
    "updated_at": "2026-01-07T10:20:00Z"
  }
}

Response 404:
{
  "success": false,
  "message": "Ticket with ID 999 not found"
}
```

### 4. Update Ticket Status
```
Endpoint: PATCH /api/v1/tickets/{id}/status
Method: PATCH
Auth: Required

Request Body:
{
  "status": "in_progress",
  "reason": "Started investigating issue"
}

Validation Rules:
├── status: required, enum: open|assigned|in_progress|resolved|closed
├── reason: optional, string, max:1000
└── Allowed Transitions:
    ├── open → assigned (by admin)
    ├── open → in_progress (by assignee)
    ├── assigned → in_progress (by assignee)
    ├── in_progress → resolved (by assignee)
    ├── resolved → closed (by admin)
    └── ❌ Cannot go backwards or from closed

Response 200:
{
  "success": true,
  "message": "Ticket status updated successfully",
  "data": {
    "id": 1,
    "ticket_code": "TKT-20260107-001",
    "status": "in_progress",
    "updated_at": "2026-01-07T10:15:00Z"
  }
}

Response 422 Validation Error:
{
  "success": false,
  "message": "Invalid status transition",
  "errors": {
    "status": ["Cannot transition from closed to in_progress"]
  }
}
```

### 5. Assign Ticket
```
Endpoint: POST /api/v1/tickets/{id}/assign
Method: POST
Auth: Required

Request Body:
{
  "assigned_to_user_id": 3,
  "assignment_type": "manual"
}

Validation Rules:
├── assigned_to_user_id: required, integer, exists:users,id
├── assigned_to_user has role: technician|admin
└── assignment_type: required, enum: auto|manual|super_admin

Response 200:
{
  "success": true,
  "message": "Ticket assigned successfully",
  "data": {
    "id": 1,
    "ticket_code": "TKT-20260107-001",
    "assigned_to_user_id": 3,
    "assigned_to_name": "Mike Technician",
    "assigned_at": "2026-01-07T10:16:00Z",
    "status": "assigned",
    "updated_at": "2026-01-07T10:16:00Z"
  }
}

Triggers:
├── Send notification to assigned technician
├── Send notification to ticket reporter
├── Update sla_status if SLA checking enabled
└── Log in ticket_history table
```

### 6. Add Comment
```
Endpoint: POST /api/v1/tickets/{id}/comments
Method: POST
Auth: Required

Request Body:
{
  "comment": "Checked hard drive - appears corrupted, needs replacement",
  "is_internal": false
}

Validation Rules:
├── comment: required, string, min:1, max:5000
└── is_internal: optional, boolean

Response 201 Created:
{
  "success": true,
  "message": "Comment added successfully",
  "data": {
    "id": 5,
    "uuid": "950e8400-e29b-41d4-a716-446655440950",
    "damage_report_id": 1,
    "comment_text": "Checked hard drive - appears corrupted",
    "is_internal": false,
    "user_id": 3,
    "user_name": "Mike Technician",
    "created_at": "2026-01-07T10:20:00Z"
  }
}

Triggers:
├── Notify ticket reporter (if public comment)
├── Notify assigned technician (if internal comment)
└── Notify admin
```

### 7. Upload Attachment
```
Endpoint: POST /api/v1/tickets/{id}/attachments
Method: POST
Content-Type: multipart/form-data
Auth: Required

Form Data:
├── file: (required, file, max: 25MB)
└── file_type: (required, enum: photo|document|video|audio)

Supported Files:
├── Photos: jpg, jpeg, png, gif, webp
├── Documents: pdf, doc, docx, xls, xlsx, txt, csv
├── Videos: mp4, avi, mov, mkv (max 100MB)
└── Audio: mp3, wav, ogg, m4a

Response 201 Created:
{
  "success": true,
  "message": "File uploaded successfully",
  "data": {
    "id": 10,
    "uuid": "a50e8400-e29b-41d4-a716-446655440a50",
    "damage_report_id": 1,
    "file_name": "hard_drive_damage.jpg",
    "file_type": "photo",
    "file_size": 2048000,
    "mime_type": "image/jpeg",
    "file_path": "https://minio.company.com/tickets/hard_drive_damage.jpg",
    "uploaded_by_user_id": 3,
    "uploaded_by_name": "Mike Technician",
    "uploaded_at": "2026-01-07T10:25:00Z"
  }
}

Response 422 Validation Error:
{
  "success": false,
  "message": "File upload failed",
  "errors": {
    "file": ["File must not exceed 25MB"],
    "file_type": ["File type must be one of: photo, document, video, audio"]
  }
}
```

### 8. Get Statistics Dashboard
```
Endpoint: GET /api/v1/tickets/statistics/dashboard
Method: GET
Auth: Required

Response 200:
{
  "success": true,
  "message": "Statistics retrieved successfully",
  "data": {
    "total_tickets": 150,
    "open_tickets": 25,
    "assigned_tickets": 15,
    "in_progress_tickets": 35,
    "resolved_tickets": 70,
    "closed_tickets": 5,
    "by_priority": {
      "critical": 5,
      "high": 20,
      "medium": 80,
      "low": 45
    },
    "by_status": {
      "open": 25,
      "assigned": 15,
      "in_progress": 35,
      "resolved": 70,
      "closed": 5
    },
    "avg_resolution_time_hours": 12.5,
    "sla_performance": {
      "met": 140,
      "breached": 8,
      "warning": 2
    },
    "top_technicians": [
      {
        "user_id": 3,
        "name": "Mike Technician",
        "tickets_resolved": 45,
        "avg_resolution_time_hours": 8.2
      }
    ]
  }
}
```

---

## 📦 ASSET SERVICE API (25 Endpoints)

### Endpoints Summary
```
GET     /api/v1/assets
POST    /api/v1/assets
GET     /api/v1/assets/{id}
PUT     /api/v1/assets/{id}
DELETE  /api/v1/assets/{id}
POST    /api/v1/assets/{id}/assign
POST    /api/v1/assets/{id}/transfer
GET     /api/v1/assets/{id}/maintenance
POST    /api/v1/assets/{id}/maintenance
GET     /api/v1/assets/qr/{code}
GET     /api/v1/assets/warranty/expiring
POST    /api/v1/assets/barcode/generate
GET     /api/v1/assets/by-location/{locationId}
GET     /api/v1/assets/by-user/{userId}
GET     /api/v1/assets/statistics
GET     /api/v1/assets/depreciation
POST    /api/v1/assets/import
GET     /api/v1/assets/export
GET     /api/v1/asset-models
POST    /api/v1/asset-models
GET     /api/v1/asset-models/{id}
PUT     /api/v1/asset-models/{id}
GET     /api/v1/asset-categories
GET     /api/v1/manufacturers
GET     /api/v1/suppliers
```

*Detailed specification follows same pattern as Ticket Service above*

---

## 🏢 MEETING ROOM SERVICE API (20 Endpoints)

### Endpoints Summary
```
GET     /api/v1/bookings
POST    /api/v1/bookings
GET     /api/v1/bookings/{id}
PUT     /api/v1/bookings/{id}
DELETE  /api/v1/bookings/{id}
POST    /api/v1/bookings/{id}/approve
POST    /api/v1/bookings/{id}/reject
POST    /api/v1/bookings/{id}/checkin
POST    /api/v1/bookings/{id}/checkout
POST    /api/v1/bookings/{id}/feedback
GET     /api/v1/bookings/availability
GET     /api/v1/bookings/conflicts
GET     /api/v1/rooms
GET     /api/v1/rooms/{id}
GET     /api/v1/rooms/{id}/availability/{date}
GET     /api/v1/rooms/{id}/bookings/{date}
GET     /api/v1/bookings/statistics
POST    /api/v1/bookings/recurring
GET     /api/v1/bookings/my-bookings
GET     /api/v1/bookings/pending-approval
```

*Detailed specification follows same pattern as above*

---

## 🔐 AUTHENTICATION FLOW

### Login
```
Endpoint: POST /auth/login
Request:
{
  "email": "user@company.com",
  "password": "secure_password"
}

Response 200:
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "token_type": "Bearer",
    "expires_in": 86400,
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@company.com",
      "roles": ["admin"],
      "permissions": ["create_ticket", "view_assets", ...]
    }
  }
}
```

### Token Refresh
```
Endpoint: POST /auth/refresh-token
Headers: Authorization: Bearer {token}

Response 200:
{
  "success": true,
  "data": {
    "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "expires_in": 86400
  }
}
```

---

## 📝 COMMON PATTERNS

### Pagination
```
All list endpoints support:
├── page (default: 1)
├── limit (default: 20, max: 100)
└── Returns pagination info in response
```

### Filtering
```
Most list endpoints support:
├── status filter
├── date range (from_date, to_date)
├── search (full text on main fields)
├── sort_by + order
└── Custom filters per endpoint
```

### Validation Errors
```
All POST/PUT/PATCH return 422 with:
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "field_name": ["Error message 1", "Error message 2"]
  }
}
```

### Rate Limiting
```
All endpoints limited to 60 requests/minute
Headers returned:
├── X-RateLimit-Limit: 60
├── X-RateLimit-Remaining: 59
└── X-RateLimit-Reset: 1234567890
```

---

## ✅ READY FOR IMPLEMENTATION

This specification is complete and ready for Phase 2 (Asset Service) implementation.

**Next**: Developers use this as contract during implementation  
**Testing**: Use this for creating comprehensive test cases  
**Frontend**: Use this for API client implementation  


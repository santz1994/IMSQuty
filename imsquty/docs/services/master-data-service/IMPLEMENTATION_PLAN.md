# Master Data Service - Implementation Plan

**Service:** Master Data Service (master-data-service)  
**Port:** 8008  
**Status:** 🚧 80% COMPLETE - API Layer Done, Tests Pending  
**Priority:** High (Foundation for Asset Service)  
**Complexity:** Low  
**Estimated Duration:** 2 weeks  
**Progress:** Models ✅ | Repositories ✅ | Services ✅ | Controllers ✅ | Requests ✅ | Resources ✅ | Routes ✅ | Tests ⏳

---

## 🎯 Purpose

Master Data Service manages all reference/master data used across the IMSQuty system:
- Locations (offices, buildings, floors, rooms)
- Divisions/Departments
- Manufacturers (hardware/equipment manufacturers)
- Suppliers (vendors)
- Warranty Types
- PC Specifications templates
- Generic master data CRUD

---

## 📊 Database Tables (Already exist in shared DB)

1. **locations** - Physical locations
2. **divisions** - Organizational units/departments
3. **manufacturers** - Hardware manufacturers
4. **suppliers** - External vendors
5. **warranty_types** - Warranty categories
6. **pcspecs** - PC specification templates

---

## 🏗️ Architecture

### Pattern
```
Controller → Service → Repository → Model → Database
```

### Components to Build

#### 1. Models (6 models)
- [x] Location
- [x] Division
- [x] Manufacturer
- [x] Supplier
- [x] WarrantyType
- [x] Pcspec

#### 2. Repositories (6 repositories)
- [x] LocationRepository
- [x] DivisionRepository
- [x] ManufacturerRepository
- [x] SupplierRepository
- [x] WarrantyTypeRepository
- [x] PcspecRepository

#### 3. Services (6 services)
- [x] LocationService
- [x] DivisionService
- [x] ManufacturerService
- [x] SupplierService
- [x] WarrantyTypeService
- [x] PcspecService

#### 4. Controllers (6 controllers)
- [x] LocationController
- [x] DivisionController
- [x] ManufacturerController
- [x] SupplierController
- [x] WarrantyTypeController
- [x] PcspecController

#### 5. Form Requests (12 requests - Create/Update per entity)
- [x] CreateLocationRequest, UpdateLocationRequest
- [x] CreateDivisionRequest, UpdateDivisionRequest
- [x] CreateManufacturerRequest, UpdateManufacturerRequest
- [x] CreateSupplierRequest, UpdateSupplierRequest
- [x] CreateWarrantyTypeRequest, UpdateWarrantyTypeRequest
- [x] CreatePcspecRequest, UpdatePcspecRequest

#### 6. API Resources (6 resources)
- [x] LocationResource
- [x] DivisionResource
- [x] ManufacturerResource
- [x] SupplierResource
- [x] WarrantyTypeResource
- [x] PcspecResource

#### 7. Tests
- [ ] Feature tests for each entity (6 tests)
- [ ] Unit tests for services (6 tests)
- **Target:** 40+ tests, 80%+ coverage

---

## 📡 API Endpoints (36 total)

### Locations
```
GET    /api/v1/locations                - List locations
POST   /api/v1/locations                - Create location
GET    /api/v1/locations/{id}           - Get location detail
PUT    /api/v1/locations/{id}           - Update location
DELETE /api/v1/locations/{id}           - Delete location (soft delete)
POST   /api/v1/locations/{id}/restore   - Restore deleted location
```

### Divisions
```
GET    /api/v1/divisions                - List divisions
POST   /api/v1/divisions                - Create division
GET    /api/v1/divisions/{id}           - Get division detail
PUT    /api/v1/divisions/{id}           - Update division
DELETE /api/v1/divisions/{id}           - Delete division (soft delete)
POST   /api/v1/divisions/{id}/restore   - Restore deleted division
```

### Manufacturers
```
GET    /api/v1/manufacturers            - List manufacturers
POST   /api/v1/manufacturers            - Create manufacturer
GET    /api/v1/manufacturers/{id}       - Get manufacturer detail
PUT    /api/v1/manufacturers/{id}       - Update manufacturer
DELETE /api/v1/manufacturers/{id}       - Delete manufacturer (soft delete)
POST   /api/v1/manufacturers/{id}/restore - Restore deleted manufacturer
```

### Suppliers
```
GET    /api/v1/suppliers                - List suppliers
POST   /api/v1/suppliers                - Create supplier
GET    /api/v1/suppliers/{id}           - Get supplier detail
PUT    /api/v1/suppliers/{id}           - Update supplier
DELETE /api/v1/suppliers/{id}           - Delete supplier (soft delete)
POST   /api/v1/suppliers/{id}/restore   - Restore deleted supplier
```

### Warranty Types
```
GET    /api/v1/warranty-types           - List warranty types
POST   /api/v1/warranty-types           - Create warranty type
GET    /api/v1/warranty-types/{id}      - Get warranty type detail
PUT    /api/v1/warranty-types/{id}      - Update warranty type
DELETE /api/v1/warranty-types/{id}      - Delete warranty type (soft delete)
POST   /api/v1/warranty-types/{id}/restore - Restore deleted warranty type
```

### PC Specifications
```
GET    /api/v1/pcspecs                  - List pcspecs
POST   /api/v1/pcspecs                  - Create pcspec
GET    /api/v1/pcspecs/{id}             - Get pcspec detail
PUT    /api/v1/pcspecs/{id}             - Update pcspec
DELETE /api/v1/pcspecs/{id}             - Delete pcspec (soft delete)
POST   /api/v1/pcspecs/{id}/restore     - Restore deleted pcspec
```

### Health Check
```
GET    /health                          - Service health status
```

---

## 🔒 Security Features

- ✅ JWT authentication (Laravel Sanctum)
- ✅ RBAC via middleware (check permissions)
- ✅ Rate limiting (60 requests/minute)
- ✅ Audit logging (Auditable trait)
- ✅ Soft deletes (GDPR compliance)
- ✅ Input validation (Form Requests)
- ✅ XSS protection
- ✅ SQL injection protection (Eloquent ORM)

---

## 📝 Implementation Steps

### Step 1: Copy Auditable Trait ✅
- Copy from shared/traits/Auditable.php
- Place in app/Traits/Auditable.php

### Step 2: Create Models (30 minutes)
- All models use Auditable trait
- All models use SoftDeletes
- Define fillable fields
- Add relationships (if needed)
- Add scopes for common queries

### Step 3: Create Repositories (2 hours)
- Implement CRUD methods
- Add search/filter methods
- Add pagination
- Handle soft deletes

### Step 4: Create Services (2 hours)
- Implement business logic
- Call repositories
- Handle exceptions
- Return structured data

### Step 5: Create Form Requests (1 hour)
- Validation rules
- Custom error messages
- Authorization logic

### Step 6: Create API Resources (30 minutes)
- Transform model data
- Add computed fields
- Hide sensitive fields

### Step 7: Create Controllers (1 hour)
- Thin controllers
- Delegate to services
- Return API Resources
- Handle HTTP status codes

### Step 8: Define Routes (30 minutes)
- API routes with middleware
- Route grouping
- Route naming

### Step 9: Write Tests (4 hours)
- Feature tests (API endpoints)
- Unit tests (services, repositories)
- Test authentication
- Test validation
- Test audit logging

### Step 10: Create Dockerfile (30 minutes)
- Based on auth-service Dockerfile
- Configure for port 8008

### Step 11: Documentation (1 hour)
- API documentation
- README.md
- Postman collection

---

## 🧪 Testing Checklist

### Feature Tests
- [ ] GET /api/v1/locations returns paginated list
- [ ] POST /api/v1/locations creates location
- [ ] GET /api/v1/locations/{id} returns location
- [ ] PUT /api/v1/locations/{id} updates location
- [ ] DELETE /api/v1/locations/{id} soft deletes
- [ ] POST /api/v1/locations/{id}/restore restores
- [ ] Repeat for all 6 entities (36 tests minimum)

### Unit Tests
- [ ] LocationService creates location correctly
- [ ] LocationRepository finds by ID
- [ ] Validation rules work correctly
- [ ] Audit logging triggered on CUD
- [ ] Soft delete works correctly
- [ ] Repeat for all 6 entities

### Integration Tests
- [ ] Authentication required on protected routes
- [ ] RBAC permissions enforced
- [ ] Rate limiting works
- [ ] Cross-service data consistency

---

## 📦 Dependencies

- Laravel 12.x
- Laravel Sanctum (authentication)
- Spatie Permission (RBAC)
- MySQL 8.0 (shared database)
- Redis (cache)

---

## 🚀 Deployment

### Docker Configuration
```dockerfile
FROM php:8.1-fpm
# Install extensions
# Copy application
# Expose port 8008
# Start Laravel server
```

### docker-compose.yml Entry
```yaml
master-data-service:
  build: ./services/master-data-service
  container_name: imsquty-master-data-service
  ports:
    - "8008:8008"
  environment:
    - APP_PORT=8008
    - DB_HOST=mysql
    - REDIS_HOST=redis
  depends_on:
    - mysql
    - redis
    - auth-service
```

---

## 📈 Success Criteria

- [x] Service initialized
- [ ] All 6 models created with Auditable trait
- [ ] All 6 repositories implemented
- [ ] All 6 services implemented
- [ ] All 6 controllers implemented
- [ ] 36+ API endpoints working
- [ ] 40+ tests passing
- [ ] 80%+ test coverage
- [ ] Dockerfile created
- [ ] Documentation complete
- [ ] Integration with API Gateway tested

---

## 🔗 Dependencies on Other Services

### Depends On:
- Auth Service (for JWT authentication)
- MySQL (shared database)
- Redis (caching)

### Depended On By:
- Asset Service (needs locations, manufacturers, suppliers)
- Inventory Service (needs suppliers, locations)
- Financial Service (needs suppliers, divisions)
- Ticket Service (needs locations, divisions)

---

## 📅 Timeline

**Total Estimate:** 2 weeks (80 hours)

- Week 1 (40 hours):
  - Day 1-2: Models, Repositories (16h)
  - Day 3-4: Services, Controllers (16h)
  - Day 5: Form Requests, Resources, Routes (8h)

- Week 2 (40 hours):
  - Day 1-3: Write comprehensive tests (24h)
  - Day 4: Docker configuration, documentation (8h)
  - Day 5: Integration testing, bug fixes (8h)

---

**Status:** 🚧 Step 1 Complete - Auditable Trait Setup  
**Next:** Create Models with relationships and scopes

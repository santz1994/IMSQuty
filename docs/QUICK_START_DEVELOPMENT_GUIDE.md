# ⚡ QUICK START: DEVELOPMENT CHECKLIST & COMMAND REFERENCE

**For**: Senior Developer(s) implementing Phase 1-8  
**Read Time**: 10 minutes  
**Complete Time**: 40 hours (Phase 1)

---

## 📋 PHASE 1: WEEK 1 QUICK CHECKLIST

### Day 1: Monday Setup
```bash
# 1. Pull latest code
cd /imsquty
git pull origin main

# 2. For each service needing migrations:
cd /imsquty/services/ticket-service

# 3. Create migration files (use exact names from PHASE_1_EXECUTION_GUIDE.md)
php artisan make:migration create_damage_reports_table --create=damage_reports
php artisan make:migration create_damage_attachments_table --create=damage_attachments
php artisan make:migration create_damage_comments_table --create=damage_comments
php artisan make:migration create_damage_status_history_table --create=damage_status_history
php artisan make:migration create_sla_policies_table --create=sla_policies

# 4. Repeat for asset-service, meeting-room-service

# 5. Update each migration with schema from PHASE_1_EXECUTION_GUIDE.md

# 6. Run migrations
php artisan migrate:fresh
php artisan migrate:status

# 7. Verify
php artisan tinker
# > \DB::table('damage_reports')->count()
# Should return 0 (table created but empty)
```

---

### Day 2: Tuesday - Base Classes
```bash
# 1. Create exception classes
php artisan make:exception ValidationException
php artisan make:exception NotFoundException
php artisan make:exception UnauthorizedException
php artisan make:exception ConflictException

# 2. Create base controller
mkdir -p app/Http/Controllers
# Copy code from PHASE_1_EXECUTION_GUIDE.md → BaseController.php

# 3. Create base service
mkdir -p app/Services
# Copy code from PHASE_1_EXECUTION_GUIDE.md → BaseService.php

# 4. Create base repository
mkdir -p app/Repositories
# Copy code from PHASE_1_EXECUTION_GUIDE.md → BaseRepository.php

# 5. Create DTOs
mkdir -p app/DTOs
# Copy code from PHASE_1_EXECUTION_GUIDE.md for each DTO

# 6. Create traits
mkdir -p app/Traits
# Copy HasUUID.php and HasAudit.php from PHASE_1_EXECUTION_GUIDE.md

# 7. Verify no errors
php artisan tinker
# > new \App\Exceptions\ValidationException(['name' => 'required'], 'Test', 422)
# Should work without errors
```

---

### Day 3: Wednesday - Testing & Seeders
```bash
# 1. Configure PHPUnit
# Copy phpunit.xml from PHASE_1_EXECUTION_GUIDE.md to root

# 2. Create seeders
php artisan make:seeder SLAPolicySeeder
php artisan make:seeder DamageReportSeeder
php artisan make:seeder AssetMaintenanceSeeder
# ... etc

# 3. Implement seeders using code from PHASE_1_EXECUTION_GUIDE.md

# 4. Run seeders
php artisan db:seed --class=SLAPolicySeeder

# 5. Create test factories
php artisan make:factory DamageReportFactory
php artisan make:factory AssetFactory
# ... etc

# 6. Run tests
./vendor/bin/phpunit tests/Unit --testdox

# 7. Verify coverage
./vendor/bin/phpunit --coverage-html build/coverage
```

---

### Day 4: Thursday - Documentation & Git
```bash
# 1. Create API documentation (OpenAPI/Swagger)
# Use format from examples below

# 2. Create database schema documentation
# Use DBDesigner or similar tool

# 3. Commit all changes
git add .
git commit -m "feat: Phase 1 - Database schema & base infrastructure

- Create 20+ migration files for all core tables
- Implement exception handling framework
- Create base controller, service, repository classes
- Create DTO classes for all features
- Setup PHPUnit testing framework
- Create comprehensive seeders
- Add indexes for performance
- Full documentation

Closes: Phase 1 milestone"

# 4. Push to repository
git push origin main

# 5. Create GitHub release
# Include milestone summary
```

---

### Day 5: Friday - Verification & Deployment Prep
```bash
# 1. Fresh start test
rm database/testing.sqlite
php artisan migrate:fresh --seed

# 2. Verify all tables
php artisan tinker
> $tables = collect(\DB::select('SHOW TABLES'))->map(fn($t) => get_object_vars($t))->flatten()->all();
> dd($tables);

# 3. Verify all seeders
> \DB::table('sla_policies')->count() // Should be 4
> \DB::table('users')->count() // Should be > 0

# 4. Run all tests
./vendor/bin/phpunit tests/ --testdox

# 5. Check code quality
php artisan code:analyze

# 6. Documentation review
# Verify README.md, API docs, schema docs

# 7. Final commit
git status
# Should be clean

# 8. Prepare Phase 2
# Create PHASE_2_ASSET_SERVICE.md document
# Schedule Week 2 kickoff meeting
```

---

## 🔧 USEFUL COMMANDS REFERENCE

### Database Operations
```bash
# Fresh migration (dangerous - drops all!)
php artisan migrate:fresh

# Rollback migrations
php artisan migrate:rollback

# See migration status
php artisan migrate:status

# Create new migration
php artisan make:migration create_table_name --create=table_name

# Run seeders
php artisan db:seed
php artisan db:seed --class=SLAPolicySeeder

# Drop specific table
php artisan tinker
# > \DB::statement('DROP TABLE table_name')
```

### Model & Factory Creation
```bash
# Create model with migration, factory, seeder
php artisan make:model DamageReport -mfs

# Create factory only
php artisan make:factory DamageReportFactory

# Create seeder only
php artisan make:seeder DamageReportSeeder
```

### Testing Commands
```bash
# Run all tests
./vendor/bin/phpunit tests/

# Run specific test file
./vendor/bin/phpunit tests/Unit/RepositoryTest.php

# Run with coverage report
./vendor/bin/phpunit --coverage-html build/coverage

# Run with verbose output
./vendor/bin/phpunit tests/ -v

# Run specific test method
./vendor/bin/phpunit tests/Unit/RepositoryTest.php --filter testCreate
```

### Code Quality
```bash
# PHP CodeSniffer
./vendor/bin/phpcs app/ --standard=PSR12

# PHPStan (static analysis)
./vendor/bin/phpstan analyse app/

# PEST (modern testing)
./vendor/bin/pest --testdox
```

### Docker Commands
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f api-gateway

# Execute command in container
docker-compose exec php-fpm php artisan migrate

# Restart service
docker-compose restart api-gateway

# Check service health
docker-compose ps
```

---

## 📁 DIRECTORY STRUCTURE REFERENCE

### After Phase 1 Complete
```
/imsquty/
├── services/
│   ├── ticket-service/
│   │   ├── app/
│   │   │   ├── Exceptions/
│   │   │   │   ├── ValidationException.php
│   │   │   │   ├── NotFoundException.php
│   │   │   │   └── ConflictException.php
│   │   │   ├── Http/
│   │   │   │   └── Controllers/
│   │   │   │       └── BaseController.php
│   │   │   ├── Models/
│   │   │   │   ├── DamageReport.php
│   │   │   │   ├── DamageAttachment.php
│   │   │   │   ├── DamageComment.php
│   │   │   │   └── DamageStatusHistory.php
│   │   │   ├── Repositories/
│   │   │   │   ├── BaseRepository.php
│   │   │   │   └── DamageReportRepository.php
│   │   │   ├── Services/
│   │   │   │   ├── BaseService.php
│   │   │   │   └── DamageReportService.php
│   │   │   ├── DTOs/
│   │   │   │   ├── CreateTicketDTO.php
│   │   │   │   ├── UpdateTicketDTO.php
│   │   │   │   └── StatusChangeDTO.php
│   │   │   └── Traits/
│   │   │       ├── HasUUID.php
│   │   │       └── HasAudit.php
│   │   ├── database/
│   │   │   ├── migrations/
│   │   │   │   ├── 2026_01_07_000001_create_damage_reports_table.php
│   │   │   │   ├── 2026_01_07_000002_create_damage_attachments_table.php
│   │   │   │   ├── 2026_01_07_000003_create_damage_comments_table.php
│   │   │   │   └── ... (5 migrations total)
│   │   │   └── seeders/
│   │   │       ├── SLAPolicySeeder.php
│   │   │       └── DamageReportSeeder.php
│   │   ├── tests/
│   │   │   ├── Unit/
│   │   │   │   ├── Repositories/
│   │   │   │   └── Services/
│   │   │   ├── Integration/
│   │   │   │   └── API/
│   │   │   └── Feature/
│   │   ├── phpunit.xml
│   │   └── README.md
│   ├── asset-service/ (same structure)
│   ├── meeting-room-service/ (same structure)
│   └── ... (other services)
└── docs/
    ├── DEEP_ANALYSIS_AND_STRATEGY.md
    ├── PHASE_1_EXECUTION_GUIDE.md
    ├── EXECUTIVE_SUMMARY.md
    └── README.md
```

---

## 🔗 API ENDPOINT DOCUMENTATION EXAMPLE

### Asset Service - List Assets
```
Endpoint: GET /api/v1/assets
Method: GET
Authentication: Bearer {token}
Rate Limit: 60 requests/minute

Query Parameters:
  - page (int, default: 1)
  - limit (int, default: 20)
  - status (string, enum: active, inactive, retired, maintenance)
  - location (string)
  - search (string)

Response 200 OK:
{
  "success": true,
  "message": "Assets retrieved successfully",
  "data": [
    {
      "id": 1,
      "uuid": "123e4567-e89b-12d3-a456-426614174000",
      "asset_tag": "QC.13.08.222.01",
      "name": "Laptop Dell Inspiron",
      "serial_number": "ABC123456",
      "location": "Floor 2, Room 201",
      "status": "active",
      "responsible_user_id": 5,
      "created_at": "2026-01-07T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "last_page": 8
  }
}

Response 401 Unauthorized:
{
  "success": false,
  "message": "Unauthorized"
}

Response 422 Validation Error:
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "page": ["The page field must be an integer"],
    "status": ["The status must be one of: active, inactive, retired, maintenance"]
  }
}
```

---

## 🧪 EXAMPLE TEST TEMPLATE

```php
<?php

namespace Tests\Unit\Repositories;

use Tests\TestCase;
use App\Models\Asset;
use App\Repositories\AssetRepository;

class AssetRepositoryTest extends TestCase
{
    private AssetRepository $repository;
    
    protected function setUp(): void
    {
        parent::setUp();
        $this->repository = new AssetRepository();
    }
    
    /** @test */
    public function it_can_get_all_assets()
    {
        // Arrange
        Asset::factory()->count(5)->create();
        
        // Act
        $result = $this->repository->getAll([], 1, 20);
        
        // Assert
        $this->assertEquals(5, $result->total());
        $this->assertCount(5, $result->items());
    }
    
    /** @test */
    public function it_can_create_asset()
    {
        // Arrange
        $data = [
            'asset_tag' => 'TEST-001',
            'name' => 'Test Asset',
            'status' => 'active',
        ];
        
        // Act
        $asset = $this->repository->create($data);
        
        // Assert
        $this->assertNotNull($asset->id);
        $this->assertEquals('TEST-001', $asset->asset_tag);
    }
    
    /** @test */
    public function it_throws_not_found_for_invalid_id()
    {
        // Arrange & Act & Assert
        $this->expectException(ModelNotFoundException::class);
        $this->repository->getById(99999);
    }
}
```

---

## 📚 GIT WORKFLOW REFERENCE

### Feature Branch Workflow
```bash
# 1. Start new feature
git checkout -b feature/phase1-database-schema

# 2. Make changes
# ... edit files ...

# 3. Commit frequently
git add .
git commit -m "feat: create damage_reports table migration"
git commit -m "feat: implement BaseController base class"
git commit -m "test: add BaseController unit tests"

# 4. Push to remote
git push origin feature/phase1-database-schema

# 5. Create Pull Request
# On GitHub: Create PR with description

# 6. Code review & merge
git checkout main
git pull origin main
git merge feature/phase1-database-schema

# 7. Clean up
git branch -d feature/phase1-database-schema
```

### Commit Message Format
```
Type: Subject (max 50 chars)

Description (wrap at 72 chars):
- Explain what changed
- Explain why it changed
- Explain any side effects

Fixes: #123 (if applicable)
```

### Type Prefixes
```
feat:     A new feature
fix:      A bug fix
test:     Adding tests
refactor: Code refactoring
docs:     Documentation changes
chore:    Build/tooling changes
perf:     Performance improvements
ci:       CI/CD changes
```

---

## ✅ DEFINITION OF DONE (Phase 1)

### Code
- [ ] All migration files created and tested
- [ ] BaseController implemented
- [ ] BaseService implemented
- [ ] BaseRepository implemented
- [ ] All DTO classes created
- [ ] Exception handling complete
- [ ] Traits created and tested

### Testing
- [ ] Unit tests written (80%+ coverage)
- [ ] Integration tests for migrations
- [ ] No failing tests
- [ ] phpunit.xml configured

### Database
- [ ] All tables created
- [ ] All FK constraints working
- [ ] All indexes created
- [ ] Soft deletes working where needed
- [ ] Seeders functional
- [ ] Test data realistic

### Documentation
- [ ] README.md updated
- [ ] API contracts documented
- [ ] Database schema documented
- [ ] Code comments on complex logic
- [ ] Architecture diagram created

### Git & Deployment
- [ ] All code committed
- [ ] Code review completed
- [ ] Merged to main branch
- [ ] GitHub release created
- [ ] CI/CD pipeline passing

---

## 🚨 COMMON ISSUES & SOLUTIONS

### Issue 1: Migration Foreign Key Constraint
```
Error: SQLSTATE[HY000]: General error: 1215 Cannot add foreign key constraint

Solution:
1. Check parent table exists
2. Parent column same type as FK column
3. Both tables using InnoDB
4. Try: DB::statement('SET FOREIGN_KEY_CHECKS=0')
```

### Issue 2: Seeder Not Running
```
Error: Seeder class not found

Solution:
1. Run: php artisan composer dump-autoload
2. Check class name matches filename
3. Run: php artisan db:seed --class=SeederName
```

### Issue 3: Test Database Issues
```
Error: SQLSTATE[HY000]: General error: file is not a database

Solution:
1. Delete database/testing.sqlite
2. Run: php artisan migrate:fresh --env=testing
3. Check phpunit.xml DB_DATABASE env var
```

### Issue 4: UUID Not Generating
```
Error: Column 'uuid' cannot be null

Solution:
1. Verify model uses HasUUID trait
2. Check boot() method is public static
3. Run: php artisan cache:clear
4. Check migration uses uuid() column
```

---

## 📞 SUPPORT & ESCALATION

### Issues by Severity

**P1 (Critical - Blocks Development)**
- Database migration failures
- Cannot run tests
- Cannot start services
- Git conflicts

Action: Investigate immediately, document solution

**P2 (High - Slows Development)**
- Test failures
- Performance issues
- Code quality warnings
- Documentation gaps

Action: Schedule fix, create ticket

**P3 (Medium - Nice to Have)**
- Minor code improvements
- Documentation polish
- Refactoring suggestions

Action: Add to backlog, review in next sprint

---

## 📞 CONTACTS

```
Questions about:
├── Database design → Architecture Review Doc
├── API design → PHASE_1_EXECUTION_GUIDE.md
├── Tests → Check existing test files
├── Git workflow → Git section above
├── Docker → docker-compose.yml comments
└── Deployment → DEPLOYMENT_GUIDE.md (coming)
```

---

## 🎯 WEEK 2 PREVIEW

After completing Phase 1, you'll be ready for Phase 2:

```
Week 2-3: ASSET SERVICE IMPLEMENTATION

Day 1:  Create Asset & AssetModel models with relationships
Day 2:  Create AssetRepository with complex queries
Day 3:  Create AssetService with business logic
Day 4:  Create AssetController with validation
Day 5:  Create API routes and test all 25 endpoints
Day 6-7: Comprehensive testing & documentation
Day 8:  Code review & merge

Deliverable: Fully functional Asset Service
Next: Phase 3 - Ticket Service (same pattern)
```

---

**Ready to Start?** ✅  
**Phase 1 Documents**: DEEP_ANALYSIS_AND_STRATEGY.md + PHASE_1_EXECUTION_GUIDE.md + this file  
**Estimated Time**: 40 hours  
**Team Size**: 1 senior developer  
**Start Date**: This week!  

**Let's Go!** 🚀


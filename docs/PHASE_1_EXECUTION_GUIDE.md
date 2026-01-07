# 🗄️ PHASE 1 EXECUTION GUIDE: DATABASE & FOUNDATION
## Week 1 - Detailed Implementation Steps

**Status**: Ready to Execute  
**Timeline**: 40 hours (Mon-Fri intensive)  
**Outcome**: Production-ready database + base infrastructure

---

## DAY 1-2: DATABASE MIGRATIONS & SCHEMA EXPANSION

### STEP 1: Create Missing Migration Files

**Location**: `/imsquty/services/{service-name}/database/migrations/`

Create these migration files for each microservice that needs them:

#### For Ticket Service (damage_reports)
```
File: 2026_01_07_000001_create_damage_reports_table.php
File: 2026_01_07_000002_create_damage_attachments_table.php
File: 2026_01_07_000003_create_damage_comments_table.php
File: 2026_01_07_000004_create_damage_status_history_table.php
File: 2026_01_07_000005_create_sla_policies_table.php
```

#### For Asset Service
```
File: 2026_01_07_000006_create_asset_maintenance_table.php
File: 2026_01_07_000007_create_asset_warranty_table.php
File: 2026_01_07_000008_create_asset_movements_table.php
File: 2026_01_07_000009_create_asset_depreciation_logs_table.php
```

#### For Meeting Room Service
```
File: 2026_01_07_000010_create_room_bookings_table.php
File: 2026_01_07_000011_create_room_availability_table.php
File: 2026_01_07_000012_create_room_equipment_table.php
File: 2026_01_07_000013_create_room_equipment_mapping_table.php
File: 2026_01_07_000014_create_room_blackout_dates_table.php
File: 2026_01_07_000015_create_room_recurring_bookings_table.php
File: 2026_01_07_000016_create_room_booking_feedback_table.php
```

#### For Notifications & Audit
```
File: 2026_01_07_000017_create_notifications_table.php
File: 2026_01_07_000018_create_audit_logs_table.php
File: 2026_01_07_000019_create_activity_logs_table.php
```

---

### STEP 2: Database Schema Details & Migration Code

#### Migration 1: damage_reports
```php
// SCHEMA DEFINITION
Schema::create('damage_reports', function (Blueprint $table) {
    $table->id();
    $table->uuid()->unique();
    $table->foreignId('asset_id')->constrained('assets')->onDelete('cascade');
    $table->foreignId('reported_by_user_id')->constrained('users')->onDelete('restrict');
    $table->string('report_title', 255);
    $table->text('description');
    $table->enum('damage_type', ['broken', 'malfunction', 'wear', 'damage', 'missing_part']);
    $table->enum('severity_level', ['critical', 'high', 'medium', 'low']);
    $table->integer('priority')->default(3); // 1-5, calculated
    $table->string('location', 255)->nullable();
    $table->enum('status', ['open', 'assigned', 'in_progress', 'pending_parts', 'resolved', 'closed'])->default('open');
    $table->foreignId('assigned_to_user_id')->nullable()->constrained('users')->onDelete('set null');
    $table->timestamp('assigned_at')->nullable();
    $table->foreignId('resolution_user_id')->nullable()->constrained('users')->onDelete('set null');
    $table->text('resolution_notes')->nullable();
    $table->timestamp('resolved_at')->nullable();
    $table->timestamp('expected_resolution_time')->nullable();
    $table->timestamp('actual_resolution_time')->nullable();
    $table->enum('sla_status', ['met', 'breached', 'warning'])->nullable();
    $table->decimal('estimated_cost', 10, 2)->nullable();
    $table->decimal('actual_cost', 10, 2)->nullable();
    $table->timestamps();
    $table->softDeletes();
    
    // INDEXES
    $table->index('asset_id');
    $table->index('status');
    $table->index('priority');
    $table->index('assigned_to_user_id');
    $table->index('reported_by_user_id');
    $table->index('created_at');
    $table->index(['status', 'assigned_to_user_id']);
    $table->index(['severity_level', 'status']);
});

// ROLLBACK
Schema::dropIfExists('damage_reports');
```

#### Migration 2: damage_attachments
```php
Schema::create('damage_attachments', function (Blueprint $table) {
    $table->id();
    $table->uuid()->unique();
    $table->foreignId('damage_report_id')->constrained('damage_reports')->onDelete('cascade');
    $table->string('file_path', 255);
    $table->string('file_name', 255);
    $table->enum('file_type', ['photo', 'document', 'video', 'audio']);
    $table->bigInteger('file_size');
    $table->string('mime_type', 100);
    $table->foreignId('uploaded_by_user_id')->nullable()->constrained('users')->onDelete('set null');
    $table->timestamp('uploaded_at');
    $table->timestamps();
    
    $table->index('damage_report_id');
    $table->index('uploaded_by_user_id');
});
```

#### Migration 3: damage_comments
```php
Schema::create('damage_comments', function (Blueprint $table) {
    $table->id();
    $table->uuid()->unique();
    $table->foreignId('damage_report_id')->constrained('damage_reports')->onDelete('cascade');
    $table->foreignId('user_id')->constrained('users')->onDelete('restrict');
    $table->text('comment_text');
    $table->boolean('is_internal')->default(false);
    $table->timestamps();
    $table->softDeletes();
    
    $table->index('damage_report_id');
    $table->index('created_at');
    $table->index(['damage_report_id', 'is_internal']);
});
```

#### Migration 4: damage_status_history
```php
Schema::create('damage_status_history', function (Blueprint $table) {
    $table->id();
    $table->foreignId('damage_report_id')->constrained('damage_reports')->onDelete('cascade');
    $table->string('old_status', 50)->nullable();
    $table->string('new_status', 50);
    $table->foreignId('changed_by_user_id')->constrained('users')->onDelete('restrict');
    $table->text('change_reason')->nullable();
    $table->timestamp('changed_at')->useCurrent();
    $table->timestamps();
    
    $table->index('damage_report_id');
    $table->index('changed_at');
    $table->index(['damage_report_id', 'changed_at']);
});
```

#### Migration 5: sla_policies
```php
Schema::create('sla_policies', function (Blueprint $table) {
    $table->id();
    $table->string('name', 100)->unique();
    $table->enum('priority', ['critical', 'high', 'medium', 'low']);
    $table->integer('response_time_hours'); // Time to first response
    $table->integer('resolution_time_hours'); // Time to resolution
    $table->boolean('is_active')->default(true);
    $table->timestamps();
    
    $table->index('priority');
    $table->index('is_active');
});

// SEED DATA
INSERT INTO sla_policies (name, priority, response_time_hours, resolution_time_hours)
VALUES
('Critical', 'critical', 1, 4),
('High', 'high', 2, 8),
('Medium', 'medium', 4, 24),
('Low', 'low', 8, 72);
```

---

#### Migration 6: asset_maintenance
```php
Schema::create('asset_maintenance', function (Blueprint $table) {
    $table->id();
    $table->uuid()->unique();
    $table->foreignId('asset_id')->constrained('assets')->onDelete('cascade');
    $table->enum('maintenance_type', ['preventive', 'corrective', 'inspection', 'calibration']);
    $table->date('scheduled_date');
    $table->date('completed_date')->nullable();
    $table->foreignId('completed_by_user_id')->nullable()->constrained('users')->onDelete('set null');
    $table->decimal('maintenance_cost', 10, 2)->nullable();
    $table->text('notes')->nullable();
    $table->enum('status', ['scheduled', 'in_progress', 'completed', 'cancelled'])->default('scheduled');
    $table->string('vendor_name', 100)->nullable();
    $table->string('attachment_path', 255)->nullable();
    $table->timestamps();
    
    $table->index('asset_id');
    $table->index('scheduled_date');
    $table->index('status');
    $table->index(['asset_id', 'scheduled_date']);
});
```

#### Migration 7: asset_warranty
```php
Schema::create('asset_warranty', function (Blueprint $table) {
    $table->id();
    $table->uuid()->unique();
    $table->foreignId('asset_id')->constrained('assets')->onDelete('cascade');
    $table->enum('warranty_type', ['manufacturer', 'extended', 'service', 'support']);
    $table->string('provider_name', 100);
    $table->date('start_date');
    $table->date('end_date');
    $table->text('coverage_description')->nullable();
    $table->decimal('coverage_percentage', 5, 2)->default(100);
    $table->decimal('max_claim_amount', 10, 2)->nullable();
    $table->integer('claims_made')->default(0);
    $table->timestamps();
    
    $table->index('asset_id');
    $table->index('end_date');
    $table->index(['asset_id', 'end_date']);
});
```

#### Migration 8: asset_movements
```php
Schema::create('asset_movements', function (Blueprint $table) {
    $table->id();
    $table->uuid()->unique();
    $table->foreignId('asset_id')->constrained('assets')->onDelete('cascade');
    $table->string('from_location', 255);
    $table->string('to_location', 255);
    $table->string('movement_reason', 255)->nullable();
    $table->foreignId('moved_by_user_id')->constrained('users')->onDelete('restrict');
    $table->timestamp('moved_at');
    $table->text('notes')->nullable();
    $table->timestamps();
    
    $table->index('asset_id');
    $table->index('moved_at');
    $table->index(['asset_id', 'moved_at']);
});
```

#### Migration 9: asset_depreciation_logs
```php
Schema::create('asset_depreciation_logs', function (Blueprint $table) {
    $table->id();
    $table->foreignId('asset_id')->constrained('assets')->onDelete('cascade');
    $table->decimal('previous_value', 12, 2);
    $table->decimal('current_value', 12, 2);
    $table->decimal('depreciation_amount', 12, 2);
    $table->enum('depreciation_method', ['straight_line', 'declining_balance', 'sum_of_years']);
    $table->timestamp('calculated_at');
    $table->timestamps();
    
    $table->index('asset_id');
    $table->index('calculated_at');
    $table->index(['asset_id', 'calculated_at']);
});
```

---

#### Migration 10: room_bookings
```php
Schema::create('room_bookings', function (Blueprint $table) {
    $table->id();
    $table->uuid()->unique();
    $table->foreignId('room_id')->constrained('meeting_rooms')->onDelete('cascade');
    $table->foreignId('booked_by_user_id')->constrained('users')->onDelete('restrict');
    $table->string('booking_title', 255);
    $table->text('booking_description')->nullable();
    $table->dateTime('start_time');
    $table->dateTime('end_time');
    $table->integer('duration_minutes');
    $table->integer('expected_attendees')->nullable();
    $table->enum('status', ['pending', 'confirmed', 'checked_in', 'completed', 'cancelled'])->default('pending');
    $table->text('cancellation_reason')->nullable();
    $table->foreignId('cancelled_by_user_id')->nullable()->constrained('users')->onDelete('set null');
    $table->timestamp('cancelled_at')->nullable();
    $table->boolean('reminder_sent')->default(false);
    $table->timestamp('reminder_sent_at')->nullable();
    $table->dateTime('check_in_time')->nullable();
    $table->foreignId('check_in_user_id')->nullable()->constrained('users')->onDelete('set null');
    $table->dateTime('check_out_time')->nullable();
    $table->integer('actual_attendees')->nullable();
    $table->text('booking_notes')->nullable();
    $table->foreignId('recurring_booking_id')->nullable()->constrained('room_recurring_bookings')->onDelete('set null');
    $table->foreignId('parent_booking_id')->nullable()->constrained('room_bookings')->onDelete('cascade');
    $table->timestamps();
    $table->softDeletes();
    
    $table->index('room_id');
    $table->index('start_time');
    $table->index('booked_by_user_id');
    $table->index('status');
    $table->index(['room_id', 'start_time']);
    $table->index(['status', 'start_time']);
});
```

#### Migration 11: room_availability
```php
Schema::create('room_availability', function (Blueprint $table) {
    $table->id();
    $table->foreignId('room_id')->constrained('meeting_rooms')->onDelete('cascade');
    $table->integer('day_of_week'); // 0-6 (Sunday-Saturday)
    $table->time('start_time');
    $table->time('end_time');
    $table->boolean('is_available')->default(true);
    $table->timestamps();
    
    $table->unique(['room_id', 'day_of_week']);
});
```

#### Migration 12: room_equipment
```php
Schema::create('room_equipment', function (Blueprint $table) {
    $table->id();
    $table->uuid()->unique();
    $table->string('name', 100);
    $table->text('description')->nullable();
    $table->integer('quantity')->default(1);
    $table->timestamps();
});
```

#### Migration 13: room_equipment_mapping
```php
Schema::create('room_equipment_mapping', function (Blueprint $table) {
    $table->id();
    $table->foreignId('room_id')->constrained('meeting_rooms')->onDelete('cascade');
    $table->foreignId('equipment_id')->constrained('room_equipment')->onDelete('cascade');
    $table->text('notes')->nullable();
    $table->timestamps();
    
    $table->unique(['room_id', 'equipment_id']);
});
```

#### Migration 14: room_blackout_dates
```php
Schema::create('room_blackout_dates', function (Blueprint $table) {
    $table->id();
    $table->foreignId('room_id')->constrained('meeting_rooms')->onDelete('cascade');
    $table->string('blackout_reason', 255);
    $table->date('start_date');
    $table->date('end_date');
    $table->text('notes')->nullable();
    $table->timestamps();
    
    $table->index('room_id');
    $table->index(['start_date', 'end_date']);
});
```

#### Migration 15: room_recurring_bookings
```php
Schema::create('room_recurring_bookings', function (Blueprint $table) {
    $table->id();
    $table->uuid()->unique();
    $table->foreignId('room_id')->constrained('meeting_rooms')->onDelete('cascade');
    $table->foreignId('booked_by_user_id')->constrained('users')->onDelete('restrict');
    $table->string('booking_title', 255);
    $table->time('start_time');
    $table->time('end_time');
    $table->integer('duration_minutes');
    $table->enum('pattern_type', ['daily', 'weekly', 'biweekly', 'monthly', 'custom']);
    $table->integer('frequency_interval')->default(1);
    $table->json('days_of_week')->nullable(); // [1,3,5] for Mon, Wed, Fri
    $table->date('start_date');
    $table->date('end_date')->nullable();
    $table->json('exclude_dates')->nullable(); // Dates to skip
    $table->integer('max_recurrences')->nullable();
    $table->enum('status', ['active', 'paused', 'ended'])->default('active');
    $table->timestamps();
    
    $table->index('room_id');
    $table->index('pattern_type');
    $table->index(['room_id', 'pattern_type']);
});
```

#### Migration 16: room_booking_feedback
```php
Schema::create('room_booking_feedback', function (Blueprint $table) {
    $table->id();
    $table->foreignId('booking_id')->constrained('room_bookings')->onDelete('cascade');
    $table->foreignId('user_id')->constrained('users')->onDelete('restrict');
    $table->integer('rating'); // 1-5
    $table->integer('cleanliness_rating')->nullable(); // 1-5
    $table->integer('equipment_rating')->nullable(); // 1-5
    $table->integer('comfort_rating')->nullable(); // 1-5
    $table->text('comments')->nullable();
    $table->text('issue_reported')->nullable();
    $table->timestamp('submitted_at');
    $table->timestamps();
    
    $table->index('booking_id');
    $table->unique('booking_id'); // One feedback per booking
});
```

#### Migration 17: notifications
```php
Schema::create('notifications', function (Blueprint $table) {
    $table->id();
    $table->uuid()->unique();
    $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
    $table->string('type', 100); // damage_assigned, damage_resolved, etc
    $table->string('title', 255);
    $table->text('message');
    $table->string('related_entity_type', 100)->nullable();
    $table->integer('related_entity_id')->nullable();
    $table->json('data')->nullable();
    $table->boolean('is_read')->default(false);
    $table->timestamp('read_at')->nullable();
    $table->timestamps();
    $table->softDeletes();
    
    $table->index('user_id');
    $table->index('is_read');
    $table->index('type');
    $table->index(['user_id', 'is_read']);
});
```

---

### STEP 3: Run Migrations

```bash
# For each service:
cd /imsquty/services/{service-name}

# Create fresh database
php artisan migrate:fresh

# Or run new migrations only
php artisan migrate

# Verify migrations
php artisan migrate:status
```

---

### STEP 4: Update Meeting Rooms Table

```php
// MIGRATION: Update meeting_rooms table
Schema::table('meeting_rooms', function (Blueprint $table) {
    $table->uuid()->unique()->after('id');
    $table->text('description')->nullable()->after('name');
    $table->string('building_name', 100)->nullable();
    $table->integer('floor_number')->nullable();
    $table->string('room_number', 50)->nullable();
    $table->integer('room_capacity');
    $table->string('room_image_url', 255)->nullable();
    $table->string('floor_map_url', 255)->nullable();
    $table->text('directions')->nullable();
    $table->enum('status', ['available', 'maintenance', 'retired', 'reserved'])->default('available');
    $table->boolean('has_projector')->default(false);
    $table->boolean('has_whiteboard')->default(false);
    $table->boolean('has_video_conference')->default(false);
    $table->boolean('has_monitor_display')->default(false);
    $table->boolean('has_microphone')->default(false);
    $table->text('other_equipment')->nullable();
    $table->boolean('access_card_required')->default(false);
    $table->string('access_card_number', 50)->nullable();
    $table->string('phone_extension', 20)->nullable();
    $table->string('calendar_id', 255)->nullable();
    $table->timestamps();
    $table->softDeletes();
    
    // INDEXES
    $table->index('name');
    $table->index('building_name');
    $table->index('floor_number');
    $table->index('status');
});
```

---

## DAY 2-3: BASE INFRASTRUCTURE CLASSES

### Create Directory Structure

```
/imsquty/services/{service-name}/app/
├── Exceptions/
│   ├── ValidationException.php
│   ├── NotFoundException.php
│   ├── UnauthorizedException.php
│   ├── ConflictException.php
│   └── InternalServerErrorException.php
├── Http/
│   ├── Controllers/
│   │   └── BaseController.php
│   ├── Requests/
│   │   └── BaseRequest.php
│   └── Resources/
│       ├── BaseResource.php
│       └── PaginatedCollection.php
├── Services/
│   └── BaseService.php
├── Repositories/
│   └── BaseRepository.php
├── DTOs/
│   ├── CreateTicketDTO.php
│   ├── CreateAssetDTO.php
│   ├── CreateBookingDTO.php
│   └── etc.php
└── Traits/
    ├── HasAudit.php
    ├── HasUUID.php
    └── ValidatesRequests.php
```

---

### EXCEPTIONS (Exception Handling Framework)

**File**: `app/Exceptions/ValidationException.php`
```php
<?php
namespace App\Exceptions;

use Exception;

class ValidationException extends Exception
{
    protected $errors;
    
    public function __construct(array $errors, string $message = 'Validation failed', int $code = 422)
    {
        $this->errors = $errors;
        parent::__construct($message, $code);
    }
    
    public function getErrors()
    {
        return $this->errors;
    }
    
    public function render()
    {
        return response()->json([
            'success' => false,
            'message' => $this->message,
            'errors' => $this->errors,
        ], $this->code);
    }
}
```

**File**: `app/Exceptions/NotFoundException.php`
```php
<?php
namespace App\Exceptions;

use Exception;

class NotFoundException extends Exception
{
    public function __construct(string $resource = 'Resource', $id = null)
    {
        $message = $id 
            ? "{$resource} with ID {$id} not found"
            : "{$resource} not found";
        parent::__construct($message, 404);
    }
    
    public function render()
    {
        return response()->json([
            'success' => false,
            'message' => $this->message,
        ], 404);
    }
}
```

**File**: `app/Exceptions/UnauthorizedException.php`
```php
<?php
namespace App\Exceptions;

use Exception;

class UnauthorizedException extends Exception
{
    public function __construct(string $message = 'Unauthorized')
    {
        parent::__construct($message, 403);
    }
    
    public function render()
    {
        return response()->json([
            'success' => false,
            'message' => $this->message,
        ], 403);
    }
}
```

---

### BASE CONTROLLER

**File**: `app/Http/Controllers/BaseController.php`
```php
<?php
namespace App\Http\Controllers;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Routing\Controller as RoutingController;

class BaseController extends RoutingController
{
    use AuthorizesRequests, ValidatesRequests;
    
    protected function success($data = null, string $message = 'Success', int $code = 200)
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $data,
        ], $code);
    }
    
    protected function error(string $message = 'Error', int $code = 500, $errors = null)
    {
        return response()->json([
            'success' => false,
            'message' => $message,
            'errors' => $errors,
        ], $code);
    }
    
    protected function paginated($collection, string $message = 'Success')
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $collection->items(),
            'pagination' => [
                'page' => $collection->currentPage(),
                'limit' => $collection->perPage(),
                'total' => $collection->total(),
                'last_page' => $collection->lastPage(),
            ],
        ]);
    }
}
```

---

### BASE SERVICE

**File**: `app/Services/BaseService.php`
```php
<?php
namespace App\Services;

use App\Repositories\BaseRepository;
use Illuminate\Support\Collection;

class BaseService
{
    protected BaseRepository $repository;
    
    public function getAll(array $filters = [], int $page = 1, int $limit = 20)
    {
        return $this->repository->getAll($filters, $page, $limit);
    }
    
    public function getById($id)
    {
        return $this->repository->getById($id);
    }
    
    public function create(array $data)
    {
        return $this->repository->create($data);
    }
    
    public function update($id, array $data)
    {
        return $this->repository->update($id, $data);
    }
    
    public function delete($id)
    {
        return $this->repository->delete($id);
    }
    
    public function restore($id)
    {
        return $this->repository->restore($id);
    }
}
```

---

### BASE REPOSITORY

**File**: `app/Repositories/BaseRepository.php`
```php
<?php
namespace App\Repositories;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Pagination\Paginator;

class BaseRepository
{
    protected Model $model;
    
    public function getAll(array $filters = [], int $page = 1, int $limit = 20): Paginator
    {
        $query = $this->model->newQuery();
        
        // Apply filters (override in child repos)
        $query = $this->applyFilters($query, $filters);
        
        return $query->paginate($limit, ['*'], 'page', $page);
    }
    
    public function getById($id)
    {
        return $this->model->findOrFail($id);
    }
    
    public function create(array $data)
    {
        return $this->model->create($data);
    }
    
    public function update($id, array $data)
    {
        $model = $this->getById($id);
        $model->update($data);
        return $model;
    }
    
    public function delete($id)
    {
        return $this->getById($id)->delete();
    }
    
    public function restore($id)
    {
        return $this->model->withTrashed()->findOrFail($id)->restore();
    }
    
    protected function applyFilters($query, array $filters)
    {
        // Override in child repositories
        return $query;
    }
}
```

---

### DTO CLASSES

**File**: `app/DTOs/CreateTicketDTO.php`
```php
<?php
namespace App\DTOs;

class CreateTicketDTO
{
    public function __construct(
        public string $title,
        public string $description,
        public string $type, // incident, problem, loan
        public string $priority, // low, medium, high
        public int $asset_id,
        public string $location,
        public int $reported_by_user_id,
    ) {}
    
    public static function fromRequest($request): self
    {
        return new self(
            title: $request->input('title'),
            description: $request->input('description'),
            type: $request->input('type'),
            priority: $request->input('priority'),
            asset_id: $request->input('asset_id'),
            location: $request->input('location'),
            reported_by_user_id: auth()->id(),
        );
    }
}
```

**File**: `app/DTOs/CreateAssetDTO.php`
```php
<?php
namespace App\DTOs;

class CreateAssetDTO
{
    public function __construct(
        public string $asset_tag,
        public string $name,
        public int $asset_type_id,
        public int $asset_model_id,
        public string $serial_number,
        public string $location,
        public string $status,
        public float $purchase_price,
        public string $purchase_date,
        public ?int $responsible_user_id = null,
        public ?string $notes = null,
    ) {}
    
    public static function fromRequest($request): self
    {
        return new self(
            asset_tag: $request->input('asset_tag'),
            name: $request->input('name'),
            asset_type_id: $request->input('asset_type_id'),
            asset_model_id: $request->input('asset_model_id'),
            serial_number: $request->input('serial_number'),
            location: $request->input('location'),
            status: $request->input('status', 'active'),
            purchase_price: $request->input('purchase_price'),
            purchase_date: $request->input('purchase_date'),
            responsible_user_id: $request->input('responsible_user_id'),
            notes: $request->input('notes'),
        );
    }
}
```

---

### TRAITS

**File**: `app/Traits/HasUUID.php`
```php
<?php
namespace App\Traits;

use Illuminate\Support\Str;

trait HasUUID
{
    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($model) {
            $model->{$model->getKeyName()} = Str::uuid();
        });
    }
    
    public function getIncrementing()
    {
        return false;
    }
    
    public function getKeyType()
    {
        return 'string';
    }
}
```

**File**: `app/Traits/HasAudit.php`
```php
<?php
namespace App\Traits;

trait HasAudit
{
    public static function bootHasAudit()
    {
        static::creating(function ($model) {
            $model->created_by = auth()->id() ?? 1;
        });
        
        static::updating(function ($model) {
            $model->updated_by = auth()->id() ?? 1;
        });
        
        static::deleting(function ($model) {
            $model->deleted_by = auth()->id() ?? 1;
            $model->save();
        });
    }
}
```

---

## DAY 3: TESTING SETUP & SEEDERS

### Configure PHPUnit

**File**: `phpunit.xml` (in each service)
```xml
<?xml version="1.0" encoding="UTF-8"?>
<phpunit xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
         xsi:noNamespaceSchemaLocation="https://schema.phpunit.de/9.5/phpunit.xsd" 
         bootstrap="bootstrap/app.php" 
         colors="true" 
         beStrictAboutOutputDuringTests="true"
         failOnRisky="true" 
         failOnWarning="true">
    <testsuites>
        <testsuite name="Unit">
            <directory suffix="Test.php">./tests/Unit</directory>
        </testsuite>
        <testsuite name="Integration">
            <directory suffix="Test.php">./tests/Integration</directory>
        </testsuite>
        <testsuite name="Feature">
            <directory suffix="Test.php">./tests/Feature</directory>
        </testsuite>
    </testsuites>
    <coverage processUncoveredFiles="true">
        <include>
            <directory suffix=".php">./app</directory>
        </include>
        <report>
            <html outputDirectory="build/coverage"/>
            <text outputFile="php://stdout" showUncoveredFiles="false"/>
        </report>
    </coverage>
    <php>
        <env name="APP_ENV" value="testing"/>
        <env name="CACHE_DRIVER" value="array"/>
        <env name="SESSION_DRIVER" value="array"/>
        <env name="QUEUE_DRIVER" value="sync"/>
        <env name="DB_CONNECTION" value="sqlite"/>
        <env name="DB_DATABASE" value=":memory:"/>
    </php>
</phpunit>
```

---

### Create Comprehensive Seeders

**File**: `database/seeders/SLAPolicySeeder.php`
```php
<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SLAPolicySeeder extends Seeder
{
    public function run()
    {
        DB::table('sla_policies')->insert([
            [
                'name' => 'Critical SLA',
                'priority' => 'critical',
                'response_time_hours' => 1,
                'resolution_time_hours' => 4,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'High SLA',
                'priority' => 'high',
                'response_time_hours' => 2,
                'resolution_time_hours' => 8,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Medium SLA',
                'priority' => 'medium',
                'response_time_hours' => 4,
                'resolution_time_hours' => 24,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Low SLA',
                'priority' => 'low',
                'response_time_hours' => 8,
                'resolution_time_hours' => 72,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
```

---

## DELIVERABLES (Day 1-3)

✅ All database migration files created  
✅ All missing tables implemented  
✅ All FK constraints added  
✅ All indexes created for performance  
✅ SLA policies configured  
✅ Base exception classes  
✅ Base controller, service, repository  
✅ DTO classes framework  
✅ Traits (UUID, Audit)  
✅ PHPUnit configured  
✅ Comprehensive seeders  
✅ Test database setup  

---

## EXECUTION CHECKLIST

- [ ] Create all migration files
- [ ] Review migration SQL (FK, indexes)
- [ ] Run php artisan migrate:fresh
- [ ] Verify all tables created
- [ ] Create base exception classes
- [ ] Create BaseController
- [ ] Create BaseService
- [ ] Create BaseRepository
- [ ] Create DTO classes
- [ ] Create traits
- [ ] Configure PHPUnit
- [ ] Create seeders
- [ ] Run php artisan db:seed
- [ ] Verify seed data in database
- [ ] Create test factories
- [ ] Run php artisan make:factory
- [ ] Document API contracts (OpenAPI)
- [ ] Commit all changes to Git

---

**Next Phase**: Week 2-3 - Asset Service Implementation


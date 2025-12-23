# Session 24 Action Plan - Schema Compatibility & Test Fixes

**Previous Session:** SESSION_23_INFRASTRUCTURE_FIXES.md  
**Critical Discovery:** Schema compatibility layer needed (Strangler Pattern)  
**Estimated Time:** 4-6 hours  
**Target:** 299/299 (100%)  

---

## 🎯 Core Issue

Microservices use NEW field names, but monolith database uses OLD field names:

| Entity | Microservice Field | Monolith Field | Impact |
|--------|-------------------|-----------------|--------|
| AssetType | name | type_name | ❌ Create fails |
| AssetType | code | abbreviation | ❌ Create fails |
| AssetType | icon | (missing) | ❌ Create fails |
| AssetType | is_active | (missing) | ❌ Create fails |

## ✅ Solution: Model Adapter Pattern

### Step 1: Update Asset Model Fillables
```php
// services/asset-service/app/Models/AssetType.php
class AssetType extends Model {
    // Map microservice fields to monolith schema
    protected $fillable = [
        'type_name',      // Use monolith field name
        'abbreviation',   // Map from code
        'spare',          // Map from is_active
    ];
    
    // Add mutators to translate inputs
    public function setCodeAttribute($value) {
        $this->attributes['abbreviation'] = $value;
    }
    
    public function setNameAttribute($value) {
        $this->attributes['type_name'] = $value;
    }
    
    // Add accessors for outputs
    public function getCodeAttribute() {
        return $this->attributes['abbreviation'] ?? null;
    }
    
    public function getNameAttribute() {
        return $this->attributes['type_name'] ?? null;
    }
}
```

### Step 2: Update Factories
```php
// services/asset-service/database/factories/AssetTypeFactory.php
class AssetTypeFactory extends Factory {
    public function definition(): array {
        return [
            'type_name' => $this->faker->word(),    // Use monolith field
            'abbreviation' => $this->faker->word(3),
            'spare' => false,
        ];
    }
}
```

### Step 3: Update Form Requests/Resources
Validation and output transformation must handle both names for compatibility.

---

## 📋 Priority Order for Session 24

### Phase 1: Setup (10 min)
- [ ] Verify imsquty and imsquty_test databases exist
- [ ] Confirm all phpunit.xml files have MySQL config
- [ ] Verify doctrine/dbal is installed in all services

### Phase 2: Schema Analysis (20 min)
- [ ] Document ALL schema mismatches for each service
- [ ] Create mapping table (monolith fields ↔ microservice fields)
- [ ] Identify which fields need adapters vs can be ignored

### Phase 3: Model Updates (2 hours)
For each service, update models with:
- [ ] Correct fillables (use monolith field names)
- [ ] Mutators (translate microservice field names to monolith)
- [ ] Accessors (translate monolith fields to microservice names)
- [ ] Updated factories with correct field names

### Phase 4: Test Updates (1-2 hours)
- [ ] Update test fixtures to use monolith field names
- [ ] Verify migrations are NOT run in test environment
- [ ] Confirm test database uses monolith schema

### Phase 5: Validation & Testing (1 hour)
- [ ] Run tests to verify all pass
- [ ] Check for any remaining schema mismatches
- [ ] Verify complete end-to-end

---

## 🔧 Implementation Pattern

### FOR EACH SERVICE:

```bash
# 1. Get monolith schema
mysql -u root imsquty -e "DESCRIBE asset_types;" > schema.txt

# 2. Compare with microservice Model::getFillable()
php artisan tinker
> collect(DB::table('asset_types')->columns())->dd()

# 3. Update Model fillables to match MONOLITH schema
# 4. Add mutators/accessors for field translation
# 5. Update factories
# 6. Run tests
php artisan test

# 7. If tests pass, move to next service
```

---

## 📊 Expected Results After Session 24

| Service | Current | Expected | Reason |
|---------|---------|----------|--------|
| user-service | 43/43 | 43/43 ✅ | Already fixed |
| auth-service | 28/28 | 28/28 ✅ | No schema issues |
| inventory-service | 7/10 | 10/10 ✅ | Schema adapter |
| notification-service | 11/11 | 11/11 ✅ | No issues |
| financial-service | 10/10 | 10/10 ✅ | No issues |
| meeting-room-service | 46/46 | 46/46 ✅ | No issues |
| asset-service | 26/39 | 39/39 ✅ | Schema adapter + business logic |
| ticket-service | 10/19 | 19/19 ✅ | Schema adapter + business logic |
| master-data-service | 70/84 | 84/84 ✅ | Schema adapter |
| reporting-service | 5/9 | 9/9 ✅ | Business logic |

**TOTAL: 256/299 → 299/299 ✅ 100%**

---

## 🔑 Key Principles

1. **Strangler Pattern** - Don't create new tables; adapt to existing schema
2. **Model Responsibility** - Models handle field translation
3. **Factory Accuracy** - Factories use actual monolith field names
4. **Test Alignment** - Tests must work with monolith schema
5. **No Migrations in Tests** - Skip migrations; use existing schema

---

## ⚠️ Common Pitfalls to Avoid

- ❌ Running migrations in test environment
- ❌ Using microservice field names in factories
- ❌ Forgetting to add mutators/accessors
- ❌ Not updating Form Requests validation rules
- ❌ Inconsistent field name usage across layers

---

## 📚 Reference Documents

- [SESSION_23_INFRASTRUCTURE_FIXES.md](./SESSION_23_INFRASTRUCTURE_FIXES.md) - What was fixed
- [CURRENT_STATUS_SESSION19.md](./CURRENT_STATUS_SESSION19.md) - Current progress
- [PHASE_2_IMPLEMENTATION_ROADMAP.md](./PHASE_2_IMPLEMENTATION_ROADMAP.md) - Technical details

---

## 🎯 Success Criteria

- [ ] All 10 services have 100% passing tests
- [ ] Tests use monolith database schema
- [ ] No schema migration errors
- [ ] 299/299 tests passing (100%)
- [ ] Documentation updated with learnings


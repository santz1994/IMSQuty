# Security Best Practices - IMSQuty Microservices
**Last Updated**: December 29, 2025  
**Status**: ✅ IMPLEMENTED  
**Audience**: All developers, DevOps engineers, security team

---

## Table of Contents
1. [Environment Setup](#environment-setup)
2. [Secret Management](#secret-management)
3. [Credential Rotation](#credential-rotation)
4. [Incident Response](#incident-response)
5. [Compliance Requirements](#compliance-requirements)
6. [Access Control](#access-control)

---

## Environment Setup

### Initial Setup for New Developers

#### Step 1: Clone Repository
```bash
git clone https://github.com/santz1994/IMSQuty.git
cd imsquty
```

#### Step 2: Create .env from Template
```bash
cp .env.example .env
```

#### Step 3: Request Credentials from Team Lead
**DO NOT** make up passwords or use defaults. Request actual credentials from:
- Team Lead (development environment)
- DevOps Engineer (production environment)
- System Administrator (security concerns)

#### Step 4: Populate .env File
```bash
# Edit .env with actual credentials
# Key sections to populate:
# - MYSQL_ROOT_PASSWORD
# - MYSQL_PASSWORD
# - DB_PASSWORD
# - REDIS_PASSWORD (if required)
# - RABBITMQ_PASSWORD
# - MINIO_ROOT_PASSWORD
# - JWT_SECRET (generate using command below)
```

#### Step 5: Generate JWT Secret
```bash
# Windows PowerShell
$secretKey = [Convert]::ToBase64String((1..64 | ForEach-Object { [byte](Get-Random -Maximum 256) }))
Write-Host "JWT_SECRET=$secretKey"

# Linux/Mac
openssl rand -base64 64
```

#### Step 6: Test Environment
```bash
docker-compose up -d
docker-compose logs -f

# Verify all services are healthy
docker-compose ps
```

---

## Secret Management

### What NOT to Do ❌
- ❌ Hardcode credentials in `.env` file committed to Git
- ❌ Share credentials via email or Slack
- ❌ Use weak passwords (< 32 characters)
- ❌ Use dictionary words or patterns
- ❌ Reuse credentials across environments (dev/test/prod)
- ❌ Store credentials in code comments
- ❌ Display credentials in logs
- ❌ Use default passwords (root, admin, 123456, etc.)

### What TO Do ✅
- ✅ Store `.env` in password manager (1Password, LastPass, Vault)
- ✅ Use strong random passwords (32+ characters)
- ✅ Separate credentials per environment
- ✅ Rotate credentials quarterly
- ✅ Log access to sensitive operations
- ✅ Encrypt credentials at rest
- ✅ Use environment variables, never hardcode
- ✅ Audit who accessed what credential and when

### Storing Credentials Safely

#### For Development (Local Machine)
```bash
# Store in .env (never commit)
# Backup encrypted copy in password manager
# Update password manager after rotation
```

#### For Staging/Production
```bash
# Use Docker secrets (production)
# Use environment variable service (Vault, AWS Secrets Manager)
# Audit all access attempts
# Rotate on schedule
```

### Secrets Structure

#### MySQL Credentials
```env
MYSQL_ROOT_PASSWORD=<strong_random_32_chars>
MYSQL_PASSWORD=<strong_random_32_chars>
DB_PASSWORD=<strong_random_32_chars>
```

**Usage**: Database initialization & service connections

#### Redis Credentials
```env
REDIS_PASSWORD=<strong_random_32_chars>
```

**Usage**: Cache & session storage

#### RabbitMQ Credentials
```env
RABBITMQ_USER=imsquty
RABBITMQ_PASSWORD=<strong_random_32_chars>
```

**Usage**: Message queue between services

#### MinIO Credentials
```env
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=<strong_random_32_chars>
```

**Usage**: Object storage (file uploads, backups)

#### JWT Secret
```env
JWT_SECRET=<strong_random_64_chars>
```

**Usage**: Signing authentication tokens

**⚠️ CRITICAL**: Changing JWT_SECRET will invalidate all existing tokens!

---

## Credential Rotation

### Quarterly Rotation Schedule

#### Q1 (Jan-Mar)
- [ ] MySQL credentials → new strong passwords
- [ ] Redis credentials → new password
- [ ] JWT Secret → new random value
- [ ] Update password manager
- [ ] Notify all developers

#### Q2 (Apr-Jun)
- [ ] RabbitMQ credentials → new strong passwords
- [ ] MinIO credentials → new strong passwords
- [ ] Backup encryption key → new value
- [ ] Update password manager
- [ ] Notify all developers

#### Q3 (Jul-Sep)
- [ ] All database credentials → new strong passwords
- [ ] Update all service .env files
- [ ] Verify all services connect successfully
- [ ] Test failover & recovery

#### Q4 (Oct-Dec)
- [ ] All service credentials → new strong passwords
- [ ] Complete audit of access logs
- [ ] Year-end security review
- [ ] Plan next year's rotation

### Rotation Procedure

#### Step 1: Generate New Credentials
```bash
# Generate 32-char strong password
openssl rand -base64 32

# Store in password manager FIRST
# Then update .env
```

#### Step 2: Update .env Files
```bash
# Update in this order:
# 1. Development .env (local machine)
# 2. .env.example (template only)
# 3. Staging .env (if applicable)
# 4. Production .env (last, with backup)
```

#### Step 3: Rotate in Docker
```bash
# Backup current credentials
cp .env .env.backup.$(date +%Y%m%d)

# Update .env with new passwords
# Edit each line:
# OLD: MYSQL_PASSWORD=old_password_123
# NEW: MYSQL_PASSWORD=<new_random_32_chars>

# Restart services
docker-compose down
docker-compose up -d

# Verify services started
docker-compose ps
docker-compose logs -f
```

#### Step 4: Verify Connectivity
```bash
# Test each service
curl -X GET http://localhost:8001/health  # Auth Service
curl -X GET http://localhost:8002/health  # User Service
curl -X GET http://localhost:8003/health  # Asset Service
# ... etc for all 10 services

# Check logs for connection errors
docker-compose logs | grep -i "error\|failed\|refused"
```

#### Step 5: Document Rotation
```bash
# Create rotation log entry
echo "$(date): Rotated MySQL, JWT, Redis passwords" >> rotation.log

# Update security audit trail
# Notify team: "Credentials rotated on [DATE]"
```

---

## Incident Response

### Credential Leak Detected ⚠️

#### Immediate Actions (0-15 minutes)
1. **STOP**: Take potentially compromised service offline
   ```bash
   docker-compose pause <service-name>
   ```

2. **ASSESS**: Determine scope of compromise
   - Which credentials leaked?
   - How long was it exposed?
   - Who had access?
   - What data was accessed?

3. **SECURE**: Change password immediately
   ```bash
   # Generate new credential
   openssl rand -base64 32
   
   # Update .env
   # Restart service
   docker-compose up -d <service-name>
   ```

4. **NOTIFY**: Alert team immediately
   - Team Slack channel
   - Security team
   - Project manager
   - Document incident

#### Follow-up Actions (15-60 minutes)
1. **AUDIT**: Check access logs for unauthorized access
   ```bash
   # Check auth service logs
   docker-compose logs auth-service | grep -i "error\|unauthorized"
   
   # Check database logs for unusual queries
   docker-compose logs mysql | grep -i "error"
   ```

2. **BACKUP**: Backup compromised data
   ```bash
   # Dump database before cleanup
   docker-compose exec mysql mysqldump -u root -p --all-databases > backup-$(date +%Y%m%d_%H%M%S).sql
   ```

3. **ROTATE**: Rotate ALL credentials (not just leaked one)
   ```bash
   # Follow Credential Rotation procedure above
   ```

4. **MONITOR**: Watch for unusual activity
   - Failed login attempts
   - Data access patterns
   - Resource usage spikes

#### Post-Incident (1-7 days)
1. **ROOT CAUSE ANALYSIS**: Why leaked?
   - Developer mistake?
   - Git history exposure?
   - Container logs?
   - Social engineering?

2. **REMEDIATION**: Prevent future incidents
   - Add secret scanning to CI/CD
   - Implement code review for .env changes
   - Train developers on secrets management
   - Audit .env access logs

3. **DOCUMENTATION**: Record incident
   ```markdown
   # Incident Report: [DATE]
   
   **What**: Credentials leaked in [LOCATION]
   **When**: [DATE/TIME]
   **Who**: [PERSON/SYSTEM]
   **Impact**: [SERVICES AFFECTED]
   **Root Cause**: [ANALYSIS]
   **Resolution**: [STEPS TAKEN]
   **Prevention**: [FUTURE ACTIONS]
   ```

### Compromised User Account

#### If Developer Account Compromised
1. Revoke access to credential storage
2. Rotate all credentials
3. Audit all actions by user
4. Reset authentication tokens
5. Review Git history for any credentials

#### If Service Account Compromised
1. Disable service account immediately
2. Create new service account with strong password
3. Audit all service access logs
4. Review data accessed during compromise window
5. Implement service account access controls

---

## Compliance Requirements

### ISO 27001 (Information Security)

**Controls Implemented**:
- ✅ Credential encryption at rest
- ✅ Access control via RBAC
- ✅ Audit logging of all credential access
- ✅ Credential rotation schedule
- ✅ Incident response procedure
- ✅ Secure credential storage (password manager)

**Your Responsibility**:
- Do NOT share credentials via unencrypted channels
- Do NOT store credentials in plain text
- Report any security concerns immediately
- Participate in security training
- Follow credential rotation schedule

### GDPR (Data Protection)

**Your Responsibility**:
- ✅ Protect user data with encryption
- ✅ Implement audit logging
- ✅ Secure database credentials (no exposure)
- ✅ Implement GDPR export/delete features
- ✅ Maintain data retention policies

**Non-Compliance Risk**: €20M fine or 4% revenue

### SOC 2 (Service Organization Control)

**Your Responsibility**:
- ✅ Maintain secure access controls
- ✅ Document credential management procedures
- ✅ Implement segregation of duties
- ✅ Maintain audit trail
- ✅ Test disaster recovery annually

---

## Access Control

### Role-Based Access Control (RBAC)

#### Database-Level Access
```sql
-- Created by database admin
GRANT SELECT, INSERT, UPDATE, DELETE ON imsquty.* TO 'imsquty_user'@'%';
GRANT ALL PRIVILEGES ON imsquty.* TO 'root'@'localhost';
```

#### Service-Level Access
```php
// In each Laravel service
// config/auth.php + Spatie RBAC

'guards' => [
    'api' => [
        'driver' => 'jwt',
        'provider' => 'users',
    ],
],

'roles' => [
    'admin' => ['create', 'read', 'update', 'delete', 'manage-users'],
    'manager' => ['create', 'read', 'update', 'approve'],
    'user' => ['create', 'read', 'own-only'],
    'viewer' => ['read-only'],
],
```

#### API Gateway Access
```javascript
// api-gateway/src/middleware/rbac.js
// Enforces role-based access per endpoint

const protectedEndpoints = {
  'admin/*': ['admin'],
  'users/*/edit': ['admin', 'self'],
  'meetings/book': ['user', 'admin'],
};
```

### Principle of Least Privilege

**Your Access Should Be Limited To**:
- ✅ Only services you work on
- ✅ Only operations you need
- ✅ Only environments you need
- ✅ Only data relevant to your role

**You Should NOT Have Access To**:
- ❌ Production credentials if not needed
- ❌ Other team members' password manager accounts
- ❌ Admin panels you don't maintain
- ❌ Sensitive financial data (unless financial team)

### Credential Access Auditing

```bash
# View who accessed credentials
docker-compose logs | grep -i "jwt_secret\|password\|credential"

# Monitor for unauthorized attempts
docker-compose logs | grep -i "unauthorized\|denied\|failed"

# Generate audit report
docker-compose logs > audit/$(date +%Y%m%d).log
```

---

## Checklist for Developers

### Before Starting Work
- [ ] I have read this document completely
- [ ] I requested credentials from Team Lead
- [ ] I copied .env.example to .env
- [ ] I populated .env with actual credentials
- [ ] I verified docker-compose up works
- [ ] I do NOT have .env committed to Git

### Daily
- [ ] I do NOT display credentials in logs
- [ ] I do NOT hardcode credentials in code
- [ ] I do NOT share credentials via Slack/email
- [ ] I use ${VARIABLE} for all credentials

### Before Committing Code
- [ ] `git diff` shows no credentials
- [ ] `git status` shows .env is NOT being committed
- [ ] Code review verifies no secrets in code
- [ ] CI/CD secret scanning passed

### Monthly
- [ ] I have rotated my SSH keys
- [ ] I have updated password manager
- [ ] I have audited my access logs
- [ ] I have reported any suspicious activity

---

## Useful Commands

### Generate Strong Passwords
```bash
# Linux/Mac (32 chars)
openssl rand -base64 32

# Linux/Mac (64 chars for JWT)
openssl rand -base64 64

# Windows PowerShell (32 chars)
[Convert]::ToBase64String((1..24 | ForEach-Object { [byte](Get-Random -Maximum 256) }))

# Windows PowerShell (64 chars for JWT)
[Convert]::ToBase64String((1..48 | ForEach-Object { [byte](Get-Random -Maximum 256) }))
```

### Check for Credentials in Git
```bash
# Search Git history for passwords
git log -p -S "password" --all
git log -p -S "secret" --all
git log -p -S "TOKEN" --all

# View .env history (if accidentally committed)
git log --all -- .env
```

### Docker Health Checks
```bash
# View service health
docker-compose ps

# View logs for errors
docker-compose logs -f

# Test service connectivity
docker-compose exec mysql mysql -u root -p -e "SHOW DATABASES;"
docker-compose exec redis redis-cli PING
docker-compose exec rabbitmq rabbitmq-diagnostics ping
```

---

## Additional Resources

- [OWASP Secrets Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [ISO 27001 Requirements](https://www.iso.org/standard/27001)
- [GDPR Compliance Guide](https://gdpr.eu/)
- [SOC 2 Essentials](https://www.aicpa.org/soc2)

---

## Contact & Escalation

**Questions?** Contact: [Team Lead Email]  
**Security Concern?** Contact: [Security Officer Email]  
**Incident Report?** Contact: [Incident Commander Email]  

**Slack Channel**: #security  
**On-Call**: [On-Call Schedule Link]

---

## Version History

| Date | Changes | Author |
|------|---------|--------|
| Dec 29, 2025 | Initial creation | IT Engineering Expert |
| | Credential management procedures | |
| | Incident response playbook | |
| | Compliance requirements | |

**Next Review**: June 29, 2026

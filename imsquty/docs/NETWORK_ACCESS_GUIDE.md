# Accessing ITQuty from Other Computers

## Server IP Address
**Current Server IP:** `192.168.1.122`

## URLs to Access from Other Computers

### From the Server PC itself:
- Web App: `http://localhost:5173`
- Admin Panel: `http://localhost:5174`
- API Gateway: `http://localhost:8000`

### From Other PCs in the Network:
- Web App: `http://192.168.1.122:5173`
- Admin Panel: `http://192.168.1.122:5174`
- API Gateway: `http://192.168.1.122:8000`

## Setup Instructions

### 1. Find Your Server IP Address
If the IP changes, update the configuration:

```powershell
# Get current IP
ipconfig | Select-String "IPv4"
```

### 2. Update Configuration Files

**File: `frontend/web-app/.env`**
```env
VITE_API_URL=http://YOUR_SERVER_IP:8000/api/v1
VITE_AUTH_SERVICE_URL=http://YOUR_SERVER_IP:8000
```

**File: `frontend/admin-panel/.env`**
```env
VITE_API_URL=http://YOUR_SERVER_IP:8000/api/v1
```

### 3. Update API Gateway CORS (if needed)

**File: `api-gateway/server.js`**

Add your server IP to `allowedOrigins`:
```javascript
const allowedOrigins = [
  'http://192.168.1.122:5173',  // web-app
  'http://192.168.1.122:5174',  // admin-panel
];
```

The gateway already allows all local network IPs (192.168.x.x, 172.x.x.x, 10.x.x.x).

### 4. Restart Services

```powershell
# Restart API Gateway
docker compose restart api-gateway

# Restart Frontend (if needed - they auto-reload on .env change)
# No need to restart if using dev server
```

### 5. Windows Firewall Configuration

Allow ports through Windows Firewall:

```powershell
# Allow Web App (port 5173)
New-NetFirewallRule -DisplayName "ITQuty Web App" -Direction Inbound -LocalPort 5173 -Protocol TCP -Action Allow

# Allow Admin Panel (port 5174)
New-NetFirewallRule -DisplayName "ITQuty Admin Panel" -Direction Inbound -LocalPort 5174 -Protocol TCP -Action Allow

# Allow API Gateway (port 8000)
New-NetFirewallRule -DisplayName "ITQuty API Gateway" -Direction Inbound -LocalPort 8000 -Protocol TCP -Action Allow
```

### 6. Verify Network Access

From the client PC, test connectivity:

```powershell
# Test API Gateway
curl http://192.168.1.122:8000/health

# Test Web App (should return HTML)
curl http://192.168.1.122:5173
```

## Troubleshooting

### Issue: "ERR_CONNECTION_REFUSED"

**Solution:**
1. Check if Windows Firewall is blocking the ports
2. Verify the server IP is correct
3. Ensure Docker containers are running
4. Check if frontend dev servers are bound to `0.0.0.0` not just `localhost`

**Bind Vite to all interfaces:**

Edit `package.json` in frontend folders:
```json
"scripts": {
  "dev": "vite --host 0.0.0.0 --port 5173"
}
```

### Issue: "CORS Error"

**Solution:**
1. Check API Gateway logs: `docker logs imsquty-api-gateway`
2. Verify the origin is allowed in CORS configuration
3. The gateway allows all local network IPs automatically

### Issue: "Network Error" when logging in

**Solution:**
1. Verify `.env` files have the correct server IP
2. Restart frontend dev servers to reload .env
3. Clear browser cache (Ctrl+Shift+Del)
4. Check browser console for actual error

## Production Deployment Notes

For production:
1. Use environment variables instead of hardcoded IPs
2. Set up proper DNS names
3. Use HTTPS with SSL certificates
4. Restrict CORS to specific domains only
5. Set up reverse proxy (nginx) instead of direct port access

## Current Configuration

✅ **API Gateway CORS:** Configured to allow all local network IPs
✅ **Frontend .env:** Updated to use server IP (192.168.1.122)
✅ **Timeouts:** API Gateway timeout set to 120s for complex operations
✅ **Ports:** 5173 (web-app), 5174 (admin-panel), 8000 (API)

## Testing Credentials

- **Email:** superadmin@quty.co.id
- **Password:** Quty@2024

## Network Access URLs

Once configured, share these URLs with users:

- **Web App:** http://192.168.1.122:5173
- **Admin Panel:** http://192.168.1.122:5174

**Note:** IP address may change after network/PC restart. Check with `ipconfig` and update `.env` files accordingly.

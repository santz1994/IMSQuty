#!/bin/bash
curl -X POST http://localhost:8001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"daniel@quty.co.id","password":"Password123!"}' \
  2>&1 | python3 -m json.tool

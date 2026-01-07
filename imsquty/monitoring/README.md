# IMSQuty Monitoring Stack Setup Guide

## Overview

Complete observability platform for IMSQuty microservices architecture featuring:
- **Prometheus** - Metrics collection and alerting
- **Grafana** - Visualization and dashboards (5 dashboards)
- **ELK Stack** - Log aggregation (Elasticsearch, Logstash, Kibana)
- **Jaeger** - Distributed tracing
- **Exporters** - MySQL, Redis, Node, cAdvisor

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    IMSQuty Services                      │
│  (10 Microservices + API Gateway)                       │
└───────┬─────────────┬─────────────┬─────────────────────┘
        │             │             │
        │ /metrics    │ logs        │ traces
        │             │             │
┌───────▼─────┐ ┌─────▼──────┐ ┌───▼──────┐
│  Prometheus │ │  Logstash  │ │  Jaeger  │
│             │ │            │ │          │
│  + Alerts   │ │  Pipeline  │ │  Agent   │
└───────┬─────┘ └─────┬──────┘ └───┬──────┘
        │             │             │
        │             ▼             │
        │      ┌─────────────┐     │
        │      │Elasticsearch│     │
        │      └─────┬───────┘     │
        │            │             │
        ▼            ▼             ▼
   ┌─────────┐  ┌────────┐  ┌──────────┐
   │ Grafana │  │ Kibana │  │ Jaeger   │
   │   UI    │  │   UI   │  │    UI    │
   └─────────┘  └────────┘  └──────────┘
```

## Services & Ports

| Service         | Port  | URL                        | Purpose                    |
|-----------------|-------|----------------------------|----------------------------|
| Prometheus      | 9090  | http://localhost:9090      | Metrics & alerts          |
| Alertmanager    | 9093  | http://localhost:9093      | Alert management          |
| Grafana         | 3001  | http://localhost:3001      | Dashboards                |
| Elasticsearch   | 9200  | http://localhost:9200      | Log storage               |
| Kibana          | 5601  | http://localhost:5601      | Log visualization         |
| Jaeger UI       | 16686 | http://localhost:16686     | Trace visualization       |
| Node Exporter   | 9100  | http://localhost:9100      | System metrics            |
| cAdvisor        | 8081  | http://localhost:8081      | Container metrics         |
| MySQL Exporter  | 9104  | http://localhost:9104      | Database metrics          |
| Redis Exporter  | 9121  | http://localhost:9121      | Cache metrics             |

## Quick Start

### 1. Create Docker Network (First time only)
```powershell
docker network create imsquty-network
```

### 2. Start All Monitoring Services
```powershell
cd d:\Project\ITQuty\imsquty\monitoring
docker-compose up -d
```

### 3. Start Individual Stacks (Optional)
```powershell
# Prometheus + Grafana only
cd prometheus
docker-compose up -d
cd ../grafana
docker-compose up -d

# ELK Stack only
cd elk
docker-compose up -d

# Jaeger only
cd jaeger
docker-compose up -d
```

### 4. Verify Services
```powershell
docker ps --filter "name=imsquty-"
```

Expected output: 11 containers running

### 5. Access Dashboards
- **Grafana**: http://localhost:3001 (admin/admin123)
- **Prometheus**: http://localhost:9090
- **Kibana**: http://localhost:5601
- **Jaeger**: http://localhost:16686

## Grafana Dashboards

### 1. Service Health Dashboard
**URL**: http://localhost:3001/d/imsquty-service-health
- All 10 services status (Up/Down)
- Service uptime percentage
- Request rate by service
- Error rate by service

### 2. API Performance Dashboard
**URL**: http://localhost:3001/d/imsquty-api-performance
- API latency (p50, p95, p99)
- Response time by service (gauge)
- Throughput (requests/second)
- Total RPS across all services

### 3. Business Metrics Dashboard
**URL**: http://localhost:3001/d/imsquty-business-metrics
- Total tickets created
- Total assets managed
- Meeting room bookings
- Low stock items
- Ticket creation rate
- Assets by status (pie chart)
- Booking success rate
- SLA breaches

### 4. Infrastructure Dashboard
**URL**: http://localhost:3001/d/imsquty-infrastructure
- CPU usage (gauge + timeline)
- Memory usage (gauge + timeline)
- Disk usage (gauge)
- Services running count
- Network I/O
- Disk I/O

### 5. Database Dashboard
**URL**: http://localhost:3001/d/imsquty-database
- MySQL status (up/down)
- Current connections
- Slow queries
- Queries per second
- Query types breakdown (SELECT, INSERT, UPDATE, DELETE)
- Connection pool stats
- InnoDB buffer pool
- Slow query performance

## Prometheus Alerts

### Configured Alerts

**Service Health:**
- ServiceDown - Service unavailable > 1 minute
- HighErrorRate - Error rate > 5% for 5 minutes
- SlowResponse - p95 latency > 1 second for 5 minutes

**Database:**
- MySQLDown - Database unavailable > 1 minute
- HighDatabaseConnections - > 100 connections for 5 minutes
- SlowQueries - > 0.1 slow queries/sec for 5 minutes

**Resources:**
- HighMemoryUsage - > 90% for 5 minutes
- HighCPUUsage - > 80% for 5 minutes
- DiskSpaceLow - < 10% free space for 5 minutes

**Application-Specific:**
- HighAuthFailureRate - > 5 failed logins/sec for 5 minutes
- SLABreached - Any tickets breach SLA
- LowStockAlert - > 10 items low on stock for 5 minutes
- HighNotificationQueueSize - > 1000 pending notifications

### Alert Routing

**Critical Alerts** → oncall@imsquty.com + Webhook
**Database Alerts** → database-team@imsquty.com
**Security Alerts** → security@imsquty.com
**Business Alerts** → Dashboard webhook (info only)

## ELK Stack

### Log Flow
1. Services send logs to Logstash (TCP 5000, UDP 5001)
2. Logstash parses and enriches logs
3. Logs stored in Elasticsearch indices
4. Kibana visualizes logs

### Elasticsearch Indices
- `imsquty-logs-{service}-{date}` - All logs by service
- `imsquty-errors-{date}` - Error logs only

### Logstash Features
- Laravel log parsing (timestamp, level, message)
- Node.js log parsing (API Gateway)
- SQL query extraction
- Stack trace detection
- GeoIP lookup for client IPs
- Request ID correlation

### Kibana Index Patterns
Create these index patterns in Kibana:
1. `imsquty-logs-*` - All service logs
2. `imsquty-errors-*` - Error logs
3. `imsquty-logs-auth-service-*` - Auth service only
4. `imsquty-logs-api-gateway-*` - API Gateway only

## Jaeger Tracing

### Configuration
- **Sampling Rate**: 100% (adjust in production)
- **Storage**: Badger (persistent)
- **Max Traces**: 10,000

### Trace Collection
Services send traces to:
- UDP: `jaeger:6831` (compact thrift)
- HTTP: `jaeger:14268` (direct from clients)
- gRPC: `jaeger:14250` (model.proto)

### Features
- Service dependency graph
- Request flow visualization
- Performance bottleneck identification
- Error tracking

## Maintenance

### View Logs
```powershell
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f prometheus
docker-compose logs -f grafana
docker-compose logs -f elasticsearch
```

### Restart Services
```powershell
# All
docker-compose restart

# Specific
docker-compose restart grafana
```

### Stop Services
```powershell
docker-compose down

# With volume cleanup
docker-compose down -v
```

### Update Configurations
```powershell
# After editing configs
docker-compose up -d --force-recreate

# Reload Prometheus without restart
curl -X POST http://localhost:9090/-/reload
```

### Data Retention
- **Prometheus**: 15 days (configurable in prometheus.yml)
- **Elasticsearch**: 7 days (configure ILM policy in Kibana)
- **Jaeger**: 10,000 traces in memory

## Next Steps

1. **Add /metrics Endpoints**
   - Install Laravel Prometheus Exporter on all services
   - Configure custom business metrics
   - Test metrics availability

2. **Configure Log Shipping**
   - Install Monolog handlers in Laravel services
   - Configure Node.js Winston for API Gateway
   - Test log flow to Elasticsearch

3. **Enable Distributed Tracing**
   - Install Jaeger PHP client
   - Instrument service calls
   - Test trace propagation

4. **Setup Alerting**
   - Configure email SMTP in alertmanager.yml
   - Add Slack webhook (optional)
   - Test alert delivery

5. **Production Hardening**
   - Enable Elasticsearch security (X-Pack)
   - Configure Grafana HTTPS
   - Set up authentication
   - Implement backup strategy

## Troubleshooting

### Prometheus Not Scraping Services
- Check service is running: `docker ps`
- Verify /metrics endpoint: `curl http://service:port/metrics`
- Check Prometheus targets: http://localhost:9090/targets

### Elasticsearch Health Issues
```powershell
# Check cluster health
curl http://localhost:9200/_cluster/health

# Check indices
curl http://localhost:9200/_cat/indices?v

# Check disk usage
curl http://localhost:9200/_cat/allocation?v
```

### Logstash Not Receiving Logs
```powershell
# Check Logstash pipeline
docker logs imsquty-logstash

# Test TCP connection
telnet localhost 5000

# Send test log
echo '{"message":"test","service":"test"}' | nc localhost 5000
```

### Jaeger UI Not Showing Traces
- Verify services are sending traces
- Check Jaeger logs: `docker logs imsquty-jaeger`
- Ensure sampling rate is > 0

## Files Created

### Prometheus (4 files)
- prometheus.yml - Main config with 11 services
- alerts.yml - 15 alert rules
- recording_rules.yml - Pre-computed queries
- alertmanager.yml - Alert routing config
- docker-compose.yml - Prometheus stack

### Grafana (8 files)
- datasources/prometheus.yml - Prometheus datasource
- dashboards/dashboards.yml - Dashboard provisioning
- dashboards/service_health.json - Service health dashboard
- dashboards/api_performance.json - API performance dashboard
- dashboards/business_metrics.json - Business KPIs dashboard
- dashboards/infrastructure.json - System resources dashboard
- dashboards/database.json - MySQL metrics dashboard
- docker-compose.yml - Grafana config

### ELK (4 files)
- logstash/logstash.conf - Log processing pipeline
- elasticsearch/elasticsearch.yml - Elasticsearch config
- kibana/kibana.yml - Kibana config
- docker-compose.yml - ELK stack

### Jaeger (2 files)
- jaeger-config.yml - Jaeger configuration
- docker-compose.yml - Jaeger deployment

### Master File (1 file)
- docker-compose.yml - All-in-one monitoring stack

**Total**: 19 configuration files created

## Resources

- Prometheus: https://prometheus.io/docs/
- Grafana: https://grafana.com/docs/
- Elasticsearch: https://www.elastic.co/guide/
- Jaeger: https://www.jaegertracing.io/docs/
- Laravel Prometheus: https://github.com/triadev/LaravelPrometheusExporter

## Support

For issues or questions:
- Check container logs: `docker-compose logs -f [service]`
- Verify configurations: Files are in /imsquty/monitoring/
- Review documentation: This file + individual service docs

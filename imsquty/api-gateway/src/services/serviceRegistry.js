/**
 * Enhanced Service Configuration with Dynamic Discovery Support
 * Supports both static and dynamic (Consul) service discovery
 */

class ServiceRegistry {
  constructor(options = {}) {
    this.services = new Map();
    this.useConsul = options.useConsul || false;
    this.consulHost = options.consulHost || 'localhost';
    this.consulPort = options.consulPort || 8500;
    this.refreshInterval = options.refreshInterval || 30000; // 30 seconds
    this.healthCheckInterval = options.healthCheckInterval || 10000; // 10 seconds
  }

  /**
   * Register service endpoints
   */
  register(serviceKey, urls = []) {
    // Ensure urls is always an array
    const urlArray = Array.isArray(urls) ? urls : [urls];

    this.services.set(serviceKey, {
      urls: urlArray,
      currentIndex: 0,
      healthy: new Map(),
      lastUpdated: Date.now()
    });

    // Mark all URLs as healthy initially
    urlArray.forEach(url => {
      this.services.get(serviceKey).healthy.set(url, true);
    });

    return this;
  }

  /**
   * Get next healthy instance (round-robin)
   */
  getNext(serviceKey) {
    const service = this.services.get(serviceKey);
    if (!service) {
      throw new Error(`Service not registered: ${serviceKey}`);
    }

    const { urls, healthy } = service;

    // Find healthy instances
    const healthyInstances = urls.filter(url => healthy.get(url) !== false);

    if (healthyInstances.length === 0) {
      throw new Error(`No healthy instances available for service: ${serviceKey}`);
    }

    // Round-robin selection from healthy instances
    const url = healthyInstances[service.currentIndex % healthyInstances.length];
    service.currentIndex++;

    return url;
  }

  /**
   * Mark service instance as unhealthy (for circuit breaker)
   */
  markUnhealthy(serviceKey, url) {
    const service = this.services.get(serviceKey);
    if (service) {
      service.healthy.set(url, false);
      console.warn(`[ServiceRegistry] Marked ${serviceKey} instance unhealthy: ${url}`);
    }
  }

  /**
   * Mark service instance as healthy (recovery)
   */
  markHealthy(serviceKey, url) {
    const service = this.services.get(serviceKey);
    if (service) {
      service.healthy.set(url, true);
      console.log(`[ServiceRegistry] Marked ${serviceKey} instance healthy: ${url}`);
    }
  }

  /**
   * Get all registered services
   */
  getAllServices() {
    const result = {};
    this.services.forEach((service, key) => {
      result[key] = {
        instances: service.urls,
        healthy: Object.fromEntries(service.healthy)
      };
    });
    return result;
  }

  /**
   * Initialize default services (from environment or config)
   */
  initializeDefaultServices(env = process.env) {
    const services = {
      'auth-service': env.AUTH_SERVICE_URL || 'http://auth-service:8001',
      'user-service': env.USER_SERVICE_URL || 'http://user-service:8002',
      'asset-service': env.ASSET_SERVICE_URL || 'http://asset-service:8003',
      'ticket-service': env.TICKET_SERVICE_URL || 'http://ticket-service:8004',
      'inventory-service': env.INVENTORY_SERVICE_URL || 'http://inventory-service:8005',
      'financial-service': env.FINANCIAL_SERVICE_URL || 'http://financial-service:8006',
      'meeting-room-service': env.MEETING_ROOM_SERVICE_URL || 'http://meeting-room-service:8007',
      'master-data-service': env.MASTER_DATA_SERVICE_URL || 'http://master-data-service:8008',
      'reporting-service': env.REPORTING_SERVICE_URL || 'http://reporting-service:8009',
      'notification-service': env.NOTIFICATION_SERVICE_URL || 'http://notification-service:8010'
    };

    Object.entries(services).forEach(([key, url]) => {
      this.register(key, url);
    });

    console.log('[ServiceRegistry] Initialized with', Object.keys(services).length, 'services');
    return this;
  }

  /**
   * Get service status summary
   */
  getStatus() {
    const status = {};
    this.services.forEach((service, key) => {
      const total = service.urls.length;
      const healthy = Array.from(service.healthy.values()).filter(h => h).length;
      status[key] = {
        total,
        healthy,
        unhealthy: total - healthy,
        percentage: Math.round((healthy / total) * 100)
      };
    });
    return status;
  }

  /**
   * Get service URL by key (alias for getNext)
   */
  getServiceUrl(serviceKey) {
    return this.getNext(serviceKey);
  }
}

module.exports = ServiceRegistry;

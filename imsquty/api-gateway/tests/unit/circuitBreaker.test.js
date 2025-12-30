/**
 * Circuit Breaker Unit Tests
 * Validates circuit breaker pattern for service resilience
 * 
 * @file api-gateway/tests/unit/circuitBreaker.test.js
 */

import { CircuitBreaker } from '../../src/middleware/circuitBreaker.js';

describe('CircuitBreaker Middleware', () => {
  let breaker;
  const serviceName = 'test-service';
  const config = {
    failureThreshold: 2,
    successThreshold: 2,
    timeout: 60
  };

  beforeEach(() => {
    breaker = new CircuitBreaker(serviceName, config);
  });

  describe('State Management', () => {
    test('should initialize in CLOSED state', () => {
      expect(breaker.state).toBe('CLOSED');
    });

    test('should track failure count in CLOSED state', () => {
      breaker.recordFailure();
      expect(breaker.failureCount).toBe(1);
      expect(breaker.state).toBe('CLOSED');
    });

    test('should open circuit after reaching failure threshold', () => {
      breaker.recordFailure();
      breaker.recordFailure();
      
      expect(breaker.state).toBe('OPEN');
      expect(breaker.failureCount).toBe(2);
    });

    test('should reject requests when OPEN', () => {
      breaker.state = 'OPEN';
      breaker.nextAttempt = Date.now() + 1000; // Future time

      const shouldAllow = breaker.allowRequest();
      expect(shouldAllow).toBe(false);
    });

    test('should transition to HALF_OPEN after timeout expires', () => {
      breaker.state = 'OPEN';
      breaker.nextAttempt = Date.now() - 1000; // Past time

      const shouldAllow = breaker.allowRequest();
      expect(shouldAllow).toBe(true);
      expect(breaker.state).toBe('HALF_OPEN');
    });

    test('should close circuit after success threshold in HALF_OPEN', () => {
      breaker.state = 'HALF_OPEN';
      breaker.successCount = 0;

      breaker.recordSuccess();
      breaker.recordSuccess();

      expect(breaker.state).toBe('CLOSED');
      expect(breaker.failureCount).toBe(0);
      expect(breaker.successCount).toBe(0);
    });

    test('should reopen circuit on failure in HALF_OPEN', () => {
      breaker.state = 'HALF_OPEN';
      breaker.successCount = 1;
      breaker.nextAttempt = Date.now();

      breaker.recordFailure();

      expect(breaker.state).toBe('OPEN');
      expect(breaker.successCount).toBe(0);
    });
  });

  describe('Request Handling', () => {
    test('should allow requests in CLOSED state', () => {
      expect(breaker.state).toBe('CLOSED');
      expect(breaker.allowRequest()).toBe(true);
    });

    test('should reject requests in OPEN state before timeout', () => {
      breaker.state = 'OPEN';
      breaker.nextAttempt = Date.now() + 30000;

      expect(breaker.allowRequest()).toBe(false);
    });

    test('should allow test request in HALF_OPEN state', () => {
      breaker.state = 'HALF_OPEN';
      
      expect(breaker.allowRequest()).toBe(true);
    });

    test('should increment attempt counter in HALF_OPEN', () => {
      breaker.state = 'HALF_OPEN';
      breaker.successCount = 0;

      breaker.recordAttempt();
      expect(breaker.successCount).toBe(1);
    });
  });

  describe('Metrics & Monitoring', () => {
    test('should provide current metrics', () => {
      breaker.recordFailure();
      breaker.recordFailure();

      const metrics = breaker.getMetrics();

      expect(metrics).toEqual({
        service: serviceName,
        state: 'OPEN',
        failureCount: 2,
        successCount: 0,
        lastFailureTime: expect.any(Number),
        lastSuccessTime: expect.any(Number)
      });
    });

    test('should reset metrics on state transition to CLOSED', () => {
      breaker.failureCount = 5;
      breaker.successCount = 2;

      breaker.recordFailure();
      breaker.recordFailure();
      breaker.state = 'HALF_OPEN';
      breaker.recordSuccess();
      breaker.recordSuccess();

      const metrics = breaker.getMetrics();
      expect(metrics.failureCount).toBe(0);
      expect(metrics.successCount).toBe(0);
    });

    test('should track time spent in each state', () => {
      const startTime = Date.now();
      
      breaker.recordFailure();
      breaker.recordFailure();

      expect(breaker.state).toBe('OPEN');
      expect(breaker.stateChangedAt).toBeDefined();
    });
  });

  describe('Async Request Execution', () => {
    test('should execute successful request and close circuit', async () => {
      const mockRequest = jest.fn().mockResolvedValue({ status: 200, data: {} });
      
      breaker.state = 'HALF_OPEN';
      const result = await breaker.makeRequest(mockRequest);

      expect(mockRequest).toHaveBeenCalled();
      expect(result).toEqual({ status: 200, data: {} });
      expect(breaker.successCount).toBe(1);
    });

    test('should handle failed request and reopen circuit', async () => {
      const mockRequest = jest.fn().mockRejectedValue(new Error('Service error'));
      
      breaker.state = 'HALF_OPEN';
      
      await expect(breaker.makeRequest(mockRequest)).rejects.toThrow();
      expect(breaker.state).toBe('OPEN');
    });

    test('should reject request in OPEN state without calling service', async () => {
      const mockRequest = jest.fn();
      
      breaker.state = 'OPEN';
      breaker.nextAttempt = Date.now() + 1000;

      await expect(
        breaker.makeRequest(mockRequest)
      ).rejects.toThrow('Circuit breaker is OPEN');

      expect(mockRequest).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    test('should handle rapid consecutive failures', () => {
      for (let i = 0; i < 5; i++) {
        breaker.recordFailure();
      }

      expect(breaker.state).toBe('OPEN');
      expect(breaker.failureCount).toBe(2); // Capped at threshold
    });

    test('should handle rapid consecutive successes in HALF_OPEN', () => {
      breaker.state = 'HALF_OPEN';

      breaker.recordSuccess();
      breaker.recordSuccess();
      breaker.recordSuccess(); // Should not increment beyond threshold

      expect(breaker.state).toBe('CLOSED');
      expect(breaker.successCount).toBe(0);
    });

    test('should handle timeout updates correctly', () => {
      breaker.state = 'OPEN';
      const originalTimeout = breaker.nextAttempt;

      breaker.nextAttempt = Date.now() - 1000;
      expect(breaker.allowRequest()).toBe(true);
      expect(breaker.state).toBe('HALF_OPEN');
    });
  });
});

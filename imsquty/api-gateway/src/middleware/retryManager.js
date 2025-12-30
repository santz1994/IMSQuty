/**
 * Retry Logic with Exponential Backoff
 * Implements intelligent retry mechanism for transient failures
 */

class RetryManager {
  constructor(options = {}) {
    this.maxRetries = options.maxRetries || 3;
    this.baseDelay = options.baseDelay || 1000; // 1 second
    this.maxDelay = options.maxDelay || 30000; // 30 seconds
    this.backoffMultiplier = options.backoffMultiplier || 2;
    this.retryableStatusCodes = options.retryableStatusCodes || [408, 429, 500, 502, 503, 504];
  }

  /**
   * Determine if error is retryable
   */
  isRetryable(error) {
    // Network errors
    if (error.code === 'ECONNREFUSED' || 
        error.code === 'ECONNRESET' || 
        error.code === 'ETIMEDOUT') {
      return true;
    }

    // HTTP status codes
    if (error.status && this.retryableStatusCodes.includes(error.status)) {
      return true;
    }

    return false;
  }

  /**
   * Calculate delay with exponential backoff and jitter
   */
  getDelay(attemptNumber) {
    const exponentialDelay = this.baseDelay * Math.pow(this.backoffMultiplier, attemptNumber - 1);
    const delay = Math.min(exponentialDelay, this.maxDelay);
    
    // Add jitter (±10%) to prevent thundering herd
    const jitter = delay * 0.1 * (Math.random() * 2 - 1);
    return Math.max(0, delay + jitter);
  }

  /**
   * Sleep utility for async delays
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Execute function with retry logic
   */
  async execute(fn, context = 'request') {
    let lastError = null;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;

        if (!this.isRetryable(error)) {
          throw error; // Not retryable, fail immediately
        }

        if (attempt === this.maxRetries) {
          console.error(`[RetryManager] Max retries (${this.maxRetries}) reached for ${context}`);
          throw error; // All retries exhausted
        }

        const delay = this.getDelay(attempt);
        console.warn(
          `[RetryManager] Attempt ${attempt}/${this.maxRetries} failed for ${context}. ` +
          `Retrying in ${Math.round(delay)}ms. Error: ${error.message}`
        );
        
        await this.sleep(delay);
      }
    }

    throw lastError;
  }

  /**
   * Get retry statistics for monitoring
   */
  getStatistics() {
    return {
      maxRetries: this.maxRetries,
      baseDelay: this.baseDelay,
      maxDelay: this.maxDelay,
      backoffMultiplier: this.backoffMultiplier,
      retryableStatusCodes: this.retryableStatusCodes
    };
  }
}

module.exports = RetryManager;

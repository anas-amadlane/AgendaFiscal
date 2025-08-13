export class EmailValidationService {
  private static instance: EmailValidationService;
  private emailCache: Map<string, boolean> = new Map();
  private validationTimeouts: Map<string, NodeJS.Timeout> = new Map();
  private baseURL: string = 'http://localhost:3001/api/v1';

  static getInstance(): EmailValidationService {
    if (!EmailValidationService.instance) {
      EmailValidationService.instance = new EmailValidationService();
    }
    return EmailValidationService.instance;
  }

  async checkEmailExists(email: string): Promise<boolean> {
    // Clear any existing timeout for this email
    const existingTimeout = this.validationTimeouts.get(email);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Return cached result if available
    if (this.emailCache.has(email)) {
      return this.emailCache.get(email)!;
    }

    try {
      // Add a small delay to avoid too many requests
      await new Promise(resolve => {
        const timeout = setTimeout(resolve, 500);
        this.validationTimeouts.set(email, timeout);
      });

      console.log('Checking email:', email);
      const response = await fetch(`${this.baseURL}/auth/check-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      console.log('Email check response status:', response.status);

      if (response.status === 409) {
        // Email exists
        console.log('Email exists:', email);
        this.emailCache.set(email, true);
        return true;
      } else if (response.status === 200) {
        // Email doesn't exist
        console.log('Email available:', email);
        this.emailCache.set(email, false);
        return false;
      } else {
        // Error occurred, assume email doesn't exist to avoid blocking registration
        console.log('Email check error status:', response.status);
        return false;
      }
    } catch (error) {
      console.error('Email validation error:', error);
      // On error, assume email doesn't exist to avoid blocking registration
      return false;
    }
  }

  clearCache() {
    this.emailCache.clear();
  }

  clearCacheForEmail(email: string) {
    this.emailCache.delete(email);
  }
}

export default EmailValidationService.getInstance();

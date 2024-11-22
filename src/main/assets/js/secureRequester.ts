import * as fs from 'fs';
import * as https from 'https';
import * as path from 'path';

import axios, { AxiosResponse } from 'axios';

export class SecureRequester {
  private httpsAgent: https.Agent;
  private baseUrl: string;
  private certPath: string = path.resolve(__dirname, '../../resources/cert.pem');
  private privateKeyPath: string = path.resolve(__dirname, '../../resources/private.pem');
  private subscriptionKey: string = 'not-set';

  constructor(environment: string) {
    this.baseUrl = 'https://cft-mtls-api-mgmt-appgw.'+environment+'.platform.hmcts.net';
    this.setSubscriptionKey(environment);
    this.httpsAgent = new https.Agent({
      key: fs.readFileSync(this.privateKeyPath),
      cert: fs.readFileSync(this.certPath),
    });
  }

  setSubscriptionKey(environment: string): void {
    switch (environment) {
      case 'aat':
        this.subscriptionKey = process.env.aat_subscription_key || 'aat-not-set';
        console.log('AAT subscription key set');
        break;
      case 'demo':
        this.subscriptionKey = process.env.demo_subscription_key || 'demo-not-set';
        console.log('Demo subscription key set');
        break;
      default:
        this.subscriptionKey = 'default-not-set';
        console.error(`Invalid environment: ${environment}`);
        throw new Error('Environment must be either "aat" or "demo"');
    }
  }

  /**
   * Makes a GET request to the specified endpoint with mutual TLS authentication.
   * @param endpoint - The API endpoint to call (appended to the base URL).
   * @returns - A Promise that resolves to the response data.
   */
  async getRequest(endpoint: string): Promise<AxiosResponse | void> {
    try {
      const response = await axios.get(`${this.baseUrl}${endpoint}`, {
        headers: {
          'Ocp-Apim-Subscription-Key': this.subscriptionKey,
        },
        httpsAgent: this.httpsAgent,
      });
      return response;
    } catch (error) {
      console.error('Error making secure GET request:', error);
    }
  }
}


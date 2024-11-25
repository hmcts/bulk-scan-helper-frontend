import { readFileSync } from 'fs';
import { Agent } from 'https';
import { resolve } from 'path';

import axios, { AxiosResponse } from 'axios';

export class SecureRequester {
  private httpsAgent: Agent;
  private baseUrl: string;
  private subscriptionKey: string = 'not-set';

  constructor(environment: string) {
    this.baseUrl = 'https://cft-mtls-api-mgmt-appgw.'+environment+'.platform.hmcts.net';
    this.setSubscriptionKey(environment);
    this.httpsAgent = new Agent({
      key: readFileSync(resolve(__dirname, '../../resources/private.pem')),
      cert: readFileSync(resolve(__dirname, '../../resources/cert.pem')),
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
      case 'perftest':
        this.subscriptionKey = process.env.perftest_subscription_key || 'perftest-not-set';
        console.log('Perftest subscription key set');
        break;
      // For future use when ithc is set up
      // case 'ithc':
      //   this.subscriptionKey = process.env.ithc_subscription_key || 'ithc-not-set';
      //   console.log('ITHC subscription key set');
      //   break;
      default:
        this.subscriptionKey = 'default-not-set';
        console.error(`Invalid environment: ${environment}`);
        throw new Error('Environment must be set');
    }
  }

  /**
   * Makes a GET request to the specified endpoint with mutual TLS authentication.
   * @param endpoint - The API endpoint to call (appended to the base URL).
   * @returns - A Promise that resolves to the response data.
   */
  async getRequest(endpoint: string): Promise<AxiosResponse | null> {
    const response = await axios.get(`${this.baseUrl}${endpoint}`, {
      headers: { 'Ocp-Apim-Subscription-Key': this.subscriptionKey },
      httpsAgent: this.httpsAgent,
    }).catch(error => {
      console.error('Error making secure GET request:', error);
      return null;  // or a default value if needed
    });
    return response;
  }
}


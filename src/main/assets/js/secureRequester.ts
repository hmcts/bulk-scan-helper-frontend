import { readFileSync } from 'fs';
import { Agent } from 'https';
import { resolve } from 'path';

import axios, { AxiosResponse } from 'axios';
import config from 'config';

/**
 * A class that makes secure requests to the APIM.
 */
export class SecureRequester {
  private httpsAgent: Agent;
  private baseUrl: string;
  private subscriptionKey: string = 'not-set';

  /**
   * Creates a new SecureRequester instance.
   * @param environment
   */
  constructor(environment: string) {
    this.baseUrl = 'https://cft-mtls-api-mgmt-appgw.'+environment+'.platform.hmcts.net';
    this.setSubscriptionKey(environment);
    this.httpsAgent = new Agent({
      key: readFileSync(resolve(__dirname, '../../resources/private.pem')),
      cert: readFileSync(resolve(__dirname, '../../resources/cert.pem')),
    });
  }

  /**
   * Sets the subscription key for the specified environment.
   * @param environment
   */
  setSubscriptionKey(environment: string): void {
    const subscriptionKeyPath = `subscriptionKeys.${environment}`;
    console.log(`Checking for subscription key at path: ${subscriptionKeyPath}`);

    if (config.has(subscriptionKeyPath)) {
      this.subscriptionKey = config.get(subscriptionKeyPath);
      console.log(`${environment} subscription key set`);
    } else {
      this.subscriptionKey = `${environment}-not-set`;
      console.error(`Subscription key not found for environment: ${environment}`);
      throw new Error('Environment must be set and have a valid subscription key');
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


import { spawnSync } from 'child_process';

import * as propertiesVolume from '@hmcts/properties-volume';
import config from 'config';
import { Application } from 'express';
import { get, set } from 'lodash';

export class PropertiesVolume {
  private keyName: string = 'bulk-scan-team-cft-apim-subscription-key';

  enableFor(server: Application): void {
    if (server.locals.ENV !== 'development') {
      propertiesVolume.addTo(config);
    } else {
      this.setLocalSecret('reform-scan-aat', this.keyName, 'subscriptionKeys.aat');
      this.setLocalSecret('reform-scan-demo', this.keyName, 'subscriptionKeys.demo');
      this.setLocalSecret('reform-scan-perftest', this.keyName, 'subscriptionKeys.perftest');
      //this.setLocalSecret('reform-scan-ithc','bulk-scan-team-cft-apim-subscription-key', 'subscriptionKeys.ithc');
    }
  }

  private setSecret(fromPath: string, toPath: string): void {
    if (config.has(fromPath)) {
      set(config, toPath, get(config, fromPath));
    }
  }

  private setLocalSecret(vaultName: string, secret: string, toPath: string): void {
    // Load a secret from the vault (passed in) using azure cli
    const result = spawnSync('az', ['keyvault', 'secret', 'show', '--vault-name', vaultName, '-o', 'tsv', '--query', 'value', '--name', secret], { encoding: 'utf8' });
    set(config, toPath, encodeURI(result.stdout.replace('\n', '')));
  }
}

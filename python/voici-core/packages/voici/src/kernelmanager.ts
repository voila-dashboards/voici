import { PageConfig, URLExt } from '@jupyterlab/coreutils';
import { IKernelspecMetadata } from '@jupyterlab/nbformat';
import {
  Event,
  KernelSpec,
  ServerConnection,
  ServiceManager,
  Kernel,
} from '@jupyterlab/services';
import { IKernelSpecs } from '@jupyterlite/kernel';
import { JupyterLiteServer } from '@jupyterlite/server';
import { UUID } from '@lumino/coreutils';

import { Stream } from '@lumino/signaling';
/**
 * Mock the Event Manager for now
 */
class MockEventManager implements Event.IManager {
  constructor(options: { serverSettings: ServerConnection.ISettings }) {
    this._stream = new Stream(this);
    this._serverSettings = options.serverSettings;
  }

  async emit(event: Event.Request): Promise<void> {
    // no-op
  }

  dispose(): void {
    // no-op
  }

  get isDisposed(): boolean {
    return true;
  }

  get stream() {
    return this._stream;
  }

  get serverSettings(): ServerConnection.ISettings {
    return this._serverSettings;
  }

  private _stream: Stream<this, Event.Emission>;
  private _serverSettings: ServerConnection.ISettings;
}

export class VoiciKernelManager {
  constructor(options: { jupyterLiteServer: JupyterLiteServer }) {
    const remoteKernelConfig = PageConfig.getOption('remoteKernelConfig');
    if (remoteKernelConfig.length > 0) {
      this._remoteKernel = true;
      this._remoteKernelConfig = JSON.parse(remoteKernelConfig);
    } else {
      this._remoteKernel = false;
      this._jupyterLiteServer = options.jupyterLiteServer;
    }
  }

  async init(): Promise<void> {
    if (this._remoteKernel) {
      const serverSettings = ServerConnection.makeSettings(
        this._remoteKernelConfig!
      );
      this._serviceManager = new ServiceManager({
        standby: 'never',
        serverSettings,
        events: new MockEventManager({ serverSettings }),
      });
      await this._serviceManager.kernelspecs.ready;
      this._specModels = this._serviceManager.kernelspecs.specs;

      window.addEventListener('beforeunload', async (e) => {
        if (!this._startedKernel) {
          return;
        }

        const url = URLExt.join(
          this._remoteKernelConfig!.baseUrl,
          'api',
          'kernels',
          this._startedKernel.id
        );
        await fetch(url, {
          method: 'DELETE',
          keepalive: true,
        });
        this._startedKernel.dispose();
      });
    } else {
      const kernelSpecs = await this._jupyterLiteServer!.resolveRequiredService(
        IKernelSpecs
      );
      this._serviceManager = this._jupyterLiteServer!.serviceManager;
      this._specModels = kernelSpecs.specs;
    }
  }

  async ready(): Promise<boolean> {
    if (!this._serviceManager) {
      console.error('Missing service manager');
      return false;
    }
    await this._serviceManager.ready;
    await this._serviceManager.sessions.ready;
    return true;
  }

  get serviceManager(): ServiceManager | undefined {
    return this._serviceManager;
  }

  async connectKernel(
    requestedKernelspec: IKernelspecMetadata
  ): Promise<Kernel.IKernelConnection | undefined | null> {
    if (!this._serviceManager) {
      return;
    }
    const specs = this._specModels?.kernelspecs;
    let spec;
    if (!specs) {
      console.error('No kernel available');
      return;
    }
    if (requestedKernelspec.name in specs) {
      console.log(`${requestedKernelspec.name} kernel is available!`);
      spec = specs[requestedKernelspec.name];
    }
    // Otherwise fallback to trying to find an available kernel for that language
    else {
      for (const name in specs) {
        if (requestedKernelspec.language === specs[name]?.language) {
          console.log(
            `${requestedKernelspec.name} kernel is not available, fallback to using ${specs[name]?.name}`
          );
          spec = specs[name];
          break;
        }
      }
    }

    if (!spec) {
      console.error(`No kernel available for ${requestedKernelspec.language}`);
      return;
    }
    const sessionManager = this._serviceManager.sessions;
    const connection = await sessionManager.startNew({
      // TODO Get these name and path information from the exporter
      name: UUID.uuid4(),
      path: UUID.uuid4(),
      type: 'notebook',
      kernel: spec,
    });
    this._startedKernel = connection.kernel;

    return this._startedKernel;
  }
  private _serviceManager: ServiceManager | undefined;
  private _remoteKernel: boolean;
  private _specModels: KernelSpec.ISpecModels | undefined | null;
  private _jupyterLiteServer: JupyterLiteServer | undefined;
  private _remoteKernelConfig: { baseUrl: string; wsUrl: string } | undefined;
  private _startedKernel: Kernel.IKernelConnection | null = null;
}

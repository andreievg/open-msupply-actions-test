import {
  app,
  BrowserWindow,
  dialog,
  ipcMain,
  Menu,
  MenuItemConstructorOptions,
  shell,
  webContents,
} from 'electron';
import dnssd from 'dnssd';
import { IPC_MESSAGES } from './shared';
import { address as getIpAddress, isV4Format } from 'ip';
import {
  FrontEndHost,
  frontEndHostUrl,
  isProtocol,
  BarcodeScanner,
  ScannerType,
  ConnectionResult,
} from '@openmsupply-client/common/src/hooks/useNativeClient';
import HID from 'node-hid';
import ElectronStore from 'electron-store';
import { KeyboardScanner } from './keyboardScanner/keyboardScanner';
import https from 'https';
import http from 'http';
import defaultTranslations from '../../common/src/intl/locales/en/desktop.json';

// We'll lazy load, once we have the locale available
const importDesktopTranslations = async (locale: string) =>
  import(`../../common/src/intl/locales/${locale}/desktop.json`);

const SERVICE_TYPE = 'omsupply';
const PROTOCOL_KEY = 'protocol';
const CLIENT_VERSION_KEY = 'client_version';
const HARDWARE_ID_KEY = 'hardware_id';
const BARCODE_SCANNER_DEVICE_KEY = 'barcode_scanner_device';
const SCANNER_TYPE = 'scanner_type';
const DEVICE_CLOSE_DELAY = 5000;
const OMSUPPLY_BARCODE =
  '19,16,3,0,111,112,101,110,32,109,83,117,112,112,108,121,0,24,11';

class Scanner {
  device: HID.HID | undefined;
  barcodeScanner: BarcodeScanner | undefined;
  window: BrowserWindow;

  constructor(window: BrowserWindow) {
    this.device = this.findDevice();
    this.window = window;
    const storedScanner = store.get(BARCODE_SCANNER_DEVICE_KEY, null);
    this.barcodeScanner = !storedScanner
      ? undefined
      : { ...JSON.parse(storedScanner), connected: false };
  }

  private findDevice() {
    if (this.barcodeScanner) {
      try {
        const hid = new HID.HID(
          this.barcodeScanner.vendorId,
          this.barcodeScanner.productId
        );
        this.barcodeScanner.connected = true;
        return hid;
      } catch (e) {
        console.error(e);
      }
    }
  }

  scanDevices(window: BrowserWindow) {
    const devices: BarcodeScanner[] = [];
    // if a scanner is already connected, we'll need to close it in order to open it
    if (this.device) {
      this.device?.close();
    }

    HID.devices().forEach(device => {
      devices.push({ ...device, connected: false });
      if (device.path) {
        try {
          const hid = new HID.HID(device.vendorId, device.productId);

          // close the devices after a delay
          const timeout = setTimeout(() => {
            try {
              hid.close();
            } catch {}
          }, DEVICE_CLOSE_DELAY);

          hid.on('data', data => {
            if (typeof data !== 'object') return;
            if (!Buffer.isBuffer(data)) return;

            const valid = data.subarray(0, 19).join(',') === OMSUPPLY_BARCODE;

            if (valid) {
              const scanner = { ...device, connected: true };
              store.set(BARCODE_SCANNER_DEVICE_KEY, JSON.stringify(scanner));
              window.webContents.send(IPC_MESSAGES.ON_DEVICE_MATCHED, scanner);
              clearTimeout(timeout);
              this.device = hid;
              this.barcodeScanner = scanner;
            }
          });
        } catch (e) {
          // keyboard devices are unable to be opened and will throw an error
          console.error(e);
        }
      }
    });
  }

  start() {
    if (!this.device) throw new Error('No scanners found');
    this.device?.on('data', data => {
      this.window.webContents.send(IPC_MESSAGES.ON_BARCODE_SCAN, data);
    });
  }

  stop() {
    try {
      this.device?.close();
      this.device = this.findDevice();
    } catch {}
  }

  linkedScanner() {
    return this.barcodeScanner;
  }
}

// the typescript typing for ElectronStore now requires us to build as ESM modules
// in order to get the ts defs for 'conf' which gives the get/set/clear methods
// because we aren't building ESM, have manually typed the class
const store = new ElectronStore() as unknown as {
  clear: () => void;
  get: (key: string, defaultValue: string | null) => string | null;
  set: (key: string, value: string | null) => void;
};

const discovery = new dnssd.Browser(dnssd.tcp(SERVICE_TYPE));

let connectedServer: FrontEndHost | null = null;
let discoveredServers: FrontEndHost[] = [];
let hasLoadingError = false;

// This allows TypeScript to pick up the magic constant that's auto-generated by Forge's Webpack
// plugin that tells the Electron app where to look for the Webpack-bundled app code (depending on
// whether you're running in development or production).
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

const getDebugHost = () => {
  const { ELECTRON_HOST } = process.env;
  return (typeof ELECTRON_HOST !== 'undefined' && ELECTRON_HOST) || '';
};

// Can debug by opening chrome chrome://inspect and open inspect under 'devices'
const START_URL = getDebugHost()
  ? `${getDebugHost()}/discovery`
  : MAIN_WINDOW_WEBPACK_ENTRY;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  // eslint-disable-line global-require
  app.quit();
}

// run a check to see if the server is available before attempting to connect
const tryToConnectToServer = (window: BrowserWindow, server: FrontEndHost) => {
  return new Promise<ConnectionResult>(resolve => {
    const lib = server.protocol === 'https' ? https : http;
    const options = {
      rejectUnauthorized: false,
    };
    const request = lib.get(frontEndHostUrl(server), options, response => {
      if (response.statusCode === 200) {
        connectToServer(window, server);
        resolve({ success: true });
      }
      resolve({ success: false, error: `Status: ${response.statusMessage}` });
    });
    // handle the error to prevent an alert in the desktop app
    request.on('error', e => {
      console.error('Error received connecting to server:', e);
      resolve({ success: false, error: e.message });
    });
  });
};

const connectToServer = (window: BrowserWindow, server: FrontEndHost) => {
  // translate loopback addresses to allow for clients, such as CCA to connect
  // to the API by IP address
  if (server.isLocal && isLoopback(server.ip)) {
    server.ip = getIpAddress('public');
  }
  discovery.stop();
  connectedServer = server;

  const url = getDebugHost() || frontEndHostUrl(server);
  window.loadURL(url);
};

const start = (): void => {
  // Create the browser window.
  const window = new BrowserWindow({
    height: 800,
    width: 1200,
    minWidth: 800,
    minHeight: 768,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });

  // Not using i18next here, as that needs more of the app to be initialised
  // than we have available at this point. We also don't need all the translations,
  // just the desktop ones, so we can import them directly.

  const appLocale = app.getLocale();

  // See if we have translations for the system language
  importDesktopTranslations(appLocale)
    // Some locales are in the format of 'fr-DJ', check if we have translations for the base (fr)
    .catch(() => importDesktopTranslations(appLocale.split('-')[0] ?? ''))
    .catch(() => {}) // swallow error, use default translations
    .then(translations => {
      // Merge the translations with the default translations
      const mergedTranslations = {
        ...defaultTranslations,
        ...translations,
      };
      // Configure app menus once we have translations available
      configureMenus(window, mergedTranslations);
    });

  // and load discovery (with autoconnect=true by default)
  window.loadURL(START_URL);

  ipcMain.on(IPC_MESSAGES.START_SERVER_DISCOVERY, () => {
    discovery.stop();
    discoveredServers = [];
    discovery.start();
  });

  ipcMain.on(IPC_MESSAGES.GO_BACK_TO_DISCOVERY, () => {
    window.loadURL(`${START_URL}?autoconnect=false`);
  });

  ipcMain.handle(
    IPC_MESSAGES.CONNECT_TO_SERVER,
    async (_event, server: FrontEndHost) => tryToConnectToServer(window, server)
  );

  ipcMain.handle(IPC_MESSAGES.CONNECTED_SERVER, async () => connectedServer);

  ipcMain.handle(IPC_MESSAGES.DISCOVERED_SERVERS, async () => {
    const servers = discoveredServers;
    discoveredServers = [];
    return { servers };
  });

  // BARCODES
  const serialScanner = new Scanner(window);
  const keyboardScanner = new KeyboardScanner(window);
  const getCurrentScanner = () =>
    store.get(SCANNER_TYPE, 'usb_serial') == 'usb_serial'
      ? serialScanner
      : keyboardScanner;

  ipcMain.on(
    IPC_MESSAGES.SET_SCANNER_TYPE,
    (_event, scannerType: ScannerType) => store.set(SCANNER_TYPE, scannerType)
  );
  ipcMain.handle(IPC_MESSAGES.LINKED_BARCODE_SCANNER_DEVICE, async () =>
    getCurrentScanner().linkedScanner()
  );
  ipcMain.handle(IPC_MESSAGES.START_BARCODE_SCAN, () =>
    getCurrentScanner().start()
  );
  ipcMain.handle(IPC_MESSAGES.STOP_BARCODE_SCAN, () =>
    getCurrentScanner().stop()
  );
  ipcMain.handle(IPC_MESSAGES.START_DEVICE_SCAN, () =>
    serialScanner.scanDevices(window)
  );
  ipcMain.handle(IPC_MESSAGES.GET_SCANNER_TYPE, async () =>
    store.get(SCANNER_TYPE, 'usb_serial')
  );

  // not currently implemented in the desktop implementation
  ipcMain.on(IPC_MESSAGES.READ_LOG, () => 'Not implemented');
  ipcMain.handle(IPC_MESSAGES.SAVE_FILE, async () => ({
    success: false,
    error: 'Not implemented',
  }));

  discovery.on('serviceUp', function ({ type, port, addresses, txt }) {
    if (type?.name !== SERVICE_TYPE) return;
    if (typeof txt != 'object') return;

    const protocol = txt[PROTOCOL_KEY];
    const clientVersion = txt[CLIENT_VERSION_KEY];
    const hardwareId = txt[HARDWARE_ID_KEY];

    if (!isProtocol(protocol)) return;
    if (!(typeof clientVersion === 'string')) return;
    if (!(typeof hardwareId === 'string')) return;

    const ip = addresses.find(isV4Format);
    if (!ip) return;

    discoveredServers.push({
      port,
      protocol,
      ip,
      clientVersion: clientVersion || '',
      isLocal: ip === getIpAddress() || isLoopback(ip),
      hardwareId,
    });
  });

  window.webContents.on(
    'did-fail-load',
    (_event, _errorCode, errorDescription, validatedURL) => {
      // not strictly necessary, done to prevent an infinite loop if the loadFile fails
      if (hasLoadingError) return;

      hasLoadingError = true;
      window.loadURL(
        `${START_URL}#/error?error=Failed to load URL ${validatedURL} with error: ${errorDescription}`
      );
    }
  );
};

const isLoopback = (ip: string) =>
  ip === '127.0.0.1' ||
  ip.toLowerCase() === 'localhost' ||
  ip.toLowerCase() === '::1';

app.on('ready', start);

app.on('window-all-closed', () => {
  app.quit();
});

process.on('uncaughtException', error => {
  // See comment below
  if (error.message.includes('[this.constructor.name] is not a constructor')) {
    return;
  }

  // When running the barcode scanner discovery on windows, you can get this error which we want to ignore
  if (error.message === 'could not read from HID device') return;

  // TODO bugsnag ?
  dialog.showErrorBox('Error', error.stack || error.message);

  // The following error sometime occurs, it's dnssd related, it doesn't stop or break discovery, electron catching it and displays in error message, it's ignored by above if condition

  /* Uncaught Exception:
      TypeError: e[this.constructor.name] is not a constructor
      at t.value (..open mSupply-darwin-arm64/open mSupply.app/Contents/Resources/app/.webpack/main/index.js:8:77453)
      at ..open mSupply-darwin-arm64/open mSupply.app/Contents/Resources/app/.webpack/main/index.js:8:49749
      at Array.reduce (<anonymous>)
      at t.value (..open mSupply-darwin-arm64/open mSupply.app/Contents/Resources/app/.webpack/main/index.js:8:49606)
      at t.value (..open mSupply-darwin-arm64/open mSupply.app/Contents/Resources/app/.webpack/main/index.js:8:49025)
      at ..open mSupply.app/Contents/Resources/app/.webpack/main/index.js:8:104855
      at Array.forEach (<anonymous>)
      at t.value (..open mSupply-darwin-arm64/open mSupply.app/Contents/Resources/app/.webpack/main/index.js:8:104807)
      at t.value (..open mSupply-darwin-arm64/open mSupply.app/Contents/Resources/app/.webpack/main/index.js:8:104661)
      at t.enter (..open mSupply-darwin-arm64/open mSupply.app/Contents/Resources/app/.webpack/main/index.js:8:99043)
 */
});

app.addListener(
  'certificate-error',
  async (event, _webContents, url, error, certificate, callback) => {
    // We are only handling self signed certificate errors
    if (
      error != 'net::ERR_CERT_INVALID' &&
      error != 'net::ERR_CERT_AUTHORITY_INVALID'
    ) {
      return callback(false);
    }

    // Ignore SSL checks in debug mode
    if (getDebugHost()) {
      event.preventDefault();
      return callback(true);
    }

    // Default behaviour if not connected to a server or if url is not connectedServer

    if (!connectedServer) return callback(false);

    if (!url.startsWith(frontEndHostUrl(connectedServer))) {
      return callback(false);
    }

    // Match SSL fingerprint for server stored in app data

    // Match by hardware id and port
    const identifier = `${connectedServer.hardwareId}-${connectedServer.port}`;
    let storedFingerprint = store.get(identifier, null);

    // If fingerprint does not exists for server add it
    if (!storedFingerprint) {
      storedFingerprint = certificate.fingerprint;
      store.set(identifier, storedFingerprint);
      // If fingerprint does not match
    } else if (storedFingerprint != certificate.fingerprint) {
      // Display error message and go back to discovery
      const returnValue = await dialog.showMessageBox({
        type: 'warning',
        buttons: ['No', 'Yes'],
        title: 'SSL Error',
        message:
          'The security certificate on the server has changed!\r\n\r\nThis can happen when the server is reinstalled, so may be normal, but please check with your IT department if you are unsure.\r\n\r\nWould you like to accept the new certificate? ',
      });

      if (returnValue.response === 0) {
        ipcMain.emit(IPC_MESSAGES.GO_BACK_TO_DISCOVERY);
        return callback(false);
      }

      // Update stored fingerprint
      storedFingerprint = certificate.fingerprint;
      store.set(identifier, storedFingerprint);
    }

    // storedFingerprint did not exist or it matched certificate fingerprint
    event.preventDefault();
    return callback(true);
  }
);

function configureMenus(
  window: BrowserWindow,
  translations: Record<keyof typeof defaultTranslations, string>
) {
  const t = (key: keyof typeof defaultTranslations) => translations[key] || key;

  // add a context menu which shows when the user right clicks
  window.webContents.on('context-menu', (_event, params) => {
    // Electron _should_ localise based on the roles... alas, at least for mac os: https://github.com/electron/electron/issues/26231
    const template: Electron.MenuItemConstructorOptions[] = [
      { role: 'cut', label: t('cut') },
      { role: 'copy', label: t('copy') },
      { role: 'paste', label: t('paste') },
      { role: 'selectAll', label: t('select-all') },
      { type: 'separator' },
      { role: 'reload', label: t('reload') },
    ];
    const menu = Menu.buildFromTemplate(template);
    menu.popup({ window, x: params.x, y: params.y });
  });

  const fileMenu: MenuItemConstructorOptions = {
    label: t('file'),
    submenu: [{ role: 'quit' }],
  };

  const helpMenu: MenuItemConstructorOptions = {
    label: t('help'),
    role: 'help',
    submenu: [
      {
        label: t('documentation'),
        click: async () => {
          await shell.openExternal(
            'https://docs.msupply.foundation/docs/introduction/introduction/'
          );
        },
      },
      {
        label: t('clear-data'),
        click: () => {
          dialog
            .showMessageBox({
              type: 'question',
              title: t('confirmation'),
              message: t('clear-data-confirm-message'),
              buttons: [t('yes'), t('no')],
            })
            .then(result => {
              // Bail if the user pressed "No" or escaped (ESC) from the dialog box
              if (result.response !== 0) {
                return;
              }
              store.clear();
              const contents = webContents.getFocusedWebContents();
              if (contents) {
                contents.executeJavaScript(`localStorage.clear();`);
              }
              app.exit();
            });
        },
      },
      {
        label: t('developer-tools'),
        click: () => {
          const contents = webContents.getFocusedWebContents();
          if (contents) {
            contents.openDevTools();
          }
        },
      },
      { role: 'about', label: t('about-oms') },
    ],
  };

  const menu = Menu.buildFromTemplate([fileMenu, helpMenu]);

  Menu.setApplicationMenu(menu);
}

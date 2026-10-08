// ============================================================================
// موجّه - Mowajjih Shared Types & Interfaces
// ============================================================================

export interface DeviceItem {
  id: string;
  name: string;
  customName?: string;
  ip: string;
  mac: string;
  connectionType: 'wifi' | 'lan' | 'unknown';
  vendor?: string;
  leaseTime?: string;
  isCurrentDevice?: boolean;
}

export interface SmsMessage {
  id: string;
  sender: string;
  content: string;
  date: string;
  isUnread?: boolean;
}

export interface CommandItem {
  id: string;
  title: string;
  desc?: string;
  icon: string;
  cat: string;
  action: () => void;
}

export interface StatusData {
  connected: boolean;
  message?: string;
  routerIp?: string;
  networkType?: string;
  provider?: string;
  band?: string;
  wanIp?: string;
  apn?: string;
  caStatus?: string;
  caDetails?: Array<{ band?: string; pci?: string; freq?: string }>;
  signalPercent?: number;
  metrics4G?: {
    rsrp?: string;
    rsrq?: string;
    rssi?: string;
    snr?: string;
    pci?: string;
    earfcn?: string;
    bw?: string;
  };
  metrics5G?: {
    rsrp?: string;
    sinr?: string;
    pci?: string;
    earfcn?: string;
    actionBand?: string;
  };
  speedDown?: string;
  speedUp?: string;
  connectedDevicesCount?: number;
  wifiStatus?: string;
  wifiSsid?: string;
  lastUpdated?: string;
}

export interface HostNetworkInfo {
  hostname: string;
  localIp: string;
  localMac: string;
  platform?: string;
}

export interface AdvancedRouterSettings {
  sleepMode: string;
  sleepStartHour: string;
  sleepEndHour: string;
  wifiWakeup: boolean;
  routerIp: string;
  subnetMask: string;
  dhcpEnabled: boolean;
  dhcpStartIp: string;
  dhcpEndIp: string;
  dhcpLeaseTime: string;
  mtu: string;
  mss: string;
  dmzEnabled: boolean;
  dmzIp: string;
  upnpEnabled: boolean;
  portFilterEnabled: boolean;
  urlFilterEnabled: boolean;
  autoCheckUpdate: boolean;
  roamingUpdate: boolean;
  lastUpdateCheck: string;
  firmwareVersion: string;
  sntpServer: string;
  scheduledRebootEnabled: boolean;
  scheduledRebootDay: string;
  scheduledRebootTime: string;
}

export interface MowajjihApi {
  getBridgePort: () => Promise<number>;
  checkBridge: () => Promise<any>;
  getCurrentHostInfo: (routerIp?: string) => Promise<HostNetworkInfo>;
  pingRouter: (routerIp?: string) => Promise<{ online: boolean; latencyMs: number; timeout?: boolean }>;
  connectRouter: (data: { routerIp: string; password: string }) => Promise<any>;
  disconnectRouter: () => Promise<any>;
  getStatus: () => Promise<any>;
  getDevices: () => Promise<{ success: boolean; data: any[]; hostInfo?: any }>;
  scanNetwork: () => Promise<{ success: boolean; data: any[]; hostInfo?: any }>;
  saveDeviceAlias: (data: { mac: string; alias: string }) => Promise<any>;
  getWifi: () => Promise<any>;
  getNetworkSettings: () => Promise<any>;
  setNetworkMode: (mode: string) => Promise<any>;
  set5gBands: (bands: string[]) => Promise<any>;
  set4gBands: (params: { bands: string[]; isAuto?: boolean }) => Promise<any>;
  setCellLock: (params: { pci: string; earfcn: string; clear?: boolean }) => Promise<any>;
  setWifiSettings: (settings: { ssid?: string; password?: string; hideSsid?: boolean; enabled?: boolean }) => Promise<any>;
  setWanConnection: (connect: boolean) => Promise<any>;
  getSms: () => Promise<any>;
  deleteSms: (id: string) => Promise<any>;
  rebootRouter: () => Promise<any>;
  getAdvancedSettings: () => Promise<{ success: boolean; data: AdvancedRouterSettings }>;
  saveAdvancedSettings: (section: string, data: any) => Promise<{ success: boolean; message: string }>;
  checkFirmwareUpdate: () => Promise<{ success: boolean; message: string; isLatest?: boolean }>;
  factoryResetRouter: () => Promise<{ success: boolean; message: string }>;
  runPingDiagnostic: (host: string) => Promise<{ success: boolean; host: string; latencyMs: number; output: string }>;
  saveNonSensitiveConfig: (cfg: any) => Promise<boolean>;
  loadNonSensitiveConfig: () => Promise<any>;
  openExternal: (url: string) => Promise<boolean>;
}

declare global {
  interface Window {
    mowajjih: MowajjihApi;
  }
}

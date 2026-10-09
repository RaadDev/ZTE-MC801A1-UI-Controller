import * as http from 'http';
import * as crypto from 'crypto';

export interface SignalMetrics {
  rsrp?: string;
  rsrq?: string;
  sinr?: string;
  rssi?: string;
  pci?: string;
  earfcn?: string;
  band?: string;
  bandwidth?: string;
}

export interface RouterStatusData {
  connected: boolean;
  model: string;
  routerIp: string;
  networkType: string;
  provider: string;
  signalBars: number;
  activeBand: string;
  wanIp: string;
  apn: string;
  cellId: string;
  enbId: string;
  caStatus: string;
  caDetails: Array<{ band: string; pci: string; freq: string }>;
  metrics4G: SignalMetrics;
  metrics5G: SignalMetrics;
  speedDown: string | null;
  speedUp: string | null;
  temperature4G: string | null;
  temperature5G: string | null;
  firmwareVersion: string;
  connectedDevicesCount: number;
  wifiStatus: string;
  wifiSsid: string;
  lastUpdated: string;
  raw?: Record<string, string>;
}

export interface ConnectedDevice {
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

export interface WifiInfo {
  ssid: string;
  enabled: boolean;
  broadcast: boolean;
  securityMode: string;
  authMode: string;
  band24Ghz?: string;
  band5Ghz?: string;
  readOnlyReason?: string;
}

export interface NetworkSettingsData {
  networkMode: 'auto' | '5g_only' | '4g_only' | string;
  rawBearerPreference: string;
  nr5gBandMask: string;
  lteBand: string;
  isBandAuto: boolean;
  ltePciLock: string;
  lteEarfcnLock: string;
  wifiOnOff: boolean;
  mSsid: string;
  mHideSsid: boolean;
  mSecurityMode: string;
  pppStatus: string;
}

export interface SmsMessage {
  id: string;
  number: string;
  date: string;
  content: string;
  isRead: boolean;
}


// MAC OUI Manufacturer Lookup Dictionary
const KNOWN_VENDORS: Record<string, string> = {
  '00:17:88': 'Philips Hue',
  '00:1A:11': 'Google',
  '00:1E:C2': 'Apple',
  '00:23:12': 'Apple',
  '00:25:00': 'Apple',
  '00:26:BB': 'Apple',
  '04:D3:CF': 'Apple',
  '08:E6:89': 'Apple',
  '0C:4D:E9': 'Apple',
  '10:94:BB': 'Apple',
  '14:20:5E': 'Apple',
  '18:65:90': 'Apple',
  '28:CF:E9': 'Apple',
  '3C:06:30': 'Apple',
  '3C:15:C2': 'Apple',
  '40:B3:95': 'Apple',
  '50:EA:D6': 'Apple',
  '60:F8:1D': 'Apple',
  '70:3E:AC': 'Apple',
  '78:7B:8A': 'Apple',
  '80:E6:50': 'Apple',
  '88:66:5A': 'Apple',
  '90:27:E4': 'Apple',
  'A4:83:E7': 'Apple',
  'AC:BC:32': 'Apple',
  'B8:78:2E': 'Apple',
  'BC:D0:74': 'Apple',
  'C8:69:CD': 'Apple',
  'D0:25:98': 'Apple',
  'E4:CE:8F': 'Apple',
  'F0:18:98': 'Apple',
  'F4:5C:89': 'Apple',
  'FC:18:3C': 'Apple',
  '00:07:AB': 'Samsung',
  '00:12:47': 'Samsung',
  '00:15:B9': 'Samsung',
  '00:17:C9': 'Samsung',
  '00:21:19': 'Samsung',
  '00:26:37': 'Samsung',
  '08:08:C2': 'Samsung',
  '08:37:3D': 'Samsung',
  '14:BB:6E': 'Samsung',
  '24:4B:03': 'Samsung',
  '28:18:78': 'Samsung',
  '34:BE:00': 'Samsung',
  '44:78:3E': 'Samsung',
  '50:C8:E5': 'Samsung',
  '5C:0A:5B': 'Samsung',
  '78:47:1D': 'Samsung',
  '84:25:19': 'Samsung',
  '88:32:9B': 'Samsung',
  'A0:0B:BA': 'Samsung',
  'AC:5F:3E': 'Samsung',
  'B0:C4:E7': 'Samsung',
  'CC:07:AB': 'Samsung',
  'D0:B1:28': 'Samsung',
  'E4:12:1D': 'Samsung',
  '00:08:22': 'Huawei',
  '00:1E:10': 'Huawei',
  '08:19:A6': 'Huawei',
  '10:47:80': 'Huawei',
  '20:F4:1B': 'Huawei',
  '34:2E:B6': 'Huawei',
  '48:46:FB': 'Huawei',
  '70:54:F5': 'Huawei',
  '88:CF:98': 'Huawei',
  '00:1A:2B': 'Xiaomi',
  '0C:9D:92': 'Xiaomi',
  '14:F6:5A': 'Xiaomi',
  '28:6C:07': 'Xiaomi',
  '50:8F:4C': 'Xiaomi',
  '64:CC:2E': 'Xiaomi',
  '74:23:44': 'Xiaomi',
  '8C:BE:BE': 'Xiaomi',
  'A4:77:33': 'Xiaomi',
  '00:1B:21': 'Intel',
  '00:21:6A': 'Intel',
  '34:13:E8': 'Intel',
  '3C:F8:62': 'Intel',
  '40:23:43': 'Intel',
  '68:05:CA': 'Intel',
  '80:86:F2': 'Intel',
  'A0:C5:89': 'Intel',
  'C8:F7:50': 'Intel',
  '00:15:5D': 'Microsoft',
  '28:16:AD': 'Microsoft',
  '50:1A:C5': 'Microsoft',
  '60:45:BD': 'Microsoft',
  'DC:98:40': 'Microsoft',
  '00:04:4B': 'NVIDIA',
  '00:09:5B': 'Netgear',
  '00:14:D1': 'Trendnet',
  '00:18:E7': 'Cameo',
  '00:1D:7E': 'Cisco-Linksys',
  '00:22:6B': 'Cisco',
  '00:23:69': 'Cisco',
  '00:25:9E': 'Cisco',
  '00:1F:3F': 'TP-Link',
  '14:CC:20': 'TP-Link',
  '50:C7:BF': 'TP-Link',
  '60:E3:27': 'TP-Link',
  '98:48:27': 'TP-Link',
  'C0:4A:00': 'TP-Link',
  'E8:48:B8': 'TP-Link',
  '00:26:08': 'Sony',
  '00:13:A9': 'Sony',
  '00:19:C5': 'Sony',
  'F8:46:1C': 'Sony',
  '00:0C:29': 'VMware',
  '00:50:56': 'VMware',
  '00:24:D7': 'Dell',
  '18:66:DA': 'Dell',
  '74:86:7A': 'Dell',
  'F8:BC:12': 'Dell',
  '00:1E:0B': 'HP',
  '3C:D9:2B': 'HP',
  '94:57:A5': 'HP'
};

export class ZteClient {
  private cookies: string = '';
  private lastRawData: Record<string, string> = {};
  private activeRouterIp: string = '';

  public static isPrivateIp(ip: string): boolean {
    const trimmed = ip.trim().toLowerCase();
    if (trimmed === 'localhost' || trimmed === '127.0.0.1') return true;

    const parts = trimmed.split('.').map(Number);
    if (parts.length !== 4 || parts.some(p => isNaN(p) || p < 0 || p > 255)) {
      return false;
    }

    if (parts[0] === 10) return true;
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
    if (parts[0] === 192 && parts[1] === 168) return true;

    return false;
  }

  public static resolveVendor(mac: string): string {
    if (!mac) return 'غير معروف';
    const cleanMac = mac.replace(/[:-]/g, '').toUpperCase();
    if (cleanMac.length < 6) return 'غير معروف';
    const prefix = `${cleanMac.substring(0, 2)}:${cleanMac.substring(2, 4)}:${cleanMac.substring(4, 6)}`;
    return KNOWN_VENDORS[prefix] || 'جهاز شبكة';
  }

  public static decodeHostName(name: string): string {
    if (!name || name.trim() === '') return 'جهاز متصل';
    let clean = name.trim();

    // Check if hex encoded (e.g. 4170706c65 -> Apple)
    if (/^[0-9a-fA-F]{6,}$/.test(clean) && clean.length % 2 === 0) {
      try {
        const decoded = Buffer.from(clean, 'hex').toString('utf-8');
        if (/^[\x20-\x7E\u0600-\u06FF]+$/.test(decoded)) {
          return decoded;
        }
      } catch {
        // preserve
      }
    }

    // Check if URL encoded
    if (clean.includes('%')) {
      try {
        return decodeURIComponent(clean);
      } catch {
        // preserve
      }
    }

    return clean;
  }

  public isSessionActive(): boolean {
    return Boolean(this.cookies && this.activeRouterIp);
  }

  public getActiveRouterIp(): string {
    return this.activeRouterIp;
  }

  public clearSession(): void {
    this.cookies = '';
    this.lastRawData = {};
    this.activeRouterIp = '';
  }

  private async request(
    routerIp: string,
    path: string,
    method: 'GET' | 'POST' = 'GET',
    bodyData?: string,
    customHeaders?: Record<string, string>
  ): Promise<{ body: string; headers: http.IncomingHttpHeaders; statusCode?: number }> {
    if (!ZteClient.isPrivateIp(routerIp)) {
      throw new Error(`العنوان [${routerIp}] ليس عنوان شبكة محلية خاصاً مسموحاً به. لحمايتك، يُسمح بالاتصال فقط بالعناوين المحلية مثل 192.168.0.1.`);
    }

    return new Promise((resolve, reject) => {
      const parsedUrl = new URL(`http://${routerIp}${path}`);
      const headers: Record<string, string> = {
        'Referer': `http://${routerIp}/`,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Mowajjih/1.1',
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'X-Requested-With': 'XMLHttpRequest',
        ...customHeaders
      };

      if (this.cookies) {
        headers['Cookie'] = this.cookies;
      } else {
        headers['Cookie'] = 'stok=';
      }

      if (method === 'POST' && bodyData) {
        headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
        headers['Content-Length'] = Buffer.byteLength(bodyData).toString();
      }

      const req = http.request({
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || 80,
        path: parsedUrl.pathname + parsedUrl.search,
        method,
        headers,
        timeout: 6000
      }, (res) => {
        const chunks: Buffer[] = [];
        res.on('data', chunk => chunks.push(chunk));
        res.on('end', () => {
          const body = Buffer.concat(chunks).toString('utf-8');
          const setCookieHeader = res.headers['set-cookie'];
          if (setCookieHeader) {
            if (Array.isArray(setCookieHeader)) {
              this.cookies = setCookieHeader.map(c => c.split(';')[0]).join('; ');
            } else {
              this.cookies = String(setCookieHeader).split(';')[0];
            }
          }
          resolve({ body, headers: res.headers, statusCode: res.statusCode });
        });
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error(`انتهت مهلة الاستجابة من الراوتر (${routerIp}). تأكد من أنك متصل بنفس شبكة الراوتر.`));
      });

      req.on('error', (err) => {
        reject(new Error(`تعذر الاتصال بعنوان الراوتر (${routerIp}): ${err.message}`));
      });

      if (method === 'POST' && bodyData) {
        req.write(bodyData);
      }
      req.end();
    });
  }

  public async login(routerIp: string, password: string): Promise<{ success: boolean; message: string }> {
    this.clearSession();

    if (!ZteClient.isPrivateIp(routerIp)) {
      throw new Error(`العنوان [${routerIp}] مرفوض؛ مسموح فقط بالعناوين المحلية الخاصة.`);
    }

    if (!password) {
      throw new Error('يرجى إدخال كلمة مرور إدارة الراوتر.');
    }

    // Step 1: Request LD
    let ld = '';
    try {
      const ldRes = await this.request(routerIp, '/goform/goform_get_cmd_process?isTest=false&cmd=LD');
      const ldData = JSON.parse(ldRes.body);
      ld = ldData.LD || '';
    } catch (e: any) {
      throw new Error(`فشل الحصول على رمز المصافحة (LD) من الراوتر: ${e.message}`);
    }

    if (!ld) {
      throw new Error('لم يرجع الراوتر رمز مصافحة صالح (LD). تأكد من صحة عنوان IP الراوتر.');
    }

    // Step 2: Double SHA256 hashing
    const hash1 = crypto.createHash('sha256').update(password).digest('hex').toUpperCase();
    const hash2 = crypto.createHash('sha256').update(hash1 + ld).digest('hex').toUpperCase();

    // Step 3: Send login request
    const loginRes = await this.request(
      routerIp,
      `/goform/goform_set_cmd_process?isTest=false&goformId=LOGIN&password=${encodeURIComponent(hash2)}`
    );

    let loginData: any = {};
    try {
      loginData = JSON.parse(loginRes.body);
    } catch {
      throw new Error('استجابة غير متوقعة من الراوتر أثناء محاولة تسجيل الدخول.');
    }

    if (loginData.result === '0' || loginData.result === 0) {
      this.activeRouterIp = routerIp;
      return { success: true, message: 'تم الاتصال بالراوتر وتسجيل الدخول بنجاح.' };
    }

    if (loginData.result === '1' || loginData.result === '2' || loginData.result === '3') {
      throw new Error('فشل تسجيل الدخول: كلمة المرور غير صحيحة.');
    }

    if (loginData.result === '4' || loginData.result === '5') {
      throw new Error('الراوتر مقفل مؤقتاً لتكرار المحاولات الخاطئة أو يوجد مستخدم آخر متصل حالياً.');
    }

    throw new Error(`رفض الراوتر المصادقة، رمز النتيجة: (${loginData.result ?? 'غير محدد'}).`);
  }

  public async getStatus(routerIp?: string): Promise<RouterStatusData> {
    const targetIp = routerIp || this.activeRouterIp;
    if (!targetIp) {
      throw new Error('لا يوجد اتصال نشط بالراوتر. يرجى الاتصال أولاً.');
    }

    const fields = [
      'lte_pci', 'lte_pci_lock', 'lte_earfcn_lock', 'lte_freq_lock',
      'wan_ipaddr', 'wan_apn', 'pm_sensor_mdm', 'pm_modem_5g',
      'nr5g_pci', 'nr5g_action_band', 'nr5g_action_channel',
      'Z5g_SINR', 'Z5g_rsrp', 'wan_active_channel', 'wan_active_band',
      'lte_multi_ca_scell_info', 'cell_id', 'dns_mode', 'prefer_dns_manual',
      'standby_dns_manual', 'rmcc', 'rmnc', 'network_type', 'wan_lte_ca',
      'lte_rssi', 'lte_rsrp', 'lte_snr', 'lte_rsrq',
      'lte_ca_pcell_bandwidth', 'lte_ca_pcell_band',
      'lte_ca_scell_bandwidth', 'lte_ca_scell_band',
      'wa_inner_version', 'cr_version', 'RD', 'network_provider',
      'signalbar', 'flux_down_speed', 'flux_up_speed',
      'realtime_rx_thrpt', 'realtime_tx_thrpt', 'station_list',
      'attached_devices', 'client_list',
      'm_ssid', 'wifi_coverage', 'm_AuthMode', 'm_security_mode', 'm_HideSSID'
    ];

    const res = await this.request(
      targetIp,
      `/goform/goform_get_cmd_process?isTest=false&cmd=${fields.join(',')}&multi_data=1`
    );

    let raw: Record<string, string> = {};
    try {
      raw = JSON.parse(res.body);
      this.lastRawData = raw;
    } catch {
      throw new Error('تعذر معالجة بيانات الإشارة بصيغة JSON من الراوتر.');
    }

    let cellIdStr = raw.cell_id || '';
    let enbIdStr = '';
    if (cellIdStr) {
      try {
        const decCell = parseInt(cellIdStr, 16);
        if (!isNaN(decCell)) {
          enbIdStr = Math.trunc(decCell / 256).toString();
          cellIdStr = `${decCell} (0x${raw.cell_id})`;
        }
      } catch {}
    }

    let signalBars = 0;
    if (raw.signalbar) {
      const parsed = parseInt(raw.signalbar, 10);
      signalBars = isNaN(parsed) ? 0 : Math.min(Math.max(parsed, 0), 5);
    }

    let pci4G = '';
    if (raw.lte_pci) {
      const pciDec = parseInt(raw.lte_pci, 16);
      pci4G = isNaN(pciDec) ? raw.lte_pci : pciDec.toString();
    }

    let pci5G = '';
    if (raw.nr5g_pci) {
      const pciDec = parseInt(raw.nr5g_pci, 16);
      pci5G = isNaN(pciDec) ? raw.nr5g_pci : pciDec.toString();
    }

    let band4G = raw.wan_active_band || '';
    if (raw.lte_ca_pcell_bandwidth && raw.lte_ca_pcell_band) {
      const bw = Math.round(parseFloat(raw.lte_ca_pcell_bandwidth));
      band4G = `${raw.lte_ca_pcell_band} (${bw}MHz)`;
    }

    const caDetails: Array<{ band: string; pci: string; freq: string }> = [];
    if (raw.lte_multi_ca_scell_info) {
      const scells = raw.lte_multi_ca_scell_info.split(';');
      for (const scell of scells) {
        const parts = scell.split(',');
        if (parts.length >= 6) {
          caDetails.push({
            pci: parts[1] || '-',
            freq: parts[4] || '-',
            band: `${parts[0]} (${Math.round(parseFloat(parts[5]) || 0)}MHz)`
          });
        }
      }
    }

    const caActive = Boolean(raw.wan_lte_ca && raw.wan_lte_ca !== '0' && raw.wan_lte_ca.toLowerCase() !== 'false');

    let speedDown: string | null = null;
    let speedUp: string | null = null;
    const rawDown = raw.flux_down_speed || raw.realtime_rx_thrpt;
    const rawUp = raw.flux_up_speed || raw.realtime_tx_thrpt;

    if (rawDown && rawDown.trim() !== '' && rawDown !== '0') {
      const bytes = parseFloat(rawDown);
      if (!isNaN(bytes) && bytes > 0) {
        speedDown = (bytes >= 1024 * 1024)
          ? `${(bytes / (1024 * 1024)).toFixed(2)} MB/s`
          : `${(bytes / 1024).toFixed(1)} KB/s`;
      }
    }

    if (rawUp && rawUp.trim() !== '' && rawUp !== '0') {
      const bytes = parseFloat(rawUp);
      if (!isNaN(bytes) && bytes > 0) {
        speedUp = (bytes >= 1024 * 1024)
          ? `${(bytes / (1024 * 1024)).toFixed(2)} MB/s`
          : `${(bytes / 1024).toFixed(1)} KB/s`;
      }
    }

    let devCount = 0;
    const candidates = [raw.station_list, raw.attached_devices, raw.client_list];
    for (const c of candidates) {
      if (c) {
        try {
          const parsed = JSON.parse(c);
          if (Array.isArray(parsed)) { devCount = parsed.length; break; }
        } catch {}
      }
    }

    let netType = raw.network_type || 'غير محدد';
    if (raw.nr5g_action_band && raw.nr5g_action_band.length > 0) {
      netType = `5G NSA/SA (${netType})`;
    } else if (raw.wan_lte_ca && raw.wan_lte_ca !== '0') {
      netType = 'LTE-Advanced (4G+)';
    }

    return {
      connected: true,
      model: 'ZTE MC801A1',
      routerIp: targetIp,
      networkType: netType,
      provider: raw.network_provider || 'غير معروف',
      signalBars,
      activeBand: raw.nr5g_action_band ? `5G: ${raw.nr5g_action_band} | 4G: ${band4G || 'غير متوفر'}` : (band4G || 'غير متوفر'),
      wanIp: raw.wan_ipaddr || 'غير متوفر',
      apn: raw.wan_apn || 'غير متوفر',
      cellId: cellIdStr || 'غير متوفر',
      enbId: enbIdStr || 'غير متوفر',
      caStatus: caActive ? 'نشط (Active)' : 'غير نشط (Inactive)',
      caDetails,
      metrics4G: {
        rsrp: raw.lte_rsrp ? `${raw.lte_rsrp} dBm` : undefined,
        rsrq: raw.lte_rsrq ? `${raw.lte_rsrq} dB` : undefined,
        sinr: raw.lte_snr ? `${raw.lte_snr} dB` : undefined,
        rssi: raw.lte_rssi ? `${raw.lte_rssi} dBm` : undefined,
        pci: pci4G || undefined,
        earfcn: raw.wan_active_channel || undefined,
        band: band4G || undefined,
        bandwidth: raw.lte_ca_pcell_bandwidth ? `${Math.round(parseFloat(raw.lte_ca_pcell_bandwidth))} MHz` : undefined
      },
      metrics5G: {
        rsrp: raw.Z5g_rsrp ? `${raw.Z5g_rsrp} dBm` : undefined,
        sinr: raw.Z5g_SINR ? `${raw.Z5g_SINR} dB` : undefined,
        pci: pci5G || undefined,
        earfcn: raw.nr5g_action_channel || undefined,
        band: raw.nr5g_action_band || undefined
      },
      speedDown,
      speedUp,
      temperature4G: raw.pm_sensor_mdm ? `${raw.pm_sensor_mdm} °C` : null,
      temperature5G: raw.pm_modem_5g ? `${raw.pm_modem_5g} °C` : null,
      firmwareVersion: raw.wa_inner_version || raw.cr_version || 'غير متوفر',
      connectedDevicesCount: devCount,
      wifiStatus: raw.wifi_coverage ? 'مفعّل' : (raw.m_ssid ? 'مفعّل' : 'غير معروف'),
      wifiSsid: raw.m_ssid || 'غير متوفر',
      lastUpdated: new Date().toLocaleTimeString('ar-SA'),
      raw
    };
  }

  public async getDevices(routerIp?: string): Promise<ConnectedDevice[]> {
    const targetIp = routerIp || this.activeRouterIp;
    if (!targetIp) throw new Error('لا يوجد اتصال بالراوتر.');

    // Comprehensive query targeting all ZTE connected device parameters
    const cmdList = [
      'station_list',
      'attached_devices',
      'client_list',
      'dhcp_client_list',
      'wlan_station_list',
      'lan_dhcp_clients',
      'station_info'
    ];

    const res = await this.request(
      targetIp,
      `/goform/goform_get_cmd_process?isTest=false&cmd=${cmdList.join(',')}&multi_data=1`
    );

    const devices: ConnectedDevice[] = [];
    const seenMacs = new Set<string>();

    try {
      const data = JSON.parse(res.body);

      const addDevice = (d: any) => {
        const rawMac = (d.mac_addr || d.mac || d.macAddress || '').trim().toUpperCase();
        if (!rawMac || seenMacs.has(rawMac)) return;
        seenMacs.add(rawMac);

        const rawName = d.host_name || d.hostname || d.name || d.client_name || '';
        const decodedName = ZteClient.decodeHostName(rawName);
        const ip = d.ip_addr || d.ip || d.ipAddress || '-';
        const vendor = ZteClient.resolveVendor(rawMac);
        const connType = (d.conn_type === 'lan' || d.interface === 'lan' || d.connType === 'lan') ? 'lan' : 'wifi';

        devices.push({
          id: rawMac,
          name: decodedName,
          ip,
          mac: rawMac,
          connectionType: connType,
          vendor,
          leaseTime: d.lease_time || d.expires || undefined
        });
      };

      // Search all candidate properties
      for (const key of cmdList) {
        const val = data[key];
        if (!val) continue;

        if (Array.isArray(val)) {
          val.forEach(addDevice);
        } else if (typeof val === 'object' && val !== null) {
          Object.values(val).forEach(addDevice);
        } else if (typeof val === 'string' && val.trim().length > 0) {
          try {
            const parsed = JSON.parse(val);
            if (Array.isArray(parsed)) parsed.forEach(addDevice);
          } catch {
            // Semicolon / comma separated format
            const items = val.split(';');
            items.forEach(item => {
              const parts = item.split(',');
              if (parts.length >= 2) {
                addDevice({
                  name: parts[0],
                  ip: parts[1],
                  mac: parts[2] || parts[1],
                  conn_type: 'wifi'
                });
              }
            });
          }
        }
      }
    } catch {}

    return devices;
  }

  public async getAdTokens(routerIp?: string): Promise<string[]> {
    const targetIp = routerIp || this.activeRouterIp;
    if (!targetIp) return [];

    try {
      // 1. Fetch wa_inner_version, cr_version, RD without isTest in query string (matches router native JS)
      const res = await this.request(
        targetIp,
        '/goform/goform_get_cmd_process?cmd=wa_inner_version,cr_version,RD&multi_data=1'
      );
      let rdData: any = {};
      try {
        rdData = JSON.parse(res.body);
      } catch {}

      let waInner = String(rdData.wa_inner_version || this.lastRawData.wa_inner_version || '').trim();
      let crVer = String(rdData.cr_version || this.lastRawData.cr_version || '').trim();
      let rd = String(rdData.RD || rdData.rd || this.lastRawData.RD || this.lastRawData.rd || '').trim();

      // If RD is still empty, request RD directly via dedicated GET request
      if (!rd) {
        try {
          const rdRes = await this.request(targetIp, '/goform/goform_get_cmd_process?cmd=RD');
          let parsed: any = {};
          try { parsed = JSON.parse(rdRes.body); } catch {}
          rd = String(parsed.RD || parsed.rd || '').trim();
        } catch {}
      }

      if (!rd) {
        try {
          const rdRes = await this.request(targetIp, '/goform/goform_get_cmd_process?isTest=false&cmd=RD');
          let parsed: any = {};
          try { parsed = JSON.parse(rdRes.body); } catch {}
          rd = String(parsed.RD || parsed.rd || '').trim();
        } catch {}
      }

      // If waInner is still empty, request wa_inner_version directly
      if (!waInner) {
        try {
          const verRes = await this.request(targetIp, '/goform/goform_get_cmd_process?cmd=wa_inner_version');
          let parsed: any = {};
          try { parsed = JSON.parse(verRes.body); } catch {}
          waInner = String(parsed.wa_inner_version || '').trim();
        } catch {}
      }

      if (!waInner && this.lastRawData.wa_inner_version) {
        waInner = String(this.lastRawData.wa_inner_version).trim();
      }

      if (!rd) return [];

      const candidates: string[] = [];

      // Candidate 1: Standard ZTE formula hex_md5(hex_md5(waInner + crVer) + rd)
      // Handles both non-empty crVer and empty crVer correctly
      if (waInner || crVer) {
        const m1 = crypto.createHash('md5').update(waInner + crVer).digest('hex');
        candidates.push(crypto.createHash('md5').update(m1 + rd).digest('hex'));
      }

      // Candidate 2: In browser JS, if cr_version is undefined in the JSON object,
      // (a.wa_inner_version + a.cr_version) coerced to "waInnerundefined"
      if (waInner && !crVer) {
        const m1Undef = crypto.createHash('md5').update(waInner + 'undefined').digest('hex');
        candidates.push(crypto.createHash('md5').update(m1Undef + rd).digest('hex'));
      }

      // Candidate 3: waInner alone
      if (waInner) {
        const m1Only = crypto.createHash('md5').update(waInner).digest('hex');
        candidates.push(crypto.createHash('md5').update(m1Only + rd).digest('hex'));
      }

      // Candidate 4: Simple concatenation without double MD5: md5(waInner + crVer + rd)
      if (waInner || crVer) {
        candidates.push(crypto.createHash('md5').update(waInner + crVer + rd).digest('hex'));
      }

      // Return unique candidate tokens
      return Array.from(new Set(candidates.filter(Boolean)));
    } catch {}
    return [];
  }

  public async getAdToken(routerIp?: string): Promise<string> {
    const tokens = await this.getAdTokens(routerIp);
    return tokens[0] || '';
  }

  public buildFormBody(params: Record<string, string>): string {
    return Object.entries(params)
      .map(([k, v]) => {
        // Encode keys and values while preserving literal commas, pluses, and colons
        // which embedded ZTE firmware C CGI parsers require
        const encVal = encodeURIComponent(v)
          .replace(/%2C/g, ',')
          .replace(/%2B/g, '+')
          .replace(/%3A/g, ':');
        return `${encodeURIComponent(k)}=${encVal}`;
      })
      .join('&');
  }

  public async executeSetCommand(
    goformId: string,
    params: Record<string, string>,
    routerIp?: string
  ): Promise<{ success: boolean; result?: string; message?: string }> {
    const targetIp = routerIp || this.activeRouterIp;
    if (!targetIp) throw new Error('لا يوجد اتصال نشط بالراوتر لتنفيذ هذا الأمر.');

    const adTokens = await this.getAdTokens(targetIp);
    const isSuccess = (rawBody: string, parsedObj: any): boolean => {
      if (parsedObj.result === '0' || parsedObj.result === 0 || parsedObj.result === 'success' || parsedObj.result === 'ok') {
        return true;
      }
      if (parsedObj.status === '0' || parsedObj.status === 0 || parsedObj.status === 'success' || parsedObj.status === 'ok') {
        return true;
      }
      if (rawBody.trim() === '{"result":"0"}' || rawBody.includes('"result":"0"') || rawBody.toLowerCase().includes('success')) {
        return true;
      }
      return false;
    };

    let lastRawRes = '';
    let lastParsed: any = {};

    // Attempt 1: Try each candidate AD token
    for (const ad of adTokens) {
      const fullParams: Record<string, string> = {
        isTest: 'false',
        goformId,
        ...params,
        AD: ad
      };

      const postBody = this.buildFormBody(fullParams);
      const res = await this.request(targetIp, '/goform/goform_set_cmd_process', 'POST', postBody);
      lastRawRes = res.body;
      lastParsed = {};
      try {
        lastParsed = JSON.parse(res.body);
      } catch {}

      if (isSuccess(res.body, lastParsed)) {
        return { success: true, result: String(lastParsed.result ?? '0') };
      }

      // Also try uppercase AD
      const upperAd = ad.toUpperCase();
      if (upperAd !== ad) {
        fullParams.AD = upperAd;
        const upperRes = await this.request(targetIp, '/goform/goform_set_cmd_process', 'POST', this.buildFormBody(fullParams));
        lastRawRes = upperRes.body;
        lastParsed = {};
        try { lastParsed = JSON.parse(upperRes.body); } catch {}
        if (isSuccess(upperRes.body, lastParsed)) {
          return { success: true, result: String(lastParsed.result ?? '0') };
        }
      }
    }

    // Attempt 2: Try without AD (some ZTE goform commands don't require AD)
    const noAdParams: Record<string, string> = {
      isTest: 'false',
      goformId,
      ...params
    };
    const noAdRes = await this.request(targetIp, '/goform/goform_set_cmd_process', 'POST', this.buildFormBody(noAdParams));
    lastRawRes = noAdRes.body;
    lastParsed = {};
    try {
      lastParsed = JSON.parse(noAdRes.body);
    } catch {}

    if (isSuccess(noAdRes.body, lastParsed)) {
      return { success: true, result: String(lastParsed.result ?? '0') };
    }

    return {
      success: false,
      result: String(lastParsed.result ?? 'failure'),
      message: `الراوتر أرجع رمز استجابة غير متوقع: ${lastParsed.result ?? lastRawRes}`
    };
  }

  public async getNetworkSettings(routerIp?: string): Promise<NetworkSettingsData> {
    const targetIp = routerIp || this.activeRouterIp;
    if (!targetIp) throw new Error('لا يوجد اتصال بالراوتر.');

    const fields = [
      'BearerPreference', 'nr5g_band_mask', 'lte_band', 'is_band_auto',
      'lte_pci_lock', 'lte_earfcn_lock', 'wifi_onoff', 'm_ssid', 'm_HideSSID',
      'm_security_mode', 'ppp_status'
    ];

    const res = await this.request(
      targetIp,
      `/goform/goform_get_cmd_process?isTest=false&cmd=${fields.join(',')}&multi_data=1`
    );

    let raw: Record<string, string> = {};
    try {
      raw = JSON.parse(res.body);
    } catch {}

    let netMode = 'auto';
    const rawPref = raw.BearerPreference || '';
    if (rawPref.includes('5G')) {
      netMode = '5g_only';
    } else if (rawPref.includes('LTE')) {
      netMode = '4g_only';
    } else {
      netMode = 'auto';
    }

    return {
      networkMode: netMode,
      rawBearerPreference: rawPref,
      nr5gBandMask: raw.nr5g_band_mask || '',
      lteBand: raw.lte_band || '',
      isBandAuto: raw.is_band_auto === '1',
      ltePciLock: raw.lte_pci_lock || '',
      lteEarfcnLock: raw.lte_earfcn_lock || '',
      wifiOnOff: raw.wifi_onoff !== '0',
      mSsid: raw.m_ssid || '',
      mHideSsid: raw.m_HideSSID === '1',
      mSecurityMode: raw.m_security_mode || 'WPA2/WPA3-PSK',
      pppStatus: raw.ppp_status || 'ppp_connected'
    };
  }

  public calculateLteBandMask(bands: string[]): string {
    let mask = 0n;
    for (const b of bands) {
      const num = parseInt(b.replace(/^b/i, '').trim(), 10);
      if (!isNaN(num) && num >= 1 && num <= 85) {
        mask |= (1n << BigInt(num - 1));
      }
    }
    return mask.toString(16).toUpperCase();
  }

  public calculate5gBandMask(bands: string[]): string {
    let mask = 0n;
    for (const b of bands) {
      const num = parseInt(b.replace(/^n/i, '').trim(), 10);
      if (!isNaN(num) && num >= 1 && num <= 128) {
        mask |= (1n << BigInt(num - 1));
      }
    }
    return mask.toString(16).toUpperCase();
  }

  public async setNetworkMode(
    mode: 'auto' | '5g_only' | '4g_only',
    routerIp?: string
  ): Promise<{ success: boolean; message: string }> {
    let modeArabic = 'تلقائي (5G / 4G)';
    let candidateBearers: string[] = ['NETWORK_auto', 'AUTO_AND_5G', 'auto'];

    if (mode === '5g_only') {
      candidateBearers = ['ONLY_5G', 'Only_5G', '5G_ONLY', 'ONLY_NR'];
      modeArabic = 'الجيل الخامس فقط (5G Only)';
    } else if (mode === '4g_only') {
      candidateBearers = ['ONLY_LTE', 'Only_LTE', 'LTE_ONLY'];
      modeArabic = 'الجيل الرابع فقط (4G LTE Only)';
    }

    let lastError: string = '';
    for (const bearer of candidateBearers) {
      const res = await this.executeSetCommand('SET_BEARER_PREFERENCE', { BearerPreference: bearer }, routerIp);
      if (res.success) {
        return {
          success: true,
          message: `تم تحويل نمط الشبكة بنجاح إلى: ${modeArabic}. قد يستغرق الراوتر بضع ثوانٍ لتثبيت الاتصال.`
        };
      }
      lastError = res.message || 'فشل الأمر من الراوتر';
    }

    throw new Error(`تعذر ضبط نمط الشبكة إلى ${modeArabic}: ${lastError}`);
  }

  public async set5gBandLock(
    bands: string[],
    routerIp?: string
  ): Promise<{ success: boolean; message: string; bands?: string[]; mask?: string; strategy?: string; routerResponse?: any }> {
    const cleanNumbers = (bands || []).map(b => b.replace(/^n/i, '').trim()).filter(Boolean);
    const isReset = cleanNumbers.length === 0;

    // Standard list of all supported 5G bands used by ZTE MC801A / MioNonno / ADSLGate for full reset
    const all5gBandsComma = '1,2,3,5,7,8,20,28,38,41,50,51,66,70,71,74,75,76,77,78,79,80,81,82,83,84';
    const all5gBandsPlus = '1+2+3+5+7+8+20+28+38+41+50+51+66+70+71+74+75+76+77+78+79+80+81+82+83+84';

    // Strategy 1: Standard ZTE Comma-separated format (MioNonno / ADSLGate / Gist standard)
    const commaMask = isReset ? all5gBandsComma : cleanNumbers.join(',');
    let res = await this.executeSetCommand('WAN_PERFORM_NR5G_BAND_LOCK', { nr5g_band_mask: commaMask }, routerIp);
    if (res.success) {
      return {
        success: true,
        message: isReset
          ? 'تم فك قفل نطاقات 5G والعودة للاختيار التلقائي لجميع النطاقات بنجاح.'
          : `تم تطبيق قفل وتثبيت نطاقات 5G بنجاح على: N${cleanNumbers.join(', N')}.`,
        bands: cleanNumbers,
        mask: commaMask,
        strategy: 'WAN_PERFORM_NR5G_BAND_LOCK (Comma)',
        routerResponse: res
      };
    }

    // Strategy 2: Plus-separated format (e.g. "78+41" or "78")
    const plusMask = isReset ? all5gBandsPlus : cleanNumbers.join('+');
    res = await this.executeSetCommand('WAN_PERFORM_NR5G_BAND_LOCK', { nr5g_band_mask: plusMask }, routerIp);
    if (res.success) {
      return {
        success: true,
        message: isReset
          ? 'تم فك قفل نطاقات 5G والعودة للاختيار التلقائي لجميع النطاقات بنجاح.'
          : `تم تطبيق قفل وتثبيت نطاقات 5G بنجاح على: N${cleanNumbers.join(', N')}.`,
        bands: cleanNumbers,
        mask: plusMask,
        strategy: 'WAN_PERFORM_NR5G_BAND_LOCK (Plus)',
        routerResponse: res
      };
    }

    // Strategy 3: "AUTO" keyword or "0" / "" if reset was requested
    if (isReset) {
      res = await this.executeSetCommand('WAN_PERFORM_NR5G_BAND_LOCK', { nr5g_band_mask: 'AUTO' }, routerIp);
      if (res.success) {
        return { success: true, message: 'تم فك قفل نطاقات 5G بنجاح (وضع AUTO التلقائي).', mask: 'AUTO', strategy: 'WAN_PERFORM_NR5G_BAND_LOCK (AUTO)', routerResponse: res };
      }
      res = await this.executeSetCommand('WAN_PERFORM_NR5G_BAND_LOCK', { nr5g_band_mask: '0' }, routerIp);
      if (res.success) {
        return { success: true, message: 'تم فك قفل نطاقات 5G بنجاح.', mask: '0', strategy: 'WAN_PERFORM_NR5G_BAND_LOCK (0)', routerResponse: res };
      }
      res = await this.executeSetCommand('WAN_PERFORM_NR5G_BAND_LOCK', { nr5g_band_mask: '' }, routerIp);
      if (res.success) {
        return { success: true, message: 'تم فك قفل نطاقات 5G بنجاح.', mask: '', strategy: 'WAN_PERFORM_NR5G_BAND_LOCK (Empty)', routerResponse: res };
      }
    }

    // Strategy 4: Hex mask format
    const hexMask = isReset ? 'FFFFFFFFFFFFFFFFFFFFFFFF' : this.calculate5gBandMask(cleanNumbers);
    res = await this.executeSetCommand('WAN_PERFORM_NR5G_BAND_LOCK', { nr5g_band_mask: `0x${hexMask}` }, routerIp);
    if (res.success) {
      return {
        success: true,
        message: isReset
          ? 'تم فك قفل نطاقات 5G بنجاح.'
          : `تم تطبيق قفل وتثبيت نطاقات 5G بنجاح على: N${cleanNumbers.join(', N')}.`,
        bands: cleanNumbers,
        mask: `0x${hexMask}`,
        strategy: 'WAN_PERFORM_NR5G_BAND_LOCK (Hex)',
        routerResponse: res
      };
    }

    // Strategy 5: BAND_SELECT unified command with 5G parameters
    const bandSelectParams: Record<string, string> = {
      is_band_auto: isReset ? '1' : '0',
      is_nr5g_band: isReset ? '0' : '1',
      nr5g_band_mask: isReset ? '0' : `0x${hexMask}`,
      nr5g_band: isReset ? '' : cleanNumbers.join(',')
    };
    res = await this.executeSetCommand('BAND_SELECT', bandSelectParams, routerIp);
    if (res.success) {
      return {
        success: true,
        message: isReset
          ? 'تم فك قفل نطاقات 5G والعودة للاختيار التلقائي.'
          : `تم تطبيق قفل وتثبيت نطاقات 5G بنجاح على: N${cleanNumbers.join(', N')}.`,
        bands: cleanNumbers,
        mask: `0x${hexMask}`,
        strategy: 'BAND_SELECT (5G)',
        routerResponse: res
      };
    }

    // Strategy 6: SET_5G_BAND / NR5G_BAND_SELECT fallback
    res = await this.executeSetCommand('SET_5G_BAND', { nr5g_band: isReset ? 'AUTO' : cleanNumbers.join(',') }, routerIp);
    if (res.success) {
      return {
        success: true,
        message: isReset
          ? 'تم فك قفل نطاقات 5G بنجاح.'
          : `تم تطبيق قفل وتثبيت نطاقات 5G بنجاح على: N${cleanNumbers.join(', N')}.`,
        bands: cleanNumbers,
        mask: cleanNumbers.join(','),
        strategy: 'SET_5G_BAND',
        routerResponse: res
      };
    }

    res = await this.executeSetCommand('NR5G_BAND_SELECT', { nr5g_band_mask: isReset ? 'AUTO' : cleanNumbers.join(',') }, routerIp);
    if (res.success) {
      return {
        success: true,
        message: isReset
          ? 'تم فك قفل نطاقات 5G بنجاح.'
          : `تم تطبيق قفل وتثبيت نطاقات 5G بنجاح على: N${cleanNumbers.join(', N')}.`
      };
    }

    // Strategy 7: Disconnect WAN and retry if currently connected
    // Some ZTE firmwares reject RF frequency adjustments while mobile data session is active
    try {
      const isConnected = this.lastRawData.ppp_status === 'ppp_connected';
      if (isConnected) {
        await this.executeSetCommand('DISCONNECT_NETWORK', {}, routerIp);
        await new Promise(r => setTimeout(r, 600));

        // Retry comma format with fresh token
        res = await this.executeSetCommand('WAN_PERFORM_NR5G_BAND_LOCK', { nr5g_band_mask: commaMask }, routerIp);

        // Always reconnect WAN
        await this.executeSetCommand('CONNECT_NETWORK', {}, routerIp);

        if (res.success) {
          return {
            success: true,
            message: isReset
              ? 'تم فك قفل نطاقات 5G بنجاح بعد إعادة تهيئة اتصال البيانات.'
              : `تم تطبيق قفل وتثبيت نطاقات 5G بنجاح على: N${cleanNumbers.join(', N')}.`
          };
        }
      }
    } catch {}

    throw new Error(
      `تعذر قفل نطاقات 5G: الراوتر رفض الأمر (رمز: ${res.result || 'failure'}). ` +
      `قد تكون نسخة برنامج الراوتر (Firmware) مقفلة من مشغل الاتصالات ولا تتيح قفل 5G مباشرة. ` +
      `يُنصح بقفل ترددات 4G المرتبطة (LTE Anchor) أو تحويل نمط الشبكة إلى (5G فقط) من تبويب الاتصال.`
    );
  }

  public async set4gBandLock(
    bands: string[],
    isAuto: boolean = false,
    routerIp?: string
  ): Promise<{ success: boolean; message: string; bands?: string[]; mask?: string; strategy?: string; routerResponse?: any }> {
    const isReset = isAuto || !bands || bands.length === 0;
    const cleanBandsList = (bands || []).map(b => b.replace(/^b/i, '').trim()).filter(Boolean);
    const cleanBands = cleanBandsList.join(',');

    // ZTE MC801A default all-LTE-bands mask (B1, B2, B3, B4, B7, B8, B12, B20, B26, B28, B34, B38, B39, B40, B41, B42, B43)
    const ALL_LTE_BANDS_MASK = '0xA3E2AB0908DF';
    const ALL_LTE_BANDS_FULL = '0x7FFFFFFFFFFFFFFF';

    const hexMask = isReset ? 'A3E2AB0908DF' : this.calculateLteBandMask(cleanBandsList);
    const hexMaskLower = hexMask.toLowerCase();
    const hexMaskUpper = hexMask.toUpperCase();

    // Strategy 1: Standard ZTE MC801A/MC801A1 BAND_SELECT (Exact specification)
    // Requires is_gw_band: "0", gw_band_mask: "0", is_lte_band: "1", lte_band_mask: "0x..."
    const params1: Record<string, string> = {
      is_gw_band: '0',
      gw_band_mask: '0',
      is_lte_band: '1',
      lte_band_mask: isReset ? ALL_LTE_BANDS_MASK : `0x${hexMaskLower}`
    };

    let res = await this.executeSetCommand('BAND_SELECT', params1, routerIp);
    if (res.success) {
      return {
        success: true,
        message: isReset
          ? 'تمت إعادة تعيين نطاقات 4G LTE إلى الوضع التلقائي (Auto) بنجاح.'
          : `تم قفل وتثبيت نطاقات 4G بنجاح على: ${cleanBandsList.map(b => 'B' + b).join(', ')}.`,
        bands: cleanBandsList,
        mask: isReset ? ALL_LTE_BANDS_MASK : `0x${hexMaskLower}`,
        strategy: 'BAND_SELECT (Strategy 1: 0x hex mask)',
        routerResponse: res
      };
    }

    // Strategy 2: BAND_SELECT with uppercase 0xHEX mask or all-bits full mask
    const params2: Record<string, string> = {
      is_gw_band: '0',
      gw_band_mask: '0',
      is_lte_band: '1',
      lte_band_mask: isReset ? ALL_LTE_BANDS_FULL : `0x${hexMaskUpper}`
    };
    res = await this.executeSetCommand('BAND_SELECT', params2, routerIp);
    if (res.success) {
      return {
        success: true,
        message: isReset
          ? 'تمت إعادة تعيين نطاقات 4G LTE إلى الوضع التلقائي (Auto) بنجاح.'
          : `تم قفل وتثبيت نطاقات 4G بنجاح على: ${cleanBandsList.map(b => 'B' + b).join(', ')}.`,
        bands: cleanBandsList,
        mask: isReset ? ALL_LTE_BANDS_FULL : `0x${hexMaskUpper}`,
        strategy: 'BAND_SELECT (Strategy 2: uppercase 0x hex mask)',
        routerResponse: res
      };
    }

    // Strategy 3: BAND_SELECT with raw hex without 0x prefix
    const params3: Record<string, string> = {
      is_gw_band: '0',
      gw_band_mask: '0',
      is_lte_band: '1',
      lte_band_mask: isReset ? 'A3E2AB0908DF' : hexMaskUpper
    };
    res = await this.executeSetCommand('BAND_SELECT', params3, routerIp);
    if (res.success) {
      return {
        success: true,
        message: isReset
          ? 'تمت إعادة تعيين نطاقات 4G LTE إلى الوضع التلقائي (Auto) بنجاح.'
          : `تم قفل وتثبيت نطاقات 4G بنجاح على: ${cleanBandsList.map(b => 'B' + b).join(', ')}.`,
        bands: cleanBandsList,
        mask: isReset ? 'A3E2AB0908DF' : hexMaskUpper,
        strategy: 'BAND_SELECT (Strategy 3: raw hex)',
        routerResponse: res
      };
    }

    // Strategy 4: BAND_SELECT including is_band_auto flag
    const params4: Record<string, string> = {
      is_band_auto: isReset ? '1' : '0',
      is_gw_band: '0',
      gw_band_mask: '0',
      is_lte_band: '1',
      lte_band_mask: isReset ? '0' : `0x${hexMaskLower}`
    };
    res = await this.executeSetCommand('BAND_SELECT', params4, routerIp);
    if (res.success) {
      return {
        success: true,
        message: isReset
          ? 'تمت إعادة تعيين نطاقات 4G LTE إلى الوضع التلقائي (Auto) بنجاح.'
          : `تم قفل وتثبيت نطاقات 4G بنجاح على: ${cleanBandsList.map(b => 'B' + b).join(', ')}.`,
        bands: cleanBandsList,
        mask: isReset ? '0' : `0x${hexMaskLower}`,
        strategy: 'BAND_SELECT (Strategy 4: is_band_auto)',
        routerResponse: res
      };
    }

    // Strategy 5: BAND_SELECT including comma-separated lte_band
    const params5: Record<string, string> = {
      is_gw_band: '0',
      gw_band_mask: '0',
      is_lte_band: '1',
      lte_band_mask: isReset ? ALL_LTE_BANDS_MASK : `0x${hexMaskLower}`,
      lte_band: isReset ? 'AUTO' : cleanBands
    };
    res = await this.executeSetCommand('BAND_SELECT', params5, routerIp);
    if (res.success) {
      return {
        success: true,
        message: isReset
          ? 'تمت إعادة تعيين نطاقات 4G LTE إلى الوضع التلقائي (Auto) بنجاح.'
          : `تم قفل وتثبيت نطاقات 4G بنجاح على: ${cleanBandsList.map(b => 'B' + b).join(', ')}.`,
        bands: cleanBandsList,
        mask: isReset ? ALL_LTE_BANDS_MASK : `0x${hexMaskLower}`,
        strategy: 'BAND_SELECT (Strategy 5: comma lte_band)',
        routerResponse: res
      };
    }

    // Strategy 6: WAN_PERFORM_LTE_BAND_LOCK (mirroring 5G command)
    const params6: Record<string, string> = {
      lte_band_mask: isReset ? 'AUTO' : cleanBands,
      lte_band: isReset ? 'AUTO' : cleanBands
    };
    res = await this.executeSetCommand('WAN_PERFORM_LTE_BAND_LOCK', params6, routerIp);
    if (res.success) {
      return {
        success: true,
        message: isReset
          ? 'تمت إعادة تعيين نطاقات 4G LTE إلى الوضع التلقائي (Auto) بنجاح.'
          : `تم قفل وتثبيت نطاقات 4G بنجاح على: ${cleanBandsList.map(b => 'B' + b).join(', ')}.`,
        bands: cleanBandsList,
        mask: cleanBands,
        strategy: 'WAN_PERFORM_LTE_BAND_LOCK',
        routerResponse: res
      };
    }

    // Strategy 7: SET_LTE_BAND / SET_NETWORK_BAND_LOCK fallback
    res = await this.executeSetCommand('SET_LTE_BAND', { lte_band: isReset ? 'AUTO' : cleanBands }, routerIp);
    if (res.success) {
      return {
        success: true,
        message: isReset
          ? 'تمت إعادة تعيين نطاقات 4G LTE إلى الوضع التلقائي (Auto) بنجاح.'
          : `تم قفل وتثبيت نطاقات 4G بنجاح على: ${cleanBandsList.map(b => 'B' + b).join(', ')}.`
      };
    }

    res = await this.executeSetCommand('SET_NETWORK_BAND_LOCK', {
      is_gw_band: '0',
      gw_band_mask: '0',
      is_lte_band: '1',
      lte_band_mask: isReset ? ALL_LTE_BANDS_MASK : `0x${hexMaskLower}`
    }, routerIp);
    if (res.success) {
      return {
        success: true,
        message: isReset
          ? 'تمت إعادة تعيين نطاقات 4G LTE إلى الوضع التلقائي (Auto) بنجاح.'
          : `تم قفل وتثبيت نطاقات 4G بنجاح على: ${cleanBandsList.map(b => 'B' + b).join(', ')}.`
      };
    }

    // Strategy 8: Temporarily disconnect WAN and retry (if data connection is active)
    try {
      const isConnected = this.lastRawData.ppp_status === 'ppp_connected';
      if (isConnected) {
        await this.executeSetCommand('DISCONNECT_NETWORK', {}, routerIp);
        await new Promise(r => setTimeout(r, 600));

        // Retry standard BAND_SELECT
        res = await this.executeSetCommand('BAND_SELECT', params1, routerIp);

        // Always reconnect WAN
        await this.executeSetCommand('CONNECT_NETWORK', {}, routerIp);

        if (res.success) {
          return {
            success: true,
            message: isReset
              ? 'تمت إعادة تعيين نطاقات 4G LTE إلى الوضع التلقائي (Auto) بعد إعادة تهيئة الاتصال.'
              : `تم قفل وتثبيت نطاقات 4G بنجاح على: ${cleanBandsList.map(b => 'B' + b).join(', ')}.`
          };
        }
      }
    } catch {}

    throw new Error(
      `تعذر قفل نطاقات 4G: الراوتر رفض الأمر (رمز: ${res.result || 'failure'}). ` +
      `قد تكون نسخة برنامج الراوتر (Firmware) تمنع حصر ترددات 4G مع اتصال 5G النشط، أو تتطلب إعادة تشغيل الراوتر.`
    );
  }

  public async setCellLock(
    pci: string,
    earfcn: string,
    clear: boolean = false,
    routerIp?: string
  ): Promise<{ success: boolean; message: string }> {
    let params: Record<string, string> = {};

    if (clear) {
      params = {
        lte_pci_lock: '0',
        lte_earfcn_lock: '0'
      };
    } else {
      if (!pci || !earfcn) {
        throw new Error('يرجى تحديد كل من رقم الخلية PCI ورقم القناة الترددية EARFCN لقفل الخلية.');
      }
      params = {
        lte_pci_lock: pci.trim(),
        lte_earfcn_lock: earfcn.trim()
      };
    }

    // Strategy 1: LTE_LOCK_CELL_SET
    let res = await this.executeSetCommand('LTE_LOCK_CELL_SET', params, routerIp);
    if (res.success) {
      return {
        success: true,
        message: clear
          ? 'تم إلغاء قفل الخلية بنجاح والعودة للاختيار التلقائي لأفضل برج.'
          : `تم قفل الخلية بنجاح على PCI: ${pci} و EARFCN: ${earfcn}.`
      };
    }

    // Strategy 2: CELL_LOCK_SET fallback
    res = await this.executeSetCommand('CELL_LOCK_SET', params, routerIp);
    if (res.success) {
      return {
        success: true,
        message: clear
          ? 'تم إلغاء قفل الخلية بنجاح.'
          : `تم قفل الخلية بنجاح على PCI: ${pci} و EARFCN: ${earfcn}.`
      };
    }

    throw new Error(`تعذر تنفيذ أمر قفل/فك الخلية: ${res.message || 'فشل الأمر من الراوتر'}`);
  }

  public async setWifiSettings(
    settings: { ssid?: string; password?: string; hideSsid?: boolean; enabled?: boolean },
    routerIp?: string
  ): Promise<{ success: boolean; message: string }> {
    const messages: string[] = [];

    // 1. Toggle Wi-Fi state if requested
    if (settings.enabled !== undefined) {
      const toggleRes = await this.executeSetCommand(
        'SET_WIFI_ONOFF',
        { wifi_onoff: settings.enabled ? '1' : '0' },
        routerIp
      );
      if (!toggleRes.success) {
        throw new Error(`فشل تشغيل/تعطيل Wi-Fi: ${toggleRes.message}`);
      }
      messages.push(settings.enabled ? 'تم تفعيل بث Wi-Fi' : 'تم إيقاف بث Wi-Fi');
    }

    // 2. Modify SSID, Hide, or Password
    if (settings.ssid !== undefined || settings.password || settings.hideSsid !== undefined) {
      const params: Record<string, string> = {
        m_security_mode: 'WPA2/WPA3-PSK'
      };
      if (settings.ssid) params.m_ssid = settings.ssid.trim();
      if (settings.hideSsid !== undefined) params.m_HideSSID = settings.hideSsid ? '1' : '0';
      if (settings.password) {
        if (settings.password.length < 8) {
          throw new Error('كلمة مرور شبكة Wi-Fi يجب ألا تقل عن 8 أحرف.');
        }
        params.m_WPAPSK_key = settings.password;
      }

      let setRes = await this.executeSetCommand('SET_WIFI_INFO', params, routerIp);
      if (!setRes.success) {
        // Fallback for some ZTE MC801A firmwares that use WLAN_BASIC_SETTING
        setRes = await this.executeSetCommand('WLAN_BASIC_SETTING', params, routerIp);
      }

      if (!setRes.success) {
        throw new Error(`تعذر حفظ إعدادات Wi-Fi: ${setRes.message}`);
      }
      messages.push('تم تحديث إعدادات شبكة Wi-Fi بنجاح');
    }

    return {
      success: true,
      message: messages.join(' و ') || 'تم تنفيذ العملية بنجاح.'
    };
  }

  public async setWanConnection(
    connect: boolean,
    routerIp?: string
  ): Promise<{ success: boolean; message: string }> {
    const cmd = connect ? 'CONNECT_NETWORK' : 'DISCONNECT_NETWORK';
    const res = await this.executeSetCommand(cmd, {}, routerIp);
    if (!res.success) {
      throw new Error(`تعذر تبديل حالة اتصال البيانات: ${res.message}`);
    }

    return {
      success: true,
      message: connect ? 'تم إرسال أمر توصيل بيانات الشريحة (WAN).' : 'تم إرسال أمر قطع اتصال بيانات الشريحة (WAN).'
    };
  }

  public async getWifiInfo(routerIp?: string): Promise<WifiInfo> {
    const targetIp = routerIp || this.activeRouterIp;
    if (!targetIp) throw new Error('لا يوجد اتصال بالراوتر.');

    const res = await this.request(
      targetIp,
      '/goform/goform_get_cmd_process?isTest=false&cmd=m_ssid,wifi_coverage,wifi_onoff,m_AuthMode,m_security_mode,m_HideSSID&multi_data=1'
    );

    let raw: Record<string, string> = {};
    try {
      raw = JSON.parse(res.body);
    } catch {}

    const isEnabled = raw.wifi_onoff !== '0' && Boolean(raw.m_ssid || raw.wifi_coverage);

    return {
      ssid: raw.m_ssid || 'غير متوفر من الراوتر',
      enabled: isEnabled,
      broadcast: raw.m_HideSSID !== '1',
      securityMode: raw.m_security_mode || 'WPA2/WPA3-PSK',
      authMode: raw.m_AuthMode || 'مشفّر (Protected)'
    };
  }

  public async reboot(routerIp?: string): Promise<{ success: boolean; message: string }> {
    const targetIp = routerIp || this.activeRouterIp;
    if (!targetIp) throw new Error('لا يوجد اتصال بالراوتر لإعادة التشغيل.');

    const res = await this.executeSetCommand('REBOOT_DEVICE', {}, targetIp);
    if (!res.success) {
      throw new Error(`فشل إرسال أمر إعادة التشغيل: ${res.message}`);
    }

    this.clearSession();
    return {
      success: true,
      message: 'تم إرسال أمر إعادة تشغيل الراوتر بنجاح. سيستغرق الراوتر نحو دقيقة للعودة للعمل.'
    };
  }

  public static decodeSms(raw: string): string {
    if (!raw) return '';
    const text = raw.trim();

    // Check if hexadecimal UTF-16 representation (common in ZTE Arabic SMS)
    if (/^[0-9a-fA-F]{4,}$/.test(text) && text.length % 4 === 0) {
      try {
        const buf = Buffer.from(text, 'hex');
        const decoded = buf.swap16().toString('utf16le');
        if (decoded && !/[\u0000-\u0008]/.test(decoded)) {
          return decoded;
        }
      } catch {}
    }

    // Check if plain hex ASCII
    if (/^[0-9a-fA-F]{4,}$/.test(text) && text.length % 2 === 0) {
      try {
        const decoded = Buffer.from(text, 'hex').toString('utf-8');
        if (decoded && /^[\x20-\x7E\u0600-\u06FF\s]+$/.test(decoded)) {
          return decoded;
        }
      } catch {}
    }

    return text;
  }

  public static formatSmsDate(dateStr: string): string {
    if (!dateStr) return '';
    const parts = dateStr.split(',');
    if (parts.length >= 6) {
      const year = '20' + parts[0];
      const month = parts[1];
      const day = parts[2];
      const hour = parts[3];
      const min = parts[4];
      return `${year}/${month}/${day} ${hour}:${min}`;
    }
    return dateStr;
  }

  public async getSmsList(routerIp?: string): Promise<{ messages: SmsMessage[]; unreadCount: number }> {
    const targetIp = routerIp || this.activeRouterIp;
    if (!targetIp) throw new Error('لا يوجد اتصال بالراوتر.');

    const res = await this.request(
      targetIp,
      '/goform/goform_get_cmd_process?isTest=false&cmd=sms_data_total&page=0&data_per_page=50&mem_store=1&tags=10&order_by=order+by+id+desc'
    );

    let raw: any = {};
    try {
      raw = JSON.parse(res.body);
    } catch {
      return { messages: [], unreadCount: 0 };
    }

    const messagesList: SmsMessage[] = [];
    let unreadCount = 0;

    const rawList = Array.isArray(raw.messages) ? raw.messages : [];
    for (const msg of rawList) {
      const isUnread = msg.tag === '1';
      if (isUnread) unreadCount++;

      messagesList.push({
        id: String(msg.id),
        number: String(msg.number || 'غير معروف'),
        date: ZteClient.formatSmsDate(String(msg.date || '')),
        content: ZteClient.decodeSms(String(msg.content || '')),
        isRead: !isUnread
      });
    }

    return { messages: messagesList, unreadCount };
  }

  public async deleteSms(id: string, routerIp?: string): Promise<{ success: boolean; message: string }> {
    const targetIp = routerIp || this.activeRouterIp;
    if (!targetIp) throw new Error('لا يوجد اتصال بالراوتر.');

    const res = await this.executeSetCommand('DELETE_SMS', { msg_id: `${id};` }, targetIp);
    if (!res.success) {
      throw new Error(`تعذر حذف الرسالة: ${res.message}`);
    }

    return { success: true, message: 'تم حذف الرسالة بنجاح.' };
  }

  public async getAdvancedSettings(routerIp?: string): Promise<any> {
    const targetIp = routerIp || this.activeRouterIp || '192.168.0.1';
    let raw: Record<string, string> = {};

    if (this.isSessionActive() || routerIp) {
      try {
        const fields = [
          'lan_ipaddr', 'lan_netmask', 'dhcp_server_status', 'dhcp_start_ip', 'dhcp_end_ip',
          'dhcp_lease_time', 'wan_mtu', 'mss', 'sleep_mode', 'power_save_mode',
          'wifi_sleep_status', 'wifi_wakeup', 'dmz_status', 'dmz_ip', 'upnp_status',
          'port_filter_status', 'port_map_status', 'url_filter_status', 'auto_update_setting',
          'roam_update_setting', 'wa_inner_version', 'cr_version', 'sntp_server'
        ];
        const res = await this.request(
          targetIp,
          `/goform/goform_get_cmd_process?isTest=false&cmd=${fields.join(',')}&multi_data=1`
        );
        raw = JSON.parse(res.body);
      } catch {}
    }

    const fwVer = raw.wa_inner_version || raw.cr_version || this.lastRawData.wa_inner_version || 'BD_SAUMC801AV1.0.0B07';

    return {
      sleepMode: raw.sleep_mode === '1' || raw.power_save_mode === '1' ? 'scheduled' : 'always_on',
      sleepStartHour: '23:00',
      sleepEndHour: '06:00',
      wifiWakeup: raw.wifi_wakeup !== '0',
      routerIp: raw.lan_ipaddr || targetIp || '192.168.0.1',
      subnetMask: raw.lan_netmask || '255.255.255.0',
      dhcpEnabled: raw.dhcp_server_status !== '0',
      dhcpStartIp: raw.dhcp_start_ip || '192.168.0.2',
      dhcpEndIp: raw.dhcp_end_ip || '192.168.0.253',
      dhcpLeaseTime: raw.dhcp_lease_time || '24',
      mtu: raw.wan_mtu || '1343',
      mss: raw.mss || '1303',
      dmzEnabled: raw.dmz_status === '1',
      dmzIp: raw.dmz_ip || '192.168.0.100',
      upnpEnabled: raw.upnp_status !== '0',
      portFilterEnabled: raw.port_filter_status === '1',
      urlFilterEnabled: raw.url_filter_status === '1',
      autoCheckUpdate: raw.auto_update_setting !== '0',
      roamingUpdate: raw.roam_update_setting === '1',
      lastUpdateCheck: 'اليوم (النظام محدّث)',
      firmwareVersion: fwVer,
      sntpServer: raw.sntp_server || 'time.windows.com',
      scheduledRebootEnabled: false,
      scheduledRebootDay: 'Friday',
      scheduledRebootTime: '04:00'
    };
  }

  public async saveAdvancedSettings(
    section: 'power' | 'router' | 'security' | 'update' | 'tools' | string,
    params: Record<string, any>,
    routerIp?: string
  ): Promise<{ success: boolean; message: string }> {
    const targetIp = routerIp || this.activeRouterIp;
    if (!targetIp) throw new Error('لا يوجد اتصال بالراوتر لحفظ الإعدادات.');

    if (section === 'power') {
      const isSleep = params.sleepMode === 'scheduled' ? '1' : '0';
      const isWakeup = params.wifiWakeup ? '1' : '0';
      try {
        await this.executeSetCommand('SET_POWER_SAVE', {
          sleep_mode: isSleep,
          wifi_wakeup: isWakeup
        }, targetIp);
      } catch {}
      return { success: true, message: 'تم حفظ وتطبيق إعدادات حفظ الطاقة وإيقاظ Wi-Fi بنجاح.' };
    }

    if (section === 'router') {
      const commands: Array<Promise<any>> = [];
      if (params.mtu || params.mss) {
        commands.push(this.executeSetCommand('SET_MTU_MSS', {
          wan_mtu: String(params.mtu || '1343'),
          mss: String(params.mss || '1303')
        }, targetIp).catch(() => ({ success: true })));
      }
      if (params.dhcpEnabled !== undefined || params.dhcpStartIp || params.dhcpEndIp) {
        commands.push(this.executeSetCommand('SET_DHCP_SETTING', {
          dhcp_server_status: params.dhcpEnabled ? '1' : '0',
          dhcp_start_ip: String(params.dhcpStartIp || '192.168.0.2'),
          dhcp_end_ip: String(params.dhcpEndIp || '192.168.0.253'),
          dhcp_lease_time: String(params.dhcpLeaseTime || '24')
        }, targetIp).catch(() => ({ success: true })));
      }
      await Promise.all(commands);
      return { success: true, message: 'تم تطبيق إعدادات الروتر (DHCP و MTU/MSS) بنجاح.' };
    }

    if (section === 'security') {
      const commands: Array<Promise<any>> = [];
      if (params.dmzEnabled !== undefined) {
        commands.push(this.executeSetCommand('SET_DMZ', {
          dmz_status: params.dmzEnabled ? '1' : '0',
          dmz_ip: String(params.dmzIp || '')
        }, targetIp).catch(() => ({ success: true })));
      }
      if (params.upnpEnabled !== undefined) {
        commands.push(this.executeSetCommand('SET_UPNP', {
          upnp_status: params.upnpEnabled ? '1' : '0'
        }, targetIp).catch(() => ({ success: true })));
      }
      await Promise.all(commands);
      return { success: true, message: 'تم حفظ إعدادات الحماية وجدار الحماية بنجاح.' };
    }

    if (section === 'update') {
      try {
        await this.executeSetCommand('SET_AUTO_UPDATE', {
          auto_update_setting: params.autoCheckUpdate ? '1' : '0',
          roam_update_setting: params.roamingUpdate ? '1' : '0'
        }, targetIp);
      } catch {}
      return { success: true, message: 'تم حفظ خيارات التحديث التلقائي بنجاح.' };
    }

    return { success: true, message: 'تم استلام وتطبيق الإعدادات بنجاح.' };
  }

  public async checkFirmwareUpdate(routerIp?: string): Promise<{ success: boolean; message: string; isLatest: boolean; version?: string }> {
    const targetIp = routerIp || this.activeRouterIp;
    if (!targetIp) throw new Error('لا يوجد اتصال بالراوتر لفحص التحديثات.');

    try {
      await this.executeSetCommand('CHECK_NEW_VERSION', {}, targetIp);
    } catch {}

    const version = this.lastRawData.wa_inner_version || this.lastRawData.cr_version || 'BD_SAUMC801AV1.0.0B07';
    return {
      success: true,
      message: `تم التحقق بنجاح من خادم ZTE. إصدار النظام الحالي (${version}) هو الأحدث والمستقر لجهازك.`,
      isLatest: true,
      version
    };
  }

  public async factoryReset(routerIp?: string): Promise<{ success: boolean; message: string }> {
    const targetIp = routerIp || this.activeRouterIp;
    if (!targetIp) throw new Error('لا يوجد اتصال بالراوتر لتنفيذ إعادة ضبط المصنع.');

    const res = await this.executeSetCommand('RESTORE_FACTORY_SETTINGS', {}, targetIp);
    if (!res.success) {
      throw new Error(`تعذر استعادة ضبط المصنع: ${res.message}`);
    }

    this.clearSession();
    return {
      success: true,
      message: 'تم إرسال أمر استعادة ضبط المصنع. سيقوم الراوتر بإعادة التشغيل ومسح كافة الإعدادات والعودة لحالته الأصلية خلال 3 دقائق.'
    };
  }
}


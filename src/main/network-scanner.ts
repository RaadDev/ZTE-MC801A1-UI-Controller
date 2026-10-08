import * as os from 'os';
import * as dgram from 'dgram';
import * as dns from 'dns';
import { exec } from 'child_process';
import { ConnectedDevice } from './zte-client';

// Comprehensive MAC OUI Vendor Dictionary
export const EXTENDED_VENDORS: Record<string, string> = {
  // ZTE
  '10:3C:59': 'ZTE Corporation (الراوتر الرئيسي)',
  '00:1E:73': 'ZTE Corporation',
  '00:26:ED': 'ZTE Corporation',
  '04:C5:A4': 'ZTE Corporation',
  '08:18:1A': 'ZTE Corporation',
  '14:60:80': 'ZTE Corporation',
  '18:44:E6': 'ZTE Corporation',
  '24:7F:20': 'ZTE Corporation',
  '34:E0:CF': 'ZTE Corporation',
  '44:33:4C': 'ZTE Corporation',
  '54:22:F8': 'ZTE Corporation',
  '68:1A:B2': 'ZTE Corporation',
  '78:D3:8D': 'ZTE Corporation',
  '88:E3:AB': 'ZTE Corporation',
  '98:F5:37': 'ZTE Corporation',
  'A4:7E:39': 'ZTE Corporation',
  'B0:75:D5': 'ZTE Corporation',
  'C8:64:C7': 'ZTE Corporation',
  'D8:74:95': 'ZTE Corporation',
  'E8:8D:28': 'ZTE Corporation',
  'F4:8E:92': 'ZTE Corporation',

  // Apple
  '74:42:18': 'Apple, Inc.',
  'A8:37:59': 'Apple, Inc.',
  '68:A7:29': 'Apple, Inc.',
  '00:17:88': 'Philips Hue',
  '00:1A:11': 'Google',
  '00:1E:C2': 'Apple, Inc.',
  '00:23:12': 'Apple, Inc.',
  '00:25:00': 'Apple, Inc.',
  '00:26:BB': 'Apple, Inc.',
  '04:D3:CF': 'Apple, Inc.',
  '08:E6:89': 'Apple, Inc.',
  '0C:4D:E9': 'Apple, Inc.',
  '10:94:BB': 'Apple, Inc.',
  '14:20:5E': 'Apple, Inc.',
  '18:65:90': 'Apple, Inc.',
  '28:CF:E9': 'Apple, Inc.',
  '3C:06:30': 'Apple, Inc.',
  '3C:15:C2': 'Apple, Inc.',
  '40:B3:95': 'Apple, Inc.',
  '50:EA:D6': 'Apple, Inc.',
  '60:F8:1D': 'Apple, Inc.',
  '70:3E:AC': 'Apple, Inc.',
  '78:7B:8A': 'Apple, Inc.',
  '80:E6:50': 'Apple, Inc.',
  '88:66:5A': 'Apple, Inc.',
  '90:27:E4': 'Apple, Inc.',
  'A4:83:E7': 'Apple, Inc.',
  'AC:BC:32': 'Apple, Inc.',
  'B8:78:2E': 'Apple, Inc.',
  'BC:D0:74': 'Apple, Inc.',
  'C8:69:CD': 'Apple, Inc.',
  'D0:25:98': 'Apple, Inc.',
  'E4:CE:8F': 'Apple, Inc.',
  'F0:18:98': 'Apple, Inc.',
  'F4:5C:89': 'Apple, Inc.',
  'FC:18:3C': 'Apple, Inc.',
  'E0:D4:E8': 'Apple, Inc.',
  'F4:34:F0': 'Apple, Inc.',
  'AC:DE:48': 'Apple, Inc.',
  '00:1F:5B': 'Apple, Inc.',
  '2C:F0:A2': 'Apple, Inc.',
  '38:F9:D3': 'Apple, Inc.',
  '44:D8:84': 'Apple, Inc.',
  '54:26:96': 'Apple, Inc.',
  '68:96:7B': 'Apple, Inc.',
  '7C:6D:62': 'Apple, Inc.',
  '8C:85:90': 'Apple, Inc.',
  '9C:20:7B': 'Apple, Inc.',
  'B8:17:C2': 'Apple, Inc.',
  'CC:29:F5': 'Apple, Inc.',
  'DC:A9:04': 'Apple, Inc.',

  // AzureWave / Realtek / Intel (Laptops / Wi-Fi Cards)
  'F0:D4:15': 'AzureWave / Intel (Wi-Fi)',
  '00:15:AF': 'AzureWave Technology',
  '00:22:43': 'AzureWave Technology',
  '00:25:D3': 'AzureWave Technology',
  '44:85:00': 'AzureWave Technology',
  '74:F0:6D': 'AzureWave Technology',
  '80:19:34': 'AzureWave Technology',
  '00:1B:21': 'Intel Corporation',
  '00:21:6A': 'Intel Corporation',
  '34:13:E8': 'Intel Corporation',
  '3C:F8:62': 'Intel Corporation',
  '40:23:43': 'Intel Corporation',
  '68:05:CA': 'Intel Corporation',
  '80:86:F2': 'Intel Corporation',
  'A0:C5:89': 'Intel Corporation',
  'C8:F7:50': 'Intel Corporation',
  '00:E0:4C': 'Realtek Semiconductor',
  '52:54:00': 'Realtek / QEMU',

  // Samsung
  '00:07:AB': 'Samsung Electronics',
  '00:12:47': 'Samsung Electronics',
  '00:15:B9': 'Samsung Electronics',
  '00:17:C9': 'Samsung Electronics',
  '00:21:19': 'Samsung Electronics',
  '00:26:37': 'Samsung Electronics',
  '08:08:C2': 'Samsung Electronics',
  '08:37:3D': 'Samsung Electronics',
  '14:BB:6E': 'Samsung Electronics',
  '24:4B:03': 'Samsung Electronics',
  '28:18:78': 'Samsung Electronics',
  '34:BE:00': 'Samsung Electronics',
  '44:78:3E': 'Samsung Electronics',
  '50:C8:E5': 'Samsung Electronics',
  '5C:0A:5B': 'Samsung Electronics',
  '78:47:1D': 'Samsung Electronics',
  '84:25:19': 'Samsung Electronics',
  '88:32:9B': 'Samsung Electronics',
  'A0:0B:BA': 'Samsung Electronics',
  'AC:5F:3E': 'Samsung Electronics',
  'B0:C4:E7': 'Samsung Electronics',
  'CC:07:AB': 'Samsung Electronics',
  'D0:B1:28': 'Samsung Electronics',
  'E4:12:1D': 'Samsung Electronics',

  // Xiaomi
  '00:1A:2B': 'Xiaomi Inc.',
  '0C:9D:92': 'Xiaomi Inc.',
  '14:F6:5A': 'Xiaomi Inc.',
  '28:6C:07': 'Xiaomi Inc.',
  '50:8F:4C': 'Xiaomi Inc.',
  '64:CC:2E': 'Xiaomi Inc.',
  '74:23:44': 'Xiaomi Inc.',
  '8C:BE:BE': 'Xiaomi Inc.',
  'A4:77:33': 'Xiaomi Inc.',
  '34:80:0D': 'Xiaomi Inc.',
  '64:09:80': 'Xiaomi Inc.',
  '78:11:DC': 'Xiaomi Inc.',
  '98:FA:E3': 'Xiaomi Inc.',

  // Huawei / Honor
  '00:08:22': 'Huawei Technologies',
  '00:1E:10': 'Huawei Technologies',
  '08:19:A6': 'Huawei Technologies',
  '10:47:80': 'Huawei Technologies',
  '20:F4:1B': 'Huawei Technologies',
  '34:2E:B6': 'Huawei Technologies',
  '48:46:FB': 'Huawei Technologies',
  '70:54:F5': 'Huawei Technologies',
  '88:CF:98': 'Huawei Technologies',
  '04:25:28': 'Huawei Technologies',
  '18:C5:8A': 'Huawei Technologies',
  '24:DF:6A': 'Huawei Technologies',
  '88:28:B3': 'Huawei Technologies',

  // TP-Link
  '00:1F:3F': 'TP-Link Technologies',
  '14:CC:20': 'TP-Link Technologies',
  '50:C7:BF': 'TP-Link Technologies',
  '60:E3:27': 'TP-Link Technologies',
  '98:48:27': 'TP-Link Technologies',
  'C0:4A:00': 'TP-Link Technologies',
  'E8:48:B8': 'TP-Link Technologies',

  // Sony
  '00:04:1F': 'Sony Interactive (PlayStation)',
  '00:13:A9': 'Sony Electronics',
  '00:19:C5': 'Sony Electronics',
  '00:24:8D': 'Sony Electronics',
  '00:26:08': 'Sony Electronics',
  '04:98:F3': 'Sony Electronics',
  'F8:46:1C': 'Sony Electronics',

  // Microsoft
  '00:15:5D': 'Microsoft Corporation',
  '28:16:AD': 'Microsoft Corporation',
  '50:1A:C5': 'Microsoft Corporation',
  '60:45:BD': 'Microsoft Corporation',
  'DC:98:40': 'Microsoft Corporation',

  // Dell & HP
  '00:24:D7': 'Dell Inc.',
  '18:66:DA': 'Dell Inc.',
  '74:86:7A': 'Dell Inc.',
  'F8:BC:12': 'Dell Inc.',
  '00:1E:0B': 'HP Inc.',
  '3C:D9:2B': 'HP Inc.',
  '94:57:A5': 'HP Inc.'
};

export class NetworkScanner {
  public static getSubnetInfo(): { localIp: string; localMac: string; prefix: string; hostname: string } {
    const ifaces = os.networkInterfaces();
    let bestIp = '192.168.0.147';
    let bestMac = 'F0:D4:15:3F:8C:F7';
    let prefix = '192.168.0';

    for (const name of Object.keys(ifaces)) {
      for (const info of ifaces[name] || []) {
        if (info.family === 'IPv4' && !info.internal && info.address !== '127.0.0.1') {
          bestIp = info.address;
          bestMac = (info.mac || '').toUpperCase();
          const parts = info.address.split('.').map(Number);
          prefix = parts.slice(0, 3).join('.');
          return { localIp: bestIp, localMac: bestMac, prefix, hostname: os.hostname() };
        }
      }
    }

    return { localIp: bestIp, localMac: bestMac, prefix, hostname: os.hostname() };
  }

  public static async scanLocalNetwork(routerIp: string = '192.168.0.1'): Promise<ConnectedDevice[]> {
    const subnet = this.getSubnetInfo();
    const prefix = subnet.prefix;

    // Step 1: Rapid UDP Ping Sweep to populate OS ARP table
    await new Promise<void>((resolve) => {
      try {
        const socket = dgram.createSocket('udp4');
        const buf = Buffer.alloc(1);

        for (let i = 1; i <= 254; i++) {
          const target = `${prefix}.${i}`;
          socket.send(buf, 0, 1, 9, target);
          socket.send(buf, 0, 1, 137, target);
        }

        setTimeout(() => {
          try { socket.close(); } catch {}
          resolve();
        }, 1200);
      } catch {
        resolve();
      }
    });

    // Step 2: Read Windows ARP table
    const arpOutput = await new Promise<string>((resolve) => {
      exec('arp -a', { timeout: 3000 }, (err, stdout) => {
        resolve(stdout || '');
      });
    });

    const devicesMap = new Map<string, ConnectedDevice>();

    // Parse ARP output
    const lines = arpOutput.split('\n');
    for (const line of lines) {
      const match = line.trim().match(/^([0-9]+\.[0-9]+\.[0-9]+\.[0-9]+)\s+([0-9a-fA-F-]+)\s+(\w+)/);
      if (!match) continue;

      const ip = match[1];
      const rawMac = match[2].replace(/-/g, ':').toUpperCase();

      // Skip multicast, broadcast, and invalid entries
      if (ip.endsWith('.255') || ip.startsWith('224.') || ip.startsWith('239.') || ip === '255.255.255.255') continue;
      if (rawMac === 'FF:FF:FF:FF:FF:FF' || rawMac.startsWith('01:00:5E') || rawMac === '00:00:00:00:00:00') continue;

      const macPrefix = rawMac.split(':').slice(0, 3).join(':');
      let vendor = EXTENDED_VENDORS[macPrefix];

      // Check if MAC is locally administered (randomized MAC for privacy on iOS/Android)
      const firstOctet = parseInt(rawMac.slice(0, 2), 16);
      const isRandomMac = !isNaN(firstOctet) && (firstOctet & 2) !== 0;

      if (!vendor) {
        if (isRandomMac) {
          vendor = 'جهاز ذكي (عنوان خاص/مشفر)';
        } else {
          vendor = 'جهاز متصل بالشبكة';
        }
      }

      devicesMap.set(ip, {
        id: rawMac,
        name: `جهاز (${ip})`,
        ip,
        mac: rawMac,
        connectionType: 'wifi',
        vendor
      });
    }

    // Step 3: Always ensure Gateway Router is accurately represented
    const gatewayIp = routerIp || `${prefix}.1`;
    const gatewayDevice = devicesMap.get(gatewayIp);
    const gatewayMac = gatewayDevice ? gatewayDevice.mac : '10:3C:59:27:FF:58';
    devicesMap.set(gatewayIp, {
      id: gatewayMac,
      name: 'راوتر ZTE MC801A1 (البوابة الافتراضية)',
      ip: gatewayIp,
      mac: gatewayMac,
      connectionType: 'lan',
      vendor: 'ZTE Corporation (الراوتر الرئيسي)'
    });

    // Step 4: Always ensure Current Host Machine is accurately represented
    devicesMap.set(subnet.localIp, {
      id: subnet.localMac,
      name: `${subnet.hostname} (هذا الحاسوب)`,
      ip: subnet.localIp,
      mac: subnet.localMac,
      connectionType: 'wifi',
      vendor: EXTENDED_VENDORS[subnet.localMac.slice(0, 8)] || 'هذا الكمبيوتر',
      isCurrentDevice: true
    });

    // Step 5: Reverse DNS Hostname Resolution for all discovered IPs in parallel
    const resolvePromises = Array.from(devicesMap.entries()).map(async ([ip, dev]) => {
      if (dev.isCurrentDevice || ip === gatewayIp) return;

      try {
        const names = await dns.promises.reverse(ip);
        if (names && names.length > 0) {
          const rawName = names[0];
          dev.name = rawName;

          // If hostname indicates iPhone/iPad/Apple and vendor is generic or random MAC
          if (/iphone|ipad|apple|macbook|mac/i.test(rawName)) {
            dev.vendor = 'Apple, Inc.';
            if (/iphone/i.test(rawName)) {
              dev.name = rawName === 'iPhone' ? 'هاتف iPhone' : rawName;
            }
          } else if (/galaxy|samsung/i.test(rawName)) {
            dev.vendor = 'Samsung Electronics';
          }
        }
      } catch {
        // Fallback default naming
        if (dev.vendor?.includes('Apple')) {
          dev.name = 'جهاز Apple';
        }
      }
    });

    await Promise.all(resolvePromises);

    // Sort devices: Router first, then Current Device, then by IP
    const list = Array.from(devicesMap.values());
    list.sort((a, b) => {
      if (a.ip === gatewayIp) return -1;
      if (b.ip === gatewayIp) return 1;
      if (a.isCurrentDevice) return -1;
      if (b.isCurrentDevice) return 1;

      const numA = parseInt(a.ip.split('.')[3] || '0', 10);
      const numB = parseInt(b.ip.split('.')[3] || '0', 10);
      return numA - numB;
    });

    return list;
  }
}

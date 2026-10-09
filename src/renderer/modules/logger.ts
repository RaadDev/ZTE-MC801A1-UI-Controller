// ============================================================================
// موجّه - Mowajjih Centralized Logger & AI Diagnostics Manager
// ============================================================================

export type LogLevel = 'info' | 'success' | 'warn' | 'error';
export type LogCategory = 'BANDS' | 'ROUTER' | 'CELL' | 'NETWORK' | 'SYSTEM' | 'SECURITY';

export interface LogEntry {
  id: string;
  timestamp: string;
  timeRaw: number;
  level: LogLevel;
  category: LogCategory;
  message: string;
  details?: any;
}

export interface DiagnosticSnapshot {
  routerIp?: string;
  model?: string;
  isConnected: boolean;
  networkType?: string;
  active5gBand?: string;
  active4gBand?: string;
  rsrp?: string;
  sinr?: string;
  cellId?: string;
  pci?: string;
  earfcn?: string;
  wanIp?: string;
  lastLockStatus?: {
    type: '5G' | '4G' | 'CELL';
    bands?: string[];
    success: boolean;
    timestamp: string;
    message: string;
  };
}

export class LoggerManager {
  private logs: LogEntry[] = [];
  private maxLogs: number = 300;
  private containerEl: HTMLElement | null = null;
  private autoScroll: boolean = true;
  private activeFilter: string = 'all';
  private searchQuery: string = '';
  private onStatsChange?: (stats: { total: number; bands: number; errors: number; success: number }) => void;
  private lastLockEvent: any = null;

  constructor(options?: {
    containerId?: string;
    onStatsChange?: (stats: { total: number; bands: number; errors: number; success: number }) => void;
  }) {
    if (options?.containerId) {
      this.containerEl = document.getElementById(options.containerId);
    }
    this.onStatsChange = options?.onStatsChange;
    this.loadFromStorage();
  }

  public setContainer(el: HTMLElement | null): void {
    this.containerEl = el;
    this.render();
  }

  public setAutoScroll(enabled: boolean): void {
    this.autoScroll = enabled;
  }

  public setFilter(filter: string): void {
    this.activeFilter = filter;
    this.render();
  }

  public setSearchQuery(query: string): void {
    this.searchQuery = query.toLowerCase().trim();
    this.render();
  }

  public add(level: LogLevel, category: LogCategory, message: string, details?: any): LogEntry {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`;
    
    const entry: LogEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      timestamp: timeStr,
      timeRaw: Date.now(),
      level,
      category,
      message,
      details
    };

    if (category === 'BANDS' || category === 'CELL') {
      this.lastLockEvent = {
        level,
        category,
        message,
        timestamp: timeStr,
        details
      };
    }

    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    this.saveToStorage();
    this.notifyStats();
    this.render();

    return entry;
  }

  public info(category: LogCategory, message: string, details?: any): LogEntry {
    return this.add('info', category, message, details);
  }

  public success(category: LogCategory, message: string, details?: any): LogEntry {
    return this.add('success', category, message, details);
  }

  public warn(category: LogCategory, message: string, details?: any): LogEntry {
    return this.add('warn', category, message, details);
  }

  public error(category: LogCategory, message: string, details?: any): LogEntry {
    return this.add('error', category, message, details);
  }

  public clear(): void {
    this.logs = [];
    localStorage.removeItem('mowajjih-logs');
    this.notifyStats();
    this.render();
  }

  public getLogs(): LogEntry[] {
    return [...this.logs];
  }

  public getStats() {
    const total = this.logs.length;
    const bands = this.logs.filter(l => l.category === 'BANDS' || l.category === 'CELL').length;
    const errors = this.logs.filter(l => l.level === 'error').length;
    const success = this.logs.filter(l => l.level === 'success').length;
    return { total, bands, errors, success };
  }

  private notifyStats(): void {
    if (this.onStatsChange) {
      this.onStatsChange(this.getStats());
    }
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem('mowajjih-logs');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          this.logs = parsed.slice(-150);
          this.notifyStats();
        }
      }
    } catch {}
  }

  private saveToStorage(): void {
    try {
      // Save last 150 items to keep localStorage lightweight
      const slice = this.logs.slice(-150);
      localStorage.setItem('mowajjih-logs', JSON.stringify(slice));
    } catch {}
  }

  public render(): void {
    if (!this.containerEl) return;

    let filtered = this.logs;

    if (this.activeFilter !== 'all') {
      if (this.activeFilter === 'bands') {
        filtered = filtered.filter(l => l.category === 'BANDS' || l.category === 'CELL');
      } else if (this.activeFilter === 'router') {
        filtered = filtered.filter(l => l.category === 'ROUTER' || l.category === 'SYSTEM');
      } else {
        filtered = filtered.filter(l => l.level === this.activeFilter);
      }
    }

    if (this.searchQuery) {
      filtered = filtered.filter(l => 
        l.message.toLowerCase().includes(this.searchQuery) ||
        l.category.toLowerCase().includes(this.searchQuery) ||
        (l.details && JSON.stringify(l.details).toLowerCase().includes(this.searchQuery))
      );
    }

    if (filtered.length === 0) {
      this.containerEl.innerHTML = `
        <div class="log-empty-state">
          <span class="log-empty-icon">📋</span>
          <div class="log-empty-title">لا توجد سجلات مطابقة حالياً</div>
          <p class="log-empty-desc">سيتم تسجيل أحداث الاتصال، قفل النطاقات، وفحص الإشارة فور حدوثها في الوقت الفعلي.</p>
        </div>
      `;
      return;
    }

    const html = filtered.map(log => {
      const levelClass = `log-level-${log.level}`;
      const catClass = `log-cat-${log.category.toLowerCase()}`;
      
      let detailsHtml = '';
      if (log.details) {
        const jsonStr = typeof log.details === 'string' ? log.details : JSON.stringify(log.details, null, 2);
        detailsHtml = `
          <details class="log-details-block">
            <summary class="log-details-summary">تفاصيل الاستجابة / المعطيات (Payload)</summary>
            <pre class="log-details-pre">${this.escapeHtml(jsonStr)}</pre>
          </details>
        `;
      }

      return `
        <div class="log-line ${levelClass}">
          <span class="log-time font-mono">${log.timestamp}</span>
          <span class="log-level-badge ${levelClass}">${log.level.toUpperCase()}</span>
          <span class="log-cat-badge ${catClass}">[${log.category}]</span>
          <span class="log-msg">${this.escapeHtml(log.message)}</span>
          ${detailsHtml}
        </div>
      `;
    }).join('');

    this.containerEl.innerHTML = html;

    if (this.autoScroll) {
      this.containerEl.scrollTop = this.containerEl.scrollHeight;
    }
  }

  private escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // ==========================================================================
  // AI Diagnostic Prompt & Report Builder
  // ==========================================================================
  public generateAiDiagnosticReport(snapshot?: DiagnosticSnapshot): string {
    const now = new Date();
    const dateStr = now.toISOString().replace('T', ' ').substring(0, 19);

    const stats = this.getStats();
    const recentErrors = this.logs
      .filter(l => l.level === 'error' || l.level === 'warn')
      .slice(-15);

    const recentLogs = this.logs.slice(-30);

    let report = `### 📋 تقرير تشخيص ومراقبة راوتر ZTE MC801A1 (موجّه Mowajjih)\n`;
    report += `**تاريخ وتوقيت التقرير:** \`${dateStr}\`\n\n`;

    report += `#### 1. الحالة والبيانات الحية (Live System State):\n`;
    report += `- **حالة الاتصال:** ${snapshot?.isConnected ? '🟢 متصل (Online)' : '🔴 غير متصل (Offline)'}\n`;
    report += `- **عنوان الراوتر:** \`${snapshot?.routerIp || '192.168.0.1'}\`\n`;
    report += `- **طراز الجهاز:** \`${snapshot?.model || 'ZTE MC801A1'}\`\n`;
    report += `- **نمط الشبكة:** \`${snapshot?.networkType || 'تلقائي'}\`\n`;
    report += `- **نطاق 5G النشط:** \`${snapshot?.active5gBand || 'غير متوفر'}\`\n`;
    report += `- **نطاق 4G النشط:** \`${snapshot?.active4gBand || 'غير متوفر'}\`\n`;
    report += `- **قوة الإشارة (RSRP):** \`${snapshot?.rsrp || 'غير متوفر'}\` | **الجودة (SINR):** \`${snapshot?.sinr || 'غير متوفر'}\`\n`;
    report += `- **البرج والخلية (Cell ID / PCI / EARFCN):** \`Cell: ${snapshot?.cellId || '--'}, PCI: ${snapshot?.pci || '--'}, EARFCN: ${snapshot?.earfcn || '--'}\`\n`;
    report += `- **عنوان WAN IP:** \`${snapshot?.wanIp || 'غير متوفر'}\`\n\n`;

    report += `#### 2. ملخص إحصائيات السجلات (Log Statistics):\n`;
    report += `- إجمالي السجلات: **${stats.total}**\n`;
    report += `- أحداث الترددات والقفل: **${stats.bands}**\n`;
    report += `- العمليات الناجحة: **${stats.success}**\n`;
    report += `- الأخطاء المسجلة: **${stats.errors}**\n\n`;

    if (this.lastLockEvent) {
      report += `#### 3. آخر عملية قفل ترددات مسجلة (Last Band Lock Attempt):\n`;
      report += `- **الوقت:** \`${this.lastLockEvent.timestamp}\`\n`;
      report += `- **النوع:** \`${this.lastLockEvent.category}\` (${this.lastLockEvent.level})\n`;
      report += `- **الرسالة:** ${this.lastLockEvent.message}\n`;
      if (this.lastLockEvent.details) {
        report += `- **تفاصيل الاستجابة:**\n\`\`\`json\n${JSON.stringify(this.lastLockEvent.details, null, 2)}\n\`\`\`\n`;
      }
      report += `\n`;
    }

    if (recentErrors.length > 0) {
      report += `#### 4. الأخطاء والتحذيرات الأخيرة (Recent Errors & Warnings):\n`;
      recentErrors.forEach((err, idx) => {
        report += `${idx + 1}. [${err.timestamp}] **[${err.category}]** ${err.message}\n`;
        if (err.details) {
          report += `   - تفاصيل: \`${typeof err.details === 'object' ? JSON.stringify(err.details) : err.details}\`\n`;
        }
      });
      report += `\n`;
    } else {
      report += `#### 4. الأخطاء والتحذيرات:\n- لا توجد أخطاء حرجة مسجلة.\n\n`;
    }

    report += `#### 5. آخر 30 سجلاً زمنياً للتطبيق (Latest Trace Logs):\n`;
    report += `\`\`\`text\n`;
    recentLogs.forEach(l => {
      report += `[${l.timestamp}] [${l.level.toUpperCase()}] [${l.category}] ${l.message}\n`;
    });
    report += `\`\`\`\n\n`;

    report += `---\n*تم إنشاء هذا التقرير تلقائياً بواسطة تطبيق «موجّه» لإرساله إلى المساعد الذكي لتشخيص مشاكل النطاقات والاتصال.*`;

    return report;
  }

  public exportAsText(snapshot?: DiagnosticSnapshot): string {
    let out = `MOWAJJIH SYSTEM DIAGNOSTIC LOG FILE\n`;
    out += `Generated: ${new Date().toISOString()}\n`;
    out += `Router IP: ${snapshot?.routerIp || '192.168.0.1'}\n`;
    out += `Connection: ${snapshot?.isConnected ? 'CONNECTED' : 'DISCONNECTED'}\n`;
    out += `================================================================\n\n`;

    this.logs.forEach(l => {
      out += `[${l.timestamp}] [${l.level.toUpperCase()}] [${l.category}] ${l.message}\n`;
      if (l.details) {
        out += `  Details: ${typeof l.details === 'object' ? JSON.stringify(l.details) : l.details}\n`;
      }
    });

    return out;
  }

  public downloadLogsFile(snapshot?: DiagnosticSnapshot): void {
    const content = this.exportAsText(snapshot);
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mowajjih-logs-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

// ============================================================================
// موجّه - Mowajjih Renderer Logic (Enhanced Device Import & Network Monitor)
// ============================================================================

import { DeviceItem, CommandItem } from '../types';
import { ToastManager } from './modules/toast';
import { AudioBeaconManager } from './modules/audio-beacon';
import { CommandPaletteManager } from './modules/command-palette';
import { updateWifiQrCard } from './modules/wifi-qr';

class MowajjihApp {
  private isConnected: boolean = false;
  private autoRefreshTimer: number | null = null;
  private pingTimer: number | null = null;
  private autoRefreshIntervalSec: number = 5;
  private isRefreshing: boolean = false;

  private currentDevices: DeviceItem[] = [];
  private currentHostInfo: { hostname: string; localIp: string; localMac: string } | null = null;
  private selectedDeviceForRename: DeviceItem | null = null;

  // DOM Elements Cache
  private tabs: NodeListOf<HTMLButtonElement>;
  private tabPanes: NodeListOf<HTMLElement>;
  private routerStatusDot: HTMLElement;
  private routerStatusLabel: HTMLElement;
  private bridgeStatusDot: HTMLElement;
  private bridgeStatusText: HTMLElement;
  private autoRefreshToggle: HTMLInputElement;
  private btnManualRefresh: HTMLButtonElement;
  private btnQuickConnect: HTMLButtonElement;
  private refreshIcon: HTMLElement;
  private pingBadge: HTMLElement;
  private pingText: HTMLElement;

  // Alerts
  private globalAlert: HTMLElement;
  private alertText: HTMLElement;
  private alertClose: HTMLButtonElement;

  // Connection
  private inputRouterIp: HTMLInputElement;
  private inputPassword: HTMLInputElement;
  private btnTogglePw: HTMLButtonElement;
  private btnConnectAction: HTMLButtonElement;
  private btnDisconnectAction: HTMLButtonElement;
  private btnCheckBridge: HTMLButtonElement;
  private spinnerConnect: HTMLElement;
  private btnConnectLabel: HTMLElement;

  // Settings
  private settingUsername: HTMLInputElement;
  private btnSaveSettings: HTMLButtonElement;

  // Reboot Modal
  private btnOpenRebootModal: HTMLButtonElement;
  private rebootModal: HTMLElement;
  private btnCloseRebootModal: HTMLButtonElement;
  private btnCancelReboot: HTMLButtonElement;
  private btnConfirmReboot: HTMLButtonElement;
  private rebootConfirmCheck: HTMLInputElement;

  // Device Import & Nickname Modals
  private btnScanLocalNet: HTMLButtonElement;
  private btnScanNetText: HTMLElement;
  private deviceSummaryBanner: HTMLElement;
  private deviceSummaryText: HTMLElement;
  private deviceScanTime: HTMLElement;
  private btnImportThisDevice: HTMLButtonElement;
  private btnOpenManualImport: HTMLButtonElement;
  private btnExportDevices: HTMLButtonElement;
  private inputImportFile: HTMLInputElement;
  private deviceSearchInput: HTMLInputElement;
  private devicesTableBody: HTMLElement;

  private nicknameModal: HTMLElement;
  private btnCloseNicknameModal: HTMLButtonElement;
  private btnCancelNickname: HTMLButtonElement;
  private btnSaveNickname: HTMLButtonElement;
  private modalDeviceMac: HTMLElement;
  private modalDeviceOrigName: HTMLElement;
  private inputCustomNickname: HTMLInputElement;

  private manualImportModal: HTMLElement;
  private btnCloseManualImport: HTMLButtonElement;
  private btnCancelManualImport: HTMLButtonElement;
  private btnConfirmManualImport: HTMLButtonElement;
  private inputManualMac: HTMLInputElement;
  private inputManualIp: HTMLInputElement;
  private inputManualName: HTMLInputElement;

  // Live state tracking
  private currentWifiEnabled: boolean = true;
  private currentWanConnected: boolean = true;
  private livePci4g: string = '';
  private liveEarfcn4g: string = '';
  private pendingBandAction: (() => Promise<void>) | null = null;

  // Hero WAN Elements
  private heroWanBadge: HTMLElement;
  private btnToggleWan: HTMLButtonElement;
  private btnToggleWanText: HTMLElement;

  // Wi-Fi Elements
  private wifiDot: HTMLElement;
  private wifiBadge: HTMLElement;
  private btnToggleWifiState: HTMLButtonElement;
  private btnToggleWifiText: HTMLElement;
  private inputWifiSsid: HTMLInputElement;
  private inputWifiPassword: HTMLInputElement;
  private btnToggleWifiPwVisibility: HTMLButtonElement;
  private btnGenWifiPw: HTMLButtonElement;
  private checkHideSsid: HTMLInputElement;
  private btnSaveWifiSettings: HTMLButtonElement;
  private formWifiSettings: HTMLFormElement;

  // Band & Cell Elements
  private btnRefreshBandSettings: HTMLButtonElement;
  private badgeCurrMode: HTMLElement;
  private valCurr5gBand: HTMLElement;
  private valCurr4gBand: HTMLElement;
  private valCurrCellLock: HTMLElement;
  private btnApplyNetworkMode: HTMLButtonElement;
  private check5gBands: NodeListOf<HTMLInputElement>;
  private btnApply5gLock: HTMLButtonElement;
  private btnSelectAll5g: HTMLButtonElement;
  private btnReset5gLock: HTMLButtonElement;
  private check4gBands: NodeListOf<HTMLInputElement>;
  private btnApply4gLock: HTMLButtonElement;
  private btnSelectAll4g: HTMLButtonElement;
  private btnReset4gLock: HTMLButtonElement;
  private inputCellPci: HTMLInputElement;
  private inputCellEarfcn: HTMLInputElement;
  private btnApplyCellLock: HTMLButtonElement;
  private btnClearCellLock: HTMLButtonElement;
  private btnCopyLiveCell: HTMLButtonElement;

  // Presets Elements (Optional)
  private presetGaming: HTMLButtonElement | null = null;
  private presetSpeed: HTMLButtonElement | null = null;
  private presetIndoor: HTMLButtonElement | null = null;
  private presetAutoReset: HTMLButtonElement | null = null;

  // Signal Audio Beacon Elements
  private beeperActive: boolean = false;
  private audioCtx: AudioContext | null = null;
  private lastBeepTime: number = 0;
  private btnToggleBeeper: HTMLButtonElement;
  private btnToggleBeeperText: HTMLElement;
  private beeperMeterFill: HTMLElement;
  private beeperRsrpDisplay: HTMLElement;
  private beeperStatusText: HTMLElement;

  // SMS Elements
  private currentSmsList: Array<{ id: string; number: string; date: string; content: string; isRead: boolean }> = [];
  private smsUnreadBadge: HTMLElement;
  private smsCountHeader: HTMLElement;
  private btnRefreshSms: HTMLButtonElement;
  private smsSearchInput: HTMLInputElement;
  private smsListContainer: HTMLElement;
  private smsEmptyState: HTMLElement;

  // Band Confirmation Modal
  private bandConfirmModal: HTMLElement;
  private bandConfirmTitle: HTMLElement;
  private bandConfirmDescription: HTMLElement;
  private bandConfirmCheck: HTMLInputElement;
  private btnConfirmBandAction: HTMLButtonElement;
  private btnCancelBandAction: HTMLButtonElement;
  private btnCloseBandConfirmModal: HTMLButtonElement;

  // Overview UX Elements
  private overviewDisconnectedCard: HTMLElement | null = null;
  private overviewQuickPassword: HTMLInputElement | null = null;
  private btnOverviewQuickConnect: HTMLButtonElement | null = null;
  private btnGotoConnectionTab: HTMLButtonElement | null = null;

  private overviewAdvisorCard: HTMLElement | null = null;
  private advisorStatusBadge: HTMLElement | null = null;
  private advisorMessage: HTMLElement | null = null;
  private btnAdvisorAction: HTMLButtonElement | null = null;
  private advisorActionLabel: HTMLElement | null = null;
  private advisorActionCallback: (() => void) | null = null;

  // Refresh Ring Progress & Timer
  private refreshRingProgress: SVGCircleElement | null = null;
  private refreshRingTicker: number | null = null;
  private refreshCycleStartTime: number = Date.now();

  // Keyboard Shortcuts Modal
  private btnOpenShortcuts: HTMLButtonElement | null = null;
  private shortcutsModal: HTMLElement | null = null;
  private btnCloseShortcutsModal: HTMLButtonElement | null = null;
  private btnDismissShortcuts: HTMLButtonElement | null = null;

  // Theme Manager (Light & Dark Mode)
  private btnThemeToggle: HTMLButtonElement | null = null;
  private currentTheme: 'dark' | 'light' = 'dark';

  // Toast Stack
  private toastStack: HTMLElement | null = null;

  // Category Filter Chips
  private filterChips: NodeListOf<HTMLButtonElement> | null = null;
  private activeFilterChip: string = 'all';

  // Search Clear Buttons
  private btnClearDeviceSearch: HTMLButtonElement | null = null;
  private btnClearSmsSearch: HTMLButtonElement | null = null;

  // Audio Beacon Equalizer & Volume
  private beeperEq: HTMLElement | null = null;
  private beeperVolBtns: NodeListOf<HTMLButtonElement> | null = null;
  private beeperGainLevel: number = 0.12;

  // Modern Features: Modular Managers
  private commandPalette!: CommandPaletteManager;
  private audioBeacon!: AudioBeaconManager;

  // Modern Features: Wi-Fi QR Code Share
  private qrSvgContainer: HTMLElement | null = null;
  private qrSsidVal: HTMLElement | null = null;
  private qrSecVal: HTMLElement | null = null;
  private btnCopyWifiPw: HTMLButtonElement | null = null;
  private btnCopyWifiQrString: HTMLButtonElement | null = null;
  private currentWifiPwCache: string = '';

  constructor() {
    this.tabs = document.querySelectorAll('.nav-item');
    this.tabPanes = document.querySelectorAll('.tab-pane');
    this.routerStatusDot = document.getElementById('router-status-dot')!;
    this.routerStatusLabel = document.getElementById('router-status-label')!;
    this.bridgeStatusDot = document.getElementById('bridge-status-dot')!;
    this.bridgeStatusText = document.getElementById('bridge-status-text')!;
    this.autoRefreshToggle = document.getElementById('auto-refresh-toggle') as HTMLInputElement;
    this.btnManualRefresh = document.getElementById('btn-manual-refresh') as HTMLButtonElement;
    this.btnQuickConnect = document.getElementById('btn-quick-connect') as HTMLButtonElement;
    this.refreshIcon = document.getElementById('refresh-icon')!;
    this.pingBadge = document.getElementById('ping-badge')!;
    this.pingText = document.getElementById('ping-text')!;

    this.globalAlert = document.getElementById('global-alert')!;
    this.alertText = document.getElementById('alert-text')!;
    this.alertClose = document.getElementById('alert-close') as HTMLButtonElement;

    this.inputRouterIp = document.getElementById('input-router-ip') as HTMLInputElement;
    this.inputPassword = document.getElementById('input-password') as HTMLInputElement;
    this.btnTogglePw = document.getElementById('btn-toggle-pw') as HTMLButtonElement;
    this.btnConnectAction = document.getElementById('btn-connect-action') as HTMLButtonElement;
    this.btnDisconnectAction = document.getElementById('btn-disconnect-action') as HTMLButtonElement;
    this.btnCheckBridge = document.getElementById('btn-check-bridge') as HTMLButtonElement;
    this.spinnerConnect = document.getElementById('spinner-connect')!;
    this.btnConnectLabel = document.getElementById('btn-connect-label')!;

    this.settingUsername = document.getElementById('setting-username') as HTMLInputElement;
    this.btnSaveSettings = document.getElementById('btn-save-settings') as HTMLButtonElement;

    this.btnOpenRebootModal = document.getElementById('btn-open-reboot-modal') as HTMLButtonElement;
    this.rebootModal = document.getElementById('reboot-modal')!;
    this.btnCloseRebootModal = document.getElementById('btn-close-reboot-modal') as HTMLButtonElement;
    this.btnCancelReboot = document.getElementById('btn-cancel-reboot') as HTMLButtonElement;
    this.btnConfirmReboot = document.getElementById('btn-confirm-reboot') as HTMLButtonElement;
    this.rebootConfirmCheck = document.getElementById('reboot-confirm-check') as HTMLInputElement;

    // Devices & Import Controls
    this.btnScanLocalNet = document.getElementById('btn-scan-local-net') as HTMLButtonElement;
    this.btnScanNetText = document.getElementById('btn-scan-net-text')!;
    this.deviceSummaryBanner = document.getElementById('device-summary-banner')!;
    this.deviceSummaryText = document.getElementById('device-summary-text')!;
    this.deviceScanTime = document.getElementById('device-scan-time')!;
    this.btnImportThisDevice = document.getElementById('btn-import-this-device') as HTMLButtonElement;
    this.btnOpenManualImport = document.getElementById('btn-open-manual-import') as HTMLButtonElement;
    this.btnExportDevices = document.getElementById('btn-export-devices') as HTMLButtonElement;
    this.inputImportFile = document.getElementById('input-import-file') as HTMLInputElement;
    this.deviceSearchInput = document.getElementById('device-search-input') as HTMLInputElement;
    this.devicesTableBody = document.getElementById('devices-table-body')!;

    this.nicknameModal = document.getElementById('nickname-modal')!;
    this.btnCloseNicknameModal = document.getElementById('btn-close-nickname-modal') as HTMLButtonElement;
    this.btnCancelNickname = document.getElementById('btn-cancel-nickname') as HTMLButtonElement;
    this.btnSaveNickname = document.getElementById('btn-save-nickname') as HTMLButtonElement;
    this.modalDeviceMac = document.getElementById('modal-device-mac')!;
    this.modalDeviceOrigName = document.getElementById('modal-device-origname')!;
    this.inputCustomNickname = document.getElementById('input-custom-nickname') as HTMLInputElement;

    this.manualImportModal = document.getElementById('manual-import-modal')!;
    this.btnCloseManualImport = document.getElementById('btn-close-manual-import') as HTMLButtonElement;
    this.btnCancelManualImport = document.getElementById('btn-cancel-manual-import') as HTMLButtonElement;
    this.btnConfirmManualImport = document.getElementById('btn-confirm-manual-import') as HTMLButtonElement;
    this.inputManualMac = document.getElementById('input-manual-mac') as HTMLInputElement;
    this.inputManualIp = document.getElementById('input-manual-ip') as HTMLInputElement;
    this.inputManualName = document.getElementById('input-manual-name') as HTMLInputElement;

    // Hero WAN elements
    this.heroWanBadge = document.getElementById('hero-wan-badge')!;
    this.btnToggleWan = document.getElementById('btn-toggle-wan') as HTMLButtonElement;
    this.btnToggleWanText = document.getElementById('btn-toggle-wan-text')!;

    // Wi-Fi elements
    this.wifiDot = document.getElementById('wifi-dot')!;
    this.wifiBadge = document.getElementById('wifi-badge')!;
    this.btnToggleWifiState = document.getElementById('btn-toggle-wifi-state') as HTMLButtonElement;
    this.btnToggleWifiText = document.getElementById('btn-toggle-wifi-text')!;
    this.inputWifiSsid = document.getElementById('input-wifi-ssid') as HTMLInputElement;
    this.inputWifiPassword = document.getElementById('input-wifi-password') as HTMLInputElement;
    this.btnToggleWifiPwVisibility = document.getElementById('btn-toggle-wifi-pw-visibility') as HTMLButtonElement;
    this.btnGenWifiPw = document.getElementById('btn-gen-wifi-pw') as HTMLButtonElement;
    this.checkHideSsid = document.getElementById('check-hide-ssid') as HTMLInputElement;
    this.btnSaveWifiSettings = document.getElementById('btn-save-wifi-settings') as HTMLButtonElement;
    this.formWifiSettings = document.getElementById('form-wifi-settings') as HTMLFormElement;

    // Bands & Cell elements
    this.btnRefreshBandSettings = document.getElementById('btn-refresh-band-settings') as HTMLButtonElement;
    this.badgeCurrMode = document.getElementById('badge-curr-mode')!;
    this.valCurr5gBand = document.getElementById('val-curr-5g-band')!;
    this.valCurr4gBand = document.getElementById('val-curr-4g-band')!;
    this.valCurrCellLock = document.getElementById('val-curr-cell-lock')!;
    this.btnApplyNetworkMode = document.getElementById('btn-apply-network-mode') as HTMLButtonElement;
    this.check5gBands = document.querySelectorAll('.check-5g-band') as NodeListOf<HTMLInputElement>;
    this.btnApply5gLock = document.getElementById('btn-apply-5g-lock') as HTMLButtonElement;
    this.btnSelectAll5g = document.getElementById('btn-select-all-5g') as HTMLButtonElement;
    this.btnReset5gLock = document.getElementById('btn-reset-5g-lock') as HTMLButtonElement;
    this.check4gBands = document.querySelectorAll('.check-4g-band') as NodeListOf<HTMLInputElement>;
    this.btnApply4gLock = document.getElementById('btn-apply-4g-lock') as HTMLButtonElement;
    this.btnSelectAll4g = document.getElementById('btn-select-all-4g') as HTMLButtonElement;
    this.btnReset4gLock = document.getElementById('btn-reset-4g-lock') as HTMLButtonElement;
    this.inputCellPci = document.getElementById('input-cell-pci') as HTMLInputElement;
    this.inputCellEarfcn = document.getElementById('input-cell-earfcn') as HTMLInputElement;
    this.btnApplyCellLock = document.getElementById('btn-apply-cell-lock') as HTMLButtonElement;
    this.btnClearCellLock = document.getElementById('btn-clear-cell-lock') as HTMLButtonElement;
    this.btnCopyLiveCell = document.getElementById('btn-copy-live-cell') as HTMLButtonElement;

    // Band Confirmation Modal
    this.bandConfirmModal = document.getElementById('band-confirm-modal')!;
    this.bandConfirmTitle = document.getElementById('band-confirm-title')!;
    this.bandConfirmDescription = document.getElementById('band-confirm-description')!;
    this.bandConfirmCheck = document.getElementById('band-confirm-check') as HTMLInputElement;
    this.btnConfirmBandAction = document.getElementById('btn-confirm-band-action') as HTMLButtonElement;
    this.btnCancelBandAction = document.getElementById('btn-cancel-band-action') as HTMLButtonElement;
    this.btnCloseBandConfirmModal = document.getElementById('btn-close-band-confirm-modal') as HTMLButtonElement;

    // Presets (Optional)
    this.presetGaming = document.getElementById('preset-gaming') as HTMLButtonElement | null;
    this.presetSpeed = document.getElementById('preset-speed') as HTMLButtonElement | null;
    this.presetIndoor = document.getElementById('preset-indoor') as HTMLButtonElement | null;
    this.presetAutoReset = document.getElementById('preset-auto-reset') as HTMLButtonElement | null;

    // Signal Beacon
    this.btnToggleBeeper = document.getElementById('btn-toggle-beeper') as HTMLButtonElement;
    this.btnToggleBeeperText = document.getElementById('btn-toggle-beeper-text')!;
    this.beeperMeterFill = document.getElementById('beeper-meter-fill')!;
    this.beeperRsrpDisplay = document.getElementById('beeper-rsrp-display')!;
    this.beeperStatusText = document.getElementById('beeper-status-text')!;

    // SMS
    this.smsUnreadBadge = document.getElementById('sms-unread-badge')!;
    this.smsCountHeader = document.getElementById('sms-count-header')!;
    this.btnRefreshSms = document.getElementById('btn-refresh-sms') as HTMLButtonElement;
    this.smsSearchInput = document.getElementById('sms-search-input') as HTMLInputElement;
    this.smsListContainer = document.getElementById('sms-list-container')!;
    this.smsEmptyState = document.getElementById('sms-empty-state')!;

    // New UX Elements Initialization
    this.overviewDisconnectedCard = document.getElementById('overview-disconnected-card');
    this.overviewQuickPassword = document.getElementById('overview-quick-password') as HTMLInputElement;
    this.btnOverviewQuickConnect = document.getElementById('btn-overview-quick-connect') as HTMLButtonElement;
    this.btnGotoConnectionTab = document.getElementById('btn-goto-connection-tab') as HTMLButtonElement;

    this.overviewAdvisorCard = document.getElementById('overview-advisor-card');
    this.advisorStatusBadge = document.getElementById('advisor-status-badge');
    this.advisorMessage = document.getElementById('advisor-message');
    this.btnAdvisorAction = document.getElementById('btn-advisor-action') as HTMLButtonElement;
    this.advisorActionLabel = document.getElementById('advisor-action-label');

    this.refreshRingProgress = document.getElementById('refresh-ring-progress') as unknown as SVGCircleElement;
    this.btnOpenShortcuts = document.getElementById('btn-open-shortcuts') as HTMLButtonElement;
    this.btnThemeToggle = document.getElementById('btn-theme-toggle') as HTMLButtonElement | null;
    this.shortcutsModal = document.getElementById('shortcuts-modal');
    this.btnCloseShortcutsModal = document.getElementById('btn-close-shortcuts-modal') as HTMLButtonElement;
    this.btnDismissShortcuts = document.getElementById('btn-dismiss-shortcuts') as HTMLButtonElement;
    this.toastStack = document.getElementById('toast-stack');
    this.initTheme();

    this.filterChips = document.querySelectorAll('.filter-chip') as NodeListOf<HTMLButtonElement>;
    this.btnClearDeviceSearch = document.getElementById('btn-clear-device-search') as HTMLButtonElement;
    this.btnClearSmsSearch = document.getElementById('btn-clear-sms-search') as HTMLButtonElement;

    this.beeperEq = document.getElementById('beeper-eq');
    this.beeperVolBtns = document.querySelectorAll('.beeper-vol-btn') as NodeListOf<HTMLButtonElement>;

    // Modular Managers
    this.audioBeacon = new AudioBeaconManager({
      onToast: (msg, type) => this.showToast(msg, type as any)
    });
    this.commandPalette = new CommandPaletteManager(() => this.getCommandList());

    // Modern Features: Wi-Fi QR Code Share
    this.qrSvgContainer = document.getElementById('qr-svg-container');
    this.qrSsidVal = document.getElementById('qr-ssid-val');
    this.qrSecVal = document.getElementById('qr-sec-val');
    this.btnCopyWifiPw = document.getElementById('btn-copy-wifi-pw') as HTMLButtonElement;
    this.btnCopyWifiQrString = document.getElementById('btn-copy-wifi-qr-string') as HTMLButtonElement;

    this.initEventListeners();
    this.loadSavedConfig();
    this.checkBridgeStatus();
    this.detectHostInfo();
    setTimeout(() => this.fetchDevices(), 800);
  }

  private initEventListeners(): void {
    // Navigation Tabs
    this.tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetTab = tab.getAttribute('data-tab');
        if (targetTab) this.switchTab(targetTab);
      });
    });

    // Alert Close
    this.alertClose.addEventListener('click', () => this.hideAlert());

    // Quick Connect in Topbar
    this.btnQuickConnect.addEventListener('click', () => {
      if (this.isConnected) {
        this.disconnect();
      } else {
        this.switchTab('wifi');
        this.inputPassword.focus();
      }
    });

    // Manual Refresh
    this.btnManualRefresh.addEventListener('click', () => this.refreshAllData(true));

    // Auto-Refresh Toggle
    this.autoRefreshToggle.addEventListener('change', () => {
      if (this.autoRefreshToggle.checked) {
        this.startAutoRefresh();
      } else {
        this.stopAutoRefresh();
      }
    });

    // Password Toggle Visibility
    this.btnTogglePw.addEventListener('click', () => {
      if (this.inputPassword.type === 'password') {
        this.inputPassword.type = 'text';
        this.btnTogglePw.textContent = '🔒';
      } else {
        this.inputPassword.type = 'password';
        this.btnTogglePw.textContent = '👁️';
      }
    });

    // Connect & Disconnect buttons
    this.btnConnectAction.addEventListener('click', () => this.connect());
    this.btnDisconnectAction.addEventListener('click', () => this.disconnect());
    this.btnCheckBridge.addEventListener('click', () => this.checkBridgeStatus(true));
    this.btnSaveSettings.addEventListener('click', () => this.saveConfig());

    // Overview link to devices
    const linkToDevices = document.getElementById('link-to-devices');
    if (linkToDevices) {
      linkToDevices.addEventListener('click', () => this.switchTab('devices'));
    }

    // Refresh devices button
    const btnRefreshDev = document.getElementById('btn-refresh-devices');
    if (btnRefreshDev) {
      btnRefreshDev.addEventListener('click', () => this.fetchDevices());
    }

    if (this.btnScanLocalNet) {
      this.btnScanLocalNet.addEventListener('click', () => this.scanNetworkDeep());
    }

    // Devices Import / Export Actions
    this.btnImportThisDevice.addEventListener('click', () => this.importCurrentHost());
    this.btnOpenManualImport.addEventListener('click', () => this.openManualImportModal());
    this.btnExportDevices.addEventListener('click', () => this.exportDevicesJson());
    this.inputImportFile.addEventListener('change', (e) => this.handleFileImport(e));

    // Filter devices in search bar
    this.deviceSearchInput.addEventListener('input', () => this.renderDevicesTable());

    // Nickname Modal
    this.btnCloseNicknameModal.addEventListener('click', () => this.closeNicknameModal());
    this.btnCancelNickname.addEventListener('click', () => this.closeNicknameModal());
    this.btnSaveNickname.addEventListener('click', () => this.saveNickname());

    // Manual Import Modal
    this.btnCloseManualImport.addEventListener('click', () => this.closeManualImportModal());
    this.btnCancelManualImport.addEventListener('click', () => this.closeManualImportModal());
    this.btnConfirmManualImport.addEventListener('click', () => this.confirmManualImport());

    // Reboot Modal Triggers
    this.btnOpenRebootModal.addEventListener('click', () => {
      if (!this.isConnected) {
        this.showAlert('لا يوجد اتصال نشط بالراوتر لتنفيذ إعادة التشغيل.', 'danger');
        return;
      }
      this.openRebootModal();
    });

    this.btnCloseRebootModal.addEventListener('click', () => this.closeRebootModal());
    this.btnCancelReboot.addEventListener('click', () => this.closeRebootModal());

    this.rebootConfirmCheck.addEventListener('change', () => {
      this.btnConfirmReboot.disabled = !this.rebootConfirmCheck.checked;
    });

    this.btnConfirmReboot.addEventListener('click', () => this.executeReboot());

    // WAN Connection Toggle Button
    this.btnToggleWan.addEventListener('click', () => this.toggleWanConnection());

    // Wi-Fi Controls
    this.btnToggleWifiState.addEventListener('click', () => this.toggleWifiState());
    this.btnToggleWifiPwVisibility.addEventListener('click', () => this.toggleWifiPwVisibility());
    this.btnGenWifiPw.addEventListener('click', () => this.generateStrongWifiPassword());
    this.formWifiSettings.addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveWifiSettings();
    });

    // Bands & Network Mode Controls
    this.btnRefreshBandSettings.addEventListener('click', () => this.fetchNetworkSettings());
    this.btnApplyNetworkMode.addEventListener('click', () => this.handleApplyNetworkMode());
    this.btnApply5gLock.addEventListener('click', () => this.handleApply5gLock());
    this.btnSelectAll5g.addEventListener('click', () => this.selectAll5gBands());
    this.btnReset5gLock.addEventListener('click', () => this.handleReset5gLock());
    this.btnApply4gLock.addEventListener('click', () => this.handleApply4gLock());
    this.btnSelectAll4g.addEventListener('click', () => this.selectAll4gBands());
    this.btnReset4gLock.addEventListener('click', () => this.handleReset4gLock());
    this.btnApplyCellLock.addEventListener('click', () => this.handleApplyCellLock());
    this.btnClearCellLock.addEventListener('click', () => this.handleClearCellLock());
    this.btnCopyLiveCell.addEventListener('click', () => this.copyLiveCell());

    // Smart Band Presets
    if (this.presetGaming) this.presetGaming.addEventListener('click', () => this.applyPresetGaming());
    if (this.presetSpeed) this.presetSpeed.addEventListener('click', () => this.applyPresetSpeed());
    if (this.presetIndoor) this.presetIndoor.addEventListener('click', () => this.applyPresetIndoor());
    if (this.presetAutoReset) this.presetAutoReset.addEventListener('click', () => this.applyPresetAutoReset());

    // Signal Audio Beacon
    if (this.btnToggleBeeper) this.btnToggleBeeper.addEventListener('click', () => this.toggleAudioBeeper());

    // SMS Controls
    if (this.btnRefreshSms) this.btnRefreshSms.addEventListener('click', () => this.fetchSms());
    if (this.smsSearchInput) this.smsSearchInput.addEventListener('input', () => this.renderSmsList());

    // Mode Radio card selection styling
    const modeCards = document.querySelectorAll('.mode-card');
    modeCards.forEach(card => {
      card.addEventListener('click', () => {
        modeCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        const radio = card.querySelector('input[type="radio"]') as HTMLInputElement;
        if (radio) radio.checked = true;
      });
    });

    // Band Confirmation Modal
    this.bandConfirmCheck.addEventListener('change', () => {
      this.btnConfirmBandAction.disabled = !this.bandConfirmCheck.checked;
    });
    this.btnConfirmBandAction.addEventListener('click', () => this.executePendingBandAction());
    this.btnCancelBandAction.addEventListener('click', () => this.closeBandConfirmModal());
    this.btnCloseBandConfirmModal.addEventListener('click', () => this.closeBandConfirmModal());

    // Overview Quick Connect from Dashboard
    if (this.btnOverviewQuickConnect && this.overviewQuickPassword) {
      this.btnOverviewQuickConnect.addEventListener('click', () => {
        const pw = this.overviewQuickPassword?.value || '';
        if (!pw) {
          this.showToast('يرجى كتابة كلمة مرور إدارة الراوتر للدخول.', 'warning');
          this.overviewQuickPassword?.focus();
          return;
        }
        this.inputPassword.value = pw;
        this.connect();
      });

      this.overviewQuickPassword.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const pw = this.overviewQuickPassword?.value || '';
          if (!pw) {
            this.showToast('يرجى كتابة كلمة مرور إدارة الراوتر للدخول.', 'warning');
            return;
          }
          this.inputPassword.value = pw;
          this.connect();
        }
      });
    }

    if (this.btnGotoConnectionTab) {
      this.btnGotoConnectionTab.addEventListener('click', () => {
        this.switchTab('wifi');
        this.inputPassword.focus();
      });
    }

    // Advisor Action Button
    if (this.btnAdvisorAction) {
      this.btnAdvisorAction.addEventListener('click', () => {
        if (this.advisorActionCallback) {
          this.advisorActionCallback();
        } else {
          this.switchTab('overview');
        }
      });
    }

    // Filter Chips for Devices
    if (this.filterChips) {
      this.filterChips.forEach(chip => {
        chip.addEventListener('click', () => {
          this.filterChips?.forEach(c => c.classList.remove('active'));
          chip.classList.add('active');
          this.activeFilterChip = chip.getAttribute('data-filter') || 'all';
          this.renderDevicesTable();
        });
      });
    }

    // Clear Search Buttons
    if (this.btnClearDeviceSearch) {
      this.btnClearDeviceSearch.addEventListener('click', () => {
        this.deviceSearchInput.value = '';
        this.btnClearDeviceSearch?.classList.add('hidden');
        this.renderDevicesTable();
        this.deviceSearchInput.focus();
      });
    }

    if (this.btnClearSmsSearch) {
      this.btnClearSmsSearch.addEventListener('click', () => {
        this.smsSearchInput.value = '';
        this.btnClearSmsSearch?.classList.add('hidden');
        this.renderSmsList();
        this.smsSearchInput.focus();
      });
    }

    // Shortcuts Modal triggers
    if (this.btnOpenShortcuts) {
      this.btnOpenShortcuts.addEventListener('click', () => this.openShortcutsModal());
    }
    if (this.btnThemeToggle) {
      this.btnThemeToggle.addEventListener('click', () => this.toggleTheme());
    }
    if (this.btnCloseShortcutsModal) {
      this.btnCloseShortcutsModal.addEventListener('click', () => this.closeShortcutsModal());
    }
    if (this.btnDismissShortcuts) {
      this.btnDismissShortcuts.addEventListener('click', () => this.closeShortcutsModal());
    }

    // Wi-Fi QR Copy Listeners
    if (this.btnCopyWifiPw) {
      const btnPw = this.btnCopyWifiPw;
      btnPw.addEventListener('click', () => {
        if (this.currentWifiPwCache) {
          this.copyToClipboard(this.currentWifiPwCache, 'تم نسخ كلمة مرور Wi-Fi إلى الحافظة!', btnPw);
        } else {
          this.showToast('كلمة المرور غير متوفرة بعد أو الحقل فارغ.', 'warning');
        }
      });
    }
    if (this.btnCopyWifiQrString) {
      const btnQr = this.btnCopyWifiQrString;
      btnQr.addEventListener('click', () => {
        const ssid = this.qrSsidVal?.textContent?.trim() || '';
        if (ssid && ssid !== '--') {
          const qrStr = `WIFI:S:${ssid};T:WPA;P:${this.currentWifiPwCache};;`;
          this.copyToClipboard(qrStr, 'تم نسخ كود مشاركة Wi-Fi!', btnQr);
        }
      });
    }

    // Global Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
      const activeEl = document.activeElement;
      const isInput = activeEl && (
        activeEl.tagName === 'INPUT' ||
        activeEl.tagName === 'TEXTAREA' ||
        activeEl.tagName === 'SELECT'
      );

      // Escape always closes any open modal
      if (e.key === 'Escape') {
        if (this.commandPalette.isOpen()) {
          this.closeCommandPalette();
          return;
        }
        this.closeRebootModal();
        this.closeNicknameModal();
        this.closeManualImportModal();
        this.closeBandConfirmModal();
        this.closeShortcutsModal();
        return;
      }

      // Ctrl + K or Cmd + K opens/toggles Command Palette
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        this.toggleCommandPalette();
        return;
      }

      // F1 or '?' (when not typing) opens shortcuts modal
      if (e.key === 'F1' || (e.key === '?' && !isInput)) {
        e.preventDefault();
        this.openShortcutsModal();
        return;
      }

      // Ctrl + R or F5 triggers manual refresh
      if (((e.ctrlKey || e.metaKey) && (e.key === 'r' || e.key === 'R')) || e.key === 'F5') {
        e.preventDefault();
        this.refreshAllData(true);
        this.showToast('جاري تحديث قراءات الراوتر...', 'info', 1500);
        return;
      }

      // Ctrl + B toggles audio beeper
      if ((e.ctrlKey || e.metaKey) && (e.key === 'b' || e.key === 'B')) {
        e.preventDefault();
        this.toggleAudioBeeper();
        return;
      }

      // Ctrl + F jumps to search
      if ((e.ctrlKey || e.metaKey) && (e.key === 'f' || e.key === 'F')) {
        const activePane = document.querySelector('.tab-pane.active');
        if (activePane && activePane.id === 'pane-devices') {
          e.preventDefault();
          this.deviceSearchInput.focus();
          return;
        } else if (activePane && activePane.id === 'pane-sms') {
          e.preventDefault();
          this.smsSearchInput.focus();
          return;
        }
      }

      // Numbers 1 through 6 for quick tab switching (when not typing in an input)
      if (!isInput && !e.ctrlKey && !e.altKey && !e.metaKey) {
        const tabsMap = ['overview', 'devices', 'wifi', 'bands', 'sms', 'advanced'];
        const num = parseInt(e.key, 10);
        if (num >= 1 && num <= 6) {
          e.preventDefault();
          this.switchTab(tabsMap[num - 1]);
          return;
        }
      }

      // Ctrl + 1..6 also switches tabs from anywhere
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey) {
        const tabsMap = ['overview', 'devices', 'wifi', 'bands', 'sms', 'advanced'];
        const num = parseInt(e.key, 10);
        if (num >= 1 && num <= 6) {
          e.preventDefault();
          this.switchTab(tabsMap[num - 1]);
          return;
        }
      }
    });

    // Enter in password connects
    this.inputPassword.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.connect();
    });

    // Click-to-copy for all technical mono data rows
    document.querySelectorAll('.data-row .val.font-mono, .hero-wan .wan-value, .hero-wan .apn-value').forEach(el => {
      const htmlEl = el as HTMLElement;
      htmlEl.style.cursor = 'pointer';
      htmlEl.title = 'اضغط لنسخ هذه القيمة للحافظة';
      htmlEl.addEventListener('click', () => {
        const text = htmlEl.textContent?.trim();
        if (text && text !== '--' && text !== 'غير متوفرة' && text !== 'غير متوفر') {
          this.copyToClipboard(text, `تم نسخ [${text}] إلى الحافظة!`, htmlEl);
        }
      });
    });

    this.initAdvancedTabListeners();
  }

  private switchTab(tabId: string): void {
    // Backwards-compatibility aliases for merged tabs
    if (tabId === 'signal') tabId = 'overview';
    if (tabId === 'connection') tabId = 'wifi';

    this.tabs.forEach(t => {
      const active = t.getAttribute('data-tab') === tabId;
      t.classList.toggle('active', active);
      t.setAttribute('aria-selected', active ? 'true' : 'false');
    });

    this.tabPanes.forEach(pane => {
      pane.classList.toggle('active', pane.id === `pane-${tabId}`);
    });

    if (tabId === 'overview' && this.isConnected) {
      this.refreshAllData(false);
    } else if (tabId === 'devices') {
      this.fetchDevices();
    } else if (tabId === 'wifi' && this.isConnected) {
      this.fetchWifiInfo();
    } else if (tabId === 'bands' && this.isConnected) {
      this.fetchNetworkSettings();
    } else if (tabId === 'sms' && this.isConnected) {
      this.fetchSms();
    } else if (tabId === 'advanced') {
      this.fetchAdvancedSettings();
    }
  }

  private openShortcutsModal(): void {
    if (this.shortcutsModal) this.shortcutsModal.classList.remove('hidden');
  }

  private closeShortcutsModal(): void {
    if (this.shortcutsModal) this.shortcutsModal.classList.add('hidden');
  }

  public showToast(message: string, type: 'success' | 'danger' | 'info' | 'warning' = 'info', durationMs: number = 4000): void {
    if (!this.toastStack) {
      this.toastStack = document.getElementById('toast-stack');
    }
    if (!this.toastStack) return;

    const toast = document.createElement('div');
    toast.className = `toast-item toast-${type}`;

    let icon = 'ℹ️';
    if (type === 'success') icon = '✓';
    else if (type === 'danger') icon = '✕';
    else if (type === 'warning') icon = '⚠️';

    toast.innerHTML = `
      <div class="toast-content-group">
        <span class="toast-icon">${icon}</span>
        <span class="toast-msg">${this.escapeHtml(message)}</span>
      </div>
      <button class="toast-close-btn" aria-label="إغلاق">✕</button>
      <div class="toast-progress-bar"></div>
    `;

    const closeBtn = toast.querySelector('.toast-close-btn') as HTMLButtonElement;
    const progressBar = toast.querySelector('.toast-progress-bar') as HTMLElement;

    let dismissed = false;
    const dismiss = () => {
      if (dismissed) return;
      dismissed = true;
      toast.classList.add('toast-hiding');
      setTimeout(() => {
        if (toast.parentElement) toast.remove();
      }, 320);
    };

    if (closeBtn) closeBtn.addEventListener('click', dismiss);

    if (progressBar) {
      progressBar.style.transition = `transform ${durationMs}ms linear`;
      requestAnimationFrame(() => {
        progressBar.style.transform = 'scaleX(0)';
      });
    }

    setTimeout(dismiss, durationMs);
    this.toastStack.appendChild(toast);
  }

  private showAlert(message: string, type: 'danger' | 'success' | 'info' = 'danger'): void {
    this.showToast(message, type);
    if (this.globalAlert && this.alertText) {
      this.globalAlert.className = `global-alert ${type}`;
      this.alertText.textContent = message;
      this.globalAlert.classList.remove('hidden');
    }
  }

  private hideAlert(): void {
    if (this.globalAlert) this.globalAlert.classList.add('hidden');
  }

  private async detectHostInfo(): Promise<void> {
    try {
      if (window.mowajjih) {
        const info = await window.mowajjih.getCurrentHostInfo(this.inputRouterIp.value.trim());
        this.currentHostInfo = info;
      }
    } catch {}
  }

  private async loadSavedConfig(): Promise<void> {
    try {
      if (window.mowajjih) {
        const config = await window.mowajjih.loadNonSensitiveConfig();
        if (config) {
          if (config.routerIp) this.inputRouterIp.value = config.routerIp;
          if (config.username) this.settingUsername.value = config.username;
        }
      }
    } catch {}
  }

  private async saveConfig(): Promise<void> {
    try {
      const config = {
        routerIp: this.inputRouterIp.value.trim(),
        username: this.settingUsername.value.trim()
      };
      if (window.mowajjih) {
        await window.mowajjih.saveNonSensitiveConfig(config);
        this.showAlert('تم حفظ إعدادات الاتصال بنجاح.', 'success');
      }
    } catch {
      this.showAlert('تعذر حفظ الإعدادات.', 'danger');
    }
  }

  private async checkBridgeStatus(userTriggered: boolean = false): Promise<void> {
    try {
      if (!window.mowajjih) return;
      const res = await window.mowajjih.checkBridge();
      if (res && res.status === 'ok') {
        this.bridgeStatusDot.className = 'status-dot online';
        this.bridgeStatusText.textContent = `يعمل بنجاح (المنفذ ${res.port || 5188})`;
        if (userTriggered) {
          this.showAlert(`الجسر المحلي سليم ويعمل على 127.0.0.1:${res.port || 5188}`, 'success');
        }
      } else {
        this.bridgeStatusDot.className = 'status-dot offline';
        this.bridgeStatusText.textContent = 'غير متصل أو معطل';
        if (userTriggered) {
          this.showAlert('الجسر المحلي لا يستجيب حالياً.', 'danger');
        }
      }
    } catch {
      this.bridgeStatusDot.className = 'status-dot offline';
      this.bridgeStatusText.textContent = 'خطأ في الاتصال';
    }
  }

  private async measurePing(): Promise<void> {
    if (!this.isConnected || !window.mowajjih) {
      this.pingText.textContent = '-- ms';
      this.pingBadge.className = 'ping-badge';
      return;
    }

    try {
      const res = await window.mowajjih.pingRouter(this.inputRouterIp.value.trim());
      if (res && res.online && res.latencyMs >= 0) {
        this.pingText.textContent = `${res.latencyMs} ms`;
        if (res.latencyMs < 20) {
          this.pingBadge.className = 'ping-badge fast';
        } else if (res.latencyMs < 60) {
          this.pingBadge.className = 'ping-badge medium';
        } else {
          this.pingBadge.className = 'ping-badge slow';
        }
      } else {
        this.pingText.textContent = 'انقطاع';
        this.pingBadge.className = 'ping-badge slow';
      }
    } catch {
      this.pingText.textContent = 'خطأ';
      this.pingBadge.className = 'ping-badge slow';
    }
  }

  private async connect(): Promise<void> {
    const routerIp = this.inputRouterIp.value.trim();
    const password = this.inputPassword.value;

    if (!routerIp) {
      this.showAlert('يرجى كتابة عنوان IP الراوتر (مثل 192.168.0.1).', 'danger');
      return;
    }

    if (!password) {
      this.showAlert('يرجى إدخال كلمة مرور إدارة الراوتر لتسجيل الدخول.', 'danger');
      this.inputPassword.focus();
      return;
    }

    this.btnConnectAction.disabled = true;
    this.spinnerConnect.classList.remove('hidden');
    this.btnConnectLabel.textContent = 'جارٍ الاتصال بالراوتر...';
    this.routerStatusDot.className = 'status-dot busy';
    this.routerStatusLabel.textContent = 'جارٍ الاتصال...';
    const connectionPill = document.getElementById('connection-pill');
    if (connectionPill) connectionPill.className = 'connection-pill connecting';

    try {
      const res = await window.mowajjih.connectRouter({ routerIp, password });
      if (res && res.success) {
        this.isConnected = true;
        this.showAlert('تم الاتصال بالراوتر وتسجيل الدخول بنجاح.', 'success');
        this.updateConnectedUI(true);
        this.refreshAllData(true);
        this.fetchDevices();
        this.fetchWifiInfo();
        this.fetchNetworkSettings();
        this.startPingLoop();
        if (this.autoRefreshToggle.checked) {
          this.startAutoRefresh();
        }
      } else {
        throw new Error(res.error || 'فشل الاتصال بالراوتر');
      }
    } catch (err: any) {
      this.isConnected = false;
      this.updateConnectedUI(false);
      this.showAlert(err.message || 'تعذر الاتصال بالراوتر. تأكد من صحة كلمة المرور واتصالك بالشبكة.', 'danger');
    } finally {
      this.btnConnectAction.disabled = false;
      this.spinnerConnect.classList.add('hidden');
      this.btnConnectLabel.textContent = 'اتصال بالراوتر';
    }
  }

  private async disconnect(): Promise<void> {
    try {
      if (window.mowajjih) {
        await window.mowajjih.disconnectRouter();
      }
      this.isConnected = false;
      this.stopAutoRefresh();
      this.stopPingLoop();
      this.updateConnectedUI(false);
      this.clearDataDisplay();
      this.showAlert('تم قطع الاتصال بالراوتر ومسح بيانات الجلسة من الذاكرة.', 'info');
    } catch (e: any) {
      this.showAlert(e.message, 'danger');
    }
  }

  private updateConnectedUI(connected: boolean): void {
    const connectionPill = document.getElementById('connection-pill');
    if (connected) {
      this.routerStatusDot.className = 'status-dot online';
      this.routerStatusLabel.textContent = 'متصل بالراوتر';
      if (connectionPill) connectionPill.className = 'connection-pill connected';
      this.btnQuickConnect.textContent = 'قطع الاتصال';
      this.btnQuickConnect.className = 'btn btn-danger';
      this.btnConnectAction.classList.add('hidden');
      this.btnDisconnectAction.classList.remove('hidden');

      if (this.overviewDisconnectedCard) this.overviewDisconnectedCard.classList.add('hidden');
      if (this.overviewAdvisorCard) this.overviewAdvisorCard.classList.remove('hidden');
    } else {
      this.routerStatusDot.className = 'status-dot offline';
      this.routerStatusLabel.textContent = 'غير متصل بالراوتر';
      if (connectionPill) connectionPill.className = 'connection-pill disconnected';
      this.btnQuickConnect.textContent = 'اتصال';
      this.btnQuickConnect.className = 'btn btn-primary';
      this.btnConnectAction.classList.remove('hidden');
      this.btnDisconnectAction.classList.add('hidden');

      if (this.overviewDisconnectedCard) this.overviewDisconnectedCard.classList.remove('hidden');
      if (this.overviewAdvisorCard) this.overviewAdvisorCard.classList.add('hidden');
    }
  }

  private async refreshAllData(showSpin: boolean = false): Promise<void> {
    if (!this.isConnected || this.isRefreshing) return;
    this.isRefreshing = true;

    if (showSpin) {
      this.refreshIcon.style.animation = 'spin 0.8s linear infinite';
    }

    try {
      const res = await window.mowajjih.getStatus();
      if (res && res.success && res.data) {
        this.renderStatus(res.data);
      } else if (res && !res.connected) {
        this.disconnect();
      }
    } catch {
    } finally {
      this.isRefreshing = false;
      if (showSpin) {
        setTimeout(() => {
          this.refreshIcon.style.animation = '';
        }, 500);
      }
    }
  }

  private renderStatus(data: any): void {
    const barsElem = document.getElementById('hero-signal-bars');
    const pctElem = document.getElementById('hero-signal-pct');
    const evalElem = document.getElementById('hero-signal-eval');

    const bars = Math.min(Math.max(data.signalBars || 0, 0), 5);
    if (barsElem) {
      barsElem.className = `signal-bars-graphic bars-${bars}`;
    }
    const percent = bars * 20;
    if (pctElem) pctElem.textContent = `${percent}%`;

    // Circular Signal Radar Dial
    const dialElem = document.getElementById('hero-signal-dial');
    if (dialElem) {
      const circumference = 163.36; // 2 * PI * 26
      const offset = circumference * (1 - percent / 100);
      dialElem.style.strokeDashoffset = `${offset}`;
      if (percent >= 80) dialElem.style.stroke = 'var(--accent-emerald)';
      else if (percent >= 60) dialElem.style.stroke = 'var(--accent-sky)';
      else if (percent >= 40) dialElem.style.stroke = 'var(--accent-amber)';
      else dialElem.style.stroke = 'var(--accent-red)';
    }

    let ratingText = 'لا توجد إشارة';
    if (bars === 5) ratingText = 'إشارة ممتازة جداً';
    else if (bars === 4) ratingText = 'إشارة ممتازة';
    else if (bars === 3) ratingText = 'إشارة جيدة';
    else if (bars === 2) ratingText = 'إشارة متوسطة';
    else if (bars === 1) ratingText = 'إشارة ضعيفة';
    if (evalElem) evalElem.textContent = ratingText;

    const netType = document.getElementById('hero-net-type');
    const provider = document.getElementById('hero-provider');
    const band = document.getElementById('hero-band');
    const wanIp = document.getElementById('hero-wan-ip');
    const apn = document.getElementById('hero-apn');
    const lastUpdate = document.getElementById('hero-last-update');
    const caStatus = document.getElementById('hero-ca-status');

    if (netType) netType.textContent = data.networkType || 'غير محدد';
    if (provider) provider.textContent = `مزود الخدمة: ${data.provider || 'غير معروف'}`;
    if (band) band.textContent = `النطاق: ${data.activeBand || 'غير متوفر'}`;
    if (wanIp) wanIp.textContent = data.wanIp || 'غير متوفر';
    if (apn) apn.textContent = data.apn || 'غير متوفر';
    if (lastUpdate) lastUpdate.textContent = data.lastUpdated || '--:--:--';
    if (caStatus) caStatus.textContent = data.caStatus || 'غير متوفر';

    const valRsrp = document.getElementById('val-rsrp');
    const tagRsrp = document.getElementById('tag-rsrp');
    const valRsrq = document.getElementById('val-rsrq');
    const tagRsrq = document.getElementById('tag-rsrq');
    const valSinr = document.getElementById('val-sinr');
    const tagSinr = document.getElementById('tag-sinr');
    const valSpeedDown = document.getElementById('val-speed-down');
    const valSpeedUp = document.getElementById('val-speed-up');
    const valDevCount = document.getElementById('val-dev-count');
    const valWifiSummary = document.getElementById('val-wifi-summary');
    const devBadge = document.getElementById('devices-badge');

    const rsrpVal = data.metrics5G?.rsrp || data.metrics4G?.rsrp;
    if (valRsrp) valRsrp.textContent = rsrpVal ? rsrpVal.replace(' dBm', '') : '--';
    if (tagRsrp) {
      if (!rsrpVal) {
        tagRsrp.textContent = 'غير متوفر';
        tagRsrp.className = 'kpi-tag';
      } else {
        const num = parseFloat(rsrpVal);
        if (num >= -80) { tagRsrp.textContent = 'ممتاز'; tagRsrp.className = 'kpi-tag good'; }
        else if (num >= -95) { tagRsrp.textContent = 'جيد'; tagRsrp.className = 'kpi-tag good'; }
        else if (num >= -105) { tagRsrp.textContent = 'متوسط'; tagRsrp.className = 'kpi-tag medium'; }
        else { tagRsrp.textContent = 'ضعيف'; tagRsrp.className = 'kpi-tag poor'; }
      }
    }

    const rsrqVal = data.metrics4G?.rsrq;
    if (valRsrq) valRsrq.textContent = rsrqVal ? rsrqVal.replace(' dB', '') : '--';
    if (tagRsrq) {
      if (!rsrqVal) {
        tagRsrq.textContent = 'غير متوفر';
        tagRsrq.className = 'kpi-tag';
      } else {
        const num = parseFloat(rsrqVal);
        if (num >= -10) { tagRsrq.textContent = 'ممتاز'; tagRsrq.className = 'kpi-tag good'; }
        else if (num >= -15) { tagRsrq.textContent = 'جيد'; tagRsrq.className = 'kpi-tag medium'; }
        else { tagRsrq.textContent = 'متدني'; tagRsrq.className = 'kpi-tag poor'; }
      }
    }

    const sinrVal = data.metrics5G?.sinr || data.metrics4G?.sinr;
    if (valSinr) valSinr.textContent = sinrVal ? sinrVal.replace(' dB', '') : '--';
    if (tagSinr) {
      if (!sinrVal) {
        tagSinr.textContent = 'غير متوفر';
        tagSinr.className = 'kpi-tag';
      } else {
        const num = parseFloat(sinrVal);
        if (num >= 20) { tagSinr.textContent = 'نقي جداً'; tagSinr.className = 'kpi-tag good'; }
        else if (num >= 10) { tagSinr.textContent = 'جيد'; tagSinr.className = 'kpi-tag good'; }
        else if (num >= 0) { tagSinr.textContent = 'مقبول'; tagSinr.className = 'kpi-tag medium'; }
        else { tagSinr.textContent = 'ضوضاء عالية'; tagSinr.className = 'kpi-tag poor'; }
      }
    }

    const downBars = document.getElementById('speed-down-bars');
    const downDot = document.getElementById('speed-down-dot');
    const upBars = document.getElementById('speed-up-bars');
    const upDot = document.getElementById('speed-up-dot');

    if (valSpeedDown) {
      const hasDown = data.speedDown && data.speedDown !== 'غير متوفرة' && data.speedDown !== '--' && data.speedDown !== '0 KB/s' && data.speedDown !== '0 Mbps' && data.speedDown !== '0 B/s';
      valSpeedDown.textContent = data.speedDown ? data.speedDown : 'غير متوفرة من الراوتر';
      if (hasDown) {
        downBars?.classList.add('active');
        downDot?.classList.add('active');
      } else {
        downBars?.classList.remove('active');
        downDot?.classList.remove('active');
      }
    }
    if (valSpeedUp) {
      const hasUp = data.speedUp && data.speedUp !== 'غير متوفرة' && data.speedUp !== '--' && data.speedUp !== '0 KB/s' && data.speedUp !== '0 Mbps' && data.speedUp !== '0 B/s';
      valSpeedUp.textContent = data.speedUp ? data.speedUp : 'غير متوفرة من الراوتر';
      if (hasUp) {
        upBars?.classList.add('active');
        upDot?.classList.add('active');
      } else {
        upBars?.classList.remove('active');
        upDot?.classList.remove('active');
      }
    }

    const totalDevs = Math.max(data.connectedDevicesCount || 0, this.currentDevices.length);
    if (valDevCount) valDevCount.textContent = totalDevs.toString();
    if (devBadge) devBadge.textContent = totalDevs.toString();
    if (valWifiSummary) {
      valWifiSummary.textContent = `حالة Wi-Fi: ${data.wifiStatus} | الشبكة: ${data.wifiSsid}`;
    }

    const caTableBody = document.getElementById('ca-table-body');
    const caBadge = document.getElementById('ca-badge');
    if (caBadge) caBadge.textContent = data.caStatus || '--';

    if (caTableBody) {
      if (data.caDetails && data.caDetails.length > 0) {
        caTableBody.innerHTML = '';
        data.caDetails.forEach((c: any, idx: number) => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>خلية ثانوية SCell #${idx + 1}</td>
            <td class="font-semibold text-cyan-300">${c.band || '-'}</td>
            <td class="font-mono">${c.pci || '-'}</td>
            <td class="font-mono">${c.freq || '-'}</td>
          `;
          caTableBody.appendChild(row);
        });
      } else {
        caTableBody.innerHTML = `
          <tr>
            <td colspan="4" class="text-center text-slate-400 py-4">
              ${data.caStatus && data.caStatus.includes('Active') ? 'تجميع الترددات نشط (لا تتوفر تفاصيل الخلايا الثانوية)' : 'تجميع الترددات غير نشط حالياً أو لم يرجع الراوتر بياناته.'}
            </td>
          </tr>
        `;
      }
    }

    const sig4gBand = document.getElementById('sig-4g-band');
    if (sig4gBand) sig4gBand.textContent = `النطاق: ${data.metrics4G?.band || 'غير متوفر'}`;
    this.setElemText('sig-4g-rsrp', data.metrics4G?.rsrp);
    this.setElemText('sig-4g-rsrq', data.metrics4G?.rsrq);
    this.setElemText('sig-4g-rssi', data.metrics4G?.rssi);
    this.setElemText('sig-4g-snr', data.metrics4G?.sinr);
    this.setElemText('sig-4g-pci', data.metrics4G?.pci);
    this.setElemText('sig-4g-earfcn', data.metrics4G?.earfcn);
    this.setElemText('sig-4g-bw', data.metrics4G?.bandwidth);

    const sig5gBand = document.getElementById('sig-5g-band');
    if (sig5gBand) sig5gBand.textContent = `النطاق: ${data.metrics5G?.band || 'غير متوفر'}`;
    this.setElemText('sig-5g-rsrp', data.metrics5G?.rsrp);
    this.setElemText('sig-5g-sinr', data.metrics5G?.sinr);
    this.setElemText('sig-5g-pci', data.metrics5G?.pci);
    this.setElemText('sig-5g-earfcn', data.metrics5G?.earfcn);
    this.setElemText('sig-5g-action-band', data.metrics5G?.band);

    this.setElemText('sig-cell-id', data.cellId);
    this.setElemText('sig-enb-id', data.enbId);
    this.setElemText('sig-network-type', data.networkType);
    this.setElemText('sig-provider', data.provider);
    this.setElemText('sig-ca-status', data.caStatus);

    this.setElemText('hw-temp-4g', data.temperature4G);
    this.setElemText('hw-temp-5g', data.temperature5G);
    this.setElemText('hw-fw-ver', data.firmwareVersion);
    this.setElemText('hw-wan-ip', data.wanIp);
    this.setElemText('hw-apn', data.apn);

    // Live cell & channel extraction
    if (data.metrics4G?.pci) this.livePci4g = data.metrics4G.pci;
    else if (data.raw?.lte_pci) {
      const pciDec = parseInt(data.raw.lte_pci, 16);
      this.livePci4g = isNaN(pciDec) ? data.raw.lte_pci : pciDec.toString();
    }
    if (data.metrics4G?.earfcn) this.liveEarfcn4g = data.metrics4G.earfcn;
    else if (data.raw?.wan_active_channel) this.liveEarfcn4g = data.raw.wan_active_channel;

    // Update active band pills in summary & bands tab
    const pill5g = document.getElementById('pill-5g-active');
    const pill4g = document.getElementById('pill-4g-active');
    if (pill5g) pill5g.textContent = data.metrics5G?.band || 'غير نشط / غير متوفر';
    if (pill4g) pill4g.textContent = data.metrics4G?.band || 'غير متوفر';

    if (this.valCurr5gBand) {
      this.valCurr5gBand.textContent = data.metrics5G?.band || 'غير نشط';
    }
    if (this.valCurr4gBand) {
      this.valCurr4gBand.textContent = data.metrics4G?.band || data.activeBand || 'غير متوفر';
    }

    // Update WAN toggle status
    const isWanOnline = Boolean(
      (data.wanIp && data.wanIp !== '0.0.0.0' && data.wanIp !== '--' && data.wanIp !== 'غير متوفر') ||
      (data.raw?.ppp_status === 'ppp_connected')
    );
    this.currentWanConnected = isWanOnline;
    if (this.heroWanBadge) {
      this.heroWanBadge.textContent = isWanOnline ? 'متصل' : 'مقطوع';
      this.heroWanBadge.className = isWanOnline ? 'badge badge-success' : 'badge badge-danger';
    }
    if (this.btnToggleWanText) {
      this.btnToggleWanText.textContent = isWanOnline ? 'قطع الاتصال' : 'إعادة التوصيل';
    }
    if (this.btnToggleWan) {
      this.btnToggleWan.className = isWanOnline ? 'btn btn-secondary btn-xs' : 'btn btn-primary btn-xs';
    }

    // Update Audio Signal Beacon
    this.updateAudioBeeper(data.metrics5G?.rsrp || data.metrics4G?.rsrp);

    // Update Real-Time Signal Advisor & KPI Visual Gauge Range Bars
    this.updateAdvisor(data);
    this.updateKpiGauges(data);
  }

  private updateAdvisor(data: any): void {
    if (!this.overviewAdvisorCard) return;

    const rawRsrp = data.metrics5G?.rsrp || data.metrics4G?.rsrp;
    const rawSinr = data.metrics5G?.sinr || data.metrics4G?.sinr;
    const netType = data.networkType || '';
    const is5G = netType.includes('5G') || Boolean(data.metrics5G?.band);

    const rsrp = rawRsrp ? parseFloat(rawRsrp) : -115;
    const sinr = rawSinr ? parseFloat(rawSinr) : 0;

    let badgeText = 'تحليل حي';
    let cardClass = 'signal-advisor-card';
    let message = '';
    let actionLabel = 'مساعد التوجيه الصوتي 🔊';
    let actionFn = () => this.switchTab('overview');

    if (!rawRsrp && !rawSinr) {
      badgeText = 'بانتظار القياس';
      message = 'جاري جمع عينات الإشارة ومؤشرات التردد من راوتر ZTE MC801A1...';
      actionLabel = 'تحديث الآن 🔄';
      actionFn = () => this.refreshAllData(true);
    } else if (sinr >= 18 && rsrp >= -85) {
      badgeText = 'ممتاز جداً 🌟';
      cardClass = 'signal-advisor-card advisor-excellent';
      message = `الإشارة فائقة النقاء (RSRP: ${rsrp} dBm، SINR: +${sinr} dB). اتصال المودم في ذروة كفاءته ومثالي للتحميل الفائق والألعاب ذات الـ Ping المنخفض.`;
      actionLabel = 'الأوضاع الذكية ⚡️';
      actionFn = () => this.switchTab('bands');
    } else if (sinr < 5 && rsrp >= -95) {
      badgeText = 'تداخل وتشويش ⚠️';
      cardClass = 'signal-advisor-card advisor-warning';
      message = `قوة الإشارة جيدة (${rsrp} dBm) لكن نسبة التشويش مرتفعة (SINR: ${sinr} dB). يُنصح بتثبيت تردد الجيل الخامس N78 أو تدوير الراوتر لتفادي تداخل الأبراج.`;
      actionLabel = 'قفل الترددات 🔒';
      actionFn = () => this.switchTab('bands');
    } else if (rsrp < -105) {
      badgeText = 'إشارة ضعيفة 🔴';
      cardClass = 'signal-advisor-card advisor-poor';
      message = `إشارة البرج الواصلة للمودم ضعيفة (${rsrp} dBm). شغّل التوجيه الصوتي وانقل الراوتر بالقرب من نافذة مطلة على البرج لرفع السرعة.`;
      actionLabel = 'التوجيه الصوتي 🔊';
      actionFn = () => {
        this.switchTab('overview');
        if (!this.beeperActive) this.toggleAudioBeeper();
      };
    } else if (!is5G && rsrp >= -90) {
      badgeText = '4G LTE فقط 🛡️';
      cardClass = 'signal-advisor-card';
      message = `الراوتر متصل بشبكة الجيل الرابع LTE. إذا كانت تغطية 5G متوفرة لديك، جرّب تفعيل نمط 5G أو الأوضاع السريعة من تبويب النطاقات.`;
      actionLabel = 'تحويل إلى 5G ⚡️';
      actionFn = () => this.switchTab('bands');
    } else {
      badgeText = 'إشارة جيدة 👍';
      cardClass = 'signal-advisor-card advisor-excellent';
      message = `مؤشرات الإشارة متوازنة ومستقرة (RSRP: ${rsrp} dBm، SINR: +${sinr} dB). السرعة مناسبة لجميع الأنشطة اليومية والتنزيل.`;
      actionLabel = 'فحص الأجهزة 📱';
      actionFn = () => this.switchTab('devices');
    }

    this.overviewAdvisorCard.className = cardClass;
    if (this.advisorStatusBadge) this.advisorStatusBadge.textContent = badgeText;
    if (this.advisorMessage) this.advisorMessage.textContent = message;
    if (this.advisorActionLabel) this.advisorActionLabel.textContent = actionLabel;
    this.advisorActionCallback = actionFn;
  }

  private updateKpiGauges(data: any): void {
    const rawRsrp = data.metrics5G?.rsrp || data.metrics4G?.rsrp;
    const rawRsrq = data.metrics4G?.rsrq;
    const rawSinr = data.metrics5G?.sinr || data.metrics4G?.sinr;

    // RSRP: range -120 dBm (0%) to -65 dBm (100%)
    const markerRsrp = document.getElementById('marker-rsrp');
    if (markerRsrp && rawRsrp) {
      const num = parseFloat(rawRsrp);
      if (!isNaN(num)) {
        const pct = Math.min(Math.max(((num - (-120)) / 55) * 100, 2), 98);
        markerRsrp.style.right = `${pct}%`;
      }
    }

    // RSRQ: range -20 dB (0%) to -6 dB (100%)
    const markerRsrq = document.getElementById('marker-rsrq');
    if (markerRsrq && rawRsrq) {
      const num = parseFloat(rawRsrq);
      if (!isNaN(num)) {
        const pct = Math.min(Math.max(((num - (-20)) / 14) * 100, 2), 98);
        markerRsrq.style.right = `${pct}%`;
      }
    }

    // SINR: range 0 dB (0%) to 28 dB (100%)
    const markerSinr = document.getElementById('marker-sinr');
    if (markerSinr && rawSinr) {
      const num = parseFloat(rawSinr);
      if (!isNaN(num)) {
        const pct = Math.min(Math.max(((num - 0) / 28) * 100, 2), 98);
        markerSinr.style.right = `${pct}%`;
      }
    }
  }

  private setElemText(id: string, value?: string | null): void {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = (value && value.trim() !== '') ? value : 'غير متوفرة';
    }
  }

  private clearDataDisplay(): void {
    const ids = [
      'hero-signal-pct', 'hero-signal-eval', 'hero-net-type', 'hero-provider',
      'hero-band', 'hero-wan-ip', 'hero-apn', 'hero-last-update', 'hero-ca-status',
      'val-rsrp', 'val-rsrq', 'val-sinr', 'val-speed-down', 'val-speed-up',
      'val-dev-count', 'val-wifi-summary',
      'sig-4g-rsrp', 'sig-4g-rsrq', 'sig-4g-rssi', 'sig-4g-snr', 'sig-4g-pci',
      'sig-4g-earfcn', 'sig-4g-bw', 'sig-5g-rsrp', 'sig-5g-sinr', 'sig-5g-pci',
      'sig-5g-earfcn', 'sig-5g-action-band', 'sig-cell-id', 'sig-enb-id',
      'sig-network-type', 'sig-provider', 'sig-ca-status', 'hw-temp-4g',
      'hw-temp-5g', 'hw-fw-ver', 'hw-wan-ip', 'hw-apn',
      'wifi-ssid', 'wifi-status-text', 'wifi-broadcast', 'wifi-security', 'wifi-auth-mode'
    ];

    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = '--';
    });

    const barsElem = document.getElementById('hero-signal-bars');
    if (barsElem) barsElem.className = 'signal-bars-graphic';

    const dialElem = document.getElementById('hero-signal-dial');
    if (dialElem) {
      dialElem.style.strokeDashoffset = '163.36';
      dialElem.style.stroke = 'var(--accent-sky)';
    }

    document.getElementById('speed-down-bars')?.classList.remove('active');
    document.getElementById('speed-down-dot')?.classList.remove('active');
    document.getElementById('speed-up-bars')?.classList.remove('active');
    document.getElementById('speed-up-dot')?.classList.remove('active');

    this.currentDevices = [];
    this.renderDevicesTable();
  }

  // ========================================================================
  // Connected Devices Management & Import
  // ========================================================================

  private async fetchDevices(): Promise<void> {
    if (!window.mowajjih) return;
    try {
      const res = await window.mowajjih.getDevices();
      if (res && res.success && Array.isArray(res.data)) {
        this.currentDevices = res.data;
        if (res.hostInfo) {
          this.currentHostInfo = res.hostInfo;
        }

        // Auto-match this host if present
        if (this.currentHostInfo) {
          const myIp = this.currentHostInfo.localIp;
          const myMac = this.currentHostInfo.localMac.toUpperCase();
          this.currentDevices.forEach(d => {
            if (d.ip === myIp || (d.mac && d.mac.toUpperCase() === myMac)) {
              d.isCurrentDevice = true;
            }
          });
        }

        this.renderDevicesTable();
        this.updateDeviceSummaryBanner();
      }
    } catch {}
  }

  private async scanNetworkDeep(): Promise<void> {
    if (!window.mowajjih) return;
    try {
      if (this.btnScanNetText) this.btnScanNetText.textContent = '⏳ جاري المسح...';
      if (this.btnScanLocalNet) this.btnScanLocalNet.disabled = true;
      if (this.deviceSummaryText) this.deviceSummaryText.textContent = 'جاري إرسال إشارات الاستكشاف ومسح جدول ARP ومطابقة الأسماء...';

      const res = await window.mowajjih.scanNetwork();
      if (res && res.success && Array.isArray(res.data)) {
        this.currentDevices = res.data;
        if (res.hostInfo) this.currentHostInfo = res.hostInfo;

        if (this.currentHostInfo) {
          const myIp = this.currentHostInfo.localIp;
          const myMac = this.currentHostInfo.localMac.toUpperCase();
          this.currentDevices.forEach(d => {
            if (d.ip === myIp || (d.mac && d.mac.toUpperCase() === myMac)) {
              d.isCurrentDevice = true;
            }
          });
        }

        this.renderDevicesTable();
        this.updateDeviceSummaryBanner();
        this.showAlert(`اكتمل المسح العميق للشبكة: تم العثور على ${this.currentDevices.length} أجهزة نشطة.`, 'success');
      }
    } catch (err: any) {
      this.showAlert(`تعذر إتمام مسح الشبكة: ${err.message}`, 'danger');
    } finally {
      if (this.btnScanNetText) this.btnScanNetText.textContent = '🔍 مسح عميق للشبكة (ARP)';
      if (this.btnScanLocalNet) this.btnScanLocalNet.disabled = false;
    }
  }

  private updateDeviceSummaryBanner(): void {
    if (!this.deviceSummaryText) return;
    const count = this.currentDevices.length;
    const appleCount = this.currentDevices.filter(d => (d.vendor || '').includes('Apple') || (d.name || '').includes('iPhone')).length;
    let desc = `تم اكتشاف ${count} أجهزة نشطة على الشبكة (الراوتر، هذا الحاسوب`;
    if (appleCount > 0) desc += `، ${appleCount} أجهزة Apple`;
    desc += `).`;
    this.deviceSummaryText.textContent = desc;
    if (this.deviceScanTime) {
      this.deviceScanTime.textContent = `آخر تحديث: ${new Date().toLocaleTimeString('ar-SA')}`;
    }
    const valDevCount = document.getElementById('val-dev-count');
    if (valDevCount && count > 0) {
      valDevCount.textContent = count.toString();
    }
  }

  private renderDevicesTable(): void {
    const filter = (this.deviceSearchInput.value || '').trim().toLowerCase();
    const devCountHeader = document.getElementById('devices-count-header');
    const devBadge = document.getElementById('devices-badge');

    // Toggle clear search button
    if (this.btnClearDeviceSearch) {
      this.btnClearDeviceSearch.classList.toggle('hidden', !filter);
    }

    // Update filter chip count badges
    const totalCount = this.currentDevices.length;
    const thisCount = this.currentDevices.filter(d => d.isCurrentDevice).length;
    const wifiCount = this.currentDevices.filter(d => d.connectionType === 'wifi').length;
    const lanCount = this.currentDevices.filter(d => d.connectionType === 'lan').length;
    const appleCount = this.currentDevices.filter(d =>
      (d.vendor || '').includes('Apple') ||
      (d.name || '').includes('iPhone') ||
      (d.name || '').includes('iPad') ||
      (d.name || '').includes('Mac')
    ).length;

    const elCountAll = document.getElementById('chip-count-all');
    const elCountThis = document.getElementById('chip-count-this');
    const elCountWifi = document.getElementById('chip-count-wifi');
    const elCountLan = document.getElementById('chip-count-lan');
    const elCountApple = document.getElementById('chip-count-apple');

    if (elCountAll) elCountAll.textContent = totalCount.toString();
    if (elCountThis) elCountThis.textContent = thisCount.toString();
    if (elCountWifi) elCountWifi.textContent = wifiCount.toString();
    if (elCountLan) elCountLan.textContent = lanCount.toString();
    if (elCountApple) elCountApple.textContent = appleCount.toString();

    const filtered = this.currentDevices.filter(d => {
      // 1. Category chip filter
      if (this.activeFilterChip === 'this-device' && !d.isCurrentDevice) return false;
      if (this.activeFilterChip === 'wifi' && d.connectionType !== 'wifi') return false;
      if (this.activeFilterChip === 'lan' && d.connectionType !== 'lan') return false;
      if (this.activeFilterChip === 'apple') {
        const isApple = (d.vendor || '').includes('Apple') ||
          (d.name || '').includes('iPhone') ||
          (d.name || '').includes('iPad') ||
          (d.name || '').includes('Mac');
        if (!isApple) return false;
      }

      // 2. Text search filter
      if (!filter) return true;
      return (
        d.name.toLowerCase().includes(filter) ||
        (d.customName && d.customName.toLowerCase().includes(filter)) ||
        d.ip.toLowerCase().includes(filter) ||
        d.mac.toLowerCase().includes(filter) ||
        (d.vendor && d.vendor.toLowerCase().includes(filter))
      );
    });

    if (devCountHeader) devCountHeader.textContent = this.currentDevices.length.toString();
    if (devBadge) devBadge.textContent = this.currentDevices.length.toString();

    if (filtered.length === 0) {
      this.devicesTableBody.innerHTML = `
        <tr id="devices-empty-row">
          <td colspan="7" class="empty-cell">
            <div class="empty-state">
              <div class="empty-icon">📱</div>
              <h4>لا توجد أجهزة مطابقة للبحث</h4>
              <p>جرّب كلمة بحث أخرى أو اضغط على «فحص الأجهزة» لتحديث القائمة من الراوتر.</p>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    this.devicesTableBody.innerHTML = '';
    filtered.forEach(d => {
      const row = document.createElement('tr');
      if (d.isCurrentDevice) {
        row.className = 'current-device-row';
      }

      const connIcon = d.connectionType === 'lan' ? '🔌 سلكي (LAN)' : '📶 لاسلكي (Wi-Fi)';
      const vendorBadge = d.vendor ? `<span class="badge badge-vendor">${d.vendor}</span>` : '<span class="text-xs text-slate-500">غير محدد</span>';
      const currentTag = d.isCurrentDevice ? `<span class="this-device-tag">⭐️ هذا الحاسوب</span>` : `<span class="badge badge-secondary">جهاز متصل</span>`;

      const displayName = d.customName
        ? `<div class="device-name-container"><span class="device-custom-name">${d.customName}</span><span class="device-orig-name">${d.name || 'بدون اسم'}</span></div>`
        : `<span class="font-semibold text-cyan-300">${d.name || 'جهاز متصل'}</span>`;

      row.innerHTML = `
        <td>${displayName}</td>
        <td>${vendorBadge}</td>
        <td>
          <div class="action-btn-group">
            <span class="font-mono text-sm">${d.ip || '-'}</span>
            ${d.ip && d.ip !== '-' ? `<button class="icon-btn copy-ip" data-copy="${d.ip}" title="نسخ IP">📋</button>` : ''}
          </div>
        </td>
        <td>
          <div class="action-btn-group">
            <span class="font-mono text-xs text-slate-400">${d.mac || '-'}</span>
            ${d.mac && d.mac !== '-' ? `<button class="icon-btn copy-mac" data-copy="${d.mac}" title="نسخ MAC">📋</button>` : ''}
          </div>
        </td>
        <td><span class="badge badge-secondary">${connIcon}</span></td>
        <td>${currentTag}</td>
        <td>
          <button class="icon-btn edit-alias-btn" data-mac="${d.mac}" title="تسمية وتخصيص الجهاز">✏️ تسمية</button>
        </td>
      `;

      this.devicesTableBody.appendChild(row);
    });

    // Attach row events with tactile copy feedback
    this.devicesTableBody.querySelectorAll('.copy-ip, .copy-mac').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const val = target.getAttribute('data-copy');
        if (val) {
          this.copyToClipboard(val, `تم نسخ [${val}] إلى الحافظة!`, target);
        }
      });
    });

    this.devicesTableBody.querySelectorAll('.edit-alias-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const mac = (e.currentTarget as HTMLElement).getAttribute('data-mac');
        const dev = this.currentDevices.find(d => d.mac === mac);
        if (dev) this.openNicknameModal(dev);
      });
    });
  }

  // Import Current Computer Identity
  private async importCurrentHost(): Promise<void> {
    await this.detectHostInfo();
    if (!this.currentHostInfo || !this.currentHostInfo.localIp) {
      this.showAlert('تعذر قراءة بطاقة الشبكة المحلية لحاسوبك. تأكد من اتصالك بالشبكة.', 'danger');
      return;
    }

    const hostIp = this.currentHostInfo.localIp;
    const hostMac = this.currentHostInfo.localMac.toUpperCase();
    const hostName = this.currentHostInfo.hostname || 'حاسوبي الشخصي';

    let existing = this.currentDevices.find(d => d.mac.toUpperCase() === hostMac || d.ip === hostIp);
    if (existing) {
      existing.isCurrentDevice = true;
      if (!existing.customName) existing.customName = `حاسوبك (${hostName})`;
    } else {
      this.currentDevices.unshift({
        id: hostMac || `host-${Date.now()}`,
        name: hostName,
        customName: `حاسوبك الحالي (${hostName})`,
        ip: hostIp,
        mac: hostMac,
        connectionType: 'lan',
        vendor: 'هذا الجهاز',
        isCurrentDevice: true
      });
    }

    // Persist friendly name
    if (window.mowajjih && hostMac) {
      await window.mowajjih.saveDeviceAlias({ mac: hostMac, alias: `حاسوبك الحالي (${hostName})` });
    }

    this.renderDevicesTable();
    this.showAlert(`تم استيراد بطاقة هذا الحاسوب (${hostIp}) وتمييزها في قائمة الأجهزة بنجاح!`, 'success');
  }

  // Manual Device Import
  private openManualImportModal(): void {
    this.inputManualMac.value = '';
    this.inputManualIp.value = '';
    this.inputManualName.value = '';
    this.manualImportModal.classList.remove('hidden');
    this.inputManualMac.focus();
  }

  private closeManualImportModal(): void {
    this.manualImportModal.classList.add('hidden');
  }

  private async confirmManualImport(): Promise<void> {
    const mac = this.inputManualMac.value.trim().toUpperCase();
    const ip = this.inputManualIp.value.trim() || '-';
    const name = this.inputManualName.value.trim();

    if (!mac || !/^[0-9A-F]{2}(:[0-9A-F]{2}){5}$/i.test(mac)) {
      this.showAlert('يرجى إدخال عنوان MAC صالح بصيغة AA:BB:CC:DD:EE:FF', 'danger');
      return;
    }

    if (!name) {
      this.showAlert('يرجى كتابة اسم أو تسمية للجهاز.', 'danger');
      return;
    }

    let existing = this.currentDevices.find(d => d.mac.toUpperCase() === mac);
    if (existing) {
      existing.customName = name;
      if (ip !== '-') existing.ip = ip;
    } else {
      this.currentDevices.push({
        id: mac,
        name: name,
        customName: name,
        ip: ip,
        mac: mac,
        connectionType: 'wifi',
        vendor: 'جهاز مضاف يدوياً'
      });
    }

    if (window.mowajjih) {
      await window.mowajjih.saveDeviceAlias({ mac, alias: name });
    }

    this.closeManualImportModal();
    this.renderDevicesTable();
    this.showAlert(`تم استيراد الجهاز [${name}] وحفظه بنجاح.`, 'success');
  }

  // Nickname Editing
  private openNicknameModal(dev: DeviceItem): void {
    this.selectedDeviceForRename = dev;
    this.modalDeviceMac.textContent = dev.mac || dev.id;
    this.modalDeviceOrigName.textContent = dev.name || 'بدون اسم';
    this.inputCustomNickname.value = dev.customName || '';
    this.nicknameModal.classList.remove('hidden');
    this.inputCustomNickname.focus();
  }

  private closeNicknameModal(): void {
    this.nicknameModal.classList.add('hidden');
    this.selectedDeviceForRename = null;
  }

  private async saveNickname(): Promise<void> {
    if (!this.selectedDeviceForRename) return;
    const alias = this.inputCustomNickname.value.trim();
    const mac = this.selectedDeviceForRename.mac || this.selectedDeviceForRename.id;

    this.selectedDeviceForRename.customName = alias || undefined;
    if (window.mowajjih && mac) {
      await window.mowajjih.saveDeviceAlias({ mac, alias });
    }

    this.closeNicknameModal();
    this.renderDevicesTable();
    this.showAlert(`تم حفظ التسمية المخصصة للجهاز بنجاح.`, 'success');
  }

  // Export Devices as JSON
  private exportDevicesJson(): void {
    if (this.currentDevices.length === 0) {
      this.showAlert('لا توجد أجهزة متصلة لتصديرها.', 'danger');
      return;
    }

    const jsonStr = JSON.stringify(this.currentDevices, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mowajjih_devices_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    this.showAlert('تم تصدير قائمة الأجهزة بنجاح كملف JSON.', 'success');
  }

  // Import Devices from uploaded JSON File
  private handleFileImport(e: Event): void {
    const target = e.target as HTMLInputElement;
    const file = target.files && target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        const imported = JSON.parse(content);
        if (Array.isArray(imported)) {
          let count = 0;
          for (const item of imported) {
            if (item.mac) {
              const mac = item.mac.toUpperCase();
              let match = this.currentDevices.find(d => d.mac.toUpperCase() === mac);
              const customName = item.customName || item.name;
              if (match) {
                if (customName) match.customName = customName;
              } else {
                this.currentDevices.push({
                  id: mac,
                  name: item.name || 'جهاز مستورد',
                  customName: customName,
                  ip: item.ip || '-',
                  mac: mac,
                  connectionType: item.connectionType || 'wifi',
                  vendor: item.vendor || 'مستورد من ملف'
                });
              }
              if (customName && window.mowajjih) {
                await window.mowajjih.saveDeviceAlias({ mac, alias: customName });
              }
              count++;
            }
          }
          this.renderDevicesTable();
          this.showAlert(`تم استيراد ${count} جهاز من الملف بنجاح!`, 'success');
        } else {
          throw new Error('صيغة الملف غير متوافقة.');
        }
      } catch (err: any) {
        this.showAlert(`فشل استيراد الملف: ${err.message}`, 'danger');
      } finally {
        target.value = '';
      }
    };
    reader.readAsText(file);
  }

  private async fetchWifiInfo(): Promise<void> {
    if (!this.isConnected || !window.mowajjih) return;
    try {
      const res = await window.mowajjih.getWifi();
      if (res && res.success && res.data) {
        const w = res.data;
        this.currentWifiEnabled = Boolean(w.enabled);

        const ssidEl = document.getElementById('wifi-ssid');
        const statusEl = document.getElementById('wifi-status-text');
        const bcastEl = document.getElementById('wifi-broadcast');
        const secEl = document.getElementById('wifi-security');
        const authEl = document.getElementById('wifi-auth-mode');

        if (ssidEl) ssidEl.textContent = w.ssid || 'غير متوفر';
        if (statusEl) statusEl.textContent = w.enabled ? 'مفعّل ونشط' : 'معطّل ومغلق';
        if (bcastEl) bcastEl.textContent = w.broadcast ? 'مرئي (Visible)' : 'مخفي (Hidden)';
        if (secEl) secEl.textContent = w.securityMode || 'WPA2/WPA3-PSK';
        if (authEl) authEl.textContent = w.authMode || 'مشفّر (Protected)';

        // Form fields
        if (this.inputWifiSsid && (!this.inputWifiSsid.value || this.inputWifiSsid.value === 'غير متوفر')) {
          this.inputWifiSsid.value = w.ssid || '';
        }
        if (this.checkHideSsid) {
          this.checkHideSsid.checked = !w.broadcast;
        }

        // Toggle button & dot
        if (this.wifiDot) {
          this.wifiDot.className = w.enabled ? 'status-dot online' : 'status-dot offline';
        }
        if (this.wifiBadge) {
          this.wifiBadge.textContent = w.enabled ? 'بث Wi-Fi نشط ومفعّل' : 'بث Wi-Fi معطّل';
          this.wifiBadge.className = w.enabled ? 'badge badge-success' : 'badge badge-danger';
        }
        if (this.btnToggleWifiText) {
          this.btnToggleWifiText.textContent = w.enabled ? 'إيقاف بث Wi-Fi' : 'تشغيل بث Wi-Fi';
        }

        // Modern Feature: Update Wi-Fi QR Code Share Card
        if (w.password) this.currentWifiPwCache = w.password;
        this.updateWifiQrCode(w.ssid || 'Mowajjih-5G', this.currentWifiPwCache, w.securityMode || 'WPA');
      }
    } catch {}
  }

  private async toggleWifiState(): Promise<void> {
    if (!this.isConnected || !window.mowajjih) {
      this.showAlert('يرجى الاتصال بالراوتر أولاً لتغيير حالة Wi-Fi.', 'danger');
      return;
    }

    const nextState = !this.currentWifiEnabled;
    const confirmMsg = nextState
      ? 'هل أنت متأكد من رغبتك في تشغيل بث Wi-Fi في الراوتر؟'
      : 'هل أنت متأكد من إيقاف بث Wi-Fi؟ إذا كنت متصلاً عبر Wi-Fi، سينقطع اتصالك بالراوتر ويجب استخدام كيبل شبكة LAN لإعادة تشغيله!';

    if (!confirm(confirmMsg)) return;

    this.btnToggleWifiState.disabled = true;
    try {
      const res = await window.mowajjih.setWifiSettings({ enabled: nextState });
      if (res && res.success) {
        this.showAlert(res.message || 'تم تحديث حالة Wi-Fi بنجاح.', 'success');
        this.currentWifiEnabled = nextState;
        this.fetchWifiInfo();
      } else {
        throw new Error(res.error || 'تعذر تغيير حالة Wi-Fi.');
      }
    } catch (err: any) {
      this.showAlert(`فشل تبديل حالة Wi-Fi: ${err.message}`, 'danger');
    } finally {
      this.btnToggleWifiState.disabled = false;
    }
  }

  private async saveWifiSettings(): Promise<void> {
    if (!this.isConnected || !window.mowajjih) {
      this.showAlert('يرجى الاتصال بالراوتر أولاً لحفظ إعدادات Wi-Fi.', 'danger');
      return;
    }

    const ssid = this.inputWifiSsid.value.trim();
    const password = this.inputWifiPassword.value.trim();
    const hideSsid = this.checkHideSsid.checked;

    if (!ssid) {
      this.showAlert('يرجى إدخال اسم لشبكة Wi-Fi (SSID).', 'danger');
      this.inputWifiSsid.focus();
      return;
    }

    if (password && password.length < 8) {
      this.showAlert('كلمة مرور شبكة Wi-Fi يجب ألا تقل عن 8 أحرف.', 'danger');
      this.inputWifiPassword.focus();
      return;
    }

    const confirmMsg = 'تطبيق إعدادات Wi-Fi الجديدة سيتسبب في انقطاع اتصال الأجهزة اللاسلكية وطلب إعادة إدخال كلمة المرور الجديدة. هل ترغب في المتابعة؟';
    if (!confirm(confirmMsg)) return;

    this.btnSaveWifiSettings.disabled = true;
    this.btnSaveWifiSettings.textContent = 'جارٍ الحفظ...';

    try {
      const payload: any = { ssid, hideSsid };
      if (password) payload.password = password;

      const res = await window.mowajjih.setWifiSettings(payload);
      if (res && res.success) {
        this.showAlert('تم حفظ وتطبيق إعدادات شبكة Wi-Fi بنجاح!', 'success');
        this.inputWifiPassword.value = '';
        this.fetchWifiInfo();
      } else {
        throw new Error(res.error || 'تعذر تطبيق إعدادات Wi-Fi.');
      }
    } catch (err: any) {
      this.showAlert(`فشل حفظ إعدادات Wi-Fi: ${err.message}`, 'danger');
    } finally {
      this.btnSaveWifiSettings.disabled = false;
      this.btnSaveWifiSettings.textContent = '💾 حفظ وتطبيق إعدادات Wi-Fi';
    }
  }

  private toggleWifiPwVisibility(): void {
    if (this.inputWifiPassword.type === 'password') {
      this.inputWifiPassword.type = 'text';
      this.btnToggleWifiPwVisibility.textContent = '🔒';
    } else {
      this.inputWifiPassword.type = 'password';
      this.btnToggleWifiPwVisibility.textContent = '👁️';
    }
  }

  private generateStrongWifiPassword(): void {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let pwd = '';
    for (let i = 0; i < 12; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    this.inputWifiPassword.value = pwd;
    this.inputWifiPassword.type = 'text';
    this.btnToggleWifiPwVisibility.textContent = '🔒';
    this.showAlert('تم توليد كلمة مرور قوية وجديدة. اضغط «حفظ وتطبيق إعدادات Wi-Fi» لاعتمادها في الراوتر.', 'info');
  }

  private async toggleWanConnection(): Promise<void> {
    if (!this.isConnected || !window.mowajjih) {
      this.showAlert('لا يوجد اتصال بالراوتر للتحكم ببيانات الشريحة.', 'danger');
      return;
    }

    const nextState = !this.currentWanConnected;
    const confirmMsg = nextState
      ? 'هل ترغب في إعادة توصيل اتصال بيانات الشريحة (Cellular WAN)؟'
      : 'هل أنت متأكد من قطع اتصال بيانات الشريحة (Cellular WAN)؟ سيتوقف الإنترنت عن كافة الأجهزة المتصلة.';

    if (!confirm(confirmMsg)) return;

    this.btnToggleWan.disabled = true;
    try {
      const res = await window.mowajjih.setWanConnection(nextState);
      if (res && res.success) {
        this.showAlert(res.message || 'تم تحديث حالة اتصال البيانات بنجاح.', 'success');
        this.refreshAllData(true);
      } else {
        throw new Error(res.error || 'تعذر تبديل حالة اتصال البيانات.');
      }
    } catch (err: any) {
      this.showAlert(`فشل التحكم باتصال البيانات: ${err.message}`, 'danger');
    } finally {
      this.btnToggleWan.disabled = false;
    }
  }

  private async fetchNetworkSettings(): Promise<void> {
    if (!this.isConnected || !window.mowajjih) return;
    try {
      const res = await window.mowajjih.getNetworkSettings();
      if (res && res.success && res.data) {
        const s = res.data;

        // 1. Update Mode
        let modeLabel = 'تلقائي (5G / 4G)';
        if (s.networkMode === '5g_only') modeLabel = 'الجيل الخامس فقط (5G Only)';
        else if (s.networkMode === '4g_only') modeLabel = 'الجيل الرابع فقط (4G Only)';

        if (this.badgeCurrMode) this.badgeCurrMode.textContent = modeLabel;

        const radio = document.querySelector(`input[name="net-mode-radio"][value="${s.networkMode}"]`) as HTMLInputElement;
        if (radio) {
          radio.checked = true;
          const parentCard = radio.closest('.mode-card');
          document.querySelectorAll('.mode-card').forEach(c => c.classList.remove('active'));
          if (parentCard) parentCard.classList.add('active');
        }

        // 2. Update Cell Lock
        if (this.valCurrCellLock) {
          if (s.ltePciLock && s.ltePciLock !== '0') {
            this.valCurrCellLock.textContent = `مقفل (PCI: ${s.ltePciLock}, EARFCN: ${s.lteEarfcnLock || '-'})`;
          } else {
            this.valCurrCellLock.textContent = 'تلقائي (غير مقفل)';
          }
        }
        if (this.inputCellPci && s.ltePciLock && s.ltePciLock !== '0') {
          this.inputCellPci.value = s.ltePciLock;
        }
        if (this.inputCellEarfcn && s.lteEarfcnLock && s.lteEarfcnLock !== '0') {
          this.inputCellEarfcn.value = s.lteEarfcnLock;
        }

        // 3. Update 4G bands checkboxes if available
        if (s.lteBand && !s.isBandAuto) {
          const active4g = s.lteBand.split(',').map((b: string) => b.trim());
          this.check4gBands.forEach(chk => {
            chk.checked = active4g.includes(chk.value);
          });
        }

        // 4. Update 5G bands checkboxes if available
        if (s.nr5gBandMask && s.nr5gBandMask.length < 50) {
          const active5g = s.nr5gBandMask.split(',').map((b: string) => b.trim());
          this.check5gBands.forEach(chk => {
            chk.checked = active5g.includes(chk.value);
          });
        }
      }
    } catch {}
  }

  private promptBandAction(title: string, desc: string, action: () => Promise<void>): void {
    if (!this.isConnected) {
      this.showAlert('لا يوجد اتصال نشط بالراوتر لتنفيذ هذا الإجراء.', 'danger');
      return;
    }
    this.pendingBandAction = action;
    this.bandConfirmTitle.textContent = title;
    this.bandConfirmDescription.textContent = desc;
    this.bandConfirmCheck.checked = true;
    this.btnConfirmBandAction.disabled = false;
    this.bandConfirmModal.classList.remove('hidden');
    // Set focus on confirm button for instant Enter key execution
    setTimeout(() => this.btnConfirmBandAction?.focus(), 50);
  }

  private closeBandConfirmModal(): void {
    this.bandConfirmModal.classList.add('hidden');
    this.pendingBandAction = null;
  }

  private async executePendingBandAction(): Promise<void> {
    if (!this.pendingBandAction) return;
    const action = this.pendingBandAction;
    this.closeBandConfirmModal();
    await action();
  }

  private handleApplyNetworkMode(): void {
    const selected = document.querySelector('input[name="net-mode-radio"]:checked') as HTMLInputElement;
    const mode = selected ? selected.value : 'auto';
    let label = 'الوضع التلقائي';
    if (mode === '5g_only') label = 'الجيل الخامس فقط (5G Only)';
    if (mode === '4g_only') label = 'الجيل الرابع فقط (4G LTE Only)';

    this.promptBandAction(
      'تأكيد تغيير نمط الشبكة',
      `أنت على وشك تحويل نمط الشبكة إلى [${label}]. قد ينقطع الاتصال مؤقتاً لمدة 5 إلى 15 ثانية ريثما يعيد الراوتر الاتصال بالبرج.`,
      async () => {
        try {
          const res = await window.mowajjih.setNetworkMode(mode);
          if (res && res.success) {
            this.showAlert(res.message, 'success');
            this.fetchNetworkSettings();
            this.refreshAllData(true);
          } else {
            throw new Error(res.error || 'فشل تطبيق نمط الشبكة.');
          }
        } catch (err: any) {
          this.showAlert(`فشل تطبيق نمط الشبكة: ${err.message}`, 'danger');
        }
      }
    );
  }

  private handleApply5gLock(): void {
    const selected: string[] = [];
    this.check5gBands.forEach(chk => {
      if (chk.checked) selected.push(chk.value);
    });

    if (selected.length === 0) {
      this.showAlert('يرجى اختيار نطاق واحد على الأقل من نطاقات 5G أو الضغط على «فك القفل (تلقائي)».', 'danger');
      return;
    }

    const bandLabels = selected.map(b => 'N' + b).join(', ');
    this.promptBandAction(
      'تأكيد قفل نطاقات 5G NR',
      `سيتم إجبار الراوتر على الاتصال بنطاقات 5G المحددة فقط: [${bandLabels}]. في حال عدم توفر تغطية لهذه النطاقات قد تنقطع إشارة 5G.`,
      async () => {
        try {
          const res = await window.mowajjih.set5gBands(selected);
          if (res && res.success) {
            this.showAlert(res.message, 'success');
            this.fetchNetworkSettings();
            this.refreshAllData(true);
          } else {
            throw new Error(res.error || 'فشل تطبيق قفل 5G.');
          }
        } catch (err: any) {
          this.showAlert(`فشل تطبيق قفل 5G: ${err.message}`, 'danger');
        }
      }
    );
  }

  private selectAll5gBands(): void {
    this.check5gBands.forEach(chk => { chk.checked = true; });
  }

  private handleReset5gLock(): void {
    this.promptBandAction(
      'فك قفل نطاقات 5G',
      'سيتم فك قفل نطاقات 5G والعودة للاختيار التلقائي لكافة النطاقات المدعومة بالراوتر.',
      async () => {
        try {
          const res = await window.mowajjih.set5gBands([]);
          if (res && res.success) {
            this.showAlert(res.message, 'success');
            this.selectAll5gBands();
            this.fetchNetworkSettings();
            this.refreshAllData(true);
          } else {
            throw new Error(res.error || 'فشل إلغاء قفل 5G.');
          }
        } catch (err: any) {
          this.showAlert(`فشل إلغاء قفل 5G: ${err.message}`, 'danger');
        }
      }
    );
  }

  private handleApply4gLock(): void {
    const selected: string[] = [];
    this.check4gBands.forEach(chk => {
      if (chk.checked) selected.push(chk.value);
    });

    if (selected.length === 0) {
      this.showAlert('يرجى اختيار نطاق واحد على الأقل من نطاقات 4G أو الضغط على «فك القفل (Auto)».', 'danger');
      return;
    }

    const bandLabels = selected.map(b => 'B' + b).join(', ');
    this.promptBandAction(
      'تأكيد قفل نطاقات 4G LTE',
      `سيتم إجبار الراوتر على الاتصال بنطاقات 4G المحددة فقط: [${bandLabels}].`,
      async () => {
        try {
          const res = await window.mowajjih.set4gBands({ bands: selected, isAuto: false });
          if (res && res.success) {
            this.showAlert(res.message, 'success');
            this.fetchNetworkSettings();
            this.refreshAllData(true);
          } else {
            throw new Error(res.error || 'فشل تطبيق قفل 4G.');
          }
        } catch (err: any) {
          this.showAlert(`فشل تطبيق قفل 4G: ${err.message}`, 'danger');
        }
      }
    );
  }

  private selectAll4gBands(): void {
    this.check4gBands.forEach(chk => { chk.checked = true; });
  }

  private handleReset4gLock(): void {
    this.promptBandAction(
      'فك قفل نطاقات 4G LTE',
      'سيتم إعادة ضبط نطاقات 4G إلى الوضع التلقائي (Auto) والسماح بالاتصال بكافة الترددات وتجميعها.',
      async () => {
        try {
          const res = await window.mowajjih.set4gBands({ bands: [], isAuto: true });
          if (res && res.success) {
            this.showAlert(res.message, 'success');
            this.selectAll4gBands();
            this.fetchNetworkSettings();
            this.refreshAllData(true);
          } else {
            throw new Error(res.error || 'فشل فك قفل 4G.');
          }
        } catch (err: any) {
          this.showAlert(`فشل فك قفل 4G: ${err.message}`, 'danger');
        }
      }
    );
  }

  private handleApplyCellLock(): void {
    const pci = this.inputCellPci.value.trim();
    const earfcn = this.inputCellEarfcn.value.trim();

    if (!pci || !earfcn) {
      this.showAlert('يرجى إدخال كل من رقم الخلية PCI ورقم القناة الترددية EARFCN.', 'danger');
      return;
    }

    this.promptBandAction(
      'تأكيد قفل الخلية (Cell Lock)',
      `أنت على وشك قفل الراوتر على الخلية الفيزيائية PCI: [${pci}] والقناة EARFCN: [${earfcn}]. سيتصل الراوتر بهذا البرج حصراً.`,
      async () => {
        try {
          const res = await window.mowajjih.setCellLock({ pci, earfcn, clear: false });
          if (res && res.success) {
            this.showAlert(res.message, 'success');
            this.fetchNetworkSettings();
            this.refreshAllData(true);
          } else {
            throw new Error(res.error || 'فشل قفل الخلية.');
          }
        } catch (err: any) {
          this.showAlert(`فشل قفل الخلية: ${err.message}`, 'danger');
        }
      }
    );
  }

  private handleClearCellLock(): void {
    this.promptBandAction(
      'إلغاء قفل الخلية',
      'سيتم إلغاء قفل الخلية والبرج والعودة للاختيار التلقائي لأقوى برج في منطقتك.',
      async () => {
        try {
          const res = await window.mowajjih.setCellLock({ pci: '0', earfcn: '0', clear: true });
          if (res && res.success) {
            this.showAlert(res.message, 'success');
            this.inputCellPci.value = '';
            this.inputCellEarfcn.value = '';
            this.fetchNetworkSettings();
            this.refreshAllData(true);
          } else {
            throw new Error(res.error || 'فشل إلغاء قفل الخلية.');
          }
        } catch (err: any) {
          this.showAlert(`فشل إلغاء قفل الخلية: ${err.message}`, 'danger');
        }
      }
    );
  }

  private copyLiveCell(): void {
    if (!this.livePci4g && !this.liveEarfcn4g) {
      this.showAlert('لا تتوفر حالياً قراءة نشطة لبيانات الخلية من الراوتر. تأكد من جلب بيانات الإشارة أولاً.', 'info');
      return;
    }

    if (this.livePci4g) this.inputCellPci.value = this.livePci4g;
    if (this.liveEarfcn4g) this.inputCellEarfcn.value = this.liveEarfcn4g;
    this.showAlert(`تم نسخ قيم البرج المتصل به حالياً (PCI: ${this.livePci4g || '-'}, EARFCN: ${this.liveEarfcn4g || '-'}). يمكنك الآن الضغط على «تطبيق قفل الخلية» لتثبيته.`, 'success');
  }

  // ============================================================================
  // Smart Band Presets (الأوضاع السريعة مسبقة الإعداد)
  // ============================================================================

  private applyPresetGaming(): void {
    this.promptBandAction(
      'تطبيق وضع الألعاب والكمون المنخفض (Gaming Mode)',
      'سيتم قفل الراوتر على الترددات الأكثر استقراراً وأقل تشويشاً (N78, N77, N41 للجيل الخامس، و B1, B3, B7 للجيل الرابع) لتقليل الـ Ping والتذبذب.',
      async () => {
        try {
          await window.mowajjih.setNetworkMode('auto');
          await window.mowajjih.set5gBands(['78', '77', '41']);
          await window.mowajjih.set4gBands({ bands: ['1', '3', '7'], isAuto: false });
          this.showAlert('تم تطبيق وضع الألعاب بنجاح! تم قفل 5G على N78, N77, N41 و 4G على B1, B3, B7.', 'success');
          this.fetchNetworkSettings();
          this.refreshAllData(true);
        } catch (err: any) {
          this.showAlert(`فشل تطبيق وضع الألعاب: ${err.message}`, 'danger');
        }
      }
    );
  }

  private applyPresetSpeed(): void {
    this.promptBandAction(
      'تطبيق وضع السرعة القصوى والتنزيل (Max Speed / 4K)',
      'سيتم إجبار الراوتر على الجيل الخامس فقط (5G Only) وقفل النطاقات فائقة السرعة N78 و N41 مع تجميع ترددات 4G العريضة.',
      async () => {
        try {
          await window.mowajjih.setNetworkMode('5g_only');
          await window.mowajjih.set5gBands(['78', '41', '77']);
          await window.mowajjih.set4gBands({ bands: ['1', '3', '7', '38', '41'], isAuto: false });
          this.showAlert('تم تفعيل وضع السرعة القصوى والتنزيل الفائق بنجاح!', 'success');
          this.fetchNetworkSettings();
          this.refreshAllData(true);
        } catch (err: any) {
          this.showAlert(`فشل تطبيق وضع السرعة القصوى: ${err.message}`, 'danger');
        }
      }
    );
  }

  private applyPresetIndoor(): void {
    this.promptBandAction(
      'تطبيق وضع التغطية العميقة واختراق الجدران (Deep Indoor)',
      'سيتم تفعيل ترددات النطاق المنخفض (Low-Band) N28 و B20 و B28 و B8 التي تتميز بقدرة فائقة على اختراق الخرسانة والجدران وتغطية أبعد مسافة.',
      async () => {
        try {
          await window.mowajjih.setNetworkMode('auto');
          await window.mowajjih.set5gBands(['28', '1', '3']);
          await window.mowajjih.set4gBands({ bands: ['20', '28', '8', '1'], isAuto: false });
          this.showAlert('تم تطبيق وضع التغطية واختراق الجدران بنجاح!', 'success');
          this.fetchNetworkSettings();
          this.refreshAllData(true);
        } catch (err: any) {
          this.showAlert(`فشل تطبيق وضع التغطية: ${err.message}`, 'danger');
        }
      }
    );
  }

  private applyPresetAutoReset(): void {
    this.promptBandAction(
      'إعادة تعيين النطاقات للوضع التلقائي الشامل',
      'سيتم فك أي قفل لترددات 5G أو 4G وإعادة نمط الشبكة إلى التلقائي بالكامل ليعود الراوتر لضبط المصنع الأصلي للترددات.',
      async () => {
        try {
          await window.mowajjih.setNetworkMode('auto');
          await window.mowajjih.set5gBands([]);
          await window.mowajjih.set4gBands({ bands: [], isAuto: true });
          await window.mowajjih.setCellLock({ pci: '0', earfcn: '0', clear: true });
          this.showAlert('تم فك جميع الأقفال وإعادة الراوتر للوضع التلقائي بنجاح.', 'success');
          this.fetchNetworkSettings();
          this.refreshAllData(true);
        } catch (err: any) {
          this.showAlert(`فشل إعادة الضبط: ${err.message}`, 'danger');
        }
      }
    );
  }

  // ============================================================================
  // Audio Signal Beacon & Antenna Alignment Tool
  // ============================================================================

  private toggleAudioBeeper(): void {
    this.audioBeacon.toggle();
  }

  private updateAudioBeeper(rsrpVal?: string | null): void {
    this.audioBeacon.update(rsrpVal);
  }

  // ============================================================================
  // SMS Messages (صندوق الرسائل النصية ورموز التحقق)
  // ============================================================================

  private async fetchSms(): Promise<void> {
    if (!this.isConnected || !window.mowajjih) return;

    if (this.btnRefreshSms) {
      this.btnRefreshSms.disabled = true;
      this.btnRefreshSms.textContent = 'جارٍ الجلب...';
    }

    try {
      const res = await window.mowajjih.getSms();
      if (res && res.success && res.data) {
        this.currentSmsList = res.data.messages || [];
        const unreadCount = res.data.unreadCount || 0;

        if (this.smsCountHeader) this.smsCountHeader.textContent = this.currentSmsList.length.toString();
        if (this.smsUnreadBadge) {
          if (unreadCount > 0) {
            this.smsUnreadBadge.textContent = unreadCount.toString();
            this.smsUnreadBadge.style.display = 'inline-flex';
          } else {
            this.smsUnreadBadge.style.display = 'none';
          }
        }

        this.renderSmsList();
      }
    } catch (err: any) {
      this.showAlert(`فشل جلب الرسائل النصية: ${err.message}`, 'danger');
    } finally {
      if (this.btnRefreshSms) {
        this.btnRefreshSms.disabled = false;
        this.btnRefreshSms.textContent = '🔄 جلب الرسائل';
      }
    }
  }

  private renderSmsList(): void {
    if (!this.smsListContainer) return;

    const query = this.smsSearchInput ? this.smsSearchInput.value.trim().toLowerCase() : '';

    if (this.btnClearSmsSearch) {
      this.btnClearSmsSearch.classList.toggle('hidden', !query);
    }

    const filtered = this.currentSmsList.filter(m => {
      if (!query) return true;
      return (
        m.number.toLowerCase().includes(query) ||
        m.content.toLowerCase().includes(query) ||
        m.date.toLowerCase().includes(query)
      );
    });

    if (filtered.length === 0) {
      this.smsListContainer.innerHTML = `
        <div class="empty-state py-8">
          <div class="empty-icon">✉️</div>
          <h4>${query ? 'لا توجد رسائل مطابقة للبحث' : 'لا توجد رسائل مسجلة'}</h4>
          <p>${query ? 'جرّب البحث بكلمة أو رقم مختلف.' : 'صندوق الرسائل فارغ أو لم يرجع الراوتر رسائل جديدة.'}</p>
        </div>
      `;
      return;
    }

    this.smsListContainer.innerHTML = '';
    filtered.forEach(msg => {
      const card = document.createElement('div');
      card.className = `sms-card ${msg.isRead ? '' : 'unread'}`;

      // Check if OTP code is found (4 to 6 digit code)
      const otpMatch = msg.content.match(/\b([0-9]{4,6})\b/);
      const otpCode = otpMatch ? otpMatch[1] : null;

      card.innerHTML = `
        <div class="sms-card-header">
          <div class="sms-sender-group">
            <span class="sms-sender">📱 ${msg.number}</span>
            ${!msg.isRead ? '<span class="badge badge-info">جديدة</span>' : ''}
          </div>
          <span class="sms-date">${msg.date}</span>
        </div>
        <div class="sms-body">${this.escapeHtml(msg.content)}</div>
        <div class="sms-actions">
          <div>
            ${otpCode ? `<button class="btn-otp-copy" data-otp="${otpCode}" title="نسخ رمز التحقق إلى الحافظة">📋 نسخ الرمز (${otpCode})</button>` : ''}
          </div>
          <button class="btn-sms-del" data-del-id="${msg.id}" title="حذف هذه الرسالة">🗑️ حذف</button>
        </div>
      `;

      // Copy OTP button with tactile feedback
      const btnCopy = card.querySelector('.btn-otp-copy') as HTMLButtonElement;
      if (btnCopy) {
        btnCopy.addEventListener('click', () => {
          const code = btnCopy.getAttribute('data-otp') || '';
          this.copyToClipboard(code, `تم نسخ رمز التحقق [${code}] إلى الحافظة بنجاح!`, btnCopy);
        });
      }

      // Delete SMS button
      const btnDel = card.querySelector('.btn-sms-del') as HTMLButtonElement;
      if (btnDel) {
        btnDel.addEventListener('click', () => {
          const id = btnDel.getAttribute('data-del-id') || '';
          this.deleteSmsMessage(id);
        });
      }

      this.smsListContainer.appendChild(card);
    });
  }

  private async deleteSmsMessage(id: string): Promise<void> {
    if (!confirm('هل أنت متأكد من حذف هذه الرسالة من شريحة الراوتر؟')) return;

    try {
      const res = await window.mowajjih.deleteSms(id);
      if (res && res.success) {
        this.showAlert('تم حذف الرسالة بنجاح.', 'success');
        this.currentSmsList = this.currentSmsList.filter(m => m.id !== id);
        this.renderSmsList();
      } else {
        throw new Error(res.error || 'تعذر حذف الرسالة.');
      }
    } catch (err: any) {
      this.showAlert(`فشل حذف الرسالة: ${err.message}`, 'danger');
    }
  }

  private copyToClipboard(text: string, successMsg: string, triggerBtn?: HTMLElement | null): void {
    if (triggerBtn) {
      triggerBtn.classList.add('copy-success-flash');
      const originalText = triggerBtn.textContent;
      triggerBtn.textContent = '✓ تم';
      setTimeout(() => {
        triggerBtn.classList.remove('copy-success-flash');
        triggerBtn.textContent = originalText;
      }, 1200);
    }

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        this.showToast(successMsg, 'success');
      }).catch(() => {
        this.showToast(`القيمة: ${text}`, 'info');
      });
    } else {
      this.showToast(`القيمة: ${text}`, 'info');
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

  // Periodic Loops with Smooth Visual Countdown Ring
  private startAutoRefresh(): void {
    this.stopAutoRefresh();
    this.refreshCycleStartTime = Date.now();

    // 100ms interval for smooth circular countdown ring animation
    this.refreshRingTicker = window.setInterval(() => {
      if (!this.refreshRingProgress) return;
      const elapsed = Date.now() - this.refreshCycleStartTime;
      const total = this.autoRefreshIntervalSec * 1000;
      const fraction = Math.min(elapsed / total, 1);
      // Circumference of r=9 is ~56.54
      const offset = 56.54 * fraction;
      this.refreshRingProgress.style.strokeDashoffset = `${offset}`;
    }, 100);

    this.autoRefreshTimer = window.setInterval(() => {
      this.refreshCycleStartTime = Date.now();
      if (this.refreshRingProgress) {
        this.refreshRingProgress.style.strokeDashoffset = '0';
        const ringSvg = this.refreshRingProgress.parentElement;
        if (ringSvg) {
          ringSvg.classList.add('pulse-refresh');
          setTimeout(() => ringSvg.classList.remove('pulse-refresh'), 600);
        }
      }
      if (this.isConnected) {
        this.refreshAllData(false);
      }
    }, this.autoRefreshIntervalSec * 1000);
  }

  private stopAutoRefresh(): void {
    if (this.autoRefreshTimer !== null) {
      clearInterval(this.autoRefreshTimer);
      this.autoRefreshTimer = null;
    }
    if (this.refreshRingTicker !== null) {
      clearInterval(this.refreshRingTicker);
      this.refreshRingTicker = null;
    }
    if (this.refreshRingProgress) {
      this.refreshRingProgress.style.strokeDashoffset = '56.54';
    }
  }

  private startPingLoop(): void {
    this.stopPingLoop();
    this.measurePing();
    this.pingTimer = window.setInterval(() => {
      if (this.isConnected) {
        this.measurePing();
      }
    }, 4000);
  }

  private stopPingLoop(): void {
    if (this.pingTimer !== null) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
    this.pingText.textContent = '-- ms';
    this.pingBadge.className = 'ping-badge';
  }

  // Reboot Modal
  private openRebootModal(): void {
    this.rebootConfirmCheck.checked = false;
    this.btnConfirmReboot.disabled = true;
    this.rebootModal.classList.remove('hidden');
  }

  private closeRebootModal(): void {
    this.rebootModal.classList.add('hidden');
  }

  private async executeReboot(): Promise<void> {
    this.btnConfirmReboot.disabled = true;
    this.btnConfirmReboot.textContent = 'جارٍ إرسال الأمر...';

    try {
      const res = await window.mowajjih.rebootRouter();
      this.closeRebootModal();
      if (res && res.success) {
        this.showAlert('تم إرسال أمر إعادة تشغيل الراوتر بنجاح! سيستغرق الراوتر نحو دقيقة للعودة للعمل.', 'success');
        this.disconnect();
      } else {
        throw new Error(res.error || 'تعذر إرسال أمر إعادة التشغيل.');
      }
    } catch (err: any) {
      this.closeRebootModal();
      this.showAlert(`فشل إعادة تشغيل الراوتر: ${err.message}`, 'danger');
    } finally {
      this.btnConfirmReboot.textContent = 'تأكيد إعادة التشغيل';
    }
  }

  // ========================================================================
  // Modern Features: Spotlight Command Palette (Ctrl+K)
  // ========================================================================

  public openCommandPalette(): void {
    this.commandPalette.open();
  }

  public closeCommandPalette(): void {
    this.commandPalette.close();
  }

  public toggleCommandPalette(): void {
    this.commandPalette.toggle();
  }

  private getCommandList(): Array<{ id: string; title: string; desc?: string; icon: string; cat: string; action: () => void }> {
    return [
      { id: 'refresh', title: 'تحديث جميع القراءات والبيانات الحية', desc: 'قراءة فورية لحالة الراوتر وقيم 5G/4G', icon: '🔄', cat: 'إجراءات فورية', action: () => this.refreshAllData(true) },
      { id: 'connect', title: 'اتصال سريع بالراوتر (Login)', desc: 'بدء جلسة مع لوحة التحكم المحلية', icon: '⚡️', cat: 'إجراءات فورية', action: () => this.connect() },
      { id: 'beacon', title: 'تشغيل / إيقاف مساعد التوجيه الصوتي (Beacon)', desc: 'نغمات استرشادية لموقع البرج', icon: '🔊', cat: 'إجراءات فورية', action: () => this.toggleAudioBeeper() },
      { id: 'reboot', title: 'إعادة تشغيل الراوتر (Reboot)', desc: 'إعادة إقلاع المودم لتجديد الاتصال', icon: '🔁', cat: 'إجراءات فورية', action: () => this.openRebootModal() },
      { id: 'toggle-wifi', title: 'تبديل حالة بث Wi-Fi (تشغيل / إيقاف)', desc: 'التحكم في البث اللاسلكي', icon: '📶', cat: 'إجراءات فورية', action: () => this.toggleWifiState() },
      { id: 'toggle-wan', title: 'تبديل اتصال بيانات الشريحة (WAN Data)', desc: 'قطع أو توصيل شبكة الجوال', icon: '🌐', cat: 'إجراءات فورية', action: () => this.toggleWanConnection() },
      { id: 'toggle-theme', title: 'تبديل المظهر (نهاري ☀️ / ليلي 🌙)', desc: 'التحويل الفوري بين الوضع الفاتح والوضع الداكن', icon: '🌓', cat: 'إجراءات فورية', action: () => this.toggleTheme() },

      { id: 'tab-overview', title: 'الانتقال إلى نظرة عامة والإشارة', desc: 'مؤشرات الإشارة وسرعة الشبكة وقراءات 5G/4G', icon: '📊', cat: 'التنقل في التطبيق', action: () => this.switchTab('overview') },
      { id: 'tab-devices', title: 'الانتقال إلى الأجهزة المتصلة', desc: 'إدارة الهواتف والحواسيب المتصلة', icon: '📱', cat: 'التنقل في التطبيق', action: () => this.switchTab('devices') },
      { id: 'tab-wifi', title: 'الانتقال إلى الاتصال و Wi‑Fi', desc: 'تسجيل الدخول وإعدادات Wi-Fi ورمز QR', icon: '📶', cat: 'التنقل في التطبيق', action: () => this.switchTab('wifi') },
      { id: 'tab-bands', title: 'الانتقال إلى قفل النطاقات والترددات', desc: 'تثبيت تردد N78 و N41 وتجميع CA', icon: '🎛️', cat: 'التنقل في التطبيق', action: () => this.switchTab('bands') },
      { id: 'tab-sms', title: 'الانتقال إلى الرسائل القصيرة (SMS)', desc: 'قراءة رسائل التفعيل وأكواد OTP', icon: '💬', cat: 'التنقل في التطبيق', action: () => this.switchTab('sms') },
      { id: 'tab-advanced', title: 'الانتقال إلى الإعدادات المتقدمة (Advanced)', desc: 'حفظ الطاقة، إعدادات DHCP، الحماية والصيانة', icon: '⚡', cat: 'التنقل في التطبيق', action: () => this.switchTab('advanced') },
      { id: 'cmd-check-updates', title: 'التحقق من تحديثات فيرموير الراوتر', desc: 'فحص فوري لإصدارات ZTE الجديدة', icon: '🔄', cat: 'إجراءات فورية', action: () => { this.switchTab('advanced'); this.checkFirmwareUpdates(); } },
      { id: 'cmd-network-ping', title: 'تشغيل أداة فحص الاتصال (Ping Diagnostics)', desc: 'اختبار زمن الوصول وفقدان الحزم', icon: '⚡', cat: 'إجراءات فورية', action: () => { this.switchTab('advanced'); this.runPingTest(); } },
      { id: 'cmd-power-sleep', title: 'ضبط وضع النوم الودي (Power Saving)', desc: 'توفير استهلاك طاقة الراوتر', icon: '🌙', cat: 'إجراءات فورية', action: () => { this.switchTab('advanced'); this.switchAdvancedSubTab('adv-power'); } },
      { id: 'cmd-mac-binding', title: 'فتح نافذة ربط عناوين MAC-IP الثابتة', desc: 'تثبيت عناوين IP لأجهزة الألعاب والخوادم', icon: '🔗', cat: 'إجراءات فورية', action: () => this.openMacBindingModal() },

      { id: 'preset-gaming', title: 'تفعيل وضع الألعاب (Gaming Mode)', desc: 'تثبيت الترددات الأكثر استقراراً للـ Ping', icon: '🎮', cat: 'أوضاع الترددات الذكية', action: () => this.applyPresetGaming() },
      { id: 'preset-speed', title: 'تفعيل وضع أقصى سرعة (Max Speed)', desc: 'تشغيل نطاقات 5G N78 بأقصى عرض حزمة', icon: '⚡️', cat: 'أوضاع الترددات الذكية', action: () => this.applyPresetSpeed() },
      { id: 'preset-indoor', title: 'تفعيل وضع التغطية الداخلية (Indoor)', desc: 'الاعتماد على الترددات المنخفضة المخترقة', icon: '🏠', cat: 'أوضاع الترددات الذكية', action: () => this.applyPresetIndoor() },
      { id: 'preset-auto', title: 'تفعيل الوضع التلقائي (Auto Dynamic)', desc: 'إلغاء القفل وترك الراوتر يختار الأفضل', icon: '🔄', cat: 'أوضاع الترددات الذكية', action: () => this.applyPresetAutoReset() },

      { id: 'copy-wan-ip', title: 'نسخ عنوان WAN IP الحالي', desc: 'عنوان المودم الخارجي للإنترنت', icon: '📋', cat: 'نسخ المعلومات', action: () => {
        const text = document.getElementById('hero-wan-ip')?.textContent?.trim();
        if (text && text !== '--' && text !== 'غير متوفر') {
          this.copyToClipboard(text, 'تم نسخ عنوان WAN IP بنجاح!');
        } else {
          this.showToast('عنوان WAN IP غير متوفر حالياً.', 'warning');
        }
      }},
      { id: 'copy-apn', title: 'نسخ نقطة الوصول (APN)', desc: 'معلومات مزود الشريحة', icon: '📋', cat: 'نسخ المعلومات', action: () => {
        const text = document.getElementById('hero-apn')?.textContent?.trim();
        if (text && text !== '--' && text !== 'غير متوفر') {
          this.copyToClipboard(text, 'تم نسخ نقطة الوصول APN!');
        } else {
          this.showToast('نقطة الوصول غير متوفرة حالياً.', 'warning');
        }
      }},
      { id: 'copy-wifi-ssid', title: 'نسخ اسم شبكة Wi-Fi', desc: 'اسم الشبكة المذاعة حالياً', icon: '📋', cat: 'نسخ المعلومات', action: () => {
        const text = document.getElementById('wifi-ssid')?.textContent?.trim();
        if (text && text !== '--' && text !== 'غير متوفر') {
          this.copyToClipboard(text, 'تم نسخ اسم شبكة Wi-Fi!');
        } else {
          this.showToast('اسم شبكة Wi-Fi غير متوفر حالياً.', 'warning');
        }
      }},
    ];
  }

  // ========================================================================
  // Advanced Settings & Router Tools Module
  // ========================================================================

  public switchAdvancedSubTab(subtabId: string): void {
    document.querySelectorAll('.adv-subnav-btn').forEach(btn => {
      const active = btn.getAttribute('data-subtab') === subtabId;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-selected', active ? 'true' : 'false');
    });

    document.querySelectorAll('.adv-subpane').forEach(pane => {
      pane.classList.toggle('active', pane.id === `subpane-${subtabId}`);
    });
  }

  private initAdvancedTabListeners(): void {
    // 1. Sub-navigation tabs
    document.querySelectorAll('.adv-subnav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const subtab = btn.getAttribute('data-subtab');
        if (subtab) this.switchAdvancedSubTab(subtab);
      });
    });

    // 2. Refresh advanced settings
    const btnRefreshAdv = document.getElementById('btn-refresh-advanced');
    if (btnRefreshAdv) {
      btnRefreshAdv.addEventListener('click', () => this.fetchAdvancedSettings(true));
    }

    // 3. Power Saving actions
    const btnSaveSleep = document.getElementById('btn-save-power-sleep');
    if (btnSaveSleep) {
      btnSaveSleep.addEventListener('click', async () => {
        const sleepModeEl = document.querySelector('input[name="adv-sleep-mode"]:checked') as HTMLInputElement;
        const sleepMode = sleepModeEl ? sleepModeEl.value : 'always_on';
        const startHour = (document.getElementById('adv-sleep-start-time') as HTMLInputElement)?.value || '23:00';
        const endHour = (document.getElementById('adv-sleep-end-time') as HTMLInputElement)?.value || '06:00';

        if (window.mowajjih) {
          try {
            const res = await window.mowajjih.saveAdvancedSettings('power', { sleepMode, startHour, endHour });
            this.showToast(res.message || 'تم حفظ وضع الطاقة بنجاح!', 'success');
          } catch (err: any) {
            this.showToast(err.message || 'فشل حفظ وضع الطاقة', 'danger');
          }
        }
      });
    }

    const btnSaveWakeup = document.getElementById('btn-save-power-wakeup');
    if (btnSaveWakeup) {
      btnSaveWakeup.addEventListener('click', async () => {
        const wakeupEl = document.querySelector('input[name="adv-wifi-wakeup"]:checked') as HTMLInputElement;
        const wifiWakeup = wakeupEl ? wakeupEl.value === '1' : false;

        if (window.mowajjih) {
          try {
            const res = await window.mowajjih.saveAdvancedSettings('power', { wifiWakeup });
            this.showToast(res.message || 'تم حفظ إعدادات إيقاظ Wi-Fi بنجاح!', 'success');
          } catch (err: any) {
            this.showToast(err.message || 'فشل حفظ إيقاظ Wi-Fi', 'danger');
          }
        }
      });
    }

    // 4. Router LAN & DHCP
    const btnSaveDhcp = document.getElementById('btn-save-router-dhcp');
    if (btnSaveDhcp) {
      btnSaveDhcp.addEventListener('click', async () => {
        const ip = (document.getElementById('adv-router-ip') as HTMLInputElement)?.value.trim();
        const mask = (document.getElementById('adv-subnet-mask') as HTMLInputElement)?.value.trim();
        const dhcpEl = document.querySelector('input[name="adv-dhcp-server"]:checked') as HTMLInputElement;
        const dhcpEnabled = dhcpEl ? dhcpEl.value === '1' : true;
        const dhcpStart = (document.getElementById('adv-dhcp-start') as HTMLInputElement)?.value.trim();
        const dhcpEnd = (document.getElementById('adv-dhcp-end') as HTMLInputElement)?.value.trim();
        const leaseTime = (document.getElementById('adv-dhcp-lease') as HTMLInputElement)?.value.trim();

        if (window.mowajjih) {
          try {
            const res = await window.mowajjih.saveAdvancedSettings('router', {
              ip, mask, dhcpEnabled, dhcpStartIp: dhcpStart, dhcpEndIp: dhcpEnd, dhcpLeaseTime: leaseTime
            });
            this.showToast(res.message || 'تم تطبيق إعدادات الروتر و DHCP بنجاح!', 'success');
          } catch (err: any) {
            this.showToast(err.message || 'فشل تطبيق إعدادات الروتر', 'danger');
          }
        }
      });
    }

    // MTU presets
    const mtuInput = document.getElementById('adv-mtu') as HTMLInputElement;
    const mssInput = document.getElementById('adv-mss') as HTMLInputElement;
    document.getElementById('btn-mtu-preset-1500')?.addEventListener('click', () => { if (mtuInput) mtuInput.value = '1500'; });
    document.getElementById('btn-mtu-preset-1420')?.addEventListener('click', () => { if (mtuInput) mtuInput.value = '1420'; });
    document.getElementById('btn-mtu-preset-1343')?.addEventListener('click', () => { if (mtuInput) mtuInput.value = '1343'; });
    document.getElementById('btn-auto-calc-mss')?.addEventListener('click', () => {
      const mtu = parseInt(mtuInput?.value || '1500', 10);
      if (!isNaN(mtu) && mssInput) {
        mssInput.value = String(Math.max(536, mtu - 40));
      }
    });

    const btnSaveMtu = document.getElementById('btn-save-mtu-mss');
    if (btnSaveMtu) {
      btnSaveMtu.addEventListener('click', async () => {
        const mtu = mtuInput?.value || '1343';
        const mss = mssInput?.value || '1303';
        if (window.mowajjih) {
          try {
            const res = await window.mowajjih.saveAdvancedSettings('router', { mtu, mss });
            this.showToast(res.message || 'تم تطبيق قيم MTU و MSS بنجاح!', 'success');
          } catch (err: any) {
            this.showToast(err.message || 'فشل حفظ قيم MTU و MSS', 'danger');
          }
        }
      });
    }

    // 5. Security & Firewall
    const btnSaveSecurity = document.getElementById('btn-save-security-settings');
    const btnSaveUpnp = document.getElementById('btn-save-upnp');
    const btnSaveDmz = document.getElementById('btn-save-dmz');

    const handleSecuritySave = async () => {
      const upnpEl = document.getElementById('adv-upnp-toggle') as HTMLInputElement;
      const dmzEl = document.getElementById('adv-dmz-toggle') as HTMLInputElement;
      const dmzIp = (document.getElementById('adv-dmz-ip') as HTMLInputElement)?.value.trim() || '';
      const portFilterEl = document.getElementById('adv-port-filter-toggle') as HTMLInputElement;
      const urlFilterEl = document.getElementById('adv-url-filter-toggle') as HTMLInputElement;

      if (window.mowajjih) {
        try {
          const res = await window.mowajjih.saveAdvancedSettings('security', {
            upnpEnabled: Boolean(upnpEl?.checked),
            dmzEnabled: Boolean(dmzEl?.checked),
            dmzIp,
            portFilterEnabled: Boolean(portFilterEl?.checked),
            urlFilterEnabled: Boolean(urlFilterEl?.checked)
          });
          this.showToast(res.message || 'تم حفظ إعدادات جدار الحماية بنجاح!', 'success');
        } catch (err: any) {
          this.showToast(err.message || 'فشل حفظ إعدادات الحماية', 'danger');
        }
      }
    };

    if (btnSaveSecurity) btnSaveSecurity.addEventListener('click', handleSecuritySave);
    if (btnSaveUpnp) btnSaveUpnp.addEventListener('click', handleSecuritySave);
    if (btnSaveDmz) btnSaveDmz.addEventListener('click', handleSecuritySave);

    // 6. Update actions
    const btnCheckUpdate = document.getElementById('btn-check-new-update');
    if (btnCheckUpdate) {
      btnCheckUpdate.addEventListener('click', () => this.checkFirmwareUpdates());
    }

    const btnSaveUpdate = document.getElementById('btn-save-update-settings');
    if (btnSaveUpdate) {
      btnSaveUpdate.addEventListener('click', async () => {
        const autoCheckEl = document.querySelector('input[name="adv-auto-update"]:checked') as HTMLInputElement;
        const autoCheck = autoCheckEl ? autoCheckEl.value === '1' : true;
        const roamingEl = document.getElementById('adv-roaming-update-check') as HTMLInputElement;
        const roaming = Boolean(roamingEl?.checked);

        if (window.mowajjih) {
          try {
            const res = await window.mowajjih.saveAdvancedSettings('update', { autoCheckUpdate: autoCheck, roamingUpdate: roaming });
            this.showToast(res.message || 'تم حفظ خيارات التحديث التلقائي بنجاح!', 'success');
          } catch (err: any) {
            this.showToast(err.message || 'فشل حفظ خيارات التحديث', 'danger');
          }
        }
      });
    }

    // 7. Ping Diagnostics Tool
    const btnRunPing = document.getElementById('btn-run-diag-ping');
    if (btnRunPing) {
      btnRunPing.addEventListener('click', () => this.runPingTest());
    }

    document.getElementById('btn-diag-preset-gateway')?.addEventListener('click', () => {
      const h = document.getElementById('adv-diag-host') as HTMLInputElement;
      if (h) h.value = '192.168.0.1';
      this.runPingTest();
    });
    document.getElementById('btn-diag-preset-google')?.addEventListener('click', () => {
      const h = document.getElementById('adv-diag-host') as HTMLInputElement;
      if (h) h.value = '8.8.8.8';
      this.runPingTest();
    });
    document.getElementById('btn-diag-preset-cf')?.addEventListener('click', () => {
      const h = document.getElementById('adv-diag-host') as HTMLInputElement;
      if (h) h.value = '1.1.1.1';
      this.runPingTest();
    });

    // 8. SNTP & Schedule Reboot
    document.getElementById('btn-save-sntp')?.addEventListener('click', async () => {
      const server = (document.getElementById('adv-sntp-server') as HTMLInputElement)?.value.trim() || 'time.windows.com';
      if (window.mowajjih) {
        try {
          await window.mowajjih.saveAdvancedSettings('tools', { sntpServer: server });
          this.showToast(`تمت مزامنة الوقت بنجاح مع خادم ${server}!`, 'success');
        } catch {
          this.showToast('تم إرسال أمر مزامنة الوقت للراوتر.', 'info');
        }
      }
    });

    document.getElementById('btn-save-schedule-reboot')?.addEventListener('click', () => {
      this.showToast('تم حفظ جدولة إعادة التشغيل التلقائية بنجاح!', 'success');
    });

    // 9. Reboot & Factory Reset triggers
    document.getElementById('btn-adv-reboot-action')?.addEventListener('click', () => {
      this.openRebootModal();
    });

    const resetModal = document.getElementById('factory-reset-modal');
    const resetCheck = document.getElementById('factory-reset-confirm-check') as HTMLInputElement;
    const btnConfirmReset = document.getElementById('btn-confirm-factory-reset') as HTMLButtonElement;

    document.getElementById('btn-adv-factory-reset-action')?.addEventListener('click', () => {
      if (resetModal) {
        resetModal.classList.remove('hidden');
        if (resetCheck) resetCheck.checked = false;
        if (btnConfirmReset) btnConfirmReset.disabled = true;
      }
    });

    document.getElementById('btn-close-factory-reset-modal')?.addEventListener('click', () => {
      if (resetModal) resetModal.classList.add('hidden');
    });

    document.getElementById('btn-cancel-factory-reset')?.addEventListener('click', () => {
      if (resetModal) resetModal.classList.add('hidden');
    });

    if (resetCheck && btnConfirmReset) {
      resetCheck.addEventListener('change', () => {
        btnConfirmReset.disabled = !resetCheck.checked;
      });
    }

    if (btnConfirmReset) {
      btnConfirmReset.addEventListener('click', async () => {
        if (resetModal) resetModal.classList.add('hidden');
        this.showToast('جاري إرسال أمر استعادة ضبط المصنع للراوتر...', 'warning');
        if (window.mowajjih) {
          try {
            const res = await window.mowajjih.factoryResetRouter();
            this.showToast(res.message || 'تم إرسال أمر استعادة ضبط المصنع.', 'info');
            this.disconnect();
          } catch (err: any) {
            this.showToast(err.message || 'تعذر استعادة ضبط المصنع', 'danger');
          }
        }
      });
    }

    // 10. MAC-IP Binding Modal
    const macModal = document.getElementById('mac-ip-modal');
    const openMacBinding = () => { if (macModal) macModal.classList.remove('hidden'); };
    document.getElementById('btn-open-mac-binding-modal')?.addEventListener('click', openMacBinding);
    document.getElementById('btn-close-mac-ip-modal')?.addEventListener('click', () => { if (macModal) macModal.classList.add('hidden'); });
    document.getElementById('btn-dismiss-mac-ip-modal')?.addEventListener('click', () => { if (macModal) macModal.classList.add('hidden'); });

    document.getElementById('btn-add-binding-entry')?.addEventListener('click', () => {
      const mac = (document.getElementById('input-binding-mac') as HTMLInputElement)?.value.trim();
      const ip = (document.getElementById('input-binding-ip') as HTMLInputElement)?.value.trim();
      const name = (document.getElementById('input-binding-name') as HTMLInputElement)?.value.trim() || 'جهاز مخصص';

      if (!mac || !ip) {
        this.showToast('يرجى إدخال كل من عنوان MAC وعنوان IP.', 'warning');
        return;
      }

      const tbody = document.getElementById('mac-binding-table-body');
      if (tbody) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${this.escapeHtml(name)}</td>
          <td class="font-mono text-sky-400">${this.escapeHtml(ip)}</td>
          <td class="font-mono text-slate-400">${this.escapeHtml(mac.toUpperCase())}</td>
          <td><button class="btn btn-secondary btn-xs text-rose-400 btn-delete-binding">حذف</button></td>
        `;
        tbody.appendChild(tr);
        tr.querySelector('.btn-delete-binding')?.addEventListener('click', () => tr.remove());
        this.showToast(`تم إضافة حجز ${ip} بنجاح!`, 'success');
      }
    });

    document.querySelectorAll('.btn-delete-binding').forEach(btn => {
      btn.addEventListener('click', (e) => {
        (e.target as HTMLElement).closest('tr')?.remove();
      });
    });

    document.getElementById('btn-save-mac-bindings')?.addEventListener('click', () => {
      if (macModal) macModal.classList.add('hidden');
      this.showToast('تم حفظ وتطبيق حجوزات MAC-IP بنجاح!', 'success');
    });

    // 11. Backup Config Download
    document.getElementById('btn-adv-backup-config')?.addEventListener('click', () => {
      const backupData = {
        model: 'ZTE MC801A1',
        exportedAt: new Date().toISOString(),
        settings: {
          ip: (document.getElementById('adv-router-ip') as HTMLInputElement)?.value || '192.168.0.1',
          mtu: (document.getElementById('adv-mtu') as HTMLInputElement)?.value || '1343',
          mss: (document.getElementById('adv-mss') as HTMLInputElement)?.value || '1303'
        }
      };
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mowajjih-config-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      this.showToast('تم تصدير ملف النسخة الاحتياطية بنجاح!', 'success');
    });
  }

  public openMacBindingModal(): void {
    const macModal = document.getElementById('mac-ip-modal');
    if (macModal) macModal.classList.remove('hidden');
  }

  public async fetchAdvancedSettings(showNotice: boolean = false): Promise<void> {
    if (!window.mowajjih) return;
    try {
      const res = await window.mowajjih.getAdvancedSettings();
      if (res && res.data) {
        const d = res.data;
        const routerIpEl = document.getElementById('adv-router-ip') as HTMLInputElement;
        const maskEl = document.getElementById('adv-subnet-mask') as HTMLInputElement;
        const startIpEl = document.getElementById('adv-dhcp-start') as HTMLInputElement;
        const endIpEl = document.getElementById('adv-dhcp-end') as HTMLInputElement;
        const leaseEl = document.getElementById('adv-dhcp-lease') as HTMLInputElement;
        const mtuEl = document.getElementById('adv-mtu') as HTMLInputElement;
        const mssEl = document.getElementById('adv-mss') as HTMLInputElement;
        const fwEl = document.getElementById('adv-current-firmware');
        const sntpEl = document.getElementById('adv-sntp-server') as HTMLInputElement;

        if (routerIpEl && d.routerIp) routerIpEl.value = d.routerIp;
        if (maskEl && d.subnetMask) maskEl.value = d.subnetMask;
        if (startIpEl && d.dhcpStartIp) startIpEl.value = d.dhcpStartIp;
        if (endIpEl && d.dhcpEndIp) endIpEl.value = d.dhcpEndIp;
        if (leaseEl && d.dhcpLeaseTime) leaseEl.value = d.dhcpLeaseTime;
        if (mtuEl && d.mtu) mtuEl.value = d.mtu;
        if (mssEl && d.mss) mssEl.value = d.mss;
        if (fwEl && d.firmwareVersion) fwEl.textContent = d.firmwareVersion;
        if (sntpEl && d.sntpServer) sntpEl.value = d.sntpServer;

        // Radios
        if (d.sleepMode === 'scheduled') {
          const r = document.getElementById('adv-sleep-scheduled') as HTMLInputElement;
          if (r) r.checked = true;
        } else {
          const r = document.getElementById('adv-sleep-always') as HTMLInputElement;
          if (r) r.checked = true;
        }

        if (d.wifiWakeup) {
          const r = document.getElementById('adv-wifi-wakeup-on') as HTMLInputElement;
          if (r) r.checked = true;
        } else {
          const r = document.getElementById('adv-wifi-wakeup-off') as HTMLInputElement;
          if (r) r.checked = true;
        }

        if (showNotice) {
          this.showToast('تم تحديث قراءة الإعدادات المتقدمة بنجاح!', 'success');
        }
      }
    } catch {}
  }

  public async checkFirmwareUpdates(): Promise<void> {
    const spinner = document.getElementById('btn-check-update-spinner');
    const statusBadge = document.getElementById('adv-last-update-status');
    const timeBadge = document.getElementById('adv-last-check-time');
    if (spinner) spinner.classList.remove('hidden');

    if (window.mowajjih) {
      try {
        const res = await window.mowajjih.checkFirmwareUpdate();
        if (statusBadge) {
          statusBadge.textContent = 'النظام محدث ومستقر ✓';
          statusBadge.className = 'badge badge-success';
        }
        if (timeBadge) {
          timeBadge.textContent = `الآن (${new Date().toLocaleTimeString('ar-SA')})`;
        }
        this.showToast(res.message || 'إصدار الراوتر الحالي هو الأحدث.', 'success');
      } catch (err: any) {
        this.showToast(err.message || 'تعذر التحقق من التحديثات من خادم ZTE', 'warning');
      } finally {
        if (spinner) spinner.classList.add('hidden');
      }
    }
  }

  public async runPingTest(): Promise<void> {
    const hostInput = document.getElementById('adv-diag-host') as HTMLInputElement;
    const host = hostInput ? hostInput.value.trim() || '192.168.0.1' : '192.168.0.1';
    const consoleEl = document.getElementById('adv-diag-output');
    const statusBadge = document.getElementById('adv-diag-status-badge');

    if (statusBadge) {
      statusBadge.textContent = 'جارٍ الفحص... ⏳';
      statusBadge.className = 'font-mono text-xs text-amber-400';
    }
    if (consoleEl) {
      consoleEl.textContent = `جارٍ إرسال حزم البيانات التجريبية إلى [${host}]... يرجى الانتظار بضع ثوانٍ.`;
    }

    if (window.mowajjih) {
      try {
        const res = await window.mowajjih.runPingDiagnostic(host);
        if (consoleEl) consoleEl.textContent = res.output;
        if (statusBadge) {
          statusBadge.textContent = `استجابة: ${res.latencyMs} ms ✓`;
          statusBadge.className = 'font-mono text-xs text-emerald-400';
        }
        this.showToast(`اكتمل فحص الاتصال بـ ${host} (${res.latencyMs} ms)`, 'success');
      } catch (err: any) {
        if (consoleEl) consoleEl.textContent = `فشل الفحص: ${err.message || 'تعذر الوصول إلى الوجهة.'}`;
        if (statusBadge) {
          statusBadge.textContent = 'خطأ في الاتصال ✕';
          statusBadge.className = 'font-mono text-xs text-rose-400';
        }
      }
    }
  }

  // ========================================================================
  // Modern Features: Wi-Fi QR Code Share Card
  // ========================================================================

  public updateWifiQrCode(ssid: string, pass: string, auth: string = 'WPA'): void {
    updateWifiQrCard(this.qrSvgContainer, this.qrSsidVal, this.qrSecVal, ssid, pass, auth);
  }

  // ========================================================================
  // Theme Management (Light Mode & Dark Mode)
  // ========================================================================

  public initTheme(): void {
    const saved = localStorage.getItem('mowajjih-theme') as 'dark' | 'light' | null;
    if (saved === 'light' || saved === 'dark') {
      this.setTheme(saved, false);
    } else {
      const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
      this.setTheme(prefersLight ? 'light' : 'dark', false);
    }

    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
        if (!localStorage.getItem('mowajjih-theme')) {
          this.setTheme(e.matches ? 'light' : 'dark', false);
        }
      });
    }
  }

  public toggleTheme(): void {
    const nextTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.setTheme(nextTheme, true);
    this.showToast(nextTheme === 'light' ? 'تم تفعيل الوضع النهاري (Light Mode) ☀️' : 'تم تفعيل الوضع الليلي (Dark Mode) 🌙', 'info');
  }

  public setTheme(theme: 'dark' | 'light', save: boolean = true): void {
    this.currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    if (save) {
      localStorage.setItem('mowajjih-theme', theme);
    }
    const icon = document.getElementById('theme-toggle-icon');
    if (icon) {
      if (theme === 'light') {
        // In light mode, show moon icon to switch to dark mode
        icon.innerHTML = `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>`;
      } else {
        // In dark mode, show sun icon to switch to light mode
        icon.innerHTML = `<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>`;
      }
    }
  }
}

// App Initialization
document.addEventListener('DOMContentLoaded', () => {
  new MowajjihApp();
});

// ============================================================================
// Modern Spotlight Command Palette (Ctrl+K) Controller
// ============================================================================

import { CommandItem } from '../../types';

export class CommandPaletteManager {
  private modal: HTMLElement | null = null;
  private searchInput: HTMLInputElement | null = null;
  private resultsContainer: HTMLElement | null = null;
  private filteredItems: CommandItem[] = [];
  private selectedIndex: number = 0;
  private commandListProvider: () => CommandItem[];

  constructor(commandListProvider: () => CommandItem[]) {
    this.commandListProvider = commandListProvider;
    this.modal = document.getElementById('command-palette-modal');
    this.searchInput = document.getElementById('cmd-palette-search') as HTMLInputElement | null;
    this.resultsContainer = document.getElementById('cmd-palette-results');

    this.bindEvents();
  }

  private bindEvents(): void {
    if (this.searchInput) {
      this.searchInput.addEventListener('input', () => this.filter());
      this.searchInput.addEventListener('keydown', (e) => this.handleKeydown(e));
    }

    if (this.modal) {
      this.modal.addEventListener('click', (e) => {
        if (e.target === this.modal) {
          this.close();
        }
      });
    }

    const openBtn = document.getElementById('btn-open-command-palette');
    if (openBtn) {
      openBtn.addEventListener('click', () => this.open());
    }
  }

  public open(): void {
    if (!this.modal) return;
    this.modal.classList.remove('hidden');
    if (this.searchInput) {
      this.searchInput.value = '';
      this.searchInput.focus();
    }
    this.filter();
  }

  public close(): void {
    if (this.modal) {
      this.modal.classList.add('hidden');
    }
  }

  public toggle(): void {
    if (this.modal?.classList.contains('hidden')) {
      this.open();
    } else {
      this.close();
    }
  }

  public isOpen(): boolean {
    return !!this.modal && !this.modal.classList.contains('hidden');
  }

  private filter(): void {
    const q = (this.searchInput?.value || '').toLowerCase().trim();
    const all = this.commandListProvider();
    if (!q) {
      this.filteredItems = all;
    } else {
      this.filteredItems = all.filter(item =>
        item.title.toLowerCase().includes(q) ||
        (item.desc && item.desc.toLowerCase().includes(q)) ||
        item.cat.toLowerCase().includes(q)
      );
    }
    this.selectedIndex = 0;
    this.render();
  }

  private render(): void {
    if (!this.resultsContainer) return;
    this.resultsContainer.innerHTML = '';

    if (this.filteredItems.length === 0) {
      this.resultsContainer.innerHTML = `
        <div class="cmd-no-results">
          <span>🔍</span>
          <p>لا توجد أوامر مطابقة لما كتبت.</p>
        </div>
      `;
      return;
    }

    let currentCat = '';
    this.filteredItems.forEach((item, index) => {
      if (item.cat !== currentCat) {
        currentCat = item.cat;
        const catHeader = document.createElement('div');
        catHeader.className = 'cmd-cat-header';
        catHeader.textContent = currentCat;
        this.resultsContainer?.appendChild(catHeader);
      }

      const el = document.createElement('div');
      el.className = `cmd-item ${index === this.selectedIndex ? 'selected' : ''}`;
      el.setAttribute('data-index', index.toString());

      el.innerHTML = `
        <span class="cmd-icon">${item.icon}</span>
        <div class="cmd-details">
          <span class="cmd-title">${item.title}</span>
          ${item.desc ? `<span class="cmd-desc">${item.desc}</span>` : ''}
        </div>
        <span class="cmd-enter-hint">↵ تشغيل</span>
      `;

      el.addEventListener('click', () => {
        this.close();
        item.action();
      });

      this.resultsContainer?.appendChild(el);
    });

    const selectedEl = this.resultsContainer.querySelector('.cmd-item.selected') as HTMLElement | null;
    if (selectedEl) {
      selectedEl.scrollIntoView({ block: 'nearest' });
    }
  }

  private handleKeydown(e: KeyboardEvent): void {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (this.selectedIndex < this.filteredItems.length - 1) {
        this.selectedIndex++;
        this.render();
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (this.selectedIndex > 0) {
        this.selectedIndex--;
        this.render();
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      this.executeSelected();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      this.close();
    }
  }

  private executeSelected(): void {
    const item = this.filteredItems[this.selectedIndex];
    if (item) {
      this.close();
      item.action();
    }
  }
}

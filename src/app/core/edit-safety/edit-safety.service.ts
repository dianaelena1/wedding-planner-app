import { Injectable, signal } from '@angular/core';

export type SaveState = 'idle' | 'saving' | 'saved' | 'error';

export interface ChangeHistoryEntry {
  id: string;
  timestamp: string;
  action: 'create' | 'update' | 'delete' | 'restore';
  entityType: string;
  entityLabel: string;
  details?: string;
}

interface ConfirmRequest {
  title: string;
  message: string;
  itemLabel?: string;
  confirmLabel: string;
  destructive: boolean;
  resolve: (value: boolean) => void;
}

@Injectable({ providedIn: 'root' })
export class EditSafetyService {
  readonly state = signal<SaveState>('idle');
  readonly statusMessage = signal('');
  readonly pendingCount = signal(0);
  readonly history = signal<ChangeHistoryEntry[]>(this.readHistory());
  readonly confirmation = signal<ConfirmRequest | null>(null);
  readonly historyOpen = signal(false);

  private resetTimer?: ReturnType<typeof setTimeout>;
  private readonly autosaveTimers = new Map<string, ReturnType<typeof setTimeout>>();

  async run<T>(
    label: string,
    action: () => Promise<T>,
    history?: Omit<ChangeHistoryEntry, 'id' | 'timestamp'>,
    successMessage = 'Modificările au fost salvate.'

  ): Promise<T> {
    this.pendingCount.update(value => value + 1);
    this.state.set('saving');
    this.statusMessage.set(`Se salvează: ${label}`);
    clearTimeout(this.resetTimer);

    try {
      const result = await action();
      if (history) this.addHistory(history);
      this.pendingCount.update(value => Math.max(0, value - 1));
      if (this.pendingCount() === 0) {
        this.state.set('saved');
        this.statusMessage.set(successMessage);

        this.resetTimer = setTimeout(() => {
          this.state.set('idle');
          this.statusMessage.set('');
        }, 2500);
      }
      return result;
    } catch (error) {
      this.pendingCount.update(value => Math.max(0, value - 1));

      this.state.set('error');
      this.statusMessage.set(this.friendlyError(error));

      clearTimeout(this.resetTimer);

      this.resetTimer = setTimeout(() => {
        this.state.set('idle');
        this.statusMessage.set('');
      }, 5000);

      throw error;
    }
  }

  success(message: string, duration = 2500): void {
    clearTimeout(this.resetTimer);

    this.pendingCount.set(0);
    this.state.set('saved');
    this.statusMessage.set(message);

    this.resetTimer = setTimeout(() => {
      this.state.set('idle');
      this.statusMessage.set('');
    }, duration);
  }

  error(message: string, duration = 5000): void {
    clearTimeout(this.resetTimer);

    this.pendingCount.set(0);
    this.state.set('error');
    this.statusMessage.set(message);

    this.resetTimer = setTimeout(() => {
      this.state.set('idle');
      this.statusMessage.set('');
    }, duration);
  }

  info(message: string, duration = 3000): void {
    clearTimeout(this.resetTimer);

    this.pendingCount.set(0);
    this.state.set('saving');
    this.statusMessage.set(message);

    this.resetTimer = setTimeout(() => {
      this.state.set('idle');
      this.statusMessage.set('');
    }, duration);
  }

  schedule(
    key: string,
    label: string,
    action: () => Promise<unknown>,
    history?: Omit<ChangeHistoryEntry, 'id' | 'timestamp'>,
    delay = 850
  ): void {
    const existing = this.autosaveTimers.get(key);
    this.state.set('saving');
    this.statusMessage.set('Se salvează modificarea…');
    this.autosaveTimers.set(key, setTimeout(() => {
      this.autosaveTimers.delete(key);
      void this.run(label, action, history).catch(() => undefined);
    }, delay));
  }

  confirmDelete(itemLabel: string, message?: string): Promise<boolean> {
    return new Promise(resolve => {
      this.confirmation.set({
        title: 'Confirmă ștergerea',
        message: message ?? 'Această acțiune nu poate fi anulată automat.',
        itemLabel,
        confirmLabel: 'Șterge',
        destructive: true,
        resolve
      });
    });
  }

  confirmAction(title: string, message: string, confirmLabel = 'Continuă'): Promise<boolean> {
    return new Promise(resolve => {
      this.confirmation.set({ title, message, confirmLabel, destructive: false, resolve });
    });
  }

  answerConfirmation(value: boolean): void {
    const request = this.confirmation();
    if (!request) return;
    request.resolve(value);
    this.confirmation.set(null);
  }

  toggleHistory(): void { this.historyOpen.update(value => !value); }
  closeHistory(): void { this.historyOpen.set(false); }
  clearHistory(): void {
    this.history.set([]);
    localStorage.removeItem('wedding-change-history');
  }

  friendlyError(error: unknown): string {
    const code = typeof error === 'object' && error !== null && 'code' in error
      ? String((error as { code?: unknown }).code)
      : '';
    if (code.includes('permission-denied')) return 'Nu ai drepturi pentru această modificare. Autentifică-te din nou.';
    if (code.includes('unavailable')) return 'Nu există conexiune la Firebase. Modificarea nu a fost salvată.';
    if (code.includes('deadline-exceeded')) return 'Conexiunea este lentă. Încearcă din nou peste câteva secunde.';
    if (code.includes('unauthenticated')) return 'Sesiunea a expirat. Autentifică-te din nou.';
    if (error instanceof Error && error.message) return error.message;
    return 'Modificarea nu a putut fi salvată. Verifică internetul și încearcă din nou.';
  }

  private addHistory(entry: Omit<ChangeHistoryEntry, 'id' | 'timestamp'>): void {
    const next: ChangeHistoryEntry = {
      ...entry,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      timestamp: new Date().toISOString()
    };
    const history = [next, ...this.history()].slice(0, 100);
    this.history.set(history);
    localStorage.setItem('wedding-change-history', JSON.stringify(history));
  }

  private readHistory(): ChangeHistoryEntry[] {
    try {
      return JSON.parse(localStorage.getItem('wedding-change-history') ?? '[]') as ChangeHistoryEntry[];
    } catch {
      return [];
    }
  }
}

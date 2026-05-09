import { Injectable } from '@nestjs/common';
import { EventEmitter } from 'events';

@Injectable()
export class EventBus extends EventEmitter {
  emitEvent(name: string, data: any) {
    this.emit(name, data);
    console.log(`[EventBus] ${name}:`, data);
  }
}

@Injectable()
export class ClipboardMonitor {
  private lastClipboard = '';

  constructor(private eventBus: EventBus) {}

  start() {
    setInterval(async () => {
      // Mock clipboard check (real implementation would use clipboardy or native hooks)
      const current = ''; // await clipboard.read()
      if (current !== this.lastClipboard) {
        this.lastClipboard = current;
        this.eventBus.emitEvent('clipboard:change', { content: current });
      }
    }, 1000);
  }
}

@Injectable()
export class SystemWatcher {
  constructor(private eventBus: EventBus) {}

  watchNotifications() {
    // Hook into OS notifications
    this.eventBus.emitEvent('notification:received', { title: 'System', body: 'Update available' });
  }

  watchDownloads() {
    // Watch downloads folder
    this.eventBus.emitEvent('download:complete', { filename: 'report.pdf', path: '/downloads/report.pdf' });
  }
}

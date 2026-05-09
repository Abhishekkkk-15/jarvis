import { EventEmitter } from 'events';

export type VoiceState = 'idle' | 'listening' | 'thinking' | 'speaking';

export class InterruptController {
  private _isInterrupted = false;

  interrupt() {
    this._isInterrupted = true;
  }

  reset() {
    this._isInterrupted = false;
  }

  get isInterrupted() {
    return this._isInterrupted;
  }
}

export class VoiceManager extends EventEmitter {
  private state: VoiceState = 'idle';

  constructor(private interruptController: InterruptController) {
    super();
  }

  setState(newState: VoiceState) {
    this.state = newState;
    this.emit('stateChange', newState);
  }

  getState() {
    return this.state;
  }

  handleInterruption() {
    if (this.state === 'speaking') {
      this.interruptController.interrupt();
      this.setState('idle');
      this.emit('interrupted');
    }
  }
}

export class WakeWordService extends EventEmitter {
  private isListening = false;

  start() {
    this.isListening = true;
    console.log('Listening for wake word "Jarvis"...');
    // Implementation would hook into microphone stream and use a model like Porcupine
  }

  stop() {
    this.isListening = false;
  }

  protected triggerWake() {
    this.emit('wake');
  }
}

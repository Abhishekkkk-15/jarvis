import { Module } from '@nestjs/common';
import { ChatGateway } from './gateways/chat.gateway';
import { AIService } from './services/ai.service';
import { ToolService } from './services/tool.service';
import { DatabaseService } from './database/database.service';
import { DesktopService } from './services/desktop.service';
import { FileService } from './services/file.service';
import { SafetyService } from './services/safety.service';
import { MemoryService } from './services/memory.service';
import { IngestionService } from './services/ingestion.service';
import { TerminalService } from './services/terminal.service';
import { VisionService } from './services/vision.service';
import { ExecutionService } from './services/execution.service';
import { SettingsService } from './services/settings.service';
import { VoiceService } from './services/voice.service';
import { TtsService } from './services/tts.service';
import { SttService } from './services/stt.service';

import { WorkflowController } from './controllers/workflow.controller';
import { HistoryController } from './controllers/history.controller';
import { SettingsController } from './controllers/settings.controller';

@Module({
  imports: [],
  controllers: [WorkflowController, HistoryController, SettingsController],
  providers: [
    ChatGateway, 
    AIService, 
    ToolService, 
    DatabaseService, 
    DesktopService, 
    FileService, 
    SafetyService,
    MemoryService,
    IngestionService,
    TerminalService,
    VisionService,
    ExecutionService,
    SettingsService,
    VoiceService,
    TtsService,
    SttService
  ],
})
export class AppModule {}

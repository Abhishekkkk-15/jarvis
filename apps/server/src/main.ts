import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

async function bootstrap() {
  console.log('Starting Jarvis Server bootstrap...');
  dotenv.config();
  try {
    const app = await NestFactory.create(AppModule);
    app.enableCors();
    await app.listen(3001);
    console.log(`🚀 Jarvis Server is live at: http://localhost:3001`);
    console.log(`📡 WebSocket Gateway enabled`);
  } catch (error) {
    console.error('❌ Failed to start Jarvis Server:', error);
  }
}
bootstrap();

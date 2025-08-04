import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { SampleDataSeeder } from './sample-data.seeder';

async function runSeeder() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  try {
    const seeder = app.get(SampleDataSeeder);
    await seeder.seed();
    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Seeding failed:', error);
  } finally {
    await app.close();
  }
}

runSeeder(); 
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Prefixo GLOBAL
app.setGlobalPrefix('api', {
  exclude: ['/', '/swagger'],
});

  const config = new DocumentBuilder()
    .setTitle('⛈️ API - Projeto GDASH App')
    .setDescription('Documentação da API Weather + Users')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/swagger', app, document);

  // Timezone
  process.env.TZ = '-03:00';

  // CORS
  app.enableCors({
    origin: '*',//["http://localhost:5173"],
    methods: "GET, POST, PUT, DELETE, PATCH, OPTIONS",
    allowedHeaders: "Content-Type, Authorization",
    credentials: true,
  });

  await app.listen(process.env.PORT || 3000);
}

bootstrap();

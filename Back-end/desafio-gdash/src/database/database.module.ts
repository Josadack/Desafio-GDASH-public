// import { Injectable, Module } from '@nestjs/common';
// import { TypeOrmModule, TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';

// @Injectable()
// export class DataBase implements TypeOrmOptionsFactory {

//     createTypeOrmOptions(): TypeOrmModuleOptions {
//         return {
//       type: 'postgres',
//       host: process.env.DB_HOST || 'localhost',
//       port: Number(process.env.DB_PORT) || 5432,
//       username: process.env.DB_USER || 'postgres',
//       password: process.env.DB_PASS || 'adminroot',
//       database: process.env.DB_NAME || 'gdash',
//       autoLoadEntities: true,
//       synchronize: true,   // bom no início, mas desligue em produção
//       logging: true, 
//         };
//     }
// }



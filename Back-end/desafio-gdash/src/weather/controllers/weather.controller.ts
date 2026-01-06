import { Controller, Get, Post, Body, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { Parser } from 'json2csv';
import * as ExcelJS from 'exceljs';
import { WeatherService } from '../services/weather.service';
import { CreateWeatherDto } from '../dto/create-weather.dto';
import { WeatherLogDto } from '../dto/weather-log.dto';

@ApiTags('Weather')
@ApiBearerAuth()
@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  // RECEBE SÓ A CIDADE → envia para RabbitMQ
  @Post()
  async create(@Body() dto: CreateWeatherDto) {
    return this.weatherService.create(dto);
  }

  // RECEBE LOG COMPLETO DO PYTHON → salva no Mongo
  @Post('logs')
  async receiveLog(@Body() dto: WeatherLogDto) {
    return this.weatherService.saveLog(dto);
  }

  @Get()
  async listAll() {
    return this.weatherService.findAll();
  }

@Get('logs')
async getLogs() {
  return this.weatherService.findAll(); // ou outra função que retorne os logs
}


  // Exportar CSV
 @Get('export.xlsx')
async exportXLSX(@Res() res: Response) {
  const data = await this.weatherService.findAll();

  if (!data || data.length === 0) {
    return res.status(404).json({ message: 'Nenhum registro encontrado para exportação.' });
  }

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Weather');

  // Cabeçalhos automáticos
  const columns = Object.keys(data[0]).map(key => ({ header: key, key }));
  sheet.columns = columns;

  // Linhas
  data.forEach(item => {
    const row = {} as Record<string, any>;
    columns.forEach(col => {
      row[col.key] = item[col.key]?.toString() ?? ''; // transforma valores complexos em string
    });
    sheet.addRow(row);
  });

  res.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.attachment('weather.xlsx');
  await workbook.xlsx.write(res);
  res.end();
}



  // Insights simples
  @Get('insights')
  async getInsights() {
    const data = await this.weatherService.findAll();
    const total = data.length;
    const avgTemp = data.reduce((sum, d) => sum + d.temperature, 0) / total || 0;
    const avgHumidity = data.reduce((sum, d) => sum + d.humidity, 0) / total || 0;

    return {
      averageTemperature: parseFloat(avgTemp.toFixed(2)),
      averageHumidity: parseFloat(avgHumidity.toFixed(2)),
      totalRecords: total,
    };
  }
}

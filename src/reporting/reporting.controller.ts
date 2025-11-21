import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  Patch,
  Delete,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ReportingService } from './reporting.service';
import { CreateReportDto } from './dto/create-report.dto';
import type { AuthenticatedRequest } from '../common/interfaces/auth-request.interface';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateReportDto } from './dto/update-report.dto';
@Controller('reporting')
export class ReportingController {
  constructor(private readonly reportingService: ReportingService) {}
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async createReport(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateReportDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.reportingService.createReport(req.user.id, dto, file);
  }
  @Get(':incidentId')
  async getReports(
    @Req() req: AuthenticatedRequest,
    @Param('incidentId', ParseIntPipe) incidentId: number,
  ) {
    return this.reportingService.getReportsByIncident(req.user.id, incidentId);
  }
  @Patch(':reportId')
  @UseInterceptors(FileInterceptor('file'))
  async updateReport(
    @Param('reportId', ParseIntPipe) reportId: number,
    @Body() dto: UpdateReportDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.reportingService.updateReport(reportId, dto, file);
  }

  @Delete(':reportId')
  async deleteReport(@Param('reportId', ParseIntPipe) reportId: number) {
    return this.reportingService.deleteReport(reportId);
  }
}

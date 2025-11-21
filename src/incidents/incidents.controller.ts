import {
  Controller,
  Post,
  Body,
  Req,
  Get,
  Param,
  Patch,
  UploadedFiles,
  UseInterceptors,
  ParseIntPipe,
  Delete,
} from '@nestjs/common';
import { IncidentsService } from './incidents.service';
import { CreateIncidentDto } from './dto/create-incident.dto';
import type { AuthenticatedRequest } from '../common/interfaces/auth-request.interface';
import { UpdateIncidentDto } from './dto/update-incident.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
@Controller('incidents')
export class IncidentsController {
  constructor(private readonly incidentsService: IncidentsService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('documents'))
  async create(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateIncidentDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    const userId = req.user.id;
    return this.incidentsService.createIncident(userId, dto, files);
  }

  @Patch(':id')
  async update(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: number,
    @Body() dto: UpdateIncidentDto,
  ) {
    const userId = req.user.id;
    return this.incidentsService.updateIncident(id, userId, dto);
  }

  @Get()
  async getAll(@Req() req: AuthenticatedRequest) {
    const userId = req.user.id;
    return this.incidentsService.getAllIncidents(userId);
  }
  @Post(':id/documents')
  @UseInterceptors(FilesInterceptor('files'))
  async uploadDocuments(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) incidentId: number,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const userId = req.user.id;
    return this.incidentsService.uploadDocuments(incidentId, userId, files);
  }

  @Delete('documents/:documentId')
  async deleteDocument(
    @Req() req: AuthenticatedRequest,
    @Param('documentId', ParseIntPipe) documentId: number,
  ) {
    const userId = req.user.id;
    return this.incidentsService.deleteDocument(documentId, userId);
  }
}

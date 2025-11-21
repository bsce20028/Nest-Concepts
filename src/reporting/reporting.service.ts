/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ActivitylogService } from 'src/activitylog/activitylog.service';
import { changedactivityHelper } from 'src/activitylog/helper/changedactivity.helper';
import { ActionEnum } from 'src/common/enum/action.enum';
import { SupabaseService } from 'src/supabase/supabase.service';
import { CreateReportDto } from './dto/create-report.dto';

@Injectable()
export class ReportingService {
  private readonly logger = new Logger(ReportingService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly activitylogService: ActivitylogService,
  ) {}
  async createReport(
    userId: string,
    dto: CreateReportDto,
    file?: Express.Multer.File,
  ) {
    const { data: incident, error: incidentError } =
      await this.supabaseService.supabase
        .from('incidents')
        .select('id')
        .eq('id', dto.incident_id)
        .single();

    if (incidentError || !incident) {
      throw new NotFoundException('Invalid incident_id: Incident not found');
    }
    const { data: existingReport } = await this.supabaseService.supabase
      .from('reporting')
      .select('*')
      .eq('incident_id', dto.incident_id)
      .single();

    if (existingReport) {
      throw new BadRequestException('Report already exists');
    }
    let documentPath: string | null = null;
    if (file) {
      const fileName = `reporting-documents/${dto.incident_id}/${Date.now()}-${file.originalname}`;
      const { error: uploadError } = await this.supabaseService.supabase.storage
        .from('incident-documents')
        .upload(fileName, file.buffer, { contentType: file.mimetype });

      if (uploadError) {
        this.logger.error('Failed to upload report file:', uploadError);
        throw new BadRequestException('Failed to upload file');
      }

      const { data: publicUrlData } = this.supabaseService.supabase.storage
        .from('incident-documents')
        .getPublicUrl(fileName);

      documentPath = publicUrlData.publicUrl;
    }
    const { data, error } = await this.supabaseService.supabase
      .from('reporting')
      .insert([
        {
          incident_id: dto.incident_id,
          category: dto.category,
          description: dto.description,
          attributes: dto.attributes,
          document_path: documentPath,
          created_by: userId,
        },
      ])
      .select();

    if (error) throw new BadRequestException('Failed to create report');
    await this.supabaseService.supabase.from('activity_log').insert([
      {
        incident_id: dto.incident_id,
        performed_by: userId,
        action: ActionEnum.REPORT_CREATED,
        old_value: null,
        new_value: { ...dto, document_path: documentPath },
      },
    ]);
    await this.activitylogService.notifyWatchers(dto.incident_id, {
      action: ActionEnum.REPORT_CREATED,
      performed_by: userId,
      description: 'Report created',
    });

    return data[0];
  }

  async getReportsByIncident(userId: string, incidentId: number) {
    const { data: incident, error: incidentError } =
      await this.supabaseService.supabase
        .from('incidents')
        .select('id')
        .eq('id', incidentId)
        .single();
    if (incidentError || !incident) {
      throw new NotFoundException('Invalid incident id: Incident not found');
    }
    const { data, error } = await this.supabaseService.supabase
      .from('reporting')
      .select('*')
      .eq('incident_id', incidentId);

    if (error) throw new BadRequestException('Failed to fetch reports');

    if (!data || data.length === 0) {
      throw new NotFoundException('No reports found for this incident');
    }

    return data;
  }

  async updateReport(
    reportId: number,
    dto: { category?: string; description?: string },
    file?: Express.Multer.File,
  ) {
    const { data: report, error: fetchError } =
      await this.supabaseService.supabase
        .from('reporting')
        .select('*')
        .eq('id', reportId)
        .single();

    if (fetchError || !report) {
      throw new NotFoundException('Report not exist for this report ID');
    }

    let documentPath = report.document_path;
    if (file) {
      if (documentPath) {
        let oldFilePath: string;

        if (documentPath.includes('/reporting-documents/')) {
          const urlParts = documentPath.split('/reporting-documents/');
          const encodedPath = urlParts[urlParts.length - 1];
          oldFilePath = `reporting-documents/${decodeURIComponent(encodedPath)}`;
        } else {
          oldFilePath = documentPath;
        }
        const { error: removeError } =
          await this.supabaseService.supabase.storage
            .from('incident-documents')
            .remove([oldFilePath]);

        if (removeError) {
          console.log('Remove error details:', removeError);
        }
      }
      const safeFileName = file.originalname.replace(/\s+/g, '_');
      const fileName = `reporting-documents/${report.incident_id}/${Date.now()}-${safeFileName}`;

      const { error: uploadError } = await this.supabaseService.supabase.storage
        .from('incident-documents')
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        });

      if (uploadError) {
        this.logger.error('Failed to upload new file:', uploadError);
        throw new BadRequestException('Failed to upload file');
      }

      const { data: publicUrlData } = this.supabaseService.supabase.storage
        .from('incident-documents')
        .getPublicUrl(fileName);

      documentPath = publicUrlData.publicUrl;
    }
    const { data, error } = await this.supabaseService.supabase
      .from('reporting')
      .update({ ...dto, document_path: documentPath })
      .eq('id', reportId)
      .select();

    if (error) throw new BadRequestException('Failed to update report');

    const updatedData = data[0];
    const { oldValue, newValue } = changedactivityHelper(report, updatedData);

    await this.supabaseService.supabase.from('activity_log').insert([
      {
        incident_id: report.incident_id,
        performed_by: report.created_by,
        action: ActionEnum.REPORT_UPDATED,
        old_value: oldValue as any,
        new_value: newValue as any,
      },
    ]);
    await this.activitylogService.notifyWatchers(report.incident_id, {
      action: ActionEnum.REPORT_UPDATED,
      performed_by: report.created_by,
      description: 'Report updated',
    });

    return data[0];
  }
  async deleteReport(reportId: number) {
    const { data: report, error: fetchError } =
      await this.supabaseService.supabase
        .from('reporting')
        .select('*')
        .eq('id', reportId)
        .single();

    if (fetchError || !report) {
      throw new NotFoundException('Report not found');
    }
    if (report.document_path) {
      let oldFilePath: string;

      if (report.document_path.includes('/reporting-documents/')) {
        const urlParts = report.document_path.split('/reporting-documents/');
        const encodedPath = urlParts[urlParts.length - 1];
        oldFilePath = `reporting-documents/${decodeURIComponent(encodedPath)}`;
      } else {
        oldFilePath = report.document_path;
      }

      const { error: removeError } = await this.supabaseService.supabase.storage
        .from('incident-documents')
        .remove([oldFilePath]);

      if (removeError) {
        this.logger.warn('Failed to remove file from storage:', removeError);
      }
    }
    const { error: deleteError } = await this.supabaseService.supabase
      .from('reporting')
      .delete()
      .eq('id', reportId);

    if (deleteError) {
      throw new BadRequestException('Failed to delete report');
    }
    await this.supabaseService.supabase.from('activity_log').insert([
      {
        incident_id: report.incident_id,
        performed_by: report.created_by,
        action: ActionEnum.REPORT_DELETED,
        old_value: report,
        new_value: null,
      },
    ]);
    await this.activitylogService.notifyWatchers(report.incident_id, {
      action: ActionEnum.REPORT_DELETED,
      performed_by: report.created_by,
      description: 'Report deleted',
    });

    return { message: 'Report deleted successfully' };
  }
}

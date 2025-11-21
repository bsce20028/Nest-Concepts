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
import { IncidentDocument } from 'src/common/interfaces/incident-document.interface';
import { SupabaseService } from 'src/supabase/supabase.service';

@Injectable()
export class IncidentsService {
  private readonly logger = new Logger(IncidentsService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly activitylogService: ActivitylogService,
  ) {}

  async createIncident(
    userId: string,
    dto: { title: string; description?: string },
    files?: Express.Multer.File[],
  ) {
    const { data, error } = await this.supabaseService.supabase
      .from('incidents')
      .insert([
        { title: dto.title, description: dto.description, created_by: userId },
      ])
      .select();
    if (error) throw error;

    const incident = data[0];

    await this.supabaseService.supabase.from('activity_log').insert([
      {
        incident_id: incident.id,
        performed_by: userId,
        action: ActionEnum.INCIDENT_CREATED,
        old_value: null,
        new_value: { title: dto.title, description: dto.description },
      },
    ]);
    if (files && files.length > 0) {
      await this.uploadDocuments(incident.id, userId, files);
    }

    return incident;
  }

  async updateIncident(
    id: number,
    userId: string,
    dto: { title?: string; description?: string; status?: string },
  ) {
    const { data: oldData, error: fetchError } =
      await this.supabaseService.supabase
        .from('incidents')
        .select('*')
        .eq('id', id)
        .single();

    if (fetchError) throw fetchError;
    const { data, error } = await this.supabaseService.supabase
      .from('incidents')
      .update(dto)
      .eq('id', id)
      .select();

    if (error) throw error;

    const updatedData = data[0];
    const { oldValue, newValue } = changedactivityHelper(oldData, updatedData);

    await this.supabaseService.supabase.from('activity_log').insert({
      incident_id: id,
      performed_by: userId,
      action: ActionEnum.INCIDENT_UPDATED,
      old_value: oldValue as any,
      new_value: newValue as any,
    });

    await this.activitylogService.notifyWatchers(id, {
      action: ActionEnum.INCIDENT_UPDATED,
      performed_by: userId,
      description: 'Incident updated',
    });

    return {
      ...updatedData,
      updated_by: userId,
    };
  }

  async getAllIncidents(userId?: string) {
    let query = this.supabaseService.supabase.from('incidents').select('*');

    if (userId) {
      query = query.eq('created_by', userId);
    }

    const { data, error } = await query;
    if (error) throw error;

    return data;
  }

  async uploadDocuments(
    incidentId: number,
    userId: string,
    files: Express.Multer.File[],
  ) {
    if (!files || files.length === 0) {
      return [];
    }

    const { data: incident, error: incidentError } =
      await this.supabaseService.supabase
        .from('incidents')
        .select('id')
        .eq('id', incidentId)
        .single();

    if (incidentError || !incident) {
      throw new NotFoundException('Incident not found');
    }

    const uploadedRecords: IncidentDocument[] = [];

    for (const file of files) {
      const fileName = `${Date.now()}-${file.originalname}`;

      const { error: uploadError } = await this.supabaseService.supabase.storage
        .from('incident-documents')
        .upload(fileName, file.buffer, { contentType: file.mimetype });

      if (uploadError) throw new BadRequestException('Failed to upload file');

      const {
        data: { publicUrl },
      } = this.supabaseService.supabase.storage
        .from('incident-documents')
        .getPublicUrl(fileName);

      const { data, error } = await this.supabaseService.supabase
        .from('incident_documents')
        .insert([
          {
            incident_id: incidentId,
            uploaded_by: userId,
            file_path: publicUrl,
          },
        ])
        .select();

      if (error)
        throw new BadRequestException('Failed to save document record');

      uploadedRecords.push(data[0]);

      await this.supabaseService.supabase.from('activity_log').insert([
        {
          incident_id: incidentId,
          performed_by: userId,
          action: ActionEnum.DOCUMENT_UPLOADED,
          old_value: null,
          new_value: { file_path: publicUrl },
        },
      ]);

      await this.activitylogService.notifyWatchers(incidentId, {
        action: ActionEnum.DOCUMENT_UPLOADED,
        performed_by: userId,
        description: 'Incident document uploaded',
      });
    }

    return uploadedRecords;
  }

  async deleteDocument(documentId: number, userId: string) {
    const { data: doc, error: fetchError } = await this.supabaseService.supabase
      .from('incident_documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (fetchError || !doc) {
      throw new NotFoundException('Document not found with this ID');
    }

    const filePath = doc.file_path.split('/incident-documents/')[1];

    const { error: storageError } = await this.supabaseService.supabase.storage
      .from('incident-documents')
      .remove([filePath]);

    if (storageError) throw storageError;

    const { error: deleteError } = await this.supabaseService.supabase
      .from('incident_documents')
      .delete()
      .eq('id', documentId);

    if (deleteError) throw deleteError;

    await this.supabaseService.supabase.from('activity_log').insert([
      {
        incident_id: doc.incident_id,
        performed_by: userId,
        action: ActionEnum.DOCUMENT_DELETED,
        old_value: { file_path: doc.file_path },
        new_value: null,
      },
    ]);
    await this.activitylogService.notifyWatchers(doc.incident_id, {
      action: ActionEnum.DOCUMENT_DELETED,
      performed_by: userId,
      description: 'Incident document deleted',
    });

    return { message: 'Document deleted successfully' };
  }
}

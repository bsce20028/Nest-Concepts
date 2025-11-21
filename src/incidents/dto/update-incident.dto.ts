export class UpdateIncidentDto {
  title?: string;
  description?: string;
  status?: 'open' | 'pending' | 'closed';
}

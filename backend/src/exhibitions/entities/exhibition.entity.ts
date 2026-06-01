// backend/src/exhibitions/entities/exhibition.entity.ts
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

@Entity('exhibitions')
export class Exhibition extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'exhibition_id', unsigned: true })
  id: number;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ length: 255 })
  location: string;

  @Column({ name: 'image_url', length: 500, nullable: true })
  imageUrl: string | null;

  @Column({ name: 'external_url', length: 500, nullable: true })
  externalUrl: string | null;

  @Column({ name: 'event_start_date', type: 'date' })
  eventStartDate: string; // YYYY-MM-DD

  @Column({ name: 'event_end_date', type: 'date' })
  eventEndDate: string;

  @Column({ name: 'display_from', type: 'date' })
  displayFrom: string;

  @Column({ name: 'display_until', type: 'date' })
  displayUntil: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;
}

// backend/src/exhibitions/entities/exhibition.entity.ts
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

@Entity('exhibitions')
export class Exhibition extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'exhibition_id', unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 255, default: '' })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 255, default: '' })
  location: string;

  @Column({ name: 'image_url', type: 'varchar', length: 500, nullable: true })
  imageUrl: string | null;

  @Column({ name: 'external_url', type: 'varchar', length: 500, nullable: true })
  externalUrl: string | null;

  @Column({ name: 'event_start_date', type: 'date', nullable: true })
  eventStartDate: string | null; // YYYY-MM-DD

  @Column({ name: 'event_end_date', type: 'date', nullable: true })
  eventEndDate: string | null;

  @Column({ name: 'display_from', type: 'date', nullable: true })
  displayFrom: string | null;

  @Column({ name: 'display_until', type: 'date', nullable: true })
  displayUntil: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;
}

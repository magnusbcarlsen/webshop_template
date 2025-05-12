import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum AddressType {
  BILLING = 'billing',
  SHIPPING = 'shipping',
}

@Entity('user_addresses')
export class UserAddress extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'address_id', unsigned: true })
  addressId: number;

  @ManyToOne(() => User, (user) => user.addresses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'address_type', type: 'enum', enum: AddressType })
  addressType: AddressType;

  @Column({ name: 'is_default', default: false })
  isDefault: boolean;

  @Column({ name: 'street_address', length: 255 })
  streetAddress: string;

  @Column({ length: 100 })
  city: string;

  @Column({ length: 100, nullable: true })
  state?: string;

  @Column({ name: 'postal_code', length: 20 })
  postalCode: string;

  @Column({ length: 100 })
  country: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

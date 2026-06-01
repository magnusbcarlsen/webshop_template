# Exhibition Announcements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add admin-managed exhibition announcements to the webshop, visible on the public frontpage between the hero and the products grid.

**Architecture:** New NestJS module `exhibitions` (entity + DTO + service + controller + module) following the existing `products` pattern. New `exhibitions` table in `database/init.sql`. New Next.js public component `ExhibitionsSection` rendered server-side on the frontpage, plus an admin component `AdminExhibitions` reachable from a new "Exhibitions" sidebar item in the admin dashboard. Optional image uploads reuse the existing S3 / MinIO setup (the `'S3'` client provider from `S3Module`).

**Tech Stack:** NestJS 10 + TypeORM (MySQL 8), Next.js 15 App Router, HeroUI + Tailwind, MinIO via `@aws-sdk/client-s3`, `class-validator` DTOs, JWT auth via `JwtAuthGuard` + `RolesGuard`.

**Spec:** [`docs/superpowers/specs/2026-06-01-exhibition-announcements-design.md`](../specs/2026-06-01-exhibition-announcements-design.md)

**Engineer notes before starting:**
- `synchronize: false` in TypeORM — schema lives in `database/init.sql`, which DROPs and CREATEs all tables on container init. To pick up the new table during dev, run `npm run down && npm run up` (the root `down` script already passes `-v` to drop the volume). For a real DB that must keep its data, run the standalone `CREATE TABLE exhibitions ...` statement (provided in Task 1) manually.
- The Product entity uses `@PrimaryGeneratedColumn({ name: 'product_id' })` so the SQL column is `product_id` while the TS property is `id`. Follow the same convention: SQL `exhibition_id`, TS `id`.
- All admin endpoints use the chain `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles('ADMIN')`. Public endpoints have no guards.
- The frontend `fetch` calls go through `API_ROOT` from `frontend/src/config/api.ts`, which resolves to `http://backend:3001/api` server-side and `/api` client-side.
- Frontend admin pages use HeroUI `Modal` + manually-rolled form controls (see `AdminProducts.tsx`).

---

## File Structure

**New backend files:**
- `backend/src/exhibitions/entities/exhibition.entity.ts` — TypeORM entity, one row per announcement.
- `backend/src/exhibitions/dto/create-exhibition.dto.ts` — input validation for create.
- `backend/src/exhibitions/dto/update-exhibition.dto.ts` — `PartialType(CreateExhibitionDto)`.
- `backend/src/exhibitions/exhibitions.service.ts` — business logic: CRUD, image upload/delete, active-list query.
- `backend/src/exhibitions/exhibitions.controller.ts` — REST endpoints (public + admin).
- `backend/src/exhibitions/exhibitions.module.ts` — Nest module.
- `backend/src/exhibitions/exhibitions.service.spec.ts` — focused unit test for the `findActive` visibility rule.

**Modified backend files:**
- `backend/src/app.module.ts` — register `ExhibitionsModule`.
- `database/init.sql` — add DROP + CREATE for the `exhibitions` table.

**New frontend files:**
- `frontend/src/services/exhibition-api.ts` — typed API client.
- `frontend/src/components/ExhibitionsSection.tsx` — public server component.
- `frontend/src/components/adminComponents/AdminExhibitions.tsx` — admin CRUD UI.

**Modified frontend files:**
- `frontend/src/app/page.tsx` — insert `<ExhibitionsSection />` between `<HeroSection />` and the products `<section>`.
- `frontend/src/app/admin/page.tsx` — add "Exhibitions" sidebar item and view state.

---

## Task 1: Add `exhibitions` table to `database/init.sql`

**Files:**
- Modify: `database/init.sql:5-26` (add DROP) and after the `categories` table block around line 80 (add CREATE).

- [ ] **Step 1: Add the DROP statement**

Open `database/init.sql`. In the DROP block at the top (currently lines 5–26), add this line right after `DROP TABLE IF EXISTS user_addresses;` (and before `DROP TABLE IF EXISTS users;`) so it runs before any FK-bearing table — though `exhibitions` has no FKs, adding it here keeps the file consistent:

```sql
DROP TABLE IF EXISTS exhibitions;
```

- [ ] **Step 2: Add the CREATE TABLE statement**

Insert this block immediately after the `categories` table CREATE (search for `CREATE TABLE categories` and find the closing `);` then add the block on a new line):

```sql
-- Exhibitions / upcoming-show announcements
CREATE TABLE exhibitions (
    exhibition_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(255) NOT NULL,
    image_url VARCHAR(500) NULL,
    external_url VARCHAR(500) NULL,
    event_start_date DATE NOT NULL,
    event_end_date DATE NOT NULL,
    display_from DATE NOT NULL,
    display_until DATE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_exhibitions_visibility (is_active, display_from, display_until)
);
```

- [ ] **Step 3: Verify the file parses**

Run: `node -e "require('fs').readFileSync('database/init.sql','utf8')"`
Expected: completes with no output (no syntax error in file IO; SQL validity is checked when MySQL boots in Task 7).

- [ ] **Step 4: Commit**

```bash
git add database/init.sql
git commit -m "feat(db): add exhibitions table for upcoming-show announcements"
```

---

## Task 2: Create the `Exhibition` TypeORM entity

**Files:**
- Create: `backend/src/exhibitions/entities/exhibition.entity.ts`

- [ ] **Step 1: Write the entity file**

```typescript
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
```

Note: MySQL's `DATE` columns are returned as `YYYY-MM-DD` strings by the `mysql2` driver, so we type them as `string` (not `Date`) — matches how the rest of the codebase treats date-only columns.

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd backend && npx tsc --noEmit -p tsconfig.json`
Expected: no errors related to the new file. (Other unrelated errors may exist in the codebase — ignore those, but confirm no errors mention `exhibition.entity.ts`.)

- [ ] **Step 3: Commit**

```bash
git add backend/src/exhibitions/entities/exhibition.entity.ts
git commit -m "feat(backend): add Exhibition entity"
```

---

## Task 3: Create the DTOs

**Files:**
- Create: `backend/src/exhibitions/dto/create-exhibition.dto.ts`
- Create: `backend/src/exhibitions/dto/update-exhibition.dto.ts`

- [ ] **Step 1: Write `create-exhibition.dto.ts`**

```typescript
// backend/src/exhibitions/dto/create-exhibition.dto.ts
import {
  IsBoolean,
  IsDateString,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateExhibitionDto {
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  title: string;

  @IsString()
  @MinLength(1)
  description: string;

  @IsString()
  @MinLength(1)
  @MaxLength(255)
  location: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  imageUrl?: string | null;

  @IsOptional()
  @IsUrl({ require_protocol: true })
  @MaxLength(500)
  externalUrl?: string | null;

  @IsDateString({ strict: true })
  eventStartDate: string;

  @IsDateString({ strict: true })
  eventEndDate: string;

  @IsDateString({ strict: true })
  displayFrom: string;

  @IsDateString({ strict: true })
  displayUntil: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
```

Note on date ordering (`eventEndDate >= eventStartDate`, `displayUntil >= displayFrom`): we'll enforce this in the service (Task 4) because `class-validator` doesn't have a cross-field comparator and it's the only piece of validation that needs awareness of another field.

- [ ] **Step 2: Write `update-exhibition.dto.ts`**

```typescript
// backend/src/exhibitions/dto/update-exhibition.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateExhibitionDto } from './create-exhibition.dto';

export class UpdateExhibitionDto extends PartialType(CreateExhibitionDto) {}
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `cd backend && npx tsc --noEmit -p tsconfig.json`
Expected: no errors mentioning the two new DTO files.

- [ ] **Step 4: Commit**

```bash
git add backend/src/exhibitions/dto/
git commit -m "feat(backend): add exhibition DTOs"
```

---

## Task 4: Implement the `ExhibitionsService` (TDD)

**Files:**
- Create: `backend/src/exhibitions/exhibitions.service.spec.ts`
- Create: `backend/src/exhibitions/exhibitions.service.ts`

We'll TDD the `findActive` query rule because it's the only nontrivial logic (everything else is CRUD plumbing).

- [ ] **Step 1: Write the failing test**

```typescript
// backend/src/exhibitions/exhibitions.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { ExhibitionsService } from './exhibitions.service';
import { Exhibition } from './entities/exhibition.entity';

describe('ExhibitionsService', () => {
  let service: ExhibitionsService;
  let repo: jest.Mocked<Repository<Exhibition>>;

  beforeEach(async () => {
    const repoMock = {
      find: jest.fn(),
    } as unknown as jest.Mocked<Repository<Exhibition>>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExhibitionsService,
        { provide: getRepositoryToken(Exhibition), useValue: repoMock },
        { provide: 'S3', useValue: { send: jest.fn() } },
        { provide: ConfigService, useValue: { get: jest.fn() } },
      ],
    }).compile();

    service = module.get<ExhibitionsService>(ExhibitionsService);
    repo = module.get(getRepositoryToken(Exhibition));
  });

  describe('findActive', () => {
    it('queries with is_active=true, today between display_from and display_until, ordered by eventStartDate ASC', async () => {
      repo.find.mockResolvedValue([]);

      await service.findActive(new Date('2026-06-15T12:00:00Z'));

      expect(repo.find).toHaveBeenCalledTimes(1);
      const args = repo.find.mock.calls[0][0]!;
      expect(args.where).toMatchObject({ isActive: true });
      // The where clause uses LessThanOrEqual / MoreThanOrEqual operators
      // — we just verify the structure references the right fields.
      expect(args.where).toHaveProperty('displayFrom');
      expect(args.where).toHaveProperty('displayUntil');
      expect(args.order).toEqual({ eventStartDate: 'ASC' });
    });

    it('returns the rows the repository returns', async () => {
      const rows = [
        { id: 1, title: 'Summer show' } as unknown as Exhibition,
      ];
      repo.find.mockResolvedValue(rows);

      const result = await service.findActive(new Date('2026-06-15'));

      expect(result).toBe(rows);
    });
  });
});
```

- [ ] **Step 2: Run the test and confirm it fails**

Run: `cd backend && npx jest src/exhibitions/exhibitions.service.spec.ts`
Expected: FAIL — `Cannot find module './exhibitions.service'`.

- [ ] **Step 3: Write the service**

```typescript
// backend/src/exhibitions/exhibitions.service.ts
import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import { Express } from 'express';
import 'multer';
import { Exhibition } from './entities/exhibition.entity';
import { CreateExhibitionDto } from './dto/create-exhibition.dto';
import { UpdateExhibitionDto } from './dto/update-exhibition.dto';

@Injectable()
export class ExhibitionsService {
  private readonly allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
  ];
  private readonly maxFileSize = 5 * 1024 * 1024;

  constructor(
    @InjectRepository(Exhibition)
    private readonly repo: Repository<Exhibition>,
    @Inject('S3') private readonly s3: S3Client,
    private readonly config: ConfigService,
  ) {}

  async findActive(now: Date = new Date()): Promise<Exhibition[]> {
    const today = now.toISOString().slice(0, 10); // YYYY-MM-DD
    return this.repo.find({
      where: {
        isActive: true,
        displayFrom: LessThanOrEqual(today),
        displayUntil: MoreThanOrEqual(today),
      },
      order: { eventStartDate: 'ASC' },
    });
  }

  findAll(): Promise<Exhibition[]> {
    return this.repo.find({ order: { eventStartDate: 'DESC' } });
  }

  async findOne(id: number): Promise<Exhibition> {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException(`Exhibition ${id} not found`);
    return row;
  }

  async create(dto: CreateExhibitionDto): Promise<Exhibition> {
    this.assertDateOrder(dto);
    const entity = this.repo.create({
      ...dto,
      isActive: dto.isActive ?? true,
    });
    return this.repo.save(entity);
  }

  async update(id: number, dto: UpdateExhibitionDto): Promise<Exhibition> {
    const existing = await this.findOne(id);
    const merged = { ...existing, ...dto };
    this.assertDateOrder(merged);
    Object.assign(existing, dto);
    return this.repo.save(existing);
  }

  async remove(id: number): Promise<{ success: true }> {
    const existing = await this.findOne(id);
    if (existing.imageUrl) {
      await this.deleteImage(existing.imageUrl);
    }
    await this.repo.remove(existing);
    return { success: true };
  }

  async uploadImage(file: Express.Multer.File): Promise<string> {
    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Only JPEG, PNG, and WebP are allowed.',
      );
    }
    if (file.size > this.maxFileSize) {
      throw new BadRequestException('File too large. Maximum size is 5MB.');
    }

    const bucket = this.config.get<string>('do_spaces_bucket')!;
    const ext = path.extname(file.originalname);
    const key = `${uuidv4()}${ext}`;

    try {
      await this.s3.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
          CacheControl: 'max-age=31536000',
        }),
      );
    } catch (err) {
      console.error('S3 Upload Error:', err);
      throw new InternalServerErrorException('Failed to upload image');
    }

    const publicUrl =
      this.config.get<string>('R2_PUBLIC_URL') || 'http://localhost:9000';
    return `${publicUrl.replace(/\/$/, '')}/${key}`;
  }

  async deleteImage(imageUrl: string): Promise<void> {
    try {
      const bucket = this.config.get<string>('do_spaces_bucket')!;
      const url = new URL(imageUrl);
      const parts = url.pathname.split('/').filter(Boolean);
      const key = parts[parts.length - 1];
      await this.s3.send(
        new DeleteObjectCommand({ Bucket: bucket, Key: key }),
      );
    } catch (err) {
      console.error('S3 Delete Error:', err);
      // Non-fatal — keep going.
    }
  }

  private assertDateOrder(dto: {
    eventStartDate?: string;
    eventEndDate?: string;
    displayFrom?: string;
    displayUntil?: string;
  }): void {
    if (
      dto.eventStartDate &&
      dto.eventEndDate &&
      dto.eventEndDate < dto.eventStartDate
    ) {
      throw new BadRequestException(
        'eventEndDate must be on or after eventStartDate',
      );
    }
    if (
      dto.displayFrom &&
      dto.displayUntil &&
      dto.displayUntil < dto.displayFrom
    ) {
      throw new BadRequestException(
        'displayUntil must be on or after displayFrom',
      );
    }
  }
}
```

- [ ] **Step 4: Run the test and confirm it passes**

Run: `cd backend && npx jest src/exhibitions/exhibitions.service.spec.ts`
Expected: PASS — both `findActive` cases green.

- [ ] **Step 5: Commit**

```bash
git add backend/src/exhibitions/exhibitions.service.ts backend/src/exhibitions/exhibitions.service.spec.ts
git commit -m "feat(backend): add ExhibitionsService with findActive query"
```

---

## Task 5: Implement the `ExhibitionsController`

**Files:**
- Create: `backend/src/exhibitions/exhibitions.controller.ts`

- [ ] **Step 1: Write the controller**

```typescript
// backend/src/exhibitions/exhibitions.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseFilePipeBuilder,
  ParseIntPipe,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import 'multer';
import type { Express } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ExhibitionsService } from './exhibitions.service';
import { CreateExhibitionDto } from './dto/create-exhibition.dto';
import { UpdateExhibitionDto } from './dto/update-exhibition.dto';

@Controller('exhibitions')
export class ExhibitionsController {
  constructor(private readonly service: ExhibitionsService) {}

  // Public — used by the frontpage.
  @Get('active')
  findActive() {
    return this.service.findActive();
  }

  // Admin list — all rows including inactive/past.
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Body() dto: CreateExhibitionDto,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/ })
        .addMaxSizeValidator({ maxSize: 5 * 1024 * 1024 })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
          fileIsRequired: false,
        }),
    )
    file?: Express.Multer.File,
  ) {
    this.coerceMultipart(dto);
    if (file) {
      dto.imageUrl = await this.service.uploadImage(file);
    }
    return this.service.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateExhibitionDto & { removeImage?: boolean | string },
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/ })
        .addMaxSizeValidator({ maxSize: 5 * 1024 * 1024 })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
          fileIsRequired: false,
        }),
    )
    file?: Express.Multer.File,
  ) {
    this.coerceMultipart(dto);

    const removeImage =
      dto.removeImage === true || dto.removeImage === 'true';
    delete dto.removeImage;

    if (file) {
      // Delete previous image first to avoid orphans.
      const current = await this.service.findOne(id);
      if (current.imageUrl) {
        await this.service.deleteImage(current.imageUrl);
      }
      dto.imageUrl = await this.service.uploadImage(file);
    } else if (removeImage) {
      const current = await this.service.findOne(id);
      if (current.imageUrl) {
        await this.service.deleteImage(current.imageUrl);
      }
      dto.imageUrl = null;
    }

    return this.service.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }

  /**
   * Multipart form data arrives as strings. Convert booleans before
   * class-validator runs against the merged DTO.
   */
  private coerceMultipart(
    dto: Partial<CreateExhibitionDto> & { isActive?: boolean | string },
  ): void {
    if (typeof dto.isActive === 'string') {
      dto.isActive = dto.isActive === 'true';
    }
  }
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd backend && npx tsc --noEmit -p tsconfig.json`
Expected: no errors mentioning the controller file.

- [ ] **Step 3: Commit**

```bash
git add backend/src/exhibitions/exhibitions.controller.ts
git commit -m "feat(backend): add ExhibitionsController with admin CRUD + public active endpoint"
```

---

## Task 6: Wire up the module and register it in the app

**Files:**
- Create: `backend/src/exhibitions/exhibitions.module.ts`
- Modify: `backend/src/app.module.ts:1-53`

- [ ] **Step 1: Write the module**

```typescript
// backend/src/exhibitions/exhibitions.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { Exhibition } from './entities/exhibition.entity';
import { ExhibitionsService } from './exhibitions.service';
import { ExhibitionsController } from './exhibitions.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Exhibition]),
    MulterModule.register({
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024, files: 1 },
    }),
  ],
  controllers: [ExhibitionsController],
  providers: [ExhibitionsService],
  exports: [ExhibitionsService],
})
export class ExhibitionsModule {}
```

- [ ] **Step 2: Register the module in `app.module.ts`**

Open `backend/src/app.module.ts`. Add the import near the others (alphabetical placement, after `CheckoutModule`):

```typescript
import { ExhibitionsModule } from './exhibitions/exhibitions.module';
```

In the `imports: [...]` array, add `ExhibitionsModule` on a new line after `CheckoutModule,`. The resulting block:

```typescript
StripeModule,
ProductsModule,
UsersModule,
AuthModule,
OrdersModule,
CategoriesModule,
CartsModule,
S3Module,
StorageModule,
CheckoutModule,
ExhibitionsModule,
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `cd backend && npx tsc --noEmit -p tsconfig.json`
Expected: no errors mentioning `exhibitions.module.ts` or `app.module.ts`.

- [ ] **Step 4: Commit**

```bash
git add backend/src/exhibitions/exhibitions.module.ts backend/src/app.module.ts
git commit -m "feat(backend): register ExhibitionsModule in app"
```

---

## Task 7: Bring up the stack and smoke-test the backend

**Files:** (none modified — runtime verification only)

- [ ] **Step 1: Rebuild and start the stack with a fresh DB volume**

Run: `npm run down && npm run build && npm run up`
Expected: containers come up. The `down -v` drops the MySQL volume, so the new `init.sql` runs from scratch and the `exhibitions` table is created.

- [ ] **Step 2: Confirm the table exists**

Run: `docker compose exec mysql mysql -u root -p"$DB_PASSWORD" -e "DESCRIBE webshop.exhibitions;"`
(If `$DB_PASSWORD` isn't in your shell, substitute the value from `.env`.)
Expected: a column list including `exhibition_id`, `title`, `display_from`, `display_until`, `is_active`.

- [ ] **Step 3: Confirm the public endpoint returns an empty array**

Run: `curl -sS http://localhost:3001/api/exhibitions/active`
Expected: `[]`

- [ ] **Step 4: Confirm the admin endpoint rejects unauthenticated requests**

Run: `curl -sS -o /dev/null -w "%{http_code}\n" http://localhost:3001/api/exhibitions`
Expected: `401`

- [ ] **Step 5: Get an admin JWT and create a row**

Log in via the existing auth flow to obtain a JWT cookie. Then:

```bash
curl -sS -X POST http://localhost:3001/api/exhibitions \
  -b cookies.txt \
  -F 'title=Sommerudstilling 2026' \
  -F 'description=Bergstrøm Art viser nye værker' \
  -F 'location=Galleri Nord, København' \
  -F 'eventStartDate=2026-06-15' \
  -F 'eventEndDate=2026-06-30' \
  -F 'displayFrom=2026-05-15' \
  -F 'displayUntil=2026-06-30'
```

Expected: 201 with a JSON body containing `"id": 1` (or similar) and the fields you sent.

- [ ] **Step 6: Confirm the public endpoint now returns the row**

(Today's date is 2026-06-01, which is between `displayFrom` and `displayUntil` — the row should appear.)

Run: `curl -sS http://localhost:3001/api/exhibitions/active | jq`
Expected: array of length 1 with the row you just created.

- [ ] **Step 7: No commit** — runtime check only.

---

## Task 8: Write the frontend API client

**Files:**
- Create: `frontend/src/services/exhibition-api.ts`

- [ ] **Step 1: Write the file**

```typescript
// frontend/src/services/exhibition-api.ts
import { API_ROOT } from "@/config/api";

export type ExhibitionAPI = {
  id: number;
  title: string;
  description: string;
  location: string;
  imageUrl: string | null;
  externalUrl: string | null;
  eventStartDate: string; // YYYY-MM-DD
  eventEndDate: string;
  displayFrom: string;
  displayUntil: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

async function handleResponse<T = unknown>(res: Response): Promise<T> {
  if (res.status === 401 || res.status === 403) {
    throw new Error("Unauthorized");
  }
  if (!res.ok) {
    const errPayload = await res.json().catch(() => null);
    const msg = errPayload?.message || `Request failed: ${res.status}`;
    throw new Error(msg);
  }
  return res.json();
}

// Public — used by the frontpage.
export async function fetchActiveExhibitions(): Promise<ExhibitionAPI[]> {
  const res = await fetch(`${API_ROOT}/exhibitions/active`, {
    cache: "no-store",
  });
  return handleResponse(res);
}

// Admin
export async function fetchAllExhibitions(): Promise<ExhibitionAPI[]> {
  const res = await fetch(`${API_ROOT}/exhibitions`, {
    cache: "no-store",
    credentials: "include",
  });
  return handleResponse(res);
}

export async function fetchExhibition(id: number): Promise<ExhibitionAPI> {
  const res = await fetch(`${API_ROOT}/exhibitions/${id}`, {
    cache: "no-store",
    credentials: "include",
  });
  return handleResponse(res);
}

export async function createExhibition(
  payload: FormData,
): Promise<ExhibitionAPI> {
  const res = await fetch(`${API_ROOT}/exhibitions`, {
    method: "POST",
    credentials: "include",
    body: payload,
  });
  return handleResponse(res);
}

export async function updateExhibition(
  id: number,
  payload: FormData,
): Promise<ExhibitionAPI> {
  const res = await fetch(`${API_ROOT}/exhibitions/${id}`, {
    method: "PATCH",
    credentials: "include",
    body: payload,
  });
  return handleResponse(res);
}

export async function deleteExhibition(id: number): Promise<void> {
  const res = await fetch(`${API_ROOT}/exhibitions/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  await handleResponse(res);
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd frontend && npx tsc --noEmit`
Expected: no errors mentioning `exhibition-api.ts`.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/services/exhibition-api.ts
git commit -m "feat(frontend): add exhibition API service"
```

---

## Task 9: Build the public `ExhibitionsSection` component

**Files:**
- Create: `frontend/src/components/ExhibitionsSection.tsx`

- [ ] **Step 1: Write the component**

```tsx
// frontend/src/components/ExhibitionsSection.tsx
import Image from "next/image";
import {
  fetchActiveExhibitions,
  ExhibitionAPI,
} from "@/services/exhibition-api";

function formatDateRange(start: string, end: string): string {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const sameMonth =
    startDate.getUTCFullYear() === endDate.getUTCFullYear() &&
    startDate.getUTCMonth() === endDate.getUTCMonth();

  const fullFormatter = new Intl.DateTimeFormat("da-DK", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  if (sameMonth) {
    const dayFormatter = new Intl.DateTimeFormat("da-DK", {
      day: "numeric",
      timeZone: "UTC",
    });
    // e.g. "15.–30. juni 2026"
    return `${dayFormatter.format(startDate)}.–${fullFormatter.format(endDate)}`;
  }
  return `${fullFormatter.format(startDate)} – ${fullFormatter.format(endDate)}`;
}

async function loadExhibitions(): Promise<ExhibitionAPI[]> {
  try {
    return await fetchActiveExhibitions();
  } catch (err) {
    console.error("Error fetching exhibitions:", err);
    return [];
  }
}

export default async function ExhibitionsSection() {
  const exhibitions = await loadExhibitions();
  if (exhibitions.length === 0) return null;

  return (
    <section className="px-4 py-12 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold text-center mb-8">
        Kommende udstillinger
      </h2>
      <div className="space-y-6">
        {exhibitions.map((ex) => (
          <article
            key={ex.id}
            className="flex flex-col md:flex-row gap-6 border border-gray-200 rounded-lg p-6 bg-white shadow-sm"
          >
            {ex.imageUrl && (
              <div className="relative w-full md:w-64 h-48 flex-shrink-0 rounded overflow-hidden bg-gray-100">
                <Image
                  src={ex.imageUrl}
                  alt={ex.title}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            )}
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-1">{ex.title}</h3>
              <p className="text-sm text-gray-500 mb-1">
                {formatDateRange(ex.eventStartDate, ex.eventEndDate)}
              </p>
              <p className="text-sm font-medium text-gray-700 mb-3">
                {ex.location}
              </p>
              <p className="text-gray-700 mb-4 whitespace-pre-line">
                {ex.description}
              </p>
              {ex.externalUrl && (
                <a
                  href={ex.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-blue-600 hover:underline font-medium"
                >
                  Læs mere →
                </a>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd frontend && npx tsc --noEmit`
Expected: no errors mentioning `ExhibitionsSection.tsx`.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/ExhibitionsSection.tsx
git commit -m "feat(frontend): add public ExhibitionsSection component"
```

---

## Task 10: Render the section on the frontpage

**Files:**
- Modify: `frontend/src/app/page.tsx:1-59`

- [ ] **Step 1: Edit the page**

Open `frontend/src/app/page.tsx`. Replace the existing import block (after the `HeroSection` import) and the JSX block as follows.

Find:

```tsx
import ProductList from "@/components/products/ProductList";
import HeroSection from "@/components/HeroSection";
```

Add directly below:

```tsx
import ExhibitionsSection from "@/components/ExhibitionsSection";
```

Find the JSX:

```tsx
      <HeroSection />

      <div>
        <section className="text-center p-8">
```

Replace with:

```tsx
      <HeroSection />

      <ExhibitionsSection />

      <div>
        <section className="text-center p-8">
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd frontend && npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/app/page.tsx
git commit -m "feat(frontend): render ExhibitionsSection on frontpage"
```

---

## Task 11: Build the `AdminExhibitions` component

**Files:**
- Create: `frontend/src/components/adminComponents/AdminExhibitions.tsx`

- [ ] **Step 1: Write the component**

```tsx
// frontend/src/components/adminComponents/AdminExhibitions.tsx
"use client";

import React, { useEffect, useState, ChangeEvent, FormEvent } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from "@heroui/react";
import {
  fetchAllExhibitions,
  fetchExhibition,
  createExhibition,
  updateExhibition,
  deleteExhibition,
  ExhibitionAPI,
} from "@/services/exhibition-api";

interface ExhibitionForm {
  title: string;
  description: string;
  location: string;
  externalUrl: string;
  eventStartDate: string;
  eventEndDate: string;
  displayFrom: string;
  displayUntil: string;
  isActive: boolean;
  removeImage: boolean;
}

const blankForm: ExhibitionForm = {
  title: "",
  description: "",
  location: "",
  externalUrl: "",
  eventStartDate: "",
  eventEndDate: "",
  displayFrom: "",
  displayUntil: "",
  isActive: true,
  removeImage: false,
};

function formatDate(d: string): string {
  return new Intl.DateTimeFormat("da-DK", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(d));
}

export default function AdminExhibitions() {
  const [items, setItems] = useState<ExhibitionAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ExhibitionForm>(blankForm);
  const [file, setFile] = useState<File | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const rows = await fetchAllExhibitions();
      setItems(rows);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditingId(null);
    setForm(blankForm);
    setFile(null);
    setExistingImageUrl(null);
    setError(null);
    onOpen();
  }

  async function openEdit(id: number) {
    setEditingId(id);
    setError(null);
    setFile(null);
    try {
      const row = await fetchExhibition(id);
      setForm({
        title: row.title,
        description: row.description,
        location: row.location,
        externalUrl: row.externalUrl ?? "",
        eventStartDate: row.eventStartDate,
        eventEndDate: row.eventEndDate,
        displayFrom: row.displayFrom,
        displayUntil: row.displayUntil,
        isActive: row.isActive,
        removeImage: false,
      });
      setExistingImageUrl(row.imageUrl);
      onOpen();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load row");
    }
  }

  function handleChange(
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setForm((f) => ({ ...f, [name]: checked }));
      return;
    }
    setForm((f) => ({ ...f, [name]: value }));
  }

  function buildPayload(): FormData {
    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("description", form.description);
    fd.append("location", form.location);
    if (form.externalUrl.trim()) fd.append("externalUrl", form.externalUrl);
    fd.append("eventStartDate", form.eventStartDate);
    fd.append("eventEndDate", form.eventEndDate);
    fd.append("displayFrom", form.displayFrom);
    fd.append("displayUntil", form.displayUntil);
    fd.append("isActive", String(form.isActive));
    if (file) fd.append("image", file);
    if (editingId !== null && form.removeImage && !file) {
      fd.append("removeImage", "true");
    }
    return fd;
  }

  async function handleSubmit(e: FormEvent | { preventDefault?: () => void }) {
    if (e.preventDefault) e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      if (editingId !== null) {
        await updateExhibition(editingId, buildPayload());
      } else {
        await createExhibition(buildPayload());
      }
      onOpenChange();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this exhibition? This cannot be undone.")) return;
    try {
      await deleteExhibition(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  }

  async function handleToggleActive(row: ExhibitionAPI) {
    const fd = new FormData();
    fd.append("isActive", String(!row.isActive));
    try {
      await updateExhibition(row.id, fd);
      setItems((prev) =>
        prev.map((r) =>
          r.id === row.id ? { ...r, isActive: !row.isActive } : r,
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Toggle failed");
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Exhibitions</h1>
          <p className="text-gray-600">Manage upcoming-exhibition announcements</p>
        </div>
        <Button
          onPress={openCreate}
          color="primary"
          size="lg"
          className="bg-black text-white font-semibold px-6"
        >
          New exhibition
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {items.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-600">No exhibitions yet. Create one to start.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {["Title", "Event", "Display window", "Active", "Actions"].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {items.map((row) => (
                <tr key={row.id}>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {row.title}
                    <div className="text-sm text-gray-500">{row.location}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {formatDate(row.eventStartDate)} – {formatDate(row.eventEndDate)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {formatDate(row.displayFrom)} – {formatDate(row.displayUntil)}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleActive(row)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-full ${
                        row.isActive
                          ? "bg-green-100 text-green-800 hover:bg-green-200"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {row.isActive ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="flat"
                        color="primary"
                        onPress={() => openEdit(row.id)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="flat"
                        color="danger"
                        onPress={() => handleDelete(row.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        size="3xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                <h2 className="text-xl font-bold">
                  {editingId !== null ? "Edit exhibition" : "New exhibition"}
                </h2>
              </ModalHeader>
              <ModalBody className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700">
                    {error}
                  </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title *
                    </label>
                    <input
                      name="title"
                      value={form.title}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      required
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location *
                    </label>
                    <input
                      name="location"
                      value={form.location}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Event start *
                      </label>
                      <input
                        type="date"
                        name="eventStartDate"
                        value={form.eventStartDate}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Event end *
                      </label>
                      <input
                        type="date"
                        name="eventEndDate"
                        value={form.eventEndDate}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Display from *
                      </label>
                      <input
                        type="date"
                        name="displayFrom"
                        value={form.displayFrom}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Display until *
                      </label>
                      <input
                        type="date"
                        name="displayUntil"
                        value={form.displayUntil}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      External link (optional)
                    </label>
                    <input
                      name="externalUrl"
                      value={form.externalUrl}
                      onChange={handleChange}
                      placeholder="https://..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Image (optional)
                    </label>
                    {existingImageUrl && !file && !form.removeImage && (
                      <div className="mb-2 text-sm">
                        Current image:{" "}
                        <a
                          href={existingImageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline"
                        >
                          view
                        </a>
                        <label className="ml-3 inline-flex items-center gap-2">
                          <input
                            type="checkbox"
                            name="removeImage"
                            checked={form.removeImage}
                            onChange={handleChange}
                          />
                          Remove
                        </label>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                      className="w-full"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700">
                      Active
                    </label>
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={form.isActive}
                      onChange={handleChange}
                    />
                  </div>
                </form>
              </ModalBody>
              <ModalFooter>
                <Button
                  variant="flat"
                  onPress={onClose}
                  isDisabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onPress={() => handleSubmit({})}
                  isDisabled={submitting}
                  className="bg-black text-white"
                >
                  {submitting
                    ? "Saving..."
                    : editingId !== null
                      ? "Save"
                      : "Create"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd frontend && npx tsc --noEmit`
Expected: no errors mentioning `AdminExhibitions.tsx`.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/adminComponents/AdminExhibitions.tsx
git commit -m "feat(frontend): add AdminExhibitions CRUD page"
```

---

## Task 12: Add the "Exhibitions" sidebar item to the admin dashboard

**Files:**
- Modify: `frontend/src/app/admin/page.tsx:1-181`

- [ ] **Step 1: Add the import**

In `frontend/src/app/admin/page.tsx`, after the line `import AdminOrders from "../../components/adminComponents/AdminOrders";`, add:

```tsx
import AdminExhibitions from "../../components/adminComponents/AdminExhibitions";
```

- [ ] **Step 2: Add the view component**

Below the existing `OrdersView` component, add:

```tsx
const ExhibitionsView: React.FC = () => (
  <div>
    <AdminExhibitions />
  </div>
);
```

- [ ] **Step 3: Update the `view` state type and selector**

Change:

```tsx
const [view, setView] = useState<"products" | "orders">("products");
```

to:

```tsx
const [view, setView] = useState<"products" | "orders" | "exhibitions">(
  "products",
);
```

Change:

```tsx
const selectView = (newView: "products" | "orders") => {
  setView(newView);
};
```

to:

```tsx
const selectView = (newView: "products" | "orders" | "exhibitions") => {
  setView(newView);
};
```

- [ ] **Step 4: Add the sidebar menu item**

Inside the `<nav>` block, after the Orders sidebar item div and before the Logout block (the `<div className="p-4 border-t border-gray-200">` with the `<LogoutButton />`), insert:

```tsx
<div
  role="button"
  tabIndex={0}
  onClick={() => selectView("exhibitions")}
  onKeyDown={keyToggle(() => selectView("exhibitions"))}
  className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 cursor-pointer group ${
    view === "exhibitions"
      ? "bg-gray-50 text-black border-r-4 border-black shadow-sm"
      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
  }`}
>
  <svg
    className="w-5 h-5 mr-3"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 7h18M3 12h18M3 17h18"
    />
  </svg>
  <span className="font-medium">Exhibitions</span>
  {view === "exhibitions" && (
    <div className="ml-auto w-2 h-2 bg-black rounded-full"></div>
  )}
</div>
```

- [ ] **Step 5: Render the new view in the main content area**

Change:

```tsx
{view === "products" ? <ProductsView /> : <OrdersView />}
```

to:

```tsx
{view === "products" ? (
  <ProductsView />
) : view === "orders" ? (
  <OrdersView />
) : (
  <ExhibitionsView />
)}
```

- [ ] **Step 6: Verify TypeScript compiles**

Run: `cd frontend && npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add frontend/src/app/admin/page.tsx
git commit -m "feat(frontend): add Exhibitions tab to admin dashboard"
```

---

## Task 13: End-to-end browser smoke test

**Files:** (none modified — runtime verification only)

- [ ] **Step 1: Rebuild and start the stack**

If the stack isn't already running with the latest images:

Run: `npm run down && npm run build && npm run up`
(Or `npm run up` alone if you didn't change docker config since Task 7.)

- [ ] **Step 2: Verify the public frontpage shows the announcement**

Open `http://localhost:3000/` in a browser.
Expected: between the hero image and the "Malerier og portrætter" products section, a "Kommende udstillinger" block renders the row(s) you created. Dates appear in Danish (e.g. "15.–30. juni 2026"). If you set an `externalUrl`, a "Læs mere →" link is visible. If no row is active, the section is absent (page looks identical to today).

- [ ] **Step 3: Verify the empty state**

In the DB, temporarily flip `is_active` to false for all rows (or pick dates outside the display window). Reload the frontpage.
Expected: the "Kommende udstillinger" section is gone entirely.

Restore the row when done.

- [ ] **Step 4: Verify the admin dashboard flow**

Navigate to `/admin`. Log in if needed.
Expected: sidebar shows a new "Exhibitions" item. Clicking it renders the list table with the row from Task 7. The "New exhibition" button opens the modal.

Create a second row from the admin UI with all fields including an image upload. Save.
Expected: the row appears in the list with the correct event-date range and display window. Refreshing the public frontpage shows the new card with the uploaded image.

Edit the row from the admin UI, change the title, save.
Expected: the title is updated in the admin list and on the public frontpage.

Toggle the row's "Active" pill off.
Expected: the row stays in the admin list but disappears from the public frontpage.

Delete the row.
Expected: confirm dialog, then the row is gone from both admin and public views.

- [ ] **Step 5: No commit** — runtime check only.

---

## Task 14: Final cleanup commit

**Files:** (verify no pending changes; this task wraps up housekeeping)

- [ ] **Step 1: Confirm clean working tree**

Run: `git status`
Expected: `nothing to commit, working tree clean`. If anything is pending, decide whether to commit or revert it.

- [ ] **Step 2: Squash-merge or open a PR per project workflow**

The user's repo uses `main` directly. They'll decide whether to push or open a PR. No automated action here.

---

## Self-review notes

- All spec sections are implemented: data model (Task 1, 2), backend module (Tasks 2–6), public endpoint visibility rule (Task 4, tested), admin endpoints (Task 5), image handling (Task 4 service, Task 5 controller), frontpage rendering (Tasks 9–10), admin UI (Tasks 11–12), error degrade to `null` on the public side (Task 9).
- Danish date formatting is applied in both `ExhibitionsSection` and `AdminExhibitions`.
- Same-month date-range collapsing is implemented as specified (`15.–30. juni 2026`).
- Optional `image_url` and `external_url` honored (no placeholder image, "Læs mere" conditional).
- The active-toggle in the admin list uses `updateExhibition` with a minimal `FormData` containing only `isActive` — matches the spec's "send only the `is_active` field as multipart/form-data."
- Active-list visibility rule (`is_active = true AND today BETWEEN display_from AND display_until`, ordered by `event_start_date ASC`) is unit-tested in Task 4.
- Cross-field date order validation lives in the service so updates that only change one bound still get checked against the merged state.

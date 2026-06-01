# Exhibition Announcements — Design

**Date:** 2026-06-01
**Status:** Draft

## Goal

Let the site admin publish announcements for upcoming exhibitions. Announcements appear on the public frontpage between the hero section and the products list, as a "Kommende udstillinger" section. The admin manages them from the existing admin dashboard. Each announcement is independently scheduled to appear and disappear from the frontpage based on a display date range, separate from the event's own dates. The feature is not a popup.

## Non-goals

- No popup, modal, or interstitial UI.
- No email/notification sending.
- No RSVP, ticketing, or event-attendance tracking.
- No public-facing exhibition detail page (the optional external URL covers "read more").
- No archive/past-exhibitions page.
- No multi-language support beyond Danish (the rest of the site is Danish only).

## User stories

1. As an admin, I open the admin dashboard and click "Exhibitions" in the sidebar to see a list of all announcements (active and inactive, past and future).
2. As an admin, I create a new announcement by entering title, description, location, an optional image, an optional external link, the event date range, and the display date range. I save it as active by default.
3. As an admin, I edit or delete an existing announcement, or toggle its `is_active` flag off to pull it from the frontpage without losing the record.
4. As a visitor, when I land on the frontpage during a period where one or more announcements are active and within their display window, I see a "Kommende udstillinger" section between the hero and the products grid, showing each announcement as an image-left card. When no announcement qualifies, the section is not rendered at all.

## Data model

New table `exhibitions` in `database/init.sql`:

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | INT | PK, AUTO_INCREMENT | |
| `title` | VARCHAR(255) | NOT NULL | |
| `description` | TEXT | NOT NULL | |
| `location` | VARCHAR(255) | NOT NULL | Venue + city, free-form. |
| `image_url` | VARCHAR(500) | NULL | MinIO/S3 URL. Optional. |
| `external_url` | VARCHAR(500) | NULL | Powers the "Læs mere" link. Optional. |
| `event_start_date` | DATE | NOT NULL | Date the exhibition opens. |
| `event_end_date` | DATE | NOT NULL | Date the exhibition closes. |
| `display_from` | DATE | NOT NULL | First day the announcement appears on the frontpage. |
| `display_until` | DATE | NOT NULL | Last day the announcement appears on the frontpage. |
| `is_active` | BOOLEAN | NOT NULL DEFAULT TRUE | Admin toggle, independent of dates. |
| `created_at` | TIMESTAMP | from BaseEntity | |
| `updated_at` | TIMESTAMP | from BaseEntity | |

Indexes: a composite index on `(is_active, display_from, display_until)` to keep the public lookup fast.

Validation rules enforced in the DTO:
- `event_end_date >= event_start_date`
- `display_until >= display_from`
- `title`, `description`, `location` non-empty after trim
- `external_url`, when provided, must be a valid URL

## Backend (NestJS)

New module `backend/src/exhibitions/`:

```
exhibitions/
  entities/exhibition.entity.ts
  dto/create-exhibition.dto.ts
  dto/update-exhibition.dto.ts
  exhibitions.controller.ts
  exhibitions.service.ts
  exhibitions.module.ts
```

`Exhibition` extends `BaseEntity` to inherit `created_at` / `updated_at`, mirroring the product entity pattern.

`ExhibitionsModule` is added to `app.module.ts` imports and reuses `S3Module` for image uploads (same pattern `ProductsModule` uses).

### Endpoints

| Method | Path | Auth | Purpose |
|---|---|---|---|
| `GET` | `/exhibitions/active` | public | Returns announcements where `is_active = true AND CURDATE() BETWEEN display_from AND display_until`, sorted by `event_start_date ASC`. Used by the frontpage. |
| `GET` | `/exhibitions` | JWT (admin) | Returns all announcements regardless of status, sorted by `event_start_date DESC`. Used by the admin list. |
| `GET` | `/exhibitions/:id` | JWT (admin) | Returns a single announcement for the edit form. |
| `POST` | `/exhibitions` | JWT (admin) | Creates an announcement. Accepts `multipart/form-data` so an optional image file can be uploaded in the same request. |
| `PATCH` | `/exhibitions/:id` | JWT (admin) | Updates an announcement. Accepts `multipart/form-data` with all fields optional (including the file). If no new image file is provided, the existing `image_url` is kept. A `remove_image=true` field clears it. The admin list's active-toggle uses this endpoint by sending only `is_active`. |
| `DELETE` | `/exhibitions/:id` | JWT (admin) | Deletes the row. Also deletes the image from MinIO if present. |

The image upload flow mirrors the products module: `multer` with `memoryStorage`, then `S3Module` writes the buffer to MinIO and returns a public URL stored in `image_url`. Max file size 5 MB.

## Frontend (Next.js)

### Public frontpage

New component `frontend/src/components/ExhibitionsSection.tsx`:

- Server component (or `async` in the page) — calls `fetchActiveExhibitions()` from `frontend/src/services/exhibition-api.ts` during the same `force-dynamic` render as products.
- Returns `null` when the list is empty (the section is not rendered).
- Renders an `<h2>Kommende udstillinger</h2>` and a vertical list of cards.

Card layout (image-left, horizontal):

```
+------ KOMMENDE UDSTILLINGER ----------+
|                                       |
| +---------+  Sommerudstilling 2026    |
| |         |  15. juni – 30. juni 2026 |
| |  IMAGE  |  Galleri Nord, København  |
| |         |  Description text here... |
| +---------+  [Læs mere →]             |
|                                       |
| +---------+  Efterårsudstilling       |
| |         |  1. sep – 15. sep 2026    |
| |  IMAGE  |  Galleri Syd, Århus       |
| |         |  Description text here... |
| +---------+  [Læs mere →]             |
+---------------------------------------+
```

On mobile, cards stack vertically: image on top, text below.

Dates render in Danish (`toLocaleDateString("da-DK", { day: "numeric", month: "long", year: "numeric" })` → `15. juni 2026`). When `event_start_date` and `event_end_date` share the same month and year, the format collapses to `15.–30. juni 2026`.

The "Læs mere" button only renders when `external_url` is set. It opens in a new tab with `rel="noopener noreferrer"`.

When `image_url` is null, the text column occupies the full card width — no placeholder image.

Built with HeroUI components and Tailwind, matching the rest of the site.

`app/page.tsx` is edited to insert `<ExhibitionsSection />` between `<HeroSection />` and the `<section>` that holds the products list.

### Admin dashboard

New component `frontend/src/components/adminComponents/AdminExhibitions.tsx`. Structure mirrors `AdminProducts`:

- A table/list of all exhibitions with columns: title, event dates, display window, active toggle, edit, delete.
- A "New exhibition" button opens a form (modal or inline) with these fields:
  - Title (text, required)
  - Description (textarea, required)
  - Location (text, required)
  - Event start date / event end date (date pickers, required)
  - Display from / display until (date pickers, required)
  - External URL (text, optional)
  - Image (file upload, optional, with preview and "remove image" toggle in edit mode)
  - Active (checkbox, defaults to true)
- The active toggle in the list calls `PATCH /exhibitions/:id` with only the `is_active` field (sent as `multipart/form-data`, same as all other updates) so the admin can flip status without opening the form.
- Delete asks for confirmation before calling `DELETE /exhibitions/:id`.

`app/admin/page.tsx` is extended:
- The `view` state type becomes `"products" | "orders" | "exhibitions"`.
- A new sidebar item "Exhibitions" appears below "Orders".
- The content area renders `<AdminExhibitions />` when `view === "exhibitions"`.

### API service

New file `frontend/src/services/exhibition-api.ts` exporting:

- `type ExhibitionAPI` — the shape returned by the backend.
- `fetchActiveExhibitions(): Promise<ExhibitionAPI[]>` — used by the frontpage.
- `fetchAllExhibitions(): Promise<ExhibitionAPI[]>` — admin list.
- `fetchExhibition(id): Promise<ExhibitionAPI>` — admin edit.
- `createExhibition(formData): Promise<ExhibitionAPI>` — multipart.
- `updateExhibition(id, formData): Promise<ExhibitionAPI>` — multipart.
- `deleteExhibition(id): Promise<void>`.

Pattern matches `product-api.ts`.

## Error handling

- If `fetchActiveExhibitions()` throws on the public frontpage, log the error server-side and render `null` for the section (the page still works). This mirrors how `app/page.tsx` already degrades to fallback products on error, but the announcement section is purely additive so a hard fallback is unnecessary.
- Admin API errors surface as toast notifications (whatever pattern `AdminProducts` already uses; reuse it).
- DTO validation errors return 400 with the field-level messages from `class-validator`, displayed inline on the admin form.

## Testing

- Backend: unit tests for `ExhibitionsService` covering the active-list query (boundary cases: today equals `display_from`, today equals `display_until`, `is_active = false` excluded), date-validation rules, and image upload / removal.
- Backend: e2e test hitting `GET /exhibitions/active` against a seeded DB to verify the visibility rule and ordering.
- Frontend: a quick manual check that the section disappears when no announcement qualifies, that Danish date formatting is correct including same-month collapsing, that the "Læs mere" link only appears when `external_url` is set, and that the admin form round-trips create → list → edit → delete with and without an image.

## File summary

**New files**
- `backend/src/exhibitions/entities/exhibition.entity.ts`
- `backend/src/exhibitions/dto/create-exhibition.dto.ts`
- `backend/src/exhibitions/dto/update-exhibition.dto.ts`
- `backend/src/exhibitions/exhibitions.controller.ts`
- `backend/src/exhibitions/exhibitions.service.ts`
- `backend/src/exhibitions/exhibitions.module.ts`
- `frontend/src/components/ExhibitionsSection.tsx`
- `frontend/src/components/adminComponents/AdminExhibitions.tsx`
- `frontend/src/services/exhibition-api.ts`

**Modified files**
- `database/init.sql` — add `exhibitions` table.
- `backend/src/app.module.ts` — register `ExhibitionsModule`.
- `frontend/src/app/page.tsx` — insert `<ExhibitionsSection />`.
- `frontend/src/app/admin/page.tsx` — add sidebar item and view.


# SIGMS Database Schema Conventions

## Naming
- Prisma models use singular PascalCase.
- PostgreSQL tables use plural snake_case.
- Prisma fields use camelCase.
- PostgreSQL columns use snake_case.
- Enums use PascalCase with uppercase values.

## Mapping
- Use @@map() for database table names.
- Use @map() for database column names.

## Identifiers
- Use UUID primary keys.
- Use descriptive foreign key fields.
- Explicitly define Prisma relationships.

## Multi-school architecture
- School-owned records must reference their school.
- School relationships must preserve tenant ownership.
- School records must not be accessed across tenants without authorization.




# SIGMS Common Database Fields

## Standard fields

- id: UUID primary key.
- createdAt: Record creation timestamp.
- updatedAt: Last modification timestamp.

## Optional lifecycle fields

- deletedAt: Nullable timestamp for soft deletion.
- isActive: Boolean activation status where applicable.

## Timestamp conventions

- Store timestamps using PostgreSQL TIMESTAMPTZ.
- Use UTC for backend timestamp storage.
- Convert dates to the user's locale when displaying them.
- Keep academic calendar dates separate from timestamp fields.

## Audit conventions

- Important operations must be recorded in audit logs.
- User and school ownership must be tracked where applicable.




# SIGMS Database Indexing Conventions

## Indexing rules

- Index frequently queried foreign keys.
- Index school ownership fields.
- Index frequently filtered status fields.
- Use composite indexes for common multi-column queries.
- Use unique indexes for fields requiring uniqueness.
- Avoid unnecessary indexes on rarely queried fields.

## Multi-school indexing

- Include schoolId in indexes for school-scoped queries.
- Prefer composite indexes beginning with schoolId when queries filter by school first.

## Naming

- Use descriptive index names.
- Follow PostgreSQL snake_case naming.

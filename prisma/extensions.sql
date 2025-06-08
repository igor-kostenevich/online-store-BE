CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS product_name_trgm_idx
  ON "products" USING GIN (name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS product_description_trgm_idx
  ON "products" USING GIN (description gin_trgm_ops);

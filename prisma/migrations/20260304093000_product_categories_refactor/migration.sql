-- Create new product-category relation table
CREATE TABLE "ProductCategory" (
    "productId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    CONSTRAINT "ProductCategory_pkey" PRIMARY KEY ("productId","categoryId")
);

-- Backfill from legacy product-section relation through section-category links
INSERT INTO "ProductCategory" ("productId", "categoryId")
SELECT DISTINCT ps."productId", sc."categoryId"
FROM "ProductSection" ps
JOIN "SectionCategory" sc ON sc."sectionId" = ps."sectionId"
ON CONFLICT ("productId", "categoryId") DO NOTHING;

ALTER TABLE "ProductCategory"
ADD CONSTRAINT "ProductCategory_productId_fkey"
FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ProductCategory"
ADD CONSTRAINT "ProductCategory_categoryId_fkey"
FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Drop legacy table
DROP TABLE "ProductSection";

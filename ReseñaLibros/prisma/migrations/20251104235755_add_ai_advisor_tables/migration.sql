-- CreateTable
CREATE TABLE "reading_list_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bookId" TEXT NOT NULL,
    "priority" TEXT,
    "notes" TEXT,
    "addedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "reading_list_items_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "books" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "read_books" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bookId" TEXT NOT NULL,
    "rating" INTEGER,
    "review" TEXT,
    "dateFinished" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "read_books_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "books" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "reading_list_items_bookId_key" ON "reading_list_items"("bookId");

-- CreateIndex
CREATE UNIQUE INDEX "read_books_bookId_key" ON "read_books"("bookId");

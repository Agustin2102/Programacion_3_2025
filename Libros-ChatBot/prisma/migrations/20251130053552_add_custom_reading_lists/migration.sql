-- CreateTable
CREATE TABLE "custom_reading_lists" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "custom_reading_lists_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_reading_lists" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "listId" TEXT,
    "bookId" TEXT NOT NULL,
    "priority" TEXT,
    "notes" TEXT,
    "addedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "reading_lists_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "reading_lists_listId_fkey" FOREIGN KEY ("listId") REFERENCES "custom_reading_lists" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_reading_lists" ("addedAt", "bookId", "id", "notes", "priority", "userId") SELECT "addedAt", "bookId", "id", "notes", "priority", "userId" FROM "reading_lists";
DROP TABLE "reading_lists";
ALTER TABLE "new_reading_lists" RENAME TO "reading_lists";
CREATE UNIQUE INDEX "reading_lists_userId_bookId_listId_key" ON "reading_lists"("userId", "bookId", "listId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "custom_reading_lists_userId_name_key" ON "custom_reading_lists"("userId", "name");

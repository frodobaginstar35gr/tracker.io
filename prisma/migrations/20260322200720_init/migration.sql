-- CreateTable
CREATE TABLE "Food" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "brand" TEXT,
    "referenceType" TEXT NOT NULL,
    "servingSize" REAL,
    "servingUnit" TEXT,
    "calories" REAL NOT NULL,
    "protein" REAL NOT NULL,
    "carbs" REAL NOT NULL,
    "fat" REAL NOT NULL,
    "favorite" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "FoodLogEntry" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "foodId" INTEGER NOT NULL,
    "date" DATETIME NOT NULL,
    "mealType" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "quantityUnit" TEXT NOT NULL,
    "calories" REAL NOT NULL,
    "protein" REAL NOT NULL,
    "carbs" REAL NOT NULL,
    "fat" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FoodLogEntry_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES "Food" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BodyWeightEntry" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" DATETIME NOT NULL,
    "weight" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "Food_name_idx" ON "Food"("name");

-- CreateIndex
CREATE INDEX "Food_brand_idx" ON "Food"("brand");

-- CreateIndex
CREATE INDEX "FoodLogEntry_date_idx" ON "FoodLogEntry"("date");

-- CreateIndex
CREATE INDEX "FoodLogEntry_foodId_idx" ON "FoodLogEntry"("foodId");

-- CreateIndex
CREATE INDEX "FoodLogEntry_mealType_idx" ON "FoodLogEntry"("mealType");

-- CreateIndex
CREATE INDEX "BodyWeightEntry_date_idx" ON "BodyWeightEntry"("date");

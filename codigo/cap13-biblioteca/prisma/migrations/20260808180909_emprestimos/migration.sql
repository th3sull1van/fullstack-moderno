-- CreateTable
CREATE TABLE "Emprestimo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "livroId" TEXT NOT NULL,
    "leitorId" TEXT NOT NULL,
    "dataEmprestimo" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataDevolucao" DATETIME,
    CONSTRAINT "Emprestimo_livroId_fkey" FOREIGN KEY ("livroId") REFERENCES "Livro" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Emprestimo_leitorId_fkey" FOREIGN KEY ("leitorId") REFERENCES "Leitor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Livro" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "titulo" TEXT NOT NULL,
    "tituloNormalizado" TEXT NOT NULL,
    "anoPublicacao" INTEGER NOT NULL,
    "isbn" TEXT NOT NULL,
    "disponivel" BOOLEAN NOT NULL DEFAULT true,
    "autorId" TEXT NOT NULL,
    CONSTRAINT "Livro_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "Autor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Livro" ("anoPublicacao", "autorId", "id", "isbn", "titulo", "tituloNormalizado") SELECT "anoPublicacao", "autorId", "id", "isbn", "titulo", "tituloNormalizado" FROM "Livro";
DROP TABLE "Livro";
ALTER TABLE "new_Livro" RENAME TO "Livro";
CREATE UNIQUE INDEX "Livro_isbn_key" ON "Livro"("isbn");
CREATE INDEX "Livro_tituloNormalizado_idx" ON "Livro"("tituloNormalizado");
CREATE INDEX "Livro_disponivel_idx" ON "Livro"("disponivel");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "Emprestimo_livroId_idx" ON "Emprestimo"("livroId");

-- CreateIndex
CREATE INDEX "Emprestimo_leitorId_idx" ON "Emprestimo"("leitorId");

-- CreateIndex
CREATE INDEX "Emprestimo_dataDevolucao_idx" ON "Emprestimo"("dataDevolucao");

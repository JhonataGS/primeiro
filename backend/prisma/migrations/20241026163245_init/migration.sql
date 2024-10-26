-- CreateTable
CREATE TABLE "Chamado" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "dataInicial" DATETIME NOT NULL,
    "nome" TEXT NOT NULL,
    "canal" TEXT NOT NULL,
    "problema" TEXT NOT NULL,
    "numeroTicket" TEXT NOT NULL,
    "dataFinal" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ResourceEmbedding" (
    "id" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "chunkIndex" INTEGER NOT NULL,
    "chunkText" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ResourceEmbedding_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ResourceEmbedding" ADD CONSTRAINT "ResourceEmbedding_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

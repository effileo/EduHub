import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'

dotenv.config()

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})

async function setupVector() {
  try {
    console.log('Enabling pgvector extension...')
    await prisma.$executeRawUnsafe('CREATE EXTENSION IF NOT EXISTS vector;')

    console.log('Adding vector column to ResourceEmbedding...')
    await prisma.$executeRawUnsafe('ALTER TABLE "ResourceEmbedding" ADD COLUMN IF NOT EXISTS embedding vector(1536);')

    console.log('Creating index on ResourceEmbedding...')
    await prisma.$executeRawUnsafe('CREATE INDEX IF NOT EXISTS resource_embedding_idx ON "ResourceEmbedding" USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);')

    console.log('Vector setup complete.')
  } catch (err) {
    console.error('Vector setup failed:', err)
  } finally {
    await prisma.$disconnect()
  }
}

setupVector()

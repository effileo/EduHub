import OpenAI from 'openai'
import prisma from './prisma'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export function chunkText(text: string): string[] {
  const chunkSize = 500
  const overlap = 50
  const chunks: string[] = []
  
  // Simple word-based chunking for demo
  const words = text.split(/\s+/)
  for (let i = 0; i < words.length; i += (chunkSize - overlap)) {
    chunks.push(words.slice(i, i + chunkSize).join(' '))
  }
  
  return chunks
}

export async function embedChunks(chunks: string[]): Promise<number[][]> {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: chunks,
  })
  
  return response.data.map(item => item.embedding)
}

export async function embedAndStore(resourceId: string, text: string) {
  const chunks = chunkText(text)
  const embeddings = await embedChunks(chunks)

  for (let i = 0; i < chunks.length; i++) {
    const chunkText = chunks[i]
    const embedding = embeddings[i]

    // Use raw SQL to insert with vector
    await prisma.$executeRawUnsafe(
      `INSERT INTO "ResourceEmbedding" (id, "resourceId", "chunkIndex", "chunkText", "createdAt", "embedding") 
       VALUES ($1, $2, $3, $4, NOW(), $5::vector)`,
      `emb_${Math.random().toString(36).substr(2, 9)}`,
      resourceId,
      i,
      chunkText,
      `[${embedding.join(',')}]`
    )
  }
}

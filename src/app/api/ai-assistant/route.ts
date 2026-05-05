import { NextRequest } from 'next/server'
import { getUser } from '@/lib/auth'
import prisma from '@/lib/prisma'
import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(request: NextRequest) {
  const user = await getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const { courseId, question, sessionHistory } = await request.json()

  // 1. Embed question
  const embedRes = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: question,
  })
  const vector = embedRes.data[0].embedding

  // 2. Vector search via raw SQL
  // Note: We need to join with Resource to filter by courseId
  const searchResults: any[] = await prisma.$queryRawUnsafe(`
    SELECT re."chunkText", r.title, re.embedding <=> $1::vector as distance
    FROM "ResourceEmbedding" re
    JOIN "Resource" r ON re."resourceId" = r.id
    WHERE r."courseId" = $2
    ORDER BY distance ASC
    LIMIT 5
  `, `[${vector.join(',')}]`, courseId)

  const context = searchResults.map(r => `Source: ${r.title}\nContent: ${r.chunkText}`).join('\n\n')

  // 3. Build Prompt
  const prompt = `
    You are an expert academic AI assistant for the course "${courseId}".
    Use the following course materials (context) to answer the student's question.
    If the answer isn't in the context, say you don't know based on the provided materials.
    Always cite your sources.

    Context:
    ${context}

    Conversation History:
    ${sessionHistory.map((h: any) => `${h.role === 'user' ? 'Student' : 'Assistant'}: ${h.content}`).join('\n')}

    Student: ${question}
    Assistant:
  `

  // 4. Stream response from Anthropic
  const stream = await anthropic.messages.stream({
    model: "claude-3-sonnet-20240229",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  })

  // Sources to include in the footer (unique titles)
  const sources = [...new Set(searchResults.map(r => r.title))]

  return new Response(
    new ReadableStream({
      async start(controller) {
        // First send the sources as a special header or JSON chunk
        controller.enqueue(new TextEncoder().encode(`__SOURCES__:${JSON.stringify(sources)}\n`))
        
        for await (const chunk of stream) {
          if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
            controller.enqueue(new TextEncoder().encode(chunk.delta.text))
          }
        }
        controller.close()
      },
    }),
    {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    }
  )
}

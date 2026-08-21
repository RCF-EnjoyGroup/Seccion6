import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmbedCoursePayload {
  course_id: string;
  text: string;
}

interface EmbedQueryPayload {
  query: string;
}

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const EMBEDDING_MODEL = Deno.env.get("EMBEDDING_MODEL") ?? "gte-small";
const EMBEDDING_DIMENSIONS = 384;

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

async function generateEmbedding(text: string): Promise<number[]> {
  // Option A: Supabase AI (gte-small) - requires Supabase AI enabled
  // const session = new Supabase.ai.Session(EMBEDDING_MODEL);
  // const result = await session.run(text, { mean_pool: true, normalize: true });
  // return result;

  // Option B: External embedding API (e.g., Hugging Face Inference API, OpenAI, etc.)
  const embeddingApiUrl = Deno.env.get("EMBEDDING_API_URL");
  const embeddingApiKey = Deno.env.get("EMBEDDING_API_KEY");

  if (embeddingApiUrl && embeddingApiKey) {
    try {
      const response = await fetch(embeddingApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${embeddingApiKey}`,
        },
        body: JSON.stringify({ inputs: text, model: EMBEDDING_MODEL }),
      });

      if (!response.ok) {
        throw new Error(`Embedding API error: ${response.statusText}`);
      }

      const data = await response.json();
      // Handle different response formats
      if (Array.isArray(data) && Array.isArray(data[0])) {
        return data[0]; // Hugging Face format
      }
      if (data.embedding) {
        return data.embedding; // Custom format
      }
      if (data.data && Array.isArray(data.data[0]?.embedding)) {
        return data.data[0].embedding; // OpenAI format
      }
      throw new Error("Unexpected embedding API response format");
    } catch (error) {
      console.warn("Embedding API failed, using placeholder:", error.message);
      return generatePlaceholderEmbedding(text);
    }
  }

  // Option C: Local placeholder for development (returns deterministic pseudo-embedding)
  console.warn("Using placeholder embedding - configure EMBEDDING_API_URL for production");
  return generatePlaceholderEmbedding(text);
}

function generatePlaceholderEmbedding(text: string): number[] {
  // Simple deterministic hash-based embedding for development only
  const embedding = new Array(EMBEDDING_DIMENSIONS).fill(0);
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) - hash) + text.charCodeAt(i);
    hash |= 0;
  }
  const rng = mulberry32(hash);
  for (let i = 0; i < EMBEDDING_DIMENSIONS; i++) {
    embedding[i] = (rng() * 2 - 1) / Math.sqrt(EMBEDDING_DIMENSIONS);
  }
  // Normalize
  const norm = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  return embedding.map(val => val / norm);
}

function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname;

    if (path.endsWith("/embed-course")) {
      return await handleEmbedCourse(req);
    }

    if (path.endsWith("/embed-query")) {
      return await handleEmbedQuery(req);
    }

    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Edge Function error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function handleEmbedCourse(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { course_id, text }: EmbedCoursePayload = await req.json();

  if (!course_id || !text) {
    return new Response(JSON.stringify({ error: "Missing course_id or text" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  console.log(`Generating embedding for course ${course_id} (${text.length} chars)`);

  const embedding = await generateEmbedding(text);

  if (embedding.length !== EMBEDDING_DIMENSIONS) {
    throw new Error(`Embedding dimension mismatch: expected ${EMBEDDING_DIMENSIONS}, got ${embedding.length}`);
  }

  // Update the course with the embedding using admin client (bypasses RLS)
  const { error } = await supabaseAdmin
    .from("courses")
    .update({
      embedding: `[${embedding.join(",")}]`,
      // Optionally store model version for future migrations
      // embedding_model: EMBEDDING_MODEL,
    })
    .eq("id", course_id);

  if (error) {
    console.error("Failed to update course embedding:", error);
    throw new Error(`Database update failed: ${error.message}`);
  }

  console.log(`Embedding saved for course ${course_id}`);

  return new Response(JSON.stringify({ success: true, course_id, dimensions: embedding.length }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function handleEmbedQuery(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { query }: EmbedQueryPayload = await req.json();

  if (!query) {
    return new Response(JSON.stringify({ error: "Missing query" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const embedding = await generateEmbedding(query);

  return new Response(JSON.stringify({ embedding }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
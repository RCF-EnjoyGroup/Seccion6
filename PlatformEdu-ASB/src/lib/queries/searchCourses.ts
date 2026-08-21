import { createClient } from "@/lib/supabase/server";
import type { Course } from "@/types/database";

export interface SimilarCourse extends Course {
  similarity: number;
}

interface EmbeddingResponse {
  embedding: number[];
}

async function getQueryEmbedding(query: string): Promise<number[] | null> {
  const url = process.env.EMBEDDING_EDGE_FUNCTION_URL;
  const key = process.env.EMBEDDING_EDGE_FUNCTION_KEY;

  if (!url || !key) {
    console.warn("Embedding Edge Function not configured");
    return null;
  }

  try {
    const response = await fetch(`${url}/embed-query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      console.error("Embedding Edge Function error:", await response.text());
      return null;
    }

    const data = (await response.json()) as EmbeddingResponse;
    return data.embedding;
  } catch (error) {
    console.error("Error calling embedding Edge Function:", error);
    return null;
  }
}

async function searchByTextFallback(
  query: string,
  limit: number
): Promise<SimilarCourse[]> {
  const supabase = await createClient();
  const ilike = `%${query.toLowerCase()}%`;

  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("status", "published")
    .or(`title.ilike.${ilike},description.ilike.${ilike},short_description.ilike.${ilike},category.ilike.${ilike}`)
    .order("student_count", { ascending: false })
    .limit(limit);

  if (error || !data) {
    return [];
  }

  return data.map((c) => ({ ...(c as unknown as Course), similarity: 0 }));
}

export async function searchCoursesBySimilarity(
  query: string,
  limit = 10
): Promise<SimilarCourse[]> {
  const embedding = await getQueryEmbedding(query);

  if (!embedding) {
    return searchByTextFallback(query, limit);
  }

  const supabase = await createClient();

  const { data, error } = await supabase.rpc("search_courses_by_embedding", {
    query_embedding: embedding,
    match_threshold: 0.01,
    match_count: limit,
  });

  if (error) {
    console.error("Vector search error:", error);
    return searchByTextFallback(query, limit);
  }

  const results = (data ?? []) as unknown as SimilarCourse[];

  if (results.length === 0) {
    return searchByTextFallback(query, limit);
  }

  return results;
}
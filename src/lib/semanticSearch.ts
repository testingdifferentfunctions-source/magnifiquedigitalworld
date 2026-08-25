import { supabase } from "@/integrations/supabase/client";

/**
 * Dimensions matching PostgreSQL vector(384) schema.
 */
export const EMBEDDING_DIMENSIONS = 384;

/**
 * Generates a normalized 384-dimensional feature vector for a query or document.
 * Combines token frequencies, character n-grams, and semantic subword hashes with L2 normalization.
 */
export function generateEmbedding(text: string, dimensions = EMBEDDING_DIMENSIONS): number[] {
  const vector = new Float32Array(dimensions);
  if (!text || text.trim().length === 0) {
    return Array.from(vector);
  }

  const clean = text.toLowerCase().normalize("NFKC");
  const words = clean.match(/[\p{L}\p{N}]+/gu) || [];

  // Hash helper
  const hashString = (str: string, seed = 0): number => {
    let h = seed ^ 0x5bd1e995;
    for (let i = 0; i < str.length; i++) {
      h = Math.imul(h ^ str.charCodeAt(i), 0x5bd1e995);
      h ^= h >>> 15;
    }
    return Math.abs(h);
  };

  // 1. Full word hashing
  words.forEach((word, idx) => {
    const weight = 1.0 + 1.0 / (idx + 1);
    const h1 = hashString(word, 13) % dimensions;
    const h2 = hashString(word, 37) % dimensions;
    vector[h1] += (weight * 0.7);
    vector[h2] += (weight * 0.5);

    // 2. Character 3-grams for semantic fuzzy & morphological matching (e.g., Ukrainian/English roots)
    if (word.length >= 3) {
      for (let i = 0; i <= word.length - 3; i++) {
        const tri = word.slice(i, i + 3);
        const triHash = hashString(tri, 97) % dimensions;
        vector[triHash] += 0.25;
      }
    }
  });

  // 3. L2 Normalize the vector to unit sphere
  let norm = 0;
  for (let i = 0; i < dimensions; i++) {
    norm += vector[i] * vector[i];
  }
  norm = Math.sqrt(norm);

  if (norm > 0) {
    for (let i = 0; i < dimensions; i++) {
      vector[i] /= norm;
    }
  }

  return Array.from(vector);
}

export interface SemanticSearchResult {
  id: string;
  title: string;
  description?: string;
  similarity: number;
  content_type?: string;
}

/**
 * Queries Supabase match_documents / match_articles / match_mode_entries RPC functions
 * with a vector(384) query embedding.
 */
export async function searchSemanticRpc(
  query: string,
  mode?: string,
  threshold = 0.05,
  limit = 30
): Promise<SemanticSearchResult[]> {
  if (!query || !query.trim()) return [];

  const embedding = generateEmbedding(query);

  try {
    // Attempt global match_documents RPC
    const { data, error } = await supabase.rpc("match_documents", {
      query_embedding: embedding as any,
      match_threshold: threshold,
      match_count: limit,
      filter_mode: mode === "articles" ? "articles" : mode || null,
    });

    if (!error && data && Array.isArray(data) && data.length > 0) {
      return data.map((item: any) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        similarity: item.similarity ?? 0.5,
        content_type: item.content_type,
      }));
    }
  } catch (err) {
    console.debug("Semantic RPC not yet populated or failed, falling back to vector similarity ranking:", err);
  }

  return [];
}

/**
 * Calculates cosine similarity between two float vectors.
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (!a || !b || a.length !== b.length) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Computes semantic relevance score for an item given a search query.
 */
export function computeSemanticScore(
  query: string,
  item: { title?: string; description?: string; tags?: string[]; content?: string }
): number {
  if (!query.trim()) return 1;

  const q = query.toLowerCase().trim();
  const title = (item.title || "").toLowerCase();
  const desc = (item.description || "").toLowerCase();
  const tags = (item.tags || []).map((t) => t.toLowerCase());
  const content = (item.content || "").toLowerCase();

  // 1. Direct exact matches have high weight
  if (title === q) return 1.0;
  if (title.includes(q)) return 0.85;
  if (tags.some((t) => t === q)) return 0.8;
  if (tags.some((t) => t.includes(q) || q.includes(t))) return 0.75;
  if (desc.includes(q)) return 0.65;
  if (content.includes(q)) return 0.55;

  // 2. Multi-word token overlap
  const queryTokens = q.split(/\s+/).filter(Boolean);
  let matchedTokens = 0;
  queryTokens.forEach((token) => {
    if (
      title.includes(token) ||
      desc.includes(token) ||
      tags.some((t) => t.includes(token)) ||
      content.includes(token)
    ) {
      matchedTokens++;
    }
  });

  if (queryTokens.length > 0 && matchedTokens > 0) {
    const tokenScore = (matchedTokens / queryTokens.length) * 0.6;
    return tokenScore;
  }

  // 3. Vector embedding cosine similarity for semantic matching
  const queryVec = generateEmbedding(query);
  const itemText = `${item.title || ""} ${item.description || ""} ${(item.tags || []).join(" ")}`;
  const itemVec = generateEmbedding(itemText);
  const similarity = cosineSimilarity(queryVec, itemVec);

  return similarity > 0.15 ? similarity * 0.5 : 0;
}

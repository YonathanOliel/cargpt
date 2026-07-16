import { KNOWLEDGE_BASE, type KnowledgeEntry } from './kb.data';

export interface RetrievalMatch {
  entry: KnowledgeEntry;
  score: number;
}

/** Lowercase, strip niqqud and punctuation, collapse whitespace. */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[\u0591-\u05c7]/g, '')
    .replace(/["'׳״.,!?()\-/\\]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Scores how well the free text matches an entry.
 * Longer / multi-word keywords are weighted higher because they are more
 * specific. Substring matching handles Hebrew attached prefixes (e.g. "בבלמים").
 */
export function scoreEntry(text: string, entry: KnowledgeEntry): number {
  const norm = normalize(text);
  let score = 0;
  for (const kw of entry.keywords) {
    const k = normalize(kw);
    if (k && norm.includes(k)) {
      score += k.includes(' ') ? 3 : k.length >= 4 ? 2 : 1;
    }
  }
  return score;
}

/**
 * Returns the best-matching entry, or undefined if nothing matches.
 * Ties are broken by definition order (first entry wins).
 */
export function retrieve(text: string): RetrievalMatch | undefined {
  return retrieveTop(text, 1)[0];
}

/** Returns the top-N matching entries, sorted by score descending. */
export function retrieveTop(text: string, n = 3): RetrievalMatch[] {
  const scored: RetrievalMatch[] = [];
  for (const entry of KNOWLEDGE_BASE) {
    const score = scoreEntry(text, entry);
    if (score > 0) scored.push({ entry, score });
  }
  // Stable sort by score desc; definition order preserved on ties.
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, n);
}

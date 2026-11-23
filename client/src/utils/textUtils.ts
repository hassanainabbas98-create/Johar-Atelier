/**
 * Curatorial Text Utilities
 * Filters raw illustrative placeholders from display and provides museum-quality fallbacks.
 */

export function cleanArtistName(name?: string | null): string {
  if (!name || name.trim() === '' || name.includes('[Illustrative Placeholder')) {
    return 'Johar Atelier';
  }
  return name.trim();
}

export function cleanArtistSubtitle(subtitle?: string | null): string {
  if (!subtitle || subtitle.trim() === '' || subtitle.includes('[Illustrative Placeholder')) {
    return 'Fine Art Atelier & Archival Gallery';
  }
  return subtitle.trim();
}

export function cleanIntroText(text?: string | null): string {
  if (!text || text.trim() === '' || text.includes('[Illustrative Placeholder')) {
    return 'An archival sanctuary celebrating the uncompromised integrity of original oil works, tactile impasto textures, classical calligraphy, and contemplative studio studies.';
  }
  return text.trim();
}

export function cleanStatementText(text?: string | null): string | null {
  if (!text || text.trim() === '' || text.includes('[Illustrative Placeholder')) {
    return 'Art is an act of preservation—an inquiry into light, earth pigments, and the permanent resonance of gesture upon canvas.';
  }
  return text.trim();
}

export function cleanBioText(text?: string | null): string {
  if (!text || text.trim() === '' || text.includes('[Illustrative Placeholder')) {
    return 'Dedicated to classical studio rigor, contemplative observation, and the tactile poetry of pigments, papers, and natural linens. Each piece emerges from continuous studio experimentation and a profound respect for historical medium chemistry.';
  }
  return text.trim();
}

export function cleanLocation(text?: string | null): string | null {
  if (!text || text.trim() === '' || text.includes('[Illustrative Placeholder')) {
    return 'London & Paris';
  }
  return text.trim();
}

/**
 * Minimal Firestore REST helpers (no SDK) -- used server-side to read the
 * public `rooms` collection and, with a caller's ID token, their own users doc.
 */

type RestValue = Record<string, unknown>;

/** Converts a Firestore REST "Value" into plain JS. */
export function decodeValue(value: RestValue | undefined): unknown {
  if (!value || typeof value !== 'object') return null;
  if ('nullValue' in value) return null;
  if ('booleanValue' in value) return Boolean(value.booleanValue);
  if ('integerValue' in value) return Number(value.integerValue);
  if ('doubleValue' in value) return Number(value.doubleValue);
  if ('stringValue' in value) return String(value.stringValue);
  if ('timestampValue' in value) return String(value.timestampValue);
  if ('referenceValue' in value) return String(value.referenceValue);
  if ('bytesValue' in value) return String(value.bytesValue);
  if ('geoPointValue' in value) return value.geoPointValue;
  if ('arrayValue' in value) {
    const values = ((value.arrayValue as { values?: RestValue[] }) || {}).values || [];
    return values.map(decodeValue);
  }
  if ('mapValue' in value) {
    return decodeFields(((value.mapValue as { fields?: Record<string, RestValue> }) || {}).fields);
  }
  return null;
}

export function decodeFields(fields: Record<string, RestValue> | undefined): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(fields || {})) out[k] = decodeValue(v);
  return out;
}

export interface RestDocument {
  name: string;
  fields?: Record<string, RestValue>;
}

export function docId(doc: RestDocument): string {
  return doc.name.split('/').pop() || '';
}

export interface FirestoreRestTarget {
  /** e.g. https://firestore.googleapis.com/v1/projects/p/databases/(default)/documents */
  documentsUrl: string;
  apiKey?: string;
}

export function firestoreRestTarget(opts: {
  projectId: string;
  apiKey?: string;
  emulatorHost?: string | null;
}): FirestoreRestTarget {
  const path = `/v1/projects/${opts.projectId}/databases/(default)/documents`;
  if (opts.emulatorHost) return { documentsUrl: `http://${opts.emulatorHost}${path}` };
  return { documentsUrl: `https://firestore.googleapis.com${path}`, apiKey: opts.apiKey };
}

export function restUrl(target: FirestoreRestTarget, relPath: string, params: Record<string, string> = {}) {
  const url = new URL(`${target.documentsUrl}/${relPath}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  if (target.apiKey) url.searchParams.set('key', target.apiKey);
  return url.toString();
}

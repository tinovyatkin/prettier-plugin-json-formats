export type JsonValue =
  | string
  | true
  | false
  | null
  | number
  | JsonObject
  | JsonArray;

export interface JsonObject {
  [key: string]: JsonValue;
}

export type JsonArray = JsonValue[];

export function isJsonObject(value: JsonValue): value is JsonObject {
  return value != null && typeof value === 'object' && !Array.isArray(value);
}

export function isJsonArray(value: JsonValue): value is JsonArray {
  return Array.isArray(value);
}

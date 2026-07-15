export function parseScope(value: string): string[] | null {
    const values = value
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
  
    return values.length ? values : null;
  }
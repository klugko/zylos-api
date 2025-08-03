function extractJson(raw: string): string {
    return raw
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();
  }
  
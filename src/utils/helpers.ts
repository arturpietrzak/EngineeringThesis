export function extractUniqueHashtags(text: string): string[] {
  const regex = /#[a-zA-Z0-9_]{1,32}/g;
  const hashtags = text.match(regex);

  if (!hashtags) {
    return [];
  }

  return [
    ...new Set(hashtags.map((hashtag) => hashtag.slice(1).toLowerCase())),
  ];
}

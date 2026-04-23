export const generateProjectKey = (name: string): string => {
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) {
    return words
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 5);
  }
  return name.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 3) || "PRJ";
};

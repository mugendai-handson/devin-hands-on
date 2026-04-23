export const generateProjectKey = (name: string): string => {
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) {
    const asciiInitials = words
      .map((w) => w[0])
      .join("")
      .replace(/[^a-zA-Z0-9]/g, "")
      .toUpperCase()
      .slice(0, 5);
    if (asciiInitials.length >= 2) return asciiInitials;
  }
  return name.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 3) || "PRJ";
};

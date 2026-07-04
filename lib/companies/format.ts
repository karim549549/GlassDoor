export function fmt(n: number) {
  return n.toLocaleString("en-EG");
}

export function ratingColorClass(rating: number): string {
  if (rating >= 4.0) return "text-[#1A7A3A]";
  if (rating >= 3.5) return "text-[#C47A00]";
  return "text-accent";
}

export function normalizeName(s) {
    return s.toLowerCase().trim();
}
export function round2(n) {
    return Math.round(n * 100) / 100;
}
export function impactToGrade(kg) {
    if (kg < 0.8)
        return "A";
    if (kg < 1.6)
        return "B";
    if (kg < 2.8)
        return "C";
    if (kg < 4.5)
        return "D";
    return "E";
}

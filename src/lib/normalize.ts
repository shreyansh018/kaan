/**
 * Text normalisation for Hindi (Devanagari) + Roman Hindi + English.
 *
 * Everything downstream — claim extraction and corpus matching — works on
 * tokens, so this file is deliberately dependency-free and deterministic.
 */

/**
 * Function words carry no matching signal. Negations are NOT in this list:
 * "nahi" / "not" change the meaning of a claim and must survive.
 */
const STOPWORDS = new Set<string>([
  // Hindi / Roman Hindi
  "hai", "hain", "ho", "hota", "hoti", "hote", "tha", "thi", "the",
  "ka", "ki", "ke", "ko", "se", "mein", "me", "par", "pe", "aur", "ya",
  "ek", "ye", "yeh", "wo", "woh", "jo", "bhi", "toh", "to", "hi",
  "kar", "karna", "karke", "kiya", "kiye", "raha", "rahi", "rahe",
  "gaya", "gayi", "gaye", "jata", "jati", "jate", "jaata", "jaati",
  "liye", "lie", "batao", "bata", "bataya", "bolo", "bola", "boli",
  "suno", "sun", "sunna", "bhejo", "bheja", "bheje", "bheji", "bhej",
  "forward", "share", "whatsapp", "group", "video", "message", "msg",
  "please", "plz", "ji", "bhai", "bhaiya", "didi", "zaroori", "zaroor",
  "dhyan", "jaldi", "abhi", "ab", "sab", "sabhi", "sabko", "koi",
  "kuch", "log", "logon", "baat", "wala", "wali", "wale", "kya",
  "kaise", "kyun", "kyu", "isliye", "lekin", "phir", "fir", "agar",
  "matlab", "sirf", "bahut", "bohot", "bada", "badi", "naya", "nayi",
  "aap", "aapke", "aapko", "hum", "humne", "main", "maine", "mera",
  "meri", "tum", "tumhe", "uska", "uski", "iske", "iska", "inke",
  "inka", "unka", "unki", "apna", "apni", "apne", "wahan", "yahan",
  "karo", "karein", "karen", "kijiye", "chalo", "aao", "dekho",
  // Devanagari function words
  "है", "हैं", "हो", "होता", "होती", "होते", "था", "थी", "थे",
  "का", "की", "के", "को", "से", "में", "पर", "और", "या", "एक",
  "ये", "यह", "वो", "वह", "जो", "भी", "तो", "ही", "कर", "करना",
  "करके", "किया", "रहा", "रही", "रहे", "गया", "गई", "गए", "लिए",
  "बताओ", "बताया", "बोला", "सुनो", "भेजो", "भेजा", "भेजें", "सब",
  "सभी", "सबको", "कोई", "कुछ", "लोग", "बात", "वाला", "वाली", "वाले",
  "क्या", "कैसे", "क्यों", "इसलिए", "लेकिन", "फिर", "अगर", "मतलब",
  "सिर्फ", "बहुत", "आप", "आपके", "आपको", "हम", "हमने", "मैं", "मेरा",
  "मेरी", "तुम", "उसका", "उसकी", "इसका", "इसकी", "अपना", "अपनी",
  "अपने", "वहाँ", "यहाँ", "करो", "करें", "कीजिए", "चलो", "देखो",
  // English
  "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
  "to", "of", "and", "or", "in", "on", "at", "for", "with", "this",
  "that", "these", "those", "it", "its", "as", "by", "from", "you",
  "your", "we", "our", "they", "their", "i", "my", "he", "she", "his",
  "her", "have", "has", "had", "do", "does", "did", "but", "so", "if",
  "then", "than", "just", "also", "very", "can", "will", "would",
  "should", "about", "there", "here", "what", "which", "who", "how",
  "why", "when", "please", "everyone", "all", "get", "got", "going",
]);

/** Collapses Devanagari nukta/zero-width variants and lowercases Latin. */
export function normalizeText(input: string): string {
  return input
    .normalize("NFC")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/[\u093C]/g, "") // nukta
    .replace(/[‘’“”]/g, "'")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

/** Splits on anything that is not a letter or a digit (Unicode aware). */
export function tokenize(input: string): string[] {
  const normalized = normalizeText(input);
  const raw = normalized.split(/[^\p{L}\p{N}]+/u);
  const out: string[] = [];
  for (const token of raw) {
    if (token.length < 2) continue;
    if (STOPWORDS.has(token)) continue;
    out.push(token);
  }
  return out;
}

/** Token set, for fast overlap maths. */
export function tokenSet(input: string): Set<string> {
  return new Set(tokenize(input));
}

const SENTENCE_SPLIT = /(?<=[।.!?])\s+|\n+/u;

/** Sentence split that understands the Devanagari danda (।). */
export function splitSentences(input: string): string[] {
  return input
    .split(SENTENCE_SPLIT)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

/** 0..1 overlap of two token sets, symmetric. */
export function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let intersection = 0;
  for (const token of a) if (b.has(token)) intersection += 1;
  const union = a.size + b.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

/** True when the text contains Devanagari. */
export function isDevanagari(input: string): boolean {
  return /[\u0900-\u097F]/.test(input);
}

/** Short, display-safe excerpt. */
export function excerpt(input: string, max = 120): string {
  const clean = input.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return clean.slice(0, max - 1).trimEnd() + "…";
}

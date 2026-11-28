/**
 * Every string the interface renders, in both languages.
 *
 * Hindi mode keeps short English glosses on explanatory copy: the people who
 * need Kaan read Hindi, but anyone reviewing the build may not. English mode is
 * fully English, including the spoken verdict.
 */

export type Lang = "hi" | "en";

export const LANGS: { id: Lang; label: string }[] = [
  { id: "hi", label: "हिंदी" },
  { id: "en", label: "English" },
];

const hi = {
  langName: "हिंदी",
  switchLabel: "भाषा बदलें",

  brandTag: "सुनो, फिर मानो",
  chipLlm: "AI extraction on",
  chipLocal: "Local matcher · no key needed",

  heroLine1: "एक वॉइस नोट भेजिए।",
  heroLine2: "20 सेकंड में सच।",
  lede: "Forwarded WhatsApp voice notes are how misinformation travels in India — and every fact-checker only reads text. Kaan listens to the note, finds the one checkable claim, and answers in the same language, with the source named aloud.",

  tryTitle: "Try a forwarded note",
  tryHint: "3 bundled notes · works offline",
  seedCheck: "जाँच करें",
  seedKind: "voice note",
  seedPlay: "वॉइस नोट सुनें",
  seedPause: "वॉइस नोट रोकें",

  howTitle: "कैसे काम करता है",
  steps: [
    {
      title: "Listen",
      body: "Transcribes the note in the language it was actually spoken in.",
    },
    {
      title: "One claim",
      body: "Pulls the single checkable assertion out of a 40-second ramble.",
    },
    {
      title: "Check & speak",
      body: "Matches verified sources and replies in 20 seconds of audio.",
    },
  ],

  rulesTitle: "Kaan क्या नहीं करेगा",
  rules: [
    "No verdict without a named source",
    "No politics, no medical advice",
    "Refuses when it cannot verify",
  ],

  recentTitle: "हाल की जाँच",
  recentEmpty: "",

  recorderIdle: "बोलिए",
  recorderListening: "सुन रहे हैं…",
  recorderSubIdle: "Or upload a file, or type the note below.",
  recorderSubListening: "Speak the forwarded note out loud, then tap to stop.",
  recorderUnsupportedTitle: "Live recording is not available in this browser",
  recorderUnsupportedBody:
    "Chrome and Edge support it. You can still upload an audio file or paste the note below — the check works exactly the same.",
  recorderErrorMic:
    "Mic से सुन नहीं पाए। नीचे लिखकर या फ़ाइल अपलोड करके भेजें।",
  recorderErrorStart:
    "Mic शुरू नहीं हो पाया। नीचे लिखकर या फ़ाइल अपलोड करके भेजें।",
  recorderAria: "वॉइस नोट रिकॉर्ड करें",
  recorderStopAria: "रिकॉर्डिंग रोकें",
  recognitionLang: "पहचान की भाषा",

  uploadTitle: "या ऑडियो फ़ाइल अपलोड करें",
  uploadHint: "MP3, M4A, WAV, OGG · 4 MB तक · बोल नहीं सकते तो यही रास्ता",
  uploadChoose: "फ़ाइल चुनें",
  uploadDrop: "यहाँ छोड़ें",
  uploadWorking: "ऑडियो सुना जा रहा है…",
  uploadTooBig: "फ़ाइल 4 MB से बड़ी है। छोटी फ़ाइल चुनें।",
  uploadNoEngineTitle: "इस ऑडियो का टेक्स्ट नहीं निकाल पाए",
  uploadNoEngineBody:
    "बिना transcription key, Kaan सिर्फ़ bundled demo notes पहचान सकता है। नीचे टेक्स्ट पेस्ट करें — जाँच वैसे ही होगी।",
  uploadMatched: "Bundled note पहचाना गया",
  uploadTranscribed: "टेक्स्ट निकाला गया",
  uploadFailed: "अपलोड नहीं हो पाया। दोबारा कोशिश करें।",
  uploadKeyOn: "Whisper on",
  uploadKeyOff: "keyless · demo notes only",

  composerLabel: "या नोट लिखें / पेस्ट करें",
  composerPlaceholder: "Forwarded note यहाँ पेस्ट करें…",
  words: (n: number) => `${n} words`,
  langHint: "Hindi, Hinglish or English",
  checkBtn: "Check करें",

  errorEmpty: "पहले कोई नोट लिखें, बोलें या फ़ाइल अपलोड करें।",
  errorGeneric: "कुछ गड़बड़ हो गई। दोबारा कोशिश करें।",

  checkingTitle: "जाँच हो रही है…",
  checkingSub: "Checking the note against verified sources",
  checkingSteps: [
    "नोट सुना जा रहा है",
    "एक claim ढूँढा जा रहा है",
    "verified सोर्स चेक किए जा रहे हैं",
  ],

  back: "नया नोट",
  verdictSubUnverified:
    "सोर्स नहीं मिला, इसलिए हमने सच या झूठ नहीं कहा — बिना सोर्स के कोई verdict नहीं।",
  verdictSubVerified:
    "एक claim मिला, verified सोर्स से मिलाया गया, और जवाब आपकी भाषा में।",
  claimEyebrow: "एक claim मिला",
  whatsapp: "WhatsApp पर भेजें",
  audioBtn: "Audio",
  copyBtn: "Copy verdict",
  copiedBtn: "Copy हो गया ✓",
  footnote:
    "जवाब audio में है ताकि इसे वापस उसी ग्रुप में भेजा जा सके — जहाँ से नोट आया था। Voice is the delivery format, not a feature.",
  sourcesTitle: "सोर्स",
  noSources:
    "कोई verified सोर्स नहीं मिला। इसीलिए Kaan ने सच या झूठ नहीं कहा — बिना सोर्स के कोई verdict नहीं।",
  transcriptTitle: "नोट का transcript",
  transcriptSummary: "पूरा नोट देखें",
  metaEngine: "Engine",
  metaMatch: "Match",
  metaChecked: "Checked",
  metaTime: "Time",
  registries: (n: number) => `${n} registries`,
  newCheck: "नया नोट check करें",
  engineLlm: "AI extraction",
  engineLocal: "Local matcher",
  audioLabel: "जवाब सुनें",
  audioPlayAria: "जवाब सुनें",
  audioPauseAria: "जवाब रोकें",
  audioWarn: "इस डिवाइस पर इस भाषा की आवाज़ नहीं है — ऊपर का टेक्स्ट पढ़ें।",
  footer: (n: number) =>
    `Kaan · Round 2 build · ${n} curated verified claims · audio bundled, no API key required`,
};

const en: typeof hi = {
  langName: "English",
  switchLabel: "Change language",

  brandTag: "Listen, then believe",
  chipLlm: "AI extraction on",
  chipLocal: "Local matcher · no key needed",

  heroLine1: "Send a voice note.",
  heroLine2: "The truth in 20 seconds.",
  lede: "Forwarded WhatsApp voice notes are how misinformation travels in India — and every fact-checker only reads text. Kaan listens to the note, finds the one checkable claim, and answers in the same language, with the source named aloud.",

  tryTitle: "Try a forwarded note",
  tryHint: "3 bundled notes · works offline",
  seedCheck: "Check this note",
  seedKind: "voice note",
  seedPlay: "Play voice note",
  seedPause: "Pause voice note",

  howTitle: "How it works",
  steps: [
    {
      title: "Listen",
      body: "Transcribes the note in the language it was actually spoken in.",
    },
    {
      title: "One claim",
      body: "Pulls the single checkable assertion out of a 40-second ramble.",
    },
    {
      title: "Check & speak",
      body: "Matches verified sources and replies in 20 seconds of audio.",
    },
  ],

  rulesTitle: "What Kaan will not do",
  rules: [
    "No verdict without a named source",
    "No politics, no medical advice",
    "Refuses when it cannot verify",
  ],

  recentTitle: "Recent checks",
  recentEmpty: "",

  recorderIdle: "Speak",
  recorderListening: "Listening…",
  recorderSubIdle: "Or upload a file, or type the note below.",
  recorderSubListening: "Speak the forwarded note out loud, then tap to stop.",
  recorderUnsupportedTitle: "Live recording is not available in this browser",
  recorderUnsupportedBody:
    "Chrome and Edge support it. You can still upload an audio file or paste the note below — the check works exactly the same.",
  recorderErrorMic:
    "We couldn't hear the mic. Type the note or upload a file instead.",
  recorderErrorStart:
    "The mic didn't start. Type the note or upload a file instead.",
  recorderAria: "Record a voice note",
  recorderStopAria: "Stop recording",
  recognitionLang: "Recognition language",

  uploadTitle: "Or upload an audio file",
  uploadHint: "MP3, M4A, WAV, OGG · up to 4 MB · for anyone who cannot speak",
  uploadChoose: "Choose a file",
  uploadDrop: "Drop it here",
  uploadWorking: "Listening to the audio…",
  uploadTooBig: "That file is over 4 MB. Choose a smaller one.",
  uploadNoEngineTitle: "We couldn't transcribe this audio",
  uploadNoEngineBody:
    "Without a transcription key, Kaan can only recognise the bundled demo notes. Paste the text below and the check works exactly the same.",
  uploadMatched: "Recognised a bundled note",
  uploadTranscribed: "Transcribed",
  uploadFailed: "Upload failed. Try again.",
  uploadKeyOn: "Whisper on",
  uploadKeyOff: "keyless · demo notes only",

  composerLabel: "Or type / paste the note",
  composerPlaceholder: "Paste the forwarded note here…",
  words: (n: number) => `${n} words`,
  langHint: "Hindi, Hinglish or English",
  checkBtn: "Check it",

  errorEmpty: "Add a note first — type it, speak it, or upload a file.",
  errorGeneric: "Something went wrong — try again.",

  checkingTitle: "Checking…",
  checkingSub: "Checking the note against verified sources",
  checkingSteps: [
    "Listening to the note",
    "Finding the one checkable claim",
    "Checking verified sources",
  ],

  back: "New note",
  verdictSubUnverified:
    "No source found, so we did not call it true or false — no verdict without a source.",
  verdictSubVerified:
    "One claim found, matched to a verified source, answered in your language.",
  claimEyebrow: "One claim found",
  whatsapp: "Send on WhatsApp",
  audioBtn: "Audio",
  copyBtn: "Copy verdict",
  copiedBtn: "Copied ✓",
  footnote:
    "The answer is audio so it can go back into the same group it came from. Voice is the delivery format, not a feature.",
  sourcesTitle: "Sources",
  noSources:
    "No verified source found. That is why Kaan did not call it true or false — no verdict without a source.",
  transcriptTitle: "Note transcript",
  transcriptSummary: "Show full transcript",
  metaEngine: "Engine",
  metaMatch: "Match",
  metaChecked: "Checked",
  metaTime: "Time",
  registries: (n: number) => `${n} registries`,
  newCheck: "Check a new note",
  engineLlm: "AI extraction",
  engineLocal: "Local matcher",
  audioLabel: "Hear the verdict",
  audioPlayAria: "Play verdict",
  audioPauseAria: "Pause verdict",
  audioWarn:
    "This device has no voice for this language — the verdict text is above.",
  footer: (n: number) =>
    `Kaan · Round 2 build · ${n} curated verified claims · audio bundled, no API key required`,
};

export type Copy = typeof hi;

export const COPY: Record<Lang, Copy> = { hi, en };

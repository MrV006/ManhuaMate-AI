
import { GoogleGenAI, Type } from "@google/genai";
import { TranslationType, ToneType, TranslationItem, ProjectSettings, ManhuaGenre } from "../types";

/**
 * Converts a File object to a Base64 string.
 */
const fileToGenerativePart = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const getGenrePrompt = (genre: ManhuaGenre): string => {
  switch (genre) {
    case ManhuaGenre.WUXIA:
      return `
      GENRE: Murim / Wuxia (Martial Arts World).
      CONTEXT: A world of martial artists, sects, and clans.
      RULES:
      1. TONE: Use archaic/period-appropriate Persian.
         - "Master" -> "استاد" or "ارباب"
         - "Brother/Sister" (in sect) -> "برادر ارشد/خواهر ارشد" (Not داداش/آبجی)
         - "Courting Death" -> "دنبال مرگ می‌گردی" or "از جونت سیر شدی"
      2. HIERARCHY: Strict respect. Juniors uses "Shoma" (Plural) for Seniors.
      `;
    case ManhuaGenre.ROYAL:
      return `
      GENRE: Royal Court / Historical Palace.
      CONTEXT: Emperors, Concubines, Eunuchs, Generals.
      RULES:
      1. TONE: Highly Formal and Flowery.
         - "I" (Emperor) -> "ما" (Royal We) or "این پادشاه"
         - "I" (Subject) -> "این بنده" or "این حقیر"
         - "Your Majesty" -> "اعلی‌حضرت"
      2. GRAMMAR: Verbs must be plural for anyone of higher rank.
      `;
    case ManhuaGenre.XIANXIA:
      return `
      GENRE: Xianxia (Cultivation/Immortality).
      CONTEXT: Flying swords, demons, gods, defying heavens.
      RULES:
      1. TERMS:
         - "Dao" -> "دائو"
         - "Cultivator" -> "تهذیب‌گر"
         - "Tribulation" -> "عذاب آسمانی"
      2. TONE: Epic and grandiose.
      `;
    case ManhuaGenre.SYSTEM:
      return `
      GENRE: System / Dungeon / Hunter / Leveling.
      CONTEXT: Modern world with video game mechanics.
      RULES:
      1. SYSTEM MESSAGES: Must be robotic, dry, and precise.
         - "You have leveled up." -> "شما ارتقای سطح پیدا کردید."
         - "Quest Accepted" -> "ماموریت پذیرفته شد"
      2. TERMS: Do NOT translate "Hunter" to "شکارچی" if it refers to the job class, use "هانتر" or "شکارچی" consistently based on glossary.
      3. SLANG: The protagonist usually speaks very casually/cool.
      `;
    case ManhuaGenre.URBAN_CULTIVATION:
      return `
      GENRE: Urban Cultivation (Modern City + Magic/Martial Arts).
      CONTEXT: A powerful master reborn in modern city, or hidden masters in society.
      RULES:
      1. CONTRAST: The MC often speaks with arrogance/ancient wisdom, while others speak modern slang.
      2. INSULTS: Rich young masters use arrogant slang.
      `;
    case ManhuaGenre.SCHOOL:
      return `
      GENRE: School Life / Delinquents / Bullying.
      CONTEXT: High schoolers, gangs, fighting.
      RULES:
      1. TONE: Extremely informal, aggressive, and slang-heavy.
      2. SWEARING: Use appropriate Persian street slang for insults (but keep it publishable if possible, or use standard insults like "عوضی", "کثافت").
      3. NO BOOKISH LANGUAGE: No one says "آیا تو..." in a fight. They say "داری چه غلطی میکنی؟".
      `;
    case ManhuaGenre.MODERN:
      return `
      GENRE: Modern Slice of Life.
      RULES:
      1. TONE: Natural, conversational Persian.
      2. LOANWORDS: OK, Thanks, Bye are acceptable.
      `;
    case ManhuaGenre.ROMANCE:
      return `
      GENRE: Romance / Shoujo.
      RULES:
      1. EMOTION: Prioritize emotional impact over literal accuracy.
      2. INNER THOUGHTS: Poetic and soft.
      `;
    case ManhuaGenre.COMEDY:
      return `
      GENRE: Comedy.
      RULES:
      1. HUMOR: Localize jokes to be funny in Persian.
      `;
    default:
      return "GENRE: General.";
  }
};

export const analyzeManhuaPage = async (file: File, settings: ProjectSettings, userApiKey?: string): Promise<TranslationItem[]> => {
  try {
    // Prioritize User Key, fallback to Env Var
    const apiKey = userApiKey || process.env.API_KEY;
    
    if (!apiKey) {
      throw new Error("API Key is missing. Please set it in settings.");
    }

    // Initialize AI with the selected key
    const ai = new GoogleGenAI({ apiKey });

    const base64Data = await fileToGenerativePart(file);

    const glossaryText = settings.glossary.length > 0 
      ? `\n--- MANDATORY GLOSSARY (OVERRIDE ALL OTHER RULES) ---\nYou MUST use these exact translations:\n${settings.glossary.map(g => `- "${g.term}" -> "${g.translation}"`).join('\n')}`
      : "";

    const prompt = `
      ROLE: You are a professional Manhua/Manhwa translator specializing in Persian localization.
      
      OBJECTIVE: Extract text from the image and translate it into natural, high-quality Persian.

      ${getGenrePrompt(settings.genre)}

      ${glossaryText}

      --- STRICT TRANSLATION RULES (DO NOT FAIL THESE) ---
      1. **NO ROBOTIC PERSIAN**:
         - BAD: "من به تو می‌گویم که بروی." (Robot)
         - GOOD: "بهت میگم بزنی به چاک!" or "میگم برو دیگه." (Natural)
      
      2. **SENTENCE STRUCTURE (SOV)**:
         - Always put verbs at the VERY END of the sentence.
         - Ensure "Ra" (را) follows the object immediately.
      
      3. **GENDER & PRONOUNS**:
         - Persian pronouns are gender-neutral, but verb conjugation depends on context.
         - If the image shows a female speaking, ensure adjectives are appropriate (though Persian adjectives are gender-neutral, the *tone* changes).
      
      4. **SFX (Sound Effects)**:
         - Translate the SOUND, not the word meaning.
         - "Bang" -> "بنگ!"
         - "Crack" -> "ترق!" (Not "شکستن")
         - "Swish" -> "ویژژژ!"
      
      5. **COMMON MISTAKES TO AVOID**:
         - Do NOT translate proper nouns (Names) literally unless they are titles.
         - Do NOT translate "Brother" literally in a romantic context; use the name or "اوپا/داداشی" depending on the vibe.
         - Do NOT translate "Imperial Decree" as simple order, use "فرمان امپراتور".
         - Do NOT use English punctuations. Use Persian commas (،) and question marks (؟).

      --- OUTPUT FORMAT ---
      Return a JSON array of objects. Detect bubbles top-down, right-to-left.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: file.type,
              data: base64Data
            }
          },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.INTEGER, description: "Unique ID starting from 1" },
              originalText: { type: Type.STRING, description: "Original text detected" },
              translatedText: { type: Type.STRING, description: "Persian translation" },
              type: { 
                type: Type.STRING, 
                enum: [TranslationType.BUBBLE, TranslationType.THOUGHT, TranslationType.SFX, TranslationType.NARRATION, TranslationType.OTHER]
              },
              tone: {
                type: Type.STRING,
                enum: [ToneType.CASUAL, ToneType.FORMAL, ToneType.ANGRY, ToneType.SCARED]
              },
              notes: { type: Type.STRING, description: "Translator note: why this tone/word was chosen." }
            },
            required: ["id", "originalText", "translatedText", "type", "tone"]
          }
        }
      }
    });

    if (response.text) {
      const data = JSON.parse(response.text) as TranslationItem[];
      return data;
    }
    
    return [];
  } catch (error) {
    console.error("Error analyzing manhua page:", error);
    throw error;
  }
};

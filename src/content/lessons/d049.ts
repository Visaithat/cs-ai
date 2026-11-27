import { defineLesson, mc, rc } from "./builder";
import type { Lesson } from "../types";

/**
 * D049 — Phase 2 / Block B13
 * Text Features (TF-IDF) & Thai Word Segmentation (PyThaiNLP newmm)
 */
export const d049: Lesson = defineLesson({
  day: 49,
  titleTh: "สกัดฟีเจอร์ข้อความด้วย TF-IDF และการตัดคำภาษาไทยด้วย PyThaiNLP (newmm)",
  tagline: "30 นาที · แก้ช่องว่างสำคัญของ AI ภาษาไทย: ตัดคำด้วย newmm + Custom Dict ก่อนเข้า TF-IDF",
  icon: "scissors",
  visual: {
    id: "thai-tokenize",
    title: "ทำไม Whitespace Split พังกับภาษาไทย vs PyThaiNLP newmm",
    caption: "กดสลับวิธีตัดคำเพื่อดูความต่างของคำที่สร้างเป็นฟีเจอร์ TF-IDF สำหรับข้อความภาษาไทย",
    alt: "แผนภาพเปรียบเทียบการแบ่งคำด้วยช่องว่างกับการตัดคำด้วย PyThaiNLP newmm",
  },
  requiresApiKey: false,
  tools: ["PyThaiNLP", "scikit-learn", "uv", "pytest"],

  bigPicture: [
    {
      node: 0,
      heading: "รับมือปัญหาเฉพาะทางของภาษาไทย",
      body: "ตำรา NLP และไลบรารีมาตรฐานส่วนใหญ่สร้างบนสมมติฐานของภาษาอังกฤษที่เว้นวรรคระหว่างคำ แต่ข้อความทิกเก็ตและเอกสารองค์กรไทยเขียนติดกันยาว ๆ แถมปนศัพท์อังกฤษ (code-switching)",
      lessonNote: "วันนี้เราปิดจุดอ่อนแรกของระบบ AI ภาษาไทย: การตัดคำให้ถูกต้องก่อนสกัดฟีเจอร์ข้อความ",
    },
    {
      node: 1,
      heading: "ตัดคำและแปลงข้อความเป็นเมทริกซ์ตัวเลข",
      body: "โมเดล ML อ่านสตริงตรง ๆ ไม่ได้ ต้องแปลงข้อความเป็นเวกเตอร์ตัวเลขก่อน — หาก tokenizer แตกคำไทยไม่ออก ฟีเจอร์ทั้งหมดจะใช้การไม่ได้ตั้งแต่ต้นทาง",
      lessonNote: "ใช้ {{pythainlp}} (`engine=\"newmm\"`) + custom dictionary ส่งเข้า `TfidfVectorizer` ของ scikit-learn เพื่อสร้างฟีเจอร์ {{tfidf}} ที่สะอาดและแม่นยำ",
    },
    {
      node: 2,
      heading: "ปูทางสู่ทั้ง Classical ML และ Thai Hybrid RAG",
      body: "เทคนิคตัดคำเดียวกันนี้ใช้ได้ทั้งสองโลก: พรุ่งนี้ (Day 50) เราจะสร้างตัวจัดหมวดข้อความความเร็ว <10ms ด้วย TF-IDF + Logistic Regression และใน Phase 4 จะใช้ตัดคำก่อนทำ {{bm25}} ใน {{rag}}",
      lessonNote: "ลงทุนทำความเข้าใจ Thai tokenizer + custom dictionary วันนี้ครั้งเดียว ใช้ซ้ำได้ยาวจนถึง Capstone",
    },
    {
      node: 3,
      heading: "วัดคุณภาพคำศัพท์และกัน Data Leakage",
      body: "คำศัพท์ที่ vectorizer เรียนรู้ (vocabulary) และค่า IDF ต้องถูก `fit` เฉพาะบนข้อมูลชุด Train เท่านั้น ห้ามให้สถิติจากชุด Test รั่วเข้ามา",
      lessonNote: "ตรวจสอบ vocabulary ด้วย {{pytest}} และแยก `fit_transform` (train) กับ `transform` (test) อย่างเคร่งครัดเพื่อกัน {{data-leakage}}",
    },
  ],

  objectives: [
    "**อธิบายสาเหตุ** ที่ default tokenizer ของ `TfidfVectorizer` (แบ่งตามช่องว่าง/regex ภาษาอังกฤษ) พังเมื่อเจอข้อความภาษาไทย",
    "**ใช้ PyThaiNLP `word_tokenize(..., engine=\"newmm\")`** ร่วมกับ **custom dictionary (`dict_trie`)** เพื่อตัดคำไทยและคำศัพท์เฉพาะองค์กร/code-switching ได้ถูกต้อง",
    "**เชื่อมต่อ Thai tokenizer เข้ากับ `TfidfVectorizer`** อย่างถูกวิธี (`token_pattern=None`, `lowercase=False` พร้อมจัดการ case เอง) โดยไม่เกิด {{data-leakage}}",
  ],

  prerequisites: [
    "เข้าใจแนวคิด Train/Test split และการป้องกัน {{data-leakage}} จาก Block B11",
    "เข้าใจเวกเตอร์และการเปรียบเทียบความคล้ายจาก Block B10",
    "ใช้ `uv` และ `pytest` จาก Phase 1 ได้คล่อง",
    "รันบนเครื่องได้ 100% ไม่ต้องใช้ API key หรือ GPU",
  ],

  setup: {
    intro:
      "สร้างโปรเจกต์ใหม่ด้วย `uv` แล้วติดตั้ง `pythainlp` และ `scikit-learn` (ใช้ `newmm` ซึ่งเป็น dictionary-based tokenizer จึงเบาและรันบน CPU ได้เร็วมาก)",
    commands: `uv init ai-day49 && cd ai-day49
uv add pythainlp scikit-learn
uv add --dev pytest ruff
uv run python -c "from pythainlp.tokenize import word_tokenize; print(word_tokenize('ขอใบกำกับภาษี', engine='newmm'))"`,
    steps: [
      ["init", "สร้างโฟลเดอร์ `ai-day49` ด้วย `uv init`"],
      ["deps", "ติดตั้ง `pythainlp`, `scikit-learn`, `pytest`, `ruff` สำเร็จ"],
      ["verify", "รันคำสั่งทดสอบแล้วเห็นผลลัพธ์ `['ขอ', 'ใบกำกับภาษี']`"],
    ],
    note: "`newmm` ใช้พจนานุกรมในตัวของ PyThaiNLP ไม่ต้องดาวน์โหลดโมเดล Deep Learning ขนาดใหญ่ จึงพร้อมรันทันทีแม้ไม่มีอินเทอร์เน็ตหลังติดตั้ง",
  },

  concepts: [
    {
      id: "why-whitespace-fails-thai",
      title: "1 · ทำไม Whitespace Split ถึงพังทันทีเมื่อเจอภาษาไทย",
      paragraphs: [
        "ในภาษาอังกฤษเราแยกคำด้วยช่องว่างได้ตรง ๆ เช่น `\"request tax invoice\"` → `[\"request\", \"tax\", \"invoice\"]` แต่ภาษาไทย **ไม่เว้นวรรคระหว่างคำ** (เว้นวรรคเพื่อแบ่งประโยคหรือวลีเท่านั้น)",
        "ถ้าคุณโยนประโยค *\"ลูกค้าขอใบกำกับภาษีซ้ำ\"* กับ *\"ต้องการใบกำกับภาษีครับ\"* เข้า `TfidfVectorizer()` แบบค่าเริ่มต้น (default) ที่แยกคำด้วย regex `(?u)\\b\\w\\w+\\b` ทั้งประโยคจะถูกมองเป็นคำยักษ์เพียง 1 คำ ทำให้สองประโยคนี้ **ไม่มีคำซ้ำกันเลย (similarity = 0.0)** ทั้งที่พูดเรื่องเดียวกันเป๊ะ!",
        "นี่คือเหตุผลที่นักพัฒนาที่เอา tutorial ภาษาอังกฤษมาใช้ตรง ๆ กับข้อมูลไทยมักพบว่าโมเดล TF-IDF หรือ {{bm25}} ค้นหาไม่เจอคำสำคัญ",
      ],
      analogy:
        "เหมือนเอาประโยคภาษาอังกฤษที่ลบช่องว่างออกหมด (`customerrequeststaxinvoice`) ไปค้นหาด้วยคำว่า `tax` — ระบบหาไม่เจอเพราะมันมองทั้งบรรทัดเป็นคำเดียว",
      code: {
        language: "python",
        filename: "whitespace_vs_newmm.py",
        code: `from sklearn.feature_extraction.text import TfidfVectorizer
from pythainlp.tokenize import word_tokenize

docs = [
    "ลูกค้าขอใบกำกับภาษีซ้ำ",
    "ต้องการใบกำกับภาษีครับ",
]

# 1) Default TfidfVectorizer (พังกับภาษาไทย)
bad_vec = TfidfVectorizer()
bad_vec.fit(docs)
print("Default vocab:", bad_vec.get_feature_names_out().tolist())

# 2) PyThaiNLP newmm (ตัดคำได้ตรงความหมาย)
print("newmm doc 1:", word_tokenize(docs[0], engine="newmm", keep_whitespace=False))
print("newmm doc 2:", word_tokenize(docs[1], engine="newmm", keep_whitespace=False))`,
        caption: "Default vocab มองทั้งประโยคเป็น token เดียว แต่ newmm แยกคำสำคัญอย่าง 'ใบกำกับภาษี' ออกมาใช้ร่วมกันได้",
      },
      whyTitle: "Why this matters — ช่องว่างภาษาไทยที่ส่งผลทั้ง ML และ RAG",
      whyParagraphs: [
        "ปัญหา No Word Boundaries ไม่ได้เกิดแค่กับ {{tfidf}} ใน Phase 2 แต่จะตามไปหลอกหลอนใน Phase 4 ตอนทำ Thai Lexical Search ({{bm25}}) ด้วย หากคุณไม่ตัดคำก่อน ระบบ Hybrid RAG จะพึ่งพาได้แค่ dense {{embedding}} เพียงขาเดียวและพลาดรหัสสินค้า/ศัพท์เฉพาะทางบ่อยครั้ง",
        "การแก้ที่ tokenizer ตั้งแต่ต้นทางจึงเป็นทักษะที่แยก AI Engineer ที่ทำงานกับข้อมูลไทยจริงออกจากคนที่รันแค่ตัวอย่างภาษาอังกฤษ",
      ],
    },
    {
      id: "pythainlp-newmm-custom-dict",
      title: "2 · PyThaiNLP `newmm` และ Custom Dictionary สำหรับศัพท์เฉพาะองค์กร",
      paragraphs: [
        "{{pythainlp}} มีเอนจินตัดคำหลายตัว แต่ค่าเริ่มต้นที่แนะนำสำหรับ Production คือ **`engine=\"newmm\"`** (Maximum Matching แบบ dictionary-based) เพราะเร็วมาก (หลักหมื่นประโยคต่อวินาทีบน CPU), ใช้ RAM น้อย, และให้ผลคงที่ (deterministic)",
        "ข้อจำกัดของพจนานุกรมมาตรฐานคือมักไม่รู้จัก **ชื่อสินค้า แบรนด์ หรือศัพท์เฉพาะองค์กร** เช่น `\"พร้อมเพย์\"`, `\"แฟลชเอ็กซ์เพรส\"` หรือชื่อฟีเจอร์ภายใน จนอาจหั่นออกเป็นคำย่อยที่เสียความหมาย (เช่น `['พร้อม', 'เพย์']`)",
        "ทางแก้ที่สะอาดมากคือรวมพจนานุกรมมาตรฐาน `thai_words()` เข้ากับชุดศัพท์เฉพาะของทีมด้วย `dict_trie(...)` แล้วส่งเข้าพารามิเตอร์ `custom_dict=...` ของ `word_tokenize`",
      ],
      analogy:
        "เหมือนแจกพจนานุกรมศัพท์บริษัทเพิ่มเติมให้พนักงานใหม่ — พอเจอคำว่า 'พร้อมเพย์' หรือ 'ใบลดหนี้' จะอ่านเป็นคำเดียวทันที ไม่หั่นแยกมั่ว",
      bullets: [
        "ส่ง `keep_whitespace=False` เสมอเพื่อไม่ให้ช่องว่างเปล่า ๆ กลายเป็น token",
        "สร้าง `Trie` ด้วย `dict_trie(set(thai_words()) | domain_words)` เพียงครั้งเดียวตอนเริ่มโปรแกรม แล้วนำกลับมาใช้ซ้ำทุกประโยค (อย่าสร้างใหม่ในลูป!)",
        "สำหรับข้อความไทยปนอังกฤษ (code-switching) เช่น *\"ชำระผ่าน PromptPay ไม่ได้\"* ให้ทำ `.lower()` บน token ภาษาอังกฤษด้วย เพื่อให้ `PromptPay` และ `promptpay` เป็นคำเดียวกัน",
      ],
      code: {
        language: "python",
        filename: "custom_dict_demo.py",
        code: `from pythainlp.corpus.common import thai_words
from pythainlp.tokenize import word_tokenize
from pythainlp.util import dict_trie

DOMAIN_TERMS = {"พร้อมเพย์", "ใบลดหนี้", "แฟลชเอ็กซ์เพรส"}
CUSTOM_DICT = dict_trie(set(thai_words()) | DOMAIN_TERMS)

text = "โอนผ่านพร้อมเพย์แล้ว ขอใบลดหนี้ผ่าน PromptPay ด้วยครับ"
tokens = word_tokenize(text, engine="newmm", custom_dict=CUSTOM_DICT, keep_whitespace=False)
clean_tokens = [t.lower() for t in tokens if t.strip()]
print(clean_tokens)`,
        caption: "สร้าง `CUSTOM_DICT` ไว้ระดับโมดูลครั้งเดียวเพื่อความเร็วในการตัดคำ",
      },
      whyTitle: "Why this matters — ความเร็วระดับมิลลิวินาที vs โมเดลตัดคำขนาดใหญ่",
      whyParagraphs: [
        "แม้จะมีโมเดลตัดคำแบบ neural (เช่น `attacut` หรือ `deepcut`) ที่บางครั้งจัดการคำกำกวมได้ละเอียดกว่า แต่ใช้เวลาและหน่วยความจำมากกว่า `newmm` หลายสิบเท่า",
        "สำหรับงาน TF-IDF classification และ BM25 search การใช้ `newmm` + custom dictionary 20–50 คำของโดเมนมักให้ความแม่นยำใกล้เคียงกันมาก ในขณะที่คุม inference latency ให้ต่ำกว่า 10ms ได้สบาย",
      ],
    },
    {
      id: "tfidf-intuition-and-sklearn",
      title: "3 · สัญชาตญาณ TF-IDF และการผูกเข้ากับ `TfidfVectorizer` อย่างปลอดภัย",
      paragraphs: [
        "**{{tfidf}}** (Term Frequency–Inverse Document Frequency) คิดคะแนนน้ำหนักให้แต่ละคำในเอกสารจาก 2 ปัจจัยคูณกัน: **TF** (คำนี้โผล่บ่อยแค่ไหนในเอกสารนี้) × **IDF** (คำนี้หายากแค่ไหนในคลังเอกสารทั้งหมด)",
        "ผลลัพธ์ที่ได้ฉลาดมาก: คำลงท้ายหรือคำทั่วไปที่โผล่แทบทุกทิกเก็ตอย่าง `\"ครับ\"`, `\"ค่ะ\"`, `\"ของ\"` จะมีค่า IDF ต่ำมากจนแทบไม่มีอิทธิพล ส่วนคำเฉพาะเจาะจงอย่าง `\"ใบกำกับภาษี\"` หรือ `\"พร้อมเพย์\"` จะได้น้ำหนักสูงเด่นขึ้นมาทันที",
        "เมื่อเสียบฟังก์ชันตัดคำไทยเข้า `TfidfVectorizer(tokenizer=thai_tokenizer, token_pattern=None, lowercase=False)` อย่าลืมสองกฎเหล็ก: (1) ใส่ `token_pattern=None` เพื่อปิด regex ภาษาอังกฤษและลบ warning และ (2) เรียก `.fit_transform(X_train)` เฉพาะชุด Train แล้วใช้ `.transform(X_test)` กับชุด Test เสมอเพื่อป้องกัน {{data-leakage}}",
      ],
      analogy:
        "เหมือนการคัดเอกสารบนโต๊ะ: คำว่า 'เรียนลูกค้า' โผล่ทุกฉบับจึงแยกประเภทไม่ได้ (IDF ต่ำ) แต่คำว่า 'ใบกำกับภาษี' โผล่เฉพาะแฟ้มบัญชีจึงเป็นสัญญาณทอง (TF-IDF สูง)",
      bullets: [
        "`ngram_range=(1, 2)` ช่วยจับคำคู่ (bigram) เช่น `\"ขอ ใบกำกับภาษี\"` หรือ `\"โอน เงิน\"` เพิ่มบริบทได้โดยไม่เสียความเร็วมาก",
        "`min_df=2` (ในชุดข้อมูลใหญ่) ช่วยตัดคำพิมพ์ผิดที่โผล่แค่ครั้งเดียวทิ้ง ลดขนาดเมทริกซ์",
        "`TfidfVectorizer` คืนค่าเป็น **sparse matrix** (เก็บเฉพาะช่องที่ไม่ใช่ศูนย์) และทำ **L2 normalization** ให้แต่ละแถวโดยอัตโนมัติ (จำ Day 38 ได้ไหม?)",
      ],
      whyTitle: "Why this matters — เชื่อมโยงทั้ง Day 38, Day 50 และ Phase 4",
      whyParagraphs: [
        "เพราะ `TfidfVectorizer` ทำ L2 normalization ให้ทุกเวกเตอร์เอกสารอยู่แล้ว คุณจึงเอาเมทริกซ์ TF-IDF มาคูณกัน (`X @ q.T`) เพื่อหา Cosine Similarity ของข้อความภาษาไทยได้ทันที!",
        "และในวันพรุ่งนี้ (Day 50) เราจะนำ `TfidfVectorizer` ตัวนี้ไปต่อกับ `LogisticRegression` ใน `Pipeline` เพื่อสร้างตัวจัดหมวดหมู่ทิกเก็ตภาษาไทยที่เทรนเสร็จในไม่กี่วินาทีและรันจริงได้เร็วกว่า LLM หลายร้อยเท่า",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — เทียบ Thai Tokenizer + TF-IDF กับ Full-Text Search",
      body: [
        "ถ้าคุณเคยทำช่องค้นหาในเว็บแอปด้วย PostgreSQL Full-Text Search หรือ Elasticsearch คุณอาจเคยเห็นปัญหาค้นคำไทยไม่เจอเพราะ analyzer ไม่ตัดคำไทย — PyThaiNLP + TF-IDF คือหลักการเดียวกันเป๊ะ:",
      ],
      table: [
        ["PyThaiNLP word_tokenize(..., 'newmm')", "Thai Analyzer / ICU Tokenizer ก่อนสร้าง index"],
        ["dict_trie(thai_words() | domain)", "Custom dictionary / userdict สำหรับชื่อสินค้า"],
        ["TfidfVectorizer.fit(train)", "สร้าง Inverted Index + คำนวณน้ำหนักคำ (IDF)"],
        ["TfidfVectorizer.transform(new_text)", "แปลงข้อความคำถามใหม่ด้วยพจนานุกรมเดิมโดยไม่แก้ index"],
      ],
    },
    student: {
      title: "First-Year Note — Sparse Matrix และ Vocabulary คืออะไร",
      body: [
        "สมมติคลังทิกเก็ตมีคำศัพท์ไม่ซ้ำกันทั้งหมด 5,000 คำ (`vocabulary`) แต่ทิกเก็ต 1 ใบมีแค่ 10 คำ แปลว่าในเวกเตอร์ยาว 5,000 ช่องจะมีเลขศูนย์ถึง 4,990 ช่อง!",
        "แทนที่จะเก็บเลขศูนย์เกือบทั้งหมดให้เปลือง RAM `scikit-learn` จะเก็บเป็น **Sparse Matrix** ซึ่งบันทึกเฉพาะตำแหน่ง `(แถว, คอลัมน์)` ที่มีค่ามากกว่า 0 เท่านั้น — ถ้าอยากดูเป็น NumPy array ปกติเพื่อดีบักกับชุดข้อมูลเล็ก ๆ ให้เรียก `.toarray()`",
        "คำว่า **Token** ในบทนี้หมายถึง 'คำ' ที่ถูกตัดออกมาจากประโยค (ต่างจาก BPE subword token ของ LLM ที่จะได้เรียนใน Day 66)",
      ],
    },
  },

  workedExample: {
    intro:
      "สถานการณ์: เรามีทิกเก็ตลูกค้า 4 ข้อความที่พูดเรื่องใบกำกับภาษี การชำระเงิน และการจัดส่ง มาดูว่าการใช้ `PyThaiNLP newmm` + custom dictionary ร่วมกับ `TfidfVectorizer` ช่วยให้คะแนนความสำคัญของคำและ Cosine Similarity แม่นขึ้นอย่างไร",
    steps: [
      {
        title: "1 · สร้าง Thai Tokenizer พร้อม Custom Dictionary และกรอง Stopwords",
        explain:
          "รวมพจนานุกรมมาตรฐานกับศัพท์เฉพาะ (`พร้อมเพย์`, `ใบกำกับภาษี`), ตัดคำด้วย `newmm`, แปลงคำอังกฤษเป็นตัวพิมพ์เล็ก และตัดคำลงท้ายที่ไม่มีความหมายเชิงหมวดหมู่ออก",
        code: {
          language: "python",
          filename: "worked_thai_tfidf.py",
          code: `from pythainlp.corpus.common import thai_words
from pythainlp.tokenize import word_tokenize
from pythainlp.util import dict_trie

DOMAIN_WORDS = {"พร้อมเพย์", "ใบกำกับภาษี", "เลขพัสดุ"}
CUSTOM_DICT = dict_trie(set(thai_words()) | DOMAIN_WORDS)
STOPWORDS = {"ครับ", "ค่ะ", "คะ", "หน่อย", "ด้วย", "แล้ว", "และ"}


def thai_tokenize(text: str) -> list[str]:
    tokens = word_tokenize(
        text,
        engine="newmm",
        custom_dict=CUSTOM_DICT,
        keep_whitespace=False,
    )
    return [
        t.lower()
        for t in tokens
        if t.strip() and t.lower() not in STOPWORDS
    ]


print(thai_tokenize("ขอใบกำกับภาษีที่โอนผ่านพร้อมเพย์ PromptPay ครับ"))`,
        },
        output: `['ขอ', 'ใบกำกับภาษี', 'ที่', 'โอน', 'ผ่าน', 'พร้อมเพย์', 'promptpay']`,
      },
      {
        title: "2 · Fit `TfidfVectorizer` บนชุด Train และตรวจคำที่มีน้ำหนักสูงสุด",
        explain:
          "ส่ง `thai_tokenize` เข้า `TfidfVectorizer` โดยตั้ง `token_pattern=None` และ `lowercase=False` (เพราะเราทำ `.lower()` ใน tokenizer แล้ว) จากนั้นดูคำที่เด่นที่สุดในแต่ละเอกสาร",
        code: {
          language: "python",
          filename: "worked_thai_tfidf.py",
          code: `from sklearn.feature_extraction.text import TfidfVectorizer

train_docs = [
    "ลูกค้าขอใบกำกับภาษีซ้ำครับ",
    "โอนเงินผ่านพร้อมเพย์แล้วแต่ยอดไม่เข้า",
    "ขอเลขพัสดุหน่อยค่ะ ของยังไม่ถึง",
]

vec = TfidfVectorizer(
    tokenizer=thai_tokenize,
    token_pattern=None,
    lowercase=False,
)
X_train = vec.fit_transform(train_docs)
feature_names = vec.get_feature_names_out()

for i, doc in enumerate(train_docs):
    row = X_train[i].toarray()[0]
    top_idx = row.argsort()[::-1][:3]
    top_terms = [(feature_names[j], round(float(row[j]), 3)) for j in top_idx if row[j] > 0]
    print(f"Doc {i}: {top_terms}")`,
        },
        output: `Doc 0: [('ใบกำกับภาษี', 0.529), ('ซ้ำ', 0.529), ('ลูกค้า', 0.529)]
Doc 1: [('พร้อมเพย์', 0.408), ('โอน', 0.408), ('เงิน', 0.408)]
Doc 2: [('เลขพัสดุ', 0.428), ('ถึง', 0.428), ('ไม่', 0.428)]`,
      },
      {
        title: "3 · Transform ข้อความใหม่ (Test Query) แล้ววัด Cosine Similarity",
        explain:
          "ใช้ `.transform(...)` (ห้าม `.fit_transform`) กับคำถามใหม่ของลูกค้า แล้วคำนวณความคล้ายกับ `X_train` ด้วย `(X_train @ q.T)` เพราะ TF-IDF ของ scikit-learn เป็น L2-normalized อยู่แล้ว",
        code: {
          language: "python",
          filename: "worked_thai_tfidf.py",
          code: `new_query = ["ต้องการใบกำกับภาษีของบิลล่าสุดค่ะ"]
q_vec = vec.transform(new_query)

scores = (X_train @ q_vec.T).toarray().ravel()
for i, score in enumerate(scores):
    print(f"vs Doc {i} -> similarity = {score:.4f} | {train_docs[i]}")`,
        },
        output: `vs Doc 0 -> similarity = 0.5286 | ลูกค้าขอใบกำกับภาษีซ้ำครับ
vs Doc 1 -> similarity = 0.0000 | โอนเงินผ่านพร้อมเพย์แล้วแต่ยอดไม่เข้า
vs Doc 2 -> similarity = 0.0000 | ขอเลขพัสดุหน่อยค่ะ ของยังไม่ถึง`,
      },
    ],
    gotcha:
      "จุดสังเกต: ถ้าคำใน `new_query` ไม่เคยปรากฏใน `train_docs` เลย (Out-of-Vocabulary หรือ OOV) `.transform()` จะข้ามคำนั้นไปเงียบ ๆ และอาจได้เวกเตอร์ศูนย์ — นี่คือข้อจำกัดของ lexical search ที่เราจะแก้ด้วย Hybrid Search (BM25 + Dense Embeddings) ใน Phase 4",
  },

  practice: {
    intro:
      "โจทย์ (12 นาที): สร้างคลาสหรือชุดฟังก์ชันสำหรับตัดคำภาษาไทยและแปลงเป็น TF-IDF ที่รองรับศัพท์เฉพาะองค์กร (Custom Dictionary), code-switching ไทย-อังกฤษ และวัดผลเทียบกับ default tokenizer ได้จริง",
    requirements: [
      "`make_thai_tokenizer(custom_words: set[str] | None = None, stopwords: set[str] | None = None)`: คืนฟังก์ชัน `Callable[[str], list[str]]` ที่สร้าง `dict_trie(set(thai_words()) | (custom_words or set()))` ไว้ครั้งเดียวตอนสร้าง (closure) แล้วใช้ `word_tokenize(..., engine=\"newmm\", custom_dict=..., keep_whitespace=False)`",
      "tokenizer ที่คืนออกมาต้องแปลง token ภาษาอังกฤษเป็นตัวพิมพ์เล็ก (`t.lower()`), ตัด token ช่องว่างล้วน และกรองคำที่อยู่ใน `stopwords` ออก",
      "`build_thai_tfidf(custom_words: set[str] | None = None, stopwords: set[str] | None = None) -> TfidfVectorizer`: คืน `TfidfVectorizer` ที่ผูก `tokenizer` ด้านบนพร้อมตั้ง `token_pattern=None` และ `lowercase=False` (ไม่มี UserWarning)",
      "`top_match_index(vectorizer: TfidfVectorizer, train_matrix, query: str) -> tuple[int, float]`: ใช้ `vectorizer.transform([query])` (ไม่ fit ซ้ำ!) แล้วคำนวณ Cosine Similarity กับ `train_matrix` คืน `(best_doc_index, best_score)`",
    ],
    starter: {
      language: "python",
      filename: "exercise_day49.py",
      code: `from collections.abc import Callable
from pythainlp.corpus.common import thai_words
from pythainlp.tokenize import word_tokenize
from pythainlp.util import dict_trie
from sklearn.feature_extraction.text import TfidfVectorizer


def make_thai_tokenizer(
    custom_words: set[str] | None = None,
    stopwords: set[str] | None = None,
) -> Callable[[str], list[str]]:
    """สร้างฟังก์ชันตัดคำไทยด้วย newmm + custom dict ที่สร้าง Trie เพียงครั้งเดียว"""
    # TODO: สร้าง custom_dict และ normalized_stopwords แล้วคืนฟังก์ชัน tokenize(text)
    raise NotImplementedError


def build_thai_tfidf(
    custom_words: set[str] | None = None,
    stopwords: set[str] | None = None,
) -> TfidfVectorizer:
    """สร้าง TfidfVectorizer ที่พร้อมใช้งานกับข้อความไทยปนอังกฤษ"""
    # TODO: ผูก tokenizer, ตั้ง token_pattern=None, lowercase=False
    raise NotImplementedError


def top_match_index(
    vectorizer: TfidfVectorizer,
    train_matrix,
    query: str,
) -> tuple[int, float]:
    """คืน (index, cosine_similarity) ของเอกสารที่ใกล้ query ที่สุด"""
    # TODO: transform([query]) แล้วคำนวณ (train_matrix @ q.T)
    raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "test_day49.py",
      code: `import warnings
import pytest
from exercise_day49 import build_thai_tfidf, make_thai_tokenizer, top_match_index


def test_custom_dict_and_stopwords_and_case():
    tok = make_thai_tokenizer(
        custom_words={"พร้อมเพย์", "ใบกำกับภาษี"},
        stopwords={"ครับ", "ค่ะ"},
    )
    tokens = tok("ขอใบกำกับภาษีที่จ่ายด้วยพร้อมเพย์ PromptPay ครับ")
    assert "ใบกำกับภาษี" in tokens
    assert "พร้อมเพย์" in tokens
    assert "promptpay" in tokens
    assert "ครับ" not in tokens


def test_tfidf_no_warning_and_matches_thai_query():
    train_docs = [
        "ลูกค้าขอใบกำกับภาษีเต็มรูปแบบครับ",
        "โอนผ่านพร้อมเพย์แล้วระบบไม่ตัดยอด",
        "ขอเช็กสถานะเลขพัสดุหน่อยค่ะ",
    ]
    with warnings.catch_warnings(record=True) as caught:
        warnings.simplefilter("always")
        vec = build_thai_tfidf(
            custom_words={"พร้อมเพย์", "ใบกำกับภาษี", "เลขพัสดุ"},
            stopwords={"ครับ", "ค่ะ"},
        )
        X_train = vec.fit_transform(train_docs)
    assert len(caught) == 0

    best_idx, best_score = top_match_index(vec, X_train, "ออกใบกำกับภาษีให้หน่อย")
    assert best_idx == 0
    assert best_score > 0.3

    best_idx2, best_score2 = top_match_index(vec, X_train, "จ่ายพร้อมเพย์ไม่สำเร็จ")
    assert best_idx2 == 1
    assert best_score2 > 0.2


def test_default_whitespace_fails_same_query():
    from sklearn.feature_extraction.text import TfidfVectorizer

    train_docs = ["ลูกค้าขอใบกำกับภาษีเต็มรูปแบบครับ"]
    bad_vec = TfidfVectorizer()
    X_bad = bad_vec.fit_transform(train_docs)
    q_bad = bad_vec.transform(["ออกใบกำกับภาษีให้หน่อย"])
    sim = float((X_bad @ q_bad.T).toarray()[0, 0])
    assert sim == pytest.approx(0.0)
`,
    },
    selfCheck: [
      "`make_thai_tokenizer` สร้าง `dict_trie(...)` นอกฟังก์ชันภายใน (ไม่สร้างใหม่ทุกครั้งที่ถูกเรียก)",
      "`build_thai_tfidf` ไม่ปล่อย `UserWarning` เกี่ยวกับ `token_pattern` ตอนเรียก `fit_transform`",
      "คำเฉพาะองค์กรอย่าง `\"พร้อมเพย์\"` และ `\"ใบกำกับภาษี\"` ปรากฏเป็น token เดียวใน `vec.get_feature_names_out()`",
      "คำถามภาษาไทยที่คำไม่เหมือนกันทั้งประโยคยังจับคู่เอกสารที่เกี่ยวข้องได้ (`best_score > 0.2`) ขณะที่ default whitespace tokenizer ได้ `0.0`",
      "รัน `uv run pytest -q` และ `uv run ruff check .` ผ่านทั้งหมด",
    ],
    acceptance: "ผ่านทั้ง 3 test functions ใน `test_day49.py` ด้วย `uv run pytest -q` และผ่าน `uv run ruff check .`",
    hints: [
      {
        body: "ใน `make_thai_tokenizer` ให้เตรียม `trie = dict_trie(set(thai_words()) | (custom_words or set()))` และ `stop = {w.lower() for w in (stopwords or set())}` ไว้นอก `def tokenize(text: str)` เพื่อให้ถูกสร้างแค่ครั้งเดียว",
      },
      {
        body: "ใน `TfidfVectorizer` ต้องระบุ `tokenizer=tok, token_pattern=None, lowercase=False` เพื่อปิด regex แยกคำของภาษาอังกฤษและไม่ให้ scikit-learn พ่น `UserWarning`",
      },
      {
        body: "โครงของ `make_thai_tokenizer` และ `build_thai_tfidf` เกือบครบ — เหลือเติมการหา `best_idx` และ `best_score` ใน `top_match_index`:",
        code: {
          language: "python",
          filename: "hint_day49.py",
          code: `def make_thai_tokenizer(
    custom_words: set[str] | None = None,
    stopwords: set[str] | None = None,
) -> Callable[[str], list[str]]:
    vocab = set(thai_words()) | (custom_words or set())
    trie = dict_trie(vocab)
    stop = {w.lower() for w in (stopwords or set())}

    def tokenize(text: str) -> list[str]:
        tokens = word_tokenize(
            text,
            engine="newmm",
            custom_dict=trie,
            keep_whitespace=False,
        )
        return [
            t.lower()
            for t in tokens
            if t.strip() and t.lower() not in stop
        ]

    return tokenize


def build_thai_tfidf(
    custom_words: set[str] | None = None,
    stopwords: set[str] | None = None,
) -> TfidfVectorizer:
    return TfidfVectorizer(
        tokenizer=make_thai_tokenizer(custom_words, stopwords),
        token_pattern=None,
        lowercase=False,
    )


def top_match_index(vectorizer: TfidfVectorizer, train_matrix, query: str) -> tuple[int, float]:
    q_vec = vectorizer.transform([query])
    scores = (train_matrix @ q_vec.T).toarray().ravel()
    # TODO: หา index ที่คะแนนสูงสุดด้วย int(scores.argmax()) แล้วคืน (best_idx, float(scores[best_idx]))
    raise NotImplementedError`,
        },
      },
    ],
    localRun: {
      language: "bash",
      filename: "terminal",
      code: `uv run pytest -q
uv run ruff check .`,
    },
  },

  mistakes: [
    {
      title: "สร้าง dict_trie(thai_words()) ใหม่ข้างในฟังก์ชัน tokenize ทุกครั้งที่ถูกเรียก",
      symptom: "รันกับเอกสารแค่ 500 แถวแต่ช้าเป็นสิบวินาที ทั้งที่ `newmm` ควรเสร็จในเสี้ยววินาที",
      fix: "สร้าง `dict_trie(...)` เพียงครั้งเดียวตอนเริ่มต้น (ระดับโมดูลหรือใน closure) แล้วนำอ็อบเจกต์ `Trie` เดิมกลับมาใช้ซ้ำทุกเอกสาร",
    },
    {
      title: "ลืมใส่ token_pattern=None ใน TfidfVectorizer",
      symptom: "เกิด `UserWarning: The parameter 'token_pattern' will not be used since 'tokenizer' is not None` รก log และบางทีมตั้ง CI ให้ fail เมื่อมี warning",
      fix: "ใส่ `token_pattern=None` ทุกครั้งที่กำหนด `tokenizer=...` เองใน `TfidfVectorizer`",
    },
    {
      title: "เรียก fit_transform บนข้อมูลทั้งหมดก่อนแยก Train/Test",
      symptom: "ค่า IDF และคำศัพท์จากชุด Test รั่วเข้าไปในชุด Train ทำให้คะแนน validation ดูดีเกินจริง ({{data-leakage}})",
      fix: "แยก Train/Test ก่อนเสมอ แล้วใส่ `TfidfVectorizer` ไว้ใน `sklearn.pipeline.Pipeline` เพื่อให้ `.fit()` เรียนรู้จากชุด Train เท่านั้น",
    },
    {
      title: "ส่ง custom_words เป็น list ตรง ๆ โดยไม่รวมกับ thai_words()",
      symptom: "คำศัพท์ทั่วไปภาษาไทยหายหมด เหลือแต่คำใน list ของเรา ทำให้คำอื่นถูกตัดเป็นตัวอักษรเดี่ยวพังทั้งประโยค",
      fix: "รวมพจนานุกรมเดิมเสมอด้วย `dict_trie(set(thai_words()) | domain_words)`",
    },
  ],

  quiz: {
    questions: [
      mc(
        "d049-q1",
        "ทำไมการใช้ `TfidfVectorizer()` แบบค่าเริ่มต้น (ไม่ใส่ custom tokenizer) กับข้อความภาษาไทยจึงทำให้ความแม่นยำต่ำมาก?",
        [
          ["เพราะ `TfidfVectorizer` ไม่รองรับการเข้ารหัส UTF-8", "ไม่จริง — มันรองรับ UTF-8 แต่ปัญหาอยู่ที่วิธีแบ่งขอบเขตคำ"],
          ["เพราะภาษาไทยไม่เว้นวรรคระหว่างคำ regex ค่าเริ่มต้นจึงมองทั้งประโยคที่ติดกันเป็นคำเดียว ทำให้เอกสารที่พูดเรื่องเดียวกันแทบไม่มีคำซ้ำกัน", "ถูก — เมื่อไม่ตัดคำ ประโยคอย่าง 'ขอใบกำกับภาษี' กับ 'ต้องการใบกำกับภาษี' จะจับคู่กันไม่ได้เลย"],
          ["เพราะ `TfidfVectorizer` ลบตัวอักษรภาษาไทยออกทั้งหมด", "ไม่จริง — ตัวอักษรไทยถูกเก็บไว้ แต่มัดรวมเป็นก้อนยาว ๆ"],
          ["เพราะ TF-IDF ใช้ได้เฉพาะกับข้อมูลตัวเลขเท่านั้น", "TF-IDF ออกแบบมาเพื่อแปลงข้อความเป็นตัวเลขโดยเฉพาะ"],
        ],
        "B",
        "ภาษาไทยเขียนคำติดกันโดยไม่เว้นวรรค หากไม่ผ่าน Thai word segmentation อย่าง `PyThaiNLP newmm` ก่อน เวกเตอร์ TF-IDF จะเต็มไปด้วยประโยคทั้งก้อนที่ไม่ตรงกันเลย",
        "ทำไม `TfidfVectorizer()` ค่าเริ่มต้นจึงพังกับภาษาไทย?",
        "เพราะภาษาไทยไม่เว้นวรรคระหว่างคำ default regex จึงมองทั้งประโยคเป็นคำเดียว ทำให้เอกสารเรื่องเดียวกันไม่มีคำซ้ำกัน",
      ),
      mc(
        "d049-q2",
        "หากต้องการเพิ่มคำศัพท์องค์กร `{\"พร้อมเพย์\", \"ใบลดหนี้\"}` เข้าไปใน `PyThaiNLP` `newmm` วิธีใดถูกต้องและเร็วที่สุด?",
        [
          ["สร้าง `trie = dict_trie(set(thai_words()) | {\"พร้อมเพย์\", \"ใบลดหนี้\"})` ครั้งเดียวแล้วส่งเข้า `custom_dict=trie`", "ถูก — คงคำศัพท์ไทยมาตรฐานครบทุกคำ เพิ่มคำเฉพาะได้แม่น และไม่ต้องสร้าง Trie ใหม่ซ้ำ ๆ"],
          ["สร้าง `dict_trie({\"พร้อมเพย์\", \"ใบลดหนี้\"})` โดยไม่ต้องรวม `thai_words()`", "ผิด — จะทำให้คำไทยพื้นฐานอื่น ๆ หายจากพจนานุกรมทั้งหมด"],
          ["สร้าง `dict_trie(set(thai_words()) | ...)` ใหม่ทุกครั้งข้างในลูปทีละประโยค", "ผิด — การสร้าง Trie ใหม่ซ้ำ ๆ จะทำให้ช้าลงหลายสิบเท่า"],
          ["ใส่ช่องว่างคั่นทุกตัวอักษรไทยก่อนส่งเข้า `newmm`", "ผิด — จะทำลายคำไทยทั้งหมดให้กลายเป็นตัวอักษรเดี่ยว"],
        ],
        "A",
        "ต้องรวม `set(thai_words())` กับคำเฉพาะขององค์กรเสมอ และสร้าง `Trie` เพียงครั้งเดียวก่อนนำไปใช้ซ้ำในทุกเอกสาร",
        "วิธีใช้ custom dictionary กับ `PyThaiNLP newmm` ที่ถูกต้องและเร็วคืออะไร?",
        "รวม `set(thai_words()) | domain_words` แล้วสร้าง `dict_trie(...)` เพียงครั้งเดียวนอกลูป ส่งเข้าพารามิเตอร์ `custom_dict`",
      ),
      mc(
        "d049-q3",
        "ในระบบจัดหมวดหมู่ทิกเก็ตที่มี 10,000 ข้อความ คำใดต่อไปนี้มักจะได้ค่า **IDF** ต่ำที่สุดใน `TfidfVectorizer`?",
        [
          ["คำว่า `\"ใบกำกับภาษี\"` ที่ปรากฏเฉพาะในทิกเก็ตหมวดบัญชี (~5% ของทั้งหมด)", "คำนี้ปรากฏเฉพาะบางหมวด จึงได้ค่า IDF สูง"],
          ["คำว่า `\"ครับ\"` หรือ `\"ของ\"` ที่ปรากฏกระจายอยู่ในทิกเก็ตแทบทุกใบ (~95% ของทั้งหมด)", "ถูก — ยิ่งคำปรากฏในเอกสารจำนวนมาก ค่า IDF ยิ่งเข้าใกล้ต่ำสุด เพื่อลดอิทธิพลของคำทั่วไป"],
          ["รหัสข้อผิดพลาด `\"ERR-504\"` ที่โผล่แค่ 12 ทิกเก็ต", "คำที่หายากจะได้ค่า IDF สูง"],
          ["คำว่า `\"พร้อมเพย์\"` ที่โผล่เฉพาะหมวดการชำระเงิน", "คำเฉพาะหมวดจะได้ค่า IDF สูง"],
        ],
        "B",
        "IDF (Inverse Document Frequency) ลดน้ำหนักของคำที่โผล่แทบทุกเอกสาร และดันน้ำหนักของคำที่เจาะจงกับบางเอกสารให้เด่นขึ้น",
        "TF และ IDF ใน TF-IDF แต่ละตัววัดอะไร?",
        "TF วัดความถี่ของคำในเอกสารนั้น ส่วน IDF วัดความหายากของคำในทั้งคลังเอกสาร (โผล่ทุกเอกสาร → IDF ต่ำ, โผล่เฉพาะบางกลุ่ม → IDF สูง)",
      ),
      mc(
        "d049-q4",
        "ข้อใดคือวิธีใช้ `TfidfVectorizer` กับชุดข้อมูล Train และ Test ที่ถูกต้องเพื่อป้องกัน **Data Leakage**?",
        [
          ["เรียก `vec.fit_transform(all_texts)` ก่อน แล้วค่อยแบ่งเมทริกซ์เป็น Train/Test", "ผิด — ทำให้คำศัพท์และค่า IDF จากชุด Test รั่วเข้าไปในการเทรน (data leakage)"],
          ["เรียก `vec.fit_transform(X_train)` แล้วเรียก `vec.fit_transform(X_test)` แยกกัน", "ผิด — การ fit ใหม่บน Test จะเปลี่ยนพจนานุกรมและลำดับคอลัมน์จนโมเดลอ่านฟีเจอร์ผิดช่อง"],
          ["เรียก `vec.fit_transform(X_train)` บนชุด Train แล้วเรียก `vec.transform(X_test)` บนชุด Test (หรือใส่ไว้ใน `Pipeline`)", "ถูก — เรียนรู้ vocabulary และ IDF จาก Train เท่านั้น แล้วแปลง Test ด้วยพจนานุกรมชุดเดียวกัน"],
          ["ไม่จำเป็นต้องเรียก `fit` เลย เรียก `transform` ได้ทันที", "ผิด — จะเกิด `NotFittedError` เพราะ vectorizer ยังไม่มี vocabulary"],
        ],
        "C",
        "กฎเหล็กของ scikit-learn: `fit` เฉพาะ Train, `transform` บน Val/Test และข้อมูลจริงใน Production — การห่อด้วย `Pipeline` ช่วยบังคับกฎนี้ให้อัตโนมัติ",
        "ต้องเรียก method ใดของ `TfidfVectorizer` กับชุด Train และชุด Test เพื่อกัน Data Leakage?",
        "เรียก `fit_transform(X_train)` บนชุด Train เท่านั้น และเรียก `transform(X_test)` บนชุด Test (ห้าม fit บน Test หรือบนข้อมูลรวม)",
      ),
    ],
  },

  takeaways: [
    "ภาษาไทยไม่มีช่องว่างคั่นคำ — default `TfidfVectorizer` จะมองทั้งประโยคเป็นคำเดียว ต้องตัดคำด้วย {{pythainlp}} `word_tokenize(..., engine=\"newmm\", keep_whitespace=False)` ก่อนเสมอ",
    "เพิ่มศัพท์เฉพาะองค์กรด้วย `dict_trie(set(thai_words()) | domain_words)` โดยสร้าง `Trie` เพียงครั้งเดียวเพื่อคงความเร็วระดับมิลลิวินาที",
    "เมื่อผูก custom tokenizer เข้ากับ `TfidfVectorizer` ให้ใส่ `token_pattern=None` และจัดการ `.lower()` สำหรับคำอังกฤษแบบ code-switching",
    "เรียก `fit_transform` เฉพาะชุด Train และ `transform` กับชุด Test เสมอเพื่อป้องกัน {{data-leakage}} — และ tokenizer เดียวกันนี้จะถูกนำไปใช้ต่อกับ {{bm25}} ใน Phase 4",
  ],

  reviewCards: [
    rc(
      "d049-rc-1",
      "ทำไมจึงแนะนำ `engine=\"newmm\"` + `custom_dict` ของ PyThaiNLP สำหรับ TF-IDF และ BM25 ใน Production?",
      "เพราะ `newmm` เป็น dictionary-based ที่เร็วมากบน CPU, ใช้ RAM น้อย, ให้ผล deterministic และเพิ่มคำเฉพาะองค์กรได้ง่ายผ่าน `dict_trie(set(thai_words()) | domain_words)`",
    ),
    rc(
      "d049-rc-2",
      "เมื่อส่ง `tokenizer=thai_tokenize` เข้า `TfidfVectorizer` ต้องตั้งพารามิเตอร์อะไรเพิ่มและทำไม?",
      "ตั้ง `token_pattern=None` (เพื่อปิด regex ภาษาอังกฤษและลบ `UserWarning`) และ `lowercase=False` หากจัดการ `.lower()` ใน tokenizer เองแล้ว",
    ),
    rc(
      "d049-rc-3",
      "ข้อจำกัดหลักของ TF-IDF (และ BM25) ที่ทำให้ต้องใช้ร่วมกับ Dense Embeddings ใน Phase 4 คืออะไร?",
      "TF-IDF อาศัยการตรงกันของคำศัพท์ (lexical match) หากคำถามใช้คำพ้องความหมายที่ไม่เคยอยู่ในคลัง (OOV) เช่น 'ใบเสร็จ' กับ 'ใบกำกับภาษี' จะได้ similarity เป็น 0",
    ),
  ],

  sources: [
    { label: "PyThaiNLP Documentation — Tokenization (word_tokenize & newmm)", href: "https://pythainlp.github.io/docs/5.0/api/tokenize.html" },
    { label: "PyThaiNLP Documentation — Trie & Custom Dictionary (dict_trie)", href: "https://pythainlp.github.io/docs/5.0/api/util.html#pythainlp.util.dict_trie" },
    { label: "scikit-learn User Guide — Text Feature Extraction (TF-IDF)", href: "https://scikit-learn.org/stable/modules/feature_extraction.html#tfidf-term-weighting" },
    { label: "scikit-learn API Reference — TfidfVectorizer", href: "https://scikit-learn.org/stable/modules/generated/sklearn.feature_extraction.text.TfidfVectorizer.html" },
  ],

  glossary: [
    "tfidf",
    "pythainlp",
    "bm25",
    "rag",
    "data-leakage",
    "embedding",
    "pytest",
  ],
});

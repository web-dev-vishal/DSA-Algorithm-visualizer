import crypto from 'crypto';
import config from '../config/index.js';
import Analysis from '../models/Analysis.js';
import logger from '../utils/logger.js';

// Maximum code size (50KB) to prevent abuse
const MAX_CODE_SIZE = 50_000;

// Groq API request timeout (default 30 seconds)
const GROQ_TIMEOUT_MS = config.groq.timeoutMs || 30_000;

const SYSTEM_PROMPT = `You are an expert DSA (Data Structures & Algorithms) tutor and step-by-step visualizer.
Your ONLY output must be a single valid JSON object — no markdown fences, no backticks, no commentary, nothing outside the JSON.

Required JSON shape:
{
  "isValid": true,
  "language": "C++",
  "algorithmName": "Bubble Sort",
  "category": "Sorting",
  "isCorrect": true,
  "bugs": [],
  "correctedCode": "",
  "timeComplexity": "O(n²)",
  "spaceComplexity": "O(1)",
  "explanation": "2-3 sentence plain-English description of what the algorithm does.",
  "howItWorks": ["Step 1: ...", "Step 2: ..."],
  "codeLines": [
    { "line": "void bubbleSort(int arr[], int n) {", "explain": "Function taking the array and its size n" }
  ],
  "defaultInput": [5, 3, 8, 1, 2],
  "steps": [
    {
      "arr": [5, 3, 8, 1, 2],
      "highlight": [0, 1],
      "secondary": [],
      "done": [],
      "eliminated": [],
      "swap": [],
      "pointers": { "0": "i", "1": "j" },
      "activeLine": 2,
      "msg": "We start by looking at the first two elements, 5 and 3. We will compare them."
    }
  ]
}

STRICT RULES:
- defaultInput: 5-8 elements that clearly demonstrate the algorithm. Integers only.
- steps: simulate EVERY individual operation (comparison, swap, assignment) on defaultInput from start to finish.
- Each step: arr must reflect the FULL array state at that moment (copy it correctly each time).
- pointers keys MUST be STRING indices: "0", "1", "3" — not numbers.
- activeLine: 0-based index into codeLines. Must match the line executing at that step.
- msg: friendly, concrete — mention actual values. Like explaining to a curious 15-year-old.
- highlight: indices being compared (blue). secondary: reference indices (yellow).
- swap: BOTH indices being swapped (purple). done: finalized positions (green). eliminated: out-of-range (grey).
- DSA categories supported: Sorting (Bubble/Selection/Insertion/Merge/Quick), Searching (Linear/Binary),
  Two Pointers, Sliding Window, Recursion, Stack, Queue, Linked List traversal,
  Tree traversal (BFS/DFS), Dynamic Programming (use arr for dp table), Graph algorithms.
- For DP: arr represents the dp array — show it building up step by step.
- Minimum 3 steps always.
- If code is not valid DSA: isValid=false, steps=[].
- If bugs found: isCorrect=false, bugs=["description..."], correctedCode="...", then simulate the CORRECTED code.`;

/**
 * Fallback local simulator for offline mode or missing Groq API key.
 * Provides a meaningful demo analysis for bubble sort code.
 */
function generateOfflineAnalysis(code, language, customInput) {
  const inputArr = (customInput && customInput.length) ? customInput : [5, 3, 8, 1, 2];
  const codeLower = code.toLowerCase();

  if (codeLower.includes('bubble')) {
    return {
      isValid: true,
      language: language || 'C++',
      algorithmName: 'Bubble Sort',
      category: 'Sorting',
      isCorrect: true,
      bugs: [],
      correctedCode: '',
      timeComplexity: 'O(n²)',
      spaceComplexity: 'O(1)',
      explanation: 'Bubble Sort repeatedly steps through the list, compares adjacent elements, and swaps them if they are in the wrong order. The largest unsorted element "bubbles up" to its correct position in each pass.',
      howItWorks: [
        'Iterate through the array from index 0 to n-2.',
        'In each inner pass, compare adjacent elements arr[j] and arr[j+1].',
        'If arr[j] > arr[j+1], swap them.',
        'After each full pass, the largest remaining element is in its final position.',
        'Repeat until no swaps occur in a full pass.'
      ],
      codeLines: [
        { line: 'void bubbleSort(int arr[], int n) {', explain: 'Function signature: takes array and size n' },
        { line: '  for (int i = 0; i < n-1; i++) {', explain: 'Outer loop: n-1 passes needed' },
        { line: '    for (int j = 0; j < n-i-1; j++) {', explain: 'Inner loop: compare up to unsorted boundary' },
        { line: '      if (arr[j] > arr[j+1]) {', explain: 'Compare adjacent elements' },
        { line: '        int temp = arr[j];', explain: 'Store current element temporarily' },
        { line: '        arr[j] = arr[j+1];', explain: 'Move smaller element left' },
        { line: '        arr[j+1] = temp;', explain: 'Place stored element on the right' },
        { line: '      }', explain: 'End swap block' },
        { line: '    }', explain: 'End inner loop' },
        { line: '  }', explain: 'End outer loop' },
        { line: '}', explain: 'Function complete' }
      ],
      defaultInput: inputArr,
      steps: [
        {
          arr: [...inputArr],
          highlight: [0, 1],
          secondary: [],
          done: [],
          eliminated: [],
          swap: [],
          pointers: { '0': 'j', '1': 'j+1' },
          activeLine: 3,
          msg: `Pass 1: Comparing index 0 (${inputArr[0]}) and index 1 (${inputArr[1]}). Are they out of order?`
        },
        {
          arr: [...inputArr],
          highlight: [],
          secondary: [],
          done: [],
          eliminated: [],
          swap: [0, 1],
          pointers: { '0': 'j', '1': 'j+1' },
          activeLine: 6,
          msg: `${inputArr[0]} > ${inputArr[1]}, so we swap them! The smaller element moves left.`
        },
        {
          arr: [inputArr[1], inputArr[0], ...inputArr.slice(2)],
          highlight: [1, 2],
          secondary: [],
          done: [],
          eliminated: [],
          swap: [],
          pointers: { '1': 'j', '2': 'j+1' },
          activeLine: 3,
          msg: `Now comparing index 1 (${inputArr[0]}) and index 2 (${inputArr[2]}).`
        }
      ]
    };
  }

  // Generic fallback for any other code
  const lines = code.split('\n');
  return {
    isValid: true,
    language: language || 'JavaScript',
    algorithmName: 'Algorithm Analysis',
    category: 'General',
    isCorrect: true,
    bugs: [],
    correctedCode: '',
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(1)',
    explanation: 'Algorithm analyzed in offline mode. Connect a Groq API key for full AI-powered analysis.',
    howItWorks: [
      'Offline mode: Groq API key not configured.',
      'Add GROQ_API_KEY to your .env file for full analysis.'
    ],
    codeLines: lines.slice(0, 20).map(line => ({ line, explain: 'Line of code' })),
    defaultInput: inputArr,
    steps: [
      { arr: [...inputArr], highlight: [0], secondary: [], done: [], eliminated: [], swap: [], pointers: {}, activeLine: 0, msg: 'Starting execution.' },
      { arr: [...inputArr], highlight: [], secondary: [], done: [...inputArr.keys()], eliminated: [], swap: [], pointers: {}, activeLine: Math.max(0, lines.length - 1), msg: 'Execution complete.' }
    ]
  };
}

/**
 * Compute a deterministic SHA-256 hash of code + custom input.
 * Used as a fast cache key for database lookups.
 */
function computeCodeHash(code, customInput) {
  const content = code + JSON.stringify(customInput || []);
  return crypto.createHash('sha256').update(content).digest('hex');
}

export class AnalysisService {
  /**
   * Analyzes DSA code using the Groq API (or offline fallback) and caches the result.
   * @param {string} code - The code to analyze
   * @param {string} language - Programming language
   * @param {number[]} [customInput] - Optional custom input array
   * @param {string} [userId] - Authenticated user ID (for associating analyses)
   * @returns {Promise<import('../models/Analysis.js').default>}
   */
  static async analyze(code, language, customInput = null, userId = null) {
    if (!code?.trim()) {
      throw new Error('Code cannot be empty');
    }

    if (code.length > MAX_CODE_SIZE) {
      throw new Error(`Code exceeds maximum allowed size of ${MAX_CODE_SIZE} characters`);
    }

    const cleanCode = code.trim();
    const codeHash = computeCodeHash(cleanCode, customInput);

    // ── 1. Check cache ──────────────────────────────────────────────
    try {
      const cached = await Analysis.findOne({ codeHash });
      if (cached) {
        logger.info('Cache hit: returning cached analysis', { codeHash: codeHash.slice(0, 8) });
        // Associate with user if they are now logged in
        if (userId && !cached.userId) {
          cached.userId = userId;
          await cached.save();
        }
        return cached;
      }
    } catch (err) {
      logger.error('Cache lookup error (non-fatal):', err);
    }

    // ── 2. Analyze via Groq API or offline fallback ─────────────────
    let resultData;

    if (!config.groq.apiKey || config.groq.apiKey === 'your_groq_api_key') {
      logger.warn('Groq API key not configured — using offline analysis mode');
      resultData = generateOfflineAnalysis(cleanCode, language, customInput);
    } else {
      logger.info('Calling Groq API for analysis', { language, hashPrefix: codeHash.slice(0, 8) });

      let userMsg = `Analyze this ${language} DSA code and return the JSON:\n\n${cleanCode}`;
      if (customInput && customInput.length > 0) {
        userMsg += `\n\nUse this exact array as defaultInput: [${customInput.join(', ')}]`;
      }

      try {
        // Use AbortController for request timeout (MED-15 fix)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), GROQ_TIMEOUT_MS);

        let response;
        try {
          response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${config.groq.apiKey}`
            },
            body: JSON.stringify({
              model: 'llama-3.3-70b-versatile',
              temperature: 0.1,
              max_tokens: 8000,
              messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: userMsg }
              ]
            }),
            signal: controller.signal
          });
        } finally {
          clearTimeout(timeoutId);
        }

        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Unknown error');
          throw new Error(`Groq API error ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        const rawContent = data.choices?.[0]?.message?.content || '';

        // Strip markdown code fences if present
        const jsonString = rawContent
          .replace(/^```(?:json)?\s*/i, '')
          .replace(/\s*```$/, '')
          .trim();

        try {
          resultData = JSON.parse(jsonString);
        } catch {
          // Attempt to extract JSON object from surrounding text
          const match = jsonString.match(/\{[\s\S]*\}/);
          if (match) {
            resultData = JSON.parse(match[0]);
          } else {
            throw new Error('Groq API did not return a valid JSON response');
          }
        }
      } catch (err) {
        if (err.name === 'AbortError') {
          logger.error(`Groq API request timed out after ${GROQ_TIMEOUT_MS}ms — using offline fallback`);
        } else {
          logger.error('Groq API error — using offline fallback:', err);
        }
        resultData = generateOfflineAnalysis(cleanCode, language, customInput);
      }
    }

    // ── 3. Persist to database ───────────────────────────────────────
    try {
      const analysisDoc = await Analysis.create({
        userId,
        codeHash,
        code: cleanCode,
        language: resultData.language || language || 'Unknown',
        algorithmName: resultData.algorithmName || 'Unknown Algorithm',
        category: resultData.category || 'General',
        isCorrect: resultData.isCorrect !== false,
        bugs: resultData.bugs || [],
        correctedCode: resultData.correctedCode || '',
        timeComplexity: resultData.timeComplexity || 'O(N)',
        spaceComplexity: resultData.spaceComplexity || 'O(1)',
        explanation: resultData.explanation || '',
        howItWorks: resultData.howItWorks || [],
        codeLines: resultData.codeLines || [],
        defaultInput: resultData.defaultInput || customInput || [],
        steps: resultData.steps || []
      });

      logger.info('Analysis cached to database', { id: analysisDoc._id, algorithm: analysisDoc.algorithmName });
      return analysisDoc;
    } catch (err) {
      logger.error('Failed to cache analysis (non-fatal):', err);
      // Return the raw result even if caching failed
      return { ...resultData, _id: null, codeHash };
    }
  }
}

export default AnalysisService;

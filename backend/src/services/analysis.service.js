import crypto from 'crypto';
import fetch from 'node-fetch'; // We will use global fetch if available, else require node-fetch or native fetch in Node 18+
import config from '../config/index.js';
import Analysis from '../models/Analysis.js';
import logger from '../utils/logger.js';

// The system prompt copied from frontend for matching schema requirements
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
 * Fallback local simulator for offline mode or missing API key
 */
function generateOfflineAnalysis(code, language, customInput) {
  const inputArr = customInput && customInput.length ? customInput : [5, 3, 8, 1, 2];
  
  // Basic mock analysis for common algorithms to allow offline sandbox mode
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
      explanation: 'Bubble Sort repeatedly steps through the list, compares adjacent elements, and swaps them if they are in the wrong order.',
      howItWorks: [
        'Iterate through the array from index 0 to n-1.',
        'Compare adjacent elements at each step.',
        'Swap them if the current element is larger than the next.',
        'Repeat until no swaps are needed.'
      ],
      codeLines: [
        { line: 'void bubbleSort(int arr[], int n) {', explain: 'Function taking array and n' },
        { line: '  for (int i = 0; i < n-1; i++) {', explain: 'Outer loop for passes' },
        { line: '    for (int j = 0; j < n-i-1; j++) {', explain: 'Inner loop for comparison' },
        { line: '      if (arr[j] > arr[j+1]) {', explain: 'Compare adjacent elements' },
        { line: '        int temp = arr[j];', explain: 'Swap helper temporary' },
        { line: '        arr[j] = arr[j+1];', explain: 'Assign next to current' },
        { line: '        arr[j+1] = temp;', explain: 'Assign temp to next' },
        { line: '      }', explain: 'End if' },
        { line: '    }', explain: 'End inner loop' },
        { line: '  }', explain: 'End outer loop' },
        { line: '}', explain: 'End function' }
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
          msg: `We start by comparing index 0 (${inputArr[0]}) and index 1 (${inputArr[1]}).`
        },
        {
          arr: [...inputArr],
          highlight: [],
          secondary: [],
          done: [],
          eliminated: [],
          swap: [0, 1],
          pointers: { '0': 'j', '1': 'j+1' },
          activeLine: 5,
          msg: `${inputArr[0]} is greater than ${inputArr[1]}, so we swap them.`
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
          msg: `Next we compare index 1 (${inputArr[0]}) and index 2 (${inputArr[2]}).`
        }
      ]
    };
  }

  // Generic fallback if not bubble sort
  return {
    isValid: true,
    language: language || 'JavaScript',
    algorithmName: 'DSA Algorithm Visualizer',
    category: 'General',
    isCorrect: true,
    bugs: [],
    correctedCode: '',
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(1)',
    explanation: 'Algorithm analyzed in offline developer sandboxed mode.',
    howItWorks: [
      'Visualizing code execution lines.',
      'Analyzing state changes and variables.'
    ],
    codeLines: code.split('\n').map(line => ({ line, explain: 'Executing line' })),
    defaultInput: inputArr,
    steps: [
      {
        arr: [...inputArr],
        highlight: [0],
        activeLine: 0,
        msg: 'Initializing data structures and parameters.'
      },
      {
        arr: [...inputArr],
        highlight: [1],
        activeLine: Math.min(1, code.split('\n').length - 1),
        msg: 'Iterating through inputs and processing elements.'
      },
      {
        arr: [...inputArr],
        done: Array.from({ length: inputArr.length }, (_, i) => i),
        activeLine: code.split('\n').length - 1,
        msg: 'Completed successfully.'
      }
    ]
  };
}

export class AnalysisService {
  /**
   * Analyzes the code using either Groq or an offline fallback and caches result.
   * @param {string} code 
   * @param {string} language 
   * @param {Array<number>} customInput 
   * @param {string} userId 
   * @returns {Promise<Object>}
   */
  static async analyze(code, language, customInput = null, userId = null) {
    if (!code || !code.trim()) {
      throw new Error('Code is required for analysis');
    }

    const cleanCode = code.trim();
    // Compute hash for caching
    const codeHash = crypto.createHash('sha256').update(cleanCode + JSON.stringify(customInput || '')).digest('hex');

    // 1. Check cache in database
    try {
      const cached = await Analysis.findOne({ code: cleanCode, defaultInput: customInput });
      if (cached) {
        logger.info('Cache hit: returning cached code analysis');
        // Update user if not present
        if (userId && !cached.userId) {
          cached.userId = userId;
          await cached.save();
        }
        return cached;
      }
    } catch (err) {
      logger.error('Error querying cached analysis:', err);
    }

    let resultData;

    // 2. Fetch from Groq or generate offline analysis
    if (!config.groq.apiKey || config.groq.apiKey === 'your_groq_api_key') {
      logger.warn('Groq API Key is not configured. Falling back to offline simulator.');
      resultData = generateOfflineAnalysis(cleanCode, language, customInput);
    } else {
      logger.info('Invoking Groq API for algorithm analysis...');
      let userMsg = `Analyze this DSA code and return the JSON:\n\n${cleanCode}`;
      if (customInput && customInput.length) {
        userMsg += `\n\nPlease use this exact array as defaultInput: [${customInput.join(', ')}]`;
      }

      try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
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
          })
        });

        if (!response.ok) {
          const text = await response.text();
          throw new Error(`Groq API returned ${response.status}: ${text}`);
        }

        const data = await response.json();
        const rawContent = data.choices?.[0]?.message?.content || '';
        
        // Clean markdown backticks
        const jsonString = rawContent
          .replace(/^```(?:json)?\s*/i, '')
          .replace(/\s*```$/, '')
          .trim();

        try {
          resultData = JSON.parse(jsonString);
        } catch {
          // Attempt recovery with regex
          const match = jsonString.match(/\{[\s\S]*\}/);
          if (match) {
            resultData = JSON.parse(match[0]);
          } else {
            throw new Error('Groq did not return a valid JSON payload');
          }
        }
      } catch (err) {
        logger.error('Groq analysis error, using offline backup:', err);
        resultData = generateOfflineAnalysis(cleanCode, language, customInput);
      }
    }

    // 3. Cache inside database
    try {
      const analysisDoc = new Analysis({
        userId,
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

      await analysisDoc.save();
      logger.info('Successfully saved and cached code analysis.');
      return analysisDoc;
    } catch (err) {
      logger.error('Failed to cache code analysis in database:', err);
      // Return un-cached doc representation anyway
      return resultData;
    }
  }
}

export default AnalysisService;

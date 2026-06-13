import { AlgorithmAnalysis, VisualizationStep } from "./api";

// Programmatic generators for offline execution traces

export function simulateAlgorithm(key: string, customInputStr: string): AlgorithmAnalysis {
  // Parse custom input array or fallback to defaults
  let input: number[] = [5, 3, 8, 1, 2];
  if (customInputStr.trim()) {
    try {
      const parsed = customInputStr.split(",")
        .map(x => parseInt(x.trim(), 10))
        .filter(x => !isNaN(x));
      if (parsed.length >= 3) {
        input = parsed;
      }
    } catch {}
  }

  const steps: VisualizationStep[] = [];

  switch (key) {
    case "binary": {
      // Python - Binary Search
      const arr = [...input].sort((a, b) => a - b);
      const target = (arr.length > 2 ? arr[Math.floor(arr.length / 2)] : 8) ?? 8;
      let left = 0;
      let right = arr.length - 1;

      steps.push({
        arr: [...arr],
        highlight: [],
        secondary: [],
        done: [],
        eliminated: [],
        swap: [],
        pointers: { "0": "left", [right.toString()]: "right" },
        activeLine: 1,
        msg: `Initializing Binary Search on sorted array: ${JSON.stringify(arr)}. Searching for target value: ${target}.`
      });

      while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        const elim: number[] = [];
        for (let idx = 0; idx < arr.length; idx++) {
          if (idx < left || idx > right) elim.push(idx);
        }

        steps.push({
          arr: [...arr],
          highlight: [mid],
          secondary: [left, right],
          eliminated: [...elim],
          swap: [],
          pointers: { [left.toString()]: "left", [right.toString()]: "right", [mid.toString()]: "mid" },
          activeLine: 3,
          msg: `Check boundaries [left: ${left}, right: ${right}]. Calculate mid-point: mid = (${left} + ${right}) // 2 = ${mid}. Value at mid is ${arr[mid]}.`
        });

        steps.push({
          arr: [...arr],
          highlight: [mid],
          secondary: [],
          eliminated: [...elim],
          swap: [],
          pointers: { [left.toString()]: "left", [right.toString()]: "right", [mid.toString()]: "mid" },
          activeLine: 4,
          msg: `Compare arr[mid] (${arr[mid]}) with target (${target}).`
        });

        if (arr[mid] === target) {
          steps.push({
            arr: [...arr],
            highlight: [],
            secondary: [],
            done: [mid],
            eliminated: [...elim].filter(x => x !== mid),
            swap: [],
            pointers: { [mid.toString()]: "found!" },
            activeLine: 5,
            msg: `Success! Target ${target} matches element at index ${mid}. Returning index ${mid}.`
          });
          break;
        } else if (arr[mid]! < target) {
          const oldLeft = left;
          left = mid + 1;
          const newElim: number[] = [];
          for (let idx = 0; idx < arr.length; idx++) {
            if (idx < left || idx > right) newElim.push(idx);
          }
          steps.push({
            arr: [...arr],
            highlight: [mid],
            secondary: [],
            done: [],
            eliminated: [...newElim],
            swap: [],
            pointers: { [left.toString()]: "left", [right.toString()]: "right" },
            activeLine: 7,
            msg: `Since arr[mid] (${arr[mid]}) is LESS than target (${target}), the target must be in the right half. Update left = mid + 1 = ${left}.`
          });
        } else {
          const oldRight = right;
          right = mid - 1;
          const newElim: number[] = [];
          for (let idx = 0; idx < arr.length; idx++) {
            if (idx < left || idx > right) newElim.push(idx);
          }
          steps.push({
            arr: [...arr],
            highlight: [mid],
            secondary: [],
            done: [],
            eliminated: [...newElim],
            swap: [],
            pointers: { [left.toString()]: "left", [right.toString()]: "right" },
            activeLine: 9,
            msg: `Since arr[mid] (${arr[mid]}) is GREATER than target (${target}), the target must be in the left half. Update right = mid - 1 = ${right}.`
          });
        }
      }

      if (left > right) {
        const allElim = Array.from({ length: arr.length }, (_, k) => k);
        steps.push({
          arr: [...arr],
          highlight: [],
          secondary: [],
          done: [],
          eliminated: allElim,
          swap: [],
          pointers: {},
          activeLine: 10,
          msg: `Pointers crossed (left > right). Element ${target} was not found in the array. Returning -1.`
        });
      }

      return {
        isValid: true,
        language: "Python",
        algorithmName: "Binary Search",
        category: "Searching",
        isCorrect: true,
        bugs: [],
        correctedCode: "",
        timeComplexity: "O(log n)",
        spaceComplexity: "O(1)",
        explanation: "An efficient search algorithm that finds a target value within a sorted array by repeatedly dividing the search interval in half.",
        howItWorks: [
          "1. Maintain left and right search boundaries.",
          "2. Compare the target value to the middle element.",
          "3. Halve the search interval based on comparison until found or boundary narrows."
        ],
        codeLines: [
          { line: "def binary_search(arr, target):", explain: "Function signature taking sorted array and target value" },
          { line: "    left, right = 0, len(arr) - 1", explain: "Initialize left boundary to 0 and right boundary to the end of the array" },
          { line: "    while left <= right:", explain: "Loop until the boundary pointers cross" },
          { line: "        mid = (left + right) // 2", explain: "Find the middle index of the current range" },
          { line: "        if arr[mid] == target:", explain: "Check if target is equal to the element at the middle index" },
          { line: "            return mid", explain: "Found the target! Return its index" },
          { line: "        elif arr[mid] < target:", explain: "If value at mid is less than target, target must be in the right half" },
          { line: "            left = mid + 1", explain: "Shift left pointer past mid to narrow search to right half" },
          { line: "        else:", explain: "If value at mid is greater than target, target must be in the left half" },
          { line: "            right = mid - 1", explain: "Shift right pointer below mid to narrow search to left half" },
          { line: "    return -1", explain: "If range is empty and target not found, return -1" }
        ],
        defaultInput: arr,
        steps
      };
    }

    case "selection": {
      // Java - Selection Sort
      const arr = [...input];
      const n = arr.length;
      const doneList: number[] = [];

      steps.push({
        arr: [...arr],
        highlight: [],
        secondary: [],
        done: [],
        eliminated: [],
        swap: [],
        pointers: {},
        activeLine: 2,
        msg: `Starting Selection Sort on array: ${JSON.stringify(arr)}.`
      });

      for (let i = 0; i < n - 1; i++) {
        let minIdx = i;
        steps.push({
          arr: [...arr],
          highlight: [i],
          secondary: [],
          done: [...doneList],
          eliminated: [],
          swap: [],
          pointers: { [i.toString()]: "i/min" },
          activeLine: 4,
          msg: `Begin pass ${i + 1}. Assume current minimum is at index i = ${i} (value: ${arr[i]}).`
        });

        for (let j = i + 1; j < n; j++) {
          steps.push({
            arr: [...arr],
            highlight: [j],
            secondary: [minIdx],
            done: [...doneList],
            eliminated: [],
            swap: [],
            pointers: { [i.toString()]: "i", [j.toString()]: "j", [minIdx.toString()]: "min" },
            activeLine: 5,
            msg: `Compare index j (${j}, value: ${arr[j]}) with current min index (${minIdx}, value: ${arr[minIdx]}).`
          });

          if (arr[j]! < arr[minIdx]!) {
            minIdx = j;
            steps.push({
              arr: [...arr],
              highlight: [j],
              secondary: [minIdx],
              done: [...doneList],
              eliminated: [],
              swap: [],
              pointers: { [i.toString()]: "i", [j.toString()]: "j", [minIdx.toString()]: "min" },
              activeLine: 6,
              msg: `Found smaller value: ${arr[minIdx]}. Update min index to ${minIdx}.`
            });
          }
        }

        if (minIdx !== i) {
          const temp = arr[minIdx]!;
          arr[minIdx] = arr[i]!;
          arr[i] = temp;

          steps.push({
            arr: [...arr],
            highlight: [],
            secondary: [],
            done: [...doneList, i],
            eliminated: [],
            swap: [i, minIdx],
            pointers: { [i.toString()]: "i", [minIdx.toString()]: "min" },
            activeLine: 9,
            msg: `Swap minimum value (${temp}) at index ${minIdx} with value (${arr[minIdx]}) at index i (${i}).`
          });
        } else {
          steps.push({
            arr: [...arr],
            highlight: [],
            secondary: [],
            done: [...doneList, i],
            eliminated: [],
            swap: [],
            pointers: { [i.toString()]: "i" },
            activeLine: 9,
            msg: `Minimum value is already at index i (${i}). No swap needed.`
          });
        }
        doneList.push(i);
      }
      doneList.push(n - 1);

      steps.push({
        arr: [...arr],
        highlight: [],
        secondary: [],
        done: [...doneList],
        eliminated: [],
        swap: [],
        pointers: {},
        activeLine: 12,
        msg: `Selection Sort completed! Final sorted array: ${JSON.stringify(arr)}.`
      });

      return {
        isValid: true,
        language: "Java",
        algorithmName: "Selection Sort",
        category: "Sorting",
        isCorrect: true,
        bugs: [],
        correctedCode: "",
        timeComplexity: "O(n²)",
        spaceComplexity: "O(1)",
        explanation: "A sorting algorithm that segments the array into sorted and unsorted portions, continually selecting the smallest element of the unsorted segment to append to the sorted segment.",
        howItWorks: [
          "1. Scan the unsorted portion of the array to find the smallest element.",
          "2. Swap this smallest element with the first element of the unsorted portion.",
          "3. Advance the boundaries of the sorted portion and repeat."
        ],
        codeLines: [
          { line: "void selectionSort(int[] arr) {", explain: "Function taking integer array to sort in-place" },
          { line: "    int n = arr.length;", explain: "Get length of array" },
          { line: "    for (int i = 0; i < n - 1; i++) {", explain: "Iterate through each boundary element in the array" },
          { line: "        int minIdx = i;", explain: "Set initial minimum index assumption to index i" },
          { line: "        for (int j = i + 1; j < n; j++) {", explain: "Scan the remaining unsorted subarray" },
          { line: "            if (arr[j] < arr[minIdx]) minIdx = j;", explain: "If element is smaller than current min, update min index pointer" },
          { line: "        }", explain: "End scan of unsorted elements" },
          { line: "        int temp = arr[minIdx];", explain: "Store the minimum element in temporary variable" },
          { line: "        arr[minIdx] = arr[i];", explain: "Move index i value to the minimum index location" },
          { line: "        arr[i] = temp;", explain: "Swap the minimum value into its final sorted position at index i" },
          { line: "    }", explain: "End iteration passes loop" },
          { line: "}", explain: "End of selection sort function" }
        ],
        defaultInput: input,
        steps
      };
    }

    case "insertion": {
      // Python - Insertion Sort
      const arr = [...input];
      const n = arr.length;

      steps.push({
        arr: [...arr],
        highlight: [],
        secondary: [],
        done: [],
        eliminated: [],
        swap: [],
        pointers: {},
        activeLine: 1,
        msg: `Starting Insertion Sort on array: ${JSON.stringify(arr)}.`
      });

      for (let i = 1; i < n; i++) {
        const key = arr[i]!;
        let j = i - 1;

        steps.push({
          arr: [...arr],
          highlight: [i],
          secondary: [],
          done: Array.from({ length: i }, (_, k) => k),
          eliminated: [],
          swap: [],
          pointers: { [i.toString()]: `key (${key})`, [j.toString()]: "j" },
          activeLine: 3,
          msg: `Pass ${i}. Select element at index i = ${i} as key: ${key}. Compare with elements in sorted sublist starting at j = ${j}.`
        });

        while (j >= 0 && arr[j]! > key) {
          steps.push({
            arr: [...arr],
            highlight: [j, j + 1],
            secondary: [],
            done: [],
            eliminated: [],
            swap: [],
            pointers: { [j.toString()]: "j", [(j + 1).toString()]: "j+1" },
            activeLine: 5,
            msg: `Compare index j (${j}, value: ${arr[j]}) with key (${key}). Since ${arr[j]} > ${key}, shift it forward.`
          });

          arr[j + 1] = arr[j]!;

          steps.push({
            arr: [...arr],
            highlight: [j + 1],
            secondary: [],
            done: [],
            eliminated: [],
            swap: [],
            pointers: { [j.toString()]: "j", [(j + 1).toString()]: "j+1" },
            activeLine: 6,
            msg: `Shifted element ${arr[j]} forward to index ${j + 1}. Array state is now ${JSON.stringify(arr)}.`
          });

          j--;
        }

        if (j >= 0) {
          steps.push({
            arr: [...arr],
            highlight: [j],
            secondary: [],
            done: [],
            eliminated: [],
            swap: [],
            pointers: { [j.toString()]: "j" },
            activeLine: 5,
            msg: `Compare index j (${j}, value: ${arr[j]}) with key (${key}). Since ${arr[j]} is NOT greater than ${key}, stop shifting.`
          });
        } else {
          steps.push({
            arr: [...arr],
            highlight: [],
            secondary: [],
            done: [],
            eliminated: [],
            swap: [],
            pointers: {},
            activeLine: 5,
            msg: `j index became negative (-1). Stop shifting.`
          });
        }

        arr[j + 1] = key;

        steps.push({
          arr: [...arr],
          highlight: [],
          secondary: [],
          done: Array.from({ length: i + 1 }, (_, k) => k),
          eliminated: [],
          swap: [],
          pointers: { [(j + 1).toString()]: "inserted" },
          activeLine: 8,
          msg: `Insert key ${key} back at position j + 1 = ${j + 1}. Array section up to index ${i} is now sorted.`
        });
      }

      steps.push({
        arr: [...arr],
        highlight: [],
        secondary: [],
        done: Array.from({ length: n }, (_, k) => k),
        eliminated: [],
        swap: [],
        pointers: {},
        activeLine: 9,
        msg: `Insertion Sort completed successfully! Final sorted array: ${JSON.stringify(arr)}.`
      });

      return {
        isValid: true,
        language: "Python",
        algorithmName: "Insertion Sort",
        category: "Sorting",
        isCorrect: true,
        bugs: [],
        correctedCode: "",
        timeComplexity: "O(n²)",
        spaceComplexity: "O(1)",
        explanation: "A sorting algorithm that builds the final sorted array one item at a time. It is much less efficient on large lists than more advanced algorithms.",
        howItWorks: [
          "1. Begin with the second element, treating the first element as a sorted sublist of size 1.",
          "2. Pull the active element (key) and shift larger items in the sorted sublist to the right.",
          "3. Drop the key into its correct relative position and repeat."
        ],
        codeLines: [
          { line: "def insertion_sort(arr):", explain: "In-place insertion sort function" },
          { line: "    for i in range(1, len(arr)):", explain: "Loop over elements from second item to end of array" },
          { line: "        key = arr[i]", explain: "Store current item as active key to insert" },
          { line: "        j = i - 1", explain: "Initialize index j to point to element immediately left of i" },
          { line: "        while j >= 0 and arr[j] > key:", explain: "Shift items while j is positive and elements are larger than key" },
          { line: "            arr[j + 1] = arr[j]", explain: "Copy element at j forward to index j + 1" },
          { line: "            j -= 1", explain: "Decrement index j to inspect next item to left" },
          { line: "        arr[j + 1] = key", explain: "Insert key into vacated gap at index j + 1" },
          { line: "    return arr", explain: "Return the sorted array reference" }
        ],
        defaultInput: input,
        steps
      };
    }

    case "two_ptr": {
      // JS - Two Sum (sorted array)
      const arr = [...input].sort((a, b) => a - b);
      let target = 8;
      if (arr.length >= 2) {
        target = arr[1]! + arr[arr.length - 1]!;
      }
      let left = 0;
      let right = arr.length - 1;

      steps.push({
        arr: [...arr],
        highlight: [],
        secondary: [],
        done: [],
        eliminated: [],
        swap: [],
        pointers: { "0": "left", [right.toString()]: "right" },
        activeLine: 2,
        msg: `Starting Two Sum. Sorted array: ${JSON.stringify(arr)}. Looking for target sum: ${target}.`
      });

      while (left < right) {
        const sum = arr[left]! + arr[right]!;
        const elims: number[] = [];
        for (let idx = 0; idx < arr.length; idx++) {
          if (idx < left || idx > right) elims.push(idx);
        }

        steps.push({
          arr: [...arr],
          highlight: [left, right],
          secondary: [],
          done: [],
          eliminated: [...elims],
          swap: [],
          pointers: { [left.toString()]: "left", [right.toString()]: "right" },
          activeLine: 4,
          msg: `Evaluate pointers: left element (${arr[left]}) + right element (${arr[right]}) = sum (${sum}).`
        });

        if (sum === target) {
          steps.push({
            arr: [...arr],
            highlight: [],
            secondary: [],
            done: [left, right],
            eliminated: [...elims],
            swap: [],
            pointers: { [left.toString()]: "found L", [right.toString()]: "found R" },
            activeLine: 5,
            msg: `Target matches! Sum of ${arr[left]} (idx ${left}) and ${arr[right]} (idx ${right}) equals ${target}. Returning indices.`
          });
          break;
        } else if (sum < target) {
          left++;
          const newElims = Array.from({ length: left }, (_, k) => k);
          for (let idx = right + 1; idx < arr.length; idx++) newElims.push(idx);
          steps.push({
            arr: [...arr],
            highlight: [left - 1],
            secondary: [],
            done: [],
            eliminated: newElims,
            swap: [],
            pointers: { [left.toString()]: "left", [right.toString()]: "right" },
            activeLine: 6,
            msg: `Sum (${sum}) is less than target (${target}). Since array is sorted, increment left pointer to index ${left} (${arr[left]}) to increase sum.`
          });
        } else {
          right--;
          const newElims: number[] = [];
          for (let idx = 0; idx < left; idx++) newElims.push(idx);
          for (let idx = right + 1; idx < arr.length; idx++) newElims.push(idx);
          steps.push({
            arr: [...arr],
            highlight: [right + 1],
            secondary: [],
            done: [],
            eliminated: newElims,
            swap: [],
            pointers: { [left.toString()]: "left", [right.toString()]: "right" },
            activeLine: 7,
            msg: `Sum (${sum}) is greater than target (${target}). Since array is sorted, decrement right pointer to index ${right} (${arr[right]}) to decrease sum.`
          });
        }
      }

      if (left >= right) {
        steps.push({
          arr: [...arr],
          highlight: [],
          secondary: [],
          done: [],
          eliminated: Array.from({ length: arr.length }, (_, k) => k),
          swap: [],
          pointers: {},
          activeLine: 9,
          msg: `Pointers met or crossed. No pair sums up to the target value ${target}. Returning [-1, -1].`
        });
      }

      return {
        isValid: true,
        language: "JS",
        algorithmName: "Two Pointers",
        category: "Two Pointers",
        isCorrect: true,
        bugs: [],
        correctedCode: "",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        explanation: "Finds two elements in a sorted array that sum up to a target value by narrowing two bounds pointers from opposite sides in linear time.",
        howItWorks: [
          "1. Initialize pointers left = 0 and right = length - 1.",
          "2. Calculate sum of values at pointers. If equal to target, return coordinates.",
          "3. If sum is too small, advance left pointer. If too large, lower right pointer."
        ],
        codeLines: [
          { line: "function twoSum(arr, target) {", explain: "Function taking sorted array and target sum" },
          { line: "    let left = 0, right = arr.length - 1;", explain: "Initialize left boundary to start and right boundary to end" },
          { line: "    while (left < right) {", explain: "Loop until left and right pointers meet" },
          { line: "        let sum = arr[left] + arr[right];", explain: "Sum current values at left and right pointers" },
          { line: "        if (sum === target) return [left, right];", explain: "Check if sum is exactly target, return pointers indices" },
          { line: "        else if (sum < target) left++;", explain: "If sum is too small, increment left pointer to increase values" },
          { line: "        else right--;", explain: "If sum is too large, decrement right pointer to lower values" },
          { line: "    }", explain: "End iteration loop when pointers meet" },
          { line: "    return [-1, -1];", explain: "If no sum found, return indicator bounds" },
          { line: "}", explain: "End function declaration" }
        ],
        defaultInput: arr,
        steps
      };
    }

    case "fib_dp": {
      // Python - Fibonacci DP (Array holds DP table)
      const n = input.length > 3 ? Math.min(input.length, 12) : 6;
      const dp = new Array(n + 1).fill(0);

      steps.push({
        arr: [...dp],
        highlight: [],
        secondary: [],
        done: [],
        eliminated: [],
        swap: [],
        pointers: {},
        activeLine: 2,
        msg: `Initialize DP table of size ${n + 1} with 0 values to hold Fibonacci computation steps.`
      });

      dp[1] = 1;

      steps.push({
        arr: [...dp],
        highlight: [],
        secondary: [],
        done: [0, 1],
        eliminated: [],
        swap: [],
        pointers: { "1": "dp[1]=1" },
        activeLine: 3,
        msg: `Set base case: dp[1] = 1. (dp[0] is already initialized to 0).`
      });

      for (let i = 2; i <= n; i++) {
        steps.push({
          arr: [...dp],
          highlight: [i],
          secondary: [i - 1, i - 2],
          done: Array.from({ length: i }, (_, k) => k),
          eliminated: [],
          swap: [],
          pointers: { [(i - 2).toString()]: "i-2", [(i - 1).toString()]: "i-1", [i.toString()]: "i" },
          activeLine: 4,
          msg: `Loop variable i = ${i}. Preparing to calculate dp[${i}] = dp[${i - 1}] + dp[${i - 2}].`
        });

        dp[i] = dp[i - 1]! + dp[i - 2]!;

        steps.push({
          arr: [...dp],
          highlight: [],
          secondary: [],
          done: Array.from({ length: i + 1 }, (_, k) => k),
          eliminated: [],
          swap: [],
          pointers: { [i.toString()]: `dp[${i}]=${dp[i]}` },
          activeLine: 5,
          msg: `Compute index state: dp[${i}] = dp[${i - 1}] (${dp[i - 1]}) + dp[${i - 2}] (${dp[i - 2]}) = ${dp[i]}.`
        });
      }

      steps.push({
        arr: [...dp],
        highlight: [],
        secondary: [],
        done: Array.from({ length: n + 1 }, (_, k) => k),
        eliminated: [],
        swap: [],
        pointers: { [n.toString()]: `result: ${dp[n]}` },
        activeLine: 6,
        msg: `Dynamic Programming lookup complete. Returning calculated Fibonacci term: dp[${n}] = ${dp[n]}.`
      });

      return {
        isValid: true,
        language: "Python",
        algorithmName: "Fibonacci DP",
        category: "DP",
        isCorrect: true,
        bugs: [],
        correctedCode: "",
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
        explanation: "Computes the n-th Fibonacci number in linear time using a bottom-up Dynamic Programming table (memoization array) to prevent exponential redundant calculations.",
        howItWorks: [
          "1. Allocate a DP table array of size n + 1.",
          "2. Establish initial terms dp[0] = 0 and dp[1] = 1.",
          "3. Build up subsequent terms iteratively: dp[i] = dp[i-1] + dp[i-2]."
        ],
        codeLines: [
          { line: "def fibonacci(n):", explain: "Function taking term count n to resolve" },
          { line: "    dp = [0] * (n + 1)", explain: "Allocate DP table array buffer of length n + 1" },
          { line: "    dp[1] = 1", explain: "Set baseline seed value at term index 1 to 1" },
          { line: "    for i in range(2, n + 1):", explain: "Loop terms from index 2 up to index n" },
          { line: "        dp[i] = dp[i - 1] + dp[i - 2]", explain: "Perform DP memoized state recurrence" },
          { line: "    return dp[n]", explain: "Return the resolved n-th Fibonacci term from table" }
        ],
        defaultInput: Array.from({ length: n }, (_, k) => k + 1),
        steps
      };
    }

    default: // bubble
    case "bubble": {
      // C++ - Bubble Sort
      const arr = [...input];
      const n = arr.length;
      const doneList: number[] = [];

      steps.push({
        arr: [...arr],
        highlight: [],
        secondary: [],
        done: [],
        eliminated: [],
        swap: [],
        pointers: {},
        activeLine: 0,
        msg: `Starting Bubble Sort on array: ${JSON.stringify(arr)}.`
      });

      for (let i = 0; i < n - 1; i++) {
        steps.push({
          arr: [...arr],
          highlight: [],
          secondary: [],
          done: [...doneList],
          eliminated: [],
          swap: [],
          pointers: { [(n - 1 - i).toString()]: "n-i-1" },
          activeLine: 3,
          msg: `Outer loop pass ${i + 1}. Bubble largest unsorted item to its destination index ${n - 1 - i}.`
        });

        for (let j = 0; j < n - i - 1; j++) {
          steps.push({
            arr: [...arr],
            highlight: [j, j + 1],
            secondary: [],
            done: [...doneList],
            eliminated: [],
            swap: [],
            pointers: { [j.toString()]: "j", [(j + 1).toString()]: "j+1" },
            activeLine: 4,
            msg: `Compare index j (${j}, val: ${arr[j]}) and index j+1 (${j + 1}, val: ${arr[j + 1]}). Is ${arr[j]} > ${arr[j + 1]}?`
          });

          if (arr[j]! > arr[j + 1]!) {
            const temp = arr[j]!;
            arr[j] = arr[j + 1]!;
            arr[j + 1] = temp;

            steps.push({
              arr: [...arr],
              highlight: [],
              secondary: [],
              done: [...doneList],
              eliminated: [],
              swap: [j, j + 1],
              pointers: { [j.toString()]: "j", [(j + 1).toString()]: "j+1" },
              activeLine: 7,
              msg: `Yes, ${temp} > ${arr[j]}. Swap them. New array: ${JSON.stringify(arr)}.`
            });
          } else {
            steps.push({
              arr: [...arr],
              highlight: [j, j + 1],
              secondary: [],
              done: [...doneList],
              eliminated: [],
              swap: [],
              pointers: { [j.toString()]: "j", [(j + 1).toString()]: "j+1" },
              activeLine: 4,
              msg: `No, ${arr[j]} is not greater than ${arr[j + 1]}. No swap needed.`
            });
          }
        }
        doneList.push(n - 1 - i);

        steps.push({
          arr: [...arr],
          highlight: [],
          secondary: [],
          done: [...doneList],
          eliminated: [],
          swap: [],
          pointers: {},
          activeLine: 10,
          msg: `Pass completed. Element ${arr[n - 1 - i]} bubbled to its final sorted index ${n - 1 - i}.`
        });
      }
      doneList.push(0);

      steps.push({
        arr: [...arr],
        highlight: [],
        secondary: [],
        done: [...doneList],
        eliminated: [],
        swap: [],
        pointers: {},
        activeLine: 12,
        msg: `Bubble Sort finished! Sorted array matches: ${JSON.stringify(arr)}.`
      });

      return {
        isValid: true,
        language: "C++",
        algorithmName: "Bubble Sort",
        category: "Sorting",
        isCorrect: true,
        bugs: [],
        correctedCode: "",
        timeComplexity: "O(n²)",
        spaceComplexity: "O(1)",
        explanation: "A simple sorting algorithm that repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.",
        howItWorks: [
          "1. Scan the array comparing adjacent pairs of numbers.",
          "2. If an element is larger than the next, swap them.",
          "3. Repeat this process n times, bubbling the largest item to the end each time."
        ],
        codeLines: [
          { line: "void bubbleSort(int arr[], int n) {", explain: "Function taking array and its length" },
          { line: "    for (int i = 0; i < n - 1; i++) {", explain: "Loop over outer bounds" },
          { line: "        for (int j = 0; j < n - i - 1; j++) {", explain: "Compare adjacent items up to unsorted index" },
          { line: "            if (arr[j] > arr[j + 1]) {", explain: "If left is greater than right, swap needed" },
          { line: "                int temp = arr[j];", explain: "Store left element temporarily" },
          { line: "                arr[j] = arr[j + 1];", explain: "Copy right element to left position" },
          { line: "                arr[j + 1] = temp;", explain: "Assign temp value to right position" },
          { line: "            }", explain: "End swap logic conditional" },
          { line: "        }", explain: "End inner iteration loop" },
          { line: "    }", explain: "End pass iterations loop" },
          { line: "}", explain: "End function declaration" }
        ],
        defaultInput: input,
        steps
      };
    }
  }
}

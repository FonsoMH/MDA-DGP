export const DEFAULT_REPEATS = 5;

/**
 * Generates a random integer between min and max (both inclusive).
 * @param min The minimum possible number.
 * @param max The maximum possible number.
 * @returns A random number.
 */
export const getRandomNumber = (min: number, max: number): number => {
return Math.floor(Math.random() * (max - min + 1)) + min;

};

/**
 * Generates an array of unique random numbers.
 *
 * @param min The minimun value for the random numbers.
 * @param max The maximum value for the random numbers.
 * @param count The total number of options to generate.
 * @returns A shuffled array of numbers.
 */
export const generateRandomOptions = (min: number, max: number, count: number): number[] => {
  const uniqueOptions = new Set<number>();

  while (uniqueOptions.size < count) {
    uniqueOptions.add(getRandomNumber(min, max));
  }

  return Array.from(uniqueOptions).sort(() => Math.random() - 0.5);
};

/**
 * Generates an array of unique random numbers, ensuring
 * that a specific 'target' number is included.
 *
 * @param target The number that MUST be included in the options.
 * @param min The minimun value for the other random numbers.
 * @param max The maximum value for the other random numbers.
 * @param count The total number of options to generate.
 * @returns A shuffled array of numbers.
 */
export const generateOptionsWithTarget = (
  target: number,
  min: number,
  max: number,
  count: number
): number[] => {
  const uniqueOptions = new Set<number>();
  
  uniqueOptions.add(target);

  while (uniqueOptions.size < count) {
    uniqueOptions.add(getRandomNumber(min, max));
  }

  return Array.from(uniqueOptions).sort(() => Math.random() - 0.5);
};

export const generateFixedRepeatedOptions = (
  min: number,
  max: number,          
  count: number,        
  nOptions: number   
): number [] => {



  const uniqueOptions = generateRandomOptions(min, max, nOptions);
  
  const result: number[] = [];
  
  let remainingCount = count;
  const repetitionsArray: number[] = [];
  

  for (let i = 0; i < nOptions; i++) {
    repetitionsArray.push(1);
    remainingCount--;
  }

  for (let i = 0; i < remainingCount; i++) {
    const index = getRandomNumber(0, nOptions - 1);
    
    repetitionsArray[index]++;
  }

  
  for (let i = 0; i < nOptions; i++){
    
    const option = uniqueOptions[i];
    const repetitions = repetitionsArray[i];

    for(let j = 0; j < repetitions; j++){
      result.push(option);
    }
  }

  return Array.from(result).sort(() => Math.random() - 0.5);
}

/**
 * Generates an array of numbers (number[]) with a fixed size and ensures the set 
 * can be partitioned equally among 'numContainers'.
 * * @param maxValue The largest numerical value an element in the array can have.
 * @param arraySize The exact number of elements the array must contain (The puzzle size).
 * @param numContainers How many containers the set must be partitionable into.
 * @returns An object containing the solvable array and the target sum per container, 
 * or null if no valid puzzle could be generated after maximum attempts.
 */

// Define el tipo de dato que vamos a devolver
interface EquitableArrayResult {
  puzzleArray: number[];
  targetSum: number;
}

/**
 * Generates an array of numbers (number[]) with a fixed size that is GUARANTEED 
 * to be partitionable equally among 'numContainers'.
 * @param maxValue The largest numerical value an element in the array can have.
 * @param arraySize The exact number of elements the array must contain (The puzzle size).
 * @param numContainers How many containers the set must be partitionable into.
 * @returns An object containing the solvable array and the target sum per container.
 */

interface EquitableArrayResult {
  puzzleArray: number[];
  targetSum: number;
}

export function generateEquitableFixedSizeArray(
  maxValue: number,
  minValue: number,
  arraySize: number, 
  numContainers: number
): EquitableArrayResult { 
  
  function canPartition(
    nums: number[],
    numCont: number,
    targetSum: number,
    k: number = 0,
    containerSums: number[] = Array(numCont).fill(0)
  ): boolean {
    if (k === nums.length) {
      return containerSums.every(s => s === targetSum);
    }
    
    for (let i = 0; i < numCont; i++) {
      if (containerSums[i] + nums[k] <= targetSum) {
        containerSums[i] += nums[k];
        
        if (canPartition(nums, numCont, targetSum, k + 1, containerSums)) {
          return true;
        }

        containerSums[i] -= nums[k];
      }
    }
    return false;
  }

  
  let validOption: number[] | null = null;
  let attempts = 0;
  
  while (validOption === null) { 
    attempts++; 

    let nuevoConjunto: number[] = [];
    let sumaTotal = 0;

    for (let i = 0; i < arraySize; i++) {
      const num = getRandomNumber(minValue, maxValue);
      nuevoConjunto.push(num);
      sumaTotal += num;
    }

    const resto = sumaTotal % numContainers;
    if (resto !== 0) {
      const indiceUltimo = nuevoConjunto.length - 1;
      
      if (nuevoConjunto[indiceUltimo] - resto > 0) {
        nuevoConjunto[indiceUltimo] -= resto;
        sumaTotal -= resto;
      } else {
        continue; 
      }
    }

    const targetSum = sumaTotal / numContainers;

    nuevoConjunto.sort((a, b) => b - a);

    if (canPartition(nuevoConjunto, numContainers, targetSum)) {
      validOption = nuevoConjunto; // ¡Éxito!
      
      return {
        puzzleArray: validOption,
        targetSum: targetSum
      };
    }
    
    if (attempts > 5000) {
        console.warn("Se excedieron 5000 intentos para generar un puzle. Podría haber un problema de lógica.");
    }
  }

  return { puzzleArray: [], targetSum: 0 }; 
}

interface EquitableArrayResultDiff {
  puzzleSolution: number[][];
  targetDifference: number;
}

/**
 * Generates a solution (an array of pairs) where the subtraction (difference) 
 * between the elements of each pair equals a randomly chosen TargetDifference.
 *
 * @param maxValue Maximum value for the generated numbers.
 * @param minValue Minimum value for the generated numbers.
 * @param arraySize This value is ignored; the output array size is 2 * numContainers.
 * @param numContainers Number of pairs (groups) to be formed.
 */
export function generateEquitableFixedSizeArrayDiff(
  maxValue: number,
  minValue: number,
  numContainers: number
): EquitableArrayResultDiff { 

  
  if (numContainers <= 0 || (maxValue - minValue) < 1) {
    return { puzzleSolution: [], targetDifference: 0 };
  }
  
  const maxViableDifference = maxValue - minValue;
  const targetDifference = getRandomNumber(1, maxViableDifference);

  const solution: number[][] = [];
  
  for (let i = 0; i < numContainers; i++) {
    
    const maxPossibleMin = maxValue - targetDifference;
    
    const minElement = getRandomNumber(minValue, maxPossibleMin);
    
    const maxElement = minElement + targetDifference;
    
    solution.push([minElement, maxElement]);
  }

  return {
    puzzleSolution: solution,
    targetDifference: targetDifference
  };
}

interface GamePuzzleResult {
  initialContainers: number[][];
  target: number; 
}

/**
 * Auxiliary function to find the exact partition of the puzzleArray into N containers.
 * @param nums Array of numbers (the puzzleArray)
 * @param numCont Number of containers
 * @param targetSum Target sum for each container
 * @returns Array of arrays (the partition) or null if it fails (it shouldn't)
 */
function findExactPartition(
    nums: number[],
    numCont: number,
    targetSum: number
): number[][] | null {
    const containers: number[][] = Array(numCont).fill(0).map(() => []);
    const containerSums: number[] = Array(numCont).fill(0);
    const used: boolean[] = Array(nums.length).fill(false);
    
    const sortedNums = [...nums].sort((a, b) => b - a);

    function backtrack(k: number = 0): boolean {
        if (containerSums.every(s => s === targetSum)) {
            return true;
        }

        let nextIndex = -1;
        for (let i = k; i < sortedNums.length; i++) {
            if (!used[i]) {
                nextIndex = i;
                break;
            }
        }
        
        if (nextIndex === -1) {
             return containerSums.every(s => s === targetSum);
        }
        
        const currentNum = sortedNums[nextIndex];
        
        for (let i = 0; i < numCont; i++) {
            if (containerSums[i] + currentNum <= targetSum) {
                containerSums[i] += currentNum;
                containers[i].push(currentNum);
                used[nextIndex] = true;

                if (backtrack(nextIndex + 1)) {
                    return true;
                }

                used[nextIndex] = false;
                containers[i].pop();
                containerSums[i] -= currentNum;
            }
        }
        return false;
    }

    if (backtrack()) {
        return containers;
    }
    return null;
}

/**
 * Main function that generates the initial state of the puzzle, 
 * including the required adjustment (addition or subtraction).
 * * @param arraySize The size of the SOLUTION array (numbers that should remain).
 * @param numContainers The number of recipients (containers).
 * @param numExtraElements The number of "distractor" or "extra" elements initially.
 * @param minValue Minimum value of the generated numbers.
 * @param maxValue Maximum value of the generated numbers.
 */
export function generateEquitableAdjustmentPuzzle(
  minValue: number,
    maxValue: number,
    arraySize: number, 
    numContainers: number,
    sum: boolean
): GamePuzzleResult {
  

  const numExtraElements = (numContainers * 2);

  let solutionContainers: number[] | number[][];

  let target = 0;

  if ( sum ){
    const { puzzleArray, targetSum } =  generateEquitableFixedSizeArray(
        maxValue, minValue, arraySize - numExtraElements, numContainers
    );

    target = targetSum;
    
    if (puzzleArray.length === 0) {
        return { initialContainers: [], target: 0 };
    }
    
    solutionContainers = findExactPartition(puzzleArray, numContainers, targetSum);

  }

  else {
    const {puzzleSolution, targetDifference} = 
    generateEquitableFixedSizeArrayDiff(maxValue, minValue, numContainers);

    solutionContainers = puzzleSolution;

    target = targetDifference;

  }
      
  if (!solutionContainers) {
      return { initialContainers: [], target: 0};
  }

  const extraElements: number[] = [];
  let totalExtraSum = 0;

  
  for (let i = 0; i < numExtraElements; i++) {

      const extraNum = 
      sum ?
      getRandomNumber(minValue, maxValue)
      :
      getRandomNumber(minValue, target/2)


      ;
      extraElements.push(extraNum);
      totalExtraSum += extraNum;
  }

  const initialContainers: number[][] = solutionContainers.map(c => [...c]);
  
  extraElements.forEach((num, index) => {
      const containerIndex = index % numContainers;
      initialContainers[containerIndex].push(num);
  });
  
  initialContainers.forEach(container => {
      for (let i = container.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [container[i], container[j]] = [container[j], container[i]];
      }
  });

  return {
      initialContainers: initialContainers,
      target: target,
  };
}
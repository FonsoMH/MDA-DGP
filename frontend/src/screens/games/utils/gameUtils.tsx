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
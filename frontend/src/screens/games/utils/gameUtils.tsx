export const DEFAULT_REPEATS = 5;

/**
 * Generates a random integer between 0 and max (both inclusive).
 * @param max The maximum possible number.
 * @returns A random number.
 */
export const getRandomNumber = (max: number): number => {
  return Math.floor(Math.random() * (max + 1));
};

/**
 * Generates an array of unique random numbers.
 *
 * @param max The maximum value for the random numbers.
 * @param count The total number of options to generate.
 * @returns A shuffled array of numbers.
 */
export const generateRandomOptions = (max: number, count: number): number[] => {
  const uniqueOptions = new Set<number>();

  while (uniqueOptions.size < count) {
    uniqueOptions.add(getRandomNumber(max));
  }

  return Array.from(uniqueOptions).sort(() => Math.random() - 0.5);
};

/**
 * Generates an array of unique random numbers, ensuring
 * that a specific 'target' number is included.
 *
 * @param target The number that MUST be included in the options.
 * @param max The maximum value for the other random numbers.
 * @param count The total number of options to generate.
 * @returns A shuffled array of numbers.
 */
export const generateOptionsWithTarget = (
  target: number,
  max: number,
  count: number
): number[] => {
  const uniqueOptions = new Set<number>();
  
  uniqueOptions.add(target);

  while (uniqueOptions.size < count) {
    uniqueOptions.add(getRandomNumber(max));
  }

  return Array.from(uniqueOptions).sort(() => Math.random() - 0.5);
};

export const generateFixedRepeatedOptions = (
  max: number,          
  count: number,        
  nOptions: number   
): number [] => {



  const uniqueOptions = generateRandomOptions(max, nOptions);
  
  const result: number[] = [];
  
  let remainingCount = count;
  const repetitionsArray: number[] = [];
  

  for (let i = 0; i < nOptions; i++) {
    repetitionsArray.push(1);
    remainingCount--;
  }

  for (let i = 0; i < remainingCount; i++) {
    const index = getRandomNumber(nOptions - 1);
    
    repetitionsArray[index]++;
  }

  
  for (let i = 0; i < nOptions; i++){
    
    const option = uniqueOptions[i];
    const repetitions = repetitionsArray[i];

    for(let j = 0; j < repetitions; j++){
      result.push(option);
    }
  }
  
  return result;
}

/**
 * Genera UN SOLO array de números (number[]) con un tamaño exacto y garantiza que el conjunto
 * puede ser repartido equitativamente en 'numContainers'.
 *
 * @param arraySize El número exacto de elementos que debe tener el array (El tamaño del puzle).
 * @param maxValue El valor numérico más grande que puede haber en el array.
 * @param numContainers Cuántos contenedores hay para la partición.
 * @returns Un único arreglo de números (number[]) que se puede repartir, o un array vacío [] si el problema no se puede generar con los parámetros dados tras varios intentos.
 */
export function generarArrayRepartibleTamanoFijo(
  maxValue: number,
  arraySize: number, 
  numContainers: number
): number[] {
  function puedeParticionar(
    nums: number[],
    numCont: number,
    targetSuma: number,
    k: number = 0,
    containerSums: number[] = Array(numCont).fill(0)
  ): boolean {
    if (k === nums.length) {
      return containerSums.every(s => s === targetSuma);
    }
    
    for (let i = 0; i < numCont; i++) {
      if (containerSums[i] + nums[k] <= targetSuma) {
        containerSums[i] += nums[k];
        
        if (puedeParticionar(nums, numCont, targetSuma, k + 1, containerSums)) {
          return true;
        }

        // Backtracking
        containerSums[i] -= nums[k];
      }
    }
    return false;
  }
  // --- Fin Lógica de Partición ---

  
  let opcionValida: number[] = [];
  let attempts = 0;
  const MAX_ATTEMPTS = 500; // Límite de seguridad para evitar bucles infinitos

  // Bucle hasta encontrar una opción válida o agotar intentos.
  while (opcionValida.length === 0 && attempts < MAX_ATTEMPTS) {
    attempts++; 

    // 1. Generar un conjunto de números con TAMAÑO FIJO: arraySize
    let nuevoConjunto: number[] = [];
    let sumaTotal = 0;

    for (let i = 0; i < arraySize; i++) {
      // Genera números entre 1 y maxValue
      const num = Math.floor(Math.random() * maxValue) + 1;
      nuevoConjunto.push(num);
      sumaTotal += num;
    }

    // 2. Ajustar el conjunto para que la suma total sea divisible por numContainers
    const resto = sumaTotal % numContainers;
    if (resto !== 0) {
      const indiceUltimo = nuevoConjunto.length - 1;
      
      // Intentamos ajustar el último número. Debe ser > 0 después del ajuste.
      if (nuevoConjunto[indiceUltimo] - resto > 0) {
        nuevoConjunto[indiceUltimo] -= resto;
        sumaTotal -= resto;
      } else {
        // Si no se puede ajustar, descartamos y continuamos al siguiente intento.
        continue; 
      }
    }

    // La suma objetivo por contenedor
    const sumaObjetivo = sumaTotal / numContainers;

    // 3. Ordenar (para optimizar el Backtracking) y validar la partición
    nuevoConjunto.sort((a, b) => b - a);

    // 4. Comprobar si este conjunto tiene una solución válida
    if (puedeParticionar(nuevoConjunto, numContainers, sumaObjetivo)) {
      opcionValida = nuevoConjunto; // ¡Éxito!
    }
  }


  return opcionValida;
}
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
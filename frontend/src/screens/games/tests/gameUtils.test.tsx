import { 
  getRandomNumber, 
  generateRandomOptions,
  generateOptionsWithTarget,
  generateFixedRepeatedOptions,
  generateEquitableFixedSizeArray,
  generateEquitableFixedSizeArrayDiff,
  findExactPartition,
  generateEquitableAdjustmentPuzzle
 } from '../utils/gameUtils';


describe('getRandomNumber', () => {
  let mathRandomSpy: jest.SpyInstance;

  beforeEach(() => {
    mathRandomSpy = jest.spyOn(global.Math, 'random');
  });

  afterEach(() => {
    mathRandomSpy.mockRestore();
  });


  test('debería devolver el valor máximo (max) cuando Math.random se aproxima a 1', () => {
    const min = 5;
    const max = 10;
    
    mathRandomSpy.mockReturnValue(0.9999999999); 
    
    expect(getRandomNumber(min, max)).toBe(10); 
  });

  test('debería devolver el valor mínimo (min) cuando Math.random es 0', () => {
    const min = 5;
    const max = 10;
    
    mathRandomSpy.mockReturnValue(0); 
    
    expect(getRandomNumber(min, max)).toBe(5);
  });
  
  test('debería devolver un número intermedio dentro del rango [min, max]', () => {
    const min = 5;
    const max = 9;
    
    mathRandomSpy.mockReturnValue(0.5); 
    
    expect(getRandomNumber(min, max)).toBe(7);
  });
  
  test('debería devolver un número dentro del rango [0, max] cuando min es 0', () => {
    const min = 0;
    const max = 10;
    

    mathRandomSpy.mockReturnValue(0.5); 
    
    expect(getRandomNumber(min, max)).toBe(5);
  });
});

describe('generateRandomOptions', () => {
  let mathRandomSpy: jest.SpyInstance;

  beforeEach(() => {
    mathRandomSpy = jest.spyOn(global.Math, 'random');
  });

  afterEach(() => {
    mathRandomSpy.mockRestore();
  });

  test('debería generar el número correcto de opciones únicas dentro del rango', () => {
    const min = 1;
    const max = 10;
    const count = 4;

    mathRandomSpy.mockReturnValueOnce(0.1) 
                 .mockReturnValueOnce(0.5) 
                 .mockReturnValueOnce(0.9) 
                 .mockReturnValueOnce(0.3) 
                 
                 .mockReturnValue(0.5); 

    const options = generateRandomOptions(min, max, count);

    expect(options).toHaveLength(count);
    expect(new Set(options).size).toBe(count); 

    options.forEach(num => {
      expect(num).toBeGreaterThanOrEqual(min);
      expect(num).toBeLessThanOrEqual(max);
      expect([2, 6, 10, 4]).toContain(num); 
    });
  });
  
  test('debería manejar la repetición y seguir generando hasta alcanzar el count', () => {
    const min = 0;
    const max = 2; 
    const count = 3;
    
    mathRandomSpy.mockReturnValueOnce(0)      
                 .mockReturnValueOnce(0.4)   
                 .mockReturnValueOnce(0.1)   
                 .mockReturnValueOnce(0.8)   
                 .mockReturnValue(0.5); 
    
    const options = generateRandomOptions(min, max, count);

    expect(options).toHaveLength(count);
    expect(options).toEqual(expect.arrayContaining([0, 1, 2]));
    expect(mathRandomSpy).toHaveBeenCalledTimes(6); 
  });
});

describe('generateOptionsWithTarget', () => {
  let mathRandomSpy: jest.SpyInstance;

  beforeEach(() => {
    mathRandomSpy = jest.spyOn(global.Math, 'random');
  });

  afterEach(() => {
    mathRandomSpy.mockRestore();
  });
  
  test('debería siempre incluir el número objetivo y generar el count correcto', () => {
    const target = 7;
    const min = 0;
    const max = 10;
    const count = 4;
    
    mathRandomSpy.mockReturnValueOnce(0.1) // 1
                 .mockReturnValueOnce(0.5) // 5
                 .mockReturnValueOnce(0.9) // 9
                 .mockReturnValue(0.5); // Shuffle
                 
    const options = generateOptionsWithTarget(target, min, max, count);

    expect(options).toHaveLength(count);
    expect(new Set(options).size).toBe(count);

    expect(options).toContain(target); 
    
    expect(options).toEqual(expect.arrayContaining([7, 1, 5, 9]));
  });
  
  test('debería manejar el caso en que el target es generado aleatoriamente (duplicado)', () => {
    const target = 5;
    const min = 0;
    const max = 5;
    const count = 3;
    

    mathRandomSpy.mockReturnValueOnce(0.9) // 5 (Duplicado, ignorado)
                 .mockReturnValueOnce(0.2) // 1 
                 .mockReturnValueOnce(0.4) // 2
                 .mockReturnValue(0.5); // Shuffle

    const options = generateOptionsWithTarget(target, min, max, count);

    expect(options).toHaveLength(count);
    expect(options).toEqual(expect.arrayContaining([5, 1, 2]));
  });
});


describe('generateFixedRepeatedOptions', () => {

  let mathRandomSpy: jest.SpyInstance;


  const MIN = 1;
  const MAX = 10;
  const COUNT_TOTAL = 7;
  const N_OPTIONS_UNIQUE = 3;
  
  beforeEach(() => {
    mathRandomSpy = jest.spyOn(global.Math, 'random');
  });

  afterEach(() => {
    mathRandomSpy.mockRestore();
  });

  test('1. Debería generar un array con COUNT_TOTAL elementos y distribuir las repeticiones', () => {
    

    mathRandomSpy.mockReturnValueOnce(0.2)
    .mockReturnValueOnce(0.4)
    .mockReturnValueOnce(0.7)

    .mockReturnValueOnce(0)
    .mockReturnValueOnce(0)
    .mockReturnValueOnce(0)
    .mockReturnValueOnce(0)
    .mockReturnValueOnce(0)
    .mockReturnValueOnce(0);
    
    // Ejecución:
    const options = generateFixedRepeatedOptions(MIN, MAX, COUNT_TOTAL, N_OPTIONS_UNIQUE);
    
    expect(options).toHaveLength(COUNT_TOTAL); 

    
    expect(options).toEqual(expect.arrayContaining([
      8, 8, 8, 8,
      5,
      3
    ]));
  });


  test('2. Debería funcionar cuando COUNT_TOTAL es igual a N_OPTIONS_UNIQUE', () => {
    const total = 5;
    const unique = 5;

    mathRandomSpy.mockReturnValueOnce(0)
    .mockReturnValueOnce(0.1)
    .mockReturnValueOnce(0.2)
    .mockReturnValueOnce(0.3)
    .mockReturnValueOnce(0.4)

    .mockReturnValueOnce(0)
    .mockReturnValueOnce(0)
    .mockReturnValueOnce(0)
    .mockReturnValueOnce(0)
    .mockReturnValueOnce(0)
    .mockReturnValueOnce(0);
    
    // Ejecución: remainingCount es 0, mockGetRandomNumber no se llama.
    const options = generateFixedRepeatedOptions(MIN, MAX, total, unique);

    // Aserciones:
    expect(options).toHaveLength(total);
    expect(options.every(num => options.filter(n => n === num).length === 1)).toBe(true);
    expect(options).toEqual(expect.arrayContaining([1, 2, 3, 4, 5]));
  });

  test('3. Debería funcionar si N_OPTIONS_UNIQUE es 1 (todos los números son iguales)', () => {
    const total = 6;
    const unique = 1;
    

    mathRandomSpy.mockReturnValueOnce(0.6)

    .mockReturnValueOnce(0)
    .mockReturnValueOnce(0)
    .mockReturnValueOnce(0)
    .mockReturnValueOnce(0)
    .mockReturnValueOnce(0)
    .mockReturnValueOnce(0);
  
    const options = generateFixedRepeatedOptions(MIN, MAX, total, unique);

    expect(options).toHaveLength(total);
    expect(options.every(num => num === 7)).toBe(true);
  });
});


describe('generateEquitableFixedSizeArray', () => {
  let mathRandomSpy: jest.SpyInstance;

  beforeEach(() => {
    mathRandomSpy = jest.spyOn(global.Math, 'random');
  });

  afterEach(() => {
    mathRandomSpy.mockRestore();
  });

  it('Debería generar un array particionable en el primer intento', () => {
    const arraySize = 6;
    const numContainers = 3;
    const minValue = 1;
    const maxValue = 10;
    
    mathRandomSpy
      .mockReturnValueOnce(0.3)
      .mockReturnValueOnce(0.4)
      .mockReturnValueOnce(0.3)
      .mockReturnValueOnce(0.6)
      .mockReturnValueOnce(0.2)
      .mockReturnValueOnce(0);

    const result = generateEquitableFixedSizeArray(maxValue, minValue, arraySize, numContainers);

    expect(result.puzzleArray).toHaveLength(arraySize);
    expect(result.targetSum).toBe(8);
    expect(result.puzzleArray).toEqual([7, 5, 4, 4, 3, 1]); 
  });
  
  it('Debería intentar múltiples veces hasta encontrar una solución', () => {
    const arraySize = 4;
    const numContainers = 2;
    const minValue = 1;
    const maxValue = 10;
    
    mathRandomSpy
      .mockReturnValueOnce(0.0)
      .mockReturnValueOnce(0.0)
      .mockReturnValueOnce(0.0)
      .mockReturnValueOnce(0.5)

      .mockReturnValueOnce(0.4)
      .mockReturnValueOnce(0.4)
      .mockReturnValueOnce(0.4)
      .mockReturnValueOnce(0.4);

    const result = generateEquitableFixedSizeArray(maxValue, minValue, arraySize, 4);

    expect(result.targetSum).toBe(5);
    expect(result.puzzleArray).toEqual([5, 5, 5, 5]);
    expect(mathRandomSpy).toHaveBeenCalledTimes(8); 
  });

});


describe('generateEquitableFixedSizeArrayDiff', () => {
  let mathRandomSpy: jest.SpyInstance;

  beforeEach(() => {
    mathRandomSpy = jest.spyOn(global.Math, 'random');
  });

  afterEach(() => {
    mathRandomSpy.mockRestore();
  });

  it('Debería generar un array particionable en el primer intento', () => {
    const numContainers = 3;
    const minValue = 1;
    const maxValue = 10;
    
    mathRandomSpy
      .mockReturnValueOnce(0.5)
      .mockReturnValueOnce(0.6)
      .mockReturnValueOnce(0.3)
      .mockReturnValueOnce(0);

    const result = generateEquitableFixedSizeArrayDiff(maxValue, minValue, numContainers);
    
    expect(result.puzzleSolution).toHaveLength(numContainers);
    expect(result.targetDifference).toBe(5);
    expect(result.puzzleSolution).toEqual([[4,9], [2, 7], [1,6]]); 
  });

});

describe('findExactPartition', () => {
    test('debería encontrar una partición exacta para un caso simple', () => {
        const nums = [1, 2, 3, 4, 5, 6];
        const numCont = 3;
        const targetSum = 7;

        const result = findExactPartition(nums, numCont, targetSum);

        expect(result).not.toBeNull();
        expect(result).toHaveLength(numCont);

        result.forEach(container => {
            const sum = container.reduce((acc, val) => acc + val, 0);
            expect(sum).toBe(targetSum);
        });

        const flattened = result.flat();
        expect(flattened.sort()).toEqual(nums.sort());
    });
    
    test('debería manejar números repetidos correctamente', () => {
        const nums = [5, 5, 5, 5];
        const numCont = 2;
        const targetSum = 10;

        const result = findExactPartition(nums, numCont, targetSum);

        expect(result).toEqual([[5, 5], [5, 5]]);
    });

    test('debería encontrar una partición para un conjunto más grande', () => {
        const nums = [10, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5];
        const numCont = 4;
        const targetSum = 15;

        const result = findExactPartition(nums, numCont, targetSum);

        expect(result).not.toBeNull();

        result.forEach(container => {
            const sum = container.reduce((acc, val) => acc + val, 0);
            expect(sum).toBe(targetSum);
        });
        
        const containerWithTen = result.find(c => c.includes(10));
        expect(containerWithTen).toEqual(expect.arrayContaining([10, 5]));

        const containersOfFives = result.filter(c => !c.includes(10));
        expect(containersOfFives).toHaveLength(3);
        containersOfFives.forEach(c => {
           expect(c).toEqual([5, 5, 5]);
        });
    });

    test('debería manejar el caso donde un solo número llena un contenedor', () => {
        const nums = [10, 5, 5];
        const numCont = 2;
        const targetSum = 10;

        const result = findExactPartition(nums, numCont, targetSum);

        expect(result).not.toBeNull();
        expect(result[0]).toEqual([10]);
        expect(result[1]).toEqual([5, 5]); 
    });
    
    test('debería retornar null si no es posible una partición exacta', () => {
        const nums = [10, 5, 5, 1];
        const numCont = 3;
        const targetSum = 7


        const result = findExactPartition(nums, numCont, targetSum);

        expect(result).toBeNull();
    });

    test('debería funcionar con un solo contenedor (numCont = 1)', () => {
        const nums = [1, 2, 3];
        const numCont = 1;
        const targetSum = 6;

        const result = findExactPartition(nums, numCont, targetSum);

        expect(result).toEqual([[3, 2, 1]]);
    });
});

describe('generateEquitableAdjustmentPuzzle', () => {

  let mathRandomSpy: jest.SpyInstance;

  beforeEach(() => {
    mathRandomSpy = jest.spyOn(global.Math, 'random');
  });

  afterEach(() => {
    mathRandomSpy.mockRestore();
  });

  it('Debería generar una solucion siendo suma', () => {
    
    const arraySize = 6;
    const numContainers = 3;
    const minValue = 1;
    const maxValue = 10;
    
    mathRandomSpy
      .mockReturnValueOnce(0.3)
      .mockReturnValueOnce(0.4)
      .mockReturnValueOnce(0.3)
      .mockReturnValueOnce(0.6)
      .mockReturnValueOnce(0.2)
      .mockReturnValue(0);

    const result = generateEquitableAdjustmentPuzzle(minValue, maxValue, arraySize ,numContainers, true);
    
    expect(result.initialContainers).toHaveLength(numContainers);
    expect(result.target).toBe(8);


    expect(result.initialContainers).toEqual([ [ 1, 1, 1, 7 ], [ 3, 1, 1, 5 ], [ 4, 1, 1, 4 ] ]); 
  });

  it('Debería generar una solucion siendo resta', () => {
    
    const arraySize = 6;
    const numContainers = 3;
    const minValue = 1;
    const maxValue = 10;
    
    mathRandomSpy
      .mockReturnValueOnce(0.5)
      .mockReturnValueOnce(0.6)
      .mockReturnValueOnce(0.3)
      .mockReturnValueOnce(0)
      .mockReturnValue(0);

    const result = generateEquitableAdjustmentPuzzle(minValue, maxValue, arraySize ,numContainers, false);
    
    expect(result.initialContainers).toHaveLength(numContainers);
    expect(result.target).toBe(5);


    expect(result.initialContainers).toEqual([ [ 9, 1, 1, 4 ], [ 7, 1, 1, 2 ], [ 6, 1, 1, 1 ] ]); 
  });

});
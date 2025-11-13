import { getRandomNumber, generateRandomOptions, generateOptionsWithTarget } from '../utils/gameUtils';

describe('getRandomNumber', () => {
  let mathRandomSpy: jest.SpyInstance;

  beforeEach(() => {
    mathRandomSpy = jest.spyOn(global.Math, 'random');
  });

  afterEach(() => {
    mathRandomSpy.mockRestore();
  });

  test('debería devolver el valor máximo (max) cuando Math.random es 0.999...', () => {
    const max = 10;
    
    mathRandomSpy.mockReturnValue(0.9999999999); 
    
    expect(getRandomNumber(max)).toBe(10);
  });

  test('debería devolver el valor mínimo (0) cuando Math.random es 0', () => {
    const max = 10;
    mathRandomSpy.mockReturnValue(0); 
    
    expect(getRandomNumber(max)).toBe(0);
  });
  
  test('debería devolver un número dentro del rango [0, max]', () => {
    const max = 5;
    mathRandomSpy.mockReturnValue(0.5); 
    expect(getRandomNumber(max)).toBe(3);
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
    const max = 10;
    const count = 4;

    mathRandomSpy.mockReturnValueOnce(0.1) 
                 .mockReturnValueOnce(0.5) 
                 .mockReturnValueOnce(0.9) 
                 .mockReturnValueOnce(0.3) 
                 
                 .mockReturnValue(0.5); 

    const options = generateRandomOptions(max, count);

    expect(options).toHaveLength(count);
    expect(new Set(options).size).toBe(count); 

    options.forEach(num => {
      expect(num).toBeGreaterThanOrEqual(0);
      expect(num).toBeLessThanOrEqual(max);
      expect([1, 5, 9, 3]).toContain(num); 
    });
  });
  
  test('debería manejar la repetición y seguir generando hasta alcanzar el count', () => {
    const max = 2; 
    const count = 3;
    
    mathRandomSpy.mockReturnValueOnce(0)      
                 .mockReturnValueOnce(0.4)   
                 .mockReturnValueOnce(0.1)   
                 .mockReturnValueOnce(0.8)   
                 .mockReturnValue(0.5); 
    
    const options = generateRandomOptions(max, count);

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
    const max = 10;
    const count = 4;
    
    mathRandomSpy.mockReturnValueOnce(0.1) // 1
                 .mockReturnValueOnce(0.5) // 5
                 .mockReturnValueOnce(0.9) // 9
                 .mockReturnValue(0.5); // Shuffle
                 
    const options = generateOptionsWithTarget(target, max, count);

    expect(options).toHaveLength(count);
    expect(new Set(options).size).toBe(count);

    expect(options).toContain(target); 
    
    expect(options).toEqual(expect.arrayContaining([7, 1, 5, 9]));
  });
  
  test('debería manejar el caso en que el target es generado aleatoriamente (duplicado)', () => {
    const target = 5;
    const max = 5;
    const count = 3;
    

    mathRandomSpy.mockReturnValueOnce(0.9) // 5 (Duplicado, ignorado)
                 .mockReturnValueOnce(0.2) // 1 
                 .mockReturnValueOnce(0.4) // 2
                 .mockReturnValue(0.5); // Shuffle

    const options = generateOptionsWithTarget(target, max, count);

    expect(options).toHaveLength(count);
    expect(options).toEqual(expect.arrayContaining([5, 1, 2]));
  });
});
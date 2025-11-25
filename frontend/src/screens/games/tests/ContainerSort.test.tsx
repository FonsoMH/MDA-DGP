import React from 'react';
import { render, fireEvent, waitFor, act, screen } from '@testing-library/react-native';
import ContainerSort from '../ContainerSort'; 
import { CORRECT_COLOR, ERROR_COLOR, EMPTY_COLOR } from '../../../types/games';
import { TouchableOpacity, View } from 'react-native';

// ===========================================
// MOCKS DE DEPENDENCIAS EXTERNAS E INTERNAS
// ===========================================

// --- 1. Mocks de Hooks del Juego y Sistema ---

let mockAdvanceGame;

// Mock de useGameManager: Controla el avance del juego y la inicialización
jest.mock('../../utils/gameManager', () => ({
    useGameManager: jest.fn((id, initFn) => {
            // Inicialización del juego con 4 opciones y 2 contenedores (modo sin suma)
            act(() => {
                initFn(1, 4, 4, 2, false); 
            });
            mockAdvanceGame = jest.fn(); // Reiniciar mockAdvanceGame para cada test
        return { advanceGame: mockAdvanceGame, modalVisible: false, resetGame: jest.fn() };
    }),
}));

// Mock de useAccessibilitySettings
jest.mock('../../../accessibilitySettings/hooks/useAccessibilitySettings', () => ({
    useAccessibilitySettings: jest.fn(() => ({
        backgroundColor: '#FFFFFF',
        foregroundColor: '#000000',
        fontSize: 16,
        highContrast: false,
        iconPosition: 'derecha',
    })),
}));

// Mock de useRoundMessage
jest.mock('../../../components/RoundMessage/useRoundMessage', () => ({
    useRoundMessage: jest.fn(() => ({
        show: jest.fn().mockResolvedValue(true),
        message: '',
        isVisible: false,
        type: 'info',
    })),
}));

// Mock de react-native-reanimated (necesario para useSharedValue, useAnimatedRef)
jest.mock('react-native-reanimated', () => ({
    useSharedValue: jest.fn((initialValue) => ({ value: initialValue })),
    useAnimatedRef: jest.fn(() => ({ current: { measureInWindow: jest.fn((cb) => cb(0, 0, 500, 500)) } })),
    // Mocks de componentes básicos para evitar errores de render
    // View: View,
    // DraggableItem: 'DraggableItem', // Se mockea más abajo de forma funcional
}));

// --- 2. Mocks de Componentes Internos y Utilidades ---

// Mock de gameUtils: Controla las opciones iniciales ([1, 1, 2, 2])
jest.mock('../utils/gameUtils', () => ({
    generateEquitableFixedSizeArray: jest.fn(),
    generateFixedRepeatedOptions: jest.fn(() => [1, 1, 2, 2]), 
}));

// Mock de DraggableItem: Permite simular la selección (onStart) y el drop (onDrop) con clicks
jest.mock('../SequenceGame/DraggableItem', () => {
    return ({ children, onStart, onDrop, style, key }) => {
        // children es el NumberDisplay. Extraemos su prop numberProp
        const numberValue = children?.props?.numberProp; 

        return (
            <TouchableOpacity
                testID={`draggable-item-${numberValue || 'unknown'}-${key}`}
                accessibilityLabel={`number-option-${numberValue || 'unknown'}`} // ID para fireEvent.press
                onPress={() => {
                    if (onStart) onStart(); // Simula la selección
                    
                    // Al hacer click en el número, exponemos la función de drop
                    // para que el test pueda simular la colocación en un contenedor.
                    global.mockDropToContainer = (targetIndex) => {
                        if (onDrop) onDrop(targetIndex);
                    };
                }}
                style={style}
            >
                {children}
            </TouchableOpacity>
        );
    };
});

// Mock de Container: Simula la lógica de recepción y notificación del estado (CORRECT/ERROR)
jest.mock('../Container/Container', () => {
    return jest.fn((props) => {
        // Simular onLayoutMeasured para que los layouts existan
        if (props.onLayoutMeasured) {
            props.onLayoutMeasured({ x: 0, y: 0, width: 100, height: 100 }, props.containerIndex);
        }

        // Simular la lógica de drop (activada por receivedIndex === containerIndex)
        if (props.receivedIndex === props.containerIndex && props.currentSelectedNumber) {
            props.onDropSuccess(); // Informa a ContainerSort que el número fue consumido
            
            let colorToReport = ERROR_COLOR;

            // Simulación de éxito para Uniformidad:
            // Contenedor 0 debe recibir solo '1's -> CORRECT_COLOR
            if (props.currentSelectedNumber.value === 1 && props.containerIndex === 0) {
                colorToReport = CORRECT_COLOR;
            } 
            // Contenedor 1 debe recibir solo '2's -> CORRECT_COLOR
            else if (props.currentSelectedNumber.value === 2 && props.containerIndex === 1) {
                colorToReport = CORRECT_COLOR;
            }
            // Cualquier otra combinación es error (ej: '1' en C1, o '2' en C0)
            
            props.onUniformityChange(colorToReport); // Reporta el estado del contenedor
        }

        return (
            <View testID={`container-${props.containerIndex}`} />
        );
    });
});

// ===========================================
// PRUEBAS DEL COMPONENTE CONTAINERSORT
// ===========================================

describe('ContainerSort - Flujo de Drop Simulado (Uniformidad)', () => {
    
    // Helper para simular un click de selección y un drop en un contenedor
    const performSelectAndDrop = async (optionValue, targetContainerIndex) => {
        
        // 1. Simular la SELECCIÓN del número (llama a handleNumberSelect)
        // Buscamos el primer elemento que contiene ese valor
        const items = screen.getAllByAccessibilityLabel(`number-option-${optionValue}`);
        
        // Seleccionamos el primer item disponible (el que debería ser el "seleccionado")
        // Como el estado de `options` se actualiza internamente, confiamos en que 
        // el primer elemento encontrado es el que aún no ha sido consumido.
        const itemToSelect = items[0]; 
        fireEvent.press(itemToSelect); 
        
        // 2. Simular el DROP en el contenedor objetivo (llama a handleDropOnContainer)
        if (global.mockDropToContainer) {
            // Invocamos la función de drop con el índice objetivo
            global.mockDropToContainer(targetContainerIndex);
        } else {
            throw new Error("mockDropToContainer no está disponible. Fallo en el mock de DraggableItem.");
        }
        
        // Esperar la finalización del ciclo de efectos (Container reacciona)
        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 0));
        });
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Este es el test que solicitaste, adaptado para la estrategia de simulación de clicks.
    test('1. Debería avanzar el juego cuando se reparta bien (uniformidad: 1s en C0, 2s en C1)', async () => {
        render(<ContainerSort />);
        
        await waitFor(() => {
            // Verificar que la inicialización se completó
            expect(require('../utils/gameUtils').generateFixedRepeatedOptions).toHaveBeenCalledTimes(1);
        });

        // Opciones iniciales: [1, 1, 2, 2]. Contenedores: 0 y 1.

        // --- 1. Colocar '1' en Contenedor 0 (Correcto) ---
        await performSelectAndDrop(1, 0); 
        // Container 0 notifica CORRECT_COLOR. 1 opción '1' restante.
        
        // --- 2. Colocar '1' en Contenedor 0 (Correcto) ---
        await performSelectAndDrop(1, 0); 
        // Container 0 se reafirma en CORRECT_COLOR. 0 opciones '1' restantes.

        // --- 3. Colocar '2' en Contenedor 1 (Correcto) ---
        await performSelectAndDrop(2, 1); 
        // Container 1 notifica CORRECT_COLOR. 1 opción '2' restante.
        
        // --- 4. Colocar '2' en Contenedor 1 (Correcto) ---
        await performSelectAndDrop(2, 1); 
        // Container 1 se reafirma en CORRECT_COLOR. 0 opciones '2' restantes.

        // En este punto: options.length = 0 y containerStatuses = ['CORRECT_COLOR', 'CORRECT_COLOR']

        await waitFor(() => {
            // Verificar que el juego avanzó
            expect(mockAdvanceGame).toHaveBeenCalledTimes(1);
        });
        
        // Verificar que el mensaje de éxito se disparó
        const roundMessageMock = require('../../../components/RoundMessage/useRoundMessage').useRoundMessage();
        expect(roundMessageMock.show).toHaveBeenCalledWith(
            "¡Excelente! Has superado la ronda con éxito.", 
            1000,
            "success"
        );
    });

    test('2. No debería avanzar si se colocan incorrectamente (violando uniformidad)', async () => {
        render(<ContainerSort />);
        
        // --- 1. Colocar '1' en Contenedor 0 (Correcto) ---
        await performSelectAndDrop(1, 0); 
        
        // --- 2. Colocar '1' en Contenedor 1 (ERROR: '1' no pertenece a C1) ---
        await performSelectAndDrop(1, 1); 
        // El mock de Container notifica ERROR_COLOR para C1.

        // Vaciamos el resto para garantizar que la única condición que falla es el color
        await performSelectAndDrop(2, 1); 
        await performSelectAndDrop(2, 0); 

        // Esperar un momento para asegurar que todos los efectos se procesaron
        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 50));
        });

        // La condición de victoria ('allGreen') debe fallar debido al ERROR_COLOR reportado.
        expect(mockAdvanceGame).not.toHaveBeenCalled();
    });
});
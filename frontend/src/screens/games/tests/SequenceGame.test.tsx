import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react-native';

import SequenceGame from '../SequenceGame/SequenceGame'; 
import { generateRandomOptions } from '../utils/gameUtils';
import NumberDisplay from '../../../components/common/NumberDisplays/NumberDisplay';
import { TouchableOpacity } from 'react-native';



jest.mock('react-native-reanimated', () => ({
    ...jest.requireActual('react-native-reanimated'),
    useSharedValue: jest.fn(initialValue => ({ value: initialValue })),
    useAnimatedRef: jest.fn(() => ({ current: null })),
}));

interface DragabbleProps {
    onPress: () => void;
    children: React.ReactNode;
}
jest.mock('../SequenceGame/DraggableItem', () => {
    const React = jest.requireActual('react'); 

    return ({ onPress, children }: DragabbleProps) => {
        let num: string = 'unknown';

    
        if (React.Children.count(children) > 0) {
             const numberDisplayElement = React.Children.toArray(children)[0] as React.ReactElement<NumberDisplayProps>;
             
             num = numberDisplayElement.props.numberProp?.toString() || 'unknown';
        }

        return (
            <button 
                onClick={onPress} 
                aria-label={`number-option-${num}`} 
            >
                {children}
            </button>
        );
    };
});

const MOCK_TARGET_NUMBER = 5;
const MOCK_OPTIONS = [1, 5, 8, 3];
jest.mock('../utils/gameUtils', () => ({

    getRandomNumber: jest.fn(() => MOCK_TARGET_NUMBER), 

    generateRandomOptions: jest.fn(target => MOCK_OPTIONS), 

    DEFAULT_REPEATS: 5, 
}));

const MOCK_USER_ID = 42;
jest.mock('../../../hooks/useUser', () => ({
    useUser: jest.fn(() => ({
        user: { id: MOCK_USER_ID } 
    })),
}));

const MOCK_MAX_RANGE = 10;
const MOCK_OPTIONS_COUNT = 4;
const MOCK_CONFIG = { ranges: MOCK_MAX_RANGE, numElements: MOCK_OPTIONS_COUNT, upward: true };
jest.mock('../hooks/useGameConfig', () => ({
    useGameConfig: jest.fn(() => ({
        data: MOCK_CONFIG,
        isLoading: false,
    })),
}));

jest.mock('../../../accessibilitySettings/hooks/useAccessibilitySettings', () => ({
    useAccessibilitySettings: () => ({ 
        backgroundColor: '#fff', 
        fontSize: 16, 
        iconPosition: 'derecha' 
    }),
}));

interface NumberDisplayProps {
    numberProp: number;
    testID: string;
}
jest.mock('../../../components/common/NumberDisplays/NumberDisplay', () => {
    const { TouchableOpacity } = require('react-native');

    return ({ numberProp }: NumberDisplayProps) => (
        <button >{numberProp.toString()}</button>
    );
});


interface FeedbackScreenProps {
    visible?: boolean;
    onNotify: () => void;
}
jest.mock('../../../components/FeedBack/Feedback', () => {
    return ({ onNotify }: FeedbackScreenProps) => (
        <button 
            onClick={onNotify} 
            aria-label="Jugar de nuevo" 
        >
            FeedbackScreen
        </button>
    );
});

let mockRoundMessageShow = jest.fn(() => Promise.resolve());

jest.mock('../../../components/RoundMessage/useRoundMessage', () => ({
    useRoundMessage: jest.fn(() => ({
        show: mockRoundMessageShow,
        message: '',
        isVisible: false,
        type: 'info',
    })),
}));

jest.mock('../../../components/RoundMessage/RoundMessage', () => 'RoundMessage');


jest.mock('../../../components/common/BackButton/BackButton', () => 'BackButton');

let mockAdvanceGame: jest.Mock = jest.fn();
let mockResetGame: jest.Mock = jest.fn();
let mockUpdateScore: jest.Mock = jest.fn();
type OnGameInitType = (maxRange: number, optionsCount: number) => void;
type UseGameManagerType = (gameId: number, onGameInit: OnGameInitType) => any;

jest.mock('../utils/gameManager', () => {
    const originalModule = jest.requireActual('../utils/gameManager');
    

    return {
        useGameManager: jest.fn((gameId, onGameInit) => {
            const manager = originalModule.useGameManager(gameId, onGameInit);

            return {
                ...manager,
                advanceGame: mockAdvanceGame,
                resetGame: mockResetGame,    
                updateScore: mockUpdateScore,
                modalVisible: false, 
            };
        }),
    };
});


describe('SequenceGame - Interacción y Lógica', () => {

    beforeEach(() => {
        mockAdvanceGame = jest.fn();
        mockResetGame = jest.fn();
        mockUpdateScore = jest.fn();
        jest.clearAllMocks(); 
    });

    test('1. Debería avanzar el juego cuando se selecciona el orden ASCENDENTE correcto [1, 3, 5, 8]', async () => {
        render(<SequenceGame />);
        
        await waitFor(() => {
            expect(require('../utils/gameUtils').generateRandomOptions).toHaveBeenCalledTimes(1); 
        });

        fireEvent.press(screen.getByLabelText('number-option-1')); 
        fireEvent.press(screen.getByLabelText('number-option-3'));
        fireEvent.press(screen.getByLabelText('number-option-5'));
        
        fireEvent.press(screen.getByLabelText('number-option-8')); 

        await waitFor(() => {
            expect(mockAdvanceGame).toHaveBeenCalledTimes(1);
        });
    });

    test('2. NO debería avanzar el juego si el orden es INCORRECTO (ASCENDENTE)', async () => {
        render(<SequenceGame />);
        await waitFor(() => {
            expect(require('../utils/gameUtils').generateRandomOptions).toHaveBeenCalledTimes(1); 
        });

        fireEvent.press(screen.getByLabelText('number-option-1')); 
        fireEvent.press(screen.getByLabelText('number-option-5'));
        fireEvent.press(screen.getByLabelText('number-option-3'));
        
        fireEvent.press(screen.getByLabelText('number-option-8')); 

        expect(mockAdvanceGame).not.toHaveBeenCalled();
    });

    test('3. Debería avanzar el juego cuando se selecciona el orden DESCENDENTE correcto [8, 5, 3, 1]', async () => {
        MOCK_CONFIG.upward = false; 
        render(<SequenceGame />);
        await waitFor(() => {
            expect(require('../utils/gameUtils').generateRandomOptions).toHaveBeenCalledTimes(1); 
        });

        fireEvent.press(screen.getByLabelText('number-option-8')); 
        fireEvent.press(screen.getByLabelText('number-option-5'));
        fireEvent.press(screen.getByLabelText('number-option-3'));
        
        fireEvent.press(screen.getByLabelText('number-option-1')); 

        await waitFor(() => {
            expect(mockAdvanceGame).toHaveBeenCalledTimes(1);
        });
    });
    
    // --- PRUEBAS DE UI Y ESTADO ---
    
    test('4. El título debe reflejar la configuración de ordenamiento (DESCENDENTE)', async () => {
        MOCK_CONFIG.upward = false; 
        render(<SequenceGame />);
        
        expect(screen.getByText('Ordena del grande al pequeño')).toBeTruthy();
    });
    
    test('5. Debería resetear el juego al presionar "Jugar de nuevo" en FeedbackScreen', async () => {
        const useGameManagerActual = jest.requireActual('../utils/gameManager').useGameManager as UseGameManagerType;

        const mockFn = jest.fn((gameId: number, onGameInit: OnGameInitType) => {
            
            const manager = useGameManagerActual(gameId, onGameInit);
            
            return {
                ...manager,
                
                modalVisible: true, 
                
                resetGame: mockResetGame,
            };
        }) as jest.Mock<any, [number, OnGameInitType]>; 
        
        const useGameManagerMock = require('../utils/gameManager').useGameManager as jest.Mock<any, [number, OnGameInitType]>;
        useGameManagerMock.mockImplementation(mockFn);

        render(<SequenceGame />);
        
        const playAgainButton = await screen.getByLabelText('Jugar de nuevo');
        fireEvent(playAgainButton, 'onNotify'); 

        await waitFor(() => {
            expect(mockResetGame).toHaveBeenCalledTimes(1);
        });
    });
});
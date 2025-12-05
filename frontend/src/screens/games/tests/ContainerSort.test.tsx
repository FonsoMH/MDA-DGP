import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react-native';

import SequenceGame from '../SequenceGame/SequenceGame'; 
import { generateRandomOptions } from '../utils/gameUtils';
import NumberDisplay from '../../../components/common/NumberDisplays/NumberDisplay';
import { TouchableOpacity } from 'react-native';
import ContainerSort from '../ContainerSort/ContainerSort';
import Container from '../ContainerSort/Container';
import { CORRECT_COLOR } from '../../../types/games';



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

interface ContainerProps {
    'aria-label': string;
    onContainerClick: () => void;

    onUniformityChange: (color: string) => void; 
    items: any[];
}

const CORRECT_COLOR_MOCK = '#00C950';

jest.mock('../ContainerSort/Container', () => {
    const React = require('react');
    const { TouchableOpacity } = require('react-native');

    return (props: ContainerProps) => {

        React.useEffect(() => {
            if (props.items.length > 0) {
                props.onUniformityChange(CORRECT_COLOR_MOCK); 
            }
        }, [props.items]);

        return (

        <TouchableOpacity
            onPress={props.onContainerClick}
            accessibilityLabel={props['aria-label']}
        />)
    };
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


const MOCK_OPTIONS = [1, 3];
jest.mock('../utils/gameUtils', () => ({ 

    generateFixedRepeatedOptions: jest.fn(target => MOCK_OPTIONS), 

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


describe('useGameManager - Core Logic', () => {
    


    beforeEach(() => {
        mockAdvanceGame = jest.fn();
        mockResetGame = jest.fn();
        mockUpdateScore = jest.fn();
        jest.clearAllMocks(); 
    });

    afterEach(() => {
        jest.useRealTimers();
    });


    test('1.  Debería avanzar el juego cuando se seleccionan bien', async() => {
        render(<ContainerSort />);
        
        await waitFor(() => {
            expect(require('../utils/gameUtils').generateFixedRepeatedOptions).toHaveBeenCalledTimes(1); 
        });    



        fireEvent.press(screen.getByLabelText('number-option-1')); 
        fireEvent.press(screen.getByLabelText('Container-Area-0'));

        fireEvent.press(screen.getByLabelText('number-option-3')); 
        fireEvent.press(screen.getByLabelText('Container-Area-1'));
        
        await waitFor(() => {
            expect(mockAdvanceGame).toHaveBeenCalledTimes(1);
        });

    });
    


    test('2. No debería avanzar el juego cuando se seleccionan mal)', async() => {
        render(<ContainerSort />);
        
        await waitFor(() => {
            expect(require('../utils/gameUtils').generateFixedRepeatedOptions).toHaveBeenCalledTimes(1); 
        });    



        fireEvent.press(screen.getByLabelText('number-option-1')); 
        fireEvent.press(screen.getByLabelText('Container-Area-0'));

        fireEvent.press(screen.getByLabelText('number-option-3')); 
        fireEvent.press(screen.getByLabelText('Container-Area-0'));
        
        await waitFor(() => {
            expect(mockAdvanceGame).not.toHaveBeenCalled();
        });
    });


    // // --- D. MANEJO DE REINICIO (resetGame) ---

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

        render(<ContainerSort />);
        
        const playAgainButton = await screen.getByLabelText('Jugar de nuevo');
        fireEvent(playAgainButton, 'onNotify'); 

        await waitFor(() => {
            expect(mockResetGame).toHaveBeenCalledTimes(1);
        });
    });
});
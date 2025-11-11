import { render, fireEvent, screen, waitFor } from '@testing-library/react-native';


import TapNumberGame from '../TapNumberGame/TapNumberGame'; 

const MOCK_TARGET_NUMBER = 5;
const MOCK_OPTIONS = [1, 5, 8, 3];
jest.mock('../utils/gameUtils', () => ({

    getRandomNumber: jest.fn(() => MOCK_TARGET_NUMBER), 

    generateOptionsWithTarget: jest.fn(target => MOCK_OPTIONS), 

    DEFAULT_REPEATS: 5, 
}));


let mockPlayTTS: jest.Mock;
jest.mock('../../../components/ttsListener', () => {

    mockPlayTTS = jest.fn(); 
    

    return {
        playTTS: mockPlayTTS,
    };
});

const MOCK_USER_ID = 42;
jest.mock('../../../hooks/useUser', () => ({
    useUser: jest.fn(() => ({
        user: { id: MOCK_USER_ID } 
    })),
}));

const MOCK_MAX_RANGE = 10;
const MOCK_OPTIONS_COUNT = 4;
const MOCK_CONFIG = { ranges: MOCK_MAX_RANGE, numElements: MOCK_OPTIONS_COUNT };
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
    onPress: () => void;
    testID: string;
}
jest.mock('../../../components/common/NumberDisplays/NumberDisplay', () => {

    return ({ numberProp, onPress }: NumberDisplayProps) => (
        <button onClick={onPress} aria-label={`number-option-${numberProp}`}>{numberProp.toString()}</button>
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
jest.mock('../../../../assets/icons/listen.png', () => 0); 
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




describe('TapNumberGame - Interacción y Lógica', () => {

    beforeEach(() => {
        jest.clearAllMocks(); 
    });


    test('1. Debería inicializar el juego y reproducir el TTS del número objetivo', async () => {

        render(<TapNumberGame />);

        await waitFor(() => {
            expect(require('../utils/gameUtils').getRandomNumber).toHaveBeenCalledTimes(1); 
        });

        expect(mockPlayTTS).toHaveBeenCalledWith(MOCK_TARGET_NUMBER.toString());
        
        const correctButton = await screen.getByLabelText('number-option-5');
        const otherButton = await screen.getByLabelText('number-option-1');


        expect(otherButton).toBeTruthy();
        expect(correctButton!).toBeTruthy();
    });

    // --- PRUEBAS DE INTERACCIÓN ---

    test('2. Debería avanzar el juego (acierto) al tocar el número objetivo (5)', async () => {
        
        render(<TapNumberGame />);
        
        
        await waitFor(() => {
            expect(require('../utils/gameUtils').getRandomNumber).toHaveBeenCalledTimes(1); 
        });

        
        const correctButton = await screen.getByLabelText(`number-option-${MOCK_TARGET_NUMBER.toString()}`); 
        fireEvent.press(correctButton); 

        
        await waitFor(() => {
            expect(mockAdvanceGame).toHaveBeenCalledTimes(1);
        });

    });

    test('3. NO debería avanzar el juego (error) al tocar un número incorrecto (1)', async () => {
        render(<TapNumberGame />);
        
        
        await waitFor(() => {
            expect(require('../utils/gameUtils').getRandomNumber).toHaveBeenCalledTimes(1); 
        });

        
        const otherButton = await screen.getByLabelText(`number-option-1`); 
        fireEvent.press(otherButton); 

        
        await waitFor(() => {
            expect(mockAdvanceGame).not.toHaveBeenCalledTimes(1);
        });
    });

    // --- PRUEBAS DE ACCESIBILIDAD ---

    test('4. Debería reproducir el TTS al presionar el botón de escuchar', async () => {
        render(<TapNumberGame />);

        await waitFor(() => {
            expect(mockPlayTTS).toHaveBeenCalledTimes(1);
        });

        const listenButton = screen.getByLabelText('Botón de imagen');
        fireEvent.press(listenButton);

        expect(mockPlayTTS).toHaveBeenCalledTimes(2); 
        expect(mockPlayTTS).toHaveBeenCalledWith(MOCK_TARGET_NUMBER.toString());
    });
    
    // --- PRUEBAS DE FIN DE JUEGO ---

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

        render(<TapNumberGame />);
        
        const playAgainButton = await screen.getByLabelText('Jugar de nuevo');
        fireEvent(playAgainButton, 'onNotify'); 

        await waitFor(() => {
            expect(mockResetGame).toHaveBeenCalledTimes(1);
        });
    });
});
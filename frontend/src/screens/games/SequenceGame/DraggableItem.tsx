import React from 'react';
import { StyleProp, ViewStyle, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { 
    useSharedValue, 
    useAnimatedRef, 
    withSpring, 
    useAnimatedStyle,
    SharedValue,
} from "react-native-reanimated";

import { runOnJS, scheduleOnRN } from 'react-native-worklets'

type Layout = { x: number; y: number; width: number; height: number; };

interface DraggableItemProps {
    onDrop?: (targetIndex: number) => void; 
    onStart?: () => void;
    onPress: () => void; 
    dropZonesLayouts: SharedValue<Layout[] | null>; 
    style?: StyleProp<ViewStyle>;
    isDisabled: boolean;
    children: React.ReactNode;
    testID: string;
    comeBack: boolean;
}

const DraggableItem: React.FC<DraggableItemProps> = ({ 
    onDrop, 
    onStart,
    onPress,
    dropZonesLayouts,
    style,
    isDisabled,
    children,
    testID, 
    comeBack
}) => {
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const startOffset = useSharedValue({ x: 0, y: 0 });
    const itemRef = useAnimatedRef<View>(); 
    const startPosition = useSharedValue({ x: 0, y: 0 });

    const measureItem = () => {
        if (itemRef.current) {
            (itemRef.current as any).measureInWindow((x: number, y: number) => {
                startPosition.value = { x, y };
            });
        }
    };

    const tapGesture = Gesture.Tap()
        .enabled(!isDisabled)
        .onEnd(() => {
            scheduleOnRN(onPress);
        });

    const panGesture = Gesture.Pan()
    .enabled(!isDisabled) 
    .onStart(() => {
        startOffset.value = { x: translateX.value, y: translateY.value };
        scheduleOnRN(measureItem);
        
        if (onStart) {
            scheduleOnRN(onStart);
        }
    })
    .onUpdate((event) => {
        translateX.value = startOffset.value.x + event.translationX;
        translateY.value = startOffset.value.y + event.translationY;
    })
    .onEnd(() => {
        'worklet'; 

        const dropZones = dropZonesLayouts.value;
        
        if (!dropZones || dropZones.length === 0) {
            translateX.value = withSpring(0);
            translateY.value = withSpring(0);
            return;
        }
        
        const finalX = startPosition.value.x + translateX.value;
        const finalY = startPosition.value.y + translateY.value;

        let isOverAnyDropZone = false;
        let successfulIndex = -1; 

        for (let i = 0; i < dropZones.length; i++) {
            const dropZone = dropZones[i];
            
            if (!dropZone) continue;
            
            const isOverThisDropZone = 
                finalX > dropZone.x &&
                finalX < dropZone.x + dropZone.width &&
                finalY > dropZone.y &&
                finalY < dropZone.y + dropZone.height;

            if (isOverThisDropZone) {
                isOverAnyDropZone = true;
                successfulIndex = i;
                break;
            }
        }
        
        if (isOverAnyDropZone && onDrop) {
            runOnJS(onDrop)(successfulIndex);        
        }
        
        if(comeBack || successfulIndex == -1){
            translateX.value = withSpring(0);
            translateY.value = withSpring(0);
        }
    });

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { translateX: translateX.value },
                { translateY: translateY.value },
            ],
        } as ViewStyle;
    });

    const combinedGesture = Gesture.Race(tapGesture, panGesture);

    return (
        <GestureDetector gesture={combinedGesture}>
            <Animated.View ref={itemRef as any} onLayout={measureItem} 
            style={[style, animatedStyle]}
            testID={testID}
            >
                {children}
            </Animated.View>
        </GestureDetector>
    );
};

export default DraggableItem;
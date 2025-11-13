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

import { scheduleOnRN } from 'react-native-worklets'

type Layout = { x: number; y: number; width: number; height: number; };

interface DraggableItemProps {
    onDrop: () => void; 
    onPress: () => void; 
    dropZoneLayout: SharedValue<Layout | null>; 
    style: StyleProp<ViewStyle>;
    isDisabled: boolean;
    children: React.ReactNode;
    testID: string;
}

const DraggableItem: React.FC<DraggableItemProps> = ({ 
    onDrop, 
    onPress,
    dropZoneLayout,
    style,
    isDisabled,
    children,
    testID
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
        })
        .onUpdate((event) => {
            translateX.value = startOffset.value.x + event.translationX;
            translateY.value = startOffset.value.y + event.translationY;
        })
        .onEnd(() => {
            const dropZone = dropZoneLayout.value;
            if (!dropZone) {
                translateX.value = withSpring(0);
                translateY.value = withSpring(0);
                return;
            }

            const finalX = startPosition.value.x + translateX.value;
            const finalY = startPosition.value.y + translateY.value;
            
            const isOverDropZone = 
                finalX > dropZone.x &&
                finalX < dropZone.x + dropZone.width &&
                finalY > dropZone.y &&
                finalY < dropZone.y + dropZone.height;

            if (isOverDropZone) {
                scheduleOnRN(onDrop);
            }
            
            translateX.value = withSpring(0);
            translateY.value = withSpring(0);
        });

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { translateX: translateX.value },
                { translateY: translateY.value },
            ],
            // zIndex: (translateX.value !== 0 || translateY.value !== 0) ? 9999 : 1,
        };
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
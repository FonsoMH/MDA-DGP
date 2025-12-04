import React from 'react';
import { Animated, Easing } from 'react-native';

type BounceDisplayProps = {
    isBouncing: boolean;
    loop?: boolean;
    children: React.ReactNode;
    onAnimationEnd: () => void;
};

export default function BounceDisplay({ isBouncing, loop = false, children, onAnimationEnd }: BounceDisplayProps) {

    const scaleValue = React.useRef(new Animated.Value(1)).current;

    React.useEffect(() => {
        if (loop && isBouncing) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(scaleValue, {
                        toValue: 1.05,
                        duration: 400,
                        easing: Easing.out(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.timing(scaleValue, {
                        toValue: 1,
                        duration: 400,
                        easing: Easing.in(Easing.ease),
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        } else if (isBouncing) {
            Animated.sequence([
                Animated.timing(scaleValue, {
                    toValue: 1.1,
                    duration: 150,
                    easing: Easing.out(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(scaleValue, {
                    toValue: 1,
                    duration: 150,
                    easing: Easing.in(Easing.ease),
                    useNativeDriver: true,
                }),
            ]).start(() => {
                onAnimationEnd();
            });
        } else {
            scaleValue.setValue(1);
        }
    }, [isBouncing, loop, scaleValue]);

    return (
        <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
            {children}
        </Animated.View>
    );

}
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
        let animation; // Guardamos referencia a la animación

    if (isBouncing) {
      // Configuramos la secuencia
        const sequence = Animated.sequence([
            Animated.timing(scaleValue, {
                toValue: loop ? 1.05 : 1.1,
                duration: loop ? 400 : 150,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            }),
            Animated.timing(scaleValue, {
                toValue: 1,
                duration: loop ? 400 : 150,
                easing: Easing.in(Easing.ease),
                useNativeDriver: true,
            }),
        ]);

        if (loop) {
            animation = Animated.loop(sequence);
            animation.start();
        } else {
            animation = sequence;
            animation.start(({ finished }) => {
                if (finished) onAnimationEnd();
            });
        }
        } else {
            scaleValue.stopAnimation(); 
            scaleValue.setValue(1);
        }

        return () => {
            if (animation) animation.stop();
            scaleValue.stopAnimation();
        };
    }, [isBouncing, loop, scaleValue]);

    return (
        <Animated.View style={{ transform: [{ scale: scaleValue }], flex: 1 }}>
            {children}
        </Animated.View>
    );

}
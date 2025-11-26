import React, { useCallback } from 'react';
import { TouchableOpacity, Text, StyleSheet, Image, Platform, ActivityIndicator, FlexAlignType } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useGameSession } from '../hooks/useGameSession';

interface GameBackButtonProps {
  width: number;
  height: number;
  alignSelf?: FlexAlignType;
  session: ReturnType<typeof useGameSession>;
  // Cuando es true, si hay un error ya marcado en la ronda en curso,
  // contamos esa ronda como fallo al abandonar.
  countInProgressErrorAsFailure?: boolean;
}

const BASE_ICON_SIZE = 28;
const BASE_FONT_SIZE = 18;
const BASE_BUTTON_HEIGHT = 48;

export const GameBackButton: React.FC<GameBackButtonProps> = ({ width, height, alignSelf = 'flex-start', session, countInProgressErrorAsFailure = false }) => {
  const navigation = useNavigation();

  const scaleFactor = height / BASE_BUTTON_HEIGHT;
  const newIconSize = BASE_ICON_SIZE * scaleFactor;
  const newFontSize = BASE_FONT_SIZE * scaleFactor;
  const newPaddingVertical = 12 * scaleFactor;
  const newPaddingHorizontal = 25 * scaleFactor;

  const handlePress = useCallback(async () => {
    // Si no hay rondas resueltas y no hay error en la ronda actual, no enviamos resultados.
    const resolvedRounds = session.stats.successfulPlays + session.stats.failedPlays;

    if (countInProgressErrorAsFailure && session.hasErrorThisRound) {
      // Contar la ronda en curso con error como fallo al abandonar.
      const override = {
        ...session.stats,
        abandoned: true,
        failedPlays: session.stats.failedPlays + 1,
      };
      await session.completeSession(override);
    } else {
      // Comportamiento por defecto: el hook ya evita POST si resolvedRounds === 0
      await session.abandonSession();
    }
    navigation.goBack();
  }, [session, navigation, countInProgressErrorAsFailure]);

  return (
    <TouchableOpacity
      disabled={session.isSubmitting}
      onPress={handlePress}
      style={[
        styles.button,
        {
          width,
          height,
          alignSelf,
          paddingVertical: newPaddingVertical,
          paddingHorizontal: newPaddingHorizontal,
          opacity: session.isSubmitting ? 0.6 : 1,
        },
      ]}
    >
      <Text style={[styles.text, { fontSize: newFontSize }]}>
        {session.isSubmitting ? 'Guardando…' : 'Volver'}
      </Text>
      {session.isSubmitting ? (
        <ActivityIndicator size="small" color="#333" />
      ) : (
        <Image
          source={require('../../../../assets/icons/return.png')}
          style={[styles.icon, { width: newIconSize, height: newIconSize }]}
        />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 60,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  text: {
    fontWeight: '500',
    color: '#333333',
    marginRight: 10,
  },
  icon: {
    resizeMode: 'contain',
    tintColor: '#333333',
  },
});

export default GameBackButton;

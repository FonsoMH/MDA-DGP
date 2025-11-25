import React, { useCallback } from 'react';
import { TouchableOpacity, Text, StyleSheet, Image, Platform, ActivityIndicator, FlexAlignType } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useGameSession } from '../hooks/useGameSession';

interface GameBackButtonProps {
  width: number;
  height: number;
  alignSelf?: FlexAlignType;
  session: ReturnType<typeof useGameSession>;
}

const BASE_ICON_SIZE = 28;
const BASE_FONT_SIZE = 18;
const BASE_BUTTON_HEIGHT = 48;

export const GameBackButton: React.FC<GameBackButtonProps> = ({ width, height, alignSelf = 'flex-start', session }) => {
  const navigation = useNavigation();

  const scaleFactor = height / BASE_BUTTON_HEIGHT;
  const newIconSize = BASE_ICON_SIZE * scaleFactor;
  const newFontSize = BASE_FONT_SIZE * scaleFactor;
  const newPaddingVertical = 12 * scaleFactor;
  const newPaddingHorizontal = 25 * scaleFactor;

  const handlePress = useCallback(async () => {
    // Marcar abandono sólo si la sesión no ha sido enviada aún y no se completó.
    await session.abandonSession();
    navigation.goBack();
  }, [session, navigation]);

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

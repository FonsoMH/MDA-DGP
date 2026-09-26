import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Image, FlexAlignType, Platform } from 'react-native';
import { CommonActions, useNavigation, useRoute } from '@react-navigation/native';
import { useUser } from '../../../hooks/useUser';

interface BackProps {
    width: number
    height: number
    alignSelf?: FlexAlignType
    testID?: string
}

const BASE_ICON_SIZE = 28;
const BASE_FONT_SIZE = 18;
const BASE_BUTTON_HEIGHT = 48;

//TODO nombre de la main de profe
const HOME_SCREENS = ['GameMenu', 'UserList', 'TeacherStudentList'];

function BackButton({ width, height, alignSelf = 'flex-start', testID }: BackProps){
  const navigation = useNavigation();

  const route = useRoute();

  const canGoBack = navigation.canGoBack(); 

  if (!canGoBack) {
    return null; 
  }

  const { logout } = useUser();

  const scaleFactor = height / BASE_BUTTON_HEIGHT;

  const newIconSize = BASE_ICON_SIZE * scaleFactor;
  const newFontSize = BASE_FONT_SIZE * scaleFactor;
  const newPaddingVertical = 12 * scaleFactor;
  const newPaddingHorizontal = 25 * scaleFactor;

  const isHomeScreen = HOME_SCREENS.includes(route.name);

  const handlePress = () => {
    if (isHomeScreen) {
        logout();
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [
              { name: 'Login' },
            ],
          })
        );
        return;
    }

    navigation.goBack();
    
  };

  return (
    <TouchableOpacity
    testID="back-button"
      onPress={handlePress}
      style={[
        styles.button,
        { 
          width: width,
          height: height,
          alignSelf: alignSelf,
          
          paddingVertical: newPaddingVertical,
          paddingHorizontal: newPaddingHorizontal,
        }
      ]}
    >
      <Text style={[styles.text, { fontSize: newFontSize }]}>Volver</Text>
      
      <Image 
        source={require('../../../../assets/icons/return.png')} 
        style={[styles.icon, { width: newIconSize, height: newIconSize }]} 
      />
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

export default BackButton;
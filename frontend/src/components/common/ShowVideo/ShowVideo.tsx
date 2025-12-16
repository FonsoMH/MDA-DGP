import React, {useState} from 'react';
import { TouchableOpacity, Text, StyleSheet, Image, FlexAlignType, Modal, View} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
interface ShowVideoButtonProps {
  width: number;
  height: number;
  alignSelf?: FlexAlignType;
  testID?: string;
  // Corregido: 'require(...)' devuelve un número (o 'any' para ser flexible)
  videoSource: any; 
}

const BASE_ICON_SIZE = 28;
const BASE_FONT_SIZE = 18;
const BASE_BUTTON_HEIGHT = 48;


function ShowVideoButton({
  width,
  height,
  alignSelf = 'flex-start',
  testID,
  videoSource, 
}: ShowVideoButtonProps) {

  const [modalVisible, setModalVisible] = useState(false);

  const scaleFactor = height / BASE_BUTTON_HEIGHT;
  const newIconSize = BASE_ICON_SIZE * scaleFactor;
  const newFontSize = BASE_FONT_SIZE * scaleFactor;
  const newPaddingVertical = 12 * scaleFactor;
  const newPaddingHorizontal = 25 * scaleFactor;

  // Función para cerrar y asegurar que el video se detenga
  const handleCloseModal = () => {
    setModalVisible(false);
  }

  return (
    <>
      <TouchableOpacity
        testID={testID}
        onPress={() => setModalVisible(true)}
        style={[
          styles.button,
          {
            width,
            height,
            alignSelf,
            paddingVertical: newPaddingVertical,
            paddingHorizontal: newPaddingHorizontal,
          },
        ]}
      >
        <Text style={[styles.text, { fontSize: newFontSize }]}>
          Video Ayuda
        </Text>

        <Image
          source={require('../../../../assets/icons/tutorial.png')}
          style={[styles.icon, { width: newIconSize, height: newIconSize }]}
        />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.overlay}>
          <View style={styles.modalContent}>
            <View style={styles.videoContainer}>
              <Video
                source={videoSource}
                style={styles.video}
                useNativeControls
                shouldPlay={modalVisible}
                resizeMode={ResizeMode.CONTAIN}
              />
            </View>

            <TouchableOpacity
              onPress={handleCloseModal}
              style={styles.closeButton}
            >
              <Text style={styles.closeText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

export default ShowVideoButton;

const styles = StyleSheet.create({
 button: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#F5F5F5', 
  borderRadius: 12,      
  borderWidth: 2,       
  borderColor: '#CCCCCC',
 },
 text: {
  fontWeight: '600',     
  color: '#222222',      
  marginRight: 8,
 },
 icon: {
  resizeMode: 'contain',
  tintColor: '#222222',    
 },
 overlay: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.5)', 
  justifyContent: 'center',
  alignItems: 'center',
 },
modalContent: {
  width: '95%',
  height: '80%',
  backgroundColor: '#FFFFFF',
  borderRadius: 16,
  padding: 12,
},

videoContainer: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
},

video: {
  width: '100%',
  height: '100%',
},
 closeButton: {
  marginTop: 16, 
  alignSelf: 'center',
  backgroundColor: '#E0E0E0', 
  paddingVertical: 8,
  paddingHorizontal: 16,
  borderRadius: 8,
 },
 closeText: {
  color: '#222222',
  fontSize: 16,
  fontWeight: '600',
 },
});
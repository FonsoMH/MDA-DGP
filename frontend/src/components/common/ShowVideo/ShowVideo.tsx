import React, {useState} from 'react';
import { TouchableOpacity, Text, StyleSheet, Image, FlexAlignType, Platform, Modal, View} from 'react-native';
import Video from 'react-native-video';

interface ShowVideoButtonProps {
  width: number;
  height: number;
  alignSelf?: FlexAlignType;
  testID?: string;
  videoSource: { uri: NodeRequire }; 
}

const BASE_ICON_SIZE = 28;
const BASE_FONT_SIZE = 18;
const BASE_BUTTON_HEIGHT = 48;


function ShowVideoButton({
  width,
  height,
  alignSelf = 'flex-start',
  testID,
  videoSource, // Recibe el videoSource como prop
}: ShowVideoButtonProps) {

  // Eliminar: const route = useRoute();
  const [modalVisible, setModalVisible] = useState(false);

  // Eliminar: const videoSource = HELP_VIDEOS[route.name];

  const scaleFactor = height / BASE_BUTTON_HEIGHT;
  const newIconSize = BASE_ICON_SIZE * scaleFactor;
  const newFontSize = BASE_FONT_SIZE * scaleFactor;
  const newPaddingVertical = 12 * scaleFactor;
  const newPaddingHorizontal = 25 * scaleFactor;



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
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.modalContent}>
            {/* Usamos el videoSource recibido como prop */}
            <Video
              source={videoSource} 
              style={styles.video}
              controls
              fullscreen={false}
              resizeMode="contain"
              fullscreenAutorotate={false}
              fullscreenOrientation="portrait"
            />

            <TouchableOpacity
              onPress={() => setModalVisible(false)}
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
    padding: 16,
  },
  video: {
    width: '100%',
    flex: 1,
  },
  closeButton: {
    marginTop: -75,
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

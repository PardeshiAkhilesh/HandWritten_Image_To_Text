import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Alert,
  Modal,
  ScrollView,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Camera, CameraView } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as Animatable from 'react-native-animatable';
import { Image } from 'expo-image';
import Preloader from '@/components/preloader';

const { width, height } = Dimensions.get('window');

interface Medicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  sideEffects: string[];
}

export default function ScanPage() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameraVisible, setCameraVisible] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<Medicine | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    getCameraPermissions();
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const getCameraPermissions = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  const takePicture = async (camera: any) => {
    if (camera) {
      try {
        const photo = await camera.takePictureAsync({
          quality: 0.8,
          base64: true,
        });
        setSelectedImage(photo.uri);
        setCameraVisible(false);
        analyzeImage(photo.uri);
      } catch (error) {
        Alert.alert('Error', 'Failed to take picture');
      }
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      analyzeImage(result.assets[0].uri);
    }
  };

  const analyzeImage = async (imageUri: string) => {
    setAnalyzing(true);
    
    // Simulate AI analysis
    setTimeout(() => {
      const mockResult: Medicine = {
        name: 'Paracetamol',
        dosage: '500mg',
        frequency: 'Every 6 hours',
        duration: '5 days',
        instructions: 'Take with food. Do not exceed 4 tablets in 24 hours.',
        sideEffects: ['Nausea', 'Dizziness', 'Skin rash (rare)'],
      };
      
      setResult(mockResult);
      setAnalyzing(false);
    }, 3000);
  };

  const saveToMedicines = () => {
    Alert.alert(
      'Success',
      'Medicine added to your collection!',
      [
        {
          text: 'Set Reminder',
          onPress: () => {
            // Navigate to reminder setup
            Alert.alert('Reminder', 'Reminder feature will be implemented');
          },
        },
        { text: 'OK' },
      ]
    );
    setResult(null);
    setSelectedImage(null);
  };

  const ScanOption = ({ icon, title, description, onPress, color }: any) => (
    <Animatable.View animation="fadeInUp" delay={300}>
      <TouchableOpacity style={styles.scanOption} onPress={onPress}>
        <LinearGradient
          colors={[color, color + '80']}
          style={styles.optionGradient}
        >
          <Ionicons name={icon} size={40} color="white" />
        </LinearGradient>
        <View style={styles.optionContent}>
          <Text style={styles.optionTitle}>{title}</Text>
          <Text style={styles.optionDescription}>{description}</Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#bdc3c7" />
      </TouchableOpacity>
    </Animatable.View>
  );

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text>No access to camera</Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={getCameraPermissions}
        >
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <Animated.View
          style={[
            styles.headerContent,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Animatable.View animation="pulse" iterationCount="infinite" duration={2000}>
            <Ionicons name="scan" size={60} color="white" />
          </Animatable.View>
          <Text style={styles.title}>Scan Prescription</Text>
          <Text style={styles.subtitle}>
            Use AI to recognize medicines from prescriptions
          </Text>
        </Animated.View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.optionsContainer}>
          <ScanOption
            icon="camera"
            title="Take Photo"
            description="Capture prescription with camera"
            color="#4A90E2"
            onPress={() => setCameraVisible(true)}
          />
          
          <ScanOption
            icon="images"
            title="Choose from Gallery"
            description="Select existing prescription image"
            color="#27AE60"
            onPress={pickImage}
          />
          
          <ScanOption
            icon="document-text"
            title="Manual Entry"
            description="Type medicine details manually"
            color="#E74C3C"
            onPress={() => Alert.alert('Manual Entry', 'Manual entry feature will be implemented')}
          />
        </View>

        {selectedImage && (
          <Animatable.View animation="fadeInUp" style={styles.imagePreview}>
            <Text style={styles.sectionTitle}>Selected Image</Text>
            <Image source={{ uri: selectedImage }} style={styles.previewImage} />
          </Animatable.View>
        )}

        {analyzing && (
          <Animatable.View animation="fadeInUp" style={styles.analyzingContainer}>
            <Animatable.View
              animation="rotate"
              iterationCount="infinite"
              duration={1000}
            >
              <Ionicons name="sync" size={40} color="#4A90E2" />
            </Animatable.View>
            <Text style={styles.analyzingText}>Analyzing prescription...</Text>
            <Text style={styles.analyzingSubtext}>
              Our AI is reading the handwriting and identifying medicines
            </Text>
          </Animatable.View>
        )}

        {result && (
          <Animatable.View animation="fadeInUp" style={styles.resultContainer}>
            <Text style={styles.sectionTitle}>Analysis Result</Text>
            
            <View style={styles.medicineCard}>
              <View style={styles.medicineHeader}>
                <Ionicons name="medical" size={24} color="#4A90E2" />
                <Text style={styles.medicineName}>{result.name}</Text>
              </View>
              
              <View style={styles.medicineDetails}>
                <DetailRow icon="fitness" label="Dosage" value={result.dosage} />
                <DetailRow icon="time" label="Frequency" value={result.frequency} />
                <DetailRow icon="calendar" label="Duration" value={result.duration} />
              </View>
              
              <View style={styles.instructionsSection}>
                <Text style={styles.instructionsTitle}>Instructions</Text>
                <Text style={styles.instructionsText}>{result.instructions}</Text>
              </View>
              
              <View style={styles.sideEffectsSection}>
                <Text style={styles.sideEffectsTitle}>Possible Side Effects</Text>
                {result.sideEffects.map((effect, index) => (
                  <Text key={index} style={styles.sideEffectItem}>• {effect}</Text>
                ))}
              </View>
              
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={saveToMedicines}
                >
                  <LinearGradient
                    colors={['#27AE60', '#2ECC71']}
                    style={styles.gradientButton}
                  >
                    <Ionicons name="checkmark" size={20} color="white" />
                    <Text style={styles.saveButtonText}>Save Medicine</Text>
                  </LinearGradient>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={() => {
                    setResult(null);
                    setSelectedImage(null);
                  }}
                >
                  <Text style={styles.retryButtonText}>Scan Another</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animatable.View>
        )}
      </ScrollView>

      {/* Camera Modal */}
      <Modal visible={cameraVisible} animationType="slide">
        <View style={styles.cameraContainer}>
          <CameraView
            style={styles.camera}
            ref={(ref) => {
              if (ref) {
                // Camera ref setup
              }
            }}
          >
            <View style={styles.cameraOverlay}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setCameraVisible(false)}
              >
                <Ionicons name="close" size={30} color="white" />
              </TouchableOpacity>
              
              <View style={styles.captureContainer}>
                <TouchableOpacity
                  style={styles.captureButton}
                  onPress={() => {
                    // takePicture implementation would go here
                    Alert.alert('Capture', 'Camera capture will be implemented');
                  }}
                >
                  <View style={styles.captureButtonInner} />
                </TouchableOpacity>
              </View>
            </View>
          </CameraView>
        </View>
      </Modal>
      
      <Preloader visible={analyzing} text="Analyzing prescription..." />
    </View>
  );
}

const DetailRow = ({ icon, label, value }: { icon: string; label: string; value: string }) => (
  <View style={styles.detailRow}>
    <Ionicons name={icon as any} size={16} color="#7f8c8d" />
    <Text style={styles.detailLabel}>{label}:</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    height: height * 0.25,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  headerContent: {
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 15,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  optionsContainer: {
    marginBottom: 30,
  },
  scanOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  optionGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  optionDescription: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  imagePreview: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginTop: 10,
  },
  analyzingContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 30,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  analyzingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 15,
  },
  analyzingSubtext: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    marginTop: 8,
  },
  resultContainer: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  medicineCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  medicineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  medicineName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginLeft: 10,
  },
  medicineDetails: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginLeft: 8,
    marginRight: 8,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  instructionsSection: {
    marginBottom: 20,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: '#7f8c8d',
    lineHeight: 20,
  },
  sideEffectsSection: {
    marginBottom: 20,
  },
  sideEffectsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  sideEffectItem: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  actionButtons: {
    gap: 10,
  },
  saveButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  retryButton: {
    borderWidth: 2,
    borderColor: '#4A90E2',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#4A90E2',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
  },
  captureContainer: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
  },
  permissionButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 20,
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Alert,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Animatable from 'react-native-animatable';
import * as Notifications from 'expo-notifications';
import NotificationBanner from '@/components/notification-banner';
import { medicineTracker } from '@/services/medicine-tracker';

const { width, height } = Dimensions.get('window');

interface Medicine {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  times: string[];
  duration: string;
  instructions: string;
  reminderEnabled: boolean;
  color: string;
  taken: boolean[];
}

const mockMedicines: Medicine[] = [
  {
    id: '1',
    name: 'Paracetamol',
    dosage: '500mg',
    frequency: 'Every 6 hours',
    times: ['08:00', '14:00', '20:00'],
    duration: '5 days',
    instructions: 'Take with food',
    reminderEnabled: true,
    color: '#4A90E2',
    taken: [true, false, false],
  },
  {
    id: '2',
    name: 'Amoxicillin',
    dosage: '250mg',
    frequency: 'Twice daily',
    times: ['09:00', '21:00'],
    duration: '7 days',
    instructions: 'Complete the course',
    reminderEnabled: true,
    color: '#27AE60',
    taken: [true, false],
  },
  {
    id: '3',
    name: 'Vitamin D3',
    dosage: '1000 IU',
    frequency: 'Once daily',
    times: ['08:00'],
    duration: 'Ongoing',
    instructions: 'Take with breakfast',
    reminderEnabled: false,
    color: '#F39C12',
    taken: [false],
  },
];

export default function MedicinesPage() {
  const [medicines, setMedicines] = useState<Medicine[]>(mockMedicines);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [reminderModalVisible, setReminderModalVisible] = useState(false);
  const [newReminderTime, setNewReminderTime] = useState('');
  const [notification, setNotification] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: 'medicine' | 'reminder' | 'success' | 'error';
  }>({ visible: false, title: '', message: '', type: 'medicine' });
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    setupNotifications();
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const setupNotifications = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please enable notifications for medicine reminders');
    }
  };

  const filteredMedicines = medicines.filter(medicine =>
    medicine.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const markAsTaken = (medicineId: string, timeIndex: number) => {
    setMedicines(prev =>
      prev.map(medicine => {
        if (medicine.id === medicineId) {
          const newTaken = [...medicine.taken];
          const wasTaken = newTaken[timeIndex];
          newTaken[timeIndex] = !newTaken[timeIndex];
          
          // Show notification
          if (!wasTaken) {
            setNotification({
              visible: true,
              title: 'Medicine Taken',
              message: `${medicine.name} marked as taken`,
              type: 'success',
            });
          }
          
          return { ...medicine, taken: newTaken };
        }
        return medicine;
      })
    );
  };

  const deleteMedicine = (medicineId: string) => {
    Alert.alert(
      'Delete Medicine',
      'Are you sure you want to delete this medicine?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setMedicines(prev => prev.filter(med => med.id !== medicineId));
            setNotification({
              visible: true,
              title: 'Medicine Deleted',
              message: 'Medicine removed from your collection',
              type: 'error',
            });
          },
        },
      ]
    );
  };

  const toggleReminder = (medicineId: string) => {
    setMedicines(prev =>
      prev.map(medicine => {
        if (medicine.id === medicineId) {
          return { ...medicine, reminderEnabled: !medicine.reminderEnabled };
        }
        return medicine;
      })
    );
  };

  const scheduleNotification = async (medicine: Medicine) => {
    for (let i = 0; i < medicine.times.length; i++) {
      const time = medicine.times[i];
      const [hours, minutes] = time.split(':').map(Number);
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Medicine Reminder',
          body: `Time to take ${medicine.name} (${medicine.dosage})`,
          sound: true,
        },
        trigger: {
          hour: hours,
          minute: minutes,
          repeats: true,
        },
      });
    }
  };

  const MedicineCard = ({ medicine, index }: { medicine: Medicine; index: number }) => (
    <Animatable.View
      animation="fadeInUp"
      delay={index * 150}
      style={styles.medicineCard}
    >
      <TouchableOpacity
        onPress={() => setSelectedMedicine(medicine)}
        style={styles.cardContent}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.medicineIcon, { backgroundColor: medicine.color }]}>
            <Ionicons name="medical" size={24} color="white" />
          </View>
          <View style={styles.medicineInfo}>
            <Text style={styles.medicineName}>{medicine.name}</Text>
            <Text style={styles.medicineDosage}>{medicine.dosage} • {medicine.frequency}</Text>
          </View>
          <TouchableOpacity
            onPress={() => toggleReminder(medicine.id)}
            style={styles.reminderButton}
          >
            <Ionicons
              name={medicine.reminderEnabled ? "notifications" : "notifications-off"}
              size={20}
              color={medicine.reminderEnabled ? medicine.color : "#bdc3c7"}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.timesContainer}>
          {medicine.times.map((time, timeIndex) => (
            <TouchableOpacity
              key={timeIndex}
              style={[
                styles.timeSlot,
                {
                  backgroundColor: medicine.taken[timeIndex] ? medicine.color : '#f8f9fa',
                  borderColor: medicine.color,
                }
              ]}
              onPress={() => markAsTaken(medicine.id, timeIndex)}
            >
              <Text style={[
                styles.timeText,
                { color: medicine.taken[timeIndex] ? 'white' : medicine.color }
              ]}>
                {time}
              </Text>
              {medicine.taken[timeIndex] && (
                <Ionicons name="checkmark" size={16} color="white" />
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            {medicine.taken.filter(Boolean).length} of {medicine.times.length} taken today
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${(medicine.taken.filter(Boolean).length / medicine.times.length) * 100}%`,
                  backgroundColor: medicine.color,
                }
              ]}
            />
          </View>
        </View>
      </TouchableOpacity>
    </Animatable.View>
  );

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
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.title}>My Medicines</Text>
          <Text style={styles.subtitle}>
            Manage your medications and reminders
          </Text>
        </Animated.View>
      </LinearGradient>

      <View style={styles.content}>
        {/* Search Bar */}
        <Animatable.View animation="fadeInUp" delay={300} style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#7f8c8d" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search medicines..."
            placeholderTextColor="#bdc3c7"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </Animatable.View>

        {/* Quick Stats */}
        <Animatable.View animation="fadeInUp" delay={500} style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{medicines.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {medicines.reduce((acc, med) => acc + med.taken.filter(Boolean).length, 0)}
            </Text>
            <Text style={styles.statLabel}>Taken Today</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {medicines.filter(med => med.reminderEnabled).length}
            </Text>
            <Text style={styles.statLabel}>Reminders On</Text>
          </View>
        </Animatable.View>

        {/* Medicines List */}
        <ScrollView
          style={styles.medicinesList}
          showsVerticalScrollIndicator={false}
        >
          {filteredMedicines.map((medicine, index) => (
            <MedicineCard key={medicine.id} medicine={medicine} index={index} />
          ))}
          
          {filteredMedicines.length === 0 && (
            <Animatable.View animation="fadeIn" style={styles.emptyState}>
              <Ionicons name="medical-outline" size={60} color="#bdc3c7" />
              <Text style={styles.emptyText}>No medicines found</Text>
              <Text style={styles.emptySubtext}>
                {searchQuery ? 'Try a different search term' : 'Add your first medicine'}
              </Text>
            </Animatable.View>
          )}
        </ScrollView>

        {/* Add Medicine Button */}
        <Animatable.View animation="bounceIn" delay={1000} style={styles.fabContainer}>
          <TouchableOpacity
            style={styles.fab}
            onPress={() => router.push('/add-medicine')}
          >
            <LinearGradient
              colors={['#4A90E2', '#357ABD']}
              style={styles.fabGradient}
            >
              <Ionicons name="add" size={30} color="white" />
            </LinearGradient>
          </TouchableOpacity>
        </Animatable.View>
      </View>

      {/* Medicine Detail Modal */}
      <Modal
        visible={selectedMedicine !== null}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        {selectedMedicine && (
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                onPress={() => setSelectedMedicine(null)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#2c3e50" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>{selectedMedicine.name}</Text>
              <TouchableOpacity
                onPress={() => {
                  setReminderModalVisible(true);
                }}
                style={styles.editButton}
              >
                <Ionicons name="create" size={24} color="#4A90E2" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.detailSection}>
                <Text style={styles.detailTitle}>Dosage Information</Text>
                <DetailRow icon="fitness" label="Dosage" value={selectedMedicine.dosage} />
                <DetailRow icon="time" label="Frequency" value={selectedMedicine.frequency} />
                <DetailRow icon="calendar" label="Duration" value={selectedMedicine.duration} />
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailTitle}>Schedule</Text>
                <View style={styles.scheduleContainer}>
                  {selectedMedicine.times.map((time, index) => (
                    <View key={index} style={styles.scheduleItem}>
                      <Text style={styles.scheduleTime}>{time}</Text>
                      <View style={[
                        styles.scheduleStatus,
                        { backgroundColor: selectedMedicine.taken[index] ? '#27AE60' : '#E74C3C' }
                      ]}>
                        <Text style={styles.scheduleStatusText}>
                          {selectedMedicine.taken[index] ? 'Taken' : 'Pending'}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailTitle}>Instructions</Text>
                <Text style={styles.instructionsText}>{selectedMedicine.instructions}</Text>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => {
                    scheduleNotification(selectedMedicine);
                    Alert.alert('Success', 'Reminders scheduled successfully!');
                  }}
                >
                  <LinearGradient
                    colors={['#27AE60', '#2ECC71']}
                    style={styles.actionGradient}
                  >
                    <Ionicons name="notifications" size={20} color="white" />
                    <Text style={styles.actionButtonText}>Set Reminders</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.secondaryActionButton}
                  onPress={() => {
                    deleteMedicine(selectedMedicine.id);
                    setSelectedMedicine(null);
                  }}
                >
                  <Text style={styles.secondaryActionText}>Delete Medicine</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        )}
      </Modal>
      
      <NotificationBanner
        visible={notification.visible}
        title={notification.title}
        message={notification.message}
        type={notification.type}
        onPress={() => {
          if (notification.type === 'medicine') {
            router.push('/medicines');
          }
        }}
        onDismiss={() => setNotification(prev => ({ ...prev, visible: false }))}
      />
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
    height: height * 0.2,
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
    paddingTop: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 15,
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
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: '#2c3e50',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 5,
  },
  medicinesList: {
    flex: 1,
  },
  medicineCard: {
    backgroundColor: 'white',
    borderRadius: 15,
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
  cardContent: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  medicineIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  medicineInfo: {
    flex: 1,
  },
  medicineName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  medicineDosage: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  reminderButton: {
    padding: 8,
  },
  timesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
    gap: 10,
  },
  timeSlot: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 5,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressContainer: {
    marginTop: 10,
  },
  progressText: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e9ecef',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#7f8c8d',
    marginTop: 15,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bdc3c7',
    marginTop: 5,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  fabGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  closeButton: {
    padding: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  editButton: {
    padding: 5,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  detailSection: {
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
  detailTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
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
  scheduleContainer: {
    gap: 10,
  },
  scheduleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  scheduleTime: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  scheduleStatus: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  scheduleStatusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  instructionsText: {
    fontSize: 14,
    color: '#7f8c8d',
    lineHeight: 20,
  },
  modalActions: {
    gap: 15,
    paddingBottom: 30,
  },
  actionButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryActionButton: {
    borderWidth: 2,
    borderColor: '#E74C3C',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  secondaryActionText: {
    color: '#E74C3C',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
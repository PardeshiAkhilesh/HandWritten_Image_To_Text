import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Animatable from 'react-native-animatable';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NotificationBanner from '@/components/notification-banner';
import { medicineTracker } from '@/services/medicine-tracker';

const { width, height } = Dimensions.get('window');

const quickActions = [
  {
    icon: 'camera',
    title: 'Scan Prescription',
    description: 'Take a photo of your prescription',
    color: '#4A90E2',
    route: '/scan',
  },
  {
    icon: 'images',
    title: 'Upload Image',
    description: 'Select from gallery',
    color: '#27AE60',
    route: '/scan?mode=gallery',
  },
  {
    icon: 'add-circle',
    title: 'Add Manually',
    description: 'Enter medicine details',
    color: '#E74C3C',
    route: '/scan',
  },
  {
    icon: 'notifications',
    title: 'Set Reminder',
    description: 'Create medication alarm',
    color: '#F39C12',
    route: '/scan',
  },
];

const recentMedicines = [
  { name: 'Paracetamol', dosage: '500mg', time: '8:00 AM', status: 'taken' },
  { name: 'Amoxicillin', dosage: '250mg', time: '2:00 PM', status: 'pending' },
  { name: 'Vitamin D3', dosage: '1000 IU', time: '6:00 PM', status: 'missed' },
];

export default function HomePage() {
  const [user, setUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [notification, setNotification] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: 'medicine' | 'reminder' | 'success' | 'error';
  }>({ visible: false, title: '', message: '', type: 'medicine' });
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    checkAuthStatus();
    checkMissedDoses();
    
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
    
    // Check for missed doses every 5 minutes
    const interval = setInterval(checkMissedDoses, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const userData = await AsyncStorage.getItem('userData');
      
      if (token && userData) {
        setUser(JSON.parse(userData));
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.log('Auth check error:', error);
    }
  };

  const checkMissedDoses = async () => {
    try {
      const missedDoses = await medicineTracker.checkMissedDoses();
      if (missedDoses.length > 0) {
        setNotification({
          visible: true,
          title: 'Missed Doses',
          message: `You have ${missedDoses.length} missed medicine${missedDoses.length > 1 ? 's' : ''}`,
          type: 'reminder',
        });
      }
    } catch (error) {
      console.log('Missed dose check error:', error);
    }
  };

  const QuickActionCard = ({ action, index }: { action: any; index: number }) => (
    <Animatable.View
      animation="fadeInUp"
      delay={index * 150}
      style={styles.actionCard}
    >
      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: action.color }]}
        onPress={() => router.push(action.route)}
      >
        <Ionicons name={action.icon as any} size={24} color="white" />
      </TouchableOpacity>
      <Text style={styles.actionTitle}>{action.title}</Text>
      <Text style={styles.actionDescription}>{action.description}</Text>
    </Animatable.View>
  );

  const MedicineItem = ({ medicine, index }: { medicine: any; index: number }) => (
    <Animatable.View
      animation="fadeInLeft"
      delay={index * 100}
      style={styles.medicineItem}
    >
      <View style={styles.medicineInfo}>
        <Text style={styles.medicineName}>{medicine.name}</Text>
        <Text style={styles.medicineDosage}>{medicine.dosage} • {medicine.time}</Text>
      </View>
      <View style={[
        styles.statusBadge,
        { backgroundColor: 
          medicine.status === 'taken' ? '#27AE60' :
          medicine.status === 'pending' ? '#F39C12' : '#E74C3C'
        }
      ]}>
        <Text style={styles.statusText}>{medicine.status}</Text>
      </View>
    </Animatable.View>
  );

  if (!isAuthenticated) {
    // Show landing page for non-authenticated users
    const features = [
      {
        icon: 'camera-outline',
        title: 'Smart OCR',
        description: 'Capture or upload prescription images for instant medicine recognition',
      },
      {
        icon: 'medical-outline',
        title: 'Medicine Analysis',
        description: 'AI-powered analysis of medicines with dosage and timing recommendations',
      },
      {
        icon: 'notifications-outline',
        title: 'Smart Reminders',
        description: 'Set custom alarms and get timely medication notifications',
      },
      {
        icon: 'time-outline',
        title: 'History Tracking',
        description: 'Keep track of all your prescriptions and medication history',
      },
    ];

    const FeatureCard = ({ feature, index }: { feature: any; index: number }) => (
      <Animatable.View
        animation="fadeInUp"
        delay={index * 200}
        style={styles.featureCard}
      >
        <View style={styles.iconContainer}>
          <Ionicons name={feature.icon as any} size={32} color="#4A90E2" />
        </View>
        <Text style={styles.featureTitle}>{feature.title}</Text>
        <Text style={styles.featureDescription}>{feature.description}</Text>
      </Animatable.View>
    );

    return (
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
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
            <Animatable.View animation="pulse" iterationCount="infinite" duration={2000}>
              <Ionicons name="medical" size={80} color="white" />
            </Animatable.View>
            <Text style={styles.title}>MediScan</Text>
            <Text style={styles.subtitle}>
              Your AI-Powered Prescription Assistant
            </Text>
          </Animated.View>
        </LinearGradient>

        <View style={styles.content}>
          <Animatable.Text
            animation="fadeInUp"
            delay={500}
            style={styles.sectionTitle}
          >
            What We Do
          </Animatable.Text>

          <View style={styles.featuresGrid}>
            {features.map((feature, index) => (
              <FeatureCard key={index} feature={feature} index={index} />
            ))}
          </View>

          <Animatable.View
            animation="fadeInUp"
            delay={1000}
            style={styles.ctaSection}
          >
            <Text style={styles.ctaTitle}>Ready to Get Started?</Text>
            <Text style={styles.ctaSubtitle}>
              Join thousands of users managing their medications smartly
            </Text>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => router.push('/auth/signin')}
              >
                <LinearGradient
                  colors={['#4A90E2', '#357ABD']}
                  style={styles.gradientButton}
                >
                  <Text style={styles.primaryButtonText}>Sign In</Text>
                  <Ionicons name="arrow-forward" size={20} color="white" />
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => router.push('/auth/register')}
              >
                <Text style={styles.secondaryButtonText}>Create Account</Text>
              </TouchableOpacity>
            </View>
          </Animatable.View>
        </View>
      </ScrollView>
    );
  }

  // Authenticated user dashboard
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.dashboardHeader}
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
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.userName}>{user?.name || 'User'}</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications" size={24} color="white" />
            <View style={styles.notificationBadge}>
              <Text style={styles.badgeText}>3</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </LinearGradient>

      <View style={styles.content}>
        {/* Quick Actions */}
        <Animatable.Text
          animation="fadeInUp"
          delay={300}
          style={styles.sectionTitle}
        >
          Quick Actions
        </Animatable.Text>

        <View style={styles.actionsGrid}>
          {quickActions.map((action, index) => (
            <QuickActionCard key={index} action={action} index={index} />
          ))}
        </View>

        {/* Today's Medicines */}
        <Animatable.View
          animation="fadeInUp"
          delay={600}
          style={styles.medicinesSection}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Medicines</Text>
            <TouchableOpacity onPress={() => router.push('/medicines')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.medicinesList}>
            {recentMedicines.map((medicine, index) => (
              <MedicineItem key={index} medicine={medicine} index={index} />
            ))}
          </View>
        </Animatable.View>

        {/* Stats Cards */}
        <Animatable.View
          animation="fadeInUp"
          delay={900}
          style={styles.statsSection}
        >
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Ionicons name="checkmark-circle" size={32} color="#27AE60" />
              <Text style={styles.statNumber}>12</Text>
              <Text style={styles.statLabel}>Taken Today</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="time" size={32} color="#F39C12" />
              <Text style={styles.statNumber}>3</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="medical" size={32} color="#4A90E2" />
              <Text style={styles.statNumber}>25</Text>
              <Text style={styles.statLabel}>Total Medicines</Text>
            </View>
          </View>
        </Animatable.View>
      </View>
      
      <NotificationBanner
        visible={notification.visible}
        title={notification.title}
        message={notification.message}
        type={notification.type}
        onPress={() => {
          if (notification.type === 'reminder') {
            router.push('/medicines');
          }
        }}
        onDismiss={() => setNotification(prev => ({ ...prev, visible: false }))}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    height: height * 0.45,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  dashboardHeader: {
    height: height * 0.25,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  headerContent: {
    alignItems: 'center',
    width: '100%',
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  notificationButton: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  notificationBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#E74C3C',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  viewAllText: {
    color: '#4A90E2',
    fontSize: 16,
    fontWeight: '600',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  actionCard: {
    width: (width - 60) / 2,
    alignItems: 'center',
    marginBottom: 20,
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 5,
  },
  actionDescription: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  medicinesSection: {
    marginBottom: 30,
  },
  medicinesList: {
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
  medicineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  medicineInfo: {
    flex: 1,
  },
  medicineName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  medicineDosage: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  statsSection: {
    marginBottom: 30,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    width: (width - 80) / 3,
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
    marginTop: 10,
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
    marginTop: 5,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  featureCard: {
    width: (width - 60) / 2,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0f7ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 18,
  },
  ctaSection: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  ctaTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 10,
  },
  ctaSubtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 30,
  },
  buttonContainer: {
    width: '100%',
    gap: 15,
  },
  primaryButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 30,
    gap: 10,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButton: {
    borderWidth: 2,
    borderColor: '#4A90E2',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#4A90E2',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
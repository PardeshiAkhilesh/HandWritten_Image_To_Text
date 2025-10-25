import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  Alert,
  Animated,
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Animatable from 'react-native-animatable';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

interface UserData {
  name: string;
  email: string;
  joinDate: string;
  totalMedicines: number;
  totalScans: number;
  streakDays: number;
}

interface Settings {
  notifications: boolean;
  reminderSound: boolean;
  darkMode: boolean;
  biometric: boolean;
  autoBackup: boolean;
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserData>({
    name: 'Demo User',
    email: 'demo@mediscan.com',
    joinDate: '2024-01-01',
    totalMedicines: 25,
    totalScans: 12,
    streakDays: 7,
  });
  
  const [settings, setSettings] = useState<Settings>({
    notifications: true,
    reminderSound: true,
    darkMode: false,
    biometric: false,
    autoBackup: true,
  });

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    loadUserData();
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

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const parsedData = JSON.parse(userData);
        setUser(prev => ({ ...prev, ...parsedData }));
      }
    } catch (error) {
      console.log('Error loading user data:', error);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove(['userToken', 'userData']);
              router.replace('/');
            } catch (error) {
              Alert.alert('Error', 'Failed to logout');
            }
          },
        },
      ]
    );
  };

  const updateSetting = (key: keyof Settings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const StatCard = ({ icon, label, value, color }: any) => (
    <Animatable.View animation="fadeInUp" delay={500} style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: color }]}>
        <Ionicons name={icon} size={24} color="white" />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Animatable.View>
  );

  const MenuSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <Animatable.View animation="fadeInUp" delay={700} style={styles.menuSection}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.menuContainer}>
        {children}
      </View>
    </Animatable.View>
  );

  const MenuItem = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    showArrow = true, 
    rightComponent 
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    showArrow?: boolean;
    rightComponent?: React.ReactNode;
  }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuItemLeft}>
        <Ionicons name={icon as any} size={20} color="#4A90E2" />
        <View style={styles.menuItemText}>
          <Text style={styles.menuItemTitle}>{title}</Text>
          {subtitle && <Text style={styles.menuItemSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {rightComponent || (showArrow && (
        <Ionicons name="chevron-forward" size={20} color="#bdc3c7" />
      ))}
    </TouchableOpacity>
  );

  const SettingItem = ({ 
    icon, 
    title, 
    subtitle, 
    value, 
    onValueChange 
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
  }) => (
    <MenuItem
      icon={icon}
      title={title}
      subtitle={subtitle}
      showArrow={false}
      rightComponent={
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: '#e9ecef', true: '#4A90E2' }}
          thumbColor={value ? '#ffffff' : '#f4f3f4'}
        />
      }
    />
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
          <Animatable.View animation="bounceIn" delay={300} style={styles.avatarContainer}>
            <LinearGradient
              colors={['#4A90E2', '#357ABD']}
              style={styles.avatar}
            >
              <Text style={styles.avatarText}>
                {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </Text>
            </LinearGradient>
          </Animatable.View>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          <Text style={styles.joinDate}>
            Member since {new Date(user.joinDate).toLocaleDateString('en-US', {
              month: 'long',
              year: 'numeric'
            })}
          </Text>
        </Animated.View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stats */}
        <View style={styles.statsContainer}>
          <StatCard
            icon="medical"
            label="Medicines"
            value={user.totalMedicines}
            color="#4A90E2"
          />
          <StatCard
            icon="camera"
            label="Scans"
            value={user.totalScans}
            color="#27AE60"
          />
          <StatCard
            icon="flame"
            label="Day Streak"
            value={user.streakDays}
            color="#E74C3C"
          />
        </View>

        {/* Account Settings */}
        <MenuSection title="Account">
          <MenuItem
            icon="person"
            title="Edit Profile"
            subtitle="Update your personal information"
            onPress={() => Alert.alert('Edit Profile', 'Profile editing will be implemented')}
          />
          <MenuItem
            icon="shield-checkmark"
            title="Privacy & Security"
            subtitle="Manage your privacy settings"
            onPress={() => Alert.alert('Privacy', 'Privacy settings will be implemented')}
          />
          <MenuItem
            icon="card"
            title="Subscription"
            subtitle="Manage your premium subscription"
            onPress={() => Alert.alert('Subscription', 'Subscription management will be implemented')}
          />
        </MenuSection>

        {/* App Settings */}
        <MenuSection title="App Settings">
          <SettingItem
            icon="notifications"
            title="Push Notifications"
            subtitle="Receive medicine reminders"
            value={settings.notifications}
            onValueChange={(value) => updateSetting('notifications', value)}
          />
          <SettingItem
            icon="volume-high"
            title="Reminder Sound"
            subtitle="Play sound for reminders"
            value={settings.reminderSound}
            onValueChange={(value) => updateSetting('reminderSound', value)}
          />
          <SettingItem
            icon="moon"
            title="Dark Mode"
            subtitle="Use dark theme"
            value={settings.darkMode}
            onValueChange={(value) => updateSetting('darkMode', value)}
          />
          <SettingItem
            icon="finger-print"
            title="Biometric Lock"
            subtitle="Use fingerprint or face ID"
            value={settings.biometric}
            onValueChange={(value) => updateSetting('biometric', value)}
          />
          <SettingItem
            icon="cloud-upload"
            title="Auto Backup"
            subtitle="Backup data to cloud"
            value={settings.autoBackup}
            onValueChange={(value) => updateSetting('autoBackup', value)}
          />
        </MenuSection>

        {/* Data & Storage */}
        <MenuSection title="Data & Storage">
          <MenuItem
            icon="download"
            title="Export Data"
            subtitle="Download your medicine data"
            onPress={() => Alert.alert('Export', 'Data export will be implemented')}
          />
          <MenuItem
            icon="trash"
            title="Clear Cache"
            subtitle="Free up storage space"
            onPress={() => Alert.alert('Clear Cache', 'Cache clearing will be implemented')}
          />
          <MenuItem
            icon="sync"
            title="Sync Data"
            subtitle="Sync with cloud storage"
            onPress={() => Alert.alert('Sync', 'Data sync will be implemented')}
          />
        </MenuSection>

        {/* Support */}
        <MenuSection title="Support">
          <MenuItem
            icon="help-circle"
            title="Help Center"
            subtitle="Get help and support"
            onPress={() => Alert.alert('Help', 'Help center will be implemented')}
          />
          <MenuItem
            icon="chatbubble"
            title="Contact Us"
            subtitle="Send feedback or report issues"
            onPress={() => Alert.alert('Contact', 'Contact form will be implemented')}
          />
          <MenuItem
            icon="star"
            title="Rate App"
            subtitle="Rate us on the app store"
            onPress={() => Alert.alert('Rate App', 'App rating will be implemented')}
          />
          <MenuItem
            icon="document-text"
            title="Terms & Privacy"
            subtitle="Read our terms and privacy policy"
            onPress={() => Alert.alert('Terms', 'Terms and privacy will be implemented')}
          />
        </MenuSection>

        {/* Logout */}
        <Animatable.View animation="fadeInUp" delay={900} style={styles.logoutSection}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out" size={20} color="#E74C3C" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </Animatable.View>

        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>MediScan v1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    height: height * 0.35,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  headerContent: {
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: 15,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 5,
  },
  joinDate: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
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
  statIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  menuSection: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  menuContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemText: {
    marginLeft: 15,
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  logoutSection: {
    marginBottom: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 15,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#E74C3C',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E74C3C',
    marginLeft: 10,
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  versionText: {
    fontSize: 12,
    color: '#bdc3c7',
  },
});
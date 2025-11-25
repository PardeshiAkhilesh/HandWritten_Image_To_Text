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
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { Image } from 'expo-image';

const { width, height } = Dimensions.get('window');

interface HistoryItem {
  id: string;
  type: 'scan' | 'manual' | 'reminder';
  title: string;
  description: string;
  date: string;
  time: string;
  medicines: string[];
  image?: string;
  status: 'completed' | 'missed' | 'pending';
}

const mockHistory: HistoryItem[] = [
  {
    id: '1',
    type: 'scan',
    title: 'Prescription Scanned',
    description: 'Successfully identified 3 medicines from prescription',
    date: '2024-01-15',
    time: '09:30 AM',
    medicines: ['Paracetamol 500mg', 'Amoxicillin 250mg', 'Vitamin D3'],
    image: 'https://via.placeholder.com/300x200',
    status: 'completed',
  },
  {
    id: '2',
    type: 'reminder',
    title: 'Medicine Taken',
    description: 'Paracetamol 500mg taken on time',
    date: '2024-01-15',
    time: '08:00 AM',
    medicines: ['Paracetamol 500mg'],
    status: 'completed',
  },
  {
    id: '3',
    type: 'reminder',
    title: 'Missed Dose',
    description: 'Amoxicillin 250mg - reminder not acknowledged',
    date: '2024-01-14',
    time: '09:00 PM',
    medicines: ['Amoxicillin 250mg'],
    status: 'missed',
  },
  {
    id: '4',
    type: 'manual',
    title: 'Medicine Added',
    description: 'Manually added Vitamin D3 to collection',
    date: '2024-01-14',
    time: '07:15 PM',
    medicines: ['Vitamin D3 1000 IU'],
    status: 'completed',
  },
  {
    id: '5',
    type: 'scan',
    title: 'Prescription Scanned',
    description: 'Identified 2 medicines from handwritten prescription',
    date: '2024-01-13',
    time: '02:45 PM',
    medicines: ['Ibuprofen 400mg', 'Cetirizine 10mg'],
    image: 'https://via.placeholder.com/300x200',
    status: 'completed',
  },
];

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>(mockHistory);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'scan' | 'manual' | 'reminder'>('all');
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
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

  const filteredHistory = history.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.medicines.some(med => med.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesFilter = selectedFilter === 'all' || item.type === selectedFilter;
    
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#27AE60';
      case 'missed': return '#E74C3C';
      case 'pending': return '#F39C12';
      default: return '#7f8c8d';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'scan': return 'camera';
      case 'manual': return 'create';
      case 'reminder': return 'notifications';
      default: return 'medical';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'scan': return '#4A90E2';
      case 'manual': return '#9B59B6';
      case 'reminder': return '#F39C12';
      default: return '#7f8c8d';
    }
  };

  const FilterButton = ({ filter, label }: { filter: typeof selectedFilter; label: string }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        selectedFilter === filter && styles.activeFilterButton
      ]}
      onPress={() => setSelectedFilter(filter)}
    >
      <Text style={[
        styles.filterButtonText,
        selectedFilter === filter && styles.activeFilterButtonText
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const HistoryCard = ({ item, index }: { item: HistoryItem; index: number }) => (
    <Animatable.View
      animation="fadeInUp"
      delay={index * 100}
      style={styles.historyCard}
    >
      <TouchableOpacity
        onPress={() => setSelectedItem(item)}
        style={styles.cardContent}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.typeIcon, { backgroundColor: getTypeColor(item.type) }]}>
            <Ionicons name={getTypeIcon(item.type) as any} size={20} color="white" />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardDescription}>{item.description}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>

        <View style={styles.cardDetails}>
          <View style={styles.dateTimeContainer}>
            <Ionicons name="calendar" size={14} color="#7f8c8d" />
            <Text style={styles.dateText}>{item.date}</Text>
            <Ionicons name="time" size={14} color="#7f8c8d" style={{ marginLeft: 15 }} />
            <Text style={styles.timeText}>{item.time}</Text>
          </View>
          
          <View style={styles.medicinesContainer}>
            <Text style={styles.medicinesLabel}>Medicines:</Text>
            <View style={styles.medicinesList}>
              {item.medicines.slice(0, 2).map((medicine, index) => (
                <Text key={index} style={styles.medicineItem}>• {medicine}</Text>
              ))}
              {item.medicines.length > 2 && (
                <Text style={styles.moreText}>+{item.medicines.length - 2} more</Text>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animatable.View>
  );

  const groupedHistory = filteredHistory.reduce((groups, item) => {
    const date = item.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(item);
    return groups;
  }, {} as Record<string, HistoryItem[]>);

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
          <Text style={styles.title}>History</Text>
          <Text style={styles.subtitle}>
            Track your medicine journey
          </Text>
        </Animated.View>
      </LinearGradient>

      <View style={styles.content}>
        {/* Search Bar */}
        <Animatable.View animation="fadeInUp" delay={300} style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#7f8c8d" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search history..."
            placeholderTextColor="#bdc3c7"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </Animatable.View>

        {/* Filter Buttons */}
        <Animatable.View animation="fadeInUp" delay={500} style={styles.filtersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <FilterButton filter="all" label="All" />
            <FilterButton filter="scan" label="Scans" />
            <FilterButton filter="reminder" label="Reminders" />
            <FilterButton filter="manual" label="Manual" />
          </ScrollView>
        </Animatable.View>

        {/* Stats */}
        <Animatable.View animation="fadeInUp" delay={700} style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{history.length}</Text>
            <Text style={styles.statLabel}>Total Events</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {history.filter(item => item.status === 'completed').length}
            </Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {history.filter(item => item.type === 'scan').length}
            </Text>
            <Text style={styles.statLabel}>Scans</Text>
          </View>
        </Animatable.View>

        {/* History List */}
        <ScrollView
          style={styles.historyList}
          showsVerticalScrollIndicator={false}
        >
          {Object.entries(groupedHistory).map(([date, items]) => (
            <View key={date} style={styles.dateGroup}>
              <Text style={styles.dateHeader}>{new Date(date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</Text>
              {items.map((item, index) => (
                <HistoryCard key={item.id} item={item} index={index} />
              ))}
            </View>
          ))}
          
          {filteredHistory.length === 0 && (
            <Animatable.View animation="fadeIn" style={styles.emptyState}>
              <Ionicons name="time-outline" size={60} color="#bdc3c7" />
              <Text style={styles.emptyText}>No history found</Text>
              <Text style={styles.emptySubtext}>
                {searchQuery ? 'Try a different search term' : 'Your medicine history will appear here'}
              </Text>
            </Animatable.View>
          )}
        </ScrollView>
      </View>

      {/* Detail Modal */}
      <Modal
        visible={selectedItem !== null}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        {selectedItem && (
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                onPress={() => setSelectedItem(null)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#2c3e50" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>{selectedItem.title}</Text>
              <View style={styles.placeholder} />
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.modalSection}>
                <View style={styles.modalHeader2}>
                  <View style={[styles.typeIcon, { backgroundColor: getTypeColor(selectedItem.type) }]}>
                    <Ionicons name={getTypeIcon(selectedItem.type) as any} size={24} color="white" />
                  </View>
                  <View style={styles.modalInfo}>
                    <Text style={styles.modalDescription}>{selectedItem.description}</Text>
                    <View style={styles.modalDateTime}>
                      <Text style={styles.modalDate}>{selectedItem.date}</Text>
                      <Text style={styles.modalTime}>{selectedItem.time}</Text>
                    </View>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedItem.status) }]}>
                    <Text style={styles.statusText}>{selectedItem.status}</Text>
                  </View>
                </View>
              </View>

              {selectedItem.image && (
                <View style={styles.modalSection}>
                  <Text style={styles.sectionTitle}>Scanned Image</Text>
                  <Image source={{ uri: selectedItem.image }} style={styles.scannedImage} />
                </View>
              )}

              <View style={styles.modalSection}>
                <Text style={styles.sectionTitle}>Medicines ({selectedItem.medicines.length})</Text>
                <View style={styles.medicinesDetailList}>
                  {selectedItem.medicines.map((medicine, index) => (
                    <View key={index} style={styles.medicineDetailItem}>
                      <Ionicons name="medical" size={16} color="#4A90E2" />
                      <Text style={styles.medicineDetailText}>{medicine}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {selectedItem.type === 'scan' && (
                <View style={styles.modalSection}>
                  <Text style={styles.sectionTitle}>Scan Details</Text>
                  <View style={styles.scanDetails}>
                    <DetailRow icon="eye" label="Recognition Accuracy" value="95%" />
                    <DetailRow icon="time" label="Processing Time" value="2.3 seconds" />
                    <DetailRow icon="document" label="Image Quality" value="High" />
                  </View>
                </View>
              )}
            </ScrollView>
          </View>
        )}
      </Modal>
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
  filtersContainer: {
    marginBottom: 20,
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'white',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  activeFilterButton: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7f8c8d',
  },
  activeFilterButtonText: {
    color: 'white',
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 5,
  },
  historyList: {
    flex: 1,
  },
  dateGroup: {
    marginBottom: 20,
  },
  dateHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  historyCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    marginBottom: 10,
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
    padding: 15,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  typeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  cardDetails: {
    paddingLeft: 52,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateText: {
    fontSize: 12,
    color: '#7f8c8d',
    marginLeft: 4,
  },
  timeText: {
    fontSize: 12,
    color: '#7f8c8d',
    marginLeft: 4,
  },
  medicinesContainer: {
    marginTop: 8,
  },
  medicinesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  medicinesList: {
    gap: 2,
  },
  medicineItem: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  moreText: {
    fontSize: 12,
    color: '#4A90E2',
    fontWeight: '600',
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
    textAlign: 'center',
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  placeholder: {
    width: 34,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  modalSection: {
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
  modalHeader2: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  modalInfo: {
    flex: 1,
    marginLeft: 12,
  },
  modalDescription: {
    fontSize: 16,
    color: '#2c3e50',
    marginBottom: 8,
  },
  modalDateTime: {
    flexDirection: 'row',
    gap: 15,
  },
  modalDate: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  modalTime: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  scannedImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
  },
  medicinesDetailList: {
    gap: 10,
  },
  medicineDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  medicineDetailText: {
    fontSize: 14,
    color: '#2c3e50',
  },
  scanDetails: {
    gap: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
});
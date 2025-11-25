import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Animatable from 'react-native-animatable';

export default function AddMedicinePage() {
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    frequency: '',
    times: [''],
    duration: '',
    instructions: '',
    category: 'prescription' as 'prescription' | 'otc' | 'supplement' | 'vitamin',
  });

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addTimeSlot = () => {
    setFormData(prev => ({
      ...prev,
      times: [...prev.times, ''],
    }));
  };

  const updateTime = (index: number, time: string) => {
    const newTimes = [...formData.times];
    newTimes[index] = time;
    setFormData(prev => ({ ...prev, times: newTimes }));
  };

  const removeTime = (index: number) => {
    if (formData.times.length > 1) {
      const newTimes = formData.times.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, times: newTimes }));
    }
  };

  const saveMedicine = () => {
    if (!formData.name || !formData.dosage) {
      Alert.alert('Error', 'Please fill in medicine name and dosage');
      return;
    }

    Alert.alert(
      'Success',
      'Medicine added successfully!',
      [
        { text: 'Add Another', onPress: () => {
          setFormData({
            name: '',
            dosage: '',
            frequency: '',
            times: [''],
            duration: '',
            instructions: '',
            category: 'prescription',
          });
        }},
        { text: 'Done', onPress: () => router.back() },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.title}>Add Medicine</Text>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Animatable.View animation="fadeInUp" delay={200} style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Medicine Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter medicine name"
              value={formData.name}
              onChangeText={(value) => updateField('name', value)}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Dosage *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 500mg, 1 tablet"
              value={formData.dosage}
              onChangeText={(value) => updateField('dosage', value)}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Frequency</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Twice daily, Every 6 hours"
              value={formData.frequency}
              onChangeText={(value) => updateField('frequency', value)}
            />
          </View>
        </Animatable.View>

        <Animatable.View animation="fadeInUp" delay={400} style={styles.section}>
          <Text style={styles.sectionTitle}>Category</Text>
          <View style={styles.categoryContainer}>
            {(['prescription', 'otc', 'supplement', 'vitamin'] as const).map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  formData.category === category && styles.activeCategoryButton,
                ]}
                onPress={() => updateField('category', category)}
              >
                <Text style={[
                  styles.categoryText,
                  formData.category === category && styles.activeCategoryText,
                ]}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animatable.View>

        <Animatable.View animation="fadeInUp" delay={600} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Timing Schedule</Text>
            <TouchableOpacity style={styles.addButton} onPress={addTimeSlot}>
              <Ionicons name="add" size={20} color="#4A90E2" />
              <Text style={styles.addButtonText}>Add Time</Text>
            </TouchableOpacity>
          </View>

          {formData.times.map((time, index) => (
            <View key={index} style={styles.timeContainer}>
              <TextInput
                style={styles.timeInput}
                placeholder="HH:MM (e.g., 08:00)"
                value={time}
                onChangeText={(value) => updateTime(index, value)}
              />
              {formData.times.length > 1 && (
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeTime(index)}
                >
                  <Ionicons name="trash" size={20} color="#E74C3C" />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </Animatable.View>

        <Animatable.View animation="fadeInUp" delay={800} style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Details</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Duration</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 7 days, 2 weeks, Ongoing"
              value={formData.duration}
              onChangeText={(value) => updateField('duration', value)}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Instructions</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Special instructions (e.g., Take with food, Before meals)"
              value={formData.instructions}
              onChangeText={(value) => updateField('instructions', value)}
              multiline
              numberOfLines={3}
            />
          </View>
        </Animatable.View>

        <Animatable.View animation="fadeInUp" delay={1000} style={styles.buttonContainer}>
          <TouchableOpacity style={styles.saveButton} onPress={saveMedicine}>
            <LinearGradient
              colors={['#27AE60', '#2ECC71']}
              style={styles.gradientButton}
            >
              <Ionicons name="checkmark" size={20} color="white" />
              <Text style={styles.saveButtonText}>Save Medicine</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animatable.View>
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
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#2c3e50',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e9ecef',
    backgroundColor: '#f8f9fa',
  },
  activeCategoryButton: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  categoryText: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '600',
  },
  activeCategoryText: {
    color: 'white',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  addButtonText: {
    color: '#4A90E2',
    fontSize: 14,
    fontWeight: '600',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  timeInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#2c3e50',
  },
  removeButton: {
    padding: 8,
  },
  buttonContainer: {
    marginVertical: 20,
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
});
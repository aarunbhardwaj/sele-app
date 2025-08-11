import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { borderRadius, colors, spacing, typography } from '../../../components/ui/theme';
import PreAuthHeader from '../../../components/ui2/pre-auth-header';
import appwriteService from '../../../services/appwrite';
import { School } from '../../../services/appwrite/school-service';

export default function EditSchoolScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const schoolId = params.id as string;
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  
  // School form state
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive' | 'pending'>('pending');
  const [enrollmentCount, setEnrollmentCount] = useState<number>(0);
  
  useEffect(() => {
    if (schoolId) {
      loadSchoolData();
    } else {
      Alert.alert('Error', 'School ID is missing');
      router.back();
    }
  }, [schoolId]);
  
  const loadSchoolData = async () => {
    try {
      setInitialLoading(true);
      const schoolData = await appwriteService.getSchoolById(schoolId);
      
      // Populate form with school data
      setName(schoolData.name || '');
      setAddress(schoolData.address || '');
      setCity(schoolData.city || '');
      setState(schoolData.state || '');
      setCountry(schoolData.country || '');
      setZipCode(schoolData.zipCode || '');
      setPhone(schoolData.phone || '');
      setEmail(schoolData.email || '');
      setWebsite(schoolData.website || '');
      setContactPerson(schoolData.contactPerson || '');
      setContactEmail(schoolData.contactEmail || '');
      setContactPhone(schoolData.contactPhone || '');
      setStatus(schoolData.status || 'pending');
      setEnrollmentCount(schoolData.enrollmentCount || 0);
    } catch (error) {
      console.error('Failed to load school data:', error);
      Alert.alert('Error', 'Failed to load school details. Please try again.');
    } finally {
      setInitialLoading(false);
    }
  };
  
  const validateForm = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'School name is required');
      return false;
    }
    
    if (!email.trim()) {
      Alert.alert('Error', 'School email is required');
      return false;
    }
    
    if (!address.trim() || !city.trim() || !state.trim() || !country.trim()) {
      Alert.alert('Error', 'Address information is required');
      return false;
    }
    
    if (!contactPerson.trim() || !contactEmail.trim()) {
      Alert.alert('Error', 'Contact person information is required');
      return false;
    }
    
    return true;
  };
  
  const handleUpdateSchool = async () => {
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      
      const updatedSchool: Partial<School> = {
        name,
        address,
        city,
        state,
        country,
        zipCode,
        phone,
        email,
        website,
        contactPerson,
        contactEmail,
        contactPhone,
        status,
        enrollmentCount
      };
      
      await appwriteService.updateSchool(schoolId, updatedSchool);
      
      Alert.alert(
        'Success',
        'School updated successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              router.replace({
                pathname: '/(admin)/(schools)/school-details',
                params: { id: schoolId }
              });
            }
          }
        ]
      );
    } catch (error) {
      console.error('Failed to update school:', error);
      Alert.alert('Error', 'Failed to update school. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  if (initialLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <PreAuthHeader 
          title="Edit School"
          leftComponent={
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color={colors.neutral.text} />
            </TouchableOpacity>
          }
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.main} />
          <Text style={styles.loadingText}>Loading school details...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <PreAuthHeader 
        title="Edit School"
        leftComponent={
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.neutral.text} />
          </TouchableOpacity>
        }
      />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>School Information</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>School Name *</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter school name"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Email *</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter school email"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Phone *</Text>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="Enter school phone number"
                keyboardType="phone-pad"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Website</Text>
              <TextInput
                style={styles.input}
                value={website}
                onChangeText={setWebsite}
                placeholder="Enter school website"
                keyboardType="url"
                autoCapitalize="none"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Status</Text>
              <View style={styles.statusOptions}>
                <TouchableOpacity
                  style={[styles.statusOption, status === 'active' && styles.activeStatusOption]}
                  onPress={() => setStatus('active')}
                >
                  <Text style={[styles.statusText, status === 'active' && styles.activeStatusText]}>Active</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.statusOption, status === 'inactive' && styles.inactiveStatusOption]}
                  onPress={() => setStatus('inactive')}
                >
                  <Text style={[styles.statusText, status === 'inactive' && styles.inactiveStatusText]}>Inactive</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.statusOption, status === 'pending' && styles.pendingStatusOption]}
                  onPress={() => setStatus('pending')}
                >
                  <Text style={[styles.statusText, status === 'pending' && styles.pendingStatusText]}>Pending</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Enrollment Count</Text>
              <TextInput
                style={styles.input}
                value={enrollmentCount.toString()}
                onChangeText={(value) => {
                  const numValue = parseInt(value) || 0;
                  setEnrollmentCount(numValue);
                }}
                placeholder="Enter enrollment count"
                keyboardType="number-pad"
              />
            </View>
          </View>
          
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Address</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Street Address *</Text>
              <TextInput
                style={styles.input}
                value={address}
                onChangeText={setAddress}
                placeholder="Enter street address"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>City *</Text>
              <TextInput
                style={styles.input}
                value={city}
                onChangeText={setCity}
                placeholder="Enter city"
              />
            </View>
            
            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>State/Province *</Text>
                <TextInput
                  style={styles.input}
                  value={state}
                  onChangeText={setState}
                  placeholder="Enter state/province"
                />
              </View>
              
              <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>Zip/Postal Code *</Text>
                <TextInput
                  style={styles.input}
                  value={zipCode}
                  onChangeText={setZipCode}
                  placeholder="Enter zip/postal code"
                />
              </View>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Country *</Text>
              <TextInput
                style={styles.input}
                value={country}
                onChangeText={setCountry}
                placeholder="Enter country"
              />
            </View>
          </View>
          
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Primary Contact</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Contact Person Name *</Text>
              <TextInput
                style={styles.input}
                value={contactPerson}
                onChangeText={setContactPerson}
                placeholder="Enter contact person name"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Contact Email *</Text>
              <TextInput
                style={styles.input}
                value={contactEmail}
                onChangeText={setContactEmail}
                placeholder="Enter contact email"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Contact Phone *</Text>
              <TextInput
                style={styles.input}
                value={contactPhone}
                onChangeText={setContactPhone}
                placeholder="Enter contact phone number"
                keyboardType="phone-pad"
              />
            </View>
          </View>
          
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => router.back()}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleUpdateSchool}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color={colors.neutral.white} />
              ) : (
                <Text style={styles.saveButtonText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.neutral.white,
  },
  container: {
    flex: 1,
    backgroundColor: colors.neutral.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: typography.fontSizes.md,
    color: colors.neutral.gray,
    marginTop: spacing.sm,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  formSection: {
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold as any,
    color: colors.neutral.text,
    marginBottom: spacing.md,
  },
  formGroup: {
    marginBottom: spacing.md,
  },
  formRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.fontSizes.sm,
    color: colors.neutral.darkGray,
    marginBottom: 4,
  },
  input: {
    backgroundColor: colors.neutral.background,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.neutral.lightGray,
    fontSize: typography.fontSizes.md,
    color: colors.neutral.text,
    height: 40,
  },
  statusOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusOption: {
    flex: 1,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.neutral.background,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: colors.neutral.lightGray,
  },
  activeStatusOption: {
    backgroundColor: colors.status.success + '20',
    borderColor: colors.status.success,
  },
  inactiveStatusOption: {
    backgroundColor: colors.status.error + '20',
    borderColor: colors.status.error,
  },
  pendingStatusOption: {
    backgroundColor: colors.status.warning + '20',
    borderColor: colors.status.warning,
  },
  statusText: {
    fontSize: typography.fontSizes.sm,
    color: colors.neutral.darkGray,
  },
  activeStatusText: {
    color: colors.status.success,
    fontWeight: typography.fontWeights.medium as any,
  },
  inactiveStatusText: {
    color: colors.status.error,
    fontWeight: typography.fontWeights.medium as any,
  },
  pendingStatusText: {
    color: colors.status.warning,
    fontWeight: typography.fontWeights.medium as any,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  button: {
    flex: 1,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  cancelButton: {
    backgroundColor: colors.neutral.lightGray,
  },
  saveButton: {
    backgroundColor: colors.primary.main,
  },
  cancelButtonText: {
    color: colors.neutral.darkGray,
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium as any,
  },
  saveButtonText: {
    color: colors.neutral.white,
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium as any,
  },
});

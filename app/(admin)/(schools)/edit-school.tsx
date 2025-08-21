import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing } from '../../../components/ui/theme';
import Text from '../../../components/ui/Typography';
import PreAuthHeader from '../../../components/ui2/pre-auth-header';
import appwriteService from '../../../services/appwrite';

// Indian States and Union Territories
const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  // Union Territories
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry'
];

// Airbnb color palette
const airbnbColors = {
  primary: '#FF5A5F',
  primaryDark: '#FF3347',
  primaryLight: '#FF8589',
  secondary: '#00A699',
  secondaryDark: '#008F85',
  secondaryLight: '#57C1BA',
  neutral: colors.neutral,
  accent: colors.accent,
  status: colors.status
};

export default function EditSchoolScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const schoolId = params.id as string;
  const insets = useSafeAreaInsets();
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  
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
  
  const handleStateSelect = (selectedState: string) => {
    setState(selectedState);
    setModalVisible(false);
  };
  
  if (initialLoading) {
    return (
      <View style={styles.safeArea}>
        <SafeAreaView style={styles.headerContainer}>
          <PreAuthHeader 
            title="Edit School"
            onLeftIconPress={() => router.back()}
          />
        </SafeAreaView>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={airbnbColors.primary} />
          <Text style={styles.loadingText}>Loading school details...</Text>
        </View>
      </View>
    );
  }
  
  return (
    <View style={styles.safeArea}>
      <SafeAreaView style={styles.headerContainer}>
        <PreAuthHeader 
          title="Edit School"
          onLeftIconPress={() => router.back()}
        />
      </SafeAreaView>
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom, 20) + 80 }
          ]}
        >
          {/* Hero Section */}
          <LinearGradient 
            colors={[airbnbColors.primary, airbnbColors.primaryDark]} 
            style={styles.heroSection}
          >
            <View style={styles.heroContent}>
              <Text style={styles.heroTitle}>Edit School</Text>
              <Text style={styles.heroSubtitle}>
                Update school information and settings
              </Text>
            </View>
          </LinearGradient>

          <View style={styles.contentContainer}>
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>School Information</Text>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>School Name *</Text>
                <TextInput
                  style={[styles.input]}
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter school name"
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Email *</Text>
                <TextInput
                  style={[styles.input]}
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
                  style={[styles.input]}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="Enter school phone number"
                  keyboardType="phone-pad"
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Website</Text>
                <TextInput
                  style={[styles.input]}
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
                  style={[styles.input]}
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
                  style={[styles.input]}
                  value={address}
                  onChangeText={setAddress}
                  placeholder="Enter street address"
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>City *</Text>
                <TextInput
                  style={[styles.input]}
                  value={city}
                  onChangeText={setCity}
                  placeholder="Enter city"
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>State/Province *</Text>
                <TouchableOpacity
                  style={[styles.input, styles.dropdown]}
                  onPress={() => setModalVisible(true)}
                >
                  <Text style={styles.dropdownText}>
                    {state || 'Select state/province'}
                  </Text>
                  <Ionicons name="chevron-down" size={16} color={colors.neutral.gray} style={styles.dropdownIcon} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.label}>Zip/Postal Code *</Text>
                  <TextInput
                    style={[styles.input]}
                    value={zipCode}
                    onChangeText={setZipCode}
                    placeholder="Enter zip/postal code"
                  />
                </View>
                
                <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.label}>Country *</Text>
                  <TextInput
                    style={[styles.input]}
                    value={country}
                    onChangeText={setCountry}
                    placeholder="Enter country"
                  />
                </View>
              </View>
            </View>
            
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Primary Contact</Text>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Contact Person Name *</Text>
                <TextInput
                  style={[styles.input]}
                  value={contactPerson}
                  onChangeText={setContactPerson}
                  placeholder="Enter contact person name"
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Contact Email *</Text>
                <TextInput
                  style={[styles.input]}
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
                  style={[styles.input]}
                  value={contactPhone}
                  onChangeText={setContactPhone}
                  placeholder="Enter contact phone number"
                  keyboardType="phone-pad"
                />
              </View>
            </View>
            
            {/* Action Buttons */}
            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => router.back()}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.saveButton, loading && styles.saveButtonDisabled]}
                onPress={handleUpdateSchool}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={colors.neutral.white} />
                ) : (
                  <Ionicons name="checkmark-circle" size={20} color={colors.neutral.white} />
                )}
                <Text style={styles.saveButtonText}>
                  {loading ? 'Updating...' : 'Save Changes'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* State Selection Modal */}
          <Modal
            visible={modalVisible}
            animationType="slide"
            transparent
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Select State/Province</Text>
                
                <FlatList
                  data={INDIAN_STATES}
                  keyExtractor={(item) => item}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.stateItem}
                      onPress={() => handleStateSelect(item)}
                    >
                      <Text style={styles.stateItemText}>{item}</Text>
                    </TouchableOpacity>
                  )}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.stateList}
                />
                
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.modalCloseButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.neutral.white,
  },
  headerContainer: {
    backgroundColor: colors.neutral.white,
    zIndex: 10,
  },
  container: {
    flex: 1,
    backgroundColor: '#FAFBFC',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },

  // Hero Section
  heroSection: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  heroContent: {
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.neutral.white,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  heroSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },

  // Content
  contentContainer: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: colors.neutral.gray,
    marginTop: spacing.md,
  },

  // Form Elements
  formSection: {
    backgroundColor: colors.neutral.white,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
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
    fontSize: 14,
    color: colors.neutral.darkGray,
    marginBottom: 4,
  },
  input: {
    backgroundColor: colors.neutral.background,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.neutral.lightGray,
    fontSize: 16,
    color: colors.neutral.text,
    height: 48,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: spacing.sm,
  },
  dropdownText: {
    fontSize: 16,
    color: colors.neutral.text,
    flex: 1,
  },
  dropdownIcon: {
    marginLeft: spacing.sm,
  },
  stateList: {
    maxHeight: 300,
    paddingBottom: spacing.md,
  },

  // Error Styles
  inputError: {
    borderColor: airbnbColors.primary,
    backgroundColor: airbnbColors.primary + '10',
  },
  errorText: {
    fontSize: 12,
    color: airbnbColors.primary,
    marginTop: spacing.xs,
  },

  // Status Options
  statusOptions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statusOption: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    backgroundColor: colors.neutral.white,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  activeStatusOption: {
    backgroundColor: airbnbColors.secondary + '15',
    borderColor: airbnbColors.secondary,
  },
  inactiveStatusOption: {
    backgroundColor: '#6B7280' + '15',
    borderColor: '#6B7280',
  },
  pendingStatusOption: {
    backgroundColor: '#F59E0B' + '15',
    borderColor: '#F59E0B',
  },
  statusText: {
    fontSize: 12,
    color: colors.neutral.darkGray,
    fontWeight: '500',
  },
  activeStatusText: {
    color: airbnbColors.secondary,
    fontWeight: '600',
  },
  inactiveStatusText: {
    color: '#6B7280',
    fontWeight: '600',
  },
  pendingStatusText: {
    color: '#F59E0B',
    fontWeight: '600',
  },

  // Actions
  actionsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingTop: spacing.lg,
    marginTop: spacing.lg,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral.darkGray,
  },
  saveButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: airbnbColors.primary,
    paddingVertical: spacing.md,
    borderRadius: 12,
    shadowColor: airbnbColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral.white,
    marginLeft: spacing.sm,
  },
  
  // Modal
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: colors.neutral.white,
    borderRadius: 16,
    padding: spacing.lg,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.neutral.darkGray,
    marginBottom: spacing.md,
  },
  stateItem: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    backgroundColor: colors.neutral.white,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  stateItemText: {
    fontSize: 16,
    color: colors.neutral.darkGray,
  },
  modalCloseButton: {
    marginTop: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: 12,
    backgroundColor: airbnbColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral.white,
  },
});

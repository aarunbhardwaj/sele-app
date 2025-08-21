import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
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
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing } from '../../../components/ui/theme';
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

export default function AddSchoolScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  
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
  
  // Modal state for state selection
  const [showStateModal, setShowStateModal] = useState(false);
  
  // Track which fields have been touched for validation display
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  
  const markFieldAsTouched = (fieldName: string) => {
    setTouchedFields(prev => new Set(prev).add(fieldName));
  };
  
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  const isValidIndianPhone = (phone: string) => {
    // Remove all non-digit characters
    const cleanPhone = phone.replace(/\D/g, '');
    // Indian phone numbers: 10 digits, starting with 6-9
    const indianPhoneRegex = /^[6-9]\d{9}$/;
    return indianPhoneRegex.test(cleanPhone);
  };
  
  const isValidIndianZipCode = (zipCode: string) => {
    // Indian PIN codes: exactly 6 digits
    const cleanZip = zipCode.replace(/\D/g, '');
    const indianZipRegex = /^\d{6}$/;
    return indianZipRegex.test(cleanZip);
  };
  
  const isValidWebsite = (website: string) => {
    if (!website.trim()) return true; // Optional field
    const websiteRegex = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;
    return websiteRegex.test(website);
  };
  
  const isValidName = (name: string) => {
    // Name should contain only letters, spaces, dots, and common characters
    const nameRegex = /^[a-zA-Z\s\.\-']+$/;
    return nameRegex.test(name.trim()) && name.trim().length >= 2;
  };
  
  const isValidAddress = (address: string) => {
    // Address should be at least 10 characters and contain alphanumeric characters
    return address.trim().length >= 10 && /^[a-zA-Z0-9\s\.,\-#\/]+$/.test(address.trim());
  };
  
  const isValidCity = (city: string) => {
    // City names should contain only letters, spaces, and common characters
    const cityRegex = /^[a-zA-Z\s\.\-']+$/;
    return cityRegex.test(city.trim()) && city.trim().length >= 2;
  };
  
  const isValidState = (state: string) => {
    // State names should contain only letters, spaces, and common characters
    const stateRegex = /^[a-zA-Z\s\.\-']+$/;
    return stateRegex.test(state.trim()) && state.trim().length >= 2;
  };
  
  const getFieldError = (fieldName: string, value: string, isRequired = true) => {
    if (!touchedFields.has(fieldName)) return '';
    
    if (isRequired && !value.trim()) {
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1).replace(/([A-Z])/g, ' $1')} is required`;
    }
    
    switch (fieldName) {
      case 'name':
        if (value.trim() && !isValidName(value)) {
          return 'School name should contain only letters, spaces, dots, and hyphens';
        }
        if (value.trim() && value.trim().length < 2) {
          return 'School name must be at least 2 characters long';
        }
        break;
        
      case 'email':
        if (value.trim() && !isValidEmail(value)) {
          return 'Please enter a valid email address';
        }
        break;
        
      case 'phone':
        if (value.trim() && !isValidIndianPhone(value)) {
          return 'Please enter a valid 10-digit Indian mobile number (starting with 6-9)';
        }
        break;
        
      case 'website':
        if (value.trim() && !isValidWebsite(value)) {
          return 'Please enter a valid website URL (including http:// or https://)';
        }
        break;
        
      case 'address':
        if (value.trim() && !isValidAddress(value)) {
          return 'Address must be at least 10 characters with valid characters';
        }
        break;
        
      case 'city':
        if (value.trim() && !isValidCity(value)) {
          return 'City name should contain only letters, spaces, dots, and hyphens';
        }
        break;
        
      case 'state':
        if (value.trim() && !isValidState(value)) {
          return 'State name should contain only letters, spaces, dots, and hyphens';
        }
        break;
        
      case 'zipCode':
        if (value.trim() && !isValidIndianZipCode(value)) {
          return 'Please enter a valid 6-digit Indian PIN code';
        }
        break;
        
      case 'country':
        if (value.trim() && !isValidCity(value)) { // Same validation as city
          return 'Country name should contain only letters, spaces, dots, and hyphens';
        }
        break;
        
      case 'contactPerson':
        if (value.trim() && !isValidName(value)) {
          return 'Contact person name should contain only letters, spaces, dots, and hyphens';
        }
        break;
        
      case 'contactEmail':
        if (value.trim() && !isValidEmail(value)) {
          return 'Please enter a valid contact email address';
        }
        break;
        
      case 'contactPhone':
        if (value.trim() && !isValidIndianPhone(value)) {
          return 'Please enter a valid 10-digit Indian mobile number (starting with 6-9)';
        }
        break;
    }
    
    return '';
  };
  
  const validateForm = () => {
    const errors = [];
    
    if (!name.trim()) {
      errors.push('School name is required');
    } else if (!isValidName(name)) {
      errors.push('School name should contain only letters, spaces, dots, and hyphens');
    }
    
    if (!email.trim()) {
      errors.push('School email is required');
    } else if (!isValidEmail(email)) {
      errors.push('Please enter a valid school email address');
    }
    
    if (!phone.trim()) {
      errors.push('School phone number is required');
    } else if (!isValidIndianPhone(phone)) {
      errors.push('Please enter a valid 10-digit Indian mobile number (starting with 6-9)');
    }
    
    if (website.trim() && !isValidWebsite(website)) {
      errors.push('Please enter a valid website URL (including http:// or https://)');
    }
    
    if (!address.trim()) {
      errors.push('Street address is required');
    } else if (!isValidAddress(address)) {
      errors.push('Address must be at least 10 characters with valid characters');
    }
    
    if (!city.trim()) {
      errors.push('City is required');
    } else if (!isValidCity(city)) {
      errors.push('City name should contain only letters, spaces, dots, and hyphens');
    }
    
    if (!state.trim()) {
      errors.push('State/Province is required');
    } else if (!isValidState(state)) {
      errors.push('State name should contain only letters, spaces, dots, and hyphens');
    }
    
    if (!country.trim()) {
      errors.push('Country is required');
    } else if (!isValidCity(country)) {
      errors.push('Country name should contain only letters, spaces, dots, and hyphens');
    }
    
    if (!zipCode.trim()) {
      errors.push('Zip/Postal Code is required');
    } else if (!isValidIndianZipCode(zipCode)) {
      errors.push('Please enter a valid 6-digit Indian PIN code');
    }
    
    if (!contactPerson.trim()) {
      errors.push('Contact person name is required');
    } else if (!isValidName(contactPerson)) {
      errors.push('Contact person name should contain only letters, spaces, dots, and hyphens');
    }
    
    if (!contactEmail.trim()) {
      errors.push('Contact email is required');
    } else if (!isValidEmail(contactEmail)) {
      errors.push('Please enter a valid contact email address');
    }
    
    if (!contactPhone.trim()) {
      errors.push('Contact phone number is required');
    } else if (!isValidIndianPhone(contactPhone)) {
      errors.push('Please enter a valid 10-digit Indian mobile number (starting with 6-9)');
    }
    
    if (errors.length > 0) {
      Alert.alert('Validation Error', errors.join('\n'));
      return false;
    }
    
    return true;
  };
  
  const handleAddSchool = async () => {
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      
      const newSchool = {
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
        enrollmentCount: 0
      };
      
      const createdSchool = await appwriteService.createSchool(newSchool);
      
      Alert.alert(
        'Success',
        'School added successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              router.replace({
                pathname: '/(admin)/(schools)/school-details',
                params: { id: createdSchool.$id }
              });
            }
          }
        ]
      );
    } catch (error) {
      console.error('Failed to add school:', error);
      Alert.alert('Error', 'Failed to add school. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <View style={styles.safeArea}>
      <SafeAreaView style={styles.headerContainer}>
        <PreAuthHeader 
          title="Add New School"
          showBackButton={true}
          onBackPress={() => router.back()}
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
              <Text style={styles.heroTitle}>Add New School</Text>
              <Text style={styles.heroSubtitle}>
                Register a new educational institution
              </Text>
            </View>
          </LinearGradient>

          <View style={styles.contentContainer}>
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>School Information</Text>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>School Name *</Text>
                <TextInput
                  style={[
                    styles.input, 
                    getFieldError('name', name) !== '' && styles.inputError
                  ]}
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter school name"
                  onBlur={() => markFieldAsTouched('name')}
                />
                {getFieldError('name', name) !== '' && (
                  <Text style={styles.errorText}>{getFieldError('name', name)}</Text>
                )}
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Email *</Text>
                <TextInput
                  style={[
                    styles.input, 
                    getFieldError('email', email) !== '' && styles.inputError
                  ]}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter school email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onBlur={() => markFieldAsTouched('email')}
                />
                {getFieldError('email', email) !== '' && (
                  <Text style={styles.errorText}>{getFieldError('email', email)}</Text>
                )}
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Phone *</Text>
                <TextInput
                  style={[
                    styles.input, 
                    getFieldError('phone', phone) !== '' && styles.inputError
                  ]}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="Enter school phone number"
                  keyboardType="phone-pad"
                  onBlur={() => markFieldAsTouched('phone')}
                />
                {getFieldError('phone', phone) !== '' && (
                  <Text style={styles.errorText}>{getFieldError('phone', phone)}</Text>
                )}
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Website</Text>
                <TextInput
                  style={[
                    styles.input,
                    getFieldError('website', website, false) !== '' && styles.inputError
                  ]}
                  value={website}
                  onChangeText={setWebsite}
                  placeholder="Enter school website (e.g., https://www.schoolname.com)"
                  keyboardType="url"
                  autoCapitalize="none"
                  onBlur={() => markFieldAsTouched('website')}
                />
                {getFieldError('website', website, false) !== '' && (
                  <Text style={styles.errorText}>{getFieldError('website', website, false)}</Text>
                )}
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Status</Text>
                <View style={styles.statusOptions}>
                  <TouchableOpacity
                    style={[styles.statusOption, status === 'active' && styles.activeStatusOption]}
                    onPress={() => setStatus('active')}
                  >
                    <Text style={[styles.statusText, ...(status === 'active' ? [styles.activeStatusText] : [])]}>Active</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.statusOption, status === 'inactive' && styles.inactiveStatusOption]}
                    onPress={() => setStatus('inactive')}
                  >
                    <Text style={[styles.statusText, ...(status === 'inactive' ? [styles.inactiveStatusText] : [])]}>Inactive</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.statusOption, status === 'pending' && styles.pendingStatusOption]}
                    onPress={() => setStatus('pending')}
                  >
                    <Text style={[styles.statusText, ...(status === 'pending' ? [styles.pendingStatusText] : [])]}>Pending</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Address</Text>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Street Address *</Text>
                <TextInput
                  style={[
                    styles.input, 
                    getFieldError('address', address) !== '' && styles.inputError
                  ]}
                  value={address}
                  onChangeText={setAddress}
                  placeholder="Enter street address"
                  onBlur={() => markFieldAsTouched('address')}
                />
                {getFieldError('address', address) !== '' && (
                  <Text style={styles.errorText}>{getFieldError('address', address)}</Text>
                )}
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>City *</Text>
                <TextInput
                  style={[
                    styles.input, 
                    getFieldError('city', city) !== '' && styles.inputError
                  ]}
                  value={city}
                  onChangeText={setCity}
                  placeholder="Enter city"
                  onBlur={() => markFieldAsTouched('city')}
                />
                {getFieldError('city', city) !== '' && (
                  <Text style={styles.errorText}>{getFieldError('city', city)}</Text>
                )}
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>State/Province *</Text>
                <TouchableOpacity
                  style={[
                    styles.input, 
                    getFieldError('state', state) !== '' && styles.inputError,
                    { paddingVertical: spacing.sm, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }
                  ]}
                  onPress={() => setShowStateModal(true)}
                >
                  <Text style={state ? styles.selectedText : styles.placeholderText}>
                    {state ? state : 'Select state/province'}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color={colors.neutral.gray} />
                </TouchableOpacity>
                {getFieldError('state', state) !== '' && (
                  <Text style={styles.errorText}>{getFieldError('state', state)}</Text>
                )}
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Zip/Postal Code *</Text>
                <TextInput
                  style={[
                    styles.input, 
                    getFieldError('zipCode', zipCode) !== '' && styles.inputError
                  ]}
                  value={zipCode}
                  onChangeText={setZipCode}
                  placeholder="Enter zip/postal code"
                  onBlur={() => markFieldAsTouched('zipCode')}
                />
                {getFieldError('zipCode', zipCode) !== '' && (
                  <Text style={styles.errorText}>{getFieldError('zipCode', zipCode)}</Text>
                )}
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Country *</Text>
                <TextInput
                  style={[
                    styles.input, 
                    getFieldError('country', country) !== '' && styles.inputError
                  ]}
                  value={country}
                  onChangeText={setCountry}
                  placeholder="Enter country"
                  onBlur={() => markFieldAsTouched('country')}
                />
                {getFieldError('country', country) !== '' && (
                  <Text style={styles.errorText}>{getFieldError('country', country)}</Text>
                )}
              </View>
            </View>
            
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Primary Contact</Text>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Contact Person Name *</Text>
                <TextInput
                  style={[
                    styles.input, 
                    getFieldError('contactPerson', contactPerson) !== '' && styles.inputError
                  ]}
                  value={contactPerson}
                  onChangeText={setContactPerson}
                  placeholder="Enter contact person name"
                  onBlur={() => markFieldAsTouched('contactPerson')}
                />
                {getFieldError('contactPerson', contactPerson) !== '' && (
                  <Text style={styles.errorText}>{getFieldError('contactPerson', contactPerson)}</Text>
                )}
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Contact Email *</Text>
                <TextInput
                  style={[
                    styles.input, 
                    getFieldError('contactEmail', contactEmail) !== '' && styles.inputError
                  ]}
                  value={contactEmail}
                  onChangeText={setContactEmail}
                  placeholder="Enter contact email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onBlur={() => markFieldAsTouched('contactEmail')}
                />
                {getFieldError('contactEmail', contactEmail) !== '' && (
                  <Text style={styles.errorText}>{getFieldError('contactEmail', contactEmail)}</Text>
                )}
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Contact Phone *</Text>
                <TextInput
                  style={[
                    styles.input, 
                    getFieldError('contactPhone', contactPhone) !== '' && styles.inputError
                  ]}
                  value={contactPhone}
                  onChangeText={setContactPhone}
                  placeholder="Enter contact phone number"
                  keyboardType="phone-pad"
                  onBlur={() => markFieldAsTouched('contactPhone')}
                />
                {getFieldError('contactPhone', contactPhone) !== '' && (
                  <Text style={styles.errorText}>{getFieldError('contactPhone', contactPhone)}</Text>
                )}
              </View>
            </View>
            
            {/* Status Toggle */}
            <View style={styles.statusToggle}>
              <View style={styles.statusInfo}>
                <Text style={styles.statusTitle}>School Status</Text>
                <Text style={styles.statusSubtitle}>
                  {status === 'active' ? 'This school is active and can enroll students.' : status === 'inactive' ? 'This school is inactive and cannot enroll students.' : 'This school is pending approval.'}
                </Text>
              </View>
              
              <Switch
                value={status === 'active'}
                onValueChange={(value) => setStatus(value ? 'active' : 'inactive')}
                thumbColor={status === 'active' ? airbnbColors.primary : colors.neutral.white}
                trackColor={{
                  false: '#E2E8F0',
                  true: airbnbColors.primaryLight,
                }}
              />
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
                onPress={handleAddSchool}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={colors.neutral.white} />
                ) : (
                  <Ionicons name="checkmark-circle" size={20} color={colors.neutral.white} />
                )}
                <Text style={styles.saveButtonText}>
                  {loading ? 'Adding...' : 'Add School'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      
      {/* State Selection Modal */}
      <Modal
        visible={showStateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowStateModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select State/Province</Text>
              <TouchableOpacity
                style={styles.modalCloseIconButton}
                onPress={() => setShowStateModal(false)}
              >
                <Ionicons name="close" size={24} color={colors.neutral.darkGray} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.stateListContainer}>
              <FlatList
                data={INDIAN_STATES}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.stateItem}
                    onPress={() => {
                      setState(item);
                      markFieldAsTouched('state');
                      setShowStateModal(false);
                    }}
                  >
                    <Text style={styles.stateItemText}>{item}</Text>
                    {state === item && (
                      <Ionicons name="checkmark" size={20} color={airbnbColors.primary} />
                    )}
                  </TouchableOpacity>
                )}
                showsVerticalScrollIndicator={true}
                style={styles.flatListStyle}
                contentContainerStyle={styles.flatListContent}
              />
            </View>
            
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowStateModal(false)}
            >
              <Text style={styles.modalCloseButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  inputError: {
    borderColor: airbnbColors.primary,
    backgroundColor: airbnbColors.primary + '10',
  },
  errorText: {
    fontSize: 12,
    color: airbnbColors.primary,
    marginTop: spacing.xs,
  },
  statusToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  statusInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral.text,
    marginBottom: 2,
  },
  statusSubtitle: {
    fontSize: 12,
    color: colors.neutral.gray,
  },

  // Status Options
  statusOptions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  statusOption: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.neutral.lightGray,
    backgroundColor: colors.neutral.white,
    alignItems: 'center',
  },
  activeStatusOption: {
    borderColor: '#10B981',
    backgroundColor: '#10B981' + '15',
  },
  inactiveStatusOption: {
    borderColor: '#EF4444',
    backgroundColor: '#EF4444' + '15',
  },
  pendingStatusOption: {
    borderColor: '#F59E0B',
    backgroundColor: '#F59E0B' + '15',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.neutral.darkGray,
  },
  activeStatusText: {
    color: '#10B981',
  },
  inactiveStatusText: {
    color: '#EF4444',
  },
  pendingStatusText: {
    color: '#F59E0B',
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
  
  // Placeholder text style
  placeholderText: {
    fontSize: 16,
    color: colors.neutral.gray,
  },
  
  selectedText: {
    fontSize: 16,
    color: colors.neutral.text,
  },
  
  // State list styles
  stateList: {
    maxHeight: 300,
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
    maxHeight: '80%',
    backgroundColor: colors.neutral.white,
    borderRadius: 12,
    padding: spacing.lg,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.neutral.text,
    flex: 1,
  },
  modalCloseIconButton: {
    padding: spacing.sm,
  },
  stateListContainer: {
    maxHeight: 400,
    marginBottom: spacing.md,
  },
  flatListStyle: {
    flex: 1,
  },
  flatListContent: {
    paddingBottom: spacing.md,
  },
  stateItem: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.neutral.lightGray,
    backgroundColor: colors.neutral.white,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stateItemText: {
    fontSize: 16,
    color: colors.neutral.text,
  },
  modalCloseButton: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    backgroundColor: airbnbColors.primary,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral.white,
  },
});

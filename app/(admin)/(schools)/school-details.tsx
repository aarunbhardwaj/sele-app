import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing } from '../../../components/ui/theme';
import PreAuthHeader from '../../../components/ui2/pre-auth-header';
import appwriteService from '../../../services/appwrite';
import type { School } from '../../../services/appwrite/school-service';

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

export default function SchoolDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const schoolId = params.id as string;
  const insets = useSafeAreaInsets();
  
  const [school, setSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);
  
  const loadSchoolData = useCallback(async () => {
    try {
      setLoading(true);
      const schoolData = await appwriteService.getSchoolById(schoolId);
      setSchool(schoolData);
    } catch (error) {
      console.error('Failed to load school data:', error);
      Alert.alert('Error', 'Failed to load school details. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [schoolId]);
  
  useEffect(() => {
    if (schoolId) {
      loadSchoolData();
    } else {
      Alert.alert('Error', 'School ID is missing');
      router.back();
    }
  }, [schoolId, loadSchoolData, router]);
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return airbnbColors.secondary;
      case 'inactive':
        return '#6B7280';
      case 'pending':
        return '#F59E0B';
      default:
        return '#6B7280';
    }
  };

  const handleDeleteSchool = () => {
    Alert.alert(
      'Delete School',
      `Are you sure you want to delete "${school?.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (!school?.$id) return;
            
            try {
              setLoading(true);
              await appwriteService.deleteSchool(school.$id);
              Alert.alert('Success', 'School deleted successfully', [
                {
                  text: 'OK',
                  onPress: () => router.replace('/(admin)/(schools)')
                }
              ]);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete school: ' + (error as Error).message);
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.safeArea}>
      <SafeAreaView style={styles.headerContainer}>
        <PreAuthHeader 
          title="School Details"
          showBackButton={true}
          onBackPress={() => router.back()}
        />
      </SafeAreaView>

      <ScrollView 
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 20) + 80 }
        ]}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={airbnbColors.primary} />
            <Text style={styles.loadingText}>Loading school details...</Text>
          </View>
        ) : !school ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={64} color={colors.neutral.gray} />
            <Text style={styles.errorTitle}>School Not Found</Text>
            <Text style={styles.errorSubtitle}>
              The school you&apos;re looking for doesn&apos;t exist or has been removed.
            </Text>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Text style={[styles.backButtonText, { color: airbnbColors.primary }]}>
                Go Back
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Hero Section */}
            <LinearGradient 
              colors={[airbnbColors.primary, airbnbColors.primaryDark]} 
              style={styles.heroSection}
            >
              <View style={styles.heroContent}>
                <View style={styles.schoolIconContainer}>
                  <Ionicons name="school" size={48} color={colors.neutral.white} />
                </View>
                <Text style={styles.heroTitle}>{school.name}</Text>
                <Text style={styles.heroSubtitle}>
                  {school.city}, {school.state}, {school.country}
                </Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(school.status) + '15' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(school.status) }]}>
                    {school.status.charAt(0).toUpperCase() + school.status.slice(1)}
                  </Text>
                </View>
              </View>
            </LinearGradient>

            {/* Quick Actions */}
            <View style={styles.quickActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => router.push(`/(admin)/(schools)/edit-school?id=${school.$id}`)}
              >
                <Ionicons name="create-outline" size={20} color={airbnbColors.secondary} />
                <Text style={[styles.actionButtonText, { color: airbnbColors.secondary }]}>Edit</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleDeleteSchool}
              >
                <Ionicons name="trash-outline" size={20} color={airbnbColors.primary} />
                <Text style={[styles.actionButtonText, { color: airbnbColors.primary }]}>Delete</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.detailsContainer}>
              {/* General Information */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>General Information</Text>
                
                <View style={styles.infoItem}>
                  <Ionicons name="mail-outline" size={20} color={colors.neutral.darkGray} style={styles.infoIcon} />
                  <View>
                    <Text style={styles.infoLabel}>Email</Text>
                    <Text style={styles.infoValue}>{school.email || 'N/A'}</Text>
                  </View>
                </View>
                
                <View style={styles.infoItem}>
                  <Ionicons name="call-outline" size={20} color={colors.neutral.darkGray} style={styles.infoIcon} />
                  <View>
                    <Text style={styles.infoLabel}>Phone</Text>
                    <Text style={styles.infoValue}>{school.phone || 'N/A'}</Text>
                  </View>
                </View>
                
                <View style={styles.infoItem}>
                  <Ionicons name="globe-outline" size={20} color={colors.neutral.darkGray} style={styles.infoIcon} />
                  <View>
                    <Text style={styles.infoLabel}>Website</Text>
                    <Text style={styles.infoValue}>{school.website || 'N/A'}</Text>
                  </View>
                </View>
              </View>
              
              {/* Primary Contact */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Primary Contact</Text>
                
                <View style={styles.infoItem}>
                  <Ionicons name="person-outline" size={20} color={colors.neutral.darkGray} style={styles.infoIcon} />
                  <View>
                    <Text style={styles.infoLabel}>Contact Person</Text>
                    <Text style={styles.infoValue}>{school.contactPerson || 'N/A'}</Text>
                  </View>
                </View>
                
                <View style={styles.infoItem}>
                  <Ionicons name="mail-outline" size={20} color={colors.neutral.darkGray} style={styles.infoIcon} />
                  <View>
                    <Text style={styles.infoLabel}>Contact Email</Text>
                    <Text style={styles.infoValue}>{school.contactEmail || 'N/A'}</Text>
                  </View>
                </View>
                
                <View style={styles.infoItem}>
                  <Ionicons name="call-outline" size={20} color={colors.neutral.darkGray} style={styles.infoIcon} />
                  <View>
                    <Text style={styles.infoLabel}>Contact Phone</Text>
                    <Text style={styles.infoValue}>{school.contactPhone || 'N/A'}</Text>
                  </View>
                </View>
              </View>
              
              {/* Address */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Address</Text>
                
                <View style={styles.addressContainer}>
                  <Text style={styles.address}>{school.address}</Text>
                  <Text style={styles.address}>{school.city}, {school.state} {school.zipCode}</Text>
                  <Text style={styles.address}>{school.country}</Text>
                </View>
              </View>
            </View>
          </>
        )}
      </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
  },

  // Hero Section
  heroSection: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xxl,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    alignItems: 'center',
  },
  heroContent: {
    alignItems: 'center',
  },
  schoolIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
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
    marginBottom: spacing.md,
  },
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.neutral.white,
  },

  // Quick Actions
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xl,
    paddingVertical: spacing.lg,
    backgroundColor: colors.neutral.white,
    marginTop: -spacing.lg,
    marginHorizontal: spacing.lg,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Loading & Error States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  loadingText: {
    fontSize: 16,
    color: colors.neutral.gray,
    marginTop: spacing.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.neutral.text,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  errorSubtitle: {
    fontSize: 14,
    color: colors.neutral.gray,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  backButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: airbnbColors.primary,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Details Sections
  detailsContainer: {
    padding: spacing.lg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: colors.neutral.white,
    marginTop: -spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.neutral.text,
    marginBottom: spacing.md,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  infoIcon: {
    marginRight: spacing.sm,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.neutral.gray,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: colors.neutral.text,
  },
  addressContainer: {
    marginTop: spacing.xs,
  },
  address: {
    fontSize: 16,
    color: colors.neutral.text,
    marginBottom: 4,
  },
});

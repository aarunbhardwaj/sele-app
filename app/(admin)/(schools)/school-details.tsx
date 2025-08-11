import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { borderRadius, colors, spacing, typography } from '../../../components/ui/theme';
import PreAuthHeader from '../../../components/ui2/pre-auth-header';
import appwriteService from '../../../services/appwrite';
import { School } from '../../../services/appwrite/school-service';

export default function SchoolDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const schoolId = params.id as string;
  
  const [school, setSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<number>(0);
  
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
      setLoading(true);
      const schoolData = await appwriteService.getSchoolById(schoolId);
      setSchool(schoolData);
      
      // In a real app, you would fetch students associated with this school
      // For now, we'll use the enrollmentCount or a mock value
      setStudents(schoolData.enrollmentCount || Math.floor(Math.random() * 150));
    } catch (error) {
      console.error('Failed to load school data:', error);
      Alert.alert('Error', 'Failed to load school details. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleEditSchool = () => {
    router.push({
      pathname: '/(admin)/(schools)/edit-school',
      params: { id: schoolId }
    });
  };
  
  const handleDeleteSchool = async () => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this school? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await appwriteService.deleteSchool(schoolId);
              Alert.alert('Success', 'School deleted successfully');
              router.replace('/(admin)/(schools)');
            } catch (error) {
              console.error('Error deleting school:', error);
              Alert.alert('Error', 'Failed to delete school. Please try again.');
            }
          }
        }
      ]
    );
  };
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };
  
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <PreAuthHeader 
          title="School Details"
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
  
  if (!school) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <PreAuthHeader 
          title="School Details"
          leftComponent={
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color={colors.neutral.text} />
            </TouchableOpacity>
          }
        />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.status.error} />
          <Text style={styles.errorText}>School not found</Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <PreAuthHeader 
        title="School Details"
        leftComponent={
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.neutral.text} />
          </TouchableOpacity>
        }
        rightComponent={
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={handleEditSchool}
            >
              <Ionicons name="pencil-outline" size={20} color={colors.primary.main} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={handleDeleteSchool}
            >
              <Ionicons name="trash-outline" size={20} color={colors.status.error} />
            </TouchableOpacity>
          </View>
        }
      />
      
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.schoolHeader}>
          <View style={styles.logoContainer}>
            {school.logo ? (
              <Image 
                source={{ uri: school.logo }} 
                style={styles.logo}
                resizeMode="contain"
              />
            ) : (
              <View style={styles.logoPlaceholder}>
                <Text style={styles.logoText}>{school.name[0]}</Text>
              </View>
            )}
          </View>
          
          <View style={styles.schoolTitleContainer}>
            <Text style={styles.schoolName}>{school.name}</Text>
            <View style={styles.statusContainer}>
              <View style={[
                styles.statusBadge,
                school.status === 'active' && styles.activeBadge,
                school.status === 'inactive' && styles.inactiveBadge,
                school.status === 'pending' && styles.pendingBadge,
              ]}>
                <Text style={styles.statusText}>{school.status}</Text>
              </View>
            </View>
            <Text style={styles.schoolLocation}>{school.city}, {school.state}, {school.country}</Text>
          </View>
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{students}</Text>
            <Text style={styles.statLabel}>Students</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {school.status === 'active' ? 'Active' : (school.status === 'pending' ? 'Pending' : 'Inactive')}
            </Text>
            <Text style={styles.statLabel}>Status</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{formatDate(school.createdAt)}</Text>
            <Text style={styles.statLabel}>Joined</Text>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          
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
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Address</Text>
          
          <View style={styles.addressContainer}>
            <Text style={styles.address}>{school.address}</Text>
            <Text style={styles.address}>{school.city}, {school.state} {school.zipCode}</Text>
            <Text style={styles.address}>{school.country}</Text>
          </View>
        </View>
        
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={handleEditSchool}
          >
            <Ionicons name="pencil-outline" size={20} color={colors.neutral.white} />
            <Text style={styles.actionButtonText}>Edit School</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={handleDeleteSchool}
          >
            <Ionicons name="trash-outline" size={20} color={colors.neutral.white} />
            <Text style={styles.actionButtonText}>Delete School</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  contentContainer: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  errorText: {
    fontSize: typography.fontSizes.lg,
    color: colors.neutral.darkGray,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  backButton: {
    backgroundColor: colors.primary.main,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
  },
  backButtonText: {
    color: colors.neutral.white,
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium as any,
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    padding: 8,
    borderRadius: 16,
    backgroundColor: colors.neutral.background,
    marginLeft: spacing.sm,
  },
  schoolHeader: {
    flexDirection: 'row',
    alignItems: 'center',
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
  logoContainer: {
    marginRight: spacing.md,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  logoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 32,
    fontWeight: typography.fontWeights.bold as any,
    color: colors.neutral.white,
  },
  schoolTitleContainer: {
    flex: 1,
  },
  schoolName: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold as any,
    color: colors.neutral.text,
    marginBottom: spacing.xs,
  },
  statusContainer: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    backgroundColor: colors.neutral.lightGray,
  },
  activeBadge: {
    backgroundColor: colors.status.success + '20',
  },
  inactiveBadge: {
    backgroundColor: colors.status.error + '20',
  },
  pendingBadge: {
    backgroundColor: colors.status.warning + '20',
  },
  statusText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.medium as any,
    color: colors.neutral.darkGray,
    textTransform: 'capitalize',
  },
  schoolLocation: {
    fontSize: typography.fontSizes.md,
    color: colors.neutral.gray,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statNumber: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold as any,
    color: colors.primary.main,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: typography.fontSizes.sm,
    color: colors.neutral.gray,
  },
  section: {
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
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  infoIcon: {
    marginTop: 2,
    marginRight: spacing.sm,
  },
  infoLabel: {
    fontSize: typography.fontSizes.sm,
    color: colors.neutral.gray,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: typography.fontSizes.md,
    color: colors.neutral.text,
  },
  addressContainer: {
    marginTop: spacing.xs,
  },
  address: {
    fontSize: typography.fontSizes.md,
    color: colors.neutral.text,
    marginBottom: 4,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    marginHorizontal: 4,
  },
  editButton: {
    backgroundColor: colors.primary.main,
  },
  deleteButton: {
    backgroundColor: colors.status.error,
  },
  actionButtonText: {
    color: colors.neutral.white,
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium as any,
    marginLeft: spacing.xs,
  },
});

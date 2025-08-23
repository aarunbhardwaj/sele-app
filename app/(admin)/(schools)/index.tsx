import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing } from '../../../components/ui/theme';
import Text from '../../../components/ui/Typography';
import PreAuthHeader from '../../../components/ui2/pre-auth-header';
import appwriteService from '../../../services/appwrite';

// Airbnb color palette - keeping original colors
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

const { width } = Dimensions.get('window');

interface School {
  $id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  phone: string;
  email: string;
  website?: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  status: 'active' | 'inactive' | 'pending';
  enrollmentCount?: number;
  logo?: string;
  createdAt: string;
  updatedAt: string;
}

export default function SchoolsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'pending'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSchools, setTotalSchools] = useState(0);

  const itemsPerPage = 10;

  const loadSchools = useCallback(async (page = 1, refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const offset = (page - 1) * itemsPerPage;
      const queries = [];

      if (searchQuery.trim()) {
        queries.push(`name LIKE "%${searchQuery.trim()}%"`);
      }

      if (statusFilter !== 'all') {
        queries.push(`status = "${statusFilter}"`);
      }

      const response = await appwriteService.getAllSchools(
        itemsPerPage,
        offset,
        queries.length > 0 ? queries : undefined
      );

      setSchools(response.documents);
      setTotalSchools(response.total);
      setTotalPages(Math.ceil(response.total / itemsPerPage));
      setCurrentPage(page);
    } catch (error) {
      console.error('Failed to load schools:', error);
      Alert.alert('Error', 'Failed to load schools data: ' + (error as Error).message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchQuery, statusFilter]);

  useEffect(() => {
    loadSchools(1);
  }, [loadSchools]);

  const handleRefresh = () => {
    loadSchools(currentPage, true);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleStatusFilter = (status: typeof statusFilter) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleDeleteSchool = async (schoolId: string, schoolName: string) => {
    Alert.alert(
      'Delete School',
      `Are you sure you want to delete "${schoolName}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await appwriteService.deleteSchool(schoolId);
              Alert.alert('Success', 'School deleted successfully');
              loadSchools(currentPage);
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

  const renderStatusFilter = () => (
    <View style={styles.filterSection}>
      <Text style={styles.filterSectionTitle}>Filter by Status</Text>
      <FlatList
        data={[
          { 
            key: 'all', 
            label: 'All', 
            icon: 'grid-outline', 
            color: airbnbColors.primary,
            count: totalSchools 
          },
          { 
            key: 'active', 
            label: 'Active', 
            icon: 'checkmark-circle', 
            color: airbnbColors.secondary,
            count: schools && Array.isArray(schools) ? schools.filter(s => s.status === 'active').length : 0
          },
          { 
            key: 'pending', 
            label: 'Pending', 
            icon: 'time', 
            color: '#F59E0B',
            count: schools && Array.isArray(schools) ? schools.filter(s => s.status === 'pending').length : 0
          },
          { 
            key: 'inactive', 
            label: 'Inactive', 
            icon: 'pause-circle', 
            color: '#6B7280',
            count: schools && Array.isArray(schools) ? schools.filter(s => s.status === 'inactive').length : 0
          }
        ]}
        renderItem={({ item: filter }) => {
          const isActive = statusFilter === filter.key;
          return (
            <TouchableOpacity
              style={[
                styles.filterButton,
                isActive && [styles.filterButtonActive, { backgroundColor: filter.color }]
              ]}
              onPress={() => handleStatusFilter(filter.key as typeof statusFilter)}
              activeOpacity={0.7}
            >
              <View style={[
                styles.filterIconContainer,
                isActive && styles.filterIconContainerActive
              ]}>
                <Ionicons 
                  name={filter.icon as any} 
                  size={18} 
                  color={isActive ? filter.color : filter.color} 
                />
              </View>
              <View style={styles.filterTextContainer}>
                <Text style={[
                  styles.filterButtonText,
                  isActive && styles.filterButtonTextActive
                ]}>
                  {filter.label}
                </Text>
                <View style={[
                  styles.filterCountBadge,
                  isActive ? styles.filterCountBadgeActive : { backgroundColor: filter.color + '15' }
                ]}>
                  <Text style={[
                    styles.filterCountText,
                    isActive ? styles.filterCountTextActive : { color: filter.color }
                  ]}>
                    {filter.count}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
        keyExtractor={(item) => item.key}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContent}
      />
    </View>
  );

  const renderSchoolCard = (school: School) => (
    <View style={styles.schoolCardContainer}>
      <TouchableOpacity
        style={styles.schoolCard}
        onPress={() => router.push(`/(admin)/(schools)/school-details?id=${school.$id}`)}
      >
        <View style={styles.schoolCardHeader}>
          <View style={styles.schoolInfo}>
            <View style={styles.schoolIconContainer}>
              <Ionicons name="school" size={24} color={airbnbColors.primary} />
            </View>
            <View style={styles.schoolDetails}>
              <Text style={styles.schoolName}>{school.name}</Text>
              <Text style={styles.schoolLocation}>
                {school.city}, {school.state}
              </Text>
              <Text style={styles.schoolContact}>
                {school.contactPerson} • {school.contactPhone}
              </Text>
            </View>
          </View>
          <View style={styles.schoolActions}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(school.status) + '15' }]}>
              <Text style={[styles.statusText, { color: getStatusColor(school.status) }]}>
                {school.status.charAt(0).toUpperCase() + school.status.slice(1)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.schoolCardBody}>
          <View style={styles.schoolMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="people-outline" size={16} color={colors.neutral.gray} />
              <Text style={styles.metaText}>
                {school.enrollmentCount || 0} Students
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="mail-outline" size={16} color={colors.neutral.gray} />
              <Text style={styles.metaText}>{school.email}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="call-outline" size={16} color={colors.neutral.gray} />
              <Text style={styles.metaText}>{school.phone}</Text>
            </View>
          </View>
        </View>

        <View style={styles.schoolCardFooter}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={(e) => {
              e.stopPropagation();
              router.push(`/(admin)/(schools)/edit-school?id=${school.$id}`);
            }}
          >
            <Ionicons name="create-outline" size={16} color={airbnbColors.secondary} />
            <Text style={[styles.actionButtonText, { color: airbnbColors.secondary }]}>Edit</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={(e) => {
              e.stopPropagation();
              handleDeleteSchool(school.$id, school.name);
            }}
          >
            <Ionicons name="trash-outline" size={16} color={airbnbColors.primary} />
            <Text style={[styles.actionButtonText, { color: airbnbColors.primary }]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  );

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <View style={styles.paginationContainer}>
        <TouchableOpacity
          style={[styles.paginationButton, currentPage === 1 && styles.paginationButtonDisabled]}
          onPress={() => currentPage > 1 && loadSchools(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <Ionicons name="chevron-back" size={20} color={currentPage === 1 ? '#9CA3AF' : airbnbColors.primary} />
        </TouchableOpacity>

        <Text style={styles.paginationText}>
          Page {currentPage} of {totalPages}
        </Text>

        <TouchableOpacity
          style={[styles.paginationButton, currentPage === totalPages && styles.paginationButtonDisabled]}
          onPress={() => currentPage < totalPages && loadSchools(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <Ionicons name="chevron-forward" size={20} color={currentPage === totalPages ? '#9CA3AF' : airbnbColors.primary} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderHeader = () => (
    <>
      {/* Hero Section */}
      <View style={styles.heroSection}>
        <View style={styles.heroCard}>
          <View style={styles.heroHeader}>
            <View style={styles.heroIconContainer}>
              <Ionicons name="school" size={32} color={airbnbColors.primary} />
            </View>
            <View style={styles.heroContent}>
              <Text style={styles.heroTitle}>Schools Directory</Text>
              <Text style={styles.heroSubtitle}>
                Manage educational institutions and partnerships
              </Text>
            </View>
          </View>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{totalSchools}</Text>
              <Text style={styles.statLabel}>Total Schools</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: airbnbColors.secondary }]}>
                {schools && Array.isArray(schools) ? schools.filter(s => s.status === 'active').length : 0}
              </Text>
              <Text style={styles.statLabel}>Active</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#F59E0B' }]}>
                {schools && Array.isArray(schools) ? schools.filter(s => s.status === 'pending').length : 0}
              </Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Search and Filters */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.neutral.gray} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search schools by name..."
            placeholderTextColor={colors.neutral.gray}
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Ionicons name="close-circle" size={20} color={colors.neutral.gray} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Status Filters */}
      {renderStatusFilter()}

      {/* Add School Button */}
      <View style={styles.addButtonContainer}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/(admin)/(schools)/add-school')}
        >
          <Ionicons name="add-circle" size={20} color={colors.neutral.white} />
          <Text style={styles.addButtonText}>Add New School</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="school-outline" size={64} color={colors.neutral.gray} />
      <Text style={styles.emptyTitle}>No Schools Found</Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery || statusFilter !== 'all' 
          ? 'Try adjusting your search or filters'
          : 'Get started by adding your first school'
        }
      </Text>
      {!searchQuery && statusFilter === 'all' && (
        <TouchableOpacity
          style={styles.emptyButton}
          onPress={() => router.push('/(admin)/(schools)/add-school')}
        >
          <Ionicons name="add" size={20} color={airbnbColors.primary} />
          <Text style={[styles.emptyButtonText, { color: airbnbColors.primary }]}>
            Add First School
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderFooter = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={airbnbColors.primary} />
          <Text style={styles.loadingText}>Loading schools...</Text>
        </View>
      );
    }
    return renderPagination();
  };

  return (
    <View style={styles.safeArea}>
      <SafeAreaView style={styles.headerContainer}>
        <PreAuthHeader 
          title="Schools Management"
          showBackButton={true}
          onBackPress={() => router.back()}
          showNotifications={true}
          showRefresh={true}
          onRefreshPress={handleRefresh}
          onNotificationPress={() => console.log('Schools notifications')}
        />
      </SafeAreaView>

      <View style={styles.container}>
        <FlatList
          data={schools}
          renderItem={({ item, index }) => (
            <Animated.View
              entering={FadeInUp.delay(index * 50).duration(400)}
            >
              {renderSchoolCard(item)}
            </Animated.View>
          )}
          keyExtractor={(item) => item.$id}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={!loading ? renderEmptyState : null}
          ListFooterComponent={renderFooter}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[airbnbColors.primary]}
              tintColor={airbnbColors.primary}
            />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.flatListContent,
            { paddingBottom: Math.max(insets.bottom || 0, 20) + 80 }
          ]}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          updateCellsBatchingPeriod={50}
          initialNumToRender={5}
          windowSize={10}
        />
      </View>
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

  // Modern Hero Section - White card without background gradient
  heroSection: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  heroCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: 20,
    padding: spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  heroIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: airbnbColors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  heroContent: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.neutral.text,
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 16,
    color: colors.neutral.darkGray,
    lineHeight: 22,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: airbnbColors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.neutral.darkGray,
    marginTop: 4,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#E2E8F0',
    marginHorizontal: spacing.sm,
  },

  // Search Section
  searchSection: {
    padding: spacing.lg,
    paddingBottom: spacing.sm,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.white,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: 16,
    color: colors.neutral.text,
  },

  // Filters
  filterSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  filterSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral.text,
    marginBottom: spacing.xs,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  filterContent: {
    gap: spacing.sm,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: airbnbColors.primary + '30',
    backgroundColor: colors.neutral.white,
  },
  filterButtonActive: {
    backgroundColor: airbnbColors.primary,
    borderColor: airbnbColors.primary,
  },
  filterIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: airbnbColors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  filterIconContainerActive: {
    backgroundColor: colors.neutral.white,
  },
  filterTextContainer: {
    flex: 1,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: airbnbColors.primary,
  },
  filterButtonTextActive: {
    color: colors.neutral.white,
  },
  filterCountBadge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.xs,
  },
  filterCountBadgeActive: {
    backgroundColor: airbnbColors.secondary,
  },
  filterCountText: {
    fontSize: 12,
    fontWeight: '500',
    color: airbnbColors.primary,
  },
  filterCountTextActive: {
    color: colors.neutral.white,
  },

  // Add Button
  addButtonContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  addButton: {
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
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral.white,
    marginLeft: spacing.sm,
  },

  // Schools List
  schoolsList: {
    flex: 1,
  },
  schoolsListContent: {
    padding: spacing.lg,
    gap: spacing.md,
  },

  // School Card
  schoolCardContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  schoolCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: 16,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  schoolCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  schoolInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  schoolIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: airbnbColors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  schoolDetails: {
    flex: 1,
  },
  schoolName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral.text,
    marginBottom: 2,
  },
  schoolLocation: {
    fontSize: 14,
    color: colors.neutral.gray,
    marginBottom: 2,
  },
  schoolContact: {
    fontSize: 12,
    color: colors.neutral.gray,
  },
  schoolActions: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  schoolCardBody: {
    marginBottom: spacing.md,
  },
  schoolMeta: {
    gap: spacing.xs,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaText: {
    fontSize: 12,
    color: colors.neutral.gray,
    flex: 1,
  },
  schoolCardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },

  // Pagination
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.lg,
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  paginationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.neutral.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  paginationButtonDisabled: {
    opacity: 0.5,
  },
  paginationText: {
    fontSize: 14,
    color: colors.neutral.text,
    fontWeight: '500',
  },

  // Loading & Empty States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  loadingText: {
    fontSize: 16,
    color: colors.neutral.gray,
    marginTop: spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.neutral.text,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.neutral.gray,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: airbnbColors.primary,
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  schoolCardWrapper: {
    marginBottom: spacing.md,
  },
  flatListContent: {
    flexGrow: 1,
  },
});

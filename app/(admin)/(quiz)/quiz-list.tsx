import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import { borderRadius, colors, spacing } from '../../../components/ui/theme';
import Text from '../../../components/ui/Typography';
import PreAuthHeader from '../../../components/ui2/pre-auth-header';
import appwriteService from '../../../services/appwrite';

function QuizListScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [quizzes, setQuizzes] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'published', 'drafts'
  
  useEffect(() => {
    fetchQuizzes();
  }, []);
  
  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const fetchedQuizzes = await appwriteService.getAllQuizzes();
      
      // Sort quizzes by creation date (newest first)
      fetchedQuizzes.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      setQuizzes(fetchedQuizzes);
    } catch (error) {
      console.error('Failed to fetch quizzes:', error);
      Alert.alert('Error', 'Failed to load quizzes: ' + (error.message || error));
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteQuiz = (quiz) => {
    Alert.alert(
      'Confirm Deletion',
      `Are you sure you want to delete "${quiz.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await appwriteService.deleteQuiz(quiz.$id);
              setQuizzes(quizzes.filter(q => q.$id !== quiz.$id));
              Alert.alert('Success', 'Quiz deleted successfully');
            } catch (error) {
              console.error('Failed to delete quiz:', error);
              Alert.alert('Error', 'Failed to delete quiz: ' + (error.message || error));
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };
  
  const handleEditQuiz = (quiz) => {
    // Navigate to question editor
    router.push({
      pathname: '/(admin)/(quiz)/question-editor',
      params: { quizId: quiz.$id }
    });
  };

  const getFilteredQuizzes = () => {
    if (filter === 'all') return quizzes;
    if (filter === 'published') return quizzes.filter(quiz => quiz.isPublished);
    if (filter === 'drafts') return quizzes.filter(quiz => !quiz.isPublished);
    return quizzes;
  };

  const renderFilterButton = (title, value) => (
    <TouchableOpacity
      style={[styles.filterButton, filter === value && styles.filterButtonActive]}
      onPress={() => setFilter(value)}
    >
      <Text 
        variant="button"
        color={filter === value ? colors.primary.main : colors.neutral.darkGray}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
  
  const renderEmptyState = () => (
    <Card style={styles.emptyStateCard}>
      <Ionicons name="help-circle-outline" size={48} color={colors.neutral.lightGray} />
      <Text variant="body1" style={styles.emptyStateText}>
        No quizzes found
      </Text>
      <Text variant="body2" style={styles.emptyStateSubtext}>
        Create your first quiz to get started
      </Text>
      <Button
        title="Create Quiz"
        onPress={() => router.push('/(admin)/(quiz)/quiz-creator')}
        style={styles.createButton}
      />
    </Card>
  );
  
  const renderQuizItem = (quiz) => {
    // Format date
    const formattedDate = new Date(quiz.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    
    return (
      <Card key={quiz.$id} style={styles.quizCard}>
        <View style={styles.quizCardHeader}>
          <View>
            <Text variant="h5" style={styles.quizTitle}>{quiz.title}</Text>
            <View style={styles.quizMeta}>
              <View style={styles.metaItem}>
                <Ionicons name="calendar-outline" size={14} color={colors.neutral.gray} />
                <Text variant="caption" style={styles.metaText}>
                  {formattedDate}
                </Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="school-outline" size={14} color={colors.neutral.gray} />
                <Text variant="caption" style={styles.metaText}>
                  {quiz.category.charAt(0).toUpperCase() + quiz.category.slice(1)}
                </Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="trending-up-outline" size={14} color={colors.neutral.gray} />
                <Text variant="caption" style={styles.metaText}>
                  {quiz.difficulty.charAt(0).toUpperCase() + quiz.difficulty.slice(1)}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.statusBadge}>
            <Text 
              variant="caption" 
              style={[
                styles.statusText, 
                quiz.isPublished ? styles.publishedText : styles.draftText
              ]}
            >
              {quiz.isPublished ? 'Published' : 'Draft'}
            </Text>
          </View>
        </View>
        
        <Text variant="body2" style={styles.quizDescription}>
          {quiz.description.length > 100 ? quiz.description.substring(0, 100) + '...' : quiz.description}
        </Text>
        
        <View style={styles.quizCardFooter}>
          <View style={styles.quizStats}>
            <View style={styles.statItem}>
              <Ionicons name="time-outline" size={16} color={colors.neutral.darkGray} />
              <Text variant="caption" style={styles.statText}>
                {quiz.timeLimit > 0 ? `${quiz.timeLimit} min` : 'No limit'}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="checkmark-circle-outline" size={16} color={colors.neutral.darkGray} />
              <Text variant="caption" style={styles.statText}>
                {quiz.passScore}% to pass
              </Text>
            </View>
          </View>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.iconButton, styles.editButton]}
              onPress={() => handleEditQuiz(quiz)}
            >
              <Ionicons name="create-outline" size={18} color={colors.primary.main} />
              <Text variant="caption" color={colors.primary.main} style={styles.iconButtonText}>
                Edit
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.iconButton, styles.deleteButton]}
              onPress={() => handleDeleteQuiz(quiz)}
            >
              <Ionicons name="trash-outline" size={18} color={colors.status.error} />
              <Text variant="caption" color={colors.status.error} style={styles.iconButtonText}>
                Delete
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Card>
    );
  };
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <PreAuthHeader 
        title="Quiz List"
        leftIcon={<Ionicons name="arrow-back" size={24} color="#333333" />}
        onLeftIconPress={() => router.push('/(admin)/(quiz)')}
        rightComponent={
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={fetchQuizzes}
          >
            <Ionicons name="refresh-outline" size={24} color="#333333" />
          </TouchableOpacity>
        }
      />
      
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text variant="h4" style={styles.pageTitle}>All Quizzes</Text>
          <Button
            title="Create New Quiz"
            onPress={() => router.push('/(admin)/(quiz)/quiz-creator')}
            style={styles.createButton}
            icon={<Ionicons name="add-circle-outline" size={20} color={colors.neutral.white} />}
          />
        </View>
        
        <View style={styles.filtersContainer}>
          {renderFilterButton('All Quizzes', 'all')}
          {renderFilterButton('Published', 'published')}
          {renderFilterButton('Drafts', 'drafts')}
        </View>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary.main} />
            <Text variant="body1" style={styles.loadingText}>Loading quizzes...</Text>
          </View>
        ) : (
          <ScrollView style={styles.scrollView}>
            <View style={styles.contentContainer}>
              {getFilteredQuizzes().length === 0 ? (
                renderEmptyState()
              ) : (
                getFilteredQuizzes().map(renderQuizItem)
              )}
            </View>
          </ScrollView>
        )}
      </View>
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
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.neutral.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.lightGray,
  },
  pageTitle: {
    color: colors.neutral.text,
  },
  createButton: {
    paddingHorizontal: spacing.md,
  },
  filtersContainer: {
    flexDirection: 'row',
    padding: spacing.md,
    backgroundColor: colors.neutral.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.lightGray,
  },
  filterButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    marginRight: spacing.sm,
  },
  filterButtonActive: {
    backgroundColor: colors.primary.light + '30',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    color: colors.neutral.darkGray,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  quizCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  quizCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  quizTitle: {
    color: colors.neutral.text,
    marginBottom: spacing.xs,
  },
  quizMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  metaText: {
    color: colors.neutral.gray,
    marginLeft: 4,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontWeight: 'bold',
  },
  publishedText: {
    color: colors.primary.main,
  },
  draftText: {
    color: colors.primary.light,
  },
  quizDescription: {
    color: colors.neutral.darkGray,
    marginBottom: spacing.md,
  },
  quizCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.lightGray,
  },
  quizStats: {
    flexDirection: 'row',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  statText: {
    color: colors.neutral.darkGray,
    marginLeft: 4,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  iconButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.xs,
    marginLeft: spacing.sm,
    borderRadius: borderRadius.md,
  },
  editButton: {
    backgroundColor: colors.primary.light + '20',
  },
  deleteButton: {
    backgroundColor: colors.status.error + '20',
  },
  iconButtonText: {
    marginLeft: 4,
  },
  refreshButton: {
    padding: 8,
    borderRadius: 16,
    backgroundColor: '#E5E5E5',
  },
  emptyStateCard: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    marginTop: spacing.sm,
    color: colors.neutral.darkGray,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    marginTop: spacing.xs,
    marginBottom: spacing.md,
    color: colors.neutral.gray,
    textAlign: 'center',
  },
});

// Make sure the export is at the bottom as well
export default QuizListScreen;
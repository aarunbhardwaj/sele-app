import React, { useState, useEffect, useMemo } from 'react';
import { ScrollView, View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Text from './Typography';
import Card from './Card';
import { useLearningProgress } from '../../services/LearningProgressContext';
import { useAuth } from '../../services/AuthContext';

const { width } = Dimensions.get('window');

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

interface ChartDataPoint {
  label: string;
  value: number;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon, color, trend }) => (
  <Card variant="elevated" style={[styles.metricCard, { borderLeftColor: color }]}>
    <View style={styles.metricHeader}>
      <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View style={styles.metricInfo}>
        <Text variant="caption" style={styles.metricTitle}>{title}</Text>
        <Text variant="h2" style={styles.metricValue}>{value}</Text>
        {trend && (
          <View style={styles.trendContainer}>
            <Ionicons 
              name={trend.isPositive ? 'trending-up' : 'trending-down'} 
              size={16} 
              color={trend.isPositive ? '#28a745' : '#dc3545'} 
            />
            <Text 
              variant="caption" 
              style={[styles.trendText, { color: trend.isPositive ? '#28a745' : '#dc3545' }]}
            >
              {trend.value}%
            </Text>
          </View>
        )}
      </View>
    </View>
  </Card>
);

const SimpleBarChart: React.FC<{ data: ChartDataPoint[]; color: string }> = ({ data, color }) => {
  const maxValue = Math.max(...data.map(d => d.value));
  
  return (
    <View style={styles.chartContainer}>
      {data.map((item, index) => (
        <View key={index} style={styles.barContainer}>
          <View style={styles.barWrapper}>
            <View 
              style={[
                styles.bar, 
                { 
                  height: maxValue > 0 ? `${(item.value / maxValue) * 100}%` : '2%',
                  backgroundColor: color 
                }
              ]} 
            />
          </View>
          <Text variant="caption" style={styles.barLabel}>{item.label}</Text>
          <Text variant="caption" style={styles.barValue}>{item.value}</Text>
        </View>
      ))}
    </View>
  );
};

const ProgressCircle: React.FC<{ percentage: number; size: number; color: string }> = ({ 
  percentage, 
  size, 
  color 
}) => {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <View style={[styles.progressCircle, { width: size, height: size }]}>
      <svg width={size} height={size} style={styles.progressSvg}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e9ecef"
          strokeWidth="4"
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth="4"
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <View style={styles.progressText}>
        <Text variant="h4" style={styles.progressPercentage}>{Math.round(percentage)}%</Text>
      </View>
    </View>
  );
};

export default function AnalyticsDashboard() {
  const { user } = useAuth();
  const {
    lessons,
    vocabulary,
    exercises,
    studySessions,
    achievements,
    overallCompletion,
    streakDays,
    currentStreak,
    totalStudyTime,
    vocabularyMastered,
    hydrated
  } = useLearningProgress();

  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');

  // Calculate metrics
  const metrics = useMemo(() => {
    const completedLessons = Object.values(lessons).filter(l => l.completed).length;
    const totalLessons = Object.values(lessons).length;
    const masteredVocab = Object.values(vocabulary).filter(v => v.masteryLevel && v.masteryLevel >= 80).length;
    const totalVocab = Object.values(vocabulary).length;
    const successfulExercises = Object.values(exercises).reduce((sum, e) => sum + e.successes, 0);
    const totalExerciseAttempts = Object.values(exercises).reduce((sum, e) => sum + e.attempts, 0);

    return {
      completedLessons,
      totalLessons,
      completionRate: totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0,
      masteredVocab,
      totalVocab,
      vocabularyRate: totalVocab > 0 ? (masteredVocab / totalVocab) * 100 : 0,
      exerciseSuccessRate: totalExerciseAttempts > 0 ? (successfulExercises / totalExerciseAttempts) * 100 : 0,
      averageSessionTime: studySessions.length > 0 
        ? studySessions.reduce((sum, s) => sum + s.duration, 0) / studySessions.length 
        : 0,
    };
  }, [lessons, vocabulary, exercises, studySessions]);

  // Weekly activity data
  const weeklyData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const now = new Date();
    const weekData: ChartDataPoint[] = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      const session = studySessions.find(s => s.date === dateString);
      weekData.push({
        label: days[(7 + date.getDay() - 1) % 7], // Adjust for Monday start
        value: session ? session.duration : 0
      });
    }

    return weekData;
  }, [studySessions]);

  // Vocabulary progress data
  const vocabularyProgress = useMemo(() => {
    const levels = ['Beginner', 'Intermediate', 'Advanced', 'Mastered'];
    const vocabByLevel = Object.values(vocabulary).reduce((acc, vocab) => {
      const mastery = vocab.masteryLevel || 0;
      if (mastery >= 80) acc.mastered++;
      else if (mastery >= 60) acc.advanced++;
      else if (mastery >= 30) acc.intermediate++;
      else acc.beginner++;
      return acc;
    }, { beginner: 0, intermediate: 0, advanced: 0, mastered: 0 });

    return [
      { label: 'Beginner', value: vocabByLevel.beginner },
      { label: 'Intermediate', value: vocabByLevel.intermediate },
      { label: 'Advanced', value: vocabByLevel.advanced },
      { label: 'Mastered', value: vocabByLevel.mastered },
    ];
  }, [vocabulary]);

  // Recent achievements
  const recentAchievements = useMemo(() => {
    return achievements
      .sort((a, b) => new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime())
      .slice(0, 3);
  }, [achievements]);

  if (!hydrated) {
    return (
      <View style={styles.loadingContainer}>
        <Text variant="body1">Loading analytics...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text variant="h1" style={styles.title}>Learning Analytics</Text>
        <Text variant="body2" style={styles.subtitle}>
          Track your progress and insights
        </Text>
      </View>

      {/* Key Metrics */}
      <View style={styles.metricsGrid}>
        <MetricCard
          title="Lessons Completed"
          value={`${metrics.completedLessons}/${metrics.totalLessons}`}
          icon="book"
          color="#007bff"
          trend={{
            value: Math.round(metrics.completionRate),
            isPositive: metrics.completionRate > 50
          }}
        />
        <MetricCard
          title="Current Streak"
          value={`${currentStreak} days`}
          icon="flame"
          color="#fd7e14"
          trend={{
            value: currentStreak,
            isPositive: currentStreak > 0
          }}
        />
        <MetricCard
          title="Vocabulary Mastered"
          value={`${metrics.masteredVocab}/${metrics.totalVocab}`}
          icon="library"
          color="#28a745"
          trend={{
            value: Math.round(metrics.vocabularyRate),
            isPositive: metrics.vocabularyRate > 60
          }}
        />
        <MetricCard
          title="Total Study Time"
          value={`${Math.round(totalStudyTime / 60)}h`}
          icon="time"
          color="#6f42c1"
          trend={{
            value: Math.round(metrics.averageSessionTime),
            isPositive: metrics.averageSessionTime > 20
          }}
        />
      </View>

      {/* Progress Overview */}
      <Card variant="elevated" style={styles.section}>
        <Text variant="h3" style={styles.sectionTitle}>Progress Overview</Text>
        <View style={styles.progressOverview}>
          <View style={styles.progressItem}>
            <ProgressCircle percentage={metrics.completionRate} size={80} color="#007bff" />
            <Text variant="h6" style={styles.progressLabel}>Lessons</Text>
          </View>
          <View style={styles.progressItem}>
            <ProgressCircle percentage={metrics.vocabularyRate} size={80} color="#28a745" />
            <Text variant="h6" style={styles.progressLabel}>Vocabulary</Text>
          </View>
          <View style={styles.progressItem}>
            <ProgressCircle percentage={metrics.exerciseSuccessRate} size={80} color="#6f42c1" />
            <Text variant="h6" style={styles.progressLabel}>Exercises</Text>
          </View>
          <View style={styles.progressItem}>
            <ProgressCircle percentage={overallCompletion} size={80} color="#fd7e14" />
            <Text variant="h6" style={styles.progressLabel}>Overall</Text>
          </View>
        </View>
      </Card>

      {/* Weekly Activity */}
      <Card variant="elevated" style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text variant="h3" style={styles.sectionTitle}>Weekly Activity</Text>
          <Text variant="caption" style={styles.chartSubtitle}>Study time (minutes)</Text>
        </View>
        <SimpleBarChart data={weeklyData} color="#007bff" />
      </Card>

      {/* Vocabulary Distribution */}
      <Card variant="elevated" style={styles.section}>
        <Text variant="h3" style={styles.sectionTitle}>Vocabulary Progress</Text>
        <SimpleBarChart data={vocabularyProgress} color="#28a745" />
      </Card>

      {/* Recent Achievements */}
      <Card variant="elevated" style={styles.section}>
        <Text variant="h3" style={styles.sectionTitle}>Recent Achievements</Text>
        {recentAchievements.length > 0 ? (
          <View style={styles.achievementsList}>
            {recentAchievements.map((achievement) => (
              <View key={achievement.id} style={styles.achievementItem}>
                <View style={styles.achievementIcon}>
                  <Ionicons name={achievement.icon as any} size={24} color="#ffc107" />
                </View>
                <View style={styles.achievementInfo}>
                  <Text variant="h6" style={styles.achievementTitle}>{achievement.title}</Text>
                  <Text variant="body2" style={styles.achievementDescription}>
                    {achievement.description}
                  </Text>
                  <Text variant="caption" style={styles.achievementDate}>
                    {new Date(achievement.unlockedAt).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="trophy-outline" size={48} color="#adb5bd" />
            <Text variant="body1" style={styles.emptyText}>No achievements yet</Text>
            <Text variant="body2" style={styles.emptySubtext}>
              Keep learning to unlock achievements!
            </Text>
          </View>
        )}
      </Card>

      {/* Study Statistics */}
      <Card variant="elevated" style={styles.section}>
        <Text variant="h3" style={styles.sectionTitle}>Study Statistics</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text variant="h4" style={styles.statValue}>{studySessions.length}</Text>
            <Text variant="body2" style={styles.statLabel}>Study Sessions</Text>
          </View>
          <View style={styles.statItem}>
            <Text variant="h4" style={styles.statValue}>{Math.round(metrics.averageSessionTime)}</Text>
            <Text variant="body2" style={styles.statLabel}>Avg Session (min)</Text>
          </View>
          <View style={styles.statItem}>
            <Text variant="h4" style={styles.statValue}>{achievements.length}</Text>
            <Text variant="body2" style={styles.statLabel}>Achievements</Text>
          </View>
          <View style={styles.statItem}>
            <Text variant="h4" style={styles.statValue}>{Object.keys(exercises).length}</Text>
            <Text variant="body2" style={styles.statLabel}>Exercises Done</Text>
          </View>
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    color: '#212529',
    marginBottom: 8,
  },
  subtitle: {
    color: '#6c757d',
    lineHeight: 20,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 8,
  },
  metricCard: {
    width: (width - 40) / 2,
    padding: 16,
    borderLeftWidth: 4,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  metricInfo: {
    flex: 1,
  },
  metricTitle: {
    color: '#6c757d',
    marginBottom: 4,
  },
  metricValue: {
    color: '#212529',
    marginBottom: 4,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    margin: 16,
    marginTop: 8,
    padding: 20,
  },
  sectionTitle: {
    color: '#212529',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartSubtitle: {
    color: '#6c757d',
  },
  progressOverview: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  progressItem: {
    alignItems: 'center',
    gap: 8,
  },
  progressCircle: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressSvg: {
    position: 'absolute',
  },
  progressText: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressPercentage: {
    color: '#212529',
    fontSize: 14,
    fontWeight: '600',
  },
  progressLabel: {
    color: '#6c757d',
    textAlign: 'center',
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
    paddingBottom: 20,
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  barWrapper: {
    height: 80,
    justifyContent: 'flex-end',
    width: '100%',
    paddingHorizontal: 4,
  },
  bar: {
    width: '100%',
    minHeight: 2,
    borderRadius: 2,
  },
  barLabel: {
    color: '#6c757d',
    marginTop: 4,
    fontSize: 10,
  },
  barValue: {
    color: '#495057',
    marginTop: 2,
    fontSize: 10,
    fontWeight: '600',
  },
  achievementsList: {
    gap: 16,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff3cd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    color: '#212529',
    marginBottom: 2,
  },
  achievementDescription: {
    color: '#6c757d',
    marginBottom: 4,
  },
  achievementDate: {
    color: '#adb5bd',
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    color: '#6c757d',
    marginTop: 12,
    marginBottom: 4,
  },
  emptySubtext: {
    color: '#adb5bd',
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 8,
  },
  statValue: {
    color: '#007bff',
    marginBottom: 4,
  },
  statLabel: {
    color: '#6c757d',
    textAlign: 'center',
  },
});
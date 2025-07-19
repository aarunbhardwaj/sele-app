import { Ionicons } from '@expo/vector-icons';
import { Tabs, usePathname, useRouter } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import React, { useRef, useState } from 'react';
import { Image, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, spacing, typography } from '../../components/ui/theme';
import { useAuth } from '../../services/AuthContext';

export default function TabsLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const drawerRef = useRef(null);
  const { logout, user } = useAuth();
  const [isNavigating, setIsNavigating] = useState(false);

  // Navigation function that also closes the drawer
  const handleNavigation = (route: string) => {
    if (isNavigating) return;
    setIsNavigating(true);
    
    // Navigate with a small delay to avoid animation jank
    setTimeout(() => {
      router.push(route as any);
      setIsNavigating(false);
    }, 150);
  };

  const handleLogout = () => {
    if (isNavigating) return;
    setIsNavigating(true);
    
    // Navigate with a small delay to avoid animation jank
    setTimeout(() => {
      logout();
      setIsNavigating(false);
    }, 150);
  };

  // Helper to check if a route is active
  const isRouteActive = (route) => {
    // Handle home page special case
    if (route === '/(tabs)' && pathname === '/(tabs)') {
      return true;
    }
    
    // For other routes, check if the pathname includes the route
    return pathname.includes(route) && route !== '/(tabs)';
  };

  // Get the styles for an item based on active state
  const getItemStyles = (route) => {
    const active = isRouteActive(route);
    return {
      drawerItem: [
        styles.drawerItem, 
        active && styles.drawerItemActive
      ],
      iconColor: active ? colors.primary.main : colors.neutral.darkGray,
      textStyle: [
        styles.drawerItemText, 
        active && styles.drawerItemTextActive
      ]
    };
  };

  // Custom drawer content for our drawer navigator
  const DrawerContent = (props) => (
    <SafeAreaView style={styles.drawerContainer}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.drawerHeader}>
        <Image
          source={require('../../assets/images/app-logo.png')}
          style={styles.drawerLogo}
          resizeMode="contain"
        />
        <Text style={styles.drawerAppName}>EnglishApp</Text>
        <Text style={styles.drawerUsername}>{user?.name || 'User'}</Text>
      </View>
      
      <View style={styles.drawerContent}>
        {/* Main Navigation */}
        {(() => {
          const homeStyles = getItemStyles('/(tabs)');
          return (
            <TouchableOpacity 
              style={homeStyles.drawerItem} 
              onPress={() => {
                props.navigation.closeDrawer();
                handleNavigation('/(tabs)');
              }}
            >
              <Ionicons 
                name={homeStyles.iconColor === colors.primary.main ? "home" : "home-outline"} 
                size={22} 
                color={homeStyles.iconColor} 
              />
              <Text style={homeStyles.textStyle}>Home</Text>
              {isRouteActive('/(tabs)') && pathname === '/(tabs)' && <View style={styles.activeRouteMark} />}
            </TouchableOpacity>
          );
        })()}

        {/* Learning Category */}
        <Text style={styles.drawerCategoryLabel}>Learning</Text>

        {(() => {
          const coursesStyles = getItemStyles('/(tabs)/(courses)');
          return (
            <TouchableOpacity 
              style={coursesStyles.drawerItem} 
              onPress={() => {
                props.navigation.closeDrawer();
                handleNavigation('/(tabs)/(courses)');
              }}
            >
              <Ionicons 
                name={coursesStyles.iconColor === colors.primary.main ? "book" : "book-outline"} 
                size={22} 
                color={coursesStyles.iconColor} 
              />
              <Text style={coursesStyles.textStyle}>My Courses</Text>
              {isRouteActive('/(tabs)/(courses)') && pathname === '/(tabs)/(courses)' && <View style={styles.activeRouteMark} />}
            </TouchableOpacity>
          );
        })()}
        
        {(() => {
          const catalogStyles = getItemStyles('/(tabs)/(courses)/catalog');
          return (
            <TouchableOpacity 
              style={catalogStyles.drawerItem} 
              onPress={() => {
                props.navigation.closeDrawer();
                handleNavigation('/(tabs)/(courses)/catalog');
              }}
            >
              <Ionicons 
                name={catalogStyles.iconColor === colors.primary.main ? "library" : "library-outline"} 
                size={22} 
                color={catalogStyles.iconColor} 
              />
              <Text style={catalogStyles.textStyle}>Course Catalog</Text>
              {isRouteActive('/(tabs)/(courses)/catalog') && <View style={styles.activeRouteMark} />}
            </TouchableOpacity>
          );
        })()}
        
        {(() => {
          const quizStyles = getItemStyles('/(tabs)/(quiz)');
          return (
            <TouchableOpacity 
              style={quizStyles.drawerItem} 
              onPress={() => {
                props.navigation.closeDrawer();
                handleNavigation('/(tabs)/(quiz)/categories');
              }}
            >
              <Ionicons 
                name={quizStyles.iconColor === colors.primary.main ? "help-circle" : "help-circle-outline"} 
                size={22} 
                color={quizStyles.iconColor} 
              />
              <Text style={quizStyles.textStyle}>Quizzes</Text>
              {isRouteActive('/(tabs)/(quiz)') && <View style={styles.activeRouteMark} />}
            </TouchableOpacity>
          );
        })()}
        
        {(() => {
          const dashboardStyles = getItemStyles('/(tabs)/(learning)/dashboard');
          return (
            <TouchableOpacity 
              style={dashboardStyles.drawerItem} 
              onPress={() => {
                props.navigation.closeDrawer();
                handleNavigation('/(tabs)/(learning)/dashboard');
              }}
            >
              <Ionicons 
                name={dashboardStyles.iconColor === colors.primary.main ? "analytics" : "analytics-outline"} 
                size={22} 
                color={dashboardStyles.iconColor} 
              />
              <Text style={dashboardStyles.textStyle}>Progress Dashboard</Text>
              {isRouteActive('/(tabs)/(learning)/dashboard') && <View style={styles.activeRouteMark} />}
            </TouchableOpacity>
          );
        })()}
        
        {/* Community Category */}
        <Text style={styles.drawerCategoryLabel}>Community</Text>

        {(() => {
          const classesStyles = getItemStyles('/(tabs)/(classes)');
          return (
            <TouchableOpacity 
              style={classesStyles.drawerItem} 
              onPress={() => {
                props.navigation.closeDrawer();
                handleNavigation('/(tabs)/(classes)');
              }}
            >
              <Ionicons 
                name={classesStyles.iconColor === colors.primary.main ? "people" : "people-outline"} 
                size={22} 
                color={classesStyles.iconColor} 
              />
              <Text style={classesStyles.textStyle}>Live Classes</Text>
              {isRouteActive('/(tabs)/(classes)') && pathname === '/(tabs)/(classes)' && <View style={styles.activeRouteMark} />}
            </TouchableOpacity>
          );
        })()}
        
        {(() => {
          const scheduleStyles = getItemStyles('/(tabs)/(classes)/schedule');
          return (
            <TouchableOpacity 
              style={scheduleStyles.drawerItem} 
              onPress={() => {
                props.navigation.closeDrawer();
                handleNavigation('/(tabs)/(classes)/schedule');
              }}
            >
              <Ionicons 
                name={scheduleStyles.iconColor === colors.primary.main ? "calendar" : "calendar-outline"} 
                size={22} 
                color={scheduleStyles.iconColor} 
              />
              <Text style={scheduleStyles.textStyle}>Class Schedule</Text>
              {isRouteActive('/(tabs)/(classes)/schedule') && <View style={styles.activeRouteMark} />}
            </TouchableOpacity>
          );
        })()}
        
        {(() => {
          const communityStyles = getItemStyles('/(tabs)/(learning)/community');
          return (
            <TouchableOpacity 
              style={communityStyles.drawerItem} 
              onPress={() => {
                props.navigation.closeDrawer();
                handleNavigation('/(tabs)/(learning)/community');
              }}
            >
              <Ionicons 
                name={communityStyles.iconColor === colors.primary.main ? "chatbubbles" : "chatbubbles-outline"} 
                size={22} 
                color={communityStyles.iconColor} 
              />
              <Text style={communityStyles.textStyle}>Discussion Forums</Text>
              {isRouteActive('/(tabs)/(learning)/community') && <View style={styles.activeRouteMark} />}
            </TouchableOpacity>
          );
        })()}

        {/* Resources & Support */}
        <Text style={styles.drawerCategoryLabel}>Resources</Text>

        {(() => {
          const supportStyles = getItemStyles('/(tabs)/(support)');
          return (
            <TouchableOpacity 
              style={supportStyles.drawerItem} 
              onPress={() => {
                props.navigation.closeDrawer();
                handleNavigation('/(tabs)/(support)');
              }}
            >
              <Ionicons 
                name={supportStyles.iconColor === colors.primary.main ? "help-buoy" : "help-buoy-outline"} 
                size={22} 
                color={supportStyles.iconColor} 
              />
              <Text style={supportStyles.textStyle}>Help & Support</Text>
              {isRouteActive('/(tabs)/(support)') && <View style={styles.activeRouteMark} />}
            </TouchableOpacity>
          );
        })()}

        {(() => {
          const resourcesStyles = getItemStyles('/(tabs)/(learning)/resources');
          return (
            <TouchableOpacity 
              style={resourcesStyles.drawerItem} 
              onPress={() => {
                props.navigation.closeDrawer();
                handleNavigation('/(tabs)/(learning)/resources');
              }}
            >
              <Ionicons 
                name={resourcesStyles.iconColor === colors.primary.main ? "document-text" : "document-text-outline"} 
                size={22} 
                color={resourcesStyles.iconColor} 
              />
              <Text style={resourcesStyles.textStyle}>Learning Resources</Text>
              {isRouteActive('/(tabs)/(learning)/resources') && <View style={styles.activeRouteMark} />}
            </TouchableOpacity>
          );
        })()}

        {(() => {
          const feedbackStyles = getItemStyles('/feedback');
          return (
            <TouchableOpacity 
              style={feedbackStyles.drawerItem} 
              onPress={() => {
                props.navigation.closeDrawer();
                handleNavigation('/feedback');
              }}
            >
              <Ionicons 
                name={feedbackStyles.iconColor === colors.primary.main ? "chatbox-ellipses" : "chatbox-ellipses-outline"} 
                size={22} 
                color={feedbackStyles.iconColor} 
              />
              <Text style={feedbackStyles.textStyle}>Give Feedback</Text>
              {isRouteActive('/feedback') && <View style={styles.activeRouteMark} />}
            </TouchableOpacity>
          );
        })()}

        {/* Account Category */}
        <Text style={styles.drawerCategoryLabel}>Account</Text>

        {(() => {
          const profileStyles = getItemStyles('/(tabs)/(profile)');
          return (
            <TouchableOpacity 
              style={profileStyles.drawerItem} 
              onPress={() => {
                props.navigation.closeDrawer();
                handleNavigation('/(tabs)/(profile)');
              }}
            >
              <Ionicons 
                name={profileStyles.iconColor === colors.primary.main ? "person" : "person-outline"} 
                size={22} 
                color={profileStyles.iconColor} 
              />
              <Text style={profileStyles.textStyle}>My Profile</Text>
              {isRouteActive('/(tabs)/(profile)') && pathname === '/(tabs)/(profile)' && <View style={styles.activeRouteMark} />}
            </TouchableOpacity>
          );
        })()}
        
        {(() => {
          const settingsStyles = getItemStyles('/(tabs)/(profile)/settings');
          return (
            <TouchableOpacity 
              style={settingsStyles.drawerItem} 
              onPress={() => {
                props.navigation.closeDrawer();
                handleNavigation('/(tabs)/(profile)/settings');
              }}
            >
              <Ionicons 
                name={settingsStyles.iconColor === colors.primary.main ? "settings" : "settings-outline"} 
                size={22} 
                color={settingsStyles.iconColor} 
              />
              <Text style={settingsStyles.textStyle}>Settings</Text>
              {isRouteActive('/(tabs)/(profile)/settings') && <View style={styles.activeRouteMark} />}
            </TouchableOpacity>
          );
        })()}
        
        <TouchableOpacity 
          style={[styles.drawerItem, styles.logoutItem]} 
          onPress={() => {
            props.navigation.closeDrawer();
            handleLogout();
          }}
        >
          <Ionicons name="log-out-outline" size={22} color={colors.status.error} />
          <Text style={[styles.drawerItemText, styles.logoutText]}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );

  return (
    <Drawer
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: styles.drawer,
        drawerType: 'front',
        overlayColor: 'rgba(0, 0, 0, 0.7)',
        swipeEdgeWidth: 100,
        drawerStatusBarAnimation: 'slide',
      }}
    >
      <Tabs
        screenOptions={({ route }) => ({
          tabBarStyle: styles.tabBar,
          tabBarActiveTintColor: colors.primary.main,
          tabBarInactiveTintColor: colors.neutral.darkGray,
          tabBarShowLabel: true,
          headerShown: false,
          tabBarLabelStyle: styles.tabBarLabel,
          tabBarItemStyle: styles.tabBarItem,
          tabBarIcon: ({ color, size, focused }) => {
            let iconName: any = 'home-outline';
            
            // Updated route names to match our new folder structure
            switch (route.name) {
              case 'index':
                iconName = focused ? 'home' : 'home-outline';
                break;
              case '(learning)':
                iconName = focused ? 'school' : 'school-outline';
                break;
              case '(courses)':
                iconName = focused ? 'book' : 'book-outline';
                break;
              case '(quiz)':
                iconName = focused ? 'help-circle' : 'help-circle-outline';
                break;
              case '(profile)':
                iconName = focused ? 'person' : 'person-outline';
                break;
              default:
                iconName = 'home-outline';
            }
            
            return (
              <View style={styles.iconContainer}>
                <Ionicons name={iconName} size={size} color={color} />
                {focused && <View style={styles.activeIndicator} />}
              </View>
            );
          }
        })}
      >
        {/* Main tabs */}
        <Tabs.Screen name="index" options={{ title: 'Home' }} />
        <Tabs.Screen name="(learning)" options={{ title: 'Learning' }} />
        <Tabs.Screen name="(courses)" options={{ title: 'Courses' }} />
        <Tabs.Screen name="(quiz)" options={{ title: 'Quizzes' }} />
        <Tabs.Screen name="(profile)" options={{ title: 'Profile' }} />
        
        {/* Hidden screens but still accessible via navigation */}
        <Tabs.Screen name="(classes)" options={{ href: null, title: 'Classes' }} />
        <Tabs.Screen name="(support)" options={{ href: null, title: 'Support' }} />
      </Tabs>
    </Drawer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.primary.veryLightBlue,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.lightGray,
    height: 60,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 5,
  },
  tabBarItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  tabBarLabel: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.medium as any,
    marginTop: 2,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 24,
    height: 24,
    position: 'relative',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -8,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.secondary.main,
  },
  drawer: {
    flex: 1,
    width: '80%',
    backgroundColor: colors.neutral.white,
    paddingTop: 0, // Remove padding that causes status bar overlap
    elevation: 16, // For Android shadow
    shadowColor: '#000',
    shadowOffset: { width: 5, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  drawerContainer: {
    flex: 1,
    backgroundColor: colors.neutral.white,
    width: '100%',
    height: '100%',
  },
  drawerHeader: {
    alignItems: 'center',
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.lightGray,
    backgroundColor: colors.primary.veryLightBlue,
  },
  drawerLogo: {
    width: 120,
    height: 40,
  },
  drawerAppName: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.primary.main,
    marginTop: spacing.sm,
  },
  drawerUsername: {
    fontSize: typography.fontSizes.sm,
    color: colors.neutral.darkGray,
    marginTop: spacing.xs,
  },
  drawerContent: {
    flex: 1,
    paddingTop: spacing.md,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  drawerItemActive: {
    backgroundColor: colors.primary.veryLightBlue,
  },
  drawerItemText: {
    fontSize: typography.fontSizes.md,
    color: colors.neutral.darkGray,
    marginLeft: spacing.sm,
  },
  drawerItemTextActive: {
    color: colors.primary.main,
    fontWeight: typography.fontWeights.bold,
  },
  drawerCategoryLabel: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    color: colors.neutral.gray,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  drawerDivider: {
    height: 1,
    backgroundColor: colors.neutral.lightGray,
    marginVertical: spacing.md,
  },
  logoutItem: {
    marginTop: 'auto',
  },
  logoutText: {
    color: colors.status.error,
  },
  activeRouteMark: {
    position: 'absolute',
    right: 0,
    top: '50%',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.secondary.main,
    transform: [{ translateY: -2 }],
  },
});
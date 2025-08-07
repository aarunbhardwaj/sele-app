import { Ionicons } from '@expo/vector-icons';
import { Tabs, usePathname, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { DrawerLayoutAndroid, Platform, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, spacing, typography } from '../../components/ui/theme';
import appwriteService from '../../services/appwrite';
import { useAuth } from '../../services/AuthContext';

// Navigation items for our tabs and drawer
const navigationItems = [
  { label: 'Dashboard', icon: 'grid-outline', activeIcon: 'grid', route: '/(admin)/(dashboard)/index' },
  { label: 'Courses', icon: 'book-outline', activeIcon: 'book', route: '/(admin)/(courses)/index' },
  { label: 'Users', icon: 'people-outline', activeIcon: 'people', route: '/(admin)/(users)/index' },
  { label: 'Quizzes', icon: 'help-circle-outline', activeIcon: 'help-circle', route: '/(admin)/(quiz)/quiz-list' },
];

// Additional items only for drawer menu
const drawerOnlyItems = [
  { label: 'Settings', icon: 'settings-outline', route: '/(admin)/settings' },
];

export default function AdminLayout() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);
  const drawer = useRef<DrawerLayoutAndroid>(null);

  // Custom function to check admin status - using useCallback to handle dependency properly
  const checkAdminStatus = useCallback(async () => {
    setCheckingAdmin(true);
    try {
      if (!user) {
        router.replace('/auth/login');
        return;
      }
      const userInfo = await appwriteService.getUserAccount();
      const isUserAdmin = userInfo?.isAdmin === true;
      setIsAdmin(isUserAdmin);
      if (!isUserAdmin) {
        router.replace('/');
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      router.replace('/auth/login');
    } finally {
      setCheckingAdmin(false);
    }
  }, [user, router]);

  useEffect(() => {
    if (!isLoading) {
      checkAdminStatus();
    }
  }, [isLoading, checkAdminStatus]);

  const handleNavigation = (route: string) => {
    if (isNavigating) return;
    setIsNavigating(true);
    
    // Close drawer first
    if (drawer.current) {
      drawer.current.closeDrawer();
    }
    
    setTimeout(() => {
      router.push(route as any);
      setIsNavigating(false);
    }, 250);
  };

  const handleLogout = () => {
    if (isNavigating) return;
    setIsNavigating(true);
    
    if (drawer.current) {
      drawer.current.closeDrawer();
    }
    
    setTimeout(() => {
      logout();
      setIsNavigating(false);
    }, 250);
  };

  const renderDrawer = () => (
    <SafeAreaView style={styles.drawerContainer}>
      <Text style={styles.drawerTitle}>Admin Menu</Text>
      
      {navigationItems.map((item) => (
        <TouchableOpacity
          key={item.label}
          style={styles.drawerItem}
          onPress={() => handleNavigation(item.route)}
          disabled={isNavigating}
        >
          <Ionicons name={item.icon as any} size={22} color={colors.primary.main} style={styles.drawerIcon} />
          <Text style={styles.drawerLabel}>{item.label}</Text>
        </TouchableOpacity>
      ))}
      
      {drawerOnlyItems.map((item) => (
        <TouchableOpacity
          key={item.label}
          style={styles.drawerItem}
          onPress={() => handleNavigation(item.route)}
          disabled={isNavigating}
        >
          <Ionicons name={item.icon as any} size={22} color={colors.primary.main} style={styles.drawerIcon} />
          <Text style={styles.drawerLabel}>{item.label}</Text>
        </TouchableOpacity>
      ))}
      
      <TouchableOpacity
        style={[styles.drawerItem, { marginTop: 24 }]}
        onPress={handleLogout}
        disabled={isNavigating}
      >
        <Ionicons name="log-out-outline" size={22} color={colors.status.error} style={styles.drawerIcon} />
        <Text style={[styles.drawerLabel, { color: colors.status.error }]}>Logout</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );

  if (isLoading || checkingAdmin) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading admin panel...</Text>
      </View>
    );
  }

  if (!isAdmin) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Redirecting to main app...</Text>
      </View>
    );
  }

  // Using Stack instead of Tabs for the main navigation structure
  return (
    <>
      {Platform.OS === 'android' ? (
        <DrawerLayoutAndroid
          ref={drawer}
          drawerWidth={260}
          drawerPosition="left"
          renderNavigationView={renderDrawer}
          onDrawerOpen={() => {}}
          onDrawerClose={() => {}}
        >
          <AdminTabs />
        </DrawerLayoutAndroid>
      ) : (
        <AdminTabs />
      )}
    </>
  );
}

// Separate component for tabs to ensure clean implementation
function AdminTabs() {
  const pathname = usePathname();
  const router = useRouter();
  
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.primary.main,
        tabBarInactiveTintColor: colors.neutral.darkGray,
        tabBarShowLabel: true,
        // Hide all screens from tab bar by default
        tabBarItemStyle: { display: 'none' }
      }}
    >
      <Tabs.Screen 
        name="index" 
        options={{
          title: 'Dashboard',
          tabBarItemStyle: { display: 'flex' }, // Explicitly show this tab
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'grid' : 'grid-outline'} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen 
        name="(courses)" 
        options={{
          title: 'Courses',
          tabBarItemStyle: { display: 'flex' }, // Explicitly show this tab
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'book' : 'book-outline'} color={color} focused={focused} />
          ),
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            // Always go to course library when tab is pressed
            e.preventDefault();
            console.log('Courses tab pressed, navigating to course library');
            router.navigate('/(admin)/(courses)/course-library');
          }
        })}
      />
      <Tabs.Screen 
        name="(users)" 
        options={{
          title: 'Users',
          tabBarItemStyle: { display: 'flex' }, // Explicitly show this tab
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'people' : 'people-outline'} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen 
        name="(quiz)" 
        options={{
          title: 'Quizzes',
          tabBarItemStyle: { display: 'flex' }, // Explicitly show this tab
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'help-circle' : 'help-circle-outline'} color={color} focused={focused} />
          ),
        }}
      />
      {/* These screens will exist for routing but be hidden in the tab bar */}
      <Tabs.Screen name="(classes)" options={{ href: null }} />
      <Tabs.Screen name="(dashboard)" options={{ href: null }} />
      <Tabs.Screen name="(analytics)" options={{ href: null }} />
    </Tabs>
  );
}

// Helper component for tab bar icons
function TabBarIcon({ name, color, focused }: { name: any; color: string; focused: boolean }) {
  return (
    <View style={styles.iconContainer}>
      <Ionicons name={name} size={24} color={color} />
      {focused && <View style={styles.activeIndicator} />}
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: colors.neutral.background
  },
  loadingText: {
    fontSize: typography.fontSizes.lg,
    color: colors.primary.main,
    fontWeight: typography.fontWeights.medium as any
  },
  tabBar: {
    backgroundColor: colors.primary.veryLightBlue,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.lightGray,
    height: 60,
    paddingHorizontal: spacing.md,
    shadowColor: colors.neutral.black,
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 5,
  },
  tabBarItem: {
    paddingVertical: spacing.xs,
    marginHorizontal: spacing.xs,
  },
  tabBarLabel: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.medium as any,
    marginTop: 2,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 24,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -8,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.secondary.main,
  },
  drawerContainer: {
    flex: 1,
    backgroundColor: colors.neutral.white,
    paddingTop: 40,
    paddingHorizontal: 16,
  },
  drawerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 24,
    color: colors.primary.main,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.lightGray,
  },
  drawerIcon: {
    marginRight: 16,
  },
  drawerLabel: {
    fontSize: 16,
    color: colors.neutral.text,
  },
});
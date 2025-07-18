import { Ionicons } from '@expo/vector-icons';
import { Tabs, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { DrawerLayoutAndroid, Platform, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, spacing, typography } from '../../components/ui/theme';
import Footer from '../../components/ui2/Footer';
import appwriteService from '../../services/appwrite';
import { useAuth } from '../../services/AuthContext';

const adminMenuItems = [
  { label: 'Dashboard', icon: 'grid-outline', route: '/(admin)/index' },
  { label: 'Users', icon: 'people-outline', route: '/(admin)/users' },
  { label: 'Content', icon: 'book-outline', route: '/(admin)/course-library' },
  { label: 'Classes', icon: 'videocam-outline', route: '/(admin)/class-scheduler' },
  { label: 'Analytics', icon: 'bar-chart-outline', route: '/(admin)/analytics' },
  { label: 'Settings', icon: 'settings-outline', route: '/(admin)/settings' },
  { label: 'Help & Support', icon: 'help-buoy-outline', route: '/(admin)/help-support' },
];

export default function AdminLayout() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawer = useRef<DrawerLayoutAndroid>(null);

  useEffect(() => {
    if (!isLoading) {
      checkAdminStatus();
    }
  }, [user, isLoading]);

  const checkAdminStatus = async () => {
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
  };

  // Fixed: Simple drawer-first navigation without unnecessary async complexity
  const handleNavigation = (route: string) => {
    if (isNavigating) return;
    setIsNavigating(true);
    
    // Close drawer first
    if (drawer.current) {
      drawer.current.closeDrawer();
    }
    
    // Navigate after drawer close animation completes
    setTimeout(() => {
      router.push(route as any);
      setIsNavigating(false);
    }, 250);
  };

  const handleLogout = () => {
    if (isNavigating) return;
    setIsNavigating(true);
    
    // Close drawer first
    if (drawer.current) {
      drawer.current.closeDrawer();
    }
    
    // Execute logout after drawer closes
    setTimeout(() => {
      logout();
      setIsNavigating(false);
    }, 250);
  };

  const handleDrawerToggle = () => {
    if (drawer.current) {
      if (drawerOpen) {
        drawer.current.closeDrawer();
      } else {
        drawer.current.openDrawer();
      }
    }
  };

  const renderDrawer = () => (
    <SafeAreaView style={styles.drawerContainer}>
      <Text style={styles.drawerTitle}>Admin Menu</Text>
      {adminMenuItems.map((item) => (
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

  // Show loading state
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

  // Android DrawerLayout
  if (Platform.OS === 'android') {
    return (
      <DrawerLayoutAndroid
        ref={drawer}
        drawerWidth={260}
        drawerPosition="left"
        renderNavigationView={renderDrawer}
        onDrawerOpen={() => setDrawerOpen(true)}
        onDrawerClose={() => setDrawerOpen(false)}
      >
        <>
          <Tabs
            screenOptions={({ route }) => ({
              tabBarStyle: styles.tabBar,
              tabBarActiveTintColor: colors.primary.main, // Changed to match pre-auth
              tabBarInactiveTintColor: colors.neutral.darkGray, // Changed to match pre-auth
              tabBarShowLabel: true,
              headerShown: true,
              headerStyle: styles.headerStyle,
              headerTintColor: colors.neutral.white,
              headerTitleStyle: styles.headerTitle,
              headerTitle: 'Admin Panel',
              headerLeft: () => (
                <TouchableOpacity 
                  onPress={handleDrawerToggle} 
                  style={{ marginLeft: 16 }}
                  disabled={isNavigating}
                >
                  <Ionicons name="menu-outline" size={28} color={colors.neutral.white} />
                </TouchableOpacity>
              ),
              headerRight: () => (
                <TouchableOpacity
                  onPress={handleLogout}
                  style={{ marginRight: 16, padding: 8, backgroundColor: colors.status.error, borderRadius: 6 }}
                  disabled={isNavigating}
                >
                  <Ionicons name="log-out-outline" size={22} color={colors.neutral.white} />
                </TouchableOpacity>
              ),
              tabBarLabelStyle: styles.tabBarLabel,
              tabBarItemStyle: styles.tabBarItem,
              tabBarIcon: ({ color, size, focused }) => {
                let iconName: any = 'grid-outline';
                if (route.name === 'index') {
                  iconName = focused ? 'grid' : 'grid-outline';
                } else if (route.name === 'users') {
                  iconName = focused ? 'people' : 'people-outline';
                } else if (route.name === 'roles') {
                  iconName = focused ? 'key' : 'key-outline';
                } else if (route.name === 'courses') {
                  iconName = focused ? 'book' : 'book-outline';
                } else if (route.name === 'lessons') {
                  iconName = focused ? 'document-text' : 'document-text-outline';
                } else if (route.name === 'exercises') {
                  iconName = focused ? 'fitness' : 'fitness-outline';
                } else if (route.name === 'analytics') {
                  iconName = focused ? 'bar-chart' : 'bar-chart-outline';
                }
                return (
                  <View style={styles.iconContainer}>
                    <Ionicons name={iconName} size={size} color={color} />
                    {focused && <View style={styles.activeIndicator} />}
                  </View>
                );
              },
            })}
          >
            <Tabs.Screen name="index" options={{ title: 'Dashboard' }} />
            <Tabs.Screen name="users" options={{ title: 'Users' }} />
            <Tabs.Screen name="roles" options={{ title: 'Roles', tabBarItemStyle: { display: 'none' }, tabBarLabelStyle: { display: 'none' } }} />
            <Tabs.Screen name="courses" options={{ title: 'Courses' }} />
            <Tabs.Screen name="lessons" options={{ title: 'Lessons' }} />
            <Tabs.Screen name="exercises" options={{ title: 'Exercises', tabBarItemStyle: { display: 'none' }, tabBarLabelStyle: { display: 'none' } }} />
            <Tabs.Screen name="analytics" options={{ title: 'Analytics' }} />
          </Tabs>
          <Footer
            options={[
              { label: 'Dashboard', onPress: () => handleNavigation('/(admin)/index') },
              { label: 'Settings', onPress: () => handleNavigation('/(admin)/settings') },
              { label: 'Log out', onPress: handleLogout },
            ]}
          />
        </>
      </DrawerLayoutAndroid>
    );
  }

  // iOS/web fallback: just render Tabs, but you can add a modal drawer if needed
  return (
    <>
      <Tabs
        screenOptions={({ route }) => ({
          tabBarStyle: styles.tabBar,
          tabBarActiveTintColor: colors.primary.main, // Changed to match pre-auth
          tabBarInactiveTintColor: colors.neutral.darkGray, // Changed to match pre-auth
          tabBarShowLabel: true,
          headerShown: true,
          headerStyle: styles.headerStyle,
          headerTintColor: colors.neutral.white,
          headerTitleStyle: styles.headerTitle,
          headerTitle: 'Admin Panel',
          headerRight: () => (
            <TouchableOpacity
              onPress={handleLogout}
              style={{ marginRight: 16, padding: 8, backgroundColor: colors.status.error, borderRadius: 6 }}
              disabled={isNavigating}
            >
              <Ionicons name="log-out-outline" size={22} color={colors.neutral.white} />
            </TouchableOpacity>
          ),
          tabBarLabelStyle: styles.tabBarLabel,
          tabBarItemStyle: styles.tabBarItem,
          tabBarIcon: ({ color, size, focused }) => {
            let iconName: any = 'grid-outline';
            if (route.name === 'index') {
              iconName = focused ? 'grid' : 'grid-outline';
            } else if (route.name === 'users') {
              iconName = focused ? 'people' : 'people-outline';
            } else if (route.name === 'roles') {
              iconName = focused ? 'key' : 'key-outline';
            } else if (route.name === 'courses') {
              iconName = focused ? 'book' : 'book-outline';
            } else if (route.name === 'lessons') {
              iconName = focused ? 'document-text' : 'document-text-outline';
            } else if (route.name === 'exercises') {
              iconName = focused ? 'fitness' : 'fitness-outline';
            } else if (route.name === 'analytics') {
              iconName = focused ? 'bar-chart' : 'bar-chart-outline';
            }
            return (
              <View style={styles.iconContainer}>
                <Ionicons name={iconName} size={size} color={color} />
                {focused && <View style={styles.activeIndicator} />}
              </View>
            );
          },
        })}
      >
        <Tabs.Screen name="index" options={{ title: 'Dashboard' }} />
        <Tabs.Screen name="users" options={{ title: 'Users' }} />
        <Tabs.Screen name="roles" options={{ title: 'Roles', tabBarItemStyle: { display: 'none' }, tabBarLabelStyle: { display: 'none' } }} />
        <Tabs.Screen name="courses" options={{ title: 'Courses' }} />
        <Tabs.Screen name="lessons" options={{ title: 'Lessons' }} />
        <Tabs.Screen name="exercises" options={{ title: 'Exercises', tabBarItemStyle: { display: 'none' }, tabBarLabelStyle: { display: 'none' } }} />
        <Tabs.Screen name="analytics" options={{ title: 'Analytics' }} />
      </Tabs>
    </>
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
  // Updated to match pre-auth styling
  tabBar: {
    backgroundColor: colors.primary.veryLightBlue, // Changed to match pre-auth
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
  headerStyle: {
    backgroundColor: colors.primary.main,
    shadowColor: colors.neutral.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  headerTitle: {
    fontWeight: typography.fontWeights.bold as any,
    fontSize: typography.fontSizes.lg
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
    backgroundColor: colors.secondary.main, // Consistent with your existing style
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
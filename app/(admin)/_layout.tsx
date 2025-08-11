import { Ionicons } from '@expo/vector-icons';
import { Tabs, usePathname, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { DrawerLayoutAndroid, Platform, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import appwriteService from '../../services/appwrite';
import { useAuth } from '../../services/AuthContext';

// Airbnb-inspired color palette (matching the main tabs)
const airbnbColors = {
  // Primary Airbnb colors
  primary: '#FF5A5F',        // Airbnb's signature coral/red
  primaryDark: '#E8484D',    // Darker variant
  primaryLight: '#FFE8E9',   // Light coral background
  
  // Secondary colors
  secondary: '#00A699',      // Teal for accents
  secondaryLight: '#E0F7F5', // Light teal background
  
  // Neutral palette (very Airbnb-esque)
  white: '#FFFFFF',
  offWhite: '#FAFAFA',
  lightGray: '#F7F7F7',
  gray: '#EBEBEB',
  mediumGray: '#B0B0B0',
  darkGray: '#717171',
  charcoal: '#484848',
  black: '#222222',
  
  // Status colors
  success: '#00A699',
  warning: '#FC642D',
  error: '#C13515',
};

// Navigation items for our tabs and drawer
const navigationItems = [
  { label: 'Dashboard', icon: 'grid-outline', activeIcon: 'grid', route: '/(admin)/(dashboard)/index' },
  { label: 'Courses', icon: 'book-outline', activeIcon: 'book', route: '/(admin)/(courses)/index' },
  { label: 'Users', icon: 'people-outline', activeIcon: 'people', route: '/(admin)/(users)/index' },
  { label: 'Schools', icon: 'school-outline', activeIcon: 'school', route: '/(admin)/(schools)/index' },
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
          <Ionicons name={item.icon as any} size={22} color={airbnbColors.primary} style={styles.drawerIcon} />
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
          <Ionicons name={item.icon as any} size={22} color={airbnbColors.primary} style={styles.drawerIcon} />
          <Text style={styles.drawerLabel}>{item.label}</Text>
        </TouchableOpacity>
      ))}
      
      <TouchableOpacity
        style={[styles.drawerItem, { marginTop: 24 }]}
        onPress={handleLogout}
        disabled={isNavigating}
      >
        <Ionicons name="log-out-outline" size={22} color={airbnbColors.error} style={styles.drawerIcon} />
        <Text style={[styles.drawerLabel, { color: airbnbColors.error }]}>Logout</Text>
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
  const [activeTab, setActiveTab] = useState('');
  
  // Update active tab whenever pathname changes
  useEffect(() => {
    if (pathname.includes('/(admin)/index') || pathname.includes('/(admin)/(dashboard)')) {
      setActiveTab('index');
    } else if (pathname.includes('/(admin)/(courses)')) {
      setActiveTab('(courses)');
    } else if (pathname.includes('/(admin)/(users)')) {
      setActiveTab('(users)');
    } else if (pathname.includes('/(admin)/(schools)')) {
      setActiveTab('(schools)');
    } else if (pathname.includes('/(admin)/(quiz)')) {
      setActiveTab('(quiz)');
    }
  }, [pathname]);
  
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: airbnbColors.primary,
        tabBarInactiveTintColor: airbnbColors.mediumGray,
        tabBarShowLabel: true,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarItemStyle: styles.tabBarItem,
      }}
    >
      {/* Main visible tabs - these will show in the bottom tab bar */}
      <Tabs.Screen 
        name="index" 
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon 
              name={focused ? 'grid' : 'grid-outline'} 
              color={focused ? airbnbColors.primary : airbnbColors.mediumGray} 
              focused={focused} 
            />
          ),
        }}
      />
      
      <Tabs.Screen 
        name="(courses)" 
        options={{
          title: 'Courses',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon 
              name={focused ? 'book' : 'book-outline'} 
              color={focused ? airbnbColors.primary : airbnbColors.mediumGray}
              focused={focused} 
            />
          ),
        }}
      />
      
      <Tabs.Screen 
        name="(users)" 
        options={{
          title: 'Users',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon 
              name={focused ? 'people' : 'people-outline'} 
              color={focused ? airbnbColors.primary : airbnbColors.mediumGray}
              focused={focused} 
            />
          ),
        }}
      />
      
      <Tabs.Screen 
        name="(schools)" 
        options={{
          title: 'Schools',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon 
              name={focused ? 'school' : 'school-outline'} 
              color={focused ? airbnbColors.primary : airbnbColors.mediumGray}
              focused={focused} 
            />
          ),
        }}
      />
      
      <Tabs.Screen 
        name="(quiz)" 
        options={{
          title: 'Quizzes',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon 
              name={focused ? 'help-circle' : 'help-circle-outline'} 
              color={focused ? airbnbColors.primary : airbnbColors.mediumGray}
              focused={focused} 
            />
          ),
        }}
      />
      
      {/* Hidden screens - these won't appear in the tab bar but are still navigable */}
      <Tabs.Screen 
        name="(dashboard)" 
        options={{ 
          href: null // This completely hides it from the tab bar
        }} 
      />
      <Tabs.Screen 
        name="(analytics)" 
        options={{ 
          href: null // This completely hides it from the tab bar
        }} 
      />
      <Tabs.Screen 
        name="(classes)" 
        options={{ 
          href: null // This completely hides it from the tab bar
        }} 
      />
    </Tabs>
  );
}

// Helper component for tab bar icons
function TabBarIcon({ name, color, focused }: { name: any; color: string; focused: boolean }) {
  return (
    <View style={[
      styles.iconContainer,
      focused && styles.iconContainerActive
    ]}>
      <View style={[
        styles.iconWrapper,
        focused && styles.iconWrapperActive
      ]}>
        <Ionicons 
          name={name} 
          size={focused ? 24 : 22} 
          color={focused ? airbnbColors.white : color} 
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: airbnbColors.offWhite
  },
  loadingText: {
    fontSize: 18,
    color: airbnbColors.primary,
    fontWeight: '600'
  },
  tabBar: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderTopWidth: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: 85, // Increased for better spacing
    paddingHorizontal: 16, // Increased for better spacing
    paddingTop: 10,
    paddingBottom: 22, // Increased bottom padding
    position: 'absolute',
    // Enhanced shadow for better separation from background
    shadowColor: airbnbColors.black,
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 20,
    // Stronger border for definition
    borderWidth: 0.5,
    borderColor: airbnbColors.lightGray,
    borderBottomWidth: 0,
  },
  tabBarLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 6, // Increased for better spacing
    marginBottom: 0,
    letterSpacing: 0.1,
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  tabBarItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6, // Increased for better touch area
    paddingHorizontal: 4, // Increased for better spacing
    minHeight: 60, // Increased minimum height
    maxWidth: '20%', // Ensure equal distribution across 5 tabs
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 2, // Small margin for better spacing
  },
  iconContainerActive: {
    transform: [{ scale: 1.08 }], // Slightly increased for better visual feedback
  },
  iconWrapper: {
    width: 36, // Increased for better touch area
    height: 36, // Increased for better touch area
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  iconWrapperActive: {
    backgroundColor: airbnbColors.primary,
    shadowColor: airbnbColors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 6,
    borderWidth: 1,
    borderColor: airbnbColors.primaryLight,
    transform: [{ scale: 1.0 }],
  },
  drawerContainer: {
    flex: 1,
    backgroundColor: airbnbColors.white,
    paddingTop: 40,
    paddingHorizontal: 16,
  },
  drawerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 24,
    color: airbnbColors.primary,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: airbnbColors.lightGray,
  },
  drawerIcon: {
    marginRight: 16,
  },
  drawerLabel: {
    fontSize: 16,
    color: airbnbColors.charcoal,
  },
});
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

// Mock data for course categories
const categories = [
  { id: '1', name: 'All Courses', icon: 'book' },
  { id: '2', name: 'Pronunciation', icon: 'mic' },
  { id: '3', name: 'Grammar', icon: 'school' },
  { id: '4', name: 'Vocabulary', icon: 'text' },
  { id: '5', name: 'Conversation', icon: 'chatbubbles' },
  { id: '6', name: 'Business', icon: 'briefcase' },
];

// Mock data for featured courses
const featuredCourses = [
  {
    id: '1',
    title: 'Complete British English Masterclass',
    level: 'All Levels',
    rating: 4.9,
    reviews: 1243,
    students: 15420,
    price: 89.99,
    discountPrice: 49.99,
    instructor: 'Emma Thompson',
    image: require('../../assets/images/app-logo.png'),
    isBestseller: true,
  },
  {
    id: '2',
    title: 'British Accent: Pronunciation Secrets',
    level: 'Beginner',
    rating: 4.7,
    reviews: 853,
    students: 9240,
    price: 69.99,
    discountPrice: 34.99,
    instructor: 'James Wilson',
    image: require('../../assets/images/app-logo.png'),
    isBestseller: false,
  },
];

// Mock data for all courses
const allCourses = [
  {
    id: '3',
    title: 'Advanced Business English & Presentations',
    level: 'Advanced',
    rating: 4.8,
    reviews: 654,
    students: 7320,
    price: 79.99,
    discountPrice: 39.99,
    instructor: 'Robert Clark',
    image: require('../../assets/images/app-logo.png'),
    isBestseller: true,
    category: 'Business'
  },
  {
    id: '4',
    title: 'British Idioms and Expressions',
    level: 'Intermediate',
    rating: 4.6,
    reviews: 421,
    students: 5180,
    price: 59.99,
    discountPrice: 29.99,
    instructor: 'Sarah Johnson',
    image: require('../../assets/images/app-logo.png'),
    isBestseller: false,
    category: 'Vocabulary'
  },
  {
    id: '5',
    title: 'Perfect Your Grammar: British English Rules',
    level: 'All Levels',
    rating: 4.5,
    reviews: 376,
    students: 4230,
    price: 64.99,
    discountPrice: 32.99,
    instructor: 'Michael Brown',
    image: require('../../assets/images/app-logo.png'),
    isBestseller: false,
    category: 'Grammar'
  },
  {
    id: '6',
    title: 'Conversational Fluency in British English',
    level: 'Intermediate',
    rating: 4.7,
    reviews: 583,
    students: 6750,
    price: 74.99,
    discountPrice: 37.99,
    instructor: 'Emily White',
    image: require('../../assets/images/app-logo.png'),
    isBestseller: true,
    category: 'Conversation'
  },
  // More courses...
];

export default function CoursesCatalogScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('1'); // Default to 'All Courses'
  
  // Filter courses based on search query and selected category
  const filteredCourses = allCourses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (selectedCategory === '1') return matchesSearch; // All Courses
    
    const categoryName = categories.find(cat => cat.id === selectedCategory)?.name;
    return matchesSearch && course.category === categoryName;
  });

  const renderCourseCard = ({ item }) => (
    <TouchableOpacity 
      className="bg-white rounded-xl shadow-sm mb-4 overflow-hidden"
      onPress={() => router.push(`/courses/${item.id}`)}
    >
      <View className="relative">
        <Image 
          source={item.image} 
          className="w-full h-36" 
          resizeMode="cover" 
        />
        {item.isBestseller && (
          <View className="absolute top-2 left-2 bg-yellow-400 px-2 py-1 rounded">
            <Text className="text-xs font-bold text-gray-800">Bestseller</Text>
          </View>
        )}
      </View>
      <View className="p-4">
        <View className="flex-row justify-between items-center mb-1">
          <Text className="text-blue-600 font-medium">{item.level}</Text>
          <View className="flex-row items-center">
            <Ionicons name="star" size={14} color="#FBBF24" />
            <Text className="text-gray-700 ml-1 text-xs">{item.rating} ({item.reviews} reviews)</Text>
          </View>
        </View>
        
        <Text className="text-lg font-semibold mb-2">{item.title}</Text>
        
        <Text className="text-gray-600 text-xs mb-3">By {item.instructor} • {item.students} students</Text>
        
        <View className="flex-row items-center">
          <Text className="text-xl font-bold text-gray-800">£{item.discountPrice}</Text>
          <Text className="text-gray-500 line-through ml-2">£{item.price}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderCategoryButton = ({ item }) => (
    <TouchableOpacity 
      className={`flex-row items-center py-2 px-4 rounded-full mr-3 ${selectedCategory === item.id ? 'bg-blue-600' : 'bg-gray-200'}`}
      onPress={() => setSelectedCategory(item.id)}
    >
      <Ionicons 
        name={item.icon} 
        size={16} 
        color={selectedCategory === item.id ? '#FFFFFF' : '#4B5563'} 
      />
      <Text className={`ml-1 ${selectedCategory === item.id ? 'text-white' : 'text-gray-800'}`}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="pt-14 px-5 pb-8">
        {/* Header */}
        <View className="mb-6">
          <Text className="text-2xl font-bold">Courses Catalog</Text>
          <Text className="text-gray-600 mt-1">
            Explore our wide range of British English courses
          </Text>
        </View>

        {/* Search Bar */}
        <View className="flex-row items-center bg-white rounded-lg px-4 py-2.5 mb-6 border border-gray-200">
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            className="flex-1 ml-2 text-base text-gray-800"
            placeholder="Search courses, instructors, etc."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        {/* Categories */}
        <View className="mb-6">
          <Text className="text-lg font-semibold mb-3">Categories</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
          >
            {categories.map(item => (
              <TouchableOpacity 
                key={item.id}
                className={`flex-row items-center py-2 px-4 rounded-full mr-3 ${selectedCategory === item.id ? 'bg-blue-600' : 'bg-gray-200'}`}
                onPress={() => setSelectedCategory(item.id)}
              >
                <Ionicons 
                  name={item.icon} 
                  size={16} 
                  color={selectedCategory === item.id ? '#FFFFFF' : '#4B5563'} 
                />
                <Text className={`ml-1 ${selectedCategory === item.id ? 'text-white' : 'text-gray-800'}`}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Featured Courses */}
        {selectedCategory === '1' && searchQuery === '' && (
          <View className="mb-8">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-semibold">Featured Courses</Text>
              <TouchableOpacity>
                <Text className="text-blue-600">See All</Text>
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={featuredCourses}
              renderItem={renderCourseCard}
              keyExtractor={item => item.id}
              scrollEnabled={false}
            />
          </View>
        )}

        {/* All Courses or Filtered Courses */}
        <View>
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-semibold">
              {selectedCategory === '1' && searchQuery === '' ? 'Popular Courses' : 'Courses'}
            </Text>
            {selectedCategory === '1' && searchQuery === '' && (
              <TouchableOpacity>
                <Text className="text-blue-600">See All</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {filteredCourses.length > 0 ? (
            <FlatList
              data={filteredCourses}
              renderItem={renderCourseCard}
              keyExtractor={item => item.id}
              scrollEnabled={false}
            />
          ) : (
            <View className="items-center justify-center py-10">
              <Ionicons name="search" size={64} color="#D1D5DB" />
              <Text className="text-gray-400 text-center mt-3">
                No courses found matching your criteria.
              </Text>
              <TouchableOpacity 
                className="mt-4 bg-blue-600 py-2.5 px-5 rounded-lg"
                onPress={() => {
                  setSearchQuery('');
                  setSelectedCategory('1');
                }}
              >
                <Text className="text-white">View All Courses</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}
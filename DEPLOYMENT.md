# Production Deployment Guide

## Prerequisites

1. **EAS CLI Installation**
   ```bash
   npm install -g @expo/eas-cli
   ```

2. **Expo Account**
   - Create account at [expo.dev](https://expo.dev)
   - Login: `eas login`

3. **App Store Accounts**
   - Google Play Console ($25 one-time fee)
   - Apple Developer Program ($99/year)

## Environment Setup

1. **Copy production environment**
   ```bash
   cp .env.production .env
   ```

2. **Update environment variables**
   - Replace all placeholder values with your production Appwrite configuration
   - Ensure all collection IDs match your production database

## Build Process

### Android Build (Google Play Store)

1. **Configure EAS Project**
   ```bash
   eas build:configure
   ```

2. **Production Build**
   ```bash
   npm run build:android
   ```

3. **Submit to Play Store**
   ```bash
   npm run submit:android
   ```

### iOS Build (App Store)

1. **Production Build**
   ```bash
   npm run build:ios
   ```

2. **Submit to App Store**
   ```bash
   npm run submit:ios
   ```

## Store Listing Requirements

### Google Play Store

**Required Assets:**
- App Icon: 512x512 PNG
- Feature Graphic: 1024x500 PNG
- Screenshots: At least 2 phone screenshots
- Privacy Policy URL
- App Description (max 4000 characters)

**Store Listing Information:**
```
Title: Language Learning Hub
Short Description: Comprehensive language learning platform with instructor management
Description: 
A powerful language learning platform that connects students with instructors. Features include:
• Interactive lessons and quizzes
• Instructor dashboard with class management
• Student progress tracking and ratings
• Multi-school support with assignment management
• Real-time calendar and scheduling
• Comprehensive admin panel

Perfect for language schools, private tutors, and educational institutions.
```

### App Store (iOS)

**Required Assets:**
- App Icon: 1024x1024 PNG
- Screenshots: iPhone and iPad
- App Preview (optional video)
- Privacy Policy URL
- App Description (max 4000 characters)

## Pre-Launch Checklist

### Technical
- [ ] All environment variables configured
- [ ] Production Appwrite instance set up
- [ ] App builds successfully
- [ ] All features tested on physical devices
- [ ] Performance optimized
- [ ] Memory leaks checked
- [ ] Offline functionality tested (if applicable)

### Legal & Compliance
- [ ] Privacy Policy created
- [ ] Terms of Service created
- [ ] Data collection practices documented
- [ ] COPPA compliance (if applicable)
- [ ] GDPR compliance (if applicable)

### Store Requirements
- [ ] App icons created (all sizes)
- [ ] Screenshots taken (all required sizes)
- [ ] Feature graphics created
- [ ] Store descriptions written
- [ ] Keywords researched
- [ ] Content rating completed

## Post-Launch

### Monitoring
- Set up crash reporting with Expo
- Monitor user feedback and ratings
- Track key metrics and analytics

### Updates
- Use EAS Update for over-the-air updates
- Follow semantic versioning for releases
- Test updates thoroughly before deployment

## Troubleshooting

### Common Build Issues
1. **Missing environment variables**: Ensure all required env vars are set
2. **Asset optimization**: Compress images and optimize bundle size
3. **Permission issues**: Verify all required permissions are declared

### Store Rejection Reasons
1. **Incomplete metadata**: Ensure all required fields are filled
2. **Missing privacy policy**: Required for apps that collect data
3. **Inappropriate content**: Ensure content follows store guidelines
# MediScan - AI-Powered Medicine Recognition App

A beautiful React Native app that uses AI to recognize medicines from handwritten prescriptions and helps users manage their medication schedules with smart reminders.

## Features

### 🔍 Smart Medicine Recognition
- **Camera Scanning**: Take photos of prescriptions for instant medicine recognition
- **Gallery Upload**: Select existing prescription images from your gallery
- **AI Analysis**: Advanced OCR and AI to read handwritten prescriptions
- **Manual Entry**: Add medicines manually when needed

### 💊 Medicine Management
- **Medicine Collection**: Organize all your medicines in one place
- **Dosage Tracking**: Track dosage, frequency, and timing
- **Progress Monitoring**: Visual progress bars for daily medicine intake
- **Categories**: Organize by prescription, OTC, supplements, and vitamins

### ⏰ Smart Reminders
- **Custom Alarms**: Set personalized medication reminders
- **Multiple Times**: Support for multiple daily doses
- **Notification System**: Push notifications for medicine times
- **Snooze Options**: Flexible reminder management

### 📊 History & Analytics
- **Complete History**: Track all medicine-related activities
- **Scan History**: View all previous prescription scans
- **Adherence Analytics**: Monitor medication compliance
- **Export Data**: Export your medicine data for backup

### 👤 User Profile
- **Personal Dashboard**: View medicine statistics and streaks
- **Settings Management**: Customize app behavior and notifications
- **Data Backup**: Cloud sync and local data management
- **Privacy Controls**: Manage your data and privacy settings

## Tech Stack

- **React Native** with Expo
- **TypeScript** for type safety
- **Expo Router** for navigation
- **Expo Camera** for prescription scanning
- **Expo Notifications** for medicine reminders
- **AsyncStorage** for local data persistence
- **Linear Gradient** for beautiful UI
- **Reanimated** for smooth animations
- **Lottie** for advanced animations

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd DoctorHandwritting/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install Expo CLI** (if not already installed)
   ```bash
   npm install -g @expo/cli
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Run on device/simulator**
   - For iOS: `npm run ios`
   - For Android: `npm run android`
   - For Web: `npm run web`

## Project Structure

```
frontend/
├── app/                    # App screens and navigation
│   ├── (tabs)/            # Tab navigation screens
│   │   ├── index.tsx      # Home/Dashboard
│   │   ├── scan.tsx       # Medicine scanning
│   │   ├── medicines.tsx  # Medicine management
│   │   ├── history.tsx    # History and analytics
│   │   └── profile.tsx    # User profile
│   ├── auth/              # Authentication screens
│   │   ├── signin.tsx     # Sign in page
│   │   └── register.tsx   # Registration page
│   └── _layout.tsx        # Root layout
├── components/            # Reusable components
│   ├── ui/               # UI components
│   ├── notification-service.tsx
│   └── splash-screen.tsx
├── services/             # Business logic services
│   └── medicine-service.tsx
├── constants/            # App constants
│   └── theme.ts
├── hooks/               # Custom hooks
└── assets/              # Images and static assets
```

## Key Features Implementation

### Authentication System
- Beautiful animated sign-in and registration pages
- AsyncStorage for session management
- Conditional routing based on authentication status

### Medicine Scanning
- Camera integration with Expo Camera
- Image picker for gallery selection
- Mock AI analysis (ready for real AI integration)
- Results processing and medicine extraction

### Notification System
- Comprehensive notification service
- Multiple reminder patterns (daily, weekly, custom)
- Notification templates for common schedules
- Permission handling and scheduling

### Data Management
- Complete medicine CRUD operations
- History tracking for all actions
- Scan result storage and processing
- Statistics and analytics calculation
- Data export/import functionality

### Beautiful UI/UX
- Gradient backgrounds and modern design
- Smooth animations with Reanimated and Lottie
- Responsive layout for different screen sizes
- Consistent color scheme and typography
- Loading states and empty states

## Customization

### Adding New Medicine Categories
Edit the `Medicine` interface in `services/medicine-service.tsx`:
```typescript
category: 'prescription' | 'otc' | 'supplement' | 'vitamin' | 'your-new-category';
```

### Customizing Notification Templates
Add new templates in `components/notification-service.tsx`:
```typescript
export const reminderTemplates = {
  // Add your custom template
  customSchedule: (medicineName: string, dosage: string) =>
    createDailyReminders(medicineName, dosage, ['your', 'custom', 'times']),
};
```

### Theming
Update colors and styles in `constants/theme.ts` and component stylesheets.

## AI Integration

The app is designed to easily integrate with real AI services:

1. **OCR Integration**: Replace mock analysis in `scan.tsx` with real OCR API calls
2. **Medicine Recognition**: Integrate with medicine databases and recognition APIs
3. **Dosage Extraction**: Add NLP for extracting dosage and timing information
4. **Confidence Scoring**: Implement confidence levels for recognition accuracy

## Deployment

### Building for Production

1. **Configure app.json** with your app details
2. **Build for iOS**:
   ```bash
   expo build:ios
   ```
3. **Build for Android**:
   ```bash
   expo build:android
   ```

### App Store Submission
- Follow Expo's guide for app store submission
- Ensure all required permissions are properly configured
- Test thoroughly on physical devices

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**MediScan** - Making medication management simple and smart! 💊✨
# MediScan - AI-Powered Handwritten Prescription Recognition

A comprehensive solution that combines AI-powered handwritten text recognition with a beautiful React Native mobile app for medicine management and smart reminders.

## 🎯 Project Overview

This project consists of two main components:
1. **AI Backend** - Handwritten text recognition using deep learning
2. **Mobile App** - React Native app for medicine management with smart features

## 🏗️ Project Structure

```
DoctorHandwritting/
├── backend/                 # AI/ML Backend (Python)
│   ├── models/             # Trained models
│   ├── src/               # Source code
│   └── requirements.txt   # Python dependencies
├── frontend/              # React Native Mobile App
│   ├── app/              # App screens and navigation
│   ├── components/       # Reusable components
│   ├── services/         # Business logic
│   └── package.json      # Node.js dependencies
└── README.md             # This file
```

## 📱 Mobile App Features

### 🔍 Smart Medicine Recognition
- **Camera Scanning**: Take photos of prescriptions for instant recognition
- **Gallery Upload**: Select existing prescription images
- **AI Analysis**: Advanced OCR for handwritten prescriptions
- **Manual Entry**: Add medicines manually when needed

### 💊 Medicine Management
- **Complete Collection**: Organize all medicines in one place
- **Dosage Tracking**: Track dosage, frequency, and timing
- **Progress Monitoring**: Visual progress bars for daily intake
- **Categories**: Prescription, OTC, supplements, vitamins

### ⏰ Smart Reminders & Notifications
- **Custom Alarms**: Personalized medication reminders
- **Multiple Daily Doses**: Support for complex schedules
- **Push Notifications**: Timely medicine alerts
- **Missed Dose Detection**: Automatic tracking of missed medicines
- **Notification Banners**: Beautiful in-app notifications

### 📊 Analytics & History
- **Complete History**: Track all medicine-related activities
- **Adherence Analytics**: Monitor medication compliance
- **Scan Results**: View all previous prescription scans
- **Export Data**: Backup and export functionality

### 👤 User Management
- **Authentication**: Secure sign-in and registration
- **Personal Dashboard**: Statistics and achievement tracking
- **Settings**: Comprehensive app customization
- **Data Management**: Cloud sync and local storage

## 🚀 Getting Started

### Prerequisites
- **For Backend**: Python 3.8+, pip
- **For Mobile App**: Node.js 16+, npm/yarn, Expo CLI
- **For Development**: Git, VS Code (recommended)

### Backend Setup (AI/ML)

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the backend**
   ```bash
   python app.py
   ```

### Mobile App Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on device/simulator**
   ```bash
   # For iOS
   npm run ios
   
   # For Android
   npm run android
   
   # For Web
   npm run web
   ```

## 🛠️ Technology Stack

### Backend (AI/ML)
- **Python** - Core programming language
- **TensorFlow/PyTorch** - Deep learning frameworks
- **OpenCV** - Computer vision processing
- **Flask/FastAPI** - Web framework for API
- **NumPy/Pandas** - Data processing

### Mobile App
- **React Native** with Expo - Cross-platform mobile development
- **TypeScript** - Type-safe JavaScript
- **Expo Router** - File-based navigation
- **Expo Camera** - Camera integration
- **Expo Notifications** - Push notifications
- **AsyncStorage** - Local data persistence
- **Reanimated** - Smooth animations

### Development Tools
- **Git** - Version control
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Metro** - React Native bundler

## 📋 API Integration

The mobile app is designed to integrate with the AI backend:

```typescript
// Example API integration
const analyzeImage = async (imageUri: string) => {
  const formData = new FormData();
  formData.append('image', {
    uri: imageUri,
    type: 'image/jpeg',
    name: 'prescription.jpg',
  } as any);

  const response = await fetch('YOUR_BACKEND_URL/analyze', {
    method: 'POST',
    body: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return await response.json();
};
```

## 🔧 Configuration

### Environment Variables

Create `.env` files in respective directories:

**Backend (.env)**
```
MODEL_PATH=./models/
API_PORT=5000
DEBUG=True
```

**Frontend (.env)**
```
EXPO_PUBLIC_API_URL=http://localhost:5000
EXPO_PUBLIC_APP_NAME=MediScan
```

## 📱 App Screenshots & Features

### Authentication & Onboarding
- Beautiful animated sign-in/register pages
- Gradient backgrounds with smooth transitions
- Form validation and error handling

### Medicine Scanning
- Real-time camera preview
- Image selection from gallery
- AI analysis with progress indicators
- Results display with medicine details

### Medicine Management
- Visual medicine collection
- Progress tracking for daily doses
- Search and filter functionality
- Detailed medicine information

### Smart Notifications
- Push notifications for medicine times
- In-app notification banners
- Missed dose alerts
- Custom reminder schedules

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add some amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **TensorFlow/PyTorch** communities for ML frameworks
- **Expo team** for excellent React Native tooling
- **React Native community** for comprehensive ecosystem
- **Open source contributors** for various libraries used

## 📞 Support

For support and questions:
- **Create an issue** in this repository
- **Email**: [your-email@example.com]
- **Documentation**: Check the `/docs` folder for detailed guides

## 🔮 Future Enhancements

- [ ] Real-time OCR improvements
- [ ] Multi-language support
- [ ] Doctor consultation integration
- [ ] Pharmacy integration
- [ ] Health analytics dashboard
- [ ] Family medicine sharing
- [ ] Voice reminders
- [ ] Apple Health/Google Fit integration

---

**MediScan** - Making medication management intelligent and accessible! 💊✨

### Quick Start Commands

```bash
# Clone the repository
git clone https://github.com/PardeshiAkhilesh/HandWritten_Image_To_Text.git
cd HandWritten_Image_To_Text

# Setup backend
cd backend && python -m venv venv && source venv/bin/activate && pip install -r requirements.txt

# Setup frontend
cd ../frontend && npm install && npm start
```
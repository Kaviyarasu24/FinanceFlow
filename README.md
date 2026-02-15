# FinanceFlow - Personal Finance Management App

A beautiful, modern React Native mobile application for managing personal finances built with Expo.

## 🎨 Features

### Authentication
- ✅ **Sign In Screen** - Email/password login with remember me
- ✅ **Sign Up Screen** - Create account with full name, email, and password
- ✅ **Social Login** - Google and Apple sign-in options
- ✅ **Password Visibility Toggle** - Show/hide password functionality

### Home Dashboard
- ✅ **Spending Overview** - Total spent, remaining budget, and upcoming bills
- ✅ **Weekly Chart** - Bar chart showing daily spending
- ✅ **Monthly Trend** - Line chart for spending trends
- ✅ **Category Breakdown** - Spending by category (Shopping, Food & Dining, Transportation)

### Navigation
- ✅ **Bottom Tab Navigation** with 5 tabs:
  - Home
  - Transactions
  - Add (Center FAB button)
  - Analytics
  - Profile

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Run on specific platform:
```bash
npm run web      # Web browser
npm run android  # Android emulator/device
npm run ios      # iOS simulator/device
```

## 📁 Project Structure

```
financeflow/
├── app/
│   ├── (home)/              # Main app screens (after login)
│   │   ├── _layout.tsx      # Tab navigation
│   │   ├── index.tsx        # Home dashboard
│   │   ├── transactions.tsx # Transactions list
│   │   ├── add.tsx          # Add transaction
│   │   ├── analytics.tsx    # Analytics & reports
│   │   └── profile.tsx      # User profile
│   ├── _layout.tsx          # Root layout
│   ├── index.tsx            # App entry (redirects to sign-in)
│   ├── sign-in.tsx          # Sign in screen
│   └── sign-up.tsx          # Sign up screen
├── constants/
│   └── Colors.ts            # Color scheme
└── package.json
```

## 🎨 Design System

### Colors
- **Primary**: `#4ECDC4` (Teal)
- **Primary Dark**: `#3DB8B0`
- **Background**: `#F9FAFB`
- **Text Primary**: `#1A1A1A`
- **Text Secondary**: `#6B7280`

### Typography
- **Headers**: 24-28px, Bold (700)
- **Body**: 14-16px, Regular/SemiBold
- **Labels**: 11-14px, Medium (500-600)

### Components
- **Input Height**: 56px
- **Button Height**: 56px
- **Border Radius**: 12-16px (cards), 20-30px (modals)
- **Spacing**: 12-24px between elements

## 📱 Mobile Responsive

All screens are fully responsive and optimized for:
- Small phones (iPhone SE, etc.)
- Standard phones (iPhone 14, Samsung Galaxy, etc.)
- Large phones (iPhone Pro Max, etc.)
- Tablets and web browsers

Features:
- KeyboardAvoidingView for input handling
- ScrollView for content overflow
- Flexible layouts with Flexbox
- Touch-friendly button sizes (56px minimum)

## 🔄 Navigation Flow

```
Index (/) → Sign In → Home Dashboard
              ↓
           Sign Up → Home Dashboard
```

After signing in, users access the main app with bottom tab navigation.

## 🛠️ Technologies

- **React Native** - Mobile framework
- **Expo** - Development platform
- **Expo Router** - File-based routing
- **TypeScript** - Type safety
- **React Navigation** - Navigation library
- **Ionicons** - Icon library

## 📝 TODO

- [ ] Implement actual authentication logic
- [ ] Add backend API integration
- [ ] Complete Transactions screen
- [ ] Complete Add Transaction screen
- [ ] Complete Analytics screen
- [ ] Complete Profile screen
- [ ] Add data persistence (AsyncStorage/SQLite)
- [ ] Add charts library (react-native-chart-kit or Victory Native)
- [ ] Add form validation
- [ ] Add loading states
- [ ] Add error handling
- [ ] Add animations and transitions

## 📄 License

This project is for educational purposes.

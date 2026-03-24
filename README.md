# FinanceFlow

FinanceFlow is a personal finance mobile app built with Expo, React Native, TypeScript, and Supabase.

It supports authentication, transaction tracking, analytics, profile and settings management, and custom categories.

## Current Features

### Authentication
- Email and password sign in
- Email and password sign up
- Forgot password flow

### Transactions
- Create and edit transaction entries
- Income and expense transaction types
- Category selection by type
- Date and notes support
- Input validation for amount and required fields

### Transactions List
- Full list loading in one fetch
- Search by category name and notes
- Filters:
  - Type: All, Income, Expense
  - Date: All Time, Today, 7 Days, This Month
  - Category chips with type-aware filtering
- Edit on tap and delete on long press

### Analytics
- Income and expense summaries
- Spending by category donut chart
- Income vs Expense bar chart
- Savings rate panel
- Chart rendering adjusted for mobile overflow safety

### Categories
- Custom category creation and deletion
- Ionicons-only icon picker with expanded icon set
- Multi-row matrix picker for icons and colors
- Automatic fallback to default icon when invalid icon values exist
- Immediate category refresh on Add Transaction and Transactions pages when returning from category management

### Profile and Settings
- Profile details and edit flow
- Personal info update and password change
- App settings (currency and notifications)
- Privacy and Help pages
- Compact and consistent spacing across Home, Transactions, Add, Analytics, and Profile-related screens

### Theme
- Light mode only
- Dark mode toggle removed

## Tech Stack

- Expo
- React Native
- Expo Router
- TypeScript
- Supabase (Auth + Postgres)
- Ionicons

## Environment Variables

Create a .env file in the project root with:

EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_KEY=your_supabase_publishable_or_anon_key

## Getting Started

1. Install dependencies

npm install

2. Start development server

npm start

3. Platform-specific scripts

npm run android
npm run ios
npm run web

## Expo Tunnel Note

If tunnel mode fails with a ngrok error such as failed to start tunnel, use LAN mode:

npx expo start --lan --clear

You can also check ngrok status here:

https://status.ngrok.com/

## Project Structure (High Level)

app/
- _layout.tsx
- sign-in.tsx
- sign-up.tsx
- forgot-password.tsx
- (home)/
  - index.tsx
  - transactions.tsx
  - add.tsx
  - analytics.tsx
  - profile.tsx
  - personal-info.tsx
  - app-settings.tsx
  - custom-categories.tsx
  - privacy-security.tsx
  - help-center.tsx

hooks/
- useTransactions.ts
- useCategories.ts
- useSettings.ts
- useCurrency.ts

contexts/
- AuthContext.tsx
- ThemeContext.tsx

lib/
- supabase.ts
- database.types.ts

## Notes

- This app currently assumes light mode across screens.
- Supabase table typings are defined in lib/database.types.ts.

import { Redirect } from 'expo-router';

export default function Index() {
    // Redirect to sign-in by default
    return <Redirect href="/sign-in" />;
}

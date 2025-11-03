import { Redirect } from 'expo-router';
import { useAuth } from './_layout';

export default function Index() {
  const { user } = useAuth();
  return <Redirect href={user ? '/home' : '/login'} />;
}
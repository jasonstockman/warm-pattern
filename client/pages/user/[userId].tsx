import { useRouter } from 'next/router';
import UserPage from '../../src/components/UserPage';

export default function UserProfilePage() {
  const router = useRouter();
  const { userId } = router.query;

  // Only render UserPage when userId is available (after hydration)
  if (!userId) return <div>Loading...</div>;

  return <UserPage />;
} 
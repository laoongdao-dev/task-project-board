import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="w-full h-screen flex items-center justify-center gap-4">
      <Link href="/auth/sign-in">
        <Button  className="bg-blue-500 text-white">Login</Button>
      </Link>
      <Link href="/auth/sign-up">
        <Button  variant="outline" className="bg-blue-500 text-white">Sign Up</Button>
      </Link>
    </div>
  );
}

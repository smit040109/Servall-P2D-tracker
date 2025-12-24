import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import Logo from '@/components/logo';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 dark:bg-black p-4">
      <div className="absolute top-8 left-8">
        <Logo />
      </div>
      <Card className="w-full max-w-sm shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Welcome Back</CardTitle>
          <CardDescription>Enter your credentials to access your dashboard.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="admin@servall.com" defaultValue="admin@servall.com" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" defaultValue="password" required />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Link href="/admin" className="w-full">
            <Button className="w-full">Login as Admin</Button>
          </Link>
          <Link href="/branch" className="w-full">
            <Button variant="secondary" className="w-full">
              Login as Branch User
            </Button>
          </Link>
        </CardFooter>
      </Card>
      <div className="mt-6 text-center text-sm">
        <Link href="/pricing" className="text-muted-foreground hover:text-primary underline">
            View Pricing Plans
        </Link>
      </div>
    </div>
  );
}

import Link from "next/link";
import { House, MagnifyingGlass, SignIn } from "@phosphor-icons/react";
import { SiteLogo } from "@/components/shared/site-logo";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-surface via-background to-orange-50 flex items-center justify-center p-6">
      <div className="w-full max-w-lg text-center">
        <div className="flex justify-center mb-6">
          <SiteLogo variant="login" href="/" />
        </div>
        <p className="text-7xl font-black text-primary/20 leading-none">404</p>
        <h1 className="mt-2 text-2xl sm:text-3xl font-bold text-foreground">
          Page Not Found
        </h1>
        <p className="mt-3 text-muted leading-relaxed">
          The page you are looking for does not exist or may have been moved.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild size="lg" className="gap-2">
            <Link href="/">
              <House size={18} weight="duotone" />
              Back to Home
            </Link>
          </Button>
          <Button asChild variant="secondary" size="lg" className="gap-2">
            <Link href="/programs">
              <MagnifyingGlass size={18} weight="duotone" />
              Browse Programs
            </Link>
          </Button>
          <Button asChild variant="secondary" size="lg" className="gap-2">
            <Link href="/login">
              <SignIn size={18} weight="duotone" />
              Portal Login
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

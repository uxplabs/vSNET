import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Icon } from './Icon';

const PADDING = 24;
const GAP = 16;
const CORNER_RADIUS = 8;
const LOGO_HEIGHT = 48;
const AUTH_CREDENTIALS = [
  { username: 'udoe@acme.com', password: '2PVWyHwYA6fv-7dKZ' },
  { username: 'acooper@acme.com', password: '*Jh@s_*CdHbFrUNoxY9s' },
];

export interface LoginPageProps {
  onLogin?: (username: string, password: string) => void | Promise<void>;
  onLoginWithSSO?: () => void | Promise<void>;
  appName?: string;
}

function LoginPage({ onLogin, onLoginWithSSO, appName = 'AMS' }: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) return;
    setLoading(true);
    setError(null);
    try {
      const normalizedUsername = username.trim().toLowerCase();
      const isValid = AUTH_CREDENTIALS.some(
        (cred) => normalizedUsername === cred.username && password === cred.password
      );
      if (!isValid) {
        setError('Invalid username or password.');
        return;
      }
      await onLogin?.(username.trim(), password);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-backdrop min-h-screen flex flex-col items-center justify-center p-4">
      <Dialog defaultOpen>
        <DialogContent
          overlayClassName="!bg-transparent"
          className="border-border bg-card [&>button]:hidden !w-[360px] !min-w-[360px] !max-w-[360px]"
          style={{
            borderRadius: CORNER_RADIUS,
            padding: PADDING,
            gap: GAP,
          }}
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader className="space-y-6 text-center sm:text-center">
            <div className="flex justify-center">
              <img
                src="/airspan_logo.svg"
                alt="Airspan"
                className="object-contain dark:brightness-0 dark:invert"
                style={{ height: LOGO_HEIGHT }}
              />
            </div>
            <div className="space-y-1">
              <DialogTitle className="text-4xl font-black tracking-tight text-primary dark:text-primary-foreground">
                {appName}
              </DialogTitle>
              <p className="text-sm text-muted-foreground">Airspan Management System</p>
            </div>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-8">
            <div className="space-y-2">
              <Label htmlFor="login-username" className="text-card-foreground">
                Username
              </Label>
              <Input
                id="login-username"
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                className="border-input bg-background"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="login-password" className="text-card-foreground">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="border-input bg-background pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded p-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <Icon name="visibility_off" size={16} />
                  ) : (
                    <Icon name="visibility" size={16} />
                  )}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:opacity-90 rounded-md"
              disabled={loading}
            >
              {loading ? 'Signing in…' : 'Log in'}
            </Button>
            <div className="text-center text-xs uppercase tracking-widest text-muted-foreground">
              or
            </div>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled
            >
              Sign in with SSO
            </Button>
            {error && (
              <p className="text-center text-sm text-destructive">{error}</p>
            )}
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default LoginPage;

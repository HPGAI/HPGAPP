'use client'

import { createClient } from '@/lib/supabase/client'

export default function LoginForm() {
  const supabase = createClient()

  const handleSocialLogin = async (provider: 'google') => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/oauth`,
      },
    })
  }

  return (
    <button
      onClick={() => handleSocialLogin('google')}
      className="w-full flex h-14 items-center justify-center gap-3 rounded-md bg-gradient-to-br from-amber-400 to-orange-500 text-base font-medium text-white shadow-lg hover:from-amber-500 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 transition-all duration-200 transform hover:scale-[1.02]"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="24"
        height="24"
        className="h-6 w-6"
        fill="#fff"
      >
        <path
          d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z"
        />
      </svg>
      Sign in with Google
    </button>
  )
} 
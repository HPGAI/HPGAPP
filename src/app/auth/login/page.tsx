import LoginForm from '@/components/login-form'
import ServerLogo from '../../../components/server-logo'

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-grid-gray-200/50 [mask-image:linear-gradient(to_bottom,white,transparent,white)] pointer-events-none" 
           style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'30\' height=\'30\' viewBox=\'0 0 30 30\' fill=\'none\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M1.22676 0C1.91374 0 2.45351 0.539773 2.45351 1.22676C2.45351 1.91374 1.91374 2.45351 1.22676 2.45351C0.539773 2.45351 0 1.91374 0 1.22676C0 0.539773 0.539773 0 1.22676 0Z\' fill=\'rgba(200,200,200,0.15)\'/%3E%3C/svg%3E")' }}
      />
      
      <div className="relative w-full max-w-md space-y-10">
        <div className="flex flex-col items-center space-y-8">
          <div className="flex justify-center">
            <ServerLogo size="lg" className="mb-2 drop-shadow-md" />
          </div>
          
          <div className="text-center space-y-3">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">Welcome to HPG App</h1>
            <p className="text-gray-600 md:text-lg">
              Sign in to access your account and personalized features.
            </p>
          </div>
        </div>
        
        <div className="mt-10 w-full px-4">
          <LoginForm />
        </div>
      </div>
    </div>
  )
} 
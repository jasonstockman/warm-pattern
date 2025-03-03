import { Button } from '../src/components/ui'
import Link from 'next/link'

export default function SignupSuccess() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <div className="rounded-lg bg-white p-8 shadow-md">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-100">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          
          <h2 className="mb-2 text-center text-3xl font-bold">Sign Up Successful!</h2>
          
          <p className="mb-6 text-center text-gray-600">
            Your account has been created successfully. Please check your email to verify your account.
          </p>
          
          <div className="flex justify-center">
            <Link href="/login" legacyBehavior>
              <a>
                <Button variant="primary" size="md">
                  Go to Login
                </Button>
              </a>
            </Link>
          </div>
          
          <div className="mt-6 text-center text-sm text-gray-500">
            Didn't receive an email?{' '}
            <Link 
              href="/resend-verification" 
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Resend verification email
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 
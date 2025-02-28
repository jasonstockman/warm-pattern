import Link from 'next/link'

export default function SignupSuccess() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <div className="rounded-lg bg-white p-8 text-center shadow-md">
          <svg
            className="mx-auto h-16 w-16 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          
          <h2 className="mt-4 text-3xl font-bold">Registration Successful!</h2>
          
          <p className="mt-4 text-gray-600">
            Please check your email for a confirmation link to complete your signup.
          </p>
          
          <div className="mt-8">
            <Link
              href="/login"
              className="inline-block rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 
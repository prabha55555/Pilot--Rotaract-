import React from 'react'

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center text-brand">Reset Password</h1>
        <p className="text-gray-600 text-center mb-4">
          Check your email for a password reset link and follow the instructions.
        </p>
        <p className="text-sm text-gray-500 text-center">
          This page will be updated with the reset form based on the token from your email.
        </p>
      </div>
    </div>
  )
}

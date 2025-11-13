'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  CardElement,
  Elements,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

// Initialize Stripe with your publishable key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface PaymentFormProps {
  amount: number;
  bookingId: number;
  patientId: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

const CheckoutForm = ({ amount, bookingId, patientId, onSuccess, onError }: PaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const getErrorMessage = (error: unknown): string => {
    if (typeof error === 'string') return error;

    // Handle Stripe error types
    const err = error as { type?: string; message?: string };
    switch (err?.type) {
      case 'card_error':
      case 'validation_error':
        return err.message || 'Invalid payment details.';
      case 'invalid_request_error':
        return 'Invalid payment details provided.';
      case 'authentication_error':
        return 'Authentication with payment provider failed.';
      case 'api_error':
        return 'Payment service temporarily unavailable. Please try again.';
      case 'rate_limit_error':
        return 'Too many payment attempts. Please wait a moment and try again.';
      case 'idempotency_error':
        return 'A duplicate payment was detected. Please check your payment status.';
      default:
        if (err.message) return err.message;
        return 'An unexpected error occurred during payment. Please try again.';
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      setErrorMessage('Payment system is not ready. Please try again.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');

    try {
      // Create payment intent
      const response = await fetch('/api/Payment/createpaymentintent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount * 100, // Convert to cents
          bookingId: bookingId,
          patientId: patientId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      const data = await response.json();

      // Confirm the payment
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      const { error, paymentIntent } = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (paymentIntent.status === 'succeeded') {
        onSuccess?.();
      }
    } catch (error: unknown) {
      const errorMsg = getErrorMessage(error);
      setErrorMessage(errorMsg);
      onError?.(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full mx-auto">
      <div className="mb-4 sm:mb-6">
        <div className="relative bg-white p-4 sm:p-6 lg:p-8 rounded-xl border-2 border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
          {/* Card Icon */}
          <div className="absolute -top-3 left-3 sm:-top-4 sm:left-4 bg-gradient-to-r from-teal-500 to-cyan-500 p-1.5 sm:p-2 rounded-lg shadow-lg">
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              />
            </svg>
          </div>
          
          {/* Card Details Input */}
          <div className="mt-1 sm:mt-2">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">
              Enter your card details
            </label>
            <div className="p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200 transition-all duration-200 focus-within:border-teal-500 focus-within:ring-1 focus-within:ring-teal-500">
              <CardElement
                options={{
                  style: {
                    base: {
                      fontSize: '16px',
                      fontWeight: '500',
                      color: '#1a1f36',
                      fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
                      fontSmoothing: 'antialiased',
                      '::placeholder': {
                        color: '#a3acb9'
                      },
                      ':-webkit-autofill': {
                        color: '#1a1f36'
                      }
                    },
                    invalid: {
                      color: '#ef4444',
                      iconColor: '#ef4444'
                    }
                  },
                  hidePostalCode: true
                }}
              />
            </div>
            
            {/* Security Note */}
            <div className="mt-3 flex items-center text-xs text-gray-500">
              <svg
                className="w-4 h-4 mr-1.5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7a4 4 0 00-8 0"
                />
              </svg>
              Payments are securely processed
            </div>
          </div>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center text-red-700">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-sm font-medium">{errorMessage}</span>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className={`mt-4 sm:mt-6 w-full py-3 sm:py-4 px-4 sm:px-6 rounded-xl font-semibold text-white shadow-lg transition-all duration-200 text-sm sm:text-base
            ${!stripe || isProcessing
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 transform hover:-translate-y-0.5'
            }`}
        >
          <div className="flex items-center justify-center">
            {isProcessing && (
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            )}
            {isProcessing ? 'Processing payment...' : `Pay $${amount.toFixed(2)}`}
          </div>
        </button>
      </div>
    </form>
  );
};

const PaymentForm = (props: PaymentFormProps) => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm {...props} />
    </Elements>
  );
};

export default PaymentForm;
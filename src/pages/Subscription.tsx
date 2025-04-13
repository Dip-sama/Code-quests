import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { loadStripe } from '@stripe/stripe-js';
import { supabase } from '../lib/supabase';
import { Shield, Check } from 'lucide-react';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

function Subscription() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPlan, setCurrentPlan] = useState(null);

  useEffect(() => {
    if (user) {
      fetchCurrentPlan();
    }
  }, [user]);

  useEffect(() => {
    // Check if payment is allowed (10-11 AM IST)
    const now = new Date();
    const istHour = now.getUTCHours() + 5.5; // Convert to IST
    const isPaymentAllowed = istHour >= 10 && istHour < 11;
    
    if (!isPaymentAllowed) {
      setError('Payments are only accepted between 10 AM and 11 AM IST');
    }
  }, []);

  const fetchCurrentPlan = async () => {
    const { data, error } = await supabase
      .from('users')
      .select('subscription_plan, subscription_end_date')
      .eq('id', user.id)
      .single();

    if (!error && data) {
      setCurrentPlan(data);
    }
  };

  const plans = [
    {
      name: 'Free',
      price: 0,
      questions: 1,
      features: ['1 question per day', 'Basic support', 'Community access']
    },
    {
      name: 'Bronze',
      price: 100,
      questions: 5,
      features: ['5 questions per day', 'Priority support', 'Community access']
    },
    {
      name: 'Silver',
      price: 300,
      questions: 10,
      features: ['10 questions per day', 'Priority support', 'Community access', 'Video questions']
    },
    {
      name: 'Gold',
      price: 1000,
      questions: 'Unlimited',
      features: ['Unlimited questions', '24/7 support', 'Community access', 'Video questions', 'Priority answers']
    }
  ];

  const handleSubscribe = async (planName: string) => {
    if (error) return;
    
    setLoading(true);
    try {
      const stripe = await stripePromise;
      
      // Create checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planName,
          userId: user.id,
          email: user.email
        }),
      });

      const session = await response.json();

      // Redirect to checkout
      const result = await stripe.redirectToCheckout({
        sessionId: session.id,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }
    } catch (err) {
      setError('Failed to process payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
          {error}
        </div>
      )}

      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
        <p className="text-gray-600">Select the perfect plan for your needs</p>
      </div>

      <div className="grid md:grid-cols-4 gap-8">
        {plans.map((plan) => (
          <div key={plan.name} className={`bg-white rounded-lg shadow-lg overflow-hidden ${
            currentPlan?.subscription_plan === plan.name.toLowerCase() ? 'ring-2 ring-blue-500' : ''
          }`}>
            <div className="p-6 bg-gradient-to-br from-blue-500 to-purple-600 text-white">
              <h2 className="text-2xl font-bold mb-2">{plan.name}</h2>
              <p className="text-4xl font-bold mb-2">
                ₹{plan.price}
                <span className="text-sm font-normal">/month</span>
              </p>
              <p className="text-sm opacity-90">{plan.questions} questions per day</p>
            </div>

            <div className="p-6">
              <ul className="space-y-4">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center text-gray-600">
                    <Check className="w-5 h-5 text-green-500 mr-2" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(plan.name)}
                disabled={loading || Boolean(error) || currentPlan?.subscription_plan === plan.name.toLowerCase()}
                className={`mt-6 w-full py-2 px-4 rounded-lg font-medium ${
                  currentPlan?.subscription_plan === plan.name.toLowerCase()
                    ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                {currentPlan?.subscription_plan === plan.name.toLowerCase()
                  ? 'Current Plan'
                  : loading
                  ? 'Processing...'
                  : 'Subscribe'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Subscription;
import { Button } from './ui/button';

interface SubscriptionPromptProps {
  onSubscribe: () => void;
}

export const SubscriptionPrompt: React.FC<SubscriptionPromptProps> = ({ onSubscribe }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-4">
          <svg
            className="h-8 w-8 text-yellow-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Premium Content</h2>
        <p className="text-gray-600 mb-6">
          This content requires an active subscription. Subscribe now to continue learning.
        </p>
        <div className="space-y-3">
          <Button
            onClick={onSubscribe}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            Subscribe Now
          </Button>
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-2 px-6 rounded-lg transition-colors"
          >
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPrompt;

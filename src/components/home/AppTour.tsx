import { useState, useEffect } from 'react';
import { useTour, type StepType } from '@reactour/tour';
import { Button } from '../ui/button';
import { HelpCircle } from 'lucide-react';

export const steps: StepType[] = [
  // Sidebar Navigation
  {
    selector: '.sidebar-nav',
    content: 'This is your main navigation menu. Here you can access all the important sections of the application.',
    position: 'right',
  },
  {
    selector: '.dashboard-link',
    content: 'Access your dashboard to see an overview of your activities and progress.',
    position: 'right',
  },
  {
    selector: '.calendar-link',
    content: 'View and manage your study schedule and important dates in the calendar.',
    position: 'right',
  },
  {
    selector: '.purchases-link',
    content: 'Check your purchased courses and test series here.',
    position: 'right',
  },
  {
    selector: '.mock-test-link',
    content: 'Take mock tests to assess your preparation level.',
    position: 'right',
  },
  {
    selector: '.my-tests-link',
    content: 'View your test history and performance analytics.',
    position: 'right',
  },
  {
    selector: '.inbox-link',
    content: 'Check your messages and notifications here.',
    position: 'right',
  },
  {
    selector: '.my-test-series-link',
    content: 'Access and manage your test series subscriptions.',
    position: 'right',
  },
  
  // Dashboard Elements
  {
    selector: '.stats-box',
    content: 'Your key performance indicators and progress metrics are displayed here.',
    position: 'bottom',
  },
  {
    selector: '.global-message',
    content: 'Important announcements and messages from the platform will appear here.',
    position: 'bottom',
  },
  {
    selector: '.radar-chart-container',
    content: 'This radar chart shows your performance across different categories compared to the average.',
    position: 'left',
  },
  {
    selector: '.test-series-chart',
    content: 'Track your test performance over time with this chart.',
    position: 'top',
  },
  {
    selector: '.progress-chart',
    content: 'Monitor your learning progress and completion status here.',
    position: 'top',
  },
  {
    selector: '.rating-message',
    content: 'Personalized messages based on your current rating and progress.',
    position: 'left',
  },
];

export const AppTour = () => {
  const [isMounted, setIsMounted] = useState(false);
  const { setSteps, setCurrentStep, setIsOpen, isOpen } = useTour();

  useEffect(() => {
    setIsMounted(true);
    return () => {
      document.body.classList.remove('tour-active');
    };
  }, []);

  const startTour = () => {
    if (setSteps && setCurrentStep && setIsOpen) {
      setSteps(steps);
      setCurrentStep(0);
      setIsOpen(true);
      document.body.classList.add('tour-active');
    }
  };

  // Add keyboard shortcut (Shift + T) to start tour
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key.toLowerCase() === 't' && !isOpen) {
        startTour();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isMounted) return null;

  return (
    <Button
      variant="outline"
      size="lg"
      onClick={startTour}
      className="fixed bottom-6 right-6 z-50 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-white text-blue-600 hover:bg-blue-50 h-12 w-12 flex items-center justify-center"
      aria-label="Start guided tour"
      title="Start Tour (Shift+T)"
    >
      <HelpCircle className="h-6 w-6" />
    </Button>
  );
};

export default AppTour;

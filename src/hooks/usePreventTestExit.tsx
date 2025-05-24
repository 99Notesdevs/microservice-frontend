// src/hooks/usePreventTestExit.ts
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function usePreventTestExit(isActive: boolean) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isActive) return;

    // Prevent page refresh, tab close, and window close
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      // Modern browsers require setting returnValue
      e.returnValue = 'Are you sure you want to leave? Your test progress will be lost.';
      return e.returnValue;
    };

    // Prevent context menu (right-click)
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // Prevent keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Allow navigation keys, backspace, delete, etc.
      //@ts-ignore
      const allowedKeys = [
        'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 
        'Backspace', 'Delete', 'Tab', 'Enter', 'Escape'
      ];
      
      // Block F1-F12, Alt+Left/Right (Back/Forward), Ctrl+R, F5, etc.
      if (
        e.key.startsWith('F') || // All function keys
        (e.ctrlKey && (e.key === 'r' || e.key === 'R')) || // Ctrl+R
        (e.ctrlKey && e.shiftKey && e.key === 'R') || // Ctrl+Shift+R
        (e.ctrlKey && e.key === 'w') || // Ctrl+W (close tab)
        (e.altKey && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) // Alt+Left/Right (browser back/forward)
      ) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Allow typing in input fields
      const target = e.target as HTMLElement;
      const tagName = target?.tagName?.toLowerCase();
      if (tagName === 'input' || tagName === 'textarea' || target?.isContentEditable) {
        return;
      }

      // Block other single key commands
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    // Prevent back/forward navigation
    //@ts-ignore
    const handlePopState = (e: PopStateEvent) => {
      
      // Push a new state to prevent back navigation
      window.history.pushState(null, '', window.location.pathname);
      // Show a warning
      alert('Please use the navigation buttons within the test interface.');
    };

    // Push initial state
    window.history.pushState(null, '', window.location.pathname);

    // Add event listeners
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown, true); // Use capture phase
    window.addEventListener('popstate', handlePopState);

    // Block right-click menu
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';
    (document.body.style as any).msUserSelect = 'none';
    (document.body.style as any).mozUserSelect = 'none';

    // Disable backspace as back navigation
    const blockBackspace = (e: KeyboardEvent) => {
      if (e.key === 'Backspace' && 
          !(e.target instanceof HTMLInputElement) && 
          !(e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
      }
    };
    document.addEventListener('keydown', blockBackspace, false);

    // Cleanup
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('popstate', handlePopState);
      document.removeEventListener('keydown', blockBackspace, false);
      
      // Re-enable text selection
      document.body.style.userSelect = '';
      document.body.style.webkitUserSelect = '';
      (document.body.style as any).msUserSelect = '';
      (document.body.style as any).mozUserSelect = '';

      // Clean up the history state
      if (window.history.state) {
        window.history.back();
      }
    };
  }, [isActive, navigate]);

  // Block navigation attempts
  useEffect(() => {
    if (!isActive) return;
    //@ts-ignore
    const unblock = () => {
      // This will prevent any navigation attempts
      return false;
    };

    // Block programmatic navigation
    const originalPushState = window.history.pushState;
    window.history.pushState = function() {
      if (!isActive) return originalPushState.apply(this, arguments as any);
      return null as any;
    };

    return () => {
      window.history.pushState = originalPushState;
    };
  }, [isActive]);
}
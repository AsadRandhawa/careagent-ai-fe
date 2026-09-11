import * as React from "react";

// Catches render-time exceptions in whatever page is currently mounted
// (Dashboard, Analytics, Inbox, etc.) and shows a friendly, recoverable
// message instead of an unhandled crash silently unmounting the entire
// app to a blank white screen — which is exactly what happened live when
// Analytics.tsx hit a channel it didn't have styling for (a `.find(...)!`
// non-null assertion that turned out not to be safe once Instagram data
// existed). That specific bug is fixed, but nothing previously existed to
// catch the *next* one, on any page, for any reason — this closes that
// gap generally rather than only patching the one instance found.
//
// Wrap this around the routed page content in App.tsx, not the whole app
// shell — that way Sidebar/Topbar stay usable even if the current page
// crashes, so the person can navigate away rather than being stuck on a
// fully blank screen with no way out.
export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Visible in the browser console and, if this app has any error-
    // reporting service wired up elsewhere, would be the natural place
    // to also report it there.
    console.error("[ErrorBoundary] Caught a render error:", error, info.componentStack);
  }

  componentDidUpdate(prevProps: { children: React.ReactNode }) {
    // Reset automatically on navigation (children identity changes when
    // the route changes) — so going to a different page recovers
    // without needing a full browser reload.
    if (this.state.hasError && prevProps.children !== this.props.children) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full min-h-[400px] p-8 text-center">
          <p className="text-[15px] font-bold text-text-primary mb-2">Something went wrong loading this page.</p>
          <p className="text-[13px] text-text-muted mb-4 max-w-md">
            This has been logged. Try another page from the sidebar, or reload.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-lg bg-brand text-white text-[13px] font-bold"
          >
            Reload page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

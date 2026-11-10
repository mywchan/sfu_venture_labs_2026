import type { ReactNode } from 'react';

/** The sign-in wireframes' error box: red outline with a red "Error" label. */
export function AuthError({ testId, children }: { testId: string; children: ReactNode }) {
  return (
    <div className="auth-notice danger" role="alert" data-testid={testId}>
      <span className="chip fill danger" aria-hidden="true">Error</span>
      <span>{children}</span>
    </div>
  );
}

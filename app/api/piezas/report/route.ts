import { Piezas, createReportProblemRoute } from '@piezas/sdk';
import { signedInPerson } from '@/lib/server/auth/current-user';
import { demoMode } from '@/lib/server/demo-store';

// Added by Piezas: saves "Report a problem" reports in this app's own records.
// Keep it: whether the button shows is the owner's answer at each deploy.
const piezas = new Piezas({ apiKey: process.env.PIEZAS_API_KEY! });
// The presentation version never saves reports to the deployed site.
const route = createReportProblemRoute({ piezas, identify: signedInPerson, isOn: () => !demoMode() });

// Wrapped because Next.js requires the request argument to be non-optional.
export function GET(request: Request) {
  return route.GET(request);
}

export function POST(request: Request) {
  return route.POST(request);
}

import { Piezas, createReportProblemRoute } from '@piezas/sdk';

// Added by Piezas: saves "Report a problem" reports in this app's own records.
// Keep it: whether the button shows is the owner's answer at each deploy.
const piezas = new Piezas({ apiKey: process.env.PIEZAS_API_KEY! });
const route = createReportProblemRoute({ piezas });

// Wrapped because Next.js requires the request argument to be non-optional.
export function GET(request: Request) {
  return route.GET(request);
}

export function POST(request: Request) {
  return route.POST(request);
}

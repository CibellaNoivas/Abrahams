# Abrahams by Cibella Group

Premium menswear landing page for Abrahams by Cibella Group, focused on suits, tailoring, shirts, blazers, social pants, ties, bow ties and cufflinks.

## Run locally

```bash
node server.mjs
```

Then open `http://localhost:4173`.

## What is included

- Premium responsive landing page with dark navy, ivory and soft gold identity.
- Modern menswear catalog: suits, social pants, blazers, shirts, bow ties, ties and cufflinks.
- Smooth editorial animations and luxury fashion atmosphere.
- Booking form with availability.
- Store WhatsApp: `+55 11 91561-4927`.
- GitHub Actions workflow for adding bookings to Google Calendar through Workload Identity Federation.
- No Google service account JSON key and no `credentials_json`.

## Contacts

- WhatsApp Abrahams: `+55 11 91561-4927`
- Email: `ibrahimhakkialtin@gmail.com`
- Email: `taner@cibellanoivas.com`
- Email: `camila@cibellanoivas.com`

## Google Calendar integration

The backend dispatches `repository_dispatch` events to GitHub Actions. The workflow then authenticates to Google Cloud with Workload Identity Federation and creates the booking in Google Calendar.

Set these GitHub Actions secrets exactly:

```txt
GCP_PROJECT_ID=trusty-field-459814-a9
GCP_PROJECT_NUMBER=299661583209
GCP_SERVICE_ACCOUNT=abrahams-test@trusty-field-459814-a9.iam.gserviceaccount.com
GCP_WORKLOAD_IDENTITY_PROVIDER=projects/299661583209/locations/global/workloadIdentityPools/github-actions-pool/providers/github
GOOGLE_CALENDAR_ID=camila@cibellanoivas.com
```

For live booking dispatch from the Node server, set these runtime environment variables where the server is deployed:

```txt
GITHUB_REPOSITORY=CibellaNoivas/Abrahams
GITHUB_DISPATCH_TOKEN=your_github_token
GITHUB_DISPATCH_EVENT_TYPE=abrahams_booking_created
GOOGLE_CALENDAR_ID=camila@cibellanoivas.com
COMPANY_WHATSAPP=5511915614927
```

The calendar event title is `segment - customer name`. Each appointment is created for 90 minutes in `America/Sao_Paulo`.

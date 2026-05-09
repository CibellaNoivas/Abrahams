# Abrahams by Cibella Group

Premium menswear landing page for Abrahams by Cibella Group, focused on suits, tailoring, shirts, blazers, social pants, ties, bow ties and cufflinks.

## Run locally

```bash
npm start
```

Then open `http://localhost:4173`.

## What is included

- Premium responsive landing page with dark navy, ivory and soft gold identity.
- Modern menswear catalog: suits, social pants, blazers, shirts, bow ties, ties and cufflinks.
- Smooth editorial animations and luxury fashion atmosphere.
- Booking form with availability.
- GitHub Actions workflow for adding bookings to Google Calendar through Workload Identity Federation.
- No Google service account JSON key and no `credentials_json`.

## Contacts

- WhatsApp: `+55 11 91402-0888`
- Email: `ibrahimhakkialtin@gmail.com`
- Email: `taner@cibellanoivas.com`
- Email: `camila@cibellanoivas.com`

## Google Calendar integration

Set these GitHub Actions variables:

```txt
GCP_PROJECT_ID=trusty-field-459814-a9
GCP_WORKLOAD_IDENTITY_PROVIDER=projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/github-actions-pool/providers/github
GCP_SERVICE_ACCOUNT=abrahams-test@trusty-field-459814-a9.iam.gserviceaccount.com
GCP_CALENDAR_ID=your_calendar_id
```

For live booking dispatch from the server, set these runtime environment variables where the Node server is deployed:

```txt
GITHUB_REPOSITORY=CibellaNoivas/Abrahams
GITHUB_DISPATCH_TOKEN=your_github_token
GITHUB_DISPATCH_EVENT_TYPE=abrahams_booking_created
```

The calendar event title is `segment - customer name`. If a customer selects `15:30`, the calendar event is created from `15:25` to `16:45` in `America/Sao_Paulo`.

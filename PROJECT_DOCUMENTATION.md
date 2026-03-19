# Tabeebak

## Overview
- Brief description of the project: Tabeebak is a role-based healthcare web application that connects patients, doctors, and laboratories through a unified booking and care workflow.
- Purpose and main idea: Provide a single frontend for discovering providers, requesting appointments/tests, managing care tasks, and viewing results, with tailored dashboards for each role.
- Target users: Patients, Doctors, Laboratory staff, and Admin users.

## Tech Stack
- Frontend framework: React 18 with TypeScript
- Build tooling: Vite, SWC
- Routing: React Router
- Data fetching/state: TanStack React Query, Axios
- UI system: Tailwind CSS, shadcn/ui, Radix UI primitives
- Forms and validation: React Hook Form, Zod, @hookform/resolvers
- UI utilities: class-variance-authority, clsx, tailwind-merge, tailwindcss-animate
- Icons and visuals: lucide-react, recharts, embla-carousel-react
- Dates: date-fns
- Theming: next-themes
- Tooling: ESLint, PostCSS

## Project Structure
- `public/`: Static assets served by Vite.
- `src/`: Application source code.
- `src/assets/`: Images and brand assets.
- `src/components/`: Reusable UI and feature components.
- `src/components/auth/`: Auth-related UI and route guarding.
- `src/components/dashboard/`: Shared dashboard widgets.
- `src/components/doctors/`: Doctor-facing and listing components.
- `src/components/lab/`: Lab-facing components.
- `src/components/patient/`: Patient-facing components.
- `src/components/ui/`: shadcn/ui components (Radix-based).
- `src/hooks/`: Custom hooks for data fetching and feature logic.
- `src/lib/`: Shared utilities (auth helpers, password policy, keys).
- `src/pages/`: Route-level pages (public, patient, doctor, lab).
- `src/services/`: API client modules and domain services.
- `src/types/`: TypeScript domain models and request/response shapes.
- `src/App.tsx`: Route definitions and app providers.
- `src/main.tsx`: React entry point and error boundary.
- `src/index.css`: Tailwind base styles and global CSS.
- `components.json`: shadcn/ui configuration.
- `tailwind.config.ts`: Tailwind configuration.
- `vite.config.ts`: Vite configuration and path aliases.

## Features
- Role-based authentication with protected routes for patients, doctors, and labs.
- Public marketing pages: home, about, contact, doctors listing, lab services.
- Patient portal: dashboard, doctor/lab discovery, appointment/test requests, messaging, appointments, prescriptions, lab results, health tips, settings, and help.
- Doctor portal: dashboard, appointment requests, appointment schedule, patient list and summary, prescriptions, reviews, settings, and help.
- Lab portal: dashboard, order queue, pending/completed orders, order details, result upload, sample collection requests, branch/service management, settings, and help.
- Unified notification and session management under the account area.
- Robust response normalization to handle varying backend payload shapes.

## System Architecture
- Client-side SPA built in React.
- Routing handled by `react-router-dom` with role-based gating in `ProtectedRoute`.
- API layer centralized in `src/services/api.ts`.
- Domain services wrap API calls and normalize responses into strongly typed models.
- React Query manages caching, request lifecycles, and background refresh.
- Auth flow stores a token in local storage and bootstraps user profile via `/api/v1/auth/me`.
- Data flow: UI components trigger hooks, hooks call domain services, services call the shared API client, API client attaches the auth token, responses are normalized, and components render data or handle errors.

## API Documentation (if applicable)
Base URL configured in the frontend: `http://localhost:5000` (see `src/services/api.ts`).

### Auth
**Endpoint:** `/auth/register`  
**Method:** `POST`  
**Description:** Register a new patient account.  
**Request Example:**
```json
{
  "firstName": "Sarah",
  "lastName": "Hassan",
  "email": "sarah@example.com",
  "phone": "+20100111222",
  "dateOfBirth": "1995-06-10",
  "gender": "Female",
  "password": "StrongPass123",
  "role": "Patient"
}
```
**Response Example:**
```json
{
  "token": "<jwt-token>"
}
```

**Endpoint:** `/auth/signin`  
**Method:** `POST`  
**Description:** Sign in and receive an auth token.  
**Request Example:**
```json
{
  "email": "sarah@example.com",
  "password": "StrongPass123"
}
```
**Response Example:**
```json
{
  "token": "<jwt-token>"
}
```

**Endpoint:** `/auth/change-password`  
**Method:** `PUT`  
**Description:** Change the authenticated user password.  
**Request Example:**
```json
{
  "old_password": "OldPass123",
  "new_password": "NewPass456"
}
```
**Response Example:**
```json
{
  "message": "Password updated successfully"
}
```

**Endpoint:** `/auth/forgot-password`  
**Method:** `POST`  
**Description:** Request a password reset link.  
**Request Example:**
```json
{
  "email": "sarah@example.com"
}
```
**Response Example:**
```json
{
  "message": "Reset link sent successfully"
}
```

**Endpoint:** `/auth/reset-password`  
**Method:** `POST`  
**Description:** Reset password using a reset token.  
**Request Example:**
```json
{
  "token": "<reset-token>",
  "newPassword": "NewPass456"
}
```
**Response Example:**
```json
{
  "message": "Password reset successfully"
}
```

### Contact
**Endpoint:** `/contact`  
**Method:** `POST`  
**Description:** Submit a contact form request.  
**Request Example:**
```json
{
  "name": "Ahmed Ali",
  "email": "ahmed@example.com",
  "subject": "Partnership Inquiry",
  "message": "We would like to partner with Tabeebak.",
  "role": "Doctor"
}
```
**Response Example:**
```json
{
  "message": "Thanks for reaching out"
}
```

### Public Doctors Directory
**Endpoint:** `/doctors`  
**Method:** `GET`  
**Description:** Fetch public doctor listings.  
**Request Example:**
```json
{}
```
**Response Example:**
```json
[
  {
    "id": "doc_1",
    "name": "Dr. Lina Omar",
    "specialty": "Cardiology",
    "location": "Cairo",
    "rating": 4.7,
    "available": true
  }
]
```

**Endpoint:** `/doctors/near`  
**Method:** `GET`  
**Description:** Fetch doctors near a location.  
**Request Example:**
```json
{
  "lat": 30.0444,
  "lng": 31.2357,
  "radiusKm": 20
}
```
**Response Example:**
```json
[
  {
    "id": "doc_2",
    "name": "Dr. Kareem Fayez",
    "specialty": "Dermatology",
    "location": "Giza",
    "distanceKm": 5.2
  }
]
```

### Patient Discovery and Booking
**Endpoint:** `/api/v1/doctors`  
**Method:** `GET`  
**Description:** Search doctors with optional filters.  
**Request Example:**
```json
{
  "search": "cardio",
  "specialty": "Cardiology",
  "page": 1,
  "limit": 10
}
```
**Response Example:**
```json
[
  {
    "id": "doc_1",
    "name": "Dr. Lina Omar",
    "specialty": "Cardiology",
    "rating": 4.7
  }
]
```

**Endpoint:** `/api/v1/doctors/near`  
**Method:** `GET`  
**Description:** Search nearby doctors by location.  
**Request Example:**
```json
{
  "lat": 30.0444,
  "lng": 31.2357,
  "radiusKm": 20,
  "search": "cardio"
}
```
**Response Example:**
```json
[
  {
    "id": "doc_2",
    "name": "Dr. Kareem Fayez",
    "distanceKm": 5.2
  }
]
```

**Endpoint:** `/api/v1/doctors/:doctorId`  
**Method:** `GET`  
**Description:** Fetch a doctor profile by id.  
**Request Example:**
```json
{}
```
**Response Example:**
```json
{
  "id": "doc_1",
  "name": "Dr. Lina Omar",
  "specialty": "Cardiology",
  "languages": ["Arabic", "English"],
  "servicesOffered": ["Consultation", "ECG"]
}
```

**Endpoint:** `/api/v1/doctors/:doctorId/availability`  
**Method:** `GET`  
**Description:** Fetch doctor availability schedule.  
**Request Example:**
```json
{}
```
**Response Example:**
```json
{
  "timezone": "Africa/Cairo",
  "appointmentDurationMinutes": 30,
  "weeklySchedule": [
    { "dayOfWeek": "Monday", "isAvailable": true, "startTime": "09:00", "endTime": "17:00" }
  ]
}
```

**Endpoint:** `/api/v1/labs`  
**Method:** `GET`  
**Description:** Search labs with optional filters.  
**Request Example:**
```json
{
  "search": "central lab",
  "service": "CBC"
}
```
**Response Example:**
```json
[
  {
    "id": "lab_1",
    "name": "Central Lab",
    "rating": 4.5
  }
]
```

**Endpoint:** `/api/v1/labs/near`  
**Method:** `GET`  
**Description:** Search nearby labs by location.  
**Request Example:**
```json
{
  "lat": 30.0444,
  "lng": 31.2357,
  "radiusKm": 20
}
```
**Response Example:**
```json
[
  {
    "id": "lab_2",
    "name": "Downtown Diagnostics",
    "distanceKm": 3.1
  }
]
```

**Endpoint:** `/api/v1/labs/:labId`  
**Method:** `GET`  
**Description:** Fetch lab details by id.  
**Request Example:**
```json
{}
```
**Response Example:**
```json
{
  "id": "lab_1",
  "name": "Central Lab",
  "accreditation": "ISO 15189"
}
```

**Endpoint:** `/api/v1/labs/:labId/branches`  
**Method:** `GET`  
**Description:** Fetch lab branches.  
**Request Example:**
```json
{}
```
**Response Example:**
```json
[
  { "id": "branch_1", "name": "Main Branch", "isMainBranch": true }
]
```

**Endpoint:** `/api/v1/labs/:labId/services`  
**Method:** `GET`  
**Description:** Fetch lab services.  
**Request Example:**
```json
{}
```
**Response Example:**
```json
[
  { "id": "srv_1", "name": "CBC", "price": 150, "currency": "EGP" }
]
```

**Endpoint:** `/api/v1/appointment-requests`  
**Method:** `POST`  
**Description:** Create a doctor appointment request.  
**Request Example:**
```json
{
  "doctorId": "doc_1",
  "preferredDate": "2026-04-01",
  "preferredTime": "10:30",
  "visitType": "in-person",
  "reason": "Chest pain",
  "note": "Pain for 2 days"
}
```
**Response Example:**
```json
{
  "id": "req_1",
  "status": "pending",
  "providerName": "Dr. Lina Omar"
}
```

**Endpoint:** `/api/v1/appointment-requests`  
**Method:** `GET`  
**Description:** List patient appointment requests.  
**Request Example:**
```json
{ "page": 1, "limit": 10, "status": "pending" }
```
**Response Example:**
```json
{
  "data": [{ "id": "req_1", "status": "pending", "providerName": "Dr. Lina Omar" }],
  "page": 1,
  "limit": 10,
  "total": 1,
  "totalPages": 1,
  "hasNextPage": false,
  "hasPreviousPage": false
}
```

**Endpoint:** `/api/v1/appointment-requests/:requestId`  
**Method:** `GET`  
**Description:** Get appointment request details.  
**Request Example:**
```json
{}
```
**Response Example:**
```json
{
  "id": "req_1",
  "status": "pending",
  "messages": []
}
```

**Endpoint:** `/api/v1/appointment-requests/:requestId/cancel`  
**Method:** `PATCH`  
**Description:** Cancel an appointment request.  
**Request Example:**
```json
{}
```
**Response Example:**
```json
{
  "id": "req_1",
  "status": "cancelled"
}
```

**Endpoint:** `/api/v1/appointment-requests/:requestId/messages`  
**Method:** `POST`  
**Description:** Send a message in an appointment request thread.  
**Request Example:**
```json
{ "message": "Can we move to 11 AM?" }
```
**Response Example:**
```json
{
  "id": "msg_1",
  "senderRole": "Patient",
  "message": "Can we move to 11 AM?"
}
```

**Endpoint:** `/api/v1/test-requests`  
**Method:** `POST`  
**Description:** Create a lab test request.  
**Request Example:**
```json
{
  "labId": "lab_1",
  "preferredDate": "2026-04-02",
  "preferredTime": "09:00",
  "serviceIds": ["srv_1", "srv_2"],
  "note": "Fasting",
  "homeCollection": true
}
```
**Response Example:**
```json
{
  "id": "testreq_1",
  "status": "pending",
  "providerName": "Central Lab"
}
```

**Endpoint:** `/api/v1/test-requests`  
**Method:** `GET`  
**Description:** List patient test requests.  
**Request Example:**
```json
{ "page": 1, "limit": 10 }
```
**Response Example:**
```json
{
  "data": [{ "id": "testreq_1", "status": "pending" }],
  "page": 1,
  "limit": 10,
  "total": 1,
  "totalPages": 1,
  "hasNextPage": false,
  "hasPreviousPage": false
}
```

**Endpoint:** `/api/v1/test-requests/:requestId`  
**Method:** `GET`  
**Description:** Get a lab request by id.  
**Request Example:**
```json
{}
```
**Response Example:**
```json
{
  "id": "testreq_1",
  "status": "pending",
  "messages": []
}
```

**Endpoint:** `/api/v1/test-requests/:requestId/cancel`  
**Method:** `PATCH`  
**Description:** Cancel a lab test request.  
**Request Example:**
```json
{}
```
**Response Example:**
```json
{
  "id": "testreq_1",
  "status": "cancelled"
}
```

**Endpoint:** `/api/v1/test-requests/:requestId/messages`  
**Method:** `POST`  
**Description:** Send a message in a test request thread.  
**Request Example:**
```json
{ "message": "Please share fasting instructions." }
```
**Response Example:**
```json
{
  "id": "msg_2",
  "senderRole": "Patient",
  "message": "Please share fasting instructions."
}
```

### Doctor Profile
**Endpoint:** `/api/v1/doctors/me/dashboard-summary`  
**Method:** `GET`  
**Description:** Fetch doctor dashboard summary metrics.  
**Request Example:**
```json
{}
```
**Response Example:**
```json
{
  "doctorId": "doc_1",
  "specialty": "Cardiology",
  "totalAppointmentsToday": 5
}
```

**Endpoint:** `/api/v1/doctors/me/profile`  
**Method:** `GET`  
**Description:** Fetch doctor basic profile.  
**Request Example:**
```json
{}
```
**Response Example:**
```json
{ "id": "doc_1", "firstName": "Lina", "lastName": "Omar" }
```

**Endpoint:** `/api/v1/doctors/me/profile`  
**Method:** `PATCH`  
**Description:** Update doctor profile details.  
**Request Example:**
```json
{ "displayName": "Dr. Lina Omar", "bio": "Cardiologist" }
```
**Response Example:**
```json
{ "id": "doc_1", "displayName": "Dr. Lina Omar" }
```

**Endpoint:** `/api/v1/doctors/me/professional-profile`  
**Method:** `GET`  
**Description:** Fetch professional profile details.  
**Request Example:**
```json
{}
```
**Response Example:**
```json
{ "specialty": "Cardiology", "yearsOfExperience": 12 }
```

**Endpoint:** `/api/v1/doctors/me/professional-profile`  
**Method:** `PATCH`  
**Description:** Update professional profile.  
**Request Example:**
```json
{ "servicesOffered": ["Consultation"], "clinicName": "Heart Care" }
```
**Response Example:**
```json
{ "clinicName": "Heart Care" }
```

**Endpoint:** `/api/v1/doctors/me/availability`  
**Method:** `GET`  
**Description:** Fetch doctor availability.  
**Request Example:**
```json
{}
```
**Response Example:**
```json
{ "weeklySchedule": [{ "dayOfWeek": "Monday", "isAvailable": true }] }
```

**Endpoint:** `/api/v1/doctors/me/availability`  
**Method:** `PUT`  
**Description:** Update doctor availability.  
**Request Example:**
```json
{
  "timezone": "Africa/Cairo",
  "appointmentDurationMinutes": 30,
  "weeklySchedule": [
    { "dayOfWeek": "Monday", "isAvailable": true, "startTime": "09:00", "endTime": "17:00" }
  ]
}
```
**Response Example:**
```json
{ "timezone": "Africa/Cairo", "weeklySchedule": [] }
```

### Doctor Workflow
**Endpoint:** `/api/v1/doctors/me/appointment-requests`  
**Method:** `GET`  
**Description:** List appointment requests for the doctor.  
**Request Example:**
```json
{ "page": 1, "limit": 10, "status": "pending" }
```
**Response Example:**
```json
{
  "data": [{ "id": "req_1", "patientName": "Sarah Hassan", "status": "pending" }],
  "page": 1,
  "limit": 10,
  "total": 1,
  "totalPages": 1
}
```

**Endpoint:** `/api/v1/doctors/me/appointment-requests/:requestId`  
**Method:** `GET`  
**Description:** Get a single appointment request.  
**Request Example:**
```json
{}
```
**Response Example:**
```json
{ "id": "req_1", "messages": [] }
```

**Endpoint:** `/api/v1/doctors/me/appointment-requests/:requestId/status`  
**Method:** `PATCH`  
**Description:** Update appointment request status.  
**Request Example:**
```json
{ "status": "approved", "message": "See you at 10:30" }
```
**Response Example:**
```json
{ "id": "req_1", "status": "approved" }
```

**Endpoint:** `/api/v1/appointment-requests/:requestId/messages`  
**Method:** `POST`  
**Description:** Send a message to the appointment request thread.  
**Request Example:**
```json
{ "message": "Please bring previous ECG." }
```
**Response Example:**
```json
{ "id": "msg_3", "senderRole": "Doctor", "message": "Please bring previous ECG." }
```

**Endpoint:** `/api/v1/doctors/me/appointments`  
**Method:** `GET`  
**Description:** Fetch doctor appointments.  
**Request Example:**
```json
{ "page": 1, "limit": 10, "date": "2026-04-01" }
```
**Response Example:**
```json
{ "data": [{ "id": "appt_1", "patientName": "Sarah Hassan", "status": "scheduled" }] }
```

**Endpoint:** `/api/v1/doctors/me/appointments/today`  
**Method:** `GET`  
**Description:** Fetch doctor appointments for today.  
**Request Example:**
```json
{}
```
**Response Example:**
```json
{ "data": [{ "id": "appt_2", "patientName": "Omar Ali" }] }
```

**Endpoint:** `/api/v1/doctors/me/appointments/:appointmentId`  
**Method:** `GET`  
**Description:** Fetch appointment by id.  
**Request Example:**
```json
{}
```
**Response Example:**
```json
{ "id": "appt_1", "patientName": "Sarah Hassan", "status": "scheduled" }
```

**Endpoint:** `/api/v1/doctors/me/patients`  
**Method:** `GET`  
**Description:** List the doctor patients.  
**Request Example:**
```json
{ "page": 1, "limit": 10 }
```
**Response Example:**
```json
{ "data": [{ "id": "pat_1", "fullName": "Sarah Hassan" }] }
```

**Endpoint:** `/api/v1/doctors/me/patients/:patientId/summary`  
**Method:** `GET`  
**Description:** Fetch a patient summary for the doctor.  
**Request Example:**
```json
{}
```
**Response Example:**
```json
{ "id": "pat_1", "fullName": "Sarah Hassan", "allergies": ["Penicillin"] }
```

**Endpoint:** `/api/v1/doctors/me/prescriptions`  
**Method:** `GET`  
**Description:** List prescriptions issued by the doctor.  
**Request Example:**
```json
{ "page": 1, "limit": 10 }
```
**Response Example:**
```json
{ "data": [{ "id": "rx_1", "medicationName": "Aspirin", "status": "active" }] }
```

**Endpoint:** `/api/v1/doctors/me/reviews/summary`  
**Method:** `GET`  
**Description:** Review summary stats.  
**Request Example:**
```json
{}
```
**Response Example:**
```json
{ "averageRating": 4.6, "totalReviews": 25 }
```

**Endpoint:** `/api/v1/doctors/me/reviews`  
**Method:** `GET`  
**Description:** List reviews for the doctor.  
**Request Example:**
```json
{ "page": 1, "limit": 10 }
```
**Response Example:**
```json
{ "data": [{ "id": "rev_1", "rating": 5, "comment": "Great care" }] }
```

### Lab Profile
**Endpoint:** `/api/v1/labs/me/dashboard-summary`  
**Method:** `GET`  
**Description:** Fetch lab dashboard summary metrics.  
**Request Example:**
```json
{}
```
**Response Example:**
```json
{ "labId": "lab_1", "pendingTestsCount": 8 }
```

**Endpoint:** `/api/v1/labs/me/profile`  
**Method:** `GET`  
**Description:** Fetch lab profile.  
**Request Example:**
```json
{}
```
**Response Example:**
```json
{ "id": "lab_1", "displayName": "Central Lab" }
```

**Endpoint:** `/api/v1/labs/me/profile`  
**Method:** `PATCH`  
**Description:** Update lab profile.  
**Request Example:**
```json
{ "displayName": "Central Lab", "homeCollectionAvailable": true }
```
**Response Example:**
```json
{ "id": "lab_1", "homeCollectionAvailable": true }
```

**Endpoint:** `/api/v1/labs/me/branches`  
**Method:** `GET`  
**Description:** List lab branches.  
**Request Example:**
```json
{}
```
**Response Example:**
```json
[{ "id": "branch_1", "name": "Main Branch" }]
```

**Endpoint:** `/api/v1/labs/me/branches`  
**Method:** `POST`  
**Description:** Create a new lab branch.  
**Request Example:**
```json
{ "name": "East Branch", "city": "Cairo", "isMainBranch": false }
```
**Response Example:**
```json
{ "id": "branch_2", "name": "East Branch" }
```

**Endpoint:** `/api/v1/labs/me/branches/:branchId`  
**Method:** `PATCH`  
**Description:** Update a lab branch.  
**Request Example:**
```json
{ "phone": "+20123456789", "isActive": true }
```
**Response Example:**
```json
{ "id": "branch_2", "phone": "+20123456789" }
```

**Endpoint:** `/api/v1/labs/me/services`  
**Method:** `GET`  
**Description:** List lab services.  
**Request Example:**
```json
{}
```
**Response Example:**
```json
[{ "id": "srv_1", "name": "CBC", "price": 150 }]
```

**Endpoint:** `/api/v1/labs/me/services`  
**Method:** `POST`  
**Description:** Create a lab service.  
**Request Example:**
```json
{ "name": "Vitamin D", "price": 250, "currency": "EGP" }
```
**Response Example:**
```json
{ "id": "srv_2", "name": "Vitamin D" }
```

**Endpoint:** `/api/v1/labs/me/services/:serviceId`  
**Method:** `PATCH`  
**Description:** Update a lab service.  
**Request Example:**
```json
{ "price": 275 }
```
**Response Example:**
```json
{ "id": "srv_2", "price": 275 }
```

**Endpoint:** `/api/v1/labs/me/services/:serviceId`  
**Method:** `DELETE`  
**Description:** Delete a lab service.  
**Request Example:**
```json
{}
```
**Response Example:**
```json
{ "message": "Deleted" }
```

### Lab Workflow
**Endpoint:** `/api/v1/labs/me/orders`  
**Method:** `GET`  
**Description:** List lab orders.  
**Request Example:**
```json
{ "page": 1, "limit": 10, "status": "pending" }
```
**Response Example:**
```json
{ "data": [{ "id": "order_1", "patientName": "Sarah Hassan", "status": "pending" }] }
```

**Endpoint:** `/api/v1/labs/me/orders/pending`  
**Method:** `GET`  
**Description:** List pending lab orders.  
**Request Example:**
```json
{ "page": 1, "limit": 10 }
```
**Response Example:**
```json
{ "data": [{ "id": "order_1", "status": "pending" }] }
```

**Endpoint:** `/api/v1/labs/me/orders/:orderId`  
**Method:** `GET`  
**Description:** Get lab order details.  
**Request Example:**
```json
{}
```
**Response Example:**
```json
{ "id": "order_1", "patientName": "Sarah Hassan", "messages": [] }
```

**Endpoint:** `/api/v1/labs/me/orders/:orderId/status`  
**Method:** `PATCH`  
**Description:** Update a lab order status.  
**Request Example:**
```json
{ "status": "in_progress", "notes": "Sample collected" }
```
**Response Example:**
```json
{ "id": "order_1", "status": "in_progress" }
```

**Endpoint:** `/api/v1/labs/me/orders/:orderId/review`  
**Method:** `PATCH`  
**Description:** Approve or reject a lab order.  
**Request Example:**
```json
{ "action": "approve", "message": "Order approved" }
```
**Response Example:**
```json
{ "id": "order_1", "status": "approved" }
```

**Endpoint:** `/api/v1/test-requests/:requestId/messages`  
**Method:** `POST`  
**Description:** Send a message for a test request thread.  
**Request Example:**
```json
{ "message": "Please fast for 8 hours." }
```
**Response Example:**
```json
{ "id": "msg_4", "senderRole": "Lab", "message": "Please fast for 8 hours." }
```

**Endpoint:** `/api/v1/labs/me/orders/:orderId/results`  
**Method:** `POST`  
**Description:** Upload lab results and attachments.  
**Request Example:**
```json
{
  "status": "completed",
  "summary": "All values within normal range",
  "values": [{ "name": "Hemoglobin", "value": "13.5", "unit": "g/dL" }]
}
```
**Response Example:**
```json
{ "id": "result_1", "status": "completed", "reportUrl": "<file-url>" }
```

**Endpoint:** `/api/v1/labs/me/results`  
**Method:** `GET`  
**Description:** List lab results.  
**Request Example:**
```json
{ "page": 1, "limit": 10 }
```
**Response Example:**
```json
{ "data": [{ "id": "result_1", "patientName": "Sarah Hassan", "status": "completed" }] }
```

**Endpoint:** `/api/v1/labs/me/sample-collection-requests`  
**Method:** `GET`  
**Description:** List home sample collection requests.  
**Request Example:**
```json
{ "page": 1, "limit": 10 }
```
**Response Example:**
```json
{ "data": [{ "id": "scr_1", "patientName": "Sarah Hassan", "status": "scheduled" }] }
```

### Account (Me)
**Endpoint:** `/api/v1/auth/me`  
**Method:** `GET`  
**Description:** Fetch current user identity and role.  
**Request Example:**
```json
{}
```
**Response Example:**
```json
{ "id": "user_1", "email": "sarah@example.com", "role": "Patient" }
```

**Endpoint:** `/api/v1/me/profile`  
**Method:** `GET`  
**Description:** Fetch the user profile.  
**Request Example:**
```json
{}
```
**Response Example:**
```json
{ "id": "user_1", "displayName": "Sarah Hassan" }
```

**Endpoint:** `/api/v1/me/basic-info`  
**Method:** `PATCH`  
**Description:** Update basic profile info.  
**Request Example:**
```json
{ "firstName": "Sarah", "lastName": "Hassan" }
```
**Response Example:**
```json
{ "displayName": "Sarah Hassan" }
```

**Endpoint:** `/api/v1/me/contact-info`  
**Method:** `PATCH`  
**Description:** Update contact information.  
**Request Example:**
```json
{ "phone": "+20100111222", "city": "Cairo" }
```
**Response Example:**
```json
{ "phone": "+20100111222", "city": "Cairo" }
```

**Endpoint:** `/api/v1/me/avatar`  
**Method:** `POST`  
**Description:** Upload an avatar.  
**Request Example:**
```json
{ "avatar": "<file>" }
```
**Response Example:**
```json
{ "avatarUrl": "https://cdn.example.com/avatar.png" }
```

**Endpoint:** `/api/v1/me/avatar`  
**Method:** `DELETE`  
**Description:** Delete the current avatar.  
**Request Example:**
```json
{}
```
**Response Example:**
```json
{ "message": "Avatar removed successfully" }
```

**Endpoint:** `/api/v1/me/password`  
**Method:** `PATCH`  
**Description:** Change account password.  
**Request Example:**
```json
{ "currentPassword": "OldPass123", "newPassword": "NewPass456" }
```
**Response Example:**
```json
{ "message": "Password updated successfully" }
```

**Endpoint:** `/api/v1/me/notification-preferences`  
**Method:** `GET`  
**Description:** Get notification preferences.  
**Request Example:**
```json
{}
```
**Response Example:**
```json
{ "emailEnabled": true, "smsEnabled": false }
```

**Endpoint:** `/api/v1/me/notification-preferences`  
**Method:** `PATCH`  
**Description:** Update notification preferences.  
**Request Example:**
```json
{ "emailEnabled": true, "smsEnabled": true }
```
**Response Example:**
```json
{ "emailEnabled": true, "smsEnabled": true }
```

**Endpoint:** `/api/v1/me/notifications`  
**Method:** `GET`  
**Description:** List notifications.  
**Request Example:**
```json
{ "page": 1, "limit": 10 }
```
**Response Example:**
```json
{ "data": [{ "id": "notif_1", "title": "New appointment" }] }
```

**Endpoint:** `/api/v1/me/notifications/:notificationId/read`  
**Method:** `PATCH`  
**Description:** Mark a notification as read.  
**Request Example:**
```json
{}
```
**Response Example:**
```json
{ "message": "Notification marked as read" }
```

**Endpoint:** `/api/v1/me/notifications/read-all`  
**Method:** `PATCH`  
**Description:** Mark all notifications as read.  
**Request Example:**
```json
{}
```
**Response Example:**
```json
{ "message": "All notifications marked as read" }
```

**Endpoint:** `/api/v1/me/security-settings`  
**Method:** `GET`  
**Description:** Fetch account security settings.  
**Request Example:**
```json
{}
```
**Response Example:**
```json
{ "twoFactorEnabled": false, "sessionTimeoutMinutes": 60 }
```

**Endpoint:** `/api/v1/me/security-settings`  
**Method:** `PATCH`  
**Description:** Update security settings.  
**Request Example:**
```json
{ "twoFactorEnabled": true }
```
**Response Example:**
```json
{ "twoFactorEnabled": true }
```

**Endpoint:** `/api/v1/me/sessions`  
**Method:** `GET`  
**Description:** List active sessions.  
**Request Example:**
```json
{}
```
**Response Example:**
```json
[{ "id": "sess_1", "deviceName": "Chrome on Windows", "isCurrent": true }]
```

**Endpoint:** `/api/v1/me/sessions/:sessionId`  
**Method:** `DELETE`  
**Description:** Revoke a session.  
**Request Example:**
```json
{}
```
**Response Example:**
```json
{ "message": "Session revoked successfully" }
```

### Patient Profile and Records
**Endpoint:** `/api/v1/patients/me/dashboard-summary`  
**Method:** `GET`  
**Description:** Fetch patient dashboard summary.  
**Request Example:**
```json
{}
```
**Response Example:**
```json
{ "patientId": "pat_1", "upcomingAppointmentsCount": 2 }
```

**Endpoint:** `/api/v1/patients/me/profile`  
**Method:** `GET`  
**Description:** Fetch patient profile.  
**Request Example:**
```json
{}
```
**Response Example:**
```json
{ "id": "pat_1", "firstName": "Sarah", "lastName": "Hassan" }
```

**Endpoint:** `/api/v1/patients/me/profile`  
**Method:** `PATCH`  
**Description:** Update patient profile.  
**Request Example:**
```json
{ "phone": "+20100111222", "city": "Cairo" }
```
**Response Example:**
```json
{ "id": "pat_1", "city": "Cairo" }
```

**Endpoint:** `/api/v1/patients/me/medical-profile`  
**Method:** `GET`  
**Description:** Fetch patient medical profile.  
**Request Example:**
```json
{}
```
**Response Example:**
```json
{ "bloodType": "O+", "allergies": ["Penicillin"] }
```

**Endpoint:** `/api/v1/patients/me/medical-profile`  
**Method:** `PATCH`  
**Description:** Update patient medical profile.  
**Request Example:**
```json
{ "heightCm": 170, "weightKg": 65 }
```
**Response Example:**
```json
{ "heightCm": 170, "weightKg": 65 }
```

**Endpoint:** `/api/v1/patients/me/emergency-contact`  
**Method:** `GET`  
**Description:** Fetch emergency contact.  
**Request Example:**
```json
{}
```
**Response Example:**
```json
{ "name": "Omar Hassan", "relationship": "Brother" }
```

**Endpoint:** `/api/v1/patients/me/emergency-contact`  
**Method:** `PUT`  
**Description:** Update emergency contact.  
**Request Example:**
```json
{ "name": "Omar Hassan", "phone": "+20100999888" }
```
**Response Example:**
```json
{ "name": "Omar Hassan", "phone": "+20100999888" }
```

**Endpoint:** `/api/v1/patients/me/insurance`  
**Method:** `GET`  
**Description:** Fetch insurance info.  
**Request Example:**
```json
{}
```
**Response Example:**
```json
{ "providerName": "HealthCare Co", "memberId": "M123" }
```

**Endpoint:** `/api/v1/patients/me/insurance`  
**Method:** `PUT`  
**Description:** Update insurance info.  
**Request Example:**
```json
{ "providerName": "HealthCare Co", "memberId": "M123" }
```
**Response Example:**
```json
{ "providerName": "HealthCare Co", "memberId": "M123" }
```

**Endpoint:** `/api/v1/patients/me/medical-history-summary`  
**Method:** `GET`  
**Description:** Fetch summarized medical history.  
**Request Example:**
```json
{}
```
**Response Example:**
```json
{ "allergies": ["Penicillin"], "medications": ["Aspirin"] }
```

**Endpoint:** `/api/v1/patients/me/appointments`  
**Method:** `GET`  
**Description:** List patient appointments.  
**Request Example:**
```json
{ "page": 1, "limit": 10 }
```
**Response Example:**
```json
{ "data": [{ "id": "appt_1", "doctorName": "Dr. Lina Omar", "status": "scheduled" }] }
```

**Endpoint:** `/api/v1/patients/me/appointments/upcoming`  
**Method:** `GET`  
**Description:** Fetch upcoming appointments.  
**Request Example:**
```json
{}
```
**Response Example:**
```json
[{ "id": "appt_1", "scheduledAt": "2026-04-01T10:30:00Z" }]
```

**Endpoint:** `/api/v1/patients/me/appointments/:appointmentId`  
**Method:** `GET`  
**Description:** Fetch appointment details.  
**Request Example:**
```json
{}
```
**Response Example:**
```json
{ "id": "appt_1", "status": "scheduled", "reason": "Chest pain" }
```

**Endpoint:** `/api/v1/patients/me/prescriptions`  
**Method:** `GET`  
**Description:** List patient prescriptions.  
**Request Example:**
```json
{ "page": 1, "limit": 10 }
```
**Response Example:**
```json
{ "data": [{ "id": "rx_1", "medicationName": "Aspirin", "status": "active" }] }
```

**Endpoint:** `/api/v1/patients/me/prescriptions/:prescriptionId`  
**Method:** `GET`  
**Description:** Fetch a prescription by id.  
**Request Example:**
```json
{}
```
**Response Example:**
```json
{ "id": "rx_1", "medicationName": "Aspirin", "dosage": "81mg" }
```

**Endpoint:** `/api/v1/patients/me/lab-orders`  
**Method:** `GET`  
**Description:** List patient lab orders.  
**Request Example:**
```json
{ "page": 1, "limit": 10 }
```
**Response Example:**
```json
{ "data": [{ "id": "order_1", "status": "in_progress" }] }
```

**Endpoint:** `/api/v1/patients/me/lab-results`  
**Method:** `GET`  
**Description:** List patient lab results.  
**Request Example:**
```json
{ "page": 1, "limit": 10 }
```
**Response Example:**
```json
{ "data": [{ "id": "result_1", "status": "completed" }] }
```

**Endpoint:** `/api/v1/patients/me/lab-results/:resultId`  
**Method:** `GET`  
**Description:** Fetch a lab result by id.  
**Request Example:**
```json
{}
```
**Response Example:**
```json
{ "id": "result_1", "status": "completed", "values": [] }
```

## Database Design
The backend is not part of this repository, but the frontend types and API usage imply the following data model:
- Users: common identity table containing `id`, `email`, `role`, `name`, `phone`, `passwordHash`, `avatarUrl`.
- Patients: one-to-one with Users, containing demographics and profile data.
- Doctors: one-to-one with Users, containing specialty, professional profile, and availability.
- Labs: one-to-one with Users or a standalone entity, containing lab profile data.
- LabBranches: one-to-many from Labs.
- LabServices: one-to-many from Labs.
- AppointmentRequests: patient-to-doctor request entity with status and messages.
- TestRequests: patient-to-lab request entity with status and messages.
- Appointments: scheduled doctor visits, linked to patient and doctor.
- Prescriptions: issued by doctors, linked to patients and appointments.
- LabOrders: created from test requests and linked to labs and patients.
- LabResults: linked to lab orders and patients, containing values and attachments.
- Notifications: linked to users for alerts and reminders.
- Sessions: active user sessions and device metadata.
- Reviews: patient feedback for doctors.
- Messages: chat-like messages attached to request threads.

## Authentication and Authorization
- Auth token stored in localStorage under `tabeebak_auth`.
- Authenticated API requests include `Authorization: Bearer <token>`.
- `AuthProvider` bootstraps session by calling `/api/v1/auth/me` to retrieve role and profile.
- `ProtectedRoute` restricts access to role-based routes and redirects to the correct dashboard.
- Logout clears local storage and cached queries.

## Setup and Installation
Prerequisites:
- Node.js 18+ recommended
- npm (or an equivalent package manager)

Installation commands:
```bash
npm install
```

Run the development server:
```bash
npm run dev
```

Build for production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

Environment variables:
- The API base URL is currently hard-coded in `src/services/api.ts` as `http://localhost:5000`.
- To use a different backend URL, update `API_BASE_URL` or refactor to use `import.meta.env` with a `VITE_API_BASE_URL` variable.

## Usage
- Register as a patient, then sign in to access the patient dashboard.
- Patients can search doctors or labs, create appointment/test requests, and monitor progress.
- Doctors review appointment requests, manage appointments, and view patient summaries.
- Labs process test orders, upload results, and manage branches/services.
- Users can update profile details, notification preferences, and security settings under account settings.

## Known Issues / Limitations
- Backend implementation is not included in this repository, so API responses are assumed.
- API base URL is hard-coded, which limits environment flexibility.
- Authentication uses localStorage and does not include refresh-token handling in the frontend.
- No automated tests are present in the codebase.

## Future Improvements
- Introduce environment-based configuration for API URLs and feature flags.
- Add E2E and unit tests for critical flows.
- Implement refresh token handling and stronger session management.
- Add API response schemas and runtime validation using Zod for all services.
- Expand role-based access controls (for example, Admin portal) in the UI.

## Conclusion
Tabeebak is a comprehensive healthcare portal frontend with distinct experiences for patients, doctors, and labs. It centralizes discovery, booking, and care management into one interface, and is designed to integrate with a backend API for real-time medical workflows.

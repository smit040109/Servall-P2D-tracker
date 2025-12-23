# **App Name**: Servall P2D Tracker

## Core Features:

- Campaign Management: Admin dashboard for creating campaigns, generating QR codes (SVG format), and associating them with specific branches.
- Lead Capture: Public lead form for capturing customer details (Name, Phone, Vehicle). Upon submission, a new lead is created with status 'pending' in Firestore.
- OTP Verification: Trigger Firebase Cloud Function to send a 6-digit OTP to the customer's phone upon request from the Branch User. Utilizes Firebase Authentication for secure verification.
- Encashment Workflow: Branch users can lookup leads by phone number and mark leads as 'encashed' after OTP verification.
- Role-Based Access Control: Secure access to the platform for Admins and Franchise Partners with distinct dashboards and capabilities (using Firebase Authentication).
- Analytics Dashboard: Real-time analytics counter for each Franchise: [Total Scans] vs [Total Leads] vs [Successfully Encashed].

## Style Guidelines:

- Primary color: Red (#FF0000) to evoke trust and reliability, crucial in automotive services.
- Background color: White (#FFFFFF) to provide a clean and professional backdrop.
- Accent color: Red (#FF0000) for key actions and highlights, adding a touch of modernity.
- Body and headline font: 'Inter', a versatile sans-serif for readability and a modern feel.
- Use automotive-themed icons to represent the different features and data points.
- Clean and structured layout with clear visual hierarchy, prioritizing essential information for different user roles.
- Subtle transitions and loading animations to provide feedback without being distracting.
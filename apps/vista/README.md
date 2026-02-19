This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Features

### NFC Card Manager

The NFC Card Manager provides a comprehensive interface for managing NFC card enrollments with the following features:

- **Real-time NFC Scanning**: Automatic detection and processing of NFC card scans
- **User Management**: Complete CRUD operations for enrolled users
- **Advanced Filtering**: Filter users by name, phone, address, and preference
- **Search Functionality**: Quick search across all user data
- **Total Count Display**: 
  - Shows total enrolled users count
  - Displays filtered results count when search or filters are active
  - Accessible with ARIA live regions for screen readers
- **Scan History Tracking**: Automatic visit tracking for each card scan
- **Export Functionality**: Export contact data to CSV format
- **Responsive Design**: Optimized for desktop and mobile viewing

#### Accessibility

The NFC manager viewer is built with accessibility in mind:
- ARIA labels for all interactive elements
- Live regions for dynamic count updates
- Keyboard navigation support
- High contrast color scheme (#E1D6C7 on #1a0505 background)

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

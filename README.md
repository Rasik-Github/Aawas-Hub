# Real Estate Platform - Setup Guide

## Prerequisites
- Node.js 18+ and npm
- MongoDB Atlas account or local MongoDB instance
- GitHub account (optional, for OAuth)
- Google Cloud account (optional, for OAuth)

## Installation Steps

### 1. Clone the Repository
```bash
git clone <repository-url>
cd awas-hub
```

### 2. Install Dependencies
```bash
bun install
```

### 3. Set Up Environment Variables
Copy `.env.example` to `.env.local` and fill in your configuration:

```bash
cp .env.example .env.local
```

**Required Variables:**
- `BETTER_AUTH_SECRET`: Generate using `openssl rand -base64 32`
- `BETTER_AUTH_URL`: http://localhost:3000 for development
- `MONGODB_URI`: Your MongoDB connection string

**Optional OAuth Setup:**
For Google OAuth:
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add `http://localhost:3000` as authorized redirect URI

For GitHub OAuth:
1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Create a new OAuth App
3. Set Authorization callback URL to `http://localhost:3000/api/auth/callback/github`

### 4. Initialize Database
```bash
bun run db:init
```

This will create all necessary MongoDB collections with proper indexes.

### 5. Run Development Server
```bash
bun dev
```

Visit http://localhost:3000 to see your application.

## Project Structure

```
awaas-hub/
├── app/
│   ├── (auth)/               # Authentication pages
│   │   ├── login/
│   │   └── signup/
│   ├── api/                  # API routes
│   │   ├── auth/
│   │   ├── properties/
│   │   ├── favorites/
│   │   ├── appointments/
│   │   ├── admin/
│   │   └── user/
│   ├── dashboard/            # Main dashboard
│   ├── buyer/                # Buyer pages
│   ├── seller/               # Seller pages
│   ├── admin/                # Admin pages
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx              # Homepage
├── lib/
│   ├── auth.ts               # Better Auth configuration
│   ├── auth-client.ts        # Client auth instance
│   └── db.ts                 # MongoDB connection
├── types/
│   └── index.ts              # TypeScript types
├── components/
│   └── session-provider.tsx
└── middleware.ts             # Route protection
```

## User Roles

### Buyer
- Browse available properties
- Save favorite properties
- Schedule property viewings
- View appointment history

### Seller
- List and manage properties
- View buyer inquiries
- Manage appointments
- Access listing analytics

### Admin
- Manage all users
- Monitor all properties
- View platform-wide analytics
- User role management

## Database Schema

### Collections

**user**
- id (string, unique)
- email (string, unique)
- name (string)
- image (string, optional)
- role (enum: buyer, seller, admin)
- createdAt (date)

**properties**
- _id (ObjectId)
- title (string)
- description (string)
- price (number)
- location (string)
- city (string)
- state (string)
- zipCode (string)
- bedrooms (number)
- bathrooms (number)
- area (number)
- amenities (array)
- images (array)
- sellerId (string)
- status (enum: available, pending, sold)
- createdAt (date)

**favorites**
- _id (ObjectId)
- userId (string)
- propertyId (string)
- createdAt (date)

**appointments**
- _id (ObjectId)
- propertyId (string)
- buyerId (string)
- sellerId (string)
- date (date)
- notes (string)
- status (enum: pending, confirmed, cancelled)
- createdAt (date)

## Deployment

### Deploy to Vercel
```bash
vercel deploy
```

Before deploying, set environment variables in Vercel project settings.

### Deploy to Other Platforms
Make sure to set all environment variables in your hosting platform's configuration.

## Troubleshooting

### MongoDB Connection Issues
- Verify MongoDB URI is correct
- Check MongoDB Atlas IP whitelist includes your IP
- Ensure database name in URI matches your MongoDB setup

### Better Auth Issues
- Clear browser cookies and try again
- Verify BETTER_AUTH_SECRET is at least 32 characters
- Check BETTER_AUTH_URL matches your domain

### OAuth Not Working
- Verify callback URLs match exactly (including protocol and domain)
- Check client ID and secret are correct
- Ensure OAuth app is published (GitHub requirement)

## Support

For issues or questions:
1. Check the [Better Auth documentation](https://www.better-auth.com)
2. Review MongoDB documentation
3. Create an issue in the repository

## License

MIT License - See LICENSE file for details


## Project Information

This project was developed as part of a group academic assignment focused on building a full-stack real estate management platform. 
**Team Members:** 
- Rasik Bhattarai
- Rabindra Basnet 
- Sudip Pathak
- Prasidha Nepal

**My Contribution**
- Developed frontend components, including key user interface pages and reusable UI elements
- Implemented property management features such as property listing display and related UI functionalities
- Contributed to backend functionality by assisting in API development and feature integration
- Contributed in MongoDB database design, including structuring collections and defining data models
- Integrated frontend and backend components to ensure smooth data flow across the application
- Involved in debugging, testing, and improving overall application performance and stability

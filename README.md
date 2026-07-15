# Vitalis — AI Health Coach

A personal AI fitness coach with meal photo analysis, workout planning, habit tracking, and conversational AI coaching.

## Features

- **Meal Photo Analysis**: Log meals effortlessly with AI-powered nutrition analysis using the Gemini API.
- **Workout Planning**: Create and manage personalized workout routines.
- **Habit Tracking**: Build consistency by tracking your daily goals and maintaining streaks.
- **Conversational AI Coaching**: Get personalized advice, motivation, and insights based on your fitness data, powered by Groq and Llama 3.
- **Voice Playback**: Listen to your coach's advice with ResponsiveVoice integration.

## Tech Stack

- **Frontend**: Next.js 14+ (App Router), React, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **AI Integration**: Gemini 1.5 Flash (vision), Groq (fast inference), Llama 3 70B
- **Text-to-Speech**: ResponsiveVoice
- **Styling**: Fredoka & Zodiak (personal-use) fonts

## Setup Instructions

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/vitalis.git
cd vitalis
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env.local` file based on the `.env.example`:
```bash
cp .env.example .env.local
```
Fill in the required values:
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key
- `GEMINI_API_KEY`: Your Google Gemini API key
- `GROQ_API_KEY`: Your Groq API key
- `RESPONSIVE_VOICE_KEY`: Your ResponsiveVoice API key

### 4. Supabase Setup
Run the provided `supabase/schema.sql` script in your Supabase project's SQL Editor to set up the necessary tables, Row Level Security (RLS) policies, and storage buckets.

### 5. Run the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the app.

## Deployment Guide

Vitalis is optimized for deployment on Vercel.

1. Push your code to a GitHub repository.
2. Log in to Vercel and create a new project.
3. Import your GitHub repository.
4. In the "Environment Variables" section, add all the keys from your `.env.local` file.
5. Set the build command to `npm run build` and output directory to `.next` (these are default for Next.js).
6. Click "Deploy".

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
*(Note: The Zodiak font from Fontshare is for personal use only.)*

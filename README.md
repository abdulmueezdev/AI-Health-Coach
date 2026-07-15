<div align="center">
  <div style="width: 80px; height: 80px; background-color: #F87171; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
    <span style="color: white; font-size: 40px; font-weight: bold; font-family: sans-serif;">V</span>
  </div>
  <h1 align="center">Vitalis</h1>
  <p align="center"><strong>Your Personal AI Fitness & Health Coach</strong></p>

  <p align="center">
    <a href="https://vitalis.vercel.app"><img src="https://img.shields.io/badge/Live%20Demo-Vercel-black?style=flat-square&logo=vercel" alt="Live Demo"></a>
    <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square" alt="License"></a>
    <img src="https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js" alt="Next.js">
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript">
    <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white" alt="Supabase">
  </p>
</div>

<br />

Vitalis is a comprehensive fitness tracking and AI coaching web app. Snap meal photos for immediate nutritional estimates, manage workouts, track daily habits, and get personalized voice-enabled coaching from an AI that knows your health history.

---

## ✨ Features

| Feature | Description | Tech |
| :--- | :--- | :--- |
| 📸 **Meal Photo Analysis** | Snap a photo, get calorie/macro estimates | Gemini 1.5 Flash Vision |
| 🏋️ **Workout Planning** | Create routines, track sets/reps | Supabase + Next.js |
| ✅ **Habit Tracking** | Daily habits with streaks | PostgreSQL RLS |
| 🤖 **AI Coach Chat** | Personalized coaching from your data | Groq Llama 3 |
| 🔊 **Voice Playback** | Listen to coach responses | ResponsiveVoice |
| 📱 **Mobile-First** | Responsive 3-zone desktop, bottom nav mobile | Tailwind + Framer Motion |

*(Replace with a screenshot of your dashboard!)*
> ![Vitalis Dashboard Placeholder](https://via.placeholder.com/800x450.png?text=Vitalis+Dashboard+Preview)

---

## 🛠️ Tech Stack

- **Frontend**: [Next.js 14+](https://nextjs.org/) (App Router), React, [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS](https://tailwindcss.com/)
- **Backend & Auth**: [Supabase](https://supabase.com/) (PostgreSQL + Auth + Storage)
- **AI Vision**: [Google Gemini 1.5 Flash](https://ai.google.dev/)
- **AI Chat/Inference**: [Groq](https://groq.com/) (Llama 3 70B)
- **Text-to-Speech**: [ResponsiveVoice](https://responsivevoice.org/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Typography**: Fredoka & Zodiak fonts

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- A Supabase Project
- API Keys for Gemini, Groq, and ResponsiveVoice

### 1. Clone & Install
```bash
git clone https://github.com/yourusername/vitalis.git
cd vitalis
npm install
```

### 2. Environment Setup
Copy the environment template:
```bash
cp .env.example .env.local
```

### 3. Database Setup
Run the SQL script located at `supabase/schema.sql` within your Supabase project's SQL Editor to create tables, storage buckets, and RLS policies.

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view it in the browser!

---

## 📂 Project Structure

```text
vitalis/
├── src/
│   ├── app/              # Next.js App Router pages
│   ├── components/       # Reusable UI components & Layouts
│   ├── lib/              # Utility functions & helpers
│   ├── server/           # Server actions & DB services
│   └── types/            # TypeScript interface definitions
├── supabase/
│   └── schema.sql        # DB schemas, RLS, and functions
├── public/               # Static assets
└── tailwind.config.ts    # Tailwind themes & colors
```

---

## 🔒 Security & Privacy

Vitalis utilizes strict privacy measures out of the box:
- **Row Level Security (RLS)**: Every user's data is heavily guarded at the PostgreSQL level. Users can only fetch, insert, update, or delete rows matching their own `user_id`.
- **No-Doxing Coaching**: AI interactions are sanitized. Personal identifiers (like real names and user IDs) are stripped out in `coach-context.ts` before prompts are sent to Groq and Gemini.
- **Private Data Storage**: All workout, meal, and habit logs remain private exclusively to the account holder.

---

## 🧪 Testing
To verify a clean build before deployment:
```bash
npm run build
```

---

## ☁️ Deployment (Vercel)

Vitalis is optimized for Vercel. 

1. Push your repository to GitHub.
2. Import the project in Vercel.
3. Configure the following variables in the **Environment Variables** section:

| Variable | Source |
| :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → API (secret) |
| `GEMINI_API_KEY` | Google AI Studio |
| `GROQ_API_KEY` | Groq Console |
| `RESPONSIVE_VOICE_KEY` | ResponsiveVoice.org |

4. Deploy!

---

## 🗺️ Roadmap

- [x] Core dashboard & auth
- [x] Meal photo analysis (Gemini Vision)
- [x] Workout & habit tracking
- [x] AI coach with memory (Groq)
- [x] Voice playback
- [ ] Supabase Storage signed URLs for photos
- [ ] Push notifications for habit reminders
- [ ] Data export (CSV/JSON)
- [ ] Dark mode
- [ ] PWA support

---

## 🤝 Contributing
Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**. 

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

[MIT](LICENSE) © 2026 Vitalis

> **Note**: The Zodiak font is used under Fontshare's personal-use license. For commercial use, purchase a license or substitute with an open alternative.

<br/>
<div align="center">
  <p>Built with ❤️ for better health and fitness.</p>
</div>

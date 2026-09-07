# Story App (Interactive Investigation)

An immersive, web-based interactive storytelling and investigation experience built with modern web technologies. This project blends atmospheric audio, procedural generation, and dynamic React components to create a unique narrative environment.

## 🚀 Tech Stack

- **Framework:** Next.js (App Router)
- **UI Library:** React 19
- **Styling:** Tailwind CSS v4
- **Animations:** Framer Motion
- **Components:** Radix UI / shadcn/ui
- **Audio Engine:** Custom Procedural Web Audio API engine
- **State Management:** Zustand
- **Database (Optional):** Prisma

## ✨ Key Features

- **Procedural Audio Engine:** A custom-built Web Audio API integration (`src/lib/audio.ts` & `src/lib/narration-audio.ts`) that dynamically generates ambient sounds, room tone, low-pass filters, and "gravel" effects without relying on heavy external audio assets.
- **Interactive Evidence Board:** A pinboard-style interface where users can interact with notes, maps, and receipt cards.
- **Atmospheric UI:** Uses grain overlays, typewriter text effects, custom magnifier cursors, and smooth scrolling to enhance immersion.
- **Dynamic Narration:** Text-to-speech integration with pitch shifting and audio filters for character dialogue.

## 🛠️ Getting Started

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/pvndr/story-app.git
   cd story-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📦 Deployment

This project is fully configured and optimized for deployment on **Vercel**. 

1. Push your code to GitHub.
2. Import the repository into your Vercel dashboard.
3. Vercel will automatically detect the Next.js framework and build the project using the standard `next build` command.

## 📂 Project Structure

- `src/app/`: Next.js App Router pages and API routes.
- `src/components/investigation/`: The core interactive storytelling components (Evidence Board, Audio Interviews, Atmosphere Layers).
- `src/components/ui/`: Reusable, accessible UI components built with Radix and Tailwind.
- `src/lib/`: Core utilities, including the procedural audio engine and state management.
- `public/`: Static assets like evidence images and logos.

## 📜 License

This project is licensed under the MIT License.

# LNAT Practice Platform

A web-based application to help students prepare for the LNAT (Law National Aptitude Test) multiple choice section, with AI-powered content generation and authentic test simulation.

## Features

### Phase 1 (MVP) - ✅ Complete

- **Topic Selection**: Choose from 8 LNAT-relevant topics or select all topics
- **Practice Mode**: Single passage practice with immediate feedback
- **Mock Test Mode**: Full 42-question simulation with 95-minute timer
- **AI Content Generation**: Passages and questions generated using Google AI Studio or DeepSeek
- **Authentic LNAT Experience**: 
  - 3-4 questions per passage
  - 5 multiple choice options (A, B, C, D, E)
  - No ability to review previous questions in mock test
  - Question flagging system
- **Results & Feedback**: 
  - Detailed performance analysis
  - Optional AI-generated feedback
  - Cost tracking for API usage
- **Session Management**: Local storage for current sessions only

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- API key from either:
  - [Google AI Studio](https://aistudio.google.com/) (Gemini 2.0 Flash)
  - [DeepSeek](https://api.deepseek.com/) (DeepSeek V3)

### Installation

1. Clone and navigate to the project:
   ```bash
   cd lnat-practice
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Usage

1. **Select Topics**: Choose which LNAT topics you want to practice
2. **Choose Mode**:
   - **Practice Mode**: Single passage with immediate feedback
   - **Mock Test Mode**: Full 95-minute test simulation
3. **API Configuration**: Enter your API key when prompted
4. **Take the Test**: Answer questions and receive results
5. **Get Feedback**: Optional AI-generated performance analysis

## API Costs

- **Practice Mode**: ~$0.01-0.02 per passage
- **Mock Test Mode**: ~$0.20-0.50 for full test generation
- **Feedback**: ~$0.005-0.01 per request

DeepSeek is generally more cost-effective than Google AI Studio.

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── page.tsx           # Home page with topic/mode selection
│   ├── practice/          # Practice mode page
│   └── mock-test/         # Mock test mode page
├── components/            # React components
│   ├── ui/                # Reusable UI components
│   ├── TopicSelector.tsx  # Topic selection interface
│   ├── ModeSelector.tsx   # Practice/mock mode selection
│   ├── PassageDisplay.tsx # Passage rendering component
│   ├── QuestionInterface.tsx # Question and answer interface
│   └── Timer.tsx          # Mock test countdown timer
├── lib/                   # Utility functions
│   ├── llm/               # LLM provider integrations
│   ├── session.ts         # Session management
│   └── passages.ts        # Local passage bank
├── types/                 # TypeScript type definitions
└── public/passages/       # Sample passages (JSON format)
```

## Technology Stack

- **Framework**: Next.js 15+ with TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context/useState
- **Storage**: Local Storage (no database)
- **AI Providers**: Google AI Studio, DeepSeek
- **Deployment**: Ready for Vercel

## LNAT Compliance

The platform follows authentic LNAT specifications:

- ✅ 95-minute time limit (not 90 minutes as commonly misunderstood)
- ✅ 42 total questions across 12 passages
- ✅ 3-4 questions per passage (sometimes 5)
- ✅ 5 answer options (A, B, C, D, E)
- ✅ No reviewing previous questions during test
- ✅ Topics: Politics, philosophy, science, history, technology, ethics, literature, current affairs
- ✅ Question types: Argument analysis, interpretation, literary style
- ✅ No specific legal knowledge required

## Development

### Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Key Components

- **Session Management**: Handles test state, progress, and cost tracking
- **LLM Integration**: Modular provider system supporting multiple AI services
- **Timer System**: Accurate countdown with visual indicators
- **Question Navigation**: Authentic LNAT-style forward-only progression
- **Results Analysis**: Detailed performance breakdown with optional AI feedback

## Future Enhancements (Phase 2)

- User account system with progress tracking
- Database integration (PostgreSQL/MongoDB)
- Performance analytics over time
- Difficulty levels and adaptive testing
- Enhanced passage bank with web scraping
- Export results functionality
- Spaced repetition system

## License

This project is for educational purposes only. Not affiliated with LNAT or LSAC.

## Support

For issues or questions, please check the console for error messages and ensure your API key is valid and has sufficient credits.

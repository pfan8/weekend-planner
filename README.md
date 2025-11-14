# AI Chat

A modern, fully-featured AI chat application built with React, TypeScript, and Tailwind CSS, deployed on Cloudflare Pages with serverless API endpoints powered by Cloudflare Workers.

## Features

- 💬 **Real-time Chat Interface** - Clean, intuitive chat UI similar to ChatGPT and Claude
- 🤖 **OpenAI Integration** - Powered by OpenAI's GPT models
- 🌓 **Dark/Light Theme** - Toggle between dark and light modes
- 💾 **Persistent Storage** - Conversations are saved locally in the browser
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile devices
- 📝 **Markdown Support** - Full Markdown rendering including code blocks with syntax highlighting
- ⚡ **Serverless Backend** - API powered by Cloudflare Workers
- 🚀 **Automatic Deployment** - GitHub Actions CI/CD integration

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Build Tool**: Vite
- **State Management**: Zustand
- **Markdown**: react-markdown with syntax highlighting
- **Backend**: Cloudflare Workers + Pages Functions
- **Deployment**: Cloudflare Pages
- **CI/CD**: GitHub Actions

## Prerequisites

- Node.js 18+ and npm
- OpenAI API Key (get from [platform.openai.com](https://platform.openai.com/api-keys))
- Cloudflare account with Pages enabled
- GitHub account

## Local Development

### 1. Clone the repository

```bash
git clone https://github.com/pfan8/ai-chat.git
cd ai-chat
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Then edit `.env.local` and add your OpenAI API Key:

```
OPENAI_API_KEY=your_actual_api_key_here
```

### 4. Run the development server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Project Structure

```
ai-chat/
├── src/
│   ├── components/
│   │   ├── Chat/          # Chat interface components
│   │   ├── Sidebar/       # Conversation management sidebar
│   │   ├── Common/        # Common components (Header, ThemeToggle)
│   │   └── Markdown/      # Markdown rendering components
│   ├── hooks/             # Custom React hooks
│   ├── store/             # Zustand state management
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions and API calls
│   ├── App.tsx            # Main app component
│   ├── main.tsx           # Entry point
│   └── index.css          # Global styles
├── functions/
│   └── api/
│       └── chat.ts        # Cloudflare Workers API function
├── public/                # Static assets
├── .github/
│   └── workflows/
│       └── deploy.yml     # GitHub Actions deployment workflow
├── tailwind.config.js     # Tailwind CSS configuration
├── vite.config.ts         # Vite configuration
└── wrangler.toml          # Cloudflare Pages configuration
```

## Building

Build the project for production:

```bash
npm run build
```

The compiled files will be in the `dist/` directory.

## Deployment

### Cloudflare Pages Setup

1. **Create a new Cloudflare Pages project**:
   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
   - Navigate to Pages > Create a project
   - Connect your GitHub repository

2. **Configure build settings**:
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Root directory: `/`
   - Node.js version: 18 LTS

3. **Set environment variables** in Cloudflare Pages settings:
   - Add `OPENAI_API_KEY` with your OpenAI API key

4. **GitHub Actions setup** (for automatic deployments):
   - Add these secrets to your GitHub repository:
     - `CLOUDFLARE_API_TOKEN` - Get from Cloudflare account
     - `CLOUDFLARE_ACCOUNT_ID` - Your Cloudflare account ID

5. **Deploy**:
   - Push to the `main` branch
   - GitHub Actions will automatically build and deploy to Cloudflare Pages

## Usage

### Starting a Chat

1. Click "New Chat" in the sidebar to start a new conversation
2. Type your message in the input box at the bottom
3. Press Enter (Shift+Enter for newline) or click the send button to send your message
4. The AI will respond with generated content

### Managing Conversations

- **View history**: All conversations are listed in the left sidebar
- **Switch conversations**: Click on any conversation to switch to it
- **Delete conversation**: Hover over a conversation and click the trash icon
- **Theme toggle**: Click the sun/moon icon in the header to switch themes

### Keyboard Shortcuts

- **Enter**: Send message
- **Shift+Enter**: Add a newline without sending
- All conversations are automatically saved to browser localStorage

## API Reference

### Chat API Endpoint

**POST** `/api/chat`

Request body:
```json
{
  "messages": [
    { "role": "user", "content": "Hello!" },
    { "role": "assistant", "content": "Hi there!" },
    { "role": "user", "content": "How are you?" }
  ]
}
```

Response:
```
The assistant's response text
```

## Configuration Files

### tailwind.config.js
Tailwind CSS configuration with custom colors, animations, and plugin settings.

### vite.config.ts
Vite build configuration optimized for React development.

### wrangler.toml
Cloudflare Pages configuration for deploying to Pages and Functions.

### .github/workflows/deploy.yml
GitHub Actions workflow that automatically builds and deploys to Cloudflare Pages on push to main branch.

## Troubleshooting

### API calls are failing with 401 error
- Check that `OPENAI_API_KEY` is correctly set in your Cloudflare Pages environment variables
- Ensure your OpenAI API key is valid and has sufficient balance

### Deployments are failing
- Check GitHub Actions workflow logs for specific errors
- Verify `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` secrets are set correctly
- Ensure your Cloudflare account has Pages enabled

### Messages not saving
- Clear browser localStorage: `localStorage.clear()` in console
- The app requires localStorage permission to save conversations

## Performance Optimization

The app includes several optimizations:
- **Code splitting**: Lazy loading of components
- **CSS optimization**: Tailwind CSS purges unused styles
- **Image optimization**: Static assets are optimized by Vite
- **Scrollbar styling**: Custom thin scrollbar for better UX

## Future Enhancements

- [ ] Message streaming (real-time token-by-token display)
- [ ] Multi-model selection (GPT-4, Claude, etc.)
- [ ] Conversation export (PDF, Markdown)
- [ ] Message editing and regeneration
- [ ] Voice input/output
- [ ] User authentication and cloud sync
- [ ] Prompt templates and suggestions

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Support

If you encounter any issues, please open an issue on [GitHub Issues](https://github.com/pfan8/ai-chat/issues).

## Acknowledgments

- Built with [React](https://react.dev/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Deployed on [Cloudflare Pages](https://pages.cloudflare.com/)
- Icons from [Lucide React](https://lucide.dev/)
- Markdown rendering with [react-markdown](https://github.com/remarkjs/react-markdown)

# 1to99 Web Frontend

A real-time multiplayer number guessing game web application built with React, Vite, and WebSocket.

## 🎮 Game Description

1to99 is a competitive multiplayer guessing game where players take turns trying to avoid guessing a secret number between 1 and 99. The game provides feedback to narrow down the range with each guess. The objective is to force other players to guess the secret number - whoever guesses the exact secret number loses the game!

## 🔧 Technologies Used

### Core Stack
- **React 19.1.1** - Modern JavaScript library for building user interfaces
- **Vite 7.1.7** - Next generation frontend tooling for fast development
- **React Router DOM 7.9.3** - Declarative routing for React applications

### Real-time Communication
- **@stomp/stompjs 7.2.0** - STOMP protocol client for WebSocket communication
- **sockjs-client 1.6.1** - WebSocket client library with fallback support

### UI Components
- **react-qr-code 2.0.18** - QR code generation for easy room sharing

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation & Running

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd 1to99-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env` file in the root directory:
   ```env
   VITE_WS_MODE=local
   VITE_WS_URL_LOCAL=http://localhost:8080
   VITE_WS_URL_NGROK=https://your-ngrok-url.ngrok.io
   VITE_WS_URL_PRODUCTION=https://1to99-backend.zhengjie.app
   ```

   **🌐 Quick Start with Live Backend**

   Want to test immediately without setting up your own backend? Use our hosted backend:
   ```env
   VITE_WS_MODE=production
   VITE_WS_URL_PRODUCTION=https://1to99-backend.zhengjie.app
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

6. **Preview production build**
   ```bash
   npm run preview
   ```

### Environment Configuration

The app supports different WebSocket connection modes:
- **Local Mode**: Connects to local backend (`localhost:8080`)
- **Ngrok Mode**: Connects to external backend via ngrok tunnel
- **Production Mode**: Connects to live hosted backend

Configure via the `VITE_WS_MODE` environment variable.

## 🎯 App Features

### Core Game Features
- **Room Creation & Joining**: Create private game rooms or join existing ones
- **QR Code Integration**: Display QR codes for easy room sharing
- **Real-time Multiplayer**: Synchronized gameplay across all devices
- **Turn-based Guessing**: Visual turn indicators and guess validation
- **Range Display**: Clear visualization of remaining number range
- **Game History**: Track of all guesses made during the game

### User Experience Features
- **Persistent Player Names**: Automatically saves and restores player names via localStorage
- **Responsive Design**: Optimized layouts for different screen sizes
- **Error Handling**: User-friendly error messages and recovery options
- **Auto-navigation**: Automatic screen transitions based on game state

### Host Features
- **Player Management**: Remove disruptive players from games
- **Game Controls**: Start, restart, and manage game sessions

## 📱 Screen Navigation

The app uses React Router with the following screen structure:

```
🌐 App Navigation
├── / (MENU) - Main menu (create/join room)
├── /lobby (LOBBY) - Waiting room before game starts
├── /play (PLAYING) - Active gameplay screen
└── /finished (FINISHED) - Game results and restart options
```

Navigation is automatically managed based on WebSocket game state updates.

## 📁 Project Structure

```
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── Background.jsx  # Gradient background component
│   │   ├── Board.jsx       # Game board container
│   │   ├── Button.jsx      # Custom button component
│   │   └── Header.jsx      # Styled header text
│   ├── context/
│   │   └── GameContext.jsx # Global game state management
│   ├── screens/            # App screens/pages
│   │   ├── MainMenu.jsx    # Main menu screen
│   │   ├── GameLobby.jsx   # Pre-game lobby
│   │   ├── GamePlay.jsx    # Main gameplay screen
│   │   └── GameFinished.jsx # Post-game results
│   ├── services/
│   │   └── WebSocketService.js # WebSocket communication layer
│   ├── styles/             # CSS styling files
│   │   ├── colors.js       # Color palette
│   │   ├── Button.css
│   │   ├── Header.css
│   │   ├── Board.css
│   │   ├── Background.css
│   │   ├── MainMenu.css
│   │   ├── GameLobby.css
│   │   ├── GamePlay.css
│   │   └── GameFinished.css
│   ├── App.jsx            # Main app component with routing
│   ├── App.css            # Global styles
│   └── main.jsx           # App entry point
├── .env                   # Environment variables (not committed)
├── .env.example           # Example environment variables
├── package.json
├── vite.config.js
└── index.html
```

## 🎨 Design Features

- **Custom Typography**: Google Fonts integration (Days One, Poppins)
- **Consistent Color Scheme**: Unified color palette across all screens
- **Responsive Layouts**: Adapts to different screen sizes and orientations
- **Smooth Transitions**: CSS-based animations for better UX
- **Modern UI**: Clean and intuitive interface design

## 🌐 WebSocket Implementation

### Connection Flow

1. App launches → WebSocket service connects to backend `/ws` endpoint
2. Service subscribes to general topics for initial communication
3. User actions trigger specific subscriptions (room topics, user topics)

### Message Topics Structure

- **`/topic/room.{roomId}`** - Room-specific updates (all players)
- **`/topic/user.{playerId}`** - Personal messages (individual player)
- **`/user/queue/gameUpdate`** - Personal queue for direct messages
- **`/topic/gameResponse`** - General game responses

### Key Features Enabled by WebSockets

- **Instant Game Updates**: All players see moves immediately
- **Live Player Management**: Real-time join/leave notifications
- **Synchronized Game State**: Countdown timers, turn indicators, range updates
- **Host Controls**: Real-time player removal and game restart
- **Connection Status**: Live connection health indicators

## 🔗 Related Projects

This web frontend works in conjunction with the **1to99 Backend** - a Spring Boot application that provides the WebSocket server and game logic.

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Key Differences from Mobile App

- Uses **localStorage** instead of AsyncStorage for persistence
- Uses **CSS** instead of React Native StyleSheet
- Uses **React Router** instead of React Navigation
- Uses **standard HTML elements** instead of React Native components
- No camera/QR scanning functionality (displays QR codes instead)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🐛 Troubleshooting

### Common Issues

**WebSocket Connection Failed:**
- Ensure backend server is running
- Check network connectivity
- Verify WebSocket URL configuration in `.env`

**App Won't Start:**
- Clear Vite cache: `rm -rf node_modules/.vite`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check Node.js version compatibility

**Routing Issues:**
- Ensure React Router is properly configured
- Check browser console for navigation errors
- Verify all routes are defined in App.jsx

# TripCraft

A full-stack MERN travel planner for creating, managing, and exploring custom trip itineraries. TripCraft lets users plan trips, manage activities, and access travel tips—all in a modern, responsive single-page application.

## Key Features

* Create, view, edit, and delete trips and itineraries
* User registration and login
* RESTful API with proper HTTP status codes
* Responsive React frontend with client-side routing
* MongoDB database integration
* Form validation and error handling
* Travel safety tips and phrase translation via microservices

## Live Demo

Try out the app: [TripCraft Travel Planner](https://tripcraft.netlify.app)

* Frontend deployed on Netlify
* Backend REST API hosted on Render (https://tripcraft.onrender.com)
* Note: Backend may take a few seconds to wake up if inactive

## Tech Stack

### Frontend:
* React 18 (functional components & hooks)
* React Router DOM
* Create React App
* Custom CSS

### Backend:
* Node.js with Express.js
* MongoDB with Mongoose
* RESTful API architecture
* ES6+ modules, async/await

### Microservices:
* Safety tips, phrase translation, and PDF export

## Skills Demonstrated

* React hooks (useState, useEffect, useNavigate)
* Client-side routing
* State management and form handling
* Responsive CSS
* RESTful API design
* Express.js middleware and routing
* MongoDB operations with Mongoose
* Input validation and error handling
* CORS configuration for full-stack integration
* Async/await for promise handling

## Getting Started

### Prerequisites

* Node.js (v16+)
* MongoDB (local or Atlas)
* npm

### Installation

```bash
git clone https://github.com/mmfclarke/tripcraft.git
cd tripcraft
```

### Backend setup

```bash
cd backend
npm install
# Add your MongoDB connection string to .env
npm start
```

### Frontend setup

```bash
cd frontend
npm install
npm start
# Open http://localhost:3000
```

## Environment Variables

### Backend `.env`:

```env
PORT=10000
MONGODB_CONNECTION_STRING=your_mongodb_connection_string
```

### Frontend (Netlify):

```env
REACT_APP_API_URL=https://tripcraft.onrender.com
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Register new user |
| POST | `/login` | User login |
| POST | `/trips` | Create new trip |
| GET | `/trips?username=USERNAME` | Get all trips for user |
| GET | `/trips/:id` | Get trip by ID |
| PUT | `/trips/:id` | Update trip |
| DELETE | `/trips/:id` | Delete trip |
| POST | `/trips/:id/itinerary-suggestions` | Get itinerary suggestions |
| POST | `/trips/:id/safety-tips` | Get safety tips |
| POST | `/api/phrases/translate` | Translate travel phrases |
| POST | `/api/trips/:id/export` | Export trip as PDF |

## Project Structure

```
├── backend/
│   ├── server.js                # Express server and API routes
│   └── .env                     # Environment config
├── frontend/
│   ├── src/
│   │   ├── components/          # React components
│   │   └── App.js               # Main app component
│   └── package.json
└── README.md
```

## Data Model

Each trip contains:

* **tripName** (String) - Name of the trip
* **destination** (String) - Destination
* **startDate** (Date) - Start date
* **endDate** (Date) - End date
* **travelers** (Number) - Number of travelers
* **username** (String) - User who created the trip
* **itinerary** (Array) - Days and activities

## Future Enhancements

* User authentication with JWT
* Trip sharing and collaboration
* Progress tracking and analytics
* Mobile app version
* More travel microservices

## About This Project

TripCraft was built to demonstrate full-stack MERN development, microservice integration, and modern web app best practices.

## Contact

Matthew Clarke - mmfclarke1@gmail.com

Project Link: https://github.com/mmfclarke/tripcraft

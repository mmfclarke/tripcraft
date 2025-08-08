
# TripCraft

A full-stack MERN travel planner and trip assistant. TripCraft empowers users to create, manage, and explore custom trip itineraries, get AI-powered travel suggestions, safety tips, phrase translations, and cost breakdowns—all in a modern, responsive single-page application.

## Live Demo

Try out the app: [TripCraft Travel Planner](https://tripcrafttravelplanner.netlify.app)

* Frontend deployed on Netlify
* Backend REST API hosted on Render ([https://tripcraft.onrender.com](https://tripcraft.onrender.com))
* Note: Backend may take a few seconds to wake up if inactive

## Key Features

* **User Authentication:** Secure account creation and login
* **Dashboard:** View and manage all your trips
* **Trip Creation & Editing:** Build detailed itineraries with destinations, dates, and travelers
* **Itinerary Management:** Add, edit, and organize daily activities
* **Cost Breakdown:** Automatic calculation of trip costs and per-traveler expenses
* **AI-Powered Itinerary Suggestions:** Generate personalized activity plans using Google Gemini (GenAI API)
* **Travel Safety Tips:** Get location-specific safety advice via microservice
* **Phrase Translation:** Instantly translate common travel phrases for any country or language
* **Export to PDF:** Download your trip details and itinerary as a PDF
* **Responsive Design:** Works seamlessly on desktop and mobile

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
* Itinerary Suggestion Generator: Google Gemini GenAI API for smart activity planning
* Safety Tips Generator: Location-based travel safety microservice
* Phrase Translation: Language/country phrase translation microservice
* Export Service: PDF generation for trip exports

## Main Components

* **Login:** User authentication
* **Create Account:** Registration with validation
* **Dashboard:** Trip overview and management
* **Create Trip:** Add new trips with details
* **Edit Trip:** Update trip info and itinerary
* **Itinerary:** Daily activity planner, AI suggestions
* **CostSummary:** Cost breakdown and per-traveler analysis
* **HelpInformation:** Travel tips and phrase translations
* **TripCard:** Visual trip summaries
* **ViewTrip:** Detailed trip view and export


## Skills Demonstrated

* Full-stack MERN development
* GenAI API integration (Google Gemini)
* Microservice architecture and orchestration
* Secure authentication and validation
* Responsive UI/UX design
* RESTful API design and error handling
* End-to-end data flow management
* PDF export and file streaming

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
GENAI_API_KEY=your_google_gemini_api_key
ITINERARY_MICROSERVICE_URL=...
SAFETY_MICROSERVICE_URL=...
PHRASE_MICROSERVICE_URL=...
EXPORT_MICROSERVICE_URL=...
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

* JWT authentication and user sessions
* Trip sharing and collaboration
* Progress tracking and analytics
* Mobile app version
* More travel microservices and GenAI features

## About This Project

TripCraft was built to demonstrate full-stack MERN development, microservice integration, and modern web app best practices.

## Contact

Matthew Clarke - mmfclarke1@gmail.com

Project Link: https://github.com/mmfclarke/tripcraft

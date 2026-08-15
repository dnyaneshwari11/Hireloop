# Hireloop

AI-powered job application tracker that helps you manage your job search, generate tailored cover letters, and analyze gaps in your resume against job descriptions.


## Features
- **Job Application Tracking** — Keep track of every job you've applied to, its status, and key details in one place.
- **AI Cover Letter Generation** — Automatically generate tailored cover letters based on the job description and your resume.
- **Resume Gap Analysis** — Identify missing skills or keywords in your resume compared to a target job posting.
- **Modern UI** — Clean, responsive React frontend with a blue gradient design.

## Tech Stack

**Frontend**
- React
- (add CSS framework / library if used, e.g. Tailwind, styled-components)

**Backend**
- Python
- (add framework, e.g. Flask / FastAPI / Django)
- (add AI/LLM integration, e.g. OpenAI API / Anthropic API)

## Project Structure
```
Hireloop/
├── backend/     # API server and AI logic
├── frontend/    # React application
└── screenshots/ # App screenshots used in this README
```

## Getting Started

### Prerequisites
- Python 3.9+
- (any API keys required, e.g. OpenAI/Anthropic API key)

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
# Add your environment variables (e.g. API keys) to a .env file
python app.py
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

The app should now be running locally — frontend at `http://localhost:3000` and backend at `http://localhost:5000` (adjust as needed).

## Usage
1. Add a job application with the job description and your resume.
2. Let Hireloop generate a tailored cover letter.
3. Review the resume gap analysis to see what skills or keywords might be missing.
4. Track application status as you progress through your job search.

## Roadmap
- [ ] Add authentication / multi-user support
- [ ] Export cover letters as PDF
- [ ] Application status reminders/notifications
- [ ] Dashboard analytics for job search progress

## Contributing
Contributions, issues, and feature requests are welcome. Feel free to check the [issues page](../../issues).

## License
This project is licensed under the MIT License.

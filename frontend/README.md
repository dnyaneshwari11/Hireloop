# HireLoop

> Organize your job search. Apply smarter. Get hired faster.

HireLoop is a full-stack web application that helps job seekers keep track of every application in one place. Instead of juggling spreadsheets or notes, users can manage applications through a Kanban board, generate AI-powered cover letters, compare resumes with job descriptions, and monitor their overall job search progress.

The idea came from a simple problem—I was applying to multiple jobs and found it difficult to remember follow-up dates, interview stages, and application status. HireLoop was built to solve that problem.

---

## Features

### Job Application Tracker

Keep all your job applications organized in one place.

Each application stores details such as:

- Company name
- Job title
- Location
- Salary
- Job URL
- Job description
- Personal notes
- Applied date
- Follow-up date
- Current status

Applications move through a Kanban workflow:

**Saved → Applied → Phone Screen → Interview → Offer → Rejected / Withdrawn**

Simply drag applications between columns as your hiring process progresses.

---

### AI Cover Letter Generator

Writing a new cover letter for every application is time-consuming.

Paste a job description and HireLoop generates a personalized cover letter tailored to that role using Groq's Llama 3.3 model.

---

### Resume Gap Analysis

Before applying, users can compare their resume with the job description.

The AI analyzes both documents and provides:

- Resume match score
- Matching skills
- Missing skills
- Suggestions to improve the resume
- Overall recommendation

This helps applicants understand how well they fit the role before submitting an application.

---

### Follow-up Reminders

Every application can have its own follow-up date.

HireLoop highlights overdue follow-ups so important opportunities aren't forgotten.

---

### Analytics Dashboard

Track your job search performance with visual insights.

The dashboard includes:

- Applications by status
- Response rate
- Interview conversion rate
- Offer rate

These metrics help identify where improvements can be made during the application process.

---

## Tech Stack

### Backend

- Django
- Django REST Framework
- SQLite (Development)
- PostgreSQL (Production)
- JWT Authentication
- Groq API (Llama 3.3 70B)
- PyPDF2
- django-cors-headers

### Frontend

- React.js
- Axios
- React Markdown
- Recharts
- Lucide React
- Custom CSS

---

## AI Features

### Cover Letter Generation

The application sends the job title, company name, and job description to Groq's Llama 3.3 model, which generates a professional cover letter tailored to the specific position.

### Resume Analysis

Users can upload a PDF or paste resume text.

The AI compares the resume with the job description and returns:

- Match score
- Matching skills
- Missing skills
- Improvement suggestions
- Overall evaluation

The analysis is based only on the information provided in the resume and job description.

---

## Local Setup

### Requirements

- Python 3.10+
- Node.js 18+
- Groq API Key

### Backend

```bash
cd backend

python -m venv venv
venv\Scripts\activate

pip install -r requirements.txt
```

Create a `.env` file:

```env
SECRET_KEY=your_secret_key
DEBUG=True
GROQ_API_KEY=your_groq_api_key
```

Run the backend:

```bash
python manage.py migrate
python manage.py runserver
```

---

### Frontend

```bash
cd frontend

npm install
npm start
```

Backend:

```
http://127.0.0.1:8000
```

Frontend:

```
http://localhost:3000
```

---

## Project Structure

```
hireloop/
├── backend/
│   ├── accounts/
│   ├── jobs/
│   ├── ai_features/
│   ├── hireloop/
│   └── manage.py
│
└── frontend/
    └── src/
        ├── api/
        ├── App.js
        └── App.css
```

---

## Future Improvements

Some features I plan to add include:

- Deploy the application using Render and Vercel
- Email reminders for follow-ups
- Chrome extension to save jobs directly from LinkedIn and other job boards
- AI-generated interview questions based on the job description
- Support for multiple resume versions
- Resume optimization suggestions

---

## Why I Built HireLoop

While applying for internships and software engineering roles, I realized that tracking applications using notes or spreadsheets quickly became messy. I wanted a single place where I could organize applications, keep track of interview progress, and receive useful AI assistance during the application process.

HireLoop is the result of that idea—an application designed to make the job search more organized and a little less stressful.

---

Built with using Django, React, and Groq.
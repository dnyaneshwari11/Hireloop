from django.shortcuts import render

#views here.

import os
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from groq import Groq
from jobs.models import JobApplication

client = Groq(api_key=settings.GROQ_API_KEY)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cover_letter(request):
    job_id = request.data.get('job_id')

    try:
        job = JobApplication.objects.get(id=job_id, user=request.user)
    except JobApplication.DoesNotExist:
        return Response({'error': 'Job not found'}, status=404)

    if not job.job_description:
        return Response({'error': 'No job description found. Please add one first.'}, status=400)

    prompt = f"""Write a professional, personalized cover letter for this job application.

Company: {job.company}
Role: {job.role}
Location: {job.location or 'Not specified'}
Job Description:
{job.job_description}

Write a compelling 3-paragraph cover letter that:
1. Opens with genuine enthusiasm for the specific role and company
2. Highlights relevant skills and experience that match the job description
3. Closes with a confident call to action

Keep it concise, professional, and human — not generic. Do not use placeholders like [Your Name]."""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "system",
                "content": "You are an expert career coach who writes compelling, personalized cover letters."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        max_tokens=800,
        temperature=0.7
    )

    return Response({
        'cover_letter': response.choices[0].message.content
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def gap_analysis(request):
    job_description = request.data.get('job_description', '')
    resume_text = request.data.get('resume_text', '')

    if not job_description:
        return Response({'error': 'Job description is required'}, status=400)

    if not resume_text:
        return Response({'error': 'Resume text is required'}, status=400)

    prompt = f"""Analyze the gap between this candidate's resume and the job description.

JOB DESCRIPTION:
{job_description}

CANDIDATE RESUME:
{resume_text}

Provide a structured analysis with:
1. **Match Score** — give a percentage score (0-100%) of how well the candidate matches
2. **Matching Skills** — list skills/experience the candidate already has that match
3. **Missing Skills** — list required skills/experience the candidate lacks
4. **Quick Wins** — 2-3 specific things the candidate can do to strengthen their application
5. **Overall Verdict** — one sentence summary

Be specific, honest, and actionable. Focus on what matters most for this role."""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "system",
                "content": "You are an expert recruiter and career coach who gives honest, actionable feedback."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        max_tokens=1000,
        temperature=0.3
    )

    return Response({
        'analysis': response.choices[0].message.content
    })
    
    
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def parse_resume(request):
    file = request.FILES.get('file')
    if not file:
        return Response({'error': 'No file provided'}, status=400)

    try:
        from PyPDF2 import PdfReader
        import io
        reader = PdfReader(io.BytesIO(file.read()))
        text = ""
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
        return Response({'text': text})
    except Exception as e:
        return Response({'error': str(e)}, status=500)
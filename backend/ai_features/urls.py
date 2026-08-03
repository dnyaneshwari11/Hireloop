from django.urls import path

urlpatterns = []

from django.urls import path
from . import views



urlpatterns = [
    path('cover-letter/', views.cover_letter),
    path('gap-analysis/', views.gap_analysis),
    path('parse-resume/', views.parse_resume),
]


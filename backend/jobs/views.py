from django.shortcuts import render

# views here.
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from datetime import date
from .models import JobApplication
from .serializers import JobApplicationSerializer


class JobApplicationViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = JobApplicationSerializer

    def get_queryset(self):
        return JobApplication.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        qs = self.get_queryset()
        today = date.today()
        return Response({
            'total': qs.count(),
            'saved': qs.filter(status='saved').count(),
            'applied': qs.filter(status='applied').count(),
            'phone_screen': qs.filter(status='phone_screen').count(),
            'interview': qs.filter(status='interview').count(),
            'offer': qs.filter(status='offer').count(),
            'rejected': qs.filter(status='rejected').count(),
            'follow_ups_due': qs.filter(follow_up_date__lte=today, status__in=['applied', 'phone_screen', 'interview']).count(),
        })
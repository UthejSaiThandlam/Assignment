from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    JobViewSet, 
    CandidateViewSet, 
    StageHistoryViewSet, 
    DashboardAnalyticsView,
    LoginView,
    CurrentUserView
)

router = DefaultRouter()
router.register(r'jobs', JobViewSet, basename='job')
router.register(r'candidates', CandidateViewSet, basename='candidate')
router.register(r'stage-history', StageHistoryViewSet, basename='stage-history')

urlpatterns = [
    path('auth/login/', LoginView.as_view(), name='auth-login'),
    path('auth/me/', CurrentUserView.as_view(), name='auth-me'),
    path('analytics/dashboard/', DashboardAnalyticsView.as_view(), name='dashboard-analytics'),
    path('', include(router.urls)),
]

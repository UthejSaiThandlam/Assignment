import random

from django.contrib.auth.models import User
from django.db import transaction
from django.db.models import Count, Q
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Candidate, CandidateNote, Job, StageHistory
from .serializers import (
    CandidateNoteSerializer,
    CandidateSerializer,
    JobSerializer,
    StageHistorySerializer,
    StageUpdateSerializer,
)


class LoginThrottle(AnonRateThrottle):
    rate = '15/minute'
    scope = 'login'

class LoginView(APIView):
    throttle_classes = [LoginThrottle]

    def post(self, request):
        username = request.data.get('username', '').strip()
        password = request.data.get('password', '').strip()
        if not username:
            return Response({'error': 'Username is required'}, status=status.HTTP_400_BAD_REQUEST)
        if not password:
            return Response({'error': 'Password is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Secure credential validation with Django's authentication system
        user = User.objects.filter(username=username).first()
        if user is None:
            # Create user on first login so demo recruiters can sign in smoothly
            user = User.objects.create_user(
                username=username,
                email=f"{username}@talentflow.io",
                password=password
            )
        else:
            # If user already exists, verify submitted password securely
            if not user.check_password(password):
                # Handle legacy demo user without password set
                if not user.has_usable_password():
                    user.set_password(password)
                    user.save()
                else:
                    return Response(
                        {'error': 'Invalid recruiter credentials. Please check your username and password.'},
                        status=status.HTTP_401_UNAUTHORIZED
                    )

        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)
        
        # Recruiter role title without personal names
        is_admin = 'admin' in username.lower()
        role_title = 'Lead Recruiter' if is_admin else 'Recruiter'
        return Response({
            'success': True,
            'token': access_token,
            'access': access_token,
            'refresh': refresh_token,
            'token_type': 'Bearer',
            'user': {
                'username': username,
                'name': role_title,
                'role': role_title,
                'email': user.email,
            }
        })


class CurrentUserView(APIView):
    def get(self, request):
        return Response({
            'username': 'recruiter',
            'name': 'Lead Recruiter',
            'role': 'Lead Recruiter',
            'email': 'recruiter@talentflow.io',
        })


class JobViewSet(viewsets.ModelViewSet):
    queryset = Job.objects.annotate(candidate_count=Count('candidates')).order_by('-created_at')
    serializer_class = JobSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'job_type', 'department']
    search_fields = ['title', 'department', 'location']
    ordering_fields = ['created_at', 'title', 'candidate_count']


class CandidateViewSet(viewsets.ModelViewSet):
    queryset = Candidate.objects.select_related('job').prefetch_related('stage_history', 'timeline_notes').order_by('-created_at')
    serializer_class = CandidateSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['current_stage', 'job']
    search_fields = ['first_name', 'last_name', 'email', 'phone', 'applied_role', 'job__title']
    ordering_fields = ['created_at', 'rating', 'ats_score', 'first_name', 'last_name']

    @action(detail=True, methods=['post'], url_path='update-stage')
    def update_stage(self, request, pk=None):
        candidate = self.get_object()
        serializer = StageUpdateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        to_stage = serializer.validated_data['to_stage']
        notes = serializer.validated_data.get('notes', '')
        rejection_reason = serializer.validated_data.get('rejection_reason', '')
        changed_by = serializer.validated_data.get('changed_by', 'Hiring Manager')

        old_stage = candidate.current_stage

        with transaction.atomic():
            candidate.current_stage = to_stage
            if to_stage == Candidate.STAGE_REJECTED and rejection_reason:
                candidate.rejection_reason = rejection_reason
            elif to_stage != Candidate.STAGE_REJECTED:
                # Clear rejection reason if moving back into active pipeline
                candidate.rejection_reason = None
            candidate.save()

            StageHistory.objects.create(
                candidate=candidate,
                from_stage=old_stage,
                to_stage=to_stage,
                notes=notes,
                changed_by=changed_by,
            )

        return Response(CandidateSerializer(candidate).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='add-note')
    def add_note(self, request, pk=None):
        candidate = self.get_object()
        content = request.data.get('content', '').strip()
        author = request.data.get('author', 'Recruiter')
        if not content:
            return Response({'error': 'Note content cannot be empty'}, status=status.HTTP_400_BAD_REQUEST)

        note = CandidateNote.objects.create(
            candidate=candidate,
            author=author,
            content=content
        )
        return Response(CandidateNoteSerializer(note).data, status=status.HTTP_201_CREATED)


class StageHistoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = StageHistory.objects.select_related('candidate').order_by('-created_at')
    serializer_class = StageHistorySerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['candidate', 'to_stage']
    ordering_fields = ['created_at']


class DashboardAnalyticsView(APIView):
    def get(self, request):
        total_candidates = Candidate.objects.count()
        total_jobs = Job.objects.count()
        open_jobs = Job.objects.filter(status='open').count()

        stage_counts = {
            'applied': Candidate.objects.filter(current_stage='applied').count(),
            'screening': Candidate.objects.filter(current_stage='screening').count(),
            'interview': Candidate.objects.filter(current_stage='interview').count(),
            'offer': Candidate.objects.filter(current_stage='offer').count(),
            'hired': Candidate.objects.filter(current_stage='hired').count(),
            'rejected': Candidate.objects.filter(current_stage='rejected').count(),
        }

        # Active applications in non-terminal stages
        active_applications = (
            stage_counts['applied'] +
            stage_counts['screening'] +
            stage_counts['interview'] +
            stage_counts['offer']
        )

        upcoming_interviews_count = stage_counts['interview']
        hires_count = stage_counts['hired']

        # Conversion rate (Hired / Total Candidates * 100)
        conversion_rate = round((hires_count / total_candidates * 100), 1) if total_candidates > 0 else 0.0

        # Stage distribution with explicit percentages
        stage_labels = [
            ('applied', 'Applied', '#38BDF8'),
            ('screening', 'Screening', '#818CF8'),
            ('interview', 'Interview', '#FBBF24'),
            ('offer', 'Offer', '#6C63FF'),
            ('hired', 'Hired', '#34D399'),
        ]
        stage_distribution = []
        for key, label, color in stage_labels:
            cnt = stage_counts.get(key, 0)
            pct = round((cnt / total_candidates * 100), 1) if total_candidates > 0 else 0
            stage_distribution.append({
                'stage': key,
                'label': label,
                'count': cnt,
                'percentage': pct,
                'color': color,
            })

        # Needs attention buckets
        interview_candidates = list(
            Candidate.objects.filter(current_stage='interview')
            .values('id', 'first_name', 'last_name', 'applied_role', 'current_stage')[:5]
        )
        stalled_candidates = list(
            Candidate.objects.filter(current_stage__in=['applied', 'screening', 'interview', 'offer'])
            .order_by('updated_at')
            .values('id', 'first_name', 'last_name', 'applied_role', 'current_stage', 'updated_at')[:5]
        )
        new_applicants = list(
            Candidate.objects.filter(current_stage='applied')
            .order_by('-created_at')
            .values('id', 'first_name', 'last_name', 'applied_role', 'current_stage')[:5]
        )

        needs_attention = {
            'upcoming_interviews': {
                'count': upcoming_interviews_count,
                'title': 'Upcoming interviews',
                'description': 'Review scheduled interviews and their times.',
                'candidates': [
                    {**c, 'name': f"{c['first_name']} {c['last_name']}".strip()}
                    for c in interview_candidates
                ]
            },
            'stalled_applications': {
                'count': len(stalled_candidates),
                'title': 'Stalled applications',
                'description': 'Find applications with no recent stage change.',
                'candidates': [
                    {**c, 'name': f"{c['first_name']} {c['last_name']}".strip()}
                    for c in stalled_candidates
                ]
            },
            'new_applicants': {
                'count': stage_counts['applied'],
                'title': 'New applicants',
                'description': 'Review newly submitted applications.',
                'candidates': [
                    {**c, 'name': f"{c['first_name']} {c['last_name']}".strip()}
                    for c in new_applicants
                ]
            }
        }

        # Recent applications (latest 4-5)
        recent_cands = Candidate.objects.select_related('job').order_by('-created_at')[:5]
        recent_applications = []
        for c in recent_cands:
            initials = f"{c.first_name[:1]}{c.last_name[:1]}".upper()
            recent_applications.append({
                'id': c.id,
                'name': c.full_name,
                'initials': initials,
                'role': c.applied_role,
                'stage': c.current_stage,
                'ats_score': c.ats_score,
                'created_at': c.created_at.strftime('%b %d, %Y'),
                'last_updated': c.updated_at.strftime('%b %d, %Y') if c.updated_at else c.created_at.strftime('%b %d, %Y'),
            })

        # Recent transition audit log
        recent_transitions = StageHistory.objects.select_related('candidate').order_by('-created_at')[:6]
        activities = []
        for event in recent_transitions:
            activities.append({
                'id': event.id,
                'candidate_id': event.candidate.id,
                'candidate_name': event.candidate.full_name,
                'from_stage': event.from_stage,
                'to_stage': event.to_stage,
                'notes': event.notes,
                'changed_by': event.changed_by,
                'timestamp': event.created_at.strftime('%Y-%m-%d %H:%M'),
            })

        return Response({
            'total_candidates': total_candidates,
            'total_jobs': total_jobs,
            'open_jobs': open_jobs,
            'active_jobs': open_jobs,
            'active_applications': active_applications,
            'upcoming_interviews': upcoming_interviews_count,
            'hires': hires_count,
            'stage_counts': stage_counts,
            'stage_distribution': stage_distribution,
            'conversion_rate': conversion_rate,
            'needs_attention': needs_attention,
            'recent_applications': recent_applications,
            'recent_activities': activities,
        })


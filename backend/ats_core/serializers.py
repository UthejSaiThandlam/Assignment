from rest_framework import serializers
from django.db import transaction
from .models import Job, Candidate, StageHistory, CandidateNote

class JobSerializer(serializers.ModelSerializer):
    candidate_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Job
        fields = ['id', 'title', 'department', 'location', 'job_type', 'status', 'description', 'created_at', 'candidate_count']


class StageHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = StageHistory
        fields = ['id', 'candidate', 'from_stage', 'to_stage', 'notes', 'changed_by', 'created_at']
        read_only_fields = ['id', 'created_at']


class CandidateNoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = CandidateNote
        fields = ['id', 'candidate', 'author', 'content', 'created_at']
        read_only_fields = ['id', 'created_at']


class CandidateSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(read_only=True)
    job_detail = JobSerializer(source='job', read_only=True)
    stage_history = StageHistorySerializer(many=True, read_only=True)
    timeline_notes = CandidateNoteSerializer(many=True, read_only=True)

    class Meta:
        model = Candidate
        fields = [
            'id',
            'first_name',
            'last_name',
            'full_name',
            'email',
            'phone',
            'job',
            'job_detail',
            'applied_role',
            'resume_url',
            'current_stage',
            'ats_score',
            'rejection_reason',
            'rating',
            'notes_summary',
            'created_at',
            'updated_at',
            'stage_history',
            'timeline_notes',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def to_internal_value(self, data):
        if isinstance(data, dict):
            data = data.copy()
            if data.get('job') == '':
                data['job'] = None
            if not data.get('phone'):
                data['phone'] = '+1 555-0100'
            if not data.get('applied_role') and data.get('job'):
                try:
                    job_obj = Job.objects.filter(id=data['job']).first()
                    if job_obj:
                        data['applied_role'] = job_obj.title
                except Exception:
                    pass
        return super().to_internal_value(data)

    def create(self, validated_data):
        with transaction.atomic():
            candidate = Candidate.objects.create(**validated_data)
            # Create initial audit log entry
            StageHistory.objects.create(
                candidate=candidate,
                from_stage=None,
                to_stage=candidate.current_stage,
                notes=f"Candidate applied for {candidate.applied_role}",
                changed_by="Applicant / Recruiter",
            )
            return candidate


class StageUpdateSerializer(serializers.Serializer):
    to_stage = serializers.ChoiceField(choices=Candidate.STAGE_CHOICES)
    notes = serializers.CharField(required=False, allow_blank=True, default='')
    rejection_reason = serializers.CharField(required=False, allow_blank=True, default='')
    changed_by = serializers.CharField(required=False, default='Hiring Manager')

    def validate(self, attrs):
        if attrs.get('to_stage') == Candidate.STAGE_REJECTED and not attrs.get('rejection_reason') and not attrs.get('notes'):
            attrs['rejection_reason'] = 'Candidate does not meet current role specifications.'
        return attrs

from django.db import models

class Job(models.Model):
    JOB_STATUS_CHOICES = [
        ('open', 'Open'),
        ('paused', 'Paused'),
        ('closed', 'Closed'),
    ]

    JOB_TYPE_CHOICES = [
        ('Full-time', 'Full-time'),
        ('Part-time', 'Part-time'),
        ('Contract', 'Contract'),
        ('Internship', 'Internship'),
    ]

    title = models.CharField(max_length=150)
    department = models.CharField(max_length=100, default='Engineering')
    location = models.CharField(max_length=100, default='Remote')
    job_type = models.CharField(max_length=50, choices=JOB_TYPE_CHOICES, default='Full-time')
    status = models.CharField(max_length=20, choices=JOB_STATUS_CHOICES, default='open')
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} ({self.department})"


class Candidate(models.Model):
    STAGE_APPLIED = 'applied'
    STAGE_SCREENING = 'screening'
    STAGE_INTERVIEW = 'interview'
    STAGE_OFFER = 'offer'
    STAGE_HIRED = 'hired'
    STAGE_REJECTED = 'rejected'

    STAGE_CHOICES = [
        (STAGE_APPLIED, 'Applied'),
        (STAGE_SCREENING, 'Screening'),
        (STAGE_INTERVIEW, 'Interview'),
        (STAGE_OFFER, 'Offer'),
        (STAGE_HIRED, 'Hired'),
        (STAGE_REJECTED, 'Rejected'),
    ]

    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True, db_index=True)
    phone = models.CharField(max_length=30)
    job = models.ForeignKey(Job, on_delete=models.SET_NULL, null=True, blank=True, related_name='candidates')
    applied_role = models.CharField(max_length=150)
    resume_url = models.URLField(max_length=500, blank=True)
    current_stage = models.CharField(max_length=30, choices=STAGE_CHOICES, default=STAGE_APPLIED, db_index=True)
    ats_score = models.IntegerField(default=85, help_text="Calculated ATS profile match score (0-100)")
    rejection_reason = models.TextField(blank=True, null=True)
    rating = models.IntegerField(default=3)  # 1 to 5 rating
    notes_summary = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.first_name} {self.last_name} - {self.applied_role}"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip()


class StageHistory(models.Model):
    candidate = models.ForeignKey(Candidate, on_delete=models.CASCADE, related_name='stage_history')
    from_stage = models.CharField(max_length=30, blank=True, null=True)
    to_stage = models.CharField(max_length=30)
    notes = models.TextField(blank=True)
    changed_by = models.CharField(max_length=100, default='Hiring Manager')
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.candidate.full_name}: {self.from_stage} -> {self.to_stage}"


class CandidateNote(models.Model):
    candidate = models.ForeignKey(Candidate, on_delete=models.CASCADE, related_name='timeline_notes')
    author = models.CharField(max_length=100, default='Recruiter')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Note on {self.candidate.full_name} by {self.author}"

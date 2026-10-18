from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from ats_core.models import Job, Candidate, StageHistory, CandidateNote

class CandidateAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.job = Job.objects.create(
            title="Senior Backend Engineer",
            department="Engineering",
            location="Remote",
            job_type="Full-time",
            status="open"
        )
        self.candidate = Candidate.objects.create(
            first_name="John",
            last_name="Doe",
            email="john.doe@example.com",
            phone="+1234567890",
            job=self.job,
            applied_role="Senior Backend Engineer",
            current_stage="applied",
            ats_score=92,
            rating=4
        )
        StageHistory.objects.create(
            candidate=self.candidate,
            from_stage=None,
            to_stage="applied",
            notes="Initial application",
            changed_by="Applicant"
        )

    def test_list_candidates(self):
        response = self.client.get('/api/candidates/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Check pagination
        data = response.json()
        results = data.get('results', data)
        self.assertGreaterEqual(len(results), 1)
        self.assertEqual(results[0]['email'], "john.doe@example.com")

    def test_create_candidate_creates_audit_history(self):
        payload = {
            "first_name": "Jane",
            "last_name": "Smith",
            "email": "jane.smith@example.com",
            "phone": "+1987654321",
            "job": self.job.id,
            "applied_role": "Senior Backend Engineer",
            "current_stage": "applied",
            "ats_score": 88,
            "rating": 5
        }
        response = self.client.post('/api/candidates/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Verify candidate created
        new_cand_id = response.json()['id']
        cand = Candidate.objects.get(id=new_cand_id)
        self.assertEqual(cand.first_name, "Jane")
        
        # Verify initial audit trail created
        hist = StageHistory.objects.filter(candidate=cand)
        self.assertEqual(hist.count(), 1)
        self.assertEqual(hist.first().to_stage, "applied")

    def test_stage_transition_creates_audit_trail(self):
        url = f'/api/candidates/{self.candidate.id}/update-stage/'
        payload = {
            "to_stage": "screening",
            "notes": "Passed technical screening phone call",
            "changed_by": "Senior Recruiter"
        }
        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.candidate.refresh_from_db()
        self.assertEqual(self.candidate.current_stage, "screening")

        # Verify audit history
        histories = StageHistory.objects.filter(candidate=self.candidate).order_by('-created_at')
        latest_hist = histories.first()
        self.assertEqual(latest_hist.from_stage, "applied")
        self.assertEqual(latest_hist.to_stage, "screening")
        self.assertEqual(latest_hist.changed_by, "Senior Recruiter")

    def test_rejection_stage_with_reason(self):
        url = f'/api/candidates/{self.candidate.id}/update-stage/'
        payload = {
            "to_stage": "rejected",
            "rejection_reason": "Candidate compensation expectation exceeds budget.",
            "notes": "Sent notification email.",
            "changed_by": "Hiring Manager"
        }
        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.candidate.refresh_from_db()
        self.assertEqual(self.candidate.current_stage, "rejected")
        self.assertEqual(self.candidate.rejection_reason, "Candidate compensation expectation exceeds budget.")

    def test_add_candidate_note(self):
        url = f'/api/candidates/{self.candidate.id}/add-note/'
        payload = {
            "author": "Tech Lead",
            "content": "Superb system design understanding demonstrated during live interview."
        }
        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(CandidateNote.objects.filter(candidate=self.candidate).count(), 1)


class DashboardAnalyticsAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        job = Job.objects.create(title="Product Designer", status="open")
        Candidate.objects.create(first_name="A", last_name="A", email="a@a.com", phone="123", applied_role="Product Designer", current_stage="applied", job=job)
        Candidate.objects.create(first_name="B", last_name="B", email="b@b.com", phone="456", applied_role="Product Designer", current_stage="interview", job=job)
        Candidate.objects.create(first_name="C", last_name="C", email="c@c.com", phone="789", applied_role="Product Designer", current_stage="hired", job=job)

    def test_analytics_metrics(self):
        response = self.client.get('/api/analytics/dashboard/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(data['total_candidates'], 3)
        self.assertEqual(data['active_jobs'], 1)
        self.assertEqual(data['stage_counts']['applied'], 1)
        self.assertEqual(data['stage_counts']['interview'], 1)
        self.assertEqual(data['stage_counts']['hired'], 1)
        self.assertAlmostEqual(data['conversion_rate'], 33.3, delta=0.5)


class AuthAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_recruiter_login_success(self):
        payload = {
            "username": "admin",
            "password": "password123"
        }
        response = self.client.post('/api/auth/login/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertTrue(data['success'])
        self.assertIn('token', data)
        self.assertEqual(data['user']['name'], 'Lead Recruiter')

    def test_login_missing_username_fails(self):
        response = self.client.post('/api/auth/login/', {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

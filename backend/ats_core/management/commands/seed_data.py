from django.core.management.base import BaseCommand
from ats_core.models import Job, Candidate, StageHistory, CandidateNote
import random

class Command(BaseCommand):
    help = 'Seeds realistic sample data for the Mini ATS'

    def handle(self, *args, **kwargs):
        self.stdout.write("Clearing existing sample data...")
        CandidateNote.objects.all().delete()
        StageHistory.objects.all().delete()
        Candidate.objects.all().delete()
        Job.objects.all().delete()

        self.stdout.write("Creating Job Openings...")
        jobs_data = [
            {
                'title': 'Senior Full-Stack Engineer',
                'department': 'Engineering',
                'location': 'Remote (US/EU)',
                'job_type': 'Full-time',
                'status': 'open',
                'description': 'Lead development of our core web applications using React, Python/Django, and cloud services.'
            },
            {
                'title': 'Product Manager - Core Platform',
                'department': 'Product',
                'location': 'San Francisco, CA',
                'job_type': 'Full-time',
                'status': 'open',
                'description': 'Define product roadmap, user journeys, metrics, and collaborate directly with engineering and design.'
            },
            {
                'title': 'DevOps & Cloud Infrastructure Lead',
                'department': 'Infrastructure',
                'location': 'New York, NY',
                'job_type': 'Full-time',
                'status': 'open',
                'description': 'Build resilient CI/CD pipelines, monitor multi-region clusters, and scale containerized backend systems.'
            },
            {
                'title': 'UI/UX Product Designer',
                'department': 'Design',
                'location': 'Remote',
                'job_type': 'Full-time',
                'status': 'open',
                'description': 'Craft intuitive user interfaces, design systems, interactive prototypes, and lead user research.'
            },
            {
                'title': 'Junior Frontend Developer',
                'department': 'Engineering',
                'location': 'Austin, TX',
                'job_type': 'Full-time',
                'status': 'open',
                'description': 'Build responsive components in React, optimize rendering performance, and integrate REST APIs.'
            },
        ]

        jobs = []
        for jdata in jobs_data:
            job = Job.objects.create(**jdata)
            jobs.append(job)

        self.stdout.write(f"Created {len(jobs)} jobs.")

        candidates_data = [
            {
                'first_name': 'Sarah',
                'last_name': 'Jenkins',
                'email': 'sarah.jenkins@example.com',
                'phone': '+1 (555) 234-5678',
                'job': jobs[0],
                'applied_role': jobs[0].title,
                'resume_url': 'https://example.com/resumes/sarah_jenkins.pdf',
                'current_stage': 'interview',
                'ats_score': 94,
                'rating': 5,
                'notes_summary': 'Strong experience in Django, React, and scalable microservices. Completed technical screen with distinction.',
                'history': [
                    ('applied', 'Screening candidate credentials and resume fit.'),
                    ('screening', 'Completed recruiter phone screen. Great culture fit and communication.'),
                    ('interview', 'Scheduled system design and live pair programming round.')
                ]
            },
            {
                'first_name': 'Alex',
                'last_name': 'Rivera',
                'email': 'alex.rivera@example.com',
                'phone': '+1 (555) 345-6789',
                'job': jobs[0],
                'applied_role': jobs[0].title,
                'resume_url': 'https://example.com/resumes/alex_rivera.pdf',
                'current_stage': 'offer',
                'ats_score': 96,
                'rating': 5,
                'notes_summary': 'Top tier candidate. Excellent feedback from all interview panel members.',
                'history': [
                    ('applied', 'Applied via LinkedIn.'),
                    ('screening', 'Passed technical recruiter screen.'),
                    ('interview', 'Passed technical coding and architecture deep-dive.'),
                    ('offer', 'Extended competitive offer letter: $165k base + equity.')
                ]
            },
            {
                'first_name': 'Marcus',
                'last_name': 'Chen',
                'email': 'marcus.chen@example.com',
                'phone': '+1 (555) 456-7890',
                'job': jobs[0],
                'applied_role': jobs[0].title,
                'resume_url': 'https://example.com/resumes/marcus_chen.pdf',
                'current_stage': 'applied',
                'ats_score': 82,
                'rating': 4,
                'notes_summary': 'Impressive portfolio with GitHub open source contributions.',
                'history': [
                    ('applied', 'Candidate application received.')
                ]
            },
            {
                'first_name': 'Elena',
                'last_name': 'Rostova',
                'email': 'elena.rostova@example.com',
                'phone': '+1 (555) 567-8901',
                'job': jobs[1],
                'applied_role': jobs[1].title,
                'resume_url': 'https://example.com/resumes/elena_rostova.pdf',
                'current_stage': 'hired',
                'ats_score': 98,
                'rating': 5,
                'notes_summary': 'Accepted offer! Start date set for the 1st of next month.',
                'history': [
                    ('applied', 'Applied via company careers page.'),
                    ('screening', 'Initial screening phone call completed.'),
                    ('interview', 'Product sense & case study interview passed.'),
                    ('offer', 'Offer accepted.'),
                    ('hired', 'Background check cleared, onboarded into HRIS system.')
                ]
            },
            {
                'first_name': 'David',
                'last_name': 'Kim',
                'email': 'david.kim@example.com',
                'phone': '+1 (555) 678-9012',
                'job': jobs[2],
                'applied_role': jobs[2].title,
                'resume_url': 'https://example.com/resumes/david_kim.pdf',
                'current_stage': 'screening',
                'ats_score': 88,
                'rating': 4,
                'notes_summary': 'Extensive AWS, Kubernetes and Terraform background.',
                'history': [
                    ('applied', 'Application received from referral.'),
                    ('screening', 'Recruiter call scheduled for tomorrow 2 PM.')
                ]
            },
            {
                'first_name': 'Amina',
                'last_name': 'Diallo',
                'email': 'amina.diallo@example.com',
                'phone': '+1 (555) 789-0123',
                'job': jobs[3],
                'applied_role': jobs[3].title,
                'resume_url': 'https://example.com/resumes/amina_diallo.pdf',
                'current_stage': 'interview',
                'ats_score': 91,
                'rating': 4,
                'notes_summary': 'Great portfolio with polished design system and user research artifacts.',
                'history': [
                    ('applied', 'Direct application with portfolio link.'),
                    ('screening', 'Portfolio review passed.'),
                    ('interview', 'Design critique session in progress.')
                ]
            },
            {
                'first_name': 'Liam',
                'last_name': 'O\'Connor',
                'email': 'liam.oconnor@example.com',
                'phone': '+1 (555) 890-1234',
                'job': jobs[4],
                'applied_role': jobs[4].title,
                'resume_url': 'https://example.com/resumes/liam_oconnor.pdf',
                'current_stage': 'rejected',
                'rejection_reason': 'Looking for candidates with more hands-on production React experience.',
                'ats_score': 64,
                'rating': 2,
                'notes_summary': 'Good fundamentals but lacks production React experience required for current sprint velocity.',
                'history': [
                    ('applied', 'Applied via job board.'),
                    ('screening', 'Screening call completed.'),
                    ('rejected', 'Sent polite rejection email.')
                ]
            },
            {
                'first_name': 'Priya',
                'last_name': 'Sharma',
                'email': 'priya.sharma@example.com',
                'phone': '+1 (555) 901-2345',
                'job': jobs[0],
                'applied_role': jobs[0].title,
                'resume_url': 'https://example.com/resumes/priya_sharma.pdf',
                'current_stage': 'screening',
                'ats_score': 89,
                'rating': 4,
                'notes_summary': '5 years Python/Django experience with background in high-volume payment APIs.',
                'history': [
                    ('applied', 'Application submitted.'),
                    ('screening', 'Recruiter phone screen passed.')
                ]
            },
            {
                'first_name': 'Jordan',
                'last_name': 'Taylor',
                'email': 'jordan.taylor@example.com',
                'phone': '+1 (555) 012-3456',
                'job': jobs[1],
                'applied_role': jobs[1].title,
                'resume_url': 'https://example.com/resumes/jordan_taylor.pdf',
                'current_stage': 'applied',
                'ats_score': 76,
                'rating': 3,
                'notes_summary': 'Former tech founder with product intuition.',
                'history': [
                    ('applied', 'Application submitted.')
                ]
            },
            {
                'first_name': 'Maya',
                'last_name': 'Patel',
                'email': 'maya.patel@example.com',
                'phone': '+1 (555) 123-9876',
                'job': jobs[4],
                'applied_role': jobs[4].title,
                'resume_url': 'https://example.com/resumes/maya_patel.pdf',
                'current_stage': 'offer',
                'ats_score': 95,
                'rating': 5,
                'notes_summary': 'Superb problem-solving skills in frontend challenges.',
                'history': [
                    ('applied', 'Application received.'),
                    ('screening', 'Passed screen.'),
                    ('interview', 'Aced JavaScript live coding test.'),
                    ('offer', 'Offer letter sent: $90k base.')
                ]
            }
        ]

        self.stdout.write("Creating Candidates and Stage Histories...")
        for cdata in candidates_data:
            history = cdata.pop('history')
            candidate = Candidate.objects.create(**cdata)
            
            # Create stage histories
            prev_stage = None
            for stage_step, note in history:
                StageHistory.objects.create(
                    candidate=candidate,
                    from_stage=prev_stage,
                    to_stage=stage_step,
                    notes=note,
                    changed_by='Talent Acquisition Lead'
                )
                prev_stage = stage_step

            # Add a sample timeline note
            CandidateNote.objects.create(
                candidate=candidate,
                author='Lead Recruiter',
                content=f"Initial assessment completed for {candidate.full_name}. Profile fits team requirements."
            )

        # Ensure demo recruiter user exists with password123
        from django.contrib.auth.models import User
        if not User.objects.filter(username='admin').exists():
            User.objects.create_superuser('admin', 'admin@talentflow.io', 'password123')
            self.stdout.write(self.style.SUCCESS("Created demo admin user (admin / password123)"))
        else:
            admin_user = User.objects.get(username='admin')
            admin_user.set_password('password123')
            admin_user.save()
            self.stdout.write(self.style.SUCCESS("Verified demo admin user credentials (admin / password123)"))

        self.stdout.write(self.style.SUCCESS(f"Successfully seeded {len(candidates_data)} candidates with stage histories and notes!"))

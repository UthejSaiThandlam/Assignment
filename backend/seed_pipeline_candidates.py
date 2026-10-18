import os
import sys
import django
from datetime import datetime, timedelta
from django.utils import timezone

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ats_backend.settings')
django.setup()

from ats_core.models import Candidate, Job, StageHistory

# 1. Clear existing candidates
Candidate.objects.all().delete()
Job.objects.all().delete()

# 2. Setup standard Jobs
jobs_defs = [
    ('Software Engineer', 'Engineering', 'Remote', 'Full-time'),
    ('Product Analyst', 'Analytics & Product', 'New York, NY', 'Full-time'),
    ('UI/UX Designer', 'Product Design', 'San Francisco, CA', 'Full-time'),
    ('Backend Developer', 'Platform Engineering', 'Austin, TX', 'Full-time'),
    ('Data Scientist', 'AI & Machine Learning', 'Boston, MA', 'Full-time'),
]

job_map = {}
for title, dept, loc, jtype in jobs_defs:
    j, _ = Job.objects.get_or_create(
        title=title,
        defaults={'department': dept, 'location': loc, 'job_type': jtype, 'status': 'open'}
    )
    job_map[title] = j

now = timezone.now()

# 48 Candidates data matching user screenshot
# Stage distribution: applied (8), screening (10), interview (12), offer (6), hired (8), rejected (4)
# Role counts: Software Engineer (12), Backend Developer (10), Product Analyst (8), UI/UX Designer (6), Data Scientist (6), DevOps/Other (6)
candidates_data = [
    # --- APPLIED (8 candidates) ---
    {
        "first_name": "Riya", "last_name": "Sharma", "email": "riya.sharma@talentflow.dev",
        "phone": "+1 (555) 234-5678", "role": "Software Engineer", "stage": "applied",
        "score": 94, "rating": 5, "days_ago": 2, "resume": "https://talentflow.example.com/resumes/riya_sharma.pdf"
    },
    {
        "first_name": "Neha", "last_name": "Menon", "email": "neha.menon@talentflow.dev",
        "phone": "+1 (555) 345-6789", "role": "UI/UX Designer", "stage": "applied",
        "score": 89, "rating": 4, "days_ago": 5, "resume": "https://talentflow.example.com/resumes/neha_menon.pdf"
    },
    {
        "first_name": "Ananya", "last_name": "Trivedi", "email": "ananya.trivedi@talentflow.dev",
        "phone": "+1 (555) 456-7890", "role": "UI/UX Designer", "stage": "applied",
        "score": 91, "rating": 5, "days_ago": 6, "resume": "https://talentflow.example.com/resumes/ananya_trivedi.pdf"
    },
    {
        "first_name": "Lucas", "last_name": "Vance", "email": "lucas.vance@talentflow.dev",
        "phone": "+1 (555) 567-8901", "role": "Backend Developer", "stage": "applied",
        "score": 87, "rating": 4, "days_ago": 3, "resume": "https://talentflow.example.com/resumes/lucas_vance.pdf"
    },
    {
        "first_name": "Chloe", "last_name": "Dupont", "email": "chloe.dupont@talentflow.dev",
        "phone": "+1 (555) 678-9012", "role": "Data Scientist", "stage": "applied",
        "score": 90, "rating": 4, "days_ago": 4, "resume": "https://talentflow.example.com/resumes/chloe_dupont.pdf"
    },
    {
        "first_name": "Ethan", "last_name": "Hunt", "email": "ethan.hunt@talentflow.dev",
        "phone": "+1 (555) 789-0123", "role": "Software Engineer", "stage": "applied",
        "score": 85, "rating": 4, "days_ago": 1, "resume": "https://talentflow.example.com/resumes/ethan_hunt.pdf"
    },
    {
        "first_name": "Grace", "last_name": "Hopper", "email": "grace.hopper@talentflow.dev",
        "phone": "+1 (555) 890-1234", "role": "Product Analyst", "stage": "applied",
        "score": 93, "rating": 5, "days_ago": 2, "resume": "https://talentflow.example.com/resumes/grace_hopper.pdf"
    },
    {
        "first_name": "Devin", "last_name": "Cole", "email": "devin.cole@talentflow.dev",
        "phone": "+1 (555) 901-2345", "role": "Backend Developer", "stage": "applied",
        "score": 82, "rating": 3, "days_ago": 7, "resume": "https://talentflow.example.com/resumes/devin_cole.pdf"
    },

    # --- SCREENING (10 candidates) ---
    {
        "first_name": "Karan", "last_name": "Thakur", "email": "karan.thakur@talentflow.dev",
        "phone": "+1 (555) 112-2334", "role": "Product Analyst", "stage": "screening",
        "score": 92, "rating": 5, "days_ago": 3, "resume": "https://talentflow.example.com/resumes/karan_thakur.pdf"
    },
    {
        "first_name": "Sneha", "last_name": "Patel", "email": "sneha.patel@talentflow.dev",
        "phone": "+1 (555) 223-3445", "role": "Software Engineer", "stage": "screening",
        "score": 88, "rating": 4, "days_ago": 4, "resume": "https://talentflow.example.com/resumes/sneha_patel.pdf"
    },
    {
        "first_name": "Vikram", "last_name": "Singh", "email": "vikram.singh@talentflow.dev",
        "phone": "+1 (555) 334-4556", "role": "Backend Developer", "stage": "screening",
        "score": 91, "rating": 5, "days_ago": 6, "resume": "https://talentflow.example.com/resumes/vikram_singh.pdf"
    },
    {
        "first_name": "Sophie", "last_name": "Martin", "email": "sophie.martin@talentflow.dev",
        "phone": "+1 (555) 445-5667", "role": "UI/UX Designer", "stage": "screening",
        "score": 86, "rating": 4, "days_ago": 5, "resume": "https://talentflow.example.com/resumes/sophie_martin.pdf"
    },
    {
        "first_name": "Marcus", "last_name": "Aurelius", "email": "marcus.a@talentflow.dev",
        "phone": "+1 (555) 556-6778", "role": "Backend Developer", "stage": "screening",
        "score": 93, "rating": 5, "days_ago": 7, "resume": "https://talentflow.example.com/resumes/marcus_a.pdf"
    },
    {
        "first_name": "Zoe", "last_name": "Kravitz", "email": "zoe.k@talentflow.dev",
        "phone": "+1 (555) 667-7889", "role": "Data Scientist", "stage": "screening",
        "score": 89, "rating": 4, "days_ago": 8, "resume": "https://talentflow.example.com/resumes/zoe_k.pdf"
    },
    {
        "first_name": "Liam", "last_name": "Neeson", "email": "liam.neeson@talentflow.dev",
        "phone": "+1 (555) 778-8990", "role": "Software Engineer", "stage": "screening",
        "score": 94, "rating": 5, "days_ago": 4, "resume": "https://talentflow.example.com/resumes/liam_neeson.pdf"
    },
    {
        "first_name": "Aiden", "last_name": "Pearce", "email": "aiden.pearce@talentflow.dev",
        "phone": "+1 (555) 889-9001", "role": "Software Engineer", "stage": "screening",
        "score": 84, "rating": 3, "days_ago": 5, "resume": "https://talentflow.example.com/resumes/aiden_pearce.pdf"
    },
    {
        "first_name": "Nora", "last_name": "Fatehi", "email": "nora.fatehi@talentflow.dev",
        "phone": "+1 (555) 990-0112", "role": "Product Analyst", "stage": "screening",
        "score": 90, "rating": 4, "days_ago": 6, "resume": "https://talentflow.example.com/resumes/nora_fatehi.pdf"
    },
    {
        "first_name": "Julian", "last_name": "Assange", "email": "julian.a@talentflow.dev",
        "phone": "+1 (555) 101-1122", "role": "Backend Developer", "stage": "screening",
        "score": 95, "rating": 5, "days_ago": 7, "resume": "https://talentflow.example.com/resumes/julian_a.pdf"
    },

    # --- INTERVIEW (12 candidates) ---
    {
        "first_name": "Arjun", "last_name": "Reddy", "email": "arjun.reddy@talentflow.dev",
        "phone": "+1 (555) 123-9876", "role": "Software Engineer", "stage": "interview",
        "score": 96, "rating": 5, "days_ago": 5, "resume": "https://talentflow.example.com/resumes/arjun_reddy.pdf"
    },
    {
        "first_name": "Sara", "last_name": "Ali", "email": "sara.ali@talentflow.dev",
        "phone": "+1 (555) 234-0987", "role": "Data Scientist", "stage": "interview",
        "score": 91, "rating": 5, "days_ago": 7, "resume": "https://talentflow.example.com/resumes/sara_ali.pdf"
    },
    {
        "first_name": "Devika", "last_name": "Taneja", "email": "devika.taneja@talentflow.dev",
        "phone": "+1 (555) 345-1098", "role": "Product Analyst", "stage": "interview",
        "score": 90, "rating": 4, "days_ago": 7, "resume": "https://talentflow.example.com/resumes/devika_taneja.pdf"
    },
    {
        "first_name": "Oliver", "last_name": "Queen", "email": "oliver.queen@talentflow.dev",
        "phone": "+1 (555) 456-2109", "role": "Backend Developer", "stage": "interview",
        "score": 93, "rating": 5, "days_ago": 8, "resume": "https://talentflow.example.com/resumes/oliver_queen.pdf"
    },
    {
        "first_name": "Iris", "last_name": "West", "email": "iris.west@talentflow.dev",
        "phone": "+1 (555) 567-3210", "role": "UI/UX Designer", "stage": "interview",
        "score": 88, "rating": 4, "days_ago": 9, "resume": "https://talentflow.example.com/resumes/iris_west.pdf"
    },
    {
        "first_name": "Barry", "last_name": "Allen", "email": "barry.allen@talentflow.dev",
        "phone": "+1 (555) 678-4321", "role": "Software Engineer", "stage": "interview",
        "score": 97, "rating": 5, "days_ago": 6, "resume": "https://talentflow.example.com/resumes/barry_allen.pdf"
    },
    {
        "first_name": "Kara", "last_name": "Danvers", "email": "kara.danvers@talentflow.dev",
        "phone": "+1 (555) 789-5432", "role": "Product Analyst", "stage": "interview",
        "score": 89, "rating": 4, "days_ago": 10, "resume": "https://talentflow.example.com/resumes/kara_danvers.pdf"
    },
    {
        "first_name": "Clark", "last_name": "Kent", "email": "clark.kent@talentflow.dev",
        "phone": "+1 (555) 890-6543", "role": "Backend Developer", "stage": "interview",
        "score": 95, "rating": 5, "days_ago": 7, "resume": "https://talentflow.example.com/resumes/clark_kent.pdf"
    },
    {
        "first_name": "Diana", "last_name": "Prince", "email": "diana.prince@talentflow.dev",
        "phone": "+1 (555) 901-7654", "role": "Data Scientist", "stage": "interview",
        "score": 94, "rating": 5, "days_ago": 8, "resume": "https://talentflow.example.com/resumes/diana_prince.pdf"
    },
    {
        "first_name": "Bruce", "last_name": "Wayne", "email": "bruce.wayne@talentflow.dev",
        "phone": "+1 (555) 012-8765", "role": "Software Engineer", "stage": "interview",
        "score": 99, "rating": 5, "days_ago": 9, "resume": "https://talentflow.example.com/resumes/bruce_wayne.pdf"
    },
    {
        "first_name": "Selina", "last_name": "Kyle", "email": "selina.kyle@talentflow.dev",
        "phone": "+1 (555) 123-9870", "role": "UI/UX Designer", "stage": "interview",
        "score": 92, "rating": 5, "days_ago": 11, "resume": "https://talentflow.example.com/resumes/selina_kyle.pdf"
    },
    {
        "first_name": "Arthur", "last_name": "Curry", "email": "arthur.curry@talentflow.dev",
        "phone": "+1 (555) 234-0981", "role": "Backend Developer", "stage": "interview",
        "score": 87, "rating": 4, "days_ago": 12, "resume": "https://talentflow.example.com/resumes/arthur_curry.pdf"
    },

    # --- OFFER (6 candidates) ---
    {
        "first_name": "Siddharth", "last_name": "Kumar", "email": "siddharth.kumar@talentflow.dev",
        "phone": "+1 (555) 345-1234", "role": "Software Engineer", "stage": "offer",
        "score": 98, "rating": 5, "days_ago": 7, "resume": "https://talentflow.example.com/resumes/siddharth_kumar.pdf"
    },
    {
        "first_name": "Elen", "last_name": "Abraham", "email": "elen.abraham@talentflow.dev",
        "phone": "+1 (555) 456-2345", "role": "Product Analyst", "stage": "offer",
        "score": 93, "rating": 5, "days_ago": 7, "resume": "https://talentflow.example.com/resumes/elen_abraham.pdf"
    },
    {
        "first_name": "Priya", "last_name": "Mehta", "email": "priya.mehta@talentflow.dev",
        "phone": "+1 (555) 567-3456", "role": "Backend Developer", "stage": "offer",
        "score": 94, "rating": 5, "days_ago": 8, "resume": "https://talentflow.example.com/resumes/priya_mehta.pdf"
    },
    {
        "first_name": "Victor", "last_name": "Stone", "email": "victor.stone@talentflow.dev",
        "phone": "+1 (555) 678-4567", "role": "Software Engineer", "stage": "offer",
        "score": 95, "rating": 5, "days_ago": 10, "resume": "https://talentflow.example.com/resumes/victor_stone.pdf"
    },
    {
        "first_name": "Hal", "last_name": "Jordan", "email": "hal.jordan@talentflow.dev",
        "phone": "+1 (555) 789-5678", "role": "Data Scientist", "stage": "offer",
        "score": 91, "rating": 5, "days_ago": 9, "resume": "https://talentflow.example.com/resumes/hal_jordan.pdf"
    },
    {
        "first_name": "Natasha", "last_name": "Romanoff", "email": "natasha.r@talentflow.dev",
        "phone": "+1 (555) 890-6789", "role": "UI/UX Designer", "stage": "offer",
        "score": 96, "rating": 5, "days_ago": 12, "resume": "https://talentflow.example.com/resumes/natasha_r.pdf"
    },

    # --- HIRED (8 candidates) ---
    {
        "first_name": "Mayank", "last_name": "Pokhriyal", "email": "mayank.pokhriyal@talentflow.dev",
        "phone": "+1 (555) 901-7890", "role": "Backend Developer", "stage": "hired",
        "score": 97, "rating": 5, "days_ago": 14, "resume": "https://talentflow.example.com/resumes/mayank_pokhriyal.pdf"
    },
    {
        "first_name": "Aarav", "last_name": "Kulkarni", "email": "aarav.kulkarni@talentflow.dev",
        "phone": "+1 (555) 012-8901", "role": "Data Scientist", "stage": "hired",
        "score": 95, "rating": 5, "days_ago": 16, "resume": "https://talentflow.example.com/resumes/aarav_kulkarni.pdf"
    },
    {
        "first_name": "Daniel", "last_name": "Kim", "email": "daniel.kim@talentflow.dev",
        "phone": "+1 (555) 123-9012", "role": "Backend Developer", "stage": "hired",
        "score": 96, "rating": 5, "days_ago": 21, "resume": "https://talentflow.example.com/resumes/daniel_kim.pdf"
    },
    {
        "first_name": "Steve", "last_name": "Rogers", "email": "steve.rogers@talentflow.dev",
        "phone": "+1 (555) 234-0123", "role": "Software Engineer", "stage": "hired",
        "score": 98, "rating": 5, "days_ago": 18, "resume": "https://talentflow.example.com/resumes/steve_rogers.pdf"
    },
    {
        "first_name": "Tony", "last_name": "Stark", "email": "tony.stark@talentflow.dev",
        "phone": "+1 (555) 345-1235", "role": "Software Engineer", "stage": "hired",
        "score": 100, "rating": 5, "days_ago": 25, "resume": "https://talentflow.example.com/resumes/tony_stark.pdf"
    },
    {
        "first_name": "Wanda", "last_name": "Maximoff", "email": "wanda.m@talentflow.dev",
        "phone": "+1 (555) 456-2346", "role": "Product Analyst", "stage": "hired",
        "score": 94, "rating": 5, "days_ago": 20, "resume": "https://talentflow.example.com/resumes/wanda_m.pdf"
    },
    {
        "first_name": "Peter", "last_name": "Parker", "email": "peter.parker@talentflow.dev",
        "phone": "+1 (555) 567-3457", "role": "Software Engineer", "stage": "hired",
        "score": 93, "rating": 5, "days_ago": 22, "resume": "https://talentflow.example.com/resumes/peter_parker.pdf"
    },
    {
        "first_name": "Carol", "last_name": "Danvers", "email": "carol.danvers@talentflow.dev",
        "phone": "+1 (555) 678-4568", "role": "Product Analyst", "stage": "hired",
        "score": 96, "rating": 5, "days_ago": 24, "resume": "https://talentflow.example.com/resumes/carol_danvers.pdf"
    },

    # --- REJECTED (4 candidates) ---
    {
        "first_name": "Liam", "last_name": "Torres", "email": "liam.torres@talentflow.dev",
        "phone": "+1 (555) 789-5679", "role": "Software Engineer", "stage": "rejected",
        "score": 76, "rating": 2, "days_ago": 8, "resume": "https://talentflow.example.com/resumes/liam_torres.pdf"
    },
    {
        "first_name": "Nisha", "last_name": "Malhotra", "email": "nisha.malhotra@talentflow.dev",
        "phone": "+1 (555) 890-6780", "role": "Product Analyst", "stage": "rejected",
        "score": 79, "rating": 2, "days_ago": 15, "resume": "https://talentflow.example.com/resumes/nisha_malhotra.pdf"
    },
    {
        "first_name": "Rahul", "last_name": "Gupta", "email": "rahul.gupta@talentflow.dev",
        "phone": "+1 (555) 901-7891", "role": "Software Engineer", "stage": "rejected",
        "score": 73, "rating": 2, "days_ago": 22, "resume": "https://talentflow.example.com/resumes/rahul_gupta.pdf"
    },
    {
        "first_name": "Loki", "last_name": "Laufeyson", "email": "loki.l@talentflow.dev",
        "phone": "+1 (555) 012-8902", "role": "Backend Developer", "stage": "rejected",
        "score": 71, "rating": 1, "days_ago": 19, "resume": "https://talentflow.example.com/resumes/loki_l.pdf"
    },
]

print(f"Total to insert: {len(candidates_data)}")

# Create candidates
for cdata in candidates_data:
    job_obj = job_map.get(cdata["role"])
    cand = Candidate.objects.create(
        first_name=cdata["first_name"],
        last_name=cdata["last_name"],
        email=cdata["email"],
        phone=cdata["phone"],
        job=job_obj,
        applied_role=cdata["role"],
        current_stage=cdata["stage"],
        ats_score=cdata["score"],
        rating=cdata["rating"],
        resume_url=cdata["resume"],
        notes_summary=f"Strong background for {cdata['role']}. Applied via direct portal."
    )
    # Set created_at to simulate historical days
    cand.created_at = now - timedelta(days=cdata["days_ago"])
    cand.save(update_fields=['created_at'])

    # Add initial history
    StageHistory.objects.create(
        candidate=cand,
        from_stage=None,
        to_stage=cdata["stage"],
        changed_by="Recruiter Lead",
        notes="Candidate application processed."
    )

print(f"Seeding completed! Total Candidates in DB: {Candidate.objects.count()}")
for st in ['applied', 'screening', 'interview', 'offer', 'hired', 'rejected']:
    print(f"  {st}: {Candidate.objects.filter(current_stage=st).count()}")

for role in ['Software Engineer', 'Product Analyst', 'UI/UX Designer', 'Backend Developer', 'Data Scientist']:
    print(f"  Role '{role}': {Candidate.objects.filter(applied_role=role).count()}")

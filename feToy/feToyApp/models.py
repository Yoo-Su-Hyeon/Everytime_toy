from django.db import models
from django.contrib.auth.models import User


class Review(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE) #외래키 (관계 설정), 작성한 사용자와 연결
    # 강의 정보 필드 (과목명, 교수명, ui 표시용 강의 카드 색상)
    course_title = models.CharField(max_length=100)
    course_professor = models.CharField(max_length=100)
    course_color = models.CharField(max_length=20, default='blue-light')
    # 강의평 내용 필드 (강의 평점, 강의평 본문 내용, 수강 학기)
    rating = models.IntegerField()
    content = models.TextField()
    semester = models.CharField(max_length=30)
    # 메타 정보 및 통계 필드 (좋아요 수, 작성 일시)
    like_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at'] # 최신 글이 먼저 조회되도록 설정

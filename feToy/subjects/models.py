from django.db import models
from django.contrib.auth.models import User  # 장고 기본 제공 유저 모델 사용
from django.conf import settings

class Subject(models.Model):
    # 학교에 개설된 모든 과목 정보를 담는 테이블
    subject_name = models.CharField(max_length=100)  # 과목명 (예: 심리학개론)
    classification = models.CharField(max_length=20)   # 이수구분 (예: 전탐, 전공, 교양, 필교)
    professor = models.CharField(max_length=50)       # 교수명 (예: 임혜진)

    def __str__(self):
        # 어드민 페이지나 터미널에서 데이터를 [이수구분] 과목명 - 교수명 형태로 출력해줍니다.
        return f"[{self.classification}] {self.subject_name} - {self.professor}"


class UserSubject(models.Model):
    # 특정 유저가 어떤 과목을 수강 중인지 연결해주는 테이블 (수강 정보)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='user_subjects')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)

    class Meta:
        # 한 유저가 똑같은 과목을 중복해서 수강 등록하는 것을 방지하는 설정
        unique_together = ('user', 'subject')

    def __str__(self):
        return f"{self.user.username}의 수강과목: {self.subject.subject_name}"
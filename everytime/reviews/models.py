from django.db import models
from django.contrib.auth.models import User
from subjects.models import Subject

class Review(models.Model):
    # 어떤 과목의 후기인지 연결 (과목이 삭제되면 후기도 자동 삭제)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='reviews')
    
    # 어떤 유저가 쓴 후기인지 연결 (탈퇴하면 후기도 자동 삭제)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews')
    
    # 유저가 입력하는 데이터 (수강학기, 별점 점수, 총평 글자)
    semester = models.CharField(max_length=50) 
    rating = models.IntegerField()              
    content = models.TextField()               
    
    # 글이 저장되는 시간을 자동 기록 (정렬용)
    created_at = models.DateTimeField(auto_now_add=True)
    
    # 이 후기에 추천(좋아요) 누른 유저들을 기록하는 위한 변수
    liked_users = models.ManyToManyField(User, related_name='liked_reviews', blank=True)

    # 관리자 페이지 등에서 데이터를 '[과목명] (별점점수) - 후기내용' 형태로 보여주는 함수
    def __str__(self):
        return f"[{self.subject.subject_name}] ({self.rating}점) - {self.content}"


class Comment(models.Model):
    # 어떤 후기에 달린 댓글인지 연결
    review = models.ForeignKey(Review, on_delete=models.CASCADE, related_name='comments')
    # 댓글 작성자
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comments')
    # 댓글 내용
    content = models.TextField()
    # 분 단위 출력을 위한 작성 시간 자동 저장
    created_at = models.DateTimeField(auto_now_add=True)
    # 댓글 추천(좋아요) 기능
    liked_users = models.ManyToManyField(User, related_name='liked_comments', blank=True)
    
    # 대댓글 관련 필드 (부모 댓글이 있으면 대댓글, 없으면 일반 댓글)
    # 자기 자신(Comment)을 부모로 참조하며, 대댓글이 아닐 수도 있으므로 null=True, blank=True 세팅
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies')

    def __str__(self):
        return f"{self.user.username}의 댓글: {self.content[:10]}"
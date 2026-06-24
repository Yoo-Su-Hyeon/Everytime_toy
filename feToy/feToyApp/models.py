from django.db import models
from django.contrib.auth.models import User


class Review(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    course_title = models.CharField(max_length=100)
    course_professor = models.CharField(max_length=100)
    course_color = models.CharField(max_length=20, default='blue-light')
    rating = models.IntegerField()
    content = models.TextField()
    semester = models.CharField(max_length=30)
    like_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

from django.db import models
from django.contrib.auth.models import AbstractUser

# user 모델 생성하기
class User(AbstractUser):
    stdnum = models.CharField(max_length = 8, unique=True, null = False, blank = False)


    def __str__(self):
        return self.stdnum

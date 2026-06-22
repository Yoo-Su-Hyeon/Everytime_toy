from django.contrib import admin
from .models import Review, Comment

# 관리자 페이지에서 학생들이 쓴 수강 후기와 댓글을 관리할 수 있게 등록
admin.site.register(Review)
admin.site.register(Comment)
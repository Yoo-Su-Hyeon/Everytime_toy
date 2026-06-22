from django.contrib import admin
from .models import Subject, UserSubject

# 장고 관리자 화면에 Subject와 UserSubject 테이블 등록
admin.site.register(Subject)
admin.site.register(UserSubject)
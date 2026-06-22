from django.urls import path
from . import views

app_name = 'subjects'

urlpatterns = [
    path('', views.main_page_view, name='main_home'), # 메인 홈 화면
]
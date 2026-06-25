from django.urls import path

from . import views

urlpatterns = [
    path('signup/', views.signup, name='signup'), # 회원가입 화면
    path('login/', views.login_view, name='login'), # 로그인 화면
    path('logout/', views.logout_view, name='logout'), # 로그아웃 화면
    path('main/', views.main, name='main'), # 로그인 후 들어가지는 메인 홈 화면
    path('reviews/write/', views.review_form, name='review_form'), # 강의평 작성, 수정 입력 폼 화면
    path('reviews/list/', views.review_list, name='review_list'), # 특정 강의 후기들 모아보는 목록 화면
    path('reviews/detail/', views.review_detail, name='review_detail'), # 강의 후기 상세보기 화면
    path('api/reviews/', views.api_reviews, name='api_reviews'), # db에서 후기 목록 데이터 json으로 가져오기
    path('api/reviews/write/', views.api_review_write, name='api_review_write'), # 작성, 수정한 후기 데이터 서버 저장
    path('api/reviews/delete/', views.api_review_delete, name='api_review_delete'), # 본인이 작성한 후기 서버에서 삭제
]

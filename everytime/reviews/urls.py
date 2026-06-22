from django.urls import path
from . import views

app_name = 'reviews'

urlpatterns = [
    #  과목별 후기 목록 화면 (예: /reviews/subject/1/ ➔ 1번 과목의 후기들을 보여줌)
    path('subject/<int:subject_id>/', views.review_list_view, name='review_list'),
    
    # 후기 삭제 기능 처리 (화면 없이 삭제만 하고 목록으로 다시 돌려보냄)
    path('delete/<int:review_id>/', views.review_delete_view, name='review_delete'),
    
    # 후기 상세 보기 화면 (클릭한 후기의 전체 내용과 댓글들을 보여줌)
    path('detail/<int:review_id>/', views.review_detail_view, name='review_detail'),
    
    # 댓글 및 대댓글 작성 기능 처리 (댓글 등록 버튼을 누르면 작동)
    path('detail/<int:review_id>/comment/', views.comment_create_view, name='comment_create'),
    
    # 새 후기 작성 화면 (빈 입력창이 있는 페이지를 띄워줌)
    path('write/', views.review_form_view, name='review_create'),
    
    # 기존 후기 수정 화면 (내가 썼던 별점과 내용을 미리 채워서 띄워줌)
    path('edit/<int:review_id>/', views.review_form_view, name='review_edit'),
]
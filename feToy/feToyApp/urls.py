from django.urls import path

from . import views

urlpatterns = [
    path('signup/', views.signup, name='signup'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('main/', views.main, name='main'),
    path('reviews/write/', views.review_form, name='review_form'),
    path('reviews/list/', views.review_list, name='review_list'),
    path('reviews/detail/', views.review_detail, name='review_detail'),
    path('api/reviews/', views.api_reviews, name='api_reviews'),
    path('api/reviews/write/', views.api_review_write, name='api_review_write'),
    path('api/reviews/delete/', views.api_review_delete, name='api_review_delete'),
]

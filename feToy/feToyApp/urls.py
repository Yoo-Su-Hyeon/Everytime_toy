from django.urls import path
from . import views

urlpatterns = [
    path('signup/', views.signup, name='signup'),
    path('main/', views.main, name='main'),
    path('login/', views.login, name='login'),
    path('login-test/', views.login, name='login_test'),
    path("reviews/write/", views.review_form, name="review_form"),
    path("reviews/list/", views.review_list, name="review_list"),
]
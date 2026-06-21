from django.shortcuts import render, redirect
from .forms import *
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth import login as auth_login
from django.contrib.auth import logout as auth_logout


#회원가입 뷰
def signup(request):
    if request.method == 'GET':
        form = SignUpForm()
        return render(request, 'accounts/signup.html', {'form' : form})
    
    form = SignUpForm(request.POST)
    if form.is_valid():
        form.save()
        return redirect('everytime:subjects') #회원가입 성공 시 메인으로 이동
    else:
        return render(request, 'accounts/signup.html', {'form':form})


#로그인 뷰
def login(request):
    if request.method == 'GET' : 
        return render(request, 'accounts/login.html', {'form': AuthenticationForm()})
    
    form = AuthenticationForm(request, request.POST)
    if form.is_valid():
        auth_login(request, form.user_cache)
        return redirect('everytime:subjects')
    return render(request, 'accounts/login.html', {'form':form})


#로그아웃 뷰
def logout(request):
    if request.user.is_authenticated:
        auth_logout(request)
    return redirect('accounts:login')
from django.shortcuts import render

# Create your views here.
def signup(request):
    return render(request, 'accounts/signup.html')

def main(request):
    return render(request, 'main.html')

def login(request):
    return render(request, 'accounts/login.html')

def review_form(request):
    return render(request, "reviews/review_form.html")

def review_list(request):
    return render(request, "reviews/review_list.html")
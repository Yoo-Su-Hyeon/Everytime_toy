from django.shortcuts import render, redirect


def signup(request):
    if request.method == "POST":
        return redirect("main")

    return render(request, "accounts/signup.html")


def login(request):
    return render(request, "accounts/login.html")


def main(request):
    return render(request, "main.html")


def review_form(request):
    return render(request, "reviews/review_form.html")


def review_list(request):
    return render(request, "reviews/review_list.html")


def review_detail(request):
    return render(request, "reviews/review_detail.html")
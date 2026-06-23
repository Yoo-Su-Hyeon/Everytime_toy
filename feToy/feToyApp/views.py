import json

from django.contrib.auth import authenticate
from django.contrib.auth import login as auth_login
from django.contrib.auth import logout as auth_logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.shortcuts import redirect, render
from django.views.decorators.http import require_POST

from .models import Review


def signup(request):
    if request.method == "POST":
        stdnum = request.POST.get("stdnum", "").strip()
        password = request.POST.get("password", "").strip()

        if User.objects.filter(username=stdnum).exists():
            return render(request, "accounts/signup.html", {
                "error": "이미 존재하는 학번입니다."
            })

        user = User.objects.create_user(username=stdnum, password=password)
        auth_login(request, user)
        return redirect("/main/?signup=1")

    return render(request, "accounts/signup.html")


def login_view(request):
    if request.method == "POST":
        stdnum = request.POST.get("stdnum", "").strip()
        password = request.POST.get("password", "").strip()

        user = authenticate(request, username=stdnum, password=password)

        if user is not None:
            auth_login(request, user)
            return redirect("main")

        return render(request, "accounts/login.html", {
            "error": "학번 또는 비밀번호가 올바르지 않습니다."
        })

    return render(request, "accounts/login.html")


def logout_view(request):
    auth_logout(request)
    return redirect("login")


@login_required(login_url="/login/")
def main(request):
    return render(request, "main.html")


@login_required(login_url="/login/")
def review_form(request):
    return render(request, "reviews/review_form.html")


@login_required(login_url="/login/")
def review_list(request):
    return render(request, "reviews/review_list.html")


@login_required(login_url="/login/")
def review_detail(request):
    return render(request, "reviews/review_detail.html")


@login_required(login_url="/login/")
def api_reviews(request):
    title = request.GET.get("title", "")
    professor = request.GET.get("professor", "")

    reviews = Review.objects.filter(
        course_title=title,
        course_professor=professor,
    ).select_related("user")

    data = [{
        "id": r.id,
        "date": r.created_at.strftime("%m/%d %H:%M"),
        "semester": r.semester,
        "rating": r.rating,
        "like": r.like_count,
        "comment": 0,
        "content": r.content,
        "mine": r.user_id == request.user.id,
    } for r in reviews]

    return JsonResponse({"reviews": data})


@login_required(login_url="/login/")
@require_POST
def api_review_write(request):
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"error": "잘못된 요청입니다."}, status=400)

    edit_id = data.get("editId")

    if edit_id:
        try:
            review = Review.objects.get(id=edit_id, user=request.user)
        except Review.DoesNotExist:
            return JsonResponse({"error": "후기를 찾을 수 없습니다."}, status=404)

        review.rating = data["rating"]
        review.content = data["content"]
        review.semester = data["semester"]
        review.save()
    else:
        review = Review.objects.create(
            user=request.user,
            course_title=data["title"],
            course_professor=data["professor"],
            course_color=data.get("color", "blue-light"),
            rating=data["rating"],
            content=data["content"],
            semester=data["semester"],
        )

    return JsonResponse({"id": review.id})


@login_required(login_url="/login/")
@require_POST
def api_review_delete(request):
    try:
        data = json.loads(request.body)
        review_id = data["id"]
    except (json.JSONDecodeError, KeyError):
        return JsonResponse({"error": "잘못된 요청입니다."}, status=400)

    try:
        review = Review.objects.get(id=review_id, user=request.user)
        review.delete()
        return JsonResponse({"success": True})
    except Review.DoesNotExist:
        return JsonResponse({"error": "후기를 찾을 수 없습니다."}, status=404)

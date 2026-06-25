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

# 1. 사용자 인증 (회원가입, 로그인, 로그아웃)
def signup(request):
    if request.method == "POST":
        stdnum = request.POST.get("stdnum", "").strip()
        password = request.POST.get("password", "").strip()

        if User.objects.filter(username=stdnum).exists(): # 중복 학번 검사
            return render(request, "accounts/signup.html", {
                "error": "이미 존재하는 학번입니다."
            })

        # 새로운 사용자 생성 및 자동 로그인 후 메인 페이지 이동
        user = User.objects.create_user(username=stdnum, password=password)
        auth_login(request, user)
        return redirect("/main/?signup=1")

    return render(request, "accounts/signup.html") # GET 요청 시 회원가입 페이지 렌더링


def login_view(request):
    if request.method == "POST":
        stdnum = request.POST.get("stdnum", "").strip()
        password = request.POST.get("password", "").strip()

        user = authenticate(request, username=stdnum, password=password)

        if user is not None:
            auth_login(request, user) # 로그인 처리
            return redirect("main")

        return render(request, "accounts/login.html", { # 인증 실패 시 에러 메시지와 함께 로그인 페이지 유지
            "error": "학번 또는 비밀번호가 올바르지 않습니다."
        })

    return render(request, "accounts/login.html") # GET 요청 시 로그인 페이지 렌더링


def logout_view(request):
    auth_logout(request)
    return redirect("login")

# 2. 화면 렌더링 뷰
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

# 3. 비동기 API 뷰
@login_required(login_url="/login/")
def api_reviews(request):
    title = request.GET.get("title", "")
    professor = request.GET.get("professor", "")

    # 조건에 맞는 후기 필터링
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
        try: # 본인이 작성한 글인지 검증, 맞으면 수정 모드
            review = Review.objects.get(id=edit_id, user=request.user)
        except Review.DoesNotExist:
            return JsonResponse({"error": "후기를 찾을 수 없습니다."}, status=404)

        # 수정 후 저장
        review.rating = data["rating"]
        review.content = data["content"]
        review.semester = data["semester"]
        review.save()
    else: # 아이디 없으면 새 글 작성 모드
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

    try: # 로그인한 사용자가 작성한 해당 ID의 후기를 조회하여 삭제
        review = Review.objects.get(id=review_id, user=request.user)
        review.delete()
        return JsonResponse({"success": True})
    except Review.DoesNotExist: # 존재하지 않거나 타인의 글인 경우 예외 처리
        return JsonResponse({"error": "후기를 찾을 수 없습니다."}, status=404)

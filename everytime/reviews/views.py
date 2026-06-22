from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages  
from django.db.models import Count, Avg
from subjects.models import Subject
from .models import Review, Comment  

# 1. 과목별 수강 후기 목록 조회 (정렬 및 필터링 기능 포함)
@login_required
def review_list_view(request, subject_id):
    # 대상 과목 정보와 해당 과목의 모든 후기 가져오기
    subject = get_object_or_404(Subject, id=subject_id)
    reviews = Review.objects.filter(subject=subject)
    
    # 과목 평균 별점 계산 (후기가 없으면 0.00으로 표시)
    avg_rating_dict = reviews.aggregate(Avg('rating'))
    avg_rating = avg_rating_dict['rating__avg'] if avg_rating_dict['rating__avg'] else 0.0
    avg_rating_formatted = f"{avg_rating:.2f}"
    
    # 1점부터 5점까지 각각 후기가 몇 개 쌓였는지 세기 (드롭다운에 표시할 개수)
    rating_counts = {i: reviews.filter(rating=i).count() for i in range(5, 0, -1)}
    total_review_count = reviews.count() # 전체 개수

    # [필터링] 프엔이 ?rating=5 형태로 주소를 보내면 해당 별점만 가려내기
    selected_rating = request.GET.get('rating', '')
    if selected_rating and selected_rating.isdigit():
        reviews = reviews.filter(rating=int(selected_rating))

    # 정렬 - 기본값: 최신순
    sort_by = request.GET.get('sort', 'latest')
    
    if sort_by == 'oldest':
        reviews = reviews.order_by('created_at')
    elif sort_by == 'likes':
        reviews = reviews.annotate(like_count=Count('liked_users')).order_by('-like_count', '-created_at')
    else:
        reviews = reviews.order_by('-created_at')

    context = {
        'subject': subject,
        'reviews': reviews,
        'avg_rating': avg_rating_formatted,
        'rating_counts': rating_counts,
        'total_review_count': total_review_count,
        'current_rating': selected_rating,
        'current_sort': sort_by,
        'has_reviews': reviews.exists(), # 후기가 하나라도 존재하는지 여부
    }
    return render(request, 'reviews/review_list.html', context)


# 2. 수강후기 삭제 기능
@login_required
def review_delete_view(request, review_id):
    review = get_object_or_404(Review, id=review_id)
    subject_id = review.subject.id
    
    # 현재 로그인한 유저와 글쓴이가 같을 때만 삭제 허용
    if review.user == request.user:
        review.delete()
        messages.success(request, "수강 후기가 성공적으로 삭제되었습니다.")
        return redirect('reviews:review_list', subject_id=subject_id)
    else:
        # 내 글이 아니면 삭제하지 않고 원래 리스트로 돌려보내며 경고창 띄우기
        messages.error(request, "본인이 작성한 후기만 삭제할 수 있습니다.")
        return redirect('reviews:review_list', subject_id=subject_id)


# 3. 수강후기 상세 보기 (댓글 및 대댓글 목록 조회 포함)
@login_required
def review_detail_view(request, review_id):
    review = get_object_or_404(Review, id=review_id)
    
    # 대댓글이 아닌 일반 댓글만 먼저 가져옴
    comments = review.comments.filter(parent=None).order_by('created_at')
    
    context = {
        'review': review,
        'subject': review.subject,
        'comments': comments,
    }
    return render(request, 'reviews/review_detail.html', context)


# 4. 댓글 및 대댓글 등록 처리 기능
@login_required
def comment_create_view(request, review_id):
    if request.method == 'POST':
        review = get_object_or_404(Review, id=review_id)
        content = request.POST.get('content', '').strip()
        parent_id = request.POST.get('parent_id', None) # 대댓글 작성 시 부모 댓글 ID
        
        if content:
            comment = Comment(
                review=review,
                user=request.user,
                content=content
            )

# 5. 수강후기 작성 및 수정 폼 기능 
@login_required
def review_form_view(request, review_id=None):
    # review_id가 주소창에 들어오면 수정 모드, 없으면 새 글 작성
    review = None
    if review_id:
        # 수정할 기존 후기 데이터를 DB에서 가져옴
        review = get_object_or_404(Review, id=review_id)
        # 로그인한 유저랑 글쓴이 유저가 다르면 수정불가 메세지 띄우기
        if review.user != request.user:
            messages.error(request, "본인이 작성한 후기만 수정할 수 있습니다.")
            return redirect('reviews:review_list', subject_id=review.subject.id)

    #post요청시
    if request.method == 'POST':
        # 프론트엔드가 보낸 입력값들(별점, 내용, 과목ID, 학기)을 꺼내기
        rating = request.POST.get('rating')
        content = request.POST.get('content')
        subject_id = request.POST.get('subject_id')
        semester = request.POST.get('semester')

        # 위 항목들 잘 들어왔는지 확인과정
        if rating and content and subject_id and semester:
            # 유저가 선택한 과목 정보를 DB에서 찾습니다.
            subject = get_object_or_404(Subject, id=subject_id)
            
            # 수정 모드일 때: 기존 후기 방의 내용들을 새 입력값으로 덮어쓰고 저장함
            if review:
                review.subject = subject
                review.rating = int(rating)
                review.content = content
                review.semester = semester
                review.save()
                messages.success(request, "수강 후기가 수정되었습니다.")
            # 새 글 작성 모드일 때: DB에 완전히 새로운 후기 데이터를 생성
            else:
                review = Review.objects.create(
                    subject=subject,
                    user=request.user,  # 현재 로그인한 유저를 글쓴이로 등록
                    rating=int(rating),
                    content=content,
                    semester=semester
                )
                messages.success(request, "수강 후기가 등록되었습니다.")
                
            # 작성이나 수정이 끝나면 해당 과목의 후기 목록 페이지로 이동
            return redirect('reviews:review_list', subject_id=subject.id)
        # 빈칸이 있다면 에러 메시지를 띄움
        else:
            messages.error(request, "모든 항목을 올바르게 입력해주세요.")

    # 유저가 작성/수정 페이지에 처음 들어왔을 때 (GET 요청)
    # 검색창 기능을 위해 데이터베이스에 있는 과목 목록 가져옴
    all_subjects = Subject.objects.all()
    
  
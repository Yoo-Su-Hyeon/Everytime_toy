from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from .models import Subject, UserSubject

@login_required  # 로그인한 사용자만 이 페이지를 볼 수 있게 제한
def main_page_view(request):
    # 1. 프론트엔드 검색창 input의 name 속성이 'search'라고 가정하고 검색어를 가져옴
    keyword = request.GET.get('search', '').strip()
    
    # HTML로 전달할 데이터 바구니(context) 초기화
    context = {
        'keyword': keyword,
    }
    
    if keyword:
        # 검색어가 있는 경우: '전체 과목' 테이블에서 검색어가 포함된 과목 필터링
        # 대소문자 구분 없이 글자가 포함되었는지 찾음
        search_results = Subject.objects.filter(subject_name__icontains=keyword)
        context['subjects'] = search_results
        context['is_search'] = True  # 현재 검색 상태임을 HTML에 알려줌
    else:
        # 검색어가 없는 경우: '내가 수강 중인 과목'만 가져옴
        # 현재 로그인한 유저(request.user)의 수강 목록 조회
        my_user_subjects = UserSubject.objects.filter(user=request.user)
        
        # UserSubject 테이블에서 과목(Subject) 객체들만 가져가 리스트로 만듦
        my_subjects = [us.subject for us in my_user_subjects]
        context['subjects'] = my_subjects
        context['is_search'] = False # 현재 메인 홈 상태임을 HTML에 알려줌

    # 데이터 렌더링
    return render(request, 'subjects/main_home.html', context)
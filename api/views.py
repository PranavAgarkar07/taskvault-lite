from django.shortcuts import redirect
from rest_framework.response import Response
from rest_framework.decorators import api_view,permission_classes
from .models import Task
from .serializers import TaskSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated

# Create your views here.


from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def task_list_create(request):
    if request.method == 'GET':
        tasks = Task.objects.filter(user=request.user).order_by('-created_at')
        serializer = TaskSerializer(tasks, many=True, context={'request': request})
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = TaskSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save(user=request.user)  # user will be auto-attached in serializer
            return Response(serializer.data, status=201)
        print(serializer.errors)
        return Response(serializer.errors, status=400)

   
@api_view(['DELETE'])
# @permission_classes([IsAuthenticated])
def task_delete(request,pk):
    task=Task.objects.get(id=pk)
    task.delete()
    return Response({"message":"Task deleted"})

@api_view(['PATCH'])
# @permission_classes([IsAuthenticated])
def task_update(request,pk):
    try:
        task=Task.objects.get(id=pk)
    except Task.DoesNotExist:
        return Response({"error":"Task not found"}, status=404)
    
    serializer=TaskSerializer(task, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=400)


# 🧩 OAUTH REDIRECT HANDLER (Google / GitHub)
def oauth_redirect_view(request):
    """
    After successful OAuth login (via Google or GitHub),
    redirect user to React app with JWT tokens.
    """
    user = request.user
    if not user.is_authenticated:
        return redirect("https://taskvault-lite.vercel.app/?error=unauthenticated")

    # Generate JWT tokens for the logged-in user
    refresh = RefreshToken.for_user(user)
    access_token = str(refresh.access_token)
    refresh_token = str(refresh)

    # Redirect user back to React app with tokens in query params
    frontend_url = (
        f"https://taskvault-lite.vercel.app/oauth/callback"
        f"?access={access_token}&refresh={refresh_token}"
    )
    print("🔗 Redirecting to:", frontend_url)  # 👈 Add this log
    return redirect(frontend_url)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    user = request.user         
    full_name = f"{user.first_name} {user.last_name}".strip() or user.username
    return Response({
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "full_name": full_name,

    })
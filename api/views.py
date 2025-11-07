from django.shortcuts import render
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
@permission_classes([IsAuthenticated])
def task_delete(request,pk):
    task=Task.objects.get(id=pk)
    task.delete()
    return Response({"message":"Task deleted"})

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
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
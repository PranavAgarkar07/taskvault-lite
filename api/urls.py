from django.urls import path
from . import views, auth_views

urlpatterns=[
    path('register/', auth_views.register_user, name='register'),
    path('login/', auth_views.login_user, name='login'),

    path('tasks/', views.task_list_create,name='task-list-create'),
    path('tasks/<int:pk>/',views.task_delete, name='task-delete'),
    path('tasks/<int:pk>/update/',views.task_update, name='task-update'),
]
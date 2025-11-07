from rest_framework import serializers
from .models import Task

class TaskSerializer(serializers.ModelSerializer):
    due_date = serializers.DateField(required=False, allow_null=True)

    class Meta:
        model = Task
        fields = ('id', 'title', 'completed', 'due_date', 'created_at')

    def to_representation(self, instance):
        """Return decrypted title when serializing output."""
        data = super().to_representation(instance)
        data['title'] = instance.decrypted_title
        return data

    def validate_title(self, value):
        if not value.strip():
            raise serializers.ValidationError("Task title cannot be empty.")
        return value

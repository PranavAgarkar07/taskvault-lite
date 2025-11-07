from django.db import models
from django.contrib.auth.models import User
from django.conf import settings
from cryptography.fernet import InvalidToken

class Task(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tasks')
    title = models.TextField()
    completed = models.BooleanField(default=False)
    due_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if self.title:
            try:
                settings.FERNET.decrypt(self.title.encode())
            except InvalidToken:
                self.title = settings.FERNET.encrypt(self.title.encode()).decode()
        super().save(*args, **kwargs)

    @property
    def decrypted_title(self):
        try:
            return settings.FERNET.decrypt(self.title.encode()).decode()
        except Exception:
            return "[error-decrypting]"


    def __str__(self):
        return self.decrypted_title
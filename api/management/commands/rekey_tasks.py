# create directories: api/management/commands/__init__.py (empty files)
# file: api/management/commands/rekey_tasks.py
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from api.models import Task
from api.utils import create_and_store_user_key, get_user_fernet
from django.conf import settings

class Command(BaseCommand):
    help = 'Create per-user keys and re-encrypt existing tasks (decrypt with MASTER_FERNET then encrypt with user key).'

    def handle(self, *args, **options):
        users = User.objects.all()
        for user in users:
            self.stdout.write(f"Processing user: {user.username}")
            # create user key if missing
            create_and_store_user_key(user)
            f_user = get_user_fernet(user)

            tasks = Task.objects.filter(user=user)
            for t in tasks:
                # Attempt to decrypt existing ciphertext using MASTER_FERNET
                # If it was stored under global FERNET (old approach), decrypt with MASTER_FERNET
                # If it was already per-user, skip re-encrypt. We'll attempt both safely.
                reencrypted = False
                try:
                    # Try decrypting with MASTER_FERNET (wrapped global)
                    # If previous implementation used settings.FERNET, adjust accordingly.
                    # Here we assume older ciphertext could be decryptable via settings.MASTER_FERNET
                    from django.conf import settings
                    # Try to decrypt with MASTER_FERNET
                    plaintext = settings.MASTER_FERNET.decrypt(bytes(t.title_encrypted))
                    # If successful, re-encrypt with user fernet
                    t.set_title_with_fernet(plaintext.decode(), f_user)
                    t.save()
                    reencrypted = True
                except Exception:
                    # Not decryptable with MASTER_FERNET — maybe it was old-global-FERNET or already per-user.
                    # Try decrypting with user fernet (already per-user) — if successful, skip.
                    try:
                        # if it decrypts with user's fernet, leave it as is
                        _ = f_user.decrypt(bytes(t.title_encrypted))
                        # already per-user encrypted
                        reencrypted = False
                    except Exception:
                        # can't decrypt with either — report
                        self.stdout.write(self.style.ERROR(f"Could not re-encrypt task id={t.id} for user {user.username}"))
                if reencrypted:
                    self.stdout.write(self.style.SUCCESS(f"Re-encrypted task id={t.id} for user {user.username}"))
        self.stdout.write(self.style.SUCCESS("Done rekeying tasks."))

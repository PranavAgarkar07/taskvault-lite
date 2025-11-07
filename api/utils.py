# api/utils.py
from cryptography.fernet import Fernet, InvalidToken
from django.conf import settings
from .models import UserKey
import binascii

# --- DEFINE THIS FUNCTION FIRST ---
def create_and_store_user_key(user):
    """
    Generate a per-user Fernet key, wrap it with FERNET_KEY, and store
    as UserKey.wrapped_key (bytes). Returns wrapped bytes.
    """
    user_key = Fernet.generate_key()  # bytes
    wrapped = settings.FERNET_KEY.encrypt(user_key)  # bytes
    uk, created = UserKey.objects.get_or_create(user=user)
    uk.wrapped_key = wrapped
    uk.save()
    return wrapped

# --- DEFINE THIS FUNCTION SECOND ---
def get_user_fernet(user):
    try:
        uk = UserKey.objects.get(user=user)
    except UserKey.DoesNotExist:
        # This will now work perfectly
        print(f"Creating new key for user {user.username}")
        create_and_store_user_key(user)
        uk = UserKey.objects.get(user=user) # Get the newly created key

    wrapped = uk.wrapped_key

    if isinstance(wrapped, str):
        wrapped = wrapped.encode()

    try:
        user_key = settings.FERNET_KEY.decrypt(wrapped)
        return Fernet(user_key)
    except (InvalidToken, binascii.Error) as e:
        print(f"CRITICAL: Could not decrypt key for user {user.username}.")
        raise Exception(f"Key decryption failed for user {user.username}") from e